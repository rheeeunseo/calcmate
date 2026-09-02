import { calcBrokerage } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'brokerage', name = '부동산 중개수수료 계산기';
const PRICES = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000, 200000, 300000];
const lab = (m) => m >= 10000 ? `${m / 10000}억${m % 10000 ? ' ' + num(m % 10000) + '만' : ''}` : `${num(m)}만`;

function calcForm(price = 500_000_000, deal = 'sale') {
  return `<div class="card"><div class="calc"><div>
<div class="row">${select({ id: 'deal', label: '거래 종류', value: deal, options: [{ v: 'sale', l: '매매' }, { v: 'rent', l: '전세·월세' }] })}${select({ id: 'type', label: '부동산 종류', value: 'house', options: [{ v: 'house', l: '주택' }, { v: 'officetel', l: '주거용 오피스텔' }, { v: 'other', l: '상가·토지·기타' }] })}</div>
${field({ id: 'price', label: '매매가 / 전세 보증금', unit: '원', value: num(price), chips: [{ l: '1억', v: 1e8 }, { l: '3억', v: 3e8 }, { l: '5억', v: 5e8 }, { l: '10억', v: 1e9 }] })}
${field({ id: 'monthly', label: '월세 (월세 계약만)', unit: '원', value: '0', hint: '보증금 + 월세×100 으로 환산 (5천만 미만이면 ×70)' })}
${select({ id: 'vat', label: '중개사무소 과세 유형', value: 'general', options: [{ v: 'general', l: '일반과세 (부가세 10%)' }, { v: 'simplified', l: '간이과세 (약 4%)' }, { v: 'none', l: '부가세 없음' }] })}
</div><div class="result"><div class="sub">중개수수료 (부가세 포함)</div><div class="big" id="r-total">-</div><div class="sub" id="r-note"></div>
<table class="kv"><tbody><tr><td>거래금액</td><td id="r-amount"></td></tr><tr><td>상한요율</td><td id="r-rate"></td></tr><tr><td>수수료 (상한)</td><td id="r-fee"></td></tr><tr><td>부가세</td><td id="r-vat"></td></tr><tr class="total"><td>합계</td><td id="r-total2"></td></tr></tbody></table>
<div class="notice">법정 상한이며 이 범위 안에서 중개사와 협의 가능. 매도·매수(임대·임차) 각각 부담.</div></div></div></div>`;
}
const faq = [
  { q: '중개수수료는 누가 내나요?', a: '매매는 매도인과 매수인이, 임대차는 임대인과 임차인이 각자 중개사에게 지급합니다. 계산기의 금액은 한쪽이 내는 금액입니다.' },
  { q: '상한요율을 꼭 다 내야 하나요?', a: '아닙니다. 법정 요율은 상한이며, 그 범위 안에서 협의해 정합니다. 계약 전에 수수료율을 확인하고 중개대상물 확인설명서에 기재된 금액을 확인하세요.' },
  { q: '부가세는 별도인가요?', a: '중개사무소가 일반과세자면 수수료의 10%를 부가세로 추가 청구할 수 있고, 간이과세자면 약 4% 수준입니다. 현금영수증 발급을 요구할 수 있습니다.' },
  { q: '월세 계약의 거래금액은?', a: '보증금 + (월세 × 100)입니다. 이 금액이 5천만원 미만이면 보증금 + (월세 × 70)으로 다시 계산합니다. 예: 보증금 1천만원, 월세 50만원 → 6천만원 → 0.4% 적용, 상한 30만원.' },
];
function priceTable(hl) {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>거래금액</th><th>매매 요율</th><th>매매 수수료</th><th>임대차 요율</th><th>임대차 수수료</th></tr></thead><tbody>${PRICES.map((m) => { const p = m * 10000, s = calcBrokerage({ deal: 'sale', price: p }), r = calcBrokerage({ deal: 'rent', price: p }); return `<tr${m === hl ? ' class="hl"' : ''}><td><a href="${base}/brokerage/${m}/">${lab(m)}원</a></td><td>${(s.rate * 100).toFixed(1)}%</td><td>${num(s.fee)}원</td><td>${(r.rate * 100).toFixed(1)}%</td><td>${num(r.fee)}원</td></tr>`; }).join('')}</tbody></table></div>`;
}
function seoBody(hl) {
  return `<h2>중개수수료 상한요율표 (주택, 2021년 10월 개정)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>거래금액</th><th>매매·교환</th><th>한도</th><th>임대차</th><th>한도</th></tr></thead><tbody>
<tr><td>5천만원 미만</td><td>0.6%</td><td>25만원</td><td>0.5%</td><td>20만원</td></tr>
<tr><td>5천만~2억 미만</td><td>0.5%</td><td>80만원</td><td>0.4%</td><td>30만원 (1억 미만)</td></tr>
<tr><td>2억~9억 미만</td><td>0.4%</td><td>-</td><td>0.3% (1억~6억)</td><td>-</td></tr>
<tr><td>9억~12억 미만</td><td>0.5%</td><td>-</td><td>0.4% (6억~12억)</td><td>-</td></tr>
<tr><td>12억~15억 미만</td><td>0.6%</td><td>-</td><td>0.5%</td><td>-</td></tr>
<tr><td>15억 이상</td><td>0.7%</td><td>-</td><td>0.6%</td><td>-</td></tr>
</tbody></table></div>
<p>주거용 오피스텔(전용 85㎡ 이하)은 매매 0.5%, 임대차 0.4%이고, 상가·토지 등은 0.9% 이내 협의입니다. 부가세는 별도입니다.</p>
${ad('inArticle')}
<h2>거래금액별 중개수수료 (부가세 별도)</h2>${priceTable(hl)}
<h2>수수료 아끼는 팁</h2>
<ul><li>상한요율은 협상의 출발점입니다. 고가 주택일수록 0.1%p 차이가 수십만 원이므로 계약 전에 요율을 정해 두세요.</li><li>중개사무소 사업자등록증에서 일반과세·간이과세 여부를 확인하면 부가세 10%인지 4%인지 알 수 있습니다.</li><li>수수료는 잔금일에 지급하는 것이 원칙이며, 계약 파기 시에도 중개사 책임이 없으면 지급 의무가 있을 수 있습니다.</li></ul>
${faqHtml(faq)}`;
}
export const tool = {
  slug, name, short: '매매·전세·월세 중개보수 상한요율과 부가세 포함 금액',
  page({ config, tools }) {
    const title = '부동산 중개수수료 계산기 - 매매·전세·월세 복비 상한요율';
    const description = '매매가나 전세 보증금, 월세를 입력하면 법정 상한요율 기준 중개수수료(복비)와 부가세를 계산합니다. 2021년 개정 요율표와 금액별 수수료 표.';
    return {
      title, description, scripts: ['brokerage.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/brokerage/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>부동산 중개수수료 계산기</h1><p class="lead">매매, 전세, 월세 계약의 복비를 법정 상한요율로 계산합니다.</p>${calcForm()}${seoBody(null)}${relatedTools(tools, slug)}`,
    };
  },
  pages({ tools }) {
    return PRICES.map((m) => {
      const p = m * 10000, s = calcBrokerage({ deal: 'sale', price: p }), r = calcBrokerage({ deal: 'rent', price: p });
      const title = `${lab(m)}원 중개수수료 - 매매 ${num(s.fee)}원, 전세 ${num(r.fee)}원 (복비 계산)`;
      const description = `${lab(m)}원 매매 시 중개수수료 상한은 ${(s.rate * 100).toFixed(1)}%인 ${num(s.fee)}원, 전세 ${lab(m)}원은 ${(r.rate * 100).toFixed(1)}%인 ${num(r.fee)}원입니다 (부가세 별도). 요율표와 협상 팁.`;
      return {
        path: `/brokerage/${m}/`, title, description, scripts: ['brokerage.js'], jsonld: [faqJsonld(faq.slice(0, 2))],
        content: `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/brokerage/' }, { name: `${lab(m)}원` }])}
<h1>${lab(m)}원 중개수수료 (복비)</h1>
<p class="lead">${lab(m)}원 <strong>매매</strong>의 중개수수료 상한은 ${(s.rate * 100).toFixed(1)}%인 <strong>${wonKo(s.fee)}</strong>, 부가세 10% 포함 ${wonKo(s.total)}입니다. <strong>전세</strong> ${lab(m)}원이면 ${(r.rate * 100).toFixed(1)}%인 ${wonKo(r.fee)}, 부가세 포함 ${wonKo(r.total)}입니다.</p>
<div class="card"><h2 style="margin-top:0">${lab(m)}원 거래별 수수료</h2><div class="tbl-wrap"><table class="grid"><thead><tr><th>거래</th><th>요율</th><th>수수료</th><th>부가세 10%</th><th>합계</th></tr></thead><tbody>${[['주택 매매', s], ['주택 전세', r], ['오피스텔 매매', calcBrokerage({ deal: 'sale', type: 'officetel', price: p })], ['오피스텔 전세', calcBrokerage({ deal: 'rent', type: 'officetel', price: p })], ['상가·토지 (0.9% 상한)', calcBrokerage({ deal: 'sale', type: 'other', price: p })]].map(([l, x]) => `<tr><td>${l}</td><td>${(x.rate * 100).toFixed(1)}%</td><td>${num(x.fee)}</td><td>${num(x.vatAmount)}</td><td><strong>${num(x.total)}원</strong></td></tr>`).join('')}</tbody></table></div></div>
${ad('top')}
<h2>조건 바꿔서 계산하기</h2>${calcForm(p)}
<p>같은 ${lab(m)}원이라도 매매는 ${(s.rate * 100).toFixed(1)}%, 임대차는 ${(r.rate * 100).toFixed(1)}%로 요율이 다릅니다. 매매 시에는 <a href="${base}/acquisition-tax/${m}/">${lab(m)}원 취득세</a>도 함께 준비해야 합니다.</p>
<h2>다른 금액 중개수수료</h2>${priceTable(m)}
${ad('inArticle')}${faqHtml(faq.slice(0, 2))}${relatedTools(tools, slug)}`,
      };
    });
  },
};
