"""Render many stills of video.html in one browser session + a contact sheet.
Usage: python stills.py t1 t2 ...   (seconds)  -> stills/t_XX.X.png + stills/sheet.jpg"""
import sys, os, threading, http.server, socketserver, functools, base64, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'stills'); os.makedirs(OUT, exist_ok=True)
ts = [float(a) for a in sys.argv[1:]] or [0.8, 2.5, 4.5, 7, 10.5, 15, 19.7, 23.8, 25.5, 27.2, 28.7, 31, 32.6, 34.5, 35.7]

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=HERE)
handler.log_message = lambda *a: None
class Srv(socketserver.ThreadingTCPServer):
    daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]
files = []
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
    if pg.evaluate('window.ERR || null'): print('BOOT ERR:', pg.evaluate('window.ERR'))
    for t in ts:
        t0 = time.time()
        err = pg.evaluate(f'render({round(t * 30)})')
        dt = time.time() - t0
        if err: print(f'ERR @ {t}:', err.splitlines()[0:4])
        data = pg.evaluate("document.getElementById('c').toDataURL('image/png')")
        fn = os.path.join(OUT, f't_{t:05.2f}.png')
        open(fn, 'wb').write(base64.b64decode(data.split(',')[1])); files.append(fn)
        print(f't={t:6.2f}  {dt * 1000:6.0f} ms')
    b.close()
srv.shutdown()
try:
    from PIL import Image
    cols = 3; w, h = 640, 360; rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * h), 'black')
    for i, f in enumerate(files): sheet.paste(Image.open(f).convert('RGB').resize((w, h)), ((i % cols) * w, (i // cols) * h))
    sheet.save(os.path.join(OUT, 'sheet.jpg'), quality=85); print('sheet ->', os.path.join(OUT, 'sheet.jpg'))
except ImportError:
    print('PIL missing; no sheet')
