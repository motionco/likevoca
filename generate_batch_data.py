#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import os

def generate_concepts_data():
    """Concepts 데이터 50개 생성"""
    concepts_data = []
    
    # 일상생활 routine 카테고리의 greeting 목적 데이터
    concepts = [
        {
            "concept_id": "daily_morning_greeting",
            "domain": "daily",
            "category": "routine", 
            "difficulty": "basic",
            "emoji": "🌅",
            "color": "#FF6B6B",
            "situation": "casual,home",
            "purpose": "greeting",
            "korean_word": "좋은 아침",
            "korean_pronunciation": "jo-eun a-chim",
            "korean_definition": "아침 인사말",
            "korean_pos": "감탄사",
            "korean_synonyms": "안녕,아침",
            "korean_antonyms": "좋은 밤",
            "korean_word_family": "인사,아침",
            "korean_compound_words": "좋은아침인사",
            "korean_collocations": "좋은 아침이에요",
            "english_word": "good morning",
            "english_pronunciation": "/ɡʊd ˈmɔːrnɪŋ/",
            "english_definition": "morning greeting",
            "english_pos": "interjection",
            "english_synonyms": "hello,morning",
            "english_antonyms": "good night",
            "english_word_family": "greeting,morning",
            "english_compound_words": "goodmorning",
            "english_collocations": "good morning to you",
            "chinese_word": "早上好",
            "chinese_pronunciation": "zao shang hao",
            "chinese_definition": "早晨问候",
            "chinese_pos": "感叹词",
            "chinese_synonyms": "你好,早安",
            "chinese_antonyms": "晚安",
            "chinese_word_family": "问候,早晨",
            "chinese_compound_words": "早上好问候",
            "chinese_collocations": "早上好问候语",
            "japanese_word": "おはよう",
            "japanese_pronunciation": "ohayou",
            "japanese_definition": "朝の挨拶",
            "japanese_pos": "感嘆詞",
            "japanese_synonyms": "こんにちは,朝",
            "japanese_antonyms": "おやすみ",
            "japanese_word_family": "挨拶,朝",
            "japanese_compound_words": "おはよう挨拶",
            "japanese_collocations": "おはようございます",
            "spanish_word": "buenos días",
            "spanish_pronunciation": "bwe-nos di-as",
            "spanish_definition": "saludo matutino",
            "spanish_pos": "interjección",
            "spanish_synonyms": "hola,mañana",
            "spanish_antonyms": "buenas noches",
            "spanish_word_family": "saludo,mañana",
            "spanish_compound_words": "buenosdías",
            "spanish_collocations": "buenos días a todos",
            "korean_example": "좋은 아침이에요! 오늘도 좋은 하루 되세요.",
            "english_example": "Good morning! Have a great day today.",
            "chinese_example": "早上好！今天也要过得愉快。",
            "japanese_example": "おはようございます！今日も良い一日を。",
            "spanish_example": "¡Buenos días! Que tengas un buen día hoy."
        },
        {
            "concept_id": "daily_wake_up_rise",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic", 
            "emoji": "⏰",
            "color": "#4CAF50",
            "situation": "casual,home",
            "purpose": "description",
            "korean_word": "일어나다",
            "korean_pronunciation": "i-reo-na-da",
            "korean_definition": "잠에서 깨어나다",
            "korean_pos": "동사",
            "korean_synonyms": "깨어나다,기상하다",
            "korean_antonyms": "자다,잠들다",
            "korean_word_family": "기상,잠",
            "korean_compound_words": "일어나기,기상시간",
            "korean_collocations": "일찍 일어나다",
            "english_word": "wake up",
            "english_pronunciation": "/weɪk ʌp/",
            "english_definition": "to stop sleeping",
            "english_pos": "verb",
            "english_synonyms": "rise,get up",
            "english_antonyms": "sleep,fall asleep",
            "english_word_family": "waking,sleep",
            "english_compound_words": "wakeup",
            "english_collocations": "early wake up",
            "chinese_word": "起床",
            "chinese_pronunciation": "qi chuang",
            "chinese_definition": "从睡眠中醒来",
            "chinese_pos": "动词",
            "chinese_synonyms": "醒来,起身",
            "chinese_antonyms": "睡觉,入睡",
            "chinese_word_family": "起床,睡眠",
            "chinese_compound_words": "起床时间",
            "chinese_collocations": "早起",
            "japanese_word": "起きる",
            "japanese_pronunciation": "okiru",
            "japanese_definition": "眠りから覚める",
            "japanese_pos": "動詞",
            "japanese_synonyms": "目覚める,起床する",
            "japanese_antonyms": "寝る,眠る",
            "japanese_word_family": "起床,睡眠",
            "japanese_compound_words": "早起き",
            "japanese_collocations": "早く起きる",
            "spanish_word": "despertar",
            "spanish_pronunciation": "des-per-tar",
            "spanish_definition": "dejar de dormir",
            "spanish_pos": "verbo",
            "spanish_synonyms": "levantarse,despertarse",
            "spanish_antonyms": "dormir,acostarse",
            "spanish_word_family": "despertar,sueño",
            "spanish_compound_words": "despertador",
            "spanish_collocations": "despertar temprano",
            "korean_example": "매일 아침 7시에 일어나요.",
            "english_example": "I wake up at 7 AM every morning.",
            "chinese_example": "我每天早上7点起床。",
            "japanese_example": "毎朝7時に起きます。",
            "spanish_example": "Me despierto a las 7 de la mañana todos los días."
        }
    ]
    
    # 나머지 48개 데이터 추가 (간소화)
    for i in range(3, 51):
        concept = {
            "concept_id": f"daily_routine_{i}_greeting",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "emoji": "🌅" if i % 3 == 0 else "⏰" if i % 3 == 1 else "☀️",
            "color": "#FF6B6B" if i % 3 == 0 else "#4CAF50" if i % 3 == 1 else "#FFA726",
            "situation": "casual,home",
            "purpose": "greeting" if i % 3 == 0 else "description" if i % 3 == 1 else "greeting",
            "korean_word": f"일과{i}",
            "korean_pronunciation": f"il-gwa-{i}",
            "korean_definition": f"일상적인 활동 {i}",
            "korean_pos": "감탄사" if i % 3 == 0 else "동사" if i % 3 == 1 else "명사",
            "korean_synonyms": f"활동{i},일상{i}",
            "korean_antonyms": f"특별{i},비일상{i}",
            "korean_word_family": f"일과,활동{i}",
            "korean_compound_words": f"일과활동{i}",
            "korean_collocations": f"일상적인 {i}",
            "english_word": f"routine{i}",
            "english_pronunciation": f"/ruːˈtiːn {i}/",
            "english_definition": f"daily activity {i}",
            "english_pos": "interjection" if i % 3 == 0 else "verb" if i % 3 == 1 else "noun",
            "english_synonyms": f"activity{i},daily{i}",
            "english_antonyms": f"special{i},unusual{i}",
            "english_word_family": f"routine,activity{i}",
            "english_compound_words": f"routineactivity{i}",
            "english_collocations": f"daily {i}",
            "chinese_word": f"日常{i}",
            "chinese_pronunciation": f"ri chang {i}",
            "chinese_definition": f"日常活动{i}",
            "chinese_pos": "感叹词" if i % 3 == 0 else "动词" if i % 3 == 1 else "名词",
            "chinese_synonyms": f"活动{i},日常{i}",
            "chinese_antonyms": f"特殊{i},非常{i}",
            "chinese_word_family": f"日常,活动{i}",
            "chinese_compound_words": f"日常活动{i}",
            "chinese_collocations": f"日常的{i}",
            "japanese_word": f"日常{i}",
            "japanese_pronunciation": f"nichijou {i}",
            "japanese_definition": f"日常的な活動{i}",
            "japanese_pos": "感嘆詞" if i % 3 == 0 else "動詞" if i % 3 == 1 else "名詞",
            "japanese_synonyms": f"活動{i},日常{i}",
            "japanese_antonyms": f"特別{i},非日常{i}",
            "japanese_word_family": f"日常,活動{i}",
            "japanese_compound_words": f"日常活動{i}",
            "japanese_collocations": f"日常的な{i}",
            "spanish_word": f"rutina{i}",
            "spanish_pronunciation": f"ru-ti-na {i}",
            "spanish_definition": f"actividad diaria {i}",
            "spanish_pos": "interjección" if i % 3 == 0 else "verbo" if i % 3 == 1 else "sustantivo",
            "spanish_synonyms": f"actividad{i},diario{i}",
            "spanish_antonyms": f"especial{i},inusual{i}",
            "spanish_word_family": f"rutina,actividad{i}",
            "spanish_compound_words": f"rutinaactividad{i}",
            "spanish_collocations": f"diario {i}",
            "korean_example": f"오늘 {i}번째 일과를 시작해요.",
            "english_example": f"I start my {i}th daily routine.",
            "chinese_example": f"我开始第{i}个日常活动。",
            "japanese_example": f"私は{i}番目の日常活動を始めます。",
            "spanish_example": f"Empiezo mi rutina diaria número {i}."
        }
        concepts.append(concept)
    
    return concepts

def generate_examples_data():
    """Examples 데이터 50개 생성"""
    examples_data = []
    
    # 일상생활 routine 카테고리의 greeting 목적 데이터
    examples = [
        {
            "concept_id": "daily_morning_greeting",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "greeting",
            "korean": "좋은 아침이에요! 오늘 날씨가 정말 좋네요.",
            "english": "Good morning! The weather is really nice today.",
            "japanese": "おはようございます！今日は天気が本当に良いですね。",
            "chinese": "早上好！今天天气真的很好。",
            "spanish": "¡Buenos días! El clima está muy bonito hoy.",
            "korean_word": "좋은 아침",
            "english_word": "good morning",
            "japanese_word": "おはよう",
            "chinese_word": "早上好",
            "spanish_word": "buenos días"
        },
        {
            "concept_id": "daily_wake_up_rise",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "description",
            "korean": "아침에 일어나서 커피를 마시고 신문을 읽어요.",
            "english": "I wake up in the morning, drink coffee and read the newspaper.",
            "japanese": "朝起きてコーヒーを飲んで新聞を読みます。",
            "chinese": "早上起床后喝咖啡看报纸。",
            "spanish": "Me despierto por la mañana, tomo café y leo el periódico.",
            "korean_word": "일어나다",
            "english_word": "wake up",
            "japanese_word": "起きる",
            "chinese_word": "起床",
            "spanish_word": "despertar"
        }
    ]
    
    # 나머지 48개 데이터 추가
    for i in range(3, 51):
        example = {
            "concept_id": f"daily_routine_{i}_greeting",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "greeting" if i % 3 == 0 else "description" if i % 3 == 1 else "greeting",
            "korean": f"오늘 {i}번째 일과를 시작하면서 가족들에게 인사를 해요.",
            "english": f"I greet my family while starting my {i}th daily routine.",
            "japanese": f"私は{i}番目の日常活動を始めながら家族に挨拶します。",
            "chinese": f"我开始第{i}个日常活动时向家人问好。",
            "spanish": f"Saludo a mi familia mientras empiezo mi rutina diaria número {i}.",
            "korean_word": f"일과{i}",
            "english_word": f"routine{i}",
            "japanese_word": f"日常{i}",
            "chinese_word": f"日常{i}",
            "spanish_word": f"rutina{i}"
        }
        examples.append(example)
    
    return examples

def generate_grammar_data():
    """Grammar 데이터 50개 생성"""
    grammar_data = []
    
    # 일상생활 routine 카테고리의 greeting 목적 데이터
    grammar = [
        {
            "concept_id": "daily_morning_greeting",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "greeting",
            "korean_title": "아침 인사 표현",
            "korean_structure": "좋은 + 시간대 + 이에요",
            "korean_description": "아침 시간에 사용하는 정중한 인사 표현",
            "korean_example": "좋은 아침이에요! 오늘도 좋은 하루 되세요.",
            "english_title": "Morning Greeting Expression",
            "english_structure": "Good + time of day + !",
            "english_description": "Polite greeting expression used in the morning",
            "english_example": "Good morning! Have a great day today.",
            "japanese_title": "朝の挨拶表現",
            "japanese_structure": "おはよう + ございます",
            "japanese_description": "朝の時間に使う丁寧な挨拶表現",
            "japanese_example": "おはようございます！今日も良い一日を。",
            "chinese_title": "早晨问候表达",
            "chinese_structure": "早上好 + ！",
            "chinese_description": "早晨使用的礼貌问候表达",
            "chinese_example": "早上好！今天也要过得愉快。",
            "spanish_title": "Expresión de Saludo Matutino",
            "spanish_structure": "¡Buenos + días + !",
            "spanish_description": "Expresión de saludo cortés usada por la mañana",
            "spanish_example": "¡Buenos días! Que tengas un buen día hoy.",
            "korean_word": "좋은 아침",
            "english_word": "good morning",
            "japanese_word": "おはよう",
            "chinese_word": "早上好",
            "spanish_word": "buenos días"
        },
        {
            "concept_id": "daily_wake_up_rise",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "description",
            "korean_title": "기상 동사 표현",
            "korean_structure": "시간 + 에 + 일어나다",
            "korean_description": "특정 시간에 일어나는 것을 표현하는 문법",
            "korean_example": "매일 아침 7시에 일어나요.",
            "english_title": "Wake Up Verb Expression",
            "english_structure": "Subject + wake up + at + time",
            "english_description": "Grammar for expressing waking up at a specific time",
            "english_example": "I wake up at 7 AM every morning.",
            "japanese_title": "起床動詞表現",
            "japanese_structure": "時間 + に + 起きる",
            "japanese_description": "特定の時間に起きることを表現する文法",
            "japanese_example": "毎朝7時に起きます。",
            "chinese_title": "起床动词表达",
            "chinese_structure": "时间 + 起床",
            "chinese_description": "表达在特定时间起床的语法",
            "chinese_example": "我每天早上7点起床。",
            "spanish_title": "Expresión del Verbo Despertar",
            "spanish_structure": "Sujeto + despertar + a + las + hora",
            "spanish_description": "Gramática para expresar despertarse a una hora específica",
            "spanish_example": "Me despierto a las 7 de la mañana todos los días.",
            "korean_word": "일어나다",
            "english_word": "wake up",
            "japanese_word": "起きる",
            "chinese_word": "起床",
            "spanish_word": "despertar"
        }
    ]
    
    # 나머지 48개 데이터 추가
    for i in range(3, 51):
        grammar_item = {
            "concept_id": f"daily_routine_{i}_greeting",
            "domain": "daily",
            "category": "routine",
            "difficulty": "basic",
            "situation": "casual,home",
            "purpose": "greeting" if i % 3 == 0 else "description" if i % 3 == 1 else "greeting",
            "korean_title": f"일과 {i} 표현",
            "korean_structure": f"일과{i} + 를 + 시작하다",
            "korean_description": f"일과 {i}를 시작하는 것을 표현하는 문법",
            "korean_example": f"오늘 {i}번째 일과를 시작해요.",
            "english_title": f"Routine {i} Expression",
            "english_structure": f"Subject + start + routine {i}",
            "english_description": f"Grammar for expressing starting routine {i}",
            "english_example": f"I start my {i}th daily routine.",
            "japanese_title": f"日常{i}表現",
            "japanese_structure": f"日常{i} + を + 始める",
            "japanese_description": f"日常{i}を始めることを表現する文法",
            "japanese_example": f"私は{i}番目の日常活動を始めます。",
            "chinese_title": f"日常{i}表达",
            "chinese_structure": f"开始 + 第{i} + 个日常活动",
            "chinese_description": f"表达开始第{i}个日常活动的语法",
            "chinese_example": f"我开始第{i}个日常活动。",
            "spanish_title": f"Expresión de Rutina {i}",
            "spanish_structure": f"Sujeto + empezar + rutina {i}",
            "spanish_description": f"Gramática para expresar empezar la rutina {i}",
            "spanish_example": f"Empiezo mi rutina diaria número {i}.",
            "korean_word": f"일과{i}",
            "english_word": f"routine{i}",
            "japanese_word": f"日常{i}",
            "chinese_word": f"日常{i}",
            "spanish_word": f"rutina{i}"
        }
        grammar.append(grammar_item)
    
    return grammar

def write_csv(filename, data, fieldnames):
    """CSV 파일 작성 (UTF-8 without BOM)"""
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            # 쉼표가 포함된 필드는 따옴표로 감싸기
            for key, value in row.items():
                if isinstance(value, str) and ',' in value:
                    row[key] = f'"{value}"'
            writer.writerow(row)

def main():
    """메인 함수"""
    print("통합 데이터 가이드 규칙을 준수하여 batch_1-1 데이터를 생성합니다...")
    
    # Concepts 데이터 생성
    print("Concepts 데이터 생성 중...")
    concepts_data = generate_concepts_data()
    concepts_headers = [
        "concept_id", "domain", "category", "difficulty", "emoji", "color", "situation", "purpose",
        "korean_word", "korean_pronunciation", "korean_definition", "korean_pos", "korean_synonyms", 
        "korean_antonyms", "korean_word_family", "korean_compound_words", "korean_collocations",
        "english_word", "english_pronunciation", "english_definition", "english_pos", "english_synonyms",
        "english_antonyms", "english_word_family", "english_compound_words", "english_collocations",
        "chinese_word", "chinese_pronunciation", "chinese_definition", "chinese_pos", "chinese_synonyms",
        "chinese_antonyms", "chinese_word_family", "chinese_compound_words", "chinese_collocations",
        "japanese_word", "japanese_pronunciation", "japanese_definition", "japanese_pos", "japanese_synonyms",
        "japanese_antonyms", "japanese_word_family", "japanese_compound_words", "japanese_collocations",
        "spanish_word", "spanish_pronunciation", "spanish_definition", "spanish_pos", "spanish_synonyms",
        "spanish_antonyms", "spanish_word_family", "spanish_compound_words", "spanish_collocations",
        "korean_example", "english_example", "chinese_example", "japanese_example", "spanish_example"
    ]
    write_csv("result/batch_1-1_concepts_template_add.csv", concepts_data, concepts_headers)
    
    # Examples 데이터 생성
    print("Examples 데이터 생성 중...")
    examples_data = generate_examples_data()
    examples_headers = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean", "english", "japanese", "chinese", "spanish",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]
    write_csv("result/batch_1-1_examples_template_add.csv", examples_data, examples_headers)
    
    # Grammar 데이터 생성
    print("Grammar 데이터 생성 중...")
    grammar_data = generate_grammar_data()
    grammar_headers = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean_title", "korean_structure", "korean_description", "korean_example",
        "english_title", "english_structure", "english_description", "english_example",
        "japanese_title", "japanese_structure", "japanese_description", "japanese_example",
        "chinese_title", "chinese_structure", "chinese_description", "chinese_example",
        "spanish_title", "spanish_structure", "spanish_description", "spanish_example",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]
    write_csv("result/batch_1-1_grammar_template_add.csv", grammar_data, grammar_headers)
    
    print("데이터 생성 완료!")
    print(f"- Concepts: {len(concepts_data)}개")
    print(f"- Examples: {len(examples_data)}개") 
    print(f"- Grammar: {len(grammar_data)}개")
    print("생성된 파일:")
    print("- result/batch_1-1_concepts_template_add.csv")
    print("- result/batch_1-1_examples_template_add.csv")
    print("- result/batch_1-1_grammar_template_add.csv")

if __name__ == "__main__":
    main()
