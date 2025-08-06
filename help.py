#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LikeVoca Template Management System
통합 언어 학습 데이터 관리 시스템
"""

def show_help():
    """도움말 표시"""
    print("=" * 60)
    print("🎯 LikeVoca Template Management System")
    print("=" * 60)
    print()
    print("📋 사용 가능한 명령어:")
    print()
    print("🔧 데이터 생성 및 관리:")
    print("   python generate.py     # 새로운 랜덤 템플릿 생성")
    print("   python accumulator.py  # 생성된 데이터를 누적 저장")
    print("   python validate.py     # 중복 데이터 검증")
    print("   python status.py       # 현재 데이터 현황 확인")
    print()
    print("💾 백업 및 복원:")
    print("   python backup.py       # 현재 데이터 백업")
    print("   python restore.py      # 백업에서 데이터 복원")
    print()
    print("🔄 권장 워크플로우:")
    print("   1️⃣ python generate.py     # 새 템플릿 생성")
    print("   2️⃣ python validate.py     # 중복 검증")  
    print("   3️⃣ python accumulator.py  # 데이터 누적")
    print("   4️⃣ python backup.py       # 백업 생성")
    print()
    print("📋 추가 도구:")
    print("   python restore.py      # 백업에서 복원")
    print("   python help.py         # 이 도움말 표시")
    print()
    print("📊 데이터 구조:")
    print("   • _add.csv : 새로 생성된 임시 데이터 (기존 구조 유지)")
    print("   • _list.csv: 누적된 전체 데이터")
    print("   • concepts : 현재 파일 구조에 맞게 생성")
    print("   • examples : 16개 필드 예문 구조")
    print("   • grammar  : 7개 필드 문법 구조")
    print()
    print("🌍 지원 언어: 한국어, 영어, 일본어, 중국어, 스페인어")
    print("🎲 생성 도메인: 음식, 일상, 여행, 교육, 기술, 자연, 건강, 쇼핑, 업무, 취미")
    print()
    print("⚠️  중복 방지: concept_id와 5개 언어 단어 모두 검증")
    print("� 다의어 처리: 같은 단어도 다른 도메인에서는 허용 (현재는 완전 차단)")
    print("�🔒 안전성: 복원 시 자동 임시 백업 생성")
    print()
    print("� 검증 단계별 차이:")
    print("   1단계 (생성): _add.csv + _list.csv 모든 기존 데이터 검사")
    print("   3단계 (검증): 각 파일 내 중복만 검사 (파일 간 일관성 확인)")
    print()
    print("�💡 문제 해결:")
    print("   • 중복 발견 시: 수동 제거 또는 새로 생성")
    print("   • 생성 실패 시: 시도 횟수 확인 (최대 50회)")
    print("   • 복원 실패 시: temp_backup 폴더 확인")
    print("   • 쉼표 문제: 빈 필드로 인한 정상적인 CSV 형식")
    print("   • 구조 불일치: 기존 파일 구조를 자동 감지하여 맞춤")

def main():
    show_help()

if __name__ == "__main__":
    main()
