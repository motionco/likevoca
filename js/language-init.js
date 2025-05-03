import { applyLanguage } from "../utils/language-utils.js";
import { initLanguageButton } from "./language-button.js";

// 페이지 로드 시 언어 설정 적용
document.addEventListener("DOMContentLoaded", async () => {
  await applyLanguage();

  // 단독 페이지에서는 언어 버튼 추가 (navbar가 없는 경우)
  if (
    !document.getElementById("navbar-container") ||
    document.getElementById("navbar-container").children.length === 0
  ) {
    initLanguageButton();
  }
});
