import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import { exec } from 'node:child_process';
import { ROOT_DIR, PORT, OUTPUT_DIR, API_KEY, creditsToUsd } from './config.js';
import * as kie from './kie.js';
import * as store from './store.js';

const catalog = JSON.parse(readFileSync(join(ROOT_DIR, 'models.json'), 'utf8'));
const WEB = join(ROOT_DIR, 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
};

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('Malformed JSON body.'); }
}

/* ---------------------------------------------------------------- polling */
// One shared loop drives every in-flight job. The documented kie.ai limit is
// 20 requests / 10s; a 3s interval over a handful of jobs stays well under it.

let polling = false;
async function pollOnce() {
  if (polling) return;
  polling = true;
  try {
    for (const job of store.activeJobs()) {
      try {
        const t = await kie.getTask(job.taskId);
        const patch = {
          state: t.state, progress: t.progress,
          creditsConsumed: t.creditsConsumed, urls: t.urls,
          failCode: t.failCode, failMsg: t.failMsg,
        };
        if (t.state === 'success' && t.urls.length && !job.files?.length) {
          const files = [];
          for (const [i, url] of t.urls.entries()) {
            try { files.push(await store.saveResult(url, job.taskId, i)); }
            catch (err) { patch.saveError = err.message; }
          }
          patch.files = files;
        }
        store.updateJob(job.taskId, patch);
      } catch (err) {
        // A transient poll failure must not kill the loop or the job. Only a
        // hard auth failure is worth surfacing on the job itself.
        if (err.code === 'UNAUTHORIZED' || err.code === 'NO_KEY') {
          store.updateJob(job.taskId, { state: 'fail', failMsg: err.message });
        }
      }
    }
  } finally {
    polling = false;
  }
}
setInterval(pollOnce, 3000).unref?.();

/* ----------------------------------------------------------------- routes */
const routes = {
  'GET /api/bootstrap': async () => {
    const out = {
      ok: true, hasKey: Boolean(API_KEY), outputDir: OUTPUT_DIR,
      models: catalog, spend: store.monthSpend(),
      credits: null, creditsUsd: null, balanceError: null,
    };
    if (API_KEY) {
      try {
        out.credits = await kie.getCredits();
        out.creditsUsd = creditsToUsd(out.credits);
      } catch (err) { out.balanceError = err.message; }
    }
    return out;
  },

  'POST /api/generate': async (req) => {
    const { kind, model, prompt, params = {} } = await readBody(req);
    if (!['image', 'video'].includes(kind)) throw new Error('kind must be "image" or "video".');
    const known = catalog[kind].find((m) => m.id === model);
    if (!known) throw new Error(`Unknown ${kind} model: ${model}`);

    const input = { prompt: String(prompt || '').trim() };
    for (const key of known.params) {
      if (params[key] !== undefined && params[key] !== '') input[key] = params[key];
    }
    const taskId = await kie.createTask(model, input);
    const job = store.addJob({ taskId, model, modelLabel: known.label, kind, prompt: input.prompt, input });
    pollOnce();
    return { ok: true, job };
  },

  'GET /api/jobs': async () => ({ ok: true, jobs: store.listJobs() }),
  'GET /api/library': async () => ({ ok: true, outputDir: OUTPUT_DIR, files: await store.listLibrary() }),

  'POST /api/reveal': async () => {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
    exec(`${cmd} "${OUTPUT_DIR}"`);
    return { ok: true, outputDir: OUTPUT_DIR };
  },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const key = `${req.method} ${url.pathname}`;

  if (routes[key]) {
    try { return json(res, 200, await routes[key](req, url)); }
    catch (err) { return json(res, err.status || 400, { ok: false, error: err.message, code: err.code }); }
  }

  // Serve a generated file for in-page preview. Confined to OUTPUT_DIR:
  // resolve the request and reject anything that escapes the folder.
  if (req.method === 'GET' && url.pathname === '/api/file') {
    const target = resolve(url.searchParams.get('path') || '');
    const root = resolve(OUTPUT_DIR);
    if (target !== root && !target.startsWith(root + sep)) return json(res, 403, { ok: false, error: 'Outside the output folder.' });
    if (!existsSync(target)) return json(res, 404, { ok: false, error: 'Not found.' });
    res.writeHead(200, { 'Content-Type': MIME[extname(target).toLowerCase()] || 'application/octet-stream' });
    return createReadStream(target).pipe(res);
  }

  // Static frontend.
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = resolve(join(WEB, rel));
  if (!file.startsWith(resolve(WEB))) return json(res, 403, { ok: false, error: 'Forbidden.' });
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Bind to loopback only. This app holds an API key; it must not be reachable
// from anywhere but this machine.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ChoZen Studio  →  http://localhost:${PORT}`);
  console.log(`  Output folder  →  ${OUTPUT_DIR}`);
  if (!API_KEY) console.log('\n  ⚠  No KIE_API_KEY set. Copy .env.example to .env and add your key.\n');
  else console.log('');
});
