"""Render copilot-ai-human.html to an MP4 (1920x1080, 30fps, with voiceover + SFX).

Usage:  python export_mp4.py [input.html] [output.mp4]
Needs:  pip install --user playwright imageio-ffmpeg   (uses the installed Edge, no npm)
"""
import base64, http.server, os, subprocess, sys, threading, time
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else "copilot-ai-human.html"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(SRC)[0] + ".mp4"
WAV = os.path.join(HERE, "_soundtrack.wav")

# local server (file:// is blocked by browser policy); quiet handler
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=HERE, **k)
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{srv.server_address[1]}/{SRC}?frame=0"

with sync_playwright() as pw:
    br = pw.chromium.launch(channel="msedge", headless=True)
    page = br.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(url)
    total, fps = page.evaluate("[TOTAL, FPS]")
    print(f"{total} frames @ {fps}fps = {total / fps:.1f}s")

    print("rendering soundtrack...")
    with open(WAV, "wb") as f:
        f.write(base64.b64decode(page.evaluate("exportAudio()")))

    ff = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error",
        "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-",
        "-i", WAV, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-vf", "scale=out_color_matrix=bt709:out_range=tv", "-pix_fmt", "yuv420p",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT,
    ], stdin=subprocess.PIPE)
    t0 = time.time()
    for F in range(total):
        page.evaluate(f"render({F})")
        ff.stdin.write(page.screenshot(type="jpeg", quality=95))
        if F % 150 == 0:
            print(f"  frame {F}/{total}  ({time.time() - t0:.0f}s)")
    ff.stdin.close(); ff.wait()
    br.close()

srv.shutdown()
os.remove(WAV)
print("wrote", os.path.abspath(OUT) if os.path.isabs(OUT) else os.path.join(HERE, OUT))
