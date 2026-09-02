// 대출 상환 계산 엔진

/**
 * @param {object} p
 * @param {number} p.principal   대출 원금
 * @param {number} p.annualRate  연이율 (% 단위, 예 4.5)
 * @param {number} p.months      상환 기간 (개월)
 * @param {'equalPayment'|'equalPrincipal'|'bullet'} p.method
 * @param {number} [p.graceMonths] 거치 기간 (개월)
 */
export function calcLoan({ principal, annualRate, months, method = 'equalPayment', graceMonths = 0 }) {
  const r = annualRate / 100 / 12;
  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= graceMonths; m++) {
    const interest = balance * r;
    totalInterest += interest;
    schedule.push({ month: m, payment: interest, principal: 0, interest, balance });
  }
  const n = months - graceMonths;
  if (n <= 0) return { schedule, totalInterest, totalPayment: principal + totalInterest, monthlyPayment: 0, firstPayment: 0 };

  if (method === 'equalPayment') {
    const pay = r === 0 ? principal / n : principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      const prin = m === n ? balance : pay - interest;
      balance = Math.max(balance - prin, 0);
      totalInterest += interest;
      schedule.push({ month: graceMonths + m, payment: prin + interest, principal: prin, interest, balance });
    }
  } else if (method === 'equalPrincipal') {
    const prinPay = principal / n;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      balance = Math.max(balance - prinPay, 0);
      totalInterest += interest;
      schedule.push({ month: graceMonths + m, payment: prinPay + interest, principal: prinPay, interest, balance });
    }
  } else { // bullet: 만기일시상환
    for (let m = 1; m <= n; m++) {
      const interest = principal * r;
      const prin = m === n ? principal : 0;
      totalInterest += interest;
      balance = m === n ? 0 : principal;
      schedule.push({ month: graceMonths + m, payment: prin + interest, principal: prin, interest, balance });
    }
  }
  return {
    schedule, totalInterest,
    totalPayment: principal + totalInterest,
    monthlyPayment: schedule[graceMonths]?.payment ?? 0,
    firstPayment: schedule[graceMonths]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
  };
}

// 원리금균등 월 상환액만 빠르게
export function monthlyPayment(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}
