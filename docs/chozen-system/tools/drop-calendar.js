#!/usr/bin/env node
// Renders the ChoZen 30-day runway + drop-week timeline with real dates and enforces Shabbat.
// node drop-calendar.js --drop 2027-01-10T19:00 --window 7 [--md]   (Detroit local time)
// "!!" lines are hard stops. "note:" lines are information.
const { sunsetUTC, detroitParts, detroitToUTC, isShabbat, fmtTime } = require('./shabbat');
const PLAN = require('./runway.json');
const MARGIN_MIN = 60;   // Friday work must finish this long before sundown
const AFTER_MIN = 30;    // Saturday-night sends go out this long after sundown
const QUIET_START = 8 * 60, QUIET_END = 21 * 60; // texts only 8 AM-9 PM ET (common US quiet hours; verify for your list)
const inHours = dt => { const p = detroitParts(dt); const t = p.hh * 60 + p.mm; return t >= QUIET_START && t <= QUIET_END; };

function addDays(y, m, d, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
const fmtFull = dt => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(dt);
const addMin = (dt, n) => new Date(dt.getTime() + n * 60000);

// Make a timed send Shabbat-safe without changing how far before the drop it lands
// by more than a few hours: inside Shabbat -> Saturday night after sundown (if still before `deadline`),
// otherwise Friday, an hour before sundown.
function safeSend(at, deadline) {
  if (!isShabbat(at)) {
    const p = detroitParts(at);
    if (p.wd === 'Fri' && at > addMin(sunsetUTC(p.y, p.m, p.d), -MARGIN_MIN))
      return { at: addMin(sunsetUTC(p.y, p.m, p.d), -MARGIN_MIN), note: 'pulled to 1h before Friday sundown' };
    return { at, note: '' };
  }
  const p = detroitParts(at);
  const sat = p.wd === 'Sat' ? p : addDays(p.y, p.m, p.d, 1);
  const satNight = addMin(sunsetUTC(sat.y, sat.m, sat.d), AFTER_MIN);
  if ((!deadline || satNight < deadline) && inHours(satNight)) return { at: satNight, note: 'moved to Saturday night, 30 min after sundown' };
  const fri = p.wd === 'Fri' ? p : addDays(sat.y, sat.m, sat.d, -1);
  return { at: addMin(sunsetUTC(fri.y, fri.m, fri.d), -MARGIN_MIN), note: 'moved to 1h before Friday sundown (copy uses the day name, so it stays true)' };
}

function build(dropLocal, windowDays = 7) {
  const errors = [], notes = [];
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(dropLocal))) throw new Error('drop must be YYYY-MM-DDTHH:MM');
  windowDays = Number(windowDays);
  if (!Number.isInteger(windowDays)) throw new Error('--window must be a whole number of days (7-10)');
  const [date, time] = dropLocal.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '19:00').split(':').map(Number);
  const dropAt = detroitToUTC(y, m, d, hh, mm);
  const dp = detroitParts(dropAt);
  if (isShabbat(dropAt)) errors.push('Drop time falls inside Shabbat. Pick Sunday-Thursday.');
  if (dp.wd === 'Fri' || dp.wd === 'Sat') errors.push(`${dp.wd === 'Fri' ? 'Friday' : 'Saturday'} drop: not allowed (COO: never Friday/Saturday). Pick Sunday or Monday.`);
  if (!inHours(dropAt) || !inHours(addMin(dropAt, 15))) errors.push('Drop time must be between 8 AM and 8:45 PM ET so Texts 4 + 5 land inside texting hours.');
  if (dp.wd !== 'Sun' && dp.wd !== 'Mon') notes.push(`${dp.wd} drop is allowed, but the ChoZen default is Sunday or Monday (COO/CMO): a full work week of fulfillment before Shabbat.`);
  if (windowDays < 7 || windowDays > 10) errors.push('Pre-order window must be 7-10 days (CPO rule).');
  const close = addDays(y, m, d, windowDays);
  const closeAt = detroitToUTC(close.y, close.m, close.d, hh, mm);
  const cwd = detroitParts(closeAt).wd;
  if (isShabbat(closeAt) || cwd === 'Fri' || cwd === 'Sat')
    errors.push(`Pre-order window (${windowDays} days) closes ${cwd} ${close.m}/${close.d}: on or next to Shabbat. Pick a length that closes Sun-Thu.`);

  // 30-day runway (content). Saturday content moves to Sunday; Saturday sends go out Saturday night.
  const rows = PLAN.map(task => {
    const day = addDays(y, m, d, -task.daysBefore);
    let at = detroitToUTC(day.y, day.m, day.d, task.hour || hh, mm);
    let note = '';
    if (task.type === 'send' || task.type === 'drop') {
      const s = safeSend(at, dropAt); at = s.at; note = s.note;
      if (isShabbat(at)) errors.push(`Day ${30 - task.daysBefore} send could not be made Shabbat-safe.`);
      if (!inHours(at)) errors.push(`Day ${30 - task.daysBefore} send lands outside 8 AM-9 PM ET (${fmtFull(at)}).`);
    } else {
      const wd = detroitParts(at).wd;
      if (wd === 'Sat') { const n = addDays(day.y, day.m, day.d, 1); at = detroitToUTC(n.y, n.m, n.d, 12, 0); note = 'moved from Sat -> Sun'; }
      else if (wd === 'Fri') note = `finish by ${fmtTime(addMin(sunsetUTC(day.y, day.m, day.d), -MARGIN_MIN))} (1h before sundown)`;
    }
    const p = detroitParts(at);
    const when = (task.type === 'send' || task.type === 'drop') ? fmtFull(at) : `${p.wd} ${p.m}/${p.d}`;
    return { day: 30 - task.daysBefore, date: when, type: task.type, task: task.task, note };
  });

  // Drop-week timeline (every timed action from Z4), each checked for Shabbat.
  const dayBefore = addDays(y, m, d, -1);
  const timeline = [
    ['Day before: test order, link check, schedule sends (Z4)', detroitToUTC(dayBefore.y, dayBefore.m, dayBefore.d, 12, 0), dropAt],
    ['Drop: unlock for the list, Text 4 + Email 5', dropAt, null],
    ['+15 min: open to everybody, Text 5', addMin(dropAt, 15), null],
    ['Few hours later: Text 6 + Email 6 (only if true)', (() => { const cap = detroitToUTC(y, m, d, 20, 45); const t = addMin(dropAt, 180); return t > cap ? cap : t; })(), null],
    ['Next morning: Text 7 thank-you', (() => { const n = addDays(y, m, d, 1); return detroitToUTC(n.y, n.m, n.d, 10, 0); })(), null],
    ['Window close -24h reminder (only if open)', addMin(closeAt, -1440), closeAt],
    ['Window closes', closeAt, null],
  ].map(([what, at, deadline]) => {
    if (what.startsWith('Day before')) {
      // prep work, not a send: if Saturday (or Friday), finish Friday before sundown
      const p = detroitParts(at);
      if (p.wd === 'Fri') return { what, when: `Fri ${p.m}/${p.d} by ${fmtTime(addMin(sunsetUTC(p.y, p.m, p.d), -MARGIN_MIN))}`, note: '1h before sundown' };
      if (p.wd === 'Sat') { const f = addDays(p.y, p.m, p.d, -1); return { what, when: `Fri ${f.m}/${f.d} by ${fmtTime(addMin(sunsetUTC(f.y, f.m, f.d), -MARGIN_MIN))}`, note: 'Saturday is Shabbat: do it Friday' }; }
      return { what, when: `${p.wd} ${p.m}/${p.d}`, note: '' };
    }
    if (what === 'Window closes' || what.startsWith('Drop:') || what.startsWith('+15')) {
      if (isShabbat(at)) errors.push(`${what} lands inside Shabbat (${fmtFull(at)}).`);
      return { what, when: fmtFull(at), note: '' };
    }
    const s = safeSend(at, deadline);
    if (isShabbat(s.at)) errors.push(`${what} could not be made Shabbat-safe.`);
    if (!inHours(s.at)) errors.push(`${what} lands outside 8 AM-9 PM ET texting hours (${fmtFull(s.at)}).`);
    if (what.startsWith('Few hours') && s.at - dropAt < 45 * 60000) s.note = 'too close to the drop: skip, or fold into Text 7 next morning (only if true)';
    return { what, when: fmtFull(s.at), note: s.note };
  });
  return { dropAt, closeAt, rows, timeline, errors, notes };
}

module.exports = { build, safeSend };

if (require.main === module) {
  const arg = f => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : undefined; };
  if (!arg('--drop')) { console.error('usage: node drop-calendar.js --drop YYYY-MM-DDTHH:MM --window 7 [--md]   (Detroit time)'); process.exit(1); }
  let r;
  try { r = build(arg('--drop'), arg('--window') ?? 7); } catch (e) { console.error('!! ' + e.message); process.exit(1); }
  const md = process.argv.includes('--md'), B = md ? '- ' : '';
  const full = dt => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', dateStyle: 'full', timeStyle: 'short' }).format(dt);
  console.log(B + `DROP: ${full(r.dropAt)}`);
  console.log(B + `PRE-ORDER WINDOW CLOSES: ${full(r.closeAt)}`);
  r.errors.forEach(e => console.log(B + '!! ' + e));
  r.notes.forEach(e => console.log(B + 'note: ' + e));
  if (md) {
    console.log('\n**30-day runway**\n\n| Day | When | Type | Task | Note |\n|---|---|---|---|---|');
    r.rows.forEach(x => console.log(`| ${x.day} | ${x.date} | ${x.type} | ${x.task} | ${x.note} |`));
    console.log('\n**Drop week**\n\n| What | When (ET) | Note |\n|---|---|---|');
    r.timeline.forEach(x => console.log(`| ${x.what} | ${x.when} | ${x.note} |`));
  } else { console.table(r.rows); console.table(r.timeline); }
  if (r.errors.length) process.exit(2);
}
