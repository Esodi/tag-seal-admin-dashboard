import json
import os

JSON_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_results.json'
OUTPUT_FILE = '/home/egao/.gemini/antigravity/brain/5742a34e-4fd0-4ce4-9926-8cb16f0018af/api_failure_report.md'
BASE_URL = 'https://45.77.1.62.nip.io/api'

def generate_md_report():
    if not os.path.exists(JSON_FILE):
        print(f"File {JSON_FILE} not found")
        return

    with open(JSON_FILE, 'r') as f:
        results = json.load(f)

    with open(OUTPUT_FILE, 'w') as f:
        f.write("# 📋 API Endpoint Failure Report\n\n")
        f.write(f"This report details all failing API endpoints identified during the diagnostic run. The base URL `{BASE_URL}` has been omitted from paths for easier reading.\n\n")

        # 1. Server Errors (500)
        if results['failed_server']:
            f.write("## 🔥 Internal Server Errors (500)\n")
            f.write("These issues require backend code or database fixes.\n\n")
            f.write("| Method | Endpoint Name | Relative Path | Error Message |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for err in results['failed_server']:
                path = err['url'].replace(BASE_URL, '')
                msg = "Internal Error"
                if isinstance(err.get('error_obj'), dict):
                    msg = err['error_obj'].get('message', 'No message')
                elif err.get('error'):
                    msg = str(err['error'])
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` | {msg[:150]} |\n")
            f.write("\n")

        # 2. Validation Errors (422)
        if results['failed_validation']:
            f.write("## ⚠️ Validation Failures (422)\n")
            f.write("These failures occur when the request body data does not match the backend rules.\n\n")
            f.write("| Method | Endpoint Name | Relative Path | Validation Details |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for err in results['failed_validation']:
                path = err['url'].replace(BASE_URL, '')
                errors = err['error_obj'].get('errors', 'Unknown validation error') if isinstance(err.get('error_obj'), dict) else 'Unknown'
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` | `{errors}` |\n")
            f.write("\n")

        # 3. Not Found (404)
        if results['failed_missing']:
            f.write("## 🔍 Resource Not Found (404)\n")
            f.write("These are often cascading failures caused by missing parent records.\n\n")
            f.write("| Method | Endpoint Name | Relative Path |\n")
            f.write("| :--- | :--- | :--- |\n")
            for err in results['failed_missing']:
                path = err['url'].replace(BASE_URL, '')
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` |\n")
            f.write("\n")

    print(f"Report successfully generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_md_report()
