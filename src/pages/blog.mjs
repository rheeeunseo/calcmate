// 자동 생성 아티클(content/articles/*.json) 렌더링
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { ad, esc, base, breadcrumb } from '../lib/html.mjs';

export async function loadArticles(root) {
  const dir = path.join(root, 'content/articles');
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.json'));
  const list = [];
  for (const f of files) {
    const a = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
    if (a.draft) continue;
    list.push({ slug: f.replace(/\.json$/, ''), ...a });
  }
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function renderBlogIndex({ config, articles }) {
  return {
    path: '/blog/', priority: 0.5,
    title: '금융 가이드', description: '연봉, 세금, 대출, 저축에 관한 실용 가이드 모음.',
    content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '금융 가이드' }])}<h1>금융 가이드</h1><p class="lead">계산기와 함께 보면 좋은 실용 정보</p>
<div class="post-list">${articles.map((a) => `<a href="${base}/blog/${a.slug}/"><div class="t">${esc(a.title)}</div><div class="d">${esc(a.description)} · ${a.date}</div></a>`).join('') || '<p class="muted">아직 발행된 글이 없습니다.</p>'}</div>`,
  };
}

export function renderArticlePage({ config, tools, articles }, a) {
  const related = (a.relatedTools || []).map((s) => tools.find((t) => t.slug === s)).filter(Boolean);
  const others = articles.filter((x) => x.slug !== a.slug).slice(0, 4);
  return {
    path: `/blog/${a.slug}/`, priority: 0.6, lastmod: a.date,
    title: a.title, description: a.description,
    jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, datePublished: a.date, dateModified: a.updated || a.date, author: { '@type': 'Organization', name: config.siteName }, publisher: { '@type': 'Organization', name: config.siteName }, mainEntityOfPage: config.siteUrl + base + `/blog/${a.slug}/`, inLanguage: 'ko' },
    content: `${breadcrumb([{ name: '홈', href: '/' }, { name: '금융 가이드', href: '/blog/' }, { name: a.title }])}<article class="article"><h1>${esc(a.title)}</h1><p class="muted">${a.date}</p>${ad('top')}${a.html}${ad('bottom')}
${related.length ? `<div class="card"><strong>관련 계산기</strong><div class="pill-list" style="margin-top:8px">${related.map((t) => `<a href="${base}/${t.slug}/">${esc(t.name)}</a>`).join('')}</div></div>` : ''}
${others.length ? `<h2>다른 글</h2><div class="post-list">${others.map((x) => `<a href="${base}/blog/${x.slug}/"><div class="t">${esc(x.title)}</div><div class="d">${esc(x.description)}</div></a>`).join('')}</div>` : ''}</article>`,
  };
}
