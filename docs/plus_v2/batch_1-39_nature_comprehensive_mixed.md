# AI 데이터 생성 프롬프트 - Batch 1-39

## 📋 배치 정보

- **배치 ID**: 1-39
- **도메인**: nature
- **카테고리**: comprehensive
- **난이도**: mixed
- **목적**: mixed
- **상황**: mixed
- **품사 구성**: 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%

## 🎯 생성 지시어

### 기본 요청
```
nature 도메인 종합: animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability 카테고리 포함, 기초 60% + 중급 40%에 대한 다국어 학습 데이터를 50개 생성해주세요.

**난이도**: 혼합 - 여러 난이도 조합
**목적**: mixed - 다양한 목적 조합
**상황**: mixed - 다양한 상황 조합
**품사 구성**: 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%
```

### 세부 요구사항

1. **언어**: 한국어, 영어, 일본어, 중국어, 스페인어 (5개 언어)
2. **데이터 수**: 50개
3. **난이도**: 혼합 (비율은 설명에 명시)
4. **품사 분포**: 명사(noun) 40%, 형용사(adjective) 30%, 동사(verb) 20%, 기타(other) 10%
5. **종합적 접근**: nature 도메인 종합: animals, plants, weather, seasons, environment, conservation, geography, landscapes, climate, ecology, natural, disasters, resources, sustainability 카테고리 포함, 기초 60% + 중급 40%

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
1. `batch_1-39_concepts_template_add.csv` (58개 필드)
2. `batch_1-39_examples_template_add.csv` (16개 필드)  
3. `batch_1-39_grammar_template_add.csv` (31개 필드)


## 📊 1단계 전체 비율 정보

이 배치는 1단계(기초 구축) 2,000개 데이터 중 일부입니다.

### 1단계 전체 비율
- **Domain 비율**: daily(25%), food(15%), education(15%), travel(12%), business(10%), health(8%), technology(5%), culture(2%), entertainment(5%), nature(2%), other(2%), sports(0% - 40번째 배치에서 포함)
- **Difficulty 비율**: basic(60%), intermediate(30%), advanced(7%), fluent(2%), technical(1%)
- **Purpose 비율**: greeting(25%), question(18%), request(15%), suggestion(10%), emotion(8%), instruction(7%), description(5%), gratitude(5%), opinion(3%), agreement(2%), apology(1%), refusal(1%)
- **Situation 비율**: casual+home(35%), casual+social(25%), polite+social(15%), casual+store(10%), polite+store(8%), polite+home(5%), polite+work(2%)

---

**생성일**: 2025-08-13 16:39:10
