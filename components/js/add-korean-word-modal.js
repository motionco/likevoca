import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let selectedCategories = [];
let isEditMode = false;
let originalWordId = null;

// DOMContentLoaded 이벤트가 아닌 initialize 함수로 변경
export function initialize() {
  // 모달 요소 참조
  const modal = document.getElementById("korean-word-modal");
  const closeBtn = document.getElementById("close-modal");
  const saveBtn = document.getElementById("save-word");
  const resetBtn = document.getElementById("reset-form");
  const addCategoryBtn = document.getElementById("add-category");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", saveWord);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", addCategory);
  }

  // 카테고리 선택 이벤트
  const categorySelect = document.getElementById("category-select");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      if (categorySelect.value) {
        addCategoryFromSelect();
      }
    });
  }

  // 의미 추가 버튼 이벤트
  document.querySelectorAll(".add-meaning").forEach((btn) => {
    btn.addEventListener("click", () =>
      addMeaningField(btn.getAttribute("data-lang"))
    );
  });

  // 예문 추가 버튼 이벤트
  document.querySelectorAll(".add-example").forEach((btn) => {
    btn.addEventListener("click", () =>
      addExampleField(btn.getAttribute("data-lang"))
    );
  });

  // 이전에 세션 스토리지에 저장된 수정 모드 상태 확인
  checkEditMode();

  console.log("한국어 단어장 모달 초기화 완료");
}

// 수정 모드 체크
function checkEditMode() {
  const isEditing = sessionStorage.getItem("isEditMode") === "true";
  const wordId = sessionStorage.getItem("editWordId");

  console.log("checkEditMode 실행:", { isEditing, wordId }); // 디버깅 로그 추가

  if (isEditing && wordId) {
    isEditMode = true;
    originalWordId = wordId;

    // 편집할 단어 가져오기
    fetchWordDataForEdit(wordId);
  }
}

// 단어 데이터 가져오기
async function fetchWordDataForEdit(wordId) {
  try {
    console.log("fetchWordDataForEdit 시작:", wordId); // 디버깅 로그 추가

    const userEmail = auth.currentUser.email;
    if (!userEmail) {
      console.error("사용자 이메일이 없습니다");
      return;
    }

    const wordRef = doc(db, "korean_dictionary", userEmail, "words", wordId);
    const wordDoc = await getDoc(wordRef);

    console.log("단어 데이터 존재 여부:", wordDoc.exists()); // 디버깅 로그 추가

    if (wordDoc.exists()) {
      const wordData = wordDoc.data();
      console.log("가져온 단어 데이터:", wordData); // 디버깅 로그 추가
      fillFormWithWordData(wordData);
    } else {
      alert("단어 정보를 찾을 수 없습니다.");
      resetForm();
    }
  } catch (error) {
    console.error("단어 정보를 가져오는 중 오류 발생:", error);
    alert("단어 정보를 불러올 수 없습니다.");
  }
}

// 폼에 단어 데이터 채우기
function fillFormWithWordData(wordData) {
  // 한국어 정보
  document.getElementById("korean-word").value = wordData.korean.word;
  document.getElementById("korean-word").readOnly = true; // ID로 사용되므로 수정 불가
  document.getElementById("korean-pronunciation").value =
    wordData.korean.pronunciation;
  document.getElementById("part-of-speech").value =
    wordData.korean.part_of_speech;
  document.getElementById("korean-level").value = wordData.korean.level;

  // 카테고리
  selectedCategories = [...wordData.korean.category];
  renderSelectedCategories();

  // 번역 정보 - 영어
  if (wordData.translations.english) {
    const english = wordData.translations.english;
    fillTranslationData("english", english);
  }

  // 번역 정보 - 일본어
  if (wordData.translations.japanese) {
    const japanese = wordData.translations.japanese;
    fillTranslationData("japanese", japanese);
  }

  // 번역 정보 - 중국어
  if (wordData.translations.chinese) {
    const chinese = wordData.translations.chinese;
    fillTranslationData("chinese", chinese);
  }

  // 공통 정보
  document.getElementById("emoji-input").value =
    wordData.common.emojis.join(",");
  document.getElementById("usage-frequency").value =
    wordData.common.usage_frequency;
  document.getElementById("related-words").value =
    wordData.common.related_words.join(", ");

  // 모달 제목 및 버튼 텍스트 변경
  const modalTitle = document.querySelector("#korean-word-modal h2");
  const saveBtn = document.getElementById("save-word");

  if (modalTitle) modalTitle.textContent = "한국어 단어 수정";
  if (saveBtn) saveBtn.textContent = "수정하기";
}

// 번역 데이터 채우기
function fillTranslationData(lang, data) {
  // 의미 필드 초기화
  document.querySelectorAll(`.${lang}-meaning`).forEach((input, index) => {
    if (index === 0 && data.meaning && data.meaning.length > 0) {
      input.value = data.meaning[0];
    } else if (index > 0) {
      input.parentElement.remove(); // 추가 의미 필드 제거
    }
  });

  // 추가 의미 필드 생성
  if (data.meaning && data.meaning.length > 1) {
    for (let i = 1; i < data.meaning.length; i++) {
      addMeaningField(lang, data.meaning[i]);
    }
  }

  // 예문 필드 초기화
  const exampleContainer = document.getElementById(`${lang}-examples`);
  const exampleFields = exampleContainer.querySelectorAll(
    `.${lang}-example-sentence`
  );

  // 처음 있는 예문 필드에 첫 번째 예문 설정
  if (exampleFields.length > 0 && data.examples && data.examples.length > 0) {
    exampleFields[0].value = data.examples[0].sentence;
    const translationFields = exampleContainer.querySelectorAll(
      `.${lang}-example-translation`
    );
    if (translationFields.length > 0) {
      translationFields[0].value = data.examples[0].translation;
    }
  }

  // 추가 예문 필드 생성
  if (data.examples && data.examples.length > 1) {
    for (let i = 1; i < data.examples.length; i++) {
      addExampleField(lang, data.examples[i]);
    }
  }

  // 유의어 및 노트 설정
  if (data.synonyms) {
    document.getElementById(`${lang}-synonyms`).value =
      data.synonyms.join(", ");
  }

  if (data.notes) {
    document.getElementById(`${lang}-notes`).value = data.notes;
  }
}

// 카테고리 추가
function addCategory() {
  addCategoryFromSelect();
}

// 선택한 카테고리 추가
function addCategoryFromSelect() {
  const categorySelect = document.getElementById("category-select");
  if (!categorySelect || !categorySelect.value) return;

  const category = categorySelect.value;
  if (!selectedCategories.includes(category)) {
    selectedCategories.push(category);
    renderSelectedCategories();
    categorySelect.value = ""; // 선택 초기화
  }
}

// 선택된 카테고리 표시
function renderSelectedCategories() {
  const container = document.getElementById("selected-categories");
  if (!container) return;

  container.innerHTML = "";

  selectedCategories.forEach((category) => {
    const tag = document.createElement("div");
    tag.className =
      "bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center";
    tag.innerHTML = `
      <span>${category}</span>
      <button class="ml-1 text-blue-500 hover:text-blue-700" data-category="${category}">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(tag);

    // 삭제 버튼 이벤트
    const deleteBtn = tag.querySelector("button");
    deleteBtn.addEventListener("click", () => {
      selectedCategories = selectedCategories.filter((c) => c !== category);
      renderSelectedCategories();
    });
  });
}

// 의미 필드 추가
function addMeaningField(lang, value = "") {
  const container = document.getElementById(`${lang}-meanings`);
  if (!container) return;

  const meaningDiv = document.createElement("div");
  meaningDiv.className = "flex space-x-2";
  meaningDiv.innerHTML = `
    <input type="text" class="${lang}-meaning w-full p-2 border rounded-lg" placeholder="의미" value="${value}">
    <button class="bg-red-500 text-white px-3 py-1 rounded-lg remove-meaning">-</button>
  `;
  container.appendChild(meaningDiv);

  // 삭제 버튼 이벤트
  const removeBtn = meaningDiv.querySelector(".remove-meaning");
  removeBtn.addEventListener("click", () => {
    meaningDiv.remove();
  });
}

// 예문 필드 추가
function addExampleField(lang, example = null) {
  const container = document.getElementById(`${lang}-examples`);
  if (!container) return;

  const exampleDiv = document.createElement("div");
  exampleDiv.className = "grid grid-cols-1 md:grid-cols-2 gap-2 mt-2";
  exampleDiv.innerHTML = `
    <div class="relative">
      <input type="text" class="${lang}-example-sentence p-2 border rounded-lg w-full" placeholder="한국어 예문" value="${
    example ? example.sentence : ""
  }">
    </div>
    <div class="relative">
      <input type="text" class="${lang}-example-translation p-2 border rounded-lg w-full" placeholder="${lang} 번역" value="${
    example ? example.translation : ""
  }">
      <button class="absolute right-2 top-2 text-red-500 hover:text-red-700 remove-example">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // addExample 버튼 앞에 새 예문 필드 추가
  const addBtn = container.querySelector(`.add-example`);
  container.insertBefore(exampleDiv, addBtn);

  // 삭제 버튼 이벤트
  const removeBtn = exampleDiv.querySelector(".remove-example");
  removeBtn.addEventListener("click", () => {
    exampleDiv.remove();
  });
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("korean-word-modal");
  if (modal) {
    modal.classList.add("hidden");
    resetForm();
  }
}

// 폼 검증
function validateForm() {
  const koreanWord = document.getElementById("korean-word").value.trim();
  const koreanPronunciation = document
    .getElementById("korean-pronunciation")
    .value.trim();

  if (!koreanWord) {
    alert("한국어 단어를 입력해주세요.");
    return false;
  }

  if (!koreanPronunciation) {
    alert("발음을 입력해주세요.");
    return false;
  }

  if (selectedCategories.length === 0) {
    alert("최소 하나 이상의 카테고리를 선택해주세요.");
    return false;
  }

  // 영어 의미 검증
  const englishMeanings = document.querySelectorAll(".english-meaning");
  let hasEnglishMeaning = false;

  for (const input of englishMeanings) {
    if (input.value.trim()) {
      hasEnglishMeaning = true;
      break;
    }
  }

  if (!hasEnglishMeaning) {
    alert("최소 하나 이상의 영어 의미를 입력해주세요.");
    return false;
  }

  return true;
}

// 폼 초기화
function resetForm() {
  // 폼 요소 초기화
  const form =
    document.querySelector("#korean-word-modal form") ||
    document.getElementById("korean-word-modal");
  if (form) {
    // 입력 필드 초기화
    const inputs = form.querySelectorAll(
      "input:not([type=button]), textarea, select"
    );
    inputs.forEach((input) => {
      input.value = "";
    });

    // 카테고리 초기화
    selectedCategories = [];
    renderSelectedCategories();

    // 동적으로 추가된 의미/예문 필드 제거
    ["english", "japanese", "chinese"].forEach((lang) => {
      // 첫 번째를 제외한 모든 의미 필드 제거
      const meaningContainer = document.getElementById(`${lang}-meanings`);
      if (meaningContainer) {
        const meaningFields = meaningContainer.querySelectorAll(
          `.${lang}-meaning`
        );
        for (let i = 1; i < meaningFields.length; i++) {
          meaningFields[i].closest(".flex").remove();
        }
      }

      // 예문 필드 초기화
      const exampleContainer = document.getElementById(`${lang}-examples`);
      if (exampleContainer) {
        const exampleFields = exampleContainer.querySelectorAll(`.grid`);
        exampleFields.forEach((field) => field.remove());
      }
    });

    // 모달 제목 및 버튼 텍스트 초기화
    const modalTitle = document.querySelector("#korean-word-modal h2");
    const saveBtn = document.getElementById("save-word");

    if (modalTitle) modalTitle.textContent = "한국어 단어 추가";
    if (saveBtn) saveBtn.textContent = "저장";

    // readOnly 속성 제거
    const koreanWord = document.getElementById("korean-word");
    if (koreanWord) koreanWord.readOnly = false;

    // 수정 모드 초기화
    isEditMode = false;
    originalWordId = null;

    // 세션 스토리지 초기화
    sessionStorage.removeItem("isEditMode");
    sessionStorage.removeItem("editWordId");
  }
}

// 단어 저장
async function saveWord() {
  try {
    if (!validateForm()) {
      return;
    }

    const userEmail = auth.currentUser.email;
    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 사용자 정보 확인
    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("사용자 정보가 없습니다.");
      return;
    }

    // 폼 데이터 수집
    const wordData = collectFormData();

    // 사용자 단어 수 확인
    const userData = userSnap.data();
    const currentCount = userData.koreanDictCount || 0;
    const maxCount = userData.maxKoreanDictCount || 100;

    if (!isEditMode && currentCount >= maxCount) {
      alert(
        `최대 단어 수(${maxCount}개)에 도달했습니다. 단어를 추가할 수 없습니다.`
      );
      return;
    }

    // 단어 저장
    if (isEditMode) {
      await updateWord(userEmail, wordData);
    } else {
      await addNewWord(userEmail, wordData);
    }

    // 인덱스 컬렉션 업데이트
    await updateIndices(userEmail, wordData);

    // 성공 메시지
    alert(
      isEditMode
        ? "단어가 성공적으로 수정되었습니다."
        : "단어가 성공적으로 추가되었습니다."
    );

    // 모달 닫기 및 초기화
    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("단어 저장 중 오류 발생:", error);
    alert("단어 저장에 실패했습니다.");
  }
}

// 폼 데이터 수집
function collectFormData() {
  const koreanWord = document.getElementById("korean-word").value.trim();
  const koreanPronunciation = document
    .getElementById("korean-pronunciation")
    .value.trim();
  const partOfSpeech = document.getElementById("part-of-speech").value;
  const koreanLevel = document.getElementById("korean-level").value;
  const usageFrequency =
    parseInt(document.getElementById("usage-frequency").value) || 50;
  const emojiInput = document.getElementById("emoji-input").value.trim();
  const relatedWords = document.getElementById("related-words").value.trim();

  // 이모지 파싱
  const emojis = emojiInput ? emojiInput.split(",").map((e) => e.trim()) : [];

  // 관련 단어 파싱
  const related = relatedWords
    ? relatedWords.split(",").map((w) => w.trim())
    : [];

  // 번역 정보 수집
  const translations = {
    english: collectTranslationData("english"),
    japanese: collectTranslationData("japanese"),
    chinese: collectTranslationData("chinese"),
  };

  return {
    _id: koreanWord, // 단어를 ID로 사용
    korean: {
      word: koreanWord,
      pronunciation: koreanPronunciation,
      part_of_speech: partOfSpeech,
      level: koreanLevel,
      category: selectedCategories,
    },
    translations: translations,
    common: {
      emojis: emojis,
      usage_frequency: usageFrequency,
      related_words: related,
      updated_at: Timestamp.now(),
    },
  };
}

// 번역 데이터 수집
function collectTranslationData(lang) {
  const meanings = [];
  document.querySelectorAll(`.${lang}-meaning`).forEach((input) => {
    const value = input.value.trim();
    if (value) {
      meanings.push(value);
    }
  });

  const examples = [];
  const sentenceInputs = document.querySelectorAll(`.${lang}-example-sentence`);
  const translationInputs = document.querySelectorAll(
    `.${lang}-example-translation`
  );

  for (let i = 0; i < sentenceInputs.length; i++) {
    const sentence = sentenceInputs[i].value.trim();
    const translation = translationInputs[i]
      ? translationInputs[i].value.trim()
      : "";

    if (sentence && translation) {
      examples.push({
        sentence: sentence,
        translation: translation,
      });
    }
  }

  const synonymsInput = document.getElementById(`${lang}-synonyms`);
  const notesInput = document.getElementById(`${lang}-notes`);

  const synonyms =
    synonymsInput && synonymsInput.value.trim()
      ? synonymsInput.value.split(",").map((s) => s.trim())
      : [];

  const notes = notesInput ? notesInput.value.trim() : "";

  // 모든 필드가 비어있는지 확인
  if (
    meanings.length === 0 &&
    examples.length === 0 &&
    synonyms.length === 0 &&
    !notes
  ) {
    return null;
  }

  return {
    meaning: meanings,
    examples: examples,
    synonyms: synonyms,
    notes: notes,
  };
}

// 새 단어 추가
async function addNewWord(userEmail, wordData) {
  const wordRef = doc(
    db,
    "korean_dictionary",
    userEmail,
    "words",
    wordData._id
  );
  await setDoc(wordRef, wordData);

  // 사용자 단어 수 증가
  const userRef = doc(db, "users", userEmail);
  await updateDoc(userRef, {
    koreanDictCount: increment(1),
  });
}

// 단어 업데이트
async function updateWord(userEmail, wordData) {
  const wordRef = doc(
    db,
    "korean_dictionary",
    userEmail,
    "words",
    wordData._id
  );
  await setDoc(wordRef, wordData);
}

// 인덱스 업데이트
async function updateIndices(userEmail, wordData) {
  const koreanWord = wordData.korean.word;

  // 기존 인덱스 삭제 (수정 모드인 경우)
  if (isEditMode) {
    await deleteIndices(userEmail, koreanWord);
  }

  // 영어 인덱스 업데이트
  if (wordData.translations.english && wordData.translations.english.meaning) {
    for (const meaning of wordData.translations.english.meaning) {
      await updateIndex(
        userEmail,
        "english",
        meaning.toLowerCase(),
        koreanWord
      );
    }
  }

  // 일본어 인덱스 업데이트
  if (
    wordData.translations.japanese &&
    wordData.translations.japanese.meaning
  ) {
    for (const meaning of wordData.translations.japanese.meaning) {
      await updateIndex(userEmail, "japanese", meaning, koreanWord);
    }
  }

  // 중국어 인덱스 업데이트
  if (wordData.translations.chinese && wordData.translations.chinese.meaning) {
    for (const meaning of wordData.translations.chinese.meaning) {
      await updateIndex(userEmail, "chinese", meaning, koreanWord);
    }
  }
}

// 단일 인덱스 업데이트
async function updateIndex(userEmail, language, foreignWord, koreanWord) {
  const indexId = `${foreignWord}_${language}`;
  const indexRef = doc(
    db,
    "korean_dictionary_index",
    userEmail,
    language,
    indexId
  );
  const indexSnap = await getDoc(indexRef);

  if (indexSnap.exists()) {
    // 기존 인덱스 업데이트
    const indexData = indexSnap.data();

    if (!indexData.korean_words.includes(koreanWord)) {
      await updateDoc(indexRef, {
        korean_words: [...indexData.korean_words, koreanWord],
      });
    }
  } else {
    // 새 인덱스 생성
    await setDoc(indexRef, {
      foreign_word: foreignWord,
      korean_words: [koreanWord],
      language: language,
    });
  }
}

// 기존 인덱스 삭제
async function deleteIndices(userEmail, koreanWord) {
  // 각 언어별 인덱스에서 해당 단어를 찾아 제거
  const languages = ["english", "japanese", "chinese"];

  for (const language of languages) {
    const indexCollection = collection(
      db,
      "korean_dictionary_index",
      userEmail,
      language
    );
    const indexSnapshot = await getDocs(indexCollection);

    indexSnapshot.forEach(async (doc) => {
      const indexData = doc.data();

      if (indexData.korean_words.includes(koreanWord)) {
        // 해당 단어만 제거
        const updatedWords = indexData.korean_words.filter(
          (word) => word !== koreanWord
        );

        if (updatedWords.length > 0) {
          // 다른 단어가 있으면 업데이트
          await updateDoc(doc.ref, {
            korean_words: updatedWords,
          });
        } else {
          // 다른 단어가 없으면 인덱스 삭제
          await deleteDoc(doc.ref);
        }
      }
    });
  }
}

// checkEditMode 함수를 전역으로 노출
window.checkEditMode = checkEditMode;
