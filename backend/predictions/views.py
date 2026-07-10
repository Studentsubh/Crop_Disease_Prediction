import logging
import os
import numpy as np
import uuid
from PIL import Image
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .serializers import ImageUploadSerializer
from .ml.preprocess import preprocess_image
from .ml.labels import parse_prediction

PLANT_CLASSIFIER_MODEL_NAME = 'plant_classifier.keras'
DISEASE_MODEL_NAME = 'mobilenetv2_crop_disease.keras'


def _get_model_path(model_name):
    return str(settings.BASE_DIR / 'predictions' / 'ml' / 'models' / model_name)


def _load_model_by_name(model_name):
    model_path = _get_model_path(model_name)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    import tensorflow as tf
    return tf.keras.models.load_model(model_path)


def _run_stage_one_classification(processed_img):
    plant_model = _load_model_by_name(PLANT_CLASSIFIER_MODEL_NAME)
    predictions = plant_model(processed_img, training=False)
    probs = predictions.numpy()[0]
    plant_idx = int(np.argmax(probs))
    plant_confidence = float(probs[plant_idx])
    return plant_idx, plant_confidence, probs


def _build_low_confidence_result():
    return {
        'class_raw': 'unknown_crop',
        'class_display': 'Crop not detected — please try a clearer image or different angle.',
        'crop': 'unknown',
        'confidence': 0.89,
        'is_healthy': False,
        'warning': 'Crop not detected. Please use a clearer image or a different angle.'
    }


def _run_disease_inference(processed_img):
    disease_model = _load_model_by_name(DISEASE_MODEL_NAME)
    predictions = disease_model(processed_img, training=False)
    predictions_numpy = predictions.numpy()[0]
    predicted_class_idx = int(np.argmax(predictions_numpy))
    confidence = float(predictions_numpy[predicted_class_idx])
    return parse_prediction(predicted_class_idx, confidence)


def _classify_crop_with_stage_one(processed_img):
    plant_idx, plant_confidence, _ = _run_stage_one_classification(processed_img)

    # The new plant classifier is expected to output 3 classes in order:
    # 0 -> tomato, 1 -> corn, 2 -> other/unsupported plants.
    if plant_idx == 2 or plant_confidence < 0.9:
        return None, _build_low_confidence_result()

    crop = 'tomato' if plant_idx == 0 else 'corn'
    return crop, None

# Supabase Client Imports
try:
    from supabase import create_client
except ImportError:
    create_client = None

logger = logging.getLogger(__name__)

# Supabase Client Helper
_supabase_client = None


def _has_valid_supabase_config():
    url = str(getattr(settings, 'SUPABASE_URL', '')).strip()
    key = str(getattr(settings, 'SUPABASE_KEY', '')).strip()
    if not url or not key or create_client is None:
        return False

    placeholder_markers = ('your-', 'changeme', 'replace-me', 'example')
    if any(marker in url.lower() for marker in placeholder_markers):
        return False
    if any(marker in key.lower() for marker in placeholder_markers):
        return False
    return True


def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not _has_valid_supabase_config():
        return None

    url = getattr(settings, 'SUPABASE_URL', '')
    key = getattr(settings, 'SUPABASE_KEY', '')
    service_role_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', '')

    try:
        _supabase_client = create_client(url, key)
        if service_role_key:
            _supabase_client = create_client(url, service_role_key)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

def log_prediction_to_supabase(result, uploaded_file=None):
    """
    Uploads the uploaded file to 'leaf-specimens' Supabase Storage bucket,
    generates a public URL, and writes the prediction entry to the DB.
    Resilient: falls back gracefully if storage is misconfigured.
    """
    client = get_supabase_client()
    if not client:
        return
        
    try:
        image_url = None
        filename = "unknown.jpg"
        
        if uploaded_file:
            filename = uploaded_file.name
            try:
                # 1. Reset file pointer in case it was read
                uploaded_file.seek(0)
                file_bytes = uploaded_file.read()
                
                # 2. Create a unique filename
                ext = filename.split('.')[-1] if '.' in filename else 'jpg'
                unique_name = f"{uuid.uuid4()}.{ext}"
                
                # 3. Upload to storage bucket
                content_type = getattr(uploaded_file, 'content_type', 'image/jpeg')
                client.storage.from_("leaf-specimens").upload(
                    unique_name,
                    file_bytes,
                    file_options={"content-type": content_type}
                )
                
                # 4. Get public URL
                image_url = client.storage.from_("leaf-specimens").get_public_url(unique_name)
            except Exception as storage_err:
                logger.error(f"Supabase Storage upload failed: {storage_err}")
                
        # 5. Insert DB row
        data = {
            "predicted_class": result["class_display"],
            "crop": result["crop"],
            "confidence": result["confidence"],
            "is_healthy": result["is_healthy"],
            "image_filename": filename,
            "image_url": image_url
        }
        client.table("predictions").insert(data).execute()
        logger.info(f"Logged prediction to Supabase: {result['class_display']}")
    except Exception as db_err:
        logger.error(f"Supabase DB insert failed: {db_err}")


class PredictView(APIView):
    """
    POST /api/predict/
    Accepts one image (multipart/form-data) under key 'image'.
    Returns prediction display name, raw class name, confidence, crop family, and health status.
    """
    def post(self, request, format=None):
        # 1. Parse and validate using Serializer
        serializer = ImageUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors.get("image", ["Invalid image file."])[0]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        uploaded_file = serializer.validated_data["image"]
        
        try:
            # 2. Open image with Pillow
            img = Image.open(uploaded_file)
            
            # 3. Preprocess image
            processed_img = preprocess_image(img)
            
            # 4. Run the first-stage plant classifier.
            crop, unsupported_result = _classify_crop_with_stage_one(processed_img)
            if unsupported_result is not None:
                log_prediction_to_supabase(unsupported_result, uploaded_file)
                return Response(unsupported_result, status=status.HTTP_200_OK)
            
            # 5. Run the disease model for supported crops.
            result = _run_disease_inference(processed_img)
            result['crop'] = crop
            
            # 6. Log to Supabase (uploads image file and logs row)
            log_prediction_to_supabase(result, uploaded_file)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error processing single prediction request: {e}", exc_info=True)
            return Response(
                {"error": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PredictBatchView(APIView):
    """
    POST /api/predict-batch/
    Accepts multiple images (multipart/form-data) under key 'images'.
    Returns a list of prediction objects in the same order as uploaded.
    """
    def post(self, request, format=None):
        uploaded_files = request.FILES.getlist('images') or request.FILES.getlist('image')
        
        if not uploaded_files:
            return Response(
                {"error": "No image files found in request. Please upload files under the 'images' key."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        results = []
        
        for index, uploaded_file in enumerate(uploaded_files):
            serializer = ImageUploadSerializer(data={"image": uploaded_file})
            if not serializer.is_valid():
                results.append({
                    "image_name": uploaded_file.name,
                    "error": serializer.errors.get("image", ["Invalid image file."])[0],
                    "success": False
                })
                continue
                
            try:
                img = Image.open(uploaded_file)
                processed_img = preprocess_image(img)
                
                crop, unsupported_result = _classify_crop_with_stage_one(processed_img)
                if unsupported_result is not None:
                    unsupported_result["image_name"] = uploaded_file.name
                    unsupported_result["success"] = False
                    log_prediction_to_supabase(unsupported_result, uploaded_file)
                    results.append(unsupported_result)
                    continue

                pred_details = _run_disease_inference(processed_img)
                pred_details["crop"] = crop
                pred_details["image_name"] = uploaded_file.name
                pred_details["success"] = True
                
                # Log batch item to Supabase (uploads image and logs row)
                log_prediction_to_supabase(pred_details, uploaded_file)
                
                results.append(pred_details)
                
            except Exception as e:
                logger.error(f"Error processing batch item {index} ({uploaded_file.name}): {e}")
                results.append({
                    "image_name": uploaded_file.name,
                    "error": f"Inference error: {str(e)}",
                    "success": False
                })
                
        return Response(results, status=status.HTTP_200_OK)


class PredictionHistoryView(APIView):
    """
    GET /api/predictions/
    Fetches the last 15 prediction records from Supabase.
    If Supabase is not configured, returns an empty registry instead of dummy data.
    """
    def get(self, request, format=None):
        client = get_supabase_client()
        if not client:
            return Response({
                "results": [],
                "supabase_connected": False,
                "message": "Supabase is not configured. Upload a specimen to create the first live record once credentials are set."
            }, status=status.HTTP_200_OK)

        try:
            response = client.table("predictions").select("*").order("created_at", desc=True).limit(15).execute()
            return Response({
                "results": response.data,
                "supabase_connected": True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to fetch predictions from Supabase: {e}")
            return Response(
                {"error": f"Failed to retrieve history: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

