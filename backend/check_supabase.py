import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from predictions.views import get_supabase_client

client = get_supabase_client()
if client is None:
    raise SystemExit('no_client')
res = client.table('predictions').select('*').limit(1).execute()
print('READ_OK=', bool(getattr(res, 'data', None)))
print(getattr(res, 'data', None))
