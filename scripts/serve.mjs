// dist/ 를 서빙하는 초경량 개발 서버: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 8080);
const base = process.env.BASE_PATH || '';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  let file = path.join(DIST, p);
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch { file = path.join(DIST, '404.html'); }
  try {
    const body = await readFile(file);
    res.writeHead(file.endsWith('404.html') ? 404 : 200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(port, () => console.log(`▶ http://localhost:${port}${base}/`));
