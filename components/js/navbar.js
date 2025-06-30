async function initializeNavbar(currentLanguage) {
  console.log("네비게이션 바 초기화 시작, 전달받은 언어:", currentLanguage);

  // 실제 현재 언어 감지 (URL 우선)
  const actualCurrentLanguage = detectCurrentLanguage();
  console.log("실제 감지된 현재 언어:", actualCurrentLanguage);

  // 햄버거 메뉴 이벤트 설정
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      console.log(
        "햄버거 메뉴 토글:",
        mobileMenu.classList.contains("hidden") ? "숨김" : "표시"
      );
    });
    console.log("햄버거 메뉴 이벤트 설정 완료");
  } else {
    console.warn("햄버거 메뉴 요소를 찾을 수 없습니다:", {
      menuToggle,
      mobileMenu,
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
    console.log("언어 변경 버튼 이벤트 설정 완료");
  }

  // 언어 변경 이벤트 리스너 추가 (동적 업데이트)
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 네비게이션바: 언어 변경 감지", event.detail.language);
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
      console.log("프로필 드롭다운 토글");
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener("click", (event) => {
      const userProfile = document.getElementById("user-profile");
      if (userProfile && !userProfile.contains(event.target)) {
        profileDropdown.classList.add("hidden");
      }
    });
    console.log("프로필 드롭다운 이벤트 설정 완료");
  }

  // 로그아웃 버튼 이벤트 설정
  const logoutButton = document.getElementById("logout-button");
  const mobileLogoutButton = document.getElementById("mobile-logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
    console.log("로그아웃 버튼 이벤트 설정 완료");
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", handleLogout);
    console.log("모바일 로그아웃 버튼 이벤트 설정 완료");
  }

  console.log("네비게이션 바 초기화 완료");

  // 현재 페이지에 맞는 메뉴 이름 업데이트
  updateCurrentPageMenuName(actualCurrentLanguage);

  // 네비게이션바 초기화가 완전히 끝난 후 인증 상태 확인
  // 더 긴 지연시간으로 Firebase 초기화를 기다림
  setTimeout(() => {
    console.log("🔐 인증 상태 확인 시작");
    checkAuthStatus();
  }, 1000);

  // 추가 안전장치 - 2초 후 한번 더 확인
  setTimeout(() => {
    console.log("🔐 인증 상태 재확인");
    if (
      typeof window.auth !== "undefined" &&
      window.auth &&
      window.auth.currentUser
    ) {
      updateNavbarForAuthState(window.auth.currentUser);
    }
  }, 2000);
}

// 현재 언어 감지 함수 (utils/language-utils.js와 일치하도록 수정)
function detectCurrentLanguage() {
  console.log("🔍 현재 언어 감지 시작");

  // 1. URL에서 언어 감지 (최우선) - utils/language-utils.js와 동일한 로직 사용
  const urlLang = detectLanguageFromURL();
  console.log("📍 URL 언어:", urlLang);

  // 2. localStorage에서 언어 감지
  const storedLang =
    localStorage.getItem("userLanguage") ||
    localStorage.getItem("preferredLanguage");
  console.log("💾 저장된 언어:", storedLang);

  // URL에서 감지된 언어가 있으면 최우선으로 사용하고 localStorage와 동기화
  if (urlLang) {
    if (storedLang !== urlLang) {
      console.log("⚠️ URL 언어와 저장된 언어 불일치, 동기화 중...");
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
  const finalLang = "ko";
  console.log("✅ 최종 감지된 언어:", finalLang);
  return finalLang;
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
  console.log("🌐 언어 버튼 업데이트:", language);

  const languageButton = document.getElementById("language-button");
  if (!languageButton) {
    console.warn("언어 버튼을 찾을 수 없습니다.");
    return;
  }

  const languageInfo = {
    ko: { name: "한국어", flag: "🇰🇷" },
    en: { name: "English", flag: "🇺🇸" },
    ja: { name: "日本語", flag: "🇯🇵" },
    zh: { name: "中文", flag: "🇨🇳" },
  };

  const info = languageInfo[language] || languageInfo.ko;

  // 버튼 내용 업데이트 (HTML 구조 유지)
  languageButton.innerHTML = `
    <i class="fas fa-globe lg:mr-1"></i>
    <span class="inline lg:ml-1">${info.flag}</span>
  `;

  console.log("✅ 언어 버튼 업데이트 완료:", info.name, info.flag);
}

// 현재 페이지 메뉴 이름 업데이트
function updateCurrentPageMenuName(language) {
  console.log("📝 메뉴 이름 업데이트:", language);

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
      console.log(`📍 찾은 메뉴 항목: ${menuItems.length}개`);

      menuItems.forEach((item, index) => {
        const i18nKey = item.getAttribute("data-i18n");
        if (i18nKey && typeof window.getI18nText === "function") {
          const translation = window.getI18nText(i18nKey, language);
          if (translation && translation !== i18nKey) {
            const previousText = item.textContent.trim();
            item.textContent = translation;
            console.log(
              `🔄 메뉴 ${index} 업데이트: ${i18nKey} -> "${translation}" (이전: "${previousText}")`
            );
          }
        }
      });
    }

    console.log("✅ 메뉴 이름 업데이트 완료");
  } catch (error) {
    console.error("❌ 메뉴 이름 업데이트 실패:", error);
  }
}

// 언어 모달 표시
function showLanguageModal(currentLanguage) {
  console.log("🌐 언어 모달 표시:", currentLanguage);

  if (typeof window.showLanguageSettingsModal === "function") {
    window.showLanguageSettingsModal();
  } else {
    console.warn("showLanguageSettingsModal 함수를 찾을 수 없습니다.");
  }
}

// 로그아웃 처리
async function handleLogout() {
  console.log("🚪 로그아웃 처리 시작");

  try {
    // Firebase auth를 직접 사용하여 로그아웃
    if (typeof window.auth !== "undefined" && window.auth) {
      await window.auth.signOut();
      console.log("✅ Firebase 로그아웃 성공");

      // 페이지 새로고침으로 UI 초기화
      window.location.reload();
    } else if (typeof window.signOut === "function") {
      await window.signOut();
      window.location.reload();
    } else if (typeof window.logout === "function") {
      await window.logout();
      window.location.reload();
    } else {
      console.warn("로그아웃 함수를 찾을 수 없습니다.");
      // localStorage 정리
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.reload();
    }
  } catch (error) {
    console.error("❌ 로그아웃 실패:", error);
    // 오류가 발생해도 페이지를 새로고침하여 UI 초기화
    window.location.reload();
  }
}

// 인증 상태 확인
function checkAuthStatus() {
  console.log("🔐 인증 상태 확인");

  // Firebase auth 객체 확인
  if (typeof window.auth === "undefined" || !window.auth) {
    console.warn("Firebase auth 객체를 찾을 수 없습니다. 재시도 중...");

    // Firebase 초기화를 기다리기 위해 재시도
    setTimeout(() => {
      if (typeof window.auth !== "undefined" && window.auth) {
        console.log("✅ Firebase auth 객체 발견, 인증 상태 확인 재시도");
        checkAuthStatus();
      } else {
        console.error("❌ Firebase auth 초기화 실패");
      }
    }, 500);
    return;
  }

  // 현재 사용자 확인
  const currentUser = window.auth.currentUser;
  console.log("👤 현재 사용자:", currentUser ? currentUser.email : "없음");

  // 즉시 UI 업데이트
  updateNavbarForAuthState(currentUser);

  // 인증 상태 변화 감지 설정 (중복 방지)
  if (!window.authStateListenerSet) {
    window.auth.onAuthStateChanged((user) => {
      console.log("🔄 인증 상태 변화 감지:", user ? user.email : "로그아웃됨");
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
  console.log(
    "🔄 네비게이션바 인증 상태 업데이트:",
    user ? user.email : "로그아웃됨"
  );

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

  console.log("🔍 요소 확인:", {
    desktopLoginSection: !!desktopLoginSection,
    desktopUserSection: !!desktopUserSection,
    mobileLoginButtons: !!mobileLoginButtons,
    mobileUserSection: !!mobileUserSection,
    profileImage: !!profileImage,
    mobileProfileImage: !!mobileProfileImage,
  });

  if (user) {
    // 로그인 상태
    console.log("✅ 로그인 상태로 네비게이션바 업데이트");

    // 데스크톱 - 로그인 버튼 완전히 숨기고 유저 프로필 보이기
    if (desktopLoginSection) {
      desktopLoginSection.style.display = "none";
      desktopLoginSection.className = "hidden lg:flex space-x-2";
    }
    if (desktopUserSection) {
      desktopUserSection.style.display = "";
      desktopUserSection.className = "flex lg:flex items-center";
    }

    // 모바일 - 로그인 버튼 완전히 숨기고 유저 섹션 보이기
    if (mobileLoginButtons) {
      mobileLoginButtons.style.display = "none";
      mobileLoginButtons.className = "hidden flex space-x-3";
    }
    if (mobileUserSection) {
      mobileUserSection.style.display = "";
      mobileUserSection.className = "flex flex-col items-center space-y-2";
    }

    // 사용자 정보 업데이트
    const displayName = user.displayName || user.email || "사용자";
    const photoURL =
      user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";

    console.log("👤 사용자 정보 설정:", { displayName, photoURL });

    if (userName) {
      userName.textContent = displayName;
      console.log("✅ 데스크톱 사용자 이름 설정:", displayName);
    }
    if (mobileUserName) {
      mobileUserName.textContent = displayName;
      console.log("✅ 모바일 사용자 이름 설정:", displayName);
    }
    if (profileImage) {
      profileImage.src = photoURL;
      profileImage.alt = `${displayName}의 프로필`;

      // 이미지 로드 오류 처리
      profileImage.onerror = function () {
        console.warn("프로필 이미지 로드 실패, 기본 이미지로 변경:", photoURL);
        this.src = "https://www.w3schools.com/howto/img_avatar.png";
      };

      console.log("✅ 데스크톱 프로필 이미지 설정:", photoURL);
    }
    if (mobileProfileImage) {
      mobileProfileImage.src = photoURL;
      mobileProfileImage.alt = `${displayName}의 프로필`;

      // 이미지 로드 오류 처리
      mobileProfileImage.onerror = function () {
        console.warn(
          "모바일 프로필 이미지 로드 실패, 기본 이미지로 변경:",
          photoURL
        );
        this.src = "https://www.w3schools.com/howto/img_avatar.png";
      };

      console.log("✅ 모바일 프로필 이미지 설정:", photoURL);
    }

    console.log("👤 사용자 정보 업데이트 완료:", { displayName, photoURL });
  } else {
    // 로그아웃 상태
    console.log("🚪 로그아웃 상태로 네비게이션바 업데이트");

    // 데스크톱 - 유저 프로필 완전히 숨기고 로그인 버튼 보이기
    if (desktopUserSection) {
      desktopUserSection.style.display = "none";
      desktopUserSection.className = "hidden lg:flex items-center";
    }
    if (desktopLoginSection) {
      desktopLoginSection.style.display = "";
      desktopLoginSection.className = "flex lg:flex space-x-2";
    }

    // 모바일 - 유저 섹션 완전히 숨기고 로그인 버튼 보이기
    if (mobileUserSection) {
      mobileUserSection.style.display = "none";
      mobileUserSection.className = "hidden flex-col items-center space-y-2";
    }
    if (mobileLoginButtons) {
      mobileLoginButtons.style.display = "";
      mobileLoginButtons.className = "flex space-x-3";
    }
  }
}

// checkAuthenticationStatus 함수 정의 (전역으로 노출)
function checkAuthenticationStatus() {
  console.log("🔍 checkAuthenticationStatus 함수 호출됨");

  if (typeof window.auth !== "undefined" && window.auth) {
    const currentUser = window.auth.currentUser;
    console.log("👤 현재 사용자:", currentUser ? currentUser.email : "없음");
    updateNavbarForAuthState(currentUser);

    // 인증 상태 변화 감지 설정
    window.auth.onAuthStateChanged((user) => {
      console.log("🔄 인증 상태 변화 감지:", user ? user.email : "로그아웃됨");
      updateNavbarForAuthState(user);
    });
  } else {
    console.warn("Firebase auth 객체를 찾을 수 없습니다.");
  }
}

// 전역 함수로 노출
window.updateLanguageButton = updateLanguageButton;
window.updateCurrentPageMenuName = updateCurrentPageMenuName;
window.detectCurrentLanguage = detectCurrentLanguage;
window.initializeNavbar = initializeNavbar;
window.checkAuthenticationStatus = checkAuthenticationStatus;
window.updateNavbarForAuthState = updateNavbarForAuthState;
