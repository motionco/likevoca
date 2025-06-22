import { loadNavbar } from "../../components/js/navbar.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { showConceptModal } from "../../components/js/ai-concept-modal.js";
import { handleAIConceptRecommendation } from "../../utils/ai-concept-utils.js";
// 필터 공유 모듈 import
import {
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";
// 공통 번역 유틸리티 import
import {
  translateDomain,
  translateCategory,
  translateDomainCategory,
} from "../../utils/translation-utils.js";

// 로컬 환경 감지
const isLocalEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];
let displayedConcepts = [];
const CONCEPTS_PER_PAGE = 12;
let currentPage = 1;
let userLanguage = "ko"; // 기본값

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    meaning: "의미",
    examples: "예문",
    ai_generated: "AI 생성",
  },
  en: {
    meaning: "Meaning",
    examples: "Examples",
    ai_generated: "AI Generated",
  },
  ja: {
    meaning: "意味",
    examples: "例文",
    ai_generated: "AI生成",
  },
  zh: {
    meaning: "意思",
    examples: "例句",
    ai_generated: "AI生成",
  },
};

// 도메인 번역 매핑 (ai-concept-utils.js와 동일)
const domainTranslations = {
  daily: { ko: "일상생활", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
  food: {
    ko: "음식",
    en: "Food",
    ja: "食べ物",
    zh: "食物",
  },
  travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
  business: {
    ko: "비즈니스",
    en: "Business",
    ja: "ビジネス",
    zh: "商务",
  },
  education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  nature: {
    ko: "자연",
    en: "Nature",
    ja: "自然",
    zh: "自然",
  },
  technology: {
    ko: "기술",
    en: "Technology",
    ja: "技術",
    zh: "技术",
  },
  health: {
    ko: "건강",
    en: "Health",
    ja: "健康",
    zh: "健康",
  },
  sports: {
    ko: "스포츠",
    en: "Sports",
    ja: "スポーツ",
    zh: "体育",
  },
  entertainment: {
    ko: "엔터테인먼트",
    en: "Entertainment",
    ja: "エンターテインメント",
    zh: "娱乐",
  },
  culture: {
    ko: "문화",
    en: "Culture",
    ja: "文化",
    zh: "文化",
  },
  other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  // 호환성을 위한 추가 매핑
  academic: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  general: { ko: "일반", en: "General", ja: "一般", zh: "一般" },
};

// 카테고리 번역 매핑 (ai-concept-utils.js와 동일)
const categoryTranslations = {
  // Daily
  household: {
    ko: "가정용품",
    en: "Household",
    ja: "家庭用品",
    zh: "家庭用品",
  },
  family: { ko: "가족", en: "Family", ja: "家族", zh: "家庭" },
  routine: {
    ko: "일상 루틴",
    en: "Routine",
    ja: "日常ルーチン",
    zh: "日常例行",
  },
  clothing: { ko: "의류", en: "Clothing", ja: "衣類", zh: "服装" },
  furniture: { ko: "가구", en: "Furniture", ja: "家具", zh: "家具" },
  shopping: { ko: "쇼핑", en: "Shopping", ja: "ショッピング", zh: "购物" },
  communication: {
    ko: "의사소통",
    en: "Communication",
    ja: "コミュニケーション",
    zh: "交流",
  },
  personal_care: {
    ko: "개인관리",
    en: "Personal Care",
    ja: "個人ケア",
    zh: "个人护理",
  },
  leisure: { ko: "여가", en: "Leisure", ja: "レジャー", zh: "休闲" },
  relationships: {
    ko: "인간관계",
    en: "Relationships",
    ja: "人間関係",
    zh: "人际关系",
  },
  emotions: { ko: "감정", en: "Emotions", ja: "感情", zh: "情感" },
  time: { ko: "시간", en: "Time", ja: "時間", zh: "时间" },
  weather_talk: {
    ko: "날씨 대화",
    en: "Weather Talk",
    ja: "天気の話",
    zh: "天气谈话",
  },

  // Food
  fruit: { ko: "과일", en: "Fruit", ja: "果物", zh: "水果" },
  vegetable: { ko: "채소", en: "Vegetable", ja: "野菜", zh: "蔬菜" },
  meat: { ko: "고기", en: "Meat", ja: "肉", zh: "肉类" },
  drink: { ko: "음료", en: "Drink", ja: "飲み物", zh: "饮料" },
  snack: { ko: "간식", en: "Snack", ja: "スナック", zh: "零食" },
  grain: { ko: "곡물", en: "Grain", ja: "穀物", zh: "谷物" },
  seafood: { ko: "해산물", en: "Seafood", ja: "海産物", zh: "海鲜" },
  dairy: { ko: "유제품", en: "Dairy", ja: "乳製品", zh: "乳制品" },
  cooking: { ko: "요리", en: "Cooking", ja: "料理", zh: "烹饪" },
  dining: { ko: "식사", en: "Dining", ja: "食事", zh: "用餐" },
  restaurant: { ko: "음식점", en: "Restaurant", ja: "レストラン", zh: "餐厅" },
  kitchen_utensils: {
    ko: "주방용품",
    en: "Kitchen Utensils",
    ja: "キッチン用具",
    zh: "厨房用具",
  },
  spices: { ko: "향신료", en: "Spices", ja: "スパイス", zh: "香料" },
  dessert: { ko: "디저트", en: "Dessert", ja: "デザート", zh: "甜点" },

  // Travel
  transportation: { ko: "교통", en: "Transportation", ja: "交通", zh: "交通" },
  accommodation: { ko: "숙박", en: "Accommodation", ja: "宿泊", zh: "住宿" },
  tourist_attraction: {
    ko: "관광지",
    en: "Tourist Attraction",
    ja: "観光地",
    zh: "旅游景点",
  },
  luggage: { ko: "짐", en: "Luggage", ja: "荷物", zh: "行李" },
  direction: { ko: "길찾기", en: "Direction", ja: "道案内", zh: "方向" },
  booking: { ko: "예약", en: "Booking", ja: "予約", zh: "预订" },
  currency: { ko: "화폐", en: "Currency", ja: "通貨", zh: "货币" },
  emergency: {
    ko: "응급상황",
    en: "Emergency",
    ja: "緊急事態",
    zh: "紧急情况",
  },
  documents: { ko: "서류", en: "Documents", ja: "書類", zh: "文件" },
  sightseeing: { ko: "관광", en: "Sightseeing", ja: "観光", zh: "观光" },
  local_food: {
    ko: "현지음식",
    en: "Local Food",
    ja: "現地料理",
    zh: "当地美食",
  },
  souvenir: { ko: "기념품", en: "Souvenir", ja: "お土産", zh: "纪念品" },

  // Business
  meeting: { ko: "회의", en: "Meeting", ja: "会議", zh: "会议" },
  finance: { ko: "금융", en: "Finance", ja: "金融", zh: "金融" },
  marketing: {
    ko: "마케팅",
    en: "Marketing",
    ja: "マーケティング",
    zh: "营销",
  },
  office: { ko: "사무실", en: "Office", ja: "オフィス", zh: "办公室" },
  project: { ko: "프로젝트", en: "Project", ja: "プロジェクト", zh: "项目" },
  negotiation: { ko: "협상", en: "Negotiation", ja: "交渉", zh: "谈判" },
  presentation: {
    ko: "발표",
    en: "Presentation",
    ja: "プレゼンテーション",
    zh: "演示",
  },
  teamwork: {
    ko: "팀워크",
    en: "Teamwork",
    ja: "チームワーク",
    zh: "团队合作",
  },
  leadership: {
    ko: "리더십",
    en: "Leadership",
    ja: "リーダーシップ",
    zh: "领导力",
  },
  networking: {
    ko: "네트워킹",
    en: "Networking",
    ja: "ネットワーキング",
    zh: "人际网络",
  },
  sales: { ko: "영업", en: "Sales", ja: "営業", zh: "销售" },
  contract: { ko: "계약", en: "Contract", ja: "契約", zh: "合同" },
  startup: {
    ko: "스타트업",
    en: "Startup",
    ja: "スタートアップ",
    zh: "初创企业",
  },

  // Education
  teaching: { ko: "교수법", en: "Teaching", ja: "教授法", zh: "教学" },
  learning: { ko: "학습", en: "Learning", ja: "学習", zh: "学习" },
  classroom: { ko: "교실", en: "Classroom", ja: "教室", zh: "教室" },
  curriculum: {
    ko: "교육과정",
    en: "Curriculum",
    ja: "カリキュラム",
    zh: "课程",
  },
  assessment: { ko: "평가", en: "Assessment", ja: "評価", zh: "评估" },
  pedagogy: { ko: "교육학", en: "Pedagogy", ja: "教育学", zh: "教育学" },
  skill_development: {
    ko: "기술개발",
    en: "Skill Development",
    ja: "スキル開発",
    zh: "技能发展",
  },
  online_learning: {
    ko: "온라인학습",
    en: "Online Learning",
    ja: "オンライン学習",
    zh: "在线学习",
  },
  training: { ko: "훈련", en: "Training", ja: "トレーニング", zh: "培训" },
  certification: { ko: "자격증", en: "Certification", ja: "資格", zh: "认证" },
  educational_technology: {
    ko: "교육기술",
    en: "Educational Technology",
    ja: "教育技術",
    zh: "教育技术",
  },
  student_life: {
    ko: "학생생활",
    en: "Student Life",
    ja: "学生生活",
    zh: "学生生活",
  },
  graduation: { ko: "졸업", en: "Graduation", ja: "卒業", zh: "毕业" },
  examination: { ko: "시험", en: "Examination", ja: "試験", zh: "考试" },
  university: { ko: "대학교", en: "University", ja: "大学", zh: "大学" },
  library: { ko: "도서관", en: "Library", ja: "図書館", zh: "图书馆" },

  // Nature
  animal: { ko: "동물", en: "Animal", ja: "動物", zh: "动物" },
  plant: { ko: "식물", en: "Plant", ja: "植物", zh: "植物" },
  weather: { ko: "날씨", en: "Weather", ja: "天気", zh: "天气" },
  geography: { ko: "지리", en: "Geography", ja: "地理", zh: "地理" },
  environment: { ko: "환경", en: "Environment", ja: "環境", zh: "环境" },
  ecosystem: { ko: "생태계", en: "Ecosystem", ja: "生態系", zh: "生态系统" },
  conservation: { ko: "보존", en: "Conservation", ja: "保全", zh: "保护" },
  climate: { ko: "기후", en: "Climate", ja: "気候", zh: "气候" },
  natural_disaster: {
    ko: "자연재해",
    en: "Natural Disaster",
    ja: "自然災害",
    zh: "自然灾害",
  },
  landscape: { ko: "풍경", en: "Landscape", ja: "風景", zh: "风景" },
  marine_life: {
    ko: "해양생물",
    en: "Marine Life",
    ja: "海洋生物",
    zh: "海洋生物",
  },
  forest: { ko: "숲", en: "Forest", ja: "森", zh: "森林" },
  mountain: { ko: "산", en: "Mountain", ja: "山", zh: "山" },

  // Technology
  computer: {
    ko: "컴퓨터",
    en: "Computer",
    ja: "コンピューター",
    zh: "计算机",
  },
  software: {
    ko: "소프트웨어",
    en: "Software",
    ja: "ソフトウェア",
    zh: "软件",
  },
  internet: {
    ko: "인터넷",
    en: "Internet",
    ja: "インターネット",
    zh: "互联网",
  },
  mobile: { ko: "모바일", en: "Mobile", ja: "モバイル", zh: "移动设备" },
  ai: { ko: "인공지능", en: "AI", ja: "AI", zh: "人工智能" },
  programming: {
    ko: "프로그래밍",
    en: "Programming",
    ja: "プログラミング",
    zh: "编程",
  },
  cybersecurity: {
    ko: "사이버보안",
    en: "Cybersecurity",
    ja: "サイバーセキュリティ",
    zh: "网络安全",
  },
  database: {
    ko: "데이터베이스",
    en: "Database",
    ja: "データベース",
    zh: "数据库",
  },
  robotics: {
    ko: "로봇공학",
    en: "Robotics",
    ja: "ロボット工学",
    zh: "机器人学",
  },
  blockchain: {
    ko: "블록체인",
    en: "Blockchain",
    ja: "ブロックチェーン",
    zh: "区块链",
  },
  cloud: { ko: "클라우드", en: "Cloud", ja: "クラウド", zh: "云计算" },
  social_media: {
    ko: "소셜미디어",
    en: "Social Media",
    ja: "ソーシャルメディア",
    zh: "社交媒体",
  },
  gaming: { ko: "게임", en: "Gaming", ja: "ゲーム", zh: "游戏" },
  innovation: {
    ko: "혁신",
    en: "Innovation",
    ja: "イノベーション",
    zh: "创新",
  },

  // Health
  exercise: { ko: "운동", en: "Exercise", ja: "運動", zh: "运动" },
  medicine: { ko: "의학", en: "Medicine", ja: "医学", zh: "医学" },
  nutrition: { ko: "영양", en: "Nutrition", ja: "栄養", zh: "营养" },
  mental_health: {
    ko: "정신건강",
    en: "Mental Health",
    ja: "メンタルヘルス",
    zh: "心理健康",
  },
  hospital: { ko: "병원", en: "Hospital", ja: "病院", zh: "医院" },
  fitness: { ko: "피트니스", en: "Fitness", ja: "フィットネス", zh: "健身" },
  wellness: { ko: "웰빙", en: "Wellness", ja: "ウェルネス", zh: "健康" },
  therapy: { ko: "치료", en: "Therapy", ja: "治療", zh: "治疗" },
  prevention: { ko: "예방", en: "Prevention", ja: "予防", zh: "预防" },
  symptoms: { ko: "증상", en: "Symptoms", ja: "症状", zh: "症状" },
  treatment: { ko: "치료법", en: "Treatment", ja: "治療法", zh: "治疗方法" },
  pharmacy: { ko: "약국", en: "Pharmacy", ja: "薬局", zh: "药房" },
  rehabilitation: {
    ko: "재활",
    en: "Rehabilitation",
    ja: "リハビリテーション",
    zh: "康复",
  },
  medical_equipment: {
    ko: "의료기기",
    en: "Medical Equipment",
    ja: "医療機器",
    zh: "医疗设备",
  },

  // Sports
  football: { ko: "축구", en: "Football", ja: "サッカー", zh: "足球" },
  basketball: {
    ko: "농구",
    en: "Basketball",
    ja: "バスケットボール",
    zh: "篮球",
  },
  swimming: { ko: "수영", en: "Swimming", ja: "水泳", zh: "游泳" },
  running: { ko: "달리기", en: "Running", ja: "ランニング", zh: "跑步" },
  equipment: { ko: "장비", en: "Equipment", ja: "機器", zh: "设备" },
  olympics: { ko: "올림픽", en: "Olympics", ja: "オリンピック", zh: "奥运会" },
  tennis: { ko: "테니스", en: "Tennis", ja: "テニス", zh: "网球" },
  baseball: { ko: "야구", en: "Baseball", ja: "野球", zh: "棒球" },
  golf: { ko: "골프", en: "Golf", ja: "ゴルフ", zh: "高尔夫" },
  martial_arts: { ko: "무술", en: "Martial Arts", ja: "武術", zh: "武术" },
  team_sports: {
    ko: "팀스포츠",
    en: "Team Sports",
    ja: "チームスポーツ",
    zh: "团队运动",
  },
  individual_sports: {
    ko: "개인스포츠",
    en: "Individual Sports",
    ja: "個人スポーツ",
    zh: "个人运动",
  },
  coaching: { ko: "코칭", en: "Coaching", ja: "コーチング", zh: "教练" },
  competition: { ko: "경쟁", en: "Competition", ja: "競争", zh: "竞争" },

  // Entertainment
  movie: { ko: "영화", en: "Movie", ja: "映画", zh: "电影" },
  music: { ko: "음악", en: "Music", ja: "音楽", zh: "音乐" },
  game: { ko: "게임", en: "Game", ja: "ゲーム", zh: "游戏" },
  book: { ko: "책", en: "Book", ja: "本", zh: "书籍" },
  art: { ko: "예술", en: "Art", ja: "芸術", zh: "艺术" },
  theater: { ko: "연극", en: "Theater", ja: "演劇", zh: "戏剧" },
  concert: { ko: "콘서트", en: "Concert", ja: "コンサート", zh: "音乐会" },
  festival: { ko: "축제", en: "Festival", ja: "祭り", zh: "节庆" },
  celebrity: { ko: "연예인", en: "Celebrity", ja: "有名人", zh: "名人" },
  tv_show: { ko: "TV쇼", en: "TV Show", ja: "テレビ番組", zh: "电视节目" },
  comedy: { ko: "코미디", en: "Comedy", ja: "コメディ", zh: "喜剧" },
  drama: { ko: "드라마", en: "Drama", ja: "ドラマ", zh: "戏剧" },
  animation: {
    ko: "애니메이션",
    en: "Animation",
    ja: "アニメーション",
    zh: "动画",
  },
  photography: { ko: "사진", en: "Photography", ja: "写真", zh: "摄影" },

  // Culture
  tradition: { ko: "전통", en: "Tradition", ja: "伝統", zh: "传统" },
  customs: { ko: "관습", en: "Customs", ja: "習慣", zh: "习俗" },
  language: { ko: "언어", en: "Language", ja: "言語", zh: "语言" },
  religion: { ko: "종교", en: "Religion", ja: "宗教", zh: "宗教" },
  heritage: { ko: "유산", en: "Heritage", ja: "遺産", zh: "遗产" },
  ceremony: { ko: "의식", en: "Ceremony", ja: "儀式", zh: "仪式" },
  ritual: { ko: "의례", en: "Ritual", ja: "儀礼", zh: "仪式" },
  folklore: { ko: "민속", en: "Folklore", ja: "民俗", zh: "民俗" },
  mythology: { ko: "신화", en: "Mythology", ja: "神話", zh: "神话" },
  arts_crafts: { ko: "공예", en: "Arts & Crafts", ja: "工芸", zh: "工艺" },
  etiquette: { ko: "예절", en: "Etiquette", ja: "エチケット", zh: "礼仪" },
  national_identity: {
    ko: "국가정체성",
    en: "National Identity",
    ja: "国民性",
    zh: "国家认同",
  },

  // Other
  hobbies: { ko: "취미", en: "Hobbies", ja: "趣味", zh: "爱好" },
  finance_personal: {
    ko: "개인금융",
    en: "Personal Finance",
    ja: "個人金融",
    zh: "个人理财",
  },
  legal: { ko: "법률", en: "Legal", ja: "法律", zh: "法律" },
  government: { ko: "정부", en: "Government", ja: "政府", zh: "政府" },
  politics: { ko: "정치", en: "Politics", ja: "政治", zh: "政治" },
  media: { ko: "미디어", en: "Media", ja: "メディア", zh: "媒体" },
  community: {
    ko: "커뮤니티",
    en: "Community",
    ja: "コミュニティ",
    zh: "社区",
  },
  volunteering: {
    ko: "자원봉사",
    en: "Volunteering",
    ja: "ボランティア",
    zh: "志愿服务",
  },
  charity: { ko: "자선", en: "Charity", ja: "慈善", zh: "慈善" },
  social_issues: {
    ko: "사회문제",
    en: "Social Issues",
    ja: "社会問題",
    zh: "社会问题",
  },
  philosophy_life: {
    ko: "인생철학",
    en: "Life Philosophy",
    ja: "人生哲学",
    zh: "人生哲学",
  },
  spirituality: {
    ko: "영성",
    en: "Spirituality",
    ja: "スピリチュアリティ",
    zh: "精神性",
  },
  creativity: { ko: "창의성", en: "Creativity", ja: "創造性", zh: "创造力" },
  science: { ko: "과학", en: "Science", ja: "科学", zh: "科学" },
  literature: { ko: "문학", en: "Literature", ja: "文学", zh: "文学" },
  history: { ko: "역사", en: "History", ja: "歴史", zh: "历史" },
  mathematics: { ko: "수학", en: "Mathematics", ja: "数学", zh: "数学" },
  research: { ko: "연구", en: "Research", ja: "研究", zh: "研究" },
  philosophy: { ko: "철학", en: "Philosophy", ja: "哲学", zh: "哲学" },
  psychology: { ko: "심리학", en: "Psychology", ja: "心理学", zh: "心理学" },
  sociology: { ko: "사회학", en: "Sociology", ja: "社会学", zh: "社会学" },
  linguistics: { ko: "언어학", en: "Linguistics", ja: "言語学", zh: "语言学" },
  thesis: { ko: "논문", en: "Thesis", ja: "論文", zh: "论文" },

  // 호환성을 위한 추가 매핑
  other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  subject: { ko: "과목", en: "Subject", ja: "科目", zh: "学科" },
  greeting: { ko: "인사", en: "Greeting", ja: "挨拶", zh: "问候" },
  emotion: { ko: "감정", en: "Emotion", ja: "感情", zh: "情绪" },
};

// 다국어 번역 텍스트 가져오기 함수 (공통 모듈 사용)
function getTranslatedText(key) {
  // 1. 페이지 번역에서 먼저 확인
  if (pageTranslations[userLanguage] && pageTranslations[userLanguage][key]) {
    return pageTranslations[userLanguage][key];
  }

  // 2. 도메인 번역에서 확인 (공통 모듈 사용)
  const domainTranslation = translateDomain(key, userLanguage);
  if (domainTranslation !== key) {
    return domainTranslation;
  }

  // 3. 카테고리 번역에서 확인 (공통 모듈 사용)
  const categoryTranslation = translateCategory(key, userLanguage);
  if (categoryTranslation !== key) {
    return categoryTranslation;
  }

  // 4. 영어 폴백
  if (pageTranslations.en && pageTranslations.en[key]) {
    return pageTranslations.en[key];
  }

  const domainTranslationEn = translateDomain(key, "en");
  if (domainTranslationEn !== key) {
    return domainTranslationEn;
  }

  const categoryTranslationEn = translateCategory(key, "en");
  if (categoryTranslationEn !== key) {
    return categoryTranslationEn;
  }

  // 5. 원본 키 반환
  return key;
}

// 사용자 언어 초기화
async function initializeUserLanguage() {
  try {
    // getActiveLanguage가 정의되어 있는지 확인
    if (typeof getActiveLanguage === "function") {
      userLanguage = await getActiveLanguage();
    } else {
      console.warn(
        "getActiveLanguage 함수를 찾을 수 없습니다. 기본값을 사용합니다."
      );
      userLanguage = "ko";
    }
  } catch (error) {
    console.error("언어 설정 로드 실패:", error);
    userLanguage = "ko"; // 기본값
  }
}

// 전역 함수로 내보내기
window.showConceptModal = showConceptModal;

// 모달 로드 함수
async function loadConceptViewModal() {
  try {
    const response = await fetch("../components/concept-view-modal.html");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // modal-container가 없으면 생성
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-container";
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = html;

    // 로드 후 필수 요소들이 존재하는지 확인
    const requiredElements = [
      "concept-view-modal",
      "concept-view-emoji",
      "concept-view-title",
      "concept-view-pronunciation",
      "language-tabs",
      "language-content",
      "examples-container",
    ];

    const missingElements = requiredElements.filter(
      (id) => !document.getElementById(id)
    );
    if (missingElements.length > 0) {
      console.warn("필수 모달 요소들이 누락됨:", missingElements);
    } else {
    }
  } catch (error) {
    console.error("개념 보기 모달 로드 실패:", error);
  }
}

// AI 개념 편집 모달 로드 (AI 전용 JS 사용)
async function loadEditConceptModal() {
  try {
    const response = await fetch("../components/ai-edit-concept-modal.html");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // modal-container에 편집 모달 추가
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-container";
      document.body.appendChild(modalContainer);
    }

    // 기존 내용에 편집 모달 추가
    modalContainer.innerHTML += html;

    // AI 전용 편집 모달 스크립트 로드
    const editModalScript = document.createElement("script");
    editModalScript.type = "module";
    editModalScript.src = "../components/js/ai-edit-concept-modal.js";
    editModalScript.onload = () => {};
    editModalScript.onerror = (error) => {
      console.error("❌ AI 전용 개념 편집 모달 스크립트 로드 실패:", error);
    };
    document.head.appendChild(editModalScript);
  } catch (error) {
    console.error("AI 개념 편집 모달 로드 실패:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 사용자 언어 설정 초기화 (실패해도 계속 진행)
    try {
      await initializeUserLanguage();
    } catch (error) {
      console.error("언어 초기화 실패, 기본값 사용:", error);
      userLanguage = "ko";
    }

    await loadNavbar();

    // 모달들 직접 로드
    await loadConceptViewModal();
    await loadEditConceptModal();

    // 로컬 환경인지 확인
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

    initializeEventListeners();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await initializePage();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류:", error);
  }
});

function initializeEventListeners() {
  // AI 개념 추천 버튼
  const aiAddBtn = document.getElementById("ai-add-concept");
  if (aiAddBtn) {
    aiAddBtn.addEventListener("click", () => {
      if (currentUser) {
        handleAIConceptRecommendation(currentUser, db);
      }
    });
  }

  // 언어 전환 버튼 (공유 모듈의 swapLanguages 사용)
  const swapLanguagesBtn = document.getElementById("swap-languages");
  if (swapLanguagesBtn) {
    swapLanguagesBtn.addEventListener("click", () => {
      filterManager.swapLanguages();
      applyFiltersAndSort();
    });
  }

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    applyFiltersAndSort();
  });

  // 더 보기 버튼
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreConcepts);
  }

  // 언어 변경 이벤트 리스너 추가
  document.addEventListener("languageChanged", async (event) => {
    // 사용자 언어 설정 업데이트 (실패해도 계속 진행)
    try {
      await initializeUserLanguage();
    } catch (error) {
      console.error("언어 변경 시 초기화 실패:", error);
      userLanguage = "ko";
    }
    // 카드 재렌더링
    applyFiltersAndSort();
  });

  // AI 개념 수정 완료 이벤트 리스너 추가
  document.addEventListener("concept-saved", async (event) => {
    try {
      // AI 개념 목록 다시 로드
      await loadConcepts();
      // 필터 및 정렬 다시 적용
      applyFiltersAndSort();
    } catch (error) {
      console.error("❌ AI 개념 목록 업데이트 실패:", error);
    }
  });
}

async function initializePage() {
  try {
    await loadConcepts();
    await updateUsageDisplay();
    applyFiltersAndSort();
  } catch (error) {
    console.error("페이지 초기화 중 오류:", error);
  }
}

async function loadConcepts() {
  try {
    // ai-recommend 컬렉션에서 사용자의 AI 개념 가져오기 (분리된 컬렉션 구조)
    allConcepts = await conceptUtils.getUserAIConcepts(currentUser.email);

    updateConceptCount();
  } catch (error) {
    console.error("❌ AI 개념 로드 중 오류:", error);
    allConcepts = [];
  }
}

function updateConceptCount() {
  const countElement = document.getElementById("filtered-count");
  if (countElement) {
    countElement.textContent = allConcepts.length;
  }
}

async function updateUsageDisplay() {
  try {
    // 기존 users 컬렉션의 사용량 관리 사용
    const usage = await conceptUtils.getUsage(currentUser.uid);
    const usageText = document.getElementById("ai-usage-text");
    const usageBar = document.getElementById("ai-usage-bar");

    if (usageText && usageBar) {
      const aiUsed = usage.aiUsed || 0;
      const aiLimit = usage.aiLimit || 100;
      const percentage = Math.min((aiUsed / aiLimit) * 100, 100);

      usageText.textContent = `${aiUsed}/${aiLimit}`;
      usageBar.style.width = `${percentage}%`;

      // 색상 업데이트
      if (percentage >= 90) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-yellow-500");
        usageBar.classList.add("bg-red-500");
      } else if (percentage >= 70) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-red-500");
        usageBar.classList.add("bg-yellow-500");
      } else {
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  } catch (error) {
    console.error("AI 사용량 표시 업데이트 중 오류:", error);
  }
}

// 필터 관련 함수들은 공유 모듈로 대체됨

function applyFiltersAndSort() {
  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  // 필터된 개념 수 업데이트
  const filteredCountElement = document.getElementById("filtered-count");
  if (filteredCountElement) {
    filteredCountElement.textContent = filteredConcepts.length;
  }

  // 페이지 리셋 및 표시
  currentPage = 1;
  displayedConcepts = [];
  loadMoreConcepts();
}

function loadMoreConcepts() {
  const startIndex = (currentPage - 1) * CONCEPTS_PER_PAGE;
  const endIndex = startIndex + CONCEPTS_PER_PAGE;
  const newConcepts = filteredConcepts.slice(startIndex, endIndex);

  displayedConcepts = [...displayedConcepts, ...newConcepts];
  renderConcepts();

  currentPage++;

  // 더 보기 버튼 표시/숨김
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    if (endIndex >= filteredConcepts.length) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }
  }
}

function renderConcepts() {
  const conceptList = document.getElementById("concept-list");
  if (!conceptList) return;

  const sourceLanguage =
    document.getElementById("source-language")?.value || "korean";
  const targetLanguage =
    document.getElementById("target-language")?.value || "english";

  if (currentPage === 1) {
    conceptList.innerHTML = "";
  }

  displayedConcepts
    .slice((currentPage - 2) * CONCEPTS_PER_PAGE)
    .forEach((concept) => {
      const conceptCard = createConceptCard(
        concept,
        sourceLanguage,
        targetLanguage
      );
      conceptList.appendChild(conceptCard);
    });
}

// 개념 카드 생성 함수
function createConceptCard(concept, sourceLanguage, targetLanguage) {
  const card = document.createElement("div");
  card.className =
    "bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 border border-gray-200 cursor-pointer word-card";

  const sourceExpr = concept.expressions?.[sourceLanguage] || {};
  const targetExpr = concept.expressions?.[targetLanguage] || {};

  // 새로운 구조에서 이모지와 정보 가져오기
  const emoji =
    concept.concept_info?.unicode_emoji || concept.concept_info?.emoji || "📝";
  const category = concept.concept_info?.category || "기타";
  const domain = concept.concept_info?.domain || "";
  const colorTheme = concept.concept_info?.color_theme || "#9C27B0";

  // 예문 찾기 (다국어 단어장과 동일한 구조)
  let example = null;

  // 1. 대표 예문 확인 (다국어 단어장 구조)
  if (concept.representative_example?.translations) {
    example = {
      source: concept.representative_example.translations[sourceLanguage] || "",
      target: concept.representative_example.translations[targetLanguage] || "",
    };
  }
  // 2. 기존 구조 호환성 (분리된 컬렉션 구조)
  else if (concept.representative_example) {
    example = {
      source: concept.representative_example[sourceLanguage] || "",
      target: concept.representative_example[targetLanguage] || "",
    };
  }
  // 3. 추가 예문들 확인
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
  }

  // 날짜 포맷팅 개선
  let formattedDate = "";
  try {
    const dateValue = concept.created_at || concept.createdAt;
    if (dateValue) {
      let date;
      if (dateValue.toDate && typeof dateValue.toDate === "function") {
        // Firestore Timestamp 객체인 경우
        date = dateValue.toDate();
      } else if (dateValue.seconds) {
        // Firestore Timestamp 형태의 객체인 경우
        date = new Date(dateValue.seconds * 1000);
      } else {
        // 일반 Date 객체나 문자열인 경우
        date = new Date(dateValue);
      }

      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    }
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    formattedDate = "";
  }

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4" style="border-left: 4px solid ${colorTheme}">
      <div class="flex items-center space-x-3 pl-3">
        <span class="text-3xl">${emoji}</span>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            ${targetExpr.word || "N/A"}
          </h3>
          <p class="text-sm text-gray-500">${
            targetExpr.pronunciation || targetExpr.romanization || ""
          }</p>
        </div>
      </div>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        ${translateDomainCategory(domain, category, userLanguage)}
      </span>
    </div>
    
    <div class="border-t border-gray-200 pt-3 mt-3">
      <div class="flex items-center">
        <span class="font-medium">${sourceExpr.word || "N/A"}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${targetExpr.definition || ""}</p>
    </div>
    
    ${
      example && (example.source || example.target)
        ? `
    <div class="border-t border-gray-200 pt-3 mt-3">
      <p class="text-sm text-gray-700 font-medium">${example.target}</p>
      <p class="text-sm text-gray-500 italic">${example.source}</p>
    </div>
    `
        : ""
    }
    
    <div class="flex justify-between text-xs text-gray-500 mt-3">
      <span class="flex items-center">
        <i class="fas fa-robot mr-1 text-blue-500"></i> ${getTranslatedText(
          "ai_generated"
        )}
      </span>
      <span class="flex items-center">
        <i class="fas fa-clock mr-1"></i> ${formattedDate}
      </span>
    </div>
  `;

  card.addEventListener("click", () => {
    const sourceLanguage =
      document.getElementById("source-language")?.value || "korean";
    const targetLanguage =
      document.getElementById("target-language")?.value || "english";
    showConceptModal(concept, sourceLanguage, targetLanguage);
  });

  return card;
}

// 디바운스 함수
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 언어 전환 함수는 공유 모듈로 대체됨
