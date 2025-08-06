#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Accumulator - 데이터 누적기
_add.csv 파일의 데이터를 _list.csv 파일에 누적합니다.
"""

import csv
from pathlib import Path

# 기본 설정
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

def accumulate_data():
    """_add.csv 파일들의 데이터를 _list.csv 파일들에 누적"""
    file_pairs = [
        ("concepts_template_add.csv", "concepts_template_list.csv"),
        ("examples_template_add.csv", "examples_template_list.csv"), 
        ("grammar_template_add.csv", "grammar_template_list.csv")
    ]
    
    print("📁 데이터 누적 시작...")
    
    for add_file, list_file in file_pairs:
        add_path = DATA_DIR / add_file
        list_path = DATA_DIR / list_file
        
        if not add_path.exists():
            print(f"⚠️ {add_file} 파일이 존재하지 않습니다.")
            continue
        
        try:
            # _add.csv 파일 읽기
            with open(add_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                new_data = list(reader)
            
            if not new_data:
                print(f"⚠️ {add_file}에 데이터가 없습니다.")
                continue
            
            # 기존 _list.csv 파일 읽기 (있다면)
            existing_data = []
            existing_concept_ids = set()
            
            if list_path.exists() and list_path.stat().st_size > 0:
                with open(list_path, "r", encoding="utf-8-sig") as f:
                    reader = csv.DictReader(f)
                    existing_data = list(reader)
                    existing_concept_ids = {row.get('concept_id', '') for row in existing_data}
            
            # 중복 제거하면서 새 데이터 추가
            added_count = 0
            for row in new_data:
                concept_id = row.get('concept_id', '')
                if concept_id and concept_id not in existing_concept_ids:
                    existing_data.append(row)
                    existing_concept_ids.add(concept_id)
                    added_count += 1
            
            # _list.csv 파일에 전체 데이터 저장
            if existing_data:
                with open(list_path, "w", encoding="utf-8-sig", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=new_data[0].keys())
                    writer.writeheader()
                    writer.writerows(existing_data)
                
                print(f"✅ {list_file}: {added_count}개 추가, 총 {len(existing_data)}개")
            else:
                print(f"⚠️ {list_file}: 저장할 데이터가 없습니다.")
                
        except Exception as e:
            print(f"❌ {add_file} 처리 실패: {e}")
    
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
    print(f"   1️⃣ 데이터 검증: python validate.py")
    print(f"   2️⃣ 새 템플릿 생성: python template_generator.py")

if __name__ == "__main__":
    main()
