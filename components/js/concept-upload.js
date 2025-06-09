import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
import { readFile, parseCSV } from "./csv-parser-utils.js";

let selectedFile = null;

export function initializeConceptUpload() {
  console.log("개념 업로드 모달 초기화");
  setupEventListeners();
}

function setupEventListeners() {
  // 모달 닫기
  const closeBtn = document.getElementById("close-concept-modal");
  const cancelBtn = document.getElementById("cancel-concept-import");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // 파일 선택
  const browseBtn = document.getElementById("browse-concept-file");
  const fileInput = document.getElementById("concept-file-input");
  const fileName = document.getElementById("concept-file-name");
  const uploadBtn = document.getElementById("start-concept-import");
  const downloadBtn = document.getElementById("download-concept-template");

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFile = file;
        fileName.textContent = `선택된 파일: ${file.name}`;
        uploadBtn.disabled = false;
        uploadBtn.classList.remove("bg-gray-400");
        uploadBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", startUpload);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadTemplate);
  }
}

async function startUpload() {
  if (!selectedFile) return;

  const formatSelect = document.getElementById("concept-import-mode");
  const format = formatSelect.value;
  const progressDiv = document.getElementById("concept-import-status");
  const progressBar = document.getElementById("concept-import-progress");
  const statusDiv = document.getElementById("concept-import-result");

  try {
    progressDiv.classList.remove("hidden");
    statusDiv.textContent = "파일을 읽는 중...";
    progressBar.style.width = "20%";

    const fileContent = await readFile(selectedFile);
    let data;

    if (format === "json") {
      data = JSON.parse(fileContent);
    } else {
      data = parseCSV(fileContent, "concepts");
    }

    statusDiv.textContent = "개념을 업로드하는 중...";
    progressBar.style.width = "50%";

    const result = await uploadConcepts(data);

    progressBar.style.width = "100%";
    statusDiv.textContent = `업로드 완료: ${result.success}개 성공, ${result.errors}개 실패`;

    setTimeout(() => {
      progressDiv.classList.add("hidden");
      closeModal();
      // 새로고침 이벤트 발생
      window.dispatchEvent(new CustomEvent("concept-uploaded"));
    }, 2000);
  } catch (error) {
    console.error("개념 업로드 오류:", error);
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
      await collectionManager.createConcept(conceptData);
      success++;
    } catch (error) {
      console.error("개념 업로드 오류:", error);
      errors++;
    }

    // 진행률 업데이트
    const progress =
      Math.round(((success + errors) / concepts.length) * 50) + 50;
    const progressBar = document.getElementById("concept-import-progress");
    if (progressBar) progressBar.style.width = `${progress}%`;
  }

  return { success, errors };
}

function downloadTemplate() {
  const formatSelect = document.getElementById("concept-import-mode");
  const format = formatSelect.value;

  if (format === "json") {
    downloadConceptsJSONTemplate();
  } else {
    downloadConceptsCSVTemplate();
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
        },
        english: {
          word: "apple",
          pronunciation: "/ˈæpəl/",
          definition: "a round fruit with red or green skin",
          part_of_speech: "noun",
          level: "beginner",
        },
      },
      representative_example: {
        translations: {
          korean: "나는 빨간 사과를 좋아한다.",
          english: "I like red apples.",
        },
        context: "daily_conversation",
        difficulty: "beginner",
      },
    },
  ];

  downloadJSON(template, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  const csvContent = `domain,category,difficulty,tags,korean_word,korean_pronunciation,korean_definition,english_word,english_pronunciation,english_definition,example_korean,example_english
daily,fruit,beginner,"food,healthy,common",사과,sa-gwa,둥글고 빨간 과일,apple,/ˈæpəl/,a round fruit with red or green skin,나는 빨간 사과를 좋아한다.,I like red apples.
daily,animal,beginner,"pet,common",고양이,go-yang-i,털이 부드러운 애완동물,cat,/kæt/,a small domesticated carnivorous mammal,고양이가 소파에서 잠을 잔다.,The cat sleeps on the sofa.`;

  downloadCSV(csvContent, "concepts_template.csv");
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

function closeModal() {
  const modal = document.getElementById("concept-upload-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 초기화
    selectedFile = null;
    const fileName = document.getElementById("concept-file-name");
    const uploadBtn = document.getElementById("start-concept-import");
    const progressDiv = document.getElementById("concept-import-status");

    if (fileName) fileName.textContent = "개념 파일을 선택하세요.";
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.classList.add("bg-gray-400");
      uploadBtn.classList.remove("bg-blue-500", "hover:bg-blue-600");
    }
    if (progressDiv) progressDiv.classList.add("hidden");
  }
}

// 전역 함수로 모달 열기
window.openConceptUploadModal = function () {
  const modal = document.getElementById("concept-upload-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
};
