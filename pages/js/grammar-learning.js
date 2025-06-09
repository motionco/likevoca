import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  getDocs,
  query,
  collection,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  auth,
  db,
  conceptUtils,
  exampleUtils,
  grammarPatternUtils,
} from "../../js/firebase/firebase-init.js";

let currentUser = null;
let currentLearningArea = null;
let currentLearningMode = null;
let currentData = [];
let currentIndex = 0;

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 네비게이션바 로드
    await loadNavbar();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        showAreaSelection();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("학습 페이지 초기화 중 오류 발생:", error);
    alert("페이지를 불러오는 중 문제가 발생했습니다.");
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  console.log("🔧 이벤트 리스너 설정 시작");

  // 영역 선택 카드 클릭 이벤트
  const vocabularyArea = document.getElementById("vocabulary-area");
  const grammarArea = document.getElementById("grammar-area");
  const readingArea = document.getElementById("reading-area");

  console.log("🔍 카드 요소들:", {
    vocabularyArea: !!vocabularyArea,
    grammarArea: !!grammarArea,
    readingArea: !!readingArea,
  });

  if (vocabularyArea) {
    vocabularyArea.addEventListener("click", (e) => {
      console.log("🖱️ 단어 학습 카드 클릭됨");
      if (!e.target.closest("button")) {
        showLearningModes("vocabulary");
      }
    });
  } else {
    console.error("❌ vocabulary-area 요소를 찾을 수 없습니다");
  }

  if (grammarArea) {
    grammarArea.addEventListener("click", (e) => {
      console.log("🖱️ 문법 학습 카드 클릭됨");
      if (!e.target.closest("button")) {
        showLearningModes("grammar");
      }
    });
  } else {
    console.error("❌ grammar-area 요소를 찾을 수 없습니다");
  }

  if (readingArea) {
    readingArea.addEventListener("click", (e) => {
      console.log("🖱️ 독해 학습 카드 클릭됨");
      if (!e.target.closest("button")) {
        showLearningModes("reading");
      }
    });
  } else {
    console.error("❌ reading-area 요소를 찾을 수 없습니다");
  }

  // 업로드 버튼 이벤트
  const addVocabularyBtn = document.getElementById("add-vocabulary-wordbook");
  const addGrammarBtn = document.getElementById("add-grammar-patterns");
  const addReadingBtn = document.getElementById("add-reading-examples");

  if (addVocabularyBtn) {
    addVocabularyBtn.addEventListener("click", (e) => {
      console.log("📦 개념 업로드 버튼 클릭됨");
      e.stopPropagation();
      showUploadModal("concept");
    });
  }

  if (addGrammarBtn) {
    addGrammarBtn.addEventListener("click", (e) => {
      console.log("📦 문법 업로드 버튼 클릭됨");
      e.stopPropagation();
      showUploadModal("grammar");
    });
  }

  if (addReadingBtn) {
    addReadingBtn.addEventListener("click", (e) => {
      console.log("📦 예문 업로드 버튼 클릭됨");
      e.stopPropagation();
      showUploadModal("example");
    });
  }

  // 모달 닫기 이벤트
  const closeConceptModal = document.getElementById(
    "close-concept-upload-modal"
  );
  const closeGrammarModal = document.getElementById(
    "close-grammar-upload-modal"
  );
  const closeExampleModal = document.getElementById(
    "close-example-upload-modal"
  );

  if (closeConceptModal) {
    closeConceptModal.addEventListener("click", () => {
      hideUploadModal("concept");
    });
  }

  if (closeGrammarModal) {
    closeGrammarModal.addEventListener("click", () => {
      hideUploadModal("grammar");
    });
  }

  if (closeExampleModal) {
    closeExampleModal.addEventListener("click", () => {
      hideUploadModal("example");
    });
  }

  // 업로드 버튼 이벤트
  const uploadConceptBtn = document.getElementById("upload-concept-file");
  const uploadGrammarBtn = document.getElementById("upload-grammar-file");
  const uploadExampleBtn = document.getElementById("upload-example-file");

  if (uploadConceptBtn) {
    uploadConceptBtn.addEventListener("click", () => {
      handleFileUpload("concept");
    });
  }

  if (uploadGrammarBtn) {
    uploadGrammarBtn.addEventListener("click", () => {
      handleFileUpload("grammar");
    });
  }

  if (uploadExampleBtn) {
    uploadExampleBtn.addEventListener("click", () => {
      handleFileUpload("example");
    });
  }

  // 템플릿 다운로드 이벤트
  const downloadConceptTemplate = document.getElementById(
    "download-concept-template"
  );
  const downloadGrammarTemplate = document.getElementById(
    "download-grammar-template"
  );
  const downloadExampleTemplate = document.getElementById(
    "download-example-template"
  );

  if (downloadConceptTemplate) {
    downloadConceptTemplate.addEventListener("click", () => {
      downloadTemplate("concept");
    });
  }

  if (downloadGrammarTemplate) {
    downloadGrammarTemplate.addEventListener("click", () => {
      downloadTemplate("grammar");
    });
  }

  if (downloadExampleTemplate) {
    downloadExampleTemplate.addEventListener("click", () => {
      downloadTemplate("example");
    });
  }

  // 돌아가기 버튼 이벤트
  const backToAreasBtn = document.getElementById("back-to-areas");
  if (backToAreasBtn) {
    backToAreasBtn.addEventListener("click", showAreaSelection);
  }

  // 플래시카드 이벤트
  const flipCardBtn = document.getElementById("flip-card");
  const prevCardBtn = document.getElementById("prev-card");
  const nextCardBtn = document.getElementById("next-card");
  const flipCardElement = document.querySelector(".flip-card");

  if (flipCardBtn) {
    flipCardBtn.addEventListener("click", flipCard);
  }
  if (prevCardBtn) {
    prevCardBtn.addEventListener("click", () => navigateCard(-1));
  }
  if (nextCardBtn) {
    nextCardBtn.addEventListener("click", () => navigateCard(1));
  }

  // 플래시카드 자체 클릭 이벤트 추가 (클릭으로도 뒤집기)
  if (flipCardElement) {
    flipCardElement.addEventListener("click", (e) => {
      // 버튼 클릭이 아닌 경우에만 뒤집기
      if (!e.target.closest("button")) {
        flipCard();
      }
    });
  }

  // 타이핑 이벤트
  const checkAnswerBtn = document.getElementById("check-answer");
  const nextTypingBtn = document.getElementById("next-typing");

  if (checkAnswerBtn) {
    checkAnswerBtn.addEventListener("click", checkTypingAnswer);
  }
  if (nextTypingBtn) {
    nextTypingBtn.addEventListener("click", nextTypingQuestion);
  }

  // 독해 네비게이션 이벤트
  const prevReadingBtn = document.getElementById("prev-reading");
  const nextReadingBtn = document.getElementById("next-reading");

  if (prevReadingBtn) {
    prevReadingBtn.addEventListener("click", () => navigateReading(-1));
  }
  if (nextReadingBtn) {
    nextReadingBtn.addEventListener("click", () => navigateReading(1));
  }

  // 백 버튼 이벤트
  const backFromFlashcard = document.getElementById("back-from-flashcard");
  const backFromTyping = document.getElementById("back-from-typing");
  const backFromGrammar = document.getElementById("back-from-grammar");
  const backFromReading = document.getElementById("back-from-reading");

  if (backFromFlashcard) {
    backFromFlashcard.addEventListener("click", () =>
      showLearningModes(currentLearningArea)
    );
  }
  if (backFromTyping) {
    backFromTyping.addEventListener("click", () =>
      showLearningModes(currentLearningArea)
    );
  }
  if (backFromGrammar) {
    backFromGrammar.addEventListener("click", () =>
      showLearningModes(currentLearningArea)
    );
  }
  if (backFromReading) {
    backFromReading.addEventListener("click", () =>
      showLearningModes(currentLearningArea)
    );
  }

  // 학습 모드 선택에서 업로드 버튼 이벤트
  const uploadForModeBtn = document.getElementById("upload-for-mode");
  if (uploadForModeBtn) {
    uploadForModeBtn.addEventListener("click", () => {
      toggleInlineUpload("mode");
    });
  }

  // 학습 모드 업로드 파일 버튼들
  const uploadModeFileBtn = document.getElementById("upload-mode-file");
  const downloadModeTemplateBtn = document.getElementById(
    "download-mode-template"
  );

  if (uploadModeFileBtn) {
    uploadModeFileBtn.addEventListener("click", () => {
      handleModeFileUpload();
    });
  }

  if (downloadModeTemplateBtn) {
    downloadModeTemplateBtn.addEventListener("click", () => {
      console.log("📥 템플릿 다운로드 요청:", currentLearningArea);
      let templateType;
      switch (currentLearningArea) {
        case "vocabulary":
          templateType = "concept";
          break;
        case "grammar":
          templateType = "grammar";
          break;
        case "reading":
          templateType = "example";
          break;
        default:
          templateType = currentLearningArea;
      }
      console.log("📥 템플릿 타입:", templateType);
      downloadTemplate(templateType);
    });
  }

  // 인라인 업로드 버튼들 이벤트
  const uploadVocabularyBtn = document.getElementById("upload-vocabulary-btn");
  const uploadTypingBtn = document.getElementById("upload-typing-btn");

  if (uploadVocabularyBtn) {
    uploadVocabularyBtn.addEventListener("click", () => {
      toggleInlineUpload("vocabulary");
    });
  }

  if (uploadTypingBtn) {
    uploadTypingBtn.addEventListener("click", () => {
      toggleInlineUpload("typing");
    });
  }

  // 인라인 업로드 파일 버튼들
  const uploadVocabularyFileBtn = document.getElementById(
    "upload-vocabulary-file"
  );
  const uploadTypingFileBtn = document.getElementById("upload-typing-file");

  if (uploadVocabularyFileBtn) {
    uploadVocabularyFileBtn.addEventListener("click", () => {
      handleInlineFileUpload("vocabulary");
    });
  }

  if (uploadTypingFileBtn) {
    uploadTypingFileBtn.addEventListener("click", () => {
      handleInlineFileUpload("typing");
    });
  }

  // 템플릿 다운로드 버튼들
  const downloadVocabularyTemplateBtn = document.getElementById(
    "download-vocabulary-template"
  );
  const downloadTypingTemplateBtn = document.getElementById(
    "download-typing-template"
  );

  if (downloadVocabularyTemplateBtn) {
    downloadVocabularyTemplateBtn.addEventListener("click", () => {
      downloadTemplate("concept");
    });
  }

  if (downloadTypingTemplateBtn) {
    downloadTypingTemplateBtn.addEventListener("click", () => {
      downloadTemplate("concept");
    });
  }

  console.log("✅ 이벤트 리스너 설정 완료");
}

// 영역 선택 화면 표시
function showAreaSelection() {
  hideAllSections();
  document
    .querySelector(".bg-white.rounded-lg.shadow-md")
    .classList.remove("hidden");
}

// 학습 모드 선택 화면 표시
function showLearningModes(area) {
  currentLearningArea = area;
  hideAllSections();

  const modeSection = document.getElementById("learning-mode-section");
  const modeTitle = document.getElementById("learning-mode-title");
  const modeContainer = document.getElementById("mode-buttons-container");
  const uploadBtn = document.getElementById("upload-for-mode");
  const uploadTitle = document.getElementById("mode-upload-title");

  let title = "";
  let modes = [];

  switch (area) {
    case "vocabulary":
      title = "단어 학습 모드";
      uploadBtn.classList.remove("hidden");
      uploadTitle.textContent = "단어 데이터 업로드";
      modes = [
        {
          id: "flashcard",
          name: "플래시카드",
          icon: "fas fa-clone",
          color: "blue",
        },
        {
          id: "typing",
          name: "타이핑",
          icon: "fas fa-keyboard",
          color: "green",
        },
        {
          id: "pronunciation",
          name: "발음 연습",
          icon: "fas fa-microphone",
          color: "purple",
        },
      ];
      break;
    case "grammar":
      title = "문법 학습 모드";
      uploadBtn.classList.remove("hidden");
      uploadTitle.textContent = "문법 패턴 데이터 업로드";
      modes = [
        {
          id: "pattern",
          name: "패턴 학습",
          icon: "fas fa-brain",
          color: "green",
        },
        {
          id: "exercise",
          name: "실습 문제",
          icon: "fas fa-edit",
          color: "blue",
        },
      ];
      break;
    case "reading":
      title = "독해 학습 모드";
      uploadBtn.classList.remove("hidden");
      uploadTitle.textContent = "예문 데이터 업로드";
      modes = [
        {
          id: "comprehension",
          name: "예문 이해",
          icon: "fas fa-book-open",
          color: "purple",
        },
        {
          id: "context",
          name: "맥락 학습",
          icon: "fas fa-lightbulb",
          color: "yellow",
        },
        {
          id: "practice",
          name: "독해 연습",
          icon: "fas fa-pencil-alt",
          color: "green",
        },
      ];
      break;
  }

  modeTitle.textContent = title;
  modeContainer.innerHTML = modes
    .map(
      (mode) => `
    <div class="bg-gradient-to-br from-${mode.color}-500 to-${mode.color}-600 text-white p-6 rounded-lg cursor-pointer hover:from-${mode.color}-600 hover:to-${mode.color}-700 transition-all duration-300"
         onclick="startLearningMode('${area}', '${mode.id}')">
      <div class="flex items-center justify-between mb-4">
        <i class="${mode.icon} text-3xl"></i>
      </div>
      <div class="font-bold text-xl mb-2">${mode.name}</div>
    </div>
  `
    )
    .join("");

  modeSection.classList.remove("hidden");
}

// 학습 모드 시작
async function startLearningMode(area, mode) {
  console.log(`🎯 학습 모드 시작: ${area} - ${mode}`);

  currentLearningArea = area;
  currentLearningMode = mode;

  try {
    await loadLearningData(area);

    if (currentData.length === 0) {
      console.log("📭 학습할 데이터가 없어서 학습 모드를 시작할 수 없습니다.");
      return;
    }

    console.log(`📚 ${currentData.length}개의 데이터로 학습 시작`);

    hideAllSections();
    currentIndex = 0;

    switch (area) {
      case "vocabulary":
        if (mode === "flashcard") {
          console.log("🃏 플래시카드 모드 시작");
          showFlashcardMode();
        } else if (mode === "typing") {
          console.log("⌨️ 타이핑 모드 시작");
          showTypingMode();
        }
        break;
      case "grammar":
        console.log("📝 문법 모드 시작");
        if (mode === "pattern") {
          showGrammarPatternMode();
        } else if (mode === "exercise") {
          showGrammarExerciseMode();
        }
        break;
      case "reading":
        console.log("📖 독해 모드 시작");
        showReadingMode();
        break;
    }
  } catch (error) {
    console.error("❌ 학습 모드 시작 중 오류:", error);
    alert("학습 모드를 시작하는 중 오류가 발생했습니다.");
  }
}

// 학습 데이터 로드
async function loadLearningData(area) {
  try {
    console.log(`📊 ${area} 데이터 로드 시작`);
    console.log(`👤 현재 사용자:`, currentUser);

    switch (area) {
      case "vocabulary":
        // 사용자 개념 가져오기 (실제 Firebase 쿼리 사용)
        if (currentUser && currentUser.email) {
          console.log(`🔍 이메일로 사용자 개념 조회: ${currentUser.email}`);
          currentData = await conceptUtils.getUserConcepts(currentUser.email);
          console.log(`🔍 이메일로 조회된 개념: ${currentData.length}개`);
          console.log(`📋 조회된 개념 데이터 샘플:`, currentData.slice(0, 2));

          // 이메일 기반으로 개념이 없으면 전체 concepts 컬렉션에서 조회 (테스트용)
          if (currentData.length === 0) {
            console.log("📚 전체 concepts 컬렉션에서 조회 시도");
            try {
              const allConceptsSnapshot = await getDocs(
                query(collection(db, "concepts"), limit(50))
              );
              currentData = allConceptsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log(
                `📖 전체 컬렉션에서 발견된 개념: ${currentData.length}개`
              );
              console.log(
                `📋 전체 컬렉션 데이터 샘플:`,
                currentData.slice(0, 2)
              );
            } catch (error) {
              console.error("전체 컬렉션 조회 실패:", error);
            }
          }
        } else {
          console.error("❌ 사용자 정보 없음, 전체 컬렉션에서 조회");
          console.log("🔄 Firebase 인증 상태 재확인");
          const authUser = firebase.auth().currentUser;
          console.log("🔄 Firebase Auth 현재 사용자:", authUser);

          try {
            const allConceptsSnapshot = await getDocs(
              query(collection(db, "concepts"), limit(50))
            );
            currentData = allConceptsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(
              `📖 전체 컬렉션에서 발견된 개념: ${currentData.length}개`
            );
            console.log(`📋 전체 컬렉션 데이터 샘플:`, currentData.slice(0, 2));
          } catch (error) {
            console.error("전체 컬렉션 조회 실패:", error);
            currentData = [];
          }
        }
        break;
      case "grammar":
        // 문법 패턴 가져오기
        if (currentUser && currentUser.email) {
          console.log(`🔍 이메일로 문법 패턴 조회: ${currentUser.email}`);
          try {
            const grammarSnapshot = await getDocs(
              query(
                collection(db, "grammar_patterns"),
                where("userId", "==", currentUser.email),
                limit(50)
              )
            );
            currentData = grammarSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(
              `🔍 이메일로 조회된 문법 패턴: ${currentData.length}개`
            );

            if (currentData.length === 0) {
              console.log("📚 전체 grammar_patterns 컬렉션에서 조회 시도");
              const allGrammarSnapshot = await getDocs(
                query(collection(db, "grammar_patterns"), limit(50))
              );
              currentData = allGrammarSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log(
                `📖 전체 문법 패턴 컬렉션에서 발견: ${currentData.length}개`
              );
            }
          } catch (error) {
            console.error("문법 패턴 조회 실패:", error);
            currentData = [];
          }
        } else {
          try {
            const allGrammarSnapshot = await getDocs(
              query(collection(db, "grammar_patterns"), limit(50))
            );
            currentData = allGrammarSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(
              `📖 전체 문법 패턴 컬렉션에서 발견: ${currentData.length}개`
            );
          } catch (error) {
            console.error("전체 문법 패턴 컬렉션 조회 실패:", error);
            currentData = [];
          }
        }
        break;
      case "reading":
        // 예문 가져오기
        if (currentUser && currentUser.email) {
          console.log(`🔍 이메일로 예문 조회: ${currentUser.email}`);
          try {
            const exampleSnapshot = await getDocs(
              query(
                collection(db, "examples"),
                where("userId", "==", currentUser.email),
                limit(50)
              )
            );
            currentData = exampleSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(`🔍 이메일로 조회된 예문: ${currentData.length}개`);

            if (currentData.length === 0) {
              console.log("📚 전체 examples 컬렉션에서 조회 시도");
              const allExampleSnapshot = await getDocs(
                query(collection(db, "examples"), limit(50))
              );
              currentData = allExampleSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log(
                `📖 전체 예문 컬렉션에서 발견: ${currentData.length}개`
              );
            }
          } catch (error) {
            console.error("예문 조회 실패:", error);
            currentData = [];
          }
        } else {
          try {
            const allExampleSnapshot = await getDocs(
              query(collection(db, "examples"), limit(50))
            );
            currentData = allExampleSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(
              `📖 전체 예문 컬렉션에서 발견: ${currentData.length}개`
            );
          } catch (error) {
            console.error("전체 예문 컬렉션 조회 실패:", error);
            currentData = [];
          }
        }
        break;
    }

    console.log(`✅ ${area} 데이터 로드 완료: ${currentData.length}개`);

    if (currentData.length === 0) {
      console.log(
        `📝 ${area} 학습 데이터가 없습니다. 업로드 안내를 표시합니다.`
      );
      showNoDataMessage(area);
    }
  } catch (error) {
    console.error("❌ 데이터 로드 중 오류:", error);
    currentData = [];
    showNoDataMessage(area);
  }
}

// 데이터가 없을 때 안내 메시지 표시
function showNoDataMessage(area) {
  const areaNames = {
    vocabulary: "단어",
    grammar: "문법 패턴",
    reading: "예문",
  };

  const message = `${areaNames[area]} 학습 데이터가 없습니다.\n\n학습 모드 선택 화면의 '데이터 업로드' 버튼을 사용하여 CSV/JSON 파일을 업로드하거나,\n다국어 단어장 페이지에서 개념을 추가해보세요.`;

  alert(message);

  // 학습 모드 선택 화면으로 돌아가기
  showLearningModes(area);
}

// 모든 섹션 숨기기
function hideAllSections() {
  const sections = [
    "learning-mode-section",
    "flashcard-container",
    "typing-container",
    "grammar-container",
    "reading-container",
  ];

  sections.forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });

  // 업로드 버튼 숨기기
  const uploadBtn = document.getElementById("upload-for-mode");
  if (uploadBtn) {
    uploadBtn.classList.add("hidden");
  }

  // 인라인 업로드 섹션 숨기기
  const uploadSection = document.getElementById("mode-upload-section");
  if (uploadSection) {
    uploadSection.classList.add("hidden");
  }
}

// 업로드 모달 표시
function showUploadModal(type) {
  document.getElementById(`${type}-upload-modal`).classList.remove("hidden");
}

// 업로드 모달 숨기기
function hideUploadModal(type) {
  document.getElementById(`${type}-upload-modal`).classList.add("hidden");
}

// 인라인 업로드 UI 토글
function toggleInlineUpload(type) {
  const sectionId = `${type}-upload-section`;
  const section = document.getElementById(sectionId);

  if (section) {
    if (section.classList.contains("hidden")) {
      section.classList.remove("hidden");
      console.log(`📂 ${type} 업로드 섹션 표시`);
    } else {
      section.classList.add("hidden");
      console.log(`📂 ${type} 업로드 섹션 숨김`);
    }
  }
}

// 학습 모드 선택에서 파일 업로드 처리
async function handleModeFileUpload() {
  const fileInput = document.getElementById("mode-file-input");
  console.log("📁 파일 입력 요소:", fileInput);
  console.log("📁 선택된 파일들:", fileInput?.files);
  console.log("📁 파일 개수:", fileInput?.files?.length);

  const file = fileInput.files[0];
  console.log("📁 첫 번째 파일:", file);

  if (!file) {
    console.log("❌ 파일이 선택되지 않았습니다");
    alert("파일을 선택해주세요.");
    return;
  }

  try {
    console.log("📁 파일 상세 정보:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
    });

    console.log(
      `📁 ${currentLearningArea} 모드 파일 업로드 시작: ${file.name}`
    );

    const text = await file.text();
    let data;

    if (file.name.endsWith(".json")) {
      data = JSON.parse(text);
    } else if (file.name.endsWith(".csv")) {
      data = parseCSV(text);
    } else {
      throw new Error("지원하지 않는 파일 형식입니다.");
    }

    console.log(`📊 파싱된 데이터: ${data.length}개 항목`);

    // 데이터 업로드
    let uploadedCount = 0;
    let failedCount = 0;

    console.log(
      `📤 ${currentLearningArea} 업로드 시작 - 총 ${data.length}개 항목`
    );
    console.log(`📋 업로드할 데이터 샘플:`, data.slice(0, 2));

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        console.log(`📤 ${i + 1}/${data.length} 항목 업로드 중:`, item);

        let result;
        let transformedItem;

        switch (currentLearningArea) {
          case "vocabulary":
            // CSV에서 받은 데이터를 concepts 형식으로 변환
            transformedItem = {
              concept_info: {
                domain: item.domain || "daily",
                category: item.category || "uncategorized",
                difficulty: item.difficulty || "beginner",
                unicode_emoji: item.unicode_emoji || "📝",
                color_theme: item.color_theme || "#9C27B0",
                tags: item.tags
                  ? typeof item.tags === "string"
                    ? item.tags.split(",").map((t) => t.trim())
                    : item.tags
                  : [],
                updated_at: new Date(),
              },
              expressions: {
                korean: {
                  word: item.korean_word || "",
                  pronunciation: item.korean_pronunciation || "",
                  definition: item.korean_definition || "",
                  part_of_speech: item.korean_part_of_speech || "명사",
                  level: item.korean_level || "beginner",
                  synonyms: item.korean_synonyms
                    ? typeof item.korean_synonyms === "string"
                      ? item.korean_synonyms.split(",").map((s) => s.trim())
                      : item.korean_synonyms
                    : [],
                  antonyms: [],
                  word_family: item.korean_word_family
                    ? typeof item.korean_word_family === "string"
                      ? item.korean_word_family.split(",").map((w) => w.trim())
                      : item.korean_word_family
                    : [],
                  compound_words: item.korean_compound_words
                    ? typeof item.korean_compound_words === "string"
                      ? item.korean_compound_words
                          .split(",")
                          .map((c) => c.trim())
                      : item.korean_compound_words
                    : [],
                  collocations: item.korean_collocations
                    ? typeof item.korean_collocations === "string"
                      ? item.korean_collocations.split(",").map((c) => c.trim())
                      : item.korean_collocations
                    : [],
                },
                english: {
                  word: item.english_word || "",
                  pronunciation: item.english_pronunciation || "",
                  definition: item.english_definition || "",
                  part_of_speech: item.english_part_of_speech || "noun",
                  level: item.english_level || "beginner",
                  synonyms: item.english_synonyms
                    ? typeof item.english_synonyms === "string"
                      ? item.english_synonyms.split(",").map((s) => s.trim())
                      : item.english_synonyms
                    : [],
                  antonyms: [],
                  word_family: item.english_word_family
                    ? typeof item.english_word_family === "string"
                      ? item.english_word_family.split(",").map((w) => w.trim())
                      : item.english_word_family
                    : [],
                  compound_words: item.english_compound_words
                    ? typeof item.english_compound_words === "string"
                      ? item.english_compound_words
                          .split(",")
                          .map((c) => c.trim())
                      : item.english_compound_words
                    : [],
                  collocations: item.english_collocations
                    ? typeof item.english_collocations === "string"
                      ? item.english_collocations
                          .split(",")
                          .map((c) => c.trim())
                      : item.english_collocations
                    : [],
                },
                chinese: {
                  word: item.chinese_word || "",
                  pronunciation: item.chinese_pronunciation || "",
                  definition: item.chinese_definition || "",
                  part_of_speech: item.chinese_part_of_speech || "名词",
                  level: item.chinese_level || "beginner",
                  synonyms: item.chinese_synonyms
                    ? typeof item.chinese_synonyms === "string"
                      ? item.chinese_synonyms.split(",").map((s) => s.trim())
                      : item.chinese_synonyms
                    : [],
                  antonyms: [],
                  word_family: item.chinese_word_family
                    ? typeof item.chinese_word_family === "string"
                      ? item.chinese_word_family.split(",").map((w) => w.trim())
                      : item.chinese_word_family
                    : [],
                  compound_words: item.chinese_compound_words
                    ? typeof item.chinese_compound_words === "string"
                      ? item.chinese_compound_words
                          .split(",")
                          .map((c) => c.trim())
                      : item.chinese_compound_words
                    : [],
                  collocations: item.chinese_collocations
                    ? typeof item.chinese_collocations === "string"
                      ? item.chinese_collocations
                          .split(",")
                          .map((c) => c.trim())
                      : item.chinese_collocations
                    : [],
                },
                japanese: {
                  word: item.japanese_word || "",
                  pronunciation: item.japanese_pronunciation || "",
                  definition: item.japanese_definition || "",
                  part_of_speech: item.japanese_part_of_speech || "名詞",
                  level: item.japanese_level || "beginner",
                  synonyms: item.japanese_synonyms
                    ? typeof item.japanese_synonyms === "string"
                      ? item.japanese_synonyms.split(",").map((s) => s.trim())
                      : item.japanese_synonyms
                    : [],
                  antonyms: [],
                  word_family: item.japanese_word_family
                    ? typeof item.japanese_word_family === "string"
                      ? item.japanese_word_family
                          .split(",")
                          .map((w) => w.trim())
                      : item.japanese_word_family
                    : [],
                  compound_words: item.japanese_compound_words
                    ? typeof item.japanese_compound_words === "string"
                      ? item.japanese_compound_words
                          .split(",")
                          .map((c) => c.trim())
                      : item.japanese_compound_words
                    : [],
                  collocations: item.japanese_collocations
                    ? typeof item.japanese_collocations === "string"
                      ? item.japanese_collocations
                          .split(",")
                          .map((c) => c.trim())
                      : item.japanese_collocations
                    : [],
                },
              },
              representative_example:
                item.example_korean && item.example_english
                  ? {
                      translations: {
                        korean: item.example_korean,
                        english: item.example_english,
                        chinese: item.example_chinese || "",
                        japanese: item.example_japanese || "",
                      },
                      context: item.example_context || "daily_conversation",
                      difficulty: item.example_difficulty || "beginner",
                    }
                  : null,
              userId: currentUser.email,
            };
            result = await conceptUtils.createConcept(transformedItem);
            console.log(`✅ vocabulary 업로드 성공:`, result);
            break;

          case "grammar":
            // CSV에서 받은 데이터를 grammar_patterns 형식으로 변환
            transformedItem = {
              pattern: item.pattern || "",
              description: item.description || "",
              example: item.example || "",
              translation: item.translation || "",
              level: item.level || "beginner",
              tags: item.tags
                ? typeof item.tags === "string"
                  ? item.tags.split(",").map((t) => t.trim())
                  : item.tags
                : [],
              userId: currentUser.email,
            };
            result = await grammarPatternUtils.createGrammarPattern(
              transformedItem
            );
            console.log(`✅ grammar 업로드 성공:`, result);
            break;

          case "reading":
            // CSV에서 받은 데이터를 examples 형식으로 변환
            transformedItem = {
              original: item.original || "",
              translation: item.translation || "",
              explanation: item.explanation || "",
              level: item.level || "beginner",
              tags: item.tags
                ? typeof item.tags === "string"
                  ? item.tags.split(",").map((t) => t.trim())
                  : item.tags
                : [],
              userId: currentUser.email,
            };
            result = await exampleUtils.createExample(transformedItem);
            console.log(`✅ reading 업로드 성공:`, result);
            break;
        }
        uploadedCount++;
      } catch (error) {
        console.error(`❌ ${i + 1}/${data.length} 항목 업로드 실패:`, error);
        console.error("실패한 항목:", item);
        failedCount++;
      }
    }

    console.log(
      `📊 업로드 완료 - 성공: ${uploadedCount}, 실패: ${failedCount}`
    );

    alert(`업로드가 완료되었습니다. (${uploadedCount}/${data.length}개 성공)`);

    // 업로드 섹션 숨기기
    toggleInlineUpload("mode");
    fileInput.value = "";

    // 데이터 새로고침
    console.log("🔄 데이터 새로고침 시작");
    await loadLearningData(currentLearningArea);

    // 데이터가 있으면 업로드 안내 메시지 표시
    if (currentData.length > 0) {
      alert(
        `${currentData.length}개의 데이터가 로드되었습니다. 이제 학습 모드를 선택해주세요.`
      );
    }
  } catch (error) {
    console.error("❌ 업로드 중 오류:", error);
    alert("업로드 중 오류가 발생했습니다: " + error.message);
  }
}

// 인라인 파일 업로드 처리
async function handleInlineFileUpload(type) {
  const fileInputId = `${type}-file-input`;
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput.files[0];

  if (!file) {
    alert("파일을 선택해주세요.");
    return;
  }

  try {
    console.log(`📁 ${type} 파일 업로드 시작: ${file.name}`);

    const text = await file.text();
    let data;

    if (file.name.endsWith(".json")) {
      data = JSON.parse(text);
    } else if (file.name.endsWith(".csv")) {
      data = parseCSV(text);
    } else {
      throw new Error("지원하지 않는 파일 형식입니다.");
    }

    console.log(`📊 파싱된 데이터: ${data.length}개 항목`);

    // 데이터 업로드
    let uploadedCount = 0;
    for (const item of data) {
      try {
        await conceptUtils.createConcept(item);
        uploadedCount++;
      } catch (error) {
        console.error("개별 항목 업로드 오류:", error);
      }
    }

    alert(`업로드가 완료되었습니다. (${uploadedCount}/${data.length}개 성공)`);

    // 업로드 섹션 숨기기
    toggleInlineUpload(type);
    fileInput.value = "";

    // 데이터 새로고침
    console.log("🔄 데이터 새로고침 시작");
    await loadLearningData(currentLearningArea);

    // 데이터가 있으면 학습 모드 다시 시작
    if (currentData.length > 0) {
      console.log("✅ 새 데이터로 학습 모드 재시작");
      hideAllSections();
      currentIndex = 0;

      if (currentLearningMode === "flashcard") {
        showFlashcardMode();
      } else if (currentLearningMode === "typing") {
        showTypingMode();
      }
    }
  } catch (error) {
    console.error("❌ 업로드 중 오류:", error);
    alert("업로드 중 오류가 발생했습니다: " + error.message);
  }
}

// 파일 업로드 처리 (기존 모달용)
async function handleFileUpload(type) {
  const fileInput = document.getElementById(`${type}-file-input`);
  const file = fileInput.files[0];

  if (!file) {
    alert("파일을 선택해주세요.");
    return;
  }

  try {
    const text = await file.text();
    let data;

    if (file.name.endsWith(".json")) {
      data = JSON.parse(text);
    } else if (file.name.endsWith(".csv")) {
      data = parseCSV(text);
    } else {
      throw new Error("지원하지 않는 파일 형식입니다.");
    }

    // 데이터 업로드
    for (const item of data) {
      switch (type) {
        case "concept":
          await conceptUtils.createConcept(item);
          break;
        case "grammar":
          await grammarPatternUtils.createGrammarPattern(item);
          break;
        case "example":
          await exampleUtils.createExample(item);
          break;
      }
    }

    alert("업로드가 완료되었습니다.");
    hideUploadModal(type);
    fileInput.value = "";
  } catch (error) {
    console.error("업로드 중 오류:", error);
    alert("업로드 중 오류가 발생했습니다: " + error.message);
  }
}

// CSV 파싱 (따옴표 안의 쉼표 처리)
function parseCSV(text) {
  console.log("📊 CSV 파싱 시작, 텍스트 길이:", text.length);
  console.log("📊 텍스트 샘플:", text.substring(0, 200));

  const lines = text.trim().split("\n");
  console.log("📊 라인 수:", lines.length);

  if (lines.length < 2) {
    console.log("❌ CSV 데이터가 충분하지 않습니다");
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  console.log("📊 헤더:", headers);

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;

    const values = parseCSVLine(lines[i]);
    console.log(`📊 라인 ${i} 파싱 결과:`, values);

    const item = {};
    headers.forEach((header, index) => {
      item[header.trim()] = values[index]?.trim() || "";
    });

    console.log(`📊 생성된 항목 ${i}:`, item);
    data.push(item);
  }

  console.log("📊 최종 파싱 결과:", data);
  return data;
}

// CSV 라인 파싱 (따옴표 안의 쉼표 처리)
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// 템플릿 다운로드
function downloadTemplate(type) {
  let template;
  let filename;

  switch (type) {
    case "concept":
      template = `domain,category,difficulty,unicode_emoji,color_theme,tags,korean_word,korean_pronunciation,korean_definition,korean_part_of_speech,korean_level,korean_synonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_part_of_speech,english_level,english_synonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_part_of_speech,chinese_level,chinese_synonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_part_of_speech,japanese_level,japanese_synonyms,japanese_word_family,japanese_compound_words,japanese_collocations,example_korean,example_english,example_chinese,example_japanese,example_context,example_difficulty
daily,fruit,beginner,🍎,#FF6B6B,"food,healthy,common",사과,sa-gwa,둥글고 빨간 과일,명사,beginner,능금,"과일,음식","사과나무,사과즙","빨간 사과,맛있는 사과",apple,/ˈæpəl/,a round fruit with red or green skin,noun,beginner,,"fruit,food","apple tree,apple juice","red apple,fresh apple",苹果,píng guǒ,圆形的红色或绿色水果,名词,beginner,苹子,"水果,食物","苹果树,苹果汁","红苹果,新鲜苹果",りんご,ringo,赤いまたは緑色の丸い果物,名詞,beginner,アップル,"果物,食べ物","りんごの木,りんごジュース","赤いりんご,新鮮なりんご",나는 빨간 사과를 좋아한다.,I like red apples.,我喜欢红苹果。,私は赤いりんごが好きです。,daily_conversation,beginner`;
      filename = "concept_template.csv";
      break;
    case "grammar":
      template = `pattern,description,example,translation,level,tags
-고 있다,현재 진행형 표현,나는 공부하고 있다,I am studying,beginner,grammar,present`;
      filename = "grammar_template.csv";
      break;
    case "example":
      template = `original,translation,explanation,level,tags
안녕하세요,Hello,기본적인 인사 표현,beginner,"greeting,basic"
오늘 날씨가 좋네요,The weather is nice today,날씨에 관한 일상 표현,beginner,"weather,conversation"`;
      filename = "example_template.csv";
      break;
  }

  const blob = new Blob([template], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 플래시카드 기능들
function showFlashcardMode() {
  document.getElementById("flashcard-container").classList.remove("hidden");
  updateFlashcard();
}

function updateFlashcard() {
  if (currentData.length === 0) return;

  const concept = currentData[currentIndex];
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  console.log("🃏 플래시카드 업데이트:", {
    concept,
    sourceLanguage,
    targetLanguage,
    index: currentIndex,
  });

  document.getElementById("card-category").textContent =
    concept.concept_info?.category || concept.category || "일반";
  document.getElementById("front-word").textContent =
    concept.expressions?.[sourceLanguage]?.word || "";
  document.getElementById("front-pronunciation").textContent =
    concept.expressions?.[sourceLanguage]?.pronunciation || "";

  document.getElementById("back-word").textContent =
    concept.expressions?.[targetLanguage]?.word || "";
  document.getElementById("back-pronunciation").textContent =
    concept.expressions?.[targetLanguage]?.pronunciation || "";
  document.getElementById("back-definition").textContent =
    concept.expressions?.[targetLanguage]?.definition || "";

  document.getElementById("card-progress").textContent = `${currentIndex + 1}/${
    currentData.length
  }`;
}

function flipCard() {
  const card = document.querySelector(".flip-card");
  card.classList.toggle("flipped");
}

function navigateCard(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = currentData.length - 1;
  if (currentIndex >= currentData.length) currentIndex = 0;

  const card = document.querySelector(".flip-card");
  card.classList.remove("flipped");

  updateFlashcard();
}

// 타이핑 기능들
function showTypingMode() {
  document.getElementById("typing-container").classList.remove("hidden");
  updateTyping();
}

function updateTyping() {
  if (currentData.length === 0) return;

  const concept = currentData[currentIndex];
  const sourceLanguage = document.getElementById("source-language").value;

  console.log("⌨️ 타이핑 업데이트:", {
    concept,
    sourceLanguage,
    index: currentIndex,
  });

  document.getElementById("typing-category").textContent =
    concept.concept_info?.category || concept.category || "일반";
  document.getElementById("typing-word").textContent =
    concept.expressions?.[sourceLanguage]?.word || "";
  document.getElementById("typing-pronunciation").textContent =
    concept.expressions?.[sourceLanguage]?.pronunciation || "";

  document.getElementById("typing-answer").value = "";
  document.getElementById("typing-result").classList.add("hidden");
  document.getElementById("next-typing").classList.add("hidden");

  document.getElementById("typing-progress").textContent = `${
    currentIndex + 1
  }/${currentData.length}`;
}

function checkTypingAnswer() {
  const userAnswer = document.getElementById("typing-answer").value.trim();
  const concept = currentData[currentIndex];
  const targetLanguage = document.getElementById("target-language").value;
  const correctAnswer = concept.expressions?.[targetLanguage]?.word || "";

  const resultDiv = document.getElementById("typing-result");

  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    resultDiv.className = "mt-4 p-4 rounded bg-green-100 text-green-800";
    resultDiv.textContent = "정답입니다!";
  } else {
    resultDiv.className = "mt-4 p-4 rounded bg-red-100 text-red-800";
    resultDiv.textContent = `틀렸습니다. 정답: ${correctAnswer}`;
  }

  resultDiv.classList.remove("hidden");
  document.getElementById("next-typing").classList.remove("hidden");
}

function nextTypingQuestion() {
  currentIndex++;
  if (currentIndex >= currentData.length) {
    alert("모든 문제를 완료했습니다!");
    showLearningModes(currentLearningArea);
    return;
  }

  updateTyping();
}

// 문법 기능들
function showGrammarPatternMode() {
  document.getElementById("grammar-container").classList.remove("hidden");
  updateGrammarPatterns();
}

function showGrammarExerciseMode() {
  document.getElementById("grammar-container").classList.remove("hidden");
  updateGrammarExercise();
}

function updateGrammarPatterns() {
  if (currentData.length === 0) return;

  const container = document.getElementById("grammar-pattern-container");

  console.log("📝 문법 패턴들 업데이트:", {
    patterns: currentData,
    count: currentData.length,
  });

  // 모든 패턴을 작은 카드 그리드로 표시
  const patternCards = currentData
    .map(
      (pattern, index) => `
    <div class="p-4 border-l-4 border-green-500 hover:bg-gray-50 transition-all">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              ${pattern.level || "중급"}
            </span>
            <span class="text-xs text-gray-500">#${index + 1}</span>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">${
            pattern.pattern || "문법 패턴"
          }</h3>
          <p class="text-sm text-gray-600 line-clamp-2">${
            pattern.description || ""
          }</p>
        </div>
      </div>
      
      <div class="space-y-3">
        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="font-semibold text-gray-700 mb-1 text-sm flex items-center">
            <i class="fas fa-quote-left mr-1 text-gray-500 text-xs"></i>예문
          </h4>
          <p class="text-sm text-gray-800 line-clamp-2">${
            pattern.example || ""
          }</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-semibold text-gray-700 mb-1 text-sm flex items-center">
            <i class="fas fa-language mr-1 text-blue-500 text-xs"></i>번역
          </h4>
          <p class="text-sm text-gray-800 line-clamp-2">${
            pattern.translation || ""
          }</p>
        </div>
      </div>
      
      ${
        pattern.tags &&
        (Array.isArray(pattern.tags)
          ? pattern.tags.length > 0
          : pattern.tags.trim().length > 0)
          ? `
        <div class="mt-3 pt-3 border-t border-gray-200">
          <div class="flex flex-wrap gap-1">
            ${(Array.isArray(pattern.tags)
              ? pattern.tags
              : pattern.tags.split(",").map((t) => t.trim())
            )
              .map(
                (tag) => `
              <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${tag}</span>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">문법 패턴 학습</h2>
        <p class="text-gray-600">총 ${currentData.length}개의 문법 패턴</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${patternCards}
      </div>
    </div>
  `;

  document.getElementById(
    "grammar-progress"
  ).textContent = `${currentData.length}개 패턴 표시 중`;
}

function updateGrammarExercise() {
  if (currentData.length === 0) return;

  const pattern = currentData[currentIndex];
  const container = document.getElementById("grammar-pattern-container");

  console.log("📝 문법 실습 업데이트:", {
    pattern,
    index: currentIndex,
  });

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="text-center mb-4">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            실습 문제 ${currentIndex + 1}/${currentData.length}
          </span>
        </div>
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">${
            pattern.pattern || "문법 패턴"
          }</h3>
          <p class="text-gray-600">${pattern.description || ""}</p>
        </div>
        
        <div class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-700 mb-2">📝 문제</h4>
            <p class="text-lg">다음 패턴을 사용하여 문장을 완성하세요:</p>
            <p class="text-xl font-bold text-blue-600 mt-2">${
              pattern.pattern || ""
            }</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-700 mb-2">💡 힌트</h4>
            <p class="text-gray-700">${pattern.example || ""}</p>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-700 mb-2">🌐 참고 번역</h4>
            <p class="text-gray-700">${pattern.translation || ""}</p>
          </div>
        </div>
        
        <div class="flex justify-center space-x-4 mt-8">
          <button onclick="navigateGrammarExercise(-1)" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg">
            <i class="fas fa-arrow-left mr-2"></i>이전
          </button>
          <button onclick="navigateGrammarExercise(1)" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            다음<i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("grammar-progress").textContent = `${
    currentIndex + 1
  }/${currentData.length}`;
}

function navigateGrammarExercise(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = currentData.length - 1;
  if (currentIndex >= currentData.length) currentIndex = 0;

  updateGrammarExercise();
}

// 독해 기능들
function showReadingMode() {
  document.getElementById("reading-container").classList.remove("hidden");
  updateReading();
}

function updateReading() {
  if (currentData.length === 0) return;

  const example = currentData[currentIndex];
  const container = document.getElementById("reading-example-container");

  console.log("📖 독해 업데이트:", {
    example,
    index: currentIndex,
    mode: currentLearningMode,
  });

  let content = "";

  switch (currentLearningMode) {
    case "comprehension":
      // 예문 이해 - 원문과 번역 모두 표시
      content = `
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold mb-4">📚 예문 이해</h3>
          <p class="text-gray-600">원문과 번역을 함께 보며 이해하세요</p>
        </div>
        <div class="space-y-6">
          <div class="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-blue-800 flex items-center">
              <i class="fas fa-quote-left mr-2"></i>원문
            </h4>
            <p class="text-lg leading-relaxed text-gray-800">${
              example.original || ""
            }</p>
          </div>
          <div class="border-l-4 border-green-500 bg-green-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-green-800 flex items-center">
              <i class="fas fa-language mr-2"></i>번역
            </h4>
            <p class="text-lg leading-relaxed text-gray-800">${
              example.translation || ""
            }</p>
          </div>
          <div class="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-purple-800 flex items-center">
              <i class="fas fa-lightbulb mr-2"></i>설명
            </h4>
            <p class="text-md leading-relaxed text-gray-700">${
              example.explanation || "문장의 구조와 의미를 파악해보세요."
            }</p>
          </div>
        </div>
      `;
      break;

    case "context":
      // 맥락 학습 - 설명과 원문 중심
      content = `
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold mb-4">🔍 맥락 학습</h3>
          <p class="text-gray-600">문맥과 상황을 이해하며 학습하세요</p>
        </div>
        <div class="space-y-6">
          <div class="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-yellow-800 flex items-center">
              <i class="fas fa-info-circle mr-2"></i>상황 설명
            </h4>
            <p class="text-md leading-relaxed text-gray-700">${
              example.explanation || "이 표현이 사용되는 상황을 생각해보세요."
            }</p>
          </div>
          <div class="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-blue-800 flex items-center">
              <i class="fas fa-quote-left mr-2"></i>예문
            </h4>
            <p class="text-lg leading-relaxed text-gray-800">${
              example.original || ""
            }</p>
          </div>
          <div class="border-l-4 border-gray-500 bg-gray-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-gray-800 flex items-center">
              <i class="fas fa-level-up-alt mr-2"></i>레벨
            </h4>
            <p class="text-sm text-gray-600">난이도: ${
              example.level || "초급"
            }</p>
            ${
              example.tags && example.tags.length > 0
                ? `
              <div class="flex flex-wrap gap-2 mt-2">
                ${(Array.isArray(example.tags)
                  ? example.tags
                  : example.tags.split(",").map((t) => t.trim())
                )
                  .map(
                    (tag) => `
                  <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">${tag}</span>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;
      break;

    case "practice":
      // 독해 연습 - 단계적 노출
      content = `
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold mb-4">💪 독해 연습</h3>
          <p class="text-gray-600">단계별로 해석해보며 실력을 키워보세요</p>
        </div>
        <div class="space-y-6">
          <div class="border-l-4 border-red-500 bg-red-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-red-800 flex items-center">
              <i class="fas fa-eye mr-2"></i>1단계: 원문 읽기
            </h4>
            <p class="text-lg leading-relaxed text-gray-800 mb-4">${
              example.original || ""
            }</p>
            <details class="mt-4">
              <summary class="cursor-pointer text-sm text-red-600 hover:text-red-800 font-medium">💡 힌트 보기</summary>
              <p class="mt-2 text-sm text-gray-600">${
                example.explanation || "문장의 핵심 의미를 찾아보세요."
              }</p>
            </details>
          </div>
          <div class="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-orange-800 flex items-center">
              <i class="fas fa-brain mr-2"></i>2단계: 해석 생각하기
            </h4>
            <p class="text-md text-gray-600 mb-3">위 문장의 의미를 스스로 생각해보세요.</p>
            <details>
              <summary class="cursor-pointer text-sm text-orange-600 hover:text-orange-800 font-medium">✅ 정답 확인</summary>
              <div class="mt-3 p-3 bg-white rounded border">
                <p class="text-lg text-gray-800">${
                  example.translation || ""
                }</p>
              </div>
            </details>
          </div>
          <div class="border-l-4 border-green-500 bg-green-50 rounded-lg p-6">
            <h4 class="font-semibold mb-3 text-green-800 flex items-center">
              <i class="fas fa-check-circle mr-2"></i>3단계: 완전 이해
            </h4>
            <p class="text-md text-gray-600">이제 전체 문장을 완전히 이해했는지 확인해보세요.</p>
            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-sm text-gray-700 mb-1">원문</h5>
                <p class="text-gray-800">${example.original || ""}</p>
              </div>
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-sm text-gray-700 mb-1">의미</h5>
                <p class="text-gray-800">${example.translation || ""}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      break;

    default:
      // 기본 모드
      content = `
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold mb-4">예문 독해</h3>
        </div>
        <div class="space-y-6">
          <div class="border rounded-lg p-6">
            <h4 class="font-semibold mb-3">원문</h4>
            <p class="text-lg leading-relaxed">${example.original || ""}</p>
          </div>
          <div class="border rounded-lg p-6">
            <h4 class="font-semibold mb-3">번역</h4>
            <p class="text-lg leading-relaxed">${example.translation || ""}</p>
          </div>
          ${
            example.explanation
              ? `
            <div class="border rounded-lg p-6 bg-blue-50">
              <h4 class="font-semibold mb-3">해설</h4>
              <p class="text-gray-700">${example.explanation}</p>
            </div>
          `
              : ""
          }
        </div>
      `;
      break;
  }

  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      ${content}
    </div>
  `;

  document.getElementById("reading-progress").textContent = `${
    currentIndex + 1
  }/${currentData.length}`;
}

function navigateReading(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = currentData.length - 1;
  if (currentIndex >= currentData.length) currentIndex = 0;

  updateReading();
}

// 전역 함수로 노출
window.startLearningMode = startLearningMode;
