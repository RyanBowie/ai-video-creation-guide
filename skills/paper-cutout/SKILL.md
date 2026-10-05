---
name: paper-cutout
description: Make paper-cutout / Paper Mario-style videos as a code-drawn paper theatre. A Canvas2D engine (1920x1080, 30 fps) draws torn-edge cut paper pieces with drop shadows, fibre texture and a 6 fps boil, sticker sheets with a white paper border, card flips, pop-up-book folds, sticker lettering and a warm grade. Includes a paper cast (office hero Pip, the Microsoft 365 Copilot buddy, Inbox Goblin, Meeting Clash, Clippy cameo), a proscenium with velvet curtains, footlights and an audience row, sets (storybook sky, pop-up office, night city), a turn-based RPG battle kit (HP plate, command-block menu with glove cursor, action-command key, damage numbers, EXCELLENT stamp, enemies folding into paper planes, VICTORY quest report, LEVEL UP), a page-turn transition, a curtain call, synthesised paper SFX and a bouncy score, then MP4 export. Use when the user asks for a paper, paper-cutout, papercraft, cardboard, Paper Mario, storybook, pop-up book, paper theatre, puppet show, diorama, sticker or RPG-battle look, or mentions papermotion. Kit in kit/ (reference project Paper Copilot "The Inbox Quest", 30 s). Pairs with tts-voiceover, av-sync and audio-edit. Works without npm (Python + Edge only).
---

# Paper-cutout / Paper Mario videos

A code-driven engine for short videos that look like cut paper on a little theatre stage. It is inspired by
[francozanardi/papermotion](https://github.com/francozanardi/papermotion) and the Paper Mario games, and was written
from scratch in plain Canvas2D (no papermotion code, no npm).

The pieces:
- **Cut paper**: every shape is a torn-edge piece with a soft offset drop shadow, rim light and core shadow, a fibre
  texture and a pale cut edge. The edge re-cuts every 4 frames, so the paper "boils" like stop-motion.
- **Sticker sheets**: characters, props and text are drawn flat and then get a white paper border and a shadow.
  Squash the sheet's x scale through zero and it flips like a card, showing its plain paper back.
- **Paper theatre**: red velvet curtains, a swag pelmet with a Copilot medallion, footlights, a floor lip and an
  audience silhouette row frame every shot.
- **Game grammar**: Paper Mario's battle UI (command blocks, action commands, stamps, quest report, level up)
  turns "Copilot helps you" into a fight you win.

| Want | Use |
|---|---|
| Flat-vector explainer, stick figures, SVG player | **motion-graphics** |
| Watercolour/boiling-ink characters, music video, lyric sync | **character-rig** |
| Retro arcade, 90s anime, pixel, CRT/VHS, visual novel | **retro-anime** |
| Paper cutout, papercraft, Paper Mario, pop-up book, paper theatre, sticker/RPG battle | **this skill** |

The story, pacing, VO workflow and house rules from motion-graphics still apply. Don't fake the look with CSS
filters or a texture overlay on another engine. The torn edges, the white sticker border and the per-piece shadows
are what sell it.

**Reference project:** *Paper Copilot, Chapter 1: The Inbox Quest* (`examples/paper-copilot/` in this repo, 30 s, 900 frames,
`paper-copilot.mp4`). Pip opens a 999+ inbox on Monday morning. The envelope bursts into an Inbox Goblin, a page turns
into a paper-theatre RPG battle, Pip calls Microsoft 365 Copilot as his partner, and they win: inbox zero, meetings
sorted, +3 hours, LEVEL UP. `kit\` is that project verbatim (minus the MP4). `kit\PROMPT.md` records the brief,
beats, VO and lessons.

## Quick start

1. **Copy the kit.**
   - Run `Copy-Item -Recurse "$env:USERPROFILE\.copilot\skills\paper-cutout\kit" <project>`.
   - If you rename `paper-copilot.html`, update `export.py`: the `pg.goto(...)` page name (L35) and the default
     output name (L13).
2. **Pitch 2–3 concepts** before building (see [Story recipes](#story-recipes)). One clear pain becomes a
   villain, Copilot becomes the partner, and the win is a stamped, numbered result.
3. **Write the script up front** in `make_voice.py` `LINES`, one clip per beat.
   - Run `pip install --user edge-tts imageio-ffmpeg numpy playwright`, then `python make_voice.py`.
   - It writes `voice.js` and `voice_timing.js/.json`, trims each clip's trailing silence, and prints `word@frame`.
     Place pops, hits and stamps from those numbers.
   - `python make_voice.py key1 key2` re-voices just those clips. `python make_voice.py --trim` re-trims existing ones.
4. **Lay out the timeline:** `TOTAL`, `SCENE_T` and `SYNC` in `finale.js`, `VO_CUES` and `SFX_CUES` in `audio.js`
   (see [Contracts](#contracts)).
5. **Build the layers:** sets in `sets.js`, cast in `chars.js`, act scenes in `scenes.js` / `battle.js` /
   `finale.js`. Compose them in `render(F)` in `finale.js`. Then re-score `SCORE` in `audio.js` to the new beats.
6. **QA:**
   - Run `python export.py --stills 30 140 300 450 600 800`. It writes `stills\fNNNN.jpg` and prints JS errors per
     frame. Check every scene boundary and every layout change. Give the stills to a fresh-eyes subagent.
   - Run `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <page>.html` and get 0 FAIL.
7. **Export:** `python export.py` writes `<page>.mp4` (about 150 s for 30 s). Check it with ffprobe and pull a contact
   sheet before shipping.

To preview, open the page in Edge from disk. Click or Space to play, R to restart, M to mute, H to hide the bar.
`?clean` hides the player UI.

## Kit

| File | What |
|---|---|
| `paper-copilot.html` | The page. Loads `voice.js`, `voice_timing.js`, `paper.js`, `chars.js`, `sets.js`, `scenes.js`, `battle.js`, `finale.js`, `audio.js` in that order. Sets `window.READY`; collects errors in `window.ERR`. |
| `paper.js` | The paper engine: noise, easing, textures, torn paths, `piece`, `sheet`, `popup`, ink helpers, sticker text, camera, shake, `grade`. |
| `chars.js` | Cast rigs: `cpMark`, `pip`, `buddy`, `goblin`, `clash`, `clippy`, and props (`envelope`, `plane`, `star`, `heart`, `summaryCard`). |
| `sets.js` | Theatre and backdrops: `stageFloor`, `skyWorld`, `officeSet`, `inboxScreen`, `nightSet`, `daySet`, `footlights`, `audience`, `velvet`, `curtains`, `proscenium`. |
| `scenes.js` | Act 1: placement wrappers (`pipAt`, `buddyAt`, `goblinAt`, `clashAt`), `bang`, `starBurst`, `introLayer`, `officeLayer`, `pageTurn`. |
| `battle.js` | Act 2: `hud`, `volley`, `commandMenu`, `keycap`, `attack`, `enemy`, `battleChars`, `victory`, `battleLayer`. |
| `finale.js` | `TOTAL`, `SCENE_T`, `SYNC`, `PUNCH`, `SHAKES`, `cam`, the curtain call (`endSign`, `endCast`, `endCredit`) and `render(F)`. |
| `audio.js` | `VO_CUES`, `SFX_CUES`, the `SCORE` builder, `sfx(name)`, `exportAudio()`, and the player loop and keys. |
| `make_voice.py` | edge-tts → `voice.js` (base64 MP3s) + `voice_timing.js/.json`. Trims trailing silence. |
| `export.py` | Headless Edge via Playwright → JPEG frames → imageio-ffmpeg H.264 + the offline soundtrack. `--stills N…` for QA. |
| `PROMPT.md` | The consolidated build prompt, file map, run commands and lessons. |
| `voice.js`, `voice_timing.*` | The reference VO. Regenerate them for a new script. Never grep `voice.js`; it is a huge base64 blob. |

Keep each JS file under about 250 lines. When a file grows, split it by act like the kit does.

## The paper engine (`paper.js`)

Globals: `W = 1920`, `H = 1080`, `FPS = 30`, `INK = '#2A1E2E'`, `PAPER = '#FFFDF7'`, `FONT` (Segoe UI Black).
`X` is the current 2D context and `GF` the current global frame. Every helper draws into `X`, so you can point `X`
at an offscreen canvas and reuse any layer (that is how `pageTurn` works).

**Determinism.** Never use `Math.random` in visuals.
- `pmHash(n)` gives a 0..1 hash, `pmNoise(x)` smooth −1..1 value noise, and `pmRng(seed)` a seeded generator.
- Textures (`fibre`, `grain`) are generated once at boot by `makeTextures()`; `pat(ctx, name)` returns the pattern.

**Timing.** `clamp`, `lerp`, `prog(F, a, b)`, `eOut`, `eIn`, `eIO`, `eBack` (overshoot), `eElastic`.
- `popK(F, a, d = 12)`: a 0→1 pop-in scale with overshoot. Use it for every sticker arrival.
- `hop(F, a, d, h)`: a single sine arc. Use it for jumps, knock-backs and sign bounces.

**Shapes.**
- `rectPts`, `ellPts`, `rrPts` make point lists, and `bbox(pts)` measures them.
- `tornPath(pts, tear = 2.2, seed, step = 6)` resamples the outline by arc length and pushes it out along the normal
  by layered noise. It re-cuts every 4 frames (3 variants), which is the paper boil.

**`piece(pts, o)`**: one cut paper piece. Use it for scenery, curtains, desks and floors.
- `o.fill`: a colour or a function returning a gradient.
- `o.tear`, `o.seed`: edge roughness and variant.
- `o.deco(bbox)`: paint details inside the clip (windows, stripes, folds).
- `o.shadow:false`, `o.rim:false`, `o.tex:false`, `o.edge:false` switch off the drop shadow, rim/core light, fibre
  texture and pale cut edge. `o.shCol`, `o.blur`, `o.shx`, `o.shy` tune the shadow.

**`sheet(w, h, ox, oy, fn, o)`**: a sticker. `fn()` draws flat art into a `w×h` scratch canvas with its origin at
`(ox, oy)`. The sheet dilates the silhouette into a white paper border, multiplies the fibre texture and draws it
with a drop shadow.
- `o.x`, `o.y`, `o.rot`, `o.s` place it. `o.sx`, `o.sy` scale it on one axis.
- **Card flip:** set `o.sx = Math.cos(angle)`. Below zero the plain paper back shows (`#EDE4D3`). Pass
  `o.back:false` to mirror a character without showing the back.
- `o.border` (default 9 px), `o.paper` (border colour), `o.alpha`, `o.shadow:false`.
- Size the scratch to fit the art plus the border. Each size gets a pool of 3 scratch canvases, so reuse sizes.

**`popup(k, baseY, fn)`**: pop-up-book scenery that stands up from a hinge at `baseY` as `k` goes 0→1 (a y-scale
about the hinge, capped at 1.08). Drive `k` with `eBack` so it overshoots slightly, like card stock springing up.

**Ink helpers** (use inside sheets): `shape(build, fill, {sw, ink})` fills and outlines with round joins, using the
builders `circ`, `ell`, `rr`, `poly`. Also `lgr` and `rgr` gradients and `line`. Outline everything in `INK` at
about 4.5 px. That flat fill plus dark outline is the Paper Mario sticker look.

**Text.**
- `txt(str, x, y, size, fill, {stroke, sw, align, weight})`: plain canvas text.
- `stickerText(str, x, y, size, {fill, stroke, sw, rot, s, sx, sy, alpha, border})`: cut-out lettering with an ink
  outline and a white paper border. `fill` may be a function returning a gradient centred on 0,0.
- Write "Microsoft 365 Copilot" in full. Keep text fills simple and bright; a multi-colour "365" gradient read as
  muddy on cream paper, so use a flat colour.

**Camera and finish.**
- `camera({x, y, z, r})` wraps the whole stage. `shake(F, a, d, amp)` returns a decaying noise offset.
- In the kit, `cam(F)` combines a slow breathing zoom, `PUNCH` (`[frame, zoomAmount]` push-ins on big beats) and
  `SHAKES` (`[frame, duration, amplitude]`).
- `grade(F)` runs last: a warm soft-light wash, a vignette and a per-frame film grain.

## Cast (`chars.js`)

All characters are flat paper parts drawn with `shape()` inside a sheet, feet or centre at the origin.

| Rig | What | Options |
|---|---|---|
| `pip(F, o)` | Office hero: cowlick, blue shirt, lanyard badge, mug. Feet at 0,0, about 360 tall. | `expr` (`smile`, `worried`, `grin`, `shock`), `walk` (phase), `armL`, `armR`, `mug`, `sweat`, `tilt` |
| `buddy(F, o)` | Microsoft 365 Copilot partner: the mark with eyes, blush and a hover bob. Centred. | `size`, `happy` |
| `goblin(F, o)` | Inbox Goblin: an angry envelope with fangs and a 999+ badge. Centred. | `count`, `dizzy`, `hurt`. Tamed = no fangs. |
| `clash(F, o)` | Meeting Clash: a calendar with binder-ring horns and overlapping meeting blocks. | `tidy` 0→1 slides the blocks into a neat row |
| `clippy(F, o)` | Clippy cameo, hidden in the audience. | |
| `cpMark(size)` | The Copilot mark (`CP_A` + `CP_FOLD` paths, warm and cool halves). Stylised stand-in; use the official asset for external work. | |
| props | `envelope`, `plane`, `star`, `heart`, `summaryCard` | |

Placement wrappers in `scenes.js` put each rig in a correctly sized sheet, e.g. `pipAt(F, x, y, o, s = .85, flip = 1)`
and `buddyAt(F, x, y, o, s, sx)`, plus `goblinAt` and `clashAt`. Add a wrapper for every new rig.

**Character design rules.**
- Big readable silhouettes, chunky limbs, round heads and dot eyes with a highlight. Blink on a schedule
  (`(F % 97) < 4`), never randomly.
- Personify the pain as a cute, flat object (an envelope, a calendar, a spinner). It gets fangs, angry brows and a
  number badge. When beaten it is **tamed, not destroyed**: fangs gone, dizzy eyes, then it folds into a paper plane
  and flies off.
- Copilot is the partner, never the hero. The human presses the button and gets the win.
- Motion is puppet motion: hops, squashes, tilts, card flips and slides. No smooth 3D turns.
- Give every held frame idle life: hover bob, breathing sway, blinks and boiling edges.

## Theatre and sets (`sets.js`)

- `FLOOR = 860`, `L0 = 150`, `R0 = 1770`, `TOP = 108` are the stage bounds inside the proscenium.
- `stageFloor(F)`: planks and the front lip.
- `skyWorld(F)`: storybook sky with clouds, hills and sun (the title and victory backdrop).
- `officeSet(F, k, screen, behind)`: the pop-up office diorama. `k` is the pop-up amount.
  `inboxScreen(F, lit, count, shakeAmt)` draws the monitor content with a spinning counter.
- `nightSet(F)`: night city skyline for the battle. `daySet(F)` for the victory.
- `curtains(open)`: the main drapes, `open` 0..1. `velvet(pts, seed, folds, light)` builds the folds.
- `proscenium(F)`: the swag valance with the gold Copilot medallion and the side legs. Draw it **last** so it frames
  everything.
- `footlights(F, on)` and `audience(F, cheer)`: the silhouette row sits in front of the stage, with Clippy in the
  crowd. `cheer` 0..1 raises arms.

**Draw order** in `render(F)`: floor, the act layers, curtains, curtain-call sign and cast, footlights, audience,
credit, proscenium, then `grade()`. Draw the credit **in front of** the audience row or the heads cover it.

## Transitions (object-motivated, never crossfades)

- **Curtain rise / close:** opens the show and closes it into the curtain call.
- **Pop-up fold:** a set stands up out of the book (`popup` with `eBack`), or folds flat to leave.
- **Page turn:** `pageTurn(F)` draws the outgoing layer into an offscreen canvas `PAGE` (swap `X`), then swings it on
  a hinge at the stage's left edge, with `cos` scaling, a fold shadow and the paper back, to reveal the next set.
  Put a `paperflip` SFX on the start frame and a `thunk` when it lands.
- **Card flip:** characters and signs turn around by squashing `sx` through zero.
- **Burst-out:** a prop explodes out of a set (the envelope bursting from the monitor) with a `boom` and a shake.
- **Fold into a plane:** a beaten enemy folds into a paper plane and flies off stage.
- Flashes stay dim and warm (≤ 0.5 opacity).

## RPG battle kit (`battle.js`)

The Paper Mario battle grammar, timed by frame constants at the top of the file:
- **HP plate** (`hud`): drops in, shows hearts and HP, and floats damage numbers on each hit (`HITS`, `DMG`).
- **Enemy volley** (`volley`): projectiles launch at `VOLLEY` frames and land at `HITS` frames. Pip knocks back
  with `hop`, and the screen shakes per `SHAKES`.
- **Command menu** (`commandMenu`): three `?` blocks (`MENU`: JUMP / COFFEE / COPILOT) above the hero. A glove cursor
  steps between them on `MSEL` frames, the selected name pops as sticker text, and the confirm press folds the menu
  away. Each move gets a `select` SFX and the confirm gets `confirm`.
- **Partner joins:** Copilot card-flips in with a banner.
- **Action command** (`keycap`): a Copilot key with a shrinking timing ring. On the press frame the attack fires with
  a `key` SFX, a punch-in and a shake.
- **Attack** (`attack`): summary cards fly to the goblin and the meeting blocks tidy into a row.
- **Stamp:** a rotated "EXCELLENT!" sticker slams in with `popK`, a shake and a `stamp` SFX on the **landing** frame.
- **Enemies leave** (`enemy`): dizzy, then they fold (`fold` SFX) into paper planes and fly off.
- **Victory** (`victory`): a VICTORY sticker, deterministic confetti, and a quest-report card whose rows pop in with a
  `click` each (inbox 999+ → 0, meetings sorted, +3 hours back), then a LEVEL UP stamp with the `levelup` jingle.

Keep the HUD, the menu and the banners in **separate screen zones** (HP top-left, menu above the hero, banners top
centre, stamps centre-right). Overlaps were the main layout bug in the reference build.

## Curtain call (`finale.js`)

The curtains close. A hanging sign drops on two ropes (`endSign`), lands with a bounce and swings. It shows the
Copilot mark and "Microsoft 365 Copilot". Pip and Copilot pop in front of the curtain and wave (`endCast`), the
audience cheers, then the tagline and the credit pop in. The credit is "Made with GitHub Copilot and Opus 5.5".

## Audio (`audio.js`)

- **VO:** edge-tts narrator `en-US-AndrewMultilingualNeural` at +4%. Spell out "Microsoft three-sixty-five" so the TTS
  says it properly. Use ellipses for timing ("Call in a partner... Copilot!"). See **tts-voiceover** for more voices
  and character FX.
- **SFX:** synthesised in `sfx(name)` with no asset files. Available: `chime`, `pop`, `click`, `select`, `confirm`,
  `type`, `sip`, `paperflip`, `fold`, `rustle`, `thunk`, `stamp`, `hit`, `whoosh`, `rumble`, `boom`, `ring`, `key`,
  `sparkle`, `levelup`, `cheer`. New effects must start at `t = AU.at ?? ctx.currentTime + .01` so they work live
  and offline.
- **Paper sounds sell the look:** a `rustle` when the curtains move, a `paperflip` on every flip or page turn, a
  `fold` when anything folds, and a `pop` on every sticker arrival.
- **Score:** `SCORE` is a list of `[frame, midi, lenFrames, instrument, velocity]` built with `bouncy()` and `drive()`
  phrases at 120 bpm (15 frames a beat). Instruments: `box` (music box), `pad`, `bass`, `pluck`, `whistle`, `lead`,
  `brass`, `kick`, `hat`. The reference arc is a music-box title, a whistled office tune, tension as the goblin appears, a
  driving battle groove, a hero theme when Copilot joins, a victory fanfare and a curtain-call reprise. The music is
  ducked under the VO.
- `exportAudio()` renders everything through an `OfflineAudioContext`, with `Math.random` seeded (`0x5EED`) and
  restored afterwards, so every export has the same soundtrack.

## Contracts

`render(F)`, `TOTAL`, `FPS`, `exportAudio`, `window.READY` and `window.ERR` are used by `export.py`. av_check needs
these globals:

```js
const TOTAL = 900;                       // finale.js
const SCENE_T = [['intro', 0], …];       // [name, startSeconds]
const SYNC = [[54, 'intro', 'Inbox'], …]; // [visualFrame, voKey, spokenWord]
const VO_CUES = [['intro', 22, 'narr'], …]; // audio.js: [voKey, globalFrame, chain]
const SFX_CUES = [[8, 'rustle'], …];     // [globalFrame, sfxName]
```

There must be **no `SCENES` global** (av_check would treat the page as an SVG explainer). Scene layers overlap
during transitions; each layer gates itself on `F` inside `render`.

## Story recipes

Tell a 20–40 s story in game grammar:

1. **Chapter card:** the curtain rises on "Chapter 1: The <Pain> Quest" with the Microsoft 365 Copilot logo.
2. **Normal world:** the hero at work in a pop-up set, with a little idle business (a mug, a wave, a click).
3. **The pain attacks:** a counter spins up (999+), the prop bursts out and becomes the villain.
4. **Transition into battle:** a page turn or a backdrop flip.
5. **Battle:** the villain hits (HP drops), the hero opens the command menu, tries the obvious moves, then picks
   COPILOT. The partner joins, the hero presses the action command, the attack lands and "EXCELLENT!" stamps.
6. **Victory:** a quest report with concrete numbers (items cleared, meetings fixed, hours back), then LEVEL UP.
7. **Curtain call:** the sign, the bow, the tagline and the credit.

Other villains that fit: the Meeting Clash calendar, a Spreadsheet Slime (Excel), a Deck Dragon (PowerPoint), a
Notification Swarm (Teams), a Doc Hydra (endless version copies). For a series, number the chapters and keep Pip and
the stage the same.

## Lessons and gotchas

- **Trim the VO.** edge-tts pads each clip with about 0.35 s of silence, so av_check reported VO overrunning scene
  ends. `make_voice.py` trims to the last audible sample plus 0.06 s with a 0.04 s fade.
- **Grain inflates x264.** The fibre texture and film grain are high-frequency detail. crf 18 gave about 40 Mb/s and
  a 150 MB file for 30 s. `-preset slow -crf 22` gives about 29 MB with no visible loss. Don't use `-tune grain`; it
  makes the file bigger.
- **Move VO cues 4–5 frames earlier** than the visual beat so the key word lands on it; check with av_check `SYNC`.
- **Separate screen zones** for HUD, menus, banners and stamps, and re-check stills after every layout change.
- **SFX on the impact frame.** Put the stamp sound on the landing frame, not the fly-in. The remaining av_check WARNs
  (stamp fly-in, a click near a jump) are fine when the sound sits on the landing.
- **Tamed villains** lose their fangs. It keeps the tone friendly and makes the win read at a glance.
- **Credit in front of the audience row**, or the silhouettes cover it.
- **Sheets are not free.** Each `sheet()` call composites several scratch canvases. Use them for characters, props
  and text, but draw dense particles (confetti, sparkles) with plain `shape()` calls.
- **Page turns need the real layer.** Render the outgoing scene into an offscreen canvas by swapping `X`, so the
  turning page is pixel-identical to the frame before.
- **Determinism:** no `Math.random`, no `Date.now()` in visuals. Exports and stills must match frame for frame.
- **Windows:** in PowerShell 5.1, Python stderr shows up as errors even on success, so check `$LASTEXITCODE` and the
  output file. Write commit messages without a BOM.

## Credits

The look is inspired by francozanardi/papermotion (paper-cutout animated shorts made in code by AI agents) and by
Nintendo's Paper Mario. Paper Mario is a Nintendo trademark. Borrow the style ideas (paper, stickers, theatre, battle
grammar), never its characters, assets or names, in published work. The Copilot mark here is a stylised stand-in;
use the official brand asset for external work.
