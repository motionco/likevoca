# 🛠️ LikeVoca 개발자 도구 및 가이드

## 📁 개발 전용 파일들

### 1. `dev-tools-test-integration.html`
**용도**: 다국어 콘텐츠 관리 시스템 통합 테스트
**설명**: 
- 관리자 시스템, 콘텐츠 통합, 실시간 동기화, 다국어 지원 등 전체 시스템 테스트
- 자동화된 20+ 개별 테스트 케이스 실행
- 개발 과정에서만 필요하며, 프로덕션에서는 제거 권장

**사용법**:
```bash
# 로컬 서버 실행
python -m http.server 8080

# 브라우저에서 접속
http://localhost:8080/dev-tools-test-integration.html
```

### 2. `js/content-migrator.js`
**용도**: 기존 정적 콘텐츠를 관리자 시스템으로 자동 이전
**설명**:
- FAQ, Manual, Guide 페이지의 HTML 콘텐츠를 추출
- 관리자가 편집 가능한 JSON 형식으로 변환
- localStorage에 저장하여 즉시 관리 가능

**주요 기능**:
- `extractFAQContent()`: FAQ 콘텐츠 추출
- `extractManualContent()`: 매뉴얼 콘텐츠 추출  
- `extractGuideContent()`: 가이드 콘텐츠 추출
- `migrateAllContent()`: 전체 콘텐츠 일괄 이전

### 3. `MULTILINGUAL-CONTENT-SYSTEM.md`
**용도**: 다국어 콘텐츠 관리 시스템 전체 문서
**설명**: 
- 시스템 아키텍처 및 구성 요소 상세 설명
- 사용법, 기술적 세부사항, 확장 계획 포함
- 새 개발자 온보딩 및 유지보수를 위한 참조 자료

## 🔄 시스템 동작 흐름

### 기존 콘텐츠 복원 과정:
1. **사용자가 FAQ/Manual/Guide 페이지 방문**
2. **content-integration.js가 localStorage 확인**
3. **콘텐츠가 없으면 content-migrator.js 자동 실행**
4. **기존 HTML 콘텐츠를 JSON 형식으로 변환하여 저장**
5. **변환된 콘텐츠를 페이지에 표시**
6. **관리자는 이제 admin/content.html에서 편집 가능**

### 실시간 동기화 과정:
1. **관리자가 콘텐츠 수정**
2. **localStorage에 자동 저장**
3. **real-time-content-sync.js가 변경 감지 (30초 간격)**
4. **사용자 페이지에 실시간 반영**
5. **시각적 알림으로 업데이트 표시**

## 🚀 배포 전 체크리스트

### 제거할 개발 파일들:
- [ ] `dev-tools-test-integration.html` - 테스트 전용 파일
- [ ] `DEV-README.md` - 개발자 전용 문서 
- [ ] `MULTILINGUAL-CONTENT-SYSTEM.md` - 개발 문서 (선택적)

### 유지할 핵심 파일들:
- [x] `js/content-migrator.js` - 콘텐츠 이전 도구 (첫 실행 시 필요)
- [x] `js/content-integration.js` - 페이지 통합 시스템
- [x] `js/real-time-content-sync.js` - 실시간 동기화
- [x] `admin/content.html` - 관리자 인터페이스
- [x] `admin/js/admin-multilingual-content.js` - 관리자 기능

## 🐛 디버깅 가이드

### 콘텐츠가 표시되지 않을 때:
1. **브라우저 콘솔 확인**: `F12 → Console` 탭에서 오류 메시지 확인
2. **localStorage 확인**: `Application → Local Storage`에서 `multilingual_content` 키 확인
3. **수동 이전 실행**: 
   ```javascript
   import('./js/content-migrator.js').then(m => m.initializeContentMigration())
   ```

### 실시간 동기화 문제:
1. **동기화 상태 확인**:
   ```javascript
   window.contentSyncManager?.getDebugInfo()
   ```
2. **수동 새로고침**: 페이지 우하단 새로고침 버튼 클릭
3. **콜백 등록 확인**: 콘솔에서 콜백 등록 로그 확인

### 관리자 시스템 문제:
1. **로컬 스토리지 초기화**:
   ```javascript
   localStorage.removeItem('multilingual_content')
   location.reload()
   ```
2. **콘텐츠 재이전**: 관리자 페이지에서 자동으로 기존 콘텐츠 가져옴

## 📈 성능 최적화 팁

1. **localStorage 크기 모니터링**: 5MB 제한 주의
2. **콘텐츠 해시 캐싱**: 불필요한 DOM 업데이트 방지  
3. **이미지 최적화**: 콘텐츠 내 이미지 크기 조절
4. **지연 로딩**: 필요한 모듈만 동적 import

---
**작성일**: 2024년 1월  
**최종 업데이트**: 기존 콘텐츠 복원 및 관리자 편집 시스템 완료