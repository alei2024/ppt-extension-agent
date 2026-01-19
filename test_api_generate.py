
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_api_generate():
    # 1. Login
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "user",
        "password": "password123" # Assuming default password or I need to know it?
    })
    
    # Wait, I don't know the password for "user".
    # But I can register a NEW user "debug_user" and test with that.
    
    if resp.status_code != 200:
        print(f"Login failed (expected if password unknown): {resp.status_code}")
        # Try registering new user
        print("Registering debug_user...")
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "username": "debug_user",
            "password": "password123",
            "email": "debug@example.com"
        })
        if resp.status_code == 200:
            print("Registered debug_user")
            # Login to get token
            resp = requests.post(f"{BASE_URL}/auth/login", json={
                "username": "debug_user",
                "password": "password123"
            })
        else:
             print(f"Registration failed (likely exists): {resp.text}, logging in...")
             resp = requests.post(f"{BASE_URL}/auth/login", json={
                "username": "debug_user",
                "password": "password123"
            })

    if resp.status_code != 200:
        print(f"Login failed for debug_user: {resp.text}")
        return
        
    token = resp.json()["access_token"]
    print(f"Got token: {token[:10]}...")
    
    # 2. Generate Plan
    print("Generating plan...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "topic": "Python Asyncio",
        "weeks": 1,
        "level": "beginner"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/plan/generate", json=payload, headers=headers, timeout=60) # High timeout for LLM
        print(f"Generate status: {resp.status_code}")
        if resp.status_code == 200:
            print("Generate success")
            print(f"Response preview: {str(resp.json())[:100]}")
        else:
            print(f"Generate failed: {resp.text}")
            return
    except Exception as e:
        print(f"Request failed: {e}")
        return

    # 3. Check Plans
    print("Checking plans...")
    resp = requests.get(f"{BASE_URL}/plans", headers=headers)
    if resp.status_code == 200:
        plans = resp.json().get("plans", [])
        print(f"Found {len(plans)} plans")
        if len(plans) > 0:
            print("SUCCESS: Plan synced!")
        else:
            print("FAILURE: No plans found after generation.")
    else:
        print(f"Get plans failed: {resp.text}")

if __name__ == "__main__":
    test_api_generate()
