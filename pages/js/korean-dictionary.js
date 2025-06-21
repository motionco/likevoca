import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth, db } from "../../js/firebase/firebase-init.js";
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
  increment,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { loadModals } from "../../utils/word-list-utils.js";
import {
  showKoreanWordModal,
  initialize as initializeWordViewModal,
} from "../../components/js/korean-word-modal.js";
import { initialize as initializeAddWordModal } from "../../components/js/add-korean-word-modal.js";
import { initialize as initializeBulkAddModal } from "../../components/js/bulk-add-korean-words-modal.js";
// 필터 공유 모듈 import
import {
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";

let currentUser = null;
let allWords = [];
let filteredWords = [];
let displayCount = 12;

// 전역 윈도우에 함수 등록
window.showKoreanWordModal = showKoreanWordModal;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    loadNavbar();
    await loadModals([
      "../components/add-korean-word-modal.html",
      "../components/korean-word-modal.html",
      "../components/bulk-add-korean-words-modal.html",
    ]);

    // 모달 초기화 함수 호출 추가
    initializeAddWordModal();
    initializeWordViewModal();
    initializeBulkAddModal();

    const elements = {
      addWordBtn: document.getElementById("add-word"),
      bulkAddWordBtn: document.getElementById("bulk-add-word"),
      searchInput: document.getElementById("search-input"),
      searchDirection: document.getElementById("search-direction"),
      languageFilter: document.getElementById("language-filter"),
      categoryFilter: document.getElementById("category-filter"),
      levelFilter: document.getElementById("level-filter"),
      sortOption: document.getElementById("sort-option"),
      loadMoreBtn: document.getElementById("load-more"),
    };

    if (elements.addWordBtn) {
      elements.addWordBtn.addEventListener("click", () => {
        const modal = document.getElementById("korean-word-modal");
        if (modal) {
          modal.classList.remove("hidden");
          // 직접 초기화 함수 호출 추가
          if (sessionStorage.getItem("isEditMode") === "true") {
            setTimeout(() => {
              // add-korean-word-modal.js의 checkEditMode 함수를 호출
              const checkEditModeFn =
                window.checkEditMode ||
                (() => {
                  console.log("checkEditMode 함수를 찾을 수 없습니다.");
                });
              checkEditModeFn();
            }, 100);
          }
        }
      });
    }

    // 대량 단어 추가 버튼 이벤트 리스너 추가
    if (elements.bulkAddWordBtn) {
      elements.bulkAddWordBtn.addEventListener("click", () => {
        const modal = document.getElementById("bulk-korean-word-modal");
        if (modal) modal.classList.remove("hidden");
      });
    }

    // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
    const filterManager = setupVocabularyFilters(() => {
      handleSearch(elements);
    });

    // 한국어 사전 전용 필터들
    if (elements.searchDirection) {
      elements.searchDirection.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.languageFilter) {
      elements.languageFilter.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.categoryFilter) {
      elements.categoryFilter.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    if (elements.levelFilter) {
      elements.levelFilter.addEventListener("change", () =>
        handleSearch(elements)
      );
    }

    // 더 보기 버튼 이벤트 리스너
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener("click", () => handleLoadMore());
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await fetchAndDisplayWords();
        await updateUsageUI();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
    // 에러 메시지 표시
    const container = document.querySelector(".container");
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

// 단어 카드 생성 함수
function createWordCard(word) {
  // 현재 선택된 언어 확인
  const languageFilter = document.getElementById("language-filter").value;
  const searchDirection = document.getElementById("search-direction").value;

  // 번역 정보 추출
  const selectedLanguage =
    languageFilter === "all" ? "english" : languageFilter;
  const translation = word.translations[selectedLanguage];

  // 이모지 선택
  const emoji =
    word.common.emojis && word.common.emojis.length > 0
      ? word.common.emojis[0]
      : "📚";

  // 예제 문장 (첫 번째만 사용)
  const example =
    translation && translation.examples && translation.examples.length > 0
      ? translation.examples[0]
      : null;

  // 의미 (첫 번째만 표시)
  const meaning =
    translation && translation.meaning && translation.meaning.length > 0
      ? translation.meaning[0]
      : "";

  return `
    <div 
      class="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 border border-gray-200 cursor-pointer flex flex-col" 
      style="max-height: 350px;"
      onclick="window.showKoreanWordModal(${JSON.stringify(word._id).replace(
        /"/g,
        "&quot;"
      )}, ${JSON.stringify(languageFilter).replace(/"/g, "&quot;")})"
    >
      <div class="overflow-hidden mb-4 flex-grow-0 flex justify-center items-center" style="height: 80px;">
        <div class="flex flex-col items-center">
          <h1 class="text-5xl font-extrabold text-center text-black overflow-hidden" 
             style="word-break: keep-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${
              searchDirection === "korean" ? word.korean.word : meaning
            } ${emoji}
          </h1>
        </div>
      </div>
      <div class="space-y-3 flex-grow-0">
        <p class="flex items-center text-gray-700">
          <i class="fas fa-volume-up text-orange-500 mr-2"></i> 
          <span class="font-medium line-clamp-1">${
            word.korean.pronunciation
          }</span> 
        </p>
        <p class="flex items-center text-gray-700">
          <i class="fas fa-language text-green-500 mr-2"></i> 
          <span class="font-medium line-clamp-1">${
            searchDirection === "korean" ? meaning : word.korean.word
          }</span> 
        </p>
        <p class="flex items-center text-gray-700">
          <i class="fas fa-tag text-blue-500 mr-2"></i> 
          <span class="font-medium">${word.korean.part_of_speech} (${
    word.korean.level
  })</span>
        </p>
        ${
          example
            ? `
        <p class="flex items-start text-gray-700">
          <i class="fas fa-quote-left text-purple-500 mr-2 mt-1"></i> 
          <span class="font-medium line-clamp-1">${example.sentence}</span> 
        </p>`
            : ""
        }
        <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span class="flex items-center">
            <i class="fas fa-fire mr-1"></i> ${word.common.usage_frequency}
          </span>
          <span class="flex items-center">
            <i class="fas fa-tags mr-1"></i> ${word.korean.category.join(", ")}
          </span>
        </div>
      </div>
    </div>
  `;
}

// 단어 검색 및 필터링 함수
function handleSearch(elements) {
  displayCount = 12;

  const searchValue = elements.searchInput.value.toLowerCase();
  const searchDirection = elements.searchDirection.value;
  const languageFilter = elements.languageFilter.value;
  const categoryFilter = elements.categoryFilter.value;
  const levelFilter = elements.levelFilter.value;
  const sortOption = elements.sortOption.value;

  // 검색 방향에 따른 필터링
  filteredWords = allWords.filter((word) => {
    // 기본 검색 조건
    let matches = true;

    // 검색어 필터링
    if (searchValue) {
      if (searchDirection === "korean") {
        matches =
          word.korean.word.toLowerCase().includes(searchValue) ||
          word.korean.pronunciation.toLowerCase().includes(searchValue);
      } else {
        // 외국어 검색
        if (languageFilter === "all") {
          // 모든 언어에서 검색
          matches = Object.values(word.translations).some((translation) =>
            translation.meaning.some((m) =>
              m.toLowerCase().includes(searchValue)
            )
          );
        } else {
          // 특정 언어에서만 검색
          matches =
            word.translations[languageFilter]?.meaning.some((m) =>
              m.toLowerCase().includes(searchValue)
            ) || false;
        }
      }
    }

    // 언어 필터링 (검색 방향이 외국어→한국어인 경우만)
    if (matches && searchDirection === "foreign" && languageFilter !== "all") {
      matches = word.translations[languageFilter] !== undefined;
    }

    // 카테고리 필터링
    if (matches && categoryFilter !== "all") {
      matches = word.korean.category.includes(categoryFilter);
    }

    // 수준 필터링
    if (matches && levelFilter !== "all") {
      matches = word.korean.level === levelFilter;
    }

    return matches;
  });

  // 정렬
  sortFilteredWords(sortOption);

  // 결과 표시
  displayWordList();
}

// 정렬 함수
function sortFilteredWords(sortOption) {
  switch (sortOption) {
    case "usage":
      filteredWords.sort(
        (a, b) => b.common.usage_frequency - a.common.usage_frequency
      );
      break;
    case "alphabetical":
      filteredWords.sort((a, b) =>
        a.korean.word.localeCompare(b.korean.word, "ko")
      );
      break;
    case "latest":
      filteredWords.sort(
        (a, b) => new Date(b.common.updated_at) - new Date(a.common.updated_at)
      );
      break;
    default:
      break;
  }
}

// 단어 목록 표시 함수
function displayWordList() {
  const wordList = document.getElementById("word-list");
  const loadMoreBtn = document.getElementById("load-more");

  if (!wordList) return;

  const wordsToShow = filteredWords.slice(0, displayCount);

  if (wordsToShow.length === 0) {
    wordList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        검색 결과가 없습니다.
      </div>
    `;
    loadMoreBtn.classList.add("hidden");
    return;
  }

  wordList.innerHTML = wordsToShow.map(createWordCard).join("");

  if (filteredWords.length > displayCount) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }
}

// 더 보기 버튼 처리
function handleLoadMore() {
  displayCount += 12;
  displayWordList();
}

// 사용량 UI 업데이트
async function updateUsageUI() {
  const userRef = doc(db, "users", currentUser.email);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  const usage = userData.koreanDictCount || 0;
  const maxUsage = userData.maxKoreanDictCount || 100; // 기본값 100

  const usageText = document.getElementById("korean-dict-usage-text");
  const usageBar = document.getElementById("korean-dict-usage-bar");

  if (usageText) usageText.textContent = `${usage}/${maxUsage}`;

  if (usageBar) {
    const usagePercentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;
    usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

    // 사용량에 따라 색상 변경
    if (usagePercentage >= 90) {
      usageBar.classList.remove("bg-[#4B63AC]");
      usageBar.classList.add("bg-red-500");
    } else if (usagePercentage >= 70) {
      usageBar.classList.remove("bg-[#4B63AC]");
      usageBar.classList.add("bg-yellow-500");
    } else {
      usageBar.classList.remove("bg-red-500", "bg-yellow-500");
      usageBar.classList.add("bg-[#4B63AC]");
    }
  }
}

// 단어 목록 가져오기
async function fetchAndDisplayWords() {
  try {
    if (!currentUser) return;

    // 한국어 단어장 컬렉션 참조
    const wordsRef = collection(
      db,
      "korean_dictionary",
      currentUser.email,
      "words"
    );
    const q = query(wordsRef, orderBy("common.updated_at", "desc"));
    const querySnapshot = await getDocs(q);

    allWords = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // ID 추가
      data._id = doc.id;
      allWords.push(data);
    });

    // 단어 수 표시
    const wordCount = document.getElementById("word-count");
    if (wordCount) {
      wordCount.textContent = allWords.length;
    }

    // 초기 필터링 설정
    filteredWords = [...allWords];

    // 기본 정렬: 사용 빈도순
    sortFilteredWords("usage");

    // 단어 목록 표시
    displayWordList();
  } catch (error) {
    console.error("단어를 가져오는데 실패했습니다.", error);
    alert("단어를 불러오는 중 오류가 발생했습니다.");
  }
}
