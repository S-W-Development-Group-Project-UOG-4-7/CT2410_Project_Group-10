import json
import urllib.request

url = 'http://127.0.0.1:8000/api/auth/register/'
data = json.dumps({
    'name': 'Auto Test',
    'email': 'auto_test@example.com',
    'password': 'test1234',
    'role': 'buyer'
}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print('STATUS', resp.status)
    print(resp.read().decode())
except Exception as e:
    import sys
    print('ERROR', e)
    # Print more detailed response if available
    if hasattr(e, 'read'):
        try:
            print(e.read().decode())
        except Exception:
            pass
    sys.exit(1)
