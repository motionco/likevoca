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

  // 번역 정보 구성
  const translations = {};

  // 동적으로 언어 처리
  let supportedLanguages = {
    english: { nameKo: "영어", example: "apple" },
    japanese: { nameKo: "일본어", example: "りんご" },
    chinese: { nameKo: "중국어", example: "苹果" },
    vietnamese: { nameKo: "베트남어", example: "táo" }, // 프랑스어를 베트남어로 변경
  };

  // 각 지원 언어에 대해 번역 정보 구성
  for (const [langCode, langInfo] of Object.entries(supportedLanguages)) {
    // 해당 언어의 의미가 있는지 확인
    const meaningKey = `${langInfo.nameKo}의미`;
    if (rowData[meaningKey]) {
      const meanings = rowData[meaningKey]
        .split(";")
        .map((m) => m.trim())
        .filter((m) => m);

      if (meanings.length > 0) {
        const examples = [];
        // 예문 추가
        const exampleKey = `${langInfo.nameKo}예문`;
        const exampleTransKey = `${langInfo.nameKo}예문번역`;
        if (rowData[exampleKey] && rowData[exampleTransKey]) {
          examples.push({
            sentence: rowData[exampleKey],
            translation: rowData[exampleTransKey],
          });
        }

        // 유의어 파싱
        const synonymKey = `${langInfo.nameKo}유의어`;
        const synonyms = rowData[synonymKey]
          ? rowData[synonymKey]
              .split(";")
              .map((s) => s.trim())
              .filter((s) => s)
          : [];

        // 번역 정보 추가
        translations[langCode] = {
          meaning: meanings,
          examples: examples,
          synonyms: synonyms,
        };
      }
    }
  }

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

  // 모든 번역 언어에 대해 인덱스 업데이트
  for (const [language, translation] of Object.entries(wordData.translations)) {
    if (translation && translation.meaning) {
      for (const meaning of translation.meaning) {
        await updateIndex(
          userEmail,
          language,
          meaning.toLowerCase(),
          koreanWord
        );
      }
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
        이모지: "🍎",
        사용빈도: 95,
        관련단어: "사과나무;사과즙",
        영어의미: "apple;fruit",
        영어예문: "저는 매일 사과를 먹어요.",
        영어예문번역: "I eat an apple every day.",
        영어유의어: "fruit;red fruit",
        일본어의미: "りんご",
        일본어예문: "사과는 맛있어요.",
        일본어예문번역: "りんご는美味しいです。",
        일본어유의어: "果物;フルーツ",
        중국어의미: "苹果",
        중국어예문: "사과는 건강에 좋아요.",
        중국어예문번역: "苹果对健康有好处。",
        중국어유의어: "水果;红果",
        베트남어의미: "táo",
        베트남어예문: "이 사과는 정말 달아요.",
        베트남어예문번역: "Quả táo này rất ngọt.",
        베트남어유의어: "quả;trái cây",
      },
      {
        한국어: "바다",
        발음: "ba-da",
        품사: "명사",
        수준: "초급",
        카테고리: "자연;여행",
        이모지: "🌊",
        사용빈도: 85,
        관련단어: "해변;파도",
        영어의미: "sea;ocean",
        영어예문: "여름에 바다에 가요.",
        영어예문번역: "I go to the sea in summer.",
        영어유의어: "ocean;waters",
        일본어의미: "海",
        일본어예문: "바다가 아름다워요.",
        일본어예문번역: "海がきれいです。",
        일본어유의어: "海洋",
        중국어의미: "海",
        중국어예문: "바다에서 수영해요.",
        중국어예문번역: "在海里游泳。",
        중국어유의어: "海洋;大海",
        베트남어의미: "biển",
        베트남어예문: "바다를 보면 마음이 편안해져요.",
        베트남어예문번역: "Nhìn biển làm tôi cảm thấy bình yên.",
        베트남어유의어: "đại dương;biển cả",
      },
      {
        한국어: "학교",
        발음: "hak-gyo",
        품사: "명사",
        수준: "초급",
        카테고리: "교육;학교",
        이모지: "🏫",
        사용빈도: 90,
        관련단어: "학생;선생님",
        영어의미: "school;academy",
        영어예문: "학교에 매일 가요.",
        영어예문번역: "I go to school every day.",
        영어유의어: "academy;educational institution",
        일본어의미: "学校",
        일본어예문: "학교는 9시에 시작해요.",
        일본어예문번역: "学校は9時に始まります。",
        일본어유의어: "教育機関",
        중국어의미: "学校",
        중국어예문: "학교에서 한국어를 배워요.",
        중국어예문번역: "在学校学习韩语。",
        중국어유의어: "校园;学院",
        베트남어의미: "trường học",
        베트남어예문: "학교는 주말에 쉬어요.",
        베트남어예문번역: "Trường học nghỉ vào cuối tuần.",
        베트남어유의어: "học viện;trường",
      },
      {
        한국어: "친구",
        발음: "chin-gu",
        품사: "명사",
        수준: "초급",
        카테고리: "인간관계;일상",
        이모지: "👫",
        사용빈도: 98,
        관련단어: "우정;동료",
        영어의미: "friend;companion",
        영어예문: "친구와 영화를 봤어요.",
        영어예문번역: "I watched a movie with my friend.",
        영어유의어: "buddy;pal",
        일본어의미: "友達",
        일본어예문: "친구와 함께 공부해요.",
        일본어예문번역: "友達と一緒に勉強します。",
        일본어유의어: "仲間;友人",
        중국어의미: "朋友",
        중국어예문: "친구가 많아요.",
        중국어예문번역: "有很多朋友。",
        중국어유의어: "伙伴;好友",
        베트남어의미: "bạn bè",
        베트남어예문: "친구와 전화 통화했어요.",
        베트남어예문번역: "Tôi đã nói chuyện điện thoại với bạn.",
        베트남어유의어: "bạn;người bạn",
      },
      {
        한국어: "음악",
        발음: "eum-ak",
        품사: "명사",
        수준: "초급",
        카테고리: "예술;취미",
        이모지: "🎵",
        사용빈도: 88,
        관련단어: "노래;콘서트",
        영어의미: "music;melody",
        영어예문: "음악을 들으면서 공부해요.",
        영어예문번역: "I study while listening to music.",
        영어유의어: "melody;tune",
        일본어의미: "音楽",
        일본어예문: "음악 수업이 재미있어요.",
        일본어예문번역: "音楽の授業が面白いです。",
        일본어유의어: "曲;メロディー",
        중국어의미: "音乐",
        중국어예문: "좋아하는 음악이 뭐예요?",
        중국어예문번역: "你喜欢什么音乐?",
        중국어유의어: "旋律;歌曲",
        베트남어의미: "âm nhạc",
        베트남어예문: "음악은 스트레스를 줄여줘요.",
        베트남어예문번역: "Âm nhạc giúp giảm căng thẳng.",
        베트남어유의어: "giai điệu;bản nhạc",
      },
    ];
    content = JSON.stringify(jsonTemplate, null, 2);
    filename = "korean_words_template.json";
    type = "application/json";
  } else {
    // CSV 템플릿
    content =
      "한국어,발음,품사,수준,카테고리,이모지,사용빈도,관련단어,영어의미,영어예문,영어예문번역,영어유의어,일본어의미,일본어예문,일본어예문번역,일본어유의어,중국어의미,중국어예문,중국어예문번역,중국어유의어,베트남어의미,베트남어예문,베트남어예문번역,베트남어유의어\n" +
      "사과,sa-gwa,명사,초급,음식;과일,🍎,95,사과나무;사과즙,apple;fruit,저는 매일 사과를 먹어요.,I eat an apple every day.,fruit;red fruit,りんご,사과는 맛있어요.,りんごは美味しいです。,果物;フルーツ,苹果,사과는 건강에 좋아요.,苹果对健康有好处。,水果;红果,táo,이 사과는 정말 달아요.,Quả táo này rất ngọt.,quả;trái cây\n" +
      "바다,ba-da,명사,초급,자연;여행,🌊,85,해변;파도,sea;ocean,여름에 바다에 가요.,I go to the sea in summer.,ocean;waters,海,바다가 아름다워요.,海がきれいです。,海洋,海,바다에서 수영해요.,在海里游泳。,海洋;大海,biển,바다를 보면 마음이 편안해져요.,Nhìn biển làm tôi cảm thấy bình yên.,đại dương;biển cả\n" +
      "학교,hak-gyo,명사,초급,교육;학교,🏫,90,학생;선생님,school;academy,학교에 매일 가요.,I go to school every day.,academy;educational institution,学校,학교는 9시에 시작해요.,学校は9時に始まります。,教育機関,学校,학교에서 한국어를 배워요.,在学校学习韩语。,校园;学院,trường học,학교는 주말에 쉬어요.,Trường học nghỉ vào cuối tuần.,học viện;trường\n" +
      "친구,chin-gu,명사,초급,인간관계;일상,👫,98,우정;동료,friend;companion,친구와 영화를 봤어요.,I watched a movie with my friend.,buddy;pal,友達,친구와 함께 공부해요.,友達と一緒に勉強します。,仲間;友人,朋友,친구가 많아요.,有很多朋友。,伙伴;好友,bạn bè,친구와 전화 통화했어요.,Tôi đã nói chuyện điện thoại với bạn.,bạn;người bạn\n" +
      "음악,eum-ak,명사,초급,예술;취미,🎵,88,노래;콘서트,music;melody,음악을 들으면서 공부해요.,I study while listening to music.,melody;tune,音楽,음악 수업이 재미있어요.,音楽の授業が面白いです。,曲;メロディー,音乐,좋아하는 음악이 뭐예요?,你喜欢什么音乐?,旋律;歌曲,âm nhạc,음악은 스트레스를 줄여줘요.,Âm nhạc giúp giảm căng thẳng.,giai điệu;bản nhạc";
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
