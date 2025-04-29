import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let currentHangul = null;
let currentWriter = null;
let currentCharacterData = null;
let currentImage = null;
let isShowingImage = false;
let isSpeaking = false; // 음성 재생 중인지 확인하는 변수

// 발음 효과 스타일 추가
function addSpeakingStyles() {
  // 이미 스타일이 있는지 확인
  if (!document.getElementById("speaking-effect-style")) {
    const styleElement = document.createElement("style");
    styleElement.id = "speaking-effect-style";
    styleElement.textContent = `
      @keyframes speakingPulse {
        0% { color: #1a56db; transform: scale(1); }
        50% { color: #3182ce; transform: scale(1.05); }
        100% { color: #1a56db; transform: scale(1); }
      }
      .speaking-effect {
        animation: speakingPulse 1s infinite ease-in-out;
        color: #1a56db;
        font-weight: bold;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// 모든 상태 초기화 함수
function resetAllState() {
  // 음성 재생 취소
  try {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel(); // 모든 발음 큐 취소
    }
  } catch (error) {
    console.error("음성 API 초기화 중 오류:", error);
  }

  // 모든 변수 초기화
  currentHangul = null;
  currentWriter = null;
  currentCharacterData = null;
  currentImage = null;
  isShowingImage = false;
  isSpeaking = false;

  // UI 초기화
  try {
    const charTargetDiv = document.getElementById("character-target-div");
    if (charTargetDiv) {
      charTargetDiv.innerHTML = "";
    }

    // 모든 speaking-effect 클래스 제거
    document.querySelectorAll(".speaking-effect").forEach((el) => {
      el.classList.remove("speaking-effect");
    });

    // 버튼 텍스트 초기화
    const quizBtn = document.getElementById("quiz-button");
    if (quizBtn) {
      quizBtn.textContent = "발음 듣기";
    }

    const animateBtn = document.getElementById("animate-button");
    if (animateBtn) {
      animateBtn.textContent = "이미지 보기";
    }
  } catch (error) {
    console.error("UI 초기화 중 오류:", error);
  }

  console.log("모든 상태 초기화 완료");
}

// 음성 재생 취소 함수
function cancelSpeech() {
  const synth = window.speechSynthesis;
  if (synth) {
    synth.cancel(); // 모든 발음 큐 취소
    isSpeaking = false;

    // UI 업데이트
    updateSpeakingUI(false);
  }
}

// 발음 재생 상태에 따른 UI 업데이트
function updateSpeakingUI(speaking) {
  // 버튼 텍스트 변경
  const quizBtn = document.getElementById("quiz-button");
  if (quizBtn) {
    quizBtn.textContent = speaking ? "중지하기" : "발음 듣기";
  }

  // 큰 한글 디스플레이에 효과 추가/제거
  const charTargetDiv = document.getElementById("character-target-div");
  if (charTargetDiv) {
    if (speaking) {
      // 텍스트 길이에 따라 글자 크기 조정 (더 세분화)
      let fontSize;
      if (currentHangul.length <= 3) {
        fontSize = "120px";
      } else if (currentHangul.length <= 5) {
        fontSize = "90px";
      } else if (currentHangul.length <= 7) {
        fontSize = "70px";
      } else if (currentHangul.length <= 9) {
        fontSize = "50px";
      } else {
        fontSize = "40px";
      }

      charTargetDiv.innerHTML = `
        <div class="speaking-effect" style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${fontSize};
          word-break: break-word;
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
          line-height: 1.2;
          max-height: 300px;
          overflow: hidden;
        ">
          ${currentHangul}
        </div>
      `;
    } else {
      // 효과 제거하고 원래 한글로 복원
      showHangulOnly(currentHangul);
    }
  }
}

// 간단히 한글 표시
function showHangulOnly(hangul) {
  const target = document.getElementById("character-target-div");
  if (target) {
    // 텍스트 길이에 따라 글자 크기 조정 (더 세분화)
    let fontSize;
    if (hangul.length <= 3) {
      fontSize = "120px";
    } else if (hangul.length <= 5) {
      fontSize = "90px";
    } else if (hangul.length <= 7) {
      fontSize = "70px";
    } else if (hangul.length <= 9) {
      fontSize = "50px";
    } else {
      fontSize = "40px";
    }

    target.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fontSize};
        word-break: break-word;
        word-wrap: break-word;
        overflow-wrap: break-word;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
        line-height: 1.2;
        max-height: 300px;
        overflow: hidden;
      ">
        ${hangul}
      </div>
    `;
  }
}

// 이미지 표시
function showImage(emoji) {
  const target = document.getElementById("character-target-div");
  if (target) {
    target.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 180px;
        text-align: center;
        padding: 20px;
      ">
        ${emoji || "📝"}
      </div>
    `;
  }
}

// 버튼 이벤트 설정 함수
function setupModalEventListeners() {
  console.log("모달 이벤트 리스너 설정 중...");

  try {
    // 모달 요소 참조
    const modal = document.getElementById("learn-hangul-modal");
    const closeBtn = document.getElementById("close-learn-modal");
    const animateBtn = document.getElementById("animate-button");
    const quizBtn = document.getElementById("quiz-button");
    const deleteBtn = document.getElementById("delete-hangul");

    if (!modal || !closeBtn || !animateBtn || !quizBtn || !deleteBtn) {
      console.error("필요한 요소를 찾을 수 없습니다.");
      return;
    }

    // 기존 이벤트 리스너 제거 시도 (요소 복제를 통해)
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    animateBtn.replaceWith(animateBtn.cloneNode(true));
    quizBtn.replaceWith(quizBtn.cloneNode(true));
    deleteBtn.replaceWith(deleteBtn.cloneNode(true));

    // 새 요소 참조 다시 가져오기
    const newCloseBtn = document.getElementById("close-learn-modal");
    const newAnimateBtn = document.getElementById("animate-button");
    const newQuizBtn = document.getElementById("quiz-button");
    const newDeleteBtn = document.getElementById("delete-hangul");

    // 이벤트 리스너 추가
    newCloseBtn.addEventListener("click", closeModal);
    newAnimateBtn.addEventListener("click", toggleImage);
    newQuizBtn.addEventListener("click", playPronunciation);
    newDeleteBtn.addEventListener("click", deleteHangul);

    console.log("모달 이벤트 리스너 설정 완료");
  } catch (error) {
    console.error("이벤트 리스너 설정 중 오류:", error);

    // 기본 방식으로 다시 시도
    try {
      const closeBtn = document.getElementById("close-learn-modal");
      const animateBtn = document.getElementById("animate-button");
      const quizBtn = document.getElementById("quiz-button");
      const deleteBtn = document.getElementById("delete-hangul");

      if (closeBtn) closeBtn.addEventListener("click", closeModal);
      if (animateBtn) animateBtn.addEventListener("click", toggleImage);
      if (quizBtn) quizBtn.addEventListener("click", playPronunciation);
      if (deleteBtn) deleteBtn.addEventListener("click", deleteHangul);

      console.log("백업 방식으로 이벤트 리스너 설정 완료");
    } catch (secondError) {
      console.error("백업 이벤트 리스너 설정도 실패:", secondError);
    }
  }
}

// 모달 표시
export function showLearnHangulModal(word) {
  console.log("모달 열기: ", word.hangul);

  // 기존 상태를 먼저 초기화 (이전 모달의 상태가 남아있을 수 있음)
  resetAllState();

  // 웹 음성 API 강제 초기화
  window.speechSynthesis.cancel();

  // 새 한글 정보 설정
  currentHangul = word.hangul;
  currentImage = word.image || "📝";
  isShowingImage = false;

  // 스타일 추가
  addSpeakingStyles();

  // 요소 참조
  const modal = document.getElementById("learn-hangul-modal");
  const target = document.getElementById("character-target-div");
  const animateBtn = document.getElementById("animate-button");
  const quizBtn = document.getElementById("quiz-button");

  if (!modal || !target || !animateBtn || !quizBtn) {
    console.error("필요한 요소를 찾을 수 없습니다.");
    return;
  }

  // 초기 버튼 텍스트 재설정
  quizBtn.textContent = "발음 듣기";
  animateBtn.textContent = "이미지 보기";

  // 한글 설명에 대한 영어 번역 매핑
  const descriptionTranslations = {
    // 기본 설명 번역들
    주식: "Staple food",
    "국물 요리": "Soup dish",
    "밥과 함께 먹는 음식": "Side dish eaten with rice",
    "대표적인 발효 음식": "Representative fermented food",
    "쌀로 만든 음식": "Food made from rice",
    "배우는 사람": "Person who learns",
    "가르치는 사람": "Person who teaches",
    "수업하는 공간": "Space for classes",
    "공부하는 가구": "Furniture for studying",
    "배우는 행위": "Act of learning",
    "높은 지형": "High terrain",
    "넓은 물": "Wide body of water",
    "흐르는 물": "Flowing water",
    "나무가 많은 곳": "Place with many trees",
    "아름다운 식물": "Beautiful plant",
    "가정에서 키우는 동물": "Animal raised at home",
    "우아한 반려동물": "Elegant pet",
    "빠르게 달리는 동물": "Animal that runs fast",
    "우유를 주는 동물": "Animal that gives milk",
    "알을 낳는 새": "Bird that lays eggs",
    "공을 차는 운동": "Sport of kicking a ball",
    "공을 던지는 운동": "Sport of throwing a ball",
    "물에서 하는 운동": "Sport done in water",
    "빠르게 움직이는 운동": "Sport of moving quickly",
    "공을 치는 운동": "Sport of hitting a ball",
    "밥과 야채를 섞은 요리": "Dish of mixed rice and vegetables",
    "쇠고기 요리": "Beef dish",
    "인스턴트 면 요리": "Instant noodle dish",
    "교육 활동": "Educational activity",
    "평가 활동": "Evaluation activity",
    "학습 자료": "Learning materials",
    "공기 위 공간": "Space above the air",
    "움직이는 공기": "Moving air",
    "수증기 덩어리": "Mass of water vapor",
    "긴 귀의 동물": "Animal with long ears",
    "농장의 동물": "Farm animal",
    "큰 고양이과 동물": "Large feline animal",
    "라켓으로 치는 운동": "Sport of hitting with a racket",
    "네트 너머로 공을 넘기는 운동": "Sport of sending a ball over a net",
    "공을 홀에 넣는 운동": "Sport of putting a ball in a hole",

    // 추가적인 설명에 대한 매핑
    "바다에 사는 동물": "Animal living in the sea",
    "하늘을 나는 동물": "Animal that flies in the sky",
    "추운 지역에 사는 동물": "Animal living in cold regions",
    "열대 지방에 사는 동물": "Animal living in tropical regions",
    "한국의 전통 음식": "Traditional Korean food",
    "일본의 전통 음식": "Traditional Japanese food",
    "중국의 전통 음식": "Traditional Chinese food",
    "이탈리아의 전통 음식": "Traditional Italian food",
    "매운 음식": "Spicy food",
    "달콤한 음식": "Sweet food",
    "짠 음식": "Salty food",
    "신 음식": "Sour food",
    "쓴 음식": "Bitter food",
    "아름다운 경치": "Beautiful scenery",
    "잔잔한 물": "Calm water",
    "맑은 하늘": "Clear sky",
    "어두운 밤": "Dark night",
    "밝은 아침": "Bright morning",
    "따뜻한 날씨": "Warm weather",
    "추운 날씨": "Cold weather",
    "비오는 날": "Rainy day",
    "눈 오는 날": "Snowy day",
    "화창한 날": "Sunny day",
  };

  // 상세 설명에 영어 번역 추가
  let displayDescription = word.description || "";

  // 디버깅: 상세 설명 로깅
  console.log("원본 설명:", displayDescription);

  // 더 안전한 방식으로 번역 찾기 (점 표기법 대신 대괄호 표기법 사용)
  let translatedDesc = "";

  // 객체에 직접 접근하는 대신 항목을 순회하며 일치하는 키 찾기
  for (const [key, value] of Object.entries(descriptionTranslations)) {
    if (key === displayDescription) {
      translatedDesc = value;
      console.log("번역 찾음:", key, "->", value);
      break;
    }
  }

  // 결과 로깅
  console.log("찾은 번역:", translatedDesc);

  if (translatedDesc) {
    displayDescription = `${displayDescription} (${translatedDesc})`;
  } else if (word.meaning) {
    // 번역이 없는 경우에만 기존 영어 의미 사용
    console.log("번역 없음, 기본 의미 사용:", word.meaning);
    displayDescription = `${displayDescription} (${word.meaning})`;
  }

  // 최종 표시 텍스트 로깅
  console.log("최종 표시 텍스트:", displayDescription);

  // 정보 표시
  document.getElementById("learn-hangul").textContent = word.hangul;
  document.getElementById("learn-pronunciation").textContent =
    word.pronunciation || "";
  document.getElementById("learn-meaning").textContent = word.meaning;
  document.getElementById("learn-description").textContent = displayDescription;
  document.getElementById("learn-date").textContent = new Date(
    word.createdAt
  ).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 한글 표시 (초기화 상태로)
  showHangulOnly(currentHangul);

  // 모달 표시
  modal.classList.remove("hidden");

  // 이전 이벤트 리스너 모두 제거 후 새로 설정
  const closeBtn = document.getElementById("close-learn-modal");
  const deleteBtn = document.getElementById("delete-hangul");

  // 모든 이벤트 리스너 제거 시도 (최대한 많은 방법으로)
  try {
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    animateBtn.replaceWith(animateBtn.cloneNode(true));
    quizBtn.replaceWith(quizBtn.cloneNode(true));
    deleteBtn.replaceWith(deleteBtn.cloneNode(true));

    // 새 요소 다시 가져오기
    const newCloseBtn = document.getElementById("close-learn-modal");
    const newAnimateBtn = document.getElementById("animate-button");
    const newQuizBtn = document.getElementById("quiz-button");
    const newDeleteBtn = document.getElementById("delete-hangul");

    // 모달이 표시된 후 이벤트 리스너 설정 (새 요소에)
    newCloseBtn.addEventListener("click", closeModal);
    newAnimateBtn.addEventListener("click", toggleImage);
    newQuizBtn.addEventListener("click", playPronunciation);
    newDeleteBtn.addEventListener("click", deleteHangul);

    console.log("모달 이벤트 리스너 새로 설정 완료");
  } catch (error) {
    console.error("이벤트 리스너 재설정 중 오류:", error);
    // 오류 발생 시 기존 방식으로 이벤트 리스너 설정 시도
    setupModalEventListeners();
  }
}

function initializeModal(character, characterData) {
  console.log(`모달 초기화: 문자 ${character}`);
  currentHangul = character;
  currentCharacterData = characterData;

  // 엘리먼트 참조
  const modal = document.getElementById("learn-hangul-modal");
  const modalContent = document.querySelector(".modal-content");
  const modalHeader = document.querySelector(".modal-header h2");
  const characterDisplay = document.querySelector(".character-display");
  const characterInfo = document.querySelector(".character-info");
  const writerContainer = document.querySelector(".hangul-writer");
  const closeBtn = document.querySelector(".close-modal");
  const animateBtn = document.querySelector(".animate-button");
  const quizBtn = document.querySelector(".quiz-button");
  const deleteBtn = document.querySelector(".delete-button");

  console.log("모달 엘리먼트 참조 완료");

  // 이전 이벤트 리스너 제거 (중복 방지)
  closeBtn.removeEventListener("click", closeModal);
  animateBtn.removeEventListener("click", animateHangul);
  quizBtn.removeEventListener("click", startQuiz);
  deleteBtn.removeEventListener("click", deleteHangul);

  // 모달 내용 설정
  modalHeader.textContent = character;

  // 문자 정보 설정
  if (characterData) {
    characterInfo.innerHTML = `
      <h3>${character} (${characterData.romanization || ""})</h3>
      <p>${characterData.description || ""}</p>
      <p>발음: ${characterData.pronunciation || ""}</p>
      ${characterData.category ? `<p>분류: ${characterData.category}</p>` : ""}
      ${characterData.strokes ? `<p>획수: ${characterData.strokes}</p>` : ""}
    `;
  } else {
    characterInfo.innerHTML = `<h3>${character}</h3><p>정보 없음</p>`;
  }

  console.log("모달 내용 설정 완료");

  // HangulWriter 초기화
  try {
    console.log(`HangulWriter 초기화 시작: ${character}`);
    writerContainer.innerHTML = "";

    const hasStrokes = HangulWriter.getStrokeCount(character) > 0;
    console.log(
      `획 데이터 존재: ${hasStrokes}, 획수: ${HangulWriter.getStrokeCount(
        character
      )}`
    );

    if (hasStrokes) {
      // 획 데이터가 있는 경우 정상 초기화
      currentWriter = new HangulWriter("character-target-div", character, {
        width: 300,
        height: 300,
        padding: 5,
        showOutline: true,
        autoAnimate: false,
      });
    } else {
      // 획 데이터가 없는 경우 단순 표시
      currentWriter = new HangulWriter("character-target-div", character, {
        width: 300,
        height: 300,
        showOutline: false,
        autoAnimate: false,
      });
    }

    console.log("HangulWriter 초기화 완료");
  } catch (error) {
    console.error("HangulWriter 초기화 오류:", error);
    // 오류 발생 시 단순 텍스트로 표시
    writerContainer.innerHTML = `<div style="width:300px;height:300px;display:flex;justify-content:center;align-items:center;font-size:120px;">${character}</div>`;
  }

  // 함수 정의
  function closeModal() {
    console.log("모달 닫기 함수 실행");
    modal.style.display = "none";
  }

  function animateHangul() {
    console.log("애니메이션 버튼 클릭");
    if (!currentWriter || !currentWriter.isInitialized) {
      console.error("HangulWriter가 초기화되지 않았습니다");
      return;
    }

    try {
      currentWriter.animateCharacter();
    } catch (error) {
      console.error("애니메이션 실행 중 오류:", error);
    }
  }

  function startQuiz() {
    console.log("퀴즈 버튼 클릭");
    if (!currentWriter || !currentWriter.isInitialized) {
      console.error("HangulWriter가 초기화되지 않았습니다");
      return;
    }

    try {
      currentWriter.quiz({
        onMistake: (data) => {
          console.log("오답:", data);
        },
        onComplete: (result) => {
          console.log("퀴즈 완료:", result);
        },
      });
    } catch (error) {
      console.error("퀴즈 모드 실행 중 오류:", error);
    }
  }

  function deleteHangul() {
    console.log("삭제 버튼 클릭");
    if (confirm(`정말로 '${character}' 문자를 삭제하시겠습니까?`)) {
      // 여기에 삭제 로직 구현
      console.log(`'${character}' 삭제 요청됨`);
    }
  }

  // 이벤트 리스너 설정
  console.log("이벤트 리스너 설정");
  closeBtn.addEventListener("click", closeModal);
  animateBtn.addEventListener("click", animateHangul);
  quizBtn.addEventListener("click", startQuiz);
  deleteBtn.addEventListener("click", deleteHangul);

  // 모달 표시
  modal.style.display = "block";
  console.log("모달 표시 완료");
}

// 닫기 버튼 함수
function closeModal() {
  console.log("닫기 버튼 클릭됨");

  // 모든 상태 초기화
  resetAllState();

  // 모달 숨기기
  const modal = document.getElementById("learn-hangul-modal");
  if (modal) {
    modal.classList.add("hidden");
  }

  console.log("모달이 닫혔습니다.");
}

// 이미지 보기 버튼 함수
function toggleImage() {
  console.log("이미지 토글");
  const target = document.getElementById("character-target-div");
  const animateBtn = document.getElementById("animate-button");

  if (!target || !animateBtn) {
    console.error("이미지 토글에 필요한 요소를 찾을 수 없습니다.");
    return;
  }

  if (isShowingImage) {
    // 한글로 돌아가기
    showHangulOnly(currentHangul);
    animateBtn.textContent = "이미지 보기";
    isShowingImage = false;
  } else {
    // 이미지 표시
    showImage(currentImage);
    animateBtn.textContent = "한글 보기";
    isShowingImage = true;
  }
}

// 발음 듣기 버튼 함수
function playPronunciation() {
  console.log("발음 듣기 버튼 클릭됨");
  if (!currentHangul) {
    console.error("재생할 발음이 없습니다.");
    return;
  }

  try {
    // 이미 재생 중이면 이전 음성 취소 후 반환
    if (isSpeaking) {
      try {
        const synth = window.speechSynthesis;
        if (synth) {
          synth.cancel(); // 모든 발음 큐 취소
        }
        isSpeaking = false;
      } catch (error) {
        console.error("음성 취소 중 오류:", error);
      }

      // UI 상태 업데이트
      updateSpeakingUI(false);
      return;
    }

    // 웹 음성 API 상태 확인
    const synth = window.speechSynthesis;
    if (!synth) {
      console.error("Speech Synthesis API를 사용할 수 없습니다.");
      alert("이 브라우저에서는 음성 합성을 지원하지 않습니다.");
      return;
    }

    // 기존 음성 재생 큐 취소 (안전하게)
    synth.cancel();

    // 약간의 지연 후 발음 재생 시작
    setTimeout(() => {
      try {
        // Speech Synthesis 사용
        const utterance = new SpeechSynthesisUtterance(currentHangul);
        utterance.lang = "ko-KR";
        utterance.rate = 0.8; // 약간 느리게
        utterance.pitch = 1.0; // 기본 피치
        utterance.volume = 1.0; // 최대 볼륨

        // 음성 종료 이벤트 설정
        utterance.onend = function () {
          console.log("발음 재생 완료");
          isSpeaking = false;
          // UI 업데이트
          updateSpeakingUI(false);
        };

        // 오류 이벤트 설정
        utterance.onerror = function (event) {
          console.error("발음 재생 오류:", event);
          isSpeaking = false;
          // UI 업데이트
          updateSpeakingUI(false);
        };

        // 상태 변수 설정 (발음 시작 전)
        isSpeaking = true;

        // UI 업데이트 (발음 시작 전)
        updateSpeakingUI(true);

        // 음성 합성 시작
        synth.speak(utterance);

        // 만약 음성이 시작되지 않으면 상태 복원 타이머 설정
        setTimeout(() => {
          if (synth.speaking === false && isSpeaking) {
            console.warn("음성이 시작되지 않음, 상태 복원");
            isSpeaking = false;
            updateSpeakingUI(false);
          }
        }, 1000);

        console.log("발음 재생 시작");
      } catch (innerError) {
        console.error("발음 재생 준비 중 오류:", innerError);
        isSpeaking = false;
        updateSpeakingUI(false);
      }
    }, 100);
  } catch (error) {
    console.error("발음 재생 중 오류:", error);
    alert("발음을 재생할 수 없습니다.");
    isSpeaking = false;
    // UI 업데이트
    updateSpeakingUI(false);
  }
}

// 삭제 버튼 함수
async function deleteHangul() {
  console.log("삭제 버튼 클릭됨");
  const hangulToDelete = document.getElementById("learn-hangul").textContent;

  if (confirm("정말로 이 한글을 삭제하시겠습니까?")) {
    try {
      const userEmail = auth.currentUser.email;

      // 단어 삭제
      const wordlistRef = doc(
        db,
        "wordlist",
        userEmail,
        "wordlist",
        hangulToDelete
      );
      await deleteDoc(wordlistRef);

      // AI 추천 삭제
      const aiRecommendRef = doc(
        db,
        "ai-recommend",
        userEmail,
        "ai-recommend",
        hangulToDelete
      );
      await deleteDoc(aiRecommendRef);

      // 사용자 단어 수 감소
      const userRef = doc(db, "users", userEmail);
      await updateDoc(userRef, {
        wordCount: increment(-1),
      });

      alert("한글이 성공적으로 삭제되었습니다.");

      // 모달 숨기기
      const modal = document.getElementById("learn-hangul-modal");
      if (modal) {
        modal.classList.add("hidden");
      }

      window.location.reload();
    } catch (error) {
      console.error("한글 삭제 중 오류 발생: ", error);
      alert("한글 삭제에 실패했습니다.");
    }
  }
}
