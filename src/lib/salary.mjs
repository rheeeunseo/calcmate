// 연봉 실수령액 계산 엔진
// 기준: 2026년 4대보험 요율 및 2025년 귀속 근로소득세율. 매년 1월/7월 요율 확인 필요.
// 결과는 간이세액표 근사치이며 실제 급여명세서와 수천 원 단위 차이가 날 수 있음.

export const RATES_2026 = {
  year: 2026,
  pension: 0.0475,          // 국민연금 근로자 부담 (2026년 4.75%, 2033년까지 매년 0.5%p 인상)
  pensionMinMonthly: 400000,   // 기준소득월액 하한
  pensionMaxMonthly: 6370000,  // 기준소득월액 상한 (2025.7~2026.6)
  health: 0.03595,          // 건강보험 근로자 부담 (2026년 7.19%의 절반)
  longTermCare: 0.1295,     // 장기요양보험 = 건강보험료 × 12.95%
  employment: 0.009,        // 고용보험 근로자 부담 0.9%
  localTaxRate: 0.10,       // 지방소득세 = 소득세의 10%
};

// 근로소득공제 (소득세법 §47)
export function earnedIncomeDeduction(gross) {
  let d;
  if (gross <= 5_000_000) d = gross * 0.7;
  else if (gross <= 15_000_000) d = 3_500_000 + (gross - 5_000_000) * 0.4;
  else if (gross <= 45_000_000) d = 7_500_000 + (gross - 15_000_000) * 0.15;
  else if (gross <= 100_000_000) d = 12_000_000 + (gross - 45_000_000) * 0.05;
  else d = 14_750_000 + (gross - 100_000_000) * 0.02;
  return Math.min(d, 20_000_000);
}

// 종합소득세 기본세율 (2023년 개정, 2025년 귀속 동일)
const BRACKETS = [
  [14_000_000, 0.06, 0],
  [50_000_000, 0.15, 1_260_000],
  [88_000_000, 0.24, 5_760_000],
  [150_000_000, 0.35, 15_440_000],
  [300_000_000, 0.38, 19_940_000],
  [500_000_000, 0.40, 25_940_000],
  [1_000_000_000, 0.42, 35_940_000],
  [Infinity, 0.45, 65_940_000],
];
export function progressiveTax(base) {
  if (base <= 0) return 0;
  for (const [limit, rate, sub] of BRACKETS) if (base <= limit) return base * rate - sub;
  return 0;
}

// 근로소득세액공제 (소득세법 §59)
export function earnedIncomeTaxCredit(calcTax, gross) {
  let credit = calcTax <= 1_300_000 ? calcTax * 0.55 : 715_000 + (calcTax - 1_300_000) * 0.30;
  let cap;
  if (gross <= 33_000_000) cap = 740_000;
  else if (gross <= 70_000_000) cap = Math.max(740_000 - (gross - 33_000_000) * 0.008, 660_000);
  else if (gross <= 120_000_000) cap = Math.max(660_000 - (gross - 70_000_000) * 0.5, 500_000);
  else cap = Math.max(500_000 - (gross - 120_000_000) * 0.5, 200_000);
  return Math.min(credit, cap);
}

/**
 * @param {object} p
 * @param {number} p.annual        연봉 (원)
 * @param {number} [p.nonTaxable]  월 비과세액 (식대 등, 기본 200,000)
 * @param {number} [p.dependents]  부양가족 수 (본인 포함, 기본 1)
 * @param {number} [p.children]    8세 이상 20세 이하 자녀 수 (기본 0)
 * @param {object} [p.rates]
 */
export function calcSalary({ annual, nonTaxable = 200_000, dependents = 1, children = 0, rates = RATES_2026 }) {
  const monthlyGross = annual / 12;
  const monthlyTaxable = Math.max(monthlyGross - nonTaxable, 0);

  // 4대보험 (월)
  const pensionBase = Math.min(Math.max(monthlyTaxable, rates.pensionMinMonthly), rates.pensionMaxMonthly);
  const pension = Math.floor(pensionBase * rates.pension / 10) * 10;
  const health = Math.floor(monthlyTaxable * rates.health / 10) * 10;
  const longTermCare = Math.floor(health * rates.longTermCare / 10) * 10;
  const employment = Math.floor(monthlyTaxable * rates.employment / 10) * 10;
  const insurance = pension + health + longTermCare + employment;

  // 소득세 (연 단위 계산 후 12로 나눔)
  const annualTaxable = monthlyTaxable * 12;
  const incomeAmount = annualTaxable - earnedIncomeDeduction(annualTaxable);
  const personal = 1_500_000 * Math.max(dependents, 1);
  const annualPension = pension * 12;
  const annualSpecial = (health + longTermCare + employment) * 12;
  const taxBase = Math.max(incomeAmount - personal - annualPension - annualSpecial, 0);
  const calcTax = progressiveTax(taxBase);
  const childCredit = children === 0 ? 0 : children === 1 ? 250_000 : children === 2 ? 550_000 : 550_000 + (children - 2) * 400_000;
  const standardCredit = 130_000;
  const determined = Math.max(calcTax - earnedIncomeTaxCredit(calcTax, annualTaxable) - childCredit - standardCredit, 0);
  const incomeTax = Math.floor(determined / 12 / 10) * 10;
  const localTax = Math.floor(incomeTax * rates.localTaxRate / 10) * 10;

  const totalDeduction = insurance + incomeTax + localTax;
  const monthlyNet = monthlyGross - totalDeduction;
  return {
    annual, monthlyGross, monthlyTaxable, nonTaxable,
    pension, health, longTermCare, employment, insurance,
    incomeTax, localTax, totalDeduction,
    monthlyNet, annualNet: monthlyNet * 12,
    deductionRate: totalDeduction / monthlyGross,
    taxBase, rates,
  };
}
