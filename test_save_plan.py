
import sys
import os

# Add project root to sys.path
sys.path.append(os.getcwd())

from services.user_service import save_plan, get_plans, _load

def test_save_plan():
    username = "user"
    print(f"Testing save_plan for user: {username}")
    
    # 1. Check existing plans
    plans_before = get_plans(username)
    print(f"Plans before: {len(plans_before)}")
    
    # 2. Save a dummy plan
    dummy_plan = {
        "topic": "Test Topic",
        "created_at": "2023-01-01T00:00:00",
        "content": {"weeks": []}
    }
    
    try:
        save_plan(username, dummy_plan)
        print("save_plan called successfully")
    except Exception as e:
        print(f"save_plan failed: {e}")
        
    # 3. Check plans after
    plans_after = get_plans(username)
    print(f"Plans after: {len(plans_after)}")
    
    if len(plans_after) > len(plans_before):
        print("SUCCESS: Plan saved.")
    else:
        print("FAILURE: Plan not saved.")

    # 4. Check raw JSON
    data = _load()
    user_found = False
    for u in data["users"]:
        if u["username"] == username:
            user_found = True
            print(f"Raw user plans count: {len(u.get('plans', []))}")
            break
    
    if not user_found:
        print("User not found in JSON!")

if __name__ == "__main__":
    test_save_plan()
