#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Status Check - 데이터 현황 확인
"""

from template_manager import show_data_status, ensure_directories

if __name__ == "__main__":
    ensure_directories()
    show_data_status()
