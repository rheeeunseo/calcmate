import { calcHomeCost } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'home-cost', name = '내 집 마련 총비용 계산기';
const PRICES = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000];
const INCOMES = [4000, 6000, 8000, 10000, 15000];
const lab = (m) => m >= 10000 ? `${m / 10000}억${m % 10000 ? ' ' + num(m % 10000) + '만' : ''}` : `${num(m)}만`;

function calcForm(price = 500_000_000, income = 60_000_000) {
  return `<div class="card"><div class="calc"><div>
${field({ id: 'price', label: '매매가', unit: '원', value: num(price), chips: [{ l: '3억', v: 3e8 }, { l: '5억', v: 5e8 }, { l: '7억', v: 7e8 }, { l: '10억', v: 1e9 }] })}
${field({ id: 'income', label: '연소득 (세전, 부부합산 가능)', unit: '원', value: num(income), chips: [4000, 6000, 8000, 10000].map((v) => ({ l: `${num(v)}만`, v: v * 10000 })) })}
${field({ id: 'cash', label: '보유 현금 (선택)', unit: '원', value: '0', hint: '입력하면 부족·여유 금액을 알려줍니다' })}
<div class="row">${field({ id: 'rate', label: '대출 금리', unit: '%', value: '4.0', inputmode: 'decimal' })}${field({ id: 'years', label: '만기', unit: '년', value: '30' })}${field({ id: 'ltv', label: 'LTV', unit: '%', value: '70' })}</div>
<div class="row">${select({ id: 'large', label: '전용면적', value: 'no', options: [{ v: 'no', l: '85㎡ 이하' }, { v: 'yes', l: '85㎡ 초과' }] })}${select({ id: 'firstHome', label: '생애최초', value: 'no', options: [{ v: 'no', l: '아니오' }, { v: 'yes', l: '예' }] })}</div>
${field({ id: 'existing', label: '기존 대출 연간 원리금 (선택)', unit: '원', value: '0' })}
<p style="margin:8px 0 0"><button type="button" class="btn ghost" id="share">결과 링크 복사</button> <span class="muted" id="share-msg"></span></p>
</div><div class="result">
<div class="sub">이 집을 사려면 필요한 현금</div><div class="big" id="r-cash">-</div><div class="sub" id="r-summary"></div>
<table class="kv"><tbody>
<tr><td>매매가</td><td id="r-price"></td></tr>
<tr><td>대출 가능액 (<span id="r-binding"></span>)</td><td id="r-loan"></td></tr>
<tr><td class="indent">월 상환액 · 소득 대비 <span id="r-burden"></span></td><td id="r-pmt"></td></tr>
<tr><td class="indent">30년 총이자</td><td id="r-interest"></td></tr>
<tr><td>취득세 (교육세·농특세 포함)</td><td id="r-acq"></td></tr>
<tr><td>중개수수료 (부가세 포함, 상한)</td><td id="r-brk"></td></tr>
<tr><td>법무사·인지세·채권 (약)</td><td id="r-other"></td></tr>
<tr class="total"><td>필요 현금 합계</td><td id="r-cash2"></td></tr>
<tr id="r-gap-row"><td>보유 현금 대비</td><td id="r-gap"></td></tr>
</tbody></table>
<div class="notice">스트레스 DSR 40%·원리금균등·LTV 반영 추정치. 은행 심사, 지역 규제(LTV 40~70%), 신용도에 따라 다릅니다.</div></div></div></div>`;
}

const faq = [
  { q: '집 살 때 매매가 외에 얼마나 더 드나요?', a: '1주택 기준 취득세 1.1~3.5%, 중개수수료 최대 0.4~0.7% + 부가세, 법무사 30~60만원, 인지세 15~35만원, 국민주택채권 할인 비용 수십만 원이 듭니다. 5억 아파트면 약 800만~900만원, 10억이면 약 4,000만원 안팎입니다.' },
  { q: '대출은 얼마까지 나오나요?', a: '스트레스 DSR 40%와 LTV 중 작은 값입니다. 연소득 6,000만원, 금리 4%, 30년이면 DSR 한도 약 3억 5천만원이고, 5억 주택의 LTV 70%는 3억 5천만원이라 비슷합니다. 규제지역은 LTV 가 40~50%로 낮아집니다.' },
  { q: '월 상환액이 소득의 몇 %면 적당한가요?', a: '일반적으로 월 소득의 30% 이내를 권합니다. 40%를 넘으면 금리 상승이나 소득 변동에 취약해집니다. 이 계산기는 소득 대비 상환 부담률을 함께 표시합니다.' },
  { q: '생애최초면 얼마나 절약되나요?', a: '취득세가 200만원 한도로 감면됩니다(12억 이하). 또한 생애최초 주택구입자는 LTV 80%, 디딤돌·보금자리론 우대금리 등 대출 혜택이 있어 필요 현금이 크게 줄어듭니다.' },
];

function seoBody(hl) {
  return `<h2>집 살 때 드는 돈, 한눈에</h2>
<p>주택 구입 비용은 <strong>매매가 − 대출 + 취득 비용</strong>입니다. 취득 비용은 취득세(지방교육세·농특세 포함), 중개수수료(부가세 포함), 법무사 비용, 인지세, 국민주택채권 할인 비용으로 구성됩니다. 대출은 소득 기준 DSR 한도와 주택가격 기준 LTV 한도 중 작은 쪽까지 나옵니다.</p>
${ad('inArticle')}
<h2>매매가 × 연소득별 필요 현금 (금리 4%, 30년, LTV 70%, 1주택 85㎡ 이하)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>매매가</th><th>취득 비용</th>${INCOMES.map((i) => `<th>연소득 ${num(i)}만</th>`).join('')}</tr></thead><tbody>${PRICES.map((m) => { const p = m * 10000; const c = calcHomeCost({ price: p, income: 6e7 }); return `<tr${m === hl ? ' class="hl"' : ''}><td><a href="${base}/home-cost/${m}/">${lab(m)}원</a></td><td>${num(c.purchaseCosts)}원</td>${INCOMES.map((i) => { const x = calcHomeCost({ price: p, income: i * 10000 }); return `<td>${num(x.cashNeeded)}원<br><span class="muted">대출 ${num(Math.round(x.loan / 1e6) / 100)}억</span></td>`; }).join('')}</tr>`; }).join('')}</tbody></table></div>
<p class="muted">각 칸: 필요 현금 (대출 가능액). 기존 대출 없음 기준.</p>
<h2>필요 현금을 줄이는 방법</h2>
<ul><li><strong>생애최초·신혼부부·신생아 특례</strong>: 취득세 감면과 LTV 80%, 저금리 정책대출로 현금 부담이 수천만 원 줄어듭니다.</li><li><strong>만기 연장</strong>: 30년→40년이면 같은 소득으로 대출 한도가 약 10% 늘어납니다. 대신 총이자가 늘어납니다.</li><li><strong>기존 대출 정리</strong>: 신용대출·마이너스통장은 DSR 을 크게 잡아먹습니다. 주담대 전에 갚거나 한도를 줄이세요.</li><li><strong>중개수수료 협상</strong>: 상한요율은 상한일 뿐입니다. 고가 주택은 0.1%p 만 낮춰도 수십만 원입니다.</li><li><strong>셀프 등기</strong>: 법무사 비용 30~60만원을 아낄 수 있습니다. 대출이 있으면 은행 지정 법무사를 써야 하는 경우가 많습니다.</li></ul>
<h2>세부 계산기</h2>
<div class="pill-list"><a href="${base}/acquisition-tax/">취득세 계산기</a><a href="${base}/brokerage/">중개수수료 계산기</a><a href="${base}/dsr/">DSR 대출한도 계산기</a><a href="${base}/loan/">대출 이자 계산기</a><a href="${base}/capital-gains-tax/">양도소득세 계산기</a></div>
${affiliate({ title: '주택담보대출 금리 비교', desc: '한도가 나왔다면 금리를 비교하세요. 0.3%p 차이가 3억 30년 기준 약 1,900만원.', url: '#', cta: '금리 비교' })}
${faqHtml(faq)}`;
}

export const tool = {
  slug, name, short: '매매가·연소득으로 취득세·복비·대출한도·월상환액·필요 현금을 한 번에',
  page({ config, tools }) {
    const title = '내 집 마련 총비용 계산기 - 매매가·연소득으로 필요 현금, 대출한도, 월 상환액';
    const description = '매매가와 연소득만 입력하면 취득세, 중개수수료, 법무사·채권 비용, DSR·LTV 대출 한도, 월 상환액, 필요한 현금을 한 화면에 계산합니다. 결과 링크 공유 가능.';
    return {
      title, description, scripts: ['homecost.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/home-cost/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>내 집 마련 총비용 계산기</h1><p class="lead">이 집을 사려면 현금이 얼마나 필요한지, 대출은 얼마까지 되고 매달 얼마를 갚는지 한 번에 봅니다.</p>${calcForm()}${seoBody(null)}${relatedTools(tools, slug)}`,
    };
  },
  pages({ tools }) {
    return PRICES.map((m) => {
      const p = m * 10000, c = calcHomeCost({ price: p, income: 6e7 });
      const title = `${lab(m)}원 아파트 살 때 총비용 - 취득세·복비 ${num(Math.round(c.purchaseCosts / 1e4))}만원, 필요 현금은?`;
      const description = `${lab(m)}원 아파트 구입 시 취득세 ${num(c.acq.total)}원, 중개수수료 ${num(c.brk.total)}원 등 취득 비용 약 ${wonKo(c.purchaseCosts)}. 연소득 6천만원이면 대출 ${wonKo(c.loan)}, 필요 현금 ${wonKo(c.cashNeeded)}, 월 상환 ${num(c.pmt)}원.`;
      return {
        path: `/home-cost/${m}/`, title, description, scripts: ['homecost.js'], jsonld: [faqJsonld(faq.slice(0, 2))],
        content: `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/home-cost/' }, { name: `${lab(m)}원` }])}
<h1>${lab(m)}원 아파트 살 때 총비용</h1>
<p class="lead">${lab(m)}원 아파트를 사면 매매가 외에 <strong>취득 비용 약 ${wonKo(c.purchaseCosts)}</strong>이 듭니다. 연소득 6,000만원이면 대출이 최대 ${wonKo(c.loan)} 나오고, <strong>필요한 현금은 약 ${wonKo(c.cashNeeded)}</strong>, 월 상환액은 ${num(c.pmt)}원(소득의 ${(c.burden * 100).toFixed(0)}%)입니다.</p>
<div class="card"><h2 style="margin-top:0">${lab(m)}원 취득 비용 내역 (1주택, 85㎡ 이하)</h2><table class="kv"><tbody><tr><td>취득세 + 지방교육세</td><td>${num(c.acq.total)}원</td></tr><tr><td>중개수수료 (${(c.brk.rate * 100).toFixed(1)}% + 부가세)</td><td>${num(c.brk.total)}원</td></tr><tr><td>법무사 (약)</td><td>${num(c.legal)}원</td></tr><tr><td>인지세</td><td>${num(c.stamp)}원</td></tr><tr><td>국민주택채권 할인 (약)</td><td>${num(c.bond)}원</td></tr><tr class="total"><td>취득 비용 합계</td><td>${num(c.purchaseCosts)}원 (매매가의 ${(c.purchaseCosts / p * 100).toFixed(2)}%)</td></tr></tbody></table></div>
<h2>연소득별 대출 한도와 필요 현금 (금리 4%, 30년, LTV 70%)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>연소득</th><th>대출 가능액</th><th>적용 한도</th><th>월 상환액</th><th>소득 대비</th><th>필요 현금</th></tr></thead><tbody>${INCOMES.map((i) => { const x = calcHomeCost({ price: p, income: i * 10000 }); return `<tr><td>${num(i)}만원</td><td>${num(x.loan)}원</td><td>${x.dsr.binding}</td><td>${num(x.pmt)}원</td><td>${(x.burden * 100).toFixed(0)}%</td><td><strong>${num(x.cashNeeded)}원</strong></td></tr>`; }).join('')}</tbody></table></div>
${ad('top')}
<h2>내 조건으로 계산하기</h2>${calcForm(p)}
<h2>다른 금액</h2><div class="pill-list">${PRICES.filter((x) => x !== m).map((x) => `<a href="${base}/home-cost/${x}/">${lab(x)}원</a>`).join('')}</div>
<p>세부 항목은 <a href="${base}/acquisition-tax/${m}/">${lab(m)}원 취득세</a>, <a href="${base}/brokerage/${m}/">${lab(m)}원 중개수수료</a> 페이지에서 조건별로 확인할 수 있습니다.</p>
${ad('inArticle')}${faqHtml(faq.slice(0, 2))}${relatedTools(tools, slug)}`,
      };
    });
  },
};
