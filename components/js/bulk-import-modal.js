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
          updated_at: new Date(),
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        learning_metadata: {
          created_from: "separated_import",
          import_date: new Date(),
          version: "3.0",
          structure_type: "separated_collections",
        },
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
        metadata: {
          created_from: "separated_import",
          import_date: new Date(),
          version: "3.0",
        },
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
        pattern_name: patternData.pattern_name || "기본 패턴",
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

      console.log("🔧 변환된 패턴 문서:", patternDoc);
      console.log("📖 explanation 값:", patternDoc.explanation);
      console.log("📚 example 값:", patternDoc.example);

      await collectionManager.createGrammarPattern(patternDoc);
      success++;
      console.log("✅ 패턴 업로드 성공:", patternDoc.pattern_name);
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

  downloadCSV(
    [headers, ...rows].map((row) => row.join(",")).join("\n"),
    "concepts_template.csv"
  );
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

  downloadCSV(
    [headers, ...rows].map((row) => row.join(",")).join("\n"),
    "examples_template.csv"
  );
}

function downloadGrammarJSONTemplate() {
  console.log("✅ 문법 템플릿 다운로드:", GRAMMAR_TEMPLATE.length, "개 패턴");
  downloadJSON(GRAMMAR_TEMPLATE, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
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

  const sampleData = [
    [
      "daily",
      "greeting",
      "기본 인사",
      "안녕하세요",
      "가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다.",
      "Basic Greeting",
      "Hello",
      "The most basic Korean greeting that can be used with anyone politely.",
      "基本的な挨拶",
      "こんにちは",
      "誰にでも丁寧に使える最も基本的な韓国語の挨拶です。",
      "基本问候",
      "您好",
      "最基本的韩语问候语，可以礼貌地对任何人使用。",
      "안녕하세요, 처음 뵙겠습니다.",
      "Hello, nice to meet you.",
      "こんにちは、初めまして。",
      "您好，初次见面。",
      "basic",
      "formal,social",
      "greeting",
    ],
  ];

  const csvContent = [headers, ...sampleData]
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "grammar_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    return {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.unicode_emoji || "",
        color_theme: row.color_theme || "#9C27B0",
        situation: row.situation || ["casual"],
        purpose: row.purpose || "description",
        updated_at: new Date(),
      },
      expressions: {
        korean: {
          word: row.korean_word || "",
          pronunciation: row.korean_pronunciation || "",
          definition: row.korean_definition || "",
          part_of_speech: row.korean_part_of_speech || "명사",
          level: row.korean_level || "beginner",
          synonyms: row.korean_synonyms
            ? row.korean_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
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
          part_of_speech: row.english_part_of_speech || "noun",
          level: row.english_level || "beginner",
          synonyms: row.english_synonyms
            ? row.english_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
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
          part_of_speech: row.chinese_part_of_speech || "名词",
          level: row.chinese_level || "beginner",
          synonyms: row.chinese_synonyms
            ? row.chinese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
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
          part_of_speech: row.japanese_part_of_speech || "名詞",
          level: row.japanese_level || "beginner",
          synonyms: row.japanese_synonyms
            ? row.japanese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
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
        row.example_korean && row.example_english
          ? {
              translations: {
                korean: row.example_korean,
                english: row.example_english,
                chinese: row.example_chinese || "",
                japanese: row.example_japanese || "",
              },
              context: row.example_context || "daily_conversation",
              difficulty: row.example_difficulty || "beginner",
            }
          : null,
    };
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
        korean: row.korean_text || "",
        english: row.english_text || "",
        japanese: row.japanese_text || "",
        chinese: row.chinese_text || "",
      },
    };
  } catch (error) {
    console.error("예문 CSV 파싱 오류:", error);
    return null;
  }
}

// 문법 패턴 CSV 파싱
function parseGrammarPatternFromCSV(row, headers) {
  const pattern = {};

  // 기본 속성들
  pattern.domain = row[headers.indexOf("domain")] || "daily";
  pattern.category = row[headers.indexOf("category")] || "general";
  pattern.difficulty = row[headers.indexOf("difficulty")] || "basic";
  pattern.purpose = row[headers.indexOf("purpose")] || "description";

  // situation 처리 (배열로 변환)
  const situationValue = row[headers.indexOf("situation")] || "casual";
  pattern.situation =
    typeof situationValue === "string"
      ? situationValue.split(",").map((s) => s.trim())
      : situationValue;

  // pattern 중첩 객체 구조
  pattern.pattern = {
    korean: {
      title: row[headers.indexOf("korean_title")] || "",
      structure: row[headers.indexOf("korean_structure")] || "",
      description: row[headers.indexOf("korean_description")] || "",
    },
    english: {
      title: row[headers.indexOf("english_title")] || "",
      structure: row[headers.indexOf("english_structure")] || "",
      description: row[headers.indexOf("english_description")] || "",
    },
    japanese: {
      title: row[headers.indexOf("japanese_title")] || "",
      structure: row[headers.indexOf("japanese_structure")] || "",
      description: row[headers.indexOf("japanese_description")] || "",
    },
    chinese: {
      title: row[headers.indexOf("chinese_title")] || "",
      structure: row[headers.indexOf("chinese_structure")] || "",
      description: row[headers.indexOf("chinese_description")] || "",
    },
  };

  // example 객체
  pattern.example = {
    korean: row[headers.indexOf("korean_example")] || "",
    english: row[headers.indexOf("english_example")] || "",
    japanese: row[headers.indexOf("japanese_example")] || "",
    chinese: row[headers.indexOf("chinese_example")] || "",
  };

  pattern.created_at = new Date().toISOString();

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
