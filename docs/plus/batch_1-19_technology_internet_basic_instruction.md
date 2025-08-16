# AI 데이터 생성 프롬프트 - Batch 1-19: Technology Internet Basic Instruction

## 📋 배치 정보
- **배치 번호**: batch_1-19 (50개)
- **도메인**: technology (기술)
- **카테고리**: internet (인터넷)
- **난이도**: basic (기초)
- **목적**: instruction (지시/설명)
- **상황**: polite,social (정중,사교)
- **품사 비율**: verb 50%, noun 30%, adjective 20%
- **생성 단계**: 1단계 (기초 구축)

## 🎯 AI 데이터 생성 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

**배치 정보:**
- 배치 번호: batch_1-19
- 도메인: technology (기술)
- 카테고리: internet (인터넷)
- 난이도: basic (기초)
- 목적: instruction (지시/설명)
- 상황: polite,social (정중,사교)
- 품사 비율: verb 50%, noun 30%, adjective 20%
- 생성 단계: 1단계 (기초 구축)

**생성 요구사항:**
1. concept_id 형식: technology_{word}_{meaning} (예: technology_click_action)
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
5. **품사 비율 준수**: verb 50%, noun 30%, adjective 20% 정확히 반영
6. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
7. **빈 필드 처리**: 데이터가 없는 경우 '없음' 대신 빈 칸("") 사용
8. **주제 집중**: 인터넷 사용법, 컴퓨터 조작 설명, 기술 안내 등을 포함해주세요

**1단계 (기초 구축) 특화 요구사항:**
- 일상생활 필수 표현 우선 (기본 컴퓨터 용어, 인터넷 동작)
- 기초 어휘 중심 (클릭, 검색, 인터넷, 컴퓨터, 웹사이트)
- 단순한 문법 구조 (명령문, 현재시제, 기본 조사)
- 모든 도메인에서 기초 개념 균등 분배

**발음 표기법 (통합_데이터_가이드.md 준수):**
- **Korean**: keu-lik, in-teo-net (하이픈 구분, 로마자)
- **English**: /klɪk/, /ˈɪntənet/ (IPA 표기)
- **Chinese**: dian ji, hu lian wang (pinyin, 성조 없음)
- **Japanese**: kurikku, intaanetto (로마자 헵번식)
- **Spanish**: ha-cer clic, in-ter-net (하이픈 구분, 로마자)

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

---

_이 템플릿은 통합_데이터_가이드.md를 참조하여 체계적이고 전략적인 데이터 생성을 지원합니다._
