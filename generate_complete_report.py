import json
import os

JSON_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_results.json'
OUTPUT_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_failure_report.md'
BASE_URL = 'https://45.77.1.62.nip.io/api'

def generate_full_md_report():
    if not os.path.exists(JSON_FILE):
        print(f"File {JSON_FILE} not found")
        return

    with open(JSON_FILE, 'r') as f:
        results = json.load(f)

    with open(OUTPUT_FILE, 'w') as f:
        f.write("# 📋 Comprehensive API Endpoint Failure Report\n\n")
        f.write(f"This report lists every single failing endpoint from the diagnostic test (Total Failing: {len(results['failed_server']) + len(results['failed_validation']) + len(results['failed_missing'])}). The base URL `{BASE_URL}` has been omitted for clarity.\n\n")

        # 1. 500 Errors
        if results['failed_server']:
            f.write(f"## 🔥 Internal Server Errors ({len(results['failed_server'])})\n")
            f.write("| Method | Name | Path | Error |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for err in results['failed_server']:
                path = err['url'].replace(BASE_URL, '')
                msg = "Internal Error"
                if isinstance(err.get('error_obj'), dict): msg = err['error_obj'].get('message', 'No message')
                elif err.get('error'): msg = str(err['error'])
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` | {msg[:100]} |\n")
            f.write("\n")

        # 2. 422 Errors
        if results['failed_validation']:
            f.write(f"## ⚠️ Validation Failures ({len(results['failed_validation'])})\n")
            f.write("| Method | Name | Path | Validation Errors |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for err in results['failed_validation']:
                path = err['url'].replace(BASE_URL, '')
                errors = err['error_obj'].get('errors', 'Unknown') if isinstance(err.get('error_obj'), dict) else 'Unknown'
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` | `{errors}` |\n")
            f.write("\n")

        # 3. 404 Errors
        if results['failed_missing']:
            f.write(f"## 🔍 Not Found / Missing ({len(results['failed_missing'])})\n")
            f.write("| Method | Name | Path |\n")
            f.write("| :--- | :--- | :--- |\n")
            for err in results['failed_missing']:
                path = err['url'].replace(BASE_URL, '')
                f.write(f"| `{err['method']}` | {err['name']} | `{path}` |\n")
            f.write("\n")

    print(f"Complete report generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_full_md_report()
