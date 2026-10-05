---
name: explorer-quest
description: Make vintage explorer / adventure-serial videos (a 1930s-50s pulp expedition and treasure-map look; evoke the genre only, never a franchise) with a cel-shaded Canvas2D engine, a WebGL 16 mm film pass (grain, gate weave, flicker, dust, light leaks), a Natural Earth parchment world map with a dotted route, pins, passport stamps and polaroids, an explorer heroine (fedora, satchel, Copilot-mark compass), jungle-temple sets, gold title slams, iris / film-burn / dissolve transitions and a synthesised adventure score and SFX, then export to MP4. Use when the user asks for an explorer, adventure, expedition, treasure map, travel route or montage, archaeologist, jungle temple, lost ruins, pulp serial, Indiana Jones-like, Uncharted-like or Tintin-like feel, vintage travel poster, sepia, 16 mm or old-film look, or "The Great Copilot Quest" key-art style. Reference project sofia-explorer. Pairs with retro-anime (same cel engine), tts-voiceover and av-sync. Works without npm (Python + Edge only).
---

# Explorer quest / adventure-serial videos

A code-driven engine for videos that feel like a vintage adventure serial: a heroine on an expedition, a
treasure map on a wooden desk, a jungle temple at sunrise, and a big gold title slam.

How it works:
- Every frame is Canvas2D at **640×360**, drawn ×3 into a 1080p backing, then finished by a WebGL **16 mm film**
  shader (bloom, warm grade, grain, gate weave, dust, flicker, light leaks).
- The world map comes from real **Natural Earth** coastlines (public domain), baked once into `mapdata.js`.
- The score and SFX are synthesised in WebAudio: an original brass/strings/timpani adventure theme. The voiceover
  comes from edge-tts.
- One HTML page plays the video, renders any single frame headlessly, and exports to MP4.

| Want | Use |
|---|---|
| Flat-vector explainer, stick figures, SVG player | **motion-graphics** |
| Watercolour/painterly characters, music video, lyric sync | **character-rig** |
| Retro arcade, 90s anime, pixel, CRT/VHS, VN, chiptune | **retro-anime** |
| Explorer / expedition / treasure map / jungle temple / old film / travel montage | **this skill** |

The cel core (`retro.js`) is byte-identical to the retro-anime kit, so cels, easing, `R.mark`, `R.shake` and the
canvases behave the same. `heroine.js` is the retro heroine plus an `outfit:'explorer'` cut and is self-contained
here (no `anime.js`, no CRT, no pixel font).

**Genre, not franchise.** Use the vocabulary: a fedora, a satchel, a map with a dotted route, ruins, torches, a
compass, a stamp. Never use Indiana Jones music (no "Raiders March"-like melody), logo lettering, the font, a whip
silhouette or anyone's likeness. The heroine is original; the title face is Rockwell Extra Bold (installed with
Microsoft Office); the theme is an original modal march.

**Reference project:** *The Great Copilot Quest, Chapter One: The Return* (`examples/sofia-explorer/` in the ai-video-creation-guide repo, 26 s
opening review cut). Sofia's six-month sabbatical becomes a 12-country expedition, then the long road home, then
the title slam. `kit\` is that project verbatim. `kit\PROMPT.md` records the brief, the look, beats, VO and lessons.

## Quick start

1. **Copy the kit.**
   - Run `Copy-Item -Recurse "$env:USERPROFILE\.copilot\skills\explorer-quest\kit" <project>`.
   - Rename `sofia-explorer.html` and update the hard-coded page name in `stills.py` (L29) and the default in
     `export_mp4.py` (L11).
2. **Map (only if the projection, extent or detail changes).** `mapdata.js` already ships.
   - `curl.exe -L -o $env:TEMP\ne_110m_land.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson`
   - `python make_map.py` writes `mapdata.js`. Delete the geojson afterwards; never commit it.
3. **Write the whole script up front** in `make_voice.py` `LINES` (see Voice below).
   - Run `pip install --user edge-tts`, then `python make_voice.py`.
   - This writes `voice.js` and `voice_timing.js/.json` and prints `word@frame` for every clip.
   - `python make_voice.py key1 key2` re-voices just those clips and merges them in.
4. **Route:** edit `STOPS` (name, lon, lat, label dx, dy) and `LEG_T` (leg start/end seconds) in `map.js`.
5. **Timeline:** `TOTAL`, `SCENE_T`, `VO_CUES`, `SFX_CUES` and `TRANS` in `timeline.js` (see Contracts below).
6. **Scenes** in `scenes.js` (one function per `SCENE_T` name), then re-score `scheduleMusic` in `audio.js`.
7. **Review cut first** (~25 s: map, one location, title, credit). Show it, take feedback, then build the rest.
8. **QA:** `node --check` every `.js`; `python stills.py` (contact sheets in `stills\`); then
   `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <page>.html --list` and get 0 FAIL.
9. **Export:** `python export_mp4.py <page>.html <out>.mp4` (~90 s for 26 s). `CRF` env var overrides the default 24.

To preview, open the page straight from disk. Click or Space to play/pause, R to restart, ←/→ to skip ±5 s.

## Kit

| File | What |
|---|---|
| `sofia-explorer.html` | Page and player: `render(F)`, the `?frame=N` still mode, click/Space/R/←/→, and a 2D fallback when WebGL2 is missing |
| `retro.js` | `window.R`, the cel core shared with retro-anime: canvases (`W×H` 640×360, `K` 3, scene `SC`/`g`, glow `GC`/`gg`), `begin`, `canvas`, easing (`lerp/ease/easeIn/easeOut/back/seg/pulse/onTwos`), `cel/limb/ribbon/airbrush`, `stamp`, `shake`, `iris`, `mark` (the Copilot mark) |
| `film.js` | `makePost(canvas)`: WebGL2 16 mm pass. PRE bright-pass → 4-level bloom → COMP (gate weave, soft focus, bloom, halation, warm grade, leak, flicker, vignette, scratches, dust, grain, bars) |
| `heroine.js` | `window.HER = {portrait, POSES, cupAt, drawCup, CASTS, compass}`: the cel heroine with the `explorer` outfit, fedora and `compass` pose |
| `mapdata.js` | `window.MAPDATA`: Natural Earth 110 m land rings, pre-projected (generated; don't hand-edit) |
| `make_map.py` | Bakes `mapdata.js` from `ne_110m_land.geojson` (Miller projection, Douglas–Peucker simplification) |
| `map.js` | `window.MAP`: route stops, legs and timing, cameras, the parchment and navy plates, stamps, polaroids, plane, HUD |
| `scenes.js` | `window.S`: `map`, `ruins`, `home`, `title`, `credit` plus `util` (`bars, fadeBlack, cap, goldText, motes, textW, barText`) |
| `timeline.js` | `FPS`, `TOTAL`, `SCENE_T`, `VO_CUES`, `SFX_CUES`, the transitions and `draw(t)` |
| `audio.js` | The adventure score (`scheduleMusic`), SFX (`sfx`), VO playback with ducking, and the seeded `exportAudio()` |
| `make_voice.py` → `voice.js`, `voice_timing.js/.json` | edge-tts lines → base64 MP3 bundle plus per-word timings (`window.VT`) |
| `stills.py` | Headless frame grabs and contact sheets into `stills\` (`RAW=1` gives the pre-film frame) |
| `export_mp4.py` | Headless Edge → JPEG frames + offline WAV → H.264/AAC MP4 (`CRF` env var, default 24) |
| `PROMPT.md` | The brief, look, beats, VO and feedback lessons for the reference project |
| `THIRD_PARTY_NOTICES.md` | MIT notice for the lemo-opuscar-derived code plus the Natural Earth credit. Always ship it |

## Architecture

- Plain `<script>` tags in this order: `voice.js`, `voice_timing.js`, `film.js`, `retro.js`, `heroine.js`,
  `mapdata.js`, `map.js`, `scenes.js`, `audio.js`, `timeline.js`. There are no modules, so `file://` works.
- `render(F)` calls `draw(F/FPS)`, which returns post overrides, then `post.render(R.SC, R.GC, F, null, over)`.
  Without WebGL2 it draws `SC`, then `GC` with `'lighter'`. It catches errors and returns the stack string.
- Two layers per frame:
  - `R.g` (the scene) is what the camera sees.
  - `R.gg` (glow) is added light only: suns, torches, rims, gold text, sparkles. Bloom and halation read from it.
  - Anything that should glow is drawn on both. Draw a black **occluder** on `gg` for anything that should block
    light (the temple body), otherwise the glow bleeds through solid objects.
- Heavy static art is cached lazily on first use: the parchment and navy plates (2880×1620), the 13 stamps and the
  polaroids. `MAP.warm()` builds them all up front. The reference page doesn't call it (the first frame just takes
  longer); call it before playback in a new page to avoid a first-frame hitch.
- Scenes take **absolute** `t` (seconds), not a local time, so a beat's time is the same in the scene, the
  timeline and av_check.

## Contracts

```js
var FPS=30, TOTAL=780;                                  // 26 s
var SCENE_T=[['map',0],['ruins',6.2],['home',10.8],['title',16],['credit',22.6]];  // [scene, startSeconds]
var VO_CUES=[['open',27,'narr'],['best',207,'room'],['home',336,'narr'],['quest',489,'narr']];  // [key, frame, chain]
var SFX_CUES=[[0,'projector'],[39,'plane'],[63,'pin1'],/*...*/[700,'chime']];      // [frame, sfx]
const TRANS=[[5.8,6.6,irisT],[10.5,11.0,dissolveT],[15.6,16.3,burnT],[22.2,23.0,fadeT]];  // [a, b, fn(p,t)]
draw=t=>{ R.begin('#000'); /* TRANS hit ? fn(seg(t,a,b),t) : S[sceneAt(t)](t) */
  return Object.assign({leak:0,halo:.25,flick:.025}, over); };   // merged over film.js params
```

- Each scene `S.name(t)` draws into `R.g`/`R.gg` and returns `{}` or post overrides (`leak`, `halo`, `flick`,
  `grain`, `bars`…).
- A transition gets `p` (0→1 across `[a,b]`) and absolute `t`. It draws one or both scenes itself and returns the
  merged overrides. Use the `snaps()`/`snap()`/`paste()` helpers for full-resolution crossfades.
- `?frame=N` renders one frame and sets `window.ERR` (if `render` returned an error) and then `window.READY`.
  `stills.py` and `export_mp4.py` wait for `READY` and abort on `ERR`. When `navigator.webdriver` is set, the hint
  pill is removed.
- `exportAudio()` replays every cue through an `OfflineAudioContext` with `Math.random` seeded (`0x5EED`) and
  returns the WAV as a base64 string (`export_mp4.py` decodes it). Every SFX must start at
  `AU.at ?? ctx.currentTime+.01` so it works live and offline.
- av_check reads `SCENE_T`, `VO_CUES`, `SFX_CUES`, `TOTAL` and `FPS` from the page, so keep those names global
  (`var`).

## Look

The look is a sepia adventure serial: warm highlights, brown shadows and teal accents.

| Role | Colours |
|---|---|
| Parchment | `#efe0bb` → `#e2cb98` → `#c9a46a` (radial), land `#e6d3a3`, coast and ink `#5a3a1a` / `#3e2c18` |
| Route and stamps | Route red `#b3261e`; stamp inks `#a8322a`, `#23407a`, `#2f6b3a`, `#5b3a7a` |
| Gold (titles, night route) | `#fff1bf` / `#f2c45a` / `#d29a32` / `#9a6418`, glow `#ffb43a`, extrude `#3a2208` |
| Night plate | Navy `#14213d`, land `#1d2c4f`, gold lines `#d9a441` |
| Sunrise | `#2a1f45` → `#6b3358` → `#c4544f` → `#f08a3c` → `#ffd27a`, rim light `#ffb44a` |
| Captions and HUD | Fill `#f6ecd2` with stroke `#1a0f06`; HUD gold `#e8c26a` |
| Heroine | Khaki `#c9a46a`, felt `#8a5a32`, strap `#7a4a22`, brass `#d9a441`, teal neckerchief `#1f9e94` |

**Type** (Rockwell, Bookman Old Style and Stencil are installed with Microsoft Office; Segoe Print ships with Windows).
Always end a font string with a fallback (`Rockwell, Georgia, serif`; `Stencil, "Rockwell Extra Bold", Impact,
sans-serif`) so the layout survives on a PC without Office:
- Rockwell Extra Bold for titles (gold extrude).
- Rockwell bold 17 px for captions.
- Bookman Old Style italic for map labels, quotes and the HUD.
- Stencil for stamps and "EP.1".
- Segoe Print for polaroid captions.

**Film pass:** these are the `film.js` defaults. A scene tunes them by returning overrides.

| Param | Default | Notes |
|---|---|---|
| `bloom` / `halo` | .55 / .25 | Halation is red-orange `(1,.45,.2)` from the two widest bloom levels |
| `thr` / `sk` | .82 / .12 | Bright-pass threshold and knee. The glow layer always passes |
| `soft` / `expo` | .15 / 1.04 | Soft focus, exposure |
| `sat` / `contrast` / `lift` / `fade` | .92 / .18 / .05 / .06 | Smoothstep contrast; lift goes toward `shadowTint` |
| `tint` / `shadowTint` | `[1.05,.99,.88]` / `[.14,.08,.04]` | Warm highlights, brown shadows |
| `glow` | .35 | Extra add of the `gg` layer above .15 luma |
| `leak` | 0 | Amber light leak from the right edge |
| `flick` / `weave` / `dust` | .025 / 1 / .5 | Exposure flicker, gate weave, scratches (4-frame life) and specks |
| `grain` / `vig` / `bars` | .06 / .45 / 0 | Grain on 2 px cells, weighted to mid-tones; vignette; letterbox |

Per-scene overrides in the reference:

| Scene | Override |
|---|---|
| map | `flick` starts at .4 and settles to .025 over 0–1.2 s (projector spin-up) |
| ruins | `{leak:.25, halo:.3}` |
| title | `{leak:.12 + .25·pulse on QUEST, halo:.35}` |
| credit | `{leak:0, halo:.25, flick:.015}` |
| film burn | `leak` ramps to .4 at its midpoint |

**Grain vs file size:** grain is what costs bitrate.
- 1.5 px cells at .07 with CRF 22 gave 78 MB for 26 s.
- 2 px cells at .06 with CRF 24 give 35.5 MB (~10.9 Mbps) with no visible loss.
- To shrink the file further, raise CRF before lowering grain.

## Map

**Data.** `make_map.py` bakes Natural Earth 110 m land into `mapdata.js`:
- Miller projection, `MW` 600, latitudes 82 → −58.
- Douglas–Peucker with `EPS .22`. Rings under `MIN_AREA .6` are dropped, and so is Antarctica (rings whose max
  lat is below −55).
- Each ring is split at its point farthest from the start, so DP keeps both halves.
- Keep its constants in sync with `map.js`: `OX 20`, `OY 34`, `MW 600`, `MH 292.19`.

**Stops and legs.**
- `STOPS = [[name, lon, lat, labelDx, labelDy], …]`. The reference has 14: London, 12 countries, then Home.
- `proj(lon,lat)` returns sheet coordinates.
- Each leg is a quadratic Bézier sampled at 20 points. Its control point sits at the midpoint plus .25·d along the
  normal, so routes arc like flight paths. `RL`, `RTOT` and `LEGD` hold the arc lengths.

**Timing.**
- `LEG_T[i] = [start, end]` in seconds, and `PIN_T` is each leg's end.
- `distAt(t)` half-eases each leg, so the plane slows into each stop without stalling.
- The reference runs legs 0–5 at .7 s each, squeezes legs 6–11 into 2.6 s (the montage speed-up), then flies the
  long leg home.

**Cameras.**
- `mapCam(t)` and `homeCam(t)` return `camClamp(x,y,z)` → `{x,y,z,rot,dx,dy}` for `R.withCam`. It keeps the view
  inside the sheet.
- Push in on a stop before cutting to it. The reference pushes to Cambodia at z 2.0, then irises on the pin.
- `toScreen(p, cam)` takes `[x,y]` or `{x,y}` and returns the screen point, e.g. for the iris centre.

**Plates.** `parch()` and `navy()` are cached 2880×1620 canvases (`PK` 4.5), so a z 2 push stays sharp. The
parchment recipe, back to front:
1. Wood-grain desk, then a deckled sheet with a drop shadow.
2. Radial paper gradient, blotches and fibres.
3. Sea tint with three coastal ripple rings.
4. Land fill with airbrushed vegetation and desert tints, then mountain glyphs.
5. Graticule, fold creases, stains and a coffee ring.
6. Italic ocean labels (including the in-joke "Here be meetings"), a sea serpent and a 32-point compass rose.
7. Double border with a checker scale, burnt edges, vignette.

**Route.**
- Parchment: red dashed `#b3261e` (lw 1.6, dash 5/3.5) over a soft brown offset shadow.
- Navy plate: gold `#d9a441`, with a glow stroke on `gg` and bright stop dots.

**Pins and stamps.**
- A needle pin scales in with `back()` at `PIN_T`. 50 ms later a passport stamp lands (1.6 → 1 with `back()` over
  .22 s, alpha .78, hashed rotation).
- Stamps alternate oval and rectangle across 4 inks. They read "ARRIVED", the name in Stencil, and "DAY ###", where
  the day is the share of the route × 183.
- They are supersampled 5×, distressed with destination-out specks, and cached on first use.

**Plane.**
- A Path2D silhouette, cream with red stripes, heading from `headAt`.
- A per-leg altitude bump `sin(π·f)` scales it up to ×1.25 and pushes its shadow away. Its glow goes on `gg`.

**Polaroids.**
- Hand-drawn 40×38 mini photos (cached at 5×) with Segoe Print captions and a tape strip.
- They drop in during the fast legs, scaling 1.5 → 1 with a rotation settle over .35 s.

**Home marks and HUD.**
- Home gets a red X, then a pencil circle.
- `hud(t,a)` writes "EXPEDITION LOG" and "DAY ### · STOPS ##/12" on the top bar (Bookman 10 px gold).

**Drawing:** call `drawMap(t, cam, {navy, goldRoute, routeA, full, polaroids, home})`. On the navy plate only the
route is drawn.

## Heroine

`HER.portrait(g, x, y, k, o)` is the retro-anime tachie (VN portrait) heroine plus an explorer cut. The origin is
the neck base, and `k` .56 gives a waist-up hero shot.

- **Outfit `'explorer'`:**
  - Khaki shirt with rolled sleeves and bare forearms.
  - Teal neckerchief and a satchel strap across the chest.
  - Trousers (skipped with `noLegs:true` for waist-up shots).
  - `hat` defaults to true for this outfit.
- **Fedora:**
  - The hat is split into `brimBack`, drawn before the head, and `fedoraFront`: fringe shadow, pinched crown with
    dents, band and bow, snap-brim. This way the head sits *inside* the hat instead of under a lid.
  - With the hat on, the ponytail drops and its tie moves to (78,−158). The star clip, ahoge and headset are hidden.
- **Compass pose:** `pose:'compass'` raises the right hand with `hand:'hold'` and draws the brass compass at the
  wrist, offset by `po` (default −22,−44), with radius `pr` (default 36).
  - The dial has 16 ticks and a red N. The needle wobbles as `sin(3t)·.15 + sin(7.3t)·.04 + spin`.
  - The cap is `R.mark`, the Copilot mark: the compass is Copilot guiding her.
  - `HER.compass(G,x,y,k,t,{gg,spin,rot,lwk})` draws it free-standing, as on the title.
- **Other options:**
  - `expr`: `neutral`, `smile`, `happy`, `surprised`, `shocked`, `worried`, `panting`, `determined`, `dreamy`.
  - `mouth`: overrides the expression's mouth.
  - `open`: 0 closes the eyes, for blinks.
  - `turn` (−1…1 head turn), `look`, `tilt`, `rim` (rim-light colour), `clip`, `lwk` (line weight).
- **Other poses:** `relax`, `hip`, `card`, `wave`, `shock`, `type`, `drink`, `fist`, and `compass`. `late:true`
  draws the arm over the torso.
- **Colleagues:** `HER.CASTS` (`raj`, `maya`, `leo`) re-skin the same rig for colleagues.
- **Acting on the VO:**
  - Change `expr` on spoken words using `wt(key,i)` from `VT`, e.g. dreamy → smile on "Best" → happy on "Ever".
  - `mouthAt(key,t)` cycles talk/oh/smileopen every .09 s while a word is spoken.
  - `blinkAt(t,seed)` blinks for .1 s every 3.1 s.
  - Bob the whole portrait by `sin(2t)·.8`, and ease `turn` from −1 to 0 as she turns to camera.
- **The rim light is the mood:** sunrise amber `#ffb44a` in the ruins.

## Sets

**Ruins** (the jungle temple at sunrise) is a parallax stack. `drift = lerp(10,−10)` across the shot, and each
layer moves `drift × depth`:

| Layer | Depth | Contents |
|---|---|---|
| far | .25 | Sky gradient, stars fading out, clouds, sun disc, 12 god-rays |
| temple | .25 | 5 towers + 3 terraces in `#4a2a32` with an amber rim offset |
| pool | .35 | The temple mirrored with `scale(1,−.36)` at the waterline, ripples, a sun-glitter column |
| foliage | .5 | Silhouette palms, fronds and vines (`sil`, `palm`, `frond`, `jungle`, `vine`) |
| Sofia | .7 | Waist-up portrait, compass pose |
| near | 1.2 | Ledge and pillar framing the shot |

- **Occluders:** every solid silhouette is also filled black on `gg`. Otherwise the sun and god-ray glow bleed
  through the temple and leaves in the bloom.
- Parallax needs a margin: either camera z ≥ 1.12 or layers drawn wider than the screen by the drift.
- **Motes:** floating dust in the light (`util.motes`), drawn to both layers.
- **Luggage tag:**
  - It drops from the top bar with `back()` and then swings as `.25·e^(−2.2Δ)·sin(7Δ)`.
  - Text: "SOFIA" / "EXPLORER · 6 MONTHS". It works as the name card.
- **Bars:** 36 px letterbox bars carry the location (`barText`: "EXPEDITION LOG" / "ANGKOR, CAMBODIA · STOP 06/12").

## Transitions

Each transition is motivated by an object, never a generic crossfade. `TRANS = [[start, end, fn], …]` in
`timeline.js`; `draw()` calls `fn(t, p)` across the boundary with `p` running 0→1. Use `snaps`/`snap`/`paste` to
freeze the outgoing scene.

| Name | Use | Recipe |
|---|---|---|
| `irisT` | Map → location | An evenodd black mask with a 2 px gold ring closes on the pushed-in pin (`toScreen(STOPS[i], mapCam(t))`), then opens on the subject in the next scene |
| `dissolveT` | Location → map | Draw the incoming scene, paste the outgoing snapshot at `1−ease(p)`, and lerp `leak`/`halo` between them |
| `burnT` | Into the title | 7 wobbly blobs with staggered delays: brown char ring (r+16), orange `#ff9a3a` edge (r+5), destination-out holes. Draw the title, then the burnt snapshot over it; `leak` peaks mid-burn |
| `fadeT` | Into the credit | Dip to black, with opacity `1 − abs(2p − 1)` |

## Title slam

This is the key-art moment ("The Great Copilot Quest"). Every hit lands on a spoken word.

1. **Plate:** the navy map at z 1.12 → 1.04, with the gold route at full length, 16 god-rays from behind the
   title and motes.
2. **Compass:** it scales to 1.5 with `back()`, spins −4 turns, then settles with a wobble. A `spin` SFX goes on
   its start and a `click` on the settle.
3. **Quote caption:** the VO question ("Her greatest expedition yet?") as an italic caption, out before the slam.
4. **Gold words:** `util.goldText(s, x, y, size, a, sc, {ls, glow})` gives Rockwell Extra Bold with a 3-step
   brown extrude, a dark stroke, a 4-stop gold gradient and an amber glow on `gg`.
   - "THE GREAT" (26 px) fades up.
   - "COPILOT" and "QUEST" (46 px) each scale 1.8 → 1 with `back()`. They start .15 s before their word, so the
     overshoot peaks on the syllable.
5. **Hits:** each slam fires a `hit` SFX and a screen shake `amp·exp(−12Δ)`, plus a `leak` pulse on the last
   word.
6. **Sub-title:** a sparkle, then "CHAPTER ONE · THE RETURN" between two gold rules.
7. **Stamp:** a red Stencil "EP.1" stamp lands as the last beat, with a `stamp` SFX.

## Credit card

This card is required in every video.
- The navy map, dimmed, with the gold title repeated small at the top and the chapter line.
- The Copilot mark (36 px) springs in with `back()` and glows.
- "Created by GitHub Copilot" (20 px), then "Made with GitHub Copilot and Opus 5.5" (12 px).
- Hold at least 2 s, then fade to black. The score's final chord and a `chime` land on the mark.

## Voice

`make_voice.py` uses edge-tts with two voices:

| Voice | edge-tts | Use |
|---|---|---|
| `NARR` | `en-US-AndrewMultilingualNeural`, −4 %, −2 Hz | Movie-trailer narrator: warm and slightly slow |
| `SOFIA` | `en-US-AvaMultilingualNeural`, default rate and pitch | The heroine's own lines |

- It keeps the longest of 3 takes (the service sometimes truncates), then writes `voice.js` (`window.VOICE`,
  base64 MP3s) and `voice_timing.json/.js` (`window.VT = {key:{dur,words:[[sec,word],…]}}`).
  - `dur` is MP3 bytes / 6000.
  - `wt(key,i)` in `scenes.js` gives the absolute time of word `i`.
- Write for trailer pacing:
  - Use ellipses for the dramatic pause ("Six months... off the map.").
  - Use full stops for emphasis ("Best. Sabbatical. Ever!").
  - Say the title as its own sentence at the end of a line.
- Spell out brands in full ("Microsoft 365 Copilot"). Never leave a lone word at a line end.
- Chains: `narr` sends .05 to the reverb; `room` (the heroine on location) sends .1.

## Score and SFX

`audio.js` synthesises everything. There are no samples.

- **Score:** an original modal adventure march in D minor at 100 bpm (bar 2.4 s, gallop beat .6 s, first downbeat
  1.86 s). Harmony: Dm Dm F Gm Am Bb Gm A D G D.
  - Pad first, then a string gallop.
  - Brass theme, with the flute doubling it an octave up from bar 3.
  - A rising string line for the location shot.
  - March snare and drums under the montage, with a snare roll into the burn.
  - Timpani build and string tremolo under the question.
  - Crash and brass fanfare on the title, then a final D major chord on the credit.
- **Avoid** anything that resembles the Raiders March (a major-key stepwise pickup that leaps to a held high note in
  dotted rhythm) or any other franchise theme. Keep the theme modal and original.
- **Mix:**
  - Music bus .55, ducked to .42 under VO (.15 s in, .3 s out).
  - Reverb send .18 with a 1.6 s IR.
  - Master compressor −14 dB 3:1 into gain .68.
- **SFX** (`sfx(name)`):
  - `projector` (film rattle at 0 s), `plane` (prop drone per long leg).
  - `pin1…pin12`, plucks on D minor pentatonic: they climb for the first six stops and step back down for the fast
    legs.
  - `stamp`, `xmark`, `burn`, `spin`, `tag`, `click`, `hit`, `whoosh`, `chime`.
  - New SFX must use `t = AU.at ?? ctx.currentTime + .01` so they work both live and offline.
- **Export:** `exportAudio()` seeds mulberry32 `0x5EED` and renders 48 kHz stereo to a base64 16-bit WAV, so every
  export has the same soundtrack.

## Workflow and QA

1. **Syntax:** run `node --check` on every `.js` (`Get-ChildItem *.js | % { node --check $_.FullName }`).
2. **Stills:**
   - `python stills.py` takes a still every 2 s from 0.3 s. `python stills.py 6.4 8.9 19.6` takes exact times.
   - Output goes to `stills\t_XX.XX.png` plus `stills\sheet.jpg`, or `sheet_01.jpg…` above 12 stills (3 columns
     of 640×360 tiles; needs Pillow).
   - It retries boot 3 times and prints `pageerror`s and console errors.
   - `RAW=1` dumps the pre-film scene canvas, which shows whether an artefact comes from the scene or the film pass.
3. **Look at every still** at the scene boundaries, the transition midpoints and every slam. Check:
   - text contrast and size;
   - clipping on the heroine (hands, props, hat brim);
   - glow bleeding through solids;
   - the iris landing on the right pin.
4. **Sync:** run `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <page>.html --list` and get 0 FAIL.
   These findings are expected in the reference:
   - −2 f WARNs on the slams (the `back()` onset deliberately leads the word).
   - "no hit" INFOs for pins and the plane (the motion is too small for the detector).
   - The `click` 6 f before the title text, which is intentional.
   - ~66 ms audio lag overall.
5. **Export:**
   - `python export_mp4.py <page>.html <out>.mp4` takes ~90 s for 26 s.
   - Check the result with `ffprobe` (duration, both streams), then make a contact sheet for the user.
6. **Review:** show the review cut and contact sheet, take notes, adjust, and re-run steps 2–5.

## Episode template

The 26 s review cut is the opening of Chapter One:

| Time (s) | Scene | Beat | VO |
|---|---|---|---|
| 0–6.2 | `map` | Projector spin-up on the desk map. The plane flies London → six stops, with a pin and a stamp each, then pushes in on Cambodia | "Six months... off the map." |
| 6.2–10.8 | `ruins` | Iris into Angkor at sunrise. Sofia turns to camera with the compass; the luggage tag names her | Sofia: "Best. Sabbatical. Ever!" |
| 10.8–16 | `home` | Dissolve to the map. Fast legs with polaroids, the long leg home, an X and a circle on London | "Twelve countries, one explorer... and now, the long road home." |
| 16–22.6 | `title` | Film burn to the navy map, compass spin, gold slam, chapter line, EP.1 stamp | "Her greatest expedition yet? The Great Copilot Quest." |
| 22.6–26 | `credit` | The Copilot mark, "Created by GitHub Copilot" | — |

Next beats map the return-to-work story onto the genre. Hold each for at least 4 s:
- **The office jungle:** her desk is an overgrown temple doorway. The inbox is a cave of scrolls with the counter
  spinning past 4,000, and red wax "URGENT" seals are on everything, so nothing stands out.
- **The calendar temple:** a booby-trapped hall of recurring-meeting tiles. Double-booked slabs grind together, and
  a wrong step sets off a (comedic) rolling boulder.
- **Fellow explorers:** colleagues (`HER.CASTS`) at desks with field journals, building decks and documents with
  Copilot. She feels a step behind.
- **The compass lights up:** the Copilot compass points the way. Microsoft 365 Copilot:
  - sorts the scrolls into three piles (summarise and prioritise mail);
  - slots the tiles into one clear path (untangle meetings);
  - writes a six-month "expedition log" catch-up;
  - preps her for her catch-up with Hannah.
- **Finale:** a cliff at sunrise with the map in hand, a title reprise, then the credit card.

## House rules

These are user preferences learned across the Sofia videos:
- **Never rush.** Hold each beat for at least 4 s, plus 2.5 s of reading time after the last element lands. Notes
  like "too fast" came up repeatedly; lengthen the scene rather than speeding up the motion.
- **Readable text:**
  - Captions are at least 10 px at 640×360, on bars or plates, with a dark stroke.
  - Never put thin gold text on a bright background. Gold is for big titles with a stroke and an extrude.
- Write "Microsoft 365 Copilot" in full, on screen and in the VO. Never "M365".
- **Copilot is never a human:** it's the compass, the mark, a glow or a window.
- Every video ends with the "Created by GitHub Copilot" card.
- **Genre, not franchise:** no franchise music, logo lettering, font, whip silhouette or likeness.
- **Clean character:** no clipping between outfit layers, props in a natural grip, and arms that read correctly
  for the action.
- **Review cut first,** then the full episode.

## Gotchas

- Never name a local `R` (it shadows the engine), and destructure `TAU` from `R`.
- `mix`/`rgba` accept `#rrggbb` only.
- Write `\u00b7` and `\u2026` as escapes in JS strings.
- **Glow:**
  - Glow goes on `gg`.
  - Anything solid in front of a glow needs a black occluder on `gg`, or the bloom shines through it.
- `letterSpacing` needs a px string and isn't supported everywhere, so set it inside try/catch.
- GLSL `smoothstep(e0,e1,x)` with `e0 > e1` is undefined. Use `1.-smoothstep(e1,e0,x)`.
- **Plates:**
  - Canvas shadows ignore the transform, so multiply `shadowBlur` and the offsets by `PK`.
  - Plates are built lazily on first use. Call `MAP.warm()` up front if the first live frame stutters.
- **Parallax:** a camera z below 1.12 with no drift margin shows the canvas edge.
- **Grain** dominates bitrate (see Look).
- **PowerShell 5.1:**
  - Check `$LASTEXITCODE`, not `$?`.
  - robocopy exit codes below 8 mean success.
  - Write commit messages BOM-free.
- **Agent edits:** a single file write over ~8 KB can be truncated. Build big files in appended chunks of ~6 KB.

## Attribution

- `retro.js` (cel core, `limb()`, flare values) and the structure of `film.js` (from `core/post/crt.js`) are
  adapted from lemomo-ai/lemo-opuscar, MIT, © LemoLab.
- The coastlines come from Natural Earth 1:110m land (public domain). The GeoJSON is downloaded at build time and
  never committed.
- No upstream images, fonts, music, samples or voices are used.
  - The score and SFX are original and synthesised.
  - The fonts are Windows system fonts.
  - The voices are Microsoft neural TTS through edge-tts.
- Always ship `THIRD_PARTY_NOTICES.md` with any copy of the kit.
