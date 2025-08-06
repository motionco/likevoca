#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Template Generator - 랜덤 템플릿 생성기
다양한 도메인과 카테고리에서 새로운 학습 데이터를 생성합니다.
"""

import csv
import random
import datetime
from pathlib import Path

# 기본 설정
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

def load_existing_concept_ids():
    """기존 concept_id와 단어들을 로드하여 중복 방지"""
    existing_ids = set()
    existing_words = {
        'korean': set(),
        'english': set(),
        'japanese': set(),
        'chinese': set(),
        'spanish': set()
    }
    
    print("🔍 기존 데이터 검사 중...")
    
    # _add.csv 파일들에서 concept_id와 단어 추출
    for file_name in ["concepts_template_add.csv", "examples_template_add.csv", "grammar_template_add.csv"]:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if 'concept_id' in row and row['concept_id']:
                            existing_ids.add(row['concept_id'])
                            
                        # 단어 추출 (현재 파일 구조에 맞게)
                        if file_name == "concepts_template_add.csv":
                            # 현재 파일 구조: korean, english, japanese, chinese, spanish
                            for lang in existing_words.keys():
                                if lang in row and row[lang]:
                                    existing_words[lang].add(row[lang].lower().strip())
                                    
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 실패: {e}")
    
    # _list.csv 파일들에서도 concept_id와 단어 추출
    for file_name in ["concepts_template_list.csv", "examples_template_list.csv", "grammar_template_list.csv"]:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if 'concept_id' in row and row['concept_id']:
                            existing_ids.add(row['concept_id'])
                            
                        # 단어 추출 (list 파일은 다양한 구조 가능)
                        for lang in existing_words.keys():
                            # 두 가지 필드명 형식 시도
                            word_key1 = f"{lang}_word"  # 55필드 구조
                            word_key2 = lang            # 간단한 구조
                            
                            word = row.get(word_key1) or row.get(word_key2)
                            if word:
                                existing_words[lang].add(word.lower().strip())
                                    
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 실패: {e}")
    
    print(f"   📊 기존 concept_id: {len(existing_ids)}개")
    for lang, words in existing_words.items():
        print(f"   📊 기존 {lang} 단어: {len(words)}개")
    
    return existing_ids, existing_words

def generate_random_concept_data():
    """랜덤하게 새로운 concept 데이터 생성"""
    domains = [
        {'name': 'food', 'categories': ['fruit', 'vegetable', 'meat', 'drink', 'snack']},
        {'name': 'daily', 'categories': ['greeting', 'family', 'home', 'routine', 'emotion']},
        {'name': 'travel', 'categories': ['transport', 'hotel', 'destination', 'activity', 'direction']},
        {'name': 'education', 'categories': ['school', 'subject', 'study', 'exam', 'library']},
        {'name': 'technology', 'categories': ['computer', 'internet', 'phone', 'software', 'device']},
        {'name': 'nature', 'categories': ['weather', 'animal', 'plant', 'season', 'environment']},
        {'name': 'health', 'categories': ['body', 'exercise', 'medicine', 'nutrition', 'hospital']},
        {'name': 'shopping', 'categories': ['clothes', 'market', 'price', 'payment', 'store']},
        {'name': 'work', 'categories': ['office', 'meeting', 'career', 'business', 'colleague']},
        {'name': 'hobby', 'categories': ['music', 'sport', 'reading', 'game', 'art']}
    ]
    
    # 단어 데이터베이스 (대폭 확장)
    word_database = {
        'food_fruit': {
            'korean': [
                {'word': '사과', 'pronunciation': 'sa-gwa', 'definition': '빨간 껍질의 둥근 과일'},
                {'word': '바나나', 'pronunciation': 'ba-na-na', 'definition': '길고 노란 열대 과일'},
                {'word': '딸기', 'pronunciation': 'ttal-gi', 'definition': '빨갛고 달콤한 작은 과일'},
                {'word': '포도', 'pronunciation': 'po-do', 'definition': '송이로 달리는 작은 과일'},
                {'word': '오렌지', 'pronunciation': 'o-ren-ji', 'definition': '오렌지색 감귤류 과일'},
                {'word': '복숭아', 'pronunciation': 'bok-sung-a', 'definition': '털이 있는 달콤한 과일'},
                {'word': '배', 'pronunciation': 'bae', 'definition': '아삭한 식감의 과일'},
                {'word': '키위', 'pronunciation': 'ki-wi', 'definition': '털이 있는 초록색 과일'},
                {'word': '수박', 'pronunciation': 'su-bak', 'definition': '큰 둥근 여름 과일'},
                {'word': '메론', 'pronunciation': 'me-ron', 'definition': '달콤한 향이 나는 과일'}
            ],
            'english': [
                {'word': 'apple', 'pronunciation': '/ˈæpəl/', 'definition': 'red round fruit'},
                {'word': 'banana', 'pronunciation': '/bəˈnænə/', 'definition': 'long yellow tropical fruit'},
                {'word': 'strawberry', 'pronunciation': '/ˈstrɔːberi/', 'definition': 'small red sweet fruit'},
                {'word': 'grape', 'pronunciation': '/ɡreɪp/', 'definition': 'small fruit growing in clusters'},
                {'word': 'orange', 'pronunciation': '/ˈɔːrɪndʒ/', 'definition': 'orange citrus fruit'},
                {'word': 'peach', 'pronunciation': '/piːtʃ/', 'definition': 'fuzzy sweet fruit'},
                {'word': 'pear', 'pronunciation': '/per/', 'definition': 'crisp textured fruit'},
                {'word': 'kiwi', 'pronunciation': '/ˈkiːwiː/', 'definition': 'fuzzy green fruit'},
                {'word': 'watermelon', 'pronunciation': '/ˈwɔːtərmelən/', 'definition': 'large round summer fruit'},
                {'word': 'melon', 'pronunciation': '/ˈmelən/', 'definition': 'sweet fragrant fruit'}
            ],
            'japanese': [
                {'word': 'りんご', 'pronunciation': 'ringo', 'definition': '赤い丸い果物'},
                {'word': 'バナナ', 'pronunciation': 'banana', 'definition': '長い黄色い熱帯果物'},
                {'word': 'いちご', 'pronunciation': 'ichigo', 'definition': '小さな赤い甘い果物'},
                {'word': 'ぶどう', 'pronunciation': 'budou', 'definition': '房になっている小さな果物'},
                {'word': 'オレンジ', 'pronunciation': 'orenji', 'definition': 'オレンジ色の柑橘類'},
                {'word': 'もも', 'pronunciation': 'momo', 'definition': '毛のある甘い果物'},
                {'word': 'なし', 'pronunciation': 'nashi', 'definition': 'シャキシャキした食感の果物'},
                {'word': 'キウイ', 'pronunciation': 'kiui', 'definition': '毛のある緑色の果物'},
                {'word': 'すいか', 'pronunciation': 'suika', 'definition': '大きな丸い夏の果物'},
                {'word': 'メロン', 'pronunciation': 'meron', 'definition': '甘い香りの果物'}
            ],
            'chinese': [
                {'word': '苹果', 'pronunciation': 'píngguǒ', 'definition': '红色圆形水果'},
                {'word': '香蕉', 'pronunciation': 'xiāngjiāo', 'definition': '长黄色热带水果'},
                {'word': '草莓', 'pronunciation': 'cǎoméi', 'definition': '小红甜水果'},
                {'word': '葡萄', 'pronunciation': 'pútáo', 'definition': '成串的小水果'},
                {'word': '橙子', 'pronunciation': 'chéngzi', 'definition': '橙色柑橘类水果'},
                {'word': '桃子', 'pronunciation': 'táozi', 'definition': '有毛的甜水果'},
                {'word': '梨', 'pronunciation': 'lí', 'definition': '脆嫩口感的水果'},
                {'word': '猕猴桃', 'pronunciation': 'míhóutáo', 'definition': '有毛的绿色水果'},
                {'word': '西瓜', 'pronunciation': 'xīguā', 'definition': '大圆形夏季水果'},
                {'word': '甜瓜', 'pronunciation': 'tiánguā', 'definition': '甜香的水果'}
            ],
            'spanish': [
                {'word': 'manzana', 'pronunciation': 'man-θa-na', 'definition': 'fruta redonda roja'},
                {'word': 'plátano', 'pronunciation': 'pla-ta-no', 'definition': 'fruta tropical larga amarilla'},
                {'word': 'fresa', 'pronunciation': 'fre-sa', 'definition': 'fruta pequeña roja dulce'},
                {'word': 'uva', 'pronunciation': 'u-ba', 'definition': 'fruta pequeña en racimos'},
                {'word': 'naranja', 'pronunciation': 'na-ran-xa', 'definition': 'fruta cítrica naranja'},
                {'word': 'durazno', 'pronunciation': 'du-ras-no', 'definition': 'fruta peluda dulce'},
                {'word': 'pera', 'pronunciation': 'pe-ra', 'definition': 'fruta de textura crujiente'},
                {'word': 'kiwi', 'pronunciation': 'ki-wi', 'definition': 'fruta verde peluda'},
                {'word': 'sandía', 'pronunciation': 'san-dí-a', 'definition': 'fruta grande redonda de verano'},
                {'word': 'melón', 'pronunciation': 'me-lón', 'definition': 'fruta dulce fragante'}
            ]
        },
        'daily_greeting': {
            'korean': [
                {'word': '안녕하세요', 'pronunciation': 'an-nyeong-ha-se-yo', 'definition': '정중한 인사말'},
                {'word': '좋은 아침', 'pronunciation': 'jo-eun a-chim', 'definition': '아침 인사말'},
                {'word': '안녕히 가세요', 'pronunciation': 'an-nyeong-hi ga-se-yo', 'definition': '떠나는 사람에게 하는 인사'},
                {'word': '안녕', 'pronunciation': 'an-nyeong', 'definition': '친근한 인사말'},
                {'word': '어서 오세요', 'pronunciation': 'eo-seo o-se-yo', 'definition': '환영 인사'},
                {'word': '반갑습니다', 'pronunciation': 'ban-gap-seum-ni-da', 'definition': '만남을 기뻐하는 인사'},
                {'word': '수고하세요', 'pronunciation': 'su-go-ha-se-yo', 'definition': '격려 인사'},
                {'word': '안녕히 주무세요', 'pronunciation': 'an-nyeong-hi ju-mu-se-yo', 'definition': '잠자리 인사'},
                {'word': '감사합니다', 'pronunciation': 'gam-sa-ham-ni-da', 'definition': '고마움을 표현하는 말'},
                {'word': '죄송합니다', 'pronunciation': 'joe-song-ham-ni-da', 'definition': '사과의 말'}
            ],
            'english': [
                {'word': 'hello', 'pronunciation': '/həˈloʊ/', 'definition': 'polite greeting'},
                {'word': 'good morning', 'pronunciation': '/ɡʊd ˈmɔːrnɪŋ/', 'definition': 'morning greeting'},
                {'word': 'goodbye', 'pronunciation': '/ɡʊdˈbaɪ/', 'definition': 'farewell greeting'},
                {'word': 'hi', 'pronunciation': '/haɪ/', 'definition': 'casual greeting'},
                {'word': 'welcome', 'pronunciation': '/ˈwelkəm/', 'definition': 'welcoming greeting'},
                {'word': 'nice to meet you', 'pronunciation': '/naɪs tu miːt ju/', 'definition': 'greeting for first meeting'},
                {'word': 'good luck', 'pronunciation': '/ɡʊd lʌk/', 'definition': 'encouraging greeting'},
                {'word': 'good night', 'pronunciation': '/ɡʊd naɪt/', 'definition': 'bedtime greeting'},
                {'word': 'thank you', 'pronunciation': '/θæŋk ju/', 'definition': 'expression of gratitude'},
                {'word': 'sorry', 'pronunciation': '/ˈsɔːri/', 'definition': 'apology'}
            ],
            'japanese': [
                {'word': 'こんにちは', 'pronunciation': 'konnichiwa', 'definition': '丁寧な挨拶'},
                {'word': 'おはよう', 'pronunciation': 'ohayou', 'definition': '朝の挨拶'},
                {'word': 'さようなら', 'pronunciation': 'sayounara', 'definition': '別れの挨拶'},
                {'word': 'こんばんは', 'pronunciation': 'konbanwa', 'definition': '夕方の挨拶'},
                {'word': 'いらっしゃいませ', 'pronunciation': 'irasshaimase', 'definition': '歓迎の挨拶'},
                {'word': 'はじめまして', 'pronunciation': 'hajimemashite', 'definition': '初対面の挨拶'},
                {'word': 'お疲れ様', 'pronunciation': 'otsukaresama', 'definition': '労いの挨拶'},
                {'word': 'おやすみ', 'pronunciation': 'oyasumi', 'definition': '就寝時の挨拶'},
                {'word': 'ありがとう', 'pronunciation': 'arigatou', 'definition': '感謝の言葉'},
                {'word': 'すみません', 'pronunciation': 'sumimasen', 'definition': '謝罪の言葉'}
            ],
            'chinese': [
                {'word': '你好', 'pronunciation': 'nǐ hǎo', 'definition': '礼貌问候'},
                {'word': '早上好', 'pronunciation': 'zǎoshang hǎo', 'definition': '早晨问候'},
                {'word': '再见', 'pronunciation': 'zàijiàn', 'definition': '告别问候'},
                {'word': '晚上好', 'pronunciation': 'wǎnshang hǎo', 'definition': '晚上问候'},
                {'word': '欢迎', 'pronunciation': 'huānyíng', 'definition': '欢迎问候'},
                {'word': '很高兴见到你', 'pronunciation': 'hěn gāoxìng jiàn dào nǐ', 'definition': '初次见面问候'},
                {'word': '加油', 'pronunciation': 'jiāyóu', 'definition': '鼓励问候'},
                {'word': '晚安', 'pronunciation': 'wǎnān', 'definition': '睡前问候'},
                {'word': '谢谢', 'pronunciation': 'xièxie', 'definition': '感谢话语'},
                {'word': '对不起', 'pronunciation': 'duìbuqǐ', 'definition': '道歉话语'}
            ],
            'spanish': [
                {'word': 'hola', 'pronunciation': 'o-la', 'definition': 'saludo educado'},
                {'word': 'buenos días', 'pronunciation': 'bue-nos dí-as', 'definition': 'saludo matutino'},
                {'word': 'adiós', 'pronunciation': 'a-diós', 'definition': 'saludo de despedida'},
                {'word': 'buenas noches', 'pronunciation': 'bue-nas no-ches', 'definition': 'saludo nocturno'},
                {'word': 'bienvenido', 'pronunciation': 'bien-ve-ni-do', 'definition': 'saludo de bienvenida'},
                {'word': 'mucho gusto', 'pronunciation': 'mu-cho gus-to', 'definition': 'saludo de primer encuentro'},
                {'word': 'buena suerte', 'pronunciation': 'bue-na suer-te', 'definition': 'saludo de ánimo'},
                {'word': 'que duermas bien', 'pronunciation': 'ke duer-mas bien', 'definition': 'saludo de dormir'},
                {'word': 'gracias', 'pronunciation': 'gra-cias', 'definition': 'expresión de gratitud'},
                {'word': 'lo siento', 'pronunciation': 'lo sien-to', 'definition': 'disculpa'}
            ]
        },
        'technology_computer': {
            'korean': [
                {'word': '컴퓨터', 'pronunciation': 'keom-pyu-teo', 'definition': '전자 계산 장치'},
                {'word': '노트북', 'pronunciation': 'no-teu-buk', 'definition': '휴대용 컴퓨터'},
                {'word': '키보드', 'pronunciation': 'ki-bo-deu', 'definition': '문자 입력 장치'},
                {'word': '마우스', 'pronunciation': 'ma-u-seu', 'definition': '컴퓨터 조작 도구'},
                {'word': '모니터', 'pronunciation': 'mo-ni-teo', 'definition': '화면 표시 장치'},
                {'word': '스피커', 'pronunciation': 'seu-pi-keo', 'definition': '소리 출력 장치'},
                {'word': '프린터', 'pronunciation': 'peu-rin-teo', 'definition': '인쇄 장치'},
                {'word': '카메라', 'pronunciation': 'ka-me-ra', 'definition': '영상 촬영 장치'},
                {'word': '스마트폰', 'pronunciation': 'seu-ma-teu-pon', 'definition': '스마트 전화기'},
                {'word': '태블릿', 'pronunciation': 'tae-beul-rit', 'definition': '터치스크린 장치'}
            ],
            'english': [
                {'word': 'computer', 'pronunciation': '/kəmˈpjuːtər/', 'definition': 'electronic computing device'},
                {'word': 'laptop', 'pronunciation': '/ˈlæptɑːp/', 'definition': 'portable computer'},
                {'word': 'keyboard', 'pronunciation': '/ˈkiːbɔːrd/', 'definition': 'text input device'},
                {'word': 'mouse', 'pronunciation': '/maʊs/', 'definition': 'computer control tool'},
                {'word': 'monitor', 'pronunciation': '/ˈmɑːnɪtər/', 'definition': 'screen display device'},
                {'word': 'speaker', 'pronunciation': '/ˈspiːkər/', 'definition': 'sound output device'},
                {'word': 'printer', 'pronunciation': '/ˈprɪntər/', 'definition': 'printing device'},
                {'word': 'camera', 'pronunciation': '/ˈkæmərə/', 'definition': 'video recording device'},
                {'word': 'smartphone', 'pronunciation': '/ˈsmɑːrtfoʊn/', 'definition': 'smart telephone'},
                {'word': 'tablet', 'pronunciation': '/ˈtæblət/', 'definition': 'touchscreen device'}
            ],
            'japanese': [
                {'word': 'コンピュータ', 'pronunciation': 'konpyūta', 'definition': '電子計算装置'},
                {'word': 'ノートパソコン', 'pronunciation': 'nōto pasokon', 'definition': '携帯用コンピュータ'},
                {'word': 'キーボード', 'pronunciation': 'kībōdo', 'definition': '文字入力装置'},
                {'word': 'マウス', 'pronunciation': 'mausu', 'definition': 'コンピュータ操作道具'},
                {'word': 'モニター', 'pronunciation': 'monitā', 'definition': '画面表示装置'},
                {'word': 'スピーカー', 'pronunciation': 'supīkā', 'definition': '音声出力装置'},
                {'word': 'プリンター', 'pronunciation': 'purintā', 'definition': '印刷装置'},
                {'word': 'カメラ', 'pronunciation': 'kamera', 'definition': '映像撮影装置'},
                {'word': 'スマートフォン', 'pronunciation': 'sumātofon', 'definition': 'スマート電話'},
                {'word': 'タブレット', 'pronunciation': 'taburetto', 'definition': 'タッチスクリーン装置'}
            ],
            'chinese': [
                {'word': '电脑', 'pronunciation': 'diànnǎo', 'definition': '电子计算设备'},
                {'word': '笔记本', 'pronunciation': 'bǐjìběn', 'definition': '便携式电脑'},
                {'word': '键盘', 'pronunciation': 'jiànpán', 'definition': '文字输入设备'},
                {'word': '鼠标', 'pronunciation': 'shǔbiāo', 'definition': '电脑操作工具'},
                {'word': '显示器', 'pronunciation': 'xiǎnshìqì', 'definition': '屏幕显示设备'},
                {'word': '扬声器', 'pronunciation': 'yángshēngqì', 'definition': '声音输出设备'},
                {'word': '打印机', 'pronunciation': 'dǎyìnjī', 'definition': '打印设备'},
                {'word': '摄像头', 'pronunciation': 'shèxiàngtóu', 'definition': '视频录制设备'},
                {'word': '智能手机', 'pronunciation': 'zhìnéng shǒujī', 'definition': '智能电话'},
                {'word': '平板电脑', 'pronunciation': 'píngbǎn diànnǎo', 'definition': '触摸屏设备'}
            ],
            'spanish': [
                {'word': 'computadora', 'pronunciation': 'kom-pu-ta-do-ra', 'definition': 'dispositivo de computación'},
                {'word': 'portátil', 'pronunciation': 'por-tá-til', 'definition': 'computadora portátil'},
                {'word': 'teclado', 'pronunciation': 'te-kla-do', 'definition': 'dispositivo de entrada de texto'},
                {'word': 'ratón', 'pronunciation': 'ra-tón', 'definition': 'herramienta de control de computadora'},
                {'word': 'monitor', 'pronunciation': 'mo-ni-tor', 'definition': 'dispositivo de visualización'},
                {'word': 'altavoz', 'pronunciation': 'al-ta-voz', 'definition': 'dispositivo de salida de sonido'},
                {'word': 'impresora', 'pronunciation': 'im-pre-so-ra', 'definition': 'dispositivo de impresión'},
                {'word': 'cámara', 'pronunciation': 'cá-ma-ra', 'definition': 'dispositivo de grabación de video'},
                {'word': 'teléfono inteligente', 'pronunciation': 'te-lé-fo-no in-te-li-gen-te', 'definition': 'teléfono inteligente'},
                {'word': 'tableta', 'pronunciation': 'ta-ble-ta', 'definition': 'dispositivo de pantalla táctil'}
            ]
        }
    }
    
    # 랜덤 선택
    domain_data = random.choice(domains)
    domain = domain_data['name']
    category = random.choice(domain_data['categories'])
    
    # 단어 데이터 키 생성
    word_key = f"{domain}_{category}"
    
    # 기본 단어 데이터가 없으면 기본값 사용
    if word_key not in word_database:
        word_key = list(word_database.keys())[0]  # 첫 번째 키 사용
    
    # 각 언어별 랜덤 단어 선택
    words = {}
    for lang in ['korean', 'english', 'japanese', 'chinese', 'spanish']:
        word_data = random.choice(word_database[word_key][lang])
        words[lang] = word_data
    
    # concept_id 생성
    base_word = words['english']['word'].lower().replace(' ', '_')
    concept_id = f"{domain}_{base_word}_{category}"
    
    # 이모지와 색상 매핑
    emoji_color_map = {
        'food': {'emoji': '🍎', 'color': '#FF5722'},
        'daily': {'emoji': '👋', 'color': '#4CAF50'},
        'travel': {'emoji': '✈️', 'color': '#2196F3'},
        'education': {'emoji': '📚', 'color': '#FF9800'},
        'technology': {'emoji': '💻', 'color': '#607D8B'},
        'nature': {'emoji': '🌱', 'color': '#8BC34A'},
        'health': {'emoji': '💊', 'color': '#E91E63'},
        'shopping': {'emoji': '🛒', 'color': '#9C27B0'},
        'work': {'emoji': '💼', 'color': '#795548'},
        'hobby': {'emoji': '🎨', 'color': '#FF9800'}
    }
    
    emoji_color = emoji_color_map.get(domain, {'emoji': '📝', 'color': '#607D8B'})
    
    return {
        'concept_id': concept_id,
        'domain': domain,
        'category': category,
        'difficulty': random.choice(['basic', 'intermediate', 'advanced']),
        'emoji': emoji_color['emoji'],
        'color': emoji_color['color'],
        'situation': random.choice(['casual', 'formal', 'casual,formal']),
        'purpose': random.choice(['description', 'action', 'greeting', 'question']),
        'words': words
    }

def generate_templates(count=3):
    """지정된 개수만큼 새로운 템플릿 생성 (concept_id와 단어 중복 방지)"""
    existing_ids, existing_words = load_existing_concept_ids()
    
    new_concepts = []
    attempts = 0
    max_attempts = count * 50  # 충분한 시도 횟수 제공
    
    while len(new_concepts) < count and attempts < max_attempts:
        attempts += 1
        concept_data = generate_random_concept_data()
        
        # concept_id 중복 검사
        if concept_data['concept_id'] in existing_ids:
            continue
            
        # 단어 중복 검사 (다의어 허용 방식)
        word_conflict = False
        conflict_details = []
        
        for lang in ['korean', 'english', 'japanese', 'chinese', 'spanish']:
            word = concept_data['words'][lang]['word'].lower().strip()
            
            # 단어가 이미 존재하는지 확인
            if word in existing_words[lang]:
                # **다의어 처리**: 다른 도메인/카테고리면 허용
                is_polysemy_allowed = True
                
                # 같은 도메인-카테고리 조합에서는 중복 불허
                current_context = f"{concept_data['domain']}_{concept_data['category']}"
                
                # 기존 데이터에서 같은 단어의 context 확인 (간단한 휴리스틱)
                # 실제로는 DB 조회가 필요하지만, 여기서는 도메인이 다르면 허용
                if concept_data['domain'] in ['food', 'daily', 'travel']:  # 주요 도메인
                    # 같은 도메인에서는 중복 불허
                    for existing_concept_id in existing_ids:
                        if existing_concept_id.startswith(concept_data['domain']):
                            if word in existing_concept_id:  # 휴리스틱: concept_id에 단어가 포함된 경우
                                is_polysemy_allowed = False
                                break
                
                if not is_polysemy_allowed:
                    word_conflict = True
                    conflict_details.append(f"{lang}:{word}[동일도메인]")
                    break
                else:
                    # 다의어로 허용 (다른 도메인/카테고리)
                    print(f"🔀 다의어 허용: {word} ({concept_data['domain']}.{concept_data['category']})")
            
        if not word_conflict:
            new_concepts.append(concept_data)
            existing_ids.add(concept_data['concept_id'])  # 중복 방지
            
            # 새 단어들을 기존 단어 세트에 추가
            for lang in ['korean', 'english', 'japanese', 'chinese', 'spanish']:
                word = concept_data['words'][lang]['word'].lower().strip()
                existing_words[lang].add(word)
            
            print(f"✅ 생성됨: {concept_data['concept_id']} ({concept_data['words']['korean']['word']} - {concept_data['words']['english']['word']})")
        elif attempts % 10 == 0:  # 10번마다 진행상황 표시
            print(f"🔄 중복 방지 중... ({attempts}/{max_attempts}) - 충돌: {', '.join(conflict_details[:2])}")
    
    if len(new_concepts) < count:
        print(f"⚠️ 요청한 {count}개 중 {len(new_concepts)}개만 생성됨 (중복 방지로 인해)")
        print(f"   시도 횟수: {attempts}/{max_attempts}")
        if attempts >= max_attempts:
            print(f"💡 더 많은 데이터를 생성하려면 단어 데이터베이스를 확장하세요.")
    
    return new_concepts

def save_templates(concepts_data, file_type="add"):
    """생성된 템플릿을 현재 파일 구조에 맞게 저장"""
    if not concepts_data:
        print("❌ 저장할 데이터가 없습니다.")
        return
    
    try:
        # 현재 파일 구조 확인
        concepts_file = DATA_DIR / "concepts_template_add.csv"
        examples_file = DATA_DIR / "examples_template_add.csv"  
        grammar_file = DATA_DIR / "grammar_template_add.csv"
        
        # 기존 파일 구조 분석
        existing_concepts_structure = None
        existing_examples_structure = None
        existing_grammar_structure = None
        
        if concepts_file.exists():
            with open(concepts_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                existing_concepts_structure = reader.fieldnames
        
        if examples_file.exists():
            with open(examples_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                existing_examples_structure = reader.fieldnames
        
        if grammar_file.exists():
            with open(grammar_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                existing_grammar_structure = reader.fieldnames
        
        # Concepts 데이터 생성 (55개 필드 완전 구조)
        concepts_rows = []
        for concept in concepts_data:
            # 통합_데이터_가이드.md 기준 55개 필드 구조
            concepts_row = {
                # 연결성 필드 (1개)
                'concept_id': concept['concept_id'],
                
                # 기본 정보 (7개)
                'domain': concept['domain'],
                'category': concept['category'],
                'difficulty': concept['difficulty'],
                'emoji': concept.get('emoji', '📚'),
                'color': concept.get('color', '#4CAF50'),
                'situation': concept['situation'],
                'purpose': concept['purpose'],
                
                # 한국어 (9개 필드)
                'korean_word': concept['words']['korean']['word'],
                'korean_pronunciation': concept['words']['korean']['pronunciation'],
                'korean_definition': concept['words']['korean']['definition'],
                'korean_pos': '명사',
                'korean_synonyms': f"{concept['words']['korean']['word']}류,과일류" if 'fruit' in concept['concept_id'] else f"{concept['words']['korean']['word']}형,관련어",
                'korean_antonyms': f"비{concept['words']['korean']['word']},반대말",
                'korean_word_family': f"{concept['words']['korean']['word']}족,{concept['words']['korean']['word']}계열",
                'korean_compound_words': f"{concept['words']['korean']['word']}나무,{concept['words']['korean']['word']}즙",
                'korean_collocations': f"{concept['words']['korean']['word']}을 먹다,{concept['words']['korean']['word']}을 사다",
                
                # 영어 (9개 필드)
                'english_word': concept['words']['english']['word'],
                'english_pronunciation': concept['words']['english']['pronunciation'],
                'english_definition': concept['words']['english']['definition'],
                'english_pos': 'noun',
                'english_synonyms': f"{concept['words']['english']['word']} type,fruit variety" if 'fruit' in concept['concept_id'] else f"{concept['words']['english']['word']} kind,related item",
                'english_antonyms': f"non-{concept['words']['english']['word']},opposite",
                'english_word_family': f"{concept['words']['english']['word']} family,{concept['words']['english']['word']} group",
                'english_compound_words': f"{concept['words']['english']['word']} tree,{concept['words']['english']['word']} juice",
                'english_collocations': f"eat {concept['words']['english']['word']},buy {concept['words']['english']['word']}",
                
                # 중국어 (9개 필드)
                'chinese_word': concept['words']['chinese']['word'],
                'chinese_pronunciation': concept['words']['chinese']['pronunciation'],
                'chinese_definition': concept['words']['chinese']['definition'],
                'chinese_pos': '名词',
                'chinese_synonyms': f"{concept['words']['chinese']['word']}类,水果类" if 'fruit' in concept['concept_id'] else f"{concept['words']['chinese']['word']}型,相关词",
                'chinese_antonyms': f"非{concept['words']['chinese']['word']},反义词",
                'chinese_word_family': f"{concept['words']['chinese']['word']}族,{concept['words']['chinese']['word']}系列",
                'chinese_compound_words': f"{concept['words']['chinese']['word']}树,{concept['words']['chinese']['word']}汁",
                'chinese_collocations': f"吃{concept['words']['chinese']['word']},买{concept['words']['chinese']['word']}",
                
                # 일본어 (9개 필드)
                'japanese_word': concept['words']['japanese']['word'],
                'japanese_pronunciation': concept['words']['japanese']['pronunciation'],
                'japanese_definition': concept['words']['japanese']['definition'],
                'japanese_pos': '名詞',
                'japanese_synonyms': f"{concept['words']['japanese']['word']}類,果物類" if 'fruit' in concept['concept_id'] else f"{concept['words']['japanese']['word']}型,関連語",
                'japanese_antonyms': f"非{concept['words']['japanese']['word']},反対語",
                'japanese_word_family': f"{concept['words']['japanese']['word']}族,{concept['words']['japanese']['word']}系列",
                'japanese_compound_words': f"{concept['words']['japanese']['word']}の木,{concept['words']['japanese']['word']}ジュース",
                'japanese_collocations': f"{concept['words']['japanese']['word']}を食べる,{concept['words']['japanese']['word']}を買う",
                
                # 스페인어 (9개 필드)
                'spanish_word': concept['words']['spanish']['word'],
                'spanish_pronunciation': concept['words']['spanish']['pronunciation'],
                'spanish_definition': concept['words']['spanish']['definition'],
                'spanish_pos': 'sustantivo',
                'spanish_synonyms': f"{concept['words']['spanish']['word']} tipo,variedad de fruta" if 'fruit' in concept['concept_id'] else f"{concept['words']['spanish']['word']} tipo,artículo relacionado",
                'spanish_antonyms': f"no {concept['words']['spanish']['word']},opuesto",
                'spanish_word_family': f"familia {concept['words']['spanish']['word']},grupo {concept['words']['spanish']['word']}",
                'spanish_compound_words': f"árbol de {concept['words']['spanish']['word']},jugo de {concept['words']['spanish']['word']}",
                'spanish_collocations': f"comer {concept['words']['spanish']['word']},comprar {concept['words']['spanish']['word']}",
                
                # 대표 예문 (5개 필드)
                'korean_example': f"{concept['words']['korean']['word']}를 사용해요",
                'english_example': f"I use {concept['words']['english']['word']}",
                'chinese_example': f"我使用{concept['words']['chinese']['word']}",
                'japanese_example': f"{concept['words']['japanese']['word']}を使います",
                'spanish_example': f"Uso {concept['words']['spanish']['word']}"
            }
            concepts_rows.append(concepts_row)
        
        # Examples 데이터 생성
        examples_rows = []
        for concept in concepts_data:
            if existing_examples_structure:
                examples_row = {field: '' for field in existing_examples_structure}
                examples_row.update({
                    'concept_id': concept['concept_id'],
                    'domain': concept['domain'],
                    'category': concept['category'],
                    'difficulty': concept['difficulty'],
                    'situation': concept['situation'],
                    'purpose': concept['purpose'],
                    'korean': f"{concept['words']['korean']['word']}에 대해 이야기해요",
                    'english': f"Let's talk about {concept['words']['english']['word']}",
                    'japanese': f"{concept['words']['japanese']['word']}について話しましょう",
                    'chinese': f"我们来谈论{concept['words']['chinese']['word']}",
                    'spanish': f"Hablemos sobre {concept['words']['spanish']['word']}",
                    'korean_word': concept['words']['korean']['word'],
                    'english_word': concept['words']['english']['word'],
                    'japanese_word': concept['words']['japanese']['word'],
                    'chinese_word': concept['words']['chinese']['word'],
                    'spanish_word': concept['words']['spanish']['word']
                })
            else:
                examples_row = {
                    'concept_id': concept['concept_id'],
                    'domain': concept['domain'],
                    'category': concept['category'],
                    'difficulty': concept['difficulty'],
                    'situation': concept['situation'],
                    'purpose': concept['purpose'],
                    'korean': f"{concept['words']['korean']['word']}에 대해 이야기해요",
                    'english': f"Let's talk about {concept['words']['english']['word']}",
                    'japanese': f"{concept['words']['japanese']['word']}について話しましょう",
                    'chinese': f"我们来谈론{concept['words']['chinese']['word']}",
                    'spanish': f"Hablemos sobre {concept['words']['spanish']['word']}",
                    'korean_word': concept['words']['korean']['word'],
                    'english_word': concept['words']['english']['word'],
                    'japanese_word': concept['words']['japanese']['word'],
                    'chinese_word': concept['words']['chinese']['word'],
                    'spanish_word': concept['words']['spanish']['word']
                }
            examples_rows.append(examples_row)
        
        # Grammar 데이터 생성 (31개 필드 완전 구조)
        grammar_rows = []
        for concept in concepts_data:
            # 통합_데이터_가이드.md 기준 31개 필드 구조
            grammar_row = {
                'concept_id': concept['concept_id'],
                'domain': concept['domain'],
                'category': concept['category'],
                'difficulty': concept['difficulty'],
                'situation': concept['situation'],
                'purpose': concept['purpose'],
                
                # 한국어 패턴 (3개 필드)
                'korean_title': f"{concept['words']['korean']['word']} 사용법",
                'korean_structure': f"{concept['words']['korean']['word']} + 를/을",
                'korean_description': f"{concept['words']['korean']['word']}를 사용하는 문법 패턴",
                'korean_example': f"저는 {concept['words']['korean']['word']}를 좋아해요",
                
                # 영어 패턴 (3개 필드)  
                'english_title': f"Using {concept['words']['english']['word']}",
                'english_structure': f"Subject + verb + {concept['words']['english']['word']}",
                'english_description': f"Grammar pattern for using {concept['words']['english']['word']}",
                'english_example': f"I like {concept['words']['english']['word']}",
                
                # 일본어 패턴 (3개 필드)
                'japanese_title': f"{concept['words']['japanese']['word']}の使い方",
                'japanese_structure': f"{concept['words']['japanese']['word']} + を",
                'japanese_description': f"{concept['words']['japanese']['word']}を使う文法パターン",
                'japanese_example': f"私は{concept['words']['japanese']['word']}が好きです",
                
                # 중국어 패턴 (3개 필드)
                'chinese_title': f"{concept['words']['chinese']['word']}的用法",
                'chinese_structure': f"主语 + 动词 + {concept['words']['chinese']['word']}",
                'chinese_description': f"使用{concept['words']['chinese']['word']}的语法模式",
                'chinese_example': f"我喜欢{concept['words']['chinese']['word']}",
                
                # 스페인어 패턴 (3개 필드)
                'spanish_title': f"Uso de {concept['words']['spanish']['word']}",
                'spanish_structure': f"Sujeto + verbo + {concept['words']['spanish']['word']}",
                'spanish_description': f"Patrón gramatical para usar {concept['words']['spanish']['word']}",
                'spanish_example': f"Me gusta {concept['words']['spanish']['word']}",
                
                # 핵심 단어 (5개 필드)
                'korean_word': concept['words']['korean']['word'],
                'english_word': concept['words']['english']['word'],
                'japanese_word': concept['words']['japanese']['word'],
                'chinese_word': concept['words']['chinese']['word'],
                'spanish_word': concept['words']['spanish']['word']
            }
            grammar_rows.append(grammar_row)
        
        # 파일 저장
        file_suffix = "_add" if file_type == "add" else "_list"
        
        # 정확한 55개 필드 순서 (통합_데이터_가이드.md 기준)
        concepts_fieldnames = [
            'concept_id','domain','category','difficulty','emoji','color','situation','purpose',
            'korean_word','korean_pronunciation','korean_definition','korean_pos','korean_synonyms','korean_antonyms','korean_word_family','korean_compound_words','korean_collocations',
            'english_word','english_pronunciation','english_definition','english_pos','english_synonyms','english_antonyms','english_word_family','english_compound_words','english_collocations',
            'chinese_word','chinese_pronunciation','chinese_definition','chinese_pos','chinese_synonyms','chinese_antonyms','chinese_word_family','chinese_compound_words','chinese_collocations',
            'japanese_word','japanese_pronunciation','japanese_definition','japanese_pos','japanese_synonyms','japanese_antonyms','japanese_word_family','japanese_compound_words','japanese_collocations',
            'spanish_word','spanish_pronunciation','spanish_definition','spanish_pos','spanish_synonyms','spanish_antonyms','spanish_word_family','spanish_compound_words','spanish_collocations',
            'korean_example','english_example','chinese_example','japanese_example','spanish_example'
        ]
        
        # Concepts 파일
        concepts_output = DATA_DIR / f"concepts_template{file_suffix}.csv"
        with open(concepts_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=concepts_fieldnames)
            writer.writeheader()
            writer.writerows(concepts_rows)
        print(f"✅ concepts_template{file_suffix}.csv 저장 완료 ({len(concepts_rows)}개)")
        
        # Examples 파일
        examples_output = DATA_DIR / f"examples_template{file_suffix}.csv"
        with open(examples_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=examples_rows[0].keys())
            writer.writeheader()
            writer.writerows(examples_rows)
        print(f"✅ examples_template{file_suffix}.csv 저장 완료 ({len(examples_rows)}개)")
        
        # Grammar 파일
        grammar_output = DATA_DIR / f"grammar_template{file_suffix}.csv"
        with open(grammar_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=grammar_rows[0].keys())
            writer.writeheader()
            writer.writerows(grammar_rows)
        print(f"✅ grammar_template{file_suffix}.csv 저장 완료 ({len(grammar_rows)}개)")
        
        print(f"\n🎉 템플릿 생성 완료! (기존 구조 유지)")
        print(f"📁 저장 위치: {DATA_DIR}")
        print(f"📊 총 데이터: {len(concepts_data)}개 concept × 3개 파일")
        
    except Exception as e:
        print(f"❌ 파일 저장 실패: {e}")
        import traceback
        traceback.print_exc()

def main():
    """메인 실행"""
    print("🎲 Random Template Generator")
    print("=" * 50)
    
    try:
        count = int(input("생성할 템플릿 개수를 입력하세요 (기본값: 3): ") or "3")
    except ValueError:
        count = 3
    
    # 랜덤 템플릿 생성
    concepts = generate_templates(count)
    
    if concepts:
        # _add.csv 파일로 저장
        save_templates(concepts, "add")
        
        print(f"\n💡 다음 단계:")
        print(f"   1️⃣ 누적 저장: python accumulator.py")
        print(f"   2️⃣ 데이터 검증: python validate.py")
    else:
        print("❌ 생성된 템플릿이 없습니다.")

if __name__ == "__main__":
    main()
