# AI 데이터 생성 프롬프트 - Batch 1-40

## 📋 배치 정보

- **배치 ID**: 1-40
- **도메인**: sports,other
- **카테고리**: comprehensive
- **난이도**: basic 70%, intermediate 30%
- **목적**: description 30%, opinion 25%, emotion 20%, suggestion 15%, agreement 10%
- **상황**: casual,gym 30%, casual,social 30%, polite,social 25%, casual,outdoor 15%
- **품사 구성**: 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%

## 🎯 생성 지시어

### 기본 요청
```
sports + other 도메인 종합: sports의 15개 카테고리 + other의 25개 카테고리 포함에 대한 다국어 학습 데이터를 50개 생성해주세요.

**난이도**: basic 70%, intermediate 30%
**목적**: description 30%, opinion 25%, emotion 20%, suggestion 15%, agreement 10%
**상황**: casual,gym 30%, casual,social 30%, polite,social 25%, casual,outdoor 15%
**품사 구성**: 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도 분포**: basic 70%, intermediate 30%
4. **목적 분포**: description 30%, opinion 25%, emotion 20%, suggestion 15%, agreement 10%
5. **상황 분포**: casual,gym 30%, casual,social 30%, polite,social 25%, casual,outdoor 15%
6. **품사 분포**: 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%

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
1. `batch_1-40_concepts_template_add.csv` (58개 필드)
2. `batch_1-40_examples_template_add.csv` (16개 필드)  
3. `batch_1-40_grammar_template_add.csv` (31개 필드)

---

**생성일**: 2025-08-13 16:51:34
