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
