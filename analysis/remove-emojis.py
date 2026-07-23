#!/usr/bin/env python3
"""
Aureus.africa Emoji Removal Script
Removes ALL emojis from source code files
SAFE: Creates backup before making changes
"""

import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple

# Emoji regex pattern (Unicode ranges)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags (iOS)
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251" 
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # chess symbols
    "]+",
    flags=re.UNICODE
)

# Files to skip
SKIP_FILES = {
    'live-bundle.js',  # Auto-generated
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
}

# File extensions to process
PROCESS_EXTENSIONS = {'.tsx', '.ts', '.jsx', '.js', '.json', '.sql', '.md'}

def should_process_file(file_path: Path) -> bool:
    """Check if file should be processed"""
    if any(skip in str(file_path) for skip in SKIP_FILES):
        return False
    return file_path.suffix in PROCESS_EXTENSIONS

def remove_emojis_from_text(text: str) -> Tuple[str, int]:
    """Remove emojis from text and return cleaned text + count"""
    cleaned = EMOJI_PATTERN.sub('', text)
    emoji_count = len(EMOJI_PATTERN.findall(text))
    return cleaned, emoji_count

def process_file(file_path: Path, dry_run: bool = True) -> Tuple[int, bool]:
    """
    Process a single file
    Returns: (emoji_count, was_modified)
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            original_content = f.read()
        
        cleaned_content, emoji_count = remove_emojis_from_text(original_content)
        
        if emoji_count == 0:
            return 0, False
        
        if not dry_run:
            # Create backup
            backup_path = file_path.with_suffix(file_path.suffix + '.backup')
            shutil.copy2(file_path, backup_path)
            
            # Write cleaned content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            
            print(f"CLEANED: {file_path} ({emoji_count} emojis removed)")
        else:
            print(f"FOUND: {file_path} ({emoji_count} emojis)")
        
        return emoji_count, True
    
    except Exception as e:
        print(f"ERROR processing {file_path}: {e}")
        return 0, False

def scan_directory(root_dir: Path, dry_run: bool = True) -> dict:
    """
    Scan directory for emojis
    Returns statistics
    """
    stats = {
        'total_files_scanned': 0,
        'files_with_emojis': 0,
        'total_emojis': 0,
        'files_modified': []
    }
    
    for file_path in root_dir.rglob('*'):
        if file_path.is_file() and should_process_file(file_path):
            stats['total_files_scanned'] += 1
            emoji_count, was_modified = process_file(file_path, dry_run)
            
            if was_modified:
                stats['files_with_emojis'] += 1
                stats['total_emojis'] += emoji_count
                stats['files_modified'].append({
                    'path': str(file_path.relative_to(root_dir)),
                    'emoji_count': emoji_count
                })
    
    return stats

def main():
    print("=" * 60)
    print("AUREUS.AFRICA EMOJI REMOVAL TOOL")
    print("=" * 60)
    print()
    
    # Get repository path
    repo_path = Path(input("Enter path to aureus_africa repository: ").strip())
    
    if not repo_path.exists():
        print(f"ERROR: Path {repo_path} does not exist")
        return
    
    print(f"\nScanning: {repo_path}")
    print()
    
    # DRY RUN FIRST
    print("Step 1: DRY RUN (no changes)")
    print("-" * 60)
    stats_dry = scan_directory(repo_path, dry_run=True)
    
    print()
    print("DRY RUN RESULTS:")
    print(f"  Files scanned: {stats_dry['total_files_scanned']}")
    print(f"  Files with emojis: {stats_dry['files_with_emojis']}")
    print(f"  Total emojis found: {stats_dry['total_emojis']}")
    print()
    
    if stats_dry['files_with_emojis'] == 0:
        print("No emojis found. Nothing to do.")
        return
    
    # Confirm before proceeding
    print()
    proceed = input(f"Remove {stats_dry['total_emojis']} emojis from {stats_dry['files_with_emojis']} files? (yes/no): ").strip().lower()
    
    if proceed != 'yes':
        print("Operation cancelled.")
        return
    
    # ACTUAL REMOVAL
    print()
    print("Step 2: REMOVING EMOJIS (with backups)")
    print("-" * 60)
    stats_real = scan_directory(repo_path, dry_run=False)
    
    print()
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Removed {stats_real['total_emojis']} emojis from {stats_real['files_with_emojis']} files")
    print(f"Backup files created with .backup extension")
    print()
    print("Next steps:")
    print("  1. Test the application")
    print("  2. If everything works: delete .backup files")
    print("  3. If issues occur: restore from .backup files")

if __name__ == "__main__":
    main()
