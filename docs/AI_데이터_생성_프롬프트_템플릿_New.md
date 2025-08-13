# AI 데이터 생성 프롬프트 템플릿 New (완전 독립형)

## 📋 완전 독립형 프롬프트 템플릿

이 템플릿은 **다른 문서에 의존하지 않고** 완전히 독립적으로 다국어 학습 플랫폼 데이터를 생성할 수 있습니다.

## 🎯 기본 프롬프트 구조

```markdown
다국어 학습 플랫폼용 데이터 {COUNT}개를 생성해주세요.

**배치 정보:**
- 배치 번호: {BATCH_NUMBER}
- 도메인: {DOMAIN} ({DOMAIN_KR})
- 카테고리: {CATEGORY} ({CATEGORY_KR})
- 난이도: {DIFFICULTY} ({DIFFICULTY_KR})
- 목적: {PURPOSE} ({PURPOSE_KR})
- 상황: {SITUATION} ({SITUATION_KR})
- 품사 비율: {POS_RATIO}
- 주제 설명: {TOPIC_DESCRIPTION}

**필수 생성 규칙:**

1. **concept_id 형식**: {domain}_{word}_{meaning} (예: daily_hello_greeting)
2. **5개 언어 완전 지원**: 한국어, 영어, 일본어, 중국어, 스페인어
3. **3개 컬렉션 동시 생성**:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문 (완전한 문장)
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문 (완전한 문장)
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문 (완전한 문장)

**절대 준수사항:**
- **concept_id 일관성**: 동일 concept_id는 3개 컬렉션에서 모두 같은 단어 사용
- **예문 차별화**: 동일 concept_id의 3개 컬렉션 예문은 완전히 달라야 함
- **완전한 문장**: 모든 예문은 주어+동사 포함, 문법적으로 완성된 문장으로 작성
- **정확한 필드 수**: concepts(58개), examples(16개), grammar(31개)
- **품사 비율 정확**: 지정된 비율 정확히 반영
- **CSV 형식**: 쉼표 포함 필드는 "쌍따옴표" 감싸기, UTF-8 인코딩

**분할 생성 방식:**
1단계: concepts 파일만 {COUNT}개 생성
2단계: examples 파일만 {COUNT}개 생성  
3단계: grammar 파일만 {COUNT}개 생성
```

## 🔧 전체 시스템 설정값

### Domain 옵션 (12개)
```
daily (일상생활), food (음식), education (교육), travel (여행)
business (비즈니스), health (건강), technology (기술), culture (문화)
entertainment (엔터테인먼트), nature (자연), sports (스포츠), other (기타)
```

### Category 옵션 (도메인별)
```
daily: routine, family, household, shopping, communication, emotions, time, clothing, leisure, morning, evening, weekend, work, personal, social
food: cooking, restaurants, ingredients, beverages, nutrition, snacks, seafood, fruits, vegetables, desserts, meat, dairy, spices, dining, recipes
education: teaching, learning, classroom, students, subjects, curriculum, assessment, textbooks, exams, grades, homework, research, library, university, college, school, scholarship, academic
travel: transportation, accommodation, sightseeing, directions, booking, luggage, customs, currency, weather, maps, guides, attractions, souvenirs, emergency, language
business: meeting, communication, presentation, negotiation, contracts, finance, marketing, teamwork, leadership, planning, reports, emails, sales, management
health: symptoms, treatment, exercise, nutrition, medicine, hospital, doctor, appointment, wellness, prevention, mental, recovery, checkup, emergency, surgery
technology: devices, software, applications, internet, programming, data, security, artificial, social, mobile, gaming, cloud, communication, innovation, automation, research, development
culture: heritage, arts_crafts, national_identity, ceremony, etiquette, festivals, traditions, customs, beliefs, values, history, literature, music, film
entertainment: movies, music, games, books, theater, art, comedy, drama, dance, concerts, shows, celebrities, media, streaming, hobbies
nature: animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability
sports: football, basketball, swimming, running, cycling, tennis, baseball, fitness, teams, competitions, athletes, training, equipment, rules, victories
other: philosophy, psychology, sociology, economics, politics, law, ethics, globalization, urbanization, demographics, social_movements, gender_studies, religious_studies, sustainability, time, numbers, colors, shapes, size, emotions, personality, relationships, clothing, hobbies, money, transportation, communication, emergency, environment
```

### Difficulty 옵션 (5개)
```
basic (기초): 초보자용 기본 표현
intermediate (중급): 일상 대화 가능 수준
advanced (고급): 복잡한 주제 토론 가능
fluent (유창): 원어민 수준 자연스러운 표현
technical (전문): 전문분야 학술적 표현
```

### Purpose 옵션 (12개)
```
greeting (인사): 인사말과 소개
question (질문): 궁금증과 정보 요청  
request (요청): 부탁과 도움 요청
suggestion (제안): 제안과 권유
emotion (감정표현): 감정과 느낌 전달
instruction (지시/설명): 방법과 절차 안내
description (묘사/설명): 상황과 특성 설명
gratitude (감사표현): 감사와 고마움
opinion (의견표현): 생각과 견해
agreement (동의): 찬성과 동의
apology (사과): 사과와 양해 구함
refusal (거절): 거절과 사양
```

### Situation 조합 (13개 패턴)
```
예의 수준: casual (캐주얼), polite (정중), formal (공식)
장소: home (집), social (사회적 장소), work (직장), public (공공장소), store (상점)

조합 예시:
casual,home - 편안한 집 환경
polite,work - 정중한 업무 환경
formal,public - 공식적인 공공장소
casual,social - 편안한 사회적 상황
polite,store - 정중한 상점 환경
```

### Part of Speech 옵션 (11개)
```
noun (명사): 사물, 개념의 이름
verb (동사): 행동, 상태 표현
adjective (형용사): 성질, 상태 수식
adverb (부사): 동사, 형용사 수식
preposition (전치사/조사): 관계 표현
conjunction (접속사): 문장 연결
determiner (한정사): 명사 한정
pronoun (대명사): 명사 대신 사용
interrogative (의문사): 질문 표현
interjection (감탄사): 감정 표현
other (기타): 구문, 관용구 등
```

## 📊 정확한 CSV 헤더 (필수 암기)

### Concepts CSV (58개 필드)
```csv
concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
```

### Examples CSV (16개 필드)
```csv
concept_id,domain,category,difficulty,situation,purpose,korean,english,japanese,chinese,spanish,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

### Grammar CSV (31개 필드)
```csv
concept_id,domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,korean_example,english_title,english_structure,english_description,english_example,japanese_title,japanese_structure,japanese_description,japanese_example,chinese_title,chinese_structure,chinese_description,chinese_example,spanish_title,spanish_structure,spanish_description,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

## 🎯 200개 배치 완전 설정값

### 1단계: 기초 구축 (1-1 ~ 1-40번 배치)

#### 1-1번 배치
```
{BATCH_NUMBER} = "1-1번 배치"
{DOMAIN} = "daily", {DOMAIN_KR} = "일상생활"
{CATEGORY} = "routine", {CATEGORY_KR} = "일과"
{DIFFICULTY} = "basic", {DIFFICULTY_KR} = "기초"
{PURPOSE} = "greeting", {PURPOSE_KR} = "인사"
{SITUATION} = "casual,home", {SITUATION_KR} = "캐주얼하고 집"
{POS_RATIO} = "verb 40%, noun 30%, interjection 30%"
{TOPIC_DESCRIPTION} = "아침 인사, 일과 시작 표현 등을 포함해주세요"
```

#### 1-2번 배치
```
{BATCH_NUMBER} = "1-2번 배치"
{DOMAIN} = "daily", {DOMAIN_KR} = "일상생활"
{CATEGORY} = "family", {CATEGORY_KR} = "가족"
{DIFFICULTY} = "basic", {DIFFICULTY_KR} = "기초"
{PURPOSE} = "question", {PURPOSE_KR} = "질문"
{SITUATION} = "casual,home", {SITUATION_KR} = "캐주얼하고 집"
{POS_RATIO} = "interrogative 40%, verb 30%, noun 30%"
{TOPIC_DESCRIPTION} = "가족 구성원에 대한 기본적인 질문을 포함해주세요"
```

#### 1-3번 배치
```
{BATCH_NUMBER} = "1-3번 배치"
{DOMAIN} = "daily", {DOMAIN_KR} = "일상생활"
{CATEGORY} = "household", {CATEGORY_KR} = "가사"
{DIFFICULTY} = "basic", {DIFFICULTY_KR} = "기초"
{PURPOSE} = "request", {PURPOSE_KR} = "요청"
{SITUATION} = "polite,home", {SITUATION_KR} = "정중하고 집"
{POS_RATIO} = "verb 40%, noun 30%, adverb 30%"
{TOPIC_DESCRIPTION} = "가사일 요청 표현을 포함해주세요"
```

#### 1-4번 배치
```
{BATCH_NUMBER} = "1-4번 배치"
{DOMAIN} = "daily", {DOMAIN_KR} = "일상생활"
{CATEGORY} = "shopping", {CATEGORY_KR} = "쇼핑"
{DIFFICULTY} = "basic", {DIFFICULTY_KR} = "기초"
{PURPOSE} = "emotion", {PURPOSE_KR} = "감정표현"
{SITUATION} = "casual,store", {SITUATION_KR} = "캐주얼하고 상점"
{POS_RATIO} = "adjective 40%, interjection 30%, noun 30%"
{TOPIC_DESCRIPTION} = "쇼핑할 때의 감정과 반응을 포함해주세요"
```

#### 1-5번 배치
```
{BATCH_NUMBER} = "1-5번 배치"
{DOMAIN} = "daily", {DOMAIN_KR} = "일상생활"
{CATEGORY} = "communication", {CATEGORY_KR} = "소통"
{DIFFICULTY} = "basic", {DIFFICULTY_KR} = "기초"
{PURPOSE} = "suggestion", {PURPOSE_KR} = "제안"
{SITUATION} = "polite,social", {SITUATION_KR} = "정중하고 사회적"
{POS_RATIO} = "verb 40%, other 30%, noun 30%"
{TOPIC_DESCRIPTION} = "일상적인 제안과 권유 표현을 포함해주세요"
```

### [계속해서 200개 배치까지...]

## ⚡ 빠른 생성 가이드

### 1단계: Concepts 파일 생성
```markdown
위 프롬프트에 다음 변수를 대입하여 concepts 파일만 먼저 생성:
- {COUNT} = "20" (길이 제한 방지)
- 해당 배치의 모든 변수값 대입
- "1단계: concepts 파일만 생성해주세요" 추가
```

### 2단계: Examples 파일 생성  
```markdown
동일한 concept_id 목록으로 examples 파일 생성:
- "2단계: examples 파일만 생성해주세요" 
- "이전에 생성한 concept_id와 동일한 단어 사용" 명시
```

### 3단계: Grammar 파일 생성
```markdown
동일한 concept_id 목록으로 grammar 파일 생성:
- "3단계: grammar 파일만 생성해주세요"
- "이전에 생성한 concept_id와 동일한 단어 사용" 명시
```

## 🎨 5개 언어 표준 가이드

### 발음 표기법 (브라우저 호환)
- **Korean**: `a-chim`, `an-nyeong` (하이픈 구분, 로마자)
- **English**: `/ˈmɔːrnɪŋ/`, `/weɪk/` (IPA 표기)
- **Chinese**: `zao chen`, `ni hao` (pinyin, 성조 없음)
- **Japanese**: `asa`, `konnichiwa` (로마자 헵번식)
- **Spanish**: `ma-nya-na`, `o-la` (하이픈 구분, 로마자)

### 예문 작성 원칙
- **Concepts**: 단순 명확한 기본 의미 (완전한 문장)
- **Examples**: 실제 상황의 자연스러운 사용 (완전한 문장)
- **Grammar**: 교육적 문법 설명과 패턴 (완전한 문장)

**🚫 잘못된 예문**: "Warm greeting" → ✅ "I give you a warm greeting."

### CSV 쉼표 처리
```csv
korean,english
"안녕하세요, 반갑습니다","Hello, nice to meet you"
```

### 빈 필드 처리 규칙
- **데이터 없는 경우**: '없음' 대신 빈 칸("") 사용
- **일관된 표현**: 모든 언어에서 동일한 방식 적용
- **예시**: 반의어가 없는 경우 antonyms 필드는 빈 칸으로 처리

## ✅ 완성도 체크리스트

### 생성 전 확인
- [ ] 배치 변수값 정확 대입
- [ ] CSV 헤더 필드 수 확인 (58/16/31)
- [ ] 품사 비율 계산 정확성
- [ ] 주제 설명 구체성
- [ ] 빈 필드 처리 규칙 적용 ('없음' 대신 빈 칸)

### 생성 후 검증
- [ ] concept_id 형식 정확성
- [ ] 동일 concept_id 단어 일관성
- [ ] 예문 차별화 적용
- [ ] 모든 예문이 완전한 문장 형태 (주어+동사 포함, 문법적으로 완성)
- [ ] 5개 언어 완전 포함
- [ ] 쉼표 포함 필드 따옴표 처리
- [ ] UTF-8 BOM 없음(UTF-8 without BOM) 인코딩 적용
- [ ] 문자 깨짐 방지 확인 (한중일 문자 정상 표시)

이 템플릿으로 **완전 독립적인 데이터 생성**이 가능하며, 모든 필수 정보와 설정값을 포함하고 있습니다.
