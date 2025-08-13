# AI 데이터 생성 프롬프트 템플릿 Plus (통합 가이드 참조형)

## 📋 개요

이 템플릿은 **통합_데이터_가이드.md** 문서만을 참조하여 다국어 학습 플랫폼 데이터를 생성합니다. 데이터_생성_자연어.md 없이도 동일한 품질의 데이터를 생성할 수 있도록 필요한 전략을 내장하고 있습니다.

## 🎯 통합 가이드 참조형 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 {COUNT}개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

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

**단계별 생성 전략:**
- **1단계 (기초 구축 - 2,000개)**: basic/intermediate 중심 (70/30), 모든 도메인 균등 분배, 일상 필수 표현 우선
- **2단계 (실용 확장 - 3,000개)**: intermediate/advanced 중심 (60/40), 실용성 강화, 상황별 표현 확대
- **3단계 (심화 완성 - 3,000개)**: advanced/fluent 중심 (70/30), 전문성 강화, 복잡한 문법 패턴
- **4단계 (최종 보완 - 2,000개)**: fluent/technical 중심 (50/50), 부족 영역 보완, 전문 용어

**{BATCH_STAGE} 단계 특화 요구사항:**
{STAGE_REQUIREMENTS}

**발음 표기법 (통합_데이터_가이드.md 준수):**
- **Korean**: a-chim, an-nyeong (하이픈 구분, 로마자)
- **English**: /ˈmɔːrnɪŋ/, /weɪk/ (IPA 표기)
- **Chinese**: zao chen, ni hao (pinyin, 성조 없음)
- **Japanese**: asa, konnichiwa (로마자 헵번식)
- **Spanish**: ma-nya-na, o-la (하이픈 구분, 로마자)

**예문 차별화 원칙 (통합_데이터_가이드.md 기준):**
- **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
- **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문
- **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**특별 지시사항:**
- 통합_데이터_가이드.md의 모든 표준을 엄격히 준수해주세요
- 중복 방지 규칙을 철저히 적용해주세요
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
- `{STAGE_REQUIREMENTS}`: 단계별 특화 요구사항

### 단계별 특화 요구사항 ({STAGE_REQUIREMENTS})

#### 1단계 (기초 구축)
```
- 일상생활 필수 표현 우선 (인사, 감사, 사과, 기본 질문)
- 기초 어휘 중심 (숫자, 색깔, 가족, 음식, 시간)
- 단순한 문법 구조 (현재시제, be동사, 기본 조사)
- 모든 도메인에서 기초 개념 균등 분배
- 상황은 casual, home 중심으로 친근한 환경
```

#### 2단계 (실용 확장)
```
- 실생활 활용도 높은 표현 (쇼핑, 식당, 교통, 업무)
- 다양한 시제와 문법 구조 (과거, 미래, 조건문)
- 상황별 맞춤 표현 (formal/casual 구분, 장소별 표현)
- business, travel, education 도메인 비중 증가
- 복합 문장과 연결어 사용 확대
```

#### 3단계 (심화 완성)
```
- 고급 어휘와 관용 표현 (감정 표현, 추상적 개념)
- 복잡한 문법 패턴 (가정법, 관계절, 피동태)
- 문화적 맥락이 있는 표현 (예의, 관습, 전통)
- culture, entertainment, technology 도메인 강화
- 뉘앙스와 감정이 포함된 자연스러운 표현
```

#### 4단계 (최종 보완)
```
- 전문 분야별 용어 (의료, 법률, 기술, 학술)
- 고급 문학적 표현과 격식 있는 표현
- 부족한 도메인과 카테고리 집중 보완
- health, technology, other 도메인 비중 증가
- 원어민 수준의 자연스럽고 정확한 표현
```

## 📝 사용 예시

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

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

**단계별 생성 전략:**
- **1단계 (기초 구축 - 2,000개)**: basic/intermediate 중심 (70/30), 모든 도메인 균등 분배, 일상 필수 표현 우선
- **2단계 (실용 확장 - 3,000개)**: intermediate/advanced 중심 (60/40), 실용성 강화, 상황별 표현 확대
- **3단계 (심화 완성 - 3,000개)**: advanced/fluent 중심 (70/30), 전문성 강화, 복잡한 문법 패턴
- **4단계 (최종 보완 - 2,000개)**: fluent/technical 중심 (50/50), 부족 영역 보완, 전문 용어

**1단계 단계 특화 요구사항:**
- 일상생활 필수 표현 우선 (인사, 감사, 사과, 기본 질문)
- 기초 어휘 중심 (숫자, 색깔, 가족, 음식, 시간)
- 단순한 문법 구조 (현재시제, be동사, 기본 조사)
- 모든 도메인에서 기초 개념 균등 분배
- 상황은 casual, home 중심으로 친근한 환경

**발음 표기법 (통합_데이터_가이드.md 준수):**
- **Korean**: a-chim, an-nyeong (하이픈 구분, 로마자)
- **English**: /ˈmɔːrnɪŋ/, /weɪk/ (IPA 표기)
- **Chinese**: zao chen, ni hao (pinyin, 성조 없음)
- **Japanese**: asa, konnichiwa (로마자 헵번식)
- **Spanish**: ma-nya-na, o-la (하이픈 구분, 로마자)

**예문 차별화 원칙 (통합_데이터_가이드.md 기준):**
- **Concepts**: 단어/개념의 기본 의미를 보여주는 간단하고 명확한 예문
- **Examples**: 실제 상황에서 사용하는 실용적이고 자연스러운 예문
- **Grammar**: 문법 패턴을 설명하는 교육적 목적의 예문

**특별 지시사항:**
- 통합_데이터_가이드.md의 모든 표준을 엄격히 준수해주세요
- 중복 방지 규칙을 철저히 적용해주세요
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```

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

## 📊 10,000개 데이터 생성 전략 (4단계 × 50개씩 = 200배치)

### 1단계: 기초 구축 (2,000개 - 40배치)
- **난이도 분포**: basic 70%, intermediate 30%
- **도메인 분포**: 모든 도메인 균등 분배
- **목적**: 일상 필수 표현 구축
- **품사**: noun 40%, verb 35%, others 25%

### 2단계: 실용 확장 (3,000개 - 60배치)  
- **난이도 분포**: intermediate 60%, advanced 40%
- **도메인 분포**: daily, business, travel, education 비중 증가
- **목적**: 실생활 활용도 극대화
- **품사**: verb 45%, noun 30%, others 25%

### 3단계: 심화 완성 (3,000개 - 60배치)
- **난이도 분포**: advanced 70%, fluent 30%
- **도메인 분포**: culture, entertainment, technology 강화
- **목적**: 고급 표현과 복잡한 문법
- **품사**: adjective, adverb 비중 증가

### 4단계: 최종 보완 (2,000개 - 40배치)
- **난이도 분포**: fluent 50%, technical 50%
- **도메인 분포**: health, technology, other 집중
- **목적**: 전문 분야와 부족 영역 보완
- **품사**: 전문 용어 중심

## ✅ 품질 검증 체크리스트

### 통합 가이드 준수 확인
- [ ] 통합_데이터_가이드.md의 concept_id 형식 준수
- [ ] 통합_데이터_가이드.md의 발음 표기법 적용
- [ ] 통합_데이터_가이드.md의 CSV 헤더 순서 정확성
- [ ] 통합_데이터_가이드.md의 중복 방지 규칙 적용

### 단계별 전략 확인
- [ ] 지정된 단계의 난이도 분포 준수
- [ ] 단계별 특화 요구사항 반영
- [ ] 도메인별 비중 조절 적절성
- [ ] 품사 비율 정확성

### 데이터 품질 확인
- [ ] concept_id 일관성 (동일 ID = 동일 단어)
- [ ] 예문 차별화 (concepts/examples/grammar 모두 다름)
- [ ] 모든 예문이 완전한 문장 형태 (주어+동사 포함, 문법적으로 완성)
- [ ] 5개 언어 완전성 (한국어, 영어, 일본어, 중국어, 스페인어)
- [ ] UTF-8 without BOM 인코딩 적용 (문자 깨짐 방지)
- [ ] CSV 쉼표 처리 (따옴표로 감싸기)
- [ ] 빈 필드는 '없음' 대신 빈 칸("") 사용

---

_이 템플릿은 통합_데이터_가이드.md를 참조하여 체계적이고 전략적인 데이터 생성을 지원합니다._
