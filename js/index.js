import { loadNavbar } from "../components/js/navbar.js";
import { applyLanguage } from "../utils/language-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  applyLanguage();
});
