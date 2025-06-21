import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import { initialize as initializeConceptModal } from "../../components/js/add-concept-modal.js";
import { initialize as initializeBulkImportModal } from "../../components/js/bulk-import-modal.js";
import {
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";
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

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

/*
// 도메인 번역 매핑 (임시 - 호환성을 위해 유지) - 중복 선언으로 주석 처리
const domainTranslations = {
  daily: { ko: "일상생활", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
  food: {
    ko: "음식/요리",
    en: "Food/Cooking",
    ja: "食べ物/料理",
    zh: "食物/烹饪",
  },
  travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
  business: {
    ko: "비즈니스/업무",
    en: "Business/Work",
    ja: "ビジネス/業務",
    zh: "商务/工作",
  },
  education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  nature: {
    ko: "자연/환경",
    en: "Nature/Environment",
    ja: "自然/環境",
    zh: "自然/环境",
  },
  technology: {
    ko: "기술/IT",
    en: "Technology/IT",
    ja: "技術/IT",
    zh: "技术/IT",
  },
  health: {
    ko: "건강/의료",
    en: "Health/Medical",
    ja: "健康/医療",
    zh: "健康/医疗",
  },
  sports: {
    ko: "스포츠/운동",
    en: "Sports/Exercise",
    ja: "スポーツ/運動",
    zh: "体育/运动",
  },
  entertainment: {
    ko: "엔터테인먼트",
    en: "Entertainment",
    ja: "エンターテインメント",
    zh: "娱乐",
  },
  culture: {
    ko: "문화/전통",
    en: "Culture/Tradition",
    ja: "文化/伝統",
    zh: "文化/传统",
  },
  other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  // 호환성을 위한 추가 매핑
  academic: { ko: "교육", en: "Education", ja: "教育", zh: "教육" },
  general: { ko: "일반", en: "General", ja: "一般", zh: "一般" },
};

// 카테고리 번역 매핑 (ai-concept-utils.js와 동일) - 주요 카테고리만 포함
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
*/

// 페이지별 번역 키
const pageTranslations = {
  ko: {
    meaning: "뜻:",
    example: "예문:",
    examples: "예문",
    edit: "편집",
    delete: "삭제",
    error_title: "오류 발생!",
    error_message: "페이지를 불러오는 중 문제가 발생했습니다.",
    error_details: "자세한 내용:",
    login_required: "로그인이 필요합니다.",
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    examples: "Examples",
    edit: "Edit",
    delete: "Delete",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    examples: "例文",
    edit: "編集",
    delete: "削除",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    examples: "例句",
    edit: "编辑",
    delete: "删除",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
  },
};

// 도메인 번역 매핑 (ai-concept-utils.js와 동일)
const domainTranslations = {
  daily: { ko: "일상생활", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
  food: {
    ko: "음식/요리",
    en: "Food/Cooking",
    ja: "食べ物/料理",
    zh: "食物/烹饪",
  },
  travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
  business: {
    ko: "비즈니스/업무",
    en: "Business/Work",
    ja: "ビジネス/業務",
    zh: "商务/工作",
  },
  education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  nature: {
    ko: "자연/환경",
    en: "Nature/Environment",
    ja: "自然/環境",
    zh: "自然/环境",
  },
  technology: {
    ko: "기술/IT",
    en: "Technology/IT",
    ja: "技術/IT",
    zh: "技术/IT",
  },
  health: {
    ko: "건강/의료",
    en: "Health/Medical",
    ja: "健康/医療",
    zh: "健康/医疗",
  },
  sports: {
    ko: "스포츠/운동",
    en: "Sports/Exercise",
    ja: "スポーツ/運動",
    zh: "体育/运动",
  },
  entertainment: {
    ko: "엔터테인먼트",
    en: "Entertainment",
    ja: "エンターテインメント",
    zh: "娱乐",
  },
  culture: {
    ko: "문화/전통",
    en: "Culture/Tradition",
    ja: "文化/伝統",
    zh: "文化/传统",
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

// 문법 용어 번역 테이블
const grammarTranslations = {
  ko: {
    // 영어 문법 용어
    "simple present tense": "현재 시제",
    "present tense": "현재 시제",
    "simple past tense": "과거 시제",
    "past tense": "과거 시제",
    "simple future tense": "미래 시제",
    "future tense": "미래 시제",
    "present continuous": "현재 진행형",
    "past continuous": "과거 진행형",
    "future continuous": "미래 진행형",
    "present perfect": "현재 완료형",
    "past perfect": "과거 완료형",
    "future perfect": "미래 완료형",
    "present perfect continuous": "현재 완료 진행형",
    "past perfect continuous": "과거 완료 진행형",
    "future perfect continuous": "미래 완료 진행형",
    "modal verb": "조동사",
    "auxiliary verb": "조동사",
    "passive voice": "수동태",
    "active voice": "능동태",
    conditional: "조건문",
    subjunctive: "가정법",
    imperative: "명령문",
    gerund: "동명사",
    infinitive: "부정사",
    participle: "분사",
    "present participle": "현재분사",
    "past participle": "과거분사",
    comparative: "비교급",
    superlative: "최상급",
    "countable noun": "가산명사",
    "uncountable noun": "불가산명사",
    plural: "복수형",
    singular: "단수형",
    article: "관사",
    "definite article": "정관사",
    "indefinite article": "부정관사",
    preposition: "전치사",
    conjunction: "접속사",
    adverb: "부사",
    adjective: "형용사",
    pronoun: "대명사",
    "relative clause": "관계절",
    "subordinate clause": "종속절",
    "main clause": "주절",

    // 일본어 문법 용어
    hiragana: "히라가나",
    katakana: "가타카나",
    kanji: "한자",
    keigo: "경어",
    sonkeigo: "존경어",
    kenjougo: "겸양어",
    teineigo: "정중어",
    "masu form": "마스형",
    "te form": "테형",
    "potential form": "가능형",
    "causative form": "사역형",
    "passive form": "수동형",
    "volitional form": "의지형",
    "conditional form": "조건형",
    "imperative form": "명령형",
    "negative form": "부정형",
    "past tense": "과거형",
    "present tense": "현재형",
    particle: "조사",
    "wa particle": "는/은 조사",
    "ga particle": "가/이 조사",
    "wo particle": "를/을 조사",
    "ni particle": "에 조사",
    "de particle": "에서 조사",
    "to particle": "와/과 조사",

    // 중국어 문법 용어
    pinyin: "병음",
    tone: "성조",
    "first tone": "1성",
    "second tone": "2성",
    "third tone": "3성",
    "fourth tone": "4성",
    "neutral tone": "경성",
    "measure word": "양사",
    classifier: "양사",
    "sentence final particle": "문말사",
    "aspect marker": "상 표지",
    "perfective aspect": "완료상",
    "progressive aspect": "진행상",
    "experiential aspect": "경험상",
  },
  en: {
    // 기본적으로 영어는 그대로 유지
    "simple present tense": "simple present tense",
    "present tense": "present tense",
    "simple past tense": "simple past tense",
    "past tense": "past tense",
    // ... 나머지도 그대로
  },
  ja: {
    // 영어 문법 용어를 일본어로
    "simple present tense": "現在時制",
    "present tense": "現在時制",
    "simple past tense": "過去時制",
    "past tense": "過去時制",
    "simple future tense": "未来時制",
    "future tense": "未来時制",
    "present continuous": "現在進行形",
    "past continuous": "過去進行形",
    "future continuous": "未来進行形",
    "present perfect": "現在完了形",
    "past perfect": "過去完了形",
    "future perfect": "未来完了形",
    "modal verb": "助動詞",
    "auxiliary verb": "助動詞",
    "passive voice": "受動態",
    "active voice": "能動態",
    conditional: "条件文",
    subjunctive: "仮定法",
    imperative: "命令文",
    gerund: "動名詞",
    infinitive: "不定詞",
    participle: "分詞",
    "present participle": "現在分詞",
    "past participle": "過去分詞",
    comparative: "比較級",
    superlative: "最上級",
    "countable noun": "可算名詞",
    "uncountable noun": "不可算名詞",
    plural: "複数形",
    singular: "単数形",
    article: "冠詞",
    "definite article": "定冠詞",
    "indefinite article": "不定冠詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    adverb: "副詞",
    adjective: "形容詞",
    pronoun: "代名詞",

    // 일본어 문법 용어는 그대로
    hiragana: "ひらがな",
    katakana: "カタカナ",
    kanji: "漢字",
    keigo: "敬語",
    "masu form": "ます形",
    "te form": "て形",
    particle: "助詞",
  },
  zh: {
    // 영어 문법 용어를 중국어로
    "simple present tense": "一般现在时",
    "present tense": "现在时",
    "simple past tense": "一般过去时",
    "past tense": "过去时",
    "simple future tense": "一般将来时",
    "future tense": "将来时",
    "present continuous": "现在进行时",
    "past continuous": "过去进行时",
    "future continuous": "将来进行时",
    "present perfect": "现在完成时",
    "past perfect": "过去完成时",
    "future perfect": "将来完成时",
    "modal verb": "情态动词",
    "auxiliary verb": "助动词",
    "passive voice": "被动语态",
    "active voice": "主动语态",
    conditional: "条件句",
    subjunctive: "虚拟语气",
    imperative: "祈使句",
    gerund: "动名词",
    infinitive: "不定式",
    participle: "分词",
    "present participle": "现在分词",
    "past participle": "过去分词",
    comparative: "比较级",
    superlative: "最高级",
    "countable noun": "可数名词",
    "uncountable noun": "不可数名词",
    plural: "复数",
    singular: "单数",
    article: "冠词",
    "definite article": "定冠词",
    "indefinite article": "不定冠词",
    preposition: "介词",
    conjunction: "连词",
    adverb: "副词",
    adjective: "形容词",
    pronoun: "代词",

    // 중국어 문법 용어는 그대로
    pinyin: "拼音",
    tone: "声调",
    "measure word": "量词",
    classifier: "量词",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  // 최신 환경 언어 가져오기
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 1. 페이지 번역에서 먼저 확인
  if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
    return pageTranslations[currentLang][key];
  }

  // 2. 도메인 번역에서 확인
  if (domainTranslations[key] && domainTranslations[key][currentLang]) {
    return domainTranslations[key][currentLang];
  }

  // 3. 카테고리 번역에서 확인
  if (categoryTranslations[key] && categoryTranslations[key][currentLang]) {
    return categoryTranslations[key][currentLang];
  }

  // 4. 전역 번역 시스템 사용 (language-utils.js에서 로드)
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 5. 영어 폴백
  if (pageTranslations.en && pageTranslations.en[key]) {
    return pageTranslations.en[key];
  }

  if (domainTranslations[key] && domainTranslations[key].en) {
    return domainTranslations[key].en;
  }

  if (categoryTranslations[key] && categoryTranslations[key].en) {
    return categoryTranslations[key].en;
  }

  // 6. 원본 키 반환
  return key;
}

// 번역 함수들은 공통 모듈에서 import하여 사용
// translateDomain, translateCategory, translateDomainCategory 사용

// 문법 설명을 환경 언어로 번역하는 함수
function translateGrammarNote(grammarNote) {
  if (!grammarNote || !userLanguage) return grammarNote;

  const translations = grammarTranslations[userLanguage];
  if (!translations) return grammarNote;

  // 소문자로 변환해서 매칭 시도
  const lowerNote = grammarNote.toLowerCase();

  // 정확히 일치하는 번역이 있는지 확인
  if (translations[lowerNote]) {
    return translations[lowerNote];
  }

  // 부분 일치 시도 (더 긴 용어부터 확인)
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (lowerNote.includes(key)) {
      return grammarNote.replace(new RegExp(key, "gi"), translations[key]);
    }
  }

  // 번역이 없으면 원본 반환
  return grammarNote;
}

// 언어 이름 가져오기 (환경 설정 언어에 맞게)
function getLanguageName(langCode) {
  const languageNames = {
    ko: {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
    },
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
    },
  };

  return (
    languageNames[userLanguage]?.[langCode] ||
    languageNames.en[langCode] ||
    langCode
  );
}

// 개념 카드 생성 함수 (확장된 구조 지원 및 디버깅 개선)
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  // 새로운 구조와 기존 구조 모두 지원
  const sourceExpression = concept.expressions?.[sourceLanguage] || {};
  const targetExpression = concept.expressions?.[targetLanguage] || {};

  // 빈 표현인 경우 건너뛰기
  if (!sourceExpression.word || !targetExpression.word) {
    return "";
  }

  // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
  const conceptInfo = concept.concept_info || {
    domain: concept.domain || "기타",
    category: concept.category || "일반",
    unicode_emoji: concept.emoji || concept.unicode_emoji || "📝",
    color_theme: concept.color_theme || "#4B63AC",
  };

  // 색상 테마 가져오기 (안전한 fallback)
  const colorTheme =
    conceptInfo.color_theme || concept.color_theme || "#4B63AC";

  // 이모지 가져오기 (실제 데이터 구조에 맞게 우선순위 조정)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    concept.emoji ||
    concept.unicode_emoji ||
    "📝";

  // 예문 가져오기 (concepts 컬렉션의 대표 예문 사용)
  let example = null;

  // 1. representative_example 확인 (새 구조와 기존 구조 모두 지원)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 새로운 구조: 직접 언어별 텍스트
    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      example = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
      console.log("✅ 카드: 새로운 대표 예문 구조 사용");
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
      example = {
        source:
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "",
        target:
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "",
      };
      console.log("✅ 카드: 기존 대표 예문 구조 사용");
    }
  }
  // 2. featured_examples 확인 (기존 방식)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    }
  }
  // 3. core_examples 확인 (기존 방식 - 하위 호환성)
  else if (concept.core_examples && concept.core_examples.length > 0) {
    const firstExample = concept.core_examples[0];
    // 번역 구조 확인
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    } else {
      // 직접 언어 속성이 있는 경우
      example = {
        source: firstExample[sourceLanguage] || "",
        target: firstExample[targetLanguage] || "",
      };
    }
  }
  // 4. 기존 examples 확인 (하위 호환성)
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
  }

  // 개념 ID 생성 (document ID 우선 사용)
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.word}_${targetExpression.word}`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer concept-card"
      onclick="openConceptViewModal('${conceptId}')"
      style="border-left: 4px solid ${colorTheme}"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">${emoji}</span>
        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              ${targetExpression.word || "N/A"}
            </h3>
          <p class="text-sm text-gray-500">${
            targetExpression.pronunciation ||
            targetExpression.romanization ||
            ""
          }</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            class="bookmark-btn p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" 
            onclick="event.stopPropagation(); toggleBookmark('${conceptId}')"
            data-concept-id="${conceptId}"
            title="북마크"
          >
            <i class="fas fa-bookmark text-gray-400"></i>
          </button>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${translateDomainCategory(
            conceptInfo.domain,
            conceptInfo.category,
            userLanguage
          )}
        </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${sourceExpression.word || "N/A"}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          targetExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
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
          <i class="fas fa-language mr-1"></i> ${sourceLanguage} → ${targetLanguage}
        </span>
        <span class="flex items-center">
          <i class="fas fa-clock mr-1"></i> ${formatDate(
            concept.metadata?.created_at ||
              concept.created_at ||
              concept.timestamp
          )}
        </span>
      </div>
    </div>
  `;
}

// 언어 전환 함수
// 언어 순서 바꾸기 함수는 공유 모듈로 대체됨

// 날짜 포맷팅 함수
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 검색 및 필터링 함수 (공유 모듈 사용)
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  console.log("검색 및 필터링 시작:", {
    filters,
    totalConcepts: allConcepts.length,
  });

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  console.log("필터링 완료:", {
    filteredCount: filteredConcepts.length,
  });

  // 표시
  displayConceptList();
}

// 정렬 함수는 공유 모듈로 대체됨

// 개념 목록 표시 함수 (디버깅 개선)
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  if (!conceptList) {
    console.error("❌ concept-list 요소를 찾을 수 없습니다!");
    return;
  }

  // 표시할 개념 선택
  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  // 개념 수 업데이트
  if (conceptCount) {
    conceptCount.textContent = filteredConcepts.length;
  }

  if (conceptsToShow.length === 0) {
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        표시할 개념이 없습니다. 다른 언어 조합이나 필터를 시도해보세요.
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    return;
  }

  // 개념 카드 생성 및 표시
  const cardHTMLs = conceptsToShow
    .map((concept) => createConceptCard(concept))
    .filter((html) => html); // 빈 HTML 제거

  // HTML 삽입
  conceptList.innerHTML = cardHTMLs.join("");

  // 북마크 UI 업데이트
  updateBookmarkUI();

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }
}

// 더 보기 버튼 처리
function handleLoadMore() {
  displayCount += 12;
  displayConceptList();
}

// 모달 로드 함수
async function loadModals(modalPaths) {
  try {
    const responses = await Promise.all(modalPaths.map((path) => fetch(path)));
    const htmlContents = await Promise.all(
      responses.map((response) => response.text())
    );

    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
      modalContainer.innerHTML = htmlContents.join("");
    }
  } catch (error) {
    console.error("모달 로드 중 오류 발생:", error);
  }
}

// 사용량 UI 업데이트
async function updateUsageUI() {
  try {
    if (!currentUser) return;

    // 사용자 문서 가져오기
    const userRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const conceptCount = userData.conceptCount || 0;
    const maxConcepts = userData.maxConcepts || 100;

    // UI 업데이트
    const usageText = document.getElementById("concept-usage-text");
    const usageBar = document.getElementById("concept-usage-bar");

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
    }

    if (usageBar) {
      const usagePercentage = (conceptCount / maxConcepts) * 100;
      usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

      // 색상 업데이트
      if (usagePercentage >= 90) {
        usageBar.classList.remove("bg-[#4B63AC]");
        usageBar.classList.add("bg-red-500");
      } else if (usagePercentage >= 70) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-red-500");
        usageBar.classList.add("bg-yellow-500");
      } else {
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  } catch (error) {
    console.error("사용량 업데이트 중 오류 발생:", error);
  }
}

// 개념 데이터 가져오기 (ID 포함 및 디버깅 개선)
async function fetchAndDisplayConcepts() {
  try {
    if (!currentUser) return;

    // 분리된 컬렉션과 통합 컬렉션 모두에서 개념 가져오기
    allConcepts = [];
    const conceptsRef = collection(db, "concepts");

    // 모든 concepts 컬렉션 데이터 조회 (분리된 컬렉션과 기존 구조 모두 포함)
    console.log("📚 concepts 컬렉션에서 데이터 로드 시작...");

    try {
      // 전체 조회 후 필터링 (더 안전한 방식)
      const querySnapshot = await getDocs(conceptsRef);
      console.log(`📊 concepts 컬렉션에서 ${querySnapshot.size}개 문서 발견`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외하고 모든 개념 포함 (분리된 컬렉션과 기존 구조 모두)
        if (!data.isAIGenerated) {
          console.log(`✅ 개념 추가: ${doc.id}`, {
            hasMetadata: !!data.metadata,
            hasCreatedAt: !!data.created_at,
            hasExpressions: !!data.expressions,
            expressionKeys: Object.keys(data.expressions || {}),
          });
          allConcepts.push(data);
        } else {
          console.log(`⏭️ AI 생성 개념 제외: ${doc.id}`);
        }
      });

      console.log(`📋 총 로드된 개념 수: ${allConcepts.length}개`);
    } catch (queryError) {
      console.error("concepts 컬렉션 조회 실패:", queryError);
      allConcepts = [];
    }

    // JavaScript에서 정렬 (분리된 컬렉션과 통합 컬렉션 모두 지원)
    allConcepts.sort((a, b) => {
      const getTime = (concept) => {
        // 분리된 컬렉션: metadata.created_at 우선 확인
        if (concept.metadata?.created_at) {
          return concept.metadata.created_at.toDate
            ? concept.metadata.created_at.toDate().getTime()
            : new Date(concept.metadata.created_at).getTime();
        }
        // 통합 컬렉션: 최상위 레벨 created_at 확인
        if (concept.created_at) {
          return concept.created_at.toDate
            ? concept.created_at.toDate().getTime()
            : new Date(concept.created_at).getTime();
        }
        // concept_info.created_at 확인
        if (concept.concept_info?.created_at) {
          return concept.concept_info.created_at.toDate
            ? concept.concept_info.created_at.toDate().getTime()
            : new Date(concept.concept_info.created_at).getTime();
        }
        // timestamp 확인 (더 오래된 데이터)
        if (concept.timestamp) {
          return concept.timestamp.toDate
            ? concept.timestamp.toDate().getTime()
            : new Date(concept.timestamp).getTime();
        }
        // 시간 정보가 없으면 현재 시간으로 간주 (최신으로 표시)
        return Date.now();
      };

      return getTime(b) - getTime(a); // 내림차순 정렬
    });

    // 전역 변수 업데이트 (편집 모달에서 접근 가능하도록)
    window.allConcepts = allConcepts;

    // 학습 페이지에서 사용할 수 있도록 sessionStorage에도 저장
    try {
      sessionStorage.setItem(
        "learningConcepts",
        JSON.stringify(allConcepts.slice(0, 100))
      ); // 성능을 위해 최대 100개
    } catch (error) {
      console.warn("⚠️ sessionStorage 저장 실패:", error);
    }

    // 현재 필터로 검색 및 표시
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      domainFilter: document.getElementById("domain-filter"),
      sortOption: document.getElementById("sort-option"),
    };

    handleSearch(elements);
  } catch (error) {
    console.error("❌ 개념 데이터 가져오기 오류:", error);
    throw error;
  }
}

// 개념 상세 보기 모달 열기 함수 (전역 함수, ID 조회 개선)
window.openConceptViewModal = async function (conceptId) {
  try {
    // 사용자 언어 설정 업데이트 (AI 단어장과 동일하게)
    try {
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

    // conceptUtils가 정의되어 있는지 확인
    if (!conceptUtils) {
      throw new Error("conceptUtils가 정의되지 않았습니다.");
    }

    // 현재 선택된 언어 설정 가져오기
    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    // 먼저 메모리에서 개념 찾기 (빠른 검색)
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    // 메모리에서 찾지 못했으면 Firebase에서 조회
    if (!conceptData) {
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
      } catch (error) {
        console.error("Firebase 조회 실패:", error);

        // ID가 word 조합 형태인 경우 메모리에서 다시 검색
        if (conceptId.includes("_")) {
          const [sourceWord, targetWord] = conceptId.split("_");
          conceptData = allConcepts.find((concept) => {
            const srcExpr = concept.expressions?.[sourceLanguage];
            const tgtExpr = concept.expressions?.[targetLanguage];
            return srcExpr?.word === sourceWord && tgtExpr?.word === targetWord;
          });
        }
      }
    }

    if (!conceptData) {
      console.error("개념을 찾을 수 없습니다. conceptId:", conceptId);
      alert("개념 정보를 찾을 수 없습니다.");
      return;
    }

    const modal = document.getElementById("concept-view-modal");
    if (!modal) {
      throw new Error("concept-view-modal 요소를 찾을 수 없습니다.");
    }

    console.log("모달 콘텐츠 채우기 시작...");
    // 모달 콘텐츠 채우기 (언어 설정 전달)
    fillConceptViewModal(conceptData, sourceLanguage, targetLanguage);

    console.log("모달 표시...");
    // 모달 표시 (CSS 우선순위 문제 해결)
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // 강제로 표시
    console.log("🔍 모달 표시 후 상태:", {
      classList: Array.from(modal.classList),
      display: getComputedStyle(modal).display,
      visibility: getComputedStyle(modal).visibility,
    });

    // 모달이 표시된 후에 예문 로드
    console.log("📖 모달 표시 완료, 예문 로드 시작...");
    await loadAndDisplayExamples(
      conceptData.id,
      sourceLanguage,
      targetLanguage
    );

    console.log("모달 열기 완료");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    console.error("Error stack:", error.stack);
    alert("개념 정보를 불러올 수 없습니다: " + error.message);
  }
};

// 개념 상세 보기 모달 채우기 (분리된 컬렉션 지원)
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  if (!conceptData) {
    console.error("개념 데이터가 없습니다");
    return;
  }

  console.log("모달 채우기:", conceptData);

  // 기본 정보 설정
  const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
  const targetExpression = conceptData.expressions?.[targetLanguage] || {};

  // 제목과 기본 정보
  const titleElement = document.getElementById("concept-view-title");
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );

  if (titleElement) {
    titleElement.textContent = targetExpression.word || "N/A";
  }
  if (pronunciationElement) {
    pronunciationElement.textContent =
      targetExpression.pronunciation || targetExpression.romanization || "";
  }

  // 개념 정보
  const conceptInfo = conceptData.concept_info || {};

  // 도메인/카테고리 표시
  const domainCategoryElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (domainCategoryElement) {
    const domain = conceptInfo.domain || conceptData.domain || "기타";
    const category = conceptInfo.category || conceptData.category || "일반";
    domainCategoryElement.textContent = translateDomainCategory(
      domain,
      category,
      userLanguage
    );
  }

  // 이모지와 색상 (개념 카드와 동일한 우선순위 적용)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "📝";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  const emojiElement = document.getElementById("concept-view-emoji");

  // 요소를 찾을 수 없을 때 지연 후 재시도
  if (!emojiElement) {
    setTimeout(() => {
      const delayedEmojiElement = document.getElementById("concept-view-emoji");
      if (delayedEmojiElement && emoji) {
        delayedEmojiElement.textContent = emoji;
      }
    }, 100);
  }

  if (emojiElement && emoji) {
    emojiElement.textContent = emoji;
  }

  const headerElement = document.querySelector(".concept-view-header");
  if (headerElement) {
    headerElement.style.borderLeftColor = colorTheme;
  }

  // 날짜 정보 (분리된 컬렉션 메타데이터 우선)
  const createdDate =
    conceptData.metadata?.created_at ||
    conceptData.created_at ||
    conceptData.timestamp;

  const dateElement = document.getElementById("concept-updated-at");
  if (dateElement && createdDate) {
    dateElement.textContent = formatDate(createdDate);
  }

  // 언어별 표현 채우기
  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);

  // 모달 버튼 설정
  setupModalButtons(conceptData);

  // 모달 내 다국어 번역 적용 - AI 단어장과 동일한 data-i18n 방식 사용
  setTimeout(() => {
    const modal = document.getElementById("concept-view-modal");

    if (modal) {
      // 모달 내부의 data-i18n 요소들 번역 (AI 단어장과 동일한 방식)
      modal.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        const translatedText = getTranslatedText(key);

        if (translatedText) {
          element.textContent = translatedText;
        }
      });
    }
  }, 100);
}

// 분리된 컬렉션에서 예문 로드 및 표시
async function loadAndDisplayExamples(
  conceptId,
  sourceLanguage,
  targetLanguage
) {
  try {
    // 보기 모달 내부의 examples-container만 찾기
    const viewModal = document.getElementById("concept-view-modal");
    const examplesContainer = viewModal
      ? viewModal.querySelector("#examples-container")
      : null;
    if (!examplesContainer) {
      console.error("❌ 보기 모달 내 examples-container를 찾을 수 없습니다");
      return;
    }

    let examplesHTML = "";
    const allExamples = [];

    // 1. 현재 개념에서 representative_example만 사용 (중복 방지)
    const currentConcept = allConcepts.find(
      (c) => c.id === conceptId || c._id === conceptId
    );

    if (currentConcept?.representative_example) {
      console.log("대표 예문 발견:", currentConcept.representative_example);

      const repExample = currentConcept.representative_example;

      // 새로운 구조: 직접 언어별 텍스트 (translations 없음)
      if (repExample[sourceLanguage] && repExample[targetLanguage]) {
        console.log("🔍 새로운 대표 예문 구조 (직접 언어별):", repExample);

        const sourceText = repExample[sourceLanguage];
        const targetText = repExample[targetLanguage];

        console.log("📝 추출된 예문 (새 구조):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "대표 예문",
            isRepresentative: true,
          });
          console.log("✅ 대표 예문을 allExamples에 추가함 (새 구조)");
        }
      }
      // 기존 구조: translations 객체 포함
      else if (repExample.translations) {
        console.log(
          "🔍 기존 대표 예문 구조 (translations):",
          repExample.translations
        );
        console.log(
          "🔍 sourceLanguage:",
          sourceLanguage,
          "targetLanguage:",
          targetLanguage
        );

        const sourceText =
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "";
        const targetText =
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "";

        console.log("📝 추출된 예문 (기존 구조):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "대표 예문",
            isRepresentative: true,
          });
          console.log("✅ 대표 예문을 allExamples에 추가함 (기존 구조)");
        } else {
          console.log("⚠️ sourceText 또는 targetText가 비어있음 (기존 구조)");
        }
      } else {
        console.log("⚠️ 지원되지 않는 대표 예문 구조:", repExample);
      }
    }

    // 3. 대표 예문이 없는 경우에만 기존 구조에서 예문 확인 (하위 호환성)
    if (allExamples.length === 0 && currentConcept) {
      // featured_examples 확인
      if (
        currentConcept.featured_examples &&
        currentConcept.featured_examples.length > 0
      ) {
        currentConcept.featured_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "추천",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }

      // core_examples 확인 (featured_examples가 없는 경우에만)
      if (
        allExamples.length === 0 &&
        currentConcept.core_examples &&
        currentConcept.core_examples.length > 0
      ) {
        currentConcept.core_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "핵심",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }
    }

    // priority가 높은 순으로 정렬
    allExamples.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 상위 3개만 표시 (중복 방지)
    allExamples.slice(0, 3).forEach((example) => {
      // 배지 제거 - 깔끔하게 예문만 표시
      examplesHTML += `
        <div class="bg-gray-50 p-3 rounded-lg mb-3">
          <p class="text-gray-800 mb-1">${example.targetText}</p>
          <p class="text-gray-600 text-sm">${example.sourceText}</p>
        </div>
      `;
    });

    if (examplesHTML) {
      examplesContainer.innerHTML = examplesHTML;
    } else {
      examplesContainer.innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-quote-left text-2xl mb-2"></i>
          <p>등록된 예문이 없습니다.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("예문 로드 중 오류:", error);
    console.error("오류 스택:", error.stack);
    const examplesContainer = document.getElementById("examples-container");
    if (examplesContainer) {
      examplesContainer.innerHTML = `
        <div class="text-center text-red-500 py-4">
          <p>예문을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      `;
    } else {
      console.error("❌ catch 블록에서도 examples-container를 찾을 수 없음");
    }
  }
}

// 언어별 표현 정보 채우기 함수 (확장된 구조 지원)
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  const tabContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (!tabContainer || !contentContainer) {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabContainer,
      contentContainer,
    });
    return;
  }

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // 언어탭 순서: 대상언어 → 원본언어 → 나머지 언어들
  const orderedLanguages = [];

  // 1. 대상언어 먼저 추가 (있는 경우)
  if (targetLanguage && conceptData.expressions?.[targetLanguage]?.word) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
  if (
    sourceLanguage &&
    conceptData.expressions?.[sourceLanguage]?.word &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. 나머지 언어들 추가 (원본언어, 대상언어 제외)
  Object.keys(conceptData.expressions || {}).forEach((langCode) => {
    if (
      !orderedLanguages.includes(langCode) &&
      conceptData.expressions[langCode]?.word
    ) {
      orderedLanguages.push(langCode);
    }
  });

  if (orderedLanguages.length === 0) {
    console.error("표시할 언어가 없습니다.");
    return;
  }

  // 각 언어별 탭과 컨텐츠 생성
  orderedLanguages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
    const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
    const langInfo = supportedLanguages[langCode] || {
      nameKo: langCode,
      code: langCode,
    };

    // 탭 생성
    const tab = document.createElement("button");
    tab.id = `view-${langCode}-tab`;
    tab.className = `px-4 py-2 border-b-2 ${
      index === 0
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
    tab.textContent = getLanguageName(langCode);
    tab.onclick = () => switchViewTab(langCode);

    tabContainer.appendChild(tab);

    // 컨텐츠 패널 생성 (간소화)
    const panel = document.createElement("div");
    panel.id = `view-${langCode}-content`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4`;

    contentContainer.appendChild(panel);

    // 모든 언어탭의 내용을 미리 생성
    updateLanguageContent(langCode, conceptData, sourceLanguage);
  });

  // 탭 전환 함수 정의
  window.switchViewTab = (langCode) => {
    // 모든 탭 비활성화
    document.querySelectorAll("[id^='view-'][id$='-tab']").forEach((tab) => {
      tab.className =
        "px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700";
    });

    // 모든 컨텐츠 패널 숨기기
    document
      .querySelectorAll("[id^='view-'][id$='-content']")
      .forEach((content) => {
        content.classList.add("hidden");
      });

    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`view-${langCode}-tab`);
    if (selectedTab) {
      selectedTab.className =
        "px-4 py-2 border-b-2 border-blue-500 text-blue-600";
    }

    // 선택된 컨텐츠 표시
    const selectedContent = document.getElementById(`view-${langCode}-content`);
    if (selectedContent) {
      selectedContent.classList.remove("hidden");

      // 내용이 비어있는 경우 생성 (안전장치)
      if (selectedContent.innerHTML.trim() === "") {
        console.log(
          `🔧 [안전장치] ${langCode} 탭 내용이 비어있어서 생성 중...`
        );
        updateLanguageContent(langCode, conceptData, sourceLanguage);
      }
    }

    // 모달 헤더 업데이트 (언어 탭에 따라 변경)
    const currentExpression = conceptData.expressions?.[langCode] || {};
    const titleElement = document.getElementById("concept-view-title");
    const pronunciationElement = document.getElementById(
      "concept-view-pronunciation"
    );

    // 헤더 단어는 현재 선택된 언어 탭에 따라 변경
    if (titleElement) {
      titleElement.textContent = currentExpression.word || "N/A";
    }

    // 발음 정보도 현재 언어에 맞게 업데이트
    if (pronunciationElement) {
      pronunciationElement.textContent =
        currentExpression.pronunciation ||
        currentExpression.romanization ||
        currentExpression.phonetic ||
        "";
    }

    // 언어탭 변경 시에는 내용을 다시 생성하지 않음 (이미 생성된 내용 사용)
    // updateLanguageContent는 모달 초기 로드 시에만 호출됨

    // 언어탭 변경에 따라 예문의 대상 언어도 업데이트
    console.log(
      `🔄 언어탭 변경: ${sourceLanguage} → ${langCode}, 예문 업데이트 중...`
    );
    loadAndDisplayExamples(conceptData.id, sourceLanguage, langCode);
  };

  // 시간 표시 설정
  setupConceptTimestamp(conceptData);

  // 모달 버튼 이벤트 설정 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 번역 적용)
  setTimeout(() => {
    setupModalButtons(conceptData);
  }, 100);
}

// 언어별 컨텐츠 업데이트 함수 (환경 언어 기준)
function updateLanguageContent(langCode, conceptData, sourceLanguage) {
  const panel = document.getElementById(`view-${langCode}-content`);
  if (!panel || !conceptData) return;

  const expression = conceptData.expressions?.[langCode] || {};

  // 내용 영역의 번역 단어는 환경 언어로 고정
  // userLanguage에 해당하는 언어 코드 매핑
  const userLangToCode = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };

  const envLangCode = userLangToCode[userLanguage] || "korean";
  const envExpression =
    conceptData.expressions?.[envLangCode] ||
    conceptData.expressions?.korean ||
    Object.values(conceptData.expressions || {})[0] ||
    {};
  const displayWord = envExpression.word || "N/A";

  console.log(
    `🔍 [내용 언어] userLanguage: ${userLanguage}, envLangCode: ${envLangCode}, displayWord: ${displayWord}`
  );

  // 환경 설정 언어에 따른 레이블 가져오기
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        synonyms: "유의어",
        antonyms: "반의어",
        word_family: "어족",
        compound_words: "복합어",
        collocations: "연어",
        partOfSpeech: {
          noun: "명사",
          verb: "동사",
          adjective: "형용사",
          adverb: "부사",
          pronoun: "대명사",
          preposition: "전치사",
          conjunction: "접속사",
          interjection: "감탄사",
        },
      },
      en: {
        synonyms: "Synonyms",
        antonyms: "Antonyms",
        word_family: "Word Family",
        compound_words: "Compound Words",
        collocations: "Collocations",
        partOfSpeech: {
          noun: "noun",
          verb: "verb",
          adjective: "adjective",
          adverb: "adverb",
          pronoun: "pronoun",
          preposition: "preposition",
          conjunction: "conjunction",
          interjection: "interjection",
        },
      },
      ja: {
        synonyms: "類義語",
        antonyms: "反意語",
        word_family: "語族",
        compound_words: "複合語",
        collocations: "連語",
        partOfSpeech: {
          noun: "名詞",
          verb: "動詞",
          adjective: "形容詞",
          adverb: "副詞",
          pronoun: "代名詞",
          preposition: "前置詞",
          conjunction: "接続詞",
          interjection: "感嘆詞",
        },
      },
      zh: {
        synonyms: "同义词",
        antonyms: "反义词",
        word_family: "词族",
        compound_words: "复合词",
        collocations: "搭配词",
        partOfSpeech: {
          noun: "名词",
          verb: "动词",
          adjective: "形容词",
          adverb: "副词",
          pronoun: "代词",
          preposition: "介词",
          conjunction: "连词",
          interjection: "感叹词",
        },
      },
    };
    return labels[userLang] || labels.ko;
  };

  const uiLabels = getUILabels(userLanguage);

  // 품사 번역 - 환경 언어로 고정
  const translatePartOfSpeech = (pos) => {
    if (!pos) return "";

    // 품사를 영어 표준으로 정규화
    const normalizePartOfSpeech = (partOfSpeech) => {
      const posMap = {
        // 한국어
        명사: "noun",
        동사: "verb",
        형용사: "adjective",
        부사: "adverb",
        대명사: "pronoun",
        전치사: "preposition",
        접속사: "conjunction",
        감탄사: "interjection",
        // 일본어
        名詞: "noun",
        動詞: "verb",
        形容詞: "adjective",
        副詞: "adverb",
        代名詞: "pronoun",
        前置詞: "preposition",
        接続詞: "conjunction",
        感嘆詞: "interjection",
        // 중국어
        名词: "noun",
        动词: "verb",
        形容词: "adjective",
        副词: "adverb",
        代词: "pronoun",
        介词: "preposition",
        连词: "conjunction",
        感叹词: "interjection",
        // 영어 (그대로)
        noun: "noun",
        verb: "verb",
        adjective: "adjective",
        adverb: "adverb",
        pronoun: "pronoun",
        preposition: "preposition",
        conjunction: "conjunction",
        interjection: "interjection",
      };
      return posMap[partOfSpeech] || partOfSpeech;
    };

    const normalizedPos = normalizePartOfSpeech(pos);
    const translated = uiLabels.partOfSpeech[normalizedPos] || pos;
    console.log(
      `🔍 [품사 번역] 원본: ${pos}, 정규화: ${normalizedPos}, 번역: ${translated}, 환경언어: ${userLanguage}`
    );
    return translated;
  };

  console.log(`🔍 ${langCode} 언어 표현 데이터:`, expression);

  panel.innerHTML = `
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-xl font-bold text-blue-600">${displayWord}</h3>
        ${
          expression.part_of_speech
            ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">${translatePartOfSpeech(
                expression.part_of_speech
              )}</span>`
            : ""
        }
      </div>

    </div>
    ${
      expression.definition
        ? `<div class="mb-4">
        <p class="text-sm text-gray-600">${expression.definition}</p>
      </div>`
        : ""
    }
    ${
      expression.synonyms && expression.synonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.synonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.synonyms
            .map(
              (synonym) =>
                `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${synonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.antonyms && expression.antonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.antonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.antonyms
            .map(
              (antonym) =>
                `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">${antonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.word_family && expression.word_family.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.word_family
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.word_family
            .map(
              (word) =>
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.compound_words && expression.compound_words.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.compound_words
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.compound_words
            .map(
              (word) =>
                `<span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.collocations && expression.collocations.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.collocations
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.collocations
            .map(
              (collocation) =>
                `<span class="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">${collocation}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
  `;

  // 발음 정보는 언어 탭 변경시에만 업데이트 (헤더 단어는 고정)
  if (expression.pronunciation) {
    const pronElement = document.getElementById("concept-view-pronunciation");
    if (pronElement) {
      pronElement.textContent = expression.pronunciation;
    }
  }
}

// 개념 시간 표시 설정
function setupConceptTimestamp(conceptData) {
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement && conceptData) {
    let timeText = getTranslatedText("registration_time") || "등록 시간";

    console.log("⏰ 시간 설정 시도:", conceptData);

    // 여러 가능한 시간 필드 확인
    let dateValue = null;

    if (conceptData.metadata?.created_at) {
      dateValue = conceptData.metadata.created_at;
    } else if (conceptData.metadata?.timestamp) {
      dateValue = conceptData.metadata.timestamp;
    } else if (conceptData.createdAt) {
      dateValue = conceptData.createdAt;
    } else if (conceptData.timestamp) {
      dateValue = conceptData.timestamp;
    } else if (conceptData.created_at) {
      dateValue = conceptData.created_at;
    }

    if (dateValue) {
      try {
        let date;
        if (dateValue.toDate) {
          // Firestore Timestamp
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (
          typeof dateValue === "string" ||
          typeof dateValue === "number"
        ) {
          date = new Date(dateValue);
        }

        if (date && !isNaN(date.getTime())) {
          timeText = formatDate(date);
          console.log("✅ 시간 설정 성공:", timeText);
        }
      } catch (error) {
        console.error("❌ 시간 파싱 오류:", error);
      }
    } else {
      console.log("⚠️ 시간 정보 없음, 기본값 사용");
    }

    timestampElement.textContent = timeText;
  }
}

// 모달 버튼 이벤트 설정
function setupModalButtons(conceptData) {
  // 전역 번역 시스템을 사용하여 버튼 번역 적용
  const viewModal = document.getElementById("concept-view-modal");
  if (viewModal) {
    // utils/language-utils.js의 전역 번역 시스템 사용
    if (typeof updateLanguageUI === "function") {
      updateLanguageUI(userLanguage);
    } else {
      // 전역 번역 시스템이 없는 경우 직접 번역
      const editButtonSpan = viewModal.querySelector(
        '#edit-concept-button span[data-i18n="edit"]'
      );
      const deleteButtonSpan = viewModal.querySelector(
        '#delete-concept-button span[data-i18n="delete"]'
      );
      const examplesTitle = viewModal.querySelector('h3[data-i18n="examples"]');

      // 전역 번역 객체에서 직접 가져오기
      if (typeof translations !== "undefined" && translations[userLanguage]) {
        if (editButtonSpan) {
          editButtonSpan.textContent =
            translations[userLanguage].edit || "편집";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            translations[userLanguage].delete || "삭제";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            translations[userLanguage].examples || "예문";
        }
      } else {
        // 마지막 fallback
        if (editButtonSpan) {
          editButtonSpan.textContent =
            userLanguage === "ko"
              ? "편집"
              : userLanguage === "en"
              ? "Edit"
              : userLanguage === "ja"
              ? "編集"
              : userLanguage === "zh"
              ? "编辑"
              : "편집";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            userLanguage === "ko"
              ? "삭제"
              : userLanguage === "en"
              ? "Delete"
              : userLanguage === "ja"
              ? "削除"
              : userLanguage === "zh"
              ? "删除"
              : "삭제";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            userLanguage === "ko"
              ? "예문"
              : userLanguage === "en"
              ? "Examples"
              : userLanguage === "ja"
              ? "例文"
              : userLanguage === "zh"
              ? "例句"
              : "예문";
        }
      }
    }

    console.log("✅ 모달 버튼 번역 완료:", {
      userLanguage: userLanguage,
      editText: viewModal.querySelector("#edit-concept-button span")
        ?.textContent,
      deleteText: viewModal.querySelector("#delete-concept-button span")
        ?.textContent,
    });
  }

  // 편집 버튼 이벤트
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 개념 수정 모달 열기
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) {
        viewModal.classList.add("hidden");
        viewModal.style.display = "none"; // 강제로 숨기기
      }

      const conceptId =
        conceptData.concept_id || conceptData.id || conceptData._id;
      console.log("🔧 편집 버튼 클릭, conceptId:", conceptId);

      // 약간의 지연 후 편집 모달 열기 (DOM 업데이트 대기)
      setTimeout(() => {
        if (window.openEditConceptModal) {
          window.openEditConceptModal(conceptId);
        } else {
          console.error("❌ openEditConceptModal 함수가 정의되지 않았습니다.");
        }
      }, 100);
    };
  }

  // 삭제 버튼 이벤트
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (
        confirm(
          getTranslatedText("confirm_delete_concept") ||
            "정말로 이 개념을 삭제하시겠습니까?"
        )
      ) {
        try {
          await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
          alert(
            getTranslatedText("concept_deleted_success") ||
              "개념이 성공적으로 삭제되었습니다."
          );

          // 모달 닫기
          const viewModal = document.getElementById("concept-view-modal");
          if (viewModal) {
            viewModal.classList.add("hidden");
            viewModal.style.display = "none";
            console.log("✅ 삭제 후 모달 닫기 완료");
          }

          // 목록 새로고침
          window.dispatchEvent(new CustomEvent("concept-saved"));
        } catch (error) {
          console.error("개념 삭제 중 오류 발생:", error);
          alert(
            (getTranslatedText("concept_delete_error") ||
              "개념 삭제 중 오류가 발생했습니다") +
              ": " +
              error.message
          );
        }
      }
    };
  }

  // 모달 닫기 버튼 이벤트 (여러 방법으로 설정)
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    // 기존 이벤트 리스너 제거
    closeButton.onclick = null;

    // 새로운 이벤트 리스너 추가
    const closeModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById("concept-view-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none"; // 강제로 숨기기
        console.log("✅ 모달 닫기 완료");
      }
    };

    closeButton.addEventListener("click", closeModal);
    closeButton.onclick = closeModal; // 백업용
    console.log("✅ 모달 닫기 버튼 이벤트 설정 완료");
  } else {
    console.error("❌ close-concept-view-modal 버튼을 찾을 수 없습니다");
  }

  // 모달 배경 클릭으로도 닫기
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
        console.log("✅ 모달 배경 클릭으로 닫기");
      }
    });
  }
}

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🚀 DOMContentLoaded 이벤트 시작");

    // 현재 활성화된 언어 코드 가져오기
    userLanguage = await getActiveLanguage();
    console.log("✅ 언어 설정 완료:", userLanguage);

    // 네비게이션바 로드
    console.log("📋 네비게이션바 로드 시작");
    const navbarContainer = document.getElementById("navbar-container");
    console.log("📋 네비게이션 바 컨테이너:", navbarContainer);

    if (!navbarContainer) {
      console.error("❌ navbar-container를 찾을 수 없습니다!");
      throw new Error("navbar-container 요소가 없습니다.");
    }

    await loadNavbar(navbarContainer);
    console.log("✅ 네비게이션바 로드 완료");

    // 네비게이션바가 실제로 로드되었는지 확인
    setTimeout(() => {
      const loadedNavbar = document.querySelector("#navbar-container nav");
      console.log("🔍 로드된 네비게이션바:", loadedNavbar);
      if (!loadedNavbar) {
        console.error("❌ 네비게이션바가 제대로 로드되지 않았습니다!");
      }
    }, 1000);

    // 모달 초기화
    console.log("🔧 모달 초기화 시작");
    await loadModals([
      "../components/add-concept-modal.html",
      "../components/edit-concept-modal.html",
      "../components/concept-view-modal.html",
      "../components/bulk-import-modal.html",
    ]);
    console.log("✅ 모달 초기화 완료");

    // 모달 컴포넌트 초기화
    console.log("⚙️ 모달 컴포넌트 초기화 시작");
    await initializeConceptModal();
    initializeBulkImportModal();
    console.log("✅ 모달 컴포넌트 초기화 완료");

    // 이벤트 리스너 설정
    console.log("🔗 이벤트 리스너 설정 시작");
    setupEventListeners();
    console.log("✅ 이벤트 리스너 설정 완료");

    // 메타데이터 업데이트
    console.log("📄 메타데이터 업데이트 시작");
    await updateMetadata("dictionary");
    console.log("✅ 메타데이터 업데이트 완료");

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("👤 사용자 로그인 확인:", user.email);
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
        await loadUserBookmarks(); // 북마크 로드 추가
      } else {
        alert(getTranslatedText("login_required"));
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("❌ 다국어 단어장 페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다.", error.message);
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  console.log("🔧 setupEventListeners 함수 시작");

  const elements = {
    searchInput: document.getElementById("search-input"),
    sourceLanguage: document.getElementById("source-language"),
    targetLanguage: document.getElementById("target-language"),
    domainFilter: document.getElementById("domain-filter"),
    sortOption: document.getElementById("sort-option"),
    swapButton: document.getElementById("swap-languages"),
    loadMoreButton: document.getElementById("load-more"),
    addConceptButton: document.getElementById("add-concept"),
    bulkAddButton: document.getElementById("bulk-add-concept"),
  };

  // 모든 요소가 제대로 찾아졌는지 확인
  console.log("🔍 Found elements:", {
    addConceptButton: !!elements.addConceptButton,
    bulkAddButton: !!elements.bulkAddButton,
    searchInput: !!elements.searchInput,
    sourceLanguage: !!elements.sourceLanguage,
    targetLanguage: !!elements.targetLanguage,
    domainFilter: !!elements.domainFilter,
    sortOption: !!elements.sortOption,
    swapButton: !!elements.swapButton,
    loadMoreButton: !!elements.loadMoreButton,
  });

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    handleSearch(elements);
  });

  // 언어 변경 이벤트 (데이터 다시 로드 필요)
  [elements.sourceLanguage, elements.targetLanguage].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => {
        fetchAndDisplayConcepts();
      });
    }
  });

  // 언어 순서 바꾸기 이벤트 (공유 모듈 사용)
  if (elements.swapButton) {
    elements.swapButton.addEventListener("click", () => {
      filterManager.swapLanguages();
      handleSearch(elements);
    });
  }

  // 더 보기 버튼 이벤트
  if (elements.loadMoreButton) {
    elements.loadMoreButton.addEventListener("click", handleLoadMore);
  }

  // 새 개념 추가 버튼 이벤트
  if (elements.addConceptButton) {
    console.log("➕ 새 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.addConceptButton.addEventListener("click", () => {
      console.log("🖱️ 새 개념 추가 버튼 클릭됨");
      if (window.openConceptModal) {
        console.log("✅ openConceptModal 함수 호출");
        window.openConceptModal();
      } else {
        console.error("❌ openConceptModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 새 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 대량 개념 추가 버튼 이벤트
  if (elements.bulkAddButton) {
    console.log("📦 대량 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.bulkAddButton.addEventListener("click", () => {
      console.log("🖱️ 대량 개념 추가 버튼 클릭됨");
      if (window.openBulkImportModal) {
        console.log("✅ openBulkImportModal 함수 호출");
        window.openBulkImportModal();
      } else {
        console.error("❌ openBulkImportModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 대량 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ bulk-add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 개념 저장 이벤트 리스너 (모달에서 호출)
  window.addEventListener("concept-saved", () => {
    console.log("💾 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 개념 삭제 이벤트 리스너
  window.addEventListener("concept-deleted", () => {
    console.log("🗑️ 개념 삭제 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 대량 개념 추가 이벤트 리스너
  window.addEventListener("concepts-bulk-saved", () => {
    console.log("📦 대량 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 언어 변경 이벤트 리스너 추가 (새로고침 없이 도메인/카테고리 업데이트)
  window.addEventListener("languageChanged", () => {
    console.log("🌐 언어 변경 이벤트 수신 - 개념 카드 업데이트");
    // 현재 표시된 개념들을 다시 렌더링
    displayConceptList();
  });

  console.log("✅ setupEventListeners 함수 완료");
}

// 오류 표시 함수
function showError(message, details = "") {
  console.error("오류:", message, details);
  alert(
    `${getTranslatedText("error_title")} ${message} ${
      details ? `\n${getTranslatedText("error_details")} ${details}` : ""
    }`
  );
}

// 북마크 관련 함수들
let userBookmarks = [];

// 사용자 북마크 로드
async function loadUserBookmarks() {
  if (!auth.currentUser) return;

  try {
    const userEmail = auth.currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);
    const bookmarkDoc = await getDoc(bookmarksRef);

    if (bookmarkDoc.exists()) {
      userBookmarks = bookmarkDoc.data().concept_ids || [];
    } else {
      userBookmarks = [];
    }

    // 북마크 상태 업데이트
    updateBookmarkUI();
  } catch (error) {
    console.error("북마크 로드 오류:", error);
  }
}

// 북마크 토글
async function toggleBookmark(conceptId) {
  if (!auth.currentUser) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const userEmail = auth.currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);

    let updatedBookmarks;
    const isBookmarked = userBookmarks.includes(conceptId);

    if (isBookmarked) {
      // 북마크 제거
      updatedBookmarks = userBookmarks.filter((id) => id !== conceptId);
      showMessage("북마크가 제거되었습니다.", "success");
    } else {
      // 북마크 추가
      updatedBookmarks = [...userBookmarks, conceptId];
      showMessage("북마크가 추가되었습니다.", "success");
    }

    // Firestore 업데이트
    await setDoc(bookmarksRef, {
      user_email: userEmail,
      concept_ids: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    // 로컬 상태 업데이트
    userBookmarks = updatedBookmarks;
    updateBookmarkUI();
  } catch (error) {
    console.error("북마크 토글 오류:", error);
    showError("북마크 처리 중 오류가 발생했습니다.");
  }
}

// 북마크 UI 업데이트
function updateBookmarkUI() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");

  bookmarkButtons.forEach((btn) => {
    const conceptId = btn.getAttribute("data-concept-id");
    const icon = btn.querySelector("i");

    if (userBookmarks.includes(conceptId)) {
      icon.className = "fas fa-bookmark text-yellow-500";
      btn.title = "북마크 해제";
    } else {
      icon.className = "fas fa-bookmark text-gray-400";
      btn.title = "북마크";
    }
  });
}

// 성공 메시지 표시
function showMessage(message, type = "info") {
  const messageContainer = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  messageContainer.className = `fixed top-4 right-4 ${bgColor} px-4 py-3 rounded z-50 border`;
  messageContainer.innerHTML = `
    ${message}
    <button onclick="this.parentElement.remove()" class="ml-2 font-bold">×</button>
  `;

  document.body.appendChild(messageContainer);

  setTimeout(() => {
    if (messageContainer.parentElement) {
      messageContainer.remove();
    }
  }, 3000);
}

// 전역 함수로 만들어서 HTML에서 호출 가능하게 함
window.toggleBookmark = toggleBookmark;
