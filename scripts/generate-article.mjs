// 자동 콘텐츠 생성: content/topics.json 의 pending 주제 하나를 골라 Claude API 로 글을 쓰고
// content/articles/<slug>.json 으로 저장한 뒤 상태를 done 으로 갱신합니다.
// 사용: ANTHROPIC_API_KEY=sk-... node scripts/generate-article.mjs [--count 1] [--slug xxx] [--dry]
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const COUNT = Number(opt('--count', 1));
const ONLY = opt('--slug', null);
const DRY = args.includes('--dry');
const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY && !DRY) { console.error('ANTHROPIC_API_KEY 환경변수가 필요합니다.'); process.exit(1); }

const topicsPath = path.join(ROOT, 'content/topics.json');
const topics = JSON.parse(await readFile(topicsPath, 'utf8'));
const queue = topics.topics.filter((t) => ONLY ? t.slug === ONLY : t.status === 'pending').slice(0, COUNT);
if (!queue.length) { console.log('발행할 pending 주제가 없습니다. content/topics.json 에 주제를 추가하세요.'); process.exit(0); }

const today = new Date().toISOString().slice(0, 10);
const toolLinks = { salary: '연봉 실수령액 계산기 → ../../salary/', loan: '대출 이자 계산기 → ../../loan/', savings: '적금 이자 계산기 → ../../savings/', deposit: '예금 이자 계산기 → ../../deposit/', severance: '퇴직금 계산기 → ../../severance/', vat: '부가세 계산기 → ../../vat/', compound: '복리 계산기 → ../../compound/', parttime: '알바 월급 계산기 → ../../parttime/', leave: '연차 계산기 → ../../leave/', 'acquisition-tax': '취득세 계산기 → ../../acquisition-tax/', 'capital-gains-tax': '양도소득세 계산기 → ../../capital-gains-tax/', brokerage: '중개수수료 계산기 → ../../brokerage/', jeonse: '전월세 전환 계산기 → ../../jeonse/', dsr: 'DSR 대출한도 계산기 → ../../dsr/' };

const SYSTEM = `당신은 한국 개인 금융 전문 에디터입니다. 검색 유입을 목표로 하는 블로그 글을 씁니다.
규칙:
- 한국어, 존댓말(~합니다). 1,300~1,800자 내외의 본문(공백 제외 기준 아님, 전체 길이).
- 첫 문단에서 핵심 답을 바로 제시(두괄식). 구체적 숫자와 계산 예시를 반드시 포함.
- 구조: 도입 문단 → h2 소제목 3~5개 → 마지막 h2 "정리". 표가 유용하면 <div class="tbl-wrap"><table class="grid"> 형식 사용.
- 법령/요율은 ${today} 기준 최신으로 서술하되 확실하지 않은 수치는 "약", "수준" 등으로 표현하고 연도를 명시.
- 관련 계산기 링크를 본문 중 자연스럽게 1~2회 삽입 (상대경로 사용).
- 과장, 투자 권유, 특정 금융상품 추천 금지. 광고성 문구 금지.
- 출력은 반드시 JSON 하나만: {"title": "...", "description": "120자 내외 메타 설명", "html": "<p>...</p>..."}. html 은 h1 없이 p, h2, h3, ul, ol, li, strong, table, a 태그만 사용. 마크다운 금지.`;

async function generate(topic) {
  const user = `주제: ${topic.title}\n관련 계산기 링크: ${(topic.relatedTools || []).map((s) => toolLinks[s]).filter(Boolean).join(' / ')}\n${topic.brief ? '추가 지시: ' + topic.brief : ''}`;
  if (DRY) return { title: topic.title, description: '(dry run)', html: `<p>${user}</p>` };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: config.articleModel, max_tokens: 4000, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content.map((c) => c.text || '').join('');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('JSON 응답을 찾지 못했습니다:\n' + text.slice(0, 500));
  const out = JSON.parse(m[0]);
  if (!out.title || !out.html) throw new Error('title/html 누락');
  out.html = out.html.replace(/<\/?(script|iframe|style)[^>]*>/gi, '');
  console.log(`  tokens in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`);
  return out;
}

for (const topic of queue) {
  console.log(`▶ 생성: ${topic.title}`);
  try {
    const out = await generate(topic);
    const article = { title: out.title, description: out.description, date: today, relatedTools: topic.relatedTools || [], html: out.html };
    await writeFile(path.join(ROOT, 'content/articles', `${topic.slug}.json`), JSON.stringify(article, null, 2) + '\n');
    topic.status = 'done'; topic.publishedAt = today;
    console.log(`  ✔ content/articles/${topic.slug}.json`);
  } catch (e) {
    topic.status = 'error'; topic.error = String(e.message).slice(0, 300);
    console.error('  ✖', e.message);
  }
}
await writeFile(topicsPath, JSON.stringify(topics, null, 2) + '\n');
