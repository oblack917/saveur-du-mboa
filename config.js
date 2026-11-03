/* Fichier généré par la page d'administration — 31/10/2026 20:32:51 */
const CONFIG_VERSION = 1793475171902;
const NUMERO_WHATSAPP = "32489765828";
const IBAN = "BE37 3632 7506 1728";
const TITULAIRE = "Bouquet Nanhou";
const EMAIL_CONTACT = "saveursdumboa237@gmail.com";
const ACOMPTE_POURCENT = 50;
const FRAIS_KM = 0.3;
const KM_GRATUITS = 5;

/* Horaires des commandes — réglés depuis la page d'administration.
   Les commandes ouvrent le OUVERTURE_JOUR à OUVERTURE_HEURE et ferment le
   FERMETURE_JOUR à FERMETURE_HEURE. Jours : 0 = dimanche, 1 = lundi … 6 = samedi. */
const OUVERTURE_JOUR = 0;
const OUVERTURE_HEURE = 18;
const FERMETURE_JOUR = 5;
const FERMETURE_HEURE = 12;

/* Créneaux de livraison — réglés depuis la page d'administration.
   Aucun créneau ne peut se terminer après LIVRAISON_FIN_MAX (la dernière heure de livraison). */
const LIVRAISON_FIN_MAX = 18;
const CRENEAUX_LIVRAISON = [
  { debut:10, fin:13 },
  { debut:14, fin:18 }
];

/* Avis clients — gérés depuis la page d'administration.
   AVIS_FORM_KEY = clé Web3Forms du formulaire d'avis (vide = formulaire en mode démo).
   AVIS = avis validés affichés sur le site : { nom, note (1-5), texte, date "AAAA-MM" }. */
const AVIS_FORM_KEY = "76da7f6a-3471-44dd-b347-a0ab5b179fff";
const AVIS = [

];

/* Zones de livraison — réglées une fois dans le code (préservées à chaque publication). */
const FACTEUR_ROUTE = 1.3;

const ZONES = [
  { id:"luxembourg", nom:"Province de Luxembourg", cuisine:"Caroline",
    adresse:"Martelwée 33, 6637 Fauvillers", lat:49.8626398, lon:5.7267954 },
  { id:"liege", nom:"Province de Liège", cuisine:"Viviane",
    adresse:"Chaussée Roosevelt 128, 4420 Saint-Nicolas", lat:50.6456901, lon:5.5230284 }
];

const MENU = [
  { id:"plat1", cat:"plat", nom:"Koki", prix:15.00, photo:"photos/koki.jpg", webp:true,
    desc:"Une délicieuse spécialité à base de haricots, cuite à la vapeur dans des feuilles. Fondant, savoureux et authentique, un vrai goût du Mboa !", allergenes:"" },

  { id:"plat2", cat:"plat", nom:"Okok sucré", prix:15.00, photo:"photos/okok-sucre.jpg", webp:true,
    desc:"Une savoureuse spécialité camerounaise à base de feuilles d’okok, préparée avec du sucre et sublimée par une texture fondante. Un vrai délice.", allergenes:"Arachide" },

  { id:"plat3", cat:"plat", nom:"Ndolé royal", prix:15.00, photo:"photos/ndole-royal.jpg", webp:true,
    desc:"Un incontournable de la gastronomie camerounaise, préparé à base de feuilles de ndolé, accompagné de viande, de crevettes et d’arachides. Un plat généreux, riche en saveurs et digne d’un festin royal.", allergenes:"Arachides, crustacés" },

  { id:"accomp3", cat:"accomp", nom:"Manioc vapeur", prix:5.00, photo:"photos/manioc-vapeur.jpg", webp:true,
    desc:"", allergenes:"aucun" },

  { id:"p1793474815949", cat:"accomp", nom:"Bâton de manioc", prix:5.00, photo:"photos/baton-de-manioc.jpg", webp:true,
    desc:"", allergenes:"" },

  { id:"p1793474869638", cat:"accomp", nom:"Banane vapeur", prix:5.00, photo:"photos/banane-vapeur.jpg", webp:true,
    desc:"", allergenes:"" }
];
