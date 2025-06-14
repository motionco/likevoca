// 언어 초기화 스크립트
import { applyLanguage } from "../utils/language-utils.js";

document.addEventListener("DOMContentLoaded", function () {
  console.log("언어 초기화 시작");

  // 언어 설정 초기화
  initializeLanguage();
});

function initializeLanguage() {
  // 저장된 언어 설정 확인
  const savedLanguage = localStorage.getItem("userLanguage") || "ko";

  // 언어 적용
  if (typeof applyLanguage === "function") {
    applyLanguage();
  }

  console.log("언어 초기화 완료:", savedLanguage);
}
