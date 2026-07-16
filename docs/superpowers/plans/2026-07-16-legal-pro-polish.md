# Mise en conformité & finition « pro » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or
> subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal :** Rendre le site Saveurs du Mboa conforme (RGPD/droit belge) et plus
professionnel, sans casser WhatsApp / autocomplétion / admin.

**Architecture :** Site statique (GitHub Pages), une SPA à routes de hash
(`PAGES` + `<div class="page" id="page-X">`, routeur `index.html:662`). Pas de
framework de test → **vérification = servir en local + contrôle du DOM rendu +
contrôle visuel**.

**Tech Stack :** HTML/CSS/JS vanilla, polices auto-hébergées (`@font-face`).

## Global Constraints
- Ne PAS modifier : flux WhatsApp (`wa.me`, `index.html:1126`), autocomplétion
  Nominatim (`index.html:896`), calcul distance, `admin.html` (sauf retrait
  Google Fonts), mécanisme jeton GitHub.
- Aucune ressource externe **passive** après coup (polices incluses).
- Aucun champ légal inventé : marquer `[… à compléter]` en clair.
- Commits fréquents, un par tâche. Sauvegarde de `index.html` avant modifs.

---

### Task 1 : Sauvegarde + polices auto-hébergées

**Files :**
- Create : `fonts/` (fichiers `.woff2`)
- Create : `backups/index.before-legal-pro-<horodatage>.html`
- Modify : `index.html:8-10` (retrait `<link>`/`preconnect` Google), bloc
  `<style>` (ajout `@font-face`)
- Modify : `admin.html:8` (même retrait + `@font-face` ou fallback système)

**Interfaces :**
- Produces : familles CSS inchangées (`--display` Bricolage Grotesque,
  `--script` Great Vibes, `--body` Instrument Sans) servies en local.

- [ ] **Étape 1 : Sauvegarde**
  `cp index.html backups/index.before-legal-pro-$(date +%Y%m%d-%H%M%S).html`
- [ ] **Étape 2 : Récupérer les .woff2** des familles Great Vibes (400),
  Bricolage Grotesque (600, 800), Instrument Sans (400,500,600,700). Méthode :
  récupérer le CSS de `fonts.googleapis.com/css2?...` avec un User-Agent moderne
  (renvoie des URL `.woff2`), puis télécharger chaque `.woff2` dans `fonts/`.
  **Si le réseau sortant est bloqué** dans l'environnement : le signaler à
  l'utilisateur et lui proposer soit de fournir les fichiers, soit de basculer
  temporairement sur une pile de polices système en fallback.
- [ ] **Étape 3 : Déclarer `@font-face`** en tête du `<style>` d'`index.html`,
  un bloc par graisse, `font-display:swap`, `src:url('fonts/xxx.woff2')`.
- [ ] **Étape 4 : Retirer** les 3 lignes Google (`index.html:8-10`) et la ligne
  Google d'`admin.html:8`.
- [ ] **Étape 5 : Vérifier** — `grep -rniE 'fonts.googleapis|gstatic' index.html
  admin.html` → **aucun résultat**. Servir en local
  (`python3 -m http.server`), ouvrir, confirmer que les titres manuscrits et
  gras s'affichent avec les bonnes polices (contrôle visuel).
- [ ] **Étape 6 : Commit** — `git add fonts index.html admin.html backups &&
  git commit -m "feat: auto-héberger les polices (RGPD, plus d'appel Google)"`

---

### Task 2 : Page « Légal » (mentions + confidentialité + cookies)

**Files :**
- Modify : `index.html` — ajout `"legal"` à `PAGES` (`index.html:661`) ; ajout
  d'un `<div class="page" id="page-legal">` dans `<main>` (après la page FAQ,
  avant `</main>`).

**Interfaces :**
- Consumes : routeur existant (`index.html:662`), classe `.page`/`.active`.
- Produces : route `#/legal` fonctionnelle, cible des liens du footer (Task 3).

- [ ] **Étape 1 : Ajouter la route** — `const PAGES = [...,"faq","legal"];`
- [ ] **Étape 2 : Écrire la page** `<div class="page" id="page-legal">` avec 3
  sections `<h2>` :
  - **Mentions légales** : « Éditeur du site : Saveurs du Mboa —
    `[dénomination exacte à compléter]`. Numéro d'entreprise (BCE) :
    `[N° BCE à compléter]`. Adresse : `[adresse à compléter]`. Contact :
    `[e-mail à compléter]`. Hébergement : GitHub Pages (GitHub Inc.). »
  - **Politique de confidentialité** : données collectées au moment de la
    commande via WhatsApp (nom, téléphone, adresse de livraison) ; finalité
    (préparer et livrer la commande) ; base légale (exécution de la commande) ;
    conservation (le temps de traiter la commande / obligations comptables) ;
    l'adresse saisie dans le champ de recherche est envoyée à OpenStreetMap
    (Nominatim) pour proposer des suggestions ; droits RGPD (accès,
    rectification, effacement) à exercer via `[e-mail à compléter]` ; pas de
    revente de données, pas de publicité.
  - **Cookies** : « Ce site n'utilise **aucun cookie de pistage ni de
    publicité**. Seul un petit enregistrement technique local peut mémoriser vos
    préférences d'affichage. Les polices et images sont hébergées sur le site
    lui-même. »
- [ ] **Étape 3 : Vérifier** — servir, aller sur `…/#/legal`, confirmer que la
  page s'affiche seule (les autres masquées), les 3 sections présentes, les
  champs `[… à compléter]` visibles.
- [ ] **Étape 4 : Commit** — `git commit -am "feat: page mentions légales /
  confidentialité / cookies (champs client à compléter)"`

---

### Task 3 : Retrait de la pop-up cookies + liens légaux au pied de page

**Files :**
- Modify : `index.html` — supprimer le CSS cookie (`~1203-1220`), le HTML
  `#cookie-fullscreen` (`1223-~1242`) et `#cookie-banner` (`1244-~1250`), et le
  JS de consentement (`~1254-1270`, `COOKIE_KEY`, `showFullscreen`, `acceptAll`,
  etc.). Retirer l'appel qui déclenche l'affichage au chargement.
- Modify : `index.html:598` et bloc footer (`~600-604`) — ajouter les liens
  légaux.

**Interfaces :**
- Consumes : route `#/legal` (Task 2).

- [ ] **Étape 1 : Supprimer** le CSS, le HTML et le JS liés aux cookies listés
  ci-dessus, ainsi que tout appel `showFullscreen()`/init cookies au démarrage.
- [ ] **Étape 2 : Ajouter au pied de page** (colonne « Le site ») :
  `<p><a href="#/legal">Mentions légales & confidentialité</a></p>` et
  `<p><a href="#/legal">Cookies</a></p>`.
- [ ] **Étape 3 : Vérifier** — servir, recharger : **aucune** pop-up bloquante
  au chargement ; le site est utilisable direct ; les liens du footer mènent à
  `#/legal` ; `grep -niE 'cookie-fullscreen|cookie-banner|COOKIE_KEY' index.html`
  → aucun résultat résiduel qui casse le JS (vérifier la console sans erreur).
- [ ] **Étape 4 : Commit** — `git commit -am "feat: retirer la pop-up cookies
  (aucun pistage) + liens légaux au pied de page"`

---

### Task 4 : Correction du lien admin dans le mode d'emploi

**Files :**
- Modify : `MODE-D-EMPLOI.md` (occurrences `saveurs-du-mboa` → `saveur-du-mboa`)

- [ ] **Étape 1 : Corriger** toutes les occurrences :
  `sed -i 's/saveurs-du-mboa/saveur-du-mboa/g' MODE-D-EMPLOI.md`
- [ ] **Étape 2 : Vérifier** — `grep -n 'saveurs-du-mboa' MODE-D-EMPLOI.md` →
  aucun résultat ; `grep -n 'saveur-du-mboa' MODE-D-EMPLOI.md` → occurrences OK.
- [ ] **Étape 3 : Commit** — `git commit -am "fix(docs): corriger le lien admin
  (saveur-du-mboa) dans le mode d'emploi"`

---

### Task 5 : Balises méta de partage (Open Graph) + favicon

**Files :**
- Modify : `index.html` `<head>` (après `index.html:7`)
- Create (si utile) : `favicon` (emoji SVG inline via data-URI ou petit fichier)

**Interfaces :**
- Consumes : une image de plat existante (ex. `photos/ndole.jpg`) comme
  `og:image`.

- [ ] **Étape 1 : Ajouter** dans `<head>` : `og:title`, `og:description`,
  `og:type=website`, `og:image` (URL absolue GitHub Pages vers `photos/ndole.jpg`
  — ex. `https://oblack917.github.io/saveur-du-mboa/photos/ndole.jpg`),
  `og:url`, `og:locale=fr_BE`, et les équivalents `twitter:card=summary_large_image`.
- [ ] **Étape 2 : Ajouter un favicon** — `<link rel="icon"
  href="data:image/svg+xml,<svg ...>🍲</svg>">` (emoji, zéro fichier externe) ou
  réutiliser une photo réduite. Rester 100 % local.
- [ ] **Étape 3 : Vérifier** — `grep -c 'og:' index.html` ≥ 5 ; servir et
  confirmer que l'onglet du navigateur montre le favicon.
- [ ] **Étape 4 : Commit** — `git commit -am "feat: aperçu de partage Open Graph
  + favicon (local)"`

---

### Task 6 : Vérification finale de bout en bout

- [ ] **Étape 1 : Servir** `python3 -m http.server 8000` et parcourir toutes les
  routes (`accueil, menu, histoire, comment, livraison, faq, legal`).
- [ ] **Étape 2 : Non-régression** — vérifier visuellement/manuellement :
  ajout au panier, ouverture WhatsApp (le lien `wa.me` se forme), autocomplétion
  d'adresse (une suggestion apparaît), calcul de distance. **Rien ne doit être
  cassé.**
- [ ] **Étape 3 : Zéro externe passif** — `grep -rniE
  'googleapis|gstatic|google-analytics|gtag|facebook|fbq' index.html admin.html`
  → seul reste éventuellement le lien Google **Maps** (actif, au clic) : OK.
- [ ] **Étape 4 : Récap à l'utilisateur** avant tout push, avec la liste des
  commits et ce qui reste en attente client (IBAN, réseaux, photos filigranées,
  champs légaux BCE).

---

## Auto-revue du plan
- **Couverture spec** : §1 Légal→Task 2 ; §2 Cookies→Task 3 ; §3 Fix admin→
  Task 4 ; §4 Polices→Task 1 ; §5 Finition→Task 5 ; non-régression→Task 6. OK.
- **Placeholders** : les `[… à compléter]` sont **intentionnels** (données
  client manquantes), signalés comme tels. Aucun TODO technique.
- **Cohérence** : routes/`PAGES`, IDs (`page-legal`), noms de fonctions cookies
  à retirer cohérents avec le code lu (`index.html:661-671`, `1203-1270`).
