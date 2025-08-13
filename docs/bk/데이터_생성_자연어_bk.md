# 다국어 학습 플랫폼 데이터 생성 자연어 지시어 가이드

## 📋 개요

이 문서는 AI에게 다국어 학습 플랫폼용 데이터를 생성하도록 지시할 때 사용하는 자연어 지시어 모음입니다. 50개 단위로 데이터 생성을 요청할 수 있습니다.

## 📊 전체 10,000개 데이터 생성 전략

### 단계별 구축 로드맵 (4단계 × 50개씩 = 200배치)
```
1단계 (기초 구축): 2,000개 (40배치) - 기초/중급 중심, 모든 도메인 포함
2단계 (실용 확장): 3,000개 (60배치) - 중급/고급 중심, 모든 도메인 균등 분배
3단계 (심화 완성): 3,000개 (60배치) - 고급/유창 중심, 전문성 강화
4단계 (최종 보완): 2,000개 (40배치) - 전문/유창 중심, 부족 영역 보완
```

### 1단계: 기초 구축 (2,000개 - 40배치)
**모든 180개 카테고리 포함 (100%) - daily/food 도메인 비중 높음**

#### Domain (도메인) 비율
```
daily (일상생활): 25% (10배치) - 15/15카테고리 모두 포함, 기본+중심
food (음식): 20% (8배치) - 15/15카테고리 모두 포함, 주요+소량 
education (교육): 15% (6배치) - 17/17카테고리 모두 포함, 기본+소량
travel (여행): 10% (4배치) - 14/14카테고리 모두 포함, 기본+소량
business (비즈니스): 8% (3배치) - 14/14카테고리 모두 포함, 기본+소량
health (건강): 7% (3배치) - 15/15카테고리 모두 포함, 기본+소량
technology (기술): 5% (2배치) - 17/17카테고리 모두 포함, 기본+소량
culture (문화): 3% (1배치) - 14/14카테고리 모두 포함, 기본+소량
entertainment (엔터테인먼트): 3% (1배치) - 15/15카테고리 모두 포함, 기본+소량
nature (자연): 2% (1배치) - 14/14카테고리 모두 포함, 기본+소량
sports (스포츠): 1% (1배치) - 15/15카테고리 모두 포함, 기본+소량
other (기타): 1% (1배치) - 25/25카테고리 모두 포함, 소량만
```

#### Difficulty (난이도) 비율 - 1단계 기초 구축
```
basic (기초): 60% (24배치) - 초보 학습자 중심
intermediate (중급): 30% (12배치) - 발전 단계  
advanced (고급): 7% (3배치) - 도전적 학습
fluent (유창): 2% (1배치) - 고급 표현
technical (전문): 1% (1배치) - 전문 용어 도입
```

#### Part of Speech (품사) 비율 - 1단계 기초 구축
```
noun (명사): 40% (16배치) - 기본 어휘의 핵심
verb (동사): 25% (10배치) - 행동과 상태 표현
adjective (형용사): 15% (6배치) - 묘사와 수식
adverb (부사): 5% (2배치) - 동사/형용사 수식
pronoun (대명사): 3% (1배치) - 기본 대명사
preposition (전치사/조사): 3% (1배치) - 기본 관계
conjunction (접속사): 3% (1배치) - 기본 연결
interjection (감탄사): 3% (1배치) - 감정 표현
determiner (한정사): 2% (1배치) - 범위 한정
other (기타): 1% (1배치) - 구문, 관용구 등
```

#### Purpose (목적) 비율 - 1단계 기초 구축
```
description (묘사/설명): 25% (10배치) - 가장 범용적
greeting (인사): 20% (8배치) - 기본 소통
question (질문): 15% (6배치) - 상호작용
request (요청): 10% (4배치) - 실용성
instruction (지시/설명): 8% (3배치) - 학습용
opinion (의견표현): 6% (2배치) - 소통 필수
emotion (감정표현): 5% (2배치) - 표현력
gratitude (감사표현): 4% (2배치) - 예의
suggestion (제안): 3% (1배치) - 제안하기
agreement (동의): 2% (1배치) - 동의하기
apology (사과): 1% (1배치) - 사과하기
refusal (거절): 1% (1배치) - 거절하기
```

#### Situation (상황) 조합 비율 - 1단계 기초 구축
```
casual + home: 25% (10배치) - 가정 일상
polite + social: 20% (8배치) - 사교 정중
casual + social: 15% (6배치) - 친구 편안
polite + home: 10% (4배치) - 가정 정중
formal + work: 8% (3배치) - 직장 공식
polite + work: 7% (3배치) - 직장 정중
casual + work: 5% (2배치) - 직장 편안
formal + public: 5% (2배치) - 공공 공식
polite + public: 3% (1배치) - 공공 정중
casual + public: 2% (1배치) - 공공 편안
```

#### Category (카테고리) 비율 - 1단계 기초 구축 (180/180개 카테고리, 100%)
```
🏠 daily 카테고리 (15/15개): 25% (10배치) - 전체 포함
- routine (일과): 2.5% (1배치)
- family (가족): 2.5% (1배치)
- household (가사): 2.5% (1배치)
- shopping (쇼핑): 2.5% (1배치)
- communication (소통): 2.5% (1배치)
- emotions (감정): 2.5% (1배치)
- time (시간): 2.5% (1배치)
- clothing (의복): 2.5% (1배치)
- leisure (여가): 2.5% (1배치)
- 종합 (morning, evening, weekend, work, personal, social): 2.5% (1배치)

🍎 food 카테고리 (15/15개): 20% (8배치) - 전체 포함
- cooking (요리): 2.5% (1배치)
- restaurants (음식점): 2.5% (1배치)
- ingredients (재료): 2.5% (1배치)
- beverages (음료): 2.5% (1배치)
- nutrition (영양): 2.5% (1배치)
- snacks (간식): 2.5% (1배치)
- seafood (해산물): 2.5% (1배치)
- 종합 (fruits, vegetables, desserts, meat, dairy, spices, dining, recipes): 2.5% (1배치)

🎓 education 카테고리 (17/17개): 15% (6배치) - 전체 포함
- teaching (교육): 2.5% (1배치)
- learning (학습): 2.5% (1배치)
- classroom (교실): 2.5% (1배치)
- students (학생): 2.5% (1배치)
- subjects (과목): 2.5% (1배치)
- 종합 (curriculum, assessment, textbooks, exams, grades, homework, research, library, university, college, school, scholarship, academic): 2.5% (1배치)

✈️ travel 카테고리 (14/14개): 10% (4배치) - 전체 포함
- transportation (교통): 2.5% (1배치)
- accommodation (숙박): 2.5% (1배치)
- sightseeing (관광): 2.5% (1배치)
- 종합 (directions, booking, luggage, customs, currency, weather, maps, guides, attractions, souvenirs, emergency, language): 2.5% (1배치)

💼 business 카테고리 (14/14개): 8% (3배치) - 전체 포함
- meeting (회의): 2.7% (1배치)
- communication (의사소통): 2.7% (1배치)
- 종합 (presentation, negotiation, contracts, finance, marketing, teamwork, leadership, planning, reports, emails, sales, management): 2.6% (1배치)

💊 health 카테고리 (15/15개): 7% (3배치) - 전체 포함
- symptoms (증상): 2.3% (1배치)
- treatment (치료): 2.3% (1배치)
- 종합 (exercise, nutrition, medicine, hospital, doctor, appointment, wellness, prevention, mental, recovery, checkup, emergency, surgery): 2.4% (1배치)

💻 technology 카테고리 (17/17개): 5% (2배치) - 전체 포함
- internet (인터넷): 2.5% (1배치)
- 종합 (devices, software, applications, programming, data, security, artificial, social, mobile, gaming, cloud, communication, innovation, automation, research, development): 2.5% (1배치)

🎨 culture 카테고리 (14/14개): 3% (1배치) - 전체 포함
- 종합 (heritage, arts_crafts, national_identity, ceremony, etiquette, festivals, traditions, customs, beliefs, values, history, literature, music, film): 3% (1배치)

🎭 entertainment 카테고리 (15/15개): 3% (1배치) - 전체 포함
- 종합 (movies, music, games, books, theater, art, comedy, drama, dance, concerts, shows, celebrities, media, streaming, hobbies): 3% (1배치)

🌿 nature 카테고리 (14/14개): 2% (1배치) - 전체 포함
- 종합 (animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability): 2% (1배치)

⚽ sports 카테고리 (15/15개): 1% (1배치) - 전체 포함
- 종합 (football, basketball, swimming, running, cycling, tennis, baseball, fitness, teams, competitions, athletes, training, equipment, rules, victories): 1% (1배치)

🔧 other 카테고리 (25/25개): 1% (1배치) - 전체 포함
- 종합 (전체 25개 카테고리): 1% (1배치)
```

**✅ 모든 단계별 180개 카테고리 완전 분배 완료:**
- 1단계: 180/180 카테고리 (100%) - 기초 구축
- 2단계: 180/180 카테고리 (100%) - 실용 확장  
- 3단계: 180/180 카테고리 (100%) - 심화 완성
- 4단계: 180/180 카테고리 (100%) - 최종 보완

**각 단계마다 모든 도메인과 카테고리가 누락 없이 완전 분배됨!**

---

## 🎯 단계별 생성 자연어 지시어 (50개 단위)

### 1단계: 기초 구축 (2,000개 - 40배치)
**모든 180개 카테고리 포함 - 개별 배치 세부 지시어**

#### 1-1번 배치 (50개): daily-routine 기초 인사
```
일상생활(daily) 도메인의 routine(일과) 카테고리에서 기초(basic) 난이도의 인사(greeting) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 감탄사(interjection) 30%로 구성해주세요.
아침 인사, 일과 시작 표현 등을 포함해주세요.
```

#### 1-2번 배치 (50개): daily-family 기초 질문
```
일상생활(daily) 도메인의 family(가족) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
가족 구성원에 대한 기본적인 질문을 포함해주세요.
```

#### 1-3번 배치 (50개): daily-household 기초 요청
```
일상생활(daily) 도메인의 household(가사) 카테고리에서 기초(basic) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 집(polite,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
집안일과 관련된 요청 표현을 포함해주세요.
```

#### 1-4번 배치 (50개): daily-shopping 기초 감정표현
```
일상생활(daily) 도메인의 shopping(쇼핑) 카테고리에서 기초(basic) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 상점(casual,store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 명사(noun) 30%로 구성해주세요.
쇼핑할 때의 감정과 반응을 포함해주세요.
```

#### 1-5번 배치 (50개): daily-communication 기초 제안
```
일상생활(daily) 도메인의 communication(소통) 카테고리에서 기초(basic) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회적(polite,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
일상적인 제안과 권유 표현을 포함해주세요.
```

#### 1-6번 배치 (50개): daily-emotions 기초 지시
```
일상생활(daily) 도메인의 emotions(감정) 카테고리에서 기초(basic) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 부사(adverb) 30%, 명사(noun) 20%로 구성해주세요.
감정 표현과 관련된 지시사항을 포함해주세요.
```

#### 1-7번 배치 (50개): daily-time 기초 의견표현
```
일상생활(daily) 도메인의 time(시간) 카테고리에서 기초(basic) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 사회적(casual,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%로 구성해주세요.
시간과 관련된 의견과 생각을 포함해주세요.
```

#### 1-8번 배치 (50개): daily-clothing 기초 감사표현
```
일상생활(daily) 도메인의 clothing(의복) 카테고리에서 기초(basic) 난이도의 감사표현(gratitude) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 상점(polite,store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
의복 구매와 관련된 감사 표현을 포함해주세요.
```

#### 1-9번 배치 (50개): daily-leisure 기초 동의
```
일상생활(daily) 도메인의 leisure(여가) 카테고리에서 기초(basic) 난이도의 동의(agreement) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 사회적(casual,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 부사(adverb) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
여가 활동에 대한 동의와 찬성을 포함해주세요.
```

#### 1-10번 배치 (50개): daily 종합 (morning, evening, weekend, work, personal, social 포함)
```
일상생활(daily) 도메인에서 morning(아침), evening(저녁), weekend(주말), work(일), personal(개인), social(사회) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 80%, 중급(intermediate) 20%로 구성해주세요.
목적은 묘사(description) 30%, 질문(question) 25%, 인사(greeting) 20%, 감정표현(emotion) 25%로 구성해주세요.
상황은 캐주얼하고 집(casual,home) 40%, 정중하고 사회적(polite,social) 35%, 캐주얼하고 사회적(casual,social) 25%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 15%로 구성해주세요.
```

#### 1-11번 배치 (50개): food-cooking 기초 묘사
```
음식(food) 도메인의 cooking(요리) 카테고리에서 기초(basic) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 50%, 형용사(adjective) 30%, 동사(verb) 20%로 구성해주세요.
요리 과정과 음식 설명을 포함해주세요.
```

#### 1-12번 배치 (50개): food-restaurants 기초 감사표현
```
음식(food) 도메인의 restaurants(음식점) 카테고리에서 기초(basic) 난이도의 감사표현(gratitude) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 음식점(polite,restaurant) 환경에서 사용하는 표현으로 만들어주세요.
품사는 기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
음식점에서의 감사 표현을 포함해주세요.
```

#### 1-13번 배치 (50개): food-ingredients 기초 의견표현
```
음식(food) 도메인의 ingredients(재료) 카테고리에서 기초(basic) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 마트(casual,market) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
재료에 대한 의견과 평가를 포함해주세요.
```

#### 1-14번 배치 (50개): food-beverages 기초 지시
```
음식(food) 도메인의 beverages(음료) 카테고리에서 기초(basic) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 카페(polite,cafe) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
음료 주문과 관련된 지시사항을 포함해주세요.
```

#### 1-15번 배치 (50개): food-nutrition 기초 요청
```
음식(food) 도메인의 nutrition(영양) 카테고리에서 기초(basic) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
영양 상담과 관련된 요청을 포함해주세요.
```

#### 1-16번 배치 (50개): food-snacks 기초 동의
```
음식(food) 도메인의 snacks(간식) 카테고리에서 기초(basic) 난이도의 동의(agreement) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 부사(adverb) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
간식에 대한 동의와 찬성을 포함해주세요.
```

#### 1-17번 배치 (50개): food-seafood 기초 질문
```
음식(food) 도메인의 seafood(해산물) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 시장(polite,market) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
해산물에 대한 질문을 포함해주세요.
```

#### 1-18번 배치 (50개): food 종합 (fruits, vegetables, desserts, meat, dairy, spices, dining, recipes 포함)
```
음식(food) 도메인에서 fruits(과일), vegetables(채소), desserts(디저트), meat(고기), dairy(유제품), spices(향신료), dining(식사), recipes(레시피) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 70%, 중급(intermediate) 30%로 구성해주세요.
목적은 묘사(description) 40%, 의견표현(opinion) 30%, 요청(request) 30%로 구성해주세요.
상황은 캐주얼하고 집(casual,home) 40%, 정중하고 마트(polite,market) 35%, 정중하고 음식점(polite,restaurant) 25%로 구성해주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
```

#### 1-19번 배치 (50개): education-teaching 기초 지시
```
교육(education) 도메인의 teaching(교육) 카테고리에서 기초(basic) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 공식적이고 학교(formal,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
교실에서 실제 사용할 수 있는 교육적인 표현으로 만들어주세요.
```

#### 1-20번 배치 (50개): education-learning 기초 질문
```
교육(education) 도메인의 learning(학습) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 학교(polite,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
학습과 관련된 질문을 포함해주세요.
```

#### 1-21번 배치 (50개): education-classroom 중급 의견표현
```
교육(education) 도메인의 classroom(교실) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 학교(casual,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
교실 환경과 관련된 의견을 포함해주세요.
```

#### 1-22번 배치 (50개): education-students 기초 제안
```
교육(education) 도메인의 students(학생) 카테고리에서 기초(basic) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 학교(casual,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
학생들 간의 제안과 권유를 포함해주세요.
```

#### 1-23번 배치 (50개): education-subjects 기초 요청
```
교육(education) 도메인의 subjects(과목) 카테고리에서 기초(basic) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 학교(polite,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
과목과 관련된 요청을 포함해주세요.
```

#### 1-24번 배치 (50개): education 종합 (curriculum, assessment, textbooks, exams, grades, homework, research, library, university, college, school, scholarship, academic 포함)
```
교육(education) 도메인에서 curriculum(교육과정), assessment(평가), textbooks(교과서), exams(시험), grades(성적), homework(숙제), research(연구), library(도서관), university(대학교), college(대학), school(학교), scholarship(장학금), academic(학술) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 60%, 중급(intermediate) 40%로 구성해주세요.
목적은 묘사(description) 30%, 질문(question) 25%, 지시(instruction) 25%, 요청(request) 20%로 구성해주세요.
상황은 공식적이고 학교(formal,school) 40%, 정중하고 학교(polite,school) 35%, 캐주얼하고 학교(casual,school) 25%로 구성해주세요.
품사는 명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%로 구성해주세요.
```

#### 1-25번 배치 (50개): travel-transportation 기초 인사
```
여행(travel) 도메인의 transportation(교통) 카테고리에서 기초(basic) 난이도의 인사(greeting) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 공공장소(polite,public) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%로 구성해주세요.
교통수단에서의 인사를 포함해주세요.
```

#### 1-26번 배치 (50개): travel-accommodation 기초 질문
```
여행(travel) 도메인의 accommodation(숙박) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 호텔(polite,hotel) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
숙박과 관련된 질문을 포함해주세요.
```

#### 1-27번 배치 (50개): travel-sightseeing 중급 묘사
```
여행(travel) 도메인의 sightseeing(관광) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 관광지(casual,tourist) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
관광지와 명소에 대한 묘사를 포함해주세요.
```

#### 1-28번 배치 (50개): travel 종합 (directions, booking, luggage, customs, currency, weather, maps, guides, attractions, souvenirs, emergency, language 포함)
```
여행(travel) 도메인에서 directions(길찾기), booking(예약), luggage(짐), customs(세관), currency(환전), weather(날씨), maps(지도), guides(가이드), attractions(명소), souvenirs(기념품), emergency(응급), language(언어) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 70%, 중급(intermediate) 30%로 구성해주세요.
목적은 요청(request) 35%, 질문(question) 30%, 묘사(description) 25%, 지시(instruction) 10%로 구성해주세요.
상황은 정중하고 공공장소(polite,public) 40%, 정중하고 호텔(polite,hotel) 30%, 캐주얼하고 관광지(casual,tourist) 30%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 의문사(interrogative) 20%, 기타(other) 15%로 구성해주세요.
```

#### 1-29번 배치 (50개): business-meeting 기초 인사
```
비즈니스(business) 도메인의 meeting(회의) 카테고리에서 기초(basic) 난이도의 인사(greeting) 목적 데이터를 50개 생성해주세요.
상황은 공식적이고 업무(formal,work) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%로 구성해주세요.
회의에서의 인사와 소개를 포함해주세요.
```

#### 1-30번 배치 (50개): business-communication 기초 요청
```
비즈니스(business) 도메인의 communication(의사소통) 카테고리에서 기초(basic) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 업무(polite,work) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
업무 소통과 관련된 요청을 포함해주세요.
```

#### 1-31번 배치 (50개): business 종합 (presentation, negotiation, contracts, finance, marketing, teamwork, leadership, planning, reports, emails, sales, management 포함)
```
비즈니스(business) 도메인에서 presentation(발표), negotiation(협상), contracts(계약), finance(재정), marketing(마케팅), teamwork(팀워크), leadership(리더십), planning(계획), reports(보고서), emails(이메일), sales(판매), management(관리) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 50%, 중급(intermediate) 50%로 구성해주세요.
목적은 묘사(description) 30%, 요청(request) 25%, 지시(instruction) 25%, 의견표현(opinion) 20%로 구성해주세요.
상황은 공식적이고 업무(formal,work) 50%, 정중하고 업무(polite,work) 30%, 정중하고 사회적(polite,social) 20%로 구성해주세요.
품사는 명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%로 구성해주세요.
```

#### 1-32번 배치 (50개): health-symptoms 기초 묘사
```
건강(health) 도메인의 symptoms(증상) 카테고리에서 기초(basic) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
증상에 대한 설명과 묘사를 포함해주세요.
```

#### 1-33번 배치 (50개): health-treatment 기초 질문
```
건강(health) 도메인의 treatment(치료) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
치료와 관련된 질문을 포함해주세요.
```

#### 1-34번 배치 (50개): health 종합 (exercise, nutrition, medicine, hospital, doctor, appointment, wellness, prevention, mental, recovery, checkup, emergency, surgery 포함)
```
건강(health) 도메인에서 exercise(운동), nutrition(영양), medicine(약), hospital(병원), doctor(의사), appointment(진료예약), wellness(웰빙), prevention(예방), mental(정신), recovery(회복), checkup(건강검진), emergency(응급), surgery(수술) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 60%, 중급(intermediate) 40%로 구성해주세요.
목적은 묘사(description) 30%, 질문(question) 25%, 요청(request) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 병원(polite,hospital) 50%, 캐주얼하고 체육관(casual,gym) 25%, 정중하고 집(polite,home) 25%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 25%, 동사(verb) 25%, 의문사(interrogative) 15%로 구성해주세요.
```

#### 1-35번 배치 (50개): technology-internet 기초 지시
```
기술(technology) 도메인의 internet(인터넷) 카테고리에서 기초(basic) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
인터넷 사용과 관련된 지시사항을 포함해주세요.
```

#### 1-36번 배치 (50개): technology 종합 (devices, software, applications, programming, data, security, artificial, social, mobile, gaming, cloud, communication, innovation, automation, research, development 포함)
```
기술(technology) 도메인에서 devices(기기), software(소프트웨어), applications(앱), programming(프로그래밍), data(데이터), security(보안), artificial(인공지능), social(소셜미디어), mobile(모바일), gaming(게임), cloud(클라우드), communication(통신), innovation(혁신), automation(자동화), research(연구), development(개발) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 40%, 중급(intermediate) 60%로 구성해주세요.
목적은 묘사(description) 30%, 지시(instruction) 25%, 질문(question) 25%, 의견표현(opinion) 20%로 구성해주세요.
상황은 캐주얼하고 집(casual,home) 40%, 정중하고 사무실(polite,office) 35%, 캐주얼하고 사무실(casual,office) 25%로 구성해주세요.
품사는 명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 20%, 기타(other) 10%로 구성해주세요.
```

#### 1-37번 배치 (50개): culture 종합 (heritage, arts_crafts, national_identity, ceremony, etiquette, festivals, traditions, customs, beliefs, values, history, literature, music, film 포함)
```
문화(culture) 도메인에서 heritage(유산), arts_crafts(예술공예), national_identity(국가정체성), ceremony(의식), etiquette(예의), festivals(축제), traditions(전통), customs(관습), beliefs(신념), values(가치), history(역사), literature(문학), music(음악), film(영화) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 40%, 중급(intermediate) 60%로 구성해주세요.
목적은 묘사(description) 40%, 의견표현(opinion) 30%, 질문(question) 20%, 감정표현(emotion) 10%로 구성해주세요.
상황은 정중하고 사회적(polite,social) 40%, 공식적이고 공공장소(formal,public) 30%, 캐주얼하고 사회적(casual,social) 30%로 구성해주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%로 구성해주세요.
```

#### 1-38번 배치 (50개): entertainment 종합 (movies, music, games, books, theater, art, comedy, drama, dance, concerts, shows, celebrities, media, streaming, hobbies 포함)
```
엔터테인먼트(entertainment) 도메인에서 movies(영화), music(음악), games(게임), books(책), theater(연극), art(예술), comedy(코미디), drama(드라마), dance(춤), concerts(콘서트), shows(쇼), celebrities(연예인), media(미디어), streaming(스트리밍), hobbies(취미) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 50%, 중급(intermediate) 50%로 구성해주세요.
목적은 의견표현(opinion) 35%, 묘사(description) 30%, 감정표현(emotion) 20%, 제안(suggestion) 15%로 구성해주세요.
상황은 캐주얼하고 사회적(casual,social) 50%, 캐주얼하고 집(casual,home) 30%, 정중하고 사회적(polite,social) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 감탄사(interjection) 10%로 구성해주세요.
```

#### 1-39번 배치 (50개): nature 종합 (animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability 포함)
```
자연(nature) 도메인에서 animals(동물), plants(식물), weather(날씨), seasons(계절), environment(환경), conservation(보전), geography(지리), landscapes(풍경), climate(기후), ecology(생태), natural(자연), disasters(재해), resources(자원), sustainability(지속가능성) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 60%, 중급(intermediate) 40%로 구성해주세요.
목적은 묘사(description) 40%, 의견표현(opinion) 25%, 질문(question) 20%, 감정표현(emotion) 15%로 구성해주세요.
상황은 캐주얼하고 야외(casual,outdoor) 40%, 정중하고 사회적(polite,social) 35%, 공식적이고 공공장소(formal,public) 25%로 구성해주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%로 구성해주세요.
```

#### 1-40번 배치 (50개): sports, other 종합 (sports 15개 + other 25개 카테고리 포함)
```
스포츠(sports) 도메인에서 football(축구), basketball(농구), swimming(수영), running(달리기), cycling(자전거), tennis(테니스), baseball(야구), fitness(피트니스), teams(팀), competitions(경기), athletes(선수), training(훈련), equipment(장비), rules(규칙), victories(승리) 카테고리와 기타(other) 도메인의 전체 25개 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 70%, 중급(intermediate) 30%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 감정표현(emotion) 20%, 제안(suggestion) 15%, 동의(agreement) 10%로 구성해주세요.
상황은 캐주얼하고 체육관(casual,gym) 30%, 캐주얼하고 사회적(casual,social) 30%, 정중하고 사회적(polite,social) 25%, 캐주얼하고 야외(casual,outdoor) 15%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%로 구성해주세요.
```

### 2단계: 실용 확장 (3,000개 - 60배치)
**모든 180개 카테고리 포함 (100%) - 균등 분배로 실용성 강화**

### 2단계: 실용 확장 (3,000개 - 60배치)
**모든 180개 카테고리 포함 (100%) - 균등 분배로 실용성 강화**

#### Domain (도메인) 비율 - 2단계 실용 확장
```
daily (일상생활): 18% (11배치) - 15/15카테고리 모두 포함
food (음식): 15% (9배치) - 15/15카테고리 모두 포함
education (교육): 12% (7배치) - 17/17카테고리 모두 포함
travel (여행): 12% (7배치) - 14/14카테고리 모두 포함
business (비즈니스): 10% (6배치) - 14/14카테고리 모두 포함
health (건강): 8% (5배치) - 15/15카테고리 모두 포함
technology (기술): 8% (5배치) - 17/17카테고리 모두 포함
culture (문화): 7% (4배치) - 14/14카테고리 모두 포함
entertainment (엔터테인먼트): 5% (3배치) - 15/15카테고리 모두 포함
nature (자연): 3% (2배치) - 14/14카테고리 모두 포함
sports (스포츠): 2% (1배치) - 15/15카테고리 모두 포함
other (기타): 2% (1배치) - 25/25카테고리 모두 포함
```

#### Difficulty (난이도) 비율 - 2단계 실용 확장
```
intermediate (중급): 50% (30배치) - 실용 중심
basic (기초): 25% (15배치) - 기초 보완
advanced (고급): 15% (9배치) - 고급 도전
fluent (유창): 7% (4배치) - 유창성 향상
technical (전문): 3% (2배치) - 전문성 도입
```

#### Part of Speech (품사) 비율 - 2단계 실용 확장
```
verb (동사): 30% (18배치) - 실용적 행동 표현
noun (명사): 25% (15배치) - 실용 어휘 확장
adjective (형용사): 20% (12배치) - 다양한 묘사
adverb (부사): 8% (5배치) - 정확한 수식
other (기타): 7% (4배치) - 실용 구문
preposition (전치사): 3% (2배치) - 관계 표현
conjunction (접속사): 3% (2배치) - 연결 표현
pronoun (대명사): 2% (1배치) - 대명사 활용
determiner (한정사): 1% (1배치) - 한정 표현
interjection (감탄사): 1% (1배치) - 감정 표현
```

#### Purpose (목적) 비율 - 2단계 실용 확장
```
description (묘사/설명): 20% (12배치) - 실용적 설명
question (질문): 18% (11배치) - 다양한 질문
opinion (의견표현): 15% (9배치) - 의견 교환
request (요청): 12% (7배치) - 실용적 요청
instruction (지시/설명): 10% (6배치) - 실용 지시
greeting (인사): 8% (5배치) - 사회적 인사
suggestion (제안): 6% (4배치) - 실용 제안
emotion (감정표현): 4% (2배치) - 감정 소통
gratitude (감사표현): 3% (2배치) - 감사 표현
agreement (동의): 2% (1배치) - 동의 표현
apology (사과): 1% (1배치) - 사과 표현
refusal (거절): 1% (1배치) - 거절 표현
```

#### Situation (상황) 조합 비율 - 2단계 실용 확장
```
polite + social: 30% (18배치) - 사회적 정중함
casual + social: 25% (15배치) - 사회적 친근함
formal + work: 15% (9배치) - 업무 공식성
polite + work: 10% (6배치) - 업무 정중함
polite + public: 8% (5배치) - 공공 정중함
casual + home: 5% (3배치) - 가정 편안함
polite + home: 3% (2배치) - 가정 정중함
formal + public: 2% (1배치) - 공공 공식성
casual + work: 1% (1배치) - 업무 편안함
casual + public: 1% (1배치) - 공공 편안함
```

#### 2-1번 배치 (50개): daily-routine 중급 묘사
```
일상생활(daily) 도메인의 routine(일과) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회적(polite,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 형용사(adjective) 30%로 구성해주세요.
일과와 일상 루틴에 대한 상세한 묘사를 포함해주세요.
```

#### 2-2번 배치 (50개): daily-family 중급 질문
```
일상생활(daily) 도메인의 family(가족) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 사회적(casual,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 35%, 동사(verb) 35%, 명사(noun) 30%로 구성해주세요.
가족 관계와 가족 활동에 대한 심화 질문을 포함해주세요.
```

#### 2-3번 배치 (50개): daily-household 중급 요청
```
일상생활(daily) 도메인의 household(가사) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 집(polite,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
복잡한 가사 업무와 관련된 요청을 포함해주세요.
```

#### 2-4번 배치 (50개): daily-shopping 중급 의견표현
```
일상생활(daily) 도메인의 shopping(쇼핑) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 상점(polite,store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
상품과 쇼핑 경험에 대한 의견을 포함해주세요.
```

#### 2-5번 배치 (50개): daily-communication 중급 지시
```
일상생활(daily) 도메인의 communication(소통) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회적(polite,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 25%, 부사(adverb) 25%로 구성해주세요.
효과적인 소통 방법에 대한 지시를 포함해주세요.
```

#### 2-6번 배치 (50개): daily-emotions 중급 감정표현
```
일상생활(daily) 도메인의 emotions(감정) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 사회적(casual,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%로 구성해주세요.
복잡한 감정과 심리 상태를 포함해주세요.
```

#### 2-7번 배치 (50개): daily-time 중급 제안
```
일상생활(daily) 도메인의 time(시간) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회적(polite,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
시간 관리와 일정 조정에 대한 제안을 포함해주세요.
```

#### 2-8번 배치 (50개): daily-clothing 중급 감사표현
```
일상생활(daily) 도메인의 clothing(의복) 카테고리에서 중급(intermediate) 난이도의 감사표현(gratitude) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 상점(polite,store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
의복 관련 서비스와 도움에 대한 감사를 포함해주세요.
```

#### 2-9번 배치 (50개): daily-leisure 중급 인사
```
일상생활(daily) 도메인의 leisure(여가) 카테고리에서 중급(intermediate) 난이도의 인사(greeting) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 사회적(casual,social) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
여가 활동 중 만나는 사람들과의 인사를 포함해주세요.
```

#### 2-10번 배치 (50개): daily-morning 기초 질문
```
일상생활(daily) 도메인의 morning(아침) 카테고리에서 기초(basic) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
아침 시간과 관련된 질문을 포함해주세요.
```

#### 2-11번 배치 (50개): daily 종합 (evening, weekend, work, personal, social 포함)
```
일상생활(daily) 도메인에서 evening(저녁), weekend(주말), work(일), personal(개인), social(사회) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 60%, 기초(basic) 40%로 구성해주세요.
목적은 묘사(description) 25%, 질문(question) 25%, 의견표현(opinion) 25%, 요청(request) 25%로 구성해주세요.
상황은 정중하고 사회적(polite,social) 40%, 캐주얼하고 사회적(casual,social) 35%, 정중하고 집(polite,home) 25%로 구성해주세요.
품사는 동사(verb) 35%, 명사(noun) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 2-12번 배치 (50개): food-cooking 중급 지시
```
음식(food) 도메인의 cooking(요리) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 집(polite,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
복잡한 요리 과정과 기법에 대한 지시를 포함해주세요.
```

#### 2-13번 배치 (50개): food-restaurants 중급 요청
```
음식(food) 도메인의 restaurants(음식점) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 음식점(polite,restaurant) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
음식점에서의 복잡한 요청과 주문을 포함해주세요.
```

#### 2-14번 배치 (50개): food-ingredients 중급 묘사
```
음식(food) 도메인의 ingredients(재료) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 마트(polite,market) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
재료의 특성과 품질에 대한 상세한 묘사를 포함해주세요.
```

#### 2-15번 배치 (50개): food-beverages 중급 의견표현
```
음식(food) 도메인의 beverages(음료) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 카페(casual,cafe) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
음료의 맛과 선호도에 대한 의견을 포함해주세요.
```

#### 2-16번 배치 (50개): food-nutrition 중급 질문
```
음식(food) 도메인의 nutrition(영양) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
영양과 건강한 식습관에 대한 질문을 포함해주세요.
```

#### 2-17번 배치 (50개): food-snacks 기초 감정표현
```
음식(food) 도메인의 snacks(간식) 카테고리에서 기초(basic) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
간식을 먹을 때의 감정과 반응을 포함해주세요.
```

#### 2-18번 배치 (50개): food-seafood 중급 제안
```
음식(food) 도메인의 seafood(해산물) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 시장(polite,market) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
해산물 선택과 요리법에 대한 제안을 포함해주세요.
```

#### 2-19번 배치 (50개): food-fruits 중급 감사표현
```
음식(food) 도메인의 fruits(과일) 카테고리에서 중급(intermediate) 난이도의 감사표현(gratitude) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 마트(polite,market) 환경에서 사용하는 표현으로 만들어주세요.
품사는 기타(other) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
과일 구매와 관련된 감사 표현을 포함해주세요.
```

#### 2-20번 배치 (50개): food 종합 (vegetables, desserts, meat, dairy, spices, dining, recipes 포함)
```
음식(food) 도메인에서 vegetables(채소), desserts(디저트), meat(고기), dairy(유제품), spices(향신료), dining(식사), recipes(레시피) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 70%, 고급(advanced) 30%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 지시(instruction) 25%, 요청(request) 20%로 구성해주세요.
상황은 정중하고 음식점(polite,restaurant) 35%, 정중하고 마트(polite,market) 35%, 정중하고 집(polite,home) 30%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 2-21번 배치 (50개): education-school 중급 지시
```
교육(education) 도메인의 school(학교) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 학교(polite,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
학교 생활과 학습 방법에 대한 지시를 포함해주세요.
```

#### 2-22번 배치 (50개): education-subjects 중급 묘사
```
교육(education) 도메인의 subjects(과목) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 교실(polite,classroom) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
다양한 과목의 특성과 내용에 대한 묘사를 포함해주세요.
```

#### 2-23번 배치 (50개): education-teachers 중급 질문
```
교육(education) 도메인의 teachers(선생님) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 학교(polite,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
선생님께 하는 학습 관련 질문을 포함해주세요.
```

#### 2-24번 배치 (50개): education-classroom 중급 요청
```
교육(education) 도메인의 classroom(교실) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 교실(polite,classroom) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
교실에서의 도움 요청과 허가 요청을 포함해주세요.
```

#### 2-25번 배치 (50개): education-homework 중급 의견표현
```
교육(education) 도메인의 homework(숙제) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
숙제와 학습에 대한 의견과 느낌을 포함해주세요.
```

#### 2-26번 배치 (50개): education-studying 중급 제안
```
교육(education) 도메인의 studying(공부) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 도서관(polite,library) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 부사(adverb) 30%, 명사(noun) 30%로 구성해주세요.
효과적인 학습 방법에 대한 제안을 포함해주세요.
```

#### 2-27번 배치 (50개): education-exams 중급 감정표현
```
교육(education) 도메인의 exams(시험) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 학교(casual,school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
시험과 관련된 감정과 반응을 포함해주세요.
```

#### 2-28번 배치 (50개): travel-transportation 중급 요청
```
여행(travel) 도메인의 transportation(교통) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 대중교통(polite,public transport) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%로 구성해주세요.
교통수단 이용과 관련된 요청을 포함해주세요.
```

#### 2-29번 배치 (50개): travel-destinations 중급 묘사
```
여행(travel) 도메인의 destinations(목적지) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 관광지(polite,tourist site) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
여행지의 특성과 매력에 대한 묘사를 포함해주세요.
```

#### 2-30번 배치 (50개): travel-accommodation 중급 질문
```
여행(travel) 도메인의 accommodation(숙박) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 호텔(polite,hotel) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
숙박 시설과 서비스에 대한 질문을 포함해주세요.
```

#### 2-31번 배치 (50개): travel-activities 중급 제안
```
여행(travel) 도메인의 activities(활동) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 관광지(casual,tourist site) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
여행 활동과 관광에 대한 제안을 포함해주세요.
```

#### 2-32번 배치 (50개): travel-sightseeing 중급 감정표현
```
여행(travel) 도메인의 sightseeing(관광) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 관광지(casual,tourist site) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
관광 중의 감탄과 감정을 포함해주세요.
```

#### 2-33번 배치 (50개): travel 종합 (passport, booking, culture, shopping, directions, guidance 포함)
```
여행(travel) 도메인에서 passport(여권), booking(예약), culture(문화), shopping(쇼핑), directions(길찾기), guidance(안내) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 70%, 고급(advanced) 30%로 구성해주세요.
목적은 질문(question) 30%, 요청(request) 25%, 묘사(description) 25%, 제안(suggestion) 20%로 구성해주세요.
상황은 정중하고 공항(polite,airport) 30%, 정중하고 관광지(polite,tourist site) 35%, 정중하고 쇼핑몰(polite,shopping mall) 35%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 2-34번 배치 (50개): business-meetings 중급 지시
```
비즈니스(business) 도메인의 meetings(회의) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 회의실(polite,meeting room) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
회의 진행과 업무 지시를 포함해주세요.
```

#### 2-35번 배치 (50개): business-office 중급 요청
```
비즈니스(business) 도메인의 office(사무실) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사무실(polite,office) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
업무 협조와 도움 요청을 포함해주세요.
```

#### 2-36번 배치 (50개): business-clients 중급 의견표현
```
비즈니스(business) 도메인의 clients(고객) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사무실(polite,office) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
고객 서비스와 관련된 의견을 포함해주세요.
```

#### 2-37번 배치 (50개): business-projects 중급 질문
```
비즈니스(business) 도메인의 projects(프로젝트) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 회의실(polite,meeting room) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
프로젝트 진행과 관련된 질문을 포함해주세요.
```

#### 2-38번 배치 (50개): business-emails 중급 묘사
```
비즈니스(business) 도메인의 emails(이메일) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사무실(polite,office) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 동사(verb) 30%, 형용사(adjective) 30%로 구성해주세요.
이메일 작성과 업무 소통에 대한 묘사를 포함해주세요.
```

#### 2-39번 배치 (50개): business-presentations 중급 제안
```
비즈니스(business) 도메인의 presentations(발표) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 회의실(polite,meeting room) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
발표 개선과 업무 제안을 포함해주세요.
```

#### 2-40번 배치 (50개): business 종합 (negotiations, deadlines, teamwork, reports, communication, workplace, planning 포함)
```
비즈니스(business) 도메인에서 negotiations(협상), deadlines(마감일), teamwork(팀워크), reports(보고서), communication(소통), workplace(직장), planning(계획) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 60%, 고급(advanced) 40%로 구성해주세요.
목적은 지시(instruction) 30%, 의견표현(opinion) 25%, 질문(question) 25%, 요청(request) 20%로 구성해주세요.
상황은 정중하고 사무실(polite,office) 50%, 정중하고 회의실(polite,meeting room) 50%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 2-41번 배치 (50개): health-exercise 중급 지시
```
건강(health) 도메인의 exercise(운동) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 헬스장(polite,gym) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
운동 방법과 트레이닝에 대한 지시를 포함해주세요.
```

#### 2-42번 배치 (50개): health-medical 중급 질문
```
건강(health) 도메인의 medical(의료) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
의료 상담과 건강 관련 질문을 포함해주세요.
```

#### 2-43번 배치 (50개): health-symptoms 중급 묘사
```
건강(health) 도메인의 symptoms(증상) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
증상과 건강 상태에 대한 묘사를 포함해주세요.
```

#### 2-44번 배치 (50개): health-wellness 중급 제안
```
건강(health) 도메인의 wellness(웰빙) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
건강한 생활습관에 대한 제안을 포함해주세요.
```

#### 2-45번 배치 (50개): technology-computers 중급 지시
```
기술(technology) 도메인의 computers(컴퓨터) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사무실(polite,office) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
컴퓨터 사용법과 소프트웨어 조작에 대한 지시를 포함해주세요.
```

#### 2-46번 배치 (50개): technology-internet 중급 질문
```
기술(technology) 도메인의 internet(인터넷) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
인터넷 사용과 온라인 서비스에 대한 질문을 포함해주세요.
```

#### 2-47번 배치 (50개): technology-smartphones 중급 요청
```
기술(technology) 도메인의 smartphones(스마트폰) 카테고리에서 중급(intermediate) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 매장(polite,store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%로 구성해주세요.
스마트폰 기능과 앱 사용에 대한 요청을 포함해주세요.
```

#### 2-48번 배치 (50개): culture-traditions 중급 묘사
```
문화(culture) 도메인의 traditions(전통) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 박물관(polite,museum) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
전통 문화와 관습에 대한 묘사를 포함해주세요.
```

#### 2-49번 배치 (50개): culture-festivals 중급 감정표현
```
문화(culture) 도메인의 festivals(축제) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 축제장(casual,festival site) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
축제 참여 중의 감정과 반응을 포함해주세요.
```

#### 2-50번 배치 (50개): entertainment-movies 중급 의견표현
```
엔터테인먼트(entertainment) 도메인의 movies(영화) 카테고리에서 중급(intermediate) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 영화관(casual,cinema) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 30%, 명사(noun) 30%로 구성해주세요.
영화 감상과 평가에 대한 의견을 포함해주세요.
```

### 3단계: 심화 완성 (3,000개 - 60배치)
**모든 180개 카테고리 포함 (100%) - 고급/유창 중심 전문성 강화**

#### Domain (도메인) 비율 - 3단계 심화 완성
```
technology (기술): 20% (12배치) - 17/17카테고리 모두, 고급 기술
business (비즈니스): 18% (11배치) - 14/14카테고리 모두, 전문 비즈니스
education (교육): 15% (9배치) - 17/17카테고리 모두, 교육 전문
health (건강): 12% (7배치) - 15/15카테고리 모두, 의료 심화
culture (문화): 10% (6배치) - 14/14카테고리 모두, 문화 깊이
daily (일상생활): 8% (5배치) - 15/15카테고리 모두, 고급 일상
travel (여행): 6% (4배치) - 14/14카테고리 모두, 심화 여행
food (음식): 5% (3배치) - 15/15카테고리 모두, 고급 음식
entertainment (엔터테인먼트): 3% (2배치) - 15/15카테고리 모두, 전문 오락
nature (자연): 2% (1배치) - 14/14카테고리 모두, 환경 전문
sports (스포츠): 1% (1배치) - 15/15카테고리 모두, 스포츠 전문
other (기타): 1% (1배치) - 25/25카테고리 모두, 전문 기타
```

#### Difficulty (난이도) 비율 - 3단계 심화 완성
```
advanced (고급): 40% (24배치) - 고급 표현 중심
fluent (유창): 30% (18배치) - 유창한 소통
intermediate (중급): 25% (15배치) - 중급 보완
technical (전문): 4% (2배치) - 전문 용어
basic (기초): 1% (1배치) - 기초 확인
```

#### Part of Speech (품사) 비율 - 3단계 심화 완성
```
noun (명사): 35% (21배치) - 전문 어휘 중심
verb (동사): 25% (15배치) - 고급 동작 표현
adjective (형용사): 20% (12배치) - 정교한 묘사
other (기타): 8% (5배치) - 고급 구문
adverb (부사): 6% (4배치) - 정밀한 수식
preposition (전치사): 2% (1배치) - 고급 관계
conjunction (접속사): 2% (1배치) - 복합 연결
determiner (한정사): 1% (1배치) - 정밀 한정
pronoun (대명사): 1% (1배치) - 고급 대명사
interjection (감탄사): 0% (0배치) - 최소화
```

#### Purpose (목적) 비율 - 3단계 심화 완성
```
opinion (의견표현): 25% (15배치) - 고급 의견 표현
description (묘사/설명): 20% (12배치) - 정밀한 설명
instruction (지시/설명): 15% (9배치) - 전문적 지시
question (질문): 12% (7배치) - 심화 질문
request (요청): 10% (6배치) - 정중한 요청
suggestion (제안): 8% (5배치) - 전문적 제안
emotion (감정표현): 4% (2배치) - 깊이 있는 감정
agreement (동의): 3% (2배치) - 전문적 동의
greeting (인사): 2% (1배치) - 공식적 인사
gratitude (감사표현): 1% (1배치) - 공식적 감사
apology (사과): 0% (0배치) - 최소화
refusal (거절): 0% (0배치) - 최소화
```

#### Situation (상황) 조합 비율 - 3단계 심화 완성
```
formal + work: 35% (21배치) - 전문 업무 환경
polite + social: 25% (15배치) - 고급 사회적 상황
formal + public: 15% (9배치) - 공식적 공개 상황
polite + work: 10% (6배치) - 업무에서의 정중함
polite + public: 8% (5배치) - 공공에서의 정중함
formal + social: 3% (2배치) - 사회적 공식성
polite + home: 2% (1배치) - 가정에서의 정중함
casual + social: 1% (1배치) - 일반적 사회 상황
casual + work: 1% (1배치) - 업무에서의 친근함
casual + home: 0% (0배치) - 최소화
```

[3단계 개별 배치 3-1 ~ 3-60은 추가 작업 필요]

### 4단계: 최종 보완 (2,000개 - 40배치)
**모든 180개 카테고리 포함 (100%) - 전문/유창 중심 최종 완성**

#### Domain (도메인) 비율 - 4단계 최종 보완
```
technology (기술): 20% (8배치) - 17/17카테고리 모두, 최신 기술
business (비즈니스): 18% (7배치) - 14/14카테고리 모두, 고급 비즈니스
health (건강): 15% (6배치) - 15/15카테고리 모두, 의료 전문
education (교육): 12% (5배치) - 17/17카테고리 모두, 교육 전문
culture (문화): 10% (4배치) - 14/14카테고리 모두, 문화 전문
daily (일상생활): 8% (3배치) - 15/15카테고리 모두, 일상 완성
travel (여행): 6% (2배치) - 14/14카테고리 모두, 여행 완성
nature (자연): 4% (2배치) - 14/14카테고리 모두, 환경 완성
food (음식): 3% (1배치) - 15/15카테고리 모두, 음식 완성
entertainment (엔터테인먼트): 2% (1배치) - 15/15카테고리 모두, 오락 완성
sports (스포츠): 1% (1배치) - 15/15카테고리 모두, 스포츠 완성
other (기타): 1% (1배치) - 25/25카테고리 모두, 기타 완성
```

#### Difficulty (난이도) 비율 - 4단계 최종 보완
```
technical (기술적): 35% (14배치) - 기술/의료 전문가 수준
fluent (유창한): 30% (12배치) - 원어민 급 고급 표현
advanced (고급): 25% (10배치) - 완전 숙련자 수준
intermediate (중급): 7% (3배치) - 보완 및 확인
basic (기초): 3% (1배치) - 최종 확인용
```

#### Part of Speech (품사) 비율 - 4단계 최종 보완
```
noun (명사): 30% - 전문 용어 및 고급 개념
verb (동사): 25% - 고급 동작 및 상태
adjective (형용사): 20% - 전문적 묘사 및 평가
adverb (부사): 10% - 정밀한 수식어
other (기타): 8% - 전문 용법
preposition (전치사): 3% - 고급 문법
conjunction (접속사): 2% - 복잡한 연결
determiner (한정사): 1% - 정밀한 지시
pronoun (대명사): 1% - 고급 대명사
interjection (감탄사): 0% - 최소화
```

#### Purpose (목적) 비율 - 4단계 최종 보완
```
description (설명): 25% - 전문적 기술 설명
instruction (지시): 20% - 전문 절차 안내
opinion (의견): 18% - 전문가 의견 표현
question (질문): 12% - 전문적 질의
request (요청): 10% - 공식적 요청
suggestion (제안): 5% - 전문가 제안
agreement (동의): 4% - 전문적 합의
emotion (감정): 3% - 절제된 감정 표현
greeting (인사): 2% - 공식적 인사
gratitude (감사): 1% - 공식적 감사
apology (사과): 0% - 최소화
refusal (거절): 0% - 최소화
```

#### Situation (상황) 조합 비율 - 4단계 최종 보완
```
formal + work: 40% - 전문 업무 환경
polite + social: 25% - 고급 사회적 상황
formal + public: 20% - 공식적 발표 및 회의
polite + home: 10% - 가정에서의 정중한 상황
casual + social: 3% - 일반적 사회 상황
polite + work: 2% - 업무에서의 정중함
```

[4단계 개별 배치 4-1 ~ 4-40은 추가 작업 필요]

#### 2-51번 배치 (50개): entertainment-music 중급 감정표현
```
엔터테인먼트(entertainment) 도메인의 music(음악) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 콘서트홀(casual,concert hall) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
음악 감상 중의 감정과 반응을 포함해주세요.
```

#### 2-52번 배치 (50개): entertainment-games 중급 제안
```
엔터테인먼트(entertainment) 도메인의 games(게임) 카테고리에서 중급(intermediate) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
게임 플레이와 전략에 대한 제안을 포함해주세요.
```

#### 2-53번 배치 (50개): nature-animals 중급 묘사
```
자연(nature) 도메인의 animals(동물) 카테고리에서 중급(intermediate) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 동물원(polite,zoo) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
동물의 특성과 행동에 대한 묘사를 포함해주세요.
```

#### 2-54번 배치 (50개): nature-plants 중급 지시
```
자연(nature) 도메인의 plants(식물) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 정원(polite,garden) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
식물 관리와 원예에 대한 지시를 포함해주세요.
```

#### 2-55번 배치 (50개): nature-weather 중급 감정표현
```
자연(nature) 도메인의 weather(날씨) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 야외(casual,outdoor) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
날씨에 대한 감정과 반응을 포함해주세요.
```

#### 2-56번 배치 (50개): sports-exercises 중급 지시
```
스포츠(sports) 도메인의 exercises(운동) 카테고리에서 중급(intermediate) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 헬스장(polite,gym) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
운동 방법과 트레이닝에 대한 지시를 포함해주세요.
```

#### 2-57번 배치 (50개): sports-competition 중급 감정표현
```
스포츠(sports) 도메인의 competition(경기) 카테고리에서 중급(intermediate) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 경기장(casual,stadium) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 감탄사(interjection) 30%, 동사(verb) 30%로 구성해주세요.
경기 관람과 응원 중의 감정을 포함해주세요.
```

#### 2-58번 배치 (50개): sports-equipment 중급 질문
```
스포츠(sports) 도메인의 equipment(장비) 카테고리에서 중급(intermediate) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 스포츠용품점(polite,sports store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
스포츠 장비와 용품에 대한 질문을 포함해주세요.
```

#### 2-59번 배치 (50개): other 종합 (time, numbers, colors, shapes, size, emotions, personality, relationships, clothing, hobbies, money, transportation, communication, emergency, environment, politics, work-life, social-issues, family, law 포함)
```
기타(other) 도메인에서 time(시간), numbers(숫자), colors(색깔), shapes(모양), size(크기), emotions(감정), personality(성격), relationships(관계), clothing(의류), hobbies(취미), money(돈), transportation(교통), communication(소통), emergency(응급상황), environment(환경), politics(정치), work-life(일과 삶), social-issues(사회문제), family(가족), law(법률) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 80%, 고급(advanced) 20%로 구성해주세요.
목적은 묘사(description) 25%, 질문(question) 25%, 의견표현(opinion) 25%, 감정표현(emotion) 25%로 구성해주세요.
상황은 캐주얼하고 집(casual,home) 30%, 정중하고 사회적 장소(polite,social place) 35%, 정중하고 공공장소(polite,public place) 35%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 2-60번 배치 (50개): 전체 도메인 종합 (daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other 포함)
```
전체 12개 도메인(daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other)을 포괄하는 종합 데이터를 50개 생성해주세요.
난이도는 중급(intermediate) 60%, 고급(advanced) 40%로 구성해주세요.
목적은 묘사(description) 20%, 질문(question) 20%, 의견표현(opinion) 20%, 지시(instruction) 15%, 요청(request) 15%, 제안(suggestion) 10%로 구성해주세요.
상황은 정중하고 사회적 장소(polite,social place) 40%, 캐주얼하고 집(casual,home) 30%, 정중하고 직장(polite,work) 30%로 구성해주세요.
품사는 명사(noun) 30%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 15%로 구성해주세요.
2단계 마무리 배치로서 다양한 실생활 상황을 종합적으로 다뤄주세요.
```

### 📊 Stage 2 총 배치 현황 (60개 배치 완료):
- daily 도메인: 11개 배치 (2-1 ~ 2-11)
- food 도메인: 9개 배치 (2-12 ~ 2-20)
- education 도메인: 7개 배치 (2-21 ~ 2-27) 
- travel 도메인: 6개 배치 (2-28 ~ 2-33)
- business 도메인: 7개 배치 (2-34 ~ 2-40)
- health 도메인: 4개 배치 (2-41 ~ 2-44)
- technology 도메인: 3개 배치 (2-45 ~ 2-47)
- culture 도메인: 2개 배치 (2-48 ~ 2-49)
- entertainment 도메인: 3개 배치 (2-50 ~ 2-52)
- nature 도메인: 3개 배치 (2-53 ~ 2-55)
- sports 도메인: 3개 배치 (2-56 ~ 2-58)
- other 도메인: 1개 배치 (2-59)
- 전체 종합: 1개 배치 (2-60)

---

## 🎯 Stage 3 (3-1 ~ 3-60번 배치): 고급-유창 수준 (3,000개)

#### 3-1번 배치 (50개): daily-morning 고급 묘사
```
일상생활(daily) 도메인의 morning(아침) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 집(polite,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
복잡한 아침 일과와 심리 상태에 대한 세밀한 묘사를 포함해주세요.
```

#### 3-2번 배치 (50개): daily-evening 고급 감정표현
```
일상생활(daily) 도메인의 evening(저녁) 카테고리에서 고급(advanced) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 집(casual,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 감탄사(interjection) 25%, 동사(verb) 30%로 구성해주세요.
하루를 마무리하며 느끼는 복잡한 감정을 포함해주세요.
```

#### 3-3번 배치 (50개): daily-routine 고급 의견표현
```
일상생활(daily) 도메인의 routine(일과) 카테고리에서 고급(advanced) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회적 장소(polite,social place) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
생활 패턴과 습관에 대한 심도 있는 의견을 포함해주세요.
```

#### 3-4번 배치 (50개): daily-sleep 고급 질문
```
일상생활(daily) 도메인의 sleep(수면) 카테고리에서 고급(advanced) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 병원(polite,hospital) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
수면의 질과 건강과의 관계에 대한 전문적 질문을 포함해주세요.
```

#### 3-5번 배치 (50개): daily-hygiene 고급 지시
```
일상생활(daily) 도메인의 hygiene(위생) 카테고리에서 고급(advanced) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 의료 시설(polite,medical facility) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
전문적이고 체계적인 위생 관리 방법을 포함해주세요.
```

#### 3-6번 배치 (50개): daily-cleaning 고급 제안
```
일상생활(daily) 도메인의 cleaning(청소) 카테고리에서 고급(advanced) 난이도의 제안(suggestion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 집(polite,home) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 부사(adverb) 30%로 구성해주세요.
효율적이고 체계적인 청소 방법에 대한 전문적 제안을 포함해주세요.
```

#### 3-7번 배치 (50개): daily-shopping 고급 요청
```
일상생활(daily) 도메인의 shopping(쇼핑) 카테고리에서 고급(advanced) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 고급 매장(polite,luxury store) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 기타(other) 30%, 명사(noun) 30%로 구성해주세요.
고급 상품과 맞춤 서비스에 대한 정중한 요청을 포함해주세요.
```

#### 3-8번 배치 (50개): daily-cooking 유창 묘사
```
일상생활(daily) 도메인의 cooking(요리) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 고급 주방(polite,gourmet kitchen) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
고급 요리 기법과 미식학적 관점의 묘사를 포함해주세요.
```

#### 3-9번 배치 (50개): daily-commuting 고급 감정표현
```
일상생활(daily) 도메인의 commuting(통근) 카테고리에서 고급(advanced) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 대중교통(casual,public transport) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 감탄사(interjection) 25%, 동사(verb) 30%로 구성해주세요.
복잡한 도시 생활의 심리적 측면을 포함해주세요.
```

#### 3-10번 배치 (50개): daily-relaxation 유창 의견표현
```
일상생활(daily) 도메인의 relaxation(휴식) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 스파(casual,spa) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
웰빙과 라이프스타일에 대한 철학적 의견을 포함해주세요.
```

#### 3-11번 배치 (50개): daily 종합 (household, chores, schedule, leisure, health, family time, work-life balance 포함)
```
일상생활(daily) 도메인에서 household(가사), chores(집안일), schedule(일정), leisure(여가), health(건강), family time(가족 시간), work-life balance(일과 삶의 균형) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 묘사(description) 25%, 의견표현(opinion) 25%, 감정표현(emotion) 20%, 제안(suggestion) 15%, 질문(question) 15%로 구성해주세요.
상황은 정중하고 집(polite,home) 40%, 캐주얼하고 집(casual,home) 35%, 정중하고 사회적 장소(polite,social place) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 3-12번 배치 (50개): food-gourmet 유창 묘사
```
음식(food) 도메인의 gourmet(미식) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 고급 레스토랑(polite,fine dining) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 명사(noun) 30%, 동사(verb) 25%로 구성해주세요.
고급 요리의 맛, 향, 식감에 대한 전문적 묘사를 포함해주세요.
```

#### 3-13번 배치 (50개): food-culinary 고급 지시
```
음식(food) 도메인의 culinary(요리법) 카테고리에서 고급(advanced) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 요리 학교(polite,culinary school) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
전문적인 요리 기법과 복잡한 조리 과정을 포함해주세요.
```

#### 3-14번 배치 (50개): food-wine 유창 의견표현
```
음식(food) 도메인의 wine(와인) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 와인바(polite,wine bar) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
와인의 특성과 페어링에 대한 전문적 의견을 포함해주세요.
```

#### 3-15번 배치 (50개): food-gastronomy 고급 질문
```
음식(food) 도메인의 gastronomy(미식학) 카테고리에서 고급(advanced) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 미식 학회(polite,culinary institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
음식 문화와 조리 과학에 대한 학술적 질문을 포함해주세요.
```

#### 3-16번 배치 (50개): food 종합 (organic, fusion, dietary, artisan, traditional, molecular 포함)
```
음식(food) 도메인에서 organic(유기농), fusion(퓨전), dietary(식이요법), artisan(장인), traditional(전통), molecular(분자요리) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 50%, 유창(fluent) 50%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 지시(instruction) 20%, 질문(question) 25%로 구성해주세요.
상황은 정중하고 고급 레스토랑(polite,fine dining) 40%, 정중하고 요리 학교(polite,culinary school) 35%, 정중하고 식품 연구소(polite,food lab) 25%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-17번 배치 (50개): education-research 유창 지시
```
교육(education) 도메인의 research(연구) 카테고리에서 유창(fluent) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 연구실(polite,laboratory) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
고급 연구 방법론과 학술적 절차에 대한 지시를 포함해주세요.
```

#### 3-18번 배치 (50개): education-university 고급 질문
```
교육(education) 도메인의 university(대학교) 카테고리에서 고급(advanced) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 대학교(polite,university) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
학술적 주제와 연구에 대한 심화 질문을 포함해주세요.
```

#### 3-19번 배치 (50개): education-thesis 유창 묘사
```
교육(education) 도메인의 thesis(논문) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 학술 회의(polite,academic conference) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
연구 결과와 학술적 기여에 대한 전문적 묘사를 포함해주세요.
```

#### 3-20번 배치 (50개): education-pedagogy 고급 의견표현
```
교육(education) 도메인의 pedagogy(교육학) 카테고리에서 고급(advanced) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 교육 세미나(polite,education seminar) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
교육 방법론과 학습 이론에 대한 전문적 의견을 포함해주세요.
```

#### 3-21번 배치 (50개): education 종합 (curriculum, assessment, methodology, psychology, administration, technology integration 포함)
```
교육(education) 도메인에서 curriculum(교육과정), assessment(평가), methodology(방법론), psychology(심리학), administration(행정), technology integration(기술 통합) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 의견표현(opinion) 25%, 묘사(description) 25%, 질문(question) 20%, 지시(instruction) 15%, 제안(suggestion) 15%로 구성해주세요.
상황은 정중하고 교육 기관(polite,educational institution) 50%, 정중하고 학술 회의(polite,academic conference) 30%, 정중하고 연구실(polite,laboratory) 20%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-22번 배치 (50개): travel-international 유창 요청
```
여행(travel) 도메인의 international(국제여행) 카테고리에서 유창(fluent) 난이도의 요청(request) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 고급 호텔(polite,luxury hotel) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 40%, 명사(noun) 30%, 기타(other) 30%로 구성해주세요.
고급 여행 서비스와 맞춤형 경험에 대한 요청을 포함해주세요.
```

#### 3-23번 배치 (50개): travel-luxury 고급 묘사
```
여행(travel) 도메인의 luxury(럭셔리) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 프리미엄 리조트(polite,premium resort) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 명사(noun) 30%, 동사(verb) 25%로 구성해주세요.
럭셔리 여행 경험과 프리미엄 서비스에 대한 세밀한 묘사를 포함해주세요.
```

#### 3-24번 배치 (50개): travel-adventure 고급 감정표현
```
여행(travel) 도메인의 adventure(모험) 카테고리에서 고급(advanced) 난이도의 감정표현(emotion) 목적 데이터를 50개 생성해주세요.
상황은 캐주얼하고 야외 활동지(casual,outdoor adventure site) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 감탄사(interjection) 25%, 동사(verb) 30%로 구성해주세요.
극한 스포츠와 모험 여행 중의 복잡한 감정을 포함해주세요.
```

#### 3-25번 배치 (50개): travel 종합 (heritage, ecotourism, business travel, photography, local experiences 포함)
```
여행(travel) 도메인에서 heritage(문화유산), ecotourism(생태관광), business travel(출장), photography(사진), local experiences(현지 체험) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 질문(question) 20%, 요청(request) 15%, 감정표현(emotion) 10%로 구성해주세요.
상황은 정중하고 문화유산지(polite,heritage site) 35%, 정중하고 고급 호텔(polite,luxury hotel) 35%, 정중하고 현지 커뮤니티(polite,local community) 30%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-26번 배치 (50개): business-strategy 유창 의견표현
```
비즈니스(business) 도메인의 strategy(전략) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 이사회실(polite,boardroom) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
기업 전략과 시장 분석에 대한 고급 비즈니스 의견을 포함해주세요.
```

#### 3-27번 배치 (50개): business-finance 고급 질문
```
비즈니스(business) 도메인의 finance(재정) 카테고리에서 고급(advanced) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 금융 기관(polite,financial institution) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
복잡한 금융 상품과 투자 전략에 대한 질문을 포함해주세요.
```

#### 3-28번 배치 (50개): business-innovation 유창 묘사
```
비즈니스(business) 도메인의 innovation(혁신) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 혁신센터(polite,innovation hub) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
기술 혁신과 비즈니스 모델 변화에 대한 전문적 묘사를 포함해주세요.
```

#### 3-29번 배치 (50개): business-leadership 고급 지시
```
비즈니스(business) 도메인의 leadership(리더십) 카테고리에서 고급(advanced) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 경영진 회의(polite,executive meeting) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
고급 관리 기법과 리더십 원칙에 대한 지시를 포함해주세요.
```

#### 3-30번 배치 (50개): business 종합 (marketing, consulting, entrepreneurship, sustainability, global markets 포함)
```
비즈니스(business) 도메인에서 marketing(마케팅), consulting(컨설팅), entrepreneurship(기업가정신), sustainability(지속가능성), global markets(글로벌 시장) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 50%, 유창(fluent) 50%로 구성해주세요.
목적은 의견표현(opinion) 25%, 묘사(description) 25%, 지시(instruction) 20%, 질문(question) 15%, 제안(suggestion) 15%로 구성해주세요.
상황은 정중하고 이사회실(polite,boardroom) 40%, 정중하고 컨퍼런스(polite,conference) 35%, 정중하고 컨설팅 펌(polite,consulting firm) 25%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-31번 배치 (50개): health-psychology 유창 질문
```
건강(health) 도메인의 psychology(심리학) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 심리 상담소(polite,psychology clinic) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
정신 건강과 심리 치료에 대한 전문적 질문을 포함해주세요.
```

#### 3-32번 배치 (50개): health-nutrition 고급 지시
```
건강(health) 도메인의 nutrition(영양학) 카테고리에서 고급(advanced) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 영양 상담실(polite,nutrition clinic) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
전문적인 영양 관리와 식이요법에 대한 지시를 포함해주세요.
```

#### 3-33번 배치 (50개): health-therapy 유창 묘사
```
건강(health) 도메인의 therapy(치료) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 재활센터(polite,rehabilitation center) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
다양한 치료법과 재활 과정에 대한 전문적 묘사를 포함해주세요.
```

#### 3-34번 배치 (50개): health 종합 (preventive care, mental health, alternative medicine, research, public health 포함)
```
건강(health) 도메인에서 preventive care(예방의학), mental health(정신건강), alternative medicine(대체의학), research(연구), public health(공중보건) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 묘사(description) 30%, 질문(question) 25%, 지시(instruction) 20%, 의견표현(opinion) 25%로 구성해주세요.
상황은 정중하고 의료 기관(polite,medical institution) 50%, 정중하고 연구소(polite,research institute) 30%, 정중하고 보건소(polite,health center) 20%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-35번 배치 (50개): technology-AI 유창 의견표현
```
기술(technology) 도메인의 AI(인공지능) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 기술 컨퍼런스(polite,tech conference) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
인공지능의 사회적 영향과 윤리적 문제에 대한 전문적 의견을 포함해주세요.
```

#### 3-36번 배치 (50개): technology-robotics 고급 묘사
```
기술(technology) 도메인의 robotics(로봇공학) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 로봇 연구소(polite,robotics lab) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
최첨단 로봇 기술과 자동화 시스템에 대한 전문적 묘사를 포함해주세요.
```

#### 3-37번 배치 (50개): technology-blockchain 유창 질문
```
기술(technology) 도메인의 blockchain(블록체인) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 핀테크 회사(polite,fintech company) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
분산원장 기술과 암호화폐에 대한 전문적 질문을 포함해주세요.
```

#### 3-38번 배치 (50개): technology 종합 (cybersecurity, cloud computing, IoT, data science, quantum computing 포함)
```
기술(technology) 도메인에서 cybersecurity(사이버보안), cloud computing(클라우드 컴퓨팅), IoT(사물인터넷), data science(데이터과학), quantum computing(양자컴퓨팅) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 50%, 유창(fluent) 50%로 구성해주세요.
목적은 의견표현(opinion) 25%, 묘사(description) 25%, 질문(question) 25%, 지시(instruction) 25%로 구성해주세요.
상황은 정중하고 기술 컨퍼런스(polite,tech conference) 40%, 정중하고 연구소(polite,research institute) 35%, 정중하고 IT 회사(polite,IT company) 25%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-39번 배치 (50개): culture-philosophy 유창 의견표현
```
문화(culture) 도메인의 philosophy(철학) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 철학 세미나(polite,philosophy seminar) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
존재론적 문제와 윤리학적 딜레마에 대한 심도 있는 의견을 포함해주세요.
```

#### 3-40번 배치 (50개): culture-anthropology 고급 묘사
```
문화(culture) 도메인의 anthropology(인류학) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 인류학 박물관(polite,anthropology museum) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
인류 문명과 사회 구조에 대한 학술적 묘사를 포함해주세요.
```

#### 3-41번 배치 (50개): culture 종합 (sociology, literature, fine arts, archaeology, linguistics 포함)
```
문화(culture) 도메인에서 sociology(사회학), literature(문학), fine arts(미술), archaeology(고고학), linguistics(언어학) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 질문(question) 20%, 감정표현(emotion) 15%, 제안(suggestion) 10%로 구성해주세요.
상황은 정중하고 대학교(polite,university) 40%, 정중하고 박물관(polite,museum) 35%, 정중하고 문화센터(polite,cultural center) 25%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-42번 배치 (50개): entertainment-cinema 유창 의견표현
```
엔터테인먼트(entertainment) 도메인의 cinema(영화학) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 영화제(polite,film festival) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
영화 이론과 시네마토그래피에 대한 전문적 의견을 포함해주세요.
```

#### 3-43번 배치 (50개): entertainment-performance 고급 묘사
```
엔터테인먼트(entertainment) 도메인의 performance(공연) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 오페라하우스(polite,opera house) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
고급 공연 예술과 무대 예술에 대한 미학적 묘사를 포함해주세요.
```

#### 3-44번 배치 (50개): entertainment 종합 (theater, dance, digital media, broadcasting, comedy 포함)
```
엔터테인먼트(entertainment) 도메인에서 theater(연극), dance(무용), digital media(디지털 미디어), broadcasting(방송), comedy(코미디) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 감정표현(emotion) 20%, 질문(question) 15%, 제안(suggestion) 10%로 구성해주세요.
상황은 정중하고 예술센터(polite,arts center) 40%, 정중하고 방송국(polite,broadcast station) 35%, 정중하고 극장(polite,theater) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 3-45번 배치 (50개): nature-ecology 유창 묘사
```
자연(nature) 도메인의 ecology(생태학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 생태연구소(polite,ecology institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
생태계의 복잡한 상호작용과 환경 보전에 대한 과학적 묘사를 포함해주세요.
```

#### 3-46번 배치 (50개): nature-conservation 고급 의견표현
```
자연(nature) 도메인의 conservation(보전) 카테고리에서 고급(advanced) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 환경 컨퍼런스(polite,environmental conference) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
기후 변화와 생물 다양성 보호에 대한 전문적 의견을 포함해주세요.
```

#### 3-47번 배치 (50개): nature 종합 (marine biology, forestry, geology, astronomy, environmental science 포함)
```
자연(nature) 도메인에서 marine biology(해양생물학), forestry(삼림학), geology(지질학), astronomy(천문학), environmental science(환경과학) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 50%, 유창(fluent) 50%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 질문(question) 20%, 지시(instruction) 15%, 제안(suggestion) 10%로 구성해주세요.
상황은 정중하고 연구소(polite,research institute) 40%, 정중하고 천문대(polite,observatory) 30%, 정중하고 자연사박물관(polite,natural history museum) 30%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-48번 배치 (50개): sports-physiology 유창 질문
```
스포츠(sports) 도메인의 physiology(운동생리학) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 스포츠과학연구소(polite,sports science institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
운동 능력과 신체 적응에 대한 과학적 질문을 포함해주세요.
```

#### 3-49번 배치 (50개): sports-psychology 고급 지시
```
스포츠(sports) 도메인의 psychology(스포츠 심리학) 카테고리에서 고급(advanced) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 스포츠 심리상담실(polite,sports psychology clinic) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
정신력 강화와 경기력 향상을 위한 전문적 지시를 포함해주세요.
```

#### 3-50번 배치 (50개): sports-biomechanics 유창 묘사
```
스포츠(sports) 도메인의 biomechanics(운동역학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 운동역학 연구소(polite,biomechanics lab) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
인체 역학과 운동 기술 분석에 대한 과학적 묘사를 포함해주세요.
```

#### 3-51번 배치 (50개): sports 종합 (professional athletics, coaching, sports medicine, rehabilitation, performance analysis 포함)
```
스포츠(sports) 도메인에서 professional athletics(프로 스포츠), coaching(코칭), sports medicine(스포츠의학), rehabilitation(재활), performance analysis(경기력 분석) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 60%, 유창(fluent) 40%로 구성해주세요.
목적은 지시(instruction) 25%, 묘사(description) 25%, 질문(question) 20%, 의견표현(opinion) 15%, 제안(suggestion) 15%로 구성해주세요.
상황은 정중하고 스포츠 의학센터(polite,sports medicine center) 40%, 정중하고 올림픽 트레이닝센터(polite,olympic training center) 35%, 정중하고 스포츠과학연구소(polite,sports science institute) 25%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 3-52번 배치 (50개): other-philosophy 유창 의견표현
```
기타(other) 도메인의 philosophy(철학) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 철학 학회(polite,philosophy conference) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
형이상학과 윤리학의 근본 문제에 대한 심층적 의견을 포함해주세요.
```

#### 3-53번 배치 (50개): other-psychology 고급 질문
```
기타(other) 도메인의 psychology(심리학) 카테고리에서 고급(advanced) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 심리학 연구소(polite,psychology institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
인지과학과 행동 심리학에 대한 전문적 질문을 포함해주세요.
```

#### 3-54번 배치 (50개): other-sociology 유창 묘사
```
기타(other) 도메인의 sociology(사회학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 사회학 학술대회(polite,sociology symposium) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
사회 구조와 집단 역학에 대한 학술적 묘사를 포함해주세요.
```

#### 3-55번 배치 (50개): other-economics 고급 의견표현
```
기타(other) 도메인의 economics(경제학) 카테고리에서 고급(advanced) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 경제 연구소(polite,economic institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
거시경제학과 시장 이론에 대한 전문적 의견을 포함해주세요.
```

#### 3-56번 배치 (50개): other-ethics 유창 질문
```
기타(other) 도메인의 ethics(윤리학) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 윤리학 세미나(polite,ethics seminar) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
도덕 철학과 응용 윤리학에 대한 심화 질문을 포함해주세요.
```

#### 3-57번 배치 (50개): other-globalization 고급 묘사
```
기타(other) 도메인의 globalization(세계화) 카테고리에서 고급(advanced) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 국제관계연구소(polite,international relations institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 30%로 구성해주세요.
국제 정치경제와 문화 교류에 대한 분석적 묘사를 포함해주세요.
```

#### 3-58번 배치 (50개): other-sustainability 유창 의견표현
```
기타(other) 도메인의 sustainability(지속가능성) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 지속가능발전 포럼(polite,sustainability forum) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 동사(verb) 35%, 명사(noun) 25%로 구성해주세요.
환경 정책과 사회적 책임에 대한 전문적 의견을 포함해주세요.
```

#### 3-59번 배치 (50개): other 종합 (urbanization, demographics, social movements, gender studies, religious studies 포함)
```
기타(other) 도메인에서 urbanization(도시화), demographics(인구통계학), social movements(사회운동), gender studies(젠더학), religious studies(종교학) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 50%, 유창(fluent) 50%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 질문(question) 20%, 감정표현(emotion) 15%, 제안(suggestion) 10%로 구성해주세요.
상황은 정중하고 사회과학연구소(polite,social science institute) 40%, 정중하고 학술 심포지엄(polite,academic symposium) 35%, 정중하고 정책연구원(polite,policy institute) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 3-60번 배치 (50개): 전체 도메인 고급 종합 (daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other 포함)
```
전체 12개 도메인(daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other)을 포괄하는 고급 종합 데이터를 50개 생성해주세요.
난이도는 고급(advanced) 40%, 유창(fluent) 60%로 구성해주세요.
목적은 의견표현(opinion) 25%, 묘사(description) 25%, 질문(question) 20%, 지시(instruction) 15%, 감정표현(emotion) 15%로 구성해주세요.
상황은 정중하고 학술 기관(polite,academic institution) 35%, 정중하고 전문 컨퍼런스(polite,professional conference) 35%, 정중하고 연구소(polite,research institute) 30%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
3단계 마무리 배치로서 전문적이고 학술적인 수준의 종합 데이터를 생성해주세요.
```

### 📊 Stage 3 총 배치 현황 (60개 배치 완료):
- daily 도메인: 11개 배치 (3-1 ~ 3-11)
- food 도메인: 5개 배치 (3-12 ~ 3-16)
- education 도메인: 5개 배치 (3-17 ~ 3-21)
- travel 도메인: 4개 배치 (3-22 ~ 3-25)
- business 도메인: 5개 배치 (3-26 ~ 3-30)
- health 도메인: 4개 배치 (3-31 ~ 3-34)
- technology 도메인: 4개 배치 (3-35 ~ 3-38)
- culture 도메인: 3개 배치 (3-39 ~ 3-41)
- entertainment 도메인: 3개 배치 (3-42 ~ 3-44)
- nature 도메인: 3개 배치 (3-45 ~ 3-47)
- sports 도메인: 4개 배치 (3-48 ~ 3-51)
- other 도메인: 8개 배치 (3-52 ~ 3-59)
- 전체 종합: 1개 배치 (3-60)

---

## 🎯 Stage 4 (4-1 ~ 4-40번 배치): 유창-전문 수준 (2,000개)

#### 4-1번 배치 (50개): daily-lifestyle 전문 의견표현
```
일상생활(daily) 도메인의 lifestyle(라이프스타일) 카테고리에서 전문(technical) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 라이프스타일 컨설팅(polite,lifestyle consulting) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
개인 맞춤형 생활 방식과 웰빙 철학에 대한 전문적 의견을 포함해주세요.
```

#### 4-2번 배치 (50개): daily-mindfulness 유창 묘사
```
일상생활(daily) 도메인의 mindfulness(마음챙김) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 명상센터(polite,meditation center) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 35%, 동사(verb) 25%로 구성해주세요.
의식적 삶과 정신적 웰빙에 대한 심층적 묘사를 포함해주세요.
```

#### 4-3번 배치 (50개): daily-productivity 전문 지시
```
일상생활(daily) 도메인의 productivity(생산성) 카테고리에서 전문(technical) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 생산성 컨설팅(polite,productivity consulting) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
고급 시간 관리와 효율성 최적화 기법에 대한 전문적 지시를 포함해주세요.
```

#### 4-4번 배치 (50개): daily 종합 (work-life integration, digital wellness, sustainable living 포함)
```
일상생활(daily) 도메인에서 work-life integration(일과 삶의 통합), digital wellness(디지털 웰빙), sustainable living(지속가능한 생활) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 60%, 전문(technical) 40%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 지시(instruction) 25%, 질문(question) 20%로 구성해주세요.
상황은 정중하고 웰빙 센터(polite,wellness center) 40%, 정중하고 라이프코칭(polite,life coaching) 35%, 정중하고 지속가능성 컨설팅(polite,sustainability consulting) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 4-5번 배치 (50개): food-molecular 전문 묘사
```
음식(food) 도메인의 molecular(분자요리) 카테고리에서 전문(technical) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 분자요리 연구소(polite,molecular gastronomy lab) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 45%, 형용사(adjective) 30%, 동사(verb) 25%로 구성해주세요.
분자요리학과 혁신적 조리 기법에 대한 과학적 묘사를 포함해주세요.
```

#### 4-6번 배치 (50개): food-sustainability 유창 의견표현
```
음식(food) 도메인의 sustainability(지속가능성) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 식품정책연구소(polite,food policy institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
식량 시스템과 환경 영향에 대한 전문적 의견을 포함해주세요.
```

#### 4-7번 배치 (50개): food 종합 (food science, nutrition research, culinary innovation 포함)
```
음식(food) 도메인에서 food science(식품과학), nutrition research(영양학 연구), culinary innovation(요리 혁신) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 질문(question) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 식품연구소(polite,food research institute) 50%, 정중하고 요리학교(polite,culinary institute) 30%, 정중하고 영양학회(polite,nutrition society) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-8번 배치 (50개): education-pedagogy 전문 질문
```
교육(education) 도메인의 pedagogy(교육학) 카테고리에서 전문(technical) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 교육학 연구소(polite,pedagogy institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
고급 교육 이론과 학습 방법론에 대한 학술적 질문을 포함해주세요.
```

#### 4-9번 배치 (50개): education-technology 유창 지시
```
교육(education) 도메인의 technology(교육기술) 카테고리에서 유창(fluent) 난이도의 지시(instruction) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 에듀테크 회사(polite,edtech company) 환경에서 사용하는 표현으로 만들어주세요.
품사는 동사(verb) 50%, 명사(noun) 30%, 부사(adverb) 20%로 구성해주세요.
AI 기반 학습과 디지털 교육 플랫폼에 대한 전문적 지시를 포함해주세요.
```

#### 4-10번 배치 (50개): education 종합 (educational psychology, curriculum design, assessment theory 포함)
```
교육(education) 도메인에서 educational psychology(교육심리학), curriculum design(교육과정 설계), assessment theory(평가 이론) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 60%, 전문(technical) 40%로 구성해주세요.
목적은 질문(question) 30%, 의견표현(opinion) 25%, 지시(instruction) 25%, 묘사(description) 20%로 구성해주세요.
상황은 정중하고 교육연구소(polite,education research institute) 50%, 정중하고 대학원(polite,graduate school) 30%, 정중하고 교육정책기관(polite,education policy agency) 20%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-11번 배치 (50개): travel-hospitality 전문 묘사
```
여행(travel) 도메인의 hospitality(호스피탈리티) 카테고리에서 전문(technical) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 럭셔리 호텔 경영진(polite,luxury hotel management) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 40%, 명사(noun) 35%, 동사(verb) 25%로 구성해주세요.
최고급 서비스와 고객 경험 관리에 대한 전문적 묘사를 포함해주세요.
```

#### 4-12번 배치 (50개): travel-sustainable 유창 의견표현
```
여행(travel) 도메인의 sustainable(지속가능 관광) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 관광정책연구소(polite,tourism policy institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
책임 있는 관광과 지역 사회 영향에 대한 전문적 의견을 포함해주세요.
```

#### 4-13번 배치 (50개): travel 종합 (tourism management, cultural preservation, economic impact 포함)
```
여행(travel) 도메인에서 tourism management(관광 경영), cultural preservation(문화 보존), economic impact(경제적 영향) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 질문(question) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 관광청(polite,tourism board) 40%, 정중하고 호텔경영대학원(polite,hospitality graduate school) 35%, 정중하고 문화유산보존기관(polite,heritage conservation agency) 25%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-14번 배치 (50개): business-strategic 전문 의견표현
```
비즈니스(business) 도메인의 strategic(전략경영) 카테고리에서 전문(technical) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 전략컨설팅(polite,strategic consulting) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
글로벌 비즈니스 전략과 경쟁 우위에 대한 최고 수준의 의견을 포함해주세요.
```

#### 4-15번 배치 (50개): business-finance 유창 질문
```
비즈니스(business) 도메인의 finance(금융) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 투자은행(polite,investment bank) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
복잡한 금융 상품과 리스크 관리에 대한 전문적 질문을 포함해주세요.
```

#### 4-16번 배치 (50개): business 종합 (mergers & acquisitions, corporate governance, digital transformation 포함)
```
비즈니스(business) 도메인에서 mergers & acquisitions(인수합병), corporate governance(기업지배구조), digital transformation(디지털 전환) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 40%, 전문(technical) 60%로 구성해주세요.
목적은 의견표현(opinion) 30%, 질문(question) 25%, 묘사(description) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 이사회(polite,board of directors) 50%, 정중하고 경영대학원(polite,business school) 30%, 정중하고 컨설팅펌(polite,consulting firm) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-17번 배치 (50개): health-precision 전문 묘사
```
건강(health) 도메인의 precision(정밀의료) 카테고리에서 전문(technical) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 정밀의료센터(polite,precision medicine center) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 45%, 형용사(adjective) 30%, 동사(verb) 25%로 구성해주세요.
개인 맞춤형 치료와 유전자 치료에 대한 최첨단 의학적 묘사를 포함해주세요.
```

#### 4-18번 배치 (50개): health-bioethics 유창 의견표현
```
건강(health) 도메인의 bioethics(생명윤리) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 생명윤리위원회(polite,bioethics committee) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
의료 윤리와 생명과학 연구의 도덕적 딜레마에 대한 전문적 의견을 포함해주세요.
```

#### 4-19번 배치 (50개): health 종합 (public health policy, epidemiology, health informatics 포함)
```
건강(health) 도메인에서 public health policy(공중보건정책), epidemiology(역학), health informatics(보건정보학) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 질문(question) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 보건복지부(polite,ministry of health) 40%, 정중하고 의과대학(polite,medical school) 35%, 정중하고 질병관리청(polite,disease control center) 25%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-20번 배치 (50개): technology-quantum 전문 질문
```
기술(technology) 도메인의 quantum(양자컴퓨팅) 카테고리에서 전문(technical) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 양자컴퓨팅연구소(polite,quantum computing institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
양자역학과 차세대 컴퓨팅 기술에 대한 최첨단 질문을 포함해주세요.
```

#### 4-21번 배치 (50개): technology-biotech 유창 묘사
```
기술(technology) 도메인의 biotech(생명공학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 바이오테크회사(polite,biotech company) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 35%, 동사(verb) 25%로 구성해주세요.
유전자 편집과 합성생물학에 대한 혁신적 기술 묘사를 포함해주세요.
```

#### 4-22번 배치 (50개): technology 종합 (nanotechnology, renewable energy, space technology 포함)
```
기술(technology) 도메인에서 nanotechnology(나노기술), renewable energy(재생에너지), space technology(우주기술) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 40%, 전문(technical) 60%로 구성해주세요.
목적은 묘사(description) 30%, 질문(question) 25%, 의견표현(opinion) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 과학기술연구원(polite,science & technology institute) 50%, 정중하고 우주항공청(polite,space agency) 30%, 정중하고 에너지연구소(polite,energy research institute) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-23번 배치 (50개): culture-semiotics 전문 의견표현
```
문화(culture) 도메인의 semiotics(기호학) 카테고리에서 전문(technical) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 기호학연구소(polite,semiotics institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
문화 기호와 의미 체계에 대한 고도로 추상적인 의견을 포함해주세요.
```

#### 4-24번 배치 (50개): culture-aesthetics 유창 묘사
```
문화(culture) 도메인의 aesthetics(미학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 미학연구소(polite,aesthetics institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 35%, 동사(verb) 25%로 구성해주세요.
예술 철학과 미적 경험에 대한 심층적 미학적 묘사를 포함해주세요.
```

#### 4-25번 배치 (50개): culture 종합 (cultural studies, media theory, postmodernism 포함)
```
문화(culture) 도메인에서 cultural studies(문화연구), media theory(미디어 이론), postmodernism(포스트모더니즘) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 의견표현(opinion) 35%, 묘사(description) 25%, 질문(question) 20%, 감정표현(emotion) 20%로 구성해주세요.
상황은 정중하고 문화연구소(polite,cultural studies institute) 50%, 정중하고 미디어대학원(polite,media graduate school) 30%, 정중하고 예술철학학회(polite,art philosophy society) 20%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 4-26번 배치 (50개): entertainment-multimedia 전문 묘사
```
엔터테인먼트(entertainment) 도메인의 multimedia(멀티미디어) 카테고리에서 전문(technical) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 멀티미디어제작사(polite,multimedia production) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 45%, 형용사(adjective) 30%, 동사(verb) 25%로 구성해주세요.
차세대 미디어 기술과 인터랙티브 콘텐츠에 대한 혁신적 묘사를 포함해주세요.
```

#### 4-27번 배치 (50개): entertainment-experience 유창 의견표현
```
엔터테인먼트(entertainment) 도메인의 experience(체험) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 체험디자인연구소(polite,experience design institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
몰입형 엔터테인먼트와 사용자 경험에 대한 전문적 의견을 포함해주세요.
```

#### 4-28번 배치 (50개): entertainment 종합 (virtual reality, augmented reality, interactive media 포함)
```
엔터테인먼트(entertainment) 도메인에서 virtual reality(가상현실), augmented reality(증강현실), interactive media(인터랙티브 미디어) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 40%, 전문(technical) 60%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 질문(question) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 VR/AR연구소(polite,VR/AR institute) 50%, 정중하고 게임개발회사(polite,game development company) 30%, 정중하고 미디어아트센터(polite,media art center) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-29번 배치 (50개): nature-climate 전문 의견표현
```
자연(nature) 도메인의 climate(기후과학) 카테고리에서 전문(technical) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 기후변화연구소(polite,climate change institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
기후 모델링과 지구 온난화에 대한 최첨단 과학적 의견을 포함해주세요.
```

#### 4-30번 배치 (50개): nature-biodiversity 유창 묘사
```
자연(nature) 도메인의 biodiversity(생물다양성) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 생물다양성연구센터(polite,biodiversity research center) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 35%, 동사(verb) 25%로 구성해주세요.
종 보전과 생태계 서비스에 대한 과학적 묘사를 포함해주세요.
```

#### 4-31번 배치 (50개): nature 종합 (ecosystem dynamics, conservation biology, environmental modeling 포함)
```
자연(nature) 도메인에서 ecosystem dynamics(생태계 역학), conservation biology(보전생물학), environmental modeling(환경 모델링) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 질문(question) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 환경과학연구소(polite,environmental science institute) 50%, 정중하고 자연보전기구(polite,nature conservation organization) 30%, 정중하고 생태학회(polite,ecological society) 20%로 구성해주세요.
품사는 명사(noun) 35%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-32번 배치 (50개): sports-performance 전문 질문
```
스포츠(sports) 도메인의 performance(경기력) 카테고리에서 전문(technical) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 스포츠과학센터(polite,sports science center) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
고성능 운동 분석과 최적화 전략에 대한 최첨단 질문을 포함해주세요.
```

#### 4-33번 배치 (50개): sports-analytics 유창 묘사
```
스포츠(sports) 도메인의 analytics(스포츠 분석학) 카테고리에서 유창(fluent) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 스포츠데이터연구소(polite,sports data institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 40%, 형용사(adjective) 35%, 동사(verb) 25%로 구성해주세요.
빅데이터와 AI를 활용한 경기 분석에 대한 전문적 묘사를 포함해주세요.
```

#### 4-34번 배치 (50개): sports 종합 (sports technology, athlete development, performance optimization 포함)
```
스포츠(sports) 도메인에서 sports technology(스포츠 기술), athlete development(선수 발달), performance optimization(경기력 최적화) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 50%, 전문(technical) 50%로 구성해주세요.
목적은 질문(question) 30%, 묘사(description) 25%, 의견표현(opinion) 25%, 지시(instruction) 20%로 구성해주세요.
상황은 정중하고 국가대표훈련원(polite,national training center) 50%, 정중하고 스포츠기술연구소(polite,sports technology institute) 30%, 정중하고 올림픽위원회(polite,olympic committee) 20%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 형용사(adjective) 25%, 기타(other) 10%로 구성해주세요.
```

#### 4-35번 배치 (50개): other-neuroscience 전문 의견표현
```
기타(other) 도메인의 neuroscience(신경과학) 카테고리에서 전문(technical) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 뇌과학연구소(polite,neuroscience institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
뇌 기능과 의식에 대한 최첨단 신경과학적 의견을 포함해주세요.
```

#### 4-36번 배치 (50개): other-cognitive 유창 질문
```
기타(other) 도메인의 cognitive(인지과학) 카테고리에서 유창(fluent) 난이도의 질문(question) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 인지과학연구소(polite,cognitive science institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 의문사(interrogative) 40%, 명사(noun) 30%, 동사(verb) 30%로 구성해주세요.
인간 인지와 정보 처리에 대한 심화 질문을 포함해주세요.
```

#### 4-37번 배치 (50개): other-quantum 전문 묘사
```
기타(other) 도메인의 quantum(양자물리학) 카테고리에서 전문(technical) 난이도의 묘사(description) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 양자물리연구소(polite,quantum physics institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 명사(noun) 45%, 형용사(adjective) 30%, 동사(verb) 25%로 구성해주세요.
양자역학과 다차원 물리학에 대한 고도로 전문적인 묘사를 포함해주세요.
```

#### 4-38번 배치 (50개): other-complexity 유창 의견표현
```
기타(other) 도메인의 complexity(복잡계과학) 카테고리에서 유창(fluent) 난이도의 의견표현(opinion) 목적 데이터를 50개 생성해주세요.
상황은 정중하고 복잡계연구소(polite,complexity science institute) 환경에서 사용하는 표현으로 만들어주세요.
품사는 형용사(adjective) 45%, 동사(verb) 30%, 명사(noun) 25%로 구성해주세요.
창발성과 비선형 시스템에 대한 전문적 의견을 포함해주세요.
```

#### 4-39번 배치 (50개): other 종합 (systems thinking, interdisciplinary studies, future studies 포함)
```
기타(other) 도메인에서 systems thinking(시스템 사고), interdisciplinary studies(학제간 연구), future studies(미래학) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 40%, 전문(technical) 60%로 구성해주세요.
목적은 의견표현(opinion) 35%, 질문(question) 25%, 묘사(description) 25%, 감정표현(emotion) 15%로 구성해주세요.
상황은 정중하고 미래연구소(polite,future studies institute) 40%, 정중하고 학제간연구센터(polite,interdisciplinary research center) 35%, 정중하고 시스템연구소(polite,systems institute) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
```

#### 4-40번 배치 (50개): 전체 도메인 전문가 수준 종합 (daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other 포함)
```
전체 12개 도메인(daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other)을 포괄하는 전문가 수준 종합 데이터를 50개 생성해주세요.
난이도는 유창(fluent) 30%, 전문(technical) 70%로 구성해주세요.
목적은 의견표현(opinion) 30%, 묘사(description) 25%, 질문(question) 20%, 지시(instruction) 15%, 감정표현(emotion) 10%로 구성해주세요.
상황은 정중하고 국제학술대회(polite,international academic conference) 40%, 정중하고 연구기관(polite,research institution) 35%, 정중하고 전문가 포럼(polite,expert forum) 25%로 구성해주세요.
품사는 명사(noun) 30%, 형용사(adjective) 30%, 동사(verb) 25%, 기타(other) 15%로 구성해주세요.
4단계 최종 배치로서 모든 분야의 최고 수준 전문성을 종합한 데이터를 생성해주세요.
```

### 📊 Stage 4 총 배치 현황 (40개 배치 완료):
- daily 도메인: 4개 배치 (4-1 ~ 4-4)
- food 도메인: 3개 배치 (4-5 ~ 4-7)
- education 도메인: 3개 배치 (4-8 ~ 4-10)
- travel 도메인: 3개 배치 (4-11 ~ 4-13)
- business 도메인: 3개 배치 (4-14 ~ 4-16)
- health 도메인: 3개 배치 (4-17 ~ 4-19)
- technology 도메인: 3개 배치 (4-20 ~ 4-22)
- culture 도메인: 3개 배치 (4-23 ~ 4-25)
- entertainment 도메인: 3개 배치 (4-26 ~ 4-28)
- nature 도메인: 3개 배치 (4-29 ~ 4-31)
- sports 도메인: 3개 배치 (4-32 ~ 4-34)
- other 도메인: 5개 배치 (4-35 ~ 4-39)
- 전체 종합: 1개 배치 (4-40)

---

## 🎉 전체 시스템 완성 요약

### 📈 총 시스템 현황 (200개 배치, 10,000개 데이터):
- **Stage 1 (기초-중급)**: 40개 배치, 2,000개 데이터 ✅
- **Stage 2 (중급-고급)**: 60개 배치, 3,000개 데이터 ✅
- **Stage 3 (고급-유창)**: 60개 배치, 3,000개 데이터 ✅
- **Stage 4 (유창-전문)**: 40개 배치, 2,000개 데이터 ✅

### 🌍 다언어 지원: 한국어, 영어, 일본어, 중국어, 스페인어
### 📊 완전한 요소 분포: 180개 카테고리, 5개 난이도, 10개 품사, 12개 목적, 13개 상황 조합

이제 모든 200개 배치의 개별 지침이 완성되어 체계적인 AI 데이터 생성이 가능합니다!
