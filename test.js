//
테스트;
코드;

// 테스트 코드
function selectEmojiForWordImproved(koreanWord, englishMeaning) {
  console.log("이모지 선택 시작:", koreanWord, englishMeaning);

  if (!koreanWord && !englishMeaning) return "❓";

  // 한글 단어로 먼저 시도
  if (koreanWord) {
    // 테스트용 간단한 매핑
    const koreanToEmoji = {
      강아지: "🐶",
      고양이: "🐱",
      물: "💧",
      학교: "🏫",
      집: "🏠",
      음식: "🍲",
      친구: "👫",
      사랑: "❤️",
    };

    if (koreanToEmoji[koreanWord]) {
      console.log("한글 단어에 대한 이모지 찾음:", koreanToEmoji[koreanWord]);
      return koreanToEmoji[koreanWord];
    }
  }

  // 영어 의미로 시도
  if (englishMeaning) {
    // 영어 키워드 추출
    let englishKeyword = englishMeaning;

    if (englishMeaning.includes("/")) {
      englishKeyword = englishMeaning.split("/")[0].trim();
    }

    englishKeyword = englishKeyword.split(" ")[0].trim().toLowerCase();
    console.log("영어 키워드:", englishKeyword);

    // 영어 키워드 매핑
    const englishToEmoji = {
      dog: "🐶",
      cat: "🐱",
      water: "💧",
      school: "🏫",
      house: "🏠",
      food: "🍲",
      friend: "👫",
      love: "❤️",
    };

    if (englishToEmoji[englishKeyword]) {
      console.log(
        "영어 키워드에 대한 이모지 찾음:",
        englishToEmoji[englishKeyword]
      );
      return englishToEmoji[englishKeyword];
    }

    // 카테고리 매핑
    const categories = [
      {
        keywords: ["food", "eat", "cook"],
        emojis: ["🍕", "🍔", "🍜", "🍲", "🍱"],
      },
      {
        keywords: ["animal", "pet"],
        emojis: ["🐶", "🐱", "🐰", "🐼", "🦁"],
      },
    ];

    for (const category of categories) {
      if (
        category.keywords.some((keyword) =>
          englishMeaning.toLowerCase().includes(keyword)
        )
      ) {
        const randomIndex = Math.floor(Math.random() * category.emojis.length);
        console.log(
          "카테고리 매치에 대한 이모지 찾음:",
          category.emojis[randomIndex]
        );
        return category.emojis[randomIndex];
      }
    }
  }

  console.log("이모지를 찾을 수 없습니다");
  return "❓";
}

// 테스트
console.log("1. 한글만:", selectEmojiForWordImproved("강아지"));
console.log("2. 영어만:", selectEmojiForWordImproved("", "dog"));
console.log("3. 둘 다:", selectEmojiForWordImproved("강아지", "dog"));
console.log("4. 카테고리:", selectEmojiForWordImproved("", "animal lover"));
console.log("5. 매치 없음:", selectEmojiForWordImproved("xyz", "unknown"));
console.log("6. 슬래시:", selectEmojiForWordImproved("", "dog / doggo"));
