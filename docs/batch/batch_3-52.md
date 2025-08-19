# 배치 3-52: sports-sports_science+exercise_physiology+biomechanics 테마 고급

## 📋 배치 정보
- **배치 번호**: 3-52
- **단계**: 3단계 (심화 학습)
- **도메인**: 스포츠
- **테마**: sports+sports_science+exercise_physiology+biomechanics
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
스포츠(sports) 도메인의 sports_science(스포츠과학), exercise_physiology(운동생리학), biomechanics(생체역학) 카테고리를 **테마**로 한 고급 데이터 50개를 생성해주세요.

**카테고리 분포:**
- sports_science (스포츠과학): 20개 (40%)
- exercise_physiology (운동생리학): 18개 (36%)
- biomechanics (생체역학): 12개 (24%)

**난이도 분포:**
- advanced (고급): 20개 (40%)
- intermediate (중급): 15개 (30%)
- fluent (유창): 10개 (20%)
- technical (전문): 3개 (6%)
- basic (기초): 2개 (4%)

**목적 분포:**
- analysis (분석): 20개 (40%)
- instruction (지시): 12개 (24%)
- description (묘사): 10개 (20%)
- suggestion (제안): 6개 (12%)
- opinion (의견): 1개 (2%)
- question (질문): 1개 (2%)

**품사 분포:**
- noun (명사): 28개 (56%)
- adjective (형용사): 10개 (20%)
- verb (동사): 6개 (12%)
- other (기타): 4개 (8%)
- adverb (부사): 2개 (4%)

**상황 분포:**
- technical + work: 30개 (60%)
- formal + work: 12개 (24%)
- technical + public: 5개 (10%)
- formal + public: 2개 (4%)
- technical + online: 1개 (2%)

sports_science, exercise_physiology, biomechanics를 **테마**로 하되 고급 수준의 전문적이고 복합적인 언어 요소를 포함해주세요.

```

### 2. Examples 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 실제 상황에서 사용하는 실용적이고 자연스러운 예문 50개를 생성해주세요.

**핵심 원칙:**
- Concepts의 representative_example과 **다른 예문** 사용
- 실제 일상 상황에서 사용하는 자연스러운 표현
- 완전한 문장 구조 (주어+동사 포함)

### 3. Grammar 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 문법 패턴을 설명하는 교육적 목적의 데이터 50개를 생성해주세요.

**핵심 원칙:**
- Concepts, Examples와 **다른 예문** 사용
- 문법 패턴을 명확히 보여주는 교육적 예문
- 각 언어별 문법 구조와 설명 포함

## 📝 참고사항

### concept_id 형식
```
sports_{word}_{meaning}
```

### 중복 방지
- 동일한 concept_id를 가진 세 컬렉션의 예문은 반드시 서로 달라야 함
- Concepts: 기본 의미를 보여주는 간단한 예문
- Examples: 실제 상황에서 사용하는 실용적 예문  
- Grammar: 문법 패턴을 설명하는 교육적 예문

### 데이터 품질 기준
- 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
- 완전한 문장 구조 사용
- 테마에 맞는 자연스러운 표현
- 통합_데이터_가이드.md의 모든 규칙 준수

---

**이 배치 완료 후 다음 단계로 3-53번 배치를 진행하세요.**