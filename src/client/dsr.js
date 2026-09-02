import { calcDsrLimit } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const income = val('income'), years = val('years'); if (!income || !years) return;
  const r = calcDsrLimit({ income, rate: val('rate'), years, stress: val('stress'), existingAnnual: val('existing'), dsrLimit: +$('dsrLimit').value, price: val('price'), ltv: val('ltv') || 70 });
  setText('r-limit', wonKo(r.limit)); setText('r-binding', r.limit === 0 ? '기존 대출이 DSR 한도를 초과합니다' : `${r.binding} 한도가 적용됨`);
  setText('r-allowed', num(Math.max(r.allowedAnnual, 0)) + '원'); setText('r-dsr', num(r.maxByDsr) + '원'); setText('r-ltv', r.maxByLtv === Infinity ? '주택가격 미입력' : num(r.maxByLtv) + '원');
  setText('r-stress', r.stressRate.toFixed(2) + '%'); setText('r-pmt', num(r.monthlyPayment) + '원');
}
bind(['income', 'rate', 'years', 'stress', 'dsrLimit', 'existing', 'price', 'ltv'], run);
