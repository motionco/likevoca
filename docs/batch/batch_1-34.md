# 배치 1-34: other-goals+achievements+challenges 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-34
- **단계**: 1단계 (기초 구축)
- **도메인**: 기타
- **테마**: other+goals+achievements+challenges
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
기타(other) 도메인의 goals(목표), achievements(성취), challenges(도전) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- goals (목표): 20개 (40%)
- achievements (성취): 18개 (36%)
- challenges (도전): 12개 (24%)

**난이도 분포:**
- basic (기초): 30개 (60%)
- intermediate (중급): 15개 (30%)
- advanced (고급): 3개 (6%)
- fluent (유창): 1개 (2%)
- technical (전문): 1개 (2%)

**목적 분포:**
- emotion (감정): 12개 (24%)
- description (묘사): 10개 (20%)
- opinion (의견): 8개 (16%)
- suggestion (제안): 6개 (12%)
- question (질문): 5개 (10%)
- gratitude (감사): 4개 (8%)
- agreement (동의): 3개 (6%)
- request (요청): 2개 (4%)

**품사 분포:**
- noun (명사): 14개 (28%)
- adjective (형용사): 12개 (24%)
- verb (동사): 8개 (16%)
- interjection (감탄사): 6개 (12%)
- adverb (부사): 4개 (8%)
- interrogative (의문사): 3개 (6%)
- other (기타): 2개 (4%)
- preposition (전치사): 1개 (2%)

**상황 분포:**
- casual + home: 12개 (24%)
- casual + social: 10개 (20%)
- polite + social: 8개 (16%)
- polite + home: 6개 (12%)
- casual + work: 5개 (10%)
- polite + work: 4개 (8%)
- casual + school: 3개 (6%)
- polite + school: 2개 (4%)

goals, achievements, challenges를 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

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
기타_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 1-35번 배치를 진행하세요.**