import tensorflow as tf
import zipfile
import json
import os

path = os.path.join('predictions', 'ml', 'models', 'plant_classifier.keras')
print('exists', os.path.exists(path), path)
with zipfile.ZipFile(path) as z:
    names = [n for n in z.namelist() if 'json' in n.lower() or 'metadata' in n.lower() or 'config' in n.lower() or 'saved_model.pb' in n.lower()]
    print('entries:', names)
    for n in names:
        print('---', n)
        if n.endswith('.json'):
            content = z.read(n).decode('utf-8')
            print(content[:1200])
        else:
            print('binary data')
print('loading model...')
model = tf.keras.models.load_model(path)
print('output shape', model.output_shape)
print('last layer', model.layers[-1].name)
print('config', model.layers[-1].get_config())
print('summary:')
model.summary()