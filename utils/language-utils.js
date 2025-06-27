// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = {
  ko: {
    name: "한국어",
    code: "ko",
  },
  en: {
    name: "English",
    code: "en",
  },
  ja: {
    name: "日本語",
    code: "ja",
  },
  zh: {
    name: "中文",
    code: "zh",
  },
};

// 공통으로 사용되는 텍스트 정의
const commonTexts = {
  ko: {
    language_learning: "다국어 학습",
    language_learning_desc:
      "플래시카드, 퀴즈, 타이핑 등 다양한 방식으로 언어를 학습하세요.",
    language_games: "다국어 게임",
    language_games_desc:
      "재미있는 게임을 통해 다양한 언어를 즐겁게 배워보세요.",
  },
  en: {
    language_learning: "Language Learning",
    language_learning_desc:
      "Learn languages in various ways such as flashcards, quizzes, and typing.",
    language_games: "Language Games",
    language_games_desc: "Learn various languages enjoyably through fun games.",
  },
  ja: {
    language_learning: "多言語学習",
    language_learning_desc:
      "フラッシュカード、クイズ、タイピングなど、様々な方法で言語を学びましょう。",
    language_games: "多言語ゲーム",
    language_games_desc: "楽しいゲームを通して様々な言語を楽しく学びましょう。",
  },
  zh: {
    language_learning: "多语言学习",
    language_learning_desc: "通过闪卡、测验和打字等多种方式学习语言。",
    language_games: "多语言游戏",
    language_games_desc: "通过有趣的游戏愉快地学习各种语言。",
  },
};

// SEO를 위한 메타데이터 설정
const seoMetadata = {
  // 홈페이지 메타데이터
  home: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "언어 학습, 다국어, 단어장, AI 단어장, 영어, 일본어, 중국어, 한국어",
      canonical: "https://likevoca.com/ko",
    },
    en: {
      title: "LikeVoca - " + commonTexts.en.language_learning,
      description: commonTexts.en.language_learning_desc,
      keywords:
        "language learning, multilingual, wordbook, AI wordbook, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en",
    },
    ja: {
      title: "LikeVoca - " + commonTexts.ja.language_learning,
      description: commonTexts.ja.language_learning_desc,
      keywords:
        "語学学習, 多言語, 単語帳, AI単語帳, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "语言学习, 多语言, 单词本, AI单词本, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh",
    },
  },
  // 다국어 단어장 페이지 메타데이터
  dictionary: {
    ko: {
      title: "LikeVoca - 다국어 단어장",
      description: "나만의 다국어 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "다국어 단어장, 영어 단어장, 일본어 단어장, 중국어 단어장, 언어 학습",
      canonical: "https://likevoca.com/ko/pages/multilingual-dictionary.html",
    },
    en: {
      title: "LikeVoca - Multilingual Dictionary",
      description:
        "Create your own multilingual dictionary and learn effectively.",
      keywords:
        "multilingual dictionary, English dictionary, Japanese dictionary, Chinese dictionary, language learning",
      canonical: "https://likevoca.com/en/pages/multilingual-dictionary.html",
    },
    ja: {
      title: "LikeVoca - 多言語辞書",
      description: "自分だけの多言語辞書を作成し、効果的に学習しましょう。",
      keywords: "多言語辞書, 英語辞書, 日本語辞書, 中国語辞書, 言語学習",
      canonical: "https://likevoca.com/ja/pages/multilingual-dictionary.html",
    },
    zh: {
      title: "LikeVoca - 多语言词典",
      description: "创建您自己的多语言词典并有效学习。",
      keywords: "多语言词典, 英语词典, 日语词典, 中文词典, 语言学习",
      canonical: "https://likevoca.com/zh/pages/multilingual-dictionary.html",
    },
  },
  // 다국어 학습 페이지 메타데이터
  learning: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "다국어 학습, 언어 학습, 플래시카드, 퀴즈, 영어, 일본어, 중국어, 한국어",
      canonical: "https://likevoca.com/ko/pages/language-learning.html",
    },
    en: {
      title: "LikeVoca - " + commonTexts.en.language_learning,
      description: commonTexts.en.language_learning_desc,
      keywords:
        "language learning, multilingual learning, flashcards, quiz, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en/pages/language-learning.html",
    },
    ja: {
      title: "LikeVoca - " + commonTexts.ja.language_learning,
      description: commonTexts.ja.language_learning_desc,
      keywords:
        "多言語学習, 言語学習, フラッシュカード, クイズ, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja/pages/language-learning.html",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "多语言学习, 语言学习, 闪卡, 测验, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh/pages/language-learning.html",
    },
  },
  // 다국어 게임 페이지 메타데이터
  games: {
    ko: {
      title: "LikeVoca - 다국어 게임",
      description: "재미있는 게임을 통해 다양한 언어를 즐겁게 배워보세요.",
      keywords:
        "언어 게임, 다국어 게임, 단어 게임, 언어 학습 게임, 영어, 일본어, 중국어, 한국어",
      canonical: "https://likevoca.com/ko/pages/games.html",
    },
    en: {
      title: "LikeVoca - Language Games",
      description: "Learn various languages enjoyably through fun games.",
      keywords:
        "language games, multilingual games, word games, language learning games, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en/pages/games.html",
    },
    ja: {
      title: "LikeVoca - 多言語ゲーム",
      description: "楽しいゲームを通して様々な言語を楽しく学びましょう。",
      keywords:
        "言語ゲーム, 多言語ゲーム, 単語ゲーム, 言語学習ゲーム, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja/pages/games.html",
    },
    zh: {
      title: "LikeVoca - 多语言游戏",
      description: "通过有趣的游戏愉快地学习各种语言。",
      keywords:
        "语言游戏, 多语言游戏, 单词游戏, 语言学习游戏, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh/pages/games.html",
    },
  },
  // AI 단어장 페이지 메타데이터
  "ai-vocabulary": {
    ko: {
      title: "LikeVoca - AI 단어장",
      description:
        "AI가 추천하는 다국어 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "AI 단어장, 다국어 단어장, 영어 단어장, 일본어 단어장, 중국어 단어장, AI 언어 학습",
      canonical: "https://likevoca.com/ko/pages/ai-vocabulary.html",
    },
    en: {
      title: "LikeVoca - AI Vocabulary",
      description:
        "Create AI-recommended multilingual vocabulary and learn effectively.",
      keywords:
        "AI vocabulary, multilingual vocabulary, English vocabulary, Japanese vocabulary, Chinese vocabulary, AI language learning",
      canonical: "https://likevoca.com/en/pages/ai-vocabulary.html",
    },
    ja: {
      title: "LikeVoca - AI単語帳",
      description: "AIが推薦する多言語単語帳を作成し、効果的に学習しましょう。",
      keywords:
        "AI単語帳, 多言語単語帳, 英語単語帳, 日本語単語帳, 中国語単語帳, AI言語学習",
      canonical: "https://likevoca.com/ja/pages/ai-vocabulary.html",
    },
    zh: {
      title: "LikeVoca - AI词汇本",
      description: "创建AI推荐的多语言词汇本并有效学习。",
      keywords:
        "AI词汇本, 多语言词汇本, 英语词汇本, 日语词汇本, 中文词汇本, AI语言学习",
      canonical: "https://likevoca.com/zh/pages/ai-vocabulary.html",
    },
  },
  // 나만의 단어장 페이지 메타데이터
  "my-vocabulary": {
    ko: {
      title: "LikeVoca - 나만의 단어장",
      description:
        "북마크한 단어들을 모아서 나만의 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "나만의 단어장, 북마크 단어장, 다국어 단어장, 개인 단어장, 언어 학습",
      canonical: "https://likevoca.com/ko/pages/my-word-list.html",
    },
    en: {
      title: "LikeVoca - My Vocabulary",
      description:
        "Collect your bookmarked words to create your own vocabulary and learn effectively.",
      keywords:
        "my vocabulary, bookmarked vocabulary, multilingual vocabulary, personal vocabulary, language learning",
      canonical: "https://likevoca.com/en/pages/my-word-list.html",
    },
    ja: {
      title: "LikeVoca - 私の単語帳",
      description:
        "ブックマークした単語を集めて自分だけの単語帳を作成し、効果的に学習しましょう。",
      keywords:
        "私の単語帳, ブックマーク単語帳, 多言語単語帳, 個人単語帳, 言語学習",
      canonical: "https://likevoca.com/ja/pages/my-word-list.html",
    },
    zh: {
      title: "LikeVoca - 我的词汇本",
      description: "收集您收藏的单词，创建您自己的词汇本并有效学习。",
      keywords: "我的词汇本, 收藏词汇本, 多语言词汇本, 个人词汇本, 语言学习",
      canonical: "https://likevoca.com/zh/pages/my-word-list.html",
    },
  },
};

// 번역 텍스트 저장소 - 분리된 JSON 파일에서 로드
let translations = {};

// 번역 파일들을 동적으로 로드하는 함수
async function loadTranslations() {
  try {
    // 현재 경로에 따라 상대 경로 조정
    const currentPath = window.location.pathname;
    let basePath = "";

    if (currentPath.includes("/locales/")) {
      // locales 내부에서 실행되는 경우 (예: /locales/ko/index.html)
      basePath = "../..";
    } else {
      // 루트에서 실행되는 경우
      basePath = ".";
    }

    console.log("🌐 번역 파일 로드 시작, 기본 경로:", basePath);

    // 절대 경로로 번역 파일 로드 (Vercel 배포 환경 대응)
    const rootPath = window.location.origin;

    // 각 언어별 번역 파일 로드
    const [koTranslations, enTranslations, jaTranslations, zhTranslations] =
      await Promise.all([
        fetch(`${rootPath}/locales/ko/translations.json`).then((res) =>
          res.json()
        ),
        fetch(`${rootPath}/locales/en/translations.json`).then((res) =>
          res.json()
        ),
        fetch(`${rootPath}/locales/ja/translations.json`).then((res) =>
          res.json()
        ),
        fetch(`${rootPath}/locales/zh/translations.json`).then((res) =>
          res.json()
        ),
      ]);

    translations = {
      ko: koTranslations,
      en: enTranslations,
      ja: jaTranslations,
      zh: zhTranslations,
    };

    // 전역 객체에 설정
    window.translations = translations;

    console.log("✅ 번역 파일 로드 완료:", Object.keys(translations));
    console.log("🔍 한국어 번역 샘플:", {
      learn_languages: translations.ko?.learn_languages,
      wordbook: translations.ko?.wordbook,
      start: translations.ko?.start,
    });
  } catch (error) {
    console.error("❌ 번역 파일 로드 실패:", error);

    // fallback: 기본 번역 데이터 사용
    translations = {
      ko: {
        home: "홈",
        vocabulary: "단어장",
        learn_languages: "다양한 언어를 쉽고 재미있게 배워보세요",
        wordbook: "단어장",
        start: "시작하기",
      },
      en: {
        home: "Home",
        vocabulary: "Vocabulary",
        learn_languages: "Learn various languages easily and enjoyably",
        wordbook: "Wordbook",
        start: "Start",
      },
      ja: {
        home: "ホーム",
        vocabulary: "単語帳",
        learn_languages: "様々な言語を簡単で楽しく学びましょう",
        wordbook: "単語帳",
        start: "開始",
      },
      zh: {
        home: "首页",
        vocabulary: "单词本",
        learn_languages: "轻松愉快地学习各种语言",
        wordbook: "单词本",
        start: "开始",
      },
    };
    window.translations = translations;
    console.log("🆘 fallback 번역 데이터 사용");
  }
}

// 페이지 로드 시 번역 파일 로드
if (typeof window !== "undefined") {
  loadTranslations();
}

// 도메인과 카테고리를 번역하는 함수
function translateDomainCategory(domain, category, userLanguage = "ko") {
  const langCode = userLanguage === "auto" ? "ko" : userLanguage;
  const texts = translations[langCode] || translations.ko;

  const domainText = texts[`domain_${domain}`] || domain;
  const categoryText = texts[`category_${category}`] || category;

  return `${domainText} > ${categoryText}`;
}

// 현재 UI 언어 가져오기 (동기 방식)
function getCurrentUILanguage() {
  const userLang = localStorage.getItem("userLanguage");
  return userLang === "auto" ? "ko" : userLang || "ko";
}

// 전역 함수로 설정
if (typeof window !== "undefined") {
  window.translateDomainCategory = translateDomainCategory;
  window.getCurrentUILanguage = getCurrentUILanguage;
}

// 언어 캐싱을 위한 변수
let cachedLanguage = null;
let languageDetectionInProgress = false;

// 브라우저 기본 언어 감지
function detectBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage;
  const shortLang = language.split("-")[0]; // ko-KR, en-US 등에서 주 언어 코드만 추출

  // 지원되는 언어인지 확인
  return SUPPORTED_LANGUAGES[shortLang] ? shortLang : "en"; // 지원되지 않으면 영어가 기본
}

// URL 파라미터에서 언어 감지
function detectLanguageFromURL() {
  // URL 파라미터에서 lang 확인
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");

  if (langParam && SUPPORTED_LANGUAGES[langParam]) {
    console.log("URL 파라미터에서 언어 감지:", langParam);
    return langParam;
  }

  // URL 경로에서 언어 코드 확인 (/ko/pages/vocabulary.html 형태)
  const pathParts = window.location.pathname.split("/");
  const pathLang = pathParts[1]; // 첫 번째 경로 부분

  if (pathLang && SUPPORTED_LANGUAGES[pathLang]) {
    console.log("URL 경로에서 언어 감지:", pathLang);
    return pathLang;
  }

  return null;
}

// 사용자의 위치 정보로 언어 추측
async function detectLanguageFromLocation() {
  // URL에서 언어 감지 (locales 구조)
  const path = window.location.pathname;
  const langFromUrl = detectLanguageFromURL();

  if (langFromUrl) {
    return langFromUrl;
  }

  // 기본값 반환 (리다이렉트 제거)
  return detectBrowserLanguage();
}

// 현재 사용 언어 가져오기
function getCurrentLanguage() {
  return localStorage.getItem("userLanguage") || "auto";
}

// 현재 활성화된 언어 코드 가져오기 (캐싱 및 중복 호출 방지)
async function getActiveLanguage() {
  // 이미 감지 중이면 대기
  if (languageDetectionInProgress) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!languageDetectionInProgress && cachedLanguage) {
          clearInterval(checkInterval);
          resolve(cachedLanguage);
        }
      }, 100);
    });
  }

  // 캐시된 언어가 있으면 반환
  if (cachedLanguage) {
    console.log("캐시된 언어 사용:", cachedLanguage);
    return cachedLanguage;
  }

  languageDetectionInProgress = true;

  try {
    // 1. 먼저 URL에서 언어 확인 (최우선)
    const urlLang = detectLanguageFromURL();
    if (urlLang) {
      console.log("URL에서 언어 감지:", urlLang);
      cachedLanguage = urlLang;
      localStorage.setItem("preferredLanguage", urlLang);
      // URL에서 감지된 언어는 사용자 설정으로도 저장
      localStorage.setItem("userLanguage", urlLang);
      return urlLang;
    }

    // 2. localStorage에서 사용자가 직접 설정한 언어 확인
    const savedLang = localStorage.getItem("userLanguage");

    if (savedLang && savedLang !== "auto" && SUPPORTED_LANGUAGES[savedLang]) {
      console.log("저장된 언어 사용:", savedLang);
      cachedLanguage = savedLang;
      localStorage.setItem("preferredLanguage", savedLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return savedLang;
    }

    // 3. 자동 설정이거나 저장된 언어가 없는 경우
    console.log("자동 언어 감지 시도...");

    // 먼저 브라우저 언어 시도
    const browserLang = detectBrowserLanguage();
    if (SUPPORTED_LANGUAGES[browserLang]) {
      console.log("브라우저 언어 사용:", browserLang);
      cachedLanguage = browserLang;
      localStorage.setItem("preferredLanguage", browserLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return browserLang;
    }

    // 브라우저 언어가 지원되지 않으면 위치 기반 감지
    try {
      const locationLang = await detectLanguageFromLocation();
      console.log("위치 기반 언어 사용:", locationLang);
      cachedLanguage = locationLang;
      localStorage.setItem("preferredLanguage", locationLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return locationLang;
    } catch (error) {
      console.error("위치 기반 언어 감지 실패, 기본 언어 사용");
      cachedLanguage = "ko"; // 최종 기본값: 한국어
      localStorage.setItem("preferredLanguage", "ko"); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return "ko";
    }
  } finally {
    languageDetectionInProgress = false;
  }
}

// 언어 설정 저장 및 적용
function setLanguage(langCode) {
  console.log("언어 설정 변경:", langCode);

  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("preferredLanguage"); // 도메인-카테고리-이모지용 언어 설정도 제거
    cachedLanguage = null; // 캐시 초기화
  } else {
    localStorage.setItem("userLanguage", langCode);
    localStorage.setItem("preferredLanguage", langCode); // 도메인-카테고리-이모지용 언어 설정도 저장
    cachedLanguage = langCode; // 캐시 업데이트
  }

  // 언어 적용 및 메타데이터 업데이트
  applyLanguage();

  // 현재 페이지 유형 감지하여 적절한 메타데이터 업데이트
  const currentPath = window.location.pathname.toLowerCase();
  let pageType = "home";

  if (
    currentPath.includes("multilingual-dictionary") ||
    currentPath.includes("dictionary")
  ) {
    pageType = "dictionary";
  } else if (
    currentPath.includes("language-learning") ||
    currentPath.includes("learning")
  ) {
    pageType = "learning";
  } else if (
    currentPath.includes("language-games") ||
    currentPath.includes("games")
  ) {
    pageType = "games";
  } else if (
    currentPath.includes("ai-vocabulary") ||
    currentPath.includes("ai")
  ) {
    pageType = "ai-vocabulary";
  }

  updateMetadata(pageType);
}

// 언어 변경 시 페이지 리다이렉트
function redirectToLanguagePage(langCode) {
  const currentPath = window.location.pathname;

  // 이미 목표 언어 경로에 있는 경우 리다이렉트하지 않음
  const currentLang = detectLanguageFromURL();
  if (currentLang === langCode) {
    console.log(`이미 ${langCode} 언어 페이지에 있습니다.`);
    return;
  }

  // 리다이렉트 중복 방지
  if (sessionStorage.getItem("redirecting")) {
    console.log("이미 리다이렉트 중입니다.");
    return;
  }

  sessionStorage.setItem("redirecting", "true");

  let targetPath;

  // 개발 환경 감지
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5500";

  // 현재 페이지에서 언어별 경로로 변환
  if (currentPath === "/" || currentPath === "/index.html") {
    targetPath = isDevelopment
      ? `/locales/${langCode}/index.html`
      : `/${langCode}/index.html`;
  } else if (currentPath.startsWith("/pages/")) {
    const pageName = currentPath.replace("/pages/", "");
    targetPath = isDevelopment
      ? `/locales/${langCode}/${pageName}`
      : `/${langCode}/${pageName}`;
  } else if (currentPath.match(/^\/locales\/[a-z]{2}\//)) {
    // 개발 환경에서 locales 경로인 경우
    const pageName = currentPath.replace(/^\/locales\/[a-z]{2}\//, "");
    targetPath = `/locales/${langCode}/${pageName}`;
  } else if (currentPath.match(/^\/[a-z]{2}\//)) {
    // 배포 환경에서 언어별 경로인 경우
    const pageName = currentPath.replace(/^\/[a-z]{2}\//, "");
    targetPath = `/${langCode}/${pageName}`;
  } else {
    targetPath = isDevelopment
      ? `/locales/${langCode}/index.html`
      : `/${langCode}/index.html`;
  }

  console.log(`언어 변경: ${currentPath} → ${targetPath}`);
  window.location.href = targetPath;

  // 1초 후 세션 스토리지 정리
  setTimeout(() => {
    sessionStorage.removeItem("redirecting");
  }, 1000);
}

// 언어 변경 적용 (locales 방식)
async function applyLanguage() {
  try {
    const langCode = await getActiveLanguage();
    console.log("🌐 번역 적용 시작, 언어:", langCode);

    // HTML lang 속성 변경
    document.documentElement.lang = langCode;

    // 번역 적용 (리다이렉트 없이)
    await loadTranslations();
    console.log("📚 번역 파일 로드 완료");

    // 현재 번역 객체 확인
    console.log("🔍 현재 번역 객체:", translations);
    console.log("🔍 번역 객체 키들:", Object.keys(translations));
    console.log("🔍 현재 언어 번역 데이터:", translations[langCode]);

    // 실제 번역 데이터 확인
    const currentTranslations = translations[langCode];
    if (currentTranslations) {
      console.log(
        "🔍 learn_languages 번역:",
        currentTranslations["learn_languages"]
      );
      console.log("🔍 wordbook 번역:", currentTranslations["wordbook"]);
    } else {
      console.error("❌ 현재 언어의 번역 데이터가 없습니다:", langCode);
    }

    // 페이지의 모든 번역 요소 업데이트
    const elements = document.querySelectorAll("[data-i18n]");
    console.log("📝 번역 요소 개수:", elements.length);

    elements.forEach((element, index) => {
      const key = element.getAttribute("data-i18n");
      // 올바른 번역 데이터 접근
      const translationText = currentTranslations
        ? currentTranslations[key]
        : null;

      if (translationText) {
        const oldText = element.textContent;
        element.textContent = translationText;
        console.log(
          `✅ 번역 적용 [${index}]: ${key} -> "${translationText}" (이전: "${oldText}")`
        );
      } else {
        console.warn(`❌ 번역 키 없음 [${index}]: ${key}`);
      }
    });

    // placeholder 번역
    const placeholderElements = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );
    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      const translationText = currentTranslations
        ? currentTranslations[key]
        : null;
      if (translationText) {
        element.placeholder = translationText;
      }
    });

    console.log(`언어 적용 완료: ${langCode}`);
  } catch (error) {
    console.error("언어 적용 중 오류:", error);
  }
}

// 언어 설정 모달 표시
function showLanguageSettingsModal() {
  if (document.getElementById("language-settings-modal")) {
    document
      .getElementById("language-settings-modal")
      .classList.remove("hidden");
    return;
  }

  const currentLang = getCurrentLanguage();

  const modalHTML = `
    <div id="language-settings-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" data-i18n="language_settings">언어 설정</h3>
          <button id="close-language-modal" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mb-4">
          <div class="space-y-2">
            <div class="flex items-center">
              <input type="radio" id="lang-auto" name="language" value="auto" class="mr-2" ${
                currentLang === "auto" ? "checked" : ""
              }>
              <label for="lang-auto">자동 감지 (Auto Detect)</label>
            </div>
            ${Object.values(SUPPORTED_LANGUAGES)
              .map(
                (lang) =>
                  `<div class="flex items-center">
                <input type="radio" id="lang-${
                  lang.code
                }" name="language" value="${lang.code}" class="mr-2" ${
                    currentLang === lang.code ? "checked" : ""
                  }>
                <label for="lang-${lang.code}">${lang.name}</label>
              </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="flex justify-end">
          <button id="save-language" class="bg-[#4B63AC] text-white px-4 py-2 rounded hover:bg-[#3A4F8B]" data-i18n="save">저장</button>
        </div>
      </div>
    </div>
  `;

  // 모달 추가
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // 이벤트 핸들러
  document
    .getElementById("close-language-modal")
    .addEventListener("click", () => {
      document
        .getElementById("language-settings-modal")
        .classList.add("hidden");
    });

  document.getElementById("save-language").addEventListener("click", () => {
    const selectedLang = document.querySelector(
      'input[name="language"]:checked'
    ).value;

    console.log("언어 설정 저장:", selectedLang);

    // 언어 설정 저장 및 적용
    setLanguage(selectedLang);

    // 모달 닫기
    document.getElementById("language-settings-modal").classList.add("hidden");

    // 성공 메시지 (선택사항)
    console.log("언어 설정이 저장되었습니다:", selectedLang);
  });
}

// 메타데이터 업데이트 함수 (캐시된 언어 사용)
async function updateMetadata(pageType = "home") {
  try {
    // 캐시된 언어를 먼저 확인, 없으면 감지
    let langCode = cachedLanguage;
    if (!langCode) {
      langCode = await getActiveLanguage();
    }

    if (!seoMetadata[pageType] || !seoMetadata[pageType][langCode]) {
      console.error(`메타데이터가 없습니다: ${pageType}, ${langCode}`);
      return;
    }

    const metadata = seoMetadata[pageType][langCode];

    // 타이틀 업데이트
    document.title = metadata.title;

    // 메타 태그 업데이트 또는 생성
    updateOrCreateMetaTag("description", metadata.description);
    updateOrCreateMetaTag("keywords", metadata.keywords);

    // Open Graph 메타 태그
    updateOrCreateMetaTag("og:title", metadata.title, "property");
    updateOrCreateMetaTag("og:description", metadata.description, "property");
    updateOrCreateMetaTag("og:locale", langCode, "property");

    // 대체 언어 링크 업데이트
    updateAlternateLanguageLinks(pageType, langCode);

    // 표준 링크(canonical) 업데이트
    updateOrCreateLinkTag("canonical", metadata.canonical);

    // hreflang 태그 업데이트
    updateHreflangTags(pageType, langCode);
  } catch (error) {
    console.error("메타데이터 업데이트 중 오류 발생:", error);
  }
}

// 메타 태그 업데이트 또는 생성 헬퍼 함수
function updateOrCreateMetaTag(name, content, attribute = "name") {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);

  if (metaTag) {
    metaTag.setAttribute("content", content);
  } else {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, name);
    metaTag.setAttribute("content", content);
    document.head.appendChild(metaTag);
  }
}

// 링크 태그 업데이트 또는 생성 헬퍼 함수
function updateOrCreateLinkTag(rel, href) {
  let linkTag = document.querySelector(`link[rel="${rel}"]`);

  if (linkTag) {
    linkTag.setAttribute("href", href);
  } else {
    linkTag = document.createElement("link");
    linkTag.setAttribute("rel", rel);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  }
}

// hreflang 태그 업데이트 함수
function updateHreflangTags(pageType, currentLangCode) {
  // 기존 hreflang 태그 모두 제거
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((tag) => tag.remove());

  // 각 지원 언어에 대해 hreflang 태그 추가
  Object.keys(SUPPORTED_LANGUAGES).forEach((langCode) => {
    const href = seoMetadata[pageType][langCode].canonical;

    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "alternate");
    linkTag.setAttribute("hreflang", langCode);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  });

  // x-default hreflang 태그 추가 (기본적으로 영어 버전으로 설정)
  const defaultHref = seoMetadata[pageType]["en"].canonical;
  const defaultLinkTag = document.createElement("link");
  defaultLinkTag.setAttribute("rel", "alternate");
  defaultLinkTag.setAttribute("hreflang", "x-default");
  defaultLinkTag.setAttribute("href", defaultHref);
  document.head.appendChild(defaultLinkTag);
}

// 대체 언어 링크 업데이트 함수
function updateAlternateLanguageLinks(pageType, currentLangCode) {
  // 다른 언어 버전에 대한 링크 업데이트
  Object.entries(SUPPORTED_LANGUAGES).forEach(([langCode, langInfo]) => {
    if (langCode !== currentLangCode) {
      const href = seoMetadata[pageType][langCode].canonical;
      updateOrCreateLinkTag(`alternate-${langCode}`, href);
    }
  });
}

// 언어별 URL 자동 리다이렉트 함수
function handleLanguageRouting() {
  // locales 구조에서는 라우팅 처리 불필요
  // 각 언어별 폴더에 정적 파일들이 있음
  return;
}

// 네비게이션 링크 자동 업데이트 함수
function updateNavigationLinks() {
  const currentLang = detectLanguageFromURL() || "ko";

  // data-i18n-link 속성을 가진 모든 링크 업데이트
  document.querySelectorAll("[data-i18n-link]").forEach((link) => {
    const targetPage = link.getAttribute("data-i18n-link");
    link.href = `/${currentLang}/${targetPage}`;
  });

  // 프로필 링크는 루트에 있음
  document.querySelectorAll('a[href*="profile.html"]').forEach((link) => {
    link.href = `/profile.html`;
  });

  // 로그인/회원가입 링크도 루트에 있음
  document
    .querySelectorAll('a[href*="login.html"], a[href*="signup.html"]')
    .forEach((link) => {
      const fileName = link.href.includes("login")
        ? "login.html"
        : "signup.html";
      link.href = `/${fileName}`;
    });
}

// 페이지 로드 시 언어 라우팅 처리
if (typeof window !== "undefined") {
  // DOM이 로드된 후 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      handleLanguageRouting();
      updateNavigationLinks();
    });
  } else {
    handleLanguageRouting();
    updateNavigationLinks();
  }
}

// 전역에서 접근 가능하도록 설정
if (typeof window !== "undefined") {
  window.loadTranslations = loadTranslations;
  window.translateDomainCategory = translateDomainCategory;
  window.getCurrentUILanguage = getCurrentUILanguage;
  window.detectBrowserLanguage = detectBrowserLanguage;
  window.getCurrentLanguage = getCurrentLanguage;
  window.getActiveLanguage = getActiveLanguage;
  window.setLanguage = setLanguage;
  window.applyLanguage = applyLanguage;
  window.showLanguageSettingsModal = showLanguageSettingsModal;
  window.updateMetadata = updateMetadata;
  window.handleLanguageRouting = handleLanguageRouting;
  window.updateNavigationLinks = updateNavigationLinks;
}

export {
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  getCurrentLanguage,
  setLanguage,
  getActiveLanguage,
  applyLanguage,
  showLanguageSettingsModal,
  updateMetadata,
};
