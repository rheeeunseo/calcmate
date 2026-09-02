import { calcHomeCost } from '../lib/realestate.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
const IDS = ['price', 'income', 'cash', 'rate', 'years', 'ltv', 'large', 'firstHome', 'existing'];
function run() {
  const price = val('price'), income = val('income'); if (!price || !income) return;
  const c = calcHomeCost({ price, income, cash: val('cash'), rate: val('rate'), years: val('years') || 30, ltv: val('ltv') || 70, existingAnnual: val('existing'), large: $('large').value === 'yes', firstHome: $('firstHome').value === 'yes' });
  setText('r-cash', wonKo(c.cashNeeded));
  setText('r-summary', `대출 ${wonKo(c.loan)} + 현금 ${wonKo(c.cashNeeded)} · 월 ${num(c.pmt)}원 상환`);
  setText('r-price', num(c.price) + '원'); setText('r-binding', c.dsr.binding); setText('r-loan', num(c.loan) + '원');
  setText('r-burden', (c.burden * 100).toFixed(0) + '%'); setText('r-pmt', num(c.pmt) + '원'); setText('r-interest', num(c.totalInterest) + '원');
  setText('r-acq', num(c.acq.total) + '원'); setText('r-brk', num(c.brk.total) + '원'); setText('r-other', num(c.otherCosts) + '원'); setText('r-cash2', num(c.cashNeeded) + '원');
  const gapRow = $('r-gap-row');
  if (c.cashGap === null) gapRow.hidden = true; else { gapRow.hidden = false; setText('r-gap', c.cashGap >= 0 ? `여유 ${num(c.cashGap)}원` : `부족 ${num(-c.cashGap)}원`); }
  // 공유용 URL 동기화
  const q = new URLSearchParams(); for (const id of IDS) { const v = $(id).value; if (v && v !== '0') q.set(id, v.replace(/,/g, '')); }
  history.replaceState(null, '', location.pathname + '?' + q.toString());
}
bind(IDS, run);
$('share')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); setText('share-msg', '복사됨 — 이 링크를 열면 같은 결과가 보입니다'); }
  catch { setText('share-msg', location.href); }
});
