#!/usr/bin/env python3
"""
API Endpoint Tester with Report Generation
Tests all endpoints from the Postman collection and generates a summary report.
"""
import json
import requests
import os
import re
import warnings
from datetime import datetime

# Suppress SSL warnings
warnings.filterwarnings("ignore")

# Configuration
COLLECTION_PATH = '/home/egao/Documents/tag-seal-admin-dashboard/admin_postman_api.postman_collection.json'
ENV_PATH = '/home/egao/Documents/tag-seal-admin-dashboard/.env'
BASE_URL = 'https://45.77.1.62.nip.io/api'

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

def extract_requests(items, parent_path="", requests_list=None):
    if requests_list is None:
        requests_list = []
    
    for item in items:
        current_path = f"{parent_path}/{item['name']}" if parent_path else item['name']
        if 'item' in item:
            extract_requests(item['item'], current_path, requests_list)
        elif 'request' in item:
            item['full_path'] = current_path
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
    if request_name.startswith("Create "):
        entity = request_name[7:].replace(" ", "")
        if entity:
            return entity[0].lower() + entity[1:] + "Id"
    return None

def run_tests():
    print("=" * 70)
    print("API ENDPOINT TEST REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    print("=" * 70)
    
    # Load Config
    env = load_env(ENV_PATH)
    collection = load_collection(COLLECTION_PATH)
    all_requests = extract_requests(collection['item'])
    
    # Variables state
    variables = {'baseUrl': BASE_URL}
    
    # Results tracking
    results = {
        'working': [],
        'failed': [],
        'skipped': []
    }
    
    for item in all_requests:
        req_name = item['name']
        req_data = item['request']
        full_path = item.get('full_path', req_name)
        
        if "Logout" in req_name:
            results['skipped'].append({
                'name': req_name,
                'path': full_path,
                'reason': 'Skipped to maintain auth session'
            })
            continue
        
        method = req_data['method']
        url_raw = req_data['url']['raw'] if isinstance(req_data['url'], dict) else req_data['url']
        url = substitute_vars(url_raw, variables)
        
        headers = {}
        for h in req_data.get('header', []):
            if h['key'] != "Content-Type":
                headers[h['key']] = substitute_vars(h['value'], variables)
        
        data = None
        json_data = None
        
        if 'body' in req_data and req_data['body']['mode'] == 'raw':
            raw_body = req_data['body']['raw']
            raw_body = substitute_vars(raw_body, variables)
            try:
                json_data = json.loads(raw_body)
            except:
                data = raw_body
        
        if "Login" in req_name:
            json_data = {
                "login": "admin",
                "password": "11111111",
                "device_name": "Admin Portal"
            }
            data = None
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                data=data,
                verify=False,
                timeout=30
            )
            
            status_code = response.status_code
            
            try:
                resp_json = response.json()
            except:
                resp_json = None
            
            # Handle Login
            if "Login" in req_name and status_code == 200 and resp_json:
                token = resp_json.get('token') or resp_json.get('access_token')
                if not token and 'data' in resp_json:
                    token = resp_json['data'].get('token') or resp_json['data'].get('access_token')
                if token:
                    variables['token'] = token
            
            # Handle Create (Capture ID)
            if method == "POST":
                var_name = get_variable_name_from_create_request(req_name)
                if var_name and status_code in [200, 201] and resp_json:
                    obj = resp_json
                    if 'data' in obj and isinstance(obj['data'], dict):
                        obj = obj['data']
                    extracted_id = obj.get('id') or obj.get('uuid')
                    if extracted_id:
                        variables[var_name] = extracted_id
            
            # Categorize result
            if status_code < 400:
                results['working'].append({
                    'name': req_name,
                    'path': full_path,
                    'method': method,
                    'status': status_code,
                    'url': url
                })
            else:
                error_msg = ""
                if resp_json:
                    error_msg = resp_json.get('message', '')[:100]
                else:
                    error_msg = response.text[:100]
                
                results['failed'].append({
                    'name': req_name,
                    'path': full_path,
                    'method': method,
                    'status': status_code,
                    'url': url,
                    'error': error_msg
                })
                
        except Exception as e:
            results['failed'].append({
                'name': req_name,
                'path': full_path,
                'method': method,
                'status': 'ERROR',
                'url': url,
                'error': str(e)[:100]
            })
    
    # Print Summary Report
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total endpoints tested: {len(all_requests)}")
    print(f"✅ Working: {len(results['working'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    print(f"⏭️  Skipped: {len(results['skipped'])}")
    
    print("\n" + "=" * 70)
    print("❌ FAILED ENDPOINTS (These do NOT work)")
    print("=" * 70)
    
    # Group failures by category
    failures_by_category = {}
    for fail in results['failed']:
        path_parts = fail['path'].split('/')
        category = path_parts[0] if path_parts else 'Unknown'
        if category not in failures_by_category:
            failures_by_category[category] = []
        failures_by_category[category].append(fail)
    
    for category, failures in failures_by_category.items():
        print(f"\n📁 {category}")
        print("-" * 60)
        for fail in failures:
            print(f"  [{fail['method']:6}] {fail['name']}")
            print(f"           Status: {fail['status']}")
            print(f"           URL: {fail['url']}")
            if fail.get('error'):
                print(f"           Error: {fail['error']}")
            print()
    
    print("\n" + "=" * 70)
    print("✅ WORKING ENDPOINTS")
    print("=" * 70)
    
    # Group working by category
    working_by_category = {}
    for work in results['working']:
        path_parts = work['path'].split('/')
        category = path_parts[0] if path_parts else 'Unknown'
        if category not in working_by_category:
            working_by_category[category] = []
        working_by_category[category].append(work)
    
    for category, working in working_by_category.items():
        print(f"\n📁 {category} ({len(working)} endpoints)")
        for work in working:
            print(f"  ✅ [{work['method']:6}] {work['name']} - {work['status']}")
    
    # Return results for programmatic use
    return results

if __name__ == "__main__":
    results = run_tests()
