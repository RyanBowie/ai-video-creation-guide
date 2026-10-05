---
name: tts-voiceover
description: Generate natural-sounding narration and character voices offline with edge-tts (no API key, no npm), including voice selection, line writing for pacing, character voice treatments (wizard, dark lord, robot, radio), and packaging clips as MP3 files or a base64 voice.js bundle for the browser. Use when the user asks for a voiceover, narration, spoken audio, an AI voice, a talking character, or wants to add speech to a video, demo recording, deck or web page.
---

# TTS Voiceover

Produces broadcast-usable narration on a Windows box with no cloud account and no npm.
`edge-tts` drives the same neural voices Edge uses for Read Aloud; everything else is
post-processing you do yourself.

If the voiceover is for a code-driven motion graphic, use the `motion-graphics` skill —
it embeds this workflow and adds cue timing. This skill is for voiceover on its own.

## Setup

```powershell
pip install --user edge-tts
python -m edge_tts --list-voices          # ~500 voices
```

No key, no quota. It does hit the network, so clips are not reproducible byte-for-byte.

## Workflow

1. Write the lines into the `LINES` dict in `template/tts.py` (one entry per clip).
2. Pick a voice + rate + pitch per line.
3. `python tts.py` — writes `out/<key>.mp3`, and `voice.js` if `--bundle` is passed.
4. Listen. Fix pronunciation by rewriting the *text*, not by hand-editing audio.
5. Apply character FX in the browser (see below) or in ffmpeg for a flat file.

## Choosing a voice

Shortlist that has held up well:

| Role | Voice | Rate | Pitch |
|---|---|---|---|
| Narrator (warm, neutral, docs/demo) | `en-US-AndrewMultilingualNeural` | `-4%` | `+0Hz` |
| Narrator (brighter, female) | `en-US-AvaMultilingualNeural` | `-4%` | `+0Hz` |
| British authority / wizard | `en-GB-ThomasNeural` | `-22%` | `-14Hz` |
| Dark lord / villain | `en-US-ChristopherNeural` | `-12%` | `-24Hz` |
| Upbeat product / ad read | `en-US-EmmaMultilingualNeural` | `+2%` | `+0Hz` |

Rules of thumb:
- `Multilingual` voices sound the most natural and handle odd names better.
- Almost always slow the narrator slightly (`-4%` to `-8%`). Default rate reads rushed.
- Pitch below `-24Hz` starts sounding processed rather than deep — get depth from FX instead.
- Keep one narrator voice for a whole piece. Switching voices reads as a character change.

## Writing lines for pacing

The single biggest quality lever. The model reads punctuation, not your intent.

- `...` gives a noticeably longer pause than `,`. Use it for beats you want to land.
- Never leave a single word stranded at the end of a sentence — it gets a weird rising
  "imagin-*e*" reading. Keep it mid-sentence, or extend the clause.
- Spell acronyms the way they're said: `A.I.` not `AI`, `S.Q.L.` not `SQL`, `dot net` not `.NET`.
- Numbers: write `twenty twenty six`, not `2026`, when you care about the reading.
- Expand product abbreviations: `M365` is read as "M… 365", so write `Microsoft 365`. Say brand names
  in full (`GitHub Copilot`, `ChatGPT Desktop`) and listen for them.
- Short sentences. One idea per sentence beats one long comma-spliced sentence.
- Read it aloud yourself first. If you stumble, so will the model.
- Keep interjections short and plain. edge-tts stretches "Ooh!" into a moan, while "Oh!" reads as surprise. Listen to
  every "Ah", "Oh" and "Wow" on its own before you sync to it.
- One possessive per line, and don't repeat a name in back-to-back lines. "Then checks Hannah's availability, and
  books a catch-up." followed by "And preps her for Hannah's session." ran together; the user heard "Preps her for
  Hannah's for catch-up". The fix was "Then checks when Hannah is free, and books a catch-up." / "Gets her ready for
  tomorrow's session."
- Prefer plain verbs to clipped jargon: "gets her ready for", not "preps her for".

## Reliability

The service occasionally truncates a clip mid-word and returns it happily.
`template/tts.py` generates each line **three times and keeps the longest** — cheap,
and it removes the failure mode entirely. Always check reported clip lengths:
MP3 bytes ÷ 6000 ≈ seconds at the default bitrate.

## Character voice treatments (Web Audio)

edge-tts gives you the performance; the character comes from the chain.
`template/voice_fx.js` implements these — pass the decoded buffer through `chain(kind)`.

- **narrator** — dry, plus ~6% send to a short hall reverb so it isn't clinically flat.
- **wizard** — lowshelf +5 dB @ 220 Hz, ~42% reverb send. Big room, no distortion.
- **dark lord** — highpass 70 Hz → peaking +4 dB @ 180 Hz (helmet resonance) →
  `tanh` waveshaper (grit) → presence peak +5 dB @ 2.8 kHz → 7 ms delay at 20% feedback
  (short metallic slap) → 12% reverb. The presence peak is what keeps it *intelligible*;
  without it, drive + low end turns to mud.
- **robot** — ring-modulate with a 60–90 Hz sine, then bandpass 300 Hz–3 kHz.
- **radio / phone** — bandpass 400 Hz–3.2 kHz, light waveshaper, no reverb.

The reverb is a generated impulse (2.2 s of noise with a cubic decay) — no IR file needed.
Bus everything through a `DynamicsCompressor` at threshold −14, ratio 3, then a 0.9 gain.

For a flat audio file instead, the same shapes in ffmpeg:

```
ffmpeg -i in.mp3 -af "highpass=f=70,equalizer=f=180:g=4:w=0.9,equalizer=f=2800:g=5,aecho=0.8:0.2:7:0.2" vader.mp3
```

## Packaging

- **Standalone files** — `out/<key>.mp3`, ready for a video editor or `<audio src>`.
- **Browser bundle** — `--bundle` writes `voice.js` as `window.VOICE = {key: "<base64 mp3>"}`.
  Single file, works from `file://`, no fetch and no CORS. Decode with
  `ctx.decodeAudioData(b64buf(VOICE[key]))`. Fine up to a few MB; past that, ship MP3s.
- **One continuous track** — concatenate the MP3s with silence padding via ffmpeg
  `concat` + `adelay`, rather than asking for one giant line (long lines drift in pacing).

## Timing against picture

- Measure every clip. A line only fits if `clip_duration <= (scene_end - cue) / fps`.
- Cue the voice a beat *after* the visual lands (10–20 frames), never on the same frame.
- If a line overruns, extend the shot — do not speed the voice up. Rate changes are audible.
- Leave ~0.5 s of tail before a hard cut, or the last word gets clipped.
- **Word-level sync:** pass `boundary="WordBoundary"` to `edge_tts.Communicate` and collect
  `(chunk["offset"] / 1e7, chunk["text"])` for each `WordBoundary` chunk (offsets are in 100 ns units).
  motion-graphics' `make_voice.py` saves these to `voice_timing.json` and prints `word@frame`.
  Pop the card or SFX in 3–6 frames **before** the spoken word: `cue + word_frame − 4`.
- **Cast episodes** (several speakers, e.g. the retro-anime kit's `make_voice.py`):
  - Write the whole script up front, one clip per beat. A word that a stamp or card must hit gets its own clip
    ("Six months behind..." / "...and in full catch-up mode."), so retiming one beat never drags the others.
  - Give every character a distinct voice, and let characters voice their own lines; the narrator only does exposition.
    Reference cast: narrator `en-US-AndrewMultilingualNeural` +5%, heroine `en-US-AvaMultilingualNeural` +5%,
    colleagues `en-GB-RyanNeural` +10%, `en-US-EmmaMultilingualNeural` +10%/+2Hz and `en-US-BrianMultilingualNeural` +10%.
    Trailer-style narrator (explorer-quest): `en-US-AndrewMultilingualNeural` −4%/−2Hz, a touch deeper and slower for a
    movie-trailer read; heroine `en-US-AvaMultilingualNeural` +0% (calmer than the +5% cast pace).
  - Keep the longest of 3 takes per clip: the online service occasionally truncates one.
  - `python make_voice.py key1 key2` regenerates only those clips and merges them into the bundle; a full run with no
    keys prunes clips the timeline no longer uses.
  - After rewording a line, re-voice only the changed keys (e.g. `python make_voice.py session avail prep`), then
    re-time each pop and SFX on that line from the new `word@frame` output. The new take's words land at different
    frames even when the wording barely changed.

## Gotchas

- Clips are non-deterministic; re-running changes timing slightly. Re-check fits after any regen.
- `edge_tts.Communicate(...).stream()` yields `WordBoundary` events too — filter on
  `chunk["type"] == "audio"` or the MP3 is corrupt.
- Pitch/rate must be strings with a sign: `"-4%"`, `"+0Hz"`. Bare numbers throw.
- No SSML. Control comes from punctuation, rate and pitch only.
- Output is 24 kHz mono MP3. Upsample to 48 kHz on export so it matches the video track.

## Related
- To cut, trim, fade, duck or de-click music or voice tracks (and keep a synced video aligned), use the **audio-edit** skill (`~/.copilot/skills/audio-edit`).

## Sync check

Before export (and after any retime or audio edit) run the **av-sync** skill: `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <video>.html`. It checks VO fit, SFX-on-impact, beats, lyric splices and clipping against these rules and prints frame-exact fixes.
