# 배치 1-6: daily-activities+hobbies+communication 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-6
- **단계**: 1단계 (기초 구축)
- **도메인**: 일상생활
- **테마**: daily+activities+hobbies+communication
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
일상생활(daily) 도메인의 activities(활동), hobbies(취미), communication(의사소통) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- activities (활동): 20개 (40%) - 일상 활동, 여가 활동
- hobbies (취미): 18개 (36%) - 개인 취미, 관심사
- communication (의사소통): 12개 (24%) - 일상 대화, 소통

**난이도 분포:**
- basic (기초): 30개 (60%)
- intermediate (중급): 15개 (30%)
- advanced (고급): 3개 (6%)
- fluent (유창): 1개 (2%)
- technical (전문): 1개 (2%)

**목적 분포:**
- greeting (인사): 13개 (26%)
- question (질문): 9개 (18%)
- request (요청): 7개 (14%)
- suggestion (제안): 5개 (10%)
- emotion (감정): 4개 (8%)
- instruction (지시): 4개 (8%)
- description (묘사): 3개 (6%)
- gratitude (감사): 2개 (4%)
- opinion (의견): 2개 (4%)
- agreement (동의): 1개 (2%)

**품사 분포:**
- noun (명사): 13개 (26%)
- verb (동사): 12개 (24%)
- adjective (형용사): 8개 (16%)
- interjection (감탄사): 5개 (10%)
- interrogative (의문사): 4개 (8%)
- adverb (부사): 4개 (8%)
- other (기타): 2개 (4%)
- preposition (전치사): 1개 (2%)
- conjunction (접속사): 1개 (2%)

**상황 분포:**
- casual + home: 12개 (24%)
- casual + social: 10개 (20%)
- polite + social: 8개 (16%)
- casual + shopping: 4개 (8%)
- polite + shopping: 3개 (6%)
- polite + home: 3개 (6%)
- casual + work: 3개 (6%)
- polite + work: 2개 (4%)
- casual + school: 2개 (4%)
- polite + school: 2개 (4%)
- casual + travel: 1개 (2%)

activities, hobbies, communication을 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

```

### 2. Examples 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 실제 상황에서 사용하는 실용적이고 자연스러운 예문 50개를 생성해주세요.

**핵심 원칙:**
- Concepts의 representative_example과 **다른 예문** 사용
- 실제 일상 상황에서 사용하는 자연스러운 표현
- 완전한 문장 구조 (주어+동사 포함)

### 3. Grammar 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 문법 패턴을 설명하는 교육적 목적의 데이터 50개를 생성해주세요.

**핵심 원칙:**
- Concepts, Examples와 **다른 예문** 사용
- 문법 패턴을 명확히 보여주는 교육적 예문
- 각 언어별 문법 구조와 설명 포함

## 📝 참고사항

### concept_id 형식
```
일상생활_{word}_{meaning}
```

### 중복 방지
- 동일한 concept_id를 가진 세 컬렉션의 예문은 반드시 서로 달라야 함
- Concepts: 기본 의미를 보여주는 간단한 예문
- Examples: 실제 상황에서 사용하는 실용적 예문  
- Grammar: 문법 패턴을 설명하는 교육적 예문

### 데이터 품질 기준
- 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
- 완전한 문장 구조 사용
- 테마에 맞는 자연스러운 표현
- 통합_데이터_가이드.md의 모든 규칙 준수

---

**이 배치 완료 후 다음 단계로 1-7번 배치를 진행하세요.**