#!/usr/bin/env python3
"""
Greenplastwood: place AI images on the website
----------------------------------------------
1. Save every image you made (PNG, JPG or WEBP) anywhere inside  _new-images/ai-output/
   with the exact file name from the prompt (for example  chaukhat.png ).
2. Run this from the website folder (the folder that has index.html):
       python3 _tools/place_images.py
3. Each image is cropped to the right shape, resized, saved as WEBP in the right place
   on the website, and the old image is backed up to _backup/<today>/.

Nothing else on the site is changed. File names that are not in _tools/image-map.json are skipped.
Run it again any time: only images that are newer than the placed version are processed.
Needs Python 3 and Pillow (pip install pillow).
"""
import json, os, shutil, sys, datetime
try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is missing. Run:  pip install pillow')

ROOT = os.getcwd()
if not os.path.exists(os.path.join(ROOT, 'index.html')):
    sys.exit('Run this from the website folder (the one with index.html).')
MAP = json.load(open(os.path.join(ROOT, '_tools', 'image-map.json'), encoding='utf-8'))
SRC = os.path.join(ROOT, '_new-images', 'ai-output')
BK = os.path.join(ROOT, '_backup', datetime.date.today().isoformat() + '-images')
LOG = os.path.join(ROOT, '_new-images', 'ai-output', 'placed-log.txt')

found = {}
for d, _, files in os.walk(SRC):
    for f in files:
        base, ext = os.path.splitext(f)
        if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
            continue
        key = base + '.png'
        if key in MAP:
            p = os.path.join(d, f)
            if key not in found or os.path.getmtime(p) > os.path.getmtime(found[key]):
                found[key] = p

done, skipped = [], []
for key, src in sorted(found.items()):
    info = MAP[key]; dst = os.path.join(ROOT, info['target']); W, H = info['size']
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src) and os.path.exists(LOG) and key in open(LOG, encoding='utf-8').read():
        skipped.append(key); continue
    if os.path.exists(dst):
        b = os.path.join(BK, info['target']); os.makedirs(os.path.dirname(b), exist_ok=True)
        if not os.path.exists(b): shutil.copy2(dst, b)
    im = Image.open(src).convert('RGB'); w, h = im.size; t = W / H
    if w / h > t:
        nw = int(h * t); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / t); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.resize((W, H), Image.LANCZOS).save(dst, 'WEBP', quality=85)
    done.append((key, info['target'], info['page']))

with open(LOG, 'a', encoding='utf-8') as lg:
    for key, tgt, page in done:
        lg.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M}  {key}  ->  {tgt}  ({page})\n')

print(f'Placed {len(done)} image(s):')
for key, tgt, page in done: print(f'  {key:28s} -> {tgt}   [{page}]')
if skipped: print(f'Already placed, unchanged: {len(skipped)}')
left = [k for k in MAP if k not in found]
print(f'Still to make: {len(left)} of {len(MAP)}')
