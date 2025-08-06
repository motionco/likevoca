# LikeVoca 데이터 가이드

## 📋 개요

이 가이드는 LikeVoca 프로젝트의 **데이터 생성, 관리, 검증** 프로세스에 대한 실무 가이드입니다.

## 🔄 데이터 워크플로우

### 1단계: 템플릿 생성
```bash
python generate.py
```
- **58개 필드** Concepts 템플릿 생성 (완전한 필드)
- **16개 필드** Examples 템플릿 생성  
- **31개 필드** Grammar 템플릿 생성
- **다의어 처리**: 다른 도메인/카테고리면 동일 단어 허용

### 2단계: 데이터 누적
```bash
python accumulator.py
```
- `_add.csv` → `_list.csv` 데이터 이동
- 임시 데이터를 영구 저장소로 이전

### 3단계: 데이터 검증
```bash
python validate.py
```
- 중복 데이터 검사
- 필드 완성도 검증
- 데이터 무결성 검증
- 포맷 검증

### 4단계: 백업 및 복원
```bash
python backup.py    # 백업 생성
python restore.py   # 시점별 백업 복원
```

## 📁 파일 구조

### 임시 저장소 (Staging)
- `concepts_template_add.csv` - 새로 생성된 개념 데이터
- `examples_template_add.csv` - 새로 생성된 예문 데이터
- `grammar_template_add.csv` - 새로 생성된 문법 데이터

### 영구 저장소 (Production)
- `concepts_template_list.csv` - 누적된 개념 데이터
- `examples_template_list.csv` - 누적된 예문 데이터
- `grammar_template_list.csv` - 누적된 문법 데이터

## 🎯 다의어 처리 시스템

### 허용 조건
- **다른 도메인**: `food.apple` vs `technology.apple` ✅
- **다른 카테고리**: `daily.greeting` vs `travel.greeting` ✅

### 불허 조건  
- **동일 도메인+카테고리**: `food.fruit.apple` vs `food.fruit.apple` ❌

## 🔍 중복 검사 로직

### 1단계 검사 (생성 시)
- **대상**: `_add.csv` + `_list.csv` 모든 기존 데이터
- **검사 항목**: concept_id + 5개 언어 단어
- **목적**: 실시간 중복 방지

### 3단계 검사 (최종 검증)
- **대상**: 생성 완료된 모든 템플릿 파일
- **검사 항목**: 데이터 무결성, 필드 완성도, 포맷 검증
- **목적**: 품질 보증

## 📊 필드 규격

### Concepts (55개 필드)
```
concept_id,domain,category,difficulty,emoji,color,situation,purpose,
korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,
english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,
chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,
japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,
spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,
korean_example,english_example,chinese_example,japanese_example,spanish_example
```

### Examples (16개 필드)
```
concept_id,domain,category,difficulty,situation,purpose,
korean,english,japanese,chinese,spanish,
korean_word,english_word,japanese_word,chinese_word,spanish_word
```

### Grammar (31개 필드)
```
concept_id,domain,category,difficulty,situation,purpose,
korean_title,korean_structure,korean_description,korean_example,
english_title,english_structure,english_description,english_example,
japanese_title,japanese_structure,japanese_description,japanese_example,
chinese_title,chinese_structure,chinese_description,chinese_example,
spanish_title,spanish_structure,spanish_description,spanish_example,
korean_word,english_word,japanese_word,chinese_word,spanish_word
```

## 🛠️ 백업 및 복원

### 백업 생성
```bash
python template_manager.py 3
```

### 백업 복원
```bash
python template_manager.py 4
```

## 💡 베스트 프랙티스

1. **정기적 백업**: 대량 데이터 생성 전 백업 생성
2. **단계적 검증**: 생성 → 누적 → 검증 순서 준수
3. **다의어 활용**: 맥락이 다른 경우 동일 단어 적극 활용
4. **필드 완성도**: 빈 필드 최소화로 데이터 품질 향상

## 🔗 관련 문서

- **표준 가이드**: `data/통합_데이터_가이드.md`
- **아키텍처**: `docs/architecture_recommendation.md`
- **SEO 최적화**: `docs/seo_optimization.md`
