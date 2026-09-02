// 숫자 포맷 유틸 (브라우저 + Node 공용)
export const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';
export const num = (n, d = 0) => Number(n).toLocaleString('ko-KR', { maximumFractionDigits: d, minimumFractionDigits: d });
export const pct = (n, d = 2) => num(n, d) + '%';

// 12345678 -> "1,234만 5,678원"
export function wonKo(n) {
  n = Math.round(n);
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  const eok = Math.floor(n / 1e8);
  const man = Math.floor((n % 1e8) / 1e4);
  const rest = n % 1e4;
  const parts = [];
  if (eok) parts.push(eok.toLocaleString('ko-KR') + '억');
  if (man) parts.push(man.toLocaleString('ko-KR') + '만');
  if (rest || parts.length === 0) parts.push(rest.toLocaleString('ko-KR'));
  return sign + parts.join(' ') + '원';
}

// 입력 문자열에서 숫자만 추출
export const parseNum = (s) => {
  const v = String(s ?? '').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
