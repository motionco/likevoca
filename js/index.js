import { loadNavbar } from "../components/js/navbar.js";
import { applyLanguage, getActiveLanguage } from "../utils/language-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 네비게이션바 로드 (언어 설정 초기화 포함)
  await loadNavbar();

  // 네비게이션바에서 이미 언어 설정이 초기화되므로 추가 언어 적용 불필요
  console.log("메인 페이지 초기화 완료");
});
