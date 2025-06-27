import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";
import {
  getCurrentUILanguage,
  getI18nText,
  applyI18nToPage,
  setupI18nListener,
  translateDomainKey,
  translateCategoryKey,
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

let currentUser = null;
let userBookmarks = [];
let bookmarkedConcepts = [];
let displayCount = 12;
let filteredConcepts = [];
let userLanguage = "ko";
let sourceLanguage = "korean"; // 학습 소스 언어
let targetLanguage = "korean"; // 학습 타겟 언어

// 언어 코드 매핑
const languageMapping = {
  ko: "korean",
  en: "english",
  ja: "japanese",
  zh: "chinese",
};

// 동적 번역 업데이트 (사용량 바, 카드 등)
function updateDynamicTranslations() {
  const usageTextElement = document.getElementById("wordlist-usage-text");
  if (usageTextElement) {
    usageTextElement.innerHTML = `${
      userBookmarks.length
    }/<span data-i18n="unlimited">${getI18nText("unlimited")}</span>`;
  }
}

// 언어 변경 리스너 설정
function setupLanguageChangeListener() {
  // 언어 변경 이벤트 리스너
  document.addEventListener("languageChanged", (event) => {
    console.log("언어 변경 감지:", event.detail);
    userLanguage = event.detail.language;

    // 동적 번역 업데이트
    updateDynamicTranslations();

    // 개념 카드 즉시 재렌더링
    displayConceptList();

    // UI 업데이트
    updateUI();
  });

  // 페이지 로드 시 초기 언어 설정
  const savedLanguage = localStorage.getItem("preferredLanguage");
  if (savedLanguage && savedLanguage !== userLanguage) {
    userLanguage = savedLanguage;
    updateDynamicTranslations();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // 사용자 언어 설정
  userLanguage = getCurrentUILanguage();

  // 초기 언어 설정 - 사용자 UI 언어에 따라 다르게 설정
  if (userLanguage === "ko") {
    sourceLanguage = "korean";
    targetLanguage = "english";
  } else if (userLanguage === "en") {
    sourceLanguage = "english";
    targetLanguage = "korean";
  } else if (userLanguage === "ja") {
    sourceLanguage = "japanese";
    targetLanguage = "korean";
  } else if (userLanguage === "zh") {
    sourceLanguage = "chinese";
    targetLanguage = "korean";
  } else {
    sourceLanguage = "korean";
    targetLanguage = "english";
  }

  // 네비게이션바는 navbar.js에서 자동 처리됨

  // 도메인 및 정렬 필터 동적 생성
  generateDomainSortFilters();

  // 언어 변경 리스너 설정 (네비게이션바 로드 후)
  setupLanguageChangeListener();

  // i18n 번역 적용 (네비게이션바 로드 후)
  setTimeout(() => {
    applyI18nToPage();
    updateDynamicTranslations();
    // 언어 선택 박스 초기값 설정
    setInitialLanguageSelections();
  }, 100);

  // 메타데이터 업데이트
  await updateMetadata("my-vocabulary");

  // 사용자 인증 상태 관찰
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await loadBookmarkedConcepts();
      updateUI();
    } else {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      alert("로그인이 필요합니다.");
      window.redirectToLogin();
    }
  });

  // 이벤트 리스너 설정
  setupEventListeners();
});

// 초기 언어 선택 박스 설정
function setInitialLanguageSelections() {
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");

  if (sourceLanguageSelect && targetLanguageSelect) {
    sourceLanguageSelect.value = sourceLanguage;
    targetLanguageSelect.value = targetLanguage;
  }
}

// 북마크된 개념들 로드
async function loadBookmarkedConcepts() {
  if (!currentUser) {
    console.log("❌ 사용자가 로그인되지 않음");
    return;
  }

  try {
    const userEmail = currentUser.email;
    console.log("📚 북마크 로드 시작:", userEmail);

    // 1. 사용자의 북마크 목록 가져오기
    const bookmarksRef = doc(db, "bookmarks", userEmail);
    const bookmarkDoc = await getDoc(bookmarksRef);

    if (!bookmarkDoc.exists()) {
      console.log("📝 북마크 문서가 존재하지 않음");
      userBookmarks = [];
      bookmarkedConcepts = [];
      return;
    }

    userBookmarks = bookmarkDoc.data().concept_ids || [];
    console.log("🔖 사용자 북마크 목록:", userBookmarks);

    if (userBookmarks.length === 0) {
      console.log("📭 북마크된 개념이 없음");
      bookmarkedConcepts = [];
      return;
    }

    // 2. 북마크된 개념들의 세부 정보 가져오기
    bookmarkedConcepts = [];

    // 배치로 처리하여 성능 향상
    const batchSize = 10;
    for (let i = 0; i < userBookmarks.length; i += batchSize) {
      const batch = userBookmarks.slice(i, i + batchSize);
      const conceptPromises = batch.map(async (conceptId) => {
        try {
          const conceptRef = doc(db, "concepts", conceptId);
          const conceptDoc = await getDoc(conceptRef);

          if (conceptDoc.exists()) {
            return { id: conceptDoc.id, ...conceptDoc.data() };
          }
          return null;
        } catch (error) {
          console.error(
            `${getI18nText("error_loading_bookmarks")} ${conceptId}`,
            error
          );
          return null;
        }
      });

      const batchResults = await Promise.all(conceptPromises);
      bookmarkedConcepts.push(
        ...batchResults.filter((concept) => concept !== null)
      );
    }

    // 최신순으로 정렬 (북마크 순서 기준)
    bookmarkedConcepts.sort((a, b) => {
      const aIndex = userBookmarks.indexOf(a.id);
      const bIndex = userBookmarks.indexOf(b.id);
      return bIndex - aIndex; // 최근 북마크가 위로
    });

    // 필터링된 개념 초기화
    filteredConcepts = [...bookmarkedConcepts];
    console.log("✅ 북마크 로드 완료:", {
      총개념수: bookmarkedConcepts.length,
      필터링된개념수: filteredConcepts.length,
    });
  } catch (error) {
    console.error(getI18nText("error_loading_bookmarks"), error);
    bookmarkedConcepts = [];
    filteredConcepts = [];

    // Firebase 연결 오류 처리
    if (
      error.code === "unavailable" ||
      error.message.includes("QUIC_PROTOCOL_ERROR")
    ) {
      console.warn("Firebase 연결 오류 감지, 재시도 중...");
      // 3초 후 재시도
      setTimeout(() => {
        if (currentUser) {
          loadBookmarkedConcepts();
        }
      }, 3000);
    }
  }
}

// UI 업데이트
function updateUI() {
  updateWordCount();
  updateUsageBar();
  updateConceptCount();
  displayConceptList();
}

// 단어 수 업데이트
function updateWordCount() {
  const usageTextElement = document.getElementById("usage-text");
  if (usageTextElement) {
    const count = bookmarkedConcepts.length;
    const unlimitedText = getI18nText("unlimited") || "무제한";
    usageTextElement.innerHTML = `${count}/<span data-i18n="unlimited">${unlimitedText}</span>`;
  }
}

// 사용량 바 업데이트
function updateUsageBar() {
  const usageBar = document.getElementById("usage-bar");
  if (usageBar) {
    const count = bookmarkedConcepts.length;
    const maxBookmarks = 1000; // 임시 최대값
    const percentage = Math.min((count / maxBookmarks) * 100, 100);
    usageBar.style.width = `${percentage}%`;
  }
}

// 개념 수 업데이트
function updateConceptCount() {
  const conceptCountElement = document.getElementById("concept-count-display");
  if (conceptCountElement) {
    conceptCountElement.textContent = filteredConcepts.length;
  }
}

// 개념 목록 표시
function displayConceptList() {
  const conceptList = document.getElementById("word-list");
  const loadMoreBtn = document.getElementById("load-more");

  if (!conceptList) return;

  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  if (conceptsToShow.length === 0) {
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-bookmark text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">${getI18nText(
          "no_bookmarks_title"
        )}</h3>
        <p class="text-gray-500 mb-6">${getI18nText("no_bookmarks_desc")}</p>
        <a
          href="multilingual-dictionary.html"
          class="bg-[#4B63AC] text-white px-6 py-3 rounded-lg hover:bg-[#3A4F8B] transition duration-300 inline-flex items-center"
        >
          <i class="fas fa-search mr-2"></i> ${getI18nText("browse_words")}
        </a>
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  conceptList.innerHTML = conceptsToShow.map(createConceptCard).join("");

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// 개념 카드 생성 (다국어 단어장과 동일한 스타일)
function createConceptCard(concept) {
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

  // 1. representative_example 확인 (새 구조 - 우선순위 최고)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    if (repExample.translations) {
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
          <i class="fas fa-bookmark text-yellow-500" title="${getI18nText(
            "bookmarked"
          )}"></i>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            ${translateDomainCategory(
              conceptInfo.domain,
              conceptInfo.category,
              userLanguage
            )}
          </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${(() => {
            // 환경 언어에 해당하는 표현 찾기
            const langMap = {
              ko: "korean",
              en: "english",
              ja: "japanese",
              zh: "chinese",
            };
            const envLangCode = langMap[userLanguage] || "korean";
            const envExpression = concept.expressions[envLangCode];
            return envExpression
              ? envExpression.word
              : sourceExpression.word || "N/A";
          })()}</span>
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
          <i class="fas fa-bookmark mr-1 text-yellow-500"></i> ${getI18nText(
            "bookmarked"
          )}
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

// 날짜 포맷팅
function formatDate(timestamp) {
  if (!timestamp) return getI18nText("no_date");

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return getI18nText("no_date");

  // 언어별 날짜 형식
  const localeMap = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
  };

  const locale = localeMap[userLanguage] || "ko-KR";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");
  const loadMoreBtn = document.getElementById("load-more");

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = setupVocabularyFilters(handleSearch);

  // 언어 선택 변경
  if (sourceLanguageSelect) {
    sourceLanguageSelect.addEventListener("change", handleLanguageChange);
  }
  if (targetLanguageSelect) {
    targetLanguageSelect.addEventListener("change", handleLanguageChange);
  }

  // 언어 순서 바꾸기 (공유 모듈 사용)
  const swapButton = document.getElementById("swap-languages");
  if (swapButton) {
    swapButton.addEventListener("click", () => {
      filterManager.swapLanguages();
      handleSearch();
    });
  }

  // 더 보기 버튼
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      displayCount += 12;
      displayConceptList();
    });
  }
}

// 검색 처리 (공유 모듈 사용)
function handleSearch() {
  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    bookmarkedConcepts,
    filters
  );

  // 표시 카운트 초기화
  displayCount = 12;
  updateWordCount();
  displayConceptList();
}

// 언어 변경 처리
function handleLanguageChange() {
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");

  if (sourceLanguageSelect && targetLanguageSelect) {
    sourceLanguage = sourceLanguageSelect.value;
    targetLanguage = targetLanguageSelect.value;

    // 카드 목록 새로고침
    displayConceptList();
  }
}

// 언어 순서 바꾸기, 정렬 함수들은 공유 모듈로 대체됨

// 개념 상세보기 모달 열기
window.openConceptViewModal = function (conceptId) {
  console.log(`${getI18nText("concept_detail_view")} ${conceptId}`);

  const concept = bookmarkedConcepts.find((c) => (c.id || c._id) === conceptId);
  if (!concept) {
    console.error("개념을 찾을 수 없습니다:", conceptId);
    return;
  }

  showConceptDetailModal(concept);
};

// 개념 상세보기 모달 표시 (다국어 단어장과 동일한 스타일)
function showConceptDetailModal(concept) {
  const conceptInfo = concept.concept_info || {};
  const expressions = concept.expressions || {};
  const emoji = conceptInfo.unicode_emoji || conceptInfo.emoji || "📝";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  // 현재 선택된 언어 정보
  const sourceExpression = expressions[sourceLanguage] || {};
  const targetExpression = expressions[targetLanguage] || {};

  // 모든 언어의 표현 수집
  const allExpressions = [];
  Object.entries(expressions).forEach(([lang, expr]) => {
    if (expr && expr.word) {
      const langName = getLanguageName(lang);
      allExpressions.push({
        language: lang,
        languageName: langName,
        ...expr,
      });
    }
  });

  // 언어 탭 순서 정렬 (대상언어, 원본언어, 나머지 언어 순)
  const sortedExpressions = [];

  // 1. 대상 언어 추가
  const targetExpr = allExpressions.find(
    (expr) => expr.language === targetLanguage
  );
  if (targetExpr) {
    sortedExpressions.push(targetExpr);
  }

  // 2. 원본 언어 추가 (대상언어와 다른 경우에만)
  if (sourceLanguage !== targetLanguage) {
    const sourceExpr = allExpressions.find(
      (expr) => expr.language === sourceLanguage
    );
    if (sourceExpr) {
      sortedExpressions.push(sourceExpr);
    }
  }

  // 3. 나머지 언어들 추가
  allExpressions.forEach((expr) => {
    if (expr.language !== targetLanguage && expr.language !== sourceLanguage) {
      sortedExpressions.push(expr);
    }
  });

  // 예문 HTML 생성 (하나의 박스에 원본과 번역 함께 표시)
  const examplePairs = [];

  // 첫 번째 언어(대상언어)의 예문만 초기 표시
  const initialExamples = [];
  const firstLanguage = sortedExpressions[0]?.language;

  // 환경 언어 코드 매핑
  const envLangMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };
  const envLangCode = envLangMap[userLanguage] || "korean";

  // 대표 예문 쌍 생성
  if (
    concept.representative_example &&
    concept.representative_example.translations
  ) {
    const selectedExample =
      concept.representative_example.translations[firstLanguage];
    const envExample =
      firstLanguage !== envLangCode
        ? concept.representative_example.translations[envLangCode]
        : null;

    if (selectedExample) {
      initialExamples.push({
        original: selectedExample,
        translation: envExample,
        isRepresentative: true,
      });
    }
  }

  // 추가 예문 쌍 생성
  if (concept.examples && Array.isArray(concept.examples)) {
    concept.examples.forEach((example) => {
      if (example.translations && example.translations[firstLanguage]) {
        const selectedExample = example.translations[firstLanguage];
        const envExample =
          firstLanguage !== envLangCode
            ? example.translations[envLangCode]
            : null;

        initialExamples.push({
          original: selectedExample,
          translation: envExample,
          isRepresentative: false,
        });
      }
    });
  }

  // 모달 HTML 생성 (다국어 단어장과 동일한 구조 - 언어 탭 포함)
  const modalHTML = `
    <div id="concept-detail-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- 헤더 -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-2">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-start">
              <div class="text-3xl mr-3">${emoji}</div>
              <div class="flex items-start justify-between w-full">
                <div>
                  <h2 class="text-2xl font-bold text-white">${
                    targetExpression.word || "N/A"
                  }</h2>
                  ${
                    targetExpression.pronunciation ||
                    targetExpression.romanization
                      ? `<p class="text-blue-100 mt-1">[${
                          targetExpression.pronunciation ||
                          targetExpression.romanization
                        }]</p>`
                      : ""
                  }
                </div>
                <!-- 도메인/카테고리를 제목과 발음 바로 오른쪽에 배치 -->
                <div class="flex items-start mt-1 ml-4">
                  <span class="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full whitespace-nowrap">
                    ${translateDomainKey(
                      conceptInfo.domain || "기타"
                    )}/${translateCategoryKey(conceptInfo.category || "일반")}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <i class="fas fa-bookmark text-yellow-300 text-xl" title="${getI18nText(
                "bookmarked"
              )}"></i>
              <button onclick="closeConceptDetailModal()" class="text-white hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 언어 탭 (헤더 밖으로 이동) -->
        <div class="px-6 pt-4">
          <div id="language-tabs" class="border-b mb-4">
            <nav class="flex space-x-8">
              ${sortedExpressions
                .map(
                  (expr, index) => `
                <button type="button" 
                  class="language-tab pb-2 px-1 border-b-2 font-medium text-sm ${
                    index === 0
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }" 
                  data-language="${expr.language}"
                  onclick="switchLanguageTab('${expr.language}', this)">
                  ${expr.languageName}
                </button>
              `
                )
                .join("")}
            </nav>
          </div>
        </div>

        <!-- 언어별 콘텐츠 -->
        <div class="px-6">
          <div id="language-content">
            ${sortedExpressions
              .map(
                (expr, index) => `
              <div id="${expr.language}-content" class="language-content ${
                  index === 0 ? "" : "hidden"
                }">
                <div class="bg-gray-50 rounded-lg p-4 mb-4" style="border-left: 4px solid ${colorTheme}">
                  <div class="mb-3">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-2xl font-bold text-gray-800">${(() => {
                        // 환경 언어에 해당하는 표현 찾기
                        const langMap = {
                          ko: "korean",
                          en: "english",
                          ja: "japanese",
                          zh: "chinese",
                        };
                        const envLangCode = langMap[userLanguage] || "korean";
                        const envExpression = concept.expressions[envLangCode];
                        return envExpression
                          ? envExpression.word
                          : sourceExpression.word || "N/A";
                      })()}</span>
                      ${
                        expr.part_of_speech
                          ? `<span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">${translatePartOfSpeech(
                              expr.part_of_speech
                            )}</span>`
                          : ""
                      }
                    </div>
                    ${
                      expr.definition
                        ? `<div class="text-gray-700 mb-3">${expr.definition}</div>`
                        : ""
                    }
                    
                    <!-- 추가 언어 정보 -->
                    <div class="space-y-3 mt-4">
                      ${
                        expr.synonyms && expr.synonyms.length > 0
                          ? `
                        <div>
                          <div class="text-xs font-medium text-gray-600 mb-1">${
                            userLanguage === "ko"
                              ? "유의어"
                              : userLanguage === "en"
                              ? "Synonyms"
                              : userLanguage === "ja"
                              ? "類義語"
                              : userLanguage === "zh"
                              ? "同义词"
                              : "유의어"
                          }</div>
                          <div class="flex flex-wrap gap-1">
                            ${(Array.isArray(expr.synonyms)
                              ? expr.synonyms
                              : expr.synonyms.split(",").map((s) => s.trim())
                            )
                              .map(
                                (synonym) => `
                              <span class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                ${synonym}
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                      ${
                        expr.antonyms && expr.antonyms.length > 0
                          ? `
                        <div>
                          <div class="text-xs font-medium text-gray-600 mb-1">${
                            userLanguage === "ko"
                              ? "반의어"
                              : userLanguage === "en"
                              ? "Antonyms"
                              : userLanguage === "ja"
                              ? "反義語"
                              : userLanguage === "zh"
                              ? "反义词"
                              : "반의어"
                          }</div>
                          <div class="flex flex-wrap gap-1">
                            ${(Array.isArray(expr.antonyms)
                              ? expr.antonyms
                              : expr.antonyms.split(",").map((s) => s.trim())
                            )
                              .map(
                                (antonym) => `
                              <span class="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded">
                                ${antonym}
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                      ${
                        expr.collocations && expr.collocations.length > 0
                          ? `
                        <div>
                          <div class="text-xs font-medium text-gray-600 mb-1">${
                            userLanguage === "ko"
                              ? "연어"
                              : userLanguage === "en"
                              ? "Collocations"
                              : userLanguage === "ja"
                              ? "連語"
                              : userLanguage === "zh"
                              ? "搭配"
                              : "연어"
                          }</div>
                          <div class="flex flex-wrap gap-1">
                            ${(Array.isArray(expr.collocations)
                              ? expr.collocations
                              : expr.collocations
                                  .split(",")
                                  .map((s) => s.trim())
                            )
                              .map(
                                (collocation) => `
                              <span class="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                                ${collocation}
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                      ${
                        expr.compound_words && expr.compound_words.length > 0
                          ? `
                        <div>
                          <div class="text-xs font-medium text-gray-600 mb-1">${
                            userLanguage === "ko"
                              ? "복합어"
                              : userLanguage === "en"
                              ? "Compound Words"
                              : userLanguage === "ja"
                              ? "複合語"
                              : userLanguage === "zh"
                              ? "复合词"
                              : "복합어"
                          }</div>
                          <div class="flex flex-wrap gap-1">
                            ${(Array.isArray(expr.compound_words)
                              ? expr.compound_words
                              : expr.compound_words
                                  .split(",")
                                  .map((s) => s.trim())
                            )
                              .map(
                                (compound) => `
                              <span class="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                                ${compound}
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                      ${
                        expr.word_family && expr.word_family.length > 0
                          ? `
                        <div>
                          <div class="text-xs font-medium text-gray-600 mb-1">${
                            userLanguage === "ko"
                              ? "어족"
                              : userLanguage === "en"
                              ? "Word Family"
                              : userLanguage === "ja"
                              ? "語族"
                              : userLanguage === "zh"
                              ? "词族"
                              : "어족"
                          }</div>
                          <div class="flex flex-wrap gap-1">
                            ${(Array.isArray(expr.word_family)
                              ? expr.word_family
                              : expr.word_family.split(",").map((s) => s.trim())
                            )
                              .map(
                                (family) => `
                              <span class="inline-block bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded">
                                ${family}
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                    </div>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- 예문 섹션 -->
        ${
          initialExamples.length > 0
            ? `
        <div class="px-6 mt-6">
          <h3 class="text-lg font-semibold mb-3" data-i18n="examples">${
            getI18nText("examples") || "예문"
          }</h3>
          <div id="examples-container" class="space-y-3">
            ${initialExamples
              .map(
                (pair) => `
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-400 space-y-2">
                <p class="text-gray-800 leading-relaxed font-bold">${
                  pair.original
                }</p>
                ${
                  pair.translation
                    ? `<p class="text-gray-600 leading-relaxed font-normal">${pair.translation}</p>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- 모달 하단: 시간 표시 -->
        <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 px-6 pb-6">
          <div class="text-sm text-gray-500">
            <i class="fas fa-clock mr-1"></i>
            <span>${formatDate(
              concept.metadata?.created_at ||
                concept.created_at ||
                concept.timestamp
            )}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="flex items-center text-sm text-gray-500">
              <i class="fas fa-bookmark mr-1 text-yellow-500"></i>
              ${getI18nText("bookmarked")}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  // 기존 모달 제거
  const existingModal = document.getElementById("concept-detail-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // 새 모달 추가
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // 모달에 개념 데이터 저장 (언어 탭 전환 시 사용)
  const modal = document.getElementById("concept-detail-modal");
  if (modal) {
    modal.conceptData = concept;
  }

  // 초기 언어탭의 예문 표시
  if (sortedExpressions.length > 0) {
    updateExamplesForLanguage(sortedExpressions[0].language);
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", handleModalKeydown);
}

// 언어 이름 가져오기 함수
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

// 품사 번역 함수 (환경 언어에 맞춰)
function translatePartOfSpeech(partOfSpeech) {
  if (!partOfSpeech) return "";

  // 품사 정규화 (다양한 형태를 표준 형태로 변환)
  const normalizePartOfSpeech = (pos) => {
    const normalized = pos.toLowerCase().trim();
    const mappings = {
      // 명사 관련
      명사: "noun",
      noun: "noun",
      名詞: "noun",
      名词: "noun",
      // 동사 관련
      동사: "verb",
      verb: "verb",
      動詞: "verb",
      动词: "verb",
      // 형용사 관련
      형용사: "adjective",
      adjective: "adjective",
      adj: "adjective",
      形容詞: "adjective",
      形容词: "adjective",
      // 부사 관련
      부사: "adverb",
      adverb: "adverb",
      副詞: "adverb",
      副词: "adverb",
      // 기타
      대명사: "pronoun",
      pronoun: "pronoun",
      代名詞: "pronoun",
      代词: "pronoun",
      전치사: "preposition",
      preposition: "preposition",
      前置詞: "preposition",
      介词: "preposition",
      접속사: "conjunction",
      conjunction: "conjunction",
      接続詞: "conjunction",
      连词: "conjunction",
      감탄사: "interjection",
      interjection: "interjection",
      感嘆詞: "interjection",
      感叹词: "interjection",
    };
    return mappings[normalized] || normalized;
  };

  const normalizedPos = normalizePartOfSpeech(partOfSpeech);

  // 환경 언어에 따른 번역
  const translations = {
    ko: {
      noun: "명사",
      verb: "동사",
      adjective: "형용사",
      adverb: "부사",
      pronoun: "대명사",
      preposition: "전치사",
      conjunction: "접속사",
      interjection: "감탄사",
      determiner: "한정사",
      other: "기타",
    },
    en: {
      noun: "Noun",
      verb: "Verb",
      adjective: "Adjective",
      adverb: "Adverb",
      pronoun: "Pronoun",
      preposition: "Preposition",
      conjunction: "Conjunction",
      interjection: "Interjection",
      determiner: "Determiner",
      other: "Other",
    },
    ja: {
      noun: "名詞",
      verb: "動詞",
      adjective: "形容詞",
      adverb: "副詞",
      pronoun: "代名詞",
      preposition: "前置詞",
      conjunction: "接続詞",
      interjection: "感嘆詞",
      determiner: "限定詞",
      other: "その他",
    },
    zh: {
      noun: "名词",
      verb: "动词",
      adjective: "形容词",
      adverb: "副词",
      pronoun: "代词",
      preposition: "介词",
      conjunction: "连词",
      interjection: "感叹词",
      determiner: "限定词",
      other: "其他",
    },
  };

  const userLangTranslations = translations[userLanguage] || translations.ko;
  return userLangTranslations[normalizedPos] || partOfSpeech;
}

// 언어 탭 전환 함수
window.switchLanguageTab = function (language, tabElement) {
  // 모든 탭 비활성화
  document.querySelectorAll(".language-tab").forEach((tab) => {
    tab.classList.remove("border-blue-500", "text-blue-600");
    tab.classList.add("border-transparent", "text-gray-500");
  });

  // 선택된 탭 활성화
  tabElement.classList.remove("border-transparent", "text-gray-500");
  tabElement.classList.add("border-blue-500", "text-blue-600");

  // 모든 언어 콘텐츠 숨기기
  document.querySelectorAll(".language-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // 선택된 언어 콘텐츠 표시
  const selectedContent = document.getElementById(`${language}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }

  // 대표 단어를 선택된 언어탭에 맞게 업데이트
  updateHeaderForLanguage(language);

  // 예문을 선택된 언어에 맞게 업데이트
  updateExamplesForLanguage(language);
};

// 헤더 정보를 선택된 언어에 맞게 업데이트하는 함수
function updateHeaderForLanguage(selectedLanguage) {
  const modal = document.getElementById("concept-detail-modal");
  if (!modal || !modal.conceptData) return;

  const concept = modal.conceptData;
  const expression = concept.expressions[selectedLanguage];
  if (!expression) return;

  // 대표 단어 업데이트 (선택된 언어탭에 맞게)
  const titleElement = modal.querySelector("h2");
  if (titleElement) {
    titleElement.textContent = expression.word || "N/A";
  }

  // 발음 업데이트 (선택된 언어탭에 맞게)
  const pronunciationElement = modal.querySelector("p.text-blue-100");
  if (pronunciationElement) {
    const pronunciation = expression.pronunciation || expression.romanization;
    if (pronunciation) {
      pronunciationElement.textContent = `[${pronunciation}]`;
      pronunciationElement.style.display = "block";
    } else {
      pronunciationElement.style.display = "none";
    }
  }
}

// 선택된 언어에 맞는 예문 업데이트 함수
function updateExamplesForLanguage(selectedLanguage) {
  const examplesContainer = document.getElementById("examples-container");
  if (!examplesContainer) return;

  const modal = document.getElementById("concept-detail-modal");
  if (!modal || !modal.conceptData) return;

  const concept = modal.conceptData;
  const examples = [];

  // 대표 예문 처리
  if (
    concept.representative_example &&
    concept.representative_example.translations
  ) {
    const repExample =
      concept.representative_example.translations[selectedLanguage];
    if (repExample) {
      examples.push({
        text: repExample,
        isRepresentative: true,
        languageName: getLanguageName(selectedLanguage),
      });
    }
  }

  // 추가 예문 처리
  if (concept.examples && Array.isArray(concept.examples)) {
    concept.examples.forEach((example) => {
      if (example.translations && example.translations[selectedLanguage]) {
        examples.push({
          text: example.translations[selectedLanguage],
          isRepresentative: false,
          languageName: getLanguageName(selectedLanguage),
        });
      }
    });
  }

  // 환경 언어 번역 추가 (선택된 언어와 다른 경우)
  const envLangMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };
  const envLangCode = envLangMap[userLanguage] || "korean";

  if (selectedLanguage !== envLangCode) {
    // 대표 예문의 환경 언어 번역
    if (
      concept.representative_example &&
      concept.representative_example.translations
    ) {
      const envRepExample =
        concept.representative_example.translations[envLangCode];
      if (envRepExample) {
        examples.push({
          text: envRepExample,
          isRepresentative: true,
          languageName: getLanguageName(envLangCode),
          isTranslation: true,
        });
      }
    }

    // 추가 예문의 환경 언어 번역
    if (concept.examples && Array.isArray(concept.examples)) {
      concept.examples.forEach((example) => {
        if (example.translations && example.translations[envLangCode]) {
          examples.push({
            text: example.translations[envLangCode],
            isRepresentative: false,
            languageName: getLanguageName(envLangCode),
            isTranslation: true,
          });
        }
      });
    }
  }

  // 예문 HTML 생성 (하나의 박스에 원본과 번역 함께 표시)
  const examplePairs = [];

  // 대표 예문 쌍 생성
  if (
    concept.representative_example &&
    concept.representative_example.translations
  ) {
    const selectedExample =
      concept.representative_example.translations[selectedLanguage];
    const envExample =
      selectedLanguage !== envLangCode
        ? concept.representative_example.translations[envLangCode]
        : null;

    if (selectedExample) {
      examplePairs.push({
        original: selectedExample,
        translation: envExample,
        isRepresentative: true,
      });
    }
  }

  // 추가 예문 쌍 생성
  if (concept.examples && Array.isArray(concept.examples)) {
    concept.examples.forEach((example) => {
      if (example.translations && example.translations[selectedLanguage]) {
        const selectedExample = example.translations[selectedLanguage];
        const envExample =
          selectedLanguage !== envLangCode
            ? example.translations[envLangCode]
            : null;

        examplePairs.push({
          original: selectedExample,
          translation: envExample,
          isRepresentative: false,
        });
      }
    });
  }

  examplesContainer.innerHTML = examplePairs
    .map(
      (pair) => `
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-400 space-y-2">
      <p class="text-gray-800 leading-relaxed font-bold">${pair.original}</p>
      ${
        pair.translation
          ? `<p class="text-gray-600 leading-relaxed font-normal">${pair.translation}</p>`
          : ""
      }
    </div>
  `
    )
    .join("");
}

// 모달 닫기
window.closeConceptDetailModal = function () {
  const modal = document.getElementById("concept-detail-modal");
  if (modal) {
    modal.remove();
  }
  document.removeEventListener("keydown", handleModalKeydown);
};

// 키보드 이벤트 핸들러
function handleModalKeydown(event) {
  if (event.key === "Escape") {
    window.closeConceptDetailModal();
  }
}

// 전역 변수들을 window 객체에 저장하여 다른 스크립트에서 접근 가능하도록
window.myWordListData = {
  get userLanguage() {
    return userLanguage;
  },
  get sourceLanguage() {
    return sourceLanguage;
  },
  get targetLanguage() {
    return targetLanguage;
  },
  getI18nText,
  get bookmarkedConcepts() {
    return bookmarkedConcepts;
  },
  get currentUser() {
    return currentUser;
  },
};

// 환경 언어로 고정된 표시 단어(내용 단어) 함수
function getDisplayWord(expression, envLanguage) {
  // 환경 언어 코드를 언어 키로 변환
  const langMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };

  const envLangCode = langMap[envLanguage] || "korean";

  // 모달에서 개념 데이터 가져오기
  const modal = document.getElementById("concept-detail-modal");
  if (modal && modal.conceptData && modal.conceptData.expressions) {
    const envExpression = modal.conceptData.expressions[envLangCode];
    if (envExpression && envExpression.word) {
      return envExpression.word;
    }
  }

  // 환경 언어 표현을 찾을 수 없으면 현재 언어의 원본 단어 반환
  return expression.word || "N/A";
}

// 언어별 콘텐츠 생성 함수
function createLanguageContent(language, expression, envLanguage) {
  if (!expression) return "";

  // 환경 언어에 따른 레이블 번역
  const getLabel = (key) => {
    const labels = {
      ko: {
        synonyms: "유의어",
        antonyms: "반의어",
        collocations: "연어",
        compound_words: "복합어",
        word_family: "어족",
      },
      en: {
        synonyms: "Synonyms",
        antonyms: "Antonyms",
        collocations: "Collocations",
        compound_words: "Compound Words",
        word_family: "Word Family",
      },
      ja: {
        synonyms: "類義語",
        antonyms: "反義語",
        collocations: "連語",
        compound_words: "複合語",
        word_family: "語族",
      },
      zh: {
        synonyms: "同义词",
        antonyms: "反义词",
        collocations: "搭配",
        compound_words: "复合词",
        word_family: "词族",
      },
    };
    return labels[envLanguage]?.[key] || labels.ko[key];
  };

  // 표시 단어 (환경 언어로 고정)
  const displayWord = getDisplayWord(expression, envLanguage);
  const partOfSpeech = translatePartOfSpeech(expression.part_of_speech);

  let content = `
    <div class="space-y-4">
      <div class="text-lg font-semibold text-gray-800">
        ${displayWord} ${
    partOfSpeech
      ? `<span class="text-sm text-gray-500">(${partOfSpeech})</span>`
      : ""
  }
      </div>
      <div class="text-gray-600">${expression.definition || ""}</div>
      ${
        expression.pronunciation
          ? `<div class="text-blue-600">[${expression.pronunciation}]</div>`
          : ""
      }
  `;

  // 유의어
  if (expression.synonyms && expression.synonyms.length > 0) {
    content += `
      <div class="mt-3">
        <div class="text-sm font-medium text-gray-700 mb-1">${getLabel(
          "synonyms"
        )}</div>
        <div class="flex flex-wrap gap-1">
          ${expression.synonyms
            .map(
              (synonym) =>
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${synonym}</span>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // 반의어
  if (expression.antonyms && expression.antonyms.length > 0) {
    content += `
      <div class="mt-3">
        <div class="text-sm font-medium text-gray-700 mb-1">${getLabel(
          "antonyms"
        )}</div>
        <div class="flex flex-wrap gap-1">
          ${expression.antonyms
            .map(
              (antonym) =>
                `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">${antonym}</span>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // 연어
  if (expression.collocations && expression.collocations.length > 0) {
    content += `
      <div class="mt-3">
        <div class="text-sm font-medium text-gray-700 mb-1">${getLabel(
          "collocations"
        )}</div>
        <div class="flex flex-wrap gap-1">
          ${expression.collocations
            .map(
              (collocation) =>
                `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${collocation}</span>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // 복합어
  if (expression.compound_words && expression.compound_words.length > 0) {
    content += `
      <div class="mt-3">
        <div class="text-sm font-medium text-gray-700 mb-1">${getLabel(
          "compound_words"
        )}</div>
        <div class="flex flex-wrap gap-1">
          ${expression.compound_words
            .map(
              (compound) =>
                `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">${compound}</span>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // 어족 추가
  if (expression.word_family && expression.word_family.length > 0) {
    content += `
      <div class="mt-3">
        <div class="text-sm font-medium text-gray-700 mb-1">${getLabel(
          "word_family"
        )}</div>
        <div class="flex flex-wrap gap-1">
          ${expression.word_family
            .map(
              (family) =>
                `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">${family}</span>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  content += `</div>`;
  return content;
}

// 도메인 및 정렬 필터 동적 생성 함수
function generateDomainSortFilters() {
  const container = document.getElementById("domain-sort-filters");
  if (!container) {
    console.error("❌ domain-sort-filters 컨테이너를 찾을 수 없습니다.");
    return;
  }

  // VocabularyFilterBuilder를 사용하여 도메인 및 정렬 필터 생성
  const filterBuilder = new VocabularyFilterBuilder({
    showSearch: false,
    showLanguage: false,
    showDomain: true,
    showSort: true,
  });

  // 도메인과 정렬 필터 HTML 생성
  const domainFilterHTML = filterBuilder.createDomainFilter();
  const sortFilterHTML = filterBuilder.createSortFilter();

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-2">
      <div class="flex flex-col">
        ${domainFilterHTML}
      </div>
      <div class="flex flex-col">
        ${sortFilterHTML}
      </div>
    </div>
  `;

  console.log("✅ 나만의 단어장 도메인 및 정렬 필터 동적 생성 완료");
}
