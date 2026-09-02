import { calcDeposit } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'deposit', name = '예금 이자 계산기';
const faq = [
  { q: '예금과 적금 중 어느 쪽 이자가 많나요?', a: '같은 금리라면 목돈을 한 번에 넣는 예금이 이자가 많습니다. 1,200만원을 연 4% 예금에 넣으면 세전 48만원이지만, 매달 100만원씩 적금하면 26만원입니다. 목돈이 있다면 예금, 매달 모은다면 적금입니다.' },
  { q: '월복리 예금은 얼마나 유리한가요?', a: '1억원 연 4% 1년 기준 단리 이자 400만원, 월복리 407만원으로 차이는 약 7만원입니다. 기간이 길수록 차이가 커집니다.' },
  { q: '이자소득이 2,000만원을 넘으면?', a: '연간 금융소득(이자+배당)이 2,000만원을 초과하면 금융소득종합과세 대상이 되어 다른 소득과 합산해 누진세율로 과세됩니다.' },
];
const RATES = [3, 3.5, 4, 4.5, 5], AMTS = [1000, 3000, 5000, 10000, 30000];
const lab = (m) => m >= 10000 ? `${m / 10000}억` : `${num(m)}만`;
function quick() {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>예치금 \\ 금리</th>${RATES.map((r) => `<th>${r}%</th>`).join('')}</tr></thead><tbody>${AMTS.map((m) => `<tr><td>${lab(m)}원</td>${RATES.map((r) => `<td>${num(calcDeposit({ principal: m * 10000, months: 12, annualRate: r }).afterTaxInterest)}원</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const tool = {
  slug, name, short: '예치금·기간·금리로 만기 수령액과 세후 이자 계산',
  page({ config, tools }) {
    const title = '예금 이자 계산기 - 정기예금 만기 수령액, 세후 이자';
    const description = '예치 금액과 기간, 금리를 입력하면 정기예금 만기 수령액과 세후 이자를 계산합니다. 단리·월복리, 일반과세·세금우대·비과세 선택.';
    return {
      title, description, scripts: ['deposit.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/deposit/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>예금 이자 계산기</h1><p class="lead">목돈을 정기예금에 넣으면 만기에 얼마를 받는지 세후 기준으로 계산합니다.</p>
<div class="card"><div class="calc"><div>
${field({ id: 'principal', label: '예치 금액', unit: '원', value: '10,000,000', chips: [{ l: '1천만', v: 1e7 }, { l: '3천만', v: 3e7 }, { l: '5천만', v: 5e7 }, { l: '1억', v: 1e8 }] })}
<div class="row">${field({ id: 'months', label: '기간', unit: '개월', value: '12', chips: [6, 12, 24, 36].map((v) => ({ l: `${v}개월`, v })) })}${field({ id: 'rate', label: '연이율', unit: '%', value: '3.5', inputmode: 'decimal' })}</div>
<div class="row">${select({ id: 'compound', label: '이자 방식', value: 'simple', options: [{ v: 'simple', l: '단리' }, { v: 'compound', l: '월복리' }] })}${select({ id: 'taxType', label: '과세', value: 'normal', options: [{ v: 'normal', l: '일반과세 15.4%' }, { v: 'preferential', l: '세금우대 9.5%' }, { v: 'free', l: '비과세' }] })}</div>
</div><div class="result"><div class="sub">만기 수령액 (세후)</div><div class="big" id="r-net">-</div>
<table class="kv"><tbody><tr><td>원금</td><td id="r-principal"></td></tr><tr><td>세전 이자</td><td id="r-interest"></td></tr><tr><td>이자소득세</td><td id="r-tax"></td></tr><tr class="total"><td>세후 이자</td><td id="r-after"></td></tr></tbody></table></div></div></div>
<h2>예금 이자 계산 공식</h2>
<p>단리 정기예금 이자는 <strong>원금 × 연이율 × 개월수 ÷ 12</strong>입니다. 1,000만원을 연 3.5% 12개월 예치하면 세전 35만원, 세후(15.4%) 296,100원을 받습니다. 월복리는 원금 × ((1 + 연이율 ÷ 12)^개월수 − 1) 로 계산합니다.</p>
${ad('inArticle')}
<h2>예치금·금리별 1년 세후 이자 (일반과세)</h2>${quick()}
<h2>예금 활용 팁</h2>
<ul><li><strong>파킹통장 vs 정기예금</strong>: 3개월 이내 쓸 돈은 파킹통장, 그 이상은 정기예금이 유리합니다.</li><li><strong>예금 쪼개기</strong>: 중도해지에 대비해 여러 개로 나눠 가입하면 필요한 만큼만 해지할 수 있습니다.</li><li><strong>만기 후 자동 재예치</strong>: 만기가 지나면 금리가 크게 떨어지므로 자동 재예치나 알림을 설정하세요.</li></ul>
${affiliate({ title: '오늘의 정기예금 최고금리', desc: '1금융권·저축은행 예금 금리 비교. 예금자보호 1억원 한도 확인.', url: '#', cta: '금리 비교' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
