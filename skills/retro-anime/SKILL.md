---
name: retro-anime
description: Make pre-2000s retro videos in a 90s TV cel-anime / arcade attract-mode / PC-98 visual-novel style, with a Canvas2D pixel engine rendered at 640x360 and shown at 1080p, a WebGL CRT pass (bloom, scanlines, aperture grille, VHS tracking), a cel-shaded tachie heroine with a palette-swapped cast, pixel-font HUD windows, VN text boxes typed to the voiceover, stamps, meters, iris/blinds/diamond transitions, a synthesised chiptune score and SFX, then export to MP4. Use when the user asks for a retro, arcade, 8-bit/16-bit, pixel, CRT, VHS, 90s anime, cel-shaded, PC-98, visual novel, JRPG or chiptune look, or wants an existing explainer redesigned in an old-school anime/arcade style. Kit in kit/ (reference project Copilot Quest Ep.1, sofia-retro). Pairs with tts-voiceover, av-sync and audio-edit. For an explorer / adventure-serial / treasure-map / old-film look, use explorer-quest (same cel engine, 16 mm film pass). Works without npm (Python + Edge only).
---

# Retro anime / arcade videos

A code-driven engine for videos that look pre-2000s. It covers four looks:
- 90s TV cel-anime: hard two-tone cels, airbrushed highlights and sparkles.
- Arcade attract screens: a neon logo, a synth sun and grid, and a blinking PRESS START.
- PC-98 visual-novel text boxes.
- Win9x/vapor windows with a CRT/VHS finish.

How it works:
- Every frame is Canvas2D at **640×360**, drawn ×3 into a 1080p backing and finished by a WebGL CRT shader.
- The chiptune score and SFX are synthesised in WebAudio. The voiceover comes from edge-tts.
- One HTML page plays the video, renders any single frame headlessly, and exports to MP4.

| Want | Use |
|---|---|
| Flat-vector explainer, stick figures, SVG player | **motion-graphics** |
| Watercolour/painterly characters, music video, lyric sync | **character-rig** |
| Retro arcade, 90s anime, pixel, CRT/VHS, VN, JRPG, chiptune | **this skill** |
| Explorer / adventure serial, treasure map, 16 mm film, sepia | **explorer-quest** |

The story structure, pacing, house rules and the review-cut workflow from motion-graphics still apply. Never fake this look with CSS filters on the SVG player; the pixel grid, the cels and the CRT pass are what sell it.

**Reference project:** *Copilot Quest Ep.1: Enter Copilot* (`examples/sofia-retro/` in the ai-video-creation-guide repo, 89.5 s). Sofia returns from a six-month sabbatical, six months behind, and Microsoft 365 Copilot helps her catch up. `kit\` is that project verbatim. `kit\PROMPT.md` records its prompts, feedback rounds, beats and VO.

## Quick start

1. **Copy the kit.**
   - Run `Copy-Item -Recurse "$env:USERPROFILE\.copilot\skills\retro-anime\kit" <project>`.
   - Rename `sofia-retro.html` and update the hard-coded page name in three places: `stills.py` (L29), `rigsheet.py` (L42) and the default in `export_mp4.py` (L11).
2. **Write the whole script up front** in `make_voice.py` `LINES`, one clip per beat (see [Voice](#voice)).
   - Run `pip install --user edge-tts`, then `python make_voice.py`.
   - This writes `voice.js` and `voice_timing.js/.json`, and prints `word@frame` for every clip. Place pops and stamps from those numbers.
   - `python make_voice.py key1 key2` regenerates just those clips and merges them in.
3. **Lay out `timeline.js`:** `TOTAL`, `SCENE_T`, `VO_CUES`, `SFX_CUES` and `TRANS` (see [Contracts](#contracts)).
4. **Write the scenes** in `scenes.js` / `act2.js`, one function per SCENE_T name. Then re-score `scheduleMusic` in `audio.js`.
5. **Make a ~25 s review cut first** (title, the first two or three beats, then the credit). Show it, take feedback, then build the rest.
6. **QA:**
   - Run `node --check` on every `.js` file.
   - Run `python stills.py`: a still every 2 s plus paged contact sheets in `stills\`. Give them to a fresh-eyes subagent.
   - Run `python rigsheet.py` after any character change.
   - Run `python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" <page>.html` and get 0 FAIL.
7. **Export:** run `python export_mp4.py <page>.html <out>.mp4` (about 4–6 min for 90 s). Then pull a few frames with ffmpeg to spot-check.

To preview, open the page straight from disk. Click or Space to play/pause, R to restart, ←/→ to skip ±5 s.

## Kit

| File | What |
|---|---|
| `sofia-retro.html` | The page. Loads the scripts in order (voice, voice_timing, post, pxfont, retro, anime, heroine, scenes, act2, audio, timeline). `render(F)` returns an error string or null. `?frame=N` renders one frame and sets `window.READY` / `window.ERR`. Falls back to 2D if WebGL fails. |
| `timeline.js` | `FPS`, `TOTAL`, `SCENE_T`, `VO_CUES`, `SFX_CUES`, `TRANS` and `draw(t)`. |
| `scenes.js` | Act 1 scenes (`title`, `travel`, `ret`), shared helpers `S.U`, on-screen VO text `S.TXT`, and `S.PIN_T`. |
| `act2.js` | Act 2 scenes (`party`, `quest`, `enter`, `boss`, `drafts`, `clash`, `recap`, `clear`, `outro`, `credit`). Extends `S` and `S.TXT` with `Object.assign`. |
| `retro.js` | `R`: canvases, cel and pixel primitives, text plates, windows, VN box, meters, stamps, transitions, backgrounds, Copilot mark. |
| `anime.js` | `A`: the 90s anime head (`head80`), expressions, views, hair, `mouthAt` / `blinkAt`, and the bust / seated / lounger rigs. |
| `heroine.js` | `HER.portrait`: the tachie heroine with office/beach/tee outfits, poses, chairs and cast palette swaps. |
| `pxfont.js` | `PF`: 5×7 pixel font with extra glyphs. |
| `post.js` | `makePost(canvas)`: WebGL CRT, VHS and bloom pass. |
| `audio.js` | VO playback, the ducked chiptune score, synth SFX and `exportAudio()`. |
| `voice.js`, `voice_timing.js/.json` | Generated by `make_voice.py`. `voice.js` is ~700 KB of base64; copy it, never open it. |
| `make_voice.py`, `stills.py`, `rigsheet.py`, `export_mp4.py` | Tools (see [Workflow and QA](#workflow-and-qa)). |
| `PROMPT.md` | The reference project's brief, feedback rounds, beats and script. |
| `THIRD_PARTY_NOTICES.md` | MIT notice. Ship it with every project built from this kit. |

## Architecture

- **Two layers.**
  - `R.g` draws to the cel canvas `R.SC`; `R.gg` draws to the glow canvas `R.GC`. Both use 640×360 virtual units at `R.K = 3`.
  - Anything that should glow (neon, LEDs, screens, sparkles) is drawn on `gg` *as well as* `g`. The CRT pass blooms `gg` and adds it on top.
  - Without WebGL the page draws `SC`, then `GC` with `'lighter'`.
- **A frame is a pure function of t.**
  - `draw(t)` calls `R.begin('#000')`, finds the last SCENE_T entry whose start is ≤ t, and calls `S[name](t)` with **absolute** t. Each scene subtracts its own start.
    - Exception: after a story-time insert (`INS_D`), scenes after the insert get `t − INS_D` (story time). See [Lengthening a beat](#lengthening-a-beat-story-time-warp).
  - It then draws the `TRANS` overlays and returns post overrides.
  - There is no state between frames, so any frame renders headlessly and seeking costs nothing.
  - A missing scene draws a `[name]` placeholder, so you can stub the timeline first.
- **Post overrides.** A scene may return `{bloom, halo, scan, grille, track, power, noiseA, flick, …}`.
  - Timeline merges in `{noiseA:.006, flick:0}`.
  - `track` (0..1) adds a VHS tracking glitch; `power` < 1 dims toward CRT power-on/off.
  - The `makePost` defaults are bloom .85, halo .22, scan .18, grille .06, bleed 7, rshift 2, corner .28, noiseA .018. Keep scanlines subtle.
- **Audio follows the cue lists.**
  - `audioStep(prev,F)` fires the VO and SFX that were crossed this frame. SFX fire only if they are less than 6 frames late.
  - `audioSeek(F)` restarts VO mid-clip and reschedules the music.
  - `exportAudio()` renders the same graph offline (seeded) for export.

## Contracts

`timeline.js` is also read by av_check:

```js
var FPS=30, TOTAL=2685;                                   // 89.5 s
var INS_D=2.0;                                            // story-time insert (s), see "Lengthening a beat"
var SCENE_T=[['title',0],['travel',3.2],['ret',15.1], …];  // [S fn name, start s], real time
var VO_CUES=[['travel',104,'narr'],['ahh',258,'room'], …]; // [voice key, start frame, 'narr'|'room' chain]
var SFX_CUES=[[0,'crt'],[93,'whoosh'], …];                 // [frame, sfx name], sorted
var TRANS=[[3.0,3.2,p=>R.diamonds(p,'#0b0620')], …];       // [a s, b s, fn(p 0..1)] over the finished frame
```

- **VO chains:** `narr` is dry plus a light reverb send (.05). `room` is for in-scene characters and gets more reverb (.1).
- **Cue frames:** a cue frame is when the clip *starts*. Word *n* lands at `cue + word_frame`, using the `word@frame` printout from `make_voice.py`.
- **Text and timings:**
  - `S.TXT[key]` is the text the VN box types.
  - `S.U.words(key)` returns that clip's word timings so the box types in sync with the voice.
  - `window.VT[key] = {dur, words:[[sec, word], …]}`.

## API cheat-sheet

### `R` (retro.js)

- **Canvases and constants:** `W=640`, `H=360`, `K=3`, `g`, `gg`, `SC`, `GC`, `NEON`, `TAU`, `LWK` (line-width scale).
- **Timing:**
  - `clamp`, `lerp`, `ease`, `easeOut` (cubic), `easeIn`, `back(t,s=1.70158)`.
  - `seg(t,a,b)` maps t into a..b as 0..1.
  - `quant(v,n)`; `onTwos(t,fps=12)` (characters on twos, camera smooth).
  - `pulse(t,a,d)`, `blink(t,rate)` (returns a bool), `typeText(s,t,cps)`.
- **Frame:** `begin(bg)`, `reset(G)`, `both(fn)` (save/restore g and gg).
  - `withCam({x,y,z,rot,dx,dy},fn)`: the virtual point (x,y) lands at screen centre.
- **Shapes and colour:**
  - `path`, `poly`, `crescent`, `cel`, `line`, `ribbon`, `flutter`, `hex`, `limb`, `vgrad(G,x,y,w,h,stops)`, `airbrush`.
  - `mix(a,b,t)` and `rgba(hex,a)` accept `#rrggbb` **only**.
  - `rng`, `hash`.
- **Pixels and texture:**
  - `px(x,y,w,h,col,G)`, `BAYER`, `ditherGrad`, `plate` / `drawPlate`, `ditherFade`.
  - `pixLayer(fn,{hard,outline,glow})`.
  - `halftone(G,x,y,w,h,col,fn,step)`.
  - `stars(G,t,seed,n,x,y,w,h,cols,glowA)`, `sparkle(G,x,y,r,col,a,rot,glowA)`, `pxSpark`, `starPath`.
- **Text:**
  - `neonText(s,x,y,col,sc=2,core,align,o)`: glow on gg, then ink ring and shadow on g. Returns x0. Options: `o.ink` (falsy = none), `o.glow`, `o.shadow`.
  - `hudText(s,x,y,col='#ffe14a',sc=2,align,o)`: text on a dark plate. `o.mask` blacks out the glow under the plate. Returns the plate rect `{x,y,w,h}`.
  - `panel(G,x,y,w,h,{alpha,fill,edge})`: `edge:null` draws no border.
  - `inkRing(G,s,x0,y,sc,ink)`: a 16-offset outline.
  - `logoText(s,cx,y,sc,{grad,glow,glowCol,outline,shadow})`: gradient title (`TITLE_GRAD`).
  - `label(G,s,x,y,col,sc,align,shadow)`, `textX(s,x,sc,align)`.
- **UI:**
  - `THEMES`: `classic` (Win9x), `vapor` (pink→purple titlebar), `night` (cyan→purple).
  - `bevel(G,x,y,w,h,light,dark,inset)`.
  - `win(G,x,y,w,h,title,{theme,shadow,icon,t0,t1,body})`: returns the client rect.
  - `vnBox(G,x,y,w,h,name,text,t,{words,sc,cps,nameCol,col})`: shows 【name】, types to word timings and blinks ▼ when done. `vnReveal(text,words,tt,cps)`.
  - `meter(G,x,y,w,h,v,{segs,col,colFn,frame,bg,off})`.
  - `stamp(G,s,cx,cy,t,{sc,col,rot,fill})`: slams in from 2.6× over .13 s, drawn on both canvases.
- **Transitions** (all of them black out gg too):
  - `iris(cx,cy,r,col)` (no-op when r > 800), `blinds(p,col,n=12,vertical)`, `diamonds(p,col,sz=40,dir)`, `stepFade(p,col,steps)`, `pixelate(blockPx)`.
  - `shake(F,amp,seed)` returns [dx,dy]; `letterbox(a,frac)`.
- **Backgrounds:**
  - `speedLines(G,cx,cy,n,col,a,seed,r0,r1,wmax)`, `gloom(G,t,x0,w,h,col,a,seed)`, `flare(x,y,s,a,G)`.
  - `synthSun(cx,cy,r,t,o)`, `synthGrid(t,hy,col,o)`, `screenFX(G,x,y,w,h,o)`.
- **Copilot mark:** `mark(G,x,y,size,o)` (vector) and `markPix(cx,cy,size,o)` (pixelated, with outline and glow). `lg(G,x0,y0,x1,y1,stops)` makes a gradient.

### `A` (anime.js)

- `head80(g,P,o)`: the 90s anime head. Data: `EXPR` (expressions), `VIEWS` (front / q / side), `HAIR`, `SOFIA`, `SOFIA_HAIR`.
- Rigs: `bust(G,x,y,k,o)`, `seated(G,x,y,k,o)`, `lounger(G,x,y,k,o)`, `sofiaTop`, `chair(G,P)`.
- Limbs: `armTo`, `legTo`, `headOn`, `footAt`, `handAt`, `torsoSide`, `relight(P,name)`, `dimP`, `xf`, `ellP`, `angOf`, `tintC`.
- **`mouthAt(clip,t)`**:
  - Inside a word window it cycles `'talk'|'oh'|'smileopen'` every .09 s. The window runs from the word start to min(next word, start + .12 + .06·length).
  - Between words, or with no VT clip, it returns `null`, which means "keep the expression's own mouth".
- **`blinkAt(t,seed)`**: returns 0 for .1 s every 3.1 s, otherwise null. Vary the seed per character.

### `HER` (heroine.js): `portrait`, `POSES`, `CASTS`, `cupAt`, `drawCup`

`HER.portrait(G,x,y,k,o)` draws a waist-up (or seated, full) tachie with its origin at the neck base. Options:

| Option | Values |
|---|---|
| `outfit` | `'office'` (cream jacket, teal trim, dark top, teal skirt, cyan-LED headset), `'beach'` (coral racer swimsuit + teal sarong), `'tee'` (Copilot tee) |
| `expr`, `mouth`, `open` | expression (`neutral`, `smile`, `happy`, `surprised`, `shocked`, `worried`, `panting`, `determined`, `dreamy`); mouth override (`smile`, `talk`, `oh`, `smileopen`, `shocked`, `panting`, `worried`; feed it `A.mouthAt`); eye openness (feed it `A.blinkAt`) |
| `pose` | `relax`, `hip`, `card`, `wave`, `shock`, `type`, `drink` (holds a cup), `fist` |
| `armL`, `armR` | override `{a1,a2,f1,f2,hand,off,hs,fy}`. Angles are in degrees (0 = +x, 90 = down); f1/f2 scale the upper arm / forearm. `hand`: `key`, `fist`, `hold`, `open`, `relax`, `flat`, `wave` |
| `look`, `turn`, `tilt`, `htilt` | gaze and body/head turn and tilt |
| `rim`, `sweat`, `lwk`, `noGlow` | rim-light colour (mood), sweat drop, line weight (1.6), no gg glow |
| `chair`, `seated`, `noLegs` | `'office'` or `'beach'` chair, seated pose, crop the legs |
| `clip`, `armsOnly`, `noHeadset` | clip rect `[x,y,w,h]`; redraw only the arms over a desk; no headset |
| `cast` | `'raj'`, `'maya'`, `'leo'` or `{male,short,glasses,tail,star,ahoge,SK,HR,EY,tee}`, a palette/hair/shape swap of the same rig |

`HER.CASTS`:
- raj: male, short hair, teal tee.
- maya: purple hair, violet tee.
- leo: male, glasses, orange hair, blue eyes, coral tee.

### `PF` (pxfont.js)

- Drawing: `put(g,s,x,y,col,shadow,sc)`, `putBig(g,s,x,y,col,outline,sc=3,shadow)`, `text`, `textOutlined`.
- Measuring: `textW(s,sc)`, `glyphW`, `wrap(s,w)`, `LINE_H`.
- Extending: `def(ch,...rows)` adds a glyph (one string per pixel row).
- Extra glyphs: `— … 【】 ★ ⇄ ♪ ✉ ✈ ◀ ■ ↑ ↓ → ← ✓ ✗ ● ^ $`. **Unknown glyphs render as `?`**, so define them before use.

### `S.U` (scenes.js) and act2 helpers

- `S.U` primitives:
  - `words(key)`, `rect(G,x,y,w,h,col)`, `fillPoly`, `strokePoly`, `circ`, `putC`, `typedC`.
  - `spr(rows,x,y,s,pal,G)`: string-row pixel sprites.
  - `ga(a,fn)` (global alpha) and `scaled(cx,cy,sx,sy,fn)`.
  - `burst(G,cx,cy,n,r,c1,c2,rot)`.
- `S.U` sets:
  - `officeRoom(t,noDesk)` and `povDesk(t,alert,typing)` (see [Seated typing](#characters)).
  - `crt`, `screen`, `deskProps`, `palm`, `alarmClock`.
  - `CURSOR`, `FLOP`, `ENV`, `CALI`, `CHAT` sprites.
- act2.js helpers (copy them when adding scenes):
  - `vs(k)` / `vd(k)`: cue start and duration in seconds.
  - `vo(k,t,name,o)`: a VN box for that clip while it is live (from −.16 s to +.5 s after the clip).
  - `mouth(k,t)`, `talking`, `latest(keys,t)`.
  - `pop(cx,cy,t,t0,fn,d=.18,ez=back)`, `bigPop`, `flash(t,t0,col,a)` (warm, .1 s).
  - `textL` / `textC` / `small` / `smallC`, `fitSc(s,maxW,sc)`, `wrapL`, `neonL`.
  - `confetti`, `envIcon`, `sprC`, `cursor`, `fmt` (thousands separator).
  - **`KEY_L()` / `KEY_R()`** are functions, so each call returns a fresh object.

## Audio

### Voice

`make_voice.py` takes voices from edge-tts. It keeps the **longest of 3 takes**, because the service sometimes truncates a clip. The reference cast:

| Role | Voice | Rate / pitch |
|---|---|---|
| Narrator | `en-US-AndrewMultilingualNeural` | +5% |
| Sofia (heroine) | `en-US-AvaMultilingualNeural` | +5% |
| Raj | `en-GB-RyanNeural` | +10% |
| Maya | `en-US-EmmaMultilingualNeural` | +10%, +2 Hz |
| Leo | `en-US-BrianMultilingualNeural` | +10% |

- **Characters voice their own lines.** The narrator only narrates.
- **Write one clip per beat.** A word that a stamp or card must hit gets its own clip (e.g. `back` / `behind` / `mode`), so retiming one beat never drags the others.
- **Prune clips** the timeline no longer uses: run a full `python make_voice.py` with no keys.

### Score and SFX

- **`scheduleMusic(ctx,dest,base,fromT,toT)`** writes the score in absolute seconds. Past a story-time insert it is written in story seconds, and `SH(T)` adds `INS_D` (see [Lengthening a beat](#lengthening-a-beat-story-time-warp)).
  - `N(kind,midi,T,dur,v,o)` plays a note; `D(kind,T,v)` plays a drum hit.
  - `cutN(c)` / `cutD(c)` stop a section at a cut. `rise(T,dur,v)` is a noise riser.
  - The reference sections, by start time:

    | Starts at | Section |
    |---|---|
    | 0 s | Title fanfare |
    | 3.2 s | Travel groove, F major (scratched off by the RING at 10.3 s) |
    | 11.9–14.1 s | VACATION.EXE hang bed: a stuck two-note loop over a drone |
    | 15.1 s | Stage jingle, then office, 140 bpm, A minor |
    | 31.5 s | Party, 120 bpm, C–Am–F–G |
    | 53 s | Battle, 150 bpm, D minor |
    | 78.5 s | Outro, Am–F–G–C |
    | 86.5–89.5 s | Credit sting |

    These are real (video) times. `audio.js` writes everything after 13 s in story seconds (2 s earlier) and `SH()` shifts it; the hang bed is written in real seconds.

  - Put section changes on scene cuts.
- **`tone(ctx,dest,kind,m,t,dur,v,o)`**:
  - Kinds: `p12` / `p25` / `p50` (pulse duty), `tri`, `saw`, `sine`.
  - `m` is a MIDI note; `m=0` means use `o.hz`.
  - Options: `{hz,hzTo,vib,r,a,sus,slide}`.
- **`drum`:** `kick`, `snare`, `hat`, `shaker`, `crash`, `scratch`. Also `noiseHit(ctx,dest,type,f0,f1,t,dur,v,q)`.
- **SFX** are `case` lines in `sfx(name)`, built from the helpers `T(kind,m,dur,v,o,tt)`, `nz(type,f0,f1,dur,v,tt,q)` and `sw(...)` (a swelling sweep).
  - Names: `crt`, `whoosh`, `card`, `select`, `alarm`, `hang`, `glitch`, `flip`, `alert`, `stamp`, `gloom`, `chime`, `pop`, `coin`, `charge`, `summon`, `zap`, `sort`, `boom`, `type`, `untangle`, `scan`, `confirm`, `ffwd`, `levelup`, `logo`, `fanfare`.
  - `pin1..N` climbs F-major pentatonic; `chk1..3` are checkmark ticks.
  - Keep pitched SFX **in the key of the section** they land in.
- **Ducking:** the music bus is .55 and ducks to ×.42 while VO plays, from −.08 s to +.1 s around each clip.
  - Gaps under .5 s merge into one duck. Ramps are .15 s in and .3 s out.
  - Master: compressor −14 dB 3:1 → gain .68, plus a 1.6 s noise-IR reverb.
- **Export:** `exportAudio()` seeds `Math.random` with `0x5EED`, so glitch/type SFX are identical on every export. It renders 48 kHz stereo to a base64 WAV, which `export_mp4.py` muxes as AAC 192k.

## Look rules

- **Render low, show big.** Use 640×360 virtual and hard-edged cels. Characters animate on twos (`R.onTwos(t,12)`); the camera and UI tween smoothly at 30 fps.
- **Vocabulary**, in rough episode order:
  - an attract title (neon `logoText`, synth sun and grid, blinking PRESS START);
  - postcards or windows for montage;
  - a PC-98 `vnBox` typed to the VO;
  - Win9x/vapor `win` dialogs, `meter`s, `stamp`s, speed lines, halftone and dither;
  - iris / blinds / diamonds / pixelate transitions.
- **Tachie hero shots.**
  - Expressions change on the VO beat. Blinks come from `A.blinkAt`; the mouth comes from `A.mouthAt` while that character is talking.
  - The **rim light carries the mood**: red for alarm, cyan/green for Copilot, warm for relief.
- **Outfits follow the setting.** Office outfit at work, swimsuit and sarong on the beach, Copilot tees for colleagues.
- **Flashes** are warm `#ffe2c4`, about .1 s, alpha ≤ .2–.35 under the CRT. Never pure white; bloom turns it into a blowout.
- **Copilot is never a human.** Show it as the Copilot mark, a sprite, a COPILOT.EXE window or a glow joining "the party".
- **Episodic framing.** Use STAGE n cards, `STAGE CLEAR!`, an iris eyecatch, then the outro, then an iris into the credit card.

## Legibility (lessons from feedback)

- **Gold or yellow text is unreadable on bright art.** Always give it an ink ring and a dark plate: `R.hudText` or `R.panel` + `neonText`.
  - Glow bleeds over thin text, so pass `o.mask` (or a lower `glow`) when the text sits over neon.
- **Red alerts** get yellow or white text on a dark plate, drawn *after* the red flash.
- **Spacing:**
  - Keep ≥ 8 px between plates and cards, *allowing for `back()` overshoot*.
  - Cards that slide inside a window use `easeOut`, not `back`, so they don't overshoot the frame.
  - Keep HUD and plates clear of heads, hands and key props.
  - Re-check edges on zoom-ins and camera pushes.
- **Measure before placing** with `PF.textW(s,sc)` and `fitSc`. Never guess widths.
  - Pluralise counters (`1 TASK` / `3 TASKS`).
  - Define any glyph you use; unknown glyphs render as `?`.
- **Blinking text** uses inverse video (swap the plate and text colours). Never blink it out to nothing.
- **Remember the transitions:** wipes and irises black out gg, so glow vanishes during them. Don't put the only copy of key text on gg.

## Motion and cuts (lessons)

- **Counters** start non-zero, ease out, and land **before** the cut. Hold the final number at least .5 s.
- **Stamps:**
  - Never land a stamp during an insert or a transition.
  - Time it so the slam lands on the spoken word: `t0 = word_time − .13`.
- **Gags and reaction beats get 2.5–3 s.** The first retro cut ran its RING! RING! alarm and its "6 MONTHS BEHIND" beat too short, and the user asked for both to be longer.
  - Build gags in steps, e.g. RING! → her cocktail spins off and lands on a crab, who scuttles away with it → a bigger RING! RING! → VACATION.EXE HAS STOPPED RESPONDING → it hangs (hourglass, NOT RESPONDING) → the cursor clicks OK → a tracking-glitch cut.
    - **A crash or freeze gag must hang.** In the full episode the cursor clicked OK about .4 s after the VACATION.EXE box popped, and the cut came about 1.3 s after the pop. The user said it was too fast. The box now stays up about 2.5 s, with idle life, before the OK click closes it. See [Crash/freeze gag](#crashfreeze-gag).
  - Hold the stamp, then add a damage tally (unread / meetings / clashes) and a status window.
- **Subtitles wait** for the title's overshoot to settle.
- **Use the iris** for the eyecatch and the credit; use diamonds or blinds between scenes.
- **SFX land on the visual hit,** not the cut or tween start:
  - `back()` slides and stamps peak about +4 f after t0;
  - `pop` / `bigPop` peak about +3 f;
  - a whoosh may lead a move by 3–6 f.

### Crash/freeze gag

`crashDialog(r)` in `scenes.js` draws a Win95 "has stopped responding" box; `r` is seconds since the first RING. Hold it for at least 2.5 s and keep it alive:

| r (s) | Beat |
|---|---|
| 1.53 | The box pops with `back()`. The `HG` hourglass (an 11×14 sprite with 3 sand frames) idles over it, and the progress bar crawls a block every .4 s |
| 2.8 | On the `hang` ding the title greys to `VACATION.EXE (NOT RESPONDING)`. The dots freeze mid-cycle, the bar sticks at 3 blocks, and she starts to sweat |
| 2.95–3.25 | An impatient mouse wiggle (`hgPos`) |
| 3.3 | The hourglass turns back into the arrow (`CURSOR`), which eases onto OK over 3.4–3.85 |
| 3.9 | OK is pressed (`select` SFX): the bevel inverts and the label drops 1 px |
| 4.0–4.08 | The box squashes shut vertically |
| 4.3–4.8 | Tracking glitch, then blinds into the next scene |

- The hourglass steps a sand frame every .25 s, in time with the hang bed, and flips every .75 s.
- She blinks (a double blink, then a single one) and sweats through the hold, so no frame is dead still.
- **Play a hang bed under the hold**, not silence: a stuck two-note `p12` loop over a `tri` drone, written in real seconds. After NOT RESPONDING the loop slows from .25 to .32 s per step and each note sags flat (`hzTo:mtof(m)*.985`), like a program grinding to a halt.
- **Bloom:** a dialog over the bright synth sun washes out. Knock the glow out behind the box (`rect(gg,x-6,y-6,w+12,h+12,'#000000')`) and ease the bloom from .85 to .5 and back. A stepped change reads as a pop with no sound.

### Lengthening a beat (story-time warp)

To give one beat more time without retiming everything after it, insert story time:

1. Add `var INS_D=2.0;` to `timeline.js` with a comment giving the insert point (13.1 s here). It must be a global `var` so other files can read `window.INS_D`.
2. Add `INS_D` to every real-time entry after the insert point: `SCENE_T`, `VO_CUES`, `SFX_CUES`, `TRANS`, `TOTAL`, and any hard-coded times in `draw()` (e.g. the recap tracking glitch at 72.2–72.6 s).
3. In `draw()`, pass story time to the scenes after the insert: `st=k>=2?t-INS_D:t`. Their code is unchanged.
4. A helper that reads `VO_CUES` from inside one of those scenes converts back to story time: `vs()` in `act2.js` subtracts `INS_D`.
5. In `audio.js`, `SH=T=>T>=13?T+INS_D:T` warps the score helpers (`N`, `D`, `rise`, `gsn`, `P`). Ducking reads the real-time `VO_CUES`, so it needs no shift.
6. The scene before the insert keeps real time and fills the gap. Write its new animation, and any bed under it, in real seconds.
7. Nothing needs re-voicing. Re-run `av_check.py`, `stills.py` and the export.

## Characters

- **One rig, many people.** Make colleagues with `cast` palette/hair/shape swaps instead of new rigs, so they share the same quality bar.
- **Clipping:**
  - Clip swimsuits and sarongs *inside the torso path*, so no stray bands appear at the shoulders and hips.
  - Run `python rigsheet.py`. It draws 16 poses (beach, office and each cast member) at zoom .62 into `stills\rig_sheet.jpg`; check that sheet for clipping, broken elbows and floating hands.
- **Seated typing** (the POV desk recipe):
  1. `officeRoom(t,true)`
  2. `HER.portrait(…, {chair:'office', seated:true, turn:0, pose:'type', armL:KEY_L(), armR:KEY_R()})`
  3. `povDesk(t,alert,typing)`
  4. `HER.portrait` again with `armsOnly:true`, so the forearms sit *on* the desk.

  Never use flat palms on keys; the hand is `'key'`.
- **Expressions match the line.** `worried` for "where do I even start?", `happy` for "let's find out!", `determined` for "I've got this", `dreamy` on the beach. Change on the beat, not mid-word.
- **Watch the shoulders and the outfit design.** Clean shoulder caps and setting-appropriate outfits. The user flagged odd shoulders, mismatched shoes and a strange beach outfit in earlier rounds.

## Workflow and QA

1. **Brief.** Read the user's documents and decks. Lift the scenario beats and the exact product names.
2. **Script** every line, voice them all (`make_voice.py`), and read the `word@frame` output.
3. **Review cut** (~25 s): title, the first beats and the credit, with full audio.
4. **Full episode.** Add scenes one at a time. Run `node --check` and `stills.py <t…>` on that scene after each one.
5. **Fresh-eyes QA:**
   - Run `python stills.py` (every 2 s from 0.3 s, 12 per sheet: `stills\sheet.jpg`, `sheet_02.jpg`, …; `RAW=1` skips the CRT).
   - Give the sheets to a subagent and tell it to assume there are problems: legibility, overlaps, clipping, text over faces, off-brand names, glyph `?`s.
   - Triage false positives (transition midpoints, typewriter reveals mid-type), fix the rest, then **re-render and verify each fix**.
6. **Sync.** Run `av_check.py` and get 0 FAIL. Known by-design WARNs:
   - a stamp or SFX right after a cut;
   - a select/flip/pop on a frame where av_check sees little visual change;
   - ±4–6 f off when two visual hits fall within 5 f of each other. av_check keeps only the first frame of such a plateau, so a cue on the later hit reads as off. Check a still at the cue frame before moving anything;
   - a bright-flash WARN on a deliberate, brief hit flash (the boss zap: about .1 s at ≤ .4 alpha).
7. **Export and spot-check** (see the commands below).

To spot-check, get the ffmpeg binary from `python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`. There is no ffprobe, so read duration and streams from `ffmpeg -i`. Then grab a few frames:

```powershell
& $ff -v error -ss 45 -i out.mp4 -frames:v 1 f45.png
```

`export_mp4.py` renders JPEG q95 frames and encodes libx264 crf 22, `-tune animation`, yuv420p, bt709, AAC 192k, faststart. Expect about 35 MB for 90 s.

## Episode template (Copilot Quest Ep.1)

| t (s) | Scene | Beat |
|---|---|---|
| 0 | `title` | Attract screen: COPILOT QUEST / EPISODE 1: ENTER COPILOT / PRESS START |
| 3.2 | `travel` | "6 MONTHS AWAY". WORLD_TOUR.EXE map with pins popping (13 places). Postcards and INBOX.EXE (EMAILS: 0, OUT OF OFFICE: ON ✓). Sofia on a beach chair: "Ahh… this is the life." RING! (cocktail lands on a crab) → RING! RING! → VACATION.EXE crash → the box hangs ~2.5 s (hourglass, NOT RESPONDING, cursor wiggle) → OK click |
| 15.1 | `ret` | DAY 1 / STAGE 1 card → MAIL flood → "6 MONTHS BEHIND" stamp → damage tally (4,812 unread / 214 meetings / 37 clashes) → STATUS: JET-LAGGED / MODE: CATCH-UP |
| 31.5 | `party` | Colleagues at desks in Copilot tees, each with a level-up card and an item ✓. ★ YOUR PARTY LEVELLED UP ★ |
| 42.8 | `quest` | Calendar invite: INTRODUCTION TO MICROSOFT 365 COPILOT, LED BY HANNAH → "What's that?" → "Let's find out!" → QUEST ACCEPTED! |
| 53.0 | `enter` | COPILOT JOINED THE PARTY! (summon) |
| 55.8 | `boss` | THE INBOX: sorts into ★PRIORITY / FYI / LATER and summarises |
| 60.6 | `drafts` | Draft replies READY FOR REVIEW ✓; PLANNER gains 3 tasks |
| 65.9 | `clash` | Calendar clashes 37 → 0; checks when Hannah is free (HANNAH · FREE/BUSY window) → catch-up booked |
| 72.4 | `recap` | VHS fast-forward → RECAP.DOC: 6 months → 60 seconds; gets her ready for tomorrow's session (SESSION PREP ✓ checklist) |
| 78.5 | `clear` | STAGE CLEAR! MODE: CAUGHT UP. "Okay. I've got this." |
| 81.3 | `outro` | MICROSOFT 365 COPILOT / WELCOME BACK, SOFIA! |
| 86.5 | `credit` | COPILOT QUEST logo / EP.1 · WELCOME BACK, Copilot mark, **Created by GitHub Copilot** |

The same shape works for any "hero is overwhelmed → allies level up → quest → Copilot joins → boss fights → stage clear" story.

## House rules (Copilot videos)

- Write **"Microsoft 365 Copilot"** in full on screen and in the VO; never "M365".
- **End on a "Created by GitHub Copilot" card.**
- Copilot is never a human character.
- Characters voice their own lines; outfits suit the setting; colleagues work at desks with devices.
- Characters are original designs. The heroine's palette avoids navy.
- Show what Copilot actually does in the scenario: sort and summarise, draft replies to review, add Planner tasks, check availability and book, recap, and prep for a session. Show these as concrete UI beats, not abstract sparkle.
- Deliverables go where the user asked (for these projects, `<your-folder>\<project>\`).

## Gotchas

- `TAU` isn't a global inside scenes; define it locally. **Never name a local `R`**, because it shadows the engine.
- `mix` and `rgba` take `#rrggbb` only. Don't pass names, `#rgb` or `rgb()`.
- Scenes get absolute t; subtract the scene start before animating. After an `INS_D` insert, scenes after it get story time (real − `INS_D`).
- Re-running a single key with `make_voice.py key` merges. Re-cue `VO_CUES` if its duration changed, because later cues don't move by themselves.
- PowerShell 5.1 treats stderr under `2>&1` as failure. Check `$LASTEXITCODE` and the output files instead.
- Don't kill the user's Edge processes; the tools launch their own headless instance.
- npm may be blocked, but `node --check` works for syntax checks.
- If `timeline.js` has a UTF-8 BOM, keep the BOM when editing it.

## Attribution

The cel core (`retro.js` primitives), the `head80` anime head, the CRT pass (`post.js`) and the pixel font are adapted from **lemomo-ai/lemo-opuscar** (MIT, © 2026 LemoLab). Ship `THIRD_PARTY_NOTICES.md`. No upstream art, fonts, music or voices are used; all characters, scenes, score and SFX are original.
