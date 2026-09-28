import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env reader. Avoids a dependency so the app runs on a clean machine
// with nothing but Node installed — which is the whole point of a double-click app.
function loadEnv() {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

export const ROOT_DIR = ROOT;
export const API_KEY = process.env.KIE_API_KEY || '';
// Override the API host. Useful for a proxy or for testing against a local mock;
// leave unset in normal use.
export const KIE_BASE_URL = process.env.KIE_BASE_URL || 'https://api.kie.ai';
export const PORT = Number(process.env.PORT) || 4173;
export const OUTPUT_DIR = process.env.OUTPUT_DIR || join(homedir(), 'ChoZenStudio', 'output');
export const STATE_FILE = join(ROOT, 'state.json');

// Verified against the live account in the ChoZen Studio TUI:
// 8,130 credits displayed as "about $40.65"  ->  8130 * 0.005 = 40.65 exactly.
export const USD_PER_CREDIT = 0.005;

export const creditsToUsd = (credits) => (Number(credits) || 0) * USD_PER_CREDIT;
