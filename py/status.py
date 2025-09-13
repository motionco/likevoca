#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Status Check - 데이터 현황 확인
현재 4단계 워크플로우: generate.py → validate.py → accumulator.py → backup.py/restore.py
"""

import json
import csv
from pathlib import Path
import datetime

def show_data_status():
    """현재 데이터 상태 확인"""
    print("=" * 60)
    print("📊 LikeVoca 데이터 현황")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    backup_dir = base_dir / "backup"
    
    # 1. CSV 파일 현황
    print("\n📄 CSV 파일 현황:")
    csv_files = [
        "concepts_template_add.csv",
        "examples_template_add.csv", 
        "grammar_template_add.csv",
        "concepts_template_list.csv",
        "examples_template_list.csv",
        "grammar_template_list.csv"
    ]
    
    for csv_file in csv_files:
        filepath = data_dir / csv_file
        if filepath.exists():
            try:
                with open(filepath, "r", encoding="utf-8-sig") as f:
                    reader = csv.reader(f)
                    rows = list(reader)
                    count = len(rows) - 1 if rows else 0  # 헤더 제외
                    size = filepath.stat().st_size
                    print(f"   ✅ {csv_file}: {count}개 레코드 ({size:,} bytes)")
            except Exception as e:
                print(f"   ❌ {csv_file}: 읽기 실패 - {e}")
        else:
            print(f"   ⚪ {csv_file}: 파일 없음")
    
    # 2. 트랜잭션 로그 현황
    print("\n📋 트랜잭션 로그 현황:")
    log_path = data_dir / "data_tracking_log.json"
    if log_path.exists():
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                log_data = json.load(f)
            
            metadata = log_data.get("metadata", {})
            current_status = log_data.get("current_status", {})
            transactions = log_data.get("transactions", [])
            
            print(f"   📅 마지막 업데이트: {metadata.get('last_updated', 'N/A')}")
            print(f"   🔢 총 트랜잭션: {len(transactions)}개")
            print(f"   📝 총 concept: {current_status.get('total_concepts', 0)}개")
            print(f"   🏷️ 활성 도메인: {len(current_status.get('domains_in_use', []))}개")
            print(f"   📂 활성 카테고리: {len(current_status.get('categories_in_use', []))}개")
            
        except Exception as e:
            print(f"   ❌ 로그 읽기 실패: {e}")
    else:
        print("   ⚪ data_tracking_log.json: 파일 없음")
    
    # 3. 백업 현황
    print("\n💾 백업 현황:")
    if backup_dir.exists():
        backup_folders = [d for d in backup_dir.iterdir() if d.is_dir() and d.name.startswith("backup_")]
        if backup_folders:
            backup_folders.sort(key=lambda x: x.name, reverse=True)
            print(f"   📦 총 백업: {len(backup_folders)}개")
            print("   📋 최근 백업:")
            for i, folder in enumerate(backup_folders[:3], 1):  # 최근 3개만 표시
                timestamp = folder.name.replace("backup_", "")
                if len(timestamp) >= 15:
                    date_part = timestamp[:8]
                    time_part = timestamp[9:15]
                    formatted = f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:8]} {time_part[:2]}:{time_part[2:4]}:{time_part[4:6]}"
                else:
                    formatted = timestamp
                print(f"      {i}. {formatted}")
        else:
            print("   ⚪ 백업 폴더 없음")
    else:
        print("   ⚪ backup/ 디렉토리 없음")
    
    # 4. 워크플로우 상태
    print("\n🔄 워크플로우 상태:")
    add_files = ["concepts_template_add.csv", "examples_template_add.csv", "grammar_template_add.csv"]
    list_files = ["concepts_template_list.csv", "examples_template_list.csv", "grammar_template_list.csv"]
    
    add_exists = all((data_dir / f).exists() for f in add_files)
    list_exists = all((data_dir / f).exists() for f in list_files)
    
    if add_exists and not list_exists:
        print("   🔄 상태: 데이터 생성 완료, 누적 대기 중")
        print("   💡 다음 단계: python accumulator.py")
    elif add_exists and list_exists:
        print("   ✅ 상태: 데이터 누적 완료")
        print("   💡 다음 단계: python backup.py (백업) 또는 새 데이터 생성")
    elif list_exists:
        print("   📊 상태: 누적 데이터만 존재")
        print("   💡 다음 단계: python generate.py (새 데이터 생성)")
    else:
        print("   🎯 상태: 시작 준비")
        print("   💡 다음 단계: python generate.py (데이터 생성)")
    
    print("\n" + "=" * 60)

def ensure_directories():
    """필요한 디렉토리 생성"""
    base_dir = Path(__file__).parent
    directories = [
        base_dir / "data",
        base_dir / "backup",
        base_dir / "samples"
    ]
    
    for directory in directories:
        directory.mkdir(exist_ok=True)

if __name__ == "__main__":
    ensure_directories()
    show_data_status()
