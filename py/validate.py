#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Data Validation - 완전한 데이터 검증
중복 검증 + 무결성 검증 + 필드 완성도 검증 + 포맷 검증
"""

import csv
import os
from pathlib import Path

# 경로 설정
PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"

def ensure_directories():
    """필요한 디렉토리 생성"""
    DATA_DIR.mkdir(exist_ok=True)

def validate_duplicates():
    """_add.csv 파일들과 기존 _list.csv 파일들 간 교차 중복 검증"""
    print("🎯 중복 검증 (_add.csv ↔ _list.csv 교차 검증)")
    print("="*50)
    
    # 1. 기존 _list.csv 데이터 수집
    existing_concept_ids = set()
    existing_word_meanings = set()
    
    list_files = ["concepts_template_list.csv", "examples_template_list.csv", "grammar_template_list.csv"]
    for file_name in list_files:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        concept_id = row.get('concept_id', '')
                        if concept_id:
                            existing_concept_ids.add(concept_id)
                            
                            # concepts 파일에서 단어+의미 조합 수집
                            if "concepts_template" in file_name:
                                english_word = row.get('english_word', '')
                                korean_word = row.get('korean_word', '')
                                if english_word and korean_word:
                                    parts = concept_id.split('_')
                                    meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                                    en_combination = f"{english_word}_{meaning}"
                                    ko_combination = f"{korean_word}_{meaning}"
                                    existing_word_meanings.add(en_combination)
                                    existing_word_meanings.add(ko_combination)
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 오류: {e}")
    
    print(f"📊 기존 데이터: {len(existing_concept_ids)}개 concept_id, {len(existing_word_meanings)}개 단어+의미 조합")
    
    # 2. _add.csv 파일들 검증
    files_to_check = [
        "concepts_template_add.csv",
        "examples_template_add.csv", 
        "grammar_template_add.csv"
    ]
    
    all_clean = True
    
    for file_name in files_to_check:
        file_path = DATA_DIR / file_name
        if not file_path.exists():
            print(f"⚪ {file_name}: 파일 없음")
            continue
            
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            if not rows:
                print(f"⚪ {file_name}: 데이터 없음")
                continue
            
            # 1. concept_id 중복 검사 (내부 + 교차)
            concept_ids = [row.get('concept_id', '') for row in rows if row.get('concept_id')]
            concept_id_duplicates = []
            cross_concept_id_duplicates = []
            seen_concept_ids = set()
            
            for concept_id in concept_ids:
                # 내부 중복 검사
                if concept_id in seen_concept_ids:
                    concept_id_duplicates.append(concept_id)
                else:
                    seen_concept_ids.add(concept_id)
                
                # 기존 _list.csv와 교차 중복 검사
                if concept_id in existing_concept_ids:
                    cross_concept_id_duplicates.append(concept_id)
            
            # 2. 단어+의미 조합 중복 검사 (concepts 파일만)
            word_meaning_duplicates = []
            cross_word_meaning_duplicates = []
            if "concepts_template" in file_name:
                word_meaning_combinations = []
                for row in rows:
                    concept_id = row.get('concept_id', '')
                    english_word = row.get('english_word', '')
                    korean_word = row.get('korean_word', '')
                    
                    if concept_id and english_word and korean_word:
                        # concept_id에서 의미 추출
                        parts = concept_id.split('_')
                        meaning = parts[-1] if len(parts) >= 3 else 'unknown'
                        
                        # 영어 단어+의미, 한국어 단어+의미 조합
                        en_combination = f"{english_word}_{meaning}"
                        ko_combination = f"{korean_word}_{meaning}"
                        word_meaning_combinations.append((en_combination, ko_combination, concept_id))
                        
                        # 기존 _list.csv와 교차 중복 검사
                        if en_combination in existing_word_meanings or ko_combination in existing_word_meanings:
                            cross_word_meaning_duplicates.append((concept_id, en_combination, ko_combination))
                
                # 중복 검사
                seen_combinations = set()
                for en_combo, ko_combo, concept_id in word_meaning_combinations:
                    if en_combo in seen_combinations or ko_combo in seen_combinations:
                        word_meaning_duplicates.append(f"{concept_id} ({en_combo})")
                    else:
                        seen_combinations.add(en_combo)
                        seen_combinations.add(ko_combo)
            
            # 결과 출력
            has_duplicates = concept_id_duplicates or word_meaning_duplicates or cross_concept_id_duplicates or cross_word_meaning_duplicates
            
            if has_duplicates:
                if concept_id_duplicates:
                    print(f"❌ {file_name}: 파일 내 concept_id 중복 {len(concept_id_duplicates)}개")
                    for dup in concept_id_duplicates[:3]:  # 최대 3개만 표시
                        print(f"   🔄 {dup}")
                
                if cross_concept_id_duplicates:
                    print(f"❌ {file_name}: 기존 데이터와 concept_id 중복 {len(cross_concept_id_duplicates)}개")
                    for dup in cross_concept_id_duplicates[:3]:  # 최대 3개만 표시
                        print(f"   ⚠️ {dup}")
                
                if word_meaning_duplicates:
                    print(f"❌ {file_name}: 파일 내 단어+의미 중복 {len(word_meaning_duplicates)}개")
                    for dup in word_meaning_duplicates[:3]:  # 최대 3개만 표시
                        print(f"   🔄 {dup}")
                
                if cross_word_meaning_duplicates:
                    print(f"❌ {file_name}: 기존 데이터와 단어+의미 중복 {len(cross_word_meaning_duplicates)}개")
                    for concept_id, en_combo, ko_combo in cross_word_meaning_duplicates[:3]:  # 최대 3개만 표시
                        print(f"   ⚠️ {concept_id} ({en_combo} or {ko_combo})")
                
                all_clean = False
            else:
                print(f"✅ {file_name}: 중복 없음 ({len(rows)}개 데이터)")
        
        except Exception as e:
            print(f"❌ {file_name}: 검증 실패 ({e})")
            all_clean = False
    
    print("\n📊 검증 결과:")
    if all_clean:
        print("✅ 모든 파일에서 중복 없음")
    else:
        print("❌ 중복 발견 - 수정 후 다시 실행하세요")
    
    return all_clean


def validate_field_completeness():
    """필드 완성도 검증"""
    print("\n🔍 필드 완성도 검증")
    print("="*50)
    
    files_to_check = [
        ("concepts_template_add.csv", 58),
        ("examples_template_add.csv", 16), 
        ("grammar_template_add.csv", 31),
        ("concepts_template_list.csv", 58),
        ("examples_template_list.csv", 16),
        ("grammar_template_list.csv", 31)
    ]
    
    for file_name, expected_fields in files_to_check:
        file_path = DATA_DIR / file_name
        if not file_path.exists():
            print(f"⚪ {file_name}: 파일 없음")
            continue
            
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames
                rows = list(reader)
            
            if not fieldnames:
                print(f"❌ {file_name}: 헤더 없음")
                continue
                
            # 필드 수 검증 (정확한 계산)
            actual_fields = len(fieldnames)
            print(f"🔍 {file_name}: {actual_fields}개 필드 (예상: {expected_fields}개)")
            
            if actual_fields != expected_fields:
                print(f"❌ {file_name}: 필드 수 불일치 ({actual_fields}/{expected_fields})")
                # 추가된 필드가 있다면 처음 몇 개 표시
                if actual_fields > expected_fields:
                    extra_count = actual_fields - expected_fields
                    print(f"   ⚠️ {extra_count}개 필드 추가됨")
            else:
                print(f"✅ {file_name}: 필드 수 정상 ({actual_fields}개)")
            
            # 빈 필드 검증
            if rows:
                empty_field_count = 0
                total_field_count = len(rows) * len(fieldnames)
                
                for row in rows:
                    for field_name, value in row.items():
                        if not value or value.strip() == "":
                            empty_field_count += 1
                
                completion_rate = ((total_field_count - empty_field_count) / total_field_count) * 100
                
                if completion_rate < 50:
                    print(f"❌ {file_name}: 완성도 {completion_rate:.1f}% (너무 낮음)")
                elif completion_rate < 80:
                    print(f"⚠️ {file_name}: 완성도 {completion_rate:.1f}% (개선 필요)")
                else:
                    print(f"✅ {file_name}: 완성도 {completion_rate:.1f}% (양호)")
                    
        except Exception as e:
            print(f"❌ {file_name}: 검증 실패 ({e})")

def validate_data_integrity():
    """데이터 무결성 검증"""
    print("\n🔐 데이터 무결성 검증")
    print("="*50)
    
    # concept_id 일관성 검증
    add_concepts = set()
    list_concepts = set()
    
    # _add.csv 파일들의 concept_id 수집
    for file_name in ["concepts_template_add.csv", "examples_template_add.csv", "grammar_template_add.csv"]:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row.get('concept_id'):
                            add_concepts.add(row['concept_id'])
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 실패: {e}")
    
    # _list.csv 파일들의 concept_id 수집
    for file_name in ["concepts_template_list.csv", "examples_template_list.csv", "grammar_template_list.csv"]:
        file_path = DATA_DIR / file_name
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row.get('concept_id'):
                            list_concepts.add(row['concept_id'])
            except Exception as e:
                print(f"⚠️ {file_name} 읽기 실패: {e}")
    
    # concept_id 일관성 검증
    if add_concepts:
        print(f"📊 _add.csv 파일들: {len(add_concepts)}개 concept_id")
        
        # 각 _add.csv 파일 간 concept_id 일치 확인
        files_concepts = {}
        for file_name in ["concepts_template_add.csv", "examples_template_add.csv", "grammar_template_add.csv"]:
            file_path = DATA_DIR / file_name
            if file_path.exists():
                try:
                    with open(file_path, "r", encoding="utf-8-sig") as f:
                        reader = csv.DictReader(f)
                        file_concepts = {row['concept_id'] for row in reader if row.get('concept_id')}
                        files_concepts[file_name] = file_concepts
                except:
                    continue
        
        # 일관성 검증
        if len(files_concepts) > 1:
            all_concepts = list(files_concepts.values())
            if all(concepts == all_concepts[0] for concepts in all_concepts):
                print("✅ _add.csv 파일들 간 concept_id 일치")
            else:
                print("❌ _add.csv 파일들 간 concept_id 불일치")
                for file_name, concepts in files_concepts.items():
                    print(f"   {file_name}: {concepts}")
    
    if list_concepts:
        print(f"📊 _list.csv 파일들: {len(list_concepts)}개 concept_id")

def validate_format():
    """포맷 검증"""
    print("\n📝 포맷 검증")
    print("="*50)
    
    files_to_check = [
        "concepts_template_add.csv",
        "examples_template_add.csv", 
        "grammar_template_add.csv",
        "concepts_template_list.csv",
        "examples_template_list.csv",
        "grammar_template_list.csv"
    ]
    
    for file_name in files_to_check:
        file_path = DATA_DIR / file_name
        if not file_path.exists():
            print(f"⚪ {file_name}: 파일 없음")
            continue
            
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            if not rows:
                print(f"⚪ {file_name}: 데이터 없음")
                continue
            
            # concept_id 포맷 검증
            invalid_concept_ids = []
            for row in rows:
                concept_id = row.get('concept_id', '')
                if concept_id:
                    # {domain}_{word}_{meaning} 형식 검증 (최소 3개 부분)
                    parts = concept_id.split('_')
                    if len(parts) < 3:
                        invalid_concept_ids.append(f"{concept_id} (부분 수: {len(parts)})")
                    else:
                        # 도메인 검증 (선택사항 - 알려진 도메인 목록과 비교)
                        known_domains = ["daily", "food", "travel", "health", "nature", "shopping", 
                                       "education", "technology", "business", "culture", "sports", "entertainment"]
                        domain = parts[0]
                        if domain not in known_domains:
                            invalid_concept_ids.append(f"{concept_id} (알 수 없는 도메인: {domain})")
            
            if invalid_concept_ids:
                print(f"❌ {file_name}: 잘못된 concept_id 형식 {len(invalid_concept_ids)}개")
                for invalid_id in invalid_concept_ids[:3]:  # 최대 3개만 표시
                    print(f"   ⚠️ {invalid_id}")
            else:
                print(f"✅ {file_name}: concept_id 형식 정상")
                
        except Exception as e:
            print(f"❌ {file_name}: 포맷 검증 실패 ({e})")

if __name__ == "__main__":
    ensure_directories()
    
    print("🔍 Complete Data Validation")
    print("="*50)
    
    # 1. 중복 검증
    validate_duplicates()
    
    # 2. 필드 완성도 검증  
    validate_field_completeness()
    
    # 3. 데이터 무결성 검증
    validate_data_integrity()
    
    # 4. 포맷 검증
    validate_format()
    
    print("\n🎉 검증 완료!")
    print("💡 문제가 발견된 경우 위의 메시지를 참고하여 수정하세요.")
