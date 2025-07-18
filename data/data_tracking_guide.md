# 📋 데이터 추적 가이드

> **목적**: 데이터 중복 방지를 위한 표준 절차 가이드  
> **대상**: concepts_template_add.csv, examples_template_add.csv, grammar_template_add.csv  
> **원칙**: 중복 검증 → 데이터 추가 → 리스트 업데이트

---

## 🎯 중복 방지 시스템

### 📊 중복 판정 기준

#### 📘 Concepts (개념/단어)

- **기본 기준**: 한국어 단어 + 영어 번역 조합
- **다의어 허용**: 같은 한국어 단어라도 다른 영어 번역이면 허용
- **예시**:
  - ❌ 중복: `사과,apple` + `사과,apple`
  - ✅ 허용: `사과,apple` + `사과,apology` (다의어)

#### 📗 Examples (예문)

- **기본 기준**: 한국어 예문 전체 문장
- **허용 기준**: 의미가 다르면 유사한 문장도 허용
- **예시**:
  - ❌ 중복: `안녕하세요` + `안녕하세요`
  - ✅ 허용: `안녕하세요` + `안녕히 가세요` (다른 의미)

#### 📙 Grammar (문법 패턴)

- **기본 기준**: 한국어 문법 패턴 제목
- **허용 기준**: 구조가 다르면 제목이 유사해도 허용
- **예시**:
  - ❌ 중복: `기본 인사` + `기본 인사`
  - ✅ 허용: `기본 인사` + `정중한 인사` (다른 구조)

---

## 🔄 데이터 추가 절차

### 📋 4단계 워크플로우

#### 1단계: 중복 검증

- [ ] `data_tracking_list.md`에서 기존 데이터 확인
- [ ] **Ctrl+F**로 추가할 데이터 검색
- [ ] 중복 발견 시 다의어 여부 판단

#### 2단계: 데이터 추가

- [ ] 해당 `*_template_add.csv` 파일에 데이터 추가
- [ ] UTF-8 인코딩으로 저장
- [ ] 헤더 구조 준수 확인

#### 3단계: 리스트 업데이트

- [ ] `data_tracking_list.md`에 새 데이터 정보 추가
- [ ] 중복 체크 결과 기록
- [ ] 업데이트 날짜 갱신

#### 4단계: 품질 검증

- [ ] 파일 인코딩 확인 (UTF-8)
- [ ] 문자 깨짐 여부 점검
- [ ] 전체 데이터 개수 확인

---

## 🔍 중복 검증 명령어

### PowerShell 명령어 (Windows)

#### Concepts 중복 체크

```powershell
Get-Content data/concepts_template_add.csv | Select-Object -Skip 1 | ForEach-Object {
    $fields = $_.Split(','); "$($fields[7]),$($fields[16])"
} | Sort-Object | Group-Object | Where-Object { $_.Count -gt 1 }
```

#### Examples 중복 체크

```powershell
Get-Content data/examples_template_add.csv | Select-Object -Skip 1 | ForEach-Object {
    $_.Split(',')[5]
} | Sort-Object | Group-Object | Where-Object { $_.Count -gt 1 }
```

#### Grammar 중복 체크

```powershell
Get-Content data/grammar_template_add.csv | Select-Object -Skip 1 | ForEach-Object {
    $_.Split(',')[5]
} | Sort-Object | Group-Object | Where-Object { $_.Count -gt 1 }
```

### Bash 명령어 (Linux/Mac)

#### Concepts 중복 체크

```bash
cut -d',' -f8,17 data/concepts_template_add.csv | tail -n +2 | sort | uniq -d
```

#### Examples 중복 체크

```bash
cut -d',' -f6 data/examples_template_add.csv | tail -n +2 | sort | uniq -d
```

#### Grammar 중복 체크

```bash
cut -d',' -f6 data/grammar_template_add.csv | tail -n +2 | sort | uniq -d
```

---

## 📝 빠른 검색 가이드

### 🔍 새 데이터 추가 전 필수 확인

#### Concepts 추가 시

1. **Ctrl+F** → 한국어 단어 검색
2. **영어 번역** 함께 확인하여 다의어 여부 판단
3. 중복 없으면 추가 진행

#### Examples 추가 시

1. **Ctrl+F** → 한국어 예문 검색
2. **유사 표현** 있는지 확인
3. 의미가 다르면 추가 허용

#### Grammar 추가 시

1. **Ctrl+F** → 문법 패턴명 검색
2. **구조 차이** 확인
3. 다른 구조면 추가 허용

---

## ⚠️ 문제 해결 가이드

### 🚨 문자 깨짐 발생 시

1. **패턴 확인**: `?`, `?` 형태 검색
2. **인코딩 점검**: UTF-8 with BOM 설정 확인
3. **복구 절차**: 백업 파일에서 복원
4. **예방**: 직접 CSV 편집 시 주의

### 🔄 중복 발견 시 대응

1. **다의어 확인**: 영어 번역이 다른지 확인
2. **의미 차이**: 실제 의미가 다른지 판단
3. **제거 또는 허용**: 판단에 따라 처리
4. **문서 업데이트**: 결정 사항 기록

---

## 📅 정기 점검 가이드

### 🔄 주간 점검 (매주 월요일)

- [ ] 전체 템플릿 중복 검사 실행
- [ ] 문자 깨짐 여부 확인
- [ ] 추적 리스트 정확성 검증
- [ ] 파일 백업 상태 점검

### 📊 월간 점검 (매월 1일)

- [ ] 도메인 분포 균형 확인
- [ ] 데이터 품질 전반 검토
- [ ] 가이드 문서 업데이트 검토
- [ ] 시스템 개선사항 검토

---

## 📚 참고 정보

### 📖 관련 문서

- `data_tracking_list.md` - 실제 데이터 추적 리스트
- `data/통합_데이터_가이드.md` - 전체 데이터 구조 가이드
- `samples/templates.js` - 템플릿 구조 정의

### 🎯 품질 기준

- **필수 필드**: 모든 필수 필드 작성 완료
- **언어 일관성**: 4개 언어 간 의미와 맥락 일치
- **인코딩**: UTF-8 인코딩 필수
- **중복 없음**: 중복 검증 통과 필수

---

_이 가이드는 데이터 중복 방지를 위한 핵심 절차를 담고 있습니다. 새로운 데이터 추가 시 반드시 이 절차를 따르세요._
