import urllib.request
import urllib.parse
import json
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"
USERNAME = "admin"  # You might need to change this if admin user doesn't exist
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

def get_json(url):
    try:
        with urllib.request.urlopen(url) as resp:
             return resp.status, json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return 0, str(e)

def reproduce():
    print(f"Logging in as {USERNAME}...")
    status, body = post_json(f"{BASE_URL}/token/", {"username": USERNAME, "password": PASSWORD})
    
    if status != 200:
        print(f"Login failed: {status}")
        try:
             print(f"Body: {body}")
        except: pass
        return

    token = json.loads(body).get("access")
    print("Login successful.")

    # Get product ID
    print("Fetching products...")
    status, products = get_json(f"{BASE_URL}/products/")
    if status != 200 or not products:
        print("Failed to get products")
        return

    product_id = products[0]['id']
    print(f"Adding product {product_id} to cart...")

    headers = {"Authorization": f"Bearer {token}"}
    status, body = post_json(
        f"{BASE_URL}/products/cart/add/", 
        {"product_id": product_id}, 
        headers=headers
    )

    print(f"Cart Add Status: {status}")
    print(f"Cart Add Body Sample: {body[:1000]}") # Print first 1000 chars of response

if __name__ == "__main__":
    reproduce()
