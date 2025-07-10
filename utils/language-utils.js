// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = {
  ko: {
    name: "한국어",
    code: "ko",
    emoji: "🇰🇷",
  },
  en: {
    name: "English",
    code: "en",
    emoji: "🇺🇸",
  },
  ja: {
    name: "日本語",
    code: "ja",
    emoji: "🇯🇵",
  },
  zh: {
    name: "中文",
    code: "zh",
    emoji: "🇨🇳",
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
function translateDomainCategory(domain, category, userLanguage = null) {
  // 현재 환경 언어 감지 (우선순위: 파라미터 > getCurrentUILanguage > URL > localStorage > 기본값)
  let langCode = userLanguage;

  if (!langCode) {
    // getCurrentUILanguage 함수 우선 사용
    if (typeof getCurrentUILanguage === "function") {
      langCode = getCurrentUILanguage();
    } else {
      // URL에서 언어 감지
      const urlLanguage = detectLanguageFromURL();
      if (urlLanguage) {
        langCode = urlLanguage;
      } else {
        // localStorage에서 언어 가져오기
        langCode = localStorage.getItem("userLanguage") || "ko";
      }
    }
  }

  // auto 언어 처리
  if (langCode === "auto") {
    langCode = "ko";
  }

  // window.translations에서 번역 찾기 (우선)
  let domainText = domain;
  let categoryText = category;

  if (window.translations && window.translations[langCode]) {
    const translations = window.translations[langCode];
    domainText = translations[`domain_${domain}`] || domain;
    categoryText = translations[`category_${category}`] || category;
  } else {
    // 내장 번역에서 찾기 (fallback)
    const texts = translations[langCode] || translations.ko;
    if (texts) {
      domainText = texts[`domain_${domain}`] || domain;
      categoryText = texts[`category_${category}`] || category;
    } else {
      console.warn("⚠️ 번역 데이터를 찾을 수 없음, 원본 텍스트 사용");
    }
  }

  const result = `${domainText} > ${categoryText}`;
  return result;
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
    const browserLang = detectBrowserLanguage();

    if (urlLang) {
      console.log("URL에서 언어 감지:", urlLang);

      // 사용자가 명시적으로 설정한 언어가 있는지 확인
      const userSetLang = localStorage.getItem("userLanguage");

      // 사용자가 명시적으로 언어를 설정하지 않았고, URL 언어가 브라우저 언어와 다르면 브라우저 언어로 리디렉션
      if (
        !userSetLang &&
        urlLang !== browserLang &&
        SUPPORTED_LANGUAGES[browserLang]
      ) {
        console.log(
          `🌐 브라우저 언어(${browserLang})와 URL 언어(${urlLang})가 다름. 브라우저 언어로 리디렉션합니다.`
        );
        cachedLanguage = browserLang;
        localStorage.setItem("userLanguage", browserLang);
        localStorage.setItem("preferredLanguage", browserLang);

        // 브라우저 언어로 리디렉션
        setTimeout(() => {
          redirectToLanguagePage(browserLang, true);
        }, 100);

        return browserLang;
      }

      cachedLanguage = urlLang;
      localStorage.setItem("preferredLanguage", urlLang);
      // URL에서 감지된 언어는 사용자 설정으로도 저장 (사용자가 명시적으로 설정하지 않은 경우만)
      if (!userSetLang) {
        localStorage.setItem("userLanguage", urlLang);
      }
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

    // 브라우저 언어 사용
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
  console.log("언어 설정 저장:", langCode);

  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("preferredLanguage"); // 도메인-카테고리-이모지용 언어 설정도 제거
    cachedLanguage = null; // 캐시 초기화

    // 자동 감지 언어로 리디렉션
    const detectedLang = detectBrowserLanguage();
    console.log("자동 감지된 언어로 리디렉션:", detectedLang);

    // 네비게이션바 언어 버튼 즉시 업데이트
    if (window.updateLanguageButton) {
      window.updateLanguageButton(detectedLang);
    }
    console.log("네비게이션바 언어 버튼 즉시 업데이트:", detectedLang);

    // 언어 변경 이벤트 발생 (리디렉션 전에)
    const languageChangeEvent = new CustomEvent("languageChanged", {
      detail: { language: detectedLang, source: "navigation" },
    });
    window.dispatchEvent(languageChangeEvent);

    // 100ms 지연 후 리디렉션 (사용자가 변경을 확인할 수 있도록)
    setTimeout(() => {
      redirectToLanguagePage(detectedLang, true);
    }, 100);
  } else {
    localStorage.setItem("userLanguage", langCode);
    localStorage.setItem("preferredLanguage", langCode); // 도메인-카테고리-이모지용 언어 설정도 저장
    cachedLanguage = langCode; // 캐시 업데이트

    // 네비게이션바 언어 버튼 즉시 업데이트
    if (window.updateLanguageButton) {
      window.updateLanguageButton(langCode);
    }
    console.log("네비게이션바 언어 버튼 즉시 업데이트:", langCode);

    console.log("언어 설정이 저장되었습니다:", langCode);

    // 언어 변경 이벤트 발생 (리디렉션 전에)
    const languageChangeEvent = new CustomEvent("languageChanged", {
      detail: { language: langCode, source: "navigation" },
    });
    window.dispatchEvent(languageChangeEvent);

    // 100ms 지연 후 리디렉션 (사용자가 변경을 확인할 수 있도록)
    setTimeout(() => {
      redirectToLanguagePage(langCode, true);
    }, 100);
  }
}

// 언어 변경 시 페이지 리다이렉트
function redirectToLanguagePage(langCode, forceRedirect = false) {
  const currentPath = window.location.pathname;

  // 이미 목표 언어 경로에 있는 경우 리다이렉트하지 않음 (강제 리디렉션이 아닌 경우)
  const currentLang = detectLanguageFromURL();
  if (currentLang === langCode && !forceRedirect) {
    console.log(`이미 ${langCode} 언어 페이지에 있습니다.`);
    return;
  }

  // 리다이렉트 중복 방지 (강제 리디렉션이 아닌 경우)
  if (!forceRedirect && sessionStorage.getItem("redirecting")) {
    console.log(
      "이미 리다이렉트 중입니다. 기존 플래그를 초기화하고 재시도합니다."
    );
    sessionStorage.removeItem("redirecting");
    // 100ms 후 재시도
    setTimeout(() => redirectToLanguagePage(langCode, true), 100);
    return;
  }

  console.log(`🔄 언어 리디렉션 시작: ${currentLang} → ${langCode}`);
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

  console.log(`🚀 언어 변경 리디렉션: ${currentPath} → ${targetPath}`);

  // 즉시 리디렉션 실행
  window.location.href = targetPath;

  // 500ms 후 세션 스토리지 정리 (더 빠르게)
  setTimeout(() => {
    sessionStorage.removeItem("redirecting");
  }, 500);
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

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = currentTranslations ? currentTranslations[key] : null;

      if (translation && translation !== element.textContent.trim()) {
        element.textContent = translation;
      }
    });

    // data-i18n-link 속성을 가진 요소들의 링크 업데이트
    const linkElements = document.querySelectorAll("[data-i18n-link]");
    linkElements.forEach((element) => {
      const originalHref = element.getAttribute("data-i18n-link");
      if (originalHref) {
        const updatedHref = updateLinkForLanguage(originalHref, langCode);
        element.setAttribute("href", updatedHref);
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
async function showLanguageSettingsModal() {
  if (document.getElementById("language-settings-modal")) {
    document
      .getElementById("language-settings-modal")
      .classList.remove("hidden");
    return;
  }

  const currentLang = getCurrentLanguage();

  // 현재 UI 언어에 맞는 번역 가져오기
  const userLang = await getActiveLanguage();
  const autoDetectText = getI18nText("auto_detect", userLang) || "자동 감지";
  const languageSettingsText =
    getI18nText("language_settings", userLang) || "언어 설정";
  const saveText = getI18nText("save", userLang) || "저장";

  const modalHTML = `
    <div id="language-settings-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">${languageSettingsText}</h3>
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
              <label for="lang-auto">${autoDetectText}</label>
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
                <label for="lang-${lang.code}" class="flex items-center">
                  <span class="mr-2">${lang.emoji}</span>
                  <span>${lang.name}</span>
                </label>
              </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="flex justify-end">
          <button id="save-language" class="bg-[#4B63AC] text-white px-4 py-2 rounded hover:bg-[#3A4F8B]">${saveText}</button>
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

    // 모달 닫기 (먼저 닫아서 사용자 경험 개선)
    document.getElementById("language-settings-modal").classList.add("hidden");

    // 언어 버튼 즉시 업데이트 (리디렉션 전에)
    if (typeof window.updateLanguageButton === "function") {
      window.updateLanguageButton(selectedLang);
      console.log("네비게이션바 언어 버튼 즉시 업데이트:", selectedLang);
    }

    // 언어 설정 저장 및 적용 (리디렉션 포함)
    setTimeout(() => {
      setLanguage(selectedLang);
    }, 100); // 100ms 지연으로 사용자가 변경을 볼 수 있게 함

    // 성공 메시지 (선택사항)
    console.log("언어 설정이 저장되었습니다:", selectedLang);
  });

  // 모달 외부 클릭 시 닫기
  document
    .getElementById("language-settings-modal")
    .addEventListener("click", (e) => {
      if (e.target.id === "language-settings-modal") {
        document
          .getElementById("language-settings-modal")
          .classList.add("hidden");
        console.log("🌐 언어 설정 모달 닫힘 (외부 클릭으로 인해)");
      }
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

// 언어별 로그인/회원가입 페이지로 리다이렉트하는 함수
function goToLanguageSpecificPage(pageName) {
  const currentLanguage = localStorage.getItem("userLanguage") || "ko";

  // 개발 환경 감지
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5500" ||
    window.location.hostname.includes("127.0.0.1");

  let targetPath;

  if (isDevelopment) {
    // 개발 환경: locales 폴더 경로 사용
    targetPath = `/locales/${currentLanguage}/${pageName}`;
  } else {
    // 배포 환경: 언어별 경로 사용
    targetPath = `/${currentLanguage}/${pageName}`;
  }

  console.log(`${pageName}으로 이동:`, targetPath);
  window.location.href = targetPath;
}

// 로그인이 필요한 페이지에서 로그인 페이지로 리다이렉트하는 함수
function redirectToLogin() {
  goToLanguageSpecificPage("login.html");
}

// 회원가입 페이지로 리다이렉트하는 함수
function redirectToSignup() {
  goToLanguageSpecificPage("signup.html");
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
      setupLanguageStateSync();
    });
  } else {
    handleLanguageRouting();
    updateNavigationLinks();
    setupLanguageStateSync();
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
  window.goToLanguageSpecificPage = goToLanguageSpecificPage;
  window.redirectToLogin = redirectToLogin;
  window.redirectToSignup = redirectToSignup;
  window.getI18nText = getI18nText;
  window.applyI18nToPage = applyI18nToPage;
  window.setupI18nListener = setupI18nListener;
  window.translateDomainKey = translateDomainKey;
  window.translateCategoryKey = translateCategoryKey;
  window.setupLanguageStateSync = setupLanguageStateSync;
  window.reloadAndTranslateNavbar = reloadAndTranslateNavbar;
  window.loadNavbar = loadNavbar;
  window.setupBasicNavbarEvents = setupBasicNavbarEvents;
  console.log(
    "✅ loadNavbar, setupBasicNavbarEvents 함수를 전역으로 노출했습니다."
  );
}

// 언어별 링크 업데이트 함수
function updateLinkForLanguage(originalHref, language) {
  // 개발 환경 감지
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5500";

  // 현재 경로 정보
  const currentPath = window.location.pathname;

  if (isDevelopment) {
    // 개발 환경: /locales/{language}/
    if (currentPath.includes("/locales/")) {
      return originalHref; // 상대 경로 그대로 사용
    } else {
      return `/locales/${language}/${originalHref}`;
    }
  } else {
    // 배포 환경: /{language}/
    if (currentPath.match(/^\/(ko|en|ja|zh)\//)) {
      return originalHref; // 상대 경로 그대로 사용
    } else {
      return `/${language}/${originalHref}`;
    }
  }
}

// 번역 텍스트 가져오기 함수
function getI18nText(key, lang = null) {
  try {
    const currentLang = lang || getCurrentUILanguage();

    // window.translations에서 번역 찾기
    if (
      window.translations &&
      window.translations[currentLang] &&
      window.translations[currentLang][key]
    ) {
      return window.translations[currentLang][key];
    }

    // translations 객체에서 번역 찾기
    if (translations[currentLang] && translations[currentLang][key]) {
      return translations[currentLang][key];
    }

    // 기본값 반환
    return key;
  } catch (error) {
    console.error(`번역 텍스트 가져오기 실패 (${key}):`, error);
    return key;
  }
}

// 페이지의 모든 번역 요소에 번역 적용
function applyI18nToPage(lang = null) {
  try {
    const currentLang = lang || getCurrentUILanguage();
    console.log("🌐 페이지 번역 적용 시작, 언어:", currentLang);

    // data-i18n 속성을 가진 모든 요소 번역
    const elements = document.querySelectorAll("[data-i18n]");
    console.log("📝 번역 요소 개수:", elements.length);

    elements.forEach((element, index) => {
      const key = element.getAttribute("data-i18n");
      const translation = getI18nText(key, currentLang);

      if (translation && translation !== key) {
        const previousText = element.textContent.trim();
        element.textContent = translation;
        console.log(
          `✅ 번역 적용 [${index}]: ${key} -> "${translation}" (이전: "${previousText}")`
        );
      }
    });

    // data-i18n-placeholder 속성을 가진 요소들의 placeholder 번역
    const placeholderElements = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );
    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      const translation = getI18nText(key, currentLang);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    });
  } catch (error) {
    console.error("페이지 번역 적용 중 오류:", error);
  }
}

// 번역 관련 이벤트 리스너 설정
function setupI18nListener() {
  // 언어 변경 이벤트 리스너
  document.addEventListener("languageChanged", (event) => {
    console.log("언어 변경 감지:", event.detail);
    applyI18nToPage(event.detail.language);
  });
}

// 도메인 키 번역
function translateDomainKey(domainKey, lang = null) {
  return getI18nText(`domain_${domainKey}`, lang) || domainKey;
}

// 카테고리 키 번역
function translateCategoryKey(categoryKey, lang = null) {
  return getI18nText(`category_${categoryKey}`, lang) || categoryKey;
}

// 언어 상태 동기화 설정 (뒤로가기/앞으로가기 대응)
function setupLanguageStateSync() {
  console.log("🔄 언어 상태 동기화 설정");

  // popstate 이벤트 리스너 (브라우저 뒤로가기/앞으로가기)
  window.addEventListener("popstate", async (event) => {
    console.log("🔙 브라우저 네비게이션 감지:", event);

    // URL에서 언어 감지
    const urlLanguage = detectLanguageFromURL();
    const currentLanguage = getCurrentLanguage();

    console.log("🔍 언어 비교:", { urlLanguage, currentLanguage });

    if (urlLanguage && urlLanguage !== currentLanguage) {
      console.log("⚠️ 언어 불일치 감지, 동기화 필요");

      // localStorage 업데이트
      localStorage.setItem("preferredLanguage", urlLanguage);

      // 간단한 번역 적용 (재로드 없이)
      await simpleLanguageSync(urlLanguage);
    }
  });

  // 언어 변경 시 상태 저장
  window.addEventListener("languageChanged", (event) => {
    const newLanguage = event.detail.language;
    console.log("📝 언어 변경 상태 저장:", newLanguage);

    // 현재 상태를 history에 저장
    const currentState = { language: newLanguage, timestamp: Date.now() };
    history.replaceState(currentState, document.title, window.location.href);
  });
}

// 간단한 언어 동기화 (네비게이션바 재로드 없이)
async function simpleLanguageSync(language) {
  try {
    console.log("🔄 간단한 언어 동기화 시작, 언어:", language);

    // 1. 번역 파일 재로드
    await loadTranslations();

    // 2. 페이지 번역 적용
    await applyI18nToPage(language);

    // 3. 약간의 지연 후 강제 번역 적용
    await new Promise((resolve) => setTimeout(resolve, 100));
    await forceApplyTranslations(language);

    // 4. 네비게이션바 함수들 호출 (있는 경우에만)
    if (typeof window.updateLanguageButton === "function") {
      window.updateLanguageButton(language);
    }

    if (typeof window.updateCurrentPageMenuName === "function") {
      window.updateCurrentPageMenuName(language);
    }

    // 5. 페이지별 특수 처리
    await handlePageSpecificSync(language);

    // 6. 언어 변경 이벤트 발생
    const languageChangeEvent = new CustomEvent("languageChanged", {
      detail: { language: language, source: "popstate" },
    });
    window.dispatchEvent(languageChangeEvent);

    console.log("✅ 간단한 언어 동기화 완료");
  } catch (error) {
    console.error("❌ 간단한 언어 동기화 실패:", error);
  }
}

// 강제 번역 적용 함수
async function forceApplyTranslations(language) {
  try {
    console.log("🔧 강제 번역 적용 시작, 언어:", language);

    // 모든 data-i18n 속성을 가진 요소 강제 번역
    const elements = document.querySelectorAll("[data-i18n]");
    console.log(`📝 강제 번역 대상 요소: ${elements.length}개`);

    elements.forEach((element, index) => {
      const key = element.getAttribute("data-i18n");
      const translation = getI18nText(key, language);

      if (translation && translation !== key) {
        const previousText = element.textContent.trim();
        element.textContent = translation;
        console.log(
          `🔧 강제 번역 [${index}]: ${key} -> "${translation}" (이전: "${previousText}")`
        );
      } else {
        console.warn(`⚠️ 번역 누락: ${key} (언어: ${language})`);
      }
    });

    // placeholder 번역도 강제 적용
    const placeholderElements = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );
    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      const translation = getI18nText(key, language);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    });
  } catch (error) {
    console.error("❌ 강제 번역 적용 실패:", error);
  }
}

// 페이지별 특수 동기화 처리
async function handlePageSpecificSync(language) {
  try {
    const currentPath = window.location.pathname;

    // 단어장 페이지
    if (currentPath.includes("vocabulary.html")) {
      console.log("📚 단어장 페이지 특수 동기화");
      // 필터 UI 업데이트
      if (typeof window.updateFilterUI === "function") {
        await window.updateFilterUI();
      }
      // 개념 카드 다시 렌더링
      if (typeof window.renderConceptCards === "function") {
        await window.renderConceptCards();
      }
    }

    // AI 단어장 페이지
    if (currentPath.includes("ai-vocabulary.html")) {
      console.log("🤖 AI 단어장 페이지 특수 동기화");
      // 필터 UI 업데이트
      if (typeof window.updateFilterUI === "function") {
        await window.updateFilterUI();
      }
      // AI 개념 카드 다시 렌더링
      if (typeof window.renderAIConceptCards === "function") {
        await window.renderAIConceptCards();
      }
    }

    // 학습 페이지
    if (currentPath.includes("learning.html")) {
      console.log("📖 학습 페이지 특수 동기화");
      // 학습 UI 업데이트
      if (typeof window.updateLearningUI === "function") {
        await window.updateLearningUI();
      }
    }

    // 퀴즈 페이지
    if (currentPath.includes("quiz.html")) {
      console.log("❓ 퀴즈 페이지 특수 동기화");
      // 퀴즈 UI 업데이트
      if (typeof window.updateQuizUI === "function") {
        await window.updateQuizUI();
      }
    }
  } catch (error) {
    console.error("페이지별 특수 동기화 처리 중 오류:", error);
  }
}

// 네비게이션바 다시 로드 및 번역 적용
async function reloadAndTranslateNavbar(language) {
  try {
    console.log("🔄 네비게이션바 다시 로드 시작, 언어:", language);

    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.warn("navbar-container를 찾을 수 없습니다.");
      return;
    }

    // 기존 네비게이션바 백업
    const originalContent = navbarContainer.innerHTML;

    // 네비게이션바 로드 플래그 리셋
    if (typeof window.navbarLoaded !== "undefined") {
      window.navbarLoaded = false;
    }

    try {
      // 네비게이션바 다시 로드 시도
      if (typeof window.loadNavbar === "function") {
        // 기존 내용 제거
        navbarContainer.innerHTML = "";

        // 약간의 지연 후 네비게이션바 다시 로드
        await new Promise((resolve) => setTimeout(resolve, 100));

        await window.loadNavbar();
        console.log("✅ 네비게이션바 다시 로드 완료");

        // 로딩 성공 확인
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 네비게이션바가 제대로 로드되었는지 확인
        const navElements = navbarContainer.querySelectorAll("nav");
        if (navElements.length === 0) {
          throw new Error("네비게이션바 로딩 실패 - nav 요소 없음");
        }

        // 충분한 지연 후 번역 적용
        await new Promise((resolve) => setTimeout(resolve, 200));
        await applyI18nToPage(language);
      } else {
        console.warn("window.loadNavbar 함수를 찾을 수 없습니다.");
        // 번역만 적용
        await applyI18nToPage(language);
      }
    } catch (navError) {
      console.error("❌ 네비게이션바 로딩 실패, 복구 시도:", navError);

      // 실패 시 원본 내용 복구
      navbarContainer.innerHTML = originalContent;

      // 복구된 네비게이션바에 번역 적용
      await new Promise((resolve) => setTimeout(resolve, 100));
      await applyI18nToPage(language);

      console.log("🔄 네비게이션바 복구 완료");
    }
  } catch (error) {
    console.error("❌ 네비게이션바 다시 로드 전체 실패:", error);
  }
}

// 공통 네비게이션바 로딩 함수
async function loadNavbar() {
  try {
    console.log("🔄 네비게이션바 로딩 시작");

    // DOM 로드 확인
    if (document.readyState === "loading") {
      console.log("⏳ DOM 로딩 대기 중...");
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", resolve);
      });
    }

    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.error("❌ navbar-container 요소를 찾을 수 없습니다.");
      return;
    }

    // 현재 경로와 언어에 따라 네비게이션바 파일 경로 결정
    const currentPath = window.location.pathname;
    const currentLanguage = getCurrentLanguage();
    let navbarPath;

    if (currentPath.includes("/locales/")) {
      // locales 폴더 내부에서는 해당 언어의 navbar.html 사용
      navbarPath = "navbar.html";
    } else if (currentPath.includes("/pages/")) {
      // pages 폴더에서는 현재 언어에 맞는 locales 폴더의 navbar.html 사용
      navbarPath = `../locales/${currentLanguage}/navbar.html`;
    } else if (currentPath.match(/^\/[a-z]{2}\//)) {
      // 언어 경로 패턴 (/ko/, /en/ 등)에서는 절대 경로 사용
      navbarPath = `/locales/${currentLanguage}/navbar.html`;
    } else {
      // 루트에서는 현재 언어에 맞는 locales 폴더의 navbar.html 사용
      navbarPath = `locales/${currentLanguage}/navbar.html`;
    }

    console.log("📍 네비게이션바 경로:", navbarPath);

    // 네비게이션바 HTML 로드
    const response = await fetch(navbarPath);
    if (!response.ok) {
      // 언어별 네비게이션바 로드 실패 시 기본 언어(한국어) 시도
      console.warn(
        `언어별 네비게이션바 로드 실패 (${response.status}), 기본 언어(한국어) 시도`
      );

      let fallbackPath;
      if (currentPath.includes("/locales/")) {
        fallbackPath = "../ko/navbar.html";
      } else if (currentPath.includes("/pages/")) {
        fallbackPath = "../locales/ko/navbar.html";
      } else if (currentPath.match(/^\/[a-z]{2}\//)) {
        // 언어 경로 패턴 (/ko/, /en/ 등)에서는 절대 경로 사용
        fallbackPath = "/locales/ko/navbar.html";
      } else {
        fallbackPath = "locales/ko/navbar.html";
      }

      const fallbackResponse = await fetch(fallbackPath);
      if (!fallbackResponse.ok) {
        throw new Error(`네비게이션바 로드 실패: ${fallbackResponse.status}`);
      }

      const fallbackHTML = await fallbackResponse.text();
      navbarContainer.innerHTML = fallbackHTML;
      console.log("✅ 기본 언어 네비게이션바 HTML 로드 완료");
    } else {
      const navbarHTML = await response.text();
      navbarContainer.innerHTML = navbarHTML;
      console.log("✅ 언어별 네비게이션바 HTML 로드 완료");
    }

    // 약간의 지연 후 초기화 (DOM 안정화)
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log("🌐 현재 언어:", currentLanguage);

    // 네비게이션바 초기화
    if (typeof window.initializeNavbar === "function") {
      await window.initializeNavbar(currentLanguage);
      console.log("✅ 네비게이션바 초기화 완료");
    } else {
      console.warn("⚠️ initializeNavbar 함수를 찾을 수 없습니다.");

      // 기본 이벤트 설정 (initializeNavbar가 없을 때만)
      setupBasicNavbarEvents();
    }

    // 번역 적용
    await applyI18nToPage(currentLanguage);

    // 네비게이션바 로드 완료 플래그
    window.navbarLoaded = true;

    console.log("🎉 네비게이션바 로딩 완료");
  } catch (error) {
    console.error("❌ 네비게이션바 로딩 실패:", error);

    // 실패 시 기본 네비게이션바 생성
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer) {
      navbarContainer.innerHTML = `
        <nav class="bg-[#4B63AC] p-4 shadow-md">
          <div class="container mx-auto flex justify-between items-center max-w-6xl">
            <a href="/" class="text-white text-xl font-bold">LikeVoca</a>
            <div class="text-white text-sm">네비게이션바 로딩 실패 - 새로고침해주세요</div>
          </div>
        </nav>
      `;
    }
  }
}

// 기본 네비게이션바 이벤트 설정
function setupBasicNavbarEvents() {
  console.log("🔧 기본 네비게이션바 이벤트 설정");

  // 약간의 지연 후 이벤트 설정 (DOM 안정화)
  setTimeout(() => {
    // 햄버거 메뉴
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuToggle && mobileMenu) {
      // 기존 이벤트 리스너 제거 (중복 방지)
      const newMenuToggle = menuToggle.cloneNode(true);
      menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

      newMenuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🍔 햄버거 메뉴 클릭됨");
        // 클릭 시점에 모바일 메뉴를 다시 찾기 (DOM 변경에 대응)
        const currentMobileMenu = document.getElementById("mobile-menu");
        if (currentMobileMenu) {
          currentMobileMenu.classList.toggle("hidden");
          console.log(
            "📱 모바일 메뉴 상태:",
            currentMobileMenu.classList.contains("hidden") ? "숨김" : "표시"
          );
        } else {
          console.warn("⚠️ 모바일 메뉴를 찾을 수 없습니다.");
        }
      });
      console.log("✅ 햄버거 메뉴 이벤트 설정 완료");

      // 모바일 메뉴 외부 클릭 시 닫기
      document.addEventListener("click", (event) => {
        const currentMenuToggle = document.getElementById("menu-toggle");
        const currentMobileMenu = document.getElementById("mobile-menu");
        if (
          currentMenuToggle &&
          currentMobileMenu &&
          !currentMenuToggle.contains(event.target) &&
          !currentMobileMenu.contains(event.target) &&
          !currentMobileMenu.classList.contains("hidden")
        ) {
          currentMobileMenu.classList.add("hidden");
          console.log("🍔 햄버거 메뉴 닫힘 (외부 클릭으로 인해)");
        }
      });
      console.log("✅ 햄버거 메뉴 외부 클릭 이벤트 설정 완료");
    } else {
      console.warn("⚠️ 햄버거 메뉴 요소를 찾을 수 없습니다:", {
        menuToggle,
        mobileMenu,
      });
    }

    // 언어 버튼
    const languageButton = document.getElementById("language-button");
    if (languageButton) {
      // 기존 이벤트 리스너 제거 (중복 방지)
      const newLanguageButton = languageButton.cloneNode(true);
      languageButton.parentNode.replaceChild(newLanguageButton, languageButton);

      newLanguageButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🌐 언어 버튼 클릭됨");
        if (typeof window.showLanguageSettingsModal === "function") {
          window.showLanguageSettingsModal();
        } else {
          console.warn("⚠️ showLanguageSettingsModal 함수를 찾을 수 없습니다.");
        }
      });
      console.log("✅ 언어 버튼 이벤트 설정 완료");
    } else {
      console.warn("⚠️ 언어 버튼 요소를 찾을 수 없습니다:", { languageButton });
    }

    // 프로필 드롭다운 이벤트 설정
    const avatarContainer = document.getElementById("avatar-container");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (avatarContainer && profileDropdown) {
      // 기존 이벤트 리스너 제거 (중복 방지)
      const newAvatarContainer = avatarContainer.cloneNode(true);
      avatarContainer.parentNode.replaceChild(
        newAvatarContainer,
        avatarContainer
      );

      newAvatarContainer.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("👤 프로필 아바타 클릭됨");

        // 햄버거 메뉴가 열려있다면 닫기
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
          console.log("🍔 햄버거 메뉴 닫힘 (프로필 클릭으로 인해)");
        }

        // 클릭 시점에 드롭다운을 다시 찾기 (DOM 변경에 대응)
        const currentDropdown = document.getElementById("profile-dropdown");
        if (currentDropdown) {
          currentDropdown.classList.toggle("hidden");
          console.log(
            "📋 프로필 드롭다운 상태:",
            currentDropdown.classList.contains("hidden") ? "숨김" : "표시"
          );
        } else {
          console.warn("⚠️ 프로필 드롭다운을 찾을 수 없습니다.");
        }
      });
      console.log("✅ 프로필 드롭다운 이벤트 설정 완료");

      // 드롭다운 외부 클릭 시 닫기
      document.addEventListener("click", (event) => {
        const userProfile = document.getElementById("user-profile");
        const currentDropdown = document.getElementById("profile-dropdown");
        if (
          userProfile &&
          currentDropdown &&
          !userProfile.contains(event.target)
        ) {
          currentDropdown.classList.add("hidden");
        }
      });
      console.log("✅ 프로필 드롭다운 외부 클릭 이벤트 설정 완료");
    } else {
      console.warn("⚠️ 프로필 드롭다운 요소를 찾을 수 없습니다:", {
        avatarContainer,
        profileDropdown,
      });
    }

    // 로그아웃 버튼 이벤트 설정
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      // 기존 이벤트 리스너 제거 (중복 방지)
      const newLogoutButton = logoutButton.cloneNode(true);
      logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

      newLogoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🚪 로그아웃 버튼 클릭됨");

        // 드롭다운 먼저 닫기
        const currentDropdown = document.getElementById("profile-dropdown");
        if (currentDropdown) {
          currentDropdown.classList.add("hidden");
        }

        if (typeof window.handleLogout === "function") {
          window.handleLogout();
        } else {
          console.warn("⚠️ handleLogout 함수를 찾을 수 없습니다.");
        }
      });
      console.log("✅ 로그아웃 버튼 이벤트 설정 완료");
    } else {
      console.warn("⚠️ 로그아웃 버튼 요소를 찾을 수 없습니다:", {
        logoutButton,
      });
    }
  }, 100);
}

export {
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  getCurrentLanguage,
  getCurrentUILanguage,
  setLanguage,
  getActiveLanguage,
  applyLanguage,
  showLanguageSettingsModal,
  updateMetadata,
  getI18nText,
  applyI18nToPage,
  setupI18nListener,
  translateDomainKey,
  translateCategoryKey,
  setupLanguageStateSync,
  reloadAndTranslateNavbar,
  loadNavbar,
};

/**
 * 시스템 언어를 감지하고 지원하는 언어 형식으로 변환
 * @returns {string} 지원하는 언어 코드 (korean, english, japanese, chinese)
 */
export function getSystemLanguage() {
  const browserLanguage = navigator.language || navigator.userLanguage;
  const languageCode = browserLanguage.toLowerCase();

  // 시스템 언어를 지원하는 언어 형식으로 매핑
  const languageMapping = {
    ko: "korean",
    "ko-kr": "korean",
    en: "english",
    "en-us": "english",
    "en-gb": "english",
    ja: "japanese",
    "ja-jp": "japanese",
    zh: "chinese",
    "zh-cn": "chinese",
    "zh-tw": "chinese",
    "zh-hk": "chinese",
  };

  // 정확한 매칭을 먼저 시도
  if (languageMapping[languageCode]) {
    return languageMapping[languageCode];
  }

  // 언어 코드의 첫 번째 부분만 매칭
  const primaryLanguage = languageCode.split("-")[0];
  if (languageMapping[primaryLanguage]) {
    return languageMapping[primaryLanguage];
  }

  // 기본값은 한국어
  return "korean";
}

/**
 * 초기 언어 설정을 반환 (시스템 언어 기반)
 * @returns {Object} {sourceLanguage, targetLanguage}
 */
export function getInitialLanguageSettings() {
  const systemLanguage = getSystemLanguage();
  let sourceLanguage = systemLanguage;
  let targetLanguage = "english";

  // 시스템 언어가 영어인 경우 대상 언어를 다른 언어로 설정
  if (systemLanguage === "english") {
    targetLanguage = "korean";
  }

  return {
    sourceLanguage,
    targetLanguage,
  };
}

/**
 * 언어 필터 설정을 로드하고 초기화
 * @param {string} storageKey - 스토리지 키 (기본값: 'languageFilter')
 * @returns {Object} {sourceLanguage, targetLanguage}
 */
export function loadLanguageFilterSettings(storageKey = "languageFilter") {
  try {
    // 기존 설정 확인
    const savedSettings = sessionStorage.getItem(storageKey);

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // 저장된 설정이 유효한지 확인
      if (parsed.sourceLanguage && parsed.targetLanguage) {
        return parsed;
      }
    }

    // 저장된 설정이 없거나 유효하지 않은 경우 초기 설정 사용
    const initialSettings = getInitialLanguageSettings();
    saveLanguageFilterSettings(initialSettings, storageKey);
    return initialSettings;
  } catch (error) {
    console.error("언어 필터 설정 로드 실패:", error);
    // 오류 발생 시 기본 설정 반환
    const initialSettings = getInitialLanguageSettings();
    saveLanguageFilterSettings(
      initialSettings.sourceLanguage,
      initialSettings.targetLanguage,
      storageKey
    );
    return initialSettings;
  }
}

/**
 * 언어 필터 설정을 저장
 * @param {string} sourceLanguage - 원본 언어
 * @param {string} targetLanguage - 대상 언어
 * @param {string} storageKey - 스토리지 키 (기본값: 'languageFilter')
 */
export function saveLanguageFilterSettings(
  sourceLanguage,
  targetLanguage,
  storageKey = "languageFilter"
) {
  try {
    const settings = {
      sourceLanguage,
      targetLanguage,
    };
    sessionStorage.setItem(storageKey, JSON.stringify(settings));
  } catch (error) {
    console.error("언어 필터 설정 저장 실패:", error);
  }
}

/**
 * 언어 필터 DOM 요소들을 초기화
 * @param {string} sourceElementId - 원본 언어 선택 요소 ID
 * @param {string} targetElementId - 대상 언어 선택 요소 ID
 * @param {string} storageKey - 스토리지 키 (기본값: 'languageFilter')
 */
export function initializeLanguageFilterElements(
  sourceElementId,
  targetElementId,
  storageKey = "languageFilter"
) {
  const sourceElement = document.getElementById(sourceElementId);
  const targetElement = document.getElementById(targetElementId);

  if (!sourceElement || !targetElement) {
    console.warn(
      "언어 필터 요소를 찾을 수 없습니다:",
      sourceElementId,
      targetElementId
    );
    return;
  }

  // 저장된 설정 또는 초기 설정 로드
  const settings = loadLanguageFilterSettings(storageKey);

  // DOM 요소에 값 설정
  sourceElement.value = settings.sourceLanguage;
  targetElement.value = settings.targetLanguage;

  // 변경 이벤트 리스너 추가
  const saveCurrentSettings = () => {
    const currentSettings = {
      sourceLanguage: sourceElement.value,
      targetLanguage: targetElement.value,
    };
    saveLanguageFilterSettings(currentSettings, storageKey);
  };

  sourceElement.addEventListener("change", saveCurrentSettings);
  targetElement.addEventListener("change", saveCurrentSettings);

  console.log("언어 필터 초기화 완료:", settings);
}

/**
 * 네비게이션 언어 변경 시 언어 필터 업데이트
 * @param {string} newUILanguage - 새로운 UI 언어 (ko, en, ja, zh)
 * @param {string} storageKey - 스토리지 키
 */
export function updateLanguageFilterOnUIChange(newUILanguage, storageKey) {
  console.log("🔄 updateLanguageFilterOnUIChange 호출됨:", newUILanguage);

  // UI 언어를 언어 필터 형식으로 변환
  const uiLanguageToFilterLanguage = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };

  // 새로운 UI 언어에 맞는 원본 언어 설정
  const newSourceLanguage =
    uiLanguageToFilterLanguage[newUILanguage] || "korean";
  let newTargetLanguage = "english";

  // 원본 언어가 영어인 경우 대상 언어를 한국어로 설정
  if (newSourceLanguage === "english") {
    newTargetLanguage = "korean";
  }

  const newSettings = {
    sourceLanguage: newSourceLanguage,
    targetLanguage: newTargetLanguage,
  };

  console.log("🔄 새로운 언어 필터 설정:", newSettings);

  // 현재 페이지의 언어 필터 설정 업데이트 (환경 언어 변경 시 기존 설정 무시)
  if (storageKey) {
    saveLanguageFilterSettings(
      newSourceLanguage,
      newTargetLanguage,
      storageKey
    );
    console.log(`🔄 ${storageKey} 스토리지 업데이트 완료`);
  }

  // 현재 페이지의 언어 필터 DOM 요소 업데이트
  updateLanguageFilterElements(newSettings);

  console.log("🔄 언어 필터 DOM 업데이트 완료:", newSettings);

  console.log("✅ 네비게이션 언어 변경에 따른 언어 필터 초기화 완료:", {
    newUILanguage,
    newSourceLanguage,
    newTargetLanguage,
  });
}

/**
 * 언어 필터 DOM 요소들을 업데이트
 * @param {Object} settings - {sourceLanguage, targetLanguage}
 */
export function updateLanguageFilterElements(settings) {
  // 모든 가능한 언어 필터 요소 ID들
  const elementIds = [
    // 학습 페이지
    ["source-language", "target-language"],
    ["source-language-desktop", "target-language-desktop"],
    // 퀴즈 페이지
    ["quiz-source-language", "quiz-target-language"],
    // 게임 페이지 (source-language, target-language는 학습 페이지와 동일)
  ];

  elementIds.forEach(([sourceId, targetId]) => {
    const sourceElement = document.getElementById(sourceId);
    const targetElement = document.getElementById(targetId);

    if (sourceElement && targetElement) {
      sourceElement.value = settings.sourceLanguage;
      targetElement.value = settings.targetLanguage;
      console.log(`언어 필터 DOM 업데이트: ${sourceId}, ${targetId}`, settings);
    }
  });

  // 전역 변수 업데이트 (페이지별로 존재할 수 있음)
  if (typeof window.sourceLanguage !== "undefined") {
    window.sourceLanguage = settings.sourceLanguage;
  }
  if (typeof window.targetLanguage !== "undefined") {
    window.targetLanguage = settings.targetLanguage;
  }

  // 학습 페이지 전역 설정 업데이트
  if (window.languageSettings) {
    window.languageSettings.sourceLanguage = settings.sourceLanguage;
    window.languageSettings.targetLanguage = settings.targetLanguage;
  }
}

/**
 * 언어 필터 초기화를 동기적으로 처리
 * @param {string} sourceElementId - 원본 언어 선택 요소 ID
 * @param {string} targetElementId - 대상 언어 선택 요소 ID
 * @param {string} storageKey - 스토리지 키 (기본값: 'languageFilter')
 * @returns {Object} {sourceLanguage, targetLanguage}
 */
export function initializeLanguageFilterSync(
  sourceElementId,
  targetElementId,
  storageKey = "languageFilter"
) {
  const sourceElement = document.getElementById(sourceElementId);
  const targetElement = document.getElementById(targetElementId);

  if (!sourceElement || !targetElement) {
    console.warn(
      "언어 필터 요소를 찾을 수 없습니다:",
      sourceElementId,
      targetElementId
    );
    return getInitialLanguageSettings();
  }

  // 저장된 설정 또는 초기 설정 로드
  const settings = loadLanguageFilterSettings(storageKey);

  // DOM 요소에 값 설정
  sourceElement.value = settings.sourceLanguage;
  targetElement.value = settings.targetLanguage;

  console.log("언어 필터 동기 초기화 완료:", settings);
  return settings;
}
