import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Module-level singleton variables
_model = None

def get_model():
    """
    Get the loaded Keras model.
    Loads it exactly once (Singleton pattern).
    If the model file does not exist, automatically triggers dummy model creation
    to avoid startup failures and allow immediate local testing.
    """
    global _model
    
    if _model is not None:
        return _model
        
    model_path = str(settings.MODEL_PATH)
    
    if not os.path.exists(model_path):
        logger.warning(f"Keras model not found at {model_path}. Generating a dummy Keras model for local development...")
        from .create_dummy_model import generate_and_save_dummy_model
        try:
            generate_and_save_dummy_model(model_path)
            logger.info(f"Dummy model successfully created at {model_path}")
        except Exception as e:
            logger.critical(f"Failed to generate dummy model: {e}")
            raise e
            
    # Load model
    try:
        # Import tensorflow only when needed to save memory / startup latency on simple commands
        import tensorflow as tf
        logger.info(f"Loading Keras model from {model_path}...")
        _model = tf.keras.models.load_model(model_path)
        logger.info("Keras model loaded successfully into memory.")
        return _model
    except Exception as e:
        logger.critical(f"Failed to load Keras model from {model_path}: {e}")
        raise e
