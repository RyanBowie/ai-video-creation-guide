# Starter prompt template

Copy this into a new GitHub Copilot app session (Claude Opus 5.5, reasoning effort **High**). The three sections in square brackets are **your inputs**: replace each `(Your input: ...)` line with your own.

| Input | What to put in it |
| --- | --- |
| **[Context]** | What the video is about, who it's for, the story or key message, and any characters, brand or tone. |
| **[Reference Videos]** | Screenshots, MP4 files or links to videos and repos you like, and what you like about each. Delete it if you have none. |
| **[Extra Sources]** | Optional: documents, brand guidelines, logos, a script, music you have the rights to, or facts to get right. |

You can ask Copilot to tailor the wording for you first.

```text
I want you to build a short animated video, drawn entirely in code, that brings the context below to life. To start with, keep it under about 30 seconds so I can review it, and produce it as an MP4.

Everything in square brackets below is my input. Treat it as the brief.

[Context]
(Your input: what the video is about, who it's for, the story or key message, and any characters, brand, tone or must-have moments.)

[Reference Videos]
(Your input: screenshots, MP4 files or links to videos and repos you like. For each one, say what you like about it, for example the art style, colours, characters, pacing, transitions or music. Delete this section if you have none, and Copilot will use the community repos below.)

Study my references to understand what makes them work: the art style, colour palette, character design, camera moves, pacing, transitions and how the sound lines up with the picture. For MP4s, pull out stills and listen to the audio. For repos, read the README and code to see how the animation is built. Take inspiration from them, but don't copy them: build something original that fits my context.

You can also learn from these public community repos:
- JohnHeibel/PDoomVideo (https://github.com/JohnHeibel/PDoomVideo): the source code for the Claude Opus 5.5 music video "I'm Upping My P(doom)", an example of advanced code-driven animation synced to music.
- lemomo-ai/lemo-opuscar (https://github.com/lemomo-ai/lemo-opuscar): 43 film styles, each a reusable style prompt plus a short film made entirely in code.

There are also many other reference repos that show different designs and styles. Go through my references and these repos to decide the most appropriate style for my context. Briefly tell me which style you picked and why, then carry on.

Feel free to get creative with this design: cool animations, characters, whatever you need to complete the scene. Also cover the audio: sounds, music, voiceovers or anything else you need. You have creative freedom to build something really quite cool here.

[Extra Sources]
(Your input, optional: anything else to use, such as documents, brand guidelines, logos, a script or voiceover text, music you have the rights to, or facts the video must get right. Delete this section if you have nothing to add.)

Take your time with the generation. Think creatively and make this something really new and fresh.
```

## How to add your references

- **Screenshots:** paste or drag images into the chat with the prompt, then describe them under [Reference Videos], for example "the first screenshot: I like the paper texture and soft colours".
- **MP4 files:** copy them into your project folder (for example a `references` folder) and give the file names. Copilot can pull out stills and the audio to study the style and pacing.
- **Links:** GitHub repos work best, because Copilot can read the README and code. For YouTube and other video sites it can usually only read the page, not watch the video, so add a screenshot or describe what you like.

Use references for inspiration, not copying. Don't ask Copilot to reproduce someone else's characters, artwork or music.

## Optional add-ons

Paste any of these at the end of the prompt.

- **Use the skills from this repo** (after installing them; see the [README](../README.md#install-the-skills)):
  `Before you start, load the motion-graphics, character-rig, retro-anime, explorer-quest, tts-voiceover, audio-edit and av-sync skills from ~/.copilot/skills/ and use whichever fit the style you pick.`
- **Lock a look:**
  `Use the retro-anime skill (90s cel-anime / arcade look)` or `Use the explorer-quest skill (vintage explorer / 16 mm film look)`.
- **Keep it reviewable:**
  `Before exporting, take a contact sheet of stills and check each scene against the brief. Rework anything that isn't up to the quality bar.`
- **Check the sync:**
  `Run the av-sync checker on the final MP4 and fix any FAIL findings.`

## Tips

- Start short (20–30 s), review the result, then ask for changes or an extension. Iterating works far better than one giant prompt.
- Give concrete feedback: "the title lands too early", "make the caption readable on mobile", "swap the music for something calmer".
- Everything is drawn in code (HTML Canvas / SVG / WebGL) and rendered to MP4 with headless Edge and ffmpeg. You don't need paid image or video generation.
