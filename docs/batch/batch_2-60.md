# 배치 2-60: business-consulting+advisory+expertise 테마 실용 확장

## 📋 배치 정보
- **배치 번호**: 2-60
- **단계**: 2단계 (실용 확장)
- **도메인**: 비즈니스
- **테마**: business+consulting+advisory+expertise
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
비즈니스(business) 도메인의 consulting(컨설팅), advisory(자문), expertise(전문성) 카테고리를 **테마**로 한 실용 데이터 50개를 생성해주세요.

**카테고리 분포:**
- consulting (컨설팅): 20개 (40%)
- advisory (자문): 18개 (36%)
- expertise (전문성): 12개 (24%)

**난이도 분포:**
- intermediate (중급): 25개 (50%)
- basic (기초): 12개 (24%)
- advanced (고급): 8개 (16%)
- fluent (유창): 3개 (6%)
- technical (전문): 2개 (4%)

**목적 분포:**
- suggestion (제안): 18개 (36%)
- opinion (의견): 12개 (24%)
- instruction (지시): 8개 (16%)
- question (질문): 6개 (12%)
- request (요청): 3개 (6%)
- gratitude (감사): 2개 (4%)
- description (묘사): 1개 (2%)

**품사 분포:**
- verb (동사): 16개 (32%)
- noun (명사): 14개 (28%)
- adjective (형용사): 8개 (16%)
- other (기타): 6개 (12%)
- interrogative (의문사): 3개 (6%)
- adverb (부사): 2개 (4%)
- preposition (전치사): 1개 (2%)

**상황 분포:**
- formal + work: 25개 (50%)
- polite + work: 18개 (36%)
- formal + public: 4개 (8%)
- polite + public: 2개 (4%)
- formal + phone: 1개 (2%)

consulting, advisory, expertise를 **테마**로 하되 실용적이고 전문적인 언어 요소를 포함해주세요.

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
비즈니스_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 2-61번 배치를 진행하세요.**