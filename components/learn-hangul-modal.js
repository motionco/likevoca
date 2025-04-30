// 새 요소 다시 가져오기
const newCloseBtn = document.getElementById("close-learn-modal");
const newAnimateBtn = document.getElementById("animate-button");
const newQuizBtn = document.getElementById("quiz-button");
const newDeleteBtn = document.getElementById("delete-hangul");
const newEditBtn = document.getElementById("edit-hangul");

// 모달이 표시된 후 이벤트 리스너 설정 (새 요소에)
newCloseBtn.addEventListener("click", closeModal);
newAnimateBtn.addEventListener("click", toggleImage);
newQuizBtn.addEventListener("click", playPronunciation);
newDeleteBtn.addEventListener("click", deleteHangul);
newEditBtn.addEventListener("click", editHangul);

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
