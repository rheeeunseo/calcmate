import { calcLoan } from '../lib/loan.mjs';
import { num } from '../lib/format.mjs';
import { $, val, setText, setHtml, bind } from './_common.js';

function run() {
  const principal = val('principal'), rate = val('rate'), months = Math.round(val('years') * 12);
  if (!principal || months <= 0) return;
  const method = $('method').value, grace = Math.max(0, Math.round(val('grace')));
  const r = calcLoan({ principal, annualRate: rate, months, method, graceMonths: Math.min(grace, months - 1) });
  setText('r-label', method === 'equalPayment' && !grace ? '월 상환액' : '월 상환액 (첫 달)');
  setText('r-monthly', num(r.monthlyPayment) + '원');
  setText('r-principal', num(principal) + '원');
  setText('r-interest', num(r.totalInterest) + '원');
  setText('r-total', num(r.totalPayment) + '원');
  setText('r-last', num(r.lastPayment) + '원');
  const rows = r.schedule.map((s) => `<tr><td>${s.month}회</td><td>${num(s.payment)}</td><td>${num(s.principal)}</td><td>${num(s.interest)}</td><td>${num(s.balance)}</td></tr>`).join('');
  setHtml('r-schedule', `<table class="grid"><thead><tr><th>회차</th><th>상환액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody>${rows}</tbody></table>`);
}
bind(['principal', 'rate', 'years', 'method', 'grace'], run);
