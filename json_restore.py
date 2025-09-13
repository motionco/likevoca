#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSON Log Based Restore - JSON 로그 기반 복원
data_tracking_log.json의 backup_ref를 참조하여 자동 복원
"""

import json
import shutil
from pathlib import Path
import datetime

def restore_from_json_log(transaction_id=None):
    """JSON 로그 기반 복원"""
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    backup_dir = base_dir / "backup"
    log_path = data_dir / "data_tracking_log.json"
    
    if not log_path.exists():
        print("❌ data_tracking_log.json 파일이 없습니다.")
        return False
    
    try:
        # JSON 로그 읽기
        with open(log_path, "r", encoding="utf-8") as f:
            log_data = json.load(f)
        
        transactions = log_data.get("transactions", [])
        if not transactions:
            print("❌ 트랜잭션 기록이 없습니다.")
            return False
        
        # 특정 트랜잭션 ID 또는 최신 트랜잭션 선택
        if transaction_id:
            target_transaction = None
            for transaction in transactions:
                if transaction.get("transaction_id") == transaction_id:
                    target_transaction = transaction
                    break
            
            if not target_transaction:
                print(f"❌ 트랜잭션 ID '{transaction_id}'를 찾을 수 없습니다.")
                return False
        else:
            # 최신 트랜잭션 선택
            target_transaction = transactions[-1]
        
        # backup_ref 확인
        backup_ref = target_transaction.get("backup_ref")
        if not backup_ref:
            print("❌ 백업 참조가 없습니다.")
            return False
        
        # 백업 폴더 확인
        backup_folder = backup_dir / backup_ref
        if not backup_folder.exists():
            print(f"❌ 백업 폴더를 찾을 수 없습니다: {backup_folder}")
            return False
        
        print(f"🔄 JSON 로그 기반 복원 시작:")
        print(f"   📋 트랜잭션 ID: {target_transaction['transaction_id']}")
        print(f"   📅 백업 시점: {target_transaction['timestamp']}")
        print(f"   📂 백업 폴더: {backup_ref}")
        
        # CSV 파일들 복원
        csv_files = [
            "concepts_template_add.csv",
            "examples_template_add.csv", 
            "grammar_template_add.csv",
            "concepts_template_list.csv",
            "examples_template_list.csv",
            "grammar_template_list.csv"
        ]
        
        restored_count = 0
        for csv_file in csv_files:
            source = backup_folder / csv_file
            if source.exists():
                destination = data_dir / csv_file
                
                # 백업 파일 크기 확인
                source_size = source.stat().st_size
                
                # 바이너리 복사 (안전한 복사)
                with open(source, 'rb') as f:
                    content = f.read()
                
                with open(destination, 'wb') as f:
                    f.write(content)
                    f.flush()
                    import os
                    os.fsync(f.fileno())
                
                # 파일 시간 업데이트
                import time
                current_time = time.time()
                os.utime(destination, (current_time, current_time))
                
                # 복원 검증
                if destination.exists():
                    dest_size = destination.stat().st_size
                    if dest_size == source_size:
                        restored_count += 1
                        print(f"✅ {csv_file} 복원 완료")
                    else:
                        print(f"⚠️ {csv_file} 복원됨 (크기 불일치)")
                        restored_count += 1
                else:
                    print(f"❌ {csv_file} 복원 실패")
            else:
                print(f"⚠️ {csv_file} 백업에 없음")
        
        print(f"\n🎉 JSON 로그 기반 복원 완료!")
        print(f"📊 복원된 파일: {restored_count}개")
        print(f"💡 복원 위치: {data_dir}")
        
        # 트랜잭션 로그 동기화
        from py.restore import sync_transaction_log_with_current_data
        sync_transaction_log_with_current_data()
        
        return True
        
    except Exception as e:
        print(f"❌ JSON 로그 기반 복원 실패: {e}")
        return False

def list_available_transactions():
    """복원 가능한 트랜잭션 목록 표시"""
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    log_path = data_dir / "data_tracking_log.json"
    
    if not log_path.exists():
        print("❌ data_tracking_log.json 파일이 없습니다.")
        return
    
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            log_data = json.load(f)
        
        transactions = log_data.get("transactions", [])
        if not transactions:
            print("❌ 트랜잭션 기록이 없습니다.")
            return
        
        print("📋 복원 가능한 트랜잭션:")
        print("-" * 80)
        
        for i, transaction in enumerate(reversed(transactions), 1):
            tx_id = transaction.get("transaction_id", "")
            timestamp = transaction.get("timestamp", "")
            operation = transaction.get("operation", "")
            backup_ref = transaction.get("backup_ref", "")
            
            # 시간 포맷팅
            if timestamp:
                try:
                    dt = datetime.datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    formatted_time = dt.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    formatted_time = timestamp
            else:
                formatted_time = "N/A"
            
            print(f"   {i}. {tx_id}")
            print(f"      📅 시간: {formatted_time}")
            print(f"      🔄 작업: {operation}")
            print(f"      📂 백업: {backup_ref}")
            
            # 추가된 concept 정보
            added_concepts = transaction.get("added_concepts", [])
            if added_concepts:
                print(f"      📝 추가된 concept: {len(added_concepts)}개")
                for concept in added_concepts[:2]:  # 최대 2개만 표시
                    korean = concept.get("korean_word", "")
                    english = concept.get("english_word", "")
                    print(f"         - {korean} ({english})")
                if len(added_concepts) > 2:
                    print(f"         ... 외 {len(added_concepts)-2}개")
            print()
            
    except Exception as e:
        print(f"❌ 트랜잭션 목록 조회 실패: {e}")

def main():
    """메인 실행"""
    print("🔄 JSON Log Based Restore")
    print("=" * 50)
    
    # 사용 가능한 트랜잭션 목록 표시
    list_available_transactions()
    
    print("\n복원 옵션:")
    print("1. 최신 트랜잭션으로 복원")
    print("2. 특정 트랜잭션 ID로 복원")
    print("3. 종료")
    
    try:
        choice = input("\n선택하세요 (1-3): ").strip()
        
        if choice == "1":
            restore_from_json_log()
        elif choice == "2":
            tx_id = input("트랜잭션 ID를 입력하세요: ").strip()
            if tx_id:
                restore_from_json_log(tx_id)
            else:
                print("❌ 트랜잭션 ID가 입력되지 않았습니다.")
        elif choice == "3":
            print("👋 종료합니다.")
        else:
            print("❌ 잘못된 선택입니다.")
            
    except KeyboardInterrupt:
        print("\n👋 사용자가 취소했습니다.")

if __name__ == "__main__":
    main()
