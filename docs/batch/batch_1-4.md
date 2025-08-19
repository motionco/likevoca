# 배치 1-4: business-meeting+presentation+email 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-4
- **단계**: 1단계 (기초 구축)
- **도메인**: 비즈니스
- **테마**: business+meeting+presentation+email
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
비즈니스(business) 도메인의 meeting(회의), presentation(발표), email(이메일) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- meeting (회의): 20개 (40%) - 회의 진행, 토론
- presentation (발표): 18개 (36%) - 발표 기법, 설명
- email (이메일): 12개 (24%) - 업무 이메일, 서신

**난이도 분포 (다양성 중심):**
- intermediate (중급): 25개 (50%) - 일반 업무 수준
- basic (기초): 15개 (30%) - 기본 비즈니스
- advanced (고급): 6개 (12%) - 복잡한 업무
- fluent (유창): 2개 (4%) - 유창한 비즈니스
- technical (전문): 2개 (4%) - 전문 비즈니스

**목적 분포 (다양성 중심, 가능한 많이 포함):**
- instruction (지시): 12개 (24%) - 업무 지시
- question (질문): 10개 (20%) - 업무 질문
- suggestion (제안): 8개 (16%) - 업무 제안
- request (요청): 6개 (12%) - 업무 요청
- opinion (의견): 4개 (8%) - 업무 의견
- description (묘사): 3개 (6%) - 업무 설명
- agreement (동의): 3개 (6%) - 업무 동의
- greeting (인사): 2개 (4%) - 업무 인사
- gratitude (감사): 1개 (2%) - 업무 감사
- emotion (감정): 1개 (2%) - 업무 감정

**품사 분포 (다양성 중심, 가능한 많이 포함):**
- noun (명사): 15개 (30%) - 업무/회의 명사
- verb (동사): 12개 (24%) - 업무 동작 동사
- adjective (형용사): 8개 (16%) - 업무 상태 형용사
- other (기타): 5개 (10%) - 업무 구문
- interrogative (의문사): 4개 (8%) - 업무 의문사
- adverb (부사): 3개 (6%) - 업무 부사
- interjection (감탄사): 1개 (2%) - 업무 감탄사
- preposition (전치사): 1개 (2%) - 업무 전치사
- conjunction (접속사): 1개 (2%) - 업무 접속사

**상황 분포 (다양성 중심 - 가능한 많은 조합 포함):**
- polite + work: 20개 (40%) - 정중한 업무
- polite + social: 8개 (16%) - 정중한 사회
- casual + work: 6개 (12%) - 편안한 업무
- formal + work: 4개 (8%) - 공식적 업무
- casual + social: 3개 (6%) - 편안한 사회
- polite + shopping: 2개 (4%) - 정중한 쇼핑
- casual + shopping: 2개 (4%) - 편안한 쇼핑
- formal + school: 2개 (4%) - 공식적 학교
- polite + school: 1개 (2%) - 정중한 학교
- casual + store: 1개 (2%) - 편안한 상점
- polite + store: 1개 (2%) - 정중한 상점

meeting, presentation, email을 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

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
business_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 1-5번 배치를 진행하세요.**