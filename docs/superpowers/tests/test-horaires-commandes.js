/* Test : ouverture/fermeture des commandes (index.html).
   Règle demandée par la cliente le 26/07/2026 : ouverture dimanche 18h,
   fermeture vendredi 12h. La période ouverte enjambe donc la fin de semaine,
   c'est le cas qui casse une comparaison naïve jour par jour. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

// --- Extraire la logique d'horaires de index.html ---
const html = fs.readFileSync(path.join(__dirname, "../../../index.html"), "utf8");
const debut = html.indexOf("const HORAIRES_DEFAUT");
const fin = html.indexOf("function majCompteur(){", debut);
assert.ok(debut > -1 && fin > debut, "bloc horaires introuvable dans index.html");
const source = html.slice(debut, fin);

let ok = 0;
function t(nom, fn){ fn(); ok++; console.log("  ✓ " + nom); }

function charger(config){
  ["OUVERTURE_JOUR","OUVERTURE_HEURE","FERMETURE_JOUR","FERMETURE_HEURE"]
    .forEach(c => { delete global[c]; });
  Object.entries(config || {}).forEach(([k, v]) => { global[k] = v; });
  const scope = {};
  new Function("scope", source + `
    ; scope.commandesOuvertes = commandesOuvertes;
      scope.libelleOuverture = libelleOuverture;
      scope.libelleFermeture = libelleFermeture;
      scope.prochainMoment = prochainMoment;
      scope.horaires = horaires;`)(scope);
  return scope;
}

// Dimanche 26 juillet 2026 — la semaine de référence du test.
const DIM = 26, LUN = 27, VEN = 31, SAM = 25;
const d = (jour, h, m = 0) => new Date(2026, 6, jour, h, m);

console.log("\n--- Réglage réel : ouverture dimanche 18h, fermeture vendredi 12h ---");
{
  const s = charger({ OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 });

  t("dimanche 17h59 → fermé", () => assert.strictEqual(s.commandesOuvertes(d(DIM,17,59)), false));
  t("dimanche 18h00 → ouvert (réouverture pile à l'heure)", () => assert.strictEqual(s.commandesOuvertes(d(DIM,18,0)), true));
  t("dimanche 23h59 → ouvert", () => assert.strictEqual(s.commandesOuvertes(d(DIM,23,59)), true));
  t("lundi 10h → ouvert", () => assert.strictEqual(s.commandesOuvertes(d(LUN,10)), true));
  t("vendredi 11h59 → ouvert", () => assert.strictEqual(s.commandesOuvertes(d(VEN,11,59)), true));
  t("vendredi 12h00 → fermé (fermeture pile à l'heure)", () => assert.strictEqual(s.commandesOuvertes(d(VEN,12,0)), false));
  t("vendredi 18h → fermé", () => assert.strictEqual(s.commandesOuvertes(d(VEN,18)), false));
  t("samedi 14h → fermé (tout le samedi)", () => assert.strictEqual(s.commandesOuvertes(d(SAM,14)), false));

  t("libellés affichés", () => {
    assert.strictEqual(s.libelleOuverture(), "dimanche 18h");
    assert.strictEqual(s.libelleFermeture(), "vendredi 12h");
  });

  t("prochaine fermeture depuis lundi = le vendredi suivant", () => {
    const p = s.prochainMoment(5, 12, d(LUN,10));
    assert.strictEqual(p.getDay(), 5);
    assert.strictEqual(p.getDate(), VEN);
    assert.strictEqual(p.getHours(), 12);
  });

  t("prochaine fermeture depuis vendredi 13h = vendredi de la semaine d'après", () => {
    const p = s.prochainMoment(5, 12, d(VEN,13));  // 31 juillet -> 7 août, changement de mois
    assert.strictEqual(p.getDay(), 5);
    assert.strictEqual(p.getMonth(), 7);
    assert.strictEqual(p.getDate(), 7);
  });
}

console.log("\n--- Réglage inversé : la période ouverte n'enjambe pas la fin de semaine ---");
{
  // Ouverture lundi 8h, fermeture dimanche 20h : l'autre branche du calcul.
  const s = charger({ OUVERTURE_JOUR:1, OUVERTURE_HEURE:8, FERMETURE_JOUR:0, FERMETURE_HEURE:20 });
  t("lundi 9h → ouvert", () => assert.strictEqual(s.commandesOuvertes(d(LUN,9)), true));
  t("dimanche 10h → ouvert", () => assert.strictEqual(s.commandesOuvertes(d(DIM,10)), true));
  t("dimanche 21h → fermé", () => assert.strictEqual(s.commandesOuvertes(d(DIM,21)), false));
  t("lundi 7h → fermé", () => assert.strictEqual(s.commandesOuvertes(d(LUN,7)), false));
}

console.log("\n--- Garde-fous : config absente ou aberrante ---");
{
  const s = charger(null); // aucune constante définie
  t("config absente → repli dimanche 18h / vendredi 12h", () => {
    assert.deepStrictEqual(s.horaires(), { ouvJour:0, ouvHeure:18, fermJour:5, fermHeure:12 });
  });
}
{
  const s = charger({ OUVERTURE_JOUR:9, OUVERTURE_HEURE:99, FERMETURE_JOUR:-1, FERMETURE_HEURE:"midi" });
  t("valeurs hors bornes → repli sur les valeurs par défaut", () => {
    assert.deepStrictEqual(s.horaires(), { ouvJour:0, ouvHeure:18, fermJour:5, fermHeure:12 });
  });
}
{
  const s = charger({ OUVERTURE_JOUR:5, OUVERTURE_HEURE:12, FERMETURE_JOUR:5, FERMETURE_HEURE:12 });
  t("ouverture = fermeture → on n'empêche jamais de commander", () => {
    assert.strictEqual(s.commandesOuvertes(d(LUN,10)), true);
    assert.strictEqual(s.commandesOuvertes(d(SAM,3)), true);
  });
}

console.log(`\n✅ ${ok}/${ok} tests passés\n`);
