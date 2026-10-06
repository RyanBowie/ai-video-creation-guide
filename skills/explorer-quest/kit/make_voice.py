"""Generates voice.js (voiceover clips, base64 MP3) + voice_timing.js/.json (word timings) for sofia-explorer.html.
Usage:  python make_voice.py [key ...]   (needs: pip install --user edge-tts)
        With keys, only those clips are regenerated and merged into the existing voice.js.
Voices: an edge-tts dict, or a free local voice from the tts-voiceover catalogue as an ID ("kokoro:bm_george")
or {"id": ..., options}. List them: python ~/.copilot/skills/tts-voiceover/free_tts/free_tts.py --list
"""
import asyncio, base64, json, pathlib, sys
import edge_tts

FREE_TTS = pathlib.Path.home() / ".copilot/skills/tts-voiceover/free_tts"
def is_free(voice):  # catalogue ID or {"id": ...}; plain edge-tts dicts have "voice" instead
    return isinstance(voice, str) or "id" in voice

# adventure-trailer narrator: the house narrator, a touch slower and lower than the retro cut
NARR = dict(voice="en-US-AndrewMultilingualNeural", rate="-4%", pitch="-2Hz")
SOFIA = dict(voice="en-US-AvaMultilingualNeural", rate="+0%", pitch="+0Hz")

LINES = {
    "open":  (NARR,  "Six months... off the map."),
    "best":  (SOFIA, "Best. Sabbatical. Ever!"),
    "home":  (NARR,  "Twelve countries, one explorer... and now, the long road home."),
    "quest": (NARR,  "Her greatest expedition yet? The Great Copilot Quest."),
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
    import sys
    only = sys.argv[1:]
    here = pathlib.Path(__file__)
    clips, timing = {}, {}
    if only:
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
    pathlib.Path(__file__).with_name("voice_timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    # the page reads word timings as a script (window.VT) so it also works without fetch()
    pathlib.Path(__file__).with_name("voice_timing.js").write_text("window.VT = " + json.dumps(timing, indent=1) + ";\n", encoding="utf-8")
    path = pathlib.Path(__file__).with_name("voice.js")
    path.write_text("window.VOICE = " + json.dumps(clips) + ";\n", encoding="utf-8")
    print("wrote", path)

asyncio.run(main())


