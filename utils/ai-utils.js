import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { fetchAndDisplayWords } from "./word-list-utils.js";

const GEMINI_API_KEY = "apiKeys.GEMINI_API_KEY";
const GEMINI_API_URL = "apiKeys.GEMINI_API_URL";

export async function handleAIRecommendation(currentUser, db) {
  const subject = prompt("추천받을 주제를 입력해주세요.");
  if (!subject) return;

  let amount;
  do {
    amount = prompt("추천을 받을 한글의 개수를 입력해주세요. (1~50)");
  } while (!amount.match(/^\d+$/) || amount < 1 || amount > 50);

  amount = Number(amount);

  const loadingDiv = document.createElement("div");
  loadingDiv.textContent = "한글을 추천받는 중입니다...";
  loadingDiv.className =
    "fixed top-0 left-0 w-full bg-blue-500 text-white text-center p-2";

  try {
    document.body.appendChild(loadingDiv);
    const recommendations = await getHangulRecommendation(subject, amount);
    await Promise.all(
      recommendations.map((hangulData) =>
        saveRecommendedHangul(currentUser, db, hangulData)
      )
    );
    alert(`${amount}개의 한글이 성공적으로 추천되어 저장되었습니다.`);
    await fetchAndDisplayWords(currentUser, db, "ai");
  } catch (error) {
    alert(error.message);
    console.error(error);
  } finally {
    loadingDiv.remove();
  }
}

async function getHangulRecommendation(subject, amount) {
  const prompt = `Recommend ${amount} Korean characters (Hangul) related to the following topic: ${subject}.  
      Follow this exact format for each character:  
      Hangul|Korean Pronunciation|Stroke Count|Description (in Korean, max 10 characters)  
      
      ### Important Rules:  
      1. The Korean pronunciation must strictly follow the format: "meaning + pronunciation" (e.g., "나무 나", "물 물").  
      2. Each response must contain exactly **one** Hangul character (no two-character words).  
      3. The character must be a basic Korean characters (mainly consonants ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅅ,ㅇ,ㅈ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ and vowels ㅏ,ㅑ,ㅓ,ㅕ,ㅗ,ㅛ,ㅜ,ㅠ,ㅡ,ㅣ).
      4. The stroke count must be **100% accurate**.
      5. The description and pronunciation must be written in **Korean**.  
      6. Each line should contain only one entry, and the format should be followed exactly.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

  const recommendations = data.candidates[0].content.parts[0].text
    .split("\n")
    .filter((line) => line.trim() && line.includes("|"))
    .map((line) => {
      const [hangul, meaning, stroke, description] = line
        .split("|")
        .map((s) => s.trim());

      // HangulWriter에서 획수 가져오기 또는 기본값 사용
      const strokeCount =
        HangulWriter.getStrokeCount(hangul) || parseInt(stroke) || 1;

      return {
        hangul,
        meaning,
        stroke: strokeCount,
        description,
        createdAt: new Date().toISOString(),
      };
    });

  if (recommendations.length === 0) {
    alert("유효한 한글 추천을 받지 못했습니다.");
    return;
  }

  return recommendations;
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
      return;
    }

    await updateDoc(userRef, { aiUsage });

    const recommendRef = doc(
      db,
      "ai-recommend",
      currentUser.email,
      "ai-recommend",
      hangulData.hangul
    );

    await setDoc(recommendRef, hangulData);
  } catch (error) {
    console.error("한글 저장 중 오류: ", error);
    alert("한글 저장 중 에러가 발생했습니다.");
  }
}
