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

  // 버튼 이벤트 설정
  setupEventListeners();

  // AI 개념 데이터 로드
  await fetchAIConceptForEdit(editConceptId);
}

// 도메인/카테고리 연동 시스템 설정 (단어장 개념 수정 모달 방식 참고)
function setupDomainCategorySystem() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categoryInput = document.getElementById("edit-concept-category");

  if (domainSelect && categoryInput) {
    // 카테고리 입력 필드를 선택 필드로 변경
    const categorySelect = document.createElement("select");
    categorySelect.id = "edit-concept-category";
    categorySelect.className = "w-full p-2 border rounded";
    categoryInput.parentNode.replaceChild(categorySelect, categoryInput);

    // 클론 방식으로 기존 이벤트 리스너 완전 제거 후 새로 등록
    const newDomainSelect = domainSelect.cloneNode(true);
    domainSelect.parentNode.replaceChild(newDomainSelect, domainSelect);

    const newCategorySelect = categorySelect.cloneNode(true);
    categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);

    // 새로운 이벤트 리스너 등록
    newDomainSelect.addEventListener("change", handleAIEditDomainChange);
    newCategorySelect.addEventListener("change", handleAIEditCategoryChange);

    // 초기 카테고리 옵션 설정
    updateCategoryOptions(newDomainSelect.value, newCategorySelect);
  }
}

// AI 편집 모달 도메인 변경 핸들러
function handleAIEditDomainChange(event) {
  const categorySelect = document.getElementById("edit-concept-category");

  console.log("🔄 AI 편집 모달 도메인 변경:", event.target.value);

  // 카테고리 옵션 업데이트
  if (typeof updateEditCategoryOptions === "function") {
    updateEditCategoryOptions();
  } else {
    // 직접 업데이트
    updateCategoryOptions(event.target.value, categorySelect);
  }

  // 카테고리 초기화 (첫 번째 옵션 선택) - 더 긴 지연 시간
  setTimeout(() => {
    if (categorySelect && categorySelect.options.length > 1) {
      categorySelect.selectedIndex = 1; // 첫 번째 실제 옵션 선택
      console.log("🎯 AI 편집 모달 카테고리 자동 선택:", categorySelect.value);

      // 카테고리 변경 이벤트 트리거
      categorySelect.dispatchEvent(new Event("change"));
    }
  }, 150);
}

// AI 편집 모달 카테고리 변경 핸들러
function handleAIEditCategoryChange(event) {
  // 이모지 옵션 업데이트
  if (typeof updateEditEmojiOptions === "function") {
    updateEditEmojiOptions();
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

  // 플레이스홀더 옵션 추가
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "카테고리 선택";
  placeholderOption.style.display = "none";
  categorySelect.appendChild(placeholderOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  console.log(
    `✅ 카테고리 옵션 업데이트 완료: ${domain} -> ${categories.length}개`
  );
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

  // 기본 정보
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");

  // 도메인 설정
  const domainValue =
    conceptData.concept_info?.domain || conceptData.domain || "daily";
  if (domainField) {
    domainField.value = domainValue;
  }

  // 도메인에 따른 카테고리 옵션 업데이트 후 카테고리 값 설정 (단어장 방식 참고)
  if (categoryField) {
    const categoryValue =
      conceptData.concept_info?.category || conceptData.category || "other";

    console.log("🔍 AI 편집 모달 설정 값:", {
      domainValue,
      categoryValue,
      conceptData: conceptData.concept_info || conceptData,
    });

    // 도메인 변경 이벤트 트리거 (카테고리 옵션 자동 생성)
    if (domainField) {
      domainField.dispatchEvent(new Event("change"));
    }

    // 카테고리 설정 (도메인 변경 후 충분한 지연)
    setTimeout(() => {
      categoryField.value = categoryValue;
      console.log("🤖 카테고리 설정:", categoryValue);

      // 카테고리 변경 이벤트 트리거 (이모지 옵션 자동 생성)
      categoryField.dispatchEvent(new Event("change"));

      // 이모지 설정 (카테고리 변경 후 충분한 지연)
      setTimeout(() => {
        if (emojiField) {
          const dbEmoji =
            conceptData.concept_info?.unicode_emoji ||
            conceptData.concept_info?.emoji ||
            conceptData.unicode_emoji ||
            "🤖";
          emojiField.value = dbEmoji;
          console.log("🎨 AI 편집 모달 이모지 설정:", dbEmoji);

          // 설정 확인 및 재시도
          if (emojiField.value !== dbEmoji) {
            console.warn("⚠️ AI 편집 모달 이모지 설정 실패, 재시도 중...");
            setTimeout(() => {
              emojiField.value = dbEmoji;
              console.log("🔄 AI 편집 모달 이모지 재설정:", dbEmoji);
            }, 100);
          }
        }
      }, 200);
    }, 200);
  }
  if (emojiField) {
    // 실제 저장된 이모지를 사용, 기본값으로 🤖 사용
    emojiField.value =
      conceptData.concept_info?.unicode_emoji ||
      conceptData.concept_info?.emoji ||
      conceptData.unicode_emoji ||
      conceptData.emoji ||
      "🤖";
  }

  // 언어별 표현
  if (conceptData.expressions) {
    for (const [lang, expression] of Object.entries(conceptData.expressions)) {
      const wordField = document.getElementById(`edit-${lang}-word`);
      const pronunciationField = document.getElementById(
        `edit-${lang}-pronunciation`
      );
      const definitionField = document.getElementById(
        `edit-${lang}-definition`
      );
      const posField = document.getElementById(`edit-${lang}-pos`);

      if (wordField) wordField.value = expression.word || "";
      if (pronunciationField)
        pronunciationField.value = expression.pronunciation || "";
      if (definitionField) definitionField.value = expression.definition || "";
      if (posField) {
        // 언어별 품사 매핑
        let posValue = expression.part_of_speech || "명사";

        // 원본 품사를 각 언어에 맞는 형태로 변환
        const posMapping = {
          // 한국어 (그대로 유지)
          korean: {
            명사: "명사",
            동사: "동사",
            형용사: "형용사",
            부사: "부사",
            noun: "명사",
            verb: "동사",
            adjective: "형용사",
            adverb: "부사",
            名詞: "명사",
            動詞: "동사",
            形容詞: "형용사",
            副詞: "부사",
            名词: "명사",
            动词: "동사",
            형容词: "형용사",
            副词: "부사",
          },
          // 영어
          english: {
            명사: "noun",
            동사: "verb",
            형용사: "adjective",
            부사: "adverb",
            noun: "noun",
            verb: "verb",
            adjective: "adjective",
            adverb: "adverb",
            名詞: "noun",
            動詞: "verb",
            形容詞: "adjective",
            副詞: "adverb",
            名词: "noun",
            动词: "verb",
            形容词: "adjective",
            副词: "adverb",
          },
          // 일본어
          japanese: {
            명사: "名詞",
            동사: "動詞",
            형용사: "形容詞",
            부사: "副詞",
            noun: "名詞",
            verb: "動詞",
            adjective: "形容詞",
            adverb: "副詞",
            名詞: "名詞",
            動詞: "動詞",
            形容詞: "形容詞",
            副詞: "副詞",
            名词: "名詞",
            动词: "動詞",
            形容词: "形容詞",
            副词: "副詞",
          },
          // 중국어
          chinese: {
            명사: "名词",
            동사: "动词",
            형용사: "形容词",
            부사: "副词",
            noun: "名词",
            verb: "动词",
            adjective: "形容词",
            adverb: "副词",
            名詞: "名词",
            動詞: "动词",
            形容詞: "形容词",
            副詞: "副词",
            名词: "名词",
            动词: "动词",
            形容词: "形容词",
            副词: "副词",
          },
        };

        // 현재 언어에 맞는 품사 값 설정
        const langMapping = posMapping[lang];
        if (langMapping && langMapping[posValue]) {
          posField.value = langMapping[posValue];
        } else {
          // 기본값 설정
          const defaultValues = {
            korean: "명사",
            english: "noun",
            japanese: "名詞",
            chinese: "名词",
          };
          posField.value = defaultValues[lang] || "명사";
        }
      }

      // 고급 필드들
      const synonymsField = document.getElementById(`edit-${lang}-synonyms`);
      const antonymsField = document.getElementById(`edit-${lang}-antonyms`);
      const collocationsField = document.getElementById(
        `edit-${lang}-collocations`
      );
      const compoundWordsField = document.getElementById(
        `edit-${lang}-compound-words`
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

  // 예문 처리
  fillExamples(conceptData);
}

// 예문 채우기
function fillExamples(conceptData) {
  const examplesContainer = document.getElementById("edit-examples-container");
  if (!examplesContainer) return;

  console.log("🔍 예문 채우기 시작:", {
    representative_example: conceptData.representative_example,
    examples: conceptData.examples,
    examples_length: conceptData.examples?.length,
  });

  examplesContainer.innerHTML = "";

  // 대표 예문 추가
  if (conceptData.representative_example) {
    let repExample = null;

    if (conceptData.representative_example.translations) {
      repExample = conceptData.representative_example.translations;
    } else if (
      conceptData.representative_example.korean ||
      conceptData.representative_example.english
    ) {
      repExample = conceptData.representative_example;
    }

    if (repExample) {
      console.log("✅ 대표 예문 추가:", repExample);
      addExampleField(repExample, true);
    }
  }

  // 추가 예문들
  if (conceptData.examples && Array.isArray(conceptData.examples)) {
    console.log("🔍 추가 예문 처리:", conceptData.examples);
    conceptData.examples.forEach((example, index) => {
      console.log(`✅ 추가 예문 ${index + 1} 추가:`, example);
      addExampleField(example, false);
    });
  } else {
    console.log("⚠️ 추가 예문이 없거나 배열이 아닙니다:", conceptData.examples);
  }

  // 예문이 없으면 기본 예문 필드 하나 추가
  if (
    !conceptData.representative_example &&
    (!conceptData.examples || conceptData.examples.length === 0)
  ) {
    console.log("⚠️ 예문이 없어서 기본 예문 필드 추가");
    addExampleField(null, true);
  }

  console.log(
    "🔍 예문 채우기 완료. 컨테이너 내용:",
    examplesContainer.children.length,
    "개 예문"
  );
}

// 예문 필드 추가
function addExampleField(existingExample = null, isRepresentative = false) {
  const container = document.getElementById("edit-examples-container");
  if (!container) return;

  const exampleDiv = document.createElement("div");
  exampleDiv.className = "border rounded-lg p-4 mb-4 bg-gray-50";

  const exampleIndex = container.children.length;
  const title = isRepresentative ? "대표 예문" : `예문 ${exampleIndex + 1}`;

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
        <input type="text" class="korean-example w-full p-2 border rounded" value="${
          existingExample?.korean || ""
        }">
      </div>
      <div>
        <label class="block text-sm text-gray-600">영어</label>
        <input type="text" class="english-example w-full p-2 border rounded" value="${
          existingExample?.english || ""
        }">
      </div>
      <div>
        <label class="block text-sm text-gray-600">일본어</label>
        <input type="text" class="japanese-example w-full p-2 border rounded" value="${
          existingExample?.japanese || ""
        }">
      </div>
      <div>
        <label class="block text-sm text-gray-600">중국어</label>
        <input type="text" class="chinese-example w-full p-2 border rounded" value="${
          existingExample?.chinese || ""
        }">
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
        unicode_emoji: conceptData.concept_info.emoji || "🤖",
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

  const conceptInfo = {
    domain: domainField?.value.trim() || "",
    category: categoryField?.value.trim() || "",
    emoji: emojiField?.value.trim() || "🤖", // 폼에서 입력된 이모지 사용
  };

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

  // 예문 수집
  const examples = [];
  let representativeExample = null;

  const exampleDivs = document.querySelectorAll(
    "#edit-examples-container > div"
  );

  console.log("🔍 예문 수집 시작:", exampleDivs.length, "개 예문 div 발견");

  exampleDivs.forEach((div, index) => {
    const isRepresentative = div
      .querySelector("h4")
      .textContent.includes("대표");

    const example = {
      korean: div.querySelector(".korean-example")?.value.trim() || "",
      english: div.querySelector(".english-example")?.value.trim() || "",
      japanese: div.querySelector(".japanese-example")?.value.trim() || "",
      chinese: div.querySelector(".chinese-example")?.value.trim() || "",
    };

    console.log(`🔍 예문 ${index + 1} (대표: ${isRepresentative}):`, example);

    // 빈 예문은 제외
    if (
      example.korean ||
      example.english ||
      example.japanese ||
      example.chinese
    ) {
      if (isRepresentative) {
        // 기존 구조 유지 - translations 속성 제거
        representativeExample = example;
        console.log("✅ 대표 예문 설정:", representativeExample);
      } else {
        examples.push(example);
        console.log("✅ 일반 예문 추가:", example);
      }
    } else {
      console.log("⚠️ 빈 예문 건너뛰기");
    }
  });

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
