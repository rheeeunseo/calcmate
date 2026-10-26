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

// 검색에 노출할 금액별 하위 페이지. 여기에 없는 하위 페이지는 그대로 만들되 noindex 처리하고 사이트맵에서 뺀다
// (금액만 다른 유사 페이지가 대량으로 색인되지 않도록).
const INDEXED_SUBPAGES = {
  salary: [3000, 3500, 4000, 5000, 10000],
  loan: [10000, 30000],
  'acquisition-tax': [50000, 120000, 200000], // 12억·20억은 서치 콘솔 노출 확인
  brokerage: [50000],
  'home-cost': [50000, 100000],
  parttime: [10320],
};
const isIndexedSub = (slug, subPath) => (INDEXED_SUBPAGES[slug] || []).includes(Number(subPath.split('/').filter(Boolean).pop()));

function render(page) {
  const canonical = config.siteUrl + config.basePath + page.path;
  const jsonld = [].concat(page.jsonld || []).filter(Boolean)
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  const verification = [
    config.googleSiteVerification && `<meta name="google-site-verification" content="${config.googleSiteVerification}">`,
    config.naverSiteVerification && `<meta name="naver-site-verification" content="${config.naverSiteVerification}">`,
    config.bingSiteVerification && `<meta name="msvalidate.01" content="${config.bingSiteVerification}">`,
  ].filter(Boolean).join('\n');
  const analytics = config.gaId
    // ?notrack=1 로 한 번 들어오면 그 브라우저의 방문은 통계에서 빠짐 (?track=1 로 해제)
    ? `<script>(function(){try{var p=new URLSearchParams(location.search),k='cm_notrack';if(p.get('notrack')==='1'&&localStorage.getItem(k)!=='1'){localStorage.setItem(k,'1');alert('이 브라우저의 방문은 이제 방문자 통계에서 빠집니다.');}if(p.get('track')==='1'&&localStorage.getItem(k)==='1'){localStorage.removeItem(k);alert('이 브라우저의 방문이 다시 방문자 통계에 잡힙니다.');}if(localStorage.getItem(k)==='1')window['ga-disable-${config.gaId}']=true;}catch(e){}})();</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.gaId}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${config.gaId}');</script>`
    : '';
  // 검색에서 숨긴 유사 페이지에는 광고를 넣지 않는다 (애드센스 '가치 없는 콘텐츠' 판정 방지)
  const adsenseHead = config.adsenseClient && !page.noindex
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClient}" crossorigin="anonymous"></script>`
    : '';
  const scripts = (page.scripts || []).map((s) => `<script type="module" src="${config.basePath}/js/${s}"></script>`).join('\n');
  const vars = {
    title: page.title.includes(config.siteName) ? page.title : `${page.title} | ${config.siteName}`,
    description: page.description, canonical, siteName: config.siteName, tagline: config.tagline,
    base: config.basePath, year: new Date().getFullYear(), content: page.content,
    jsonld, verification, adsenseHead, analytics, scripts,
    affiliateNotice: config.coupangPartnerId ? '    <p class="muted">이 사이트는 쿠팡파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.</p>\n' : '',
    robots: page.noindex ? '<meta name="robots" content="noindex, follow">' : '',
  };
  return layout.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
}

async function emit(page) {
  const html = render(page);
  const outDir = path.join(DIST, page.path);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html);
  if (!page.noindex) urls.push({ loc: config.siteUrl + config.basePath + page.path, priority: page.priority ?? 0.6, lastmod: page.lastmod });
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
  if (tool.pages) for (const sub of await tool.pages(ctx)) { await emit({ ...sub, priority: 0.7, noindex: !isIndexedSub(tool.slug, sub.path) }); count++; }
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
// 애드센스 ads.txt (판매자 인증). 클라이언트 ID가 설정된 경우에만 생성
if (config.adsenseClient) await writeFile(path.join(DIST, 'ads.txt'), `google.com, ${config.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);

console.log(`✔ ${count} pages → dist/  (${Date.now() - t0}ms)  base="${config.basePath}"  url=${config.siteUrl}`);
