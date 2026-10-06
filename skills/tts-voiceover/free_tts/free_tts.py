"""Free / open TTS voice picker: one catalogue (voices.json), one call to render any voice.

CLI
  python free_tts.py --list [filter]            # catalogue (filter matches id, accent, character, best_for)
  python free_tts.py --prompt kokoro:bm_george  # voice notes to paste into the video's PROMPT.md
  python free_tts.py --say kokoro:bm_george "Hello there." [-o out.mp3|.wav]
  python free_tts.py --doctor                   # which engines are installed where

Library (used by every make_voice.py)
  import free_tts
  out = free_tts.render({"intro": ("kokoro:bm_george", "Hello."), "hi": ({"id": "kokoro:af_heart", "speed": 0.9}, "Hi!")})
  out["intro"] -> {"mp3": bytes, "dur": seconds, "words": [[sec, word], ...], "wav": float32 48 kHz mono}

A voice spec is a catalogue id ("engine:name"), or a dict {"id": ..., <opt overrides>} (e.g. speed, lang, rate,
exaggeration, ref="path/to/reference.wav" for chatterbox:clone). Engines that are not importable in this
interpreter are run in their own venv: TTS_PY (default ~/tts-venv) or CHATTERBOX_PY (default ~/cb-venv).
Model files live in TTS_MODELS (default ~/tts-models): kokoro/kokoro-v1.0.onnx + voices-v1.0.bin, piper/<voice>.onnx(.json).
"""
import argparse, asyncio, importlib.util, json, os, pathlib, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
CATALOGUE = HERE / "voices.json"
MODELS = pathlib.Path(os.environ.get("TTS_MODELS", pathlib.Path.home() / "tts-models"))
TTS_PY = os.environ.get("TTS_PY", str(pathlib.Path.home() / "tts-venv" / "Scripts" / "python.exe"))
CHATTERBOX_PY = os.environ.get("CHATTERBOX_PY", str(pathlib.Path.home() / "cb-venv" / "Scripts" / "python.exe"))
SR = 48000
MODULE = {"edge": "edge_tts", "piper": "piper", "kitten": "kittentts", "kokoro": "kokoro_onnx",
          "supertonic": "supertonic", "pocket": "pocket_tts", "chatterbox": "chatterbox", "sapi": None}
ORDER = ["sapi", "edge", "piper", "kitten", "kokoro", "supertonic", "pocket", "chatterbox"]
CREDIT = "Made with GitHub Copilot + Claude Opus 5.5"


def catalogue():
    return json.loads(CATALOGUE.read_text(encoding="utf-8"))


def resolve(spec):
    """Spec (id string or dict) -> {"id", "engine", "voice", "opts", "ref", "meta"}."""
    d = {"id": spec} if isinstance(spec, str) else dict(spec)
    cat = catalogue()
    vid = d.pop("id", None)
    if vid not in cat["voices"]:
        near = [k for k in cat["voices"] if vid and vid.split(":")[-1].lower() in k.lower()]
        raise SystemExit(f"unknown voice {vid!r}" + (f"; did you mean {near}?" if near else "; run free_tts.py --list"))
    m = cat["voices"][vid]
    ref = d.pop("ref", None)
    if m.get("needs") == "ref" and not ref:
        raise SystemExit(f"{vid} clones a voice: pass {{'id': '{vid}', 'ref': 'path/to/5-10s-clean-reference.wav'}}")
    return {"id": vid, "engine": m["engine"], "voice": m["voice"], "opts": {**m.get("opts", {}), **d},
            "ref": str(pathlib.Path(ref).resolve()) if ref else None, "meta": m}


def whisper_lang(v):
    lang = v["opts"].get("lang") or (v["voice"][:2] if v["engine"] == "edge" else "en")
    return lang.split("-")[0].lower()


# ------------------------------------------------------------------ engines: each takes [{"out", "voice", "text", "opts", "ref"}]
# and writes j["out"] (any format ffmpeg can read).
def gen_sapi(jobs):
    for j in jobs:
        out, t = j["out"].replace("'", "''"), j["text"].replace("'", "''")
        rate = int(j["opts"].get("rate", 0))
        ps = ("Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; "
              f"$s.SelectVoice('{j['voice']}'); $s.Rate={rate}; $s.SetOutputToWaveFile('{out}'); $s.Speak('{t}'); $s.Dispose()")
        subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)


def gen_edge(jobs):
    import edge_tts

    async def run():
        for j in jobs:
            best = b""
            for _ in range(3):   # the service occasionally truncates a clip; keep the longest take
                buf = bytearray()
                o = j["opts"]
                async for c in edge_tts.Communicate(j["text"], voice=j["voice"], rate=o.get("rate", "+0%"),
                                                    pitch=o.get("pitch", "+0Hz")).stream():
                    if c["type"] == "audio":
                        buf += c["data"]
                best = max(best, bytes(buf), key=len)
            pathlib.Path(j["out"]).write_bytes(best)
    asyncio.run(run())


def gen_piper(jobs):
    import wave
    from piper import PiperVoice, SynthesisConfig
    cache = {}
    for j in jobs:
        v = j["voice"]
        if v not in cache:
            onnx = MODELS / "piper" / f"{v}.onnx"
            if not onnx.exists():
                raise SystemExit(f"missing {onnx}: download {v}.onnx + .onnx.json from https://huggingface.co/rhasspy/piper-voices")
            cache[v] = PiperVoice.load(str(onnx))
        cfg = SynthesisConfig(length_scale=j["opts"]["length_scale"]) if "length_scale" in j["opts"] else None
        with wave.open(j["out"], "wb") as w:
            cache[v].synthesize_wav(j["text"], w, syn_config=cfg)


def gen_kitten(jobs):
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    os.environ["ESPEAK_DATA_PATH"] = espeakng_loader.get_data_path()
    from kittentts import KittenTTS
    m = KittenTTS()
    for j in jobs:
        sf.write(j["out"], m.generate(j["text"], voice=j["voice"]), 24000)


def gen_kokoro(jobs):
    from kokoro_onnx import Kokoro
    k = Kokoro(str(MODELS / "kokoro" / "kokoro-v1.0.onnx"), str(MODELS / "kokoro" / "voices-v1.0.bin"))
    for j in jobs:
        o = j["opts"]
        a, sr = k.create(j["text"], voice=j["voice"], speed=o.get("speed", 1.0), lang=o.get("lang", "en-us"))
        sf.write(j["out"], a, sr)


def gen_supertonic(jobs):
    from supertonic import TTS
    s = TTS()
    for j in jobs:
        o = j["opts"]
        w, _ = s.synthesize(j["text"], voice_style=s.get_voice_style(j["voice"]), lang=o.get("lang", "en"),
                            speed=o.get("speed", 1.05))
        sf.write(j["out"], np.squeeze(w), s.sample_rate)


def gen_pocket(jobs):
    from pocket_tts import TTSModel
    m = TTSModel.load_model()
    for j in jobs:
        sf.write(j["out"], m.generate_audio(m.get_state_for_audio_prompt(j["voice"]), j["text"]).numpy(), m.sample_rate)


def gen_chatterbox(jobs):
    import perth
    if perth.PerthImplicitWatermarker is None:   # native watermarker unavailable on this platform
        perth.PerthImplicitWatermarker = perth.DummyWatermarker
    from chatterbox.tts import ChatterboxTTS
    m = ChatterboxTTS.from_pretrained(device="cpu")   # ~20 s to load, ~15-20 s per line on CPU
    for j in jobs:
        o = j["opts"]
        w = m.generate(j["text"], audio_prompt_path=j.get("ref"), exaggeration=o.get("exaggeration", 0.5),
                       cfg_weight=o.get("cfg_weight", 0.5))
        sf.write(j["out"], w.squeeze(0).numpy(), m.sr)
        print("chatterbox", j["out"], flush=True)


GEN = {"sapi": gen_sapi, "edge": gen_edge, "piper": gen_piper, "kitten": gen_kitten, "kokoro": gen_kokoro,
       "supertonic": gen_supertonic, "pocket": gen_pocket, "chatterbox": gen_chatterbox}


def interpreter(engine):
    """None = run in this process, else the python.exe that has the engine installed."""
    mod = MODULE[engine]
    if mod is None or importlib.util.find_spec(mod):
        return None
    py = CHATTERBOX_PY if engine == "chatterbox" else TTS_PY
    if not pathlib.Path(py).exists():
        eng = catalogue()["engines"][engine]
        raise SystemExit(f"{engine} is not installed here and {py} does not exist.\n  install: {eng['install']}\n"
                         f"  or set {'CHATTERBOX_PY' if engine == 'chatterbox' else 'TTS_PY'} to a python.exe that has it")
    return py


def generate(engine, jobs, tmp):
    py = interpreter(engine)
    if py is None:
        GEN[engine](jobs)
        return
    spec = pathlib.Path(tmp) / f"{engine}-jobs.json"
    spec.write_text(json.dumps({"engine": engine, "jobs": jobs}), encoding="utf-8")
    subprocess.run([py, str(pathlib.Path(__file__).resolve()), "--_worker", str(spec)], check=True)


# ------------------------------------------------------------------ post-processing
def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def load48(path):
    p = subprocess.run([ffmpeg(), "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def process(a):
    """Trim silence, match loudness across engines (~-20 dBFS speech RMS), 5 ms fades, 20 ms head / 100 ms tail pad."""
    win = SR // 100
    rms = np.sqrt(np.convolve(a * a, np.ones(win) / win, mode="same"))
    on = np.where(rms > max(rms.max() * 0.03, 1e-4))[0]
    a = a[max(0, on[0] - SR // 50): min(len(a), on[-1] + SR // 15)] if len(on) else a
    active = rms[on] if len(on) else rms
    a = a * (10 ** (-20 / 20) / (np.sqrt(np.mean(active ** 2)) + 1e-9))
    pk = np.abs(a).max()
    if pk > 0.89:
        a = a * 0.89 / pk
    f = SR // 200
    a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return np.concatenate([np.zeros(SR // 50, np.float32), a.astype(np.float32), np.zeros(SR // 10, np.float32)])


def to_mp3(a, bitrate="128k", sr=SR):
    p = subprocess.run([ffmpeg(), "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                        "-ar", str(sr), "-c:a", "libmp3lame", "-b:a", bitrate, "-f", "mp3", "-"],
                       input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    return p.stdout


_WHISPER = {}


def align(a, lang="en", text=None):
    """Word start times [[sec, word], ...] via faster-whisper. Uses the script's words when the counts match."""
    from faster_whisper import WhisperModel
    name = "base.en" if lang == "en" else "small"
    if name not in _WHISPER:
        _WHISPER[name] = WhisperModel(name, device="cpu", compute_type="int8")
    a16 = np.convolve(a.astype(np.float32), np.ones(3, np.float32) / 3, "same")[::SR // 16000]  # whisper wants 16 kHz
    segs, _ = _WHISPER[name].transcribe(a16, language=lang, word_timestamps=True, beam_size=5)
    words = [[round(w.start, 2), w.word.strip()] for s in segs for w in (s.words or [])]
    script = (text or "").split()
    if script and len(script) == len(words):
        words = [[t, w] for (t, _), w in zip(words, script)]
    return words


def render(items, bitrate="128k", sr=SR, words=True):
    """items {key: (spec, text)} -> {key: {"mp3", "dur", "words", "wav", "id"}}. Engines are batched (one model load each)."""
    res = {k: (resolve(spec), text) for k, (spec, text) in items.items()}
    out = {}
    with tempfile.TemporaryDirectory() as tmp:
        for eng in ORDER:
            ext = ".mp3" if eng == "edge" else ".wav"
            jobs = [{"key": k, "out": str(pathlib.Path(tmp) / f"{k}{ext}"), "voice": v["voice"], "text": t,
                     "opts": v["opts"], "ref": v["ref"]} for k, (v, t) in res.items() if v["engine"] == eng]
            if not jobs:
                continue
            print(f"[free_tts] {eng}: {len(jobs)} line(s)", flush=True)
            generate(eng, jobs, tmp)
            for j in jobs:
                v, t = res[j["key"]]
                a = process(load48(j["out"]))
                out[j["key"]] = {"id": v["id"], "wav": a, "dur": round(len(a) / SR, 2),
                                 "mp3": to_mp3(a, bitrate, sr),
                                 "words": align(a, whisper_lang(v), t) if words else []}
    return out


# ------------------------------------------------------------------ CLI
def prompt_block(vid):
    cat = catalogue()
    v = resolve(vid)
    m, e = v["meta"], cat["engines"][v["engine"]]
    opts = ", ".join(f"{k}={val}" for k, val in v["opts"].items()) or "defaults"
    return "\n".join([
        f"## Voice notes - {vid}",
        f"- Voice: {e['name']} `{v['voice']}` ({m['gender']}, {m['accent']}; {m['character']}). Options: {opts}.",
        f"- Best for: {m['best_for']}.",
        f"- Engine rules: {e['prompt']}",
        f"- This voice: {m['prompt']}",
        f"- Set it in make_voice.py: `VOICE = \"{vid}\"` (or `{{\"id\": \"{vid}\", ...overrides}}`), then `python make_voice.py`.",
        f"- Licence: {m['licence']} (commercial use: {m['commercial']}). Engine: {e['repo']}",
        f"- Credit line: \"Voice: {e['name']} ({m['licence']}). {CREDIT}\"",
    ])


def cmd_list(flt):
    cat = catalogue()
    f = (flt or "").lower()
    rows = [(k, m) for k, m in cat["voices"].items()
            if not f or any(f in str(x).lower() for x in (k, m["accent"], m["gender"], m["character"], m["best_for"], m["engine"]))]
    print(f"{'id':22} {'accent':6} {'sex':6} {'comm.':5}  character / best for")
    for k, m in rows:
        print(f"{k:22} {m['accent']:6} {m['gender'][:6]:6} {m['commercial']:5}  {m['character']} | {m['best_for']}")
    print(f"\n{len(rows)} voice(s). Details: free_tts.py --prompt <id>   Hear one: free_tts.py --say <id> \"text\"")


def cmd_doctor():
    for eng in ORDER:
        mod = MODULE[eng]
        here = mod is None or bool(importlib.util.find_spec(mod))
        where = "this python" if here else ""
        if not here:
            py = CHATTERBOX_PY if eng == "chatterbox" else TTS_PY
            ok = pathlib.Path(py).exists() and subprocess.run(
                [py, "-c", f"import importlib.util,sys; sys.exit(0 if importlib.util.find_spec('{mod}') else 1)"]).returncode == 0
            where = py if ok else f"MISSING (install: {catalogue()['engines'][eng]['install']})"
        print(f"{eng:11} {where}")
    print(f"models: {MODELS}")


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--_worker":
        spec = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf-8"))
        GEN[spec["engine"]](spec["jobs"])
        return
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--list", nargs="?", const="", metavar="FILTER")
    ap.add_argument("--prompt", metavar="ID")
    ap.add_argument("--say", nargs=2, metavar=("ID", "TEXT"))
    ap.add_argument("-o", "--out", help="output .mp3 or .wav for --say (default <id>.mp3)")
    ap.add_argument("--doctor", action="store_true")
    A = ap.parse_args()
    if A.list is not None:
        cmd_list(A.list)
    elif A.prompt:
        print(prompt_block(A.prompt))
    elif A.say:
        vid, text = A.say
        r = render({"say": (vid, text)})["say"]
        out = pathlib.Path(A.out or vid.replace(":", "_") + ".mp3")
        if out.suffix.lower() == ".wav":
            sf.write(out, r["wav"], SR)
        else:
            out.write_bytes(r["mp3"])
        print(f"{out}  {r['dur']:.2f}s  " + " ".join(f"{w}@{int(t * 30)}" for t, w in r["words"]))
    elif A.doctor:
        cmd_doctor()
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
