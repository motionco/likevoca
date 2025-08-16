#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch 1-1 Generator (daily/routine/basic/greeting)
Generates 50 rows each for concepts (58 fields), examples (16), grammar (31)
Encoding: UTF-8 without BOM
Outputs to: result/ (batch_1-1_*_template_add.csv)

Rules applied from docs/통합_데이터_가이드.md and docs/plus/batch_1-1_daily_routine_basic_greeting.md
"""

from pathlib import Path
import csv
import re

BASE_DIR = Path(__file__).resolve().parents[1]
RESULT_DIR = BASE_DIR / "result"


# ------------------------------
# Helpers
# ------------------------------

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)


def token_to_phrase(token: str) -> str:
    """Convert snake_case token to a human-friendly phrase.
    E.g., 'good_morning' -> 'Good morning'
    """
    phrase = token.replace('_', ' ').strip()
    if not phrase:
        return phrase
    return phrase[0].upper() + phrase[1:]


def token_to_punctuated_greeting(token: str, style: str = "default") -> str:
    phrase = token_to_phrase(token)
    if style == "exclaim":
        if not phrase.endswith("!"):
            phrase += "!"
    elif style == "quote":
        phrase = f"'{phrase}'"
    return phrase


def ko_sentence(collection: str, ko_word: str, pos: str) -> str:
    """Generate a simple Korean sentence per collection type to ensure differentiation."""
    if collection == "concepts":
        # 기본 의미를 보여주는 간단한 예문
        if pos == "interjection":
            return f"아침에는 '{ko_word}'라고 인사합니다."
        elif pos == "verb":
            return f"우리는 먼저 {ko_word}."
        else:
            return f"'{ko_word}'는 인사에서 자주 쓰입니다."
    elif collection == "examples":
        # 실제 상황 예문
        if pos == "interjection":
            return f"오늘 집에서 이웃에게 '{ko_word}'라고 말했어요."
        elif pos == "verb":
            return f"저는 현관에서 먼저 {ko_word}."
        else:
            return f"오늘 아침은 따뜻한 {ko_word}로 시작했어요."
    else:  # grammar
        # 문법 패턴을 설명하는 예문
        if pos == "interjection":
            return f"처음 만날 때는 '{ko_word}'라고 자연스럽게 건네세요."
        elif pos == "verb":
            return f"처음 만나면 손을 흔들고 {ko_word}."
        else:
            return f"정중한 자리에서는 {ko_word} 뒤에 존댓말을 붙입니다."


def en_sentence(collection: str, en_token: str, pos: str) -> str:
    phrase = token_to_phrase(en_token)
    quoted = token_to_punctuated_greeting(en_token, "quote")
    if collection == "concepts":
        if pos == "interjection":
            return f"People often say {quoted} as a basic greeting."
        elif pos == "verb":
            return f"We usually {phrase} first when we meet."
        else:
            return f"The {phrase} is common in everyday greetings."
    elif collection == "examples":
        if pos == "interjection":
            return f"This morning I said {quoted} to my neighbor at home."
        elif pos == "verb":
            return f"I always {phrase} before starting a conversation at home."
        else:
            return f"We began the day with a warm {phrase} at home."
    else:
        if pos == "interjection":
            return f"Use {quoted} when greeting someone politely at home."
        elif pos == "verb":
            return f"In greetings, you can {phrase} and then ask a question."
        else:
            return f"In formal greetings, place the {phrase} before the name."


def build_concepts_row(meta, ko_word: str):
    # Header order must match the guide exactly (58 fields)
    return {
        'concept_id': meta['concept_id'],
        'domain': meta['domain'],
        'category': meta['category'],
        'difficulty': meta['difficulty'],
        'emoji': meta['emoji'],
        'color': meta['color'],
        'situation': meta['situation'],
        'purpose': meta['purpose'],
        'korean_word': ko_word,
        'korean_pronunciation': f"{ko_word}-pronunciation",
        'korean_definition': f"{ko_word} 정의",
        'korean_pos': meta['korean_pos'],
        'korean_synonyms': f"{ko_word}류,관련어",
        'korean_antonyms': f"비{ko_word},반대말",
        'korean_word_family': f"{ko_word}족,{ko_word}계열",
        'korean_compound_words': f"{ko_word}표현,{ko_word}말",
        'korean_collocations': f"{ko_word}를 말하다,{ko_word}를 건네다",
        'english_word': meta['english_word_readable'],
        'english_pronunciation': f"/{meta['english_word_token']}/",
        'english_definition': f"{meta['english_word_readable']} definition",
        'english_pos': meta['english_pos'],
        'english_synonyms': f"{meta['english_word_readable']} type,related item",
        'english_antonyms': f"non-{meta['english_word_readable']},opposite",
        'english_word_family': f"{meta['english_word_readable']} family,{meta['english_word_readable']} group",
        'english_compound_words': f"{meta['english_word_readable']} phrase,{meta['english_word_readable']} greeting",
        'english_collocations': f"say {meta['english_word_readable']},offer {meta['english_word_readable']}",
        'chinese_word': f"{ko_word}_中文",
        'chinese_pronunciation': f"{ko_word}_pinyin",
        'chinese_definition': f"{ko_word} 中文定义",
        'chinese_pos': '名词' if meta['pos'] != 'verb' else '动词',
        'chinese_synonyms': f"{ko_word}_中文类,相关词",
        'chinese_antonyms': f"非{ko_word}_中文,反义词",
        'chinese_word_family': f"{ko_word}_中文族,{ko_word}_中文系列",
        'chinese_compound_words': f"{ko_word}_中文表达,{ko_word}_中文用语",
        'chinese_collocations': f"说{ko_word}_中文,用{ko_word}_中文问候",
        'japanese_word': f"{ko_word}_日本語",
        'japanese_pronunciation': f"{ko_word}_hiragana",
        'japanese_definition': f"{ko_word} 日本語定義",
        'japanese_pos': '名詞' if meta['pos'] != 'verb' else '動詞',
        'japanese_synonyms': f"{ko_word}_日本語類,関連語",
        'japanese_antonyms': f"非{ko_word}_日本語,反対語",
        'japanese_word_family': f"{ko_word}_日本語族,{ko_word}_日本語系列",
        'japanese_compound_words': f"{ko_word}_日本語表現,{ko_word}_日本語用語",
        'japanese_collocations': f"{ko_word}_日本語を言う,{ko_word}_日本語で挨拶する",
        'spanish_word': f"{ko_word}_español",
        'spanish_pronunciation': f"{ko_word}_español_pronunciación",
        'spanish_definition': f"{ko_word} definición español",
        'spanish_pos': 'sustantivo' if meta['pos'] != 'verb' else 'verbo',
        'spanish_synonyms': f"{ko_word}_español tipo,expresión relacionada",
        'spanish_antonyms': f"no {ko_word}_español,opuesto",
        'spanish_word_family': f"familia {ko_word}_español,grupo {ko_word}_español",
        'spanish_compound_words': f"saludo de {ko_word}_español,frase de {ko_word}_español",
        'spanish_collocations': f"decir {ko_word}_español,ofrecer {ko_word}_español",
        'korean_example': meta['ko_examples']['concepts'],
        'english_example': meta['en_examples']['concepts'],
        'chinese_example': f"我们在家里说{ko_word}_中文。",
        'japanese_example': f"家で{ko_word}_日本語と挨拶しました。",
        'spanish_example': f"En casa dijimos {ko_word}_español."
    }


def build_examples_row(meta, ko_word: str):
    # Header: 16 fields
    return {
        'concept_id': meta['concept_id'],
        'domain': meta['domain'],
        'category': meta['category'],
        'difficulty': meta['difficulty'],
        'situation': meta['situation'],
        'purpose': meta['purpose'],
        'korean': meta['ko_examples']['examples'],
        'english': meta['en_examples']['examples'],
        'japanese': f"今朝、家で{ko_word}_日本語と声をかけました。",
        'chinese': f"今天早上在家对家人说了{ko_word}_中文。",
        'spanish': f"Esta mañana en casa dije {ko_word}_español.",
        'korean_word': ko_word,
        'english_word': meta['english_word_readable'],
        'japanese_word': f"{ko_word}_日本語",
        'chinese_word': f"{ko_word}_中文",
        'spanish_word': f"{ko_word}_español",
    }


def build_grammar_row(meta, ko_word: str):
    pos = meta['pos']
    en_word = meta['english_word_readable']
    en_token = meta['english_word_token']

    if pos == 'interjection':
        ko_title = f"'{ko_word}' 인사"
        ko_structure = "감탄사 + 인사"
        ko_desc = f"처음 인사할 때 '{ko_word}'를 사용하는 구조"
        en_title = f"Greeting: {token_to_phrase(en_token)}"
        en_structure = "Interjection + greeting"
        en_desc = f"Using {token_to_phrase(en_token)} as a polite greeting"
    elif pos == 'verb':
        ko_title = f"{ko_word} 사용법"
        ko_structure = f"주어 + {ko_word} (+ 목적어)"
        ko_desc = f"만나자마자 {ko_word}하는 기본 문법"
        en_title = f"Using {token_to_phrase(en_token)}"
        en_structure = f"Subject + {token_to_phrase(en_token)} (+ object)"
        en_desc = f"Basic pattern to {token_to_phrase(en_token)} in greetings"
    else:  # noun
        ko_title = f"{ko_word} 구성"
        ko_structure = f"형용사 + {ko_word}"
        ko_desc = f"인사 상황에서 {ko_word}를 배치하는 방법"
        en_title = f"The {token_to_phrase(en_token)}"
        en_structure = f"Adjective + {token_to_phrase(en_token)}"
        en_desc = f"How to place the {token_to_phrase(en_token)} in greetings"

    return {
        'concept_id': meta['concept_id'],
        'domain': meta['domain'],
        'category': meta['category'],
        'difficulty': meta['difficulty'],
        'situation': meta['situation'],
        'purpose': meta['purpose'],
        'korean_title': ko_title,
        'korean_structure': ko_structure,
        'korean_description': ko_desc,
        'korean_example': meta['ko_examples']['grammar'],
        'english_title': en_title,
        'english_structure': en_structure,
        'english_description': en_desc,
        'english_example': meta['en_examples']['grammar'],
        'japanese_title': f"{ko_word}_日本語の使い方",
        'japanese_structure': f"挨拶 + {ko_word}_日本語",
        'japanese_description': f"挨拶で{ko_word}_日本語を使う方法",
        'japanese_example': f"最初に{ko_word}_日本語と言います。",
        'chinese_title': f"{ko_word}_中文的用法",
        'chinese_structure': f"问候 + {ko_word}_中文",
        'chinese_description': f"在问候时使用{ko_word}_中文的方法",
        'chinese_example': f"首先说{ko_word}_中文。",
        'spanish_title': f"Uso de {ko_word}_español",
        'spanish_structure': f"Saludo + {ko_word}_español",
        'spanish_description': f"Cómo usar {ko_word}_español en los saludos",
        'spanish_example': f"Primero digo {ko_word}_español.",
        'korean_word': ko_word,
        'english_word': en_word,
        'japanese_word': f"{ko_word}_日本語",
        'chinese_word': f"{ko_word}_中文",
        'spanish_word': f"{ko_word}_español",
    }


def main():
    ensure_dir(RESULT_DIR)

    # Configuration from the batch prompt
    DOMAIN = "daily"
    CATEGORY = "routine"
    DIFFICULTY = "basic"
    PURPOSE = "greeting"
    SITUATION = "casual,home"  # will be quoted automatically by csv when needed

    # POS distribution: verb 40% (20), noun 30% (15), interjection 30% (15)
    interjections = [
        ("hello", "안녕하세요", "greeting"),
        ("hi", "안녕", "greeting"),
        ("hey_there", "안녕 거기", "casual_call"),
        ("good_morning", "좋은 아침이에요", "morning_greeting"),
        ("good_afternoon", "좋은 오후예요", "afternoon_greeting"),
        ("good_evening", "좋은 저녁이에요", "evening_greeting"),
        ("good_night", "좋은 밤 되세요", "night_wish"),
        ("welcome", "환영합니다", "welcome"),
        ("long_time_no_see", "오랜만이에요", "reunion_greeting"),
        ("nice_to_meet_you", "만나서 반가워요", "first_meeting"),
        ("pleasure_to_meet_you", "만나서 기쁩니다", "polite_meeting"),
        ("hi_everyone", "모두 안녕하세요", "group_greeting"),
        ("greetings", "인사드립니다", "formal_greeting"),
        ("good_to_see_you", "뵙게 되어 반갑습니다", "reunion_polite"),
        ("welcome_home", "집에 오신 걸 환영해요", "home_welcome"),
    ]

    nouns = [
        ("greeting", "인사", "greeting_concept"),
        ("handshake", "악수", "gesture"),
        ("bow", "절", "gesture"),
        ("smile", "미소", "expression"),
        ("introduction", "소개", "first_meeting"),
        ("courtesy", "예의", "manner"),
        ("respect", "존중", "manner"),
        ("salutation", "경례", "formal_salute"),
        ("politeness", "공손함", "manner"),
        ("hospitality", "환대", "welcome"),
        ("reunion", "재회", "meeting_again"),
        ("small_talk", "잡담", "icebreaker"),
        ("first_meeting", "첫만남", "start"),
        ("farewell", "작별", "goodbye"),
        ("icebreaker", "아이스브레이커", "breaker"),
    ]

    verbs = [
        ("greet", "인사하다", "action"),
        ("meet", "만나다", "meet"),
        ("introduce", "소개하다", "introduce"),
        ("welcome_back", "다시 환영하다", "welcome"),
        ("wave", "손을 흔들다", "gesture"),
        ("smile_verb", "미소짓다", "expression"),
        ("nod", "고개를 끄덕이다", "gesture"),
        ("shake_hands", "악수하다", "gesture"),
        ("bow_verb", "절하다", "gesture"),
        ("say_hello", "'안녕하세요'라고 말하다", "utterance"),
        ("ask_how_are_you", "안부를 묻다", "utterance"),
        ("respond_im_fine", "괜찮다고 답하다", "reply"),
        ("start_conversation", "대화를 시작하다", "start"),
        ("make_small_talk", "가벼운 대화를 나누다", "icebreaker"),
        ("check_in_on_you", "안부를 확인하다", "care"),
        ("wish_good_day", "좋은 하루를 빌다", "wish"),
        ("wish_good_night", "좋은 밤을 빌다", "wish"),
        ("compliment", "칭찬하다", "praise"),
        ("thank_for_coming", "와줘서 고맙다고 말하다", "thanks"),
        ("welcome_verb", "환영하다", "welcome"),
    ]

    assert len(interjections) == 15 and len(nouns) == 15 and len(verbs) == 20, "POS counts must be 15/15/20"

    items = [("interjection",) + t for t in interjections]
    items += [("noun",) + t for t in nouns]
    items += [("verb",) + t for t in verbs]

    # Build data rows
    concepts_rows = []
    examples_rows = []
    grammar_rows = []

    # Header definitions (exact order)
    concepts_header = [
        'concept_id','domain','category','difficulty','emoji','color','situation','purpose',
        'korean_word','korean_pronunciation','korean_definition','korean_pos','korean_synonyms','korean_antonyms','korean_word_family','korean_compound_words','korean_collocations',
        'english_word','english_pronunciation','english_definition','english_pos','english_synonyms','english_antonyms','english_word_family','english_compound_words','english_collocations',
        'chinese_word','chinese_pronunciation','chinese_definition','chinese_pos','chinese_synonyms','chinese_antonyms','chinese_word_family','chinese_compound_words','chinese_collocations',
        'japanese_word','japanese_pronunciation','japanese_definition','japanese_pos','japanese_synonyms','japanese_antonyms','japanese_word_family','japanese_compound_words','japanese_collocations',
        'spanish_word','spanish_pronunciation','spanish_definition','spanish_pos','spanish_synonyms','spanish_antonyms','spanish_word_family','spanish_compound_words','spanish_collocations',
        'korean_example','english_example','chinese_example','japanese_example','spanish_example'
    ]

    examples_header = [
        'concept_id','domain','category','difficulty','situation','purpose',
        'korean','english','japanese','chinese','spanish',
        'korean_word','english_word','japanese_word','chinese_word','spanish_word'
    ]

    grammar_header = [
        'concept_id','domain','category','difficulty','situation','purpose',
        'korean_title','korean_structure','korean_description','korean_example',
        'english_title','english_structure','english_description','english_example',
        'japanese_title','japanese_structure','japanese_description','japanese_example',
        'chinese_title','chinese_structure','chinese_description','chinese_example',
        'spanish_title','spanish_structure','spanish_description','spanish_example',
        'korean_word','english_word','japanese_word','chinese_word','spanish_word'
    ]

    # Emojis/colors for variety
    emojis = ["⏰", "🙂", "👋", "🌅", "🏠"]
    colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#009688"]

    for idx, item in enumerate(items):
        pos, en_token, ko_word, meaning = item

        # Build concept_id using english token and meaning
        safe_token = re.sub(r"[^a-z0-9_]+", "_", en_token.lower())
        safe_meaning = re.sub(r"[^a-z0-9_]+", "_", meaning.lower())
        concept_id = f"{DOMAIN}_{safe_token}_{safe_meaning}"

        english_word_readable = token_to_phrase(en_token)

        meta = {
            'concept_id': concept_id,
            'domain': DOMAIN,
            'category': CATEGORY,
            'difficulty': DIFFICULTY,
            'emoji': emojis[idx % len(emojis)],
            'color': colors[idx % len(colors)],
            'situation': SITUATION,
            'purpose': PURPOSE,
            'pos': pos,
            'korean_pos': '감탄사' if pos == 'interjection' else ('동사' if pos == 'verb' else '명사'),
            'english_pos': 'interjection' if pos == 'interjection' else ('verb' if pos == 'verb' else 'noun'),
            'english_word_token': safe_token,
            'english_word_readable': english_word_readable,
            'ko_examples': {
                'concepts': ko_sentence('concepts', ko_word, pos),
                'examples': ko_sentence('examples', ko_word, pos),
                'grammar': ko_sentence('grammar', ko_word, pos),
            },
            'en_examples': {
                'concepts': en_sentence('concepts', en_token, pos),
                'examples': en_sentence('examples', en_token, pos),
                'grammar': en_sentence('grammar', en_token, pos),
            }
        }

        concepts_rows.append(build_concepts_row(meta, ko_word))
        examples_rows.append(build_examples_row(meta, ko_word))
        grammar_rows.append(build_grammar_row(meta, ko_word))

    # Write CSVs to result/, UTF-8 without BOM
    result_files = [
        (RESULT_DIR / 'batch_1-1_concepts_template_add.csv', concepts_header, concepts_rows),
        (RESULT_DIR / 'batch_1-1_examples_template_add.csv', examples_header, examples_rows),
        (RESULT_DIR / 'batch_1-1_grammar_template_add.csv', grammar_header, grammar_rows),
    ]

    for path, header, rows in result_files:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Wrote {path.name}: {len(rows)} rows, {len(header)} fields (UTF-8 no BOM)")


if __name__ == '__main__':
    main()
