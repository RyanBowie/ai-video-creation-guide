# Third-party notices

This video shows how varied free text-to-speech (TTS) engines can sound. It does that by playing clips each engine generated. The code here (`make_voices.py`, `assemble.py`, `export_mp4.py`, `src/*.js`) is original and MIT-licensed like the rest of this repo. **The audio is not.** Each clip in `voice.js` and in `docs/media/voice-showcase.mp4` was made by a third-party model and stays under that model's and voice's terms, listed below. We share the video as a **non-commercial community demo**. Check each licence yourself before you reuse any voice, especially commercially.

## Engines heard in the video

| Engine | Code | Weights / voices | Voices used |
|---|---|---|---|
| Windows SAPI | Built into Windows | Windows component, under the Windows licence terms | Microsoft David Desktop |
| Piper | [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl), GPL-3.0 | [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices). Each voice has its own dataset licence: `en_US-ryan-high` (RyanSpeech, **CC BY-NC-SA 4.0, non-commercial**), `en_GB-northern_english_male-medium` (OpenSLR 83, CC BY-SA 4.0), `en_US-lessac-high` (Blizzard 2013 Lessac data, research licence) | ryan, northern_english_male, lessac |
| Kitten TTS nano | [KittenML/KittenTTS](https://github.com/KittenML/KittenTTS), Apache-2.0 | [KittenML on Hugging Face](https://huggingface.co/KittenML), Apache-2.0 | expr-voice-3-m, 4-f, 5-m |
| Kokoro-82M | [hexgrad/kokoro](https://github.com/hexgrad/kokoro), Apache-2.0, run through [thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT) | [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0 | af_heart, bm_george, ff_siwis |
| Supertonic | [supertone-oss-archive/supertonic](https://github.com/supertone-oss-archive/supertonic), MIT (archived) | [Supertone/supertonic](https://huggingface.co/Supertone/supertonic), OpenRAIL-M | M1, M3, F1, F2, F3 |
| Pocket TTS (Kyutai) | [kyutai-labs/pocket-tts](https://github.com/kyutai-labs/pocket-tts), MIT | [kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts), CC BY 4.0. Voice prompts come from [kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices): `alba` (Alba MacKenna, CC BY 4.0) and `javert` (a voice donation, CC0) | alba, javert |
| Chatterbox (Resemble AI) | [resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox), MIT | [ResembleAI/chatterbox](https://huggingface.co/ResembleAI/chatterbox), MIT | default voice, plus one zero-shot clone (see below) |
| edge-tts | [rany2/edge-tts](https://github.com/rany2/edge-tts), LGPL-3.0 | Microsoft's online neural voices, used under Microsoft's service terms. They are not open weights and need internet. | en-US-AndrewMultilingualNeural (narrator), en-US-AvaMultilingualNeural, en-AU-NatashaNeural |

**Voice clone:** the "Sound familiar?" Chatterbox line (`cb3`) is a zero-shot clone of this video's own narrator clip, an edge-tts synthetic voice. It does not clone any real person. Chatterbox output carries Resemble AI's imperceptible [Perth](https://github.com/resemble-ai/Perth) watermark, so that clip, and the video, contain it. Only clone voices you have permission to use.

**QA:** every clip was transcribed by speech recognition before assembly to catch garbled takes, such as Kitten nano with two-word inputs. The QA used no extra audio, and none of its output is in the video.

## Models named on the "GPU wall" (not run, not heard)

The video shows these names only as text. We did not run them and the video contains none of their audio. Their licences vary, and several restrict commercial use or voice cloning.

| Model | Link |
|---|---|
| VibeVoice (Microsoft) | [microsoft/VibeVoice](https://github.com/microsoft/VibeVoice) |
| Dia (Nari Labs) | [nari-labs/dia](https://github.com/nari-labs/dia) |
| Orpheus TTS (Canopy Labs) | [canopyai/Orpheus-TTS](https://github.com/canopyai/Orpheus-TTS) |
| Parler-TTS (Hugging Face) | [huggingface/parler-tts](https://github.com/huggingface/parler-tts) |
| F5-TTS | [SWivid/F5-TTS](https://github.com/SWivid/F5-TTS) |
| XTTS-v2 (Coqui) | [idiap/coqui-ai-TTS](https://github.com/idiap/coqui-ai-TTS), weights [coqui/XTTS-v2](https://huggingface.co/coqui/XTTS-v2) (Coqui Public Model Licence, non-commercial) |
| Qwen3-TTS | [QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) |
| NeuTTS Air (Neuphonic) | [neuphonic/neutts](https://github.com/neuphonic/neutts) |
| CosyVoice 3 | [QwenAudio/CosyVoice](https://github.com/QwenAudio/CosyVoice) |
| Fish Audio S2 | [fishaudio/fish-speech](https://github.com/fishaudio/fish-speech) |
| Sesame CSM | [SesameAILabs/csm](https://github.com/SesameAILabs/csm) |
| Zonos (Zyphra) | [Zyphra/Zonos](https://github.com/Zyphra/Zonos) |
| IndexTTS2 | [index-tts/index-tts](https://github.com/index-tts/index-tts) |
| Spark-TTS | [SparkAudio/Spark-TTS](https://github.com/SparkAudio/Spark-TTS) |
| StyleTTS 2 | [yl4579/StyleTTS2](https://github.com/yl4579/StyleTTS2) |
| OuteTTS | [edwko/OuteTTS](https://github.com/edwko/OuteTTS) |
| Kyutai TTS | [kyutai-labs/delayed-streams-modeling](https://github.com/kyutai-labs/delayed-streams-modeling) |
| VoxCPM 2 | [OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM) |
| Voxtral TTS (Mistral) | [mistralai/Voxtral-4B-TTS-2603](https://huggingface.co/mistralai/Voxtral-4B-TTS-2603) (CC BY-NC 4.0) |
| Maya1 | [maya-research/maya1](https://huggingface.co/maya-research/maya1) |
| Higgs Audio | [boson-ai/higgs-audio](https://github.com/boson-ai/higgs-audio) |

## Everything else

The visuals are code-drawn SVG. Engine names appear as plain text and coloured chips, not as logos. The Windows SAPI card draws a single-colour four-square shape to stand for Windows, and the end card uses the stylised Copilot mark from this repo's motion-graphics template. Neither is an official brand asset. The SFX are synthesised in the page and the text uses system fonts. No third-party images, fonts, music or samples are used.

All product and model names belong to their owners. This is a community project built with GitHub Copilot. It is not affiliated with, or endorsed by, Microsoft or any of the model makers above.
