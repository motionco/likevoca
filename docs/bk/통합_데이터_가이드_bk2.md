# 다국어 학습 플랫폼 통합 데이터 가이드

## 📋 개요

이 문서는 다국어 학습 플랫폼의 세 가지 주요 컬렉션(concepts, grammar, examples)에 대한 통합 가이드입니다. 각 컬렉션의 구조, 사용 방법, 데이터 입력 표준을 설명합니다.

## 🔗 컬렉션 간 연결성 (concept_id 체계)

### concept_id 필드 체계

3개 컬렉션 간의 데이터 연결성을 위해 **concept_id** 필드를 도입했습니다.

#### **concept_id 형식:**

```
{domain}_{word}_{meaning}
```

**예시:**

- `food_apple_fruit` - 사과 (음식, 과일)
- `daily_hello_greeting` - 안녕 (일상, 인사)
- `travel_travel_journey` - 여행 (여행, 여정)
- `education_study_learn` - 공부 (교육, 학습)

> 📋 **참고**: 현재 등록된 concept 목록은 `data_tracking_log.json`에서 확인할 수 있습니다.

#### **학습 연결성:**

- **Concepts**: 단어/개념 학습
- **Examples**: 실제 사용 예문 학습
- **Grammar**: 문법 패턴 학습

동일한 `concept_id`를 가진 데이터들이 **개념 → 예문 → 문법** 순서로 체계적인 학습을 가능하게 합니다.

#### **동일 concept_id 내 데이터 일관성:**

동일한 `concept_id`를 가진 concepts, examples, grammar 데이터는 **반드시 같은 단어**를 사용해야 합니다:

```json
// 올바른 예시 - food_apple_fruit
{
  "concept_id": "food_apple_fruit",
  "concepts": { "korean_word": "사과", "english_word": "apple" },
  "examples": { "korean_word": "사과", "english_word": "apple" }, 
  "grammar": { "korean_word": "사과", "english_word": "apple" }
}

// 잘못된 예시 - 같은 concept_id에서 다른 단어 사용
{
  "concept_id": "food_apple_fruit",
  "concepts": { "korean_word": "사과", "english_word": "apple" },
  "examples": { "korean_word": "과일", "english_word": "fruit" },  // ❌ 다른 단어
  "grammar": { "korean_word": "먹거리", "english_word": "food" }   // ❌ 다른 단어
}
```

#### **중복 데이터 처리 정책:**

시스템은 다음 조건에서 데이터를 **중복으로 간주**하여 자동으로 제외합니다:

1. **concept_id 중복**: 동일한 concept_id가 이미 존재하는 경우
2. **단어+의미 조합 중복**: 동일한 english_word/korean_word + meaning 조합이 존재하는 경우
3. **예문 중복**: 동일한 예문이 이미 존재하는 경우

**중복 처리 규칙:**
- concepts에서 중복 발견 시 → examples, grammar에서도 같은 concept_id 자동 제외
- 데이터 무결성 보장을 위해 관련된 모든 파일에서 일관된 중복 제거 적용
- 중복 발견 시 기존 데이터 우선, 신규 데이터 스킵

```bash
# 중복 처리 예시 로그
⚠️ 스킵 대상 식별: food_apple_fruit (단어+의미 중복: apple_fruit)
⚠️ 스킵: food_apple_fruit (1단계에서 스킵된 concept_id: food_apple_fruit)
```

## 📊 CSV 파일 헤더 표준화

### Concepts 컬렉션 CSV 헤더

대량 개념 추가 시 사용하는 CSV 파일의 표준 헤더입니다. **반드시 이 순서와 이름을 정확히 사용**해야 합니다.

```csv
concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
```

#### 🔍 헤더 필드 설명

**연결성 필드 (1개 필드)**

- `concept_id` - 컬렉션 간 연결을 위한 고유 식별자 (형식: {domain}_{word}_{meaning})

**기본 정보 (7개 필드)**

- `domain` - 도메인 (12개 값 중 하나)
- `category` - 카테고리 (도메인별 세부 분류)
- `difficulty` - 난이도 (basic, intermediate, advanced, fluent, technical)
- `emoji` - 이모지 (유니코드 이모지, 예: 🏠)
- `color` - 색상 (헥스 코드, 예: #4CAF50)
- `situation` - 상황 (쉼표로 구분, 예: "casual,home")
- `purpose` - 목적 (12개 값 중 하나)

**언어별 표현 (각 언어당 9개 필드 × 5개 언어 = 45개 필드)**

- `{lang}_word` - 단어/표현
- `{lang}_pronunciation` - 발음
- `{lang}_definition` - 정의
- `{lang}_pos` - 품사 (part of speech)
- `{lang}_synonyms` - 유의어 (쉼표로 구분)
- `{lang}_antonyms` - 반의어 (쉼표로 구분)
- `{lang}_word_family` - 어족 (쉼표로 구분)
- `{lang}_compound_words` - 복합어 (쉼표로 구분)
- `{lang}_collocations` - 연어 (쉼표로 구분)

**대표 예문 (5개 필드)**

- `korean_example` - 한국어 예문
- `english_example` - 영어 예문
- `chinese_example` - 중국어 예문
- `japanese_example` - 일본어 예문
- `spanish_example` - 스페인어 예문

**총 필드 수: 58개** (1+7+45+5)

#### ⚠️ 주의사항

1. **헤더 순서**: 반드시 위의 순서대로 작성해야 합니다.
2. **필드명 정확성**: 대소문자, 언더스코어(\_) 등을 정확히 입력해야 합니다.
3. **필수 필드**: `domain`, `korean_word`, `english_word`, `korean_example`, `english_example`는 반드시 입력해야 합니다. 스페인어 필드는 선택사항이지만, 가능한 경우 모든 언어를 입력하는 것을 권장합니다.
4. **쉼표 구분**: 여러 값을 입력할 때는 쉼표(,)로 구분하고 따옴표로 감싸야 합니다.
5. **이모지 입력**: 유니코드 이모지를 직접 입력합니다 (예: 🏠, 📱, 🎵).
6. **CSV 파싱 주의사항**:
   - 쉼표가 포함된 모든 필드는 반드시 **쌍따옴표("")로 감싸야 합니다**
   - 예: `"안녕하세요, 처음 뵙겠습니다."`, `"Hello, nice to meet you."`, `"Por favor, dame kimchi jjigae."`
   - 따옴표로 감싸지 않으면 CSV 파싱 시 컬럼 수가 맞지 않아 업로드가 실패할 수 있습니다

#### 📝 CSV 작성 예시

```csv
domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
daily,routine,basic,⏰,#4CAF50,"casual,home",description,아침,a-chim,하루가 시작되는 시간,명사,"새벽,조간","저녁,밤","시간,일과","아침식사,아침운동","상쾌한 아침,이른 아침",morning,/ˈmɔːrnɪŋ/,the early part of the day,noun,"dawn,daybreak","evening,night","time,daily","morning exercise,morning coffee","early morning,fresh morning",早晨,zǎo chén,一天开始的时间,名词,"清晨,上午","晚上,夜晚","时间,日程","早晨锻炼,早餐","清爽的早晨,早起",朝,asa,一日の始まりの時間,名詞,"朝方,午前","夕方,夜","時間,日課","朝の運動,朝食","爽やかな朝,早朝",mañana,ma-nya-na,la parte temprana del día,sustantivo,"amanecer,alba","tarde,noche","tiempo,día","ejercicio matutino,café matutino","mañana temprana,mañana fresca",오늘 아침 일찍 일어났어요.,I got up early this morning.,今天早晨我起得很早。,今朝早く起きました。,Me levanté temprano esta mañana.
```

### Examples 컬렉션 CSV 헤더

예문 대량 추가 시 사용하는 CSV 파일의 표준 헤더입니다.

```csv
concept_id,domain,category,difficulty,situation,purpose,korean,english,japanese,chinese,spanish,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

#### 🔍 Examples 헤더 필드 설명

**연결성 필드 (1개 필드)**

- `concept_id` - 컬렉션 간 연결을 위한 고유 식별자 (형식: {domain}_{word}_{meaning})

**기본 정보 (5개 필드)**

- `domain` - 도메인 (12개 값 중 하나)
- `category` - 카테고리 (도메인별 세부 분류)
- `difficulty` - 난이도 (basic, intermediate, advanced, fluent, technical)
- `situation` - 상황 (쉼표로 구분, 예: "casual,home")
- `purpose` - 목적 (12개 값 중 하나)

**언어별 예문 (5개 필드)**

- `korean` - 한국어 예문
- `english` - 영어 예문
- `japanese` - 일본어 예문
- `chinese` - 중국어 예문
- `spanish` - 스페인어 예문

**언어별 핵심 단어 (5개 필드)**

- `korean_word` - 한국어 핵심 단어
- `english_word` - 영어 핵심 단어
- `japanese_word` - 일본어 핵심 단어
- `chinese_word` - 중국어 핵심 단어
- `spanish_word` - 스페인어 핵심 단어

### Grammar 컬렉션 CSV 헤더

문법 패턴 대량 추가 시 사용하는 CSV 파일의 표준 헤더입니다.

```csv
concept_id,domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,korean_example,english_title,english_structure,english_description,english_example,japanese_title,japanese_structure,japanese_description,japanese_example,chinese_title,chinese_structure,chinese_description,chinese_example,spanish_title,spanish_structure,spanish_description,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

#### 🔍 Grammar 헤더 필드 설명

**연결성 필드 (1개 필드)**

- `concept_id` - 컬렉션 간 연결을 위한 고유 식별자 (형식: {domain}_{word}_{meaning})

**기본 정보 (5개 필드)**

- `domain` - 도메인 (12개 값 중 하나)
- `category` - 카테고리 (도메인별 세부 분류)
- `difficulty` - 난이도 (basic, intermediate, advanced, fluent, technical)
- `situation` - 상황 (쉼표로 구분, 예: "casual,home")
- `purpose` - 목적 (12개 값 중 하나)

**언어별 패턴 정보 (각 언어당 3개 필드 × 5개 언어 = 15개 필드)**

- `{lang}_title` - 패턴 제목
- `{lang}_structure` - 문법 구조
- `{lang}_description` - 패턴 설명

**언어별 예문 (5개 필드)**

- `korean_example` - 한국어 예문
- `english_example` - 영어 예문
- `japanese_example` - 일본어 예문
- `chinese_example` - 중국어 예문
- `spanish_example` - 스페인어 예문

**언어별 핵심 단어 (5개 필드)**

- `korean_word` - 한국어 핵심 단어
- `english_word` - 영어 핵심 단어
- `japanese_word` - 일본어 핵심 단어
- `chinese_word` - 중국어 핵심 단어
- `spanish_word` - 스페인어 핵심 단어

#### ⚠️ Grammar CSV 주의사항

1. **쉼표 포함 필드**: 예문이나 설명에 쉼표가 포함된 경우 반드시 **쌍따옴표("")로 감싸야 합니다**
   - 예: `"안녕하세요, 처음 뵙겠습니다."`, `"Hello, nice to meet you."`, `"Por favor, dame kimchi jjigae."`
2. **따옴표 누락 시**: CSV 파싱 시 컬럼 수가 맞지 않아 업로드가 실패할 수 있습니다
3. **스페인어 필드**: 특히 스페인어 예문과 설명에 쉼표가 자주 포함되므로 주의가 필요합니다
4. **문법 설명 필드**: `{lang}_description` 필드에 쉼표가 포함된 경우 반드시 따옴표로 감싸야 합니다

```csv
domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,english_title,english_structure,english_description,japanese_title,japanese_structure,japanese_description,chinese_title,chinese_structure,chinese_description,spanish_title,spanish_structure,spanish_description,korean_example,english_example,japanese_example,chinese_example,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

#### 🔍 Grammar 헤더 필드 설명

**기본 정보 (5개 필드)**

- `domain` - 도메인 (12개 값 중 하나)
- `category` - 카테고리 (도메인별 세부 분류)
- `difficulty` - 난이도 (basic, intermediate, advanced, fluent, technical)
- `situation` - 상황 (쉼표로 구분, 예: "casual,home")
- `purpose` - 목적 (12개 값 중 하나)

**언어별 문법 정보 (각 언어당 3개 필드 × 5개 언어 = 15개 필드)**

- `{lang}_title` - 문법 패턴 제목
- `{lang}_structure` - 문법 구조
- `{lang}_description` - 문법 설명

**언어별 예문 (5개 필드)**

- `korean_example` - 한국어 예문
- `english_example` - 영어 예문
- `japanese_example` - 일본어 예문
- `chinese_example` - 중국어 예문
- `spanish_example` - 스페인어 예문

**언어별 핵심 단어 (5개 필드)**

- `korean_word` - 한국어 핵심 단어
- `english_word` - 영어 핵심 단어
- `japanese_word` - 일본어 핵심 단어
- `chinese_word` - 중국어 핵심 단어
- `spanish_word` - 스페인어 핵심 단어

## 🏗️ 컬렉션 구조

### 1. Concepts 컬렉션 (개념/단어)

단어, 구문, 개념 학습을 위한 컬렉션입니다.

```json
{
  "concept_id": "food_apple_fruit",
  "domain": "food",
  "category": "fruit",
  "difficulty": "basic",
  "emoji": "🍎",
  "color": "#FF6B6B",
  "situation": ["casual", "shopping"],
  "purpose": "description",
  "expressions": {
    "korean": {
      "word": "사과",
      "pronunciation": "sa-gwa",
      "definition": "빨간 과일",
      "part_of_speech": "명사",
      "synonyms": ["과일"],
      "antonyms": ["채소"],
      "collocations": ["맛있는 사과"],
      "compound_words": ["사과나무"],
      "word_family": ["사과과"]
    },
    "english": {
      "word": "apple",
      "pronunciation": "/ˈæp.əl/",
      "definition": "red fruit",
      "part_of_speech": "noun",
      "synonyms": ["fruit"],
      "antonyms": ["vegetable"],
      "collocations": ["delicious apple"],
      "compound_words": ["apple tree"],
      "word_family": ["apple family"]
    },
    "japanese": {
      "word": "りんご",
      "pronunciation": "ringo",
      "definition": "赤い果物",
      "part_of_speech": "名詞",
      "synonyms": ["果物"],
      "antonyms": ["野菜"],
      "collocations": ["おいしいりんご"],
      "compound_words": ["りんごの木"],
      "word_family": ["りんご科"]
    },
    "chinese": {
      "word": "苹果",
      "pronunciation": "píng guǒ",
      "definition": "红色水果",
      "part_of_speech": "名词",
      "synonyms": ["水果"],
      "antonyms": ["蔬菜"],
      "collocations": ["好吃的苹果"],
      "compound_words": ["苹果树"],
      "word_family": ["苹果科"]
    },
    "spanish": {
      "word": "manzana",
      "pronunciation": "manˈθana",
      "definition": "fruta roja",
      "part_of_speech": "sustantivo",
      "synonyms": ["fruta"],
      "antonyms": ["verdura"],
      "collocations": ["manzana deliciosa"],
      "compound_words": ["manzano"],
      "word_family": ["familia de la manzana"]
    }
  },
  "representative_example": {
    "korean": "나는 사과를 먹습니다.",
    "english": "I eat an apple.",
    "japanese": "私はりんごを食べます。",
    "chinese": "我吃苹果。",
    "spanish": "Como una manzana."
  }
}
```

### 2. Grammar 컬렉션 (문법 패턴)

문법 패턴과 구조 학습을 위한 컬렉션입니다.

```json
{
  "concept_id": "food_apple_fruit",
  "domain": "food",
  "category": "fruit",
  "difficulty": "basic",
  "situation": ["casual", "shopping"],
  "purpose": "description",
  "korean_title": "사과 먹기",
  "korean_structure": "N을/를 V",
  "korean_description": "사과를 먹는 문법 패턴",
  "korean_example": "나는 사과를 먹습니다.",
  "english_title": "Eating an Apple",
  "english_structure": "S V O",
  "english_description": "Grammar pattern for eating an apple",
  "english_example": "I eat an apple.",
  "japanese_title": "りんごを食べる",
  "japanese_structure": "Nを V",
  "japanese_description": "りんごを食べる文法パターン",
  "japanese_example": "私はりんごを食べます。",
  "chinese_title": "吃苹果",
  "chinese_structure": "S V O",
  "chinese_description": "吃苹果的语法模式",
  "chinese_example": "我吃苹果。",
  "spanish_title": "Comer una manzana",
  "spanish_structure": "S V O",
  "spanish_description": "Patrón gramatical para comer una manzana",
  "spanish_example": "Como una manzana.",
  "korean_word": "사과",
  "english_word": "apple",
  "japanese_word": "りんご",
  "chinese_word": "苹果",
  "spanish_word": "manzana"
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
    "chinese": "你好！初次见面。",
    "spanish": "¡Hola! Encantado de conocerte por primera vez."
  },
  "word": {
    "korean": "안녕하세요",
    "english": "Hello",
    "japanese": "こんにちは",
    "chinese": "你好",
    "spanish": "Hola"
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

**도메인 선택 우선순위:**

1. **명확히 해당하는 도메인이 있는가?** → 해당 도메인 선택
2. **여러 도메인에 걸쳐 있는가?** → 가장 핵심적인 도메인 선택
3. **적절한 도메인이 없는가?** → **`other` 선택** ⭐

### Category (카테고리) - 도메인별 세부 분류

각 도메인마다 10-15개의 세부 카테고리가 있습니다.

#### 🎯 카테고리 선택 가이드라인

**카테고리 선택 우선순위:**

1. **정확히 일치하는 카테고리가 있는가?** → 해당 카테고리 선택
2. **유사한 카테고리가 있는가?** → 가장 가까운 카테고리 선택
3. **적절한 카테고리가 없는가?** → **`other` 선택** ⭐

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

**nature (자연)**

- animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain, other

**technology (기술)**

- computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation, it_hardware, development, other

**health (건강)**

- exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment, other

**sports (스포츠)**

- football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition, other

**entertainment (엔터테인먼트)**

- movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography, other

**culture (문화)**

- tradition, customs, language, religion, festival, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity, other

**other (기타)**

- hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation, science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, thesis, other

### Difficulty (난이도) - 5개 값

학습 내용의 난이도를 나타내는 단일 값입니다.

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

- **문화나 전통 관련 내용**: `description` 사용
- **교육이나 학습 내용**: `instruction` 또는 `description` 사용
- **감정이나 기분 표현**: `emotion` 사용
- **의견이나 생각 표현**: `opinion` 사용
- **요청이나 부탁**: `request` 사용

### Part of Speech (품사) - 10개 값

표현의 문법적 역할을 나타내는 단일 값입니다.

1. **noun** - 명사 (사물, 개념, 인물 등을 나타냄)
2. **verb** - 동사 (행동, 상태, 존재 등을 나타냄)
3. **adjective** - 형용사 (명사를 수식하여 성질이나 상태를 나타냄)
4. **adverb** - 부사 (동사, 형용사, 다른 부사를 수식)
5. **pronoun** - 대명사 (명사를 대신하는 말)
6. **preposition** - 전치사/조사 (명사나 대명사 앞에서 관계를 나타냄)
7. **conjunction** - 접속사 (단어, 구, 절을 연결하는 말)
8. **interjection** - 감탄사 (감정이나 의사를 나타내는 감탄 표현)
9. **determiner** - 한정사 (명사 앞에서 범위나 수량을 한정)
10. **other** - 기타 (위에 속하지 않는 특수한 경우)

#### 품사 선택 가이드:

- **noun**: 사람, 장소, 사물, 개념 등 (예: 사과, 학교, 사랑)
- **verb**: 행동이나 상태를 나타내는 말 (예: 먹다, 가다, 있다)
- **adjective**: 성질이나 상태를 나타내는 말 (예: 예쁘다, 크다, 좋다)
- **adverb**: 정도나 방법을 나타내는 말 (예: 빠르게, 매우, 잘)
- **pronoun**: 대명사 (예: 나, 너, 이것, 저것)
- **preposition**: 전치사/조사 (예: ~에, ~에서, ~로, in, on, at)
- **conjunction**: 접속사 (예: 그리고, 하지만, and, but)
- **interjection**: 감정 표현 (예: "아!", "와!", "음...")
- **determiner**: 한정사 (예: this, that, the, a, some, many)
- **other**: 관용구, 구문, 복합 표현 등 특수한 경우

## 🔄 데이터 생성 체크리스트

### 새로운 개념(Concepts) 추가 시:

1. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택
2. **카테고리 선택**: 선택한 도메인의 카테고리 중 선택
3. **난이도 설정**: basic → intermediate → advanced → fluent → technical 순서로 적절한 수준 선택
4. **이모지 선택**: 카테고리에 매핑된 12-15개 이모지 중 선택
5. **언어별 표현**: 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
6. **고급 필드**: synonyms, antonyms, word_family, compound_words, collocations 작성
7. **예문**: representative_example에 5개 언어 모두 작성
8. **상황/목적**: situation 배열과 purpose 단일값 설정

### 새로운 예문(Examples) 추가 시:

1. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택
2. **카테고리 선택**: 선택한 도메인의 카테고리 중 선택
3. **난이도 설정**: basic → intermediate → advanced → fluent → technical 순서로 적절한 수준 선택
4. **언어별 예문**: 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
5. **언어별 핵심 단어**: 각 언어별 핵심 단어(word) 작성
6. **예문 품질**: 실제 상황에서 사용 가능한 자연스러운 표현인지 확인
7. **상황/목적**: situation 배열과 purpose 단일값 설정

### 새로운 문법(Grammar) 추가 시:

1. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택
2. **카테고리 선택**: 선택한 도메인의 카테고리 중 선택
3. **난이도 설정**: basic → intermediate → advanced → fluent → technical 순서로 적절한 수준 선택
4. **언어별 문법 정보**: 각 언어별 title, structure, description 작성
5. **언어별 예문**: 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
6. **언어별 핵심 단어**: 각 언어별 핵심 단어(word) 작성
7. **문법 패턴 품질**: 실제 사용 가능한 문법 패턴인지 확인
8. **상황/목적**: situation 배열과 purpose 단일값 설정

### 품질 관리 요구사항:

- ✅ **필수 필드**: 모든 필수 필드 작성 완료
- ✅ **언어 일관성**: 5개 언어 간 의미와 맥락 일치
- ✅ **난이도 적정성**: 설정한 난이도에 맞는 어휘와 문법 사용
- ✅ **카테고리 적합성**: 선택한 카테고리와 내용 일치
- ✅ **예문 자연성**: 실제 상황에서 사용 가능한 자연스러운 표현
- ✅ **Purpose 값 검증**: 정의된 12개 purpose 값만 사용
- ✅ **Domain 값 검증**: 정의된 12개 domain 값만 사용
- ✅ **Situation 값 검증**: 정의된 13개 situation 값만 사용
- ✅ **CSV 파싱 안정성**: 쉼표가 포함된 필드는 반드시 쌍따옴표로 감싸기
- ✅ **문자 인코딩**: UTF-8 인코딩으로 한글 깨짐 방지

## 📊 자동 검증 명령어

### 빠른 검증 (권장)

```bash
# 검증 실행
python validate.py
```

### 수동 검증

```bash
# CSV 헤더 검증
head -1 samples/concepts_template.csv

# 문자 인코딩 검증
file samples/*.csv | grep -v UTF-8

# 쉼표 포함 필드 검증 (따옴표 처리 확인)
grep -n ",[^,\"]*,[^,\"]*," data/*.csv | grep -v "\""
```

## 📋 데이터 구조 개요

### 🎯 현재 시스템 특징

**주요 데이터 형식**: CSV 파일 중심
- **Concepts 컬렉션**: `concepts_template_add.csv` → `concepts_template_list.csv`
- **Examples 컬렉션**: `examples_template_add.csv` → `examples_template_list.csv`  
- **Grammar 컬렉션**: `grammar_template_add.csv` → `grammar_template_list.csv`

**트랜잭션 로그**: `data_tracking_log.json`
- 모든 데이터 변경 기록
- 백업 참조 및 복원 지원
- 실시간 통계 및 검증 데이터

### 📊 CSV 기반 워크플로우 (기술적 상세)

1. **데이터 생성 (`generate.py`)**
   - 랜덤 템플릿 생성 (concept_id: {domain}_{word}_{meaning})
   - 47개 단어 풀에서 중복 방지 선택
   - 30회 재시도 로직으로 중복 회피
   - 58개 필드 완전 자동 생성

2. **데이터 입력/수정**
   - CSV 템플릿 파일 직접 편집 가능
   - UTF-8-sig 인코딩 BOM 처리
   - 58개 필드 구조 유지 필수

3. **검증 (`validate.py`)**
   - **범위**: `_add.csv` 파일들 검증 및 `_list.csv`와 교차 검증
   - concept_id 형식 검증: `{domain}_{word}_{meaning}`
   - 단어+의미 조합 중복 검사  
   - 필드 완성도: 95% 이상 권장
   - CSV 인코딩 및 구조 검증

4. **누적 (`accumulator.py`)**
   - **범위**: `_add.csv` ↔ `_list.csv` 교차 검증
   - **2단계 중복 방지 아키텍처**:
     - 1단계: concepts에서 스킵 대상 식별
     - 2단계: 모든 파일에서 일관된 제외 처리
   - **데이터 무결성**: 고아 레코드 방지
   - **트랜잭션 로깅**: JSON 기반 메타데이터 추적

5. **백업 (`backup.py`)**
   - 타임스탬프 기반 백업 폴더 생성
   - 모든 CSV 파일 일괄 백업
   - 복원 시점 선택 가능

> **💡 참고**: JSON 구조는 시스템 내부에서 자동 처리되며, 사용자는 CSV 파일만 관리하면 됩니다.

#### **중복 방지 시스템 특징:**

- **일관된 처리**: concepts에서 중복/스킵된 concept_id는 examples, grammar에서도 자동 제외
- **고아 레코드 방지**: 부분적 데이터 추가로 인한 데이터 불일치 방지  
- **실시간 로깅**: 스킵된 항목과 사유를 실시간으로 표시
- **트랜잭션 보장**: 성공한 추가 작업만 로그에 기록
```

## ✅ 데이터 생성 체크리스트

### 📝 Concepts 컬렉션 체크리스트

- [ ] **concept_id** 필드가 올바른 형식으로 설정됨 ({domain}_{word}_{meaning})
- [ ] 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어)의 단어 정보가 모두 입력됨
- [ ] 각 언어별 발음, 정의, 품사, 동의어, 반의어, 단어 가족, 합성어, 연어가 입력됨
- [ ] 5개 언어의 대표 예문이 모두 입력됨
- [ ] **concept_id 일관성**: 동일한 concept_id를 가진 examples, grammar와 같은 단어 사용 ⭐
- [ ] **중복 검증**: concept_id + 단어+의미 조합 중복 확인 ⭐
- [ ] **예문 중복 검증**: Examples, Grammar와 예문이 다른지 확인 ⭐
- [ ] **예문 목적**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문 ⭐
- [ ] 도메인, 카테고리, 난이도, 이모지, 색상이 설정됨
- [ ] 상황과 목적이 배열 형태로 입력됨
- [ ] CSV 파일에서 쉼표가 포함된 필드는 따옴표로 감쌈

### 📝 Examples 컬렉션 체크리스트

- [ ] **concept_id** 필드가 올바른 형식으로 설정됨 ({domain}_{word}_{meaning})
- [ ] 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어)의 예문이 모두 입력됨
- [ ] 각 언어별 단어 필드가 입력됨
- [ ] **concept_id 일관성**: 동일한 concept_id를 가진 concepts, grammar와 같은 단어 사용 ⭐
- [ ] **중복 검증**: concept_id + 예문 중복 확인 ⭐
- [ ] **예문 중복 검증**: Concepts, Grammar와 예문이 다른지 확인 ⭐
- [ ] **예문 목적**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문 ⭐
- [ ] 도메인, 카테고리, 난이도가 설정됨
- [ ] 상황과 목적이 배열 형태로 입력됨
- [ ] CSV 파일에서 쉼표가 포함된 필드는 따옴표로 감쌈

### 📝 Grammar 컬렉션 체크리스트

- [ ] **concept_id** 필드가 올바른 형식으로 설정됨 ({domain}_{word}_{meaning})
- [ ] 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어)의 문법 정보가 모두 입력됨
- [ ] 각 언어별 제목, 구조, 설명, 예문이 입력됨
- [ ] 각 언어별 단어 필드가 입력됨
- [ ] **concept_id 일관성**: 동일한 concept_id를 가진 concepts, examples와 같은 단어 사용 ⭐
- [ ] **중복 검증**: concept_id + 문법 패턴 중복 확인 ⭐
- [ ] **예문 중복 검증**: Concepts, Examples와 예문이 다른지 확인 ⭐
- [ ] **예문 목적**: 문법 패턴을 설명하는 교육적 목적의 예문 ⭐
- [ ] 도메인, 카테고리, 난이도가 설정됨
- [ ] 상황과 목적이 배열 형태로 입력됨
- [ ] CSV 파일에서 쉼표가 포함된 필드는 따옴표로 감쌈

## 🔍 데이터 중복 방지 가이드

### 중복 검사 기준

#### 1. concept_id 중복 검사
- **주요 기준**: `concept_id` (고유 식별자)
- **형식**: `{domain}_{word}_{meaning}` (예: `food_apple_fruit`)

#### 2. 단어+의미 조합 중복 검사
**같은 단어가 같은 의미로 중복 사용되는 것을 방지**

**검사 방식:**
- concept_id에서 단어와 의미를 추출
- `{english_word}_{meaning}` 조합 중복 검사
- `{korean_word}_{meaning}` 조합 중복 검사

**예시:**
- ✅ **허용**: `food_apple_fruit` (사과-과일) + `technology_apple_company` (애플-회사) → 다의어
- ❌ **차단**: `food_apple_fruit` (사과-과일) + `nature_apple_fruit` (사과-과일) → 중복

#### 3. 컬렉션별 세부 기준

##### Concepts 컬렉션

- **주요 기준**: `concept_id` (고유 식별자)
- **보조 기준**: `expressions.korean.word` + `domain` + `category`
- **추가 검증**: 5개 언어의 단어가 모두 동일한지 확인

#### Examples 컬렉션

- **주요 기준**: `concept_id` (Concepts와 연결)
- **보조 기준**: `korean` + `domain` + `category`
- **추가 검증**: 5개 언어의 예문이 모두 동일한지 확인

#### Grammar 컬렉션

- **주요 기준**: `concept_id` (Concepts와 연결)
- **보조 기준**: `korean_title` + `domain` + `category`
- **추가 검증**: 5개 언어의 문법 패턴이 모두 동일한지 확인

### 중복 방지 전략

1. **concept_id 체계 활용**: 동일한 개념은 반드시 같은 `concept_id` 사용
2. **도메인별 분류**: 같은 도메인 내에서 중복 검사
3. **카테고리별 세분화**: 세부 카테고리로 정확한 분류
4. **다국어 검증**: 5개 언어 모두 확인하여 완전한 중복 방지

### ⚠️ **예문 중복 방지 (중요!)**

**동일한 concept_id를 가진 세 컬렉션의 예문은 반드시 서로 달라야 합니다.**

#### 예문 차별화 원칙

1. **Concepts 컬렉션**: 단어/개념의 **기본 의미**를 보여주는 간단하고 명확한 예문
2. **Examples 컬렉션**: **실제 상황**에서 사용하는 실용적이고 자연스러운 예문
3. **Grammar 컬렉션**: **문법 패턴**을 설명하는 교육적 목적의 예문

#### 올바른 예문 분류 예시

**concept_id: food_apple_fruit**
- **Concepts**: "사과는 맛있다" (기본 의미 표현)
- **Examples**: "마트에서 빨간 사과를 샀어요" (실제 상황)
- **Grammar**: "나는 사과를 먹는다" (문법 패턴 설명)

**concept_id: daily_hello_greeting**
- **Concepts**: "안녕하세요? 잘 지내셨어요?" (기본 인사)
- **Examples**: "안녕하세요? 오늘 날씨가 좋네요" (실제 상황 인사)
- **Grammar**: "안녕하세요! 처음 뵙겠습니다" (문법 패턴)

#### 중복 예문 검증 방법

```bash
# 동일 concept_id 내 예문 중복 검사
grep -A 1 "concept_id" concepts_template_add.csv > concepts_examples.txt
grep -A 1 "concept_id" examples_template_add.csv > examples_examples.txt
grep -A 1 "concept_id" grammar_template_add.csv > grammar_examples.txt

# 자동 검증 시스템 (권장)
python validate.py
```

---

_이 가이드는 다국어 학습 플랫폼의 데이터 품질과 일관성을 보장하기 위해 작성되었습니다._
