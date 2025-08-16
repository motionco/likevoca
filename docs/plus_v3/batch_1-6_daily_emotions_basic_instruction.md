# AI 데이터 생성 프롬프트 - Batch 1-6

## 📋 배치 정보

- **배치 ID**: 1-6
- **도메인**: daily
- **카테고리**: emotions
- **난이도**: basic
- **목적**: instruction
- **상황**: casual,home
- **품사 구성**: 동사(verb) 50%, 부사(adverb) 30%, 명사(noun) 20%

## 🎯 생성 지시어

### 기본 요청
```
감정 표현과 관련된 지시사항에 대한 다국어 학습 데이터를 50개 생성해주세요.

**난이도**: basic
**목적**: instruction
**상황**: casual,home
**품사 구성**: 동사(verb) 50%, 부사(adverb) 30%, 명사(noun) 20%
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도 분포**: basic
4. **목적 분포**: instruction
5. **상황 분포**: casual,home
6. **품사 분포**: 동사(verb) 50%, 부사(adverb) 30%, 명사(noun) 20%

### 주의사항

- concept_id 형식: `{domain}_{word}_{meaning}`
- 모든 예문은 완전한 문장으로 작성 (주어+동사 포함)
- 동일 concept_id 내에서 concepts, examples, grammar는 같은 단어 사용
- 각 컬렉션별 예문은 서로 다르게 작성
- CSV 헤더 정확성: Concepts(58개), Examples(16개), Grammar(31개)
- 쉼표 포함 필드는 반드시 따옴표로 감싸기
- UTF-8 인코딩으로 한글 깨짐 방지

### 생성 결과물

이 프롬프트로 다음 3개 파일을 생성해주세요:
1. `batch_1-6_concepts_template_add.csv` (58개 필드)
2. `batch_1-6_examples_template_add.csv` (16개 필드)  
3. `batch_1-6_grammar_template_add.csv` (31개 필드)

---

**생성일**: 2025-08-13 16:51:34
