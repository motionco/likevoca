/**
 * 단어장 통합 필터 유틸리티
 * 단어장과 AI 단어장에서 공통으로 사용하는 모든 필터 관련 기능
 */

// 도메인 관련 기능들을 직접 포함
import { domainCategoryMapping } from "../components/js/domain-category-emoji.js";

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = [
  { value: "korean", key: "korean" },
  { value: "english", key: "english" },
  { value: "japanese", key: "japanese" },
  { value: "chinese", key: "chinese" },
];

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

// 정렬 옵션 목록
export const SORT_OPTIONS = [
  { value: "latest", key: "latest" },
  { value: "oldest", key: "oldest" },
  { value: "a-z", key: "alphabetical" },
  { value: "z-a", key: "reverse_alphabetical" },
];

// 필터 HTML 생성기
export class VocabularyFilterBuilder {
  constructor(options = {}) {
    this.showSearch = options.showSearch !== false;
    this.showLanguage = options.showLanguage !== false;
    this.showDomain = options.showDomain !== false;
    this.showSort = options.showSort !== false;
    this.gridCols = options.gridCols || 3;
  }

  // 검색 필터 HTML
  createSearchFilter() {
    if (!this.showSearch) return "";
    return `
      <div class="w-full">
        <label for="search-input" class="hidden md:block text-sm font-medium mb-1 text-gray-700" data-i18n="search">검색</label>
        <div class="relative">
          <input type="text" id="search-input" class="w-full p-2 border rounded pl-8 h-10" placeholder="검색어 입력..." data-i18n-placeholder="search_placeholder" />
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>
    `;
  }

  // 언어 필터 HTML
  createLanguageFilter() {
    if (!this.showLanguage) return "";
    const languageOptions = SUPPORTED_LANGUAGES.map(
      (lang) =>
        `<option value="${lang.value}" data-i18n="${
          lang.key
        }">${this.getDefaultLanguageText(lang.value)}</option>`
    ).join("");

    return `
      <div class="w-full">
        <label class="block text-sm font-medium mb-1 text-gray-700" data-i18n="language_filter">언어 필터</label>
        <div class="grid grid-cols-5 gap-1 h-10">
          <select id="source-language" class="col-span-2 p-2 border rounded text-sm">
            ${languageOptions}
          </select>
          <button id="swap-languages" class="w-full h-full text-gray-600 hover:text-[#4B63AC] hover:bg-gray-100 rounded-lg transition duration-200 border border-gray-300 hover:border-[#4B63AC] flex items-center justify-center" title="언어 순서 바꾸기" data-i18n-title="swap_languages">
            <i class="fas fa-exchange-alt text-sm"></i>
          </button>
          <select id="target-language" class="col-span-2 p-2 border rounded text-sm">
            <option value="english" data-i18n="english">${this.getDefaultLanguageText(
              "english"
            )}</option>
            <option value="korean" data-i18n="korean">${this.getDefaultLanguageText(
              "korean"
            )}</option>
            <option value="japanese" data-i18n="japanese">${this.getDefaultLanguageText(
              "japanese"
            )}</option>
            <option value="chinese" data-i18n="chinese">${this.getDefaultLanguageText(
              "chinese"
            )}</option>
          </select>
        </div>
      </div>
    `;
  }

  // 도메인 필터 HTML
  createDomainFilter() {
    if (!this.showDomain) return "";
    return `
      <label for="domain-filter" class="block text-sm font-medium mb-1 text-gray-700" data-i18n="domain">도메인</label>
      <select id="domain-filter" class="w-full p-2 border rounded h-10 text-sm">
        ${DOMAIN_LIST.map(
          (domain) => `
          <option value="${domain}" data-i18n="${
            DOMAIN_TRANSLATION_KEYS[domain]
          }">${this.getDefaultDomainText(domain)}</option>
        `
        ).join("")}
      </select>
    `;
  }

  // 정렬 필터 HTML
  createSortFilter() {
    if (!this.showSort) return "";
    const sortOptions = SORT_OPTIONS.map(
      (option) =>
        `<option value="${option.value}" data-i18n="${
          option.key
        }">${this.getDefaultSortText(option.value)}</option>`
    ).join("");

    return `
      <label for="sort-option" class="block text-sm font-medium mb-1 text-gray-700" data-i18n="sort">정렬</label>
      <select id="sort-option" class="w-full p-2 border rounded h-10 text-sm">
        ${sortOptions}
      </select>
    `;
  }

  // 전체 필터 HTML 생성
  createFilterHTML() {
    const filters = [];

    if (this.showSearch) filters.push(this.createSearchFilter());
    if (this.showLanguage) filters.push(this.createLanguageFilter());

    // 도메인과 정렬을 함께 표시
    if (this.showDomain || this.showSort) {
      const domainSort = `
        <div class="w-full">
          <div class="grid grid-cols-2 gap-2">
            ${this.showDomain ? `<div>${this.createDomainFilter()}</div>` : ""}
            ${this.showSort ? `<div>${this.createSortFilter()}</div>` : ""}
          </div>
        </div>
      `;
      filters.push(domainSort);
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-${this.gridCols} gap-4 mb-4">
        ${filters.join("")}
      </div>
    `;
  }

  // 기본 언어 텍스트
  getDefaultLanguageText(lang) {
    const texts = {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
    };
    return texts[lang] || lang;
  }

  // 기본 정렬 텍스트
  getDefaultSortText(sort) {
    const texts = {
      latest: "최신순",
      oldest: "오래된순",
      "a-z": "가나다순",
      "z-a": "역가나다순",
    };
    return texts[sort] || sort;
  }

  // 기본 도메인 텍스트
  getDefaultDomainText(domain) {
    const texts = {
      all: "전체 영역",
      daily: "일상생활",
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
    return texts[domain] || domain;
  }
}

// 필터 관리자 클래스
export class VocabularyFilterManager {
  constructor(callbacks = {}) {
    this.onSearch = callbacks.onSearch;
    this.onLanguageChange = callbacks.onLanguageChange;
    this.onDomainChange = callbacks.onDomainChange;
    this.onSortChange = callbacks.onSortChange;
    this.onLanguageSwap = callbacks.onLanguageSwap;
  }

  // 모든 이벤트 리스너 설정
  setupEventListeners() {

    // 검색 필터
    const searchInput = document.getElementById("search-input");
    if (searchInput && this.onSearch) {
      searchInput.addEventListener("input", this.debounce(this.onSearch, 300));
    }

    // 언어 필터
    const sourceLanguage = document.getElementById("source-language");
    const targetLanguage = document.getElementById("target-language");
    if (sourceLanguage && this.onLanguageChange) {
      sourceLanguage.addEventListener("change", this.onLanguageChange);
    }
    if (targetLanguage && this.onLanguageChange) {
      targetLanguage.addEventListener("change", this.onLanguageChange);
    }

    // 언어 교체 버튼
    const swapButton = document.getElementById("swap-languages");

    if (swapButton && this.onLanguageChange) {
      // 기존 이벤트 리스너 제거 후 새로 추가
      const newSwapButton = swapButton.cloneNode(true);
      swapButton.parentNode.replaceChild(newSwapButton, swapButton);

      newSwapButton.addEventListener("click", () => {
        this.swapLanguages();
      });
    } else {
      console.warn("⚠️ 언어 전환 버튼 이벤트 설정 실패:", {
        swapButton: !!swapButton,
        onLanguageChange: !!this.onLanguageChange,
      });
    }

    // 도메인 필터
    const domainFilter = document.getElementById("domain-filter");
    if (domainFilter && this.onDomainChange) {
      domainFilter.addEventListener("change", this.onDomainChange);
    }

    // 정렬 필터
    const sortOption = document.getElementById("sort-option");
    if (sortOption && this.onSortChange) {
      sortOption.addEventListener("change", this.onSortChange);
    }

  }

  // 현재 필터 값들 가져오기
  getCurrentFilters() {
    return {
      search:
        document.getElementById("search-input")?.value.toLowerCase() || "",
      sourceLanguage:
        document.getElementById("source-language")?.value || "korean",
      targetLanguage:
        document.getElementById("target-language")?.value || "english",
      domain: document.getElementById("domain-filter")?.value || "all",
      sort: document.getElementById("sort-option")?.value || "latest",
    };
  }

  // 언어 교체 기능
  swapLanguages() {

    const sourceSelect = document.getElementById("source-language");
    const targetSelect = document.getElementById("target-language");

    if (!sourceSelect || !targetSelect) {
      console.warn("⚠️ 언어 선택 요소를 찾을 수 없습니다:", {
        sourceSelect: !!sourceSelect,
        targetSelect: !!targetSelect,
      });
      return;
    }

    const sourceValue = sourceSelect.value;
    const targetValue = targetSelect.value;


    if (sourceValue === targetValue) {
      console.warn("⚠️ 원본언어와 대상언어가 동일하여 전환하지 않습니다");
      return;
    }

    // 애니메이션 효과
    const swapButton = document.getElementById("swap-languages");
    const icon = swapButton?.querySelector("i");
    if (icon) {
      icon.style.transform = "rotate(180deg)";
      icon.style.transition = "transform 0.3s ease";
      setTimeout(() => {
        icon.style.transform = "rotate(0deg)";
      }, 300);
    }

    sourceSelect.value = targetValue;
    targetSelect.value = sourceValue;


    // 변경 이벤트 발생
    if (this.onLanguageChange) {
      this.onLanguageChange();
    } else {
      console.warn("⚠️ onLanguageChange 콜백이 설정되지 않았습니다");
    }
  }

  // 디바운스 함수
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 필터링 로직 클래스
export class VocabularyFilterProcessor {
  // 검색 필터링
  static filterBySearch(concepts, searchTerm) {
    if (!searchTerm) return concepts;

    return concepts.filter((concept) => {
      const searchInExpressions = Object.values(concept.expressions || {}).some(
        (expr) =>
          expr.word?.toLowerCase().includes(searchTerm) ||
          expr.definition?.toLowerCase().includes(searchTerm) ||
          expr.pronunciation?.toLowerCase().includes(searchTerm)
      );

      const searchInCategory = concept.concept_info?.category
        ?.toLowerCase()
        .includes(searchTerm);
      const searchInDomain = concept.concept_info?.domain
        ?.toLowerCase()
        .includes(searchTerm);

      return searchInExpressions || searchInCategory || searchInDomain;
    });
  }

  // 언어 필터링
  static filterByLanguage(concepts, sourceLanguage, targetLanguage) {
    return concepts.filter((concept) => {
      const hasSourceLang = concept.expressions?.[sourceLanguage]?.word;
      const hasTargetLang = concept.expressions?.[targetLanguage]?.word;
      return hasSourceLang && hasTargetLang;
    });
  }

  // 도메인 필터링
  static filterByDomain(concepts, domain) {
    if (domain === "all") return concepts;
    return concepts.filter(
      (concept) => concept.concept_info?.domain === domain
    );
  }

  // 정렬
  static sortConcepts(concepts, sortOption, targetLanguage = "english") {
    const toDate = (timestamp) =>
      timestamp && typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp || 0);

    return [...concepts].sort((a, b) => {
      switch (sortOption) {
        case "latest":
          return (
            toDate(b.createdAt || b.created_at) -
            toDate(a.createdAt || a.created_at)
          );
        case "oldest":
          return (
            toDate(a.createdAt || a.created_at) -
            toDate(b.createdAt || b.created_at)
          );
        case "a-z":
          const aWord = a.expressions?.[targetLanguage]?.word || "";
          const bWord = b.expressions?.[targetLanguage]?.word || "";
          return aWord.localeCompare(bWord);
        case "z-a":
          const aWordRev = a.expressions?.[targetLanguage]?.word || "";
          const bWordRev = b.expressions?.[targetLanguage]?.word || "";
          return bWordRev.localeCompare(aWordRev);
        default:
          return 0;
      }
    });
  }

  // 통합 필터링 및 정렬
  static processFilters(concepts, filters) {
    let result = concepts;

    // 순차적으로 필터 적용
    result = this.filterBySearch(result, filters.search);
    result = this.filterByLanguage(
      result,
      filters.sourceLanguage,
      filters.targetLanguage
    );
    result = this.filterByDomain(result, filters.domain);
    result = this.sortConcepts(result, filters.sort, filters.targetLanguage);

    return result;
  }
}

// 필터 언어 업데이트 함수 (도메인 + 언어 필터)
export async function updateVocabularyFilterLanguage() {
  try {
    // 현재 언어 가져오기
    let currentLang = "ko";

    // localStorage에서 직접 가져오기
    const userLang = localStorage.getItem("userLanguage");
    if (userLang && userLang !== "auto") {
      currentLang = userLang;
    } else if (userLang === "auto") {
      // 브라우저 언어 감지
      const browserLang = navigator.language || navigator.userLanguage;
      const shortLang = browserLang.split("-")[0];
      if (["ko", "en", "ja", "zh"].includes(shortLang)) {
        currentLang = shortLang;
      }
    }


    // 모든 필터 select 요소들 업데이트
    const allSelects = document.querySelectorAll(
      'select[id="domain-filter"], select[id*="domain-filter"], select[id="concept-domain"], select[id="source-language"], select[id="target-language"], select[id="sort-option"]'
    );

    allSelects.forEach((select) => {
      const currentValue = select.value;

      // 각 옵션의 텍스트를 현재 언어로 업데이트
      Array.from(select.options).forEach((option) => {
        const i18nKey = option.getAttribute("data-i18n");
        if (
          i18nKey &&
          window.translations &&
          window.translations[currentLang]
        ) {
          const translation = window.translations[currentLang][i18nKey];
          if (translation) {
            option.textContent = translation;
          }
        }
      });

      // 선택된 값 유지
      select.value = currentValue;
    });

    // 필터 레이블들도 업데이트
    const filterLabels = document.querySelectorAll("label[data-i18n]");
    filterLabels.forEach((label) => {
      const i18nKey = label.getAttribute("data-i18n");
      if (i18nKey && window.translations && window.translations[currentLang]) {
        const translation = window.translations[currentLang][i18nKey];
        if (translation) {
          label.textContent = translation;
        }
      }
    });

  } catch (error) {
    console.error("필터 언어 업데이트 중 오류:", error);
  }
}

// 공통 필터 설정 함수
export function setupVocabularyFilters(onFilterChange) {
  const filterManager = new VocabularyFilterManager({
    onSearch: onFilterChange,
    onLanguageChange: onFilterChange,
    onDomainChange: onFilterChange,
    onSortChange: onFilterChange,
  });

  filterManager.setupEventListeners();
  return filterManager;
}

// 페이지 로드 시 필터 언어 초기화
export function initializeVocabularyFilterLanguage() {
  // 페이지 로드 후 잠시 대기하여 번역 시스템이 준비될 때까지 기다림
  setTimeout(async () => {
    await updateVocabularyFilterLanguage();
  }, 1000);
}

// 전역에서 접근 가능하도록 설정
if (typeof window !== "undefined") {
  window.updateVocabularyFilterLanguage = updateVocabularyFilterLanguage;
  window.initializeVocabularyFilterLanguage =
    initializeVocabularyFilterLanguage;
}
