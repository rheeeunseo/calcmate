import { ad, esc, base, breadcrumb } from '../lib/html.mjs';

const home = ({ config, tools, articles }) => ({
  path: '/', priority: 1.0,
  title: `${config.siteName} - 연봉 실수령액·대출·적금·퇴직금 계산기`,
  description: '2026년 연봉 실수령액, 대출 이자, 알바 월급·주휴수당, 연차, 적금·예금 이자, 퇴직금, 부가세, 복리 계산기를 무료로 제공합니다. 광고 없이 빠르고 정확한 금융 계산.',
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.siteUrl + base + '/', inLanguage: 'ko' },
  content: `<h1>${config.siteName} 금융 계산기</h1><p class="lead">연봉, 대출, 적금, 퇴직금까지. 필요한 계산을 3초 안에.</p>
<div class="tool-grid">${tools.map((t) => `<a href="${base}/${t.slug}/"><div class="t">${esc(t.name)}</div><div class="d">${esc(t.short)}</div></a>`).join('')}</div>
${ad('top')}
<h2>인기 검색: 연봉별 실수령액</h2>
<div class="pill-list">${[2800, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 10000].map((a) => `<a href="${base}/salary/${a}/">연봉 ${a >= 10000 ? '1억' : a.toLocaleString() + '만'}</a>`).join('')}</div>
<h2>대출 금액별 월 상환액</h2>
<div class="pill-list">${[5000, 10000, 20000, 30000, 50000].map((a) => `<a href="${base}/loan/${a}/">${a >= 10000 ? a / 10000 + '억' : a.toLocaleString() + '만'}원 대출</a>`).join('')}</div>
${articles.length ? `<h2>금융 가이드</h2><div class="post-list">${articles.slice(0, 5).map((a) => `<a href="${base}/blog/${a.slug}/"><div class="t">${esc(a.title)}</div><div class="d">${esc(a.description)}</div></a>`).join('')}</div><p><a href="${base}/blog/">전체 글 보기 →</a></p>` : ''}`,
});

const about = ({ config }) => ({
  path: '/about/', priority: 0.3,
  title: '소개', description: `${config.siteName}는 누구나 무료로 쓸 수 있는 금융·생활 계산기 모음입니다.`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '소개' }])}<h1>${config.siteName} 소개</h1>
<p>${config.siteName}는 연봉 실수령액, 대출 이자, 적금·예금, 퇴직금 등 일상에서 자주 필요한 금융 계산을 회원가입 없이 바로 할 수 있도록 만든 서비스입니다.</p>
<h2>계산 기준</h2><ul><li>4대보험 요율과 소득세율은 국민연금공단, 국민건강보험공단, 국세청 공시 자료를 기준으로 매년 갱신합니다.</li><li>대출·예적금 계산은 금융감독원 및 은행연합회 공시 산식을 따릅니다.</li><li>퇴직금은 고용노동부 퇴직금 산정 방식을 적용합니다.</li></ul>
<h2>면책</h2><p>모든 결과는 참고용 예상치이며, 실제 금액은 개인 상황과 기관 정책에 따라 달라질 수 있습니다. 중요한 재무 결정 전에는 전문가와 상담하세요.</p>
<h2>수익 구조</h2><p>사이트 운영을 위해 Google AdSense 광고와 제휴 마케팅(쿠팡파트너스 등) 링크를 게재합니다. 제휴 링크를 통한 구매·가입 시 일정 수수료를 받을 수 있으나 이용자에게 추가 비용은 없습니다.</p>
<p>문의: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>`,
});

const privacy = ({ config }) => ({
  path: '/privacy/', priority: 0.2,
  title: '개인정보처리방침', description: `${config.siteName} 개인정보처리방침 및 쿠키 정책`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '개인정보처리방침' }])}<h1>개인정보처리방침</h1>
<p>${config.siteName}(이하 "사이트")는 이용자의 개인정보를 중요시하며 관련 법령을 준수합니다.</p>
<h2>1. 수집하는 정보</h2><p>사이트는 회원가입을 받지 않으며 계산기에 입력한 값은 이용자의 브라우저에서만 처리되고 서버로 전송되지 않습니다. 문의 메일을 보내는 경우 이메일 주소와 문의 내용이 수집됩니다.</p>
<h2>2. 쿠키 및 광고</h2><p>사이트는 Google AdSense 를 통해 광고를 게재합니다. Google 을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 사이트 방문 기록을 바탕으로 광고를 제공할 수 있습니다. 이용자는 <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">Google 광고 설정</a>에서 맞춤 광고를 해제할 수 있습니다.</p>
<h2>3. 분석 도구</h2><p>사이트는 방문 통계를 위해 Google Analytics 등 분석 도구를 사용할 수 있으며, 이 과정에서 IP 주소, 브라우저 정보, 방문 페이지 등이 익명으로 수집됩니다.</p>
<h2>4. 제휴 링크</h2><p>사이트의 일부 링크는 제휴 링크이며, 클릭 시 제휴사가 쿠키를 설정할 수 있습니다.</p>
<h2>5. 개인정보 보호책임자</h2><p>이메일: ${config.contactEmail}</p>
<p class="muted">시행일: 2026-09-01</p>`,
});

const contact = ({ config }) => ({
  path: '/contact/', priority: 0.2,
  title: '문의', description: `${config.siteName} 오류 제보, 제휴, 광고 문의`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '문의' }])}<h1>문의</h1>
<p>계산 오류 제보, 새 계산기 제안, 제휴·광고 문의는 아래 이메일로 보내주세요.</p>
<p><a class="btn" href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
<p class="muted">평일 기준 2~3일 내 답변드립니다.</p>`,
});

export const pages = [home, about, privacy, contact];
