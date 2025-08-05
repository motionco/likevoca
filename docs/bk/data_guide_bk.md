# LikeVoca 통합 데이터 가이드

## 📋 개요

LikeVoca 시스템은 `concepts`, `examples`, `grammar` 3개의 핵심 컬렉션을 통해 체계적인 언어 학습 데이터를 관리합니다. 이 문서는 각 컬렉션의 구조와 상호 연결성을 설명합니다.

## 🏗️ 컬렉션 구조

### 1. Concepts 컬렉션 (핵심 개념)

```json
{
  "concept_id": "concept_eat_basic",
  "word": "먹다",
  "pronunciation": "meokda",
  "definition": {
    "ko": "음식을 입에 넣고 씹어서 삼키다",
    "en": "to eat",
    "ja": "食べる",
    "zh": "吃",
    "es": "comer"
  },
  "part_of_speech": "verb",
  "difficulty_level": 1,
  "domain_category": "daily_action",
  "semantic_tags": ["eating", "action", "routine"],
  "grammar_patterns": ["present_tense_basic", "past_tense_action"],
  "example_ids": ["example_eat_001", "example_eat_002"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 2. Examples 컬렉션 (예문)

```json
{
  "example_id": "example_eat_001",
  "concept_id": "concept_eat_basic",
  "grammar_pattern_id": "present_tense_basic",
  "sentence": {
    "ko": "나는 매일 아침에 밥을 먹어요.",
    "en": "I eat rice every morning.",
    "ja": "私は毎朝ご飯を食べます。",
    "zh": "我每天早上都吃饭。",
    "es": "Yo como arroz todas las mañanas."
  },
  "translation_notes": {
    "ko": "매일 = every day, 아침 = morning, 밥 = rice/meal",
    "en": "every = 매일, morning = 아침, rice = 밥"
  },
  "grammar_points": ["present_tense", "daily_routine", "object_marker"],
  "difficulty_level": 1,
  "order_index": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 3. Grammar 컬렉션 (문법 패턴)

```json
{
  "grammar_id": "present_tense_basic",
  "pattern_name": {
    "ko": "현재시제 기본형",
    "en": "Present Tense Basic",
    "ja": "現在形基本",
    "zh": "现在时基本形",
    "es": "Presente Básico"
  },
  "pattern_structure": {
    "ko": "주어 + 목적어 + 동사 + 어요/아요",
    "en": "Subject + Object + Verb + ending",
    "ja": "主語 + 目的語 + 動詞 + ます",
    "zh": "主语 + 宾语 + 动词 + 了",
    "es": "Sujeto + Objeto + Verbo + o/a"
  },
  "explanation": {
    "ko": "일상적인 행동이나 습관을 표현할 때 사용합니다.",
    "en": "Used to express daily actions or habits.",
    "ja": "日常的な行動や習慣を表現する時に使います。",
    "zh": "用于表达日常行为或习惯。",
    "es": "Se usa para expresar acciones o hábitos diarios."
  },
  "examples": ["example_eat_001", "example_drink_001"],
  "related_concepts": ["concept_eat_basic", "concept_drink_basic"],
  "difficulty_level": 1,
  "grammar_category": "tense",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔗 Concept ID 필드값 지정 방식

### 1. 명명 규칙

```
concept_[단어]_[세부구분]
```

#### 예시:

- `concept_eat_basic` - 기본 동사 "먹다"
- `concept_eat_polite` - 정중형 "드시다"
- `concept_eat_past` - 과거형 "먹었다"
- `concept_house_basic` - 기본 명사 "집"
- `concept_house_big` - 형용사 "큰 집"

### 2. 세부구분 체계

| 구분       | 설명      | 예시                   |
| ---------- | --------- | ---------------------- |
| `basic`    | 기본 형태 | `concept_eat_basic`    |
| `polite`   | 정중형    | `concept_eat_polite`   |
| `past`     | 과거형    | `concept_eat_past`     |
| `future`   | 미래형    | `concept_eat_future`   |
| `negative` | 부정형    | `concept_eat_negative` |
| `question` | 의문형    | `concept_eat_question` |

### 3. 복합 개념 처리

```
concept_[주개념]_[부개념]_[형태]
```

#### 예시:

- `concept_go_school_basic` - "학교에 가다"
- `concept_meet_friend_tomorrow` - "내일 친구를 만나다"
- `concept_study_math_hard` - "수학을 열심히 공부하다"

## 🔄 3개 컬렉션 연결성 강화

### 1. 양방향 참조 시스템

#### A. Concepts → Examples 연결

```json
// concepts 문서
{
  "concept_id": "concept_eat_basic",
  "example_ids": ["example_eat_001", "example_eat_002", "example_eat_003"]
}
```

#### B. Examples → Concepts 연결

```json
// examples 문서
{
  "example_id": "example_eat_001",
  "concept_id": "concept_eat_basic",
  "grammar_pattern_id": "present_tense_basic"
}
```

#### C. Grammar → Concepts 연결

```json
// grammar 문서
{
  "grammar_id": "present_tense_basic",
  "related_concepts": [
    "concept_eat_basic",
    "concept_drink_basic",
    "concept_study_basic"
  ]
}
```

### 2. 태그 기반 연결

#### 공통 태그 시스템

```json
// 모든 컬렉션에 적용
{
  "semantic_tags": ["eating", "action", "routine"],
  "grammar_tags": ["present_tense", "daily_routine"],
  "difficulty_tags": ["beginner", "basic"],
  "domain_tags": ["daily_action", "food"]
}
```

### 3. 학습 경로 연결

#### A. 단어 → 문법 → 예문 경로

```
1. concept_eat_basic 학습
2. grammar_patterns에서 "present_tense_basic" 확인
3. examples에서 해당 패턴의 예문들 조회
4. 통합 학습 제공
```

#### B. 문법 → 단어 → 예문 경로

```
1. present_tense_basic 문법 학습
2. related_concepts에서 관련 단어들 조회
3. 각 단어의 예문들 확인
4. 문맥적 학습 제공
```

## 📊 데이터 조회 최적화

### 1. 통합 개념 조회

```javascript
async function getIntegratedConcept(conceptId) {
  // 1. 핵심 개념 정보
  const concept = await getConcept(conceptId);

  // 2. 관련 예문들
  const examples = await getExamplesByConceptId(conceptId);

  // 3. 관련 문법 패턴들
  const grammarPatterns = await getGrammarByConceptId(conceptId);

  return {
    ...concept,
    examples: examples,
    grammar_patterns: grammarPatterns,
  };
}
```

### 2. 문법 패턴 기반 조회

```javascript
async function getGrammarWithExamples(grammarId) {
  // 1. 문법 패턴 정보
  const grammar = await getGrammar(grammarId);

  // 2. 관련 개념들
  const concepts = await getConceptsByGrammarId(grammarId);

  // 3. 관련 예문들
  const examples = await getExamplesByGrammarId(grammarId);

  return {
    ...grammar,
    related_concepts: concepts,
    examples: examples,
  };
}
```

### 3. 태그 기반 검색

```javascript
async function searchByTags(tags) {
  const results = {
    concepts: await searchConceptsByTags(tags),
    examples: await searchExamplesByTags(tags),
    grammar: await searchGrammarByTags(tags),
  };

  return results;
}
```

## 🎯 학습 시나리오별 활용

### 1. 단어 학습 시나리오

```javascript
// 사용자가 "먹다" 학습 시
const learningData = await getIntegratedConcept("concept_eat_basic");
// 반환: 단어 정보 + 관련 예문들 + 관련 문법 패턴들
```

### 2. 문법 학습 시나리오

```javascript
// 사용자가 "현재시제" 학습 시
const grammarData = await getGrammarWithExamples("present_tense_basic");
// 반환: 문법 설명 + 관련 단어들 + 실제 사용 예문들
```

### 3. 예문 기반 학습 시나리오

```javascript
// 사용자가 특정 예문 학습 시
const exampleData = await getExampleWithContext("example_eat_001");
// 반환: 예문 + 관련 단어 + 관련 문법 패턴
```

## 🔧 데이터 관리 도구

### 1. 일관성 검증

```javascript
async function validateDataConsistency() {
  // concept_id 참조 검증
  const orphanedExamples = await findOrphanedExamples();
  const orphanedGrammar = await findOrphanedGrammar();

  // 태그 일관성 검증
  const inconsistentTags = await findInconsistentTags();

  return {
    orphanedExamples,
    orphanedGrammar,
    inconsistentTags,
  };
}
```

### 2. 자동 태그 생성

```javascript
async function generateSemanticTags(conceptData) {
  const tags = [];

  // 단어 의미 기반 태그
  if (conceptData.domain_category) {
    tags.push(conceptData.domain_category);
  }

  // 문법 패턴 기반 태그
  if (conceptData.grammar_patterns) {
    tags.push(...conceptData.grammar_patterns);
  }

  // 난이도 기반 태그
  tags.push(`level_${conceptData.difficulty_level}`);

  return tags;
}
```

## 📈 성능 최적화

### 1. 인덱싱 전략

```javascript
// Firestore 인덱스 설정
// concepts 컬렉션
-concept_id(기본) -
  difficulty_level -
  domain_category -
  semantic_tags(배열) -
  // examples 컬렉션
  concept_id -
  grammar_pattern_id -
  difficulty_level -
  order_index -
  // grammar 컬렉션
  grammar_id(기본) -
  grammar_category -
  difficulty_level -
  related_concepts(배열);
```

### 2. 캐싱 전략

```javascript
// 자주 조회되는 통합 데이터 캐싱
const cacheKey = `integrated_concept_${conceptId}`;
const cachedData = await cache.get(cacheKey);

if (!cachedData) {
  const data = await getIntegratedConcept(conceptId);
  await cache.set(cacheKey, data, 3600); // 1시간 캐시
  return data;
}

return cachedData;
```

## 🚀 향후 개선 방향

### 1. AI 기반 연결성 강화

- 자연어 처리로 자동 태그 생성
- 의미적 유사성 기반 자동 연결
- 학습 패턴 분석으로 개인화 연결

### 2. 실시간 동기화

- 데이터 변경 시 자동 참조 업데이트
- 일관성 검증 자동화
- 실시간 학습 경로 최적화

### 3. 확장성 고려

- 다국어 지원 확장
- 새로운 학습 유형 추가
- 외부 데이터 소스 연동

---

## 📝 문서 버전 정보

- **버전**: 1.0
- **최종 업데이트**: 2024년 1월
- **작성자**: LikeVoca 개발팀
- **검토자**: 시스템 아키텍트

이 문서는 LikeVoca 시스템의 데이터 구조와 연결성을 이해하고 활용하는 데 도움이 됩니다.
