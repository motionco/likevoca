import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { fetchAndDisplayWords } from "./word-list-utils.js";

// 서버 API를 사용하도록 수정
export async function handleAIRecommendation(currentUser, db) {
  const subject = prompt(
    "추천받을 주제를 입력해주세요 (예: 음식, 자연, 학교 등)"
  );
  if (!subject) return;

  let amount;
  do {
    amount = prompt("추천을 받을 한글 단어의 개수를 입력해주세요. (1~20)", "5");
    if (!amount) return;
  } while (!amount.match(/^\d+$/) || Number(amount) < 1 || Number(amount) > 20);

  amount = Number(amount);

  const loadingDiv = document.createElement("div");
  loadingDiv.id = "ai-recommendation-loading";
  loadingDiv.textContent = "한글 단어를 추천받는 중입니다...";
  loadingDiv.className =
    "fixed top-0 left-0 w-full bg-blue-500 text-white text-center p-2 z-50";

  const infoDiv = document.createElement("div");
  infoDiv.id = "ai-recommendation-info";
  infoDiv.textContent = `'${subject}' 주제로 ${amount}개의 한글 단어를 추천받고 있습니다. 잠시만 기다려주세요...`;
  infoDiv.className =
    "fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md";

  try {
    document.body.appendChild(loadingDiv);
    document.body.appendChild(infoDiv);

    // 로컬 환경인지 확인
    const isLocalEnvironment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // 로컬 환경일 때는 정확히 요청한 개수만, 그렇지 않을 때는 여유분 추가
    const requestAmount = isLocalEnvironment ? amount : amount + 3;

    let recommendations = await getHangulRecommendation(subject, requestAmount);

    // 추천 결과가 없는 경우 처리
    if (!recommendations || recommendations.length === 0) {
      alert(
        `'${subject}' 주제에 대한 추천을 받지 못했습니다. 다른 주제로 시도해보세요.`
      );
      return;
    }

    // 단어에 맞는 이모지 추가
    recommendations = recommendations.map((hangulData) => {
      return {
        ...hangulData,
        image: selectEmojiForWord(hangulData.meaning, hangulData.hangul),
      };
    });

    // 정확히 요청한 개수만큼 자르기
    recommendations = recommendations.slice(0, amount);

    // 최종적으로 요청한 개수가 맞는지 확인
    if (recommendations.length < amount) {
      console.warn(
        `요청한 ${amount}개보다 적은 ${recommendations.length}개의 단어만 받았습니다.`
      );
    }

    // 저장된 항목 수 추적
    let savedCount = 0;

    // 각 추천 항목 저장
    await Promise.all(
      recommendations.map(async (hangulData) => {
        const result = await saveRecommendedHangul(currentUser, db, hangulData);
        if (result !== false) savedCount++;
      })
    );

    if (savedCount > 0) {
      alert(
        `${savedCount}개의 한글 단어가 성공적으로 추천되어 저장되었습니다.`
      );
      await fetchAndDisplayWords(currentUser, db, "ai");
    } else {
      alert("저장된 한글 단어가 없습니다. 다른 주제로 다시 시도해보세요.");
    }
  } catch (error) {
    console.error("AI 추천 처리 중 오류:", error);
    alert(`오류가 발생했습니다: ${error.message}`);
  } finally {
    // 로딩 UI 요소 제거 (ID로 안전하게 접근)
    const loadingElement = document.getElementById("ai-recommendation-loading");
    if (loadingElement) loadingElement.remove();

    const infoElement = document.getElementById("ai-recommendation-info");
    if (infoElement) infoElement.remove();

    // 추가적인 z-50 클래스를 가진 요소도 모두 제거 (안전장치)
    document.querySelectorAll(".z-50").forEach((el) => el.remove());
  }
}

async function getHangulRecommendation(subject, amount) {
  const prompt = `Recommend ${amount} Korean words (Hangul) related to the following topic: ${subject}.
      
      Format: Hangul|English Meaning / Romanized Pronunciation|Korean Description|English Translation
      
      Rules:
      1. Each complete Korean word (no single consonants/vowels) with 4 fields separated by | (pipe)
      2. Second field: "english_meaning / romanized_pronunciation" (e.g., "sea / bada")
      3. Third field: Brief description in Korean (max 10 characters)
      4. Fourth field: English translation of the Korean description
      
      Example: 바다|sea / bada|넓은 물|wide body of water`;

  console.log("AI 프롬프트:", prompt);

  // 로컬 환경인지 확인
  const isLocalEnvironment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  let aiResponse;

  if (isLocalEnvironment) {
    console.log("로컬 환경에서 실행 중입니다. 테스트 데이터를 사용합니다.");
    // 로컬 환경에서는 테스트 데이터 제공
    aiResponse = getLocalTestData(subject, amount);
  } else {
    // 서버 API 엔드포인트를 사용
    console.log("배포 환경에서 AI API 호출");
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      console.error("AI 서버 응답 오류:", response.status, response.statusText);
      alert("AI 서버 응답에 실패했습니다.");
      return;
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("AI 응답에 텍스트 없음:", data);
      alert("AI로부터 응답을 받지 못했습니다.");
      return;
    }

    aiResponse = data.candidates[0].content.parts[0].text;
    console.log("AI 응답 원본:", aiResponse);
  }

  // 응답에서 각 줄 로깅
  console.log("AI 응답 라인별 분석:");
  aiResponse.split("\n").forEach((line, index) => {
    console.log(`라인 ${index + 1}:`, line);
  });

  const recommendations = aiResponse
    .split("\n")
    .filter((line) => {
      const isValid = line.trim() && line.includes("|");
      if (!isValid) {
        console.log("유효하지 않은 라인 무시:", line);
      }
      return isValid;
    })
    .map((line) => {
      console.log("처리 중인 라인:", line);

      const parts = line.split("|").map((s) => s.trim());

      // 필드 수 확인 및 디버깅
      console.log(`분할된 필드 수: ${parts.length}`, parts);

      let hangul, infoText, korDesc, engDesc;

      // 최소 2개 이상의 필드가 있어야 함
      if (parts.length >= 2) {
        hangul = parts[0];
        infoText = parts[1];

        // 한글 설명과 영어 설명 처리
        korDesc = parts.length >= 3 ? parts[2] : "";
        engDesc = parts.length >= 4 ? parts[3] : "";

        console.log("파싱 결과:", {
          hangul,
          infoText,
          korDesc,
          engDesc,
        });
      } else {
        console.warn("필드 수 부족:", parts);
        return null;
      }

      // 단일 자음/모음만 있는지 검사
      const isSingleConsonantOrVowel = /^[ㄱ-ㅎㅏ-ㅣ]$/.test(hangul);

      // 올바른 한글 글자인지 검사 (자음+모음 조합)
      const isProperHangul = /^[가-힣]+$/.test(hangul);

      // 유효하지 않은 한글이면 건너뜀
      if (isSingleConsonantOrVowel || !isProperHangul) {
        console.warn("유효하지 않은 한글:", hangul);
        return null;
      }

      // 영어 의미와 로마자 발음 분리
      let meaning = hangul;
      let pronunciation = hangul;

      // 슬래시(/)로 의미와 발음 분리 시도
      if (infoText.includes("/")) {
        const [meaningPart, pronPart] = infoText
          .split("/")
          .map((p) => p.trim());
        meaning = meaningPart || hangul;
        pronunciation = pronPart || hangul;
      }
      // 슬래시가 없으면 공백으로 분리 시도
      else {
        const parts = infoText.split(" ");
        if (parts.length >= 2) {
          // 마지막 단어를 발음으로 간주
          pronunciation = parts[parts.length - 1];
          // 나머지는 의미로 간주
          meaning = parts.slice(0, -1).join(" ");
        } else {
          // 분리 불가능하면 원본 텍스트 사용
          meaning = infoText || hangul;
        }
      }

      // 한글 설명과 영어 설명 처리
      const description = korDesc || `${hangul}에 대한 설명`;

      // 영어 설명이 없는 경우 의미를 기본값으로 사용
      const englishDescription = engDesc || meaning || "";

      console.log("최종 데이터:", {
        hangul,
        meaning,
        pronunciation,
        description,
        englishDescription,
      });

      return {
        hangul,
        meaning,
        pronunciation,
        description,
        englishDescription,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((item) => item !== null); // null 항목 제거

  if (recommendations.length === 0) {
    alert("유효한 한글 추천을 받지 못했습니다.");
    return;
  }

  console.log("최종 추천 목록:", recommendations);

  // 정확히 요청한 개수만큼 반환
  return recommendations.slice(0, amount);
}

// 로컬 환경에서 사용할 테스트 데이터 생성 함수
function getLocalTestData(subject, amount) {
  // 주제별 기본 단어 목록 (영어 의미와 로마자 발음 분리)
  const topicWords = {
    음식: [
      "밥|rice / bap|주식|Staple food",
      "국|soup / guk|국물 요리|Soup dish",
      "반찬|side dish / banchan|밥과 함께 먹는 음식|Side dish eaten with rice",
      "김치|kimchi / gimchi|대표적인 발효 음식|Representative fermented food",
      "떡|rice cake / tteok|쌀로 만든 음식|Food made from rice",
      "비빔밥|bibimbap / bibimbap|밥과 야채를 섞은 요리|Dish of mixed rice and vegetables",
      "불고기|bulgogi / bulgogi|쇠고기 요리|Beef dish",
      "라면|ramen / ramyeon|인스턴트 면 요리|Instant noodle dish",
    ],
    학교: [
      "학생|student / haksaeng|배우는 사람|Person who learns",
      "선생|teacher / seonsaeng|가르치는 사람|Person who teaches",
      "교실|classroom / gyosil|수업하는 공간|Space for classes",
      "책상|desk / chaeksang|공부하는 가구|Furniture for studying",
      "공부|study / gongbu|배우는 행위|Act of learning",
      "수업|class / sueop|교육 활동|Educational activity",
      "시험|exam / siheom|평가 활동|Evaluation activity",
      "교과서|textbook / gyogwaseo|학습 자료|Learning materials",
    ],
    자연: [
      "산|mountain / san|높은 지형|High terrain",
      "바다|sea / bada|넓은 물|Wide body of water",
      "강|river / gang|흐르는 물|Flowing water",
      "숲|forest / sup|나무가 많은 곳|Place with many trees",
      "꽃|flower / kkot|아름다운 식물|Beautiful plant",
      "하늘|sky / haneul|공기 위 공간|Space above the air",
      "바람|wind / baram|움직이는 공기|Moving air",
      "구름|cloud / gureum|수증기 덩어리|Mass of water vapor",
    ],
    동물: [
      "개|dog / gae|가정에서 키우는 동물|Animal raised at home",
      "고양이|cat / goyang-i|우아한 반려동물|Elegant pet",
      "말|horse / mal|빠르게 달리는 동물|Animal that runs fast",
      "소|cow / so|우유를 주는 동물|Animal that gives milk",
      "닭|chicken / dak|알을 낳는 새|Bird that lays eggs",
      "토끼|rabbit / tokki|긴 귀의 동물|Animal with long ears",
      "돼지|pig / dwaeji|농장의 동물|Farm animal",
      "호랑이|tiger / horangi|큰 고양이과 동물|Large feline animal",
    ],
    스포츠: [
      "축구|soccer / chukgu|공을 차는 운동|Sport of kicking a ball",
      "농구|basketball / nonggu|공을 던지는 운동|Sport of throwing a ball",
      "수영|swimming / suyeong|물에서 하는 운동|Sport done in water",
      "달리기|running / dalligi|빠르게 움직이는 운동|Sport of moving quickly",
      "야구|baseball / yagu|공을 치는 운동|Sport of hitting a ball",
      "테니스|tennis / teniseu|라켓으로 치는 운동|Sport of hitting with a racket",
      "배구|volleyball / baegu|네트 너머로 공을 넘기는 운동|Sport of sending a ball over a net",
      "골프|golf / golpeu|공을 홀에 넣는 운동|Sport of putting a ball in a hole",
    ],
  };

  // 주제에 해당하는 단어 목록 가져오기
  let words = topicWords[subject] || [];

  // 주제에 해당하는 단어가 없으면 모든 단어를 병합
  if (words.length === 0) {
    console.log("주제에 맞는 단어 없음, 모든 단어 사용");
    Object.values(topicWords).forEach((wordList) => {
      words = words.concat(wordList);
    });
  }

  // 단어 수가 부족하면 중복 허용
  if (words.length < amount) {
    console.log(`단어 부족 (${words.length}개), 중복 허용`);
    const originalWords = [...words];
    while (words.length < amount) {
      words.push(
        originalWords[Math.floor(Math.random() * originalWords.length)]
      );
    }
  }

  // 요청 개수만큼 무작위로 단어 선택
  const selectedWords = [];
  const usedIndices = new Set();

  // 먼저 중복 없이 가능한 만큼 선택
  for (let i = 0; i < Math.min(amount, words.length); i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * words.length);
    } while (usedIndices.has(randomIndex) && usedIndices.size < words.length);

    usedIndices.add(randomIndex);
    selectedWords.push(words[randomIndex]);
  }

  // 필요하면 중복 허용하여 나머지 채우기
  while (selectedWords.length < amount) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }

  return selectedWords.join("\n");
}

async function saveRecommendedHangul(currentUser, db, hangulData) {
  try {
    const userRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const aiUsage = (userData.aiUsage || 0) + 1;
    const maxAiUsage = userData.maxAiUsage || 0;

    if (aiUsage > maxAiUsage) {
      alert("Ai 사용 한도를 초과했습니다.");

      // 로딩 관련 UI 요소 제거
      const loadingDiv = document.querySelector(".z-50");
      if (loadingDiv) loadingDiv.remove();

      // 정보 메시지도 제거
      const infoDiv = document.querySelector(".fixed.bottom-4.right-4");
      if (infoDiv) infoDiv.remove();

      return false;
    }

    await updateDoc(userRef, { aiUsage });

    // 입력 데이터 로깅
    console.log("AI 추천 저장 - 입력 데이터:", hangulData);

    // 올바른 형식으로 데이터 확인
    const validHangulData = {
      hangul: hangulData.hangul || "",
      pronunciation: hangulData.pronunciation || "",
      meaning: hangulData.meaning || hangulData.hangul,
      description: hangulData.description || `${hangulData.hangul}에 대한 설명`,
      englishDescription: hangulData.englishDescription || "",
      createdAt: hangulData.createdAt || new Date().toISOString(),
      image: hangulData.image || "📝", // 이모지 저장
    };

    // 발음이 비어 있으면 기본값 설정
    if (!validHangulData.pronunciation) {
      validHangulData.pronunciation = hangulData.hangul;
    }

    // 이모지가 없으면 단어에 맞는 이모지 생성
    if (!validHangulData.image) {
      validHangulData.image = selectEmojiForWord(
        validHangulData.meaning,
        validHangulData.hangul
      );
    }

    // 영어 설명이 비어 있으면 영어 의미를 사용
    if (!validHangulData.englishDescription) {
      validHangulData.englishDescription = validHangulData.meaning;
      console.log(
        "영어 설명 없음, 의미를 영어 설명으로 설정:",
        validHangulData.meaning
      );
    }

    // 올바른 한글인지 확인 (완전한 음절)
    if (!/^[가-힣]+$/.test(validHangulData.hangul)) {
      console.error("올바르지 않은 한글:", validHangulData.hangul);
      return false;
    }

    // 최종 저장 데이터 로깅
    console.log("AI 추천 저장 - 최종 데이터:", validHangulData);

    const recommendRef = doc(
      db,
      "ai-recommend",
      currentUser.email,
      "ai-recommend",
      validHangulData.hangul
    );

    await setDoc(recommendRef, validHangulData);
    return true;
  } catch (error) {
    console.error("한글 저장 중 오류: ", error);
    return false;
  }
}

// 단어에 맞는 이모지 선택 함수
function selectEmojiForWord(meaning, hangul) {
  console.log("이모지 선택 - 입력 데이터:", { meaning, hangul });

  // 모든 이모지를 텍스트 형태로 정규화하는 함수
  const normalizeEmoji = (emojiString) => {
    // 이미 정규화된 텍스트 형태로 변환
    try {
      return emojiString.trim();
    } catch (error) {
      console.error("이모지 정규화 오류:", error);
      return "📝"; // 기본 이모지
    }
  };

  // 이모지 배열을 정규화
  const normalizeEmojiArray = (emojiArray) => {
    return emojiArray.map((emoji) => normalizeEmoji(emoji));
  };

  // 의미 기반 이모지 매핑 (핵심 단어별)
  const emojiMap = {
    // 음식 관련
    rice: normalizeEmojiArray(["🍚", "🍙", "🌾", "🍛", "🍱"]),
    food: normalizeEmojiArray(["🍽️", "🍲", "🥘", "🍛", "🥣"]),
    soup: normalizeEmojiArray(["🍲", "🥣", "🧂", "🔥", "🍵"]),
    kimchi: normalizeEmojiArray(["🥬", "🌶️", "🥢", "🍲", "🇰🇷"]),
    cake: normalizeEmojiArray(["🍰", "🎂", "🧁", "🍮", "🍥"]),

    // 자연 관련
    mountain: normalizeEmojiArray(["⛰️", "🏔️", "🗻", "🌋", "🏞️"]),
    sea: normalizeEmojiArray(["🌊", "🏖️", "🏝️", "🐚", "🌅"]),
    river: normalizeEmojiArray(["🏞️", "💦", "🚣", "🌄", "🌿"]),
    forest: normalizeEmojiArray(["🌲", "🌳", "🌿", "🍃", "🏞️"]),
    flower: normalizeEmojiArray(["🌸", "🌹", "🌺", "🌷", "🌻"]),

    // 동물 관련
    dog: normalizeEmojiArray(["🐕", "🐶", "🦮", "🐩", "🐾"]),
    cat: normalizeEmojiArray(["🐈", "🐱", "😸", "😺", "🐾"]),
    horse: normalizeEmojiArray(["🐎", "🐴", "🏇", "🐮", "🌾"]),
    chicken: normalizeEmojiArray(["🐔", "🐓", "🐤", "🐣", "🥚"]),
    cow: normalizeEmojiArray(["🐄", "🐮", "🥛", "🧀", "🌱"]),

    // 학교 관련
    student: normalizeEmojiArray(["👨‍🎓", "👩‍🎓", "📚", "✏️", "🎒"]),
    teacher: normalizeEmojiArray(["👨‍🏫", "👩‍🏫", "📝", "📚", "🏫"]),
    classroom: normalizeEmojiArray(["🏫", "👨‍🎓", "👩‍🎓", "📚", "🪑"]),
    desk: normalizeEmojiArray(["🪑", "📚", "✏️", "📝", "💻"]),
    study: normalizeEmojiArray(["📚", "📝", "✏️", "🧠", "👨‍🎓"]),

    // 스포츠 관련
    soccer: normalizeEmojiArray(["⚽", "🥅", "👟", "🏃", "🏆"]),
    basketball: normalizeEmojiArray(["🏀", "🏃", "👟", "🏆", "🔄"]),
    swimming: normalizeEmojiArray(["🏊", "🏊‍♀️", "💦", "🏊‍♂️", "🌊"]),
    running: normalizeEmojiArray(["🏃", "🏃‍♀️", "👟", "⏱️", "🏆"]),
    baseball: normalizeEmojiArray(["⚾", "🏏", "🧢", "⚾", "🏆"]),

    // 다양한 범주
    water: normalizeEmojiArray(["💧", "🚿", "🌊", "🚰", "🏊"]),
    fire: normalizeEmojiArray(["🔥", "🧯", "🌋", "🔥", "🧨"]),
    earth: normalizeEmojiArray(["🌍", "🌎", "🌏", "🌱", "🏔️"]),
    air: normalizeEmojiArray(["💨", "🌬️", "🌪️", "☁️", "🪁"]),
    sun: normalizeEmojiArray(["☀️", "🌞", "☀️", "🌅", "🌇"]),
    moon: normalizeEmojiArray(["🌙", "🌕", "🌖", "🌗", "🌘"]),
    star: normalizeEmojiArray(["⭐", "🌟", "✨", "💫", "🌠"]),
    book: normalizeEmojiArray(["📚", "📖", "📕", "📗", "📘"]),
    music: normalizeEmojiArray(["🎵", "🎶", "🎸", "🎹", "🎷"]),
    love: normalizeEmojiArray(["❤️", "💕", "💓", "💗", "💖"]),
    home: normalizeEmojiArray(["🏠", "🏡", "🪑", "🛏️", "🚪"]),
    car: normalizeEmojiArray(["🚗", "🚙", "🚘", "🚔", "🚖"]),
    bus: normalizeEmojiArray(["🚌", "🚍", "🚏", "🛣️", "🚐"]),
    train: normalizeEmojiArray(["🚂", "🚄", "🚅", "🚆", "🚇"]),
    airplane: normalizeEmojiArray(["✈️", "🛩️", "🛫", "🛬", "🌤️"]),
    phone: normalizeEmojiArray(["📱", "📞", "☎️", "📲", "💻"]),
    computer: normalizeEmojiArray(["💻", "⌨️", "🖱️", "🖥️", "📊"]),
    tv: normalizeEmojiArray(["📺", "🎮", "📡", "🎬", "🍿"]),
    camera: normalizeEmojiArray(["📷", "📸", "🎥", "📹", "🎬"]),
    pen: normalizeEmojiArray(["✒️", "🖋️", "🖊️", "✏️", "📝"]),
  };

  // 대표 한글 단어별 이모지 매핑 (빠른 검색용)
  const koreanEmojiMap = {
    밥: normalizeEmojiArray(["🍚", "🍙", "🌾", "🍛", "🍱"]),
    국: normalizeEmojiArray(["🍲", "🥣", "🧂", "🔥", "🍵"]),
    반찬: normalizeEmojiArray(["🍽️", "🥢", "🥗", "🥘", "🍛"]),
    김치: normalizeEmojiArray(["🥬", "🌶️", "🥢", "🍲", "🇰🇷"]),
    떡: normalizeEmojiArray(["🍰", "🍡", "🍘", "🍶", "🍵"]),
    학생: normalizeEmojiArray(["👨‍🎓", "👩‍🎓", "📚", "✏️", "🎒"]),
    선생: normalizeEmojiArray(["👨‍🏫", "👩‍🏫", "📝", "📚", "🏫"]),
    교실: normalizeEmojiArray(["🏫", "👨‍🎓", "👩‍🎓", "📚", "🪑"]),
    책상: normalizeEmojiArray(["🪑", "📚", "✏️", "📝", "💻"]),
    공부: normalizeEmojiArray(["📚", "📝", "✏️", "🧠", "👨‍🎓"]),
    산: normalizeEmojiArray(["⛰️", "🏔️", "🗻", "🌋", "🏞️"]),
    바다: normalizeEmojiArray(["🌊", "🏖️", "🏝️", "🐚", "🌅"]),
    강: normalizeEmojiArray(["🏞️", "💦", "🚣", "🌄", "🌿"]),
    숲: normalizeEmojiArray(["🌲", "🌳", "🌿", "🍃", "🏞️"]),
    꽃: normalizeEmojiArray(["🌸", "🌹", "🌺", "🌷", "🌻"]),
    개: normalizeEmojiArray(["🐕", "🐶", "🦮", "🐩", "🐾"]),
    고양이: normalizeEmojiArray(["🐈", "🐱", "😸", "😺", "🐾"]),
    말: normalizeEmojiArray(["🐎", "🐴", "🏇", "🐮", "🌾"]),
    소: normalizeEmojiArray(["🐄", "🐮", "🥛", "🧀", "🌱"]),
    닭: normalizeEmojiArray(["🐔", "🐓", "🐤", "🐣", "🥚"]),
    축구: normalizeEmojiArray(["⚽", "🥅", "👟", "🏃", "🏆"]),
    농구: normalizeEmojiArray(["🏀", "🏃", "👟", "🏆", "🔄"]),
    수영: normalizeEmojiArray(["🏊", "🏊‍♀️", "💦", "🏊‍♂️", "🌊"]),
    달리기: normalizeEmojiArray(["🏃", "🏃‍♀️", "👟", "⏱️", "🏆"]),
    야구: normalizeEmojiArray(["⚾", "🏏", "🧢", "⚾", "🏆"]),
  };

  // 이모지 찾기 로직
  let emoji;
  let matchSource = "";

  try {
    // 한글 단어가 매핑에 있는지 확인
    if (koreanEmojiMap[hangul]) {
      const emojiArray = koreanEmojiMap[hangul];
      emoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
      matchSource = `한글 매핑: ${hangul}`;
    }
    // 영어 의미가 매핑에 있는지 확인
    else {
      // 영어 의미를 소문자로 변환하고 정리
      const cleanMeaning = (meaning || "").toLowerCase().trim();
      console.log("정리된 영어 의미:", cleanMeaning);

      // 전체 매핑에서 일치하는 키워드 찾기
      let matchedKey = null;
      for (const key in emojiMap) {
        if (cleanMeaning.includes(key)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        const emojiArray = emojiMap[matchedKey];
        emoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
        matchSource = `영어 키워드 매칭: ${matchedKey}`;
      } else {
        // 매칭되는 키워드가 없으면 기본 이모지 세트에서 선택
        const defaultEmojis = normalizeEmojiArray([
          "📝",
          "🔤",
          "🔡",
          "📚",
          "🏫",
          "✏️",
          "🖊️",
          "📖",
          "🎓",
          "🗣️",
        ]);
        emoji = defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
        matchSource = "기본 이모지";
      }
    }
  } catch (error) {
    console.error("이모지 선택 중 오류 발생:", error);
    emoji = "📝"; // 오류 시 기본 이모지
    matchSource = "오류 발생";
  }

  console.log(`이모지 선택 결과: ${emoji} (출처: ${matchSource})`);

  // 최종 검증 - 빈 문자열이면 기본 이모지 반환
  if (!emoji || emoji.trim() === "") {
    console.warn("이모지가 비어있어 기본 이모지로 대체");
    return "📝";
  }

  return emoji;
}
