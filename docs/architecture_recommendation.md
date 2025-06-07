# 다국어 학습 시스템 아키텍처 권장사항

## 현재 상황 분석

### 기존 구조의 문제점

- `concepts` 컬렉션에 단어와 문법이 혼재
- 문법 패턴이 일관성 없이 저장됨
- 데이터 중복과 복잡성 증가

## 권장 아키텍처

### 1. 컬렉션 분리 전략

```
📁 concepts (단어/어휘 중심)
├── 단어 정보 (word, pronunciation, definition)
├── 사용 예문
└── 관련 문법 패턴 ID 참조

📁 examples (예문 중심)
├── 실제 사용 예문
├── 문법 패턴 연결
└── 학습 메타데이터

📁 grammar_patterns (문법 규칙 중심)
├── 문법 규칙 설명
├── 구조 패턴
└── 학습 포인트
```

### 2. 연계성 유지 방법

#### A. 참조 관계 (Reference-based)

```json
// concepts 문서
{
  "word": "먹다",
  "related_grammar_patterns": ["present_tense_basic", "past_tense_action"],
  "example_ids": ["example_001", "example_002"]
}

// examples 문서
{
  "concept_id": "concept_eat",
  "grammar_pattern_id": "present_tense_basic",
  "translations": {...}
}
```

#### B. 태그 기반 연결 (Tag-based)

```json
// concepts와 examples 모두에 공통 태그
{
  "tags": ["daily_action", "present_tense", "basic_verb"],
  "semantic_tags": ["eating", "action", "routine"]
}
```

## 연계성 활용 방안

### 1. 학습 경로 생성

```
단어 학습 → 관련 문법 → 실제 사용 예문 → 연습 문제
```

### 2. 적응형 학습

- 사용자가 특정 단어를 학습하면 관련 문법 패턴 추천
- 문법 학습 후 해당 패턴을 사용하는 단어들 제시

### 3. 상호 참조 시스템

```javascript
// 단어에서 문법으로
async function getRelatedGrammar(conceptId) {
  const concept = await getDoc(doc(db, "concepts", conceptId));
  const grammarIds = concept.data().related_grammar_patterns;
  return await getGrammarPatterns(grammarIds);
}

// 문법에서 단어로
async function getRelatedConcepts(grammarPatternId) {
  const q = query(
    collection(db, "concepts"),
    where("related_grammar_patterns", "array-contains", grammarPatternId)
  );
  return await getDocs(q);
}
```

## 구현 우선순위

### Phase 1: 분리

1. `examples` 컬렉션 구조 정리
2. 문법 전용 필드 추가
3. 기존 샘플 데이터 마이그레이션

### Phase 2: 연결

1. 참조 관계 설정
2. 태그 시스템 구축
3. 상호 참조 API 개발

### Phase 3: 활용

1. 학습 경로 알고리즘
2. 개인화 추천 시스템
3. 적응형 학습 기능

## 결론

**Q: 연계성이 사라지는가?**
**A: 아니요, 오히려 더 체계적으로 관리됩니다.**

- ✅ **명확한 책임 분리**: 각 컬렉션이 고유 역할
- ✅ **유연한 연결**: 참조와 태그를 통한 다양한 연결 방식
- ✅ **확장성**: 새로운 학습 모드 추가 용이
- ✅ **성능**: 필요한 데이터만 선택적 로드
- ✅ **일관성**: 표준화된 데이터 구조

**향후 활용 방안**:

- 개인화된 학습 경로 생성
- AI 기반 문법-어휘 연관 분석
- 실시간 학습 적응 시스템
- 다중 언어 학습 지원
