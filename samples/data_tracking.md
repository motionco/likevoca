# 데이터 추적 문서 (CSV 형식)

> **목적**: 템플릿 간 중복 방지 및 데이터 현황 추적  
> **업데이트**: 새로운 템플릿 추가 시마다 즉시 업데이트  
> **사용법**: 새 데이터 추가 전 Ctrl+F로 중복 검색  
> **추적 기준**: CSV 형식 파일을 주 추적 대상으로 함 (검색 및 검증 효율성)

---

## 📘 Concepts 추적 (한국어 단어 기준)

### concepts_template.csv (기본 템플릿)

```csv
korean_word,domain,category,line_number,english_word,notes
쇼핑,daily,shopping,2,shopping,기본 일상 단어
전통,culture,tradition,3,tradition,문화 관련 기본 개념
```

### concepts_template_10.csv (10개 템플릿 - 2024-01-15 생성)

```csv
korean_word,domain,category,line_number,english_word,notes
안녕,daily,greeting,2,hello,기본 인사말
사과,food,fruit,3,apple,기본 과일
가족,daily,family,4,family,가족 관련 일상 개념 (culture,relationship→daily,family로 수정됨)
회의,business,office,5,meeting,업무 관련 기본 개념
공부,education,learning,6,study,학습 관련 기본 개념
컴퓨터,technology,computer,7,computer,기술 관련 기본 개념
운동,health,exercise,8,exercise,건강 관련 기본 개념
여행,travel,transportation,9,travel,여행 관련 기본 개념
축구,sports,football,10,football,스포츠 관련 기본 개념
영화,entertainment,movie,11,movie,엔터테인먼트 관련 기본 개념
```

### 대량 템플릿 예정 (concepts_template_100.csv)

- (향후 추가될 100개 단어들...)

---

## 📗 Examples 추적 (한국어 예문 기준)

### examples_template.csv (기본 템플릿)

```csv
korean_sentence,domain,purpose,line_number,notes
안녕하세요! 처음 뵙겠습니다.,daily,greeting,2,기본 인사 예문
감사합니다.,daily,thanking,3,기본 감사 예문
```

### 기본 템플릿 (examples_template.json) ⭐ 주 추적 대상

- "안녕하세요! 처음 뵙겠습니다." - 항목 1
- "사과 주스 하나 주세요." - 항목 2

> 📝 **참고**: examples_template.csv (templates.js 내)는 동일한 데이터 (별도 추적 안함)

---

## 📙 Grammar 추적 (패턴명 기준)

### grammar_template.csv (기본 템플릿)

```csv
korean_pattern_title,domain,purpose,line_number,notes
기본 인사,daily,greeting,2,기본 인사 패턴
음식 주문,food,request,3,음식 주문 패턴
```

### 기본 템플릿 (grammar_template.json) ⭐ 주 추적 대상

- "기본 인사" - 항목 1
- "음식 주문" - 항목 2

> 📝 **참고**: grammar_template.csv (templates.js 내)는 동일한 데이터 (별도 추적 안함)

---

## 📊 추적 현황 요약

| 템플릿 타입 | 추적 파일 형식 | 현재 데이터 수 | 마지막 업데이트 |
| ----------- | -------------- | -------------- | --------------- |
| Concepts    | CSV            | 12개 (2+10)    | 2024-01-15      |
| Examples    | CSV            | 2개            | 2024-01-15      |
| Grammar     | CSV            | 2개            | 2024-01-15      |

### 📋 형식 선택 기준:

- **Concepts**: CSV 선택 (대량 데이터, 검색 빈도 높음, 검증 명령어 CSV 기반)
- **Examples**: CSV 선택 (소량 데이터, 구조화된 예문 관리 유리)
- **Grammar**: CSV 선택 (소량 데이터, 복잡한 문법 구조 표현 유리)

---

## 🔍 다의어 기록

### 허용된 다의어 (같은 한국어, 다른 의미)

- 사과¹ (apple) - 과일 [concepts_template_10.csv 라인 3]
- 사과² (apology context) - 사과 주스 맥락 [examples_template.json 항목 2]

### 중복 방지 확인

- ✅ **쇼핑**: concepts_template.csv에만 추적 (JSON은 동일 데이터)
- ✅ **전통**: concepts_template.csv에만 추적 (JSON은 동일 데이터)
- ✅ **사과**: 다의어로 허용 (과일 vs 사과 주스 맥락)

---

## 📝 업데이트 로그

### 2024-01-15

- 초기 추적 문서 생성
- 기본 템플릿 데이터 기록 (쇼핑, 전통)
- **concepts_template_10.csv 추가**: 10개 새로운 단어
  - 다양한 도메인 커버: daily, food, culture, business, education, health, travel, technology, entertainment, other
  - 올바른 purpose/situation 값 사용 검증 완료
- **추적 방식 개선**: CSV/JSON 중복 제거, 효율적 형식 선택
- **오류 수정**:
  - 가족 단어: culture,customs → daily,family로 변경 (더 적절한 카테고리)
  - 통합 데이터 가이드: Grammar 템플릿 구조에서 JSON 잔여 코드 제거

### 향후 업데이트 예정

- concepts_template_20.csv 계획
- concepts_template_50.csv 계획
- examples_template_50.json 계획
- grammar_template_20.json 계획

---

## 🎯 중복 검증 체크리스트

### 새 Concepts 템플릿 추가 전:

1. **Ctrl+F 검색**: 이 문서에서 추가할 한국어 단어 검색
2. **다의어 확인**: 같은 단어가 있다면 의미가 다른지 확인
3. **도메인 분산**: 기존 도메인과 겹치지 않도록 다양화
4. **검증 실행**: 통합 데이터 가이드의 자동 검증 명령어 실행 (CSV 기반)

### 새 Examples 템플릿 추가 전:

1. **Ctrl+F 검색**: 이 문서에서 추가할 한국어 예문 검색
2. **의미 중복 확인**: 비슷한 의미의 예문이 있는지 확인

### 새 Grammar 템플릿 추가 전:

1. **Ctrl+F 검색**: 이 문서에서 추가할 문법 패턴명 검색
2. **구조 중복 확인**: 비슷한 문법 구조가 있는지 확인

---

## 💡 추적 시스템 사용 팁

### 🔍 빠른 검색 방법:

```
Ctrl+F "단어명" → 즉시 중복 여부 확인
```

### 📊 현황 파악 방법:

```
각 섹션의 "⭐ 주 추적 대상" 파일만 확인
```

### 🎯 새 템플릿 추가 워크플로우:

```
1. 이 문서에서 Ctrl+F 중복 검색
2. 통합 데이터 가이드 검증 실행
3. 새 템플릿 생성
4. 이 문서 업데이트
```

---

_이 문서는 데이터 품질 관리를 위해 지속적으로 업데이트됩니다._

## 🚨 방지 대책

### 1. 자동 검증 의무화:

- 모든 새 템플릿은 업로드 전 반드시 검증 실행
- PowerShell/Bash 검증 스크립트 사용

### 2. 카테고리 검증 강화:

- Domain별 허용 카테고리 목록 준수
- 잘못된 카테고리 사용 시 즉시 수정

### 3. 추적 문서 업데이트 의무화:

- 새 템플릿 생성 시 반드시 이 문서 업데이트
- CSV 형식으로 구조화된 추적 정보 유지

### 4. 정기 점검:

- 주간 단위로 전체 템플릿 검증 실행
- 오류 발견 시 즉시 수정 및 문서 업데이트
