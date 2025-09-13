import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
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
// 언어 필터 초기화 유틸리티 import
import {
  getSystemLanguage,
  getInitialLanguageSettings,
  loadLanguageFilterSettings,
  saveLanguageFilterSettings,
  initializeLanguageFilterElements,
  updateLanguageFilterElements,
  updateLanguageFilterOnUIChange,
  initializeLanguageFilterSync,
} from "../../utils/language-utils.js";
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

// 북마크 지연 해제 시스템
let pendingUnbookmarks = new Set(); // 해제 대기 중인 북마크 ID들
let bookmarkChangesPending = false; // 변경사항이 있는지 추적

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
  window.addEventListener("languageChanged", async (event) => {
    userLanguage = event.detail.language;

    // 환경 언어 변경 시 언어 필터 리셋
    await updateLanguageFilterOnUIChange(
      event.detail.language,
      "myWordListLanguageFilter"
    );

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
  // 네비게이션바 로드
  if (typeof window.loadNavbar === 'function') {
    await window.loadNavbar();
  }
  
  // Footer 로드
  if (typeof window.loadFooter === 'function') {
    await window.loadFooter();
  }
  
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
    targetLanguage = "english";
  } else if (userLanguage === "zh") {
    sourceLanguage = "chinese";
    targetLanguage = "english";
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
  await updateMetadata("my-word-list");

  // 사용자 인증 상태 관찰
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;

      await loadBookmarkedConcepts();
      updateUI();

      // 북마크 UI 업데이트
      setTimeout(() => {
        updateBookmarkUI();
      }, 500);
    } else {
      // alert 메시지 제거하고 바로 리디렉션
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      } else {
        // 대체 방법: 직접 언어별 로그인 페이지로 리디렉션
        const currentLanguage = localStorage.getItem("userLanguage") || "ko";
        window.location.href = `/locales/${currentLanguage}/login.html`;
      }
    }
  });

  // 이벤트 리스너 설정
  setupEventListeners();

  // 페이지 이탈 시 지연된 북마크 해제 처리
  setupPageUnloadHandler();
});

// 페이지 이탈 처리 설정
function setupPageUnloadHandler() {
  // beforeunload 이벤트 - 새로고침, 탭 닫기, 뒤로가기, 앞으로가기 등 모든 페이지 이탈 시 처리
  window.addEventListener("beforeunload", async (event) => {
    if (bookmarkChangesPending && pendingUnbookmarks.size > 0) {
      // 페이지 이탈 시 실제 북마크 해제 처리
      await processPendingUnbookmarks();
    }
  });

  // pagehide 이벤트 - 페이지가 숨겨질 때 (뒤로가기, 앞으로가기 포함)
  window.addEventListener("pagehide", async (event) => {
    if (bookmarkChangesPending && pendingUnbookmarks.size > 0) {
      await processPendingUnbookmarks();
    }
  });

  // visibilitychange 이벤트 - 탭 전환 시
  document.addEventListener("visibilitychange", async () => {
    if (
      document.visibilityState === "hidden" &&
      bookmarkChangesPending &&
      pendingUnbookmarks.size > 0
    ) {
      await processPendingUnbookmarks();
    }
  });

  // popstate 이벤트 - 브라우저 히스토리 변경 시 (뒤로가기, 앞으로가기)
  window.addEventListener("popstate", async (event) => {
    if (bookmarkChangesPending && pendingUnbookmarks.size > 0) {
      await processPendingUnbookmarks();
    }
  });
}

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
    return;
  }

  // 페이지 로드 시 pending 상태 정리 (실제 DB에서 제거된 북마크들을 pending에서도 제거)
  const currentPendingArray = Array.from(pendingUnbookmarks);
  currentPendingArray.forEach((pendingId) => {
    if (!userBookmarks.includes(pendingId)) {
      pendingUnbookmarks.delete(pendingId);
    }
  });

  // pending이 비어있으면 변경사항 플래그 해제
  if (pendingUnbookmarks.size === 0) {
    bookmarkChangesPending = false;
  }

  // 페이지 로드 시 pending 상태 초기화 (새로고침 등으로 인한 페이지 재로드 시)
  pendingUnbookmarks.clear();
  bookmarkChangesPending = false;

  try {
    const userEmail = currentUser.email;
    // 1. 사용자의 북마크 목록 가져오기 (users 컬렉션 사용)
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      userBookmarks = [];
      bookmarkedConcepts = [];
      updateUI(); // UI 업데이트 추가
      return;
    }

    const userData = userDoc.data();
    userBookmarks = userData.bookmarked_concepts || [];

    if (userBookmarks.length === 0) {
      bookmarkedConcepts = [];
      updateUI(); // UI 업데이트 추가
      return;
    }

    // 2. 북마크된 개념들의 세부 정보 가져오기
    bookmarkedConcepts = [];
    const invalidBookmarkIds = []; // 존재하지 않는 북마크 ID 추적

    // 배치로 처리하여 성능 향상
    const batchSize = 10;
    for (let i = 0; i < userBookmarks.length; i += batchSize) {
      const batch = userBookmarks.slice(i, i + batchSize);

      const conceptPromises = batch.map(async (conceptId) => {
        try {
          const conceptRef = doc(db, "concepts", conceptId);
          const conceptDoc = await getDoc(conceptRef);

          if (conceptDoc.exists()) {
            const conceptData = { id: conceptDoc.id, ...conceptDoc.data() };
            return conceptData;
          } else {
            console.warn(`⚠️ 개념을 찾을 수 없음: ${conceptId}`);
            invalidBookmarkIds.push(conceptId);
            return null;
          }
        } catch (error) {
          console.error(`❌ 개념 로딩 오류 ${conceptId}:`, error);
          invalidBookmarkIds.push(conceptId);
          return null;
        }
      });

      const batchResults = await Promise.all(conceptPromises);
      const validConcepts = batchResults.filter((concept) => concept !== null);

      bookmarkedConcepts.push(...validConcepts);
    }

    // 3. 존재하지 않는 북마크 ID들을 정리
    if (invalidBookmarkIds.length > 0) {
      const validBookmarkIds = userBookmarks.filter(
        (id) => !invalidBookmarkIds.includes(id)
      );

      try {
        await updateDoc(userRef, {
          bookmarked_concepts: validBookmarkIds,
          updated_at: new Date().toISOString(),
        });

        userBookmarks = validBookmarkIds;
      } catch (cleanupError) {
        console.error("❌ 북마크 정리 중 오류:", cleanupError);
      }
    }

    // 최신순으로 정렬 (북마크 순서 기준)
    bookmarkedConcepts.sort((a, b) => {
      const aIndex = userBookmarks.indexOf(a.id);
      const bIndex = userBookmarks.indexOf(b.id);
      return bIndex - aIndex; // 최근 북마크가 위로
    });

    // 필터링된 개념 초기화
    filteredConcepts = [...bookmarkedConcepts];

    // UI 업데이트
    updateUI();
  } catch (error) {
    console.error("❌ 북마크 로딩 전체 오류:", error);
    bookmarkedConcepts = [];
    filteredConcepts = [];

    // Firebase 연결 오류 처리
    if (
      error.code === "unavailable" ||
      error.message.includes("QUIC_PROTOCOL_ERROR")
    ) {
      console.warn("🔄 Firebase 연결 오류 감지, 3초 후 재시도...");
      setTimeout(() => {
        if (currentUser) {
          loadBookmarkedConcepts();
        }
      }, 3000);
    }

    // UI 업데이트 (오류 상태라도)
    updateUI();
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
    // Tailwind 기본 클래스 사용 + style로 width 설정
    usageBar.className =
      "bg-blue-500 h-2 rounded-full transition-all duration-300";
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
          href="vocabulary.html"
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

  // 조건을 완화: 최소한 하나의 언어에 단어가 있으면 표시
  const hasSourceWord = sourceExpression.word;
  const hasTargetWord = targetExpression.word;

  // 모든 언어 표현을 확인하여 최소한 하나의 단어가 있는지 확인
  const allExpressions = concept.expressions || {};
  const availableWords = Object.values(allExpressions)
    .filter((expr) => expr && expr.word)
    .map((expr) => expr.word);

  if (availableWords.length === 0) {
    console.warn("⚠️ 사용 가능한 단어가 없어서 카드 생성 건너뜀:", concept.id);
    return "";
  }

  // 표시할 단어 결정 (우선순위: target > source > 첫 번째 사용 가능한 단어)
  const displayWord = hasTargetWord
    ? targetExpression.word
    : hasSourceWord
    ? sourceExpression.word
    : availableWords[0];

  const displayDefinition =
    targetExpression.definition ||
    sourceExpression.definition ||
    Object.values(allExpressions).find((expr) => expr?.definition)
      ?.definition ||
    "";

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

  // 언어 코드 매핑 함수 (나만의 단어장 페이지용)
  function getLanguageCode(langCode) {
    const languageCodeMap = {
      korean: "korean",
      english: "english",
      japanese: "japanese",
      chinese: "chinese",
      // 환경 언어 코드도 지원
      ko: "korean",
      en: "english",
      ja: "japanese",
      zh: "chinese",
    };
    return languageCodeMap[langCode] || langCode;
  }

  // 언어 코드 변환
  const sourceLanguageCode = getLanguageCode(sourceLanguage);
  const targetLanguageCode = getLanguageCode(targetLanguage);

  // 1. representative_example 확인 (새 구조와 기존 구조 모두 지원)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 새로운 구조: 직접 언어별 텍스트
    if (repExample[sourceLanguageCode] && repExample[targetLanguageCode]) {
      example = {
        source: repExample[sourceLanguageCode],
        target: repExample[targetLanguageCode],
      };
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
      example = {
        source:
          repExample.translations[sourceLanguageCode]?.text ||
          repExample.translations[sourceLanguageCode] ||
          "",
        target:
          repExample.translations[targetLanguageCode]?.text ||
          repExample.translations[targetLanguageCode] ||
          "",
      };
    }
  }
  // 2. featured_examples 확인 (기존 방식)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguageCode]?.text || "",
        target: firstExample.translations[targetLanguageCode]?.text || "",
      };
    }
  }
  // 3. core_examples 확인 (기존 방식 - 하위 호환성)
  else if (concept.core_examples && concept.core_examples.length > 0) {
    const firstExample = concept.core_examples[0];
    // 번역 구조 확인
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguageCode]?.text || "",
        target: firstExample.translations[targetLanguageCode]?.text || "",
      };
    } else {
      // 직접 언어 속성이 있는 경우
      example = {
        source: firstExample[sourceLanguageCode] || "",
        target: firstExample[targetLanguageCode] || "",
      };
    }
  }
  // 4. 기존 examples 확인 (하위 호환성)
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguageCode] || "",
      target: firstExample[targetLanguageCode] || "",
    };
  }

  // 개념 ID 생성 (document ID 우선 사용)
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.word || "unknown"}_${
      targetExpression.word || "unknown"
    }`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 concept-card cursor-pointer"
      style="border-left: 4px solid ${colorTheme}"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3 cursor-pointer" onclick="openConceptViewModal('${conceptId}')">
          <span class="text-3xl">${emoji}</span>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              ${displayWord}
            </h3>
            <p class="text-sm text-gray-500">${
              targetExpression.pronunciation ||
              targetExpression.romanization ||
              sourceExpression.pronunciation ||
              sourceExpression.romanization ||
              ""
            }</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            class="bookmark-btn p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            data-concept-id="${conceptId}"
            onclick="event.stopPropagation(); toggleBookmark('${conceptId}')"
            title="북마크"
          >
            <i class="fas fa-bookmark text-yellow-500"></i>
          </button>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            ${translateDomainCategory(
              conceptInfo.domain,
              conceptInfo.category,
              userLanguage
            )}
          </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3 cursor-pointer" onclick="openConceptViewModal('${conceptId}')">
        <div class="flex items-center">
          <span class="font-medium">${(() => {
            // 원본 언어의 단어값 사용 (환경 언어에서 원본 언어로 변경)
            const sourceExpression = concept.expressions[sourceLanguage];
            return sourceExpression ? sourceExpression.word : displayWord;
          })()}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${displayDefinition}</p>
      </div>
      
      ${
        example && (example.source || example.target)
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3 cursor-pointer" onclick="openConceptViewModal('${conceptId}')">
        <p class="text-sm text-gray-700 font-medium">${
          example.target || example.source
        }</p>
        ${
          example.source && example.target && example.source !== example.target
            ? `<p class="text-sm text-gray-500 italic">${example.source}</p>`
            : ""
        }
      </div>
      `
          : ""
      }
      
      <div class="flex justify-between text-xs text-gray-500 mt-3 cursor-pointer" onclick="openConceptViewModal('${conceptId}')">
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
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");
  const loadMoreBtn = document.getElementById("load-more");

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = new VocabularyFilterManager({
    onSearch: handleSearch,
    onLanguageChange: handleLanguageChange,
    onDomainChange: handleSearch,
    onSortChange: handleSearch,
  });
  filterManager.setupEventListeners();

  // 언어 필터 초기화 (새로고침 시 설정 유지) - DOM 로드 후 실행
  setTimeout(() => {
    initializeLanguageFilterElements(
      "source-language",
      "target-language",
      "myWordListLanguageFilter"
    );

    // 언어 필터 변경 시 설정 저장 이벤트 리스너 추가
    if (sourceLanguageSelect) {
      sourceLanguageSelect.addEventListener("change", () => {
        saveLanguageFilterSettings(
          sourceLanguageSelect.value,
          targetLanguageSelect.value,
          "myWordListLanguageFilter"
        );
      });
    }

    if (targetLanguageSelect) {
      targetLanguageSelect.addEventListener("change", () => {
        saveLanguageFilterSettings(
          sourceLanguageSelect.value,
          targetLanguageSelect.value,
          "myWordListLanguageFilter"
        );
      });
    }
  }, 100);

  // 언어 선택 변경은 공통 모듈에서 처리됨

  // 언어 전환은 공통 모듈(vocabulary-filter-shared.js)에서 처리
  // 공통 모듈의 onLanguageChange 콜백으로 언어 변경사항 수신

  // 더 보기 버튼
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      displayCount += 12;
      displayConceptList();
    });
  }

  // 개념 추가/수정 완료 이벤트 리스너 (다중 등록)
  const handleConceptSaved = async (event) => {
    try {
      // 북마크된 개념 목록 다시 로드
      await loadBookmarkedConcepts();

      // 현재 필터 상태 유지하면서 표시 업데이트
      applyFiltersAndSort();

      // 메시지 표시
      showMessage("새 개념이 추가되었습니다!", "success");
    } catch (error) {
      console.error("❌ 단어장 목록 업데이트 실패:", error);
      showMessage("목록 업데이트 중 오류가 발생했습니다.", "error");
    }
  };

  // document와 window 모두에 이벤트 리스너 등록
  document.addEventListener("concept-saved", handleConceptSaved);
  window.addEventListener("concept-saved", handleConceptSaved);
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

// 언어 변경 처리 (공통 모듈의 onLanguageChange 콜백용)
function handleLanguageChange() {
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");

  if (sourceLanguageSelect && targetLanguageSelect) {
    const previousSourceLanguage = sourceLanguage;
    const previousTargetLanguage = targetLanguage;

    sourceLanguage = sourceLanguageSelect.value;
    targetLanguage = targetLanguageSelect.value;

    // 카드 목록 새로고침
    displayConceptList();
  } else {
    console.error("❌ 언어 선택 요소를 찾을 수 없습니다");
  }
}

// 언어 순서 바꾸기, 정렬 함수들은 공유 모듈로 대체됨

// 개념 상세보기 모달 열기
window.openConceptViewModal = function (conceptId) {
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
  if (concept.representative_example) {
    let selectedExample = null;
    let envExample = null;

    // 새로운 구조: 직접 언어별 텍스트
    if (concept.representative_example[firstLanguage]) {
      selectedExample = concept.representative_example[firstLanguage];
      envExample =
        firstLanguage !== envLangCode
          ? concept.representative_example[envLangCode]
          : null;
    }
    // 기존 구조: translations 객체
    else if (concept.representative_example.translations) {
      selectedExample =
        concept.representative_example.translations[firstLanguage];
      envExample =
        firstLanguage !== envLangCode
          ? concept.representative_example.translations[envLangCode]
          : null;
    }

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
  if (concept.representative_example) {
    let repExample = null;

    // 새로운 구조: 직접 언어별 텍스트
    if (concept.representative_example[selectedLanguage]) {
      repExample = concept.representative_example[selectedLanguage];
    }
    // 기존 구조: translations 객체
    else if (concept.representative_example.translations) {
      repExample =
        concept.representative_example.translations[selectedLanguage];
    }

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
    if (concept.representative_example) {
      let envRepExample = null;

      // 새로운 구조: 직접 언어별 텍스트
      if (concept.representative_example[envLangCode]) {
        envRepExample = concept.representative_example[envLangCode];
      }
      // 기존 구조: translations 객체
      else if (concept.representative_example.translations) {
        envRepExample =
          concept.representative_example.translations[envLangCode];
      }

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
  if (concept.representative_example) {
    let selectedExample = null;
    let envExample = null;

    // 새로운 구조: 직접 언어별 텍스트
    if (concept.representative_example[selectedLanguage]) {
      selectedExample = concept.representative_example[selectedLanguage];
      envExample =
        selectedLanguage !== envLangCode
          ? concept.representative_example[envLangCode]
          : null;
    }
    // 기존 구조: translations 객체
    else if (concept.representative_example.translations) {
      selectedExample =
        concept.representative_example.translations[selectedLanguage];
      envExample =
        selectedLanguage !== envLangCode
          ? concept.representative_example.translations[envLangCode]
          : null;
    }

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
}

// 북마크 토글 (나만의 단어장용)
async function toggleBookmark(conceptId) {
  if (!currentUser) {
    showMessage("로그인이 필요합니다.", "error");
    return;
  }

  const isCurrentlyBookmarked = userBookmarks.includes(conceptId);
  const isPendingUnbookmark = pendingUnbookmarks.has(conceptId);

  if (isCurrentlyBookmarked && !isPendingUnbookmark) {
    // 북마크 해제 - DB에서 즉시 제거, UI에서는 그레이 상태로 표시
    await removeBookmarkImmediately(conceptId);
    pendingUnbookmarks.add(conceptId);
    bookmarkChangesPending = true;

    showMessage("북마크가 해제되었습니다.", "success");
  } else if (!isCurrentlyBookmarked && isPendingUnbookmark) {
    // 해제 취소 - 다시 북마크 추가
    await addBookmarkImmediately(conceptId);
    pendingUnbookmarks.delete(conceptId);

    showMessage("북마크가 다시 추가되었습니다.", "success");

    // 변경사항이 없으면 플래그 해제
    if (pendingUnbookmarks.size === 0) {
      bookmarkChangesPending = false;
    }
    return; // addBookmarkImmediately에서 이미 UI 업데이트를 하므로 return
  } else if (!isCurrentlyBookmarked && !isPendingUnbookmark) {
    // 북마크 추가 - 즉시 처리
    await addBookmarkImmediately(conceptId);
    return; // addBookmarkImmediately에서 이미 UI 업데이트를 하므로 return
  }

  // UI 업데이트 - 북마크 해제 시에만 실행 (그레이 상태로 표시)
  updateBookmarkUI();
}

// 북마크 즉시 추가 (users 컬렉션 사용)
async function addBookmarkImmediately(conceptId) {
  try {
    const userEmail = currentUser.email;
    const userRef = doc(db, "users", userEmail);

    const updatedBookmarks = [...userBookmarks, conceptId];

    await updateDoc(userRef, {
      bookmarked_concepts: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    userBookmarks = updatedBookmarks;

    showMessage("북마크가 추가되었습니다.", "success");

    // 개념 목록 새로고침 (새로 추가된 북마크 반영)
    await loadBookmarkedConcepts();
  } catch (error) {
    console.error("❌ 북마크 추가 오류:", error);
    showMessage("북마크 추가 중 오류가 발생했습니다.", "error");
  }
}

// 북마크 즉시 제거 (users 컬렉션 사용)
async function removeBookmarkImmediately(conceptId) {
  try {
    const userEmail = currentUser.email;
    const userRef = doc(db, "users", userEmail);

    const updatedBookmarks = userBookmarks.filter((id) => id !== conceptId);

    await updateDoc(userRef, {
      bookmarked_concepts: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    userBookmarks = updatedBookmarks;
  } catch (error) {
    console.error("❌ 북마크 제거 오류:", error);
    showMessage("북마크 제거 중 오류가 발생했습니다.", "error");
  }
}

// 지연된 북마크 해제 처리 (users 컬렉션 사용)
async function processPendingUnbookmarks() {
  if (pendingUnbookmarks.size === 0) return;

  try {
    const userEmail = currentUser.email;
    const userRef = doc(db, "users", userEmail);

    // 해제 대기 중인 북마크들을 제거
    const updatedBookmarks = userBookmarks.filter(
      (id) => !pendingUnbookmarks.has(id)
    );

    await updateDoc(userRef, {
      bookmarked_concepts: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    // 상태 초기화
    pendingUnbookmarks.clear();
    bookmarkChangesPending = false;
  } catch (error) {
    console.error("❌ 지연된 북마크 해제 오류:", error);
  }
}

// 북마크 UI 업데이트
function updateBookmarkUI() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");

  bookmarkButtons.forEach((btn) => {
    const conceptId = btn.getAttribute("data-concept-id");
    const icon = btn.querySelector("i");

    const isBookmarked = userBookmarks.includes(conceptId);
    const isPendingUnbookmark = pendingUnbookmarks.has(conceptId);

    if (isBookmarked && !isPendingUnbookmark) {
      // 정상 북마크 상태
      icon.className = "fas fa-bookmark text-yellow-500";
      btn.title = "북마크 해제";
    } else if (isBookmarked && isPendingUnbookmark) {
      // 해제 상태 (그레이 색상)
      icon.className = "fas fa-bookmark text-gray-400";
      btn.title = "북마크 다시 추가 (클릭하여 복원)";
    } else {
      // 북마크 안됨
      icon.className = "fas fa-bookmark text-gray-400";
      btn.title = "북마크";
    }
  });
}

// 메시지 표시 함수
function showMessage(message, type = "info") {
  const messageContainer = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : type === "warning"
      ? "bg-yellow-100 border-yellow-400 text-yellow-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  messageContainer.className = `fixed top-4 right-4 ${bgColor} px-4 py-3 rounded z-50 border shadow-lg`;
  messageContainer.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-lg font-bold hover:opacity-70">×</button>
    </div>
  `;

  document.body.appendChild(messageContainer);

  setTimeout(() => {
    if (messageContainer.parentElement) {
      messageContainer.remove();
    }
  }, 4000);
}

// 전역 함수로 노출
window.toggleBookmark = toggleBookmark;
