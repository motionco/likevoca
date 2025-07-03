import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../../js/firebase/firebase-init.js";
import {
  GRAMMAR_TAGS,
  validateGrammarTags,
  getGrammarTagHeaders,
  grammarTagsFromCSV,
  grammarTagsToCSV,
} from "../../js/grammar-tags-system.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
import { readFile } from "./csv-parser-utils.js";
import {
  EXAMPLES_TEMPLATE,
  CONCEPTS_TEMPLATE,
  GRAMMAR_TEMPLATE,
  EXAMPLES_TEMPLATE_CSV,
  CONCEPTS_TEMPLATE_CSV,
  GRAMMAR_TEMPLATE_CSV,
  examplesTemplateToCSV,
  conceptsTemplateToCSV,
  grammarTemplateToCSV,
} from "../../samples/templates.js";

// 전역 변수
let currentTab = "concepts";

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
          const btn = document.getElementById(`${t}-tab`);
          const content = document.getElementById(`${t}-content`);
          if (btn && content) {
            btn.classList.remove("text-blue-600", "border-blue-600");
            btn.classList.add("text-gray-600");
            content.classList.add("hidden");
          }
        });

        // 선택된 탭 활성화
        tabButton.classList.remove("text-gray-600");
        tabButton.classList.add("text-blue-600", "border-blue-600");
        if (tabContent) {
          tabContent.classList.remove("hidden");
        }

        currentTab = tabName;
        console.log(`탭 변경: ${tabName}`);
      });
    }
  });
}

function setupEventListeners() {
  // 모달 닫기
  const closeBtn = document.getElementById("close-bulk-modal");
  const cancelBtn = document.getElementById("cancel-import");

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
  const uploadBtn = document.getElementById(`start-${tabName}-import`);
  const downloadBtn = document.getElementById(`download-${tabName}-template`);

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        fileName.textContent = `선택된 파일: ${file.name}`;
        uploadBtn.disabled = false;
        uploadBtn.classList.remove("bg-gray-400");

        // 탭별 색상 적용
        if (tabName === "concepts") {
          uploadBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
        } else if (tabName === "examples") {
          uploadBtn.classList.add("bg-green-500", "hover:bg-green-600");
        } else if (tabName === "grammar") {
          uploadBtn.classList.add("bg-purple-500", "hover:bg-purple-600");
        }
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
  const modal = document.getElementById("bulk-import-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 각 탭 초기화
    ["concepts", "examples", "grammar"].forEach((tab) => {
      const fileName = document.getElementById(`${tab}-file-name`);
      const fileInput = document.getElementById(`${tab}-file-input`);
      const uploadBtn = document.getElementById(`start-${tab}-import`);
      const progressDiv = document.getElementById(`${tab}-import-status`);

      // 파일 입력 초기화
      if (fileInput) {
        fileInput.value = "";
      }

      if (fileName) {
        fileName.textContent = `${
          tab === "concepts"
            ? "개념"
            : tab === "examples"
            ? "예문"
            : "문법 패턴"
        } 파일을 선택하세요.`;
      }

      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.classList.add("bg-gray-400");
        uploadBtn.classList.remove(
          "bg-blue-500",
          "hover:bg-blue-600",
          "bg-green-500",
          "hover:bg-green-600",
          "bg-purple-500",
          "hover:bg-purple-600"
        );
      }

      if (progressDiv) {
        progressDiv.classList.add("hidden");
      }
    });
  }
}

async function uploadFile(tabName) {
  const fileInput = document.getElementById(`${tabName}-file-input`);
  const formatSelect = document.getElementById(`${tabName}-import-mode`);
  const progressBar = document.getElementById(`${tabName}-import-progress`);
  const statusDiv = document.getElementById(`${tabName}-import-result`);
  const statusContainer = document.getElementById(`${tabName}-import-status`);

  if (!fileInput.files.length) {
    statusDiv.innerHTML = '<p class="text-red-500">파일을 선택해주세요.</p>';
    return;
  }

  const file = fileInput.files[0];
  const format = formatSelect.value;

  console.log(`🚀 ${tabName} 파일 업로드 시작:`, {
    fileName: file.name,
    fileSize: file.size,
    format: format,
  });

  try {
    // 상태 컨테이너 표시
    statusContainer.classList.remove("hidden");

    progressBar.style.width = "25%";
    statusDiv.innerHTML = '<p class="text-blue-500">파일을 읽는 중...</p>';

    const content = await readFileContent(file);
    console.log(`📄 파일 내용 읽기 완료, 길이: ${content.length}`);
    console.log(`📄 파일 내용 미리보기 (첫 500자):`, content.substring(0, 500));

    progressBar.style.width = "50%";
    statusDiv.innerHTML =
      '<p class="text-blue-500">데이터를 파싱하는 중...</p>';

    let data;
    if (format === "json") {
      console.log("🔧 JSON 파싱 시작");
      data = JSON.parse(content);
      console.log("✅ JSON 파싱 완료, 데이터:", data);
    } else {
      console.log("🔧 CSV 파싱 시작");
      data = parseCSV(content, tabName);
      console.log("✅ CSV 파싱 완료, 데이터:", data);
    }

    progressBar.style.width = "75%";
    statusDiv.innerHTML =
      '<p class="text-blue-500">데이터를 업로드하는 중...</p>';

    let result;
    switch (tabName) {
      case "concepts":
        console.log("📝 개념 업로드 시작");
        result = await uploadConcepts(data);
        break;
      case "examples":
        console.log("📝 예문 업로드 시작");
        result = await uploadExamples(data);
        break;
      case "grammar":
        console.log("📝 문법 패턴 업로드 시작");
        result = await uploadGrammarPatterns(data);
        break;
    }

    progressBar.style.width = "100%";
    statusDiv.innerHTML = `<p class="text-green-500">업로드 완료! 성공: ${result.success}, 실패: ${result.errors}</p>`;

    console.log(`✅ ${tabName} 업로드 완료:`, result);

    // 3초 후 상태 숨기기
    setTimeout(() => {
      statusContainer.classList.add("hidden");
      progressBar.style.width = "0%";
    }, 3000);
  } catch (error) {
    console.error(`❌ ${tabName} 업로드 오류:`, error);
    statusDiv.innerHTML = `<p class="text-red-500">오류: ${error.message}</p>`;
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
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        randomField: Math.random(), // 🎲 효율적인 랜덤 쿼리를 위한 필드
        created_at: serverTimestamp(),
      };

      await collectionManager.createConcept(conceptDoc);
      success++;
    } catch (error) {
      console.error("개념 업로드 오류:", error);
      errors++;
    }
  }

  // 개념 추가 완료 이벤트 발생
  if (success > 0) {
    window.dispatchEvent(new CustomEvent("concepts-bulk-saved"));
    console.log("📦 대량 개념 추가 완료 이벤트 발생");
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
        domain: exampleData.domain || "general",
        category: exampleData.category || "common",
        difficulty: exampleData.difficulty || "beginner",
        situation: Array.isArray(exampleData.situation)
          ? exampleData.situation
          : typeof exampleData.situation === "string"
          ? exampleData.situation.split(",").map((s) => s.trim())
          : ["casual"],
        purpose: exampleData.purpose || null,
        translations: exampleData.translations || {},
        randomField: Math.random(), // 🎲 효율적인 랜덤 쿼리를 위한 필드
        created_at: serverTimestamp(),
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
  console.log("🔥 uploadGrammarPatterns 시작, 받은 데이터:", data);

  const patterns = Array.isArray(data) ? data : [data];
  console.log("📋 처리할 패턴 개수:", patterns.length);

  let success = 0;
  let errors = 0;

  for (const patternData of patterns) {
    try {
      console.log("📝 원본 패턴 데이터:", patternData);

      const patternDoc = {
        domain: patternData.domain || "daily",
        category: patternData.category || "general",
        difficulty: patternData.difficulty || "basic",
        situation: Array.isArray(patternData.situation)
          ? patternData.situation
          : typeof patternData.situation === "string"
          ? patternData.situation.split(",").map((s) => s.trim())
          : ["casual"],
        purpose: patternData.purpose || "description",
        pattern: patternData.pattern || {},
        example: patternData.example || {},
        randomField: Math.random(), // 🎲 효율적인 랜덤 쿼리를 위한 필드
        created_at: patternData.created_at || new Date().toISOString(),
      };

      console.log("🔧 변환된 패턴 문서:", patternDoc);

      await collectionManager.createGrammarPattern(patternDoc);
      success++;
      console.log("✅ 패턴 업로드 성공");
    } catch (error) {
      console.error("❌ 문법 패턴 업로드 오류:", error);
      console.error("❌ 실패한 데이터:", patternData);
      errors++;
    }
  }

  console.log("📊 업로드 결과 - 성공:", success, "실패:", errors);
  return { success, errors };
}

function downloadTemplate(tabName) {
  const formatSelect = document.getElementById(`${tabName}-import-mode`);
  const format = formatSelect.value;

  switch (tabName) {
    case "concepts":
      if (format === "json") {
        downloadConceptsJSONTemplate();
      } else {
        downloadConceptsCSVTemplate();
      }
      break;
    case "examples":
      if (format === "json") {
        downloadExamplesJSONTemplate();
      } else {
        downloadExamplesCSVTemplate();
      }
      break;
    case "grammar":
      if (format === "json") {
        downloadGrammarJSONTemplate();
      } else {
        downloadGrammarCSVTemplate();
      }
      break;
  }
}

function downloadConceptsJSONTemplate() {
  console.log("✅ 개념 템플릿 다운로드:", CONCEPTS_TEMPLATE.length, "개 개념");
  downloadJSON(CONCEPTS_TEMPLATE, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  console.log("✅ 개념 CSV 템플릿 다운로드");
  downloadCSV(CONCEPTS_TEMPLATE_CSV, "concepts_template.csv");
}

function downloadExamplesJSONTemplate() {
  console.log("✅ 예문 템플릿 다운로드:", EXAMPLES_TEMPLATE.length, "개 예문");
  downloadJSON(EXAMPLES_TEMPLATE, "examples_template.json");
}

function downloadExamplesCSVTemplate() {
  console.log("✅ 예문 CSV 템플릿 다운로드");
  downloadCSV(EXAMPLES_TEMPLATE_CSV, "examples_template.csv");
}

function downloadGrammarJSONTemplate() {
  console.log("✅ 문법 템플릿 다운로드:", GRAMMAR_TEMPLATE.length, "개 패턴");
  downloadJSON(GRAMMAR_TEMPLATE, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
  console.log("✅ 문법 CSV 템플릿 다운로드");
  downloadCSV(GRAMMAR_TEMPLATE_CSV, "grammar_template.csv");
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV 파싱 함수
function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV 파일에 데이터가 없습니다.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // 컬렉션 타입에 따라 적절한 형식으로 변환
      let parsedData;
      switch (tabName) {
        case "concepts":
          parsedData = parseConceptFromCSV(row);
          break;
        case "examples":
          parsedData = parseExampleFromCSV(row);
          break;
        case "grammar":
          parsedData = parseGrammarPatternFromCSV(row, headers);
          break;
        default:
          parsedData = row;
      }

      if (parsedData) {
        data.push(parsedData);
      }
    }
  }

  return data;
}

// CSV 라인 파싱 (쉼표로 분리하되 따옴표 내부는 무시)
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim().replace(/^"|"$/g, ""));
  return values;
}

// 개념 CSV 파싱
function parseConceptFromCSV(row) {
  try {
    console.log("🔍 [parseConceptFromCSV] 파싱 시작 - row:", row);

    const conceptData = {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.emoji || row.unicode_emoji || "",
        color_theme: row.color || row.color_theme || "#9C27B0",
        situation: row.situation
          ? typeof row.situation === "string"
            ? row.situation.split(",").map((s) => s.trim())
            : row.situation
          : ["casual"],
        purpose: row.purpose || "description",
      },
      expressions: {
        korean: {
          word: row.korean_word || "",
          pronunciation: row.korean_pronunciation || "",
          definition: row.korean_definition || "",
          part_of_speech: row.korean_part_of_speech || row.korean_pos || "명사",
          synonyms: row.korean_synonyms
            ? row.korean_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: row.korean_antonyms
            ? row.korean_antonyms.split(",").map((s) => s.trim())
            : [],
          word_family: row.korean_word_family
            ? row.korean_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.korean_compound_words
            ? row.korean_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.korean_collocations
            ? row.korean_collocations.split(",").map((c) => c.trim())
            : [],
        },
        english: {
          word: row.english_word || "",
          pronunciation: row.english_pronunciation || "",
          definition: row.english_definition || "",
          part_of_speech:
            row.english_part_of_speech || row.english_pos || "noun",
          synonyms: row.english_synonyms
            ? row.english_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: row.english_antonyms
            ? row.english_antonyms.split(",").map((s) => s.trim())
            : [],
          word_family: row.english_word_family
            ? row.english_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.english_compound_words
            ? row.english_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.english_collocations
            ? row.english_collocations.split(",").map((c) => c.trim())
            : [],
        },
        chinese: {
          word: row.chinese_word || "",
          pronunciation: row.chinese_pronunciation || "",
          definition: row.chinese_definition || "",
          part_of_speech:
            row.chinese_part_of_speech || row.chinese_pos || "名词",
          synonyms: row.chinese_synonyms
            ? row.chinese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: row.chinese_antonyms
            ? row.chinese_antonyms.split(",").map((s) => s.trim())
            : [],
          word_family: row.chinese_word_family
            ? row.chinese_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.chinese_compound_words
            ? row.chinese_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.chinese_collocations
            ? row.chinese_collocations.split(",").map((c) => c.trim())
            : [],
        },
        japanese: {
          word: row.japanese_word || "",
          pronunciation: row.japanese_pronunciation || "",
          definition: row.japanese_definition || "",
          part_of_speech:
            row.japanese_part_of_speech || row.japanese_pos || "名詞",
          synonyms: row.japanese_synonyms
            ? row.japanese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: row.japanese_antonyms
            ? row.japanese_antonyms.split(",").map((s) => s.trim())
            : [],
          word_family: row.japanese_word_family
            ? row.japanese_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.japanese_compound_words
            ? row.japanese_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.japanese_collocations
            ? row.japanese_collocations.split(",").map((c) => c.trim())
            : [],
        },
      },
      representative_example:
        (row.korean_example || row.representative_korean) &&
        (row.english_example || row.representative_english)
          ? {
              korean: row.korean_example || row.representative_korean || "",
              english: row.english_example || row.representative_english || "",
              chinese: row.chinese_example || row.representative_chinese || "",
              japanese:
                row.japanese_example || row.representative_japanese || "",
            }
          : null,
    };

    console.log(
      "✅ [parseConceptFromCSV] 파싱 완료 - 이모지:",
      conceptData.concept_info.unicode_emoji,
      "대표 예문:",
      conceptData.representative_example
    );

    return conceptData;
  } catch (error) {
    console.error("개념 CSV 파싱 오류:", error);
    return null;
  }
}

// 예문 CSV 파싱
function parseExampleFromCSV(row) {
  try {
    return {
      domain: row.domain || "general",
      category: row.category || "common",
      difficulty: row.difficulty || "basic",
      situation: row.situation
        ? row.situation.split(",").map((s) => s.trim())
        : ["casual"],
      purpose: row.purpose || null,
      translations: {
        korean: row.korean || "",
        english: row.english || "",
        japanese: row.japanese || "",
        chinese: row.chinese || "",
      },
    };
  } catch (error) {
    console.error("예문 CSV 파싱 오류:", error);
    return null;
  }
}

// 문법 패턴 CSV 파싱
function parseGrammarPatternFromCSV(row, headers) {
  console.log("🔍 [parseGrammarPatternFromCSV] 시작 - row:", row);
  console.log("🔍 [parseGrammarPatternFromCSV] headers:", headers);

  const pattern = {};

  // 기본 속성들 - row 객체에서 직접 접근
  pattern.domain = row.domain || "daily";
  pattern.category = row.category || "general";
  pattern.difficulty = row.difficulty || "basic";
  pattern.purpose = row.purpose || "description";

  console.log("📝 [parseGrammarPatternFromCSV] 기본 속성들:", {
    domain: pattern.domain,
    category: pattern.category,
    difficulty: pattern.difficulty,
    purpose: pattern.purpose,
  });

  // situation 처리 (배열로 변환)
  const situationValue = row.situation || "casual";
  pattern.situation =
    typeof situationValue === "string"
      ? situationValue.split(",").map((s) => s.trim())
      : situationValue;

  console.log("📝 [parseGrammarPatternFromCSV] situation:", pattern.situation);

  // pattern 중첩 객체 구조 - 빈 값이 아닌 경우에만 저장
  pattern.pattern = {
    korean: {},
    english: {},
    japanese: {},
    chinese: {},
  };

  // Korean pattern - row 객체에서 직접 접근
  const koreanTitle = row.korean_title || "";
  const koreanStructure = row.korean_structure || "";
  const koreanDescription = row.korean_description || "";

  console.log("🔍 [parseGrammarPatternFromCSV] Korean 원본 값들:", {
    koreanTitle,
    koreanStructure,
    koreanDescription,
  });

  if (koreanTitle) pattern.pattern.korean.title = koreanTitle;
  if (koreanStructure) pattern.pattern.korean.structure = koreanStructure;
  if (koreanDescription) pattern.pattern.korean.description = koreanDescription;

  // English pattern - row 객체에서 직접 접근
  const englishTitle = row.english_title || "";
  const englishStructure = row.english_structure || "";
  const englishDescription = row.english_description || "";

  console.log("🔍 [parseGrammarPatternFromCSV] English 원본 값들:", {
    englishTitle,
    englishStructure,
    englishDescription,
  });

  if (englishTitle) pattern.pattern.english.title = englishTitle;
  if (englishStructure) pattern.pattern.english.structure = englishStructure;
  if (englishDescription)
    pattern.pattern.english.description = englishDescription;

  // Japanese pattern - row 객체에서 직접 접근
  const japaneseTitle = row.japanese_title || "";
  const japaneseStructure = row.japanese_structure || "";
  const japaneseDescription = row.japanese_description || "";

  console.log("🔍 [parseGrammarPatternFromCSV] Japanese 원본 값들:", {
    japaneseTitle,
    japaneseStructure,
    japaneseDescription,
  });

  if (japaneseTitle) pattern.pattern.japanese.title = japaneseTitle;
  if (japaneseStructure) pattern.pattern.japanese.structure = japaneseStructure;
  if (japaneseDescription)
    pattern.pattern.japanese.description = japaneseDescription;

  // Chinese pattern - row 객체에서 직접 접근
  const chineseTitle = row.chinese_title || "";
  const chineseStructure = row.chinese_structure || "";
  const chineseDescription = row.chinese_description || "";

  console.log("🔍 [parseGrammarPatternFromCSV] Chinese 원본 값들:", {
    chineseTitle,
    chineseStructure,
    chineseDescription,
  });

  if (chineseTitle) pattern.pattern.chinese.title = chineseTitle;
  if (chineseStructure) pattern.pattern.chinese.structure = chineseStructure;
  if (chineseDescription)
    pattern.pattern.chinese.description = chineseDescription;

  console.log(
    "🔧 [parseGrammarPatternFromCSV] 완성된 pattern 객체:",
    pattern.pattern
  );

  // example 객체 - row 객체에서 직접 접근
  pattern.example = {};

  const koreanExample = row.korean_example || "";
  const englishExample = row.english_example || "";
  const japaneseExample = row.japanese_example || "";
  const chineseExample = row.chinese_example || "";

  console.log("🔍 [parseGrammarPatternFromCSV] Example 원본 값들:", {
    koreanExample,
    englishExample,
    japaneseExample,
    chineseExample,
  });

  if (koreanExample) pattern.example.korean = koreanExample;
  if (englishExample) pattern.example.english = englishExample;
  if (japaneseExample) pattern.example.japanese = japaneseExample;
  if (chineseExample) pattern.example.chinese = chineseExample;

  console.log(
    "🔧 [parseGrammarPatternFromCSV] 완성된 example 객체:",
    pattern.example
  );

  // created_at만 추가 (updated_at 제거)
  pattern.created_at = new Date().toISOString();

  console.log("✅ [parseGrammarPatternFromCSV] 최종 결과:", pattern);
  return pattern;
}

// 파일 내용 읽기 함수
async function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// 가져오기 설정 토글 함수
function toggleImportSettings(importMode) {
  console.log("가져오기 모드 변경:", importMode);
  // 필요에 따라 UI 조정 로직 추가
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openBulkImportModal = function () {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  const importMode = document.getElementById("import-mode");
  if (importMode) {
    toggleImportSettings(importMode.value);
  }
};

// CSV 파싱 시 문법 태그 처리
function parseCSVRowForTags(row, headers) {
  const concept = {};

  // ... existing parsing logic ...

  // 문법 태그 처리
  const grammarTagsHeaders = getGrammarTagHeaders();
  grammarTagsHeaders.forEach((header) => {
    const index = headers.indexOf(header);
    if (index !== -1 && row[index]) {
      const language = header.replace("_grammar_tags", "");
      const tags = grammarTagsFromCSV(row[index]);

      // 문법 태그 유효성 검사
      if (tags.length > 0) {
        const pos = tags.find((tag) => !tag.includes(":"));
        const features = tags.filter((tag) => tag.includes(":"));

        const validation = validateGrammarTags(language, pos, features);
        if (!validation.valid) {
          console.warn(
            `문법 태그 유효성 검사 실패 (${language}): ${validation.error}`
          );
        }

        // 개념에 문법 태그 추가
        if (!concept.expressions) concept.expressions = {};
        if (!concept.expressions[language]) concept.expressions[language] = {};
        concept.expressions[language].grammar_tags = tags;
      }
    }
  });

  return concept;
}
