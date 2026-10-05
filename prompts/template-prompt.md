# Starter prompt template

Copy this into a new GitHub Copilot app session (Claude Opus 5.5, reasoning effort **High**). Replace **[Context]** with your story or brief, and **[Extra Sources]** with any links, images or documents you want Copilot to use. You can ask Copilot to tailor the wording for you first.

```text
JohnHeibel/PDoomVideo (https://github.com/JohnHeibel/PDoomVideo) is the source code for the Claude Opus 5.5 music video "I'm Upping My P(doom)". It's an example of a repo being used to produce some advanced animation. I want you to build an animation, not necessarily in a similar style, that covers the specific context below. To start with, keep the animation under about 30 seconds so I can review it, and produce it as an MP4.

[Context]

Feel free to get creative with this design: cool animations, characters, whatever you need to complete the scene. Also cover the audio: sounds, music, voiceovers or anything else you need. You have creative freedom to build something really quite cool here.

lemomo-ai/lemo-opuscar (https://github.com/lemomo-ai/lemo-opuscar) has 43 film styles, each a reusable style prompt plus a short film made entirely in code. There are also many other reference repos that show different designs and styles. Go through these to decide the most appropriate style for the context provided above.

[Extra Sources]

Take your time with the generation. Think creatively and make this something really new and fresh.
```

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
