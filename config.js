/* Fichier généré par la page d'administration — 07/08/2026 22:59:56 */
const CONFIG_VERSION = 1786136396764;
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
  { id:"plat1", cat:"plat", nom:"Poisson braisé", prix:15.00, photo:"photos/ndole.jpg",
    desc:"Choisissez votre poisson : maquereau, bar ou tilapia, mariné aux épices camerounaises puis braisé au feu pour une saveur fumée et authentique.", allergenes:"Poisson ," },

  { id:"plat2", cat:"plat", nom:"Beignet haricots (BH)", prix:15.00, photo:"photos/porc.jpg",
    desc:"Le célèbre petit-déjeuner camerounais composé de beignets moelleux et dorés, accompagnés de haricots mijotés dans une sauce savoureuse aux épices. Un plat généreux, réconfortant et riche en saveurs, idéal à tout moment de la journée.", allergenes:"Gluten" },

  { id:"plat3", cat:"plat", nom:"Poulet DG", prix:15.00, photo:"photos/maquereau.jpg",
    desc:"Un plat emblématique du Cameroun, préparé avec du poulet mijoté, des bananes plantains frites, des légumes colorés et des épices savamment dosées. Une recette généreuse et savoureuse qui célèbre toute la richesse de la cuisine camerounaise.", allergenes:"aucun" },

  { id:"accomp3", cat:"accomp", nom:"Banane plantain frie", prix:5.00, photo:"photos/banane-plantain.jpg",
    desc:"Plantains mûrs frits et dorés, caramélisés à souhait. Irrésistibles.", allergenes:"aucun" },

  { id:"p1784973822456", cat:"accomp", nom:"Beignet farine", prix:5.00, photo:"photos/p1784973822456.jpg",
    desc:"Beignets moelleux et dorés, préparés à base de farine pour une pause gourmande", allergenes:"Gluten" },

  { id:"p1784975651202", cat:"accomp", nom:"Beignet maïs ( banane )", prix:3.00, photo:"photos/p1784975651202.jpg",
    desc:"De délicieux beignets de maïs, moelleux à l’intérieur et légèrement croustillants à l’extérieur, parfaits en accompagnement ou à partager.", allergenes:"aucun" },

  { id:"p1786135630264", cat:"plat", nom:"Porc grillé", prix:15.00, photo:"photos/p1786135630264.jpg",
    desc:"Morceaux de porc marinés aux épices, grillés à la perfection pour une viande tendre, savoureuse et légèrement fumée.", allergenes:"" },

  { id:"p1786135784016", cat:"plat", nom:"Sauce d’arachide + riz", prix:15.00, photo:"photos/p1786135784016.jpg",
    desc:"Un riz accompagné d’une onctueuse sauce d’arachide, mijotée avec des épices et une viande tendre pour un plat généreux et riche en saveurs.", allergenes:"Arachide" }
];
