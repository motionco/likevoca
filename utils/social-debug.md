# 소셜 미디어 공유 디버깅 가이드

## 캐시 새로고침 도구

### 1. Facebook Debug Tool
- URL: https://developers.facebook.com/tools/debug/
- 용도: Open Graph 태그 확인 및 Facebook/Meta 캐시 새로고침

### 2. Twitter Card Validator  
- URL: https://cards-dev.twitter.com/validator
- 용도: Twitter Card 태그 확인 및 X 캐시 새로고침

### 3. LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- 용도: LinkedIn 공유 미리보기 확인 및 캐시 새로고침

### 4. Open Graph 테스트
- URL: https://www.opengraph.xyz/
- 용도: 여러 플랫폼의 Open Graph 태그 일괄 확인

## 사용법

1. 위 도구들 중 하나에 접속
2. 콘텐츠 상세 페이지 URL 입력 (예: https://likevoca.com/ko/content-detail.html?id=콘텐츠ID)
3. "Scrape Again" 또는 "Fetch new scrape information" 클릭
4. 업데이트된 메타태그 정보 확인

## 프리렌더링 확인

브라우저에서 페이지 소스 보기(Ctrl+U)로 다음 요소들이 올바르게 업데이트되었는지 확인:

- `<title>` 태그
- `<meta name="description">` 태그  
- `<meta property="og:title">` 태그
- `<meta property="og:description">` 태그
- `<meta name="twitter:title">` 태그
- `<meta name="twitter:description">` 태그

## 주의사항

- 소셜 미디어 플랫폼은 캐시를 사용하므로 변경사항이 즉시 반영되지 않을 수 있습니다.
- 위 디버깅 도구를 사용하여 강제로 캐시를 새로고침해야 합니다.
- 일부 플랫폼은 24시간 정도의 캐시 유지 시간을 가질 수 있습니다..