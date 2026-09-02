# CalcMate — 금융·생활 계산기 사이트

연봉 실수령액, 대출, 적금·예금, 퇴직금, 부가세, 복리 계산기를 제공하는 **정적 사이트**입니다.
검색 유입(프로그래매틱 SEO) → 애드센스·제휴 링크로 수익화하는 자동화 수익 모델을 목표로 합니다.

## 왜 이 모델인가

| 항목 | 내용 |
|---|---|
| 고정비 | 호스팅 0원(GitHub Pages) + 도메인 연 1~2만원 + 글 생성 API 월 1~3천원 |
| 수익원 | ① Google AdSense (금융 카테고리 = 최상위 광고 단가) ② 쿠팡파트너스·금융 제휴 CPA |
| 트래픽 | "연봉 3500만원 실수령액" 류 롱테일 검색어 페이지 100개+ 자동 생성 |
| 자동화 | 주 2회 Claude API 가 글 작성 → 커밋 → 자동 배포. 요율 갱신만 연 1~2회 수동 |
| 손익분기 | 월 방문 1~2천 명 수준이면 비용 회수. 수익은 보장되지 않지만 손실 상한이 사실상 도메인비 |

## 구조

```
build.mjs               정적 사이트 빌더 (의존성 0)
src/config.mjs          도메인, 애드센스 ID, 제휴 ID 등 설정  ← 배포 전 TODO 확인
src/layout.html         공통 레이아웃
src/lib/                계산 엔진 (브라우저·Node 공용) — salary, loan, savings
src/tools/*.mjs         계산기 페이지 생성기 (SEO 본문 + 프로그래매틱 하위 페이지)
src/client/*.js         브라우저 계산 스크립트
src/pages/              홈, 소개, 개인정보처리방침, 문의, 블로그
content/topics.json     자동 발행 주제 큐
content/articles/*.json 발행된 글
scripts/generate-article.mjs  Claude API 글 생성
.github/workflows/      deploy.yml (배포), content.yml (주 2회 자동 글)
```

## 로컬 실행

```bash
node build.mjs          # dist/ 생성 (약 130 페이지)
node scripts/serve.mjs  # http://localhost:8080
```

## 배포 (GitHub Pages, 무료)

1. GitHub 에 저장소 생성 후 push (`main` 브랜치)
2. 저장소 **Settings → Pages → Source: GitHub Actions**
3. **Settings → Secrets and variables → Actions**
   - Variables: `SITE_URL` (예 `https://<id>.github.io`, 커스텀 도메인이면 `https://도메인`), `BASE_PATH` (`/calcmate`, 커스텀 도메인이면 비움)
   - Secrets: `ANTHROPIC_API_KEY` (자동 글 생성용)
4. push 하면 자동 빌드·배포. 커스텀 도메인은 루트에 `CNAME` 파일 추가 + DNS 설정

## 출시 체크리스트 (수익화)

- [ ] 도메인 구입 (`.kr` 또는 `.com`, 가비아/호스팅케이알/Cloudflare) → `CNAME`, `SITE_URL` 설정
- [ ] `src/config.mjs` 의 TODO 항목 채우기
- [ ] Google Search Console 등록 → sitemap.xml 제출
- [ ] 네이버 서치어드바이저 등록 → sitemap 제출 (한국어 트래픽의 절반 이상은 네이버)
- [ ] 글 10개 이상 발행 후 **Google AdSense 신청** (승인까지 2주~1개월, 개인정보처리방침·소개·문의 페이지 필수 → 이미 포함)
- [ ] 쿠팡파트너스 가입 → `COUPANG_PARTNER_ID` 설정, 각 tools 파일의 `affiliate()` url 을 실제 링크로 교체
- [ ] 승인 후 애드센스 자동광고 ON 또는 `adsenseSlots` 에 슬롯 ID 입력
- [ ] Google Analytics 또는 Cloudflare Web Analytics 추가 (layout.html)

## 운영

- **요율 갱신**: 매년 1월(건강보험·고용보험·세율), 7월(국민연금 상한) `src/lib/salary.mjs` 의 `RATES_2026` 수정
- **주제 추가**: `content/topics.json` 에 `{ slug, title, relatedTools, status: "pending" }` 추가. 네이버 키워드 도구·구글 서제스트에서 롱테일 키워드 발굴
- **수동 글 생성**: `ANTHROPIC_API_KEY=... node scripts/generate-article.mjs --count 3`
- **새 계산기 추가**: `src/lib` 에 엔진, `src/tools/<slug>.mjs` 에 페이지, `src/client/<slug>.js` 에 스크립트, `src/tools/index.mjs` 에 등록

## 확장 로드맵

1. 계산기 추가: 연차수당, 실업급여, 주휴수당, 양도소득세, 취득세, 전월세 전환율, 자동차 취등록세
2. 대출 프로그래매틱 확장: 금리별·기간별 페이지 (`/loan/30000/4.5/30/` 등)
3. 영어판(`/en/`) 으로 글로벌 애드센스 단가 확보
4. 금융 제휴 CPA (대출 비교, 카드 발급) 로 페이지당 수익 극대화

## 면책

계산 결과는 참고용이며 실제 금액과 다를 수 있습니다. 요율과 세법은 매년 바뀌므로 정기 갱신이 필요합니다.
