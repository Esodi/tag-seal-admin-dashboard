#!/usr/bin/env python3
"""
Advanced API Endpoint Tester with Detailed Diagnostics
Categorizes failures and extracts detailed error messages.
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
                    parts = line.split('=', 1)
                    if len(parts) == 2:
                        env_vars[parts[0].strip()] = parts[1].strip()
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
        # Attempt to find in variables, or return the placeholder if not found
        val = variables.get(var_name)
        if val is not None:
            return str(val)
        return match.group(0)
    
    return re.sub(r'\{\{([^}]+)\}\}', replace, text)

def get_variable_name_from_create_request(request_name):
    if request_name.startswith("Create "):
        entity = request_name[7:].replace(" ", "")
        if entity:
            # Handle some plurals/special cases if needed
            if entity.endswith("y"): # Pregnancy -> pregnancyId
                return entity[:-1].lower() + "yId"
            return entity[0].lower() + entity[1:] + "Id"
    return None

def run_tests():
    print("=" * 80)
    print("🚀 TAG-SEAL API DIAGNOSTIC REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    
    # Load Config
    env = load_env(ENV_PATH)
    collection = load_collection(COLLECTION_PATH)
    all_requests = extract_requests(collection['item'])
    
    # Variables state
    variables = {
        'baseUrl': BASE_URL,
        'token': '',
        # Default some IDs to 1 if we can't capture them, to reduce 404s
        'countryId': 1,
        'regionId': 1,
        'districtId': 1,
        'wardId': 1,
        'villageId': 1,
        'streetId': 1,
        'divisionId': 1,
        'livestockTypeId': 1,
        'userId': 1,
        'farmerId': 1,
        'farmId': 1,
    }
    
    # Results tracking
    results = {
        'total': 0,
        'working': [],
        'failed_validation': [], # 422
        'failed_missing': [],     # 404
        'failed_server': [],      # 500
        'skipped': []
    }
    
    # 1. Prioritize Login
    login_req = next((r for r in all_requests if "Login" in r['name']), None)
    if login_req:
        # Move to front
        all_requests.remove(login_req)
        all_requests.insert(0, login_req)
    
    for item in all_requests:
        results['total'] += 1
        req_name = item['name']
        req_data = item['request']
        full_path = item.get('full_path', req_name)
        
        if "Logout" in req_name:
            results['skipped'].append({'name': req_name, 'path': full_path})
            continue
        
        method = req_data['method']
        url_raw = req_data['url']['raw'] if isinstance(req_data['url'], dict) else req_data['url']
        url = substitute_vars(url_raw, variables)
        
        headers = {}
        # Default headers
        headers['Accept'] = 'application/json'
        if variables.get('token'):
            headers['Authorization'] = f"Bearer {variables['token']}"
            
        for h in req_data.get('header', []):
            if h['key'] == "Authorization":
                headers[h['key']] = f"Bearer {variables['token']}"
            elif h['key'] != "Content-Type":
                headers[h['key']] = substitute_vars(h['value'], variables)
        
        data = None
        json_data = None
        
        if 'body' in req_data and req_data['body'].get('mode') == 'raw':
            raw_body = req_data['body']['raw']
            raw_body = substitute_vars(raw_body, variables)
            try:
                json_data = json.loads(raw_body)
            except:
                data = raw_body
        
        # Override login
        if "Login" in req_name:
            json_data = {
                "login": "admin",
                "password": "11111111",
                "device_name": "API Diagnostic Tool"
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
                timeout=15
            )
            
            status_code = response.status_code
            try:
                resp_json = response.json()
            except:
                resp_json = None
            
            # Diagnostic info
            info = {
                'name': req_name,
                'path': full_path,
                'method': method,
                'status': status_code,
                'url': url,
                'error_obj': resp_json
            }
            
            # Handle Variables Capture
            if status_code < 300:
                if "Login" in req_name and resp_json:
                    token = resp_json.get('token') or resp_json.get('access_token')
                    if not token and 'data' in resp_json and isinstance(resp_json['data'], dict):
                        token = resp_json['data'].get('token') or resp_json['data'].get('access_token')
                    
                    if token:
                        variables['token'] = token
                        print(f"🔑 Token captured successfully for {req_name}")
                    else:
                        print(f"⚠️ Login successful but no token found in response for {req_name}")
                
                # Check for ID in response to update variables
                if resp_json:
                    data_obj = resp_json.get('data', resp_json)
                    if isinstance(data_obj, dict):
                        extracted_id = data_obj.get('id') or data_obj.get('uuid')
                        if extracted_id:
                            var_name = get_variable_name_from_create_request(req_name)
                            if var_name:
                                variables[var_name] = extracted_id
                
                results['working'].append(info)
            elif status_code == 422:
                results['failed_validation'].append(info)
            elif status_code == 404:
                results['failed_missing'].append(info)
            else:
                results['failed_server'].append(info)
                
        except Exception as e:
            results['failed_server'].append({
                'name': req_name,
                'path': full_path,
                'method': method,
                'status': 'NETWORK_ERROR',
                'url': url,
                'error': str(e)
            })

    # OUTPUT REPORT
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("-" * 80)
    print(f"Total endpoints tested: {results['total']}")
    print(f"✅ Working:            {len(results['working'])}")
    print(f"❌ Server/Other Error: {len(results['failed_server'])}")
    print(f"❌ Validation (422):    {len(results['failed_validation'])}")
    print(f"❌ Not Found (404):     {len(results['failed_missing'])}")
    print(f"⏭️  Skipped:            {len(results['skipped'])}")
    print("=" * 80)

    if results['working']:
        print("\n✅ WORKING ENDPOINTS")
        for work in results['working']:
            print(f"  [{work['method']:6}] {work['name']}")

    if results['failed_server']:
        print("\n🔥 SERVER/AUTHENTICATION ERRORS")
        for err in results['failed_server']:
            msg = "Unknown Error"
            if isinstance(err.get('error_obj'), dict):
                msg = err['error_obj'].get('message', 'No message')
            elif err.get('error'):
                msg = str(err['error'])
            print(f"  [{err['method']:6}] {err['name']} (Status: {err['status']}) -> {msg[:100]}")

    if results['failed_validation']:
        print("\n⚠️  VALIDATION ERRORS")
        for err in results['failed_validation']:
            errors = err['error_obj'].get('errors', 'No details') if isinstance(err.get('error_obj'), dict) else 'Unknown error'
            print(f"  [{err['method']:6}] {err['name']} -> {errors}")

    if results['failed_missing']:
        print("\n🔍 NOT FOUND (Cascading Failures or missing placeholders)")
        # Show only a few to avoid spam
        for err in results['failed_missing'][:10]:
            print(f"  [{err['method']:6}] {err['name']} -> {err['url']}")
        if len(results['failed_missing']) > 10:
            print(f"  ... and {len(results['failed_missing']) - 10} more")

    return results

if __name__ == "__main__":
    run_tests()
