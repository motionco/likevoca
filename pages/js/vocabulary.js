import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../utils/firebase/firebase-init.js";
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
import { initializeEditModal } from "../../components/js/edit-concept-modal.js";
import {
  initializeConceptViewModal,
  showConceptViewModal,
  setCurrentUser,
  setUserLanguage,
} from "../../components/js/concept-view-modal.js";
import { getTranslatedDomainCategory } from "../../components/js/concept-modal-shared.js";
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

// 전역 변수
let allConcepts = [];
let filteredConcepts = [];
let userLanguage = "ko"; // 기본값
let currentPage = 1;
let conceptsPerPage = 12;
let userBookmarks = [];
let currentUser = null; // 현재 로그인된 사용자
let displayCount = 12; // 표시할 개념 수
let lastVisibleConcept = null;
let firstVisibleConcept = null;

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;

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

// 언어 이름 번역 함수 (간단 버전)
function getTranslatedLanguageName(langCode, currentLang = "ko") {
  const languageNames = {
    ko: {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
    },
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
    },
  };

  return languageNames[currentLang]?.[langCode] || langCode;
}

// 개념 카드 생성 함수 (디버깅 개선)
function createConceptCard(concept) {
  if (!concept || !concept.expressions) {
    console.warn("개념 데이터가 유효하지 않습니다:", concept);
    return "";
  }

  // 언어 설정 가져오기
  const sourceLanguage =
    document.getElementById("source-language")?.value || "korean";
  const targetLanguage =
    document.getElementById("target-language")?.value || "english";

  console.log("카드 생성 - 언어 설정:", {
    sourceLanguage,
    targetLanguage,
  });

  // 개념 정보 추출 (메타데이터 우선, 기본 데이터 fallback)
  const conceptInfo = concept.metadata || concept;

  // 이모지 추출 (여러 소스 확인)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    concept.unicode_emoji ||
    concept.emoji ||
    "📝";

  // 색상 테마 설정
  const domain = conceptInfo.domain || "other";
  const colorTheme = getDomainColor(domain);

  // 언어별 표현 추출
  const sourceExpression = concept.expressions[sourceLanguage] || {};
  const targetExpression = concept.expressions[targetLanguage] || {};

  console.log("✅ 카드: 새로운 대표 예문 구조 사용");

  // 예시 문장 추출
  let example = null;
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 직접 언어별 스키마 사용
    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      example = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
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
    }
  }

  // 개념 ID 생성
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.text || sourceExpression.word}_${
      targetExpression.text || targetExpression.word
    }`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer concept-card"
      onclick="showConceptViewModal(window.allConcepts.find(c => c.id === '${conceptId}' || c._id === '${conceptId}'), '${sourceLanguage}', '${targetLanguage}')"
      style="border-left: 4px solid ${colorTheme}"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">${emoji}</span>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              ${
                targetExpression.text ||
                targetExpression.word ||
                targetExpression.expression ||
                "N/A"
              }
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
              conceptInfo.domain || "other",
              conceptInfo.category || "general",
              localStorage.getItem("preferredLanguage") || userLanguage || "ko"
            )}
          </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${
            sourceExpression.text ||
            sourceExpression.word ||
            sourceExpression.expression ||
            "N/A"
          }</span>
        </div>
        <p class="text-sm text-gray-600 mt-1 line-clamp-2" title="${
          targetExpression.meaning || targetExpression.definition || ""
        }">${targetExpression.meaning || targetExpression.definition || ""}</p>
      </div>
      
      ${
        example && (example.source || example.target)
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-sm text-gray-700 font-medium truncate" title="${example.target}">${example.target}</p>
        <p class="text-sm text-gray-500 italic truncate" title="${example.source}">${example.source}</p>
      </div>
      `
          : ""
      }
      
      <div class="flex justify-between text-xs text-gray-500 mt-3">
        <span class="flex items-center">
          <i class="fas fa-language mr-1"></i> ${getTranslatedLanguageName(
            sourceLanguage,
            userLanguage
          )} → ${getTranslatedLanguageName(targetLanguage, userLanguage)}
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

// 도메인별 색상 테마 가져오기
function getDomainColor(domain) {
  const colorMap = {
    daily: "#4B63AC",
    food: "#FF6B6B",
    travel: "#4ECDC4",
    business: "#45B7D1",
    education: "#96CEB4",
    nature: "#FECA57",
    technology: "#9C27B0",
    health: "#FF9FF3",
    sports: "#54A0FF",
    entertainment: "#5F27CD",
    culture: "#00D2D3",
    other: "#747D8C",
  };
  return colorMap[domain] || "#747D8C";
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

  // HTML 삽입 (그리드 레이아웃 적용)
  conceptList.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cardHTMLs.join("")}
    </div>
  `;

  // 북마크 UI 업데이트
  updateBookmarkUI();

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// 북마크 데이터 로드
async function loadUserBookmarks() {
  try {
    if (!currentUser) {
      console.log("❌ 사용자가 로그인되지 않음");
      userBookmarks = [];
      return;
    }

    const userEmail = currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);
    const bookmarkDoc = await getDoc(bookmarksRef);

    if (bookmarkDoc.exists()) {
      const bookmarkData = bookmarkDoc.data();
      userBookmarks = bookmarkData.concept_ids || [];
      console.log("📋 북마크 로드 완료:", userBookmarks.length);
    } else {
      userBookmarks = [];
      console.log("📋 북마크 문서가 없어서 빈 배열로 초기화");
    }
  } catch (error) {
    console.error("❌ 북마크 로드 실패:", error);
    userBookmarks = [];
  }
}

// 북마크 토글 함수
async function toggleBookmark(conceptId) {
  try {
    if (!currentUser) {
      alert("북마크 기능을 사용하려면 로그인이 필요합니다.");
      return;
    }

    const userEmail = currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);

    // 현재 북마크 상태 확인
    const isBookmarked = userBookmarks.includes(conceptId);

    if (isBookmarked) {
      // 북마크 제거
      userBookmarks = userBookmarks.filter((id) => id !== conceptId);
      console.log("📌 북마크 제거:", conceptId);
    } else {
      // 북마크 추가
      userBookmarks.push(conceptId);
      console.log("📌 북마크 추가:", conceptId);
    }

    // Firestore 업데이트
    await setDoc(
      bookmarksRef,
      {
        concept_ids: userBookmarks,
        updated_at: Timestamp.now(),
      },
      { merge: true }
    );

    // UI 업데이트
    updateBookmarkUI();

    console.log("✅ 북마크 업데이트 완료");
  } catch (error) {
    console.error("❌ 북마크 토글 실패:", error);
    alert("북마크 업데이트 중 오류가 발생했습니다.");
  }
}

// 북마크 UI 업데이트 (실제 구현)
function updateBookmarkUI() {
  console.log("📋 북마크 UI 업데이트 시작");

  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
  bookmarkButtons.forEach((btn) => {
    const conceptId = btn.getAttribute("onclick")?.match(/'([^']+)'/)?.[1];
    const icon = btn.querySelector("i");

    if (icon && conceptId) {
      if (userBookmarks.includes(conceptId)) {
        // 북마크된 상태
        icon.className = "fas fa-bookmark text-yellow-500";
        btn.title = "북마크 제거";
      } else {
        // 북마크되지 않은 상태
        icon.className = "fas fa-bookmark text-gray-400";
        btn.title = "북마크 추가";
      }
    }
  });

  console.log("✅ 북마크 UI 업데이트 완료");
}

// 전역 함수로 노출
window.toggleBookmark = toggleBookmark;

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
  console.log("🔧 updateUsageUI 함수 시작");
  try {
    if (!currentUser) {
      console.log("❌ 현재 사용자가 없음, updateUsageUI 종료");
      return;
    }

    console.log("👤 현재 사용자:", currentUser.email);

    // conceptUtils.getUsage를 사용하여 DB에서 실제 값 가져오기
    const usage = await conceptUtils.getUsage(currentUser.email);
    console.log("🔍 단어장 사용량 정보:", usage);

    const conceptCount = usage.conceptCount || 0;
    const maxConcepts = usage.maxWordCount || 50; // DB에서 가져온 실제 값 사용

    // UI 업데이트 (실제 HTML ID 사용)
    const usageText = document.getElementById("usage-text");
    const usageBar = document.getElementById("usage-bar");

    console.log("🔍 UI 요소 확인:", {
      usageText: !!usageText,
      usageBar: !!usageBar,
      conceptCount,
      maxConcepts,
    });

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
      console.log(
        "📊 단어장 사용량 UI 업데이트:",
        `${conceptCount}/${maxConcepts}`
      );
    } else {
      console.error("❌ usage-text 요소를 찾을 수 없음");
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
      console.log(
        "🎨 사용량 바 업데이트 완료:",
        `${usagePercentage.toFixed(1)}%`
      );
    } else {
      console.error("❌ usage-bar 요소를 찾을 수 없음");
    }

    console.log("✅ updateUsageUI 함수 완료");
  } catch (error) {
    console.error("❌ updateUsageUI 사용량 업데이트 중 오류 발생:", error);
  }
}

// 개념 데이터 가져오기 (ID 포함 및 디버깅 개선)
async function fetchAndDisplayConcepts() {
  try {
    console.log("📚 개념 데이터 로드 시작...", {
      currentUser: !!currentUser,
      userEmail: currentUser?.email || "비로그인",
    });

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
      swapButton: document.getElementById("swap-languages"),
      loadMoreButton: document.getElementById("load-more"),
      addConceptButton: document.getElementById("add-concept-btn"),
      bulkAddButton: document.getElementById("bulk-add-btn"),
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

// 언어 변경 이벤트 리스너 설정
function setupLanguageChangeListener() {
  // 언어 변경 이벤트 감지
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 단어장: 언어 변경 감지", event.detail.language);

    // 개념 카드들을 다시 렌더링
    if (filteredConcepts && filteredConcepts.length > 0) {
      displayConceptList();
    }

    // 필터 UI도 업데이트
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }
  });

  console.log("✅ 단어장: 언어 변경 리스너 설정 완료");
}

// 페이지 로드 시 언어 변경 리스너 설정
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLanguageChangeListener);
} else {
  setupLanguageChangeListener();
}

// 전역 렌더링 함수들 (언어 동기화에서 사용)
window.renderConceptCards = function () {
  console.log("🔄 단어장: 개념 카드 다시 렌더링");
  console.log("📊 현재 상태:", {
    allConcepts: allConcepts?.length || 0,
    filteredConcepts: filteredConcepts?.length || 0,
  });

  // 필터링된 개념이 없으면 전체 개념으로 다시 설정
  if (!filteredConcepts || filteredConcepts.length === 0) {
    console.log("⚠️ 필터링된 개념이 없음, 전체 개념 사용");
    filteredConcepts = [...allConcepts];
  }

  if (filteredConcepts && filteredConcepts.length > 0) {
    displayConceptList();
  } else {
    console.warn("⚠️ 표시할 개념이 없습니다");
  }
};

window.updateFilterUI = function () {
  console.log("🔄 단어장: 필터 UI 업데이트");
  if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
    window.updateDomainCategoryEmojiLanguage();
  }
};

// 관리자 권한 체크 함수
async function checkAdminPermission() {
  if (!auth.currentUser) {
    showMessage("이 기능을 사용하려면 로그인이 필요합니다.", "info");

    // 현재 언어 감지
    const currentLanguage =
      (typeof getCurrentUILanguage === "function"
        ? getCurrentUILanguage()
        : null) ||
      localStorage.getItem("userLanguage") ||
      "ko";

    // 언어별 로그인 페이지로 리디렉션 (모든 언어를 locales 폴더로)
    setTimeout(() => {
      window.location.href = `../../locales/${currentLanguage}/login.html`;
    }, 1500);
    return false;
  }

  try {
    const userEmail = auth.currentUser.email;
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().role === "admin") {
      return true;
    } else {
      showMessage("관리자 권한이 필요한 기능입니다.", "error");
      return false;
    }
  } catch (error) {
    console.error("권한 확인 오류:", error);
    showMessage("권한 확인 중 오류가 발생했습니다.", "error");
    return false;
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ 단어장: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  // 필터 관련 이벤트는 vocabulary-filter-shared.js에서 처리됨
  if (typeof setupVocabularyFilters === "function") {
    setupVocabularyFilters(handleSearch);
    console.log("✅ 단어장: 필터 이벤트 설정 완료");
  }

  // 더 보기 버튼
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", handleLoadMore);
  }
}

// 에러 표시 함수
function showError(message, details = "") {
  console.error("❌", message, details);
  alert(message + (details ? `\n\n상세: ${details}` : ""));
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

    // 도메인 필터 언어 초기화는 vocabulary-filter-shared.js에서 처리됨
    if (window.initializeVocabularyFilterLanguage) {
      window.initializeVocabularyFilterLanguage();
    }

    // 네비게이션바는 이미 navbar.js에서 자동으로 로드됨
    console.log("✅ 네비게이션바는 navbar.js에서 처리됨");

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
    initializeConceptViewModal(); // 새로운 분리된 모달 시스템 초기화
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
        setCurrentUser(user); // 새로운 모달 시스템에 사용자 정보 전달
        setUserLanguage(userLanguage); // 새로운 모달 시스템에 언어 정보 전달
        await updateUsageUI();
        await loadUserBookmarks();
      } else {
        console.log("❌ 사용자가 로그인되지 않았습니다.");
        currentUser = null;
        setCurrentUser(null);
      }

      // 로그인 여부와 관계없이 개념 데이터 로드
      await fetchAndDisplayConcepts();
    });

    // 네비게이션 바가 동적으로 로드된 후 번역 적용
    setTimeout(() => {
      if (typeof window.applyLanguage === "function") {
        window.applyLanguage();
      }
      // 필터 언어도 업데이트
      if (typeof window.updateVocabularyFilterLanguage === "function") {
        window.updateVocabularyFilterLanguage();
      }
    }, 100);

    // 언어 변경 이벤트 발생 시 번역 적용
    window.addEventListener("languageChanged", () => {
      if (typeof window.applyLanguage === "function") {
        window.applyLanguage();
      }
      // 필터 언어도 업데이트
      if (typeof window.updateVocabularyFilterLanguage === "function") {
        window.updateVocabularyFilterLanguage();
      }
      // 새로운 모달 시스템에도 언어 정보 업데이트
      setUserLanguage(userLanguage);
    });
  } catch (error) {
    console.error("❌ 다국어 단어장 페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다.", error.message);
  }
});

// 개념 삭제 함수 (전역으로 노출)
window.deleteConcept = async function (conceptId) {
  console.log("🗑️ 개념 삭제 시도:", conceptId);

  try {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!conceptId) {
      console.error("❌ 개념 ID가 없습니다.");
      alert("삭제할 개념을 찾을 수 없습니다.");
      return;
    }

    // Firebase conceptUtils를 사용하여 삭제
    if (conceptUtils && conceptUtils.deleteConcept) {
      await conceptUtils.deleteConcept(conceptId);
      console.log("✅ 개념 삭제 완료:", conceptId);

      // 로컬 데이터 업데이트
      allConcepts = allConcepts.filter(
        (concept) => concept.id !== conceptId && concept._id !== conceptId
      );
      filteredConcepts = filteredConcepts.filter(
        (concept) => concept.id !== conceptId && concept._id !== conceptId
      );

      // 전역 변수 업데이트
      window.allConcepts = allConcepts;

      // UI 업데이트
      displayConceptList();
      await updateUsageUI();

      alert("개념이 성공적으로 삭제되었습니다.");
    } else {
      console.error("❌ conceptUtils.deleteConcept 함수를 찾을 수 없습니다.");
      alert("삭제 기능을 사용할 수 없습니다.");
    }
  } catch (error) {
    console.error("❌ 개념 삭제 중 오류 발생:", error);
    alert("개념 삭제 중 오류가 발생했습니다: " + error.message);
  }
};
