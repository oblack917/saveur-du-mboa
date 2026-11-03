#!/usr/bin/env python3
"""Optimise les photos du menu (à lancer depuis la racine du dépôt).

Pour chaque photo citée dans config.js :
  - recompresse le JPEG (900 px de large max, progressif, qualité 80) ;
  - crée deux versions WebP : photos/<nom>.webp (900 px) et photos/<nom>-480.webp (480 px).
Le site n'utilise les WebP que pour les plats marqués `webp:true` dans config.js
(la page d'administration le fait toute seule pour les nouvelles photos).

Crée aussi og-image.jpg (1200×630), l'image affichée quand on partage le site.

Usage : python3 outils/optimiser-photos.py [photos/plat-pour-le-partage.jpg]
Dépendance : Pillow (pip install pillow)
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

RACINE = Path(__file__).resolve().parent.parent
LARGEUR_MAX = 900
LARGEUR_PETITE = 480


def redimensionner(img, largeur):
    if img.width <= largeur:
        return img
    return img.resize((largeur, round(img.height * largeur / img.width)), Image.LANCZOS)


def optimiser(chemin):
    img = ImageOps.exif_transpose(Image.open(chemin)).convert("RGB")
    grande = redimensionner(img, LARGEUR_MAX)
    avant = chemin.stat().st_size
    grande.save(chemin, "JPEG", quality=80, optimize=True, progressive=True)
    grande.save(chemin.with_suffix(".webp"), "WEBP", quality=78, method=6)
    redimensionner(img, LARGEUR_PETITE).save(
        chemin.with_name(chemin.stem + "-480.webp"), "WEBP", quality=76, method=6)
    print(f"  {chemin.name}: {avant // 1024} Kio -> {chemin.stat().st_size // 1024} Kio "
          f"(webp {chemin.with_suffix('.webp').stat().st_size // 1024} Kio)")
    return img


def image_partage(img):
    """Recadre au centre en 1200×630, le format attendu par Facebook, WhatsApp, etc."""
    cible = ImageOps.fit(img, (1200, 630), Image.LANCZOS, centering=(0.5, 0.5))
    cible.save(RACINE / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print("  og-image.jpg créée")


def main():
    config = (RACINE / "config.js").read_text(encoding="utf-8")
    photos = sorted(set(re.findall(r'photo:"(photos/[^"]+\.jpg)"', config)))
    if not photos:
        sys.exit("Aucune photo trouvée dans config.js")
    print(f"{len(photos)} photo(s) à optimiser :")
    premiere = None
    for p in photos:
        chemin = RACINE / p
        if not chemin.exists():
            print(f"  ⚠️ introuvable : {p}")
            continue
        img = optimiser(chemin)
        premiere = premiere or img
    # L'image de partage : la photo passée en argument, sinon le premier plat du menu.
    plat = re.search(r'cat:"plat"[^}]*?photo:"(photos/[^"]+\.jpg)"', config)
    source = RACINE / sys.argv[1] if len(sys.argv) > 1 else (RACINE / plat.group(1) if plat else None)
    if source and source.exists():
        image_partage(Image.open(source).convert("RGB"))
    print("Terminé. Pensez à ajouter webp:true aux plats concernés dans config.js.")


if __name__ == "__main__":
    main()
