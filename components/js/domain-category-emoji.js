// 도메인별 카테고리 매핑
export const domainCategoryMapping = {
  daily: [
    "household",
    "family",
    "routine",
    "clothing",
    "furniture",
    "shopping",
    "transportation",
    "communication",
    "personal_care",
    "leisure",
    "relationships",
    "emotions",
    "time",
    "weather_talk",
    "other",
  ],
  food: [
    "fruit",
    "vegetable",
    "meat",
    "drink",
    "snack",
    "grain",
    "seafood",
    "dairy",
    "cooking",
    "dining",
    "restaurant",
    "kitchen_utensils",
    "spices",
    "dessert",
    "other",
  ],
  travel: [
    "transportation",
    "accommodation",
    "tourist_attraction",
    "luggage",
    "direction",
    "booking",
    "currency",
    "culture",
    "emergency",
    "documents",
    "sightseeing",
    "local_food",
    "souvenir",
    "other",
  ],
  business: [
    "meeting",
    "finance",
    "marketing",
    "office",
    "project",
    "negotiation",
    "presentation",
    "teamwork",
    "leadership",
    "networking",
    "sales",
    "contract",
    "startup",
    "other",
  ],
  education: [
    "teaching",
    "learning",
    "classroom",
    "curriculum",
    "assessment",
    "pedagogy",
    "skill_development",
    "online_learning",
    "training",
    "certification",
    "educational_technology",
    "student_life",
    "graduation",
    "examination",
    "university",
    "library",
    "philosophy",
    "other",
  ],
  nature: [
    "animal",
    "plant",
    "weather",
    "geography",
    "environment",
    "ecosystem",
    "conservation",
    "climate",
    "natural_disaster",
    "landscape",
    "marine_life",
    "forest",
    "mountain",
    "other",
  ],
  technology: [
    "computer",
    "software",
    "internet",
    "mobile",
    "ai",
    "programming",
    "cybersecurity",
    "database",
    "robotics",
    "blockchain",
    "cloud",
    "social_media",
    "gaming",
    "innovation",
    "other",
  ],
  health: [
    "exercise",
    "medicine",
    "nutrition",
    "mental_health",
    "hospital",
    "fitness",
    "wellness",
    "therapy",
    "prevention",
    "symptoms",
    "treatment",
    "pharmacy",
    "rehabilitation",
    "medical_equipment",
    "other",
  ],
  sports: [
    "football",
    "basketball",
    "swimming",
    "running",
    "equipment",
    "olympics",
    "tennis",
    "baseball",
    "golf",
    "martial_arts",
    "team_sports",
    "individual_sports",
    "coaching",
    "competition",
    "other",
  ],
  entertainment: [
    "movie",
    "music",
    "game",
    "book",
    "art",
    "theater",
    "concert",
    "festival",
    "celebrity",
    "tv_show",
    "comedy",
    "drama",
    "animation",
    "photography",
    "other",
  ],
  culture: [
    "tradition",
    "customs",
    "language",
    "religion",
    "festival",
    "heritage",
    "ceremony",
    "ritual",
    "folklore",
    "mythology",
    "arts_crafts",
    "etiquette",
    "national_identity",
    "other",
  ],
  other: [
    "hobbies",
    "finance_personal",
    "legal",
    "government",
    "politics",
    "media",
    "community",
    "volunteering",
    "charity",
    "philosophy",
    "other",
  ],
};

// 카테고리 이모지 매핑
export const categoryEmojiMapping = {
  // daily 도메인
  household: ["🏠", "🛋️", "🪑", "🛏️", "🚪", "🪟"],
  family: ["👨‍👩‍👧‍👦", "👶", "👵", "👴", "👨‍👧", "👩‍👧"],
  routine: ["⏰", "🛌", "🚿", "🍽️", "🚌", "💼"],
  clothing: ["👕", "👖", "👗", "👔", "👚", "👠"],
  furniture: ["🛋️", "🪑", "🛏️", "🗄️", "📚", "🪞"],
  shopping: ["🛍️", "🛒", "💳", "💰", "🏪", "🏬"],
  communication: ["📞", "📱", "💬", "📧", "📮", "📬"],
  personal_care: ["🧴", "🧽", "🪥", "🧼", "💄", "💅"],
  leisure: ["📺", "🎮", "📖", "🎵", "🎨", "🎲"],
  relationships: ["💕", "👫", "👬", "👭", "💑", "💏"],
  emotions: ["😊", "😢", "😡", "😴", "😍", "🤔"],
  time: ["⏰", "⏱️", "⏲️", "🕐", "📅", "📆"],
  weather_talk: ["☀️", "🌧️", "⛅", "❄️", "🌈", "⛈️"],

  // food 도메인
  fruit: ["🍎", "🍌", "🍇", "🍓", "🍑", "🍒"],
  vegetable: ["🥕", "🥬", "🥒", "🍅", "🥔", "🧅"],
  meat: ["🥩", "🍖", "🍗", "🥓", "🍤", "🦐"],
  drink: ["💧", "🥛", "☕", "🍵", "🥤", "🧃"],
  snack: ["🍪", "🍰", "🧁", "🍩", "🍿", "🥨"],
  grain: ["🌾", "🍞", "🥖", "🥐", "🥯", "🍚"],
  seafood: ["🐟", "🦐", "🦀", "🐙", "🦑", "🐠"],
  dairy: ["🥛", "🧀", "🧈", "🥚", "🍳", "🥞"],
  cooking: ["🍳", "🥘", "🍲", "🥗", "🍱", "🍜"],
  dining: ["🍽️", "🥄", "🍴", "🥢", "🍷", "🥂"],
  restaurant: ["🏪", "🍕", "🍔", "🌮", "🍜", "🍣"],
  kitchen_utensils: ["🔪", "🥄", "🍴", "🥢", "🍳", "🥘"],
  spices: ["🧄", "🌶️", "🧂", "🌿", "🍯", "🫒"],
  dessert: ["🍰", "🧁", "🍪", "🍩", "🍫", "🍬"],

  // travel 도메인
  transportation: ["🚗", "🚙", "🚐", "🚛", "🚌", "🚎"],
  accommodation: ["🏨", "🏩", "🏠", "🏡", "🏢", "🏣"],
  tourist_attraction: ["🏛️", "🏰", "🗼", "🎡", "🎢", "🎠"],
  luggage: ["🧳", "🎒", "👜", "💼", "🛍️", "📦"],
  direction: ["🧭", "🗺️", "📍", "🚩", "⬆️", "⬇️"],
  booking: ["📅", "📋", "💳", "🎫", "📄", "✅"],
  currency: ["💰", "💵", "💴", "💶", "💷", "🪙"],
  culture: ["🏛️", "🎭", "🎨", "📚", "🗿", "⛩️"],
  emergency: ["🚨", "🆘", "🚑", "🚒", "👮", "🏥"],
  documents: ["📄", "📋", "🆔", "📘", "📗", "📙"],
  sightseeing: ["📸", "🔭", "👀", "🗺️", "🎯", "🎪"],
  local_food: ["🍜", "🍱", "🍣", "🥟", "🌮", "🍕"],
  souvenir: ["🎁", "🛍️", "🏺", "🖼️", "📿", "🎀"],

  // business 도메인
  meeting: ["👥", "📋", "💼", "📊", "⏰", "🤝"],
  finance: ["💰", "💵", "📈", "📉", "💳", "🏦"],
  marketing: ["📢", "📊", "🎯", "📱", "💡", "🌟"],
  office: ["🏢", "💼", "📋", "🖥️", "📞", "📧"],
  project: ["📋", "📊", "⏰", "🎯", "✅", "📈"],
  negotiation: ["🤝", "💬", "📋", "⚖️", "💰", "✍️"],
  presentation: ["📊", "🖥️", "📽️", "📈", "💡", "🎯"],
  teamwork: ["👥", "🤝", "💪", "🎯", "⚽", "🏆"],
  leadership: ["👑", "🎯", "💪", "📈", "🌟", "🏆"],
  networking: ["🌐", "🤝", "📱", "💬", "🔗", "📧"],
  sales: ["💰", "📈", "🎯", "🤝", "📞", "💳"],
  contract: ["📋", "✍️", "📄", "🤝", "⚖️", "✅"],
  startup: ["🚀", "💡", "💰", "📈", "🎯", "🌟"],

  // education 도메인
  teaching: ["👨‍🏫", "👩‍🏫", "📚", "📝", "🎓", "💡"],
  learning: ["📚", "🧠", "💡", "📝", "🎯", "✅"],
  classroom: ["🏫", "📚", "🪑", "📝", "📊", "🎓"],
  curriculum: ["📋", "📚", "📝", "🎯", "📊", "✅"],
  assessment: ["📝", "✅", "❌", "📊", "🎯", "📋"],
  pedagogy: ["🧠", "💡", "📚", "🎯", "👨‍🏫", "📝"],
  skill_development: ["💪", "🧠", "🎯", "📈", "🏆", "⭐"],
  online_learning: ["💻", "📱", "🌐", "📚", "🎓", "📺"],
  training: ["💪", "🎯", "📚", "🏆", "📈", "✅"],
  certification: ["🎓", "📜", "🏆", "✅", "⭐", "🎖️"],
  educational_technology: ["💻", "📱", "🌐", "🤖", "📊", "💡"],
  student_life: ["🎒", "📚", "👫", "🏫", "⏰", "🍎"],
  graduation: ["🎓", "🎉", "🏆", "📜", "🎊", "🌟"],
  examination: ["📝", "⏰", "📊", "🎯", "💪", "🧠"],
  university: ["🏫", "🎓", "📚", "👨‍🎓", "📜", "🏛️"],
  library: ["📚", "📖", "🏛️", "🤫", "📝", "💡"],
  philosophy: ["🤔", "💭", "📚", "🧠", "💡", "🌟"],

  // nature 도메인
  animal: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"],
  plant: ["🌱", "🌿", "🌳", "🌲", "🌴", "🌵"],
  weather: ["☀️", "🌧️", "⛅", "❄️", "🌈", "⛈️"],
  geography: ["🏔️", "🏞️", "🏜️", "🏖️", "🌋", "🗻"],
  environment: ["🌍", "🌱", "♻️", "🌿", "🌊", "🌳"],
  ecosystem: ["🌳", "🐝", "🦋", "🌸", "🍄", "🌿"],
  conservation: ["♻️", "🌱", "🌍", "🛡️", "💚", "🌿"],
  climate: ["🌡️", "❄️", "☀️", "🌧️", "🌪️", "🌊"],
  natural_disaster: ["🌪️", "🌋", "⛈️", "🌊", "🔥", "❄️"],
  landscape: ["🏔️", "🏞️", "🌅", "🌄", "🏖️", "🏜️"],
  marine_life: ["🐠", "🐟", "🦈", "🐙", "🦀", "🐚"],
  forest: ["🌳", "🌲", "🌿", "🦌", "🐿️", "🍄"],
  mountain: ["🏔️", "⛰️", "🗻", "🧗", "🏕️", "🦅"],

  // technology 도메인
  computer: ["💻", "🖥️", "⌨️", "🖱️", "💾", "💿"],
  software: ["💻", "📱", "⚙️", "🔧", "💾", "🖥️"],
  internet: ["🌐", "📡", "💻", "📱", "🔗", "📧"],
  mobile: ["📱", "📞", "💬", "📧", "📷", "🎵"],
  ai: ["🤖", "🧠", "💡", "⚙️", "🔮", "🌟"],
  programming: ["💻", "⌨️", "🖥️", "🔧", "⚙️", "💾"],
  cybersecurity: ["🔒", "🛡️", "🔐", "🚨", "💻", "🔑"],
  database: ["💾", "📊", "🗄️", "💻", "🔍", "📋"],
  robotics: ["🤖", "⚙️", "🔧", "💻", "🦾", "🦿"],
  blockchain: ["🔗", "💰", "🔐", "💻", "📊", "🌐"],
  cloud: ["☁️", "💻", "🌐", "📊", "💾", "🔗"],
  social_media: ["📱", "💬", "📸", "👥", "🌐", "❤️"],
  gaming: ["🎮", "🕹️", "🎯", "🏆", "🎪", "🎲"],
  innovation: ["💡", "🚀", "⚡", "🌟", "🔬", "🧪"],

  // health 도메인
  exercise: ["🏃", "💪", "🏋️", "🚴", "🏊", "🧘"],
  medicine: ["💊", "🩺", "💉", "🏥", "👨‍⚕️", "🔬"],
  nutrition: ["🥗", "🍎", "🥛", "🥕", "🍇", "🥑"],
  mental_health: ["🧠", "💚", "😌", "🧘", "💭", "🌈"],
  hospital: ["🏥", "👨‍⚕️", "👩‍⚕️", "🩺", "💊", "🚑"],
  fitness: ["💪", "🏋️", "🏃", "🚴", "🧘", "⚖️"],
  wellness: ["🧘", "💚", "🌿", "💆", "🛁", "😌"],
  therapy: ["💬", "🧠", "💚", "🤝", "🛋️", "💭"],
  prevention: ["🛡️", "💉", "🧼", "🏃", "🥗", "😷"],
  symptoms: ["🤒", "😷", "🤧", "💊", "🩺", "📊"],
  treatment: ["💊", "🩺", "💉", "🏥", "👨‍⚕️", "🔬"],
  pharmacy: ["💊", "🏪", "💉", "🩺", "📋", "⚕️"],
  rehabilitation: ["💪", "🏃", "🧘", "🤝", "📈", "🎯"],
  medical_equipment: ["🩺", "💉", "🔬", "📊", "⚕️", "🏥"],

  // sports 도메인
  football: ["⚽", "🏟️", "👕", "🥅", "🏆", "👟"],
  basketball: ["🏀", "🏀", "🏟️", "👕", "🏆", "👟"],
  swimming: ["🏊", "🏊‍♀️", "🏊‍♂️", "🏊", "🏆", "💧"],
  running: ["🏃", "🏃‍♀️", "🏃‍♂️", "👟", "🏆", "⏱️"],
  equipment: ["🏀", "⚽", "🎾", "🏸", "🏑", "🏓"],
  olympics: ["🏆", "🥇", "🥈", "🥉", "🎖️", "🌟"],
  tennis: ["🎾", "🏟️", "🏆", "👟", "👕", "🎯"],
  baseball: ["⚾", "🏟️", "🧢", "🏆", "👕", "🥎"],
  golf: ["⛳", "🏌️", "🏌️‍♀️", "🏌️‍♂️", "🏆", "👕"],
  martial_arts: ["🥋", "🥊", "🏆", "💪", "🎯", "⚡"],
  team_sports: ["👥", "⚽", "🏀", "🏆", "🤝", "💪"],
  individual_sports: ["🏃", "🏊", "🚴", "🏆", "💪", "🎯"],
  coaching: ["👨‍🏫", "📋", "🎯", "💪", "🏆", "📊"],
  competition: ["🏆", "🥇", "🎯", "💪", "🏟️", "⚡"],

  // entertainment 도메인
  movie: ["🎬", "🎥", "🍿", "🎭", "🎪", "🎨"],
  music: ["🎵", "🎶", "🎤", "🎸", "🎹", "🥁"],
  game: ["🎮", "🕹️", "🎯", "🎲", "🃏", "🎪"],
  book: ["📚", "📖", "📝", "✍️", "📄", "📜"],
  art: ["🎨", "🖼️", "🖌️", "🎭", "🗿", "🎪"],
  theater: ["🎭", "🎪", "🎬", "🎤", "🎨", "🎵"],
  concert: ["🎵", "🎤", "🎸", "🥁", "🎹", "🎶"],
  festival: ["🎉", "🎊", "🎪", "🎭", "🎵", "🎨"],
  celebrity: ["⭐", "🌟", "🎬", "🎤", "📸", "🏆"],
  tv_show: ["📺", "🎬", "🎭", "🎤", "📹", "🎪"],
  comedy: ["😂", "🎭", "🎪", "🤡", "😄", "🎉"],
  drama: ["🎭", "😢", "🎬", "🎪", "📺", "🎨"],
  animation: ["🎨", "🎬", "📺", "🖼️", "🎪", "✨"],
  photography: ["📸", "📷", "🖼️", "🎨", "📹", "🌟"],

  // culture 도메인
  tradition: ["🏛️", "📜", "🎭", "🏺", "⛩️", "🕯️"],
  customs: ["🎭", "🎪", "🏛️", "📜", "🎉", "🕯️"],
  language: ["🗣️", "📚", "✍️", "🌐", "💬", "📝"],
  religion: ["⛪", "🕌", "🕍", "🛐", "📿", "🕯️"],
  festival: ["🎉", "🎊", "🎪", "🎭", "🎵", "🏮"],
  heritage: ["🏛️", "🏺", "📜", "🗿", "⛩️", "🏰"],
  ceremony: ["🎭", "🕯️", "💒", "🎉", "👰", "🤵"],
  ritual: ["🕯️", "📿", "🛐", "🎭", "⛩️", "🙏"],
  folklore: ["📜", "🎭", "🏛️", "🧙", "🐉", "🦄"],
  mythology: ["🐉", "🦄", "⚡", "🌟", "🏛️", "📜"],
  arts_crafts: ["🎨", "🖼️", "🏺", "🧶", "✂️", "🖌️"],
  etiquette: ["🤝", "🙏", "💐", "🎩", "👔", "📋"],
  national_identity: ["🏛️", "🏳️", "🎭", "📜", "🌟", "🏆"],

  // other 도메인
  hobbies: ["🎨", "📚", "🎵", "🎮", "🧶", "🎲"],
  finance_personal: ["💰", "💳", "🏦", "📊", "💵", "📈"],
  legal: ["⚖️", "📋", "👨‍💼", "🏛️", "📄", "✍️"],
  government: ["🏛️", "🗳️", "👨‍💼", "📋", "⚖️", "🏳️"],
  politics: ["🗳️", "🏛️", "📢", "👥", "📊", "🎯"],
  media: ["📺", "📰", "📻", "📱", "📸", "🎙️"],
  community: ["👥", "🏘️", "🤝", "🎪", "🏛️", "💚"],
  volunteering: ["🤝", "💚", "👥", "🌟", "🎯", "❤️"],
  charity: ["💚", "❤️", "🤝", "🎁", "🌟", "💰"],
  philosophy: ["🤔", "💭", "📚", "🧠", "💡", "🌟"],
  other: ["📝", "❓", "🔍", "💡", "⭐", "🎯"],
};

// 도메인 이모지 매핑
export const domainEmojiMapping = {
  daily: ["🏠", "👨‍👩‍👧‍👦", "⏰", "🛌", "🍽️", "🚿"],
  food: ["🍎", "🥕", "🥩", "🥛", "🍪", "🌾"],
  travel: ["✈️", "🏨", "🗼", "🧳", "🧭", "📅"],
  business: ["💼", "💰", "📊", "🏢", "📋", "🤝"],
  education: ["👨‍🏫", "📚", "🎓", "📝", "📊", "🧠"],
  nature: ["🐻", "🌱", "🌦️", "🗻", "🌍", "🌿"],
  technology: ["💻", "📱", "🌐", "📱", "🤖", "💾"],
  health: ["🏃", "💊", "🥗", "🧠", "🏥", "💪"],
  sports: ["⚽", "🏀", "🏊", "🏃", "🏈", "🥇"],
  entertainment: ["🎬", "🎵", "🎮", "📖", "🎨", "🎭"],
  culture: ["🏛️", "🎭", "🗣️", "⛪", "🎉", "🏺"],
  other: ["🎯", "💰", "⚖️", "🏛️", "🗳️", "📰"],
};

// 도메인별 색상 매핑
export const domainColorMapping = {
  daily: "#4B63AC",
  food: "#FF6B6B",
  travel: "#4ECDC4",
  business: "#45B7D1",
  education: "#96CEB4",
  nature: "#FECA57",
  technology: "#9C27B0",
  health: "#FF9FF3",
  sports: "#54A0FF",
  entertainment: "#5F27CD",
  culture: "#00D2D3",
  other: "#747D8C",
};

// 이모지 가져오기 함수
export function getEmojiForCategory(domain, category) {
  const categoryEmojis = categoryEmojiMapping[category];
  if (categoryEmojis && categoryEmojis.length > 0) {
    return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  }

  const domainEmojis = domainEmojiMapping[domain];
  if (domainEmojis && domainEmojis.length > 0) {
    return domainEmojis[Math.floor(Math.random() * domainEmojis.length)];
  }

  return "📝"; // 기본 이모지
}

// 도메인별 색상 가져오기 함수
export function getColorForDomain(domain) {
  return domainColorMapping[domain] || "#747D8C";
}

// 카테고리 옵션 업데이트 함수
function updateCategoryOptions() {
  const domainSelect = document.getElementById("domain-filter");
  const categorySelect = document.getElementById("category-filter");

  if (!domainSelect || !categorySelect) return;

  const selectedDomain = domainSelect.value;
  const categories = domainCategoryMapping[selectedDomain] || [];

  // 카테고리 옵션 초기화
  categorySelect.innerHTML = '<option value="">전체 카테고리</option>';

  // 카테고리 옵션 추가
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// 도메인 카테고리 이모지 언어 업데이트 함수
function updateDomainCategoryEmojiLanguage() {
  console.log("도메인 카테고리 이모지 언어 업데이트 완료");
}

// 편집 모달용 카테고리 옵션 업데이트 함수
function updateEditCategoryOptions() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categorySelect = document.getElementById("edit-concept-category");

  if (!domainSelect || !categorySelect) {
    console.warn(
      "편집 모달 도메인 또는 카테고리 선택 요소를 찾을 수 없습니다."
    );
    return;
  }

  const selectedDomain = domainSelect.value;
  const categories = domainCategoryMapping[selectedDomain] || [];

  console.log(
    "🔄 편집 모달 카테고리 옵션 업데이트:",
    selectedDomain,
    categories
  );

  // 카테고리 옵션 초기화
  categorySelect.innerHTML = '<option value="">카테고리 선택</option>';

  // 카테고리 옵션 추가
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// 편집 모달용 이모지 옵션 업데이트 함수
function updateEditEmojiOptions() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categorySelect = document.getElementById("edit-concept-category");
  const emojiSelect = document.getElementById("edit-concept-emoji");

  if (!domainSelect || !categorySelect || !emojiSelect) {
    console.warn(
      "편집 모달 도메인, 카테고리 또는 이모지 선택 요소를 찾을 수 없습니다."
    );
    return;
  }

  const selectedDomain = domainSelect.value;
  const selectedCategory = categorySelect.value;

  console.log(
    "🎨 편집 모달 이모지 옵션 업데이트:",
    selectedDomain,
    selectedCategory
  );

  // 이모지 옵션 초기화
  emojiSelect.innerHTML = '<option value="">이모지 선택</option>';

  // 카테고리별 이모지 추가 (더 안전한 접근)
  if (selectedCategory && categoryEmojiMapping) {
    const categoryEmojis = categoryEmojiMapping[selectedCategory];
    if (
      categoryEmojis &&
      Array.isArray(categoryEmojis) &&
      categoryEmojis.length > 0
    ) {
      categoryEmojis.forEach((emoji) => {
        const option = document.createElement("option");
        option.value = emoji;
        option.textContent = emoji;
        emojiSelect.appendChild(option);
      });
      console.log(
        `✅ 카테고리 ${selectedCategory} 이모지 ${categoryEmojis.length}개 추가`
      );
    } else {
      console.log(`⚠️ 카테고리 ${selectedCategory}에 대한 이모지가 없습니다`);
    }
  }

  // 도메인별 이모지 추가 (카테고리 이모지가 없는 경우, 더 안전한 접근)
  if (
    selectedDomain &&
    domainEmojiMapping &&
    emojiSelect.options.length === 1
  ) {
    const domainEmojis = domainEmojiMapping[selectedDomain];
    if (
      domainEmojis &&
      Array.isArray(domainEmojis) &&
      domainEmojis.length > 0
    ) {
      domainEmojis.forEach((emoji) => {
        const option = document.createElement("option");
        option.value = emoji;
        option.textContent = emoji;
        emojiSelect.appendChild(option);
      });
      console.log(
        `✅ 도메인 ${selectedDomain} 이모지 ${domainEmojis.length}개 추가`
      );
    } else {
      console.log(`⚠️ 도메인 ${selectedDomain}에 대한 이모지가 없습니다`);
    }
  }

  // 전역 저장소에 저장된 이모지 값이 있으면 선택
  if (window.editConceptEmojiValue) {
    const emojiValue = window.editConceptEmojiValue;
    const existingOption = Array.from(emojiSelect.options).find(
      (option) => option.value === emojiValue
    );

    if (existingOption) {
      emojiSelect.value = emojiValue;
    } else {
      // 옵션에 없으면 새로 추가
      const option = document.createElement("option");
      option.value = emojiValue;
      option.textContent = emojiValue;
      emojiSelect.appendChild(option);
      emojiSelect.value = emojiValue;
    }

    console.log("🎯 편집 모달 이모지 값 설정:", emojiValue);
  }
}

// 전역 함수로 내보내기
window.updateCategoryOptions = updateCategoryOptions;
window.updateDomainCategoryEmojiLanguage = updateDomainCategoryEmojiLanguage;
window.updateEditCategoryOptions = updateEditCategoryOptions;
window.updateEditEmojiOptions = updateEditEmojiOptions;

// DOM 로드 시 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
  const domainSelect = document.getElementById("domain-filter");
  if (domainSelect) {
    domainSelect.addEventListener("change", updateCategoryOptions);
  }
});
