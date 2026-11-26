// Builds pdf/ChoZen-System.pdf from the playbook markdown. Black / Gold / Silver.
// cd docs/chozen-system/pdf && npm install && npm run build
const fs = require('fs'), path = require('path');
const { marked } = require('marked');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const ORDER = [
  ['README.md', '00', 'The System'], ['Z0-design.md', 'Z0', 'Design'], ['Z1-validate.md', 'Z1', 'Validate'],
  ['Z2-list.md', 'Z2', 'The List'], ['Z3-runway.md', 'Z3', '30-Day Runway'], ['Z4-drop-day.md', 'Z4', 'Drop Day'],
  ['Z5-fulfill.md', 'Z5', 'Make & Fulfill'], ['Z6-after.md', 'Z6', 'After the Order'], ['Z7-debrief.md', 'Z7', 'Debrief → Next'],
  ['messages.md', 'MSG', 'Message Library'], ['worksheets.md', 'WS', 'Worksheets'],
];
// Rewrite cross-file links to in-PDF anchors.
const fixLinks = md => md.replace(/\]\(([A-Za-z0-9-]+)\.md(#[^)]*)?\)/g, (_, f) => `](#sec-${f})`)
  .replace(/\]\((tools\/|pdf\/)[^)]*\)/g, '](#)');
const sections = ORDER.map(([file, num, title]) => {
  const html = marked.parse(fixLinks(fs.readFileSync(path.join(ROOT, file), 'utf8')));
  return `<section class="part" id="sec-${file.replace('.md', '')}">
    <div class="opener"><div class="num">${num}</div><div class="kicker">THE CHOZEN SYSTEM</div><div class="title">${title}</div></div>
    <div class="body">${html}</div></section>`;
}).join('\n');
const toc = ORDER.slice(1).map(([f, n, t]) => `<a href="#sec-${f.replace('.md', '')}"><span>${n}</span>${t}</a>`).join('');
const css = `
@page { size: Letter; margin: .55in 0 .6in; background: #0B0B0A; } @page :first { margin: 0; }
:root { --black:#0B0B0A; --panel:#151513; --gold:#C9A646; --gold2:#E6C766; --silver:#C7C9CC; --text:#E9E6DD; --muted:#9A968B; }
* { box-sizing:border-box; }
html,body { margin:0; background:var(--black); color:var(--text); font-family:'Inter',sans-serif; font-size:10.2pt; line-height:1.5; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.cover { height:11in; padding:1in .85in; display:flex; flex-direction:column; justify-content:space-between; page-break-after:always;
  background: radial-gradient(ellipse at 85% 10%, rgba(201,166,70,.22), transparent 55%), linear-gradient(160deg,#0B0B0A 55%,#1a1712); }
.wordmark { font-family:'Inter Display',sans-serif; font-weight:900; letter-spacing:.32em; font-size:15pt; color:var(--silver); }
.wordmark b { color:var(--gold); }
.cover h1 { font-family:'Inter Display',sans-serif; font-weight:900; font-size:66pt; line-height:.92; letter-spacing:-.02em; margin:0; text-transform:uppercase; }
.cover h1 em { font-style:normal; color:var(--gold); display:block; }
.cover .sub { font-size:14pt; color:var(--silver); max-width:5.6in; margin-top:.25in; }
.cover .verse { color:var(--muted); font-size:10pt; border-left:2px solid var(--gold); padding-left:12px; max-width:5.2in; }
.chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:.3in; }
.chips span { border:1px solid #3a3426; background:#1a1812; color:var(--gold2); font-size:8pt; letter-spacing:.14em; padding:6px 10px; border-radius:4px; text-transform:uppercase; font-weight:600; }
.tocpage { height:9.8in; padding:.4in .85in; page-break-after:always; }
.tocpage h2 { font-family:'Inter Display'; font-weight:900; font-size:34pt; text-transform:uppercase; margin:0 0 .4in; }
.tocpage h2 em { color:var(--gold); font-style:normal; }
.toc a { display:flex; gap:18px; align-items:baseline; padding:12px 0; border-bottom:1px solid #2a2720; color:var(--text); text-decoration:none; font-size:15pt; font-weight:600; }
.toc a span { color:var(--gold); font-family:'Inter Display'; font-weight:900; width:.7in; }
.part { page-break-before:always; }
.opener { padding:.3in .85in .3in; background:linear-gradient(180deg,#14120d,transparent); }
.opener .num { font-family:'Inter Display'; font-weight:900; font-size:72pt; line-height:1; color:transparent; -webkit-text-stroke:1.5px var(--gold); }
.opener .kicker { color:var(--gold); letter-spacing:.32em; font-size:8pt; font-weight:700; margin-top:8px; }
.opener .title { font-family:'Inter Display'; font-weight:900; font-size:34pt; text-transform:uppercase; line-height:1; margin-top:4px; }
.body { padding:0 .85in .7in; }
.body h1 { display:none; }
.body h2 { font-family:'Inter Display'; font-weight:800; text-transform:uppercase; color:var(--gold2); font-size:15pt; margin:22px 0 8px; letter-spacing:.02em; page-break-after:avoid; }
.body h3 { color:var(--silver); font-size:11.5pt; margin:16px 0 6px; text-transform:uppercase; letter-spacing:.06em; page-break-after:avoid; }
.body h3:first-child { color:var(--muted); font-weight:500; text-transform:none; letter-spacing:0; }
.body strong { color:#fff; }
.body a { color:var(--gold2); text-decoration:none; }
.body blockquote { margin:12px 0; padding:10px 14px; background:var(--panel); border-left:3px solid var(--gold); border-radius:0 6px 6px 0; color:#d9d5ca; page-break-inside:avoid; }
.body blockquote p { margin:3px 0; }
.body table { width:100%; border-collapse:collapse; margin:10px 0 14px; font-size:8.8pt; page-break-inside:auto; }
.body tr { page-break-inside:avoid; }
.body th { text-align:left; background:#211e16; color:var(--gold2); text-transform:uppercase; letter-spacing:.08em; font-size:7.6pt; padding:7px 8px; border-bottom:1px solid var(--gold); }
.body td { padding:6px 8px; border-bottom:1px solid #2a2720; vertical-align:top; }
.body code { font-family:'DejaVu Sans Mono',monospace; font-size:8.3pt; background:#1d1b16; color:var(--gold2); padding:1px 5px; border-radius:3px; }
.body pre { background:#121110; border:1px solid #2a2720; border-radius:6px; padding:10px 12px; white-space:pre-wrap; page-break-inside:avoid; }
.body pre code { background:none; padding:0; color:var(--silver); }
.body ul, .body ol { padding-left:20px; } .body li { margin:3px 0; }
.body hr { border:none; border-top:1px solid #2a2720; margin:18px 0; }
.body input[type=checkbox] { accent-color:#C9A646; }
.end { height:9.8in; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; page-break-before:always; padding:1in; }
.end h2 { font-family:'Inter Display'; font-weight:900; font-size:40pt; text-transform:uppercase; line-height:1; margin:0; }
.end h2 em { color:var(--gold); font-style:normal; display:block; }
.end p { color:var(--silver); margin-top:20px; }
`;
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>The ChoZen System</title><style>${css}</style></head><body>
<div class="cover">
  <div class="wordmark">CHO<b>Z</b>EN&nbsp;UNLIMITED</div>
  <div><div class="kicker" style="color:var(--gold);letter-spacing:.32em;font-size:9pt;font-weight:700;margin-bottom:14px">THE REVERSE DROP · BUILT FOR THE SET-APART</div>
    <h1>The ChoZen<em>System</em></h1>
    <div class="sub">Point A to Point Z. From the first sketch to the front door, and back to the list for the next drop.</div>
    <div class="chips"><span>Design</span><span>Validate</span><span>The List</span><span>30-Day Runway</span><span>Drop Day</span><span>Make &amp; Fulfill</span><span>After the Order</span><span>Debrief</span></div></div>
  <div class="verse">“But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people.” (1 Peter 2:9)</div>
</div>
<div class="tocpage"><h2>Do it in <em>this order.</em></h2><div class="toc">${toc}</div></div>
${sections}
<div class="end"><h2>Find the buyers first.<em>Then make the run.</em></h2><p>Sabbath kept · Every claim checkable · Every body fits</p><p style="color:var(--gold);letter-spacing:.3em;font-weight:700">CHOZEN</p></div>
</body></html>`;
(async () => {
  const out = path.join(__dirname, 'ChoZen-System.html');
  fs.writeFileSync(out, html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + out, { waitUntil: 'networkidle' });
  await page.pdf({ path: path.join(__dirname, 'ChoZen-System.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('built pdf/ChoZen-System.pdf');
})();
