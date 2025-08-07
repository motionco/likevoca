#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Accumulator - 데이터 누적기
_add.csv 파일의 데이터를 _list.csv 파일에 누적합니다.
"""

import csv
import json
import datetime
from pathlib import Path

# 기본 설정
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

def update_transaction_log(added_concepts):
    """JSON 트랜잭션 로그 업데이트"""
    log_path = DATA_DIR / "data_tracking_log.json"
    
    # 현재 시간
    timestamp = datetime.datetime.now().isoformat() + "Z"
    transaction_id = f"TX_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    try:
        # 기존 로그 파일 읽기
        if log_path.exists() and log_path.stat().st_size > 0:
            with open(log_path, "r", encoding="utf-8") as f:
                try:
                    log_data = json.load(f)
                except json.JSONDecodeError:
                    # 파일이 손상되었거나 비어있는 경우 새로 생성
                    log_data = None
        else:
            log_data = None
            
        if log_data is None:
            # 새 로그 구조 생성
            log_data = {
                "metadata": {
                    "created": datetime.datetime.now().strftime("%Y-%m-%d"),
                    "last_updated": timestamp,
                    "system_version": "v2.0",
                    "description": "LikeVoca 데이터 트랜잭션 로그"
                },
                "transactions": [],
                "current_status": {}
            }
        
        # 실제 concepts_template_list.csv 파일의 데이터 개수 계산
        list_file_path = DATA_DIR / "concepts_template_list.csv"
        actual_records_count = 0
        if list_file_path.exists():
            with open(list_file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.reader(f)
                next(reader, None)  # 헤더 스킵
                actual_records_count = sum(1 for row in reader)
        
        # 새 트랜잭션 추가
        new_transaction = {
            "transaction_id": transaction_id,
            "timestamp": timestamp,
            "operation": "ADD",
            "added_concepts": added_concepts,
            "summary": {
                "concepts_added": len(added_concepts),
                "total_records_after": actual_records_count
            }
        }
        
        log_data["transactions"].append(new_transaction)
        log_data["metadata"]["last_updated"] = timestamp
        
        # 현재 상태 업데이트
        log_data["current_status"] = {
            "total_transactions": len(log_data["transactions"]),
            "last_transaction": transaction_id,
            "last_update": timestamp
        }
        
        # 로그 파일 저장
        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        
        print(f"📊 트랜잭션 로그 업데이트: {transaction_id}")
        
    except Exception as e:
        print(f"⚠️ 트랜잭션 로그 업데이트 실패: {e}")

def identify_skipped_concepts(file_info):
    """1단계: concepts 파일에서 스킵 대상 concept_id 식별"""
    add_file, list_file = file_info
    add_path = DATA_DIR / add_file
    list_path = DATA_DIR / list_file
    
    skipped_concept_ids = set()
    
    if not add_path.exists():
        print(f"❌ {add_file} 파일이 없습니다.")
        return skipped_concept_ids
    
    # 기존 concepts 데이터 읽기
    existing_concept_ids = set()
    existing_word_meanings = set()
    
    if list_path.exists():
        with open(list_path, 'r', encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                concept_id = row.get('concept_id', '')
                if concept_id:
                    existing_concept_ids.add(concept_id)
                    
                    # 단어+의미 조합도 체크
                    english_word = row.get('english_word', '')
                    korean_word = row.get('korean_word', '')
                    if english_word and korean_word and concept_id:
                        parts = concept_id.split('_')
                        meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                        en_combination = f"{english_word}_{meaning}"
                        ko_combination = f"{korean_word}_{meaning}"
                        existing_word_meanings.add(en_combination)
                        existing_word_meanings.add(ko_combination)
    
    # 신규 concepts 데이터에서 스킵 대상 식별
    with open(add_path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        new_data = list(reader)
    
    print(f"🔍 스킵 대상 식별: {len(new_data)}개 신규 데이터, {len(existing_concept_ids)}개 기존 concept_id, {len(existing_word_meanings)}개 기존 단어+의미")
    
    for row in new_data:
        concept_id = row.get('concept_id', '')
        skip_reason = None
        
        # 1. concept_id 중복 검사
        if concept_id in existing_concept_ids:
            skip_reason = f"concept_id 중복: {concept_id}"
            skipped_concept_ids.add(concept_id)
        
        # 2. 단어+의미 조합 중복 검사
        elif concept_id:
            english_word = row.get('english_word', '')
            korean_word = row.get('korean_word', '')
            if english_word and korean_word:
                parts = concept_id.split('_')
                meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                en_combination = f"{english_word}_{meaning}"
                ko_combination = f"{korean_word}_{meaning}"
                
                if en_combination in existing_word_meanings or ko_combination in existing_word_meanings:
                    skip_reason = f"단어+의미 중복: {en_combination} 또는 {ko_combination}"
                    skipped_concept_ids.add(concept_id)
        
        if skip_reason:
            print(f"  ⚠️ 스킵 대상 식별: {concept_id} ({skip_reason})")
    
    return skipped_concept_ids


def accumulate_data():
    """_add.csv 파일들의 데이터를 _list.csv 파일들에 누적 (2단계 방식)"""
    file_pairs = [
        ("concepts_template_add.csv", "concepts_template_list.csv"),
        ("examples_template_add.csv", "examples_template_list.csv"), 
        ("grammar_template_add.csv", "grammar_template_list.csv")
    ]
    
    print("📁 데이터 누적 시작...")
    
    # 1단계: concepts 파일에서 스킵 대상 식별
    print("\n🔍 1단계: Concepts 파일에서 스킵 대상 식별...")
    skipped_concept_ids = identify_skipped_concepts(file_pairs[0])
    print(f"📋 총 {len(skipped_concept_ids)}개 concept_id가 스킵 대상으로 식별됨")
    
    # 2단계: 모든 파일에서 스킵 대상 제외하고 처리
    print(f"\n🔧 2단계: 모든 파일에서 스킵 대상 제외 처리...")
    total_added_concepts = []
    
    for add_file, list_file in file_pairs:
        add_path = DATA_DIR / add_file
        list_path = DATA_DIR / list_file
        
        if not add_path.exists():
            print(f"⚠️ {add_file} 파일이 존재하지 않습니다.")
            continue
        
        try:
            # _add.csv 파일 읽기 (BOM 제거를 위해 utf-8-sig 사용)
            with open(add_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                new_data = list(reader)
            
            if not new_data:
                print(f"⚠️ {add_file}에 데이터가 없습니다.")
                continue
            
            # 기존 _list.csv 파일 읽기 (있다면)
            existing_data = []
            existing_concept_ids = set()
            existing_word_meanings = set()  # 단어+의미 조합 추적
            list_fieldnames = None
            
            if list_path.exists() and list_path.stat().st_size > 0:
                with open(list_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    list_fieldnames = reader.fieldnames  # 기존 파일의 필드명 저장
                    # BOM 제거
                    if list_fieldnames and list_fieldnames[0].startswith('\ufeff'):
                        list_fieldnames = [list_fieldnames[0][1:]] + list(list_fieldnames[1:])
                    existing_data = list(reader)
                    
                    # 기존 데이터의 concept_id와 단어+의미 조합 수집
                    for row in existing_data:
                        concept_id = row.get('concept_id', '')
                        if concept_id:
                            existing_concept_ids.add(concept_id)
                            
                            # concepts 파일인 경우 단어+의미 조합도 체크
                            if add_file == "concepts_template_add.csv":
                                english_word = row.get('english_word', '')
                                korean_word = row.get('korean_word', '')
                                if english_word and korean_word and concept_id:
                                    parts = concept_id.split('_')
                                    meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                                    en_combination = f"{english_word}_{meaning}"
                                    ko_combination = f"{korean_word}_{meaning}"
                                    existing_word_meanings.add(en_combination)
                                    existing_word_meanings.add(ko_combination)
            
            # 필드명 결정: 기존 list 파일이 있으면 그것 사용, 없으면 add 파일 사용
            if list_fieldnames is None:
                list_fieldnames = new_data[0].keys() if new_data else []
            
            print(f"🔧 사용할 필드명 (처음 5개): {list(list_fieldnames)[:5]}")
            print(f"🔧 신규 데이터 필드명 (처음 5개): {list(new_data[0].keys())[:5] if new_data else []}")
            
            # 중복 제거하면서 새 데이터 추가
            added_count = 0
            print(f"🔍 {add_file}: {len(new_data)}개 신규 데이터, {len(existing_concept_ids)}개 기존 concept_id, {len(existing_word_meanings)}개 기존 단어+의미")
            
            for row in new_data:
                concept_id = row.get('concept_id', '')
                skip_reason = None
                
                # 0. 1단계에서 식별된 스킵 대상 검사 (모든 파일 공통)
                if concept_id in skipped_concept_ids:
                    skip_reason = f"1단계에서 스킵된 concept_id: {concept_id}"
                
                # 1. concept_id 중복 검사 (기존 데이터와 비교)
                elif concept_id in existing_concept_ids:
                    skip_reason = f"concept_id 중복: {concept_id}"
                
                # 2. 단어+의미 조합 중복 검사 (concepts 파일인 경우만 체크하지만 모든 파일에 적용)
                elif add_file == "concepts_template_add.csv" and concept_id:
                    english_word = row.get('english_word', '')
                    korean_word = row.get('korean_word', '')
                    if english_word and korean_word:
                        parts = concept_id.split('_')
                        meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                        en_combination = f"{english_word}_{meaning}"
                        ko_combination = f"{korean_word}_{meaning}"
                        
                        if en_combination in existing_word_meanings or ko_combination in existing_word_meanings:
                            skip_reason = f"단어+의미 중복: {en_combination} 또는 {ko_combination}"
                
                # 추가 또는 스킵
                if concept_id and not skip_reason:
                    existing_data.append(row)
                    existing_concept_ids.add(concept_id)
                    
                    # concepts 파일인 경우 단어+의미 조합도 추가
                    if add_file == "concepts_template_add.csv":
                        english_word = row.get('english_word', '')
                        korean_word = row.get('korean_word', '')
                        if english_word and korean_word:
                            parts = concept_id.split('_')
                            meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                            en_combination = f"{english_word}_{meaning}"
                            ko_combination = f"{korean_word}_{meaning}"
                            existing_word_meanings.add(en_combination)
                            existing_word_meanings.add(ko_combination)
                    
                    added_count += 1
                    print(f"  ➕ 추가: {concept_id}")
                    
                    # concepts 파일인 경우 트랜잭션 로그용 데이터 수집
                    if add_file == "concepts_template_add.csv":
                        total_added_concepts.append({
                            "concept_id": concept_id,
                            "domain": row.get('domain', ''),
                            "category": row.get('category', ''),
                            "korean_word": row.get('korean_word', ''),
                            "english_word": row.get('english_word', '')
                        })
                else:
                    print(f"  ⚠️ 스킵: {concept_id} ({skip_reason or '빈 concept_id'})")
            
            print(f"📊 처리 결과: {added_count}개 추가됨, 총 {len(existing_data)}개 데이터")
            
            # _list.csv 파일에 전체 데이터 저장 (데이터가 있거나 새로 추가된 경우)
            if existing_data or added_count > 0:
                with open(list_path, "w", encoding="utf-8-sig", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=list_fieldnames)
                    writer.writeheader()
                    writer.writerows(existing_data)
                
                print(f"✅ {list_file}: {added_count}개 추가, 총 {len(existing_data)}개")
            else:
                print(f"⚠️ {list_file}: 저장할 데이터가 없습니다.")
                
        except Exception as e:
            print(f"❌ {add_file} 처리 실패: {e}")
    
    # 트랜잭션 로그 업데이트 (concepts가 추가된 경우에만)
    if total_added_concepts:
        update_transaction_log(total_added_concepts)
    
    print("\n🎉 데이터 누적 완료!")

def check_data_status():
    """현재 데이터 상태 확인"""
    print("\n📊 데이터 현황:")
    print("-" * 40)
    
    files = [
        "concepts_template_add.csv",
        "concepts_template_list.csv", 
        "examples_template_add.csv",
        "examples_template_list.csv",
        "grammar_template_add.csv",
        "grammar_template_list.csv"
    ]
    
    for file_name in files:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    count = len(list(reader))
                print(f"   📄 {file_name}: {count}개 데이터")
            except Exception as e:
                print(f"   ❌ {file_name}: 읽기 실패 ({e})")
        else:
            print(f"   ⚪ {file_name}: 파일 없음")

def main():
    """메인 실행"""
    print("📥 Data Accumulator")
    print("=" * 50)
    
    # 현재 상태 확인
    check_data_status()
    
    # 데이터 누적
    accumulate_data()
    
    # 누적 후 상태 확인
    check_data_status()
    
    print(f"\n💡 다음 단계:")
    print(f"   1️⃣ 데이터 백업: python backup.py")
    print(f"   2️⃣ 새 데이터 생성: python generate.py")
    print(f"   3️⃣ 백업 복원: python restore.py")

if __name__ == "__main__":
    main()
