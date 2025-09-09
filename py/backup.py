#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backup Data - 백업 생성
"""

import shutil
import datetime
from pathlib import Path

def create_backup():
    """현재 데이터를 백업 폴더에 저장"""
    print("🔒 백업 생성 중...")
    
    base_dir = Path(__file__).parent
    data_dir = base_dir / "data"
    backup_dir = base_dir / "backup"
    
    # 백업 디렉토리 생성
    backup_dir.mkdir(exist_ok=True)
    
    # 타임스탬프 생성
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_folder = backup_dir / f"backup_{timestamp}"
    backup_folder.mkdir(exist_ok=True)
    
    # CSV 파일들 백업
    csv_files = [
        "concepts_template_add.csv",
        "examples_template_add.csv", 
        "grammar_template_add.csv",
        "concepts_template_list.csv",
        "examples_template_list.csv",
        "grammar_template_list.csv"
    ]
    
    backed_up_count = 0
    for csv_file in csv_files:
        source = data_dir / csv_file
        if source.exists():
            destination = backup_folder / csv_file
            shutil.copy2(source, destination)
            backed_up_count += 1
            print(f"✅ {csv_file} 백업 완료")
    
    print(f"🎉 백업 완료! {backed_up_count}개 파일이 {backup_folder}에 저장되었습니다.")
    return backup_folder

if __name__ == "__main__":
    create_backup()
