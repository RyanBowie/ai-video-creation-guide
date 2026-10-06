"""Generates voice.js for voice-showcase.html: every line voiced by a different free TTS engine.

Usage:
  python make_voices.py                 # generate missing takes, then rebuild voice.js
  python make_voices.py --force kokoro  # regenerate every take from one engine (or a line key)

Engines (all free, all run on a laptop CPU except edge-tts, which calls Microsoft's online service):
  sapi        Windows SAPI 'Microsoft David Desktop' (built into Windows, offline)
  piper       Piper (OHF-Voice/piper1-gpl)            pip install piper-tts   + .onnx voices
  kitten      Kitten TTS nano (KittenML)              pip install kittentts espeakng-loader
  kokoro      Kokoro-82M via kokoro-onnx (hexgrad)    pip install kokoro-onnx + kokoro-v1.0.onnx, voices-v1.0.bin
  supertonic  Supertonic (Supertone)                  pip install supertonic
  pocket      Pocket TTS (Kyutai)                     pip install pocket-tts
  chatterbox  Chatterbox (Resemble AI)                own venv: pip install chatterbox-tts (run via CHATTERBOX_PY)
  edge        edge-tts (Microsoft neural voices)      pip install edge-tts

Model files live in TTS_MODELS (default ~/tts-models): kokoro/*.onnx|bin and piper/*.onnx(.json).
  kokoro: https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
  piper:  https://huggingface.co/rhasspy/piper-voices (en_US-ryan-high, en_US-lessac-high,
          en_GB-northern_english_male-medium)
The other engines download their weights on first use. Links and licences: THIRD_PARTY_NOTICES.md.
"""
import argparse, asyncio, base64, json, os, pathlib, subprocess, sys, tempfile
import numpy as np, soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
RAW = HERE / "build" / "raw"
MODELS = pathlib.Path(os.environ.get("TTS_MODELS", pathlib.Path.home() / "tts-models"))
CHATTERBOX_PY = os.environ.get("CHATTERBOX_PY", str(pathlib.Path.home() / "cb-venv" / "Scripts" / "python.exe"))
SR = 48000
NARRATOR = "en-US-AndrewMultilingualNeural"

# key: (engine, voice, text, options).  Numbers and acronyms are spelled out for the TTS.
LINES = {
    # cold open - one sentence relayed engine to engine
    "r_sapi":   ("sapi", "Microsoft David Desktop", "This one sentence", {}),
    "r_piper":  ("piper", "en_US-ryan-high",     "gets passed along", {}),
        "r_kitten": ("kitten", "expr-voice-3-m", "from one model to the next,", {}),   # Kitten nano garbles 2-word inputs
        "r_kokoro": ("kokoro", "bm_george", "and the next,", {}),
        "r_super":  ("supertonic", "F2", "and the next,", {}),
        "r_pocket": ("pocket", "alba", "and the next,", {}),
    "r_cb":     ("chatterbox", "default", "to show you how different", {"exaggeration": 0.6}),
    "r_edge":   ("edge", "en-US-AvaMultilingualNeural", "free A.I. voices can sound.", {}),
    # narrator
    "n_title":  ("edge", NARRATOR, "One sentence. Eight different engines. And every one of them is free to use. Let's meet the cast.", {"rate": "-4%"}),
    # roll call - each engine introduces itself
    "sapi":     ("sapi", "Microsoft David Desktop", "Hello. I am Microsoft David. I come built into Windows, and I work completely offline.", {}),
    "piper1":   ("piper", "en_US-ryan-high", "I'm Piper. I'm small enough to run on a Raspberry Pi, and I come in hundreds of voices,", {}),
    "piper2":   ("piper", "en_GB-northern_english_male-medium", "including this one, from the north of England.", {}),
    "kitten":   ("kitten", "expr-voice-4-f", "I'm Kitten T T S. My whole model is under twenty-five megabytes.", {}),
    "kokoro1":  ("kokoro", "af_heart", "I'm Kokoro. Just eighty-two million parameters,", {}),
    "kokoro2":  ("kokoro", "bm_george", "more than fifty voices,", {}),
    "kokoro3":  ("kokoro", "ff_siwis", "et je parle aussi français.", {"lang": "fr-fr"}),
    "super1":   ("supertonic", "M1", "I'm Supertonic. I speak thirty-one languages.", {}),
    "super2":   ("supertonic", "F1", "Hablo español,", {"lang": "es"}),
    "super3":   ("supertonic", "M3", "spreche Deutsch,", {"lang": "de"}),
    "super4":   ("supertonic", "F3", "한국어도 할 수 있어요.", {"lang": "ko"}),
    "pocket1":  ("pocket", "javert", "I'm Pocket T T S, from Kyutai. I talk faster than real time, on a laptop C P U.", {}),
    "pocket2":  ("pocket", "alba", "No graphics card required.", {}),
    "cb1":      ("chatterbox", "default", "Hi, I'm Chatterbox. I can keep things calm, and measured.", {"exaggeration": 0.25, "cfg_weight": 0.5}),
    "cb2":      ("chatterbox", "default", "Or I can get really, really excited about it!", {"exaggeration": 1.3, "cfg_weight": 0.3}),
    "cb3":      ("chatterbox", "clone:n_title", "I can even clone a voice from a few seconds of audio. Sound familiar?", {"exaggeration": 0.45, "cfg_weight": 0.5}),
    "edge1":    ("edge", "en-US-AvaMultilingualNeural", "And I'm a Microsoft neural voice, through edge T T S. Hundreds of voices, in over seventy languages.", {}),
    "edge2":    ("edge", "en-AU-NatashaNeural", "G'day from Australia, too!", {}),
    # the GPU wall
    "n_wall":   ("edge", NARRATOR, "And that's only what runs on this laptop. Add a G.P.U., and there are dozens more. Vibe Voice, for whole podcasts. Deeya, for dialogue. Orpheus, with laughs and sighs. And Parler, which designs a voice from a description.", {"rate": "-2%"}),
    # finale - the whole cast, one word each
    "f_sapi":   ("sapi", "Microsoft David Desktop", "Free.", {}),
    "f_piper":  ("piper", "en_US-lessac-high", "Free.", {}),
    "f_kitten": ("kitten", "expr-voice-5-m", "Free!", {}),
    "f_kokoro": ("kokoro", "af_heart", "Free!", {}),
    "f_super":  ("supertonic", "F2", "Free!", {}),
    "f_pocket": ("pocket", "javert", "Free.", {}),
    "f_cb":     ("chatterbox", "default", "Free!", {"exaggeration": 1.2, "cfg_weight": 0.4}),
    "f_edge":   ("edge", "en-US-AvaMultilingualNeural", "Free!", {}),
    "n_outro":  ("edge", NARRATOR, "One script. Many voices. Made with GitHub Copilot, and Claude Opus five point five.", {"rate": "-4%"}),
}


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


# ------------------------------------------------------------------ engines (each writes RAW/<key>.wav)
def gen_sapi(jobs):
    for key, voice, text, _ in jobs:
        out = str(RAW / f"{key}.wav").replace("'", "''")
        t = text.replace("'", "''")
        ps = ("Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; "
              f"$s.SelectVoice('{voice}'); $s.SetOutputToWaveFile('{out}'); $s.Speak('{t}'); $s.Dispose()")
        subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)


def gen_piper(jobs):
    import wave
    from piper import PiperVoice
    cache = {}
    for key, voice, text, _ in jobs:
        pv = cache.setdefault(voice, PiperVoice.load(str(MODELS / "piper" / f"{voice}.onnx")))
        with wave.open(str(RAW / f"{key}.wav"), "wb") as w:
            pv.synthesize_wav(text, w)


def gen_kitten(jobs):
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    os.environ["ESPEAK_DATA_PATH"] = espeakng_loader.get_data_path()
    from kittentts import KittenTTS
    m = KittenTTS()
    for key, voice, text, _ in jobs:
        sf.write(RAW / f"{key}.wav", m.generate(text, voice=voice), 24000)


def gen_kokoro(jobs):
    from kokoro_onnx import Kokoro
    k = Kokoro(str(MODELS / "kokoro" / "kokoro-v1.0.onnx"), str(MODELS / "kokoro" / "voices-v1.0.bin"))
    for key, voice, text, o in jobs:
        a, sr = k.create(text, voice=voice, speed=o.get("speed", 1.0), lang=o.get("lang", "en-us"))
        sf.write(RAW / f"{key}.wav", a, sr)


def gen_supertonic(jobs):
    from supertonic import TTS
    s = TTS()
    for key, voice, text, o in jobs:
        w, _ = s.synthesize(text, voice_style=s.get_voice_style(voice), lang=o.get("lang", "en"))
        sf.write(RAW / f"{key}.wav", np.squeeze(w), s.sample_rate)


def gen_pocket(jobs):
    from pocket_tts import TTSModel
    m = TTSModel.load_model()
    for key, voice, text, _ in jobs:
        sf.write(RAW / f"{key}.wav", m.generate_audio(m.get_state_for_audio_prompt(voice), text).numpy(), m.sample_rate)


CB_SCRIPT = r'''
import json, sys, perth, soundfile as sf
if perth.PerthImplicitWatermarker is None:   # native watermarker unavailable on this platform
    perth.PerthImplicitWatermarker = perth.DummyWatermarker
from chatterbox.tts import ChatterboxTTS
m = ChatterboxTTS.from_pretrained(device="cpu")
for j in json.load(open(sys.argv[1], encoding="utf-8")):
    w = m.generate(j["text"], audio_prompt_path=j.get("prompt"), exaggeration=j["exaggeration"], cfg_weight=j["cfg_weight"])
    sf.write(j["out"], w.squeeze(0).numpy(), m.sr); print("chatterbox", j["out"], flush=True)
'''


def gen_chatterbox(jobs):
    spec = []
    for key, voice, text, o in jobs:
        j = {"text": text, "out": str(RAW / f"{key}.wav"),
             "exaggeration": o.get("exaggeration", 0.5), "cfg_weight": o.get("cfg_weight", 0.5)}
        if voice.startswith("clone:"):
            j["prompt"] = str(HERE / "build" / "final" / f"{voice[6:]}.wav")   # clone the processed narrator take
        spec.append(j)
    with tempfile.TemporaryDirectory() as td:
        (pathlib.Path(td) / "cb.py").write_text(CB_SCRIPT, encoding="utf-8")
        (pathlib.Path(td) / "jobs.json").write_text(json.dumps(spec), encoding="utf-8")
        subprocess.run([CHATTERBOX_PY, str(pathlib.Path(td) / "cb.py"), str(pathlib.Path(td) / "jobs.json")], check=True)


def gen_edge(jobs):
    import edge_tts

    async def one(key, voice, text, o):
        best = b""
        for _ in range(3):   # the service occasionally truncates a clip; keep the longest take
            buf = bytearray()
            async for c in edge_tts.Communicate(text, voice=voice, rate=o.get("rate", "+0%")).stream():
                if c["type"] == "audio":
                    buf += c["data"]
            best = max(best, bytes(buf), key=len)
        subprocess.run([ffmpeg(), "-loglevel", "error", "-y", "-i", "pipe:0", str(RAW / f"{key}.wav")], input=best, check=True)

    async def run():
        for j in jobs:
            await one(*j)
    asyncio.run(run())


ENGINES = {"sapi": gen_sapi, "piper": gen_piper, "kitten": gen_kitten, "kokoro": gen_kokoro,
           "supertonic": gen_supertonic, "pocket": gen_pocket, "edge": gen_edge, "chatterbox": gen_chatterbox}


# ------------------------------------------------------------------ post-processing
def load48(path):
    p = subprocess.run([ffmpeg(), "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def process(a):
    """Trim silence, match loudness across engines, short fades, small head/tail pad."""
    win = SR // 100
    rms = np.sqrt(np.convolve(a * a, np.ones(win) / win, mode="same"))
    on = np.where(rms > max(rms.max() * 0.03, 1e-4))[0]
    a = a[max(0, on[0] - SR // 50): min(len(a), on[-1] + SR // 15)] if len(on) else a
    active = rms[on] if len(on) else rms
    a = a * (10 ** (-20 / 20) / (np.sqrt(np.mean(active ** 2)) + 1e-9))    # ~-20 dBFS speech RMS
    pk = np.abs(a).max()
    if pk > 0.89:
        a = a * 0.89 / pk
    f = SR // 200
    a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return np.concatenate([np.zeros(SR // 50, np.float32), a.astype(np.float32), np.zeros(SR // 10, np.float32)])


def envelope(a, fps=30):
    n = int(np.ceil(len(a) / (SR / fps)))
    e = np.array([np.sqrt(np.mean(a[int(i * SR / fps): int((i + 1) * SR / fps)] ** 2) + 1e-12) for i in range(n)])
    return [round(float(x), 2) for x in np.clip(e / (e.max() + 1e-9), 0, 1)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", nargs="*", default=[], help="engine names or line keys to regenerate")
    A = ap.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    (HERE / "build" / "final").mkdir(parents=True, exist_ok=True)
    order = ["sapi", "piper", "kitten", "kokoro", "supertonic", "pocket", "edge", "chatterbox"]  # chatterbox last: clones edge
    for eng in order:
        jobs = [(k, v, t, o) for k, (e, v, t, o) in LINES.items() if e == eng and
                (not (RAW / f"{k}.wav").exists() or eng in A.force or k in A.force)]
        if jobs:
            print(f"[{eng}] {len(jobs)} line(s)", flush=True)
            if eng == "chatterbox":   # make sure clone prompts are processed first
                for k, (e, v, t, o) in LINES.items():
                    if e != "chatterbox":
                        sf.write(HERE / "build" / "final" / f"{k}.wav", process(load48(RAW / f"{k}.wav")), SR)
            ENGINES[eng](jobs)

    clips, dur, env, meta = {}, {}, {}, {}
    for k, (e, v, t, o) in LINES.items():
        a = process(load48(RAW / f"{k}.wav"))
        wav = HERE / "build" / "final" / f"{k}.wav"
        sf.write(wav, a, SR)
        mp3 = subprocess.run([ffmpeg(), "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "128k", "-f", "mp3", "-"],
                             capture_output=True, check=True).stdout
        clips[k] = base64.b64encode(mp3).decode()
        dur[k] = round(len(a) / SR, 3)
        env[k] = envelope(a)
        meta[k] = {"engine": e, "voice": v, "text": t, "dur": dur[k]}
        print(f"{k:9} {e:10} {dur[k]:5.2f}s  {t}")
    (HERE / "voice_timing.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding="utf-8")
    (HERE / "voice.js").write_text("window.VOICE = " + json.dumps(clips) + ";\nwindow.VDUR = " + json.dumps(dur) +
                                   ";\nwindow.VENV = " + json.dumps(env) + ";\n", encoding="utf-8")
    print("wrote voice.js", round(sum(dur.values()), 1), "s of speech")


if __name__ == "__main__":
    main()
