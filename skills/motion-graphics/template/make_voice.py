"""Generates voice.js (voiceover clips, base64 MP3) + voice_timing.js/.json (word timings) for copilot-ai-human.html.

Usage:  python make_voice.py [key ...]   (needs: pip install --user edge-tts)
        With keys, only those clips are regenerated and merged into the existing voice.js.
Edit LINES below to change the script or voices, then re-run and refresh the page.

Voices: an edge-tts dict (below), or a free local voice from the tts-voiceover catalogue given as an ID string
("kokoro:bm_george", "piper:alan", "chatterbox:excited", ...) or a dict with "id" plus options
({"id": "kokoro:bm_george", "speed": 0.93}). List them: python ~/.copilot/skills/tts-voiceover/free_tts/free_tts.py --list
Free voices render offline in their own venvs and are timed with faster-whisper; edge and free voices can be mixed.
"""
import asyncio, base64, json, pathlib, sys
import edge_tts

NARRATOR = dict(voice="en-US-AndrewMultilingualNeural", rate="-4%", pitch="+0Hz")
GANDALF = dict(voice="en-GB-ThomasNeural", rate="-22%", pitch="-14Hz")
VADER = dict(voice="en-US-ChristopherNeural", rate="-12%", pitch="-24Hz")
# e.g. GANDALF = "kokoro:bm_george"  or  {"id": "chatterbox:clone", "ref": "my_voice.wav"}

FREE_TTS = pathlib.Path.home() / ".copilot/skills/tts-voiceover/free_tts"
def is_free(voice):  # catalogue ID or {"id": ...}; plain edge-tts dicts have "voice" instead
    return isinstance(voice, str) or "id" in voice

LINES = {
    "intro":   (NARRATOR, "Copilot. A short story about A.I., and imagination."),
    "library": (NARRATOR, "A.I. learns from everything we've written. Books, articles, code and conversations... all become patterns."),
    "prompt":  (NARRATOR, "Ask it for the next Lord of the Rings, or the next Star Wars, and it knows the style. But it remixes what already exists."),
    "gandalf": (GANDALF,  "But a new Tolkien? That kind of magic... comes from you."),
    "vader":   (VADER,    "Or a new George Lucas? Your greatest twist... will come from a human mind."),
    "writer":  (NARRATOR, "The next great story doesn't come from data. It comes from people."),
    "split":   (NARRATOR, "Let A.I. do more of the reasoning, the automation, the mundane... so people can think more... imagine more... and decide what matters, and what's next."),
    "fellow":  (NARRATOR, "Less doing. More thinking. Build the tools that free people to create, and you build a better workforce for the future."),
    "outro":   (NARRATOR, "A.I. accelerates. Humans create. Copilot is part of the fellowship. You write the story."),
}

async def tts(voice, text):
    out, words = bytearray(), []
    async for chunk in edge_tts.Communicate(text, boundary="WordBoundary", **voice).stream():
        if chunk["type"] == "audio":
            out += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            words.append((round(chunk["offset"] / 1e7, 2), chunk["text"]))
    return bytes(out), words

async def main():
    only, here = sys.argv[1:], pathlib.Path(__file__)
    clips, timing = {}, {}
    if only:  # re-voice just these keys and keep every other clip as it is
        bad = [k for k in only if k not in LINES]
        if bad:
            raise SystemExit(f"unknown key(s) {bad}; choose from {list(LINES)}")
        clips = json.loads(here.with_name("voice.js").read_text(encoding="utf-8")[len("window.VOICE = "):].rstrip().rstrip(";"))
        timing = json.loads(here.with_name("voice_timing.json").read_text(encoding="utf-8"))
    todo = {k: v for k, v in LINES.items() if not only or k in only}
    free = {k: v for k, v in todo.items() if is_free(v[0])}
    if free:  # free local voices render in one batch per engine
        sys.path.insert(0, str(FREE_TTS))
        import free_tts
        for key, r in free_tts.render(free, bitrate="48k", sr=24000).items():
            clips[key] = base64.b64encode(r["mp3"]).decode()
            timing[key] = {"dur": r["dur"], "words": r["words"]}
            print(f"{key:8} {r['dur']:5.2f}s  [{r['id']}]  " + " ".join(f"{w}@{int(o * 30)}" for o, w in r["words"]))
    for key, (voice, text) in todo.items():
        if key in free:
            continue
        # the online service occasionally truncates a clip, so keep the longest of three takes
        takes = [await tts(voice, text) for _ in range(3)]
        best, words = max(takes, key=lambda t: len(t[0]))
        clips[key] = base64.b64encode(best).decode()
        timing[key] = {"dur": round(len(best) / 6000, 2), "words": words}
        # word@frame (30 fps, relative to the clip's cue) -> sync pop-ins / SFX to spoken words
        print(f"{key:8} {len(best) / 6000:5.2f}s  " + " ".join(f"{w}@{int(o * 30)}" for o, w in words))
    here.with_name("voice_timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    # the same timings as a script (window.VT) so a page can read them without fetch()
    here.with_name("voice_timing.js").write_text("window.VT = " + json.dumps(timing, indent=1) + ";\n", encoding="utf-8")
    path = here.with_name("voice.js")
    path.write_text("window.VOICE = " + json.dumps(clips) + ";\n", encoding="utf-8")
    print("wrote", path)

asyncio.run(main())
