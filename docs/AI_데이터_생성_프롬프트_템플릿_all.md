# AI 데이터 생성 프롬프트 템플릿 All (완전 독립형)

## 📋 개요

이 템플릿은 **외부 문서에 의존하지 않고** 완전히 독립적으로 다국어 학습 플랫폼 데이터를 생성할 수 있습니다. 통합_데이터_가이드.md와 데이터_생성_자연어.md의 모든 핵심 내용을 포함하고 있습니다.

## 🎯 완전 독립형 프롬프트

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
- 생성 단계: {BATCH_STAGE}

**생성 요구사항:**
1. concept_id 형식: {domain}_{word}_{meaning} (예: {DOMAIN}_hello_greeting)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문  
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**CSV 형식으로 출력 (3개 파일):**

**1. concepts_template_add.csv (58개 필드):**
```
concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
```

**2. examples_template_add.csv (16개 필드):**
```
concept_id,domain,category,difficulty,situation,purpose,korean,english,japanese,chinese,spanish,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

**3. grammar_template_add.csv (31개 필드):**
```
concept_id,domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,korean_example,english_title,english_structure,english_description,english_example,japanese_title,japanese_structure,japanese_description,japanese_example,chinese_title,chinese_structure,chinese_description,chinese_example,spanish_title,spanish_structure,spanish_description,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
4. **품사 비율 준수**: {POS_RATIO} 정확히 반영
5. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
6. **주제 집중**: {TOPIC_DESCRIPTION}

**발음 표기법 (브라우저 호환):**
- **Korean**: a-chim, an-nyeong (하이픈 구분, 로마자)
- **English**: /ˈmɔːrnɪŋ/, /weɪk/ (IPA 표기)
- **Chinese**: zao chen, ni hao (pinyin, 성조 없음)
- **Japanese**: asa, konnichiwa (로마자 헵번식)
- **Spanish**: ma-nya-na, o-la (하이픈 구분, 로마자)

**도메인 (12개):** daily, food, education, travel, business, health, technology, culture, entertainment, nature, sports, other

**난이도 (5개):** basic, intermediate, advanced, fluent, technical

**목적 (12개):** greeting, question, request, suggestion, emotion, instruction, description, gratitude, opinion, agreement, apology, refusal

**상황 태그 (13개):** formal, casual, polite, urgent, work, school, social, travel, shopping, home, public, online, medical

**품사 (11개):** noun, verb, adjective, adverb, preposition, conjunction, determiner, pronoun, interrogative, interjection, other

**생성 단계별 전략:**
- **1단계 (기초 구축)**: basic/intermediate 중심, 모든 도메인 균등 분배
- **2단계 (실용 확장)**: intermediate/advanced 중심, 실용성 강화
- **3단계 (심화 완성)**: advanced/fluent 중심, 전문성 강화  
- **4단계 (최종 보완)**: fluent/technical 중심, 부족 영역 보완

**예문 차별화 예시:**
- **Concepts**: "안녕하세요" (기본 의미)
- **Examples**: "오늘 아침 이웃에게 안녕하세요라고 인사했어요" (실제 상황)
- **Grammar**: "안녕하세요는 정중한 인사 표현입니다" (문법 설명)

**CSV 쉼표 처리 예시:**
```csv
korean,english
"안녕하세요, 반갑습니다","Hello, nice to meet you"
```

**특별 지시사항:**
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
- UTF-8 without BOM 인코딩으로 문자 깨짐 방지
- 동일 concept_id 내에서 같은 단어 사용 필수
- 예문은 자연스럽고 실제 사용 가능한 표현으로 작성
```

## 🔄 변수 교체 가이드

### 필수 변수
- `{COUNT}`: 생성할 데이터 개수 (예: "50")
- `{BATCH_STAGE}`: 생성 단계 (예: "1단계", "2단계", "3단계", "4단계")
- `{BATCH_NUMBER}`: 배치 번호 (예: "batch_1-1", "batch_2-3")
- `{DOMAIN}`: 영어 도메인 (예: "daily", "food", "travel")
- `{DOMAIN_KR}`: 한국어 도메인 (예: "일상생활", "음식", "여행")
- `{CATEGORY}`: 영어 카테고리 (예: "routine", "fruit", "transportation")
- `{CATEGORY_KR}`: 한국어 카테고리 (예: "일과", "과일", "교통")
- `{DIFFICULTY}`: 영어 난이도 (예: "basic", "intermediate", "advanced")
- `{DIFFICULTY_KR}`: 한국어 난이도 (예: "기초", "중급", "고급")
- `{PURPOSE}`: 영어 목적 (예: "greeting", "description", "question")
- `{PURPOSE_KR}`: 한국어 목적 (예: "인사", "설명", "질문")
- `{SITUATION}`: 영어 상황 (예: "casual,home", "formal,work")
- `{SITUATION_KR}`: 한국어 상황 (예: "캐주얼,가정", "공식,직장")
- `{POS_RATIO}`: 품사 비율 (예: "verb 40%, noun 30%, interjection 30%")
- `{TOPIC_DESCRIPTION}`: 주제 설명 (예: "아침 인사와 일과 시작 표현을 포함해주세요")

## 📊 도메인별 카테고리 가이드

### daily (일상생활)
household, family, routine, clothing, furniture, shopping, transportation, communication, personal_care, leisure, relationships, emotions, time, weather_talk, other

### food (음식)
fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert, other

### travel (여행)
transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, culture, emergency, documents, sightseeing, local_food, souvenir, other

### business (비즈니스)
meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup, other

### education (교육)
teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation, examination, university, library, other

### nature (자연)
animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain, other

### technology (기술)
computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation, it_hardware, development, other

### health (건강)
exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment, other

### sports (스포츠)
football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition, other

### entertainment (엔터테인먼트)
movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography, other

### culture (문화)
tradition, customs, language, religion, festival, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity, other

### other (기타)
hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation, science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, thesis, other

## ⚡ 단계별 생성 가이드

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

## 📝 사용 예시

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**배치 정보:**
- 배치 번호: batch_1-1
- 도메인: daily (일상생활)
- 카테고리: routine (일과)
- 난이도: basic (기초)
- 목적: greeting (인사)
- 상황: casual,home (캐주얼,가정)
- 품사 비율: verb 40%, noun 30%, interjection 30%
- 생성 단계: 1단계

**생성 요구사항:**
1. concept_id 형식: daily_{word}_{meaning} (예: daily_hello_greeting)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문  
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

[나머지 내용은 위의 완전 독립형 프롬프트와 동일]
```

## ✅ 품질 검증 체크리스트

### 데이터 구조 확인
- [ ] concept_id 형식 정확성 ({domain}_{word}_{meaning})
- [ ] CSV 헤더 필드 수 정확성 (concepts: 58, examples: 16, grammar: 31)
- [ ] 5개 언어 완전성 (한국어, 영어, 일본어, 중국어, 스페인어)

### 내용 품질 확인
- [ ] concept_id 일관성 (동일 ID = 동일 단어)
- [ ] 예문 차별화 (concepts/examples/grammar 모두 다름)
- [ ] 모든 예문이 완전한 문장 형태 (주어+동사 포함, 문법적으로 완성)
- [ ] 발음 표기법 준수 (언어별 정해진 형식)
- [ ] 품사 비율 준수 (지정된 비율 정확히 반영)

### CSV 형식 확인
- [ ] UTF-8 without BOM 인코딩 적용 (문자 깨짐 방지)
- [ ] 쉼표 포함 필드 따옴표 처리
- [ ] 헤더 순서 정확성
- [ ] 빈 필드는 '없음' 대신 빈 칸("") 사용

### 단계별 전략 확인
- [ ] 생성 단계에 맞는 난이도 분포
- [ ] 도메인별 균등 분배 (1단계) 또는 전문성 강화 (3-4단계)
- [ ] 주제 집중도 적절성

---

_이 템플릿은 외부 문서 없이도 독립적으로 고품질 다국어 학습 데이터를 생성할 수 있습니다._
