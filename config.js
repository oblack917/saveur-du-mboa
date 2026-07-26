/* Fichier généré par la page d'administration — 26/07/2026 20:39:24 */
const CONFIG_VERSION = 1785091164495;
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
  { id:"plat1", cat:"plat", nom:"Eru", prix:12.00, photo:"photos/ndole.jpg",
    desc:"Un incontournable de la cuisine camerounaise, préparé avec des feuilles d’eru, des épinards, de la viande de bœuf, du poisson fumé et la peau de bœuf ,  mijotés dans une huile de palme savoureuse. Servi avec votre choix de placali ou de tapioca pour une expérience authentique.", allergenes:"Poisson , Crustacés" },

  { id:"plat2", cat:"plat", nom:"Beignet haricots (BH)", prix:15.00, photo:"photos/porc.jpg",
    desc:"Le célèbre petit-déjeuner camerounais composé de beignets moelleux et dorés, accompagnés de haricots mijotés dans une sauce savoureuse aux épices. Un plat généreux, réconfortant et riche en saveurs, idéal à tout moment de la journée.", allergenes:"Gluten" },

  { id:"plat3", cat:"plat", nom:"Poulet DG", prix:15.00, photo:"photos/maquereau.jpg",
    desc:"Un plat emblématique du Cameroun, préparé avec du poulet mijoté, des bananes plantains frites, des légumes colorés et des épices savamment dosées. Une recette généreuse et savoureuse qui célèbre toute la richesse de la cuisine camerounaise.", allergenes:"" },

  { id:"accomp3", cat:"accomp", nom:"Banane plantain frie", prix:5.00, photo:"photos/banane-plantain.jpg",
    desc:"Plantains mûrs frits et dorés, caramélisés à souhait. Irrésistibles.", allergenes:"" },

  { id:"p1784973822456", cat:"accomp", nom:"Beignet farine", prix:5.00, photo:"photos/p1784973822456.jpg",
    desc:"Beignets moelleux et dorés, préparés à base de farine pour une pause gourmande", allergenes:"Gluten" },

  { id:"p1784975651202", cat:"accomp", nom:"Tapioca", prix:3.00, photo:"photos/p1784975651202.jpg",
    desc:"Une pâte légère et douce à base de manioc, idéale pour accompagner le Eru et en révéler toutes les saveurs.", allergenes:"" },

  { id:"p1784975941281", cat:"accomp", nom:"Placali", prix:3.00, photo:"photos/p1784975941281.jpg",
    desc:"Une pâte à base de manioc fermenté, proche du watafufu, parfaite pour accompagner le Eru et savourer pleinement sa sauce.", allergenes:"" }
];
