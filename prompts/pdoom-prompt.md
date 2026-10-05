> Adapted from the one-prompt Opus 5.5 video prompt by donald (@donaldjewkes): https://x.com/donaldjewkes/status/2102801274173587569. Original video and code by John Heibel: https://github.com/JohnHeibel/PDoomVideo

I've included a link to the original video, "Claude Pop – I'm Upping My P(doom)" (source: github.com/JohnHeibel/PDoomVideo). It's a pop song about the increasing rate of progress and the feeling of the singularity approaching.

Before you start, load these skills from `~/.copilot/skills/` and use them throughout. They hold the style, cast and workflow we've already locked in, so the result stays consistent:
- **character-rig**: the cast, the papery watercolour / boiling-ink Canvas engine, props, Microsoft easter eggs, and the beat-synced music-video scene engine (scene list, transitions, karaoke, stills, MP4 export). Start from its `assets/`.
- **audio-edit**: cuts lyric bars out of the song cleanly and keeps the video in sync.
- **motion-graphics**: story, pacing and transition craft.
- **tts-voiceover**: only if you add any spoken lines.

I want you to independently do a complete end-to-end pass on an updated version of this video. Use the same audio track, and think deeply about the best way to represent every lyric visually on screen. You don't need to anchor to the original style; you can do anything that helps you express yourself visually, including abstract motion graphics.

But instead of being about Claude specifically, I want this to be about M365 Copilot.

**Remove any inappropriate language or parts of any songs included.** The song and video still need to flow correctly afterwards. Use audio-edit to cut whole bars on the beat grid with an equal-power crossfade, so there's no click or stumble at the splice. Remap the video timeline around each cut, hide the removed lyrics, drop the scenes that illustrated them, and land a transition exactly on the splice so the edit feels intentional.

You can use the internet freely to pull in references, and you can study motion design. I want a new music video with beautifully rendered JavaScript animations and a papery feel, in a similar style to the reference. Push the aesthetics in whatever direction you want, and consider what's part of the modern zeitgeist.

Think about your current capabilities and what's realistic for you to do. Look through the working folder for any previous work to learn from. Everything should be drawn in code on an HTML Canvas: no npm, and no paid image or video generation. The character-rig skill already gives you a consistent cast and engine, so build on that rather than generating assets.

The pop protagonist represents Copilot. The original has a sunflower-esque Claude character. Ours is a feminine Copilot pop idol with rainbow twin-tails in the Copilot gradient, a headset mic, and Copilot-logo accessories. She's personified and matches the feminine vocals. Give her backup dancers from the Office family: Word, Excel, PowerPoint, Outlook and Teams, each in their app colours with the logo on the chest. Use Excel, not Xbox. Supporting characters include Clippy (lots of Clippy), a cute shoggoth wearing a smiley mask, cats, a chinchilla, a basilisk and other critters.

Be mindful of aesthetics. I don't want GPT slop. Come up with a coherent style and stick to it: a warm paper texture, film grain, watercolour fills, inked outlines that boil subtly, handwritten display lettering (Windows system fonts such as Ink Free and Segoe Print), and gradients from the Copilot palette (cool blue→purple, warm peach→pink→purple, and a rainbow ribbon). Don't fit too heavily to Pixar. K-pop is a good visual anchor for how attention is directed, but I'll let you cook.

Character design rules we've learned the hard way:
- **Full-body characters.** Use full-body chibi characters, not floating close-up faces.
- **Clean limbs.** Use tapered capsule limbs with no circles at the shoulders, elbows, knees or ankles/feet.
- **Cute "scary AI".** The original has a great red effect with a zoom into the red eyes. Keep that: shini red glowing eyes, a warm red vignette and a slow push-in. It should stay cute and playful, never horror.

Sprinkle Microsoft references throughout as easter eggs: the Blue Screen of Death, the Windows XP Bliss hill, Solitaire's cascading cards, Minesweeper, MS Paint, the Office icons, and Clippy wherever paperclips come up. These are the moments people will screenshot.

You don't need visible lip-sync the whole way through. Think of a regular music video: some inserts have no characters in them, and sometimes the characters are doing something else entirely. For the world-building, create a sense of speeding up. Audit the events and Twitter-timeline memes around AI progress, such as Navier–Stokes, math getting eaten up, NVDA to the moon, shoggoths, the basilisk, Sydney, "feel the AGI", scaling and GPUs. Work in the ones that fit the lyrics. Internet-brutalism inserts are welcome, but anchor to references people will recognise. The goal is for this to be widely appreciated by a tech Twitter audience.

We need a strong, compelling visual hook that gets people excited quickly. Build a ~36-second hook cut first so the look can be approved, then extend it to the full song.

Retaining attention is best done with text on screen. Build amazing motion graphics for the lyrics, embedded in the video itself, and compose shots around them: keep the background calmer where a lyric is big, and put characters on the right while the lyrics appear on the left. Vary it. Sometimes the lyrics are a karaoke subtitle pill at the bottom, and sometimes they're huge kinetic word pops and stamps. At the start, for the hook, the lyrics should be much more visually present.

Timing and motion rules:
- **On the beat.** Find the BPM and first downbeat, and land every scene change on a bar. Dancers hit poses on the beat, and the camera punches, shakes and kicks on downbeats.
- **Transitions.** Use ink splats, paper tears and wipes that are motivated by objects in the scene. Never flash bright white, especially into a dark scene.
- **Reading holds.** Give text about 2.5 seconds to be read. If a scene hangs, trim it by a second or two rather than padding it.

End the video with the Copilot logo and the credit "Made with GitHub Copilot and Opus 5.5".

Export a 1920×1080, 30fps MP4 using the character-rig export: headless Edge via Playwright renders each frame, and ffmpeg encodes it as H.264 with the edited song as AAC and a 1.2s fade-out.

Remember, you can really do anything here. The goal is to make this pop, and the stretch goal is something better than anyone's seen before. When things come together without the thinking done up front, the result can feel jarring, so be rigorous in planning composition and timing so everything meshes cleanly.

Be open to going back and reworking things. Watch the whole video multiple times, take stills at individual moments (a contact sheet works well), and ask whether each part is really up to the quality bar. Nail the style of the animations. The reference GitHub project is a good foundation, but it could be much, much stronger. Search for other motion and JavaScript animation references and integrate what's useful. Spend what you need, but be economical, and see what you can cook up.
