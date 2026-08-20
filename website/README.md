# AyahNow — site web (une page)

Site statique (HTML/CSS, sans build) présentant AyahNow : fonctionnalités,
confidentialité, section "projets similaires" et contact
(`support@ayahnow.com` via lien `mailto:`).

## Aperçu en local

Aucune dépendance : ouvrir `index.html` dans un navigateur, ou servir le
dossier :

```bash
npx serve website
```

## Ce que j'ai préparé (autonome)

- Le site lui-même : `website/index.html` + `website/styles.css`.
- `vercel.json` (racine du repo) : configure `outputDirectory: "website"`
  pour que Vercel serve le site sans réglage manuel côté dashboard.
- `.github/workflows/deploy-website.yml` : déploiement gratuit alternatif
  sur GitHub Pages (au cas où), indépendant de Vercel.

## Ce que je ne peux pas faire à ta place

Je n'ai ni moyen de paiement, ni accès à un compte OVH ou Vercel : l'achat
du domaine et la connexion/déploiement doivent être faits par toi (ou en me
donnant les accès d'un compte que tu contrôles). Voici le chemin exact,
avec OVH pour le domaine et Vercel pour l'hébergement, comme demandé.

### 1. Domaine — OVH

1. Aller sur [ovhcloud.com](https://www.ovhcloud.com/fr/domains/) →
   chercher `ayahnow.com` → l'acheter (compte OVH à créer si besoin).
2. Une fois acheté, dans l'espace client OVH → **Domaines → ayahnow.com →
   Zone DNS** : c'est ici qu'on ajoutera les enregistrements pointant vers
   Vercel (étape 3).

### 2. Hébergement — Vercel

1. Aller sur [vercel.com](https://vercel.com) → **Sign up** → connexion
   avec le compte GitHub qui a accès à `upasco/ayahnow`.
2. **Add New → Project** → importer le repo `upasco/ayahnow`.
3. Comme `vercel.json` définit déjà `outputDirectory: "website"`, laisser
   le framework preset sur **Other** et cliquer **Deploy** — aucun autre
   réglage n'est nécessaire.
4. Vercel donne une URL gratuite immédiate du type
   `ayahnow.vercel.app` — le site est en ligne dès cette étape, avant même
   d'avoir un domaine.

### 3. Relier le domaine OVH à Vercel

1. Dans le projet Vercel → **Settings → Domains** → ajouter `ayahnow.com`
   (et `www.ayahnow.com` si voulu).
2. Vercel affiche les enregistrements DNS à créer. Concrètement, dans la
   zone DNS OVH (étape 1) :
   - Un enregistrement **A** pour `ayahnow.com` (`@`) → `76.76.21.21`
   - Un enregistrement **CNAME** pour `www` → `cname.vercel-dns.com.`
   - *(Vercel affiche la valeur exacte au moment de l'ajout — s'y fier en priorité si elle diffère légèrement.)*
3. Attendre la propagation DNS (quelques minutes à quelques heures) —
   Vercel confirme automatiquement quand `https://ayahnow.com` est actif
   (certificat HTTPS généré automatiquement, gratuit).

### 4. Email — support@ayahnow.com (gratuit, inclus chez OVH)

OVH inclut une **redirection email illimitée et gratuite** avec chaque
domaine (pas besoin d'une boîte mail payante pour un simple alias support) :

1. Espace client OVH → **Domaines → ayahnow.com → Emails → Redirections**.
2. Créer une redirection : `support@ayahnow.com` → ta vraie boîte mail
   (Gmail, etc.).
3. *(Optionnel)* Pour pouvoir **envoyer** depuis `support@ayahnow.com` (pas
   seulement recevoir), configurer un alias d'envoi dans Gmail
   ("Send mail as"), ou souscrire à l'offre email payante d'OVH si une
   vraie boîte complète est nécessaire plus tard.

**Coût total : uniquement le prix du domaine chez OVH** (hébergement Vercel
et redirection email inclus gratuitement dans les offres ci-dessus).

---

Dis-moi une fois le domaine acheté et le projet Vercel créé — je peux
directement vérifier la config DNS, ajuster `vercel.json` si besoin, et
mettre à jour le contenu du site (textes, visuels, liens Store) dès que
l'app a une fiche Store.
