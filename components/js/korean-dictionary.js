// 지원하는 언어 목록에 베트남어 추가
const supportedLanguages = {
  english: "영어",
  japanese: "일본어",
  chinese: "중국어",
  vietnamese: "베트남어", // 베트남어 추가
};

// 언어 선택 드롭다운에 베트남어 옵션 추가
function updateLanguageDropdown() {
  const languageSelect = document.getElementById("language-select");

  // 기존 옵션 제거
  languageSelect.innerHTML = "";

  // 옵션 추가
  for (const [code, name] of Object.entries(supportedLanguages)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    languageSelect.appendChild(option);
  }
}
