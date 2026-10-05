"""av_check.py - check that visuals line up with voiceover, SFX, song beats and lyrics.

Usage:
  python av_check.py video.html            # SVG explainer (motion-graphics), retro/CRT cue-timeline page, or Canvas music video (character-rig)
  python av_check.py video.mp4             # any rendered MP4 (generic A/V offset + onset report)
Options:
  --png out.png     timeline chart (default <input>_sync.png)   --no-png   skip it
  --step N          analyse every Nth frame (default 1; use 2 for long music videos)
  --from S --to S   only analyse this output-time range in seconds
  --tol N           SFX-to-visual tolerance in frames (default 3)
  --bpm B --b0 S    beat grid for MP4 input (music videos read BEAT/B0 from fx.js)
  --keywords a,b    extra VO words to check against visual hits (explainer)
  --list            print every SFX cue with its nearest visual hit and how it was classified
Exit code 1 if any FAIL. Needs: numpy, pillow, playwright (Edge), imageio-ffmpeg.
"""
import argparse, base64, http.server, json, os, re, subprocess, sys, threading
import numpy as np

GW, GH = 192, 108          # analysis raster
CELLS = (24, 12)           # grid for local-motion measure

ap = argparse.ArgumentParser()
ap.add_argument("input")
ap.add_argument("--png"); ap.add_argument("--no-png", action="store_true")
ap.add_argument("--step", type=int, default=1)
ap.add_argument("--from", dest="t0", type=float, default=0.0)
ap.add_argument("--to", dest="t1", type=float, default=None)
ap.add_argument("--tol", type=int, default=3)
ap.add_argument("--bpm", type=float); ap.add_argument("--b0", type=float, default=0.0)
ap.add_argument("--keywords", default="")
ap.add_argument("--list", action="store_true")
ap.add_argument("--dump", help=argparse.SUPPRESS)
A = ap.parse_args()

SRCP = os.path.abspath(A.input)
HERE = os.path.dirname(SRCP)
issues = []  # (level, time_s, msg)


def say(level, t, msg):
    issues.append((level, float(t), msg))


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


# ---------------------------------------------------------------- signal helpers
def rolling_pct(x, half, q):
    n = len(x); out = np.empty(n)
    for i in range(n):
        out[i] = np.percentile(x[max(0, i - half):i + half + 1], q)
    return out


def peaks(sig, ratio=2.0, floor=None, half=15, q=75, sep=3):
    """Local maxima that stand out from a rolling baseline. Returns [(index, strength)]."""
    if len(sig) < 3:
        return []
    base = rolling_pct(sig, half, q) + 1e-6
    if floor is None:
        floor = max(np.percentile(sig, 60), 1e-6)
    out = []
    for i in range(len(sig)):
        lo, hi = max(0, i - sep), min(len(sig), i + sep + 1)
        if sig[i] == sig[lo:hi].max() and sig[i] >= base[i] * ratio and sig[i] >= floor:
            if not out or i - out[-1][0] > sep:
                out.append((i, float(sig[i] / base[i])))
    return out


def audio_mono(path_or_bytes, sr=22050):
    pipe = isinstance(path_or_bytes, (bytes, bytearray))
    p = subprocess.run([ffmpeg(), "-loglevel", "error", "-i", "pipe:0" if pipe else path_or_bytes,
                        "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                       input=path_or_bytes if pipe else None, capture_output=True)
    return np.frombuffer(p.stdout, dtype=np.float32), sr


def audio_peak(path_or_bytes):
    """Sample peak over the native channels. ffmpeg's float mono downmix sums L+R at 0.707 each (no
    normalisation), so correlated stereo peaking at 0.7 reads ~0.99 mono - never judge clipping on it."""
    pipe = isinstance(path_or_bytes, (bytes, bytearray))
    p = subprocess.run([ffmpeg(), "-loglevel", "error", "-i", "pipe:0" if pipe else path_or_bytes, "-f", "f32le", "-"],
                       input=path_or_bytes if pipe else None, capture_output=True)
    a = np.frombuffer(p.stdout, dtype=np.float32)
    return float(np.abs(a).max()) if len(a) else 0.0


def flux(y, sr, hop):
    """Spectral-flux onset strength, one value per `hop` samples."""
    n = 2048; win = np.hanning(n)
    if len(y) < n:
        return np.zeros(1)
    frames = 1 + (len(y) - n) // hop
    out = []
    prev = None
    for a in range(0, frames, 2000):
        idx = np.arange(n)[None, :] + hop * np.arange(a, min(frames, a + 2000))[:, None]
        mag = np.log1p(np.abs(np.fft.rfft(y[idx] * win, axis=1)) * 10)
        if prev is not None:
            mag = np.vstack([prev, mag])
        out.append(np.maximum(0, np.diff(mag, axis=0)).sum(1))
        prev = mag[-1:]
    return np.concatenate([[0], np.concatenate(out)])


def rms_env(y, sr, hop):
    k = len(y) // hop
    return np.sqrt((y[:k * hop].reshape(k, hop) ** 2).mean(1) + 1e-12)


# ---------------------------------------------------------------- MP4 path
def analyse_mp4():
    probe = subprocess.run([ffmpeg(), "-i", SRCP], capture_output=True, text=True).stderr
    fps = float(re.search(r"([\d.]+) fps", probe).group(1))
    vf = f"scale={GW}:{GH},format=gray"
    args = [ffmpeg(), "-loglevel", "error"]
    if A.t0: args += ["-ss", str(A.t0)]
    args += ["-i", SRCP]
    if A.t1: args += ["-t", str(A.t1 - A.t0)]
    raw = subprocess.run(args + ["-vf", vf, "-f", "rawvideo", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, GH, GW).astype(np.float32)
    lum = fr.mean((1, 2))
    d = np.abs(np.diff(fr, axis=0))
    cw, ch = GW // CELLS[0], GH // CELLS[1]
    cells = d[:, :ch * CELLS[1], :cw * CELLS[0]].reshape(len(d), CELLS[1], ch, CELLS[0], cw).mean((2, 4)).reshape(len(d), -1)
    local = np.sort(cells, 1)[:, -3:].mean(1)
    f0 = int(round(A.t0 * fps))
    return dict(fps=fps, total=f0 + len(fr), motion=np.concatenate([[0], local]),
                gdiff=np.concatenate([[0], d.mean((1, 2))]), lum=lum, frames=f0 + np.arange(len(fr)),
                cells=np.vstack([np.zeros((1, cells.shape[1])), cells]))


# ---------------------------------------------------------------- HTML path (Playwright)
GRAB_JS = r"""
async ([F0, F1, step, W, H, CX, CY]) => {
  const cv = window.__avc || (window.__avc = Object.assign(document.createElement('canvas'), {width: W, height: H}));
  const cx = cv.getContext('2d', {willReadFrequently: true});
  const cw = Math.floor(W / CX), ch = Math.floor(H / CY);
  const out = [];
  for (let F = F0; F < F1; F += step) {
    const r = render(F);
    if (typeof r === 'string') return {err: 'render(' + F + '): ' + r};
    cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
    const cnv = document.getElementById('c');
    if (cnv && cnv.tagName === 'CANVAS') cx.drawImage(cnv, 0, 0, W, H);
    else {
      const svg = (document.getElementById('stage') || document.querySelector('svg')).cloneNode(true);
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.transform = '';
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {type: 'image/svg+xml'}));
      const img = new Image(); img.src = url; try { await img.decode(); cx.drawImage(img, 0, 0, W, H); } catch (e) {}
      URL.revokeObjectURL(url);
    }
    const d = cx.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
    let lum = 0;
    for (let i = 0; i < W * H; i++) { g[i] = .2126 * d[i*4] + .7152 * d[i*4+1] + .0722 * d[i*4+2]; lum += g[i]; }
    let gd = 0; const cell = new Float32Array(CX * CY), p = window.__avp;
    if (p) for (let y = 0; y < CY * ch; y++) for (let x = 0; x < CX * cw; x++) {
      const k = y * W + x, v = Math.abs(g[k] - p[k]); gd += v; cell[Math.floor(y / ch) * CX + Math.floor(x / cw)] += v;
    }
    window.__avp = g;
    const cs = Array.from(cell).map(v => v / (cw * ch)).sort((a, b) => b - a);
    out.push([F, gd / (CX * cw * CY * ch), (cs[0] + cs[1] + cs[2]) / 3, lum / (W * H), ...Array.from(cell).map(v => Math.round(v / (cw * ch) * 10) / 10)]);
  }
  return {out};
}
"""

META_JS = r"""
async () => {
  const has = n => { try { return eval('typeof ' + n) !== 'undefined'; } catch (e) { return false; } };
  const m = {fps: FPS, total: has('TOTAL') ? TOTAL : Math.round(DUR * FPS)};
  const musicVideo = has('SC') && Array.isArray(SC) && has('draw');
  // cue-timeline engines (e.g. the retro/CRT kit): VO_CUES/SFX_CUES + exportAudio, scenes optional via SCENE_T=[[name,startSec],...]
  const cueEngine = !musicVideo && has('exportAudio') && !has('SCENES') && (has('VO_CUES') || has('SFX_CUES'));
  if (has('exportAudio') && (has('SCENES') || cueEngine)) {
    m.engine = 'svg';
    if (has('SCENES')) m.scenes = SCENES.map(s => ({from: s.from, dur: s.dur, name: (s.render && s.render.name) || ''}));
    else {
      m.label = 'cue-timeline'; m.noSceneT = !has('SCENE_T');
      const st = (has('SCENE_T') ? SCENE_T : [['all', 0]]).map(s => [String(s[0]), Math.round(s[1] * FPS)]).sort((a, b) => a[1] - b[1]);
      m.scenes = st.map(([name, from], i) => ({from, dur: (i + 1 < st.length ? st[i + 1][1] : m.total) - from, name}));
    }
    m.vo = has('VO_CUES') ? VO_CUES.map(c => [c[0], c[1], c[2] || '']) : [];
    m.sfx = has('SFX_CUES') ? SFX_CUES.map(c => [c[0], c[1]]) : [];
    m.sync = has('SYNC') ? SYNC : [];
    const src = has('sfx') ? sfx.toString() : '';
    const pre = [...src.matchAll(/startsWith\(\s*['"]([^'"]+)['"]\s*\)/g)].map(x => x[1]);  // e.g. name.startsWith('pin') handles pin1..pinN
    // anchored regex dispatch, e.g. /^pin(\d+)$/.exec(name) or name.match(/^pin\d+$/): test each cue name against the real regex
    const rxs = [];
    for (const x of src.matchAll(/\/(\^(?:\\\/|[^\/\n])+)\/([a-z]*)\s*\.(?:exec|test)\(|\.match\(\s*\/(\^(?:\\\/|[^\/\n])+)\/([a-z]*)/g)) {
      try { rxs.push(new RegExp(x[1] || x[3], (x[2] || x[4] || '').replace(/[gy]/g, ''))); } catch (e) {}
    }
    m.sfxKnown = [...new Set(m.sfx.map(c => c[1]))].filter(n => src.includes("'" + n + "'") || src.includes('"' + n + '"') || pre.some(p => n.startsWith(p)) || rxs.some(r => r.test(n)));
    m.voDur = {};
    if (window.VOICE) {
      const ac = new OfflineAudioContext(1, 1, 48000);
      for (const [k, b64] of Object.entries(VOICE)) {
        try { const bin = atob(String(b64).replace(/^data:[^,]*,/, '')), u = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
              m.voDur[k] = (await ac.decodeAudioData(u.buffer)).duration; } catch (e) { m.voDur[k] = null; }
      }
    }
  } else if (musicVideo) {
    m.engine = 'canvas';
    m.scenes = SC.map(s => ({a: s.a, name: (s.f && s.f.name) || '', tin: s.tin ? (s.tin.type + ':' + s.tin.d) : ''}));
    m.beat = has('BEAT') ? BEAT : null; m.b0 = has('B0') ? B0 : 0;
    m.lyr = has('LYR') ? LYR : []; m.hide = has('HIDE') ? [...HIDE] : [];
    m.cuts = has('CUTS') ? CUTS : (has('CUT0') && has('CUTD') ? [[CUT0, CUTD]] : []);
    const au = document.getElementById('au'); m.song = au ? au.getAttribute('src') : null;
    m.err = window.ERR || null;
  } else m.engine = 'unknown';
  return m;
}
"""


def analyse_html():
    from playwright.sync_api import sync_playwright

    class Q(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=HERE, **k)
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Q)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/{os.path.basename(SRCP)}?frame=0"
    with sync_playwright() as pw:
        br = pw.chromium.launch(channel="msedge", headless=True)
        pg = br.new_page(viewport={"width": 1280, "height": 720})
        canvas_ready = ("typeof render === 'function' && (window.READY === true || !!window.ERR || "
                        "(typeof draw !== 'function' && !document.getElementById('c')))")
        boot_errs = []
        pg.on("pageerror", lambda e: boot_errs.append(str(e)))
        pg.on("response", lambda r: r.status >= 400 and boot_errs.append(f"HTTP {r.status} {r.url.split('/', 3)[-1]}"))
        for attempt in range(3):  # Canvas engine sets READY after async font/texture setup; boot is occasionally flaky
            pg.goto(url)
            try:
                pg.wait_for_function(canvas_ready, timeout=45000)
            except Exception:
                errs = [e for e in dict.fromkeys(boot_errs) if "favicon" not in e]
                say("FAIL", 0, "page never became READY - " + ("; ".join(errs[:4]) or "no error reported") +
                    " (missing fonts/ or assets next to the HTML?)")
                br.close(); srv.shutdown()
                return None
            if not pg.evaluate("window.ERR || null"):
                break
            print("boot retry")
        meta = pg.evaluate(META_JS)
        if meta.get("err"):
            say("FAIL", 0, f"page error during setup: {str(meta['err'])[:200]}")
        fps, total = meta["fps"], meta["total"]
        f0 = int(A.t0 * fps); f1 = min(total, int(A.t1 * fps) if A.t1 else total)
        print(f"engine={meta.get('label', meta['engine'])}  {total} frames @ {fps}fps = {total / fps:.1f}s  analysing {f0}..{f1} step {A.step}")
        if meta.get("noSceneT"):
            say("INFO", 0, "cue-timeline page without SCENE_T - scene checks treat the whole video as one scene; "
                "declare SCENE_T=[[name,startSec],...] next to VO_CUES for per-scene VO/transition checks")
        rows = []
        for a in range(f0, f1, 150 * A.step):
            r = pg.evaluate(GRAB_JS, [a, min(f1, a + 150 * A.step), A.step, GW, GH, CELLS[0], CELLS[1]])
            if "err" in r:
                say("FAIL", a / fps, r["err"][:300]); break
            rows += r["out"]
            print(f"  frame {rows[-1][0] if rows else a}/{f1}", end="\r", flush=True)
        print()
        wav = None
        if meta["engine"] == "svg":
            try:
                wav = base64.b64decode(pg.evaluate("exportAudio()"))
            except Exception as e:
                say("WARN", 0, f"exportAudio() failed: {e}")
        br.close()
    srv.shutdown()
    R = np.array(rows, dtype=np.float64) if rows else np.zeros((0, 4 + CELLS[0] * CELLS[1]))
    if len(R):
        R[0, 1:3] = 0
    if len(R):
        R[0, 4:] = 0
    return meta, dict(fps=fps, total=total, frames=R[:, 0].astype(int), gdiff=R[:, 1], motion=R[:, 2], lum=R[:, 3], cells=R[:, 4:]), wav


# ---------------------------------------------------------------- checks
def nearest(arr, x):
    if len(arr) == 0:
        return None
    i = int(np.argmin(np.abs(np.asarray(arr) - x)))
    return arr[i]


def rise_signal(V):
    """Per-frame 'something just appeared/moved here' score: the two strongest grid cells whose
    difference jumped above their minimum over the previous ~4 frames. Robust to steady idle motion."""
    C = V.get("cells")
    if C is None or not len(C):
        return np.asarray(V["motion"], dtype=float)
    back = max(1, 4 // A.step)
    r = np.zeros(len(C))
    for t in range(1, len(C)):
        d = C[t] - C[max(0, t - back):t].min(0)
        r[t] = np.sort(d)[-2:].mean()
    return r


def visual_onsets(V):
    """[(frame, strength, local_level)] - local maxima of the rise signal well above their surroundings."""
    r = rise_signal(V); fr = V["frames"]; n = len(r)
    half, near = max(1, 30 // A.step), max(1, 2 // A.step)
    out = []
    for i in range(1, n):
        loc = float(np.median(r[max(0, i - half):i + half + 1]))
        if r[i] >= max(6.0, 2.5 * loc) and r[i] == r[max(0, i - near):i + near + 1].max():
            if out and fr[i] - out[-1][0] <= 5:  # plateau: keep the first frame of a run
                continue
            out.append((int(fr[i]), r[i] / max(loc, 2.0), loc))
    V["rise"] = r
    return out


def local_level(V, F):
    r, fr = V["rise"], V["frames"]
    i = int(np.searchsorted(fr, F)); half = max(1, 30 // A.step)
    return float(np.median(r[max(0, i - half):i + half + 1])) if len(r) else 0.0


def flash_check(V, fps, step):
    lum, fr = V["lum"], V["frames"]
    back = max(1, 12 // step)
    for i in range(1, len(lum) - back):
        rise = lum[i] - lum[i - 1]
        if rise > 45 and lum[i - 1] < 110 and lum[i + back] < lum[i] - 35:
            say("WARN", fr[i] / fps, f"bright flash (+{rise:.0f} luma into a dark frame, gone within {back * step}f) - keep flashes dim/warm, <=0.35-0.5 opacity")


def check_svg(meta, V, wav):
    fps, total = meta["fps"], meta["total"]
    scenes = meta["scenes"]; ends = [s["from"] + s["dur"] for s in scenes]
    ons = visual_onsets(V); onf = [f for f, _, _ in ons]
    lo, hi = (V["frames"][0], V["frames"][-1]) if len(V["frames"]) else (0, total)

    def scene_of(F):
        for i, s in enumerate(scenes):
            if s["from"] <= F < s["from"] + s["dur"]:
                return i
        return len(scenes) - 1

    # --- voiceover structure
    vo = sorted(meta["vo"], key=lambda c: c[1]); spans = []
    for j, (key, F, _) in enumerate(vo):
        if not (0 <= F < total):
            say("FAIL", F / fps, f"VO '{key}' cue frame {F} outside 0..{total}"); continue
        d = meta["voDur"].get(key)
        if d is None:
            say("FAIL", F / fps, f"VO '{key}' has no decodable clip in window.VOICE (run make_voice.py)"); continue
        end = F + d * fps; i = scene_of(F); send = ends[i]
        spans.append((key, F, end))
        if end > send - 4:
            say("FAIL", F / fps, f"VO '{key}' ({d:.2f}s) ends at f{end:.0f}, {end - send + 4:.0f}f past scene {i} '{scenes[i]['name']}' end f{send} (-4f tail) - extend dur or cue earlier")
        nxt = next((c for c in vo[j + 1:] if 0 <= c[1] < total and scene_of(c[1]) == i), None)
        if nxt is not None:  # a later line in the same scene: measure the silence up to it, not to the scene end
            gap = (nxt[1] - end) / fps
            if gap > 4.0:
                say("INFO", end / fps, f"VO '{key}' leaves {gap:.1f}s silence before '{nxt[0]}' in scene {i} (hold ~2.5-3s; tighten?)")
        else:
            tail = (send - end) / fps
            if tail > 4.0:
                say("INFO", end / fps, f"VO '{key}' leaves {tail:.1f}s without narration before scene {i} ends (reading hold ~2.5-3s; trim the scene?)")
        if i > 0 and F - scenes[i]["from"] < 4:
            say("WARN", F / fps, f"VO '{key}' starts {F - scenes[i]['from']}f into its scene - leave ~6-12f for the transition to land")
    for (k1, _, e1), (k2, s2, _) in zip(spans, spans[1:]):
        if e1 > s2:
            say("FAIL", s2 / fps, f"VO '{k1}' overlaps '{k2}' by {e1 - s2:.0f}f")
        elif s2 - e1 < 6:
            say("WARN", s2 / fps, f"only {s2 - e1:.0f}f breath between VO '{k1}' and '{k2}' (aim >= 8f)")
    unused = set(meta["voDur"]) - {c[0] for c in vo}
    if unused:
        say("INFO", 0, f"VOICE clips never cued: {', '.join(sorted(unused))}")

    # --- SFX: every impact sound should have a visual 'hit' (something appears/lands) on its frame
    known = set(meta.get("sfxKnown", []))
    SOFT = {"whoosh", "charge", "type", "scribble", "hum", "breath", "chime", "swell", "riser"}
    busyLvl = float(np.percentile(V["rise"], 80)) if len(V["rise"]) else 1e9
    offs = []; last = {}; lag = {}; nohit = []; busy = []; rows = []
    for F, name in sorted(meta["sfx"]):
        if name not in known:
            say("FAIL", F / fps, f"SFX '{name}' at f{F} is not handled by sfx() - it will be silent")
        if not (0 <= F < total):
            say("FAIL", F / fps, f"SFX '{name}' frame {F} outside 0..{total}")
        if name in last and F - last[name] < 3:
            say("INFO", F / fps, f"SFX '{name}' repeats within {F - last[name]}f (stacking/phasing)")
        last[name] = F
        if not (lo <= F <= hi):
            continue
        near = [f for f in onf if abs(f - F) <= 9]
        best = min(near, key=lambda f: abs(f - F)) if near else None
        row = lambda kind: rows.append((F, name, best, kind))
        if best is not None and abs(best - F) <= A.tol:
            offs.append(best - F); row("match"); continue
        if name in SOFT or min(abs(F - s["from"]) for s in scenes) <= 8:
            row("soft/cut"); continue  # continuous / transition sounds: smooth motion, no single hit expected
        if local_level(V, F) >= busyLvl:
            busy.append(F); row("busy"); continue  # already lots of motion (fight, montage) - can't isolate one hit
        if best is not None and abs(best - F) <= 6:
            lag.setdefault(name, []).append((F, best - F)); row("lag")
        else:
            nohit.append((F, name)); row("no hit")
    if A.list:
        print("SFX cue        nearest visual hit   class")
        for F, name, best, kind in rows:
            hit = f"f{best} ({best - F:+d}f)" if best is not None else "-"
            print(f"  f{F:<5} {name:<9} {hit:<19} {kind}")
    for name, L in lag.items():
        for sgn in (1, -1):
            G = [(F, d) for F, d in L if np.sign(d) == sgn]
            if len(G) >= 3:
                med = float(np.median([d for _, d in G]))
                say("WARN", G[0][0] / fps, f"'{name}' SFX consistently {med:+.0f}f {'before' if sgn > 0 else 'after'} their visual hits ({len(G)} cues: " +
                    ", ".join(f"f{f}" for f, _ in G[:8]) + ("..." if len(G) > 8 else "") +
                    f") - shift those cues {med:+.0f}f, or make the pop-in land sooner (stiffer spring)")
            else:
                for F, d in G:
                    say("WARN", F / fps, f"SFX '{name}' at f{F} is {d:+d}f from the nearest visual hit (f{F + d}) - move the cue to f{F + d}?")
    if nohit:
        say("INFO", nohit[0][0] / fps, f"{len(nohit)} impact SFX with no clear visual hit within 9f (subtle element, or a sound without an event?): " +
            ", ".join(f"f{F} {n}" for F, n in nohit[:10]) + ("..." if len(nohit) > 10 else ""))
    if busy:
        say("INFO", busy[0] / fps, f"{len(busy)} SFX sit inside busy motion (fight/montage) - not verifiable automatically, eyeball: " +
            ", ".join(f"f{F}" for F in busy[:10]))
    if offs:
        med = float(np.median(offs))
        print(f"SFX matched to a visual hit (+/-{A.tol}f): {len(offs)}/{len(meta['sfx'])}, median visual-minus-sound {med:+.1f}f")
        if len(offs) >= 5 and abs(med) >= 2:
            say("WARN", 0, f"systematic SFX offset: visuals land {abs(med):.0f}f {'after' if med > 0 else 'before'} the sounds on average - shift SFX_CUES by {med:+.0f}f")
    # --- words
    words = []
    vt = os.path.join(HERE, "voice_timing.json")
    if os.path.exists(vt):
        timing = json.load(open(vt, encoding="utf-8"))
        for key, F, _ in vo:
            for off, w in timing.get(key, {}).get("words", []):
                words.append((F + off * fps, w, key))
    else:
        say("INFO", 0, "no voice_timing.json - word-level checks skipped (make_voice.py can write word boundaries)")
    wf = [w[0] for w in words]

    # --- visual hits with no sound
    sfxf = [F for F, _ in meta["sfx"]]; bounds = [s["from"] for s in scenes]
    silent = [(f, s) for f, s, _ in ons if s >= 6
              and (nearest(sfxf, f) is None or abs(nearest(sfxf, f) - f) > 4)
              and min(abs(f - b) for b in bounds) > 6
              and (nearest(wf, f) is None or abs(nearest(wf, f) - f) > 3)]
    for f, s in sorted(silent, key=lambda x: -x[1])[:8]:
        say("INFO", f / fps, f"strong visual hit at f{f} (x{s:.1f}) with no SFX / word / cut near it - add a pop/thunk?")

    kw = {k.strip().lower() for k in A.keywords.split(",") if k.strip()}
    seen = set()
    for i, (F, w, key) in enumerate(words):
        clean = re.sub(r"[^\w'-]", "", w)
        prev = words[i - 1] if i else None
        mid_cap = clean[:1].isupper() and prev is not None and prev[2] == key and not re.search(r"[.!?]$", prev[1])
        if (mid_cap or clean.lower() in kw) and lo <= F <= hi and clean.lower() not in seen:
            seen.add(clean.lower())
            n = nearest(onf, F)
            if n is None or abs(n - F) > 12:
                say("INFO", F / fps, f"key word '{clean}' ({key}) at f{F:.0f} has no visual hit within 12f (nearest f{n}) - reveal it on the word?")
    for anc in meta.get("sync", []):
        F, key, w = anc[0], anc[1], anc[2]
        kw_words = [x for x in words if x[2] == key]
        cand = kw_words[w:w + 1] if isinstance(w, int) else [x for x in kw_words if re.sub(r"[^\w'-]", "", x[1]).lower() == str(w).lower()]
        if not cand:
            say("WARN", F / fps, f"SYNC anchor ({key}, {w}) not found in voice_timing.json"); continue
        wF = min(cand, key=lambda x: abs(x[0] - F))[0]
        if abs(wF - F) > 4:
            say("WARN", F / fps, f"SYNC: visual at f{F} but '{w}' is spoken at f{wF:.0f} ({wF - F:+.0f}f) - move the visual to f{wF:.0f}")

    # --- rendered soundtrack
    aud = None
    if wav:
        y, sr = audio_mono(wav)
        pk = audio_peak(wav)
        print(f"soundtrack: {len(y) / sr:.1f}s, peak {pk:.2f}")
        if pk >= 0.99:
            say("WARN", 0, f"soundtrack peaks at {pk:.2f} - clipping; lower master/SFX gain")
        env = rms_env(y, sr, int(round(sr / fps)))
        aud = env[V["frames"].clip(0, len(env) - 1)] if len(env) else None
        for key, F, end in spans:
            seg = env[int(F):int(end)]
            if len(seg) and seg.mean() < 0.003:
                say("FAIL", F / fps, f"VO '{key}' is (near) silent in the exported soundtrack")
    return ons, words, aud, spans


def inline_hidden():
    """Lyric indices excluded inline, e.g. LYR.find((l, i) => i !== 8 && ...)."""
    out = set()
    if not SRCP.lower().endswith(".html"):
        return out
    html = SRCP
    srcs = [html] + [os.path.join(HERE, s) for s in re.findall(r"<script[^>]+src=\"([^\"]+)\"", open(html, encoding="utf-8", errors="ignore").read())]
    for f in srcs:
        if os.path.exists(f):
            for k in re.findall(r"LYR\.(?:find|filter|forEach|some|map)\(([^;]{0,200})", open(f, encoding="utf-8", errors="ignore").read()):
                out |= {int(n) for n in re.findall(r"\bi\s*!==?\s*(\d+)", k)}
    return out


def beat_fit(y, sr, beat, b0):
    hop = 256; fl = flux(y, sr, hop); t = np.arange(len(fl)) * hop / sr
    fl = fl / (fl.max() + 1e-9)

    def score(bt, bb):
        k = np.arange(max(0, int((t[-1] - bb) / bt)))
        return float(np.interp(bb + k * bt, t, fl).mean()) if len(k) else 0
    d = np.linspace(-beat / 2, beat / 2, 81)
    s = [score(beat, b0 + x) for x in d]
    best = float(d[int(np.argmax(s))])
    bpms = np.linspace(60 / beat * .98, 60 / beat * 1.02, 21)
    sb = [max(score(60 / b, b0 + x) for x in np.linspace(-beat / 2, beat / 2, 21)) for b in bpms]
    return best, max(s) / (np.mean(s) + 1e-9), float(bpms[int(np.argmax(sb))])


def check_music(meta, V, fps):
    beat, b0, cuts = meta["beat"], meta["b0"], meta["cuts"]

    def src(t):
        for c, d in cuts:
            if t >= c:
                t += d
        return t
    song_t = np.array([src(f / fps) for f in V["frames"]])
    aud = None
    songp = os.path.join(HERE, meta["song"]) if meta.get("song") else None
    if songp and os.path.exists(songp):
        y, sr = audio_mono(songp)
        if beat:
            best, contrast, bpm = beat_fit(y, sr, beat, b0)
            # cross-check the phase on the kick band; syncopated mixes often disagree -> ambiguous, not actionable
            Y = np.fft.rfft(y); Y[np.fft.rfftfreq(len(y), 1 / sr) > 150] = 0
            low, _, _ = beat_fit(np.fft.irfft(Y, len(y)), sr, beat, b0)
            print(f"beat grid: BPM {60 / beat:.2f} (audio fits {bpm:.2f}), B0 {b0:.3f}s (full-band fit {b0 + best:.3f}, kick fit {b0 + low:.3f}), grid contrast x{contrast:.2f}")
            if abs(best - low) > 0.04:
                say("INFO", b0, f"beat phase ambiguous (full-band {best * 1000:+.0f} ms vs kick {low * 1000:+.0f} ms) - trust B0 if the dance looks on-beat")
            elif abs(best) > 0.03:
                say("WARN", b0, f"beat grid looks {best * 1000:+.0f} ms off the audio - try B0 = {b0 + (best + low) / 2:.3f}")
            if abs(bpm - 60 / beat) > 0.3:
                say("WARN", 0, f"audio tempo fits {bpm:.2f} BPM better than BEAT's {60 / beat:.2f}")
        env = rms_env(y, sr, int(round(sr / fps)))
        # a song already cut to the video length is in output time; an uncut original is in song (SRC) time
        out_t = np.array(V["frames"]) / fps
        pre_cut = abs(len(y) / sr - meta["total"] / fps) < 1.0
        aud = np.interp(out_t if pre_cut else song_t, np.arange(len(env)) / fps, env)
    else:
        say("INFO", 0, "song file not found - skipping audio/beat-grid fit")
    if not beat:
        say("INFO", 0, "no BEAT/B0 globals - beat checks skipped")
        return visual_onsets(V), aud, song_t
    lstarts = [l[0] for l in meta["lyr"]]
    for i, s in enumerate(meta["scenes"][1:], 1):
        k = (s["a"] - b0) / beat; err = (k - round(k)) * beat * fps
        near_vox = any(0 <= a - s["a"] <= 0.25 for a in lstarts)
        if abs(err) > 2 and not near_vox:
            say("WARN", s["a"], f"scene {i} '{s['name']}' starts {err:+.1f}f off beat {round(k)} (song t={s['a']:.3f}) - use bt({round(k)}) = {b0 + round(k) * beat:.3f}")
        for c, d in cuts:
            gap = abs(s["a"] - (c + d))
            if 1.5 / fps < gap < 0.5:
                say("WARN", s["a"], f"scene {i} starts {gap * fps:.0f}f from the audio splice - put the transition exactly on the splice")
    hide = set(meta["hide"]) | inline_hidden()
    for i, (a, b, txt) in enumerate(meta["lyr"]):
        for c, d in cuts:
            # wholly inside the cut: SRC() skips it, never shown. Straddling the edge: shows a half line.
            if a < c + d and b > c and i not in hide:
                vis = max(0, c - a) + max(0, b - (c + d))  # seconds of the line still shown either side of the cut
                if vis >= 0.3:
                    say("FAIL", a, f"lyric {i} '{txt[:40]}' straddles a removed section ({vis:.2f}s still shown) - add it to HIDE or cut on a line boundary")
                elif vis >= 0.1:
                    say("WARN", c, f"lyric {i} '{txt[:30]}' flickers for {vis * fps:.0f}f at the splice - add it to HIDE")
    ons = visual_onsets(V)
    strong = [(f, s) for f, s, _ in ons if s >= 4]
    if strong:
        tt = np.array([src(f / fps) for f, _ in strong])
        ph = ((tt - b0) / beat + .5) % 1 - .5
        on = np.abs(ph * beat * fps) <= 2
        chance = min(1, 5 / (beat * fps))
        print(f"strong visual hits: {len(strong)}, on-beat (+/-2f): {on.mean() * 100:.0f}% (chance ~{chance * 100:.0f}%), median phase {np.median(ph) * beat * fps:+.1f}f")
        if on.mean() < chance * 1.5:
            say("WARN", 0, f"only {on.mean() * 100:.0f}% of strong visual hits land on beats - punches/cuts may be drifting off the grid")
        if abs(np.median(ph[on | (np.abs(ph) < .25)]) * beat * fps) >= 2:
            say("WARN", 0, "visual hits sit systematically off the beat - check B0 / SRC mapping")
    return ons, aud, song_t


def check_mp4(V, fps):
    y, sr = audio_mono(SRCP)
    if not len(y):
        say("WARN", 0, "no audio track"); return visual_onsets(V), None
    s0 = int(A.t0 * sr); y = y[s0:s0 + int(len(V["motion"]) / fps * sr) + 4096]
    hop = int(round(sr / fps))
    fl = flux(y, sr, hop)[:len(V["motion"])]
    mo = V["motion"][:len(fl)]
    ons = visual_onsets(V)
    a = (fl - fl.mean()) / (fl.std() + 1e-9); b = (mo - mo.mean()) / (mo.std() + 1e-9)
    lags = list(range(-15, 16))
    xc = [float(np.mean(a[max(0, -L):len(a) - max(0, L)] * b[max(0, L):len(b) - max(0, -L)])) for L in lags]
    L = lags[int(np.argmax(xc))]
    print(f"A/V cross-correlation peak at {L:+d}f ({L / fps * 1000:+.0f} ms, r={max(xc):.2f}); + means visuals trail audio")
    if abs(L) >= 3 and max(xc) > 0.1:
        say("WARN", 0, f"visual events trail the audio by {L:+d}f overall - offset the audio or shift cues")
    f0 = int(V["frames"][0])
    aon = [f0 + i for i, _ in peaks(fl, ratio=2.5, half=15, q=75, sep=2)]
    vf = [f for f, _, _ in ons]
    un = [f for f in aon if nearest(vf, f) is None or abs(nearest(vf, f) - f) > 4]
    print(f"audio onsets {len(aon)}, visual onsets {len(vf)}, audio onsets with no visual within 4f: {len(un)}")
    for f in un[:10]:
        say("INFO", f / fps, f"audio onset at f{f} with no visual hit within 4f")
    if A.bpm and vf:
        beat = 60 / A.bpm; ph = ((np.array(vf) / fps - A.b0) / beat + .5) % 1 - .5
        print(f"visual onsets on beat (+/-2f): {(np.abs(ph * beat * fps) <= 2).mean() * 100:.0f}%")
    return ons, rms_env(y, sr, hop)[:len(V["frames"])]


# ---------------------------------------------------------------- timeline PNG
def draw_png(path, V, fps, meta, ons, aud, words, spans):
    from PIL import Image, ImageDraw, ImageFont
    try:
        font = ImageFont.truetype("segoeui.ttf", 13); big = ImageFont.truetype("segoeuib.ttf", 15)
    except OSError:
        font = big = ImageFont.load_default()
    ROW, PX = 15.0, 110
    fr = V["frames"]; f0, f1 = int(fr[0]), int(fr[-1]) + 1
    nrow = max(1, int(np.ceil((f1 - f0) / fps / ROW))); RH = 250
    W = int(ROW * PX) + 80
    im = Image.new("RGB", (W, nrow * RH + 30), "#0B0E1A"); d = ImageDraw.Draw(im)
    mo = V["motion"] / (np.percentile(V["motion"], 99) + 1e-9)
    ae = aud / (np.percentile(aud, 99) + 1e-9) if aud is not None and len(aud) else None
    lv = {l: [t for lvl, t, _ in issues if lvl == l] for l in ("FAIL", "WARN")}
    eng = meta.get("engine") if meta else None

    def out_t(st):
        for c, dd in reversed(meta["cuts"]):
            if st >= c + dd: st -= dd
        return st
    for r in range(nrow):
        y0 = 26 + r * RH; ta = f0 / fps + r * ROW; tb = ta + ROW
        X = lambda t: 60 + (t - ta) * PX
        for s in range(int(ta), int(tb) + 1):
            d.line([X(s), y0, X(s), y0 + RH - 12], fill="#1b2136")
            d.text((X(s) + 2, y0 + RH - 26), f"{s}s", font=font, fill="#5d6583")
        for lab, yy in (("scene", 18), ("VO/lyr", 44), ("SFX/beat", 70), ("motion", 130), ("audio", 205)):
            d.text((4, y0 + yy), lab, font=font, fill="#8C93AD")
        if eng == "svg":
            for i, s in enumerate(meta["scenes"]):
                a, b = s["from"] / fps, (s["from"] + s["dur"]) / fps
                if b < ta or a > tb: continue
                d.rectangle([X(max(a, ta)), y0 + 16, X(min(b, tb)) - 2, y0 + 36], fill=["#1d2a4a", "#2a3a5f"][i % 2])
                d.text((X(max(a, ta)) + 4, y0 + 18), f"{i} {s['name']}", font=font, fill="#F3EFE6")
            for key, F, end in spans:
                a, b = F / fps, end / fps
                if b < ta or a > tb: continue
                d.rectangle([X(max(a, ta)), y0 + 42, X(min(b, tb)), y0 + 60], fill="#2EC4B6")
                d.text((X(max(a, ta)) + 4, y0 + 43), key, font=font, fill="#0B0E1A")
            for wF, w, _ in words:
                if ta <= wF / fps < tb: d.line([X(wF / fps), y0 + 60, X(wF / fps), y0 + 66], fill="#9ff0e6")
            for j, (F, name) in enumerate(sorted(meta["sfx"])):
                t = F / fps
                if ta <= t < tb:
                    d.line([X(t), y0 + 70, X(t), y0 + 180], fill="#FFC857")
                    d.text((X(t) + 2, y0 + 72 + (j % 3) * 13), name, font=font, fill="#FFC857")
        if eng == "canvas":
            for i, s in enumerate(meta["scenes"]):
                t = out_t(s["a"])
                if ta <= t < tb:
                    d.line([X(t), y0 + 14, X(t), y0 + 180], fill="#F25C9C"); d.text((X(t) + 3, y0 + 18), f"{i} {s['name']}", font=font, fill="#F3EFE6")
            if meta.get("beat"):
                k = 0
                while True:
                    st = meta["b0"] + k * meta["beat"]; t = out_t(st)
                    if t > tb or k > 100000: break
                    if t >= ta: d.line([X(t), y0 + 66, X(t), y0 + (74 if k % 4 else 86)], fill="#FFC857" if k % 4 == 0 else "#7a6a3a")
                    k += 1
            for i, (a, b, txt) in enumerate(meta["lyr"]):
                t = out_t(a)
                if ta <= t < tb and i not in meta["hide"]: d.text((X(t), y0 + 44), txt[:26], font=font, fill="#2EC4B6")
        pts = [(X(f / fps), y0 + 180 - min(1.2, m) * 50) for f, m in zip(fr, mo) if ta <= f / fps < tb]
        if len(pts) > 1: d.line(pts, fill="#8C93AD", width=1)
        for f, s, _ in ons:
            if ta <= f / fps < tb:
                d.ellipse([X(f / fps) - 3, y0 + 183, X(f / fps) + 3, y0 + 189], fill="#2EC4B6" if s >= 6 else "#F3EFE6")
        if ae is not None:
            pts = [(X(f / fps), y0 + 238 - min(1.2, ae[i]) * 36) for i, f in enumerate(fr) if i < len(ae) and ta <= f / fps < tb]
            if len(pts) > 1: d.line(pts, fill="#F25C9C", width=1)
        for lvl, col in (("WARN", "#FFC857"), ("FAIL", "#ff4d4d")):
            for t in lv[lvl]:
                if ta <= t < tb and t > 0: d.polygon([(X(t) - 6, y0 + 2), (X(t) + 6, y0 + 2), (X(t), y0 + 12)], fill=col)
    d.text((10, 4), "gold=SFX/beats  teal=VO/lyrics/strong hit  grey=motion  pink=scene/audio  triangles=WARN(gold)/FAIL(red)", font=big, fill="#F3EFE6")
    im.save(path)
    print("timeline:", path)


# ---------------------------------------------------------------- main
def report():
    order = {"FAIL": 0, "WARN": 1, "INFO": 2}
    print("\n==== A/V sync report ====")
    for lvl, t, msg in sorted(issues, key=lambda x: (order[x[0]], x[1])):
        print(f"{lvl:4}  {t:7.2f}s  {msg}")
    n = {k: sum(1 for i in issues if i[0] == k) for k in order}
    print(f"\n{n['FAIL']} FAIL, {n['WARN']} WARN, {n['INFO']} INFO" + ("  -> PASS" if not n["FAIL"] else "  -> FAIL"))
    return 1 if n["FAIL"] else 0


def main():
    meta = None; words = []; spans = []; aud = None
    if SRCP.lower().endswith(".mp4"):
        V = analyse_mp4(); fps = V["fps"]
        print(f"mp4: {len(V['frames'])} frames @ {fps:g}fps")
        flash_check(V, fps, 1)
        ons, aud = check_mp4(V, fps)
    else:
        res = analyse_html()
        if res is None:
            return report()
        meta, V, wav = res; fps = meta["fps"]
        if not len(V["frames"]):
            print("no frames analysed"); return report()
        flash_check(V, fps, A.step)
        if meta["engine"] == "svg":
            ons, words, aud, spans = check_svg(meta, V, wav)
        elif meta["engine"] == "canvas":
            ons, aud, _ = check_music(meta, V, fps)
        else:
            say("WARN", 0, "unknown engine (need SCENES+exportAudio, VO_CUES/SFX_CUES+exportAudio, or SC+draw) - only generic visual analysis run")
            ons = visual_onsets(V)
    if A.dump:
        np.savez(A.dump, sfxF=np.array([F for F, _ in (meta or {}).get("sfx", [])]), sfxN=np.array([n for _, n in (meta or {}).get("sfx", [])]), **{k: v for k, v in V.items() if isinstance(v, np.ndarray)})
    if not A.no_png and len(V["frames"]):
        draw_png(A.png or os.path.splitext(SRCP)[0] + "_sync.png", V, fps, meta, ons, aud, words, spans)
    return report()


if __name__ == "__main__":
    sys.exit(main())
