/**
 * 도메인 필터 공통 유틸리티
 * 단어장과 AI 단어장에서 공통으로 사용하는 도메인 필터 관련 기능
 */

import { domainCategoryMapping } from "../components/js/domain-category-emoji.js";

// 도메인 목록 정의
export const DOMAIN_LIST = [
  "all",
  "daily",
  "food",
  "travel",
  "business",
  "academic",
  "nature",
  "technology",
  "health",
  "sports",
  "entertainment",
  "culture",
  "education",
  "other",
];

// 도메인 번역 키 매핑
export const DOMAIN_TRANSLATION_KEYS = {
  all: "all_domains",
  daily: "domain_daily",
  food: "domain_food",
  travel: "domain_travel",
  business: "domain_business",
  academic: "domain_academic",
  nature: "domain_nature",
  technology: "domain_technology",
  health: "domain_health",
  sports: "domain_sports",
  entertainment: "domain_entertainment",
  culture: "domain_culture",
  education: "domain_education",
  other: "domain_other",
};

// 도메인 필터 HTML 생성
export function createDomainFilterHTML(selectId = "domain-filter") {
  return `
    <label for="${selectId}" class="block text-sm font-medium mb-1 text-gray-700" data-i18n="domain">도메인</label>
    <select id="${selectId}" class="w-full p-2 border rounded h-10 text-sm">
      ${DOMAIN_LIST.map(
        (domain) => `
        <option value="${domain}" data-i18n="${
          DOMAIN_TRANSLATION_KEYS[domain]
        }">${getDefaultDomainText(domain)}</option>
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
    academic: "학술",
    nature: "자연",
    technology: "기술",
    health: "건강",
    sports: "스포츠",
    entertainment: "엔터테인먼트",
    culture: "문화",
    education: "교육",
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
export function getTranslatedDomainText(domain, userLanguage = "ko") {
  // window.translations가 로드되어 있으면 사용
  if (
    window.translations &&
    window.translations[userLanguage] &&
    window.translations[userLanguage][DOMAIN_TRANSLATION_KEYS[domain]]
  ) {
    return window.translations[userLanguage][DOMAIN_TRANSLATION_KEYS[domain]];
  }

  // fallback으로 기본 텍스트 반환
  return getDefaultDomainText(domain);
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
