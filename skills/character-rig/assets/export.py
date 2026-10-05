"""Export video.html -> MP4 (1920x1080 @ 30fps, H.264) muxed with song.mp3 (1.2 s fade-out).
Usage: python export.py [out.mp4]"""
import sys, os, threading, http.server, socketserver, functools, base64, subprocess, time
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'video.mp4')
AUDIO = os.path.join(HERE, 'song.mp3')

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=HERE)
handler.log_message = lambda *a: None
class Srv(socketserver.ThreadingTCPServer):
    daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('pageerror', lambda e: print('pageerror:', e))
    pg.goto(f'http://127.0.0.1:{port}/video.html')
    pg.wait_for_function('window.READY === true', timeout=60000)
    for _ in range(3):
        if pg.evaluate("typeof draw === 'function' && !window.ERR"): break
        print('boot retry'); pg.reload(); pg.wait_for_function('window.READY === true', timeout=60000)
    else: raise SystemExit('page failed to boot')
    total, fps = pg.evaluate('[TOTAL, FPS]')
    dur = total / fps
    print(f'{total} frames @ {fps}fps = {dur:.1f}s -> {OUT}')
    ff = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
        '-i', AUDIO, '-map', '0:v', '-map', '1:a',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        '-c:a', 'aac', '-b:a', '192k', '-af', f'afade=t=out:st={dur - 1.2:.2f}:d=1.2',
        '-t', f'{dur:.3f}', '-movflags', '+faststart', OUT,
    ], stdin=subprocess.PIPE)
    t0 = time.time()
    for F in range(total):
        err = pg.evaluate(f'render({F})')
        if err: print(f'ERR @ frame {F}:', err.splitlines()[:3])
        data = pg.evaluate("document.getElementById('c').toDataURL('image/jpeg', 0.95)")
        ff.stdin.write(base64.b64decode(data.split(',')[1]))
        if F % 150 == 0: print(f'  frame {F}/{total}  ({time.time() - t0:.0f}s)')
    ff.stdin.close(); ff.wait()
    b.close()
srv.shutdown()
print('wrote', OUT, f'({os.path.getsize(OUT) / 1e6:.1f} MB)')
