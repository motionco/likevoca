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

## 🔄 데이터 생성 체크리스트

### 새로운 개념(Concepts) 추가 시:

1. **도메인 선택**: 12개 도메인 중 가장 적절한 것 선택
2. **카테고리 선택**: 선택한 도메인의 카테고리 중 선택
3. **난이도 설정**: basic → intermediate → advanced → fluent → technical 순서로 적절한 수준 선택
4. **이모지 선택**: 카테고리에 매핑된 12-15개 이모지 중 선택
5. **언어별 표현**: 4개 언어(한국어, 영어, 일본어, 중국어) 모두 작성
6. **고급 필드**: synonyms, antonyms, word_family, compound_words, collocations 작성
7. **예문**: representative_example에 4개 언어 모두 작성
8. **상황/목적**: situation 배열과 purpose 단일값 설정

### 품질 관리 요구사항:

- ✅ **필수 필드**: 모든 필수 필드 작성 완료
- ✅ **언어 일관성**: 4개 언어 간 의미와 맥락 일치
- ✅ **난이도 적정성**: 설정한 난이도에 맞는 어휘와 문법 사용
- ✅ **카테고리 적합성**: 선택한 카테고리와 내용 일치
- ✅ **예문 자연성**: 실제 상황에서 사용 가능한 자연스러운 표현
- ✅ **Purpose 값 검증**: 정의된 12개 purpose 값만 사용
- ✅ **Domain 값 검증**: 정의된 12개 domain 값만 사용
- ✅ **Situation 값 검증**: 정의된 13개 situation 값만 사용

## ⚠️ 문자 깨짐 방지

### 📋 필수 점검 사항

1. **파일 인코딩**: UTF-8 with BOM 필수
2. **문자 패턴**: `?`, `?` 형태 깨짐 확인
3. **정기 점검**: 주간 단위 문자 검증

---

_이 가이드는 한국어 학습 플랫폼의 데이터 품질과 일관성을 보장하기 위해 작성되었습니다._
