#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Templates - 새로운 랜덤 템플릿 생성
현재 4단계 워크플로우: generate.py → validate.py → accumulator.py → backup.py/restore.py
"""

import random
import csv
from pathlib import Path
import datetime
import json

def generate_random_templates():
    """랜덤 템플릿 데이터 생성"""
    print("🎲 랜덤 템플릿 생성 시작...")
    
    # 기본 설정
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    
    # 도메인과 카테고리 매핑
    domains = {
        "daily": ["routine", "family", "communication"],
        "food": ["fruit", "vegetable", "drink"],
        "travel": ["transportation", "accommodation", "sightseeing"],
        "health": ["medicine", "body", "fitness"],
        "nature": ["animal", "plant", "weather"],
        "shopping": ["store", "product", "payment"]
    }
    
    # 랜덤 데이터 생성
    concepts_data = []
    examples_data = []
    grammar_data = []
    
    # 5개 랜덤 concept 생성
    for i in range(5):
        domain = random.choice(list(domains.keys()))
        category = random.choice(domains[domain])
        concept_id = f"{domain}_{random.choice(['apple', 'book', 'car', 'house', 'tree'])}_{random.choice(['basic', 'simple', 'common'])}"
        
        # Concepts 데이터
        concept = {
            "concept_id": concept_id,
            "domain": domain,
            "category": category,
            "difficulty": random.choice(["basic", "intermediate", "advanced"]),
            "emoji": random.choice(["🍎", "📚", "🚗", "🏠", "🌳"]),
            "color": random.choice(["#FF5722", "#4CAF50", "#2196F3", "#FF9800"]),
            "situation": "formal",
            "purpose": random.choice(["description", "question", "greeting"]),
            "korean_word": random.choice(["사과", "책", "자동차", "집", "나무"]),
            "english_word": random.choice(["apple", "book", "car", "house", "tree"]),
            "korean_example": "예문입니다.",
            "english_example": "This is an example."
        }
        concepts_data.append(concept)
        
        # Examples 데이터
        example = {
            "concept_id": concept_id,
            "domain": domain,
            "category": category,
            "difficulty": concept["difficulty"],
            "situation": "formal",
            "purpose": concept["purpose"],
            "korean": "이것은 예문입니다.",
            "english": "This is an example sentence.",
            "korean_word": concept["korean_word"],
            "english_word": concept["english_word"]
        }
        examples_data.append(example)
        
        # Grammar 데이터
        grammar = {
            "concept_id": concept_id,
            "domain": domain,
            "category": category,
            "difficulty": concept["difficulty"],
            "situation": "formal",
            "purpose": concept["purpose"],
            "korean_title": "문법 패턴",
            "korean_structure": "N + V",
            "korean_description": "기본 문법 설명",
            "korean_example": "문법 예문입니다.",
            "english_title": "Grammar Pattern",
            "english_structure": "S + V + O",
            "english_description": "Basic grammar explanation",
            "english_example": "This is a grammar example.",
            "korean_word": concept["korean_word"],
            "english_word": concept["english_word"]
        }
        grammar_data.append(grammar)
    
    # CSV 파일 저장
    save_csv_templates(data_dir, concepts_data, examples_data, grammar_data)
    print(f"✅ 랜덤 템플릿 생성 완료: {len(concepts_data)}개 concept")

def save_csv_templates(data_dir, concepts_data, examples_data, grammar_data):
    """CSV 파일로 템플릿 저장 (58개 필드 완전 구조)"""
    
    # 정확한 58개 필드 순서 (통합_데이터_가이드.md 기준)
    concepts_header = [
        'concept_id','domain','category','difficulty','emoji','color','situation','purpose',
        'korean_word','korean_pronunciation','korean_definition','korean_pos','korean_synonyms','korean_antonyms','korean_word_family','korean_compound_words','korean_collocations',
        'english_word','english_pronunciation','english_definition','english_pos','english_synonyms','english_antonyms','english_word_family','english_compound_words','english_collocations',
        'chinese_word','chinese_pronunciation','chinese_definition','chinese_pos','chinese_synonyms','chinese_antonyms','chinese_word_family','chinese_compound_words','chinese_collocations',
        'japanese_word','japanese_pronunciation','japanese_definition','japanese_pos','japanese_synonyms','japanese_antonyms','japanese_word_family','japanese_compound_words','japanese_collocations',
        'spanish_word','spanish_pronunciation','spanish_definition','spanish_pos','spanish_synonyms','spanish_antonyms','spanish_word_family','spanish_compound_words','spanish_collocations',
        'korean_example','english_example','chinese_example','japanese_example','spanish_example'
    ]
    
    # Examples CSV 헤더 (16개 필드)
    examples_header = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean", "english", "japanese", "chinese", "spanish",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]
    
    # Grammar CSV 헤더 (31개 필드)
    grammar_header = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean_title", "korean_structure", "korean_description", "korean_example",
        "english_title", "english_structure", "english_description", "english_example",
        "japanese_title", "japanese_structure", "japanese_description", "japanese_example",
        "chinese_title", "chinese_structure", "chinese_description", "chinese_example",
        "spanish_title", "spanish_structure", "spanish_description", "spanish_example",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]
    
    # Concepts 데이터를 58개 필드로 확장
    expanded_concepts_data = []
    for concept in concepts_data:
        expanded_concept = {
            # 기본 정보 (8개)
            'concept_id': concept['concept_id'],
            'domain': concept['domain'],
            'category': concept['category'],
            'difficulty': concept['difficulty'],
            'emoji': concept.get('emoji', '📚'),
            'color': concept.get('color', '#4CAF50'),
            'situation': concept['situation'],
            'purpose': concept['purpose'],
            
            # 한국어 (9개 필드)
            'korean_word': concept['korean_word'],
            'korean_pronunciation': f"{concept['korean_word']}-pronunciation",
            'korean_definition': f"{concept['korean_word']} 정의",
            'korean_pos': '명사',
            'korean_synonyms': f"{concept['korean_word']}류,관련어",
            'korean_antonyms': f"비{concept['korean_word']},반대말",
            'korean_word_family': f"{concept['korean_word']}족,{concept['korean_word']}계열",
            'korean_compound_words': f"{concept['korean_word']}나무,{concept['korean_word']}즙",
            'korean_collocations': f"{concept['korean_word']}을 먹다,{concept['korean_word']}을 사다",
            
            # 영어 (9개 필드)
            'english_word': concept['english_word'],
            'english_pronunciation': f"/{concept['english_word']}/",
            'english_definition': f"{concept['english_word']} definition",
            'english_pos': 'noun',
            'english_synonyms': f"{concept['english_word']} type,related item",
            'english_antonyms': f"non-{concept['english_word']},opposite",
            'english_word_family': f"{concept['english_word']} family,{concept['english_word']} group",
            'english_compound_words': f"{concept['english_word']} tree,{concept['english_word']} juice",
            'english_collocations': f"eat {concept['english_word']},buy {concept['english_word']}",
            
            # 중국어 (9개 필드)
            'chinese_word': f"{concept['korean_word']}_中文",
            'chinese_pronunciation': f"{concept['korean_word']}_pinyin",
            'chinese_definition': f"{concept['korean_word']} 中文定义",
            'chinese_pos': '名词',
            'chinese_synonyms': f"{concept['korean_word']}_中文类,相关词",
            'chinese_antonyms': f"非{concept['korean_word']}_中文,反义词",
            'chinese_word_family': f"{concept['korean_word']}_中文族,{concept['korean_word']}_中文系列",
            'chinese_compound_words': f"{concept['korean_word']}_中文树,{concept['korean_word']}_中文汁",
            'chinese_collocations': f"吃{concept['korean_word']}_中文,买{concept['korean_word']}_中文",
            
            # 일본어 (9개 필드)
            'japanese_word': f"{concept['korean_word']}_日本語",
            'japanese_pronunciation': f"{concept['korean_word']}_hiragana",
            'japanese_definition': f"{concept['korean_word']} 日本語定義",
            'japanese_pos': '名詞',
            'japanese_synonyms': f"{concept['korean_word']}_日本語類,関連語",
            'japanese_antonyms': f"非{concept['korean_word']}_日本語,反対語",
            'japanese_word_family': f"{concept['korean_word']}_日本語族,{concept['korean_word']}_日本語系列",
            'japanese_compound_words': f"{concept['korean_word']}_日本語の木,{concept['korean_word']}_日本語ジュース",
            'japanese_collocations': f"{concept['korean_word']}_日本語を食べる,{concept['korean_word']}_日本語を買う",
            
            # 스페인어 (9개 필드)
            'spanish_word': f"{concept['korean_word']}_español",
            'spanish_pronunciation': f"{concept['korean_word']}_español_pronunciation",
            'spanish_definition': f"{concept['korean_word']} definición español",
            'spanish_pos': 'sustantivo',
            'spanish_synonyms': f"{concept['korean_word']}_español tipo,artículo relacionado",
            'spanish_antonyms': f"no {concept['korean_word']}_español,opuesto",
            'spanish_word_family': f"familia {concept['korean_word']}_español,grupo {concept['korean_word']}_español",
            'spanish_compound_words': f"árbol de {concept['korean_word']}_español,jugo de {concept['korean_word']}_español",
            'spanish_collocations': f"comer {concept['korean_word']}_español,comprar {concept['korean_word']}_español",
            
            # 대표 예문 (5개 필드)
            'korean_example': concept.get('korean_example', f"{concept['korean_word']}를 사용해요"),
            'english_example': concept.get('english_example', f"I use {concept['english_word']}"),
            'chinese_example': f"我使用{concept['korean_word']}_中文",
            'japanese_example': f"{concept['korean_word']}_日本語を使います",
            'spanish_example': f"Uso {concept['korean_word']}_español"
        }
        expanded_concepts_data.append(expanded_concept)
    
    # Examples 데이터를 16개 필드로 확장
    expanded_examples_data = []
    for example in examples_data:
        expanded_example = {
            "concept_id": example["concept_id"],
            "domain": example["domain"],
            "category": example["category"],
            "difficulty": example["difficulty"],
            "situation": example["situation"],
            "purpose": example["purpose"],
            "korean": f"{example['korean_word']}에 대해 이야기해요",
            "english": f"Let's talk about {example['english_word']}",
            "japanese": f"{example['korean_word']}_日本語について話しましょう",
            "chinese": f"我们来谈论{example['korean_word']}_中文",
            "spanish": f"Hablemos sobre {example['korean_word']}_español",
            "korean_word": example["korean_word"],
            "english_word": example["english_word"],
            "japanese_word": f"{example['korean_word']}_日本語",
            "chinese_word": f"{example['korean_word']}_中文",
            "spanish_word": f"{example['korean_word']}_español"
        }
        expanded_examples_data.append(expanded_example)
    
    # Grammar 데이터를 31개 필드로 확장
    expanded_grammar_data = []
    for grammar in grammar_data:
        expanded_grammar = {
            "concept_id": grammar["concept_id"],
            "domain": grammar["domain"],
            "category": grammar["category"],
            "difficulty": grammar["difficulty"],
            "situation": grammar["situation"],
            "purpose": grammar["purpose"],
            
            # 한국어 패턴 (4개 필드)
            "korean_title": f"{grammar['korean_word']} 사용법",
            "korean_structure": f"{grammar['korean_word']} + 를/을",
            "korean_description": f"{grammar['korean_word']}를 사용하는 문법 패턴",
            "korean_example": f"저는 {grammar['korean_word']}를 좋아해요",
            
            # 영어 패턴 (4개 필드)
            "english_title": f"Using {grammar['english_word']}",
            "english_structure": f"Subject + verb + {grammar['english_word']}",
            "english_description": f"Grammar pattern for using {grammar['english_word']}",
            "english_example": f"I like {grammar['english_word']}",
            
            # 일본어 패턴 (4개 필드)
            "japanese_title": f"{grammar['korean_word']}_日本語の使い方",
            "japanese_structure": f"{grammar['korean_word']}_日本語 + を",
            "japanese_description": f"{grammar['korean_word']}_日本語を使う文法パターン",
            "japanese_example": f"私は{grammar['korean_word']}_日本語が好きです",
            
            # 중국어 패턴 (4개 필드)
            "chinese_title": f"{grammar['korean_word']}_中文的用法",
            "chinese_structure": f"主语 + 动词 + {grammar['korean_word']}_中文",
            "chinese_description": f"使用{grammar['korean_word']}_中文的语法模式",
            "chinese_example": f"我喜欢{grammar['korean_word']}_中文",
            
            # 스페인어 패턴 (4개 필드)
            "spanish_title": f"Uso de {grammar['korean_word']}_español",
            "spanish_structure": f"Sujeto + verbo + {grammar['korean_word']}_español",
            "spanish_description": f"Patrón gramatical para usar {grammar['korean_word']}_español",
            "spanish_example": f"Me gusta {grammar['korean_word']}_español",
            
            # 핵심 단어 (5개 필드)
            "korean_word": grammar["korean_word"],
            "english_word": grammar["english_word"],
            "japanese_word": f"{grammar['korean_word']}_日本語",
            "chinese_word": f"{grammar['korean_word']}_中文",
            "spanish_word": f"{grammar['korean_word']}_español"
        }
        expanded_grammar_data.append(expanded_grammar)
    
    # CSV 파일 작성
    files = [
        ("concepts_template_add.csv", concepts_header, expanded_concepts_data),
        ("examples_template_add.csv", examples_header, expanded_examples_data),
        ("grammar_template_add.csv", grammar_header, expanded_grammar_data)
    ]
    
    for filename, header, data in files:
        filepath = data_dir / filename
        with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(data)
        print(f"📄 {filename} 생성 완료 ({len(header)}개 필드, {len(data)}개 레코드)")

    print(f"\n🎉 완전한 템플릿 생성 완료!")
    print(f"📊 Concepts: 58개 필드, Examples: 16개 필드, Grammar: 31개 필드")

if __name__ == "__main__":
    generate_random_templates()
    print("\n💡 다음 단계:")
    print("   1. python validate.py     # 중복 검증")
    print("   2. python accumulator.py  # 데이터 누적")
    print("   3. python backup.py       # 백업 생성")
