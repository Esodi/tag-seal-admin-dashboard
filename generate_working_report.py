import json
import os

JSON_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_results.json'
OUTPUT_FILE = '/home/egao/Documents/tag-seal-admin-dashboard/api_working_report.md'
BASE_URL = 'https://45.77.1.62.nip.io/api'

def generate_working_md_report():
    if not os.path.exists(JSON_FILE):
        print(f"File {JSON_FILE} not found")
        return

    with open(JSON_FILE, 'r') as f:
        results = json.load(f)

    with open(OUTPUT_FILE, 'w') as f:
        f.write("# ✅ API Working Report\n\n")
        f.write(f"This report lists all functional API endpoints tested (Total Working: {len(results['working'])}). The base URL `{BASE_URL}` has been omitted for clarity.\n\n")

        f.write("| Method | Endpoint Name | Relative Path |\n")
        f.write("| :--- | :--- | :--- |\n")
        
        # Sort by path for better readability
        working_items = sorted(results['working'], key=lambda x: x['url'])
        
        for item in working_items:
            path = item['url'].replace(BASE_URL, '')
            f.write(f"| `{item['method']}` | {item['name']} | `{path}` |\n")

    print(f"Working report generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_working_md_report()
