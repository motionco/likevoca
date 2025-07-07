import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../../utils/firebase/firebase-init.js";
import {
  GRAMMAR_TAGS,
  validateGrammarTags,
  getGrammarTagHeaders,
  grammarTagsFromCSV,
  grammarTagsToCSV,
} from "../../js/grammar/grammar-tags-system.js";
import { collectionManager } from "../../utils/firebase/firebase-collection-manager.js";
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
  console.log("대량 가져오기 모달 초기화");
  setupTabNavigation();
  setupEventListeners();
}

function setupTabNavigation() {
  const tabs = ["concepts", "examples", "grammar"];

  tabs.forEach((tab) => {
    const tabButton = document.getElementById(`${tab}-tab`);
    const tabContent = document.getElementById(`${tab}-content`);

    if (tabButton) {
      tabButton.addEventListener("click", () => {
        // 모든 탭 비활성화
        tabs.forEach((t) => {
          const btn = document.getElementById(`${t}-tab`);
          const content = document.getElementById(`${t}-content`);

          if (btn) {
            btn.classList.remove("text-blue-600", "border-blue-600");
            btn.classList.add("text-gray-600", "border-transparent");
          }
          if (content) {
            content.classList.add("hidden");
          }
        });

        // 선택된 탭 활성화
        tabButton.classList.remove("text-gray-600");
        tabButton.classList.add("text-blue-600", "border-blue-600");
        if (tabContent) {
          tabContent.classList.remove("hidden");
        }

        currentTab = tab;
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

  // 각 탭 이벤트 리스너 설정
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

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => {
      fileInput.click();
    });

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

  // 업로드 버튼
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      uploadFile(tabName);
    });
  }

  // 템플릿 다운로드 버튼
  const downloadBtn = document.getElementById(`download-${tabName}-template`);
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadTemplate(tabName);
    });
  }
}

function closeModal() {
  const modal = document.getElementById("bulk-import-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 모든 탭 초기화
    ["concepts", "examples", "grammar"].forEach((tab) => {
      const fileName = document.getElementById(`${tab}-file-name`);
      const fileInput = document.getElementById(`${tab}-file-input`);
      const uploadBtn = document.getElementById(`start-${tab}-import`);
      const progressDiv = document.getElementById(`${tab}-import-status`);

      // 파일 입력 초기화
      if (fileInput) {
        fileInput.value = "";
      }

      // 파일명 초기화
      if (fileName) {
        fileName.textContent = `${
          tab === "concepts"
            ? "개념"
            : tab === "examples"
            ? "예문"
            : "문법 패턴"
        } 파일을 선택하세요`;
      }

      // 업로드 버튼 초기화
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

      // 진행 상태 숨기기
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

  console.log(`${tabName} 파일 업로드 시작:`, {
    fileName: file.name,
    fileSize: file.size,
    format: format,
  });

  try {
    // 상태 컨테이너 표시
    statusContainer.classList.remove("hidden");

    progressBar.style.width = "25%";
    statusDiv.innerHTML = '<p class="text-blue-500">파일을 읽는 중..</p>';

    const content = await readFileContent(file);
    console.log(`파일 내용 읽기 완료, 길이: ${content.length}`);

    progressBar.style.width = "50%";
    statusDiv.innerHTML = '<p class="text-blue-500">데이터를 파싱하는 중..</p>';

    let data;
    if (format === "json") {
      data = JSON.parse(content);
    } else {
      data = parseCSV(content, tabName);
    }

    progressBar.style.width = "75%";
    statusDiv.innerHTML =
      '<p class="text-blue-500">데이터를 업로드하는 중..</p>';

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
    statusDiv.innerHTML = `<p class="text-green-500">업로드 완료! 성공: ${result.success}, 실패: ${result.errors}</p>`;

    // 3초 후 상태 숨기기
    setTimeout(() => {
      statusContainer.classList.add("hidden");
      progressBar.style.width = "0%";
    }, 3000);
  } catch (error) {
    console.error(`${tabName} 업로드 오류:`, error);
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
        concept_info: conceptData.concept_info || {},
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        randomField: Math.random(),
        created_at: new Date().toISOString(),
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
          : ["casual"],
        purpose: exampleData.purpose || null,
        translations: exampleData.translations || {},
        randomField: Math.random(),
        created_at: new Date().toISOString(),
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
  const patterns = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const patternData of patterns) {
    try {
      const patternDoc = {
        domain: patternData.domain || "daily",
        category: patternData.category || "general",
        difficulty: patternData.difficulty || "basic",
        situation: Array.isArray(patternData.situation)
          ? patternData.situation
          : ["casual"],
        purpose: patternData.purpose || "description",
        pattern: patternData.pattern || {},
        example: patternData.example || {},
        randomField: Math.random(),
        created_at: new Date().toISOString(),
      };

      await collectionManager.createGrammarPattern(patternDoc);
      success++;
    } catch (error) {
      console.error("문법 패턴 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

function downloadTemplate(tabName) {
  switch (tabName) {
    case "concepts":
      downloadConceptsJSONTemplate();
      break;
    case "examples":
      downloadExamplesJSONTemplate();
      break;
    case "grammar":
      downloadGrammarJSONTemplate();
      break;
  }
}

function downloadConceptsJSONTemplate() {
  downloadJSON(CONCEPTS_TEMPLATE, "concepts_template.json");
}

function downloadExamplesJSONTemplate() {
  downloadJSON(EXAMPLES_TEMPLATE, "examples_template.json");
}

function downloadGrammarJSONTemplate() {
  downloadJSON(GRAMMAR_TEMPLATE, "grammar_template.json");
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV 파일이 비어있습니다.");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    data.push(row);
  }

  return data;
}

async function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// 전역 함수로 노출
window.openBulkImportModal = function () {
  const modal = document.getElementById("bulk-import-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
};

console.log("📦 bulk-import-modal.js 로드 완료");
