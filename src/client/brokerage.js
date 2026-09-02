import { calcBrokerage } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const price = val('price'), deal = $('deal').value; if (!price) return;
  const r = deal === 'rent' ? calcBrokerage({ deal, type: $('type').value, deposit: price, monthly: val('monthly'), vat: $('vat').value }) : calcBrokerage({ deal, type: $('type').value, price, vat: $('vat').value });
  setText('r-total', wonKo(r.total)); setText('r-note', r.note + (r.cap ? ` · 한도 ${num(r.cap)}원` : ''));
  setText('r-amount', num(r.amount) + '원'); setText('r-rate', (r.rate * 100).toFixed(1) + '%'); setText('r-fee', num(r.fee) + '원'); setText('r-vat', num(r.vatAmount) + '원'); setText('r-total2', num(r.total) + '원');
}
bind(['deal', 'type', 'price', 'monthly', 'vat'], run);
