// 노동 관련 계산 엔진: 알바 월급·주휴수당, 연차휴가

export const MIN_WAGE = { year: 2026, hourly: 10_320, monthly209: 10_320 * 209 }; // 2026년 최저시급 10,320원, 월 209시간 기준 2,156,880원
const WEEKS_PER_MONTH = 365 / 7 / 12; // 4.345

/**
 * 알바·시급제 월급 계산
 * @param {object} p
 * @param {number} p.hourly       시급
 * @param {number} p.hoursPerDay  하루 근무시간
 * @param {number} p.daysPerWeek  주 근무일수
 * @param {number} [p.nightHoursPerWeek] 주당 야간(22~06시) 근무시간 (5인 이상 사업장 50% 가산)
 * @param {'none'|'freelancer'|'insurance'} [p.tax] 공제 방식: 없음 | 3.3% 원천징수 | 4대보험 근사(약 9.4%)
 */
export function calcParttime({ hourly, hoursPerDay, daysPerWeek, nightHoursPerWeek = 0, tax = 'none' }) {
  const weeklyHours = hoursPerDay * daysPerWeek;
  const weeklyBase = weeklyHours * hourly;
  const holidayEligible = weeklyHours >= 15;
  const holidayHours = holidayEligible ? Math.min(weeklyHours, 40) / 40 * 8 : 0;
  const weeklyHoliday = holidayHours * hourly;
  const weeklyNight = nightHoursPerWeek * hourly * 0.5;
  const weeklyTotal = weeklyBase + weeklyHoliday + weeklyNight;
  // 월 환산 시간은 고용노동부 관행대로 반올림 (주 40시간 → 209시간)
  const monthlyHours = Math.round((weeklyHours + holidayHours) * WEEKS_PER_MONTH);
  const monthlyNight = Math.round(weeklyNight * WEEKS_PER_MONTH);
  const monthlyBase = Math.round(weeklyHours * WEEKS_PER_MONTH) * hourly;
  const monthlyGross = monthlyHours * hourly + monthlyNight;
  const monthlyHoliday = monthlyGross - monthlyBase - monthlyNight;
  const rate = tax === 'freelancer' ? 0.033 : tax === 'insurance' ? 0.0944 : 0; // 4대보험 근사: 4.75+3.595+0.466+0.9 ≈ 9.7%, 소액 소득세 감안 없이 9.44% 로 단순화
  const deduction = Math.round(monthlyGross * rate);
  return {
    weeklyHours, holidayEligible, holidayHours, monthlyHours,
    weeklyBase, weeklyHoliday, weeklyNight, weeklyTotal,
    monthlyBase, monthlyHoliday, monthlyNight, monthlyGross,
    deduction, monthlyNet: monthlyGross - deduction,
    dailyPay: hoursPerDay * hourly,
    belowMinWage: hourly < MIN_WAGE.hourly,
  };
}

// ---- 연차휴가 (근로기준법 제60조) ----
const DAY = 86_400_000;
const addMonths = (d, n) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + n); return x; };
const addYears = (d, n) => { const x = new Date(d); x.setUTCFullYear(x.getUTCFullYear() + n); return x; };
const fmt = (d) => d.toISOString().slice(0, 10);
export const annualLeaveForYears = (completedYears) => Math.min(15 + Math.floor((completedYears - 1) / 2), 25); // 만 1년: 15, 3년: 16, 5년: 17 … 최대 25

/**
 * @param {object} p
 * @param {string} p.hireDate  입사일 YYYY-MM-DD
 * @param {string} p.asOf      기준일 YYYY-MM-DD
 * @param {'hire'|'fiscal'} p.basis  입사일 기준 | 회계연도(1/1) 기준
 */
export function calcLeave({ hireDate, asOf, basis = 'hire' }) {
  const hire = new Date(hireDate), now = new Date(asOf);
  if (!(hire < now)) return { error: '기준일이 입사일 이후여야 합니다.' };
  const rows = [];
  // 1년 미만 월차: 매월 개근 시 1일, 최대 11일. 입사 1년이 되는 날까지 사용.
  let monthly = 0;
  for (let m = 1; m <= 11; m++) { if (addMonths(hire, m) <= now) monthly++; }
  const firstAnniv = addYears(hire, 1);
  const completedYears = Math.max(0, Math.floor((now - hire) / DAY / 365.25));

  if (basis === 'hire') {
    let cur = null, next = null;
    for (let y = 1; y <= 30; y++) {
      const grant = addYears(hire, y);
      const days = annualLeaveForYears(y);
      const expire = addYears(grant, 1);
      rows.push({ label: `입사 ${y}년차 만료 시`, grant: fmt(grant), days, expire: fmt(expire), active: grant <= now && now < expire });
      if (grant <= now && now < expire) cur = { grant: fmt(grant), days, expire: fmt(expire) };
      if (!next && grant > now) next = { grant: fmt(grant), days };
      if (grant > now && rows.length >= Math.max(completedYears + 3, 5)) break;
    }
    const monthlyActive = now < firstAnniv;
    return {
      basis, completedYears, monthlyLeave: monthly, monthlyActive, monthlyExpire: fmt(firstAnniv),
      current: cur, next, rows,
      total: (monthlyActive ? monthly : 0) + (cur ? cur.days : 0),
    };
  }
  // 회계연도 기준: 입사 다음 해 1/1 에 비례 연차 (15 × 입사연도 재직일수/365), 그 다음 해부터 15일, 이후 2년마다 +1
  const hireYear = hire.getUTCFullYear();
  const endOfHireYear = new Date(Date.UTC(hireYear, 11, 31));
  const daysInHireYear = Math.round((endOfHireYear - hire) / DAY) + 1;
  const prorated = Math.round(15 * daysInHireYear / 365 * 10) / 10;
  let cur = null, next = null;
  for (let k = 1; k <= 30; k++) {
    const grant = new Date(Date.UTC(hireYear + k, 0, 1));
    const days = k === 1 ? prorated : annualLeaveForYears(k - 1);
    const expire = new Date(Date.UTC(hireYear + k + 1, 0, 1));
    const active = grant <= now && now < expire;
    rows.push({ label: `${hireYear + k}년`, grant: fmt(grant), days, expire: fmt(expire), active, note: k === 1 ? `비례 연차 (${daysInHireYear}일 재직)` : '' });
    if (active) cur = { grant: fmt(grant), days, expire: fmt(expire) };
    if (!next && grant > now) next = { grant: fmt(grant), days };
    if (grant > now && rows.length >= Math.max(now.getUTCFullYear() - hireYear + 3, 5)) break;
  }
  const monthlyActive = now < firstAnniv;
  return {
    basis, completedYears, monthlyLeave: monthly, monthlyActive, monthlyExpire: fmt(firstAnniv),
    current: cur, next, rows, prorated, daysInHireYear,
    total: (monthlyActive ? monthly : 0) + (cur ? cur.days : 0),
  };
}
