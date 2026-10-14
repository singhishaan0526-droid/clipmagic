"""Render every filter on sample.png in headless Chromium, compare colour stats to the
reference video frames, and write preview.png. Usage: python3 verify.py <frames_dir>"""
import sys, asyncio, base64, io, http.server, threading, os, functools
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

here = os.path.dirname(os.path.abspath(__file__))
frames = sys.argv[1]
# frame index (1-based file number) of a stable, fully-applied frame for each filter
REF = {'none':1,'toxic-glitch':4,'low-light':6,'view-hd':9,'aesthetic-brown':10,'black-and-white':12,
       '4k-ultra':14,'glamy':16,'natural-skin':18,'feel-with-reel':20,'bas-a-droite':23,'fine-tone':24,
       'black-ii':26,'iphone-14':29,'prism':31,'vignette':34,'soft':36,'fairy-grunge':38,'bliss':40}

def stats(im):
    a = np.asarray(im.convert('RGB')).astype(float) / 255
    l = a @ [.2126, .7152, .0722]
    mx, mn = a.max(2), a.min(2)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).mean()
    return np.array([*a.mean((0, 1)), l.mean(), l.std(), s])

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=here)
handler.log_message = lambda *a, **k: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{srv.server_port}/demo.html'

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium'
                          if os.path.exists('/opt/pw-browsers/chromium') else None)
    pg = b.new_page(); pg.goto(url); pg.wait_for_timeout(500)
    print('ctx.filter supported:', pg.evaluate('ClipFilters.supportsCtxFilter'))
    ids = pg.evaluate('ClipFilters.FILTERS.map(f=>f.id)')
    out = {}
    for i in ids:
        data = pg.evaluate('''id=>{const c=document.getElementById('out');const r=new ClipFilters.Renderer(c);
          r.setFilter(id);r.render(document.getElementById('img'));return c.toDataURL('image/png')}''', i)
        out[i] = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGB')
    b.close()

tiles = []
print(f"{'filter':16s} {'dR':>6s}{'dG':>6s}{'dB':>6s}{'dL':>6s}{'dStd':>6s}{'dSat':>6s}   (ours - reference)")
for i in ids:
    ref = Image.open(f'{frames}/f_{REF[i]:02d}.png').convert('RGB').crop((0, 430, 576, 930))
    d = stats(out[i]) - stats(ref)
    print(f'{i:16s}' + ''.join(f'{x:6.2f}' for x in d))
    t = Image.new('RGB', (288, 250 + 0))
    t.paste(ref.resize((144, 125)), (0, 0)); t.paste(out[i].resize((144, 125)), (144, 0))
    t.paste(ref.resize((144, 125)).resize((1, 1)).resize((144, 125)), (0, 125))
    t.paste(out[i].resize((1, 1)).resize((144, 125)), (144, 125))
    tiles.append(t)
cols = 4; rows = -(-len(tiles) // cols)
sheet = Image.new('RGB', (cols * 288, rows * 250))
for n, t in enumerate(tiles): sheet.paste(t, ((n % cols) * 288, (n // cols) * 250))
sheet.save(os.path.join(here, '..', 'preview_compare.png'))
