/**
 * CSV 파싱 및 파일 읽기 유틸리티 함수들
 * 분리된 컬렉션 업로드를 위한 전용 파서
 */

// 파일 읽기 함수
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, "utf-8");
  });
}

// CSV 파싱 함수
export function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV 파일에 데이터가 없습니다.");
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

      // 컬렉션 타입에 따라 적절한 형식으로 변환
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

// CSV 라인 파싱 (쉼표로 분리하되 따옴표 내부는 무시)
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

// 개념 CSV 파싱
function parseConceptFromCSV(row) {
  try {
    return {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.emoji || "📝",
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
    console.error("개념 CSV 파싱 오류:", error);
    return null;
  }
}

// 예문 CSV 파싱
function parseExampleFromCSV(row) {
  try {
    return {
      example_id: row.example_id || null,
      context: row.context || "general",
      difficulty: row.difficulty || "beginner",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      translations: {
        korean: row.korean || "",
        english: row.english || "",
        japanese: row.japanese || "",
      },
      learning_metadata: {
        pattern_name: row.pattern_name || null,
        structural_pattern: row.structural_pattern || null,
        learning_weight: parseInt(row.learning_weight) || 5,
        quiz_eligible: row.quiz_eligible !== "false",
        game_eligible: row.game_eligible !== "false",
      },
    };
  } catch (error) {
    console.error("예문 CSV 파싱 오류:", error);
    return null;
  }
}

// 문법 패턴 CSV 파싱
function parseGrammarPatternFromCSV(row) {
  try {
    return {
      pattern_id: row.pattern_id || null,
      pattern_name: row.pattern_name || "기본 패턴",
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
        primary_focus: row.primary_focus || "기본 문법 학습",
        practice_suggestions: row.practice_suggestions
          ? row.practice_suggestions.split(",").map((s) => s.trim())
          : ["기본 연습"],
      },
    };
  } catch (error) {
    console.error("문법 패턴 CSV 파싱 오류:", error);
    return null;
  }
}

// 태그 문자열을 배열로 변환
export function parseTagsField(tagsString) {
  if (!tagsString || typeof tagsString !== "string") {
    return [];
  }
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// 배열 필드 파싱 (콤마나 세미콜론으로 분리된 문자열)
export function parseArrayField(value, separator = ",") {
  if (!value || typeof value !== "string") {
    return [];
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// 숫자 필드 파싱 (기본값 포함)
export function parseNumberField(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// 불린 필드 파싱
export function parseBooleanField(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower !== "false" && lower !== "0" && lower !== "no";
  }
  return defaultValue;
}
