"""Generates voice.js (voiceover clips, base64 MP3) + voice_timing.js/.json (word timings) for sofia-retro.html.
Usage:  python make_voice.py [key ...]   (needs: pip install --user edge-tts)
        With keys, only those clips are regenerated and merged into the existing voice.js.
"""
import asyncio, base64, json, pathlib
import edge_tts

NARR = dict(voice="en-US-AndrewMultilingualNeural", rate="+5%", pitch="+0Hz")
SOFIA = dict(voice="en-US-AvaMultilingualNeural", rate="+5%", pitch="+0Hz")
RAJ = dict(voice="en-GB-RyanNeural", rate="+10%", pitch="+0Hz")
MAYA = dict(voice="en-US-EmmaMultilingualNeural", rate="+10%", pitch="+2Hz")
LEO = dict(voice="en-US-BrianMultilingualNeural", rate="+10%", pitch="+0Hz")

LINES = {
    "travel":  (NARR,  "Six months. Twelve countries. Beaches, mountains... and not a single email."),
    "ahh":     (SOFIA, "Ahh... this is the life."),
    # split into three clips so the stage card, the "6 MONTHS BEHIND" stamp and the STATUS window each get their own beat
    "back":    (NARR,  "It's Sofia's first day back, after a six-month sabbatical."),
    "behind":  (NARR,  "Six months behind..."),
    "mode":    (NARR,  "...and in full catch-up mode."),
    "good":    (SOFIA, "Okay... six months to catch up on. Where do I even start?"),
    "c1":      (RAJ,   "Copilot prepped my client meeting in five minutes!"),
    "c2":      (MAYA,  "I just asked Copilot to summarise the whole project."),
    "c3":      (LEO,   "Have you caught up on missed messages yet?"),
    # "Oh!" not "Ooh!" (edge-tts stretches "Ooh" into an odd moan)
    "session": (SOFIA, "Oh! Hannah's running a session tomorrow."),
    "what":    (SOFIA, "Microsoft 365 Copilot? What's that?"),
    "find":    (SOFIA, "Let's find out!"),
    "enter":   (NARR,  "Enter Copilot."),
    "inbox":   (NARR,  "It sorts the inbox, and summarises what really matters."),
    "drafts":  (NARR,  "Drafts her replies, ready to review, and adds her actions to Planner."),
    "clash":   (NARR,  "Untangles the calendar."),
    "avail":   (NARR,  "Then checks when Hannah is free, and books a catch-up."),
    "missed":  (NARR,  "Recaps six months in sixty seconds."),
    # one event per possessive: "Hannah's" already names the catch-up, so the session is "tomorrow's"
    "prep":    (NARR,  "Gets her ready for tomorrow's session."),
    "got":     (SOFIA, "Okay. I've got this."),
    "outro":   (NARR,  "Microsoft 365 Copilot. Welcome back."),
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
    for key, (voice, text) in LINES.items():
        if only and key not in only:
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


