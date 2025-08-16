# Batch 1-2: Food Fruit Basic Description

## 📋 배치 정보
- **배치 번호**: batch_1-2
- **도메인**: food (음식)
- **카테고리**: fruit (과일)
- **난이도**: basic (기초)
- **목적**: description (설명)
- **상황**: casual,shopping (캐주얼,쇼핑)
- **품사 비율**: noun 50%, adjective 30%, verb 20%
- **생성 단계**: 1단계 (기초 구축)

## 🎯 완성된 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

**배치 정보:**
- 배치 번호: batch_1-2
- 도메인: food (음식)
- 카테고리: fruit (과일)
- 난이도: basic (기초)
- 목적: description (설명)
- 상황: casual,shopping (캐주얼,쇼핑)
- 품사 비율: noun 50%, adjective 30%, verb 20%
- 생성 단계: 1단계

**생성 요구사항:**
1. concept_id 형식: food_{word}_{meaning} (예: food_apple_fruit)
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
5. **품사 비율 준수**: noun 50%, adjective 30%, verb 20% 정확히 반영
6. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
7. **빈 필드 처리**: 데이터가 없는 경우 '없음' 대신 빈 칸("") 사용
8. **주제 집중**: 과일의 종류, 색깔, 맛, 영양 등을 설명하는 표현을 포함해주세요

**단계별 생성 전략:**
- **1단계 (기초 구축 - 2,000개)**: basic/intermediate 중심 (70/30), 모든 도메인 균등 분배, 일상 필수 표현 우선

**1단계 특화 요구사항:**
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

**예문 작성 규칙:**
- 🚫 잘못된 예문: "Red apple", "Sweet fruit" (단순 구문/명사구)
- ✅ 올바른 예문: "This apple is red.", "The fruit tastes sweet." (완전한 문장)

**특별 지시사항:**
- 통합_데이터_가이드.md의 모든 표준을 엄격히 준수해주세요
- 중복 방지 규칙을 철저히 적용해주세요
- 한 번에 모든 데이터를 생성하지 말고, concepts 파일 먼저 생성해주세요
- 데이터가 많아 응답이 길어질 수 있으니 분할해서 요청하겠습니다
```

## 📝 주제 설명
과일의 종류, 색깔, 맛, 영양, 구매 상황 등을 설명하는 기초적인 표현들을 포함합니다.

## ⚡ 사용 방법
1. 위 프롬프트를 AI에 입력
2. concepts 파일 먼저 생성 요청
3. 동일한 concept_id로 examples, grammar 파일 순차 생성
4. UTF-8 without BOM 형식으로 저장