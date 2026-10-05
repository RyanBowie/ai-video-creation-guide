---
name: av-sync
description: Check that a video's visuals line up with its audio - voiceover lines and key words, SFX hits, song beats/bars, lyrics, audio splices and loudness - using the combined timing rules from motion-graphics, character-rig, tts-voiceover and audio-edit. Runs a headless checker (av_check.py) on the HTML player or a rendered MP4 and reports FAIL/WARN/INFO findings with the exact frame fix, plus a timeline PNG. Use when the user asks to check sync, "does it line up with the audio/music/song/voiceover", beat alignment, voiceover timing, SFX timing, lip/lyric sync, "the sound is late/early", QA a video before export, or after any audio edit or retime.
---

# A/V Sync check

One command audits a finished (or in-progress) video against the house timing rules. Nothing is edited - the
report tells you which cue/scene to move and by how many frames.

```powershell
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" video.html            # SVG explainer or Canvas music video
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" video.html --step 2 --to 60 --no-png
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" out.mp4 --bpm 88 --b0 0.605
```

Needs `numpy pillow playwright imageio-ffmpeg` (`pip install --user`) and Edge. Serves the HTML's folder on a
local port (so `file://` limits don't apply), rasterises every Nth frame at 192x108, decodes audio with the
imageio ffmpeg binary. Exit code 1 on any FAIL. Runtime: ~4-6 min for a 50 s explainer at step 1; use
`--step 2` and `--from/--to` for long music videos.

| Flag | Meaning |
|---|---|
| `--step N` | analyse every Nth frame (music videos: 2) |
| `--from S --to S` | output-time window (scene-start beat checks still cover the whole timeline) |
| `--tol N` | SFX-to-visual tolerance in frames (default 3) |
| `--bpm B --b0 S` | beat grid for MP4 input (HTML reads `BEAT`/`B0`) |
| `--keywords a,b` | extra VO words that should get a visual reveal |
| `--png out.png` / `--no-png` | timeline chart (default `<input>_sync.png` - delete it before committing) |
| `--list` | print every SFX cue with its nearest visual hit and class (`match`, `soft/cut`, `busy`, `lag`, `no hit`) |

## Engines it understands

- **SVG explainer (motion-graphics):** `SCENES`, `VO_CUES`, `SFX_CUES`, `window.VOICE`, `exportAudio()`, optional
  `SYNC = [[frame, clipKey, wordOrIndex], ...]` anchors and `voice_timing.json` (`{key: {words: [[sec, word], ...]}}`).
- **Canvas music video (character-rig):** `SC`, `draw`, `BEAT`, `B0`, `LYR`, `HIDE`, `CUTS` or `CUT0`+`CUTD`, `<audio id="au">`.
  Lyrics hidden inline (`LYR.find(([a,b],i) => i !== 8 && ...)`) are detected too.
- **Canvas cue-timeline (retro-anime and explorer-quest kits):** `render(F)`/`draw`, `VO_CUES`, `SFX_CUES`, `exportAudio()`, no `SCENES`.
  Add `var SCENE_T = [[name, startSec], ...]` (and dispatch `draw()` from it) so VO/scene rules use real scene
  boundaries; without it the whole video is one scene `all` and you get an INFO asking for it. SFX names are
  matched by prefix, so numbered cues like `pin3` count as handled when `sfx()` has a `pin` branch. Anchored-regex dispatch (`/^pin(\d+)$/.exec(name)`,
  `name.match(/^pin\d+$/)`) is recognised too.
- **Any MP4:** generic audio-onset vs visual-onset offset and unmatched-onset report (advisory only).
- If the page never signals ready, you get one FAIL listing 404s / page errors instead of a hang.

## The combined rules it enforces

| Rule | Source skill | Level |
|---|---|---|
| VO clip ends ≥ 4 f before its scene ends; no overlap between clips | motion-graphics / tts-voiceover | FAIL |
| ≥ 8 f breath between VO lines; VO starts 6-12 f into its scene (let the transition land) | tts-voiceover | WARN |
| > 4 s of silence after a VO line - to the next line in the same scene, else to the scene end (reading hold is ~2.5-3 s) | motion-graphics | INFO |
| Every `SFX_CUES` name is handled by `sfx()`; cue frames in range | motion-graphics | FAIL |
| SFX land on the visual impact frame (±`--tol`); consistent per-SFX lag reported once | motion-graphics | WARN |
| `SYNC` anchors: visual on the spoken word (±4 f) | tts-voiceover | WARN |
| Key words (mid-sentence capitals, `--keywords`) get a visual reveal within 12 f | motion-graphics | INFO |
| Strong visual hit with no SFX / word / cut near it | motion-graphics | INFO |
| Soundtrack sample peak < 0.99 on every channel (no clipping); every VO clip audible in the mix | audio-edit | WARN / FAIL |
| Scene starts on a beat (≤ 2 f; exempt if a lyric starts within 0.25 s) or exactly on the audio splice | character-rig / audio-edit | WARN |
| Beat grid (`B0`, `BEAT`) matches the song's onsets and tempo | character-rig | WARN (INFO if phase ambiguous) |
| Lyric line shown across a removed section: ≥ 0.3 s FAIL, 0.1-0.3 s "flickers" WARN | audio-edit | FAIL / WARN |
| Bright flash into a dark frame (keep ≤ 0.35-0.5 opacity, warm) | motion-graphics | WARN |

## Reading the report and PNG

Findings are sorted FAIL → WARN → INFO with the output time and a concrete fix, e.g.
`SFX 'deny' at f812 is +5f from the nearest visual hit (f817) - move the cue to f817?` or
`scene 47 'sBows' starts +3.7f off beat 205 - use bt(205) = 140.378`.

PNG timeline (top to bottom): audio waveform, visual motion curve with strong hits, then cue lanes -
gold = SFX/beats, teal = VO/lyrics/strong hits, pink = scene starts/audio splices, triangles = WARN (gold) / FAIL (red).

## Fixing each finding

- **VO past scene end** → extend that scene's `dur` (keep `base + HOLD`) or move the cue earlier; never speed the voice.
- **Short breath / overlap** → shift the later `VO_CUES` frame, or rewrite the line shorter (tts-voiceover).
- **SFX off its hit** → move the `SFX_CUES` frame to the reported frame. A *consistent* +3-5 f lead on spring pop-ins
  is the spring peak lagging the sound - either shift all those cues or accept it (it reads as anticipation).
- **Scene off beat** → set its start to the suggested `bt(k)`; after a cut, put the transition exactly on the splice.
- **Lyric straddles a cut** → add the index to `HIDE` (or cut the audio on a line boundary with audio-edit).
- **Clipping** → lower master/SFX gain in `exportAudio()` / the mix, then re-export. The peak is read on the native
  channels (`audio_peak()`). Never judge clipping on a mono downmix: ffmpeg's `-ac 1` sums L+R at 0.707 each, so
  correlated stereo peaking at 0.7 reads ~0.99 and raises a false alarm.
- **Bright flash** → cap the flash opacity at 0.35-0.5 and warm the colour, or use a dark tear.

## Advisory cases (don't chase these)

- Beat phase "ambiguous" - vocals/pads blur the onset; trust `B0` if the dance looks on-beat.
- MP4 "audio onset with no visual hit" - mostly speech syllables; only act on SFX-shaped ones.
- Busy action segments (fights, confetti) produce many unmatched hits - they're exempt by design.
- Scene-start offsets in a finished video the user hasn't asked to change - report them, don't edit.
- SFX WARN where the "visual hit" is a camera cut/insert and the thing the sound belongs to (inbox explodes, glitch
  bar rolls) lands 3-6 f later - keep the SFX on the content change, not the cut. Same for a cue whose nearest hit
  already carries another SFX (e.g. an alarm onset).
- Two soundtrack exports with different file hashes. Seed `Math.random` inside `exportAudio()` (mulberry32, restored
  in `finally`; the live preview can stay random) so noise SFX repeat, but Chromium's `OfflineAudioContext` still
  differs by ±1 LSB per run - compare peaks/levels, not MD5s.
- A stamp or card SFX a few frames after a hard cut (e.g. a "6 MONTHS BEHIND" stamp landing 4-6 f after the cut)
  WARNs because the cut is the nearest hit. Keep the SFX on the stamp's landing frame, not the cut.
- Dense UI beats (menu selects, card flips, checklist ticks) in a finished cue-timeline episode usually leave a handful
  of by-design WARNs. Check each against a still, list them in the project notes, and move on.
- Two visual hits within 5 f merge into one plateau, and av_check keeps the plateau's first frame (`<= 5` in
  `visual_onsets`), so a cue on the later hit reports ±4-6 f off. Check a still at the cue frame; if the sound lands on
  its event, leave it.
- A deliberate short flash (about 0.1 s at ≤ 0.4 alpha, e.g. a boss zap) still trips the bright-flash WARN
  (`flash_check`: luma jumps > 45 from a frame below 110, then drops back > 35 within 12 f). Keep it if it is that dim
  and brief, and note it in the project notes.
- Perception is asymmetric: sound *leading* its picture by ≥ 45 ms (~1.5 f at 30 fps) is noticeable, while a lag of up
  to ~125 ms (~4 f) still reads as in sync. So put impact SFX on the hit or 1-3 f after it, never before. The exception
  is a whoosh, which should lead its move by 3-6 f.
- Title slams that ease in with `back()` start ~0.15 s before their word, so a -2 f WARN on them is deliberate. "No hit"
  INFOs for small motions (a map pin dropping, a gliding plane), an intentional pre-hit click and ~66 ms (2 f) of audio
  lag are fine too (explorer-quest review cut).

## Workflow

1. Run on the HTML before export (fast iteration; exact cue data).
2. Fix FAILs, then WARNs that are real; re-run until PASS.
3. Export the MP4 (motion-graphics / character-rig), optionally run once more on the MP4 as a smoke test.
4. Delete `*_sync.png` before committing.
