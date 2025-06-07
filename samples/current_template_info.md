# 현재 활성화된 템플릿 파일 정보

## 📋 템플릿 파일 소스

템플릿 파일은 `components/js/bulk-import-modal.js`에서 동적으로 생성됩니다.

### 📁 다운로드되는 파일명

- **CSV**: `concept_template_improved.csv`
- **JSON**: `concept_template_improved.json`

## ✅ 개선된 주요 변경사항

### 1. 정확한 속성값 사용

- ❌ 잘못된 반의어: `apple` → `orange`
- ✅ 정확한 처리: 반의어 없는 경우 빈 문자열 `""`

### 2. 불필요한 속성 제거

- ❌ `tags: []` - 사용하지 않는 빈 배열
- ❌ `learning_priority` - 실제 사용되지 않음
- ❌ `media: null` - 템플릿에서 지원하지 않음

### 3. collocations frequency 간소화

- ❌ 기존: `"빨간 사과:높음|맛있는 사과:중간"`
- ✅ 개선: `"빨간 사과|맛있는 사과"`

### 4. 언어별 발음 표기 명확화

| 언어   | 공통 pronunciation | 특화 속성                                       |
| ------ | ------------------ | ----------------------------------------------- |
| 한국어 | `sa-gwa`           | `romanization`: `sagwa`                         |
| 영어   | `/ˈæpəl/`          | `phonetic`: `/ˈæpəl/`                           |
| 일본어 | `ringo`            | `hiragana`, `katakana`, `kanji`, `romanization` |
| 중국어 | `píngguǒ`          | `traditional`, `simplified`                     |

## 🗂️ samples 폴더 정리

### 제거된 파일들

- `concept_template.json` (구버전)
- `concept_template.csv` (구버전)
- `enhanced_concept_template_with_representative_example.json`
- `enhanced_concept_template_with_representative_example.csv`
- `enhanced_grammar_template.json`
- `test_concept_with_examples_and_grammar.json`

### 유지된 파일들

- `데이터_입력_표준_가이드.md` - 데이터 입력 가이드
- `데이터_업로드_방법.md` - 업로드 방법 안내
- `하이브리드_문법_시스템_가이드.md` - 문법 시스템 가이드
- `grammar-usage-examples.js` - 문법 사용 예제
- `grammar_metadata_example.json` - 문법 메타데이터 예제

## 🔄 템플릿 업데이트 방법

템플릿을 수정하려면:

1. `components/js/bulk-import-modal.js` 파일 편집
2. `downloadCSVTemplate()` 또는 `downloadJSONTemplate()` 함수 수정
3. 웹페이지에서 "템플릿 파일 다운로드" 버튼으로 새 템플릿 확인

## 📊 BloomFilter 에러 해결

템플릿 개선과 함께 다음 최적화도 적용됨:

- 배치 크기: 3 → 2로 감소
- 배치 간 지연: 300ms → 600ms로 증가
- 개별 문서 저장 간 지연: 50ms 추가
- 개념 생성 시작 전 지연: 100ms 추가
