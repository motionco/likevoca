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
import { getActiveLanguage } from "../../utils/language-utils.js";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

// 페이지별 번역 키
const pageTranslations = {
  ko: {
    meaning: "뜻:",
    example: "예문:",
    error_title: "오류 발생!",
    error_message: "페이지를 불러오는 중 문제가 발생했습니다.",
    error_details: "자세한 내용:",
    login_required: "로그인이 필요합니다.",
    // 카테고리 번역
    fruit: "과일",
    food: "음식",
    animal: "동물",
    daily: "일상",
    travel: "여행",
    business: "비즈니스",
    transportation: "교통",
    greeting: "인사",
    emotion: "감정",
    education: "교육",
    nature: "자연",
    subject: "과목",
    // 도메인 번역
    general: "일반",
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
    // 카테고리 번역
    fruit: "Fruit",
    food: "Food",
    animal: "Animal",
    daily: "Daily Life",
    travel: "Travel",
    business: "Business",
    transportation: "Transportation",
    greeting: "Greeting",
    emotion: "Emotion",
    education: "Education",
    nature: "Nature",
    subject: "Subject",
    // 도메인 번역
    general: "General",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
    // 카테고리 번역
    fruit: "果物",
    food: "食べ物",
    animal: "動物",
    daily: "日常",
    travel: "旅行",
    business: "ビジネス",
    transportation: "交通",
    greeting: "挨拶",
    emotion: "感情",
    education: "教育",
    nature: "自然",
    subject: "科目",
    // 도메인 번역
    general: "一般",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
    // 카테고리 번역
    fruit: "水果",
    food: "食物",
    animal: "动物",
    daily: "日常",
    travel: "旅行",
    business: "商务",
    transportation: "交通",
    greeting: "问候",
    emotion: "情绪",
    education: "教育",
    nature: "自然",
    subject: "学科",
    // 도메인 번역
    general: "一般",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key] || key;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 현재 활성화된 언어 코드 가져오기
    userLanguage = await getActiveLanguage();

    // 네비게이션바 로드
    loadNavbar();

    // 모달 로드 및 초기화
    await loadModals([
      "../components/concept-modal.html",
      "../components/concept-view-modal.html",
      "../components/bulk-import-modal.html",
    ]);

    // 개념 추가 모달 초기화
    initializeConceptModal();

    // 대량 개념 추가 모달 초기화
    initializeBulkImportModal();

    // 이벤트 리스너 등록
    const elements = {
      addConceptBtn: document.getElementById("add-concept"),
      bulkAddConceptBtn: document.getElementById("bulk-add-concept"),
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      categoryFilter: document.getElementById("category-filter"),
      sortOption: document.getElementById("sort-option"),
      loadMoreBtn: document.getElementById("load-more"),
      swapLanguagesBtn: document.getElementById("swap-languages"),
    };

    // 개념 추가 버튼 클릭 이벤트
    if (elements.addConceptBtn) {
      elements.addConceptBtn.addEventListener("click", () => {
        window.openConceptModal();
      });
    }

    // 대량 개념 추가 버튼 클릭 이벤트
    if (elements.bulkAddConceptBtn) {
      elements.bulkAddConceptBtn.addEventListener("click", () => {
        window.openBulkImportModal();
      });
    }

    // 언어 전환 버튼 클릭 이벤트
    if (elements.swapLanguagesBtn) {
      elements.swapLanguagesBtn.addEventListener("click", () => {
        swapLanguages(elements);
      });
    }

    // 검색과 필터링 이벤트
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", () =>
        handleSearch(elements)
      );
    }

    if (elements.sourceLanguage) {
      elements.sourceLanguage.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.targetLanguage) {
      elements.targetLanguage.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.categoryFilter) {
      elements.categoryFilter.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.sortOption) {
      elements.sortOption.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    // 더 보기 버튼 이벤트
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener("click", () => handleLoadMore());
    }

    // 개념 저장 이벤트 리스너
    window.addEventListener("concept-saved", async () => {
      await fetchAndDisplayConcepts();
      await updateUsageUI();
    });

    // 대량 개념 추가 완료 이벤트 리스너 추가
    window.addEventListener("bulk-import-completed", async () => {
      console.log("대량 개념 추가 완료, 목록 새로고침 중...");
      await fetchAndDisplayConcepts();
      await updateUsageUI();
    });

    // 언어 변경 이벤트 리스너
    document.addEventListener("languageChanged", async (event) => {
      userLanguage = event.detail.language;
      displayConceptList(); // 언어 변경 시 카드 재표시
    });

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
      } else {
        alert(getTranslatedText("login_required"));
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
    // 오류 표시
    const container = document.querySelector("main");
    if (container) {
      container.innerHTML += `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <strong class="font-bold">${getTranslatedText("error_title")}</strong>
          <span class="block sm:inline">${getTranslatedText(
            "error_message"
          )}</span>
          <span class="block mt-2">${getTranslatedText("error_details")} ${
        error.message
      }</span>
        </div>
      `;
    }
  }
});

// 개념 카드 생성 함수 (확장된 구조 지원 및 디버깅 개선)
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  console.log("카드 생성 중:", {
    conceptId: concept.id || concept._id,
    sourceLanguage,
    targetLanguage,
    expressionsAvailable: Object.keys(concept.expressions || {}),
    conceptInfo: concept.concept_info ? "new structure" : "legacy structure",
  });

  // 새로운 구조와 기존 구조 모두 지원
  const sourceExpression = concept.expressions?.[sourceLanguage] || {};
  const targetExpression = concept.expressions?.[targetLanguage] || {};

  console.log("표현 정보:", {
    sourceWord: sourceExpression.word,
    targetWord: targetExpression.word,
    sourceExpression,
    targetExpression,
  });

  // 빈 표현인 경우 건너뛰기
  if (!sourceExpression.word || !targetExpression.word) {
    console.log("카드 생성 건너뛰기: 단어가 없음");
    return "";
  }

  // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
  const conceptInfo = concept.concept_info || {
    domain: concept.domain || "기타",
    category: concept.category || "일반",
    unicode_emoji: concept.emoji || concept.unicode_emoji || "📝",
    color_theme: concept.color_theme || "#4B63AC",
  };

  console.log("개념 정보:", conceptInfo);

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

  // 예문 가져오기 (새 구조에서 featured_examples 사용)
  let example = null;
  if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    }
  }
  // 기존 구조의 examples도 지원
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

  console.log("카드 생성 완료:", {
    conceptId,
    targetWord: targetExpression.word,
    sourceWord: sourceExpression.word,
  });

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
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${getTranslatedText(conceptInfo.domain)}/${getTranslatedText(
    conceptInfo.category
  )}
        </span>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${sourceExpression.word || "N/A"}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          sourceExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-sm mb-1">${example.target}</p>
        <p class="text-sm text-gray-600">${example.source}</p>
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
            concept.created_at || concept.timestamp
          )}
        </span>
      </div>
    </div>
  `;
}

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

// 검색 및 필터링 함수 (확장된 구조 지원 및 디버깅 개선)
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  const searchValue = elements.searchInput.value.toLowerCase();
  const sourceLanguage = elements.sourceLanguage.value;
  const targetLanguage = elements.targetLanguage.value;
  const categoryFilter = elements.categoryFilter.value;
  const sortOption = elements.sortOption.value;

  console.log("검색 및 필터링 시작:", {
    searchValue,
    sourceLanguage,
    targetLanguage,
    categoryFilter,
    sortOption,
    totalConcepts: allConcepts.length,
  });

  // 필터링 로직 (새 구조와 기존 구조 모두 지원)
  filteredConcepts = allConcepts.filter((concept) => {
    // 표현 확인 (더 유연한 조건)
    const sourceExpression = concept.expressions?.[sourceLanguage];
    const targetExpression = concept.expressions?.[targetLanguage];

    // 적어도 하나의 언어에는 단어가 있어야 함 (두 언어 모두 필수는 아님)
    const hasAnyExpression = Object.values(concept.expressions || {}).some(
      (expr) => expr.word
    );

    if (!hasAnyExpression) {
      console.log("표현이 없는 개념 필터링:", concept.id || concept._id);
      return false;
    }

    // 현재 선택된 언어 조합에서 적어도 하나는 있어야 함
    if (!sourceExpression?.word && !targetExpression?.word) {
      console.log(
        "선택된 언어 조합에 표현이 없는 개념:",
        concept.id || concept._id
      );
      return false;
    }

    // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
    const conceptInfo = concept.concept_info || {
      domain: concept.domain || "기타",
      category: concept.category || "일반",
    };

    // 카테고리 필터
    if (categoryFilter !== "all" && conceptInfo.category !== categoryFilter) {
      return false;
    }

    // 검색어 필터
    if (searchValue) {
      const sourceWord = sourceExpression?.word?.toLowerCase() || "";
      const targetWord = targetExpression?.word?.toLowerCase() || "";
      const sourceDefinition =
        sourceExpression?.definition?.toLowerCase() || "";
      const targetDefinition =
        targetExpression?.definition?.toLowerCase() || "";

      // 태그도 검색에 포함 (새 구조)
      const tags = conceptInfo.tags
        ? conceptInfo.tags.join(" ").toLowerCase()
        : "";

      // 도메인과 카테고리도 검색에 포함
      const domain = conceptInfo.domain?.toLowerCase() || "";
      const category = conceptInfo.category?.toLowerCase() || "";

      const matchesSearch =
        sourceWord.includes(searchValue) ||
        targetWord.includes(searchValue) ||
        sourceDefinition.includes(searchValue) ||
        targetDefinition.includes(searchValue) ||
        tags.includes(searchValue) ||
        domain.includes(searchValue) ||
        category.includes(searchValue);

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  console.log(`필터링 결과: ${filteredConcepts.length}개 개념`);

  // 정렬
  sortFilteredConcepts(sortOption);

  // 표시
  displayConceptList();
}

// 정렬 함수 (확장된 구조 지원)
function sortFilteredConcepts(sortOption) {
  const getConceptTime = (concept) => {
    // 최상위 레벨 created_at만 처리
    if (concept.created_at instanceof Timestamp) {
      return concept.created_at.toMillis();
    }
    if (concept.created_at) {
      return new Date(concept.created_at).getTime();
    }

    // timestamp 확인 (더 오래된 데이터)
    if (concept.timestamp instanceof Timestamp) {
      return concept.timestamp.toMillis();
    }
    if (concept.timestamp) {
      return new Date(concept.timestamp).getTime();
    }

    // 시간 정보가 없으면 현재 시간으로 간주
    return Date.now();
  };

  switch (sortOption) {
    case "latest":
      filteredConcepts.sort((a, b) => {
        return getConceptTime(b) - getConceptTime(a);
      });
      break;
    case "oldest":
      filteredConcepts.sort((a, b) => {
        return getConceptTime(a) - getConceptTime(b);
      });
      break;
    case "a-z":
      filteredConcepts.sort((a, b) => {
        const targetLanguage = document.getElementById("target-language").value;
        const wordA =
          a.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        const wordB =
          b.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        return wordA.localeCompare(wordB);
      });
      break;
    case "z-a":
      filteredConcepts.sort((a, b) => {
        const targetLanguage = document.getElementById("target-language").value;
        const wordA =
          a.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        const wordB =
          b.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        return wordB.localeCompare(wordA);
      });
      break;
  }
}

// 개념 목록 표시 함수 (디버깅 개선)
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  console.log("displayConceptList 호출됨");
  console.log("concept-list 요소:", conceptList);

  if (!conceptList) {
    console.error("concept-list 요소를 찾을 수 없습니다!");
    return;
  }

  console.log("개념 목록 표시 시작:", {
    totalFiltered: filteredConcepts.length,
    displayCount: displayCount,
  });

  // 표시할 개념 선택
  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  console.log(
    "표시할 개념들:",
    conceptsToShow.map((c) => ({
      id: c.id || c._id,
      sourceWord:
        c.expressions?.[document.getElementById("source-language").value]?.word,
      targetWord:
        c.expressions?.[document.getElementById("target-language").value]?.word,
    }))
  );

  // 개념 수 업데이트
  if (conceptCount) {
    conceptCount.textContent = filteredConcepts.length;
    console.log("개념 수 업데이트:", filteredConcepts.length);
  }

  if (conceptsToShow.length === 0) {
    console.log("표시할 개념이 없음");
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        표시할 개념이 없습니다. 다른 언어 조합이나 필터를 시도해보세요.
      </div>
    `;
    loadMoreBtn.classList.add("hidden");
    return;
  }

  // 개념 카드 생성 및 표시
  const cardHTMLs = conceptsToShow
    .map((concept, index) => {
      const cardHTML = createConceptCard(concept);
      if (!cardHTML) {
        console.log(`카드 ${index} 생성 실패:`, concept.id || concept._id);
      }
      return cardHTML;
    })
    .filter((html) => html); // 빈 HTML 제거

  console.log(`${cardHTMLs.length}개의 카드 HTML 생성됨`);
  console.log(
    "첫 번째 카드 HTML 샘플:",
    cardHTMLs[0]?.substring(0, 200) + "..."
  );

  // DOM에 HTML 삽입 전 현재 상태 확인
  console.log(
    "DOM 삽입 전 conceptList.innerHTML:",
    conceptList.innerHTML.length > 0 ? "내용 있음" : "비어있음"
  );

  // HTML 삽입
  conceptList.innerHTML = cardHTMLs.join("");

  // DOM 삽입 후 확인
  console.log(
    "DOM 삽입 후 conceptList.innerHTML:",
    conceptList.innerHTML.length > 0
      ? `${conceptList.innerHTML.length}자`
      : "비어있음"
  );
  console.log(
    "DOM 삽입 후 conceptList.children.length:",
    conceptList.children.length
  );

  // 강제 테스트 요소 추가 (디버깅용)
  if (conceptList.children.length === 0) {
    console.log("카드가 삽입되지 않았습니다. 테스트 요소를 추가합니다.");
    conceptList.innerHTML =
      '<div style="padding: 20px; background: red; color: white; text-align: center;">테스트 요소 - 이게 보이면 DOM 조작은 정상입니다</div>';
    setTimeout(() => {
      console.log("3초 후 다시 시도합니다.");
      conceptList.innerHTML = cardHTMLs.join("");
      console.log(
        "재시도 후 conceptList.children.length:",
        conceptList.children.length
      );
    }, 3000);
  }

  // 실제 DOM 요소들 확인
  const insertedCards = conceptList.querySelectorAll(".concept-card");
  console.log("삽입된 concept-card 요소 수:", insertedCards.length);

  // 첫 번째 카드 요소 확인
  if (insertedCards.length > 0) {
    console.log("첫 번째 카드 요소:", insertedCards[0]);
    console.log("첫 번째 카드 스타일:", getComputedStyle(insertedCards[0]));
  }

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.classList.remove("hidden");
      console.log("더 보기 버튼 표시");
    } else {
      loadMoreBtn.classList.add("hidden");
      console.log("더 보기 버튼 숨김");
    }
  }

  console.log("개념 목록 표시 완료");
}

// 더 보기 버튼 처리
function handleLoadMore() {
  displayCount += 12;
  displayConceptList();
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

    console.log("개념 데이터 가져오기 시작...");

    // concepts 컬렉션에서 created_at 기준으로 정렬하여 가져오기
    const conceptsRef = collection(db, "concepts");

    try {
      // created_at으로 정렬해서 가져오기 시도
      const queryWithOrder = query(conceptsRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(queryWithOrder);

      allConcepts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외 (다국어 단어장에서는 수동 생성 개념만 표시)
        if (!data.isAIGenerated) {
          allConcepts.push(data);
        }
      });

      console.log(
        `orderBy(created_at)로 ${allConcepts.length}개의 수동 생성 개념을 가져왔습니다.`
      );
    } catch (orderByError) {
      console.warn("created_at으로 정렬 실패, 전체 조회로 대체:", orderByError);

      // orderBy 실패 시 전체 조회 후 JavaScript 정렬
      const querySnapshot = await getDocs(conceptsRef);

      allConcepts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외 (다국어 단어장에서는 수동 생성 개념만 표시)
        if (!data.isAIGenerated) {
          allConcepts.push(data);
        }
      });

      // JavaScript에서 정렬 (created_at이 없는 경우 최신으로 간주)
      allConcepts.sort((a, b) => {
        const getTime = (concept) => {
          // 최상위 레벨 created_at만 처리
          if (concept.created_at) {
            return concept.created_at.toDate
              ? concept.created_at.toDate().getTime()
              : new Date(concept.created_at).getTime();
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

      console.log(
        `전체 조회 후 정렬로 ${allConcepts.length}개의 수동 생성 개념을 가져왔습니다.`
      );
    }

    allConcepts.forEach((data) => {
      // 생성 시간 정보도 로그에 포함
      const createdAt = data.created_at
        ? data.created_at.toDate
          ? data.created_at.toDate()
          : new Date(data.created_at)
        : data.timestamp
        ? data.timestamp.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp)
        : null;

      console.log("가져온 개념:", {
        id: data.id,
        domain: data.concept_info?.domain || data.domain,
        category: data.concept_info?.category || data.category,
        expressions: Object.keys(data.expressions || {}),
        structure: data.concept_info ? "new" : "legacy",
        createdAt: createdAt
          ? createdAt.toLocaleString("ko-KR")
          : "시간 정보 없음",
        koreanWord: data.expressions?.korean?.word,
        englishWord: data.expressions?.english?.word,
        hasCreatedAt: !!data.created_at,
        hasTimestamp: !!data.timestamp,
      });
    });

    // 즉시 DOM 상태 확인 (디버깅용)
    console.log("=== DOM 상태 확인 ===");
    const conceptListElement = document.getElementById("concept-list");
    console.log("concept-list 요소:", conceptListElement);
    console.log("concept-list 부모:", conceptListElement?.parentElement);
    console.log(
      "concept-list 스타일:",
      conceptListElement ? getComputedStyle(conceptListElement) : "요소 없음"
    );

    // 현재 필터로 검색 및 표시
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      categoryFilter: document.getElementById("category-filter"),
      sortOption: document.getElementById("sort-option"),
    };

    console.log("검색 요소들:", elements);

    handleSearch(elements);
  } catch (error) {
    console.error("개념 데이터 가져오기 중 오류 발생:", error);
    throw error;
  }
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

// 개념 상세 보기 모달 열기 함수 (전역 함수, ID 조회 개선)
window.openConceptViewModal = async function (conceptId) {
  try {
    console.log("모달 열기 시도, conceptId:", conceptId);

    // conceptUtils가 정의되어 있는지 확인
    if (!conceptUtils) {
      throw new Error("conceptUtils가 정의되지 않았습니다.");
    }

    // 현재 선택된 언어 설정 가져오기
    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    console.log("현재 언어 설정:", { sourceLanguage, targetLanguage });

    // 먼저 메모리에서 개념 찾기 (빠른 검색)
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    console.log("메모리에서 개념 찾기 결과:", conceptData ? "발견" : "없음");

    // 메모리에서 찾지 못했으면 Firebase에서 조회
    if (!conceptData) {
      console.log("Firebase에서 개념 조회 시도...");
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
        console.log("Firebase 조회 결과:", conceptData);
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
          console.log(
            "단어 조합으로 재검색 결과:",
            conceptData ? "발견" : "없음"
          );
        }
      }
    }

    if (!conceptData) {
      console.error("개념을 찾을 수 없습니다. conceptId:", conceptId);
      console.log(
        "사용 가능한 개념들:",
        allConcepts.map((c) => ({
          id: c.id || c._id,
          sourceWord: c.expressions?.[sourceLanguage]?.word,
          targetWord: c.expressions?.[targetLanguage]?.word,
        }))
      );
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
    // 모달 표시
    modal.classList.remove("hidden");

    console.log("모달 열기 완료");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    console.error("Error stack:", error.stack);
    alert("개념 정보를 불러올 수 없습니다: " + error.message);
  }
};

// 개념 상세 보기 모달 내용 채우기 (확장된 구조 지원)
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  const modal = document.getElementById("concept-view-modal");
  if (!modal) return;

  console.log("모달 요소 구조 확인:", modal);
  console.log("사용할 언어 설정:", { sourceLanguage, targetLanguage });

  // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
  const conceptInfo = conceptData.concept_info || {
    domain: conceptData.domain || "기타",
    category: conceptData.category || "일반",
    unicode_emoji: conceptData.emoji || "📝",
    color_theme: conceptData.color_theme || "#4B63AC",
  };

  console.log("개념 정보:", conceptInfo);
  console.log("개념 데이터의 이모지:", conceptInfo.unicode_emoji);
  console.log("개념 데이터 전체:", conceptData);

  // 색상 테마 가져오기 (안전한 fallback)
  const colorTheme =
    conceptInfo.color_theme || conceptData.color_theme || "#4B63AC";

  // 이모지 가져오기 (실제 데이터 구조에 맞게 우선순위 조정)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "📝";

  // 기본 정보 설정 (선택된 언어에 맞게)
  const conceptEmoji = document.getElementById("concept-view-emoji");
  const conceptPrimaryWord = document.getElementById("concept-primary-word");
  const conceptPrimaryPronunciation = document.getElementById(
    "concept-primary-pronunciation"
  );
  const conceptCategory = document.getElementById("concept-category");
  const conceptDomain = document.getElementById("concept-domain");

  // 원본 언어의 표현 가져오기 (새 구조와 기존 구조 모두 지원)
  const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
  const targetExpression = conceptData.expressions?.[targetLanguage] || {};

  // 간단하게 innerHTML로 상단 영역 구성 (언어탭 방식과 동일) - 대상언어 우선
  if (conceptEmoji) {
    console.log("concept-view-emoji 요소 찾음:", conceptEmoji);
    console.log("설정할 이모지:", emoji);
    conceptEmoji.innerHTML = emoji;
    console.log("이모지 설정 후 innerHTML:", conceptEmoji.innerHTML);
    console.log("이모지 설정 후 textContent:", conceptEmoji.textContent);
  } else {
    console.error("concept-view-emoji 요소를 찾을 수 없습니다!");
    // 모든 이모지 관련 요소 확인
    const allElements = document.querySelectorAll('[id*="emoji"]');
    console.log("이모지 관련 요소들:", allElements);
    // 모달 내부의 모든 요소 확인
    const modalElements = modal.querySelectorAll("*[id]");
    console.log("모달 내부 ID 요소들:", modalElements);
  }

  if (conceptPrimaryWord) {
    if (targetExpression.word) {
      conceptPrimaryWord.textContent = targetExpression.word;
    } else {
      conceptPrimaryWord.textContent = "N/A";
    }
  }

  if (conceptPrimaryPronunciation) {
    conceptPrimaryPronunciation.textContent =
      targetExpression.pronunciation || targetExpression.romanization || "";
  }

  if (conceptCategory) {
    conceptCategory.textContent = conceptInfo.category;
  }

  if (conceptDomain) {
    conceptDomain.textContent = conceptInfo.domain;
  }

  // 언어별 표현 정보 채우기
  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);
}

// 언어별 표현 정보 채우기 함수 (확장된 구조 지원)
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  const tabContainer = document.getElementById("concept-view-tabs");
  const contentContainer = document.getElementById("concept-view-content");

  if (!tabContainer || !contentContainer) {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabContainer,
      contentContainer,
    });
    return;
  }

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // 언어탭 순서: 원본 언어, 대상 언어, 나머지 언어들
  const orderedLanguages = [];

  // 1. 원본 언어가 있으면 먼저 추가
  if (conceptData.expressions?.[sourceLanguage]?.word) {
    orderedLanguages.push(sourceLanguage);
  }

  // 2. 대상 언어가 있고 원본 언어와 다르면 추가
  if (
    conceptData.expressions?.[targetLanguage]?.word &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(targetLanguage);
  }

  // 3. 나머지 언어들 추가
  Object.keys(conceptData.expressions || {}).forEach((langCode) => {
    if (
      !orderedLanguages.includes(langCode) &&
      conceptData.expressions[langCode]?.word
    ) {
      orderedLanguages.push(langCode);
    }
  });

  // 각 언어별 탭과 컨텐츠 생성
  orderedLanguages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
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
    tab.textContent = langInfo.nameKo;
    tab.onclick = () => switchViewTab(langCode);

    tabContainer.appendChild(tab);

    // 컨텐츠 패널 생성
    const panel = document.createElement("div");
    panel.id = `view-${langCode}-content`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4`;

    // 새로운 구조의 추가 정보 포함
    const synonyms = expression.synonyms ? expression.synonyms.join(", ") : "";
    const antonyms = expression.antonyms ? expression.antonyms.join(", ") : "";
    const wordFamily = expression.word_family
      ? expression.word_family.join(", ")
      : "";
    const compoundWords = expression.compound_words
      ? expression.compound_words.join(", ")
      : "";

    // 연어 정보 처리
    let collocationsText = "";
    if (expression.collocations && Array.isArray(expression.collocations)) {
      collocationsText = expression.collocations
        .map((col) =>
          typeof col === "object" ? `${col.phrase} (${col.frequency})` : col
        )
        .join(", ");
    }

    panel.innerHTML = `
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-xl font-bold">${expression.word}</h3>
          <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">${
            expression.part_of_speech || "정보 없음"
          }</span>
        </div>
        <p class="text-gray-500">${
          expression.pronunciation || expression.romanization || ""
        }</p>
        ${
          langCode === "japanese" && expression.hiragana
            ? `<p class="text-sm text-gray-600">히라가나: ${expression.hiragana}</p>`
            : ""
        }
        ${
          langCode === "japanese" && expression.katakana
            ? `<p class="text-sm text-gray-600">가타카나: ${expression.katakana}</p>`
            : ""
        }
        ${
          langCode === "japanese" && expression.kanji
            ? `<p class="text-sm text-gray-600">한자: ${expression.kanji}</p>`
            : ""
        }
      </div>
      <div class="mb-4">
        <p class="text-sm text-gray-700 mb-1">의미/정의:</p>
        <p>${expression.definition || "정의 없음"}</p>
      </div>
      <div class="grid grid-cols-1 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-700 mb-1">난이도:</p>
          <p>${expression.level || "정보 없음"}</p>
        </div>
        ${
          synonyms
            ? `
        <div>
          <p class="text-sm text-gray-700 mb-1">동의어:</p>
          <p>${synonyms}</p>
        </div>
        `
            : ""
        }
        ${
          antonyms
            ? `
        <div>
          <p class="text-sm text-gray-700 mb-1">반의어:</p>
          <p>${antonyms}</p>
        </div>
        `
            : ""
        }
        ${
          wordFamily
            ? `
        <div>
          <p class="text-sm text-gray-700 mb-1">어족:</p>
          <p>${wordFamily}</p>
        </div>
        `
            : ""
        }
        ${
          compoundWords
            ? `
        <div>
          <p class="text-sm text-gray-700 mb-1">복합어:</p>
          <p>${compoundWords}</p>
        </div>
        `
            : ""
        }
        ${
          collocationsText
            ? `
        <div>
          <p class="text-sm text-gray-700 mb-1">연어:</p>
          <p>${collocationsText}</p>
        </div>
        `
            : ""
        }
      </div>
    `;

    contentContainer.appendChild(panel);
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
    }

    // 해당 언어의 예문만 표시
    updateExamples(langCode, conceptData);
  };

  // 모달 버튼 이벤트 설정
  setupModalButtons(conceptData);

  // 초기 예문 표시 (첫 번째 탭 언어)
  if (orderedLanguages.length > 0) {
    updateExamples(orderedLanguages[0], conceptData);
  }
}

// 모달 버튼 이벤트 설정
function setupModalButtons(conceptData) {
  // 편집 버튼 이벤트
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 개념 수정 모달 열기
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) viewModal.classList.add("hidden");

      window.openConceptModal(conceptData.id || conceptData._id);
    };
  }

  // 삭제 버튼 이벤트
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (confirm("정말로 이 개념을 삭제하시겠습니까?")) {
        try {
          await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
          alert("개념이 성공적으로 삭제되었습니다.");

          // 모달 닫기
          const viewModal = document.getElementById("concept-view-modal");
          if (viewModal) viewModal.classList.add("hidden");

          // 목록 새로고침
          window.dispatchEvent(new CustomEvent("concept-saved"));
        } catch (error) {
          console.error("개념 삭제 중 오류 발생:", error);
          alert("개념 삭제 중 오류가 발생했습니다: " + error.message);
        }
      }
    };
  }

  // 모달 닫기 버튼 이벤트
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    closeButton.onclick = () => {
      const modal = document.getElementById("concept-view-modal");
      if (modal) modal.classList.add("hidden");
    };
  }
}

// 특정 언어의 예문만 표시하는 함수 (확장된 구조 지원)
function updateExamples(langCode, conceptData) {
  const examplesContainer = document.getElementById("concept-view-examples");

  console.log("예문 업데이트 - 언어:", langCode);
  console.log(
    "전체 예문 데이터:",
    conceptData.featured_examples || conceptData.examples
  );

  if (!examplesContainer) return;

  examplesContainer.innerHTML = "";

  // 새로운 구조의 featured_examples 우선 사용, 없으면 기존 examples 사용
  const examples = conceptData.featured_examples || conceptData.examples || [];

  if (examples.length > 0) {
    console.log("예문 개수:", examples.length);

    examples.forEach((example, index) => {
      console.log(`예문 ${index + 1}:`, example);

      const exampleDiv = document.createElement("div");
      exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

      const sourceLanguage = document.getElementById("source-language").value;
      const targetLanguage = document.getElementById("target-language").value;

      let exampleContent = "";
      const languagesToShow = [];

      // 새로운 구조 처리 (featured_examples)
      if (example.translations) {
        // 1. 대상언어 먼저 추가
        if (targetLanguage && example.translations[targetLanguage]) {
          const targetLangInfo = supportedLanguages[targetLanguage] || {
            nameKo: targetLanguage,
          };
          languagesToShow.push({
            code: targetLanguage,
            name: targetLangInfo.nameKo,
            text: example.translations[targetLanguage].text,
            label: "(대상)",
            grammar: example.translations[targetLanguage].grammar_notes,
          });
        }

        // 2. 원본언어 추가
        if (
          sourceLanguage &&
          example.translations[sourceLanguage] &&
          sourceLanguage !== targetLanguage
        ) {
          const sourceLangInfo = supportedLanguages[sourceLanguage] || {
            nameKo: sourceLanguage,
          };
          languagesToShow.push({
            code: sourceLanguage,
            name: sourceLangInfo.nameKo,
            text: example.translations[sourceLanguage].text,
            label: "(원본)",
            grammar: example.translations[sourceLanguage].grammar_notes,
          });
        }

        // 3. 현재 탭 언어 추가
        if (
          example.translations[langCode] &&
          !languagesToShow.find((lang) => lang.code === langCode)
        ) {
          const currentLangInfo = supportedLanguages[langCode] || {
            nameKo: langCode,
          };
          languagesToShow.push({
            code: langCode,
            name: currentLangInfo.nameKo,
            text: example.translations[langCode].text,
            label: "(현재)",
            grammar: example.translations[langCode].grammar_notes,
          });
        }
      }
      // 기존 구조 처리 (examples)
      else {
        // 1. 대상언어 먼저 추가
        if (targetLanguage && example[targetLanguage]) {
          const targetLangInfo = supportedLanguages[targetLanguage] || {
            nameKo: targetLanguage,
          };
          languagesToShow.push({
            code: targetLanguage,
            name: targetLangInfo.nameKo,
            text: example[targetLanguage],
            label: "(대상)",
          });
        }

        // 2. 원본언어 추가
        if (
          sourceLanguage &&
          example[sourceLanguage] &&
          sourceLanguage !== targetLanguage
        ) {
          const sourceLangInfo = supportedLanguages[sourceLanguage] || {
            nameKo: sourceLanguage,
          };
          languagesToShow.push({
            code: sourceLanguage,
            name: sourceLangInfo.nameKo,
            text: example[sourceLanguage],
            label: "(원본)",
          });
        }

        // 3. 현재 탭 언어 추가
        if (
          example[langCode] &&
          !languagesToShow.find((lang) => lang.code === langCode)
        ) {
          const currentLangInfo = supportedLanguages[langCode] || {
            nameKo: langCode,
          };
          languagesToShow.push({
            code: langCode,
            name: currentLangInfo.nameKo,
            text: example[langCode],
            label: "(현재)",
          });
        }
      }

      // 예문 컨텐츠 생성
      languagesToShow.forEach((lang) => {
        exampleContent += `
          <div class="mb-3">
            <p class="text-sm font-medium text-gray-700 mb-1">
              ${lang.name} ${lang.label}
            </p>
            <p class="text-gray-900">${lang.text}</p>
            ${
              lang.grammar
                ? `<p class="text-xs text-gray-500 mt-1">문법: ${lang.grammar}</p>`
                : ""
            }
          </div>
        `;
      });

      // 추가 정보 표시 (새로운 구조에서만)
      if (example.context || example.priority || example.unicode_emoji) {
        exampleContent += `
          <div class="border-t pt-3 mt-3 text-xs text-gray-500">
            ${
              example.unicode_emoji
                ? `<span class="mr-2">${example.unicode_emoji}</span>`
                : ""
            }
            ${example.context ? `맥락: ${example.context}` : ""}
            ${example.priority ? ` | 우선순위: ${example.priority}` : ""}
          </div>
        `;
      }

      exampleDiv.innerHTML = exampleContent;
      examplesContainer.appendChild(exampleDiv);
    });
  } else {
    console.log("해당 언어의 예문이 없습니다.");
    examplesContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <p>해당 언어의 예문이 없습니다.</p>
      </div>
    `;
  }
}

// 언어 전환 함수
function swapLanguages(elements) {
  const sourceLanguage = elements.sourceLanguage.value;
  const targetLanguage = elements.targetLanguage.value;

  // 같은 언어인 경우 전환하지 않음
  if (sourceLanguage === targetLanguage) {
    return;
  }

  // 버튼 애니메이션 효과
  const swapButton = elements.swapLanguagesBtn;
  const icon = swapButton.querySelector("i");

  // 회전 애니메이션 추가
  icon.style.transform = "rotate(180deg)";
  icon.style.transition = "transform 0.3s ease";

  // 언어 순서 변경
  elements.sourceLanguage.value = targetLanguage;
  elements.targetLanguage.value = sourceLanguage;

  // 버튼 색상 변경으로 피드백 제공
  swapButton.classList.add("text-[#4B63AC]", "bg-gray-100");

  // 검색 및 화면 업데이트
  handleSearch(elements);

  // 애니메이션 후 원래 상태로 복원
  setTimeout(() => {
    icon.style.transform = "rotate(0deg)";
    swapButton.classList.remove("text-[#4B63AC]", "bg-gray-100");
  }, 300);
}
