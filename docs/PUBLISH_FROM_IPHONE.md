# Tester et publier AyahNow depuis un iPhone (sans Mac)

Tu n'as pas besoin d'un Mac ni de Xcode. Expo Application Services (EAS)
compile l'app iOS dans le cloud d'Expo — la compilation elle-même ne
tourne jamais sur ta machine. Tout ce qui suit se fait depuis Safari sur
ton iPhone 16 Pro Max, sauf mention contraire.

**Important sur cet environnement (cette session Claude Code) :** le
réseau de ce conteneur sandboxé n'a pas accès à `expo.dev` / `api.expo.dev`
(vérifié — connexion bloquée). Je ne peux donc pas exécuter `eas build`
ou `eas submit` à ta place depuis ici. Les étapes ci-dessous sont donc
pour **toi**, directement sur ton iPhone. Je peux en revanche continuer à
préparer le code, la config, les fichiers texte, etc.

## 1. Compte Expo (gratuit)

1. Dans Safari : [expo.dev](https://expo.dev) → créer un compte.
2. Le code est déjà poussé sur GitHub (`UPASCO/AyahNow`, branche
   `claude/ayahnow-mobile-app-r3ykkx`). Sur le dashboard Expo, choisis
   "Créer un projet" → "Importer depuis GitHub" et connecte ce dépôt.

## 2. Compte développeur Apple

1. Toujours dans Safari : [developer.apple.com](https://developer.apple.com)
   → connecte-toi avec **ton propre** identifiant Apple → rejoins
   l'Apple Developer Program (99 $/an). C'est toi qui saisis identifiant,
   mot de passe et code 2FA — jamais dans cette conversation.
2. Une fois le compte actif, App Store Connect
   ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)) devient
   accessible.

## 3. Clé API App Store Connect (recommandé — évite de retaper le 2FA à chaque build)

Plutôt que de donner ton identifiant/mot de passe Apple à EAS à chaque
build (ce qui redemande un code 2FA à chaque fois), crée une **clé API**
une seule fois :

1. App Store Connect → **Utilisateurs et accès** → onglet **Intégrations**
   → **Clés API App Store Connect** → **Générer une clé**.
2. Rôle : *App Manager* suffit. Télécharge le fichier `.p8` **une seule
   fois** (Apple ne le propose qu'au moment de la création), note le
   **Key ID** et l'**Issuer ID**.
3. Ne mets **jamais** ce fichier `.p8` dans le dépôt Git. Sur le
   dashboard EAS (expo.dev) → ton projet → **Credentials** → iOS →
   ajoute cette clé API directement dans l'interface EAS (elle est
   stockée chiffrée côté Expo, pas dans ton code).

Avec cette clé configurée, `eas build` et `eas submit` n'auront plus
besoin de ton identifiant Apple ni d'un code 2FA à chaque fois.

## 4. Identité de l'app (à faire une fois, avant le premier vrai build)

Dans `config/shared.js` (ce dépôt), remplace les valeurs `PROVISIONAL`
par les vraies : `iosBundleIdentifier` (ex. `com.tonnom.ayahnow` — choisis
un identifiant que tu es sûr de posséder/pouvoir réserver), `easProjectId`
(donné automatiquement par le dashboard EAS à l'étape 1), `contactEmail`,
`privacyPolicyUrl`. Dis-le-moi et je fais la modification et je pousse le
commit — aucune de ces valeurs n'est un secret personnel.

## 5. Lancer un build cloud — entièrement depuis le navigateur

Dashboard EAS → ton projet → onglet **Builds** → **Create a build** →
plateforme **iOS**, profil `preview` (pour tester) ou `production` (pour
soumettre). EAS gère automatiquement les certificats et le profil de
provisioning si tu lui laisses les "credentials managées". Le build tourne
dans le cloud Expo — tu peux fermer Safari et revenir plus tard, tu reçois
une notification quand c'est prêt (~15–30 min).

## 6. Tester sur ton iPhone

Deux options :

- **Test rapide sans App Store** (profil `preview`, distribution
  interne) : la page du build terminé affiche un QR code. Scanne-le avec
  l'appareil photo de ton iPhone → ça installe l'app directement (il faut
  d'abord enregistrer ton iPhone comme appareil de test, EAS te guide via
  un lien qui installe un profil — toujours depuis Safari).
- **Test via TestFlight** (profil `production`, plus proche du réel) :
  une fois le build terminé, envoie-le vers App Store Connect avec
  **Submit** (bouton sur le dashboard EAS, à côté du build — pas besoin de
  terminal). Une fois traité par Apple (10–60 min), installe l'app
  **TestFlight** depuis l'App Store, ajoute-toi comme testeur interne dans
  App Store Connect, et le build apparaît dans TestFlight.

C'est en testant via TestFlight sur ton iPhone que tu vérifies le point
non-négociable : la notification arrive et s'affiche correctement sur
l'écran verrouillé d'un vrai appareil (le simulateur ne suffit pas).

## 7. Soumission réelle à l'App Store

Depuis App Store Connect (Safari) : fiche produit (description, captures
d'écran, mots-clés), questionnaire de confidentialité ("App Privacy" — cette
app ne collecte aucune donnée), notes pour l'équipe de revue. Une fois tout
rempli et le build attaché, tu soumets pour revue. Je ne peux pas affirmer
que l'app est "disponible publiquement" tant qu'App Store Connect n'affiche
pas réellement le statut "Available" / "Ready for Distribution" — je m'en
tiendrai à ça dans mes futurs comptes-rendus.

## Ce que je peux faire pour toi dans cette session (sans secret ni accès Apple)

- Modifier `config/shared.js` / `app.config.ts` dès que tu me donnes le
  bundle id définitif.
- Préparer les pages statiques (politique de confidentialité, support,
  sources du corpus) que tu n'auras plus qu'à héberger.
- Rédiger la fiche App Store Connect (description, notes de revue) en
  brouillon, que tu copies-colles.
- Continuer à faire avancer tout ce qui ne nécessite ni identifiant Apple,
  ni compte Stripe réel, ni appareil physique.

Ce que **toi seul** peux faire (règle de sécurité déjà en place, rappelée
ici) : toute connexion avec ton identifiant Apple, mot de passe ou code
2FA ; la création du compte développeur et de la clé API ; le scan
d'installation TestFlight sur ton iPhone ; la soumission finale.
