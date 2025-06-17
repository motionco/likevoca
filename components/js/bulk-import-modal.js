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
          tags: conceptData.tags || [],
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
        context: exampleData.context || "general",
        difficulty: exampleData.difficulty || "beginner",
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
        structural_pattern: patternData.structural_pattern || "",
        explanation: patternData.explanation || "",
        example: patternData.example || {},
        difficulty: patternData.difficulty || "basic",
        tags: patternData.tags || [],
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
  const template = [
    {
      concept_info: {
        domain: "daily",
        category: "fruit",
        difficulty: "beginner",
        unicode_emoji: "🍎",
        color_theme: "#FF6B6B",
        tags: ["food", "healthy", "common"],
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sa-gwa",
          definition: "둥글고 빨간 과일",
          part_of_speech: "명사",
          level: "beginner",
          synonyms: ["능금"],
          antonyms: [],
          word_family: ["과일", "음식"],
          compound_words: ["사과나무", "사과즙"],
          collocations: ["빨간 사과", "맛있는 사과"],
        },
        english: {
          word: "apple",
          pronunciation: "/ˈæpəl/",
          definition: "a round fruit with red or green skin",
          part_of_speech: "noun",
          level: "beginner",
          synonyms: [],
          antonyms: [],
          word_family: ["fruit", "food"],
          compound_words: ["apple tree", "apple juice"],
          collocations: ["red apple", "fresh apple"],
        },
        chinese: {
          word: "苹果",
          pronunciation: "píng guǒ",
          definition: "圆形的红色或绿色水果",
          part_of_speech: "名词",
          level: "beginner",
          synonyms: ["苹子"],
          antonyms: [],
          word_family: ["水果", "食物"],
          compound_words: ["苹果树", "苹果汁"],
          collocations: ["红苹果", "新鲜苹果"],
        },
        japanese: {
          word: "りんご",
          pronunciation: "ringo",
          definition: "赤いまたは緑色の丸い果物",
          part_of_speech: "名詞",
          level: "beginner",
          synonyms: ["アップル"],
          antonyms: [],
          word_family: ["果物", "食べ物"],
          compound_words: ["りんごの木", "りんごジュース"],
          collocations: ["赤いりんご", "新鮮なりんご"],
        },
      },
      representative_example: {
        translations: {
          korean: "나는 빨간 사과를 좋아한다.",
          english: "I like red apples.",
          chinese: "我喜欢红苹果。",
          japanese: "私は赤いりんごが好きです。",
        },
        context: "daily_conversation",
        difficulty: "beginner",
      },
    },
  ];

  downloadJSON(template, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  const csvContent = `domain,category,difficulty,unicode_emoji,color_theme,tags,korean_word,korean_pronunciation,korean_definition,korean_part_of_speech,korean_level,korean_synonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_part_of_speech,english_level,english_synonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_part_of_speech,chinese_level,chinese_synonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_part_of_speech,japanese_level,japanese_synonyms,japanese_word_family,japanese_compound_words,japanese_collocations,example_korean,example_english,example_chinese,example_japanese,example_context,example_difficulty
daily,fruit,beginner,🍎,#FF6B6B,"food,healthy,common",사과,sa-gwa,둥글고 빨간 과일,명사,beginner,능금,"과일,음식","사과나무,사과즙","빨간 사과,맛있는 사과",apple,/ˈæpəl/,a round fruit with red or green skin,noun,beginner,,"fruit,food","apple tree,apple juice","red apple,fresh apple",苹果,píng guǒ,圆形的红色或绿色水果,名词,beginner,苹子,"水果,食物","苹果树,苹果汁","红苹果,新鲜苹果",りんご,ringo,赤いまたは緑色の丸い果物,名詞,beginner,アップル,"果物,食べ物","りんごの木,りんごジュース","赤いりんご,新鮮なりんご",나는 빨간 사과를 좋아한다.,I like red apples.,我喜欢红苹果。,私は赤いりんごが好きです。,daily_conversation,beginner`;

  downloadCSV(csvContent, "concepts_template.csv");
}

function downloadExamplesJSONTemplate() {
  const template = [
    {
      example_id: "example_001",
      domain: "daily",
      category: "routine",
      context: "daily_conversation",
      difficulty: "beginner",
      tags: ["greeting", "polite", "formal"],
      translations: {
        korean: {
          text: "안녕하세요! 처음 뵙겠습니다.",
          romanization: "annyeonghaseyo! cheoeum boepgetseumnida",
        },
        english: {
          text: "Hello! Nice to meet you for the first time.",
          phonetic: "/həˈloʊ naɪs tu mit ju fɔr ðə fɜrst taɪm/",
        },
        japanese: {
          text: "こんにちは！初めてお会いします。",
          romanization: "konnichiwa! hajimete oai shimasu",
        },
        chinese: {
          text: "你好！初次见面。",
          pinyin: "nǐ hǎo! chū cì jiàn miàn",
        },
      },
    },
    {
      example_id: "example_002",
      domain: "food",
      category: "fruit",
      context: "restaurant",
      difficulty: "beginner",
      tags: ["food", "ordering", "restaurant"],
      translations: {
        korean: {
          text: "사과 주스 하나 주세요.",
          romanization: "sagwa juseu hana juseyo",
        },
        english: {
          text: "Please give me one apple juice.",
          phonetic: "/pliːz ɡɪv mi wʌn ˈæpəl ʤus/",
        },
        japanese: {
          text: "りんごジュースを一つください。",
          romanization: "ringo juusu wo hitotsu kudasai",
        },
        chinese: {
          text: "请给我一杯苹果汁。",
          pinyin: "qǐng gěi wǒ yī bēi píng guǒ zhī",
        },
      },
    },
  ];

  downloadJSON(template, "examples_template.json");
}

function downloadExamplesCSVTemplate() {
  const csvContent = `example_id,domain,category,context,difficulty,tags,korean,english,japanese,chinese
example_001,daily,routine,daily_conversation,beginner,"greeting,polite,formal",안녕하세요! 처음 뵙겠습니다.,Hello! Nice to meet you for the first time.,こんにちは！初めてお会いします。,你好！初次见面。
example_002,food,fruit,restaurant,beginner,"food,ordering,restaurant",사과 주스 하나 주세요.,Please give me one apple juice.,りんごジュースを一つください。,请给我一杯苹果汁。`;

  downloadCSV(csvContent, "examples_template.csv");
}

function downloadGrammarJSONTemplate() {
  const template = [
    {
      pattern_name: "기본 인사",
      structural_pattern: "안녕하세요",
      explanation:
        "가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다.",
      example: {
        korean: "안녕하세요, 처음 뵙겠습니다.",
        english: "Hello, nice to meet you.",
        japanese: "こんにちは、初めまして。",
        chinese: "您好，初次见面。",
      },
      difficulty: "basic",
      tags: ["formal", "greeting"],
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      pattern_name: "음식 주문",
      structural_pattern: "___을/를 주세요",
      explanation:
        "음식점이나 상점에서 무언가를 주문하거나 요청할 때 사용하는 정중한 표현입니다.",
      example: {
        korean: "김치찌개를 주세요.",
        english: "Please give me kimchi stew.",
        japanese: "キムチチゲをください。",
        chinese: "请给我泡菜汤。",
      },
      difficulty: "basic",
      tags: ["casual", "request"],
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      pattern_name: "과거형 표현",
      structural_pattern: "___었/았어요",
      explanation:
        "과거에 일어난 일을 표현할 때 사용하는 기본적인 과거형 어미입니다.",
      example: {
        korean: "어제 친구를 만났어요.",
        english: "I met a friend yesterday.",
        japanese: "昨日友達に会いました。",
        chinese: "昨天见了朋友。",
      },
      difficulty: "intermediate",
      tags: ["formal", "description"],
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  downloadJSON(template, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
  const csvContent = `pattern_name,structural_pattern,explanation,korean_example,english_example,japanese_example,chinese_example,difficulty,tags,created_at
기본 인사,안녕하세요,가장 기본적인 한국어 인사말로 누구에게나 사용할 수 있는 정중한 표현입니다,"안녕하세요, 처음 뵙겠습니다.","Hello, nice to meet you.","こんにちは、初めまして。","您好，初次见面。",basic,"formal,greeting",2024-01-01T00:00:00Z
음식 주문,___을/를 주세요,음식점이나 상점에서 무언가를 주문하거나 요청할 때 사용하는 정중한 표현입니다,김치찌개를 주세요.,"Please give me kimchi stew.",キムチチゲをください。,请给我泡菜汤。,basic,"casual,request",2024-01-01T00:00:00Z
과거형 표현,___었/았어요,과거에 일어난 일을 표현할 때 사용하는 기본적인 과거형 어미입니다,어제 친구를 만났어요.,"I met a friend yesterday.",昨日友達に会いました。,昨天见了朋友。,intermediate,"formal,description",2024-01-01T00:00:00Z`;

  downloadCSV(csvContent, "grammar_template.csv");
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
          parsedData = parseGrammarPatternFromCSV(row);
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
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
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
      example_id: row.example_id || null,
      domain: row.domain || "general",
      category: row.category || "common",
      context: row.context || "general",
      difficulty: row.difficulty || "beginner",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
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
function parseGrammarPatternFromCSV(row) {
  try {
    console.log("🔍 CSV 파싱 시작, 원본 row:", row);

    // 단일 예문 객체 생성
    const example = {
      korean: row.korean_example || "",
      english: row.english_example || "",
      japanese: row.japanese_example || "",
      chinese: row.chinese_example || "",
    };

    console.log("📝 예문 생성:", example);

    const result = {
      pattern_name: row.pattern_name || "",
      structural_pattern: row.structural_pattern || "",
      explanation: row.explanation || "",
      example: example,
      difficulty: row.difficulty || "basic",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      created_at: row.created_at || new Date().toISOString(),
    };

    console.log("🔧 파싱 결과:", result);
    console.log("📖 파싱된 explanation:", result.explanation);
    console.log("📚 파싱된 example:", result.example);

    return result;
  } catch (error) {
    console.error("❌ 문법 패턴 CSV 파싱 오류:", error);
    console.error("❌ 파싱 실패 데이터:", row);
    return null;
  }
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
