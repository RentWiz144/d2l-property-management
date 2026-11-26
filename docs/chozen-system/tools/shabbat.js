// Detroit sunset + Shabbat window (NOAA solar algorithm). No dependencies.
// Shabbat = Friday sundown -> Saturday sundown, America/Detroit.
const LAT = 42.3314, LON = -83.0458, TZ = 'America/Detroit';
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;

// Returns a Date (UTC instant) for sunset on the given Detroit calendar date (y, m 1-12, d).
function sunsetUTC(y, m, d) {
  const jd = Date.UTC(y, m - 1, d, 12) / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const C = Math.sin(rad(M)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * t) + Math.sin(rad(3 * M)) * 0.000289;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * t));
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(rad(125.04 - 1934.136 * t));
  const decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const yv = Math.tan(rad(eps / 2)) ** 2;
  const eqTime = 4 * deg(yv * Math.sin(2 * rad(L0)) - 2 * e * Math.sin(rad(M)) +
    4 * e * yv * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
    0.5 * yv * yv * Math.sin(4 * rad(L0)) - 1.25 * e * e * Math.sin(2 * rad(M)));
  const ha = deg(Math.acos(Math.cos(rad(90.833)) / (Math.cos(rad(LAT)) * Math.cos(rad(decl))) -
    Math.tan(rad(LAT)) * Math.tan(rad(decl))));
  const minutesUTC = 720 - 4 * (LON - ha) - eqTime; // sunset = +ha
  return new Date(Date.UTC(y, m - 1, d) + minutesUTC * 60000);
}

// Detroit wall-clock parts for an instant.
function detroitParts(date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  }).formatToParts(date).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, hh: +p.hour % 24, mm: +p.minute, wd: p.weekday };
}

// Convert a Detroit wall-clock time to a UTC instant.
function detroitToUTC(y, m, d, hh = 0, mm = 0) {
  let guess = Date.UTC(y, m - 1, d, hh, mm);
  for (let i = 0; i < 3; i++) {
    const p = detroitParts(new Date(guess));
    const diff = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm) - Date.UTC(y, m - 1, d, hh, mm);
    guess -= diff;
  }
  return new Date(guess);
}

// True if the instant falls inside Shabbat (Fri sunset -> Sat sunset, Detroit).
function isShabbat(date) {
  const p = detroitParts(date);
  if (p.wd === 'Fri') return date >= sunsetUTC(p.y, p.m, p.d);
  if (p.wd === 'Sat') return date < sunsetUTC(p.y, p.m, p.d);
  return false;
}

const fmtTime = date => new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(date);

module.exports = { sunsetUTC, detroitParts, detroitToUTC, isShabbat, fmtTime, TZ };
