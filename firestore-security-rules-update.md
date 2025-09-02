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

## 필요한 보안 규칙

Firebase Console > Firestore Database > 규칙 탭에서 기존 규칙을 확인하고, users 컬렉션 규칙만 설정하면 됩니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 기존 concepts 규칙들은 유지...
    
    // ✅ 통합된 users 컬렉션 (북마크 + 좋아요 포함)
    match /users/{userEmail} {
      // 자신의 데이터만 읽기/쓰기 가능
      allow read, write: if request.auth != null 
        && request.auth.token.email == userEmail;
      
      // 좋아요 수 계산을 위해 liked_concepts 필드는 모든 사용자가 읽기 가능
      allow read: if true;
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
    
    // users 컬렉션 - 간단한 규칙
    match /users/{userEmail} {
      allow read: if true; // 좋아요 수 계산을 위해 모든 사용자 읽기 허용
      allow write: if request.auth != null && request.auth.token.email == userEmail;
    }
  }
}
```

## 장점
- **단일 컬렉션**: 모든 사용자 데이터가 한 곳에 
- **간단한 규칙**: users 컬렉션 규칙만 관리하면 됨
- **비용 효율적**: 여러 컬렉션 → 하나의 컬렉션으로 통합
- **일관성**: 북마크와 좋아요가 동일한 패턴

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