#!/usr/bin/env python3
"""WCAG 2.2 contrast checker. No dependencies.

Usage:
  contrast.py <fg> <bg> [<fg> <bg> ...]   check one or more pairs
  contrast.py --pairs pairs.txt           one "fg bg [label]" per line
  contrast.py --best <bg> <c1> <c2> ...   rank candidates against a background

Colors: #rgb, #rrggbb, or rrggbb.
Exit code 1 if any pair fails AA normal text (4.5:1), so it can gate CI.
"""
import re
import sys


def parse(c):
    c = c.strip().lstrip('#')
    if len(c) == 3:
        c = ''.join(ch * 2 for ch in c)
    if len(c) != 6:
        raise ValueError(f"bad color: {c!r}")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def luminance(rgb):
    out = []
    for v in rgb:
        s = v / 255
        out.append(s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4)
    r, g, b = out
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    a, b = luminance(parse(fg)), luminance(parse(bg))
    lo, hi = sorted((a, b))
    return (hi + 0.05) / (lo + 0.05)


def grade(r):
    """Returns (verdict, passing-levels). Thresholds per WCAG 2.2:
    normal text AA 4.5, AAA 7; large text (>=18.66px bold / >=24px) AA 3, AAA 4.5;
    UI components and graphical objects 3."""
    levels = []
    if r >= 3:
        levels.append("large-AA/ui")
    if r >= 4.5:
        levels.append("AA")
    if r >= 7:
        levels.append("AAA")
    return ("PASS" if r >= 4.5 else "FAIL"), levels


def report(fg, bg, label=""):
    r = ratio(fg, bg)
    verdict, levels = grade(r)
    tag = f"  {label}" if label else ""
    print(f"{verdict:4}  {r:5.2f}:1  {fg} on {bg}  [{', '.join(levels) or 'none'}]{tag}")
    return verdict == "PASS"


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    ok = True
    if argv[0] == "--best":
        bg, cands = argv[1], argv[2:]
        scored = sorted(((ratio(c, bg), c) for c in cands), reverse=True)
        print(f"Ranked against {bg}:")
        for r, c in scored:
            verdict, levels = grade(r)
            print(f"  {verdict:4}  {r:5.2f}:1  {c}  [{', '.join(levels) or 'none'}]")
        return 0
    if argv[0] == "--pairs":
        with open(argv[1]) as fh:
            for line in fh:
                line = line.strip()
                # A leading '#' is a color unless followed by whitespace,
                # so only '# ' and '//' open a comment.
                if not line or line.startswith('//') or re.match(r'#\s', line):
                    continue
                parts = line.split()
                ok &= report(parts[0], parts[1], ' '.join(parts[2:]))
        return 0 if ok else 1
    if len(argv) % 2:
        print("error: need color pairs (fg bg)", file=sys.stderr)
        return 2
    for i in range(0, len(argv), 2):
        ok &= report(argv[i], argv[i + 1])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
