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

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
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

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
      } else {
        alert("로그인이 필요합니다.");
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
          <strong class="font-bold">오류 발생!</strong>
          <span class="block sm:inline">페이지를 불러오는 중 문제가 발생했습니다.</span>
          <span class="block mt-2">자세한 내용: ${error.message}</span>
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
          <h2 class="text-xl font-bold">${emoji} ${sourceExpression.word}</h2>
          <p class="text-sm text-gray-500">${
            sourceExpression.pronunciation || ""
          }</p>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${concept.concept_info.domain}/${concept.concept_info.category}
        </span>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="text-gray-500 text-sm mr-2">
            ${
              targetLanguage === "korean"
                ? "뜻:"
                : targetLanguage === "english"
                ? "Meaning:"
                : targetLanguage === "japanese"
                ? "意味:"
                : targetLanguage === "chinese"
                ? "意思:"
                : "뜻:"
            }
          </span>
          <span class="font-medium">${targetExpression.word}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          targetExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-xs text-gray-500 mb-1">
          ${
            targetLanguage === "korean"
              ? "예문:"
              : targetLanguage === "english"
              ? "Example:"
              : targetLanguage === "japanese"
              ? "例文:"
              : targetLanguage === "chinese"
              ? "例句:"
              : "예문:"
          }
        </p>
        <p class="text-sm mb-1">${example.source}</p>
        <p class="text-sm text-gray-600">${example.target}</p>
      </div>
      `
          : ""
      }
      
      <div class="flex justify-between text-xs text-gray-500 mt-3">
        <span class="flex items-center">
          <i class="fas fa-language mr-1"></i> ${
            Object.keys(concept.expressions).length
          }개 언어
        </span>
        <span class="flex items-center">
          <i class="fas fa-calendar-alt mr-1"></i> ${formatDate(
            concept.created_at
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
    const conceptData = await conceptUtils.getConcept(conceptId);

    if (!conceptData) {
      alert("개념 정보를 찾을 수 없습니다.");
      return;
    }

    const modal = document.getElementById("concept-view-modal");
    if (!modal) return;

    // 모달 콘텐츠 채우기
    fillConceptViewModal(conceptData);

    // 모달 표시
    modal.classList.remove("hidden");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    alert("개념 정보를 불러올 수 없습니다.");
  }
};

// 개념 상세 보기 모달 내용 채우기
function fillConceptViewModal(conceptData) {
  const modal = document.getElementById("concept-view-modal");
  if (!modal) return;

  // 이모지 가져오기
  const emoji = conceptData.concept_info.emoji || "";

  // 기본 정보
  document.getElementById(
    "concept-view-title"
  ).textContent = `${emoji} ${conceptData.concept_info.domain} / ${conceptData.concept_info.category}`;

  // 언어 표현 탭 생성
  const tabContainer = document.getElementById("concept-view-tabs");
  const contentContainer = document.getElementById("concept-view-content");
  const expressionsTitle = document.getElementById(
    "concept-view-expressions-title"
  );

  if (!tabContainer || !contentContainer) return;

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // 초기 언어 설정 (첫 번째 탭 언어)
  let currentLangCode = Object.keys(conceptData.expressions)[0] || "korean";

  // 언어별 표현 제목 업데이트 함수
  const updateExpressionsTitle = (langCode) => {
    if (!expressionsTitle) return;

    if (langCode === "korean") {
      expressionsTitle.textContent = "언어별 표현";
    } else if (langCode === "english") {
      expressionsTitle.textContent = "Expressions";
    } else if (langCode === "japanese") {
      expressionsTitle.textContent = "言語表現";
    } else if (langCode === "chinese") {
      expressionsTitle.textContent = "语言表达";
    } else {
      expressionsTitle.textContent = "언어별 표현";
    }
  };

  // 초기 언어별 표현 제목 설정
  updateExpressionsTitle(currentLangCode);

  // 각 언어별 탭과 컨텐츠 생성
  Object.entries(conceptData.expressions).forEach(
    ([langCode, expression], index) => {
      const langInfo = supportedLanguages[langCode] || {
        nameKo: langCode,
        code: langCode,
      };

      // 탭 생성
      const tab = document.createElement("button");
      tab.id = `view-${langCode}-tab`;
      tab.className = `px-4 py-2 ${
        index === 0 ? "bg-blue-500 text-white" : "bg-gray-200"
      }`;
      tab.textContent = langInfo.nameKo;
      tab.onclick = () => switchViewTab(langCode);

      tabContainer.appendChild(tab);

      // 컨텐츠 패널 생성
      const panel = document.createElement("div");
      panel.id = `view-${langCode}-content`;
      panel.className = `${index === 0 ? "" : "hidden"} p-4`;

      // 이모지 사용
      const emoji = conceptData.concept_info.emoji || "";

      // 언어에 따른 레이블 설정
      let definitionLabel, partOfSpeechLabel, levelLabel;

      if (langCode === "korean") {
        definitionLabel = "의미/정의:";
        partOfSpeechLabel = "품사:";
        levelLabel = "난이도:";
      } else if (langCode === "english") {
        definitionLabel = "Definition:";
        partOfSpeechLabel = "Part of Speech:";
        levelLabel = "Level:";
      } else if (langCode === "japanese") {
        definitionLabel = "意味/定義:";
        partOfSpeechLabel = "品詞:";
        levelLabel = "レベル:";
      } else if (langCode === "chinese") {
        definitionLabel = "意思/定义:";
        partOfSpeechLabel = "词性:";
        levelLabel = "级别:";
      } else {
        definitionLabel = "의미/정의:";
        partOfSpeechLabel = "품사:";
        levelLabel = "난이도:";
      }

      panel.innerHTML = `
      <div class="mb-4">
        <h3 class="text-xl font-bold">${emoji} ${expression.word}</h3>
        <p class="text-gray-500">${expression.pronunciation || ""}</p>
      </div>
      <div class="mb-4">
        <p class="text-sm text-gray-700 mb-1">${definitionLabel}</p>
        <p>${expression.definition || "정의 없음"}</p>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-700 mb-1">${partOfSpeechLabel}</p>
          <p>${expression.part_of_speech || "정보 없음"}</p>
        </div>
        <div>
          <p class="text-sm text-gray-700 mb-1">${levelLabel}</p>
          <p>${expression.level || "정보 없음"}</p>
        </div>
      </div>
    `;

      contentContainer.appendChild(panel);
    }
  );

  // 예문 표시
  const examplesContainer = document.getElementById("concept-view-examples");
  const exampleTitle = document.getElementById("concept-view-examples-title");

  if (examplesContainer && exampleTitle) {
    examplesContainer.innerHTML = "";

    // 초기 언어 설정 (첫 번째 탭 언어)
    let currentLangCode = Object.keys(conceptData.expressions)[0] || "korean";

    // 예문 제목 업데이트 함수
    const updateExampleTitle = (langCode) => {
      if (langCode === "korean") {
        exampleTitle.textContent = "예문";
      } else if (langCode === "english") {
        exampleTitle.textContent = "Examples";
      } else if (langCode === "japanese") {
        exampleTitle.textContent = "例文";
      } else if (langCode === "chinese") {
        exampleTitle.textContent = "例句";
      } else {
        exampleTitle.textContent = "예문";
      }
    };

    // 버튼 텍스트 업데이트 함수
    const updateButtonTexts = (langCode) => {
      const closeBtn = document.getElementById("close-concept-view-btn");
      const editBtn = document.getElementById("edit-concept-button");

      if (closeBtn) {
        if (langCode === "korean") closeBtn.textContent = "닫기";
        else if (langCode === "english") closeBtn.textContent = "Close";
        else if (langCode === "japanese") closeBtn.textContent = "閉じる";
        else if (langCode === "chinese") closeBtn.textContent = "关闭";
        else closeBtn.textContent = "닫기";
      }

      if (editBtn) {
        if (langCode === "korean") editBtn.textContent = "편집";
        else if (langCode === "english") editBtn.textContent = "Edit";
        else if (langCode === "japanese") editBtn.textContent = "編集";
        else if (langCode === "chinese") editBtn.textContent = "编辑";
        else editBtn.textContent = "편집";
      }
    };

    // 초기 텍스트 설정
    updateExampleTitle(currentLangCode);
    updateButtonTexts(currentLangCode);

    // 탭 전환 함수 정의
    window.switchViewTab = (langCode) => {
      currentLangCode = langCode;

      // 모든 탭 비활성화
      document.querySelectorAll("[id^='view-'][id$='-tab']").forEach((tab) => {
        tab.classList.remove("bg-blue-500", "text-white");
        tab.classList.add("bg-gray-200");
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
        selectedTab.classList.remove("bg-gray-200");
        selectedTab.classList.add("bg-blue-500", "text-white");
      }

      // 선택된 컨텐츠 표시
      const selectedContent = document.getElementById(
        `view-${langCode}-content`
      );
      if (selectedContent) {
        selectedContent.classList.remove("hidden");
      }

      // 모든 제목과 버튼 텍스트 업데이트
      updateExpressionsTitle(langCode);
      updateExampleTitle(langCode);
      updateButtonTexts(langCode);

      // "예문 없음" 메시지도 언어에 맞게 업데이트
      if (conceptData.examples && conceptData.examples.length === 0) {
        const noExamplesMessage =
          langCode === "korean"
            ? "등록된 예문이 없습니다."
            : langCode === "english"
            ? "No examples available."
            : langCode === "japanese"
            ? "例文はありません。"
            : langCode === "chinese"
            ? "没有例句。"
            : "등록된 예문이 없습니다.";

        examplesContainer.innerHTML = `<p class="text-gray-500">${noExamplesMessage}</p>`;
      }
    };

    if (conceptData.examples && conceptData.examples.length > 0) {
      conceptData.examples.forEach((example) => {
        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4";

        let exampleContent = "";

        Object.entries(example).forEach(([langCode, text]) => {
          const langInfo = supportedLanguages[langCode] || { nameKo: langCode };
          exampleContent += `
            <div class="mb-2">
              <span class="text-sm text-gray-600">${langInfo.nameKo}:</span>
              <p class="ml-2">${text}</p>
            </div>
          `;
        });

        exampleDiv.innerHTML = exampleContent;
        examplesContainer.appendChild(exampleDiv);
      });
    } else {
      // 언어에 따른, "등록된 예문이 없습니다." 메시지
      const noExamplesMessage =
        currentLangCode === "korean"
          ? "등록된 예문이 없습니다."
          : currentLangCode === "english"
          ? "No examples available."
          : currentLangCode === "japanese"
          ? "例文はありません。"
          : currentLangCode === "chinese"
          ? "没有例句。"
          : "등록된 예문이 없습니다.";

      examplesContainer.innerHTML = `<p class="text-gray-500">${noExamplesMessage}</p>`;
    }
  }

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
}

// 상세 보기 탭 전환 함수는 fillConceptViewModal 함수 내에서 정의했으므로 여기서는 제거합니다.
