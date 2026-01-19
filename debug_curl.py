
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def debug_curl():
    # Login
    username = "debug_user"
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": "password123" 
    })
    
    if resp.status_code != 200:
        # Register if needed
        requests.post(f"{BASE_URL}/auth/register", json={
            "username": username,
            "password": "password123",
            "email": "debug@example.com"
        })
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "username": username,
            "password": "password123" 
        })
    
    token = resp.json().get("access_token")
    if not token:
        print("Failed to get token")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # Debug /plans
    url = f"{BASE_URL}/plans"
    print(f"Calling: {url}")
    resp = requests.get(url, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")

if __name__ == "__main__":
    debug_curl()
