# AI 데이터 생성 프롬프트 - Batch 1-36: Travel Transportation Basic Permission

## 📋 배치 정보
- **배치 번호**: batch_1-36 (50개)
- **도메인**: travel (여행)
- **카테고리**: transportation (교통)
- **난이도**: basic (기초)
- **목적**: permission (허가)
- **상황**: polite,station (정중,역)
- **품사 비율**: verb 40%, preposition 30%, noun 30%
- **생성 단계**: 1단계 (기초 구축)

## 🎯 AI 데이터 생성 프롬프트

```markdown
다국어 학습 플랫폼용 데이터 50개를 생성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

**배치 정보:**
- 배치 번호: batch_1-36
- 도메인: travel (여행)
- 카테고리: transportation (교통)
- 난이도: basic (기초)
- 목적: permission (허가)
- 상황: polite,station (정중,역)
- 품사 비율: verb 40%, preposition 30%, noun 30%
- 생성 단계: 1단계 (기초 구축)

**생성 요구사항:**
1. concept_id 형식: travel_{word}_{meaning} (예: travel_allow_permit)
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
5. **품사 비율 준수**: verb 40%, preposition 30%, noun 30% 정확히 반영
6. **CSV 형식**: 쉼표 포함 필드는 쌍따옴표로 감싸기, UTF-8 without BOM 인코딩
7. **빈 필드 처리**: 데이터가 없는 경우 '없음' 대신 빈 칸("") 사용
8. **주제 집중**: 교통수단 이용 허가, 여행 허가 요청, 티켓 확인 등을 포함해주세요
```

---

_이 템플릿은 통합_데이터_가이드.md를 참조하여 체계적이고 전략적인 데이터 생성을 지원합니다._
