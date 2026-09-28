import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, renameSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { STATE_FILE, OUTPUT_DIR, creditsToUsd } from './config.js';

// Job history and the spend ledger, persisted as one JSON file next to the app.
// Small enough that atomic whole-file writes are the right call; no database.

const EMPTY = { jobs: [], version: 1 };

function read() {
  if (!existsSync(STATE_FILE)) return structuredClone(EMPTY);
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    return { ...structuredClone(EMPTY), ...parsed };
  } catch {
    // A corrupt state file must never stop the app from starting.
    return structuredClone(EMPTY);
  }
}

function write(state) {
  // Write-then-rename: rename is atomic within a filesystem, so a crash
  // mid-write can never leave a half-written state.json behind.
  const tmp = `${STATE_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, STATE_FILE);
}

let state = read();

export function addJob(job) {
  state.jobs.unshift({
    ...job,
    createdAt: job.createdAt || Date.now(),
    state: job.state || 'waiting',
    progress: 0,
    urls: [],
    files: [],
    creditsConsumed: 0,
  });
  state.jobs = state.jobs.slice(0, 200);
  write(state);
  return state.jobs[0];
}

export function updateJob(taskId, patch) {
  const job = state.jobs.find((j) => j.taskId === taskId);
  if (!job) return null;
  Object.assign(job, patch);
  write(state);
  return job;
}

export const getJob = (taskId) => state.jobs.find((j) => j.taskId === taskId) || null;
export const listJobs = () => state.jobs;
export const activeJobs = () => state.jobs.filter((j) => !['success', 'fail'].includes(j.state));

/** Credits spent inside the current calendar month, and that figure in USD. */
export function monthSpend() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const credits = state.jobs
    .filter((j) => j.createdAt >= startOfMonth)
    .reduce((sum, j) => sum + (Number(j.creditsConsumed) || 0), 0);
  return { credits, usd: creditsToUsd(credits) };
}

/** Download a finished result to OUTPUT_DIR. Returns the local path. */
export async function saveResult(url, taskId, index) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);

  let ext = extname(new URL(url).pathname);
  if (!ext) {
    const type = res.headers.get('content-type') || '';
    ext = type.includes('video') ? '.mp4' : type.includes('png') ? '.png' : '.jpg';
  }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const name = `${stamp}_${taskId.slice(-8)}${index ? `_${index + 1}` : ''}${ext}`;
  const dest = join(OUTPUT_DIR, name);

  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return dest;
}

/** Everything already on disk in the output folder, newest first. */
export async function listLibrary() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const names = await readdir(OUTPUT_DIR);
  const items = await Promise.all(
    names
      .filter((n) => !n.startsWith('.'))
      .map(async (n) => {
        const full = join(OUTPUT_DIR, n);
        const s = await stat(full);
        const ext = extname(n).toLowerCase();
        return {
          name: basename(n),
          path: full,
          size: s.size,
          modified: s.mtimeMs,
          kind: ['.mp4', '.mov', '.webm'].includes(ext) ? 'video' : 'image',
        };
      }),
  );
  return items.sort((a, b) => b.modified - a.modified);
}

export { OUTPUT_DIR };
