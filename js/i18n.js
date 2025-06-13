/**
 * 통합 i18n (국제화) 시스템
 * 모든 페이지에서 공통으로 사용할 수 있는 번역 시스템
 */

// 현재 UI 언어 가져오기
export function getCurrentUILanguage() {
  return localStorage.getItem("preferredLanguage") || "ko";
}

// 번역 텍스트 가져오기
export function getI18nText(key, lang = null) {
  const currentLang = lang || getCurrentUILanguage();

  // 전역 번역 시스템 사용 (language-utils.js에서 로드)
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 기본값 반환
  return key;
}

// 페이지의 모든 data-i18n 요소에 번역 적용
export function applyI18nToPage(lang = null) {
  const currentLang = lang || getCurrentUILanguage();

  // data-i18n 속성을 가진 요소들 번역
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translatedText = getI18nText(key, currentLang);
    element.textContent = translatedText;
  });

  // placeholder 번역
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    const translatedText = getI18nText(key, currentLang);
    element.placeholder = translatedText;
  });
}

// 언어 변경 감지 및 자동 번역 적용
export function setupI18nListener() {
  // MutationObserver를 사용해 언어 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-language"
      ) {
        applyI18nToPage();
      }
    });
  });

  // document.documentElement 감시
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-language"],
  });

  // 커스텀 이벤트도 감시
  window.addEventListener("languageChanged", () => {
    applyI18nToPage();
  });

  // localStorage 변경 감지
  window.addEventListener("storage", (event) => {
    if (event.key === "preferredLanguage") {
      applyI18nToPage();
    }
  });

  // 실시간 감지 (0.5초마다 체크)
  let lastLanguage = getCurrentUILanguage();
  setInterval(() => {
    const currentLanguage = getCurrentUILanguage();
    if (currentLanguage !== lastLanguage) {
      lastLanguage = currentLanguage;
      applyI18nToPage();
    }
  }, 500);
}

// 도메인/카테고리 번역 (전역 번역 시스템 사용)
export function translateDomainKey(domainKey, lang = null) {
  const currentLang = lang || getCurrentUILanguage();
  return getI18nText(domainKey, currentLang);
}

export function translateCategoryKey(categoryKey, lang = null) {
  const currentLang = lang || getCurrentUILanguage();
  return getI18nText(categoryKey, currentLang);
}
