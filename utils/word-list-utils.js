import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

export function createWordCard(word) {
  return `
      <div 
        class="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 border border-gray-200 cursor-pointer flex flex-col" 
        style="max-height: 280px;"
        onclick="window.showLearnHangulModal(${JSON.stringify(word).replace(
          /"/g,
          "&quot;"
        )})"
      >
        <div class="overflow-hidden mb-4 flex-grow-0 flex justify-center items-center" style="height: 160px;">
          <div class="flex flex-col items-center">
            <h1 class="text-5xl lg:text-6xl font-extrabold text-center text-black overflow-hidden" 
               style="word-break: keep-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${word.hangul}
            </h1>
          </div>
        </div>
        <div class="space-y-3 flex-grow-0">
          <p class="flex items-center text-gray-700 text-lg">
            <i class="fas fa-volume-up text-orange-500 mr-2"></i> 
            <span class="font-semibold line-clamp-1">${
              word.pronunciation || "발음 정보 없음"
            }</span> 
          </p>
          <p class="flex items-center text-gray-700 text-lg">
            <i class="fas fa-book-open text-green-500 mr-2"></i> 
            <span class="font-semibold line-clamp-1">${
              word.meaning || "뜻 정보 없음"
            }</span> 
          </p>
          <p class="flex items-start text-gray-700 text-lg">
            <i class="fas fa-comment-dots text-purple-500 mr-2 mt-1"></i> 
            <span class="font-semibold line-clamp-1">${
              word.description
                ? word.description.length > 15
                  ? word.description.slice(0, 15) + "..."
                  : word.description
                : "설명 없음"
            }</span> 
          </p>
          <p class="text-gray-500 text-xs flex items-center">
            <i class="fas fa-calendar-alt mr-2"></i> 
            ${new Date(word.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    `;
}

export function initializeWordList({
  searchInput,
  filterType,
  loadMoreBtn,
  onSearch,
  onFilterChange,
  onLoadMore,
}) {
  if (searchInput) {
    searchInput.addEventListener("input", onSearch);
  }

  if (filterType) {
    filterType.addEventListener("change", onFilterChange);
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", onLoadMore);
  }
}

export function filterWords(allWords, searchInput, filterType) {
  const searchValue = searchInput.value.toLowerCase();
  const filterValue = filterType.value;

  return allWords.filter((word) => {
    const valueToSearch = (word[filterValue] || "").toString().toLowerCase();
    return valueToSearch.includes(searchValue);
  });
}

export function displayWordList(
  wordList,
  filteredWords,
  displayCount,
  loadMoreBtn
) {
  if (!wordList) return;

  const wordsToShow = filteredWords.slice(0, displayCount);

  if (wordsToShow.length === 0) {
    wordList.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                저장된 단어가 없습니다.
            </div>
        `;
    loadMoreBtn.classList.add("hidden");
    return;
  }

  wordList.innerHTML = wordsToShow.map(createWordCard).join("");

  if (filteredWords.length > displayCount) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }

  return wordsToShow.length;
}

export async function updateUsageUI(currentUser, db, type) {
  const userRef = doc(db, "users", currentUser.email);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  const usage = type === "ai" ? userData.aiUsage || 0 : userData.wordCount || 0;
  const maxUsage =
    type === "ai" ? userData.maxAiUsage || 0 : userData.maxWordCount || 0;

  const usageText = document.getElementById(`${type}-usage-text`);
  const usageBar = document.getElementById(`${type}-usage-bar`);

  usageText.textContent = `${usage}/${maxUsage}`;

  const usagePercentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;
  // Tailwind 기본 클래스 사용 + style로 width 설정
  usageBar.className =
    "bg-blue-500 h-2 rounded-full transition-all duration-300";
  usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

  updateUsageBarColor(usageBar, usagePercentage);
}

function updateUsageBarColor(usageBar, percentage) {
  if (percentage >= 90) {
    usageBar.classList.remove("bg-[#4B63AC]");
    usageBar.classList.add("bg-red-500");
  } else if (percentage >= 70) {
    usageBar.classList.remove("bg-[#4B63AC]");
    usageBar.classList.add("bg-yellow-500");
  } else {
    usageBar.classList.remove("bg-red-500", "bg-yellow-500");
    usageBar.classList.add("bg-[#4B63AC]");
  }
}

export async function initializeWordListPage({
  currentUser,
  db,
  type,
  onAddWordClick,
  elements,
}) {
  if (!currentUser) return;

  if (elements.addWordBtn) {
    elements.addWordBtn.addEventListener("click", onAddWordClick);
  }

  initializeWordList({
    ...elements,
    onSearch: () => handleSearch(elements),
    onFilterChange: () => handleSearch(elements),
    onLoadMore: () => handleLoadMore(elements),
  });

  await fetchAndDisplayWords(currentUser, db, type);
  await updateUsageUI(currentUser, db, type);
}

export function handleSearch(elements) {
  displayCount = 12;
  filteredWords = filterWords(
    allWords,
    elements.searchInput,
    elements.filterType
  );
  displayWordList(
    document.getElementById("word-list"),
    filteredWords,
    displayCount,
    elements.loadMoreBtn
  );
}

export function handleLoadMore(elements) {
  displayCount += 12;
  displayWordList(
    document.getElementById("word-list"),
    filteredWords,
    displayCount,
    elements.loadMoreBtn
  );
}

export async function fetchAndDisplayWords(currentUser, db, type) {
  try {
    if (!currentUser) return;

    const collectionPath =
      type === "ai"
        ? ["ai-recommend", currentUser.email, "ai-recommend"]
        : ["wordlist", currentUser.email, "wordlist"];

    const wordsRef = collection(db, ...collectionPath);
    const q = query(wordsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    allWords = [];
    querySnapshot.forEach((doc) => {
      allWords.push(doc.data());
    });

    document.getElementById("word-count").textContent = allWords.length;
    filteredWords = allWords;
    displayWordList(
      document.getElementById("word-list"),
      filteredWords,
      displayCount,
      document.getElementById("load-more")
    );
  } catch (error) {
    console.error("단어를 가져오는데 실패했습니다.", error);
  }
}

export async function loadModals(modalPaths) {
  // 현재 언어 감지 (기본값: 영어)
  const userLang = navigator.language.toLowerCase().split("-")[0] || "en";
  const supportedLangs = ["ko", "en", "ja", "zh"];
  const lang = supportedLangs.includes(userLang) ? userLang : "en";

  // 각 모달 경로를 언어별 경로로 변환
  const localizedModalPaths = modalPaths.map((path) => {
    const pathParts = path.split("/");
    const fileName = pathParts.pop();
    const dirPath = pathParts.join("/");
    // components/templates/{lang} 경로로 변경
    return `${dirPath}/templates/${lang}/${fileName}`;
  });

  try {
    const responses = await Promise.all(
      localizedModalPaths.map((path) => fetch(path))
    );
    const htmlContents = await Promise.all(
      responses.map((response) => response.text())
    );
    document.getElementById("modal-container").innerHTML =
      htmlContents.join("");
  } catch (error) {
    console.error("모달 로드 중 오류 발생:", error);
    // 오류 발생 시 영어 버전으로 폴백
    if (lang !== "en") {
      const englishModalPaths = modalPaths.map((path) => {
        const pathParts = path.split("/");
        const fileName = pathParts.pop();
        const dirPath = pathParts.join("/");
        // components/templates/en 경로로 변경
        return `${dirPath}/templates/en/${fileName}`;
      });
      const responses = await Promise.all(
        englishModalPaths.map((path) => fetch(path))
      );
      const htmlContents = await Promise.all(
        responses.map((response) => response.text())
      );
      document.getElementById("modal-container").innerHTML =
        htmlContents.join("");
    }
  }
}

let allWords = [];
let filteredWords = [];
let displayCount = 12;

export { allWords, filteredWords, displayCount };
