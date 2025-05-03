import { loadNavbar } from "../../components/js/navbar.js";
import {
  collection,
  query,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 게임에 필요한 전역 변수
let sourceLanguage = "korean";
let targetLanguage = "english";
let currentGame = null;
let gameWords = [];
let score = 0;
let timerInterval = null;
let memoryPairs = 0;
let canSelect = true;
let firstCard = null;
let secondCard = null;

// 게임별 필요한 단어 수
const gameWordCount = {
  "word-matching": 8,
  "word-scramble": 10,
  "memory-game": 8,
};

// 기본 단어 세트 (Firebase 사용 불가능할 때 대체용)
const defaultWords = [
  {
    id: "word1",
    domain: "food",
    emoji: "🍎",
    languages: {
      korean: { word: "사과" },
      english: { word: "apple" },
      japanese: { word: "りんご" },
      chinese: { word: "苹果" },
    },
  },
  {
    id: "word2",
    domain: "food",
    emoji: "🍌",
    languages: {
      korean: { word: "바나나" },
      english: { word: "banana" },
      japanese: { word: "バナナ" },
      chinese: { word: "香蕉" },
    },
  },
  {
    id: "word3",
    domain: "animal",
    emoji: "🐱",
    languages: {
      korean: { word: "고양이" },
      english: { word: "cat" },
      japanese: { word: "猫" },
      chinese: { word: "猫" },
    },
  },
  {
    id: "word4",
    domain: "animal",
    emoji: "🐶",
    languages: {
      korean: { word: "개" },
      english: { word: "dog" },
      japanese: { word: "犬" },
      chinese: { word: "狗" },
    },
  },
  {
    id: "word5",
    domain: "nature",
    emoji: "💧",
    languages: {
      korean: { word: "물" },
      english: { word: "water" },
      japanese: { word: "水" },
      chinese: { word: "水" },
    },
  },
  {
    id: "word6",
    domain: "object",
    emoji: "📚",
    languages: {
      korean: { word: "책" },
      english: { word: "book" },
      japanese: { word: "本" },
      chinese: { word: "书" },
    },
  },
  {
    id: "word7",
    domain: "transport",
    emoji: "🚗",
    languages: {
      korean: { word: "차" },
      english: { word: "car" },
      japanese: { word: "車" },
      chinese: { word: "车" },
    },
  },
  {
    id: "word8",
    domain: "place",
    emoji: "🏠",
    languages: {
      korean: { word: "집" },
      english: { word: "house" },
      japanese: { word: "家" },
      chinese: { word: "家" },
    },
  },
  {
    id: "word9",
    domain: "nature",
    emoji: "☀️",
    languages: {
      korean: { word: "태양" },
      english: { word: "sun" },
      japanese: { word: "太陽" },
      chinese: { word: "太阳" },
    },
  },
  {
    id: "word10",
    domain: "nature",
    emoji: "🌙",
    languages: {
      korean: { word: "달" },
      english: { word: "moon" },
      japanese: { word: "月" },
      chinese: { word: "月亮" },
    },
  },
  {
    id: "word11",
    domain: "food",
    emoji: "🍞",
    languages: {
      korean: { word: "빵" },
      english: { word: "bread" },
      japanese: { word: "パン" },
      chinese: { word: "面包" },
    },
  },
  {
    id: "word12",
    domain: "body",
    emoji: "👁️",
    languages: {
      korean: { word: "눈" },
      english: { word: "eye" },
      japanese: { word: "目" },
      chinese: { word: "眼睛" },
    },
  },
  {
    id: "word13",
    domain: "nature",
    emoji: "🌳",
    languages: {
      korean: { word: "나무" },
      english: { word: "tree" },
      japanese: { word: "木" },
      chinese: { word: "树" },
    },
  },
  {
    id: "word14",
    domain: "color",
    emoji: "🔴",
    languages: {
      korean: { word: "빨강" },
      english: { word: "red" },
      japanese: { word: "赤" },
      chinese: { word: "红色" },
    },
  },
  {
    id: "word15",
    domain: "color",
    emoji: "🔵",
    languages: {
      korean: { word: "파랑" },
      english: { word: "blue" },
      japanese: { word: "青" },
      chinese: { word: "蓝色" },
    },
  },
  {
    id: "word16",
    domain: "food",
    emoji: "🍚",
    languages: {
      korean: { word: "밥" },
      english: { word: "rice" },
      japanese: { word: "ご飯" },
      chinese: { word: "米饭" },
    },
  },
];

// 언어 코드와 DB 언어 키 간 매핑
const languageMapping = {
  ko: "korean",
  en: "english",
  ja: "japanese",
  zh: "chinese",
};

// DB 언어 키와 UI 언어 코드 간 매핑 (역방향)
const reverseLanguageMapping = {
  korean: "ko",
  english: "en",
  japanese: "ja",
  chinese: "zh",
};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadNavbar();

    // 게임 컨테이너 확인 로그 추가
    console.log(
      "메모리 게임 컨테이너:",
      document.getElementById("memory-game")
    );
    console.log(
      "단어 맞추기 컨테이너:",
      document.getElementById("word-matching-game")
    );
    console.log(
      "단어 섞기 컨테이너:",
      document.getElementById("word-scramble-game")
    );

    // UI 언어 변경 이벤트 리스너 등록
    document.addEventListener("languageChanged", updateGameLabels);

    // 언어 선택 이벤트 리스너
    document
      .getElementById("source-language")
      .addEventListener("change", (e) => {
        sourceLanguage = e.target.value;
        if (currentGame) loadGame(currentGame);
      });

    document
      .getElementById("target-language")
      .addEventListener("change", (e) => {
        targetLanguage = e.target.value;
        if (currentGame) loadGame(currentGame);
      });

    // 게임 카드 선택 이벤트 리스너
    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", () => {
        const gameType = card.getAttribute("data-game");
        console.log(`게임 카드 클릭됨: ${gameType}`);

        // 이전 게임 타이머 정리
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        // 활성 카드 스타일 변경
        document.querySelectorAll(".game-card").forEach((c) => {
          c.classList.remove("active");
        });
        card.classList.add("active");

        // 게임 로드에 정확한 게임 타입 문자열 전달 확인
        if (gameType === "memory-game") {
          // 메모리 게임 컨테이너 미리 확인
          const memoryGameContainer = document.getElementById("memory-game");
          console.log(
            "메모리 게임 컨테이너 확인 (클릭 시):",
            memoryGameContainer
          );
          if (!memoryGameContainer) {
            console.error("메모리 게임 컨테이너가 없습니다!");
            return;
          }
        }

        // 게임 로드
        loadGame(gameType);
      });
    });

    // 게임 재시작 버튼 이벤트 리스너
    document
      .getElementById("restart-matching")
      .addEventListener("click", () => restartGame("word-matching"));
    document
      .getElementById("restart-scramble")
      .addEventListener("click", () => restartGame("word-scramble"));
    document
      .getElementById("restart-memory")
      .addEventListener("click", () => restartGame("memory-game"));

    // 단어 섞기 게임 확인 버튼
    document
      .getElementById("check-scramble")
      .addEventListener("click", checkScrambleAnswer);

    // 자동으로 첫 번째 게임 카드 클릭 (기본 게임 표시)
    setTimeout(() => {
      const firstGameCard = document.querySelector(
        ".game-card[data-game='word-matching']"
      );
      if (firstGameCard) {
        firstGameCard.click();
      }
    }, 500);
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
  }
});

// 게임 레이블 업데이트 함수
async function updateGameLabels() {
  // 게임 UI의 레이블을 현재 언어로 업데이트
  const activeLanguage = await getActiveLanguage();
  // 필요한 경우 여기에 번역 로직 추가
}

// 게임 로드 함수
async function loadGame(gameType) {
  console.log("게임 로드 시작: ", gameType);
  currentGame = gameType;
  score = 0;
  memoryPairs = 0;

  // 모든 게임 컨테이너 숨기기
  document.querySelectorAll(".game-container").forEach((container) => {
    container.style.display = "none";
  });
  document.getElementById("game-intro").style.display = "none";

  // 메모리 게임인 경우 디버깅 로그 추가
  if (gameType === "memory-game") {
    console.log("메모리 게임 컨테이너 ID 확인:", gameType);
    // 모든 game-container 클래스를 가진 요소 로깅
    document.querySelectorAll(".game-container").forEach((container) => {
      console.log("컨테이너 ID:", container.id);
    });
  }

  // 선택한 게임 표시
  let gameContainer = document.getElementById(`${gameType}-game`);

  // ID로 찾지 못한 경우 클래스로 찾기 시도
  if (!gameContainer && gameType === "memory-game") {
    const containers = document.querySelectorAll(".game-container");
    containers.forEach((container) => {
      if (container.querySelector("h2[data-i18n='memory_game_title']")) {
        gameContainer = container;
        console.log("메모리 게임 컨테이너를 클래스와 제목으로 찾았습니다.");
      }
    });
  }

  if (gameContainer) {
    gameContainer.style.display = "block";
    console.log(`${gameType} 게임 컨테이너 표시됨`);
  } else {
    console.error(`${gameType} 게임 컨테이너를 찾을 수 없음`);
    // 컨테이너가 없으면 다시 인트로 화면 표시하고 중단
    document.getElementById("game-intro").style.display = "block";
    return;
  }

  // 게임에 필요한 단어 로드
  await loadGameWords();

  // 게임 유형에 따라 초기화
  console.log(`${gameType} 게임 초기화 시작`);
  switch (gameType) {
    case "word-matching":
      initWordMatchingGame();
      break;
    case "word-scramble":
      initWordScrambleGame();
      break;
    case "memory-game":
      console.log("메모리 게임 초기화 호출 전");
      // ID로 직접 찾기 대신 gameContainer 내부에서 찾기
      const memoryBoard =
        gameContainer.querySelector("#memory-board") ||
        gameContainer.querySelector(".grid");

      if (!memoryBoard) {
        console.error("메모리 보드를 찾을 수 없음");
        return;
      }
      memoryBoard.innerHTML = "";
      console.log("메모리 보드 초기화됨:", memoryBoard);
      initMemoryGame();
      break;
  }
  console.log(`${gameType} 게임 초기화 완료`);
}

// 게임 단어 로드 함수
async function loadGameWords() {
  try {
    console.log(
      `단어 로드 시작 - 소스 언어: ${sourceLanguage}, 타겟 언어: ${targetLanguage}`
    );
    // 단어장 콜렉션에서 단어 가져오기
    const conceptsRef = collection(db, "concepts");

    // Firebase에서는 != 필터를 여러 개 사용할 수 없으므로 대안적인 접근 방식 사용
    // 소스 언어 필터만 적용하고 결과를 수동으로 필터링
    const q = query(
      conceptsRef,
      where(`expressions.${sourceLanguage}.word`, "!=", "")
    );

    console.log("Firebase 쿼리 실행");
    const querySnapshot = await getDocs(q);
    const words = [];

    // 쿼리 결과에서 타겟 언어도 있는 단어만 필터링
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.expressions &&
        data.expressions[sourceLanguage] &&
        data.expressions[targetLanguage] &&
        data.expressions[targetLanguage].word !== ""
      ) {
        words.push({
          id: doc.id,
          source: data.expressions[sourceLanguage].word,
          target: data.expressions[targetLanguage].word,
          domain: data.domain || "",
          emoji: data.emoji || "",
        });
      }
    });

    console.log(`Firebase에서 가져온 단어 수: ${words.length}`);

    // Firebase에서 가져온 단어가 없거나 적으면 기본 단어 세트 사용
    if (words.length < gameWordCount[currentGame]) {
      console.log(
        "Firebase에서 충분한 단어를 불러오지 못했습니다. 기본 단어 세트를 사용합니다."
      );

      // 기본 단어 세트에서 단어 변환
      const defaultWordsMapped = defaultWords.map((word) => ({
        id: word.id,
        source: word.languages[sourceLanguage].word,
        target: word.languages[targetLanguage].word,
        domain: word.domain || "",
        emoji: word.emoji || "",
      }));

      // 단어 셔플 후 필요한 수만큼 가져오기
      const shuffledWords = defaultWordsMapped.sort(() => 0.5 - Math.random());
      gameWords = shuffledWords.slice(0, gameWordCount[currentGame] || 10);
    } else {
      // 단어 셔플 후 필요한 수만큼 가져오기
      const shuffledWords = words.sort(() => 0.5 - Math.random());
      gameWords = shuffledWords.slice(0, gameWordCount[currentGame] || 10);
    }

    console.log(`최종 게임 단어 수: ${gameWords.length}`);
    console.log("게임 단어 목록:", gameWords);
    return gameWords;
  } catch (error) {
    console.error("단어 로드 중 오류 발생:", error);

    // 오류 발생 시 기본 단어 세트 사용
    console.log("오류가 발생하여 기본 단어 세트를 사용합니다.");

    // 기본 단어 세트에서 단어 변환
    const defaultWordsMapped = defaultWords.map((word) => ({
      id: word.id,
      source: word.languages[sourceLanguage].word,
      target: word.languages[targetLanguage].word,
      domain: word.domain || "",
      emoji: word.emoji || "",
    }));

    // 단어 셔플 후 필요한 수만큼 가져오기
    const shuffledWords = defaultWordsMapped.sort(() => 0.5 - Math.random());
    gameWords = shuffledWords.slice(0, gameWordCount[currentGame] || 10);
    console.log("기본 단어 목록:", gameWords);

    return gameWords;
  }
}

// 게임 재시작 함수
function restartGame(gameType) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  loadGame(gameType);
}

// 타이머 시작 함수
function startTimer(elementId, duration, onComplete) {
  let timeLeft = duration;

  // 타이머 요소 찾기
  let timerElement = document.getElementById(elementId);

  // ID로 못 찾은 경우 현재 활성화된 게임 컨테이너 내에서 찾기
  if (!timerElement) {
    const gameContainer = document.querySelector(
      '.game-container[style*="display: block"]'
    );
    if (gameContainer) {
      timerElement = gameContainer.querySelector(`#${elementId}`);
    }
  }

  if (!timerElement) {
    console.error(`타이머 요소를 찾을 수 없습니다: ${elementId}`);
    return;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerElement.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (onComplete) onComplete();
    }
  }, 1000);
}

// 게임 완료 처리 함수
function completeGame(message) {
  console.log("게임 완료:", message);

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 게임 완료 메시지 표시
  setTimeout(() => {
    alert(message);

    // 게임 인트로 화면으로 되돌아가기
    document.querySelectorAll(".game-container").forEach((container) => {
      container.style.display = "none";
    });
    const introContainer = document.getElementById("game-intro");
    if (introContainer) {
      introContainer.style.display = "block";
    }

    // 게임 카드 선택 상태 초기화
    document.querySelectorAll(".game-card").forEach((card) => {
      card.classList.remove("active");
    });
  }, 500);
}

// ======== 단어 맞추기 게임 함수 ========

// 단어 맞추기 게임 초기화
function initWordMatchingGame() {
  const sourceWordsContainer = document.querySelector(".source-words");
  const targetWordsContainer = document.querySelector(".target-words");

  sourceWordsContainer.innerHTML = "";
  targetWordsContainer.innerHTML = "";

  document.getElementById("matching-score").textContent = "0";
  score = 0;

  // 단어 카드 생성
  const targetWordsCopy = [...gameWords].sort(() => 0.5 - Math.random());

  gameWords.forEach((word, index) => {
    // 원본 단어 카드
    const sourceCard = createWordCard(word.source, index, "source");
    sourceWordsContainer.appendChild(sourceCard);

    // 대상 단어 카드
    const targetIndex = targetWordsCopy.findIndex((w) => w.id === word.id);
    const targetCard = createWordCard(
      targetWordsCopy[targetIndex].target,
      targetIndex,
      "target"
    );
    targetWordsContainer.appendChild(targetCard);
  });

  // 드래그 앤 드롭 설정
  setupDragAndDrop();

  // 타이머 시작
  startTimer("matching-timer", 60, () => {
    completeGame(`시간이 종료되었습니다! 최종 점수: ${score}점`);
  });
}

// 단어 카드 생성 함수
function createWordCard(word, index, type) {
  const card = document.createElement("div");
  card.className =
    "bg-[#F3E5F5] p-4 rounded-lg shadow-md text-center cursor-move";
  card.setAttribute("draggable", "true");
  card.setAttribute("data-index", index);
  card.setAttribute("data-type", type);
  card.textContent = word;

  // 드래그 이벤트
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        index: index,
        type: type,
      })
    );
    // 드래그 효과 설정
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      card.classList.add("opacity-50");
    }, 0);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("opacity-50");
  });

  // 모바일 터치 이벤트 (터치할 때 효과 표시)
  card.addEventListener("touchstart", () => {
    card.classList.add("bg-[#E1BEE7]");
  });

  card.addEventListener("touchend", () => {
    card.classList.remove("bg-[#E1BEE7]");
  });

  // 클릭 이벤트 추가 (모바일에서 드래그 대체용)
  card.addEventListener("click", () => {
    // 이미 선택된 카드가 있는지 확인
    const selectedCard = document.querySelector(".selected-card");

    if (selectedCard) {
      // 이미 선택된 카드가 있다면, 현재 카드와 매칭 시도
      const selectedType = selectedCard.getAttribute("data-type");
      const selectedIndex = parseInt(selectedCard.getAttribute("data-index"));

      // 같은 유형의 카드면 무시
      if (type === selectedType) {
        selectedCard.classList.remove("selected-card", "bg-[#E1BEE7]");
        return;
      }

      // 매칭 확인 (소스 카드가 선택되었다면 현재는 타겟, 그 반대도 마찬가지)
      if (type === "source") {
        checkWordMatch(index, selectedIndex);
      } else {
        checkWordMatch(selectedIndex, index);
      }

      // 선택 상태 해제
      selectedCard.classList.remove("selected-card", "bg-[#E1BEE7]");
    } else {
      // 카드 선택 표시
      card.classList.add("selected-card", "bg-[#E1BEE7]");
    }
  });

  return card;
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
  const cards = document.querySelectorAll(
    ".source-words > div, .target-words > div"
  );

  cards.forEach((card) => {
    // 드롭 영역에 들어왔을 때
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.add("bg-[#E1BEE7]");
    });

    // 드롭 영역에서 나갔을 때
    card.addEventListener("dragleave", () => {
      card.classList.remove("bg-[#E1BEE7]");
    });

    // 드래그 시작시 데이터 설정 강화
    card.addEventListener("dragstart", (e) => {
      const index = card.getAttribute("data-index");
      const type = card.getAttribute("data-type");
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          index: index,
          type: type,
        })
      );
      e.dataTransfer.effectAllowed = "move";
    });

    // 드롭 이벤트
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.remove("bg-[#E1BEE7]");

      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        const dropType = card.getAttribute("data-type");
        const dropIndex = parseInt(card.getAttribute("data-index"));

        // 같은 유형의 카드면 무시
        if (dragData.type === dropType) return;

        // 매칭 확인
        checkWordMatch(dragData.index, dropIndex);
      } catch (err) {
        console.error("드롭 처리 중 오류:", err);
      }
    });
  });
}

// 단어 매칭 확인
function checkWordMatch(sourceIndex, targetIndex) {
  const sourceWord = gameWords[sourceIndex];
  const targetWord = gameWords.find((_, i) => {
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );
    return targetCard.textContent === sourceWord.target;
  });

  if (targetWord) {
    // 매칭 성공
    const sourceCard = document.querySelector(
      `.source-words > div[data-index="${sourceIndex}"]`
    );
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );

    sourceCard.classList.remove("bg-[#F3E5F5]");
    targetCard.classList.remove("bg-[#F3E5F5]");
    sourceCard.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");
    targetCard.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");

    sourceCard.setAttribute("draggable", "false");
    targetCard.setAttribute("draggable", "false");

    score += 10;
    document.getElementById("matching-score").textContent = score;

    // 모든 단어 매칭 완료 확인
    const remainingCards = document.querySelectorAll(
      ".source-words > div[draggable='true']"
    );
    if (remainingCards.length === 0) {
      completeGame(`축하합니다! 모든 단어를 매칭했습니다! 점수: ${score}점`);
    }
  } else {
    // 매칭 실패
    score = Math.max(0, score - 2);
    document.getElementById("matching-score").textContent = score;

    // 잠시 색상 변경으로 피드백
    const sourceCard = document.querySelector(
      `.source-words > div[data-index="${sourceIndex}"]`
    );
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );

    sourceCard.classList.add("bg-[#FFCDD2]");
    targetCard.classList.add("bg-[#FFCDD2]");

    setTimeout(() => {
      sourceCard.classList.remove("bg-[#FFCDD2]");
      targetCard.classList.remove("bg-[#FFCDD2]");
      sourceCard.classList.add("bg-[#F3E5F5]");
      targetCard.classList.add("bg-[#F3E5F5]");
    }, 800);
  }
}

// ======== 단어 섞기 게임 함수 ========

// 단어 섞기 게임 초기화
function initWordScrambleGame() {
  document.getElementById("scramble-score").textContent = "0";
  score = 0;

  showNextScrambleWord();

  // 타이머 시작
  startTimer("scramble-timer", 60, () => {
    completeGame(`시간이 종료되었습니다! 최종 점수: ${score}점`);
  });
}

// 특수 문자 처리 함수 (한중일 문자 고려)
function tokenizeForScramble(word) {
  // 한중일 문자 각각을 하나의 토큰으로 처리
  const tokens = [];
  const regex =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;

  for (let i = 0; i < word.length; i++) {
    if (regex.test(word[i])) {
      // 한중일 문자는 각각을 개별 토큰으로 처리
      tokens.push(word[i]);
    } else {
      // 다른 문자는 그대로 처리
      tokens.push(word[i]);
    }
  }

  return tokens;
}

// 다음 섞인 단어 표시
function showNextScrambleWord() {
  if (gameWords.length === 0) {
    completeGame(`축하합니다! 모든 단어를 완성했습니다! 점수: ${score}점`);
    return;
  }

  // 다음 단어 가져오기
  const randomIndex = Math.floor(Math.random() * gameWords.length);
  const currentWord = gameWords[randomIndex];
  gameWords.splice(randomIndex, 1);

  // 단어 힌트 표시 (원본 언어 단어)
  document.getElementById("scramble-hint").textContent = currentWord.source;

  // 단어를 토큰으로 분리하고 섞기
  const targetWordTokens = tokenizeForScramble(currentWord.target);
  const scrambledTokens = [...targetWordTokens].sort(() => 0.5 - Math.random());

  // 컨테이너 초기화
  const scrambleContainer = document.getElementById("scramble-container");
  const answerContainer = document.getElementById("scramble-answer");
  scrambleContainer.innerHTML = "";
  answerContainer.innerHTML = "";

  // 드래그 가능한 글자 요소 생성
  scrambledTokens.forEach((token, index) => {
    const tokenElement = document.createElement("div");
    tokenElement.className =
      "drag-item bg-[#F3E5F5] text-[#9C27B0] px-4 py-2 rounded-lg text-xl font-medium";
    tokenElement.setAttribute("draggable", "true");
    tokenElement.setAttribute("data-char", token);
    tokenElement.setAttribute("data-index", index);
    tokenElement.textContent = token;

    // 드래그 시작 이벤트
    tokenElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index.toString());
      setTimeout(() => {
        tokenElement.classList.add("opacity-50");
      }, 0);
    });

    // 드래그 종료 이벤트
    tokenElement.addEventListener("dragend", () => {
      tokenElement.classList.remove("opacity-50");
    });

    // 클릭 이벤트 추가 (모바일 지원)
    tokenElement.addEventListener("click", () => {
      // 토큰을 답변 컨테이너로 이동
      answerContainer.appendChild(tokenElement);
      tokenElement.classList.remove("bg-[#F3E5F5]");
      tokenElement.classList.add("bg-[#E1BEE7]");

      // 모든 글자가 드롭 영역으로 이동했는지 확인
      const remainingChars = document.querySelectorAll(
        "#scramble-container .drag-item"
      );
      if (remainingChars.length === 0) {
        // 자동으로 정답 확인
        checkScrambleAnswer();
      }
    });

    scrambleContainer.appendChild(tokenElement);
  });

  // 드롭 영역 설정
  setupScrambleDropZone(answerContainer, targetWordTokens.join(""));

  // 답변 컨테이너 클릭 시 이벤트 추가 (모바일에서 다시 이동)
  answerContainer.addEventListener("click", (e) => {
    if (e.target !== answerContainer) {
      // 클릭된 토큰이 답변 컨테이너 내의 토큰이면
      const tokenElement = e.target.closest(".drag-item");
      if (tokenElement) {
        // 다시 원래 컨테이너로 이동
        scrambleContainer.appendChild(tokenElement);
        tokenElement.classList.remove("bg-[#E1BEE7]");
        tokenElement.classList.add("bg-[#F3E5F5]");
      }
    }
  });
}

// 섞기 게임 드롭 영역 설정
function setupScrambleDropZone(dropZone, correctWord) {
  // 드래그 오버 이벤트
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("hover");
  });

  // 드래그 떠남 이벤트
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("hover");
  });

  // 드롭 이벤트
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("hover");

    // 드래그 된 요소 가져오기
    const charIndex = e.dataTransfer.getData("text/plain");
    const charElement = document.querySelector(
      `#scramble-container .drag-item[data-index="${charIndex}"]`
    );

    if (charElement) {
      // 글자 요소를 드롭 영역으로 이동
      dropZone.appendChild(charElement);
      charElement.classList.remove("bg-[#F3E5F5]");
      charElement.classList.add("bg-[#E1BEE7]");

      // 모든 글자가 드롭 영역으로 이동했는지 확인
      const remainingChars = document.querySelectorAll(
        "#scramble-container .drag-item"
      );
      if (remainingChars.length === 0) {
        // 자동으로 정답 확인
        checkScrambleAnswer();
      }
    }
  });

  // 정답 확인 버튼 이벤트
  document.getElementById("check-scramble").addEventListener("click", () => {
    checkScrambleAnswer();
  });

  // dropZone 속성에 정답 저장
  dropZone.setAttribute("data-correct-word", correctWord);
}

// 스크램블 게임 정답 확인
function checkScrambleAnswer() {
  const answerContainer = document.getElementById("scramble-answer");
  const correctWord = answerContainer.getAttribute("data-correct-word");

  // 제출한 답안 구성
  const charElements = answerContainer.querySelectorAll(".drag-item");
  const userAnswer = Array.from(charElements)
    .map((el) => el.getAttribute("data-char"))
    .join("");

  if (userAnswer === correctWord) {
    // 정답
    charElements.forEach((el) => {
      el.classList.remove("bg-[#E1BEE7]");
      el.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");
    });

    score += 10;
    document.getElementById("scramble-score").textContent = score;

    setTimeout(() => {
      showNextScrambleWord();
    }, 1000);
  } else {
    // 오답
    charElements.forEach((el) => {
      el.classList.remove("bg-[#E1BEE7]");
      el.classList.add("bg-[#FFCDD2]", "text-[#D32F2F]");
    });

    score = Math.max(0, score - 2);
    document.getElementById("scramble-score").textContent = score;

    setTimeout(() => {
      // 모든 글자 요소를 원래 컨테이너로 되돌림
      const scrambleContainer = document.getElementById("scramble-container");
      charElements.forEach((el) => {
        el.classList.remove("bg-[#FFCDD2]", "text-[#D32F2F]");
        el.classList.add("bg-[#F3E5F5]", "text-[#9C27B0]");
        scrambleContainer.appendChild(el);
      });
    }, 1000);
  }
}

// ======== 단어 기억 게임 함수 ========

// 단어 기억 게임 초기화
function initMemoryGame() {
  console.log("메모리 게임 초기화 시작");

  // 메모리 보드를 더 유연하게 찾기
  const gameContainer = document.querySelector(
    '.game-container[style*="display: block"]'
  );
  if (!gameContainer) {
    console.error("현재 활성화된 게임 컨테이너를 찾을 수 없습니다");
    return;
  }

  const memoryBoard =
    gameContainer.querySelector("#memory-board") ||
    gameContainer.querySelector(".grid");

  if (!memoryBoard) {
    console.error("메모리 보드 요소를 찾을 수 없습니다");
    return;
  }

  memoryBoard.innerHTML = "";
  memoryPairs = 0;

  // 메모리 페어 카운터 업데이트
  const pairsCounter = gameContainer.querySelector("#memory-pairs");
  if (pairsCounter) {
    pairsCounter.textContent = "0";
  }

  // 카드 크기와 그리드 설정 조정
  memoryBoard.className =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 min-h-[400px]";
  memoryBoard.style.display = "grid";

  // 카드 쌍 생성 (원본 언어 + 대상 언어)
  const cardPairs = [];
  gameWords.forEach((word) => {
    cardPairs.push({
      word: word.source,
      lang: sourceLanguage,
      id: word.id,
      emoji: word.emoji || "",
    });

    cardPairs.push({
      word: word.target,
      lang: targetLanguage,
      id: word.id,
      emoji: word.emoji || "",
    });
  });

  // 카드 섞기
  const shuffledCards = cardPairs.sort(() => 0.5 - Math.random());
  console.log(`메모리 게임 카드 생성: ${shuffledCards.length}개`);

  // 메모리 게임 보드 생성
  shuffledCards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.className =
      "memory-card bg-[#9C27B0] text-white rounded-lg shadow-md h-28 flex items-center justify-center cursor-pointer transform transition-transform duration-300";
    cardElement.style.minHeight = "112px";
    cardElement.setAttribute("data-index", index);
    cardElement.setAttribute("data-id", card.id);
    cardElement.setAttribute("data-lang", card.lang);

    // 카드 내부 컨테이너 (flip 효과를 위한 구조)
    const cardInner = document.createElement("div");
    cardInner.className =
      "card-inner relative w-full h-full transform transition-transform duration-500";
    cardInner.style.width = "100%";
    cardInner.style.height = "100%";

    // 카드 앞면 (뒤집었을 때 보이는 면)
    const frontFace = document.createElement("div");
    frontFace.className =
      "card-front absolute w-full h-full flex flex-col items-center justify-center p-2 bg-[#E8F5E9] text-[#2E7D32] rounded-lg backface-hidden";

    // 언어에 따라 폰트 크기 조정 (한중일 문자는 더 크게)
    if (["korean", "japanese", "chinese"].includes(card.lang)) {
      frontFace.innerHTML = `<span class="text-2xl font-medium">${card.word}</span>`;
    } else {
      frontFace.innerHTML = `<span class="text-xl font-medium">${card.word}</span>`;
    }

    // 이모지가 있다면 추가
    if (card.emoji) {
      const emojiElement = document.createElement("div");
      emojiElement.className = "text-lg mt-1";
      emojiElement.textContent = card.emoji;
      frontFace.appendChild(emojiElement);
    }

    // 언어 표시 추가
    const langBadge = document.createElement("div");
    langBadge.className = "absolute bottom-1 right-2 text-xs opacity-70";
    langBadge.textContent =
      card.lang.charAt(0).toUpperCase() + card.lang.slice(1, 3);
    frontFace.appendChild(langBadge);

    // 카드 뒷면 (기본적으로 보이는 면)
    const backFace = document.createElement("div");
    backFace.className =
      "card-back absolute w-full h-full flex items-center justify-center bg-[#9C27B0] text-white rounded-lg backface-hidden";
    backFace.innerHTML = "<i class='fas fa-question text-3xl'></i>";

    cardInner.appendChild(frontFace);
    cardInner.appendChild(backFace);
    cardElement.appendChild(cardInner);

    // 카드 클릭 이벤트
    cardElement.addEventListener("click", () => {
      flipCard(cardElement);
    });

    memoryBoard.appendChild(cardElement);
  });

  // 메모리 게임 CSS 스타일 추가
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .memory-card {
      perspective: 1000px;
      -webkit-perspective: 1000px;
    }
    .card-inner {
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
    }
    .card-front {
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }
    .card-front, .card-back {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .memory-card.flipped .card-inner {
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }
    .memory-card:hover {
      transform: scale(1.05);
      -webkit-transform: scale(1.05);
    }
    .memory-card.matched {
      transform: scale(1.05);
      -webkit-transform: scale(1.05);
      box-shadow: 0 0 15px rgba(46, 125, 50, 0.7);
    }
    @keyframes pulse {
      0% {
        transform: scale(1);
        -webkit-transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        -webkit-transform: scale(1.1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        -webkit-transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
        -webkit-transform: translateX(0);
      }
      25% {
        transform: translateX(-5px);
        -webkit-transform: translateX(-5px);
      }
      75% {
        transform: translateX(5px);
        -webkit-transform: translateX(5px);
      }
    }
    .memory-card.wrong .card-inner {
      animation: shake 0.4s;
      -webkit-animation: shake 0.4s;
    }
  `;
  document.head.appendChild(styleElement);

  // 타이머 시작
  const timerElement = gameContainer.querySelector("#memory-timer");
  if (timerElement) {
    startTimer("memory-timer", 120, () => {
      completeGame(
        `시간이 종료되었습니다! 발견한 쌍: ${memoryPairs}/${gameWords.length}`
      );
    });
  } else {
    console.warn("메모리 게임 타이머 요소를 찾을 수 없습니다");
  }

  console.log("메모리 게임 초기화 완료");
}

// 카드 뒤집기 함수
function flipCard(card) {
  // 이미 매칭된 카드이거나 선택 불가능한 상태면 무시
  if (card.classList.contains("matched") || !canSelect || card === firstCard) {
    return;
  }

  // 카드 뒤집기 애니메이션
  card.classList.add("flipped");

  if (!firstCard) {
    // 첫 번째 카드 선택
    firstCard = card;
  } else {
    // 두 번째 카드 선택
    secondCard = card;
    canSelect = false;

    // 카드 쌍 확인
    checkMemoryMatch();
  }
}

// 메모리 게임 매칭 확인
function checkMemoryMatch() {
  const firstId = firstCard.getAttribute("data-id");
  const secondId = secondCard.getAttribute("data-id");
  const firstLang = firstCard.getAttribute("data-lang");
  const secondLang = secondCard.getAttribute("data-lang");

  // 같은 ID이고 다른 언어인 경우 매칭 성공
  if (firstId === secondId && firstLang !== secondLang) {
    // 매칭 성공
    setTimeout(() => {
      // 카드에 매치 효과 추가
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");

      // 쌍 카운터 증가
      memoryPairs++;
      document.getElementById("memory-pairs").textContent = memoryPairs;

      // 게임 완료 확인
      if (memoryPairs === gameWords.length) {
        const timeLeft = document.getElementById("memory-timer").textContent;
        completeGame(
          `축하합니다! 모든 쌍을 찾았습니다! 남은 시간: ${timeLeft}초`
        );
      }

      // 상태 초기화
      firstCard = null;
      secondCard = null;
      canSelect = true;
    }, 500);
  } else {
    // 매칭 실패
    setTimeout(() => {
      // 카드에 오답 효과 추가
      firstCard.classList.add("wrong");
      secondCard.classList.add("wrong");

      // 일정 시간 후 카드 뒤집기
      setTimeout(() => {
        firstCard.classList.remove("flipped", "wrong");
        secondCard.classList.remove("flipped", "wrong");

        // 상태 초기화
        firstCard = null;
        secondCard = null;
        canSelect = true;
      }, 1000);
    }, 500);
  }
}
