// CalcMate 정적 사이트 빌더 — 외부 의존성 없음
// 사용: node build.mjs  (환경변수 SITE_URL, BASE_PATH, ADSENSE_CLIENT, COUPANG_PARTNER_ID 선택)
import { mkdir, rm, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './src/config.mjs';
import { tools } from './src/tools/index.mjs';
import { pages } from './src/pages/index.mjs';
import { loadArticles, renderArticlePage, renderBlogIndex } from './src/pages/blog.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const layout = await readFile(path.join(ROOT, 'src/layout.html'), 'utf8');
const urls = [];

function render(page) {
  const canonical = config.siteUrl + config.basePath + page.path;
  const jsonld = [].concat(page.jsonld || []).filter(Boolean)
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  const verification = [
    config.googleSiteVerification && `<meta name="google-site-verification" content="${config.googleSiteVerification}">`,
    config.naverSiteVerification && `<meta name="naver-site-verification" content="${config.naverSiteVerification}">`,
  ].filter(Boolean).join('\n');
  const adsenseHead = config.adsenseClient
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClient}" crossorigin="anonymous"></script>`
    : '';
  const scripts = (page.scripts || []).map((s) => `<script type="module" src="${config.basePath}/js/${s}"></script>`).join('\n');
  const vars = {
    title: page.title.includes(config.siteName) ? page.title : `${page.title} | ${config.siteName}`,
    description: page.description, canonical, siteName: config.siteName, tagline: config.tagline,
    base: config.basePath, year: new Date().getFullYear(), content: page.content,
    jsonld, verification, adsenseHead, scripts,
  };
  return layout.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
}

async function emit(page) {
  const html = render(page);
  const outDir = path.join(DIST, page.path);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html);
  urls.push({ loc: config.siteUrl + config.basePath + page.path, priority: page.priority ?? 0.6, lastmod: page.lastmod });
}

// ---- build ----
const t0 = Date.now();
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(path.join(ROOT, 'src/public'), DIST, { recursive: true });
await cp(path.join(ROOT, 'src/client'), path.join(DIST, 'js'), { recursive: true });
// 브라우저에서 import 하는 공용 엔진 (html.mjs 는 Node 전용이라 제외)
await mkdir(path.join(DIST, 'lib'), { recursive: true });
for (const f of await readdir(path.join(ROOT, 'src/lib'))) {
  if (f !== 'html.mjs') await cp(path.join(ROOT, 'src/lib', f), path.join(DIST, 'lib', f));
}

const articles = await loadArticles(ROOT);
const ctx = { config, tools, articles };

let count = 0;
for (const p of pages) { await emit(await p(ctx)); count++; }
for (const tool of tools) {
  await emit({ ...(await tool.page(ctx)), path: `/${tool.slug}/`, priority: 0.9 }); count++;
  if (tool.pages) for (const sub of await tool.pages(ctx)) { await emit({ ...sub, priority: 0.7 }); count++; }
}
await emit(renderBlogIndex(ctx)); count++;
for (const a of articles) { await emit(renderArticlePage(ctx, a)); count++; }

// sitemap / robots / 404
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}${config.basePath}/sitemap.xml\n`);
await writeFile(path.join(DIST, '404.html'), render({ path: '/404/', title: '페이지를 찾을 수 없습니다', description: '요청하신 페이지가 존재하지 않습니다.', content: `<h1>페이지를 찾을 수 없습니다</h1><p><a href="${config.basePath}/">홈으로 돌아가기</a></p>` }));
if (existsSync(path.join(ROOT, 'CNAME'))) await cp(path.join(ROOT, 'CNAME'), path.join(DIST, 'CNAME'));
await writeFile(path.join(DIST, '.nojekyll'), '');

console.log(`✔ ${count} pages → dist/  (${Date.now() - t0}ms)  base="${config.basePath}"  url=${config.siteUrl}`);
