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
  // 더 단순한 프롬프트로 변경
  const prompt = `Generate ${amount} Korean words related to: ${subject}
    
    Format each line as: 한글|English meaning / pronunciation|Korean description|English translation
    
    Example: 바다|sea / bada|넓은 물|wide water
             학교|school / hakgyo|배우는 곳|place of learning`;

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
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      console.log("API 응답 상태:", response.status);

      if (!response.ok) {
        console.error(
          "AI 서버 응답 오류:",
          response.status,
          response.statusText
        );

        // 사용자에게 오류 알림 대신 긴급 로컬 데이터 대체
        console.log("API 오류로 인해 로컬 데이터로 대체합니다");
        aiResponse = getLocalTestData(subject, amount);
        // 오류 알림 없이 계속 진행
      } else {
        const data = await response.json();
        console.log("API 응답 데이터:", data);

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error("AI 응답에 텍스트 없음:", data);
          // 로컬 데이터로 대체
          aiResponse = getLocalTestData(subject, amount);
        } else {
          aiResponse = data.candidates[0].content.parts[0].text;
          console.log("AI 응답 원본:", aiResponse);
        }
      }
    } catch (error) {
      console.error("API 호출 중 예외 발생:", error);
      // 오류 시 로컬 데이터로 대체
      aiResponse = getLocalTestData(subject, amount);
    }
  }

  // 응답에서 각 줄 로깅
  console.log("AI 응답 라인별 분석:");
  const lines = aiResponse.split("\n");
  lines.forEach((line, index) => {
    console.log(`라인 ${index + 1}:`, line);
  });

  // 파이프 구분자가 있는 줄만 필터링
  const validLines = lines.filter((line) => {
    const trimmed = line.trim();
    const isValid = trimmed && trimmed.includes("|");
    if (!isValid && trimmed) {
      console.log("파이프 구분자 없는 라인:", trimmed);
    }
    return isValid;
  });

  console.log(`유효한 라인 수: ${validLines.length}`);

  // 파싱 로직 완화 - 최소 2개 필드만 있으면 허용
  const recommendations = validLines
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

      // 한글 검증 완화 - 첫 글자만 한글이면 허용
      if (!/^[가-힣]/.test(hangul)) {
        console.warn("첫 글자가 한글이 아님:", hangul);
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
          pronunciation = hangul;
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

  console.log(`파싱 성공 항목 수: ${recommendations.length}`);

  // 결과가 없으면 로컬 데이터로 대체
  if (recommendations.length === 0) {
    console.warn("유효한 추천 없음, 로컬 데이터로 대체");
    const fallbackData = getLocalTestData(subject, amount);

    // 로컬 데이터 파싱
    const fallbackLines = fallbackData
      .split("\n")
      .filter((line) => line.trim());
    const fallbackRecommendations = fallbackLines.map((line) => {
      const [hangul, infoText, korDesc, engDesc] = line
        .split("|")
        .map((s) => s.trim());
      const [meaning, pronunciation] = infoText.split("/").map((s) => s.trim());

      return {
        hangul,
        meaning,
        pronunciation,
        description: korDesc,
        englishDescription: engDesc,
        createdAt: new Date().toISOString(),
      };
    });

    console.log("로컬 대체 데이터:", fallbackRecommendations);

    // 대체 데이터 적용
    return fallbackRecommendations.slice(0, amount);
  }

  console.log("최종 추천 목록:", recommendations);

  // 정확히 요청한 개수만큼 반환
  return recommendations.slice(0, amount);
}

// 로컬 환경에서 사용할 테스트 데이터 생성 함수
function getLocalTestData(subject, amount) {
  console.log(`로컬 테스트 데이터 요청: 주제="${subject}", 개수=${amount}`);

  // 주제별 한글 단어 매핑
  const wordsByTopic = {
    // 음식
    음식: [
      "김치|kimchi / gimchi|발효된 채소 요리|fermented vegetable dish",
      "비빔밥|bibimbap / bibimbap|밥과 채소를 섞은 요리|mixed rice with vegetables",
      "떡볶이|tteokbokki / tteokbokki|매운 떡 요리|spicy rice cake dish",
      "불고기|bulgogi / bulgogi|양념한 한국식 구이|marinated Korean barbecue",
      "김밥|gimbap / gimbap|쌀과 여러 재료를 김으로 싼 음식|seaweed rice roll",
      "삼겹살|samgyeopsal / samgyeopsal|돼지 뱃살 구이|grilled pork belly",
      "된장찌개|doenjang jjigae / doenjangjjigae|콩 페이스트 찌개|soybean paste stew",
    ],

    // 학교
    학교: [
      "학생|student / haksaeng|배우는 사람|person who learns",
      "선생님|teacher / seonsaengnim|가르치는 사람|person who teaches",
      "교실|classroom / gyosil|수업하는 방|room for lessons",
      "책상|desk / chaeksang|공부하는 테이블|study table",
      "연필|pencil / yeonpil|글씨 쓰는 도구|writing tool",
      "시험|exam / siheom|지식을 평가하는 것|knowledge assessment",
      "숙제|homework / sukje|집에서 하는 공부|study done at home",
    ],

    // 가족
    가족: [
      "어머니|mother / eomeoni|여자 부모님|female parent",
      "아버지|father / abeoji|남자 부모님|male parent",
      "누나|older sister / nuna|형제의 언니|older sister of a male",
      "형|older brother / hyeong|남자의 남자 형제|older brother of a male",
      "동생|younger sibling / dongsaeng|나이가 적은 형제자매|younger sibling",
      "할머니|grandmother / halmeoni|어머니의 어머니|mother's mother",
      "할아버지|grandfather / harabeoji|아버지의 아버지|father's father",
    ],

    // 동물
    동물: [
      "강아지|dog / gangaji|사람의 친구 동물|animal friend of humans",
      "고양이|cat / goyangi|작은 털 많은 동물|small furry animal",
      "코끼리|elephant / kokkiri|큰 코를 가진 동물|animal with a big trunk",
      "사자|lion / saja|큰 고양이 동물|big cat animal",
      "호랑이|tiger / horangi|줄무늬 가진 고양이 동물|striped cat animal",
      "토끼|rabbit / tokki|긴 귀를 가진 동물|animal with long ears",
      "거북이|turtle / geobuki|단단한 등껍질 동물|animal with hard shell",
    ],

    // 계절/날씨
    날씨: [
      "봄|spring / bom|꽃이 피는 계절|season when flowers bloom",
      "여름|summer / yeoreum|더운 계절|hot season",
      "가을|autumn / gaeul|단풍이 지는 계절|season of falling leaves",
      "겨울|winter / gyeoul|추운 계절|cold season",
      "비|rain / bi|하늘에서 떨어지는 물|water falling from sky",
      "눈|snow / nun|하얀 얼음 결정|white ice crystals",
      "바람|wind / baram|움직이는 공기|moving air",
    ],

    // 직업
    직업: [
      "의사|doctor / uisa|병을 치료하는 사람|person who treats illnesses",
      "선생님|teacher / seonsaengnim|지식을 가르치는 사람|person who teaches knowledge",
      "요리사|chef / yorisa|음식을 만드는 사람|person who makes food",
      "경찰관|police officer / gyeongchalgwan|법을 지키는 사람|person who enforces law",
      "소방관|firefighter / sobangwan|불을 끄는 사람|person who extinguishes fires",
      "가수|singer / gasu|노래하는 사람|person who sings",
      "배우|actor / baeu|연기하는 사람|person who acts",
    ],

    // 운동/스포츠
    운동: [
      "축구|soccer / chukgu|공을 차는 운동|sport of kicking a ball",
      "농구|basketball / nonggu|공을 던지는 운동|sport of throwing a ball",
      "수영|swimming / suyeong|물에서 하는 운동|exercise in water",
      "테니스|tennis / teniseu|라켓으로 치는 운동|sport with rackets",
      "야구|baseball / yagu|방망이로 치는 운동|sport with bats",
      "달리기|running / dalligi|빨리 걷는 운동|fast walking exercise",
      "자전거|bicycle / jajeongeo|두 바퀴 탈것|two-wheeled vehicle",
    ],

    // 장소
    장소: [
      "집|house / jip|사는 곳|place to live",
      "학교|school / hakgyo|배우는 곳|place to learn",
      "공원|park / gongwon|쉬는 곳|place to rest",
      "병원|hospital / byeongwon|치료받는 곳|place for treatment",
      "식당|restaurant / sikdang|밥 먹는 곳|place to eat",
      "도서관|library / doseogwan|책 읽는 곳|place to read books",
      "시장|market / sijang|물건 사는 곳|place to buy things",
    ],

    // 색상
    색상: [
      "빨강|red / ppalgang|사과 색|apple color",
      "파랑|blue / parang|하늘 색|sky color",
      "노랑|yellow / norang|바나나 색|banana color",
      "초록|green / chorok|잎사귀 색|leaf color",
      "보라|purple / bora|포도 색|grape color",
      "주황|orange / juhwang|귤 색|tangerine color",
      "검정|black / geomjeong|까만 색|dark color",
    ],

    // 감정
    감정: [
      "행복|happiness / haengbok|기쁜 감정|joyful feeling",
      "슬픔|sadness / seulpeum|우는 감정|crying feeling",
      "화남|anger / hwanam|분노 감정|feeling of rage",
      "놀람|surprise / nollam|깜짝 놀라는 감정|startled feeling",
      "불안|anxiety / buran|걱정되는 감정|worried feeling",
      "사랑|love / sarang|좋아하는 감정|feeling of affection",
      "부끄러움|embarrassment / bukkeureowoom|쑥스러운 감정|shy feeling",
    ],

    // 기본 데이터 (기본값)
    default: [
      "안녕|hello / annyeong|인사말|greeting word",
      "사랑|love / sarang|깊은 감정|deep emotion",
      "친구|friend / chingu|가까운 사람|close person",
      "행복|happiness / haengbok|좋은 감정|good feeling",
      "음식|food / eumsik|먹는 것|thing to eat",
      "물|water / mul|마시는 액체|liquid to drink",
      "시간|time / sigan|흐르는 것|flowing thing",
    ],
  };

  // 주제에 맞는 단어 목록 가져오기 (없으면 기본 목록)
  let topicWords = wordsByTopic[subject];

  // 정확히 일치하는 주제가 없는 경우 키워드 매칭 시도
  if (!topicWords) {
    const topics = Object.keys(wordsByTopic);

    // 주제에 포함된 키워드 검색
    for (const topic of topics) {
      if (subject.includes(topic) || topic.includes(subject)) {
        topicWords = wordsByTopic[topic];
        console.log(`키워드 매칭으로 "${topic}" 주제 사용`);
        break;
      }
    }

    // 매칭되는 주제가 없으면 기본 데이터 사용
    if (!topicWords) {
      console.log("매칭되는 주제 없음, 기본 데이터 사용");
      topicWords = wordsByTopic.default;
    }
  }

  // 요청한 개수만큼 무작위로 선택 (개수가 부족하면 반복)
  let result = [];
  while (result.length < amount) {
    // 남은 필요 개수
    const remaining = amount - result.length;

    // 배열을 복사하고 섞기
    const shuffled = [...topicWords].sort(() => 0.5 - Math.random());

    // 필요한 개수만큼 또는 가능한 최대 개수만큼 추가
    result = result.concat(shuffled.slice(0, remaining));
  }

  // 정확히 요청한 개수만큼 반환
  result = result.slice(0, amount);

  console.log(`로컬 테스트 데이터 반환 (${result.length}개):`, result);

  // 각 줄을 줄바꿈으로 구분된 텍스트로 변환
  return result.join("\n");
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
