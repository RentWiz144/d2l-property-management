import { API_KEY, KIE_BASE_URL } from './config.js';

// kie.ai REST adapter.
//
// Every endpoint and field below was taken from the live docs at docs.kie.ai,
// not from memory:
//   POST /api/v1/jobs/createTask      -> { code, msg, data: { taskId } }
//   GET  /api/v1/jobs/recordInfo      -> { code, msg, data: { state, resultJson, ... } }
//   GET  /api/v1/chat/credit          -> { code, msg, data: <integer credits> }
// Auth is a bearer token on every call. Documented rate limit is 20 new
// generation requests per 10 seconds; we throttle below that on purpose.

const BASE = KIE_BASE_URL;

export const TERMINAL_STATES = new Set(['success', 'fail']);
export const ALL_STATES = ['waiting', 'queuing', 'generating', 'success', 'fail'];

export class KieError extends Error {
  constructor(message, { status, code, failCode } = {}) {
    super(message);
    this.name = 'KieError';
    this.status = status;
    this.code = code;
    this.failCode = failCode;
  }
}

function assertKey() {
  if (!API_KEY) {
    throw new KieError(
      'No kie.ai API key. Copy .env.example to .env and set KIE_API_KEY.',
      { code: 'NO_KEY' },
    );
  }
}

async function request(path, { method = 'GET', body, timeoutMs = 30_000 } = {}) {
  assertKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new KieError(`kie.ai did not respond within ${timeoutMs / 1000}s.`, { code: 'TIMEOUT' });
    }
    throw new KieError(`Could not reach kie.ai: ${err.message}`, { code: 'NETWORK' });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new KieError(`kie.ai returned a non-JSON response (HTTP ${res.status}).`, { status: res.status });
  }

  if (res.status === 401) throw new KieError('kie.ai rejected the API key (401).', { status: 401, code: 'UNAUTHORIZED' });
  if (res.status === 429) throw new KieError('Rate limited by kie.ai (429). Wait a few seconds.', { status: 429, code: 'RATE_LIMIT' });
  if (!res.ok) throw new KieError(json.msg || `kie.ai error (HTTP ${res.status}).`, { status: res.status, code: json.code });

  // kie.ai returns HTTP 200 with a non-200 body code on some failures.
  if (json.code != null && Number(json.code) !== 200) {
    throw new KieError(json.msg || `kie.ai error (code ${json.code}).`, { status: res.status, code: json.code });
  }
  return json;
}

/** Remaining credits, as an integer. */
export async function getCredits() {
  const json = await request('/api/v1/chat/credit');
  return Number(json.data) || 0;
}

/** Submit a generation task. Returns the taskId. */
export async function createTask(model, input) {
  if (!model) throw new KieError('No model selected.', { code: 'NO_MODEL' });
  if (!input?.prompt?.trim()) throw new KieError('A prompt is required.', { code: 'NO_PROMPT' });
  const json = await request('/api/v1/jobs/createTask', { method: 'POST', body: { model, input } });
  const taskId = json?.data?.taskId;
  if (!taskId) throw new KieError('kie.ai accepted the request but returned no taskId.', { code: 'NO_TASK_ID' });
  return taskId;
}

/**
 * Poll one task. Normalises the awkward parts of the payload:
 * resultJson arrives as a JSON *string*, not an object.
 */
export async function getTask(taskId) {
  const json = await request(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
  const d = json.data || {};

  let urls = [];
  if (d.resultJson) {
    try {
      const parsed = typeof d.resultJson === 'string' ? JSON.parse(d.resultJson) : d.resultJson;
      if (Array.isArray(parsed?.resultUrls)) urls = parsed.resultUrls;
      else if (Array.isArray(parsed?.resultObject?.mask_urls)) urls = parsed.resultObject.mask_urls;
    } catch {
      // A malformed resultJson should not sink an otherwise successful task.
      urls = [];
    }
  }

  return {
    taskId: d.taskId || taskId,
    model: d.model || '',
    state: d.state || 'waiting',
    progress: Number(d.progress) || 0,
    urls,
    creditsConsumed: Number(d.creditsConsumed) || 0,
    costTimeMs: Number(d.costTime) || 0,
    failCode: d.failCode || '',
    failMsg: d.failMsg || '',
    createTime: d.createTime || null,
    completeTime: d.completeTime || null,
  };
}

export const isTerminal = (state) => TERMINAL_STATES.has(state);
