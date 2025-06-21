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
// ?꾪꽣 怨듭쑀 紐⑤뱢 import
import {
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];

// ?꾩뿭?먯꽌 ?묎렐 媛?ν븯?꾨줉 ?ㅼ젙
window.allConcepts = allConcepts;
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

// ?꾨찓??踰덉뿭 留ㅽ븨 (ai-concept-utils.js? ?숈씪)

// ?섏씠吏蹂?踰덉뿭 ??const pageTranslations = {
  ko: {
    meaning: "??",
    example: "?덈Ц:",
    examples: "?덈Ц",
    edit: "?몄쭛",
    delete: "??젣",
    error_title: "?ㅻ쪟 諛쒖깮!",
    error_message: "?섏씠吏瑜?遺덈윭?ㅻ뒗 以?臾몄젣媛 諛쒖깮?덉뒿?덈떎.",
    error_details: "?먯꽭???댁슜:",
    login_required: "濡쒓렇?몄씠 ?꾩슂?⑸땲??",
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
    meaning: "?뤷뫑:",
    example: "堊뗦뻼:",
    examples: "堊뗦뻼",
    edit: "渶③썓",
    delete: "?딃솮",
    error_title: "?ⓦ꺀?쇈걣?븀뵟?쀣겲?쀣걼!",
    error_message: "?싥꺖?멥겗沃?겳渦쇈겳訝?겓?뤻죱?뚨쇇?잆걮?얇걮?잆?,
    error_details: "屋녕눗:",
    login_required: "??궛?ㅳ꺍?뚦퓚誤곥겎?쇻?,
  },
  zh: {
    meaning: "?뤸?",
    example: "堊뗥룯:",
    examples: "堊뗥룯",
    edit: "煐뽬풌",
    delete: "?좈솮",
    error_title: "?묊뵟?숃?!",
    error_message: "?좄슬窈들씊?뜹눣?곈뿮窯섅?,
    error_details: "瑥?퍏岳→겘:",
    login_required: "?誤곭쇉壤뺛?,
  },
};

// ?꾨찓??踰덉뿭 留ㅽ븨 (ai-concept-utils.js? ?숈씪)
const domainTranslations = {
  daily: { ko: "?쇱긽?앺솢", en: "Daily Life", ja: "?ε만?잍뉵", zh: "?ε만?잍뉵" },
  food: {
    ko: "?뚯떇/?붾━",
    en: "Food/Cooking",
    ja: "繇잆겧???숂릤",
    zh: "繇잏돥/?백ⅹ",
  },
  travel: { ko: "?ы뻾", en: "Travel", ja: "?낁죱", zh: "?낁죱" },
  business: {
    ko: "鍮꾩쫰?덉뒪/?낅Т",
    en: "Business/Work",
    ja: "?볝궦?띲궧/璵?떃",
    zh: "?녶뒦/藥δ퐳",
  },
  education: { ko: "援먯쑁", en: "Education", ja: "?숃궟", zh: "?숃궟" },
  nature: {
    ko: "?먯뿰/?섍꼍",
    en: "Nature/Environment",
    ja: "?ょ꽫/?겼쥊",
    zh: "?ょ꽫/??쥊",
  },
  technology: {
    ko: "湲곗닠/IT",
    en: "Technology/IT",
    ja: "?烏?IT",
    zh: "???IT",
  },
  health: {
    ko: "嫄닿컯/?섎즺",
    en: "Health/Medical",
    ja: "?ε볜/?사셽",
    zh: "?ε볜/?사뼏",
  },
  sports: {
    ko: "?ㅽ룷痢??대룞",
    en: "Sports/Exercise",
    ja: "?밤깮?쇈깂/?뗥땿",
    zh: "鵝볢궟/瓦먨뒯",
  },
  entertainment: {
    ko: "?뷀꽣?뚯씤癒쇳듃",
    en: "Entertainment",
    ja: "?ⓦ꺍?욍꺖?녴궎?녈깳?녈깉",
    zh: "夜긴퉸",
  },
  culture: {
    ko: "臾명솕/?꾪넻",
    en: "Culture/Tradition",
    ja: "?뉐뙑/鴉앯뎠",
    zh: "?뉐뙑/鴉좂퍨",
  },
  other: { ko: "湲고?", en: "Other", ja: "?앫겗餓?, zh: "?뜸퍟" },
  // ?명솚?깆쓣 ?꾪븳 異붽? 留ㅽ븨
  academic: { ko: "援먯쑁", en: "Education", ja: "?숃궟", zh: "?숃궟" },
  general: { ko: "?쇰컲", en: "General", ja: "訝??, zh: "訝?? },
};

// 移댄뀒怨좊━ 踰덉뿭 留ㅽ븨 (ai-concept-utils.js? ?숈씪)
const categoryTranslations = {
  // Daily
  household: {
    ko: "媛?뺤슜??,
    en: "Household",
    ja: "若뜹벼?ⓨ뱚",
    zh: "若뜹벼?ⓨ뱚",
  },
  family: { ko: "媛議?, en: "Family", ja: "若뜻뿈", zh: "若뜹벼" },
  routine: {
    ko: "?쇱긽 猷⑦떞",
    en: "Routine",
    ja: "?ε만?ャ꺖?곥꺍",
    zh: "?ε만堊뗨죱",
  },
  clothing: { ko: "?섎쪟", en: "Clothing", ja: "烏ｉ줊", zh: "?띹즳" },
  furniture: { ko: "媛援?, en: "Furniture", ja: "若뜹끁", zh: "若뜹끁" },
  shopping: { ko: "?쇳븨", en: "Shopping", ja: "?룔깾?껁깞?녈궛", zh: "兀?돥" },
  communication: {
    ko: "?섏궗?뚰넻",
    en: "Communication",
    ja: "?녈깱?γ깑?긱꺖?룔깾??,
    zh: "雅ㅶ탛",
  },
  personal_care: {
    ko: "媛쒖씤愿由?,
    en: "Personal Care",
    ja: "?뗤볶?긱궋",
    zh: "訝や볶?ㅷ릤",
  },
  leisure: { ko: "?ш?", en: "Leisure", ja: "?с궦?ｃ꺖", zh: "鴉묌뿲" },
  relationships: {
    ko: "?멸컙愿怨?,
    en: "Relationships",
    ja: "雅븅뼋?㏘퓗",
    zh: "雅븅솀?녕내",
  },
  emotions: { ko: "媛먯젙", en: "Emotions", ja: "?잍깄", zh: "?끾꽏" },
  time: { ko: "?쒓컙", en: "Time", ja: "?귡뼋", zh: "?띌뿴" },
  weather_talk: {
    ko: "?좎뵪 ???,
    en: "Weather Talk",
    ja: "鸚⒵컱??㈀",
    zh: "鸚⒵컮瘟덅캕",
  },

  // Food
  fruit: { ko: "怨쇱씪", en: "Fruit", ja: "?쒐돥", zh: "麗닸옖" },
  vegetable: { ko: "梨꾩냼", en: "Vegetable", ja: "?롨룣", zh: "?ц룣" },
  meat: { ko: "怨좉린", en: "Meat", ja: "??, zh: "?됬굳" },
  drink: { ko: "?뚮즺", en: "Drink", ja: "繇꿔겳??, zh: "耀?뼑" },
  snack: { ko: "媛꾩떇", en: "Snack", ja: "?밤깏?껁궚", zh: "?띌짘" },
  grain: { ko: "怨〓Ъ", en: "Grain", ja: "令??, zh: "瘟루돥" },
  seafood: { ko: "?댁궛臾?, en: "Seafood", ja: "役루뵣??, zh: "役룬쿇" },
  dairy: { ko: "?좎젣??, en: "Dairy", ja: "阿녘＝??, zh: "阿녑댍?? },
  cooking: { ko: "?붾━", en: "Cooking", ja: "?숂릤", zh: "?백ⅹ" },
  dining: { ko: "?앹궗", en: "Dining", ja: "繇잋틟", zh: "?③쨶" },
  restaurant: { ko: "?뚯떇??, en: "Restaurant", ja: "?с궧?덀꺀??, zh: "繞먨럢" },
  kitchen_utensils: {
    ko: "二쇰갑?⑺뭹",
    en: "Kitchen Utensils",
    ja: "??긿?곥꺍?ⓨ끁",
    zh: "?ⓩ댛?ⓨ끁",
  },
  spices: { ko: "?μ떊猷?, en: "Spices", ja: "?밤깙?ㅳ궧", zh: "腰숁뼑" },
  dessert: { ko: "?붿???, en: "Dessert", ja: "?뉎궣?쇈깉", zh: "?쒐궧" },

  // Travel
  transportation: { ko: "援먰넻", en: "Transportation", ja: "雅ㅹ?, zh: "雅ㅹ? },
  accommodation: { ko: "?숇컯", en: "Accommodation", ja: "若욘퀕", zh: "鵝뤷?" },
  tourist_attraction: {
    ko: "愿愿묒?",
    en: "Tourist Attraction",
    ja: "誤녑뀎??,
    zh: "?끾만??궧",
  },
  luggage: { ko: "吏?, en: "Luggage", ja: "?루돥", zh: "烏뚧쓮" },
  direction: { ko: "湲몄갼湲?, en: "Direction", ja: "?볠죭??, zh: "?밧릲" },
  booking: { ko: "?덉빟", en: "Booking", ja: "雅덄큵", zh: "窯꾥?" },
  currency: { ko: "?뷀룓", en: "Currency", ja: "?싪꺼", zh: "兀㎩툈" },
  emergency: {
    ko: "?묎툒?곹솴",
    en: "Emergency",
    ja: "渶딀δ틟??,
    zh: "榮㎪ζ깄??,
  },
  documents: { ko: "?쒕쪟", en: "Documents", ja: "?면줊", zh: "?뉏뻑" },
  sightseeing: { ko: "愿愿?, en: "Sightseeing", ja: "誤녑뀎", zh: "鰲귛뀎" },
  local_food: {
    ko: "?꾩??뚯떇",
    en: "Local Food",
    ja: "?얍쑑?숂릤",
    zh: "壤볟쑑獰롩짘",
  },
  souvenir: { ko: "湲곕뀗??, en: "Souvenir", ja: "?듿쐿??, zh: "瀛ゅ영?? },

  // Business
  meeting: { ko: "?뚯쓽", en: "Meeting", ja: "鴉싪?", zh: "鴉싪?" },
  finance: { ko: "湲덉쑖", en: "Finance", ja: "?묋엻", zh: "?묋엻" },
  marketing: {
    ko: "留덉???,
    en: "Marketing",
    ja: "?욁꺖?긱깇?ｃ꺍??,
    zh: "?ι?",
  },
  office: { ko: "?щТ??, en: "Office", ja: "?ゃ깢?ｃ궧", zh: "?욃뀶若? },
  project: { ko: "?꾨줈?앺듃", en: "Project", ja: "?쀣꺆?멥궒??깉", zh: "窈밭쎅" },
  negotiation: { ko: "?묒긽", en: "Negotiation", ja: "雅ㅶ툒", zh: "瘟덂닩" },
  presentation: {
    ko: "諛쒗몴",
    en: "Presentation",
    ja: "?쀣꺃?쇈꺍?녴꺖?룔깾??,
    zh: "轢붺ㅊ",
  },
  teamwork: {
    ko: "??뚰겕",
    en: "Teamwork",
    ja: "?곥꺖?졼꺈?쇈궚",
    zh: "??삜?덁퐳",
  },
  leadership: {
    ko: "由щ뜑??,
    en: "Leadership",
    ja: "?ゃ꺖??쇈궥?껁깤",
    zh: "窯녶???,
  },
  networking: {
    ko: "?ㅽ듃?뚰궧",
    en: "Networking",
    ja: "?띲긿?덀꺈?쇈궘?녈궛",
    zh: "雅븅솀營묊퍥",
  },
  sales: { ko: "?곸뾽", en: "Sales", ja: "?뜻?", zh: "??? },
  contract: { ko: "怨꾩빟", en: "Contract", ja: "也묊큵", zh: "?덂릪" },
  startup: {
    ko: "?ㅽ??몄뾽",
    en: "Startup",
    ja: "?밤궭?쇈깉?㏂긿??,
    zh: "?앭닗鴉곦툣",
  },

  // Education
  teaching: { ko: "援먯닔踰?, en: "Teaching", ja: "?숁럥力?, zh: "?쇿?" },
  learning: { ko: "?숈뒿", en: "Learning", ja: "耶?퓪", zh: "耶╊튌" },
  classroom: { ko: "援먯떎", en: "Classroom", ja: "?쇿?", zh: "?쇿?" },
  curriculum: {
    ko: "援먯쑁怨쇱젙",
    en: "Curriculum",
    ja: "?ャ꺁??깷?⒲깲",
    zh: "瑥양쮮",
  },
  assessment: { ko: "?됯?", en: "Assessment", ja: "屋뺜쐴", zh: "瑥꾡섟" },
  pedagogy: { ko: "援먯쑁??, en: "Pedagogy", ja: "?숃궟耶?, zh: "?숃궟耶? },
  skill_development: {
    ko: "湲곗닠媛쒕컻",
    en: "Skill Development",
    ja: "?밤궘?ラ뼀??,
    zh: "??썲룕掠?,
  },
  online_learning: {
    ko: "?⑤씪?명븰??,
    en: "Online Learning",
    ja: "?ゃ꺍?⒲궎?녑?玲?,
    zh: "?①봇耶╊튌",
  },
  training: { ko: "?덈젴", en: "Training", ja: "?덀꺃?쇈깑?녈궛", zh: "?배?" },
  certification: { ko: "?먭꺽利?, en: "Certification", ja: "蘊뉑졏", zh: "溫ㅸ칮" },
  educational_technology: {
    ko: "援먯쑁湲곗닠",
    en: "Educational Technology",
    ja: "?숃궟?烏?,
    zh: "?숃궟???,
  },
  student_life: {
    ko: "?숈깮?앺솢",
    en: "Student Life",
    ja: "耶?뵟?잍뉵",
    zh: "耶?뵟?잍뉵",
  },
  graduation: { ko: "議몄뾽", en: "Graduation", ja: "?믤?", zh: "驪뺜툣" },
  examination: { ko: "?쒗뿕", en: "Examination", ja: "屋?쮶", zh: "?껇캊" },
  university: { ko: "??숆탳", en: "University", ja: "鸚㎩?", zh: "鸚㎩?" },
  library: { ko: "?꾩꽌愿", en: "Library", ja: "?녔쎑繞?, zh: "?얌묘腰? },

  // Nature
  animal: { ko: "?숇Ъ", en: "Animal", ja: "?뺟돥", zh: "?①돥" },
  plant: { ko: "?앸Ъ", en: "Plant", ja: "濾띸돥", zh: "濾띸돥" },
  weather: { ko: "?좎뵪", en: "Weather", ja: "鸚⒵컱", zh: "鸚⒵컮" },
  geography: { ko: "吏由?, en: "Geography", ja: "?곁릤", zh: "?곁릤" },
  environment: { ko: "?섍꼍", en: "Environment", ja: "?겼쥊", zh: "??쥊" },
  ecosystem: { ko: "?앺깭怨?, en: "Ecosystem", ja: "?잍뀑楹?, zh: "?잍곭내瀯? },
  conservation: { ko: "蹂댁〈", en: "Conservation", ja: "岳앭뀲", zh: "岳앮뒪" },
  climate: { ko: "湲고썑", en: "Climate", ja: "麗쀥?, zh: "麗붷? },
  natural_disaster: {
    ko: "?먯뿰?ы빐",
    en: "Natural Disaster",
    ja: "?ょ꽫?썲?",
    zh: "?ょ꽫?얍?",
  },
  landscape: { ko: "?띻꼍", en: "Landscape", ja: "窯ⓩ솺", zh: "繇롦솺" },
  marine_life: {
    ko: "?댁뼇?앸Ъ",
    en: "Marine Life",
    ja: "役룡큾?잏돥",
    zh: "役룡큾?잏돥",
  },
  forest: { ko: "??, en: "Forest", ja: "汝?, zh: "汝?옑" },
  mountain: { ko: "??, en: "Mountain", ja: "掠?, zh: "掠? },

  // Technology
  computer: {
    ko: "而댄벂??,
    en: "Computer",
    ja: "?녈꺍?붵깷?쇈궭??,
    zh: "溫←츞??,
  },
  software: {
    ko: "?뚰봽?몄썾??,
    en: "Software",
    ja: "?썬깢?덀궑?㎯궋",
    zh: "饔?뻑",
  },
  internet: {
    ko: "?명꽣??,
    en: "Internet",
    ja: "?ㅳ꺍?욍꺖?띲긿??,
    zh: "雅믦걫營?,
  },
  mobile: { ko: "紐⑤컮??, en: "Mobile", ja: "?㏂깘?ㅳ꺂", zh: "燁삣뒯溫얍쨭" },
  ai: { ko: "?멸났吏??, en: "AI", ja: "AI", zh: "雅뷴램?븃꺗" },
  programming: {
    ko: "?꾨줈洹몃옒諛?,
    en: "Programming",
    ja: "?쀣꺆?겹꺀?잆꺍??,
    zh: "煐뽫쮮",
  },
  cybersecurity: {
    ko: "?ъ씠踰꾨낫??,
    en: "Cybersecurity",
    ja: "?듐궎?먦꺖?삠궘?γ꺁?녴궍",
    zh: "營묊퍥若됧뀲",
  },
  database: {
    ko: "?곗씠?곕쿋?댁뒪",
    en: "Database",
    ja: "?뉎꺖?욍깧?쇈궧",
    zh: "?경뜮佯?,
  },
  robotics: {
    ko: "濡쒕큸怨듯븰",
    en: "Robotics",
    ja: "??깭?껁깉藥ε?",
    zh: "?뷴솳雅뷴?",
  },
  blockchain: {
    ko: "釉붾줉泥댁씤",
    en: "Blockchain",
    ja: "?뽧꺆?껁궚?곥궒?쇈꺍",
    zh: "?뷴쓼??,
  },
  cloud: { ko: "?대씪?곕뱶", en: "Cloud", ja: "??꺀?╉깋", zh: "雅묋?嶸? },
  social_media: {
    ko: "?뚯뀥誘몃뵒??,
    en: "Social Media",
    ja: "?썬꺖?룔깵?ャ깳?뉎궍??,
    zh: "鹽얌벡揶믢퐪",
  },
  gaming: { ko: "寃뚯엫", en: "Gaming", ja: "?꿔꺖??, zh: "歷멩닆" },
  innovation: {
    ko: "?곸떊",
    en: "Innovation",
    ja: "?ㅳ깕?쇻꺖?룔깾??,
    zh: "?쎿뼭",
  },

  // Health
  exercise: { ko: "?대룞", en: "Exercise", ja: "?뗥땿", zh: "瓦먨뒯" },
  medicine: { ko: "?섑븰", en: "Medicine", ja: "?삣?", zh: "?삣?" },
  nutrition: { ko: "?곸뼇", en: "Nutrition", ja: "?꾦쨰", zh: "?ε끇" },
  mental_health: {
    ko: "?뺤떊嫄닿컯",
    en: "Mental Health",
    ja: "?▲꺍?욍꺂?섅꺂??,
    zh: "恙껆릤?ε볜",
  },
  hospital: { ko: "蹂묒썝", en: "Hospital", ja: "?낂솫", zh: "?삯솫" },
  fitness: { ko: "?쇳듃?덉뒪", en: "Fitness", ja: "?뺛궍?껁깉?띲궧", zh: "?θ벴" },
  wellness: { ko: "?곕튃", en: "Wellness", ja: "?╉궒?ャ깓??, zh: "?ε볜" },
  therapy: { ko: "移섎즺", en: "Therapy", ja: "亦사셽", zh: "亦사뼏" },
  prevention: { ko: "?덈갑", en: "Prevention", ja: "雅덆삻", zh: "窯꾦삻" },
  symptoms: { ko: "利앹긽", en: "Symptoms", ja: "?뉒듁", zh: "?뉒듁" },
  treatment: { ko: "移섎즺踰?, en: "Treatment", ja: "亦사셽力?, zh: "亦사뼏?방퀡" },
  pharmacy: { ko: "?쎄뎅", en: "Pharmacy", ja: "?у?", zh: "??댛" },
  rehabilitation: {
    ko: "?ы솢",
    en: "Rehabilitation",
    ja: "?ゃ깗?볝꺁?녴꺖?룔깾??,
    zh: "佯룟쨳",
  },
  medical_equipment: {
    ko: "?섎즺湲곌린",
    en: "Medical Equipment",
    ja: "?사셽艅잌솳",
    zh: "?사뼏溫얍쨭",
  },

  // Sports
  football: { ko: "異뺢뎄", en: "Football", ja: "?듐긿?ャ꺖", zh: "擁녕릡" },
  basketball: {
    ko: "?띻뎄",
    en: "Basketball",
    ja: "?먦궧?긱긿?덀깭?쇈꺂",
    zh: "影?릡",
  },
  swimming: { ko: "?섏쁺", en: "Swimming", ja: "麗닸납", zh: "歷멩납" },
  running: { ko: "?щ━湲?, en: "Running", ja: "?⒲꺍?뗣꺍??, zh: "瓮묉?" },
  equipment: { ko: "?λ퉬", en: "Equipment", ja: "艅잌솳", zh: "溫얍쨭" },
  olympics: { ko: "?щ┝??, en: "Olympics", ja: "?ゃ꺁?녈깞?껁궚", zh: "也θ퓧鴉? },
  tennis: { ko: "?뚮땲??, en: "Tennis", ja: "?녴깑??, zh: "營묊릡" },
  baseball: { ko: "?쇨뎄", en: "Baseball", ja: "?롧릡", zh: "汝믥릡" },
  golf: { ko: "怨⑦봽", en: "Golf", ja: "?담꺂??, zh: "遙섇컮鸚? },
  martial_arts: { ko: "臾댁닠", en: "Martial Arts", ja: "閭?죹", zh: "閭?쑐" },
  team_sports: {
    ko: "??ㅽ룷痢?,
    en: "Team Sports",
    ja: "?곥꺖?졼궧?앫꺖??,
    zh: "??삜瓦먨뒯",
  },
  individual_sports: {
    ko: "媛쒖씤?ㅽ룷痢?,
    en: "Individual Sports",
    ja: "?뗤볶?밤깮?쇈깂",
    zh: "訝や볶瓦먨뒯",
  },
  coaching: { ko: "肄붿묶", en: "Coaching", ja: "?녈꺖?곥꺍??, zh: "?숂퍌" },
  competition: { ko: "寃쎌웳", en: "Competition", ja: "塋뜸틝", zh: "塋욂틝" },

  // Entertainment
  movie: { ko: "?곹솕", en: "Movie", ja: "?좂뵽", zh: "?드쉽" },
  music: { ko: "?뚯븙", en: "Music", ja: "?녔?", zh: "?념퉸" },
  game: { ko: "寃뚯엫", en: "Game", ja: "?꿔꺖??, zh: "歷멩닆" },
  book: { ko: "梨?, en: "Book", ja: "??, zh: "阿?콑" },
  art: { ko: "?덉닠", en: "Art", ja: "?멱죹", zh: "?뷸쑐" },
  theater: { ko: "?곌레", en: "Theater", ja: "轢붷뒊", zh: "?뤷돢" },
  concert: { ko: "肄섏꽌??, en: "Concert", ja: "?녈꺍?듐꺖??, zh: "?념퉸鴉? },
  festival: { ko: "異뺤젣", en: "Festival", ja: "曄?굤", zh: "?귛틙" },
  celebrity: { ko: "?곗삁??, en: "Celebrity", ja: "?됧릫雅?, zh: "?띴볶" },
  tv_show: { ko: "TV??, en: "TV Show", ja: "?녴꺃?볡빁永?, zh: "?듣쭍?귞쎅" },
  comedy: { ko: "肄붾???, en: "Comedy", ja: "?녈깳?뉎궍", zh: "?쒎돢" },
  drama: { ko: "?쒕씪留?, en: "Drama", ja: "?됥꺀??, zh: "?뤷돢" },
  animation: {
    ko: "?좊땲硫붿씠??,
    en: "Animation",
    ja: "?㏂깑?▲꺖?룔깾??,
    zh: "?①뵽",
  },
  photography: { ko: "?ъ쭊", en: "Photography", ja: "?숂쐿", zh: "?꾢쉽" },

  // Culture
  tradition: { ko: "?꾪넻", en: "Tradition", ja: "鴉앯뎠", zh: "鴉좂퍨" },
  customs: { ko: "愿??, en: "Customs", ja: "玲믤뀭", zh: "阿졽퓱" },
  language: { ko: "?몄뼱", en: "Language", ja: "鼇沃?, zh: "瑥??" },
  religion: { ko: "醫낃탳", en: "Religion", ja: "若쀦븰", zh: "若쀦븰" },
  heritage: { ko: "?좎궛", en: "Heritage", ja: "?븀뵣", zh: "?쀤벨" },
  ceremony: { ko: "?섏떇", en: "Ceremony", ja: "?凉?, zh: "餓ゅ폀" },
  ritual: { ko: "?섎?", en: "Ritual", ja: "?鹽?, zh: "餓ゅ폀" },
  folklore: { ko: "誘쇱냽", en: "Folklore", ja: "麗묇퓱", zh: "麗묇퓱" },
  mythology: { ko: "?좏솕", en: "Mythology", ja: "曄욆㈀", zh: "曄욆캕" },
  arts_crafts: { ko: "怨듭삁", en: "Arts & Crafts", ja: "藥θ듃", zh: "藥θ돷" },
  etiquette: { ko: "?덉젅", en: "Etiquette", ja: "?ⓦ긽?긱긿??, zh: "鹽쇌빽" },
  national_identity: {
    ko: "援???뺤껜??,
    en: "National Identity",
    ja: "?썸컩??,
    zh: "?썲?溫ㅵ릪",
  },

  // Other
  hobbies: { ko: "痍⑤?", en: "Hobbies", ja: "擁ｅ뫑", zh: "?긷?" },
  finance_personal: {
    ko: "媛쒖씤湲덉쑖",
    en: "Personal Finance",
    ja: "?뗤볶?묋엻",
    zh: "訝や볶?녻뇨",
  },
  legal: { ko: "踰뺣쪧", en: "Legal", ja: "力뺝풃", zh: "力뺝풃" },
  government: { ko: "?뺣?", en: "Government", ja: "?욕틵", zh: "?욕틵" },
  politics: { ko: "?뺤튂", en: "Politics", ja: "?욘꼇", zh: "?욘꼇" },
  media: { ko: "誘몃뵒??, en: "Media", ja: "?▲깈?ｃ궋", zh: "揶믢퐪" },
  community: {
    ko: "而ㅻ??덊떚",
    en: "Community",
    ja: "?녈깱?γ깑?녴궍",
    zh: "鹽얍뙷",
  },
  volunteering: {
    ko: "?먯썝遊됱궗",
    en: "Volunteering",
    ja: "?쒌꺀?녈깇?ｃ궋",
    zh: "恙쀦꽴?띶뒦",
  },
  charity: { ko: "?먯꽑", en: "Charity", ja: "?덂뻹", zh: "?덂뻹" },
  social_issues: {
    ko: "?ы쉶臾몄젣",
    en: "Social Issues",
    ja: "鹽얌폏?뤻죱",
    zh: "鹽얌폏??쥦",
  },
  philosophy_life: {
    ko: "?몄깮泥좏븰",
    en: "Life Philosophy",
    ja: "雅븀뵟?꿨?",
    zh: "雅븀뵟?꿨?",
  },
  spirituality: {
    ko: "?곸꽦",
    en: "Spirituality",
    ja: "?밤깞?ゃ긽?γ궋?ゃ깇??,
    zh: "暎양쪥??,
  },
  creativity: { ko: "李쎌쓽??, en: "Creativity", ja: "?들졿?, zh: "?쏃졾뒟" },
  science: { ko: "怨쇳븰", en: "Science", ja: "燁묈?", zh: "燁묈?" },
  literature: { ko: "臾명븰", en: "Literature", ja: "?뉐?", zh: "?뉐?" },
  history: { ko: "??궗", en: "History", ja: "閭닷뤁", zh: "?녶뤁" },
  mathematics: { ko: "?섑븰", en: "Mathematics", ja: "?겼?", zh: "?겼?" },
  research: { ko: "?곌뎄", en: "Research", ja: "?붺㈅", zh: "?붺㈅" },
  philosophy: { ko: "泥좏븰", en: "Philosophy", ja: "?꿨?", zh: "?꿨?" },
  psychology: { ko: "?щ━??, en: "Psychology", ja: "恙껆릤耶?, zh: "恙껆릤耶? },
  sociology: { ko: "?ы쉶??, en: "Sociology", ja: "鹽얌폏耶?, zh: "鹽얌폏耶? },
  linguistics: { ko: "?몄뼱??, en: "Linguistics", ja: "鼇沃욃?", zh: "瑥??耶? },
  thesis: { ko: "?쇰Ц", en: "Thesis", ja: "獄뽪뻼", zh: "溫뷸뻼" },

  // ?명솚?깆쓣 ?꾪븳 異붽? 留ㅽ븨
  other: { ko: "湲고?", en: "Other", ja: "?앫겗餓?, zh: "?뜸퍟" },
  subject: { ko: "怨쇰ぉ", en: "Subject", ja: "燁묊쎅", zh: "耶?쭛" },
  greeting: { ko: "?몄궗", en: "Greeting", ja: "?ⓩ떢", zh: "??? },
  emotion: { ko: "媛먯젙", en: "Emotion", ja: "?잍깄", zh: "?끿빽" },
};

// 臾몃쾿 ?⑹뼱 踰덉뿭 ?뚯씠釉?const grammarTranslations = {
  ko: {
    // ?곸뼱 臾몃쾿 ?⑹뼱
    "simple present tense": "?꾩옱 ?쒖젣",
    "present tense": "?꾩옱 ?쒖젣",
    "simple past tense": "怨쇨굅 ?쒖젣",
    "past tense": "怨쇨굅 ?쒖젣",
    "simple future tense": "誘몃옒 ?쒖젣",
    "future tense": "誘몃옒 ?쒖젣",
    "present continuous": "?꾩옱 吏꾪뻾??,
    "past continuous": "怨쇨굅 吏꾪뻾??,
    "future continuous": "誘몃옒 吏꾪뻾??,
    "present perfect": "?꾩옱 ?꾨즺??,
    "past perfect": "怨쇨굅 ?꾨즺??,
    "future perfect": "誘몃옒 ?꾨즺??,
    "present perfect continuous": "?꾩옱 ?꾨즺 吏꾪뻾??,
    "past perfect continuous": "怨쇨굅 ?꾨즺 吏꾪뻾??,
    "future perfect continuous": "誘몃옒 ?꾨즺 吏꾪뻾??,
    "modal verb": "議곕룞??,
    "auxiliary verb": "議곕룞??,
    "passive voice": "?섎룞??,
    "active voice": "?λ룞??,
    conditional: "議곌굔臾?,
    subjunctive: "媛?뺣쾿",
    imperative: "紐낅졊臾?,
    gerund: "?숇챸??,
    infinitive: "遺?뺤궗",
    participle: "遺꾩궗",
    "present participle": "?꾩옱遺꾩궗",
    "past participle": "怨쇨굅遺꾩궗",
    comparative: "鍮꾧탳湲?,
    superlative: "理쒖긽湲?,
    "countable noun": "媛?곕챸??,
    "uncountable noun": "遺덇??곕챸??,
    plural: "蹂듭닔??,
    singular: "?⑥닔??,
    article: "愿??,
    "definite article": "?뺢???,
    "indefinite article": "遺?뺢???,
    preposition: "?꾩튂??,
    conjunction: "?묒냽??,
    adverb: "遺??,
    adjective: "?뺤슜??,
    pronoun: "?紐낆궗",
    "relative clause": "愿怨꾩젅",
    "subordinate clause": "醫낆냽??,
    "main clause": "二쇱젅",

    // ?쇰낯??臾몃쾿 ?⑹뼱
    hiragana: "?덈씪媛??,
    katakana: "媛?移대굹",
    kanji: "?쒖옄",
    keigo: "寃쎌뼱",
    sonkeigo: "議닿꼍??,
    kenjougo: "寃몄뼇??,
    teineigo: "?뺤쨷??,
    "masu form": "留덉뒪??,
    "te form": "?뚰삎",
    "potential form": "媛?ν삎",
    "causative form": "?ъ뿭??,
    "passive form": "?섎룞??,
    "volitional form": "?섏???,
    "conditional form": "議곌굔??,
    "imperative form": "紐낅졊??,
    "negative form": "遺?뺥삎",
    "past tense": "怨쇨굅??,
    "present tense": "?꾩옱??,
    particle: "議곗궗",
    "wa particle": "??? 議곗궗",
    "ga particle": "媛/??議곗궗",
    "wo particle": "瑜???議곗궗",
    "ni particle": "??議곗궗",
    "de particle": "?먯꽌 議곗궗",
    "to particle": "?/怨?議곗궗",

    // 以묎뎅??臾몃쾿 ?⑹뼱
    pinyin: "蹂묒쓬",
    tone: "?깆“",
    "first tone": "1??,
    "second tone": "2??,
    "third tone": "3??,
    "fourth tone": "4??,
    "neutral tone": "寃쎌꽦",
    "measure word": "?묒궗",
    classifier: "?묒궗",
    "sentence final particle": "臾몃쭚??,
    "aspect marker": "???쒖?",
    "perfective aspect": "?꾨즺??,
    "progressive aspect": "吏꾪뻾??,
    "experiential aspect": "寃쏀뿕??,
  },
  en: {
    // 湲곕낯?곸쑝濡??곸뼱??洹몃?濡??좎?
    "simple present tense": "simple present tense",
    "present tense": "present tense",
    "simple past tense": "simple past tense",
    "past tense": "past tense",
    // ... ?섎㉧吏??洹몃?濡?  },
  ja: {
    // ?곸뼱 臾몃쾿 ?⑹뼱瑜??쇰낯?대줈
    "simple present tense": "?얍쑉?귛댍",
    "present tense": "?얍쑉?귛댍",
    "simple past tense": "?롥렮?귛댍",
    "past tense": "?롥렮?귛댍",
    "simple future tense": "?ゆ씎?귛댍",
    "future tense": "?ゆ씎?귛댍",
    "present continuous": "?얍쑉?꿱죱壤?,
    "past continuous": "?롥렮?꿱죱壤?,
    "future continuous": "?ゆ씎?꿱죱壤?,
    "present perfect": "?얍쑉若뚥틙壤?,
    "past perfect": "?롥렮若뚥틙壤?,
    "future perfect": "?ゆ씎若뚥틙壤?,
    "modal verb": "?⒴땿屋?,
    "auxiliary verb": "?⒴땿屋?,
    "passive voice": "?쀥땿??,
    "active voice": "?썲땿??,
    conditional: "?▽뻑??,
    subjunctive: "餓?츣力?,
    imperative: "?썰빱??,
    gerund: "?뺝릫屋?,
    infinitive: "訝띶츣屋?,
    participle: "?녻찠",
    "present participle": "?얍쑉?녻찠",
    "past participle": "?롥렮?녻찠",
    comparative: "驪붻펱榮?,
    superlative: "?訝딁킎",
    "countable noun": "??츞?띹찠",
    "uncountable noun": "訝띶룾嶸쀥릫屋?,
    plural: "筽뉑빊壤?,
    singular: "?섉빊壤?,
    article: "?좄찠",
    "definite article": "若싧넗屋?,
    "indefinite article": "訝띶츣?좄찠",
    preposition: "?띸쉰屋?,
    conjunction: "?η텥屋?,
    adverb: "??찠",
    adjective: "壤℡?屋?,
    pronoun: "餓ｅ릫屋?,

    // ?쇰낯??臾몃쾿 ?⑹뼱??洹몃?濡?    hiragana: "?꿔굢?뚣겒",
    katakana: "?ャ궭?ャ깏",
    kanji: "轢℡춻",
    keigo: "?ц첑",
    "masu form": "?얇걲壤?,
    "te form": "??숱",
    particle: "?⑵찠",
  },
  zh: {
    // ?곸뼱 臾몃쾿 ?⑹뼱瑜?以묎뎅?대줈
    "simple present tense": "訝?х렟?ⓩ뿶",
    "present tense": "?겼쑉??,
    "simple past tense": "訝?ц퓝?삥뿶",
    "past tense": "瓦뉐렮??,
    "simple future tense": "訝?у컛?ζ뿶",
    "future tense": "弱녷씎??,
    "present continuous": "?겼쑉瓦쏂죱??,
    "past continuous": "瓦뉐렮瓦쏂죱??,
    "future continuous": "弱녷씎瓦쏂죱??,
    "present perfect": "?겼쑉若뚧닇??,
    "past perfect": "瓦뉐렮若뚧닇??,
    "future perfect": "弱녷씎若뚧닇??,
    "modal verb": "?끾곩뒯瑥?,
    "auxiliary verb": "?⒴뒯瑥?,
    "passive voice": "熬ュ뒯瑥??,
    "active voice": "訝삣뒯瑥??,
    conditional: "?▽뻑??,
    subjunctive: "?싨떉瑥?컮",
    imperative: "曄덁슴??,
    gerund: "?ⓨ릫瑥?,
    infinitive: "訝띶츣凉?,
    participle: "?녻칾",
    "present participle": "?겼쑉?녻칾",
    "past participle": "瓦뉐렮?녻칾",
    comparative: "驪붻푵瀛?,
    superlative: "?遙섊벨",
    "countable noun": "??빊?띹칾",
    "uncountable noun": "訝띶룾?겼릫瑥?,
    plural: "鸚띷빊",
    singular: "?뺞빊",
    article: "?좄칾",
    "definite article": "若싧넗瑥?,
    "indefinite article": "訝띶츣?좄칾",
    preposition: "餓뗨칾",
    conjunction: "瓦욆칾",
    adverb: "??칾",
    adjective: "壤℡?瑥?,
    pronoun: "餓ｈ칾",

    // 以묎뎅??臾몃쾿 ?⑹뼱??洹몃?濡?    pinyin: "?쇤윹",
    tone: "鶯계컘",
    "measure word": "?뤺칾",
    classifier: "?뤺칾",
  },
};

// ?ㅺ뎅??踰덉뿭 ?띿뒪??媛?몄삤湲??⑥닔
function getTranslatedText(key) {
  // 理쒖떊 ?섍꼍 ?몄뼱 媛?몄삤湲?  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 1. ?섏씠吏 踰덉뿭?먯꽌 癒쇱? ?뺤씤
  if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
    return pageTranslations[currentLang][key];
  }

  // 2. ?꾨찓??踰덉뿭?먯꽌 ?뺤씤
  if (domainTranslations[key] && domainTranslations[key][currentLang]) {
    return domainTranslations[key][currentLang];
  }

  // 3. 移댄뀒怨좊━ 踰덉뿭?먯꽌 ?뺤씤
  if (categoryTranslations[key] && categoryTranslations[key][currentLang]) {
    return categoryTranslations[key][currentLang];
  }

  // 4. ?꾩뿭 踰덉뿭 ?쒖뒪???ъ슜 (language-utils.js?먯꽌 濡쒕뱶)
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 5. ?곸뼱 ?대갚
  if (pageTranslations.en && pageTranslations.en[key]) {
    return pageTranslations.en[key];
  }

  if (domainTranslations[key] && domainTranslations[key].en) {
    return domainTranslations[key].en;
  }

  if (categoryTranslations[key] && categoryTranslations[key].en) {
    return categoryTranslations[key].en;
  }

  // 6. ?먮낯 ??諛섑솚
  return key;
}

// ?꾨찓??踰덉뿭 ?⑥닔 (媛쒖꽑??
function translateDomainKey(domainKey, lang = null) {
  const currentLang =
    lang || localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 1. 濡쒖뺄 ?꾨찓??踰덉뿭?먯꽌 ?뺤씤
  if (
    domainTranslations[domainKey] &&
    domainTranslations[domainKey][currentLang]
  ) {
    return domainTranslations[domainKey][currentLang];
  }

  // 2. ?꾩뿭 踰덉뿭 ?쒖뒪???뺤씤
  if (typeof window.translateDomainKey === "function") {
    const result = window.translateDomainKey(domainKey, lang);
    if (result !== domainKey) return result;
  }

  // 3. ?꾩뿭 踰덉뿭 媛앹껜 ?뺤씤
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][domainKey]
  ) {
    return window.translations[currentLang][domainKey];
  }

  // 4. ?곸뼱 ?대갚
  if (domainTranslations[domainKey] && domainTranslations[domainKey].en) {
    return domainTranslations[domainKey].en;
  }

  // 5. ?먮낯 ??諛섑솚
  return domainKey;
}

// 移댄뀒怨좊━ 踰덉뿭 ?⑥닔 (媛쒖꽑??
function translateCategoryKey(categoryKey, lang = null) {
  const currentLang =
    lang || localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 1. 濡쒖뺄 移댄뀒怨좊━ 踰덉뿭?먯꽌 ?뺤씤
  if (
    categoryTranslations[categoryKey] &&
    categoryTranslations[categoryKey][currentLang]
  ) {
    return categoryTranslations[categoryKey][currentLang];
  }

  // 2. ?꾩뿭 踰덉뿭 ?쒖뒪???뺤씤
  if (typeof window.translateCategoryKey === "function") {
    const result = window.translateCategoryKey(categoryKey, lang);
    if (result !== categoryKey) return result;
  }

  // 3. ?꾩뿭 踰덉뿭 媛앹껜 ?뺤씤
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][categoryKey]
  ) {
    return window.translations[currentLang][categoryKey];
  }

  // 4. ?곸뼱 ?대갚
  if (
    categoryTranslations[categoryKey] &&
    categoryTranslations[categoryKey].en
  ) {
    return categoryTranslations[categoryKey].en;
  }

  // 5. ?먮낯 ??諛섑솚
  return categoryKey;
}

// 臾몃쾿 ?ㅻ챸???섍꼍 ?몄뼱濡?踰덉뿭?섎뒗 ?⑥닔
function translateGrammarNote(grammarNote) {
  if (!grammarNote || !userLanguage) return grammarNote;

  const translations = grammarTranslations[userLanguage];
  if (!translations) return grammarNote;

  // ?뚮Ц?먮줈 蹂?섑빐??留ㅼ묶 ?쒕룄
  const lowerNote = grammarNote.toLowerCase();

  // ?뺥솗???쇱튂?섎뒗 踰덉뿭???덈뒗吏 ?뺤씤
  if (translations[lowerNote]) {
    return translations[lowerNote];
  }

  // 遺遺??쇱튂 ?쒕룄 (??湲??⑹뼱遺???뺤씤)
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (lowerNote.includes(key)) {
      return grammarNote.replace(new RegExp(key, "gi"), translations[key]);
    }
  }

  // 踰덉뿭???놁쑝硫??먮낯 諛섑솚
  return grammarNote;
}

// ?몄뼱 ?대쫫 媛?몄삤湲?(?섍꼍 ?ㅼ젙 ?몄뼱??留욊쾶)
function getLanguageName(langCode) {
  const languageNames = {
    ko: {
      korean: "?쒓뎅??,
      english: "?곸뼱",
      japanese: "?쇰낯??,
      chinese: "以묎뎅??,
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
    },
    ja: {
      korean: "?볟쎖沃?,
      english: "?김첑",
      japanese: "?ζ쑍沃?,
      chinese: "訝?쎖沃?,
    },
    zh: {
      korean: "?⑵?",
      english: "?김?",
      japanese: "?θ?",
      chinese: "訝?뻼",
    },
  };

  return (
    languageNames[userLanguage]?.[langCode] ||
    languageNames.en[langCode] ||
    langCode
  );
}

// 媛쒕뀗 移대뱶 ?앹꽦 ?⑥닔 (?뺤옣??援ъ“ 吏??諛??붾쾭源?媛쒖꽑)
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  // ?덈줈??援ъ“? 湲곗〈 援ъ“ 紐⑤몢 吏??  const sourceExpression = concept.expressions?.[sourceLanguage] || {};
  const targetExpression = concept.expressions?.[targetLanguage] || {};

  // 鍮??쒗쁽??寃쎌슦 嫄대꼫?곌린
  if (!sourceExpression.word || !targetExpression.word) {
    return "";
  }

  // concept_info 媛?몄삤湲?(??援ъ“ ?곗꽑, 湲곗〈 援ъ“ fallback)
  const conceptInfo = concept.concept_info || {
    domain: concept.domain || "湲고?",
    category: concept.category || "?쇰컲",
    unicode_emoji: concept.emoji || concept.unicode_emoji || "?뱷",
    color_theme: concept.color_theme || "#4B63AC",
  };

  // ?됱긽 ?뚮쭏 媛?몄삤湲?(?덉쟾??fallback)
  const colorTheme =
    conceptInfo.color_theme || concept.color_theme || "#4B63AC";

  // ?대え吏 媛?몄삤湲?(?ㅼ젣 ?곗씠??援ъ“??留욊쾶 ?곗꽑?쒖쐞 議곗젙)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    concept.emoji ||
    concept.unicode_emoji ||
    "?뱷";

  // ?덈Ц 媛?몄삤湲?(concepts 而щ젆?섏쓽 ????덈Ц ?ъ슜)
  let example = null;

  // 1. representative_example ?뺤씤 (??援ъ“? 湲곗〈 援ъ“ 紐⑤몢 吏??
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // ?덈줈??援ъ“: 吏곸젒 ?몄뼱蹂??띿뒪??    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      example = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
      console.log("??移대뱶: ?덈줈??????덈Ц 援ъ“ ?ъ슜");
    }
    // 湲곗〈 援ъ“: translations 媛앹껜
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
      console.log("??移대뱶: 湲곗〈 ????덈Ц 援ъ“ ?ъ슜");
    }
  }
  // 2. featured_examples ?뺤씤 (湲곗〈 諛⑹떇)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    }
  }
  // 3. core_examples ?뺤씤 (湲곗〈 諛⑹떇 - ?섏쐞 ?명솚??
  else if (concept.core_examples && concept.core_examples.length > 0) {
    const firstExample = concept.core_examples[0];
    // 踰덉뿭 援ъ“ ?뺤씤
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    } else {
      // 吏곸젒 ?몄뼱 ?띿꽦???덈뒗 寃쎌슦
      example = {
        source: firstExample[sourceLanguage] || "",
        target: firstExample[targetLanguage] || "",
      };
    }
  }
  // 4. 湲곗〈 examples ?뺤씤 (?섏쐞 ?명솚??
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
  }

  // 媛쒕뀗 ID ?앹꽦 (document ID ?곗꽑 ?ъ슜)
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
            title="遺곷쭏??
          >
            <i class="fas fa-bookmark text-gray-400"></i>
          </button>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${translateDomainKey(conceptInfo.domain)}/${translateCategoryKey(
    conceptInfo.category
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
          <i class="fas fa-language mr-1"></i> ${sourceLanguage} ??${targetLanguage}
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

// ?몄뼱 ?꾪솚 ?⑥닔
// ?몄뼱 ?쒖꽌 諛붽씀湲??⑥닔??怨듭쑀 紐⑤뱢濡??泥대맖

// ?좎쭨 ?щ㎎???⑥닔
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

// 寃??諛??꾪꽣留??⑥닔 (怨듭쑀 紐⑤뱢 ?ъ슜)
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  // ?꾪꽣 怨듭쑀 紐⑤뱢???ъ슜?섏뿬 ?꾩옱 ?꾪꽣 媛믩뱾 媛?몄삤湲?  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  console.log("寃??諛??꾪꽣留??쒖옉:", {
    filters,
    totalConcepts: allConcepts.length,
  });

  // ?꾪꽣 怨듭쑀 紐⑤뱢???ъ슜?섏뿬 ?꾪꽣留?諛??뺣젹 ?섑뻾
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  console.log("?꾪꽣留??꾨즺:", {
    filteredCount: filteredConcepts.length,
  });

  // ?쒖떆
  displayConceptList();
}

// ?뺣젹 ?⑥닔??怨듭쑀 紐⑤뱢濡??泥대맖

// 媛쒕뀗 紐⑸줉 ?쒖떆 ?⑥닔 (?붾쾭源?媛쒖꽑)
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  if (!conceptList) {
    console.error("??concept-list ?붿냼瑜?李얠쓣 ???놁뒿?덈떎!");
    return;
  }

  // ?쒖떆??媛쒕뀗 ?좏깮
  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  // 媛쒕뀗 ???낅뜲?댄듃
  if (conceptCount) {
    conceptCount.textContent = filteredConcepts.length;
  }

  if (conceptsToShow.length === 0) {
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        ?쒖떆??媛쒕뀗???놁뒿?덈떎. ?ㅻⅨ ?몄뼱 議고빀?대굹 ?꾪꽣瑜??쒕룄?대낫?몄슂.
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    return;
  }

  // 媛쒕뀗 移대뱶 ?앹꽦 諛??쒖떆
  const cardHTMLs = conceptsToShow
    .map((concept) => createConceptCard(concept))
    .filter((html) => html); // 鍮?HTML ?쒓굅

  // HTML ?쎌엯
  conceptList.innerHTML = cardHTMLs.join("");

  // 遺곷쭏??UI ?낅뜲?댄듃
  updateBookmarkUI();

  // ??蹂닿린 踰꾪듉 ?쒖떆/?④?
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }
}

// ??蹂닿린 踰꾪듉 泥섎━
function handleLoadMore() {
  displayCount += 12;
  displayConceptList();
}

// 紐⑤떖 濡쒕뱶 ?⑥닔
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
    console.error("紐⑤떖 濡쒕뱶 以??ㅻ쪟 諛쒖깮:", error);
  }
}

// ?ъ슜??UI ?낅뜲?댄듃
async function updateUsageUI() {
  try {
    if (!currentUser) return;

    // ?ъ슜??臾몄꽌 媛?몄삤湲?    const userRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const conceptCount = userData.conceptCount || 0;
    const maxConcepts = userData.maxConcepts || 100;

    // UI ?낅뜲?댄듃
    const usageText = document.getElementById("concept-usage-text");
    const usageBar = document.getElementById("concept-usage-bar");

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
    }

    if (usageBar) {
      const usagePercentage = (conceptCount / maxConcepts) * 100;
      usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

      // ?됱긽 ?낅뜲?댄듃
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
    console.error("?ъ슜???낅뜲?댄듃 以??ㅻ쪟 諛쒖깮:", error);
  }
}

// 媛쒕뀗 ?곗씠??媛?몄삤湲?(ID ?ы븿 諛??붾쾭源?媛쒖꽑)
async function fetchAndDisplayConcepts() {
  try {
    if (!currentUser) return;

    // 遺꾨━??而щ젆?섍낵 ?듯빀 而щ젆??紐⑤몢?먯꽌 媛쒕뀗 媛?몄삤湲?    allConcepts = [];
    const conceptsRef = collection(db, "concepts");

    // 紐⑤뱺 concepts 而щ젆???곗씠??議고쉶 (遺꾨━??而щ젆?섍낵 湲곗〈 援ъ“ 紐⑤몢 ?ы븿)
    console.log("?뱴 concepts 而щ젆?섏뿉???곗씠??濡쒕뱶 ?쒖옉...");

    try {
      // ?꾩껜 議고쉶 ???꾪꽣留?(???덉쟾??諛⑹떇)
      const querySnapshot = await getDocs(conceptsRef);
      console.log(`?뱤 concepts 而щ젆?섏뿉??${querySnapshot.size}媛?臾몄꽌 諛쒓껄`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI ?앹꽦 媛쒕뀗 ?쒖쇅?섍퀬 紐⑤뱺 媛쒕뀗 ?ы븿 (遺꾨━??而щ젆?섍낵 湲곗〈 援ъ“ 紐⑤몢)
        if (!data.isAIGenerated) {
          console.log(`??媛쒕뀗 異붽?: ${doc.id}`, {
            hasMetadata: !!data.metadata,
            hasCreatedAt: !!data.created_at,
            hasExpressions: !!data.expressions,
            expressionKeys: Object.keys(data.expressions || {}),
          });
          allConcepts.push(data);
        } else {
          console.log(`??툘 AI ?앹꽦 媛쒕뀗 ?쒖쇅: ${doc.id}`);
        }
      });

      console.log(`?뱥 珥?濡쒕뱶??媛쒕뀗 ?? ${allConcepts.length}媛?);
    } catch (queryError) {
      console.error("concepts 而щ젆??議고쉶 ?ㅽ뙣:", queryError);
      allConcepts = [];
    }

    // JavaScript?먯꽌 ?뺣젹 (遺꾨━??而щ젆?섍낵 ?듯빀 而щ젆??紐⑤몢 吏??
    allConcepts.sort((a, b) => {
      const getTime = (concept) => {
        // 遺꾨━??而щ젆?? metadata.created_at ?곗꽑 ?뺤씤
        if (concept.metadata?.created_at) {
          return concept.metadata.created_at.toDate
            ? concept.metadata.created_at.toDate().getTime()
            : new Date(concept.metadata.created_at).getTime();
        }
        // ?듯빀 而щ젆?? 理쒖긽???덈꺼 created_at ?뺤씤
        if (concept.created_at) {
          return concept.created_at.toDate
            ? concept.created_at.toDate().getTime()
            : new Date(concept.created_at).getTime();
        }
        // concept_info.created_at ?뺤씤
        if (concept.concept_info?.created_at) {
          return concept.concept_info.created_at.toDate
            ? concept.concept_info.created_at.toDate().getTime()
            : new Date(concept.concept_info.created_at).getTime();
        }
        // timestamp ?뺤씤 (???ㅻ옒???곗씠??
        if (concept.timestamp) {
          return concept.timestamp.toDate
            ? concept.timestamp.toDate().getTime()
            : new Date(concept.timestamp).getTime();
        }
        // ?쒓컙 ?뺣낫媛 ?놁쑝硫??꾩옱 ?쒓컙?쇰줈 媛꾩＜ (理쒖떊?쇰줈 ?쒖떆)
        return Date.now();
      };

      return getTime(b) - getTime(a); // ?대┝李⑥닚 ?뺣젹
    });

    // ?꾩뿭 蹂???낅뜲?댄듃 (?몄쭛 紐⑤떖?먯꽌 ?묎렐 媛?ν븯?꾨줉)
    window.allConcepts = allConcepts;

    // ?숈뒿 ?섏씠吏?먯꽌 ?ъ슜?????덈룄濡?sessionStorage?먮룄 ???    try {
      sessionStorage.setItem(
        "learningConcepts",
        JSON.stringify(allConcepts.slice(0, 100))
      ); // ?깅뒫???꾪빐 理쒕? 100媛?    } catch (error) {
      console.warn("?좑툘 sessionStorage ????ㅽ뙣:", error);
    }

    // ?꾩옱 ?꾪꽣濡?寃??諛??쒖떆
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      domainFilter: document.getElementById("domain-filter"),
      sortOption: document.getElementById("sort-option"),
    };

    handleSearch(elements);
  } catch (error) {
    console.error("??媛쒕뀗 ?곗씠??媛?몄삤湲??ㅻ쪟:", error);
    throw error;
  }
}

// 媛쒕뀗 ?곸꽭 蹂닿린 紐⑤떖 ?닿린 ?⑥닔 (?꾩뿭 ?⑥닔, ID 議고쉶 媛쒖꽑)
window.openConceptViewModal = async function (conceptId) {
  try {
    // ?ъ슜???몄뼱 ?ㅼ젙 ?낅뜲?댄듃 (AI ?⑥뼱?κ낵 ?숈씪?섍쾶)
    try {
      if (typeof getActiveLanguage === "function") {
        userLanguage = await getActiveLanguage();
      } else {
        console.warn(
          "getActiveLanguage ?⑥닔瑜?李얠쓣 ???놁뒿?덈떎. 湲곕낯媛믪쓣 ?ъ슜?⑸땲??"
        );
        userLanguage = "ko";
      }
    } catch (error) {
      console.error("?몄뼱 ?ㅼ젙 濡쒕뱶 ?ㅽ뙣:", error);
      userLanguage = "ko"; // 湲곕낯媛?    }

    // conceptUtils媛 ?뺤쓽?섏뼱 ?덈뒗吏 ?뺤씤
    if (!conceptUtils) {
      throw new Error("conceptUtils媛 ?뺤쓽?섏? ?딆븯?듬땲??");
    }

    // ?꾩옱 ?좏깮???몄뼱 ?ㅼ젙 媛?몄삤湲?    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    // 癒쇱? 硫붾え由ъ뿉??媛쒕뀗 李얘린 (鍮좊Ⅸ 寃??
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    // 硫붾え由ъ뿉??李얠? 紐삵뻽?쇰㈃ Firebase?먯꽌 議고쉶
    if (!conceptData) {
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
      } catch (error) {
        console.error("Firebase 議고쉶 ?ㅽ뙣:", error);

        // ID媛 word 議고빀 ?뺥깭??寃쎌슦 硫붾え由ъ뿉???ㅼ떆 寃??        if (conceptId.includes("_")) {
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
      console.error("媛쒕뀗??李얠쓣 ???놁뒿?덈떎. conceptId:", conceptId);
      alert("媛쒕뀗 ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎.");
      return;
    }

    const modal = document.getElementById("concept-view-modal");
    if (!modal) {
      throw new Error("concept-view-modal ?붿냼瑜?李얠쓣 ???놁뒿?덈떎.");
    }

    console.log("紐⑤떖 肄섑뀗痢?梨꾩슦湲??쒖옉...");
    // 紐⑤떖 肄섑뀗痢?梨꾩슦湲?(?몄뼱 ?ㅼ젙 ?꾨떖)
    fillConceptViewModal(conceptData, sourceLanguage, targetLanguage);

    console.log("紐⑤떖 ?쒖떆...");
    // 紐⑤떖 ?쒖떆 (CSS ?곗꽑?쒖쐞 臾몄젣 ?닿껐)
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // 媛뺤젣濡??쒖떆
    console.log("?뵇 紐⑤떖 ?쒖떆 ???곹깭:", {
      classList: Array.from(modal.classList),
      display: getComputedStyle(modal).display,
      visibility: getComputedStyle(modal).visibility,
    });

    // 紐⑤떖???쒖떆???꾩뿉 ?덈Ц 濡쒕뱶
    console.log("?뱰 紐⑤떖 ?쒖떆 ?꾨즺, ?덈Ц 濡쒕뱶 ?쒖옉...");
    await loadAndDisplayExamples(
      conceptData.id,
      sourceLanguage,
      targetLanguage
    );

    console.log("紐⑤떖 ?닿린 ?꾨즺");
  } catch (error) {
    console.error("媛쒕뀗 ?곸꽭 蹂닿린 紐⑤떖 ?닿린 以??ㅻ쪟 諛쒖깮:", error);
    console.error("Error stack:", error.stack);
    alert("媛쒕뀗 ?뺣낫瑜?遺덈윭?????놁뒿?덈떎: " + error.message);
  }
};

// 媛쒕뀗 ?곸꽭 蹂닿린 紐⑤떖 梨꾩슦湲?(遺꾨━??而щ젆??吏??
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  if (!conceptData) {
    console.error("媛쒕뀗 ?곗씠?곌? ?놁뒿?덈떎");
    return;
  }

  console.log("紐⑤떖 梨꾩슦湲?", conceptData);

  // 湲곕낯 ?뺣낫 ?ㅼ젙
  const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
  const targetExpression = conceptData.expressions?.[targetLanguage] || {};

  // ?쒕ぉ怨?湲곕낯 ?뺣낫
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

  // 媛쒕뀗 ?뺣낫
  const conceptInfo = conceptData.concept_info || {};

  // ?꾨찓??移댄뀒怨좊━ ?쒖떆
  const domainCategoryElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (domainCategoryElement) {
    const domain = conceptInfo.domain || conceptData.domain || "湲고?";
    const category = conceptInfo.category || conceptData.category || "?쇰컲";
    domainCategoryElement.textContent = `${translateDomainKey(
      domain
    )}/${translateCategoryKey(category)}`;
  }

  // ?대え吏? ?됱긽 (媛쒕뀗 移대뱶? ?숈씪???곗꽑?쒖쐞 ?곸슜)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "?뱷";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  const emojiElement = document.getElementById("concept-view-emoji");

  // ?붿냼瑜?李얠쓣 ???놁쓣 ??吏?????ъ떆??  if (!emojiElement) {
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

  // ?좎쭨 ?뺣낫 (遺꾨━??而щ젆??硫뷀??곗씠???곗꽑)
  const createdDate =
    conceptData.metadata?.created_at ||
    conceptData.created_at ||
    conceptData.timestamp;

  const dateElement = document.getElementById("concept-updated-at");
  if (dateElement && createdDate) {
    dateElement.textContent = formatDate(createdDate);
  }

  // ?몄뼱蹂??쒗쁽 梨꾩슦湲?  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);

  // 紐⑤떖 踰꾪듉 ?ㅼ젙
  setupModalButtons(conceptData);

  // 紐⑤떖 ???ㅺ뎅??踰덉뿭 ?곸슜 - AI ?⑥뼱?κ낵 ?숈씪??data-i18n 諛⑹떇 ?ъ슜
  setTimeout(() => {
    const modal = document.getElementById("concept-view-modal");

    if (modal) {
      // 紐⑤떖 ?대???data-i18n ?붿냼??踰덉뿭 (AI ?⑥뼱?κ낵 ?숈씪??諛⑹떇)
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

// 遺꾨━??而щ젆?섏뿉???덈Ц 濡쒕뱶 諛??쒖떆
async function loadAndDisplayExamples(
  conceptId,
  sourceLanguage,
  targetLanguage
) {
  try {
    // 蹂닿린 紐⑤떖 ?대???examples-container留?李얘린
    const viewModal = document.getElementById("concept-view-modal");
    const examplesContainer = viewModal
      ? viewModal.querySelector("#examples-container")
      : null;
    if (!examplesContainer) {
      console.error("??蹂닿린 紐⑤떖 ??examples-container瑜?李얠쓣 ???놁뒿?덈떎");
      return;
    }

    let examplesHTML = "";
    const allExamples = [];

    // 1. ?꾩옱 媛쒕뀗?먯꽌 representative_example留??ъ슜 (以묐났 諛⑹?)
    const currentConcept = allConcepts.find(
      (c) => c.id === conceptId || c._id === conceptId
    );

    if (currentConcept?.representative_example) {
      console.log("????덈Ц 諛쒓껄:", currentConcept.representative_example);

      const repExample = currentConcept.representative_example;

      // ?덈줈??援ъ“: 吏곸젒 ?몄뼱蹂??띿뒪??(translations ?놁쓬)
      if (repExample[sourceLanguage] && repExample[targetLanguage]) {
        console.log("?뵇 ?덈줈??????덈Ц 援ъ“ (吏곸젒 ?몄뼱蹂?:", repExample);

        const sourceText = repExample[sourceLanguage];
        const targetText = repExample[targetLanguage];

        console.log("?뱷 異붿텧???덈Ц (??援ъ“):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "????덈Ц",
            isRepresentative: true,
          });
          console.log("??????덈Ц??allExamples??異붽???(??援ъ“)");
        }
      }
      // 湲곗〈 援ъ“: translations 媛앹껜 ?ы븿
      else if (repExample.translations) {
        console.log(
          "?뵇 湲곗〈 ????덈Ц 援ъ“ (translations):",
          repExample.translations
        );
        console.log(
          "?뵇 sourceLanguage:",
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

        console.log("?뱷 異붿텧???덈Ц (湲곗〈 援ъ“):", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "????덈Ц",
            isRepresentative: true,
          });
          console.log("??????덈Ц??allExamples??異붽???(湲곗〈 援ъ“)");
        } else {
          console.log("?좑툘 sourceText ?먮뒗 targetText媛 鍮꾩뼱?덉쓬 (湲곗〈 援ъ“)");
        }
      } else {
        console.log("?좑툘 吏?먮릺吏 ?딅뒗 ????덈Ц 援ъ“:", repExample);
      }
    }

    // 3. ????덈Ц???녿뒗 寃쎌슦?먮쭔 湲곗〈 援ъ“?먯꽌 ?덈Ц ?뺤씤 (?섏쐞 ?명솚??
    if (allExamples.length === 0 && currentConcept) {
      // featured_examples ?뺤씤
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
                context: example.context || "異붿쿇",
                isRepresentative: index === 0, // 泥?踰덉㎏留????              });
            }
          }
        });
      }

      // core_examples ?뺤씤 (featured_examples媛 ?녿뒗 寃쎌슦?먮쭔)
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
                context: example.context || "?듭떖",
                isRepresentative: index === 0, // 泥?踰덉㎏留????              });
            }
          }
        });
      }
    }

    // priority媛 ?믪? ?쒖쑝濡??뺣젹
    allExamples.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // ?곸쐞 3媛쒕쭔 ?쒖떆 (以묐났 諛⑹?)
    allExamples.slice(0, 3).forEach((example) => {
      // 諛곗? ?쒓굅 - 源붾걫?섍쾶 ?덈Ц留??쒖떆
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
          <p>?깅줉???덈Ц???놁뒿?덈떎.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("?덈Ц 濡쒕뱶 以??ㅻ쪟:", error);
    console.error("?ㅻ쪟 ?ㅽ깮:", error.stack);
    const examplesContainer = document.getElementById("examples-container");
    if (examplesContainer) {
      examplesContainer.innerHTML = `
        <div class="text-center text-red-500 py-4">
          <p>?덈Ц??遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.</p>
        </div>
      `;
    } else {
      console.error("??catch 釉붾줉?먯꽌??examples-container瑜?李얠쓣 ???놁쓬");
    }
  }
}

// ?몄뼱蹂??쒗쁽 ?뺣낫 梨꾩슦湲??⑥닔 (?뺤옣??援ъ“ 吏??
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  const tabContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (!tabContainer || !contentContainer) {
    console.error("??而⑦뀒?대꼫瑜?李얠쓣 ???놁뒿?덈떎:", {
      tabContainer,
      contentContainer,
    });
    return;
  }

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // ?몄뼱???쒖꽌: ??곸뼵?????먮낯?몄뼱 ???섎㉧吏 ?몄뼱??  const orderedLanguages = [];

  // 1. ??곸뼵??癒쇱? 異붽? (?덈뒗 寃쎌슦)
  if (targetLanguage && conceptData.expressions?.[targetLanguage]?.word) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. ?먮낯?몄뼱 異붽? (?덇퀬, ??곸뼵?댁? ?ㅻⅨ 寃쎌슦)
  if (
    sourceLanguage &&
    conceptData.expressions?.[sourceLanguage]?.word &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. ?섎㉧吏 ?몄뼱??異붽? (?먮낯?몄뼱, ??곸뼵???쒖쇅)
  Object.keys(conceptData.expressions || {}).forEach((langCode) => {
    if (
      !orderedLanguages.includes(langCode) &&
      conceptData.expressions[langCode]?.word
    ) {
      orderedLanguages.push(langCode);
    }
  });

  if (orderedLanguages.length === 0) {
    console.error("?쒖떆???몄뼱媛 ?놁뒿?덈떎.");
    return;
  }

  // 媛??몄뼱蹂???낵 而⑦뀗痢??앹꽦
  orderedLanguages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
    const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
    const langInfo = supportedLanguages[langCode] || {
      nameKo: langCode,
      code: langCode,
    };

    // ???앹꽦
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

    // 而⑦뀗痢??⑤꼸 ?앹꽦 (媛꾩냼??
    const panel = document.createElement("div");
    panel.id = `view-${langCode}-content`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4`;

    contentContainer.appendChild(panel);

    // 紐⑤뱺 ?몄뼱??쓽 ?댁슜??誘몃━ ?앹꽦
    updateLanguageContent(langCode, conceptData, sourceLanguage);
  });

  // ???꾪솚 ?⑥닔 ?뺤쓽
  window.switchViewTab = (langCode) => {
    // 紐⑤뱺 ??鍮꾪솢?깊솕
    document.querySelectorAll("[id^='view-'][id$='-tab']").forEach((tab) => {
      tab.className =
        "px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700";
    });

    // 紐⑤뱺 而⑦뀗痢??⑤꼸 ?④린湲?    document
      .querySelectorAll("[id^='view-'][id$='-content']")
      .forEach((content) => {
        content.classList.add("hidden");
      });

    // ?좏깮?????쒖꽦??    const selectedTab = document.getElementById(`view-${langCode}-tab`);
    if (selectedTab) {
      selectedTab.className =
        "px-4 py-2 border-b-2 border-blue-500 text-blue-600";
    }

    // ?좏깮??而⑦뀗痢??쒖떆
    const selectedContent = document.getElementById(`view-${langCode}-content`);
    if (selectedContent) {
      selectedContent.classList.remove("hidden");

      // ?댁슜??鍮꾩뼱?덈뒗 寃쎌슦 ?앹꽦 (?덉쟾?μ튂)
      if (selectedContent.innerHTML.trim() === "") {
        console.log(
          `?뵩 [?덉쟾?μ튂] ${langCode} ???댁슜??鍮꾩뼱?덉뼱???앹꽦 以?..`
        );
        updateLanguageContent(langCode, conceptData, sourceLanguage);
      }
    }

    // 紐⑤떖 ?ㅻ뜑 ?낅뜲?댄듃 (?몄뼱 ??뿉 ?곕씪 蹂寃?
    const currentExpression = conceptData.expressions?.[langCode] || {};
    const titleElement = document.getElementById("concept-view-title");
    const pronunciationElement = document.getElementById(
      "concept-view-pronunciation"
    );

    // ?ㅻ뜑 ?⑥뼱???꾩옱 ?좏깮???몄뼱 ??뿉 ?곕씪 蹂寃?    if (titleElement) {
      titleElement.textContent = currentExpression.word || "N/A";
    }

    // 諛쒖쓬 ?뺣낫???꾩옱 ?몄뼱??留욊쾶 ?낅뜲?댄듃
    if (pronunciationElement) {
      pronunciationElement.textContent =
        currentExpression.pronunciation ||
        currentExpression.romanization ||
        currentExpression.phonetic ||
        "";
    }

    // ?몄뼱??蹂寃??쒖뿉???댁슜???ㅼ떆 ?앹꽦?섏? ?딆쓬 (?대? ?앹꽦???댁슜 ?ъ슜)
    // updateLanguageContent??紐⑤떖 珥덇린 濡쒕뱶 ?쒖뿉留??몄텧??
    // ?몄뼱??蹂寃쎌뿉 ?곕씪 ?덈Ц??????몄뼱???낅뜲?댄듃
    console.log(
      `?봽 ?몄뼱??蹂寃? ${sourceLanguage} ??${langCode}, ?덈Ц ?낅뜲?댄듃 以?..`
    );
    loadAndDisplayExamples(conceptData.id, sourceLanguage, langCode);
  };

  // ?쒓컙 ?쒖떆 ?ㅼ젙
  setupConceptTimestamp(conceptData);

  // 紐⑤떖 踰꾪듉 ?대깽???ㅼ젙 (?쎄컙??吏?곗쓣 ?먯뼱 DOM???꾩쟾???뚮뜑留곷맂 ??踰덉뿭 ?곸슜)
  setTimeout(() => {
    setupModalButtons(conceptData);
  }, 100);
}

// ?몄뼱蹂?而⑦뀗痢??낅뜲?댄듃 ?⑥닔 (?섍꼍 ?몄뼱 湲곗?)
function updateLanguageContent(langCode, conceptData, sourceLanguage) {
  const panel = document.getElementById(`view-${langCode}-content`);
  if (!panel || !conceptData) return;

  const expression = conceptData.expressions?.[langCode] || {};

  // ?댁슜 ?곸뿭??踰덉뿭 ?⑥뼱???섍꼍 ?몄뼱濡?怨좎젙
  // userLanguage???대떦?섎뒗 ?몄뼱 肄붾뱶 留ㅽ븨
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
    `?뵇 [?댁슜 ?몄뼱] userLanguage: ${userLanguage}, envLangCode: ${envLangCode}, displayWord: ${displayWord}`
  );

  // ?섍꼍 ?ㅼ젙 ?몄뼱???곕Ⅸ ?덉씠釉?媛?몄삤湲?  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        synonyms: "?좎쓽??,
        antonyms: "諛섏쓽??,
        word_family: "?댁”",
        compound_words: "蹂듯빀??,
        collocations: "?곗뼱",
        partOfSpeech: {
          noun: "紐낆궗",
          verb: "?숈궗",
          adjective: "?뺤슜??,
          adverb: "遺??,
          pronoun: "?紐낆궗",
          preposition: "?꾩튂??,
          conjunction: "?묒냽??,
          interjection: "媛먰깂??,
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
        synonyms: "窈욅쑴沃?,
        antonyms: "?띷꼷沃?,
        word_family: "沃욄뿈",
        compound_words: "筽뉐릦沃?,
        collocations: "?ｈ첑",
        partOfSpeech: {
          noun: "?띹찠",
          verb: "?뺠찠",
          adjective: "壤℡?屋?,
          adverb: "??찠",
          pronoun: "餓ｅ릫屋?,
          preposition: "?띸쉰屋?,
          conjunction: "?η텥屋?,
          interjection: "?잌쁿屋?,
        },
      },
      zh: {
        synonyms: "?뚥퉱瑥?,
        antonyms: "?띴퉱瑥?,
        word_family: "瑥띷뿈",
        compound_words: "鸚띶릦瑥?,
        collocations: "??뀓瑥?,
        partOfSpeech: {
          noun: "?띹칾",
          verb: "?②칾",
          adjective: "壤℡?瑥?,
          adverb: "??칾",
          pronoun: "餓ｈ칾",
          preposition: "餓뗨칾",
          conjunction: "瓦욆칾",
          interjection: "?잌뤉瑥?,
        },
      },
    };
    return labels[userLang] || labels.ko;
  };

  const uiLabels = getUILabels(userLanguage);

  // ?덉궗 踰덉뿭 - ?섍꼍 ?몄뼱濡?怨좎젙
  const translatePartOfSpeech = (pos) => {
    if (!pos) return "";

    // ?덉궗瑜??곸뼱 ?쒖??쇰줈 ?뺢퇋??    const normalizePartOfSpeech = (partOfSpeech) => {
      const posMap = {
        // ?쒓뎅??        紐낆궗: "noun",
        ?숈궗: "verb",
        ?뺤슜?? "adjective",
        遺?? "adverb",
        ?紐낆궗: "pronoun",
        ?꾩튂?? "preposition",
        ?묒냽?? "conjunction",
        媛먰깂?? "interjection",
        // ?쇰낯??        ?띹찠: "noun",
        ?뺠찠: "verb",
        壤℡?屋? "adjective",
        ??찠: "adverb",
        餓ｅ릫屋? "pronoun",
        ?띸쉰屋? "preposition",
        ?η텥屋? "conjunction",
        ?잌쁿屋? "interjection",
        // 以묎뎅??        ?띹칾: "noun",
        ?②칾: "verb",
        壤℡?瑥? "adjective",
        ??칾: "adverb",
        餓ｈ칾: "pronoun",
        餓뗨칾: "preposition",
        瓦욆칾: "conjunction",
        ?잌뤉瑥? "interjection",
        // ?곸뼱 (洹몃?濡?
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
      `?뵇 [?덉궗 踰덉뿭] ?먮낯: ${pos}, ?뺢퇋?? ${normalizedPos}, 踰덉뿭: ${translated}, ?섍꼍?몄뼱: ${userLanguage}`
    );
    return translated;
  };

  console.log(`?뵇 ${langCode} ?몄뼱 ?쒗쁽 ?곗씠??`, expression);

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

  // 諛쒖쓬 ?뺣낫???몄뼱 ??蹂寃쎌떆?먮쭔 ?낅뜲?댄듃 (?ㅻ뜑 ?⑥뼱??怨좎젙)
  if (expression.pronunciation) {
    const pronElement = document.getElementById("concept-view-pronunciation");
    if (pronElement) {
      pronElement.textContent = expression.pronunciation;
    }
  }
}

// 媛쒕뀗 ?쒓컙 ?쒖떆 ?ㅼ젙
function setupConceptTimestamp(conceptData) {
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement && conceptData) {
    let timeText = getTranslatedText("registration_time") || "?깅줉 ?쒓컙";

    console.log("???쒓컙 ?ㅼ젙 ?쒕룄:", conceptData);

    // ?щ윭 媛?ν븳 ?쒓컙 ?꾨뱶 ?뺤씤
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
          console.log("???쒓컙 ?ㅼ젙 ?깃났:", timeText);
        }
      } catch (error) {
        console.error("???쒓컙 ?뚯떛 ?ㅻ쪟:", error);
      }
    } else {
      console.log("?좑툘 ?쒓컙 ?뺣낫 ?놁쓬, 湲곕낯媛??ъ슜");
    }

    timestampElement.textContent = timeText;
  }
}

// 紐⑤떖 踰꾪듉 ?대깽???ㅼ젙
function setupModalButtons(conceptData) {
  // ?꾩뿭 踰덉뿭 ?쒖뒪?쒖쓣 ?ъ슜?섏뿬 踰꾪듉 踰덉뿭 ?곸슜
  const viewModal = document.getElementById("concept-view-modal");
  if (viewModal) {
    // utils/language-utils.js???꾩뿭 踰덉뿭 ?쒖뒪???ъ슜
    if (typeof updateLanguageUI === "function") {
      updateLanguageUI(userLanguage);
    } else {
      // ?꾩뿭 踰덉뿭 ?쒖뒪?쒖씠 ?녿뒗 寃쎌슦 吏곸젒 踰덉뿭
      const editButtonSpan = viewModal.querySelector(
        '#edit-concept-button span[data-i18n="edit"]'
      );
      const deleteButtonSpan = viewModal.querySelector(
        '#delete-concept-button span[data-i18n="delete"]'
      );
      const examplesTitle = viewModal.querySelector('h3[data-i18n="examples"]');

      // ?꾩뿭 踰덉뿭 媛앹껜?먯꽌 吏곸젒 媛?몄삤湲?      if (typeof translations !== "undefined" && translations[userLanguage]) {
        if (editButtonSpan) {
          editButtonSpan.textContent =
            translations[userLanguage].edit || "?몄쭛";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            translations[userLanguage].delete || "??젣";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            translations[userLanguage].examples || "?덈Ц";
        }
      } else {
        // 留덉?留?fallback
        if (editButtonSpan) {
          editButtonSpan.textContent =
            userLanguage === "ko"
              ? "?몄쭛"
              : userLanguage === "en"
              ? "Edit"
              : userLanguage === "ja"
              ? "渶③썓"
              : userLanguage === "zh"
              ? "煐뽬풌"
              : "?몄쭛";
        }
        if (deleteButtonSpan) {
          deleteButtonSpan.textContent =
            userLanguage === "ko"
              ? "??젣"
              : userLanguage === "en"
              ? "Delete"
              : userLanguage === "ja"
              ? "?딃솮"
              : userLanguage === "zh"
              ? "?좈솮"
              : "??젣";
        }
        if (examplesTitle) {
          examplesTitle.textContent =
            userLanguage === "ko"
              ? "?덈Ц"
              : userLanguage === "en"
              ? "Examples"
              : userLanguage === "ja"
              ? "堊뗦뻼"
              : userLanguage === "zh"
              ? "堊뗥룯"
              : "?덈Ц";
        }
      }
    }

    console.log("??紐⑤떖 踰꾪듉 踰덉뿭 ?꾨즺:", {
      userLanguage: userLanguage,
      editText: viewModal.querySelector("#edit-concept-button span")
        ?.textContent,
      deleteText: viewModal.querySelector("#delete-concept-button span")
        ?.textContent,
    });
  }

  // ?몄쭛 踰꾪듉 ?대깽??  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 媛쒕뀗 ?섏젙 紐⑤떖 ?닿린
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) {
        viewModal.classList.add("hidden");
        viewModal.style.display = "none"; // 媛뺤젣濡??④린湲?      }

      const conceptId =
        conceptData.concept_id || conceptData.id || conceptData._id;
      console.log("?뵩 ?몄쭛 踰꾪듉 ?대┃, conceptId:", conceptId);

      // ?쎄컙??吏?????몄쭛 紐⑤떖 ?닿린 (DOM ?낅뜲?댄듃 ?湲?
      setTimeout(() => {
        if (window.openEditConceptModal) {
          window.openEditConceptModal(conceptId);
        } else {
          console.error("??openEditConceptModal ?⑥닔媛 ?뺤쓽?섏? ?딆븯?듬땲??");
        }
      }, 100);
    };
  }

  // ??젣 踰꾪듉 ?대깽??  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (
        confirm(
          getTranslatedText("confirm_delete_concept") ||
            "?뺣쭚濡???媛쒕뀗????젣?섏떆寃좎뒿?덇퉴?"
        )
      ) {
        try {
          await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
          alert(
            getTranslatedText("concept_deleted_success") ||
              "媛쒕뀗???깃났?곸쑝濡???젣?섏뿀?듬땲??"
          );

          // 紐⑤떖 ?リ린
          const viewModal = document.getElementById("concept-view-modal");
          if (viewModal) {
            viewModal.classList.add("hidden");
            viewModal.style.display = "none";
            console.log("????젣 ??紐⑤떖 ?リ린 ?꾨즺");
          }

          // 紐⑸줉 ?덈줈怨좎묠
          window.dispatchEvent(new CustomEvent("concept-saved"));
        } catch (error) {
          console.error("媛쒕뀗 ??젣 以??ㅻ쪟 諛쒖깮:", error);
          alert(
            (getTranslatedText("concept_delete_error") ||
              "媛쒕뀗 ??젣 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎") +
              ": " +
              error.message
          );
        }
      }
    };
  }

  // 紐⑤떖 ?リ린 踰꾪듉 ?대깽??(?щ윭 諛⑸쾿?쇰줈 ?ㅼ젙)
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    // 湲곗〈 ?대깽??由ъ뒪???쒓굅
    closeButton.onclick = null;

    // ?덈줈???대깽??由ъ뒪??異붽?
    const closeModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById("concept-view-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none"; // 媛뺤젣濡??④린湲?        console.log("??紐⑤떖 ?リ린 ?꾨즺");
      }
    };

    closeButton.addEventListener("click", closeModal);
    closeButton.onclick = closeModal; // 諛깆뾽??    console.log("??紐⑤떖 ?リ린 踰꾪듉 ?대깽???ㅼ젙 ?꾨즺");
  } else {
    console.error("??close-concept-view-modal 踰꾪듉??李얠쓣 ???놁뒿?덈떎");
  }

  // 紐⑤떖 諛곌꼍 ?대┃?쇰줈???リ린
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
        console.log("??紐⑤떖 諛곌꼍 ?대┃?쇰줈 ?リ린");
      }
    });
  }
}

// ?섏씠吏 珥덇린??document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("?? DOMContentLoaded ?대깽???쒖옉");

    // ?꾩옱 ?쒖꽦?붾맂 ?몄뼱 肄붾뱶 媛?몄삤湲?    userLanguage = await getActiveLanguage();
    console.log("???몄뼱 ?ㅼ젙 ?꾨즺:", userLanguage);

    // ?ㅻ퉬寃뚯씠?섎컮 濡쒕뱶
    console.log("?뱥 ?ㅻ퉬寃뚯씠?섎컮 濡쒕뱶 ?쒖옉");
    const navbarContainer = document.getElementById("navbar-container");
    console.log("?뱥 ?ㅻ퉬寃뚯씠??諛?而⑦뀒?대꼫:", navbarContainer);

    if (!navbarContainer) {
      console.error("??navbar-container瑜?李얠쓣 ???놁뒿?덈떎!");
      throw new Error("navbar-container ?붿냼媛 ?놁뒿?덈떎.");
    }

    await loadNavbar(navbarContainer);
    console.log("???ㅻ퉬寃뚯씠?섎컮 濡쒕뱶 ?꾨즺");

    // ?ㅻ퉬寃뚯씠?섎컮媛 ?ㅼ젣濡?濡쒕뱶?섏뿀?붿? ?뺤씤
    setTimeout(() => {
      const loadedNavbar = document.querySelector("#navbar-container nav");
      console.log("?뵇 濡쒕뱶???ㅻ퉬寃뚯씠?섎컮:", loadedNavbar);
      if (!loadedNavbar) {
        console.error("???ㅻ퉬寃뚯씠?섎컮媛 ?쒕?濡?濡쒕뱶?섏? ?딆븯?듬땲??");
      }
    }, 1000);

    // 紐⑤떖 珥덇린??    console.log("?뵩 紐⑤떖 珥덇린???쒖옉");
    await loadModals([
      "../components/add-concept-modal.html",
      "../components/edit-concept-modal.html",
      "../components/concept-view-modal.html",
      "../components/bulk-import-modal.html",
    ]);
    console.log("??紐⑤떖 珥덇린???꾨즺");

    // 紐⑤떖 而댄룷?뚰듃 珥덇린??    console.log("?숋툘 紐⑤떖 而댄룷?뚰듃 珥덇린???쒖옉");
    await initializeConceptModal();
    initializeBulkImportModal();
    console.log("??紐⑤떖 而댄룷?뚰듃 珥덇린???꾨즺");

    // ?대깽??由ъ뒪???ㅼ젙
    console.log("?뵕 ?대깽??由ъ뒪???ㅼ젙 ?쒖옉");
    setupEventListeners();
    console.log("???대깽??由ъ뒪???ㅼ젙 ?꾨즺");

    // 硫뷀??곗씠???낅뜲?댄듃
    console.log("?뱞 硫뷀??곗씠???낅뜲?댄듃 ?쒖옉");
    await updateMetadata("dictionary");
    console.log("??硫뷀??곗씠???낅뜲?댄듃 ?꾨즺");

    // ?ъ슜???몄쬆 ?곹깭 愿李?    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("?뫀 ?ъ슜??濡쒓렇???뺤씤:", user.email);
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
        await loadUserBookmarks(); // 遺곷쭏??濡쒕뱶 異붽?
      } else {
        alert(getTranslatedText("login_required"));
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("???ㅺ뎅???⑥뼱???섏씠吏 珥덇린??以??ㅻ쪟 諛쒖깮:", error);
    showError("?섏씠吏瑜?遺덈윭?ㅻ뒗 以?臾몄젣媛 諛쒖깮?덉뒿?덈떎.", error.message);
  }
});

// ?대깽??由ъ뒪???ㅼ젙
function setupEventListeners() {
  console.log("?뵩 setupEventListeners ?⑥닔 ?쒖옉");

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

  // 紐⑤뱺 ?붿냼媛 ?쒕?濡?李얠븘議뚮뒗吏 ?뺤씤
  console.log("?뵇 Found elements:", {
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

  // ?꾪꽣 怨듭쑀 紐⑤뱢???ъ슜?섏뿬 ?대깽??由ъ뒪???ㅼ젙
  const filterManager = setupVocabularyFilters(() => {
    // ?꾪꽣 蹂寃????ㅽ뻾??肄쒕갚 ?⑥닔
    handleSearch(elements);
  });

  // ?몄뼱 蹂寃??대깽??(?곗씠???ㅼ떆 濡쒕뱶 ?꾩슂)
  [elements.sourceLanguage, elements.targetLanguage].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => {
        fetchAndDisplayConcepts();
      });
    }
  });

  // ?몄뼱 ?쒖꽌 諛붽씀湲??대깽??(怨듭쑀 紐⑤뱢 ?ъ슜)
  if (elements.swapButton) {
    elements.swapButton.addEventListener("click", () => {
      filterManager.swapLanguages();
      handleSearch(elements);
    });
  }

  // ??蹂닿린 踰꾪듉 ?대깽??  if (elements.loadMoreButton) {
    elements.loadMoreButton.addEventListener("click", handleLoadMore);
  }

  // ??媛쒕뀗 異붽? 踰꾪듉 ?대깽??  if (elements.addConceptButton) {
    console.log("????媛쒕뀗 異붽? 踰꾪듉 ?대깽??由ъ뒪???깅줉 以?..");
    elements.addConceptButton.addEventListener("click", () => {
      console.log("?뼮截???媛쒕뀗 異붽? 踰꾪듉 ?대┃??);
      if (window.openConceptModal) {
        console.log("??openConceptModal ?⑥닔 ?몄텧");
        window.openConceptModal();
      } else {
        console.error("??openConceptModal ?⑥닔媛 ?뺤쓽?섏? ?딆븯?듬땲??");
      }
    });
    console.log("????媛쒕뀗 異붽? 踰꾪듉 ?대깽??由ъ뒪???깅줉 ?꾨즺");
  } else {
    console.error("??add-concept 踰꾪듉 ?붿냼瑜?李얠쓣 ???놁뒿?덈떎");
  }

  // ???媛쒕뀗 異붽? 踰꾪듉 ?대깽??  if (elements.bulkAddButton) {
    console.log("?벀 ???媛쒕뀗 異붽? 踰꾪듉 ?대깽??由ъ뒪???깅줉 以?..");
    elements.bulkAddButton.addEventListener("click", () => {
      console.log("?뼮截????媛쒕뀗 異붽? 踰꾪듉 ?대┃??);
      if (window.openBulkImportModal) {
        console.log("??openBulkImportModal ?⑥닔 ?몄텧");
        window.openBulkImportModal();
      } else {
        console.error("??openBulkImportModal ?⑥닔媛 ?뺤쓽?섏? ?딆븯?듬땲??");
      }
    });
    console.log("?????媛쒕뀗 異붽? 踰꾪듉 ?대깽??由ъ뒪???깅줉 ?꾨즺");
  } else {
    console.error("??bulk-add-concept 踰꾪듉 ?붿냼瑜?李얠쓣 ???놁뒿?덈떎");
  }

  // 媛쒕뀗 ????대깽??由ъ뒪??(紐⑤떖?먯꽌 ?몄텧)
  window.addEventListener("concept-saved", () => {
    console.log("?뮶 媛쒕뀗 ????대깽???섏떊");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 媛쒕뀗 ??젣 ?대깽??由ъ뒪??  window.addEventListener("concept-deleted", () => {
    console.log("?뿊截?媛쒕뀗 ??젣 ?대깽???섏떊");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // ???媛쒕뀗 異붽? ?대깽??由ъ뒪??  window.addEventListener("concepts-bulk-saved", () => {
    console.log("?벀 ???媛쒕뀗 ????대깽???섏떊");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // ?몄뼱 蹂寃??대깽??由ъ뒪??異붽? (?덈줈怨좎묠 ?놁씠 ?꾨찓??移댄뀒怨좊━ ?낅뜲?댄듃)
  window.addEventListener("languageChanged", () => {
    console.log("?뙋 ?몄뼱 蹂寃??대깽???섏떊 - 媛쒕뀗 移대뱶 ?낅뜲?댄듃");
    // ?꾩옱 ?쒖떆??媛쒕뀗?ㅼ쓣 ?ㅼ떆 ?뚮뜑留?    displayConceptList();
  });

  console.log("??setupEventListeners ?⑥닔 ?꾨즺");
}

// ?ㅻ쪟 ?쒖떆 ?⑥닔
function showError(message, details = "") {
  console.error("?ㅻ쪟:", message, details);
  alert(
    `${getTranslatedText("error_title")} ${message} ${
      details ? `\n${getTranslatedText("error_details")} ${details}` : ""
    }`
  );
}

// 遺곷쭏??愿???⑥닔??let userBookmarks = [];

// ?ъ슜??遺곷쭏??濡쒕뱶
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

    // 遺곷쭏???곹깭 ?낅뜲?댄듃
    updateBookmarkUI();
  } catch (error) {
    console.error("遺곷쭏??濡쒕뱶 ?ㅻ쪟:", error);
  }
}

// 遺곷쭏???좉?
async function toggleBookmark(conceptId) {
  if (!auth.currentUser) {
    alert("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
    return;
  }

  try {
    const userEmail = auth.currentUser.email;
    const bookmarksRef = doc(db, "bookmarks", userEmail);

    let updatedBookmarks;
    const isBookmarked = userBookmarks.includes(conceptId);

    if (isBookmarked) {
      // 遺곷쭏???쒓굅
      updatedBookmarks = userBookmarks.filter((id) => id !== conceptId);
      showMessage("遺곷쭏?ш? ?쒓굅?섏뿀?듬땲??", "success");
    } else {
      // 遺곷쭏??異붽?
      updatedBookmarks = [...userBookmarks, conceptId];
      showMessage("遺곷쭏?ш? 異붽??섏뿀?듬땲??", "success");
    }

    // Firestore ?낅뜲?댄듃
    await setDoc(bookmarksRef, {
      user_email: userEmail,
      concept_ids: updatedBookmarks,
      updated_at: new Date().toISOString(),
    });

    // 濡쒖뺄 ?곹깭 ?낅뜲?댄듃
    userBookmarks = updatedBookmarks;
    updateBookmarkUI();
  } catch (error) {
    console.error("遺곷쭏???좉? ?ㅻ쪟:", error);
    showError("遺곷쭏??泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
  }
}

// 遺곷쭏??UI ?낅뜲?댄듃
function updateBookmarkUI() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");

  bookmarkButtons.forEach((btn) => {
    const conceptId = btn.getAttribute("data-concept-id");
    const icon = btn.querySelector("i");

    if (userBookmarks.includes(conceptId)) {
      icon.className = "fas fa-bookmark text-yellow-500";
      btn.title = "遺곷쭏???댁젣";
    } else {
      icon.className = "fas fa-bookmark text-gray-400";
      btn.title = "遺곷쭏??;
    }
  });
}

// ?깃났 硫붿떆吏 ?쒖떆
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
    <button onclick="this.parentElement.remove()" class="ml-2 font-bold">횞</button>
  `;

  document.body.appendChild(messageContainer);

  setTimeout(() => {
    if (messageContainer.parentElement) {
      messageContainer.remove();
    }
  }, 3000);
}

// ?꾩뿭 ?⑥닔濡?留뚮뱾?댁꽌 HTML?먯꽌 ?몄텧 媛?ν븯寃???window.toggleBookmark = toggleBookmark;
