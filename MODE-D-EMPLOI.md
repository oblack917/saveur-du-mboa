# 📖 Mode d'emploi — Site Saveurs du Mboa

## Pour Caroline & Viviane : changer le menu chaque semaine 🍽️

**Vous n'avez besoin d'aucune connaissance en informatique.** Tout se fait
depuis une page du site, sur votre téléphone :

1. Ouvrez la page : **https://oblack917.github.io/saveur-du-mboa/admin.html**
   💡 Ajoutez-la à l'écran d'accueil de votre téléphone pour la retrouver facilement
2. La première fois : entrez le **code d'accès** que Yann vous a remis,
   cochez "Se souvenir de moi" → vous ne le retaperez plus jamais
3. Sur le tableau de bord vous composez le menu de la semaine :
   - ➕ **Ajouter un plat** ou un accompagnement (bouton en bas de chaque section)
   - 🗑 **Supprimer** les plats de la semaine passée
   - 📷 **Changer ou ajouter la photo** (depuis votre galerie ou l'appareil photo)
   - ✏️ Modifier le **nom**, la **description** et le **prix**
4. Appuyez sur **📤 Publier les changements** en bas
5. C'est tout ! Le site est à jour en 1 à 2 minutes ✅

La bannière qui défile en haut du site se met à jour automatiquement avec
les nouveaux noms de plats. Les photos sont automatiquement recadrées et
compressées — envoyez-les telles quelles.

Vous pouvez aussi modifier dans "Réglages généraux" : le numéro WhatsApp,
l'IBAN de l'acompte, le pourcentage d'acompte et les conditions de livraison.

## 🗺️ Les commandes et la localisation
Chaque commande arrive sur WhatsApp avec un lien **"🗺️ Localisation"** :
appuyez dessus → l'adresse du client s'ouvre dans Google Maps → lancez
l'itinéraire pour la livraison.

## 🚚 Les deux zones et les frais de livraison

Le client choisit lui-même sa zone :

- **Province de Luxembourg** → cuisine de **Caroline** (Martelwée 33, Fauvillers)
- **Province de Liège** → cuisine de **Viviane** (Chaussée Roosevelt 128, Saint-Nicolas)

Il peut aussi choisir **"Venir chercher"** : dans ce cas, pas de frais, et
l'adresse de la cuisine s'affiche.

Les frais sont **calculés automatiquement** d'après son adresse : gratuit
jusqu'à 5 km de la cuisine de sa zone, puis 0,30 € par kilomètre. Ces deux
valeurs se modifient dans "Réglages généraux" de la page admin.

⚠️ **C'est une estimation, pas une facture.** La distance est calculée à vol
d'oiseau puis majorée. Le message WhatsApp vous indique toujours d'où vient
le chiffre :

| Ce que vous lisez dans le message | Ce que ça veut dire |
|---|---|
| `Livraison estimée : 2,10 € (~12 km, à confirmer)` | adresse exacte trouvée, estimation fiable |
| `… (~12 km, numéro non répertorié, à confirmer)` | la rue a été trouvée, pas le numéro |
| `… (~12 km, estimée depuis la commune, à confirmer)` | seule la commune a été trouvée — **vérifiez** |
| `Frais de livraison : à confirmer` | rien n'a été trouvé, **annoncez le prix vous-mêmes** |

Confirmez toujours le montant au client dans votre réponse WhatsApp.

## ⚠️ Une commande n'existe que si le message WhatsApp arrive

Le site **n'enregistre rien** : il prépare le message et le client doit
appuyer sur **envoyer** dans WhatsApp. L'écran de fin le lui dit clairement
et lui propose un bouton pour rouvrir WhatsApp s'il a fermé trop vite.

👉 Si un client vous dit avoir commandé sans que vous ayez rien reçu, ce
n'est pas une panne : son message n'est pas parti. Demandez-lui de vous
donner sa **référence (MB-XXXX)** et de renvoyer le message.

## ✅ Répondez à chaque commande reçue (très important)

Le site promet au client : *« Dès réception, nous vous répondons sur
WhatsApp pour confirmer votre commande. »* C'est **votre réponse qui
rassure le client** — sans elle, il ne sait pas si sa commande existe.

Dès qu'une commande arrive, renvoyez ce message (copiez-collez et adaptez) :

> Bonjour 😊 Votre commande **MB-XXXX** est bien reçue ✅
> Elle sera confirmée dès réception de l'acompte de XX € sur le compte
> BEXX XXXX XXXX XXXX. À très vite !
> — Saveurs du Mboa

Et quand l'acompte est arrivé :

> C'est noté, acompte bien reçu 🙏 Votre commande **MB-XXXX** est
> confirmée pour [samedi/dimanche] dans le créneau [10h–13h].
> Bon appétit d'avance ! — Saveurs du Mboa

## 💡 Deux choses à savoir si un client vous appelle

- **"J'ai rechargé la page, mon panier est-il perdu ?"** → Non. Son panier,
  sa zone et son adresse sont gardés **7 jours** sur son téléphone. Le
  panier se vide seulement quand la commande a été envoyée.
- **"Le menu ne s'affiche pas"** → C'est sa connexion. Le site réessaie tout
  seul, puis affiche un bouton **Réessayer** et votre numéro WhatsApp. Il
  peut commander directement par message en attendant.

## ⭐ Les avis clients

Quand un client laisse un avis sur le site, il **n'apparaît pas tout seul** :
vous le recevez d'abord **par e-mail** (objet « Nouvel avis — Saveurs du
Mboa »). C'est vous qui décidez de le publier ou non.

Pour publier un avis reçu :

1. Ouvrez l'e-mail, **sélectionnez tout son contenu et copiez-le**
2. Ouvrez la page d'administration → Réglages généraux → **📋 Coller
   l'avis reçu**
3. Collez, appuyez sur **Remplir les champs** → le nom, la note et le
   commentaire se remplissent tout seuls (relisez-les !)
4. Appuyez sur **Publier les changements** en bas — l'avis apparaît sur le
   site 1 à 2 minutes plus tard

Pour retirer un avis : le bouton **✕** à côté de l'avis, puis Publier.

*(Pour Yann : le formulaire d'avis reste grisé tant que la clé gratuite
web3forms.com n'est pas collée dans « Clé du formulaire d'avis » de l'admin.
L'e-mail donné à Web3Forms = celui qui recevra les avis.)*

---

## Pour Yann : installation (une seule fois) 🔧

### 1. Mettre le site en ligne
1. github.com → New repository → `saveur-du-mboa` → Public → Create
2. Add file → Upload files → envoyer : `index.html`, `admin.html`, `config.js`,
   `MODE-D-EMPLOI.md` et le dossier `photos/` complet → Commit
3. Settings → Pages → Branch : `main` + `/ (root)` → Save
4. Site en ligne sur `https://oblack917.github.io/saveur-du-mboa/`

### 2. Créer le "code d'accès" (jeton GitHub à accès limité)
1. GitHub → photo de profil → **Settings** → tout en bas **Developer settings**
2. **Personal access tokens → Fine-grained tokens → Generate new token**
3. Réglages :
   - Token name : `admin-saveur-du-mboa`
   - Expiration : la plus longue possible (pense à le renouveler à l'échéance)
   - Repository access : **Only select repositories** → coche `saveur-du-mboa`
   - Permissions → Repository permissions → **Contents : Read and write**
     (rien d'autre)
4. **Generate token** → copie le code `github_pat_…`
5. Sur le téléphone de Caroline : ouvre `…/admin.html`, colle le code,
   coche "Se souvenir" → terminé

⚠️ Ce jeton ne donne accès QU'À ce dépôt (pas à ton compte ni à tes autres
projets), mais garde-le privé : quiconque l'a peut modifier le site.
En cas de doute, supprime-le sur GitHub et crée-en un nouveau.

### 3. À FAIRE AVANT D'ACCEPTER LA PREMIÈRE VRAIE COMMANDE

Le site fonctionne, mais il n'est **pas prêt à encaisser**. Dans l'ordre :

1. ✅ **IBAN — fait** (21/07/2026). Compte `BE37 3632 7506 1728`, titulaire
   *Bouquet Nanhou*. Les deux clés de contrôle ont été vérifiées. L'IBAN et le
   nom du titulaire se modifient dans "Réglages généraux" de la page admin.
2. 🔴 **Mentions légales incomplètes** : la page `#/legal` affiche encore
   `[dénomination exacte à compléter]`, `[N° BCE à compléter]`,
   `[adresse à compléter]` et `[e-mail de contact à compléter]`. En vente à
   distance, l'identité du vendeur est obligatoire — et ces crochets visibles
   font fuir les clients. **Bloquant.**
3. 🔴 **Enregistrement AFSCA** (AFSCA/FAVV) obligatoire pour vendre de la
   nourriture en Belgique. Démarche hors site — je ne suis pas juriste,
   renseignez-vous auprès de l'AFSCA.
4. 🟠 **Allergènes à valider par la cuisine.** Ils ont été pré-remplis par
   défaut : 4 plats sur 6 sont marqués "aucun allergène", ce qui est une
   affirmation engageante. À relire plat par plat dans la page admin.
5. 🟠 **Photos protégées** : les photos du porc et du maquereau portent le
   filigrane d'un tiers ("Cooking with Claudy"). À remplacer par vos propres
   photos ou des photos libres de droit.
6. 🟡 Les liens **Instagram / TikTok** sont encore vides (`href="#"` dans
   `index.html`, pied de page).
7. 🟡 Nom de domaine perso (`saveursdumboa.be`) — confort, pas urgent.
