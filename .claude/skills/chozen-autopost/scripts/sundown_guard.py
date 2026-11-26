#!/usr/bin/env python3
"""
ChoZen Shabbat Sundown Guard
=============================

Hard gate on the ChoZen posting schedule. Nothing publishes between Friday
sundown and Saturday sundown, ever.

This is computed, not remembered. Detroit sundown swings from 9:10 PM in July
to 5:01 PM in late November. A fixed rule like "no posts after 6 PM Friday"
is correct in August and wrong for about fifteen straight Fridays from early
November through mid-February. This script does the astronomy so nobody has
to track it.

Pure standard library. No pip install, no network, no dependencies. Runs on
any Python 3.9+ (uses zoneinfo).

USAGE
-----
    # Is this timestamp inside Shabbat?
    python3 sundown_guard.py check "2026-11-27T18:00:00"
    python3 sundown_guard.py check "2026-11-27T18:00:00" --tz America/Detroit

    # Next safe slot at or after a blocked time
    python3 sundown_guard.py next-safe "2026-11-27T18:00:00"

    # Sundown boundaries for a given date
    python3 sundown_guard.py window 2026-11-27

    # Audit a whole batch of scheduled times (one ISO timestamp per line)
    python3 sundown_guard.py audit schedule.txt
    cat schedule.txt | python3 sundown_guard.py audit -

    # Scan a date range for Fridays where a recurring clock-time would violate
    python3 sundown_guard.py scan-recurring 18:00 --from 2026-08-01 --to 2027-08-01

EXIT CODES
----------
    0  safe / no violations found
    1  blocked / violations found
    2  bad input

Exit code 1 is the point: wire this into any script that schedules, and a
violation stops the pipeline instead of publishing.
"""

import argparse
import math
import sys
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

# Detroit — ChoZen Unlimited LLC home base.
DEFAULT_LAT = 42.3314
DEFAULT_LON = -83.0458
DEFAULT_TZ = "America/Detroit"

# Minutes after sundown before Shabbat is treated as over. Halakhic practice
# commonly waits for three stars / nightfall rather than the exact solar
# moment. Adjust to your practice; the default is deliberately conservative on
# both ends.
CANDLE_LIGHTING_BUFFER_MIN = 18   # Shabbat starts this many minutes BEFORE Friday sundown
HAVDALAH_BUFFER_MIN = 42          # Shabbat ends this many minutes AFTER Saturday sundown


# --------------------------------------------------------------------------
# Solar position — NOAA sunrise/sunset algorithm, standard library only.
# --------------------------------------------------------------------------

def _julian_day(d: date) -> float:
    """Julian day number at 00:00 UT for a civil date."""
    y, m = d.year, d.month
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    return (math.floor(365.25 * (y + 4716))
            + math.floor(30.6001 * (m + 1))
            + d.day + b - 1524.5)


def _solar_declination_and_eot(jd: float):
    """Return (declination in radians, equation of time in minutes)."""
    t = (jd - 2451545.0) / 36525.0

    geom_mean_long = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360.0
    geom_mean_anom = 357.52911 + t * (35999.05029 - 0.0001537 * t)
    eccent = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)

    m_rad = math.radians(geom_mean_anom)
    sun_eq_ctr = (math.sin(m_rad) * (1.914602 - t * (0.004817 + 0.000014 * t))
                  + math.sin(2 * m_rad) * (0.019993 - 0.000101 * t)
                  + math.sin(3 * m_rad) * 0.000289)

    true_long = geom_mean_long + sun_eq_ctr
    omega = 125.04 - 1934.136 * t
    app_long = true_long - 0.00569 - 0.00478 * math.sin(math.radians(omega))

    mean_obliq = 23.0 + (26.0 + ((21.448 - t * (46.815 + t * (0.00059 - t * 0.001813)))) / 60.0) / 60.0
    obliq_corr = mean_obliq + 0.00256 * math.cos(math.radians(omega))

    declination = math.asin(math.sin(math.radians(obliq_corr))
                            * math.sin(math.radians(app_long)))

    var_y = math.tan(math.radians(obliq_corr / 2)) ** 2
    l0_rad = math.radians(geom_mean_long)
    eot = 4 * math.degrees(
        var_y * math.sin(2 * l0_rad)
        - 2 * eccent * math.sin(m_rad)
        + 4 * eccent * var_y * math.sin(m_rad) * math.cos(2 * l0_rad)
        - 0.5 * var_y * var_y * math.sin(4 * l0_rad)
        - 1.25 * eccent * eccent * math.sin(2 * m_rad)
    )
    return declination, eot


def sunset(d: date, lat: float = DEFAULT_LAT, lon: float = DEFAULT_LON,
           tz: str = DEFAULT_TZ) -> datetime:
    """
    Local sunset (upper limb, standard -0.833 deg refraction) for a date.

    Solved iteratively. A single pass evaluates the sun's declination at
    00:00 UT, but Detroit sunset happens around 00:45 UT the following day.
    Near the equinoxes declination moves fast enough that the one-pass answer
    drifts about two minutes. Re-evaluating at the estimated sunset moment
    converges to within a few seconds, which is what a Shabbat boundary
    deserves.
    """
    lat_rad = math.radians(lat)
    zenith = math.radians(90.833)
    jd0 = _julian_day(d)

    minutes_utc = 720.0  # seed: solar noon
    for _ in range(3):
        jd = jd0 + minutes_utc / 1440.0
        decl, eot = _solar_declination_and_eot(jd)

        cos_ha = ((math.cos(zenith) / (math.cos(lat_rad) * math.cos(decl)))
                  - math.tan(lat_rad) * math.tan(decl))
        if cos_ha < -1 or cos_ha > 1:
            raise ValueError(
                f"No sunset on {d} at latitude {lat} (polar day or night). "
                "This should never happen for Detroit."
            )

        # Hour angle is positive; sunrise uses -ha, sunset uses +ha.
        ha = math.degrees(math.acos(cos_ha))
        minutes_utc = 720 + 4 * (-lon + ha) - eot

    base = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    utc_dt = base + timedelta(minutes=minutes_utc)
    return utc_dt.astimezone(ZoneInfo(tz))


# --------------------------------------------------------------------------
# Shabbat window
# --------------------------------------------------------------------------

def shabbat_window(any_dt: datetime, lat=DEFAULT_LAT, lon=DEFAULT_LON,
                   tz=DEFAULT_TZ):
    """
    Return (start, end) of the Shabbat window relevant to any_dt.

    Start = Friday sundown minus the candle-lighting buffer.
    End   = Saturday sundown plus the havdalah buffer.

    Finds the Shabbat window that could contain any_dt, which means looking at
    the most recent Friday on or before it.
    """
    local = any_dt.astimezone(ZoneInfo(tz))
    # weekday(): Mon=0 ... Fri=4, Sat=5, Sun=6
    days_since_friday = (local.weekday() - 4) % 7
    friday = (local - timedelta(days=days_since_friday)).date()
    saturday = friday + timedelta(days=1)

    start = sunset(friday, lat, lon, tz) - timedelta(minutes=CANDLE_LIGHTING_BUFFER_MIN)
    end = sunset(saturday, lat, lon, tz) + timedelta(minutes=HAVDALAH_BUFFER_MIN)
    return start, end


def is_shabbat(any_dt: datetime, lat=DEFAULT_LAT, lon=DEFAULT_LON, tz=DEFAULT_TZ) -> bool:
    """True if any_dt falls inside the Shabbat blackout."""
    local = any_dt.astimezone(ZoneInfo(tz))
    start, end = shabbat_window(local, lat, lon, tz)
    return start <= local <= end


def next_safe_slot(any_dt: datetime, lat=DEFAULT_LAT, lon=DEFAULT_LON,
                   tz=DEFAULT_TZ) -> datetime:
    """
    Nearest permitted time at or after any_dt.

    Deliberately returns Saturday-night havdalah plus a few minutes rather
    than pushing to Sunday morning — motzei Shabbat is a live posting window
    and giving it up costs reach.
    """
    local = any_dt.astimezone(ZoneInfo(tz))
    if not is_shabbat(local, lat, lon, tz):
        return local
    _, end = shabbat_window(local, lat, lon, tz)
    return end + timedelta(minutes=5)


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def _parse_dt(s: str, tz: str) -> datetime:
    s = s.strip()
    if not s:
        raise ValueError("empty timestamp")
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        raise ValueError(f"not an ISO 8601 timestamp: {s!r}")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(tz))
    return dt


def _fmt(dt: datetime) -> str:
    return dt.strftime("%a %Y-%m-%d %-I:%M %p %Z")


def cmd_check(args) -> int:
    dt = _parse_dt(args.timestamp, args.tz)
    start, end = shabbat_window(dt, args.lat, args.lon, args.tz)
    blocked = is_shabbat(dt, args.lat, args.lon, args.tz)

    print(f"Timestamp : {_fmt(dt)}")
    print(f"Shabbat   : {_fmt(start)}  ->  {_fmt(end)}")
    if blocked:
        safe = next_safe_slot(dt, args.lat, args.lon, args.tz)
        print("Verdict   : BLOCKED — inside Shabbat")
        print(f"Next safe : {_fmt(safe)}")
        return 1
    print("Verdict   : SAFE")
    return 0


def cmd_next_safe(args) -> int:
    dt = _parse_dt(args.timestamp, args.tz)
    print(next_safe_slot(dt, args.lat, args.lon, args.tz).isoformat())
    return 0


def cmd_window(args) -> int:
    d = date.fromisoformat(args.date)
    ref = datetime.combine(d, time(12, 0), tzinfo=ZoneInfo(args.tz))
    start, end = shabbat_window(ref, args.lat, args.lon, args.tz)
    print(f"Sundown Friday   : {_fmt(sunset(start.date(), args.lat, args.lon, args.tz))}")
    print(f"Shabbat begins   : {_fmt(start)}   (sundown - {CANDLE_LIGHTING_BUFFER_MIN} min)")
    print(f"Sundown Saturday : {_fmt(sunset(end.date(), args.lat, args.lon, args.tz))}")
    print(f"Shabbat ends     : {_fmt(end)}   (sundown + {HAVDALAH_BUFFER_MIN} min)")
    return 0


def cmd_audit(args) -> int:
    src = sys.stdin if args.file == "-" else open(args.file, encoding="utf-8")
    try:
        lines = [ln.strip() for ln in src if ln.strip() and not ln.strip().startswith("#")]
    finally:
        if src is not sys.stdin:
            src.close()

    violations = []
    for i, ln in enumerate(lines, 1):
        try:
            dt = _parse_dt(ln, args.tz)
        except ValueError as e:
            print(f"  line {i}: SKIPPED — {e}", file=sys.stderr)
            continue
        if is_shabbat(dt, args.lat, args.lon, args.tz):
            violations.append((i, dt, next_safe_slot(dt, args.lat, args.lon, args.tz)))

    print(f"Audited {len(lines)} scheduled times.")
    if not violations:
        print("No Shabbat violations. Clear to schedule.")
        return 0

    print(f"\n{len(violations)} SHABBAT VIOLATION(S) — do not schedule as-is:\n")
    for i, dt, safe in violations:
        print(f"  line {i}: {_fmt(dt)}")
        print(f"           move to -> {_fmt(safe)}")
    return 1


def cmd_scan_recurring(args) -> int:
    """Find Fridays where a fixed clock-time slot drifts past sundown."""
    try:
        hh, mm = (int(x) for x in args.clock_time.split(":"))
        slot = time(hh, mm)
    except (ValueError, TypeError):
        print(f"Bad time {args.clock_time!r}; expected HH:MM (24h).", file=sys.stderr)
        return 2

    start_d = date.fromisoformat(args.from_date)
    end_d = date.fromisoformat(args.to_date)
    if end_d < start_d:
        print("--to must not be before --from", file=sys.stderr)
        return 2

    # First Friday on or after start
    d = start_d + timedelta(days=(4 - start_d.weekday()) % 7)
    bad = []
    while d <= end_d:
        dt = datetime.combine(d, slot, tzinfo=ZoneInfo(args.tz))
        if is_shabbat(dt, args.lat, args.lon, args.tz):
            bad.append((d, sunset(d, args.lat, args.lon, args.tz)))
        d += timedelta(days=7)

    label = slot.strftime("%-I:%M %p")
    if not bad:
        print(f"A recurring Friday {label} slot is safe for every Friday "
              f"from {start_d} to {end_d}.")
        return 0

    print(f"A recurring Friday {label} slot VIOLATES Shabbat on "
          f"{len(bad)} Friday(s) between {start_d} and {end_d}:\n")
    for d, ss in bad:
        print(f"  {d}  sundown {ss.strftime('%-I:%M %p')}  "
              f"— slot fires {'after sundown' if ss.time() < slot else 'inside the buffer'}")
    print(f"\nFirst violation: {bad[0][0]}   Last: {bad[-1][0]}")
    print("Fix: stop using a fixed Friday clock time. Schedule Friday posts "
          "against computed sundown, or move them to Thursday / Saturday night.")
    return 1


def main() -> int:
    p = argparse.ArgumentParser(
        description="ChoZen Shabbat sundown guard — blocks Friday-sundown to "
                    "Saturday-sundown scheduling.")
    p.add_argument("--tz", default=DEFAULT_TZ, help=f"IANA timezone (default {DEFAULT_TZ})")
    p.add_argument("--lat", type=float, default=DEFAULT_LAT, help="latitude")
    p.add_argument("--lon", type=float, default=DEFAULT_LON, help="longitude")
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("check", help="is one timestamp inside Shabbat?")
    c.add_argument("timestamp")
    c.set_defaults(func=cmd_check)

    n = sub.add_parser("next-safe", help="nearest permitted time at or after a timestamp")
    n.add_argument("timestamp")
    n.set_defaults(func=cmd_next_safe)

    w = sub.add_parser("window", help="show the Shabbat window covering a date")
    w.add_argument("date", help="YYYY-MM-DD")
    w.set_defaults(func=cmd_window)

    a = sub.add_parser("audit", help="audit a file of ISO timestamps, one per line")
    a.add_argument("file", help="path, or - for stdin")
    a.set_defaults(func=cmd_audit)

    s = sub.add_parser("scan-recurring",
                       help="find Fridays where a fixed clock slot breaks Shabbat")
    s.add_argument("clock_time", help="HH:MM in 24h, e.g. 18:00")
    s.add_argument("--from", dest="from_date", required=True, help="YYYY-MM-DD")
    s.add_argument("--to", dest="to_date", required=True, help="YYYY-MM-DD")
    s.set_defaults(func=cmd_scan_recurring)

    args = p.parse_args()
    try:
        return args.func(args)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
