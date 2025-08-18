import csv

# CSV 파일 읽기 및 수정
input_file = 'results/batch_1-1_concepts_template_add.csv'
output_file = 'results/batch_1-1_concepts_template_add_fixed.csv'

# 수정된 CSV 파일 생성
with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', encoding='utf-8', newline='') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    header = next(reader)
    writer.writerow(header)
    print(f'헤더 컬럼 수: {len(header)}')
    
    fixed_count = 0
    total_count = 0
    
    for i, row in enumerate(reader, start=2):
        total_count += 1
        
        if len(row) != len(header):
            print(f'라인 {i} 수정 중: {row[0]}')
            fixed_count += 1
            
            # 59개 컬럼을 58개로 수정 (마지막 두 컬럼을 합치기)
            if len(row) == 59:
                # 마지막 두 컬럼을 합쳐서 하나로 만들기
                row[-2] = row[-2] + ',' + row[-1]
                row = row[:-1]
                
        writer.writerow(row)
    
    print(f'총 {total_count}개 라인 처리, {fixed_count}개 라인 수정됨')
    print(f'수정된 파일: {output_file}')
