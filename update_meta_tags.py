#!/usr/bin/env python3
import os
import re
from pathlib import Path

def update_meta_tags(file_path, lang_code, page_name):
    """Update meta tags in HTML files"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except:
        print(f"Error reading file: {file_path}")
        return False
    
    # Define language-specific titles based on patterns found
    titles = {
        'ko': {
            'vocabulary': 'LikeVoca - 스마트 단어장으로 체계적 학습',
            'community': 'LikeVoca 커뮤니티 - 학습 가이드, FAQ, 매뉴얼',
            'learning': 'LikeVoca - 통합 언어 학습 시스템',
            'ai-vocabulary': 'LikeVoca - AI 맞춤형 단어장 생성',
            'games': 'LikeVoca - 게임으로 언어 마스터하기',
            'quiz': 'LikeVoca - 퀴즈로 단어 마스터하기'
        },
        'en': {
            'vocabulary': 'LikeVoca - Smart Vocabulary Management',
            'community': 'LikeVoca Community - Learning Guides, FAQ, Manual',
            'learning': 'LikeVoca - Integrated Language Learning System',
            'ai-vocabulary': 'LikeVoca - AI Customized Vocabulary Generation',
            'games': 'LikeVoca - Master Languages with Games',
            'quiz': 'LikeVoca - Master Words with Quizzes'
        },
        'ja': {
            'vocabulary': 'LikeVoca - スマート単語帳管理',
            'community': 'LikeVocaコミュニティ - 学習ガイド、FAQ、マニュアル',
            'learning': 'LikeVoca - 統合言語学習システム',
            'ai-vocabulary': 'LikeVoca - AI カスタマイズ単語帳生成',
            'games': 'LikeVoca - ゲームで言語をマスター',
            'quiz': 'LikeVoca - クイズで単語をマスターしよう'
        },
        'zh': {
            'vocabulary': 'LikeVoca - 智能单词本管理',
            'community': 'LikeVoca社区 - 学习指南、FAQ、手册',
            'learning': 'LikeVoca - 综合语言学习系统',
            'ai-vocabulary': 'LikeVoca - AI定制单词本生成',
            'games': 'LikeVoca - 通过游戏掌握语言',
            'quiz': 'LikeVoca - 通过测验掌握单词'
        },
        'es': {
            'vocabulary': 'LikeVoca - Gestión Inteligente de Vocabulario',
            'community': 'LikeVoca Comunidad - Guías de Aprendizaje, FAQ, Manual',
            'learning': 'LikeVoca - Sistema Integrado de Aprendizaje de Idiomas',
            'ai-vocabulary': 'LikeVoca - Generación Personalizada de Vocabulario con IA',
            'games': 'LikeVoca - Domina Idiomas con Juegos',
            'quiz': 'LikeVoca - Domina Palabras con Cuestionarios'
        }
    }
    
    title = titles.get(lang_code, {}).get(page_name, f'LikeVoca - {page_name.title()}')
    
    # Update og:url to include www and .html
    content = re.sub(
        r'<meta property="og:url" content="https://likevoca\.com/([^"]+)"',
        rf'<meta property="og:url" content="https://www.likevoca.com/\1.html"',
        content
    )
    
    # Add og:image if missing
    if 'og:image' not in content:
        og_image_pattern = r'(<meta property="og:locale"[^>]*>)'
        og_image_replacement = r'\1\n  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />'
        content = re.sub(og_image_pattern, og_image_replacement, content)
    else:
        # Update existing og:image URL
        content = re.sub(
            r'<meta property="og:image" content="https://likevoca\.com/assets/hero\.(jpeg|jpg)"',
            r'<meta property="og:image" content="https://www.likevoca.com/assets/hero.webp"',
            content
        )
    
    # Add Twitter Card image alt if missing
    if 'twitter:image:alt' not in content:
        twitter_image_pattern = r'(<meta name="twitter:image" content="[^"]*"[^>]*>)'
        twitter_image_alt_replacement = rf'\1\n  <meta name="twitter:image:alt" content="{title}" />'
        content = re.sub(twitter_image_pattern, twitter_image_alt_replacement, content)
    
    # Update Twitter image URL
    content = re.sub(
        r'<meta name="twitter:image" content="https://likevoca\.com/assets/hero\.(jpeg|jpg)"',
        r'<meta name="twitter:image" content="https://www.likevoca.com/assets/hero.webp"',
        content
    )
    
    # Add second Open Graph section if missing
    if content.count('<!-- 추가 Open Graph 태그 -->') == 0 and content.count('<!-- Open Graph 태그 -->') < 2:
        twitter_section_pattern = r'(<meta name="twitter:image:alt"[^>]*>\s*)'
        
        additional_og = f'''
  
  <!-- 추가 Open Graph 태그 -->
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="..." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.likevoca.com/{lang_code}/{page_name}.html" />
  <meta property="og:site_name" content="LikeVoca" />
  <meta property="og:image" content="https://www.likevoca.com/assets/hero.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{title}" />'''
        
        content = re.sub(twitter_section_pattern, rf'\1{additional_og}', content)
    
    # Update canonical links
    content = re.sub(
        r'<link rel="canonical" href="https://likevoca\.com/([^"]+)"',
        rf'<link rel="canonical" href="https://likevoca.com/\1.html"',
        content
    )
    
    # Update hreflang links
    content = re.sub(
        r'<link rel="alternate" hreflang="([^"]+)" href="https://likevoca\.com/([^"]+)"',
        rf'<link rel="alternate" hreflang="\1" href="https://likevoca.com/\2.html"',
        content
    )
    
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated: {file_path}")
        return True
    except:
        print(f"Error writing file: {file_path}")
        return False

def main():
    """Main function to update all remaining files"""
    base_path = Path("C:/practice/likevoca/locales")
    
    # Files to update (lang_code, page_name)
    files_to_update = [
        # Japanese files (remaining)
        ('ja', 'learning'),
        ('ja', 'ai-vocabulary'),
        ('ja', 'games'),
        ('ja', 'quiz'),
        
        # Chinese files
        ('zh', 'vocabulary'),
        ('zh', 'community'),
        ('zh', 'learning'),
        ('zh', 'ai-vocabulary'),
        ('zh', 'games'),
        ('zh', 'quiz'),
        
        # Spanish files  
        ('es', 'vocabulary'),
        ('es', 'community'),
        ('es', 'learning'),
        ('es', 'ai-vocabulary'),
        ('es', 'games'),
        ('es', 'quiz'),
    ]
    
    for lang_code, page_name in files_to_update:
        file_path = base_path / lang_code / f"{page_name}.html"
        if file_path.exists():
            update_meta_tags(str(file_path), lang_code, page_name)
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()