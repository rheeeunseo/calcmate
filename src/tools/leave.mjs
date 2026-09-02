import { annualLeaveForYears } from '../lib/labor.mjs';
import { ad, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'leave', name = '연차 계산기';
const faq = [
  { q: '입사 1년 미만인데 연차가 있나요?', a: '있습니다. 한 달 개근할 때마다 1일씩 최대 11일이 발생하며, 입사일로부터 1년 안에 사용해야 합니다. 1년이 되는 날 15일이 새로 발생합니다.' },
  { q: '입사일 기준과 회계연도 기준의 차이는?', a: '법은 입사일 기준이 원칙이지만 회사는 관리 편의상 매년 1월 1일에 일괄 부여하는 회계연도 기준을 쓸 수 있습니다. 회계연도 기준은 입사 다음 해 1월 1일에 전년도 재직일수에 비례한 연차를 주고, 퇴직 시 입사일 기준보다 불리하면 차액을 정산해야 합니다.' },
  { q: '연차는 매년 몇 개씩 늘어나나요?', a: '1년 만근 시 15일, 이후 2년마다 1일씩 늘어 3년차 16일, 5년차 17일, 21년차 이후 최대 25일입니다.' },
  { q: '연차를 못 쓰면 수당으로 받나요?', a: '사용하지 못한 연차는 미사용수당(1일 통상임금 × 일수)으로 받습니다. 다만 회사가 연차 사용촉진 제도를 적법하게 시행했다면 수당 지급 의무가 없어집니다. 1년 미만 근로자의 월차도 촉진 대상입니다.' },
  { q: '5인 미만 사업장도 연차가 있나요?', a: '근로기준법 연차 규정은 상시 5인 이상 사업장에만 적용됩니다. 5인 미만 사업장은 법정 연차 의무가 없으며 취업규칙이나 계약에 따릅니다.' },
];
export const tool = {
  slug, name, short: '입사일 기준·회계연도 기준 연차 발생일수와 다음 발생일',
  page({ config, tools }) {
    const title = '연차 계산기 - 입사일 기준·회계연도 기준 연차 발생일수';
    const description = '입사일을 입력하면 근로기준법 기준 올해 연차 일수, 다음 연차 발생일, 연도별 연차 표를 계산합니다. 1년 미만 월차, 회계연도 비례 연차, 연차수당까지 안내.';
    const today = new Date().toISOString().slice(0, 10);
    return {
      title, description, scripts: ['leave.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/leave/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>연차 계산기</h1><p class="lead">입사일만 넣으면 지금 쓸 수 있는 연차와 앞으로 발생할 연차를 계산합니다.</p>
<div class="card"><div class="calc"><div>
<div class="row">${field({ id: 'hireDate', label: '입사일', type: 'date', inputmode: 'text', value: '2023-03-15' })}${field({ id: 'asOf', label: '기준일', type: 'date', inputmode: 'text', value: today })}</div>
${select({ id: 'basis', label: '연차 부여 기준', value: 'hire', options: [{ v: 'hire', l: '입사일 기준 (법 원칙)' }, { v: 'fiscal', l: '회계연도 기준 (매년 1월 1일)' }] })}
<div class="notice">사용한 연차는 반영되지 않습니다. 상시 5인 이상 사업장 기준.</div>
</div><div class="result"><div class="sub">현재 보유 가능 연차</div><div class="big" id="r-total">-</div>
<div class="sub" id="r-msg"></div>
<table class="kv"><tbody><tr><td>근속</td><td id="r-years"></td></tr><tr><td>1년 미만 월차</td><td id="r-monthly"></td></tr><tr><td>현재 연차</td><td id="r-current"></td></tr><tr><td>다음 발생</td><td id="r-next"></td></tr></tbody></table></div></div>
<h3>연도별 연차 발생표</h3><div class="tbl-wrap" id="r-table"></div></div>
<h2>연차 발생 기준 (근로기준법 제60조)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>근속 기간</th><th>연차 일수</th><th>비고</th></tr></thead><tbody>
<tr><td>1년 미만</td><td>월 1일 (최대 11일)</td><td>매월 개근 시, 입사 1년 내 사용</td></tr>
${[1, 2, 3, 4, 5, 7, 9, 11, 15, 21].map((y) => `<tr><td>${y}년 이상</td><td>${annualLeaveForYears(y)}일</td><td>${y === 1 ? '80% 이상 출근 시' : y === 21 ? '최대' : ''}</td></tr>`).join('')}
</tbody></table></div>
<p>1년 만근 시 15일이 발생하고, 3년 이상 근속부터 2년마다 1일씩 늘어 최대 25일입니다. 출근율이 80% 미만이면 개근한 달마다 1일만 발생합니다.</p>
${ad('inArticle')}
<h2>입사일 기준 vs 회계연도 기준</h2>
<p><strong>입사일 기준</strong>은 입사일마다 연차가 발생하는 법정 방식입니다. <strong>회계연도 기준</strong>은 매년 1월 1일에 전 직원에게 일괄 부여하는 방식으로, 입사 다음 해 1월 1일에는 전년도 재직일수 ÷ 365 × 15일의 비례 연차를 받습니다. 예를 들어 3월 15일 입사자는 292일 재직으로 다음 해 1월 1일에 12일을 받고, 그 다음 해부터 15일씩 받습니다. 회계연도 방식은 근로자에게 불리하지 않아야 하므로 퇴직 시 입사일 기준으로 다시 계산해 부족분을 정산합니다.</p>
<h2>연차수당 계산</h2>
<p>미사용 연차수당 = <strong>1일 통상임금 × 미사용 일수</strong>. 1일 통상임금은 월 통상임금 ÷ 209시간 × 8시간입니다. 월 통상임금 300만원이면 1일 약 114,833원, 5일 미사용 시 약 574,000원입니다. 연차수당은 연차 사용 기간이 끝난 다음 달 급여일에 지급되며, 퇴직 시 남은 연차도 수당으로 정산됩니다. 연차수당은 퇴직금 산정 시 평균임금에도 포함되므로 <a href="${base}/severance/">퇴직금 계산기</a>에서 함께 확인하세요.</p>
<h2>연차 사용촉진 제도</h2>
<p>회사가 연차 만료 6개월 전(1년 미만자는 3개월 전) 잔여 연차를 서면 통보하고, 근로자가 사용 시기를 정하지 않으면 2개월 전 회사가 시기를 지정해 통보한 경우, 그래도 사용하지 않은 연차는 수당 없이 소멸합니다. 촉진 통보를 받았다면 반드시 기한 내에 사용 계획을 제출하세요.</p>
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
