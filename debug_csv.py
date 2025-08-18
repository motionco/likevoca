import csv

# CSV 파일 읽기
file_path = 'results/batch_1-1_concepts_template_add.csv'

# 헤더 확인
with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    print(f'헤더 컬럼 수: {len(header)}')
    
    # 문제가 있는 라인들 확인
    for i, row in enumerate(reader, start=2):
        if len(row) != len(header):
            print(f'라인 {i}: 헤더 수={len(header)}, 값 수={len(row)}, concept_id={row[0] if row else "빈 행"}')
            # 어느 부분에 문제가 있는지 찾기
            if len(row) > len(header):
                print(f'  초과된 값들: {row[len(header):]}')
                # 문제가 되는 전체 라인 출력
                print(f'  전체 라인: {",".join(row)}')
        if i > 65:  # 전체 파일 체크
            break
