"""Builds data.js for launch-race.html from GCAT (Jonathan C. McDowell, planet4589.org/space/gcat, CC BY 4.0).

Usage: python build_data.py [path/to/launchlog.tsv]   (downloads launchlog.tsv if no path is given)
Counts one row per orbital launch attempt (Launch_Code starting with 'O', success or failure),
grouped by the launch vehicle's state (LVState).
"""
import collections, csv, io, json, pathlib, sys, urllib.request

URL = "https://planet4589.org/space/gcat/tsv/launch/launchlog.tsv"
GROUPS = {"US": "United States", "SU": "USSR / Russia", "RU": "USSR / Russia", "CN": "China",
          "F": "Europe", "I-ESA": "Europe", "I-ELDO": "Europe", "I": "Europe", "D": "Europe", "UK": "Europe",
          "J": "Japan", "IN": "India", "NZ": "New Zealand"}
ORDER = ["United States", "USSR / Russia", "China", "Europe", "Japan", "India", "New Zealand"]

text = (pathlib.Path(sys.argv[1]).read_text(encoding="utf-8") if len(sys.argv) > 1
        else urllib.request.urlopen(URL, timeout=60).read().decode("utf-8"))
rows = list(csv.reader(io.StringIO(text), delimiter="\t"))
hdr = [h.strip().lstrip("#") for h in rows[0]]
col = {h: i for i, h in enumerate(hdr)}
updated = next((r[0].lstrip("# ").strip() for r in rows[1:3] if r and r[0].startswith("# Updated")), "")

seen = {}
for r in rows[1:]:
    if not r or r[0].startswith("#") or len(r) <= col["Launch_Code"]:
        continue
    tag, code = r[col["Launch_Tag"]].strip(), r[col["Launch_Code"]].strip()
    if code.startswith("O") and tag not in seen:
        seen[tag] = (int(r[col["Launch_Date"]][:4]), r[col["LVState"]].strip(), r[col["LV_Type"]].strip(), r[col["Launch_Date"]].strip())

years = list(range(1957, max(y for y, *_ in seen.values()) + 1))
series = {g: [0] * len(years) for g in ORDER}
world = [0] * len(years)
falcon9 = collections.Counter()
for y, st, lv, _ in seen.values():
    world[y - 1957] += 1
    if st in GROUPS:
        series[GROUPS[st]][y - 1957] += 1
    if lv.startswith("Falcon 9"):
        falcon9[y] += 1
last = max(d for *_, d in seen.values())

out = {"source": "GCAT, Jonathan C. McDowell, planet4589.org/space/gcat (CC BY 4.0)", "updated": updated,
       "lastLaunch": last, "years": years, "world": world, "series": series,
       "falcon9": {str(y): falcon9[y] for y in sorted(falcon9)}}
here = pathlib.Path(__file__).with_name("data.js")
here.write_text("window.DATA = " + json.dumps(out, separators=(",", ":")) + ";\n", encoding="utf-8")
print("wrote", here, "|", updated, "| last launch", last)
for y in (1957, 1967, 1982, 1991, 2016, 2024, 2025, years[-1]):
    i = y - 1957
    print(y, "world", world[i], {g[:6]: series[g][i] for g in ORDER}, "F9", falcon9[y])
