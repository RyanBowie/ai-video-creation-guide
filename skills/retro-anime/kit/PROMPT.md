# Copilot Quest, Episode 1: Enter Copilot (retro arcade / 90s anime) (prompt)

This retells the watercolour `sofia-return` story in a pre-2000s look: PC-98 / visual-novel tachie, cel shading, pixel HUD windows, a chiptune score and a CRT screen. The scenario is the same (a short return-to-work story brief): it's Sofia's first day back after a 6-month sabbatical, she's 6 months behind and in catch-up mode, and Microsoft 365 Copilot helps her catch up. The final cut is **89.5 s** (`sofia-retro.mp4`, 1080p30) and ends on "Created by GitHub Copilot".

> Do a complete redesign in a different animation and design style. The reference images show an old arcade / anime look and feel. Retell the story in this style with good character design and animation and that pre-2000s feel. You have creative freedom.
>
> (4 reference images: an anime eye close-up, an orange-haired girl in a headset, a CHAT.EXE visual-novel text box, a night-time room lit by a CRT.)
>
> Follow-up: you can start with ~20 seconds first for me to review before continuing.
>
> Follow-up (with a reference image of a 90s anime girl with orange hair, a side ponytail, a headset and one arm raised holding a UI element): a generic 90s anime look is fine, and a made-up character is okay. Make Sofia more like that design; at the moment she looks really basic.
>
> Follow-up: the headset, the head turning and the way the arms are don't look right for how she's using the device.
>
> Follow-up (on the 24.4 s review cut): some of the gold text on the screens is a bit hard to read. The RING RING scene is too short, and so is the 6-months-behind scene. Otherwise this is a good start. The beach outfit looks a bit strange, and there's odd clipping here and there in the character design.
>
> Follow-up (on the full 87.5 s episode): the VACATION.EXE has-stopped-working scene is too fast. "Preps her for Hannah's for catch-up" reads oddly, and the "Ooh" doesn't sound right.

How the feedback was addressed:

- **Richer Sofia:** a cel-shaded tachie rig (`heroine.js`) with orange hair, an ahoge, a side ponytail with a gold star clip, big glossy teal anime eyes, and a headset with a boom mic and a cyan LED. The office outfit is a cropped cream jacket with teal trim over a sparkly dark top, a gold-buckle belt and a pleated teal skirt. She has 9 expressions (neutral, smile, happy, surprised, shocked, worried, panting, determined, dreamy).
- **Headset, head turn and arms:** the headset was redrawn to sit on the head. The typing shot was recomposed so the camera is her monitor: she faces us with her hands on the keys (`povDesk`, the `'key'` hand and an `armsOnly` pass), and a ~3.4× insert snaps into her CRT for the screen content.
- **Gold text:** every gold or white HUD string now has a dark ink ring (`R.inkRing`, on by default in `R.neonText`). Captions and counters also sit on a bevelled dark plate (`R.panel`, wrapped by `R.hudText` in `retro.js`), which can mask the glow layer under the plate so bloom can't wash over the text.
- **RING RING beat:** the alarm-to-cut run grew from 0.13 s to about 2.8 s in the review cut, and to 4.8 s (10.3–15.1 s) in the final cut, inside a 7.3 s sunset beach scene (7.8–15.1 s). An alarm rings ("RING!", then a bigger "RING! RING!") over a soft red pulse at 2.5 Hz (kept under 3 Hz for photosensitivity) and a screen shake. Sofia jolts; her cocktail spins two full turns and lands upright on a crab, which scuttles off with it. A Win95-style "VACATION.EXE HAS STOPPED RESPONDING. / RETURNING TO WORK..." box appears, a cursor clicks OK, and a VHS tracking glitch cuts to the return.
- **6-months-behind beat:** grew from a 0.9 s stamp to about 5.5 s (21.0–26.4 s in the final cut). The "6 MONTHS BEHIND" stamp lands at about 21.5 s, then a damage tally pops in line by line (✉ 4,812 UNREAD / MEETINGS: 214 / CLASHES: 37). A SOFIA portrait window and a STATUS window follow (LV 1, HP 30%, STATUS: JET-LAGGED, and MODE: CATCH-UP blinking in inverse video), and a whoosh leads into the "Where do I even start?" bust shot.
- **Beach outfit:** a coral racer one-piece with white side piping and teal neckline trim, a teal sarong with white dots, and shades pushed up. She sits on a yellow-striped beach chair.
- **Clipping:**
  - The racer swimsuit is drawn inside the torso clip, so it can't spill past the body outline.
  - The back hair's inner edge runs down behind the neck (to y≈6), so no background shows through a neck gap.
  - A folded forearm drops the rim and inner edge that cut through the overlap, and is re-inked so it reads in front.
  - The beach-chair stripes changed from teal to sunny yellow, because teal behind the neck read as a sailor collar.
  - `rigsheet.py` renders 16 pose and outfit specs (Sofia, plus Raj, Maya and Leo) with `HER.portrait` on a flat backdrop into `stills\rig_sheet.jpg`, so problems can't hide behind scene props.
- **Full episode:** after the review, the cut was extended into the full story: the colleagues, Hannah's session, and Copilot's quest (act 2).
- **VACATION.EXE crash (too fast):** 2.0 s was inserted at 13.1 s (`INS_D` in `timeline.js`), so the box now stays up for about 2.5 s (11.8–14.4 s) and is never still:
  - A Win95 busy hourglass drains in three steps and flips every 0.75 s. The progress bar crawls, then sticks, and the "RETURNING TO WORK..." dots freeze mid-cycle.
  - On a "hang" ding (13.1 s) the title bar greys to VACATION.EXE (NOT RESPONDING).
  - The mouse wiggles impatiently, the arrow drifts onto OK and clicks it (the button depresses, 14.2 s), and the box squashes shut before the tracking glitch (14.6–15.1 s).
  - Sofia blinks and sweats through the hang. Under it, a stuck two-note "loading" loop over a low drone (the hang bed) sags flat once the program freezes.
- **Wording and the "Ooh":** "Ooh!" became "Oh!" (edge-tts stretched "Ooh" into a moan). The availability line became "Then checks when Hannah is free, and books a catch-up." The prep line became "Gets her ready for tomorrow's session." Each line now names Hannah once, and "preps" is gone. The three clips were re-voiced, and the FREE slot, the CATCH-UP block and the prep checklist were re-synced to the new word timings.

## Episode (89.5 s)

| Start (s) | Beat | On screen |
|---|---|---|
| 0 | Title | COPILOT QUEST / EPISODE 1: ENTER COPILOT / PRESS START |
| 3.2 | Travel | ★ 6 MONTHS AWAY ★; the WORLD_TOUR.EXE map (London plus 12 country pins, COUNTRIES 12/12); WISH YOU WERE HERE and GREETINGS FROM NZ postcards; INBOX.EXE (✉ EMAILS: 0 / OUT OF OFFICE: ON ✓); Sofia on the beach chair at sunset ("Ahh... this is the life."); the RING! RING! alarm; the cocktail lands on a crab; VACATION.EXE HAS STOPPED RESPONDING / RETURNING TO WORK... (the box hangs: busy hourglass, stuck progress bar, NOT RESPONDING at 13.1 s, OK clicked at 14.2 s); tracking glitch |
| 15.1 | Return | DAY 1 / STAGE 1 / THE RETURN; Sofia at her desk (screen POV) as the MAIL V2.0 flood explodes in a CRT insert; the "6 MONTHS BEHIND" stamp (~21.5 s); the damage tally and SOFIA / STATUS windows; the bust shot ("Where do I even start?") |
| 31.5 | Party | Raj (SALES, LV 42, DECK READY ✓), Maya (PROJECTS, LV 38, SUMMARY.DOC ✓) and Leo (SUPPORT, LV 40, RECAP ✓) at desks in Copilot tees; ★ YOUR PARTY LEVELLED UP ★; GEAR: MICROSOFT 365 COPILOT |
| 42.8 | Quest | CALENDAR · TOMORROW · 10:00 / INTRODUCTION TO / MICROSOFT 365 COPILOT / LED BY HANNAH / YOU: ATTENDEE; "Oh! Hannah's running a session tomorrow." "Microsoft 365 Copilot? What's that?" "Let's find out!"; QUEST ACCEPTED! (50.77 s) |
| 53.0 | Enter | COPILOT JOINED THE PARTY! (55.0 s; Copilot is the logo, never a person) |
| 55.8 | Boss | BOSS: THE INBOX; the mail is sorted into three trays (★ PRIORITY 12 / FYI 1,040 / LATER 3,760), then a WHAT MATTERS window (★ BUDGET SIGN-OFF · FRI, ★ CLIENT REVIEW · MON, ★ TEAM REORG · READ) |
| 60.6 | Drafts | DRAFT REPLY · 1 OF 6 (to Priya, confirming the budget by Friday), READY FOR REVIEW ✓ (62.73 s); PLANNER: SIGN OFF BUDGET (FRI), CALL CLIENT (MON), READ REORG PLAN (THIS WK) |
| 65.9 | Clash | the CLASHES: 37 counter runs down to CLASHES: 37 → 0 ✓ (67.6 s); HANNAH · FREE/BUSY finds THU 14:00 FREE ✓ (69.17 s); CATCH-UP BOOKED ✓ (70.33 s) |
| 72.4 | Recap | ▶▶ FF VHS fast-forward through the month cards; RECAP.DOC ✓ (75.2 s); 6 MONTHS → 60 SECONDS; SESSION PREP ✓ (INTRO TO MICROSOFT 365 COPILOT, TOMORROW 10:00, HOST: HANNAH; AGENDA / 3 QUESTIONS / PRE-READ ticked off; READY ✓) |
| 78.5 | Clear | STAGE CLEAR! (79.67 s); the STATUS window levels up (LV 12 → 40, HP refills, STATUS: READY, MODE: 6 MO BEHIND → MODE: CAUGHT UP); "Okay. I've got this." |
| 81.3 | Outro | MICROSOFT 365 types on, then the COPILOT logo and pixel mark pop in (83.97 s); Sofia waves; WELCOME BACK, SOFIA! (84.87 s) |
| 86.5 | Credit | COPILOT QUEST logo, EP.1 · WELCOME BACK (87.15 s), the Copilot mark, "Created by GitHub Copilot" (fades in from 87.3 s). The outro irises out at 86.15–86.5 s and the credit card irises back in from 86.5 s. |

## Voiceover

Each character voices their own lines (edge-tts, keep the longest of 3 takes):

| Voice | Speaker |
|---|---|
| en-US-AndrewMultilingualNeural, +5% | Narrator |
| en-US-AvaMultilingualNeural, +5% | Sofia |
| en-GB-RyanNeural, +10% | Raj |
| en-US-EmmaMultilingualNeural, +10%, +2Hz | Maya |
| en-US-BrianMultilingualNeural, +10% | Leo |

| Key | Speaker | Line |
|---|---|---|
| travel | Narrator | "Six months. Twelve countries. Beaches, mountains... and not a single email." |
| ahh | Sofia | "Ahh... this is the life." |
| back | Narrator | "It's Sofia's first day back, after a six-month sabbatical." |
| behind | Narrator | "Six months behind..." |
| mode | Narrator | "...and in full catch-up mode." |
| good | Sofia | "Okay... six months to catch up on. Where do I even start?" |
| c1 | Raj | "Copilot prepped my client meeting in five minutes!" |
| c2 | Maya | "I just asked Copilot to summarise the whole project." |
| c3 | Leo | "Have you caught up on missed messages yet?" |
| session | Sofia | "Oh! Hannah's running a session tomorrow." |
| what | Sofia | "Microsoft 365 Copilot? What's that?" |
| find | Sofia | "Let's find out!" |
| enter | Narrator | "Enter Copilot." |
| inbox | Narrator | "It sorts the inbox, and summarises what really matters." |
| drafts | Narrator | "Drafts her replies, ready to review, and adds her actions to Planner." |
| clash | Narrator | "Untangles the calendar." |
| avail | Narrator | "Then checks when Hannah is free, and books a catch-up." |
| missed | Narrator | "Recaps six months in sixty seconds." |
| prep | Narrator | "Gets her ready for tomorrow's session." |
| got | Sofia | "Okay. I've got this." |
| outro | Narrator | "Microsoft 365 Copilot. Welcome back." |

## Build

- Engine: `retro.js` (640×360 virtual canvas scaled 3× to 1080p, cel-shading core, and drawing helpers including `inkRing`, `panel` and `hudText`), `pxfont.js` (pixel font) and `post.js` (WebGL2 CRT pass: grade, 4-level bloom, chroma bleed, scanlines, aperture grille, vignette, noise, power-on and tracking glitch).
- Characters:
  - `heroine.js` is the cel-shaded Sofia tachie rig. It has poses, `office` / `beach` / `tee` outfits, a headset, a `'key'` typing hand, `armsOnly` passes, and a `cast` of palette-swapped colleagues (raj, maya, leo).
  - `anime.js` (`window.A`) provides Sofia's palette, relighting, and the blink and lip-sync timing helpers. Its earlier `head80` rig isn't drawn in this cut.
- Scenes: `scenes.js` (act 1: title, travel montage and the first day back) and `act2.js` (act 2: the colleagues, Hannah's session, Copilot's quest and the credit).
- Timeline: `timeline.js` (`FPS=30`, `TOTAL=2685`). It holds `SCENE_T`, the VO and SFX cues (SFX sit on the visual hit) and the transitions (diamonds, blinds, pixelate, iris, step fade). `INS_D=2.0` is the hold inserted at 13.1 s for the crash box. Everything from the `ret` scene on is written in story time: `draw()` passes those scenes `t − INS_D`, `act2.js` subtracts it in `vs()`, and `audio.js` shifts score notes at or after 13 s (`SH()`). `SCENE_T`, `VO_CUES`, `SFX_CUES` and `TRANS` stay in real time.
- Audio: `audio.js`. A synthesised chiptune score in 13 sections (real times):
  - title fanfare;
  - tropical travel groove (3.2–10.3 s, F major), scratched off by the RING;
  - VACATION.EXE hang bed (11.9–14.1 s): a stuck two-note loop over a drone that sags flat at NOT RESPONDING;
  - stage-card jingle (15.1 s);
  - office theme (140 bpm, A minor);
  - party (31.5–42.8 s, C–Am–F–G, 120 bpm);
  - quest bed (42.8–53.0 s, curious D minor, building to the summon);
  - Enter Copilot (53.0–55.8 s): a beam rise, then a D major bloom at 53.6 s;
  - battle loop (55.8–72.2 s, D minor, 150 bpm);
  - recap arpeggios (72.6–78.3 s, F–Am–Bb);
  - stage-clear fanfare (78.5 s);
  - outro (81.3–86.5 s, Am–F–G–C);
  - credit sting (86.5–89.5 s).

  Plus synth SFX in key and in-engine VO ducking. The noise is seeded, so exports are deterministic.
- VO: `python make_voice.py [keys…]` (pass keys to regenerate just those lines). It writes `voice.js`, `voice_timing.js` and `voice_timing.json`.
- QA:
  - Stills: `python stills.py [t…]` (a still every 2 s by default, contact sheets of 12; set `RAW=1` for the pre-CRT canvas).
  - Rig check: `python rigsheet.py` writes `stills\rig_sheet.jpg`.
  - Sync: `python %USERPROFILE%\.copilot\skills\av-sync\av_check.py sofia-retro.html` gives 0 FAIL, 9 WARN, 16 INFO. All 9 WARNs are deliberate:
    - Eight SFX sit on a content change rather than the nearest cut, 4–6 frames off: the OK click f426 and the glitch f438 either side of the squash, flip f591, pop f666, the select pings f1068, f1176 and f2028, confirm f2077, card f2280 and chk1 f2292.
    - The 56.5 s "bright flash" is the zap hit. A pale-cyan 0.4 flash lands on the same frame as the lightning bolt and the `zap` SFX (f1695), then fades within 3 frames.
    - The "VO leaves 4.6 s without narration" INFO after "ahh" is the intended crash hold.
- Export: `python export_mp4.py sofia-retro.html sofia-retro.mp4` (JPEG q95 frames, libx264 crf 22 with `-tune animation`, yuv420p bt709, AAC 192k, faststart; about 6 minutes for 89.5 s).
- Credits: parts of `retro.js`, `anime.js`, `post.js` and `pxfont.js` are adapted from MIT-licensed lemomo-ai/lemo-opuscar. See `THIRD_PARTY_NOTICES.md`.
