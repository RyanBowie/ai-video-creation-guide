"""Render many stills of sofia-explorer.html in one browser session + contact sheets.
Usage: python stills.py [t1 t2 ...]   (seconds; no args = every 2 s from 0.3 s to the end)
  -> stills/t_XX.XX.png + stills/sheet.jpg (or sheet_01.jpg, sheet_02.jpg ... at 12 stills per sheet)
Set RAW=1 to dump the pre-film-pass scene canvas instead of the post-processed output."""
import sys, os, threading, http.server, socketserver, base64, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'stills'); os.makedirs(OUT, exist_ok=True)
ts = [float(a) for a in sys.argv[1:]]
RAW = os.environ.get('RAW') == '1'

# subclass (not functools.partial) so log_message is really overridden and requests aren't logged
class handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=HERE, **k)
    def log_message(self, *a): pass
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
    pg.on('console', lambda m: print('console:', m.text) if m.type in ('error', 'warning') else None)
    pg.goto(f'http://127.0.0.1:{port}/sofia-explorer.html?frame=0')
    pg.wait_for_function('window.READY === true', timeout=60000)
    for _ in range(3):
        if pg.evaluate("typeof draw === 'function' && !window.ERR"): break
        print('boot retry'); pg.reload(); pg.wait_for_function('window.READY === true', timeout=60000)
    else: raise SystemExit('page failed to boot: ' + str(pg.evaluate('window.ERR || null')))
    fps = pg.evaluate('FPS')
    if not ts:  # default QA pass: a still every 2 s across the whole video
        dur = pg.evaluate('TOTAL / FPS')
        ts = [round(.3 + 2 * i, 2) for i in range(int((dur - .3) // 2) + 1)]
    for t in ts:
        t0 = time.time()
        err = pg.evaluate(f'render({round(t * fps)})')
        dt = time.time() - t0
        if err: print(f'ERR @ {t}:', err.splitlines()[0:4])
        sel = 'SC' if RAW else "document.getElementById('c')"
        data = pg.evaluate(f"{sel}.toDataURL('image/png')")
        fn = os.path.join(OUT, f't_{t:05.2f}.png')
        open(fn, 'wb').write(base64.b64decode(data.split(',')[1])); files.append(fn)
        print(f't={t:6.2f}  {dt * 1000:6.0f} ms')
    b.close()
srv.shutdown()
try:
    from PIL import Image
    cols, per, w, h = 3, 12, 640, 360
    pages = [files[i:i + per] for i in range(0, len(files), per)]
    for n, page in enumerate(pages, 1):
        rows = (len(page) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * w, rows * h), 'black')
        for i, f in enumerate(page): sheet.paste(Image.open(f).convert('RGB').resize((w, h)), ((i % cols) * w, (i // cols) * h))
        name = os.path.join(OUT, 'sheet.jpg' if len(pages) == 1 else f'sheet_{n:02d}.jpg')
        sheet.save(name, quality=85); print('sheet ->', name)
except ImportError:
    print('PIL missing; no sheet')
