import re
import os

# 데이터_생성_자연어.md 파일 읽기
with open(r'c:\practice\likevoca\docs\데이터_생성_자연어.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 배치 정보를 추출하는 정규식 패턴
batch_pattern = r'#### 1-(\d+)번 배치 \(50개\): (.+?)\n```\n(.*?)\n```'
batches = re.findall(batch_pattern, content, re.DOTALL)

print(f"추출된 배치 수: {len(batches)}")

# 각 배치 정보 파싱 및 파일 생성
for batch_num, title, description in batches:
    print(f"\n=== 배치 1-{batch_num}: {title} ===")
    
    # 제목에서 도메인, 카테고리, 난이도, 목적 추출
    title_parts = title.split()
    if '-' in title_parts[0]:
        domain_category = title_parts[0].split('-')
        domain = domain_category[0]
        category = domain_category[1] if len(domain_category) > 1 else "general"
    else:
        domain = title_parts[0]
        category = "comprehensive"
    
    # 난이도와 목적 추출
    difficulty = "basic"  # 기본값
    purpose = "general"   # 기본값
    
    if "기초" in title:
        difficulty = "basic"
    elif "중급" in title:
        difficulty = "intermediate"
    elif "고급" in title:
        difficulty = "advanced"
    elif "유창" in title:
        difficulty = "fluent"
    
    # 목적 추출
    if "인사" in title:
        purpose = "greeting"
    elif "질문" in title:
        purpose = "question"
    elif "요청" in title:
        purpose = "request"
    elif "감정표현" in title:
        purpose = "emotion"
    elif "제안" in title:
        purpose = "suggestion"
    elif "지시" in title:
        purpose = "instruction"
    elif "의견표현" in title:
        purpose = "opinion"
    elif "감사표현" in title:
        purpose = "gratitude"
    elif "동의" in title:
        purpose = "agreement"
    elif "묘사" in title:
        purpose = "description"
    elif "사과" in title:
        purpose = "apology"
    elif "거절" in title:
        purpose = "refusal"
    
    # 상황과 품사 정보는 description에서 추출
    situation = "casual,home"  # 기본값
    pos_ratio = "noun 40%, verb 30%, other 30%"  # 기본값
    
    # 상황 추출
    if "캐주얼하고 집" in description:
        situation = "casual,home"
    elif "정중하고 집" in description:
        situation = "polite,home"
    elif "캐주얼하고 사회" in description or "캐주얼하고 사교" in description:
        situation = "casual,social"
    elif "정중하고 사회" in description or "정중하고 사교" in description:
        situation = "polite,social"
    elif "캐주얼하고 상점" in description:
        situation = "casual,store"
    elif "정중하고 상점" in description:
        situation = "polite,store"
    elif "정중하고 직장" in description:
        situation = "polite,work"
    elif "정중하고 병원" in description:
        situation = "polite,hospital"
    elif "캐주얼하고 체육관" in description:
        situation = "casual,gym"
    
    # 품사 비율 추출
    pos_match = re.search(r'품사는 (.+?)로 구성해주세요', description)
    if pos_match:
        pos_ratio = pos_match.group(1)
    
    print(f"도메인: {domain}")
    print(f"카테고리: {category}")
    print(f"난이도: {difficulty}")
    print(f"목적: {purpose}")
    print(f"상황: {situation}")
    print(f"품사: {pos_ratio}")
    
    # 파일명 생성
    filename = f"batch_1-{batch_num}_{domain}_{category}_{difficulty}_{purpose}.md"
    filepath = os.path.join(r'c:\practice\likevoca\docs\plus', filename)
    
    # 파일 내용 생성
    file_content = f"""# AI 데이터 생성 프롬프트 템플릿 - batch_1-{batch_num}

## 기본 정보
- **배치 번호**: batch_1-{batch_num} (50개)
- **도메인**: {domain}
- **카테고리**: {category}
- **난이도**: {difficulty}
- **목적**: {purpose}
- **상황**: {situation}
- **품사 비율**: {pos_ratio}

## AI 데이터 생성 프롬프트

```markdown
{description.strip()}

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

**데이터 구성:**
- concepts: 58개
- examples: 16개  
- grammar: 31개

**출력 형식:** UTF-8 without BOM 인코딩 CSV
```

---

_이 템플릿은 통합_데이터_가이드.md를 참조하여 체계적이고 전략적인 데이터 생성을 지원합니다._"""

    # 파일 저장
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    print(f"생성됨: {filename}")

print(f"\n총 {len(batches)}개 배치 파일 생성 완료!")
