#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
1단계 배치 파일 생성기 v3
데이터_생성_자연어.md 문서의 정확한 1단계 비율에 맞춰 40개 배치 파일 생성
"""

import os
from datetime import datetime

# 1단계 배치 정의 (정확한 비율과 구성에 따라)
BATCH_DEFINITIONS = [
    # 1-1: daily-routine 기초 인사 (2.5%)
    {
        "id": "1-1",
        "domain": "daily",
        "category": "routine",
        "difficulty": "basic",
        "purpose": "greeting",
        "situation": "casual,home",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 감탄사(interjection) 30%",
        "description": "아침 인사, 일과 시작 표현 등을 포함한 일상 루틴 기초 인사"
    },
    
    # 1-2: daily-family 기초 질문 (2.5%)
    {
        "id": "1-2",
        "domain": "daily",
        "category": "family",
        "difficulty": "basic",
        "purpose": "question",
        "situation": "casual,home",
        "pos_composition": "의문사(interrogative) 40%, 동사(verb) 30%, 명사(noun) 30%",
        "description": "가족 구성원에 대한 기본적인 질문"
    },
    
    # 1-3: daily-household 기초 요청 (2.5%)
    {
        "id": "1-3",
        "domain": "daily",
        "category": "household",
        "difficulty": "basic",
        "purpose": "request",
        "situation": "polite,home",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%",
        "description": "가사일 요청 표현"
    },
    
    # 1-4: daily-shopping 기초 감정표현 (2.5%)
    {
        "id": "1-4",
        "domain": "daily",
        "category": "shopping",
        "difficulty": "basic",
        "purpose": "emotion",
        "situation": "casual,store",
        "pos_composition": "형용사(adjective) 40%, 감탄사(interjection) 30%, 명사(noun) 30%",
        "description": "쇼핑할 때의 감정과 반응"
    },
    
    # 1-5: daily-communication 기초 제안 (2.5%)
    {
        "id": "1-5",
        "domain": "daily",
        "category": "communication",
        "difficulty": "basic",
        "purpose": "suggestion",
        "situation": "polite,social",
        "pos_composition": "동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%",
        "description": "일상적인 제안과 권유 표현"
    },
    
    # 1-6: daily-emotions 기초 지시 (2.5%)
    {
        "id": "1-6",
        "domain": "daily",
        "category": "emotions",
        "difficulty": "basic",
        "purpose": "instruction",
        "situation": "casual,home",
        "pos_composition": "동사(verb) 50%, 부사(adverb) 30%, 명사(noun) 20%",
        "description": "감정 표현과 관련된 지시사항"
    },
    
    # 1-7: daily-time 기초 의견표현 (2.5%)
    {
        "id": "1-7",
        "domain": "daily",
        "category": "time",
        "difficulty": "basic",
        "purpose": "opinion",
        "situation": "casual,social",
        "pos_composition": "형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%",
        "description": "시간과 관련된 의견과 생각"
    },
    
    # 1-8: daily-clothing 기초 감사표현 (2.5%)
    {
        "id": "1-8",
        "domain": "daily",
        "category": "clothing",
        "difficulty": "basic",
        "purpose": "gratitude",
        "situation": "polite,store",
        "pos_composition": "기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "의복 구매와 관련된 감사 표현"
    },
    
    # 1-9: daily-leisure 기초 동의 (2.5%)
    {
        "id": "1-9",
        "domain": "daily",
        "category": "leisure",
        "difficulty": "basic",
        "purpose": "agreement",
        "situation": "casual,social",
        "pos_composition": "부사(adverb) 40%, 감탄사(interjection) 30%, 동사(verb) 30%",
        "description": "여가 활동에 대한 동의와 찬성"
    },
    
    # 1-10: daily 종합 기초+중급 (2.5%)
    {
        "id": "1-10",
        "domain": "daily",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 15%",
        "description": "daily 도메인 종합: morning, evening, weekend, work, personal, social 카테고리 포함, 기초 80% + 중급 20%"
    },
    
    # 1-11: food-cooking 기초 묘사 (2.5%)
    {
        "id": "1-11",
        "domain": "food",
        "category": "cooking",
        "difficulty": "basic",
        "purpose": "description",
        "situation": "casual,home",
        "pos_composition": "명사(noun) 50%, 형용사(adjective) 30%, 동사(verb) 20%",
        "description": "요리 과정과 음식 설명"
    },
    
    # 1-12: food-restaurants 기초 감사표현 (2.5%)
    {
        "id": "1-12",
        "domain": "food",
        "category": "restaurants",
        "difficulty": "basic",
        "purpose": "gratitude",
        "situation": "polite,restaurant",
        "pos_composition": "기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "음식점에서의 감사 표현"
    },
    
    # 1-13: food-ingredients 기초 의견표현 (2.5%)
    {
        "id": "1-13",
        "domain": "food",
        "category": "ingredients",
        "difficulty": "basic",
        "purpose": "opinion",
        "situation": "casual,market",
        "pos_composition": "형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "재료에 대한 의견과 평가"
    },
    
    # 1-14: food-beverages 기초 지시 (2.5%)
    {
        "id": "1-14",
        "domain": "food",
        "category": "beverages",
        "difficulty": "basic",
        "purpose": "instruction",
        "situation": "polite,cafe",
        "pos_composition": "동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%",
        "description": "음료 주문과 관련된 지시사항"
    },
    
    # 1-15: food-nutrition 기초 요청 (2.5%)
    {
        "id": "1-15",
        "domain": "food",
        "category": "nutrition",
        "difficulty": "basic",
        "purpose": "request",
        "situation": "polite,hospital",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%",
        "description": "영양 상담과 관련된 요청"
    },
    
    # 1-16: food-snacks 기초 동의 (2.5%)
    {
        "id": "1-16",
        "domain": "food",
        "category": "snacks",
        "difficulty": "basic",
        "purpose": "agreement",
        "situation": "casual,home",
        "pos_composition": "부사(adverb) 40%, 감탄사(interjection) 30%, 동사(verb) 30%",
        "description": "간식에 대한 동의와 찬성"
    },
    
    # 1-17: food-seafood 기초 질문 (2.5%)
    {
        "id": "1-17",
        "domain": "food",
        "category": "seafood",
        "difficulty": "basic",
        "purpose": "question",
        "situation": "polite,market",
        "pos_composition": "의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "해산물에 대한 질문"
    },
    
    # 1-18: food 종합 기초+중급 (2.5%)
    {
        "id": "1-18",
        "domain": "food",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%",
        "description": "food 도메인 종합: fruits, vegetables, desserts, meat, dairy, spices, dining, recipes 카테고리 포함, 기초 70% + 중급 30%"
    },
    
    # 1-19: education-teaching 기초 지시 (2.5%)
    {
        "id": "1-19",
        "domain": "education",
        "category": "teaching",
        "difficulty": "basic",
        "purpose": "instruction",
        "situation": "formal,school",
        "pos_composition": "동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%",
        "description": "교실에서 실제 사용할 수 있는 교육적인 표현"
    },
    
    # 1-20: education-learning 기초 질문 (2.5%)
    {
        "id": "1-20",
        "domain": "education",
        "category": "learning",
        "difficulty": "basic",
        "purpose": "question",
        "situation": "polite,school",
        "pos_composition": "의문사(interrogative) 40%, 동사(verb) 30%, 명사(noun) 30%",
        "description": "학습과 관련된 질문"
    },
    
    # 1-21: education-classroom 중급 의견표현 (2.5%)
    {
        "id": "1-21",
        "domain": "education",
        "category": "classroom",
        "difficulty": "intermediate",
        "purpose": "opinion",
        "situation": "casual,school",
        "pos_composition": "형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%",
        "description": "교실 환경과 관련된 의견"
    },
    
    # 1-22: education-students 기초 제안 (2.5%)
    {
        "id": "1-22",
        "domain": "education",
        "category": "students",
        "difficulty": "basic",
        "purpose": "suggestion",
        "situation": "casual,school",
        "pos_composition": "동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%",
        "description": "학생들 간의 제안과 권유"
    },
    
    # 1-23: education-subjects 기초 요청 (2.5%)
    {
        "id": "1-23",
        "domain": "education",
        "category": "subjects",
        "difficulty": "basic",
        "purpose": "request",
        "situation": "polite,school",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%",
        "description": "과목과 관련된 요청"
    },
    
    # 1-24: education 종합 기초+중급 (2.5%)
    {
        "id": "1-24",
        "domain": "education",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%",
        "description": "education 도메인 종합: curriculum, assessment, textbooks, exams, grades, homework, research, library, university, college, school, scholarship, academic 카테고리 포함, 기초 60% + 중급 40%"
    },
    
    # 1-25: travel-transportation 기초 인사 (2.5%)
    {
        "id": "1-25",
        "domain": "travel",
        "category": "transportation",
        "difficulty": "basic",
        "purpose": "greeting",
        "situation": "polite,public",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%",
        "description": "교통수단에서의 인사"
    },
    
    # 1-26: travel-accommodation 기초 질문 (2.5%)
    {
        "id": "1-26",
        "domain": "travel",
        "category": "accommodation",
        "difficulty": "basic",
        "purpose": "question",
        "situation": "polite,hotel",
        "pos_composition": "의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "숙박과 관련된 질문"
    },
    
    # 1-27: travel-sightseeing 중급 묘사 (2.5%)
    {
        "id": "1-27",
        "domain": "travel",
        "category": "sightseeing",
        "difficulty": "intermediate",
        "purpose": "description",
        "situation": "casual,tourist",
        "pos_composition": "형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "관광지와 명소에 대한 묘사"
    },
    
    # 1-28: travel 종합 기초+중급 (2.5%)
    {
        "id": "1-28",
        "domain": "travel",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 35%, 동사(verb) 30%, 의문사(interrogative) 20%, 기타(other) 15%",
        "description": "travel 도메인 종합: directions, booking, luggage, customs, currency, weather, maps, guides, attractions, souvenirs, emergency, language 카테고리 포함, 기초 70% + 중급 30%"
    },
    
    # 1-29: business-meeting 기초 인사 (2.5%)
    {
        "id": "1-29",
        "domain": "business",
        "category": "meeting",
        "difficulty": "basic",
        "purpose": "greeting",
        "situation": "formal,work",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%",
        "description": "회의에서의 인사와 소개"
    },
    
    # 1-30: business-communication 기초 요청 (2.5%)
    {
        "id": "1-30",
        "domain": "business",
        "category": "communication",
        "difficulty": "basic",
        "purpose": "request",
        "situation": "polite,work",
        "pos_composition": "동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%",
        "description": "업무 소통과 관련된 요청"
    },
    
    # 1-31: business 종합 기초+중급 (2.5%)
    {
        "id": "1-31",
        "domain": "business",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%",
        "description": "business 도메인 종합: presentation, negotiation, contracts, finance, marketing, teamwork, leadership, planning, reports, emails, sales, management 카테고리 포함, 기초 50% + 중급 50%"
    },
    
    # 1-32: health-symptoms 기초 묘사 (2.5%)
    {
        "id": "1-32",
        "domain": "health",
        "category": "symptoms",
        "difficulty": "basic",
        "purpose": "description",
        "situation": "polite,hospital",
        "pos_composition": "형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "증상에 대한 설명과 묘사"
    },
    
    # 1-33: health-treatment 기초 질문 (2.5%)
    {
        "id": "1-33",
        "domain": "health",
        "category": "treatment",
        "difficulty": "basic",
        "purpose": "question",
        "situation": "polite,hospital",
        "pos_composition": "의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%",
        "description": "치료와 관련된 질문"
    },
    
    # 1-34: health 종합 기초+중급 (2.5%)
    {
        "id": "1-34",
        "domain": "health",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 35%, 형용사(adjective) 25%, 동사(verb) 25%, 의문사(interrogative) 15%",
        "description": "health 도메인 종합: exercise, nutrition, medicine, hospital, doctor, appointment, wellness, prevention, mental, recovery, checkup, emergency, surgery 카테고리 포함, 기초 60% + 중급 40%"
    },
    
    # 1-35: technology-internet 기초 지시 (2.5%)
    {
        "id": "1-35",
        "domain": "technology",
        "category": "internet",
        "difficulty": "basic",
        "purpose": "instruction",
        "situation": "casual,home",
        "pos_composition": "동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%",
        "description": "인터넷 사용과 관련된 지시사항"
    },
    
    # 1-36: technology 종합 기초+중급 (2.5%)
    {
        "id": "1-36",
        "domain": "technology",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%",
        "description": "technology 도메인 종합: devices, software, applications, programming, data, security, artificial, social, mobile, gaming, cloud, communication, innovation, automation, research, development 카테고리 포함, 기초 40% + 중급 60%"
    },
    
    # 1-37: culture 종합 기초+중급 (3%)
    {
        "id": "1-37",
        "domain": "culture",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%",
        "description": "culture 도메인 종합: heritage, arts_crafts, national_identity, ceremony, etiquette, festivals, traditions, customs, beliefs, values, history, literature, music, film 카테고리 포함, 기초 40% + 중급 60%"
    },
    
    # 1-38: entertainment 종합 기초+중급 (3%)
    {
        "id": "1-38",
        "domain": "entertainment",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 감탄사(interjection) 10%",
        "description": "entertainment 도메인 종합: movies, music, games, books, theater, art, comedy, drama, dance, concerts, shows, celebrities, media, streaming, hobbies 카테고리 포함, 기초 50% + 중급 50%"
    },
    
    # 1-39: nature 종합 기초+중급 (2%)
    {
        "id": "1-39",
        "domain": "nature",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%",
        "description": "nature 도메인 종합: animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability 카테고리 포함, 기초 60% + 중급 40%"
    },
    
    # 1-40: sports + other 종합 기초+중급 (1%)
    {
        "id": "1-40",
        "domain": "sports,other",
        "category": "comprehensive",
        "difficulty": "mixed",
        "purpose": "mixed",
        "situation": "mixed",
        "pos_composition": "명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%",
        "description": "sports + other 도메인 종합: sports의 15개 카테고리 + other의 25개 카테고리 포함, 기초 70% + 중급 30%"
    }
]

def create_batch_file(batch_def):
    """개별 배치 파일 생성"""
    
    # 파일명 생성
    filename = f"batch_{batch_def['id']}_{batch_def['domain']}_{batch_def['category']}_{batch_def['difficulty']}_{batch_def['purpose']}.md"
    
    # 혼합 배치는 파일명 조정
    if batch_def['difficulty'] == 'mixed':
        filename = f"batch_{batch_def['id']}_{batch_def['domain']}_{batch_def['category']}_mixed.md"
    
    # 내용 생성
    content = f"""# AI 데이터 생성 프롬프트 - Batch {batch_def['id']}

## 📋 배치 정보

- **배치 ID**: {batch_def['id']}
- **도메인**: {batch_def['domain']}
- **카테고리**: {batch_def['category']}
- **난이도**: {batch_def['difficulty']}
- **목적**: {batch_def['purpose']}
- **상황**: {batch_def['situation']}
- **품사 구성**: {batch_def['pos_composition']}

## 🎯 생성 지시어

### 기본 요청
```
{batch_def['description']}에 대한 다국어 학습 데이터를 50개 생성해주세요.
"""

    # 난이도별 상세 지시어 추가
    if batch_def['difficulty'] == 'basic':
        content += f"""
**난이도**: 기초(basic) - 초급자용, 일상적인 기본 표현
**목적**: {batch_def['purpose']} - 해당 목적에 맞는 표현
**상황**: {batch_def['situation']} - 해당 상황에서 사용하는 표현
**품사 구성**: {batch_def['pos_composition']}
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도**: 기초 수준
4. **품사 분포**: {batch_def['pos_composition']}
5. **상황별 사용**: {batch_def['situation']} 환경에서 자연스럽게 사용
6. **목적 중심**: {batch_def['purpose']} 목적에 맞는 실용적 표현

### 주의사항

- concept_id 형식: `{{domain}}_{{word}}_{{meaning}}`
- 모든 예문은 완전한 문장으로 작성 (주어+동사 포함)
- 동일 concept_id 내에서 concepts, examples, grammar는 같은 단어 사용
- 각 컬렉션별 예문은 서로 다르게 작성
- CSV 헤더 정확성: Concepts(58개), Examples(16개), Grammar(31개)
- 쉼표 포함 필드는 반드시 따옴표로 감싸기
- UTF-8 인코딩으로 한글 깨짐 방지

### 생성 결과물

이 프롬프트로 다음 3개 파일을 생성해주세요:
1. `batch_{batch_def['id']}_concepts_template_add.csv` (58개 필드)
2. `batch_{batch_def['id']}_examples_template_add.csv` (16개 필드)  
3. `batch_{batch_def['id']}_grammar_template_add.csv` (31개 필드)
"""
    
    elif batch_def['difficulty'] == 'intermediate':
        content += f"""
**난이도**: 중급(intermediate) - 어느 정도 언어 능력 필요
**목적**: {batch_def['purpose']} - 해당 목적에 맞는 표현
**상황**: {batch_def['situation']} - 해당 상황에서 사용하는 표현
**품사 구성**: {batch_def['pos_composition']}
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도**: 중급 수준
4. **품사 분포**: {batch_def['pos_composition']}
5. **상황별 사용**: {batch_def['situation']} 환경에서 자연스럽게 사용
6. **목적 중심**: {batch_def['purpose']} 목적에 맞는 실용적 표현

### 주의사항

- concept_id 형식: `{{domain}}_{{word}}_{{meaning}}`
- 모든 예문은 완전한 문장으로 작성 (주어+동사 포함)
- 동일 concept_id 내에서 concepts, examples, grammar는 같은 단어 사용
- 각 컬렉션별 예문은 서로 다르게 작성
- CSV 헤더 정확성: Concepts(58개), Examples(16개), Grammar(31개)
- 쉼표 포함 필드는 반드시 따옴표로 감싸기
- UTF-8 인코딩으로 한글 깨짐 방지

### 생성 결과물

이 프롬프트로 다음 3개 파일을 생성해주세요:
1. `batch_{batch_def['id']}_concepts_template_add.csv` (58개 필드)
2. `batch_{batch_def['id']}_examples_template_add.csv` (16개 필드)  
3. `batch_{batch_def['id']}_grammar_template_add.csv` (31개 필드)
"""
    
    elif batch_def['difficulty'] == 'mixed':
        content += f"""
**난이도**: 혼합 - 여러 난이도 조합
**목적**: {batch_def['purpose']} - 다양한 목적 조합
**상황**: {batch_def['situation']} - 다양한 상황 조합
**품사 구성**: {batch_def['pos_composition']}
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도**: 혼합 (비율은 설명에 명시)
4. **품사 분포**: {batch_def['pos_composition']}
5. **종합적 접근**: {batch_def['description']}

### 주의사항

- concept_id 형식: `{{domain}}_{{word}}_{{meaning}}`
- 모든 예문은 완전한 문장으로 작성 (주어+동사 포함)
- 동일 concept_id 내에서 concepts, examples, grammar는 같은 단어 사용
- 각 컬렉션별 예문은 서로 다르게 작성
- CSV 헤더 정확성: Concepts(58개), Examples(16개), Grammar(31개)
- 쉼표 포함 필드는 반드시 따옴표로 감싸기
- UTF-8 인코딩으로 한글 깨짐 방지

### 생성 결과물

이 프롬프트로 다음 3개 파일을 생성해주세요:
1. `batch_{batch_def['id']}_concepts_template_add.csv` (58개 필드)
2. `batch_{batch_def['id']}_examples_template_add.csv` (16개 필드)  
3. `batch_{batch_def['id']}_grammar_template_add.csv` (31개 필드)
"""

    content += f"""

## 📊 1단계 전체 비율 정보

이 배치는 1단계(기초 구축) 2,000개 데이터 중 일부입니다.

### 1단계 전체 비율
- **Domain 비율**: daily(25%), food(15%), education(15%), travel(12%), business(10%), health(8%), technology(5%), culture(2%), entertainment(5%), nature(2%), other(2%), sports(0% - 40번째 배치에서 포함)
- **Difficulty 비율**: basic(60%), intermediate(30%), advanced(7%), fluent(2%), technical(1%)
- **Purpose 비율**: greeting(25%), question(18%), request(15%), suggestion(10%), emotion(8%), instruction(7%), description(5%), gratitude(5%), opinion(3%), agreement(2%), apology(1%), refusal(1%)
- **Situation 비율**: casual+home(35%), casual+social(25%), polite+social(15%), casual+store(10%), polite+store(8%), polite+home(5%), polite+work(2%)

---

**생성일**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

    return filename, content

def main():
    """메인 실행 함수"""
    print("🚀 1단계 배치 파일 생성기 v3 시작")
    print(f"📁 출력 디렉터리: c:\\practice\\likevoca\\docs\\plus_v2")
    print(f"📊 생성할 배치 수: {len(BATCH_DEFINITIONS)}개")
    
    # 파일 생성
    created_files = []
    
    for i, batch_def in enumerate(BATCH_DEFINITIONS, 1):
        filename, content = create_batch_file(batch_def)
        filepath = os.path.join("c:\\practice\\likevoca\\docs\\plus_v2", filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            created_files.append(filename)
            print(f"✅ [{i:2d}/40] {filename}")
        except Exception as e:
            print(f"❌ [{i:2d}/40] {filename} - 오류: {e}")
    
    # 결과 출력
    print(f"\n🎉 배치 파일 생성 완료!")
    print(f"📊 성공: {len(created_files)}/40개")
    print(f"📁 위치: c:\\practice\\likevoca\\docs\\plus_v2\\")
    
    if len(created_files) == 40:
        print(f"\n✨ 모든 1단계 배치 파일이 정확한 비율로 생성되었습니다!")
        print(f"🎯 각 배치는 데이터_생성_자연어.md의 1단계 비율을 정확히 반영합니다.")
    
    return created_files

if __name__ == "__main__":
    main()
