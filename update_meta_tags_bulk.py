#!/usr/bin/env python3
"""
Script to update meta tags for all required HTML pages across language folders
"""

import os
import re
from pathlib import Path

# Define language mappings
LANG_MAPPING = {
    'ko': 'ko',
    'en': 'en',
    'ja': 'ja', 
    'zh': 'zh',
    'es': 'es'
}

# Pages that need meta tag updates
PAGES_TO_UPDATE = [
    'my-word-list.html',
    'progress.html', 
    'inquiry.html',
    'profile.html',
    'login.html',
    'forgotpassword.html',
    'privacy.html',
    'signup.html',
    'terms.html',
    'about.html',
    'faq.html',
    'manual.html',
    'guide.html',
    'community-backup.html',  # Korean only
    'info.html',  # Spanish only
    'quiz_backup.html'  # Chinese only
]

def extract_title_and_description(file_path):
    """Extract existing title and description from HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        title = title_match.group(1).strip() if title_match else "LikeVoca"
        
        # Extract description from meta description tag
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', content, re.IGNORECASE)
        description = desc_match.group(1).strip() if desc_match else "LikeVoca - 다국어 학습 플랫폼"
        
        return title, description
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return "LikeVoca", "LikeVoca - 다국어 학습 플랫폼"

def create_meta_tags_template(title, description, lang_code, page_name):
    """Create complete meta tags template"""
    return f"""  <!-- 첫 번째 Open Graph 섹션 -->
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.likevoca.com/{lang_code}/{page_name}" />
  <meta property="og:locale" content="{lang_code}" />
  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />

  <!-- Twitter Card 섹션 -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="https://www.likevoca.com/assets/hero.webp" />
  <meta name="twitter:image:alt" content="{title}" />

  <!-- 두 번째 Open Graph 섹션 (상세) -->
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.likevoca.com/{lang_code}/{page_name}" />
  <meta property="og:site_name" content="LikeVoca" />
  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{title}" />"""

def update_meta_tags(file_path, lang_code, page_name):
    """Update meta tags in HTML file"""
    try:
        # Create backup
        backup_path = f"{file_path}.backup"
        if not os.path.exists(backup_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                backup_content = f.read()
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(backup_content)
        
        # Read original file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract existing title and description
        title, description = extract_title_and_description(file_path)
        
        # Create new meta tags
        new_meta_tags = create_meta_tags_template(title, description, lang_code, page_name)
        
        # Remove existing incomplete Open Graph and Twitter Card tags
        # Find the position after keywords meta tag
        keywords_pattern = r'(<meta\s+name=["\']keywords["\'][^>]*>)'
        keywords_match = re.search(keywords_pattern, content, re.IGNORECASE)
        
        if not keywords_match:
            print(f"Warning: Could not find keywords meta tag in {file_path}")
            return False
            
        # Find where the new meta tags should be inserted
        insert_pos = keywords_match.end()
        
        # Remove existing og: and twitter: meta tags
        content = re.sub(r'\s*<!--[^>]*Open Graph[^>]*-->\s*', '', content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r'\s*<!--[^>]*Twitter[^>]*-->\s*', '', content, flags=re.IGNORECASE | re.DOTALL) 
        content = re.sub(r'\s*<!--[^>]*소셜 미디어[^>]*-->\s*', '', content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r'\s*<meta\s+property=["\']og:[^"\']*["\'][^>]*>\s*', '', content, flags=re.IGNORECASE)
        content = re.sub(r'\s*<meta\s+name=["\']twitter:[^"\']*["\'][^>]*>\s*', '', content, flags=re.IGNORECASE)
        
        # Re-find the keywords position after cleaning
        keywords_match = re.search(keywords_pattern, content, re.IGNORECASE)
        if keywords_match:
            insert_pos = keywords_match.end()
            # Insert new meta tags
            new_content = content[:insert_pos] + '\n\n' + new_meta_tags + '\n' + content[insert_pos:]
        else:
            print(f"Warning: Could not re-locate keywords meta tag in {file_path}")
            return False
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False

def main():
    """Main function to update all required pages"""
    base_dir = Path('./locales')
    updated_count = 0
    total_count = 0
    
    for lang_code in LANG_MAPPING.keys():
        lang_dir = base_dir / lang_code
        if not lang_dir.exists():
            print(f"Warning: Language directory {lang_dir} does not exist")
            continue
        
        print(f"\n📂 Processing {lang_code.upper()} language folder...")
        
        for page_name in PAGES_TO_UPDATE:
            # Special cases for specific languages
            if page_name == 'community-backup.html' and lang_code != 'ko':
                continue
            if page_name == 'info.html' and lang_code != 'es':
                continue  
            if page_name == 'quiz_backup.html' and lang_code != 'zh':
                continue
            
            file_path = lang_dir / page_name
            if file_path.exists():
                total_count += 1
                if update_meta_tags(str(file_path), lang_code, page_name):
                    updated_count += 1
            else:
                print(f"⚠️  {file_path} does not exist, skipping...")
    
    print(f"\n🎉 Completed! Updated {updated_count} out of {total_count} files.")

if __name__ == "__main__":
    main()