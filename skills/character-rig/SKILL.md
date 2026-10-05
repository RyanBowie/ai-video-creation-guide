---
name: character-rig
description: Rigged, code-drawn cartoon characters and visuals in a papery watercolour and boiling-ink Canvas2D style, plus a beat-synced music-video scene engine. The cast has a Copilot pop-idol lead, Word/Excel/PowerPoint/Teams dancers, Clippy, a shoggoth, critters, props and Microsoft easter eggs (BSOD, Bliss, Solitaire, Minesweeper). The engine has scenes, tear/splat/wipe transitions, lyric karaoke, camera punches, word pops, contact sheets and MP4 export. Use when the user wants a character, cast, character sheet, mascot, pop idol, "upgrade the stick figures", dancing characters, Microsoft/Office references, a music or lyric video, an office or return-to-work story with colleagues at desks (office.js has Outlook/Teams UI), or consistent character design across videos. Pairs with motion-graphics (story craft) and audio-edit (song cuts). For other looks use retro-anime (90s cel-anime heroine or cast) or explorer-quest (fedora-and-compass explorer, adventure serial).
---

# Character rig and music-video engine (watercolour / boiling-ink)

A dependency-free Canvas2D rig. Every frame is a **pure function of time T**, so any frame can be rendered on its own for stills, QA sheets and deterministic MP4 export. It was built for "Copilot Pop - I'm Upping My P(doom)", a Copilot parody of JohnHeibel/PDoomVideo. Reuse it to keep characters, props and motion consistent.

## Files (`assets/`)
| file | what |
|---|---|
| `core.js` | engine: canvas setup, palette `PAL`, paper texture, grain, boil, watercolour `paint`, `ink`, `letters`, geometry, easing, `seg` |
| `cast.js` | `mark()` (M365 Copilot logo), `LOOKS`, `person()`, eyes/mouths/hands/hair, `appTile`, `clippy`, `shoggoth`, `laptop`, `sheetProp` |
| `dance.js` | `DP` dance-pose library, `dance(T,off)`, `RUN` + `run(T)`, `blendPose` |
| `fx.js` | beat grid, `LYR` lyrics + `HIDE` + `karaoke`, `cam`/`punch`/`shake`/`kick`, `wpop`/`stamp` word pops, gradients, `layer`+`composite` transitions, backgrounds, small fx props |
| `props.js` | critters (`gato`, `chinchilla`, `basilisk`) and objects (`bomb`, `crystalBall`, `fence`, `atom`, `rocket`, `moon`, `stockChart`, `curtains`, `spotlight`) |
| `msx.js` | Microsoft easter eggs (see the catalogue below) |
| `office.js` | return-to-work / office explainer kit (`sf*`, from "Copilot Quest Ep1"): office set, desks with devices, Outlook/Teams UI, bubbles and thought clouds, gamified XP/badges, holiday and travel props, `sfTalk`/`sfIdle`/`sfWalk`/`sfBlink`. Sample LOOKS: `sofia`, `sofiaBeach`, `raj`, `maya`, `leo`. Load after core, cast, dance, fx |
| `timeline.js` | template: scene list `SC` + `draw(T)` with transitions, karaoke and grain |
| `scenes_a.js` | starter scene `sIntro` (render: `demo_musicvideo.png`) |
| `example_scenes.js` | real P(doom) scenes to copy patterns from (dancers, pops, cameras, props) |
| `video.html` | music-video player: load order, `CUTS`/`SRC()` time remap, `render(F)`, click to play |
| `stills.py` | `python stills.py 3 12.5 40` renders frames at OUTPUT times to `stills/`, plus the contact sheet `stills/sheet.jpg` |
| `export.py` | frame-exact MP4: headless Edge renders `render(F)`, ffmpeg encodes x264 crf 18, muxes `song.mp3` + AAC 192k with a 1.2 s fade-out |
| `demo.html` / `render_still.py` | character-sheet demo (`demo.html?t=1.3`) and one-frame PNG render |
| fonts | none bundled. `PMarker` (titles, `MARKER`) and `Shantell` (hand, `HAND`) are `@font-face` aliases for Windows system fonts (`local("Ink Free")`, `local("Segoe Print")`, with Comic Sans as a fallback) |

**Retro / 90s cel-anime look:** this watercolour rig doesn't do it. Use the **retro-anime** skill and its cel rig in
`retro-anime/kit/`: `heroine.js` (`HER.portrait`, a tachie visual-novel heroine with poses, expressions, office, beach
and Copilot-tee outfits, plus a palette-swapped `cast` for colleagues) and `anime.js` (`A.head80` heads and simpler
bust/seated bodies). See "Cel-anime heroine" below. Don't mix the two styles in one video.

**Explorer / adventure-serial look:** use the **explorer-quest** skill. Its `kit/heroine.js` is the retro-anime cel
heroine plus `outfit:'explorer'`: a felt fedora split into back and front pieces (the fringe shows under the brim), a
khaki field shirt, a teal neckerchief, a satchel and a brass compass with the Copilot mark (`pose:'compass'`). It pairs
with a 16 mm film pass and a parchment treasure map. Don't mix it with the watercolour rig in one video.

## Starting a project

**Character or still:** copy `assets/*`, clone `demo.html`, and keep the load order `core.js → cast.js → dance.js → your scenes`.

**Music video:** copy `assets/*` and put the track in as `song.mp3`.
1. Set the timing:
   - `SONG` (length in seconds) in `video.html`.
   - `BEAT = 60/BPM` and `B0` (first downbeat, in seconds) in `fx.js`. Find them with librosa, or tap them out and check against the kick.
2. Fill `LYR` with `[start, end, 'line text']` entries.
3. Write the scenes in `scenes_*.js`, list them in `SC` in `timeline.js`, and add each new file to the `video.html` script list.
4. Check with `python stills.py …`, then run `python export.py out.mp4`.
   - Export takes about 7.5 min for 2.5 min of video.
   - Both scripts exit with code 1 even on success, so ffprobe the output.
- `fx.js` defines `bpos(T)` (beats since B0), which `dance.js` uses.
- Load order: `core → cast → fx → dance → props → msx → scenes_* → timeline`.

## Page boilerplate
```js
setup(canvas);                                    // 1920x1080 backing store, sets global C
await document.fonts.load('40px PMarker').catch(()=>{}); await document.fonts.load('40px Shantell').catch(()=>{});
makePaper();                                      // once
function draw(T){ boil(T); paper(); /* scene */ grain(); }
window.READY = true;                              // render scripts wait on this; set window.ERR on failure
```

## Coordinates and framing
- `person(x, footY, s, opts)`: the feet sit at `footY`, and `s` is pixels per local unit.
- Local units (up is negative y):
  - feet: 0
  - hips: -3.05
  - shoulders: (±.68, -5.05)
  - head centre: -6.65, radius about 1.1
  - hair top: about -7.8
- **Full body:** `s ≈ frameHeight / 8.5`. **Bust:** put the feet below the frame, e.g. `footY = H + 2.5*s`.
- `push(x, y, s, flip, rot)` / `pop()` enter local space. Ink widths are in screen px, so line weight stays constant at every scale.

## person() options
```js
person(x, footY, s, {
  look: 'idol'|'word'|'excel'|'ppt'|'teams'|'surface'| {...overrides},  // legacy aliases: xbox=excel, ops=surface
  pose: { lSh, lEl, rSh, rEl, lHip, lKn, rHip, rKn, lean, tilt, bob },  // degrees; 0 = limb hanging down
  eyes: 'open'|'happy'|'closed'|'wink'|'star'|'heart'|'spiral'|'shock'|'narrow'|'shini',
  mouth: 'smile'|'open'|'O'|'grin'|'flat'|'cat'|'wobble'|'smirk',
  brows: null|'worry'|'angry',
  hands: { l: 'peace'|'point'|'mic', r: ... },
  dir: 1|-1, turn: 0..1 (.6 = 3/4 view), back: true, sway: deg,
  headOnly: true        // expression chips only; never use as a floating head in a scene
});
```
- Pose defaults: `{lSh:10,lEl:6,rSh:10,rEl:6,lHip:4,lKn:-2,rHip:4,rKn:-2}`.
- Shoulder: `+` swings the arm out and up (160 = straight up). Elbow angles add to the shoulder angle.
- Hip: `+` kicks the leg out. A negative knee angle bends the knee back.
- `lean` rotates the upper body, `tilt` rotates the head, `bob` lifts the whole body.

## Cast (`LOOKS`)
- `idol`: the lead. Copilot-ribbon twin-tails, Copilot hair clip, headset.
- `word`: blue bob with a doc hair clip.
- `excel`: green `#107C41` jacket, pony tail, Excel-grid hair clip (`acc:'grid'`). It **replaced Xbox**, so use Excel rather than Xbox.
- `ppt`: orange buns with pie ornaments.
- `teams`: purple spiky hair, pants.
- `surface`: the ops guy with a hoodie, glasses and Surface Pen.
- Adding a look: spread an existing one and override its keys.
  ```js
  LOOKS.outlook = { ...LOOKS.word, jacket:'#0F6CBD', trim:'#9CCBF5', hair:'pony', iris:'#0F6CBD' };
  ```
- Look keys:
  - hair: `hair` (twin|bob|pony|buns|spiky|short), `hairCol`, `tailL`/`tailR`
  - clothes: `top`, `jacket`, `trim`, `bottom` (skirt|pants), `skirt`/`pants`, `boots`, `sole`
  - face: `skin`, `iris`
  - accessories: `clip`, `mic:'headset'`, `puff`, `logo` (chest tile: 'word'|'excel'|'ppt'|'teams'|'win'), `acc` ('doc'|'grid'|'pie'), `hoodie`, `glasses`, `pen`, `hoops` (earrings), `necklace`
  - hair also supports `'topbun'`.
  - **Opt-in fixes (use for every office or "real person" character):**
    - `soft:true`: slim, natural shoulders. Shoulder x is .6, sleeves taper .2→.17 and the jacket panels are softer. Without it the puffy sleeve caps stick out past the torso, and the user called that "funny shoulders".
    - `shoe:true`: a low-profile shoe (filled `boots`, ink sole line in `sole`) with the trouser leg running to a cuff painted over the shoe top so it reads as a hem. The default chunky idol boots looked wrong under trousers. Use dark shoes (`#3A2E2A`, `#2B2B3A`) or white sneakers with a coloured `sole`.
    - `cpTee:true`: a Copilot `mark()` on the chest for "Microsoft 365 Copilot" team shirts. It also works on hoodies.
    - `swim:true`: one-piece swimsuit (`top`, polka dots in `trim`, straps), bare arms and legs with simple feet, no jacket or waistband. Make it a separate look, e.g. `LOOKS.sofiaBeach = {...LOOKS.sofia, swim:true, top:'#F2617A', trim:'#FFE08A', necklace:false}`.
  - Office example (spread from `idol`, then switch off the idol extras):
    ```js
    LOOKS.sofia = { ...LOOKS.idol, hair:'topbun', hairCol:'#2A1A14', top:'#1F2A4A', jacket:'#1F2A4A', trim:'#2E3D66',
      bottom:'pants', pants:'#2B2F3A', boots:'#2A2024', sole:'#7A5A48', shoe:true, soft:true,
      skin:'#D9A37E', iris:'#5A3A22', clip:false, mic:false, puff:false, logo:null, hoops:true, necklace:true };
    ```
- Any value can be a function that returns a gradient.
- **Product-logo mascots** (Claude Code pixel critter, cat-eared GitHub Copilot, OpenAI knot, Gemini sparkle,
  Microsoft squares) are in the motion-graphics skill: `template/microsoft-model-hub.html` `mascot()` / `critter()`.
  See `model-hub-mascots.png` there. Use them when the brief is about products or AI labs rather than Office
  personas; they are SVG, so port the paths with `new Path2D(d)` for Canvas.

## Motion
- `dance(T, off)` snaps to a new `DP` pose on each beat, with a bob and head tilt. Give each dancer a different `off`.
- `run(T)` is a run cycle. `blendPose(A, B, k)` tweens between two poses.
- Lip-sync: `mouth: sing(T)` flips between open and smile on the lyric word onsets.
- Blinks: set `eyes:'closed'` for about 0.12 s every 3-4 s.
- **Reclining (lounger or hammock):** `push(hipX, hipY, 1, 1, rot)`, then `person(0, 3.05*s, s, {...})`. The hip sits at local −3.05·s, so this rotates the body about the hip. Bend the legs with `lHip`/`rHip` ≈ 70–90 and knees ≈ −60, and draw the lounger or hammock behind and around the body.
- **Seated at a desk:** draw the chair, then the person with hips/knees bent, then the desk and device (`sfDesk`, `sfMonitor`, `sfLaptop`) in front so the desk hides the legs. Colleagues should sit at desks with devices and talk (`sfTalk`), not stand in a row in front of furniture.

## Visual catalogue
- **Brand (cast.js):**
  - `mark(x, y, size, {rot, gap})`: the Copilot logo.
  - `appTile(kind, cx, cy, s)`: app-icon tile.
  - `clippy(x, y, s, {dir})`.
  - `laptop(x, y, s)`: Surface Laptop.
  - `sheetProp(x, y, s)`: floating Excel sheet with a chart.
  - `shoggoth(x, y, s, o)`.
- **Critters (props.js):**
  - `gato(x, y, s, T, o)`
  - `chinchilla(x, y, s, T, squash)`
  - `basilisk(x, y, s, T, open)`
- **Objects (props.js):**
  - `bomb(..., burn)`, `crystalBall`
  - `fence(x, y, s, T, breakT, dir)`: breaks at `breakT`.
  - `atom`, `rocket(x, y, s, rot, T)`, `moon`
  - `stockChart(x, y, w, h, k, col)`
  - `curtains(T, open)`, `spotlight(x, y, r, op)`
- **Microsoft easter eggs (msx.js, colours `MSC`):** users love these, so scatter one or two per scene.
  - Windows: `winFlag`, `bliss(T)` (XP hills), `bsod(x, y, w, h, T, pct)`, `hourglass`.
  - Office apps: `outlookOOO`, `teamsMute` ("you're on mute"), `wordArt(txt, x, y, size, T, rot)`, `excelGrid(x, y, cols, rows, cw, ch, cells, hi)`, `clippyBubble(x, y, w, lines, side)`.
  - Games: `minesweeper(x, y, s, T, map, face)`, `solCard` and `solCascade(T, t0, xs, s)` (Solitaire win bounce).
  - Other hardware and logos: `azureRack`, `edgeLogo`, `zune`, `keycap(x, y, label, down, w)`, `crt`, `cdr(x, y, s, T, label)`.
  - Labels: `tag(txt, x, y, sz, col)`.
- **FX (fx.js):**
  - Word pops: `wpop(txt, x, y, size, t0, T, {rot, fill, stroke, pulse, wig, wob, glitch, until, dur})` pops a word in, usually at `t0 = WT(line, word)`. Fills: `G_COOL`, `G_WARM`, `G_SUN`, `G_RIB`. `stamp(txt, x, y, size, t0, T, rot, col)` stamps a word.
  - Camera: `cam(zoom, x, y, rot, fn)` with `zoom = 1 + punch(T, hitTime) + .03*kick(T)`. Add `shake(T, t0)` on impacts.
  - Backgrounds: `sunburst(cx, cy, n, cols, rot, op)`, then `tint(col, op)` (multiply) for mood.
  - Effects: `speedLines`, `circuits`, `neuralNet`, `spark`.
  - Ground contact: `shadowE(x, footY, rx)` under every standing character.
  - Other props: `gauge(cx, cy, r, v, T)` (P(doom) meter), `card`, `bag`, `crown`, `maw`, `teethRow`.

## Music-video scene engine
- **Scenes:**
  - Every scene function takes ABSOLUTE song time `T`. Use `seg(T, a, b)` for local progress, and anchor motion to beats with `bt(k)` and to words with `WT(i, k)`.
  - Typical body:
    ```
    paper(); sunburst(); tint();
    cam(zoom, 0, 0, 0, () => { props; wpops; dancers with shadowE })
    ```
- **Scene list:** each `SC` entry is `{a, f, tin}`.
  - `a` is the start. Put it on a beat, about one beat before its vocal line.
  - `tin` is the transition in:
    - `SP(x, y, seed)`: an ink splat that grows from a motivated point.
    - `TR`: a torn-paper edge.
    - `WP`: a diagonal wipe.
  - Each transition lasts about 0.35 s. `composite()` blends the previous scene with the new one, which it draws offscreen via `layer()`.
- **Karaoke:** `karaoke(T)` draws a bottom pill with a Copilot mark and a gradient wipe along the current `LYR` line. Lyric indices in `HIDE` are skipped; use this for lines cut from the audio so that `WT` indices stay valid.
- **Time remap:** `video.html` draws `draw(SRC(F/FPS))`. After cutting bars from the song (audio-edit skill), add `[sourceStart, secondsRemoved]` to `CUTS`. Scene and lyric times stay in original song time, so nothing else shifts. Put the next scene's transition on the splice.
- **Credit card:** end with "Made with GitHub Copilot and Opus 5.5". Use that exact wording, not "Made with Copilot".

## Art rules (keep these consistent)
1. **Limbs:** smooth, tapered, filleted `capsule(bend(...))`. **Never draw circles at the shoulders, elbows, knees, ankles or feet.**
2. **Framing:**
   - **Full-body chibi characters beat big close-up faces.** Use a bust at most.
   - Never show floating heads.
3. **Menace:** make it cute rather than scary.
   - Use `eyes:'shini'` (glowing red with a star glint), a crimson vignette and a slow push-in on the red eyes.
   - No gore, horror faces or realistic monsters.
4. **Microsoft flavour:** add a Clippy cameo and msx.js easter eggs in most scenes, and give the dancers Office colours.
5. **Ink and paint:**
   - Ink: `PAL.ink` #2B2233.
   - Paint: `paint()` gives a watercolour fill plus a shade band. Add `hatch` for texture.
   - Put a shadow ellipse under every character.
6. **Boil:** call `boil(T)` once per frame. Never call `seed()` mid-frame without restoring it afterwards with `boil(T)`.
7. **Palette:**
   - Copilot ribbon: `PAL.cp*`.
   - Office apps: `PAL.word`, `PAL.excel`, `PAL.ppt`, `PAL.teams`.
   - Background: paper `#F3EBDC`, plus night/indigo for dark scenes.
8. **Logo:** `mark()` is the M365 Copilot logo, two ribbons with a centre gap. Use it as a hair clip, badge, laptop lid, karaoke pill and sting.
9. **Lettering:** `letters()` / `wpop()` in chunky MARKER with a drop shadow and gradient fills.
10. **Shoulders:** no puffy sleeve humps above or outside the torso line. Use `soft:true` and check the shoulder silhouette in a close still.
11. **Shoes match the outfit:** chunky boots only go with skirts or the idol look. With trousers use `shoe:true` and a hem that overlaps the shoe.
12. **Outfit suits the setting:** change the look per location (swimsuit on a beach, a coat for travel, office clothes at a desk) with a spread variant rather than one outfit everywhere.
13. **Wording:** write "Microsoft 365" in full on screen, never "M365".
14. **Hands on keyboards:** a typing character uses curled key hands (fingers down on the keys, wrists raised), or the shot is staged from the monitor (POV) or over the shoulder. Never flat palms pressed on the keys.
15. **Flashes are warm and dim:** a cream flash (`#ffe2c4`) at ≤ .35–.5 for about 0.1 s, never full white. It blooms through glow/CRT passes and reads as a glitch.
16. **Accessories ride the head:** headsets, glasses, shades and hair clips are drawn inside the head transform so they follow the head bob, tilt and turn. Hands that cross the face (drinking, waving) are drawn after the head.

## Cel-anime heroine (retro-anime kit)

`HER.portrait(g,x,y,k,o)` in `retro-anime/kit/heroine.js`; origin at the neck base, `k`≈.45–.6 for a bust. Full API and
recipes are in the retro-anime skill. The `outfit:'explorer'` cut (fedora, satchel, `pose:'compass'`) lives in the
explorer-quest kit's copy of `heroine.js`.
- **Options:** `outfit:'office'|'beach'|'tee'`, `expr`, `mouth`, `open`, `t`, `pose`
  (`relax/hip/card/wave/shock/type/drink/fist`), `armL`/`armR` overrides, `look`, `turn`, `tilt`, `htilt`, `rim`,
  `sweat`, `lwk`, `chair:'office'|'beach'`, `seated`, `clip:[x,y,w,h]`, `noGlow`, `armsOnly`, `noHeadset`, `noLegs`,
  `cast`.
- **Cast:** `cast:'raj'|'maya'|'leo'` (or an object with `male, short, glasses, tail, star, ahoge, SK, HR, EY, tee`)
  palette-swaps the rig into a colleague: skin, hair and eye colours, short hair, glasses, and a coloured Copilot tee.
  Presets live in `HER.CASTS`. One well-built rig plus palette swaps beats several half-built ones.
- **Layer order:** chair → back hair → thighs/skirt → torso, jacket, sleeves → forearms → head (ears, face, eyes, nose,
  mouth, blush, side locks, bangs, brows, headset or shades, ahoge) → `late` forearms that cross the face.
- **Cel shading:** `R.cel(g,pts|Path2D,o)`: flat fill `f`; shadow colour `s` as a crescent offset by `so:[dx,dy]`
  and/or explicit `sh` shapes (second tone `s2`/`sh2`); highlights `h` via `ho`/`hi`; a rim-light crescent
  `rim:{c,d}` (the portrait's `o.rim` is the scene's accent colour); then the ink line `l`/`lw`. `R.halftone` dots the
  shadow side of the jacket, top and skirt.
- **Face:** big eyes (tall iris with a dark top band and a soft lower glow, two white catch-lights, a tapered lash
  ribbon with wing flicks); a tiny nose tick; small mouths. Expressions: `neutral, smile, happy, surprised, shocked,
  worried, panting, determined, dreamy`. Lip-flap with `mouth:A.mouthAt(key,t-cueStart)`, blinks with
  `open:A.blinkAt(t,seed)`.
- **Idle life:** body bob `sin(t*2.4)`, head lagging it, hair and ahoge sway, sweat drops when stressed, forearm jiggle
  in `pose:'type'`.
- **Design:** an original heroine (orange hair, teal eyes, cream jacket with teal trim over a dark top, teal skirt, a
  dark headset with cyan LEDs at work). No navy. Front-view headset: band hugging the hair, cups seen edge-on.
- **Beach outfit:** a coral racer one-piece (white side piping, teal neckline trim), a teal sarong with white dots, and
  shades pushed up on her hair, on a yellow-striped beach chair. The user called an earlier beach outfit "strange": keep
  swimwear simple, one-piece and age-appropriate, and avoid trim colours that echo nearby props (teal chair stripes
  read as a sailor collar).
- **No clipping:** draw outfit pieces inside a clip of the torso shape, so straps, piping and stripes can never poke
  past the body outline or the arms. After any character change run `python rigsheet.py`: it renders 16 poses (beach,
  office and each cast member) to `stills\rig_sheet.jpg`. Check it for clipping, broken elbows and floating hands.
- **Typing from the front:** draw the portrait with `pose:'type'`, then the desk and keyboard, then the portrait again
  with `armsOnly:true` and `armL:KEY_L(), armR:KEY_R()` (curled `hand:'key'` overrides from `act2.js`), so the
  forearms sit over the keyboard. They're functions, so each call returns a fresh object.

## Pacing rules (from user feedback)
- Reading holds are about 2.5 s. If the user says a scene "hangs", trim it by 1-2 s.
- Never use a bright or white flash or transition going into a dark scene. Use a dark splat or tear instead.
- Cut on beats and put visual hits on the lyric words: `wpop` at `WT(i, k)`, `punch` on the downbeats.

## QA workflow
- `python stills.py t1 t2 ...` (OUTPUT seconds), then view `stills/sheet.jpg`.
  - Filter the log: `2>$null | Select-String "ERR|pageerror|retry"`.
  - Check transition midpoints (`a + .17`) as well as the holds.
- Re-view regenerated images, because the first view may be cached.
- Run `node --check file.js` after every edit. npm is not needed.
- If `draw` is undefined at boot, a scene file has a syntax or redeclaration error. Every file shares one global scope, so give helpers unique names.
- Keep each JS file to about 250 lines or fewer, splitting into `scenes_b.js`, `scenes_c.js`, and so on.
- Export: `python export.py out.mp4`, then ffprobe it to check the duration and AAC stream. For voiceover explainers, use motion-graphics `export_mp4.py` instead.

## Sync check

Before export (and after any retime or audio edit) run the **av-sync** skill: `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <video>.html`. It checks VO fit, SFX-on-impact, beats, lyric splices and clipping against these rules and prints frame-exact fixes.
