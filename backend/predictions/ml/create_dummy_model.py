import os
import tensorflow as tf
from tensorflow.keras import layers, models

def generate_and_save_dummy_model(output_path):
    """
    Generates a lightweight CNN model with input shape (224, 224, 3)
    and output shape (14,) representing the crop classes.
    Saves it to output_path.
    """
    # 1. Define model architecture
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3), name='input_layer'),
        layers.Conv2D(16, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.GlobalAveragePooling2D(),
        layers.Dense(64, activation='relu'),
        layers.Dense(14, activation='softmax', name='output_layer')
    ])
    
    # 2. Compile model
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # 3. Create parent directories if they don't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 4. Save model to the specified path in Keras format
    model.save(output_path)
    print(f"Dummy Keras model saved successfully to: {output_path}")

if __name__ == '__main__':
    # Script can also be run standalone
    import argparse
    parser = argparse.ArgumentParser(description="Generate a dummy .keras model for testing.")
    parser.add_argument("--output", type=str, default="mobilenetv2_crop_disease.keras", help="Output filename or path")
    args = parser.parse_args()
    
    generate_and_save_dummy_model(args.output)
