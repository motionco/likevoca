import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import { initialize as initializeConceptModal } from "../../components/js/add-concept-modal.js";
import { initialize as initializeBulkImportModal } from "../../components/js/bulk-import-modal.js";
import {
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";
// 필터 공유 모듈 import
import {
  VocabularyFilterBuilder,
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";
// 공통 번역 유틸리티 import
// translation-utils.js 제거됨 - language-utils.js의 번역 시스템 사용
// 도메인 필터 언어 초기화는 vocabulary-filter-shared.js에서 처리됨

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

// 사용자 언어 초기화
async function initializeUserLanguage() {
  try {
    // getActiveLanguage가 정의되어 있는지 확인
    if (typeof getActiveLanguage === "function") {
      userLanguage = await getActiveLanguage();
    } else {
      console.warn(
        "getActiveLanguage 함수를 찾을 수 없습니다. 기본값을 사용합니다."
      );
      userLanguage = "ko";
    }
  } catch (error) {
    console.error("언어 설정 로드 실패:", error);
    userLanguage = "ko"; // 기본값
  }
}

// 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  try {
    // 1. window.getI18nText 함수 사용 (우선순위)
    if (typeof window.getI18nText === "function") {
      const result = window.getI18nText(key);
      if (result !== key) {
        return result;
      }
    }

    // 2. window.translations 직접 사용
    const currentLang = userLanguage || "ko";
    if (
      window.translations &&
      window.translations[currentLang] &&
      window.translations[currentLang][key]
    ) {
      return window.translations[currentLang][key];
    }

    // 3. pageTranslations fallback 사용
    if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
      return pageTranslations[currentLang][key];
    }

    // 4. 기본값 반환
    return key;
  } catch (error) {
    console.error(`번역 텍스트 가져오기 실패 (${key}):`, error);
    return key;
  }
}

// 페이지별 번역 키
const pageTranslations = {
  ko: {
    meaning: "뜻:",
    example: "예문:",
    examples: "예문",
    edit: "편집",
    delete: "삭제",
    error_title: "오류 발생!",
    error_message: "페이지를 불러오는 중 문제가 발생했습니다.",
    error_details: "자세한 내용:",
    login_required: "로그인이 필요합니다.",
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    examples: "Examples",
    edit: "Edit",
    delete: "Delete",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    examples: "例文",
    edit: "編集",
    delete: "削除",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    examples: "例句",
    edit: "编辑",
    delete: "删除",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
  },
};

// 도메인 번역 매핑 (ai-concept-utils.js와 동일)
const domainTranslations = {
  daily: { ko: "일상생활", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
  food: {
    ko: "음식/요리",
    en: "Food/Cooking",
    ja: "食べ物/料理",
    zh: "食物/烹饪",
  },
  travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
  business: {
    ko: "비즈니스/업무",
    en: "Business/Work",
    ja: "ビジネス/業務",
    zh: "商务/工作",
  },
  education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  nature: {
    ko: "자연/환경",
    en: "Nature/Environment",
    ja: "自然/環境",
    zh: "自然/环境",
  },
  technology: {
    ko: "기술/IT",
    en: "Technology/IT",
    ja: "技術/IT",
    zh: "技术/IT",
  },
  health: {
    ko: "건강/의료",
    en: "Health/Medical",
    ja: "健康/医療",
    zh: "健康/医疗",
  },
  sports: {
    ko: "스포츠/운동",
    en: "Sports/Exercise",
    ja: "スポーツ/運動",
    zh: "体育/运动",
  },
  entertainment: {
    ko: "엔터테인먼트",
    en: "Entertainment",
    ja: "エンターテインメント",
    zh: "娱乐",
  },
  culture: {
    ko: "문화/전통",
    en: "Culture/Tradition",
    ja: "文化/伝統",
    zh: "文化/传统",
  },
  other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  // 호환성을 위한 추가 매핑
  academic: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  general: { ko: "일반", en: "General", ja: "一般", zh: "一般" },
};

// ... rest of the code ...

// 개념 카드 생성 함수 (확장된 구조 지원 및 디버깅 개선)
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  // 새로운 구조와 기존 구조 모두 지원
  const sourceExpression = concept.expressions?.[sourceLanguage] || {};
  const targetExpression = concept.expressions?.[targetLanguage] || {};

  // 빈 표현인 경우 건너뛰기
  if (!sourceExpression.word || !targetExpression.word) {
    return "";
  }

  // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
  const conceptInfo = concept.concept_info || {
    domain: concept.domain || "기타",
    category: concept.category || "일반",
    unicode_emoji: concept.emoji || concept.unicode_emoji || "📝",
    color_theme: concept.color_theme || "#4B63AC",
  };

  // 색상 테마 가져오기 (안전한 fallback)
  const colorTheme =
    conceptInfo.color_theme || concept.color_theme || "#4B63AC";

  // 이모지 가져오기 (실제 데이터 구조에 맞게 우선순위 조정)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    concept.emoji ||
    concept.unicode_emoji ||
    "📝";

  // 예문 가져오기 (concepts 컬렉션의 대표 예문 사용)
  let example = null;

  // 1. representative_example 확인 (새 구조와 기존 구조 모두 지원)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 새로운 구조: 직접 언어별 텍스트
    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      example = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
      console.log("✅ 카드: 새로운 대표 예문 구조 사용");
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
      example = {
        source:
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "",
        target:
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "",
      };
      console.log("✅ 카드: 기존 대표 예문 구조 사용");
    }
  }
  // 2. featured_examples 확인 (기존 방식)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    }
  }
  // 3. core_examples 확인 (기존 방식 - 하위 호환성)
  else if (concept.core_examples && concept.core_examples.length > 0) {
    const firstExample = concept.core_examples[0];
    // 번역 구조 확인
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    } else {
      // 직접 언어 속성이 있는 경우
      example = {
        source: firstExample[sourceLanguage] || "",
        target: firstExample[targetLanguage] || "",
      };
    }
  }
  // 4. 기존 examples 확인 (하위 호환성)
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
  }

  // 개념 ID 생성 (document ID 우선 사용)
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.word}_${targetExpression.word}`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer concept-card"
      onclick="openConceptViewModal('${conceptId}')"
      style="border-left: 4px solid ${colorTheme}"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">${emoji}</span>
        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              ${targetExpression.word || "N/A"}
            </h3>
          <p class="text-sm text-gray-500">${
            targetExpression.pronunciation ||
            targetExpression.romanization ||
            ""
          }</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            class="bookmark-btn p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" 
            onclick="event.stopPropagation(); toggleBookmark('${conceptId}')"
            data-concept-id="${conceptId}"
            title="북마크"
          >
            <i class="fas fa-bookmark text-gray-400"></i>
          </button>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${getTranslatedDomainCategory(
            conceptInfo.domain,
            conceptInfo.category
          )}
        </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${sourceExpression.word || "N/A"}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          targetExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-sm text-gray-700 font-medium">${example.target}</p>
        <p class="text-sm text-gray-500 italic">${example.source}</p>
      </div>
      `
          : ""
      }
      
      <div class="flex justify-between text-xs text-gray-500 mt-3">
        <span class="flex items-center">
          <i class="fas fa-language mr-1"></i> ${sourceLanguage} → ${targetLanguage}
        </span>
        <span class="flex items-center">
          <i class="fas fa-clock mr-1"></i> ${formatDate(
            concept.metadata?.created_at ||
              concept.created_at ||
              concept.timestamp
          )}
        </span>
      </div>
    </div>
  `;
}

// 언어 전환 함수
// 언어 순서 바꾸기 함수는 공유 모듈로 대체됨

// 날짜 포맷팅 함수
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 검색 및 필터링 함수 (공유 모듈 사용)
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  console.log("검색 및 필터링 시작:", {
    filters,
    totalConcepts: allConcepts.length,
  });

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  console.log("필터링 완료:", {
    filteredCount: filteredConcepts.length,
  });

  // 표시
  displayConceptList();
}

// 정렬 함수는 공유 모듈로 대체됨

// 개념 목록 표시 함수 (디버깅 개선)
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  if (!conceptList) {
    console.error("❌ concept-list 요소를 찾을 수 없습니다!");
    return;
  }

  // 표시할 개념 선택
  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  // 개념 수 업데이트
  if (conceptCount) {
    conceptCount.textContent = filteredConcepts.length;
  }

  if (conceptsToShow.length === 0) {
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        표시할 개념이 없습니다. 다른 언어 조합이나 필터를 시도해보세요.
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    return;
  }

  // 개념 카드 생성 및 표시
  const cardHTMLs = conceptsToShow
    .map((concept) => createConceptCard(concept))
    .filter((html) => html); // 빈 HTML 제거

  // HTML 삽입
  conceptList.innerHTML = cardHTMLs.join("");

  // 북마크 UI 업데이트
  updateBookmarkUI();

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }
}

// 더 보기 버튼 처리
function handleLoadMore() {
  displayCount += 12;
  displayConceptList();
}

// 모달 로드 함수
async function loadModals(modalPaths) {
  try {
    const responses = await Promise.all(modalPaths.map((path) => fetch(path)));
    const htmlContents = await Promise.all(
      responses.map((response) => response.text())
    );

    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
      modalContainer.innerHTML = htmlContents.join("");
    }
  } catch (error) {
    console.error("모달 로드 중 오류 발생:", error);
  }
}

// 사용량 UI 업데이트
async function updateUsageUI() {
  try {
    if (!currentUser) return;

    // 사용자 문서 가져오기
    const userRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const conceptCount = userData.conceptCount || 0;
    const maxConcepts = userData.maxConcepts || 100;

    // UI 업데이트
    const usageText = document.getElementById("concept-usage-text");
    const usageBar = document.getElementById("concept-usage-bar");

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
    }

    if (usageBar) {
      const usagePercentage = (conceptCount / maxConcepts) * 100;
      usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

      // 색상 업데이트
      if (usagePercentage >= 90) {
        usageBar.classList.remove("bg-[#4B63AC]");
        usageBar.classList.add("bg-red-500");
      } else if (usagePercentage >= 70) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-red-500");
        usageBar.classList.add("bg-yellow-500");
      } else {
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  } catch (error) {
    console.error("사용량 업데이트 중 오류 발생:", error);
  }
}

// 개념 데이터 가져오기 (ID 포함 및 디버깅 개선)
async function fetchAndDisplayConcepts() {
  try {
    if (!currentUser) return;

    // 분리된 컬렉션과 통합 컬렉션 모두에서 개념 가져오기
    allConcepts = [];
    const conceptsRef = collection(db, "concepts");

    // 모든 concepts 컬렉션 데이터 조회 (분리된 컬렉션과 기존 구조 모두 포함)
    console.log("📚 concepts 컬렉션에서 데이터 로드 시작...");

    try {
      // 전체 조회 후 필터링 (더 안전한 방식)
      const querySnapshot = await getDocs(conceptsRef);
      console.log(`📊 concepts 컬렉션에서 ${querySnapshot.size}개 문서 발견`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외하고 모든 개념 포함 (분리된 컬렉션과 기존 구조 모두)
        if (!data.isAIGenerated) {
          console.log(`✅ 개념 추가: ${doc.id}`, {
            hasMetadata: !!data.metadata,
            hasCreatedAt: !!data.created_at,
            hasExpressions: !!data.expressions,
            expressionKeys: Object.keys(data.expressions || {}),
          });
          allConcepts.push(data);
        } else {
          console.log(`⏭️ AI 생성 개념 제외: ${doc.id}`);
        }
      });

      console.log(`📋 총 로드된 개념 수: ${allConcepts.length}개`);
    } catch (queryError) {
      console.error("concepts 컬렉션 조회 실패:", queryError);
      allConcepts = [];
    }

    // JavaScript에서 정렬 (분리된 컬렉션과 통합 컬렉션 모두 지원)
    allConcepts.sort((a, b) => {
      const getTime = (concept) => {
        // 분리된 컬렉션: metadata.created_at 우선 확인
        if (concept.metadata?.created_at) {
          return concept.metadata.created_at.toDate
            ? concept.metadata.created_at.toDate().getTime()
            : new Date(concept.metadata.created_at).getTime();
        }
        // 통합 컬렉션: 최상위 레벨 created_at 확인
        if (concept.created_at) {
          return concept.created_at.toDate
            ? concept.created_at.toDate().getTime()
            : new Date(concept.created_at).getTime();
        }
        // concept_info.created_at 확인
        if (concept.concept_info?.created_at) {
          return concept.concept_info.created_at.toDate
            ? concept.concept_info.created_at.toDate().getTime()
            : new Date(concept.concept_info.created_at).getTime();
        }
        // timestamp 확인 (더 오래된 데이터)
        if (concept.timestamp) {
          return concept.timestamp.toDate
            ? concept.timestamp.toDate().getTime()
            : new Date(concept.timestamp).getTime();
        }
        // 시간 정보가 없으면 현재 시간으로 간주 (최신으로 표시)
        return Date.now();
      };

      return getTime(b) - getTime(a); // 내림차순 정렬
    });

    // 전역 변수 업데이트 (편집 모달에서 접근 가능하도록)
    window.allConcepts = allConcepts;

    // 학습 페이지에서 사용할 수 있도록 sessionStorage에도 저장
    try {
      sessionStorage.setItem(
        "learningConcepts",
        JSON.stringify(allConcepts.slice(0, 100))
      ); // 성능을 위해 최대 100개
    } catch (error) {
      console.warn("⚠️ sessionStorage 저장 실패:", error);
    }

    // 현재 필터로 검색 및 표시
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      domainFilter: document.getElementById("domain-filter"),
      sortOption: document.getElementById("sort-option"),
    };

    handleSearch(elements);
  } catch (error) {
    console.error("❌ 개념 데이터 가져오기 오류:", error);
    throw error;
  }
}

// 개념 상세 보기 모달 열기 함수 (전역 함수, ID 조회 개선)
window.openConceptViewModal = async function (conceptId) {
  try {
    // 사용자 언어 설정 업데이트 (AI 단어장과 동일하게)
    try {
      if (typeof getActiveLanguage === "function") {
        userLanguage = await getActiveLanguage();
      } else {
        console.warn(
          "getActiveLanguage 함수를 찾을 수 없습니다. 기본값을 사용합니다."
        );
        userLanguage = "ko";
      }
    } catch (error) {
      console.error("언어 설정 로드 실패:", error);
      userLanguage = "ko"; // 기본값
    }

    // conceptUtils가 정의되어 있는지 확인
    if (!conceptUtils) {
      throw new Error("conceptUtils가 정의되지 않았습니다.");
    }

    // 현재 선택된 언어 설정 가져오기
    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    // 먼저 메모리에서 개념 찾기 (빠른 검색)
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    // 메모리에서 찾지 못했으면 Firebase에서 조회
    if (!conceptData) {
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
      } catch (error) {
        console.error("Firebase 조회 실패:", error);

        // ID가 word 조합 형태인 경우 메모리에서 다시 검색
        if (conceptId.includes("_")) {
          const [sourceWord, targetWord] = conceptId.split("_");
          conceptData = allConcepts.find((concept) => {
            const srcExpr = concept.expressions?.[sourceLanguage];
            const tgtExpr = concept.expressions?.[targetLanguage];
            return srcExpr?.word === sourceWord && tgtExpr?.word === targetWord;
          });
        }
      }
    }

    if (!conceptData) {
      console.error("개념을 찾을 수 없습니다. conceptId:", conceptId);
      alert("개념 정보를 찾을 수 없습니다.");
      return;
    }

    const modal = document.getElementById("concept-view-modal");
    if (!modal) {
      throw new Error("concept-view-modal 요소를 찾을 수 없습니다.");
    }

    console.log("모달 콘텐츠 채우기 시작...");
    // 모달 콘텐츠 채우기 (언어 설정 전달)
    fillConceptViewModal(conceptData, sourceLanguage, targetLanguage);

    console.log("모달 표시...");
    // 모달 표시 (CSS 우선순위 문제 해결)
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // 강제로 표시
    console.log("🔍 모달 표시 후 상태:", {
      classList: Array.from(modal.classList),
      display: getComputedStyle(modal).display,
      visibility: getComputedStyle(modal).visibility,
    });

    // 모달이 표시된 후에 예문 로드
    console.log("📖 모달 표시 완료, 예문 로드 시작...");
    await loadAndDisplayExamples(
      conceptData.id,
      sourceLanguage,
      targetLanguage
    );

    console.log("모달 열기 완료");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    console.error("Error stack:", error.stack);
    alert("개념 정보를 불러올 수 없습니다: " + error.message);
  }
};

// 개념 상세 보기 모달 채우기 (분리된 컬렉션 지원)
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  if (!conceptData) {
    console.error("개념 데이터가 없습니다");
    return;
  }

  console.log("모달 채우기:", conceptData);

  // 기본 정보 설정
  const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
  const targetExpression = conceptData.expressions?.[targetLanguage] || {};

  // 제목과 기본 정보
  const titleElement = document.getElementById("concept-view-title");
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );

  if (titleElement) {
    titleElement.textContent = targetExpression.word || "N/A";
  }
  if (pronunciationElement) {
    pronunciationElement.textContent =
      targetExpression.pronunciation || targetExpression.romanization || "";
  }

  // 개념 정보
  const conceptInfo = conceptData.concept_info || {};

  // 도메인/카테고리 표시
  const domainCategoryElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (domainCategoryElement) {
    const domain = conceptInfo.domain || conceptData.domain || "기타";
    const category = conceptInfo.category || conceptData.category || "일반";
    domainCategoryElement.textContent = getTranslatedDomainCategory(
      domain,
      category
    );
  }

  // 이모지와 색상 (개념 카드와 동일한 우선순위 적용)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "📝";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  const emojiElement = document.getElementById("concept-view-emoji");

  // 요소를 찾을 수 없을 때 지연 후 재시도
  if (!emojiElement) {
    setTimeout(() => {
      const delayedEmojiElement = document.getElementById("concept-view-emoji");
      if (delayedEmojiElement && emoji) {
        delayedEmojiElement.textContent = emoji;
      }
    }, 100);
  }

  if (emojiElement && emoji) {
    emojiElement.textContent = emoji;
  }

  const headerElement = document.querySelector(".concept-view-header");
  if (headerElement) {
    headerElement.style.borderLeftColor = colorTheme;
  }

  // 날짜 정보 (분리된 컬렉션 메타데이터 우선)
  const createdDate =
    conceptData.metadata?.created_at ||
    conceptData.created_at ||
    conceptData.timestamp;

  const dateElement = document.getElementById("concept-updated-at");
  if (dateElement && createdDate) {
    dateElement.textContent = formatDate(createdDate);
  }

  // 언어별 표현 채우기
  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);

  // 모달 버튼 설정
  setupModalButtons(conceptData);

  // 모달 내 다국어 번역 적용 - AI 단어장과 동일한 data-i18n 방식 사용
  setTimeout(() => {
    const modal = document.getElementById("concept-view-modal");

    if (modal) {
      // 모달 내부의 data-i18n 요소들 번역 (AI 단어장과 동일한 방식)
      modal.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        const translatedText = getTranslatedText(key);

        if (translatedText) {
          element.textContent = translatedText;
        }
      });
    }
  }, 100);
}

// 분리된 컬렉션에서 예문 로드 및 표시
async function loadAndDisplayExamples(
  conceptId,
  sourceLanguage,
  targetLanguage
) {
  try {
    // 보기 모달 내부의 examples-container만 찾기
    const viewModal = document.getElementById("concept-view-modal");
    const examplesContainer = viewModal
      ? viewModal.querySelector("#examples-container")
      : null;
    if (!examplesContainer) {
      console.error("❌ 보기 모달 내 examples-container를 찾을 수 없습니다");
      return;
    }

    let examplesHTML = "";
    const allExamples = [];

    // 1. 현재 개념에서 representative_example만 사용 (중복 방지)
    const currentConcept = allConcepts.find(
      (c) => c.id === conceptId || c._id === conceptId
    );

    if (currentConcept?.representative_example) {
      console.log("대표 예문 발견:", currentConcept.representative_example);

      const repExample = currentConcept.representative_example;

      // 새로운 구조: 직접 언어별 텍스트 (translations 없음)
      if (repExample[sourceLanguage] && repExample[targetLanguage]) {
        console.log("🔍 새로운 대표 예문 구조 (직접 언어별):", repExample);

        const sourceText = repExample[sourceLanguage];
        const targetText = repExample[targetLanguage];

        console.log("📝 추출된 예문 (새 구조):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "대표 예문",
            isRepresentative: true,
          });
          console.log("✅ 대표 예문을 allExamples에 추가함 (새 구조)");
        }
      }
      // 기존 구조: translations 객체 포함
      else if (repExample.translations) {
        console.log(
          "🔍 기존 대표 예문 구조 (translations):",
          repExample.translations
        );
        console.log(
          "🔍 sourceLanguage:",
          sourceLanguage,
          "targetLanguage:",
          targetLanguage
        );

        const sourceText =
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "";
        const targetText =
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "";

        console.log("📝 추출된 예문 (기존 구조):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "대표 예문",
            isRepresentative: true,
          });
          console.log("✅ 대표 예문을 allExamples에 추가함 (기존 구조)");
        } else {
          console.log("⚠️ sourceText 또는 targetText가 비어있음 (기존 구조)");
        }
      } else {
        console.log("⚠️ 지원되지 않는 대표 예문 구조:", repExample);
      }
    }

    // 3. 대표 예문이 없는 경우에만 기존 구조에서 예문 확인 (하위 호환성)
    if (allExamples.length === 0 && currentConcept) {
      // featured_examples 확인
      if (
        currentConcept.featured_examples &&
        currentConcept.featured_examples.length > 0
      ) {
        currentConcept.featured_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "추천",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }

      // core_examples 확인 (featured_examples가 없는 경우에만)
      if (
        allExamples.length === 0 &&
        currentConcept.core_examples &&
        currentConcept.core_examples.length > 0
      ) {
        currentConcept.core_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "핵심",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }
    }

    // priority가 높은 순으로 정렬
    allExamples.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 상위 3개만 표시 (중복 방지)
    allExamples.slice(0, 3).forEach((example) => {
      // 배지 제거 - 깔끔하게 예문만 표시
      examplesHTML += `
        <div class="bg-gray-50 p-3 rounded-lg mb-3">
          <p class="text-gray-800 mb-1">${example.targetText}</p>
          <p class="text-gray-600 text-sm">${example.sourceText}</p>
        </div>
      `;
    });

    if (examplesHTML) {
      examplesContainer.innerHTML = examplesHTML;
    } else {
      examplesContainer.innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-quote-left text-2xl mb-2"></i>
          <p>등록된 예문이 없습니다.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("예문 로드 중 오류:", error);
    console.error("오류 스택:", error.stack);
    const examplesContainer = document.getElementById("examples-container");
    if (examplesContainer) {
      examplesContainer.innerHTML = `
        <div class="text-center text-red-500 py-4">
          <p>예문을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      `;
    } else {
      console.error("❌ catch 블록에서도 examples-container를 찾을 수 없음");
    }
  }
}

// 언어별 표현 정보 채우기 함수 (확장된 구조 지원)
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  const tabContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (!tabContainer || !contentContainer) {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabContainer,
      contentContainer,
    });
    return;
  }

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // 언어탭 순서: 대상언어 → 원본언어 → 나머지 언어들
  const orderedLanguages = [];

  // 1. 대상언어 먼저 추가 (있는 경우)
  if (targetLanguage && conceptData.expressions?.[targetLanguage]?.word) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
  if (
    sourceLanguage &&
    conceptData.expressions?.[sourceLanguage]?.word &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. 나머지 언어들 추가 (원본언어, 대상언어 제외)
  Object.keys(conceptData.expressions || {}).forEach((langCode) => {
    if (
      !orderedLanguages.includes(langCode) &&
      conceptData.expressions[langCode]?.word
    ) {
      orderedLanguages.push(langCode);
    }
  });

  if (orderedLanguages.length === 0) {
    console.error("표시할 언어가 없습니다.");
    return;
  }

  // 각 언어별 탭과 컨텐츠 생성
  orderedLanguages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
    const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
    const langInfo = supportedLanguages[langCode] || {
      nameKo: langCode,
      code: langCode,
    };

    // 탭 생성
    const tab = document.createElement("button");
    tab.id = `view-${langCode}-tab`;
    tab.className = `px-4 py-2 border-b-2 ${
      index === 0
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
    tab.textContent = getLanguageName(langCode);
    tab.onclick = () => switchViewTab(langCode);

    tabContainer.appendChild(tab);

    // 컨텐츠 패널 생성 (간소화)
    const panel = document.createElement("div");
    panel.id = `view-${langCode}-content`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4`;

    contentContainer.appendChild(panel);

    // 모든 언어탭의 내용을 미리 생성
    updateLanguageContent(langCode, conceptData, sourceLanguage);
  });

  // 탭 전환 함수 정의
  window.switchViewTab = (langCode) => {
    // 모든 탭 비활성화
    document.querySelectorAll("[id^='view-'][id$='-tab']").forEach((tab) => {
      tab.className =
        "px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700";
    });

    // 모든 컨텐츠 패널 숨기기
    document
      .querySelectorAll("[id^='view-'][id$='-content']")
      .forEach((content) => {
        content.classList.add("hidden");
      });

    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`view-${langCode}-tab`);
    if (selectedTab) {
      selectedTab.className =
        "px-4 py-2 border-b-2 border-blue-500 text-blue-600";
    }

    // 선택된 컨텐츠 표시
    const selectedContent = document.getElementById(`view-${langCode}-content`);
    if (selectedContent) {
      selectedContent.classList.remove("hidden");

      // 내용이 비어있는 경우 생성 (안전장치)
      if (selectedContent.innerHTML.trim() === "") {
        console.log(
          `🔧 [안전장치] ${langCode} 탭 내용이 비어있어서 생성 중...`
        );
        updateLanguageContent(langCode, conceptData, sourceLanguage);
      }
    }

    // 모달 헤더 업데이트 (언어 탭에 따라 변경)
    const currentExpression = conceptData.expressions?.[langCode] || {};
    const titleElement = document.getElementById("concept-view-title");
    const pronunciationElement = document.getElementById(
      "concept-view-pronunciation"
    );

    // 헤더 단어는 현재 선택된 언어 탭에 따라 변경
    if (titleElement) {
      titleElement.textContent = currentExpression.word || "N/A";
    }

    // 발음 정보도 현재 언어에 맞게 업데이트
    if (pronunciationElement) {
      pronunciationElement.textContent =
        currentExpression.pronunciation ||
        currentExpression.romanization ||
        currentExpression.phonetic ||
        "";
    }

    // 언어탭 변경 시에는 내용을 다시 생성하지 않음 (이미 생성된 내용 사용)
    // updateLanguageContent는 모달 초기 로드 시에만 호출됨

    // 언어탭 변경에 따라 예문의 대상 언어도 업데이트
    console.log(
      `🔄 언어탭 변경: ${sourceLanguage} → ${langCode}, 예문 업데이트 중...`
    );
    loadAndDisplayExamples(conceptData.id, sourceLanguage, langCode);
  };

  // 시간 표시 설정
  setupConceptTimestamp(conceptData);

  // 모달 버튼 이벤트 설정 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 번역 적용)
  setTimeout(() => {
    setupModalButtons(conceptData);
  }, 100);
}

// 언어별 컨텐츠 업데이트 함수 (환경 언어 기준)
function updateLanguageContent(langCode, conceptData, sourceLanguage) {
  const panel = document.getElementById(`view-${langCode}-content`);
  if (!panel || !conceptData) return;

  const expression = conceptData.expressions?.[langCode] || {};

  // 내용 영역의 번역 단어는 환경 언어로 고정
  // userLanguage에 해당하는 언어 코드 매핑
  const userLangToCode = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };

  const envLangCode = userLangToCode[userLanguage] || "korean";
  const envExpression =
    conceptData.expressions?.[envLangCode] ||
    conceptData.expressions?.korean ||
    Object.values(conceptData.expressions || {})[0] ||
    {};
  const displayWord = envExpression.word || "N/A";

  console.log(
    `🔍 [내용 언어] userLanguage: ${userLanguage}, envLangCode: ${envLangCode}, displayWord: ${displayWord}`
  );

  // 환경 설정 언어에 따른 레이블 가져오기
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        synonyms: "유의어",
        antonyms: "반의어",
        word_family: "어족",
        compound_words: "복합어",
        collocations: "연어",
        partOfSpeech: {
          noun: "명사",
          verb: "동사",
          adjective: "형용사",
          adverb: "부사",
          pronoun: "대명사",
          preposition: "전치사",
          conjunction: "접속사",
          interjection: "감탄사",
        },
      },
      en: {
        synonyms: "Synonyms",
        antonyms: "Antonyms",
        word_family: "Word Family",
        compound_words: "Compound Words",
        collocations: "Collocations",
        partOfSpeech: {
          noun: "noun",
          verb: "verb",
          adjective: "adjective",
          adverb: "adverb",
          pronoun: "pronoun",
          preposition: "preposition",
          conjunction: "conjunction",
          interjection: "interjection",
        },
      },
      ja: {
        synonyms: "類義語",
        antonyms: "反意語",
        word_family: "語族",
        compound_words: "複合語",
        collocations: "連語",
        partOfSpeech: {
          noun: "名詞",
          verb: "動詞",
          adjective: "形容詞",
          adverb: "副詞",
          pronoun: "代名詞",
          preposition: "前置詞",
          conjunction: "接続詞",
          interjection: "感嘆詞",
        },
      },
      zh: {
        synonyms: "同义词",
        antonyms: "反义词",
        word_family: "词族",
        compound_words: "复合词",
        collocations: "搭配词",
        partOfSpeech: {
          noun: "名词",
          verb: "动词",
          adjective: "形容词",
          adverb: "副词",
          pronoun: "代词",
          preposition: "介词",
          conjunction: "连词",
          interjection: "感叹词",
        },
      },
    };
    return labels[userLang] || labels.ko;
  };

  const uiLabels = getUILabels(userLanguage);

  // 품사 번역 - 환경 언어로 고정
  const translatePartOfSpeech = (pos) => {
    if (!pos) return "";

    // 품사를 영어 표준으로 정규화
    const normalizePartOfSpeech = (partOfSpeech) => {
      const posMap = {
        // 한국어
        명사: "noun",
        동사: "verb",
        형용사: "adjective",
        부사: "adverb",
        대명사: "pronoun",
        전치사: "preposition",
        접속사: "conjunction",
        감탄사: "interjection",
        // 일본어
        名詞: "noun",
        動詞: "verb",
        形容詞: "adjective",
        副詞: "adverb",
        代名詞: "pronoun",
        前置詞: "preposition",
        接続詞: "conjunction",
        感嘆詞: "interjection",
        // 중국어
        名词: "noun",
        动词: "verb",
        形容词: "adjective",
        副词: "adverb",
        代词: "pronoun",
        介词: "preposition",
        连词: "conjunction",
        感叹词: "interjection",
        // 영어 (그대로)
        noun: "noun",
        verb: "verb",
        adjective: "adjective",
        adverb: "adverb",
        pronoun: "pronoun",
        preposition: "preposition",
        conjunction: "conjunction",
        interjection: "interjection",
      };
      return posMap[partOfSpeech] || partOfSpeech;
    };

    const normalizedPos = normalizePartOfSpeech(pos);
    const translated = uiLabels.partOfSpeech[normalizedPos] || pos;
    console.log(
      `🔍 [품사 번역] 원본: ${pos}, 정규화: ${normalizedPos}, 번역: ${translated}, 환경언어: ${userLanguage}`
    );
    return translated;
  };

  console.log(`🔍 ${langCode} 언어 표현 데이터:`, expression);

  panel.innerHTML = `
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-xl font-bold text-blue-600">${displayWord}</h3>
        ${
          expression.part_of_speech
            ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">${translatePartOfSpeech(
                expression.part_of_speech
              )}</span>`
            : ""
        }
      </div>

    </div>
    ${
      expression.definition
        ? `<div class="mb-4">
        <p class="text-sm text-gray-600">${expression.definition}</p>
      </div>`
        : ""
    }
    ${
      expression.synonyms && expression.synonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.synonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.synonyms
            .map(
              (synonym) =>
                `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${synonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.antonyms && expression.antonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.antonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.antonyms
            .map(
              (antonym) =>
                `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">${antonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.word_family && expression.word_family.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.word_family
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.word_family
            .map(
              (word) =>
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.compound_words && expression.compound_words.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.compound_words
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.compound_words
            .map(
              (word) =>
                `<span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.collocations && expression.collocations.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.collocations
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.collocations
            .map(
              (collocation) =>
                `<span class="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">${collocation}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
  `;

  // 발음 정보는 언어 탭 변경시에만 업데이트 (헤더 단어는 고정)
  if (expression.pronunciation) {
    const pronElement = document.getElementById("concept-view-pronunciation");
    if (pronElement) {
      pronElement.textContent = expression.pronunciation;
    }
  }
}

// 개념 시간 표시 설정
function setupConceptTimestamp(conceptData) {
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement && conceptData) {
    let timeText = getTranslatedText("registration_time") || "등록 시간";

    console.log("⏰ 시간 설정 시도:", conceptData);

    // 여러 가능한 시간 필드 확인
    let dateValue = null;

    if (conceptData.metadata?.created_at) {
      dateValue = conceptData.metadata.created_at;
    } else if (conceptData.metadata?.timestamp) {
      dateValue = conceptData.metadata.timestamp;
    } else if (conceptData.createdAt) {
      dateValue = conceptData.createdAt;
    } else if (conceptData.timestamp) {
      dateValue = conceptData.timestamp;
    } else if (conceptData.created_at) {
      dateValue = conceptData.created_at;
    }

    if (dateValue) {
      try {
        let date;
        if (dateValue.toDate) {
          // Firestore Timestamp
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (
          typeof dateValue === "string" ||
          typeof dateValue === "number"
        ) {
          date = new Date(dateValue);
        }

        if (date && !isNaN(date.getTime())) {
          timeText = formatDate(date);
          console.log("✅ 시간 설정 성공:", timeText);
        }
      } catch (error) {
        console.error("❌ 시간 파싱 오류:", error);
      }
    } else {
      console.log("⚠️ 시간 정보 없음, 기본값 사용");
    }

    timestampElement.textContent = timeText;
  }
}

// 모달 버튼 이벤트 설정
function setupModalButtons(conceptData) {
  // 전역 번역 시스템을 사용하여 버튼 번역 적용
  const viewModal = document.getElementById("concept-view-modal");
  if (viewModal) {
    // utils/language-utils.js의 전역 번역 시스템 사용
    if (typeof updateLanguageUI === "function") {
      updateLanguageUI(userLanguage);
    } else {
      // 전역 번역 시스템이 없는 경우 직접 번역
      const editButtonSpan = viewModal.querySelector(
        '#edit-concept-button span[data-i18n="edit"]'
      );
      const deleteButtonSpan = viewModal.querySelector(
        '#delete-concept-button span[data-i18n="delete"]'
      );
      const examplesTitle = viewModal.querySelector('h3[data-i18n="examples"]');

      // 전역 번역 객체에서 직접 가져오기
      if (typeof translations !== "undefined" && translations[userLanguage]) {
        if (editButtonSpan) {
          editButtonSpan.textContent =
            translations[userLanguage].edit || "편집";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            translations[userLanguage].delete || "삭제";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            translations[userLanguage].examples || "예문";
        }
      } else {
        // 마지막 fallback
        if (editButtonSpan) {
          editButtonSpan.textContent =
            userLanguage === "ko"
              ? "편집"
              : userLanguage === "en"
              ? "Edit"
              : userLanguage === "ja"
              ? "編集"
              : userLanguage === "zh"
              ? "编辑"
              : "편집";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            userLanguage === "ko"
              ? "삭제"
              : userLanguage === "en"
              ? "Delete"
              : userLanguage === "ja"
              ? "削除"
              : userLanguage === "zh"
              ? "删除"
              : "삭제";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            userLanguage === "ko"
              ? "예문"
              : userLanguage === "en"
              ? "Examples"
              : userLanguage === "ja"
              ? "例文"
              : userLanguage === "zh"
              ? "例句"
              : "예문";
        }
      }
    }

    console.log("✅ 모달 버튼 번역 완료:", {
      userLanguage: userLanguage,
      editText: viewModal.querySelector("#edit-concept-button span")
        ?.textContent,
      deleteText: viewModal.querySelector("#delete-concept-button span")
        ?.textContent,
    });
  }

  // 편집 버튼 이벤트
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 개념 수정 모달 열기
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) {
        viewModal.classList.add("hidden");
        viewModal.style.display = "none"; // 강제로 숨기기
      }

      const conceptId =
        conceptData.concept_id || conceptData.id || conceptData._id;
      console.log("🔧 편집 버튼 클릭, conceptId:", conceptId);

      // 약간의 지연 후 편집 모달 열기 (DOM 업데이트 대기)
      setTimeout(() => {
        if (window.openEditConceptModal) {
          window.openEditConceptModal(conceptId);
        } else {
          console.error("❌ openEditConceptModal 함수가 정의되지 않았습니다.");
        }
      }, 100);
    };
  }

  // 삭제 버튼 이벤트
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (
        confirm(
          getTranslatedText("confirm_delete_concept") ||
            "정말로 이 개념을 삭제하시겠습니까?"
        )
      ) {
        try {
          await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
          alert(
            getTranslatedText("concept_deleted_success") ||
              "개념이 성공적으로 삭제되었습니다."
          );

          // 모달 닫기
          const viewModal = document.getElementById("concept-view-modal");
          if (viewModal) {
            viewModal.classList.add("hidden");
            viewModal.style.display = "none";
            console.log("✅ 삭제 후 모달 닫기 완료");
          }

          // 목록 새로고침
          window.dispatchEvent(new CustomEvent("concept-saved"));
        } catch (error) {
          console.error("개념 삭제 중 오류 발생:", error);
          alert(
            (getTranslatedText("concept_delete_error") ||
              "개념 삭제 중 오류가 발생했습니다") +
              ": " +
              error.message
          );
        }
      }
    };
  }

  // 모달 닫기 버튼 이벤트 (여러 방법으로 설정)
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    // 기존 이벤트 리스너 제거
    closeButton.onclick = null;

    // 새로운 이벤트 리스너 추가
    const closeModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById("concept-view-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none"; // 강제로 숨기기
        console.log("✅ 모달 닫기 완료");
      }
    };

    closeButton.addEventListener("click", closeModal);
    closeButton.onclick = closeModal; // 백업용
    console.log("✅ 모달 닫기 버튼 이벤트 설정 완료");
  } else {
    console.error("❌ close-concept-view-modal 버튼을 찾을 수 없습니다");
  }

  // 모달 배경 클릭으로도 닫기
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
        console.log("✅ 모달 배경 클릭으로 닫기");
      }
    });
  }
}

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🚀 DOMContentLoaded 이벤트 시작");

    // 사용자 언어 설정 초기화
    try {
      await initializeUserLanguage();
    } catch (error) {
      console.error("언어 초기화 실패, 기본값 사용:", error);
      userLanguage = "ko";
    }

    await loadNavbar();

    // 도메인 필터 언어 초기화는 vocabulary-filter-shared.js에서 처리됨
    if (window.initializeVocabularyFilterLanguage) {
      window.initializeVocabularyFilterLanguage();
    }

    // 네비게이션바 로드
    console.log("📋 네비게이션바 로드 시작");
    const navbarContainer = document.getElementById("navbar-container");
    console.log("📋 네비게이션 바 컨테이너:", navbarContainer);

    if (!navbarContainer) {
      console.error("❌ navbar-container를 찾을 수 없습니다!");
      throw new Error("navbar-container 요소가 없습니다.");
    }

    await loadNavbar(navbarContainer);
    console.log("✅ 네비게이션바 로드 완료");

    // 네비게이션바가 실제로 로드되었는지 확인
    setTimeout(() => {
      const loadedNavbar = document.querySelector("#navbar-container nav");
      console.log("🔍 로드된 네비게이션바:", loadedNavbar);
      if (!loadedNavbar) {
        console.error("❌ 네비게이션바가 제대로 로드되지 않았습니다!");
      }
    }, 1000);

    // 모달 초기화
    console.log("🔧 모달 초기화 시작");

    // 현재 경로에 따라 모달 경로 결정
    const currentPath = window.location.pathname;
    const modalBasePath = currentPath.includes("/locales/")
      ? "../../components/"
      : "../components/";

    await loadModals([
      `${modalBasePath}add-concept-modal.html`,
      `${modalBasePath}edit-concept-modal.html`,
      `${modalBasePath}concept-view-modal.html`,
      `${modalBasePath}bulk-import-modal.html`,
    ]);
    console.log("✅ 모달 초기화 완료");

    // 모달 컴포넌트 초기화
    console.log("⚙️ 모달 컴포넌트 초기화 시작");
    await initializeConceptModal();
    initializeBulkImportModal();
    console.log("✅ 모달 컴포넌트 초기화 완료");

    // 이벤트 리스너 설정
    console.log("🔗 이벤트 리스너 설정 시작");
    setupEventListeners();
    console.log("✅ 이벤트 리스너 설정 완료");

    // 메타데이터 업데이트
    console.log("📄 메타데이터 업데이트 시작");
    await updateMetadata("dictionary");
    console.log("✅ 메타데이터 업데이트 완료");

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("👤 사용자 로그인 확인:", user.email);
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
        await loadUserBookmarks(); // 북마크 로드 추가
      } else {
        alert(getTranslatedText("login_required"));
        window.location.href = "../login.html";
      }
    });

    // 네비게이션 바가 동적으로 로드된 후 번역 적용
    if (navbarContainer) {
      // 네비게이션 바가 로드된 후 번역 적용
      setTimeout(() => {
        if (typeof window.applyLanguage === "function") {
          window.applyLanguage();
        }
      }, 100);
    }

    // 언어 변경 이벤트 발생 시 번역 적용
    window.addEventListener("languageChanged", () => {
      if (typeof window.applyLanguage === "function") {
        window.applyLanguage();
      }
    });
  } catch (error) {
    console.error("❌ 다국어 단어장 페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다.", error.message);
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  console.log("🔧 setupEventListeners 함수 시작");

  const elements = {
    searchInput: document.getElementById("search-input"),
    sourceLanguage: document.getElementById("source-language"),
    targetLanguage: document.getElementById("target-language"),
    domainFilter: document.getElementById("domain-filter"),
    sortOption: document.getElementById("sort-option"),
    swapButton: document.getElementById("swap-languages"),
    loadMoreButton: document.getElementById("load-more"),
    addConceptButton: document.getElementById("add-concept"),
    bulkAddButton: document.getElementById("bulk-add-concept"),
  };

  // 모든 요소가 제대로 찾아졌는지 확인
  console.log("🔍 Found elements:", {
    addConceptButton: !!elements.addConceptButton,
    bulkAddButton: !!elements.bulkAddButton,
    searchInput: !!elements.searchInput,
    sourceLanguage: !!elements.sourceLanguage,
    targetLanguage: !!elements.targetLanguage,
    domainFilter: !!elements.domainFilter,
    sortOption: !!elements.sortOption,
    swapButton: !!elements.swapButton,
    loadMoreButton: !!elements.loadMoreButton,
  });

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    handleSearch(elements);
  });

  // 언어 변경 이벤트 (데이터 다시 로드 필요)
  [elements.sourceLanguage, elements.targetLanguage].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => {
        fetchAndDisplayConcepts();
      });
    }
  });

  // 언어 순서 바꾸기 이벤트 (공유 모듈 사용)
  if (elements.swapButton) {
    elements.swapButton.addEventListener("click", () => {
      filterManager.swapLanguages();
      handleSearch(elements);
    });
  }

  // 더 보기 버튼 이벤트
  if (elements.loadMoreButton) {
    elements.loadMoreButton.addEventListener("click", handleLoadMore);
  }

  // 새 개념 추가 버튼 이벤트
  if (elements.addConceptButton) {
    console.log("➕ 새 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.addConceptButton.addEventListener("click", () => {
      console.log("🖱️ 새 개념 추가 버튼 클릭됨");
      if (window.openConceptModal) {
        console.log("✅ openConceptModal 함수 호출");
        window.openConceptModal();
      } else {
        console.error("❌ openConceptModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 새 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 대량 개념 추가 버튼 이벤트
  if (elements.bulkAddButton) {
    console.log("📦 대량 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.bulkAddButton.addEventListener("click", () => {
      console.log("🖱️ 대량 개념 추가 버튼 클릭됨");
      if (window.openBulkImportModal) {
        console.log("✅ openBulkImportModal 함수 호출");
        window.openBulkImportModal();
      } else {
        console.error("❌ openBulkImportModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 대량 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ bulk-add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 개념 저장 이벤트 리스너 (모달에서 호출)
  window.addEventListener("concept-saved", () => {
    console.log("💾 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 개념 삭제 이벤트 리스너
  window.addEventListener("concept-deleted", () => {
    console.log("🗑️ 개념 삭제 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 대량 개념 추가 이벤트 리스너
  window.addEventListener("concepts-bulk-saved", () => {
    console.log("📦 대량 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 언어 변경 이벤트 리스너 추가 (새로고침 없이 개념 카드 업데이트)
  window.addEventListener("languageChanged", async () => {
    console.log("🌐 언어 변경 이벤트 수신 - 개념 카드 업데이트");
    // 현재 표시된 개념들을 다시 렌더링
    displayConceptList();
  });

  console.log("✅ setupEventListeners 함수 완료");
}

// 오류 표시 함수
function showError(message, details = "") {
  console.error("오류:", message, details);
  alert(
    `${getTranslatedText("error_title")} ${message} ${
      details ? `\n${getTranslatedText("error_details")} ${details}` : ""
    }`
  );
}

// 북마크 관련 함수들
let userBookmarks = [];

// 사용자 북마크 로드
async function loadUserBookmarks() {
  if (!auth.currentUser) return;

  try {
    const userEmail = auth.currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);
    const bookmarkDoc = await getDoc(bookmarksRef);

    if (bookmarkDoc.exists()) {
      userBookmarks = bookmarkDoc.data().concept_ids || [];
    } else {
      userBookmarks = [];
    }

    // 북마크 상태 업데이트
    updateBookmarkUI();
  } catch (error) {
    console.error("북마크 로드 오류:", error);
  }
}

// 북마크 토글
async function toggleBookmark(conceptId) {
  if (!auth.currentUser) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const userEmail = auth.currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);

    let updatedBookmarks;
    const isBookmarked = userBookmarks.includes(conceptId);

    if (isBookmarked) {
      // 북마크 제거
      updatedBookmarks = userBookmarks.filter((id) => id !== conceptId);
      showMessage("북마크가 제거되었습니다.", "success");
    } else {
      // 북마크 추가
      updatedBookmarks = [...userBookmarks, conceptId];
      showMessage("북마크가 추가되었습니다.", "success");
    }

    // Firestore 업데이트
    await setDoc(bookmarksRef, {
      user_email: userEmail,
      concept_ids: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    // 로컬 상태 업데이트
    userBookmarks = updatedBookmarks;
    updateBookmarkUI();
  } catch (error) {
    console.error("북마크 토글 오류:", error);
    showError("북마크 처리 중 오류가 발생했습니다.");
  }
}

// 북마크 UI 업데이트
function updateBookmarkUI() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");

  bookmarkButtons.forEach((btn) => {
    const conceptId = btn.getAttribute("data-concept-id");
    const icon = btn.querySelector("i");

    if (userBookmarks.includes(conceptId)) {
      icon.className = "fas fa-bookmark text-yellow-500";
      btn.title = "북마크 해제";
    } else {
      icon.className = "fas fa-bookmark text-gray-400";
      btn.title = "북마크";
    }
  });
}

// 성공 메시지 표시
function showMessage(message, type = "info") {
  const messageContainer = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  messageContainer.className = `fixed top-4 right-4 ${bgColor} px-4 py-3 rounded z-50 border`;
  messageContainer.innerHTML = `
    ${message}
    <button onclick="this.parentElement.remove()" class="ml-2 font-bold">×</button>
  `;

  document.body.appendChild(messageContainer);

  setTimeout(() => {
    if (messageContainer.parentElement) {
      messageContainer.remove();
    }
  }, 3000);
}

// 전역 함수로 만들어서 HTML에서 호출 가능하게 함
window.toggleBookmark = toggleBookmark;

// 도메인 및 정렬 필터는 HTML에서 직접 정의됨 (중복 제거)

// 도메인 필터 언어 업데이트는 vocabulary-filter-shared.js에서 처리됨

// getLanguageName 함수 추가 (my-word-list.js에서 복사)
function getLanguageName(langCode) {
  const languageNames = {
    korean:
      userLanguage === "ko"
        ? "한국어"
        : userLanguage === "en"
        ? "Korean"
        : userLanguage === "ja"
        ? "韓国語"
        : "韩语",
    english:
      userLanguage === "ko"
        ? "영어"
        : userLanguage === "en"
        ? "English"
        : userLanguage === "ja"
        ? "英語"
        : "英语",
    japanese:
      userLanguage === "ko"
        ? "일본어"
        : userLanguage === "en"
        ? "Japanese"
        : userLanguage === "ja"
        ? "日本語"
        : "日语",
    chinese:
      userLanguage === "ko"
        ? "중국어"
        : userLanguage === "en"
        ? "Chinese"
        : userLanguage === "ja"
        ? "中国語"
        : "中文",
  };
  return languageNames[langCode] || langCode;
}

// 카드 생성 시 도메인/카테고리 번역 동적 처리 함수
function getTranslatedDomainCategory(domain, category) {
  const lang =
    typeof getCurrentUILanguage === "function" ? getCurrentUILanguage() : "ko";
  const translations =
    window.translations && window.translations[lang]
      ? window.translations[lang]
      : {};
  const domainText = translations[`domain_${domain}`] || domain;
  const categoryText = translations[`category_${category}`] || category;
  return `${domainText} > ${categoryText}`;
}
