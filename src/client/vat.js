import { calcVat } from '../lib/savings.mjs';
import { num } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const amount = val('amount'), mode = $('mode').value;
  const r = calcVat({ amount, mode });
  setText('r-label', mode === 'supply' ? '합계금액 (부가세 포함)' : '공급가액 (부가세 별도)');
  setText('r-main', num(mode === 'supply' ? r.total : r.supply) + '원');
  setText('r-supply', num(r.supply) + '원'); setText('r-vat', num(r.vat) + '원'); setText('r-total', num(r.total) + '원');
}
bind(['amount', 'mode'], run);
