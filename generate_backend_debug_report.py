import json
import os

JSON_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_results.json'
OUTPUT_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/backend_api_debug_report.md'
BASE_URL = 'https://45.77.1.62.nip.io/api'

def generate_report():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found.")
        return

    with open(JSON_FILE, 'r') as f:
        results = json.load(f)

    # The JSON uses specific keys for different types of failures
    failed_server = results.get('failed_server', [])
    failed_validation = results.get('failed_validation', [])
    failed_missing = results.get('failed_missing', [])
    
    total_failures = len(failed_server) + len(failed_validation) + len(failed_missing)

    with open(OUTPUT_FILE, 'w') as f:
        f.write("# 🛠️ Backend API Debugging Report\n\n")
        f.write("This report is specifically generated for the backend developer to identify and fix endpoint failures. ")
        f.write(f"The base URL `{BASE_URL}` has been removed from paths for clarity.\n\n")

        f.write(f"**Total Failures:** {total_failures}\n\n")

        # 500 Errors
        if failed_server:
            f.write(f"## 🔥 Internal Server Errors (500)\n")
            f.write("These typically indicate database issues, missing models, or unhandled exceptions in php code.\n\n")
            f.write("| Method | Endpoint Name | Relative Path | Error Details |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for fail in failed_server:
                write_fail_row(f, fail)
            f.write("\n---\n\n")

        # 422 Errors
        if failed_validation:
            f.write(f"## ⚠️ Validation Errors (422)\n")
            f.write("These indicate that the backend rejected the data. This might be due to broken foreign key constraints or outdated validation rules.\n\n")
            f.write("| Method | Endpoint Name | Relative Path | Error Details |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for fail in failed_validation:
                write_fail_row(f, fail)
            f.write("\n---\n\n")

        # 404 Errors
        if failed_missing:
            f.write(f"## 🚫 Not Found (404)\n")
            f.write("The endpoint path or a specific resource ID was not found on the server.\n\n")
            f.write("| Method | Endpoint Name | Relative Path | Error Details |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for fail in failed_missing:
                write_fail_row(f, fail)
            f.write("\n---\n\n")

    print(f"Report successfully generated at: {OUTPUT_FILE}")

def write_fail_row(f, fail):
    method = fail.get('method', '???')
    name = fail.get('name', 'Unnamed Endpoint')
    path = fail.get('path', '').replace(BASE_URL, '')
    
    # Format error details
    err_obj = fail.get('error_obj', {})
    if isinstance(err_obj, dict):
        if 'message' in err_obj:
            err_msg = err_obj['message']
        elif 'errors' in err_obj:
            val_errors = err_obj['errors']
            if isinstance(val_errors, dict):
                err_msg = "; ".join([f"{k}: {', '.join(v) if isinstance(v, list) else v}" for k, v in val_errors.items()])
            else:
                err_msg = str(val_errors)
        else:
            err_msg = json.dumps(err_obj)
    else:
        err_msg = str(err_obj)

    # Clean up long SQL errors for readability in table
    if "SQLSTATE" in err_msg:
        err_msg = err_msg.split(" (SQL:")[0]

    f.write(f"| `{method}` | {name} | `{path}` | {err_msg} |\n")

if __name__ == "__main__":
    generate_report()
