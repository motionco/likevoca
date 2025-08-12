# AI 데이터 생성 프롬프트 (1-3번 배치: daily-evening 기초 인사)

## 🎯 배치 정보
- **배치 번호**: 1-3번 배치
- **도메인**: daily (일상생활)  
- **카테고리**: evening (저녁)
- **난이도**: basic (기초)
- **목적**: greeting (인사)
- **상황**: polite,home (정중하고 집)
- **품사 비율**: other:50,noun:30,verb:20

## 📝 생성 요청 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**배치 정보:**
- 배치 번호: 1-3번 배치 (50개)
- 도메인: daily (일상생활)
- 카테고리: evening (저녁)
- 난이도: basic (기초)
- 목적: greeting (인사)
- 상황: polite,home (정중하고 집)
- 품사 비율: other 50%, noun 30%, verb 20%

**생성 요구사항:**

1. **CSV 형식으로 생성**: 다음 컬럼 순서를 정확히 따라주세요
   ```
   concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean,korean_pronunciation,korean_meaning,korean_pos,korean_synonyms,korean_antonyms,korean_related,korean_collocations,korean_variations,english,english_pronunciation,english_meaning,english_pos,english_synonyms,english_antonyms,english_related,english_collocations,english_variations,chinese,chinese_pronunciation,chinese_meaning,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_related,chinese_collocations,chinese_variations,japanese,japanese_pronunciation,japanese_meaning,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_related,japanese_collocations,japanese_variations,spanish,spanish_pronunciation,spanish_meaning,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_related,spanish_collocations,spanish_variations
   ```

2. **concept_id 생성 규칙**: daily_evening_[고유내용] 형태
   - 예: daily_evening_greeting, daily_evening_farewell, daily_evening_family

3. **저녁 인사 관련 주제 포함**:
   - 저녁 인사말 (안녕히 주무세요, 좋은 저녁 되세요 등)
   - 하루 마무리 표현
   - 가족과의 저녁 시간 인사
   - 저녁 식사 관련 정중한 표현
   - 내일 약속 관련 인사
   - 저녁 휴식 관련 표현

4. **품사 분배** (총 50개):
   - other (감탄사, 관용구 등): 25개 (50%)
   - noun (명사): 15개 (30%) 
   - verb (동사): 10개 (20%)

5. **다국어 요구사항**:
   - 각 언어별 정확한 발음 표기
   - 한국어: 로마자 표기법 사용
   - 영어: IPA 발음기호 사용
   - 중국어: 병음 표기
   - 일본어: 로마자 표기
   - 스페인어: 스페인어 발음 표기

6. **이모지와 색상**:
   - 저녁, 밤, 휴식 관련 이모지 사용
   - 따뜻하고 편안한 느낌의 색상 코드 (hex) 사용

7. **상황 적용**:
   - polite: 정중한 표현 사용
   - home: 가정적이고 편안한 상황

**출력 형태**: 헤더를 포함한 완전한 CSV 형식으로 50개 항목 생성
```

## 🔧 변수 치환용 템플릿

```markdown
다국어 학습 플랫폼용 데이터 {COUNT}개를 생성해주세요.

**배치 정보:**
- 배치 번호: {BATCH_NUMBER} ({COUNT}개)
- 도메인: {DOMAIN} ({DOMAIN_KR})
- 카테고리: {CATEGORY} ({CATEGORY_KR})
- 난이도: {DIFFICULTY} ({DIFFICULTY_KR})
- 목적: {PURPOSE} ({PURPOSE_KR})
- 상황: {SITUATION} ({SITUATION_KR})
- 품사 비율: {POS_RATIO}

**생성 요구사항:**

1. **CSV 형식으로 생성**: 다음 컬럼 순서를 정확히 따라주세요
   ```
   concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean,korean_pronunciation,korean_meaning,korean_pos,korean_synonyms,korean_antonyms,korean_related,korean_collocations,korean_variations,english,english_pronunciation,english_meaning,english_pos,english_synonyms,english_antonyms,english_related,english_collocations,english_variations,chinese,chinese_pronunciation,chinese_meaning,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_related,chinese_collocations,chinese_variations,japanese,japanese_pronunciation,japanese_meaning,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_related,japanese_collocations,japanese_variations,spanish,spanish_pronunciation,spanish_meaning,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_related,spanish_collocations,spanish_variations
   ```

2. **concept_id 생성 규칙**: {DOMAIN}_{CATEGORY}_[고유내용] 형태

3. **주제 포함**: {TOPIC_DESCRIPTION}

4. **품사 분배** (총 {COUNT}개): {POS_DISTRIBUTION}

5. **다국어 요구사항**:
   - 각 언어별 정확한 발음 표기
   - 한국어: 로마자 표기법 사용
   - 영어: IPA 발음기호 사용
   - 중국어: 병음 표기
   - 일본어: 로마자 표기
   - 스페인어: 스페인어 발음 표기

6. **이모지와 색상**: {EMOJI_COLOR_GUIDE}

7. **상황 적용**: {SITUATION_GUIDE}

**출력 형태**: 헤더를 포함한 완전한 CSV 형식으로 {COUNT}개 항목 생성
```

## 🔧 배치별 변수 값 (1-3번 배치)

### 1-3번 배치: daily-evening 기초 인사
```
{BATCH_NUMBER} = "1-3번 배치"
{COUNT} = "50"
{DOMAIN} = "daily"
{DOMAIN_KR} = "일상생활"
{CATEGORY} = "evening" 
{CATEGORY_KR} = "저녁"
{DIFFICULTY} = "basic"
{DIFFICULTY_KR} = "기초"
{PURPOSE} = "greeting"
{PURPOSE_KR} = "인사"
{SITUATION} = "polite,home"
{SITUATION_KR} = "정중하고 집"
{POS_RATIO} = "other 50%, noun 30%, verb 20%"
{POS_DISTRIBUTION} = "other (감탄사, 관용구 등): 25개 (50%), noun (명사): 15개 (30%), verb (동사): 10개 (20%)"
{TOPIC_DESCRIPTION} = "저녁 인사말, 하루 마무리 표현, 가족과의 저녁 시간 인사, 저녁 식사 관련 정중한 표현, 내일 약속 관련 인사, 저녁 휴식 관련 표현을 포함해주세요"
{EMOJI_COLOR_GUIDE} = "저녁, 밤, 휴식 관련 이모지 사용하고 따뜻하고 편안한 느낌의 색상 코드 (hex) 사용"
{SITUATION_GUIDE} = "polite: 정중한 표현 사용, home: 가정적이고 편안한 상황"
```

## 📋 생성 후 확인사항

1. **파일 형식**: UTF-8 인코딩의 CSV 파일
2. **데이터 개수**: 정확히 50개 항목 (헤더 제외)
3. **품사 분배**: other 25개, noun 15개, verb 10개
4. **concept_id**: daily_evening_로 시작하는 고유 ID
5. **다국어 완성도**: 5개 언어 모두 완전한 번역과 발음 표기
6. **CSV 형식**: 쉼표로 구분된 올바른 CSV 구조
7. **특수문자**: 쉼표가 포함된 필드는 따옴표로 감싸기
