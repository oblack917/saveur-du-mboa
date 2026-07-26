/* Test : les horaires de commande survivent à une republication par l'admin.
   Piège n°1 de ce dépôt — toute constante que texteConfig() ne réécrit pas est
   effacée dès que les gérantes publient le menu de la semaine (comme ZONES,
   CRENEAUX_LIVRAISON, allergenes, EMAIL_CONTACT avant elle). */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const admin = fs.readFileSync(path.join(__dirname, "../../../admin.html"), "utf8");

function extraire(marqueurDebut, marqueurFin){
  const a = admin.indexOf(marqueurDebut);
  const b = admin.indexOf(marqueurFin, a);
  assert.ok(a > -1 && b > a, `bloc introuvable : ${marqueurDebut}`);
  return admin.slice(a, b);
}

const srcAffichage = extraire("const NOMS_JOURS", "function afficherCreneaux(){");
const srcTexteConfig = extraire("function texteConfig(){", "async function publier(");

let ok = 0;
function t(nom, fn){ fn(); ok++; console.log("  ✓ " + nom); }

/* Un faux DOM : chaque champ garde sa valeur, comme dans le navigateur. */
function faireDom(valeursInitiales){
  const champs = Object.assign({
    "g-whatsapp": "32489765828", "g-iban": "BE37 3632 7506 1728",
    "g-titulaire": "Bouquet Nanhou", "g-email": "saveursdumboa237@gmail.com",
    "g-acompte": "50", "g-frais": "0.30", "g-km": "5",
  }, valeursInitiales || {});
  const noeuds = {};
  return {
    champs,
    document: { getElementById: id => (noeuds[id] = noeuds[id] || { value: champs[id] !== undefined ? champs[id] : "", innerHTML: "" }) }
  };
}

function relire(texte){
  return new Function(texte + `
    ; return { OUVERTURE_JOUR, OUVERTURE_HEURE, FERMETURE_JOUR, FERMETURE_HEURE };`)();
}

const MENU_MINIMAL = [{ id:"p1", cat:"plat", nom:"Ndolé", desc:"d", prix:15, photo:"photos/p1.jpg", allergenes:"" }];
const ETAT_BASE = {
  MENU: MENU_MINIMAL, LIVRAISON_FIN_MAX: 18,
  CRENEAUX_LIVRAISON: [{ debut:10, fin:13 }], FACTEUR_ROUTE: 1.3,
  ZONES: [{ id:"z", nom:"Zone", cuisine:"C", adresse:"A", lat:1, lon:2 }],
  AVIS_FORM_KEY: "", AVIS: [],
};

/* Simule le cycle complet : config.js chargé → formulaire rempli → publication. */
function cycle(horairesEnConfig, saisieUtilisateur){
  const dom = faireDom(saisieUtilisateur);
  global.document = dom.document;
  global.etat = Object.assign({}, ETAT_BASE, horairesEnConfig);
  eval(srcAffichage);
  if(!saisieUtilisateur) afficherHoraires();      // l'admin remplit le formulaire depuis config.js
  eval(srcTexteConfig);
  return relire(texteConfig());
}

console.log("\n--- Aller-retour config.js → admin → config.js ---");

t("les horaires réels sont écrits dans config.js", () => {
  assert.deepStrictEqual(
    cycle({ OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 }),
    { OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 }
  );
});

t("des horaires personnalisés ne sont PAS écrasés par une publication", () => {
  assert.deepStrictEqual(
    cycle({ OUVERTURE_JOUR:2, OUVERTURE_HEURE:9, FERMETURE_JOUR:6, FERMETURE_HEURE:23 }),
    { OUVERTURE_JOUR:2, OUVERTURE_HEURE:9, FERMETURE_JOUR:6, FERMETURE_HEURE:23 }
  );
});

t("un config.js d'avant cette fonctionnalité prend les valeurs par défaut", () => {
  assert.deepStrictEqual(
    cycle({}),   // aucune constante d'horaire dans l'ancien config.js
    { OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 }
  );
});

console.log("\n--- Saisie de la gérante ---");

t("une modification dans le formulaire est bien publiée", () => {
  assert.deepStrictEqual(
    cycle({ OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 },
          { "g-ouv-jour":"6", "g-ouv-heure":"20", "g-ferm-jour":"4", "g-ferm-heure":"10" }),
    { OUVERTURE_JOUR:6, OUVERTURE_HEURE:20, FERMETURE_JOUR:4, FERMETURE_HEURE:10 }
  );
});

t("un champ vidé par erreur retombe sur la valeur par défaut", () => {
  assert.deepStrictEqual(
    cycle({}, { "g-ouv-jour":"", "g-ouv-heure":"", "g-ferm-jour":"", "g-ferm-heure":"" }),
    { OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 }
  );
});

t("une heure hors bornes ne part jamais en ligne", () => {
  assert.deepStrictEqual(
    cycle({}, { "g-ouv-jour":"12", "g-ouv-heure":"31", "g-ferm-jour":"-3", "g-ferm-heure":"abc" }),
    { OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 }
  );
});

console.log("\n--- Non-régression : le reste de config.js est intact ---");

t("menu, zones, créneaux et e-mail survivent aussi", () => {
  global.document = faireDom().document;
  global.etat = Object.assign({}, ETAT_BASE, { OUVERTURE_JOUR:0, OUVERTURE_HEURE:18, FERMETURE_JOUR:5, FERMETURE_HEURE:12 });
  eval(srcAffichage); afficherHoraires();
  eval(srcTexteConfig);
  const relu = new Function(texteConfig() + `
    ; return { MENU, ZONES, CRENEAUX_LIVRAISON, EMAIL_CONTACT, IBAN };`)();
  assert.strictEqual(relu.MENU.length, 1);
  assert.strictEqual(relu.ZONES.length, 1);
  assert.strictEqual(relu.CRENEAUX_LIVRAISON.length, 1);
  assert.strictEqual(relu.EMAIL_CONTACT, "saveursdumboa237@gmail.com");
  assert.strictEqual(relu.IBAN, "BE37 3632 7506 1728");
});

console.log(`\n✅ ${ok}/${ok} tests passés\n`);
