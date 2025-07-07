/**
 * CSV ?�싱 �??�일 ?�기 ?�틸리티 ?�수??
 * 분리??컬렉???�로?��? ?�한 ?�용 ?�서
 */

// ?�일 ?�기 ?�수
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, "utf-8");
  });
}

// CSV ?�싱 ?�수
export function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV ?�일???�이?��? ?�습?�다.");
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

      // 컬렉???�?�에 ?�라 ?�절???�식?�로 변??
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

// CSV ?�인 ?�싱 (?�표�?분리?�되 ?�옴???��???무시)
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

// 개념 CSV ?�싱
function parseConceptFromCSV(row) {
  try {
    return {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.emoji || "?��",
        color_theme: row.color_theme || "#9C27B0",
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      },
      expressions: {
        korean: {
          word: row.korean_word || "",
          pronunciation: row.korean_pronunciation || "",
          definition: row.korean_definition || "",
          part_of_speech: row.korean_pos || "명사",
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
    console.error("개념 CSV ?�싱 ?�류:", error);
    return null;
  }
}

// ?�문 CSV ?�싱
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
    console.error("?�문 CSV ?�싱 ?�류:", error);
    return null;
  }
}

// 문법 ?�턴 CSV ?�싱
function parseGrammarPatternFromCSV(row) {
  try {
    return {
      pattern_id: row.pattern_id || null,
      pattern_name: row.pattern_name || "기본 ?�턴",
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
        primary_focus: row.primary_focus || "기본 문법 ?�습",
        practice_suggestions: row.practice_suggestions
          ? row.practice_suggestions.split(",").map((s) => s.trim())
          : ["기본 ?�습"],
      },
    };
  } catch (error) {
    console.error("문법 ?�턴 CSV ?�싱 ?�류:", error);
    return null;
  }
}

// ?�그 문자?�을 배열�?변??
export function parseTagsField(tagsString) {
  if (!tagsString || typeof tagsString !== "string") {
    return [];
  }
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// 배열 ?�드 ?�싱 (콤마???��?콜론?�로 분리??문자??
export function parseArrayField(value, separator = ",") {
  if (!value || typeof value !== "string") {
    return [];
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// ?�자 ?�드 ?�싱 (기본�??�함)
export function parseNumberField(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// 불린 ?�드 ?�싱
export function parseBooleanField(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower !== "false" && lower !== "0" && lower !== "no";
  }
  return defaultValue;
}
