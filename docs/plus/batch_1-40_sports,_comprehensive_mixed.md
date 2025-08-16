# AI 데이터 생성 프롬프트 템플릿 - batch_1-40

## 기본 정보
- **배치 번호**: batch_1-40 (50개)
- **도메인**: sports,
- **카테고리**: comprehensive
- **난이도**: 기초(basic) 70%, 중급(intermediate) 30%
- **목적**: 묘사(description) 30%, 의견표현(opinion) 25%, 감정표현(emotion) 20%, 제안(suggestion) 15%, 동의(agreement) 10%
- **상황**: 캐주얼하고 체육관(casual,gym) 30%, 캐주얼하고 사회적(casual,social) 30%, 정중하고 사회적(polite,social) 25%, 캐주얼하고 야외(casual,outdoor) 15%
- **품사 비율**: 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%

## AI 데이터 생성 프롬프트

```markdown
스포츠(sports) 도메인에서 football(축구), basketball(농구), swimming(수영), running(달리기), cycling(자전거), tennis(테니스), baseball(야구), fitness(피트니스), teams(팀), competitions(경기), athletes(선수), training(훈련), equipment(장비), rules(규칙), victories(승리) 카테고리와 기타(other) 도메인의 전체 25개 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 70%, 중급(intermediate) 30%로 구성해주세요.
목적은 묘사(description) 30%, 의견표현(opinion) 25%, 감정표현(emotion) 20%, 제안(suggestion) 15%, 동의(agreement) 10%로 구성해주세요.
상황은 캐주얼하고 체육관(casual,gym) 30%, 캐주얼하고 사회적(casual,social) 30%, 정중하고 사회적(polite,social) 25%, 캐주얼하고 야외(casual,outdoor) 15%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 25%, 형용사(adjective) 20%, 감탄사(interjection) 10%, 기타(other) 10%로 구성해주세요.

**참조 문서:**
- 통합_데이터_가이드.md의 모든 규칙과 표준을 준수해주세요

**데이터 구성:**
- concepts: 58개
- examples: 16개  
- grammar: 31개

**출력 형식:** UTF-8 without BOM 인코딩 CSV
```

---

_이 템플릿은 통합_데이터_가이드.md를 참조하여 체계적이고 전략적인 데이터 생성을 지원합니다._