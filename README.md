# ActionLingo

한글 학습 애플리케이션

## 설치 및 실행 방법

1. 프로젝트 클론하기

```
git clone <repository-url>
cd actionlingo
```

2. 의존성 설치하기

```
npm install
```

3. 환경 변수 설정하기
   `.env.example` 파일을 복사하여 `.env` 파일을 만들고 API 키와 환경 변수를 설정합니다.

```
cp .env.example .env
```

`.env` 파일을 열고 실제 API 키 값으로 교체합니다.

4. 서버 실행하기

```
npm run dev
```

5. 브라우저에서 `http://localhost:3000`으로 접속하기

## Vercel 배포 방법

1. Vercel CLI 설치하기

```
npm install -g vercel
```

2. 배포하기

```
vercel
```

3. 환경 변수 설정하기
   Vercel 대시보드에서 프로젝트 설정 > 환경 변수 메뉴에서 `.env` 파일의 모든 변수를 추가합니다.

## 서버리스 마이그레이션

이 프로젝트는 Express 서버에서 Vercel 서버리스 함수로 마이그레이션되었습니다. API 엔드포인트는 `/api` 폴더 내의 서버리스 함수로 구현되어 있습니다.

### 환경 변수 설정

Vercel에서 다음 환경 변수를 설정해야 합니다:

```
# Firebase 설정
FIREBASE_API_KEY=your_firebase_api_key

# Gemini API 설정
GEMINI_API_KEY=your_gemini_api_key
```

### 로컬 개발

로컬에서 개발할 때는 정적 웹서버를 사용하여 HTML 파일을 제공하고, Vercel CLI를 통해 서버리스 함수를 로컬에서 테스트할 수 있습니다:

```
npm install -g vercel
vercel dev
```

## 주요 기능

- 한글 학습
- 단어장 관리
- 한글 AI 추천
- 사용자 인증 (로그인/회원가입)
# likevoca
# likevoca
# likevoca
