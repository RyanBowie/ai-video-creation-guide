"""Generates voice.js (base64 MP3 clips) + voice_timing.js/.json (word timings) for paper-copilot.html.

Usage:  python make_voice.py [key ...]   (needs: pip install --user edge-tts imageio-ffmpeg numpy)
        python make_voice.py --trim         re-trims trailing silence on the existing clips
        With keys, only those clips are regenerated and merged into the existing voice.js.
"""
import asyncio, base64, json, pathlib, sys
import subprocess

import imageio_ffmpeg, numpy as np

TAIL = 0.06  # seconds kept after the last audible sample (edge-tts pads ~0.35s of silence)

NARRATOR = dict(voice="en-US-AndrewMultilingualNeural", rate="+4%", pitch="+0Hz")

LINES = {
    "intro":   (NARRATOR, "Chapter one... The Inbox Quest!"),
    "monday":  (NARRATOR, "Monday morning. Pip opens the inbox... and nine hundred ninety-nine emails attack!"),
    "partner": (NARRATOR, "Running out of time? Call in a partner... Copilot!"),
    "attack":  (NARRATOR, "Summarise the inbox. Sort the meetings. Excellent!"),
    "win":     (NARRATOR, "Inbox zero. Three hours back. Level up!"),
    "outro":   (NARRATOR, "Microsoft three-sixty-five Copilot. Your partner for every quest."),
}

def trim(mp3):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    pcm = subprocess.run([ff, "-v", "quiet", "-i", "pipe:0", "-f", "s16le", "-ac", "1", "-ar", "24000", "pipe:1"], input=mp3, capture_output=True).stdout
    a, w = np.frombuffer(pcm, np.int16).astype(float) / 32768, 480
    loud = [i for i in range(0, len(a) - w, w) if np.sqrt(np.mean(a[i:i + w] ** 2)) > 10 ** (-45 / 20)]
    end = (loud[-1] + w) / 24000 + TAIL if loud else len(a) / 24000
    return subprocess.run([ff, "-v", "quiet", "-i", "pipe:0", "-t", f"{end:.3f}", "-af", "afade=t=out:st=%.3f:d=0.04" % max(0, end - .04),
                           "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1", "-f", "mp3", "pipe:1"], input=mp3, capture_output=True).stdout, end

async def tts(voice, text):
    out, words = bytearray(), []
    async for chunk in edge_tts.Communicate(text, boundary="WordBoundary", **voice).stream():
        if chunk["type"] == "audio":
            out += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            words.append((round(chunk["offset"] / 1e7, 2), chunk["text"]))
    return bytes(out), words

def save(here, clips, timing):
    here.with_name("voice_timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    here.with_name("voice_timing.js").write_text("window.VT = " + json.dumps(timing, indent=1) + ";\n", encoding="utf-8")
    path = here.with_name("voice.js")
    path.write_text("window.VOICE = " + json.dumps(clips) + ";\n", encoding="utf-8")
    print("wrote", path)

async def main():
    only, here = sys.argv[1:], pathlib.Path(__file__)
    if only == ["--trim"]:
        clips = json.loads(here.with_name("voice.js").read_text(encoding="utf-8")[len("window.VOICE = "):].rstrip().rstrip(";"))
        timing = json.loads(here.with_name("voice_timing.json").read_text(encoding="utf-8"))
        for key in clips:
            mp3, end = trim(base64.b64decode(clips[key]))
            clips[key], timing[key]["dur"] = base64.b64encode(mp3).decode(), round(end, 2)
            print(f"{key:8} trimmed to {end:.2f}s")
        return save(here, clips, timing)
    clips, timing = {}, {}
    if only:
        bad = [k for k in only if k not in LINES]
        if bad:
            raise SystemExit(f"unknown key(s) {bad}; choose from {list(LINES)}")
        clips = json.loads(here.with_name("voice.js").read_text(encoding="utf-8")[len("window.VOICE = "):].rstrip().rstrip(";"))
        timing = json.loads(here.with_name("voice_timing.json").read_text(encoding="utf-8"))
    for key, (voice, text) in LINES.items():
        if only and key not in only:
            continue
        takes = [await tts(voice, text) for _ in range(3)]  # the service occasionally truncates; keep the longest
        best, words = max(takes, key=lambda t: len(t[0]))
        best, dur = trim(best)
        clips[key] = base64.b64encode(best).decode()
        timing[key] = {"dur": round(dur, 2), "words": words}
        print(f"{key:8} {dur:5.2f}s  " + " ".join(f"{w}@{int(o * 30)}" for o, w in words))
    save(here, clips, timing)

asyncio.run(main())
