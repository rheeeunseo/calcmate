import { ad, esc, base, breadcrumb } from '../lib/html.mjs';
import { groups } from '../tools/index.mjs';

const home = ({ config, tools, articles }) => ({
  path: '/', priority: 1.0,
  title: `${config.siteName} - 연봉 실수령액·대출·적금·퇴직금 계산기`,
  description: '2026년 연봉 실수령액, 대출 이자, 취득세·양도세·중개수수료, 알바 월급, 연차, 적금·예금, 퇴직금, 부가세 계산기를 무료로 제공합니다. 회원가입 없이 바로 쓰는 금융 계산기.',
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.siteUrl + base + '/', inLanguage: 'ko' },
  content: `<h1>${config.siteName} 금융 계산기</h1><p class="lead">연봉, 대출, 적금, 퇴직금까지. 필요한 계산을 3초 안에.</p>
${groups.map((g) => `<h2>${g.title}</h2><div class="tool-grid">${g.slugs.map((s) => tools.find((t) => t.slug === s)).filter(Boolean).map((t) => `<a href="${base}/${t.slug}/"><div class="t">${esc(t.name)}</div><div class="d">${esc(t.short)}</div></a>`).join('')}</div>`).join('')}
${ad('top')}
<h2>인기 검색: 연봉별 실수령액</h2>
<div class="pill-list">${[2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 10000].map((a) => `<a href="${base}/salary/${a}/">연봉 ${a >= 10000 ? '1억' : a.toLocaleString() + '만'}</a>`).join('')}</div>
<h2>매매가별 내 집 마련 비용</h2>
<div class="pill-list">${[30000, 50000, 70000, 100000, 150000].map((a) => `<a href="${base}/home-cost/${a}/">${a / 10000}억 아파트 총비용</a>`).join('')}</div>
<h2>매매가별 취득세·중개수수료</h2>
<div class="pill-list">${[30000, 50000, 70000, 100000, 150000].map((a) => `<a href="${base}/acquisition-tax/${a}/">${a / 10000}억 취득세</a>`).join('')}${[30000, 50000, 100000].map((a) => `<a href="${base}/brokerage/${a}/">${a / 10000}억 중개수수료</a>`).join('')}</div>
<h2>대출 금액별 월 상환액</h2>
<div class="pill-list">${[5000, 10000, 20000, 30000, 50000].map((a) => `<a href="${base}/loan/${a}/">${a >= 10000 ? a / 10000 + '억' : a.toLocaleString() + '만'}원 대출</a>`).join('')}</div>
${articles.length ? `<h2>금융 가이드</h2><div class="post-list">${articles.slice(0, 5).map((a) => `<a href="${base}/blog/${a.slug}/"><div class="t">${esc(a.title)}</div><div class="d">${esc(a.description)}</div></a>`).join('')}</div><p><a href="${base}/blog/">전체 글 보기 →</a></p>` : ''}`,
});

const about = ({ config, tools, articles }) => ({
  path: '/about/', priority: 0.3,
  title: '소개', description: `${config.siteName}는 연봉·대출·부동산·저축 계산을 회원가입 없이 할 수 있는 계산기 사이트입니다. 계산 기준과 자료 출처, 글 작성 원칙을 안내합니다.`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '소개' }])}<h1>${config.siteName} 소개</h1>
<p>${config.siteName}는 연봉 실수령액, 대출 이자, 취득세, 퇴직금처럼 살면서 한 번씩 꼭 계산해야 하는 금액을 회원가입 없이 바로 확인할 수 있도록 만든 계산기 사이트입니다. 개인이 운영하며, 현재 계산기 ${tools.length}개와 계산 예시를 담은 가이드 글 ${articles.length}편을 제공합니다.</p>
<h2>만든 이유</h2>
<p>급여명세서의 공제액이 맞는지, 대출을 받으면 매달 얼마가 나가는지, 집을 살 때 세금과 수수료가 얼마나 붙는지는 공식만 알면 계산할 수 있지만, 요율과 구간이 해마다 바뀌어 직접 계산하기가 번거롭습니다. ${config.siteName}는 그 계산을 대신하고, 결과가 어떤 과정으로 나왔는지 공제 내역과 표로 함께 보여 주는 것을 목표로 합니다.</p>
<h2>계산 기준과 자료 출처</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>분야</th><th>기준 자료</th></tr></thead><tbody>
<tr><td>4대보험료</td><td>국민연금공단, 국민건강보험공단, 근로복지공단이 고시한 해당 연도 요율</td></tr>
<tr><td>근로소득세</td><td>소득세법의 세율·공제 규정과 국세청 근로소득 간이세액표</td></tr>
<tr><td>최저임금·주휴수당·연차·퇴직금</td><td>고용노동부 고시, 근로기준법, 근로자퇴직급여 보장법</td></tr>
<tr><td>취득세·양도소득세</td><td>지방세법, 소득세법, 지방세특례제한법</td></tr>
<tr><td>중개수수료</td><td>공인중개사법 시행규칙의 상한 요율</td></tr>
<tr><td>대출·예적금</td><td>원리금균등·원금균등 상환 산식, 이자소득세 15.4%</td></tr>
</tbody></table></div>
<p>요율과 세율은 매년 초 새 기준이 고시되면 갱신하고, 연중에 법이 바뀌면 그때 반영합니다. 각 계산기 화면에 적용 연도를 표시합니다.</p>
<h2>가이드 글 작성 원칙</h2>
<ul>
<li>글에 나오는 금액은 계산기와 같은 계산 엔진으로 직접 계산한 값입니다.</li>
<li>법 조항, 상한액, 신청 기한 같은 제도 내용은 정부·공공기관 자료와 대조해서 싣고, 기준일을 적습니다.</li>
<li>예금 금리처럼 시점마다 달라지는 값은 "예시"라고 밝힙니다.</li>
<li>특정 금융상품을 추천하거나 투자를 권유하지 않습니다.</li>
<li>오류 제보를 받으면 확인 후 수정합니다.</li>
</ul>
<h2>개인정보</h2>
<p>계산기에 입력한 값은 이용자의 브라우저 안에서만 계산되며 서버로 전송되거나 저장되지 않습니다. 자세한 내용은 <a href="${base}/privacy/">개인정보처리방침</a>에 있습니다.</p>
<h2>면책</h2><p>모든 결과는 참고용 예상치이며, 실제 금액은 개인 상황과 기관 정책에 따라 달라질 수 있습니다. 세금 신고, 대출 계약 같은 중요한 결정 전에는 해당 기관이나 전문가에게 확인하세요. 이용 조건은 <a href="${base}/terms/">이용약관</a>을 참고하세요.</p>
<h2>수익 구조</h2><p>사이트 운영비는 광고(Google AdSense)와 제휴 링크로 충당합니다. 제휴 링크를 통한 구매·가입 시 일정 수수료를 받을 수 있으나 이용자에게 추가 비용은 없으며, 광고나 제휴 여부가 계산 결과와 글 내용에 영향을 주지 않습니다.</p>
<p>문의: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a> · <a href="${base}/contact/">문의 안내</a></p>`,
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
  title: '문의', description: `${config.siteName} 계산 오류 제보, 새 계산기 제안, 제휴·광고 문의 방법을 안내합니다.`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '문의' }])}<h1>문의</h1>
<p>계산 오류 제보, 새 계산기 제안, 제휴·광고 문의는 아래 이메일로 보내주세요.</p>
<p><a class="btn" href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
<p class="muted">평일 기준 2~3일 내 답변드립니다.</p>
<h2>계산 오류를 제보할 때</h2>
<p>아래 내용을 함께 적어 주시면 빨리 확인할 수 있습니다.</p>
<ul>
<li>어느 계산기 또는 글인지 (주소)</li>
<li>입력한 값 (예: 연봉 4,200만원, 부양가족 2명)</li>
<li>사이트에 나온 결과와 실제 금액 또는 예상한 금액</li>
<li>근거가 되는 자료가 있으면 그 내용 (급여명세서 항목, 고지서, 법령 등)</li>
</ul>
<p>확인 후 계산식이나 글 내용이 틀렸다면 수정합니다.</p>
<h2>자주 묻는 질문</h2>
<h3>계산 결과가 실제 급여명세서와 다릅니다.</h3>
<p>회사마다 비과세 항목(식대, 차량유지비 등)과 부양가족 수, 원천징수 비율(80%·100%·120%)이 달라 몇천 원에서 몇만 원까지 차이가 날 수 있습니다. 계산기에서 비과세액과 부양가족 수를 실제와 맞춰 보세요.</p>
<h3>입력한 금액이 저장되나요?</h3>
<p>아니요. 계산은 브라우저 안에서만 이루어지고 서버로 전송되지 않습니다.</p>
<h3>개별 세무·대출 상담도 해 주나요?</h3>
<p>개인 사정에 맞춘 세무·법률·대출 상담은 하지 않습니다. 세금은 국세청(126)이나 세무사, 노동 문제는 고용노동부(1350), 대출은 해당 금융회사에 문의하세요.</p>`,
});

const terms = ({ config }) => ({
  path: '/terms/', priority: 0.2,
  title: '이용약관', description: `${config.siteName} 이용약관 - 서비스 내용, 계산 결과의 성격, 책임의 한계, 저작권 안내`,
  content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '이용약관' }])}<h1>이용약관</h1>
<h2>1. 서비스 내용</h2><p>${config.siteName}(이하 "사이트")는 급여, 세금, 대출, 저축, 부동산 관련 금액을 계산하는 도구와 관련 안내 글을 무료로 제공합니다. 회원가입 없이 누구나 이용할 수 있습니다.</p>
<h2>2. 계산 결과의 성격</h2><p>계산 결과와 글의 내용은 공개된 법령과 요율을 바탕으로 한 참고용 예상치입니다. 세무·법률·금융 자문이 아니며, 실제 금액은 개인 상황, 회사 규정, 금융회사와 관할 기관의 판단에 따라 달라질 수 있습니다.</p>
<h2>3. 책임의 한계</h2><p>사이트는 정보를 정확하고 최신으로 유지하기 위해 노력하지만 오류나 지연이 있을 수 있습니다. 이용자가 사이트의 정보를 근거로 내린 결정과 그 결과에 대해 사이트는 책임을 지지 않습니다. 중요한 결정 전에는 해당 기관이나 전문가에게 확인하시기 바랍니다.</p>
<h2>4. 광고와 제휴 링크</h2><p>사이트에는 광고와 제휴 링크가 포함될 수 있습니다. 광고와 제휴 링크로 연결되는 외부 사이트의 상품과 서비스는 해당 사업자가 제공하며, 사이트는 그 내용에 책임을 지지 않습니다.</p>
<h2>5. 저작권</h2><p>사이트의 글, 표, 디자인의 저작권은 사이트에 있습니다. 출처를 밝히고 링크를 거는 인용은 자유롭게 할 수 있으며, 전체를 복제해 다시 게시하는 것은 허용하지 않습니다.</p>
<h2>6. 서비스 변경</h2><p>사이트는 계산기와 글을 추가·수정·삭제할 수 있으며, 약관을 바꿀 때는 이 페이지에 게시합니다.</p>
<h2>7. 문의</h2><p>이메일: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
<p class="muted">시행일: 2026-10-01</p>`,
});

export const pages = [home, about, privacy, contact, terms];
