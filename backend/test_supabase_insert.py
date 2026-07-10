import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from predictions.views import get_supabase_client

client = get_supabase_client()
if client is None:
    raise SystemExit('no_client')

payload = {
    'predicted_class': 'Tomato — Early Blight',
    'crop': 'tomato',
    'confidence': 0.9423,
    'is_healthy': False,
    'image_filename': 'test.jpg',
    'image_url': 'https://example.com/test.jpg'
}

try:
    res = client.table('predictions').insert(payload).execute()
    print('INSERT_OK', res)
except Exception as e:
    print('INSERT_ERROR', type(e).__name__, e)
