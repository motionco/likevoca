/**
 * 개념 모달 공통 유틸리티
 *
 * 추가 모달과 편집 모달에서 공통으로 사용하는 함수들
 */

import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 지원 언어 목록 (호환성)
const supportedLangs = {
  korean: "한국어",
  english: "English",
  japanese: "日本語",
  chinese: "中文",
};

// 언어별 기본 품사 반환
export function getDefaultPartOfSpeech(langCode) {
  const defaultPOS = {
    korean: "명사",
    english: "noun",
    japanese: "名詞",
    chinese: "名词",
  };
  return defaultPOS[langCode] || "명사";
}

// 품사 번역 (언어 간 변환)
export function translatePartOfSpeech(originalPos, targetLang) {
  const posMapping = {
    // 한국어 → 다른 언어
    명사: { english: "noun", japanese: "名詞", chinese: "名词" },
    동사: { english: "verb", japanese: "動詞", chinese: "动词" },
    형용사: { english: "adjective", japanese: "形容詞", chinese: "形容词" },
    부사: { english: "adverb", japanese: "副詞", chinese: "副词" },

    // 영어 → 다른 언어
    noun: { korean: "명사", japanese: "名詞", chinese: "名词" },
    verb: { korean: "동사", japanese: "動詞", chinese: "动词" },
    adjective: { korean: "형용사", japanese: "形容詞", chinese: "形容词" },
    adverb: { korean: "부사", japanese: "副詞", chinese: "副词" },

    // 일본어 → 다른 언어
    名詞: { korean: "명사", english: "noun", chinese: "名词" },
    動詞: { korean: "동사", english: "verb", chinese: "动词" },
    形容詞: { korean: "형용사", english: "adjective", chinese: "形容词" },
    副詞: { korean: "부사", english: "adverb", chinese: "副词" },

    // 중국어 → 다른 언어
    名词: { korean: "명사", english: "noun", japanese: "名詞" },
    动词: { korean: "동사", english: "verb", japanese: "動詞" },
    形容词: { korean: "형용사", english: "adjective", japanese: "形容詞" },
    副词: { korean: "부사", english: "adverb", japanese: "副詞" },
  };

  return (
    posMapping[originalPos]?.[targetLang] || getDefaultPartOfSpeech(targetLang)
  );
}

// 폼 검증
export function validateForm() {
  const domain = document.getElementById("concept-domain").value.trim();
  const category = document.getElementById("concept-category").value.trim();

  if (!domain || !category) {
    alert("도메인과 카테고리는 필수 입력항목입니다.");
    return false;
  }

  // 적어도 하나의 언어는 필수
  let hasValidLanguage = false;
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      hasValidLanguage = true;
      break;
    }
  }

  if (!hasValidLanguage) {
    alert("적어도 하나의 언어에 단어를 입력해야 합니다.");
    return false;
  }

  return true;
}

// 폼 데이터 수집
export function collectFormData() {
  console.log("📊 데이터 수집 시작");

  // 개념 정보
  const domainField = document.getElementById("concept-domain");
  const categoryField = document.getElementById("concept-category");
  const emojiField = document.getElementById("concept-emoji");

  const conceptInfo = {
    domain: domainField ? domainField.value.trim() : "",
    category: categoryField ? categoryField.value.trim() : "",
    emoji: emojiField ? emojiField.value.trim() : "",
    images: [],
  };

  console.log("🏷️ 개념 정보 수집:", conceptInfo);

  // 언어별 표현 수집
  const expressions = {};
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      const pronunciationField = document.getElementById(
        `${langCode}-pronunciation`
      );
      const definitionField = document.getElementById(`${langCode}-definition`);
      const posField = document.getElementById(`${langCode}-pos`);

      // 고급 필드들 수집
      const synonymsField = document.getElementById(`${langCode}-synonyms`);
      const antonymsField = document.getElementById(`${langCode}-antonyms`);
      const collocationsField = document.getElementById(
        `${langCode}-collocations`
      );
      const compoundWordsField = document.getElementById(
        `${langCode}-compound-words`
      );

      expressions[langCode] = {
        word: wordField.value.trim(),
        pronunciation: pronunciationField
          ? pronunciationField.value.trim()
          : "",
        definition: definitionField ? definitionField.value.trim() : "",
        part_of_speech: posField
          ? posField.value
          : getDefaultPartOfSpeech(langCode),
        synonyms:
          synonymsField && synonymsField.value.trim()
            ? synonymsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        antonyms:
          antonymsField && antonymsField.value.trim()
            ? antonymsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        collocations:
          collocationsField && collocationsField.value.trim()
            ? collocationsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        compound_words:
          compoundWordsField && compoundWordsField.value.trim()
            ? compoundWordsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
      };

      console.log(`🌍 ${langCode} 표현 수집:`, expressions[langCode]);
    }
  }

  // 예제 수집 (대표 예문과 일반 예문 구분)
  const examples = [];
  let representativeExample = null;

  document.querySelectorAll(".example-item").forEach((item) => {
    const example = {};
    let hasContent = false;

    // 대표 예문인지 확인
    const isRepresentative = item
      .querySelector("span")
      .textContent.includes("대표 예문");

    // 각 언어별 예제 수집
    for (const langCode of Object.keys(supportedLangs)) {
      const exampleField = item.querySelector(`.${langCode}-example`);
      if (exampleField && exampleField.value.trim()) {
        example[langCode] = exampleField.value.trim();
        hasContent = true;
      }
    }

    // 내용이 있는 예제 처리
    if (hasContent) {
      if (isRepresentative) {
        representativeExample = { translations: example };
        console.log("📝 대표 예문 수집:", representativeExample);
      } else {
        examples.push(example);
        console.log("📝 일반 예문 수집:", example);
      }
    }
  });

  const result = {
    concept_info: conceptInfo,
    expressions: expressions,
    examples: examples,
    // 기존 시스템과의 호환성을 위한 추가 필드들
    domain: conceptInfo.domain,
    category: conceptInfo.category,
    featured_examples: examples.length > 0 ? examples : [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  // 대표 예문이 있으면 추가
  if (representativeExample) {
    result.representative_example = representativeExample;
  }

  console.log("📋 최종 수집된 데이터:", result);
  console.log("🔍 데이터 검증:", {
    hasExpressions: Object.keys(expressions).length > 0,
    hasConceptInfo: !!conceptInfo.domain && !!conceptInfo.category,
    hasRepresentativeExample: !!representativeExample,
    expressionCount: Object.keys(expressions).length,
  });

  return result;
}

// 폼 리셋
export function resetForm() {
  // 기본 필드 초기화
  const domainField = document.getElementById("concept-domain");
  const categoryField = document.getElementById("concept-category");
  const emojiField = document.getElementById("concept-emoji");

  if (domainField) domainField.value = "";
  if (categoryField) categoryField.value = "";
  if (emojiField) emojiField.value = "";

  // 언어별 필드 초기화
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`${langCode}-word`);
    const pronunciationField = document.getElementById(
      `${langCode}-pronunciation`
    );
    const definitionField = document.getElementById(`${langCode}-definition`);
    const posField = document.getElementById(`${langCode}-pos`);

    // 고급 필드들
    const synonymsField = document.getElementById(`${langCode}-synonyms`);
    const antonymsField = document.getElementById(`${langCode}-antonyms`);
    const collocationsField = document.getElementById(
      `${langCode}-collocations`
    );
    const compoundWordsField = document.getElementById(
      `${langCode}-compound-words`
    );

    if (wordField) wordField.value = "";
    if (pronunciationField) pronunciationField.value = "";
    if (definitionField) definitionField.value = "";
    if (posField) posField.value = getDefaultPartOfSpeech(langCode);

    // 고급 필드들 초기화
    if (synonymsField) synonymsField.value = "";
    if (antonymsField) antonymsField.value = "";
    if (collocationsField) collocationsField.value = "";
    if (compoundWordsField) compoundWordsField.value = "";
  }

  // 예제 초기화
  const examplesContainer = document.getElementById("examples-container");
  if (examplesContainer) {
    examplesContainer.innerHTML = "";
    // 기본 대표 예문 필드 추가
    addExampleFields(null, true);
  }
}

// 모달 닫기
export function closeModal() {
  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 언어 탭 이벤트 리스너 설정
export function initLanguageTabEventListeners() {
  const tabButtons = document.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );

  tabButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      // data-language 속성에서 언어를 가져오고 언어 코드로 변환
      const language = button.dataset.language;
      const langCode = convertLanguageToCode(language);
      console.log("🖱️ 언어 탭 클릭:", { language, langCode });
      switchLanguageTab(langCode);
    });
  });
}

// 언어명을 코드로 변환하는 함수
function convertLanguageToCode(language) {
  const languageMap = {
    korean: "korean",
    english: "english",
    japanese: "japanese",
    chinese: "chinese",
  };
  return languageMap[language] || language;
}

// 언어 탭 전환
export function switchLanguageTab(langCode) {
  console.log("🔄 언어 탭 전환:", langCode);

  // 모든 탭 버튼 비활성화
  document
    .querySelectorAll("#edit-language-tabs .edit-language-tab")
    .forEach((tab) => {
      tab.classList.remove("border-blue-500", "text-blue-600");
      tab.classList.add("border-transparent", "text-gray-500");
    });

  // 모든 탭 콘텐츠 숨기기
  document
    .querySelectorAll("#edit-language-content .language-content")
    .forEach((section) => {
      section.classList.add("hidden");
    });

  // 선택된 탭 활성화
  const selectedTab = document.querySelector(
    `#edit-language-tabs .edit-language-tab[data-language="${langCode}"]`
  );
  if (selectedTab) {
    selectedTab.classList.remove("border-transparent", "text-gray-500");
    selectedTab.classList.add("border-blue-500", "text-blue-600");
    console.log("✅ 탭 활성화됨:", langCode);
  } else {
    console.error("❌ 탭을 찾을 수 없음:", langCode);
  }

  // 선택된 콘텐츠 표시
  const selectedContent = document.getElementById(`${langCode}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
    console.log("✅ 콘텐츠 표시됨:", langCode);
  } else {
    console.error("❌ 콘텐츠를 찾을 수 없음:", `${langCode}-content`);
  }
}

// 예제 필드 추가
export function addExampleFields(
  existingExample = null,
  isRepresentative = false
) {
  const containerFound = document.getElementById("examples-container");
  console.log("📝 addExampleFields 호출:", {
    existingExample,
    isRepresentative,
    containerFound: !!containerFound,
  });

  if (!containerFound) {
    console.error("❌ examples-container를 찾을 수 없습니다");
    return;
  }

  const exampleItem = document.createElement("div");
  exampleItem.className = "example-item border rounded-lg p-4 mb-4";

  // 예제 레이블
  const labelText = isRepresentative
    ? "대표 예문"
    : `예문 ${containerFound.children.length + 1}`;

  let exampleHTML = `
    <div class="flex justify-between items-center mb-3">
      <span class="font-medium text-gray-700">${labelText}</span>
      ${
        !isRepresentative
          ? '<button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest(\'.example-item\').remove()">삭제</button>'
          : ""
      }
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  `;

  // 각 언어별 예문 입력 필드
  Object.keys(supportedLangs).forEach((langCode) => {
    const langName = supportedLangs[langCode];
    const existingValue = existingExample?.[langCode] || "";

    exampleHTML += `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">${langName} 예문</label>
        <textarea
          class="${langCode}-example w-full p-2 border rounded-md resize-none"
          rows="2"
          placeholder="${langName} 예문을 입력하세요">${existingValue}</textarea>
      </div>
    `;
  });

  exampleHTML += "</div>";
  exampleItem.innerHTML = exampleHTML;
  containerFound.appendChild(exampleItem);
}

// 정적 레이블 업데이트 (다국어)
export async function updateStaticLabels(userLanguage) {
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        synonyms: "유사어 (쉼표로 구분)",
        antonyms: "반의어 (쉼표로 구분)",
        collocations: "연어 (쉼표로 구분)",
        compound_words: "복합어 (쉼표로 구분)",
      },
      en: {
        synonyms: "Synonyms (comma separated)",
        antonyms: "Antonyms (comma separated)",
        collocations: "Collocations (comma separated)",
        compound_words: "Compound words (comma separated)",
      },
      ja: {
        synonyms: "類義語 (カンマ区切り)",
        antonyms: "反義語 (カンマ区切り)",
        collocations: "連語 (カンマ区切り)",
        compound_words: "複合語 (カンマ区切り)",
      },
      zh: {
        synonyms: "同义词 (逗号分隔)",
        antonyms: "反义词 (逗号分隔)",
        collocations: "搭配词 (逗号分隔)",
        compound_words: "复合词 (逗号分隔)",
      },
    };
    return labels[userLang] || labels.ko;
  };

  const labels = getUILabels(userLanguage);

  // 모든 언어 섹션의 레이블 업데이트
  Object.keys(supportedLangs).forEach((langCode) => {
    // 유사어 레이블
    const synonymsLabel = document.querySelector(
      `#${langCode}-section label[for="${langCode}-synonyms"]`
    );
    if (synonymsLabel) synonymsLabel.textContent = labels.synonyms;

    // 반의어 레이블
    const antonymsLabel = document.querySelector(
      `#${langCode}-section label[for="${langCode}-antonyms"]`
    );
    if (antonymsLabel) antonymsLabel.textContent = labels.antonyms;

    // 연어 레이블
    const collocationsLabel = document.querySelector(
      `#${langCode}-section label[for="${langCode}-collocations"]`
    );
    if (collocationsLabel) collocationsLabel.textContent = labels.collocations;

    // 복합어 레이블
    const compoundWordsLabel = document.querySelector(
      `#${langCode}-section label[for="${langCode}-compound-words"]`
    );
    if (compoundWordsLabel)
      compoundWordsLabel.textContent = labels.compound_words;
  });
}

// 편집 모달용 함수들 (별도 ID 사용)

// 편집 폼 검증
export function validateEditForm() {
  // 필수 필드 검증
  const domain = document.getElementById("edit-concept-domain").value.trim();
  const category = document
    .getElementById("edit-concept-category")
    .value.trim();

  if (!domain || !category) {
    alert("도메인과 카테고리는 필수 입력항목입니다.");
    return false;
  }

  // 적어도 하나의 언어는 필수
  let hasValidLanguage = false;

  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`edit-${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      hasValidLanguage = true;
      break;
    }
  }

  if (!hasValidLanguage) {
    alert("적어도 하나의 언어에 단어를 입력해야 합니다.");
    return false;
  }

  return true;
}

// 편집 폼 데이터 수집
export function collectEditFormData() {
  console.log("📊 편집 폼 데이터 수집 시작");

  // 개념 정보
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");

  const conceptInfo = {
    domain: domainField ? domainField.value.trim() : "",
    category: categoryField ? categoryField.value.trim() : "",
    emoji: emojiField ? emojiField.value.trim() : "",
    images: [], // 이미지는 나중에 구현
  };

  console.log("🏷️ 편집 개념 정보 수집:", conceptInfo);

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

      // 고급 필드들 수집
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
        pronunciation: pronunciationField
          ? pronunciationField.value.trim()
          : "",
        definition: definitionField ? definitionField.value.trim() : "",
        part_of_speech: posField
          ? posField.value
          : getDefaultPartOfSpeech(langCode),
        // 고급 필드들 추가
        synonyms:
          synonymsField && synonymsField.value.trim()
            ? synonymsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        antonyms:
          antonymsField && antonymsField.value.trim()
            ? antonymsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        collocations:
          collocationsField && collocationsField.value.trim()
            ? collocationsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
        compound_words:
          compoundWordsField && compoundWordsField.value.trim()
            ? compoundWordsField.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
      };

      console.log(`🌍 편집 ${langCode} 표현 수집:`, expressions[langCode]);
    }
  }

  // 예제 수집 (편집 모달용)
  const examples = [];
  let representativeExample = null;

  document
    .querySelectorAll("#edit-examples-container .example-item")
    .forEach((item) => {
      const example = {};
      let hasContent = false;

      // 대표 예문인지 확인
      const isRepresentative = item
        .querySelector("span")
        .textContent.includes("대표 예문");

      // 각 언어별 예제 수집
      for (const langCode of Object.keys(supportedLangs)) {
        const exampleField = item.querySelector(`.${langCode}-example`);
        if (exampleField && exampleField.value.trim()) {
          example[langCode] = exampleField.value.trim();
          hasContent = true;
        }
      }

      // 내용이 있는 예제 처리
      if (hasContent) {
        if (isRepresentative) {
          representativeExample = {
            translations: example,
          };
          console.log("📝 편집 대표 예문 수집:", representativeExample);
        } else {
          examples.push(example);
          console.log("📝 편집 일반 예문 수집:", example);
        }
      }
    });

  const result = {
    concept_info: conceptInfo,
    expressions: expressions,
    examples: examples,
    // 기존 시스템과의 호환성을 위한 추가 필드들
    domain: conceptInfo.domain,
    category: conceptInfo.category,
    featured_examples: examples.length > 0 ? examples : [],
    updated_at: new Date(),
  };

  // 대표 예문이 있으면 추가
  if (representativeExample) {
    result.representative_example = representativeExample;
  }

  console.log("📋 편집 폼 최종 수집된 데이터:", result);
  return result;
}

// 편집 폼 리셋
export function resetEditForm() {
  // 폼 리셋 (안전한 null 체크)
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");

  if (domainField) domainField.value = "";
  if (categoryField) categoryField.value = "";
  if (emojiField) emojiField.value = "";

  // 언어별 필드 초기화
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`edit-${langCode}-word`);
    const pronunciationField = document.getElementById(
      `edit-${langCode}-pronunciation`
    );
    const definitionField = document.getElementById(
      `edit-${langCode}-definition`
    );
    const posField = document.getElementById(`edit-${langCode}-pos`);

    // 고급 필드들
    const synonymsField = document.getElementById(`edit-${langCode}-synonyms`);
    const antonymsField = document.getElementById(`edit-${langCode}-antonyms`);
    const collocationsField = document.getElementById(
      `edit-${langCode}-collocations`
    );
    const compoundWordsField = document.getElementById(
      `edit-${langCode}-compound-words`
    );

    if (wordField) wordField.value = "";
    if (pronunciationField) pronunciationField.value = "";
    if (definitionField) definitionField.value = "";
    if (posField) posField.value = getDefaultPartOfSpeech(langCode);

    // 고급 필드들 초기화
    if (synonymsField) synonymsField.value = "";
    if (antonymsField) antonymsField.value = "";
    if (collocationsField) collocationsField.value = "";
    if (compoundWordsField) compoundWordsField.value = "";
  }

  // 예제 초기화 (편집 모달용)
  const examplesContainer = document.getElementById("edit-examples-container");
  if (examplesContainer) {
    examplesContainer.innerHTML = "";
    // 기본 대표 예문 필드 추가
    addEditExampleFields(null, true);
  }
}

// 편집 모달 닫기
export function closeEditModal() {
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 편집 모달용 예제 필드 추가
export function addEditExampleFields(
  existingExample = null,
  isRepresentative = false
) {
  const containerFound = document.getElementById("edit-examples-container");
  console.log("📝 편집 모달 addExampleFields 호출:", {
    existingExample,
    isRepresentative,
    containerFound: !!containerFound,
  });

  if (!containerFound) {
    console.error("❌ edit-examples-container를 찾을 수 없습니다");
    return;
  }

  const exampleItem = document.createElement("div");
  exampleItem.className = "example-item border rounded-lg p-4 mb-4";

  // 예제 레이블
  const labelText = isRepresentative
    ? "대표 예문"
    : `예문 ${containerFound.children.length + 1}`;

  let exampleHTML = `
    <div class="flex justify-between items-center mb-3">
      <span class="font-medium text-gray-700">${labelText}</span>
      ${
        !isRepresentative
          ? '<button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest(\'.example-item\').remove()">삭제</button>'
          : ""
      }
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  `;

  // 각 언어별 예문 입력 필드
  Object.keys(supportedLangs).forEach((langCode) => {
    const langName = supportedLangs[langCode];
    const existingValue = existingExample?.[langCode] || "";

    exampleHTML += `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">${langName} 예문</label>
        <textarea
          class="${langCode}-example w-full p-2 border rounded-md resize-none"
          rows="2"
          placeholder="${langName} 예문을 입력하세요">${existingValue}</textarea>
      </div>
    `;
  });

  exampleHTML += "</div>";
  exampleItem.innerHTML = exampleHTML;
  containerFound.appendChild(exampleItem);
}
