# Build prompt — "Microsoft Model Hub" (53.5 s motion-graphics explainer)

This is the consolidated prompt that produced `microsoft-model-hub.html` / `.mp4`. It combines the original brief
and every piece of feedback given during the build into one prompt. Paste it into a Copilot session that has the
`motion-graphics`, `tts-voiceover` and `character-rig` skills to reproduce or remix the video.

---

## The prompt

> Use the **motion-graphics** skill (SVG `render(F)` engine, template `copilot-ai-human.html`, `make_voice.py`,
> `export_mp4.py`) and the **tts-voiceover** skill to build a code-drawn animated explainer. Take inspiration from Addy
> Osmani's "how browsers work in 40 seconds" (each frame drawn in JavaScript: playful, fast, little characters,
> clean diagrams).
>
> **Message:** Microsoft is the central hub for multi-lab AI. In Claude (Claude Code) you can only pick Claude
> models. In ChatGPT Desktop (Codex in the ChatGPT desktop app) you only get OpenAI models. Microsoft (Microsoft 365
> Copilot, Copilot Cowork and GitHub Copilot) brings OpenAI, Anthropic and Google models together. Put a **keen
> focus on Work IQ**: Copilot is grounded in your work (email, meetings, files, chats, people, business apps)
> without the user building extra connectors.
>
> **Characters: build them from the real product icons, not generic coloured figures.**
> - Claude = the **Claude Code pixel critter** (orange block body, square eyes, four stubby legs), not the generic
>   Claude starburst.
> - OpenAI / ChatGPT = the OpenAI knot logo as a head/body.
> - Gemini = the four-point Gemini sparkle with its blue→purple→rose gradient.
> - GitHub Copilot = the cat-eared Copilot head (visor + two eye pills), with an ink outline.
> - Microsoft = the four-colour square (#F25022, #7FBA00, #00A4EF, #FFB900).
>
> Use the official SVG logo paths as the body. Add stubby limbs, a walk gait, blinking eyes that can look around,
> and moods (happy, mad, sad, "o", meh) so each logo becomes a mascot. Label Codex as **ChatGPT Desktop**.
>
> **Scenes (one idea + one headline each), night palette, 1920×1080 @ 30 fps:**
> 1. **Hook (≈4 s):** three floating islands rise on springs, one per lab, each walled in by a glass fence. The
>    mascot stands inside. VO: "Three brilliant A.I. labs... three walled gardens."
> 2. **Claude (≈6 s):** the Claude Code critter doodles a little picture in a light window. A cursor opens the
>    model dropdown: Claude models are available, and the GPT row is locked and shakes when clicked. VO: "In
>    Claude, you pick a Claude model. Want G.P.T.? It's not on the menu."
> 3. **ChatGPT Desktop (≈7 s):** a dark terminal window in ChatGPT Desktop. Type `/model claude-opus-5.5`; it is
>    rejected with "not available". The OpenAI mascot looks sad. VO: "In ChatGPT Desktop? OpenAI models only.
>    Want Claude? Not available."
> 4. **Fight (5 s):** the Claude, OpenAI and Gemini mascots brawl inside a cartoon dust cloud, with comic bursts
>    (POW! BAM! ZAP! KRAK!). The Microsoft four-square block falls with speed lines and lands with a squash,
>    screen shake, shockwave and dust. The fighters are flung out spinning. The GitHub Copilot mascot pops up on
>    top wearing a Copilot-mark crown. VO: "So the agents fight it out... and Microsoft lands on top."
> 5. **Hub (≈11 s):** the lab islands sink and free their mascots. Paths draw in to a central Microsoft hub.
>    Three product cards spring in **exactly on the spoken product names**: Microsoft 365 Copilot (OpenAI +
>    Claude), Copilot Cowork (OpenAI + Claude), GitHub Copilot (OpenAI + Claude + Gemini). VO: "Because
>    Microsoft brings them all together... in Microsoft 365 Copilot, Copilot Cowork, and GitHub Copilot."
> 6. **Picker (≈4 s):** a model picker cycles through GPT-6 Sol → Claude Opus 5.5 → Gemini 3.8 Flash. VO: "Pick
>    the best model for every task."
> 7. **Work IQ (≈11 s):** a radial diagram with a Copilot/Work IQ centre and nodes for Email, Meetings, Files,
>    Chats, People and Business apps. A prompt is typed. Answer lines fly along curves from each node into the
>    answer, and each source node glows as it contributes. VO: "And with Work IQ, every model knows your work.
>    Email, meetings, files, chats, people... already connected. No extra plumbing."
> 8. **Outro (≈6 s):** all the mascots wave together around the Copilot mark. Headline "Every model. All your
>    work. One Copilot." VO: "Every model... all your work... one Copilot. That's Microsoft."
>
> **Voice & pacing:**
> - Narrator: `en-US-AndrewMultilingualNeural` at −4%. Keep the voiceover unhurried and use ellipses for pauses.
> - Say **"Microsoft 365", never "M365"** (TTS reads it as "M… 365").
> - Record word timings (`voice_timing.json`) and sync card pop-ins and SFX to the spoken words.
> - Extend a scene's `dur` rather than speeding up the voice. Target 30–40 s, but readability beats the target;
>   the final cut is 53.5 s.
>
> **SFX (synthesised):** pop, clunk, whoosh, scribble, click, deny buzz, typing, fight hits, a big impact on the
> block landing, and chimes on the hub cards.
>
> **Deliverables:** `microsoft-model-hub.html` (player: Space/R/M/H, `?frame=N` stills), `voice.js`,
> `voice_timing.json`, `make_voice.py`, `export_mp4.py` and `microsoft-model-hub.mp4`. Copy the folder to
> `<your-folder>\microsoft-model-hub`.

---

## Feedback rounds that shaped it (in order)

1. **Original brief:** Addy Osmani-style JS animation of Microsoft as the central multi-model hub; Claude can't
   pick OpenAI and Codex can't pick Claude; 30–40 s; full creative freedom.
2. **"Codex is now ChatGPT Desktop"; build the characters from their actual icons** (Copilot, Claude, Codex,
   Gemini).
3. **Keen focus on Work IQ:** Copilot connects to many things without extra connectivity.
4. **Put it in `<your-folder>\microsoft-model-hub`.**
5. **v2 changes:**
   - The GitHub Copilot icon needs its cat ears.
   - Slow the voiceover down.
   - Add a fight where Microsoft lands on top.
   - Use the real Claude/Gemini/OpenAI icons as animated characters.
6. **"I mean the Claude Code icon":** the pixel critter, not the Claude starburst.
7. **Fact-check (research session):** confirmed the naming "Codex in the ChatGPT desktop app". The user chose to
   keep the `/model claude-opus-5.5` beat and change only the naming to ChatGPT Desktop.
8. **Audio:** say "Microsoft 365" instead of "M365". The hub scene was lengthened and its cards retimed to the new
   words.

## Build steps

```powershell
pip install --user edge-tts playwright imageio-ffmpeg
python make_voice.py                                  # voice.js + voice_timing.json
python -m http.server 8765 --bind 127.0.0.1           # preview stills: ?frame=N
python export_mp4.py microsoft-model-hub.html microsoft-model-hub.mp4
```
