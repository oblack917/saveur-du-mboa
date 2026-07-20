# Livraison multi-zones avec calcul de distance par adresse

Date : 2026-07-20
Projet : Saveurs du Mboa (site statique GitHub Pages, sans backend)

## Problème

La cuisine se fait dans **deux villes différentes** :
- **Province de Luxembourg** — cuisine de **Caroline**
- **Province de Liège** — cuisine de **Viviane** (la tante)

Aujourd'hui le site n'a qu'un point de départ implicite unique et une
calculette de frais **manuelle** (curseur 0→60 km) déconnectée de la commande.
Les frais ne figurent pas dans le panier et sont « confirmés sur WhatsApp ».

Le client doit pouvoir **choisir sa zone**, et les frais doivent être **calculés
automatiquement** en fonction de la distance entre **son adresse** et la
**cuisine de la zone choisie**. Le prix de livraison n'est donc pas fixe : il
varie d'une adresse à l'autre et selon la zone.

## Décisions (validées avec l'utilisateur)

- **Calcul automatique** de la distance depuis l'adresse du client, à **vol
  d'oiseau × facteur route (1,3)**, présenté comme une **estimation** confirmée
  sur WhatsApp. Pas de service de routage externe (fragile pour un commerce).
- **Deux zones** avec **adresses exactes** stockées (coordonnées lat/lon) dans
  `config.js`, **réglées une fois dans le code** (pas d'édition via l'admin —
  elles ne changent quasiment jamais).
- **Frais ajoutés au total** dans le récap du panier et repris dans le message
  WhatsApp.
- **Acompte 30 % sur les plats seuls** (inchangé) ; la **livraison va dans le
  solde** payé à la réception.
- **Tarifs communs aux deux zones** : gratuit jusqu'à 5 km, `(km − 5) × 0,30 €`
  au-delà (réutilise `KM_GRATUITS` et `FRAIS_KM` existants).
- **« Venir chercher » (retrait sur place)** disponible pour chaque zone :
  0 € de frais, pas de calcul, l'adresse de retrait s'affiche.
- **Page Livraison** : la calculette manuelle est **remplacée** par le même
  outil zone + adresse (un seul mode de calcul partout).
- **Repli** : si l'adresse n'est pas géocodée (pas de suggestion choisie, ou
  géocodage indisponible), les frais passent en « à confirmer sur WhatsApp » et
  la commande n'est **pas bloquée**.

## En attente d'infos client (ne pas inventer)

- **Adresses exactes** des deux cuisines (Caroline / Luxembourg, Viviane /
  Liège) pour renseigner les coordonnées lat/lon et l'adresse de retrait
  affichée. Placeholders en attendant, comme l'IBAN.

## Note de confidentialité (choix assumé par l'utilisateur)

Le calcul se faisant côté navigateur, les **coordonnées des deux cuisines sont
lisibles dans le code du site public**. L'utilisateur a choisi les adresses
exactes en connaissance de cause (l'option retrait affiche de toute façon
l'adresse). Aucune mitigation supplémentaire demandée.

## Architecture

Site statique, un seul fichier `index.html` (HTML + CSS + JS) + `config.js`
(données) + `admin.html` (CMS). On reste dans ce cadre.

### Données — `config.js`

Ajout de deux constantes, à préserver par l'admin lors de la régénération :

```js
const FACTEUR_ROUTE = 1.3;   // vol d'oiseau -> distance route estimée

const ZONES = [
  { id:"luxembourg", nom:"Province de Luxembourg", cuisine:"Caroline",
    adresse:"<adresse à compléter>", lat:0, lon:0 },
  { id:"liege",      nom:"Province de Liège",      cuisine:"Viviane",
    adresse:"<adresse à compléter>", lat:0, lon:0 }
];
```

`FRAIS_KM` (0,30) et `KM_GRATUITS` (5) restent globaux et communs aux deux zones.

**Risque à couvrir** : `admin.html` régénère `config.js` via `texteConfig()`.
Comme pour le champ `allergenes`, la fonction doit **préserver `ZONES` et
`FACTEUR_ROUTE`** pour que les éditions hebdomadaires du menu ne les effacent
pas. C'est le principal piège de cette évolution.

### Unités JS (dans `index.html`)

Chacune a une responsabilité unique et testable :

- `distanceKm(lat1, lon1, lat2, lon2)` — distance à vol d'oiseau (haversine),
  en km. Pure, sans effet de bord.
- `estimerKmRoute(clientCoords, zone)` — `distanceKm(...) * FACTEUR_ROUTE`,
  arrondi. Retourne `null` si `clientCoords` ou la zone sont absents.
- `fraisLivraison(km)` — `km <= KM_GRATUITS ? 0 : (km - KM_GRATUITS) * FRAIS_KM`.
- **État** : `clientCoords` (lat/lon de l'adresse choisie, ou `null`),
  `zoneSel` (id de zone choisie ou id de retrait).
- Capture des coordonnées client : la sélection d'une suggestion Nominatim
  (`selectionnerAdresse` + rendu des suggestions) stocke `lat`/`lon` dans
  `clientCoords`. Toute frappe libre qui invalide la sélection remet
  `clientCoords = null`.
- `majZone()` — appelée au changement du sélecteur de zone : affiche/masque le
  champ adresse (masqué en retrait), affiche l'adresse de retrait le cas
  échéant, puis recalcule le récap.
- `rendrePanier()` (modifiée) — ajoute la ligne livraison et recalcule les
  totaux (voir ci-dessous).
- `envoyerCommande()` (modifiée) — ajoute la zone et la ligne livraison / la
  mention retrait dans le message WhatsApp.
- Page Livraison : la calculette (`calculerFrais` + curseur `km-slider`) est
  remplacée par un mini-formulaire zone + adresse réutilisant les mêmes unités.

### Parcours client (panier)

Sélecteur obligatoire **« Zone de livraison * »** avant le champ adresse, avec
4 choix :

1. Livraison — Province de Luxembourg (cuisine de Caroline)
2. Livraison — Province de Liège (cuisine de Viviane)
3. Venir chercher — Luxembourg (retrait chez Caroline)
4. Venir chercher — Liège (retrait chez Viviane)

- **Livraison** : champ adresse affiché. À la sélection d'une suggestion →
  `clientCoords` capté → `km = estimerKmRoute(...)` → `frais = fraisLivraison(km)`
  → affichage « Gratuit 🎉 » (≤ 5 km) ou « Livraison estimée : X,XX € ».
- **Retrait** : champ adresse masqué, **0 €**, affichage « À récupérer chez
  <cuisine> : <adresse> ».
- **Repli** (livraison sans `clientCoords`) : « Frais confirmés sur WhatsApp »,
  frais non ajoutés au total, commande autorisée.

### Récap + totaux

```
Plats ................ <somme plats>
Livraison ............ Gratuit / X,XX € / Retrait sur place / à confirmer
─────────────────────────────
Total ................ plats + livraison (livraison = 0 si inconnue/retrait)
Acompte (30 %) ....... 30 % des PLATS
Solde à la livraison . (plats − acompte) + livraison
```

### Message WhatsApp (ajouts)

- Livraison : `📍 Zone : <nom zone> (livraison)` +
  `🚚 Livraison estimée : X,XX € (à confirmer)` (ou `Gratuit`, ou
  `à confirmer sur place`).
- Retrait : `🥡 Retrait sur place — chez <cuisine> (<zone>)`, sans ligne frais.

## Gestion des erreurs

- Adresse non géocodée en livraison → `clientCoords = null` → frais « à
  confirmer sur WhatsApp », total = plats seuls, commande non bloquée.
- Zone non choisie → validation à l'envoi (« Choisissez une zone »), comme les
  autres champs requis.
- Coordonnées de zone à 0/0 (placeholder non renseigné) → traiter comme repli
  (frais à confirmer) plutôt que d'afficher une distance absurde.

## Tests / vérification

Convention du projet : pas de suite de tests, vérification par **captures
headless chromium** (`/usr/bin/chromium`) + console, sur serveur local.

Scénarios à vérifier manuellement :

1. Zone Luxembourg + adresse proche (≤ 5 km) → « Gratuit », total = plats.
2. Zone Luxembourg + adresse lointaine → frais > 0, total = plats + frais.
3. Basculer Luxembourg ↔ Liège avec la même adresse → distance recalculée
   depuis l'autre cuisine, frais différents.
4. Retrait Luxembourg / Liège → 0 €, adresse de retrait affichée, champ adresse
   masqué.
5. Adresse tapée sans suggestion choisie → « Frais confirmés sur WhatsApp »,
   commande possible.
6. Message WhatsApp : contient la zone + la bonne ligne livraison/retrait.
7. Admin : régénérer `config.js` (édition menu) **conserve** `ZONES` et
   `FACTEUR_ROUTE`.

## Hors scope (YAGNI)

- Distance routière réelle via API externe.
- Édition des zones/coordonnées via l'admin (réglées une fois dans le code).
- Détection/validation automatique de la province à partir de l'adresse (le
  client choisit librement sa zone ; l'estimation est confirmée sur WhatsApp).
- Tarifs différents par zone.
