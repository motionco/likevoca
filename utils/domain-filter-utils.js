/**
 * 도메인 필터 공통 유틸리티
 * 단어장과 AI 단어장에서 공통으로 사용하는 도메인 필터 관련 기능
 */

import { domainCategoryMapping } from "../components/js/domain-category-emoji.js";
import { getActiveLanguage } from "./language-utils.js";
import { getI18nText } from "../js/i18n.js";

// 도메인 목록 정의
export const DOMAIN_LIST = [
  "all",
  "daily",
  "food",
  "travel",
  "business",
  "education",
  "nature",
  "technology",
  "health",
  "sports",
  "entertainment",
  "culture",
  "other",
];

// 도메인 번역 키 매핑
export const DOMAIN_TRANSLATION_KEYS = {
  all: "all_domains",
  daily: "domain_daily",
  food: "domain_food",
  travel: "domain_travel",
  business: "domain_business",
  education: "domain_education",
  nature: "domain_nature",
  technology: "domain_technology",
  health: "domain_health",
  sports: "domain_sports",
  entertainment: "domain_entertainment",
  culture: "domain_culture",
  other: "domain_other",
};

// 도메인 필터 HTML 생성
export function createDomainFilterHTML(selectId = "domain-filter") {
  return `
    <label for="${selectId}" class="block text-sm font-medium mb-1 text-gray-700" data-i18n="domain">도메인</label>
    <select id="${selectId}" class="w-full p-2 border rounded h-10 text-sm">
      ${DOMAIN_LIST.map(
        (domain) => `
        <option value="${domain}" data-i18n="${DOMAIN_TRANSLATION_KEYS[domain]}"></option>
      `
      ).join("")}
    </select>
  `;
}

// 기본 도메인 텍스트 (한국어)
function getDefaultDomainText(domain) {
  const defaultTexts = {
    all: "전체",
    daily: "일상",
    food: "음식",
    travel: "여행",
    business: "비즈니스",
    education: "교육",
    nature: "자연",
    technology: "기술",
    health: "건강",
    sports: "스포츠",
    entertainment: "엔터테인먼트",
    culture: "문화",
    other: "기타",
  };
  return defaultTexts[domain] || domain;
}

// 도메인 필터 이벤트 리스너 설정
export function setupDomainFilterListener(
  selectId = "domain-filter",
  callback
) {
  const domainFilter = document.getElementById(selectId);
  if (domainFilter && callback) {
    domainFilter.addEventListener("change", callback);
  }
  return domainFilter;
}

// 도메인 필터링 로직
export function filterConceptsByDomain(concepts, selectedDomain) {
  if (selectedDomain === "all") {
    return concepts;
  }

  return concepts.filter((concept) => {
    return concept.concept_info?.domain === selectedDomain;
  });
}

// 도메인 번역 가져오기 (language-utils.js와 연동)
export async function getTranslatedDomainText(domain, lang = null) {
  const currentLang = lang || (await getActiveLanguage());
  const key = DOMAIN_TRANSLATION_KEYS[domain];
  return getI18nText(key, currentLang);
}

// 도메인별 카테고리 가져오기
export function getCategoriesForDomain(domain) {
  return domainCategoryMapping[domain] || [];
}

// 도메인 유효성 검사
export function isValidDomain(domain) {
  return DOMAIN_LIST.includes(domain);
}

// 개념의 도메인 정보 가져오기
export function getConceptDomain(concept) {
  return concept?.concept_info?.domain || concept?.domain || "other";
}

// 개념의 카테고리 정보 가져오기
export function getConceptCategory(concept) {
  return concept?.concept_info?.category || concept?.category || "other";
}

// 언어 설정 디버그 및 수정 함수
export function debugAndFixLanguageSettings() {
  console.log("=== 언어 설정 디버그 ===");
  console.log("userLanguage:", localStorage.getItem("userLanguage"));
  console.log("preferredLanguage:", localStorage.getItem("preferredLanguage"));

  // 사용자가 영어로 설정했다면 preferredLanguage도 영어로 동기화
  const userLang = localStorage.getItem("userLanguage");
  if (userLang && userLang !== "auto") {
    console.log(`preferredLanguage를 ${userLang}로 동기화`);
    localStorage.setItem("preferredLanguage", userLang);
  }
}

// 영어 도메인 번역 강제 수정 함수 (임시 해결책 - 더 이상 필요하지 않음)
// 근본적인 해결책: 도메인 필터를 JavaScript로 동적 생성하여 번역 시스템과 일관성 확보

// 언어 변경 시 도메인 필터 옵션을 다시 번역하는 함수
export async function updateDomainFilterLanguage() {
  try {
    // 언어 설정 디버그
    debugAndFixLanguageSettings();

    // language-utils.js의 getActiveLanguage 사용하여 정확한 언어 감지
    const currentLang = await getActiveLanguage();
    console.log("도메인 필터 언어 업데이트:", currentLang);

    // 영어 번역 강제 수정 제거 - 더 이상 필요하지 않음
    // 동적 필터 생성으로 인해 번역 시스템과 일관성 확보됨

    // 디버그: window.translations 객체 상태 확인
    console.log("window.translations 객체:", window.translations);
    console.log("window.translations[en]:", window.translations?.en);
    console.log("window.translations[ja]:", window.translations?.ja);

    // 디버그: 영어 번역에서 도메인 키들만 따로 확인
    console.log("=== 영어 번역에서 도메인 키들만 확인 ===");
    const domainKeys = [
      "all_domains",
      "domain_daily",
      "domain_food",
      "domain_travel",
      "domain_business",
      "domain_education",
      "domain_nature",
      "domain_technology",
      "domain_health",
      "domain_sports",
      "domain_entertainment",
      "domain_culture",
      "domain_other",
    ];
    domainKeys.forEach((key) => {
      console.log(`${key}: "${window.translations?.en?.[key]}"`);
    });

    // 디버그: 특정 도메인 키들이 각 언어에 있는지 확인
    const testKeys = [
      "all_domains",
      "domain_food",
      "domain_travel",
      "domain_business",
    ];
    console.log("=== 도메인 키 존재 여부 확인 ===");
    testKeys.forEach((key) => {
      console.log(`${key}:`, {
        en: window.translations?.en?.[key],
        ja: window.translations?.ja?.[key],
        ko: window.translations?.ko?.[key],
        zh: window.translations?.zh?.[key],
      });
    });

    // 모든 도메인 필터 select 요소 찾기
    const domainSelects = document.querySelectorAll(
      'select[id*="domain-filter"], select[id*="domain"]'
    );

    domainSelects.forEach((select) => {
      // 현재 선택된 값 저장
      const selectedValue = select.value;

      // 옵션들을 다시 번역
      const options = select.querySelectorAll("option[data-i18n]");
      options.forEach((option) => {
        const key = option.getAttribute("data-i18n");
        if (key && window.translations) {
          // 현재 언어에서 번역 찾기
          let translatedText = null;

          if (
            window.translations[currentLang] &&
            window.translations[currentLang][key]
          ) {
            translatedText = window.translations[currentLang][key];
            console.log(
              `✅ ${currentLang} 언어에서 찾음: ${key} -> ${translatedText}`
            );
          } else {
            console.log(`❌ ${currentLang} 언어에서 누락: ${key}`);
            // 현재 언어에서 찾지 못하면 영어로 fallback
            if (window.translations.en && window.translations.en[key]) {
              translatedText = window.translations.en[key];
              console.log(`⚠️ 영어 fallback 사용: ${key} -> ${translatedText}`);
            } else {
              console.log(`❌ 영어에서도 누락: ${key}`);
              // 영어에서도 찾지 못하면 일본어로 fallback (임시)
              if (window.translations.ja && window.translations.ja[key]) {
                translatedText = window.translations.ja[key];
                console.log(
                  `⚠️ 일본어 fallback 사용: ${key} -> ${translatedText}`
                );
              } else {
                console.log(`❌ 일본어에서도 누락: ${key}`);
                // 마지막 fallback: 키 그대로 사용
                translatedText = key;
                console.log(`⚠️ 키 그대로 사용: ${key}`);
              }
            }
          }

          if (translatedText) {
            option.textContent = translatedText;
            console.log(
              `번역 적용: ${key} -> ${translatedText} (${currentLang})`
            );
          }
        }
      });

      // 선택된 값 복원
      select.value = selectedValue;
    });
  } catch (error) {
    console.error("도메인 필터 언어 업데이트 실패:", error);
  }
}

// 페이지 로드 시 도메인 필터 언어 초기화
export async function initializeDomainFilterLanguage() {
  // 페이지 로드 후 잠시 대기하여 번역 시스템이 준비될 때까지 기다림
  setTimeout(async () => {
    await updateDomainFilterLanguage();
  }, 1000);
}

// 전역에서 접근 가능하도록 설정
if (typeof window !== "undefined") {
  window.updateDomainFilterLanguage = updateDomainFilterLanguage;
  window.initializeDomainFilterLanguage = initializeDomainFilterLanguage;
  window.debugAndFixLanguageSettings = debugAndFixLanguageSettings;
}
