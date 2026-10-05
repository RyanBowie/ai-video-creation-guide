# Sofia Return: Copilot Quest, Episode 1 (watercolour character-rig cut) (prompt)

This is the original watercolour / boiling-ink version of the Sofia story, built with the `character-rig` Canvas engine. [Sofia Retro](../sofia-retro/PROMPT.md) and [Sofia Explorer](../sofia-explorer/PROMPT.md) are later restyles of the same story. The final cut is **93 s** (`sofia-return.mp4`, 1080p30) and ends on "Created by GitHub Copilot".

Context: a gamified "Copilot quest" framing from a Copilot training deck, and a short scenario brief: Sofia, a director at a large company, returns from a 6-month sabbatical. (The brief also had her leading tomorrow's leadership meeting. A later follow-up replaced that with Hannah's Copilot session; see below.) Sofia, Hannah and Contoso are fictional.

> Reuse the skills and learnings from the previous videos (the model video, the music video and the others). Sofia has just come back from a 6-month sabbatical. Use this as an opportunity for Copilot to help her return to the office. Show Sofia in a 40–60 second animation that explains the problem:
> - Her inbox is massive, with thousands of emails. Some are internal and unimportant, some are really important, and she can't tell which is which because so much is marked high importance.
> - Her Teams and Outlook calendars are full of meetings. She doesn't know which to attend, she hasn't accepted any, and the many recurring ones have left her double-booked.
> - She's struggling to catch up on the last 6 months.
> - Colleagues around her are using new tools like Copilot and the newest models to build slide decks and Word documents.
>
> Design a friendly animation that shows how Copilot can help. Use all the character and motion design skills, and take creative freedom so it looks great. Add a prominent animated "Created by GitHub Copilot" credit at the end.
>
> Follow-up: also show Copilot adding tasks to Planner, drafting email replies ready for her review, and checking a colleague's availability to book a catch-up call. (This takes the video to about 70 s.)
>
> Follow-up: amid the frustration, have Sofia daydream about being back on holiday. Expand the opening into a travel montage of her sabbatical destinations ending on a beach, in a swimsuit on a sun lounger, so she feels pooped when she's back at work. Have her spot tomorrow's Copilot session ("Microsoft 365 Copilot? What's that? Let's find out!"). Seat the colleagues at desks with devices, discussing how they use Copilot. (This takes the video to about 93 s.)
>
> Follow-up: she doesn't lead a leadership meeting. She finds a meeting in her calendar, an introduction to Microsoft 365 Copilot led by Hannah, so emphasise that.
>
> Follow-up: open with "It's Sofia's first day back after a 6-month sabbatical" and keep the focus on her being 6 months behind and in catch-up mode. Order the beats so she sees the mess first, then spots Hannah's session, and only then asks "Microsoft 365 Copilot? What's that? Let's find out!"
>
> Follow-up (design): fix the shoulders, use shoes that suit trousers, put the three colleagues in Microsoft 365 Copilot shirts, use a beach chair she clearly sits on, give the sun more detail, and dress her for the beach in a swimsuit.

The calendar row reads "Intro to Microsoft 365 Copilot — Hannah". The lines are: "It's Sofia's first day back after a six-month sabbatical. Six months behind... and in full catch-up mode." (narrator), then later "Ooh! Hannah's running a session tomorrow." / "Microsoft 365 Copilot? What's that?" / "Let's find out!" (Sofia).

## Build

- Engine: character-rig watercolour Canvas2D (`core.js`, `cast.js`, `fx.js`) plus Sofia's rig and props (`sofia.js`).
- Scenes: `scenes_a.js`, `scenes_b.js`. Timeline, VO and SFX cues: `timeline.js`.
- VO: `python make_voice.py [keys?]` (pass keys to regenerate just those lines), which uses edge-tts and writes `voice.js` and `voice_timing.json`.
- QA: `python stills.py 4 20 44 49 55 67` (writes PNGs and a contact sheet to `stills/`) and `av_check.py sofia-return.html` (from the `av-sync` skill).
- Export: `python export_mp4.py sofia-return.html` (headless Edge, needs `pip install --user playwright imageio-ffmpeg`).
- Preview: run `python -m http.server 8000` in this folder, open http://localhost:8000/sofia-return.html and press Space. `?frame=N` renders a still.
