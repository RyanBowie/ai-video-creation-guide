"""Export paper-copilot.html -> MP4 (1920x1080 @ 30fps, H.264 + AAC) with the offline-rendered soundtrack.
Usage:
  python export.py [out.mp4]          full export
  python export.py --stills 30 200 …  write stills/fNNNN.jpg for QA (also reports timing + JS errors)
"""
import sys, os, threading, http.server, socketserver, functools, base64, subprocess, time
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
STILLS = [int(a) for a in args[1:]] if args[:1] == ['--stills'] else None
OUT = (args[0] if args and not STILLS else os.path.join(HERE, 'paper-copilot.mp4'))
WAV = os.path.join(HERE, '_soundtrack.wav')

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=HERE)
class Srv(socketserver.ThreadingTCPServer):
    daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]

def grab(pg, F):
    err = pg.evaluate(f'(() => {{ try {{ render({F}); return window.ERR || null; }} catch (e) {{ return String(e.stack || e); }} }})()')
    if err: print(f'ERR @ frame {F}:', err.splitlines()[:4])
    return base64.b64decode(pg.evaluate("document.getElementById('c').toDataURL('image/jpeg', 0.95)").split(',')[1])

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('pageerror', lambda e: print('pageerror:', e))
    pg.goto(f'http://127.0.0.1:{port}/paper-copilot.html?clean')
    pg.wait_for_function('window.READY === true || !!window.ERR', timeout=60000)
    if pg.evaluate('window.ERR'): raise SystemExit('boot error: ' + pg.evaluate('window.ERR'))
    total, fps = pg.evaluate('[TOTAL, FPS]')
    dur = total / fps
    if STILLS is not None:
        os.makedirs(os.path.join(HERE, 'stills'), exist_ok=True)
        for F in STILLS:
            t = time.time(); data = grab(pg, F)
            open(os.path.join(HERE, 'stills', f'f{F:04d}.jpg'), 'wb').write(data)
            print(f'frame {F}: {1000 * (time.time() - t):.0f} ms')
        b.close(); srv.shutdown(); raise SystemExit(0)
    print('rendering soundtrack…')
    open(WAV, 'wb').write(base64.b64decode(pg.evaluate('exportAudio()')))
    print(f'{total} frames @ {fps}fps = {dur:.1f}s -> {OUT}')
    ff = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
        '-i', WAV, '-map', '0:v', '-map', '1:a',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',  # paper grain makes crf<=20 balloon to ~40 Mb/s
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        '-c:a', 'aac', '-b:a', '192k', '-t', f'{dur:.3f}', '-movflags', '+faststart', OUT,
    ], stdin=subprocess.PIPE)
    t0 = time.time()
    for F in range(total):
        ff.stdin.write(grab(pg, F))
        if F % 150 == 0: print(f'  frame {F}/{total}  ({time.time() - t0:.0f}s)')
    ff.stdin.close(); ff.wait()
    b.close()
srv.shutdown()
os.remove(WAV)
print('wrote', OUT, f'({os.path.getsize(OUT) / 1e6:.1f} MB)')
