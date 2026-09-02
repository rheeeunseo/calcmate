import { calcCompound } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'compound', name = '복리 계산기';
const faq = [
  { q: '72의 법칙이란?', a: '원금이 2배가 되는 기간을 빠르게 구하는 방법입니다. 72 ÷ 연수익률 = 기간(년). 연 6%면 12년, 연 8%면 9년 만에 2배가 됩니다.' },
  { q: '월 적립식 투자의 복리 효과는?', a: '매달 50만원을 연 7%로 30년 적립하면 원금 1억 8천만원이 약 6억 1천만원이 됩니다. 수익이 원금의 2배 이상으로, 기간이 길수록 복리 효과가 폭발적으로 커집니다.' },
  { q: '수익률에 세금은 어떻게 반영하나요?', a: '이 계산기는 세전 수익률 기준입니다. 국내 주식 매매차익은 비과세, 배당·이자는 15.4%, 해외주식 양도차익은 22%(250만원 공제) 이므로 실제 수익률을 조금 낮춰 입력하면 보수적으로 추정할 수 있습니다.' },
];
export const tool = {
  slug, name, short: '초기 투자금과 월 적립액의 장기 복리 수익 시뮬레이션',
  page({ config, tools }) {
    const title = '복리 계산기 - 월 적립식 투자 수익 시뮬레이션';
    const description = '초기 투자금과 월 적립액, 연 수익률, 기간을 입력하면 복리로 불어나는 자산을 연도별로 계산합니다. 72의 법칙과 적립식 투자 복리 효과.';
    const ex = calcCompound({ initial: 0, monthly: 500000, years: 30, annualRate: 7 });
    return {
      title, description, scripts: ['compound.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/compound/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>복리 계산기</h1><p class="lead">시간이 만드는 복리의 힘을 숫자로 확인하세요. 연도별 자산 증가를 표로 보여줍니다.</p>
<div class="card"><div class="calc"><div>
${field({ id: 'initial', label: '초기 투자금', unit: '원', value: '10,000,000' })}
${field({ id: 'monthly', label: '월 적립액', unit: '원', value: '500,000', chips: [10, 30, 50, 100].map((v) => ({ l: `${v}만`, v: v * 10000 })) })}
<div class="row">${field({ id: 'years', label: '투자 기간', unit: '년', value: '20', chips: [5, 10, 20, 30].map((v) => ({ l: `${v}년`, v })) })}${field({ id: 'rate', label: '연 수익률', unit: '%', value: '7', inputmode: 'decimal', chips: [3, 5, 7, 10].map((v) => ({ l: `${v}%`, v })) })}</div>
${select({ id: 'periods', label: '복리 주기', value: '12', options: [{ v: 12, l: '월복리' }, { v: 4, l: '분기복리' }, { v: 1, l: '연복리' }] })}
</div><div class="result"><div class="sub">최종 자산</div><div class="big" id="r-final">-</div>
<table class="kv"><tbody><tr><td>총 투자 원금</td><td id="r-contributed"></td></tr><tr class="total"><td>투자 수익</td><td id="r-gain"></td></tr><tr><td>원금 대비</td><td id="r-multiple"></td></tr></tbody></table></div></div>
<details style="margin-top:16px" open><summary style="cursor:pointer;font-weight:600">연도별 자산 추이</summary><div class="tbl-wrap" id="r-table"></div></details></div>
<h2>복리란?</h2>
<p>복리는 이자에 이자가 붙는 구조입니다. 원금 P를 연 r%로 n년 복리 운용하면 <strong>P × (1 + r)^n</strong>이 됩니다. 매달 50만원씩 연 7%로 30년 적립하면 원금 ${wonKo(ex.contributed)}이 ${wonKo(ex.final)}이 되어 수익 ${wonKo(ex.gain)}이 발생합니다. 같은 조건에서 10년만 투자하면 ${wonKo(calcCompound({ monthly: 500000, years: 10, annualRate: 7 }).final)}에 그칩니다. 시작 시점이 수익률보다 중요한 이유입니다.</p>
${ad('inArticle')}
<h2>수익률별 1억원 도달 기간 (월 50만원 적립)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>연 수익률</th><th>10년 후</th><th>20년 후</th><th>30년 후</th></tr></thead><tbody>${[3, 5, 7, 10].map((r) => `<tr><td>${r}%</td>${[10, 20, 30].map((y) => `<td>${num(calcCompound({ monthly: 500000, years: y, annualRate: r }).final)}원</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<h2>복리 효과를 극대화하려면</h2>
<ul><li><strong>일찍 시작</strong>: 25세에 시작한 사람이 35세에 시작한 사람보다 같은 월 적립액으로 은퇴 자산이 2배 가까이 많습니다.</li><li><strong>비용 최소화</strong>: 연 1% 수수료 차이는 30년 뒤 최종 자산의 20% 이상을 갉아먹습니다.</li><li><strong>세제 혜택 계좌</strong>: ISA, 연금저축, IRP 는 과세이연·비과세로 복리 효과를 키웁니다.</li></ul>
${affiliate({ title: '수수료 0원 적립식 투자 시작하기', desc: 'ETF 적립식 투자로 복리 효과를 누리세요.', url: '#', cta: '계좌 개설' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
