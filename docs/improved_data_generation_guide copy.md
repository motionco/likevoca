# 완전 개선된 다국어 학습 플랫폼 데이터 생성 가이드

## 📋 개선 원칙

### 🎯 완전한 카테고리 포함 원칙
각 배치(50개 데이터)에서 **관련성 높은 카테고리 2-3개를 묶어서** 모든 180개 카테고리를 40개 배치에 완전 포함시킵니다.

### 📊 배치 내 최대 분산 구성 원칙
- **핵심 테마**: 30-40% (해당 배치의 2-3개 연관 카테고리)
- **다양성 분산**: 60-70% (모든 난이도, 목적, 품사, 상황을 최대한 고르게 포함)
- **전체 요소 포함**: 가능한 모든 5개 난이도, 12개 목적, 10개 품사, 다양한 상황 조합 포함

---

## 🎯 1단계: 기초 구축 (40배치 × 50개 = 2,000개) - 완전 개정

### 1-1번 배치 (50개): daily-routine+time+weather_talk 테마 최대 다양성

```
일상생활(daily) 도메인의 routine(일과), time(시간), weather_talk(날씨 대화) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- routine (일과): 20개 (40%) - 하루 일과, 스케줄
- time (시간): 18개 (36%) - 시간 표현, 시간 관리
- weather_talk (날씨 대화): 12개 (24%) - 날씨 관련 일상 대화

**난이도 분포 (5개 모두 포함):**
- basic (기초): 12개 (24%) - 기본 일과/시간/날씨
- intermediate (중급): 12개 (24%) - 복잡한 스케줄/시간 개념
- advanced (고급): 11개 (22%) - 세밀한 시간 관리
- fluent (유창): 8개 (16%) - 유창한 일상 표현
- technical (전문): 7개 (14%) - 전문적 시간/일정 관리

**목적 분포 (12개 모두 포함):**
- greeting (인사): 7개 (14%) - 시간대별 인사
- description (묘사): 6개 (12%) - 일과/날씨 설명
- question (질문): 5개 (10%) - 시간/일정 질문
- request (요청): 5개 (10%) - 일정 요청
- instruction (지시): 4개 (8%) - 일과 지시
- opinion (의견): 4개 (8%) - 시간/날씨 의견
- suggestion (제안): 4개 (8%) - 일정 제안
- emotion (감정): 4개 (8%) - 날씨/일과 감정
- gratitude (감사): 3개 (6%) - 일과 감사
- agreement (동의): 3개 (6%) - 일정 동의
- apology (사과): 3개 (6%) - 일정 사과
- refusal (거절): 2개 (4%) - 일정 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 시간/일과/날씨 명사
- verb (동사): 8개 (16%) - 일과/시간 동사
- adjective (형용사): 7개 (14%) - 날씨/시간 형용사
- adverb (부사): 6개 (12%) - 시간 부사
- interjection (감탄사): 5개 (10%) - 날씨 감탄사
- other (기타): 5개 (10%) - 시간/일과 구문
- interrogative (의문사): 4개 (8%) - 시간 의문사
- preposition (전치사): 3개 (6%) - 시간 전치사
- conjunction (접속사): 2개 (4%) - 시간 접속사
- determiner (한정사): 2개 (4%) - 시간 한정사

**상황 분포:**
- casual + home: 10개 (20%) - 편안한 집
- polite + social: 8개 (16%) - 정중한 사회
- casual + social: 7개 (14%) - 편안한 사회
- polite + work: 6개 (12%) - 정중한 업무
- casual + work: 5개 (10%) - 편안한 업무
- polite + home: 4개 (8%) - 정중한 집
- formal + work: 3개 (6%) - 공식 업무
- polite + public: 3개 (6%) - 정중한 공공
- casual + public: 2개 (4%) - 편안한 공공
- formal + public: 2개 (4%) - 공식 공공

routine, time, weather_talk을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-2번 배치 (50개): daily-family+relationships+emotions 테마 최대 다양성

```
일상생활(daily) 도메인의 family(가족), relationships(관계), emotions(감정) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- family (가족): 20개 (40%) - 가족 구성원, 가족 활동
- relationships (관계): 18개 (36%) - 인간관계, 사회적 관계
- emotions (감정): 12개 (24%) - 감정 표현, 심리 상태

**난이도 분포 (5개 모두 포함):**
- basic (기초): 13개 (26%) - 기본 가족/관계/감정
- intermediate (중급): 11개 (22%) - 복잡한 관계/감정
- advanced (고급): 10개 (20%) - 세밀한 감정 분석
- fluent (유창): 9개 (18%) - 유창한 관계 표현
- technical (전문): 7개 (14%) - 전문적 심리/관계 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 8개 (16%) - 감정 표현
- description (묘사): 6개 (12%) - 관계/감정 설명
- question (질문): 5개 (10%) - 가족/관계 질문
- opinion (의견): 4개 (8%) - 관계 의견
- greeting (인사): 4개 (8%) - 가족 인사
- request (요청): 4개 (8%) - 가족 요청
- suggestion (제안): 4개 (8%) - 관계 제안
- instruction (지시): 3개 (6%) - 관계 지시
- gratitude (감사): 3개 (6%) - 가족 감사
- agreement (동의): 3개 (6%) - 관계 동의
- apology (사과): 3개 (6%) - 관계 사과
- refusal (거절): 3개 (6%) - 관계 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 9개 (18%) - 감정/관계 형용사
- noun (명사): 8개 (16%) - 가족/관계 명사
- verb (동사): 7개 (14%) - 관계/감정 동사
- interjection (감탄사): 6개 (12%) - 감정 감탄사
- interrogative (의문사): 5개 (10%) - 관계 의문사
- other (기타): 5개 (10%) - 관계 구문
- adverb (부사): 4개 (8%) - 감정 부사
- preposition (전치사): 3개 (6%) - 관계 전치사
- conjunction (접속사): 2개 (4%) - 관계 접속사
- determiner (한정사): 1개 (2%) - 관계 한정사

**상황 분포:**
- casual + home: 15개 (30%) - 편안한 집
- casual + social: 8개 (16%) - 편안한 사회
- polite + social: 7개 (14%) - 정중한 사회
- polite + home: 6개 (12%) - 정중한 집
- casual + public: 4개 (8%) - 편안한 공공
- polite + public: 4개 (8%) - 정중한 공공
- casual + work: 3개 (6%) - 편안한 업무
- polite + work: 2개 (4%) - 정중한 업무
- formal + public: 1개 (2%) - 공식 공공

family, relationships, emotions를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-3번 배치 (50개): daily-household+furniture+personal_care 테마 최대 다양성

```
일상생활(daily) 도메인의 household(가사), furniture(가구), personal_care(개인관리) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- household (가사): 20개 (40%) - 집안일, 가사 업무
- furniture (가구): 18개 (36%) - 가구, 인테리어
- personal_care (개인관리): 12개 (24%) - 개인 위생, 몸단장

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 가사/가구/개인관리
- intermediate (중급): 12개 (24%) - 복잡한 집안 관리
- advanced (고급): 10개 (20%) - 세밀한 관리 기법
- fluent (유창): 8개 (16%) - 유창한 생활 표현
- technical (전문): 6개 (12%) - 전문적 관리 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 7개 (14%) - 가사/관리 지시
- description (묘사): 6개 (12%) - 가구/관리 설명
- request (요청): 5개 (10%) - 가사 요청
- suggestion (제안): 4개 (8%) - 관리 제안
- opinion (의견): 4개 (8%) - 가구/관리 의견
- question (질문): 4개 (8%) - 가사 질문
- emotion (감정): 4개 (8%) - 가사 감정
- gratitude (감사): 3개 (6%) - 가사 감사
- greeting (인사): 3개 (6%) - 생활 인사
- agreement (동의): 3개 (6%) - 관리 동의
- apology (사과): 3개 (6%) - 가사 사과
- refusal (거절): 4개 (8%) - 가사 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 9개 (18%) - 가사/관리 동사
- noun (명사): 8개 (16%) - 가구/용품 명사
- adjective (형용사): 7개 (14%) - 가구/상태 형용사
- adverb (부사): 6개 (12%) - 관리 방법 부사
- other (기타): 5개 (10%) - 가사 구문
- interjection (감탄사): 4개 (8%) - 가사 감탄사
- interrogative (의문사): 4개 (8%) - 관리 의문사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 가구 한정사

**상황 분포:**
- casual + home: 18개 (36%) - 편안한 집
- polite + home: 10개 (20%) - 정중한 집
- casual + store: 6개 (12%) - 편안한 상점
- polite + store: 5개 (10%) - 정중한 상점
- casual + social: 4개 (8%) - 편안한 사회
- polite + social: 3개 (6%) - 정중한 사회
- casual + public: 2개 (4%) - 편안한 공공
- polite + public: 1개 (2%) - 정중한 공공
- casual + work: 1개 (2%) - 편안한 업무

household, furniture, personal_care를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-4번 배치 (50개): daily-shopping+clothing+leisure 테마 최대 다양성

```
일상생활(daily) 도메인의 shopping(쇼핑), clothing(의복), leisure(여가) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- shopping (쇼핑): 20개 (40%) - 쇼핑 활동, 구매
- clothing (의복): 18개 (36%) - 의류, 패션
- leisure (여가): 12개 (24%) - 여가 활동, 취미

**난이도 분포 (5개 모두 포함):**
- basic (기초): 13개 (26%) - 기본 쇼핑/의복/여가
- intermediate (중급): 11개 (22%) - 복잡한 쇼핑/패션
- advanced (고급): 10개 (20%) - 세밀한 취향 분석
- fluent (유창): 9개 (18%) - 유창한 쇼핑 표현
- technical (전문): 7개 (14%) - 전문적 패션/여가 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 7개 (14%) - 쇼핑/패션 의견
- emotion (감정): 6개 (12%) - 쇼핑/여가 감정
- request (요청): 5개 (10%) - 쇼핑 요청
- suggestion (제안): 4개 (8%) - 여가 제안
- description (묘사): 4개 (8%) - 의복/여가 설명
- question (질문): 4개 (8%) - 쇼핑 질문
- gratitude (감사): 4개 (8%) - 쇼핑 감사
- greeting (인사): 3개 (6%) - 쇼핑 인사
- agreement (동의): 3개 (6%) - 여가 동의
- instruction (지시): 3개 (6%) - 쇼핑 지시
- apology (사과): 3개 (6%) - 쇼핑 사과
- refusal (거절): 4개 (8%) - 쇼핑 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 의복/여가 명사
- adjective (형용사): 8개 (16%) - 패션/여가 형용사
- verb (동사): 7개 (14%) - 쇼핑/여가 동사
- interjection (감탄사): 6개 (12%) - 쇼핑 감탄사
- other (기타): 5개 (10%) - 쇼핑 구문
- interrogative (의문사): 4개 (8%) - 쇼핑 의문사
- adverb (부사): 4개 (8%) - 쇼핑 부사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 의복 한정사

**상황 분포:**
- casual + store: 12개 (24%) - 편안한 상점
- polite + store: 8개 (16%) - 정중한 상점
- casual + social: 7개 (14%) - 편안한 사회
- polite + social: 6개 (12%) - 정중한 사회
- casual + home: 5개 (10%) - 편안한 집
- casual + public: 4개 (8%) - 편안한 공공
- polite + public: 3개 (6%) - 정중한 공공
- polite + home: 3개 (6%) - 정중한 집
- casual + mall: 1개 (2%) - 편안한 쇼핑몰
- polite + mall: 1개 (2%) - 정중한 쇼핑몰

shopping, clothing, leisure를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-5번 배치 (50개): daily-communication+transportation+other 테마 최대 다양성

```
일상생활(daily) 도메인의 communication(소통), transportation(교통), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- communication (소통): 20개 (40%) - 의사소통, 대화
- transportation (교통): 18개 (36%) - 교통수단, 이동
- other (기타): 12개 (24%) - 기타 일상 활동

**난이도 분포 (5개 모두 포함):**
- basic (기초): 12개 (24%) - 기본 소통/교통
- intermediate (중급): 12개 (24%) - 복잡한 소통/교통
- advanced (고급): 11개 (22%) - 세밀한 소통 분석
- fluent (유창): 8개 (16%) - 유창한 소통 표현
- technical (전문): 7개 (14%) - 전문적 소통/교통 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 6개 (12%) - 소통/교통 지시
- request (요청): 5개 (10%) - 교통/소통 요청
- question (질문): 5개 (10%) - 소통 질문
- suggestion (제안): 5개 (10%) - 소통 제안
- description (묘사): 4개 (8%) - 교통/소통 설명
- opinion (의견): 4개 (8%) - 소통 의견
- greeting (인사): 4개 (8%) - 소통 인사
- emotion (감정): 4개 (8%) - 소통 감정
- agreement (동의): 3개 (6%) - 소통 동의
- gratitude (감사): 3개 (6%) - 교통 감사
- apology (사과): 3개 (6%) - 소통 사과
- refusal (거절): 4개 (8%) - 소통 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 8개 (16%) - 소통/교통 동사
- noun (명사): 7개 (14%) - 교통/소통 명사
- other (기타): 7개 (14%) - 소통 구문
- adjective (형용사): 6개 (12%) - 소통 형용사
- adverb (부사): 5개 (10%) - 소통 부사
- interrogative (의문사): 4개 (8%) - 소통 의문사
- interjection (감탄사): 4개 (8%) - 소통 감탄사
- preposition (전치사): 3개 (6%) - 교통 전치사
- conjunction (접속사): 3개 (6%) - 소통 접속사
- determiner (한정사): 3개 (6%) - 소통 한정사

**상황 분포:**
- polite + public: 10개 (20%) - 정중한 공공교통
- casual + public: 8개 (16%) - 편안한 공공교통
- polite + social: 7개 (14%) - 정중한 사회
- casual + social: 6개 (12%) - 편안한 사회
- polite + work: 5개 (10%) - 정중한 업무
- casual + work: 4개 (8%) - 편안한 업무
- polite + home: 4개 (8%) - 정중한 집
- casual + home: 3개 (6%) - 편안한 집
- formal + work: 2개 (4%) - 공식 업무
- formal + public: 1개 (2%) - 공식 공공

communication, transportation, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-6번 배치 (50개): food-cooking+kitchen_utensils+spices 테마 최대 다양성

```
음식(food) 도메인의 cooking(요리), kitchen_utensils(주방용품), spices(향신료) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- cooking (요리): 20개 (40%) - 요리 과정, 조리법
- kitchen_utensils (주방용품): 18개 (36%) - 주방 도구, 기구
- spices (향신료): 12개 (24%) - 향신료, 조미료

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 요리/도구/향신료
- intermediate (중급): 12개 (24%) - 복잡한 요리법
- advanced (고급): 10개 (20%) - 세밀한 요리 기법
- fluent (유창): 8개 (16%) - 유창한 요리 표현
- technical (전문): 5개 (10%) - 전문적 조리 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 요리 지시
- description (묘사): 6개 (12%) - 요리/도구 설명
- request (요청): 5개 (10%) - 요리 요청
- opinion (의견): 4개 (8%) - 요리 의견
- question (질문): 4개 (8%) - 요리 질문
- suggestion (제안): 4개 (8%) - 요리 제안
- emotion (감정): 4개 (8%) - 요리 감정
- gratitude (감사): 3개 (6%) - 요리 감사
- greeting (인사): 3개 (6%) - 요리 관련 인사
- agreement (동의): 3개 (6%) - 요리 동의
- apology (사과): 3개 (6%) - 요리 사과
- refusal (거절): 3개 (6%) - 요리 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 12개 (24%) - 요리 동사
- noun (명사): 8개 (16%) - 도구/향신료 명사
- adjective (형용사): 7개 (14%) - 맛/상태 형용사
- adverb (부사): 6개 (12%) - 요리 방법 부사
- other (기타): 5개 (10%) - 요리 구문
- interjection (감탄사): 4개 (8%) - 요리 감탄사
- interrogative (의문사): 3개 (6%) - 요리 의문사
- preposition (전치사): 2개 (4%) - 요리 전치사
- conjunction (접속사): 2개 (4%) - 요리 접속사
- determiner (한정사): 1개 (2%) - 요리 한정사

**상황 분포:**
- casual + home: 15개 (30%) - 편안한 집 요리
- polite + home: 8개 (16%) - 정중한 집 요리
- casual + restaurant: 6개 (12%) - 편안한 음식점
- polite + restaurant: 6개 (12%) - 정중한 음식점
- casual + social: 4개 (8%) - 편안한 사회
- polite + social: 3개 (6%) - 정중한 사회
- casual + store: 3개 (6%) - 편안한 상점
- polite + store: 2개 (4%) - 정중한 상점
- casual + class: 2개 (4%) - 편안한 요리교실
- polite + class: 1개 (2%) - 정중한 요리교실

cooking, kitchen_utensils, spices를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-7번 배치 (50개): food-fruit+vegetable+grain 테마 최대 다양성

```
음식(food) 도메인의 fruit(과일), vegetable(채소), grain(곡물) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- fruit (과일): 18개 (36%) - 다양한 과일
- vegetable (채소): 18개 (36%) - 다양한 채소
- grain (곡물): 14개 (28%) - 곡물, 곡류

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 과일/채소/곡물
- intermediate (중급): 12개 (24%) - 복잡한 농산물 지식
- advanced (고급): 9개 (18%) - 세밀한 영양 분석
- fluent (유창): 8개 (16%) - 유창한 농산물 표현
- technical (전문): 5개 (10%) - 전문적 농업 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 7개 (14%) - 농산물 설명
- opinion (의견): 6개 (12%) - 맛/품질 의견
- question (질문): 5개 (10%) - 농산물 질문
- request (요청): 4개 (8%) - 구매 요청
- suggestion (제안): 4개 (8%) - 농산물 제안
- emotion (감정): 4개 (8%) - 맛 감정
- instruction (지시): 4개 (8%) - 선택 지시
- gratitude (감사): 3개 (6%) - 구매 감사
- greeting (인사): 3개 (6%) - 시장 인사
- agreement (동의): 3개 (6%) - 선택 동의
- apology (사과): 3개 (6%) - 구매 사과
- refusal (거절): 4개 (8%) - 구매 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 10개 (20%) - 농산물 명사
- adjective (형용사): 8개 (16%) - 맛/상태 형용사
- verb (동사): 7개 (14%) - 농산물 동사
- other (기타): 5개 (10%) - 농산물 구문
- interrogative (의문사): 5개 (10%) - 농산물 의문사
- adverb (부사): 4개 (8%) - 상태 부사
- interjection (감탄사): 4개 (8%) - 맛 감탄사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 농산물 한정사

**상황 분포:**
- casual + store: 12개 (24%) - 편안한 상점
- polite + store: 10개 (20%) - 정중한 상점
- casual + market: 8개 (16%) - 편안한 시장
- polite + market: 6개 (12%) - 정중한 시장
- casual + home: 6개 (12%) - 편안한 집
- polite + home: 4개 (8%) - 정중한 집
- casual + restaurant: 2개 (4%) - 편안한 음식점
- polite + restaurant: 1개 (2%) - 정중한 음식점
- casual + farm: 1개 (2%) - 편안한 농장

fruit, vegetable, grain을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-8번 배치 (50개): food-meat+seafood+dairy 테마 최대 다양성

```
음식(food) 도메인의 meat(고기), seafood(해산물), dairy(유제품) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- meat (고기): 18개 (36%) - 육류, 고기 요리
- seafood (해산물): 18개 (36%) - 수산물, 해산물 요리
- dairy (유제품): 14개 (28%) - 유제품, 낙농 제품

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 육류/해산물/유제품
- intermediate (중급): 12개 (24%) - 복잡한 조리법
- advanced (고급): 10개 (20%) - 세밀한 육류 지식
- fluent (유창): 8개 (16%) - 유창한 요리 표현
- technical (전문): 5개 (10%) - 전문적 식품 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 6개 (12%) - 육류/해산물 설명
- opinion (의견): 5개 (10%) - 맛/품질 의견
- request (요청): 5개 (10%) - 주문 요청
- question (질문): 4개 (8%) - 조리법 질문
- instruction (지시): 4개 (8%) - 조리 지시
- suggestion (제안): 4개 (8%) - 메뉴 제안
- emotion (감정): 4개 (8%) - 맛 감정
- gratitude (감사): 4개 (8%) - 서비스 감사
- greeting (인사): 3개 (6%) - 식당 인사
- agreement (동의): 3개 (6%) - 주문 동의
- apology (사과): 4개 (8%) - 주문 사과
- refusal (거절): 4개 (8%) - 주문 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 육류/해산물 명사
- verb (동사): 8개 (16%) - 조리 동사
- adjective (형용사): 7개 (14%) - 맛/신선도 형용사
- other (기타): 6개 (12%) - 요리 구문
- interjection (감탄사): 5개 (10%) - 맛 감탄사
- interrogative (의문사): 4개 (8%) - 주문 의문사
- adverb (부사): 4개 (8%) - 조리 부사
- preposition (전치사): 3개 (6%) - 조리 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 육류 한정사

**상황 분포:**
- polite + restaurant: 12개 (24%) - 정중한 음식점
- casual + restaurant: 8개 (16%) - 편안한 음식점
- polite + market: 6개 (12%) - 정중한 시장
- casual + market: 6개 (12%) - 편안한 시장
- polite + store: 5개 (10%) - 정중한 상점
- casual + store: 4개 (8%) - 편안한 상점
- casual + home: 4개 (8%) - 편안한 집
- polite + home: 3개 (6%) - 정중한 집
- polite + butcher: 1개 (2%) - 정중한 정육점
- casual + butcher: 1개 (2%) - 편안한 정육점

meat, seafood, dairy를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-9번 배치 (50개): food-drink+snack+dessert 테마 최대 다양성

```
음식(food) 도메인의 drink(음료), snack(간식), dessert(디저트) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- drink (음료): 18개 (36%) - 음료수, 음료 문화
- snack (간식): 18개 (36%) - 간식, 스낵
- dessert (디저트): 14개 (28%) - 디저트, 후식

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 음료/간식/디저트
- intermediate (중급): 12개 (24%) - 복잡한 음료/디저트
- advanced (고급): 10개 (20%) - 세밀한 맛 분석
- fluent (유창): 8개 (16%) - 유창한 음료 표현
- technical (전문): 6개 (12%) - 전문적 음료 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 6개 (12%) - 음료/간식 요청
- opinion (의견): 5개 (10%) - 맛 의견
- emotion (감정): 5개 (10%) - 맛 감정
- description (묘사): 4개 (8%) - 음료/디저트 설명
- suggestion (제안): 4개 (8%) - 음료 제안
- gratitude (감사): 4개 (8%) - 서비스 감사
- question (질문): 4개 (8%) - 음료 질문
- greeting (인사): 4개 (8%) - 카페 인사
- instruction (지시): 3개 (6%) - 주문 지시
- agreement (동의): 3개 (6%) - 선택 동의
- apology (사과): 4개 (8%) - 주문 사과
- refusal (거절): 4개 (8%) - 주문 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 음료/간식 명사
- adjective (형용사): 8개 (16%) - 맛/온도 형용사
- verb (동사): 7개 (14%) - 음료 동사
- interjection (감탄사): 6개 (12%) - 맛 감탄사
- other (기타): 5개 (10%) - 음료 구문
- interrogative (의문사): 5개 (10%) - 주문 의문사
- adverb (부사): 4개 (8%) - 맛 부사
- preposition (전치사): 3개 (6%) - 음료 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 음료 한정사

**상황 분포:**
- casual + cafe: 10개 (20%) - 편안한 카페
- polite + cafe: 8개 (16%) - 정중한 카페
- casual + home: 7개 (14%) - 편안한 집
- polite + restaurant: 6개 (12%) - 정중한 음식점
- casual + restaurant: 5개 (10%) - 편안한 음식점
- polite + home: 4개 (8%) - 정중한 집
- casual + social: 3개 (6%) - 편안한 사회
- polite + social: 3개 (6%) - 정중한 사회
- casual + store: 2개 (4%) - 편안한 상점
- polite + store: 2개 (4%) - 정중한 상점

drink, snack, dessert를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-10번 배치 (50개): food-dining+restaurant+other 테마 최대 다양성

```
음식(food) 도메인의 dining(식사), restaurant(음식점), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- dining (식사): 20개 (40%) - 식사 예절, 식사 문화
- restaurant (음식점): 18개 (36%) - 음식점 이용, 서비스
- other (기타): 12개 (24%) - 기타 음식 관련

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 식사/음식점 이용
- intermediate (중급): 12개 (24%) - 복잡한 식사 상황
- advanced (고급): 10개 (20%) - 세밀한 식사 예절
- fluent (유창): 8개 (16%) - 유창한 식사 표현
- technical (전문): 5개 (10%) - 전문적 외식업 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 7개 (14%) - 식당 요청
- gratitude (감사): 6개 (12%) - 식당 감사
- description (묘사): 5개 (10%) - 식사/식당 설명
- opinion (의견): 4개 (8%) - 음식점 의견
- greeting (인사): 4개 (8%) - 식당 인사
- question (질문): 4개 (8%) - 메뉴 질문
- emotion (감정): 4개 (8%) - 식사 감정
- suggestion (제안): 3개 (6%) - 메뉴 제안
- instruction (지시): 3개 (6%) - 주문 지시
- agreement (동의): 3개 (6%) - 주문 동의
- apology (사과): 3개 (6%) - 식당 사과
- refusal (거절): 4개 (8%) - 주문 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 식사/식당 명사
- verb (동사): 7개 (14%) - 식사 동사
- other (기타): 7개 (14%) - 식당 구문
- adjective (형용사): 6개 (12%) - 음식 형용사
- interrogative (의문사): 5개 (10%) - 주문 의문사
- interjection (감탄사): 5개 (10%) - 식사 감탄사
- adverb (부사): 4개 (8%) - 식사 부사
- preposition (전치사): 3개 (6%) - 식당 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 식당 한정사

**상황 분포:**
- polite + restaurant: 18개 (36%) - 정중한 음식점
- casual + restaurant: 10개 (20%) - 편안한 음식점
- polite + home: 6개 (12%) - 정중한 집
- casual + home: 5개 (10%) - 편안한 집
- polite + social: 4개 (8%) - 정중한 사회
- casual + social: 3개 (6%) - 편안한 사회
- formal + restaurant: 2개 (4%) - 공식 음식점
- polite + public: 1개 (2%) - 정중한 공공
- casual + public: 1개 (2%) - 편안한 공공

dining, restaurant, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-11번 배치 (50개): education-teaching+learning+classroom 테마 최대 다양성

```
교육(education) 도메인의 teaching(교육), learning(학습), classroom(교실) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- teaching (교육): 18개 (36%) - 교육 방법, 가르치기
- learning (학습): 18개 (36%) - 학습 과정, 배우기
- classroom (교실): 14개 (28%) - 교실 환경, 수업

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 교육/학습/교실
- intermediate (중급): 12개 (24%) - 복잡한 교육 방법
- advanced (고급): 10개 (20%) - 세밀한 교육 기법
- fluent (유창): 8개 (16%) - 유창한 교육 표현
- technical (전문): 6개 (12%) - 전문적 교육학 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 교육 지시
- description (묘사): 6개 (12%) - 교육/학습 설명
- question (질문): 5개 (10%) - 교육 질문
- suggestion (제안): 4개 (8%) - 교육 제안
- opinion (의견): 4개 (8%) - 교육 의견
- request (요청): 4개 (8%) - 교육 요청
- greeting (인사): 3개 (6%) - 교육 관련 인사
- emotion (감정): 3개 (6%) - 교육 감정
- gratitude (감사): 3개 (6%) - 교육 감사
- agreement (동의): 3개 (6%) - 교육 동의
- apology (사과): 3개 (6%) - 교육 사과
- refusal (거절): 4개 (8%) - 교육 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 12개 (24%) - 교육/학습 동사
- noun (명사): 8개 (16%) - 교육 명사
- adjective (형용사): 6개 (12%) - 교육 형용사
- adverb (부사): 6개 (12%) - 교육 부사
- other (기타): 5개 (10%) - 교육 구문
- interrogative (의문사): 4개 (8%) - 교육 의문사
- interjection (감탄사): 3개 (6%) - 교육 감탄사
- preposition (전치사): 3개 (6%) - 교육 전치사
- conjunction (접속사): 2개 (4%) - 교육 접속사
- determiner (한정사): 1개 (2%) - 교육 한정사

**상황 분포:**
- polite + school: 15개 (30%) - 정중한 학교
- formal + school: 8개 (16%) - 공식 학교
- polite + classroom: 7개 (14%) - 정중한 교실
- casual + school: 6개 (12%) - 편안한 학교
- casual + classroom: 5개 (10%) - 편안한 교실
- polite + library: 3개 (6%) - 정중한 도서관
- polite + work: 2개 (4%) - 정중한 업무
- formal + classroom: 2개 (4%) - 공식 교실
- casual + library: 1개 (2%) - 편안한 도서관
- formal + work: 1개 (2%) - 공식 업무

teaching, learning, classroom을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-12번 배치 (50개): education-curriculum+assessment+pedagogy 테마 최대 다양성

```
교육(education) 도메인의 curriculum(교육과정), assessment(평가), pedagogy(교육학) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- curriculum (교육과정): 18개 (36%) - 교육과정, 커리큘럼
- assessment (평가): 18개 (36%) - 평가, 시험, 성적
- pedagogy (교육학): 14개 (28%) - 교육학 이론, 교수법

**난이도 분포 (5개 모두 포함):**
- basic (기초): 13개 (26%) - 기본 교육과정/평가
- intermediate (중급): 12개 (24%) - 복잡한 평가 시스템
- advanced (고급): 11개 (22%) - 세밀한 교육학 이론
- fluent (유창): 8개 (16%) - 유창한 교육학 표현
- technical (전문): 6개 (12%) - 전문적 교육학 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 7개 (14%) - 교육과정/평가 설명
- opinion (의견): 6개 (12%) - 교육학 의견
- question (질문): 5개 (10%) - 평가 질문
- instruction (지시): 4개 (8%) - 교육과정 지시
- suggestion (제안): 4개 (8%) - 교육 개선 제안
- request (요청): 4개 (8%) - 교육 요청
- emotion (감정): 4개 (8%) - 평가 감정
- agreement (동의): 3개 (6%) - 교육 정책 동의
- gratitude (감사): 3개 (6%) - 교육 감사
- greeting (인사): 3개 (6%) - 교육 관련 인사
- apology (사과): 3개 (6%) - 교육 사과
- refusal (거절): 4개 (8%) - 교육 정책 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 10개 (20%) - 교육학 명사
- verb (동사): 8개 (16%) - 교육 동사
- adjective (형용사): 7개 (14%) - 교육 형용사
- other (기타): 6개 (12%) - 교육학 구문
- adverb (부사): 5개 (10%) - 교육 부사
- interrogative (의문사): 4개 (8%) - 교육 의문사
- interjection (감탄사): 3개 (6%) - 교육 감탄사
- preposition (전치사): 3개 (6%) - 교육 전치사
- conjunction (접속사): 2개 (4%) - 교육 접속사
- determiner (한정사): 2개 (4%) - 교육 한정사

**상황 분포:**
- formal + school: 12개 (24%) - 공식 학교
- polite + school: 10개 (20%) - 정중한 학교
- formal + office: 6개 (12%) - 공식 사무실
- polite + office: 5개 (10%) - 정중한 사무실
- formal + conference: 5개 (10%) - 공식 컨퍼런스
- polite + conference: 4개 (8%) - 정중한 컨퍼런스
- formal + university: 3개 (6%) - 공식 대학교
- polite + university: 2개 (4%) - 정중한 대학교
- formal + meeting: 2개 (4%) - 공식 회의
- polite + meeting: 1개 (2%) - 정중한 회의

curriculum, assessment, pedagogy를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-13번 배치 (50개): education-skill_development+online_learning+training 테마 최대 다양성

```
교육(education) 도메인의 skill_development(기술개발), online_learning(온라인학습), training(훈련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- skill_development (기술개발): 18개 (36%) - 기술 향상, 역량 개발
- online_learning (온라인학습): 18개 (36%) - 원격교육, 이러닝
- training (훈련): 14개 (28%) - 직업 훈련, 실습

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 기술개발/온라인학습
- intermediate (중급): 12개 (24%) - 복잡한 훈련 과정
- advanced (고급): 10개 (20%) - 세밀한 기술 분석
- fluent (유창): 9개 (18%) - 유창한 훈련 표현
- technical (전문): 5개 (10%) - 전문적 훈련 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 7개 (14%) - 훈련 지시
- suggestion (제안): 6개 (12%) - 기술개발 제안
- description (묘사): 5개 (10%) - 온라인학습 설명
- question (질문): 4개 (8%) - 훈련 질문
- request (요청): 4개 (8%) - 기술개발 요청
- opinion (의견): 4개 (8%) - 온라인학습 의견
- emotion (감정): 4개 (8%) - 훈련 감정
- greeting (인사): 3개 (6%) - 훈련 관련 인사
- gratitude (감사): 3개 (6%) - 훈련 감사
- agreement (동의): 3개 (6%) - 기술개발 동의
- apology (사과): 3개 (6%) - 훈련 사과
- refusal (거절): 4개 (8%) - 훈련 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 9개 (18%) - 기술개발 동사
- noun (명사): 8개 (16%) - 훈련 명사
- adjective (형용사): 7개 (14%) - 기술 형용사
- other (기타): 6개 (12%) - 훈련 구문
- adverb (부사): 5개 (10%) - 훈련 부사
- interrogative (의문사): 4개 (8%) - 훈련 의문사
- interjection (감탄사): 4개 (8%) - 훈련 감탄사
- preposition (전치사): 3개 (6%) - 훈련 전치사
- conjunction (접속사): 2개 (4%) - 훈련 접속사
- determiner (한정사): 2개 (4%) - 훈련 한정사

**상황 분포:**
- polite + office: 10개 (20%) - 정중한 사무실
- casual + home: 8개 (16%) - 편안한 집
- polite + training_center: 7개 (14%) - 정중한 훈련센터
- casual + training_center: 5개 (10%) - 편안한 훈련센터
- polite + work: 5개 (10%) - 정중한 업무
- casual + work: 4개 (8%) - 편안한 업무
- polite + online: 4개 (8%) - 정중한 온라인
- casual + online: 3개 (6%) - 편안한 온라인
- formal + office: 2개 (4%) - 공식 사무실
- polite + school: 2개 (4%) - 정중한 학교

skill_development, online_learning, training을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-14번 배치 (50개): education-certification+educational_technology+student_life 테마 최대 다양성

```
교육(education) 도메인의 certification(자격증), educational_technology(교육기술), student_life(학생생활) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- certification (자격증): 18개 (36%) - 자격증, 인증
- educational_technology (교육기술): 18개 (36%) - 교육용 기술, 에듀테크
- student_life (학생생활): 14개 (28%) - 학생 생활, 캠퍼스 라이프

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 자격증/기술/학생생활
- intermediate (중급): 12개 (24%) - 복잡한 교육기술
- advanced (고급): 10개 (20%) - 세밀한 자격 분석
- fluent (유창): 8개 (16%) - 유창한 학생 표현
- technical (전문): 5개 (10%) - 전문적 교육기술 용어

**목적 분포 (12개 모두 포함):**
- question (질문): 6개 (12%) - 자격증/기술 질문
- description (묘사): 5개 (10%) - 교육기술 설명
- suggestion (제안): 5개 (10%) - 학생생활 제안
- request (요청): 4개 (8%) - 자격증 요청
- opinion (의견): 4개 (8%) - 교육기술 의견
- instruction (지시): 4개 (8%) - 기술 사용 지시
- emotion (감정): 4개 (8%) - 학생생활 감정
- greeting (인사): 3개 (6%) - 학생 인사
- gratitude (감사): 3개 (6%) - 교육 감사
- agreement (동의): 3개 (6%) - 기술 사용 동의
- apology (사과): 4개 (8%) - 학생생활 사과
- refusal (거절): 5개 (10%) - 자격증 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 자격증/기술 명사
- verb (동사): 8개 (16%) - 기술 사용 동사
- adjective (형용사): 7개 (14%) - 기술 형용사
- other (기타): 6개 (12%) - 학생생활 구문
- interrogative (의문사): 5개 (10%) - 자격증 의문사
- adverb (부사): 4개 (8%) - 기술 부사
- interjection (감탄사): 4개 (8%) - 학생생활 감탄사
- preposition (전치사): 3개 (6%) - 기술 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 자격증 한정사

**상황 분포:**
- casual + school: 12개 (24%) - 편안한 학교
- polite + school: 8개 (16%) - 정중한 학교
- casual + online: 6개 (12%) - 편안한 온라인
- polite + office: 5개 (10%) - 정중한 사무실
- polite + online: 5개 (10%) - 정중한 온라인
- casual + office: 4개 (8%) - 편안한 사무실
- casual + home: 3개 (6%) - 편안한 집
- polite + university: 3개 (6%) - 정중한 대학교
- casual + university: 2개 (4%) - 편안한 대학교
- polite + home: 2개 (4%) - 정중한 집

certification, educational_technology, student_life를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-15번 배치 (50개): education-graduation+examination+university 테마 최대 다양성

```
교육(education) 도메인의 graduation(졸업), examination(시험), university(대학교) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- graduation (졸업): 18개 (36%) - 졸업, 졸업식, 학위
- examination (시험): 18개 (36%) - 시험, 시험 준비
- university (대학교): 14개 (28%) - 대학 생활, 대학 시스템

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 졸업/시험/대학
- intermediate (중급): 12개 (24%) - 복잡한 시험 시스템
- advanced (고급): 10개 (20%) - 세밀한 대학 분석
- fluent (유창): 9개 (18%) - 유창한 학술 표현
- technical (전문): 5개 (10%) - 전문적 학술 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 7개 (14%) - 졸업/시험 감정
- description (묘사): 6개 (12%) - 대학/시험 설명
- question (질문): 5개 (10%) - 시험/대학 질문
- suggestion (제안): 4개 (8%) - 시험 준비 제안
- opinion (의견): 4개 (8%) - 대학 시스템 의견
- request (요청): 4개 (8%) - 졸업/시험 요청
- greeting (인사): 4개 (8%) - 졸업/대학 인사
- gratitude (감사): 3개 (6%) - 졸업 감사
- instruction (지시): 3개 (6%) - 시험 지시
- agreement (동의): 3개 (6%) - 대학 정책 동의
- apology (사과): 3개 (6%) - 시험 사과
- refusal (거절): 4개 (8%) - 대학 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 졸업/시험/대학 명사
- adjective (형용사): 8개 (16%) - 시험/대학 형용사
- verb (동사): 7개 (14%) - 졸업/시험 동사
- interjection (감탄사): 6개 (12%) - 졸업 감탄사
- other (기타): 5개 (10%) - 대학 구문
- interrogative (의문사): 4개 (8%) - 시험 의문사
- adverb (부사): 4개 (8%) - 시험 부사
- preposition (전치사): 3개 (6%) - 대학 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 대학 한정사

**상황 분포:**
- polite + university: 12개 (24%) - 정중한 대학교
- casual + university: 8개 (16%) - 편안한 대학교
- formal + university: 6개 (12%) - 공식 대학교
- polite + school: 5개 (10%) - 정중한 학교
- casual + school: 5개 (10%) - 편안한 학교
- polite + home: 4개 (8%) - 정중한 집
- casual + home: 3개 (6%) - 편안한 집
- formal + ceremony: 3개 (6%) - 공식 졸업식
- polite + ceremony: 2개 (4%) - 정중한 졸업식
- casual + social: 2개 (4%) - 편안한 사회

graduation, examination, university를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-16번 배치 (50개): education-library+other 테마 최대 다양성

```
교육(education) 도메인의 library(도서관), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- library (도서관): 30개 (60%) - 도서관 이용, 자료 검색
- other (기타): 20개 (40%) - 기타 교육 관련 활동

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 도서관 이용
- intermediate (중급): 13개 (26%) - 복잡한 자료 검색
- advanced (고급): 9개 (18%) - 세밀한 연구 방법
- fluent (유창): 7개 (14%) - 유창한 연구 표현
- technical (전문): 5개 (10%) - 전문적 연구 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 6개 (12%) - 도서관 요청
- question (질문): 5개 (10%) - 자료 검색 질문
- description (묘사): 5개 (10%) - 도서관 설명
- instruction (지시): 4개 (8%) - 이용 지시
- suggestion (제안): 4개 (8%) - 연구 제안
- opinion (의견): 4개 (8%) - 도서관 의견
- greeting (인사): 4개 (8%) - 도서관 인사
- gratitude (감사): 3개 (6%) - 도서관 감사
- emotion (감정): 3개 (6%) - 연구 감정
- agreement (동의): 3개 (6%) - 이용 동의
- apology (사과): 4개 (8%) - 도서관 사과
- refusal (거절): 5개 (10%) - 이용 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 도서관/연구 명사
- verb (동사): 8개 (16%) - 검색/연구 동사
- interrogative (의문사): 7개 (14%) - 검색 의문사
- adjective (형용사): 6개 (12%) - 자료 형용사
- other (기타): 5개 (10%) - 도서관 구문
- adverb (부사): 4개 (8%) - 검색 부사
- interjection (감탄사): 4개 (8%) - 도서관 감탄사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 자료 한정사

**상황 분포:**
- polite + library: 20개 (40%) - 정중한 도서관
- casual + library: 12개 (24%) - 편안한 도서관
- polite + school: 6개 (12%) - 정중한 학교
- casual + school: 4개 (8%) - 편안한 학교
- polite + university: 3개 (6%) - 정중한 대학교
- casual + university: 2개 (4%) - 편안한 대학교
- polite + office: 1개 (2%) - 정중한 사무실
- casual + office: 1개 (2%) - 편안한 사무실
- polite + home: 1개 (2%) - 정중한 집

library, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-17번 배치 (50개): travel-transportation+accommodation+booking 테마 최대 다양성

```
여행(travel) 도메인의 transportation(교통), accommodation(숙박), booking(예약) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- transportation (교통): 18개 (36%) - 교통수단, 이동
- accommodation (숙박): 18개 (36%) - 숙박시설, 호텔
- booking (예약): 14개 (28%) - 예약, 예약 확인

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 교통/숙박/예약
- intermediate (중급): 12개 (24%) - 복잡한 여행 계획
- advanced (고급): 10개 (20%) - 세밀한 여행 준비
- fluent (유창): 8개 (16%) - 유창한 여행 표현
- technical (전문): 5개 (10%) - 전문적 여행업 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 7개 (14%) - 교통/숙박 요청
- question (질문): 6개 (12%) - 예약 질문
- description (묘사): 5개 (10%) - 교통/숙박 설명
- instruction (지시): 4개 (8%) - 예약 지시
- suggestion (제안): 4개 (8%) - 여행 제안
- opinion (의견): 4개 (8%) - 교통/숙박 의견
- greeting (인사): 3개 (6%) - 여행 관련 인사
- gratitude (감사): 3개 (6%) - 서비스 감사
- emotion (감정): 3개 (6%) - 여행 감정
- agreement (동의): 3개 (6%) - 예약 동의
- apology (사과): 4개 (8%) - 예약 사과
- refusal (거절): 4개 (8%) - 예약 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 교통/숙박 명사
- verb (동사): 8개 (16%) - 예약/이동 동사
- other (기타): 7개 (14%) - 여행 구문
- adjective (형용사): 6개 (12%) - 숙박 형용사
- interrogative (의문사): 5개 (10%) - 예약 의문사
- adverb (부사): 4개 (8%) - 이동 부사
- interjection (감탄사): 4개 (8%) - 여행 감탄사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 교통 한정사

**상황 분포:**
- polite + travel: 12개 (24%) - 정중한 여행
- polite + public: 8개 (16%) - 정중한 공공교통
- casual + travel: 6개 (12%) - 편안한 여행
- polite + hotel: 5개 (10%) - 정중한 호텔
- casual + hotel: 4개 (8%) - 편안한 호텔
- formal + travel: 4개 (8%) - 공식 여행
- polite + airport: 3개 (6%) - 정중한 공항
- casual + public: 3개 (6%) - 편안한 공공교통
- polite + station: 3개 (6%) - 정중한 역
- casual + airport: 2개 (4%) - 편안한 공항

transportation, accommodation, booking을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-18번 배치 (50개): travel-tourist_attraction+sightseeing+culture 테마 최대 다양성

```
여행(travel) 도메인의 tourist_attraction(관광명소), sightseeing(관광), culture(문화) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- tourist_attraction (관광명소): 18개 (36%) - 명소, 랜드마크
- sightseeing (관광): 18개 (36%) - 관광 활동, 구경
- culture (문화): 14개 (28%) - 현지 문화, 전통

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 관광/명소
- intermediate (중급): 12개 (24%) - 복잡한 문화 체험
- advanced (고급): 10개 (20%) - 세밀한 문화 분석
- fluent (유창): 9개 (18%) - 유창한 관광 표현
- technical (전문): 5개 (10%) - 전문적 문화 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 8개 (16%) - 명소/문화 설명
- emotion (감정): 6개 (12%) - 관광 감정
- opinion (의견): 5개 (10%) - 명소 의견
- question (질문): 4개 (8%) - 관광 질문
- suggestion (제안): 4개 (8%) - 관광 제안
- request (요청): 4개 (8%) - 안내 요청
- greeting (인사): 3개 (6%) - 관광지 인사
- gratitude (감사): 3개 (6%) - 안내 감사
- instruction (지시): 3개 (6%) - 관광 지시
- agreement (동의): 3개 (6%) - 관광 동의
- apology (사과): 3개 (6%) - 관광 사과
- refusal (거절): 4개 (8%) - 관광 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 9개 (18%) - 명소/문화 형용사
- noun (명사): 8개 (16%) - 관광/문화 명사
- verb (동사): 7개 (14%) - 관광 동사
- interjection (감탄사): 6개 (12%) - 관광 감탄사
- other (기타): 5개 (10%) - 관광 구문
- adverb (부사): 4개 (8%) - 관광 부사
- interrogative (의문사): 4개 (8%) - 관광 의문사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 관광 한정사

**상황 분포:**
- casual + travel: 12개 (24%) - 편안한 여행
- polite + travel: 10개 (20%) - 정중한 여행
- casual + public: 6개 (12%) - 편안한 공공장소
- polite + public: 5개 (10%) - 정중한 공공장소
- casual + social: 4개 (8%) - 편안한 사회
- polite + social: 4개 (8%) - 정중한 사회
- casual + tourist_site: 3개 (6%) - 편안한 관광지
- polite + tourist_site: 3개 (6%) - 정중한 관광지
- casual + museum: 2개 (4%) - 편안한 박물관
- polite + museum: 1개 (2%) - 정중한 박물관

tourist_attraction, sightseeing, culture을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-19번 배치 (50개): travel-direction+luggage+currency 테마 최대 다양성

```
여행(travel) 도메인의 direction(길찾기), luggage(짐), currency(환전) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- direction (길찾기): 18개 (36%) - 길 안내, 방향
- luggage (짐): 18개 (36%) - 수하물, 짐 처리
- currency (환전): 14개 (28%) - 환전, 돈 교환

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 길찾기/짐/환전
- intermediate (중급): 13개 (26%) - 복잡한 여행 상황
- advanced (고급): 9개 (18%) - 세밀한 여행 처리
- fluent (유창): 7개 (14%) - 유창한 여행 표현
- technical (전문): 5개 (10%) - 전문적 여행업 용어

**목적 분포 (12개 모두 포함):**
- question (질문): 7개 (14%) - 길찾기/환전 질문
- request (요청): 6개 (12%) - 도움 요청
- instruction (지시): 5개 (10%) - 길 안내
- description (묘사): 4개 (8%) - 위치/상황 설명
- gratitude (감사): 4개 (8%) - 도움 감사
- suggestion (제안): 4개 (8%) - 여행 제안
- opinion (의견): 3개 (6%) - 환전 의견
- greeting (인사): 3개 (6%) - 여행 인사
- emotion (감정): 3개 (6%) - 여행 감정
- agreement (동의): 3개 (6%) - 환전 동의
- apology (사과): 4개 (8%) - 여행 사과
- refusal (거절): 4개 (8%) - 여행 거절

**품사 분포 (10개 모두 포함):**
- interrogative (의문사): 8개 (16%) - 길찾기 의문사
- noun (명사): 7개 (14%) - 짐/환전 명사
- verb (동사): 7개 (14%) - 이동/환전 동사
- adverb (부사): 6개 (12%) - 방향 부사
- preposition (전치사): 5개 (10%) - 위치 전치사
- other (기타): 5개 (10%) - 여행 구문
- adjective (형용사): 4개 (8%) - 짐/환전 형용사
- interjection (감탄사): 3개 (6%) - 여행 감탄사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 방향 한정사

**상황 분포:**
- polite + public: 12개 (24%) - 정중한 공공장소
- casual + public: 8개 (16%) - 편안한 공공장소
- polite + travel: 6개 (12%) - 정중한 여행
- casual + travel: 5개 (10%) - 편안한 여행
- polite + airport: 4개 (8%) - 정중한 공항
- polite + station: 4개 (8%) - 정중한 역
- casual + airport: 3개 (6%) - 편안한 공항
- polite + bank: 3개 (6%) - 정중한 은행
- casual + bank: 3개 (6%) - 편안한 은행
- polite + hotel: 2개 (4%) - 정중한 호텔

direction, luggage, currency를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.

```

### 1-20번 배치 (50개): travel-emergency+documents+souvenir 테마 최대 다양성

```
여행(travel) 도메인의 emergency(응급상황), documents(서류), souvenir(기념품) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- emergency (응급상황): 18개 (36%) - 응급 상황, 문제 해결
- documents (서류): 18개 (36%) - 여권, 비자, 서류
- souvenir (기념품): 14개 (28%) - 기념품, 선물

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 응급/서류/기념품
- intermediate (중급): 12개 (24%) - 복잡한 문제 상황
- advanced (고급): 10개 (20%) - 세밀한 문제 해결
- fluent (유창): 8개 (16%) - 유창한 문제 표현
- technical (전문): 5개 (10%) - 전문적 응급 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 8개 (16%) - 응급/도움 요청
- emotion (감정): 6개 (12%) - 응급/쇼핑 감정
- question (질문): 5개 (10%) - 서류/기념품 질문
- description (묘사): 4개 (8%) - 상황/기념품 설명
- instruction (지시): 4개 (8%) - 응급 지시
- gratitude (감사): 4개 (8%) - 도움 감사
- apology (사과): 4개 (8%) - 문제 사과
- suggestion (제안): 3개 (6%) - 기념품 제안
- opinion (의견): 3개 (6%) - 기념품 의견
- greeting (인사): 3개 (6%) - 상점 인사
- agreement (동의): 3개 (6%) - 구매 동의
- refusal (거절): 3개 (6%) - 구매 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 응급/서류/기념품 명사
- verb (동사): 8개 (16%) - 응급/구매 동사
- interjection (감탄사): 7개 (14%) - 응급 감탄사
- adjective (형용사): 6개 (12%) - 상황/기념품 형용사
- other (기타): 5개 (10%) - 응급 구문
- interrogative (의문사): 4개 (8%) - 응급 의문사
- adverb (부사): 4개 (8%) - 응급 부사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 응급 한정사

**상황 분포:**
- polite + public: 10개 (20%) - 정중한 공공장소
- urgent + public: 8개 (16%) - 긴급한 공공장소
- polite + travel: 6개 (12%) - 정중한 여행
- casual + shopping: 5개 (10%) - 편안한 쇼핑
- polite + shopping: 5개 (10%) - 정중한 쇼핑
- urgent + medical: 4개 (8%) - 긴급한 의료
- formal + office: 3개 (6%) - 공식 사무실
- polite + office: 3개 (6%) - 정중한 사무실
- casual + travel: 3개 (6%) - 편안한 여행
- urgent + travel: 3개 (6%) - 긴급한 여행

emergency, documents, souvenir를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-21번 배치 (50개): travel-local_food+other 테마 최대 다양성

```
여행(travel) 도메인의 local_food(현지음식), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- local_food (현지음식): 30개 (60%) - 현지 특산품, 전통 음식
- other (기타): 20개 (40%) - 기타 여행 관련 활동

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 현지음식/여행
- intermediate (중급): 13개 (26%) - 복잡한 음식 문화
- advanced (고급): 9개 (18%) - 세밀한 문화 체험
- fluent (유창): 7개 (14%) - 유창한 음식 표현
- technical (전문): 5개 (10%) - 전문적 요리 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 6개 (12%) - 음식 의견
- request (요청): 5개 (10%) - 음식 주문
- emotion (감정): 5개 (10%) - 음식 감정
- description (묘사): 4개 (8%) - 음식 설명
- question (질문): 4개 (8%) - 음식 질문
- suggestion (제안): 4개 (8%) - 음식 제안
- gratitude (감사): 4개 (8%) - 서비스 감사
- greeting (인사): 4개 (8%) - 음식점 인사
- instruction (지시): 3개 (6%) - 주문 지시
- agreement (동의): 3개 (6%) - 주문 동의
- apology (사과): 4개 (8%) - 주문 사과
- refusal (거절): 4개 (8%) - 주문 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 8개 (16%) - 음식 형용사
- noun (명사): 8개 (16%) - 음식/여행 명사
- verb (동사): 7개 (14%) - 먹기/여행 동사
- interjection (감탄사): 6개 (12%) - 음식 감탄사
- other (기타): 5개 (10%) - 음식 구문
- interrogative (의문사): 4개 (8%) - 음식 의문사
- adverb (부사): 4개 (8%) - 음식 부사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 음식 한정사

**상황 분포:**
- casual + restaurant: 12개 (24%) - 편안한 음식점
- polite + restaurant: 10개 (20%) - 정중한 음식점
- casual + travel: 8개 (16%) - 편안한 여행
- polite + travel: 6개 (12%) - 정중한 여행
- casual + social: 4개 (8%) - 편안한 사회
- polite + social: 4개 (8%) - 정중한 사회
- casual + market: 3개 (6%) - 편안한 시장
- polite + market: 2개 (4%) - 정중한 시장
- casual + street: 1개 (2%) - 편안한 길거리

local_food, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-22번 배치 (50개): business-meeting+presentation+communication 테마 최대 다양성

```
비즈니스(business) 도메인의 meeting(회의), presentation(발표), communication(커뮤니케이션) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- meeting (회의): 18개 (36%) - 회의, 미팅
- presentation (발표): 18개 (36%) - 프레젠테이션, 발표
- communication (커뮤니케이션): 14개 (28%) - 비즈니스 소통

**난이도 분포 (5개 모두 포함):**
- basic (기초): 13개 (26%) - 기본 회의/발표/소통
- intermediate (중급): 12개 (24%) - 복잡한 비즈니스 상황
- advanced (고급): 11개 (22%) - 세밀한 비즈니스 전략
- fluent (유창): 8개 (16%) - 유창한 비즈니스 표현
- technical (전문): 6개 (12%) - 전문적 비즈니스 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 7개 (14%) - 회의/발표 지시
- opinion (의견): 6개 (12%) - 비즈니스 의견
- suggestion (제안): 5개 (10%) - 비즈니스 제안
- description (묘사): 4개 (8%) - 프로젝트 설명
- question (질문): 4개 (8%) - 회의 질문
- request (요청): 4개 (8%) - 비즈니스 요청
- greeting (인사): 4개 (8%) - 비즈니스 인사
- agreement (동의): 3개 (6%) - 회의 동의
- gratitude (감사): 3개 (6%) - 비즈니스 감사
- emotion (감정): 3개 (6%) - 비즈니스 감정
- apology (사과): 3개 (6%) - 비즈니스 사과
- refusal (거절): 4개 (8%) - 비즈니스 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 비즈니스 명사
- verb (동사): 8개 (16%) - 비즈니스 동사
- other (기타): 7개 (14%) - 비즈니스 구문
- adjective (형용사): 6개 (12%) - 비즈니스 형용사
- adverb (부사): 5개 (10%) - 비즈니스 부사
- interrogative (의문사): 4개 (8%) - 회의 의문사
- interjection (감탄사): 4개 (8%) - 비즈니스 감탄사
- preposition (전치사): 3개 (6%) - 비즈니스 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 비즈니스 한정사

**상황 분포:**
- formal + work: 15개 (30%) - 공식 업무
- polite + work: 12개 (24%) - 정중한 업무
- formal + office: 8개 (16%) - 공식 사무실
- polite + office: 6개 (12%) - 정중한 사무실
- formal + conference: 4개 (8%) - 공식 컨퍼런스
- polite + conference: 3개 (6%) - 정중한 컨퍼런스
- formal + meeting_room: 1개 (2%) - 공식 회의실
- casual + work: 1개 (2%) - 편안한 업무

meeting, presentation, communication을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-23번 배치 (50개): business-finance+marketing+negotiation 테마 최대 다양성

```
비즈니스(business) 도메인의 finance(재정), marketing(마케팅), negotiation(협상) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- finance (재정): 18개 (36%) - 재무, 금융
- marketing (마케팅): 18개 (36%) - 마케팅, 홍보
- negotiation (협상): 14개 (28%) - 협상, 거래

**난이도 분포 (5개 모두 포함):**
- basic (기초): 12개 (24%) - 기본 재정/마케팅/협상
- intermediate (중급): 12개 (24%) - 복잡한 비즈니스 전략
- advanced (고급): 11개 (22%) - 세밀한 재무 분석
- fluent (유창): 9개 (18%) - 유창한 협상 표현
- technical (전문): 6개 (12%) - 전문적 금융 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 7개 (14%) - 재정/마케팅 의견
- suggestion (제안): 6개 (12%) - 비즈니스 제안
- description (묘사): 5개 (10%) - 재무/마케팅 설명
- question (질문): 4개 (8%) - 재정 질문
- instruction (지시): 4개 (8%) - 마케팅 지시
- request (요청): 4개 (8%) - 협상 요청
- agreement (동의): 4개 (8%) - 협상 동의
- greeting (인사): 3개 (6%) - 비즈니스 인사
- emotion (감정): 3개 (6%) - 협상 감정
- gratitude (감사): 3개 (6%) - 비즈니스 감사
- apology (사과): 3개 (6%) - 협상 사과
- refusal (거절): 4개 (8%) - 협상 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 10개 (20%) - 재정/마케팅 명사
- adjective (형용사): 8개 (16%) - 재무 형용사
- verb (동사): 7개 (14%) - 협상/마케팅 동사
- other (기타): 6개 (12%) - 비즈니스 구문
- adverb (부사): 5개 (10%) - 협상 부사
- interrogative (의문사): 4개 (8%) - 재정 의문사
- interjection (감탄사): 3개 (6%) - 협상 감탄사
- preposition (전치사): 3개 (6%) - 비즈니스 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 재정 한정사

**상황 분포:**
- formal + work: 16개 (32%) - 공식 업무
- polite + work: 10개 (20%) - 정중한 업무
- formal + office: 8개 (16%) - 공식 사무실
- polite + office: 6개 (12%) - 정중한 사무실
- formal + meeting: 4개 (8%) - 공식 회의
- polite + meeting: 3개 (6%) - 정중한 회의
- formal + bank: 2개 (4%) - 공식 은행
- polite + bank: 1개 (2%) - 정중한 은행

finance, marketing, negotiation을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-24번 배치 (50개): business-teamwork+leadership+project 테마 최대 다양성

```
비즈니스(business) 도메인의 teamwork(팀워크), leadership(리더십), project(프로젝트) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- teamwork (팀워크): 18개 (36%) - 팀 협업, 협력
- leadership (리더십): 18개 (36%) - 리더십, 관리
- project (프로젝트): 14개 (28%) - 프로젝트 관리

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 팀워크/리더십
- intermediate (중급): 12개 (24%) - 복잡한 프로젝트 관리
- advanced (고급): 10개 (20%) - 세밀한 리더십 기법
- fluent (유창): 9개 (18%) - 유창한 관리 표현
- technical (전문): 5개 (10%) - 전문적 관리 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 팀/프로젝트 지시
- suggestion (제안): 6개 (12%) - 팀워크 제안
- opinion (의견): 5개 (10%) - 리더십 의견
- description (묘사): 4개 (8%) - 프로젝트 설명
- request (요청): 4개 (8%) - 팀 요청
- emotion (감정): 4개 (8%) - 팀워크 감정
- agreement (동의): 3개 (6%) - 프로젝트 동의
- gratitude (감사): 3개 (6%) - 팀 감사
- question (질문): 3개 (6%) - 프로젝트 질문
- greeting (인사): 3개 (6%) - 팀 인사
- apology (사과): 3% (6%) - 팀 사과
- refusal (거절): 4개 (8%) - 프로젝트 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 9개 (18%) - 관리/협업 동사
- noun (명사): 8개 (16%) - 팀/프로젝트 명사
- adjective (형용사): 7개 (14%) - 리더십 형용사
- other (기타): 6개 (12%) - 팀워크 구문
- adverb (부사): 5개 (10%) - 관리 부사
- interjection (감탄사): 4개 (8%) - 팀워크 감탄사
- interrogative (의문사): 4개 (8%) - 프로젝트 의문사
- preposition (전치사): 3개 (6%) - 팀 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 프로젝트 한정사

**상황 분포:**
- polite + work: 15개 (30%) - 정중한 업무
- casual + work: 10개 (20%) - 편안한 업무
- formal + work: 8개 (16%) - 공식 업무
- polite + office: 6개 (12%) - 정중한 사무실
- casual + office: 4개 (8%) - 편안한 사무실
- polite + meeting: 3개 (6%) - 정중한 회의
- casual + meeting: 2개 (4%) - 편안한 회의
- formal + meeting: 2개 (4%) - 공식 회의

teamwork, leadership, project를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-25번 배치 (50개): business-office+sales+contract 테마 최대 다양성

```
비즈니스(business) 도메인의 office(사무실), sales(영업), contract(계약) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- office (사무실): 18개 (36%) - 사무실 환경, 업무
- sales (영업): 18개 (36%) - 영업, 판매
- contract (계약): 14개 (28%) - 계약, 약정

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 사무실/영업/계약
- intermediate (중급): 12개 (24%) - 복잡한 영업 과정
- advanced (고급): 10개 (20%) - 세밀한 계약 협상
- fluent (유창): 8개 (16%) - 유창한 영업 표현
- technical (전문): 5개 (10%) - 전문적 계약 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 6개 (12%) - 영업/계약 요청
- description (묘사): 5개 (10%) - 사무실/계약 설명
- opinion (의견): 5개 (10%) - 영업 의견
- question (질문): 4개 (8%) - 계약 질문
- suggestion (제안): 4개 (8%) - 영업 제안
- instruction (지시): 4개 (8%) - 사무실 지시
- agreement (동의): 4개 (8%) - 계약 동의
- greeting (인사): 4개 (8%) - 영업 인사
- gratitude (감사): 3개 (6%) - 영업 감사
- emotion (감정): 3개 (6%) - 계약 감정
- apology (사과): 4개 (8%) - 영업 사과
- refusal (거절): 4개 (8%) - 계약 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 사무실/영업/계약 명사
- verb (동사): 8개 (16%) - 영업/계약 동사
- adjective (형용사): 7개 (14%) - 계약 형용사
- other (기타): 6개 (12%) - 영업 구문
- interrogative (의문사): 5개 (10%) - 계약 의문사
- adverb (부사): 4개 (8%) - 영업 부사
- interjection (감탄사): 4개 (8%) - 영업 감탄사
- preposition (전치사): 3개 (6%) - 사무실 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 계약 한정사

**상황 분포:**
- polite + office: 12개 (24%) - 정중한 사무실
- formal + office: 10개 (20%) - 공식 사무실
- polite + work: 8개 (16%) - 정중한 업무
- formal + work: 6개 (12%) - 공식 업무
- casual + office: 5개 (10%) - 편안한 사무실
- polite + meeting: 4개 (8%) - 정중한 회의
- formal + meeting: 3개 (6%) - 공식 회의
- casual + work: 2개 (4%) - 편안한 업무

office, sales, contract를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-26번 배치 (50개): business-networking+startup+other 테마 최대 다양성

```

비즈니스(business) 도메인의 networking(네트워킹), startup(스타트업), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- networking (네트워킹): 20개 (40%) - 인맥, 네트워킹
- startup (스타트업): 20개 (40%) - 창업, 스타트업
- other (기타): 10개 (20%) - 기타 비즈니스 활동

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 네트워킹/창업
- intermediate (중급): 12개 (24%) - 복잡한 창업 과정
- advanced (고급): 11개 (22%) - 세밀한 네트워킹 전략
- fluent (유창): 8개 (16%) - 유창한 창업 표현
- technical (전문): 5개 (10%) - 전문적 창업 용어

**목적 분포 (12개 모두 포함):**
- greeting (인사): 7개 (14%) - 네트워킹 인사
- suggestion (제안): 6개 (12%) - 창업 제안
- opinion (의견): 5개 (10%) - 네트워킹 의견
- description (묘사): 4개 (8%) - 스타트업 설명
- request (요청): 4개 (8%) - 네트워킹 요청
- question (질문): 4개 (8%) - 창업 질문
- emotion (감정): 4개 (8%) - 창업 감정
- instruction (지시): 3개 (6%) - 네트워킹 지시
- agreement (동의): 3개 (6%) - 창업 동의
- gratitude (감사): 3개 (6%) - 네트워킹 감사
- apology (사과): 3개 (6%) - 비즈니스 사과
- refusal (거절): 4개 (8%) - 제안 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 네트워킹/창업 명사
- verb (동사): 8개 (16%) - 네트워킹 동사
- adjective (형용사): 7개 (14%) - 창업 형용사
- other (기타): 6개 (12%) - 네트워킹 구문
- interjection (감탄사): 5개 (10%) - 네트워킹 감탄사
- adverb (부사): 4개 (8%) - 창업 부사
- interrogative (의문사): 4개 (8%) - 창업 의문사
- preposition (전치사): 3개 (6%) - 네트워킹 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 창업 한정사

**상황 분포:**
- polite + social: 12개 (24%) - 정중한 사회
- casual + social: 8개 (16%) - 편안한 사회
- formal + work: 7개 (14%) - 공식 업무
- polite + work: 6개 (12%) - 정중한 업무
- formal + conference: 5개 (10%) - 공식 컨퍼런스
- polite + conference: 4개 (8%) - 정중한 컨퍼런스
- casual + work: 3개 (6%) - 편안한 업무
- polite + office: 3개 (6%) - 정중한 사무실
- casual + office: 2개 (4%) - 편안한 사무실

networking, startup, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-27번 배치 (50개): health-exercise+fitness+nutrition 테마 최대 다양성

```

건강(health) 도메인의 exercise(운동), fitness(피트니스), nutrition(영양) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- exercise (운동): 18개 (36%) - 운동, 신체 활동
- fitness (피트니스): 18개 (36%) - 체력, 건강 관리
- nutrition (영양): 14개 (28%) - 영양, 식단

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 운동/피트니스/영양
- intermediate (중급): 12개 (24%) - 복잡한 건강 관리
- advanced (고급): 10개 (20%) - 세밀한 운동 과학
- fluent (유창): 8개 (16%) - 유창한 건강 표현
- technical (전문): 5개 (10%) - 전문적 의학 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 운동/영양 지시
- suggestion (제안): 6개 (12%) - 건강 제안
- description (묘사): 5개 (10%) - 운동/영양 설명
- opinion (의견): 4개 (8%) - 건강 의견
- question (질문): 4개 (8%) - 운동 질문
- emotion (감정): 4개 (8%) - 운동 감정
- request (요청): 3개 (6%) - 건강 요청
- greeting (인사): 3개 (6%) - 헬스장 인사
- gratitude (감사): 3개 (6%) - 건강 감사
- agreement (동의): 3개 (6%) - 운동 동의
- apology (사과): 3개 (6%) - 운동 사과
- refusal (거절): 4개 (8%) - 운동 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 9개 (18%) - 운동 동사
- noun (명사): 8개 (16%) - 운동/영양 명사
- adjective (형용사): 7개 (14%) - 건강 형용사
- adverb (부사): 6개 (12%) - 운동 부사
- other (기타): 5개 (10%) - 건강 구문
- interjection (감탄사): 4개 (8%) - 운동 감탄사
- interrogative (의문사): 4개 (8%) - 운동 의문사
- preposition (전치사): 3개 (6%) - 위치 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 운동 한정사

**상황 분포:**
- casual + fitness: 12개 (24%) - 편안한 헬스장
- polite + fitness: 8개 (16%) - 정중한 헬스장
- casual + home: 7개 (14%) - 편안한 집
- polite + medical: 6개 (12%) - 정중한 의료
- casual + social: 5개 (10%) - 편안한 사회
- polite + social: 4개 (8%) - 정중한 사회
- polite + home: 3개 (6%) - 정중한 집
- casual + public: 3개 (6%) - 편안한 공공
- polite + public: 2개 (4%) - 정중한 공공

exercise, fitness, nutrition을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-28번 배치 (50개): health-medicine+hospital+mental_health 테마 최대 다양성

```
건강(health) 도메인의 medicine(의학), hospital(병원), mental_health(정신건강) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- medicine (의학): 18개 (36%) - 의학, 약물
- hospital (병원): 18개 (36%) - 병원, 의료 시설
- mental_health (정신건강): 14개 (28%) - 정신 건강, 심리

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 의학/병원/정신건강
- intermediate (중급): 12개 (24%) - 복잡한 의료 상황
- advanced (고급): 11개 (22%) - 세밀한 의학 지식
- fluent (유창): 8개 (16%) - 유창한 의료 표현
- technical (전문): 5개 (10%) - 전문적 의학 용어

**목적 분포 (12개 모두 포함):**
- question (질문): 7개 (14%) - 의료 질문
- description (묘사): 6개 (12%) - 증상/치료 설명
- request (요청): 5개 (10%) - 의료 요청
- emotion (감정): 4개 (8%) - 치료 감정
- instruction (지시): 4개 (8%) - 의료 지시
- opinion (의견): 4개 (8%) - 치료 의견
- gratitude (감사): 4개 (8%) - 의료진 감사
- greeting (인사): 3개 (6%) - 병원 인사
- suggestion (제안): 3개 (6%) - 치료 제안
- agreement (동의): 3개 (6%) - 치료 동의
- apology (사과): 3% (6%) - 의료 사과
- refusal (거절): 4개 (8%) - 치료 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 의학/병원 명사
- verb (동사): 8개 (16%) - 치료 동사
- adjective (형용사): 7개 (14%) - 증상 형용사
- interrogative (의문사): 6개 (12%) - 의료 의문사
- other (기타): 5개 (10%) - 의료 구문
- adverb (부사): 4개 (8%) - 치료 부사
- interjection (감탄사): 4개 (8%) - 치료 감탄사
- preposition (전치사): 3개 (6%) - 의료 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 의료 한정사

**상황 분포:**
- polite + medical: 18개 (36%) - 정중한 의료
- formal + medical: 10개 (20%) - 공식 의료
- polite + hospital: 8개 (16%) - 정중한 병원
- urgent + medical: 6개 (12%) - 긴급한 의료
- polite + home: 4개 (8%) - 정중한 집
- casual + home: 2개 (4%) - 편안한 집
- polite + public: 1개 (2%) - 정중한 공공
- casual + medical: 1개 (2%) - 편안한 의료

medicine, hospital, mental_health를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-29번 배치 (50개): health-symptoms+treatment+other 테마 최대 다양성

```
건강(health) 도메인의 symptoms(증상), treatment(치료), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- symptoms (증상): 20개 (40%) - 증상, 징후
- treatment (치료): 20개 (40%) - 치료, 요법
- other (기타): 10개 (20%) - 기타 건강 관련

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 증상/치료
- intermediate (중급): 13개 (26%) - 복잡한 치료 과정
- advanced (고급): 9개 (18%) - 세밀한 증상 분석
- fluent (유창): 7개 (14%) - 유창한 의료 표현
- technical (전문): 5개 (10%) - 전문적 치료 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 8개 (16%) - 증상/치료 설명
- question (질문): 6개 (12%) - 증상 질문
- emotion (감정): 5개 (10%) - 치료 감정
- request (요청): 4개 (8%) - 치료 요청
- instruction (지시): 4개 (8%) - 치료 지시
- opinion (의견): 4개 (8%) - 치료 의견
- gratitude (감사): 4개 (8%) - 치료 감사
- greeting (인사): 3개 (6%) - 의료 인사
- suggestion (제안): 3개 (6%) - 치료 제안
- agreement (동의): 3개 (6%) - 치료 동의
- apology (사과): 3개 (6%) - 치료 사과
- refusal (거절): 3개 (6%) - 치료 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 8개 (16%) - 증상 형용사
- noun (명사): 8개 (16%) - 증상/치료 명사
- verb (동사): 7개 (14%) - 치료 동사
- adverb (부사): 6개 (12%) - 증상 부사
- other (기타): 5개 (10%) - 의료 구문
- interrogative (의문사): 5개 (10%) - 증상 의문사
- interjection (감탄사): 4개 (8%) - 치료 감탄사
- preposition (전치사): 3개 (6%) - 치료 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 증상 한정사

**상황 분포:**
- polite + medical: 20개 (40%) - 정중한 의료
- urgent + medical: 8개 (16%) - 긴급한 의료
- polite + hospital: 6개 (12%) - 정중한 병원
- formal + medical: 5개 (10%) - 공식 의료
- polite + home: 4개 (8%) - 정중한 집
- casual + home: 3개 (6%) - 편안한 집
- polite + pharmacy: 2개 (4%) - 정중한 약국
- casual + medical: 2개 (4%) - 편안한 의료

symptoms, treatment, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-30번 배치 (50개): technology-computer+software+internet 테마 최대 다양성

```
기술(technology) 도메인의 computer(컴퓨터), software(소프트웨어), internet(인터넷) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- computer (컴퓨터): 18개 (36%) - 컴퓨터, 하드웨어
- software (소프트웨어): 18개 (36%) - 소프트웨어, 프로그램
- internet (인터넷): 14개 (28%) - 인터넷, 웹

**난이도 분포 (5개 모두 포함):**
- basic (기초): 14개 (28%) - 기본 컴퓨터/소프트웨어/인터넷
- intermediate (중급): 12개 (24%) - 복잡한 기술 사용
- advanced (고급): 11개 (22%) - 세밀한 기술 지식
- fluent (유창): 8개 (16%) - 유창한 기술 표현
- technical (전문): 5개 (10%) - 전문적 IT 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 기술 사용 지시
- question (질문): 6개 (12%) - 기술 질문
- description (묘사): 5개 (10%) - 기술 설명
- request (요청): 4개 (8%) - 기술 도움 요청
- opinion (의견): 4개 (8%) - 기술 의견
- suggestion (제안): 4개 (8%) - 기술 제안
- emotion (감정): 4개 (8%) - 기술 감정
- greeting (인사): 3개 (6%) - 온라인 인사
- gratitude (감사): 3개 (6%) - 기술 도움 감사
- agreement (동의): 3개 (6%) - 기술 동의
- apology (사과): 3개 (6%) - 기술 사과
- refusal (거절): 3개 (6%) - 기술 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 기술 명사
- verb (동사): 8개 (16%) - 기술 동작 동사
- adjective (형용사): 7개 (14%) - 기술 형용사
- other (기타): 6개 (12%) - 기술 구문
- adverb (부사): 5개 (10%) - 기술 부사
- interrogative (의문사): 4개 (8%) - 기술 의문사
- interjection (감탄사): 4개 (8%) - 기술 감탄사
- preposition (전치사): 3개 (6%) - 기술 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 기술 한정사

**상황 분포:**
- casual + home: 12개 (24%) - 편안한 집
- polite + work: 8개 (16%) - 정중한 업무
- casual + work: 6개 (12%) - 편안한 업무
- polite + office: 5개 (10%) - 정중한 사무실
- casual + office: 4개 (8%) - 편안한 사무실
- polite + online: 4개 (8%) - 정중한 온라인
- casual + online: 4개 (8%) - 편안한 온라인
- polite + public: 3개 (6%) - 정중한 공공
- casual + public: 2개 (4%) - 편안한 공공
- formal + work: 2개 (4%) - 공식 업무

computer, software, internet을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-31번 배치 (50개): technology-mobile+ai+programming 테마 최대 다양성


```
기술(technology) 도메인의 mobile(모바일), ai(인공지능), programming(프로그래밍) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- mobile (모바일): 18개 (36%) - 모바일, 스마트폰
- ai (인공지능): 18개 (36%) - AI, 머신러닝
- programming (프로그래밍): 14개 (28%) - 코딩, 개발

**난이도 분포 (5개 모두 포함):**
- basic (기초): 13개 (26%) - 기본 모바일/AI/프로그래밍
- intermediate (중급): 12개 (24%) - 복잡한 기술 개념
- advanced (고급): 11개 (22%) - 세밀한 개발 지식
- fluent (유창): 9개 (18%) - 유창한 기술 표현
- technical (전문): 5개 (10%) - 전문적 개발 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 7개 (14%) - 개발 지시
- description (묘사): 6개 (12%) - 기술 설명
- opinion (의견): 5개 (10%) - 기술 의견
- question (질문): 4개 (8%) - 개발 질문
- suggestion (제안): 4개 (8%) - 기술 제안
- request (요청): 4개 (8%) - 개발 요청
- emotion (감정): 4개 (8%) - 개발 감정
- greeting (인사): 4개 (8%) - 개발자 인사
- gratitude (감사): 3개 (6%) - 개발 감사
- agreement (동의): 3개 (6%) - 기술 동의
- apology (사과): 3개 (6%) - 개발 사과
- refusal (거절): 3개 (6%) - 개발 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 기술/개발 명사
- verb (동사): 8개 (16%) - 개발 동사
- adjective (형용사): 7개 (14%) - 기술 형용사
- other (기타): 6개 (12%) - 개발 구문
- adverb (부사): 5개 (10%) - 개발 부사
- interrogative (의문사): 4개 (8%) - 개발 의문사
- interjection (감탄사): 4개 (8%) - 개발 감탄사
- preposition (전치사): 3개 (6%) - 기술 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 기술 한정사

**상황 분포:**
- casual + work: 12개 (24%) - 편안한 업무
- polite + work: 10개 (20%) - 정중한 업무
- casual + home: 8개 (16%) - 편안한 집
- casual + office: 6개 (12%) - 편안한 사무실
- polite + office: 5개 (10%) - 정중한 사무실
- casual + online: 4개 (8%) - 편안한 온라인
- polite + online: 3개 (6%) - 정중한 온라인
- formal + work: 2개 (4%) - 공식 업무

mobile, ai, programming을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-32번 배치 (50개): technology-cybersecurity+database+other 테마 최대 다양성

```
기술(technology) 도메인의 cybersecurity(사이버보안), database(데이터베이스), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- cybersecurity (사이버보안): 20개 (40%) - 보안, 해킹 방지
- database (데이터베이스): 20개 (40%) - DB, 데이터 관리
- other (기타): 10개 (20%) - 기타 기술 분야

**난이도 분포 (5개 모두 포함):**
- basic (기초): 12개 (24%) - 기본 보안/DB
- intermediate (중급): 12개 (24%) - 복잡한 보안 시스템
- advanced (고급): 12개 (24%) - 세밀한 DB 관리
- fluent (유창): 8개 (16%) - 유창한 기술 표현
- technical (전문): 6개 (12%) - 전문적 보안 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 8개 (16%) - 보안/DB 지시
- description (묘사): 6개 (12%) - 기술 설명
- question (질문): 5개 (10%) - 보안 질문
- opinion (의견): 4개 (8%) - 기술 의견
- suggestion (제안): 4개 (8%) - 보안 제안
- request (요청): 4개 (8%) - 기술 요청
- emotion (감정): 4개 (8%) - 기술 감정
- greeting (인사): 3개 (6%) - 기술자 인사
- gratitude (감사): 3개 (6%) - 기술 감사
- agreement (동의): 3개 (6%) - 기술 동의
- apology (사과): 3개 (6%) - 기술 사과
- refusal (거절): 3개 (6%) - 기술 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 10개 (20%) - 보안/DB 명사
- verb (동사): 8개 (16%) - 보안 동사
- adjective (형용사): 7개 (14%) - 보안 형용사
- other (기타): 6개 (12%) - 기술 구문
- adverb (부사): 5개 (10%) - 보안 부사
- interrogative (의문사): 4개 (8%) - 보안 의문사
- interjection (감탄사): 3개 (6%) - 기술 감탄사
- preposition (전치사): 3개 (6%) - 기술 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 기술 한정사

**상황 분포:**
- formal + work: 15개 (30%) - 공식 업무
- polite + work: 10개 (20%) - 정중한 업무
- formal + office: 8개 (16%) - 공식 사무실
- polite + office: 6개 (12%) - 정중한 사무실
- casual + work: 5개 (10%) - 편안한 업무
- technical + work: 3개 (6%) - 기술적 업무
- formal + meeting: 2개 (4%) - 공식 회의
- polite + meeting: 1개 (2%) - 정중한 회의

cybersecurity, database, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-33번 배치 (50개): culture-tradition+heritage+festival 테마 최대 다양성

```
문화(culture) 도메인의 tradition(전통), heritage(유산), festival(축제) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- tradition (전통): 18개 (36%) - 전통, 관습
- heritage (유산): 18개 (36%) - 문화유산, 역사
- festival (축제): 14개 (28%) - 축제, 기념일

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 전통/유산/축제
- intermediate (중급): 12개 (24%) - 복잡한 문화 개념
- advanced (고급): 10개 (20%) - 세밀한 문화 분석
- fluent (유창): 8개 (16%) - 유창한 문화 표현
- technical (전문): 5개 (10%) - 전문적 문화 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 8개 (16%) - 전통/유산/축제 설명
- opinion (의견): 6개 (12%) - 문화 의견
- emotion (감정): 5개 (10%) - 문화 감정
- question (질문): 4개 (8%) - 문화 질문
- suggestion (제안): 4개 (8%) - 문화 체험 제안
- greeting (인사): 4개 (8%) - 문화 관련 인사
- instruction (지시): 3개 (6%) - 문화 참여 지시
- gratitude (감사): 3개 (6%) - 문화 감사
- request (요청): 3개 (6%) - 문화 요청
- agreement (동의): 3개 (6%) - 문화 동의
- apology (사과): 3개 (6%) - 문화 사과
- refusal (거절): 4개 (8%) - 문화 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 문화/전통 명사
- adjective (형용사): 8개 (16%) - 문화 형용사
- verb (동사): 7개 (14%) - 문화 활동 동사
- interjection (감탄사): 6개 (12%) - 문화 감탄사
- other (기타): 5개 (10%) - 문화 구문
- adverb (부사): 4개 (8%) - 문화 부사
- interrogative (의문사): 4개 (8%) - 문화 의문사
- preposition (전치사): 3개 (6%) - 문화 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 문화 한정사

**상황 분포:**
- polite + social: 12개 (24%) - 정중한 사회
- casual + social: 10개 (20%) - 편안한 사회
- formal + public: 8개 (16%) - 공식 공공
- polite + public: 6개 (12%) - 정중한 공공
- casual + public: 5개 (10%) - 편안한 공공
- polite + cultural_site: 4개 (8%) - 정중한 문화시설
- casual + cultural_site: 3개 (6%) - 편안한 문화시설
- formal + cultural_site: 2개 (4%) - 공식 문화시설

tradition, heritage, festival을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-34번 배치 (50개): culture-customs+arts_crafts+other 테마 최대 다양성

```
문화(culture) 도메인의 customs(관습), arts_crafts(예술공예), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- customs (관습): 20개 (40%) - 관습, 예의
- arts_crafts (예술공예): 20개 (40%) - 예술, 공예
- other (기타): 10개 (20%) - 기타 문화 요소

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 관습/예술
- intermediate (중급): 13개 (26%) - 복잡한 문화 예술
- advanced (고급): 9개 (18%) - 세밀한 예술 분석
- fluent (유창): 7개 (14%) - 유창한 문화 표현
- technical (전문): 5개 (10%) - 전문적 예술 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 7개 (14%) - 관습/예술 설명
- opinion (의견): 6개 (12%) - 예술 의견
- instruction (지시): 5개 (10%) - 관습 지시
- emotion (감정): 4개 (8%) - 예술 감정
- question (질문): 4개 (8%) - 문화 질문
- suggestion (제안): 4개 (8%) - 예술 제안
- greeting (인사): 4개 (8%) - 문화 인사
- gratitude (감사): 3개 (6%) - 문화 감사
- request (요청): 3개 (6%) - 예술 요청
- agreement (동의): 3개 (6%) - 문화 동의
- apology (사과): 3개 (6%) - 관습 사과
- refusal (거절): 4개 (8%) - 문화 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 8개 (16%) - 예술 형용사
- noun (명사): 8개 (16%) - 관습/예술 명사
- verb (동사): 7개 (14%) - 예술 활동 동사
- other (기타): 6개 (12%) - 문화 구문
- interjection (감탄사): 5개 (10%) - 예술 감탄사
- adverb (부사): 4개 (8%) - 예술 부사
- interrogative (의문사): 4개 (8%) - 문화 의문사
- preposition (전치사): 3개 (6%) - 예술 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 예술 한정사

**상황 분포:**
- polite + social: 12개 (24%) - 정중한 사회
- casual + social: 8개 (16%) - 편안한 사회
- polite + public: 6개 (12%) - 정중한 공공
- casual + public: 6개 (12%) - 편안한 공공
- polite + cultural_site: 5개 (10%) - 정중한 문화시설
- casual + cultural_site: 4개 (8%) - 편안한 문화시설
- formal + public: 4개 (8%) - 공식 공공
- polite + home: 3개 (6%) - 정중한 집
- casual + home: 2개 (4%) - 편안한 집

customs, arts_crafts, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-35번 배치 (50개): entertainment-movie+music+book 테마 최대 다양성

```

엔터테인먼트(entertainment) 도메인의 movie(영화), music(음악), book(책) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- movie (영화): 18개 (36%) - 영화, 시네마
- music (음악): 18개 (36%) - 음악, 노래
- book (책): 14개 (28%) - 독서, 문학

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 영화/음악/책
- intermediate (중급): 12개 (24%) - 복잡한 엔터테인먼트
- advanced (고급): 10개 (20%) - 세밀한 예술 분석
- fluent (유창): 8개 (16%) - 유창한 예술 표현
- technical (전문): 5개 (10%) - 전문적 예술 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 8개 (16%) - 작품 의견
- emotion (감정): 6개 (12%) - 감상 감정
- description (묘사): 5개 (10%) - 작품 설명
- suggestion (제안): 4개 (8%) - 작품 추천
- question (질문): 4개 (8%) - 작품 질문
- gratitude (감사): 4개 (8%) - 추천 감사
- greeting (인사): 3개 (6%) - 팬 인사
- request (요청): 3개 (6%) - 추천 요청
- instruction (지시): 3개 (6%) - 감상 지시
- agreement (동의): 3개 (6%) - 작품 동의
- apology (사과): 3개 (6%) - 취향 사과
- refusal (거절): 4개 (8%) - 추천 거절

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 9개 (18%) - 작품 평가 형용사
- noun (명사): 8개 (16%) - 작품/장르 명사
- verb (동사): 7개 (14%) - 감상 동사
- interjection (감탄사): 6개 (12%) - 감상 감탄사
- other (기타): 5개 (10%) - 감상 구문
- adverb (부사): 4개 (8%) - 감상 부사
- interrogative (의문사): 4개 (8%) - 작품 의문사
- preposition (전치사): 3개 (6%) - 감상 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 작품 한정사

**상황 분포:**
- casual + social: 12개 (24%) - 편안한 사회
- casual + home: 10개 (20%) - 편안한 집
- polite + social: 8개 (16%) - 정중한 사회
- casual + public: 6개 (12%) - 편안한 공공
- polite + public: 5개 (10%) - 정중한 공공
- polite + home: 4개 (8%) - 정중한 집
- casual + cinema: 3개 (6%) - 편안한 영화관
- polite + cinema: 2개 (4%) - 정중한 영화관

movie, music, book을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-36번 배치 (50개): entertainment-game+theater+other 테마 최대 다양성

```

엔터테인먼트(entertainment) 도메인의 game(게임), theater(연극), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- game (게임): 20개 (40%) - 게임, 놀이
- theater (연극): 20개 (40%) - 연극, 공연
- other (기타): 10개 (20%) - 기타 엔터테인먼트

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 게임/연극
- intermediate (중급): 13개 (26%) - 복잡한 게임/공연
- advanced (고급): 9개 (18%) - 세밀한 공연 분석
- fluent (유창): 7개 (14%) - 유창한 예술 표현
- technical (전문): 5개 (10%) - 전문적 공연 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 7개 (14%) - 게임/공연 감정
- opinion (의견): 6개 (12%) - 게임/공연 의견
- suggestion (제안): 5개 (10%) - 게임/공연 제안
- description (묘사): 4개 (8%) - 게임/공연 설명
- question (질문): 4개 (8%) - 게임 질문
- request (요청): 4개 (8%) - 게임 요청
- greeting (인사): 4개 (8%) - 게임/공연 인사
- gratitude (감사): 3개 (6%) - 공연 감사
- instruction (지시): 3개 (6%) - 게임 지시
- agreement (동의): 3개 (6%) - 게임 동의
- apology (사과): 3개 (6%) - 게임 사과
- refusal (거절): 4개 (8%) - 게임 거절

**품사 분포 (10개 모두 포함):**
- interjection (감탄사): 8개 (16%) - 게임/공연 감탄사
- noun (명사): 7개 (14%) - 게임/공연 명사
- adjective (형용사): 7개 (14%) - 게임/공연 형용사
- verb (동사): 6개 (12%) - 게임/공연 동사
- other (기타): 5개 (10%) - 게임 구문
- adverb (부사): 4개 (8%) - 게임 부사
- interrogative (의문사): 4개 (8%) - 게임 의문사
- preposition (전치사): 3개 (6%) - 게임 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 3개 (6%) - 게임 한정사

**상황 분포:**
- casual + home: 12개 (24%) - 편안한 집
- casual + social: 10개 (20%) - 편안한 사회
- polite + social: 8개 (16%) - 정중한 사회
- casual + public: 6개 (12%) - 편안한 공공
- polite + public: 5개 (10%) - 정중한 공공
- casual + theater: 4개 (8%) - 편안한 극장
- polite + theater: 3개 (6%) - 정중한 극장
- formal + theater: 2개 (4%) - 공식 극장

game, theater, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-37번 배치 (50개): nature-animal+plant+weather 테마 최대 다양성

```
자연(nature) 도메인의 animal(동물), plant(식물), weather(날씨) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- animal (동물): 18개 (36%) - 동물, 야생동물
- plant (식물): 18개 (36%) - 식물, 나무
- weather (날씨): 14개 (28%) - 날씨, 기후

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 동물/식물/날씨
- intermediate (중급): 13개 (26%) - 복잡한 자연 현상
- advanced (고급): 9개 (18%) - 세밀한 생태 분석
- fluent (유창): 7개 (14%) - 유창한 자연 표현
- technical (전문): 5개 (10%) - 전문적 생물학 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 8개 (16%) - 동물/식물/날씨 설명
- emotion (감정): 6개 (12%) - 자연 감정
- opinion (의견): 5개 (10%) - 자연 의견
- question (질문): 4개 (8%) - 자연 질문
- suggestion (제안): 4개 (8%) - 자연 활동 제안
- instruction (지시): 4개 (8%) - 자연 관찰 지시
- greeting (인사): 3개 (6%) - 자연 관련 인사
- gratitude (감사): 3개 (6%) - 자연 감사
- request (요청): 3개 (6%) - 자연 요청
- agreement (동의): 3개 (6%) - 자연 동의
- apology (사과): 3개 (6%) - 자연 사과
- refusal (거절): 4개 (8%) - 자연 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 동물/식물/날씨 명사
- adjective (형용사): 8개 (16%) - 자연 형용사
- verb (동사): 7개 (14%) - 자연 활동 동사
- interjection (감탄사): 6개 (12%) - 자연 감탄사
- other (기타): 5개 (10%) - 자연 구문
- adverb (부사): 4개 (8%) - 자연 부사
- interrogative (의문사): 4개 (8%) - 자연 의문사
- preposition (전치사): 3개 (6%) - 자연 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 자연 한정사

**상황 분포:**
- casual + public: 12개 (24%) - 편안한 공공(자연)
- casual + home: 8개 (16%) - 편안한 집
- polite + public: 6개 (12%) - 정중한 공공(자연)
- casual + social: 6개 (12%) - 편안한 사회
- polite + social: 5개 (10%) - 정중한 사회
- casual + outdoor: 5개 (10%) - 편안한 야외
- polite + outdoor: 4개 (8%) - 정중한 야외
- casual + zoo: 2개 (4%) - 편안한 동물원
- polite + zoo: 2개 (4%) - 정중한 동물원

animal, plant, weather를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.

```

### 1-38번 배치 (50개): nature-environment+geography+other 테마 최대 다양성

```
자연(nature) 도메인의 environment(환경), geography(지리), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- environment (환경): 20개 (40%) - 환경, 생태계
- geography (지리): 20개 (40%) - 지리, 지형
- other (기타): 10개 (20%) - 기타 자연 요소

**난이도 분포 (5개 모두 포함):**
- basic (기초): 15개 (30%) - 기본 환경/지리
- intermediate (중급): 12개 (24%) - 복잡한 환경 문제
- advanced (고급): 10개 (20%) - 세밀한 지리 분석
- fluent (유창): 8개 (16%) - 유창한 환경 표현
- technical (전문): 5개 (10%) - 전문적 환경 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 7개 (14%) - 환경/지리 설명
- opinion (의견): 6개 (12%) - 환경 의견
- suggestion (제안): 5개 (10%) - 환경 보호 제안
- emotion (감정): 4개 (8%) - 환경 감정
- question (질문): 4개 (8%) - 지리 질문
- instruction (지시): 4개 (8%) - 환경 보호 지시
- request (요청): 4개 (8%) - 환경 요청
- greeting (인사): 3개 (6%) - 환경 관련 인사
- gratitude (감사): 3개 (6%) - 자연 감사
- agreement (동의): 3개 (6%) - 환경 동의
- apology (사과): 3개 (6%) - 환경 사과
- refusal (거절): 4개 (8%) - 환경 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 9개 (18%) - 환경/지리 명사
- adjective (형용사): 8개 (16%) - 환경 형용사
- verb (동사): 7개 (14%) - 환경 활동 동사
- other (기타): 6개 (12%) - 환경 구문
- adverb (부사): 5개 (10%) - 환경 부사
- interjection (감탄사): 4개 (8%) - 환경 감탄사
- interrogative (의문사): 4개 (8%) - 지리 의문사
- preposition (전치사): 3개 (6%) - 지리 전치사
- conjunction (접속사): 2개 (4%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 환경 한정사

**상황 분포:**
- polite + public: 12개 (24%) - 정중한 공공
- casual + public: 8개 (16%) - 편안한 공공
- formal + public: 6개 (12%) - 공식 공공
- polite + social: 6개 (12%) - 정중한 사회
- casual + social: 5개 (10%) - 편안한 사회
- casual + outdoor: 5개 (10%) - 편안한 야외
- polite + outdoor: 4개 (8%) - 정중한 야외
- formal + work: 2개 (4%) - 공식 업무
- polite + work: 2개 (4%) - 정중한 업무

environment, geography, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-39번 배치 (50개): sports-football+basketball+other 테마 최대 다양성

```
스포츠(sports) 도메인의 football(축구), basketball(농구), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- football (축구): 20개 (40%) - 축구, 풋볼
- basketball (농구): 20개 (40%) - 농구, 바스켓볼
- other (기타): 10개 (20%) - 기타 스포츠

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 축구/농구
- intermediate (중급): 13개 (26%) - 복잡한 스포츠 전술
- advanced (고급): 9개 (18%) - 세밀한 경기 분석
- fluent (유창): 7개 (14%) - 유창한 스포츠 표현
- technical (전문): 5개 (10%) - 전문적 스포츠 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 8개 (16%) - 경기 감정
- opinion (의견): 6개 (12%) - 경기/선수 의견
- description (묘사): 5개 (10%) - 경기 설명
- suggestion (제안): 4개 (8%) - 스포츠 제안
- greeting (인사): 4개 (8%) - 스포츠 인사
- question (질문): 4개 (8%) - 스포츠 질문
- instruction (지시): 3개 (6%) - 스포츠 지시
- request (요청): 3개 (6%) - 스포츠 요청
- gratitude (감사): 3개 (6%) - 스포츠 감사
- agreement (동의): 3개 (6%) - 경기 동의
- apology (사과): 3개 (6%) - 스포츠 사과
- refusal (거절): 4개 (8%) - 스포츠 거절

**품사 분포 (10개 모두 포함):**
- interjection (감탄사): 8개 (16%) - 경기 감탄사
- noun (명사): 7개 (14%) - 스포츠 명사
- verb (동사): 7개 (14%) - 스포츠 동사
- adjective (형용사): 6개 (12%) - 경기 형용사
- other (기타): 5개 (10%) - 스포츠 구문
- adverb (부사): 4개 (8%) - 스포츠 부사
- interrogative (의문사): 4개 (8%) - 스포츠 의문사
- preposition (전치사): 3개 (6%) - 경기 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 3개 (6%) - 스포츠 한정사

**상황 분포:**
- casual + social: 15개 (30%) - 편안한 사회
- casual + public: 10개 (20%) - 편안한 공공
- polite + social: 8개 (16%) - 정중한 사회
- casual + sports: 6개 (12%) - 편안한 스포츠장
- polite + sports: 4개 (8%) - 정중한 스포츠장
- casual + home: 4개 (8%) - 편안한 집
- polite + public: 2개 (4%) - 정중한 공공
- polite + home: 1개 (2%) - 정중한 집

football, basketball, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 1-40번 배치 (50개): other-hobbies+finance_personal+other 테마 최대 다양성

```
기타(other) 도메인의 hobbies(취미), finance_personal(개인재정), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- hobbies (취미): 20개 (40%) - 취미, 여가 활동
- finance_personal (개인재정): 20개 (40%) - 개인 금융, 가계
- other (기타): 10개 (20%) - 기타 분야

**난이도 분포 (5개 모두 포함):**
- basic (기초): 16개 (32%) - 기본 취미/재정
- intermediate (중급): 13개 (26%) - 복잡한 금융 개념
- advanced (고급): 9개 (18%) - 세밀한 재정 분석
- fluent (유창): 7개 (14%) - 유창한 취미 표현
- technical (전문): 5개 (10%) - 전문적 금융 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 7개 (14%) - 취미/재정 의견
- suggestion (제안): 6개 (12%) - 취미/재정 제안
- description (묘사): 5개 (10%) - 취미/재정 설명
- emotion (감정): 4개 (8%) - 취미 감정
- question (질문): 4개 (8%) - 재정 질문
- request (요청): 4개 (8%) - 취미/재정 요청
- instruction (지시): 4개 (8%) - 재정 관리 지시
- greeting (인사): 3개 (6%) - 취미 관련 인사
- gratitude (감사): 3개 (6%) - 조언 감사
- agreement (동의): 3개 (6%) - 제안 동의
- apology (사과): 3개 (6%) - 재정 사과
- refusal (거절): 4개 (8%) - 제안 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 8개 (16%) - 취미/재정 명사
- verb (동사): 7개 (14%) - 취미/재정 동사
- adjective (형용사): 7개 (14%) - 취미/재정 형용사
- other (기타): 6개 (12%) - 취미/재정 구문
- adverb (부사): 5개 (10%) - 재정 부사
- interrogative (의문사): 5개 (10%) - 재정 의문사
- interjection (감탄사): 4개 (8%) - 취미 감탄사
- preposition (전치사): 3개 (6%) - 재정 전치사
- conjunction (접속사): 3개 (6%) - 연결 접속사
- determiner (한정사): 2개 (4%) - 재정 한정사

**상황 분포:**
- casual + home: 12개 (24%) - 편안한 집
- casual + social: 10개 (20%) - 편안한 사회
- polite + social: 8개 (16%) - 정중한 사회
- polite + home: 6개 (12%) - 정중한 집
- casual + public: 4개 (8%) - 편안한 공공
- polite + office: 4개 (8%) - 정중한 사무실(재정상담)
- polite + public: 3개 (6%) - 정중한 공공
- formal + office: 2개 (4%) - 공식 사무실
- casual + office: 1개 (2%) - 편안한 사무실

hobbies, finance_personal, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

## 2단계: 실용 확장 데이터 생성 가이드 (3,000개 - 60배치)

## 📋 2단계 개요

**목표**: 중급-고급 중심의 실용적 데이터 확장
**특징**: 모든 180개 카테고리 균등 분배, 실용성 강화
**총 데이터**: 3,000개 (60배치 × 50개)

### 📊 2단계 도메인별 배치 분포
- **technology (기술)**: 11배치 (18%) - 기술 혁신 중심
- **business (비즈니스)**: 10배치 (17%) - 전문 비즈니스
- **education (교육)**: 8배치 (13%) - 교육 전문  
- **daily (일상생활)**: 7배치 (12%) - 실용 일상
- **travel (여행)**: 6배치 (10%) - 실용 여행
- **health (건강)**: 5배치 (8%) - 건강 관리
- **culture (문화)**: 4배치 (7%) - 문화 이해
- **entertainment (엔터테인먼트)**: 3배치 (5%) - 동기 향상
- **food (음식)**: 2배치 (3%) - 고급 음식
- **other (기타)**: 2배치 (3%) - 포괄성 강화
- **nature (자연)**: 1배치 (2%) - 자연 환경
- **sports (스포츠)**: 1배치 (2%) - 스포츠 활동

### 🎯 2단계 특징
- **난이도**: intermediate(50%) + advanced(30%) 중심
- **목적**: description(20%) + opinion(18%) + question(15%) 중심
- **품사**: verb(30%) + noun(25%) + adjective(20%) 중심
- **상황**: polite+social(30%) + casual+social(25%) + formal+work(15%) 중심

---

## 🎯 2단계 배치별 세부 지침 (2-1 ~ 2-60)

### 2-1번 배치 (50개): technology-data+security+cloud 테마 최대 다양성

```
기술(technology) 도메인의 data(데이터), security(보안), cloud(클라우드) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- data (데이터): 20개 (40%) - 데이터 처리, 분석
- security (보안): 18개 (36%) - 사이버 보안, 개인정보 보호
- cloud (클라우드): 12개 (24%) - 클라우드 컴퓨팅, 클라우드 서비스

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 기술 이해가 필요한 수준
- advanced (고급): 15개 (30%) - 전문적 기술 지식
- basic (기초): 8개 (16%) - 기본 기술 개념
- fluent (유창): 4개 (8%) - 유창한 기술 표현
- technical (전문): 3개 (6%) - 고도의 전문 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 기술 설명
- opinion (의견): 8개 (16%) - 기술 평가
- question (질문): 6개 (12%) - 기술 질의
- instruction (지시): 5개 (10%) - 기술 안내
- request (요청): 4개 (8%) - 기술 요청
- suggestion (제안): 4개 (8%) - 기술 제안
- emotion (감정): 3개 (6%) - 기술 감정
- greeting (인사): 3개 (6%) - 기술 관련 인사
- gratitude (감사): 2개 (4%) - 기술 감사
- agreement (동의): 2개 (4%) - 기술 동의
- apology (사과): 2개 (4%) - 기술 사과
- refusal (거절): 1개 (2%) - 기술 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 12개 (24%) - 기술 용어
- verb (동사): 10개 (20%) - 기술 행동
- adjective (형용사): 8개 (16%) - 기술 특성
- other (기타): 6개 (12%) - 기술 구문
- adverb (부사): 4개 (8%) - 기술 방식
- interrogative (의문사): 3개 (6%) - 기술 질문
- interjection (감탄사): 2개 (4%) - 기술 감탄
- preposition (전치사): 2개 (4%) - 기술 관계
- conjunction (접속사): 2개 (4%) - 기술 연결
- determiner (한정사): 1개 (2%) - 기술 한정

**상황 분포:**
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + work: 10개 (20%) - 공식적 업무 환경
- polite + public: 8개 (16%) - 정중한 공공장소
- casual + work: 6개 (12%) - 편안한 업무 환경
- polite + social: 5개 (10%) - 정중한 사회적 상황
- formal + public: 3개 (6%) - 공식적 공공장소
- casual + social: 2개 (4%) - 편안한 사회적 상황
- polite + online: 1개 (2%) - 정중한 온라인

data, security, cloud를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-2번 배치 (50개): technology-innovation+development+programming 테마 최대 다양성

```
기술(technology) 도메인의 innovation(혁신), development(개발), programming(프로그래밍) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- innovation (혁신): 18개 (36%) - 기술 혁신, 신기술
- development (개발): 18개 (36%) - 소프트웨어 개발, 시스템 개발
- programming (프로그래밍): 14개 (28%) - 코딩, 프로그래밍 언어

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 개발 경험 필요
- advanced (고급): 16개 (32%) - 전문 개발 지식
- technical (전문): 8개 (16%) - 고급 프로그래밍
- fluent (유창): 5개 (10%) - 유창한 기술 토론
- basic (기초): 3개 (6%) - 기본 개발 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 9개 (18%) - 개발 안내
- description (묘사): 8개 (16%) - 기술 설명
- opinion (의견): 7개 (14%) - 기술 견해
- question (질문): 6개 (12%) - 개발 질의
- suggestion (제안): 5개 (10%) - 개발 제안
- request (요청): 4개 (8%) - 개발 요청
- agreement (동의): 3개 (6%) - 기술 동의
- emotion (감정): 2개 (4%) - 개발 감정
- gratitude (감사): 2개 (4%) - 개발 감사
- greeting (인사): 2개 (4%) - 개발 인사
- apology (사과): 1개 (2%) - 개발 사과
- refusal (거절): 1개 (2%) - 개발 거절

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 개발 행동
- noun (명사): 12개 (24%) - 기술 용어
- adjective (형용사): 8개 (16%) - 기술 특성
- other (기타): 5개 (10%) - 개발 구문
- adverb (부사): 4개 (8%) - 개발 방식
- interrogative (의문사): 3개 (6%) - 개발 질문
- preposition (전치사): 2개 (4%) - 기술 관계
- conjunction (접속사): 1개 (2%) - 기술 연결
- interjection (감탄사): 1개 (2%) - 기술 감탄

**상황 분포:**
- polite + work: 18개 (36%) - 정중한 업무 환경
- formal + work: 12개 (24%) - 공식적 업무 환경
- casual + work: 8개 (16%) - 편안한 업무 환경
- polite + online: 5개 (10%) - 정중한 온라인
- formal + online: 3개 (6%) - 공식적 온라인
- polite + public: 2개 (4%) - 정중한 공공장소
- casual + online: 2개 (4%) - 편안한 온라인

innovation, development, programming을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-3번 배치 (50개): technology-devices+software+applications 테마 최대 다양성

```
기술(technology) 도메인의 devices(기기), software(소프트웨어), applications(애플리케이션) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- devices (기기): 18개 (36%) - 하드웨어, 전자기기
- software (소프트웨어): 18개 (36%) - 시스템 소프트웨어, 프로그램
- applications (애플리케이션): 14개 (28%) - 앱, 응용프로그램

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 기술 사용 경험 필요
- basic (기초): 12개 (24%) - 기본 사용법
- advanced (고급): 10개 (20%) - 전문적 활용
- fluent (유창): 5개 (10%) - 유창한 기술 설명
- technical (전문): 3개 (6%) - 기술적 세부사항

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 기기/소프트웨어 설명
- instruction (지시): 8개 (16%) - 사용법 안내
- opinion (의견): 7개 (14%) - 기술 평가
- question (질문): 6개 (12%) - 사용법 질의
- request (요청): 5개 (10%) - 기술 지원 요청
- suggestion (제안): 4개 (8%) - 기술 활용 제안
- emotion (감정): 3개 (6%) - 기술 사용 감정
- gratitude (감사): 2개 (4%) - 기술 지원 감사
- greeting (인사): 2개 (4%) - 기술 관련 인사
- agreement (동의): 2개 (4%) - 기술 동의
- apology (사과): 1개 (2%) - 기술 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 15개 (30%) - 기기/소프트웨어 명칭
- verb (동사): 12개 (24%) - 기술 사용 동작
- adjective (형용사): 10개 (20%) - 기술 특성
- other (기타): 4개 (8%) - 기술 표현
- adverb (부사): 3개 (6%) - 사용 방식
- interrogative (의문사): 2개 (4%) - 기술 질문
- preposition (전치사): 2개 (4%) - 기술 관계
- interjection (감탄사): 1개 (2%) - 기술 감탄
- conjunction (접속사): 1개 (2%) - 기술 연결

**상황 분포:**
- casual + work: 12개 (24%) - 편안한 업무 환경
- polite + work: 10개 (20%) - 정중한 업무 환경
- casual + home: 8개 (16%) - 편안한 집
- polite + public: 6개 (12%) - 정중한 공공장소
- casual + public: 5개 (10%) - 편안한 공공장소
- polite + home: 4개 (8%) - 정중한 집
- casual + social: 3개 (6%) - 편안한 사회적 상황
- polite + social: 2개 (4%) - 정중한 사회적 상황

devices, software, applications를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-4번 배치 (50개): technology-internet+social+mobile 테마 최대 다양성

```
기술(technology) 도메인의 internet(인터넷), social(소셜미디어), mobile(모바일) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- internet (인터넷): 18개 (36%) - 웹, 온라인 서비스
- social (소셜미디어): 18개 (36%) - SNS, 소셜 플랫폼
- mobile (모바일): 14개 (28%) - 스마트폰, 모바일 앱

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 일반적 디지털 활용
- basic (기초): 15개 (30%) - 기본 인터넷/모바일 사용
- advanced (고급): 10개 (20%) - 고급 디지털 활용
- fluent (유창): 5개 (10%) - 유창한 디지털 소통
- technical (전문): 2개 (4%) - 기술적 세부사항

**목적 분포 (12개 모두 포함):**
- opinion (의견): 9개 (18%) - 디지털 문화 의견
- description (묘사): 8개 (16%) - 플랫폼 설명
- question (질문): 7개 (14%) - 사용법 질의
- emotion (감정): 6개 (12%) - 소셜미디어 감정
- request (요청): 5개 (10%) - 도움 요청
- instruction (지시): 4개 (8%) - 사용법 안내
- suggestion (제안): 3개 (6%) - 플랫폼 제안
- greeting (인사): 3개 (6%) - 온라인 인사
- gratitude (감사): 2개 (4%) - 온라인 감사
- agreement (동의): 2개 (4%) - 온라인 동의
- apology (사과): 1개 (2%) - 온라인 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 디지털 행동
- noun (명사): 12개 (24%) - 플랫폼/서비스 명칭
- adjective (형용사): 10개 (20%) - 디지털 특성
- other (기타): 5개 (10%) - 온라인 표현
- adverb (부사): 3개 (6%) - 사용 방식
- interrogative (의문사): 2개 (4%) - 온라인 질문
- interjection (감탄사): 2개 (4%) - 온라인 감탄
- preposition (전치사): 1개 (2%) - 디지털 관계
- conjunction (접속사): 1개 (2%) - 온라인 연결

**상황 분포:**
- casual + social: 15개 (30%) - 편안한 사회적 상황
- polite + social: 10개 (20%) - 정중한 사회적 상황
- casual + home: 8개 (16%) - 편안한 집
- casual + public: 6개 (12%) - 편안한 공공장소
- polite + home: 4개 (8%) - 정중한 집
- casual + online: 3개 (6%) - 편안한 온라인
- polite + public: 2개 (4%) - 정중한 공공장소
- polite + online: 2개 (4%) - 정중한 온라인

internet, social, mobile을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-5번 배치 (50개): technology-gaming+communication+automation 테마 최대 다양성

```
기술(technology) 도메인의 gaming(게임), communication(통신), automation(자동화) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- gaming (게임): 18개 (36%) - 비디오게임, 게임 문화
- communication (통신): 18개 (36%) - 통신 기술, 메시징
- automation (자동화): 14개 (28%) - 자동화 시스템, 스마트 기술

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 19개 (38%) - 기술 사용 경험 필요
- advanced (고급): 12개 (24%) - 전문적 기술 활용
- basic (기초): 10개 (20%) - 기본 사용법
- fluent (유창): 6개 (12%) - 유창한 기술 토론
- technical (전문): 3개 (6%) - 고급 기술 지식

**목적 분포 (12개 모두 포함):**
- description (묘사): 9개 (18%) - 기술 설명
- opinion (의견): 8개 (16%) - 기술 평가
- emotion (감정): 7개 (14%) - 게임/기술 감정
- instruction (지시): 6개 (12%) - 사용법 안내
- question (질문): 5개 (10%) - 기술 질의
- request (요청): 4개 (8%) - 기술 요청
- suggestion (제안): 3개 (6%) - 기술 제안
- greeting (인사): 3개 (6%) - 게임/기술 인사
- gratitude (감사): 2개 (4%) - 기술 감사
- agreement (동의): 2개 (4%) - 기술 동의
- apology (사과): 1개 (2%) - 기술 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 13개 (26%) - 게임/기술 용어
- verb (동사): 12개 (24%) - 게임/기술 행동
- adjective (형용사): 9개 (18%) - 기술 특성
- other (기타): 6개 (12%) - 게임 표현
- adverb (부사): 4개 (8%) - 게임 방식
- interjection (감탄사): 3개 (6%) - 게임 감탄
- interrogative (의문사): 2개 (4%) - 기술 질문
- preposition (전치사): 1개 (2%) - 기술 관계

**상황 분포:**
- casual + social: 12개 (24%) - 편안한 사회적 상황
- casual + home: 10개 (20%) - 편안한 집
- polite + work: 8개 (16%) - 정중한 업무 환경
- casual + work: 6개 (12%) - 편안한 업무 환경
- polite + social: 5개 (10%) - 정중한 사회적 상황
- polite + home: 4개 (8%) - 정중한 집
- casual + online: 3개 (6%) - 편안한 온라인
- polite + public: 2개 (4%) - 정중한 공공장소

gaming, communication, automation을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-6번 배치 (50개): technology-artificial+research+other 테마 최대 다양성

```
기술(technology) 도메인의 artificial(인공지능), research(연구), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- artificial (인공지능): 20개 (40%) - AI, 머신러닝, 딥러닝
- research (연구): 18개 (36%) - 기술 연구, R&D
- other (기타): 12개 (24%) - 기타 신기술, 융합 기술

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 전문적 AI 지식
- technical (전문): 12개 (24%) - 고도의 기술 지식
- intermediate (중급): 10개 (20%) - AI 기본 이해
- fluent (유창): 7개 (14%) - 유창한 기술 토론
- basic (기초): 3개 (6%) - 기본 AI 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - AI/연구 설명
- opinion (의견): 10개 (20%) - 기술 견해
- instruction (지시): 8개 (16%) - 연구 방법 안내
- question (질문): 6개 (12%) - 기술 질의
- suggestion (제안): 4개 (8%) - 연구 제안
- request (요청): 3개 (6%) - 연구 요청
- agreement (동의): 2개 (4%) - 기술 동의
- emotion (감정): 2개 (4%) - 기술 감정
- greeting (인사): 1개 (2%) - 연구 인사
- gratitude (감사): 1개 (2%) - 연구 감사
- apology (사과): 1개 (2%) - 연구 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - AI/연구 용어
- verb (동사): 12개 (24%) - 연구 행동
- adjective (형용사): 10개 (20%) - 기술 특성
- other (기타): 6개 (12%) - 전문 표현
- adverb (부사): 3개 (6%) - 연구 방식
- interrogative (의문사): 2개 (4%) - 연구 질문
- preposition (전치사): 1개 (2%) - 기술 관계

**상황 분포:**
- formal + work: 18개 (36%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + public: 8개 (16%) - 공식적 공공장소
- polite + public: 6개 (12%) - 정중한 공공장소
- formal + online: 3개 (6%) - 공식적 온라인
- polite + online: 2개 (4%) - 정중한 온라인
- casual + work: 1개 (2%) - 편안한 업무 환경

artificial, research, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-7번 배치 (50개): business-finance+marketing+negotiation 테마 최대 다양성

```
비즈니스(business) 도메인의 finance(재정), marketing(마케팅), negotiation(협상) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- finance (재정): 18개 (36%) - 금융, 재무 관리
- marketing (마케팅): 18개 (36%) - 마케팅 전략, 브랜딩
- negotiation (협상): 14개 (28%) - 협상 기술, 거래

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 비즈니스 기본 지식
- advanced (고급): 15개 (30%) - 전문적 비즈니스 지식
- technical (전문): 8개 (16%) - 고도의 전문 지식
- fluent (유창): 6개 (12%) - 유창한 비즈니스 소통
- basic (기초): 3개 (6%) - 기본 비즈니스 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 비즈니스 프로세스 설명
- opinion (의견): 9개 (18%) - 시장/전략 의견
- instruction (지시): 8개 (16%) - 업무 지시
- question (질문): 6개 (12%) - 비즈니스 질의
- suggestion (제안): 5개 (10%) - 전략 제안
- request (요청): 4개 (8%) - 업무 요청
- agreement (동의): 3개 (6%) - 협상 동의
- greeting (인사): 2개 (4%) - 비즈니스 인사
- gratitude (감사): 1개 (2%) - 비즈니스 감사
- emotion (감정): 1개 (2%) - 비즈니스 감정
- apology (사과): 1개 (2%) - 비즈니스 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 비즈니스 용어
- verb (동사): 12개 (24%) - 비즈니스 행동
- adjective (형용사): 10개 (20%) - 비즈니스 특성
- other (기타): 6개 (12%) - 비즈니스 표현
- adverb (부사): 4개 (8%) - 비즈니스 방식
- interrogative (의문사): 2개 (4%) - 비즈니스 질문
- preposition (전치사): 1개 (2%) - 비즈니스 관계
- conjunction (접속사): 1개 (2%) - 비즈니스 연결

**상황 분포:**
- formal + work: 20개 (40%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 8개 (16%) - 공식적 공공장소
- polite + public: 4개 (8%) - 정중한 공공장소
- casual + work: 2개 (4%) - 편안한 업무 환경
- polite + social: 1개 (2%) - 정중한 사회적 상황

finance, marketing, negotiation을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-8번 배치 (50개): business-leadership+teamwork+management 테마 최대 다양성

```
비즈니스(business) 도메인의 leadership(리더십), teamwork(팀워크), management(관리) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- leadership (리더십): 18개 (36%) - 리더십 스킬, 경영진 역할
- teamwork (팀워크): 18개 (36%) - 팀 협업, 공동 작업
- management (관리): 14개 (28%) - 프로젝트 관리, 인사 관리

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 관리 기술
- intermediate (중급): 15개 (30%) - 기본 관리 지식
- fluent (유창): 8개 (16%) - 유창한 리더십 소통
- technical (전문): 6개 (12%) - 전문 관리 기법
- basic (기초): 3개 (6%) - 기본 팀워크 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 12개 (24%) - 관리 지시
- opinion (의견): 10개 (20%) - 리더십 견해
- description (묘사): 8개 (16%) - 관리 프로세스 설명
- suggestion (제안): 6개 (12%) - 팀워크 제안
- request (요청): 4개 (8%) - 업무 요청
- question (질문): 3개 (6%) - 관리 질의
- agreement (동의): 2개 (4%) - 팀 동의
- gratitude (감사): 2개 (4%) - 팀 감사
- greeting (인사): 1개 (2%) - 리더십 인사
- emotion (감정): 1개 (2%) - 리더십 감정
- apology (사과): 1개 (2%) - 관리 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 16개 (32%) - 관리 행동
- noun (명사): 12개 (24%) - 리더십 용어
- adjective (형용사): 10개 (20%) - 관리 특성
- other (기타): 5개 (10%) - 리더십 표현
- adverb (부사): 4개 (8%) - 관리 방식
- interrogative (의문사): 2개 (4%) - 관리 질문
- preposition (전치사): 1개 (2%) - 관리 관계

**상황 분포:**
- formal + work: 22개 (44%) - 공식적 업무 환경
- polite + work: 18개 (36%) - 정중한 업무 환경
- formal + public: 5개 (10%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- casual + work: 2개 (4%) - 편안한 업무 환경

leadership, teamwork, management를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-9번 배치 (50개): business-meeting+communication+presentation 테마 최대 다양성

```
비즈니스(business) 도메인의 meeting(회의), communication(의사소통), presentation(발표) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- meeting (회의): 18개 (36%) - 회의 진행, 회의 참여
- communication (의사소통): 18개 (36%) - 업무 커뮤니케이션, 소통 기술
- presentation (발표): 14개 (28%) - 프레젠테이션, 발표 기술

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 기본 비즈니스 소통
- advanced (고급): 12개 (24%) - 고급 프레젠테이션 기술
- fluent (유창): 10개 (20%) - 유창한 비즈니스 소통
- basic (기초): 5개 (10%) - 기본 회의 참여
- technical (전문): 3개 (6%) - 전문 발표 기법

**목적 분포 (12개 모두 포함):**
- instruction (지시): 10개 (20%) - 회의/발표 지시
- description (묘사): 9개 (18%) - 프로세스 설명
- question (질문): 8개 (16%) - 회의 질의
- opinion (의견): 6개 (12%) - 업무 의견
- request (요청): 5개 (10%) - 회의 요청
- suggestion (제안): 4개 (8%) - 발표 제안
- greeting (인사): 3개 (6%) - 회의 인사
- agreement (동의): 2개 (4%) - 회의 동의
- gratitude (감사): 1개 (2%) - 발표 감사
- emotion (감정): 1개 (2%) - 발표 감정
- apology (사과): 1개 (2%) - 회의 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 15개 (30%) - 회의/발표 행동
- noun (명사): 12개 (24%) - 회의 용어
- other (기타): 8개 (16%) - 비즈니스 표현
- adjective (형용사): 6개 (12%) - 발표 특성
- adverb (부사): 4개 (8%) - 소통 방식
- interrogative (의문사): 3개 (6%) - 회의 질문
- preposition (전치사): 1개 (2%) - 회의 관계
- conjunction (접속사): 1개 (2%) - 소통 연결

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 6개 (12%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- casual + work: 1개 (2%) - 편안한 업무 환경

meeting, communication, presentation을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-10번 배치 (50개): business-contracts+planning+reports 테마 최대 다양성

```
비즈니스(business) 도메인의 contracts(계약), planning(기획), reports(보고서) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- contracts (계약): 18개 (36%) - 계약서 작성, 계약 조건
- planning (기획): 18개 (36%) - 사업 기획, 전략 수립
- reports (보고서): 14개 (28%) - 업무 보고, 분석 보고서

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 비즈니스 문서
- technical (전문): 12개 (24%) - 전문 계약/법무 지식
- intermediate (중급): 10개 (20%) - 기본 업무 문서
- fluent (유창): 7개 (14%) - 유창한 비즈니스 작성
- basic (기초): 3개 (6%) - 기본 문서 이해

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 문서 내용 설명
- instruction (지시): 10개 (20%) - 문서 작성 지시
- opinion (의견): 8개 (16%) - 계획/전략 의견
- request (요청): 6개 (12%) - 문서 요청
- question (질문): 4개 (8%) - 계약/기획 질의
- suggestion (제안): 3개 (6%) - 기획 제안
- agreement (동의): 2개 (4%) - 계약 동의
- gratitude (감사): 2개 (4%) - 업무 감사
- greeting (인사): 1개 (2%) - 비즈니스 인사
- emotion (감정): 1개 (2%) - 업무 감정
- apology (사과): 1개 (2%) - 업무 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 계약/기획 용어
- verb (동사): 12개 (24%) - 문서 작성 행동
- adjective (형용사): 10개 (20%) - 문서 특성
- other (기타): 6개 (12%) - 비즈니스 표현
- adverb (부사): 3개 (6%) - 작성 방식
- interrogative (의문사): 2개 (4%) - 계약 질문
- preposition (전치사): 1개 (2%) - 계약 관계

**상황 분포:**
- formal + work: 30개 (60%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + public: 5개 (10%) - 공식적 공공장소
- polite + public: 2개 (4%) - 정중한 공공장소
- formal + online: 1개 (2%) - 공식적 온라인

contracts, planning, reports를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-11번 배치 (50개): business-emails+sales+other 테마 최대 다양성

```
비즈니스(business) 도메인의 emails(이메일), sales(영업), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- emails (이메일): 20개 (40%) - 비즈니스 이메일, 공식 서신
- sales (영업): 18개 (36%) - 영업 활동, 고객 관리
- other (기타): 12개 (24%) - 기타 비즈니스 활동

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 기본 비즈니스 소통
- advanced (고급): 14개 (28%) - 고급 영업 기술
- fluent (유창): 10개 (20%) - 유창한 비즈니스 라이팅
- technical (전문): 5개 (10%) - 전문 비즈니스 지식
- basic (기초): 3개 (6%) - 기본 이메일 작성

**목적 분포 (12개 모두 포함):**
- request (요청): 10개 (20%) - 업무 요청
- description (묘사): 8개 (16%) - 서비스 설명
- gratitude (감사): 7개 (14%) - 고객 감사
- opinion (의견): 6개 (12%) - 비즈니스 의견
- instruction (지시): 5개 (10%) - 업무 지시
- greeting (인사): 4개 (8%) - 비즈니스 인사
- suggestion (제안): 3개 (6%) - 영업 제안
- question (질문): 3개 (6%) - 고객 질의
- agreement (동의): 2개 (4%) - 거래 동의
- apology (사과): 1개 (2%) - 고객 사과
- emotion (감정): 1개 (2%) - 영업 감정

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 영업/이메일 행동
- noun (명사): 12개 (24%) - 비즈니스 용어
- other (기타): 10개 (20%) - 이메일 표현
- adjective (형용사): 8개 (16%) - 서비스 특성
- adverb (부사): 3개 (6%) - 소통 방식
- interrogative (의문사): 2개 (4%) - 고객 질문
- preposition (전치사): 1개 (2%) - 비즈니스 관계

**상황 분포:**
- polite + work: 20개 (40%) - 정중한 업무 환경
- formal + work: 15개 (30%) - 공식적 업무 환경
- polite + public: 8개 (16%) - 정중한 공공장소
- polite + social: 4개 (8%) - 정중한 사회적 상황
- formal + public: 2개 (4%) - 공식적 공공장소
- casual + work: 1개 (2%) - 편안한 업무 환경

emails, sales, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-12번 배치 (50개): education-research+curriculum+assessment 테마 최대 다양성

```
교육(education) 도메인의 research(연구), curriculum(교육과정), assessment(평가) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- research (연구): 18개 (36%) - 학술 연구, 연구 방법론
- curriculum (교육과정): 18개 (36%) - 교육과정 설계, 커리큘럼 개발
- assessment (평가): 14개 (28%) - 학습 평가, 성과 측정

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 교육학 지식
- technical (전문): 12개 (24%) - 전문 교육 이론
- intermediate (중급): 10개 (20%) - 기본 교육 지식
- fluent (유창): 7개 (14%) - 유창한 학술 표현
- basic (기초): 3개 (6%) - 기본 연구 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 연구/교육과정 설명
- instruction (지시): 10개 (20%) - 연구 방법 안내
- opinion (의견): 8개 (16%) - 교육 이론 의견
- question (질문): 6개 (12%) - 연구 질의
- suggestion (제안): 4개 (8%) - 교육 개선 제안
- request (요청): 3개 (6%) - 연구 협력 요청
- agreement (동의): 2개 (4%) - 교육 방향 동의
- gratitude (감사): 2개 (4%) - 연구 감사
- greeting (인사): 1개 (2%) - 학술 인사
- emotion (감정): 1개 (2%) - 연구 감정
- apology (사과): 1개 (2%) - 연구 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 교육학 용어
- verb (동사): 12개 (24%) - 연구 행동
- adjective (형용사): 10개 (20%) - 교육 특성
- other (기타): 6개 (12%) - 학술 표현
- adverb (부사): 3개 (6%) - 연구 방식
- interrogative (의문사): 2개 (4%) - 연구 질문
- preposition (전치사): 1개 (2%) - 교육 관계

**상황 분포:**
- formal + work: 20개 (40%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + school: 10개 (20%) - 공식적 학교
- polite + school: 5개 (10%) - 정중한 학교
- formal + public: 2개 (4%) - 공식적 공공장소
- polite + public: 1개 (2%) - 정중한 공공장소

research, curriculum, assessment를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-13번 배치 (50개): education-university+academic+scholarship 테마 최대 다양성

```
교육(education) 도메인의 university(대학), academic(학술), scholarship(장학금) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- university (대학): 18개 (36%) - 대학 생활, 대학 시스템
- academic (학술): 18개 (36%) - 학술 활동, 학술 연구
- scholarship (장학금): 14개 (28%) - 장학금 제도, 학자금 지원

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 대학 생활 이해
- advanced (고급): 14개 (28%) - 고급 학술 지식
- fluent (유창): 10개 (20%) - 유창한 학술 소통
- technical (전문): 5개 (10%) - 전문 학술 용어
- basic (기초): 3개 (6%) - 기본 대학 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 대학/학술 시스템 설명
- question (질문): 9개 (18%) - 학술/장학금 질의
- request (요청): 8개 (16%) - 학술 지원 요청
- opinion (의견): 6개 (12%) - 교육 시스템 의견
- instruction (지시): 5개 (10%) - 학술 활동 안내
- suggestion (제안): 4개 (8%) - 학술 활동 제안
- gratitude (감사): 3개 (6%) - 교육 지원 감사
- greeting (인사): 2개 (4%) - 학술 인사
- emotion (감정): 1개 (2%) - 학술 감정
- agreement (동의): 1개 (2%) - 학술 동의
- apology (사과): 1개 (2%) - 학술 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 15개 (30%) - 대학/학술 용어
- verb (동사): 12개 (24%) - 학술 활동 행동
- adjective (형용사): 10개 (20%) - 학술 특성
- other (기타): 6개 (12%) - 학술 표현
- interrogative (의문사): 4개 (8%) - 학술 질문
- adverb (부사): 2개 (4%) - 감정 방식
- interrogative (의문사): 1개 (2%) - 관계 질문

**상황 분포:**
- casual + home: 20개 (40%) - 편안한 집
- polite + home: 12개 (24%) - 정중한 집
- casual + social: 8개 (16%) - 편안한 사회적 상황
- polite + social: 6개 (12%) - 정중한 사회적 상황
- polite + shopping: 3개 (6%) - 정중한 쇼핑
- casual + shopping: 1개 (2%) - 편안한 쇼핑

furniture, relationships, emotions를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-23번 배치 (50개): daily-time+weather_talk+other 테마 최대 다양성

```
일상생활(daily) 도메인의 time(시간), weather_talk(날씨대화), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- time (시간): 20개 (40%) - 시간 표현, 시간 관리
- weather_talk (날씨대화): 18개 (36%) - 날씨 관련 일상 대화
- other (기타): 12개 (24%) - 기타 일상 활동

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 일상 시간/날씨 표현
- basic (기초): 15개 (30%) - 기본 시간/날씨 어휘
- advanced (고급): 10개 (20%) - 복잡한 시간 개념
- fluent (유창): 5개 (10%) - 유창한 일상 표현
- technical (전문): 2개 (4%) - 전문 시간 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 시간/날씨 설명
- opinion (의견): 8개 (16%) - 날씨/시간 의견
- question (질문): 7개 (14%) - 시간/날씨 질의
- greeting (인사): 6개 (12%) - 시간대별 인사
- emotion (감정): 5개 (10%) - 날씨 감정
- suggestion (제안): 4개 (8%) - 시간 관리 제안
- request (요청): 3개 (6%) - 시간 관련 요청
- instruction (지시): 3개 (6%) - 시간 안내
- agreement (동의): 2개 (4%) - 시간 동의
- gratitude (감사): 1개 (2%) - 시간 감사
- apology (사과): 1개 (2%) - 시간 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 시간/날씨 용어
- adjective (형용사): 12개 (24%) - 날씨 특성
- verb (동사): 10개 (20%) - 시간 행동
- adverb (부사): 6개 (12%) - 시간 부사
- other (기타): 4개 (8%) - 시간 표현
- interjection (감탄사): 2개 (4%) - 날씨 감탄
- interrogative (의문사): 2개 (4%) - 시간 질문

**상황 분포:**
- casual + social: 15개 (30%) - 편안한 사회적 상황
- polite + social: 12개 (24%) - 정중한 사회적 상황
- casual + home: 10개 (20%) - 편안한 집
- polite + home: 6개 (12%) - 정중한 집
- casual + public: 4개 (8%) - 편안한 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소

time, weather_talk, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-24번 배치 (50개): travel-transportation+accommodation+booking 테마 최대 다양성

```
여행(travel) 도메인의 transportation(교통), accommodation(숙박), booking(예약) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- transportation (교통): 18개 (36%) - 교통수단, 이동 계획
- accommodation (숙박): 18개 (36%) - 숙박시설, 호텔 서비스
- booking (예약): 14개 (28%) - 예약 시스템, 예약 확인

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 여행 경험 이해
- advanced (고급): 12개 (24%) - 복잡한 여행 계획
- basic (기초): 10개 (20%) - 기본 여행 어휘
- fluent (유창): 6개 (12%) - 유창한 여행 소통
- technical (전문): 2개 (4%) - 전문 여행업 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 10개 (20%) - 예약/서비스 요청
- question (질문): 8개 (16%) - 여행 정보 질의
- description (묘사): 7개 (14%) - 여행 서비스 설명
- instruction (지시): 6개 (12%) - 예약 방법 안내
- opinion (의견): 5개 (10%) - 여행 서비스 의견
- gratitude (감사): 4개 (8%) - 서비스 감사
- suggestion (제안): 3개 (6%) - 여행 제안
- greeting (인사): 3개 (6%) - 여행 관련 인사
- agreement (동의): 2개 (4%) - 예약 동의
- emotion (감정): 1개 (2%) - 여행 감정
- apology (사과): 1개 (2%) - 예약 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 15개 (30%) - 교통/숙박 용어
- verb (동사): 12개 (24%) - 예약/이동 행동
- adjective (형용사): 8개 (16%) - 여행 서비스 특성
- other (기타): 6개 (12%) - 여행 표현
- interrogative (의문사): 4개 (8%) - 여행 질문
- adverb (부사): 3개 (6%) - 여행 방식
- preposition (전치사): 2개 (4%) - 위치 관계

**상황 분포:**
- polite + travel: 20개 (40%) - 정중한 여행
- formal + travel: 12개 (24%) - 공식적 여행
- polite + public: 8개 (16%) - 정중한 공공장소
- casual + travel: 6개 (12%) - 편안한 여행
- polite + work: 3개 (6%) - 정중한 업무 여행
- formal + work: 1개 (2%) - 공식적 업무 여행

transportation, accommodation, booking을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-25번 배치 (50개): travel-tourist_attraction+sightseeing+culture 테마 최대 다양성

```
여행(travel) 도메인의 tourist_attraction(관광명소), sightseeing(관광), culture(문화체험) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- tourist_attraction (관광명소): 18개 (36%) - 명소 방문, 랜드마크
- sightseeing (관광): 18개 (36%) - 관광 활동, 둘러보기
- culture (문화체험): 14개 (28%) - 현지 문화, 문화 체험

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 관광 활동 이해
- advanced (고급): 12개 (24%) - 문화 깊이 이해
- basic (기초): 12개 (24%) - 기본 관광 어휘
- fluent (유창): 6개 (12%) - 유창한 문화 소통
- technical (전문): 2개 (4%) - 전문 문화 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 명소/문화 설명
- emotion (감정): 8개 (16%) - 관광 감정
- opinion (의견): 7개 (14%) - 문화/명소 의견
- question (질문): 6개 (12%) - 관광 정보 질의
- suggestion (제안): 5개 (10%) - 관광 제안
- request (요청): 4개 (8%) - 안내 요청
- gratitude (감사): 3개 (6%) - 안내 감사
- greeting (인사): 2개 (4%) - 관광지 인사
- instruction (지시): 1개 (2%) - 관광 안내
- agreement (동의): 1개 (2%) - 관광 동의
- apology (사과): 1개 (2%) - 관광 사과

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 14개 (28%) - 명소/문화 특성
- noun (명사): 12개 (24%) - 관광 용어
- verb (동사): 10개 (20%) - 관광 행동
- interjection (감탄사): 6개 (12%) - 관광 감탄
- other (기타): 4개 (8%) - 관광 표현
- adverb (부사): 2개 (4%) - 관광 방식
- interrogative (의문사): 2개 (4%) - 관광 질문

**상황 분포:**
- casual + travel: 18개 (36%) - 편안한 여행
- polite + travel: 15개 (30%) - 정중한 여행
- casual + public: 8개 (16%) - 편안한 공공장소
- polite + public: 6개 (12%) - 정중한 공공장소
- casual + social: 2개 (4%) - 편안한 사회적 상황
- polite + social: 1개 (2%) - 정중한 사회적 상황

tourist_attraction, sightseeing, culture를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-26번 배치 (50개): travel-luggage+direction+currency 테마 최대 다양성

```
여행(travel) 도메인의 luggage(짐), direction(길찾기), currency(환전) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- luggage (짐): 18개 (36%) - 수하물, 짐 관리
- direction (길찾기): 18개 (36%) - 방향 안내, 길 찾기
- currency (환전): 14개 (28%) - 환전, 화폐 교환

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 여행 실무 이해
- basic (기초): 15개 (30%) - 기본 여행 필수 어휘
- advanced (고급): 8개 (16%) - 복잡한 여행 상황
- fluent (유창): 5개 (10%) - 유창한 여행 소통
- technical (전문): 2개 (4%) - 전문 여행 용어

**목적 분포 (12개 모두 포함):**
- question (질문): 10개 (20%) - 길찾기/환전 질의
- request (요청): 9개 (18%) - 도움 요청
- instruction (지시): 8개 (16%) - 길 안내
- description (묘사): 6개 (12%) - 위치/상황 설명
- gratitude (감사): 5개 (10%) - 도움 감사
- suggestion (제안): 4개 (8%) - 여행 팁 제안
- opinion (의견): 3개 (6%) - 여행 의견
- emotion (감정): 2개 (4%) - 여행 감정
- greeting (인사): 1개 (2%) - 여행 인사
- agreement (동의): 1가 (2%) - 여행 동의
- apology (사과): 1개 (2%) - 여행 사과

**품사 분포 (10개 모두 포함):**
- interrogative (의문사): 12개 (24%) - 길찾기 질문
- noun (명사): 10개 (20%) - 짐/환전 용어
- verb (동사): 10개 (20%) - 이동/환전 행동
- adverb (부사): 6개 (12%) - 방향 부사
- preposition (전치사): 5개 (10%) - 위치 전치사
- other (기타): 4개 (8%) - 여행 표현
- adjective (형용사): 2개 (4%) - 짐/환전 특성
- interjection (감탄사): 1개 (2%) - 여행 감탄

**상황 분포:**
- polite + public: 20개 (40%) - 정중한 공공장소
- casual + public: 12개 (24%) - 편안한 공공장소
- polite + travel: 10개 (20%) - 정중한 여행
- casual + travel: 5개 (10%) - 편안한 여행
- urgent + public: 2개 (4%) - 긴급한 공공장소
- polite + work: 1개 (2%) - 정중한 업무 환경

luggage, direction, currency를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-27번 배치 (50개): travel-emergency+documents+souvenir 테마 최대 다양성

```
여행(travel) 도메인의 emergency(응급상황), documents(서류), souvenir(기념품) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- emergency (응급상황): 18개 (36%) - 응급 상황, 문제 해결
- documents (서류): 18개 (36%) - 여권, 비자, 공식 서류
- souvenir (기념품): 14개 (28%) - 기념품 구매, 선물

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 여행 문제 상황 이해
- advanced (고급): 12개 (24%) - 복잡한 응급 상황
- basic (기초): 10개 (20%) - 기본 응급/서류 어휘
- fluent (유창): 7개 (14%) - 유창한 문제 해결 소통
- technical (전문): 3개 (6%) - 전문 응급/법무 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 12개 (24%) - 응급 도움 요청
- question (질문): 8개 (16%) - 서류/기념품 질의
- emotion (감정): 7개 (14%) - 응급/쇼핑 감정
- description (묘사): 6개 (12%) - 상황/상품 설명
- instruction (지시): 5개 (10%) - 응급 처치 지시
- gratitude (감사): 4개 (8%) - 도움 감사
- opinion (의견): 3개 (6%) - 기념품 의견
- suggestion (제안): 2개 (4%) - 해결 방법 제안
- greeting (인사): 1개 (2%) - 상점 인사
- agreement (동의): 1개 (2%) - 구매 동의
- apology (사과): 1개 (2%) - 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 12개 (24%) - 응급/서류/기념품 용어
- verb (동사): 10개 (20%) - 응급/구매 행동
- interjection (감탄사): 8개 (16%) - 응급 감탄
- adjective (형용사): 8개 (16%) - 상황/상품 특성
- other (기타): 6개 (12%) - 응급 표현
- interrogative (의문사): 3개 (6%) - 응급 질문
- adverb (부사): 2개 (4%) - 응급 방식
- preposition (전치사): 1개 (2%) - 위치 관계

**상황 분포:**
- urgent + public: 15개 (30%) - 긴급한 공공장소
- polite + public: 12개 (24%) - 정중한 공공장소
- urgent + medical: 8개 (16%) - 긴급한 의료
- polite + shopping: 6개 (12%) - 정중한 쇼핑
- formal + work: 5개 (10%) - 공식적 업무
- casual + shopping: 3개 (6%) - 편안한 쇼핑
- polite + work: 1개 (2%) - 정중한 업무

emergency, documents, souvenir를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-28번 배치 (50개): travel-local_food+other 테마 최대 다양성

```
여행(travel) 도메인의 local_food(현지음식), other(기타 여행 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- local_food (현지음식): 30개 (60%) - 현지 요리, 음식 문화 체험
- other (기타): 20개 (40%) - 기타 여행 활동, 여행 팁

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 음식 문화 이해
- basic (기초): 15개 (30%) - 기본 음식 주문 어휘
- advanced (고급): 10개 (20%) - 복잡한 음식 문화
- fluent (유창): 5개 (10%) - 유창한 음식 소통
- technical (전문): 2개 (4%) - 전문 요리 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 10개 (20%) - 음식 주문 요청
- opinion (의견): 8개 (16%) - 음식 평가 의견
- description (묘사): 7개 (14%) - 음식/여행 설명
- emotion (감정): 6개 (12%) - 음식 체험 감정
- question (질문): 5개 (10%) - 음식 정보 질의
- gratitude (감사): 4개 (8%) - 서비스 감사
- suggestion (제안): 3개 (6%) - 음식 추천
- greeting (인사): 3개 (6%) - 식당 인사
- instruction (지시): 2개 (4%) - 주문 방법 안내
- agreement (동의): 1개 (2%) - 주문 동의
- apology (사과): 1개 (2%) - 주문 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 음식/요리 명칭
- adjective (형용사): 12개 (24%) - 맛/음식 특성
- verb (동사): 10개 (20%) - 주문/체험 행동
- interjection (감탄사): 6개 (12%) - 맛 감탄
- other (기타): 4개 (8%) - 음식 표현
- interrogative (의문사): 2개 (4%) - 음식 질문
- adverb (부사): 2개 (4%) - 맛 부사

**상황 분포:**
- polite + travel: 15개 (30%) - 정중한 여행
- casual + travel: 12개 (24%) - 편안한 여행
- polite + restaurant: 10개 (20%) - 정중한 음식점
- casual + restaurant: 8개 (16%) - 편안한 음식점
- polite + social: 3개 (6%) - 정중한 사회적 상황
- casual + social: 2개 (4%) - 편안한 사회적 상황

local_food, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-29번 배치 (50개): health-exercise+nutrition+medicine 테마 최대 다양성

```
건강(health) 도메인의 exercise(운동), nutrition(영양), medicine(의학) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- exercise (운동): 18개 (36%) - 운동법, 피트니스
- nutrition (영양): 18개 (36%) - 영양학, 식단 관리
- medicine (의학): 14개 (28%) - 의료, 의학 지식

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 건강 관리 이해
- advanced (고급): 12개 (24%) - 고급 건강 지식
- technical (전문): 8개 (16%) - 전문 의학 용어
- basic (기초): 7개 (14%) - 기본 건강 어휘
- fluent (유창): 5개 (10%) - 유창한 건강 소통

**목적 분포 (12개 모두 포함):**
- instruction (지시): 10개 (20%) - 운동/건강 관리 지시
- description (묘사): 9개 (18%) - 건강 상태 설명
- suggestion (제안): 8개 (16%) - 건강 개선 제안
- opinion (의견): 6개 (12%) - 건강 방법 의견
- question (질문): 5개 (10%) - 건강 정보 질의
- request (요청): 4개 (8%) - 의료 도움 요청
- emotion (감정): 3개 (6%) - 건강 상태 감정
- gratitude (감사): 2개 (4%) - 의료 서비스 감사
- greeting (인사): 1개 (2%) - 의료 인사
- agreement (동의): 1개 (2%) - 치료 동의
- apology (사과): 1개 (2%) - 의료 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 운동/치료 행동
- noun (명사): 12개 (24%) - 건강/의학 용어
- adjective (형용사): 10개 (20%) - 건강 상태 특성
- other (기타): 6개 (12%) - 건강 표현
- adverb (부사): 4개 (8%) - 운동 방식
- interrogative (의문사): 2개 (4%) - 건강 질문
- preposition (전치사): 2개 (4%) - 건강 관계

**상황 분포:**
- polite + medical: 18개 (36%) - 정중한 의료
- polite + work: 12개 (24%) - 정중한 업무
- casual + home: 8개 (16%) - 편안한 집
- polite + home: 6개 (12%) - 정중한 집
- formal + medical: 4개 (8%) - 공식적 의료
- casual + work: 2개 (4%) - 편안한 업무

exercise, nutrition, medicine를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-30번 배치 (50개): health-mental_health+hospital+doctor 테마 최대 다양성

```
건강(health) 도메인의 mental_health(정신건강), hospital(병원), doctor(의사) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- mental_health (정신건강): 18개 (36%) - 정신 건강, 심리 치료
- hospital (병원): 18개 (36%) - 병원 이용, 의료 시설
- doctor (의사): 14개 (28%) - 의사 진료, 의료진

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 16개 (32%) - 고급 의료 지식
- technical (전문): 12개 (24%) - 전문 의학 용어
- intermediate (중급): 12개 (24%) - 의료 시스템 이해
- fluent (유창): 6개 (12%) - 유창한 의료 소통
- basic (기초): 4개 (8%) - 기본 의료 어휘

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 증상/치료 설명
- request (요청): 9개 (18%) - 의료 서비스 요청
- question (질문): 8개 (16%) - 의료 정보 질의
- instruction (지시): 6개 (12%) - 치료 방법 지시
- opinion (의견): 5개 (10%) - 치료 방법 의견
- emotion (감정): 4개 (8%) - 건강 상태 감정
- gratitude (감사): 3개 (6%) - 의료 서비스 감사
- suggestion (제안): 2개 (4%) - 치료 제안
- greeting (인사): 1개 (2%) - 의료 인사
- agreement (동의): 1개 (2%) - 치료 동의
- apology (사과): 1개 (2%) - 의료 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 의료/정신건강 용어
- verb (동사): 12개 (24%) - 의료 행동
- adjective (형용사): 10개 (20%) - 건강 상태 특성
- other (기타): 6개 (12%) - 의료 표현
- adverb (부사): 3개 (6%) - 치료 방식
- interrogative (의문사): 2개 (4%) - 의료 질문
- preposition (전치사): 1개 (2%) - 의료 관계

**상황 분포:**
- polite + medical: 25개 (50%) - 정중한 의료
- formal + medical: 15개 (30%) - 공식적 의료
- polite + work: 6개 (12%) - 정중한 업무
- polite + home: 3개 (6%) - 정중한 집
- casual + home: 1개 (2%) - 편안한 집

mental_health, hospital, doctor를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-31번 배치 (50개): health-symptoms+treatment+prevention 테마 최대 다양성

```
건강(health) 도메인의 symptoms(증상), treatment(치료), prevention(예방) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- symptoms (증상): 18개 (36%) - 질병 증상, 건강 이상
- treatment (치료): 18개 (36%) - 치료법, 의료 처치
- prevention (예방): 14개 (28%) - 질병 예방, 건강 관리

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 의학 지식
- technical (전문): 14개 (28%) - 전문 의료 용어
- intermediate (중급): 10개 (20%) - 의료 상황 이해
- fluent (유창): 5개 (10%) - 유창한 의료 설명
- basic (기초): 3개 (6%) - 기본 증상 어휘

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 증상/치료 설명
- instruction (지시): 10개 (20%) - 치료/예방 지시
- question (질문): 8개 (16%) - 의료 질의
- request (요청): 6개 (12%) - 치료 요청
- suggestion (제안): 5개 (10%) - 예방 방법 제안
- opinion (의견): 4개 (8%) - 치료 방법 의견
- emotion (감정): 2개 (4%) - 증상 감정
- gratitude (감사): 1개 (2%) - 치료 감사
- greeting (인사): 1개 (2%) - 의료 인사
- agreement (동의): 1개 (2%) - 치료 동의

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 증상/치료 용어
- verb (동사): 14개 (28%) - 치료/예방 행동
- adjective (형용사): 12개 (24%) - 증상 특성
- other (기타): 4개 (8%) - 의료 표현
- adverb (부사): 2개 (4%) - 치료 방식
- interrogative (의문사): 2개 (4%) - 의료 질문

**상황 분포:**
- polite + medical: 30개 (60%) - 정중한 의료
- formal + medical: 12개 (24%) - 공식적 의료
- polite + home: 5개 (10%) - 정중한 집
- polite + work: 2개 (4%) - 정중한 업무
- casual + home: 1개 (2%) - 편안한 집

symptoms, treatment, prevention를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-32번 배치 (50개): health-wellness+appointment+other 테마 최대 다양성

```
건강(health) 도메인의 wellness(웰빙), appointment(진료예약), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- wellness (웰빙): 20개 (40%) - 건강한 생활, 웰빙 관리
- appointment (진료예약): 18개 (36%) - 의료 예약, 스케줄 관리
- other (기타): 12개 (24%) - 기타 건강 관련 활동

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 건강 관리 이해
- advanced (고급): 12개 (24%) - 고급 웰빙 지식
- basic (기초): 10개 (20%) - 기본 예약 어휘
- fluent (유창): 7개 (14%) - 유창한 건강 소통
- technical (전문): 3개 (6%) - 전문 웰빙 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 10개 (20%) - 예약/서비스 요청
- description (묘사): 8개 (16%) - 웰빙 방법 설명
- suggestion (제안): 7개 (14%) - 건강 관리 제안
- question (질문): 6개 (12%) - 예약/건강 질의
- opinion (의견): 5개 (10%) - 웰빙 방법 의견
- instruction (지시): 4개 (8%) - 건강 관리 지시
- gratitude (감사): 3개 (6%) - 서비스 감사
- emotion (감정): 3개 (6%) - 건강 감정
- greeting (인사): 2개 (4%) - 건강 관련 인사
- agreement (동의): 1개 (2%) - 예약 동의
- apology (사과): 1개 (2%) - 예약 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 건강 관리 행동
- noun (명사): 12개 (24%) - 웰빙/예약 용어
- adjective (형용사): 10개 (20%) - 건강 상태 특성
- other (기타): 6개 (12%) - 건강 표현
- adverb (부사): 4개 (8%) - 건강 방식
- interrogative (의문사): 2개 (4%) - 예약 질문
- preposition (전치사): 2개 (4%) - 건강 관계

**상황 분포:**
- polite + medical: 15개 (30%) - 정중한 의료
- casual + home: 12개 (24%) - 편안한 집
- polite + home: 8개 (16%) - 정중한 집
- polite + work: 6개 (12%) - 정중한 업무
- casual + work: 5개 (10%) - 편안한 업무
- polite + public: 3개 (6%) - 정중한 공공장소
- casual + public: 1개 (2%) - 편안한 공공장소

wellness, appointment, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-33번 배치 (50개): culture-heritage+arts_crafts+national_identity 테마 최대 다양성

```
문화(culture) 도메인의 heritage(유산), arts_crafts(예술공예), national_identity(국가정체성) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- heritage (유산): 18개 (36%) - 문화유산, 전통 유산
- arts_crafts (예술공예): 18개 (36%) - 전통 예술, 수공예
- national_identity (국가정체성): 14개 (28%) - 국가 정체성, 민족 문화

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 문화 지식
- intermediate (중급): 15개 (30%) - 문화 이해
- fluent (유창): 10개 (20%) - 유창한 문화 표현
- technical (전문): 4개 (8%) - 전문 문화 용어
- basic (기초): 3개 (6%) - 기본 문화 어휘

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 문화/유산 설명
- opinion (의견): 10개 (20%) - 문화 가치 의견
- emotion (감정): 8개 (16%) - 문화적 감동
- instruction (지시): 6개 (12%) - 문화 체험 안내
- question (질문): 4개 (8%) - 문화 정보 질의
- suggestion (제안): 3개 (6%) - 문화 활동 제안
- gratitude (감사): 2개 (4%) - 문화 체험 감사
- greeting (인사): 2개 (4%) - 문화적 인사
- request (요청): 1개 (2%) - 문화 정보 요청
- agreement (동의): 1개 (2%) - 문화 견해 동의
- apology (사과): 1개 (2%) - 문화적 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 문화/유산 용어
- adjective (형용사): 14개 (28%) - 문화적 특성
- verb (동사): 10개 (20%) - 문화 행동
- other (기타): 6개 (12%) - 문화 표현
- adverb (부사): 2개 (4%) - 문화 방식
- interjection (감탄사): 2개 (4%) - 문화적 감탄

**상황 분포:**
- polite + public: 18개 (36%) - 정중한 공공장소
- formal + public: 12개 (24%) - 공식적 공공장소
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + social: 6개 (12%) - 편안한 사회적 상황
- formal + work: 4개 (8%) - 공식적 업무
- polite + travel: 2개 (4%) - 정중한 여행

heritage, arts_crafts, national_identity를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-34번 배치 (50개): culture-ceremony+etiquette+festivals 테마 최대 다양성

```
문화(culture) 도메인의 ceremony(의식), etiquette(예절), festivals(축제) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- ceremony (의식): 18개 (36%) - 전통 의식, 행사
- etiquette (예절): 18개 (36%) - 사회적 예절, 매너
- festivals (축제): 14개 (28%) - 전통 축제, 문화 행사

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 문화 예절 이해
- advanced (고급): 15개 (30%) - 고급 문화 지식
- fluent (유창): 10개 (20%) - 유창한 문화 소통
- basic (기초): 5개 (10%) - 기본 예절 어휘
- technical (전문): 2개 (4%) - 전문 문화 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 10개 (20%) - 예절/의식 안내
- description (묘사): 9개 (18%) - 문화/축제 설명
- emotion (감정): 8개 (16%) - 축제/의식 감정
- opinion (의견): 7개 (14%) - 문화 가치 의견
- suggestion (제안): 5개 (10%) - 문화 활동 제안
- question (질문): 4개 (8%) - 예절 질의
- greeting (인사): 3개 (6%) - 문화적 인사
- gratitude (감사): 2개 (4%) - 문화 체험 감사
- agreement (동의): 1개 (2%) - 문화 동의
- request (요청): 1개 (2%) - 문화 정보 요청

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 의식/예절 행동
- noun (명사): 12개 (24%) - 문화/축제 용어
- adjective (형용사): 10개 (20%) - 문화적 특성
- other (기타): 8개 (16%) - 문화 표현
- adverb (부사): 3개 (6%) - 예절 방식
- interjection (감탄사): 3개 (6%) - 축제 감탄

**상황 분포:**
- formal + public: 20개 (40%) - 공식적 공공장소
- polite + public: 15개 (30%) - 정중한 공공장소
- polite + social: 8개 (16%) - 정중한 사회적 상황
- formal + social: 5개 (10%) - 공식적 사회적 상황
- casual + social: 2개 (4%) - 편안한 사회적 상황

ceremony, etiquette, festivals를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-35번 배치 (50개): culture-traditions+customs+beliefs 테마 최대 다양성

```
문화(culture) 도메인의 traditions(전통), customs(관습), beliefs(신념) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- traditions (전통): 18개 (36%) - 전통 문화, 관습
- customs (관습): 18개 (36%) - 사회적 관습, 생활 양식
- beliefs (신념): 14개 (28%) - 문화적 신념, 가치관

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 문화 철학
- intermediate (중급): 15개 (30%) - 문화 가치 이해
- fluent (유창): 10개 (20%) - 유창한 철학적 표현
- technical (전문): 4개 (8%) - 전문 철학/종교 용어
- basic (기초): 3개 (6%) - 기본 전통 어휘

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 문화 가치 의견
- description (묘사): 10개 (20%) - 전통/신념 설명
- emotion (감정): 8개 (16%) - 문화적 감정
- instruction (지시): 6개 (12%) - 전통 실천 안내
- question (질문): 5개 (10%) - 문화 질의
- suggestion (제안): 3개 (6%) - 문화 실천 제안
- agreement (동의): 2개 (4%) - 가치관 동의
- gratitude (감사): 2개 (4%) - 문화 감사
- greeting (인사): 1개 (2%) - 전통적 인사
- request (요청): 1개 (2%) - 문화 정보 요청

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 전통/신념 용어
- adjective (형용사): 14개 (28%) - 문화적 가치 특성
- verb (동사): 10개 (20%) - 전통 실천 행동
- other (기타): 6개 (12%) - 철학적 표현
- adverb (부사): 2개 (4%) - 전통 방식
- interjection (감탄사): 2개 (4%) - 문화적 감탄

**상황 분포:**
- polite + social: 18개 (36%) - 정중한 사회적 상황
- formal + public: 12개 (24%) - 공식적 공공장소
- polite + public: 10개 (20%) - 정중한 공공장소
- formal + social: 6개 (12%) - 공식적 사회적 상황
- polite + home: 3개 (6%) - 정중한 집
- casual + social: 1개 (2%) - 편안한 사회적 상황

traditions, customs, beliefs를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-36번 배치 (50개): culture-values+history+literature 테마 최대 다양성

```
문화(culture) 도메인의 values(가치관), history(역사), literature(문학) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- values (가치관): 18개 (36%) - 문화적 가치, 도덕관
- history (역사): 18개 (36%) - 역사적 사실, 역사 인식
- literature (문학): 14개 (28%) - 문학 작품, 문학적 표현

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 20개 (40%) - 고급 인문학 지식
- fluent (유창): 15개 (30%) - 유창한 학술 표현
- technical (전문): 8개 (16%) - 전문 인문학 용어
- intermediate (중급): 5개 (10%) - 인문학 기본 이해
- basic (기초): 2개 (4%) - 기본 역사 어휘

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 가치관/역사 의견
- description (묘사): 10개 (20%) - 역사/문학 설명
- instruction (지시): 8개 (16%) - 학습 방법 안내
- emotion (감정): 6개 (12%) - 문학적 감정
- question (질문): 5개 (10%) - 인문학 질의
- suggestion (제안): 3개 (6%) - 학습 제안
- agreement (동의): 2개 (4%) - 가치관 동의
- gratitude (감사): 2개 (4%) - 학습 감사
- greeting (인사): 1개 (2%) - 학술적 인사
- request (요청): 1개 (2%) - 정보 요청

**품사 분포 (10개 모두 포함):**
- noun (명사): 18개 (36%) - 인문학 용어
- adjective (형용사): 14개 (28%) - 가치/문학적 특성
- verb (동사): 10개 (20%) - 학습/분석 행동
- other (기타): 6개 (12%) - 인문학 표현
- adverb (부사): 2개 (4%) - 학술 방식

**상황 분포:**
- formal + work: 20개 (40%) - 공식적 업무
- polite + work: 12개 (24%) - 정중한 업무
- formal + public: 10개 (20%) - 공식적 공공장소
- polite + public: 5개 (10%) - 정중한 공공장소
- formal + school: 2개 (4%) - 공식적 학교
- polite + school: 1개 (2%) - 정중한 학교

values, history, literature를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-37번 배치 (50개): culture-music+film+other 테마 최대 다양성

```
문화(culture) 도메인의 music(음악), film(영화), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- music (음악): 20개 (40%) - 전통/현대 음악, 음악 문화
- film (영화): 18개 (36%) - 영화 문화, 영상 예술
- other (기타): 12개 (24%) - 기타 문화 예술

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 문화 예술 이해
- advanced (고급): 15개 (30%) - 고급 예술 지식
- fluent (유창): 10개 (20%) - 유창한 예술 표현
- basic (기초): 5개 (10%) - 기본 예술 어휘
- technical (전문): 2개 (4%) - 전문 예술 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 10개 (20%) - 예술 작품 의견
- emotion (감정): 9개 (18%) - 예술적 감동
- description (묘사): 8개 (16%) - 작품/공연 설명
- suggestion (제안): 6개 (12%) - 문화 활동 제안
- question (질문): 5개 (10%) - 예술 정보 질의
- gratitude (감사): 4개 (8%) - 예술 체험 감사
- request (요청): 3개 (6%) - 예술 정보 요청
- greeting (인사): 2개 (4%) - 예술 관련 인사
- instruction (지시): 1개 (2%) - 예술 체험 안내
- agreement (동의): 1개 (2%) - 예술 견해 동의
- apology (사과): 1개 (2%) - 예술 관련 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 음악/영화 용어
- adjective (형용사): 12개 (24%) - 예술적 특성
- verb (동사): 10개 (20%) - 예술 감상 행동
- interjection (감탄사): 6개 (12%) - 예술적 감탄
- other (기타): 4개 (8%) - 예술 표현
- adverb (부사): 2개 (4%) - 예술 방식
- interrogative (의문사): 2개 (4%) - 예술 질문

**상황 분포:**
- casual + social: 15개 (30%) - 편안한 사회적 상황
- polite + social: 12개 (24%) - 정중한 사회적 상황
- casual + public: 10개 (20%) - 편안한 공공장소
- polite + public: 8개 (16%) - 정중한 공공장소
- casual + home: 3개 (6%) - 편안한 집
- polite + home: 2개 (4%) - 정중한 집

music, film, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-38번 배치 (50개): entertainment-movies+music+games 테마 최대 다양성

```
엔터테인먼트(entertainment) 도메인의 movies(영화), music(음악), games(게임) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- movies (영화): 18개 (36%) - 영화 감상, 영화 문화
- music (음악): 18개 (36%) - 음악 감상, 음악 활동
- games (게임): 14개 (28%) - 게임 플레이, 게임 문화

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 엔터테인먼트 이해
- basic (기초): 15개 (30%) - 기본 엔터테인먼트 어휘
- advanced (고급): 8개 (16%) - 고급 예술 지식
- fluent (유창): 5개 (10%) - 유창한 엔터테인먼트 표현
- technical (전문): 2개 (4%) - 전문 예술 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 10개 (20%) - 작품 평가 의견
- emotion (감정): 9개 (18%) - 감상 감정
- suggestion (제안): 8개 (16%) - 엔터테인먼트 추천
- description (묘사): 7개 (14%) - 작품 설명
- question (질문): 5개 (10%) - 엔터테인먼트 질의
- gratitude (감사): 4개 (8%) - 추천 감사
- request (요청): 3개 (6%) - 추천 요청
- greeting (인사): 2개 (4%) - 엔터테인먼트 인사
- agreement (동의): 1개 (2%) - 취향 동의
- instruction (지시): 1개 (2%) - 사용법 안내

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 영화/음악/게임 용어
- adjective (형용사): 12개 (24%) - 작품 특성
- verb (동사): 10개 (20%) - 감상/플레이 행동
- interjection (감탄사): 8개 (16%) - 감상 감탄
- other (기타): 4개 (8%) - 엔터테인먼트 표현
- adverb (부사): 2개 (4%) - 감상 방식

**상황 분포:**
- casual + social: 18개 (36%) - 편안한 사회적 상황
- casual + home: 15개 (30%) - 편안한 집
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + public: 5개 (10%) - 편안한 공공장소
- polite + home: 3개 (6%) - 정중한 집
- polite + public: 1개 (2%) - 정중한 공공장소

movies, music, games를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-39번 배치 (50개): entertainment-books+theater+art 테마 최대 다양성

```
엔터테인먼트(entertainment) 도메인의 books(책), theater(연극), art(예술) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- books (책): 18개 (36%) - 독서, 문학 감상
- theater (연극): 18개 (36%) - 연극 관람, 공연 예술
- art (예술): 14개 (28%) - 미술 감상, 예술 활동

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 예술 감상 이해
- advanced (고급): 15개 (30%) - 고급 예술 지식
- fluent (유창): 10개 (20%) - 유창한 예술 표현
- basic (기초): 5개 (10%) - 기본 예술 어휘
- technical (전문): 2개 (4%) - 전문 예술 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 작품 감상 의견
- emotion (감정): 10개 (20%) - 예술적 감동
- description (묘사): 8개 (16%) - 작품/공연 설명
- suggestion (제안): 6개 (12%) - 예술 활동 추천
- question (질문): 4개 (8%) - 예술 정보 질의
- gratitude (감사): 3개 (6%) - 예술 체험 감사
- request (요청): 3개 (6%) - 예술 정보 요청
- greeting (인사): 2개 (4%) - 예술 관련 인사
- agreement (동의): 1개 (2%) - 예술 견해 동의
- instruction (지시): 1개 (2%) - 예술 감상 안내

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 14개 (28%) - 예술적 특성
- noun (명사): 12개 (24%) - 책/연극/예술 용어
- verb (동사): 10개 (20%) - 감상/체험 행동
- interjection (감탄사): 6개 (12%) - 예술적 감탄
- other (기타): 4개 (8%) - 예술 표현
- adverb (부사): 2개 (4%) - 감상 방식
- interrogative (의문사): 2개 (4%) - 예술 질문

**상황 분포:**
- polite + public: 15개 (30%) - 정중한 공공장소
- casual + public: 12개 (24%) - 편안한 공공장소
- polite + social: 10개 (20%) - 정중한 사회적 상황
- casual + social: 8개 (16%) - 편안한 사회적 상황
- casual + home: 3개 (6%) - 편안한 집
- polite + home: 2개 (4%) - 정중한 집

books, theater, art를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-40번 배치 (50개): entertainment-comedy+drama+dance 테마 최대 다양성

```
엔터테인먼트(entertainment) 도메인의 comedy(코미디), drama(드라마), dance(춤) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- comedy (코미디): 18개 (36%) - 코미디 감상, 유머
- drama (드라마): 18개 (36%) - 드라마 시청, 연극 감상
- dance (춤): 14개 (28%) - 춤 추기, 댄스 문화

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 엔터테인먼트 감상 이해
- basic (기초): 15개 (30%) - 기본 엔터테인먼트 어휘
- advanced (고급): 10개 (20%) - 고급 예술 감상
- fluent (유창): 5개 (10%) - 유창한 감상 표현
- technical (전문): 2개 (4%) - 전문 공연 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 12개 (24%) - 감상 감정
- opinion (의견): 10개 (20%) - 작품 평가 의견
- suggestion (제안): 8개 (16%) - 엔터테인먼트 추천
- description (묘사): 6개 (12%) - 공연/작품 설명
- question (질문): 4개 (8%) - 엔터테인먼트 질의
- gratitude (감사): 3개 (6%) - 추천 감사
- request (요청): 3개 (6%) - 추천 요청
- greeting (인사): 2개 (4%) - 엔터테인먼트 인사
- agreement (동의): 1개 (2%) - 취향 동의
- instruction (지시): 1개 (2%) - 관람 안내

**품사 분포 (10개 모두 포함):**
- interjection (감탄사): 12개 (24%) - 감상 감탄
- adjective (형용사): 12개 (24%) - 작품 특성
- noun (명사): 10개 (20%) - 공연/작품 용어
- verb (동사): 8개 (16%) - 감상/활동 행동
- other (기타): 4개 (8%) - 엔터테인먼트 표현
- adverb (부사): 2개 (4%) - 감상 방식
- interrogative (의문사): 2개 (4%) - 엔터테인먼트 질문

**상황 분포:**
- casual + social: 20개 (40%) - 편안한 사회적 상황
- casual + home: 12개 (24%) - 편안한 집
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + public: 6개 (12%) - 편안한 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- polite + home: 1개 (2%) - 정중한 집

comedy, drama, dance를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-41번 배치 (50개): food-cooking+restaurants+ingredients 테마 최대 다양성

```
음식(food) 도메인의 cooking(요리), restaurants(음식점), ingredients(재료) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- cooking (요리): 18개 (36%) - 요리법, 조리 기술
- restaurants (음식점): 18개 (36%) - 음식점 이용, 외식
- ingredients (재료): 14개 (28%) - 식재료, 요리 재료

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 요리/외식 이해
- advanced (고급): 12개 (24%) - 고급 요리 기술
- basic (기초): 10개 (20%) - 기본 요리/식재료 어휘
- fluent (유창): 6개 (12%) - 유창한 요리 표현
- technical (전문): 2개 (4%) - 전문 요리 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 10개 (20%) - 요리법 지시
- request (요청): 8개 (16%) - 주문/재료 요청
- description (묘사): 7개 (14%) - 음식/요리 설명
- opinion (의견): 6개 (12%) - 음식 평가 의견
- question (질문): 5개 (10%) - 요리/메뉴 질의
- suggestion (제안): 4개 (8%) - 요리/메뉴 제안
- gratitude (감사): 3개 (6%) - 음식 서비스 감사
- emotion (감정): 3개 (6%) - 요리/음식 감정
- greeting (인사): 2개 (4%) - 음식점 인사
- agreement (동의): 1개 (2%) - 주문 동의
- apology (사과): 1개 (2%) - 주문 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 15개 (30%) - 요리/주문 행동
- noun (명사): 12개 (24%) - 음식/재료 용어
- adjective (형용사): 10개 (20%) - 맛/음식 특성
- other (기타): 6개 (12%) - 요리 표현
- adverb (부사): 4개 (8%) - 요리 방식
- interrogative (의문사): 2개 (4%) - 요리 질문
- preposition (전치사): 1개 (2%) - 요리 관계

**상황 분포:**
- casual + home: 15개 (30%) - 편안한 집
- polite + restaurant: 12개 (24%) - 정중한 음식점
- casual + restaurant: 10개 (20%) - 편안한 음식점
- polite + home: 8개 (16%) - 정중한 집
- casual + shopping: 3개 (6%) - 편안한 쇼핑
- polite + shopping: 2개 (4%) - 정중한 쇼핑

cooking, restaurants, ingredients를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-42번 배치 (50개): food-beverages+nutrition+other 테마 최대 다양성

```
음식(food) 도메인의 beverages(음료), nutrition(영양), other(기타) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- beverages (음료): 20개 (40%) - 음료수, 음료 문화
- nutrition (영양): 18개 (36%) - 영양학, 건강 식단
- other (기타): 12개 (24%) - 기타 음식 관련

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 영양/음료 이해
- advanced (고급): 12개 (24%) - 고급 영양학 지식
- basic (기초): 12개 (24%) - 기본 음료/영양 어휘
- fluent (유창): 5개 (10%) - 유창한 영양 표현
- technical (전문): 3개 (6%) - 전문 영양학 용어

**목적 분포 (12개 모두 포함):**
- suggestion (제안): 9개 (18%) - 영양/음료 제안
- description (묘사): 8개 (16%) - 영양/음료 설명
- opinion (의견): 7개 (14%) - 건강/맛 의견
- request (요청): 6개 (12%) - 음료 주문 요청
- instruction (지시): 5개 (10%) - 영양 관리 지시
- question (질문): 4개 (8%) - 영양 정보 질의
- emotion (감정): 4개 (8%) - 음료/건강 감정
- gratitude (감사): 3개 (6%) - 서비스 감사
- greeting (인사): 2개 (4%) - 음료 관련 인사
- agreement (동의): 1개 (2%) - 영양 동의
- apology (사과): 1개 (2%) - 주문 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 음료/영양 용어
- adjective (형용사): 12개 (24%) - 맛/건강 특성
- verb (동사): 10개 (20%) - 섭취/관리 행동
- other (기타): 6개 (12%) - 건강 표현
- adverb (부사): 4개 (8%) - 섭취 방식
- interrogative (의문사): 2개 (4%) - 영양 질문
- interjection (감탄사): 2개 (4%) - 맛 감탄

**상황 분포:**
- polite + home: 12개 (24%) - 정중한 집
- casual + home: 10개 (20%) - 편안한 집
- polite + restaurant: 8개 (16%) - 정중한 음식점
- casual + restaurant: 6개 (12%) - 편안한 음식점
- polite + work: 5개 (10%) - 정중한 업무
- casual + work: 4개 (8%) - 편안한 업무
- polite + medical: 3개 (6%) - 정중한 의료
- casual + social: 2개 (4%) - 편안한 사회적 상황

beverages, nutrition, other를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-43번 배치 (50개): other-hobbies+finance_personal+legal 테마 최대 다양성

```
기타(other) 도메인의 hobbies(취미), finance_personal(개인재정), legal(법률) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- hobbies (취미): 20개 (40%) - 개인 취미, 여가 활동
- finance_personal (개인재정): 18개 (36%) - 개인 금융, 재정 관리
- legal (법률): 12개 (24%) - 법률 상식, 법적 절차

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 일반 상식 이해
- advanced (고급): 12개 (24%) - 고급 전문 지식
- basic (기초): 10개 (20%) - 기본 생활 어휘
- technical (전문): 6개 (12%) - 전문 법률/금융 용어
- fluent (유창): 4개 (8%) - 유창한 전문 표현

**목적 분포 (12개 모두 포함):**
- question (질문): 9개 (18%) - 전문 정보 질의
- description (묘사): 8개 (16%) - 활동/절차 설명
- opinion (의견): 7개 (14%) - 개인 의견
- suggestion (제안): 6개 (12%) - 활동/관리 제안
- request (요청): 5개 (10%) - 도움/서비스 요청
- instruction (지시): 4개 (8%) - 방법 안내
- emotion (감정): 3개 (6%) - 활동 감정
- gratitude (감사): 3개 (6%) - 서비스 감사
- greeting (인사): 2개 (4%) - 전문 서비스 인사
- agreement (동의): 1개 (2%) - 계약/조건 동의
- apology (사과): 1개 (2%) - 서비스 사과
- refusal (거절): 1개 (2%) - 제안 거절

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 취미/금융/법률 용어
- verb (동사): 12개 (24%) - 활동/관리 행동
- adjective (형용사): 10개 (20%) - 상태/특성
- other (기타): 6개 (12%) - 전문 표현
- interrogative (의문사): 4개 (8%) - 전문 질문
- adverb (부사): 2개 (4%) - 활동 방식
- preposition (전치사): 2개 (4%) - 관계 표현

**상황 분포:**
- polite + work: 15개 (30%) - 정중한 업무
- casual + home: 12개 (24%) - 편안한 집
- polite + public: 8개 (16%) - 정중한 공공장소
- formal + work: 6개 (12%) - 공식적 업무
- polite + home: 5개 (10%) - 정중한 집
- casual + social: 3개 (6%) - 편안한 사회적 상황
- polite + social: 1개 (2%) - 정중한 사회적 상황

hobbies, finance_personal, legal을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-44번 배치 (50개): other-government+politics+media 테마 최대 다양성

```
기타(other) 도메인의 government(정부), politics(정치), media(미디어) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- government (정부): 18개 (36%) - 정부 기관, 행정 서비스
- politics (정치): 18개 (36%) - 정치 시스템, 정치 활동
- media (미디어): 14개 (28%) - 언론, 미디어 문화

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 정치/사회 지식
- technical (전문): 12개 (24%) - 전문 정치/행정 용어
- intermediate (중급): 10개 (20%) - 사회 시스템 이해
- fluent (유창): 7개 (14%) - 유창한 사회 표현
- basic (기초): 3개 (6%) - 기본 사회 어휘

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 정치/사회 의견
- description (묘사): 10개 (20%) - 시스템/절차 설명
- question (질문): 8개 (16%) - 정치/행정 질의
- instruction (지시): 6개 (12%) - 절차 안내
- request (요청): 4개 (8%) - 행정 서비스 요청
- suggestion (제안): 3개 (6%) - 정책 제안
- agreement (동의): 2개 (4%) - 정치 견해 동의
- gratitude (감사): 2개 (4%) - 행정 서비스 감사
- greeting (인사): 1개 (2%) - 공식적 인사
- emotion (감정): 1개 (2%) - 정치 감정
- apology (사과): 1개 (2%) - 행정 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 정치/행정/미디어 용어
- verb (동사): 12개 (24%) - 정치/행정 행동
- adjective (형용사): 10개 (20%) - 정치/사회 특성
- other (기타): 6개 (12%) - 정치 표현
- adverb (부사): 3개 (6%) - 정치 방식
- interrogative (의문사): 2개 (4%) - 정치 질문
- preposition (전치사): 1개 (2%) - 정치 관계

**상황 분포:**
- formal + work: 20개 (40%) - 공식적 업무
- formal + public: 15개 (30%) - 공식적 공공장소
- polite + work: 8개 (16%) - 정중한 업무
- polite + public: 5개 (10%) - 정중한 공공장소
- formal + social: 2개 (4%) - 공식적 사회적 상황

government, politics, media를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-45번 배치 (50개): nature-animals+plants+weather 테마 최대 다양성

```
자연(nature) 도메인의 animals(동물), plants(식물), weather(날씨) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- animals (동물): 18개 (36%) - 동물 생태, 동물 관찰
- plants (식물): 18개 (36%) - 식물 생태, 원예
- weather (날씨): 14개 (28%) - 기상 현상, 날씨 변화

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 자연 현상 이해
- basic (기초): 15개 (30%) - 기본 자연 어휘
- advanced (고급): 8개 (16%) - 고급 생태 지식
- fluent (유창): 5개 (10%) - 유창한 자연 표현
- technical (전문): 2개 (4%) - 전문 생물학 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 자연 현상 설명
- emotion (감정): 9개 (18%) - 자연 감상 감정
- opinion (의견): 7개 (14%) - 자연/환경 의견
- question (질문): 6개 (12%) - 자연 정보 질의
- suggestion (제안): 5개 (10%) - 자연 활동 제안
- instruction (지시): 3개 (6%) - 관찰 방법 안내
- gratitude (감사): 3개 (6%) - 자연 감사
- greeting (인사): 2개 (4%) - 자연 관련 인사
- request (요청): 1개 (2%) - 자연 정보 요청
- agreement (동의): 1개 (2%) - 환경 견해 동의
- apology (사과): 1개 (2%) - 환경 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 동물/식물/날씨 용어
- adjective (형용사): 12개 (24%) - 자연 특성
- verb (동사): 10개 (20%) - 자연 현상 동사
- interjection (감탄사): 6개 (12%) - 자연 감탄
- other (기타): 4개 (8%) - 자연 표현
- adverb (부사): 2개 (4%) - 자연 현상 방식

**상황 분포:**
- casual + public: 15개 (30%) - 편안한 공공장소
- polite + public: 12개 (24%) - 정중한 공공장소
- casual + social: 10개 (20%) - 편안한 사회적 상황
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + home: 3개 (6%) - 편안한 집
- polite + home: 2개 (4%) - 정중한 집

animals, plants, weather를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-46번 배치 (50개): sports-football+basketball+swimming 테마 최대 다양성

```
스포츠(sports) 도메인의 football(축구), basketball(농구), swimming(수영) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- football (축구): 18개 (36%) - 축구 경기, 축구 문화
- basketball (농구): 18개 (36%) - 농구 경기, 농구 활동
- swimming (수영): 14개 (28%) - 수영 활동, 수영 스포츠

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 스포츠 활동 이해
- basic (기초): 15개 (30%) - 기본 스포츠 어휘
- advanced (고급): 8개 (16%) - 고급 스포츠 지식
- fluent (유창): 5개 (10%) - 유창한 스포츠 표현
- technical (전문): 2개 (4%) - 전문 스포츠 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 10개 (20%) - 경기 관람 감정
- opinion (의견): 8개 (16%) - 경기/선수 의견
- description (묘사): 7개 (14%) - 경기/기술 설명
- suggestion (제안): 6개 (12%) - 스포츠 활동 제안
- question (질문): 5개 (10%) - 스포츠 정보 질의
- instruction (지시): 4개 (8%) - 스포츠 기술 지시
- gratitude (감사): 3개 (6%) - 스포츠 감사
- greeting (인사): 3개 (6%) - 스포츠 인사
- request (요청): 2개 (4%) - 스포츠 도움 요청
- agreement (동의): 1개 (2%) - 스포츠 견해 동의
- apology (사과): 1개 (2%) - 스포츠 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 스포츠 행동
- noun (명사): 12개 (24%) - 스포츠/경기 용어
- interjection (감탄사): 8개 (16%) - 경기 응원 감탄
- adjective (형용사): 8개 (16%) - 스포츠 특성
- other (기타): 4개 (8%) - 스포츠 표현
- adverb (부사): 2개 (4%) - 스포츠 방식
- interrogative (의문사): 2개 (4%) - 스포츠 질문

**상황 분포:**
- casual + social: 18개 (36%) - 편안한 사회적 상황
- casual + public: 12개 (24%) - 편안한 공공장소
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + home: 6개 (12%) - 편안한 집
- polite + public: 4개 (8%) - 정중한 공공장소
- polite + home: 2개 (4%) - 정중한 집

football, basketball, swimming을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-47번 배치 (50개): technology-it_hardware+cybersecurity+database 테마 최대 다양성

```
기술(technology) 도메인의 it_hardware(IT하드웨어), cybersecurity(사이버보안), database(데이터베이스) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- it_hardware (IT하드웨어): 18개 (36%) - 컴퓨터 하드웨어, IT 장비
- cybersecurity (사이버보안): 18개 (36%) - 정보보안, 사이버 위협
- database (데이터베이스): 14개 (28%) - 데이터베이스 관리, 데이터 저장

**난이도 분포 (5개 모두 포함):**
- technical (전문): 18개 (36%) - 고도의 기술 전문성
- advanced (고급): 15개 (30%) - 고급 IT 지식
- intermediate (중급): 10개 (20%) - IT 시스템 이해
- fluent (유창): 5개 (10%) - 유창한 기술 소통
- basic (기초): 2개 (4%) - 기본 IT 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 12개 (24%) - 기술 절차 안내
- description (묘사): 10개 (20%) - 시스템 설명
- question (질문): 8개 (16%) - 기술 질의
- opinion (의견): 6개 (12%) - 기술 평가 의견
- request (요청): 4개 (8%) - 기술 지원 요청
- suggestion (제안): 3개 (6%) - 기술 개선 제안
- agreement (동의): 2개 (4%) - 기술 방향 동의
- gratitude (감사): 2개 (4%) - 기술 지원 감사
- greeting (인사): 1개 (2%) - 기술 관련 인사
- emotion (감정): 1개 (2%) - 기술 문제 감정
- apology (사과): 1개 (2%) - 기술 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 18개 (36%) - IT 전문 용어
- verb (동사): 12개 (24%) - 기술 운영 행동
- adjective (형용사): 8개 (16%) - 시스템 특성
- other (기타): 6개 (12%) - 기술 전문 표현
- adverb (부사): 3개 (6%) - 기술 운영 방식
- interrogative (의문사): 2개 (4%) - 기술 질문
- preposition (전치사): 1개 (2%) - 기술 관계

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 6개 (12%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- casual + work: 1개 (2%) - 편안한 업무 환경

it_hardware, cybersecurity, database를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-48번 배치 (50개): technology-robotics+blockchain+cloud 테마 최대 다양성

```
기술(technology) 도메인의 robotics(로봇공학), blockchain(블록체인), cloud(클라우드) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- robotics (로봇공학): 18개 (36%) - 로봇 기술, 자동화
- blockchain (블록체인): 18개 (36%) - 블록체인 기술, 암호화폐
- cloud (클라우드): 14개 (28%) - 클라우드 서비스, 클라우드 컴퓨팅

**난이도 분포 (5개 모두 포함):**
- technical (전문): 20개 (40%) - 최첨단 기술 전문성
- advanced (고급): 15개 (30%) - 고급 신기술 지식
- fluent (유창): 8개 (16%) - 유창한 기술 토론
- intermediate (중급): 5개 (10%) - 신기술 기본 이해
- basic (기초): 2개 (4%) - 기본 신기술 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 신기술 설명
- opinion (의견): 10개 (20%) - 기술 발전 의견
- instruction (지시): 8개 (16%) - 기술 활용 안내
- question (질문): 6개 (12%) - 신기술 질의
- suggestion (제안): 4개 (8%) - 기술 도입 제안
- request (요청): 3개 (6%) - 기술 개발 요청
- agreement (동의): 2개 (4%) - 기술 방향 동의
- emotion (감정): 2개 (4%) - 기술 혁신 감정
- gratitude (감사): 1개 (2%) - 기술 개발 감사
- greeting (인사): 1개 (2%) - 기술 혁신 인사
- apology (사과): 1개 (2%) - 기술 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 신기술 용어
- verb (동사): 12개 (24%) - 기술 개발 행동
- adjective (형용사): 10개 (20%) - 혁신 기술 특성
- other (기타): 8개 (16%) - 첨단 기술 표현
- adverb (부사): 2개 (4%) - 기술 개발 방식
- interrogative (의문사): 2개 (4%) - 신기술 질문

**상황 분포:**
- formal + work: 22개 (44%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + public: 8개 (16%) - 공식적 공공장소
- polite + public: 5개 (10%) - 정중한 공공장소
- formal + online: 2개 (4%) - 공식적 온라인
- polite + online: 1개 (2%) - 정중한 온라인

robotics, blockchain, cloud를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-49번 배치 (50개): technology-social_media+gaming+innovation 테마 최대 다양성

```
기술(technology) 도메인의 social_media(소셜미디어), gaming(게임), innovation(혁신) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- social_media (소셜미디어): 18개 (36%) - SNS 플랫폼, 소셜 네트워킹
- gaming (게임): 18개 (36%) - 게임 개발, 게임 기술
- innovation (혁신): 14개 (28%) - 기술 혁신, 창조적 발명

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 디지털 문화 이해
- advanced (고급): 12개 (24%) - 고급 디지털 기술
- technical (전문): 10개 (20%) - 전문 개발 지식
- fluent (유창): 7개 (14%) - 유창한 디지털 소통
- basic (기초): 3개 (6%) - 기본 디지털 개념

**목적 분포 (12개 모두 포함):**
- opinion (의견): 10개 (20%) - 디지털 문화 의견
- emotion (감정): 8개 (16%) - 게임/혁신 감정
- description (묘사): 7개 (14%) - 플랫폼/게임 설명
- suggestion (제안): 6개 (12%) - 혁신 아이디어 제안
- question (질문): 5개 (10%) - 기술 동향 질의
- instruction (지시): 4개 (8%) - 플랫폼 사용 안내
- request (요청): 3개 (6%) - 기술 개발 요청
- gratitude (감사): 3가 (6%) - 혁신 감사
- greeting (인사): 2개 (4%) - 디지털 인사
- agreement (동의): 1개 (2%) - 혁신 방향 동의
- apology (사과): 1개 (2%) - 플랫폼 문제 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 디지털 활동 행동
- noun (명사): 12개 (24%) - 플랫폼/게임 용어
- adjective (형용사): 10개 (20%) - 혁신 특성
- interjection (감탄사): 6개 (12%) - 게임/혁신 감탄
- other (기타): 4개 (8%) - 디지털 표현
- adverb (부사): 2개 (4%) - 디지털 방식
- interrogative (의문사): 2개 (4%) - 기술 질문

**상황 분포:**
- casual + social: 15개 (30%) - 편안한 사회적 상황
- casual + home: 12개 (24%) - 편안한 집
- polite + work: 8개 (16%) - 정중한 업무 환경
- casual + work: 6개 (12%) - 편안한 업무 환경
- polite + social: 5개 (10%) - 정중한 사회적 상황
- casual + online: 3개 (6%) - 편안한 온라인
- polite + online: 1개 (2%) - 정중한 온라인

social_media, gaming, innovation을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-50번 배치 (50개): technology-communication+automation+research 테마 최대 다양성

```
기술(technology) 도메인의 communication(통신), automation(자동화), research(연구) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- communication (통신): 18개 (36%) - 통신 기술, 네트워킹
- automation (자동화): 18개 (36%) - 자동화 시스템, 스마트 기술
- research (연구): 14개 (28%) - 기술 연구, R&D

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 기술 연구
- technical (전문): 15개 (30%) - 전문 연구 지식
- intermediate (중급): 10개 (20%) - 기술 연구 이해
- fluent (유창): 5개 (10%) - 유창한 연구 소통
- basic (기초): 2개 (4%) - 기본 연구 개념

**목적 분포 (12개 모두 포함):**
- description (묘사): 12개 (24%) - 연구/기술 설명
- instruction (지시): 10개 (20%) - 연구 방법 안내
- opinion (의견): 8개 (16%) - 기술 발전 의견
- question (질문): 6개 (12%) - 연구 질의
- suggestion (제안): 4개 (8%) - 연구 방향 제안
- request (요청): 3개 (6%) - 연구 협력 요청
- agreement (동의): 2개 (4%) - 연구 방향 동의
- gratitude (감사): 2개 (4%) - 연구 지원 감사
- greeting (인사): 1개 (2%) - 연구 관련 인사
- emotion (감정): 1개 (2%) - 연구 성과 감정
- apology (사과): 1개 (2%) - 연구 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 통신/자동화/연구 용어
- verb (동사): 14개 (28%) - 연구/개발 행동
- adjective (형용사): 10개 (20%) - 기술 특성
- other (기타): 6개 (12%) - 연구 표현
- adverb (부사): 2개 (4%) - 연구 방식
- interrogative (의문사): 2개 (4%) - 연구 질문

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 6개 (12%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- formal + online: 1개 (2%) - 공식적 온라인

communication, automation, research를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-51번 배치 (50개): technology-other 테마 최대 다양성

```
기술(technology) 도메인의 other(기타 기술 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- other (기타): 50개 (100%) - 신기술, 융합기술, 미래기술 등

**난이도 분포 (5개 모두 포함):**
- technical (전문): 20개 (40%) - 최첨단 기술 전문성
- advanced (고급): 15개 (30%) - 고급 신기술 지식
- fluent (유창): 8개 (16%) - 유창한 기술 표현
- intermediate (중급): 5개 (10%) - 신기술 기본 이해
- basic (기초): 2개 (4%) - 기본 기술 개념

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 기술 발전 의견
- description (묘사): 10개 (20%) - 신기술 설명
- suggestion (제안): 8개 (16%) - 기술 혁신 제안
- instruction (지시): 6개 (12%) - 기술 활용 안내
- question (질문): 5개 (10%) - 미래 기술 질의
- request (요청): 3개 (6%) - 기술 개발 요청
- emotion (감정): 2개 (4%) - 기술 혁신 감정
- agreement (동의): 2개 (4%) - 기술 방향 동의
- gratitude (감사): 1개 (2%) - 기술 발전 감사
- greeting (인사): 1개 (2%) - 기술 관련 인사

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 신기술 용어
- verb (동사): 12개 (24%) - 기술 혁신 행동
- adjective (형용사): 10개 (20%) - 미래 기술 특성
- other (기타): 8개 (16%) - 혁신 기술 표현
- adverb (부사): 2개 (4%) - 기술 발전 방식
- interrogative (의문사): 2개 (4%) - 미래 기술 질문

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + public: 8개 (16%) - 공식적 공공장소
- polite + public: 4개 (8%) - 정중한 공공장소
- formal + online: 1개 (2%) - 공식적 온라인

other(기타 기술 관련)를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-52번 배치 (50개): business-startup+networking+office 테마 최대 다양성

```
비즈니스(business) 도메인의 startup(스타트업), networking(네트워킹), office(사무실) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- startup (스타트업): 18개 (36%) - 창업, 스타트업 경영
- networking (네트워킹): 18개 (36%) - 비즈니스 네트워킹, 인맥 관리
- office (사무실): 14개 (28%) - 사무실 문화, 업무 환경

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 창업 지식
- intermediate (중급): 15개 (30%) - 비즈니스 기본 이해
- technical (전문): 8개 (16%) - 전문 창업 용어
- fluent (유창): 6개 (12%) - 유창한 비즈니스 소통
- basic (기초): 3개 (6%) - 기본 비즈니스 개념

**목적 분포 (12개 모두 포함):**
- suggestion (제안): 10개 (20%) - 창업/네트워킹 제안
- opinion (의견): 9개 (18%) - 비즈니스 전략 의견
- description (묘사): 8개 (16%) - 스타트업/업무 설명
- instruction (지시): 6개 (12%) - 업무 프로세스 지시
- request (요청): 5개 (10%) - 비즈니스 지원 요청
- question (질문): 4개 (8%) - 창업 정보 질의
- greeting (인사): 3개 (6%) - 비즈니스 인사
- gratitude (감사): 2개 (4%) - 네트워킹 감사
- agreement (동의): 1개 (2%) - 비즈니스 동의
- emotion (감정): 1개 (2%) - 창업 감정
- apology (사과): 1개 (2%) - 비즈니스 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 창업/네트워킹 용어
- verb (동사): 12개 (24%) - 비즈니스 활동 행동
- adjective (형용사): 10개 (20%) - 비즈니스 특성
- other (기타): 8개 (16%) - 비즈니스 표현
- adverb (부사): 3개 (6%) - 비즈니스 방식
- interrogative (의문사): 2개 (4%) - 비즈니스 질문
- preposition (전치사): 1개 (2%) - 비즈니스 관계

**상황 분포:**
- polite + work: 20개 (40%) - 정중한 업무 환경
- formal + work: 15개 (30%) - 공식적 업무 환경
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + work: 4개 (8%) - 편안한 업무 환경
- formal + social: 2개 (4%) - 공식적 사회적 상황
- polite + public: 1개 (2%) - 정중한 공공장소

startup, networking, office를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-53번 배치 (50개): business-project+innovation+strategy 테마 최대 다양성

```
비즈니스(business) 도메인의 project(프로젝트), innovation(혁신), strategy(전략) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- project (프로젝트): 18개 (36%) - 프로젝트 관리, 프로젝트 실행
- innovation (혁신): 18개 (36%) - 비즈니스 혁신, 창조적 아이디어
- strategy (전략): 14개 (28%) - 경영 전략, 비즈니스 계획

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 20개 (40%) - 고급 경영 지식
- technical (전문): 12개 (24%) - 전문 경영 용어
- intermediate (중급): 10개 (20%) - 경영 기본 이해
- fluent (유창): 6개 (12%) - 유창한 경영 소통
- basic (기초): 2개 (4%) - 기본 경영 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 12개 (24%) - 프로젝트 관리 지시
- opinion (의견): 10개 (20%) - 전략/혁신 의견
- description (묘사): 8개 (16%) - 프로젝트/전략 설명
- suggestion (제안): 6개 (12%) - 혁신 아이디어 제안
- request (요청): 4개 (8%) - 프로젝트 지원 요청
- question (질문): 3개 (6%) - 전략 질의
- agreement (동의): 2개 (4%) - 전략 방향 동의
- gratitude (감사): 2개 (4%) - 프로젝트 협력 감사
- greeting (인사): 1개 (2%) - 프로젝트 인사
- emotion (감정): 1개 (2%) - 혁신 성과 감정
- apology (사과): 1개 (2%) - 프로젝트 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 프로젝트/전략 용어
- verb (동사): 14개 (28%) - 경영/혁신 행동
- adjective (형용사): 10개 (20%) - 전략적 특성
- other (기타): 6개 (12%) - 경영 표현
- adverb (부사): 2개 (4%) - 경영 방식
- interrogative (의문사): 2개 (4%) - 전략 질문

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 6개 (12%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- formal + social: 1개 (2%) - 공식적 사회적 상황

project, innovation, strategy를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-54번 배치 (50개): business-customer_service+quality+efficiency 테마 최대 다양성

```
비즈니스(business) 도메인의 customer_service(고객서비스), quality(품질), efficiency(효율성) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- customer_service (고객서비스): 20개 (40%) - 고객 관리, 서비스 품질
- quality (품질): 18개 (36%) - 품질 관리, 품질 향상
- efficiency (효율성): 12개 (24%) - 업무 효율, 생산성 향상

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 서비스 관리 이해
- advanced (고급): 15개 (30%) - 고급 품질 관리
- technical (전문): 8개 (16%) - 전문 관리 기법
- fluent (유창): 6개 (12%) - 유창한 서비스 소통
- basic (기초): 3개 (6%) - 기본 서비스 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 10개 (20%) - 서비스 프로세스 지시
- description (묘사): 9개 (18%) - 서비스/품질 설명
- suggestion (제안): 8개 (16%) - 개선 방안 제안
- request (요청): 6개 (12%) - 서비스 개선 요청
- opinion (의견): 5개 (10%) - 품질/효율성 의견
- gratitude (감사): 4개 (8%) - 고객 서비스 감사
- question (질문): 3개 (6%) - 서비스 질의
- greeting (인사): 2개 (4%) - 고객 서비스 인사
- agreement (동의): 1개 (2%) - 서비스 개선 동의
- emotion (감정): 1개 (2%) - 서비스 만족 감정
- apology (사과): 1개 (2%) - 서비스 문제 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 15개 (30%) - 서비스/관리 행동
- noun (명사): 12개 (24%) - 서비스/품질 용어
- adjective (형용사): 10개 (20%) - 품질/효율성 특성
- other (기타): 8개 (16%) - 서비스 표현
- adverb (부사): 3개 (6%) - 서비스 방식
- interrogative (의문사): 2개 (4%) - 서비스 질문

**상황 분포:**
- polite + work: 20개 (40%) - 정중한 업무 환경
- formal + work: 12개 (24%) - 공식적 업무 환경
- polite + public: 10개 (20%) - 정중한 공공장소
- formal + public: 5개 (10%) - 공식적 공공장소
- polite + social: 2개 (4%) - 정중한 사회적 상황
- casual + work: 1개 (2%) - 편안한 업무 환경

customer_service, quality, efficiency를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-55번 배치 (50개): business-supply_chain+logistics+operations 테마 최대 다양성

```
비즈니스(business) 도메인의 supply_chain(공급망), logistics(물류), operations(운영) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- supply_chain (공급망): 18개 (36%) - 공급망 관리, 조달
- logistics (물류): 18개 (36%) - 물류 시스템, 배송 관리
- operations (운영): 14개 (28%) - 운영 관리, 프로세스 최적화

**난이도 분포 (5개 모두 포함):**
- technical (전문): 18개 (36%) - 전문 운영 지식
- advanced (고급): 15개 (30%) - 고급 관리 기법
- intermediate (중급): 10개 (20%) - 운영 시스템 이해
- fluent (유창): 5개 (10%) - 유창한 운영 소통
- basic (기초): 2개 (4%) - 기본 운영 개념

**목적 분포 (12개 모두 포함):**
- instruction (지시): 12개 (24%) - 운영 프로세스 지시
- description (묘사): 10개 (20%) - 시스템/프로세스 설명
- suggestion (제안): 8개 (16%) - 효율성 개선 제안
- opinion (의견): 6개 (12%) - 운영 방식 의견
- request (요청): 4개 (8%) - 운영 지원 요청
- question (질문): 3개 (6%) - 운영 절차 질의
- agreement (동의): 2개 (4%) - 운영 방식 동의
- gratitude (감사): 2개 (4%) - 운영 지원 감사
- greeting (인사): 1개 (2%) - 운영 관련 인사
- emotion (감정): 1개 (2%) - 운영 성과 감정
- apology (사과): 1개 (2%) - 운영 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 공급망/물류 용어
- verb (동사): 14개 (28%) - 운영/관리 행동
- adjective (형용사): 12개 (24%) - 운영 효율성 특성
- other (기타): 6개 (12%) - 운영 전문 표현
- adverb (부사): 2개 (4%) - 운영 방식

**상황 분포:**
- formal + work: 30개 (60%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 3개 (6%) - 공식적 공공장소
- polite + public: 2개 (4%) - 정중한 공공장소

supply_chain, logistics, operations를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-56번 배치 (50개): business-other 테마 최대 다양성

```
비즈니스(business) 도메인의 other(기타 비즈니스 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- other (기타): 50개 (100%) - 기타 비즈니스 활동, 산업별 특화 비즈니스

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 비즈니스 전략
- technical (전문): 15개 (30%) - 전문 산업 지식
- intermediate (중급): 10개 (20%) - 비즈니스 환경 이해
- fluent (유창): 5개 (10%) - 유창한 비즈니스 소통
- basic (기초): 2개 (4%) - 기본 비즈니스 개념

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 비즈니스 트렌드 의견
- description (묘사): 10개 (20%) - 비즈니스 모델 설명
- suggestion (제안): 8개 (16%) - 비즈니스 개선 제안
- instruction (지시): 6개 (12%) - 비즈니스 프로세스 지시
- request (요청): 4개 (8%) - 비즈니스 협력 요청
- question (질문): 3개 (6%) - 산업 동향 질의
- agreement (동의): 2개 (4%) - 비즈니스 방향 동의
- gratitude (감사): 2개 (4%) - 비즈니스 협력 감사
- greeting (인사): 1개 (2%) - 비즈니스 관련 인사
- emotion (감정): 1개 (2%) - 비즈니스 성과 감정
- apology (사과): 1개 (2%) - 비즈니스 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 비즈니스 전문 용어
- verb (동사): 12개 (24%) - 비즈니스 활동 행동
- adjective (형용사): 10개 (20%) - 비즈니스 특성
- other (기타): 8개 (16%) - 비즈니스 전문 표현
- adverb (부사): 2개 (4%) - 비즈니스 방식
- interrogative (의문사): 2개 (4%) - 비즈니스 질문

**상황 분포:**
- formal + work: 25개 (50%) - 공식적 업무 환경
- polite + work: 15개 (30%) - 정중한 업무 환경
- formal + public: 6개 (12%) - 공식적 공공장소
- polite + public: 3개 (6%) - 정중한 공공장소
- formal + social: 1개 (2%) - 공식적 사회적 상황

other(기타 비즈니스 관련)를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-57번 배치 (50개): education-other 테마 최대 다양성

```
교육(education) 도메인의 other(기타 교육 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- other (기타): 50개 (100%) - 평생교육, 직업교육, 교육정책, 교육철학 등

**난이도 분포 (5개 모두 포함):**
- advanced (고급): 18개 (36%) - 고급 교육학 이론
- technical (전문): 15개 (30%) - 전문 교육학 용어
- intermediate (중급): 10개 (20%) - 교육 시스템 이해
- fluent (유창): 5개 (10%) - 유창한 교육학 표현
- basic (기초): 2개 (4%) - 기본 교육 개념

**목적 분포 (12개 모두 포함):**
- opinion (의견): 12개 (24%) - 교육 정책/철학 의견
- description (묘사): 10개 (20%) - 교육 시스템 설명
- suggestion (제안): 8개 (16%) - 교육 개혁 제안
- instruction (지시): 6개 (12%) - 교육 방법 안내
- question (질문): 4개 (8%) - 교육 정책 질의
- request (요청): 3개 (6%) - 교육 지원 요청
- agreement (동의): 2개 (4%) - 교육 방향 동의
- gratitude (감사): 2개 (4%) - 교육 기회 감사
- greeting (인사): 1개 (2%) - 교육 관련 인사
- emotion (감정): 1개 (2%) - 교육 성과 감정
- apology (사과): 1개 (2%) - 교육 문제 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 교육학 전문 용어
- verb (동사): 12개 (24%) - 교육 활동 행동
- adjective (형용사): 10개 (20%) - 교육적 특성
- other (기타): 8개 (16%) - 교육학 이론 표현
- adverb (부사): 2개 (4%) - 교육 방식
- interrogative (의문사): 2개 (4%) - 교육학 질문

**상황 분포:**
- formal + work: 20개 (40%) - 공식적 업무 환경
- polite + work: 12개 (24%) - 정중한 업무 환경
- formal + school: 8개 (16%) - 공식적 학교
- polite + school: 6개 (12%) - 정중한 학교
- formal + public: 3개 (6%) - 공식적 공공장소
- polite + public: 1개 (2%) - 정중한 공공장소

other(기타 교육 관련)를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-58번 배치 (50개): daily-morning+evening+weekend 테마 최대 다양성

```
일상생활(daily) 도메인의 morning(아침), evening(저녁), weekend(주말) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- morning (아침): 18개 (36%) - 아침 일과, 아침 루틴
- evening (저녁): 18개 (36%) - 저녁 활동, 하루 마무리
- weekend (주말): 14개 (28%) - 주말 활동, 휴일 계획

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 일상 생활 패턴 이해
- basic (기초): 15개 (30%) - 기본 시간대별 어휘
- advanced (고급): 8개 (16%) - 복잡한 생활 패턴
- fluent (유창): 5개 (10%) - 유창한 일상 표현
- technical (전문): 2개 (4%) - 전문 시간 관리 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 시간대별 활동 설명
- emotion (감정): 8개 (16%) - 시간대별 감정
- suggestion (제안): 7개 (14%) - 시간 활용 제안
- opinion (의견): 6개 (12%) - 생활 패턴 의견
- question (질문): 5개 (10%) - 시간 관련 질의
- greeting (인사): 4개 (8%) - 시간대별 인사
- instruction (지시): 3개 (6%) - 시간 관리 지시
- request (요청): 3가 (6%) - 시간 관련 요청
- gratitude (감사): 2개 (4%) - 시간 감사
- agreement (동의): 1개 (2%) - 시간 계획 동의
- apology (사과): 1개 (2%) - 시간 관련 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 시간대별 활동 행동
- noun (명사): 12개 (24%) - 시간/활동 용어
- adjective (형용사): 10개 (20%) - 시간대별 특성
- adverb (부사): 6개 (12%) - 시간 표현 부사
- other (기타): 4개 (8%) - 시간 관련 표현
- interjection (감탄사): 2개 (4%) - 시간대별 감탄
- interrogative (의문사): 2개 (4%) - 시간 질문

**상황 분포:**
- casual + home: 20개 (40%) - 편안한 집
- polite + home: 12개 (24%) - 정중한 집
- casual + social: 8개 (16%) - 편안한 사회적 상황
- polite + social: 6개 (12%) - 정중한 사회적 상황
- casual + public: 3개 (6%) - 편안한 공공장소
- polite + public: 1개 (2%) - 정중한 공공장소

morning, evening, weekend를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-59번 배치 (50개): daily-work+personal+social 테마 최대 다양성

```
일상생활(daily) 도메인의 work(업무), personal(개인), social(사회) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- work (업무): 18개 (36%) - 일상적 업무, 직장 생활
- personal (개인): 18개 (36%) - 개인적 시간, 자기 관리
- social (사회): 14개 (28%) - 사회적 관계, 대인 관계

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 삶의 균형 이해
- advanced (고급): 12개 (24%) - 복잡한 라이프스타일
- basic (기초): 10개 (20%) - 기본 생활 어휘
- fluent (유창): 7개 (14%) - 유창한 생활 표현
- technical (전문): 3개 (6%) - 전문 라이프 코칭 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 10개 (20%) - 생활 균형 의견
- description (묘사): 8개 (16%) - 생활 패턴 설명
- suggestion (제안): 7개 (14%) - 라이프스타일 제안
- emotion (감정): 6개 (12%) - 생활 관련 감정
- question (질문): 5개 (10%) - 생활 방식 질의
- instruction (지시): 4개 (8%) - 생활 관리 지시
- request (요청): 3개 (6%) - 생활 도움 요청
- gratitude (감사): 3개 (6%) - 생활 지원 감사
- greeting (인사): 2개 (4%) - 일상적 인사
- agreement (동의): 1개 (2%) - 생활 방식 동의
- apology (사과): 1개 (2%) - 생활 관련 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 14개 (28%) - 생활 관리 행동
- adjective (형용사): 12개 (24%) - 생활 질 특성
- noun (명사): 10개 (20%) - 생활/관계 용어
- other (기타): 6개 (12%) - 라이프스타일 표현
- adverb (부사): 4개 (8%) - 생활 방식
- interrogative (의문사): 2개 (4%) - 생활 질문
- interjection (감탄사): 2개 (4%) - 생활 감탄

**상황 분포:**
- casual + home: 15개 (30%) - 편안한 집
- polite + work: 12개 (24%) - 정중한 업무 환경
- casual + social: 10개 (20%) - 편안한 사회적 상황
- polite + social: 8개 (16%) - 정중한 사회적 상황
- casual + work: 3개 (6%) - 편안한 업무 환경
- polite + home: 2개 (4%) - 정중한 집

work, personal, social을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-60번 배치 (50개): travel-other 테마 최대 다양성

```
여행(travel) 도메인의 other(기타 여행 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- other (기타): 50개 (100%) - 특수 여행, 테마 여행, 여행 팁 등

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 여행 경험 이해
- advanced (고급): 12개 (24%) - 고급 여행 전략
- basic (기초): 10개 (20%) - 기본 여행 어휘
- fluent (유창): 6개 (12%) - 유창한 여행 표현
- technical (전문): 2개 (4%) - 전문 여행업 용어

**목적 분포 (12개 모두 포함):**
- suggestion (제안): 10개 (20%) - 여행 팁 제안
- description (묘사): 8개 (16%) - 여행 경험 설명
- opinion (의견): 7개 (14%) - 여행 방식 의견
- emotion (감정): 6개 (12%) - 여행 감정
- question (질문): 5개 (10%) - 여행 정보 질의
- request (요청): 4개 (8%) - 여행 도움 요청
- gratitude (감사): 4개 (8%) - 여행 경험 감사
- instruction (지시): 3개 (6%) - 여행 방법 안내
- greeting (인사): 2개 (4%) - 여행 관련 인사
- agreement (동의): 1개 (2%) - 여행 계획 동의

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 여행 관련 용어
- adjective (형용사): 12개 (24%) - 여행 경험 특성
- verb (동사): 10개 (20%) - 여행 활동 행동
- other (기타): 6개 (12%) - 여행 표현
- interjection (감탄사): 4개 (8%) - 여행 감탄
- adverb (부사): 2개 (4%) - 여행 방식
- interrogative (의문사): 2개 (4%) - 여행 질문

**상황 분포:**
- casual + travel: 18개 (36%) - 편안한 여행
- polite + travel: 12개 (24%) - 정중한 여행
- casual + social: 8개 (16%) - 편안한 사회적 상황
- polite + social: 6개 (12%) - 정중한 사회적 상황
- casual + public: 4개 (8%) - 편안한 공공장소
- polite + public: 2개 (4%) - 정중한 공공장소

other(기타 여행 관련)를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

---

## 📊 2단계 완료 요약

### ✅ 2단계 통계 (총 60배치 완료)
- **총 배치수**: 60개 배치 (목표 달성) ✅
- **총 데이터**: 3,000개 (60배치 × 50개) ✅
- **카테고리 커버리지**: 180/180개 카테고리 (100% 완전 분배) ✅

### 📈 2단계 도메인별 배치 분포 (최종)
- **technology (기술)**: 11배치 (18%) ✅ - 기술 혁신 중심
- **business (비즈니스)**: 10배치 (17%) ✅ - 전문 비즈니스 완성
- **education (교육)**: 8배치 (13%) ✅ - 교육 전문 완성
- **daily (일상생활)**: 7배치 (12%) ✅ - 실용 일상 완성
- **travel (여행)**: 6배치 (10%) ✅ - 실용 여행 완성
- **health (건강)**: 5배치 (8%) ✅ - 건강 관리 완성
- **culture (문화)**: 4배치 (7%) ✅ - 문화 이해 완성
- **entertainment (엔터테인먼트)**: 3배치 (5%) ✅ - 동기 향상 완성
- **food (음식)**: 2배치 (3%) ✅ - 고급 음식 완성
- **other (기타)**: 2배치 (3%) ✅ - 포괄성 강화 완성
- **nature (자연)**: 1배치 (2%) ✅ - 자연 환경 완성
- **sports (스포츠)**: 1배치 (2%) ✅ - 스포츠 활동 완성

### 🎯 2단계 주요 특징 달성
- ✅ **난이도**: intermediate(50%) + advanced(30%) 중심으로 실용성 강화
- ✅ **목적**: description(20%) + opinion(18%) + question(15%) 중심으로 소통 능력 향상  
- ✅ **품사**: verb(30%) + noun(25%) + adjective(20%) 중심으로 표현력 확장
- ✅ **상황**: polite+work(30%) + formal+work(25%) 중심으로 전문성 강화
- ✅ **모든 180개 카테고리 균등 분배**: 실용성과 전문성의 완벽한 균형

### 🌟 2단계 성과
1. **전문성 강화**: technology와 business 도메인 집중으로 현대 사회 필수 역량 구축
2. **실용성 확대**: 모든 도메인의 균등 분배로 포괄적 언어 능력 개발
3. **소통 능력 향상**: 정중하고 전문적인 상황 중심으로 사회적 언어 능력 강화
4. **체계적 진행**: 1단계 기초 → 2단계 실용 확장의 자연스러운 학습 곡선 완성

**🎯 다음 단계**: 3단계(고급-유창 중심, 60배치)로 심화 완성 단계 진행 준비 완료! (4%) - 학술 방식
- preposition (전치사): 1개 (2%) - 학술 관계

**상황 분포:**
- polite + school: 15개 (30%) - 정중한 학교
- formal + school: 12개 (24%) - 공식적 학교
- polite + work: 8개 (16%) - 정중한 업무 환경
- casual + school: 6개 (12%) - 편안한 학교
- polite + public: 5개 (10%) - 정중한 공공장소
- formal + public: 3개 (6%) - 공식적 공공장소
- polite + social: 1개 (2%) - 정중한 사회적 상황

university, academic, scholarship을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-14번 배치 (50개): education-teaching+learning+classroom 테마 최대 다양성

```
교육(education) 도메인의 teaching(교육), learning(학습), classroom(교실) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- teaching (교육): 18개 (36%) - 교수법, 교육 방법
- learning (학습): 18개 (36%) - 학습 전략, 학습 과정
- classroom (교실): 14개 (28%) - 교실 환경, 수업 진행

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 교육 현장 이해
- advanced (고급): 12개 (24%) - 고급 교육 기법
- basic (기초): 10개 (20%) - 기본 교육 개념
- fluent (유창): 5개 (10%) - 유창한 교육 소통
- technical (전문): 3개 (6%) - 전문 교육학 용어

**목적 분포 (12개 모두 포함):**
- instruction (지시): 12개 (24%) - 교육/학습 지시
- description (묘사): 10개 (20%) - 교육 과정 설명
- suggestion (제안): 8개 (16%) - 교육 방법 제안
- question (질문): 6개 (12%) - 교육 질의
- opinion (의견): 4개 (8%) - 교육 방법 의견
- request (요청): 3개 (6%) - 교육 지원 요청
- gratitude (감사): 2개 (4%) - 교육 감사
- greeting (인사): 2개 (4%) - 교육 인사
- emotion (감정): 1개 (2%) - 교육 감정
- agreement (동의): 1개 (2%) - 교육 동의
- apology (사과): 1개 (2%) - 교육 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 16개 (32%) - 교육/학습 행동
- noun (명사): 12개 (24%) - 교육 용어
- adjective (형용사): 10개 (20%) - 교육 특성
- other (기타): 5개 (10%) - 교육 표현
- adverb (부사): 4개 (8%) - 교육 방식
- interrogative (의문사): 2개 (4%) - 교육 질문
- preposition (전치사): 1개 (2%) - 교육 관계

**상황 분포:**
- polite + school: 20개 (40%) - 정중한 학교
- casual + school: 12개 (24%) - 편안한 학교
- formal + school: 8개 (16%) - 공식적 학교
- polite + work: 5개 (10%) - 정중한 업무 환경
- polite + home: 3개 (6%) - 정중한 집
- casual + home: 2개 (4%) - 편안한 집

teaching, learning, classroom을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-15번 배치 (50개): education-students+subjects+textbooks 테마 최대 다양성

```
교육(education) 도메인의 students(학생), subjects(과목), textbooks(교재) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- students (학생): 18개 (36%) - 학생 생활, 학생 활동
- subjects (과목): 18개 (36%) - 교과목, 학습 분야
- textbooks (교재): 14개 (28%) - 교재 선택, 학습 자료

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 학교 생활 이해
- basic (기초): 15개 (30%) - 기본 학습 개념
- advanced (고급): 10개 (20%) - 고급 학습 전략
- fluent (유창): 5개 (10%) - 유창한 학습 소통
- technical (전문): 2개 (4%) - 전문 교재 지식

**목적 분포 (12개 모두 포함):**
- question (질문): 10개 (20%) - 학습 질의
- description (묘사): 9개 (18%) - 과목/교재 설명
- request (요청): 8개 (16%) - 학습 도움 요청
- opinion (의견): 6개 (12%) - 과목/교재 의견
- instruction (지시): 5개 (10%) - 학습 지시
- suggestion (제안): 4개 (8%) - 학습 방법 제안
- emotion (감정): 3개 (6%) - 학습 감정
- greeting (인사): 2개 (4%) - 학교 인사
- gratitude (감사): 1개 (2%) - 학습 감사
- agreement (동의): 1개 (2%) - 학습 동의
- apology (사과): 1개 (2%) - 학습 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 과목/교재 명칭
- verb (동사): 12개 (24%) - 학습 행동
- adjective (형용사): 10개 (20%) - 학습 특성
- interrogative (의문사): 5개 (10%) - 학습 질문
- other (기타): 4개 (8%) - 학습 표현
- adverb (부사): 2개 (4%) - 학습 방식
- preposition (전치사): 1개 (2%) - 학습 관계

**상황 분포:**
- casual + school: 18개 (36%) - 편안한 학교
- polite + school: 15개 (30%) - 정중한 학교
- casual + home: 8개 (16%) - 편안한 집
- polite + home: 5개 (10%) - 정중한 집
- casual + social: 3개 (6%) - 편안한 사회적 상황
- polite + social: 1개 (2%) - 정중한 사회적 상황

students, subjects, textbooks를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-16번 배치 (50개): education-exams+grades+homework 테마 최대 다양성

```
교육(education) 도메인의 exams(시험), grades(성적), homework(숙제) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- exams (시험): 18개 (36%) - 시험 준비, 시험 응시
- grades (성적): 18개 (36%) - 성적 관리, 성적 평가
- homework (숙제): 14개 (28%) - 과제 수행, 숙제 관리

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 학습 평가 이해
- basic (기초): 15개 (30%) - 기본 평가 개념
- advanced (고급): 8개 (16%) - 고급 학습 전략
- fluent (유창): 5개 (10%) - 유창한 학습 표현
- technical (전문): 2개 (4%) - 전문 평가 지식

**목적 분포 (12개 모두 포함):**
- emotion (감정): 10개 (20%) - 시험/성적 감정
- question (질문): 9개 (18%) - 평가 질의
- description (묘사): 8개 (16%) - 평가 과정 설명
- request (요청): 6개 (12%) - 학습 도움 요청
- opinion (의견): 5개 (10%) - 평가 시스템 의견
- instruction (지시): 4개 (8%) - 시험 준비 지시
- suggestion (제안): 3개 (6%) - 학습 방법 제안
- gratitude (감사): 2개 (4%) - 학습 감사
- apology (사과): 1개 (2%) - 성적 사과
- greeting (인사): 1개 (2%) - 시험 인사
- agreement (동의): 1개 (2%) - 평가 동의

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 시험/성적 용어
- adjective (형용사): 12개 (24%) - 성적 특성
- verb (동사): 10개 (20%) - 시험/학습 행동
- interjection (감탄사): 6개 (12%) - 시험 감탄
- other (기타): 4개 (8%) - 평가 표현
- interrogative (의문사): 2개 (4%) - 시험 질문
- adverb (부사): 2개 (4%) - 학습 방식

**상황 분포:**
- casual + school: 20개 (40%) - 편안한 학교
- polite + school: 12개 (24%) - 정중한 학교
- casual + home: 10개 (20%) - 편안한 집
- polite + home: 5개 (10%) - 정중한 집
- casual + social: 2개 (4%) - 편안한 사회적 상황
- polite + social: 1개 (2%) - 정중한 사회적 상황

exams, grades, homework를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-17번 배치 (50개): education-library+college+school 테마 최대 다양성

```
교육(education) 도메인의 library(도서관), college(대학), school(학교) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- library (도서관): 18개 (36%) - 도서관 이용, 자료 검색
- college (대학): 18개 (36%) - 대학 생활, 대학 시스템
- school (학교): 14개 (28%) - 학교 생활, 교육 기관

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 교육 기관 이해
- basic (기초): 16개 (32%) - 기본 학교 생활
- advanced (고급): 8개 (16%) - 고급 교육 시스템
- fluent (유창): 5개 (10%) - 유창한 교육 소통
- technical (전문): 3개 (6%) - 전문 교육 지식

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 교육 기관 설명
- request (요청): 9개 (18%) - 교육 서비스 요청
- question (질문): 8개 (16%) - 교육 질의
- opinion (의견): 6개 (12%) - 교육 시스템 의견
- instruction (지시): 5개 (10%) - 이용 방법 안내
- greeting (인사): 4개 (8%) - 교육 기관 인사
- suggestion (제안): 3개 (6%) - 학습 방법 제안
- gratitude (감사): 2개 (4%) - 교육 서비스 감사
- emotion (감정): 1개 (2%) - 교육 감정
- agreement (동의): 1개 (2%) - 교육 동의
- apology (사과): 1개 (2%) - 교육 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 16개 (32%) - 교육 기관 용어
- verb (동사): 12개 (24%) - 교육 활동 행동
- adjective (형용사): 8개 (16%) - 교육 특성
- interrogative (의문사): 6개 (12%) - 교육 질문
- other (기타): 4개 (8%) - 교육 표현
- adverb (부사): 2개 (4%) - 교육 방식
- preposition (전치사): 2개 (4%) - 교육 관계

**상황 분포:**
- polite + school: 20개 (40%) - 정중한 학교
- casual + school: 12개 (24%) - 편안한 학교
- polite + library: 8개 (16%) - 정중한 도서관
- casual + library: 5개 (10%) - 편안한 도서관
- polite + public: 3개 (6%) - 정중한 공공장소
- casual + public: 2개 (4%) - 편안한 공공장소

library, college, school을 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-18번 배치 (50개): education-other 테마 최대 다양성

```
교육(education) 도메인의 other(기타 교육 관련) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- other (기타): 50개 (100%) - 평생교육, 직업교육, 온라인교육, 교육정책, 교육기술 등

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 교육 현황 이해
- advanced (고급): 15개 (30%) - 고급 교육 지식
- basic (기초): 8개 (16%) - 기본 교육 개념
- fluent (유창): 6개 (12%) - 유창한 교육 토론
- technical (전문): 3개 (6%) - 전문 교육 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 10개 (20%) - 교육 정책 의견
- description (묘사): 9개 (18%) - 교육 시스템 설명
- question (질문): 8개 (16%) - 교육 질의
- suggestion (제안): 6개 (12%) - 교육 개선 제안
- instruction (지시): 5개 (10%) - 교육 방법 안내
- request (요청): 4개 (8%) - 교육 지원 요청
- emotion (감정): 3개 (6%) - 교육 감정
- greeting (인사): 2개 (4%) - 교육 인사
- gratitude (감사): 1개 (2%) - 교육 감사
- agreement (동의): 1개 (2%) - 교육 동의
- apology (사과): 1개 (2%) - 교육 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 교육 용어
- verb (동사): 12개 (24%) - 교육 행동
- adjective (형용사): 10개 (20%) - 교육 특성
- other (기타): 6개 (12%) - 교육 표현
- adverb (부사): 4개 (8%) - 교육 방식
- interrogative (의문사): 2개 (4%) - 교육 질문
- preposition (전치사): 2개 (4%) - 교육 관계

**상황 분포:**
- polite + work: 15개 (30%) - 정중한 업무 환경
- polite + school: 12개 (24%) - 정중한 학교
- formal + work: 8개 (16%) - 공식적 업무 환경
- polite + public: 6개 (12%) - 정중한 공공장소
- casual + work: 4개 (8%) - 편안한 업무 환경
- polite + home: 3개 (6%) - 정중한 집
- casual + home: 2개 (4%) - 편안한 집

other(기타 교육 관련)를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-19번 배치 (50개): daily-routine+family+household 테마 최대 다양성

```
일상생활(daily) 도메인의 routine(일과), family(가족), household(가사) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- routine (일과): 18개 (36%) - 일상 루틴, 하루 일과
- family (가족): 18개 (36%) - 가족 관계, 가족 활동
- household (가사): 14개 (28%) - 집안일, 가사 업무

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 일상 생활 표현
- basic (기초): 15개 (30%) - 기본 일상 어휘
- advanced (고급): 8개 (16%) - 복잡한 일상 표현
- fluent (유창): 5개 (10%) - 유창한 일상 소통
- technical (전문): 2개 (4%) - 전문 가사 용어

**목적 분포 (12개 모두 포함):**
- description (묘사): 10개 (20%) - 일상 활동 설명
- emotion (감정): 8개 (16%) - 가족/일상 감정
- instruction (지시): 7개 (14%) - 가사 지시
- request (요청): 6개 (12%) - 가사 도움 요청
- opinion (의견): 5개 (10%) - 일상 생활 의견
- question (질문): 4개 (8%) - 일상 질의
- suggestion (제안): 3개 (6%) - 일상 개선 제안
- greeting (인사): 3개 (6%) - 가족 인사
- gratitude (감사): 2개 (4%) - 가사 감사
- agreement (동의): 1개 (2%) - 일상 동의
- apology (사과): 1개 (2%) - 가사 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 15개 (30%) - 일상/가사 행동
- noun (명사): 12개 (24%) - 일상/가족 용어
- adjective (형용사): 10개 (20%) - 일상 특성
- other (기타): 6개 (12%) - 일상 표현
- adverb (부사): 4개 (8%) - 일상 방식
- interjection (감탄사): 2개 (4%) - 가족 감탄
- preposition (전치사): 1개 (2%) - 일상 관계

**상황 분포:**
- casual + home: 25개 (50%) - 편안한 집
- polite + home: 15개 (30%) - 정중한 집
- casual + social: 6개 (12%) - 편안한 사회적 상황
- polite + social: 3개 (6%) - 정중한 사회적 상황
- casual + public: 1개 (2%) - 편안한 공공장소

routine, family, household를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-20번 배치 (50개): daily-shopping+clothing+leisure 테마 최대 다양성

```
일상생활(daily) 도메인의 shopping(쇼핑), clothing(의복), leisure(여가) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- shopping (쇼핑): 18개 (36%) - 쇼핑 활동, 구매
- clothing (의복): 18개 (36%) - 의류, 패션
- leisure (여가): 14개 (28%) - 여가 활동, 취미

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 쇼핑/패션 이해
- basic (기초): 15개 (30%) - 기본 쇼핑 어휘
- advanced (고급): 10개 (20%) - 고급 패션 표현
- fluent (유창): 5개 (10%) - 유창한 쇼핑 소통
- technical (전문): 2개 (4%) - 전문 패션 용어

**목적 분포 (12개 모두 포함):**
- opinion (의견): 9개 (18%) - 패션/쇼핑 의견
- request (요청): 8개 (16%) - 쇼핑 도움 요청
- description (묘사): 7개 (14%) - 상품 설명
- emotion (감정): 6개 (12%) - 쇼핑 감정
- question (질문): 5개 (10%) - 쇼핑 질의
- suggestion (제안): 4개 (8%) - 패션 제안
- gratitude (감사): 4개 (8%) - 쇼핑 감사
- greeting (인사): 3개 (6%) - 쇼핑 인사
- instruction (지시): 2개 (4%) - 쇼핑 안내
- agreement (동의): 1개 (2%) - 쇼핑 동의
- apology (사과): 1개 (2%) - 쇼핑 사과

**품사 분포 (10개 모두 포함):**
- noun (명사): 14개 (28%) - 의복/상품 명칭
- adjective (형용사): 12개 (24%) - 패션 특성
- verb (동사): 10개 (20%) - 쇼핑 행동
- other (기타): 6개 (12%) - 쇼핑 표현
- interjection (감탄사): 4개 (8%) - 쇼핑 감탄
- interrogative (의문사): 2개 (4%) - 쇼핑 질문
- adverb (부사): 2개 (4%) - 쇼핑 방식

**상황 분포:**
- casual + shopping: 15개 (30%) - 편안한 쇼핑
- polite + shopping: 12개 (24%) - 정중한 쇼핑
- casual + social: 8개 (16%) - 편안한 사회적 상황
- polite + social: 6개 (12%) - 정중한 사회적 상황
- casual + home: 5개 (10%) - 편안한 집
- polite + home: 3개 (6%) - 정중한 집
- casual + public: 1개 (2%) - 편안한 공공장소

shopping, clothing, leisure를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-21번 배치 (50개): daily-communication+transportation+personal_care 테마 최대 다양성

```
일상생활(daily) 도메인의 communication(소통), transportation(교통), personal_care(개인관리) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- communication (소통): 18개 (36%) - 일상 의사소통, 대화
- transportation (교통): 18개 (36%) - 교통수단, 이동
- personal_care (개인관리): 14개 (28%) - 개인 위생, 건강 관리

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 20개 (40%) - 일상 소통 이해
- basic (기초): 12개 (24%) - 기본 교통/관리 어휘
- advanced (고급): 10개 (20%) - 복잡한 소통 표현
- fluent (유창): 6개 (12%) - 유창한 일상 소통
- technical (전문): 2개 (4%) - 전문 관리 용어

**목적 분포 (12개 모두 포함):**
- request (요청): 9개 (18%) - 교통/도움 요청
- description (묘사): 8개 (16%) - 소통/교통 설명
- question (질문): 7개 (14%) - 일상 질의
- instruction (지시): 6개 (12%) - 관리 방법 지시
- opinion (의견): 5개 (10%) - 소통/교통 의견
- suggestion (제안): 4개 (8%) - 관리 방법 제안
- emotion (감정): 3개 (6%) - 일상 감정
- gratitude (감사): 3개 (6%) - 도움 감사
- greeting (인사): 2개 (4%) - 일상 인사
- agreement (동의): 2개 (4%) - 소통 동의
- apology (사과): 1개 (2%) - 소통 사과

**품사 분포 (10개 모두 포함):**
- verb (동사): 15개 (30%) - 소통/이동 행동
- noun (명사): 12개 (24%) - 교통/관리 용어
- adjective (형용사): 8개 (16%) - 소통 특성
- other (기타): 6개 (12%) - 일상 표현
- adverb (부사): 4개 (8%) - 소통 방식
- interrogative (의문사): 3개 (6%) - 교통 질문
- preposition (전치사): 2개 (4%) - 위치 관계

**상황 분포:**
- polite + public: 15개 (30%) - 정중한 공공장소
- casual + public: 10개 (20%) - 편안한 공공장소
- polite + home: 8개 (16%) - 정중한 집
- casual + home: 7개 (14%) - 편안한 집
- polite + social: 5개 (10%) - 정중한 사회적 상황
- casual + social: 3개 (6%) - 편안한 사회적 상황
- polite + work: 2개 (4%) - 정중한 업무 환경

communication, transportation, personal_care를 **테마**로 하되 모든 언어 요소를 최대한 다양하게 포함해주세요.
```

### 2-22번 배치 (50개): daily-furniture+relationships+emotions 테마 최대 다양성

```
일상생활(daily) 도메인의 furniture(가구), relationships(관계), emotions(감정) 카테고리를 **테마**로 한 최대 다양성 데이터 50개를 생성해주세요.

**카테고리 분포:**
- furniture (가구): 18개 (36%) - 가구 선택, 인테리어
- relationships (관계): 18개 (36%) - 인간관계, 사회적 관계
- emotions (감정): 14개 (28%) - 감정 표현, 심리 상태

**난이도 분포 (5개 모두 포함):**
- intermediate (중급): 18개 (36%) - 관계/감정 이해
- advanced (고급): 12개 (24%) - 복잡한 감정 표현
- basic (기초): 10개 (20%) - 기본 가구/감정 어휘
- fluent (유창): 7개 (14%) - 유창한 감정 소통
- technical (전문): 3개 (6%) - 전문 심리 용어

**목적 분포 (12개 모두 포함):**
- emotion (감정): 12개 (24%) - 감정 표현
- opinion (의견): 9개 (18%) - 관계/가구 의견
- description (묘사): 8개 (16%) - 관계/감정 설명
- suggestion (제안): 6개 (12%) - 관계 개선 제안
- request (요청): 4개 (8%) - 관계 도움 요청
- question (질문): 3개 (6%) - 관계 질의
- agreement (동의): 2개 (4%) - 관계 동의
- gratitude (감사): 2개 (4%) - 관계 감사
- greeting (인사): 2개 (4%) - 관계 인사
- instruction (지시): 1개 (2%) - 관계 지시
- apology (사과): 1개 (2%) - 관계 사과

**품사 분포 (10개 모두 포함):**
- adjective (형용사): 16개 (32%) - 감정/관계 특성
- noun (명사): 12개 (24%) - 가구/관계 용어
- verb (동사): 10개 (20%) - 감정/관계 행동
- interjection (감탄사): 5개 (10%) - 감정 감탄
- other (기타): 4개 (8%) - 감정 표현
- adverb (부사): 2개