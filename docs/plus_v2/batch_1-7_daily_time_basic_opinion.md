# AI 데이터 생성 프롬프트 - Batch 1-7

## 📋 배치 정보

- **배치 ID**: 1-7
- **도메인**: daily
- **카테고리**: time
- **난이도**: basic
- **목적**: opinion
- **상황**: casual,social
- **품사 구성**: 형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%

## 🎯 생성 지시어

### 기본 요청
```
시간과 관련된 의견과 생각에 대한 다국어 학습 데이터를 50개 생성해주세요.

**난이도**: 기초(basic) - 초급자용, 일상적인 기본 표현
**목적**: opinion - 해당 목적에 맞는 표현
**상황**: casual,social - 해당 상황에서 사용하는 표현
**품사 구성**: 형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도**: 기초 수준
4. **품사 분포**: 형용사(adjective) 40%, 부사(adverb) 30%, 동사(verb) 30%
5. **상황별 사용**: casual,social 환경에서 자연스럽게 사용
6. **목적 중심**: opinion 목적에 맞는 실용적 표현

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
1. `batch_1-7_concepts_template_add.csv` (58개 필드)
2. `batch_1-7_examples_template_add.csv` (16개 필드)  
3. `batch_1-7_grammar_template_add.csv` (31개 필드)


## 📊 1단계 전체 비율 정보

이 배치는 1단계(기초 구축) 2,000개 데이터 중 일부입니다.

### 1단계 전체 비율
- **Domain 비율**: daily(25%), food(15%), education(15%), travel(12%), business(10%), health(8%), technology(5%), culture(2%), entertainment(5%), nature(2%), other(2%), sports(0% - 40번째 배치에서 포함)
- **Difficulty 비율**: basic(60%), intermediate(30%), advanced(7%), fluent(2%), technical(1%)
- **Purpose 비율**: greeting(25%), question(18%), request(15%), suggestion(10%), emotion(8%), instruction(7%), description(5%), gratitude(5%), opinion(3%), agreement(2%), apology(1%), refusal(1%)
- **Situation 비율**: casual+home(35%), casual+social(25%), polite+social(15%), casual+store(10%), polite+store(8%), polite+home(5%), polite+work(2%)

---

**생성일**: 2025-08-13 16:39:10
