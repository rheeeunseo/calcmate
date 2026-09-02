import { num } from '../lib/format.mjs';
import { ad, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'vat', name = '부가세 계산기';
const faq = [
  { q: '공급가액과 합계금액의 차이는?', a: '공급가액은 부가세를 뺀 순수 물품·서비스 가격이고, 합계금액(공급대가)은 공급가액에 10% 부가세를 더한 실제 결제 금액입니다. 세금계산서에는 공급가액과 세액이 따로 표기됩니다.' },
  { q: '합계금액에서 부가세를 역산하는 방법은?', a: '합계금액 ÷ 1.1 = 공급가액, 합계금액 − 공급가액 = 부가세입니다. 110,000원이면 공급가액 100,000원, 부가세 10,000원입니다. 합계금액 × 10% 로 계산하면 틀립니다.' },
  { q: '간이과세자도 부가세 10%를 받나요?', a: '간이과세자(연매출 1억 400만원 미만)는 업종별 부가가치율(15~40%)에 10%를 곱한 낮은 세율을 납부하며, 세금계산서는 연매출 4,800만원 이상만 발급할 수 있습니다.' },
  { q: '부가세 신고 기한은?', a: '일반과세자는 1월 25일(2기 확정)과 7월 25일(1기 확정) 연 2회, 법인은 예정신고 포함 연 4회, 간이과세자는 1월 25일 연 1회 신고합니다.' },
];
export const tool = {
  slug, name, short: '공급가액 ↔ 부가세 ↔ 합계금액 즉시 변환',
  page({ config, tools }) {
    const title = '부가세 계산기 - 공급가액·부가세·합계금액 변환';
    const description = '공급가액에서 부가세 10%와 합계금액을, 또는 합계금액에서 공급가액과 부가세를 역산합니다. 세금계산서 발행, 프리랜서 견적, 부가세 신고에 활용하세요.';
    return {
      title, description, scripts: ['vat.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/vat/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>부가세 계산기</h1><p class="lead">금액을 입력하면 부가세 10% 포함·별도 금액을 바로 계산합니다.</p>
<div class="card"><div class="calc"><div>
${select({ id: 'mode', label: '입력 금액 종류', value: 'supply', options: [{ v: 'supply', l: '공급가액 (부가세 별도)' }, { v: 'total', l: '합계금액 (부가세 포함)' }] })}
${field({ id: 'amount', label: '금액', unit: '원', value: '1,000,000', chips: [{ l: '10만', v: 1e5 }, { l: '100만', v: 1e6 }, { l: '500만', v: 5e6 }, { l: '1000만', v: 1e7 }] })}
</div><div class="result"><div class="sub" id="r-label">합계금액</div><div class="big" id="r-main">-</div>
<table class="kv"><tbody><tr><td>공급가액</td><td id="r-supply"></td></tr><tr><td>부가세 (10%)</td><td id="r-vat"></td></tr><tr class="total"><td>합계금액</td><td id="r-total"></td></tr></tbody></table></div></div></div>
<h2>부가세 계산 방법</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>구하려는 값</th><th>공식</th><th>예시 (공급가액 100만원)</th></tr></thead><tbody>
<tr><td>부가세</td><td>공급가액 × 10%</td><td>100,000원</td></tr>
<tr><td>합계금액</td><td>공급가액 × 1.1</td><td>1,100,000원</td></tr>
<tr><td>공급가액 (역산)</td><td>합계금액 ÷ 1.1</td><td>1,100,000 ÷ 1.1 = 1,000,000원</td></tr>
<tr><td>부가세 (역산)</td><td>합계금액 × 10 ÷ 110</td><td>1,100,000 × 10 ÷ 110 = 100,000원</td></tr>
</tbody></table></div>
${ad('inArticle')}
<h2>자주 하는 실수</h2>
<ul><li><strong>합계금액 × 10%</strong>로 부가세를 구하면 실제보다 많이 계산됩니다. 반드시 ÷ 11 또는 × 10 ÷ 110 을 사용하세요.</li><li><strong>원 단위 절사</strong>: 세금계산서의 세액은 원 단위까지 표기하되, 신고 시 10원 미만은 절사합니다.</li><li><strong>면세 품목</strong>: 미가공 식료품, 의료, 교육, 도서 등은 부가세가 없으므로 계산서(세금계산서 아님)를 발행합니다.</li></ul>
<h2>매입세액공제 간단 계산</h2>
<p>납부할 부가세 = 매출세액 − 매입세액. 매출 5,000만원(세액 500만원), 매입 3,000만원(세액 300만원)이면 200만원을 납부합니다. 사업용 신용카드와 전자세금계산서를 챙기면 매입세액공제를 놓치지 않습니다.</p>
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
