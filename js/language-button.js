import {
  showLanguageSettingsModal,
  getActiveLanguage,
} from "../utils/language-utils.js";

/**
 * 페이지에 언어 설정 버튼을 추가합니다.
 * @param {string} selector - 버튼을 추가할 컨테이너의 선택자
 * @param {string} position - 버튼의 위치 ('absolute' 또는 'fixed')
 * @param {string} colorClass - 버튼의 배경색 클래스
 */
export function addLanguageButton(
  selector = "body",
  position = "fixed",
  colorClass = "#4B63AC"
) {
  document.addEventListener("DOMContentLoaded", async () => {
    // 모바일 화면에서는 언어 버튼을 생성하지 않음
    if (window.innerWidth <= 1024) {
      console.log("모바일 화면이므로 독립 언어 버튼을 생성하지 않습니다.");
      return;
    }

    // 이미 버튼이 있는지 확인
    if (document.getElementById("language-button")) {
      console.log("언어 버튼이 이미 존재합니다.");
      return;
    }

    // 네비게이션바가 있는지 확인
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer && navbarContainer.children.length > 0) {
      console.log(
        "네비게이션바가 있으므로 독립 언어 버튼을 생성하지 않습니다."
      );
      return;
    }

    // 컨테이너 찾기 또는 생성
    let container = document.querySelector(selector);
    if (!container) {
      container = document.body;
    }

    // 버튼 컨테이너 생성
    const buttonContainer = document.createElement("div");
    buttonContainer.className = `${position} top-4 right-4 z-50`;
    buttonContainer.style.position = position;
    buttonContainer.style.top = "1rem";
    buttonContainer.style.right = "1rem";
    buttonContainer.style.zIndex = "50";

    // 버튼 생성
    const button = document.createElement("button");
    button.id = "language-button";
    button.className = `border-2 border-[${colorClass}] bg-white text-[${colorClass}] font-semibold px-4 py-2 rounded-lg hover:bg-[${colorClass}] hover:text-white transition duration-300`;
    button.innerHTML = '<i class="fas fa-globe mr-1"></i>';

    // 언어 플래그 업데이트
    const activeLang = await getActiveLanguage();
    const langFlags = {
      ko: "🇰🇷",
      en: "🇺🇸",
      ja: "🇯🇵",
      zh: "🇨🇳",
    };

    const flag = langFlags[activeLang] || "🌐";
    button.innerHTML = `<i class="fas fa-globe mr-1"></i> ${flag}`;

    // 이벤트 리스너 추가
    button.addEventListener("click", showLanguageSettingsModal);

    // DOM에 추가
    buttonContainer.appendChild(button);
    container.appendChild(buttonContainer);

    console.log("독립 언어 버튼이 생성되었습니다.");
  });
}

// 언어 버튼 관리 스크립트
import { showLanguageSettingsModal } from "../utils/language-utils.js";

// 독립 언어 버튼 초기화 (네비게이션바가 없는 페이지에서만 사용)
export function initLanguageButton() {
  // 네비게이션바가 있는지 확인
  const navbarContainer = document.getElementById("navbar-container");
  const hasNavbar = navbarContainer && navbarContainer.children.length > 0;

  // 네비게이션바가 있으면 독립 언어 버튼을 생성하지 않음
  if (hasNavbar) {
    console.log("네비게이션바가 있어서 독립 언어 버튼을 생성하지 않습니다.");
    return;
  }

  // 이미 언어 버튼이 있는지 확인
  if (document.getElementById("language-button")) {
    console.log("언어 버튼이 이미 존재합니다.");
    return;
  }

  console.log("독립 언어 버튼을 생성합니다.");

  // 독립 언어 버튼 생성 (네비게이션바가 없는 페이지용)
  const languageButton = document.createElement("button");
  languageButton.id = "language-button";
  languageButton.className =
    "fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors";
  languageButton.innerHTML = '<i class="fas fa-globe mr-1"></i> KR';

  // 클릭 이벤트 추가
  languageButton.addEventListener("click", showLanguageSettingsModal);

  // body에 추가
  document.body.appendChild(languageButton);

  console.log("독립 언어 버튼이 생성되었습니다.");
}
