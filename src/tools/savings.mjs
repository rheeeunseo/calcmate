import { calcSavings } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'savings', name = '적금 이자 계산기';
const faq = [
  { q: '적금 이자는 왜 생각보다 적나요?', a: '적금은 매달 나눠 넣기 때문에 첫 달 납입금만 12개월치 이자를 받고, 마지막 달 납입금은 1개월치 이자만 받습니다. 연 4% 적금의 실제 수익률은 원금 총액 대비 약 2.2% 수준입니다.' },
  { q: '이자소득세는 얼마인가요?', a: '일반과세는 이자의 15.4%(소득세 14% + 지방소득세 1.4%)입니다. 새마을금고·신협·농협 조합원 세금우대는 1.4%(농특세)만 부과되며, 이 계산기의 세금우대 옵션은 보수적으로 9.5%를 적용합니다.' },
  { q: '단리와 월복리 적금의 차이는?', a: '월복리는 매달 발생한 이자에도 다음 달 이자가 붙습니다. 1년 만기에서는 차이가 미미하지만 3년 이상 장기 적금에서는 복리가 유리합니다.' },
];
const RATES = [3, 3.5, 4, 4.5, 5, 6], MONTHLY = [10, 20, 30, 50, 100];
function quick() {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>월 납입 \\ 금리</th>${RATES.map((r) => `<th>${r}%</th>`).join('')}</tr></thead><tbody>${MONTHLY.map((m) => `<tr><td>${m}만원</td>${RATES.map((r) => `<td>${num(calcSavings({ monthly: m * 10000, months: 12, annualRate: r }).afterTaxInterest)}원</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const tool = {
  slug, name, short: '월 납입액·기간·금리로 만기 수령액과 세후 이자 계산',
  page({ config, tools }) {
    const title = '적금 이자 계산기 - 만기 수령액, 세후 이자 (단리·복리)';
    const description = '월 납입액과 기간, 금리를 입력하면 적금 만기 수령액과 세후 이자를 계산합니다. 일반과세·세금우대·비과세, 단리·월복리 선택 가능.';
    return {
      title, description, scripts: ['savings.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/savings/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>적금 이자 계산기</h1><p class="lead">매달 얼마씩 얼마나 모으면 만기에 얼마를 받는지 세후 기준으로 계산합니다.</p>
<div class="card"><div class="calc"><div>
${field({ id: 'monthly', label: '월 납입액', unit: '원', value: '500,000', chips: [10, 20, 30, 50, 100].map((v) => ({ l: `${v}만`, v: v * 10000 })) })}
<div class="row">${field({ id: 'months', label: '기간', unit: '개월', value: '12', chips: [6, 12, 24, 36].map((v) => ({ l: `${v}개월`, v })) })}${field({ id: 'rate', label: '연이율', unit: '%', value: '4.0', inputmode: 'decimal' })}</div>
<div class="row">${select({ id: 'compound', label: '이자 방식', value: 'simple', options: [{ v: 'simple', l: '단리' }, { v: 'compound', l: '월복리' }] })}${select({ id: 'taxType', label: '과세', value: 'normal', options: [{ v: 'normal', l: '일반과세 15.4%' }, { v: 'preferential', l: '세금우대 9.5%' }, { v: 'free', l: '비과세' }] })}</div>
</div><div class="result"><div class="sub">만기 수령액 (세후)</div><div class="big" id="r-net">-</div>
<table class="kv"><tbody><tr><td>원금 합계</td><td id="r-principal"></td></tr><tr><td>세전 이자</td><td id="r-interest"></td></tr><tr><td>이자소득세</td><td id="r-tax"></td></tr><tr class="total"><td>세후 이자</td><td id="r-after"></td></tr></tbody></table></div></div></div>
<h2>적금 이자 계산 공식</h2>
<p>단리 적금의 세전 이자는 <strong>월 납입액 × 연이율 ÷ 12 × (개월수 × (개월수 + 1) ÷ 2)</strong>입니다. 매달 50만원씩 12개월, 연 4% 라면 500,000 × 0.04 ÷ 12 × 78 = 130,000원이며, 15.4% 세금을 빼면 세후 이자는 109,980원입니다.</p>
${ad('inArticle')}
<h2>월 납입액·금리별 1년 세후 이자 (일반과세)</h2>${quick()}
<h2>적금 고르는 법</h2>
<ul><li><strong>우대금리 조건 확인</strong>: 급여이체, 카드 실적, 마케팅 동의 등 조건이 붙은 최고금리보다 기본금리를 먼저 봅니다.</li><li><strong>납입 한도</strong>: 고금리 특판은 월 20~30만원 한도가 많아 실제 이자는 몇만 원 수준입니다.</li><li><strong>예금자보호</strong>: 2025년 9월부터 금융회사당 1억원까지 보호됩니다.</li><li><strong>청년도약계좌·청년희망적금</strong> 등 정부 지원 상품은 비과세와 기여금이 있어 일반 적금보다 훨씬 유리합니다.</li></ul>
${affiliate({ title: '이번 달 최고금리 적금 비교', desc: '은행·저축은행 적금 금리를 한눈에 비교하고 바로 가입하세요.', url: '#', cta: '금리 비교' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
