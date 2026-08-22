# Iqratime — site web (une page)

Site statique (HTML/CSS, sans build) présentant Iqratime : fonctionnalités,
confidentialité, section "projets similaires" (mise en avant du prochain
projet — une application éducative pour apprendre l'islam en s'amusant),
un bouton de don Stripe, et contact (`support@iqratime.com` via lien
`mailto:`).

## Aperçu en local

Aucune dépendance : ouvrir `index.html` dans un navigateur, ou servir le
dossier :

```bash
npx serve website
```

## Publication — GitHub Pages (gratuit, piloté par moi)

Le domaine `iqratime.com` est acheté chez OVH. Pour l'hébergement, on part
sur **GitHub Pages** plutôt que Vercel : c'est gratuit, ça n'a besoin
d'aucun nouveau compte (juste le GitHub que ce repo utilise déjà), et je
peux piloter tout le déploiement moi-même à chaque changement — il ne reste
que deux actions, décrites ci-dessous, que seul le propriétaire du compte
GitHub et du compte OVH peut faire (je n'ai accès à aucun des deux).

Déjà en place dans ce repo :

- `.github/workflows/deploy-website.yml` : republie automatiquement
  `website/` sur GitHub Pages à chaque push sur cette branche (et sur
  `main`, si elle existe un jour).
- `website/CNAME` : contient `iqratime.com`, pour que GitHub Pages serve le
  domaine personnalisé (et génère un certificat HTTPS gratuit
  automatiquement, une fois le domaine vérifié).

### 1. Une seule case à cocher (toi uniquement — je n'ai pas cet accès)

Dans le repo GitHub → **Settings → Pages** → *Build and deployment* →
**Source : GitHub Actions**. C'est tout — aucune API ne me permet de
changer ce réglage à ta place, c'est une action volontairement réservée à
l'administrateur du repo.

Une fois ce réglage fait, dis-le-moi : je déclenche le déploiement (ou il
se lance automatiquement au prochain push) et je vérifie que le site est
bien en ligne.

### 2. DNS chez OVH (toi uniquement — je n'ai pas accès à ton compte OVH)

Espace client OVH → **Domaines → iqratime.com → Zone DNS** → ajouter :

| Type | Nom | Cible |
|---|---|---|
| A | `@` (ou vide) | `185.199.108.153` |
| A | `@` (ou vide) | `185.199.109.153` |
| A | `@` (ou vide) | `185.199.110.153` |
| A | `@` (ou vide) | `185.199.111.153` |
| CNAME | `www` | `upasco.github.io.` |

Ce sont les adresses officielles de GitHub Pages (elles ne changent pas
d'un projet à l'autre). Propagation généralement en quelques minutes à
quelques heures.

### Email — support@iqratime.com (gratuit, inclus chez OVH)

OVH inclut une **redirection email illimitée et gratuite** avec chaque
domaine (pas besoin d'une boîte mail payante pour un simple alias support) :

1. Espace client OVH → **Domaines → iqratime.com → Emails → Redirections**.
2. Créer une redirection : `support@iqratime.com` → ta vraie boîte mail
   (Gmail, etc.).
3. *(Optionnel)* Pour pouvoir **envoyer** depuis `support@iqratime.com` (pas
   seulement recevoir), configurer un alias d'envoi dans Gmail
   ("Send mail as"), ou souscrire à l'offre email payante d'OVH si une
   vraie boîte complète est nécessaire plus tard.

**Coût total : 0 € au-delà du domaine déjà acheté** — hébergement GitHub
Pages et redirection email OVH sont gratuits.

### Alternative envisagée : Vercel

`vercel.json` reste dans le repo si tu préfères Vercel plus tard (interface
plus riche, aperçus de déploiement par PR, etc.) — mais ça demande de créer
un compte Vercel et de t'y connecter, ce que je ne peux pas faire à ta
place. GitHub Pages évite complètement cette étape.

## Don — lien Stripe à créer (placeholder pour l'instant)

Le site a deux boutons "Faire un don" / "Soutenir ce projet" (section
`#don` et carte "Prochain projet" dans `#projets-similaires`), tous deux
pointant vers `https://buy.stripe.com/REPLACE_ME_AVANT_PUBLICATION` — un
lien **factice, non fonctionnel**, marqué par un commentaire `TODO` dans
`website/index.html`.

Je n'ai ni compte Stripe ni accès à un compte bancaire, donc je ne peux pas
créer ce lien à ta place — c'est une vérification d'identité + un compte
bancaire réels. La procédure complète existe déjà dans ce repo, à
`docs/STRIPE_SETUP.md` (créée pour la fonctionnalité de don de l'app
mobile, réutilisable telle quelle pour le site) :

1. Créer/utiliser un compte Stripe vérifié.
2. **Payment Links → Create Payment Link**, montant libre ("le client
   choisit le montant"), nom "Soutenir Iqratime".
3. Copier l'URL générée (`https://buy.stripe.com/xxxxxxxxxxxx`).
4. Me la donner (ou remplacer directement les deux occurrences de
   `REPLACE_ME_AVANT_PUBLICATION` dans `website/index.html`) — c'est une
   URL publique, pas un secret, donc rien de sensible à gérer ici.

---

Dis-moi dès que la case **Settings → Pages → Source: GitHub Actions** est
cochée et que les DNS OVH sont posés — je vérifie que tout fonctionne
(déploiement, HTTPS, propagation) et je vous relance si besoin.
