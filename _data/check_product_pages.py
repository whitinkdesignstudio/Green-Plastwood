#!/usr/bin/env python3
"""
Greenplastwood: product page checker
------------------------------------
Checks products.html and the 6 product detail pages against _data/product-data.json.

Run from the SITE ROOT folder (the folder that has index.html):
    python3 _data/check_product_pages.py              -> checks all 7 pages
    python3 _data/check_product_pages.py doors        -> checks one product (id from the JSON)

It writes _data/check-report.md and prints PASS / FAIL per page.
Nothing on the site is changed by this script.
"""
import json, os, re, sys, html
from urllib.parse import unquote

ROOT = os.getcwd()
DATA = os.path.join(ROOT, '_data', 'product-data.json')
if not os.path.exists(DATA):
    sys.exit('product-data.json not found. Put it in _data/ inside the site root and run this from the site root.')
D = json.load(open(DATA, encoding='utf-8'))
COMMON = D['common']

FORBIDDEN = [
    (r'(?i)\blouvers?\b', 'the word "louver/louvers" (must be PVC Panel)'),
    (r'Green Plastwood|GREEN PLASTWOOD', 'brand written with a space (must be Greenplastwood)'),
    (r'(?i)\bdealers?\b|\bdealership\b', '"dealer" wording (must be Business Associate / Reseller)'),
    (r'(?i)free sample', '"Free Sample" (must be "Request a Sample")'),
    (r'(?i)lorem ipsum|dolor sit amet', 'placeholder text'),
    (r'(?i)see all certificates and test reports', 'old link text (must be "How we control quality")'),
    (r'(?i)\b(106|112)\s+(digital\s+)?(print\s+)?designs?\b', 'door design count (client removed 106/112)'),
    (r'(?i)13 years', 'old "13 years" (must be 9 years since 2017)'),
    (r'(?i)headquarters', '"Headquarters" (must be "Corporate Headquarter")'),
    (r'18\s*(…|\.\.\.|to)\s*35\s*mm|18 to 25 mm', 'old board thickness up to 35 mm (client rule: boards 5–18 mm, 3 layer 6–18 mm)'),
]
NOTE_KEYS = {'rule', 'check_note', 'CLIENT_RULE', 'PENDING', 'naming_note', 'page_note', 'image_note', 'hex_note', 'section_id_note', 'common_benefits_note', 'changed', '_about'}

def resolve(ref):
    o = D
    for part in ref.split('.'):
        o = o[part]
    return o

def strings(o, out, follow=True):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in NOTE_KEYS: continue
            if isinstance(v, str) and v.startswith('common.') and follow:
                strings(resolve(v), out, follow); continue
            strings(v, out, follow)
    elif isinstance(o, list):
        for v in o: strings(v, out, follow)
    elif isinstance(o, (str, int, float)) and not isinstance(o, bool):
        out.append(str(o))
    return out

NUM = re.compile(r'(?<![\w#/.-])\d+(?:[.,]\d+)*(?![\w/])')
def numbers(text):
    return set(n.replace(',', '') for n in NUM.findall(text))

def visible(htmlsrc):
    s = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', ' ', htmlsrc, flags=re.S)
    s = re.sub(r'<svg.*?</svg>', ' ', s, flags=re.S)
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', s)).split())

def main_part(src):
    """Product content only: from <main> (or first <section>) to the quote form / footer."""
    i = src.find('<main'); i = i if i >= 0 else src.find('<section')
    ends = [x for x in (src.find('id="quote"', i), src.find('id="quick-quote"', i), src.find('class="gp-qq', i), src.find('<footer', i)) if x > 0]
    return src[i:min(ends)] if ends else src[i:]

BASE_ALLOWED = set()
for v in strings(COMMON['contact'], []) + strings(COMMON['stats'], []) + strings(COMMON['since'], []) + strings(COMMON['trust_strip'], []) + [str(y) for y in range(2012, 2027)]:
    BASE_ALLOWED |= numbers(v)
BASE_ALLOWED |= {'1', '2', '3', '4', '5', '6', '0', '100', '9001', '2015', '94', '0', '24', '7'}

def check_links(src, page):
    probs = []
    ids = set(re.findall(r'\bid="([^"]+)"', src))
    for attr, url in re.findall(r'\b(href|src)="([^"]+)"', src):
        if url.startswith(('http', 'mailto:', 'tel:', 'data:', 'javascript:', '//')) or url == '#': continue
        path, _, frag = url.partition('#'); path = unquote(path.split('?')[0])
        if path.startswith('docs/'): continue  # PDFs live only on the server (docs/ is not in the working zip)
        if path and not os.path.exists(os.path.join(ROOT, path)):
            probs.append(f'missing file: {url}')
        if frag and not path and frag not in ids:
            probs.append(f'missing #anchor on page: #{frag}')
    for m in re.finditer(r'<img\b[^>]*>', src):
        tag = m.group(0)
        if 'alt=' not in tag: probs.append('img without alt: ' + tag[:90])
    return probs

def check_page(page, allowed_strings, must_have, label):
    path = os.path.join(ROOT, page)
    res = {'page': page, 'label': label, 'errors': [], 'warnings': []}
    if not os.path.exists(path):
        res['errors'].append('page file not found'); return res
    src = open(path, encoding='utf-8').read()
    body = main_part(src); vis = visible(body); vis_all = visible(src)
    # 1. basics
    h1 = len(re.findall(r'<h1\b', src))
    if h1 != 1: res['errors'].append(f'page must have exactly one <h1>, found {h1}')
    if re.search(r'name="robots"[^>]*noindex', src): res['errors'].append('page has noindex (remove it on the final page)')
    # 2. forbidden wording (visible text of the whole page)
    for rx, why in FORBIDDEN:
        for m in re.finditer(rx, vis_all):
            res['errors'].append(f'forbidden: {why} → "…{vis_all[max(0, m.start() - 40):m.end() + 40]}…"'); break
    # 3. every number on the page must exist in the data for this page
    allowed = set(BASE_ALLOWED)
    for s in allowed_strings: allowed |= numbers(s)
    unknown = sorted(numbers(vis) - allowed, key=lambda x: float(x) if re.fullmatch(r'[\d.]+', x) else 0)
    for n in unknown:
        m = re.search(r'(?<![\w.])' + re.escape(n) + r'(?![\w])', vis)
        ctx = vis[max(0, m.start() - 50):m.end() + 50] if m else ''
        res['errors'].append(f'number not in product-data.json: {n} → "…{ctx}…"')
    # 4. key content must be present
    for s in must_have:
        if ' '.join(s.split()) not in vis_all:
            res['warnings'].append(f'expected text not found: "{s[:90]}"')
    # 5. boards rule
    if 'boards' in page:
        for m in re.finditer(r'\b(19|2\d|3\d)\s*mm\b', vis):
            res['errors'].append(f'board thickness above 18 mm (client rule 5–18 mm): "…{vis[max(0, m.start() - 40):m.end() + 30]}…"'); break
    # 6. links and images
    for p in check_links(src, page): res['errors'].append(p)
    return res

def product_checks(p):
    allowed = strings(p, [])
    must = [p['name'], p['tagline'], p['description']] + [f['value'] for f in p['key_facts']] + [f['q'] for f in p['faqs']]
    return check_page(p['page'], allowed, must, p['name'])

def products_page_checks():
    allowed = []
    for p in D['products']: allowed += strings(p, [])
    allowed += strings(COMMON, [])
    allowed += strings(D.get('products_page', {}), [])
    must = [p['name'] for p in D['products']] + [f['q'] for f in D.get('products_page', {}).get('faqs', [])]
    r = check_page('products.html', allowed, must, 'Products page')
    # product order
    src = visible(main_part(open(os.path.join(ROOT, 'products.html'), encoding='utf-8').read())) if os.path.exists(os.path.join(ROOT, 'products.html')) else ''
    start = src.find(D['products'][0]['name'])
    pos = [src.find(p['name'], max(start, 0)) for p in D['products']]
    if all(x >= 0 for x in pos) and pos != sorted(pos):
        r['warnings'].append('products do not appear in the official order: ' + ' → '.join(p['name'] for p in D['products']))
    return r

def run(only=None):
    results = []
    if not only: results.append(products_page_checks())
    for p in D['products']:
        if only and p['id'] != only: continue
        results.append(product_checks(p))
    lines = ['# Product page check report', '']
    ok_all = True
    for r in results:
        ok = not r['errors']; ok_all &= ok
        print(f"{'PASS' if ok else 'FAIL'}  {r['page']}  ({len(r['errors'])} errors, {len(r['warnings'])} warnings)")
        lines.append(f"## {'✅ PASS' if ok else '❌ FAIL'}: {r['page']} ({r['label']})")
        for e in r['errors']: lines.append(f'- ❌ {e}')
        for w in r['warnings']: lines.append(f'- ⚠️ {w}')
        lines.append('')
    open(os.path.join(ROOT, '_data', 'check-report.md'), 'w', encoding='utf-8').write('\n'.join(lines))
    print('\nFull report: _data/check-report.md')
    return ok_all

if __name__ == '__main__':
    sys.exit(0 if run(sys.argv[1] if len(sys.argv) > 1 else None) else 1)
