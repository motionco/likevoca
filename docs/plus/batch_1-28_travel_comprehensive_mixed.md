# AI 데이터 생성 프롬프트 템플릿 - batch_1-28

## 기본 정보
- **배치 번호**: batch_1-28 (50개)
- **도메인**: travel
- **카테고리**: comprehensive
- **난이도**: 기초(basic) 70%, 중급(intermediate) 30%
- **목적**: 요청(request) 35%, 질문(question) 30%, 묘사(description) 25%, 지시(instruction) 10%
- **상황**: 정중하고 공공장소(polite,public) 40%, 정중하고 호텔(polite,hotel) 30%, 캐주얼하고 관광지(casual,tourist) 30%
- **품사 비율**: 명사(noun) 35%, 동사(verb) 30%, 의문사(interrogative) 20%, 기타(other) 15%

## AI 데이터 생성 프롬프트

```markdown
여행(travel) 도메인에서 directions(길찾기), booking(예약), luggage(짐), customs(세관), currency(환전), weather(날씨), maps(지도), guides(가이드), attractions(명소), souvenirs(기념품), emergency(응급), language(언어) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.
난이도는 기초(basic) 70%, 중급(intermediate) 30%로 구성해주세요.
목적은 요청(request) 35%, 질문(question) 30%, 묘사(description) 25%, 지시(instruction) 10%로 구성해주세요.
상황은 정중하고 공공장소(polite,public) 40%, 정중하고 호텔(polite,hotel) 30%, 캐주얼하고 관광지(casual,tourist) 30%로 구성해주세요.
품사는 명사(noun) 35%, 동사(verb) 30%, 의문사(interrogative) 20%, 기타(other) 15%로 구성해주세요.

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