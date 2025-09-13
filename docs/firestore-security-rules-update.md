# Firestore 보안 규칙 업데이트 가이드 (최종 통합 버전)

## 최종 통합 구조
모든 사용자 관련 데이터를 `users` 컬렉션으로 통합하여 최대한 단순화했습니다.

## 최종 컬렉션 구조
- ✅ `users/{userEmail}` - 모든 사용자 데이터 통합
  - 기본 정보 (wordCount, aiUsage, agreements 등)
  - `bookmarked_concepts: []` - 북마크한 개념 ID 목록
  - `liked_concepts: []` - 좋아요한 개념 ID 목록
- ❌ `bookmarks` - 삭제됨 (users로 통합)
- ❌ `likes` - 삭제됨 (users로 통합)  
- ❌ `concept_likes` - 삭제됨
- ❌ `concept_clicks` - 삭제됨 (불필요한 기능)

## 필요한 보안 규칙 (집계 컬렉션 방식 🚀)

Firebase Console > Firestore Database > 규칙 탭에서 다음 규칙을 추가하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 기존 concepts 규칙들은 유지...
    
    // ✅ users 컬렉션 (북마크 + 좋아요 사용자별 관리)
    match /users/{userEmail} {
      // 자신의 데이터만 읽기/쓰기 가능
      allow read, write: if request.auth != null 
        && request.auth.token.email == userEmail;
    }
    
    // ✅ concept_stats 컬렉션 (좋아요 수 + 조회수 집계 - 효율적!)
    match /concept_stats/{conceptId} {
      // 모든 사용자가 읽기 가능 (좋아요 수, 조회수 조회용)
      allow read: if true;
      
      // 로그인 사용자만 통계 업데이트 가능
      allow create, update: if request.auth != null
        // 좋아요 수와 조회수는 0 이상이어야 함
        && request.resource.data.like_count >= 0
        && request.resource.data.view_count >= 0
        // 필수 필드 검증
        && request.resource.data.keys().hasAll(['concept_id', 'like_count', 'view_count', 'updated_at']);
        
      // 삭제 금지
      allow delete: if false;
    }
    
    // ✅ stats 컬렉션 (사이트 통계 - 익명 데이터만)
    match /stats/{statsId} {
      // 모든 사용자가 읽기 가능 (통계 조회용)
      allow read: if true;
      
      // 모든 방문자가 익명 통계 업데이트 가능 (개인정보 없음)
      allow create, update: if true;
      
      // 삭제 금지
      allow delete: if false;
    }
  }
}
```

## 더 간단한 버전 (개발/테스트용)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 기존 concepts 규칙들은 유지...
    
    // users 컬렉션
    match /users/{userEmail} {
      allow read, write: if request.auth != null && request.auth.token.email == userEmail;
    }
    
    // concept_stats 컬렉션 - 간단한 규칙 (좋아요 + 조회수)
    match /concept_stats/{conceptId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // stats 컬렉션 - 간단한 규칙 (사이트 통계)
    match /stats/{statsId} {
      allow read: if true;
      allow write: if true; // 익명 통계이므로 모든 사용자 허용
    }
  }
}
```

## 🎯 집계 컬렉션의 엄청난 장점
- **99% 비용 절약**: 1000명 → 12개 문서 조회로 감소!
- **빠른 성능**: users 컬렉션 전체 스캔 불필요
- **확장성**: 사용자가 100만명이어도 성능 동일
- **통합 구조**: concept_stats/{conceptId} = {like_count: 42, view_count: 156}
- **실시간 업데이트**: 좋아요/조회수 동시 관리

## 주의사항

1. **프로덕션 환경**에서는 더 엄격한 보안 규칙을 사용하세요.
2. 규칙 변경 후 **몇 분 정도** 기다린 후 테스트하세요.
3. Firebase Console에서 규칙을 **게시**하는 것을 잊지 마세요.

## 단계별 적용 방법

1. Firebase Console에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Firestore Database" 클릭
4. 상단 탭에서 "규칙" 클릭
5. 위의 규칙을 기존 규칙에 추가
6. "게시" 버튼 클릭
7. 몇 분 후 웹사이트에서 테스트