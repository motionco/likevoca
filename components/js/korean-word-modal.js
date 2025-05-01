import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let currentWordId = null;
let currentWordData = null;

// supportedLanguages 객체 추가
const supportedLanguages = {
  korean: { tabId: "korean-tab", contentId: "korean-content" },
  english: { tabId: "english-tab", contentId: "english-content" },
  japanese: { tabId: "japanese-tab", contentId: "japanese-content" },
  chinese: { tabId: "chinese-tab", contentId: "chinese-content" },
  vietnamese: { tabId: "vietnamese-tab", contentId: "vietnamese-content" }, // 베트남어 추가
};

// 초기화 함수 추가
export function initialize() {
  // 모달 요소 참조
  const modal = document.getElementById("view-korean-word-modal");
  const closeBtn = document.getElementById("close-view-modal");
  const editBtn = document.getElementById("edit-word-btn");
  const deleteBtn = document.getElementById("delete-word-btn");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (editBtn) {
    editBtn.addEventListener("click", editWord);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteWord);
  }

  console.log("한국어 단어 상세보기 모달 초기화 완료");
}

// 모달 보이기
export async function showKoreanWordModal(wordId, activeLanguage = "all") {
  try {
    const modal = document.getElementById("view-korean-word-modal");
    if (!modal) return;

    // 단어 ID 저장
    currentWordId = wordId;

    // 단어 데이터 가져오기
    await fetchWordData(wordId);

    // 모달 표시
    modal.classList.remove("hidden");

    // 탭 이벤트 리스너를 한 번만 추가하도록 정리
    removeAllTabListeners();
    addTabListeners();

    // 초기 탭 설정 (영어)
    switchTab("english");
  } catch (error) {
    console.error("단어 상세 정보를 불러오는 중 오류 발생:", error);
    alert("단어 정보를 불러올 수 없습니다.");
  }
}

// 단어 데이터 가져오기
async function fetchWordData(wordId) {
  const userEmail = auth.currentUser.email;
  const wordRef = doc(db, "korean_dictionary", userEmail, "words", wordId);
  const wordSnap = await getDoc(wordRef);

  if (!wordSnap.exists()) {
    throw new Error("단어 정보를 찾을 수 없습니다.");
  }

  currentWordData = wordSnap.data();
  displayWordData(currentWordData);
}

// 단어 데이터 표시
function displayWordData(wordData) {
  // 한국어 정보 표시
  document.getElementById("view-word-title").textContent = wordData.korean.word;
  document.getElementById("view-korean-word").textContent =
    wordData.korean.word;
  document.getElementById("view-korean-pronunciation").textContent =
    wordData.korean.pronunciation;
  document.getElementById(
    "view-korean-part-speech-level"
  ).textContent = `${wordData.korean.part_of_speech} / ${wordData.korean.level}`;

  // 카테고리 표시
  const categoriesContainer = document.getElementById("view-categories");
  if (categoriesContainer) {
    categoriesContainer.innerHTML = wordData.korean.category
      .map(
        (category) =>
          `<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">${category}</span>`
      )
      .join("");
  }

  // 이모지 표시
  const emojisElement = document.getElementById("view-korean-emojis");
  if (emojisElement) {
    emojisElement.textContent =
      wordData.common.emojis && wordData.common.emojis.length > 0
        ? wordData.common.emojis.join(" ")
        : "📚";
  }

  // 사용 빈도 표시
  const frequencyValue = document.getElementById("view-frequency-value");
  const frequencyBar = document.getElementById("view-frequency-bar");

  if (frequencyValue) {
    frequencyValue.textContent = wordData.common.usage_frequency;
  }

  if (frequencyBar) {
    frequencyBar.style.width = `${wordData.common.usage_frequency}%`;

    // 사용 빈도에 따라 색상 변경
    if (wordData.common.usage_frequency >= 80) {
      frequencyBar.classList.remove("bg-blue-500", "bg-yellow-500");
      frequencyBar.classList.add("bg-green-500");
    } else if (wordData.common.usage_frequency >= 50) {
      frequencyBar.classList.remove("bg-blue-500", "bg-green-500");
      frequencyBar.classList.add("bg-yellow-500");
    } else {
      frequencyBar.classList.remove("bg-green-500", "bg-yellow-500");
      frequencyBar.classList.add("bg-blue-500");
    }
  }

  // 영어 번역 표시
  displayTranslation("english", wordData.translations.english);

  // 일본어 번역 표시
  displayTranslation("japanese", wordData.translations.japanese);

  // 중국어 번역 표시
  displayTranslation("chinese", wordData.translations.chinese);

  // 베트남어 번역 표시 추가
  displayTranslation("vietnamese", wordData.translations.vietnamese);

  // 관련 단어 표시
  const relatedWordsContainer = document.getElementById("view-related-words");
  if (relatedWordsContainer) {
    if (
      wordData.common.related_words &&
      wordData.common.related_words.length > 0
    ) {
      relatedWordsContainer.innerHTML = wordData.common.related_words
        .map(
          (word) =>
            `<span class="text-blue-600 hover:underline cursor-pointer" 
               onclick="window.showKoreanWordModal('${word}')">${word}</span>`
        )
        .join(" · ");
    } else {
      relatedWordsContainer.innerHTML =
        "<span class='text-gray-500'>관련 단어 없음</span>";
    }
  }

  // 업데이트 날짜 표시
  const updatedAtElement = document.getElementById("view-updated-at");
  if (updatedAtElement && wordData.common.updated_at) {
    const date = wordData.common.updated_at.toDate();
    updatedAtElement.textContent = new Date(date).toLocaleDateString("ko-KR");
  }
}

// 번역 정보 표시
function displayTranslation(language, translationData) {
  // 번역 정보가 없으면 해당 탭 비활성화하고 종료
  if (!translationData) {
    const tabBtn = document.querySelector(
      `.tab-button[data-tab="${language}"]`
    );
    if (tabBtn) {
      tabBtn.classList.add("opacity-50");
      tabBtn.disabled = true;
      console.log(`${language} 탭 비활성화 (번역 정보 없음)`);
    }
    return;
  }

  // 탭 버튼 활성화
  const tabBtn = document.querySelector(`.tab-button[data-tab="${language}"]`);
  if (tabBtn) {
    tabBtn.classList.remove("opacity-50");
    tabBtn.disabled = false;
    console.log(`${language} 탭 활성화됨`);
  }

  // 의미 표시
  const meaningsContainer = document.getElementById(
    `view-${language}-meanings`
  );
  if (meaningsContainer && translationData.meaning) {
    meaningsContainer.innerHTML = translationData.meaning
      .map((meaning) => `<li>${meaning}</li>`)
      .join("");
  }

  // 예문 표시
  const examplesContainer = document.getElementById(
    `view-${language}-examples`
  );
  if (examplesContainer && translationData.examples) {
    examplesContainer.innerHTML = translationData.examples
      .map(
        (example) => `
      <div class="bg-gray-50 p-3 rounded">
        <p class="font-medium">${example.sentence}</p>
        <p class="text-gray-600">${example.translation}</p>
      </div>
    `
      )
      .join("");
  }

  // 유의어 표시
  const synonymsContainer = document.getElementById(
    `view-${language}-synonyms`
  );
  if (synonymsContainer && translationData.synonyms) {
    synonymsContainer.innerHTML = translationData.synonyms
      .map(
        (synonym) =>
          `<span class="bg-green-100 text-green-800 px-2 py-1 rounded">${synonym}</span>`
      )
      .join(" ");
  }

  // 노트 표시
  const notesElement = document.getElementById(`view-${language}-notes`);
  if (notesElement) {
    notesElement.textContent = translationData.notes || "노트 없음";
  }
}

// 모든 탭 리스너 제거
function removeAllTabListeners() {
  console.log("모든 탭 리스너 제거");
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    // 기존 클릭 이벤트를 제거하기 위해 새 클론으로 요소 교체
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
  });
}

// 탭 리스너 추가
function addTabListeners() {
  const tabButtons = document.querySelectorAll(".tab-button");
  console.log("새 탭 리스너 추가, 버튼 수:", tabButtons.length);

  if (tabButtons.length === 0) {
    console.error("탭 버튼을 찾을 수 없습니다.");
    return;
  }

  tabButtons.forEach((button) => {
    const tabId = button.getAttribute("data-tab");
    console.log(`'${tabId}' 탭에 클릭 이벤트 리스너 추가`);

    button.addEventListener("click", function () {
      console.log(`'${tabId}' 탭 클릭됨`);
      switchTab(tabId);
    });
  });
}

// 탭 전환
function switchTab(tabId) {
  console.log("탭 전환 시작:", tabId);

  // 모든 탭 내용 숨기기
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => {
    content.classList.add("hidden");
  });

  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.classList.remove(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "font-medium"
    );
    button.classList.add("text-gray-500", "hover:text-gray-700");
  });

  // 선택한 탭 내용 표시
  const selectedContent = document.getElementById(`${tabId}-content`);
  if (selectedContent) {
    console.log(`'${tabId}-content' 표시`);
    selectedContent.classList.remove("hidden");
  } else {
    console.error(`'${tabId}-content' 요소를 찾을 수 없음`);
  }

  // 선택한 탭 버튼 활성화
  const selectedButtons = document.querySelectorAll(
    `.tab-button[data-tab="${tabId}"]`
  );
  if (selectedButtons.length > 0) {
    console.log(`'${tabId}' 탭 버튼 활성화, 개수: ${selectedButtons.length}`);
    selectedButtons.forEach((button) => {
      button.classList.remove("text-gray-500", "hover:text-gray-700");
      button.classList.add(
        "text-blue-600",
        "border-b-2",
        "border-blue-600",
        "font-medium"
      );
    });
  } else {
    console.error(`'${tabId}' 탭 버튼을 찾을 수 없음`);
  }
}

// 단어 수정
function editWord() {
  console.log("editWord 호출됨"); // 디버깅 로그 추가
  console.log("현재 단어 ID:", currentWordId); // 디버깅 로그 추가
  console.log("현재 단어 데이터:", currentWordData); // 디버깅 로그 추가

  if (!currentWordId || !currentWordData) {
    alert("단어 정보를 찾을 수 없습니다.");
    return;
  }

  // 세션 스토리지에 수정 모드와 단어 ID 저장
  sessionStorage.setItem("isEditMode", "true");
  sessionStorage.setItem("editWordId", currentWordId);

  console.log("세션 스토리지에 저장됨:", {
    isEditMode: true,
    editWordId: currentWordId,
  }); // 디버깅 로그 추가

  // 현재 모달 닫기
  closeModal();

  // 단어 추가/수정 모달 열기
  const addModal = document.getElementById("korean-word-modal");
  if (addModal) {
    addModal.classList.remove("hidden");

    // 직접 초기화 함수 호출 추가
    setTimeout(() => {
      checkEditMode(); // 이 함수를 직접 호출하여 수정 모드 확인
    }, 100); // 짧은 시간 지연 추가
  }
}

// 단어 삭제
async function deleteWord() {
  if (!currentWordId || !currentWordData) {
    alert("단어 정보를 찾을 수 없습니다.");
    return;
  }

  if (
    !confirm(`정말로 '${currentWordData.korean.word}' 단어를 삭제하시겠습니까?`)
  ) {
    return;
  }

  try {
    const userEmail = auth.currentUser.email;

    // 인덱스에서 단어 참조 삭제
    await deleteFromIndices(userEmail, currentWordId);

    // 단어 문서 삭제
    const wordRef = doc(
      db,
      "korean_dictionary",
      userEmail,
      "words",
      currentWordId
    );
    await deleteDoc(wordRef);

    // 사용자 단어 수 감소
    const userRef = doc(db, "users", userEmail);
    await updateDoc(userRef, {
      koreanDictCount: increment(-1),
    });

    alert("단어가 성공적으로 삭제되었습니다.");

    // 모달 닫기
    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("단어 삭제 중 오류 발생:", error);
    alert("단어 삭제에 실패했습니다.");
  }
}

// 인덱스에서 단어 삭제
async function deleteFromIndices(userEmail, koreanWord) {
  // 영어, 일본어, 중국어, 베트남어 인덱스를 순회하며 단어 참조 삭제
  const languages = ["english", "japanese", "chinese", "vietnamese"];

  for (const language of languages) {
    // 현재 단어의 번역 데이터가 있는 경우
    if (currentWordData.translations[language]) {
      // 각 번역 의미에 대해 인덱스 업데이트
      for (const meaning of currentWordData.translations[language].meaning) {
        const indexId = `${meaning.toLowerCase()}_${language}`;
        const indexRef = doc(
          db,
          "korean_dictionary_index",
          userEmail,
          language,
          indexId
        );
        const indexSnap = await getDoc(indexRef);

        if (indexSnap.exists()) {
          const indexData = indexSnap.data();
          const updatedWords = indexData.korean_words.filter(
            (word) => word !== koreanWord
          );

          if (updatedWords.length > 0) {
            // 다른 단어가 있으면 업데이트
            await updateDoc(indexRef, {
              korean_words: updatedWords,
            });
          } else {
            // 다른 단어가 없으면 인덱스 삭제
            await deleteDoc(indexRef);
          }
        }
      }
    }
  }
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("view-korean-word-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 상태 초기화
    currentWordId = null;
    currentWordData = null;
  }
}
