import { calcCapitalGainsTax } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { ad, affiliate, faqHtml, faqJsonld, webAppJsonld, breadcrumb, relatedTools, field, select, base } from '../lib/html.mjs';

const slug = 'capital-gains-tax', name = '양도소득세 계산기';
const faq = [
  { q: '1세대 1주택 비과세 조건은?', a: '2년 이상 보유(2017년 8월 3일 이후 조정대상지역 취득분은 2년 이상 거주)한 1세대 1주택은 양도가액 12억원까지 비과세입니다. 12억 초과분은 (양도차익 × (양도가 − 12억) ÷ 양도가) 만큼만 과세합니다.' },
  { q: '장기보유특별공제는 얼마인가요?', a: '1세대 1주택은 보유기간 연 4% + 거주기간 연 4%로 각 최대 40%, 합계 최대 80%(10년 보유·10년 거주)입니다. 그 외 부동산은 3년 이상 보유 시 연 2%, 최대 30%(15년)입니다. 2년 미만 거주한 1주택은 일반 공제율(연 2%)을 적용합니다.' },
  { q: '다주택자 중과는 지금도 적용되나요?', a: '조정대상지역 다주택자 양도세 중과(기본세율 + 20~30%p)는 2022년 5월부터 한시 배제 중이며 2026년 5월 9일까지 유예가 연장되었습니다. 이 계산기는 유예를 전제로 기본세율을 적용합니다. 유예 종료 후 양도 예정이면 세무사 상담이 필요합니다.' },
  { q: '필요경비에는 무엇이 들어가나요?', a: '취득 시 취득세·등록세·법무사비·중개수수료, 양도 시 중개수수료, 보유 중 자본적 지출(발코니 확장, 새시 교체, 보일러 교체 등)입니다. 도배·장판 등 수익적 지출과 대출 이자는 제외됩니다. 증빙(세금계산서, 카드영수증)이 있어야 인정됩니다.' },
  { q: '양도세 신고 기한은?', a: '양도일(잔금일 또는 등기일 중 빠른 날)이 속한 달의 말일부터 2개월 이내 예정신고·납부해야 합니다. 예: 3월 15일 양도 → 5월 31일까지. 미신고 시 20% 가산세가 붙습니다.' },
];
export const tool = {
  slug, name, short: '주택 양도차익·장기보유특별공제·1세대1주택 비과세 반영 양도세',
  page({ config, tools }) {
    const title = '양도소득세 계산기 - 주택 양도세, 1세대 1주택 비과세, 장기보유특별공제';
    const description = '양도가액, 취득가액, 필요경비, 보유·거주기간을 입력하면 1세대 1주택 12억 비과세와 장기보유특별공제를 반영한 양도소득세와 지방소득세를 계산합니다.';
    const ex = calcCapitalGainsTax({ salePrice: 15e8, buyPrice: 8e8, expenses: 3e7, holdYears: 8, liveYears: 8, oneHouse: true });
    const ex2 = calcCapitalGainsTax({ salePrice: 5e8, buyPrice: 3e8, expenses: 1.5e7, holdYears: 5 });
    return {
      title, description, scripts: ['capitalgains.js'],
      jsonld: [webAppJsonld({ name, description, url: config.siteUrl + base + '/capital-gains-tax/' }), faqJsonld(faq)],
      content: `${breadcrumb([{ name: '홈', href: '/' }, { name }])}<h1>양도소득세 계산기</h1><p class="lead">집을 팔 때 내는 양도세를 보유기간, 거주기간, 1주택 여부에 따라 계산합니다.</p>
<div class="card"><div class="calc"><div>
${field({ id: 'salePrice', label: '양도가액 (판 가격)', unit: '원', value: '1,500,000,000', chips: [{ l: '5억', v: 5e8 }, { l: '10억', v: 1e9 }, { l: '15억', v: 1.5e9 }, { l: '20억', v: 2e9 }] })}
${field({ id: 'buyPrice', label: '취득가액 (산 가격)', unit: '원', value: '800,000,000' })}
${field({ id: 'expenses', label: '필요경비', unit: '원', value: '30,000,000', hint: '취득세, 중개수수료, 법무사비, 자본적 지출 합계' })}
<div class="row">${field({ id: 'holdYears', label: '보유기간', unit: '년', value: '8', inputmode: 'decimal' })}${field({ id: 'liveYears', label: '거주기간', unit: '년', value: '8', inputmode: 'decimal' })}</div>
${select({ id: 'oneHouse', label: '1세대 1주택 여부', value: 'yes', options: [{ v: 'yes', l: '1세대 1주택 (비과세·장특공제 최대 80%)' }, { v: 'no', l: '다주택·비거주 (기본세율, 장특공제 최대 30%)' }] })}
</div><div class="result"><div class="sub">양도소득세 + 지방소득세</div><div class="big" id="r-total">-</div><div class="sub" id="r-note"></div>
<table class="kv"><tbody><tr><td>양도차익</td><td id="r-gain"></td></tr><tr><td class="indent">비과세 차익</td><td id="r-exempt"></td></tr><tr><td>과세 양도차익</td><td id="r-taxable"></td></tr><tr><td>장기보유특별공제 (<span id="r-ltrate"></span>)</td><td id="r-lt"></td></tr><tr><td>기본공제</td><td id="r-basic"></td></tr><tr><td>과세표준</td><td id="r-base"></td></tr><tr><td>양도소득세 (<span id="r-rate"></span>)</td><td id="r-tax"></td></tr><tr><td class="indent">지방소득세 10%</td><td id="r-local"></td></tr><tr class="total"><td>세후 실수령 차익</td><td id="r-net"></td></tr></tbody></table>
<div class="notice">개인·주택 기준 예상치. 다주택 중과 유예(2026.5.9까지) 전제. 실제 신고 전 세무사 확인 필요.</div></div></div></div>
<h2>양도소득세 계산 순서</h2>
<ol><li><strong>양도차익</strong> = 양도가액 − 취득가액 − 필요경비</li><li><strong>1세대 1주택 비과세</strong>: 양도가 12억 이하면 전액 비과세, 초과 시 (양도가 − 12억) ÷ 양도가 비율만 과세</li><li><strong>장기보유특별공제</strong>: 1주택 보유·거주 각 연 4% (최대 80%), 그 외 연 2% (최대 30%)</li><li><strong>기본공제</strong> 연 250만원</li><li><strong>세율</strong>: 2년 이상 보유 6~45% 누진, 1년 미만 70%, 2년 미만 60%</li><li><strong>지방소득세</strong> 양도세의 10%</li></ol>
${ad('inArticle')}
<h2>계산 예시</h2>
<p><strong>예시 1</strong>: 8억에 사서 15억에 판 1세대 1주택, 8년 보유·8년 거주, 필요경비 3천만원. 양도차익 ${wonKo(ex.gain)} 중 12억 초과분 ${wonKo(ex.taxableGain)}만 과세, 장특공제 ${(ex.ltRate * 100).toFixed(0)}% 적용 후 과세표준 ${wonKo(ex.taxBase)}, 양도세와 지방세 합계 <strong>${wonKo(ex.total)}</strong>입니다.</p>
<p><strong>예시 2</strong>: 3억에 사서 5억에 판 2주택자, 5년 보유, 필요경비 1,500만원. 장특공제 10% 후 과세표준 ${wonKo(ex2.taxBase)}, 세금 합계 <strong>${wonKo(ex2.total)}</strong>입니다. 같은 차익이라도 1주택 비과세 여부에 따라 세금이 수천만 원 차이 납니다.</p>
<h2>양도세 줄이는 방법</h2>
<ul><li><strong>2년 보유·거주 채우기</strong>: 1년 미만 70%, 2년 미만 60% 단일세율은 부담이 큽니다. 몇 달 차이로 세금이 절반 이하가 될 수 있습니다.</li><li><strong>필요경비 증빙 모으기</strong>: 취득세 영수증, 중개수수료 현금영수증, 확장·새시 공사 세금계산서를 보관하세요. <a href="${base}/acquisition-tax/">취득세 계산기</a>로 취득 당시 세금을 역산할 수 있습니다.</li><li><strong>일시적 2주택 특례</strong>: 새집 취득 후 3년 내 종전 주택을 팔면 1주택 비과세를 받을 수 있습니다.</li><li><strong>부부 공동명의</strong>: 기본공제 250만원이 각각 적용되고 누진세율 구간이 낮아집니다.</li><li><strong>양도 시기 분산</strong>: 같은 해에 두 건을 팔면 합산 과세되므로 연도를 나누면 누진 부담이 줄어듭니다.</li></ul>
${affiliate({ title: '양도세 신고 세무사 상담', desc: '비과세·감면 요건은 사례마다 다릅니다. 신고 전 전문가 검토로 가산세를 피하세요.', url: '#', cta: '상담 알아보기' })}
${faqHtml(faq)}${relatedTools(tools, slug)}`,
    };
  },
};
