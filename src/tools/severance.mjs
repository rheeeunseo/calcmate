import { num } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, base } from '../lib/html.mjs';

const slug = 'severance', name = '퇴직금 계산기';
const faq = [
  { q: '퇴직금 지급 조건은?', a: '1년 이상 계속 근로하고 4주 평균 주 15시간 이상 근무했다면 정규직·계약직·아르바이트 관계없이 퇴직금을 받을 수 있습니다. 5인 미만 사업장도 2010년 12월부터 적용됩니다.' },
  { q: '평균임금에 상여금과 연차수당이 포함되나요?', a: '퇴직 전 1년간 지급된 상여금과 연차수당의 3/12 을 3개월 임금총액에 더해 평균임금을 계산합니다. 식대·교통비 등 정기적으로 지급된 수당도 포함됩니다.' },
  { q: '퇴직금은 언제까지 받아야 하나요?', a: '퇴직일로부터 14일 이내에 지급해야 하며, 합의로 연장할 수 있습니다. 미지급 시 연 20% 지연이자가 붙고 고용노동부에 진정할 수 있습니다.' },
  { q: '퇴직소득세는 얼마나 되나요?', a: '퇴직소득은 근속연수공제와 환산급여공제를 거쳐 별도 세율로 과세되어 부담이 낮습니다. 근속 10년 퇴직금 3,000만원이면 세금은 수십만 원 수준이며, IRP 로 받으면 연금 수령 시 30~40% 추가 감면됩니다.' },
];
export const tool = {
  slug, name, short: '입사일·퇴사일·최근 3개월 급여로 법정 퇴직금 계산',
  page({ config, tools }) {
    const title = '퇴직금 계산기 - 입사일·퇴사일·평균임금으로 예상 퇴직금';
    const description = '입사일, 퇴사일, 최근 3개월 급여, 연간 상여금을 입력하면 근로자퇴직급여보장법 기준 예상 퇴직금을 계산합니다. 평균임금 산정 방법과 지급 조건 안내.';
    const today = new Date().toISOString().slice(0, 10);
    const threeYearsAgo = new Date(Date.now() - 3 * 365.25 * 86400000).toISOString().slice(0, 10);
    return {
      title, description, scripts: ['severance.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/severance/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>퇴직금 계산기</h1><p class="lead">고용노동부 산정 방식(평균임금 × 30일 × 재직일수 ÷ 365)으로 예상 퇴직금을 계산합니다.</p>
<div class="card"><div class="calc"><div>
<div class="row">${field({ id: 'startDate', label: '입사일', type: 'date', inputmode: 'text', value: threeYearsAgo })}${field({ id: 'endDate', label: '퇴사일', type: 'date', inputmode: 'text', value: today, hint: '마지막 근무일' })}</div>
${field({ id: 'pay', label: '퇴직 전 3개월 급여 총액', unit: '원', value: '9,000,000', hint: '세전 기본급+수당 3개월 합계', chips: [{ l: '월 250만', v: 7.5e6 }, { l: '월 300만', v: 9e6 }, { l: '월 400만', v: 1.2e7 }, { l: '월 500만', v: 1.5e7 }] })}
<div class="row">${field({ id: 'bonus', label: '연간 상여금', unit: '원', value: '0' })}${field({ id: 'leave', label: '연차수당 (연간)', unit: '원', value: '0' })}</div>
</div><div class="result"><div class="sub">예상 퇴직금 (세전)</div><div class="big" id="r-severance">-</div>
<table class="kv"><tbody><tr><td>재직 기간</td><td id="r-days"></td></tr><tr><td>3개월 임금 총액</td><td id="r-total"></td></tr><tr><td>3개월 일수</td><td id="r-period"></td></tr><tr class="total"><td>1일 평균임금</td><td id="r-avg"></td></tr></tbody></table>
<div class="notice" id="r-note"></div></div></div></div>
<h2>퇴직금 계산 공식</h2>
<p><strong>퇴직금 = 1일 평균임금 × 30일 × (재직일수 ÷ 365)</strong></p>
<p>1일 평균임금은 퇴직일 이전 3개월간 지급된 임금 총액을 그 기간의 총 일수(89~92일)로 나눈 값입니다. 임금 총액에는 기본급과 각종 수당, 연간 상여금의 3/12, 연차수당의 3/12 이 포함됩니다. 평균임금이 통상임금보다 적으면 통상임금으로 계산합니다.</p>
${ad('inArticle')}
<h2>계산 예시</h2>
<p>월급 300만원(3개월 900만원), 상여 없이 5년(1,826일) 근무한 경우: 평균임금 900만원 ÷ 92일 = 97,826원, 퇴직금 = 97,826 × 30 × 1,826 ÷ 365 = 약 ${num(97826.09 * 30 * 1826 / 365)}원입니다. 대략 <strong>월급 × 근속연수</strong>와 비슷하되, 3개월 일수가 적은 2~4월 퇴직이 조금 유리합니다.</p>
<h2>퇴직금을 더 받는 팁</h2>
<ul><li><strong>퇴직 전 3개월 급여를 높게</strong>: 연장근로수당, 상여금이 몰리는 시기 이후 퇴직하면 평균임금이 올라갑니다.</li><li><strong>연차 소진 vs 수당</strong>: 미사용 연차수당은 평균임금에 포함되므로 수당으로 받는 편이 퇴직금에 유리한 경우가 많습니다.</li><li><strong>IRP 계좌로 수령</strong>: 퇴직소득세를 이연하고 55세 이후 연금으로 받으면 세금이 30~40% 줄어듭니다.</li><li><strong>DC형 퇴직연금</strong>이라면 회사 납입액과 운용 수익이 퇴직금이므로 이 계산 결과와 다릅니다.</li></ul>
${affiliate({ title: '퇴직금 세금 30% 줄이는 IRP 계좌', desc: '퇴직금을 IRP 로 받으면 퇴직소득세 이연 + 연금 수령 시 감면. 수수료 0원 IRP 비교.', url: '#', cta: 'IRP 비교' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
