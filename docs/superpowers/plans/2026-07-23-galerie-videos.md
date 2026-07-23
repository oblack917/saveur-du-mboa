# Galerie vidéos « En cuisine » — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une page `#/cuisine` avec une galerie de vidéos de plats auto-hébergées, gérée par les gérantes depuis `admin.html` comme les photos.

**Architecture:** Site statique GitHub Pages. Les vidéos (`videos/*.mp4`) sont listées dans un bloc `VIDEOS` de `config.js`, régénéré par `texteConfig()` dans l'admin. `index.html` affiche la galerie avec `<video controls preload="metadata">` et masque nav + page quand 0 vidéo. L'admin uploade en base64 via l'API GitHub contents (comme les photos) et supprime les fichiers retirés (nouvel `apiDelete`).

**Tech Stack:** HTML/CSS/JS vanilla, API GitHub contents, node (tests jetables), chromium headless (vérification visuelle).

**Spec :** `docs/superpowers/specs/2026-07-23-galerie-videos-design.md`

## Global Constraints

- **Zéro ressource externe** dans le site (RGPD) : pas d'embed, pas de CDN.
- Format accepté par l'admin : **`.mp4` uniquement**, **25 Mo max** (`TAILLE_VIDEO_MAX = 25 * 1024 * 1024`). Message d'erreur = astuce WhatsApp.
- `texteConfig()` doit **toujours préserver** : ZONES, FACTEUR_ROUTE, LIVRAISON_FIN_MAX, CRENEAUX_LIVRAISON, AVIS, AVIS_FORM_KEY, TITULAIRE, allergenes.
- Tout fichier piloté par l'admin est anti-caché (`photoUrl()` → `?v=CONFIG_VERSION`).
- Textes du site en français, ton chaleureux existant.
- Ne JAMAIS pousser sur `main` sans demande explicite de Yann ; travailler en branche `feat/galerie-videos`. `git fetch` avant tout push (les gérantes commitent via l'admin).
- Le flux d'upload réel via l'admin (jeton GitHub) ne peut PAS être testé ici — le dire honnêtement à la fin, ne pas prétendre « testé ».

---

### Task 0: Branche de travail

**Files:** aucun.

- [ ] **Step 1 : créer la branche**

```bash
cd /home/locataire/saveur-du-mboa && git fetch && git checkout -b feat/galerie-videos origin/main
```

Attendu : branche créée sur le dernier main distant (le spec commit `7f6980d` y est déjà si main n'a pas bougé ; sinon cherry-pick inutile, la spec est committée sur main local — vérifier avec `git log --oneline -3`).

---

### Task 1: Bloc `VIDEOS` dans config.js + régénération par l'admin (TDD)

**Files:**
- Create: `docs/superpowers/tests/test-videos-regeneration.js`
- Modify: `/home/locataire/saveur-du-mboa/config.js` (ajout bloc VIDEOS)
- Modify: `/home/locataire/saveur-du-mboa/admin.html` (`chargerConfig()` ~l.205, `texteConfig()` ~l.462)

**Interfaces:**
- Produces: `config.js` expose `const VIDEOS = [{ fichier:"videos/xxx.mp4", titre:"..." }]` ; `etat.VIDEOS` (array) dans l'admin ; `texteConfig()` sérialise `etat.VIDEOS` filtré sur `fichier` non vide.

- [ ] **Step 1 : écrire le test qui échoue** — `docs/superpowers/tests/test-videos-regeneration.js` (calqué sur `test-avis-regeneration.js`) :

```js
/* Test jetable : la régénération de config.js par l'admin (texteConfig)
   préserve VIDEOS (piège n°1 : toute constante non gérée par le
   générateur est écrasée à la publication). */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const admin = fs.readFileSync(path.join(__dirname, "../../../admin.html"), "utf8");
const debut = admin.indexOf("function texteConfig(){");
const fin = admin.indexOf("async function publier(", debut);
assert.ok(debut > -1 && fin > debut, "texteConfig introuvable dans admin.html");
const source = admin.slice(debut, fin);

const champs = {
  "g-whatsapp": "32489765828", "g-iban": "BE37 3632 7506 1728",
  "g-titulaire": "Bouquet Nanhou", "g-acompte": "50",
  "g-frais": "0.50", "g-km": "10",
};
global.document = { getElementById: id => ({ value: champs[id] !== undefined ? champs[id] : "" }) };
global.etat = {
  MENU: [{ id: "p1", cat: "plat", nom: "Ndolé", desc: "d", prix: 15, photo: "photos/p1.jpg", allergenes: "" }],
  LIVRAISON_FIN_MAX: 18,
  CRENEAUX_LIVRAISON: [{ debut: 10, fin: 13 }],
  FACTEUR_ROUTE: 1.3,
  ZONES: [{ id: "z", nom: "Zone", cuisine: "C", adresse: "A", lat: 1, lon: 2 }],
  AVIS_FORM_KEY: "cle-test",
  AVIS: [{ nom: "Marie", note: 5, texte: "Top", date: "2026-07" }],
  VIDEOS: [
    { fichier: "videos/video-1.mp4", titre: 'Ndolè "maison"' },
    { fichier: "videos/video-2.mp4", titre: "" },        // sans légende → gardée
    { fichier: "", titre: "orpheline → filtrée" },
  ],
};
eval(source);

const genere = texteConfig();
const relu = new Function(genere + "; return { VIDEOS, AVIS, AVIS_FORM_KEY, ZONES, CRENEAUX_LIVRAISON, MENU };")();

assert.strictEqual(relu.VIDEOS.length, 2, "seules les vidéos avec fichier sont publiées");
assert.strictEqual(relu.VIDEOS[0].fichier, "videos/video-1.mp4");
assert.strictEqual(relu.VIDEOS[0].titre, 'Ndolè "maison"', "guillemets de la légende bien échappés");
assert.strictEqual(relu.VIDEOS[1].titre, "", "légende vide autorisée");
assert.strictEqual(relu.AVIS.length, 1, "AVIS toujours préservés");
assert.strictEqual(relu.AVIS_FORM_KEY, "cle-test", "clé Web3Forms toujours préservée");
assert.strictEqual(relu.ZONES.length, 1, "ZONES toujours préservées");
assert.strictEqual(relu.CRENEAUX_LIVRAISON.length, 1, "créneaux toujours préservés");

// Cas départ : aucune vidéo
etat.VIDEOS = [];
const relu2 = new Function(texteConfig() + "; return { VIDEOS };")();
assert.deepStrictEqual(relu2.VIDEOS, [], "VIDEOS vide régénéré vide");

// Cas robustesse : VIDEOS absent de l'état (ancien config chargé)
delete etat.VIDEOS;
const relu3 = new Function(texteConfig() + "; return { VIDEOS };")();
assert.deepStrictEqual(relu3.VIDEOS, [], "VIDEOS absent → bloc vide, pas d'erreur");

console.log("OK");
```

- [ ] **Step 2 : vérifier qu'il échoue**

Run: `node docs/superpowers/tests/test-videos-regeneration.js`
Expected: FAIL — `VIDEOS is not defined` (le config généré n'a pas encore le bloc).

- [ ] **Step 3 : implémenter**

3a. `config.js` — ajouter après le bloc `AVIS` (l.23) :

```js
/* Vidéos « En cuisine » — gérées depuis la page d'administration.
   { fichier:"videos/xxx.mp4", titre:"légende affichée sous la vidéo" } */
const VIDEOS = [];
```

3b. `admin.html`, `chargerConfig()` — dans l'objet retourné par `lire` (~l.213), ajouter après la ligne `AVIS:` :

```js
        VIDEOS: (typeof VIDEOS !== "undefined" ? VIDEOS : []),
```

(attention à la virgule de la ligne précédente).

3c. `admin.html`, `texteConfig()` — après le calcul de `lignesAvis` (~l.487), ajouter :

```js
  const videosArr = (Array.isArray(etat.VIDEOS) ? etat.VIDEOS : []).filter(v => v && v.fichier);
  const lignesVideos = videosArr.map(v =>
    `  { fichier:${s(v.fichier)}, titre:${s((v.titre || "").trim())} }`
  ).join(",\n");
```

puis dans le template retourné, après le bloc `AVIS = [...]` :

```
/* Vidéos « En cuisine » — gérées depuis la page d'administration.
   { fichier:"videos/xxx.mp4", titre:"légende affichée sous la vidéo" } */
const VIDEOS = [
${lignesVideos}
];
```

- [ ] **Step 4 : vérifier que les tests passent (le nouveau ET les anciens)**

Run: `node docs/superpowers/tests/test-videos-regeneration.js && node docs/superpowers/tests/test-avis-regeneration.js && node docs/superpowers/tests/test-avis-coller.js && for t in docs/superpowers/tests/test-*.js; do echo "== $t"; node "$t" || break; done`
Expected: `OK` partout.

- [ ] **Step 5 : commit**

```bash
git add config.js admin.html docs/superpowers/tests/test-videos-regeneration.js
git commit -m "feat: bloc VIDEOS dans config.js, régénéré et préservé par l'admin"
```

---

### Task 2: Page `#/cuisine` sur le site

**Files:**
- Modify: `/home/locataire/saveur-du-mboa/index.html` — nav (~l.370), CSS (~l.343, près de `.avis-carte`), nouvelle page (après `page-avis`, ~l.535), `PAGES` + `router()` (~l.893), fonctions de rendu (près de `rendreApercuAvis`, ~l.1034), appel dans `majTextesConfig()` (~l.955).

**Interfaces:**
- Consumes: `VIDEOS` (Task 1), `photoUrl(path)` (l.915), `escapeHtml` (existant).
- Produces: `videosValides()` → array filtré ; `rendreVideos()` → remplit `#videos-liste` et affiche/masque `#nav-cuisine`.

- [ ] **Step 1 : nav** — dans `<nav class="principal" id="nav">` (l.367), entre « Notre Histoire » et « Comment ça marche », ajouter (masqué par défaut : si config en panne, jamais de lien mort) :

```html
      <a href="#/cuisine" data-page="cuisine" id="nav-cuisine" style="display:none">En cuisine</a>
```

- [ ] **Step 2 : CSS** — à côté de `.avis-carte` (~l.343) :

```css
.videos-grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;max-width:960px;margin:0 auto}
.video-carte{background:var(--creme);border:1.5px solid #e4d3b6;border-radius:var(--radius);padding:.8rem;margin:0}
.video-carte video{width:100%;aspect-ratio:16/10;object-fit:contain;background:#000;border-radius:10px;display:block}
.video-carte figcaption{font-size:.95rem;color:var(--brun-2);margin-top:.6rem;text-align:center}
```

- [ ] **Step 3 : page** — après la fermeture de `page-avis` (l.535) :

```html
<!-- ============ PAGE EN CUISINE ============ -->
<div class="page" id="page-cuisine">
  <section class="page-hero wax-bg">
    <span class="fil-ariane">En cuisine</span>
    <h1>La cuisine en <span class="fil">vidéo</span></h1>
    <p>Un coup d'œil derrière les fourneaux : nos plats, en vrai.</p>
  </section>
  <section>
    <div class="container">
      <div id="videos-liste" class="videos-grille"></div>
    </div>
  </section>
</div>
```

- [ ] **Step 4 : routeur** — l.893, ajouter `"cuisine"` à `PAGES` :

```js
const PAGES = ["accueil","menu","histoire","comment","livraison","faq","avis","cuisine","legal"];
```

et dans `router()`, juste après `if(!PAGES.includes(cible)) cible = "accueil";` :

```js
  if(cible === "cuisine" && !videosValides().length) cible = "accueil"; // galerie vide = jamais montrée
```

- [ ] **Step 5 : rendu** — après `rendreApercuAvis()` (~l.1034) :

```js
/* ===== Vidéos « En cuisine » ===== */
function videosValides(){
  const src = (typeof VIDEOS !== 'undefined' && Array.isArray(VIDEOS)) ? VIDEOS : [];
  return src.filter(v => v && typeof v.fichier === 'string' && v.fichier.trim());
}
function rendreVideos(){
  const v = videosValides();
  const lien = document.getElementById('nav-cuisine');
  if(lien) lien.style.display = v.length ? '' : 'none';
  const zone = document.getElementById('videos-liste');
  if(!zone) return;
  /* preload="metadata" : le visiteur ne télécharge que l'aperçu,
     la vidéo complète ne part qu'à la lecture. */
  zone.innerHTML = v.map(x => `
    <figure class="video-carte">
      <video controls preload="metadata" playsinline src="${photoUrl(x.fichier)}"></video>
      ${x.titre ? `<figcaption>${escapeHtml(x.titre)}</figcaption>` : ''}
    </figure>`).join('');
}
```

puis dans `majTextesConfig()`, après l'appel `rendreApercuAvis();` (l.955), ajouter :

```js
  rendreVideos();
```

- [ ] **Step 6 : vérification headless (2 états)**

```bash
D=$CLAUDE_JOB_DIR/tmp/site-videos-test && rm -rf "$D" && mkdir -p "$D"
cp -r /home/locataire/saveur-du-mboa/. "$D" && rm -rf "$D/.git"
# vidéo mp4 de test (ffmpeg installé au besoin : sudo apt-get install -y ffmpeg)
mkdir -p "$D/videos"
ffmpeg -y -f lavfi -i testsrc=duration=2:size=640x400:rate=15 -pix_fmt yuv420p "$D/videos/video-test.mp4"
# config de test avec 2 vidéos
sed -i 's|const VIDEOS = \[\];|const VIDEOS = [\n  { fichier:"videos/video-test.mp4", titre:"Préparation du ndolè" },\n  { fichier:"videos/video-test.mp4", titre:"" }\n];|' "$D/config.js"
cd "$D" && python3 -m http.server 8901 &>/dev/null &
sleep 1
chromium --headless --disable-gpu --window-size=1280,900 --screenshot=$CLAUDE_JOB_DIR/tmp/cuisine-desktop.png "http://localhost:8901/#/cuisine"
chromium --headless --disable-gpu --window-size=390,844 --screenshot=$CLAUDE_JOB_DIR/tmp/cuisine-mobile.png "http://localhost:8901/#/cuisine"
chromium --headless --disable-gpu --window-size=1280,900 --screenshot=$CLAUDE_JOB_DIR/tmp/accueil-avec-videos.png "http://localhost:8901/#/accueil"
```

Vérifier (Read des PNG) : galerie 2 cartes (1 avec légende, 1 sans), lien « En cuisine » dans la nav, rendu mobile propre.

Puis l'état 0 vidéo sur le vrai dépôt :

```bash
cd /home/locataire/saveur-du-mboa && python3 -m http.server 8902 &>/dev/null &
sleep 1
chromium --headless --disable-gpu --window-size=1280,900 --screenshot=$CLAUDE_JOB_DIR/tmp/zero-videos.png "http://localhost:8902/#/cuisine"
```

Vérifier : redirigé sur l'accueil, PAS de lien « En cuisine » dans la nav. Contrôler la console des deux serveurs avec `--enable-logging=stderr 2>&1 | grep -i error` (aucune erreur JS). Tuer les serveurs (`kill %1 %2` ou pkill sur les ports).

- [ ] **Step 7 : commit**

```bash
git add index.html
git commit -m "feat: page « En cuisine » — galerie de vidéos, masquée tant qu'aucune vidéo"
```

---

### Task 3: Section vidéos dans l'admin (upload, légende, suppression)

**Files:**
- Modify: `/home/locataire/saveur-du-mboa/admin.html` — HTML (nouvelle carte entre `zone-menu` l.85 et la carte Réglages l.87), variables globales (~l.146), `apiDelete` (après `apiPut` l.168), `afficher()` (~l.233), fonctions vidéos (après le bloc avis ~l.366), `lireFormulaire()` (~l.402), `publier()` (~l.579).

**Interfaces:**
- Consumes: `etat.VIDEOS`, `texteConfig()` (Task 1), `apiGet`/`apiPut` existants.
- Produces: `videosModifiees` (chemin → dataURL), `videosASupprimer` (array de chemins), `apiDelete(chemin, sha, message)`, `afficherVideos()`, `lireVideos()`, `ajouterVideo(input)`, `supprimerVideo(i)`.

- [ ] **Step 1 : HTML** — entre `<div id="zone-menu"></div>` (l.85) et la carte Réglages :

```html
    <div class="carte">
      <h2>🎬 <span class="puce">Vidéos</span> « En cuisine »</h2>
      <p style="font-size:.85rem;color:#8a7355;margin:.3rem 0 .8rem">
        Clips courts (15 à 30 secondes), format .mp4, 25 Mo maximum.
        Astuce : envoyez-vous la vidéo sur WhatsApp puis choisissez le fichier
        reçu — il sera léger et au bon format.</p>
      <div id="zone-videos"></div>
      <button class="btn" type="button" onclick="document.getElementById('fichier-video').click()" style="background:#eef7ee;color:#1c5b2b;margin-top:.6rem;font-size:.9rem;padding:.55rem 1.1rem">+ Ajouter une vidéo</button>
      <input type="file" id="fichier-video" accept="video/mp4,.mp4" style="display:none" onchange="ajouterVideo(this)">
      <p id="err-video" style="display:none;color:#8f2013;font-size:.85rem;margin-top:.4rem"></p>
    </div>
```

- [ ] **Step 2 : variables + apiDelete** — sous `let photosModifiees = {};` (l.146) :

```js
let videosModifiees = {};  // chemin videos/xxx.mp4 -> dataURL (nouvelles vidéos à envoyer)
let videosASupprimer = []; // chemins à effacer du dépôt à la publication
const TAILLE_VIDEO_MAX = 25 * 1024 * 1024; // 25 Mo
```

et après `apiPut` (l.168) :

```js
async function apiDelete(chemin, sha, message){
  const corps = { message, sha, branch: BRANCH };
  const r = await fetch(API + chemin, { method:"DELETE", headers: entetes(), body: JSON.stringify(corps) });
  if(!r.ok){
    const d = await r.json().catch(() => ({}));
    throw new Error("Échec de suppression de " + chemin + " (" + r.status + ") " + (d.message || ""));
  }
  return r.json();
}
```

- [ ] **Step 3 : fonctions vidéos** — après `collerAvis()` (~l.366) :

```js
/* ===== Vidéos « En cuisine » ===== */
function afficherVideos(){
  const zone = document.getElementById("zone-videos");
  const vids = Array.isArray(etat.VIDEOS) ? etat.VIDEOS : [];
  zone.innerHTML = vids.length === 0
    ? '<p style="font-size:.9rem;color:#8a7355;padding:.5rem 0">Aucune vidéo pour le moment.</p>'
    : vids.map((v, i) => `
      <div class="video-ligne${videosModifiees[v.fichier] ? ' modif' : ''}" style="border-bottom:1.5px dashed #e4d3b6;padding:.8rem 0">
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:1.3rem">🎬</span>
          <input type="text" id="vid-titre-${i}" value="${(v.titre||'').replace(/"/g,'&quot;')}" placeholder="Légende (ex : Préparation du ndolè)" style="flex:1;min-width:10rem">
          <button class="btn" type="button" onclick="supprimerVideo(${i})" title="Supprimer cette vidéo" style="background:#fdecea;color:#8f2013;padding:.4rem .7rem;font-size:.85rem">✕</button>
        </div>
        <p style="font-size:.78rem;color:#8a7355;margin-top:.3rem">${v.fichier}${videosModifiees[v.fichier] ? " — sera envoyée à la publication" : ""}</p>
      </div>`).join("");
}
function lireVideos(){
  const vids = Array.isArray(etat.VIDEOS) ? etat.VIDEOS : [];
  return vids.map((v, i) => {
    const champ = document.getElementById("vid-titre-" + i);
    return { fichier: v.fichier, titre: champ ? champ.value.trim() : (v.titre || "") };
  });
}
function ajouterVideo(input){
  const fichier = input.files[0];
  input.value = ""; // permet de re-choisir le même fichier après une erreur
  const err = document.getElementById("err-video");
  err.style.display = "none";
  if(!fichier) return;
  const estMp4 = /\.mp4$/i.test(fichier.name) || fichier.type === "video/mp4";
  if(!estMp4){
    err.textContent = "❌ Ce fichier n'est pas au format .mp4 (il ne se lirait pas sur tous les téléphones). Astuce : envoyez-vous la vidéo sur WhatsApp puis choisissez le fichier reçu.";
    err.style.display = "block";
    return;
  }
  if(fichier.size > TAILLE_VIDEO_MAX){
    const mo = Math.round(fichier.size / (1024*1024));
    err.textContent = "❌ Vidéo trop lourde (" + mo + " Mo, maximum 25 Mo). Astuce : envoyez-vous la vidéo sur WhatsApp puis choisissez le fichier reçu — il sera bien plus léger.";
    err.style.display = "block";
    return;
  }
  const lecteur = new FileReader();
  lecteur.onload = e => {
    etat.VIDEOS = lireVideos();
    const chemin = "videos/video-" + Date.now() + ".mp4";
    videosModifiees[chemin] = e.target.result;
    etat.VIDEOS.unshift({ fichier: chemin, titre: "" });
    afficherVideos();
    document.getElementById("zone-videos").scrollIntoView({behavior:"smooth", block:"center"});
  };
  lecteur.readAsDataURL(fichier);
}
function supprimerVideo(i){
  etat.VIDEOS = lireVideos();
  const v = etat.VIDEOS[i];
  if(!v) return;
  if(!confirm("Supprimer cette vidéo" + (v.titre ? " (« " + v.titre + " »)" : "") + " du site ?")) return;
  if(videosModifiees[v.fichier]){
    delete videosModifiees[v.fichier]; // jamais publiée : rien à effacer du dépôt
  } else {
    videosASupprimer.push(v.fichier);
  }
  etat.VIDEOS.splice(i, 1);
  afficherVideos();
}
```

- [ ] **Step 4 : branchements** — dans `afficher()` (~l.233), après `afficherAvis();` ajouter `afficherVideos();`. Dans `lireFormulaire()` (~l.406), après `etat.AVIS = lireAvis();` ajouter :

```js
  etat.VIDEOS = lireVideos();
```

- [ ] **Step 5 : publication** — dans `publier()`, dans le `try` (l.579), entre la boucle photos et « 2. config.js », insérer :

```js
    // 1bis. Nouvelles vidéos
    const cheminsVideos = Object.keys(videosModifiees);
    for(let i = 0; i < cheminsVideos.length; i++){
      const chemin = cheminsVideos[i];
      statut.textContent = `Envoi de la vidéo ${i+1}/${cheminsVideos.length}… (cela peut prendre une minute)`;
      const b64 = videosModifiees[chemin].split(",")[1];
      let sha = null;
      try{ sha = (await apiGet(chemin)).sha; }catch(e){}
      await apiPut(chemin, b64, sha, "Ajout vidéo En cuisine");
    }
    // 1ter. Vidéos retirées : on efface les fichiers du dépôt.
    // Un échec ici ne bloque PAS la publication (fichier orphelin sans gravité).
    let suppressionsRatees = 0;
    for(const chemin of videosASupprimer){
      statut.textContent = "Nettoyage des vidéos supprimées…";
      try{
        const sha = (await apiGet(chemin)).sha;
        await apiDelete(chemin, sha, "Suppression vidéo En cuisine");
      }catch(e){ suppressionsRatees++; }
    }
```

et dans le bloc de succès (après `photosModifiees = {};` l.596) ajouter :

```js
    videosModifiees = {};
    videosASupprimer = [];
    afficherVideos();
```

puis adapter le message de succès (l.601) :

```js
    err.textContent = "✅ Publié ! Le site se met à jour dans 1 à 2 minutes."
      + (suppressionsRatees ? " (Note : " + suppressionsRatees + " ancien fichier vidéo n'a pas pu être nettoyé — sans conséquence.)" : "");
```

- [ ] **Step 6 : re-passer les tests node** (texteConfig a bougé d'offsets, le test l'extrait par marqueurs — il doit toujours passer)

Run: `for t in docs/superpowers/tests/test-*.js; do echo "== $t"; node "$t" || break; done`
Expected: `OK` partout.

- [ ] **Step 7 : vérification headless de l'admin (sans jeton)** — servir le dépôt (`python3 -m http.server 8903`), capturer `admin.html` (écran de connexion : inchangé, console sans erreur JS). Le flux complet nécessite le jeton → sera testé par Yann.

- [ ] **Step 8 : commit**

```bash
git add admin.html
git commit -m "feat(admin): section Vidéos « En cuisine » — ajout .mp4 ≤ 25 Mo, légendes, suppression avec nettoyage du dépôt"
```

---

### Task 4: Mode d'emploi + vérification finale

**Files:**
- Modify: `/home/locataire/saveur-du-mboa/MODE-D-EMPLOI.md` (nouvelle section après la section ⭐ avis)

- [ ] **Step 1 : section mode d'emploi** — insérer, en respectant le ton des sections existantes (lire le fichier d'abord pour caler le style des titres) :

```markdown
## 🎬 Ajouter une vidéo « En cuisine »

Le site a une page **En cuisine** avec vos vidéos de plats. Elle n'apparaît
que si au moins une vidéo est publiée.

1. **Filmez court** : 15 à 30 secondes, c'est parfait.
2. **Allégez la vidéo** (obligatoire, 25 Mo maximum) — le plus simple :
   - envoyez la vidéo **sur WhatsApp** (à vous-même ou à votre binôme) ;
   - ouvrez le message reçu et **enregistrez la vidéo** dans le téléphone ;
   - c'est CE fichier-là qu'il faut choisir dans l'admin : WhatsApp l'a
     compressé et mis au bon format tout seul.
3. Dans la page d'administration, section **🎬 Vidéos « En cuisine »**,
   appuyez sur **+ Ajouter une vidéo** et choisissez le fichier.
4. Écrivez une **légende** (ex : « Préparation du ndolè »), puis
   **📤 Publier les changements**.
5. La vidéo apparaît sur le site après 1 à 2 minutes.

Pour retirer une vidéo : bouton **✕** à côté de sa légende, puis Publier.
```

- [ ] **Step 2 : vérification finale complète**

- `for t in docs/superpowers/tests/test-*.js; do node "$t" || break; done` → tous `OK`.
- Refaire les captures du Task 2 Step 6 (les deux états) si `index.html` a bougé depuis.
- `git status` propre après commit ; relire le diff complet `git diff origin/main...HEAD`.

- [ ] **Step 3 : commit**

```bash
git add MODE-D-EMPLOI.md
git commit -m "docs: mode d'emploi des vidéos « En cuisine » pour les gérantes"
```

- [ ] **Step 4 : rapport honnête à Yann** — montrer les captures, rappeler :
  1. le flux d'upload réel (jeton) reste à tester par lui : ajouter une petite vidéo via l'admin → Publier → vérifier sur le site ;
  2. la fusion dans `main` + mise en ligne n'a lieu que s'il dit « mets en ligne » (alors : `git fetch`, merge, push).
