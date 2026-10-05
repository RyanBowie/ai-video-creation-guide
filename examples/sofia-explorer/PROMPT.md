# The Great Copilot Quest: explorer cut (opening review) (prompt)

This is the third look for the same story (a short return-to-work story brief): Sofia comes back from a 6-month sabbatical, and Microsoft 365 Copilot helps her catch up. It is matched to a "Great Copilot Quest" key-art reference image: a parchment world map with a red dashed route, polaroids, passport stamps, a brass compass with the Copilot logo, gold serif titles, and Sofia as an explorer in a fedora. The review cut is **26 s** (`sofia-explorer.mp4`, 1080p30): about 16 s of story, then the title card and the "Created by GitHub Copilot" card.

> Perhaps another slightly new design. Just cover the first 10 seconds or so to see what we can do. I've been shared a key-art image for a 'Copilot Quest'. It's more detailed and has more of an Indiana Jones theme. Do some research and double-check what we can do to make a new video in Sofia's journey that aligns more with this Indiana Jones / explorer feel.
>
> (1 reference image: "The Great Copilot Quest" key art.)

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

## Next

After review, continue Sofia's journey in this style: the return to the office (the overflowing in-tray as a jungle of mail, the calendar as a booby-trapped temple), then Microsoft 365 Copilot as the compass that finds the way.
