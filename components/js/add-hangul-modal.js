import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 한글 자모 분리 함수
function decomposeHangul(hangul) {
  const charCode = hangul.charCodeAt(0);

  // 한글 유니코드 범위 (AC00-D7A3) 체크
  if (charCode < 0xac00 || charCode > 0xd7a3) {
    return { initial: hangul, medial: "", final: "" };
  }

  const baseCode = 0xac00; // '가'의 코드
  const baseCount = charCode - baseCode;

  // 초성 19개, 중성 21개, 종성 28개(없음 포함)
  const initialCount = Math.floor(baseCount / (21 * 28));
  const medialCount = Math.floor((baseCount % (21 * 28)) / 28);
  const finalCount = baseCount % 28;

  // 초성, 중성, 종성 목록
  const initials = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  const medials = [
    "ㅏ",
    "ㅐ",
    "ㅑ",
    "ㅒ",
    "ㅓ",
    "ㅔ",
    "ㅕ",
    "ㅖ",
    "ㅗ",
    "ㅘ",
    "ㅙ",
    "ㅚ",
    "ㅛ",
    "ㅜ",
    "ㅝ",
    "ㅞ",
    "ㅟ",
    "ㅠ",
    "ㅡ",
    "ㅢ",
    "ㅣ",
  ];
  const finals = [
    "",
    "ㄱ",
    "ㄲ",
    "ㄳ",
    "ㄴ",
    "ㄵ",
    "ㄶ",
    "ㄷ",
    "ㄹ",
    "ㄺ",
    "ㄻ",
    "ㄼ",
    "ㄽ",
    "ㄾ",
    "ㄿ",
    "ㅀ",
    "ㅁ",
    "ㅂ",
    "ㅄ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  return {
    initial: initials[initialCount],
    medial: medials[medialCount],
    final: finals[finalCount],
  };
}

// 한글 발음을 영어 로마자로 변환하는 함수
function getHangulPronunciation(char) {
  // 자모 분리
  const decomposed = decomposeHangul(char);

  // 초성 발음 매핑
  const initialMap = {
    ㄱ: "g",
    ㄲ: "kk",
    ㄴ: "n",
    ㄷ: "d",
    ㄸ: "tt",
    ㄹ: "r",
    ㅁ: "m",
    ㅂ: "b",
    ㅃ: "pp",
    ㅅ: "s",
    ㅆ: "ss",
    ㅇ: "",
    ㅈ: "j",
    ㅉ: "jj",
    ㅊ: "ch",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "h",
  };

  // 중성 발음 매핑
  const medialMap = {
    ㅏ: "a",
    ㅐ: "ae",
    ㅑ: "ya",
    ㅒ: "yae",
    ㅓ: "eo",
    ㅔ: "e",
    ㅕ: "yeo",
    ㅖ: "ye",
    ㅗ: "o",
    ㅘ: "wa",
    ㅙ: "wae",
    ㅚ: "oe",
    ㅛ: "yo",
    ㅜ: "u",
    ㅝ: "wo",
    ㅞ: "we",
    ㅟ: "wi",
    ㅠ: "yu",
    ㅡ: "eu",
    ㅢ: "ui",
    ㅣ: "i",
  };

  // 종성 발음 매핑 (받침)
  const finalMap = {
    "": "",
    ㄱ: "k",
    ㄲ: "k",
    ㄳ: "k",
    ㄴ: "n",
    ㄵ: "n",
    ㄶ: "n",
    ㄷ: "t",
    ㄹ: "l",
    ㄺ: "k",
    ㄻ: "m",
    ㄼ: "l",
    ㄽ: "l",
    ㄾ: "l",
    ㄿ: "p",
    ㅀ: "l",
    ㅁ: "m",
    ㅂ: "p",
    ㅄ: "p",
    ㅅ: "t",
    ㅆ: "t",
    ㅇ: "ng",
    ㅈ: "t",
    ㅊ: "t",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "t",
  };

  // 완성형 한글이면 자모를 분리하여 발음 생성
  if (decomposed.initial) {
    // 초성이 'ㅇ'이고 단어 첫 음절이면 발음하지 않음
    const initialSound =
      decomposed.initial === "ㅇ" ? "" : initialMap[decomposed.initial] || "";
    const medialSound = medialMap[decomposed.medial] || "";
    const finalSound = finalMap[decomposed.final] || "";

    return initialSound + medialSound + finalSound;
  }

  // 단일 자모이거나 매핑되지 않은 문자는 기본 매핑 테이블 사용
  const basicMap = {
    // 자음
    ㄱ: "g/k",
    ㄲ: "kk",
    ㄴ: "n",
    ㄷ: "d/t",
    ㄸ: "tt",
    ㄹ: "r/l",
    ㅁ: "m",
    ㅂ: "b/p",
    ㅃ: "pp",
    ㅅ: "s",
    ㅆ: "ss",
    ㅇ: "ng",
    ㅈ: "j",
    ㅉ: "jj",
    ㅊ: "ch",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "h",
    // 모음
    ㅏ: "a",
    ㅐ: "ae",
    ㅑ: "ya",
    ㅒ: "yae",
    ㅓ: "eo",
    ㅔ: "e",
    ㅕ: "yeo",
    ㅖ: "ye",
    ㅗ: "o",
    ㅘ: "wa",
    ㅙ: "wae",
    ㅚ: "oe",
    ㅛ: "yo",
    ㅜ: "u",
    ㅝ: "wo",
    ㅞ: "we",
    ㅟ: "wi",
    ㅠ: "yu",
    ㅡ: "eu",
    ㅢ: "ui",
    ㅣ: "i",
    // 일반적인 단일 음절
    가: "ga",
    나: "na",
    다: "da",
    라: "ra",
    마: "ma",
    바: "ba",
    사: "sa",
    아: "a",
    자: "ja",
    차: "cha",
    카: "ka",
    타: "ta",
    파: "pa",
    하: "ha",
    // 받침 있는 음절 몇 가지 예시
    각: "gak",
    간: "gan",
    갑: "gap",
    갇: "gat",
    강: "gang",
    갈: "gal",
    감: "gam",
    값: "gap",
    곰: "gom",
    공: "gong",
    국: "guk",
    굴: "gul",
    굿: "gut",
    궁: "gung",
    글: "geul",
    금: "geum",
    급: "geup",
    기: "gi",
  };

  return basicMap[char] || char;
}

// 전체 한글 문자열의 영어 발음을 생성하는 함수
function getFullPronunciation(text) {
  let result = "";

  // 한글 문자 하나씩 처리
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const pronunciation = getHangulPronunciation(char);

    // 영어 발음 추가
    result += pronunciation;

    // 마지막 글자가 아니면 하이픈 추가
    if (i < text.length - 1) {
      result += "-";
    }
  }

  return result;
}

// 한글에 해당하는 이모지 목록 생성
function generateEmojisForHangul(char) {
  // 기본 이모지 매핑
  const emojiMap = {
    가: ["🏠", "🏡", "🏘️"],
    나: ["🙋", "🙋‍♀️", "🙋‍♂️"],
    다: ["🔄", "🔁", "🔃"],
    라: ["🎵", "🎶", "🎼"],
    마: ["🐎", "🐴", "🏇"],
    바: ["🌊", "🌊", "🏄"],
    사: ["👨‍⚖️", "⚖️", "👩‍⚖️"],
    아: ["👶", "👼", "🧒"],
    자: ["🛌", "😴", "💤"],
    차: ["🚗", "🚙", "🚕"],
    카: ["💳", "💹", "💸"],
    타: ["⏰", "⌚", "🕰️"],
    파: ["🌊", "🔵", "💧"],
    하: ["☀️", "🌞", "☁️"],
    // 더 많은 한글 이모지 매핑 필요 시 추가
  };

  // 기본 이모지 (문자에 직접적인 매핑이 없는 경우)
  const defaultEmojis = ["📝", "📚", "✏️", "🔤", "🎓", "📖"];

  return emojiMap[char] || defaultEmojis;
}

export async function initAddHangul() {
  const closeModalBtn = document.getElementById("close-modal");
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const descriptionInput = document.getElementById("description-input");
  const emojiOptions = document.getElementById("emoji-options");
  const imageInput = document.getElementById("image-input");
  const saveHangulBtn = document.getElementById("add-hangul");

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      CloseModal();
      resetForm();
    });
  }

  if (hangulInput) {
    hangulInput.addEventListener("input", async (e) => {
      const hangul = e.target.value.trim();
      if (hangul) {
        try {
          // 첫 글자를 사용하여 이모지 생성
          const singleChar = hangul.charAt(0);

          // 전체 한글에 대한 발음 자동 생성
          pronunciationInput.value = getFullPronunciation(hangul);

          // 이모지 옵션 생성
          emojiOptions.innerHTML = "";
          const emojis = generateEmojisForHangul(singleChar);

          emojis.forEach((emoji) => {
            const emojiButton = document.createElement("button");
            emojiButton.className = "p-2 text-3xl hover:bg-gray-100 rounded-lg";
            emojiButton.textContent = emoji;
            emojiButton.addEventListener("click", () => {
              // 이전에 선택된 버튼의 스타일 제거
              document
                .querySelectorAll("#emoji-options button")
                .forEach((btn) => {
                  btn.classList.remove(
                    "bg-blue-100",
                    "border",
                    "border-blue-500"
                  );
                });

              // 현재 버튼 스타일 적용
              emojiButton.classList.add(
                "bg-blue-100",
                "border",
                "border-blue-500"
              );
              imageInput.value = emoji;
            });
            emojiOptions.appendChild(emojiButton);
          });

          // 기본 첫 번째 이모지 선택
          if (emojis.length > 0) {
            emojiOptions.firstChild.click();
          }
        } catch (error) {
          console.error("한글 처리 중 오류 발생: ", error);
        }
      } else {
        pronunciationInput.value = "";
        emojiOptions.innerHTML = "";
        imageInput.value = "";
      }
    });
  }

  if (saveHangulBtn) {
    saveHangulBtn.addEventListener("click", async () => {
      if (!validateForm()) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      try {
        const userEmail = auth.currentUser.email;
        if (!userEmail) {
          alert("로그인이 필요합니다.");
          return;
        }

        const userRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          alert("사용자 정보가 없습니다.");
          return;
        }

        const userData = userSnap.data();
        if (userData.wordCount >= userData.maxWordCount) {
          alert(
            `최대 한글 추가 개수를 초과했습니다. (최대: ${userData.maxWordCount}개)`
          );
          return;
        }

        const hangul = hangulInput.value.trim();
        const wordData = {
          hangul: hangul,
          pronunciation: getFullPronunciation(hangul),
          meaning: meaningInput.value,
          image: imageInput.value,
          description: descriptionInput.value,
          createdAt: new Date().toISOString(),
        };

        const wordlistRef = doc(db, "wordlist", userEmail, "wordlist", hangul);
        await setDoc(wordlistRef, wordData);

        await updateDoc(userRef, {
          wordCount: userData.wordCount + 1,
        });

        alert("한글이 성공적으로 추가되었습니다.");
        CloseModal();
        resetForm();

        window.location.reload();
      } catch (error) {
        console.error("한글 추가 중 에러 발생: ", error);
        alert("한글 추가 중 에러가 발생했습니다.");
      }
    });
  }
}

function CloseModal() {
  const modal = document.getElementById("hangul-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function resetForm() {
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const emojiOptions = document.getElementById("emoji-options");
  const imageInput = document.getElementById("image-input");
  const descriptionInput = document.getElementById("description-input");

  if (hangulInput) hangulInput.value = "";
  if (pronunciationInput) pronunciationInput.value = "";
  if (meaningInput) meaningInput.value = "";
  if (emojiOptions) emojiOptions.innerHTML = "";
  if (imageInput) imageInput.value = "";
  if (descriptionInput) descriptionInput.value = "";
}

function validateForm() {
  const hangulInput = document.getElementById("hangul-input");
  const meaningInput = document.getElementById("meaning-input");
  const imageInput = document.getElementById("image-input");
  const descriptionInput = document.getElementById("description-input");

  return (
    hangulInput.value.trim() !== "" &&
    meaningInput.value.trim() !== "" &&
    imageInput.value.trim() !== "" &&
    descriptionInput.value.trim() !== ""
  );
}
