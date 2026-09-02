import { calcLeave } from '../lib/labor.mjs';
import { $, setText, setHtml, bind } from './_common.js';
function run() {
  const hireDate = $('hireDate').value, asOf = $('asOf').value;
  if (!hireDate || !asOf) return;
  const r = calcLeave({ hireDate, asOf, basis: $('basis').value });
  if (r.error) { setText('r-total', '-'); setText('r-msg', r.error); return; }
  setText('r-total', `${r.total}일`);
  setText('r-msg', r.monthlyActive ? `입사 1년 미만: 월차 ${r.monthlyLeave}일 (${r.monthlyExpire}까지 사용)` : r.current ? `${r.current.grant} 발생, ${r.current.expire} 전까지 사용` : '');
  setText('r-years', `만 ${r.completedYears}년`);
  setText('r-monthly', r.monthlyActive ? `${r.monthlyLeave}일 (사용 기한 ${r.monthlyExpire})` : '기간 만료');
  setText('r-current', r.current ? `${r.current.days}일 (${r.current.grant})` : '-');
  setText('r-next', r.next ? `${r.next.grant} · ${r.next.days}일` : '-');
  setHtml('r-table', `<table class="grid"><thead><tr><th>구분</th><th>발생일</th><th>연차</th><th>사용 기한</th><th>비고</th></tr></thead><tbody>${r.rows.map((x) => `<tr${x.active ? ' class="hl"' : ''}><td>${x.label}</td><td>${x.grant}</td><td>${x.days}일</td><td>${x.expire}</td><td>${x.note || (x.active ? '현재' : '')}</td></tr>`).join('')}</tbody></table>`);
}
bind(['hireDate', 'asOf', 'basis'], run);
