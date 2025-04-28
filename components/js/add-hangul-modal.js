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

// 한글 의미에 기반한 이모지 매핑
const meaningBasedEmojis = {
  사람: ["👤", "👥", "👨", "👩", "🧑", "🧒", "👶"],
  가족: ["👨‍👩‍👧‍👦", "👨‍👩‍👧", "👨‍👩‍👦", "👪", "👨‍👨‍👧‍👦", "👩‍👩‍👧‍👦"],
  동물: ["🐕", "🐈", "🐅", "🐆", "🦁", "🐘", "🦒", "🐄", "🐖", "🐑"],
  새: ["🐦", "🦆", "🦅", "🦉", "🦜", "🐓", "🕊️"],
  자연: ["🌳", "🌲", "🌴", "🌵", "🌿", "🍀", "🌱", "💐", "🌷", "🌹"],
  날씨: ["☀️", "⛅", "☁️", "🌤️", "🌥️", "🌦️", "🌧️", "🌨️", "🌩️", "❄️"],
  음식: ["🍎", "🍕", "🍔", "🍜", "🍚", "🍙", "🍣", "🍖", "🍗", "🥩"],
  과일: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍑", "🍒", "🍍"],
  채소: ["🥕", "🥔", "🥦", "🥬", "🥒", "🌽", "🍆", "🧅", "🧄", "🥑"],
  학교: ["🏫", "📚", "✏️", "📝", "📓", "🎒", "👨‍🏫", "👩‍🏫", "🧑‍🎓", "👨‍🎓"],
  스포츠: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🏊", "🚴"],
  감정: ["😀", "😍", "😢", "😡", "😱", "😎", "🥰", "😂", "😭", "😴"],
  교통: ["🚗", "🚕", "🚌", "🚂", "✈️", "🚢", "🛩️", "🚲", "🚁", "🛵"],
  음악: ["🎵", "🎶", "🎸", "🎹", "🎺", "🎷", "🥁", "🎻", "🎤", "🎧"],
  문화: ["🎭", "🎬", "🎨", "📽️", "🎞️", "🏛️", "🎪", "🎎", "🎌", "🏮"],
  직업: ["👨‍⚕️", "👩‍⚕️", "👨‍🚒", "👩‍🚒", "👮", "👨‍🍳", "👩‍🍳", "👨‍🔧", "👩‍🔧", "👷"],
  과학: ["🔬", "🔭", "⚗️", "🧪", "💻", "🔋", "🧬", "🧠", "🦠", "🧫"],
  시간: ["⏰", "⌚", "⏱️", "⏲️", "🕰️", "📅", "📆", "🗓️"],
  장소: ["🏠", "🏢", "🏨", "🏥", "🏭", "🏛️", "⛪", "🏯", "🏰", "🗽"],
  색상: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🌈"],
  자연환경: ["🏞️", "🌋", "🏜️", "🏝️", "⛰️", "🏔️", "🌄", "🌅", "🌊", "🌲"],
  학습: ["📚", "📝", "✏️", "📊", "🧮", "🔍", "🧠", "💭", "🎓", "👨‍🏫"],
  통신: ["📱", "📞", "📲", "💻", "📧", "📨", "✉️", "📡", "🛰️", "📺"],
  건강: ["❤️", "🏥", "💊", "💉", "🩺", "🧬", "🦷", "👨‍⚕️", "🍎", "🏃"],
};

const synonymMap = {
  // 기존 동의어
  // ... existing code ...

  // 피 관련 동의어
  피: "피", // 자기 자신 참조 (wordBasedEmojiMap에서 피 이모지 사용)

  // 기타 추가
  발: "발",
  다리: "다리",
  건널다리: "다리_교량", // 교량 다리
  교량: "다리_교량",
  다리_교량: "다리_교량",
  사다리: "사다리",

  // 직업 및 장소 추가
  병원: "병원",
  의사: "의사",
  간호사: "간호사",
  경찰: "경찰",
  소방관: "소방관",
  소방차: "소방차",
  선생님: "선생님",
  군인: "군인",
  요리사: "요리사",
  엔지니어: "엔지니어",
  과학자: "과학자",
  농부: "농부",
  어부: "어부",

  // 동물 추가
  돼지: "돼지",
  뱀: "뱀",
  토끼: "토끼",
  사자: "사자",
  호랑이: "호랑이",
  기린: "기린",
  원숭이: "원숭이",
  코알라: "코알라",
  팬더: "팬더",
  곰: "곰",

  // 무기/도구 추가
  권총: "권총",
  총: "권총",
  칼: "칼",
  검: "칼",
  도끼: "도끼",
  망치: "망치",

  // 과일 추가
  사과: "사과",
  바나나: "바나나",
  오렌지: "오렌지",
  딸기: "딸기",
  포도: "포도",
  수박: "수박",
  파인애플: "파인애플",
  복숭아: "복숭아",
  체리: "체리",
  멜론: "멜론",

  // 채소 추가
  당근: "당근",
  감자: "감자",
  양파: "양파",
  브로콜리: "브로콜리",
  토마토: "토마토",
  오이: "오이",
  가지: "가지",
  마늘: "마늘",
  고구마: "고구마",
  상추: "상추",

  // 날씨 관련 항목 추가
  태양: "태양",
  해: "태양",
  구름: "구름",
  비: "비",
  눈: "눈",
  번개: "번개",
  안개: "안개",
  바람: "바람",
  폭풍: "폭풍",
  우산: "우산",

  // 신발/의류 관련 항목 추가
  운동화: "운동화",
  신발: "신발",
  구두: "구두",
  양말: "양말",
  옷: "옷",
  셔츠: "셔츠",
  바지: "바지",
  치마: "치마",
  모자: "모자",
  장갑: "장갑",

  // 감정 관련 항목 추가
  웃음: "웃음",
  슬픔: "슬픔",
  분노: "분노",
  행복: "행복",
  사랑: "사랑",
  놀람: "놀람",
  공포: "공포",

  // 슬픔 관련 감정 표현 추가
  눈물: "눈물",
  울음: "눈물",
  울다: "눈물",
  울기: "눈물",
  우는: "눈물",
  펑펑: "눈물",
  서럽다: "눈물",
  서러움: "눈물",
  흐느끼다: "눈물",
  흐느낌: "눈물",
  눈물짓다: "눈물",

  // 교통 관련 항목 추가
  자동차: "자동차",
  버스: "버스",
  기차: "기차",
  비행기: "비행기",
  배: "배",
  자전거: "자전거",
  오토바이: "오토바이",
  택시: "택시",

  // 음악 관련 항목 추가
  노래: "노래",
  음표: "음표",
  기타: "기타",
  피아노: "피아노",
  드럼: "드럼",
  바이올린: "바이올린",

  // 시간 관련 항목 추가
  시계: "시계",
  알람: "알람",
  달력: "달력",

  // 장소 관련 항목 추가
  집: "집",
  빌딩: "빌딩",
  호텔: "호텔",
  병원: "병원",
  학교: "학교",
  공장: "공장",
  성: "성",

  // 색상 관련 항목 추가
  빨강: "빨강",
  주황: "주황",
  노랑: "노랑",
  초록: "초록",
  파랑: "파랑",
  보라: "보라",
  검정: "검정",
  하양: "하양",
  갈색: "갈색",
  무지개: "무지개",

  // 자연환경 관련 항목 추가
  산: "산",
  바다: "바다",
  강: "강",
  호수: "호수",
  폭포: "폭포",
  해변: "해변",
  숲: "숲",
  섬: "섬",

  // 학습 관련 항목 추가
  책: "책",
  연필: "연필",
  공부: "공부",
  시험: "시험",
  숙제: "숙제",
  졸업: "졸업",
  수업: "수업",

  // 통신 관련 항목 추가
  전화: "전화",
  휴대폰: "휴대폰",
  컴퓨터: "컴퓨터",
  이메일: "이메일",
  편지: "편지",
  텔레비전: "텔레비전",

  // 건강 관련 항목 추가
  심장: "심장",
  약: "약",
  주사: "주사",
  운동: "운동",

  // 우주/천체 관련 항목 추가
  지구: "지구",
  달: "달",
  태양계: "태양계",
  우주: "우주",
  별: "별",
  행성: "행성",
  은하: "은하",
  혜성: "혜성",

  // 다의어 관련 매핑 추가
  배_과일: "배_과일",
  배_선박: "배_선박",
  배_신체: "배_신체",
  배: "배",

  밤_시간: "밤_시간",
  밤_식품: "밤_식품",

  차_음료: "차_음료",
  차_교통: "차_교통",

  다리_신체: "다리_신체",
  다리_교량: "다리_교량",

  눈_감각: "눈_감각",
  눈_날씨: "눈_날씨",

  말_동물: "말_동물",
  말_언어: "말_언어",

  잎_식물: "잎_식물",
  입_신체: "입_신체",

  // 신체 부위 추가
  어깨: "어깨",
  코: "코",
  무릎: "무릎",
  팔: "팔",
  손: "손",
  귀: "귀",
  목: "목",
  등: "등",
  머리: "머리",
  얼굴: "얼굴",
  이마: "이마",
  눈썹: "눈썹",
  뺨: "뺨",
  턱: "턱",
  가슴: "가슴",
  허리: "허리",
  엉덩이: "엉덩이",
  손가락: "손가락",
  발가락: "발가락",
  팔꿈치: "팔꿈치",
  발목: "발목",
  겨드랑이: "겨드랑이",
  종아리: "종아리",
  허벅지: "허벅지",

  // 나라/국가 추가
  한국: "한국",
  대한민국: "한국",
  코리아: "한국",
  미국: "미국",
  미합중국: "미국",
  아메리카: "미국",
  일본: "일본",
  중국: "중국",
  영국: "영국",
  프랑스: "프랑스",
  독일: "독일",
  이탈리아: "이탈리아",
  스페인: "스페인",
  러시아: "러시아",
  캐나다: "캐나다",
  호주: "호주",
  인도: "인도",
  브라질: "브라질",
  멕시코: "멕시코",
  태국: "태국",
  베트남: "베트남",
  인도네시아: "인도네시아",
  싱가포르: "싱가포르",
  필리핀: "필리핀",
  말레이시아: "말레이시아",
};

const wordBasedEmojiMap = {
  // 기존 단어
  // ... existing code ...

  // 신체 부위 추가
  발: ["👣", "👞", "🧦", "🏃", "👟"],
  다리: ["🦵", "👖", "🚶", "🏃", "💃"],
  다리_신체: ["🦵", "👖", "🚶", "🏃", "💃"],
  입_신체: ["👄", "👅", "🦷", "💋", "🗣️"],
  어깨: ["💪", "👔", "👕", "👨", "👩"],
  코: ["👃", "🤧", "😤", "🧠", "👨‍⚕️"],
  무릎: ["🦵", "🧎", "🧎‍♀️", "🧎‍♂️", "🏃"],
  팔: ["💪", "🦾", "👔", "👕", "🥊"],
  손: ["👋", "✋", "🤚", "🖐️", "🫴"],
  귀: ["👂", "🦻", "🎧", "🔊", "👨‍🦰"],
  목: ["👔", "👕", "👨", "👩", "💋"],
  등: ["👔", "👕", "👨", "👩", "🧍"],
  머리: ["👦", "👧", "👨", "👩", "🧠"],
  얼굴: ["😀", "😊", "😎", "👨", "👩"],
  이마: ["👨", "👩", "🧠", "🤒", "👶"],
  눈썹: ["👁️", "👀", "👨", "👩", "🧔"],
  뺨: ["😊", "😗", "😚", "👨", "👩"],
  턱: ["🧔", "👨", "👩", "🗣️", "💬"],
  가슴: ["👕", "👚", "👨", "👩", "❤️"],
  허리: ["👖", "👗", "🧍", "🤸", "💃"],
  엉덩이: ["🍑", "👖", "👗", "🧍", "💃"],
  손가락: ["👆", "👇", "👈", "👉", "👍"],
  발가락: ["👣", "🦶", "👞", "👟", "🧦"],
  팔꿈치: ["💪", "👔", "👕", "🤸", "🧍"],
  발목: ["👣", "🦶", "👞", "👟", "🧦"],
  겨드랑이: ["👕", "👚", "🧍", "🧖", "🤸"],
  종아리: ["🦵", "👖", "🏃", "🚶", "🧎"],
  허벅지: ["🦵", "👖", "🧍", "🏃", "🚶"],

  // 구조물 추가
  다리_교량: ["🌉", "🌁", "🌇", "🏞️", "🚗"],
  사다리: ["🪜", "🧗", "🚒", "🏗️", "🔧"],

  // 동물 추가
  코끼리: ["🐘", "🌴", "🥜", "🌍", "🦣"],
  돼지: ["🐖", "🐷", "🥓", "🥩", "🧠"],
  뱀: ["🐍", "🐉", "🦎", "🌿", "🏕️"],
  토끼: ["🐰", "🐇", "🥕", "🌱", "🌿"],
  사자: ["🦁", "🌍", "🦓", "🐅", "🌴"],
  호랑이: ["🐅", "🐯", "🌳", "🌿", "🐆"],
  기린: ["🦒", "🌴", "🌿", "🌱", "🌍"],
  원숭이: ["🐒", "🐵", "🍌", "🌴", "🦧"],
  코알라: ["🐨", "🌿", "🌱", "🌳", "🇦🇺"],
  팬더: ["🐼", "🎋", "🌿", "🌱", "🎍"],
  곰: ["🐻", "🐻‍❄️", "🌲", "🍯", "🌳"],

  // 무기/도구 추가
  권총: ["🔫", "👮", "🎯", "🚓", "🚨"],
  칼: ["🔪", "🍴", "🔨", "⚔️", "🗡️"],
  도끼: ["🪓", "🌲", "🪵", "🏕️", "🔨"],
  망치: ["🔨", "🛠️", "🪛", "🔧", "⚒️"],

  // 음식 추가
  피자: ["🍕", "🧀", "🍅", "🍞", "🍽️"],

  // 기타 추가
  피: ["🩸", "💉", "🩹", "🏥", "❤️"],

  // 직업 관련 추가
  의사: ["👨‍⚕️", "👩‍⚕️", "💉", "🩺", "💊"],
  간호사: ["👨‍⚕️", "👩‍⚕️", "💉", "🏥", "🌡️"],
  경찰: ["👮", "👮‍♀️", "🚓", "🚨", "🔫"],
  소방관: ["👨‍🚒", "👩‍🚒", "🚒", "🧯", "🔥"],
  소방차: ["🚒", "🧯", "🚨", "👨‍🚒", "🔥"],
  선생님: ["👨‍🏫", "👩‍🏫", "📚", "🏫", "📝"],
  군인: ["💂", "🪖", "🎖️", "🪂", "🛡️"],
  요리사: ["👨‍🍳", "👩‍🍳", "🍲", "🔪", "🍴"],
  엔지니어: ["👨‍💻", "👩‍💻", "🔧", "⚙️", "🛠️"],
  과학자: ["👨‍🔬", "👩‍🔬", "🔬", "🧪", "⚗️"],
  농부: ["👨‍🌾", "👩‍🌾", "🌱", "🚜", "🌾"],
  어부: ["🎣", "🐟", "🌊", "🛥️", "🦑"],

  // 장소 관련 추가
  병원: ["🏥", "👨‍⚕️", "💉", "🩺", "💊"],
  학교: ["🏫", "👨‍🏫", "👩‍🎓", "📚", "🎒"],
  경찰서: ["🏢", "👮", "🚓", "🚨", "🔫"],
  소방서: ["🏢", "👨‍🚒", "🚒", "🧯", "🔥"],
  도서관: ["📚", "🔍", "📖", "🧠", "🏛️"],
  박물관: ["🏛️", "🖼️", "🗿", "🏺", "🦖"],
  수영장: ["🏊", "🏊‍♀️", "🏊‍♂️", "💦", "🩱"],
  체육관: ["🏋️", "🏋️‍♀️", "💪", "🏃", "🤸"],
  공원: ["🌳", "🌲", "🌸", "🏞️", "🪂"],
  놀이터: ["🎡", "🎢", "🎠", "🛝", "🏌️"],
  음식점: ["🍽️", "🍴", "🍕", "🍝", "🍜"],
  카페: ["☕", "🍰", "🧁", "🧁", "🥐"],

  // 과일 추가
  사과: ["🍎", "🍏", "🍓", "🥧", "🧃"],
  바나나: ["🍌", "🐒", "🥭", "🍨", "🥤"],
  오렌지: ["🍊", "🧃", "🥭", "🍹", "🟠"],
  딸기: ["🍓", "🍰", "🥛", "🧁", "🍧"],
  포도: ["🍇", "🍷", "🧃", "🍨", "🍰"],
  수박: ["🍉", "🥤", "🍧", "🍨", "🏖️"],
  파인애플: ["🍍", "🥭", "🍹", "🏝️", "🥥"],
  복숭아: ["🍑", "🍦", "🍰", "🧁", "🥤"],
  체리: ["🍒", "🍰", "🧁", "🍧", "🍨"],
  멜론: ["🍈", "🍦", "🥤", "🍧", "🍨"],

  // 채소 추가
  당근: ["🥕", "🐰", "🥗", "🍲", "🧆"],
  감자: ["🥔", "🍟", "🍠", "🥘", "🍲"],
  양파: ["🧅", "🍲", "🥘", "🍜", "🧄"],
  브로콜리: ["🥦", "🥗", "🍲", "🥬", "🍜"],
  토마토: ["🍅", "🥫", "🍝", "🍕", "🥗"],
  오이: ["🥒", "🥗", "🥙", "🥪", "🍹"],
  가지: ["🍆", "🍲", "🥘", "🥗", "🍝"],
  마늘: ["🧄", "🍝", "🥘", "🍲", "🍕"],
  고구마: ["🍠", "🍲", "🥘", "🍜", "🥔"],
  상추: ["🥬", "🥗", "🥙", "🌿", "🥪"],

  // 날씨 관련 항목 추가
  태양: ["☀️", "🌞", "🌅", "🌄", "🔆"],
  구름: ["☁️", "⛅", "🌥️", "🌤️", "🌦️"],
  비: ["🌧️", "☔", "⛈️", "🌂", "💧"],
  눈: ["❄️", "☃️", "⛄", "🌨️", "🏂"],
  번개: ["⚡", "🌩️", "⛈️", "🔌", "⚡"],
  안개: ["🌫️", "💨", "🌁", "🌫️", "☁️"],
  바람: ["💨", "🌪️", "🌬️", "🍃", "🏝️"],
  폭풍: ["🌪️", "⛈️", "🌊", "🌩️", "💥"],
  우산: ["☂️", "☔", "🌂", "🏖️", "💧"],

  // 신발/의류 관련 항목 추가
  운동화: ["👟", "👞", "👣", "🏃", "🏋️"],
  신발: ["👞", "👠", "👡", "👢", "👣"],
  구두: ["👞", "👠", "��", "🕴️", "👨‍💼"],
  양말: ["🧦", "👣", "👕", "👖", "🧶"],
  옷: ["👕", "👚", "👗", "👔", "👖"],
  셔츠: ["👕", "👚", "👔", "🧵", "🛍️"],
  바지: ["👖", "👕", "👔", "🧵", "🧶"],
  치마: ["👗", "👚", "👢", "👠", "💃"],
  모자: ["🧢", "👒", "🎩", "⛑️", "👑"],
  장갑: ["🧤", "🧣", "🧦", "❄️", "⛷️"],

  // 감정 관련 항목 추가
  웃음: ["😀", "😃", "😄", "😁", "🤣"],
  슬픔: ["😢", "😭", "😞", "😔", "😥"],
  분노: ["😡", "🤬", "👿", "😠", "💢"],
  행복: ["😊", "🥰", "😍", "😌", "🤗"],
  사랑: ["❤️", "💕", "💘", "🥰", "😍"],
  놀람: ["😲", "😮", "😯", "😱", "😳"],
  공포: ["😱", "😨", "😰", "👻", "🙀"],

  // 슬픔 관련 감정 표현 추가
  눈물: ["😭", "😢", "🥲", "😪", "💧"],
  울음: ["😭", "😢", "🥲", "😪", "💧"],
  울다: ["😭", "😢", "🥲", "😪", "💧"],
  울기: ["😭", "😢", "🥲", "😪", "💧"],
  우는: ["😭", "😢", "🥲", "😪", "💧"],
  펑펑: ["😭", "😢", "🥲", "😪", "💧"],
  서럽다: ["😭", "😢", "🥲", "😪", "💧"],
  서러움: ["😭", "😢", "🥲", "😪", "💧"],
  흐느끼다: ["😭", "😢", "🥲", "😪", "💧"],
  흐느낌: ["😭", "😢", "🥲", "😪", "💧"],
  눈물짓다: ["😭", "😢", "🥲", "😪", "💧"],

  // 교통 관련 항목 추가
  자동차: ["🚗", "🚙", "🚘", "🏎️", "🛣️"],
  버스: ["🚌", "🚍", "🚏", "🚐", "🗺️"],
  기차: ["🚂", "🚄", "🚅", "🚉", "🛤️"],
  비행기: ["✈️", "🛩️", "🛫", "🛬", "🌤️"],
  배: ["🚢", "⛴️", "🛳️", "⚓", "🌊"],
  자전거: ["🚲", "🚵", "🚴", "🛵", "🏍️"],
  오토바이: ["🏍️", "🛵", "🚲", "🛣️", "🏎️"],
  택시: ["🚕", "🚖", "🚗", "🚇", "🚏"],

  // 음악 관련 항목 추가
  노래: ["🎵", "🎶", "🎤", "🎙️", "🎸"],
  음표: ["🎵", "🎶", "🎼", "🎹", "🎷"],
  기타: ["🎸", "🎵", "🎶", "🎤", "🎼"],
  피아노: ["🎹", "🎵", "🎶", "🎼", "🎻"],
  드럼: ["🥁", "🎵", "🎶", "🎸", "🎤"],
  바이올린: ["🎻", "🎵", "🎶", "🎼", "🎹"],

  // 시간 관련 항목 추가
  시계: ["⏰", "⌚", "⏱️", "⏲️", "🕰️"],
  알람: ["⏰", "⏱️", "⏲️", "⌚", "🔔"],
  달력: ["📅", "📆", "🗓️", "📋", "📅"],

  // 색상 관련 항목 추가
  빨강: ["🔴", "❤️", "🍎", "🌹", "🧧"],
  주황: ["🟠", "🍊", "🔶", "🟧", "🦊"],
  노랑: ["🟡", "🌕", "🌟", "🍋", "💛"],
  초록: ["🟢", "🌿", "🍀", "🥝", "🥬"],
  파랑: ["🔵", "🌊", "💙", "🦋", "🧢"],
  보라: ["🟣", "💜", "🍇", "🎆", "🪀"],
  검정: ["⚫", "⬛", "◼️", "▪️", "🏴"],
  하양: ["⚪", "⬜", "◻️", "▫️", "🤍"],
  갈색: ["🟤", "🍂", "🧸", "🌰", "🦓"],
  무지개: ["🌈", "🏳️‍🌈", "🔄", "🎨", "🦄"],

  // 자연환경 관련 항목 추가
  산: ["⛰️", "🏔️", "🌄", "🧗", "🏞️"],
  바다: ["🌊", "🏖️", "🏝️", "🐙", "🐠"],
  강: ["🏞️", "🌊", "🚣", "🎣", "⛵"],
  호수: ["🏞️", "💦", "🚣", "⛵", "🎣"],
  폭포: ["💦", "🏞️", "⛰️", "🏔️", "💧"],
  해변: ["🏖️", "🌊", "🏝️", "☀️", "🏄"],
  숲: ["🌲", "🌳", "🍄", "🦌", "🏞️"],
  섬: ["🏝️", "🌴", "🌊", "🏖️", "🗿"],

  // 학습 관련 항목 추가
  책: ["📚", "📖", "📕", "📗", "📘"],
  연필: ["✏️", "🖊️", "📝", "🖌️", "🔍"],
  공부: ["📚", "✏️", "🔍", "🧠", "📝"],
  시험: ["📝", "✏️", "📚", "🧠", "🎓"],
  숙제: ["📝", "📚", "✏️", "🏠", "📓"],
  졸업: ["🎓", "📜", "🏫", "👨‍🎓", "👩‍🎓"],
  수업: ["👨‍🏫", "👩‍🏫", "📚", "🏫", "📝"],

  // 통신 관련 항목 추가
  전화: ["📞", "☎️", "📱", "📲", "🔊"],
  휴대폰: ["📱", "📲", "📞", "💬", "🔋"],
  컴퓨터: ["💻", "⌨️", "🖱️", "🖥️", "📊"],
  이메일: ["📧", "📨", "📤", "📥", "💻"],
  편지: ["✉️", "📨", "📩", "📮", "📄"],
  텔레비전: ["📺", "🎮", "📡", "🎬", "🍿"],

  // 건강 관련 항목 추가
  심장: ["❤️", "💓", "💗", "💖", "💘"],
  약: ["💊", "💉", "🏥", "👨‍⚕️", "👩‍⚕️"],
  주사: ["💉", "💊", "🩸", "🏥", "👨‍⚕️"],
  운동: ["🏃", "🏋️", "🏋️", "🏊", "⚽"],

  // 우주/천체 관련 항목 추가
  지구: ["🌍", "🌎", "🌏", "🌐", "🪐"],
  달: ["🌙", "🌛", "🌜", "🌝", "🌚"],
  태양계: ["☀️", "🌍", "🌙", "⭐", "🪐"],
  우주: ["🌌", "✨", "🚀", "👨‍🚀", "🛰️"],
  별: ["⭐", "🌟", "✨", "💫", "🌠"],
  행성: ["🪐", "🌍", "🌎", "🌏", "🌌"],
  은하: ["🌌", "✨", "💫", "🌟", "🔭"],
  혜성: ["☄️", "🌠", "💫", "🌌", "✨"],

  // 다의어 관련 이모지 추가
  배_과일: ["🍐", "🍎", "🥭", "🍏", "🥝"],
  배_선박: ["🚢", "⛴️", "🛳️", "⚓", "🌊"],
  배_신체: ["🤰", "👨‍👩‍👧", "👚", "👨‍👩‍��", "💃"],
  배: ["🍐", "🚢", "🤰", "⛴️", "🛳️", "🍎", "👨‍👩‍👧", "⚓", "🌊"],

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

  // 나라/국가 추가 (국기 이모지 대체)
  한국: ["🎭", "🍲", "🏛️", "🥻", "☯️"],
  미국: ["🗽", "🦅", "🏈", "🍔", "🏙️"],
  일본: ["🌸", "🍣", "🗾", "🏯", "⛩️"],
  중국: ["🐉", "🧧", "🥢", "🏮", "🐼"],
  영국: ["🏰", "🚌", "☕", "👑", "🧸"],
  프랑스: ["🗼", "🥖", "🧀", "🍷", "🎨"],
  독일: ["🍺", "🥨", "🏰", "🚗", "⚽"],
  이탈리아: ["🍕", "🍝", "🏛️", "🍷", "🚤"],
  스페인: ["💃", "🥘", "🏰", "🐂", "🏖️"],
  러시아: ["🏰", "❄️", "🐻", "⛪", "🥶"],
  캐나다: ["🍁", "🏞️", "🐻", "❄️", "🏒"],
  호주: ["🦘", "🐨", "🏄", "🏖️", "🏉"],
  인도: ["🕉️", "🍛", "🐘", "🏏", "🏯"],
  브라질: ["⚽", "🏖️", "🏞️", "🎭", "🌴"],
  멕시코: ["🌮", "🌵", "🎸", "🏜️", "🎭"],
  태국: ["🍜", "🏖️", "🐘", "🛕", "🏝️"],
  베트남: ["🍜", "🌿", "🛖", "🎋", "🌴"],
  인도네시아: ["🏝️", "🌋", "🕌", "🏄", "🌴"],
  싱가포르: ["🦁", "🏙️", "🚢", "🌆", "🍜"],
  필리핀: ["🏝️", "🌊", "🏄", "⛪", "🥥"],
  말레이시아: ["🏙️", "🕌", "🌴", "🐯", "🌊"],
};

export async function initAddHangul() {
  const closeModalBtn = document.getElementById("close-modal");
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const descriptionInput = document.getElementById("description-input");
  const emojiOptions = document.getElementById("emoji-options");
  const imageInput = document.getElementById("image-input");
  const saveHangulBtn = document.getElementById("add-hangul");

  // 이모지 메시지 요소는 더이상 사용하지 않으므로 주석 처리
  // let emojiMessage = document.getElementById("emoji-message");
  // if (!emojiMessage) {
  //   emojiMessage = document.createElement("div");
  //   emojiMessage.id = "emoji-message";
  //   emojiMessage.className = "mt-2 text-yellow-600 text-sm hidden";
  //   emojiOptions.parentNode.insertBefore(emojiMessage, emojiOptions);
  // }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      closeModal();
      resetForm();
    });
  }

  if (hangulInput) {
    hangulInput.addEventListener("input", async (e) => {
      const hangul = e.target.value.trim();
      if (hangul) {
        try {
          // 전체 한글에 대한 발음 자동 생성
          pronunciationInput.value = getFullPronunciation(hangul);

          // 이모지 옵션 생성
          emojiOptions.innerHTML = "";
          // 전체 입력된 문자열로 이모지 생성
          const emojis = generateEmojisForHangul(hangul);

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
        const pronunciation = pronunciationInput.value.trim();
        const meaning = meaningInput.value.trim();
        const description = descriptionInput.value.trim();
        const image = imageInput.value.trim();

        // 단어 추가
        const wordlistRef = doc(db, "wordlist", userEmail, "wordlist", hangul);
        await setDoc(wordlistRef, {
          hangul: hangul,
          pronunciation: pronunciation,
          meaning: meaning,
          description: description,
          image: image,
          createdAt: new Date().toISOString(),
        });

        // 사용자 단어 수 증가
        await updateDoc(userRef, {
          wordCount: userData.wordCount + 1,
        });

        alert("한글이 성공적으로 추가되었습니다.");

        // 모달 닫기 및 폼 초기화
        closeModal();
        resetForm();

        // 페이지 새로고침 (단어 목록 업데이트를 위해)
        window.location.reload();
      } catch (error) {
        console.error("한글 추가 중 오류 발생: ", error);
        alert("한글 추가에 실패했습니다.");
      }
    });
  }
}

// 폼 유효성 검사 함수
function validateForm() {
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const descriptionInput = document.getElementById("description-input");
  const imageInput = document.getElementById("image-input");

  return (
    hangulInput.value.trim() !== "" &&
    pronunciationInput.value.trim() !== "" &&
    meaningInput.value.trim() !== "" &&
    descriptionInput.value.trim() !== "" &&
    imageInput.value.trim() !== ""
  );
}

// 모달 닫기 함수
function closeModal() {
  const modal = document.getElementById("add-hangul-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 폼 초기화 함수
function resetForm() {
  const hangulInput = document.getElementById("hangul-input");
  const pronunciationInput = document.getElementById("pronunciation-input");
  const meaningInput = document.getElementById("meaning-input");
  const descriptionInput = document.getElementById("description-input");
  const emojiOptions = document.getElementById("emoji-options");
  const imageInput = document.getElementById("image-input");

  if (hangulInput) hangulInput.value = "";
  if (pronunciationInput) pronunciationInput.value = "";
  if (meaningInput) meaningInput.value = "";
  if (descriptionInput) descriptionInput.value = "";
  if (emojiOptions) emojiOptions.innerHTML = "";
  if (imageInput) imageInput.value = "";
}

// 한글에 해당하는 이모지 목록 생성
function generateEmojisForHangul(hangul) {
  if (!hangul) return [];

  // 특수 다의어 처리 - 먼저 확인
  // 단어가 여러 의미를 가질 수 있는 경우 모든 의미의 이모지를 합쳐서 제공
  if (hangul === "배") {
    console.log("다의어 처리: 배 (과일/선박/신체)");
    const combinedEmojis = [
      ...wordBasedEmojiMap["배_과일"].slice(0, 2),
      ...wordBasedEmojiMap["배_선박"].slice(0, 2),
      ...wordBasedEmojiMap["배_신체"].slice(0, 2),
    ];
    return combinedEmojis;
  }

  if (hangul === "밤") {
    console.log("다의어 처리: 밤 (시간/식품)");
    return [
      ...wordBasedEmojiMap["밤_시간"].slice(0, 3),
      ...wordBasedEmojiMap["밤_식품"].slice(0, 3),
    ];
  }

  if (hangul === "차") {
    console.log("다의어 처리: 차 (음료/교통)");
    return [
      ...wordBasedEmojiMap["차_음료"].slice(0, 3),
      ...wordBasedEmojiMap["차_교통"].slice(0, 3),
    ];
  }

  if (hangul === "다리") {
    console.log("다의어 처리: 다리 (신체/교량)");
    return [
      ...wordBasedEmojiMap["다리_신체"].slice(0, 3),
      ...wordBasedEmojiMap["다리_교량"].slice(0, 3),
    ];
  }

  if (hangul === "눈") {
    console.log("다의어 처리: 눈 (감각/날씨)");
    return [
      ...wordBasedEmojiMap["눈_감각"].slice(0, 3),
      ...wordBasedEmojiMap["눈_날씨"].slice(0, 3),
    ];
  }

  if (hangul === "말") {
    console.log("다의어 처리: 말 (동물/언어)");
    return [
      ...wordBasedEmojiMap["말_동물"].slice(0, 3),
      ...wordBasedEmojiMap["말_언어"].slice(0, 3),
    ];
  }

  if (hangul === "잎" || hangul === "입") {
    const key = hangul === "잎" ? "잎_식물" : "입_신체";
    console.log(`다의어 처리: ${hangul}`);
    return wordBasedEmojiMap[key];
  }

  // 1. 정확한 단어 매칭 확인
  if (wordBasedEmojiMap[hangul]) {
    console.log(`정확한 단어 매칭: ${hangul}`);
    return wordBasedEmojiMap[hangul];
  }

  // 2. 동의어 매핑 확인
  const synonym = synonymMap[hangul];
  if (synonym && wordBasedEmojiMap[synonym]) {
    console.log(`동의어 매핑: ${hangul} → ${synonym}`);
    return wordBasedEmojiMap[synonym];
  }

  // 3. 복합 단어 처리 (2글자 이상)
  if (hangul.length >= 2) {
    // 3.1 동사형 어미 패턴 확인
    const verbPatterns = [
      "하기",
      "하다",
      "하고",
      "하는",
      "하지",
      "하여",
      "해요",
    ];
    for (const pattern of verbPatterns) {
      if (hangul.endsWith(pattern)) {
        const root = hangul.slice(0, hangul.length - pattern.length);
        console.log("동사 어근:", root);
        // 동사 어근의 동의어 확인
        const normalizedRoot = synonymMap[root] || root;
        if (wordBasedEmojiMap[normalizedRoot]) {
          return wordBasedEmojiMap[normalizedRoot];
        }
      }
    }

    // 3.2 특수 복합 단어 처리 (예: 악수, 공부)
    // 첫 두 글자로 이루어진 복합어 검사
    const firstTwoChars = hangul.substring(0, 2);
    const normalizedTwoChars = synonymMap[firstTwoChars] || firstTwoChars;
    if (wordBasedEmojiMap[normalizedTwoChars]) {
      console.log("첫 두 글자 매칭:", normalizedTwoChars);
      return wordBasedEmojiMap[normalizedTwoChars];
    }

    // 3.3 단어 내 의미있는 부분 검색
    for (let i = 0; i < hangul.length - 1; i++) {
      for (let j = 2; j <= 3 && i + j <= hangul.length; j++) {
        const fragment = hangul.substring(i, i + j);
        const normalizedFragment = synonymMap[fragment] || fragment;
        if (wordBasedEmojiMap[normalizedFragment]) {
          console.log("의미 있는 부분 매칭:", normalizedFragment);
          return wordBasedEmojiMap[normalizedFragment];
        }
      }
    }

    // 3.4 두 글자 이상 단어의 특별 처리 - 첫 글자가 "고"인 경우 동물이나 음식 관련 이모지 반환
    if (hangul.startsWith("고") && !wordBasedEmojiMap[hangul]) {
      // 고래, 고기, 고구마 등이 없다면 일반적인 동물/음식 이모지 반환
      return ["🐄", "🐈", "🐕", "🦁", "🐯"]; // 동물 관련 이모지로 기본 제공
    }
  }

  // 4. 의미 기반 이모지 확인
  // 주요 카테고리별로 단어를 확인하고 의미 기반 이모지 반환
  for (const [category, emojis] of Object.entries(meaningBasedEmojis)) {
    // 카테고리명이 포함된 경우 해당 이모지 반환 (예: "동물원", "동물" 카테고리 매칭)
    if (hangul.includes(category)) {
      console.log(`카테고리 매칭: ${hangul} → ${category}`);
      return emojis;
    }

    // 카테고리별 특별 처리
    if (category === "동물" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "과일" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "채소" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "날씨" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "감정" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "교통" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "음악" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "시간" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "장소" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "색상" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "자연환경" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "학습" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "통신" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }

    if (category === "건강" && wordBasedEmojiMap[hangul]) {
      return wordBasedEmojiMap[hangul];
    }
  }

  // 5. 카테고리 내 특정 항목 검색 (이미 위에서 처리된 경우 중복될 수 있으나 안전장치로 추가)
  // 모든 이모지 맵을 검사하여 관련 항목 찾기
  for (const key in wordBasedEmojiMap) {
    // 입력된 단어가 다른 항목의 이모지 중에 포함되어 있는지 확인
    const emojis = wordBasedEmojiMap[key];
    for (const emoji of emojis) {
      if (hangul.includes(emoji)) {
        console.log(`이모지 연관 검색: ${hangul} → ${emoji} (${key})`);
        return wordBasedEmojiMap[key];
      }
    }
  }

  // 6. 등록되지 않은 단어 처리 - 일반적인 이모지 제공
  console.log("등록되지 않은 단어:", hangul);

  // 일반적인 이모지들 제공
  const generalEmojis = [
    // 다양한 카테고리의 이모지 제공
    "📝",
    "✏️",
    "🔤",
    "📚",
    "🎓", // 학습 관련
    "💬",
    "🗣️",
    "👂",
    "👀",
    "👄", // 소통 관련
    "👍",
    "👏",
    "🙌",
    "🫶",
    "❤️", // 긍정적 표현
    "🔍",
    "💡",
    "🧠",
    "💭",
    "❓", // 생각/질문 관련
    "🌈",
    "🌟",
    "🎵",
    "🎨",
    "🎭", // 예술/표현 관련
    "🚗",
    "🚂",
    "✈️",
    "🚢",
    "🚲", // 교통 관련 (추가)
    "🏠",
    "🏢",
    "🏫",
    "🏥",
    "🏦", // 건물 관련 (추가)
    "🍎",
    "🍚",
    "🍕",
    "🍦",
    "🍷", // 음식 관련 (추가)
  ];

  // 일반 이모지 중 랜덤하게 10개 선택하여 반환
  const randomEmojis = [];
  const totalEmojis = generalEmojis.length;
  const emojiCount = Math.min(10, totalEmojis);

  // 중복 없이 랜덤 선택
  const selectedIndices = new Set();
  while (selectedIndices.size < emojiCount) {
    const randomIndex = Math.floor(Math.random() * totalEmojis);
    selectedIndices.add(randomIndex);
  }

  // 선택된 이모지 배열 구성
  for (const index of selectedIndices) {
    randomEmojis.push(generalEmojis[index]);
  }

  return randomEmojis;
}
