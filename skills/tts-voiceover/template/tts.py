"""Generate voiceover clips with edge-tts.

Usage:
    pip install --user edge-tts
    python tts.py                 -> out/<key>.mp3
    python tts.py --bundle        -> also writes voice.js (window.VOICE = {key: base64 mp3})

Edit LINES below. Rate/pitch must be signed strings ("-4%", "+0Hz").
"""
import asyncio, base64, json, pathlib, sys
import edge_tts

NARRATOR  = dict(voice="en-US-AndrewMultilingualNeural", rate="-4%",  pitch="+0Hz")
NARRATOR_F= dict(voice="en-US-AvaMultilingualNeural",    rate="-4%",  pitch="+0Hz")
WIZARD    = dict(voice="en-GB-ThomasNeural",             rate="-22%", pitch="-14Hz")
DARKLORD  = dict(voice="en-US-ChristopherNeural",        rate="-12%", pitch="-24Hz")

# key -> (voice, line).  Use "..." for a long beat, "A.I." for spoken acronyms,
# and never strand a single word at the end of a sentence.
LINES = {
    "intro": (NARRATOR, "Replace me. A short line, written the way it should be said."),
    "beat":  (WIZARD,   "A pause changes everything... when it lands in the right place."),
}

TAKES = 3  # the service sometimes truncates a clip; keep the longest take


async def tts(voice, text):
    out = bytearray()
    async for chunk in edge_tts.Communicate(text, **voice).stream():
        if chunk["type"] == "audio":
            out += chunk["data"]
    return bytes(out)


async def main():
    here = pathlib.Path(__file__).parent
    outdir = here / "out"
    outdir.mkdir(exist_ok=True)
    clips = {}
    for key, (voice, text) in LINES.items():
        takes = [await tts(voice, text) for _ in range(TAKES)]
        data = max(takes, key=len)
        (outdir / f"{key}.mp3").write_bytes(data)
        clips[key] = base64.b64encode(data).decode()
        print(f"{key:10} {len(data)/1024:6.1f} KB  ~{len(data)/6000:4.1f}s  [{voice['voice']}]")

    if "--bundle" in sys.argv:
        path = here / "voice.js"
        path.write_text("window.VOICE = " + json.dumps(clips) + ";\n", encoding="utf-8")
        print("wrote", path)
    print("wrote", outdir)


asyncio.run(main())
