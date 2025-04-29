document.addEventListener("DOMContentLoaded", async () => {
  loadNavbar();
  await loadModals(["../components/learn-hangul-modal.html"]);

  // 로컬 환경인지 확인
  const isLocalEnvironment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalEnvironment) {
    // 로컬 환경 알림 메시지 추가
    const alertDiv = document.createElement("div");
    alertDiv.className =
      "fixed top-0 right-0 m-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-md z-50";
    alertDiv.innerHTML = `
      <div class="flex">
        <div class="py-1"><svg class="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
        <div>
          <p class="font-bold">로컬 환경 알림</p>
          <p class="text-sm">로컬 환경에서는 제한된 AI 기능이 제공됩니다. 테스트 데이터를 사용합니다.</p>
          <button class="mt-2 bg-yellow-200 px-2 py-1 rounded text-xs" onclick="this.parentElement.parentElement.parentElement.remove()">닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(alertDiv);
  }

  const elements = {
    addWordBtn: document.getElementById("ai-add-word"),
    searchInput: document.getElementById("search-input"),
    filterType: document.getElementById("filter-type"),
    loadMoreBtn: document.getElementById("load-more"),
  };

  // ... existing code ...
});
