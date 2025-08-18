# 배치 1-5: health-exercise+medical+nutrition 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-5
- **단계**: 1단계 (기초 구축)
- **도메인**: 건강
- **테마**: health+exercise+medical+nutrition
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
건강(health) 도메인의 exercise(운동), medical(의료), nutrition(영양) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- exercise (운동): 20개 (40%) - 운동 방법, 피트니스
- medical (의료): 18개 (36%) - 건강 관리, 의료 상담
- nutrition (영양): 12개 (24%) - 영양 관리, 식단

**난이도 분포 (다양성 중심):**
- basic (기초): 25개 (50%) - 기본 건강 관리
- intermediate (중급): 18개 (36%) - 일반 건강 지식
- advanced (고급): 4개 (8%) - 전문 건강 지식
- technical (전문): 2개 (4%) - 의료 전문 용어
- fluent (유창): 1개 (2%) - 유창한 건강 표현

**목적 분포 (다양성 중심, 가능한 많이 포함):**
- instruction (지시): 12개 (24%) - 건강 지침
- question (질문): 10개 (20%) - 건강 질문
- suggestion (제안): 8개 (16%) - 건강 제안
- description (묘사): 6개 (12%) - 건강 설명
- request (요청): 5개 (10%) - 건강 요청
- opinion (의견): 3개 (6%) - 건강 의견
- emotion (감정): 2개 (4%) - 건강 감정
- greeting (인사): 2개 (4%) - 건강 인사
- gratitude (감사): 1개 (2%) - 건강 감사
- agreement (동의): 1개 (2%) - 건강 동의

**품사 분포 (다양성 중심, 가능한 많이 포함):**
- noun (명사): 15개 (30%) - 건강/운동 명사
- verb (동사): 12개 (24%) - 운동/치료 동사
- adjective (형용사): 10개 (20%) - 건강 상태 형용사
- other (기타): 4개 (8%) - 건강 구문
- interrogative (의문사): 3개 (6%) - 건강 의문사
- adverb (부사): 3개 (6%) - 건강 부사
- interjection (감탄사): 1개 (2%) - 건강 감탄사
- preposition (전치사): 1개 (2%) - 건강 전치사
- conjunction (접속사): 1개 (2%) - 건강 접속사

**상황 분포 (다양성 중심 - 가능한 많은 조합 포함):**
- casual + social: 12개 (24%) - 편안한 사회
- polite + social: 10개 (20%) - 정중한 사회
- casual + home: 8개 (16%) - 편안한 집
- polite + work: 5개 (10%) - 정중한 업무
- casual + work: 3개 (6%) - 편안한 업무
- casual + shopping: 3개 (6%) - 편안한 쇼핑
- polite + shopping: 2개 (4%) - 정중한 쇼핑
- polite + home: 2개 (4%) - 정중한 집
- casual + store: 2개 (4%) - 편안한 상점
- polite + medical: 2개 (4%) - 정중한 의료
- casual + medical: 1개 (2%) - 편안한 의료

exercise, medical, nutrition을 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

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
건강_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 1-6번 배치를 진행하세요.**