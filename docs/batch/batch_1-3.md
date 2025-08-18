# 배치 1-3: travel-basic+communication+culture 테마 기초 구축

## 📋 배치 정보
- **배치 번호**: 1-3
- **단계**: 1단계 (기초 구축)
- **도메인**: 여행
- **테마**: travel+basic+communication+culture
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
여행(travel) 도메인의 basic(기본 여행), communication(의사소통), culture(문화) 카테고리를 **테마**로 한 기초 데이터 50개를 생성해주세요.

**카테고리 분포:**
- basic (기본 여행): 20개 (40%) - 교통, 숙박, 길찾기
- communication (의사소통): 18개 (36%) - 여행 중 대화
- culture (문화): 12개 (24%) - 문화 체험, 현지 관습

**난이도 분포 (다양성 중심):**
- basic (기초): 30개 (60%) - 기본 여행 회화
- intermediate (중급): 15개 (30%) - 복잡한 여행 상황
- advanced (고급): 3개 (6%) - 세밀한 문화 이해
- fluent (유창): 1개 (2%) - 유창한 여행 대화
- technical (전문): 1개 (2%) - 전문 여행 용어

**목적 분포 (다양성 중심, 가능한 많이 포함):**
- question (질문): 13개 (26%) - 여행 정보 질문
- request (요청): 10개 (20%) - 여행 관련 요청
- greeting (인사): 8개 (16%) - 여행지 인사
- instruction (지시): 6개 (12%) - 여행 안내
- suggestion (제안): 4개 (8%) - 여행 제안
- description (묘사): 3개 (6%) - 여행지 설명
- gratitude (감사): 2개 (4%) - 여행 감사
- emotion (감정): 2개 (4%) - 여행 감정
- opinion (의견): 1개 (2%) - 여행 의견
- agreement (동의): 1개 (2%) - 여행 동의

**품사 분포 (다양성 중심, 가능한 많이 포함):**
- noun (명사): 13개 (26%) - 여행지/교통 명사
- verb (동사): 12개 (24%) - 여행 행동 동사
- adjective (형용사): 8개 (16%) - 여행 상태 형용사
- interrogative (의문사): 6개 (12%) - 여행 의문사
- interjection (감탄사): 4개 (8%) - 여행 감탄사
- adverb (부사): 3개 (6%) - 여행 부사
- other (기타): 2개 (4%) - 여행 구문
- preposition (전치사): 1개 (2%) - 여행 전치사
- conjunction (접속사): 1개 (2%) - 여행 접속사

**상황 분포 (다양성 중심 - 가능한 많은 조합 포함):**
- polite + social: 14개 (28%) - 정중한 사회
- casual + social: 10개 (20%) - 편안한 사회
- polite + shopping: 8개 (16%) - 정중한 쇼핑
- casual + shopping: 5개 (10%) - 편안한 쇼핑
- polite + work: 3개 (6%) - 정중한 업무
- casual + work: 2개 (4%) - 편안한 업무
- casual + home: 2개 (4%) - 편안한 집
- polite + home: 2개 (4%) - 정중한 집
- casual + store: 2개 (4%) - 편안한 상점
- polite + store: 1개 (2%) - 정중한 상점
- casual + travel: 1개 (2%) - 편안한 여행

basic, communication, culture를 **테마**로 하되 가능한 한 다양한 언어 요소를 포함해주세요.

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
여행_{word}_{meaning}
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

**이 배치 완료 후 다음 단계로 1-4번 배치를 진행하세요.**