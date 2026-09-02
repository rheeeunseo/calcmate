import { calcDsrLimit } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'dsr', name = 'DSR 대출한도 계산기';
const faq = [
  { q: 'DSR 이란?', a: '총부채원리금상환비율. 모든 대출의 연간 원리금 상환액을 연소득으로 나눈 비율입니다. 은행권은 40%, 2금융권은 50%가 한도이며, 신용대출·카드론·자동차할부(일부) 모두 포함됩니다. 전세대출, 300만원 이하 소액 대출 등은 제외됩니다.' },
  { q: '스트레스 DSR 이란?', a: '금리 상승에 대비해 실제 금리에 가산금리(스트레스 금리)를 더해 DSR 을 계산하는 제도입니다. 2025년 7월 3단계부터 수도권 1.5%p, 지방은 유예 후 단계 적용입니다. 가산금리는 한도 계산에만 쓰이고 실제 이자에는 붙지 않습니다.' },
  { q: '한도를 늘리려면?', a: '만기를 늘리면 연간 상환액이 줄어 한도가 커집니다(30년→40년, 단 은행별 연령 제한). 신용대출·마이너스통장 한도를 줄이거나 갚으면 기존 원리금이 빠져 한도가 늘어납니다. 부부 합산 소득으로 신청하는 것도 방법입니다.' },
  { q: 'LTV 와 DSR 중 무엇이 한도를 결정하나요?', a: '둘 중 작은 값입니다. 고가 주택은 LTV(주택가격의 70% 등)가, 소득 대비 주택가격이 높으면 DSR 이 한도를 제한합니다. 계산기가 어느 쪽이 걸리는지 표시합니다.' },
];
export const tool = {
  slug, name, short: '연소득·금리·만기로 스트레스 DSR 반영 주택담보대출 한도',
  page({ config, tools }) {
    const title = 'DSR 대출한도 계산기 - 연소득별 주택담보대출 한도 (스트레스 DSR)';
    const description = '연소득, 금리, 만기, 기존 대출을 입력하면 스트레스 DSR 40% 기준 주택담보대출 한도와 월 상환액을 계산합니다. LTV 한도 동시 반영, 연소득별 한도표.';
    const rows = [3000, 4000, 5000, 6000, 8000, 10000, 15000].map((i) => [i, ...[30, 40].map((y) => calcDsrLimit({ income: i * 10000, rate: 4, years: y }).limit)]);
    return {
      title, description, scripts: ['dsr.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/dsr/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>DSR 대출한도 계산기</h1><p class="lead">내 연소득으로 주택담보대출을 얼마까지 받을 수 있는지 스트레스 DSR 기준으로 계산합니다.</p>
<div class="card"><div class="calc"><div>
${field({ id: 'income', label: '연소득 (세전, 부부합산 가능)', unit: '원', value: '50,000,000', chips: [3000, 5000, 7000, 10000].map((v) => ({ l: `${num(v)}만`, v: v * 10000 })) })}
<div class="row">${field({ id: 'rate', label: '대출 금리', unit: '%', value: '4.0', inputmode: 'decimal' })}${field({ id: 'years', label: '만기', unit: '년', value: '30', chips: [20, 30, 40].map((v) => ({ l: `${v}년`, v })) })}</div>
<div class="row">${field({ id: 'stress', label: '스트레스 가산금리', unit: '%p', value: '1.5', inputmode: 'decimal', hint: '수도권 1.5, 지방은 은행 확인' })}${select({ id: 'dsrLimit', label: 'DSR 한도', value: '40', options: [{ v: 40, l: '은행 40%' }, { v: 50, l: '2금융권 50%' }] })}</div>
${field({ id: 'existing', label: '기존 대출 연간 원리금', unit: '원', value: '0', hint: '신용대출·카드론 등 1년간 갚는 원금+이자' })}
<div class="row">${field({ id: 'price', label: '주택가격 (선택)', unit: '원', value: '0', hint: 'LTV 한도 계산' })}${field({ id: 'ltv', label: 'LTV', unit: '%', value: '70' })}</div>
</div><div class="result"><div class="sub">최대 대출 가능액</div><div class="big" id="r-limit">-</div><div class="sub" id="r-binding"></div>
<table class="kv"><tbody><tr><td>DSR 허용 연 상환액</td><td id="r-allowed"></td></tr><tr><td>DSR 기준 한도</td><td id="r-dsr"></td></tr><tr><td>LTV 기준 한도</td><td id="r-ltv"></td></tr><tr><td>산정 금리 (스트레스 포함)</td><td id="r-stress"></td></tr><tr class="total"><td>실제 월 상환액</td><td id="r-pmt"></td></tr></tbody></table>
<div class="notice">원리금균등 기준 추정치. 은행별 심사 기준·신용도에 따라 달라집니다.</div></div></div></div>
<h2>DSR 계산 방법</h2>
<p><strong>DSR = 모든 대출의 연간 원리금 상환액 ÷ 연소득</strong>. 은행권 한도 40%이므로 연소득 5,000만원이면 연 2,000만원(월 약 167만원)까지 원리금을 갚을 수 있는 금액이 한도입니다. 스트레스 DSR 은 여기에 가산금리 1.5%p 를 더한 금리로 상환액을 계산해 한도를 줄입니다. 금리 4%, 30년 기준 연소득 5,000만원의 한도는 약 ${wonKo(calcDsrLimit({ income: 5e7, rate: 4, years: 30 }).limit)}입니다.</p>
${ad('inArticle')}
<h2>연소득별 주택담보대출 한도 (금리 4%, 스트레스 1.5%p, DSR 40%)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>연소득</th><th>30년 만기</th><th>40년 만기</th></tr></thead><tbody>${rows.map(([i, a, b]) => `<tr><td>${num(i)}만원</td><td>${num(a)}원</td><td>${num(b)}원</td></tr>`).join('')}</tbody></table></div>
<p>기존 대출이 없을 때 기준입니다. 신용대출 5,000만원(연 원리금 약 1,100만원)이 있으면 한도가 약 1억 6천만원 줄어듭니다. 실제 월 상환액은 <a href="${base}/loan/">대출 이자 계산기</a>에서 확인하세요.</p>
<h2>DSR 에 포함되는 대출과 제외되는 대출</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>포함</th><th>제외</th></tr></thead><tbody><tr><td>주택담보대출, 신용대출(5년 분할 가정), 마이너스통장(한도 기준), 카드론, 자동차 할부, 학자금 외 일반 대출</td><td>전세자금대출(이자만 일부 포함), 300만원 이하 소액, 서민금융상품, 보금자리론 일부, 예적금담보대출</td></tr></tbody></table></div>
${affiliate({ title: '내 한도 안에서 최저금리 찾기', desc: '여러 은행의 주담대 금리와 한도를 한 번에 조회.', url: '#', cta: '금리 비교' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
