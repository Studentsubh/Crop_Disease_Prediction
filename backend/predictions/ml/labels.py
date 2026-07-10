# Model class names in the exact training-index order
LABELS = [
    'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot',
    'Corn_(maize)___Common_rust',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites_Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Custom mappings to keep UI readouts beautiful, clean, and professional.
LABEL_DISPLAY_NAMES = {
    'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot': 'Corn — Cercospora Leaf Spot (Gray Leaf Spot)',
    'Corn_(maize)___Common_rust': 'Corn — Common Rust',
    'Corn_(maize)___Northern_Leaf_Blight': 'Corn — Northern Leaf Blight',
    'Corn_(maize)___healthy': 'Corn — Healthy',
    'Tomato___Bacterial_spot': 'Tomato — Bacterial Spot',
    'Tomato___Early_blight': 'Tomato — Early Blight',
    'Tomato___Late_blight': 'Tomato — Late Blight',
    'Tomato___Leaf_Mold': 'Tomato — Leaf Mold',
    'Tomato___Septoria_leaf_spot': 'Tomato — Septoria Leaf Spot',
    'Tomato___Spider_mites_Two-spotted_spider_mite': 'Tomato — Spider Mites (Two-spotted Spider Mite)',
    'Tomato___Target_Spot': 'Tomato — Target Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 'Tomato — Tomato Yellow Leaf Curl Virus',
    'Tomato___Tomato_mosaic_virus': 'Tomato — Tomato Mosaic Virus',
    'Tomato___healthy': 'Tomato — Healthy'
}

def parse_prediction(label_idx, confidence):
    """
    Given a predicted index and a confidence float, formats the response object.
    """
    if label_idx < 0 or label_idx >= len(LABELS):
        raise ValueError(f"Label index {label_idx} is out of bounds [0, {len(LABELS)-1}].")
        
    raw_label = LABELS[label_idx]
    display_name = LABEL_DISPLAY_NAMES.get(raw_label, raw_label.replace('___', ' — ').replace('_', ' '))
    
    # Determine Crop Type
    crop = 'tomato' if 'Tomato' in raw_label else 'corn'
    
    # Determine health status
    is_healthy = 'healthy' in raw_label.lower()
    
    return {
        'class_raw': raw_label,
        'class_display': display_name,
        'crop': crop,
        'confidence': float(confidence),
        'is_healthy': is_healthy
    }
