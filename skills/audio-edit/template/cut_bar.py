"""Cut a section (e.g. a lyric bar) out of a song with an equal-power crossfade.

Usage (seconds):
  python cut_bar.py in.mp3 out.mp3 --start 26.514 --end 29.241
Usage (bars, from the beat grid):
  python cut_bar.py in.mp3 out.mp3 --bpm 88 --b0 0.605 --bar 7 --bars 1
Options: --xf 20 (crossfade ms), --probe (only print an RMS envelope around the cut; writes nothing)

Always cut from an untouched *_orig backup. Prints the cut [start, len] for the video's CUTS list.
"""
import argparse, subprocess, sys
import numpy as np

SR = 48000

def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

def decode(path):
    raw = subprocess.run([ffmpeg(), '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def encode(x, path):
    p = subprocess.run([ffmpeg(), '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-',
                        '-c:a', 'libmp3lame', '-b:a', '192k', path], input=x.astype(np.float32).tobytes())
    if p.returncode: sys.exit('encode failed')

def rms_env(x, a, b, step=.05):
    for t in np.arange(max(0, a), b, step):
        s = x[int(t * SR):int((t + step) * SR)]
        r = float(np.sqrt((s ** 2).mean())) if len(s) else 0
        print(f'{t:8.2f}s {r:.3f} ' + '#' * int(r * 120))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp'); ap.add_argument('out')
    ap.add_argument('--start', type=float); ap.add_argument('--end', type=float)
    ap.add_argument('--bpm', type=float); ap.add_argument('--b0', type=float, default=0)
    ap.add_argument('--bar', type=float, help='0-based bar index of the cut start')
    ap.add_argument('--bars', type=float, default=1)
    ap.add_argument('--xf', type=float, default=20, help='crossfade ms')
    ap.add_argument('--probe', action='store_true')
    a = ap.parse_args()

    if a.bpm and a.bar is not None:
        bar = 4 * 60 / a.bpm
        a.start = a.b0 + a.bar * bar
        a.end = a.start + a.bars * bar
    if a.start is None or a.end is None or a.end <= a.start:
        sys.exit('give --start/--end or --bpm/--b0/--bar')

    x = decode(a.inp)
    if a.probe:
        rms_env(x, a.start - 1, a.end + 1); return

    i0, i1 = int(round(a.start * SR)), int(round(a.end * SR))
    n = max(1, int(a.xf / 1000 * SR))
    th = np.linspace(0, np.pi / 2, n)[:, None]
    fo, fi = np.cos(th), np.sin(th)              # equal-power
    head, tail = x[:i0], x[i1:]
    mix = head[-n:] * fo + tail[:n] * fi
    y = np.concatenate([head[:-n], mix, tail[n:]])

    steps = np.abs(np.diff(x, axis=0)).max(axis=1)
    p999 = float(np.percentile(steps, 99.9))
    j = i0 - n
    loc = float(np.abs(np.diff(y[max(0, j - 480):j + n + 480], axis=0)).max())
    ok = loc <= p999 * 1.25
    print(f'splice max step {loc:.3f} vs song p99.9 {p999:.3f} -> '
          f'{"OK" if ok else "POSSIBLE CLICK (nudge cut points / longer --xf)"}')

    encode(y, a.out)
    print(f'wrote {a.out}: {len(x)/SR:.2f}s -> {len(y)/SR:.2f}s')
    print(f'CUTS entry for video.html: [{a.start:.3f}, {(i1 - i0) / SR:.3f}]')

if __name__ == '__main__':
    main()
