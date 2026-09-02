// 적금 / 예금 / 복리 / 퇴직금 / 부가세 계산 엔진

export const TAX = { normal: 0.154, preferential: 0.095, free: 0 }; // 일반과세 15.4%, 세금우대 9.5%, 비과세

// 정기적금 (매월 초 납입, 단리 또는 월복리)
export function calcSavings({ monthly, months, annualRate, compound = false, taxType = 'normal' }) {
  const r = annualRate / 100 / 12;
  const principal = monthly * months;
  let interest = 0;
  if (!compound) {
    // 단리: 각 회차 납입금은 (남은 개월 수) 만큼 이자 발생
    interest = monthly * r * (months * (months + 1) / 2);
  } else {
    let bal = 0;
    for (let m = 0; m < months; m++) bal = (bal + monthly) * (1 + r);
    interest = bal - principal;
  }
  const tax = interest * TAX[taxType];
  return { principal, interest, tax, net: principal + interest - tax, afterTaxInterest: interest - tax };
}

// 정기예금 (일시 예치)
export function calcDeposit({ principal, months, annualRate, compound = false, taxType = 'normal' }) {
  const r = annualRate / 100 / 12;
  const interest = compound ? principal * (Math.pow(1 + r, months) - 1) : principal * r * months;
  const tax = interest * TAX[taxType];
  return { principal, interest, tax, net: principal + interest - tax, afterTaxInterest: interest - tax };
}

// 복리 투자 시뮬레이션 (초기금 + 매월 적립, 연 n회 복리)
export function calcCompound({ initial = 0, monthly = 0, years, annualRate, periodsPerYear = 12 }) {
  const r = annualRate / 100 / periodsPerYear;
  const n = years * periodsPerYear;
  const monthlyPerPeriod = monthly * 12 / periodsPerYear;
  const rows = [];
  let bal = initial;
  let contributed = initial;
  for (let i = 1; i <= n; i++) {
    bal = bal * (1 + r) + monthlyPerPeriod;
    contributed += monthlyPerPeriod;
    if (i % periodsPerYear === 0) rows.push({ year: i / periodsPerYear, balance: bal, contributed, gain: bal - contributed });
  }
  return { final: bal, contributed, gain: bal - contributed, rows };
}

// 퇴직금 (근로자퇴직급여보장법: 평균임금 × 30일 × 재직일수 / 365)
export function calcSeverance({ startDate, endDate, last3MonthsPay, annualBonus = 0, annualLeavePay = 0 }) {
  const start = new Date(startDate), end = new Date(endDate);
  const days = Math.round((end - start) / 86_400_000) + 1;
  // 퇴직 전 3개월 일수 (퇴직일 기준 역산)
  const threeMonthsAgo = new Date(end); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const periodDays = Math.round((end - threeMonthsAgo) / 86_400_000);
  const totalPay = last3MonthsPay + annualBonus * 3 / 12 + annualLeavePay * 3 / 12;
  const avgDaily = totalPay / periodDays;
  const severance = days >= 365 ? avgDaily * 30 * days / 365 : 0;
  return { days, periodDays, avgDaily, severance, eligible: days >= 365 };
}

// 부가세 10%
export function calcVat({ amount, mode }) {
  // mode: 'supply' 공급가액 입력 | 'total' 합계 입력
  if (mode === 'supply') return { supply: amount, vat: amount * 0.1, total: amount * 1.1 };
  const supply = amount / 1.1;
  return { supply, vat: amount - supply, total: amount };
}
