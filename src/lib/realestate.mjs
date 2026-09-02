// 부동산 계산 엔진: 취득세, 양도소득세, 중개수수료, 전월세 전환, DSR 대출한도
// 세율·요율은 2026년 기준 지방세법·소득세법·공인중개사법 시행규칙. 매년 확인 필요.

// ---- 취득세 ----
/**
 * @param {object} p
 * @param {number} p.price       취득가액
 * @param {'house'|'land'|'commercial'} [p.type]  주택 | 토지 | 상가·오피스텔(업무용)
 * @param {number} [p.houseCount] 취득 후 보유 주택 수 (1 = 1주택자)
 * @param {boolean} [p.regulated] 조정대상지역 여부
 * @param {boolean} [p.large]     전용 85㎡ 초과 (농특세 대상)
 * @param {boolean} [p.firstHome] 생애최초 주택 (취득세 200만원 한도 감면, 12억 이하)
 */
export function calcAcquisitionTax({ price, type = 'house', houseCount = 1, regulated = false, large = false, firstHome = false }) {
  let rate, eduRate, ruralRate, label;
  if (type !== 'house') {
    rate = 0.04; eduRate = 0.004; ruralRate = 0.002; label = type === 'land' ? '토지 4%' : '상가·업무용 4%';
  } else if (houseCount >= 4 || (houseCount === 3 && regulated)) {
    rate = 0.12; eduRate = 0.004; ruralRate = large ? 0.01 : 0; label = '다주택 중과 12%';
  } else if (houseCount === 3 || (houseCount === 2 && regulated)) {
    rate = 0.08; eduRate = 0.004; ruralRate = large ? 0.006 : 0; label = '다주택 중과 8%';
  } else {
    // 1주택 또는 비조정 2주택: 6억 이하 1%, 6~9억 1~3% (선형), 9억 초과 3%
    if (price <= 600_000_000) rate = 0.01;
    else if (price <= 900_000_000) rate = Math.round((price * 2 / 300_000_000 - 3) * 100) / 10000; // 소수점 4자리(0.01%) 반올림
    else rate = 0.03;
    eduRate = rate / 10; ruralRate = large ? 0.002 : 0; label = `주택 ${(rate * 100).toFixed(2)}%`;
  }
  let acquisition = Math.floor(price * rate);
  let reduction = 0;
  if (firstHome && type === 'house' && houseCount === 1 && price <= 1_200_000_000) { reduction = Math.min(acquisition, 2_000_000); }
  const education = Math.floor(price * eduRate);
  const rural = Math.floor(price * ruralRate);
  const total = acquisition - reduction + education + rural;
  return { price, rate, label, acquisition, reduction, education, rural, total, effectiveRate: total / price };
}

// ---- 중개수수료 (주택 매매·임대차, 2021.10 개정 상한요율) ----
const SALE_HOUSE = [[50e6, 0.006, 250_000], [200e6, 0.005, 800_000], [900e6, 0.004, null], [1200e6, 0.005, null], [1500e6, 0.006, null], [Infinity, 0.007, null]];
const RENT_HOUSE = [[50e6, 0.005, 200_000], [100e6, 0.004, 300_000], [600e6, 0.003, null], [1200e6, 0.004, null], [1500e6, 0.005, null], [Infinity, 0.006, null]];
/**
 * @param {object} p
 * @param {'sale'|'rent'} p.deal   매매·교환 | 임대차
 * @param {'house'|'officetel'|'other'} p.type  주택 | 주거용 오피스텔 | 기타(상가·토지)
 * @param {number} p.price   매매가 또는 거래금액 (임대차: 보증금 + 월세×100, 5천만 미만이면 월세×70)
 * @param {number} [p.deposit] 임대차 보증금 (price 대신 deposit+monthly 로 입력 가능)
 * @param {number} [p.monthly] 월세
 * @param {'general'|'simplified'|'none'} [p.vat] 중개사 과세 유형 (일반 10%, 간이 약 4%, 면세)
 */
export function calcBrokerage({ deal, type = 'house', price, deposit, monthly = 0, vat = 'general' }) {
  let amount = price;
  if (deal === 'rent' && deposit !== undefined) {
    amount = deposit + monthly * 100;
    if (amount < 50e6) amount = deposit + monthly * 70;
  }
  let rate, cap = null, note = '';
  if (type === 'house') {
    const table = deal === 'sale' ? SALE_HOUSE : RENT_HOUSE;
    for (const [limit, r, c] of table) if (amount <= limit) { rate = r; cap = c; break; }
    note = '주택 법정 상한요율';
  } else if (type === 'officetel') {
    rate = deal === 'sale' ? 0.005 : 0.004; note = '주거용 오피스텔 (전용 85㎡ 이하, 부엌·화장실 구비) 상한요율';
  } else {
    rate = 0.009; note = '상가·토지 등은 0.9% 이내에서 협의';
  }
  let fee = amount * rate;
  if (cap !== null) fee = Math.min(fee, cap);
  fee = Math.floor(fee);
  const vatRate = vat === 'general' ? 0.1 : vat === 'simplified' ? 0.04 : 0;
  const vatAmount = Math.floor(fee * vatRate);
  return { amount, rate, cap, fee, vatAmount, total: fee + vatAmount, note };
}

// ---- 전월세 전환 ----
/** 전세 보증금 ↔ 월세 전환. rate = 전환율(%), 법정 상한 = 기준금리 + 2%p */
export function convertJeonse({ jeonse, deposit, rate }) {
  const monthly = (jeonse - deposit) * (rate / 100) / 12;
  return { jeonse, deposit, rate, monthly, yearly: monthly * 12 };
}
export function convertMonthly({ deposit, monthly, rate }) {
  const jeonse = deposit + monthly * 12 / (rate / 100);
  return { deposit, monthly, rate, jeonse };
}

// ---- DSR 대출한도 ----
/**
 * @param {object} p
 * @param {number} p.income        연소득 (세전)
 * @param {number} p.rate          신규 주담대 금리 (%)
 * @param {number} p.years         만기 (년)
 * @param {number} [p.stress]      스트레스 가산금리 (%p, 2025.7~ 3단계 1.5, 수도권 기준)
 * @param {number} [p.existingAnnual] 기존 대출 연간 원리금 상환액
 * @param {number} [p.dsrLimit]    DSR 한도 (은행 40, 2금융 50)
 * @param {number} [p.price]       주택가격 (LTV 계산용, 선택)
 * @param {number} [p.ltv]         LTV 한도 % (선택, 기본 70)
 */
export function calcDsrLimit({ income, rate, years, stress = 1.5, existingAnnual = 0, dsrLimit = 40, price = 0, ltv = 70 }) {
  const allowedAnnual = income * dsrLimit / 100 - existingAnnual;
  const n = years * 12, r = (rate + stress) / 100 / 12;
  const pmtPerWon = r === 0 ? 1 / n : r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1); // 원리금균등 월 상환액 / 원금
  const maxByDsr = allowedAnnual > 0 ? allowedAnnual / 12 / pmtPerWon : 0;
  const maxByLtv = price > 0 ? price * ltv / 100 : Infinity;
  const limit = Math.max(0, Math.min(maxByDsr, maxByLtv));
  const rActual = rate / 100 / 12;
  const pmtActual = rActual === 0 ? limit / n : limit * rActual * Math.pow(1 + rActual, n) / (Math.pow(1 + rActual, n) - 1);
  return { allowedAnnual, maxByDsr, maxByLtv, limit, monthlyPayment: pmtActual, stressRate: rate + stress, binding: maxByLtv < maxByDsr ? 'LTV' : 'DSR' };
}

// ---- 양도소득세 (주택, 개인) ----
const BRACKETS = [[14e6, 0.06, 0], [50e6, 0.15, 1.26e6], [88e6, 0.24, 5.76e6], [150e6, 0.35, 15.44e6], [300e6, 0.38, 19.94e6], [500e6, 0.40, 25.94e6], [1000e6, 0.42, 35.94e6], [Infinity, 0.45, 65.94e6]];
const progressive = (b) => { for (const [l, r, s] of BRACKETS) if (b <= l) return Math.max(b * r - s, 0); return 0; };
/**
 * @param {object} p
 * @param {number} p.salePrice     양도가액
 * @param {number} p.buyPrice      취득가액
 * @param {number} [p.expenses]    필요경비 (취득세, 중개수수료, 자본적 지출 등)
 * @param {number} p.holdYears     보유기간 (년)
 * @param {number} [p.liveYears]   거주기간 (년, 1세대1주택 장특공제용)
 * @param {boolean} [p.oneHouse]   1세대 1주택 (2년 이상 보유, 조정지역은 2년 거주 요건 충족 가정)
 * @param {number} [p.houseCount]  보유 주택 수 (다주택 중과는 2026.5.9 까지 유예 가정 → 기본세율 적용)
 */
export function calcCapitalGainsTax({ salePrice, buyPrice, expenses = 0, holdYears, liveYears = 0, oneHouse = false }) {
  const gain = Math.max(salePrice - buyPrice - expenses, 0);
  let taxableGain = gain, exemptGain = 0, note = '';
  if (oneHouse && holdYears >= 2) {
    if (salePrice <= 1_200_000_000) { exemptGain = gain; taxableGain = 0; note = '1세대1주택 12억 이하 비과세'; }
    else { taxableGain = gain * (salePrice - 1_200_000_000) / salePrice; exemptGain = gain - taxableGain; note = '1세대1주택 12억 초과분 과세'; }
  }
  // 장기보유특별공제
  let ltRate = 0;
  if (oneHouse && holdYears >= 3) {
    const h = Math.min(Math.floor(holdYears), 10) * 0.04, l = Math.min(Math.floor(liveYears), 10) * 0.04;
    ltRate = liveYears >= 2 ? h + l : Math.min(Math.floor(holdYears), 15) * 0.02; // 2년 미거주 시 일반공제
  } else if (holdYears >= 3) ltRate = Math.min(Math.floor(holdYears), 15) * 0.02;
  const ltDeduction = Math.floor(taxableGain * ltRate);
  const basic = taxableGain > 0 ? Math.min(2_500_000, taxableGain - ltDeduction) : 0;
  const taxBase = Math.max(taxableGain - ltDeduction - basic, 0);
  let tax, rateLabel;
  if (holdYears < 1) { tax = taxBase * 0.7; rateLabel = '1년 미만 70%'; }
  else if (holdYears < 2) { tax = taxBase * 0.6; rateLabel = '2년 미만 60%'; }
  else { tax = progressive(taxBase); rateLabel = '기본세율 6~45%'; }
  tax = Math.floor(tax);
  const local = Math.floor(tax * 0.1);
  return { gain, exemptGain, taxableGain, ltRate, ltDeduction, basic, taxBase, tax, local, total: tax + local, rateLabel, note, netProceeds: salePrice - buyPrice - expenses - tax - local };
}
