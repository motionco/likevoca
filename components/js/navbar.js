import { auth } from "../../js/firebase/firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

import {
  showLanguageSettingsModal,
  applyLanguage,
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";

const uiToDbLanguageMap = {
  ko: "korean",
  en: "english",
  ja: "japanese",
  zh: "chinese",
};

const dbToUiLanguageMap = {
  korean: "ko",
  english: "en",
  japanese: "ja",
  chinese: "zh",
};

export async function loadNavbar() {
  try {
    // 현재 페이지 위치에 따라 경로 결정 (locales 구조)
    const currentPath = window.location.pathname;
    let navbarPath;

    if (currentPath.match(/^\/[a-z]{2}\//)) {
      // locales 폴더 내의 페이지인 경우 (예: /ko/vocabulary.html)
      navbarPath = "navbar.html";
    } else if (currentPath.includes("/pages/")) {
      // pages 폴더 내의 페이지인 경우 (개발 환경)
      navbarPath = "../components/navbar.html";
    } else {
      // 루트 폴더의 페이지인 경우
      navbarPath = "components/navbar.html";
    }

    const response = await fetch(navbarPath);
    const html = await response.text();
    document.getElementById("navbar-container").innerHTML = html;

    // 네비게이션 바 렌더 후 번역 적용
    if (typeof window.applyLanguage === "function") {
      window.applyLanguage();
    }

    // 초기 UI 상태 설정 (모든 요소 숨김으로 시작)
    setInitialUIState();

    initializeNavbar();

    // 인증 상태 리스너를 가장 먼저 초기화 (UI 깜빡임 최소화)
    let authListenerInitialized = false;

    const initAuthListener = () => {
      if (!authListenerInitialized && auth) {
        console.log("Auth 리스너 설정 - 우선순위");
        initializeAuthStateListener();
        authListenerInitialized = true;
      }
    };

    // Firebase 초기화 완료 이벤트를 기다림
    window.addEventListener("firebase-initialized", initAuthListener);

    // 이미 초기화되어 있을 수도 있으므로 바로 시도
    initAuthListener();

    // 언어 설정 초기화 및 적용
    console.log("네비게이션바 로드 완료, 언어 설정 초기화 중...");
    await initializeLanguageSettings();

    // 언어 설정 표시 업데이트
    updateLanguageDisplay();

    // 페이지 초기화 시 메타데이터 업데이트
    const pageType = getPageType();
    await updateMetadata(pageType);
  } catch (error) {
    console.error("Navbar 로드 실패: ", error);
  }
}

function initializeNavbar() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const avatar = document.getElementById("avatar");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Desktop 아바타 클릭 이벤트
  if (avatar && profileDropdown) {
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      if (!profileDropdown.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
      }
    });

    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  // 통합 언어 설정 버튼 이벤트 리스너
  const languageButton = document.getElementById("language-button");

  if (languageButton) {
    languageButton.addEventListener("click", showLanguageSettingsModal);
  }

  // 언어 변경 이벤트 리스너 (간소화)
  document.addEventListener("languageChanged", async (event) => {
    const userLanguage = event.detail.language;

    // 언어 버튼 표시 업데이트
    await updateLanguageDisplay();
  });
}

// 언어 설정 표시 업데이트
async function updateLanguageDisplay() {
  const languageButton = document.getElementById("language-button");

  const activeLang = await getActiveLanguage();

  // 언어 코드에 따른 표시 텍스트
  const langDisplay = {
    ko: "KR",
    en: "EN",
    ja: "JP",
    zh: "CN",
  };

  const displayText = langDisplay[activeLang] || "KR";

  // 통합 언어 버튼 업데이트 (반응형)
  if (languageButton) {
    // 모바일: 아이콘만, 데스크톱: 아이콘 + 텍스트
    languageButton.innerHTML = `
      <i class="fas fa-globe mr-1 lg:mr-1"></i>
      <span class="hidden lg:inline">${displayText}</span>
    `;
  }
}

function handleLogout() {
  if (!auth) {
    console.error("Firebase 인증이 초기화되지 않았습니다.");
    alert("로그아웃에 실패했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
    return;
  }

  signOut(auth)
    .then(() => {
      alert("로그아웃이 완료되었습니다.");
      window.location.reload();
    })
    .catch((error) => {
      alert("로그아웃에 실패했습니다.");
      console.error("로그아웃 오류: ", error);
    });
}

function initializeAuthStateListener() {
  if (!auth) {
    console.warn(
      "Firebase 인증이 초기화되지 않아 인증 상태 리스너를 설정할 수 없습니다."
    );
    return;
  }

  try {
    onAuthStateChanged(auth, (user) => {
      console.log("인증 상태 변경:", user ? "로그인됨" : "로그아웃됨", user);

      const mobileLoginButtons = document.getElementById(
        "mobile-login-buttons"
      );
      const desktopLoginSection = document.getElementById(
        "desktop-login-section"
      );
      const desktopUserSection = document.getElementById(
        "desktop-user-section"
      );
      const avatar = document.getElementById("avatar");

      console.log("요소 확인:", {
        mobileLoginButtons: !!mobileLoginButtons,
        desktopLoginSection: !!desktopLoginSection,
        desktopUserSection: !!desktopUserSection,
        avatar: !!avatar,
      });

      if (
        !mobileLoginButtons ||
        !desktopLoginSection ||
        !desktopUserSection ||
        !avatar
      ) {
        console.error("필수 요소를 찾을 수 없습니다.");
        return;
      }

      if (user) {
        console.log("로그인 상태 UI 업데이트 시작");

        // Desktop & Mobile: 로그인 섹션 강제 숨김, 유저 섹션 강제 표시
        desktopLoginSection.style.display = "none";
        desktopLoginSection.classList.add("hidden");
        desktopUserSection.style.display = "flex"; // 모바일에서도 표시
        desktopUserSection.classList.remove("hidden");
        desktopUserSection.classList.add("flex", "lg:flex"); // 모바일과 데스크톱 모두 flex
        console.log("데스크톱 & 모바일 아바타 섹션 업데이트 완료");

        // Mobile: 로그인 버튼들 숨기기
        mobileLoginButtons.classList.add("hidden");
        console.log("모바일 햄버거 메뉴 섹션 업데이트 완료");

        const userName = user.displayName || "사용자";
        // '환영합니다' 문구 제거
        const userNameElement = document.getElementById("user-name");

        if (userNameElement) {
          // 번역 시스템을 사용하여 사용자 이름 접미사 적용
          const currentLang = localStorage.getItem("userLanguage") || "ko";
          const userSuffix =
            window.translations?.[currentLang]?.user_suffix || "님";
          userNameElement.textContent = `${userName}${userSuffix}`;
        }

        const avatarURL =
          user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";

        // 데스크톱 & 모바일 아바타 설정 (반응형 크기 적용)
        avatar.innerHTML = `<img src="${avatarURL}" class="w-8 h-8 lg:w-10 lg:h-10 rounded-full" alt="프로필 사진">`;

        console.log("로그인 상태 UI 업데이트 완료");
      } else {
        console.log("로그아웃 상태 UI 업데이트 시작");

        // Desktop & Mobile: 유저 섹션 강제 숨김, 로그인 섹션 강제 표시
        desktopUserSection.style.display = "none";
        desktopUserSection.classList.add("hidden");
        desktopUserSection.classList.remove("flex", "lg:flex");
        desktopLoginSection.style.display = ""; // 데스크톱에서만 보이도록 CSS 클래스에 맡김
        desktopLoginSection.classList.remove("hidden");
        desktopLoginSection.classList.add("lg:flex");
        console.log("데스크톱 섹션 업데이트 완료");

        // Mobile: 로그인 버튼들 표시
        mobileLoginButtons.classList.remove("hidden");
        console.log("모바일 섹션 업데이트 완료");

        console.log("로그아웃 상태 UI 업데이트 완료");
      }
    });
  } catch (error) {
    console.error("인증 상태 리스너 설정 중 오류:", error);
  }
}

function createConceptCard(concept) {
  // 학습 관련 언어 설정 (DB 키 사용)
  const sourceLanguage = document.getElementById("source-language").value; // korean, english, japanese, chinese
  const targetLanguage = document.getElementById("target-language").value; // korean, english, japanese, chinese

  // 원본 언어와 타겟 언어 표현 가져오기 (DB에서)
  const sourceExpression = concept.expressions[sourceLanguage];
  const targetExpression = concept.expressions[targetLanguage];

  // ... 카드 생성 코드 ...

  // UI 텍스트에 현재 UI 언어 사용, 컨텐츠는 DB 언어 그대로 사용
  return `
    <div>
      <!-- UI 텍스트 -->
      <span>${getTranslatedText("meaning")}</span>
      
      <!-- 학습 컨텐츠 -->
      <span>${targetExpression.word}</span>
    </div>
  `;
}

function setLanguage(langCode) {
  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
  } else {
    localStorage.setItem("userLanguage", langCode);

    // URL에 언어 파라미터 추가
    const url = new URL(window.location.href);
    url.searchParams.set("lang", langCode);
    window.history.replaceState({}, "", url.toString());
  }
  applyLanguage();
}

// 언어 설정 초기화 함수 추가
async function initializeLanguageSettings() {
  try {
    // 저장된 언어 설정이 있는지 확인
    const savedLang = localStorage.getItem("userLanguage");

    if (savedLang && savedLang !== "auto") {
      console.log("저장된 언어 설정 발견:", savedLang);
      // 저장된 언어 설정 적용
      await applyLanguage();
    } else {
      console.log("저장된 언어 설정이 없음, 자동 감지 시작");
      // 자동 감지된 언어로 초기 설정
      const detectedLang = await getActiveLanguage();

      // 처음 방문하는 경우에만 자동 감지된 언어로 설정
      if (!savedLang) {
        localStorage.setItem("userLanguage", detectedLang);
      }

      await applyLanguage();
    }
  } catch (error) {
    console.error("언어 설정 초기화 실패:", error);
    // 실패 시 기본 언어로 설정
    localStorage.setItem("userLanguage", "ko");
    await applyLanguage();
  }
}

// 페이지 타입 감지 함수 추가
function getPageType() {
  const currentPath = window.location.pathname.toLowerCase();

  if (
    currentPath.includes("multilingual-dictionary") ||
    currentPath.includes("dictionary")
  ) {
    return "dictionary";
  } else if (
    currentPath.includes("language-learning") ||
    currentPath.includes("learning")
  ) {
    return "learning";
  } else if (
    currentPath.includes("language-games") ||
    currentPath.includes("games")
  ) {
    return "games";
  } else if (
    currentPath.includes("ai-vocabulary") ||
    currentPath.includes("ai")
  ) {
    return "ai-vocabulary";
  }

  return "home";
}

// 초기 UI 상태 설정 함수 추가
function setInitialUIState() {
  console.log("초기 UI 상태 설정 중...");

  const desktopLoginSection = document.getElementById("desktop-login-section");
  const desktopUserSection = document.getElementById("desktop-user-section");
  const mobileLoginButtons = document.getElementById("mobile-login-buttons");

  // 초기 상태: 모든 요소를 숨김으로 설정하여 깜빡임 방지
  // Firebase 인증 상태 확인 후 적절한 UI 표시
  if (desktopLoginSection) {
    desktopLoginSection.style.display = "none"; // 완전히 숨김
    desktopLoginSection.classList.add("hidden");
  }
  if (desktopUserSection) {
    desktopUserSection.style.display = "none"; // 완전히 숨김
    desktopUserSection.classList.add("hidden");
  }
  if (mobileLoginButtons) {
    mobileLoginButtons.classList.add("hidden"); // 모바일 로그인 버튼도 숨김
  }

  console.log("초기 UI 상태 설정 완료 - 모든 요소 숨김");
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 사용자 언어 초기화 - 오류 수정
    let userLanguage = localStorage.getItem("userLanguage") || "korean";

    // 네비게이션 바 초기화
    await loadNavbar();

    // 추가 코드...
  } catch (error) {
    console.error("네비게이션 바 초기화 중 오류 발생:", error);
  }
});
