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

def generate_differentiated_examples(korean_word, english_word, collection_type):
    """컬렉션별로 차별화된 예문 생성"""
    
    # 단어별 예문 패턴 매핑
    word_patterns = {
        "사과": {
            "concepts": ("사과는 맛있는 과일입니다.", "Apple is a delicious fruit."),
            "examples": ("오늘 점심에 사과를 먹었습니다.", "I ate an apple for lunch today."),
            "grammar": ("나는 빨간 사과를 선호합니다.", "I prefer red apples.")
        },
        "집": {
            "concepts": ("집은 사람이 사는 곳입니다.", "A house is where people live."),
            "examples": ("새로운 집으로 이사했습니다.", "We moved to a new house."),
            "grammar": ("그의 집은 학교 근처에 있습니다.", "His house is near the school.")
        },
        "학교": {
            "concepts": ("학교는 배움의 장소입니다.", "School is a place of learning."),
            "examples": ("매일 아침 학교에 갑니다.", "I go to school every morning."),
            "grammar": ("우리 학교는 매우 큽니다.", "Our school is very large.")
        },
        "친구": {
            "concepts": ("친구는 소중한 존재입니다.", "A friend is a precious person."),
            "examples": ("친구와 함께 영화를 봤습니다.", "I watched a movie with my friend."),
            "grammar": ("좋은 친구를 만나기는 어렵습니다.", "It's hard to meet good friends.")
        },
        "음식": {
            "concepts": ("음식은 생존에 필요합니다.", "Food is necessary for survival."),
            "examples": ("한국 음식을 좋아합니다.", "I like Korean food."),
            "grammar": ("맛있는 음식을 만들어 보세요.", "Try making delicious food.")
        },
        "자동차": {
            "concepts": ("자동차는 편리한 교통수단입니다.", "A car is a convenient means of transportation."),
            "examples": ("새 자동차를 구매했습니다.", "I bought a new car."),
            "grammar": ("그는 빨간 자동차를 운전합니다.", "He drives a red car.")
        },
        "책": {
            "concepts": ("책은 지식의 보고입니다.", "Books are treasures of knowledge."),
            "examples": ("도서관에서 책을 빌렸습니다.", "I borrowed a book from the library."),
            "grammar": ("이 책을 읽어 보세요.", "Please read this book.")
        },
        "나무": {
            "concepts": ("나무는 산소를 만듭니다.", "Trees produce oxygen."),
            "examples": ("공원에 큰 나무가 있습니다.", "There is a big tree in the park."),
            "grammar": ("저 나무는 100년 되었습니다.", "That tree is 100 years old.")
        }
    }
    
    # 기본 패턴 (단어별 패턴이 없는 경우)
    default_patterns = {
        "concepts": (f"{korean_word}는 중요한 개념입니다.", f"{english_word.capitalize()} is an important concept."),
        "examples": (f"오늘 {korean_word}에 대해 배웠습니다.", f"I learned about {english_word} today."),
        "grammar": (f"이 {korean_word}를 사용해 보세요.", f"Please use this {english_word}.")
    }
    
    # 해당 단어의 패턴이 있으면 사용, 없으면 기본 패턴 사용
    if korean_word in word_patterns:
        patterns = word_patterns[korean_word]
    else:
        patterns = default_patterns
    
    return patterns[collection_type]

def generate_random_templates():
    """랜덤 템플릿 데이터 생성"""
    print("🎲 랜덤 템플릿 생성 시작...")
    
    # 기본 설정
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    
    # 기존 concept_id 수집 (중복 방지용)
    existing_concept_ids = set()
    existing_word_meanings = set()  # 단어+의미 조합 추적
    list_files = ["concepts_template_list.csv", "examples_template_list.csv", "grammar_template_list.csv"]
    
    for file_name in list_files:
        file_path = data_dir / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        concept_id = row.get('concept_id')
                        if concept_id:
                            existing_concept_ids.add(concept_id)
                            
                            # concepts 파일에서 단어+의미 조합도 수집
                            if "concepts_template" in file_name:
                                english_word = row.get('english_word', '')
                                korean_word = row.get('korean_word', '')
                                if english_word and korean_word:
                                    parts = concept_id.split('_')
                                    meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                                    en_combination = f"{english_word}_{meaning}"
                                    ko_combination = f"{korean_word}_{meaning}"
                                    existing_word_meanings.add(en_combination)
                                    existing_word_meanings.add(ko_combination)
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 실패: {e}")
    
    print(f"🔍 기존 concept_id {len(existing_concept_ids)}개, 단어+의미 조합 {len(existing_word_meanings)}개 발견")
    
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
    generated_concept_ids = set()  # 이번 생성에서 concept_id 중복 방지
    generated_word_meanings = set()  # 이번 생성에서 단어+의미 중복 방지
    
    for i in range(5):
        max_attempts = 20  # 중복 시 최대 재시도 횟수 증가
        attempt = 0
        
        while attempt < max_attempts:
            domain = random.choice(list(domains.keys()))
            category = random.choice(domains[domain])
            
            # 단어와 의미 매핑 정의 (영어 단어 기준)
            word_meaning_map = {
                "apple": "fruit",
                "book": "knowledge", 
                "car": "transport",
                "house": "shelter",
                "tree": "nature"
            }
            
            korean_word_map = {
                "apple": "사과",
                "book": "책",
                "car": "자동차", 
                "house": "집",
                "tree": "나무"
            }
            
            english_word = random.choice(["apple", "book", "car", "house", "tree"])
            korean_word = korean_word_map[english_word]
            meaning = word_meaning_map[english_word]
            
            # 올바른 형식: {domain}_{word}_{meaning}
            concept_id = f"{domain}_{english_word}_{meaning}"
            
            # 단어+의미 조합
            en_combination = f"{english_word}_{meaning}"
            ko_combination = f"{korean_word}_{meaning}"
            
            # 중복 검사: concept_id + 단어+의미 조합
            if (concept_id not in existing_concept_ids and 
                concept_id not in generated_concept_ids and
                en_combination not in existing_word_meanings and
                ko_combination not in existing_word_meanings and
                en_combination not in generated_word_meanings and
                ko_combination not in generated_word_meanings):
                
                generated_concept_ids.add(concept_id)
                generated_word_meanings.add(en_combination)
                generated_word_meanings.add(ko_combination)
                break
            else:
                if concept_id in existing_concept_ids or concept_id in generated_concept_ids:
                    print(f"⚠️ concept_id 중복: {concept_id} (재시도 {attempt + 1}/{max_attempts})")
                else:
                    print(f"⚠️ 단어+의미 중복: {en_combination} (재시도 {attempt + 1}/{max_attempts})")
                attempt += 1
        
        if attempt >= max_attempts:
            print(f"❌ concept_id 생성 실패: 최대 재시도 횟수 초과 (시도한 조합: {domain}_{english_word}_{meaning})")
            continue
        
        # 차별화된 예문 생성
        concept_examples = generate_differentiated_examples(korean_word, english_word, "concepts")
        example_examples = generate_differentiated_examples(korean_word, english_word, "examples")
        grammar_examples = generate_differentiated_examples(korean_word, english_word, "grammar")
        
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
            "korean_word": korean_word,
            "english_word": english_word,
            # 예문 차별화: Concepts = 기본 의미 표현
            "korean_example": concept_examples[0],
            "english_example": concept_examples[1]
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
            # 예문 차별화: Examples = 실제 상황 사용
            "korean": example_examples[0],
            "english": example_examples[1],
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
            # 예문 차별화: Grammar = 문법 패턴 설명
            "korean_example": grammar_examples[0],
            "english_title": "Grammar Pattern",
            "english_structure": "S + V + O",
            "english_description": "Basic grammar explanation",
            "english_example": grammar_examples[1],
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
            # 차별화된 예문 유지 (덮어쓰지 않음)
            "korean": example["korean"],
            "english": example["english"],
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
            # 차별화된 예문 유지 (덮어쓰지 않음)
            "korean_example": grammar["korean_example"],
            
            # 영어 패턴 (4개 필드)
            "english_title": f"Using {grammar['english_word']}",
            "english_structure": f"Subject + verb + {grammar['english_word']}",
            "english_description": f"Grammar pattern for using {grammar['english_word']}",
            # 차별화된 예문 유지 (덮어쓰지 않음)
            "english_example": grammar["english_example"],
            
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
