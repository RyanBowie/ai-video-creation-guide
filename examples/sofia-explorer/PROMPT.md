# Build prompt — "The Great Copilot Quest, Chapter One: The Return" (explorer / adventure-serial episode; 26 s opening built)

This is the consolidated, standalone prompt behind `sofia-explorer.html` / `sofia-explorer.mp4` (1080p30, the 26 s opening review cut). It tells Sofia's whole story in the explorer design and folds the original brief together with every piece of feedback given so far, so it does not depend on the watercolour prompt (`sofia-return/PROMPT.md`) or the retro prompt (`sofia-retro/PROMPT.md`). Paste it into a Copilot session that has the **explorer-quest**, **tts-voiceover** and **av-sync** skills to reproduce the opening, build the rest of the chapter, or remix it.

---

## The prompt

> Use the **explorer-quest** skill (copy its `kit\`: the `retro.js` cel engine, the `heroine.js` tachie rig with its `explorer` outfit, `map.js` + `mapdata.js` (baked from Natural Earth by `make_map.py`), `scenes.js`, the `film.js` WebGL2 16 mm pass, the `audio.js` adventure score and `timeline.js`), the **tts-voiceover** skill and the **av-sync** skill, plus the motion-graphics player and export conventions. For the office beats, re-skin the retro-anime kit's `officeRoom`, `povDesk` and `act2.js` set pieces in parchment, brass and lamplight. Build a very creative, friendly, nicely animated explainer of about 95 s in a vintage explorer / adventure-serial style. You have creative freedom. Build a ~25 s review cut first (it came out at 26 s) and get sign-off before animating the rest. (The brief asked for 40–60 s; pacing feedback on the retro episode grew it to 89.5 s. Hold beats long enough to read rather than cramming.)
>
> **Message:** six months away buries you; Microsoft 365 Copilot digs you out, so you walk into tomorrow's session caught up and confident.
>
> **Story** (an original scenario for a gamified "Copilot Quest" onboarding series; every character is fictional):
> - Learning Copilot is framed as a quest: the mission is "Save Sofia's First Day Back", her starting level is "New Adventurer", and the series runs six episodes from Ep1 Enter Copilot to Ep6 Build Mode. This video is Episode 1, titled "Chapter One · The Return" to match the series art.
> - The series art is "The Great Copilot Quest" announcement image: a parchment world map with a red dashed route, polaroids, passport stamps, a brass compass with the Copilot logo, gold serif titles, and Sofia as an explorer in a fedora. So the sabbatical is told as a 12-country expedition, the office is the next uncharted territory, and Microsoft 365 Copilot is the compass that finds the way.
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
> - A 1930s–50s pulp expedition / adventure serial, matched to the series art. Evoke the genre, never a franchise:
>   - an aged parchment world map on a wooden desk (real Natural Earth 1:110m coastlines in a Miller projection) with creases, stains, a coffee ring, sepia hatching, ocean labels, "Here be meetings" with a sea serpent, a 32-point compass rose, rhumb lines and burnt edges
>   - a red dashed route drawn by a little plane, with red pins, passport stamps and polaroids
>   - a brass compass whose pivot cap is the Copilot mark
>   - gold, extruded serif titles with god-rays, on a navy title plate with a brass rose
>   - sunrise ruins in parallax, and torches and lamplight for interiors
>   - a WebGL2 16 mm film finish: gate weave, soft focus, bloom, halation, a warm grade with brown shadows, an amber light leak, flicker, vignette, scratches, dust, grain and letterbox bars.
> - Reference image: "The Great Copilot Quest" key art (described above). Sofia must read as that explorer, rich and detailed, not basic.
> - Draw at 640×360 and show at ×3 (1920×1080) at 30 fps (`TOTAL=780` frames for the 26 s opening).
>   - Use hard-edged cels, character motion on twos and a smooth camera.
>   - Anything that glows is also drawn to the glow layer so the bloom catches it.
>   - Type: narration captions in bold Rockwell, spoken lines in italic bold Bookman Old Style, the HUD in bold Bookman, the gold titles in Rockwell Extra Bold (installed with Microsoft Office; falls back to Rockwell, then Georgia), Stencil for stamps, and Segoe Print / Ink Free for polaroid captions.
>
> **Characters:**
> - **Sofia** (`heroine.js` tachie, `HER.portrait(g,x,y,k,{outfit:'explorer', …})`, origin at the neck base):
>   - Orange hair, big glossy teal eyes, and a side ponytail that sits lower under the hat, tied with a teal band. The hat hides her retro star clip and ahoge.
>   - Explorer outfit: a khaki field shirt with rolled cuffs over bare forearms, a teal neckerchief, a leather satchel strap with the satchel at her right hip, and a brown felt fedora. The fedora is on by default with this outfit (`hat:false` takes it off; `hat:true` adds it to other outfits).
>   - The `compass` pose holds the brass Copilot compass in a natural grip.
>   - Nine expressions: neutral, smile, happy, surprised, shocked, worried, panting, determined, dreamy. The rim light carries the mood.
> - **Fellow explorers** (`HER.CASTS`) sit at desks with field journals and Microsoft 365 Copilot open, each with a brass name plate: Raj (short dark hair), Maya (purple hair) and Leo (glasses).
> - **Hannah** appears only as text (the session invite and her free/busy).
> - **Copilot** is never a person: it is the compass, the Copilot mark, a glow or a window.
>
> **Scenes (the whole chapter in order, about 95 s; beats 1–4 and 11 are built and make up the 26 s review cut, beats 5–10 are planned):**
> 1. **Map (0–6.2 s):**
>    - A projector rattles up on a wooden desk under the parchment map. The EXPEDITION LOG bar counts DAY ### and STOPS ##/12.
>    - A little plane draws the red dashed route from LONDON through ICELAND, MEXICO, PERU, MOROCCO, EGYPT and CAMBODIA. Pins tick in from 2.1 to 5.6 s, each with a passport stamp.
>    - Caption: SIX MONTHS… OFF THE MAP. VO (narrator, 0.9 s): "Six months... off the map."
>    - The camera pushes in on Cambodia.
> 2. **Ruins (6.2–10.8 s):**
>    - An iris opens from the sun into Angkor at sunrise, in 5 parallax layers (sky, reflecting pool, temple, Sofia, jungle). Bar: ANGKOR, CAMBODIA · STOP 06/12 (6.4 s).
>    - Sofia turns to camera and raises the compass. Her expression goes from dreamy to a smile to happy. VO (Sofia, 6.9 s): "Best. Sabbatical. Ever!"
>    - A luggage tag, SOFIA / EXPLORER · 6 MONTHS, drops on "Sabbatical" (7.74 s) and swings.
> 3. **Home (10.8–16 s):**
>    - The sunrise dissolves into the map. Polaroids land: Mexico (11.4 s), Peru (11.75 s) and Bali (12.3 s).
>    - The route continues through INDIA, TANZANIA, BALI, AUSTRALIA, NEW ZEALAND and JAPAN. Captions: 12 COUNTRIES · 1 EXPLORER, then AND NOW… THE LONG ROAD HOME.
>    - VO (narrator, 11.2 s): "Twelve countries, one explorer... and now, the long road home."
>    - A red ✕ (14.53 s) and a HOME stamp (14.6 s) land on London.
> 4. **Title (16–22.6 s):**
>    - A film burn opens onto the navy title plate. The brass compass springs in (16.2–16.8 s), spins and settles (18.4 s). VO (narrator, 16.3 s): "Her greatest expedition yet? The Great Copilot Quest."
>    - Gold titles with god-rays slam in on the words: THE GREAT (18.52 s), COPILOT (18.98 s), QUEST (19.56 s).
>    - CHAPTER ONE · THE RETURN (20.1 s), then a red EP.1 stamp (21.1 s).
> 5. **Base camp, Day 1 (~12 s, planned):**
>    - A DAY 1 · THE RETURN card. Her desk is an overgrown temple doorway lit by an oil lamp. VO (narrator): "It's Sofia's first day back, after a six-month sabbatical."
>    - A cave of scrolls: the counter spins up to ✉ 4,812 UNREAD, red wax HIGH IMPORTANCE seals are on everything so nothing stands out, and a 6 MONTHS BEHIND stamp lands. VO (narrator): "Six months behind..." / "...and in full catch-up mode."
>    - A worried bust shot. VO (Sofia): "Okay... six months to catch up on. Where do I even start?"
> 6. **The temple of meetings (~6 s, planned, no VO):**
>    - A hall of recurring-meeting tiles she never accepted. Double-booked slabs grind together.
>    - MEETINGS: 214 · CLASHES: 37. A wrong step sets off a comedic rolling boulder (stone grind and rumble SFX).
> 7. **Fellow explorers (~10 s, planned):** Raj, Maya and Leo at their desks, building decks and documents with Microsoft 365 Copilot in their field journals. She feels a step behind.
>    - VO (Raj): "Copilot prepped my client meeting in five minutes!"
>    - VO (Maya): "I just asked Copilot to summarise the whole project."
>    - VO (Leo): "Have you caught up on missed messages yet?"
> 8. **The expedition briefing (~10 s, planned):**
>    - An invite pinned to the map: INTRODUCTION TO MICROSOFT 365 COPILOT · TOMORROW 10:00 · LED BY HANNAH.
>    - VO (Sofia): "Oh! Hannah's running a session tomorrow." / "Microsoft 365 Copilot? What's that?" / "Let's find out!"
>    - An EXPEDITION ACCEPTED stamp lands on "find out".
> 9. **The compass finds the way (~25 s, planned):**
>    - The brass compass glows and its needle swings true. VO (narrator): "Enter Copilot."
>    - The scrolls sort themselves into ★ PRIORITY, FYI and LATER piles, and a WHAT MATTERS parchment unrolls. VO (narrator): "It sorts the inbox, and summarises what really matters."
>    - Draft replies are sealed READY FOR REVIEW, and her actions are pinned to a Planner board. VO (narrator): "Drafts her replies, ready to review, and adds her actions to Planner."
>    - The meeting tiles slot into one clear path: CLASHES 37 → 0. VO (narrator): "Untangles the calendar."
>    - HANNAH · FREE/BUSY, then THU 14:00 FREE, then a CATCH-UP BOOKED stamp. VO (narrator): "Then checks when Hannah is free, and books a catch-up."
>    - Journal pages riffle into an expedition log: 6 MONTHS → 60 SECONDS. VO (narrator): "Recaps six months in sixty seconds."
>    - Her satchel is packed with the agenda, her questions and the pre-read, and a READY stamp lands. VO (narrator): "Gets her ready for tomorrow's session."
> 10. **Finale (~8 s, planned):**
>     - Sofia on a cliff at sunrise with the map in hand. VO (Sofia): "Okay. I've got this."
>     - A title reprise. VO (narrator): "Microsoft 365 Copilot. Welcome back."
> 11. **Credit (built; 22.6–26 s in the review cut, and the last ~3.4 s of the full chapter):**
>     - CHAPTER ONE · THE RETURN (23.1 s), the Copilot mark (23.3 s), **"Created by GitHub Copilot"** (23.7 s) and "Made with GitHub Copilot and Opus 5.5" (24.0 s).
>     - Fade to black from 25.4 s.
>
> **Transitions:** object- or beat-motivated, never plain crossfades.
>
> | Time (s) | Transition |
> |---|---|
> | 5.8–6.6 | Iris: a gold ring opens from the sun into the ruins |
> | 10.5–11.0 | Dissolve: the sunrise melts into the map |
> | 15.6–16.3 | Film burn: the reel catches fire at HOME and burns through to the title |
> | 22.2–23.0 | Dip to black into the credit |
>
> There are no white flashes: the film burn and the gold title hits carry the energy. The planned beats use in-world transitions too (a map fold, a page turn, an oil lamp going out, an iris on the compass face). Any flash stays warm, short and dim.
>
> **Voice and pacing:**
> - edge-tts voices:
>   - Narrator: `en-US-AndrewMultilingualNeural` −4% −2Hz (a warm newsreel narrator).
>   - Sofia: `en-US-AvaMultilingualNeural` at the default rate and pitch.
>   - Raj: `en-GB-RyanNeural` +10%.
>   - Maya: `en-US-EmmaMultilingualNeural` +10% +2Hz.
>   - Leo: `en-US-BrianMultilingualNeural` +10%.
> - The narrator uses the `narr` chain (dry plus a .05 reverb send); in-scene lines use `room` (dry plus .1).
> - Voice the whole script up front and keep the longest of 3 takes. Time hits from the word offsets in `voice_timing.json`: the luggage tag starts its drop 2 frames before "Sabbatical", and each title word slams in about 0.05 s before it is spoken.
> - Never rush: hold each beat for at least 4 s, plus 2.5 s of reading time after the last element lands. If a beat feels fast, lengthen the scene rather than speeding up the motion.
> - Wording:
>   - Keep Sofia's "Oh!" short, because edge-tts stretches a longer vowel into a moan.
>   - Name Hannah once per line, and keep the catch-up line clean ("checks when Hannah is free, and books a catch-up").
>   - Write and say "Microsoft 365 Copilot" in full, never an abbreviation.
>
> **Score and SFX** (all synthesised in `audio.js`, no samples):
> - An original D-minor adventure march at 100 bpm (one bar is 2.4 s; the first downbeat is at 1.86 s). It must never resemble any film theme.
>   - A pad swells in from 0.4 s, and a long-short-short gallop starts at 1.86 s.
>   - The brass theme enters at 4.26 s; strings and a flute join at 6.66 s.
>   - March snare and bass drum from 11.46 s, a snare roll into the title at 15.06 s, and a timpani build from 16.26 s.
>   - A D-major fanfare lands on the title hits at 18.66 s, and a held D-major chord sits under the credit from 23.46 s.
> - SFX land on the content change, not on the cut: a projector rattle, the plane drone, a pin tick per stop (D-minor pentatonic, climbing on the way out and stepping back down to D on the way home), a whoosh, the luggage-tag flap, the ✕ scratch, a stamp thump, film-burn crackle, the compass spin, the needle click, the title hits and an end chime.
> - Mix: master compressor −14 dB at 3:1, then gain .68. The music bus is .55 with a .18 reverb send, ducked to .42 under VO. `exportAudio()` is seeded (`0x5EED`) so every export carries the same soundtrack.
>
> **Rules:**
> - Genre, not franchise. Use the vocabulary (fedora, satchel, a map with a dotted route, ruins, torches, a compass, passport stamps), never a film's score, logo lettering, title treatment, whip silhouette or anyone's likeness. The heroine is original, the title face is Rockwell Extra Bold and the march is original.
> - Legibility first: captions are at least 10 px at 640×360, on dark film bars or plates with a dark stroke. Never put thin gold text on a bright background; gold is only for big titles, with a stroke and an extrude. Map labels are set dressing only.
> - A clean character: no outfit clipping, props in a natural grip, arms that read correctly. Check every pose on flat stills (`stills.py` with `RAW=1`) before export.
> - Copilot is never a person: it is the compass, the Copilot mark, a glow or a window.
> - Build the review cut first (beats 1–4 and the credit) for style sign-off before animating the rest.
> - QA: `node --check` every `.js`, `stills.py` contact sheets at every scene boundary, and `av_check.py` with 0 FAIL.
> - Natural Earth: download it at build time, bake `mapdata.js`, then delete the geojson. Never commit it.
> - Credit lemomo-ai/lemo-opuscar (MIT) in `THIRD_PARTY_NOTICES.md` for the adapted cel core and film-pass structure. Use no upstream art, fonts, music or voices.
> - End on "Created by GitHub Copilot" and "Made with GitHub Copilot and Opus 5.5".
>
> **Deliverables:**
> - `sofia-explorer.html`: click or Space to play, R to restart, ←/→ to seek 5 s, `?frame=N` for a still, and a plain 2D fallback when WebGL2 isn't available.
> - Its scripts: `retro.js`, `heroine.js`, `map.js`, `mapdata.js`, `scenes.js`, `film.js`, `audio.js`, `timeline.js`, `voice.js`, `voice_timing.js/.json`.
> - The tools: `make_map.py`, `make_voice.py`, `stills.py`, `export_mp4.py`.
> - `THIRD_PARTY_NOTICES.md`, this `PROMPT.md`, `sofia-explorer.mp4` at 1080p30 and `sofia-explorer-contact.jpg`.
> - Copy the folder to `%USERPROFILE%\Documents\AIVideos\sofia-explorer`.

---

## Feedback rounds that shaped it (in order)

1. **The original brief** (shared with the watercolour and retro cuts):
   - A 40–60 s, very creative, friendly animation of Sofia's first day back after a 6-month sabbatical, to slot into a Copilot training deck ("we want to make this cooler").
   - Reuse the skills from the earlier videos.
   - End on "Created by GitHub Copilot".
   - lemomo-ai/lemo-opuscar (MIT) was offered as optional help.
2. **House rules carried over from the retro rounds:**
   - A rich, detailed Sofia: "at the moment Sofia's design looks really basic".
   - Readable text on dark plates: "some of the text (gold) on the screens is a bit hard to read".
   - Slower pacing: "scenes are just a bit too fast".
   - No odd clipping in the outfits, and arms that read correctly with the props.
   - A short "Oh!" (the long "Ooh" didn't sound right) and no garbled "preps her for Hannah's for catch-up" line.
3. **A new explorer design:** "Perhaps another slightly new design. Just cover the first 10 seconds or so to see what we can do. I've been shared this image they are using for the announcement of this Copilot Quest. It's more detailed and has more of an Indiana Jones theme. Do some research and double-check what we can do to make a new video in Sofia's journey that aligns more with this Indiana Jones / explorer feel." There was 1 reference image: "The Great Copilot Quest" key art. This led to the research notes below, the explorer outfit and fedora, the Natural Earth map, the 16 mm film pass and the 26 s opening (about 16 s of story, then the title and the credit).
4. **"Put it in this folder %USERPROFILE%\Documents\AIVideos":** the cut is copied there as well as published to the repo.
5. **Make `PROMPT.md` the full-size prompt** for the whole Sofia story in the explorer design, rather than a "redesign this in this format" note: this rewrite.

---

## Research and decisions

- **Adventure-serial feel, no franchise IP.** The look borrows the genre (parchment maps, a red route line, a fedora and satchel, sunrise ruins, a 16 mm film finish, a brass-and-strings march), never the franchise: no film score, logo, font, title treatment or likeness.
- **Same engine, new finish.** The Canvas2D engine (`retro.js`, 640×360 at ×3) is reused from the retro cut. The CRT pass is replaced by a 16 mm film pass (`film.js`): gate weave, soft focus, bloom, halation, a warm grade with brown shadows, an amber light leak, flicker, vignette, scratches, dust and grain.
- **A real map.** The coastlines are Natural Earth 1:110m land polygons (public domain) in a Miller projection, baked into `mapdata.js` by `make_map.py`. They are drawn as an aged sheet with sepia hatching, a compass rose, rhumb lines and a red dashed route.
- **Sofia the explorer.** The tachie rig (`heroine.js`) gains an `explorer` outfit: a khaki shirt, a teal neckerchief, a satchel strap and a fedora (`hat`). A `compass` pose holds a brass compass with the Copilot logo on its face.
- **Readable first.** Captions and titles sit on dark plates or film bars, use Rockwell/Bookman-style serifs at 10 px or more (×3 on export), and are timed to the spoken word. Map labels are small set dressing only. Each story beat holds for at least 4 s.
- **Hits on the word.** The luggage tag starts its drop 2 frames before "Sabbatical", so its fastest motion and the paper-flap SFX meet the word. The title words slam in about 0.05 s before each spoken word.
- **Grain costs bytes.** Film grain is fresh noise every frame, so it dominates the bitrate. At 1.5 px grain cells, strength .07 and crf 22, the 26 s cut was 78 MB. With 2 px cells, strength .06 and crf 24 (the `export_mp4.py` default, overridable with `CRF`) it is 35.5 MB at about 10.9 Mbps, with no visible loss.

## Cut (26 s)

| Start (s) | Beat | On screen |
|---|---|---|
| 0 | Map | The projector starts. The EXPEDITION LOG bar counts DAY and STOPS. A plane draws the red route from London through Iceland, Mexico, Peru, Morocco, Egypt and Cambodia while pins drop. Caption: SIX MONTHS… OFF THE MAP |
| 5.8 | Iris | The map irises in on Cambodia, and the ruins open from the sun |
| 6.2 | Ruins | Angkor at sunrise in five parallax layers (sky, reflecting pool, temple, Sofia, jungle). Sofia raises the Copilot compass: "Best. Sabbatical. Ever!" A luggage-tag sign drops in on "Sabbatical" and swings: SOFIA / EXPLORER · 6 MONTHS |
| 10.5 | Dissolve | The sunrise melts into the map |
| 10.8 | Home | The route continues through India, Tanzania, Bali, Australia, New Zealand and Japan, with polaroids on the map. Captions: 12 COUNTRIES · 1 EXPLORER, then AND NOW… THE LONG ROAD HOME. A red ✕ and a stamp hit land on HOME |
| 15.6 | Film burn | The reel catches fire at HOME and burns through to the title |
| 16.0 | Title | The brass compass spins and settles. THE GREAT / COPILOT / QUEST lands on brass hits. CHAPTER ONE · THE RETURN, then a red EP.1 stamp |
| 22.2 | Fade | Dip to black |
| 22.6 | Credit | CHAPTER ONE · THE RETURN, the Copilot mark, "Created by GitHub Copilot" and "Made with GitHub Copilot and Opus 5.5". Fade to black at 26 s |

## Voiceover (edge-tts)

| Key | Voice | Line |
|---|---|---|
| `open` | Andrew (narrator), −4 %, −2 Hz | "Six months... off the map." |
| `best` | Ava (Sofia) | "Best. Sabbatical. Ever!" |
| `home` | Andrew | "Twelve countries, one explorer... and now, the long road home." |
| `quest` | Andrew | "Her greatest expedition yet? The Great Copilot Quest." |

## Score and SFX (`audio.js`, all synthesised)

- An original D-minor adventure gallop that resolves to a D-major fanfare on the title. Brass theme from 4.26 s, strings from 6.66 s, march drums at 11.46–15.06 s and 18.66–23.46 s, the fanfare at 18.66 s and a held D chord at 23.46 s. One bar is 2.4 s.
- SFX: projector rattle, plane drone, a pin tick per stop (D-minor pentatonic: climbing outbound, stepping back down to D on the way home), whoosh, a luggage-tag flap, ✕ scratch, stamp thump, film burn crackle, compass spin, the needle click, title hits and the end chime.
- Sync check (`av_check.py`): 0 FAIL. The two WARNs are expected: the title slams read 2 frames "early" because the checker sees the start of the scale-down while the sound sits on the landing frame, and the needle click sits 6 frames before the title text lands.
- Mix: master compressor −14 dB at 3:1, then gain .68. The music bus is .55, ducked to .42 under the VO. `exportAudio()` is seeded (`0x5EED`) so every export carries the same soundtrack.

## Status and next chapters

- Built and published: the 26 s opening review cut (beats 1–4 and the credit card), waiting for the user's review.
- Next, after sign-off:
  - Build beats 5–10 from the prompt above, and move the credit card to the very end of the chapter.
  - Extend `STOPS` and `LEG_T` if the map returns, then `SCENE_T`, `VO_CUES`, `SFX_CUES` and `TRANS` in `timeline.js`.
  - Voice the new lines in `make_voice.py`, re-score `scheduleMusic` in `audio.js` for the longer running time, then run the QA loop and export.

## Credits

`retro.js` adapts the cel-shading core, `limb()` and the flare values from lemomo-ai/lemo-opuscar (`styles/cel-anime-80s`), and `film.js` adapts the structure of its WebGL2 post pass (`core/post/crt.js`) with 16 mm film stages in place of the CRT. Both are MIT licensed (© 2026 LemoLab). The coastlines come from Natural Earth (public domain) and the source data is not redistributed. The voices are Microsoft Edge neural TTS via `edge-tts`. No film score, logo, font or likeness from any adventure franchise is used. See `THIRD_PARTY_NOTICES.md`.

## Build steps

```powershell
pip install --user edge-tts playwright imageio-ffmpeg
# Only if the map projection, extent or detail changes (mapdata.js already ships):
curl.exe -L -o $env:TEMP\ne_110m_land.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
python make_map.py                                     # reads %TEMP%\ne_110m_land.geojson (or a path argument), writes mapdata.js; then delete the geojson and never commit it
python make_voice.py                                   # voice.js + voice_timing.json/.js (longest of 3 takes); pass keys to re-voice only those lines
python -m http.server 8765 --bind 127.0.0.1            # optional preview: http://127.0.0.1:8765/sofia-explorer.html?frame=N
python stills.py                                       # stills\t_XX.XX.png + sheet.jpg (args = seconds; default every 2 s); RAW=1 = the pre-film canvas
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" sofia-explorer.html   # 0 FAIL (2 expected WARNs, see above)
python export_mp4.py sofia-explorer.html sofia-explorer.mp4  # 1080p30, crf 24 (set CRF to override), -tune animation; the 26 s cut is about 35.5 MB
```
