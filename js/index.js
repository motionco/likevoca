import { loadNavbar } from "../components/js/navbar.js";
import { applyLanguage, getActiveLanguage } from "../utils/language-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ?�비게이?�바 로드 (?�어 ?�정 초기???�함)
  await loadNavbar();
});
