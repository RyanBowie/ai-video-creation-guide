# Build prompt — "Copilot Quest, Episode 1: Enter Copilot" (89.5 s retro arcade / 90s anime episode)

This is the consolidated, standalone prompt that produced `sofia-retro.html` / `sofia-retro.mp4` (1080p30, 89.5 s). It tells Sofia's whole story in the retro design and folds the original brief together with every piece of feedback given during the build, so it does not depend on the watercolour prompt (`sofia-return/PROMPT.md`). Paste it into a Copilot session that has the **retro-anime**, **tts-voiceover** and **av-sync** skills to reproduce or remix the episode.

---

## The prompt

> Use the **retro-anime** skill (copy its `kit\`: the `retro.js` cel engine, the `anime.js` + `heroine.js` tachie rig, `scenes.js` + `act2.js`, the `post.js` WebGL2 CRT, the `pxfont.js` pixel font, the `audio.js` chiptune and `timeline.js`), the **tts-voiceover** skill and the **av-sync** skill, plus the motion-graphics player and export conventions. Build a very creative, friendly, nicely animated explainer of about 90 s in a retro arcade / 90s TV-anime style. You have creative freedom. (The brief asked for 40–60 s; pacing feedback grew the final cut to 89.5 s. Hold beats long enough to read rather than cramming.)
>
> **Message:** six months away buries you; Microsoft 365 Copilot digs you out, so you walk into tomorrow's session caught up and confident.
>
> **Story** (an original scenario for a gamified "Copilot Quest" onboarding series; every character is fictional):
> - Learning Copilot is framed as a quest: the mission is "Save Sofia's First Day Back", her starting level is "New Adventurer", and the series runs six episodes from Ep1 Enter Copilot to Ep6 Build Mode. This video is Episode 1: Enter Copilot.
> - Sofia, a director at a large company, is back after a 6-month sabbatical. Microsoft 365 Copilot arrived while she was away.
> - Her pains:
>   - Thousands of emails, with internal noise mixed in among the important ones. So much is marked high importance that she can't tell what matters.
>   - Teams and the Outlook calendar are full of meetings. She hasn't accepted any, recurring ones have double-booked her, and she doesn't know which to attend.
>   - She's struggling to catch up on six months.
>   - Colleagues around her are using Copilot and the newest models to build decks and documents, and she isn't sure she's found the right balance getting back into the office.
> - The turn comes in her own voice: she spots Hannah's "Introduction to Microsoft 365 Copilot" session tomorrow, asks what it is, and decides to find out.
> - Copilot then:
>   - sorts the inbox and summarises what really matters
>   - drafts replies for her to review
>   - adds her actions to Planner
>   - untangles the double-booked calendar
>   - checks when Hannah is free and books a catch-up
>   - recaps six months in sixty seconds
>   - gets her ready for tomorrow's session.
> - She ends confident ("Okay. I've got this."), the outro says "Microsoft 365 Copilot. Welcome back.", and the video closes on a prominent **"Created by GitHub Copilot"** end card.
>
> **Look:**
> - 90s TV anime meets the arcade:
>   - an attract-mode title screen
>   - PC-98 visual-novel tachie portraits and text boxes
>   - bevelled Win9x / vaporwave windows
>   - a pixel HUD (meters, counters, stamps)
>   - Bayer dither and halftone shading
>   - a chiptune score
>   - a WebGL CRT finish: bloom, subtle scanlines, aperture grille, chroma bleed, vignette, noise, power-on and a VHS tracking glitch.
> - Reference images: an anime eye close-up, an orange-haired girl in a headset, a CHAT.EXE visual-novel text box, and a night-time room lit by a CRT. A later reference shows a 90s anime girl with orange hair, a side ponytail and a headset, one arm raised holding a UI element. A generic 90s anime look and a made-up character are fine, but Sofia must look rich, not basic.
> - Draw at 640×360 and show at ×3 (1920×1080) at 30 fps (`TOTAL=2685` frames).
>   - Use hard-edged cels, character motion on twos and a smooth camera.
>   - Anything that glows is also drawn to the glow layer so the bloom catches it.
>   - VN text boxes type on in time with the VO word timings.
>
> **Characters:**
> - **Sofia** (`heroine.js` tachie, origin at the neck base):
>   - Orange hair with an ahoge, a side ponytail with a gold star clip, big glossy teal eyes, and a headset with a boom mic and a cyan LED.
>   - Office outfit: a cropped cream jacket with teal trim over a sparkly dark top, a gold-buckle belt and a pleated teal skirt.
>   - Beach outfit: a coral racer one-piece with white piping, a teal sarong with white dots and shades pushed up. She sits on a yellow-striped beach chair.
>   - Nine expressions: neutral, smile, happy, surprised, shocked, worried, panting, determined, dreamy. The rim light carries the mood (red for alarm, green for Copilot).
> - **Colleagues** sit at desks in Microsoft 365 Copilot tees, each with a pixel name plate:
>   - Raj (SALES LV 42, DECK READY ✓)
>   - Maya (PROJECTS LV 38, SUMMARY.DOC ✓)
>   - Leo (SUPPORT LV 40, RECAP ✓)
> - **Hannah** appears only as text (the session invite and her free/busy).
> - **Copilot** is never a person: it is the logo, a pixel sprite, a `COPILOT.EXE`-style window or a glow.
>
> **Scenes (13 beats, 89.5 s):**
> 1. **Title (0–3.2 s):** a synth sun and grid, the neon COPILOT QUEST logo, EPISODE 1: ENTER COPILOT and a blinking PRESS START.
> 2. **Travel (3.2–15.1 s):**
>    - ★ 6 MONTHS AWAY ★. A WORLD_TOUR.EXE map pins 12 stops from London (COUNTRIES 12/12), with WISH YOU WERE HERE and GREETINGS FROM NZ postcards and INBOX.EXE (EMAILS: 0 / OUT OF OFFICE: ON ✓). VO (narrator): "Six months. Twelve countries. Beaches, mountains... and not a single email."
>    - She relaxes in a beach chair at sunset. VO (Sofia): "Ahh... this is the life."
>    - RING! RING! (10.3–15.1 s) plays over a soft red pulse at 2.5 Hz and a screen shake. Her cocktail spins and lands on a crab, which scuttles off with it.
>    - A Win95 box, VACATION.EXE HAS STOPPED RESPONDING / RETURNING TO WORK..., hangs for about 2.5 s (11.8–14.4 s). The hourglass drains, the bar sticks, the title greys to NOT RESPONDING at 13.1 s, the cursor clicks OK at 14.2 s, and a tracking glitch cuts away.
> 3. **Return (15.1–31.5 s):**
>    - DAY 1 / STAGE 1 / THE RETURN. VO (narrator): "It's Sofia's first day back, after a six-month sabbatical."
>    - A POV desk shot with the camera as her monitor, and the MAIL V2.0 flood in a CRT insert.
>    - The 6 MONTHS BEHIND stamp lands at about 21.5 s. VO: "Six months behind..."
>    - A damage tally pops in line by line: ✉ 4,812 UNREAD / MEETINGS: 214 / CLASHES: 37. Then the SOFIA and STATUS windows appear: LV 1, HP 30%, STATUS: JET-LAGGED, and MODE: CATCH-UP blinking. VO: "...and in full catch-up mode."
>    - Bust shot. VO (Sofia): "Okay... six months to catch up on. Where do I even start?"
> 4. **Party (31.5–42.8 s):** the colleagues at their desks.
>    - VO (Raj): "Copilot prepped my client meeting in five minutes!"
>    - VO (Maya): "I just asked Copilot to summarise the whole project."
>    - VO (Leo): "Have you caught up on missed messages yet?"
>    - ★ YOUR PARTY LEVELLED UP ★, then GEAR: MICROSOFT 365 COPILOT.
> 5. **Quest (42.8–53.0 s):**
>    - A calendar invite: CALENDAR · TOMORROW · 10:00 / INTRODUCTION TO / MICROSOFT 365 COPILOT / LED BY HANNAH / YOU: ATTENDEE.
>    - VO (Sofia): "Oh! Hannah's running a session tomorrow." / "Microsoft 365 Copilot? What's that?" / "Let's find out!"
>    - QUEST ACCEPTED! at 50.77 s.
> 6. **Enter (53.0–55.8 s):**
>    - A step fade from black (53.0–53.3 s) onto a dark starfield. A cyan light pillar rises inside a summon ring: a cyan ellipse, a dashed inner ring and 12 rotating diamonds.
>    - At 53.6 s a blue burst opens with speed lines, six orbiting sparkles, a lens flare and a pale-cyan flash, and the pixel Copilot mark springs in.
>    - VO (narrator): "Enter Copilot."
>    - COPILOT JOINED THE PARTY! at 55.0 s.
> 7. **Boss (55.8–60.6 s):**
>    - A boss arena: a purple sky with pink stars over the pink synth grid. The pixel Copilot mark hovers on the left. On the right is the inbox monster, an envelope with angry red eyes, gold pupils and white teeth, ringed by orbiting pink envelopes. HUD: BOSS: THE INBOX, a red HP meter and ✉ 4,812 UNREAD.
>    - At 56.5 s a cyan zap bolt runs from the Copilot mark to the monster, with a screen shake and a pale-cyan flash. HP drops from 100% to 70%.
>    - Trays rise at 57.5 s. From 58.0 s envelopes stream out of the monster into them while the counters count up: ★ PRIORITY 12 / FYI 1,040 / LATER 3,760. HP drains to 20%.
>    - WHAT MATTERS pops in at 59.17 s: ★ BUDGET SIGN-OFF · FRI, ★ CLIENT REVIEW · MON, ★ TEAM REORG · READ.
>    - The monster blinks at 59.6 s and pops into pixels and envelopes at 59.9 s. SORTED ✓ replaces the unread count.
>    - VO (narrator): "It sorts the inbox, and summarises what really matters."
> 8. **Drafts (60.6–65.9 s):**
>    - DRAFT REPLY · 1 OF 6, TO: PRIYA. The reply types on: "Hi Priya, thanks for waiting. The budget looks good. I'll confirm by Friday. — Sofia". Then READY FOR REVIEW ✓ (62.73 s).
>    - PLANNER fills in: SIGN OFF BUDGET (FRI), CALL CLIENT (MON), READ REORG PLAN (THIS WK). + ADDED TO PLANNER pops in at 64.7 s.
>    - VO (narrator): "Drafts her replies, ready to review, and adds her actions to Planner."
> 9. **Clash (65.9–72.4 s):**
>    - A MY WEEK calendar: the red "!" clash blocks split apart and turn cyan (66.9–67.3 s), then CLASHES: 37 → 0 ✓ (67.6 s). VO (narrator): "Untangles the calendar."
>    - HANNAH · FREE/BUSY pops in at 68.4 s and a scan line sweeps her week (68.6–69.1 s): THU 14:00 FREE ✓ (69.17 s). A CATCH-UP W/ HANNAH block drops into Thursday 14:00, then CATCH-UP BOOKED ✓ (70.33 s). VO (narrator): "Then checks when Hannah is free, and books a catch-up."
> 10. **Recap (72.4–78.5 s):**
>     - A ▶▶ FF VHS fast-forward with tape noise through six 2025 month cards (from 72.5 s): JAN NEW ORG CHART, FEB PROJECT ATLAS LAUNCH, MAR BUDGET V3, APR NEW CLIENT: CONTOSO, MAY TEAM OFFSITE, JUN COPILOT ROLLOUT. At 74.3 s they fly into a document: RECAP.DOC ✓ (75.2 s), ▶ PLAY, and 6 MONTHS → 60 SECONDS. VO (narrator): "Recaps six months in sixty seconds."
>     - SESSION PREP ✓ (76.0 s): INTRODUCTION TO MICROSOFT 365 COPILOT · TOMORROW 10:00 · HOST: HANNAH. AGENDA, 3 QUESTIONS and PRE-READ tick off (76.4, 76.7, 77.0 s) and a READY ✓ stamp lands (77.3 s). VO (narrator): "Gets her ready for tomorrow's session."
> 11. **Clear (78.5–81.3 s):**
>     - STAGE CLEAR! (79.67 s) with confetti. LV 12 → 40, HP refills (78.7–79.6 s), STATUS: SYNCING… becomes READY, and MODE goes from 6 MO BEHIND to CAUGHT UP. Sofia strikes the fist pose with a green rim light.
>     - VO (Sofia): "Okay. I've got this."
> 12. **Outro (81.3–86.5 s):**
>     - Over a synth sun and grid, MICROSOFT 365 types on (81.7 s), and the COPILOT logo and the pixel mark land (83.97 s).
>     - Sofia waves with a pink rim light. WELCOME BACK, SOFIA! (84.87 s).
>     - VO (narrator): "Microsoft 365 Copilot. Welcome back."
> 13. **Credit (86.5–89.5 s):** an iris out and back in (86.15–87.3 s) to the COPILOT QUEST logo, EP.1 · WELCOME BACK (87.15 s), the Copilot mark and **"Created by GitHub Copilot"** (from 87.3 s).
>
> **Transitions:** object- or beat-motivated, never plain crossfades.
>
> | Time (s) | Transition |
> |---|---|
> | 3.0 | Diamonds |
> | 15.1 | Blinds in |
> | 31.25 | Pixelate + step fade |
> | 42.6 | Reversed diamonds |
> | 52.8 | Step fade to black |
> | 55.6 | Vertical blinds |
> | 60.4 | Diamonds |
> | 65.7 | Blinds |
> | 72.2 | Pixelate |
> | 78.3 | Iris |
> | 81.1 | Reversed diamonds |
> | 86.15–86.5 | Iris out and in |
>
> Flashes last about 0.1 s at ≤ .4 opacity, so they never blow out to full white. Most are warm `#ffe2c4`. The Enter summon and the boss zap use pale cyan `#e8fbff`, STAGE CLEAR uses pale gold `#fff6d0`, and the monster pop and the outro logo land use white at .3.
>
> **Voice and pacing:**
> - edge-tts voices:
>   - Narrator: `en-US-AndrewMultilingualNeural` +5%.
>   - Sofia: `en-US-AvaMultilingualNeural` +5%.
>   - Raj: `en-GB-RyanNeural` +10%.
>   - Maya: `en-US-EmmaMultilingualNeural` +10% +2Hz.
>   - Leo: `en-US-BrianMultilingualNeural` +10%.
> - The narrator plays dry (`narr`); in-scene lines get a small room (`room`).
> - Voice the whole script up front and keep the longest of 3 takes. Land pop-ins, stamps and SFX on the spoken words using `voice_timing.json`.
> - Give the gags room: RING RING about 4.8 s, the VACATION.EXE hang about 2.5 s, 6 MONTHS BEHIND about 5.5 s. Leave at least 2.5 s of reading hold after the last element lands.
> - Wording:
>   - Keep Sofia's "Oh!" short, because edge-tts stretches a longer vowel into a moan.
>   - Name Hannah once per line.
>   - Write and say "Microsoft 365 Copilot" in full, never an abbreviation.
>
> **Score and SFX** (all synthesised in `audio.js`, no samples):
> - A 13-section chiptune with pulse, triangle, saw and noise drums:
>   - the office theme at 140 bpm in A minor
>   - the party at 120 bpm (C–Am–F–G)
>   - a D-minor battle at 150 bpm for the boss.
> - SFX land on the content change, not on the cut: the mail ping when the alert pops, the stamp hit when the stamp lands.
> - Map pins tick up the F-major pentatonic. A stuck two-note "loading" loop over a low drone sits under the VACATION.EXE hang.
> - Mix: master compressor −14 dB at 3:1, then gain .68. The music bus is .55, ducked to .42 under VO. `exportAudio()` is seeded (`0x5EED`) so every export carries the same soundtrack.
>
> **Rules:**
> - Legibility first: every gold or white string gets a dark ink ring and sits on a dark bevelled plate. Keep scanlines subtle.
> - The headset sits on her head. In POV typing shots she faces the camera with curled `'key'` hands, drawn again with `armsOnly` over the keyboard. Never flat palms on the keys.
> - No clipping: check every pose and outfit on `rigsheet.py`'s flat-backdrop sheet before export.
> - Build a ~20–25 s review cut (title → travel → return → to be continued) for style sign-off before animating the rest.
> - Run `av_check.py` before export (0 FAIL).
> - Credit lemomo-ai/lemo-opuscar (MIT) in `THIRD_PARTY_NOTICES.md` for the adapted cel core, `head80`, CRT pass and pixel font. Use no upstream art, fonts, music or voices.
> - End on "Created by GitHub Copilot".
>
> **Deliverables:**
> - `sofia-retro.html`: click or Space to play, R to restart, ←/→ to seek, `?frame=N` for a still.
> - Its scripts: `retro.js`, `anime.js`, `heroine.js`, `scenes.js`, `act2.js`, `post.js`, `pxfont.js`, `audio.js`, `timeline.js`, `voice.js`, `voice_timing.js/.json`.
> - The tools: `make_voice.py`, `stills.py`, `rigsheet.py`, `export_mp4.py`.
> - `THIRD_PARTY_NOTICES.md`, this `PROMPT.md`, and `sofia-retro.mp4` at 1080p30.
> - Copy the folder to `%USERPROFILE%\Documents\AIVideos\sofia-retro`.

---

## Feedback rounds that shaped it (in order)

1. **The original brief** (shared with the watercolour cut):
   - A 40–60 s, very creative, friendly animation of Sofia's first day back after a 6-month sabbatical, to slot into a Copilot training deck.
   - Reuse the skills from the earlier videos.
   - End on "Created by GitHub Copilot".
2. **A complete redesign:** "Do a complete redesign in a different animation and design style. The reference images show an old arcade / anime look and feel. Retell the story in this style with good character design and animation and that pre-2000s feel. You have creative freedom." There were 4 reference images: an anime eye close-up, an orange-haired girl in a headset, a CHAT.EXE visual-novel text box, and a night-time room lit by a CRT.
3. **lemomo-ai/lemo-opuscar as optional help:** a collection of 43 film styles made in code. Its cel core, `head80`, CRT pass and pixel font were adapted (MIT).
4. **"You can start with 20 seconds first for me to review":** led to the 24.4 s review cut.
5. **"The world and background look good, but the design of Sofia isn't great":** the user said a generic 90s anime look and a made-up character are fine, and that "at the moment Sofia's design looks really basic". The reference was a 90s anime girl with orange hair, a side ponytail and a headset. This led to the richer tachie rig.
6. **"The headset and head turning / the way the arms are don't really look right in the way she's using the device":** led to the headset redrawn on her head and the POV typing shot.
7. **On the 24.4 s review cut:**
   - Some of the gold text on the screens was hard to read.
   - The RING RING and 6-months-behind scenes were too short.
   - The beach outfit looked strange, with odd clipping.
8. **"It's a good start, scenes are just a bit too fast":** led to longer holds throughout.
9. **"This text is quite hard to read"** (a title-screen screenshot): led to ink rings and dark plates on every HUD string.
10. **Save the learnings as skills** for retro theme design, sound and character design: led to the `retro-anime` skill.
11. **"Continue with the next 40 seconds"** with creative freedom in the retro design, updating the skills along the way: led to the colleagues, Hannah's session and Copilot's quest (act 2).
12. **On the full 87.5 s episode:** "The vacation.exe has stopped working scene is too fast. "Preps her for Hannah's for catch-up", also the "Ooh" doesn't sound right." This led to the 2.0 s hang insert and the reworded lines (89.5 s).
13. **Make `PROMPT.md` the full-size prompt** for the whole Sofia story in the retro design, rather than "redesign this in this format": this rewrite.

---

## How the feedback was addressed

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

## Build steps

```powershell
pip install --user edge-tts playwright imageio-ffmpeg
python make_voice.py                                   # voice.js + voice_timing.json/.js (longest of 3 takes); pass keys to re-voice only those
python -m http.server 8765 --bind 127.0.0.1            # preview only: http://127.0.0.1:8765/sofia-retro.html?frame=N
python stills.py                                       # stills\t_XX.XX.png + sheet.jpg (args = seconds); RAW=1 = pre-CRT canvas
python rigsheet.py                                     # stills\rig_sheet.jpg (clipping check)
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" sofia-retro.html   # 0 FAIL, 9 deliberate WARN
python export_mp4.py sofia-retro.html sofia-retro.mp4  # 1080p30, crf 22, -tune animation, ~6 min
```
