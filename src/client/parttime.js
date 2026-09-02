import { calcParttime, MIN_WAGE } from '../lib/labor.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';
function run() {
  const hourly = val('hourly'), hoursPerDay = val('hoursPerDay'), daysPerWeek = val('daysPerWeek');
  if (!hourly || !hoursPerDay || !daysPerWeek) return;
  const r = calcParttime({ hourly, hoursPerDay, daysPerWeek, nightHoursPerWeek: val('night'), tax: $('tax').value });
  setText('r-net', wonKo(r.monthlyNet));
  setText('r-holiday-msg', r.holidayEligible ? `주휴수당 발생 (주 ${r.holidayHours}시간분)` : '주 15시간 미만: 주휴수당 없음');
  setText('r-weekly', `${r.weeklyHours}시간 (월 ${r.monthlyHours}시간)`);
  setText('r-base', num(r.monthlyBase) + '원'); setText('r-holiday', num(r.monthlyHoliday) + '원'); setText('r-night', num(r.monthlyNight) + '원');
  setText('r-ded', '-' + num(r.deduction) + '원'); setText('r-total', num(r.monthlyNet) + '원'); setText('r-daily', num(r.dailyPay) + '원');
  setText('r-note', r.belowMinWage ? `⚠ ${MIN_WAGE.year}년 최저시급 ${num(MIN_WAGE.hourly)}원 미만입니다.` : '월 환산은 주 평균 4.345주 기준 (주 40시간 = 209시간)');
}
bind(['hourly', 'hoursPerDay', 'daysPerWeek', 'night', 'tax'], run);
