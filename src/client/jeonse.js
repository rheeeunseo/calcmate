import { convertJeonse, convertMonthly } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const mode = $('mode').value, rate = val('rate'); if (!rate) return;
  if (mode === 'toMonthly') {
    const r = convertJeonse({ jeonse: val('jeonse'), deposit: val('deposit'), rate });
    setText('r-label', '월세'); setText('r-main', wonKo(r.monthly)); setText('r-sub', `보증금 ${wonKo(r.deposit)} + 월세 ${num(r.monthly)}원`);
    setText('r-diff', num(r.jeonse - r.deposit) + '원'); setText('r-yearly', num(r.yearly) + '원');
  } else {
    const r = convertMonthly({ deposit: val('deposit'), monthly: val('monthly'), rate });
    setText('r-label', '환산 전세가'); setText('r-main', wonKo(r.jeonse)); setText('r-sub', `보증금 ${wonKo(r.deposit)} + 월세 ${num(r.monthly)}원 ≈ 전세 ${wonKo(r.jeonse)}`);
    setText('r-diff', num(r.jeonse - r.deposit) + '원'); setText('r-yearly', num(r.monthly * 12) + '원');
  }
  setText('r-rate', rate + '%');
}
bind(['mode', 'jeonse', 'deposit', 'monthly', 'rate'], run);
