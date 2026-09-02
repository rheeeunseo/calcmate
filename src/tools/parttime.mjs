import { calcParttime, MIN_WAGE } from '../lib/labor.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'parttime', name = '알바 월급 계산기 (주휴수당)';
const YEAR = MIN_WAGE.year;
const WAGES = [10320, 11000, 12000, 13000, 15000, 20000];

function calcForm(hourly = MIN_WAGE.hourly) {
  return `<div class="card"><div class="calc"><div>
${field({ id: 'hourly', label: '시급', unit: '원', value: num(hourly), hint: `${YEAR}년 최저시급 ${num(MIN_WAGE.hourly)}원`, chips: WAGES.map((w) => ({ l: w === MIN_WAGE.hourly ? '최저시급' : num(w), v: w })) })}
<div class="row">${field({ id: 'hoursPerDay', label: '하루 근무시간', unit: '시간', value: '8', inputmode: 'decimal', chips: [4, 5, 6, 8].map((v) => ({ l: `${v}시간`, v })) })}${field({ id: 'daysPerWeek', label: '주 근무일수', unit: '일', value: '5', chips: [2, 3, 5, 6].map((v) => ({ l: `${v}일`, v })) })}</div>
<div class="row">${field({ id: 'night', label: '주당 야간근무', unit: '시간', value: '0', inputmode: 'decimal', hint: '22시~06시, 5인 이상 사업장 50% 가산' })}${select({ id: 'tax', label: '공제', value: 'none', options: [{ v: 'none', l: '공제 없음' }, { v: 'freelancer', l: '3.3% 원천징수' }, { v: 'insurance', l: '4대보험 (약 9.4%)' }] })}</div>
</div><div class="result"><div class="sub">월 예상 급여</div><div class="big" id="r-net">-</div>
<div class="sub" id="r-holiday-msg"></div>
<table class="kv"><tbody>
<tr><td>주 근무시간</td><td id="r-weekly"></td></tr>
<tr><td>기본급 (월)</td><td id="r-base"></td></tr>
<tr><td>주휴수당 (월)</td><td id="r-holiday"></td></tr>
<tr><td>야간수당 (월)</td><td id="r-night"></td></tr>
<tr><td>공제</td><td id="r-ded"></td></tr>
<tr class="total"><td>월 실수령</td><td id="r-total"></td></tr>
<tr><td>일급</td><td id="r-daily"></td></tr>
</tbody></table><div class="notice" id="r-note">월 환산은 주 평균 4.345주 기준</div></div></div></div>`;
}

const faq = [
  { q: '주휴수당은 누가 받나요?', a: '1주 소정근로시간이 15시간 이상이고 그 주에 정해진 근무일을 모두 출근한 근로자는 사업장 규모와 관계없이 주휴수당을 받습니다. 아르바이트, 계약직, 단시간 근로자도 동일합니다.' },
  { q: '주휴수당은 어떻게 계산하나요?', a: '주 40시간 이상이면 8시간분 시급, 40시간 미만이면 (주 근무시간 ÷ 40) × 8시간 × 시급입니다. 주 20시간 근무면 4시간분, 즉 최저시급 기준 41,280원이 매주 추가됩니다.' },
  { q: `${YEAR}년 최저임금 월급은 얼마인가요?`, a: `시급 ${num(MIN_WAGE.hourly)}원에 주휴수당을 포함한 월 209시간 기준 ${num(MIN_WAGE.monthly209)}원입니다. 하루 8시간, 주 5일 근무 기준입니다.` },
  { q: '3.3%를 떼는 게 맞나요?', a: '3.3%는 사업소득 원천징수로 프리랜서에게 적용됩니다. 근로계약을 맺고 정해진 시간에 출근하는 아르바이트는 근로자이므로 원칙적으로 4대보험 가입 대상이며, 월 60시간 미만 단기 근로는 일부 보험이 제외될 수 있습니다. 3.3%를 뗐더라도 5월 종합소득세 신고로 대부분 환급받을 수 있습니다.' },
  { q: '야간·연장·휴일수당은 언제 붙나요?', a: '5인 이상 사업장에서 밤 10시~아침 6시 근무는 50% 가산, 하루 8시간 또는 주 40시간을 넘는 연장근무도 50% 가산, 휴일근무는 8시간까지 50%, 초과분 100% 가산됩니다. 5인 미만 사업장은 가산수당 의무가 없습니다.' },
];

function wageTable(hl) {
  return `<div class="tbl-wrap"><table class="grid"><thead><tr><th>시급</th><th>주 40시간 (주휴 포함 209h)</th><th>주 30시간</th><th>주 20시간</th><th>주 15시간</th></tr></thead><tbody>${WAGES.map((w) => `<tr${w === hl ? ' class="hl"' : ''}><td><a href="${base}/parttime/${w}/">${num(w)}원</a></td>${[[8, 5], [6, 5], [5, 4], [5, 3]].map(([h, d]) => `<td>${num(calcParttime({ hourly: w, hoursPerDay: h, daysPerWeek: d }).monthlyGross)}원</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function seoBody(hl) {
  return `<h2>알바 월급 계산 방법</h2>
<p><strong>월급 = (주 근무시간 + 주휴시간) × 4.345주 × 시급</strong> 입니다. 하루 8시간 주 5일이면 주 40시간에 주휴 8시간을 더한 48시간 × 4.345 = 약 209시간이 되어, ${YEAR}년 최저시급 ${num(MIN_WAGE.hourly)}원 기준 월 ${num(MIN_WAGE.monthly209)}원입니다. 주휴수당을 빼고 계산하면 월 ${num(MIN_WAGE.hourly * 174)}원으로 36만원 넘게 차이가 납니다.</p>
<h3>주휴수당 계산</h3>
<ul><li>주 15시간 이상 근무 + 소정근로일 개근 시 발생</li><li>주 40시간 이상: 8시간 × 시급 (최저시급 기준 주 ${num(MIN_WAGE.hourly * 8)}원)</li><li>주 40시간 미만: (주 근무시간 ÷ 40) × 8 × 시급</li><li>주 15시간 미만: 주휴수당 없음</li></ul>
${ad('inArticle')}
<h2>시급·근무시간별 월급 (${YEAR}년, 주휴 포함, 세전)</h2>${wageTable(hl)}
<h2>알바생이 꼭 확인할 것</h2>
<ul><li><strong>근로계약서</strong>: 시급, 근무시간, 주휴일을 서면으로 받으세요. 미작성 시 사업주에게 과태료가 부과됩니다.</li><li><strong>최저임금 위반</strong>: 시급이 ${num(MIN_WAGE.hourly)}원 미만이거나 주휴수당을 주지 않으면 고용노동부에 진정할 수 있습니다. 수습 기간이라도 1년 이상 계약이 아니면 최저임금의 90% 미만으로 줄 수 없습니다.</li><li><strong>임금명세서</strong>: 2021년 11월부터 모든 사업장이 급여 지급 시 명세서를 교부해야 합니다.</li><li><strong>퇴직금</strong>: 주 15시간 이상, 1년 이상 근무한 알바도 퇴직금을 받습니다. <a href="${base}/severance/">퇴직금 계산기</a>에서 확인하세요.</li></ul>
${affiliate({ title: '알바 급여 자동 계산·근태 관리 앱', desc: '출퇴근 기록으로 주휴수당·야간수당까지 자동 계산.', url: '#', cta: '앱 보기' })}
${faqHtml(faq)}`;
}

export const tool = {
  slug, name, short: `시급·근무시간으로 주휴수당 포함 월급 계산 (${YEAR}년 최저임금 반영)`,
  page({ config, tools }) {
    const title = `알바 월급 계산기 - 주휴수당 포함 ${YEAR}년 최저임금 월급`;
    const description = `시급과 하루 근무시간, 주 근무일수를 입력하면 주휴수당과 야간수당을 포함한 월급을 계산합니다. ${YEAR}년 최저시급 ${num(MIN_WAGE.hourly)}원, 월 ${num(MIN_WAGE.monthly209)}원 기준.`;
    return {
      title, description, scripts: ['parttime.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/parttime/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>알바 월급 계산기</h1><p class="lead">시급과 근무시간을 넣으면 주휴수당까지 포함한 한 달 급여를 계산합니다.</p>${calcForm()}${seoBody(null)}${relatedTools(tools, slug)}`,
    };
  },
  pages({ tools }) {
    return WAGES.map((w) => {
      const full = calcParttime({ hourly: w, hoursPerDay: 8, daysPerWeek: 5 });
      const half = calcParttime({ hourly: w, hoursPerDay: 5, daysPerWeek: 4 });
      const isMin = w === MIN_WAGE.hourly;
      const title = `시급 ${num(w)}원 월급 계산 - 주휴수당 포함 월 ${num(Math.round(full.monthlyGross / 10000))}만원${isMin ? ` (${YEAR}년 최저임금)` : ''}`;
      const description = `시급 ${num(w)}원으로 하루 8시간 주 5일 일하면 주휴수당 포함 월 ${num(full.monthlyGross)}원, 주 20시간이면 월 ${num(half.monthlyGross)}원입니다. 근무시간별 월급 표와 주휴수당 계산법.`;
      return {
        path: `/parttime/${w}/`, title, description, scripts: ['parttime.js'], jsonld: [faqJsonld(faq.slice(0, 2))],
        content: `${breadcrumb([{ name: '홈', href: '/' }, { name, href: '/parttime/' }, { name: `시급 ${num(w)}원` }])}
<h1>시급 ${num(w)}원 월급 계산${isMin ? ` (${YEAR}년 최저임금)` : ''}</h1>
<p class="lead">시급 ${num(w)}원으로 하루 8시간, 주 5일 근무하면 <strong>주휴수당 포함 월 ${wonKo(full.monthlyGross)}</strong>, 일급은 ${num(full.dailyPay)}원입니다. 주 20시간(하루 5시간 × 4일)이면 월 ${wonKo(half.monthlyGross)}입니다.</p>
<div class="card"><h2 style="margin-top:0">시급 ${num(w)}원 근무 형태별 월급</h2><div class="tbl-wrap"><table class="grid"><thead><tr><th>근무 형태</th><th>주 시간</th><th>주휴시간</th><th>월 환산시간</th><th>월급 (세전)</th></tr></thead><tbody>${[['풀타임 8h × 5일', 8, 5], ['6h × 5일', 6, 5], ['5h × 5일', 5, 5], ['5h × 4일', 5, 4], ['4h × 5일', 4, 5], ['5h × 3일', 5, 3], ['4h × 3일 (주휴 없음)', 4, 3], ['8h × 6일', 8, 6]].map(([l, h, d]) => { const r = calcParttime({ hourly: w, hoursPerDay: h, daysPerWeek: d }); return `<tr><td>${l}</td><td>${r.weeklyHours}h</td><td>${r.holidayHours}h</td><td>${r.monthlyHours}h</td><td>${num(r.monthlyGross)}원</td></tr>`; }).join('')}</tbody></table></div></div>
${ad('top')}
<h2>조건 바꿔서 계산하기</h2>${calcForm(w)}
<h2>시급 ${num(w)}원 주휴수당</h2>
<p>주 40시간 이상 근무 시 주휴수당은 8시간 × ${num(w)}원 = <strong>주 ${num(w * 8)}원</strong>, 한 달이면 약 ${num(Math.round(w * 8 * 4.345))}원입니다. 주 20시간이면 4시간분인 주 ${num(w * 4)}원입니다. ${isMin ? `${YEAR}년 최저시급이므로 이보다 적게 받으면 최저임금법 위반입니다.` : `${YEAR}년 최저시급 ${num(MIN_WAGE.hourly)}원보다 ${num(w - MIN_WAGE.hourly)}원 높은 시급으로, 풀타임 기준 월 ${num(full.monthlyGross - MIN_WAGE.monthly209)}원을 더 받습니다.`}</p>
<h2>다른 시급 비교</h2>${wageTable(w)}
${ad('inArticle')}${faqHtml(faq.slice(0, 2))}${relatedTools(tools, slug)}`,
      };
    });
  },
};
