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
        category: "shopping",
        difficulty: "beginner",
        unicode_emoji: "🛒",
        color_theme: "#FF6B6B",
        situation: ["casual", "shopping"],
        purpose: "description",
      },
      expressions: {
        korean: {
          word: "쇼핑",
          pronunciation: "sho-ping",
          definition: "물건을 사는 행위",
          part_of_speech: "명사",
          level: "beginner",
        },
        english: {
          word: "shopping",
          pronunciation: "/ˈʃɒpɪŋ/",
          definition: "the activity of buying things from shops",
          part_of_speech: "noun",
          level: "beginner",
        },
      },
      representative_example: {
        translations: {
          korean: "나는 주말에 쇼핑을 갑니다.",
          english: "I go shopping on weekends.",
        },
        context: "daily_conversation",
        difficulty: "beginner",
      },
    },
    {
      concept_info: {
        domain: "culture",
        category: "tradition",
        difficulty: "intermediate",
        unicode_emoji: "🏛️",
        color_theme: "#9C27B0",
        situation: ["formal", "educational"],
        purpose: "cultural_knowledge",
      },
      expressions: {
        korean: {
          word: "전통",
          pronunciation: "jeon-tong",
          definition: "옛날부터 전해 내려오는 관습이나 문화",
          part_of_speech: "명사",
          level: "intermediate",
        },
        english: {
          word: "tradition",
          pronunciation: "/trəˈdɪʃən/",
          definition: "customs and beliefs passed down through generations",
          part_of_speech: "noun",
          level: "intermediate",
        },
      },
      representative_example: {
        translations: {
          korean: "한국의 전통 문화를 보존해야 합니다.",
          english: "We should preserve Korean traditional culture.",
        },
        context: "cultural_discussion",
        difficulty: "intermediate",
      },
    },
    {
      concept_info: {
        domain: "education",
        category: "online_learning",
        difficulty: "intermediate",
        unicode_emoji: "💻",
        color_theme: "#2196F3",
        situation: ["academic", "modern"],
        purpose: "learning_method",
      },
      expressions: {
        korean: {
          word: "온라인 학습",
          pronunciation: "on-la-in hak-seup",
          definition: "인터넷을 통해 이루어지는 학습",
          part_of_speech: "명사",
          level: "intermediate",
        },
        english: {
          word: "online learning",
          pronunciation: "/ˈɒnlaɪn ˈlɜːrnɪŋ/",
          definition: "education that takes place over the Internet",
          part_of_speech: "noun",
          level: "intermediate",
        },
      },
      representative_example: {
        translations: {
          korean: "온라인 학습은 매우 편리합니다.",
          english: "Online learning is very convenient.",
        },
        context: "educational_discussion",
        difficulty: "intermediate",
      },
    },
    {
      concept_info: {
        domain: "other",
        category: "creativity",
        difficulty: "advanced",
        unicode_emoji: "🎨",
        color_theme: "#FF9800",
        situation: ["creative", "artistic"],
        purpose: "self_expression",
      },
      expressions: {
        korean: {
          word: "창의성",
          pronunciation: "chang-ui-seong",
          definition: "새롭고 독창적인 것을 만들어 내는 능력",
          part_of_speech: "명사",
          level: "advanced",
        },
        english: {
          word: "creativity",
          pronunciation: "/ˌkriːeɪˈtɪvəti/",
          definition: "the ability to create original and imaginative ideas",
          part_of_speech: "noun",
          level: "advanced",
        },
      },
      representative_example: {
        translations: {
          korean: "창의성은 모든 분야에서 중요합니다.",
          english: "Creativity is important in all fields.",
        },
        context: "professional_discussion",
        difficulty: "advanced",
      },
    },
  ];

  downloadJSON(template, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  const csvContent = `domain,category,difficulty,situation,purpose,korean_word,korean_pronunciation,korean_definition,english_word,english_pronunciation,english_definition,example_korean,example_english
daily,shopping,beginner,"casual,shopping",description,쇼핑,sho-ping,물건을 사는 행위,shopping,/ˈʃɒpɪŋ/,the activity of buying things from shops,나는 주말에 쇼핑을 갑니다.,I go shopping on weekends.
daily,communication,beginner,"casual,social",interaction,대화,dae-hwa,서로 이야기하는 것,conversation,/ˌkɒnvəˈseɪʃən/,informal talk between people,친구와 즐거운 대화를 나눴습니다.,I had a pleasant conversation with my friend.
food,cooking,intermediate,"home,kitchen",activity,요리,yo-ri,음식을 만드는 것,cooking,/ˈkʊkɪŋ/,the practice of preparing food,엄마는 요리를 잘합니다.,My mom is good at cooking.
travel,booking,intermediate,"formal,travel",transaction,예약,ye-yak,미리 자리를 잡아 두는 것,reservation,/ˌrezəˈveɪʃən/,an arrangement to have something kept for you,호텔 예약을 했습니다.,I made a hotel reservation.
technology,programming,advanced,"professional,work",skill,프로그래밍,peu-ro-geu-rae-ming,컴퓨터 프로그램을 만드는 것,programming,/ˈprəʊɡræmɪŋ/,the process of writing computer programs,프로그래밍을 배우고 있습니다.,I am learning programming.
culture,tradition,intermediate,"formal,cultural",knowledge,전통,jeon-tong,옛날부터 전해 내려오는 관습,tradition,/trəˈdɪʃən/,customs passed down through generations,한국의 전통 문화를 보존해야 합니다.,We should preserve Korean traditional culture.
education,online_learning,intermediate,"academic,modern",method,온라인 학습,on-la-in hak-seup,인터넷을 통한 학습,online learning,/ˈɒnlaɪn ˈlɜːrnɪŋ/,education via the Internet,온라인 학습은 매우 편리합니다.,Online learning is very convenient.
health,wellness,intermediate,"lifestyle,health",concept,웰니스,wel-li-seu,전반적인 건강과 행복,wellness,/ˈwelnəs/,the state of being healthy and happy,웰니스는 중요한 생활 철학입니다.,Wellness is an important life philosophy.
business,startup,advanced,"professional,entrepreneurship",concept,스타트업,seu-ta-teu-eop,새로운 사업을 시작하는 회사,startup,/ˈstɑːrtʌp/,a newly established business,스타트업에서 일하고 있습니다.,I work at a startup.
other,creativity,advanced,"creative,artistic",skill,창의성,chang-ui-seong,새롭고 독창적인 것을 만드는 능력,creativity,/ˌkriːeɪˈtɪvəti/,ability to create original ideas,창의성은 모든 분야에서 중요합니다.,Creativity is important in all fields.`;

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
