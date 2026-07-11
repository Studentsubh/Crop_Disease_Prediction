import io
import uuid
import urllib.request
import urllib.error
from PIL import Image

# Create a simple RGB JPEG image in memory.
img = Image.new('RGB', (224, 224), color=(128, 200, 100))
buf = io.BytesIO()
img.save(buf, format='JPEG')
img_bytes = buf.getvalue()

boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
lines = []
lines.append(f'--{boundary}')
lines.append('Content-Disposition: form-data; name="image"; filename="test.jpg"')
lines.append('Content-Type: image/jpeg')
lines.append('')
body = '\r\n'.join(lines).encode('utf-8') + b'\r\n' + img_bytes + b'\r\n' + f'--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request('http://127.0.0.1:8000/api/predict/', data=body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Content-Length', str(len(body)))

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8', 'ignore'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode('utf-8', 'ignore'))
except Exception as e:
    print('ERR', type(e).__name__, e)
