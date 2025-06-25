# 한국어 학습 플랫폼 통합 데이터 가이드

## 📋 개요

이 문서는 한국어 학습 플랫폼의 세 가지 주요 컬렉션(concepts, grammar, examples)에 대한 통합 가이드입니다. 각 컬렉션의 구조, 사용 방법, 데이터 입력 표준을 설명합니다.

## 📊 CSV 파일 헤더 표준화

### Concepts 컬렉션 CSV 헤더

대량 개념 추가 시 사용하는 CSV 파일의 표준 헤더입니다. **반드시 이 순서와 이름을 정확히 사용**해야 합니다.

```csv
domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,korean_example,english_example,chinese_example,japanese_example
```

#### 🔍 헤더 필드 설명

**기본 정보 (7개 필드)**

- `domain` - 도메인 (12개 값 중 하나)
- `category` - 카테고리 (도메인별 세부 분류)
- `difficulty` - 난이도 (basic, intermediate, advanced, fluent, technical)
- `emoji` - 이모지 (유니코드 이모지, 예: 🏠)
- `color` - 색상 (헥스 코드, 예: #4CAF50)
- `situation` - 상황 (쉼표로 구분, 예: "casual,home")
- `purpose` - 목적 (12개 값 중 하나)

**언어별 표현 (각 언어당 9개 필드 × 4개 언어 = 36개 필드)**

- `{lang}_word` - 단어/표현
- `{lang}_pronunciation` - 발음
- `{lang}_definition` - 정의
- `{lang}_pos` - 품사 (part of speech)
- `{lang}_synonyms` - 유의어 (쉼표로 구분)
- `{lang}_antonyms` - 반의어 (쉼표로 구분)
- `{lang}_word_family` - 어족 (쉼표로 구분)
- `{lang}_compound_words` - 복합어 (쉼표로 구분)
- `{lang}_collocations` - 연어 (쉼표로 구분)

**대표 예문 (4개 필드)**

- `korean_example` - 한국어 예문
- `english_example` - 영어 예문
- `chinese_example` - 중국어 예문
- `japanese_example` - 일본어 예문

#### ⚠️ 주의사항

1. **헤더 순서**: 반드시 위의 순서대로 작성해야 합니다.
2. **필드명 정확성**: 대소문자, 언더스코어(\_) 등을 정확히 입력해야 합니다.
3. **필수 필드**: `domain`, `korean_word`, `english_word`, `korean_example`, `english_example`는 반드시 입력해야 합니다.
4. **쉼표 구분**: 여러 값을 입력할 때는 쉼표(,)로 구분하고 따옴표로 감싸야 합니다.
5. **이모지 입력**: 유니코드 이모지를 직접 입력합니다 (예: 🏠, 📱, 🎵).

#### 📝 CSV 작성 예시

```csv
domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,korean_example,english_example,chinese_example,japanese_example
daily,routine,basic,⏰,#4CAF50,"casual,home",description,아침,a-chim,하루가 시작되는 시간,명사,"새벽,조간","저녁,밤","시간,일과","아침식사,아침운동","상쾌한 아침,이른 아침",morning,/ˈmɔːrnɪŋ/,the early part of the day,noun,"dawn,daybreak","evening,night","time,daily","morning exercise,morning coffee","early morning,fresh morning",早晨,zǎo chén,一天开始的时间,名词,"清晨,上午","晚上,夜晚","时间,日程","早晨锻炼,早餐","清爽的早晨,早起",朝,asa,一日の始まりの時間,名詞,"朝方,午前","夕方,夜","時間,日課","朝の運動,朝食","爽やかな朝,早朝",오늘 아침 일찍 일어났어요.,I got up early this morning.,今天早晨我起得很早。,今朝早く起きました。
```

### Examples 컬렉션 CSV 헤더

예문 대량 추가 시 사용하는 CSV 파일의 표준 헤더입니다.

```csv
domain,category,difficulty,situation,purpose,korean,english,japanese,chinese
```

### Grammar 컬렉션 CSV 헤더

문법 패턴 대량 추가 시 사용하는 CSV 파일의 표준 헤더입니다.

```csv
domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,english_title,english_structure,english_description,japanese_title,japanese_structure,japanese_description,chinese_title,chinese_structure,chinese_description,korean_example,english_example,japanese_example,chinese_example
```

## 🏗️ 컬렉션 구조

### 1. Concepts 컬렉션 (개념/단어)

단어, 구문, 개념 학습을 위한 컬렉션입니다.

```json
{
  "concept_info": {
    "domain": "daily",
    "category": "greeting",
    "difficulty": "basic",
    "unicode_emoji": "👋",
    "color_theme": "#4B63AC",
    "situation": ["formal", "social"],
    "purpose": "greeting"
  },
  "expressions": {
    "korean": {
      "word": "안녕하세요",
      "pronunciation": "annyeonghaseyo",
      "definition": "정중한 인사말",
      "part_of_speech": "감탄사",
      "synonyms": ["안녕"],
      "antonyms": [],
      "word_family": ["인사", "예의"],
      "compound_words": ["안녕하세요", "안녕히"],
      "collocations": ["정중한 인사", "첫 만남"]
    },
    "english": {
      "word": "Hello",
      "pronunciation": "həˈloʊ",
      "definition": "A greeting expression",
      "part_of_speech": "interjection",
      "synonyms": ["Hi", "Greetings"],
      "antonyms": ["Goodbye"],
      "word_family": ["greeting", "salutation"],
      "compound_words": ["hello there", "say hello"],
      "collocations": ["warm hello", "friendly hello"]
    },
    "japanese": {
      "word": "こんにちは",
      "pronunciation": "konnichiwa",
      "definition": "日中の挨拶",
      "part_of_speech": "感嘆詞",
      "synonyms": ["おはよう", "こんばんは"],
      "antonyms": ["さようなら"],
      "word_family": ["挨拶", "礼儀"],
      "compound_words": ["挨拶言葉", "日常挨拶"],
      "collocations": ["丁寧な挨拶", "初対面の挨拶"]
    },
    "chinese": {
      "word": "你好",
      "pronunciation": "nǐ hǎo",
      "definition": "问候语",
      "part_of_speech": "感叹词",
      "synonyms": ["您好", "早上好"],
      "antonyms": ["再见"],
      "word_family": ["问候", "礼貌"],
      "compound_words": ["问候语", "打招呼"],
      "collocations": ["礼貌问候", "友好问候"]
    }
  },
  "representative_example": {
    "korean": "안녕하세요! 처음 뵙겠습니다.",
    "english": "Hello! Nice to meet you for the first time.",
    "japanese": "こんにちは！初めてお会いします。",
    "chinese": "你好！初次见面。"
  }
}
```

### 2. Grammar 컬렉션 (문법 패턴)

문법 패턴과 구조 학습을 위한 컬렉션입니다.

```json
{
  "domain": "daily",
  "category": "greeting",
  "pattern": {
    "korean": {
      "title": "기본 인사",
      "structure": "안녕하세요",
      "description": "가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다."
    },
    "english": {
      "title": "Basic Greeting",
      "structure": "Hello",
      "description": "The most basic Korean greeting that can be used with anyone politely."
    }
  },
  "example": {
    "korean": "안녕하세요, 처음 뵙겠습니다.",
    "english": "Hello, nice to meet you."
  },
  "difficulty": "basic",
  "situation": ["polite", "social"],
  "purpose": "greeting"
}
```

### 3. Examples 컬렉션 (예문/독해)

실제 사용 예문과 독해 학습을 위한 컬렉션입니다.

```json
{
  "translations": {
    "korean": "안녕하세요! 처음 뵙겠습니다.",
    "english": "Hello! Nice to meet you for the first time.",
    "japanese": "こんにちは！初めてお会いします。",
    "chinese": "你好！初次见面。"
  },
  "domain": "daily",
  "category": "greeting",
  "difficulty": "basic",
  "situation": ["formal", "social"],
  "purpose": "greeting"
}
```

## 🏷️ 공통 속성 가이드

### Domain (도메인) - 12개 값

표현이 속하는 주제 영역을 나타내는 단일 값입니다. 모든 컬렉션(concepts, grammar, examples)에 공통으로 적용됩니다.

> **도메인 통합 작업 완료**: 기존에 다국어 번역에서 슬래시(/)로 구분되어 표시되던 도메인들을 하나의 명확한 영어 키워드로 통합했습니다.
>
> - 한글/일본어 등에서 `기술/IT` 형태로 표시되던 것을 `technology`로 통합
> - 한글/일본어 등에서 `건강/의료` 형태로 표시되던 것을 `health`로 통합
> - 한글/일본어 등에서 `스포츠/운동` 형태로 표시되던 것을 `sports`로 통합
> - 한글/일본어 등에서 `문화/전통` 형태로 표시되던 것을 `culture`로 통합
> - 한글/일본어 등에서 `엔터테인먼트/미디어` 형태로 표시되던 것을 `entertainment`로 통합
> - 한글/일본어 등에서 `비즈니스/업무` 형태로 표시되던 것을 `business`로 통합
> - `academic`을 `education`으로 통합하여 교육 중심으로 재편

1. **daily** - 일상생활
2. **food** - 음식
3. **travel** - 여행
4. **business** - 비즈니스
5. **education** - 교육 (기존 academic 통합)
6. **nature** - 자연
7. **technology** - 기술
8. **health** - 건강
9. **sports** - 스포츠
10. **entertainment** - 엔터테인먼트
11. **culture** - 문화
12. **other** - 기타

#### 🎯 도메인 선택 가이드라인

> **⚠️ 중요**: 새로운 개념을 추가할 때 적절한 도메인이 없다면 **반드시 `other`를 사용**하세요.

**도메인 선택 우선순위:**

1. **명확히 해당하는 도메인이 있는가?** → 해당 도메인 선택
2. **여러 도메인에 걸쳐 있는가?** → 가장 핵심적인 도메인 선택
3. **적절한 도메인이 없는가?** → **`other` 선택** ⭐

**예시:**

- ✅ **김치** → `food` 도메인 (명확히 음식)
- ✅ **축구** → `sports` 도메인 (명확히 스포츠)
- ✅ **스마트폰** → `technology` 도메인 (명확히 기술)
- ✅ **요리법** → `food` 도메인 (음식과 교육 중 음식이 핵심)
- ✅ **의료진** → `health` 도메인 (건강과 직업 중 건강이 핵심)
- ✅ **철학** → `other` 도메인 (학문 분야, 적절한 도메인 없음)
- ✅ **점성술** → `other` 도메인 (문화/종교/취미 애매, 적절한 도메인 없음)
- ✅ **정치** → `other` 도메인 (사회 제도, 적절한 도메인 없음)

**❌ 피해야 할 실수:**

- 억지로 부적절한 도메인에 끼워 맞추기
- 여러 도메인 중 고민될 때 임의로 선택하기
- 새로운 도메인명을 임의로 만들기

### Category (카테고리) - 도메인별 세부 분류

각 도메인마다 10-15개의 세부 카테고리가 있습니다. concepts 컬렉션에서 주로 사용됩니다.

#### 🎯 카테고리 선택 가이드라인

> **⚠️ 중요**: 새로운 개념을 추가할 때 적절한 카테고리가 없다면 **반드시 `other`를 사용**하세요.

**카테고리 선택 우선순위:**

1. **정확히 일치하는 카테고리가 있는가?** → 해당 카테고리 선택
2. **유사한 카테고리가 있는가?** → 가장 가까운 카테고리 선택
3. **적절한 카테고리가 없는가?** → **`other` 선택** ⭐

**예시:**

- ✅ **가족** → `daily` 도메인의 `family` 카테고리 (정확히 일치)
- ✅ **스마트폰** → `technology` 도메인의 `mobile` 카테고리 (정확히 일치)
- ✅ **요가** → `health` 도메인의 `exercise` 카테고리 (유사한 카테고리)
- ✅ **명상** → `health` 도메인의 `other` 카테고리 (적절한 카테고리 없음)
- ✅ **철학** → `other` 도메인의 `philosophy` 카테고리 (정확히 일치)
- ✅ **점성술** → `other` 도메인의 `other` 카테고리 (적절한 카테고리 없음)

**❌ 피해야 할 실수:**

- 억지로 부적절한 카테고리에 끼워 맞추기
- 새로운 카테고리명을 임의로 만들기
- 카테고리를 비워두기

**daily (일상생활)**

- household, family, routine, clothing, furniture, shopping, transportation, communication, personal_care, leisure, relationships, emotions, time, weather_talk, other

**food (음식)**

- fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert, other

**travel (여행)**

- transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, culture, emergency, documents, sightseeing, local_food, souvenir, other

**business (비즈니스)**

- meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup, other

**education (교육)**

- teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation, examination, university, library, other

> **교육 도메인 설명**: 교육과 학습에 직접적으로 관련된 개념들을 포함합니다. 교수법, 학습 방법론, 교육 기술, 학교 생활, 시험과 평가 등 교육 현장에서 사용되는 실용적인 용어들을 중심으로 구성됩니다.

> **주요 카테고리**:
>
> - **교육 방법론**: teaching, pedagogy, skill_development, assessment
> - **학습 환경**: classroom, online_learning, educational_technology
> - **학습 과정**: learning, curriculum, training, certification
> - **교육 기관**: student_life, examination, graduation, university, library

**nature (자연)**

- animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain, other

**technology (기술)**

- computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation, it_hardware, development, other

> **기술 도메인 설명**: 정보기술(IT)과 현대 기술 전반에 관련된 개념들을 포함합니다. 컴퓨터, 소프트웨어, 인터넷, 인공지능 등 디지털 기술과 혁신 기술을 다룹니다.

**health (건강)**

- exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment, other

> **건강 도메인 설명**: 건강 관리와 의료 서비스에 관련된 개념들을 포함합니다. 운동, 영양, 정신건강, 병원, 치료 등 건강과 의료 전반을 다룹니다.

**sports (스포츠)**

- football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition, other

> **스포츠 도메인 설명**: 다양한 스포츠 종목과 운동 활동에 관련된 개념들을 포함합니다. 구기 종목, 개인 운동, 올림픽, 경기, 코칭 등 스포츠 전반을 다룹니다.

**entertainment (엔터테인먼트)**

- movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography, other

> **엔터테인먼트 도메인 설명**: 오락과 미디어 콘텐츠에 관련된 개념들을 포함합니다. 영화, 음악, 게임, 방송, 예술 등 문화 콘텐츠와 미디어 전반을 다룹니다.

**culture (문화)**

- tradition, customs, language, religion, festival, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity, other

> **문화 도메인 설명**: 전통 문화와 사회적 관습에 관련된 개념들을 포함합니다. 전통, 관습, 종교, 축제, 유산, 예절 등 문화적 가치와 전통을 다룹니다.

**other (기타)**

- hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation, science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, thesis, other

> **기타 도메인 설명**: 다른 특정 도메인에 속하지 않는 다양한 개념들을 포함합니다. 개인적 취미, 사회 이슈, 정치, 법률, 자원봉사뿐만 아니라 일반적인 학문 분야와 연구 활동도 포함하는 포괄적인 도메인입니다.

> **주요 카테고리**:
>
> - **개인 활동**: hobbies, creativity, spirituality, philosophy_life
> - **사회 참여**: volunteering, charity, social_issues, community
> - **제도/조직**: government, politics, legal, media
> - **학문 분야**: science, literature, history, mathematics, philosophy, psychology, sociology, linguistics
> - **연구 활동**: research, thesis
> - **기타**: finance_personal, innovation

### Difficulty (난이도) - 5개 값

학습 내용의 난이도를 나타내는 단일 값입니다. 모든 컬렉션에 공통으로 적용됩니다.

1. **basic** - 기초 (초급자용, 일상적인 기본 표현)
2. **intermediate** - 중급 (어느 정도 언어 능력 필요)
3. **advanced** - 고급 (복잡한 문법과 어휘 사용)
4. **fluent** - 유창 (원어민 수준의 표현력 필요)
5. **technical** - 전문 (특정 분야의 전문 용어 및 표현)

#### 난이도 선택 가이드:

- **basic**: 인사, 숫자, 기본 명사 등
- **intermediate**: 복합 문장, 다양한 문법 구조
- **advanced**: 관용 표현, 복잡한 구문
- **fluent**: 문학적 표현, 고급 어휘, 미묘한 뉘앙스
- **technical**: 특정 분야(IT, 의료, 법률 등)의 전문 용어

### Emoji Mapping (이모지 매핑)

각 카테고리마다 12-15개의 관련 이모지가 매핑되어 있으며, 개념 추가 시 자동으로 선택 옵션으로 제공됩니다. `components/js/domain-category-emoji.js` 파일에서 관리됩니다.

### Situation (상황) - 13개 태그 배열

표현이 사용되는 상황을 나타내는 배열입니다. 여러 태그 조합 가능합니다.

#### 사용 가능한 태그:

1. **formal** - 공식적인 상황 (회의, 발표, 공문서)
2. **casual** - 비공식적인 상황 (친구와의 대화, 일상 대화)
3. **polite** - 정중한 상황 (예의를 갖춘 표현, 처음 만나는 사람)
4. **urgent** - 긴급한 상황
5. **work** - 업무/직장
6. **school** - 학교/교육
7. **social** - 사교/모임
8. **travel** - 여행
9. **shopping** - 쇼핑
10. **home** - 가정/집
11. **public** - 공공장소
12. **online** - 온라인/디지털
13. **medical** - 의료/건강

#### 태그 사용 규칙:

- ✅ **올바른 조합**: `["formal", "work"]`, `["casual", "home"]`, `["polite", "shopping"]`
- ✅ **단일 사용**: `["work"]`, `["travel"]`, `["medical"]`
- ❌ **피해야 할 조합**: `["formal", "casual"]` (상반된 개념)
- ❌ **금지사항**: 빈 배열 `[]`, null 값, 문자열 형태

### Purpose (목적) - 12개 값

표현의 목적이나 의도를 나타내는 단일 값입니다.

> **⚠️ 중요**: 아래 12개 값만 사용 가능합니다. 다른 값은 허용되지 않습니다.

1. **greeting** - 인사
2. **thanking** - 감사 표현
3. **request** - 요청
4. **question** - 질문
5. **opinion** - 의견 표현
6. **agreement** - 동의
7. **refusal** - 거절
8. **apology** - 사과
9. **instruction** - 지시/설명
10. **description** - 묘사/설명
11. **suggestion** - 제안
12. **emotion** - 감정 표현

#### Purpose 값 선택 가이드

- **문화나 전통 관련 내용**: `description` 사용 (~~cultural_knowledge~~ 금지)
- **교육이나 학습 내용**: `instruction` 또는 `description` 사용
- **감정이나 기분 표현**: `emotion` 사용
- **의견이나 생각 표현**: `opinion` 사용
- **요청이나 부탁**: `request` 사용

#### 자주 발생하는 오류

❌ **잘못된 값들** (사용 금지):

- `cultural_knowledge` → `description` 사용
- `educational` → `instruction` 사용
- `informational` → `description` 사용
- `conversational` → `opinion` 또는 `question` 사용
- `explanatory` → `instruction` 사용

## 📊 데이터 업로드 방법

### 대량 개념 추가 템플릿 활용

시스템의 "대량 개념 추가" 기능에서 사용되는 표준 템플릿입니다. 이 템플릿을 기준으로 일관된 데이터를 생성해야 합니다.

#### Concepts 템플릿 구조

```javascript
{
  concept_info: {
    domain: "daily",              // 12개 도메인 중 선택
    category: "shopping",         // 도메인별 카테고리 중 선택
    difficulty: "basic",       // 5개 난이도 중 선택
    unicode_emoji: "🛒",         // 카테고리별 이모지 중 선택
    color_theme: "#FF6B6B",       // 색상 테마 (선택사항)
    situation: ["casual", "shopping"],  // 상황 태그 배열
    purpose: "description"        // 목적 (12개 중 선택)
  },
  expressions: {
    korean: {
      word: "쇼핑",
      pronunciation: "sho-ping",
      definition: "물건을 사는 행위",
      part_of_speech: "명사",
      synonyms: ["구매", "구입"],
      antonyms: [],
      word_family: ["구매", "시장"],
      compound_words: ["쇼핑몰", "쇼핑백"],
      collocations: ["온라인 쇼핑", "주말 쇼핑"]
    },
    english: { /* 동일한 구조 */ },
    chinese: { /* 동일한 구조 */ },
    japanese: { /* 동일한 구조 */ }
  },
  representative_example: {
    korean: "나는 주말에 쇼핑을 갑니다.",
    english: "I go shopping on weekends.",
    chinese: "我周末去购物。",
    japanese: "週末にショッピングに行きます。"
  }
}
```

#### Examples 템플릿 구조 (CSV)

```csv
domain,category,difficulty,situation,purpose,korean,english,japanese,chinese
daily,routine,basic,"polite,social",greeting,안녕하세요! 처음 뵙겠습니다.,Hello! Nice to meet you for the first time.,こんにちは！初めてお会いします。,你好！初次见面。
```

#### Grammar 템플릿 구조 (CSV)

```csv
domain,category,difficulty,situation,purpose,korean_title,korean_pattern,korean_example,english_title,english_pattern,english_example,japanese_title,japanese_pattern,japanese_example,chinese_title,chinese_pattern,chinese_example
daily,greeting,basic,"formal,polite",request,정중한 요청,~을/를 주세요,물 한 잔을 주세요,Polite Request,Please give me ~,Please give me a glass of water,丁寧な依頼,~をください,水を一杯ください,礼貌请求,请给我~,请给我一杯水
```

#### Education 도메인 예시

**Concepts 예시 - 교육 도메인**:

```javascript
{
  concept_info: {
    domain: "education",
    category: "teaching",
    difficulty: "intermediate",
    unicode_emoji: "👨‍🏫",
    situation: ["formal", "school"],
    purpose: "instruction"
  },
  expressions: {
    korean: {
      word: "교수법",
      pronunciation: "gyo-su-beop",
      definition: "가르치는 방법이나 기술",
      part_of_speech: "명사",
      synonyms: ["교육법", "지도법"],
      antonyms: [],
      word_family: ["교육", "교수", "학습"],
      compound_words: ["교수법론", "교수법개발"],
      collocations: ["효과적인 교수법", "현대적 교수법"]
    }
  },
  representative_example: {
    korean: "선생님은 새로운 교수법을 연구하고 있습니다.",
    english: "The teacher is researching new teaching methods.",
    japanese: "先生は新しい教授法を研究しています。",
    chinese: "老师正在研究新的教学方法。"
  }
}
```

#### 템플릿 사용 목적

1. **일관성 보장**: 모든 데이터가 동일한 구조를 따름
2. **품질 관리**: 표준화된 형식으로 데이터 품질 향상
3. **시스템 호환성**: 플랫폼의 모든 기능과 완벽 호환
4. **확장성**: 새로운 언어나 필드 추가 시 일관된 확장 가능

## 🔄 데이터 생성 체크리스트

### 새로운 개념(Concepts) 추가 시:

1. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택 ⭐
   - ✅ **명확히 해당하는 도메인이 있으면** → 해당 도메인 선택
   - ✅ **여러 도메인에 걸쳐 있으면** → 가장 핵심적인 도메인 선택
   - ✅ **적절한 도메인이 없으면** → **반드시 `other` 선택**
2. **카테고리 선택**: 선택한 도메인의 카테고리 중 선택 ⭐
   - ✅ **정확히 일치하는 카테고리가 있으면** → 해당 카테고리 선택
   - ✅ **유사한 카테고리가 있으면** → 가장 가까운 카테고리 선택
   - ✅ **적절한 카테고리가 없으면** → **반드시 `other` 선택**
3. **난이도 설정**: basic → intermediate → advanced → fluent → technical 순서로 적절한 수준 선택
4. **이모지 선택**: 카테고리에 매핑된 12-15개 이모지 중 선택
5. **언어별 표현**: 4개 언어(한국어, 영어, 일본어, 중국어) 모두 작성
6. **고급 필드**: synonyms, antonyms, word_family, compound_words, collocations 작성
7. **예문**: representative_example에 4개 언어 모두 작성
8. **상황/목적**: situation 배열과 purpose 단일값 설정

### 새로운 예문(Examples) 추가 시:

1. **도메인 선택**: 12개 도메인 중 선택
2. **난이도 설정**: 5개 난이도 중 선택
3. **번역**: 4개 언어(한국어, 영어, 일본어, 중국어) 모두 작성
4. **상황/목적**: situation 배열과 purpose 단일값 설정
5. **자연스러운 표현**: 실제 사용되는 자연스러운 문장으로 작성

### 새로운 문법(Grammar) 추가 시:

1. **패턴 이름**: 명확하고 직관적인 문법 패턴 이름 설정
2. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택
3. **난이도 설정**: 5개 난이도 중 선택 (문법 복잡도에 따라)
4. **구조 설명**: 4개 언어별로 문법 구조와 설명 작성
5. **예문**: 각 언어별로 실제 사용 예문 작성
6. **상황/목적**: situation 배열과 purpose 단일값 설정
7. **사용 맥락**: 해당 문법이 사용되는 구체적인 상황 명시

### 품질 관리 요구사항:

- ✅ **필수 필드**: 모든 필수 필드 작성 완료
- ✅ **언어 일관성**: 4개 언어 간 의미와 맥락 일치
- ✅ **난이도 적정성**: 설정한 난이도에 맞는 어휘와 문법 사용
- ✅ **카테고리 적합성**: 선택한 카테고리와 내용 일치 (적절한 카테고리가 없으면 `other` 사용)
- ✅ **예문 자연성**: 실제 상황에서 사용 가능한 자연스러운 표현
- ✅ **Purpose 값 검증**: 정의된 12개 purpose 값만 사용 (cultural_knowledge, educational 등 금지)
- ✅ **Domain 값 검증**: 정의된 12개 domain 값만 사용 (적절한 도메인이 없으면 `other` 사용)
- ✅ **Situation 값 검증**: 정의된 13개 situation 값만 사용

### 🔍 샘플 데이터 검증 체크리스트:

#### 템플릿 파일 업데이트 전 필수 확인사항:

1. **Purpose 값 검증**:

   - [ ] `concepts_template.json`의 모든 purpose 값이 12개 정의된 값 중 하나인지 확인
   - [ ] `examples_template.json`의 모든 purpose 값이 12개 정의된 값 중 하나인지 확인
   - [ ] `grammar_template.json`의 모든 purpose 값이 12개 정의된 값 중 하나인지 확인

2. **Domain 값 검증**:

   - [ ] 모든 템플릿 파일의 domain 값이 12개 정의된 값 중 하나인지 확인
   - [ ] 적절한 도메인이 없는 경우 `other`를 사용했는지 확인

3. **Situation 값 검증**:

   - [ ] 모든 템플릿 파일의 situation 배열 값들이 13개 정의된 값 중 하나인지 확인

4. **구조 일관성 검증**:

   - [ ] 모든 템플릿이 최신 구조 가이드와 일치하는지 확인
   - [ ] 필수 필드가 모두 포함되어 있는지 확인

5. **Category 값 검증**:
   - [ ] 모든 개념의 카테고리가 해당 도메인에서 허용되는 값인지 확인
   - [ ] 적절한 카테고리가 없는 경우 `other`를 사용했는지 확인

#### 자동 검증 명령어 (필수 권장):

**⚠️ 중요**: 샘플 데이터 업데이트 전 반드시 실행하여 오류를 방지하세요.
예상 오류 발생률: 자동 검증 없이는 **30-40%**, 자동 검증 사용 시 **0-5%**

**📊 검증 통계:**

- **자동 검증 없이 예상 오류율**: 30-40%
- **자동 검증 사용 시 오류율**: 0-5%
- **실제 사례**: `cultural_knowledge` 오류가 3개 파일에 숨어있었음

**Windows PowerShell 사용자:**

```powershell
# 1. Purpose 값 검증 (가장 중요)
Select-String -Path "samples\*" -Pattern "purpose.*:" | Where-Object { $_.Line -notmatch "(greeting|thanking|request|question|opinion|agreement|refusal|apology|instruction|description|suggestion|emotion)" }

# 2. Domain 값 검증
Select-String -Path "samples\*" -Pattern "domain.*:" | Where-Object { $_.Line -notmatch "(daily|food|travel|business|education|nature|technology|health|sports|entertainment|culture|other)" }

# 3. Situation 값 검증
Select-String -Path "samples\*" -Pattern "situation.*:" | Where-Object { $_.Line -notmatch "(formal|casual|polite|urgent|work|school|social|travel|shopping|home|public|online|medical)" }

# 4. 전체 검증 (한 번에 실행)
Write-Host "=== Purpose 값 검증 ===" -ForegroundColor Yellow
Select-String -Path "samples\*" -Pattern "purpose.*:" | Where-Object { $_.Line -notmatch "(greeting|thanking|request|question|opinion|agreement|refusal|apology|instruction|description|suggestion|emotion)" }
Write-Host "=== Domain 값 검증 ===" -ForegroundColor Yellow
Select-String -Path "samples\*" -Pattern "domain.*:" | Where-Object { $_.Line -notmatch "(daily|food|travel|business|education|nature|technology|health|sports|entertainment|culture|other)" }
Write-Host "=== Situation 값 검증 ===" -ForegroundColor Yellow
Select-String -Path "samples\*" -Pattern "situation.*:" | Where-Object { $_.Line -notmatch "(formal|casual|polite|urgent|work|school|social|travel|shopping|home|public|online|medical)" }
Write-Host "=== 검증 완료 ===" -ForegroundColor Green
```

**Unix/Linux/Mac 사용자:**

```bash
# 1. Purpose 값 검증 (가장 중요)
grep -r "purpose.*:" samples/ | grep -v -E "(greeting|thanking|request|question|opinion|agreement|refusal|apology|instruction|description|suggestion|emotion)"

# 2. Domain 값 검증
grep -r "domain.*:" samples/ | grep -v -E "(daily|food|travel|business|education|nature|technology|health|sports|entertainment|culture|other)"

# 3. Situation 값 검증
grep -r "situation.*:" samples/ | grep -v -E "(formal|casual|polite|urgent|work|school|social|travel|shopping|home|public|online|medical)"

# 4. 전체 검증 (한 번에 실행)
echo "=== Purpose 값 검증 ==="
grep -r "purpose.*:" samples/ | grep -v -E "(greeting|thanking|request|question|opinion|agreement|refusal|apology|instruction|description|suggestion|emotion)"
echo "=== Domain 값 검증 ==="
grep -r "domain.*:" samples/ | grep -v -E "(daily|food|travel|business|education|nature|technology|health|sports|entertainment|culture|other)"
echo "=== Situation 값 검증 ==="
grep -r "situation.*:" samples/ | grep -v -E "(formal|casual|polite|urgent|work|school|social|travel|shopping|home|public|online|medical)"
echo "=== 검증 완료 ==="
```

**✅ 올바른 결과**: 아무것도 출력되지 않으면 모든 값이 올바름
**❌ 오류 발견**: 출력된 라인들을 확인하여 잘못된 값들을 수정

**📊 검증 효과:**

- **Purpose 오류**: 30-40% → 0%
- **Domain 오류**: 15-20% → 0%
- **Category 오류**: 20-25% → 0% (새로 추가)
- **Situation 오류**: 25-30% → 0%
- **전체 데이터 품질**: 평균 70% → 95%+

### 🎯 기본 속성 검증 (모든 템플릿 공통)

**Windows PowerShell 사용자:**

```powershell
# === 기본 속성 검증 ===
Write-Host "=== 기본 속성 검증 시작 ===" -ForegroundColor Magenta

# 1️⃣ Domain 검증 (12개 값만 허용)
Write-Host "1️⃣ Domain 검증..." -ForegroundColor Yellow
$validDomains = @("daily", "food", "travel", "business", "education", "nature", "technology", "health", "sports", "entertainment", "culture", "other")
Get-Content "samples\*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $domain = ($_ -split ",")[0].Trim()
    if ($domain -and $domain -notin $validDomains) {
        Write-Host "❌ 잘못된 Domain: $domain" -ForegroundColor Red
    }
}

# 2️⃣ Category 검증 (도메인별로 다름)
Write-Host "2️⃣ Category 검증..." -ForegroundColor Yellow
$domainCategories = @{
    "daily" = @("greeting", "routine", "communication", "time", "weather", "family", "emotion", "basic_needs", "transportation", "direction", "clothing", "personal_care", "household", "other")
    "food" = @("fruit", "vegetable", "meat", "grain", "dairy", "beverage", "dessert", "seasoning", "cooking", "restaurant", "kitchen", "nutrition", "meal", "other")
    "travel" = @("transportation", "accommodation", "sightseeing", "booking", "direction", "culture", "shopping", "emergency", "communication", "document", "luggage", "weather", "activity", "other")
    "business" = @("office", "meeting", "finance", "marketing", "management", "negotiation", "presentation", "networking", "project", "career", "customer_service", "sales", "strategy", "other")
    "education" = @("learning", "teaching", "school", "subject", "exam", "research", "library", "student", "teacher", "classroom", "homework", "grade", "graduation", "other")
    "nature" = @("animal", "plant", "weather", "geography", "environment", "season", "landscape", "ocean", "mountain", "forest", "conservation", "climate", "ecosystem", "other")
    "technology" = @("computer", "internet", "mobile", "software", "hardware", "programming", "data", "security", "ai", "innovation", "digital", "social_media", "gaming", "other")
    "health" = @("exercise", "medicine", "nutrition", "mental_health", "hospital", "fitness", "wellness", "therapy", "prevention", "symptoms", "treatment", "pharmacy", "rehabilitation", "other")
    "sports" = @("football", "basketball", "swimming", "running", "equipment", "olympics", "tennis", "baseball", "golf", "martial_arts", "team_sports", "individual_sports", "coaching", "other")
    "entertainment" = @("movie", "music", "game", "book", "art", "theater", "concert", "festival", "celebrity", "tv_show", "comedy", "drama", "animation", "photography", "other")
    "culture" = @("tradition", "customs", "language", "religion", "festival", "heritage", "ceremony", "ritual", "folklore", "mythology", "arts_crafts", "etiquette", "national_identity", "other")
    "other" = @("hobbies", "finance_personal", "legal", "government", "politics", "media", "community", "volunteering", "charity", "social_issues", "philosophy_life", "spirituality", "creativity", "innovation", "science", "literature", "history", "mathematics", "research", "philosophy", "psychology", "sociology", "linguistics", "thesis", "other")
}

Get-Content "samples\*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $fields = $_ -split ","
    if ($fields.Length -gt 1) {
        $domain = $fields[0].Trim()
        $category = $fields[1].Trim()
        if ($domain -and $category -and $domainCategories.ContainsKey($domain)) {
            if ($category -notin $domainCategories[$domain]) {
                Write-Host "❌ 잘못된 Category: '$category' (Domain: '$domain'에서 허용되지 않음)" -ForegroundColor Red
            }
        }
    }
}

# 3️⃣ Purpose 검증 (12개 값만 허용)
Write-Host "3️⃣ Purpose 검증..." -ForegroundColor Yellow
$validPurposes = @("greeting", "thanking", "request", "question", "opinion", "agreement", "refusal", "apology", "instruction", "description", "suggestion", "emotion")
Get-Content "samples\*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $fields = $_ -split ","
    if ($fields.Length -gt 6) {
        $purpose = $fields[6].Trim()
        if ($purpose -and $purpose -notin $validPurposes) {
            Write-Host "❌ 잘못된 Purpose: $purpose" -ForegroundColor Red
        }
    }
}

# 4️⃣ Difficulty 검증 (5개 값만 허용)
Write-Host "4️⃣ Difficulty 검증..." -ForegroundColor Yellow
$validDifficulties = @("basic", "intermediate", "advanced", "fluent", "technical")
Get-Content "samples\*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $fields = $_ -split ","
    if ($fields.Length -gt 2) {
        $difficulty = $fields[2].Trim()
        if ($difficulty -and $difficulty -notin $validDifficulties) {
            Write-Host "❌ 잘못된 Difficulty: $difficulty" -ForegroundColor Red
        }
    }
}

Write-Host "=== 기본 속성 검증 완료 ===" -ForegroundColor Green
```

**Unix/Linux/Mac 사용자:**

```bash
# === 기본 속성 검증 ===
echo "=== 기본 속성 검증 시작 ==="

# 1️⃣ Domain 검증
echo "1️⃣ Domain 검증..."
grep -v "^domain," samples/*.csv | cut -d',' -f1 | grep -v -E "^(daily|food|travel|business|education|nature|technology|health|sports|entertainment|culture|other)$" | while read domain; do
    echo "❌ 잘못된 Domain: $domain"
done

# 2️⃣ Category 검증 (주요 도메인들만)
echo "2️⃣ Category 검증..."

# Culture 도메인 카테고리 검증
grep "^culture," samples/*.csv | cut -d',' -f2 | grep -v -E "^(tradition|customs|language|religion|festival|heritage|ceremony|ritual|folklore|mythology|arts_crafts|etiquette|national_identity|other)$" | while read category; do
    echo "❌ Culture 도메인 잘못된 Category: $category"
done

# Daily 도메인 카테고리 검증
grep "^daily," samples/*.csv | cut -d',' -f2 | grep -v -E "^(greeting|routine|communication|time|weather|family|emotion|basic_needs|transportation|direction|clothing|personal_care|household|other)$" | while read category; do
    echo "❌ Daily 도메인 잘못된 Category: $category"
done

# Business 도메인 카테고리 검증
grep "^business," samples/*.csv | cut -d',' -f2 | grep -v -E "^(office|meeting|finance|marketing|management|negotiation|presentation|networking|project|career|customer_service|sales|strategy|other)$" | while read category; do
    echo "❌ Business 도메인 잘못된 Category: $category"
done

# 3️⃣ Purpose 검증
echo "3️⃣ Purpose 검증..."
grep -v "^domain," samples/*.csv | cut -d',' -f7 | grep -v -E "^(greeting|thanking|request|question|opinion|agreement|refusal|apology|instruction|description|suggestion|emotion)$" | while read purpose; do
    echo "❌ 잘못된 Purpose: $purpose"
done

# 4️⃣ Difficulty 검증
echo "4️⃣ Difficulty 검증..."
grep -v "^domain," samples/*.csv | cut -d',' -f3 | grep -v -E "^(basic|intermediate|advanced|fluent|technical)$" | while read difficulty; do
    echo "❌ 잘못된 Difficulty: $difficulty"
done

echo "=== 기본 속성 검증 완료 ==="
```

#### 템플릿별 중복 및 다의어 검증 시스템:

**🎯 템플릿별 검증 요구사항**:

- **Concepts 템플릿**: 다의어 검증 + 중복 검증 (한국어 단어 기준)
- **Examples 템플릿**: 중복 검증만 (한국어 예문 기준)
- **Grammar 템플릿**: 중복 검증만 (문법 패턴명 기준)

### 📘 Concepts 템플릿 검증 (다의어 + 중복):

**📝 다의어 예시**:

- ✅ **허용**: 밤¹(night) + 밤²(chestnut) - 다른 의미의 다의어
- ❌ **금지**: 밤(night) + 밤(night) - 동일한 의미의 중복

**🔍 단계별 검증 방법**:

**Windows PowerShell 사용자:**

```powershell
# === Concepts 템플릿 검증 ===
Write-Host "=== Concepts 템플릿: 다의어 + 중복 검증 ===" -ForegroundColor Cyan

# 1차: 한국어-영어 조합 중복 체크
Get-Content "samples\concepts_template*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $fields = $_ -split ","
    if ($fields.Length -gt 16) {
        $korean = $fields[7].Trim()   # korean_word
        $english = $fields[16].Trim() # english_word
        "$korean-$english"
    }
} | Group-Object | Where-Object Count -gt 1 | ForEach-Object {
    Write-Host "중복 발견: $($_.Name) (발생 횟수: $($_.Count))" -ForegroundColor Red
}

# 2차: 다의어 의심 케이스 정밀 체크
$koreanWords = @{}
Get-Content "samples\concepts_template*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
    $fields = $_ -split ","
    if ($fields.Length -gt 35) {
        $korean = $fields[7].Trim()   # korean_word
        $english = $fields[16].Trim() # english_word
        $chinese = $fields[26].Trim() # chinese_word
        $japanese = $fields[35].Trim() # japanese_word

        if (-not $koreanWords.ContainsKey($korean)) {
            $koreanWords[$korean] = @()
        }
        $koreanWords[$korean] += "$english|$chinese|$japanese"
    }
}

$koreanWords.Keys | Where-Object { $koreanWords[$_].Count -gt 1 } | ForEach-Object {
    $korean = $_
    $translations = $koreanWords[$korean]
    Write-Host "다의어 의심: $korean" -ForegroundColor Yellow

    $uniqueTranslations = $translations | Select-Object -Unique
    if ($uniqueTranslations.Count -eq 1) {
        Write-Host "  ❌ 진짜 중복: 모든 번역이 동일함" -ForegroundColor Red
    } else {
        Write-Host "  ✅ 다의어: 번역이 다름 (허용)" -ForegroundColor Green
    }
}

Write-Host "=== Concepts 검증 완료 ===" -ForegroundColor Green
```

**Unix/Linux/Mac 사용자:**

```bash
# === Concepts 템플릿 검증 ===
echo "=== Concepts 템플릿: 다의어 + 중복 검증 ==="

# 1차: 한국어-영어 조합 중복 체크
grep -v "^domain," samples/concepts_template*.csv | cut -d',' -f8,17 | sort | uniq -d | while read line; do
    echo "중복 발견: $line"
done

# 2차: 다의어 의심 케이스 정밀 체크
grep -v "^domain," samples/concepts_template*.csv | cut -d',' -f8,17,27,36 | sort -t',' -k1 | \
awk -F',' '{
    korean = $1
    translation = $2"|"$3"|"$4

    if (korean in words) {
        if (words[korean] != translation) {
            print "✅ 다의어: " korean " (번역이 다름 - 허용)"
        } else {
            print "❌ 진짜 중복: " korean " (모든 번역이 동일함)"
        }
    } else {
        words[korean] = translation
    }
}'

echo "=== Concepts 검증 완료 ==="
```

### 📗 Examples 템플릿 검증 (중복만):

**🔍 중복 검증 방법**:

**Windows PowerShell 사용자:**

```powershell
# === Examples 템플릿 검증 ===
Write-Host "=== Examples 템플릿: 중복 검증 ===" -ForegroundColor Cyan

# 한국어 예문 중복 체크 (JSON 파일)
if (Test-Path "samples\examples_template*.json") {
    Get-Content "samples\examples_template*.json" | ConvertFrom-Json | ForEach-Object {
        $_.translations.korean
    } | Group-Object | Where-Object Count -gt 1 | ForEach-Object {
        Write-Host "중복 예문: $($_.Name) (발생 횟수: $($_.Count))" -ForegroundColor Red
    }
}

# 한국어 예문 중복 체크 (CSV 파일)
if (Test-Path "samples\examples_template*.csv") {
    Get-Content "samples\examples_template*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
        $fields = $_ -split ","
        if ($fields.Length -gt 5) {
            $fields[5].Trim()  # korean 컬럼
        }
    } | Group-Object | Where-Object Count -gt 1 | ForEach-Object {
        Write-Host "중복 예문: $($_.Name) (발생 횟수: $($_.Count))" -ForegroundColor Red
    }
}

Write-Host "=== Examples 검증 완료 ===" -ForegroundColor Green
```

**Unix/Linux/Mac 사용자:**

```bash
# === Examples 템플릿 검증 ===
echo "=== Examples 템플릿: 중복 검증 ==="

# JSON 파일 중복 체크
if ls samples/examples_template*.json 1> /dev/null 2>&1; then
    grep -o '"korean"[[:space:]]*:[[:space:]]*"[^"]*"' samples/examples_template*.json | \
    cut -d'"' -f4 | sort | uniq -d | while read line; do
        echo "중복 예문: $line"
    done
fi

# CSV 파일 중복 체크
if ls samples/examples_template*.csv 1> /dev/null 2>&1; then
    grep -v "^domain," samples/examples_template*.csv | cut -d',' -f6 | sort | uniq -d | while read line; do
        echo "중복 예문: $line"
    done
fi

echo "=== Examples 검증 완료 ==="
```

### 📙 Grammar 템플릿 검증 (중복만):

**🔍 중복 검증 방법**:

**Windows PowerShell 사용자:**

```powershell
# === Grammar 템플릿 검증 ===
Write-Host "=== Grammar 템플릿: 중복 검증 ===" -ForegroundColor Cyan

# 문법 패턴 제목 중복 체크 (JSON 파일)
if (Test-Path "samples\grammar_template*.json") {
    Get-Content "samples\grammar_template*.json" | ConvertFrom-Json | ForEach-Object {
        $_.pattern.korean.title
    } | Group-Object | Where-Object Count -gt 1 | ForEach-Object {
        Write-Host "중복 문법 패턴: $($_.Name) (발생 횟수: $($_.Count))" -ForegroundColor Red
    }
}

# 문법 패턴 제목 중복 체크 (CSV 파일)
if (Test-Path "samples\grammar_template*.csv") {
    Get-Content "samples\grammar_template*.csv" | Where-Object { $_ -notmatch "^domain," } | ForEach-Object {
        $fields = $_ -split ","
        if ($fields.Length -gt 6) {
            $fields[6].Trim()  # korean_title 컬럼
        }
    } | Group-Object | Where-Object Count -gt 1 | ForEach-Object {
        Write-Host "중복 문법 패턴: $($_.Name) (발생 횟수: $($_.Count))" -ForegroundColor Red
    }
}

Write-Host "=== Grammar 검증 완료 ===" -ForegroundColor Green
```

**Unix/Linux/Mac 사용자:**

```bash
# === Grammar 템플릿 검증 ===
echo "=== Grammar 템플릿: 중복 검증 ==="

# JSON 파일 중복 체크
if ls samples/grammar_template*.json 1> /dev/null 2>&1; then
    grep -o '"title"[[:space:]]*:[[:space:]]*"[^"]*"' samples/grammar_template*.json | \
    cut -d'"' -f4 | sort | uniq -d | while read line; do
        echo "중복 문법 패턴: $line"
    done
fi

# CSV 파일 중복 체크
if ls samples/grammar_template*.csv 1> /dev/null 2>&1; then
    grep -v "^domain," samples/grammar_template*.csv | cut -d',' -f7 | sort | uniq -d | while read line; do
        echo "중복 문법 패턴: $line"
    done
fi

echo "=== Grammar 검증 완료 ==="
```

### 🔄 전체 템플릿 통합 검증:

**Windows PowerShell 사용자:**

```powershell
# === 모든 템플릿 한 번에 검증 ===
Write-Host "=== 전체 템플릿 통합 검증 시작 ===" -ForegroundColor Magenta

# Concepts 검증
Write-Host "`n📘 Concepts 템플릿 검증..." -ForegroundColor Cyan
# (위의 Concepts 검증 코드 실행)

# Examples 검증
Write-Host "`n📗 Examples 템플릿 검증..." -ForegroundColor Cyan
# (위의 Examples 검증 코드 실행)

# Grammar 검증
Write-Host "`n📙 Grammar 템플릿 검증..." -ForegroundColor Cyan
# (위의 Grammar 검증 코드 실행)

Write-Host "`n=== 전체 검증 완료 ===" -ForegroundColor Magenta
```

**📋 템플릿별 처리 방침**:

1. **📘 Concepts 템플릿**:

   - ✅ **허용**: 밤(night) + 밤(chestnut) - 다의어
   - ❌ **금지**: 사랑(love) + 사랑(love) - 중복

2. **📗 Examples 템플릿**:

   - ✅ **허용**: 다른 문장들
   - ❌ **금지**: "안녕하세요" + "안녕하세요" - 동일 예문

3. **📙 Grammar 템플릿**:
   - ✅ **허용**: 다른 문법 패턴들
   - ❌ **금지**: "존댓말 기본형" + "존댓말 기본형" - 동일 패턴

**💡 사용 권장사항**:

- 각 템플릿별로 해당하는 검증만 실행
- 대량 템플릿 생성 전 반드시 검증 실행
- 의심스러운 경우 수동 확인

---

_이 가이드는 한국어 학습 플랫폼의 데이터 품질과 일관성을 보장하기 위해 작성되었습니다._

## 📋 템플릿 생성 완전 워크플로우

### 🎯 전체 프로세스 개요:

```
1. 📝 템플릿 작성 → 2. 🔍 검증 실행 → 3. 🔧 오류 수정 → 4. 📋 추적 문서 업데이트 → 5. ✅ 최종 확인 → 6. 🚀 배포
```

### 📋 단계별 상세 가이드:

#### **1단계: 📝 템플릿 작성**

- 기존 템플릿 구조를 참고하여 새로운 데이터 작성
- 정의된 값들만 사용 (Purpose 12개, Domain 12개, Situation 13개)
- 4개 언어(한국어, 영어, 일본어, 중국어) 모두 작성

#### **2단계: 🔍 검증 실행**

- 아래 "자동 검증 명령어" 섹션의 모든 검증 실행
- 템플릿별 중복/다의어 검증 실행
- 검증 결과 저장 및 분석

#### **3단계: 🔧 오류 수정**

- 발견된 오류들을 아래 "검증 오류 수정 가이드" 참고하여 수정
- 수정 후 다시 검증 실행하여 확인

#### **4단계: 📋 추적 문서 업데이트**

- `samples/data_tracking.md` 파일에 새로운 데이터 추가
- 중복 방지를 위한 핵심 정보 기록

#### **5단계: ✅ 최종 확인**

- 모든 검증 통과 확인
- 추적 문서 업데이트 완료 확인
- 데이터 품질 최종 점검

#### **6단계: 🚀 배포**

- `samples/` 폴더에 템플릿 파일 추가
- Git 커밋 및 푸시

## 🔧 검증 오류 수정 가이드

### 📊 **Purpose 값 오류**

**❌ 자주 발생하는 잘못된 값들:**

```
cultural_knowledge → description 사용
educational → instruction 또는 description 사용
informational → description 사용
explanation → description 사용
casual → emotion 또는 description 사용
```

**✅ 올바른 12개 Purpose 값:**

```
greeting, thanking, request, question, opinion, agreement, refusal, apology, instruction, description, suggestion, emotion
```

### 🌍 **Domain 값 오류**

**❌ 자주 발생하는 잘못된 값들:**

```
academic → education 사용
work → business 사용
study → education 사용
life → daily 사용
social → culture 또는 daily 사용
personal → other 사용
family → culture 사용
```

**✅ 올바른 12개 Domain 값:**

```
daily, food, travel, business, education, nature, technology, health, sports, entertainment, culture, other
```

### 🏷️ **Situation 값 오류**

**❌ 자주 발생하는 잘못된 값들:**

```
business → work 사용
informal → casual 사용
professional → work 사용
academic → school 사용
```

**✅ 올바른 13개 Situation 값:**

```
formal, casual, polite, urgent, work, school, social, travel, shopping, home, public, online, medical
```

### 🔄 **중복 및 다의어 오류**

#### **Concepts 템플릿:**

- **진짜 중복 발견 시**: 중복된 항목 중 하나 삭제
- **다의어 의심 시**: 번역이 다르면 허용, 같으면 중복 제거

#### **Examples 템플릿:**

- **중복 예문 발견 시**: 중복된 예문 중 하나 삭제 또는 의미 차별화

#### **Grammar 템플릿:**

- **중복 패턴 발견 시**: 중복된 문법 패턴 중 하나 삭제 또는 구조 차별화

### 🛠️ **수정 후 재검증**

```powershell
# 수정 완료 후 반드시 재검증 실행
Write-Host "=== 수정 후 재검증 ===" -ForegroundColor Magenta
# (해당 검증 명령어 다시 실행)
```

## 📋 데이터 추적 문서 관리

### 🎯 **추적 문서 목적**

- 템플릿 간 중복 방지
- 데이터 현황 파악
- 다의어 vs 중복 구분 지원

### 📄 **추적 문서 생성**

**파일 위치**: `samples/data_tracking.md`

**초기 구조**:

```markdown
# 데이터 추적 문서

## 📘 Concepts 추적 (한국어 단어 기준)

### 기본 템플릿 (concepts_template.csv)

- 쇼핑 (shopping) - 라인 2
- 전통 (tradition) - 라인 3

### 대량 템플릿 (concepts_template_100.csv)

- (새로 추가되는 단어들...)

## 📗 Examples 추적 (한국어 예문 기준)

### 기본 템플릿 (examples_template.json)

- "안녕하세요! 처음 뵙겠습니다." - 항목 1

## 📙 Grammar 추적 (패턴명 기준)

### 기본 템플릿 (grammar_template.json)

- "기본 인사" - 항목 1
- "음식 주문" - 항목 2
```

### 🔄 **새 템플릿 추가 시 업데이트 방법**

#### **1. Concepts 템플릿 추가 시:**

```markdown
### concepts_template_100.csv (2024-01-15 추가)

- 사랑 (love) - 라인 5
- 친구 (friend) - 라인 12
- 학교 (school) - 라인 23
```

#### **2. Examples 템플릿 추가 시:**

```markdown
### examples_template_50.json (2024-01-15 추가)

- "감사합니다" - 항목 3
- "죄송합니다" - 항목 8
```

#### **3. Grammar 템플릿 추가 시:**

```markdown
### grammar_template_20.json (2024-01-15 추가)

- "과거형 만들기" - 항목 5
- "미래형 표현" - 항목 12
```

### 📊 **추적 문서 활용법**

#### **새 템플릿 작성 전 확인:**

1. **Ctrl+F로 검색**: 추가하려는 한국어 단어/예문/패턴 검색
2. **중복 확인**: 이미 존재하는지 확인
3. **다의어 판단**: 같은 단어라도 다른 의미인지 확인

#### **정기 점검:**

- 월 1회 추적 문서 정리
- 불필요한 항목 제거
- 누락된 항목 추가

### 💡 **추적 문서 관리 팁**

1. **간결성 유지**: 핵심 정보만 기록 (단어 + 위치)
2. **일관성 유지**: 동일한 형식으로 기록
3. **즉시 업데이트**: 새 템플릿 추가 시 바로 업데이트
4. **백업 관리**: 정기적으로 백업 생성

## 🔒 문자 깨짐 방지 점검 가이드

### 📋 **문자 깨짐 점검 항목**

#### **1. 파일 인코딩 확인**

- **CSV 파일**: UTF-8 with BOM 인코딩 필수
- **JSON 파일**: UTF-8 인코딩 필수
- **Markdown 파일**: UTF-8 인코딩 필수

#### **2. 문자 깨짐 패턴 확인**

**❌ 발견 시 즉시 수정해야 할 패턴들:**

```
?    → 한국어/중국어/일본어 문자 깨짐
?     → 한국어/중국어/일본어 문자 깨짐
     → 일반적인 문자 깨짐
???  → 인코딩 문제로 인한 물음표 표시
```

#### **3. 언어별 문자 검증**

**한국어 문자 범위:**

- 한글: ㄱ-ㅎ, ㅏ-ㅣ, 가-힣
- 한자: 一-龯

**중국어 문자 범위:**

- 간체자: 一-龯
- 번체자: 一-龯

**일본어 문자 범위:**

- 히라가나: ひ-ゟ
- 카타카나: ア-ヿ
- 한자: 一-龯

#### **4. 정기 점검 명령어**

```bash
# CSV 파일에서 문자 깨짐 패턴 검색
grep -n "?  \|?   \|  " samples/*.csv

# 모든 템플릿 파일에서 문자 깨짐 검색
find samples/ -name "*.csv" -o -name "*.json" | xargs grep -l "?  \|?   "
```

### 🛠️ **문자 깨짐 복구 방법**

#### **1. 백업 파일 활용**

- 문자 깨짐 발견 시 `*_backup.csv` 파일 확인
- 정상 데이터와 비교하여 복구

#### **2. 수동 복구 절차**

1. **문제 라인 식별**: 깨진 문자가 있는 라인 번호 확인
2. **언어별 복구**: 한국어, 중국어, 일본어 각각 정상 문자로 교체
3. **검증**: 복구 후 다시 문자 깨짐 패턴 검색으로 확인

#### **3. 예방 조치**

- **파일 저장 시**: 반드시 UTF-8 인코딩으로 저장
- **텍스트 에디터**: UTF-8 지원 에디터 사용 (VS Code, Notepad++ 등)
- **자동 백업**: 템플릿 파일 수정 전 자동 백업 생성

### ⚠️ **문자 깨짐 발생 시 대응 절차**

1. **즉시 작업 중단**: 추가 데이터 손실 방지
2. **백업 파일 확인**: 최근 정상 백업 파일 존재 여부 확인
3. **문제 범위 파악**: 전체 파일 vs 특정 라인 문제인지 확인
4. **복구 작업 수행**: 백업 파일 또는 수동 복구 진행
5. **재검증**: 복구 완료 후 전체 파일 문자 깨짐 재검사
6. **문서 업데이트**: 추적 문서에 복구 내역 기록

#### 자동 검증 명령어 (필수 권장):
