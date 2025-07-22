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
  household: ["🏠", "🛋️", "🪑", "🛏️", "🚪", "🪟", "🧹", "🧽", "🧴"],
  family: ["👨‍👩‍👧‍👦", "👶", "👵", "👴", "👨‍👧", "👩‍👧", "👪", "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧"],
  routine: ["⏰", "🛌", "🚿", "🍽️", "🚌", "💼", "☕", "📰", "🪥"],
  clothing: ["👕", "👖", "👗", "👔", "👚", "👠", "👢", "👟", "🧥", "👒", "🧢"],
  furniture: ["🛋️", "🪑", "🛏️", "🗄️", "📚", "🪞", "🪆", "🛏", "🪜"],
  shopping: ["🛍️", "🛒", "💳", "💰", "🏪", "🏬", "🎁", "📦", "🏷️"],
  communication: ["📞", "📱", "💬", "📧", "📮", "📬", "📯", "📢", "💌"],
  personal_care: ["🧴", "🧽", "🪥", "🧼", "💄", "💅", "🧴", "🪒", "💆"],
  leisure: ["📺", "🎮", "📖", "🎵", "🎨", "🎲", "🎪", "🎭", "🎬"],
  relationships: ["💕", "👫", "👬", "👭", "💑", "💏", "💍", "💒", "👰"],
  emotions: [
    "😊",
    "😢",
    "😡",
    "😴",
    "😍",
    "🤔",
    "😂",
    "😭",
    "😤",
    "😌",
    "🥰",
    "😟",
    "😮",
    "🤗",
    "😎",
  ],
  time: ["⏰", "⏱️", "⏲️", "🕐", "📅", "📆", "🕑", "🕒", "🕓"],
  weather_talk: ["☀️", "🌧️", "⛅", "❄️", "🌈", "⛈️", "🌤️", "🌦️", "🌪️", "🌫️"],

  // food 도메인
  fruit: [
    "🍎",
    "🍌",
    "🍇",
    "🍓",
    "🍑",
    "🍒",
    "🍊",
    "🥭",
    "🍍",
    "🥝",
    "🥥",
    "🫐",
  ],
  vegetable: [
    "🥕",
    "🥬",
    "🥒",
    "🍅",
    "🥔",
    "🧅",
    "🥦",
    "🌽",
    "🥑",
    "🫑",
    "🍆",
    "🫒",
  ],
  meat: ["🥩", "🍖", "🍗", "🥓", "🍤", "🦐", "🍖", "🥩", "🦴"],
  drink: ["💧", "🥛", "☕", "🍵", "🥤", "🧃", "🍺", "🍷", "🥂", "🧋", "🧊"],
  snack: ["🍪", "🍰", "🧁", "🍩", "🍿", "🥨", "🍘", "🍙", "🍚"],
  grain: ["🌾", "🍞", "🥖", "🥐", "🥯", "🍚", "🥣", "🌾", "🍜"],
  seafood: ["🐟", "🦐", "🦀", "🐙", "🦑", "🐠", "🦞", "🐡", "🐚", "🦈"],
  dairy: ["🥛", "🧀", "🧈", "🥚", "🍳", "🥞", "🧈", "🥛"],
  cooking: ["🍳", "🥘", "🍲", "🥗", "🍱", "🍜", "🥟", "🍛", "🍚"],
  dining: ["🍽️", "🥄", "🍴", "🥢", "🍷", "🥂", "🍾", "🥃"],
  restaurant: ["🏪", "🍕", "🍔", "🌮", "🍜", "🍣", "🥘", "🍱", "🍲"],
  kitchen_utensils: ["🔪", "🥄", "🍴", "🥢", "🍳", "🥘", "🥣", "🍶"],
  spices: ["🧄", "🌶️", "🧂", "🌿", "🍯", "🫒", "🌶️", "🧂"],
  dessert: ["🍰", "🧁", "🍪", "🍩", "🍫", "🍬", "🍭", "🍮", "🎂", "🍨", "🍧"],

  // travel 도메인
  transportation: [
    "🚗",
    "🚙",
    "🚐",
    "🚛",
    "🚌",
    "🚎",
    "✈️",
    "🚂",
    "🚇",
    "🚢",
    "🚁",
    "🛺",
  ],
  accommodation: ["🏨", "🏩", "🏠", "🏡", "🏢", "🏣", "🏕️", "🏖️", "🏛️"],
  tourist_attraction: [
    "🏛️",
    "🏰",
    "🗼",
    "🎡",
    "🎢",
    "🎠",
    "🗽",
    "🎪",
    "🎭",
    "🎨",
    "🏖️",
    "🏔️",
  ],
  luggage: ["🧳", "🎒", "👜", "💼", "🛍️", "📦", "🎒", "🧳"],
  direction: ["🧭", "🗺️", "📍", "🚩", "⬆️", "⬇️", "➡️", "⬅️", "🔄"],
  booking: ["📅", "📋", "💳", "🎫", "📄", "✅", "🏨", "✈️"],
  currency: ["💰", "💵", "💴", "💶", "💷", "🪙", "💳", "🏦"],
  culture: ["🏛️", "🎭", "🎨", "📚", "🗿", "⛩️", "🎪", "🎵", "🎸"],
  emergency: ["🚨", "🆘", "🚑", "🚒", "👮", "🏥", "📞", "🚨"],
  documents: ["📄", "📋", "🆔", "📘", "📗", "📙", "🛂", "📑"],
  sightseeing: ["📸", "🔭", "👀", "🗺️", "🎯", "🎪", "🌅", "🌄", "🖼️"],
  local_food: [
    "🍜",
    "🍱",
    "🍣",
    "🥟",
    "🌮",
    "🍕",
    "🥘",
    "🍛",
    "🍲",
    "🥗",
    "🍝",
  ],
  souvenir: ["🎁", "🛍️", "🏺", "🖼️", "📿", "🎀", "🧸", "🎭"],

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
  animal: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🦆",
  ],
  plant: [
    "🌱",
    "🌿",
    "🌳",
    "🌲",
    "🌴",
    "🌵",
    "🌸",
    "🌺",
    "🌻",
    "🌷",
    "🌹",
    "🌼",
  ],
  weather: [
    "☀️",
    "🌧️",
    "⛅",
    "❄️",
    "🌈",
    "⛈️",
    "🌤️",
    "🌦️",
    "🌪️",
    "🌫️",
    "🌨️",
    "❄️",
  ],
  geography: ["🏔️", "🏞️", "🏜️", "🏖️", "🌋", "🗻", "🏕️", "🏝️", "🌊"],
  environment: ["🌍", "🌱", "♻️", "🌿", "🌊", "🌳", "🌎", "🌏", "💚"],
  ecosystem: ["🌳", "🐝", "🦋", "🌸", "🍄", "🌿", "🐛", "🦗", "🕷️"],
  conservation: ["♻️", "🌱", "🌍", "🛡️", "💚", "🌿", "🌳", "🌊"],
  climate: ["🌡️", "❄️", "☀️", "🌧️", "🌪️", "🌊", "🌨️", "🌤️"],
  natural_disaster: ["🌪️", "🌋", "⛈️", "🌊", "🔥", "❄️", "💥", "🌀"],
  landscape: ["🏔️", "🏞️", "🌅", "🌄", "🏖️", "🏜️", "🌋", "🗻", "🏕️"],
  marine_life: ["🐠", "🐟", "🦈", "🐙", "🦀", "🐚", "🐳", "🐋", "🦑", "🐡"],
  forest: ["🌳", "🌲", "🌿", "🦌", "🐿️", "🍄", "🌲", "🌿", "🦋"],
  mountain: ["🏔️", "⛰️", "🗻", "🧗", "🏕️", "🦅", "🏔️", "🎿"],

  // technology 도메인
  computer: ["💻", "🖥️", "⌨️", "🖱️", "💾", "💿", "📱", "💻", "🖥️"],
  software: ["💻", "📱", "⚙️", "🔧", "💾", "🖥️", "📱", "💾", "🔧"],
  internet: ["🌐", "📡", "💻", "📱", "🔗", "📧", "🌐", "📶", "📡"],
  mobile: ["📱", "📞", "💬", "📧", "📷", "🎵", "📱", "📞", "💬"],
  ai: ["🤖", "🧠", "💡", "⚙️", "🔮", "🌟", "🤖", "🧠", "💡"],
  programming: ["💻", "⌨️", "🖥️", "🔧", "⚙️", "💾", "💻", "⌨️", "🖥️"],
  cybersecurity: ["🔒", "🛡️", "🔐", "🚨", "💻", "🔑", "🔒", "🛡️"],
  database: ["💾", "📊", "🗄️", "💻", "🔍", "📋", "💾", "📊"],
  robotics: ["🤖", "⚙️", "🔧", "💻", "🦾", "🦿", "🤖", "⚙️"],
  blockchain: ["🔗", "💰", "🔐", "💻", "📊", "🌐", "🔗", "💰"],
  cloud: ["☁️", "💻", "🌐", "📊", "💾", "🔗", "☁️", "💻"],
  social_media: ["📱", "💬", "📸", "👥", "🌐", "❤️", "📱", "💬", "📸"],
  gaming: ["🎮", "🕹️", "🎯", "🏆", "🎪", "🎲", "🎮", "🕹️", "🎯"],
  innovation: ["💡", "🚀", "⚡", "🌟", "🔬", "🧪", "💡", "🚀"],

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
  hobbies: [
    "🎨",
    "📚",
    "🎵",
    "🎮",
    "🧶",
    "🎲",
    "🎯",
    "🎪",
    "🎭",
    "🎪",
    "🎨",
    "🎸",
    "🎹",
    "🎺",
  ],
  finance_personal: ["💰", "💳", "🏦", "📊", "💵", "📈", "💰", "💸", "🏦"],
  legal: ["⚖️", "📋", "👨‍💼", "🏛️", "📄"],
  government: ["🏛️", "🗳️", "👨‍💼", "📋", "⚖️"],
  politics: ["🗳️", "🏛️", "📢", "👥", "📊"],
  media: ["📺", "📰", "📻", "📱", "📸", "🎙️", "📹", "📡"],
  community: ["👥", "🏘️", "🤝", "🎪", "🏛️", "💚", "🏘️", "🏠", "🏢"],
  volunteering: ["🤝", "💚", "👥", "🌟", "🎯", "❤️", "🙋", "🤲"],
  charity: ["💚", "❤️", "🤝", "🎁", "🌟", "💰", "🎗️", "🤲"],
  philosophy: ["🤔", "💭", "📚", "🧠", "💡"],
  other: ["📝", "❓", "🔍", "💡", "⭐"],
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
function updateDomainCategoryEmojiLanguage() {}

// 개념 추가 모달용 카테고리 옵션 업데이트 함수
function updateAddCategoryOptions() {
  const domainSelect = document.getElementById("concept-domain");
  const categorySelect = document.getElementById("concept-category");

  if (!domainSelect || !categorySelect) {
    console.warn(
      "개념 추가 모달 도메인 또는 카테고리 선택 요소를 찾을 수 없습니다."
    );
    return;
  }

  const selectedDomain = domainSelect.value;
  const categories = domainCategoryMapping[selectedDomain] || [];

  // 현재 언어 감지
  const currentLang = localStorage.getItem("userLanguage") || "ko";

  // 카테고리 선택 플레이스홀더 번역
  const categoryPlaceholder = getTranslatedText(
    "category_placeholder",
    currentLang
  );

  // 카테고리 옵션 초기화
  categorySelect.innerHTML = `<option value="">${categoryPlaceholder}</option>`;

  // 카테고리 옵션 추가 (번역 적용)
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = getTranslatedText(category, currentLang);
    categorySelect.appendChild(option);
  });

  // 카테고리 변경 후 이모지 옵션 업데이트
  updateAddEmojiOptions();
}

// 번역 텍스트 가져오기 함수
function getTranslatedText(key, lang) {
  // 전역 번역 객체 확인
  if (
    window.translations &&
    window.translations[lang] &&
    window.translations[lang][key]
  ) {
    return window.translations[lang][key];
  }

  // 도메인 및 카테고리 번역 매핑
  const translations = {
    ko: {
      domain_placeholder: "도메인 선택",
      category_placeholder: "카테고리 선택",
      emoji_placeholder: "이모지 선택",
      // 도메인 번역
      daily: "일상생활",
      business: "비즈니스",
      education: "교육",
      travel: "여행",
      food: "음식",
      nature: "자연",
      technology: "기술",
      health: "건강",
      sports: "스포츠",
      entertainment: "엔터테인먼트",
      culture: "문화",
      // 카테고리 번역
      fruit: "과일",
      animal: "동물",
      other: "기타",
      // daily 카테고리들
      household: "가정용품",
      family: "가족",
      routine: "일상",
      clothing: "의류",
      furniture: "가구",
      shopping: "쇼핑",
      transportation: "교통",
      communication: "소통",
      personal_care: "개인관리",
      leisure: "여가",
      relationships: "인간관계",
      emotions: "감정",
      time: "시간",
      weather_talk: "날씨",
      // food 카테고리들
      vegetable: "채소",
      meat: "육류",
      drink: "음료",
      snack: "간식",
      grain: "곡물",
      seafood: "해산물",
      dairy: "유제품",
      cooking: "요리",
      dining: "식사",
      restaurant: "레스토랑",
      kitchen_utensils: "주방용품",
      spices: "향신료",
      dessert: "디저트",
      // travel 카테고리들
      accommodation: "숙박",
      tourist_attraction: "관광지",
      luggage: "수하물",
      direction: "방향",
      booking: "예약",
      currency: "통화",
      culture: "문화",
      emergency: "응급상황",
      documents: "서류",
      sightseeing: "관광",
      local_food: "현지음식",
      souvenir: "기념품",
      // business 카테고리들
      meeting: "회의",
      finance: "금융",
      marketing: "마케팅",
      office: "사무실",
      project: "프로젝트",
      negotiation: "협상",
      presentation: "프레젠테이션",
      teamwork: "팀워크",
      leadership: "리더십",
      networking: "네트워킹",
      sales: "영업",
      contract: "계약",
      startup: "스타트업",
      // education 카테고리들
      teaching: "교육",
      learning: "학습",
      classroom: "교실",
      curriculum: "교육과정",
      assessment: "평가",
      pedagogy: "교육학",
      skill_development: "기술개발",
      online_learning: "온라인학습",
      training: "훈련",
      certification: "인증",
      educational_technology: "교육기술",
      student_life: "학생생활",
      graduation: "졸업",
      examination: "시험",
      university: "대학",
      library: "도서관",
      philosophy: "철학",
      // nature 카테고리들
      plant: "식물",
      weather: "날씨",
      geography: "지리",
      environment: "환경",
      ecosystem: "생태계",
      conservation: "보존",
      climate: "기후",
      natural_disaster: "자연재해",
      landscape: "경관",
      marine_life: "해양생물",
      forest: "숲",
      mountain: "산",
      // technology 카테고리들
      computer: "컴퓨터",
      software: "소프트웨어",
      internet: "인터넷",
      mobile: "모바일",
      ai: "인공지능",
      programming: "프로그래밍",
      cybersecurity: "사이버보안",
      database: "데이터베이스",
      robotics: "로봇공학",
      blockchain: "블록체인",
      cloud: "클라우드",
      social_media: "소셜미디어",
      gaming: "게임",
      innovation: "혁신",
      // health 카테고리들
      exercise: "운동",
      medicine: "의학",
      nutrition: "영양",
      mental_health: "정신건강",
      hospital: "병원",
      fitness: "피트니스",
      wellness: "웰니스",
      therapy: "치료",
      prevention: "예방",
      symptoms: "증상",
      treatment: "치료",
      pharmacy: "약국",
      rehabilitation: "재활",
      medical_equipment: "의료장비",
      // sports 카테고리들
      football: "축구",
      basketball: "농구",
      swimming: "수영",
      running: "달리기",
      equipment: "장비",
      olympics: "올림픽",
      tennis: "테니스",
      baseball: "야구",
      golf: "골프",
      martial_arts: "무술",
      team_sports: "팀스포츠",
      individual_sports: "개인스포츠",
      coaching: "코칭",
      competition: "경쟁",
      // entertainment 카테고리들
      movie: "영화",
      game: "게임",
      book: "책",
      theater: "극장",
      concert: "콘서트",
      festival: "축제",
      celebrity: "유명인",
      tv_show: "TV쇼",
      comedy: "코미디",
      drama: "드라마",
      animation: "애니메이션",
      photography: "사진",
      // culture 카테고리들
      tradition: "전통",
      customs: "관습",
      language: "언어",
      religion: "종교",
      heritage: "유산",
      ceremony: "의식",
      ritual: "의례",
      folklore: "민속",
      mythology: "신화",
      arts_crafts: "예술공예",
      etiquette: "예절",
      national_identity: "국가정체성",
      // other 카테고리들
      hobbies: "취미",
      finance_personal: "개인재정",
      legal: "법률",
      government: "정부",
      politics: "정치",
      media: "미디어",
      community: "커뮤니티",
      volunteering: "자원봉사",
      charity: "자선",
      philosophy: "철학",
    },
    en: {
      domain_placeholder: "Select Domain",
      category_placeholder: "Select Category",
      emoji_placeholder: "Select Emoji",
      // 도메인 번역
      daily: "Daily",
      business: "Business",
      education: "Education",
      travel: "Travel",
      food: "Food",
      nature: "Nature",
      technology: "Technology",
      health: "Health",
      sports: "Sports",
      entertainment: "Entertainment",
      culture: "Culture",
      // 카테고리 번역
      fruit: "Fruit",
      animal: "Animal",
      other: "Other",
      // daily 카테고리들
      household: "Household",
      family: "Family",
      routine: "Routine",
      clothing: "Clothing",
      furniture: "Furniture",
      shopping: "Shopping",
      transportation: "Transportation",
      communication: "Communication",
      personal_care: "Personal Care",
      leisure: "Leisure",
      relationships: "Relationships",
      emotions: "Emotions",
      time: "Time",
      weather_talk: "Weather",
      // food 카테고리들
      vegetable: "Vegetable",
      meat: "Meat",
      drink: "Drink",
      snack: "Snack",
      grain: "Grain",
      seafood: "Seafood",
      dairy: "Dairy",
      cooking: "Cooking",
      dining: "Dining",
      restaurant: "Restaurant",
      kitchen_utensils: "Kitchen Utensils",
      spices: "Spices",
      dessert: "Dessert",
      // travel 카테고리들
      accommodation: "Accommodation",
      tourist_attraction: "Tourist Attraction",
      luggage: "Luggage",
      direction: "Direction",
      booking: "Booking",
      currency: "Currency",
      culture: "Culture",
      emergency: "Emergency",
      documents: "Documents",
      sightseeing: "Sightseeing",
      local_food: "Local Food",
      souvenir: "Souvenir",
      // business 카테고리들
      meeting: "Meeting",
      finance: "Finance",
      marketing: "Marketing",
      office: "Office",
      project: "Project",
      negotiation: "Negotiation",
      presentation: "Presentation",
      teamwork: "Teamwork",
      leadership: "Leadership",
      networking: "Networking",
      sales: "Sales",
      contract: "Contract",
      startup: "Startup",
      // education 카테고리들
      teaching: "Teaching",
      learning: "Learning",
      classroom: "Classroom",
      curriculum: "Curriculum",
      assessment: "Assessment",
      pedagogy: "Pedagogy",
      skill_development: "Skill Development",
      online_learning: "Online Learning",
      training: "Training",
      certification: "Certification",
      educational_technology: "Educational Technology",
      student_life: "Student Life",
      graduation: "Graduation",
      examination: "Examination",
      university: "University",
      library: "Library",
      philosophy: "Philosophy",
      // nature 카테고리들
      plant: "Plant",
      weather: "Weather",
      geography: "Geography",
      environment: "Environment",
      ecosystem: "Ecosystem",
      conservation: "Conservation",
      climate: "Climate",
      natural_disaster: "Natural Disaster",
      landscape: "Landscape",
      marine_life: "Marine Life",
      forest: "Forest",
      mountain: "Mountain",
      // technology 카테고리들
      computer: "Computer",
      software: "Software",
      internet: "Internet",
      mobile: "Mobile",
      ai: "AI",
      programming: "Programming",
      cybersecurity: "Cybersecurity",
      database: "Database",
      robotics: "Robotics",
      blockchain: "Blockchain",
      cloud: "Cloud",
      social_media: "Social Media",
      gaming: "Gaming",
      innovation: "Innovation",
      // health 카테고리들
      exercise: "Exercise",
      medicine: "Medicine",
      nutrition: "Nutrition",
      mental_health: "Mental Health",
      hospital: "Hospital",
      fitness: "Fitness",
      wellness: "Wellness",
      therapy: "Therapy",
      prevention: "Prevention",
      symptoms: "Symptoms",
      treatment: "Treatment",
      pharmacy: "Pharmacy",
      rehabilitation: "Rehabilitation",
      medical_equipment: "Medical Equipment",
      // sports 카테고리들
      football: "Football",
      basketball: "Basketball",
      swimming: "Swimming",
      running: "Running",
      equipment: "Equipment",
      olympics: "Olympics",
      tennis: "Tennis",
      baseball: "Baseball",
      golf: "Golf",
      martial_arts: "Martial Arts",
      team_sports: "Team Sports",
      individual_sports: "Individual Sports",
      coaching: "Coaching",
      competition: "Competition",
      // entertainment 카테고리들
      movie: "Movie",
      game: "Game",
      book: "Book",
      theater: "Theater",
      concert: "Concert",
      festival: "Festival",
      celebrity: "Celebrity",
      tv_show: "TV Show",
      comedy: "Comedy",
      drama: "Drama",
      animation: "Animation",
      photography: "Photography",
      // culture 카테고리들
      tradition: "Tradition",
      customs: "Customs",
      language: "Language",
      religion: "Religion",
      heritage: "Heritage",
      ceremony: "Ceremony",
      ritual: "Ritual",
      folklore: "Folklore",
      mythology: "Mythology",
      arts_crafts: "Arts and Crafts",
      etiquette: "Etiquette",
      national_identity: "National Identity",
      // other 카테고리들
      hobbies: "Hobbies",
      finance_personal: "Personal Finance",
      legal: "Legal",
      government: "Government",
      politics: "Politics",
      media: "Media",
      community: "Community",
      volunteering: "Volunteering",
      charity: "Charity",
      philosophy: "Philosophy",
    },
    ja: {
      domain_placeholder: "ドメインを選択",
      category_placeholder: "カテゴリー選択",
      emoji_placeholder: "絵文字を選択",
      // 도메인 번역
      daily: "日常生活",
      business: "ビジネス",
      education: "教育",
      travel: "旅行",
      food: "食べ物",
      nature: "自然",
      technology: "技術",
      health: "健康",
      sports: "スポーツ",
      entertainment: "エンターテイメント",
      culture: "文化",
      // 카테고리 번역
      fruit: "果物",
      animal: "動物",
      other: "その他",
      // daily 카테고리들
      household: "家庭用品",
      family: "家族",
      routine: "日常",
      clothing: "衣類",
      furniture: "家具",
      shopping: "ショッピング",
      transportation: "交通",
      communication: "コミュニケーション",
      personal_care: "個人ケア",
      leisure: "レジャー",
      relationships: "人間関係",
      emotions: "感情",
      time: "時間",
      weather_talk: "天気",
      // food 카테고리들
      vegetable: "野菜",
      meat: "肉",
      drink: "飲み物",
      snack: "スナック",
      grain: "穀物",
      seafood: "海鮮",
      dairy: "乳製品",
      cooking: "料理",
      dining: "食事",
      restaurant: "レストラン",
      kitchen_utensils: "調理器具",
      spices: "香辛料",
      dessert: "デザート",
      // travel 카테고리들
      accommodation: "宿泊",
      tourist_attraction: "観光地",
      luggage: "荷物",
      direction: "方向",
      booking: "予約",
      currency: "通貨",
      culture: "文化",
      emergency: "緊急事態",
      documents: "書類",
      sightseeing: "観光",
      local_food: "地元料理",
      souvenir: "お土産",
      // business 카테고리들
      meeting: "会議",
      finance: "金融",
      marketing: "マーケティング",
      office: "オフィス",
      project: "プロジェクト",
      negotiation: "交渉",
      presentation: "プレゼンテーション",
      teamwork: "チームワーク",
      leadership: "リーダーシップ",
      networking: "ネットワーキング",
      sales: "営業",
      contract: "契約",
      startup: "スタートアップ",
      // education 카테고리들
      teaching: "教育",
      learning: "学習",
      classroom: "教室",
      curriculum: "カリキュラム",
      assessment: "評価",
      pedagogy: "教育学",
      skill_development: "スキル開発",
      online_learning: "オンライン学習",
      training: "トレーニング",
      certification: "認定",
      educational_technology: "教育技術",
      student_life: "学生生活",
      graduation: "卒業",
      examination: "試験",
      university: "大学",
      library: "図書館",
      philosophy: "哲学",
      // nature 카테고리들
      plant: "植物",
      weather: "天気",
      geography: "地理",
      environment: "環境",
      ecosystem: "生態系",
      conservation: "保存",
      climate: "気候",
      natural_disaster: "自然災害",
      landscape: "景観",
      marine_life: "海洋生物",
      forest: "森",
      mountain: "山",
      // technology 카테고리들
      computer: "コンピューター",
      software: "ソフトウェア",
      internet: "インターネット",
      mobile: "モバイル",
      ai: "AI",
      programming: "プログラミング",
      cybersecurity: "サイバーセキュリティ",
      database: "データベース",
      robotics: "ロボティクス",
      blockchain: "ブロックチェーン",
      cloud: "クラウド",
      social_media: "ソーシャルメディア",
      gaming: "ゲーム",
      innovation: "イノベーション",
      // health 카테고리들
      exercise: "運動",
      medicine: "医学",
      nutrition: "栄養",
      mental_health: "メンタルヘルス",
      hospital: "病院",
      fitness: "フィットネス",
      wellness: "ウェルネス",
      therapy: "セラピー",
      prevention: "予防",
      symptoms: "症状",
      treatment: "治療",
      pharmacy: "薬局",
      rehabilitation: "リハビリテーション",
      medical_equipment: "医療機器",
      // sports 카테고리들
      football: "サッカー",
      basketball: "バスケットボール",
      swimming: "水泳",
      running: "ランニング",
      equipment: "装備",
      olympics: "オリンピック",
      tennis: "テニス",
      baseball: "野球",
      golf: "ゴルフ",
      martial_arts: "武術",
      team_sports: "チームスポーツ",
      individual_sports: "個人スポーツ",
      coaching: "コーチング",
      competition: "競争",
      // entertainment 카테고리들
      movie: "映画",
      game: "ゲーム",
      book: "本",
      theater: "劇場",
      concert: "コンサート",
      festival: "祭り",
      celebrity: "有名人",
      tv_show: "TV番組",
      comedy: "コメディ",
      drama: "ドラマ",
      animation: "アニメ",
      photography: "写真",
      // culture 카테고리들
      tradition: "伝統",
      customs: "習慣",
      language: "言語",
      religion: "宗教",
      heritage: "遺産",
      ceremony: "儀式",
      ritual: "儀礼",
      folklore: "民俗",
      mythology: "神話",
      arts_crafts: "芸術工芸",
      etiquette: "礼儀",
      national_identity: "国家統一感",
      // other 카테고리들
      hobbies: "趣味",
      finance_personal: "個人金融",
      legal: "法律",
      government: "政府",
      politics: "政治",
      media: "メディア",
      community: "コミュニティ",
      volunteering: "ボランティア",
      charity: "慈善",
      philosophy: "哲学",
    },
    zh: {
      domain_placeholder: "选择域",
      category_placeholder: "选择分类",
      emoji_placeholder: "选择表情符号",
      // 도메인 번역
      daily: "日常生活",
      business: "商务",
      education: "教育",
      travel: "旅行",
      food: "食物",
      nature: "自然",
      technology: "技术",
      health: "健康",
      sports: "体育",
      entertainment: "娱乐",
      culture: "文化",
      // 카테고리 번역
      fruit: "水果",
      animal: "动物",
      other: "其他",
      // daily 카테고리들
      household: "家居用品",
      family: "家庭",
      routine: "日常",
      clothing: "服装",
      furniture: "家具",
      shopping: "购物",
      transportation: "交通",
      communication: "沟通",
      personal_care: "个人护理",
      leisure: "休闲",
      relationships: "人际关系",
      emotions: "情感",
      time: "时间",
      weather_talk: "天气",
      // food 카테고리들
      vegetable: "蔬菜",
      meat: "肉类",
      drink: "饮料",
      snack: "零食",
      grain: "谷物",
      seafood: "海鲜",
      dairy: "乳制品",
      cooking: "烹饪",
      dining: "用餐",
      restaurant: "餐厅",
      kitchen_utensils: "厨具",
      spices: "香料",
      dessert: "甜点",
      // travel 카테고리들
      accommodation: "住宿",
      tourist_attraction: "旅游景点",
      luggage: "行李",
      direction: "方向",
      booking: "预订",
      currency: "货币",
      culture: "文化",
      emergency: "紧急情况",
      documents: "文件",
      sightseeing: "观光",
      local_food: "当地美食",
      souvenir: "纪念品",
      // business 카테고리들
      meeting: "会议",
      finance: "金融",
      marketing: "市场营销",
      office: "办公室",
      project: "项目",
      negotiation: "谈判",
      presentation: "演示",
      teamwork: "团队合作",
      leadership: "领导力",
      networking: "人际网络",
      sales: "销售",
      contract: "合同",
      startup: "创业",
      // education 카테고리들
      teaching: "教学",
      learning: "学习",
      classroom: "教室",
      curriculum: "课程",
      assessment: "评估",
      pedagogy: "教育学",
      skill_development: "技能开发",
      online_learning: "在线学习",
      training: "培训",
      certification: "认证",
      educational_technology: "教育技术",
      student_life: "学生生活",
      graduation: "毕业",
      examination: "考试",
      university: "大学",
      library: "图书馆",
      philosophy: "哲学",
      // nature 카테고리들
      plant: "植物",
      weather: "天气",
      geography: "地理",
      environment: "环境",
      ecosystem: "生态系统",
      conservation: "保护",
      climate: "气候",
      natural_disaster: "自然灾害",
      landscape: "景观",
      marine_life: "海洋生物",
      forest: "森林",
      mountain: "山",
      // technology 카테고리들
      computer: "计算机",
      software: "软件",
      internet: "互联网",
      mobile: "移动设备",
      ai: "人工智能",
      programming: "编程",
      cybersecurity: "网络安全",
      database: "数据库",
      robotics: "机器人技术",
      blockchain: "区块链",
      cloud: "云计算",
      social_media: "社交媒体",
      gaming: "游戏",
      innovation: "创新",
      // health 카테고리들
      exercise: "锻炼",
      medicine: "医学",
      nutrition: "营养",
      mental_health: "心理健康",
      hospital: "医院",
      fitness: "健身",
      wellness: "健康",
      therapy: "治疗",
      prevention: "预防",
      symptoms: "症状",
      treatment: "治疗",
      pharmacy: "药店",
      rehabilitation: "康复",
      medical_equipment: "医疗设备",
      // sports 카테고리들
      football: "足球",
      basketball: "篮球",
      swimming: "游泳",
      running: "跑步",
      equipment: "装备",
      olympics: "奥运会",
      tennis: "网球",
      baseball: "棒球",
      golf: "高尔夫",
      martial_arts: "武术",
      team_sports: "团队运动",
      individual_sports: "个人运动",
      coaching: "教练",
      competition: "竞争",
      // entertainment 카테고리들
      movie: "电影",
      game: "游戏",
      book: "书",
      theater: "剧院",
      concert: "音乐会",
      festival: "节日",
      celebrity: "名人",
      tv_show: "电视节目",
      comedy: "喜剧",
      drama: "戏剧",
      animation: "动画",
      photography: "摄影",
      // culture 카테고리들
      tradition: "传统",
      customs: "习俗",
      language: "语言",
      religion: "宗教",
      heritage: "遗产",
      ceremony: "仪式",
      ritual: "礼仪",
      folklore: "民俗",
      mythology: "神话",
      arts_crafts: "艺术手工艺",
      etiquette: "礼仪",
      national_identity: "国家统一感",
      // other 카테고리들
      hobbies: "爱好",
      finance_personal: "个人金融",
      legal: "法律",
      government: "政府",
      politics: "政治",
      media: "媒体",
      community: "社区",
      volunteering: "志愿服务",
      charity: "慈善",
      philosophy: "哲学",
    },
  };

  return translations[lang]?.[key] || key;
}

// 개념 추가 모달용 이모지 옵션 업데이트 함수
function updateAddEmojiOptions() {
  const domainSelect = document.getElementById("concept-domain");
  const categorySelect = document.getElementById("concept-category");
  const emojiSelect = document.getElementById("concept-emoji");

  if (!domainSelect || !categorySelect || !emojiSelect) {
    console.warn(
      "개념 추가 모달 도메인, 카테고리 또는 이모지 선택 요소를 찾을 수 없습니다."
    );
    return;
  }

  const selectedDomain = domainSelect.value;
  const selectedCategory = categorySelect.value;

  // 현재 언어 감지
  const currentLang = localStorage.getItem("userLanguage") || "ko";

  // 이모지 선택 플레이스홀더 번역
  const emojiPlaceholder = getTranslatedText("emoji_placeholder", currentLang);

  // 이모지 옵션 초기화
  emojiSelect.innerHTML = `<option value="">${emojiPlaceholder}</option>`;

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

  // 현재 언어 감지
  const currentLang = localStorage.getItem("userLanguage") || "ko";

  // 카테고리 선택 플레이스홀더 번역
  const categoryPlaceholder = getTranslatedText(
    "category_placeholder",
    currentLang
  );

  // 카테고리 옵션 초기화
  categorySelect.innerHTML = `<option value="">${categoryPlaceholder}</option>`;

  // 카테고리 옵션 추가 (번역 적용)
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = getTranslatedText(category, currentLang);
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

  // 현재 언어 감지
  const currentLang = localStorage.getItem("userLanguage") || "ko";

  // 이모지 선택 플레이스홀더 번역
  const emojiPlaceholder = getTranslatedText("emoji_placeholder", currentLang);

  // 이모지 옵션 초기화
  emojiSelect.innerHTML = `<option value="">${emojiPlaceholder}</option>`;

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
  }
}

// 개념 추가 모달용 도메인 옵션 업데이트 함수
function updateAddDomainOptions() {
  const domainSelect = document.getElementById("concept-domain");
  if (!domainSelect) {
    console.warn("개념 추가 모달 도메인 선택 요소를 찾을 수 없습니다.");
    return;
  }

  const currentLang = localStorage.getItem("userLanguage") || "ko";
  const domains = Object.keys(domainCategoryMapping);

  // 현재 선택된 값 저장
  const currentValue = domainSelect.value;

  // 도메인 플레이스홀더 번역
  const domainPlaceholder = getTranslatedText(
    "domain_placeholder",
    currentLang
  );

  // 도메인 옵션 초기화 (플레이스홀더 포함)
  domainSelect.innerHTML = `<option value="">${domainPlaceholder}</option>`;

  // 도메인 옵션 추가 (번역 적용)
  domains.forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = getTranslatedText(domain, currentLang);
    domainSelect.appendChild(option);
  });

  // 이전 선택값 복원
  if (currentValue && domains.includes(currentValue)) {
    domainSelect.value = currentValue;
  }
}

// 편집 모달용 도메인 옵션 업데이트 함수
function updateEditDomainOptions() {
  const domainSelect = document.getElementById("edit-concept-domain");
  if (!domainSelect) {
    console.warn("편집 모달 도메인 선택 요소를 찾을 수 없습니다.");
    return;
  }

  const currentLang = localStorage.getItem("userLanguage") || "ko";
  const domains = Object.keys(domainCategoryMapping);

  // 현재 선택된 값 저장
  const currentValue = domainSelect.value;

  // 도메인 플레이스홀더 번역
  const domainPlaceholder = getTranslatedText(
    "domain_placeholder",
    currentLang
  );

  // 도메인 옵션 초기화 (플레이스홀더 포함)
  domainSelect.innerHTML = `<option value="">${domainPlaceholder}</option>`;

  // 도메인 옵션 추가 (번역 적용)
  domains.forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = getTranslatedText(domain, currentLang);
    domainSelect.appendChild(option);
  });

  // 이전 선택값 복원
  if (currentValue && domains.includes(currentValue)) {
    domainSelect.value = currentValue;
  }
}

// 모달 로드 후 이벤트 리스너 설정 함수
function setupModalEventListeners() {
  // 개념 추가 모달용 도메인 선택 이벤트 리스너
  const addDomainSelect = document.getElementById("concept-domain");
  if (addDomainSelect) {
    addDomainSelect.addEventListener("change", updateAddCategoryOptions);
  }

  // 개념 추가 모달용 카테고리 선택 이벤트 리스너
  const addCategorySelect = document.getElementById("concept-category");
  if (addCategorySelect) {
    addCategorySelect.addEventListener("change", updateAddEmojiOptions);
  }

  // 편집 모달용 도메인 선택 이벤트 리스너
  const editDomainSelect = document.getElementById("edit-concept-domain");
  if (editDomainSelect) {
    editDomainSelect.addEventListener("change", updateEditCategoryOptions);
  }

  // 편집 모달용 카테고리 선택 이벤트 리스너
  const editCategorySelect = document.getElementById("edit-concept-category");
  if (editCategorySelect) {
    editCategorySelect.addEventListener("change", updateEditEmojiOptions);
  }
}

// 전역 함수로 내보내기
window.updateCategoryOptions = updateCategoryOptions;
window.updateDomainCategoryEmojiLanguage = updateDomainCategoryEmojiLanguage;
window.updateAddDomainOptions = updateAddDomainOptions;
window.updateAddCategoryOptions = updateAddCategoryOptions;
window.updateAddEmojiOptions = updateAddEmojiOptions;
window.updateEditDomainOptions = updateEditDomainOptions;
window.updateEditCategoryOptions = updateEditCategoryOptions;
window.updateEditEmojiOptions = updateEditEmojiOptions;
window.setupModalEventListeners = setupModalEventListeners;

// 도메인별 이모지 반환 함수
window.getDomainEmoji = function(domain) {
  const domainEmojiMap = {
    '일상': '🏠',
    '비즈니스': '💼',
    '기술': '💻',
    '학문': '📚',
    '의학': '⚕️',
    '여행': '✈️',
    '음식': '🍽️',
    '스포츠': '⚽',
    '문화': '🎭',
    '일반': '📝',
    'daily': '🏠',
    'business': '💼',
    'technology': '💻',
    'academic': '📚',
    'medical': '⚕️',
    'travel': '✈️',
    'food': '🍽️',
    'sports': '⚽',
    'culture': '🎭',
    'general': '📝'
  };
  
  return domainEmojiMap[domain] || '📚';
};

// DOM 로드 시 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
  const domainSelect = document.getElementById("domain-filter");
  if (domainSelect) {
    domainSelect.addEventListener("change", updateCategoryOptions);
  }

  // 개념 추가 모달용 도메인 선택 이벤트 리스너
  const addDomainSelect = document.getElementById("concept-domain");
  if (addDomainSelect) {
    addDomainSelect.addEventListener("change", updateAddCategoryOptions);
  }
});
