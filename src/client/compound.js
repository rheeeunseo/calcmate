import { calcCompound } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, setHtml, bind } from './_common.js';
function run() {
  const years = Math.round(val('years'));
  if (!years) return;
  const r = calcCompound({ initial: val('initial'), monthly: val('monthly'), years, annualRate: val('rate'), periodsPerYear: Number($('periods').value) });
  setText('r-final', wonKo(r.final)); setText('r-contributed', num(r.contributed) + '원'); setText('r-gain', num(r.gain) + '원');
  setText('r-multiple', r.contributed ? (r.final / r.contributed).toFixed(2) + '배' : '-');
  setHtml('r-table', `<table class="grid"><thead><tr><th>연차</th><th>누적 원금</th><th>자산</th><th>수익</th></tr></thead><tbody>${r.rows.map((x) => `<tr><td>${x.year}년</td><td>${num(x.contributed)}</td><td>${num(x.balance)}</td><td>${num(x.gain)}</td></tr>`).join('')}</tbody></table>`);
}
bind(['initial', 'monthly', 'years', 'rate', 'periods'], run);
