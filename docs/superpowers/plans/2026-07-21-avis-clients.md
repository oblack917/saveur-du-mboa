# Avis clients — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter des avis clients (note en étoiles + commentaire), soumis via un formulaire relié à un service externe gratuit, modérés par la propriétaire depuis l'admin, et affichés sur une page dédiée « Avis » + un aperçu sur l'accueil.

**Architecture:** Site 100 % statique. Les avis validés sont stockés dans `config.js` (tableau `AVIS`), édités depuis `admin.html` (qui régénère `config.js` via l'API GitHub). `index.html` lit `AVIS`, calcule la moyenne, rend la page et l'aperçu, et poste les nouveaux avis vers Web3Forms (clé `AVIS_FORM_KEY`). Aucun serveur, aucun compte client.

**Tech Stack:** HTML/CSS/JS vanilla (pas de framework), routeur par hash existant, Web3Forms (`https://api.web3forms.com/submit`), Node pour `--check` et tests de logique pure.

## Global Constraints

- Aucune dépendance npm, aucun framework : JS vanilla uniquement.
- Aucune image ni ressource externe autre que l'appel `fetch` POST vers `https://api.web3forms.com/submit`.
- `config.js` est **généré par `admin.html`** — toute nouvelle constante doit être produite par le générateur ET lue par `admin.html` au chargement, sinon elle est écrasée à la prochaine publication.
- Démarrage : `AVIS = []` (liste vide) et `AVIS_FORM_KEY = ""` (mode démo).
- `note` = entier 1–5. `date` = chaîne « AAAA-MM ».
- Après chaque tâche touchant du JS : `node --check` sur le(s) fichier(s) concerné(s) doit passer.
- E-mail du client : champ **optionnel**.
- Textes en français, ton cohérent avec le site (tutoiement absent, vouvoiement client).

---

### Task 1: Réglages `config.js` (données par défaut)

**Files:**
- Modify: `config.js` (ajout de deux constantes après `KM_GRATUITS`/bloc créneaux)

**Interfaces:**
- Produces: constantes globales `AVIS_FORM_KEY` (string) et `AVIS` (array d'objets `{nom, note, texte, date}`), lisibles depuis `index.html` et `admin.html`.

- [ ] **Step 1: Ajouter les constantes dans `config.js`**

Insérer juste après le bloc `CRENEAUX_LIVRAISON` (avant `/* Zones de livraison */`) :

```js
/* Avis clients — gérés depuis la page d'administration.
   AVIS_FORM_KEY = clé Web3Forms du formulaire d'avis (vide = formulaire en mode démo).
   AVIS = avis validés affichés sur le site : { nom, note (1-5), texte, date "AAAA-MM" }. */
const AVIS_FORM_KEY = "";
const AVIS = [];
```

- [ ] **Step 2: Vérifier la syntaxe**

Run: `node --check config.js`
Expected: aucune sortie (succès).

- [ ] **Step 3: Commit**

```bash
git add config.js
git commit -m "feat(avis): réglages par défaut AVIS et AVIS_FORM_KEY dans config.js"
```

---

### Task 2: Logique pure des avis (index.html) — TDD

**Files:**
- Modify: `index.html` (ajouter les fonctions près de `majTextesConfig`, vers la ligne 915)
- Test: `docs/superpowers/tests/test-avis-logique.js` (script Node jetable)

**Interfaces:**
- Produces:
  - `avisValides()` → `Array<{nom,note,texte,date}>` : filtre `AVIS` en ne gardant que les avis bien formés (note entière 1–5, `nom` et `texte` non vides).
  - `moyenneAvis()` → `number` : moyenne des notes des avis valides, arrondie à 1 décimale ; `0` si aucun avis.
  - `etoilesHtml(note)` → `string` : HTML de 5 étoiles (`★` pleines jusqu'à `note`, `☆` vides ensuite).

- [ ] **Step 1: Écrire le test qui échoue**

Créer `docs/superpowers/tests/test-avis-logique.js` :

```js
const assert = require("assert");

// On simule les globals que lisent les fonctions.
global.AVIS = [
  { nom: "A", note: 5, texte: "top", date: "2026-07" },
  { nom: "B", note: 4, texte: "bien", date: "2026-07" },
  { nom: "",  note: 3, texte: "sans nom", date: "2026-07" }, // invalide
  { nom: "C", note: 9, texte: "note hors bornes", date: "2026-07" }, // invalide
];

const { avisValides, moyenneAvis, etoilesHtml } = require("./_avis-extrait.js");

assert.strictEqual(avisValides().length, 2, "2 avis valides attendus");
assert.strictEqual(moyenneAvis(), 4.5, "moyenne 4.5 attendue");

global.AVIS = [];
assert.strictEqual(avisValides().length, 0);
assert.strictEqual(moyenneAvis(), 0, "moyenne 0 si aucun avis");

assert.strictEqual(etoilesHtml(3), "★★★☆☆");
assert.strictEqual(etoilesHtml(5), "★★★★★");
console.log("OK");
```

- [ ] **Step 2: Créer l'extrait testable et lancer le test (échec attendu)**

Créer `docs/superpowers/tests/_avis-extrait.js` avec les fonctions (c'est ce code qui sera ensuite copié dans `index.html`) :

```js
function avisValides(){
  const src = (typeof AVIS !== 'undefined' && Array.isArray(AVIS)) ? AVIS : [];
  return src.filter(a => a
    && Number.isInteger(a.note) && a.note >= 1 && a.note <= 5
    && typeof a.nom === 'string' && a.nom.trim()
    && typeof a.texte === 'string' && a.texte.trim());
}
function moyenneAvis(){
  const v = avisValides();
  if(!v.length) return 0;
  return Math.round((v.reduce((s,a)=>s+a.note,0) / v.length) * 10) / 10;
}
function etoilesHtml(note){
  const n = Math.max(0, Math.min(5, Math.round(note)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
module.exports = { avisValides, moyenneAvis, etoilesHtml };
```

Run: `node docs/superpowers/tests/test-avis-logique.js`
Expected au 1er essai (avant d'avoir créé `_avis-extrait.js`) : FAIL « Cannot find module ». Après création : `OK`.

- [ ] **Step 3: Copier les fonctions dans `index.html`**

Dans `index.html`, juste après la fonction `remplirCreneaux()` (créée précédemment), coller les 3 fonctions **sans** la ligne `module.exports` :

```js
/* ===== Avis clients (config.js) ===== */
function avisValides(){
  const src = (typeof AVIS !== 'undefined' && Array.isArray(AVIS)) ? AVIS : [];
  return src.filter(a => a
    && Number.isInteger(a.note) && a.note >= 1 && a.note <= 5
    && typeof a.nom === 'string' && a.nom.trim()
    && typeof a.texte === 'string' && a.texte.trim());
}
function moyenneAvis(){
  const v = avisValides();
  if(!v.length) return 0;
  return Math.round((v.reduce((s,a)=>s+a.note,0) / v.length) * 10) / 10;
}
function etoilesHtml(note){
  const n = Math.max(0, Math.min(5, Math.round(note)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
```

- [ ] **Step 4: Vérifier la syntaxe de `index.html`**

Run:
```bash
start=$(grep -n "^<script>$" index.html | head -1 | cut -d: -f1)
end=$(awk 'NR>'"$start"' && /<\/script>/{print NR; exit}' index.html)
sed -n "$((start+1)),$((end-1))p" index.html > /tmp/idx.js && node --check /tmp/idx.js && echo OK
```
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add index.html docs/superpowers/tests/
git commit -m "feat(avis): logique pure (filtrage, moyenne, étoiles) + tests Node"
```

---

### Task 3: Rubrique « Avis » dans la navigation + routeur

**Files:**
- Modify: `index.html` — bloc nav (~ligne 357-364), `PAGES` (~ligne 871), ajout d'un `<div class="page" id="page-avis">` vide (juste avant `<div class="page" id="page-comment">`, ~ligne 504)

**Interfaces:**
- Produces: page routable `#/avis` (id `page-avis`), lien de nav actif.

- [ ] **Step 1: Ajouter le lien dans la nav**

Après la ligne `<a href="#/faq" data-page="faq">FAQ</a>` ajouter :

```html
      <a href="#/avis" data-page="avis">Avis</a>
```

- [ ] **Step 2: Ajouter `"avis"` au routeur**

Remplacer :
```js
const PAGES = ["accueil","menu","histoire","comment","livraison","faq","legal"];
```
par :
```js
const PAGES = ["accueil","menu","histoire","comment","livraison","faq","avis","legal"];
```

- [ ] **Step 3: Ajouter la page vide (structure)**

Juste avant `<!-- ============ PAGE COMMENT ÇA MARCHE ============ -->` insérer :

```html
<!-- ============ PAGE AVIS ============ -->
<div class="page" id="page-avis">
  <section class="page-hero wax-bg">
    <span class="fil-ariane">Avis</span>
    <h1>Avis de nos <span class="fil">clients</span></h1>
    <p>Ce que pensent celles et ceux qui ont goûté notre cuisine.</p>
  </section>
  <section>
    <div class="container">
      <div id="avis-moyenne" style="text-align:center;margin-bottom:1.5rem"></div>
      <div id="avis-liste"></div>
      <div id="avis-form-bloc" style="max-width:560px;margin:2.5rem auto 0"></div>
    </div>
  </section>
</div>
```

- [ ] **Step 4: Vérifier + tester la navigation**

Run: `node --check` (comme Task 2 Step 4). Puis déployer et vérifier que `#/avis` affiche la page (hero visible, zones vides pour l'instant).

Run:
```bash
git add index.html && git commit -m "feat(avis): rubrique Avis dans la nav + page routable" && git push
```
Attendre le build Pages, puis :
```bash
curl -s "https://oblack917.github.io/saveur-du-mboa/index.html?cb=$(date +%s)" | grep -c 'id="page-avis"'
```
Expected: `1`

- [ ] **Step 5: Commit** (déjà fait au Step 4)

---

### Task 4: Rendu de la page Avis (moyenne + liste + état vide)

**Files:**
- Modify: `index.html` — nouvelle fonction `rendreAvis()` (près des fonctions avis), appelée dans `majTextesConfig()`

**Interfaces:**
- Consumes: `avisValides()`, `moyenneAvis()`, `etoilesHtml()` (Task 2).
- Produces: `rendreAvis()` qui remplit `#avis-moyenne` et `#avis-liste`.

- [ ] **Step 1: Écrire `rendreAvis()`**

Ajouter après `etoilesHtml` :

```js
function moisFr(date){
  const mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const m = /^(\d{4})-(\d{2})$/.exec(date || "");
  if(!m) return "";
  return mois[parseInt(m[2],10)-1] + " " + m[1];
}
function carteAvisHtml(a){
  return `<div class="avis-carte">
    <div class="avis-tete"><span class="avis-etoiles">${etoilesHtml(a.note)}</span>
      <span class="avis-nom">${echapper(a.nom)}</span>
      ${moisFr(a.date) ? `<span class="avis-date">· ${moisFr(a.date)}</span>` : ''}</div>
    <p class="avis-texte">« ${echapper(a.texte)} »</p>
  </div>`;
}
function rendreAvis(){
  const liste = document.getElementById('avis-liste');
  const moy = document.getElementById('avis-moyenne');
  if(!liste || !moy) return;
  const v = avisValides();
  if(!v.length){
    moy.innerHTML = '';
    liste.innerHTML = `<p style="text-align:center;color:#8a7355">Soyez le premier à laisser un avis 💛</p>`;
    return;
  }
  moy.innerHTML = `<div class="avis-note-globale">${etoilesHtml(Math.round(moyenneAvis()))}</div>
    <div class="avis-note-chiffre">${moyenneAvis().toString().replace('.', ',')} / 5 · ${v.length} avis</div>`;
  liste.innerHTML = v.map(carteAvisHtml).join('');
}
```

Ajouter aussi le helper `echapper` s'il n'existe pas déjà (chercher `function echapper` ; s'il existe, ne pas le redéfinir) :

```js
function echapper(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

- [ ] **Step 2: Appeler `rendreAvis()` dans `majTextesConfig()`**

À la fin de `majTextesConfig()` (après `remplirCreneaux();` et le remplissage `.js-creneaux`), ajouter :

```js
  rendreAvis();
```

- [ ] **Step 3: Ajouter le CSS des avis**

Dans le premier bloc `<style>` (avant sa balise `</style>`), ajouter :

```css
.avis-carte{background:var(--creme);border:1.5px solid #e4d3b6;border-radius:var(--radius);padding:1.1rem 1.3rem;margin:0 auto 1rem;max-width:640px}
.avis-tete{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.4rem}
.avis-etoiles{color:var(--or);letter-spacing:1px}
.avis-nom{font-weight:700;color:var(--encre)}
.avis-date{color:#8a7355;font-size:.9rem}
.avis-texte{margin:0;color:var(--brun);font-style:italic}
.avis-note-globale{font-size:1.8rem;color:var(--or);letter-spacing:2px}
.avis-note-chiffre{font-weight:700;color:var(--encre);margin-top:.2rem}
```

- [ ] **Step 4: Tester le rendu**

Vérifier `node --check`. Pour un test visuel : ajouter temporairement un avis dans `config.js` local (`const AVIS = [{nom:"Test",note:5,texte:"Essai",date:"2026-07"}];`), ouvrir `#/avis`, confirmer moyenne + carte, **puis remettre `AVIS = []`**.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "feat(avis): rendu page Avis (moyenne, liste, état vide) + CSS"
```

---

### Task 5: Formulaire « Laisser un avis » + envoi Web3Forms + mode démo

**Files:**
- Modify: `index.html` — construction du formulaire dans `#avis-form-bloc`, gestion de l'envoi, honeypot, mode démo, consentement.

**Interfaces:**
- Consumes: `AVIS_FORM_KEY` (config), `etoilesHtml`.
- Produces: `rendreFormAvis()` (appelée dans `majTextesConfig`), `envoyerAvis(ev)`, `setNoteAvis(n)`.

- [ ] **Step 1: Écrire `rendreFormAvis()` et les handlers**

Ajouter près des fonctions avis :

```js
let _noteAvisChoisie = 0;
function setNoteAvis(n){
  _noteAvisChoisie = n;
  document.querySelectorAll('#avis-etoiles-choix .etoile-choix').forEach((el, i) => {
    el.textContent = i < n ? '★' : '☆';
  });
  const err = document.getElementById('avis-note-err');
  if(err) err.style.display = 'none';
}
function rendreFormAvis(){
  const bloc = document.getElementById('avis-form-bloc');
  if(!bloc) return;
  const actif = typeof AVIS_FORM_KEY !== 'undefined' && AVIS_FORM_KEY;
  bloc.innerHTML = `
    <h2 class="section-titre" style="text-align:center">Laisser un avis</h2>
    ${actif ? '' : `<p class="mini" style="text-align:center;color:#8a7355">Le formulaire sera bientôt actif. En attendant, écrivez-nous sur <a class="js-wa" href="#">WhatsApp</a>.</p>`}
    <form id="avis-form" class="form" ${actif ? '' : 'style="opacity:.55;pointer-events:none"'}>
      <label for="av-nom">Votre prénom / nom *</label>
      <input id="av-nom" type="text" maxlength="60" placeholder="Ex. Marie L.">
      <label>Votre note *</label>
      <div id="avis-etoiles-choix" style="font-size:1.8rem;color:var(--or);cursor:pointer;letter-spacing:3px">
        ${[1,2,3,4,5].map(n => `<span class="etoile-choix" onclick="setNoteAvis(${n})">☆</span>`).join('')}
      </div>
      <span id="avis-note-err" style="display:none;color:var(--terracotta);font-size:.88rem"></span>
      <label for="av-texte">Votre commentaire *</label>
      <textarea id="av-texte" maxlength="600" placeholder="Racontez votre expérience…"></textarea>
      <label for="av-email">Votre e-mail (facultatif)</label>
      <input id="av-email" type="email" placeholder="Pour vous répondre si besoin">
      <input type="checkbox" name="botcheck" id="av-botcheck" style="display:none" tabindex="-1" autocomplete="off">
      <button type="submit" class="btn btn-primaire" style="width:100%;margin-top:.9rem" ${actif ? '' : 'disabled'}>Envoyer mon avis</button>
      <p class="mini" style="color:#8a7355;margin-top:.6rem">En envoyant votre avis, vous acceptez qu'il soit transmis pour modération et publié sur le site.</p>
      <p id="avis-form-msg" style="display:none;margin-top:.8rem;text-align:center;font-weight:700"></p>
    </form>`;
  const f = document.getElementById('avis-form');
  if(f && actif) f.addEventListener('submit', envoyerAvis);
}

async function envoyerAvis(ev){
  ev.preventDefault();
  const nom = document.getElementById('av-nom').value.trim();
  const texte = document.getElementById('av-texte').value.trim();
  const email = document.getElementById('av-email').value.trim();
  const botcheck = document.getElementById('av-botcheck').checked;
  const msg = document.getElementById('avis-form-msg');
  const noteErr = document.getElementById('avis-note-err');
  if(nom.length < 2){ document.getElementById('av-nom').focus(); return; }
  if(!_noteAvisChoisie){ noteErr.textContent = 'Choisissez une note.'; noteErr.style.display = 'block'; return; }
  if(texte.length < 3){ document.getElementById('av-texte').focus(); return; }
  if(botcheck) return; // honeypot : bot détecté, on ignore silencieusement

  const bouton = ev.target.querySelector('button[type=submit]');
  bouton.disabled = true; bouton.textContent = 'Envoi…';
  try{
    const r = await fetch('https://api.web3forms.com/submit', {
      method:'POST',
      headers:{'Content-Type':'application/json', 'Accept':'application/json'},
      body: JSON.stringify({
        access_key: AVIS_FORM_KEY,
        subject: 'Nouvel avis — Saveurs du Mboa',
        from_name: nom,
        note: _noteAvisChoisie + '/5',
        message: texte,
        email_client: email || '(non fourni)'
      })
    });
    const data = await r.json();
    if(data.success){
      ev.target.reset(); _noteAvisChoisie = 0; setNoteAvis(0);
      msg.style.color = 'var(--vert, #1c5b2b)';
      msg.textContent = '🙏 Merci ! Votre avis sera publié après validation.';
      msg.style.display = 'block';
    } else { throw new Error('échec'); }
  } catch(e){
    msg.style.color = 'var(--terracotta)';
    msg.innerHTML = 'Désolé, l\\'envoi a échoué. Réessayez ou écrivez-nous sur WhatsApp.';
    msg.style.display = 'block';
  } finally {
    bouton.disabled = false; bouton.textContent = 'Envoyer mon avis';
  }
}
```

- [ ] **Step 2: Appeler `rendreFormAvis()` dans `majTextesConfig()`**

Après `rendreAvis();` ajouter `rendreFormAvis();`. (Les liens `.js-wa` du bloc démo sont recâblés par le code existant `.js-wa` puisque `majTextesConfig` traite `.js-wa` avant — si l'ordre pose problème, rappeler la boucle `.js-wa` après `rendreFormAvis()`.)

- [ ] **Step 3: Vérifier la syntaxe**

Run: `node --check` (méthode Task 2 Step 4). Expected: `OK`.

- [ ] **Step 4: Test mode démo**

`AVIS_FORM_KEY` étant vide, ouvrir `#/avis` : le formulaire est grisé, bouton désactivé, message « bientôt actif » avec lien WhatsApp. Vérifier qu'aucune erreur console n'apparaît.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "feat(avis): formulaire, envoi Web3Forms, honeypot, mode démo, consentement"
```

---

### Task 6: Aperçu des avis sur la page d'accueil

**Files:**
- Modify: `index.html` — bloc aperçu dans `#page-accueil` (après le teaser menu) + fonction `rendreApercuAvis()` appelée dans `majTextesConfig`.

**Interfaces:**
- Consumes: `avisValides()`, `moyenneAvis()`, `etoilesHtml()`, `carteAvisHtml()`.
- Produces: `rendreApercuAvis()`.

- [ ] **Step 1: Ajouter le conteneur dans l'accueil**

Repérer la fin de la section teaser/menu de `#page-accueil` (avant la section CTA finale de l'accueil). Insérer :

```html
  <section id="apercu-avis" class="container" style="display:none;text-align:center">
    <h2 class="section-titre">Ils ont <span class="accent">goûté</span></h2>
    <div id="apercu-avis-moyenne" style="margin-bottom:1rem"></div>
    <div id="apercu-avis-liste"></div>
    <a class="btn btn-terre" href="#/avis" style="margin-top:.5rem">Voir tous les avis</a>
  </section>
```

- [ ] **Step 2: Écrire `rendreApercuAvis()`**

```js
function rendreApercuAvis(){
  const sec = document.getElementById('apercu-avis');
  if(!sec) return;
  const v = avisValides();
  if(!v.length){ sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  document.getElementById('apercu-avis-moyenne').innerHTML =
    `<span class="avis-note-globale">${etoilesHtml(Math.round(moyenneAvis()))}</span>
     <div class="avis-note-chiffre">${moyenneAvis().toString().replace('.', ',')} / 5 · ${v.length} avis</div>`;
  document.getElementById('apercu-avis-liste').innerHTML = v.slice(0, 3).map(carteAvisHtml).join('');
}
```

- [ ] **Step 3: Appeler dans `majTextesConfig()`**

Après `rendreFormAvis();` ajouter `rendreApercuAvis();`.

- [ ] **Step 4: Vérifier**

`node --check`. État vide → section masquée (aucun avis). Test visuel avec un avis temporaire dans `config.js` local, puis remettre vide.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "feat(avis): aperçu (moyenne + 2-3 avis) sur la page d'accueil"
```

---

### Task 7: Éditeur d'avis dans l'admin + clé du formulaire

**Files:**
- Modify: `admin.html` — UI (section Avis dans la carte Réglages), lecture `chargerConfig`, `afficher()`, `lireFormulaire()`, générateur `config.js`, validations `publier()`.

**Interfaces:**
- Consumes: `AVIS`, `AVIS_FORM_KEY` depuis `config.js`, helper `s()` (ligne 294).
- Produces: dans le `config.js` généré : `const AVIS_FORM_KEY = "…";` et `const AVIS = [ … ];`.

- [ ] **Step 1: Ajouter l'UI**

Dans la carte « Réglages généraux », après le bloc Créneaux (avant la fermeture `</div>` de la carte), insérer :

```html
      <div style="margin-top:1.2rem;padding-top:1rem;border-top:1.5px dashed #e4d3b6">
        <label>Clé du formulaire d'avis (Web3Forms)</label>
        <input type="text" id="g-avis-key" placeholder="collez ici votre access key Web3Forms">
        <p style="font-size:.85rem;color:#8a7355;margin:.3rem 0 .8rem">Laissez vide pour garder le formulaire en mode démo.</p>
        <label>Avis publiés sur le site</label>
        <div id="zone-avis"></div>
        <button class="btn" type="button" onclick="ajouterAvis()" style="background:#eef7ee;color:#1c5b2b;margin-top:.6rem;font-size:.9rem;padding:.55rem 1.1rem">+ Ajouter un avis</button>
      </div>
```

- [ ] **Step 2: Lire depuis `config.js` (chargerConfig)**

Dans l'objet retourné par la `new Function(...)` de `chargerConfig`, ajouter après `CRENEAUX_LIVRAISON: …` :

```js
        AVIS_FORM_KEY: (typeof AVIS_FORM_KEY !== "undefined" ? AVIS_FORM_KEY : ""),
        AVIS: (typeof AVIS !== "undefined" ? AVIS : [])
```
(Attention aux virgules : ajouter une virgule à la fin de la ligne précédente.)

- [ ] **Step 3: Afficher + fonctions d'édition**

Dans `afficher()`, après la ligne des créneaux (`afficherCreneaux();`), ajouter :
```js
  document.getElementById("g-avis-key").value = etat.AVIS_FORM_KEY || "";
  afficherAvis();
```

Ajouter les fonctions (près de celles des créneaux) :
```js
function avisCourants(){ return Array.isArray(etat.AVIS) ? etat.AVIS : []; }
function afficherAvis(){
  const zone = document.getElementById("zone-avis");
  const av = avisCourants();
  zone.innerHTML = av.length === 0
    ? '<p style="font-size:.9rem;color:#8a7355;padding:.4rem 0">Aucun avis publié pour le moment.</p>'
    : av.map((a, i) => `
      <div class="avis-ligne" style="border-bottom:1.5px dashed #e4d3b6;padding:.8rem 0">
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <input type="text" id="av-nom-${i}" value="${(a.nom||'').replace(/"/g,'&quot;')}" placeholder="Nom" style="flex:1;min-width:8rem">
          <select id="av-note-${i}">${[1,2,3,4,5].map(n=>`<option value="${n}" ${a.note===n?'selected':''}>${n} ★</option>`).join('')}</select>
          <input type="text" id="av-date-${i}" value="${a.date||''}" placeholder="AAAA-MM" style="width:6.5rem">
          <button class="btn" type="button" onclick="supprimerAvis(${i})" style="background:#fdecea;color:#8f2013;padding:.4rem .7rem;font-size:.85rem">✕</button>
        </div>
        <textarea id="av-texte-${i}" placeholder="Commentaire" style="margin-top:.4rem">${(a.texte||'')}</textarea>
      </div>`).join("");
}
function lireAvis(){
  const arr = [];
  document.querySelectorAll("#zone-avis .avis-ligne").forEach((_, i) => {
    const nom = document.getElementById("av-nom-"+i).value.trim();
    const note = parseInt(document.getElementById("av-note-"+i).value, 10);
    const date = document.getElementById("av-date-"+i).value.trim();
    const texte = document.getElementById("av-texte-"+i).value.trim();
    arr.push({ nom, note, texte, date });
  });
  return arr;
}
function ajouterAvis(){
  etat.AVIS = lireAvis();
  const d = new Date();
  const mois = String(d.getMonth()+1).padStart(2,'0');
  etat.AVIS.unshift({ nom:"", note:5, texte:"", date:`${d.getFullYear()}-${mois}` });
  afficherAvis();
}
function supprimerAvis(i){
  etat.AVIS = lireAvis();
  etat.AVIS.splice(i, 1);
  afficherAvis();
}
```

- [ ] **Step 4: Enregistrer dans `lireFormulaire()`**

Au début de `lireFormulaire()` (à côté des créneaux) ajouter :
```js
  etat.AVIS_FORM_KEY = document.getElementById("g-avis-key").value.trim();
  etat.AVIS = lireAvis();
```

- [ ] **Step 5: Générer dans `config.js`**

Dans la fonction de génération, avant le `return \`…\``, calculer :
```js
  const avisKey = etat.AVIS_FORM_KEY || "";
  const avisArr = (Array.isArray(etat.AVIS) ? etat.AVIS : []).filter(a => a.nom && a.texte);
  const lignesAvis = avisArr.map(a =>
    `  { nom:${s(a.nom)}, note:${Number(a.note)||5}, texte:${s(a.texte)}, date:${s(a.date||"")} }`
  ).join(",\n");
```
Puis, dans le template, après le bloc créneaux et avant les zones, ajouter :
```js
const AVIS_FORM_KEY = ${s(avisKey)};
const AVIS = [
${lignesAvis}
];
```

- [ ] **Step 6: Valider dans `publier()`**

Après `lireFormulaire();` (et à côté des vérifs créneaux), ajouter :
```js
  const avisMauvais = (etat.AVIS || []).find(a => a.nom && a.texte && (!(a.note>=1 && a.note<=5) || (a.date && !/^\d{4}-\d{2}$/.test(a.date))));
  if(avisMauvais){
    err.className = "erreur";
    err.textContent = "❌ Un avis a une note ou une date invalide (note 1–5, date au format AAAA-MM).";
    err.style.display = "block"; btn.disabled = false;
    document.getElementById("zone-avis").scrollIntoView({behavior:"smooth", block:"center"});
    return;
  }
```

- [ ] **Step 7: Vérifier + commit**

Run:
```bash
start=121; end=$(awk 'NR>121 && /<\/script>/{print NR; exit}' admin.html)
sed -n "$((start+1)),$((end-1))p" admin.html > /tmp/adm.js && node --check /tmp/adm.js && echo OK
git add admin.html && git commit -m "feat(avis): éditeur d'avis + clé formulaire dans l'admin"
```
Expected: `OK`

---

### Task 8: Mention RGPD dans les mentions légales

**Files:**
- Modify: `index.html` — page `#page-legal` (~ligne 630+)

**Interfaces:** aucune (contenu statique).

- [ ] **Step 1: Ajouter le paragraphe**

Dans `#page-legal`, à la suite des sections existantes sur les données, ajouter :

```html
        <p style="margin:.4rem 0"><strong>Avis clients.</strong> Lorsque vous
          laissez un avis, votre nom, votre note et votre commentaire (et, si vous
          le fournissez, votre e-mail) sont transmis à notre prestataire d'envoi de
          formulaires <strong>Web3Forms</strong> puis publiés sur le site après
          modération. Vous pouvez demander la suppression de votre avis en nous
          écrivant sur WhatsApp.</p>
```

- [ ] **Step 2: Vérifier + commit + push**

Run: `node --check` (méthode Task 2). Puis :
```bash
git add index.html && git commit -m "docs(avis): mention RGPD Web3Forms dans les mentions légales" && git push
```
Attendre le build, vérifier en ligne que `#/avis` et l'aperçu se comportent correctement (liste vide → « Soyez le premier… », aperçu masqué, formulaire en mode démo).

---

## Self-Review

**Spec coverage :**
- Page dédiée + nav → Task 3 ✓
- Moyenne + liste + état vide → Task 4 ✓
- Formulaire + Web3Forms + honeypot + mode démo + consentement → Task 5 ✓
- Aperçu accueil (masqué si vide) → Task 6 ✓
- Admin (éditeur avis + clé + génération + validation) → Task 7 ✓
- RGPD légal → Task 8 ✓
- Données par défaut vides → Task 1 ✓
- Logique pure testée → Task 2 ✓

**Placeholders :** aucun `TODO`/`TBD` ; code complet à chaque étape.

**Cohérence des types :** `avisValides/moyenneAvis/etoilesHtml/carteAvisHtml/echapper/moisFr` définis en Task 2/4 et réutilisés en Task 4/6 avec les mêmes signatures. `AVIS`/`AVIS_FORM_KEY` produits en Task 1, lus partout. Générateur admin (Task 7) produit exactement les constantes attendues par `index.html`.

## Dépendance côté propriétaire

Web3Forms : créer une clé gratuite sur https://web3forms.com (saisir l'e-mail de réception → recevoir une *access key*), puis la coller dans l'admin (champ « Clé du formulaire d'avis ») et publier. Tant que la clé est vide, le formulaire reste en mode démo.
