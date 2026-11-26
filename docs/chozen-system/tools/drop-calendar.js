#!/usr/bin/env node
// Renders the ChoZen 30-day runway with real dates and enforces Shabbat.
// node drop-calendar.js --drop 2027-01-14T19:00   (Detroit local time)
const { sunsetUTC, detroitParts, detroitToUTC, isShabbat, fmtTime } = require('./shabbat');
const PLAN = require('./runway.json');

function addDays(y, m, d, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function build(dropLocal, windowDays = 7) {
  const [date, time] = dropLocal.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '19:00').split(':').map(Number);
  const dropAt = detroitToUTC(y, m, d, hh, mm);
  const errors = [];
  if (isShabbat(dropAt)) errors.push('Drop time falls inside Shabbat. Pick Sunday-Thursday, or Friday well before sundown.');
  const dp = detroitParts(dropAt);
  if (dp.wd === 'Fri') errors.push(`Friday drop: list sends + 15-min public window + first DMs must finish before sundown (${fmtTime(sunsetUTC(y, m, d))}). Recommended: move to Sun-Thu.`);
  if (dp.wd === 'Thu') errors.push('Thursday drop: the 24h "few hours later" and next-morning sends land Friday. Fine, but sends must clear before Friday sundown.');
  if (windowDays < 7 || windowDays > 10) errors.push('Pre-order window must be 7-10 days (CPO rule).');
  const close = addDays(y, m, d, windowDays);
  const closeAt = detroitToUTC(close.y, close.m, close.d, hh, mm);
  const closeWd = detroitParts(closeAt).wd;
  if (isShabbat(closeAt) || closeWd === 'Fri' || closeWd === 'Sat')
    errors.push(`Pre-order window (${windowDays} days) closes ${closeWd} ${close.m}/${close.d}: on or next to Shabbat. Use a window length that closes Sun-Thu.`);
  const rows = PLAN.map(task => {
    const day = addDays(y, m, d, -task.daysBefore);
    const noon = detroitToUTC(day.y, day.m, day.d, 12, 0);
    const wd = detroitParts(noon).wd;
    let note = '';
    let moved = day;
    if (wd === 'Sat') { // nothing on Shabbat: pull it back to Friday morning, or Sunday if it is a non-time-critical task
      moved = task.critical ? addDays(day.y, day.m, day.d, -1) : addDays(day.y, day.m, day.d, 1);
      note = task.critical ? 'moved from Sat -> Fri AM (before sundown)' : 'moved from Sat -> Sun';
    }
    if (wd === 'Fri') note = `finish before sundown ${fmtTime(sunsetUTC(day.y, day.m, day.d))}`;
    const mp = detroitParts(detroitToUTC(moved.y, moved.m, moved.d, 12, 0));
    return { day: 30 - task.daysBefore, date: `${mp.wd} ${moved.m}/${moved.d}`, type: task.type, task: task.task, note };
  });
  return { dropAt, closeAt, rows, errors };
}

module.exports = { build };

if (require.main === module) {
  const i = process.argv.indexOf('--drop');
  if (i < 0) { console.error('usage: node drop-calendar.js --drop YYYY-MM-DDTHH:MM (Detroit time)'); process.exit(1); }
  const w = process.argv.indexOf('--window');
  const { dropAt, closeAt, rows, errors } = build(process.argv[i + 1], w >= 0 ? Number(process.argv[w + 1]) : 7);
  const B = process.argv.includes('--md') ? '- ' : '';
  console.log(B + `DROP: ${new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', dateStyle: 'full', timeStyle: 'short' }).format(dropAt)}`);
  console.log(B + `PRE-ORDER WINDOW CLOSES: ${new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', dateStyle: 'full', timeStyle: 'short' }).format(closeAt)}`);
  errors.forEach(e => console.log(B + '!! ' + e));
  const md = process.argv.includes('--md');
  if (md) {
    console.log('\n| Day | Date | Type | Task | Note |\n|---|---|---|---|---|');
    rows.forEach(r => console.log(`| ${r.day} | ${r.date} | ${r.type} | ${r.task} | ${r.note} |`));
  } else console.table(rows);
}
