// 브라우저 공용 유틸
import { parseNum, num } from '../lib/format.mjs';
export const $ = (id) => document.getElementById(id);
export const val = (id) => parseNum($(id)?.value);
export const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
export const setHtml = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

// 입력 이벤트 바인딩 + 칩 버튼 + 초기 실행. 숫자 입력은 blur 시 콤마 포맷.
export function bind(ids, fn) {
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    el.addEventListener('input', fn);
    el.addEventListener('change', fn);
    if (el.tagName === 'INPUT' && el.getAttribute('inputmode') === 'numeric') {
      el.addEventListener('blur', () => { const n = parseNum(el.value); if (el.value !== '' && Number.isFinite(n)) el.value = num(n); });
      el.addEventListener('focus', () => el.select());
    }
  }
  document.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
    const el = $(b.dataset.set); if (!el) return;
    el.value = el.tagName === 'INPUT' && el.getAttribute('inputmode') === 'numeric' ? num(parseNum(b.dataset.value)) : b.dataset.value;
    fn();
  }));
  // URL 쿼리로 초기값 주입 (?annual=35000000 등)
  const q = new URLSearchParams(location.search);
  for (const id of ids) { const el = $(id); if (el && q.has(id)) el.value = q.get(id); }
  fn();
}
