/* Test jetable : la régénération de config.js par l'admin (texteConfig)
   préserve VIDEOS (piège n°1 : toute constante non gérée par le
   générateur est écrasée à la publication). */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

// --- Extraire la fonction texteConfig() du script d'admin.html ---
const admin = fs.readFileSync(path.join(__dirname, "../../../admin.html"), "utf8");
const debut = admin.indexOf("function texteConfig(){");
const fin = admin.indexOf("async function publier(", debut);
assert.ok(debut > -1 && fin > debut, "texteConfig introuvable dans admin.html");
const source = admin.slice(debut, fin);

// --- Simuler le strict nécessaire (DOM + état) ---
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

// --- Générer puis relire le config produit ---
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

// --- Cas départ : aucune vidéo ---
etat.VIDEOS = [];
const relu2 = new Function(texteConfig() + "; return { VIDEOS };")();
assert.deepStrictEqual(relu2.VIDEOS, [], "VIDEOS vide régénéré vide");

// --- Cas robustesse : VIDEOS absent de l'état (ancien config chargé) ---
delete etat.VIDEOS;
const relu3 = new Function(texteConfig() + "; return { VIDEOS };")();
assert.deepStrictEqual(relu3.VIDEOS, [], "VIDEOS absent → bloc vide, pas d'erreur");

console.log("OK");
