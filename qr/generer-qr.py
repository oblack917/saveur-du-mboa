#!/usr/bin/env python3
"""Régénère les QR codes de Saveurs du Mboa pour le domaine saveursdumboa.com.

Reproduit exactement le style des fichiers existants :
  - correction d'erreur H (30 %), marge 4 modules, échelle 10
  - brun #40200e pour la version couleur, noir pour la version imprimeur
  - variante « drapeau » = pastille blanche arrondie centrée (24,67 % de la
    largeur) contenant le drapeau camerounais, bordée de brun.
"""
import sys, os
try:
    import segno
except ImportError:
    sys.exit("Il faut la bibliotheque segno : pip install segno\n"
             "(machine sans pip : recuperer le wheel sur PyPI et le dezipper,\n"
             " segno est du Python pur, puis PYTHONPATH=<dossier> python3 generer-qr.py <dossier_qr>)")

URL = "https://saveursdumboa.com/"
BRUN = "#40200e"
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))

qr = segno.make(URL, error="h", micro=False)
modules = qr.symbol_size(scale=1, border=0)[0]
total = qr.symbol_size(scale=1, border=4)[0]
print(f"URL         : {URL} ({len(URL)} caractères)")
print(f"Version     : {qr.version}  |  correction : {qr.error.upper()}")
print(f"Modules     : {modules} (code seul) / {total} (avec marge 4)")

# --- SVG (brun et noir) -------------------------------------------------
qr.save(f"{OUT}/qr-saveur-du-mboa.svg", scale=10, border=4, dark=BRUN, xmldecl=True)
qr.save(f"{OUT}/qr-saveur-du-mboa-noir.svg", scale=10, border=4, dark="#000", xmldecl=True)

# --- PNG ----------------------------------------------------------------
qr.save(f"{OUT}/qr-saveur-du-mboa.png", scale=10, border=4, dark=BRUN, light="#ffffff")
qr.save(f"{OUT}/qr-saveur-du-mboa-noir.png", scale=10, border=4, dark="#000", light="#ffffff")

# --- PDF imprimeur (vectoriel, noir) ------------------------------------
qr.save(f"{OUT}/qr-saveur-du-mboa-noir.pdf", scale=10, border=4, dark="#000")

# --- PNG plein écran 1080x1080 (pour montrer sur un téléphone) ----------
scale_fs = round(1080 / total)
qr.save(f"{OUT}/QR-plein-ecran.png", scale=scale_fs, border=4, dark="#000", light="#ffffff")

# --- Variante drapeau camerounais ---------------------------------------
side = total * 10                      # côté du SVG en px
logo = side * 0.2467                   # même proportion que l'original
lx = ly = (side - logo) / 2
rx = logo * 0.16
bw = logo * 0.05                       # épaisseur du liseré brun
fw = logo * 0.72                       # largeur du drapeau
fh = fw * 0.7778                       # ratio 2:3 du drapeau camerounais
fx = lx + (logo - fw) / 2
fy = ly + (logo - fh) / 2
band = fw / 3
cx, cy = fx + fw / 2, fy + fh / 2
r_out, r_in = fh * 0.20, fh * 0.20 * 0.382

import math
pts = []
for i in range(10):
    ang = math.radians(-90 + i * 36)
    r = r_out if i % 2 == 0 else r_in
    pts.append(f"{cx + r*math.cos(ang):.2f},{cy + r*math.sin(ang):.2f}")

path = open(f"{OUT}/qr-saveur-du-mboa.svg", encoding="utf-8").read()
head, tail = path.rsplit("</svg>", 1)
head = head.replace(' class="segno"', "").replace(' class="qrline"', "")
overlay = f'''<g>
  <rect x="{lx:.2f}" y="{ly:.2f}" width="{logo:.0f}" height="{logo:.0f}" rx="{rx:.2f}" fill="#ffffff"/>
  <rect x="{lx:.2f}" y="{ly:.2f}" width="{logo:.0f}" height="{logo:.0f}" rx="{rx:.2f}" fill="none" stroke="{BRUN}" stroke-width="{bw:.2f}"/>
  <clipPath id="drap"><rect x="{fx:.2f}" y="{fy:.2f}" width="{fw:.2f}" height="{fh:.2f}" rx="{fw*0.078:.2f}"/></clipPath>
  <g clip-path="url(#drap)">
    <rect x="{fx:.2f}" y="{fy:.2f}" width="{band:.2f}" height="{fh:.2f}" fill="#007A5E"/>
    <rect x="{fx+band:.2f}" y="{fy:.2f}" width="{band:.2f}" height="{fh:.2f}" fill="#CE1126"/>
    <rect x="{fx+2*band:.2f}" y="{fy:.2f}" width="{band:.2f}" height="{fh:.2f}" fill="#FCD116"/>
    <polygon points="{' '.join(pts)}" fill="#FCD116"/>
  </g>
</g>
</svg>'''
open(f"{OUT}/qr-saveur-du-mboa-drapeau.svg", "w", encoding="utf-8").write(head + overlay + tail)

print("\nFichiers écrits :")
for f in sorted(os.listdir(OUT)):
    if f.startswith(("qr-", "QR-")) and not f.endswith((".pdf",)) or f.endswith("-noir.pdf"):
        print(f"  {f:38s} {os.path.getsize(os.path.join(OUT,f)):>7d} o")
