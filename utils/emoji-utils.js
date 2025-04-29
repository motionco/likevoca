// 한글 단어에 대한 이모지 매핑 및 선택 유틸리티 함수

// 단어 기반 이모지 매핑
export const wordBasedEmojiMap = {
  // 신체 부위
  발: ["🦶", "👣", "🧦", "👞", "🩰"],
  손: ["👋", "✋", "👐", "🤲", "🙌"],
  눈: ["👁️", "👀", "👓", "🔍", "👁️‍🗨️"],
  코: ["👃", "🐽", "🌹", "🌷", "🌸"],
  입: ["👄", "👅", "🦷", "💋", "🗣️"],
  귀: ["👂", "👂🏻", "🦻", "🎧", "🔊"],
  다리: ["🦵", "👖", "🚶", "🏃", "💃"],
  팔: ["💪", "👊", "👏", "💅", "🦾"],
  머리: ["👨", "👩", "🧠", "🧢", "👱"],
  얼굴: ["😀", "😃", "😄", "😁", "😆"],
  목: ["👔", "👕", "👗", "💍", "🧣"],
  가슴: ["💓", "❤️", "🫀", "👕", "👚"],
  배: ["🍐", "🚢", "🤰", "⛴️", "🛳️", "🍎", "👨‍👩‍👧", "⚓", "🌊"],
  배_과일: ["🍐", "🍎", "🥭", "🍏", "🥝"],
  배_선박: ["🚢", "⛴️", "🛳️", "⚓", "🌊"],
  배_신체: ["🤰", "👨‍👩‍👧", "👚", "👨‍👩‍👧", "💃"],

  // 동물
  강아지: ["🐶", "🐕", "🦮", "🐩", "🐾"],
  고양이: ["🐱", "🐈", "😺", "😸", "🙀"],
  코끼리: ["🐘", "🌲", "🏞️", "🧠", "👃"],
  호랑이: ["🐯", "🐅", "🌿", "🏞️", "🌴"],
  사자: ["🦁", "🦬", "🪴", "🌿", "🌹"],
  원숭이: ["🐒", "🐵", "🍌", "🌴", "🌲"],

  // 도구
  칼: ["🔪", "🍴", "🍽️", "🗡️", "⚔️"],
  가위: ["✂️", "🦯", "📑", "📄", "🔪"],
  연필: ["✏️", "🖊️", "📝", "🖌️", "🔍"],
  휴지: ["🧻", "🛁", "🚽", "🧼", "💦"],

  // 직업
  의사: ["👨‍⚕️", "👩‍⚕️", "💉", "💊", "🩺"],
  선생님: ["👨‍🏫", "👩‍🏫", "📚", "📝", "🧑‍🎓"],
  요리사: ["👨‍🍳", "👩‍🍳", "🍳", "🥘", "🍲"],
  학생: ["👨‍🎓", "👩‍🎓", "📚", "✏️", "🎒"],

  // 음식
  밥: ["🍚", "🍛", "🍱", "🥄", "🍜"],
  국: ["🍲", "🥣", "🍱", "🥄", "🍜"],
  물: ["💧", "🥛", "🚿", "🌊", "🚰"],
  빵: ["🍞", "🥐", "🥯", "🥖", "🍩"],

  // 장소
  집: ["🏠", "🏡", "🏢", "🏠", "🏘️"],
  학교: ["🏫", "👨‍🏫", "👩‍🎓", "📚", "🎒"],
  병원: ["🏥", "👨‍⚕️", "💉", "🩺", "💊"],
  공원: ["🌳", "🌲", "🌸", "🏞️", "🪂"],

  // 교통
  자동차: ["🚗", "🚙", "🚘", "🏎️", "🛣️"],
  버스: ["🚌", "🚍", "🚏", "🚐", "🗺️"],
  기차: ["🚂", "🚄", "🚅", "🚉", "🛤️"],
  비행기: ["✈️", "🛩️", "🛫", "🛬", "🌤️"],

  // 감정
  웃음: ["😀", "😃", "😄", "😁", "🤣"],
  슬픔: ["😢", "😭", "😞", "😔", "😥"],
  분노: ["😡", "🤬", "👿", "😠", "💢"],
  행복: ["😊", "🥰", "😍", "😌", "🤗"],

  // 자연
  나무: ["🌳", "🌲", "🌱", "🎄", "🍂"],
  꽃: ["🌸", "🌺", "🌷", "🌹", "💐"],
  산: ["⛰️", "🏔️", "🌄", "🧗", "🏞️"],
  바다: ["🌊", "🏖️", "🏝️", "🐙", "🐠"],

  // 과일/채소
  사과: ["🍎", "🍏", "🍓", "🥧", "🧃"],
  바나나: ["🍌", "🐒", "🥭", "🍨", "🥤"],
  당근: ["🥕", "🐰", "🥗", "🍲", "🧆"],
  감자: ["🥔", "🍟", "🍠", "🥘", "🍲"],

  // 다의어 관련 매핑 추가
  밤_시간: ["🌙", "🌛", "🌜", "🌚", "🌃"],
  밤_식품: ["🌰", "🥜", "🍂", "🍁", "🍞"],

  차_음료: ["☕", "🍵", "🫖", "🍶", "🥤"],
  차_교통: ["🚗", "🚙", "🚕", "🚓", "🚌"],

  다리_신체: ["🦵", "👖", "🚶", "🏃", "💃"],
  다리_교량: ["🌉", "🌁", "🌇", "🏞️", "🚗"],

  눈_감각: ["👁️", "👀", "👓", "🔍", "👁️‍🗨️"],
  눈_날씨: ["❄️", "☃️", "⛄", "🌨️", "🏂"],

  말_동물: ["🐴", "🐎", "🏇", "🌾", "🏞️"],
  말_언어: ["💬", "🗣️", "👄", "🔊", "📢"],

  잎_식물: ["🍃", "🍂", "🌿", "🌱", "🍁"],
  입_신체: ["👄", "👅", "🦷", "💋", "🗣️"],
};

// 동의어 매핑
export const synonymMap = {
  개: "강아지",
  댕댕이: "강아지",
  멍멍이: "강아지",
  냥이: "고양이",
  야옹이: "고양이",
  코끼리: "코끼리",
  호랑이: "호랑이",
  사자: "사자",
  원숭이: "원숭이",

  칼: "칼",
  나이프: "칼",
  가위: "가위",
  연필: "연필",
  펜: "연필",
  휴지: "휴지",
  화장지: "휴지",

  닥터: "의사",
  의사: "의사",
  선생님: "선생님",
  교사: "선생님",
  쌤: "선생님",
  요리사: "요리사",
  쉐프: "요리사",
  학생: "학생",

  밥: "밥",
  식사: "밥",
  국: "국",
  수프: "국",
  물: "물",
  워터: "물",
  빵: "빵",
  브레드: "빵",

  집: "집",
  가정: "집",
  홈: "집",
  학교: "학교",
  스쿨: "학교",
  병원: "병원",
  공원: "공원",
  파크: "공원",
};

/**
 * 한글 단어에 대한 여러 이모지 옵션을 생성
 * @param {string} hangul - 이모지를 찾을 한글 단어
 * @returns {Array} - 이모지 옵션 배열
 */
export function getEmojisForHangul(hangul) {
  console.log("한글 단어 이모지 생성:", hangul);

  if (!hangul) {
    return [];
  }

  // 다의어 특별 처리 (예: '배'는 과일, 선박, 신체 등)
  if (hangul === "배") {
    console.log("다의어 처리: 배");
    return wordBasedEmojiMap["배"] || [];
  }

  if (hangul === "밤") {
    console.log("다의어 처리: 밤");
    return [
      ...(wordBasedEmojiMap["밤_시간"] || []),
      ...(wordBasedEmojiMap["밤_식품"] || []),
    ];
  }

  if (hangul === "차") {
    console.log("다의어 처리: 차");
    return [
      ...(wordBasedEmojiMap["차_음료"] || []),
      ...(wordBasedEmojiMap["차_교통"] || []),
    ];
  }

  if (hangul === "다리") {
    console.log("다의어 처리: 다리");
    return [
      ...(wordBasedEmojiMap["다리_신체"] || []),
      ...(wordBasedEmojiMap["다리_교량"] || []),
    ];
  }

  if (hangul === "눈") {
    console.log("다의어 처리: 눈");
    return [
      ...(wordBasedEmojiMap["눈_감각"] || []),
      ...(wordBasedEmojiMap["눈_날씨"] || []),
    ];
  }

  if (hangul === "말") {
    console.log("다의어 처리: 말");
    return [
      ...(wordBasedEmojiMap["말_동물"] || []),
      ...(wordBasedEmojiMap["말_언어"] || []),
    ];
  }

  if (hangul === "잎" || hangul === "입") {
    console.log("다의어 처리: 잎/입");
    return [
      ...(wordBasedEmojiMap["잎_식물"] || []),
      ...(wordBasedEmojiMap["입_신체"] || []),
    ];
  }

  // 정확한 일치 확인
  if (wordBasedEmojiMap[hangul]) {
    console.log("정확한 일치 발견:", hangul);
    return wordBasedEmojiMap[hangul];
  }

  // 동의어 확인
  if (synonymMap[hangul] && wordBasedEmojiMap[synonymMap[hangul]]) {
    console.log("동의어 매핑 발견:", hangul, "->", synonymMap[hangul]);
    return wordBasedEmojiMap[synonymMap[hangul]];
  }

  // 복합어나 접사 처리
  if (hangul.length > 1) {
    // 한글 단어 끝에 ~하다, ~되다, ~스럽다 등의 패턴을 처리
    const verbPatterns = ["하다", "되다", "스럽다", "답다", "적"];
    for (const pattern of verbPatterns) {
      if (hangul.endsWith(pattern)) {
        const root = hangul.substring(0, hangul.length - pattern.length);
        console.log("동사 패턴 감지:", pattern, "루트:", root);

        if (wordBasedEmojiMap[root]) {
          return wordBasedEmojiMap[root];
        }

        if (synonymMap[root] && wordBasedEmojiMap[synonymMap[root]]) {
          return wordBasedEmojiMap[synonymMap[root]];
        }
      }
    }

    // 명사 + 명사 복합어 처리
    for (let i = 1; i < hangul.length; i++) {
      const part1 = hangul.substring(0, i);
      const part2 = hangul.substring(i);

      console.log("복합어 분석 중:", part1, part2);

      // 각 부분을 개별적으로 확인
      if (wordBasedEmojiMap[part1]) {
        return wordBasedEmojiMap[part1];
      }

      if (wordBasedEmojiMap[part2]) {
        return wordBasedEmojiMap[part2];
      }
    }
  }

  // 특별한 패턴 (예: '고'로 시작하는 동물 이름)
  if (hangul.startsWith("고") && !wordBasedEmojiMap[hangul]) {
    console.log("'고'로 시작하는 단어 감지:", hangul);
    return wordBasedEmojiMap["고양이"] || wordBasedEmojiMap["고기"] || [];
  }

  // 카테고리 기반 확인
  const categories = [
    {
      keywords: ["먹", "식", "요리", "요리사", "주방"],
      emojis: ["🍽️", "🍴", "🍕", "🍝", "🍜"],
    },
    {
      keywords: ["동물", "짐승", "새"],
      emojis: ["🐕", "🐈", "🐅", "🐘", "🦁"],
    },
    {
      keywords: ["스포츠", "운동", "체육"],
      emojis: ["⚽", "🏀", "🎾", "🏓", "🏐"],
    },
    {
      keywords: ["음악", "노래", "춤"],
      emojis: ["🎵", "🎶", "🎤", "🎵", "🎹"],
    },
    {
      keywords: ["학교", "학생", "공부", "교육"],
      emojis: ["📚", "✏️", "📝", "🧠", "🎓"],
    },
  ];

  for (const category of categories) {
    if (category.keywords.some((keyword) => hangul.includes(keyword))) {
      console.log("카테고리 키워드 매치:", hangul);
      return category.emojis;
    }
  }

  console.log("이모지 찾기 실패:", hangul);
  return ["❓", "🔍", "📖", "🔤", "🎲"];
}

/**
 * 한글 단어에 대한 이모지 선택 함수
 * @param {string} word - 이모지를 선택할 한글 단어
 * @returns {string} - 선택된 이모지
 */
export function selectEmojiForWord(word) {
  if (!word) return "❓";

  const emojis = getEmojisForHangul(word);

  if (!emojis || emojis.length === 0) {
    console.log("이모지를 찾을 수 없습니다:", word);
    return "❓";
  }

  // 랜덤하게 이모지 선택
  const randomIndex = Math.floor(Math.random() * emojis.length);
  console.log(`단어 '${word}'에 대해 선택된 이모지:`, emojis[randomIndex]);

  return emojis[randomIndex];
}
