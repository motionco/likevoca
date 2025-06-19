import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../../js/firebase/firebase-init.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
import { readFile } from "./csv-parser-utils.js";
import {
  EXAMPLES_TEMPLATE,
  CONCEPTS_TEMPLATE,
  GRAMMAR_TEMPLATE,
  examplesTemplateToCSV,
  conceptsTemplateToCSV,
  grammarTemplateToCSV,
} from "../../samples/templates.js";

// 전역 변수
let currentTab = "concepts";
let selectedFiles = {
  concepts: null,
  examples: null,
  grammar: null,
};

export function initialize() {
  console.log("분리된 대량 가져오기 모달 초기화");

  setupTabNavigation();
  setupEventListeners();
}

function setupTabNavigation() {
  const tabs = ["concepts", "examples", "grammar"];

  tabs.forEach((tabName) => {
    const tabButton = document.getElementById(`${tabName}-tab`);
    const tabContent = document.getElementById(`${tabName}-content`);

    if (tabButton) {
      tabButton.addEventListener("click", () => {
        // 모든 탭 비활성화
        tabs.forEach((t) => {
          document
            .getElementById(`${t}-tab`)
            ?.classList.remove("active", "text-blue-600", "border-blue-600");
          document.getElementById(`${t}-tab`)?.classList.add("text-gray-600");
          document.getElementById(`${t}-content`)?.classList.add("hidden");
        });

        // 선택된 탭 활성화
        tabButton.classList.remove("text-gray-600");
        tabButton.classList.add("active", "text-blue-600", "border-blue-600");
        tabContent?.classList.remove("hidden");

        currentTab = tabName;
      });
    }
  });
}

function setupEventListeners() {
  // 모달 닫기
  const closeBtn = document.getElementById("close-separated-modal");
  const cancelBtn = document.getElementById("cancel-separated-import");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // 각 탭별 이벤트 리스너 설정
  setupTabEventListeners("concepts");
  setupTabEventListeners("examples");
  setupTabEventListeners("grammar");
}

function setupTabEventListeners(tabName) {
  // 파일 선택 버튼
  const browseBtn = document.getElementById(`browse-${tabName}-file`);
  const fileInput = document.getElementById(`${tabName}-file-input`);
  const fileName = document.getElementById(`${tabName}-file-name`);
  const uploadBtn = document.getElementById(`upload-${tabName}`);
  const downloadBtn = document.getElementById(`download-${tabName}-template`);

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFiles[tabName] = file;
        fileName.textContent = `선택된 파일: ${file.name}`;
        uploadBtn.disabled = false;
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => uploadFile(tabName));
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => downloadTemplate(tabName));
  }
}

function closeModal() {
  const modal = document.getElementById("separated-import-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 초기화
    selectedFiles = { concepts: null, examples: null, grammar: null };
    ["concepts", "examples", "grammar"].forEach((tab) => {
      const fileName = document.getElementById(`${tab}-file-name`);
      const uploadBtn = document.getElementById(`upload-${tab}`);
      const progressDiv = document.getElementById(`${tab}-progress`);

      if (fileName) fileName.textContent = "";
      if (uploadBtn) uploadBtn.disabled = true;
      if (progressDiv) progressDiv.classList.add("hidden");
    });
  }
}

async function uploadFile(tabName) {
  const file = selectedFiles[tabName];
  if (!file) return;

  const formatSelect = document.getElementById(`${tabName}-format`);
  const format = formatSelect.value;
  const progressDiv = document.getElementById(`${tabName}-progress`);
  const progressBar = document.getElementById(`${tabName}-progress-bar`);
  const statusDiv = document.getElementById(`${tabName}-status`);

  try {
    progressDiv.classList.remove("hidden");
    statusDiv.textContent = "파일을 읽는 중...";
    progressBar.style.width = "20%";

    const fileContent = await readFile(file);
    let data;

    if (format === "json") {
      data = JSON.parse(fileContent);
    } else {
      data = parseCSV(fileContent, tabName);
    }

    statusDiv.textContent = "데이터를 처리하는 중...";
    progressBar.style.width = "50%";

    // 컬렉션별 업로드 처리
    let result;
    switch (tabName) {
      case "concepts":
        result = await uploadConcepts(data);
        break;
      case "examples":
        result = await uploadExamples(data);
        break;
      case "grammar":
        result = await uploadGrammarPatterns(data);
        break;
    }

    progressBar.style.width = "100%";
    statusDiv.textContent = `업로드 완료: ${result.success}개 성공, ${result.errors}개 실패`;

    setTimeout(() => {
      progressDiv.classList.add("hidden");
    }, 3000);
  } catch (error) {
    console.error(`${tabName} 업로드 오류:`, error);
    statusDiv.textContent = `오류 발생: ${error.message}`;
    progressBar.style.width = "0%";
  }
}

async function uploadConcepts(data) {
  const concepts = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const conceptData of concepts) {
    try {
      const conceptDoc = {
        concept_info: conceptData.concept_info || {
          domain: conceptData.domain || "general",
          category: conceptData.category || "uncategorized",
          difficulty: conceptData.difficulty || "beginner",
          unicode_emoji: conceptData.emoji || "📝",
          color_theme: conceptData.color_theme || "#9C27B0",
          situation: conceptData.situation || ["casual"],
          purpose: conceptData.purpose || "description",
          updated_at: new Date(),
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        created_at: serverTimestamp(),
      };

      await collectionManager.createConcept(conceptDoc);
      success++;
    } catch (error) {
      console.error("개념 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

async function uploadExamples(data) {
  const examples = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const exampleData of examples) {
    try {
      const exampleDoc = {
        example_id:
          exampleData.example_id ||
          `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain: exampleData.domain || "general",
        category: exampleData.category || "common",
        difficulty: exampleData.difficulty || "beginner",
        situation: Array.isArray(exampleData.situation)
          ? exampleData.situation
          : typeof exampleData.situation === "string"
          ? exampleData.situation.split(",").map((s) => s.trim())
          : [],
        purpose: exampleData.purpose || null,
        tags: exampleData.tags || [],
        translations: exampleData.translations || {},
      };

      await collectionManager.createExample(exampleDoc);
      success++;
    } catch (error) {
      console.error("예문 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

async function uploadGrammarPatterns(data) {
  console.log("🚀 [분리모달] 문법 패턴 업로드 시작");

  const patterns = Array.isArray(data) ? data : [data];
  console.log("📋 [분리모달] 처리할 패턴 개수:", patterns.length);

  let success = 0;
  let errors = 0;

  for (const patternData of patterns) {
    try {
      console.log("📝 [분리모달] 원본 패턴 데이터:", patternData);

      const patternDoc = {
        domain: patternData.domain || "daily",
        category: patternData.category || "general",
        pattern: patternData.pattern || patternData.structural_pattern || "",
        explanation: patternData.explanation || "",
        example: patternData.example || {},
        difficulty: patternData.difficulty || "basic",
        situation: Array.isArray(patternData.situation)
          ? patternData.situation
          : typeof patternData.situation === "string"
          ? patternData.situation.split(",").map((s) => s.trim())
          : ["casual"],
        purpose: patternData.purpose || "description",
        created_at: patternData.created_at || new Date().toISOString(),
      };

      console.log("🔧 [분리모달] 변환된 패턴 문서:", patternDoc);
      console.log("📖 [분리모달] explanation 값:", patternDoc.explanation);
      console.log("📚 [분리모달] example 값:", patternDoc.example);

      await collectionManager.createGrammarPattern(patternDoc);
      success++;
      console.log(
        "✅ [분리모달] 패턴 업로드 성공:",
        patternDoc.domain,
        patternDoc.category
      );
    } catch (error) {
      console.error("❌ [분리모달] 문법 패턴 업로드 오류:", error);
      console.error("❌ [분리모달] 실패한 데이터:", patternData);
      errors++;
    }
  }

  console.log("📊 [분리모달] 업로드 결과 - 성공:", success, "실패:", errors);
  return { success, errors };
}

function downloadTemplate(tabName) {
  switch (tabName) {
    case "concepts":
      downloadConceptsTemplate();
      break;
    case "examples":
      downloadExamplesTemplate();
      break;
    case "grammar":
      downloadGrammarTemplate();
      break;
  }
}

function downloadConceptsTemplate() {
  const formatSelect = document.getElementById("concepts-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadConceptsJSONTemplate();
  } else {
    downloadConceptsCSVTemplate();
  }
}

function downloadConceptsJSONTemplate() {
  console.log("✅ 개념 템플릿 다운로드:", CONCEPTS_TEMPLATE.length, "개 개념");
  downloadJSON(CONCEPTS_TEMPLATE, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  console.log("✅ 개념 CSV 템플릿 다운로드");

  const headers = [
    "domain",
    "category",
    "difficulty",
    "unicode_emoji",
    "color_theme",
    "tags",
    "korean_word",
    "korean_pronunciation",
    "korean_definition",
    "korean_part_of_speech",
    "korean_level",
    "korean_synonyms",
    "korean_word_family",
    "korean_compound_words",
    "korean_collocations",
    "english_word",
    "english_pronunciation",
    "english_definition",
    "english_part_of_speech",
    "english_level",
    "english_synonyms",
    "english_word_family",
    "english_compound_words",
    "english_collocations",
    "chinese_word",
    "chinese_pronunciation",
    "chinese_definition",
    "chinese_part_of_speech",
    "chinese_level",
    "chinese_synonyms",
    "chinese_word_family",
    "chinese_compound_words",
    "chinese_collocations",
    "japanese_word",
    "japanese_pronunciation",
    "japanese_definition",
    "japanese_part_of_speech",
    "japanese_level",
    "japanese_synonyms",
    "japanese_word_family",
    "japanese_compound_words",
    "japanese_collocations",
    "example_korean",
    "example_english",
    "example_chinese",
    "example_japanese",
    "example_context",
    "example_difficulty",
  ];

  const rows = CONCEPTS_TEMPLATE.map((concept) => [
    concept.concept_info.domain,
    concept.concept_info.category,
    concept.concept_info.difficulty,
    concept.concept_info.unicode_emoji,
    concept.concept_info.color_theme,
    concept.concept_info.tags.join(","),
    concept.expressions.korean.word,
    concept.expressions.korean.pronunciation,
    concept.expressions.korean.definition,
    concept.expressions.korean.part_of_speech,
    concept.expressions.korean.level,
    concept.expressions.korean.synonyms.join(","),
    concept.expressions.korean.word_family.join(","),
    concept.expressions.korean.compound_words.join(","),
    concept.expressions.korean.collocations.join(","),
    concept.expressions.english.word,
    concept.expressions.english.pronunciation,
    concept.expressions.english.definition,
    concept.expressions.english.part_of_speech,
    concept.expressions.english.level,
    concept.expressions.english.synonyms.join(","),
    concept.expressions.english.word_family.join(","),
    concept.expressions.english.compound_words.join(","),
    concept.expressions.english.collocations.join(","),
    concept.expressions.chinese.word,
    concept.expressions.chinese.pronunciation,
    concept.expressions.chinese.definition,
    concept.expressions.chinese.part_of_speech,
    concept.expressions.chinese.level,
    concept.expressions.chinese.synonyms.join(","),
    concept.expressions.chinese.word_family.join(","),
    concept.expressions.chinese.compound_words.join(","),
    concept.expressions.chinese.collocations.join(","),
    concept.expressions.japanese.word,
    concept.expressions.japanese.pronunciation,
    concept.expressions.japanese.definition,
    concept.expressions.japanese.part_of_speech,
    concept.expressions.japanese.level,
    concept.expressions.japanese.synonyms.join(","),
    concept.expressions.japanese.word_family.join(","),
    concept.expressions.japanese.compound_words.join(","),
    concept.expressions.japanese.collocations.join(","),
    concept.representative_example.translations.korean,
    concept.representative_example.translations.english,
    concept.representative_example.translations.chinese,
    concept.representative_example.translations.japanese,
    concept.representative_example.context,
    concept.representative_example.difficulty,
  ]);

  downloadCSV([headers, ...rows], "concepts_template.csv");
}

function downloadExamplesTemplate() {
  const formatSelect = document.getElementById("examples-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadExamplesJSONTemplate();
  } else {
    downloadExamplesCSVTemplate();
  }
}

function downloadExamplesJSONTemplate() {
  console.log("✅ 예문 템플릿 다운로드:", EXAMPLES_TEMPLATE.length, "개 예문");
  downloadJSON(EXAMPLES_TEMPLATE, "examples_template.json");
}

function downloadExamplesCSVTemplate() {
  console.log("✅ 예문 CSV 템플릿 다운로드");

  const headers = [
    "domain",
    "category",
    "difficulty",
    "situation",
    "purpose",
    "korean_text",
    "english_text",
    "japanese_text",
    "chinese_text",
  ];
  const rows = EXAMPLES_TEMPLATE.map((item) => [
    item.domain,
    item.category,
    item.difficulty,
    Array.isArray(item.situation) ? item.situation.join(",") : item.situation,
    item.purpose,
    item.translations.korean,
    item.translations.english,
    item.translations.japanese,
    item.translations.chinese,
  ]);

  downloadCSV([headers, ...rows], "examples_template.csv");
}

function downloadGrammarTemplate() {
  const formatSelect = document.getElementById("grammar-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadGrammarJSONTemplate();
  } else {
    downloadGrammarCSVTemplate();
  }
}

function downloadGrammarJSONTemplate() {
  console.log("✅ 문법 템플릿 다운로드:", GRAMMAR_TEMPLATE.length, "개 패턴");
  downloadJSON(GRAMMAR_TEMPLATE, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
  console.log("✅ 문법 CSV 템플릿 다운로드");

  const headers = [
    "domain",
    "category",
    "korean_title",
    "korean_structure",
    "korean_description",
    "english_title",
    "english_structure",
    "english_description",
    "japanese_title",
    "japanese_structure",
    "japanese_description",
    "chinese_title",
    "chinese_structure",
    "chinese_description",
    "korean_example",
    "english_example",
    "japanese_example",
    "chinese_example",
    "difficulty",
    "situation",
    "purpose",
  ];

  const rows = GRAMMAR_TEMPLATE.map((grammar) => [
    grammar.domain,
    grammar.category,
    typeof grammar.pattern === "object"
      ? grammar.pattern.korean?.title || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.korean?.structure || ""
      : grammar.pattern || grammar.structural_pattern || "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.korean?.description || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.english?.title || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.english?.structure || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.english?.description || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.japanese?.title || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.japanese?.structure || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.japanese?.description || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.chinese?.title || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.chinese?.structure || ""
      : "",
    typeof grammar.pattern === "object"
      ? grammar.pattern.chinese?.description || ""
      : "",
    grammar.example.korean,
    grammar.example.english,
    grammar.example.japanese,
    grammar.example.chinese,
    grammar.difficulty,
    Array.isArray(grammar.situation)
      ? grammar.situation.join(",")
      : grammar.situation || "casual",
    grammar.purpose || "description",
  ]);

  downloadCSV([headers, ...rows], "grammar_template.csv");
}

// 유틸리티 함수들 (readFile은 csv-parser-utils.js에서 import)
function parseCSV(content, tabName) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(",").map((v) => v.trim());
      const item = {};

      headers.forEach((header, index) => {
        item[header] = values[index] || "";
      });

      // 탭별 특수 처리
      if (tabName === "concepts") {
        data.push(convertCSVToConcept(item));
      } else if (tabName === "examples") {
        data.push(convertCSVToExample(item));
      } else if (tabName === "grammar") {
        data.push(convertCSVToGrammar(item));
      }
    }
  }

  return data;
}

function convertCSVToConcept(item) {
  return {
    concept_info: {
      domain: item.domain || "general",
      category: item.category || "uncategorized",
      difficulty: item.difficulty || "beginner",
      unicode_emoji: item.emoji || "📝",
      tags: item.tags ? item.tags.split("|") : [],
    },
    expressions: {
      korean: {
        word: item.korean_word || "",
        pronunciation: item.korean_pronunciation || "",
        definition: item.korean_definition || "",
        part_of_speech: item.korean_part_of_speech || "noun",
      },
      english: {
        word: item.english_word || "",
        pronunciation: item.english_pronunciation || "",
        definition: item.english_definition || "",
        part_of_speech: item.english_part_of_speech || "noun",
      },
    },
    representative_example:
      item.representative_example_korean || item.representative_example_english
        ? {
            example_id: `${item.korean_word || "concept"}_rep_example`,
            context: "general",
            difficulty: item.difficulty || "beginner",
            translations: {
              korean: { text: item.representative_example_korean || "" },
              english: { text: item.representative_example_english || "" },
            },
          }
        : null,
  };
}

function convertCSVToExample(item) {
  return {
    domain: item.domain || "general",
    category: item.category || "common",
    difficulty: item.difficulty || "basic",
    situation:
      item.situation && item.situation.trim()
        ? item.situation.split(",").map((s) => s.trim())
        : null,
    purpose: item.purpose || null,
    translations: {
      korean: item.korean_text || "",
      english: item.english_text || "",
      japanese: item.japanese_text || "",
      chinese: item.chinese_text || "",
    },
  };
}

function convertCSVToGrammar(item) {
  console.log("🔍 [분리모달] CSV 변환 시작, 원본 item:", item);

  // 단일 예문 객체 생성
  const example = {
    korean: item.korean_example || "",
    english: item.english_example || "",
    japanese: item.japanese_example || "",
    chinese: item.chinese_example || "",
  };

  // 중첩 패턴 객체 생성 (새로운 구조)
  let pattern;
  if (item.korean_title || item.korean_structure || item.korean_description) {
    pattern = {
      korean: {
        title: item.korean_title || "",
        structure: item.korean_structure || "",
        description: item.korean_description || "",
      },
      english: {
        title: item.english_title || "",
        structure: item.english_structure || "",
        description: item.english_description || "",
      },
      japanese: {
        title: item.japanese_title || "",
        structure: item.japanese_structure || "",
        description: item.japanese_description || "",
      },
      chinese: {
        title: item.chinese_title || "",
        structure: item.chinese_structure || "",
        description: item.chinese_description || "",
      },
    };
  } else {
    // 기존 구조 지원 (하위 호환성)
    pattern = item.pattern || item.structural_pattern || "";
  }

  console.log("📝 [분리모달] 예문 생성:", example);
  console.log("🔧 [분리모달] 패턴 생성:", pattern);

  const result = {
    domain: item.domain || "daily",
    category: item.category || "general",
    pattern: pattern,
    example: example,
    difficulty: item.difficulty || "basic",
    situation: item.situation
      ? item.situation.split(",").map((s) => s.trim())
      : ["casual"],
    purpose: item.purpose || "description",
    created_at: item.created_at || new Date().toISOString(),
  };

  console.log("🔧 [분리모달] 변환 결과:", result);

  return result;
}

function downloadJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(data, filename) {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 전역 함수로 내보내기
window.openSeparatedImportModal = function () {
  const modal = document.getElementById("separated-import-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // 첫 번째 탭 활성화
    document.getElementById("concepts-tab")?.click();
  }
};
