import { auth } from "../../js/firebase/firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { deleteAccount } from "../../js/firebase/firebase-auth.js";
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
    // 현재 페이지 위치에 따라 경로 결정
    const currentPath = window.location.pathname;
    let navbarPath;

    if (currentPath.includes("/pages/")) {
      // pages 폴더 내의 페이지인 경우
      navbarPath = "../components/navbar.html";
    } else if (currentPath.includes("/locales/")) {
      // locales 폴더 내의 페이지인 경우
      navbarPath = "../../components/navbar.html";
    } else {
      // 루트 폴더의 페이지인 경우
      navbarPath = "components/navbar.html";
    }

    const response = await fetch(navbarPath);
    const html = await response.text();
    document.getElementById("navbar-container").innerHTML = html;

    initializeNavbar();

    // 언어 설정 적용
    await applyLanguage();

    // Firebase 초기화 완료 이벤트를 기다림
    window.addEventListener("firebase-initialized", () => {
      console.log("Firebase 초기화 완료, Auth 리스너 설정");
      initializeAuthStateListener();
    });

    // 이미 초기화되어 있을 수도 있으므로 바로 시도
    if (auth) {
      initializeAuthStateListener();
    }

    // 언어 설정 표시 업데이트
    updateLanguageDisplay();

    // 페이지 초기화 시 메타데이터 업데이트
    await updateMetadata("dictionary");
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
  const mobileLogoutButton = document.getElementById("mobile-logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", handleLogout);
  }

  const deleteAccountButton = document.getElementById("delete-account-button");
  const mobileDeleteAccountButton = document.getElementById(
    "mobile-delete-account-button"
  );

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", handleDeleteAccount);
  }

  if (mobileDeleteAccountButton) {
    mobileDeleteAccountButton.addEventListener("click", handleDeleteAccount);
  }

  // 언어 설정 버튼 이벤트 리스너 추가
  const languageButton = document.getElementById("language-button");
  const mobileLanguageButton = document.getElementById(
    "mobile-language-button"
  );

  if (languageButton) {
    languageButton.addEventListener("click", showLanguageSettingsModal);
  }

  if (mobileLanguageButton) {
    mobileLanguageButton.addEventListener("click", showLanguageSettingsModal);
  }

  // 언어 변경 이벤트 리스너
  document.addEventListener("languageChanged", async (event) => {
    const userLanguage = event.detail.language;

    // 언어 버튼 표시 업데이트
    await updateLanguageDisplay();

    // UI 언어만 변경하고 학습 언어 선택은 그대로 유지
    if (typeof displayConceptList === "function") {
      displayConceptList(); // 언어 변경 시 카드 재표시 (UI 텍스트만 변경)
    }
  });
}

// 언어 설정 표시 업데이트
async function updateLanguageDisplay() {
  const languageButton = document.getElementById("language-button");
  if (!languageButton) return;

  const activeLang = await getActiveLanguage();

  // 언어 코드에 따른 국기 이모지 (간단한 예시)
  const langFlags = {
    ko: "🇰🇷",
    en: "🇺🇸",
    ja: "🇯🇵",
    zh: "🇨🇳",
  };

  const flag = langFlags[activeLang] || "🌐";
  languageButton.innerHTML = `<i class="fas fa-globe mr-1"></i> ${flag}`;
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

async function handleDeleteAccount() {
  if (!auth) {
    console.error("Firebase 인증이 초기화되지 않았습니다.");
    alert("회원탈퇴에 실패했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
    return;
  }

  const confirmed = confirm(
    "정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  );
  if (confirmed) {
    try {
      await deleteAccount();
      alert("회원탈퇴가 완료되었습니다.");
    } catch (error) {
      alert(error.message || "회원탈퇴 중 오류가 발생했습니다.");
    }
  }
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
      const mobileLoginButtons = document.getElementById(
        "mobile-login-buttons"
      );
      const userProfile = document.getElementById("user-profile");
      const mobileUserProfile = document.getElementById("mobile-user-profile");
      const avatar = document.getElementById("avatar");

      if (!mobileLoginButtons || !userProfile || !mobileUserProfile || !avatar)
        return;

      if (user) {
        document
          .querySelectorAll("#login-button, #signup-button")
          .forEach((el) => el.classList.add("hidden"));
        mobileLoginButtons.classList.add("hidden");
        userProfile.classList.remove("hidden");
        mobileUserProfile.classList.remove("hidden");

        const userName = user.displayName || "사용자";
        document.getElementById(
          "user-name"
        ).textContent = `환영합니다, ${userName}님`;
        document.getElementById(
          "mobile-user-name"
        ).textContent = `환영합니다, ${userName}님`;

        const avatarURL =
          user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
        avatar.innerHTML = `<img src="${avatarURL}" class="w-10 h-10 rounded-full" alt="프로필 사진">`;
      } else {
        document
          .querySelectorAll("#login-button, #signup-button")
          .forEach((el) => el.classList.remove("hidden"));
        mobileLoginButtons.classList.remove("hidden");
        userProfile.classList.add("hidden");
        mobileUserProfile.classList.add("hidden");
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
