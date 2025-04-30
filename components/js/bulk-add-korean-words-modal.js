import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let parsedData = [];
let validWords = [];
let invalidWords = [];
let currentFileFormat = "csv"; // 추가: 기본 파일 형식을 CSV로 설정

// 초기화 함수
export function initialize() {
  // 모달 요소 참조
  const modal = document.getElementById("bulk-korean-word-modal");
  const closeBtn = document.getElementById("close-bulk-modal");
  const fileInput = document.getElementById("csv-file-input");
  const saveBtn = document.getElementById("bulk-save-words");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (fileInput) {
    fileInput.addEventListener("change", handleFileUpload);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", bulkSaveWords);
  }

  // 파일 형식 선택 이벤트
  const formatRadios = document.querySelectorAll('input[name="file-format"]');
  formatRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentFileFormat = e.target.value;

      // 가이드 표시 전환
      const csvGuide = document.getElementById("csv-format-guide");
      const jsonGuide = document.getElementById("json-format-guide");

      if (currentFileFormat === "csv") {
        csvGuide.classList.remove("hidden");
        jsonGuide.classList.add("hidden");
      } else {
        csvGuide.classList.add("hidden");
        jsonGuide.classList.remove("hidden");
      }

      // 템플릿 다운로드 링크 업데이트
      updateTemplateDownloadLink();
    });
  });

  // 초기 가이드 설정
  const csvGuide = document.getElementById("csv-format-guide");
  const jsonGuide = document.getElementById("json-format-guide");
  if (csvGuide && jsonGuide) {
    csvGuide.classList.toggle("hidden", currentFileFormat !== "csv");
    jsonGuide.classList.toggle("hidden", currentFileFormat !== "json");
  }

  // 템플릿 다운로드 링크 설정
  const downloadBtn = document.getElementById("download-template");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      downloadTemplate();
    });
  }

  console.log("대량 단어 추가 모달 초기화 완료");
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("bulk-korean-word-modal");
  if (modal) {
    modal.classList.add("hidden");
    resetForm();
  }
}

// 폼 초기화
function resetForm() {
  const fileInput = document.getElementById("csv-file-input");
  if (fileInput) {
    fileInput.value = "";
  }

  // 미리보기 컨테이너 초기화
  document.getElementById("preview-loading").classList.add("hidden");
  document.getElementById("preview-content").classList.add("hidden");
  document.getElementById("preview-error").classList.add("hidden");

  document.getElementById("preview-header").innerHTML = "";
  document.getElementById("preview-body").innerHTML = "";

  document.getElementById("total-words-count").textContent = "0";
  document.getElementById("valid-words-count").textContent = "0";
  document.getElementById("invalid-words-count").textContent = "0";

  // 저장 버튼 비활성화
  document.getElementById("bulk-save-words").disabled = true;

  // 전역 변수 초기화
  parsedData = [];
  validWords = [];
  invalidWords = [];
}

// 파일 업로드 처리
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 로딩 상태 표시
  document.getElementById("preview-loading").classList.remove("hidden");
  document.getElementById("preview-content").classList.add("hidden");
  document.getElementById("preview-error").classList.add("hidden");

  try {
    const content = await readFileContent(file);

    // 파일 확장자에 따라 적절한 파싱 함수 호출
    if (file.name.toLowerCase().endsWith(".json")) {
      parseJSON(content);
    } else if (
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv"
    ) {
      parseCSV(content);
    } else {
      showError(
        "지원하지 않는 파일 형식입니다. CSV 또는 JSON 파일만 업로드 가능합니다."
      );
      return;
    }

    // 로딩 완료, 미리보기 표시
    document.getElementById("preview-loading").classList.add("hidden");
    document.getElementById("preview-content").classList.remove("hidden");

    // 저장 버튼 활성화 (유효한 단어가 있는 경우)
    document.getElementById("bulk-save-words").disabled =
      validWords.length === 0;
  } catch (error) {
    console.error("파일 처리 오류:", error);
    showError("파일을 읽는 중 오류가 발생했습니다: " + error.message);
  }
}

// 파일 내용 읽기
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsText(file);
  });
}

// CSV 파싱
function parseCSV(content) {
  // CSV 행 분리
  const lines = content.split(/\r\n|\n|\r/).filter((line) => line.trim());

  if (lines.length === 0) {
    showError("파일이 비어있습니다.");
    return;
  }

  // 헤더 행 파싱
  const headers = lines[0].split(",");

  // 데이터 행 파싱
  parsedData = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // 각 행을 콤마로
    const values = parseCSVLine(line);

    // 행 데이터가 충분한지 확인
    if (values.length < 3) continue;

    const rowData = {};
    headers.forEach((header, index) => {
      if (index < values.length) {
        rowData[header.trim()] = values[index].trim();
      }
    });

    parsedData.push(rowData);
  }

  // 데이터 검증
  validateData();

  // 미리보기 생성
  createPreview(headers);
}

// CSV 라인 파싱 (쌍따옴표 내 콤마 처리)
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

// JSON 파싱 함수 추가
function parseJSON(content) {
  try {
    // JSON 파싱
    const jsonData = JSON.parse(content);

    if (!Array.isArray(jsonData)) {
      showError("JSON 데이터가 배열 형식이 아닙니다.");
      return;
    }

    if (jsonData.length === 0) {
      showError("JSON 데이터가 비어있습니다.");
      return;
    }

    // 데이터 저장
    parsedData = jsonData;

    // 데이터 검증
    validateData();

    // 미리보기 생성
    const headers = Object.keys(parsedData[0] || {});
    createPreview(headers);
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    showError("JSON 파일을 파싱하는 중 오류가 발생했습니다: " + error.message);
  }
}

// 데이터 검증
function validateData() {
  validWords = [];
  invalidWords = [];

  parsedData.forEach((row, index) => {
    // 필수 필드 체크
    if (!row["한국어"] || !row["발음"] || !row["영어의미"]) {
      invalidWords.push({ index, row, reason: "필수 항목 누락" });
      return;
    }

    // 품사 체크
    const validPartOfSpeech = [
      "명사",
      "동사",
      "형용사",
      "부사",
      "조사",
      "감탄사",
    ];
    if (row["품사"] && !validPartOfSpeech.includes(row["품사"])) {
      invalidWords.push({ index, row, reason: "유효하지 않은 품사" });
      return;
    }

    // 수준 체크
    const validLevels = ["초급", "중급", "고급"];
    if (row["수준"] && !validLevels.includes(row["수준"])) {
      invalidWords.push({ index, row, reason: "유효하지 않은 수준" });
      return;
    }

    // 사용 빈도 체크
    if (row["사용빈도"]) {
      const frequency = parseInt(row["사용빈도"]);
      if (isNaN(frequency) || frequency < 1 || frequency > 100) {
        invalidWords.push({ index, row, reason: "유효하지 않은 사용 빈도" });
        return;
      }
    }

    // 유효한 단어로 추가
    validWords.push(row);
  });

  // 카운트 업데이트
  document.getElementById("total-words-count").textContent = parsedData.length;
  document.getElementById("valid-words-count").textContent = validWords.length;
  document.getElementById("invalid-words-count").textContent =
    invalidWords.length;
}

// 미리보기 생성
function createPreview(headers) {
  const previewHeader = document.getElementById("preview-header");
  const previewBody = document.getElementById("preview-body");

  // 헤더 생성
  previewHeader.innerHTML =
    headers.map((h) => `<th class="px-2 py-1">${h}</th>`).join("") +
    '<th class="px-2 py-1">상태</th>';

  // 최대 10개까지만 표시
  const rowsToShow = parsedData.slice(0, 10);

  // 행 생성
  previewBody.innerHTML = rowsToShow
    .map((row, index) => {
      const isValid = validWords.some((v) => v["한국어"] === row["한국어"]);
      const statusCell = isValid
        ? '<td class="px-2 py-1 text-green-600">유효</td>'
        : `<td class="px-2 py-1 text-red-600">무효</td>`;

      return `<tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
      ${headers
        .map((h) => `<td class="px-2 py-1">${row[h] || ""}</td>`)
        .join("")}
      ${statusCell}
    </tr>`;
    })
    .join("");

  // 더 많은 행이 있으면 표시
  if (parsedData.length > 10) {
    previewBody.innerHTML += `
      <tr class="bg-gray-100">
        <td colspan="${
          headers.length + 1
        }" class="px-2 py-1 text-center text-gray-500">
          ... 외 ${parsedData.length - 10}개 행 더 있음
        </td>
      </tr>
    `;
  }
}

// 오류 표시
function showError(message) {
  document.getElementById("preview-loading").classList.add("hidden");
  document.getElementById("preview-content").classList.add("hidden");
  document.getElementById("preview-error").classList.remove("hidden");
  document.getElementById("error-message").textContent = message;

  // 저장 버튼 비활성화
  document.getElementById("bulk-save-words").disabled = true;
}

// 대량 단어 저장
async function bulkSaveWords() {
  if (validWords.length === 0) {
    alert("추가할 유효한 단어가 없습니다.");
    return;
  }

  try {
    // 로딩 상태 표시
    document.getElementById("bulk-save-words").disabled = true;
    document.getElementById("bulk-save-words").textContent = "저장 중...";

    const userEmail = auth.currentUser.email;
    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 사용자 정보 확인
    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("사용자 정보가 없습니다.");
      return;
    }

    // 사용자 단어 수 확인
    const userData = userSnap.data();
    const currentCount = userData.koreanDictCount || 0;
    const maxCount = userData.maxKoreanDictCount || 100;

    if (currentCount + validWords.length > maxCount) {
      alert(
        `최대 단어 수(${maxCount}개)를 초과합니다. 현재 ${currentCount}개가 있고, ${validWords.length}개를 추가하려고 합니다.`
      );
      return;
    }

    // 단어 추가 (배치 처리)
    const batch = writeBatch(db);

    // 추가된 단어 수
    let addedCount = 0;

    for (const word of validWords) {
      const wordData = createWordData(word);
      const wordRef = doc(
        db,
        "korean_dictionary",
        userEmail,
        "words",
        wordData._id
      );

      // 이미 존재하는지 확인
      const wordSnap = await getDoc(wordRef);
      if (wordSnap.exists()) {
        continue; // 이미 존재하면 스킵
      }

      batch.set(wordRef, wordData);
      addedCount++;

      // 인덱스 업데이트 (영어, 일본어, 중국어)
      await updateIndices(userEmail, wordData);
    }

    // 사용자 단어 수 증가
    batch.update(userRef, {
      koreanDictCount: increment(addedCount),
    });

    // 배치 커밋
    await batch.commit();

    alert(`${addedCount}개의 단어가 성공적으로 추가되었습니다.`);

    // 모달 닫기 및 초기화
    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("단어 저장 중 오류 발생:", error);
    alert("단어 저장에 실패했습니다.");

    // 버튼 상태 복원
    document.getElementById("bulk-save-words").disabled = false;
    document.getElementById("bulk-save-words").textContent = "단어 추가하기";
  }
}

// 단어 데이터 생성
function createWordData(rowData) {
  // 카테고리 파싱 (세미콜론으로 구분)
  const categories = rowData["카테고리"]
    ? rowData["카테고리"]
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c)
    : ["일반"];

  // 영어 의미 파싱
  const englishMeanings = rowData["영어의미"]
    ? rowData["영어의미"]
        .split(";")
        .map((m) => m.trim())
        .filter((m) => m)
    : [];

  // 영어 유의어 파싱
  const englishSynonyms = rowData["영어유의어"]
    ? rowData["영어유의어"]
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  // 일본어 의미 파싱
  const japaneseMeanings = rowData["일본어의미"]
    ? rowData["일본어의미"]
        .split(";")
        .map((m) => m.trim())
        .filter((m) => m)
    : [];

  // 일본어 유의어 파싱
  const japaneseSynonyms = rowData["일본어유의어"]
    ? rowData["일본어유의어"]
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  // 중국어 의미 파싱
  const chineseMeanings = rowData["중국어의미"]
    ? rowData["중국어의미"]
        .split(";")
        .map((m) => m.trim())
        .filter((m) => m)
    : [];

  // 중국어 유의어 파싱
  const chineseSynonyms = rowData["중국어유의어"]
    ? rowData["중국어유의어"]
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  // 이모지 파싱
  const emojis = rowData["이모지"] ? [rowData["이모지"].trim()] : [];

  // 사용 빈도 파싱
  const usageFrequency = rowData["사용빈도"]
    ? parseInt(rowData["사용빈도"])
    : 50;

  // 관련 단어 파싱
  const relatedWords = rowData["관련단어"]
    ? rowData["관련단어"]
        .split(";")
        .map((w) => w.trim())
        .filter((w) => w)
    : [];

  // 번역 정보 구성
  const translations = {};

  if (englishMeanings.length > 0) {
    const examples = [];
    // 영어 예문 추가
    if (rowData["영어예문"] && rowData["영어예문번역"]) {
      examples.push({
        sentence: rowData["영어예문"],
        translation: rowData["영어예문번역"],
      });
    }

    translations.english = {
      meaning: englishMeanings,
      examples: examples,
      synonyms: englishSynonyms,
      notes: "",
    };
  }

  if (japaneseMeanings.length > 0) {
    const examples = [];
    // 일본어 예문 추가
    if (rowData["일본어예문"] && rowData["일본어예문번역"]) {
      examples.push({
        sentence: rowData["일본어예문"],
        translation: rowData["일본어예문번역"],
      });
    }

    translations.japanese = {
      meaning: japaneseMeanings,
      examples: examples,
      synonyms: japaneseSynonyms,
      notes: "",
    };
  }

  if (chineseMeanings.length > 0) {
    const examples = [];
    // 중국어 예문 추가
    if (rowData["중국어예문"] && rowData["중국어예문번역"]) {
      examples.push({
        sentence: rowData["중국어예문"],
        translation: rowData["중국어예문번역"],
      });
    }

    translations.chinese = {
      meaning: chineseMeanings,
      examples: examples,
      synonyms: chineseSynonyms,
      notes: "",
    };
  }

  return {
    _id: rowData["한국어"], // 단어를 ID로 사용
    korean: {
      word: rowData["한국어"],
      pronunciation: rowData["발음"],
      part_of_speech: rowData["품사"] || "명사",
      level: rowData["수준"] || "초급",
      category: categories,
    },
    translations: translations,
    common: {
      emojis: emojis,
      usage_frequency: usageFrequency,
      related_words: relatedWords,
      updated_at: Timestamp.now(),
    },
  };
}

// 인덱스 업데이트
async function updateIndices(userEmail, wordData) {
  const koreanWord = wordData.korean.word;

  // 영어 인덱스 업데이트
  if (wordData.translations.english && wordData.translations.english.meaning) {
    for (const meaning of wordData.translations.english.meaning) {
      await updateIndex(
        userEmail,
        "english",
        meaning.toLowerCase(),
        koreanWord
      );
    }
  }

  // 일본어 인덱스 업데이트
  if (
    wordData.translations.japanese &&
    wordData.translations.japanese.meaning
  ) {
    for (const meaning of wordData.translations.japanese.meaning) {
      await updateIndex(userEmail, "japanese", meaning, koreanWord);
    }
  }

  // 중국어 인덱스 업데이트
  if (wordData.translations.chinese && wordData.translations.chinese.meaning) {
    for (const meaning of wordData.translations.chinese.meaning) {
      await updateIndex(userEmail, "chinese", meaning, koreanWord);
    }
  }
}

// 단일 인덱스 업데이트
async function updateIndex(userEmail, language, foreignWord, koreanWord) {
  const indexId = `${foreignWord}_${language}`;
  const indexRef = doc(
    db,
    "korean_dictionary_index",
    userEmail,
    language,
    indexId
  );
  const indexSnap = await getDoc(indexRef);

  if (indexSnap.exists()) {
    // 기존 인덱스 업데이트
    const indexData = indexSnap.data();

    if (!indexData.korean_words.includes(koreanWord)) {
      await updateDoc(indexRef, {
        korean_words: [...indexData.korean_words, koreanWord],
      });
    }
  } else {
    // 새 인덱스 생성
    await setDoc(indexRef, {
      foreign_word: foreignWord,
      korean_words: [koreanWord],
      language: language,
    });
  }
}

// 템플릿 다운로드 함수
function downloadTemplate() {
  let content, filename, type;

  if (currentFileFormat === "json") {
    // JSON 템플릿
    const jsonTemplate = [
      {
        한국어: "사과",
        발음: "sa-gwa",
        품사: "명사",
        수준: "초급",
        카테고리: "음식;과일",
        영어의미: "apple;fruit",
        영어예문: "저는 사과를 좋아해요.",
        영어예문번역: "I like apples.",
        영어유의어: "fruit;red fruit",
        일본어의미: "りんご",
        일본어예문: "사과를 먹고 싶어요.",
        일본어예문번역: "りんご를食べたいです。",
        일본어유의어: "果物",
        중국어의미: "苹果",
        중국어예문: "사과는 빨간색입니다.",
        중국어예문번역: "苹果是红色的。",
        중국어유의어: "水果",
        이모지: "🍎",
        사용빈도: 90,
        관련단어: "사과나무;사과즙",
      },
      {
        한국어: "안녕하세요",
        발음: "an-nyeong-ha-se-yo",
        품사: "감탄사",
        수준: "초급",
        카테고리: "인사;일상",
        영어의미: "hello;hi",
        영어예문: "안녕하세요, 만나서 반갑습니다.",
        영어예문번역: "Hello, nice to meet you.",
        영어유의어: "greeting;salutation",
        일본어의미: "こんにちは",
        일본어예문: "안녕하세요, 어떻게 지내세요?",
        일본어예문번역: "こんにちは、お元気ですか？",
        일본어유의어: "挨拶",
        중국어의미: "你好",
        중국어예문: "안녕하세요, 처음 뵙겠습니다.",
        중국어예문번역: "你好，初次见面。",
        중국어유의어: "问候",
        이모지: "👋",
        사용빈도: 100,
        관련단어: "안녕;반갑습니다",
      },
    ];
    content = JSON.stringify(jsonTemplate, null, 2);
    filename = "korean_words_template.json";
    type = "application/json";
  } else {
    // CSV 템플릿
    content =
      "한국어,발음,품사,수준,카테고리,영어의미,영어예문,영어예문번역,영어유의어,일본어의미,일본어예문,일본어예문번역,일본어유의어,중국어의미,중국어예문,중국어예문번역,중국어유의어,이모지,사용빈도,관련단어\n" +
      "사과,sa-gwa,명사,초급,음식;과일,apple;fruit,저는 사과를 좋아해요.,I like apples.,fruit;red fruit,りんご,사과를 먹고 싶어요.,りんごを食べたいです。,果物,苹果,사과는 빨간색입니다.,苹果是红色的。,水果,🍎,90,사과나무;사과즙\n" +
      "안녕하세요,an-nyeong-ha-se-yo,감탄사,초급,인사;일상,hello;hi,안녕하세요 만나서 반갑습니다.,Hello nice to meet you.,greeting;salutation,こんにちは,안녕하세요 어떻게 지내세요?,こんにちは、お元気ですか？,挨拶,你好,안녕하세요 처음 뵙겠습니다.,你好，初次见面。,问候,👋,100,안녕;반갑습니다";
    filename = "korean_words_template.csv";
    type = "text/csv";
  }

  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
