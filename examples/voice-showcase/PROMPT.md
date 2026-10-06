# Build prompt: "Voice Showcase" (2:08 motion-graphics explainer)

This prompt produced `voice-showcase.html` and `voice-showcase.mp4`. It merges the original brief and the decisions made during the build. To reproduce or remix the video, paste it into a Copilot session that has the `motion-graphics`, `tts-voiceover` and `av-sync` skills.

---

## The prompt

> Make a short video that shows how varied and customisable free AI voices are now. Search GitHub and the news for
> free or open text-to-speech models that can voice an MP4. Start from [hexgrad/Kokoro-82M](https://github.com/hexgrad/kokoro)
> and the edge-tts voices we already use. Keep every engine that actually runs on this laptop
> (Snapdragon X Elite, CPU only, no CUDA). Name the GPU-only models without running them.
>
> Use the **motion-graphics** SVG `render(F)` engine. Use `skills/motion-graphics/template/microsoft-model-hub.html` as the
> template: night palette, 1920×1080 at 30 fps, and the Copilot mark. Give each engine its own colour, then build
> these scenes:
>
> 1. **Relay cold open (≈13 s):** one sentence passed from model to model: *"This one sentence / gets passed along /
>    from one model to the next, / and the next, / and the next, / and the next, / to show you how different / free
>    A.I. voices can sound."* A baton moves along a row of engine chips. Each word lights up in the speaker's colour
>    as that engine says it.
> 2. **Title (≈7 s):** "One sentence. Eight different engines. And every one of them is free to use. Let's meet the cast." read by the narrator (edge-tts Andrew Multilingual).
> 3. **Roll call: one card per engine.** Each engine introduces itself in its own voice. The card has a name, the
>    maker, licence pills, a live ring visualiser and waveform, a karaoke caption and one visual gag:
>    - **Windows SAPI** (David): a retro Win9x window and "works offline".
>    - **Piper:** a Raspberry Pi board, then a second voice with a northern English accent.
>    - **Kitten TTS:** an "under 25 MB" counter and 17 floppy disks.
>    - **Kokoro:** an 82M counter and three voices (af_heart US, bm_george UK, ff_siwis French).
>    - **Supertonic:** EN, ES, DE and KO voices, a dot grid of 31 languages and a Korean line with its English
>      translation.
>    - **Pocket TTS** (Kyutai): a speed gauge faster than real time and a crossed-out GPU.
>    - **Chatterbox:** an exaggeration slider (calm 0.25, excited 1.3), then a **zero-shot clone of the narrator**
>      ("Sound familiar?").
>    - **Edge TTS:** a grid of locale pills and an Australian "G'day".
> 4. **GPU wall (≈16 s):** a laptop holding the 8 chips, then "+ GPU" and a 3×7 grid of more open models. Highlight
>    VibeVoice (podcasts), Dia (dialogue), Orpheus (laughs and sighs) and Parler-TTS (designs a voice from a text
>    description) as the narrator names them.
> 5. **Finale:** 8 circles in a row, each popping "FREE" in that engine's voice. Then "Open weights · open source ·
>    free to use" and "check each licence before commercial use".
> 6. **Outro:** "One script. Many voices." and "Made with GitHub Copilot + Claude Opus 5.5".
>
> **Voice rules:** spell out numbers and acronyms for the TTS ("T T S", "eighty-two million"). Give Kitten at least
> 3 words, because the nano model garbles shorter inputs. Check every clip with Whisper ASR, then normalise and
> trim it to 48 kHz. Save word timings to `voice_timing.json` so captions and highlights land on the spoken word.
> Start each voice 10–20 frames after its visual, and keep SFX light under speech. Run `av_check.py` and fix every
> FAIL. The fast relay and the "FREE" roll-call are deliberately tight.

---

## Files

| File | What it is |
|---|---|
| `make_voices.py` | Generates every line with its engine, checks it with ASR, then writes `voice.js` (embedded base64 audio) and `voice_timing.json`. The engine setup is in the docstring. Takes are cached in `build/` (git-ignored). |
| `src/p1.js` | Engine table (colours, makers, licences), helpers (`txt`, `pill`, `chip`, `say`, `fx`), backgrounds and the ring visualiser |
| `src/p2.js` | Relay cold-open and title scenes |
| `src/p3.js` | The 8 roll-call cards and their extras |
| `src/p4.js` | GPU wall, finale and outro, plus the timeline assembly (`SCENES`, `VO_CUES`, `SFX_CUES`, `SCENE_T`) |
| `assemble.py` | Builds `voice-showcase.html` from the `microsoft-model-hub.html` player shell in `skills/motion-graphics/template/` and `src/p1-p4.js` |
| `export_mp4.py` | Headless Edge plus ffmpeg, producing `voice-showcase.mp4` |

## Rebuild

```powershell
cd examples\voice-showcase
python make_voices.py          # needs the engines listed in its docstring; Chatterbox runs from its own venv (CHATTERBOX_PY)
python assemble.py
python ..\..\skills\av-sync\av_check.py voice-showcase.html
python export_mp4.py           # about 6 minutes on a Snapdragon X Elite
```

## Engines and licences

| Engine | Source | Licence | Runs on |
|---|---|---|---|
| Windows SAPI (Microsoft David) | Built into Windows | Windows component | CPU, offline |
| Piper | [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 (voices vary) | CPU, offline |
| Kitten TTS nano | [KittenML/KittenTTS](https://github.com/KittenML/KittenTTS) | Apache-2.0 | CPU, offline |
| Kokoro-82M | [hexgrad/kokoro](https://github.com/hexgrad/kokoro) via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) | Apache-2.0 | CPU, offline |
| Supertonic | [supertone-oss-archive/supertonic](https://github.com/supertone-oss-archive/supertonic) (archived) | MIT code, OpenRAIL-M weights | CPU, offline |
| Pocket TTS | [kyutai-labs/pocket-tts](https://github.com/kyutai-labs/pocket-tts) | MIT code, CC-BY-4.0 weights | CPU, offline |
| Chatterbox | [resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | CPU (slow) or GPU |
| Edge TTS | [rany2/edge-tts](https://github.com/rany2/edge-tts) | LGPL/GPL tool. It uses Microsoft's online neural voices, so it needs internet and is not offline. | Cloud |

The GPU wall names more open models that we did not run here: VibeVoice, Dia, Orpheus, Parler-TTS, F5-TTS, XTTS-v2, Qwen3-TTS, NeuTTS Air, CosyVoice 3, Fish Audio S2, Sesame CSM, Zonos, IndexTTS2, Spark-TTS, StyleTTS 2, OuteTTS, Kyutai TTS, VoxCPM 2, Voxtral TTS, Maya1 and Higgs Audio. Links and licences for every engine are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Check each licence before commercial use. Several have non-commercial weights or restrict voice cloning.
