# 📖 Mode d'emploi — Site Saveurs du Mboa

## Pour Caroline & Viviane : changer le menu chaque semaine 🍽️

**Vous n'avez besoin d'aucune connaissance en informatique.** Tout se fait
depuis une page du site, sur votre téléphone :

1. Ouvrez la page : **https://oblack917.github.io/saveurs-du-mboa/admin.html**
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

---

## Pour Yann : installation (une seule fois) 🔧

### 1. Mettre le site en ligne
1. github.com → New repository → `saveurs-du-mboa` → Public → Create
2. Add file → Upload files → envoyer : `index.html`, `admin.html`, `config.js`,
   `MODE-D-EMPLOI.md` et le dossier `photos/` complet → Commit
3. Settings → Pages → Branch : `main` + `/ (root)` → Save
4. Site en ligne sur `https://oblack917.github.io/saveurs-du-mboa/`

### 2. Créer le "code d'accès" (jeton GitHub à accès limité)
1. GitHub → photo de profil → **Settings** → tout en bas **Developer settings**
2. **Personal access tokens → Fine-grained tokens → Generate new token**
3. Réglages :
   - Token name : `admin-saveurs-du-mboa`
   - Expiration : la plus longue possible (pense à le renouveler à l'échéance)
   - Repository access : **Only select repositories** → coche `saveurs-du-mboa`
   - Permissions → Repository permissions → **Contents : Read and write**
     (rien d'autre)
4. **Generate token** → copie le code `github_pat_…`
5. Sur le téléphone de Caroline : ouvre `…/admin.html`, colle le code,
   coche "Se souvenir" → terminé

⚠️ Ce jeton ne donne accès QU'À ce dépôt (pas à ton compte ni à tes autres
projets), mais garde-le privé : quiconque l'a peut modifier le site.
En cas de doute, supprime-le sur GitHub et crée-en un nouveau.

### 3. À personnaliser avant le lancement
- L'**IBAN** (via la page admin ou config.js)
- Les liens **Instagram / TikTok** dans `index.html` (pied de page, cherche `href="#"`)
- Remplacer les photos avec filigrane (porc, maquereau) par vos propres photos
