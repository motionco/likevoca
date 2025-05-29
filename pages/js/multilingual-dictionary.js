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
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key];
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

// 개념 카드 생성 함수
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  // 원본 언어와 타겟 언어 표현 가져오기
  const sourceExpression = concept.expressions[sourceLanguage];
  const targetExpression = concept.expressions[targetLanguage];

  if (!sourceExpression || !targetExpression) {
    return ""; // 두 언어 모두 없으면 표시하지 않음
  }

  // 예제 문장 (첫 번째만 사용)
  const example =
    concept.examples && concept.examples.length > 0
      ? {
          source: concept.examples[0][sourceLanguage],
          target: concept.examples[0][targetLanguage],
        }
      : null;

  // 카드 색상
  const colors = {
    daily: "bg-blue-50",
    food: "bg-green-50",
    animal: "bg-yellow-50",
    travel: "bg-purple-50",
    business: "bg-gray-50",
    education: "bg-orange-50",
  };

  const cardColor = colors[concept.concept_info.domain] || "bg-gray-50";

  // 이모지 표시를 위한 코드 추가
  const emoji = concept.concept_info.emoji || "";

  return `
    <div 
      class="${cardColor} p-6 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 border border-gray-200 cursor-pointer word-card"
      onclick="window.openConceptViewModal('${concept._id}')"
    >
      <div class="mb-4 flex justify-between items-start">
        <div>
          <h2 class="text-xl font-bold">${emoji} ${targetExpression.word}</h2>
          <p class="text-sm text-gray-500">${
            targetExpression.pronunciation || ""
          }</p>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${concept.concept_info.domain}/${concept.concept_info.category}
        </span>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="text-gray-500 text-sm mr-2">
            ${getTranslatedText("meaning")}
          </span>
          <span class="font-medium">${sourceExpression.word}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          sourceExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-xs text-gray-500 mb-1">
          ${getTranslatedText("example")}
        </p>
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
          <i class="fas fa-clock mr-1"></i> ${formatDate(concept.timestamp)}
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

// 검색 및 필터링 함수
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  const searchValue = elements.searchInput.value.toLowerCase();
  const sourceLanguage = elements.sourceLanguage.value;
  const targetLanguage = elements.targetLanguage.value;
  const categoryFilter = elements.categoryFilter.value;
  const sortOption = elements.sortOption.value;

  // 필터링 로직
  filteredConcepts = allConcepts.filter((concept) => {
    // 두 언어가 모두 있는지 확인
    if (
      !concept.expressions[sourceLanguage] ||
      !concept.expressions[targetLanguage]
    ) {
      return false;
    }

    // 카테고리 필터
    if (
      categoryFilter !== "all" &&
      concept.concept_info.category !== categoryFilter
    ) {
      return false;
    }

    // 검색어 필터
    if (searchValue) {
      const sourceWord = concept.expressions[sourceLanguage].word.toLowerCase();
      const targetWord = concept.expressions[targetLanguage].word.toLowerCase();
      const definition =
        concept.expressions[sourceLanguage].definition?.toLowerCase() || "";

      return (
        sourceWord.includes(searchValue) ||
        targetWord.includes(searchValue) ||
        definition.includes(searchValue)
      );
    }

    return true;
  });

  // 정렬
  sortFilteredConcepts(sortOption);

  // 표시
  displayConceptList();
}

// 정렬 함수
function sortFilteredConcepts(sortOption) {
  switch (sortOption) {
    case "latest":
      filteredConcepts.sort((a, b) => {
        const dateA =
          a.created_at instanceof Timestamp
            ? a.created_at.toMillis()
            : new Date(a.created_at).getTime();
        const dateB =
          b.created_at instanceof Timestamp
            ? b.created_at.toMillis()
            : new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      break;
    case "oldest":
      filteredConcepts.sort((a, b) => {
        const dateA =
          a.created_at instanceof Timestamp
            ? a.created_at.toMillis()
            : new Date(a.created_at).getTime();
        const dateB =
          b.created_at instanceof Timestamp
            ? b.created_at.toMillis()
            : new Date(b.created_at).getTime();
        return dateA - dateB;
      });
      break;
    case "a-z":
      filteredConcepts.sort((a, b) => {
        const sourceLanguage = document.getElementById("source-language").value;
        const wordA = a.expressions[sourceLanguage]?.word.toLowerCase() || "";
        const wordB = b.expressions[sourceLanguage]?.word.toLowerCase() || "";
        return wordA.localeCompare(wordB);
      });
      break;
    case "z-a":
      filteredConcepts.sort((a, b) => {
        const sourceLanguage = document.getElementById("source-language").value;
        const wordA = a.expressions[sourceLanguage]?.word.toLowerCase() || "";
        const wordB = b.expressions[sourceLanguage]?.word.toLowerCase() || "";
        return wordB.localeCompare(wordA);
      });
      break;
  }
}

// 개념 목록 표시 함수
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  if (!conceptList) return;

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
    loadMoreBtn.classList.add("hidden");
    return;
  }

  // 개념 카드 생성 및 표시
  conceptList.innerHTML = conceptsToShow.map(createConceptCard).join("");

  // 더 보기 버튼 표시/숨김
  if (filteredConcepts.length > displayCount) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }
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

// 개념 데이터 가져오기
async function fetchAndDisplayConcepts() {
  try {
    if (!currentUser) return;

    // concepts 컬렉션에서 데이터 가져오기
    const conceptsRef = collection(db, "concepts");
    const q = query(conceptsRef, orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);

    allConcepts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allConcepts.push(data);
    });

    // 현재 필터로 검색 및 표시
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      categoryFilter: document.getElementById("category-filter"),
      sortOption: document.getElementById("sort-option"),
    };

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

// 개념 상세 보기 모달 열기 함수 (전역 함수)
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

    console.log("conceptUtils.getConcept 호출 중...");
    const conceptData = await conceptUtils.getConcept(conceptId);

    console.log("개념 데이터 조회 결과:", conceptData);

    if (!conceptData) {
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
    alert("개념 정보를 불러올 수 없습니다.");
  }
};

// 개념 상세 보기 모달 내용 채우기
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  const modal = document.getElementById("concept-view-modal");
  if (!modal) return;

  console.log("모달 요소 구조 확인:", modal);
  console.log("사용할 언어 설정:", { sourceLanguage, targetLanguage });

  console.log("개념 데이터의 이모지:", conceptData.concept_info.emoji);
  console.log("개념 데이터 전체:", conceptData);

  // 이모지 가져오기
  const emoji = conceptData.concept_info.emoji || "📝";

  // 기본 정보 설정 (선택된 언어에 맞게)
  const conceptEmoji = document.getElementById("concept-view-emoji");
  const conceptPrimaryWord = document.getElementById("concept-primary-word");
  const conceptPrimaryPronunciation = document.getElementById(
    "concept-primary-pronunciation"
  );
  const conceptCategory = document.getElementById("concept-category");
  const conceptDomain = document.getElementById("concept-domain");

  // 원본 언어의 표현 가져오기
  const sourceExpression = conceptData.expressions[sourceLanguage];
  const targetExpression = conceptData.expressions[targetLanguage];

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
    if (targetExpression) {
      conceptPrimaryWord.textContent = targetExpression.word;
    } else {
      conceptPrimaryWord.textContent = "N/A";
    }
  }

  if (conceptPrimaryPronunciation) {
    if (targetExpression) {
      conceptPrimaryPronunciation.textContent =
        targetExpression.pronunciation || "";
    } else {
      conceptPrimaryPronunciation.textContent = "";
    }
  }

  if (conceptCategory)
    conceptCategory.textContent = conceptData.concept_info?.category || "기타";
  if (conceptDomain)
    conceptDomain.textContent = conceptData.concept_info?.domain || "일반";

  // 언어 표현 탭 생성
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
  if (conceptData.expressions[sourceLanguage]) {
    orderedLanguages.push(sourceLanguage);
  }

  // 2. 대상 언어가 있고 원본 언어와 다르면 추가
  if (
    conceptData.expressions[targetLanguage] &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(targetLanguage);
  }

  // 3. 나머지 언어들 추가
  Object.keys(conceptData.expressions).forEach((langCode) => {
    if (!orderedLanguages.includes(langCode)) {
      orderedLanguages.push(langCode);
    }
  });

  // 각 언어별 탭과 컨텐츠 생성 (순서 변경됨)
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

    // 언어에 따른 레이블 설정
    let definitionLabel = "의미/정의:";
    let partOfSpeechLabel = "품사:";
    let levelLabel = "난이도:";

    // 이모지 제거된 패널 내용
    panel.innerHTML = `
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-xl font-bold">${expression.word}</h3>
          <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">${
            expression.part_of_speech || "정보 없음"
          }</span>
        </div>
        <p class="text-gray-500">${expression.pronunciation || ""}</p>
      </div>
      <div class="mb-4">
        <p class="text-sm text-gray-700 mb-1">${definitionLabel}</p>
        <p>${expression.definition || "정의 없음"}</p>
      </div>
      <div class="grid grid-cols-1 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-700 mb-1">${levelLabel}</p>
          <p>${expression.level || "정보 없음"}</p>
        </div>
      </div>
    `;

    contentContainer.appendChild(panel);
  });

  // 예문 표시는 탭 전환 시 동적으로 처리

  // 편집 버튼 이벤트
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 개념 수정 모달 열기
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) viewModal.classList.add("hidden");

      window.openConceptModal(conceptData._id);
    };
  }

  // 삭제 버튼 이벤트
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (confirm("정말로 이 개념을 삭제하시겠습니까?")) {
        try {
          await conceptUtils.deleteConcept(conceptData._id);
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
      modal.classList.add("hidden");
    };
  }

  // 탭 전환 함수 정의 (예문 필터링 포함)
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

  // 초기 예문 표시 (첫 번째 탭 언어)
  if (orderedLanguages.length > 0) {
    updateExamples(orderedLanguages[0], conceptData);
  }
}

// 특정 언어의 예문만 표시하는 함수
function updateExamples(langCode, conceptData) {
  const examplesContainer = document.getElementById("concept-view-examples");

  console.log("예문 업데이트 - 언어:", langCode);
  console.log("전체 예문 데이터:", conceptData.examples);

  if (!examplesContainer) return;

  examplesContainer.innerHTML = "";

  if (conceptData.examples && conceptData.examples.length > 0) {
    console.log("예문 개수:", conceptData.examples.length);

    const filteredExamples = conceptData.examples.filter(
      (example) => example[langCode]
    );
    console.log("필터링된 예문:", filteredExamples);

    if (filteredExamples.length > 0) {
      filteredExamples.forEach((example, index) => {
        console.log(`예문 ${index + 1}:`, example);

        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

        // 현재 탭 언어, 원본 언어, 대상 언어의 예문을 모두 표시
        const sourceLanguage = document.getElementById("source-language").value;
        const targetLanguage = document.getElementById("target-language").value;

        let exampleContent = "";

        // 대상언어 → 원본언어 순서로 표시 (현재 탭 언어와 관계없이)
        const languagesToShow = [];

        // 1. 대상언어 먼저 추가 (있는 경우)
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

        // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
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

        // 3. 현재 탭 언어 추가 (위에 추가되지 않은 경우만)
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
            label: "",
          });
        }

        // 언어들을 순서대로 표시
        languagesToShow.forEach((lang, index) => {
          const isFirst = index === 0;
          exampleContent += `
            <div class="${
              isFirst ? "mb-3" : "mb-2 pl-4 border-l-2 border-gray-300"
            }">
              <span class="text-sm ${
                isFirst ? "font-medium text-blue-600" : "text-gray-600"
              }">${lang.name}${lang.label}:</span>
              <p class="ml-2 ${
                isFirst ? "font-medium text-gray-800" : "text-gray-700"
              }">${lang.text}</p>
            </div>
          `;
        });

        exampleDiv.innerHTML = exampleContent;
        examplesContainer.appendChild(exampleDiv);
      });
    } else {
      console.log(`${langCode} 언어의 예문이 없음`);
      examplesContainer.innerHTML = `<p class="text-gray-500">이 언어의 예문이 없습니다.</p>`;
    }
  } else {
    console.log("전체 예문이 없음");
    examplesContainer.innerHTML = `<p class="text-gray-500">등록된 예문이 없습니다.</p>`;
  }
}
