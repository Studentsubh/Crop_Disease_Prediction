import tensorflow as tf
import zipfile
import os
import json

path = os.path.join('predictions', 'ml', 'models', 'plant_classifier.keras')
print('path exists:', os.path.exists(path))
print('tensorflow version:', tf.__version__)

with zipfile.ZipFile(path) as z:
    names = [n for n in z.namelist() if n.endswith('.json') or 'keras' in n.lower() or 'metadata' in n.lower()]
    print('archive names:')
    for n in names:
        print(' ', n)
        if n.endswith('.json'):
            data = z.read(n).decode('utf-8')
            print(data[:800])

model = tf.keras.models.load_model(path)
print('model output shape:', model.output_shape)
print('last layer:', model.layers[-1].name)
print('last layer config:', model.layers[-1].get_config())
probs = model.predict(tf.zeros((1, 224, 224, 3)), verbose=0)[0]
print('sample probs:', probs)
print('argmax sample:', int(tf.argmax(probs).numpy()))
