# 모달 구조 및 역할 정리

## 개념 관련 모달

### 1. 개념 추가 모달

- **파일**: `add-concept-modal.html`, `add-concept-modal.js`
- **역할**: 새 개념 추가 전용
- **특징**:
  - 탭 형식의 다국어 입력 폼
  - 추가 기능만 담당
  - 전역 함수: `window.openConceptModal()`

### 2. 개념 편집 모달

- **파일**: `add-concept-modal.html` (공유), `edit-concept-modal.js`
- **역할**: 기존 개념 편집 전용
- **특징**:
  - 동일한 HTML 템플릿 사용하지만 편집 모드로 초기화
  - 기존 데이터를 폼에 채워서 표시
  - 전역 함수: `window.openEditConceptModal(conceptId)`

### 3. 개념 보기 모달

- **파일**: `concept-view-modal.html`, `concept-modal.js`
- **역할**: 개념 상세 정보 보기 (읽기 전용)
- **특징**:
  - 다국어 표현을 탭으로 표시
  - 편집/삭제 버튼 제공
  - 전역 함수: `window.showConceptModal(concept, sourceLanguage, targetLanguage)`

### 4. 공통 유틸리티

- **파일**: `concept-modal-utils.js`
- **역할**: 추가/편집 모달에서 공통으로 사용하는 함수들
- **포함 함수**:
  - `validateForm()`, `collectFormData()`, `resetForm()`, `closeModal()`
  - `getDefaultPartOfSpeech()`, `translatePartOfSpeech()`
  - `initLanguageTabEventListeners()`, `switchLanguageTab()`, `addExampleFields()`
  - `updateStaticLabels()`

## 구분 방법

1. **새 개념 추가**: `add-concept-modal` 사용
2. **기존 개념 편집**: `edit-concept-modal` 사용
3. **단순 보기만 필요**: `concept-view-modal` 사용

## 이벤트 통신

- **concept-saved**: 개념 추가/편집 완료 시 발생
- **concept-deleted**: 개념 삭제 완료 시 발생

## 장점

- **단일 책임 원칙**: 각 파일이 명확한 하나의 역할만 담당
- **코드 재사용성**: 공통 함수들을 유틸리티로 분리
- **유지보수성**: 추가/편집 로직이 분리되어 관리 용이
- **확장성**: 각 기능을 독립적으로 수정/확장 가능
