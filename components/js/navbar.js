async function initializeNavbar(currentLanguage) {
  // 실제 현재 언어 감지 (URL 우선)
  const actualCurrentLanguage = detectCurrentLanguage();

  // 햄버거 메뉴 이벤트 설정
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // 언어 변경 버튼 이벤트 설정
  const languageButton = document.getElementById("language-button");
  if (languageButton) {
    languageButton.addEventListener("click", () => {
      const currentLang = detectCurrentLanguage(); // 현재 언어 다시 감지
      showLanguageModal(currentLang);
    });

    // 실제 현재 언어로 버튼 업데이트
    updateLanguageButton(actualCurrentLanguage);
  }

  // 언어 변경 이벤트 리스너 추가 (동적 업데이트)
  window.addEventListener("languageChanged", (event) => {
    updateLanguageButton(event.detail.language);
    updateCurrentPageMenuName(event.detail.language);
  });

  // 프로필 드롭다운 이벤트 설정
  const avatarContainer = document.getElementById("avatar-container");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (avatarContainer && profileDropdown) {
    avatarContainer.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener("click", (event) => {
      const userProfile = document.getElementById("user-profile");
      if (userProfile && !userProfile.contains(event.target)) {
        profileDropdown.classList.add("hidden");
      }
    });
  }

  // 로그아웃 버튼 이벤트 설정
  const logoutButton = document.getElementById("logout-button");
  const mobileLogoutButton = document.getElementById("mobile-logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", handleLogout);
  }

  // 현재 페이지에 맞는 메뉴 이름 업데이트
  updateCurrentPageMenuName(actualCurrentLanguage);

  // 네비게이션바 초기화가 완전히 끝난 후 인증 상태 확인 - 즉시 실행
  checkAuthStatus();

  // 추가 확인 - 500ms 후
  setTimeout(() => {
    checkAuthStatus();
  }, 500);

  // 추가 확인 - 1초 후
  setTimeout(() => {
    checkAuthStatus();
  }, 1000);

  // 최종 확인 - 2초 후
  setTimeout(() => {
    if (
      typeof window.auth !== "undefined" &&
      window.auth &&
      window.auth.currentUser
    ) {
      updateNavbarForAuthState(window.auth.currentUser);
    } else {
      // 로그아웃 상태로 업데이트
      updateNavbarForAuthState(null);
    }
  }, 2000);
}

// 현재 언어 감지 함수 (utils/language-utils.js와 일치하도록 수정)
function detectCurrentLanguage() {
  // 1. URL에서 언어 감지 (최우선) - utils/language-utils.js와 동일한 로직 사용
  const urlLang = detectLanguageFromURL();

  // 2. localStorage에서 언어 감지
  const storedLang =
    localStorage.getItem("userLanguage") ||
    localStorage.getItem("preferredLanguage");

  // URL에서 감지된 언어가 있으면 최우선으로 사용하고 localStorage와 동기화
  if (urlLang) {
    if (storedLang !== urlLang) {
      localStorage.setItem("userLanguage", urlLang);
      localStorage.setItem("preferredLanguage", urlLang);
    }
    return urlLang;
  }

  // 3. URL에서 감지되지 않으면 저장된 언어 사용
  if (storedLang && storedLang !== "auto") {
    return storedLang;
  }

  // 4. 기본값
  return "ko";
}

// URL에서 언어 감지 (utils/language-utils.js와 동일한 로직)
function detectLanguageFromURL() {
  const path = window.location.pathname;

  // locales 구조 확인
  if (path.includes("/locales/en/") || path.includes("/en/")) {
    return "en";
  } else if (path.includes("/locales/ja/") || path.includes("/ja/")) {
    return "ja";
  } else if (path.includes("/locales/zh/") || path.includes("/zh/")) {
    return "zh";
  } else if (path.includes("/locales/ko/") || path.includes("/ko/")) {
    return "ko";
  }

  // URL 파라미터에서 lang 확인
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam && ["ko", "en", "ja", "zh"].includes(langParam)) {
    return langParam;
  }

  return null;
}

// 언어 버튼 업데이트
function updateLanguageButton(language) {
  const languageButton = document.getElementById("language-button");
  if (!languageButton) {
    return;
  }

  const languageInfo = {
    ko: { name: "한국어", flag: "🇰🇷" },
    en: { name: "English", flag: "🇺🇸" },
    ja: { name: "日본語", flag: "🇯🇵" },
    zh: { name: "중문", flag: "🇨🇳" },
  };

  const info = languageInfo[language] || languageInfo.ko;

  // 버튼 내용 업데이트 (HTML 구조 유지)
  languageButton.innerHTML = `
    <i class="fas fa-globe lg:mr-1"></i>
    <span class="inline lg:ml-1">${info.flag}</span>
  `;
}

// 현재 페이지 메뉴 이름 업데이트
function updateCurrentPageMenuName(language) {
  try {
    const currentPath = window.location.pathname;
    let menuSelector = null;

    // 페이지별 메뉴 선택자 결정
    if (currentPath.includes("ai-vocabulary.html")) {
      menuSelector = 'a[href*="ai-vocabulary.html"]';
    } else if (currentPath.includes("vocabulary.html")) {
      menuSelector =
        'a[href*="vocabulary.html"]:not([href*="ai-vocabulary.html"])';
    } else if (currentPath.includes("learning.html")) {
      menuSelector = 'a[href*="learning.html"]';
    } else if (currentPath.includes("quiz.html")) {
      menuSelector = 'a[href*="quiz.html"]';
    } else if (currentPath.includes("progress.html")) {
      menuSelector = 'a[href*="progress.html"]';
    } else if (currentPath.includes("games.html")) {
      menuSelector = 'a[href*="games.html"]';
    }

    if (menuSelector) {
      const menuItems = document.querySelectorAll(menuSelector);

      menuItems.forEach((item, index) => {
        const i18nKey = item.getAttribute("data-i18n");
        if (i18nKey && typeof window.getI18nText === "function") {
          const translation = window.getI18nText(i18nKey, language);
          if (translation && translation !== i18nKey) {
            const previousText = item.textContent.trim();
            item.textContent = translation;
          }
        }
      });
    }
  } catch (error) {
    console.error("❌ 메뉴 이름 업데이트 실패:", error);
  }
}

// 언어 모달 표시
function showLanguageModal(currentLanguage) {
  if (typeof window.showLanguageSettingsModal === "function") {
    window.showLanguageSettingsModal();
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    // Firebase auth를 직접 사용하여 로그아웃
    if (typeof window.auth !== "undefined" && window.auth) {
      await window.auth.signOut();

      // 페이지 새로고침으로 UI 초기화
      window.location.reload();
    } else if (typeof window.signOut === "function") {
      await window.signOut();
      window.location.reload();
    } else if (typeof window.logout === "function") {
      await window.logout();
      window.location.reload();
    } else {
      // localStorage 정리
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.reload();
    }
  } catch (error) {
    // 오류가 발생해도 페이지를 새로고침하여 UI 초기화
    window.location.reload();
  }
}

// 인증 상태 확인
function checkAuthStatus() {
  // Firebase auth 객체 확인
  if (typeof window.auth === "undefined" || !window.auth) {
    // Firebase 초기화를 기다리기 위해 재시도
    setTimeout(() => {
      if (typeof window.auth !== "undefined" && window.auth) {
        checkAuthStatus();
      }
    }, 500);
    return;
  }

  // 현재 사용자 확인
  const currentUser = window.auth.currentUser;

  // 즉시 UI 업데이트
  updateNavbarForAuthState(currentUser);

  // 인증 상태 변화 감지 설정 (중복 방지)
  if (!window.authStateListenerSet) {
    window.auth.onAuthStateChanged((user) => {
      updateNavbarForAuthState(user);
    });
    window.authStateListenerSet = true;
  }

  // checkAuthenticationStatus 함수가 있으면 호출
  if (typeof window.checkAuthenticationStatus === "function") {
    window.checkAuthenticationStatus();
  }
}

// 인증 상태에 따른 네비게이션바 업데이트
function updateNavbarForAuthState(user) {
  // 데스크톱 요소들
  const desktopLoginSection = document.getElementById("desktop-login-section");
  const desktopUserSection = document.getElementById("desktop-user-section");
  const profileImage = document.getElementById("profile-image");
  const userName = document.getElementById("user-name");

  // 모바일 요소들
  const mobileLoginButtons = document.getElementById("mobile-login-buttons");
  const mobileUserSection = document.getElementById("mobile-user-section");
  const mobileProfileImage = document.getElementById("mobile-profile-image");
  const mobileUserName = document.getElementById("mobile-user-name");

  if (user) {
    // 로그인 상태
    // 데스크톱 - 로그인 버튼 숨기고 유저 프로필 보이기
    if (desktopLoginSection) {
      desktopLoginSection.classList.add("hidden");
      desktopLoginSection.classList.remove("flex", "lg:flex");
    }
    if (desktopUserSection) {
      desktopUserSection.classList.remove("hidden");
      desktopUserSection.classList.add("flex", "lg:flex");
    }

    // 모바일 - 로그인 버튼 숨기고 유저 섹션 보이기
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.add("hidden");
      mobileLoginButtons.classList.remove("flex");
    }
    if (mobileUserSection) {
      mobileUserSection.classList.remove("hidden");
      mobileUserSection.classList.add("flex");
    }

    // 사용자 정보 업데이트
    const displayName =
      user.displayName || user.email?.split("@")[0] || "사용자";
    // Google 인증의 경우 photoURL 우선 사용, 없으면 기본 이미지
    const photoURL =
      user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";

    if (userName) {
      userName.textContent = displayName;
    }
    if (mobileUserName) {
      mobileUserName.textContent = displayName;
    }

    // 프로필 이미지 설정 (데스크톱)
    if (profileImage) {
      // 이미지 로드 전에 기본 이미지로 설정
      profileImage.src = "https://www.w3schools.com/howto/img_avatar.png";
      profileImage.alt = `${displayName}의 프로필`;

      // Google 프로필 이미지가 있으면 로드 시도
      if (
        photoURL &&
        photoURL !== "https://www.w3schools.com/howto/img_avatar.png"
      ) {
        const img = new Image();
        img.onload = function () {
          profileImage.src = photoURL;
        };
        img.onerror = function () {
          // 기본 이미지는 이미 설정되어 있음
        };
        img.src = photoURL;
      }
    }

    // 프로필 이미지 설정 (모바일)
    if (mobileProfileImage) {
      // 이미지 로드 전에 기본 이미지로 설정
      mobileProfileImage.src = "https://www.w3schools.com/howto/img_avatar.png";
      mobileProfileImage.alt = `${displayName}의 프로필`;

      // Google 프로필 이미지가 있으면 로드 시도
      if (
        photoURL &&
        photoURL !== "https://www.w3schools.com/howto/img_avatar.png"
      ) {
        const img = new Image();
        img.onload = function () {
          mobileProfileImage.src = photoURL;
        };
        img.onerror = function () {
          // 기본 이미지는 이미 설정되어 있음
        };
        img.src = photoURL;
      }
    }
  } else {
    // 로그아웃 상태
    // 데스크톱 - 유저 프로필 숨기고 로그인 버튼 보이기
    if (desktopUserSection) {
      desktopUserSection.classList.add("hidden");
      desktopUserSection.classList.remove("flex", "lg:flex");
    }
    if (desktopLoginSection) {
      desktopLoginSection.classList.remove("hidden");
      desktopLoginSection.classList.add("flex", "lg:flex");
    }

    // 모바일 - 유저 섹션 숨기고 로그인 버튼 보이기
    if (mobileUserSection) {
      mobileUserSection.classList.add("hidden");
      mobileUserSection.classList.remove("flex");
    }
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.remove("hidden");
      mobileLoginButtons.classList.add("flex");
    }
  }
}

// checkAuthenticationStatus 함수 정의 (전역으로 노출)
function checkAuthenticationStatus() {
  if (typeof window.auth !== "undefined" && window.auth) {
    const currentUser = window.auth.currentUser;
    updateNavbarForAuthState(currentUser);

    // 인증 상태 변화 감지 설정
    window.auth.onAuthStateChanged((user) => {
      updateNavbarForAuthState(user);
    });
  }
}

// 전역 함수로 노출
window.updateLanguageButton = updateLanguageButton;
window.updateCurrentPageMenuName = updateCurrentPageMenuName;
window.detectCurrentLanguage = detectCurrentLanguage;
window.initializeNavbar = initializeNavbar;
window.checkAuthenticationStatus = checkAuthenticationStatus;
window.updateNavbarForAuthState = updateNavbarForAuthState;

// DOMContentLoaded 이벤트에서 자동 네비게이션바 로드 및 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🧭 네비게이션바 자동 초기화 시작");

    // 네비게이션바 컨테이너 확인
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.log("❌ navbar-container를 찾을 수 없습니다");
      return;
    }

    // 이미 네비게이션바가 로드되어 있으면 초기화만 실행
    if (navbarContainer.innerHTML.trim() !== "") {
      console.log("🧭 기존 네비게이션바 발견, 초기화만 실행");
      const currentLanguage = detectCurrentLanguage();
      await initializeNavbar(currentLanguage);
      return;
    }

    // loadNavbar 함수가 전역에 있으면 사용
    if (typeof window.loadNavbar === "function") {
      console.log("🧭 전역 loadNavbar 함수 사용");
      await window.loadNavbar();
      const currentLanguage = detectCurrentLanguage();
      await initializeNavbar(currentLanguage);
    } else {
      // 직접 네비게이션바 로드
      console.log("🧭 직접 네비게이션바 로드");
      const currentLanguage = detectCurrentLanguage();

      // 현재 경로에 따라 네비게이션바 경로 결정
      let navbarPath;
      if (window.location.pathname.includes("/locales/")) {
        // locales 폴더 내부인 경우 (예: /locales/ko/quiz.html)
        navbarPath = "navbar.html";
      } else {
        // 루트 또는 다른 폴더인 경우
        navbarPath = `locales/${currentLanguage}/navbar.html`;
      }

      console.log(`🧭 네비게이션바 경로: ${navbarPath}`);

      try {
        const response = await fetch(navbarPath);
        if (response.ok) {
          const navbarHTML = await response.text();
          navbarContainer.innerHTML = navbarHTML;
          console.log("✅ 네비게이션바 HTML 로드 완료");
          await initializeNavbar(currentLanguage);
        } else {
          console.error("❌ 네비게이션바 로드 실패:", response.status);
        }
      } catch (error) {
        console.error("❌ 네비게이션바 로드 오류:", error);
      }
    }
  } catch (error) {
    console.error("❌ 네비게이션바 자동 초기화 오류:", error);
  }
});
