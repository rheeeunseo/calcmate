import { calcSalary, RATES_2026 } from '../lib/salary.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base, esc } from '../lib/html.mjs';

const slug = 'salary';
const name = '연봉 실수령액 계산기';
const YEAR = RATES_2026.year;
const man = (n) => num(n / 10_000);

// 프로그래매틱 페이지 대상 연봉 (만원): 2,000~10,000 은 100 단위, 이후 500 단위, 2억까지
const TARGETS = [];
for (let a = 2000; a <= 10000; a += 100) TARGETS.push(a);
for (let a = 10500; a <= 20000; a += 500) TARGETS.push(a);

function calcForm(annualWon) {
  return `<div class="card"><div class="calc"><div>
    ${field({ id: 'annual', label: '연봉', unit: '원', value: num(annualWon), hint: '세전 연봉 (상여 포함 총액)', chips: [3000, 4000, 5000, 6000, 8000, 10000].map((v) => ({ l: v / 1000 >= 10 ? '1억' : `${v}만`, v: v * 10000 })) })}
    <div class="row">${field({ id: 'nonTaxable', label: '월 비과세액', unit: '원', value: '200,000', hint: '식대 20만원 등' })}
    ${field({ id: 'dependents', label: '부양가족 수', unit: '본인 포함', value: '1' })}</div>
    ${field({ id: 'children', label: '8~20세 자녀 수', value: '0' })}
  </div><div class="result">
    <div class="sub">월 예상 실수령액</div><div class="big" id="r-net">-</div>
    <div class="sub">연 실수령액 <strong id="r-annualNet">-</strong> · 공제율 <strong id="r-rate">-</strong></div>
    <table class="kv"><tbody>
      <tr><td>월 세전 급여</td><td id="r-gross"></td></tr>
      <tr><td>국민연금 (${(RATES_2026.pension * 100).toFixed(2)}%)</td><td id="r-pension"></td></tr>
      <tr><td>건강보험 (${(RATES_2026.health * 100).toFixed(3)}%)</td><td id="r-health"></td></tr>
      <tr><td class="indent">장기요양보험</td><td id="r-ltc"></td></tr>
      <tr><td>고용보험 (${(RATES_2026.employment * 100).toFixed(1)}%)</td><td id="r-emp"></td></tr>
      <tr><td>소득세</td><td id="r-tax"></td></tr>
      <tr><td class="indent">지방소득세</td><td id="r-local"></td></tr>
      <tr class="total"><td>공제 합계</td><td id="r-ded"></td></tr>
    </tbody></table>
    <div class="notice">${YEAR}년 4대보험 요율 적용 · 간이세액표 기준 예상치</div>
  </div></div></div>`;
}

function breakdownTable(r) {
  return `<table class="kv"><tbody>
    <tr><td>월 세전 급여</td><td>${wonKo(r.monthlyGross)}</td></tr>
    <tr><td>국민연금</td><td>-${num(r.pension)}원</td></tr>
    <tr><td>건강보험</td><td>-${num(r.health)}원</td></tr>
    <tr><td class="indent">장기요양보험</td><td>-${num(r.longTermCare)}원</td></tr>
    <tr><td>고용보험</td><td>-${num(r.employment)}원</td></tr>
    <tr><td>소득세</td><td>-${num(r.incomeTax)}원</td></tr>
    <tr><td class="indent">지방소득세</td><td>-${num(r.localTax)}원</td></tr>
    <tr class="total"><td>월 실수령액</td><td>${wonKo(r.monthlyNet)}</td></tr>
  </tbody></table>`;
}

function rangeTable(list, hl) {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>연봉</th><th>월 실수령액</th><th>월 공제액</th><th>연 실수령액</th><th>공제율</th></tr></thead><tbody>${list.map((a) => {
    const r = calcSalary({ annual: a * 10000 });
    return `<tr${a === hl ? ' class="hl"' : ''}><td><a href="${base}/salary/${a}/">${man(a * 10000)}만원</a></td><td>${num(r.monthlyNet)}원</td><td>${num(r.totalDeduction)}원</td><td>${num(r.annualNet)}원</td><td>${(r.deductionRate * 100).toFixed(1)}%</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

const faq = [
  { q: '연봉 실수령액은 어떻게 계산하나요?', a: '세전 연봉을 12로 나눈 월급에서 국민연금, 건강보험(장기요양 포함), 고용보험의 근로자 부담분과 근로소득세, 지방소득세를 차감한 금액이 실수령액입니다. 소득세는 국세청 간이세액표 기준으로 원천징수됩니다.' },
  { q: `${YEAR}년 4대보험 요율은 얼마인가요?`, a: `근로자 부담 기준 국민연금 ${(RATES_2026.pension * 100).toFixed(2)}%, 건강보험 ${(RATES_2026.health * 100).toFixed(3)}%, 장기요양보험은 건강보험료의 ${(RATES_2026.longTermCare * 100).toFixed(2)}%, 고용보험 0.9%입니다. 국민연금은 2026년부터 매년 0.5%p씩 인상되어 2033년 9.5%(근로자 4.75%→6.5%)까지 오릅니다.` },
  { q: '계산 결과가 실제 급여명세서와 다른 이유는?', a: '회사마다 비과세 항목(식대, 차량유지비, 연구활동비 등), 상여금 지급 방식, 부양가족 신고 내용이 달라 수천 원에서 수만 원까지 차이가 날 수 있습니다. 또한 국민연금은 전년도 소득 기준으로 부과되므로 입사 첫해와 이듬해 금액이 다를 수 있습니다.' },
  { q: '비과세 식대는 얼마까지 인정되나요?', a: '2023년부터 월 20만원까지 비과세됩니다. 비과세액이 커질수록 4대보험료와 소득세가 모두 줄어 실수령액이 늘어납니다.' },
  { q: '연말정산을 하면 돌려받나요?', a: '매월 원천징수된 소득세는 예납 성격이며, 연말정산에서 신용카드·의료비·보험료·주택자금 등 공제를 반영해 최종 세액을 확정합니다. 공제가 많으면 환급, 적으면 추가 납부합니다.' },
];

function seoBody(current) {
  return `
<h2>연봉 실수령액 계산 방법</h2>
<p>실수령액은 <strong>세전 월급 − (4대보험 근로자 부담분 + 소득세 + 지방소득세)</strong>로 계산합니다. 4대보험은 급여에 정해진 요율을 곱해 산출하고, 소득세는 근로소득공제·인적공제·연금보험료공제 등을 차감한 과세표준에 6~45% 누진세율을 적용한 뒤 근로소득세액공제를 빼서 구합니다. 지방소득세는 소득세의 10%입니다.</p>
<h3>${YEAR}년 공제 항목별 요율 (근로자 부담)</h3>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>항목</th><th>요율</th><th>비고</th></tr></thead><tbody>
<tr><td>국민연금</td><td>${(RATES_2026.pension * 100).toFixed(2)}%</td><td>기준소득월액 상한 ${num(RATES_2026.pensionMaxMonthly)}원</td></tr>
<tr><td>건강보험</td><td>${(RATES_2026.health * 100).toFixed(3)}%</td><td>회사와 50:50 부담</td></tr>
<tr><td>장기요양보험</td><td>건강보험료의 ${(RATES_2026.longTermCare * 100).toFixed(2)}%</td><td></td></tr>
<tr><td>고용보험</td><td>0.9%</td><td>실업급여 계정</td></tr>
<tr><td>소득세</td><td>6~45% 누진</td><td>간이세액표 원천징수</td></tr>
<tr><td>지방소득세</td><td>소득세의 10%</td><td></td></tr>
</tbody></table></div>
${ad('inArticle')}
<h2>연봉별 실수령액 표 (${YEAR}년, 부양가족 1인 기준)</h2>
<p>비과세 식대 월 20만원, 부양가족 본인 1인 기준 예상치입니다. 연봉을 클릭하면 상세 내역을 볼 수 있습니다.</p>
${rangeTable(TARGETS.filter((a) => a % 500 === 0), current)}
<h2>실수령액을 늘리는 방법</h2>
<ul>
<li><strong>비과세 항목 활용</strong>: 식대(월 20만원), 자가운전보조금(월 20만원), 출산·보육수당(월 20만원), 연구활동비 등은 세금과 4대보험이 붙지 않습니다.</li>
<li><strong>부양가족 등록</strong>: 소득이 없는 배우자·부모·자녀를 부양가족으로 신고하면 인적공제로 원천징수 소득세가 줄어듭니다.</li>
<li><strong>연말정산 공제 준비</strong>: 연금저축·IRP(최대 900만원 세액공제), 월세 세액공제, 신용카드 소득공제 등을 챙기면 이듬해 2월에 환급받을 수 있습니다.</li>
</ul>
${affiliate({ title: '연말정산 환급을 늘리는 첫걸음, 연금저축·IRP', desc: '연 900만원까지 13.2~16.5% 세액공제. 소득이 높을수록 절세 효과가 큽니다.', url: '#', cta: '상품 비교하기' })}
${faqHtml(faq)}`;
}

export const tool = {
  slug, name,
  short: '세전 연봉으로 4대보험·소득세 공제 후 월 실수령액을 계산',
  page({ config, tools }) {
    const title = `${YEAR}년 연봉 실수령액 계산기 - 4대보험·소득세 공제 후 월급`;
    const description = `${YEAR}년 최신 4대보험 요율과 간이세액표로 연봉 실수령액을 바로 계산합니다. 국민연금·건강보험·고용보험·소득세 공제 내역과 연봉별 실수령액 표 제공.`;
    return {
      title, description,
      scripts: ['salary.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/salary/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>${YEAR}년 연봉 실수령액 계산기</h1><p class="lead">연봉을 입력하면 4대보험과 소득세를 뺀 월 실수령액을 즉시 계산합니다.</p>${calcForm(50_000_000)}${seoBody(null)}${relatedTools(tools, slug)}`,
    };
  },
  pages({ config, tools }) {
    return TARGETS.map((a) => {
      const annual = a * 10000;
      const r = calcSalary({ annual });
      const label = a >= 10000 ? `${a / 10000}억${a % 10000 ? ' ' + num(a % 10000) + '만' : ''}` : `${num(a)}만`;
      const title = `연봉 ${label}원 실수령액 (${YEAR}년) - 월 ${man(Math.round(r.monthlyNet / 10000) * 10000)}만원`;
      const description = `연봉 ${label}원의 ${YEAR}년 월 실수령액은 약 ${num(r.monthlyNet)}원입니다. 국민연금 ${num(r.pension)}원, 건강보험 ${num(r.health)}원, 소득세 ${num(r.incomeTax)}원 등 공제 내역과 연봉별 비교표를 확인하세요.`;
      const neighbors = TARGETS.filter((x) => Math.abs(x - a) <= (a > 10000 ? 1500 : 300));
      const content = `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/salary/' }, { name: `연봉 ${label}원` }])}
<h1>연봉 ${label}원 실수령액 (${YEAR}년)</h1>
<p class="lead">연봉 ${label}원이면 월 세전 ${wonKo(r.monthlyGross)}에서 ${wonKo(r.totalDeduction)}이 공제되어 <strong>월 실수령액은 약 ${wonKo(r.monthlyNet)}</strong>입니다. 연간으로는 ${wonKo(r.annualNet)}을 받습니다.</p>
<div class="card"><h2 style="margin-top:0">연봉 ${label}원 공제 내역</h2>${breakdownTable(r)}<div class="notice">비과세 20만원, 부양가족 본인 1인, ${YEAR}년 요율 기준. 아래 계산기에서 조건을 바꿔보세요.</div></div>
${ad('top')}
<h2>조건 바꿔서 다시 계산하기</h2>
${calcForm(annual)}
<h2>연봉 ${label}원 세금 분석</h2>
<p>연봉 ${label}원의 경우 근로소득공제와 인적공제, 연금·보험료 공제를 거친 과세표준은 약 ${wonKo(r.taxBase)}로, ${r.taxBase <= 14e6 ? '6% 세율 구간' : r.taxBase <= 50e6 ? '15% 세율 구간(누진공제 126만원)' : r.taxBase <= 88e6 ? '24% 세율 구간(누진공제 576만원)' : r.taxBase <= 150e6 ? '35% 세율 구간(누진공제 1,544만원)' : '38% 이상 세율 구간'}에 해당합니다. 월 소득세 ${num(r.incomeTax)}원과 지방소득세 ${num(r.localTax)}원을 합해 세금으로 ${num(r.incomeTax + r.localTax)}원, 4대보험으로 ${num(r.insurance)}원이 빠져나가며 총 공제율은 ${(r.deductionRate * 100).toFixed(1)}%입니다.</p>
<p>같은 연봉이라도 부양가족이 2명이면 월 소득세가 약 ${num(r.incomeTax - calcSalary({ annual, dependents: 2 }).incomeTax)}원 줄고, 비과세 식대가 없으면 실수령액이 약 ${num(r.monthlyNet - calcSalary({ annual, nonTaxable: 0 }).monthlyNet)}원 감소합니다.</p>
<h2>비슷한 연봉 실수령액 비교</h2>
${rangeTable(neighbors, a)}
<p><a href="${base}/salary/">← 전체 연봉별 실수령액 표 보기</a></p>
${ad('inArticle')}
${faqHtml(faq.slice(0, 3))}
${relatedTools(tools, slug)}`;
      return {
        path: `/salary/${a}/`, title, description, content, scripts: ['salary.js'],
        jsonld: [faqJsonld(faq.slice(0, 3))],
      };
    });
  },
};
