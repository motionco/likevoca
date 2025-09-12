// 언어 초기화 및 네비게이션바 로딩
import {
  getCurrentLanguage,
  applyLanguage,
  updateMetadata,
  setupLanguageStateSync,
} from "../utils/language-utils.js";

// 공통 네비게이션바 로딩 함수
async function loadNavbar() {
  try {
    // DOM 로드 확인
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", resolve);
      });
    }

    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.error("❌ navbar-container 요소를 찾을 수 없습니다.");
      return;
    }

    // 네비게이션바 로드
    const currentPath = window.location.pathname;
    const currentLanguage = getCurrentLanguage();
    let navbarPath;

    if (currentPath.includes("/locales/")) {
      navbarPath = "navbar.html";
    } else if (currentPath.includes("/pages/")) {
      navbarPath = `../locales/${currentLanguage}/navbar.html`;
    } else if (currentPath.match(/^\/(ko|en|ja|zh|es)\//)) {
      // 언어별 경로 (/ko/, /en/, /ja/, /zh/, /es/)
      navbarPath = `../locales/${currentLanguage}/navbar.html`;
    } else {
      navbarPath = `locales/${currentLanguage}/navbar.html`;
    }

    try {
      const response = await fetch(navbarPath);
      if (response.ok) {
        const navbarHTML = await response.text();
        navbarContainer.innerHTML = navbarHTML;
      } else {
        throw new Error(`네비게이션바 로드 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("네비게이션바 로드 오류:", error);
    }

    // navbar.js 동적 로드
    const navbarScriptPath = currentPath.includes("/locales/")
      ? "../../components/js/navbar.js"
      : currentPath.includes("/pages/")
      ? "../components/js/navbar.js"
      : currentPath.match(/^\/(ko|en|ja|zh|es)\//)
      ? "../components/js/navbar.js"
      : "components/js/navbar.js";

    const script = document.createElement("script");
    script.type = "module";
    script.src = navbarScriptPath;

    return new Promise((resolve, reject) => {
      script.onload = async () => {
        try {
          // 약간의 지연 후 초기화 (DOM 안정화)
          await new Promise((r) => setTimeout(r, 100));

          // 현재 언어 감지
          const currentLanguage = getCurrentLanguage();

          // 네비게이션바 초기화
          if (typeof window.initializeNavbar === "function") {
            await window.initializeNavbar(currentLanguage);
          }

          // 번역 적용
          await applyLanguage();

          // 네비게이션바 로드 완료 플래그
          window.navbarLoaded = true;

          resolve();
        } catch (error) {
          console.error("❌ 네비게이션바 초기화 실패:", error);
          reject(error);
        }
      };

      script.onerror = (error) => {
        console.error("❌ navbar.js 로드 실패:", error);
        reject(error);
      };

      document.head.appendChild(script);
    });
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

// 전역으로 노출
window.loadNavbar = loadNavbar;

// 페이지 로드 시 자동 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 네비게이션바 로드
    await loadNavbar();

    // 언어 상태 동기화 설정
    setupLanguageStateSync();
  } catch (error) {
    console.error("❌ 언어 초기화 실패:", error);
  }
});
