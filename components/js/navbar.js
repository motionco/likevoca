// 네비게이션바 초기화 및 관리

// 네비게이션바 초기화 함수
async function initializeNavbar(currentLanguage) {
  try {
    console.log("네비게이션바 초기화 시작:", currentLanguage);

    // 언어 버튼 업데이트
    updateLanguageButton(currentLanguage);

    // 햄버거 메뉴 이벤트 설정
    setupMobileMenu();

    // 프로필 드롭다운 이벤트 설정
    setupProfileDropdown();

    // 언어 버튼 이벤트 설정
    setupLanguageButton();

    // 로그아웃 버튼 이벤트 설정
    setupLogoutButton();

    // 인증 상태 확인
    await checkAuthenticationStatus();

    console.log("✅ 네비게이션바 초기화 완료");
  } catch (error) {
    console.error("❌ 네비게이션바 초기화 실패:", error);
  }
}

// 햄버거 메뉴 설정 (개선된 버전)
function setupMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  console.log("🍔 햄버거 메뉴 요소 확인:", {
    menuToggle: !!menuToggle,
    mobileMenu: !!mobileMenu,
  });

  if (menuToggle && mobileMenu) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

    newMenuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🍔 햄버거 메뉴 클릭됨");

      // 프로필 드롭다운이 열려있다면 닫기
      const profileDropdown = document.getElementById("profile-dropdown");
      if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
        console.log("📋 프로필 드롭다운 닫힘 (햄버거 메뉴 클릭으로 인해)");
      }

      const currentMobileMenu = document.getElementById("mobile-menu");
      if (currentMobileMenu) {
        const isHidden = currentMobileMenu.classList.contains("hidden");
        currentMobileMenu.classList.toggle("hidden");
        console.log("📱 모바일 메뉴 상태:", isHidden ? "표시됨" : "숨겨짐");
      }
    });

    // 외부 클릭 시 메뉴 닫기
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
        console.log("🍔 햄버거 메뉴 닫힘 (외부 클릭)");
      }
    });

    console.log("✅ 햄버거 메뉴 이벤트 설정 완료");
  } else {
    console.warn("⚠️ 햄버거 메뉴 요소를 찾을 수 없습니다");
  }
}

// 프로필 드롭다운 설정 (새로 추가)
function setupProfileDropdown() {
  const avatarContainer = document.getElementById("avatar-container");
  const profileDropdown = document.getElementById("profile-dropdown");

  console.log("👤 프로필 드롭다운 요소 확인:", {
    avatarContainer: !!avatarContainer,
    profileDropdown: !!profileDropdown,
  });

  if (avatarContainer && profileDropdown) {
    // 기존 이벤트 리스너 제거
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

      // 드롭다운 토글
      const currentDropdown = document.getElementById("profile-dropdown");
      if (currentDropdown) {
        const isHidden = currentDropdown.classList.contains("hidden");
        currentDropdown.classList.toggle("hidden");
        console.log("📋 프로필 드롭다운 상태:", isHidden ? "표시됨" : "숨겨짐");
      }
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener("click", (event) => {
      const userProfile = document.getElementById("user-profile");
      const currentDropdown = document.getElementById("profile-dropdown");

      if (
        userProfile &&
        currentDropdown &&
        !userProfile.contains(event.target) &&
        !currentDropdown.classList.contains("hidden")
      ) {
        currentDropdown.classList.add("hidden");
        console.log("📋 프로필 드롭다운 닫힘 (외부 클릭)");
      }
    });

    console.log("✅ 프로필 드롭다운 이벤트 설정 완료");
  } else {
    console.warn("⚠️ 프로필 드롭다운 요소를 찾을 수 없습니다");
  }
}

// 언어 버튼 설정
function setupLanguageButton() {
  const languageButton = document.getElementById("language-button");

  if (languageButton) {
    // 기존 이벤트 리스너 제거
    const newLanguageButton = languageButton.cloneNode(true);
    languageButton.parentNode.replaceChild(newLanguageButton, languageButton);

    newLanguageButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🌐 언어 버튼 클릭됨");

      // 다른 메뉴들이 열려있다면 닫기
      const profileDropdown = document.getElementById("profile-dropdown");
      if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
        console.log("📋 프로필 드롭다운 닫힘 (언어 버튼 클릭으로 인해)");
      }

      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        console.log("🍔 햄버거 메뉴 닫힘 (언어 버튼 클릭으로 인해)");
      }

      showLanguageModal();
    });

    console.log("✅ 언어 버튼 이벤트 설정 완료");
  } else {
    console.warn("⚠️ 언어 버튼 요소를 찾을 수 없습니다");
  }
}

// 로그아웃 버튼 설정
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-button");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
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
    ja: { name: "日本語", flag: "🇯🇵" },
    zh: { name: "中文", flag: "🇨🇳" },
  };

  const info = languageInfo[language] || languageInfo.ko;

  languageButton.innerHTML = `
    <i class="fas fa-globe lg:mr-1"></i>
    <span class="inline lg:ml-1">${info.flag}</span>
  `;
}

// 언어 모달 표시
function showLanguageModal() {
  if (typeof window.showLanguageSettingsModal === "function") {
    window.showLanguageSettingsModal();
  } else {
    console.warn("언어 설정 모달 함수를 찾을 수 없습니다.");
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    // Firebase auth를 직접 사용하여 로그아웃
    if (typeof window.auth !== "undefined" && window.auth) {
      await window.auth.signOut();
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
    console.error("로그아웃 중 오류:", error);
    // 오류가 발생해도 페이지를 새로고침하여 UI 초기화
    window.location.reload();
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

  if (user) {
    // 로그인 상태
    // 데스크톱 - 로그인 버튼 숨기고 프로필 보이기
    if (desktopLoginSection) {
      desktopLoginSection.classList.add("hidden");
      desktopLoginSection.classList.remove("flex", "lg:flex");
    }
    if (desktopUserSection) {
      desktopUserSection.classList.remove("hidden");
      desktopUserSection.classList.add("flex", "lg:flex", "items-center");
    }

    // 모바일 - 로그인 버튼 숨기기
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.add("hidden");
      mobileLoginButtons.classList.remove("flex", "space-x-3");
    }

    // 사용자 정보 업데이트
    const displayName =
      user.displayName || user.email?.split("@")[0] || "사용자";
    const photoURL =
      user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";

    if (userName) {
      userName.textContent = displayName;
    }

    // 프로필 이미지 설정
    if (profileImage) {
      profileImage.src = "https://www.w3schools.com/howto/img_avatar.png";
      profileImage.alt = `${displayName}의 프로필`;

      if (
        photoURL &&
        photoURL !== "https://www.w3schools.com/howto/img_avatar.png"
      ) {
        const img = new Image();
        img.onload = function () {
          profileImage.src = photoURL;
        };
        img.onerror = function () {
          // 기본 이미지로 이미 설정되어 있음
        };
        img.src = photoURL;
      }
    }
  } else {
    // 로그아웃 상태
    // 데스크톱 - 사용자 프로필 숨기고 로그인 버튼 보이기
    if (desktopUserSection) {
      desktopUserSection.classList.add("hidden");
      desktopUserSection.classList.remove("flex", "lg:flex", "items-center");
    }
    if (desktopLoginSection) {
      desktopLoginSection.classList.remove("hidden");
      desktopLoginSection.classList.add("flex", "lg:flex", "space-x-2");
    }

    // 모바일 - 로그인 버튼 보이기
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.remove("hidden");
      mobileLoginButtons.classList.add("flex", "space-x-3");
    }
  }
}

// 인증 상태 확인
async function checkAuthenticationStatus() {
  try {
    if (typeof window.auth !== "undefined" && window.auth) {
      // Firebase auth 사용
      window.auth.onAuthStateChanged((user) => {
        updateNavbarForAuthState(user);
      });
    } else {
      // 대체 방법 - localStorage 확인
      const userData = localStorage.getItem("userData");
      const authToken = localStorage.getItem("authToken");

      if (userData && authToken) {
        try {
          const user = JSON.parse(userData);
          updateNavbarForAuthState(user);
        } catch (error) {
          console.error("사용자 데이터 파싱 오류:", error);
          updateNavbarForAuthState(null);
        }
      } else {
        updateNavbarForAuthState(null);
      }
    }
  } catch (error) {
    console.error("인증 상태 확인 중 오류:", error);
    updateNavbarForAuthState(null);
  }
}

// 기본 네비게이션바 이벤트 설정 (다른 페이지에서 사용)
function setupBasicNavbarEvents() {
  setupMobileMenu();
  setupProfileDropdown();
  setupLanguageButton();
  setupLogoutButton();
}

// 전역으로 노출
window.initializeNavbar = initializeNavbar;
window.setupBasicNavbarEvents = setupBasicNavbarEvents;
window.updateNavbarForAuthState = updateNavbarForAuthState;

console.log("navbar.js 로드 완료");
