#!/usr/bin/env python3
"""
Prepare files for Vercel deployment
"""
import os
import json
import base64
from pathlib import Path

def get_files_to_deploy():
    """Get all files needed for deployment"""
    files = []
    base_path = Path('.')
    
    # Essential patterns
    patterns = [
        '*.tsx', '*.ts', '*.json', '*.css', '*.html',
        '*.js', '*.mjs', '*.cjs', '*.svg', '*.ico'
    ]
    
    # Exclude patterns
    excludes = ['node_modules', '.git', '.output', 'dist', '.vercel', '__pycache__']
    
    for pattern in patterns:
        for file_path in base_path.rglob(pattern):
            # Skip excluded directories
            if any(exc in str(file_path) for exc in excludes):
                continue
            
            # Skip hidden files
            if any(part.startswith('.') for part in file_path.parts):
                continue
                
            relative_path = str(file_path.relative_to(base_path))
            files.append(relative_path)
    
    return sorted(files)

def prepare_file_data(file_path):
    """Read file and prepare for deployment"""
    try:
        # Try to read as text first
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return {
                'file': file_path,
                'data': content,
                'encoding': 'utf-8'
            }
    except UnicodeDecodeError:
        # Binary file - use base64
        with open(file_path, 'rb') as f:
            content = base64.b64encode(f.read()).decode('utf-8')
            return {
                'file': file_path,
                'data': content,
                'encoding': 'base64'
            }

def main():
    print("🔍 Scanning files for deployment...")
    files_to_deploy = get_files_to_deploy()
    
    print(f"✅ Found {len(files_to_deploy)} files")
    
    # Prepare file data
    file_data = []
    for i, file_path in enumerate(files_to_deploy, 1):
        print(f"  [{i}/{len(files_to_deploy)}] Preparing {file_path}")
        data = prepare_file_data(file_path)
        file_data.append(data)
    
    # Save to JSON
    output = {
        'files': file_data,
        'count': len(file_data)
    }
    
    with open('/tmp/vercel-deploy-files.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Prepared {len(file_data)} files")
    print(f"📁 Saved to: /tmp/vercel-deploy-files.json")
    print(f"📊 Total size: {os.path.getsize('/tmp/vercel-deploy-files.json') / 1024 / 1024:.2f} MB")
    
    # Print file list
    print("\n📋 Files to deploy:")
    for f in files_to_deploy[:20]:
        print(f"  - {f}")
    if len(files_to_deploy) > 20:
        print(f"  ... and {len(files_to_deploy) - 20} more")

if __name__ == '__main__':
    main()
