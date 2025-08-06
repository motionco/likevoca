#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Restore Data - 백업 복원
"""

import shutil
import datetime
import json
import csv
from pathlib import Path

def sync_transaction_log_with_current_data():
    """현재 CSV 데이터와 트랜잭션 로그 동기화"""
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    log_path = data_dir / "data_tracking_log.json"
    
    try:
        # 현재 concepts_template_list.csv에서 실제 데이터 읽기
        concepts_file = data_dir / "concepts_template_list.csv"
        if not concepts_file.exists():
            print("⚠️ concepts_template_list.csv 파일이 없습니다.")
            return
        
        current_concepts = []
        with open(concepts_file, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                current_concepts.append({
                    "concept_id": row.get('concept_id', ''),
                    "domain": row.get('domain', ''),
                    "category": row.get('category', ''),
                    "korean_word": row.get('korean_word', ''),
                    "english_word": row.get('english_word', '')
                })
        
        # 트랜잭션 로그 업데이트
        if log_path.exists():
            with open(log_path, "r", encoding="utf-8") as f:
                log_data = json.load(f)
        else:
            log_data = {"metadata": {}, "transactions": [], "current_status": {}}
        
        # 현재 상태 동기화
        timestamp = datetime.datetime.now().isoformat() + "Z"
        log_data["metadata"]["last_updated"] = timestamp
        log_data["current_status"] = {
            "total_transactions": len(log_data.get("transactions", [])),
            "total_concepts": len(current_concepts),
            "active_concept_ids": [c["concept_id"] for c in current_concepts],
            "domains_in_use": list(set(c["domain"] for c in current_concepts if c["domain"])),
            "categories_in_use": list(set(c["category"] for c in current_concepts if c["category"])),
            "last_sync": timestamp
        }
        
        # 통계 업데이트
        domain_stats = {}
        category_stats = {}
        for concept in current_concepts:
            domain = concept.get("domain", "")
            category = concept.get("category", "")
            if domain:
                domain_stats[domain] = domain_stats.get(domain, 0) + 1
            if category:
                category_stats[category] = category_stats.get(category, 0) + 1
        
        log_data["statistics"] = {
            "domains": domain_stats,
            "categories": category_stats,
            "total_concepts": len(current_concepts)
        }
        
        # 로그 파일 저장
        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        
        print(f"📊 트랜잭션 로그 동기화 완료 (현재 {len(current_concepts)}개 concept)")
        
    except Exception as e:
        print(f"⚠️ 트랜잭션 로그 동기화 실패: {e}")

def restore_backup():
    """백업 시점 선택하여 복원"""
    print("🔄 백업 복원")
    print("="*50)
    
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    backup_dir = base_dir / "backup"
    
    if not backup_dir.exists():
        print("❌ 백업 폴더가 없습니다!")
        return False
    
    # 모든 백업 폴더 찾기
    backup_folders = [d for d in backup_dir.iterdir() if d.is_dir() and d.name.startswith("backup_")]
    if not backup_folders:
        print("❌ 백업 파일이 없습니다!")
        return False
    
    # 백업 폴더들을 시간순으로 정렬
    backup_folders.sort(key=lambda x: x.name, reverse=True)
    
    print("📂 사용 가능한 백업:")
    for i, folder in enumerate(backup_folders, 1):
        # 폴더명에서 날짜/시간 추출
        timestamp = folder.name.replace("backup_", "")
        if len(timestamp) >= 15:  # YYYYMMDD_HHMMSS
            date_part = timestamp[:8]
            time_part = timestamp[9:15]
            formatted_date = f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:8]}"
            formatted_time = f"{time_part[:2]}:{time_part[2:4]}:{time_part[4:6]}"
            display_name = f"{formatted_date} {formatted_time}"
        else:
            display_name = timestamp
        
        print(f"   {i}. {display_name} ({folder.name})")
    
    # 사용자 선택
    try:
        choice = input("\n복원할 백업 번호를 선택하세요 (1-{}): ".format(len(backup_folders)))
        choice_num = int(choice)
        
        if 1 <= choice_num <= len(backup_folders):
            selected_backup = backup_folders[choice_num - 1]
            print(f"📂 선택된 백업: {selected_backup.name}")
        else:
            print("❌ 잘못된 번호입니다!")
            return False
            
    except (ValueError, KeyboardInterrupt):
        print("❌ 복원이 취소되었습니다!")
        return False
    # 복원 전 현재 데이터 임시 백업 제안
    print(f"\n⚠️ 복원하면 현재 데이터가 덮어써집니다!")
    confirm = input("계속하시겠습니까? (y/N): ").lower().strip()
    
    if confirm not in ['y', 'yes']:
        print("❌ 복원이 취소되었습니다!")
        return False
    
    # 현재 데이터 정리 및 복원
    csv_files = [
        "concepts_template_add.csv",
        "examples_template_add.csv", 
        "grammar_template_add.csv",
        "concepts_template_list.csv",
        "examples_template_list.csv",
        "grammar_template_list.csv"
    ]
    
    print(f"\n🗑️ 현재 데이터 정리 중...")
    # 먼저 현재 파일들 삭제
    for csv_file in csv_files:
        current_file = data_dir / csv_file
        if current_file.exists():
            current_file.unlink()
            print(f"🗑️ {csv_file} 삭제")
    
    print(f"\n🔄 {selected_backup.name}에서 복원 중...")
    restored_count = 0
    for csv_file in csv_files:
        source = selected_backup / csv_file
        if source.exists():
            destination = data_dir / csv_file
            
            # 복원 전 백업 파일 크기 확인
            source_size = source.stat().st_size
            
            # VS Code 파일 감지를 위한 개선된 복원 방식
            # 1. 파일 내용을 바이너리로 읽어서 정확히 복사
            with open(source, 'rb') as f:
                content = f.read()
            
            # 2. 새로운 파일로 작성 (VS Code가 확실히 감지)
            with open(destination, 'wb') as f:
                f.write(content)
                f.flush()  # 버퍼 강제 플러시
                import os
                os.fsync(f.fileno())  # 디스크에 강제 동기화
            
            # 3. 추가 파일 시스템 알림
            import time
            current_time = time.time()
            os.utime(destination, (current_time, current_time))
            
            # 복원 후 파일 검증
            if destination.exists():
                dest_size = destination.stat().st_size
                
                if dest_size == source_size:
                    restored_count += 1
                    print(f"✅ {csv_file} 복원 완료 (크기: {dest_size:,} bytes)")
                else:
                    print(f"⚠️ {csv_file} 복원됨 (크기 불일치 가능성)")
                    restored_count += 1
            else:
                print(f"❌ {csv_file} 복원 실패")
        else:
            print(f"⚠️ {csv_file} 백업에 없음")

    print(f"\n🎉 복원 완료! {restored_count}개 파일이 복원되었습니다.")
    
    # 트랜잭션 로그와 현재 데이터 동기화
    print("\n🔄 트랜잭션 로그 동기화 중...")
    sync_transaction_log_with_current_data()
    
    # 복원 후 파일 상태 요약
    print(f"\n📊 복원된 파일 상태:")
    for csv_file in csv_files:
        file_path = data_dir / csv_file
        if file_path.exists():
            size = file_path.stat().st_size
            mtime = datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
            print(f"   📄 {csv_file}: {size:,} bytes, 수정시간: {mtime.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print(f"   ❌ {csv_file}: 파일 없음")
    
    print("💡 VS Code에서 파일 변경이 자동으로 감지됩니다.")
    return True

if __name__ == "__main__":
    restore_backup()
