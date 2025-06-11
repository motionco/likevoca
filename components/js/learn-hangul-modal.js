// 필요한 함수들 정의
function closeModal() {
  const modal = document.getElementById("learn-hangul-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function toggleImage() {
  console.log("이미지 토글 기능");
  // 이미지 토글 로직을 여기에 추가
}

function playPronunciation() {
  console.log("발음 재생 기능");
  // 발음 재생 로직을 여기에 추가
}

function deleteHangul() {
  console.log("한글 삭제 기능");
  // 삭제 로직을 여기에 추가
}

console.log("모달 이벤트 리스너 새로 설정 완료");

// 수정 버튼 함수
function editHangul() {
  console.log("수정 버튼 클릭됨");

  // 추가 모달 가져오기
  const modal = document.getElementById("hangul-modal");
  if (!modal) {
    console.error("한글 추가 모달을 찾을 수 없습니다.");
    alert("수정 기능을 사용할 수 없습니다.");
    return;
  }

  // 현재 표시중인 단어 정보 가져오기
  const hangul = document.getElementById("learn-hangul").textContent;
  const pronunciation = document.getElementById(
    "learn-pronunciation"
  ).textContent;
  const meaning = document.getElementById("learn-meaning").textContent;
  const description = document
    .getElementById("learn-description")
    .textContent.split(" (")[0]; // 영어 설명 제거

  // 폼 요소 가져오기
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const descriptionInput = document.getElementById("description-input");
  const addButton = document.getElementById("add-hangul");
  const modalTitle = modal.querySelector("h2");

  // 기존 값으로 폼 채우기
  if (hangulInput) hangulInput.value = hangul;
  if (hangulInput) hangulInput.readOnly = true; // 한글은 수정 불가 (키로 사용하기 때문)
  if (pronunciationInput) pronunciationInput.value = pronunciation;
  if (meaningInput) meaningInput.value = meaning;
  if (descriptionInput) descriptionInput.value = description;

  // 버튼 텍스트 변경
  if (addButton) addButton.textContent = "수정";
  if (modalTitle) modalTitle.textContent = "한글 정보 수정";

  // 수정 모드 플래그 설정
  sessionStorage.setItem("isEditMode", "true");

  // 현재 모달 닫기
  closeModal();

  // 수정 모달 열기
  modal.classList.remove("hidden");
}

export function showLearnHangulModal(
  hangul,
  meaning,
  pronunciation,
  description,
  date
) {
  console.log("showLearnHangulModal 호출됨", {
    hangul,
    meaning,
    pronunciation,
    description,
    date,
  });

  // 모달 요소들 가져오기
  const modal = document.getElementById("learn-hangul-modal");
  const hangulElement = document.getElementById("learn-word");
  const meaningElement = document.getElementById("learn-meaning");
  const pronunciationElement = document.getElementById("learn-pronunciation");
  const descriptionElement = document.getElementById("learn-description");
  const dateElement = document.getElementById("learn-date");

  if (!modal) {
    console.error("learn-hangul-modal을 찾을 수 없습니다.");
    return;
  }

  // 모달 내용 업데이트
  if (hangulElement) hangulElement.textContent = hangul;
  if (meaningElement) meaningElement.textContent = meaning;
  if (pronunciationElement) pronunciationElement.textContent = pronunciation;
  if (descriptionElement) descriptionElement.textContent = description;
  if (dateElement) dateElement.textContent = date;

  // 모달 표시
  modal.classList.remove("hidden");

  // 닫기 버튼 이벤트 리스너
  const closeBtn = document.getElementById("close-learn-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
}
