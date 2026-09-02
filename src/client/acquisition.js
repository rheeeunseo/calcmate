import { calcAcquisitionTax } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const price = val('price'); if (!price) return;
  const t = $('type').value;
  const r = calcAcquisitionTax({ price, type: t === 'house' ? 'house' : t === 'land' ? 'land' : 'commercial', houseCount: +$('houseCount').value, regulated: $('regulated').value === 'yes', large: $('large').value === 'yes', firstHome: $('firstHome').value === 'yes' });
  setText('r-total', wonKo(r.total)); setText('r-label', `적용 세율: ${r.label}`);
  setText('r-acq', num(r.acquisition) + '원'); setText('r-red', r.reduction ? '-' + num(r.reduction) + '원' : '-'); setText('r-edu', num(r.education) + '원'); setText('r-rural', num(r.rural) + '원');
  setText('r-eff', (r.effectiveRate * 100).toFixed(2) + '%'); setText('r-total2', num(r.total) + '원');
}
bind(['price', 'type', 'houseCount', 'regulated', 'large', 'firstHome'], run);
