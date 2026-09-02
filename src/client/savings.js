import { calcSavings } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const monthly = val('monthly'), months = Math.round(val('months'));
  if (!monthly || !months) return;
  const r = calcSavings({ monthly, months, annualRate: val('rate'), compound: $('compound').value === 'compound', taxType: $('taxType').value });
  setText('r-net', wonKo(r.net)); setText('r-principal', num(r.principal) + '원'); setText('r-interest', num(r.interest) + '원');
  setText('r-tax', '-' + num(r.tax) + '원'); setText('r-after', num(r.afterTaxInterest) + '원');
}
bind(['monthly', 'months', 'rate', 'compound', 'taxType'], run);
