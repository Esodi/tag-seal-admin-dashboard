import json
import requests
import os
import re
import warnings

# Suppress SSL warnings
warnings.filterwarnings("ignore")

# Configuration
COLLECTION_PATH = '/home/egao/Documents/tag-seal-admin-dashboard/admin_postman_api.postman_collection.json'
ENV_PATH = '/home/egao/Documents/tag-seal-admin-dashboard/.env'

def load_env(path):
    env_vars = {}
    if os.path.exists(path):
        with open(path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    return env_vars

def load_collection(path):
    with open(path, 'r') as f:
        return json.load(f)

def extract_requests(items, requests_list=None):
    if requests_list is None:
        requests_list = []
    
    for item in items:
        if 'item' in item:
            extract_requests(item['item'], requests_list)
        elif 'request' in item:
            requests_list.append(item)
    return requests_list

def substitute_vars(text, variables):
    if not isinstance(text, str):
        return text
    
    def replace(match):
        var_name = match.group(1)
        return str(variables.get(var_name, match.group(0)))
    
    return re.sub(r'\{\{([^}]+)\}\}', replace, text)

def get_variable_name_from_create_request(request_name):
    # Heuristic: "Create User" -> "userId"
    if request_name.startswith("Create "):
        entity = request_name[7:].replace(" ", "")
        # Handle "Specie" -> "specieId" (case sensitive? usually camelCase)
        # We'll just lowercase the first letter
        if entity:
            return entity[0].lower() + entity[1:] + "Id"
    return None

def run_tests():
    # 1. Load Config
    print("Loading configuration...")
    env = load_env(ENV_PATH)
    base_url = env.get('VITE_API_BASE_URL', 'http://localhost:3000/api')
    print(f"Base URL: {base_url}")
    
    collection = load_collection(COLLECTION_PATH)
    all_requests = extract_requests(collection['item'])
    print(f"Found {len(all_requests)} requests.")

    # Variables state
    variables = {
        'baseUrl': base_url
    }

    # 2. Execute Requests
    for item in all_requests:
        req_name = item['name']
        req_data = item['request']
        
        if "Logout" in req_name:
            print(f"Skipping {req_name} to maintain session.")
            continue
        
        # Method
        method = req_data['method']
        
        # URL
        url_raw = req_data['url']['raw'] if isinstance(req_data['url'], dict) else req_data['url']
        url = substitute_vars(url_raw, variables)
        
        # Headers
        headers = {}
        for h in req_data.get('header', []):
            if h['key'] != "Content-Type": # Let requests verify handle content type if json
                 headers[h['key']] = substitute_vars(h['value'], variables)
        
        # Auth (special handling if not in headers, but collection has it in headers usually)
        # Checking for Bearer token in headers
        
        # Body
        data = None
        json_data = None
        
        if 'body' in req_data and req_data['body']['mode'] == 'raw':
            raw_body = req_data['body']['raw']
            # substitute vars in body
            raw_body = substitute_vars(raw_body, variables)
            try:
                json_data = json.loads(raw_body)
            except:
                data = raw_body

        if "Login" in req_name:
            # Override credentials
            json_data = {
                "login": "admin",
                "password": "11111111",
                "device_name": "Admin Portal"
            }
            data = None # Clear raw data if any

        print(f"\n[{method}] {req_name}")
        print(f"URL: {url}")
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                data=data,
                verify=False # Ignore SSL for nip.io/IPs
            )
            
            status_code = response.status_code
            print(f"Status: {status_code}")
            
            try:
                resp_json = response.json()
            except:
                resp_json = None

            # Handle Login
            if "Login" in req_name and status_code == 200 and resp_json:
                # Extract token
                token = resp_json.get('token') or resp_json.get('access_token')
                if not token and 'data' in resp_json:
                     token = resp_json['data'].get('token') or resp_json['data'].get('access_token')
                
                if token:
                    print("Login successful. Token captured.")
                    variables['token'] = token
                else:
                    print("Login successful but token not found in response.")
                    print(resp_json)

            # Handle Create (Capture ID)
            if method == "POST" and (request_name_var := get_variable_name_from_create_request(req_name)):
                if status_code in [200, 201] and resp_json:
                    # Try to find ID
                    # Common patterns: {id: ...}, {data: {id: ...}}, {uuid: ...}
                    obj = resp_json
                    if 'data' in obj and isinstance(obj['data'], dict):
                        obj = obj['data']
                    
                    extracted_id = obj.get('id') or obj.get('uuid')
                    
                    if extracted_id:
                        print(f"Captured {request_name_var}: {extracted_id}")
                        variables[request_name_var] = extracted_id
                    else:
                        print(f"Warning: Could not extract ID for {request_name_var} from response.")
            
            if status_code >= 400:
                print(f"Response: {response.text[:200]}...")

        except Exception as e:
            print(f"Error executing request: {e}")

if __name__ == "__main__":
    run_tests()
