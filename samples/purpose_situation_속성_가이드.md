# Purpose & Situation 속성 가이드

## 개요

이 문서는 examples와 grammar 컬렉션에서 사용하는 `purpose`와 `situation` 속성의 표준화된 값들과 사용 방법을 설명합니다.

## Purpose 속성 (12개 값)

`purpose`는 문장이나 표현의 **목적**을 나타내는 단일 값입니다.

### 사용 가능한 값들:

1. **greeting** - 인사
2. **thanking** - 감사 표현
3. **request** - 요청
4. **question** - 질문
5. **opinion** - 의견 표현
6. **agreement** - 동의
7. **refusal** - 거절
8. **apology** - 사과
9. **instruction** - 지시/설명
10. **description** - 묘사/설명
11. **suggestion** - 제안
12. **emotion** - 감정 표현

### 사용 예시:

```json
{
  "purpose": "greeting",
  "translations": {
    "korean": "안녕하세요!"
  }
}
```

## Situation 속성 (13개 태그 배열)

`situation`은 문장이나 표현이 사용되는 **상황**을 나타내는 배열입니다. 여러 상황이 동시에 적용될 수 있습니다.

### 사용 가능한 태그들:

1. **formal** - 공식적인 상황 (회의, 발표, 공문서 등)
2. **casual** - 비공식적인 상황 (친구와의 대화, 일상 대화 등)
3. **polite** - 정중한 상황 (예의를 갖춘 표현, 처음 만나는 사람과의 대화 등)
4. **urgent** - 긴급한 상황
5. **work** - 업무/직장
6. **school** - 학교/교육
7. **social** - 사교/모임
8. **travel** - 여행
9. **shopping** - 쇼핑
10. **home** - 가정/집
11. **public** - 공공장소
12. **online** - 온라인/디지털
13. **medical** - 의료/건강

### ⚠️ 중요한 사용 지침:

#### Formal, Casual, Polite 태그 사용법:

- **formal**과 **casual**은 상반된 개념이므로 **함께 사용하지 마세요**
- **polite**는 formal이나 casual과 함께 사용할 수 있지만, **꼭 필요한 경우에만** 사용하세요
- 대부분의 경우 formal 또는 casual 중 하나만으로 충분합니다

#### 올바른 조합 예시:

- ✅ `["formal", "work"]` - 공식적인 업무 상황
- ✅ `["casual", "social"]` - 비공식적인 사교 모임
- ✅ `["polite", "shopping"]` - 정중한 쇼핑 상황 (점원과의 대화)
- ✅ `["formal", "polite", "work"]` - 매우 공식적이고 정중한 업무 상황 (중요한 회의, 상사와의 대화)
- ✅ `["casual", "polite", "social"]` - 비공식적이지만 예의를 갖춘 사교 상황 (처음 만나는 친구들과의 모임)

#### 피해야 할 조합:

- ❌ `["formal", "casual"]` - 모순된 조합
- ❌ `["formal", "casual", "polite"]` - 모순된 조합
- ❌ `["polite", "work", "social", "travel"]` - 너무 많은 태그 (2-3개 권장)

### 사용 예시:

```json
{
  "situation": ["formal", "work"],
  "translations": {
    "korean": "회의 자료를 준비해 주세요."
  }
}
```

## Grammar 컬렉션 구조 변경사항

### 변경된 속성들:

1. **grammar_tags 삭제** - situation 속성으로 대체
2. **structural_pattern → pattern 중첩 구조** - 언어별 title, structure, description 포함
3. **explanation 삭제** - pattern 안의 description으로 통합

### 새로운 Grammar 구조:

```json
{
  "pattern_name": "정중한 요청",
  "pattern": {
    "korean": {
      "title": "정중한 요청",
      "structure": "동사 어간 + 아/어 주세요",
      "description": "다른 사람에게 정중하게 부탁할 때 사용하는 표현입니다."
    },
    "english": {
      "title": "Polite Request",
      "structure": "Please + verb",
      "description": "Expression used to make polite requests to others."
    },
    "japanese": {
      "title": "丁寧な依頼",
      "structure": "動詞 + てください",
      "description": "他の人に丁寧にお願いするときに使う表現です."
    },
    "chinese": {
      "title": "礼貌请求",
      "structure": "请 + 动词",
      "description": "用于向他人礼貌地提出请求的表达方式。"
    }
  },
  "situation": ["formal", "work"],
  "purpose": "request"
}
```

### Pattern 중첩 구조의 장점:

1. **언어별 완전 분리**: 각 언어의 title, structure, description이 독립적
2. **확장성**: 새로운 언어 추가가 용이
3. **일관성**: 모든 언어가 동일한 구조를 가짐
4. **명확성**: title(제목), structure(구조), description(설명)의 역할이 명확

### 각 속성의 역할:

- **title**: 문법 패턴의 이름 (각 언어별로 다를 수 있음)
- **structure**: 실제 문법 구조나 패턴
- **description**: 사용법과 의미에 대한 설명

## 데이터 일관성 가이드

### Situation과 내용의 일치

- **formal** situation → 공식적인 표현 사용
- **casual** situation → 친근한 표현 사용
- **polite** situation → 정중하고 예의 바른 표현 사용
- **work** situation → 업무 관련 내용
- **medical** situation → 의료/건강 관련 내용

### 올바른 예시:

```json
{
  "situation": ["formal", "work"],
  "pattern": {
    "korean": {
      "description": "공식적인 업무 상황에서 사용하는 정중한 표현입니다."
    }
  }
}
```

### 잘못된 예시:

```json
{
  "situation": ["casual"],
  "pattern": {
    "korean": {
      "description": "정중한 표현입니다." // ❌ casual인데 정중한 표현이라고 설명
    }
  }
}
```

## CSV 템플릿 구조

### 새로운 Grammar CSV 헤더:

```csv
pattern_name,korean_title,korean_structure,korean_description,english_title,english_structure,english_description,japanese_title,japanese_structure,japanese_description,chinese_title,chinese_structure,chinese_description,korean_example,english_example,japanese_example,chinese_example,difficulty,situation,purpose,created_at
```

### 주요 변경사항:

- `structural_pattern` → 언어별 `structure` 필드들로 분리
- `explanation` → 언어별 `description` 필드들로 분리
- 언어별 `title` 필드 추가
- `grammar_tags` 완전 제거
- `situation`, `purpose` 속성 유지

## 마이그레이션 가이드

### 기존 데이터 처리:

1. `grammar_tags` → `situation`으로 매핑
2. `structural_pattern` → `pattern.korean.structure`로 이동
3. `explanation` → `pattern.korean.description`으로 이동
4. 다른 언어의 title, structure, description 추가
5. 내용과 situation의 일치성 검토

### 호환성:

- 기존 단일 값 구조도 지원 (하위 호환성)
- CSV 파싱 시 자동 변환
- 점진적 마이그레이션 가능

### 템플릿 소스:

- **templates.js**: 실제 템플릿 다운로드에 사용되는 소스
- **samples/\*.json**: 참고용 샘플 파일
- 템플릿 다운로드는 `templates.js`의 `GRAMMAR_TEMPLATE`을 기준으로 함
