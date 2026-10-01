import { calcDsrLimit, DSR_REGIONS } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const income = val('income'), years = val('years'); if (!income || !years) return;
  const r = calcDsrLimit({ income, rate: val('rate'), years, region: $('region').value, stress: val('stress'), existingAnnual: val('existing'), dsrLimit: +$('dsrLimit').value, price: val('price'), ltv: val('ltv') || 70 });
  setText('r-limit', wonKo(r.limit)); setText('r-binding', r.limit === 0 ? '기존 대출이 DSR 한도를 초과합니다' : `${r.binding} 한도가 적용됨`);
  setText('r-allowed', num(Math.max(r.allowedAnnual, 0)) + '원'); setText('r-dsr', num(r.maxByDsr) + '원'); setText('r-ltv', r.maxByLtv === Infinity ? '주택가격 미입력' : num(r.maxByLtv) + '원');
  setText('r-cap', r.maxByCap === Infinity ? '해당 없음' : num(r.maxByCap) + '원' + (r.appliedYears < years ? ` · 만기 ${r.appliedYears}년 적용` : '')); setText('r-stress', r.stressRate.toFixed(2) + '%'); setText('r-pmt', num(r.monthlyPayment) + '원');
}
// 소재지를 바꾸면 그 지역의 스트레스 금리를 채운다 (bind 보다 먼저 등록해 run 이 새 값을 읽게 함)
$('region')?.addEventListener('change', () => { $('stress').value = DSR_REGIONS[$('region').value].stress; });
bind(['income', 'region', 'rate', 'years', 'stress', 'dsrLimit', 'existing', 'price', 'ltv'], run);
