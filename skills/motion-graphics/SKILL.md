---
name: motion-graphics
description: Create "Opus-style" code-driven motion-graphics explainer videos (stick-figure characters, fluid spring/ease motion, object-motivated transitions, Copilot logo, TTS voiceover with character voices, synthesised SFX) as a single self-contained HTML/SVG player, then export to MP4. Use when the user asks for a motion graphic, animated explainer, animated/story video, character animation, or wants to extend/restyle the Copilot "AI accelerates. Humans create." video. Also the entry point for music videos, lyric videos and beat-synced animation (routes to the character-rig Canvas engine and the audio-edit skill). For a retro pre-2000s arcade / 90s cel-anime / visual-novel look, use the retro-anime skill instead; for a vintage explorer / adventure-serial / treasure-map / 16 mm film look, use the explorer-quest skill. Works without npm (Python + Edge only).
---

# Motion Graphics (Copilot house style)

Every video is **one HTML file that draws one SVG frame from a frame number**: `render(F)` is a pure function of `F`.
Motion is deterministic and scrubbable, then exported frame-by-frame to MP4. No npm / Remotion — everything
runs with Python (`pip install --user`) and the installed Edge browser.

**Always start from the reference implementation** in `template/` (copy into the new project folder):

| File | Purpose |
|---|---|
| `template/copilot-ai-human.html` | Full reference video: player, helpers, figure rig, Copilot mark, 9 scenes, audio engine, offline audio export |
| `template/microsoft-model-hub.html` | Second reference (53.5 s): **logo mascots** (real product icons as characters), fight scene, hub/network diagram, app-window mock-ups (chat, terminal, model picker), Work IQ radial diagram. See "Logo mascots & product explainers" |
| `template/microsoft-model-hub-PROMPT.md` | The consolidated build prompt plus the feedback rounds for that video. Use it as a model for writing briefs |
| `template/model-hub-mascots.png` / `model-hub-contact.jpg` | Mascot character sheet (4 kinds × 5 moods) and an 8-scene contact sheet. Show them to the user when proposing a style |
| `template/make_voice.py` | edge-tts voiceover generator → `voice.js` (`window.VOICE` = base64 MP3s). Keeps the longest of 3 takes (the service sometimes truncates). Also writes **`voice_timing.json`** + `voice_timing.js` (`window.VT`, per-word offsets) and prints `word@frame`. `python make_voice.py key1 key2` re-voices only those keys and merges them into the existing bundle (unknown keys abort) |
| `template/export_mp4.py` | Headless Edge (Python Playwright) → JPEG frames piped to imageio-ffmpeg + offline-rendered soundtrack → H.264/AAC MP4. Waits for `window.READY` when a page defines it, aborts on `window.ERR`, and prints `pageerror`s plus any error string `render(F)` returns |

For a retro arcade / 90s cel-anime look, skip this template and use the **retro-anime** skill (its own Canvas2D + CRT kit).
For a vintage explorer / adventure-serial look (16 mm film, parchment treasure map), use the **explorer-quest** skill (the retro-anime cel core with a film pass instead of the CRT).

Reuse the helper / rig / mark / audio sections verbatim; write new `sXxx(f, dur)` scene functions, a new `SCENES`
list, new `VO_CUES` / `SFX_CUES`, and new `LINES` in `make_voice.py`.

## Workflow

1. Agree the story as scenes (one idea + one headline per scene) and the voiceover line per scene.
2. Copy `template/*` into the project, strip old scenes, keep the engine.
3. Build scenes; verify stills via a local server (`python -m http.server 8765 --bind 127.0.0.1`, async) and
   Playwright `page.goto('http://127.0.0.1:8765/<file>.html?frame=N')` screenshots (`file://` is blocked).
4. `python make_voice.py` (or `python make_voice.py key1 key2` to re-voice just the changed lines); check each clip fits `(scene end − cue frame) / 30` s (MP3 bytes / 6000 ≈ seconds).
   If not, extend that scene's `dur` or move the cue earlier. **Sync pop-ins and SFX to spoken words:** an element's
   `at` = (cue offset in the scene + the word's frame from `voice_timing.json`) − 3…6 frames. When a line changes,
   re-run it and retime the `at` values; later scenes shift automatically through `SC(n)`.
5. Open in Edge for review (`Start-Process msedge "file:///…/x.html"`; click/Space to start with sound).
6. `pip install --user playwright imageio-ffmpeg` if missing, then `python export_mp4.py [in.html] [out.mp4]` (~3–6 min for 80 s).

## Canvas, palette, type

- 1920×1080 SVG at **30 fps**. Scene signature `sName(f, dur)` with local frame `f`; `SC(n)` = global start of scene n.
- `COL`: night `#0B0E1A` (+ faint 40px dot grid), parchment `#F1E6CF` (+ ink specks), light `#F3EFE6`, muted `#8C93AD`,
  gold `#FFC857`, teal `#2EC4B6`, red `#A23B2A`, pink `#F25C9C`, ink `#2B2118`.
- Contrast rule: **AI/machine = night + teal + MONO; human/creative = parchment + ink/red + SERIF italic.**
- Fonts: `SANS` Segoe UI Variable Display (headlines 64–104px, weight 600); subheads 30–34px weight 400 muted;
  `SERIF` Palatino (human voice); `MONO` Cascadia Code (prompts/terminals).
- Flat fills + clean strokes, custom character animation. **Not gradient-driven** — gradients only inside the Copilot mark.
  Glows = stacked low-opacity circles.

## Motion language (what makes it feel fluid)

- Timing primitives only: `prog(f,a,b,ease)`, `eio` (cubic in-out, default for moves), `eout` (arrivals/text), `ein`
  (exits), `eback` (small overshoot), `spring(frames,{damping:11–14,stiffness:160–170})` for logos/pop-ins.
- Nothing pops in: text uses `words()` (per-word 30px rise + fade, stagger 2–3 frames, 18-frame duration);
  lines/shapes draw on with `stroke(d,t)` (pathLength dash); objects travel along paths via `pointAt` / `partial`.
- Always some idle life on held frames: breathing/cloth `sway` (`Math.sin(f*.05)`), twinkling stars, logo sheen,
  drifting particles, companion bob. Never a dead-still frame.
- Deterministic randomness only (`rnd(i)` hash). No `Math.random()` in visuals. Audio noise (SFX bursts, crackle)
  may use `Math.random()` live, but `exportAudio()` seeds it (mulberry32, seed `0x5EED`, restored in `finally`) so
  every MP4 export carries the same soundtrack.
- **Reading holds:** after the last element lands, hold ≥ 2.5 s (`HOLD = 80` frames). Write durs as `base + HOLD`
  (adjust per scene, e.g. `+ HOLD - 30`) so pacing can be tuned globally.
- Exits are relative to `dur` (`prog(f, dur-30, dur-4)`), never hard-coded frames, so durations stay tweakable.

## Transitions (object-motivated, never generic crossfades)

- **Line → logo:** a line draws, collapses to centre, the mark springs out with a logo-coloured particle burst.
- **Staff strike:** staff glow charges → strike → gold shockwave; next scene is revealed inside a growing circle clip.
- **Arrow flight:** bow draw (IK) → release → arrow flies; its path/trail becomes the split-screen divider.
- **Blade clash/flash:** keep flashes dim, warm and short (≤ 0.5 opacity) — bright white reads harshly.
- **Scale-through:** outgoing group scales 1 → 1.08 while fading with `ein`; incoming rises with `eout`.
- **Walk-on/walk-off:** characters walk (`walk` gait) across a scrolling world into the next beat.
- When a scene previews the next one, render it with the **real** next length: `sNext(0, SCENES[i+1].dur)`
  (a stale length leaks end-of-scene effects such as the white flash).

## Character design (stick-figure rig `figure(o)`)

> For richer, fully drawn characters (pop-idol Copilot lead, Office-app dancers, Clippy, watercolour/boiling-ink look, beat-synced dance), use the **character-rig** skill (`~/.copilot/skills/character-rig`) instead of the stick-figure rig.

One rig for everyone; identity comes from **silhouette props and costume shapes**, not faces.
- Local space faces right, ground y=0; angles 0 = down, 90 = forward, 180 = up. Arms 34/32, legs 42/42, torso 62,
  head r=17, stroke 7, round caps/joins, flat-filled costume shapes layered `back → legs/arms → mid → cloak → head → over → front`.
- Options: `x,y,s,dir,color,kind,op,pose{lean,aSh,aEl,bSh,bEl,aHip,aKnee,bHip,bKnee,bob,head,aHand,bHand}`,
  `walk` (phase → full gait), `walkAmt`, `holdArm`, `sway` (cloth/hair lag), bow `aim`/`draw`/`arrow`,
  `saber{ang,len,c}` + `twoHand`, staff `glow`/`staffAng`, colours `robe/beard/hair/tunic`.
- Returns `{svg, pts}`; `pts` exposes world anchors (staffTop, staffBot, tip, hand, nock, head, aHand) to attach effects/transitions.
- Cast (add new `kind`s the same way):
  - `gandalf` — grey flared robe with swaying hem, rope belt, long white beard, tall crooked hat + wide brim, gnarled staff with a crook cradling a gold orb.
  - `legolas` — long blond hair flowing behind, green tunic + belt, pointed ear, quiver with red fletchings, recurve bow with IK draw.
  - `luke` — hair swoop, blue saber. `vader` — black helmet, swaying cape, red saber.
  - `hobbit` (curly hair ring), `dwarf` (helm, beard, axe), `writer` (quill).
- Choreography: keyframe arrays interpolated with `eio` (see `DUEL` + `duelPose`), `ik()` for hands on props.
- Scale for readability: heroes `s` 1.25–1.7. Recognisable at a glance > detail.
- Fan-reference characters (LOTR / Star Wars) are **internal use only**; use original archetypes (wizard, archer, knight) for external work.

## Logo mascots & product explainers (`microsoft-model-hub.html` learnings)

Use these when the video is about **products or brands**, e.g. Copilot vs Claude vs ChatGPT vs Gemini. Real icons
make the characters recognisable at a glance; see `template/model-hub-mascots.png`.

- **The product icon IS the body.** Draw the official vector path (Simple Icons 24×24 paths `P_CLAUDE`, `P_OPENAI`,
  `P_GEMINI`, `P_GHCP`, `P_ANTH`) with `logo(d,x,y,s,fill)`, then add stubby stroke legs with ellipse feet, `limb()`
  arms with round hands, blinking eyes with a highlight, brows and a mouth per mood.
  - `mascot(kind,x,y,s,F,{mood,look,sq,walk,arms,op,rot,seed,badge,dark})`
  - Moods: `happy`, `mad`, `sad`, `o`, `meh`.
  - `sq` squashes anchored at the feet. `badge` adds a `>_` terminal tag.
  - The `FACE` / `HIP` tables hold per-kind offsets.
- **Pick the exact icon the user means.**
  - Claude Code = the **pixel critter** (`critter()`: orange rects, `crispEdges`, square eyes, 4 stub legs, pixel
    moods with pink cheeks). It is not the Claude starburst.
  - GitHub Copilot = the **cat-eared** head. Its visor and eye pills already form a face, so add no extra eyes.
    Draw an ink underlay from the outline subpath so it reads on dark backgrounds.
  - Gemini = the 4-point sparkle with a blue→purple→rose gradient (`#gemG`). This is the one allowed gradient
    besides the Copilot mark.
  - Microsoft = the 4 squares `#F25022 #7FBA00 #00A4EF #FFB900`.
  - Lab colours: `LAB {claude:'#D97757', openai:'#74C7A8', gemini:'#8AB4F8'}`.
- **Use current product names and factual claims.**
  - Codex in the desktop app is labelled "ChatGPT Desktop".
  - Model names must be real (GPT-6 Sol, Claude Opus 5.5, Gemini 3.8 Flash).
  - Only put model badges on products that actually offer them.
  - When unsure, spawn a research session to fact-check before shipping.
- **Mock-up props:**
  - `win()`: macOS-style app window with light and dark variants, used for the chat, terminal and picker.
  - `cursor` + `track(f, keys)` + `pressed()`: a fake mouse that clicks dropdowns.
  - `typed(s,f,at,cps)`: type-on text for prompts or `/model` commands.
  - `lockIcon()`: shows a locked menu row that shakes on click.
  - `island()` and a glass `wall()`: "walled garden" islands. Split the wall into back and front arcs so the mascot
    sits inside it.
- **Fight scene recipe (`sFight`):**
  1. Fighters orbit a centre while rotating and flailing their arms.
  2. `dustCloud(f, front)` is drawn in two layers (back lobes, then fighters, then front lobes) so the fighters sit
     inside the cloud.
  3. Comic `burst(x,y,r,word,col,f,at)` stars appear (POW/BAM/ZAP/KRAK).
  4. The winner block falls with `ein` and speed lines, then squash-lands via `land()`.
  5. On impact: screen shake `22*exp(-(f-LAND)/7)`, a shockwave ellipse, dust puffs and a gold flash of ≤ 0.18.
  6. Losers are flung on a parabola with a 720° spin.
  7. The hero springs on top wearing a mark "crown", then the block glides to the next scene's hub position so the
     cut is continuous.
- **Hub / network:**
  - Islands sink and free their mascots.
  - Quadratic `labPath`/`cardPath` curves draw in with `stroke()`, and dots travel along them.
  - Product cards spring in on the spoken product names.
- **Radial "grounding" diagram (Work IQ):** a centre mark with a rotating text ring (`wiqRing` textPath) and
  nodes around it.
  - A prompt types into a chat window.
  - Answer lines fly along `quad()` curves from their source node, and that node glows.
  - Source chips appear under each answer line.
- **Headlines:** `lineParts()` draws mixed-colour headlines (the key words in gold, teal or brand colour) with
  `words()` timing per part.
- **Pacing:** the brief said 30–40 s; the final cut was 53.5 s. The user prefers an unhurried voiceover over a fast
  one, so lengthen `dur` rather than cramming.

## Copilot mark

`mark(cx,cy,size,t,spin)`: two interlocking 180°-symmetric ribbons (`CP_A` + `CP_FOLD`), blue→green→yellow and
peach→pink→purple, darker folds, gloss, periodic sheen (uses global `GF`), glow when size > 120. `t` 0→1: halves
slide together, outlines draw, fill, folds appear. `companion(x,y,size,F)` = small floating mark with a logo-coloured
trail — the on-screen AI guide. `CP_DEFS` is injected inside `<defs>` in `render()`. Stylised stand-in — use the
official brand asset for published/external work.

## Audio

See the `tts-voiceover` skill for voice selection, line writing and the FX chains in depth. Summary:

- Voices (`make_voice.py`, edge-tts → Microsoft online TTS): narrator `en-US-AndrewMultilingualNeural` −4%;
  wizard `en-GB-ThomasNeural` −22% −14Hz; dark lord `en-US-ChristopherNeural` −12% −24Hz.
- Pace with punctuation: commas / ellipses between list items ("think more... imagine more... and decide what matters,
  and what's next"). Avoid a lone word at a line end (odd pronunciation like "imagin-e").
- Spell out abbreviations: TTS reads "M365" as "M… 365", so write **"Microsoft 365"**. Check brand names by ear.
- FX chains: `narr` (dry + light reverb), `gandalf` (low shelf + hall reverb), `vader` (highpass, 180 Hz peak,
  gentle tanh, 7 ms comb, 2.8 kHz presence — intelligibility first).
- SFX are synthesised in `sfx(name)` (no asset files): chime, charge, boom, breath, ignite, saber hum, clash, lock,
  flash, scratch, creak, twang, thunk. New effects must use `t = AU.at ?? ctx.currentTime + .01` so they work live and offline.
- Cues: `VO_CUES [clip, globalFrame, chain]`, `SFX_CUES [globalFrame, name]`, `HUM [start, end]`. Sync SFX to the visual beat
  (release frame, impact frame), not to scene starts.
- `exportAudio()` replays all cues through an `OfflineAudioContext` → WAV (used by the MP4 export). It swaps in a
  seeded `Math.random` for the render and restores the original in `finally`. Chromium still varies by ±1 LSB per
  run, so compare peaks/levels between exports, not file hashes.

## Player conventions

`?frame=N` renders a clean still; the default load shows a click-to-play overlay (browser autoplay rule). Keys: Space,
R restart, M mute, H hide HUD. Keep `render`, `TOTAL`, `FPS`, `exportAudio` global — `export_mp4.py` depends on them.

## Music-video / Canvas mode (Copilot Pop "P(doom)" learnings)

Use this for a song-driven video (a parody music video, lyric video or beat-synced piece). Don't use the SVG explainer player for it. Build it with the **character-rig** Canvas engine: watercolour/boiling ink, full chibi cast, karaoke lyrics, and scene/transition helpers.

For any change to the song itself (removing a lyric, shortening, fixing a click), use **audio-edit**.
- **Beat grid first.** `BEAT = 60/BPM` and first downbeat `B0`. Put scene starts, transitions, camera punches and dance hits on beats or bars. Karaoke words come from `WT(i,k)`.
- **Transitions:** use the tear, splat, ink wipe and iris wipes (`TR`/`WP`), and motivate them by an object or beat.
  - Change scene on the bar line.
  - After an audio cut, put the transition exactly on the splice.
- **Light continuity:** never flash bright white into a dark scene (such as the Vader/space shot). Use a dark tear or a dim warm flash of ≤ 0.35 opacity.
- **Pacing:**
  - Reading holds are about 2.5 s.
  - If a scene "hangs", trim 1–2 s from its tail rather than speeding up the motion.
  - Every held frame needs idle life (boil, bob, particles).
- **Menace stays cute:** the "scary AI" beat is a chibi with glowing red (shini) eyes and a slow camera push-in, not a realistic face.
  - Prefer full-body characters to close-up faces.
  - Don't draw circles at the joints (shoulders, elbows, ankles). Use tapered capsules and bends.
- **Brand flavour:** include Microsoft easter eggs (Clippy, Office app icons, Excel instead of Xbox, BSOD, Paint, Windows XP hill).
  - Credit line: "Made with GitHub Copilot and Opus 5.5".
- **Lyric removal:**
  - Cut whole bars in the audio (audio-edit).
  - Add `[start, len]` to `CUTS` so `SRC(t)` remaps time.
  - Hide the lines via `HIDE`, and drop the scenes that illustrated them.
  - Don't retime anything else.
- **QA loop:**
  - Make contact sheets or stills at every scene boundary and splice with `stills.py`.
  - Fix anything that reads as too long, too bright or unclear, then run `export.py`. It exits 1 even on success, so check the MP4 with ffprobe.
- **Voice lessons (explainers):**
  - Vader-style voices need a 2.8 kHz presence boost.
  - Force pauses with commas ("think more, imagine more, and decide what matters, and what's next").
  - Never leave a stranded end word, which caused "imagin-e" and "decid-e".

## Story explainer with a cast (Sofia "Copilot Quest Ep1" learnings)

For a narrative explainer with real-person characters (return-to-work, a day in the life, a before/after with Copilot), use the **character-rig** Canvas engine plus its `assets/office.js` kit rather than SVG stick figures. Reference project: a ~93 s watercolour return-to-work story built with the character-rig engine.
- **Structure:**
  1. Establish the time away with a short travel montage (postcards, stamps, landmarks).
  2. Show the overload: inbox count spinning up, a clashing calendar, Teams pings, colleagues ahead of her.
  3. While she's overwhelmed, a thought-bubble daydream of the holiday (beach lounger, cocktail, sun). The user loved this beat.
  4. Copilot turns up and fixes each pain in turn (summarise and prioritise mail, untangle meetings, a 6-month catch-up, draft a deck).
  5. Finish with a confident ending card.
- **Characters drive the beats.** Let the hero say the story turn in her own voice ("Oh great, a Copilot session tomorrow, let's learn about that"). Don't leave it to a narrator aside.
- **Staging:** seat colleagues at desks with monitors and laptops, chatting about the Copilot they use. Don't stand them in a row in front of a desk.
- **Wardrobe and rig:** for office characters use `soft:true` (no puffy shoulders) and `shoe:true` (low shoes under trousers). Change outfits to suit the setting, e.g. a swimsuit on the beach. Copilot tees (`cpTee`) brand the colleagues.
- **Wording:** write "Microsoft 365 Copilot" in full on screen, never "M365".
- **Gamification** (XP pops, badges, quest stickies) makes "learning Copilot" feel like progress. Keep it light.

## Retro arcade / 90s cel-anime look

For a pre-2000s look (arcade attract screens, 90s TV anime, PC-98 visual novels, CRT/VHS), use the **retro-anime** skill.
It has its own Canvas2D pixel engine with a WebGL CRT pass, a cel-anime heroine and cast, a pixel font, VN and Win9x HUD
widgets, a chiptune score and QA tools, all in `retro-anime/kit/`. The reference project is `sofia-retro/` in the
ai-video-creation-guide repo (Copilot Quest Ep.1, 89.5 s). Don't fake the look with CSS filters on the SVG player. The story structure,
pacing, voiceover workflow and house rules above still apply.

## Explorer / adventure-serial look

For a vintage explorer look (a 1930s-40s adventure serial, treasure maps, sepia and gold, old 16 mm film), use the
**explorer-quest** skill. Its kit in `explorer-quest/kit/` reuses the retro-anime cel core and swaps the CRT for a 16 mm
film pass (grain, gate weave, flicker, dust, light leaks, warm grade). It adds a Natural Earth parchment map with a dotted
route, pins, stamps and polaroids; an explorer heroine (the fedora is split into back and front pieces so the head sits
inside it, plus a satchel and a brass compass whose face is the Copilot mark); gold extruded title slams; iris-on-pin,
dissolve, film-burn and dip-to-black transitions; and an original modal adventure score. The reference project is
`examples/sofia-explorer/` in the ai-video-creation-guide repo ("The Great Copilot Quest", Chapter One opening, 26 s review cut). Evoke the genre
only: no franchise music, logos, fonts or likenesses. Put captions on bars with a dark stroke, hold each beat for at
least 4 s, and make a review cut first.

## Gotchas

- npm is blocked by Defender — never depend on it. `pip --user` works; Python Playwright uses `channel="msedge"`.
- Edit large HTML with PowerShell `[IO.File]::ReadAllText` / `.Replace` / `WriteAllText` using single-line anchors; check each anchor exists.
- `DEFS` is defined before `CP_DEFS`; combine them in `render()`.
- Write git commit messages to a temp file **without a BOM** (`[IO.File]::WriteAllText($f, $msg, (New-Object Text.UTF8Encoding $false))`,
  then `git commit -F $f`); PowerShell 5.1's `Set-Content -Encoding utf8` adds a BOM that shows up in the subject line.
- In PowerShell 5.1, `python x.py 2>&1` reports failure whenever the script writes anything to stderr (progress
  bars, warnings) even though it exited 0 — check `$LASTEXITCODE` and the output files instead of `$?`.
- `functools.partial(SimpleHTTPRequestHandler, directory=...)` can't be quietened by assigning `.log_message` to the
  partial (the attribute lands on the partial, not the class). Subclass the handler and pass `directory` in `__init__`.

## Sync check

Before export (and after any retime or audio edit) run the **av-sync** skill: `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <video>.html`. It checks VO fit, SFX-on-impact, beats, lyric splices and clipping against these rules and prints frame-exact fixes.
