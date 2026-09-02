import { calcAcquisitionTax } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'acquisition-tax', name = '취득세 계산기';
const PRICES = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000, 200000, 300000]; // 만원
const lab = (m) => m >= 10000 ? `${m / 10000}억${m % 10000 ? ' ' + num(m % 10000) + '만' : ''}` : `${num(m)}만`;

function calcForm(price = 500_000_000) {
  return `<div class="card"><div class="calc"><div>
${field({ id: 'price', label: '취득가액 (매매가)', unit: '원', value: num(price), chips: [{ l: '3억', v: 3e8 }, { l: '5억', v: 5e8 }, { l: '7억', v: 7e8 }, { l: '10억', v: 1e9 }, { l: '15억', v: 1.5e9 }] })}
<div class="row">${select({ id: 'type', label: '부동산 종류', value: 'house', options: [{ v: 'house', l: '주택 (아파트·빌라)' }, { v: 'officetel', l: '오피스텔·상가' }, { v: 'land', l: '토지' }] })}${select({ id: 'houseCount', label: '취득 후 주택 수', value: '1', options: [{ v: 1, l: '1주택' }, { v: 2, l: '2주택' }, { v: 3, l: '3주택' }, { v: 4, l: '4주택 이상' }] })}</div>
<div class="row">${select({ id: 'regulated', label: '조정대상지역', value: 'no', options: [{ v: 'no', l: '비조정지역' }, { v: 'yes', l: '조정대상지역' }] })}${select({ id: 'large', label: '전용면적', value: 'no', options: [{ v: 'no', l: '85㎡ 이하' }, { v: 'yes', l: '85㎡ 초과' }] })}</div>
${select({ id: 'firstHome', label: '생애최초 주택 구입', value: 'no', options: [{ v: 'no', l: '아니오' }, { v: 'yes', l: '예 (취득세 최대 200만원 감면)' }] })}
</div><div class="result"><div class="sub">납부할 취득세 합계</div><div class="big" id="r-total">-</div><div class="sub" id="r-label"></div>
<table class="kv"><tbody><tr><td>취득세</td><td id="r-acq"></td></tr><tr><td class="indent">생애최초 감면</td><td id="r-red"></td></tr><tr><td>지방교육세</td><td id="r-edu"></td></tr><tr><td>농어촌특별세</td><td id="r-rural"></td></tr><tr class="total"><td>합계 (실효세율 <span id="r-eff"></span>)</td><td id="r-total2"></td></tr></tbody></table>
<div class="notice">취득일로부터 60일 이내 신고·납부. 주택 수는 세대 합산 기준.</div></div></div></div>`;
}

function priceTable(hl) {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>매매가</th><th>1주택 (85㎡ 이하)</th><th>1주택 (85㎡ 초과)</th><th>조정 2주택 (8%)</th><th>3주택 이상 (12%)</th></tr></thead><tbody>${PRICES.map((m) => { const p = m * 10000; return `<tr${m === hl ? ' class="hl"' : ''}><td><a href="${base}/acquisition-tax/${m}/">${lab(m)}원</a></td><td>${num(calcAcquisitionTax({ price: p }).total)}원</td><td>${num(calcAcquisitionTax({ price: p, large: true }).total)}원</td><td>${num(calcAcquisitionTax({ price: p, houseCount: 2, regulated: true }).total)}원</td><td>${num(calcAcquisitionTax({ price: p, houseCount: 4 }).total)}원</td></tr>`; }).join('')}</tbody></table></div>`;
}

const faq = [
  { q: '취득세율은 어떻게 정해지나요?', a: '1주택(또는 비조정지역 2주택)은 6억 이하 1%, 6억 초과 9억 이하 1~3% 구간별 선형 세율(취득가액 × 2/3억 − 3), 9억 초과 3%입니다. 여기에 지방교육세(취득세율의 10%)와 85㎡ 초과 시 농어촌특별세 0.2%가 붙습니다.' },
  { q: '다주택자 취득세 중과는?', a: '조정대상지역 2주택 또는 비조정지역 3주택은 8%, 조정대상지역 3주택 이상 또는 비조정지역 4주택 이상은 12%입니다. 지방교육세 0.4%, 85㎡ 초과 시 농특세 0.6~1%가 추가되어 실효세율은 8.4~13.4%입니다. 일시적 2주택은 종전 주택을 3년 내 처분하면 1주택 세율을 적용합니다.' },
  { q: '생애최초 주택 취득세 감면 조건은?', a: '본인과 배우자 모두 주택을 소유한 적이 없고, 취득가액 12억원 이하 주택을 취득하면 취득세 200만원 한도로 감면됩니다. 소득 요건은 2023년부터 폐지되었습니다. 3개월 내 전입하고 3년간 거주해야 추징되지 않습니다.' },
  { q: '취득세는 언제까지 내나요?', a: '잔금일(취득일)로부터 60일 이내에 물건지 시·군·구청에 신고·납부해야 하며, 기한을 넘기면 20% 무신고가산세와 납부지연가산세가 부과됩니다. 등기 시 취득세 납부 영수증이 필요하므로 보통 잔금일에 법무사가 함께 처리합니다.' },
];

function seoBody(hl) {
  return `<h2>취득세 계산 방법</h2>
<p><strong>취득세 = 취득가액 × 세율</strong>이고, 여기에 지방교육세와 농어촌특별세가 부가됩니다. 주택 취득가액 6억 이하는 1%, 9억 초과는 3%, 그 사이는 6억에서 9억으로 갈수록 1%에서 3%까지 0.01% 단위로 올라갑니다. 예를 들어 7억 5천만원 아파트는 세율 2%로 취득세 1,500만원, 지방교육세 150만원을 합해 1,650만원입니다.</p>
<h3>세율표 (2026년)</h3>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>구분</th><th>취득세</th><th>지방교육세</th><th>농특세 (85㎡ 초과)</th><th>합계</th></tr></thead><tbody>
<tr><td>1주택 6억 이하</td><td>1%</td><td>0.1%</td><td>0.2%</td><td>1.1~1.3%</td></tr>
<tr><td>1주택 6억~9억</td><td>1~3%</td><td>0.1~0.3%</td><td>0.2%</td><td>1.1~3.5%</td></tr>
<tr><td>1주택 9억 초과</td><td>3%</td><td>0.3%</td><td>0.2%</td><td>3.3~3.5%</td></tr>
<tr><td>조정 2주택 / 비조정 3주택</td><td>8%</td><td>0.4%</td><td>0.6%</td><td>8.4~9%</td></tr>
<tr><td>조정 3주택 / 비조정 4주택 이상</td><td>12%</td><td>0.4%</td><td>1%</td><td>12.4~13.4%</td></tr>
<tr><td>오피스텔·상가·토지</td><td>4%</td><td>0.4%</td><td>0.2%</td><td>4.6%</td></tr>
</tbody></table></div>
${ad('inArticle')}
<h2>매매가별 취득세 (${new Date().getFullYear()}년)</h2>${priceTable(hl)}
<h2>취득세 외에 드는 비용</h2>
<ul><li><strong>중개수수료</strong>: 5억 매매 기준 최대 200만원 + 부가세. <a href="${base}/brokerage/">중개수수료 계산기</a></li><li><strong>법무사 비용</strong>: 등기 대행 30만~60만원 수준, 셀프등기 시 절약 가능</li><li><strong>국민주택채권 매입</strong>: 시가표준액의 일정 비율로 매입 후 즉시 할인 매도 (실부담 수십만 원)</li><li><strong>인지세</strong>: 1억 초과 10억 이하 15만원, 10억 초과 35만원</li></ul>
${affiliate({ title: '주택담보대출 금리 비교', desc: '취득세까지 계산했다면 대출 금리도 비교하세요. 0.1%p 차이가 30년간 수백만 원.', url: '#', cta: '금리 비교' })}
${faqHtml(faq)}`;
}

export const tool = {
  slug, name, short: '주택·토지·상가 취득세와 지방교육세·농특세 합계 (다주택 중과, 생애최초 감면)',
  page({ config, tools }) {
    const title = '취득세 계산기 - 주택 매매가별 취득세, 다주택 중과, 생애최초 감면';
    const description = '취득가액과 주택 수, 조정대상지역, 전용면적을 입력하면 취득세와 지방교육세, 농어촌특별세 합계를 계산합니다. 1~12% 세율표와 매매가별 취득세 표 제공.';
    return {
      title, description, scripts: ['acquisition.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/acquisition-tax/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>취득세 계산기</h1><p class="lead">아파트, 빌라, 오피스텔, 토지 취득 시 내야 할 취득세를 조건별로 계산합니다.</p>${calcForm()}${seoBody(null)}${relatedTools(tools, slug)}`,
    };
  },
  pages({ tools }) {
    return PRICES.map((m) => {
      const p = m * 10000, r = calcAcquisitionTax({ price: p }), rl = calcAcquisitionTax({ price: p, large: true }), r2 = calcAcquisitionTax({ price: p, houseCount: 2, regulated: true }), rf = calcAcquisitionTax({ price: p, firstHome: true });
      const title = `${lab(m)}원 아파트 취득세 - 1주택 ${num(r.total)}원, 다주택 중과 시 얼마`;
      const description = `매매가 ${lab(m)}원 주택의 취득세는 1주택 기준 ${num(r.total)}원(세율 ${(r.rate * 100).toFixed(2)}%)입니다. 85㎡ 초과 ${num(rl.total)}원, 조정지역 2주택 ${num(r2.total)}원. 생애최초 감면과 부대비용까지 정리.`;
      return {
        path: `/acquisition-tax/${m}/`, title, description, scripts: ['acquisition.js'], jsonld: [faqJsonld(faq.slice(0, 2))],
        content: `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/acquisition-tax/' }, { name: `${lab(m)}원` }])}
<h1>${lab(m)}원 아파트 취득세</h1>
<p class="lead">매매가 ${lab(m)}원 주택을 1주택자가 취득하면 <strong>취득세 ${num(r.acquisition)}원 + 지방교육세 ${num(r.education)}원 = ${wonKo(r.total)}</strong>을 냅니다 (85㎡ 이하 기준). 85㎡ 초과면 농어촌특별세가 붙어 ${wonKo(rl.total)}, 생애최초 구입이면 ${wonKo(rf.total)}입니다.</p>
<div class="card"><h2 style="margin-top:0">${lab(m)}원 조건별 취득세</h2><div class="tbl-wrap"><table class="grid"><thead><tr><th>조건</th><th>세율</th><th>취득세</th><th>교육세</th><th>농특세</th><th>합계</th></tr></thead><tbody>${[['1주택 85㎡ 이하', r], ['1주택 85㎡ 초과', rl], ['생애최초 (85㎡ 이하)', rf], ['비조정 2주택', calcAcquisitionTax({ price: p, houseCount: 2 })], ['조정 2주택 / 비조정 3주택', r2], ['조정 3주택 / 4주택 이상', calcAcquisitionTax({ price: p, houseCount: 4 })], ['오피스텔·상가', calcAcquisitionTax({ price: p, type: 'commercial' })]].map(([l, x]) => `<tr><td>${l}</td><td>${(x.rate * 100).toFixed(2)}%</td><td>${num(x.acquisition - x.reduction)}</td><td>${num(x.education)}</td><td>${num(x.rural)}</td><td><strong>${num(x.total)}원</strong></td></tr>`).join('')}</tbody></table></div></div>
${ad('top')}
<h2>조건 바꿔서 계산하기</h2>${calcForm(p)}
<h2>${lab(m)}원 주택 취득 시 총 부대비용</h2>
<p>취득세 ${wonKo(r.total)} 외에 중개수수료 최대 ${wonKo(Math.min(p * (p <= 2e8 ? 0.005 : p <= 9e8 ? 0.004 : p <= 12e8 ? 0.005 : p <= 15e8 ? 0.006 : 0.007), p <= 2e8 ? 800000 : Infinity))}(부가세 별도), 법무사 비용 약 30만~60만원, 인지세 ${p > 1e9 ? '35만원' : p > 1e8 ? '15만원' : '없음'}, 국민주택채권 할인 비용이 듭니다. 대략 <strong>매매가의 ${((r.total / p + 0.006) * 100).toFixed(1)}% 안팎</strong>을 취득 비용으로 준비해야 합니다.</p>
<h2>다른 금액 취득세</h2>${priceTable(m)}
${ad('inArticle')}${faqHtml(faq.slice(0, 2))}${relatedTools(tools, slug)}`,
      };
    });
  },
};
