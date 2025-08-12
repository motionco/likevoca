# AI 데이터 생성 프롬프트 템플릿 - 1-2번 배치

## 📋 배치 정보

### 1-2번 배치: daily-family 기초 질문
```
{BATCH_NUMBER} = "1-2번 배치"
{DOMAIN} = "daily"
{DOMAIN_KR} = "일상생활"
{CATEGORY} = "family" 
{CATEGORY_KR} = "가족"
{DIFFICULTY} = "basic"
{DIFFICULTY_KR} = "기초"
{PURPOSE} = "question"
{PURPOSE_KR} = "질문"
{SITUATION} = "casual,home"
{SITUATION_KR} = "캐주얼하고 집"
{POS_RATIO} = "interrogative 40%, verb 30%, noun 30%"
{TOPIC_DESCRIPTION} = "가족 구성원에 대한 기본적인 질문을 포함해주세요"
```

## 🎯 1-2번 배치용 실제 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**배치 정보:**
- 배치 번호: 1-2번 배치 (50개)
- 도메인: daily (일상생활)
- 카테고리: family (가족)
- 난이도: basic (기초)
- 목적: question (질문)
- 상황: casual,home (캐주얼하고 집)
- 품사 비율: interrogative 40%, verb 30%, noun 30%

**생성 요구사항:**
1. concept_id 형식: {domain}_{word}_{meaning} (예: daily_family_question)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문  
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**CSV 형식으로 출력 (3개 파일):**
- batch_1-2_concepts_template_add.csv (58개 필드)
- batch_1-2_examples_template_add.csv (16개 필드)
- batch_1-2_grammar_template_add.csv (31개 필드)

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
4. **품사 비율 준수**: interrogative 40%, verb 30%, noun 30% 정확히 반영
5. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 인코딩
6. **주제 집중**: 가족 구성원에 대한 기본적인 질문을 포함해주세요

**발음 표기법 (브라우저 호환):**
- **Korean**: `a-chim`, `an-nyeong` (하이픈 구분, 로마자)
- **English**: `/ˈmɔːrnɪŋ/`, `/weɪk/` (IPA 표기)
- **Chinese**: `zao chen`, `ni hao` (pinyin, 성조 없음)
- **Japanese**: `asa`, `konnichiwa` (로마자 헵번식)
- **Spanish**: `ma-nya-na`, `o-la` (하이픈 구분, 로마자)

**특별 지시사항:**
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```

## 📊 CSV 헤더 정보

### concepts_template_add.csv (58개 필드)
```csv
concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
```

### examples_template_add.csv (16개 필드)
```csv
concept_id,domain,category,difficulty,situation,purpose,korean,english,japanese,chinese,spanish,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

### grammar_template_add.csv (31개 필드)
```csv
concept_id,domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,korean_example,english_title,english_structure,english_description,english_example,japanese_title,japanese_structure,japanese_description,japanese_example,chinese_title,chinese_structure,chinese_description,chinese_example,spanish_title,spanish_structure,spanish_description,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
```

## ⚠️ 필수 준수사항

1. **동일 concept_id, 동일 단어**: concepts, examples, grammar에서 반드시 같은 단어 사용
2. **예문 차별화**: 세 컬렉션의 예문은 모두 달라야 함
3. **필드 수 정확성**: 각 CSV의 필드 수를 정확히 맞춰야 함
4. **품사 비율**: interrogative 40%, verb 30%, noun 30% 정확히 반영
5. **CSV 포맷**: 쉼표 포함 시 쌍따옴표 사용

## 🎯 주제 특성

**가족 관련 질문 표현:**
- 가족 구성원 소개 (아버지, 어머니, 형제자매)
- 가족 관계와 호칭
- 가족 활동과 일상
- 가족과의 대화
- 가정 내 역할과 책임
