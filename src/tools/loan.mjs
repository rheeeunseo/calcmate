import { calcLoan, monthlyPayment } from '../lib/loan.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'loan';
const name = '대출 이자 계산기';
const AMOUNTS = [3000, 5000, 10000, 15000, 20000, 30000, 40000, 50000]; // 만원
const RATES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 7];
const YEARS = [5, 10, 15, 20, 30, 40];
const label = (man) => man >= 10000 ? `${man / 10000}억${man % 10000 ? ' ' + num(man % 10000) + '만' : ''}` : `${num(man)}만`;

function calcForm(principal = 300_000_000, rate = 4.0, years = 30) {
  return `<div class="card"><div class="calc"><div>
    ${field({ id: 'principal', label: '대출 금액', unit: '원', value: num(principal), chips: [{ l: '5천만', v: 5e7 }, { l: '1억', v: 1e8 }, { l: '2억', v: 2e8 }, { l: '3억', v: 3e8 }, { l: '5억', v: 5e8 }] })}
    <div class="row">${field({ id: 'rate', label: '연이율', unit: '%', value: rate, inputmode: 'decimal' })}
    ${field({ id: 'years', label: '상환 기간', unit: '년', value: years, chips: YEARS.map((y) => ({ l: `${y}년`, v: y })) })}</div>
    <div class="row">${select({ id: 'method', label: '상환 방식', value: 'equalPayment', options: [{ v: 'equalPayment', l: '원리금균등' }, { v: 'equalPrincipal', l: '원금균등' }, { v: 'bullet', l: '만기일시' }] })}
    ${field({ id: 'grace', label: '거치 기간', unit: '개월', value: '0' })}</div>
  </div><div class="result">
    <div class="sub" id="r-label">월 상환액 (첫 달)</div><div class="big" id="r-monthly">-</div>
    <table class="kv"><tbody>
      <tr><td>대출 원금</td><td id="r-principal"></td></tr>
      <tr><td>총 이자</td><td id="r-interest"></td></tr>
      <tr class="total"><td>총 상환액</td><td id="r-total"></td></tr>
      <tr><td>마지막 달 상환액</td><td id="r-last"></td></tr>
    </tbody></table>
  </div></div>
  <details style="margin-top:16px"><summary style="cursor:pointer;font-weight:600">월별 상환 스케줄 보기</summary><div class="tbl-wrap" id="r-schedule"></div></details>
  </div>`;
}

function matrix(principalWon) {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>금리 \\ 기간</th>${YEARS.map((y) => `<th>${y}년</th>`).join('')}</tr></thead><tbody>${RATES.map((r) => `<tr><td>${r.toFixed(1)}%</td>${YEARS.map((y) => `<td>${num(monthlyPayment(principalWon, r, y * 12))}원</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

const faq = [
  { q: '원리금균등과 원금균등 중 무엇이 유리한가요?', a: '총 이자는 원금균등이 적습니다. 원금을 매달 같은 금액으로 갚아 잔액이 빠르게 줄기 때문입니다. 다만 초기 상환 부담이 크므로 초반 현금흐름이 빠듯하면 매달 같은 금액을 내는 원리금균등이 관리하기 편합니다.' },
  { q: '거치 기간이란 무엇인가요?', a: '원금을 갚지 않고 이자만 내는 기간입니다. 거치 기간 동안 원금이 줄지 않으므로 총 이자는 늘어나지만 초기 부담이 가볍습니다. 거치가 끝나면 남은 기간에 원금을 나눠 갚아 월 상환액이 급증할 수 있습니다.' },
  { q: '중도상환수수료는 계산에 포함되나요?', a: '포함되지 않습니다. 은행별로 대출 후 3년 이내 상환 시 잔액의 0.5~1.4% 수준 수수료가 붙으며, 2025년 1월부터 주택담보대출 수수료는 평균 0.5%대로 인하되었습니다.' },
  { q: 'DSR 규제와 상환 방식은 어떤 관계인가요?', a: 'DSR(총부채원리금상환비율)은 연간 원리금 상환액을 연소득으로 나눈 값으로 은행권 40%가 한도입니다. 상환 기간이 길수록 연 상환액이 줄어 DSR 이 낮아지지만, 스트레스 DSR 적용으로 실제 가산금리가 붙어 한도가 줄어듭니다.' },
];

function seoBody() {
  return `
<h2>상환 방식별 차이</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>방식</th><th>월 상환액</th><th>총 이자</th><th>적합한 경우</th></tr></thead><tbody>
<tr><td>원리금균등</td><td>매달 동일</td><td>중간</td><td>일정한 소득, 예산 관리 우선</td></tr>
<tr><td>원금균등</td><td>초기 많고 점차 감소</td><td>가장 적음</td><td>초기 여유 자금이 있어 이자 절감 우선</td></tr>
<tr><td>만기일시</td><td>이자만 납부</td><td>가장 많음</td><td>단기 자금, 만기 시 목돈 상환 계획</td></tr>
</tbody></table></div>
<p>예를 들어 3억원을 연 4%로 30년간 빌리면 원리금균등은 매달 ${num(monthlyPayment(3e8, 4, 360))}원씩 총 이자 ${wonKo(calcLoan({ principal: 3e8, annualRate: 4, months: 360 }).totalInterest)}, 원금균등은 첫 달 ${num(calcLoan({ principal: 3e8, annualRate: 4, months: 360, method: 'equalPrincipal' }).firstPayment)}원에서 시작해 총 이자 ${wonKo(calcLoan({ principal: 3e8, annualRate: 4, months: 360, method: 'equalPrincipal' }).totalInterest)}입니다.</p>
${ad('inArticle')}
<h2>대출 금액별 월 상환액 빠른 조회</h2>
<p>원리금균등 기준. 금액을 클릭하면 금리·기간별 상세표를 볼 수 있습니다.</p>
<div class="pill-list">${AMOUNTS.map((a) => `<a href="${base}/loan/${a}/">${label(a)}원 대출</a>`).join('')}</div>
<h2>대출 이자를 줄이는 방법</h2>
<ul>
<li><strong>금리 비교</strong>: 같은 담보라도 은행별로 0.5%p 이상 차이가 납니다. 3억 30년 기준 0.5%p 는 총 이자 약 ${wonKo(calcLoan({ principal: 3e8, annualRate: 4.5, months: 360 }).totalInterest - calcLoan({ principal: 3e8, annualRate: 4, months: 360 }).totalInterest)} 차이입니다.</li>
<li><strong>대환대출 활용</strong>: 온라인 대환대출 인프라로 앱에서 금리 비교 후 갈아탈 수 있습니다.</li>
<li><strong>금리인하요구권</strong>: 승진·소득 증가·신용점수 상승 시 은행에 금리 인하를 요구할 수 있는 법적 권리입니다.</li>
<li><strong>원금 조기 상환</strong>: 중도상환수수료 면제 시점(보통 3년) 이후 여유 자금으로 원금을 갚으면 이자가 크게 줄어듭니다.</li>
</ul>
${affiliate({ title: '내 조건에 맞는 최저금리 대출 비교', desc: '여러 금융사의 금리와 한도를 한 번에 조회하세요. 조회만으로는 신용점수에 영향이 없습니다.', url: '#', cta: '금리 비교하기' })}
${faqHtml(faq)}`;
}

export const tool = {
  slug, name,
  short: '원리금균등·원금균등·만기일시 월 상환액과 총 이자, 상환 스케줄',
  page({ config, tools }) {
    const title = '대출 이자 계산기 - 원리금균등·원금균등 월 상환액, 총 이자';
    const description = '대출 금액, 금리, 기간을 입력하면 원리금균등·원금균등·만기일시 상환 방식별 월 상환액과 총 이자, 월별 상환 스케줄을 계산합니다. 주택담보대출·신용대출 이자 계산.';
    return {
      title, description, scripts: ['loan.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/loan/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>대출 이자 계산기</h1><p class="lead">주택담보대출, 신용대출, 전세대출의 월 상환액과 총 이자를 상환 방식별로 계산합니다.</p>${calcForm()}${seoBody()}${relatedTools(tools, slug)}`,
    };
  },
  pages({ tools }) {
    return AMOUNTS.map((a) => {
      const p = a * 10000;
      const r30 = calcLoan({ principal: p, annualRate: 4, months: 360 });
      const title = `${label(a)}원 대출 이자 계산 - 금리·기간별 월 상환액 표`;
      const description = `${label(a)}원 대출 시 금리 3~7%, 기간 5~40년별 월 상환액 표. 연 4% 30년 원리금균등 기준 월 ${num(r30.monthlyPayment)}원, 총 이자 ${wonKo(r30.totalInterest)}.`;
      return {
        path: `/loan/${a}/`, title, description, scripts: ['loan.js'], jsonld: [faqJsonld(faq.slice(0, 2))],
        content: `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/loan/' }, { name: `${label(a)}원 대출` }])}
<h1>${label(a)}원 대출 이자 계산</h1>
<p class="lead">${label(a)}원을 연 4%로 30년간 원리금균등 상환하면 <strong>매달 ${num(r30.monthlyPayment)}원</strong>, 총 이자는 ${wonKo(r30.totalInterest)}입니다. 아래 표에서 금리와 기간에 따른 월 상환액을 비교하세요.</p>
<h2>${label(a)}원 금리·기간별 월 상환액 (원리금균등)</h2>${matrix(p)}
${ad('top')}
<h2>조건 직접 입력해서 계산하기</h2>${calcForm(p, 4, 30)}
<h2>${label(a)}원 대출 상환 방식 비교 (연 4%, 30년)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>방식</th><th>첫 달 상환액</th><th>마지막 달</th><th>총 이자</th><th>총 상환액</th></tr></thead><tbody>${['equalPayment', 'equalPrincipal', 'bullet'].map((m) => { const r = calcLoan({ principal: p, annualRate: 4, months: 360, method: m }); return `<tr><td>${{ equalPayment: '원리금균등', equalPrincipal: '원금균등', bullet: '만기일시' }[m]}</td><td>${num(r.firstPayment)}원</td><td>${num(r.lastPayment)}원</td><td>${num(r.totalInterest)}원</td><td>${num(r.totalPayment)}원</td></tr>`; }).join('')}</tbody></table></div>
<p>${label(a)}원 대출의 월 상환액이 소득 대비 부담스럽다면 기간을 늘리거나(단 총 이자 증가) 금리를 0.5%p 만 낮춰도 30년 기준 총 이자를 ${wonKo(calcLoan({ principal: p, annualRate: 4.5, months: 360 }).totalInterest - r30.totalInterest)} 줄일 수 있습니다.</p>
<h2>다른 금액 대출 계산</h2><div class="pill-list">${AMOUNTS.filter((x) => x !== a).map((x) => `<a href="${base}/loan/${x}/">${label(x)}원</a>`).join('')}</div>
${ad('inArticle')}${faqHtml(faq.slice(0, 2))}${relatedTools(tools, slug)}`,
      };
    });
  },
};
