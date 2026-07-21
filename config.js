/* Fichier généré par la page d'administration — 21/07/2026 00:32:04 */
const CONFIG_VERSION = 1784586724329;
const NUMERO_WHATSAPP = "32489765828";
const IBAN = "BE37 3632 7506 1728";
const TITULAIRE = "Bouquet Nanhou";
const ACOMPTE_POURCENT = 50;
const FRAIS_KM = 0.3;
const KM_GRATUITS = 5;

/* Zones de livraison — réglées une fois ici (l'admin les préserve, ne les édite pas).
   lat/lon = coordonnées de la cuisine, servent au calcul automatique des frais. */
const FACTEUR_ROUTE = 1.3;   // vol d'oiseau -> distance route estimée

const ZONES = [
  { id:"luxembourg", nom:"Province de Luxembourg", cuisine:"Caroline",
    adresse:"Martelwée 33, 6637 Fauvillers", lat:49.8626398, lon:5.7267954 },
  { id:"liege",      nom:"Province de Liège",      cuisine:"Viviane",
    adresse:"Chaussée Roosevelt 128, 4420 Saint-Nicolas", lat:50.6456901, lon:5.5230284 }
];

const MENU = [
  { id:"plat1", cat:"plat", nom:"Ndole Royal", prix:15.00, photo:"photos/ndole.jpg",
    desc:"Le plat national : feuilles de ndolè mijotées aux arachides, crevettes et viande. Un classique généreux et parfumé.", allergenes:"Arachides, Crustacés" },

  { id:"plat2", cat:"plat", nom:"Porc Braisé", prix:15.00, photo:"photos/porc.jpg",
    desc:"Morceaux de porc marinés aux épices maison puis braisés, fondants et savoureux, servis avec oignons rouges.", allergenes:"" },

  { id:"plat3", cat:"plat", nom:"Poisson braisé", prix:15.00, photo:"photos/maquereau.jpg",
    desc:"Vous avez le choix entre maquereau , bar , tilapia entier mariné aux épices vertes et braisé comme au pays, relevé juste ce qu'il faut.", allergenes:"Poisson" },

  { id:"accomp1", cat:"accomp", nom:"Bâtons de manioc", prix:5.00, photo:"photos/manioc.jpg",
    desc:"Bâtons de manioc traditionnels (bobolo), l'accompagnement parfait du poisson braisé.", allergenes:"" },

  { id:"accomp2", cat:"accomp", nom:"Banane vapeur", prix:5.00, photo:"photos/banane-vapeur.jpg",
    desc:"Plantains mûrs cuits à la vapeur, doux et moelleux, comme à la maison.", allergenes:"" },

  { id:"accomp3", cat:"accomp", nom:"Banane plantain frie", prix:5.00, photo:"photos/banane-plantain.jpg",
    desc:"Plantains mûrs frits et dorés, caramélisés à souhait. Irrésistibles.", allergenes:"" }
];
