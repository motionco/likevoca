# LikeVoca 간편 가이드

## 🎯 시작하기 전에

이 가이드는 **비개발자**도 쉽게 LikeVoca 데이터를 관리할 수 있도록 작성되었습니다.

## 📋 준비물

1. **Python 설치** (이미 설치되어 있음)
2. **VS Code** (코드 편집기)
3. **터미널/명령창** 사용법

## 🚀 새 데이터 만들기 (4단계)

### 1단계: 데이터 생성
```bash
python generate.py
```
**결과**: 새로운 단어/예문/문법 데이터가 생성됩니다.

### 2단계: 데이터 검증
```bash
python validate.py
```
**결과**: 데이터에 오류가 없는지 확인합니다.

### 3단계: 데이터 저장
```bash
python accumulator.py
```
**결과**: 새 데이터를 기존 데이터에 추가합니다.

### 4단계: 백업 생성
```bash
python backup.py
```
**결과**: 현재 데이터를 안전하게 백업합니다.

## 🔄 데이터 복원하기

### 이전 데이터로 되돌리기
```bash
python restore.py
```
1. 사용 가능한 백업 목록이 표시됩니다
2. 숫자를 입력하여 원하는 백업을 선택합니다
3. `y`를 입력하여 복원을 확인합니다

## 📁 파일 설명

### 작업 파일 (임시)
- `concepts_template_add.csv` - 새로 만든 단어 데이터
- `examples_template_add.csv` - 새로 만든 예문 데이터  
- `grammar_template_add.csv` - 새로 만든 문법 데이터

### 저장 파일 (영구)
- `concepts_template_list.csv` - 모든 단어 데이터
- `examples_template_list.csv` - 모든 예문 데이터
- `grammar_template_list.csv` - 모든 문법 데이터

### 백업 폴더
- `backup/backup_20250806_151048/` - 2025년 8월 6일 15시 10분 백업

## ⚠️ 주의사항

### 반드시 지켜야 할 순서
1. `python generate.py` ← 먼저
2. `python validate.py` ← 두 번째
3. `python accumulator.py` ← 세 번째  
4. `python backup.py` ← 마지막

### 백업을 자주 만드세요
- 중요한 작업 전에는 반드시 `python backup.py`
- 실수하면 `python restore.py`로 복구

### 터미널 사용법
- **Windows**: `Ctrl + Shift + P` → "Terminal: Create New Terminal"
- **Mac**: `Cmd + Shift + P` → "Terminal: Create New Terminal"

## 🆘 문제 해결

### "파일을 찾을 수 없습니다" 오류
- 터미널에서 `cd c:\practice\likevoca` 입력
- 올바른 폴더에 있는지 확인

### "python을 찾을 수 없습니다" 오류
- Python이 설치되어 있는지 확인
- 시스템 PATH에 Python이 추가되어 있는지 확인

### 복원 후 VS Code에서 변경이 안 보임
- 현재 시스템은 자동으로 감지됩니다
- 여전히 문제 시: VS Code 재시작

### 데이터가 이상해요
- `python validate.py` 실행하여 오류 확인
- `python restore.py`로 이전 백업으로 복구

## 💡 유용한 팁

### 현재 데이터 상태 확인
```bash
python accumulator.py
```
실행하면 현재 파일별 데이터 개수를 볼 수 있습니다.

### 안전한 실험 방법
1. `python backup.py` (현재 상태 백업)
2. 실험/수정 작업
3. 문제 발생 시 `python restore.py` (복구)

### 정기 백업 습관
- 매일 작업 시작 전: `python backup.py`
- 큰 변경 작업 전: `python backup.py`
- 작업 완료 후: `python backup.py`

## 📞 도움 요청

문제가 해결되지 않으면:
1. 터미널의 오류 메시지를 복사
2. 어떤 명령어를 실행했는지 기록
3. 개발팀에 문의

## 🎉 성공 확인 방법

### 모든 것이 잘 작동하는 신호
- 명령어 실행 시 ✅ 표시가 많이 나옴
- ❌ 표시가 없거나 적음
- "완료!" 메시지가 나타남
- 파일 크기가 변경됨 (VS Code에서 확인 가능)
