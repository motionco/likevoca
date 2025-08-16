# AI 데이터 생성 프롬프트 템플릿 - batch_1-34

## 기본 정보
- **배치 번호**: batch_1-34 (50개)
- **도메인**: health (건강)
- **카테고리**: comprehensive (종합: exercise, nutrition, medicine, hospital, doctor, appointment, wellness, prevention, mental, recovery, checkup, emergency, surgery)
- **난이도**: basic 60% + intermediate 40% (혼합)
- **목적**: description 30%, question 25%, request 25%, instruction 20% (혼합)
- **상황**: polite,hospital 50%, casual,gym 25%, polite,home 25% (혼합)
- **품사 비율**: noun 35%, adjective 25%, verb 25%, interrogative 15%

## AI 데이터 생성 프롬프트

```markdown
건강(health) 도메인에서 exercise(운동), nutrition(영양), medicine(약), hospital(병원), doctor(의사), appointment(진료예약), wellness(웰빙), prevention(예방), mental(정신), recovery(회복), checkup(건강검진), emergency(응급), surgery(수술) 카테고리를 포함한 종합 데이터를 50개 생성해주세요.

**난이도 구성**: 기초(basic) 60% (30개), 중급(intermediate) 40% (20개)
**목적 구성**: 묘사(description) 30% (15개), 질문(question) 25% (12-13개), 요청(request) 25% (12-13개), 지시(instruction) 20% (10개)
**상황 구성**: 정중하고 병원(polite,hospital) 50% (25개), 캐주얼하고 체육관(casual,gym) 25% (12-13개), 정중하고 집(polite,home) 25% (12-13개)
**품사 구성**: 명사(noun) 35% (17-18개), 형용사(adjective) 25% (12-13개), 동사(verb) 25% (12-13개), 의문사(interrogative) 15% (7-8개)

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