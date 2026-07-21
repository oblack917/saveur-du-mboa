# Design — Avis clients (Saveurs du Mboa)

Date : 2026-07-21
Statut : validé (design), à implémenter

## Objectif

Permettre aux clients de laisser des **avis (note en étoiles + commentaire)**,
affichés sur le site après **modération** par la propriétaire, **sans compte
client** et **sans serveur** (le site reste 100 % statique sur GitHub Pages).

## Contexte technique

- Site statique (GitHub Pages), aucune base de données, aucun serveur.
- Aucune CSP restrictive dans les pages → un `POST` vers un service externe est possible.
- Les commandes partent déjà par WhatsApp ; `config.js` est **généré par `admin.html`**
  (qui écrit dans le dépôt via l'API GitHub). Les avis suivront le même modèle :
  stockés dans `config.js`, édités depuis l'admin.
- Pages gérées par un routeur par hash : `const PAGES = [...]` + `<div class="page" id="page-X">`.

## Décisions validées

| Sujet | Choix |
|---|---|
| Comptes | **Aucun compte** — avis modérés |
| Envoi de l'avis | **Formulaire sur le site + service gratuit externe** (réception par e-mail) |
| Format | **Note en étoiles (1–5) + commentaire** |
| Affichage | **Page dédiée « Avis »** + **aperçu sur la page d'accueil** |

## Architecture (flux complet)

1. **Soumission (client)** — Page « Avis » → formulaire (nom, note 1–5, commentaire,
   e-mail *optionnel*). Envoi en AJAX (`fetch` `POST`) vers le service externe.
   Après envoi : message « Merci ! Votre avis sera publié après validation. »
   L'avis **n'apparaît pas** immédiatement (modération = anti-spam / anti-faux avis).

2. **Réception (propriétaire)** — Le service externe envoie l'avis **par e-mail**.

3. **Modération + publication (propriétaire)** — Dans `admin.html`, nouvelle section
   « Avis » : ajout/édition/suppression d'avis (nom, note, texte, date). « Publier »
   écrit le tableau `AVIS` dans `config.js`.

4. **Affichage (site)** — Les avis validés viennent de `config.js` :
   - Page « Avis » : note moyenne (⭐ x,x/5) + nombre d'avis + liste complète + formulaire.
   - Accueil : bloc « Ils ont goûté » = note moyenne + 2–3 avis récents + bouton « Voir tous les avis ».

## Service externe

- **Recommandé : Web3Forms** (gratuit, pas de tableau de bord à gérer : une simple
  **clé d'accès** liée à l'e-mail de la propriétaire suffit ; l'avis arrive dans la
  boîte mail). Alternative équivalente : Formspree.
- La clé est un réglage : `AVIS_FORM_KEY` dans `config.js` (éditable depuis l'admin).
- **Dépendance côté propriétaire** : elle doit créer le compte/obtenir la clé (guidage fourni).
  Tant que `AVIS_FORM_KEY` est vide, le formulaire s'affiche en **mode démo** (désactivé,
  avec un message clair), le reste de la page fonctionne normalement.
- Anti-spam : champ **honeypot** caché dans le formulaire (rejet des bots).

## Modèle de données (`config.js`, géré par l'admin)

```js
const AVIS_FORM_KEY = "";           // clé du service d'envoi (vide = mode démo)
const AVIS = [];                    // DÉMARRAGE : liste vide (aucun avis d'exemple)
// Structure d'un avis (ajouté via l'admin) :
//   { nom: "Marie L.", note: 5, texte: "…", date: "2026-07" }
```

**Démarrage : `AVIS` est vide.** La page « Avis » affiche alors « Soyez le premier à
laisser un avis » et l'aperçu d'accueil ne s'affiche pas tant qu'il n'y a aucun avis.
Service d'envoi retenu : **Web3Forms**. E-mail du client : **optionnel**.

- `note` : entier 1–5. `date` : format « AAAA-MM » (affiché « juillet 2026 »).
- La **note moyenne** est calculée à partir de `AVIS` (aucune donnée dupliquée).

## Composants & fichiers touchés

- **`config.js`** — nouvelles constantes `AVIS_FORM_KEY` et `AVIS` (défauts : clé vide, quelques avis d'exemple).
- **`index.html`**
  - Nav : ajout du lien « Avis ». Routeur : ajout de `"avis"` dans `PAGES`.
  - Nouvelle page `#page-avis` : moyenne + liste + formulaire.
  - Bloc aperçu sur `#page-accueil`.
  - JS : rendu des avis depuis `AVIS`, calcul de la moyenne, rendu des étoiles,
    soumission du formulaire (fetch → service), gestion succès/erreur/mode démo, honeypot.
  - Page « Mentions légales » : mention du service externe (sous-traitant) + finalité.
- **`admin.html`**
  - Section « Avis » : liste éditable (nom / note / texte / date) + ajout/suppression.
  - Champ « Clé du formulaire d'avis » (`AVIS_FORM_KEY`).
  - Lecture depuis `config.js`, écriture dans le `config.js` généré, validations
    (note entre 1 et 5, nom et texte non vides).

## RGPD

- Données transmises : **nom + commentaire** (+ e-mail si le client le fournit).
- Consentement : mention explicite sous le bouton d'envoi (« En envoyant votre avis, vous acceptez qu'il soit transmis pour modération et publié sur le site »). Pas de case à cocher (friction inutile ; l'action d'envoyer vaut consentement éclairé).
- Minimisation : e-mail **optionnel** ; aucune donnée sensible.
- Mise à jour de la page « Mentions légales » (service tiers, finalité = publication d'avis modérés).

## Gestion des erreurs / cas limites

- `AVIS` vide → la page affiche « Soyez le premier à laisser un avis » (pas de moyenne).
- `AVIS_FORM_KEY` vide → formulaire en **mode démo** (bouton désactivé + message).
- Échec réseau à l'envoi → message d'erreur + invitation à réessayer (ou à passer par WhatsApp).
- Garde-fous d'affichage : on ignore tout avis mal formé (note hors 1–5, champs manquants).

## Tests prévus

- Calcul de la moyenne (0, 1, plusieurs avis ; arrondi à une décimale).
- Rendu des étoiles pour notes 1 à 5.
- Filtrage des avis invalides.
- Comportement mode démo (clé vide) vs actif.
- Validation admin (note 1–5, champs requis) et génération correcte de `config.js`.
- Syntaxe JS de `config.js`, `index.html`, `admin.html` (node --check).

## Hors périmètre (YAGNI)

- Pas de comptes clients / connexion.
- Pas de réponses publiques aux avis.
- Pas de photos dans les avis.
- Pas de pagination (liste simple ; suffisant au volume attendu).
