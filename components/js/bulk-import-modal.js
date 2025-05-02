import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";

// 전역 변수
let importedData = [];
let selectedFile = null;
let isImporting = false;

export function initialize() {
  console.log("대량 개념 추가 모달 초기화");

  // 모달 요소
  const modal = document.getElementById("bulk-import-modal");
  const closeBtn = document.getElementById("close-bulk-modal");
  const cancelBtn = document.getElementById("cancel-import");
  const startImportBtn = document.getElementById("start-import");
  const downloadTemplateBtn = document.getElementById("download-template");
  const importModeSelect = document.getElementById("import-mode");
  const csvSettings = document.getElementById("csv-settings");
  const jsonSettings = document.getElementById("json-settings");
  const browseFileBtn = document.getElementById("browse-file");
  const fileInput = document.getElementById("file-input");
  const fileNameDisplay = document.getElementById("file-name");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (startImportBtn) {
    startImportBtn.addEventListener("click", startImport);
  }

  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener("click", downloadTemplate);
  }

  if (importModeSelect) {
    importModeSelect.addEventListener("change", function () {
      toggleImportSettings(this.value);
    });
  }

  if (browseFileBtn) {
    browseFileBtn.addEventListener("click", function () {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      handleFileSelect(event);
    });

    // 파일 드래그 앤 드롭 처리
    const dropZone = document.querySelector(".border-dashed");
    if (dropZone) {
      dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add("border-blue-500");
      });

      dropZone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove("border-blue-500");
      });

      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove("border-blue-500");

        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
          fileInput.files = files;
          handleFileSelect({ target: fileInput });
        }
      });
    }
  }
}

// 파일 형식에 따른 설정 토글
function toggleImportSettings(mode) {
  const csvSettings = document.getElementById("csv-settings");
  const jsonSettings = document.getElementById("json-settings");

  if (mode === "csv") {
    csvSettings.classList.remove("hidden");
    jsonSettings.classList.add("hidden");
  } else {
    csvSettings.classList.add("hidden");
    jsonSettings.classList.remove("hidden");
  }
}

// 파일 선택 처리
function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  const fileNameDisplay = document.getElementById("file-name");
  fileNameDisplay.textContent = file.name;

  selectedFile = file;

  // 파일 형식에 맞게 import 모드 설정
  const importModeSelect = document.getElementById("import-mode");

  if (file.name.toLowerCase().endsWith(".csv")) {
    importModeSelect.value = "csv";
    toggleImportSettings("csv");
  } else if (file.name.toLowerCase().endsWith(".json")) {
    importModeSelect.value = "json";
    toggleImportSettings("json");
  }
}

// 템플릿 파일 다운로드
function downloadTemplate() {
  const importMode = document.getElementById("import-mode").value;

  if (importMode === "csv") {
    downloadCSVTemplate();
  } else {
    downloadJSONTemplate();
  }
}

// CSV 템플릿 다운로드
function downloadCSVTemplate() {
  // CSV 헤더
  const headers = [
    "domain",
    "category",
    "emoji",
    "korean_word",
    "korean_pronunciation",
    "korean_definition",
    "korean_part_of_speech",
    "korean_level",
    "english_word",
    "english_pronunciation",
    "english_definition",
    "english_part_of_speech",
    "english_level",
    "japanese_word",
    "japanese_pronunciation",
    "japanese_definition",
    "japanese_part_of_speech",
    "japanese_level",
    "chinese_word",
    "chinese_pronunciation",
    "chinese_definition",
    "chinese_part_of_speech",
    "chinese_level",
    "example_korean",
    "example_english",
    "example_japanese",
    "example_chinese",
  ];

  // 샘플 데이터
  const sampleRows = [
    [
      "daily",
      "greeting",
      "👋",
      "안녕하세요",
      "annyeonghaseyo",
      "인사말",
      "interjection",
      "beginner",
      "hello",
      "həˈloʊ",
      "greeting",
      "interjection",
      "beginner",
      "こんにちは",
      "konnichiwa",
      "挨拶",
      "interjection",
      "beginner",
      "你好",
      "nǐ hǎo",
      "问候语",
      "interjection",
      "beginner",
      "안녕하세요, 만나서 반갑습니다.",
      "Hello, nice to meet you.",
      "はじめまして、よろしくお願いします。",
      "很高兴见到你。",
    ],
    [
      "food",
      "fruit",
      "🍎",
      "사과",
      "sagwa",
      "과일의 일종",
      "noun",
      "beginner",
      "apple",
      "ˈæpl",
      "a round fruit with red, yellow, or green skin",
      "noun",
      "beginner",
      "りんご",
      "ringo",
      "果物の一種",
      "noun",
      "beginner",
      "苹果",
      "píng guǒ",
      "一种水果",
      "noun",
      "beginner",
      "나는 사과를 좋아합니다.",
      "I like apples.",
      "私はりんごが好きです。",
      "我喜欢苹果。",
    ],
  ];

  // CSV 문자열 생성
  let csvContent = headers.join(",") + "\n";

  sampleRows.forEach((row) => {
    csvContent +=
      row
        .map((cell) => {
          // 쉼표나 쌍따옴표가 있으면 쌍따옴표로 감싸고 내부 쌍따옴표는 두 번 표시
          if (cell && (cell.includes(",") || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell || "";
        })
        .join(",") + "\n";
  });

  // Blob 생성 및 다운로드
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// JSON 템플릿 다운로드
function downloadJSONTemplate() {
  // JSON 템플릿 데이터
  const jsonTemplate = [
    {
      domain: "daily",
      category: "greeting",
      concept_info: {
        domain: "daily",
        category: "greeting",
        emoji: "👋",
      },
      expressions: {
        korean: {
          word: "안녕하세요",
          pronunciation: "annyeonghaseyo",
          definition: "인사말",
          part_of_speech: "interjection",
          level: "beginner",
        },
        english: {
          word: "hello",
          pronunciation: "həˈloʊ",
          definition: "greeting",
          part_of_speech: "interjection",
          level: "beginner",
        },
        japanese: {
          word: "こんにちは",
          pronunciation: "konnichiwa",
          definition: "挨拶",
          part_of_speech: "interjection",
          level: "beginner",
        },
        chinese: {
          word: "你好",
          pronunciation: "nǐ hǎo",
          definition: "问候语",
          part_of_speech: "interjection",
          level: "beginner",
        },
      },
      examples: [
        {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          japanese: "はじめまして、よろしくお願いします。",
          chinese: "很高兴见到你。",
        },
      ],
    },
    {
      domain: "food",
      category: "fruit",
      concept_info: {
        domain: "food",
        category: "fruit",
        emoji: "🍎",
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sagwa",
          definition: "과일의 일종",
          part_of_speech: "noun",
          level: "beginner",
        },
        english: {
          word: "apple",
          pronunciation: "ˈæpl",
          definition: "a round fruit with red, yellow, or green skin",
          part_of_speech: "noun",
          level: "beginner",
        },
        japanese: {
          word: "りんご",
          pronunciation: "ringo",
          definition: "果物の一種",
          part_of_speech: "noun",
          level: "beginner",
        },
        chinese: {
          word: "苹果",
          pronunciation: "píng guǒ",
          definition: "一种水果",
          part_of_speech: "noun",
          level: "beginner",
        },
      },
      examples: [
        {
          korean: "나는 사과를 좋아합니다.",
          english: "I like apples.",
          japanese: "私はりんごが好きです。",
          chinese: "我喜欢苹果。",
        },
      ],
    },
  ];

  // JSON 문자열로 변환 (들여쓰기 포함)
  const jsonContent = JSON.stringify(jsonTemplate, null, 2);

  // Blob 생성 및 다운로드
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template.json");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 가져오기 시작
async function startImport() {
  if (!selectedFile || isImporting) return;

  isImporting = true;
  importedData = [];

  // UI 업데이트
  const importStatus = document.getElementById("import-status");
  const importProgress = document.getElementById("import-progress");
  const importPercentage = document.getElementById("import-percentage");
  const importResult = document.getElementById("import-result");
  const startImportBtn = document.getElementById("start-import");

  importStatus.classList.remove("hidden");
  importProgress.style.width = "0%";
  importPercentage.textContent = "0%";
  importResult.textContent = "파일 처리 중...";
  startImportBtn.disabled = true;

  try {
    const importMode = document.getElementById("import-mode").value;
    const defaultDomain = document
      .getElementById("default-domain")
      .value.trim();
    const defaultCategory = document
      .getElementById("default-category")
      .value.trim();

    // 파일 형식에 따라 파싱 함수 호출
    if (importMode === "csv") {
      const delimiter = document.getElementById("csv-delimiter").value;
      const hasHeader =
        document.getElementById("csv-has-header").value === "true";

      await parseCSVFile(
        selectedFile,
        delimiter,
        hasHeader,
        defaultDomain,
        defaultCategory
      );
    } else {
      await parseJSONFile(selectedFile, defaultDomain, defaultCategory);
    }

    // 데이터 가져오기 시작
    importResult.textContent = `${importedData.length}개의 개념을 가져오는 중...`;

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importedData.length; i++) {
      try {
        await conceptUtils.createConcept(importedData[i]);
        successCount++;
      } catch (error) {
        console.error("개념 가져오기 오류:", error);
        errorCount++;
      }

      // 진행률 업데이트
      const progressPercent = Math.round(((i + 1) / importedData.length) * 100);
      importProgress.style.width = `${progressPercent}%`;
      importPercentage.textContent = `${progressPercent}%`;

      // 결과 업데이트
      importResult.textContent = `처리 중: ${i + 1}/${
        importedData.length
      } (성공: ${successCount}, 실패: ${errorCount})`;

      // 렌더링을 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // 최종 결과 표시
    importResult.innerHTML = `
      <div class="text-green-700 font-medium">가져오기 완료</div>
      <div>전체: ${importedData.length}개, 성공: ${successCount}개, 실패: ${errorCount}개</div>
    `;

    // 이벤트 발생 (목록 새로고침)
    window.dispatchEvent(new CustomEvent("concept-saved"));
  } catch (error) {
    console.error("가져오기 오류:", error);
    importResult.innerHTML = `
      <div class="text-red-700 font-medium">오류 발생</div>
      <div>${error.message}</div>
    `;
  } finally {
    isImporting = false;
    startImportBtn.disabled = false;
  }
}

// CSV 파일 파싱
function parseCSVFile(
  file,
  delimiter,
  hasHeader,
  defaultDomain,
  defaultCategory
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const csvText = event.target.result;
        const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim());

        // 헤더 처리
        let headerRow = null;
        let startIndex = 0;

        if (hasHeader) {
          headerRow = parseCSVLine(lines[0], delimiter);
          startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          const values = parseCSVLine(line, delimiter);

          // 개념 데이터 생성
          const conceptData = createConceptFromCSV(
            values,
            headerRow,
            defaultDomain,
            defaultCategory
          );
          if (conceptData) {
            importedData.push(conceptData);
          }
        }

        resolve();
      } catch (error) {
        reject(new Error("CSV 파일 파싱 중 오류 발생: " + error.message));
      }
    };

    reader.onerror = function () {
      reject(new Error("파일 읽기 실패"));
    };

    reader.readAsText(file);
  });
}

// CSV 라인 파싱 (쉼표, 따옴표 처리)
function parseCSVLine(line, delimiter) {
  const result = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 쌍따옴표 이스케이프 처리
        currentValue += '"';
        i++;
      } else {
        // 따옴표 토글
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // 구분자 처리
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  // 마지막 값 추가
  result.push(currentValue);

  return result;
}

// CSV 데이터에서 개념 객체 생성
function createConceptFromCSV(
  values,
  headerRow,
  defaultDomain,
  defaultCategory
) {
  // 헤더가 있는 경우와 없는 경우 처리
  let domain, category, emoji;
  let expressions = {};
  let examples = [];

  if (headerRow) {
    // 헤더가 있는 경우 - 헤더 이름으로 매핑
    const valueMap = {};

    headerRow.forEach((header, index) => {
      if (index < values.length) {
        valueMap[header.trim()] = values[index];
      }
    });

    domain = valueMap.domain || defaultDomain;
    category = valueMap.category || defaultCategory;
    emoji = valueMap.emoji || "";

    // 언어별 표현 생성
    for (const langCode of Object.keys(supportedLanguages)) {
      const word = valueMap[`${langCode}_word`];

      if (word) {
        expressions[langCode] = {
          word: word,
          pronunciation: valueMap[`${langCode}_pronunciation`] || "",
          definition: valueMap[`${langCode}_definition`] || "",
          part_of_speech: valueMap[`${langCode}_part_of_speech`] || "noun",
          level: valueMap[`${langCode}_level`] || "beginner",
        };
      }
    }

    // 예제 생성
    const exampleKorean = valueMap.example_korean;
    const exampleEnglish = valueMap.example_english;
    const exampleJapanese = valueMap.example_japanese;
    const exampleChinese = valueMap.example_chinese;

    if (exampleKorean || exampleEnglish || exampleJapanese || exampleChinese) {
      const example = {};

      if (exampleKorean) example.korean = exampleKorean;
      if (exampleEnglish) example.english = exampleEnglish;
      if (exampleJapanese) example.japanese = exampleJapanese;
      if (exampleChinese) example.chinese = exampleChinese;

      examples.push(example);
    }
  } else {
    // 헤더가 없는 경우 - 인덱스 기반 매핑
    domain = values[0] || defaultDomain;
    category = values[1] || defaultCategory;
    emoji = values[2] || "";

    // 한국어
    if (values[3]) {
      expressions.korean = {
        word: values[3],
        pronunciation: values[4] || "",
        definition: values[5] || "",
        part_of_speech: values[6] || "noun",
        level: values[7] || "beginner",
      };
    }

    // 영어
    if (values[8]) {
      expressions.english = {
        word: values[8],
        pronunciation: values[9] || "",
        definition: values[10] || "",
        part_of_speech: values[11] || "noun",
        level: values[12] || "beginner",
      };
    }

    // 일본어
    if (values[13]) {
      expressions.japanese = {
        word: values[13],
        pronunciation: values[14] || "",
        definition: values[15] || "",
        part_of_speech: values[16] || "noun",
        level: values[17] || "beginner",
      };
    }

    // 중국어
    if (values[18]) {
      expressions.chinese = {
        word: values[18],
        pronunciation: values[19] || "",
        definition: values[20] || "",
        part_of_speech: values[21] || "noun",
        level: values[22] || "beginner",
      };
    }

    // 예제
    const exampleKorean = values[23];
    const exampleEnglish = values[24];
    const exampleJapanese = values[25];
    const exampleChinese = values[26];

    if (exampleKorean || exampleEnglish || exampleJapanese || exampleChinese) {
      const example = {};

      if (exampleKorean) example.korean = exampleKorean;
      if (exampleEnglish) example.english = exampleEnglish;
      if (exampleJapanese) example.japanese = exampleJapanese;
      if (exampleChinese) example.chinese = exampleChinese;

      examples.push(example);
    }
  }

  // 유효성 검사
  if (!domain || !category || Object.keys(expressions).length === 0) {
    console.warn("유효하지 않은 개념 데이터:", values);
    return null;
  }

  // 개념 객체 반환
  return {
    concept_info: {
      domain: domain,
      category: category,
      emoji: emoji,
      images: [],
    },
    expressions: expressions,
    examples: examples,
  };
}

// JSON 파일 파싱
function parseJSONFile(file, defaultDomain, defaultCategory) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const jsonText = event.target.result;
        const jsonData = JSON.parse(jsonText);

        if (!Array.isArray(jsonData)) {
          throw new Error("JSON 데이터는 배열 형식이어야 합니다.");
        }

        // 각 개념 데이터 처리
        for (const item of jsonData) {
          const conceptData = createConceptFromJSON(
            item,
            defaultDomain,
            defaultCategory
          );
          if (conceptData) {
            importedData.push(conceptData);
          }
        }

        resolve();
      } catch (error) {
        reject(new Error("JSON 파일 파싱 중 오류 발생: " + error.message));
      }
    };

    reader.onerror = function () {
      reject(new Error("파일 읽기 실패"));
    };

    reader.readAsText(file);
  });
}

// JSON 데이터에서 개념 객체 생성
function createConceptFromJSON(item, defaultDomain, defaultCategory) {
  if (!item) return null;

  // 기본 정보 검증
  const domain = item.domain || defaultDomain;
  const category = item.category || defaultCategory;
  const conceptInfo = item.concept_info || {};
  const emoji = conceptInfo.emoji || "";

  if (!domain || !category) {
    console.warn("도메인 또는 카테고리가 없는 개념:", item);
    return null;
  }

  // 표현 정보 검증
  if (!item.expressions || Object.keys(item.expressions).length === 0) {
    console.warn("유효한 표현이 없는 개념:", item);
    return null;
  }

  // 유효한 표현 필터링
  const expressions = {};

  for (const [lang, expr] of Object.entries(item.expressions)) {
    if (expr && expr.word) {
      expressions[lang] = {
        word: expr.word,
        pronunciation: expr.pronunciation || "",
        definition: expr.definition || "",
        part_of_speech: expr.part_of_speech || "noun",
        level: expr.level || "beginner",
      };
    }
  }

  if (Object.keys(expressions).length === 0) {
    console.warn("유효한 단어가 없는 개념:", item);
    return null;
  }

  // 예제 검증
  const examples = [];

  if (Array.isArray(item.examples)) {
    for (const ex of item.examples) {
      if (ex && Object.keys(ex).length > 0) {
        examples.push(ex);
      }
    }
  }

  // 개념 객체 반환
  return {
    concept_info: {
      domain: domain,
      category: category,
      emoji: emoji,
      images: [],
    },
    expressions: expressions,
    examples: examples,
  };
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  // 파일 입력 초기화
  const fileInput = document.getElementById("file-input");
  const fileNameDisplay = document.getElementById("file-name");

  if (fileInput) {
    fileInput.value = "";
  }

  if (fileNameDisplay) {
    fileNameDisplay.textContent = "파일을 선택하거나 여기에 끌어다 놓으세요.";
  }

  // 가져오기 상태 초기화
  const importStatus = document.getElementById("import-status");

  if (importStatus) {
    importStatus.classList.add("hidden");
  }

  // 변수 초기화
  selectedFile = null;
  importedData = [];
  isImporting = false;
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openBulkImportModal = function () {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  toggleImportSettings(document.getElementById("import-mode").value);
};
