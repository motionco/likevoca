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
  position = "absolute",
  colorClass = "#4B63AC"
) {
  document.addEventListener("DOMContentLoaded", async () => {
    // 이미 버튼이 있는지 확인
    if (document.getElementById("language-button")) {
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
  });
}

// 기본 설정으로 언어 버튼 추가
export function initLanguageButton() {
  addLanguageButton();
}
