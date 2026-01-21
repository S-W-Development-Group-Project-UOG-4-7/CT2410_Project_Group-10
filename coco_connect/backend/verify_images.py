import urllib.request
import urllib.parse
import json
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"
USERNAME = "admin"
PASSWORD = "admin123"

def post_json(url, data, headers={}):
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={**headers, "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def get_json(url, headers={}):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
             return resp.status, json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return 0, str(e)

def run():
    print(f"Logging in as {USERNAME}...")
    status, body = post_json(f"{BASE_URL}/token/", {"username": USERNAME, "password": PASSWORD})
    
    if status != 200:
        print(f"Login failed: {status}")
        return

    token = json.loads(body).get("access")
    print("Login successful.")

    headers = {"Authorization": f"Bearer {token}"}
    print("Fetching cart...")
    status, cart_data = get_json(f"{BASE_URL}/products/cart/", headers=headers)
    
    if status != 200:
        print(f"Failed to fetch cart: {status}")
        print(cart_data)
        return

    print("Cart Data:")
    items = cart_data.get("items", [])
    if not items:
        print("Cart is empty.")
    else:
        for item in items:
            print(f"Product: {item.get('product_name')}")
            print(f"Image URL: {item.get('product_image')}")

if __name__ == "__main__":
    run()
