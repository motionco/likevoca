/**
 * 단어장 통합 필터 유틸리티
 * 단어장과 AI 단어장에서 공통으로 사용하는 모든 필터 관련 기능
 */

import { DOMAIN_LIST, DOMAIN_TRANSLATION_KEYS } from "./domain-filter-utils.js";

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = [
  { value: "korean", key: "korean" },
  { value: "english", key: "english" },
  { value: "japanese", key: "japanese" },
  { value: "chinese", key: "chinese" },
];

// 정렬 옵션 목록
export const SORT_OPTIONS = [
  { value: "latest", key: "latest" },
  { value: "oldest", key: "oldest" },
  { value: "a-z", key: "alphabetical" },
  { value: "z-a", key: "reverse_alphabetical" },
];

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
    if (swapButton && this.onLanguageSwap) {
      swapButton.addEventListener("click", this.onLanguageSwap);
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

    if (!sourceSelect || !targetSelect) return;

    const sourceValue = sourceSelect.value;
    const targetValue = targetSelect.value;

    if (sourceValue === targetValue) return;

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

// 공통 필터 설정 함수
export function setupVocabularyFilters(onFilterChange) {
  const filterManager = new VocabularyFilterManager({
    onSearch: onFilterChange,
    onLanguageChange: onFilterChange,
    onDomainChange: onFilterChange,
    onSortChange: onFilterChange,
    onLanguageSwap: () => {
      filterManager.swapLanguages();
      onFilterChange();
    },
  });

  filterManager.setupEventListeners();
  return filterManager;
}
