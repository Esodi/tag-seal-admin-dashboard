import requests
import json
import warnings
warnings.filterwarnings("ignore")

LOGIN_URL = 'https://45.77.1.62.nip.io/api/auth/login'
USERS_URL = 'https://45.77.1.62.nip.io/api/v1/admin/users'

def get_sample_user():
    # Login
    login_data = {
        "login": "admin",
        "password": "11111111",
        "device_name": "Diagnostic Script"
    }
    r = requests.post(LOGIN_URL, json=login_data, verify=False)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code}")
        print(r.text)
        return

    resp_json = r.json()
    token = resp_json.get('token') or resp_json.get('access_token')
    if not token and 'data' in resp_json:
        token = resp_json['data'].get('token') or resp_json['data'].get('access_token')
    
    if not token:
        print("Token not found in login response")
        return

    # List Users
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }
    r = requests.get(USERS_URL, params={"limit": 1}, headers=headers, verify=False)
    if r.status_code == 200:
        data = r.json()
        print("Full Response:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Failed to list users: {r.status_code}")
        print(r.text)

if __name__ == "__main__":
    get_sample_user()
