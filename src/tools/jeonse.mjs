import { convertJeonse, convertMonthly } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'jeonse', name = '전월세 전환 계산기';
const BASE_RATE = 2.5; // 한국은행 기준금리 (확인 필요)
const LEGAL = BASE_RATE + 2;
const faq = [
  { q: '전월세 전환율 법정 상한은?', a: `주택임대차보호법상 전환율 상한은 "기준금리 + 2%p"와 "10%" 중 낮은 값입니다. 기준금리 ${BASE_RATE}% 기준 ${LEGAL}%입니다. 다만 이 상한은 계약 기간 중 전세를 월세로 바꿀 때 적용되며, 신규 계약에는 강제되지 않습니다.` },
  { q: '전세 3억을 보증금 1억 월세로 바꾸면?', a: `전환율 ${LEGAL}% 기준 (3억 − 1억) × ${LEGAL}% ÷ 12 = 월 ${num((2e8 * LEGAL / 100) / 12)}원입니다. 시장 전환율(5~6% 수준)을 적용하면 월 83만~100만원입니다.` },
  { q: '전세대출 이자와 월세 중 뭐가 유리한가요?', a: '전세대출 금리가 전환율보다 낮으면 전세가 유리합니다. 예를 들어 대출 금리 4%, 전환율 5.5%라면 같은 금액에 대해 전세 이자가 월세보다 약 27% 저렴합니다. 다만 보증금 반환 리스크와 보증보험료를 함께 고려하세요.' },
];
export const tool = {
  slug, name, short: '전세 보증금 ↔ 월세 전환, 법정 전환율과 시장 전환율 비교',
  page({ config, tools }) {
    const title = '전월세 전환 계산기 - 전세를 월세로, 월세를 전세로 (법정 전환율)';
    const description = `전세 보증금을 월세로, 월세를 전세로 전환할 때 금액을 계산합니다. 법정 전환율 ${LEGAL}%(기준금리+2%p)와 시장 전환율 비교, 전세대출 이자와 월세 비교.`;
    return {
      title, description, scripts: ['jeonse.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/jeonse/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>전월세 전환 계산기</h1><p class="lead">전세 보증금 일부를 월세로 돌리면 얼마인지, 반대로 월세를 전세로 환산하면 얼마인지 계산합니다.</p>
<div class="card"><div class="calc"><div>
${select({ id: 'mode', label: '전환 방향', value: 'toMonthly', options: [{ v: 'toMonthly', l: '전세 → 월세 (보증금 낮추기)' }, { v: 'toJeonse', l: '월세 → 전세 (환산 전세가)' }] })}
${field({ id: 'jeonse', label: '전세 보증금', unit: '원', value: '300,000,000', chips: [{ l: '1억', v: 1e8 }, { l: '2억', v: 2e8 }, { l: '3억', v: 3e8 }, { l: '5억', v: 5e8 }] })}
${field({ id: 'deposit', label: '월세 계약 보증금', unit: '원', value: '100,000,000', chips: [{ l: '1천만', v: 1e7 }, { l: '5천만', v: 5e7 }, { l: '1억', v: 1e8 }] })}
${field({ id: 'monthly', label: '월세 (월세→전세 계산 시)', unit: '원', value: '750,000' })}
${field({ id: 'rate', label: '전환율', unit: '%', value: LEGAL, inputmode: 'decimal', hint: `법정 상한 ${LEGAL}% (기준금리 ${BASE_RATE}% + 2%p), 시장 평균 5~6%`, chips: [{ l: `법정 ${LEGAL}%`, v: LEGAL }, { l: '5%', v: 5 }, { l: '5.5%', v: 5.5 }, { l: '6%', v: 6 }] })}
</div><div class="result"><div class="sub" id="r-label">월세</div><div class="big" id="r-main">-</div><div class="sub" id="r-sub"></div>
<table class="kv"><tbody><tr><td>전환 대상 금액</td><td id="r-diff"></td></tr><tr><td>연 환산액</td><td id="r-yearly"></td></tr><tr><td>전환율</td><td id="r-rate"></td></tr></tbody></table>
<div class="notice">법정 상한은 기존 계약을 전세→월세로 바꿀 때 적용. 신규 계약은 협의.</div></div></div></div>
<h2>전월세 전환 계산 공식</h2>
<p><strong>월세 = (전세 보증금 − 월세 보증금) × 전환율 ÷ 12</strong>, <strong>환산 전세가 = 보증금 + 월세 × 12 ÷ 전환율</strong>. 전세 3억을 보증금 1억 월세로 바꾸면 전환율 ${LEGAL}% 기준 월 ${num(convertJeonse({ jeonse: 3e8, deposit: 1e8, rate: LEGAL }).monthly)}원, 시장 전환율 5.5%면 월 ${num(convertJeonse({ jeonse: 3e8, deposit: 1e8, rate: 5.5 }).monthly)}원입니다.</p>
${ad('inArticle')}
<h2>전환율별 월세 (전세 3억 → 보증금 1억)</h2>
<div class="tbl-wrap"><table class="grid"><thead><tr><th>전환율</th><th>월세</th><th>연간</th><th>비고</th></tr></thead><tbody>${[[LEGAL, '법정 상한'], [5, ''], [5.5, '수도권 시장 평균 수준'], [6, ''], [7, '지방·비아파트']].map(([r, n]) => `<tr><td>${r}%</td><td>${num(convertJeonse({ jeonse: 3e8, deposit: 1e8, rate: r }).monthly)}원</td><td>${num(convertJeonse({ jeonse: 3e8, deposit: 1e8, rate: r }).yearly)}원</td><td>${n}</td></tr>`).join('')}</tbody></table></div>
<h2>전세 vs 월세, 어느 쪽이 유리한가</h2>
<p>전세대출 금리가 전환율보다 낮으면 전세가 유리합니다. 2억을 전세대출(연 4%)로 조달하면 월 이자 약 ${num(2e8 * 0.04 / 12)}원인데, 같은 2억을 월세로 전환(5.5%)하면 월 ${num(convertJeonse({ jeonse: 2e8, deposit: 0, rate: 5.5 }).monthly)}원입니다. 다만 전세는 보증금 반환 리스크가 있어 보증보험료(보증금의 연 0.1~0.15% 수준)를 더해 비교해야 합니다. 대출 이자는 <a href="${base}/loan/">대출 이자 계산기</a>에서 만기일시상환으로 계산하세요.</p>
<h2>임대인이 알아야 할 것</h2>
<ul><li>계약 기간 중 전세→월세 전환은 임차인 동의가 필요하고 법정 상한을 넘을 수 없습니다.</li><li>보증금과 월세를 합친 총 인상률은 갱신 시 5% 이내(계약갱신요구권 행사 시)입니다.</li><li>월세 소득은 연 2천만원 이하도 분리과세(14%) 또는 종합과세 신고 대상입니다.</li></ul>
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
