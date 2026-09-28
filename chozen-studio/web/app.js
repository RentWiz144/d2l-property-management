const $ = (sel) => document.querySelector(sel);
const api = async (path, opts) => {
  const res = await fetch(path, {
    ...opts,
    headers: opts?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const json = await res.json().catch(() => ({ ok: false, error: 'Bad response from the local server.' }));
  if (!json.ok && json.error) throw new Error(json.error);
  return json;
};

const state = { view: 'image', catalog: null, model: { image: null, video: null }, jobs: [], timer: null };

const fmt = {
  credits: (n) => (n == null ? '—' : n.toLocaleString('en-US')),
  usd: (n) => (n == null ? '—' : `$${n.toFixed(2)}`),
  bytes: (n) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`),
  when: (ms) => new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
};

function banner(msg) {
  const el = $('#banner');
  if (!msg) { el.hidden = true; return; }
  el.hidden = false;
  el.textContent = msg;
}

/* ------------------------------------------------------------- bootstrap */
async function bootstrap() {
  try {
    const b = await api('/api/bootstrap');
    state.catalog = b.models;
    $('#hud-credits').textContent = fmt.credits(b.credits);
    $('#hud-usd').textContent = fmt.usd(b.creditsUsd);
    $('#hud-spend').textContent = fmt.usd(b.spend?.usd ?? 0);
    $('#output-path').textContent = b.outputDir;

    if (!b.hasKey) banner('No kie.ai API key found. Copy .env.example to .env, add KIE_API_KEY, then restart ChoZen Studio.');
    else if (b.balanceError) banner(`Could not read your balance: ${b.balanceError}`);
    else banner(null);

    state.model.image = b.models.image[0]?.id ?? null;
    state.model.video = b.models.video[0]?.id ?? null;
    renderCreate();
  } catch (err) {
    banner(`Could not reach the local server: ${err.message}`);
  }
}

/* ----------------------------------------------------------------- views */
function setView(view) {
  state.view = view;
  document.querySelectorAll('.rail-btn').forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle('is-active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const lib = view === 'library';
  $('#view-create').hidden = lib;
  $('#view-library').hidden = !lib;
  if (lib) loadLibrary(); else renderCreate();
}

function renderCreate() {
  if (!state.catalog) return;
  const kind = state.view;
  $('#create-title').textContent = kind === 'video' ? 'Make a video' : 'Make an image';
  $('#prompt').placeholder = kind === 'video'
    ? 'Describe the shot. Motion, camera move, pacing, mood — the more specific, the steadier the result.'
    : 'Describe what you want. Specific beats poetic — subject, lighting, mood, lens.';

  const models = state.catalog[kind];
  $('#model-grid').innerHTML = models.map((m) => `
    <button type="button" class="model-card" role="radio" data-id="${m.id}"
            aria-checked="${m.id === state.model[kind]}">
      <span class="model-name">${m.label}</span>
      <span class="model-id">${m.id}</span>
      ${m.verified ? '' : '<span class="model-flag">⚠ slug unconfirmed</span>'}
    </button>`).join('');

  $('#model-grid').querySelectorAll('.model-card').forEach((card) => {
    card.addEventListener('click', () => { state.model[kind] = card.dataset.id; renderCreate(); });
  });

  renderParams(models.find((m) => m.id === state.model[kind]));
}

function renderParams(model) {
  const box = $('#params');
  if (!model) { box.innerHTML = ''; return; }
  const opts = state.catalog.options;
  const sel = (name, label, values) => `
    <div class="param">
      <label class="field-label" for="p-${name}">${label}</label>
      <select id="p-${name}" data-param="${name}">
        ${values.map((v) => `<option value="${v}">${v}</option>`).join('')}
      </select>
    </div>`;

  box.innerHTML = model.params.map((p) => {
    if (p === 'aspect_ratio') return sel('aspect_ratio', 'Aspect', opts.aspect_ratio);
    if (p === 'resolution') return sel('resolution', 'Resolution', opts.resolution);
    if (p === 'duration') return sel('duration', 'Duration (s)', opts.duration);
    if (p === 'generate_audio') return `
      <div class="param param-check">
        <input type="checkbox" id="p-generate_audio" data-param="generate_audio">
        <label for="p-generate_audio">Generate audio</label>
      </div>`;
    return '';
  }).join('');
}

function collectParams() {
  const out = {};
  $('#params').querySelectorAll('[data-param]').forEach((el) => {
    const key = el.dataset.param;
    if (el.type === 'checkbox') out[key] = el.checked;
    else if (key === 'duration') out[key] = Number(el.value);
    else out[key] = el.value;
  });
  return out;
}

/* ------------------------------------------------------------- generate */
async function generate() {
  const btn = $('#generate');
  const prompt = $('#prompt').value.trim();
  if (!prompt) { banner('Enter a prompt first.'); $('#prompt').focus(); return; }

  btn.classList.add('is-loading');
  btn.disabled = true;
  banner(null);
  try {
    await api('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ kind: state.view, model: state.model[state.view], prompt, params: collectParams() }),
    });
    $('#prompt').value = '';
    await refreshJobs();
  } catch (err) {
    banner(err.message);
  } finally {
    btn.classList.remove('is-loading');
    btn.disabled = false;
  }
}

/* ----------------------------------------------------------------- jobs */
const STATE_LABEL = { waiting: 'Waiting', queuing: 'Queued', generating: 'Generating', success: 'Done', fail: 'Failed' };

async function refreshJobs() {
  try {
    const { jobs } = await api('/api/jobs');
    state.jobs = jobs;
    renderJobs();
  } catch { /* the poller retries; a dropped tick is not worth a banner */ }
}

function renderJobs() {
  const box = $('#jobs');
  if (!state.jobs.length) {
    box.innerHTML = `<div class="empty">
      <p class="empty-title">Nothing generated yet</p>
      <p class="empty-body">Write a prompt above and hit Generate. Finished work lands in your Library automatically.</p>
    </div>`;
    return;
  }
  box.innerHTML = state.jobs.slice(0, 24).map((j) => {
    const pct = j.state === 'success' ? 100 : Math.min(95, j.progress || 0);
    const media = (j.files || []).map((f) => {
      const src = `/api/file?path=${encodeURIComponent(f)}`;
      return j.kind === 'video'
        ? `<video src="${src}" controls preload="metadata"></video>`
        : `<img src="${src}" alt="Result for: ${escapeAttr(j.prompt)}" loading="lazy">`;
    }).join('');

    return `<article class="job">
      <div class="job-top">
        <p class="job-prompt">${escapeHtml(j.prompt)}</p>
        <span class="chip chip-${j.state}">${STATE_LABEL[j.state] || j.state}</span>
      </div>
      <p class="job-meta">${j.modelLabel || j.model} · ${fmt.when(j.createdAt)}${
        j.creditsConsumed ? ` · ${fmt.credits(j.creditsConsumed)} credits` : ''}</p>
      ${['success', 'fail'].includes(j.state) ? '' : `<div class="bar"><span style="width:${pct}%"></span></div>`}
      ${media ? `<div class="job-out">${media}</div>` : ''}
      ${j.state === 'fail' ? `<p class="job-error">${escapeHtml(j.failMsg || j.failCode || 'Generation failed.')}</p>` : ''}
      ${j.saveError ? `<p class="job-error">Generated, but saving locally failed: ${escapeHtml(j.saveError)}</p>` : ''}
    </article>`;
  }).join('');
}

/* -------------------------------------------------------------- library */
async function loadLibrary() {
  const box = $('#library');
  box.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  try {
    const { files, outputDir } = await api('/api/library');
    $('#output-path').textContent = outputDir;
    if (!files.length) {
      box.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <p class="empty-title">Your library is empty</p>
        <p class="empty-body">Generate an image or a video and it will be saved here automatically.</p>
      </div>`;
      return;
    }
    box.innerHTML = files.map((f) => {
      const src = `/api/file?path=${encodeURIComponent(f.path)}`;
      return `<figure class="tile" style="margin:0">
        ${f.kind === 'video'
          ? `<video src="${src}" controls preload="metadata"></video>`
          : `<img src="${src}" alt="${escapeAttr(f.name)}" loading="lazy">`}
        <figcaption class="tile-meta">
          <div class="tile-name">${escapeHtml(f.name)}</div>
          <div class="tile-sub">${fmt.bytes(f.size)} · ${fmt.when(f.modified)}</div>
        </figcaption>
      </figure>`;
    }).join('');
  } catch (err) {
    box.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <p class="empty-title">Could not read the library</p>
      <p class="empty-body">${escapeHtml(err.message)}</p>
    </div>`;
  }
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeAttr = (s) => escapeHtml(s).slice(0, 180);

/* ------------------------------------------------------------------ wire */
document.querySelectorAll('.rail-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
$('#generate').addEventListener('click', generate);
$('#reveal').addEventListener('click', () => api('/api/reveal', { method: 'POST' }).catch(() => {}));
$('#prompt').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate();
});

bootstrap().then(refreshJobs);
state.timer = setInterval(() => {
  if (state.view !== 'library') refreshJobs();
}, 3000);
