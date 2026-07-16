# Saveurs du Mboa — Mise en conformité & finition « pro »

**Date :** 2026-07-16
**Branche :** `feat/legal-pro-polish`

## Contexte

Site vitrine + commande (GitHub Pages) pour « Saveurs du Mboa », cuisine
camerounaise maison livrée le week-end (provinces de Liège et Luxembourg).
Architecture existante à préserver :

- `index.html` — site public (SPA à ancres `#/menu`, `#/livraison`…)
- `admin.html` — CMS no-code utilisé par les gérantes depuis leur téléphone,
  commit via jeton GitHub à droits limités
- `config.js` — menu de la semaine + coordonnées (WhatsApp, IBAN, livraison)
- Flux de commande WhatsApp + lien de localisation Google Maps
- Autocomplétion d'adresse via Nominatim/OpenStreetMap + calcul de distance

## Objectif

Rendre le site **conforme (RGPD / droit belge)** et **plus professionnel**,
sans casser les mécanismes qui fonctionnent (WhatsApp, autocomplétion, admin).

## Périmètre

### 1. Page « Légal » (nouvelle)
Une page/section unique liée depuis le pied de page, en trois blocs :

- **Mentions légales** — dénomination, `[N° BCE à compléter]`, `[adresse à
  compléter]`, `[e-mail de contact à compléter]`. Champs à trous **explicitement
  marqués** tant que le statut légal du client est inconnu (décision utilisateur :
  « je ne sais pas encore »).
- **Politique de confidentialité** — données réellement collectées à la commande
  (nom, téléphone, adresse de livraison), finalité (préparer et livrer la
  commande), durée de conservation, et mention que l'adresse saisie transite par
  OpenStreetMap/Nominatim (transfert à un tiers) uniquement pour l'autocomplétion.
  Droits RGPD (accès, rectification, effacement) + canal d'exercice.
- **Cookies** — reflète la réalité : **aucun cookie de pistage**. Seuls des
  éléments techniques strictement nécessaires (préférence de consentement en
  local) sont utilisés. Les polices sont auto-hébergées (plus d'appel Google).

### 2. Bandeau cookies — honnête et léger
Décision utilisateur : **bandeau discret** plutôt que pop-up bloquante.

- Retrait de la pop-up plein écran bloquante et des **fausses** cases
  « Analytics » / « Marketing » (aucun tracker réel : le code actuel n'a qu'un
  `console.log('Load analytics (placeholder)')`, aucun pixel marketing).
- Remplacement par un simple lien « Cookies » dans le pied de page menant à la
  page Légal. Pas de mur de consentement puisqu'il n'y a rien à consentir.

### 3. Correction du lien admin
`MODE-D-EMPLOI.md` référence `saveurs-du-mboa` (avec « s ») alors que le dépôt/URL
réel est `saveur-du-mboa`. Le lien admin remis aux gérantes serait cassé.
→ corriger toutes les occurrences vers `saveur-du-mboa`.

### 4. Polices auto-hébergées (RGPD)
Le site charge actuellement Google Fonts depuis `fonts.googleapis.com` /
`fonts.gstatic.com` (dans `index.html` **et** `admin.html`). Cela transmet l'IP
de chaque visiteur à Google sans consentement — jugé contraire au RGPD (LG
München, 2022). Décision utilisateur : **auto-héberger les polices**.

- Télécharger les `.woff2` des familles utilisées : Great Vibes, Bricolage
  Grotesque (600/800), Instrument Sans (400/500/600/700).
- Les placer dans `fonts/`, déclarer via `@font-face` local, avec
  `font-display:swap`.
- Retirer les `<link>` Google et les `preconnect` dans les deux fichiers.
- Apparence identique, zéro appel externe pour les polices.

### 5. Finition « pro » (polish ciblé, PAS une refonte)
- Cohérence typographique et espacements.
- **Balises méta de partage** (Open Graph / Twitter Card) : titre, description,
  image → bel aperçu quand le lien est partagé sur WhatsApp / Instagram.
- `<title>` (déjà présent), `<meta name="description">` (déjà présent),
  `lang="fr"` (déjà présent), favicon si absent.
- Petites finitions visuelles du pied de page (bloc légal qui renforce la
  crédibilité).

## Hors périmètre (en attente d'infos client)

- **IBAN** — reste `BE00 0000 0000 0000` dans `config.js` jusqu'à réception.
- **Liens Instagram / TikTok** — restent `href="#"` jusqu'à réception des URL.
- **Photos avec filigrane** (porc, maquereau) — à remplacer par le client.

## Contraintes / à ne pas casser

- Flux de commande WhatsApp (`wa.me`), génération du message et du lien Maps.
- Autocomplétion Nominatim + calcul de distance / frais de livraison.
- `admin.html` et le mécanisme de publication par jeton GitHub.
- Après auto-hébergement des polices, l'objectif est **aucune ressource externe
  passive** : images, polices, scripts restent locaux/inline. (Restent des
  appels *actifs* déclenchés par l'utilisateur : Nominatim à la frappe, liens
  WhatsApp/Maps au clic — fonctionnels, documentés dans la confidentialité.)

## Sauvegarde

Sauvegarde de `index.html` dans `backups/` avant modification (le projet le fait
déjà pour ses évolutions).

## Critères de réussite

- Page Légal accessible depuis le pied de page, sans champ légal inventé.
- Plus aucune mention de cookies inexistants ; plus de pop-up bloquante.
- Lien admin du mode d'emploi fonctionnel.
- Aperçu de partage correct (Open Graph) ; site inchangé côté commande.
