# Galerie vidéos « En cuisine » — design

Date : 23 juillet 2026
Demande : le client veut des vidéos de plats/cuisine sur le site.
Décision : galerie dédiée, vidéos auto-hébergées dans le dépôt (option A),
alimentée par les gérantes via l'admin, comme les photos.

## Contraintes de départ

- Site statique GitHub Pages, dépôt public — pas de backend, pas de CDN vidéo.
- Règle du projet : **zéro ressource externe** (RGPD) → pas d'embed
  YouTube/TikTok.
- Les gérantes publient depuis leur téléphone via `admin.html` (jeton GitHub).
- Poids : une vidéo de téléphone brute (60-130 Mo/min) est trop lourde pour
  le dépôt, l'API GitHub et les visiteurs mobiles. Il faut des clips courts
  et compressés.

## 1. Côté site (`index.html`)

- Nouvelle page **`#/cuisine`** « En cuisine » + lien dans la nav principale.
- Grille de cartes (même style que le menu) : une vidéo par carte avec
  `<video controls preload="metadata" playsinline>` + légende dessous.
  Pas d'autoplay, pas de son sans clic.
- `preload="metadata"` : le visiteur ne télécharge que l'aperçu (~centaines
  de Ko) ; la vidéo complète ne part qu'à la lecture. Protège le mobile et
  le quota de bande passante GitHub Pages (100 Go/mois).
- **0 vidéo publiée → lien de nav ET page masqués** (même logique que
  l'aperçu des avis sur l'accueil). Le site ne montre jamais une galerie
  vide. Si quelqu'un ouvre `#/cuisine` avec 0 vidéo, redirection accueil.
- Anti-cache : URLs vidéos suffixées `?v=CONFIG_VERSION` via la fonction
  `photoUrl()` existante (leçon du projet : tout fichier piloté par l'admin
  doit être anti-caché).

## 2. Configuration (`config.js`)

Nouveau bloc **édité par l'admin** (comme MENU et AVIS, PAS comme ZONES) :

```js
/* Vidéos « En cuisine » — gérées depuis la page d'administration.
   { fichier:"videos/xxx.mp4", titre:"légende affichée" } */
const VIDEOS = [];
```

Les fichiers vivent dans un nouveau dossier `videos/` à la racine.
Nommage : `videos/video-<id>.mp4` (id horodaté généré par l'admin, pas de
collision, pas d'accents/espaces).

## 3. Côté admin (`admin.html`)

Nouvelle section **« 🎬 Vidéos En cuisine »** :

- Liste des vidéos : légende éditable + bouton supprimer + bouton
  « Ajouter une vidéo » (input `accept="video/mp4"`).
- Ordre : les plus récentes en premier. Pas de réordonnancement (YAGNI).
- **Garde-fous à la sélection du fichier :**
  - extension/type ≠ mp4 → refus avec message : « Format non lisible sur
    tous les téléphones. Envoyez-vous la vidéo sur WhatsApp puis choisissez
    le fichier reçu (il sera en .mp4). »
  - **taille > 25 Mo → refus** avec le même conseil WhatsApp (WhatsApp
    compresse à ~5-10 Mo ET convertit en mp4 H.264). C'est l'astuce clé :
    aucune appli à installer.
- Publication : même mécanique que les photos — lecture en dataURL,
  `apiPut` du base64 (une vidéo à la fois, statut « Envoi de la vidéo
  1/2… »). Pas de recompression côté navigateur (impossible en JS simple) :
  le garde-fou de taille suffit.
- **Suppression = retirée de `VIDEOS` ET fichier supprimé du dépôt**
  (nouvel `apiDelete` : DELETE contents API avec le sha récupéré par
  `apiGet`). Un échec de suppression du fichier ne bloque PAS la
  publication (le fichier orphelin est signalé mais sans gravité).
- `texteConfig()` régénère le bloc `VIDEOS` et **préserve toujours
  ZONES + FACTEUR_ROUTE + allergenes + AVIS + AVIS_FORM_KEY + TITULAIRE**
  (piège n°1 du projet).

## 4. Mode d'emploi (`MODE-D-EMPLOI.md`)

Section « 🎬 Ajouter une vidéo » pour les gérantes :
filmer court (15-30 s), l'astuce WhatsApp pas à pas (s'envoyer la vidéo →
la télécharger → choisir ce fichier dans l'admin), limite de 25 Mo
expliquée simplement, et rappel : la vidéo apparaît ~1-2 min après
« Publier ».

## 5. Vérification

- Test node `docs/superpowers/tests/test-videos-regeneration.js` :
  `texteConfig()` régénère VIDEOS et préserve tout le reste (même famille
  que test-avis-regeneration.js).
- Vidéo mp4 de test générée localement (ffmpeg) pour valider la lecture.
- Serveur http local + chromium headless : galerie affichée avec vidéos,
  nav/page masquées à 0 vidéo, rendu mobile, console propre.
- **Le flux d'upload réel via l'admin reste à tester par Yann avec le
  jeton** (comme pour les photos) — le dire honnêtement, ne pas prétendre
  « testé ».

## Choix assumés

- 25 Mo max par fichier (validé par Yann).
- Nom de la page : « En cuisine » (validé par Yann).
- mp4 uniquement — les .mov iPhone (HEVC) ne se lisent pas partout ;
  l'astuce WhatsApp règle format ET poids d'un coup.
- Pas de poster/miniature dédiée : `preload="metadata"` affiche la
  première image, suffisant.
- Les vidéos remplacées restent dans l'historique git (comme les photos) —
  inévitable sans réécrire l'historique, accepté.
