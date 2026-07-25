# QR code Saveurs du Mboa — fiche pour l'imprimeur

**Mis à jour le 25/07/2026** — nouvelle adresse `https://saveursdumboa.com/`

## Quel fichier envoyer

| Usage | Fichier |
|---|---|
| **Imprimerie (recommandé)** | `qr-saveur-du-mboa-noir.pdf` — vectoriel, noir pur, s'agrandit sans perte |
| Imprimerie, fichier vectoriel ouvert | `qr-saveur-du-mboa-noir.svg` |
| Version aux couleurs de la marque | `qr-saveur-du-mboa.svg` (brun `#40200e`) |
| Version décorative avec drapeau | `qr-saveur-du-mboa-drapeau.svg` |
| À afficher sur un écran / téléphone | `QR-plein-ecran.png` (1080 × 1080) |

## Caractéristiques techniques

- Contenu encodé : `https://saveursdumboa.com/`
- Version 4 · **33 modules** de côté (le « code » lui-même)
- Correction d'erreur **H** (30 %) — le code reste lisible même sali, plié ou
  partiellement masqué. C'est ce qui permet d'incruster le drapeau au centre.
- Marge blanche obligatoire de **4 modules** tout autour (elle est **déjà incluse**
  dans les fichiers : image totale = **41 modules**)

## ⚠️ Taille minimale à l'impression

Les cotes ci-dessous concernent le **code seul, marge exclue**. Comme les fichiers
incluent la marge, il faut appliquer le facteur **41 / 33 = 1,24** pour la taille
de l'image à placer dans la maquette.

| Support | Code seul | Image à placer (avec marge) |
|---|---|---|
| Carte de visite | 2,0 cm | **2,5 cm** |
| Flyer A5 | 2,5 cm | **3,1 cm** |
| Affiche A4 / A3 | 4,0 cm et plus | **5,0 cm et plus** |

**Ne jamais** rogner la marge blanche, ni poser le code sur un fond coloré ou une
photo : le contraste avec le blanc est ce qui permet la lecture.

## Comment tester avant d'imprimer en série

1. Ouvrir la page `qr/index.html` du site (ou imprimer un exemplaire seul)
2. Scanner avec l'appareil photo d'un **autre** téléphone, à ~20 cm
3. Le téléphone doit proposer d'ouvrir **saveursdumboa.com**

## Note sur les cartes déjà imprimées

Les cartes fabriquées **avant le 25/07/2026** encodent l'ancienne adresse
`oblack917.github.io/saveur-du-mboa`. Elle **redirige automatiquement** vers
`saveursdumboa.com` : ces cartes restent parfaitement valables, inutile de les jeter.

## Fichiers obsolètes

`QR-mode-d-emploi.pdf` et `QR-a-tester.pdf` datent d'avant le nom de domaine :
ils affichent l'ancienne adresse et les anciennes cotes (37 modules). **Ne pas les
envoyer à un imprimeur** — se référer à cette fiche.
