# AI 데이터 생성 프롬프트 템플릿 One (통합 가이드 + 자연어 참조형)

## 📋 개요

이 템플릿은 **통합_데이터_가이드.md**와 **데이터_생성_자연어.md** 문서를 참조하여 다국어 학습 플랫폼 데이터를 생성합니다.

## 🎯 기본 프롬프트 구조

```markdown
다국어 학습 플랫폼용 데이터 {COUNT}개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요
- 데이터_생성_자연어.md의 {BATCH_STAGE}단계 가이드를 따라주세요

**배치 정보:**
- 배치 번호: {BATCH_NUMBER}
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
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문  
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**CSV 형식으로 출력 (3개 파일):**
- concepts_template_add.csv (58개 필드)
- examples_template_add.csv (16개 필드)
- grammar_template_add.csv (31개 필드)

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
4. **품사 비율 준수**: {POS_RATIO} 정확히 반영
5. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
6. **주제 집중**: {TOPIC_DESCRIPTION}

**특별 지시사항:**
- 통합_데이터_가이드.md의 발음 표기법을 정확히 따라주세요
- 데이터_생성_자연어.md의 {BATCH_STAGE}단계 분포 전략을 반영해주세요
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
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

## 📝 사용 예시

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요
- 데이터_생성_자연어.md의 1단계 가이드를 따라주세요

**배치 정보:**
- 배치 번호: batch_1-1
- 도메인: daily (일상생활)
- 카테고리: routine (일과)
- 난이도: basic (기초)
- 목적: greeting (인사)
- 상황: casual,home (캐주얼,가정)
- 품사 비율: verb 40%, noun 30%, interjection 30%

**생성 요구사항:**
1. concept_id 형식: daily_{word}_{meaning} (예: daily_hello_greeting)
2. 5개 언어 모두 포함: 한국어, 영어, 일본어, 중국어, 스페인어
3. 세 가지 컬렉션 데이터 생성:
   - **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
   - **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문  
   - **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**CSV 형식으로 출력 (3개 파일):**
- concepts_template_add.csv (58개 필드)
- examples_template_add.csv (16개 필드)
- grammar_template_add.csv (31개 필드)

**핵심 준수사항:**
1. **concept_id 일관성**: 동일 concept_id의 concepts, examples, grammar는 반드시 **같은 단어** 사용
2. **예문 차별화**: 동일 concept_id의 세 컬렉션 예문은 모두 **완전히 달라야 함**
3. **필드 수 준수**: concepts(58개), examples(16개), grammar(31개) 필드 정확히 맞춤
4. **품사 비율 준수**: verb 40%, noun 30%, interjection 30% 정확히 반영
5. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
6. **주제 집중**: 아침 인사와 일과 시작 표현을 포함해주세요

**특별 지시사항:**
- 통합_데이터_가이드.md의 발음 표기법을 정확히 따라주세요
- 데이터_생성_자연어.md의 1단계 분포 전략을 반영해주세요
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```

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

## ✅ 품질 검증 체크리스트

### 참조 문서 준수 확인
- [ ] 통합_데이터_가이드.md의 concept_id 형식 준수
- [ ] 통합_데이터_가이드.md의 발음 표기법 적용
- [ ] 통합_데이터_가이드.md의 CSV 헤더 순서 정확성
- [ ] 데이터_생성_자연어.md의 단계별 분포 전략 반영

### 데이터 품질 확인
- [ ] concept_id 일관성 (동일 ID = 동일 단어)
- [ ] 예문 차별화 (concepts/examples/grammar 모두 다름)
- [ ] 모든 예문이 완전한 문장 형태 (주어+동사 포함, 문법적으로 완성)
- [ ] 5개 언어 완전성 (한국어, 영어, 일본어, 중국어, 스페인어)
- [ ] UTF-8 without BOM 인코딩 적용
- [ ] CSV 쉼표 처리 (따옴표로 감싸기)
- [ ] 빈 필드 처리 ('없음' 대신 빈 칸 사용)

---

_이 템플릿은 통합_데이터_가이드.md와 데이터_생성_자연어.md를 참조하여 고품질 데이터를 생성합니다._
