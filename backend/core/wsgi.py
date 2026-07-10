import os
from django.core.wsgi import get_wsgi_application

# Auto-load .env file if it exists in the backend root
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    try:
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")
    except Exception as e:
        pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
