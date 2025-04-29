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
      Follow this exact format for each word:  
      Hangul|English Meaning / Romanized Pronunciation|Stroke Count|Description (in Korean, max 10 characters)  
      
      ### Important Rules:  
      1. Each entry should have 4 parts separated by | (pipe).
      2. For the second part (Meaning/Pronunciation), use format: "english_meaning / romanized_pronunciation" (e.g., "rice / bap", "water / mul").
      3. Each response must contain exactly one complete Korean word.
      4. DO NOT include single consonants or vowels. Only complete syllables.
      5. The stroke count must be accurate for the entire word.
      6. The description must be in Korean, the meaning in English, and pronunciation in romanized Korean.`;

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
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      alert("AI 서버 응답에 실패했습니다.");
      return;
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      alert("AI로부터 응답을 받지 못했습니다.");
      return;
    }

    aiResponse = data.candidates[0].content.parts[0].text;
  }

  const recommendations = aiResponse
    .split("\n")
    .filter((line) => line.trim() && line.includes("|"))
    .map((line) => {
      const [hangul, infoText, stroke, description] = line
        .split("|")
        .map((s) => s.trim());

      // 단일 자음/모음만 있는지 검사
      const isSingleConsonantOrVowel = /^[ㄱ-ㅎㅏ-ㅣ]$/.test(hangul);

      // 올바른 한글 글자인지 검사 (자음+모음 조합)
      const isProperHangul = /^[가-힣]+$/.test(hangul);

      // 유효하지 않은 한글이면 건너뜀
      if (isSingleConsonantOrVowel || !isProperHangul) {
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

      return {
        hangul,
        meaning,
        pronunciation,
        stroke: parseInt(stroke) || HangulWriter.getStrokeCount(hangul) || 1,
        description: description || `${hangul}에 대한 설명`,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((item) => item !== null); // null 항목 제거

  if (recommendations.length === 0) {
    alert("유효한 한글 추천을 받지 못했습니다.");
    return;
  }

  // 정확히 요청한 개수만큼 반환
  return recommendations.slice(0, amount);
}

// 로컬 환경에서 사용할 테스트 데이터 생성 함수
function getLocalTestData(subject, amount) {
  // 주제별 기본 단어 목록 (영어 의미와 로마자 발음 분리)
  const topicWords = {
    음식: [
      "밥|rice / bap|8|주식",
      "국|soup / guk|9|국물 요리",
      "반찬|side dish / banchan|18|밥과 함께 먹는 음식",
      "김치|kimchi / gimchi|19|대표적인 발효 음식",
      "떡|rice cake / tteok|10|쌀로 만든 음식",
      "비빔밥|bibimbap / bibimbap|20|밥과 야채를 섞은 요리",
      "불고기|bulgogi / bulgogi|22|쇠고기 요리",
      "라면|ramen / ramyeon|18|인스턴트 면 요리",
    ],
    학교: [
      "학생|student / haksaeng|20|배우는 사람",
      "선생|teacher / seonsaeng|22|가르치는 사람",
      "교실|classroom / gyosil|17|수업하는 공간",
      "책상|desk / chaeksang|18|공부하는 가구",
      "공부|study / gongbu|13|배우는 행위",
      "수업|class / sueop|16|교육 활동",
      "시험|exam / siheom|18|평가 활동",
      "교과서|textbook / gyogwaseo|25|학습 자료",
    ],
    자연: [
      "산|mountain / san|5|높은 지형",
      "바다|sea / bada|8|넓은 물",
      "강|river / gang|5|흐르는 물",
      "숲|forest / sup|16|나무가 많은 곳",
      "꽃|flower / kkot|10|아름다운 식물",
      "하늘|sky / haneul|12|공기 위 공간",
      "바람|wind / baram|10|움직이는 공기",
      "구름|cloud / gureum|14|수증기 덩어리",
    ],
    동물: [
      "개|dog / gae|4|가정에서 키우는 동물",
      "고양이|cat / goyangi|17|우아한 반려동물",
      "말|horse / mal|4|빠르게 달리는 동물",
      "소|cow / so|4|우유를 주는 동물",
      "닭|chicken / dak|9|알을 낳는 새",
      "토끼|rabbit / tokki|12|긴 귀의 동물",
      "돼지|pig / dwaeji|14|농장의 동물",
      "호랑이|tiger / horangi|21|큰 고양이과 동물",
    ],
    스포츠: [
      "축구|soccer / chukgu|17|공을 차는 운동",
      "농구|basketball / nonggu|22|공을 던지는 운동",
      "수영|swimming / suyeong|11|물에서 하는 운동",
      "달리기|running / dalligi|15|빠르게 움직이는 운동",
      "야구|baseball / yagu|18|공을 치는 운동",
      "테니스|tennis / teniseu|21|라켓으로 치는 운동",
      "배구|volleyball / baegu|18|네트 너머로 공을 넘기는 운동",
      "골프|golf / golpeu|16|공을 홀에 넣는 운동",
    ],
  };

  // 주제에 맞는 단어 목록 선택
  let words = [];
  for (const [topic, wordList] of Object.entries(topicWords)) {
    if (subject.includes(topic) || topic.includes(subject)) {
      words = wordList;
      break;
    }
  }

  // 매칭되는 주제가 없으면 모든 목록에서 랜덤 선택
  if (words.length === 0) {
    words = Object.values(topicWords).flat();
  }

  // 결과를 담을 배열
  const selectedWords = [];
  const usedIndices = new Set();

  // 중복 없이 최대한 선택
  while (selectedWords.length < amount && usedIndices.size < words.length) {
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

    // 올바른 형식으로 데이터 확인
    const validHangulData = {
      hangul: hangulData.hangul || "",
      pronunciation: hangulData.pronunciation || "",
      meaning: hangulData.meaning || hangulData.hangul,
      description: hangulData.description || `${hangulData.hangul}에 대한 설명`,
      stroke: hangulData.stroke || 1,
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

    // 올바른 한글인지 확인 (완전한 음절)
    if (!/^[가-힣]+$/.test(validHangulData.hangul)) {
      console.error("올바르지 않은 한글:", validHangulData.hangul);
      return false;
    }

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
  // 의미 기반 이모지 매핑 (핵심 단어별)
  const emojiMap = {
    // 음식 관련
    rice: ["🍚", "🍙", "🌾", "🍛", "🍱"],
    food: ["🍽️", "🍲", "🥘", "🍛", "🥣"],
    soup: ["🍲", "🥣", "🧂", "🔥", "🍵"],
    kimchi: ["🥬", "🌶️", "🥢", "🍲", "🇰🇷"],
    cake: ["🍰", "🎂", "🧁", "🍮", "🍥"],

    // 자연 관련
    mountain: ["⛰️", "🏔️", "🗻", "🌋", "🏞️"],
    sea: ["🌊", "🏖️", "🏝️", "🐚", "🌅"],
    river: ["🏞️", "💦", "🚣", "🌄", "🌿"],
    forest: ["🌲", "🌳", "🌿", "🍃", "🏞️"],
    flower: ["🌸", "🌹", "🌺", "🌷", "🌻"],

    // 동물 관련
    dog: ["🐕", "🐶", "🦮", "🐩", "🐾"],
    cat: ["🐈", "🐱", "😸", "😺", "🐾"],
    horse: ["🐎", "🐴", "🏇", "🐮", "🌾"],
    chicken: ["🐔", "🐓", "🐤", "🐣", "🥚"],
    cow: ["🐄", "🐮", "🥛", "🧀", "🌱"],

    // 학교 관련
    student: ["👨‍🎓", "👩‍🎓", "📚", "✏️", "🎒"],
    teacher: ["👨‍🏫", "👩‍🏫", "📝", "📚", "🏫"],
    classroom: ["🏫", "👨‍🎓", "👩‍🎓", "📚", "🪑"],
    desk: ["🪑", "📚", "✏️", "📝", "💻"],
    study: ["📚", "📝", "✏️", "🧠", "👨‍🎓"],

    // 스포츠 관련
    soccer: ["⚽", "🥅", "👟", "🏃", "🏆"],
    basketball: ["🏀", "🏃", "👟", "🏆", "🔄"],
    swimming: ["🏊", "🏊‍♀️", "💦", "🏊‍♂️", "🌊"],
    running: ["🏃", "🏃‍♀️", "👟", "⏱️", "🏆"],
    baseball: ["⚾", "🏏", "🧢", "⚾", "🏆"],

    // 다양한 범주
    water: ["💧", "🚿", "🌊", "🚰", "🏊"],
    fire: ["🔥", "🧯", "🌋", "🔥", "🧨"],
    earth: ["🌍", "🌎", "🌏", "🌱", "🏔️"],
    air: ["💨", "🌬️", "🌪️", "☁️", "🪁"],
    sun: ["☀️", "🌞", "☀️", "🌅", "🌇"],
    moon: ["🌙", "🌕", "🌖", "🌗", "🌘"],
    star: ["⭐", "🌟", "✨", "💫", "🌠"],
    book: ["📚", "📖", "📕", "📗", "📘"],
    music: ["🎵", "🎶", "🎸", "🎹", "🎷"],
    love: ["❤️", "💕", "💓", "💗", "💖"],
    home: ["🏠", "🏡", "🪑", "🛏️", "🚪"],
    car: ["🚗", "🚙", "🚘", "🚔", "🚖"],
    bus: ["🚌", "🚍", "🚏", "🛣️", "🚐"],
    train: ["🚂", "🚄", "🚅", "🚆", "🚇"],
    airplane: ["✈️", "🛩️", "🛫", "🛬", "🌤️"],
    phone: ["📱", "📞", "☎️", "📲", "💻"],
    computer: ["💻", "⌨️", "🖱️", "🖥️", "📊"],
    tv: ["📺", "🎮", "📡", "🎬", "🍿"],
    camera: ["📷", "📸", "🎥", "📹", "🎬"],
    pen: ["✒️", "🖋️", "🖊️", "✏️", "📝"],
  };

  // 대표 한글 단어별 이모지 매핑 (빠른 검색용)
  const koreanEmojiMap = {
    밥: ["🍚", "🍙", "🌾", "🍛", "🍱"],
    국: ["🍲", "🥣", "🧂", "🔥", "🍵"],
    반찬: ["🍽️", "🥢", "🥗", "🥘", "🍛"],
    김치: ["🥬", "🌶️", "🥢", "🍲", "🇰🇷"],
    떡: ["🍰", "🍡", "🍘", "🍶", "🍵"],
    학생: ["👨‍🎓", "👩‍🎓", "📚", "✏️", "🎒"],
    선생: ["👨‍🏫", "👩‍🏫", "📝", "📚", "🏫"],
    교실: ["🏫", "👨‍🎓", "👩‍🎓", "📚", "🪑"],
    책상: ["🪑", "📚", "✏️", "📝", "💻"],
    공부: ["📚", "📝", "✏️", "🧠", "👨‍🎓"],
    산: ["⛰️", "🏔️", "🗻", "🌋", "🏞️"],
    바다: ["🌊", "🏖️", "🏝️", "🐚", "🌅"],
    강: ["🏞️", "💦", "🚣", "🌄", "🌿"],
    숲: ["🌲", "🌳", "🌿", "🍃", "🏞️"],
    꽃: ["🌸", "🌹", "🌺", "🌷", "🌻"],
    개: ["🐕", "🐶", "🦮", "🐩", "🐾"],
    고양이: ["🐈", "🐱", "😸", "😺", "🐾"],
    말: ["🐎", "🐴", "🏇", "🐮", "🌾"],
    소: ["🐄", "🐮", "🥛", "🧀", "🌱"],
    닭: ["🐔", "🐓", "🐤", "🐣", "🥚"],
    축구: ["⚽", "🥅", "👟", "🏃", "🏆"],
    농구: ["🏀", "🏃", "👟", "🏆", "🔄"],
    수영: ["🏊", "🏊‍♀️", "💦", "🏊‍♂️", "🌊"],
    달리기: ["🏃", "🏃‍♀️", "👟", "⏱️", "🏆"],
    야구: ["⚾", "🏏", "🧢", "⚾", "🏆"],
  };

  // 이모지 찾기 로직
  let emoji;

  // 한글 단어가 매핑에 있는지 확인
  if (koreanEmojiMap[hangul]) {
    const emojiArray = koreanEmojiMap[hangul];
    emoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
  }
  // 영어 의미가 매핑에 있는지 확인
  else {
    // 영어 의미를 소문자로 변환하고 정리
    const cleanMeaning = meaning.toLowerCase().trim();

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
    } else {
      // 매칭되는 키워드가 없으면 기본 이모지 세트에서 선택
      const defaultEmojis = [
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
      ];
      emoji = defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
    }
  }

  return emoji;
}
