# Build prompt: "One rocket breaks the chart" (67 s data-storytelling short)

This prompt produced `launch-race.html` and `launch-race.mp4`. It combines the original brief with the decisions
made during the build. Paste it into a Copilot session that has the `motion-graphics`, `tts-voiceover` and `av-sync`
skills to reproduce or remix the short. Swap the dataset to tell a different data story in the same style.

---

## The prompt

> Use the **Data Storytelling** style from
> [lemomo-ai/lemo-opuscar `styles/dataviz/STYLE.md`](https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/dataviz/STYLE.md)
> to make a **60–70 second MP4** about real data. Recommend a dataset that is open, accurate and has a surprising
> shape, then build it. Use plain Canvas2D with no npm. Export with Python, Playwright and Edge. 1920×1080 at 30 fps.
>
> **Data (chosen: orbital launches per year, by country, 1957–today).**
> - Source: GCAT by Jonathan C. McDowell, `launchlog.tsv` (CC BY 4.0). Count every orbital launch attempt,
>   successes and failures, grouped by the launch vehicle's state.
> - Groups: United States, USSR / Russia, China, Europe, Japan, India, New Zealand. Keep a world total.
> - Also count Falcon 9 launches per year so the finale can say what share of US launches one rocket flew.
> - Write a small `build_data.py` that downloads the file and emits `data.js`. Never type numbers by hand.
>
> **The look (dataviz style).**
> - Warm paper background, serif headline, monospace axis ticks, handwritten pencil annotations.
> - A **bar race** of the top countries per year above a **world-total column timeline** that grows year by year.
> - A pencil writes each annotation (Sputnik · 1957, USSR ahead, USSR peak · 108, USSR ends · 1991,
>   China leads · 2018) and draws a leader line to the exact column.
> - A big ghosted year counter, a kicker, a caption band with a dated scene label, and a source line.
> - The camera stays almost still. It pushes in gently only for the climax.
>
> **Beats (2010 frames, about 67 s).** Hold every beat long enough to read it: about 4 s per caption, and never
> more than one new annotation every 2 s.
> 1. **Sputnik (0–292):** a taped paper print, *Fig. 1*, shows an R-7 on the pad at Baikonur. Ignition, lift-off,
>    then Sputnik in orbit with three radio beeps. The print peels away to reveal one column and a pencil note.
>    VO: "October, nineteen fifty-seven. A Soviet R seven rocket lifts off... and one small beep from orbit starts
>    the space age."
> 2. **Failures (292–532):** the chart frame draws itself and the bars start racing slowly. A **stats card** (year,
>    attempts, reached orbit, failed) ticks beside the race. Note: "1958: 20 of 28 failed". VO: "At first, most rockets
>    failed. In nineteen fifty-eight, twenty of twenty-eight never reached orbit."
> 3. **Gagarin (532–707):** a small ink Vostok glyph above 1961. VO: "Nineteen sixty-one. Yuri Gagarin becomes the
>    first person in orbit."
> 4. **Apollo (707–892):** a second print, *Fig. 2*, shows the Apollo lunar module touching down. VO: "July, nineteen
>    sixty-nine. Apollo eleven lands on the Moon."
> 5. **Soviet peak (892–1052):** "USSR peak · 108" and "US: just 9 · 1986". VO: "The Soviet Union flies the most,
>    peaking at a hundred and eight launches in nineteen eighty-two."
> 6. **The fall (1052–1262):** "USSR ends · 1991" and "2004 · low 52". VO: "Then the U S S R ends... and for
>    twenty-five years, launches stay low."
> 7. **Landing (1262–1470):** *Fig. 3*: a Falcon 9 booster's landing burn, legs out, touchdown at LZ-1 and a sonic
>    boom. VO: "December, twenty fifteen. A booster flies back... and lands."
> 8. **Falcon (1470–1737):** "1st landing" and "China leads · 2018", then the US bar grows past the axis and **tears
>    the chart frame**. A paper flap flips over and the axis is re-ruled with ratchet taps. A red pencil brackets the
>    bar: "≈92% one rocket: Falcon 9". VO: "Then one rocket breaks the chart. Falcon 9 flew nine in ten American
>    launches."
> 9. **Today (1737–1915):** the world total for 2025 is circled in red (324). A **calendar card** fills with one dot
>    per launch in order ("nearly one a day"), and the empty 2026 cell gets a question mark and the latest data date.
>    VO: "Three hundred and twenty-four launches in a single year. The next cell is still empty."
> 10. **Source card (1915–2010):** data credit and "Made with GitHub Copilot and Opus 5.5".
>
> Ten handwritten pencil annotations in all, each with a leader line to its exact column, plus small ink glyphs
> (Vostok capsule, crescent Moon, landed booster) above the key years. The pencil flattens as it nears the caption
> band so it never covers the text.
>
> **Sound.**
> - Narrator: edge-tts `en-GB-RyanNeural` at +2%. Trim each clip's trailing silence.
> - Synthesised pencil and paper SFX on the impact frame: scratches for handwriting, a line for each leader line,
>   a ruler, a paper tear, a flip and ratchet taps. The prints add a launch hiss, ignition, radio beeps, a
>   touchdown thud and a sonic boom.
> - A data-driven score: one soft plonk per year, pitched by that year's world total, over a D–Bm–G–A pad.
>   Duck it under the VO, and leave two short silences before the finale.
> - Run `av_check` and fix every FAIL and WARN before exporting.

## Files

| File | What it does |
|---|---|
| `build_data.py` | Downloads GCAT `launchlog.tsv` and writes `data.js` (per-year counts, world total, Falcon 9 count) |
| `data.js` | Generated data. Re-run `build_data.py` to refresh it |
| `launch-race.html` | Player: loads the scripts, scrub bar, play and export hooks |
| `engine.js` | Paper, timeline, annotations, glyphs, bar race, stats and calendar cards, tear and re-rule, captions, camera and `render()` |
| `cards.js` | The three taped paper prints: R-7 and Sputnik, Apollo lunar module, Falcon 9 landing |
| `audio.js` | `VO_CUES`, `SFX_CUES`, synthesised SFX, the data-driven score and `exportAudio()` |
| `make_voice.py` | Generates `voice.js` and `voice_timing.js/.json`. Clips are trimmed to their last audible sample |
| `export.py` | `--stills N…` for QA frames; with no arguments renders `launch-race.mp4` |

## Run, check and export

```powershell
cd launch-race
python build_data.py            # refresh data.js from GCAT (or: python build_data.py launchlog.tsv)
python make_voice.py            # regenerate all VO (or: python make_voice.py falcon)
python export.py --stills 150 400 830 1400 1600 1950
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" launch-race.html
python export.py                # launch-race.mp4
```

`av_check` passes with 0 FAIL. Six minor WARNs remain for continuous sounds (hiss, burn) that start within 4–6 frames of their visual.

## Lessons from the build

- **Feedback on the first cut (38 s): "not that detailed, and too fast in some instances."** The fix was to almost
  double the length rather than add more per second: a slower bar race, one idea per caption, three illustrated
  paper prints for the human moments (Sputnik, the Moon, the first booster landing), a stats card, more annotations
  and a calendar finale.

- Pick data with one clear surprise. Here a single rocket model flies most of a country's launches, so the bar
  literally breaks the chart.
- Generate every number from the source file and print it in the source line. Viewers trust a dated credit.
- Leader lines and labels clash easily. Re-check stills after each layout change, and soften any camera push-in
  so labels are never cropped.
- `av_check` treats each caption as a scene. Start each caption about 8 frames before its VO line, and leave at
  least 8 frames of breath between lines.
