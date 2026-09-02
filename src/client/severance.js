import { calcSeverance } from '../lib/savings.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const startDate = $('startDate').value, endDate = $('endDate').value, pay = val('pay');
  if (!startDate || !endDate || !pay) return;
  const r = calcSeverance({ startDate, endDate, last3MonthsPay: pay, annualBonus: val('bonus'), annualLeavePay: val('leave') });
  const y = Math.floor(r.days / 365), m = Math.floor((r.days % 365) / 30);
  setText('r-severance', r.eligible ? wonKo(r.severance) : '지급 대상 아님');
  setText('r-days', `${num(r.days)}일 (${y}년 ${m}개월)`);
  setText('r-total', num(pay + val('bonus') * 3 / 12 + val('leave') * 3 / 12) + '원');
  setText('r-period', r.periodDays + '일');
  setText('r-avg', num(r.avgDaily) + '원');
  setText('r-note', r.eligible ? '세전 금액. 퇴직소득세는 근속연수에 따라 별도 계산됩니다.' : '재직 기간이 1년 미만이면 법정 퇴직금 지급 대상이 아닙니다.');
}
bind(['startDate', 'endDate', 'pay', 'bonus', 'leave'], run);
