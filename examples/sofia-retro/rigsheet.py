"""Render Sofia's rig in isolation (every pose/outfit) to hunt clipping + overlap bugs.
Usage: python rigsheet.py [zoom]   -> stills/rig_<name>.png + stills/rig_sheet.jpg
Each spec is drawn on a flat backdrop with HER.portrait, so problems can't hide behind scene props."""
import sys, os, json, threading, http.server, socketserver, base64
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'stills'); os.makedirs(OUT, exist_ok=True)
Z = float(sys.argv[1]) if len(sys.argv) > 1 else .62
SPECS = [
    ('beach_drink', {'outfit': 'beach', 'pose': 'drink', 'chair': 'beach', 'seated': True, 'expr': 'dreamy', 'mouth': 'smile', 'rim': '#ffb44a'}),
    ('beach_shock', {'outfit': 'beach', 'pose': 'shock', 'chair': 'beach', 'seated': True, 'expr': 'shocked', 'rim': '#ffb44a'}),
    ('beach_relax', {'outfit': 'beach', 'pose': 'relax', 'expr': 'happy'}),
    ('office_type', {'pose': 'type', 'chair': 'office', 'seated': True, 'expr': 'worried'}),
    ('office_shock', {'pose': 'shock', 'chair': 'office', 'seated': True, 'expr': 'shocked'}),
    ('office_relax', {'pose': 'relax', 'expr': 'smile', 'rim': '#35e7ff'}),
    ('office_card', {'pose': 'card', 'expr': 'happy', 'rim': '#35e7ff'}),
    ('office_fist', {'pose': 'fist', 'expr': 'determined', 'rim': '#ff3fa4'}),
    ('office_wave', {'pose': 'wave', 'expr': 'happy'}),
    ('office_hip', {'pose': 'hip', 'expr': 'smile'}),
    ('raj_type', {'cast': 'raj', 'outfit': 'tee', 'noHeadset': True, 'pose': 'type', 'chair': 'office', 'seated': True, 'expr': 'smile'}),
    ('raj_card', {'cast': 'raj', 'outfit': 'tee', 'noHeadset': True, 'pose': 'card', 'chair': 'office', 'seated': True, 'expr': 'happy', 'mouth': 'smileopen', 'rim': '#35e7ff'}),
    ('maya_type', {'cast': 'maya', 'outfit': 'tee', 'noHeadset': True, 'pose': 'type', 'chair': 'office', 'seated': True, 'expr': 'neutral'}),
    ('maya_fist', {'cast': 'maya', 'outfit': 'tee', 'noHeadset': True, 'pose': 'fist', 'chair': 'office', 'seated': True, 'expr': 'determined', 'rim': '#ff3fa4'}),
    ('leo_wave', {'cast': 'leo', 'outfit': 'tee', 'noHeadset': True, 'pose': 'wave', 'chair': 'office', 'seated': True, 'expr': 'happy'}),
    ('leo_type', {'cast': 'leo', 'outfit': 'tee', 'noHeadset': True, 'pose': 'type', 'chair': 'office', 'seated': True, 'expr': 'surprised'}),
]

class handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=HERE, **k)
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
files = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('pageerror', lambda e: print('pageerror:', e))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/sofia-retro.html?frame=0')
    pg.wait_for_function('window.READY === true', timeout=60000)
    for name, o in SPECS:
        js = f"""(() => {{ try {{ R.begin('#4a3a6a');
          const o = Object.assign({{t: 1.3}}, {json.dumps(o)});
          HER.portrait(R.g, 320, 168, {Z}, o);
          return SC.toDataURL('image/png'); }} catch (e) {{ return 'ERR ' + (e.stack || e); }} }})()"""
        data = pg.evaluate(js)
        if data.startswith('ERR'): print(name, data[:400]); continue
        fn = os.path.join(OUT, f'rig_{name}.png'); open(fn, 'wb').write(base64.b64decode(data.split(',')[1])); files.append(fn)
        print('ok', name)
    b.close()
srv.shutdown()
from PIL import Image
cols, w, h = 5, 576, 324; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), 'black')
for i, f in enumerate(files): sheet.paste(Image.open(f).convert('RGB').resize((w, h)), ((i % cols) * w, (i // cols) * h))
sheet.save(os.path.join(OUT, 'rig_sheet.jpg'), quality=88); print('sheet ->', os.path.join(OUT, 'rig_sheet.jpg'))
