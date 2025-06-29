// 중복 로드 방지를 위한 플래그
let navbarLoaded = false;

// loadNavbar 함수 - 메인 함수
async function loadNavbar() {
  // 중복 로드 방지
  if (navbarLoaded) {
    console.log("네비게이션 바가 이미 로드되어 있습니다.");
    return;
  }

  const navbarContainer = document.getElementById("navbar-container");
  if (!navbarContainer) {
    console.error("navbar-container 요소를 찾을 수 없습니다.");
    return;
  }

  // 현재 URL에서 언어 정보 추출
  const currentPath = window.location.pathname;
  let currentLanguage = "ko"; // 기본값
  let navbarPath = "";

  console.log("현재 경로:", currentPath);

  // 현재 언어 감지 (배포 환경 대응)
  if (currentPath.includes("/locales/")) {
    // 개발 환경: /locales/ko/index.html 형태
    const pathParts = currentPath.split("/");
    const localesIndex = pathParts.indexOf("locales");
    if (localesIndex !== -1 && localesIndex + 1 < pathParts.length) {
      currentLanguage = pathParts[localesIndex + 1];
    }
    // 언어별 navbar 경로 설정
    navbarPath = `navbar.html`;
    console.log(
      "개발환경 언어별 navbar 사용:",
      navbarPath,
      "언어:",
      currentLanguage
    );
  } else if (currentPath.match(/^\/(ko|en|ja|zh)\//)) {
    // 배포 환경: /ko/index.html 형태
    const pathParts = currentPath.split("/");
    currentLanguage = pathParts[1]; // 첫 번째 경로 부분이 언어 코드
    navbarPath = `/components/navbar.html`;
    console.log(
      "배포환경 언어별 navbar 사용:",
      navbarPath,
      "언어:",
      currentLanguage
    );
  } else {
    // 루트 경로에서는 기본 navbar 사용 (절대 경로로 수정)
    navbarPath = "/components/navbar.html";
    console.log("기본 navbar 사용:", navbarPath);
  }

  try {
    // 네비게이션 바 로드
    const response = await fetch(navbarPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();

    navbarContainer.innerHTML = data;
    console.log("네비게이션 바 로드 성공");

    // 로드 완료 플래그 설정
    navbarLoaded = true;

    // 네비게이션 바 로드 후 초기화
    initializeNavbar(currentLanguage);
  } catch (error) {
    console.error("네비게이션 바 로드 실패:", error);
  }
}

function initializeNavbar(currentLanguage) {
  console.log("네비게이션 바 초기화 시작, 언어:", currentLanguage);

  // 햄버거 메뉴 이벤트 설정
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    console.log("햄버거 메뉴 이벤트 설정 완료");
  }

  // 언어 변경 버튼 이벤트 설정
  const languageButton = document.getElementById("language-button");
  if (languageButton) {
    languageButton.addEventListener("click", () => {
      showLanguageModal(currentLanguage);
    });
    updateLanguageButton(currentLanguage);
    console.log("언어 변경 버튼 이벤트 설정 완료");
  }

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
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
    console.log("로그아웃 버튼 이벤트 설정 완료");
  }

  console.log("네비게이션 바 초기화 완료");

  // 현재 페이지에 맞는 메뉴 이름 업데이트
  updateCurrentPageMenuName(currentLanguage);

  // Firebase 인증 상태 확인
  checkAuthStatus();
}

function showLanguageModal(currentLanguage) {
  console.log("언어 모달 표시, 현재 언어:", currentLanguage);

  const languages = [
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ];

  // 모달 HTML 생성
  const modalHTML = `
    <div id="language-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-80 max-w-90vw">
        <h3 class="text-lg font-semibold mb-4 text-center">언어 선택 / Language</h3>
        <div class="space-y-2">
          ${languages
            .map(
              (lang) => `
            <button 
              onclick="changeLanguage('${lang.code}')"
              class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentLanguage === lang.code
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "border border-gray-200"
              }"
            >
              <div class="flex items-center">
                <span class="text-2xl mr-3">${lang.flag}</span>
                <span class="font-medium">${lang.name}</span>
              </div>
              ${
                currentLanguage === lang.code
                  ? '<span class="text-blue-500">✓</span>'
                  : ""
              }
            </button>
          `
            )
            .join("")}
        </div>
        <button 
          onclick="closeLanguageModal()"
          class="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          취소 / Cancel
        </button>
      </div>
    </div>
  `;

  // 모달을 body에 추가
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function changeLanguage(newLanguage) {
  console.log("언어 변경:", newLanguage);

  // localStorage에 언어 설정 저장
  localStorage.setItem("userLanguage", newLanguage);

  // 현재 페이지 정보 추출
  const currentPath = window.location.pathname;
  let targetPath = "";

  // 개발 환경 감지
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5500";

  if (isDevelopment) {
    // 개발 환경: /locales/{lang}/ 형태로 변경
    if (currentPath.includes("/locales/")) {
      // 이미 locales 경로에 있는 경우
      const pathParts = currentPath.split("/");
      const localesIndex = pathParts.indexOf("locales");
      if (localesIndex !== -1) {
        pathParts[localesIndex + 1] = newLanguage; // 언어 코드 변경
        targetPath = pathParts.join("/");
      }
    } else {
      // 루트 경로에서 locales로 이동
      const fileName = currentPath.split("/").pop() || "index.html";
      targetPath = `/locales/${newLanguage}/${fileName}`;
    }
  } else {
    // 배포 환경: /{lang}/ 형태로 변경
    if (currentPath.match(/^\/(ko|en|ja|zh)\//)) {
      // 이미 언어 경로에 있는 경우
      const pathParts = currentPath.split("/");
      pathParts[1] = newLanguage; // 언어 코드 변경
      targetPath = pathParts.join("/");
    } else {
      // 루트 경로에서 언어별 경로로 이동
      const fileName = currentPath.split("/").pop() || "index.html";
      targetPath = `/${newLanguage}/${fileName}`;
    }
  }

  console.log("언어 변경 대상 경로:", targetPath);

  // 모달 닫기
  closeLanguageModal();

  // 페이지 이동
  if (targetPath) {
    window.location.href = targetPath;
  } else {
    console.error("대상 경로를 생성할 수 없습니다.");
  }
}

function closeLanguageModal() {
  const modal = document.getElementById("language-modal");
  if (modal) {
    modal.remove();
  }
}

function updateLanguageButton(currentLanguage) {
  const languageButton = document.getElementById("language-button");
  if (languageButton) {
    const languageMap = {
      ko: "🇰🇷",
      en: "🇺🇸",
      ja: "🇯🇵",
      zh: "🇨🇳",
    };
    const flagEmoji = languageMap[currentLanguage] || "🇰🇷";

    // 버튼 내부의 span 요소 찾기
    const spanElement = languageButton.querySelector("span");
    if (spanElement) {
      spanElement.textContent = flagEmoji;
    }
    console.log("언어 버튼 업데이트:", flagEmoji);
  }
}

let authCheckAttempts = 0;
const MAX_AUTH_CHECK_ATTEMPTS = 5;

function checkAuthStatus() {
  console.log("Firebase 인증 상태 확인 시작");

  // Firebase 모듈 방식 확인
  if (
    typeof window.auth !== "undefined" &&
    typeof window.onAuthStateChanged !== "undefined"
  ) {
    console.log("Firebase 인증 사용 가능 (모듈 방식)");
    window.onAuthStateChanged(window.auth, (user) => {
      if (user) {
        console.log("Firebase 인증 상태 변경: 로그인됨");
        console.log("로그인된 사용자:", user.email, user.photoURL);
        updateUserProfile(user);
        updateUIBasedOnAuth(true);
      } else {
        console.log("Firebase 인증 상태 변경: 로그아웃됨");
        updateUIBasedOnAuth(false);
      }
    });
    return; // 성공적으로 설정했으므로 return
  }

  if (typeof window.firebaseInit !== "undefined" && window.firebaseInit.auth) {
    // 기존 방식 확인
    console.log("Firebase 인증 사용 가능 (기존 방식)");
    window.firebaseInit.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Firebase 인증 상태 변경: 로그인됨 (기존 방식)");
        updateUserProfile(user);
        updateUIBasedOnAuth(true);
      } else {
        console.log("Firebase 인증 상태 변경: 로그아웃됨 (기존 방식)");
        updateUIBasedOnAuth(false);
      }
    });
    return; // 성공적으로 설정했으므로 return
  }

  // Firebase가 아직 로드되지 않은 경우
  authCheckAttempts++;
  if (authCheckAttempts < MAX_AUTH_CHECK_ATTEMPTS) {
    console.log(
      `Firebase 인증을 사용할 수 없습니다. 재시도 ${authCheckAttempts}/${MAX_AUTH_CHECK_ATTEMPTS}`
    );
    setTimeout(() => {
      checkAuthStatus();
    }, 2000); // 2초로 간격 증가
  } else {
    console.log("Firebase 인증 연결 실패. 로그인되지 않은 상태로 진행합니다.");
    updateUIBasedOnAuth(false);
  }
}

function updateUserProfile(user) {
  console.log("👤 사용자 프로필 업데이트:", user);

  // 프로필 이미지 업데이트
  const profileImage = document.getElementById("profile-image");
  if (profileImage && user.photoURL) {
    profileImage.src = user.photoURL;
    console.log("✅ 프로필 이미지 설정:", user.photoURL);
  }

  // 사용자 이름 업데이트
  const userName = document.getElementById("user-name");
  if (userName) {
    userName.textContent = user.displayName || user.email;
    console.log("✅ 사용자 이름 설정:", user.displayName || user.email);
  }
}

function updateUIBasedOnAuth(isLoggedIn) {
  console.log("🔄 UI 업데이트: " + (isLoggedIn ? "로그인됨" : "로그아웃됨"));

  // UI 요소들 가져오기
  const desktopLoginSection = document.getElementById("desktop-login-section");
  const desktopUserSection = document.getElementById("desktop-user-section");
  const mobileLoginButtons = document.getElementById("mobile-login-buttons");

  console.log("🔍 UI 요소 확인:", {
    desktopLoginSection: !!desktopLoginSection,
    desktopUserSection: !!desktopUserSection,
    mobileLoginButtons: !!mobileLoginButtons,
  });

  if (isLoggedIn) {
    // 로그인된 상태: 로그인 버튼 숨기고 유저 프로필 표시
    if (desktopLoginSection) {
      desktopLoginSection.className = "hidden space-x-2";
      console.log("✅ 데스크톱 로그인 섹션 숨김");
    }
    if (desktopUserSection) {
      desktopUserSection.className = "flex items-center lg:flex";
      console.log("✅ 데스크톱 유저 섹션 표시");
    }
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.add("hidden");
      console.log("✅ 모바일 로그인 버튼 숨김");
    }
  } else {
    // 로그인되지 않은 상태: 유저 프로필 숨기고 로그인 버튼 표시
    if (desktopLoginSection) {
      desktopLoginSection.className = "flex lg:flex space-x-2";
      console.log("✅ 데스크톱 로그인 섹션 표시");
    }
    if (desktopUserSection) {
      desktopUserSection.className = "hidden items-center lg:hidden";
      console.log("✅ 데스크톱 유저 섹션 숨김");
    }
    if (mobileLoginButtons) {
      mobileLoginButtons.classList.remove("hidden");
      console.log("✅ 모바일 로그인 버튼 표시");
    }
  }

  console.log("🎯 UI 업데이트 완료, 로그인 상태:", isLoggedIn);
}

async function handleLogout() {
  console.log("🚪 로그아웃 시작");

  try {
    // Firebase 로그아웃 처리
    if (
      typeof window.auth !== "undefined" &&
      typeof window.signOut !== "undefined"
    ) {
      await window.signOut(window.auth);
      console.log("✅ Firebase 로그아웃 완료 (모듈 방식)");
    } else if (
      typeof window.firebaseInit !== "undefined" &&
      window.firebaseInit.auth
    ) {
      await window.firebaseInit.auth.signOut();
      console.log("✅ Firebase 로그아웃 완료 (기존 방식)");
    }

    // UI 업데이트
    updateUIBasedOnAuth(false);

    // 프로필 드롭다운 닫기
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) {
      profileDropdown.classList.add("hidden");
    }

    console.log("✅ 로그아웃 완료");
  } catch (error) {
    console.error("❌ 로그아웃 오류:", error);
  }
}

// 전역에서 접근 가능하도록 함수들을 window 객체에 추가
window.changeLanguage = changeLanguage;
window.closeLanguageModal = closeLanguageModal;
window.loadNavbar = loadNavbar;

// 페이지 로드 시 자동으로 네비게이션 바 로드
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📋 navbar.js DOMContentLoaded 이벤트 시작");
  await loadNavbar();
});

// 현재 페이지에 맞는 메뉴 이름 업데이트 함수 추가
function updateCurrentPageMenuName(currentLanguage) {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  console.log("현재 페이지 메뉴 이름 업데이트:", currentPage);

  // 페이지별 메뉴 이름 매핑
  const pageMenuMapping = {
    "my-word-list.html": {
      ko: "나만의 단어장",
      en: "My Vocabulary",
      ja: "私の単語帳",
      zh: "我的单词本",
    },
    "vocabulary.html": {
      ko: "단어장",
      en: "Vocabulary",
      ja: "単語帳",
      zh: "单词本",
    },
    "ai-vocabulary.html": {
      ko: "AI 단어장",
      en: "AI Vocabulary",
      ja: "AI単語帳",
      zh: "AI单词本",
    },
  };

  // 현재 페이지에 해당하는 메뉴 이름이 있으면 업데이트
  if (pageMenuMapping[currentPage]) {
    const menuName =
      pageMenuMapping[currentPage][currentLanguage] ||
      pageMenuMapping[currentPage]["ko"];

    // 데스크톱 메뉴 업데이트
    const desktopMenuItems = document.querySelectorAll(
      'nav a[href*="vocabulary"], nav a[href*="my-word-list"], nav a[href*="ai-vocabulary"]'
    );
    desktopMenuItems.forEach((item) => {
      if (item.href.includes(currentPage.replace(".html", ""))) {
        const textElement = item.querySelector("span") || item;
        if (textElement) {
          textElement.textContent = menuName;
          console.log(`데스크톱 메뉴 업데이트: ${currentPage} -> ${menuName}`);
        }
      }
    });

    // 모바일 메뉴 업데이트
    const mobileMenuItems = document.querySelectorAll(
      '#mobile-menu a[href*="vocabulary"], #mobile-menu a[href*="my-word-list"], #mobile-menu a[href*="ai-vocabulary"]'
    );
    mobileMenuItems.forEach((item) => {
      if (item.href.includes(currentPage.replace(".html", ""))) {
        const textElement = item.querySelector("span") || item;
        if (textElement) {
          textElement.textContent = menuName;
          console.log(`모바일 메뉴 업데이트: ${currentPage} -> ${menuName}`);
        }
      }
    });
  }
}
