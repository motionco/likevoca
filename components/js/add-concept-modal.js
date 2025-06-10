import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 전역 변수
let isEditMode = false;
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

// 언어별 기본 품사 값 반환
function getDefaultPartOfSpeech(langCode) {
  const defaults = {
    korean: "명사",
    english: "noun",
    japanese: "名詞",
    chinese: "名词",
  };
  return defaults[langCode] || "명사";
}

// 품사를 대상 언어로 번역
function translatePartOfSpeech(originalPos, targetLang) {
  console.log(
    `🔄 translatePartOfSpeech 호출: "${originalPos}" -> ${targetLang}`
  );

  const posMap = {
    // 한국어 품사들
    명사: "noun_base",
    동사: "verb_base",
    형용사: "adjective_base",
    부사: "adverb_base",

    // 영어 품사들
    noun: "noun_base",
    verb: "verb_base",
    adjective: "adjective_base",
    adverb: "adverb_base",

    // 일본어 품사들
    名詞: "noun_base",
    動詞: "verb_base",
    形容詞: "adjective_base",
    副詞: "adverb_base",

    // 중국어 품사들
    名词: "noun_base",
    动词: "verb_base",
    形容词: "adjective_base",
    副词: "adverb_base",
  };

  const targetMap = {
    noun_base: {
      korean: "명사",
      english: "noun",
      japanese: "名詞",
      chinese: "名词",
    },
    verb_base: {
      korean: "동사",
      english: "verb",
      japanese: "動詞",
      chinese: "动词",
    },
    adjective_base: {
      korean: "형용사",
      english: "adjective",
      japanese: "形容詞",
      chinese: "形容词",
    },
    adverb_base: {
      korean: "부사",
      english: "adverb",
      japanese: "副詞",
      chinese: "副词",
    },
  };

  // 원본 품사를 기본형으로 매핑
  const basePos = posMap[originalPos];
  console.log(`📍 매핑된 기본형: "${originalPos}" -> "${basePos}"`);

  if (!basePos) {
    console.warn(`⚠️ 알 수 없는 품사: "${originalPos}", 기본값 사용`);
    return getDefaultPartOfSpeech(targetLang);
  }

  // 기본형을 대상 언어로 번역
  const translated = targetMap[basePos]?.[targetLang];
  console.log(`🎯 최종 번역: "${basePos}" -> ${targetLang} = "${translated}"`);

  if (!translated) {
    console.warn(`⚠️ 번역 실패: "${basePos}" -> ${targetLang}, 기본값 사용`);
    return getDefaultPartOfSpeech(targetLang);
  }

  return translated;
}

export async function initialize() {
  console.log("개념 추가 모달 초기화");

  // 모달 요소
  const modal = document.getElementById("concept-modal");
  const closeBtn = document.getElementById("close-concept-modal");
  const saveBtn = document.getElementById("save-concept");
  const cancelBtn = document.getElementById("cancel-concept");
  const resetBtn = document.getElementById("reset-concept-form");
  const addExampleBtn = document.getElementById("add-example");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (event) => {
      event.preventDefault(); // 폼 기본 제출 동작 방지
      console.log("💾 저장 버튼 클릭됨, 기본 동작 방지됨");
      saveConcept();
    });
  }

  // 폼 자체의 submit 이벤트도 방지
  const conceptForm = document.getElementById("concept-form");
  if (conceptForm) {
    conceptForm.addEventListener("submit", (event) => {
      event.preventDefault(); // 폼 제출 방지
      console.log("📝 폼 제출 시도됨, 기본 동작 방지됨");
      saveConcept();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  if (addExampleBtn) {
    addExampleBtn.addEventListener("click", () => {
      console.log("➕ 예문 추가 버튼 클릭");
      addExampleFields(null, false); // false = 일반 예문 (삭제 가능)
    });
  }

  // 세션에서 수정 모드 확인은 모달이 실제로 열릴 때만 수행
  // 초기화 시에는 수행하지 않음

  // 현재 사용자의 환경 설정 언어 가져오기
  const userLanguage = await getActiveLanguage();
  console.log("🌍 사용자 환경 설정 언어:", userLanguage);

  // HTML 정적 레이블들을 환경 설정 언어로 업데이트
  await updateStaticLabels(userLanguage);

  // 지원 언어 탭 초기화
  initLanguageTabEventListeners();
}

async function fetchConceptForEdit(conceptId) {
  try {
    console.log("🔥 fetchConceptForEdit 함수 호출됨!");
    console.log("📋 편집용 개념 데이터 가져오기:", conceptId);

    // 여러 방법으로 메모리에서 개념 데이터 찾기
    let conceptData = null;

    // 방법 1: window.currentConcepts 확인
    if (window.currentConcepts && window.currentConcepts.length > 0) {
      conceptData = window.currentConcepts.find(
        (concept) =>
          concept.concept_id === conceptId ||
          concept.id === conceptId ||
          concept._id === conceptId
      );
      console.log(
        "💾 window.currentConcepts에서 찾기:",
        conceptData ? "성공" : "실패"
      );
    }

    // 방법 2: window.allConcepts 확인 (multilingual-dictionary.js에서 사용)
    if (!conceptData && window.allConcepts && window.allConcepts.length > 0) {
      conceptData = window.allConcepts.find(
        (concept) =>
          concept.concept_id === conceptId ||
          concept.id === conceptId ||
          concept._id === conceptId
      );
      console.log(
        "💾 window.allConcepts에서 찾기:",
        conceptData ? "성공" : "실패"
      );
    }

    // 방법 3: 전역에서 allConcepts 변수 확인
    if (
      !conceptData &&
      typeof allConcepts !== "undefined" &&
      allConcepts.length > 0
    ) {
      conceptData = allConcepts.find(
        (concept) =>
          concept.concept_id === conceptId ||
          concept.id === conceptId ||
          concept._id === conceptId
      );
      console.log(
        "💾 전역 allConcepts에서 찾기:",
        conceptData ? "성공" : "실패"
      );
    }

    if (conceptData) {
      console.log("✅ 메모리에서 찾은 데이터 사용:", {
        concept_id: conceptData.concept_id,
        id: conceptData.id,
        hasExpressions: !!conceptData.expressions,
        hasConceptInfo: !!conceptData.concept_info,
      });
      fillFormWithConceptData(conceptData);
      return;
    }

    console.log("🔍 메모리에서 찾지 못함, Firebase 조회 시도...");

    // Firebase 인덱스 오류를 우회하기 위해 직접 documents 조회 사용
    try {
      if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();
        // 인덱스가 필요 없는 단일 문서 조회
        const conceptDoc = await db.collection("concepts").doc(conceptId).get();

        if (conceptDoc.exists) {
          conceptData = { concept_id: conceptId, ...conceptDoc.data() };
          console.log(
            "🔥 Firebase 단일 문서 조회 성공:",
            conceptData.concept_id
          );
          fillFormWithConceptData(conceptData);
          return;
        }
      }
    } catch (firebaseError) {
      console.warn("⚠️ Firebase 단일 문서 조회 실패:", firebaseError.message);
    }

    // 모든 방법이 실패했을 때
    console.error("❌ 모든 방법으로 개념을 찾을 수 없음");
    alert(
      "개념 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
    );
  } catch (error) {
    console.error("개념 정보를 가져오는 중 오류 발생:", error);
    alert("개념 정보를 불러올 수 없습니다.");
  }
}

function fillFormWithConceptData(conceptData) {
  console.log("🔥 fillFormWithConceptData 함수 호출됨!");
  console.log("📝 받은 전체 데이터:", JSON.stringify(conceptData, null, 2));
  console.log("📝 expressions 데이터:", conceptData.expressions);

  // 예문 컨테이너 존재 확인
  const examplesContainerCheck = document.getElementById("examples-container");
  console.log("📋 examples-container 상태:", {
    found: !!examplesContainerCheck,
    innerHTML: examplesContainerCheck
      ? examplesContainerCheck.innerHTML.length
      : 0,
  });

  // 개념 정보 채우기
  const domainField = document.getElementById("concept-domain");
  const categoryField = document.getElementById("concept-category");
  const emojiField = document.getElementById("concept-emoji");

  if (domainField) {
    domainField.value = conceptData.concept_info?.domain || "";
  }
  if (categoryField) {
    categoryField.value = conceptData.concept_info?.category || "";
  }
  if (emojiField) {
    emojiField.value =
      conceptData.concept_info?.emoji ||
      conceptData.concept_info?.unicode_emoji ||
      "";
  }

  // 표현 정보 채우기
  if (conceptData.expressions) {
    console.log("📝 표현 정보 채우기 시작:", conceptData.expressions);
    for (const [lang, expression] of Object.entries(conceptData.expressions)) {
      console.log(`🌍 ${lang} 표현 처리:`, expression);
      const wordField = document.getElementById(`${lang}-word`);
      const pronunciationField = document.getElementById(
        `${lang}-pronunciation`
      );
      const definitionField = document.getElementById(`${lang}-definition`);
      const posField = document.getElementById(`${lang}-pos`);

      if (wordField) wordField.value = expression.word || "";
      if (pronunciationField)
        pronunciationField.value = expression.pronunciation || "";
      if (definitionField) definitionField.value = expression.definition || "";
      if (posField) {
        const originalPos = expression.part_of_speech || "명사";
        console.log(`🔍 원본 품사 데이터: ${lang} - "${originalPos}"`);

        // 원본 품사가 이미 해당 언어의 품사라면 그대로 사용, 아니면 번역
        let finalPos;

        // 현재 언어 탭에 맞는 품사인지 확인
        const currentLangOptions = Array.from(posField.options).map(
          (opt) => opt.value
        );
        console.log(`📋 ${lang} 탭 사용 가능한 품사 옵션:`, currentLangOptions);

        if (currentLangOptions.includes(originalPos)) {
          // 원본 품사가 현재 탭의 옵션에 있으면 그대로 사용
          finalPos = originalPos;
          console.log(`✅ 직접 매치: ${lang} - "${originalPos}"`);
        } else {
          // 번역 필요
          finalPos = translatePartOfSpeech(originalPos, lang);
          console.log(
            `🔄 번역 결과: ${lang} - "${originalPos}" -> "${finalPos}"`
          );
        }

        // 최종 값이 옵션에 있는지 확인
        if (currentLangOptions.includes(finalPos)) {
          posField.value = finalPos;
          console.log(`✅ 품사 설정 완료: ${lang} - "${finalPos}"`);
        } else {
          console.warn(`⚠️ 최종 품사가 옵션에 없음: ${lang} - "${finalPos}"`);
          finalPos = getDefaultPartOfSpeech(lang);
          posField.value = finalPos;
          console.log(`🔧 기본값으로 설정: ${lang} - "${finalPos}"`);
        }
      }

      // 고급 필드들 처리
      const synonymsField = document.getElementById(`${lang}-synonyms`);
      const antonymsField = document.getElementById(`${lang}-antonyms`);
      const collocationsField = document.getElementById(`${lang}-collocations`);
      const compoundWordsField = document.getElementById(
        `${lang}-compound-words`
      );

      if (synonymsField && expression.synonyms) {
        synonymsField.value = Array.isArray(expression.synonyms)
          ? expression.synonyms.join(", ")
          : expression.synonyms;
      }
      if (antonymsField && expression.antonyms) {
        antonymsField.value = Array.isArray(expression.antonyms)
          ? expression.antonyms.join(", ")
          : expression.antonyms;
      }
      if (collocationsField && expression.collocations) {
        collocationsField.value = Array.isArray(expression.collocations)
          ? expression.collocations.join(", ")
          : expression.collocations;
      }
      if (compoundWordsField && expression.compound_words) {
        compoundWordsField.value = Array.isArray(expression.compound_words)
          ? expression.compound_words.join(", ")
          : expression.compound_words;
      }
    }
  }

  // 예제 채우기 (representative_example 및 examples 모두 처리)
  const examplesContainer = document.getElementById("examples-container");
  if (examplesContainer) {
    // 기존 예제 필드들을 모두 지우고 다시 생성
    examplesContainer.innerHTML = "";

    let hasExamples = false;
    let representativeExampleProcessed = false;

    // 대표 예문 처리 (representative_example)
    if (conceptData.representative_example) {
      let repExample = null;

      console.log(
        "🔍 representative_example 구조 분석:",
        conceptData.representative_example
      );

      if (conceptData.representative_example.translations) {
        repExample = conceptData.representative_example.translations;
        console.log("📝 translations에서 대표 예문 추출:", repExample);
      } else if (
        conceptData.representative_example.korean ||
        conceptData.representative_example.english
      ) {
        repExample = conceptData.representative_example;
        console.log("📝 직접 구조에서 대표 예문 추출:", repExample);
      }

      if (
        repExample &&
        (repExample.korean ||
          repExample.english ||
          repExample.japanese ||
          repExample.chinese)
      ) {
        console.log("📝 대표 예문 추가 시도:", repExample);
        addExampleFields(repExample, true); // true = 대표 예문
        hasExamples = true;
        representativeExampleProcessed = true;
      } else {
        console.log("⚠️ 대표 예문 데이터를 추출할 수 없음");
      }
    }

    // 추가 예제들 처리 (examples 배열)
    if (
      conceptData.examples &&
      Array.isArray(conceptData.examples) &&
      conceptData.examples.length > 0
    ) {
      for (const example of conceptData.examples) {
        // 대표 예문과 동일한 내용이면 건너뛰기 (중복 방지)
        if (
          representativeExampleProcessed &&
          conceptData.representative_example
        ) {
          const repEx =
            conceptData.representative_example.translations ||
            conceptData.representative_example;
          if (
            (example.korean === repEx.korean &&
              example.english === repEx.english) ||
            (example.translations?.korean === repEx.korean &&
              example.translations?.english === repEx.english)
          ) {
            console.log("📝 중복된 예문 건너뛰기:", example);
            continue;
          }
        }

        console.log("📝 추가 예문 추가:", example);
        addExampleFields(example, false); // false = 일반 예문
        hasExamples = true;
      }
    }

    // 예문이 없으면 기본 대표 예문 필드 하나 추가
    if (!hasExamples) {
      console.log("📝 기본 예문 필드 추가");
      addExampleFields(null, true);
    }
  }

  // 태그 채우기
  const tagsField = document.getElementById("concept-tags");
  if (tagsField && conceptData.concept_info?.tags) {
    const tags = Array.isArray(conceptData.concept_info.tags)
      ? conceptData.concept_info.tags.join(", ")
      : conceptData.concept_info.tags;
    tagsField.value = tags;
  }

  // 모달 제목 변경
  const modalTitle = document.querySelector("#concept-modal h2");
  if (modalTitle) modalTitle.textContent = "개념 수정";

  // 저장 버튼 텍스트 변경
  const saveBtn = document.getElementById("save-concept");
  if (saveBtn) saveBtn.textContent = "수정하기";
}

// 언어 탭 이벤트 리스너 초기화
function initLanguageTabEventListeners() {
  const languageTabs = document.querySelectorAll(".edit-language-tab");

  languageTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetLanguage = tab.getAttribute("data-language");
      switchLanguageTab(targetLanguage);
    });
  });

  // 첫 번째 탭(한국어)을 기본 활성화
  switchLanguageTab("korean");
}

function switchLanguageTab(langCode) {
  console.log("🔄 언어 탭 전환:", langCode);

  // 편집 모달의 탭들만 대상으로 함
  const editModal = document.getElementById("concept-modal");
  if (!editModal) return;

  // 편집 모달 내의 모든 탭 비활성화
  editModal.querySelectorAll(".edit-language-tab").forEach((tab) => {
    tab.classList.remove("active", "border-blue-500", "text-blue-600");
    tab.classList.add("border-transparent", "text-gray-500");
  });

  // 편집 모달 내의 모든 콘텐츠 숨기기
  editModal.querySelectorAll(".language-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // 편집 모달에서 선택된 탭 활성화
  const selectedTab = editModal.querySelector(
    `.edit-language-tab[data-language="${langCode}"]`
  );
  if (selectedTab) {
    selectedTab.classList.add("active", "border-blue-500", "text-blue-600");
    selectedTab.classList.remove("border-transparent", "text-gray-500");
  }

  // 편집 모달에서 선택된 콘텐츠 표시
  const selectedContent = editModal.querySelector(`#${langCode}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }
}

function addExampleFields(existingExample = null, isRepresentative = false) {
  const container = document.getElementById("examples-container");
  if (!container) {
    console.error("❌ examples-container를 찾을 수 없음");
    return;
  }

  console.log("📝 addExampleFields 호출:", {
    existingExample,
    isRepresentative,
    containerFound: !!container,
  });

  const exampleDiv = document.createElement("div");
  exampleDiv.className = "example-item border p-4 rounded mb-4";

  // 예문 HTML 구조 생성
  exampleDiv.innerHTML = `
    <div class="mb-2 flex justify-between items-center">
      <span class="font-medium">${
        isRepresentative ? "대표 예문" : "예문"
      }</span>
      ${
        !isRepresentative
          ? '<button type="button" class="text-red-500 hover:text-red-700 delete-example"><i class="fas fa-trash"></i></button>'
          : ""
      }
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">한국어</label>
        <textarea class="korean-example w-full p-2 border rounded h-20" placeholder="한국어 예문을 입력하세요"></textarea>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">영어</label>
        <textarea class="english-example w-full p-2 border rounded h-20" placeholder="영어 예문을 입력하세요"></textarea>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">일본어</label>
        <textarea class="japanese-example w-full p-2 border rounded h-20" placeholder="일본어 예문을 입력하세요"></textarea>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">중국어</label>
        <textarea class="chinese-example w-full p-2 border rounded h-20" placeholder="중국어 예문을 입력하세요"></textarea>
      </div>
    </div>
  `;

  // 기존 예문 데이터가 있으면 채우기
  if (existingExample) {
    const koreanTextarea = exampleDiv.querySelector(".korean-example");
    const englishTextarea = exampleDiv.querySelector(".english-example");
    const japaneseTextarea = exampleDiv.querySelector(".japanese-example");
    const chineseTextarea = exampleDiv.querySelector(".chinese-example");

    // 다양한 데이터 구조 지원
    const koreanText =
      existingExample.korean ||
      existingExample.ko ||
      (existingExample.translations && existingExample.translations.korean) ||
      "";
    const englishText =
      existingExample.english ||
      existingExample.en ||
      (existingExample.translations && existingExample.translations.english) ||
      "";
    const japaneseText =
      existingExample.japanese ||
      existingExample.ja ||
      (existingExample.translations && existingExample.translations.japanese) ||
      "";
    const chineseText =
      existingExample.chinese ||
      existingExample.zh ||
      (existingExample.translations && existingExample.translations.chinese) ||
      "";

    console.log("📝 예문 데이터 매핑:", {
      original: existingExample,
      korean: koreanText,
      english: englishText,
      japanese: japaneseText,
      chinese: chineseText,
    });

    if (koreanTextarea && koreanText) {
      koreanTextarea.value = koreanText;
    }
    if (englishTextarea && englishText) {
      englishTextarea.value = englishText;
    }
    if (japaneseTextarea && japaneseText) {
      japaneseTextarea.value = japaneseText;
    }
    if (chineseTextarea && chineseText) {
      chineseTextarea.value = chineseText;
    }
  }

  // 삭제 버튼 이벤트 리스너 추가
  const deleteBtn = exampleDiv.querySelector(".delete-example");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      exampleDiv.remove();
    });
  }

  container.appendChild(exampleDiv);
}

async function saveConcept() {
  try {
    console.log("💾 개념 저장 시작");

    if (!validateForm()) {
      console.log("❌ 폼 검증 실패");
      return;
    }

    console.log("✅ 폼 검증 통과");
    const conceptData = collectFormData();
    console.log("📋 수집된 데이터:", conceptData);

    if (isEditMode) {
      console.log("🔄 수정 모드:", editConceptId);
      try {
        // 수정 시도
        console.log("🔧 개념 업데이트 시작...");
        await conceptUtils.updateConcept(editConceptId, conceptData);
        console.log("✅ 개념 수정 성공");

        alert("개념이 성공적으로 수정되었습니다.");

        // 성공 시에만 모달 닫기
        resetForm();
        closeModal();

        // 페이지 새로고침 없이 이벤트만 발생
        console.log("🔔 concept-saved 이벤트 발생 시도...");
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("concept-saved"));
          console.log("✅ concept-saved 이벤트 발생 완료");
        } else {
          console.error("❌ window.dispatchEvent를 사용할 수 없음");
        }
      } catch (updateError) {
        console.error("❌ 개념 수정 실패:", updateError);
        console.error("수정 오류 스택:", updateError.stack);
        console.error("수정 오류 전체 정보:", updateError);

        // 모달을 닫지 않고 오류 메시지만 표시 (새로고침 방지)
        alert(
          `개념을 수정하는 중 오류가 발생했습니다:\n${updateError.message}\n\n콘솔을 확인하여 상세 로그를 확인해주세요.`
        );

        // 추가 디버깅을 위해 모달 유지
        return; // 함수 종료하여 추가 작업 방지
      }
    } else {
      console.log("➕ 추가 모드");
      try {
        await conceptUtils.createConcept(conceptData);
        console.log("✅ 개념 추가 성공");
        alert("새 개념이 성공적으로 추가되었습니다.");

        resetForm();
        closeModal();

        // 페이지 새로고침 없이 이벤트만 발생
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("concept-saved"));
        }
      } catch (createError) {
        console.error("❌ 개념 추가 실패:", createError);
        alert(`개념을 추가하는 중 오류가 발생했습니다: ${createError.message}`);
        return;
      }
    }
  } catch (error) {
    console.error("개념 저장 중 전체 오류 발생:", error);
    console.error("오류 스택:", error.stack);
    alert(
      `개념을 저장하는 중 오류가 발생했습니다:\n${error.message}\n\n콘솔을 확인하여 상세 로그를 확인해주세요.`
    );
    // 모달을 닫지 않고 유지하여 디버깅 가능
  }
}

function validateForm() {
  // 필수 필드 검증
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

function collectFormData() {
  console.log("📊 데이터 수집 시작");

  // 개념 정보
  const domainField = document.getElementById("concept-domain");
  const categoryField = document.getElementById("concept-category");
  const emojiField = document.getElementById("concept-emoji");

  const conceptInfo = {
    domain: domainField ? domainField.value.trim() : "",
    category: categoryField ? categoryField.value.trim() : "",
    emoji: emojiField ? emojiField.value.trim() : "",
    images: [], // 이미지는 나중에 구현
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
        part_of_speech: posField
          ? posField.value
          : getDefaultPartOfSpeech(langCode),
        // 고급 필드들 추가
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
        collocations:
          collocationsField && collocationsField.value.trim()
            ? collocationsField.value
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
      };

      console.log(`🌍 ${langCode} 표현 수집:`, expressions[langCode]);
    }
  }

  // 예제 수집 (대표 예문과 일반 예문 구분)
  const examples = [];
  let representativeExample = null;

  document.querySelectorAll(".example-item").forEach((item) => {
    const example = {};
    let hasContent = false;

    // 대표 예문인지 확인
    const isRepresentative = item
      .querySelector("span")
      .textContent.includes("대표 예문");

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
        representativeExample = {
          translations: example,
        };
        console.log("📝 대표 예문 수집:", representativeExample);
      } else {
        examples.push(example);
        console.log("📝 일반 예문 수집:", example);
      }
    }
  });

  const result = {
    concept_info: conceptInfo,
    expressions: expressions,
    examples: examples,
  };

  // 대표 예문이 있으면 추가
  if (representativeExample) {
    result.representative_example = representativeExample;
  }

  console.log("📋 최종 수집된 데이터:", result);
  return result;
}

function resetForm() {
  // 폼 리셋 (안전한 null 체크)
  const domainField = document.getElementById("concept-domain");
  const categoryField = document.getElementById("concept-category");
  const emojiField = document.getElementById("concept-emoji");

  if (domainField) domainField.value = "";
  if (categoryField) categoryField.value = "";
  if (emojiField) emojiField.value = "";

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
    if (posField) posField.value = getDefaultPartOfSpeech(langCode);

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
    // 기본 대표 예문 필드 추가
    addExampleFields(null, true);
  }

  // 편집 모드 초기화
  isEditMode = false;
  editConceptId = null;

  // 세션 스토리지 초기화
  sessionStorage.removeItem("conceptEditMode");
  sessionStorage.removeItem("editConceptId");

  // 모달 제목 초기화
  const modalTitle = document.querySelector("#concept-modal h2");
  if (modalTitle) modalTitle.textContent = "새 개념 추가";

  // 저장 버튼 텍스트 초기화
  const saveBtn = document.getElementById("save-concept");
  if (saveBtn) saveBtn.textContent = "추가하기";
}

function closeModal() {
  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  resetForm();
}

// HTML 정적 레이블들을 환경 설정 언어로 업데이트
async function updateStaticLabels(userLanguage) {
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        korean_synonyms: "유사어 (쉼표로 구분)",
        korean_antonyms: "반의어 (쉼표로 구분)",
        korean_collocations: "연어 (쉼표로 구분)",
        korean_compound_words: "복합어 (쉼표로 구분)",
        english_synonyms: "유사어 (쉼표로 구분)",
        english_antonyms: "반의어 (쉼표로 구분)",
        english_collocations: "연어 (쉼표로 구분)",
        english_compound_words: "복합어 (쉼표로 구분)",
        partOfSpeech: {
          noun: "명사",
          verb: "동사",
          adjective: "형용사",
          adverb: "부사",
        },
      },
      en: {
        korean_synonyms: "Synonyms (comma separated)",
        korean_antonyms: "Antonyms (comma separated)",
        korean_collocations: "Collocations (comma separated)",
        korean_compound_words: "Compound words (comma separated)",
        english_synonyms: "Synonyms (comma separated)",
        english_antonyms: "Antonyms (comma separated)",
        english_collocations: "Collocations (comma separated)",
        english_compound_words: "Compound words (comma separated)",
        partOfSpeech: {
          noun: "noun",
          verb: "verb",
          adjective: "adjective",
          adverb: "adverb",
        },
      },
      ja: {
        korean_synonyms: "類義語 (カンマ区切り)",
        korean_antonyms: "反意語 (カンマ区切り)",
        korean_collocations: "連語 (カンマ区切り)",
        korean_compound_words: "複合語 (カンマ区切り)",
        english_synonyms: "類義語 (カンマ区切り)",
        english_antonyms: "反意語 (カンマ区切り)",
        english_collocations: "連語 (カンマ区切り)",
        english_compound_words: "複合語 (カンマ区切り)",
        partOfSpeech: {
          noun: "名詞",
          verb: "動詞",
          adjective: "形容詞",
          adverb: "副詞",
        },
      },
      zh: {
        korean_synonyms: "同义词 (逗号分隔)",
        korean_antonyms: "反义词 (逗号分隔)",
        korean_collocations: "搭配词 (逗号分隔)",
        korean_compound_words: "复合词 (逗号分隔)",
        english_synonyms: "同义词 (逗号分隔)",
        english_antonyms: "反义词 (逗号分隔)",
        english_collocations: "搭配词 (逗号分隔)",
        english_compound_words: "复合词 (逗号分隔)",
        partOfSpeech: {
          noun: "名词",
          verb: "动词",
          adjective: "形容词",
          adverb: "副词",
        },
      },
    };
    return labels[userLang] || labels.ko;
  };

  const uiLabels = getUILabels(userLanguage);

  // 한국어 섹션 레이블 업데이트
  const koreanSynonymsLabel = document.querySelector(
    'label[for="korean-synonyms"]'
  );
  if (koreanSynonymsLabel)
    koreanSynonymsLabel.textContent = uiLabels.korean_synonyms;

  const koreanAntonymsLabel = document.querySelector(
    'label[for="korean-antonyms"]'
  );
  if (koreanAntonymsLabel)
    koreanAntonymsLabel.textContent = uiLabels.korean_antonyms;

  const koreanCollocationsLabel = document.querySelector(
    'label[for="korean-collocations"]'
  );
  if (koreanCollocationsLabel)
    koreanCollocationsLabel.textContent = uiLabels.korean_collocations;

  const koreanCompoundWordsLabel = document.querySelector(
    'label[for="korean-compound-words"]'
  );
  if (koreanCompoundWordsLabel)
    koreanCompoundWordsLabel.textContent = uiLabels.korean_compound_words;

  // 영어 섹션 레이블 업데이트
  const englishSynonymsLabel = document.querySelector(
    'label[for="english-synonyms"]'
  );
  if (englishSynonymsLabel)
    englishSynonymsLabel.textContent = uiLabels.english_synonyms;

  const englishAntonymsLabel = document.querySelector(
    'label[for="english-antonyms"]'
  );
  if (englishAntonymsLabel)
    englishAntonymsLabel.textContent = uiLabels.english_antonyms;

  const englishCollocationsLabel = document.querySelector(
    'label[for="english-collocations"]'
  );
  if (englishCollocationsLabel)
    englishCollocationsLabel.textContent = uiLabels.english_collocations;

  const englishCompoundWordsLabel = document.querySelector(
    'label[for="english-compound-words"]'
  );
  if (englishCompoundWordsLabel)
    englishCompoundWordsLabel.textContent = uiLabels.english_compound_words;

  // 품사 옵션은 HTML에서 하드코딩된 각 언어별 옵션을 그대로 사용

  console.log("✅ 정적 레이블 업데이트 완료");
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openConceptModal = function (conceptId = null) {
  if (conceptId) {
    isEditMode = true;
    editConceptId = conceptId;
    sessionStorage.setItem("conceptEditMode", "true");
    sessionStorage.setItem("editConceptId", conceptId);
    fetchConceptForEdit(conceptId);
  } else {
    isEditMode = false;
    editConceptId = null;
    sessionStorage.removeItem("conceptEditMode");
    sessionStorage.removeItem("editConceptId");
    resetForm();
  }

  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
};
