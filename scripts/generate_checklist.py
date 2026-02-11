import re
import os

def parse_tools(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.")
        return []

    tools = []
    # Regex to capture tool properties
    # id: 'cadence', name: 'Cadência Total', ... desc: '...'
    tool_pattern = re.compile(r"id:\s*'([^']+)',\s*name:\s*'([^']+)',.*?desc:\s*'([^']+)'", re.DOTALL)

    matches = tool_pattern.findall(content)
    for match in matches:
        tools.append({
            'id': match[0],
            'name': match[1],
            'desc': match[2],
            'status': 'Not Implemented', # Default assumption based on analysis
            'notes': 'Found in concept docs only'
        })

    return tools

def check_files():
    files_to_check = [
        "apps/web/components/LDRToolGrid.tsx",
        "apps/web/components/EnrichmentTool.tsx",
        "apps/web/app/actions/ldr.ts"
    ]
    existing_files = []
    for f in files_to_check:
        if os.path.exists(f):
            existing_files.append(f)
    return existing_files

def generate_html(tools, existing_files):
    html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDR Commander Implementation Checklist</title>
    <style>
        body { font-family: sans-serif; margin: 2rem; background-color: #f4f4f4; }
        h1 { color: #333; }
        .summary { background: #fff; padding: 1rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; color: #555; }
        tr:hover { background-color: #f1f1f1; }
        .status-not-implemented { color: #dc3545; font-weight: bold; }
        .status-implemented { color: #28a745; font-weight: bold; }
        .status-partial { color: #ffc107; font-weight: bold; }
        .note { font-size: 0.9em; color: #666; }
        .related-section { margin-top: 2rem; background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>

    <h1>SDR Commander Implementation Checklist</h1>

    <div class="summary">
        <h2>Summary</h2>
        <p>This report analyzes the implementation status of the <strong>SDR Commander Cycles (1-50)</strong> as defined in <code>docs/sdr-commander-v1.2.tsx.txt</code>.</p>
        <p><strong>Conclusion:</strong> None of the SDR-specific tools listed in the concept documentation are currently implemented in the application codebase.</p>
        <p>The codebase contains related features (LDR Tools, Campaign Wizard) but not the specific "SDR Commander" toolset.</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Tool Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
    """

    for tool in tools:
        html += f"""
            <tr>
                <td>{tool['id']}</td>
                <td>{tool['name']}</td>
                <td>{tool['desc']}</td>
                <td class="status-not-implemented">🔴 {tool['status']}</td>
                <td class="note">{tool['notes']}</td>
            </tr>
        """

    html += """
        </tbody>
    </table>

    <div class="related-section">
        <h2>Related Implementations found in Codebase</h2>
        <p>The following files were found which relate to similar functionality (Lead Data, Enrichment, etc.) but are distinct from the SDR Commander tools:</p>
        <ul>
    """

    for f in existing_files:
        html += f"<li><code>{f}</code> (Implemented)</li>"

    if not existing_files:
        html += "<li>No related implementation files found.</li>"

    html += """
        </ul>
        <p>Note: <code>LDRToolGrid.tsx</code> implements a different set of 20 tools focused on Data Quality (LDR), not Sales Development (SDR).</p>
    </div>

</body>
</html>
    """

    with open("checklist_report.html", "w", encoding='utf-8') as f:
        f.write(html)
    print(f"Report generated: checklist_report.html with {len(tools)} tools.")

if __name__ == "__main__":
    tools = parse_tools("docs/sdr-commander-v1.2.tsx.txt")
    existing_files = check_files()
    generate_html(tools, existing_files)
