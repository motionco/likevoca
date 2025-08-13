# AI 데이터 생성 프롬프트 템플릿 (공통 사용)

## 📚 필수 참조 문서

이 템플릿을 사용하기 위해서는 다음 문서들과 함께 참조해야 합니다:

1. **통합_데이터_가이드.md** - 데이터 구조, 필드 정의, 표준 규칙
2. **데이터_생성_명령어.md** - CSV 헤더 정보, 필드 수 및 형식
3. **데이터_생성_자연어.md** - 자연어 생성 가이드라인 (선택사항)

> ⚠️ **중요**: 위 문서들의 최신 규칙을 반드시 확인하고 적용해야 합니다.

## 📋 프롬프트 템플릿 (변수 교체 방식)

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**배치 정보:**
- 배치 번호: {BATCH_NUMBER} (50개)
- 도메인: {DOMAIN} ({DOMAIN_KR})
- 카테고리: {CATEGORY} ({CATEGORY_KR})
- 난이도: {DIFFICULTY} ({DIFFICULTY_KR})
- 목적: {PURPOSE} ({PURPOSE_KR})
- 상황: {SITUATION} ({SITUATION_KR})
- 품사 비율: {POS_RATIO}

**생성 요구사항:**
1. concept_id 형식: {domain}_{word}_{meaning} (예: {DOMAIN}_hello_greeting)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문 (완전한 문장)
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문 (완전한 문장)
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문 (완전한 문장)

**CSV 형식으로 출력 (3개 파일):**
- concepts_template_add.csv (58개 필드)
- examples_template_add.csv (16개 필드)
- grammar_template_add.csv (31개 필드)

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **완전한 문장**: 모든 예문은 문법적으로 완성된 문장 (주어+동사 포함, 단순 구문 금지)
4. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
5. **품사 비율 준수**: 지정된 품사 비율 정확히 반영
6. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
7. **빈 필드 처리**: 데이터가 없는 경우 '없음' 대신 빈 칸("") 사용
8. **주제 집중**: {TOPIC_DESCRIPTION}

**예문 작성 규칙:**
- 🚫 잘못된 예문: "Warm greeting", "Apple juice" (단순 구문/명사구)
- ✅ 올바른 예문: "I give you a warm greeting.", "I drink fresh apple juice." (완전한 문장)

**특별 지시사항:**
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```

## 🔧 배치별 변수 값 (1-1번 배치 예시)

### 1-1번 배치: daily-routine 기초 인사
```
{BATCH_NUMBER} = "1-1번 배치"
{DOMAIN} = "daily"
{DOMAIN_KR} = "일상생활"
{CATEGORY} = "routine" 
{CATEGORY_KR} = "일과"
{DIFFICULTY} = "basic"
{DIFFICULTY_KR} = "기초"
{PURPOSE} = "greeting"
{PURPOSE_KR} = "인사"
{SITUATION} = "casual,home"
{SITUATION_KR} = "캐주얼하고 집"
{POS_RATIO} = "verb 40%, noun 30%, interjection 30%"
{TOPIC_DESCRIPTION} = "아침 인사, 일과 시작 표현 등을 포함해주세요"
```

## 📊 CSV 헤더 정보 (데이터_생성_명령어.md 준수)

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
3. **완전한 문장**: 모든 예문은 문법적으로 완성된 문장으로 작성
4. **필드 수 정확성**: 각 CSV의 필드 수를 정확히 맞춰야 함
5. **품사 비율**: 지정된 비율 정확히 반영
6. **UTF-8 without BOM**: 인코딩 방식 준수 (한중일 문자 깨짐 방지)
7. **빈 필드**: '없음' 대신 빈 칸("") 사용
8. **CSV 포맷**: 쉼표 포함 시 쌍따옴표 사용

## 🎯 1-1번 배치용 실제 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**배치 정보:**
- 배치 번호: 1-1번 배치 (50개)
- 도메인: daily (일상생활)
- 카테고리: routine (일과)
- 난이도: basic (기초)
- 목적: greeting (인사)
- 상황: casual,home (캐주얼하고 집)
- 품사 비율: verb 40%, noun 30%, interjection 30%

**생성 요구사항:**
1. concept_id 형식: {domain}_{word}_{meaning} (예: daily_hello_greeting)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문 (완전한 문장)
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문 (완전한 문장)
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문 (완전한 문장)

**CSV 형식으로 출력 (3개 파일):**
- concepts_template_add.csv (58개 필드)
- examples_template_add.csv (16개 필드)
- grammar_template_add.csv (31개 필드)

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **완전한 문장**: 모든 예문은 문법적으로 완성된 문장 (주어+동사 포함, 단순 구문 금지)
4. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
5. **품사 비율 준수**: verb 40%, noun 30%, interjection 30% 정확히 반영
6. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
7. **빈 필드 처리**: 데이터가 없는 경우 '없음' 대신 빈 칸("") 사용
8. **주제 집중**: 아침 인사, 일과 시작 표현 등을 포함해주세요

**예문 작성 규칙:**
- 🚫 잘못된 예문: "Warm greeting", "Apple juice" (단순 구문/명사구)
- ✅ 올바른 예문: "I give you a warm greeting.", "I drink fresh apple juice." (완전한 문장)

**특별 지시사항:**
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```