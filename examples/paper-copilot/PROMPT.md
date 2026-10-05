# Build prompt: "Paper Copilot, Chapter 1: The Inbox Quest" (30 s paper-cutout short)

This prompt produced `paper-copilot.html` and `paper-copilot.mp4`. It combines the original brief with the
decisions made during the build. Paste it into a Copilot session that has the `motion-graphics`, `character-rig`,
`tts-voiceover` and `av-sync` skills (or the `paper-cutout` skill, which packages this engine) to reproduce or remix the short.

---

## The prompt

> Take inspiration from [francozanardi/papermotion](https://github.com/francozanardi/papermotion) (paper-cutout
> animated shorts made in code) and the Paper Mario games. Build a **20–30 second Microsoft 365 Copilot short**
> that looks like a paper theatre and plays out as a turn-based RPG battle. Use plain Canvas2D with no npm.
> Export with Python, Playwright and Edge. 1920×1080 at 30 fps.
>
> **The paper look.** Recreate it in code, all deterministic per frame and with no `Math.random`:
> - Every cutout gets a cream paper border, a soft offset drop shadow and a fibre and grain texture.
> - Cutouts sway slightly and "boil" at 6 fps, as if hand-moved.
> - Edges are torn paper.
> - Characters are flat and thin. They flip like a card to turn around.
> - The stage is framed by red curtains, a footlight lip and an audience silhouette row. A Copilot medallion sits
>   on the pelmet.
> - Sets are paper backdrops: hills, clouds, an office wall with a window, and a night city skyline.
> - Text is cut-out sticker lettering with a white rim. Always write "Microsoft 365 Copilot" in full.
>
> **Cast.**
> - **Pip:** an office worker with a cowlick, a blue shirt, a lanyard badge and a Lv.1 nameplate. Moods: happy,
>   shocked, determined, cheer.
> - **Copilot:** the Microsoft 365 Copilot logo as a paper partner with eyes and a bounce.
> - **Inbox goblin:** an envelope with fangs and a "999+" badge. It is tamed (fangs gone, sleepy) when beaten.
> - **Calendar minions:** small angry calendar blocks.
>
> **Beats (900 frames):**
> 1. **Title (0–110):** the curtain rises on "CHAPTER 1", the Copilot logo, "Microsoft 365 Copilot" and "The Inbox
>    Quest". VO: "Chapter one... The Inbox Quest!"
> 2. **Office (98–268):** Pip waves and clicks his monitor. The inbox opens and swells to 999+, then the envelope
>    bursts out as a goblin. VO: "Monday morning. Pip opens the inbox... and nine hundred ninety-nine emails
>    attack!"
> 3. **Page turn (268–296):** a page curls over to the battle stage. This is an object-motivated transition, not a
>    crossfade.
> 4. **Battle (296–576):**
>    - An HP bar shows the goblin's hit landing (−2, HP 5→3).
>    - The command menu cycles to COPILOT, and a "Press the Copilot key!" prompt appears.
>    - Copilot flies in. Its attacks summarise the inbox (paper planes) and sort the meetings.
>    - An "EXCELLENT!" stamp lands and the goblin is tamed.
>    - VO: "Running out of time? Call in a partner... Copilot!" / "Summarise the inbox. Sort the meetings.
>      Excellent!"
> 5. **Victory (576–690):** a VICTORY banner, confetti and a quest report: Inbox 999+ → 0, meetings sorted, +3
>    hours back. Then a LEVEL UP stamp. VO: "Inbox zero. Three hours back. Level up!"
> 6. **Curtain call (690–900):** the curtains close and a hanging sign shows the Copilot logo and "Microsoft 365
>    Copilot". Pip and Copilot bow, followed by the tagline and a credit line. VO: "Microsoft three-sixty-five
>    Copilot. Your partner for every quest."
>
> **Sound.**
> - Narrator: edge-tts `en-US-AndrewMultilingualNeural` at +4%. Trim each clip's trailing silence.
> - Synthesised paper SFX on the impact frame: rustles, paper flips, folds, pops, menu selects, whooshes, hits,
>   a stamp, a sparkle and a level-up jingle.
> - A bouncy synthesised 120 bpm score, ducked under the VO: a music-box title, a whistled office tune, a tension
>   tremolo as the goblin appears, a driving battle groove, a hero theme once Copilot joins, a victory fanfare and a
>   curtain-call reprise.

## Files

| File | What it does |
|---|---|
| `paper-copilot.html` | Player: loads the scripts, scrub bar, play and export hooks |
| `paper.js` | Paper engine: cutout borders, shadows, grain, torn edges, sticker text, deterministic noise |
| `chars.js` | Pip, Copilot, inbox goblin and calendar minion rigs with moods |
| `sets.js` | Stage, curtains, audience, backdrops (hills, office, night city) |
| `scenes.js` | Title, office and page-turn scenes |
| `battle.js` | Battle HUD, command menu, attacks, EXCELLENT stamp, victory and quest report |
| `finale.js` | Curtain call, `SYNC`, `PUNCH`, `SHAKES`, `SCENE_T` and the master `render()` |
| `audio.js` | `VO_CUES`, `SFX_CUES`, synthesised SFX and score, `exportAudio()` |
| `make_voice.py` | Generates `voice.js` and `voice_timing.js/.json`. Clips are trimmed to their last audible sample |
| `export.py` | `--stills N…` for QA frames; with no arguments renders `paper-copilot.mp4` |

## Run, check and export

```powershell
cd paper-copilot
python make_voice.py            # regenerate all VO (or: python make_voice.py outro)
python make_voice.py --trim     # re-trim trailing silence on the existing clips
python export.py --stills 140 450 537 640 860
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" paper-copilot.html
python export.py                # paper-copilot.mp4 (x264 preset slow, crf 22, AAC)
```

`av_check` passes with 0 FAIL. The remaining WARNs are intentional: the stamp SFX sits on the landing frame
rather than the fly-in, and the click SFX sits on the row pop-in rather than Pip's jump.

## Lessons from the build

- edge-tts clips carry about 0.35 s of trailing silence, which made `av_check` report VO overrunning scenes.
  Trimming in `make_voice.py` fixed all three FAILs.
- The paper grain is high-frequency detail, so x264 at crf 18 produced a 150 MB file. Crf 22 with preset slow
  keeps it at about 30 MB with no visible loss. Don't use `-tune grain`, because it inflates the size further.
- Keep HUD plates, menus and banners in separate screen zones, and re-check stills after each layout change.
