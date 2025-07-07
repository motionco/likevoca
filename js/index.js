import { loadNavbar } from "../components/js/navbar.js";
import { applyLanguage, getActiveLanguage } from "../utils/language-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ?�비게이?�바 로드 (?�어 ?�정 초기???�함)
  await loadNavbar();

  // ?�비게이?�바?�서 ?��? ?�어 ?�정??초기?�되므�?추�? ?�어 ?�용 불필??  console.log("메인 ?�이지 초기???�료");
});
