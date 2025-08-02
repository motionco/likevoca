/**
 * AI 단어장 전용 개념 편집 모달 관리 스크립트
 */

import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import { domainCategoryMapping } from "./domain-category-emoji.js";

// 전역 변수
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

// AI 편집 모달 초기화
export async function initialize() {
  console.log("🤖 AI 개념 편집 모달 초기화");

  editConceptId = sessionStorage.getItem("editConceptId");

  if (!editConceptId) {
    console.error("❌ 편집할 AI 개념 ID가 없습니다");
    alert("편집할 개념이 지정되지 않았습니다.");
    closeModal();
    return;
  }

  console.log("🤖 편집 대상 AI 개념 ID:", editConceptId);

  // 모달 제목 변경
  const modalTitle = document.querySelector("#edit-concept-modal h2");
  if (modalTitle) {
    modalTitle.textContent = "🤖 AI 개념 수정";
  }

  // 언어탭 이벤트 설정
  setupLanguageTabs();

  // 도메인/카테고리 연동 설정
  setupDomainCategorySystem();

  // 도메인 옵션 초기화 (번역 적용)
  if (typeof window.updateEditDomainOptions === "function") {
    window.updateEditDomainOptions();
  }

  // 버튼 이벤트 설정
  setupEventListeners();

  // AI 개념 데이터 로드
  await fetchAIConceptForEdit(editConceptId);
}

// 도메인/카테고리 연동 시스템 설정 (단어장 개념 수정 모달 방식 참고)
function setupDomainCategorySystem() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categorySelect = document.getElementById("edit-concept-category");

  if (domainSelect) {
    // 기존 이벤트 리스너 제거
    domainSelect.replaceWith(domainSelect.cloneNode(true));
    const newDomainSelect = document.getElementById("edit-concept-domain");

    // 새로운 이벤트 리스너 추가
    newDomainSelect.addEventListener("change", handleAIEditDomainChange);
  }

  if (categorySelect) {
    // 기존 이벤트 리스너 제거
    categorySelect.replaceWith(categorySelect.cloneNode(true));
    const newCategorySelect = document.getElementById("edit-concept-category");

    // 새로운 이벤트 리스너 추가
    newCategorySelect.addEventListener("change", handleAIEditCategoryChange);
  }
}

// AI 편집 모달 도메인 변경 핸들러
function handleAIEditDomainChange(event) {
  console.log("🔄 AI 편집 모달 도메인 변경:", event.target.value);

  // 카테고리 옵션 업데이트
  if (typeof window.updateEditCategoryOptions === "function") {
    window.updateEditCategoryOptions();
  }

  // 카테고리 초기화 (첫 번째 옵션 선택)
  setTimeout(() => {
    const categorySelect = document.getElementById("edit-concept-category");
    if (categorySelect && categorySelect.options.length > 1) {
      categorySelect.selectedIndex = 1; // 첫 번째 실제 옵션 선택 (0은 플레이스홀더)

      // 카테고리 변경 이벤트 트리거
      categorySelect.dispatchEvent(new Event("change"));
    }
  }, 100);
}

// AI 편집 모달 카테고리 변경 핸들러
function handleAIEditCategoryChange(event) {
  console.log("🔄 AI 편집 모달 카테고리 변경:", event.target.value);

  // 이모지 옵션 업데이트
  if (typeof window.updateEditEmojiOptions === "function") {
    window.updateEditEmojiOptions();
  }
}

// 카테고리 옵션 업데이트 (지연 로딩 지원)
function updateCategoryOptions(domain, categorySelect) {
  const categories = domainCategoryMapping[domain] || [];
  if (!categorySelect) {
    console.error("❌ categorySelect 요소가 없습니다.");
    return;
  }

  categorySelect.innerHTML = "";

  // 현재 언어 감지
  const currentLang = localStorage.getItem("userLanguage") || "ko";

  // 플레이스홀더 옵션 추가 (번역 적용)
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = getCategoryTranslation(
    "category_placeholder",
    currentLang
  );
  placeholderOption.style.display = "none";
  categorySelect.appendChild(placeholderOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = getCategoryTranslation(category, currentLang);
    categorySelect.appendChild(option);
  });

  console.log(
    `✅ 카테고리 옵션 업데이트 완료: ${domain} -> ${categories.length}개`
  );
}

// 카테고리 번역 함수
function getCategoryTranslation(key, lang) {
  const categoryTranslations = {
    ko: {
      category_placeholder: "카테고리 선택",
      fruit: "과일",
      food: "음식",
      animal: "동물",
      daily: "일상",
      travel: "여행",
      business: "비즈니스",
      education: "교육",
      nature: "자연",
      technology: "기술",
      health: "건강",
      sports: "스포츠",
      entertainment: "엔터테인먼트",
      culture: "문화",
      other: "기타",
    },
    en: {
      category_placeholder: "Select Category",
      fruit: "Fruit",
      food: "Food",
      animal: "Animal",
      daily: "Daily",
      travel: "Travel",
      business: "Business",
      education: "Education",
      nature: "Nature",
      technology: "Technology",
      health: "Health",
      sports: "Sports",
      entertainment: "Entertainment",
      culture: "Culture",
      other: "Other",
    },
    ja: {
      category_placeholder: "カテゴリー選択",
      fruit: "果物",
      food: "食べ物",
      animal: "動物",
      daily: "日常",
      travel: "旅行",
      business: "ビジネス",
      education: "教育",
      nature: "自然",
      technology: "技術",
      health: "健康",
      sports: "スポーツ",
      entertainment: "エンターテイメント",
      culture: "文化",
      other: "その他",
    },
    zh: {
      category_placeholder: "选择分类",
      fruit: "水果",
      food: "食物",
      animal: "动物",
      daily: "日常",
      travel: "旅行",
      business: "商务",
      education: "教育",
      nature: "自然",
      technology: "技术",
      health: "健康",
      sports: "体育",
      entertainment: "娱乐",
      culture: "文化",
      other: "其他",
    },
  };

  return categoryTranslations[lang]?.[key] || key;
}

// 언어탭 설정
function setupLanguageTabs() {
  const tabs = document.querySelectorAll(".edit-language-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const language = tab.getAttribute("data-language");
      showLanguageContent(language, tab);
    });
  });

  // 기본적으로 첫 번째 탭 활성화
  if (tabs.length > 0) {
    const firstTab = tabs[0];
    const firstLanguage = firstTab.getAttribute("data-language");
    showLanguageContent(firstLanguage, firstTab);
  }
}

// 언어 콘텐츠 표시
function showLanguageContent(language, clickedTab) {
  // 모든 탭 비활성화
  const tabs = document.querySelectorAll(".edit-language-tab");
  tabs.forEach((tab) => {
    tab.classList.remove("border-blue-500", "text-blue-600");
    tab.classList.add("border-transparent", "text-gray-500");
  });

  // 클릭된 탭 활성화
  clickedTab.classList.remove("border-transparent", "text-gray-500");
  clickedTab.classList.add("border-blue-500", "text-blue-600");

  // 모든 언어 콘텐츠 숨기기
  const contents = document.querySelectorAll(".language-content");
  contents.forEach((content) => {
    content.classList.add("hidden");
  });

  // 선택된 언어 콘텐츠 표시
  const selectedContent = document.getElementById(`${language}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  const saveBtn = document.getElementById("save-edit-concept");
  const cancelBtn = document.getElementById("cancel-edit-concept");
  const closeBtn = document.getElementById("close-edit-concept-modal");
  const addExampleBtn = document.getElementById("edit-add-example");
  const emojiField = document.getElementById("edit-concept-emoji");

  if (saveBtn) {
    // 기존 이벤트 리스너 제거 후 새로 추가
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    const newSaveBtn = document.getElementById("save-edit-concept");
    newSaveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveConcept();
    });
  }

  if (cancelBtn) {
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    const newCancelBtn = document.getElementById("cancel-edit-concept");
    newCancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
        closeModal();
        sessionStorage.removeItem("editConceptId");
        editConceptId = null;
      }
    });
  }

  if (closeBtn) {
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const newCloseBtn = document.getElementById("close-edit-concept-modal");
    newCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
      sessionStorage.removeItem("editConceptId");
      editConceptId = null;
    });
  }

  if (addExampleBtn) {
    addExampleBtn.replaceWith(addExampleBtn.cloneNode(true));
    const newAddExampleBtn = document.getElementById("edit-add-example");
    newAddExampleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      addExampleField();
    });
  }

  // 이모지 선택 변경 이벤트 리스너 추가
  if (emojiField) {
    emojiField.addEventListener("change", (e) => {
      const selectedEmoji = e.target.value;
      if (selectedEmoji) {
        window.editConceptEmojiValue = selectedEmoji;
        console.log("🎨 이모지 선택 변경:", selectedEmoji);
      }
    });
  }
}

// AI 개념 데이터 가져오기
async function fetchAIConceptForEdit(conceptId) {
  try {
    console.log("🤖 AI 편집용 개념 데이터 가져오기:", conceptId);

    // 메모리에서 찾기
    let conceptData = null;
    const sources = [window.currentConcepts, window.allConcepts];

    for (const source of sources) {
      if (source && source.length > 0) {
        conceptData = source.find(
          (concept) =>
            concept.concept_id === conceptId ||
            concept.id === conceptId ||
            concept._id === conceptId
        );
        if (conceptData) break;
      }
    }

    // Firebase에서 조회
    if (!conceptData) {
      const allAIConcepts = await conceptUtils.getUserAIConcepts(
        auth.currentUser.email
      );
      conceptData = allAIConcepts.find(
        (concept) =>
          concept.concept_id === conceptId ||
          concept.id === conceptId ||
          concept._id === conceptId
      );
    }

    if (!conceptData) {
      throw new Error("AI 개념을 찾을 수 없습니다.");
    }

    fillFormWithAIConceptData(conceptData);
  } catch (error) {
    console.error("❌ AI 개념 정보를 가져오는 중 오류:", error);
    alert(error.message || "AI 개념 정보를 불러올 수 없습니다.");
  }
}

// 폼 채우기
function fillFormWithAIConceptData(conceptData) {
  console.log("🤖 AI 개념 폼 데이터 채우기");

  // 기본 정보 채우기
  const domainValue = conceptData.concept_info?.domain || "other";
  const categoryValue = conceptData.concept_info?.category || "other";

  console.log("🔍 AI 편집 모달 설정 값:", {
    domainValue,
    categoryValue,
    conceptData,
  });

  // 도메인 설정
  const domainField = document.getElementById("edit-concept-domain");
  if (domainField) {
    domainField.value = domainValue;
    console.log("🔄 AI 편집 모달 도메인 변경:", domainValue);

    // 도메인 변경 이벤트 트리거 (카테고리 옵션 자동 생성)
    domainField.dispatchEvent(new Event("change"));

    // 카테고리 설정 (도메인 변경 후 지연)
    setTimeout(() => {
      const categoryField = document.getElementById("edit-concept-category");
      if (categoryField) {
        categoryField.value = categoryValue;
        console.log("🤖 카테고리 설정:", categoryValue);

        // 카테고리 변경 이벤트 트리거 (이모지 옵션 자동 생성)
        categoryField.dispatchEvent(new Event("change"));

        // 이모지 설정 (카테고리 변경 후 지연)
        setTimeout(() => {
          const emojiField = document.getElementById("edit-concept-emoji");
          const emojiValue =
            conceptData.concept_info?.unicode_emoji ||
            conceptData.concept_info?.emoji ||
            conceptData.unicode_emoji ||
            "";

          if (emojiField) {
            // 전역 저장소에 이모지 값 저장
            window.editConceptEmojiValue = emojiValue;

            // 이모지 값이 있는 경우에만 설정
            if (emojiValue && emojiValue.trim()) {
              // select 드롭다운에서 해당 이모지 값 선택
              const existingOption = Array.from(emojiField.options).find(
                (option) => option.value === emojiValue
              );

              if (existingOption) {
                emojiField.value = emojiValue;
              } else {
                // 옵션에 없으면 새로 추가
                const option = document.createElement("option");
                option.value = emojiValue;
                option.textContent = emojiValue;
                emojiField.appendChild(option);
                emojiField.value = emojiValue;
              }

              console.log("🎨 AI 편집 모달 이모지 설정:", emojiValue);
            } else {
              console.log("⚠️ 이모지 값이 없어 기본값 사용하지 않음");
            }
          }
        }, 300); // 이모지 옵션 업데이트 후 충분한 시간 대기
      }
    }, 200);
  }

  // 언어별 표현 채우기
  for (const langCode of Object.keys(supportedLangs)) {
    const expression = conceptData.expressions?.[langCode];
    if (expression) {
      // 기본 필드들
      const wordField = document.getElementById(`edit-${langCode}-word`);
      const pronunciationField = document.getElementById(
        `edit-${langCode}-pronunciation`
      );
      const definitionField = document.getElementById(
        `edit-${langCode}-definition`
      );
      const posField = document.getElementById(`edit-${langCode}-pos`);

      if (wordField) wordField.value = expression.word || "";
      if (pronunciationField)
        pronunciationField.value = expression.pronunciation || "";
      if (definitionField) definitionField.value = expression.definition || "";
      if (posField) posField.value = expression.part_of_speech || "명사";

      // 관련 단어들
      const synonymsField = document.getElementById(
        `edit-${langCode}-synonyms`
      );
      const antonymsField = document.getElementById(
        `edit-${langCode}-antonyms`
      );
      const collocationsField = document.getElementById(
        `edit-${langCode}-collocations`
      );
      const compoundWordsField = document.getElementById(
        `edit-${langCode}-compound-words`
      );

      if (synonymsField && expression.synonyms) {
        synonymsField.value = Array.isArray(expression.synonyms)
          ? expression.synonyms.join(", ")
          : expression.synonyms;
      }
      if (antonymsField && expression.antonyms) {
        antonymsField.value = Array.isArray(expression.antonyms)
          ? expression.antonyms.join(", ")
          : expression.antonyms;
      }
      if (collocationsField && expression.collocations) {
        collocationsField.value = Array.isArray(expression.collocations)
          ? expression.collocations.join(", ")
          : expression.collocations;
      }
      if (compoundWordsField && expression.compound_words) {
        compoundWordsField.value = Array.isArray(expression.compound_words)
          ? expression.compound_words.join(", ")
          : expression.compound_words;
      }
    }
  }

  // 예문 채우기
  fillExamples(conceptData);
}

// 예문 채우기 (AI 편집 모달의 개별 언어별 필드에 맞게 수정)
function fillExamples(conceptData) {
  console.log("🔍 AI 편집 모달 예문 채우기 시작:", {
    representative_example: conceptData.representative_example,
    examples: conceptData.examples,
    examples_length: conceptData.examples?.length,
  });

  // 대표 예문 처리 (개별 언어별 필드에 설정)
  if (conceptData.representative_example) {
    console.log("✅ 대표 예문 발견:", conceptData.representative_example);

    // 각 언어별 예문 필드에 값 설정
    const languages = ["korean", "english", "japanese", "chinese", "spanish"];
    languages.forEach((lang) => {
      const exampleField = document.getElementById(`edit-${lang}-example`);
      if (exampleField && conceptData.representative_example[lang]) {
        exampleField.value = conceptData.representative_example[lang];
        console.log(
          `📝 ${lang} 예문 설정:`,
          conceptData.representative_example[lang]
        );
      }
    });
  } else {
    console.log("⚠️ 대표 예문이 없습니다.");
  }

  console.log("🔍 AI 편집 모달 예문 채우기 완료");
}

// 예문 필드 추가 (보기 모달과 동일한 방식으로 단순화)
function addExampleField(existingExample = null, isRepresentative = false) {
  const container = document.getElementById("edit-examples-container");
  if (!container) return;

  const exampleDiv = document.createElement("div");
  exampleDiv.className = "border rounded-lg p-4 mb-4 bg-gray-50";

  const exampleIndex = container.children.length;
  const title = isRepresentative ? "대표 예문" : `예문 ${exampleIndex + 1}`;

  // 기존 예문 값 추출 (보기 모달과 동일한 방식)
  const getExampleValue = (lang) => {
    if (!existingExample) return "";

    // 직접 접근 (DB 구조에 맞게)
    if (existingExample[lang]) {
      return existingExample[lang];
    }

    return "";
  };

  console.log("📝 예문 필드 추가:", {
    title,
    existingExample,
    korean: getExampleValue("korean"),
    english: getExampleValue("english"),
    japanese: getExampleValue("japanese"),
    chinese: getExampleValue("chinese"),
  });

  exampleDiv.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <h4 class="font-medium text-gray-700">${title}</h4>
      ${
        !isRepresentative
          ? '<button type="button" class="text-red-500 hover:text-red-700 remove-example"><i class="fas fa-trash"></i></button>'
          : ""
      }
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-sm text-gray-600">한국어</label>
        <input type="text" class="korean-example w-full p-2 border rounded" value="${getExampleValue(
          "korean"
        )}">
      </div>
      <div>
        <label class="block text-sm text-gray-600">영어</label>
        <input type="text" class="english-example w-full p-2 border rounded" value="${getExampleValue(
          "english"
        )}">
      </div>
      <div>
        <label class="block text-sm text-gray-600">일본어</label>
        <input type="text" class="japanese-example w-full p-2 border rounded" value="${getExampleValue(
          "japanese"
        )}">
      </div>
      <div>
        <label class="block text-sm text-gray-600">중국어</label>
        <input type="text" class="chinese-example w-full p-2 border rounded" value="${getExampleValue(
          "chinese"
        )}">
      </div>
    </div>
  `;

  // 삭제 버튼 이벤트
  const removeBtn = exampleDiv.querySelector(".remove-example");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      exampleDiv.remove();
    });
  }

  container.appendChild(exampleDiv);
}

// 저장
async function saveConcept() {
  try {
    console.log("🤖 AI 개념 수정 시작:", editConceptId);

    if (!validateForm()) return;

    const conceptData = collectFormData();

    console.log("🔍 수집된 원본 데이터:", conceptData);

    // AI 구조로 변환
    const transformedData = {
      metadata: {
        updated_at: new Date(),
        version: "2.0",
        source: "ai_generated",
        is_ai_generated: true,
      },
      concept_info: {
        domain: conceptData.concept_info.domain || "general",
        category: conceptData.concept_info.category || "common",
        unicode_emoji: conceptData.concept_info.unicode_emoji || "📝",
      },
      expressions: conceptData.expressions || {},
      representative_example: conceptData.representative_example || null,
      examples: conceptData.examples || [],
      updated_at: new Date(),
    };

    console.log("🔍 변환된 데이터:", transformedData);

    const success = await conceptUtils.updateAIConcept(
      auth.currentUser.email,
      editConceptId,
      transformedData
    );

    if (!success) {
      throw new Error("AI 개념 수정에 실패했습니다.");
    }

    console.log("✅ 저장 성공! 저장된 데이터 검증을 위해 다시 조회합니다...");

    // 저장된 데이터 검증
    try {
      const savedConcepts = await conceptUtils.getUserAIConcepts(
        auth.currentUser.email
      );
      const savedConcept = savedConcepts.find(
        (c) =>
          c.concept_id === editConceptId ||
          c.id === editConceptId ||
          c._id === editConceptId
      );
      console.log("🔍 저장된 개념 검증:", savedConcept);
      console.log("🔍 저장된 예문 검증:", {
        representative_example: savedConcept?.representative_example,
        examples: savedConcept?.examples,
      });
    } catch (verifyError) {
      console.error("❌ 저장 검증 중 오류:", verifyError);
    }

    alert("AI 개념이 성공적으로 수정되었습니다.");
    closeModal();
    sessionStorage.removeItem("editConceptId");
    editConceptId = null;

    setTimeout(() => window.location.reload(), 100);
  } catch (error) {
    console.error("❌ AI 개념 수정 실패:", error);
    alert(`AI 개념을 수정하는 중 오류가 발생했습니다:\n${error.message}`);
  }
}

// 검증
function validateForm() {
  const domain = document.getElementById("edit-concept-domain")?.value.trim();
  const category = document
    .getElementById("edit-concept-category")
    ?.value.trim();

  if (!domain || !category) {
    alert("도메인과 카테고리는 필수 입력항목입니다.");
    return false;
  }

  return true;
}

// 데이터 수집
function collectFormData() {
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");

  // 이모지 값 가져오기 - select 드롭다운에서 선택된 값 우선
  let selectedEmoji = "";

  if (emojiField && emojiField.value && emojiField.value.trim()) {
    selectedEmoji = emojiField.value.trim();
  } else if (window.editConceptEmojiValue) {
    selectedEmoji = window.editConceptEmojiValue;
  }

  // 이모지가 선택되지 않았거나 빈 값인 경우만 기본값 설정
  if (!selectedEmoji || selectedEmoji === "") {
    selectedEmoji = "📝"; // 기본 이모지를 로봇 대신 메모 이모지로 변경
  }

  const conceptInfo = {
    domain: domainField?.value.trim() || "",
    category: categoryField?.value.trim() || "",
    unicode_emoji: selectedEmoji,
  };

  console.log("🎨 이모지 수집:", {
    original: window.editConceptEmojiValue,
    selectValue: emojiField?.value.trim(),
    final: selectedEmoji,
  });

  // 언어별 표현 수집
  const expressions = {};
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`edit-${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      const pronunciationField = document.getElementById(
        `edit-${langCode}-pronunciation`
      );
      const definitionField = document.getElementById(
        `edit-${langCode}-definition`
      );
      const posField = document.getElementById(`edit-${langCode}-pos`);
      const synonymsField = document.getElementById(
        `edit-${langCode}-synonyms`
      );
      const antonymsField = document.getElementById(
        `edit-${langCode}-antonyms`
      );
      const collocationsField = document.getElementById(
        `edit-${langCode}-collocations`
      );
      const compoundWordsField = document.getElementById(
        `edit-${langCode}-compound-words`
      );

      expressions[langCode] = {
        word: wordField.value.trim(),
        pronunciation: pronunciationField?.value.trim() || "",
        definition: definitionField?.value.trim() || "",
        part_of_speech: posField?.value || "명사",
        synonyms: synonymsField?.value
          ? synonymsField.value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        antonyms: antonymsField?.value
          ? antonymsField.value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        collocations: collocationsField?.value
          ? collocationsField.value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        compound_words: compoundWordsField?.value
          ? compoundWordsField.value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
      };
    }
  }

  // 예문 수집 (AI 편집 모달의 개별 언어별 필드에서)
  const examples = [];
  let representativeExample = null;

  // AI 편집 모달의 개별 언어별 예문 필드에서 대표 예문 수집
  const koreanExample =
    document.getElementById("edit-korean-example")?.value.trim() || "";
  const englishExample =
    document.getElementById("edit-english-example")?.value.trim() || "";
  const japaneseExample =
    document.getElementById("edit-japanese-example")?.value.trim() || "";
  const chineseExample =
    document.getElementById("edit-chinese-example")?.value.trim() || "";

  console.log("🔍 AI 편집 모달 예문 수집:", {
    korean: koreanExample,
    english: englishExample,
    japanese: japaneseExample,
    chinese: chineseExample,
  });

  // 대표 예문 설정 (최소 하나의 언어에 값이 있으면)
  if (koreanExample || englishExample || japaneseExample || chineseExample) {
    representativeExample = {
      korean: koreanExample,
      english: englishExample,
      japanese: japaneseExample,
      chinese: chineseExample,
    };
    console.log("✅ 대표 예문 설정:", representativeExample);
  } else {
    console.log("⚠️ 대표 예문이 비어있습니다");
  }

  console.log("🔍 최종 예문 수집 결과:", {
    representativeExample,
    examples: examples.length,
    allExamples: examples,
  });

  return {
    concept_info: conceptInfo,
    expressions: expressions,
    representative_example: representativeExample,
    examples: examples,
  };
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 전역 함수 - AI 편집 모달 열기
window.openAIEditConceptModal = function (conceptId) {
  console.log("🤖 AI 개념 편집 모달 열기:", conceptId);
  sessionStorage.setItem("editConceptId", conceptId);
  editConceptId = conceptId;

  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
    initialize();
  } else {
    console.error("❌ edit-concept-modal 요소를 찾을 수 없습니다");
  }
};
