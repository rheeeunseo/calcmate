import { calcCapitalGainsTax } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const salePrice = val('salePrice'), buyPrice = val('buyPrice'); if (!salePrice || !buyPrice) return;
  const r = calcCapitalGainsTax({ salePrice, buyPrice, expenses: val('expenses'), holdYears: val('holdYears'), liveYears: val('liveYears'), oneHouse: $('oneHouse').value === 'yes' });
  setText('r-total', wonKo(r.total)); setText('r-note', r.note || (r.gain === 0 ? '양도차익 없음' : '일반 과세'));
  setText('r-gain', num(r.gain) + '원'); setText('r-exempt', r.exemptGain ? '-' + num(r.exemptGain) + '원' : '-'); setText('r-taxable', num(r.taxableGain) + '원');
  setText('r-ltrate', (r.ltRate * 100).toFixed(0) + '%'); setText('r-lt', '-' + num(r.ltDeduction) + '원'); setText('r-basic', '-' + num(r.basic) + '원'); setText('r-base', num(r.taxBase) + '원');
  setText('r-rate', r.rateLabel); setText('r-tax', num(r.tax) + '원'); setText('r-local', num(r.local) + '원'); setText('r-net', num(r.netProceeds) + '원');
}
bind(['salePrice', 'buyPrice', 'expenses', 'holdYears', 'liveYears', 'oneHouse'], run);
