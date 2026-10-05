---
name: audio-edit
description: Edit a song or voiceover track for a video without audible seams. Covers removing a lyric, bar or section with a click-free equal-power crossfade, shortening or trimming a song, finding the bar grid, fade-outs, loudness, ducking, re-encoding, and keeping the synced animation aligned afterwards (CUTS/SRC time remap, hidden lyrics). Use when the user asks to remove or cut lyrics, shorten the song, trim audio, cut a part out, make the song still flow, fix a click or pop, fade the audio, or adjust music under a motion-graphics or music video. Pairs with character-rig (music-video engine), motion-graphics and tts-voiceover.
---

# Audio edit (musical cuts that still flow)

Proven on the Copilot P(doom) video. It removed one bar (26.514-29.241 s) with no audible seam, and the video stayed in sync.

## Tools
- ffmpeg: `python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`.
- numpy.
- `template/cut_bar.py`: decode, crossfade cut, click check, re-encode, and print the `CUTS` entry.

## Workflow
1. **Back up once.** Copy `song.mp3` to `song_orig.mp3`, then always cut from `_orig` so repeated edits never stack.
2. **Find the grid.** A bar lasts `4*60/BPM`, counted from the first downbeat `B0` (same values as `BEAT`/`B0` in fx.js). The lyric times in `LYR` show which bar(s) hold the line.
3. **Cut on whole bars.**
   - Remove N complete bars, starting on a downbeat, so the groove carries on seamlessly.
   - For a two-line couplet, cut the bar or bars that contain it rather than individual words.
   - Probe first: `python cut_bar.py song_orig.mp3 x --start A --end B --probe` prints an RMS envelope.
   - Nudge the edges to steady regions just before vocal onsets, never in the middle of a word.
4. **Cut.**
   ```
   python cut_bar.py song_orig.mp3 song.mp3 --start A --end B --xf 20
   ```
   or, by bars:
   ```
   python cut_bar.py song_orig.mp3 song.mp3 --bpm 88 --b0 .605 --bar 7 --bars 1
   ```
   - The crossfade is equal-power (cos/sin) over 15-25 ms. Shorter crossfades click; longer ones smear transients.
5. **Click check.** The script compares the maximum sample step at the splice with the song's 99.9th-percentile step. For example, 0.137 against 0.134 was inaudible. If it flags a click, nudge the edges a few ms or raise `--xf` to 30.
6. **Listen.** Render a clip with `ffmpeg -ss (A-3) -t 6 -i song.mp3 clip.mp3` and play it. Check that no words are clipped and that the downbeat stays on time.

## Keeping the video in sync (character-rig engine)
- **Don't retime scenes.** Add the printed `[start, len]` to `CUTS` in `video.html`. `SRC(t)` maps output time back to original song time, so every scene, `WT` word time and beat still lines up.
- **Hide cut lyrics.** Add their indices to the `HIDE` set in fx.js. Don't delete them from `LYR`, because that would shift the `WT(i, k)` indices.
- **Scenes.** Drop the scenes that illustrated the cut lyric. Start the next scene at the splice (original time `start + len`) with a tear or splat, so the visual cut lands on the audio cut.
- **Duration.** `DUR = SONG - sum(len)`. `export.py` fades the audio at `DUR - 1.2`.
- **Verify.** Run `python stills.py` just before and after the splice (output time), then ffprobe the final MP4 duration.

## Other recipes
- **Fade out:** `-af "afade=t=out:st=<dur-1.2>:d=1.2"`.
- **Trim:** `-t <sec>`, plus a fade.
- **Loudness:** `-af loudnorm=I=-14:TP=-1.5:LRA=11` gives streaming level.
- **Duck music under a voiceover:** `[music][vo]sidechaincompress=threshold=.05:ratio=8:attack=20:release=300`, or simply `volume=0.25` on the music and `amix`.
- **Re-encode:** libmp3lame 192k for working files; AAC 192k in the MP4 mux.
- **Synth SFX and score in the engine** (retro-anime kit, `audio.js`): write SFX in the score's key so stamps, pops
  and fanfares sit inside the chord, and fire them on the visual hit (stamp +4 f, pop +3 f, whoosh 3-6 f early).
- **In-engine VO ducking:** route the music through a bus (gain .55) into a duck gain. Build windows from `VO_CUES`
  (clip start −.08 s to end +.1 s) and merge windows less than .5 s apart so the music doesn't pump between lines.
  Ramp down to ×.42 over .15 s before each window and back to 1 over .3 s after it.
- **Deterministic export:** seed `Math.random` inside `exportAudio()` (mulberry32, restored in `finally`), so noise SFX
  and the soundtrack peak are identical on every render.

## Sync check

Before export (and after any retime or audio edit) run the **av-sync** skill: `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <video>.html`. It checks VO fit, SFX-on-impact, beats, lyric splices and clipping against these rules and prints frame-exact fixes.
