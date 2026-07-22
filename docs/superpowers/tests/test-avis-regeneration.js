/* Test jetable : la régénération de config.js par l'admin (texteConfig)
   préserve AVIS et AVIS_FORM_KEY (piège n°1 : toute constante non gérée
   par le générateur est écrasée à la publication). */
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
  AVIS_FORM_KEY: "cle-web3forms-test",
  AVIS: [
    { nom: 'Marie "L."', note: 5, texte: "Un délice !", date: "2026-07" },
    { nom: "", note: 4, texte: "sans nom → filtré", date: "2026-07" },
    { nom: "Paul", note: 3, texte: "", date: "2026-07" }, // sans texte → filtré
  ],
};
eval(source);

// --- Générer puis relire le config produit ---
const genere = texteConfig();
const lire = new Function(genere + "; return { AVIS, AVIS_FORM_KEY, MENU, ZONES, CRENEAUX_LIVRAISON };");
const relu = lire();

assert.strictEqual(relu.AVIS_FORM_KEY, "cle-web3forms-test", "clé Web3Forms préservée");
assert.strictEqual(relu.AVIS.length, 1, "seuls les avis complets (nom + texte) sont publiés");
assert.strictEqual(relu.AVIS[0].nom, 'Marie "L."', "guillemets du nom bien échappés");
assert.strictEqual(relu.AVIS[0].note, 5);
assert.strictEqual(relu.AVIS[0].date, "2026-07");
assert.strictEqual(relu.ZONES.length, 1, "ZONES toujours préservées");
assert.strictEqual(relu.CRENEAUX_LIVRAISON.length, 1, "créneaux toujours préservés");

// --- Cas départ : aucun avis, pas de clé ---
etat.AVIS = []; etat.AVIS_FORM_KEY = "";
const relu2 = new Function(texteConfig() + "; return { AVIS, AVIS_FORM_KEY };")();
assert.deepStrictEqual(relu2.AVIS, [], "AVIS vide régénéré vide");
assert.strictEqual(relu2.AVIS_FORM_KEY, "", "clé vide régénérée vide");

console.log("OK");
