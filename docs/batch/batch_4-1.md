# 배치 4-1: science-quantum_physics+theoretical_research+scientific_methodology 테마 전문 구축

## 📋 배치 정보
- **배치 번호**: 4-1
- **단계**: 4단계 (전문 완성)
- **도메인**: 과학
- **테마**: science+quantum_physics+theoretical_research+scientific_methodology
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
과학(science) 도메인의 quantum_physics(양자물리학), theoretical_research(이론연구), scientific_methodology(과학방법론) 카테고리를 **테마**로 한 전문 데이터 50개를 생성해주세요.

**카테고리 분포:**
- quantum_physics (양자물리학): 20개 (40%)
- theoretical_research (이론연구): 18개 (36%)
- scientific_methodology (과학방법론): 12개 (24%)

**난이도 분포:**
- technical (전문): 25개 (50%)
- fluent (유창): 15개 (30%)
- advanced (고급): 7개 (14%)
- intermediate (중급): 2개 (4%)
- basic (기초): 1개 (2%)

**목적 분포:**
- description (묘사): 15개 (30%) - 정교한 과학적 설명
- opinion (의견): 10개 (20%) - 전문가 의견/이론
- instruction (지시): 7개 (14%) - 연구 방법론 지도
- suggestion (제안): 6개 (12%) - 연구 제안
- question (질문): 5개 (10%) - 과학적 탐구
- agreement (동의): 3개 (6%) - 학술적 합의
- request (요청): 2개 (4%) - 연구 요청
- emotion (감정): 1개 (2%) - 과학적 감탄
- greeting (인사): 1개 (2%) - 학술적 인사

**품사 분포:**
- noun (명사): 18개 (36%) - 전문 과학 용어
- adjective (형용사): 12개 (24%) - 정교한 과학적 속성
- verb (동사): 10개 (20%) - 과학적 행동/과정
- other (기타): 6개 (12%) - 과학적 구문/공식
- adverb (부사): 3개 (6%) - 정교한 과학적 방식
- conjunction (접속사): 1개 (2%) - 과학적 논리 연결

**상황 분포:**
- formal + school: 20개 (40%) - 공식적 학술 환경
- formal + work: 10개 (20%) - 공식적 연구 환경
- polite + work: 8개 (16%) - 정중한 연구 협력
- formal + public: 5개 (10%) - 공식적 학술 발표
- polite + social: 3개 (6%) - 정중한 학술 교류
- casual + work: 2개 (4%) - 편안한 연구 토론
- polite + online: 2개 (4%) - 정중한 온라인 학술

**학술적 컨텍스트와 전문성을 최대한 반영하되, 실제 연구 환경에서 사용할 수 있는 실용적 표현을 포함해주세요.**

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
과학_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 4-2번 배치를 진행하세요.**