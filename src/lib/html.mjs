// 빌드 타임 HTML 헬퍼 (Node 전용)
import { config } from '../config.mjs';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const base = config.basePath;

// 광고 슬롯. 애드센스 ID가 설정되면 실제 코드, 아니면 아무것도 출력하지 않음
// (AD_PLACEHOLDER=1 로 빌드하면 개발 확인용 자리표시자를 표시)
export function ad(slot = 'inArticle') {
  if (!config.adsenseClient) return process.env.AD_PLACEHOLDER ? `<div class="ad" data-slot="${slot}">광고 영역 (${slot})</div>` : '';
  const slotId = config.adsenseSlots[slot];
  if (!slotId) return '';
  return `<div class="ad live"><ins class="adsbygoogle" style="display:block" data-ad-client="${config.adsenseClient}" data-ad-slot="${slotId}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}

// 제휴 박스 (쿠팡파트너스 등). 파트너 ID 없으면 미노출
export function affiliate({ title, desc, url, cta = '자세히 보기' }) {
  if (!config.coupangPartnerId) return '';
  return `<aside class="affiliate"><div class="t">${esc(title)}</div><div class="d">${esc(desc)}</div><p style="margin:10px 0 0"><a class="btn ghost" href="${esc(url)}" target="_blank" rel="nofollow sponsored noopener">${esc(cta)}</a></p></aside>`;
}

export function faqHtml(faq) {
  if (!faq?.length) return '';
  return `<section class="faq"><h2>자주 묻는 질문</h2>${faq.map((q) => `<details><summary>${esc(q.q)}</summary><p>${q.a}</p></details>`).join('')}</section>`;
}

export function faqJsonld(faq) {
  if (!faq?.length) return null;
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/<[^>]+>/g, '') } })),
  };
}

export function webAppJsonld({ name, description, url }) {
  return {
    '@context': 'https://schema.org', '@type': 'WebApplication', name, description, url,
    applicationCategory: 'FinanceApplication', operatingSystem: 'All', inLanguage: 'ko',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  };
}

export function breadcrumb(items) {
  return `<div class="breadcrumb">${items.map((i, idx) => i.href ? `<a href="${base}${i.href}">${esc(i.name)}</a>` : esc(i.name)).join(' › ')}</div>`;
}

export function relatedTools(tools, currentSlug) {
  const others = tools.filter((t) => t.slug !== currentSlug);
  return `<section class="related"><h2>다른 계산기</h2><div class="pill-list">${others.map((t) => `<a href="${base}/${t.slug}/">${esc(t.name)}</a>`).join('')}</div></section>`;
}

export function field({ id, label, value = '', unit = '', hint = '', type = 'text', inputmode = 'numeric', chips = [] }) {
  const chipHtml = chips.length ? `<div class="chips">${chips.map((c) => `<button type="button" data-set="${id}" data-value="${c.v}">${esc(c.l)}</button>`).join('')}</div>` : '';
  return `<div class="field"><label for="${id}">${esc(label)}${unit ? ` <span class="muted">(${esc(unit)})</span>` : ''}</label><input id="${id}" type="${type}" inputmode="${inputmode}" value="${esc(value)}" autocomplete="off">${hint ? `<div class="hint">${esc(hint)}</div>` : ''}${chipHtml}</div>`;
}

export function select({ id, label, options, value }) {
  return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${options.map((o) => `<option value="${esc(o.v)}"${String(o.v) === String(value) ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select></div>`;
}
