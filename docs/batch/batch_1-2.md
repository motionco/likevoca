# 배치 1-2: daily-family+relationships+emotions 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-2
- **단계**: 1단계 (기초 구축)
- **도메인**: 일상생활
- **테마**: daily+family+relationships+emotions
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
일상생활(daily) 도메인의 family(가족), relationships(관계), emotions(감정) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- family (가족): 20개 (40%) - 가족 구성원, 가족 활동
- relationships (관계): 18개 (36%) - 인간관계, 사회적 관계
- emotions (감정): 12개 (24%) - 감정 표현, 심리 상태

**난이도 분포 (다양성 중심):**
- basic (기초): 30개 (60%) - 기본 가족/관계/감정
- intermediate (중급): 15개 (30%) - 복잡한 관계/감정
- advanced (고급): 3개 (6%) - 세밀한 감정 분석
- fluent (유창): 1개 (2%) - 유창한 관계 표현
- technical (전문): 1개 (2%) - 전문적 심리 용어

**목적 분포 (다양성 중심, 가능한 많이 포함):**
- greeting (인사): 13개 (26%) - 가족 인사
- question (질문): 9개 (18%) - 가족/관계 질문
- request (요청): 7개 (14%) - 가족 요청
- suggestion (제안): 5개 (10%) - 관계 제안
- emotion (감정): 4개 (8%) - 감정 표현
- instruction (지시): 4개 (8%) - 관계 지시
- description (묘사): 3개 (6%) - 관계/감정 설명
- gratitude (감사): 2개 (4%) - 가족 감사
- opinion (의견): 2개 (4%) - 관계 의견
- agreement (동의): 1개 (2%) - 관계 동의

**품사 분포 (다양성 중심, 가능한 많이 포함):**
- noun (명사): 13개 (26%) - 가족/관계 명사
- verb (동사): 12개 (24%) - 관계/감정 동사
- adjective (형용사): 8개 (16%) - 감정/관계 형용사
- interjection (감탄사): 5개 (10%) - 감정 감탄사
- interrogative (의문사): 4개 (8%) - 관계 의문사
- adverb (부사): 4개 (8%) - 감정 부사
- other (기타): 2개 (4%) - 관계 구문
- preposition (전치사): 1개 (2%) - 관계 전치사
- conjunction (접속사): 1개 (2%) - 관계 접속사

**상황 분포 (다양성 중심 - 가능한 많은 조합 포함):**
- casual + home: 14개 (28%) - 편안한 집
- casual + social: 10개 (20%) - 편안한 사회
- polite + social: 8개 (16%) - 정중한 사회
- casual + shopping: 4개 (8%) - 편안한 쇼핑
- polite + shopping: 3개 (6%) - 정중한 쇼핑
- polite + home: 3개 (6%) - 정중한 집
- polite + work: 2개 (4%) - 정중한 업무
- casual + work: 2개 (4%) - 편안한 업무
- casual + store: 2개 (4%) - 편안한 상점
- polite + store: 1개 (2%) - 정중한 상점
- casual + school: 1개 (2%) - 편안한 학교

family, relationships, emotions를 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

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
daily_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 1-3번 배치를 진행하세요.**