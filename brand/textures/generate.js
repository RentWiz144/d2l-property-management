#!/usr/bin/env node
// ChoZen motion texture pack via kie.ai Seedance 2.0.
// Usage: node brand/textures/generate.js            -> dry run: prints plan + cost, sends nothing
//        node brand/textures/generate.js --confirm  -> creates tasks, polls, downloads MP4s to brand/textures/out/
//        --only liquid-chrome                       -> limit to one clip
// Needs env KIE_API_KEY (set in the cloud environment's Network secrets / env vars).
const fs = require('fs');
const path = require('path');

const API = 'https://api.kie.ai';
// kie.ai/seedance-2-0, checked 2026-11-05: text-to-video ("no video") USD per second by resolution.
const USD_PER_SEC = { '480p': 0.095, '720p': 0.205, '1080p': 0.51 };

const args = process.argv.slice(2);
const confirm = args.includes('--confirm');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf8'));
const clips = cfg.clips.filter(c => !only || c.id === only);
if (!clips.length) { console.error(`No clip with id "${only}".`); process.exit(1); }

const plan = clips.map(c => ({ ...cfg.defaults, ...c }));
let total = 0;
for (const p of plan) {
  const rate = USD_PER_SEC[p.resolution];
  if (rate === undefined) { console.error(`No price on file for ${p.resolution}; refusing.`); process.exit(1); }
  const cost = rate * p.duration;
  total += cost;
  console.log(`${p.id}: ${p.duration}s @ ${p.resolution} ${p.aspect_ratio} ~ $${cost.toFixed(2)}`);
}
console.log(`Estimated total: $${total.toFixed(2)} (model ${cfg.model}; verify at kie.ai/pricing)`);

if (!confirm) { console.log('Dry run only. Re-run with --confirm to generate.'); process.exit(0); }
const key = process.env.KIE_API_KEY;
if (!key) { console.error('KIE_API_KEY is not set. Add it in the environment settings and start a new session.'); process.exit(1); }

const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(method, url, body) {
  const res = await fetch(API + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json.code && json.code !== 200)) throw new Error(`${method} ${url} -> HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  return json;
}

(async () => {
  const outDir = path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of plan) {
    const input = { prompt: p.prompt, resolution: p.resolution, aspect_ratio: p.aspect_ratio, duration: p.duration, generate_audio: p.generate_audio };
    const created = await api('POST', '/api/v1/jobs/createTask', { model: cfg.model, input });
    const taskId = created.data && created.data.taskId;
    if (!taskId) throw new Error(`No taskId for ${p.id}: ${JSON.stringify(created).slice(0, 300)}`);
    console.log(`${p.id}: task ${taskId} created, polling...`);
    let rec;
    for (let i = 0; i < 120; i++) { // up to ~20 minutes
      await sleep(10000);
      rec = (await api('GET', `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`)).data || {};
      if (rec.state === 'success' || rec.state === 'fail') break;
    }
    if (!rec || rec.state !== 'success') { console.error(`${p.id}: ${rec ? rec.state : 'no record'} ${rec && rec.failMsg ? rec.failMsg : ''}`); continue; }
    const urls = (JSON.parse(rec.resultJson || '{}').resultUrls) || [];
    for (const [n, u] of urls.entries()) {
      const file = path.join(outDir, `${p.id}${urls.length > 1 ? '-' + n : ''}.mp4`);
      const r = await fetch(u);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      console.log(`${p.id}: saved ${file} (credits used: ${rec.creditsConsumed ?? 'n/a'})`);
    }
  }
})().catch(e => { console.error(e.message); process.exit(1); });
