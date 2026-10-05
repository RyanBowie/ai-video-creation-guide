# Build prompt: "One rocket breaks the chart" (38 s data-storytelling short)

This prompt produced `launch-race.html` and `launch-race.mp4`. It combines the original brief with the decisions
made during the build. Paste it into a Copilot session that has the `motion-graphics`, `tts-voiceover` and `av-sync`
skills to reproduce or remix the short. Swap the dataset to tell a different data story in the same style.

---

## The prompt

> Use the **Data Storytelling** style from
> [lemomo-ai/lemo-opuscar `styles/dataviz/STYLE.md`](https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/dataviz/STYLE.md)
> to make a **30–40 second MP4** about real data. Recommend a dataset that is open, accurate and has a surprising
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
> **Beats (1140 frames):**
> 1. **Sputnik (0–250):** a single column appears and a pencil labels it. A radio beep plays. VO: "October, nineteen
>    fifty-seven. One small beep from orbit."
> 2. **The race (250–390):** the chart frame draws itself and the bars start racing. VO: "Ten years on, the Soviet
>    Union leads the race."
> 3. **The fall (390–534):** Soviet launches peak at 108 in 1982 and fall after 1991. VO: "Then the Soviet Union
>    ends... and so does the boom."
> 4. **China (534–645):** after a quiet decade, China takes the lead in 2018. VO: "Twenty eighteen. China takes the
>    lead."
> 5. **Falcon (645–860):** the US bar grows past the axis and **tears the chart frame**. A paper flap flips over and
>    the axis is re-ruled with ratchet taps. A red pencil brackets the bar: "≈92% one rocket: Falcon 9". VO: "Then
>    one rocket breaks the chart. Falcon 9 flew nine in ten American launches."
> 6. **Today (860–1040):** the world total for last year is circled in red (324). The current year's empty cell is
>    marked with a question mark and the latest data date. VO: "Three hundred and twenty-four launches in one year.
>    The next cell is still empty."
> 7. **Source card (1040–1140):** data credit and "Made with GitHub Copilot and Opus 5.5".
>
> **Sound.**
> - Narrator: edge-tts `en-GB-RyanNeural` at +2%. Trim each clip's trailing silence.
> - Synthesised pencil and paper SFX on the impact frame: scratches for handwriting, a line for each leader line,
>   a ruler, a paper tear, a flip and ratchet taps.
> - A data-driven score: one soft plonk per year, pitched by that year's world total, over a D–Bm–G–A pad.
>   Duck it under the VO, and leave two short silences before the finale.
> - Run `av_check` and fix every FAIL and WARN before exporting.

## Files

| File | What it does |
|---|---|
| `build_data.py` | Downloads GCAT `launchlog.tsv` and writes `data.js` (per-year counts, world total, Falcon 9 count) |
| `data.js` | Generated data. Re-run `build_data.py` to refresh it |
| `launch-race.html` | Player: loads the scripts, scrub bar, play and export hooks |
| `engine.js` | Paper, timeline, annotations, bar race, tear and re-rule, captions, camera and `render()` |
| `audio.js` | `VO_CUES`, `SFX_CUES`, synthesised SFX, the data-driven score and `exportAudio()` |
| `make_voice.py` | Generates `voice.js` and `voice_timing.js/.json`. Clips are trimmed to their last audible sample |
| `export.py` | `--stills N…` for QA frames; with no arguments renders `launch-race.mp4` |

## Run, check and export

```powershell
cd launch-race
python build_data.py            # refresh data.js from GCAT (or: python build_data.py launchlog.tsv)
python make_voice.py            # regenerate all VO (or: python make_voice.py falcon)
python export.py --stills 120 450 700 900 1080
python "$env:USERPROFILE\.copilot\skills\av-sync\av_check.py" launch-race.html
python export.py                # launch-race.mp4
```

`av_check` passes with 0 FAIL and 0 WARN.

## Lessons from the build

- Pick data with one clear surprise. Here a single rocket model flies most of a country's launches, so the bar
  literally breaks the chart.
- Generate every number from the source file and print it in the source line. Viewers trust a dated credit.
- Leader lines and labels clash easily. Re-check stills after each layout change, and soften any camera push-in
  so labels are never cropped.
- `av_check` treats each caption as a scene. Start each caption about 8 frames before its VO line, and leave at
  least 8 frames of breath between lines.
