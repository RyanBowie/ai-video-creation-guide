"""Render a page (default charsheet.html) to PNG via headless Edge. Usage: python render_still.py [page.html] [out.png] [js-before-shot]"""
import sys, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
page_name = sys.argv[1] if len(sys.argv) > 1 else 'charsheet.html'
out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(page_name)[0] + '.png'
js = sys.argv[3] if len(sys.argv) > 3 else None

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=HERE)
handler.log_message = lambda *a: None
srv = socketserver.TCPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
port = srv.server_address[1]

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    logs = []
    pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    pg.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
    pg.goto(f'http://127.0.0.1:{port}/{page_name}')
    pg.wait_for_function('window.READY === true', timeout=60000)
    if js:
        pg.evaluate(js)
    err = pg.evaluate('window.ERR || null')
    if err:
        print('ERR:', err)
    data = pg.evaluate("document.getElementById('c').toDataURL('image/png')")
    import base64
    with open(os.path.join(HERE, out), 'wb') as f:
        f.write(base64.b64decode(data.split(',')[1]))
    for l in logs:
        print(l)
    b.close()
srv.shutdown()
print('wrote', out)
