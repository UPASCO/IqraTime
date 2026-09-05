# IqraTime — site web (iqratime.com)

Site statique publié sur GitHub Pages à l'adresse <https://iqratime.com>.

## ⚠️ Ce dossier est généré — ne pas l'éditer à la main

Les fichiers HTML de `website/` sont **produits** par le script de build.
Toute modification faite directement ici sera écrasée au prochain
déploiement.

| Pour changer… | Éditer… |
|---|---|
| le contenu / la structure d'une page | `scripts/website/templates/{index,contact,privacy}.html` |
| un texte dans une des 7 langues | `scripts/website/i18n-data.js` |
| les styles | `website/styles.css` *(non généré)* |
| le comportement JS | `website/site.js` *(non généré)* |
| l'image de partage social | `scripts/website/og-card.html`, puis régénérer (voir plus bas) |

Après toute modification :

```bash
node scripts/website/build.mjs
```

Le workflow GitHub Actions lance ce build lui-même à chaque déploiement,
donc un `website/` non régénéré ne peut pas partir en production.

## Architecture

```
scripts/website/
  templates/*.html   Source unique (français, balisé data-i18n)
  i18n-data.js       Traductions des 7 langues (build uniquement)
  build.mjs          Générateur
  og-card.html       Source de l'image de partage 1200×630

website/             ← SORTIE GÉNÉRÉE + fichiers statiques
  index|contact|privacy.html      français (racine)
  en/ ar/ de/ es/ it/ nl/         une copie traduite par langue
  sitemap.xml                     généré
  styles.css, site.js             écrits à la main
  robots.txt, manifest.webmanifest, CNAME, assets/
```

### Pourquoi une page statique par langue

Un site qui traduit son texte en JavaScript ne montre aux moteurs de
recherche que la version française. En générant de vraies pages par langue
(`/en/`, `/ar/`, …) reliées entre elles par des balises `hreflang`, les 7
versions deviennent indexables et peuvent remonter chacune dans leur
marché. Le visiteur, lui, ne télécharge plus les traductions des 6 autres
langues — seulement sa page, déjà écrite dans sa langue.

Le sélecteur de langue navigue vers la page équivalente (`site.js`) en
conservant la page courante : `/ar/contact.html` → `/de/contact.html`.

## Aperçu en local

```bash
node scripts/website/build.mjs
npx serve website
```

## Régénérer l'image de partage social (og-image)

`assets/og-image.png` (1200×630) est ce qui s'affiche quand le lien est
partagé sur WhatsApp, Facebook, LinkedIn ou X. Pour la régénérer après
avoir modifié `scripts/website/og-card.html`, ouvrir ce fichier dans un
navigateur en 1200×630 et capturer, ou via Playwright :

```js
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto("file://…/scripts/website/og-card.html");
await page.screenshot({ path: "website/assets/og-image.png" });
```

## SEO en place

- Une page indexable par langue + `hreflang` (dont `x-default`).
- `sitemap.xml` généré (21 URLs) et `robots.txt` qui le référence.
- Données structurées JSON-LD : `SoftwareApplication`, `FAQPage`
  (éligible aux résultats enrichis Google), `ContactPage`.
- Open Graph + Twitter Card complets, avec une image **en URL absolue** —
  sans quoi aucun aperçu ne s'affiche lors d'un partage.
- Section FAQ : du texte réellement indexable qui répond à des requêtes
  concrètes ("l'application est-elle gratuite", "fonctionne-t-elle hors
  ligne", …).
- `manifest.webmanifest` + `theme-color`.

### Ce qu'il reste à faire à la main (hors code)

1. **Google Search Console** — ajouter la propriété `iqratime.com`,
   valider par l'enregistrement DNS TXT chez OVH, puis soumettre
   `https://iqratime.com/sitemap.xml`. C'est ce qui déclenche réellement
   l'indexation ; sans cela il faut attendre que Google découvre le site.
2. **Bing Webmaster Tools** — même chose (importable depuis Search Console).
3. **Liens entrants** — le facteur de classement le plus lourd. Quelques
   liens depuis des sites/annuaires réels valent plus que n'importe quel
   réglage technique.
4. ~~**Fiches Store**~~ — fait : les badges pointent vers les vraies fiches
   Google Play et App Store. Reste à renseigner `iqratime.com` dans les
   deux fiches (App Store Connect / Play Console) : le lien réciproque
   aide les deux référencements.

## Domaine, hébergement, email

- **Domaine** : OVH. Zone DNS pointée vers GitHub Pages (4 `A` vers
  `185.199.108-111.153`, `CNAME www` → `upasco.github.io.`).
- **Hébergement** : GitHub Pages, gratuit, HTTPS Let's Encrypt automatique.
  `website/CNAME` porte le domaine ; Pages est réglé sur *Source: GitHub
  Actions*.
- **Email** : redirection OVH gratuite `support@iqratime.com` → boîte
  personnelle.

## Don

Les boutons de don pointent vers le Payment Link Stripe
`https://buy.stripe.com/fZu8wH6nOaxP7J44Oudwc00`. Montant, moyens de
paiement et libellé se gèrent dans le Dashboard Stripe, sans toucher au
code.

## Formulaire de contact

`contact.html` poste vers [FormSubmit](https://formsubmit.co) qui relaie le
message à `support@iqratime.com` — aucun backend, compatible avec
l'hébergement statique. Champs obligatoires : email et message.

> Au tout premier envoi réel, FormSubmit envoie un email de confirmation à
> `support@iqratime.com` : il faut cliquer le lien qu'il contient pour
> activer la réception. C'est une étape unique.
