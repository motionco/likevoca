// DOM이 로드된 후 실행
document.addEventListener("DOMContentLoaded", function () {
  // 현재 URL에서 언어 정보 추출
  const currentPath = window.location.pathname;
  let currentLanguage = "ko"; // 기본값
  let navbarPath = "";

  console.log("현재 경로:", currentPath);

  // 현재 언어 감지
  if (currentPath.includes("/locales/")) {
    const pathParts = currentPath.split("/");
    const localesIndex = pathParts.indexOf("locales");
    if (localesIndex !== -1 && localesIndex + 1 < pathParts.length) {
      currentLanguage = pathParts[localesIndex + 1];
    }
    // 언어별 navbar 경로 설정
    navbarPath = `navbar.html`;
    console.log("언어별 navbar 사용:", navbarPath, "언어:", currentLanguage);
  } else {
    // 루트 경로에서는 기본 navbar 사용
    navbarPath = "components/navbar.html";
    console.log("기본 navbar 사용:", navbarPath);
  }

  // 네비게이션 바 로드
  fetch(navbarPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      const navbarContainer = document.getElementById("navbar-container");
      if (navbarContainer) {
        navbarContainer.innerHTML = data;
        console.log("네비게이션 바 로드 성공");

        // 네비게이션 바 로드 후 초기화
        initializeNavbar(currentLanguage);
      } else {
        console.error("navbar-container 요소를 찾을 수 없습니다.");
      }
    })
    .catch((error) => {
      console.error("네비게이션 바 로드 실패:", error);
    });
});

function initializeNavbar(currentLanguage) {
  console.log("네비게이션 바 초기화 시작, 언어:", currentLanguage);

  // 햄버거 메뉴 토글
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
    console.log("햄버거 메뉴 이벤트 설정 완료");
  }

  // 언어 변경 버튼
  const languageButton = document.getElementById("language-button");
  if (languageButton) {
    languageButton.addEventListener("click", function () {
      showLanguageModal(currentLanguage);
    });
    console.log("언어 변경 버튼 이벤트 설정 완료");
  }

  // 프로필 드롭다운
  const avatarContainer = document.getElementById("avatar-container");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (avatarContainer && profileDropdown) {
    avatarContainer.addEventListener("click", function () {
      profileDropdown.classList.toggle("hidden");
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener("click", function (event) {
      if (!avatarContainer.contains(event.target)) {
        profileDropdown.classList.add("hidden");
      }
    });
    console.log("프로필 드롭다운 이벤트 설정 완료");
  }

  // 로그아웃 버튼
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      // Firebase 로그아웃 로직 (추후 구현)
      localStorage.removeItem("userLanguage");
      window.location.href = "../../index.html";
    });
    console.log("로그아웃 버튼 이벤트 설정 완료");
  }

  // 로그인 상태 확인 및 UI 업데이트
  checkAuthStatus();
  console.log("네비게이션 바 초기화 완료");
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

  if (currentPath.includes("/locales/")) {
    // 현재 locales 내의 페이지인 경우
    const pathParts = currentPath.split("/");
    const localesIndex = pathParts.indexOf("locales");

    if (localesIndex !== -1 && localesIndex + 2 < pathParts.length) {
      // 현재 페이지 파일명 추출
      const currentPage = pathParts[localesIndex + 2];
      targetPath = `/locales/${newLanguage}/${currentPage}`;
    } else {
      // index.html로 이동
      targetPath = `/locales/${newLanguage}/index.html`;
    }
  } else {
    // 루트 페이지에서는 해당 언어의 index.html로 이동
    targetPath = `/locales/${newLanguage}/index.html`;
  }

  console.log("이동할 경로:", targetPath);

  // 페이지 이동
  window.location.href = targetPath;
}

function closeLanguageModal() {
  const modal = document.getElementById("language-modal");
  if (modal) {
    modal.remove();
  }
}

function checkAuthStatus() {
  // 로그인 상태 확인 (추후 Firebase 연동)
  const isLoggedIn = false; // 임시값

  const desktopLoginSection = document.getElementById("desktop-login-section");
  const desktopUserSection = document.getElementById("desktop-user-section");
  const mobileLoginButtons = document.getElementById("mobile-login-buttons");

  if (isLoggedIn) {
    // 로그인된 상태
    if (desktopLoginSection) desktopLoginSection.classList.add("hidden");
    if (desktopUserSection) desktopUserSection.classList.remove("hidden");
    if (mobileLoginButtons) mobileLoginButtons.classList.add("hidden");
  } else {
    // 로그인되지 않은 상태
    if (desktopLoginSection) desktopLoginSection.classList.remove("hidden");
    if (desktopUserSection) desktopUserSection.classList.add("hidden");
    if (mobileLoginButtons) mobileLoginButtons.classList.remove("hidden");
  }

  console.log("인증 상태 확인 완료, 로그인 상태:", isLoggedIn);
}

// 전역에서 접근 가능하도록 함수들을 window 객체에 추가
window.changeLanguage = changeLanguage;
window.closeLanguageModal = closeLanguageModal;
