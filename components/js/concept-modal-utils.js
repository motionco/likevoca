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
import {
  getActiveLanguage,
  applyLanguage,
} from "../../utils/language-utils.js";

// 지원 언어 목록 (호환성)
const supportedLangs = {
  korean: "한국어",
  english: "English",
  japanese: "日本語",
  chinese: "中文",
};

// 언어별 기본 품사 반환 (빈 값으로 수정하여 플레이스홀더가 보이도록)
export function getDefaultPartOfSpeech(langCode) {
  // 플레이스홀더가 보이도록 빈 값 반환
  return "";
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
  const purposeField = document.getElementById("concept-purpose");

  // 상황 체크박스들 수집
  const situationCheckboxes = document.querySelectorAll(
    'input[name="situation"]:checked'
  );
  const situations = Array.from(situationCheckboxes).map((cb) => cb.value);

  const conceptInfo = {
    domain: domainField ? domainField.value.trim() : "",
    category: categoryField ? categoryField.value.trim() : "",
    difficulty: "basic", // 기본값 설정
    unicode_emoji: emojiField ? emojiField.value.trim() : "",
    color_theme: "#FF6B6B", // 기본 색상 테마
    situation: situations.length > 0 ? situations : ["casual"], // 기본값 설정
    purpose: purposeField ? purposeField.value.trim() : "description", // 기본값 설정
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
        part_of_speech: posField && posField.value ? posField.value : "",
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
        word_family:
          synonymsField && synonymsField.value.trim()
            ? synonymsField.value
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
        collocations:
          collocationsField && collocationsField.value.trim()
            ? collocationsField.value
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
  let representativeExample = {};

  document.querySelectorAll(".example-item").forEach((item, index) => {
    const example = {};
    let hasContent = false;

    // 첫 번째 예문은 항상 대표 예문으로 처리 (UI에서 대표 예문으로 표시됨)
    const isRepresentative = index === 0;

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
        representativeExample = example; // 직접 언어별 예문 객체로 저장
        console.log("📝 대표 예문 수집:", representativeExample);
      } else {
        examples.push(example);
        console.log("📝 일반 예문 수집:", example);
      }
    }
  });

  // 새로운 템플릿 구조에 맞는 데이터 생성
  const result = {
    concept_info: conceptInfo,
    expressions: expressions,
    representative_example:
      Object.keys(representativeExample).length > 0
        ? representativeExample
        : null,
  };

  // 추가 예문이 있는 경우에만 examples 필드 추가
  if (examples.length > 0) {
    result.examples = examples;
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
  const purposeField = document.getElementById("concept-purpose");

  if (domainField) domainField.value = "";
  if (categoryField) categoryField.value = "";
  if (emojiField) emojiField.value = "";
  if (purposeField) purposeField.value = "";

  // 상황 체크박스들 초기화
  const situationCheckboxes = document.querySelectorAll(
    'input[name="situation"]'
  );
  situationCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

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
    if (posField) posField.value = "";

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
    // 기본 대표 예문 필드를 HTML로 직접 추가
    const representativeExampleHTML = `
      <div class="example-item border-2 border-blue-300 bg-blue-50 p-4 rounded mb-4">
        <div class="flex items-center mb-3">
          <i class="fas fa-star text-yellow-500 mr-2"></i>
          <span class="font-semibold text-blue-700" data-i18n="representative_example">대표 예문</span>
          <span class="text-sm text-gray-600 ml-2" data-i18n="representative_example_desc">(필수 - 개념을 가장 잘 보여주는 예문)</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1" data-i18n="korean_example">한국어 예문</label>
            <textarea class="korean-example w-full p-2 border rounded h-20" placeholder="나는 빨간 사과를 좋아한다."></textarea>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1" data-i18n="english_example">영어 예문</label>
            <textarea class="english-example w-full p-2 border rounded h-20" placeholder="I like red apples."></textarea>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1" data-i18n="japanese_example">일본어 예문</label>
            <textarea class="japanese-example w-full p-2 border rounded h-20" placeholder="私は赤いりんごが好きです。"></textarea>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1" data-i18n="chinese_example">중국어 예문</label>
            <textarea class="chinese-example w-full p-2 border rounded h-20" placeholder="我喜欢红苹果。"></textarea>
          </div>
        </div>
      </div>
    `;
    examplesContainer.innerHTML = representativeExampleHTML;
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

  // 현재 언어 탭에 맞는 플레이스홀더 업데이트 (언어별 입력 필드)
  updatePlaceholdersForCurrentLanguage(langCode);

  // 언어 탭별 품사 옵션 업데이트
  if (window.updatePartOfSpeechByLanguageTab) {
    window.updatePartOfSpeechByLanguageTab();
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

  // 예제 레이블 (대표 예문 레이블 제거)
  const labelText = isRepresentative
    ? ""
    : `예문 ${containerFound.children.length + 1}`;

  let exampleHTML = `
    ${
      labelText
        ? `<div class="flex justify-between items-center mb-3">
      <span class="font-medium text-gray-700">${labelText}</span>
      <button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest('.example-item').remove()">삭제</button>
    </div>`
        : ""
    }
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  `;

  // 각 언어별 예문 입력 필드 (다국어 키 사용)
  Object.keys(supportedLangs).forEach((langCode) => {
    const langName = supportedLangs[langCode];
    const existingValue = existingExample?.[langCode] || "";

    // 플레이스홀더용 예문 설정 (실제 값으로 사용하지 않음)
    const placeholderExamples = {
      korean: "나는 빨간 사과를 좋아한다.",
      english: "I like red apples.",
      japanese: "私は赤いりんごが好きです。",
      chinese: "我喜欢红苹果。",
    };

    const defaultValue = existingValue || "";
    const i18nKey = `${langCode}_example`;

    exampleHTML += `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" data-i18n="${i18nKey}">${langName} 예문</label>
        <textarea
          class="${langCode}-example w-full p-2 border rounded-md resize-none"
          rows="2"
          placeholder="${
            placeholderExamples[langCode] || `${langName} 예문을 입력하세요`
          }">${defaultValue}</textarea>
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

// 모달에 다국어 번역 적용
export async function applyModalTranslations() {
  try {
    const userLanguage = await getActiveLanguage();
    console.log("🌍 모달 번역 적용:", userLanguage);

    // localStorage에도 언어 설정 저장
    localStorage.setItem("preferredLanguage", userLanguage);
    console.log("💾 preferredLanguage 저장:", userLanguage);

    // data-i18n 속성이 있는 모든 요소에 번역 적용
    await applyLanguage();

    // 정적 레이블 업데이트
    await updateStaticLabels(userLanguage);

    // 플레이스홀더 텍스트 번역 적용
    applyPlaceholderTranslations(userLanguage);

    // 도메인-카테고리-이모지 옵션 업데이트 (여러 번의 시도로 확실하게)
    console.log("🔄 도메인-카테고리 번역 시작");

    // 즉시 한 번 실행
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }

    // 100ms 후 도메인-카테고리 옵션 번역 업데이트
    setTimeout(() => {
      if (typeof window.updateDomainOptions === "function") {
        window.updateDomainOptions();
      }
    }, 100);

    // 100ms 후 품사 옵션 번역 업데이트
    setTimeout(() => {
      if (typeof window.updatePartOfSpeechOptions === "function") {
        window.updatePartOfSpeechOptions();
      }
    }, 100);

    // 100ms 후 언어 탭별 품사 옵션 업데이트
    setTimeout(() => {
      if (typeof window.updatePartOfSpeechByLanguageTab === "function") {
        window.updatePartOfSpeechByLanguageTab();
      }
    }, 100);

    // 300ms 후 최종 확인
    setTimeout(() => {
      if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
        window.updateDomainCategoryEmojiLanguage();
      }
    }, 300);
  } catch (error) {
    console.error("❌ 모달 번역 적용 실패:", error);
  }
}

// 플레이스홀더 텍스트 번역 적용
function applyPlaceholderTranslations(userLanguage) {
  const placeholderTranslations = {
    ko: {
      category_placeholder: "예: fruit, animal",
    },
    en: {
      category_placeholder: "e.g.: fruit, animal",
    },
    ja: {
      category_placeholder: "例: fruit, animal",
    },
    zh: {
      category_placeholder: "例如: fruit, animal",
    },
  };

  const translations =
    placeholderTranslations[userLanguage] || placeholderTranslations.ko;

  // data-i18n-placeholder 속성이 있는 요소들의 placeholder 업데이트
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (translations[key]) {
      element.placeholder = translations[key];
    }
  });
}

// 현재 언어 탭에 맞는 플레이스홀더 업데이트
function updatePlaceholdersForCurrentLanguage(langCode) {
  // 언어별 플레이스홀더 정의
  const languagePlaceholders = {
    korean: {
      word: "사과",
      pronunciation: "sa-gwa",
      definition: "둥글고 빨간 과일",
      synonyms: "과일, 열매",
      collocations: "빨간 사과, 신선한 사과",
      compound_words: "사과나무, 사과주스",
      example: "나는 빨간 사과를 좋아한다.",
    },
    english: {
      word: "apple",
      pronunciation: "/ˈæpəl/",
      definition: "a round fruit with red or green skin",
      synonyms: "fruit, produce",
      collocations: "red apple, fresh apple",
      compound_words: "apple tree, apple juice",
      example: "I like red apples.",
    },
    japanese: {
      word: "りんご",
      pronunciation: "ringo",
      definition: "丸くて赤い果物",
      synonyms: "果物、フルーツ",
      collocations: "赤いりんご、新鮮なりんご",
      compound_words: "りんごの木、りんごジュース",
      example: "私は赤いりんごが好きです。",
    },
    chinese: {
      word: "苹果",
      pronunciation: "píngguǒ",
      definition: "圆形红色水果",
      synonyms: "水果、果实",
      collocations: "红苹果、新鲜苹果",
      compound_words: "苹果树、苹果汁",
      example: "我喜欢红苹果。",
    },
  };

  const placeholders = languagePlaceholders[langCode];
  if (!placeholders) return;

  // 언어별 플레이스홀더 업데이트 (추가 모달과 편집 모달 모두)
  const prefixes = ["", "edit-"];

  prefixes.forEach((prefix) => {
    // 단어 필드
    const wordField = document.getElementById(`${prefix}${langCode}-word`);
    if (wordField) wordField.placeholder = placeholders.word;

    // 발음 필드
    const pronunciationField = document.getElementById(
      `${prefix}${langCode}-pronunciation`
    );
    if (pronunciationField)
      pronunciationField.placeholder = placeholders.pronunciation;

    // 정의 필드
    const definitionField = document.getElementById(
      `${prefix}${langCode}-definition`
    );
    if (definitionField) definitionField.placeholder = placeholders.definition;

    // 유사어 필드
    const synonymsField = document.getElementById(
      `${prefix}${langCode}-synonyms`
    );
    if (synonymsField) synonymsField.placeholder = placeholders.synonyms;

    // 연어 필드
    const collocationsField = document.getElementById(
      `${prefix}${langCode}-collocations`
    );
    if (collocationsField)
      collocationsField.placeholder = placeholders.collocations;

    // 복합어 필드
    const compoundWordsField = document.getElementById(
      `${prefix}${langCode}-compound-words`
    );
    if (compoundWordsField)
      compoundWordsField.placeholder = placeholders.compound_words;
  });

  // 예문 필드들 업데이트
  document.querySelectorAll(`.${langCode}-example`).forEach((field) => {
    field.placeholder = placeholders.example;
  });
}

// 편집 모달에서 카테고리와 이모지 옵션 설정

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
  const purposeField = document.getElementById("edit-concept-purpose");

  // 상황 체크박스들 수집
  const situationCheckboxes = document.querySelectorAll(
    'input[name="edit-concept-situation"]:checked'
  );
  const situations = Array.from(situationCheckboxes).map((cb) => cb.value);

  const conceptInfo = {
    domain: domainField ? domainField.value.trim() : "",
    category: categoryField ? categoryField.value.trim() : "",
    difficulty: "basic", // 기본값 설정
    unicode_emoji: emojiField ? emojiField.value.trim() : "",
    color_theme: "#FF6B6B", // 기본 색상 테마
    situation: situations.length > 0 ? situations : ["casual"], // 기본값 설정
    purpose: purposeField ? purposeField.value.trim() : "description", // 기본값 설정
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
        part_of_speech: posField && posField.value ? posField.value : "",
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
        word_family:
          synonymsField && synonymsField.value.trim()
            ? synonymsField.value
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
        collocations:
          collocationsField && collocationsField.value.trim()
            ? collocationsField.value
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
  let representativeExample = {};

  document
    .querySelectorAll("#edit-examples-container .example-item")
    .forEach((item, index) => {
      const example = {};
      let hasContent = false;

      // 첫 번째 예문은 항상 대표 예문으로 처리 (UI에서 대표 예문으로 표시됨)
      const isRepresentative = index === 0;

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
          // 기존 구조 유지 - translations 속성 제거
          representativeExample = example;
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
    examples: examples.length > 0 ? examples : [],
    representative_example:
      Object.keys(representativeExample).length > 0
        ? representativeExample
        : null,
    // 기존 시스템과의 호환성을 위한 추가 필드들
    domain: conceptInfo.domain,
    category: conceptInfo.category,
    // updated_at은 Firebase에서 서버 타임스탬프로 처리
  };

  console.log("📋 편집 폼 최종 수집된 데이터:", result);
  return result;
}

// 편집 폼 리셋
export function resetEditForm() {
  // 폼 리셋 (안전한 null 체크)
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");
  const purposeField = document.getElementById("edit-concept-purpose");

  if (domainField) domainField.value = "";
  if (categoryField) categoryField.value = "";
  if (emojiField) emojiField.value = "";
  if (purposeField) purposeField.value = "";

  // 상황 체크박스들 초기화
  const situationCheckboxes = document.querySelectorAll(
    'input[name="edit-concept-situation"]'
  );
  situationCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

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
    if (posField) posField.value = "";

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

  // 전역 저장소 정리
  if (window.editConceptEmojiValue) {
    console.log(
      "🧹 편집 모달 닫기 시 전역 저장소 정리:",
      window.editConceptEmojiValue
    );
    delete window.editConceptEmojiValue;
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

  // 예제 레이블 (대표 예문 포함)
  const labelText = isRepresentative
    ? "대표 예문"
    : `예문 ${containerFound.children.length + 1}`;

  let exampleHTML = `
    <div class="flex justify-between items-center mb-3">
      <span class="font-medium text-gray-700">${labelText}</span>
      ${
        !isRepresentative
          ? `<button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest('.example-item').remove()">삭제</button>`
          : ""
      }
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  `;

  // 각 언어별 예문 입력 필드 (다국어 키 사용)
  Object.keys(supportedLangs).forEach((langCode) => {
    const langName = supportedLangs[langCode];
    const existingValue = existingExample?.[langCode] || "";

    // 플레이스홀더용 예문 설정 (실제 값으로 사용하지 않음)
    const placeholderExamples = {
      korean: "나는 빨간 사과를 좋아한다.",
      english: "I like red apples.",
      japanese: "私は赤いりんごが好きです。",
      chinese: "我喜欢红苹果。",
    };

    const defaultValue = existingValue || "";
    const i18nKey = `${langCode}_example`;

    exampleHTML += `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" data-i18n="${i18nKey}">${langName} 예문</label>
        <textarea
          class="${langCode}-example w-full p-2 border rounded-md resize-none"
          rows="2"
          placeholder="${
            placeholderExamples[langCode] || `${langName} 예문을 입력하세요`
          }">${defaultValue}</textarea>
      </div>
    `;
  });

  exampleHTML += "</div>";
  exampleItem.innerHTML = exampleHTML;
  containerFound.appendChild(exampleItem);
}
