#!/bin/bash

# Function to update meta tags for a single HTML file
update_meta_tags() {
    local file_path="$1"
    local lang_code="$2"
    local page_name="$3"
    
    if [[ ! -f "$file_path" ]]; then
        echo "⚠️  File $file_path does not exist, skipping..."
        return 1
    fi
    
    echo "🔄 Processing $file_path..."
    
    # Create backup
    cp "$file_path" "$file_path.backup"
    
    # Extract title and description
    local title=$(grep -o '<title[^>]*>[^<]*</title>' "$file_path" | sed 's/<[^>]*>//g' | head -1)
    local description=$(grep -o 'name="description"[^>]*content="[^"]*"' "$file_path" | sed 's/.*content="//; s/".*//' | head -1)
    
    # Use default values if extraction fails
    [[ -z "$title" ]] && title="LikeVoca"
    [[ -z "$description" ]] && description="LikeVoca - 다국어 학습 플랫폼"
    
    # Create temp file with complete meta tags
    local temp_file=$(mktemp)
    
    # Find the line number where keywords meta tag ends
    local keywords_line=$(grep -n 'name="keywords"' "$file_path" | cut -d: -f1 | head -1)
    
    if [[ -z "$keywords_line" ]]; then
        echo "❌ Could not find keywords meta tag in $file_path"
        rm "$temp_file"
        return 1
    fi
    
    # Create new meta tags block
cat > "$temp_file" << EOF

  <!-- 첫 번째 Open Graph 섹션 -->
  <meta property="og:title" content="$title" />
  <meta property="og:description" content="$description" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.likevoca.com/$lang_code/$page_name" />
  <meta property="og:locale" content="$lang_code" />
  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />

  <!-- Twitter Card 섹션 -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="$title" />
  <meta name="twitter:description" content="$description" />
  <meta name="twitter:image" content="https://www.likevoca.com/assets/hero.webp" />
  <meta name="twitter:image:alt" content="$title" />

  <!-- 두 번째 Open Graph 섹션 (상세) -->
  <meta property="og:title" content="$title" />
  <meta property="og:description" content="$description" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.likevoca.com/$lang_code/$page_name" />
  <meta property="og:site_name" content="LikeVoca" />
  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="$title" />
EOF
    
    # Remove existing og: and twitter: meta tags and social media comments
    sed -i '
        /<!--.*Open Graph.*-->/Id
        /<!--.*Twitter.*-->/Id
        /<!--.*소셜 미디어.*-->/Id
        /<meta.*property="og:/Id
        /<meta.*name="twitter:/Id
    ' "$file_path"
    
    # Insert new meta tags after keywords line
    {
        head -n "$keywords_line" "$file_path"
        cat "$temp_file"
        tail -n +$((keywords_line + 1)) "$file_path"
    } > "$file_path.new"
    
    mv "$file_path.new" "$file_path"
    rm "$temp_file"
    
    echo "✅ Updated $file_path"
    return 0
}

# Process Korean files
echo "📂 Processing Korean (ko) files..."
update_meta_tags "./locales/ko/progress.html" "ko" "progress.html"
update_meta_tags "./locales/ko/inquiry.html" "ko" "inquiry.html"
update_meta_tags "./locales/ko/profile.html" "ko" "profile.html"
update_meta_tags "./locales/ko/login.html" "ko" "login.html"
update_meta_tags "./locales/ko/forgotpassword.html" "ko" "forgotpassword.html"
update_meta_tags "./locales/ko/privacy.html" "ko" "privacy.html"
update_meta_tags "./locales/ko/signup.html" "ko" "signup.html"
update_meta_tags "./locales/ko/terms.html" "ko" "terms.html"
update_meta_tags "./locales/ko/about.html" "ko" "about.html"
update_meta_tags "./locales/ko/faq.html" "ko" "faq.html"
update_meta_tags "./locales/ko/manual.html" "ko" "manual.html"
update_meta_tags "./locales/ko/guide.html" "ko" "guide.html"
update_meta_tags "./locales/ko/community-backup.html" "ko" "community-backup.html"

echo "🎉 Korean files completed!"