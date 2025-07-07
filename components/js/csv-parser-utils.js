/**
 * CSV ?Œì‹± ë°??Œì¼ ?½ê¸° ? í‹¸ë¦¬í‹° ?¨ìˆ˜??
 * ë¶„ë¦¬??ì»¬ë ‰???…ë¡œ?œë? ?„í•œ ?„ìš© ?Œì„œ
 */

// ?Œì¼ ?½ê¸° ?¨ìˆ˜
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, "utf-8");
  });
}

// CSV ?Œì‹± ?¨ìˆ˜
export function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV ?Œì¼???°ì´?°ê? ?†ìŠµ?ˆë‹¤.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // ì»¬ë ‰???€?…ì— ?°ë¼ ?ì ˆ???•ì‹?¼ë¡œ ë³€??
      let parsedData;
      switch (tabName) {
        case "concepts":
          parsedData = parseConceptFromCSV(row);
          break;
        case "examples":
          parsedData = parseExampleFromCSV(row);
          break;
        case "grammar":
          parsedData = parseGrammarPatternFromCSV(row);
          break;
        default:
          parsedData = row;
      }

      if (parsedData) {
        data.push(parsedData);
      }
    }
  }

  return data;
}

// CSV ?¼ì¸ ?Œì‹± (?¼í‘œë¡?ë¶„ë¦¬?˜ë˜ ?°ì˜´???´ë???ë¬´ì‹œ)
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim().replace(/^"|"$/g, ""));
  return values;
}

// ê°œë… CSV ?Œì‹±
function parseConceptFromCSV(row) {
  try {
    return {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.emoji || "?“",
        color_theme: row.color_theme || "#9C27B0",
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      },
      expressions: {
        korean: {
          word: row.korean_word || "",
          pronunciation: row.korean_pronunciation || "",
          definition: row.korean_definition || "",
          part_of_speech: row.korean_pos || "ëª…ì‚¬",
          level: row.korean_level || "beginner",
        },
        english: {
          word: row.english_word || "",
          pronunciation: row.english_pronunciation || "",
          definition: row.english_definition || "",
          part_of_speech: row.english_pos || "noun",
          level: row.english_level || "beginner",
        },
      },
      representative_example: {
        translations: {
          korean: row.example_korean || "",
          english: row.example_english || "",
        },
        context: row.context || "daily_conversation",
        difficulty: row.difficulty || "beginner",
      },
    };
  } catch (error) {
    console.error("ê°œë… CSV ?Œì‹± ?¤ë¥˜:", error);
    return null;
  }
}

// ?ˆë¬¸ CSV ?Œì‹±
function parseExampleFromCSV(row) {
  try {
    return {
      domain: row.domain || "general",
      category: row.category || "common",
      difficulty: row.difficulty || "beginner",
      situation: row.situation
        ? row.situation.split(",").map((s) => s.trim())
        : ["casual"],
      purpose: row.purpose || null,
      translations: {
        korean: row.korean_text || row.korean || "",
        english: row.english_text || row.english || "",
        japanese: row.japanese_text || row.japanese || "",
        chinese: row.chinese_text || row.chinese || "",
      },
    };
  } catch (error) {
    console.error("?ˆë¬¸ CSV ?Œì‹± ?¤ë¥˜:", error);
    return null;
  }
}

// ë¬¸ë²• ?¨í„´ CSV ?Œì‹±
function parseGrammarPatternFromCSV(row) {
  try {
    return {
      pattern_id: row.pattern_id || null,
      pattern_name: row.pattern_name || "ê¸°ë³¸ ?¨í„´",
      pattern_type: row.pattern_type || "basic",
      difficulty: row.difficulty || "beginner",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      learning_focus: row.learning_focus
        ? row.learning_focus.split(",").map((f) => f.trim())
        : [],
      structural_pattern: row.structural_pattern || "",
      explanations: {
        korean: row.korean_explanation || "",
        english: row.english_explanation || "",
        japanese: row.japanese_explanation || "",
      },
      usage_examples: [
        {
          korean: row.example_korean || "",
          english: row.example_english || "",
          japanese: row.example_japanese || "",
        },
      ],
      teaching_notes: {
        korean: row.korean_notes || "",
        english: row.english_notes || "",
        primary_focus: row.primary_focus || "ê¸°ë³¸ ë¬¸ë²• ?™ìŠµ",
        practice_suggestions: row.practice_suggestions
          ? row.practice_suggestions.split(",").map((s) => s.trim())
          : ["ê¸°ë³¸ ?°ìŠµ"],
      },
    };
  } catch (error) {
    console.error("ë¬¸ë²• ?¨í„´ CSV ?Œì‹± ?¤ë¥˜:", error);
    return null;
  }
}

// ?œê·¸ ë¬¸ì?´ì„ ë°°ì—´ë¡?ë³€??
export function parseTagsField(tagsString) {
  if (!tagsString || typeof tagsString !== "string") {
    return [];
  }
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// ë°°ì—´ ?„ë“œ ?Œì‹± (ì½¤ë§ˆ???¸ë?ì½œë¡ ?¼ë¡œ ë¶„ë¦¬??ë¬¸ì??
export function parseArrayField(value, separator = ",") {
  if (!value || typeof value !== "string") {
    return [];
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// ?«ì ?„ë“œ ?Œì‹± (ê¸°ë³¸ê°??¬í•¨)
export function parseNumberField(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ë¶ˆë¦° ?„ë“œ ?Œì‹±
export function parseBooleanField(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower !== "false" && lower !== "0" && lower !== "no";
  }
  return defaultValue;
}
