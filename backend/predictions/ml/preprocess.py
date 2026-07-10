import numpy as np
from PIL import Image

def preprocess_image(pil_image, target_size=(224, 224), normalization_mode='rescale_255'):
    """
    Preprocess PIL image for model inference.
    Exactly mirrors typical training preprocessing steps:
    1. Convert image to RGB (drops alpha/grayscale if any)
    2. Resize using high-quality anti-aliasing (LANCZOS/BILINEAR)
    3. Convert to NumPy array
    4. Normalize pixel values
    5. Add batch dimension (1, H, W, C)
    """
    # 1. Convert to RGB
    if pil_image.mode != 'RGB':
        pil_image = pil_image.convert('RGB')
        
    # 2. Resize
    # PIL.Image.Resampling.LANCZOS or Image.BILINEAR
    pil_image = pil_image.resize(target_size, Image.Resampling.LANCZOS)
    
    # 3. NumPy Array
    img_array = np.array(pil_image, dtype=np.float32)
    
    # 4. Normalize
    if normalization_mode == 'rescale_255':
        # Normalize to [0, 1]
        img_array /= 255.0
    elif normalization_mode == 'mobilenet_v2':
        # Normalize to [-1, 1] (standard MobileNetV2 preprocessing)
        img_array = (img_array / 127.5) - 1.0
        
    # 5. Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array
