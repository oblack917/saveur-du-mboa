/* Test jetable : analyserAvisColle() (admin.html) lit le texte d'un e-mail
   Web3Forms collé par les gérantes et en extrait { nom, note, texte, email }. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

// --- Extraire la fonction depuis admin.html ---
const admin = fs.readFileSync(path.join(__dirname, "../../../admin.html"), "utf8");
const debut = admin.indexOf("function analyserAvisColle(");
assert.ok(debut > -1, "analyserAvisColle introuvable dans admin.html");
const fin = admin.indexOf("\nfunction ", debut + 1);
const source = admin.slice(debut, fin);
eval(source);

// --- E-mail Web3Forms typique (avec en-têtes et pied de page autour) ---
const email = `New Submission from Saveurs du Mboa

nom: Marie L.
note: 4/5
avis: Un délice, le ndolé était parfait !
Je recommande vivement.
email_du_client: marie@exemple.be

---
Sent via Web3Forms`;
let a = analyserAvisColle(email);
assert.ok(a, "e-mail complet analysé");
assert.strictEqual(a.nom, "Marie L.");
assert.strictEqual(a.note, 4);
assert.strictEqual(a.texte, "Un délice, le ndolé était parfait !\nJe recommande vivement.");
assert.strictEqual(a.email, "marie@exemple.be");

// --- Variantes de libellés (majuscules, espaces, tirets) ---
a = analyserAvisColle("Nom : Paul\nNote : 5 / 5\nAvis : Très bon.\nE-mail du client : (non fourni)");
assert.ok(a, "variantes de libellés acceptées");
assert.strictEqual(a.nom, "Paul");
assert.strictEqual(a.note, 5);
assert.strictEqual(a.texte, "Très bon.");
assert.strictEqual(a.email, "", "« (non fourni) » devient vide");

// --- Note absente → 5 par défaut (la gérante vérifie dans le sélecteur) ---
a = analyserAvisColle("nom: Ana\navis: Super !");
assert.ok(a);
assert.strictEqual(a.note, 5, "note par défaut 5 si absente");

// --- Texte inutilisable → null (pas de nom ou pas de commentaire) ---
assert.strictEqual(analyserAvisColle("bonjour, ceci n'est pas un avis"), null);
assert.strictEqual(analyserAvisColle("nom: X"), null, "sans commentaire → null");
assert.strictEqual(analyserAvisColle(""), null);

// --- Le pied de page Web3Forms n'est pas avalé dans le commentaire ---
a = analyserAvisColle("nom: Zoé\nnote: 3/5\navis: Correct.\n\n---\nSent via Web3Forms\nUnsubscribe");
assert.strictEqual(a.texte, "Correct.", "pied de page exclu du commentaire");

console.log("OK");
