// 2分セキュリティ診断の答えを受け取って、集計する。
// POST /answer … 診断ページから答えを1件受け取る（診断ページ以外からは受け付けない）
// GET  /stats  … 集計を返す（選択肢ごとの人数・年代ごとの人数）
// ★IPアドレスやブラウザの情報は保存しない。保存するのは日付・年代・9問の答えだけ。

const ORIGIN = "https://mikiyoko.github.io";
const OPTIONS = [3, 4, 3, 3, 3, 3, 3, 3, 3]; // 問いごとの選択肢の数（Q1〜Q9）
const AGES = 8; // 10代〜70代以上・答えない

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors, ...extra } });

function valid(body) {
  if (!body || !Array.isArray(body.answers) || body.answers.length !== OPTIONS.length) return false;
  if (!body.answers.every((v, i) => Number.isInteger(v) && v >= 0 && v < OPTIONS[i])) return false;
  return Number.isInteger(body.age) && body.age >= 0 && body.age < AGES;
}

async function answer(request, env) {
  if (request.headers.get("Origin") !== ORIGIN) return json({ error: "forbidden" }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  if (!valid(body)) return json({ error: "bad request" }, 400);
  const day = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 日本時間の日付
  await env.DB.prepare(
    "INSERT INTO answers (day, age, q1, q2, q3, q4, q5, q6, q7, q8, q9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(day, body.age, ...body.answers).run();
  return new Response(null, { status: 204, headers: cors });
}

async function stats(env) {
  const { results } = await env.DB.prepare(
    "SELECT age, q1, q2, q3, q4, q5, q6, q7, q8, q9, COUNT(*) AS n FROM answers GROUP BY age, q1, q2, q3, q4, q5, q6, q7, q8, q9"
  ).all();
  let total = 0;
  const questions = OPTIONS.map((k) => Array(k).fill(0));
  const ages = Array(AGES).fill(0);
  for (const r of results) {
    total += r.n;
    ages[r.age] += r.n;
    for (let i = 0; i < OPTIONS.length; i++) questions[i][r["q" + (i + 1)]] += r.n;
  }
  return json({ total, questions, ages }, 200, { "Cache-Control": "public, max-age=300" });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (pathname === "/answer" && request.method === "POST") return answer(request, env);
    if (pathname === "/stats" && request.method === "GET") return stats(env);
    return json({ error: "not found" }, 404);
  },
};
