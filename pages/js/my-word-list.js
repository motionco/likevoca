import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth, db } from "../../js/firebase/firebase-init.js";
import { initAddHangul } from "../../components/js/add-hangul-modal.js";
import { showLearnHangulModal } from "../../components/js/learn-hangul-modal.js";
import {
  loadModals,
  initializeWordListPage,
} from "../../utils/word-list-utils.js";

let currentUser = null;

window.showLearnHangulModal = showLearnHangulModal;

document.addEventListener("DOMContentLoaded", async () => {
  loadNavbar();
  await loadModals([
    "../components/add-hangul-modal.html",
    "../components/learn-hangul-modal.html",
  ]);
  await initAddHangul();

  const elements = {
    addWordBtn: document.getElementById("add-word"),
    searchInput: document.getElementById("search-input"),
    filterType: document.getElementById("filter-type"),
    loadMoreBtn: document.getElementById("load-more"),
  };

  if (elements.addWordBtn) {
    elements.addWordBtn.addEventListener("click", () => {
      const modal = document.getElementById("hangul-modal");
      if (modal) modal.classList.remove("hidden");
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await initializeWordListPage({
        currentUser,
        db,
        type: "wordlist",
        onAddWordClick: () => {
          const modal = document.getElementById("hangul-modal");
          if (modal) modal.classList.remove("hidden");
        },
        elements,
      });
    } else {
      alert("로그인이 필요합니다.");
      window.location.href = "../login.html";
    }
  });
});
