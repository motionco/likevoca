import re
import os

def extract_batch_info(file_path):
    """corrected_data_generation_guide.md에서 배치 정보를 추출"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 배치 제목 패턴 매칭
    batch_pattern = r'### (\d+-\d+)번 배치 \(50개\): (.+?) 테마 (.+?)\n\n```\n(.+?)```'
    
    batches = []
    matches = re.findall(batch_pattern, content, re.DOTALL)
    
    for match in matches:
        batch_num = match[0]
        theme = match[1]
        stage_name = match[2]
        content_block = match[3]
        
        # 도메인 추출
        domain_match = re.search(r'(.+?)\((.+?)\) 도메인의', content_block)
        domain = domain_match.group(1) if domain_match else "unknown"
        
        batches.append({
            'batch_num': batch_num,
            'theme': theme,
            'stage_name': stage_name,
            'domain': domain,
            'content': content_block
        })
    
    return batches

def create_batch_md(batch_info, output_dir):
    """개별 배치 md 파일 생성"""
    batch_num = batch_info['batch_num']
    theme = batch_info['theme']
    stage_name = batch_info['stage_name']
    domain = batch_info['domain']
    content = batch_info['content']
    
    # 단계 번호 추출
    stage_num = batch_num.split('-')[0]
    stage_names = {
        '1': '1단계 (기초 구축)',
        '2': '2단계 (실용 확장)', 
        '3': '3단계 (심화 학습)',
        '4': '4단계 (전문 완성)'
    }
    
    # 도메인에서 괄호 제거
    domain = domain.strip()
    
    # concept_id 형식 결정
    concept_id_format = f"{domain}_{{word}}_{{meaning}}"
    
    # 템플릿 생성
    template = f"""# 배치 {batch_num}: {theme} 테마 {stage_name}

## 📋 배치 정보
- **배치 번호**: {batch_num}
- **단계**: {stage_names.get(stage_num, f"{stage_num}단계")}
- **도메인**: {domain}
- **테마**: {theme.replace('-', '+')}
- **데이터 수**: 50개 (concepts: 50개, examples: 50개, grammar: 50개)

## 🎯 생성 지침

### 1. Concepts 컬렉션 (50개)
{content}
```

### 2. Examples 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 실제 상황에서 사용하는 실용적이고 자연스러운 예문 50개를 생성해주세요.

**핵심 원칙:**
- Concepts의 representative_example과 **다른 예문** 사용
- 실제 일상 상황에서 사용하는 자연스러운 표현
- 완전한 문장 구조 (주어+동사 포함)

### 3. Grammar 컬렉션 (50개)
위의 Concepts와 **동일한 concept_id**를 사용하여 문법 패턴을 설명하는 교육적 목적의 데이터 50개를 생성해주세요.

**핵심 원칙:**
- Concepts, Examples와 **다른 예문** 사용
- 문법 패턴을 명확히 보여주는 교육적 예문
- 각 언어별 문법 구조와 설명 포함

## 📝 참고사항

### concept_id 형식
```
{concept_id_format}
```

### 중복 방지
- 동일한 concept_id를 가진 세 컬렉션의 예문은 반드시 서로 달라야 함
- Concepts: 기본 의미를 보여주는 간단한 예문
- Examples: 실제 상황에서 사용하는 실용적 예문  
- Grammar: 문법 패턴을 설명하는 교육적 예문

### 데이터 품질 기준
- 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어) 모두 작성
- 완전한 문장 구조 사용
- 테마에 맞는 자연스러운 표현
- 통합_데이터_가이드.md의 모든 규칙 준수

---

**이 배치 완료 후 다음 단계로 {batch_num.split('-')[0]}-{int(batch_num.split('-')[1])+1}번 배치를 진행하세요.**"""

    # 파일 저장
    filename = f"batch_{batch_num.replace('-', '-')}.md"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template)
    
    return filepath

# 실행
if __name__ == "__main__":
    input_file = r"c:\practice\likevoca\docs\corrected_data_generation_guide.md"
    output_dir = r"c:\practice\likevoca\docs\batch"
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # 배치 정보 추출
    batches = extract_batch_info(input_file)
    
    print(f"총 {len(batches)}개 배치 발견")
    
    # 배치 파일 생성
    created_files = []
    for batch in batches:
        try:
            filepath = create_batch_md(batch, output_dir)
            created_files.append(filepath)
            print(f"생성됨: {os.path.basename(filepath)}")
        except Exception as e:
            print(f"오류 발생 (배치 {batch['batch_num']}): {e}")
    
    print(f"\n총 {len(created_files)}개 파일 생성 완료!")
    print(f"저장 위치: {output_dir}")
