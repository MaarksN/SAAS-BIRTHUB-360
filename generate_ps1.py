import os
import base64

EXCLUDED_DIRS = {
    'node_modules', '.git', '.next', 'dist', 'coverage', '.turbo', '.vscode', '__pycache__'
}

EXCLUDED_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store', 'deploy.ps1'
}

EXCLUDED_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pyc'
}

def generate_ps1():
    output_lines = []

    # PowerShell Script Header
    output_lines.append('$BasePath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath("Desktop"), "Saas Birthub Hub")')
    output_lines.append('if (Test-Path $BasePath) { Remove-Item $BasePath -Recurse -Force }')
    output_lines.append('New-Item -Path $BasePath -ItemType Directory -Force | Out-Null')
    output_lines.append('Write-Host "Created Base Directory: $BasePath"')
    output_lines.append('')

    output_lines.append('function Write-ProjectFile {')
    output_lines.append('    param ([string]$RelPath, [string]$Content)')
    output_lines.append('    $FullPath = Join-Path $BasePath $RelPath')
    output_lines.append('    $Dir = Split-Path $FullPath -Parent')
    output_lines.append('    if (!(Test-Path $Dir)) { New-Item -Path $Dir -ItemType Directory -Force | Out-Null }')
    output_lines.append('    [System.IO.File]::WriteAllText($FullPath, $Content, [System.Text.Encoding]::UTF8)')
    output_lines.append('    Write-Host "Wrote: $RelPath"')
    output_lines.append('}')
    output_lines.append('')

    for root, dirs, files in os.walk('.'):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for file in files:
            if file in EXCLUDED_FILES:
                continue
            if any(file.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
                continue

            file_path = os.path.join(root, file)
            # Remove leading ./
            rel_path = os.path.relpath(file_path, '.')

            # Skip the output script itself and the tool script
            if rel_path.replace('\\', '/') in ['deploy.ps1', 'tools/generate_ps1.py']:
                continue

            # Skip generated files that might be ignored but present
            if 'node_modules' in rel_path:
                continue

            try:
                with open(file_path, 'rb') as f:
                    content_bytes = f.read()

                # Check if it looks like a text file
                try:
                    content_str = content_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    print(f"Skipping binary file: {rel_path}")
                    continue

                b64_content = base64.b64encode(content_bytes).decode('ascii')

                output_lines.append(f'# File: {rel_path}')
                output_lines.append(f'$Content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("{b64_content}"))')
                output_lines.append(f'Write-ProjectFile -RelPath "{rel_path}" -Content $Content')
                output_lines.append('')

            except Exception as e:
                print(f"Skipping {rel_path}: {e}")

    with open('deploy.ps1', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    print("deploy.ps1 generated successfully.")

if __name__ == '__main__':
    generate_ps1()
