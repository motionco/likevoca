import csv
import random
from typing import List, Dict

def generate_concept_id(domain: str, word: str, meaning: str) -> str:
    return f"{domain}_{word}_{meaning}"

def generate_daily_routine_concepts(num_entries: int) -> List[Dict[str, str]]:
    concepts = []
    words = [
        ("morning", "시작", "아침", "morning", "早晨", "朝", "mañana"),
        ("hello", "인사", "안녕", "hello", "你好", "こんにちは", "hola"),
        ("wake", "기상", "일어나다", "wake up", "醒来", "起きる", "despertar"),
        ("breakfast", "식사", "아침식사", "breakfast", "早餐", "朝食", "desayuno"),
        ("routine", "일과", "일상", "routine", "日常", "日課", "rutina")
    ]

    for i in range(num_entries):
        domain = "daily"
        category = "routine"
        difficulty = "basic"
        emoji = random.choice(["⏰", "🌞", "🍳", "🌈", "🌻"])
        color = random.choice(["#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#FF5722"])
        situation = random.choice(["casual,home", "casual,morning", "home,morning"])
        purpose = "greeting"

        word_data = random.choice(words)
        concept_id = generate_concept_id(domain, word_data[1], word_data[0])

        concept = {
            "concept_id": concept_id,
            "domain": domain,
            "category": category,
            "difficulty": difficulty,
            "emoji": emoji,
            "color": color,
            "situation": situation,
            "purpose": purpose,
            "korean_word": word_data[2],
            "korean_pronunciation": word_data[2].replace("ㅏ", "a").replace("ㅣ", "i").replace("ㅓ", "eo").replace("ㅜ", "u"),
            "korean_definition": f"{word_data[2]}에 대한 기본 정의",
            "korean_pos": "명사",
            "korean_synonyms": f"{word_data[2]}의 유의어1,{word_data[2]}의 유의어2",
            "korean_antonyms": f"{word_data[2]}의 반의어1,{word_data[2]}의 반의어2",
            "korean_word_family": f"{word_data[2]}의 어족1,{word_data[2]}의 어족2",
            "korean_compound_words": f"{word_data[2]}의 복합어1,{word_data[2]}의 복합어2",
            "korean_collocations": f"{word_data[2]}의 연어1,{word_data[2]}의 연어2",
            "english_word": word_data[3],
            "english_pronunciation": "/ˈsəm/",
            "english_definition": f"Definition of {word_data[3]}",
            "english_pos": "noun",
            "english_synonyms": f"synonym1 of {word_data[3]},synonym2 of {word_data[3]}",
            "english_antonyms": f"antonym1 of {word_data[3]},antonym2 of {word_data[3]}",
            "english_word_family": f"word family1 of {word_data[3]},word family2 of {word_data[3]}",
            "english_compound_words": f"compound word1 of {word_data[3]},compound word2 of {word_data[3]}",
            "english_collocations": f"collocation1 of {word_data[3]},collocation2 of {word_data[3]}",
            "chinese_word": word_data[4],
            "chinese_pronunciation": word_data[4],
            "chinese_definition": f"{word_data[4]}的基本定义",
            "chinese_pos": "名词",
            "chinese_synonyms": f"{word_data[4]}的近义词1,{word_data[4]}的近义词2",
            "chinese_antonyms": f"{word_data[4]}的反义词1,{word_data[4]}的反义词2",
            "chinese_word_family": f"{word_data[4]}的词族1,{word_data[4]}的词族2",
            "chinese_compound_words": f"{word_data[4]}的复合词1,{word_data[4]}的复合词2",
            "chinese_collocations": f"{word_data[4]}的搭配词1,{word_data[4]}的搭配词2",
            "japanese_word": word_data[5],
            "japanese_pronunciation": word_data[5],
            "japanese_definition": f"{word_data[5]}の基本的な定義",
            "japanese_pos": "名詞",
            "japanese_synonyms": f"{word_data[5]}の類義語1,{word_data[5]}の類義語2",
            "japanese_antonyms": f"{word_data[5]}の対義語1,{word_data[5]}の対義語2",
            "japanese_word_family": f"{word_data[5]}の語族1,{word_data[5]}の語族2",
            "japanese_compound_words": f"{word_data[5]}の複合語1,{word_data[5]}の複合語2",
            "japanese_collocations": f"{word_data[5]}のコロケーション1,{word_data[5]}のコロケーション2",
            "spanish_word": word_data[6],
            "spanish_pronunciation": word_data[6].replace("a", "a-").replace("o", "o-"),
            "spanish_definition": f"Definición básica de {word_data[6]}",
            "spanish_pos": "sustantivo",
            "spanish_synonyms": f"sinónimo1 de {word_data[6]},sinónimo2 de {word_data[6]}",
            "spanish_antonyms": f"antónimo1 de {word_data[6]},antónimo2 de {word_data[6]}",
            "spanish_word_family": f"familia de palabras1 de {word_data[6]},familia de palabras2 de {word_data[6]}",
            "spanish_compound_words": f"palabra compuesta1 de {word_data[6]},palabra compuesta2 de {word_data[6]}",
            "spanish_collocations": f"colocación1 de {word_data[6]},colocación2 de {word_data[6]}",
            "korean_example": f"{word_data[2]}에 대한 기본 예문입니다.",
            "english_example": f"Basic example of {word_data[3]}.",
            "chinese_example": f"{word_data[4]}的基本示例。",
            "japanese_example": f"{word_data[5]}の基本的な例文。",
            "spanish_example": f"Ejemplo básico de {word_data[6]}."
        }
        concepts.append(concept)

    return concepts

def generate_daily_routine_examples(num_entries: int, concepts: List[Dict[str, str]]) -> List[Dict[str, str]]:
    examples = []
    for concept in concepts:
        example = {
            "concept_id": concept["concept_id"],
            "domain": concept["domain"],
            "category": concept["category"],
            "difficulty": concept["difficulty"],
            "situation": concept["situation"],
            "purpose": concept["purpose"],
            "korean": f"오늘 아침, {concept['korean_word']}을/를 하면서 좋은 하루를 시작했어요.",
            "english": f"This morning, I started my day by {concept['english_word']}.",
            "japanese": f"今朝、{concept['japanese_word']}をしながら、良い一日を始めました。",
            "chinese": f"今天早上，我通过{concept['chinese_word']}开始了美好的一天。",
            "spanish": f"Esta mañana, comencé mi día {concept['spanish_word']}.",
            "korean_word": concept["korean_word"],
            "english_word": concept["english_word"],
            "japanese_word": concept["japanese_word"],
            "chinese_word": concept["chinese_word"],
            "spanish_word": concept["spanish_word"]
        }
        examples.append(example)

    return examples

def generate_daily_routine_grammar(num_entries: int, concepts: List[Dict[str, str]]) -> List[Dict[str, str]]:
    grammar = []
    for concept in concepts:
        grammar_entry = {
            "concept_id": concept["concept_id"],
            "domain": concept["domain"],
            "category": concept["category"],
            "difficulty": concept["difficulty"],
            "situation": concept["situation"],
            "purpose": concept["purpose"],
            "korean_title": f"{concept['korean_word']} 사용 문법",
            "korean_structure": "N을/를 V",
            "korean_description": f"{concept['korean_word']} 사용에 대한 기본 문법 설명",
            "english_title": f"Grammar of Using {concept['english_word']}",
            "english_structure": "S V O",
            "english_description": f"Basic grammar explanation for using {concept['english_word']}",
            "japanese_title": f"{concept['japanese_word']}の使用文法",
            "japanese_structure": "Nを V",
            "japanese_description": f"{concept['japanese_word']}の使用に関する基本的な文法説明",
            "chinese_title": f"{concept['chinese_word']}的使用语法",
            "chinese_structure": "S V O",
            "chinese_description": f"{concept['chinese_word']}使用的基本语法说明",
            "spanish_title": f"Gramática de uso de {concept['spanish_word']}",
            "spanish_structure": "S V O",
            "spanish_description": f"Explicación gramatical básica para el uso de {concept['spanish_word']}",
            "korean_example": f"나는 {concept['korean_word']}을/를 합니다.",
            "english_example": f"I {concept['english_word']}.",
            "japanese_example": f"私は{concept['japanese_word']}をします。",
            "chinese_example": f"我{concept['chinese_word']}。",
            "spanish_example": f"Yo {concept['spanish_word']}.",
            "korean_word": concept["korean_word"],
            "english_word": concept["english_word"],
            "japanese_word": concept["japanese_word"],
            "chinese_word": concept["chinese_word"],
            "spanish_word": concept["spanish_word"]
        }
        grammar.append(grammar_entry)

    return grammar

def write_csv(filename: str, data: List[Dict[str, str]], fieldnames: List[str]):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def main():
    # Concepts CSV
    concepts_fieldnames = [
        "concept_id", "domain", "category", "difficulty", "emoji", "color", "situation", "purpose",
        "korean_word", "korean_pronunciation", "korean_definition", "korean_pos", "korean_synonyms", "korean_antonyms", "korean_word_family", "korean_compound_words", "korean_collocations",
        "english_word", "english_pronunciation", "english_definition", "english_pos", "english_synonyms", "english_antonyms", "english_word_family", "english_compound_words", "english_collocations",
        "chinese_word", "chinese_pronunciation", "chinese_definition", "chinese_pos", "chinese_synonyms", "chinese_antonyms", "chinese_word_family", "chinese_compound_words", "chinese_collocations",
        "japanese_word", "japanese_pronunciation", "japanese_definition", "japanese_pos", "japanese_synonyms", "japanese_antonyms", "japanese_word_family", "japanese_compound_words", "japanese_collocations",
        "spanish_word", "spanish_pronunciation", "spanish_definition", "spanish_pos", "spanish_synonyms", "spanish_antonyms", "spanish_word_family", "spanish_compound_words", "spanish_collocations",
        "korean_example", "english_example", "chinese_example", "japanese_example", "spanish_example"
    ]

    # Examples CSV
    examples_fieldnames = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean", "english", "japanese", "chinese", "spanish",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]

    # Grammar CSV
    grammar_fieldnames = [
        "concept_id", "domain", "category", "difficulty", "situation", "purpose",
        "korean_title", "korean_structure", "korean_description",
        "english_title", "english_structure", "english_description",
        "japanese_title", "japanese_structure", "japanese_description",
        "chinese_title", "chinese_structure", "chinese_description",
        "spanish_title", "spanish_structure", "spanish_description",
        "korean_example", "english_example", "japanese_example", "chinese_example", "spanish_example",
        "korean_word", "english_word", "japanese_word", "chinese_word", "spanish_word"
    ]

    # Generate data
    concepts = generate_daily_routine_concepts(50)
    examples = generate_daily_routine_examples(50, concepts)
    grammar = generate_daily_routine_grammar(50, concepts)

    # Write CSVs
    write_csv("result/batch_1-1_concepts_template_add.csv", concepts, concepts_fieldnames)
    write_csv("result/batch_1-1_examples_template_add.csv", examples, examples_fieldnames)
    write_csv("result/batch_1-1_grammar_template_add.csv", grammar, grammar_fieldnames)

if __name__ == "__main__":
    main()

