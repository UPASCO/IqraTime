/**
 * Translation data for the IqraTime website.
 *
 * Build-time only: scripts/website/build.mjs reads this to generate one fully
 * translated static page per language. It is never sent to the browser —
 * visitors receive a page already written in their language, which is also
 * what lets search engines index all seven of them.
 */
module.exports = {
  fr: {
    meta: {
      title: "IqraTime — Le Coran sur votre écran, sans déverrouiller",
      description: "IqraTime envoie une notification d'āyah du Coran ou de hadith authentique à votre écran verrouillé, à l'heure de votre choix. Application 100% hors-ligne, sans compte, sans publicité."
    },
    nav: {
      features: "Fonctionnalités",
      privacy: "Confidentialité",
      similar: "Projets similaires",
      donate: "Faire un don",
      contact: "Contact"
    },
    hero: {
      kicker: "اقرأ · Iqra — « Lis ! », premier mot révélé du Coran",
      title: "Et si chaque notification comptait vraiment ?",
      lead: "Une āyah du Coran ou un hadith authentique différent par heure, directement sur votre écran verrouillé — une source de hassanat, inchAllah, sans compte, sans serveur, sans connexion Internet nécessaire au quotidien.",
      badgeIos: "📱 Bientôt sur l'App Store",
      badgeAndroid: "🤖 Bientôt sur Google Play"
    },
    phone: {
      translation: "« Et fais bonne annonce aux endurants. »",
      reference: "Sourate Al-Baqarah, 2:155"
    },
    features: {
      title: "Une āyah, un hadith, à votre rythme",
      subtitle: "IqraTime s'adapte à vos habitudes plutôt que l'inverse — vous choisissez quand, à quelle fréquence, et dans quelle langue.",
      f1: {
        title: "Notifications programmées",
        desc: "Une āyah du Coran ou un hadith authentique, texte arabe et/ou traduction — selon l'ordre que vous préférez, sur les plages horaires que vous définissez."
      },
      f2: {
        title: "100% hors-ligne",
        desc: "Aucun compte, aucun serveur, aucune publicité, aucun traqueur. Tout fonctionne sur votre appareil."
      },
      f3: {
        title: "12 langues",
        desc: "Arabe, français, anglais, espagnol, portugais, hindi, bengali, chinois simplifié, italien, russe, néerlandais, allemand — avec support RTL complet pour l'arabe."
      },
      f4: {
        title: "Horaires sur mesure",
        desc: "Plage active, jours, fréquence (1h à 12h), heures fixes, silence nocturne, et une variation aléatoire optionnelle."
      },
      f5: {
        title: "Thèmes spirituels",
        desc: "Patience, gratitude, espoir, miséricorde… orientez les āyāt que vous recevez, entièrement sur l'appareil."
      },
      f6: {
        title: "Suivi &amp; partage",
        desc: "Historique, favoris, série de jours consécutifs, écran de découverte du Coran, et partage sous forme de carte visuelle — chaque partage est aussi une source de hassanat, inchAllah."
      },
      f7: {
        title: "Hadiths authentiques &amp; tafsir",
        desc: "Sahih al-Bukhari et Sahih Muslim en contenu optionnel, avec un tafsir (explication du sens et du contexte) disponible pour chaque āyah, d'un simple tap."
      },
      f8: {
        title: "Un instant pour vous",
        desc: "Dites comment vous vous sentez — anxieux, reconnaissant, en recherche de guidance… — et recevez une āyah choisie pour ce moment précis, à la demande."
      },
      newBadge: "Nouveau",
      f9: {
        title: "☀️ Āyah du jour",
        desc: "La même āyah pour tout le monde, chaque jour, choisie parmi les āyāt les plus reconnues — sans serveur ni réseau : deux téléphones comparés le même jour affichent la même. Idéale pour le partage en groupe, elle change à minuit (heure locale) et ne se répète pas avant la fin du cycle complet."
      },
      f10: {
        title: "📿 Mémorisation (hifz)",
        desc: "Répétition espacée aux intervalles qui grandissent — 1, 3, 7, 14, 30 puis 60 jours : la référence s'affiche, vous récitez de mémoire, vous révélez, vous vous auto-évaluez. Un oubli ramène au début, et ce que vous avez mémorisé reste entretenu à vie — jamais archivé."
      }
    },
    privacy: {
      title: "Votre vie privée, respectée par conception",
      text: "Aucun compte, aucune connexion requise, aucun backend, aucune analytique, aucune publicité, aucun identifiant de suivi. Aucune donnée ne quitte votre appareil.",
      readMore: "Lire la politique de confidentialité complète →"
    },
    similar: {
      title: "Projets similaires",
      subtitle: "IqraTime fait partie d'une famille d'applications pensées par la même équipe, avec les mêmes principes : hors-ligne, sans compte, sans publicité.",
      featuredStatus: "Prochain projet",
      featuredTitle: "Application éducative — apprendre l'islam en s'amusant",
      featuredDesc: "Une application ludique et hors-ligne pour découvrir et apprendre les bases de l'islam en s'amusant, avec les mêmes principes qu'IqraTime : aucun compte, aucune publicité, aucune donnée collectée.",
      featuredCta: "Soutenir ce projet",
      ideaStatus: "Vous avez une idée ?",
      ideaTitle: "Proposez un projet similaire",
      ideaDesc: "Une idée d'application de rappel, dans le même esprit qu'IqraTime ? Écrivez-nous — nous sommes toujours curieux d'échanger sur de nouveaux projets."
    },
    donate: {
      title: "Soutenir nos projets",
      text: "IqraTime est gratuit, hors-ligne et sans publicité — et le restera. Vos dons aident à financer son développement continu ainsi que nos prochains projets, comme l'application éducative pour apprendre l'islam en s'amusant.",
      cta: "Faire un don",
      fineprint: "Paiement sécurisé par Stripe. Don volontaire, sans contrepartie."
    },
    support: {
      title: "Une question, un problème ?",
      text: "Écrivez-nous via notre formulaire de contact, ou directement par email.",
      cta: "Nous contacter"
    },
    contact: {
      title: "Contactez-nous",
      subtitle: "Une question, une suggestion, un problème technique ? Écrivez-nous — nous répondons personnellement à chaque message.",
      labelName: "Nom",
      labelEmail: "Email",
      labelSubject: "Sujet",
      labelMessage: "Message",
      optional: "optionnel",
      required: "obligatoire",
      submit: "Envoyer le message",
      altText: "Vous préférez nous écrire directement ?",
      successTitle: "Message envoyé !",
      successText: "Merci, nous avons bien reçu votre message et nous vous répondrons dès que possible, inchAllah.",
      backHome: "← Retour à l'accueil"
    },
    nav2: {
      faq: "FAQ"
    },
    share: {
      title: "Partagez, et multipliez les hassanat",
      text: "Faire découvrir IqraTime à un proche, c'est semer une source de bien qui continue à porter ses fruits, inchAllah.",
      whatsapp: "Partager sur WhatsApp",
      telegram: "Partager sur Telegram",
      x: "Partager sur X",
      copy: "Copier le lien",
      copied: "Lien copié !",
      message: "Et si le Coran venait à vous ? Une āyah ou un hadith authentique sur votre écran, chaque heure — hors-ligne, sans compte, sans publicité :"
    },
    faq: {
      title: "Questions fréquentes",
      subtitle: "Tout ce qu'on nous demande le plus souvent sur IqraTime.",
      q1: "IqraTime est-il vraiment gratuit ?",
      a1: "Oui, entièrement gratuit et sans publicité — et cela ne changera pas. Il n'y a ni abonnement, ni fonctionnalité payante, ni compte à créer. Les dons sont totalement facultatifs et ne débloquent rien.",
      q2: "L'application fonctionne-t-elle sans connexion Internet ?",
      a2: "Oui. Le corpus, les traductions et la planification des notifications sont entièrement embarqués sur votre appareil. Une fois installée, IqraTime n'a besoin d'aucune connexion pour fonctionner au quotidien.",
      q3: "Mes données personnelles sont-elles collectées ?",
      a3: "Non, aucune. Pas de compte, pas de serveur, pas d'analytique, pas de traqueur, pas d'identifiant publicitaire. Vos favoris, votre historique et vos réglages ne quittent jamais votre téléphone.",
      q4: "Dans quelles langues IqraTime est-il disponible ?",
      a4: "En 12 langues : arabe, français, anglais, espagnol, portugais, hindi, bengali, chinois simplifié, italien, russe, néerlandais et allemand — avec un support complet de l'écriture de droite à gauche pour l'arabe.",
      q5: "Puis-je choisir à quelle heure je reçois les notifications ?",
      a5: "Oui, entièrement. Vous définissez la plage horaire active, les jours de la semaine, la fréquence (d'une fois par heure à une fois toutes les 12 heures), des heures fixes si vous préférez, et un silence nocturne automatique.",
      q6: "Y a-t-il des hadiths en plus des versets du Coran ?",
      a6: "Oui. En plus des āyāt, vous pouvez activer les hadiths authentiques issus de Sahih al-Bukhari et Sahih Muslim. Chaque āyah dispose également d'un tafsir expliquant son sens et son contexte, accessible d'un simple tap.",
      q7: "Qu'est-ce que l'« Āyah du jour » ?",
      a7: "Chaque jour, IqraTime met en avant une āyah identique pour tous les utilisateurs, choisie de façon déterministe parmi environ 165 āyāt parmi les plus reconnues — sans serveur : le calcul se fait sur votre téléphone. Deux appareils affichent la même āyah le même jour, ce qui la rend idéale à partager en groupe. Elle change à minuit, heure locale, et ne revient pas avant la fin du cycle complet.",
      q8: "Comment fonctionne la mémorisation (hifz) ?",
      a8: "Vous ajoutez une āyah à votre liste de mémorisation, puis l'app planifie des révisions à intervalles croissants : 1, 3, 7, 14, 30 puis 60 jours. À chaque révision, la référence s'affiche, vous récitez de mémoire, vous révélez le texte et vous vous évaluez vous-même — l'app ne juge jamais votre récitation, elle ne fait que planifier. Un oubli ramène l'āyah au début du cycle, et une āyah maîtrisée reste entretenue tous les 60 jours."
    },
    legal: {
      title: "Politique de confidentialité",
      updated: "Dernière mise à jour : 25 août 2026",
      sumTitle: "Résumé",
      sumText: "Toutes vos préférences, votre historique et vos favoris restent sur votre appareil. IqraTime ne nécessite aucun compte et n'envoie jamais ces données à un serveur.",
      notTitle: "Ce qu'IqraTime ne fait pas",
      not1: "Aucun compte, aucune inscription, aucune connexion, aucun identifiant utilisateur d'aucune sorte.",
      not2: "Aucun serveur backend pour le fonctionnement quotidien.",
      not3: "Aucun SDK d'analytique, de rapport de plantage, ou de publicité.",
      not4: "Aucun identifiant publicitaire (IDFA/GAID) lu ou généré.",
      not5: "Aucun profilage, aucun suivi comportemental, aucune « personnalisation » au-delà des thèmes et réglages que vous choisissez explicitement.",
      not6: "Aucun accès GPS ou à toute autre donnée de localisation.",
      not7: "Aucun accès aux contacts, au microphone ou à la caméra.",
      not8: "Aucune synchronisation des favoris, de l'historique ou des préférences vers un service distant.",
      not9: "Aucune télémétrie, cachée ou non.",
      storedTitle: "Ce qui est stocké, et où",
      storedIntro: "Tout ce qui suit vit <strong>uniquement sur l'appareil</strong>, dans une base locale (SQLite) ou dans le stockage local de préférences.",
      thData: "Donnée",
      thStore: "Stockage",
      thUse: "Usage",
      sPrefs: "Stockage local",
      sDb: "Base locale (SQLite)",
      d1: "Préférences (langue, horaires, thème, etc.)",
      u1: "Se souvenir de vos réglages",
      d2: "Historique des notifications / favoris",
      u2: "Afficher l'historique et les favoris, éviter les répétitions",
      d3: "Āyāt masquées",
      u3: "Respecter les āyāt que vous avez choisi d'exclure",
      d4: "Créneaux de notification programmés",
      u4: "La file de notifications glissante",
      d5: "Journal d'erreurs local",
      u5: "Écran de diagnostics uniquement — jamais transmis",
      storedOutro: "Désinstaller l'application supprime tout cela. « Réinitialiser toutes les données locales » dans les Réglages supprime tout sans désinstaller.",
      donateTitle: "Dons optionnels « Soutenir IqraTime »",
      donateText: "Si activé, l'écran de soutien ouvre un Payment Link hébergé par Stripe dans le navigateur système de votre appareil. IqraTime ne voit, ne demande, ne stocke, ni ne transmet jamais aucune donnée de paiement — aucun numéro de carte, aucune date d'expiration, aucun CVC, aucun détail de compte Apple Pay/Google Pay, aucune coordonnée bancaire, aucun montant, aucun historique de transaction Stripe. Cette page est entièrement opérée par Stripe et régie par sa propre politique de confidentialité, indépendante de celle d'IqraTime.",
      formTitle: "Formulaire de contact du site",
      formText: "Si vous utilisez le formulaire de contact de ce site, les informations que vous y saisissez (email, et le cas échéant nom, sujet et message) sont transmises par le service FormSubmit uniquement pour nous acheminer votre message par email. Elles servent exclusivement à vous répondre, ne sont jamais revendues ni utilisées à des fins publicitaires, et sont indépendantes de l'application mobile — qui, elle, ne collecte rien.",
      depsTitle: "Dépendances tierces",
      depsText: "Chaque dépendance a été choisie notamment sur ce critère : collecte-t-elle des données par défaut ? Aucune des bibliothèques utilisées n'inclut de composant d'analytique ou de suivi. Les notifications sont exclusivement programmées localement, sans infrastructure de push distant.",
      contactTitle: "Contact",
      contactText: "Pour toute question relative à cette politique de confidentialité :"
    },
    footer: {
      copyright: "© 2026 IqraTime. Tous droits réservés.",
      privacy: "Politique de confidentialité",
      home: "Accueil"
    }
  },
  en: {
    meta: {
      title: "IqraTime — The Quran on your screen, without unlocking",
      description: "IqraTime sends a Quran āyah or authentic hadith notification to your lock screen, at the time you choose. 100% offline app, no account, no ads."
    },
    nav: {
      features: "Features",
      privacy: "Privacy",
      similar: "Similar projects",
      donate: "Donate",
      contact: "Contact"
    },
    hero: {
      kicker: "اقرأ · Iqra — “Read!”, the first word revealed in the Quran",
      title: "What if every notification truly counted?",
      lead: "A different Quran āyah or authentic hadith every hour, straight to your lock screen — a source of hassanat, inshaAllah, no account, no server, no internet connection needed day to day.",
      badgeIos: "📱 Coming soon on the App Store",
      badgeAndroid: "🤖 Coming soon on Google Play"
    },
    phone: {
      translation: "“And give good tidings to the patient.”",
      reference: "Surah Al-Baqarah, 2:155"
    },
    features: {
      title: "An āyah, a hadith, at your pace",
      subtitle: "IqraTime adapts to your habits, not the other way around — you choose when, how often, and in which language.",
      f1: {
        title: "Scheduled notifications",
        desc: "A Quran āyah or an authentic hadith, Arabic text and/or translation — in the order you prefer, during the time slots you set."
      },
      f2: {
        title: "100% offline",
        desc: "No account, no server, no ads, no tracker. Everything runs on your device."
      },
      f3: {
        title: "12 languages",
        desc: "Arabic, French, English, Spanish, Portuguese, Hindi, Bengali, Simplified Chinese, Italian, Russian, Dutch, German — with full RTL support for Arabic."
      },
      f4: {
        title: "Custom schedule",
        desc: "Active hours, days, frequency (1h to 12h), fixed times, night silence, and an optional random variation."
      },
      f5: {
        title: "Spiritual themes",
        desc: "Patience, gratitude, hope, mercy… guide which āyāt you receive, entirely on your device."
      },
      f6: {
        title: "Track &amp; share",
        desc: "History, favorites, a day streak, a Quran discovery screen, and sharing as a visual card — every share is also a source of hassanat, inshaAllah."
      },
      f7: {
        title: "Authentic hadith &amp; tafsir",
        desc: "Sahih al-Bukhari and Sahih Muslim as an optional content type, with a tafsir (meaning and context) available for every āyah, one tap away."
      },
      f8: {
        title: "A moment for you",
        desc: "Say how you're feeling — anxious, grateful, seeking guidance… — and get an āyah chosen for that exact moment, on demand."
      },
      newBadge: "New",
      f9: {
        title: "☀️ Āyah of the day",
        desc: "The same āyah for everyone, every day, drawn from the most recognized āyāt — no server, no network: two phones compared on the same day show the same one. Perfect for group sharing, it changes at local midnight and never repeats until the full cycle is done."
      },
      f10: {
        title: "📿 Memorization (hifz)",
        desc: "Spaced repetition with growing intervals — 1, 3, 7, 14, 30 then 60 days: the reference shows, you recite from memory, reveal, and rate yourself. A lapse restarts the cycle, and what you've memorized stays maintained for life — never archived."
      }
    },
    privacy: {
      title: "Your privacy, respected by design",
      text: "No account, no login required, no backend, no analytics, no ads, no tracking identifier. No data ever leaves your device.",
      readMore: "Read the full privacy policy →"
    },
    similar: {
      title: "Similar projects",
      subtitle: "IqraTime is part of a family of apps designed by the same team, built on the same principles: offline, no account, no ads.",
      featuredStatus: "Next project",
      featuredTitle: "Educational app — learning Islam while having fun",
      featuredDesc: "A playful, offline app to discover and learn the basics of Islam while having fun, built on the same principles as IqraTime: no account, no ads, no data collected.",
      featuredCta: "Support this project",
      ideaStatus: "Got an idea?",
      ideaTitle: "Suggest a similar project",
      ideaDesc: "An idea for a reminder app, in the same spirit as IqraTime? Write to us — we're always curious to talk about new projects."
    },
    donate: {
      title: "Support our projects",
      text: "IqraTime is free, offline, and ad-free — and it will stay that way. Your donations help fund its ongoing development as well as our upcoming projects, like the educational app for learning Islam while having fun.",
      cta: "Donate",
      fineprint: "Secure payment via Stripe. Voluntary donation, no benefit granted."
    },
    support: {
      title: "A question, an issue?",
      text: "Write to us via our contact form, or directly by email.",
      cta: "Contact us"
    },
    contact: {
      title: "Contact us",
      subtitle: "A question, a suggestion, a technical issue? Write to us — we personally reply to every message.",
      labelName: "Name",
      labelEmail: "Email",
      labelSubject: "Subject",
      labelMessage: "Message",
      optional: "optional",
      required: "required",
      submit: "Send message",
      altText: "Prefer to write to us directly?",
      successTitle: "Message sent!",
      successText: "Thank you, we've received your message and will get back to you as soon as possible, inshaAllah.",
      backHome: "← Back to home"
    },
    nav2: {
      faq: "FAQ"
    },
    share: {
      title: "Share it, and multiply the hassanat",
      text: "Introducing IqraTime to someone you care about plants a source of good that keeps bearing fruit, inshaAllah.",
      whatsapp: "Share on WhatsApp",
      telegram: "Share on Telegram",
      x: "Share on X",
      copy: "Copy link",
      copied: "Link copied!",
      message: "What if the Quran came to you? An āyah or an authentic hadith on your screen, every hour — offline, no account, no ads:"
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "The things people ask us most about IqraTime.",
      q1: "Is IqraTime really free?",
      a1: "Yes, completely free and ad-free — and that will not change. There is no subscription, no paid feature, and no account to create. Donations are entirely optional and unlock nothing.",
      q2: "Does the app work without an internet connection?",
      a2: "Yes. The corpus, the translations, and the notification scheduling all ship inside the app. Once installed, IqraTime needs no connection at all for day-to-day use.",
      q3: "Is any of my personal data collected?",
      a3: "None whatsoever. No account, no server, no analytics, no tracker, no advertising identifier. Your favorites, history, and settings never leave your phone.",
      q4: "Which languages is IqraTime available in?",
      a4: "12 languages: Arabic, French, English, Spanish, Portuguese, Hindi, Bengali, Simplified Chinese, Italian, Russian, Dutch, and German — with full right-to-left support for Arabic.",
      q5: "Can I choose what time I receive notifications?",
      a5: "Yes, entirely. You set the active hours, the days of the week, the frequency (from once an hour to once every 12 hours), fixed times if you prefer, and an automatic night silence.",
      q6: "Are there hadith as well as Quran verses?",
      a6: "Yes. Alongside the āyāt, you can enable authentic hadith from Sahih al-Bukhari and Sahih Muslim. Every āyah also has a tafsir explaining its meaning and context, one tap away.",
      q7: "What is the “Āyah of the day”?",
      a7: "Every day IqraTime highlights one āyah that is identical for all users, chosen deterministically from about 165 of the most recognized āyāt — with no server: the computation happens on your phone. Two devices show the same āyah on the same day, which makes it perfect for group sharing. It changes at local midnight and doesn't return until the full cycle is complete.",
      q8: "How does memorization (hifz) work?",
      a8: "You add an āyah to your memorization list, and the app schedules reviews at growing intervals: 1, 3, 7, 14, 30 then 60 days. At each review the reference is shown, you recite from memory, reveal the text and rate yourself — the app never judges your recitation, it only schedules. A lapse brings the āyah back to the start of the cycle, and a mastered āyah keeps being maintained every 60 days."
    },
    legal: {
      title: "Privacy Policy",
      updated: "Last updated: 25 August 2026",
      sumTitle: "Summary",
      sumText: "All your preferences, history, and favorites stay on your device. IqraTime requires no account and never sends this data to any server.",
      notTitle: "What IqraTime does not do",
      not1: "No account, no sign-up, no login, no user identifier of any kind.",
      not2: "No backend server for day-to-day operation.",
      not3: "No analytics SDK, no crash-reporting SDK, no advertising SDK.",
      not4: "No advertising identifier (IDFA/GAID) is read or generated.",
      not5: "No profiling, no behavioral tracking, no “personalization” beyond the themes and settings you explicitly pick.",
      not6: "No GPS or any other location access.",
      not7: "No access to contacts, microphone, or camera.",
      not8: "No synchronization of favorites, history, or preferences to any remote service.",
      not9: "No telemetry of any kind, hidden or otherwise.",
      storedTitle: "What is stored, and where",
      storedIntro: "Everything below lives <strong>only on the device</strong>, in a local database (SQLite) or in local preferences storage.",
      thData: "Data",
      thStore: "Storage",
      thUse: "Purpose",
      sPrefs: "Local storage",
      sDb: "Local database (SQLite)",
      d1: "Preferences (language, schedule, theme, etc.)",
      u1: "Remember your settings",
      d2: "Notification history / favorites",
      u2: "Show history and favorites, avoid repeats",
      d3: "Hidden āyāt",
      u3: "Respect the āyāt you chose to exclude",
      d4: "Scheduled notification slots",
      u4: "The sliding notification queue",
      d5: "Local error log",
      u5: "Diagnostics screen only — never transmitted",
      storedOutro: "Uninstalling the app deletes all of it. “Reset all local data” in Settings deletes all of it without uninstalling.",
      donateTitle: "Optional “Support IqraTime” donations",
      donateText: "If enabled, the Support screen opens a Stripe-hosted Payment Link in your device's system browser. IqraTime never sees, requests, stores, or transmits any payment data — no card number, no expiration date, no CVC, no Apple Pay/Google Pay account details, no bank details, no amount, no Stripe transaction history. That page is operated entirely by Stripe and governed by its own privacy policy, independent of IqraTime's.",
      formTitle: "Website contact form",
      formText: "If you use this website's contact form, the information you enter (email, and where provided your name, subject and message) is relayed by the FormSubmit service solely to deliver your message to us by email. It is used only to reply to you, is never sold or used for advertising, and is separate from the mobile app — which collects nothing at all.",
      depsTitle: "Third-party dependencies",
      depsText: "Every dependency was chosen partly on this criterion: does it collect data by default? None of the libraries used include a bundled analytics or tracking component. Notifications are scheduled exclusively on-device, with no remote push infrastructure.",
      contactTitle: "Contact",
      contactText: "For any question about this privacy policy:"
    },
    footer: {
      copyright: "© 2026 IqraTime. All rights reserved.",
      privacy: "Privacy Policy",
      home: "Home"
    }
  },
  ar: {
    meta: {
      title: "IqraTime — القرآن على شاشتك دون فتح القفل",
      description: "يرسل IqraTime إشعارًا بآية من القرآن أو حديث صحيح إلى شاشة القفل في الوقت الذي تختاره. تطبيق يعمل بدون إنترنت بالكامل، بدون حساب، بدون إعلانات."
    },
    nav: {
      features: "المزايا",
      privacy: "الخصوصية",
      similar: "مشاريع مشابهة",
      donate: "تبرّع",
      contact: "تواصل معنا"
    },
    hero: {
      kicker: "اقرأ — أول كلمة نزلت في القرآن الكريم",
      title: "ماذا لو كان لكل إشعار قيمة حقيقية؟",
      lead: "آية من القرآن أو حديث صحيح مختلف كل ساعة، مباشرة على شاشة القفل — مصدر للحسنات إن شاء الله، بدون حساب، بدون خادم، بدون حاجة للاتصال بالإنترنت في الاستخدام اليومي.",
      badgeIos: "📱 قريبًا على App Store",
      badgeAndroid: "🤖 قريبًا على Google Play"
    },
    phone: {
      translation: "",
      reference: "سورة البقرة، الآية 155"
    },
    features: {
      title: "آية، حديث، على إيقاعك",
      subtitle: "يتكيّف IqraTime مع عاداتك، لا العكس — أنت من يختار الوقت والتكرار واللغة.",
      f1: {
        title: "إشعارات مجدولة",
        desc: "آية من القرآن أو حديث صحيح، نص عربي و/أو ترجمة — بالترتيب الذي تفضله، خلال الأوقات التي تحددها."
      },
      f2: {
        title: "بدون إنترنت بالكامل",
        desc: "بدون حساب، بدون خادم، بدون إعلانات، بدون متتبعات. كل شيء يعمل على جهازك."
      },
      f3: {
        title: "12 لغة",
        desc: "العربية والفرنسية والإنجليزية والإسبانية والبرتغالية والهندية والبنغالية والصينية المبسطة والإيطالية والروسية والهولندية والألمانية — مع دعم كامل للكتابة من اليمين لليسار."
      },
      f4: {
        title: "جدول حسب رغبتك",
        desc: "ساعات النشاط، الأيام، التكرار (من ساعة إلى 12 ساعة)، أوقات ثابتة، صمت ليلي، وتنويع عشوائي اختياري."
      },
      f5: {
        title: "مواضيع روحانية",
        desc: "الصبر، الشكر، الأمل، الرحمة... وجّه الآيات التي تصلك، كل ذلك على جهازك فقط."
      },
      f6: {
        title: "المتابعة والمشاركة",
        desc: "السجل، المفضلة، سلسلة الأيام المتتالية، شاشة اكتشاف القرآن، والمشاركة كبطاقة مرئية — كل مشاركة هي أيضًا مصدر للحسنات إن شاء الله."
      },
      f7: {
        title: "أحاديث صحيحة وتفسير",
        desc: "صحيح البخاري وصحيح مسلم كمحتوى اختياري، مع تفسير (شرح المعنى والسياق) متاح لكل آية بضغطة واحدة."
      },
      f8: {
        title: "لحظة من أجلك",
        desc: "أخبرنا كيف تشعر — قلق، ممتن، تبحث عن توجيه... — واحصل على آية مختارة لهذه اللحظة بالذات، عند الطلب."
      },
      newBadge: "جديد",
      f9: {
        title: "☀️ آية اليوم",
        desc: "نفس الآية للجميع، كل يوم، تُختار من بين أكثر الآيات شهرة — بدون خادم ولا إنترنت: هاتفان يُقارنان في اليوم نفسه يعرضان الآية نفسها. مثالية للمشاركة الجماعية، تتغيّر عند منتصف الليل بالتوقيت المحلي ولا تتكرر قبل اكتمال الدورة كاملة."
      },
      f10: {
        title: "📿 الحفظ",
        desc: "تكرار متباعد بفواصل متزايدة — 1، 3، 7، 14، 30 ثم 60 يومًا: يظهر المرجع، تتلو من الذاكرة، تكشف النص، وتقيّم نفسك. النسيان يعيد الدورة من البداية، وما حفظته يبقى مُصانًا مدى الحياة — لا يُؤرشف أبدًا."
      }
    },
    privacy: {
      title: "خصوصيتك، مُحترمة بالتصميم",
      text: "بدون حساب، بدون تسجيل دخول، بدون خادم خلفي، بدون تحليلات، بدون إعلانات، بدون معرّف تتبّع. لا تغادر أي بيانات جهازك.",
      readMore: "اقرأ سياسة الخصوصية كاملة ←"
    },
    similar: {
      title: "مشاريع مشابهة",
      subtitle: "IqraTime جزء من مجموعة تطبيقات صممها نفس الفريق، بنفس المبادئ: بدون إنترنت، بدون حساب، بدون إعلانات.",
      featuredStatus: "المشروع القادم",
      featuredTitle: "تطبيق تعليمي — تعلّم الإسلام بمتعة",
      featuredDesc: "تطبيق ممتع يعمل بدون إنترنت لاكتشاف وتعلّم أساسيات الإسلام بمتعة، بنفس مبادئ IqraTime: بدون حساب، بدون إعلانات، بدون جمع بيانات.",
      featuredCta: "ادعم هذا المشروع",
      ideaStatus: "لديك فكرة؟",
      ideaTitle: "اقترح مشروعًا مشابهًا",
      ideaDesc: "لديك فكرة لتطبيق تذكير بنفس روح IqraTime؟ راسلنا — نحن دائمًا متحمسون للنقاش حول مشاريع جديدة."
    },
    donate: {
      title: "ادعم مشاريعنا",
      text: "IqraTime مجاني، يعمل بدون إنترنت، وبدون إعلانات — وسيبقى كذلك. تبرعاتك تساعد في تمويل تطويره المستمر ومشاريعنا القادمة، مثل التطبيق التعليمي لتعلّم الإسلام بمتعة.",
      cta: "تبرّع الآن",
      fineprint: "دفع آمن عبر Stripe. تبرّع طوعي بدون أي مقابل."
    },
    support: {
      title: "لديك سؤال أو مشكلة؟",
      text: "راسلنا عبر نموذج التواصل، أو مباشرة عبر البريد الإلكتروني.",
      cta: "تواصل معنا"
    },
    contact: {
      title: "تواصل معنا",
      subtitle: "سؤال، اقتراح، مشكلة تقنية؟ راسلنا — نرد شخصيًا على كل رسالة.",
      labelName: "الاسم",
      labelEmail: "البريد الإلكتروني",
      labelSubject: "الموضوع",
      labelMessage: "الرسالة",
      optional: "اختياري",
      required: "إلزامي",
      submit: "إرسال الرسالة",
      altText: "تفضّل مراسلتنا مباشرة؟",
      successTitle: "تم إرسال الرسالة!",
      successText: "شكرًا لك، لقد استلمنا رسالتك وسنرد عليك في أقرب وقت ممكن إن شاء الله.",
      backHome: "→ العودة إلى الصفحة الرئيسية"
    },
    nav2: {
      faq: "الأسئلة الشائعة"
    },
    share: {
      title: "شاركه، وضاعِف الحسنات",
      text: "أن تُعرِّف شخصًا تحبّه بـ IqraTime هو أن تزرع مصدر خير يستمر في العطاء، إن شاء الله.",
      whatsapp: "المشاركة عبر واتساب",
      telegram: "المشاركة عبر تيليجرام",
      x: "المشاركة على X",
      copy: "نسخ الرابط",
      copied: "تم نسخ الرابط!",
      message: "ماذا لو أتاك القرآن؟ آية أو حديث صحيح على شاشتك كل ساعة — بدون إنترنت، بدون حساب، بدون إعلانات:"
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "أكثر ما يسألنا عنه الناس حول IqraTime.",
      q1: "هل IqraTime مجاني فعلًا؟",
      a1: "نعم، مجاني بالكامل وبدون إعلانات — ولن يتغيّر ذلك. لا يوجد اشتراك، ولا ميزات مدفوعة، ولا حساب لإنشائه. التبرّعات اختيارية تمامًا ولا تفتح أي ميزة.",
      q2: "هل يعمل التطبيق بدون اتصال بالإنترنت؟",
      a2: "نعم. النصوص والترجمات وجدولة الإشعارات كلها مضمّنة داخل التطبيق. بعد التثبيت، لا يحتاج IqraTime إلى أي اتصال للاستخدام اليومي.",
      q3: "هل تُجمع أي من بياناتي الشخصية؟",
      a3: "لا شيء إطلاقًا. بدون حساب، بدون خادم، بدون تحليلات، بدون متتبعات، بدون معرّف إعلاني. مفضلتك وسجلّك وإعداداتك لا تغادر هاتفك أبدًا.",
      q4: "بأي لغات يتوفّر IqraTime؟",
      a4: "بـ 12 لغة: العربية والفرنسية والإنجليزية والإسبانية والبرتغالية والهندية والبنغالية والصينية المبسطة والإيطالية والروسية والهولندية والألمانية — مع دعم كامل للكتابة من اليمين إلى اليسار.",
      q5: "هل يمكنني اختيار وقت وصول الإشعارات؟",
      a5: "نعم، بالكامل. تحدّد ساعات النشاط وأيام الأسبوع والتكرار (من مرة كل ساعة إلى مرة كل 12 ساعة) وأوقاتًا ثابتة إن أردت، مع صمت ليلي تلقائي.",
      q6: "هل توجد أحاديث إلى جانب آيات القرآن؟",
      a6: "نعم. إلى جانب الآيات، يمكنك تفعيل الأحاديث الصحيحة من صحيح البخاري وصحيح مسلم. كما أن لكل آية تفسيرًا يوضّح معناها وسياقها بضغطة واحدة.",
      q7: "ما هي «آية اليوم»؟",
      a7: "كل يوم يُبرز IqraTime آية واحدة متطابقة لجميع المستخدمين، تُختار بطريقة حتمية من بين نحو 165 آية من أشهر الآيات — بدون خادم: تتم العملية على هاتفك. جهازان يعرضان نفس الآية في اليوم نفسه، ما يجعلها مثالية للمشاركة الجماعية. تتغيّر عند منتصف الليل بالتوقيت المحلي ولا تعود قبل اكتمال الدورة.",
      q8: "كيف يعمل الحفظ؟",
      a8: "تضيف آية إلى قائمة الحفظ، فيجدول التطبيق مراجعات بفواصل متزايدة: 1، 3، 7، 14، 30 ثم 60 يومًا. في كل مراجعة يظهر المرجع، تتلو من الذاكرة، تكشف النص وتقيّم نفسك — التطبيق لا يحكم على تلاوتك أبدًا، هو فقط يجدول. النسيان يعيد الآية إلى بداية الدورة، والآية المتقنة تبقى تُراجَع كل 60 يومًا."
    },
    legal: {
      title: "سياسة الخصوصية",
      updated: "آخر تحديث: 25 أغسطس 2026",
      sumTitle: "ملخّص",
      sumText: "تبقى جميع تفضيلاتك وسجلّك ومفضلاتك على جهازك. لا يتطلب IqraTime أي حساب ولا يرسل هذه البيانات إلى أي خادم.",
      notTitle: "ما لا يفعله IqraTime",
      not1: "بدون حساب، بدون تسجيل، بدون تسجيل دخول، بدون أي معرّف للمستخدم.",
      not2: "بدون خادم خلفي للتشغيل اليومي.",
      not3: "بدون أدوات تحليلات، بدون تقارير أعطال، بدون إعلانات.",
      not4: "لا تتم قراءة أو إنشاء أي معرّف إعلاني (IDFA/GAID).",
      not5: "بدون تصنيف، بدون تتبّع سلوكي، بدون «تخصيص» يتجاوز المواضيع والإعدادات التي تختارها بنفسك.",
      not6: "بدون وصول إلى GPS أو أي بيانات موقع أخرى.",
      not7: "بدون وصول إلى جهات الاتصال أو الميكروفون أو الكاميرا.",
      not8: "بدون مزامنة للمفضلة أو السجل أو التفضيلات مع أي خدمة عن بُعد.",
      not9: "بدون أي تتبّع تقني، ظاهر أو خفي.",
      storedTitle: "ما يُخزَّن، وأين",
      storedIntro: "كل ما يلي موجود <strong>على الجهاز فقط</strong>، في قاعدة بيانات محلية (SQLite) أو في تخزين التفضيلات المحلي.",
      thData: "البيانات",
      thStore: "التخزين",
      thUse: "الغرض",
      sPrefs: "تخزين محلي",
      sDb: "قاعدة بيانات محلية (SQLite)",
      d1: "التفضيلات (اللغة، الجدول، المظهر، إلخ)",
      u1: "تذكّر إعداداتك",
      d2: "سجل الإشعارات / المفضلة",
      u2: "عرض السجل والمفضلة وتجنّب التكرار",
      d3: "الآيات المخفية",
      u3: "احترام الآيات التي اخترت استبعادها",
      d4: "مواعيد الإشعارات المجدولة",
      u4: "قائمة الإشعارات المتحركة",
      d5: "سجل الأخطاء المحلي",
      u5: "شاشة التشخيص فقط — لا يُرسل أبدًا",
      storedOutro: "إلغاء تثبيت التطبيق يحذف كل ذلك. و«إعادة تعيين كل البيانات المحلية» في الإعدادات تحذف كل شيء دون إلغاء التثبيت.",
      donateTitle: "التبرّعات الاختيارية «ادعم IqraTime»",
      donateText: "عند التفعيل، تفتح شاشة الدعم رابط دفع مستضافًا لدى Stripe في متصفح النظام على جهازك. لا يرى IqraTime ولا يطلب ولا يخزّن ولا ينقل أي بيانات دفع — لا رقم بطاقة، ولا تاريخ انتهاء، ولا CVC، ولا تفاصيل حساب Apple Pay/Google Pay، ولا بيانات مصرفية، ولا مبلغ، ولا سجل معاملات Stripe. تُدار تلك الصفحة بالكامل من Stripe وتخضع لسياسة الخصوصية الخاصة بها، بشكل مستقل عن IqraTime.",
      formTitle: "نموذج التواصل في الموقع",
      formText: "إذا استخدمت نموذج التواصل في هذا الموقع، فإن المعلومات التي تُدخلها (البريد الإلكتروني، وعند توفرها الاسم والموضوع والرسالة) تُنقل عبر خدمة FormSubmit لغرض واحد فقط هو إيصال رسالتك إلينا بالبريد الإلكتروني. تُستخدم حصريًا للرد عليك، ولا تُباع أبدًا ولا تُستخدم لأغراض إعلانية، وهي منفصلة عن تطبيق الهاتف — الذي لا يجمع أي شيء إطلاقًا.",
      depsTitle: "الاعتماديات الخارجية",
      depsText: "اختيرت كل مكتبة بناءً على هذا المعيار أيضًا: هل تجمع بيانات افتراضيًا؟ لا تتضمن أي من المكتبات المستخدمة مكوّن تحليلات أو تتبّع. تُجدول الإشعارات على الجهاز حصريًا، دون أي بنية دفع عن بُعد.",
      contactTitle: "تواصل معنا",
      contactText: "لأي سؤال يتعلق بسياسة الخصوصية هذه:"
    },
    footer: {
      copyright: "© 2026 IqraTime. جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      home: "الرئيسية"
    }
  },
  de: {
    meta: {
      title: "IqraTime — Der Koran auf deinem Bildschirm, ohne zu entsperren",
      description: "IqraTime sendet eine Koran-Ayah- oder Hadith-Benachrichtigung auf deinen Sperrbildschirm, zur Uhrzeit deiner Wahl. 100 % offline, kein Konto, keine Werbung."
    },
    nav: {
      features: "Funktionen",
      privacy: "Datenschutz",
      similar: "Ähnliche Projekte",
      donate: "Spenden",
      contact: "Kontakt"
    },
    hero: {
      kicker: "اقرأ · Iqra — „Lies!“, das erste offenbarte Wort des Korans",
      title: "Was wäre, wenn jede Benachrichtigung wirklich zählte?",
      lead: "Stündlich eine andere Koran-Ayah oder ein authentischer Hadith, direkt auf deinem Sperrbildschirm — eine Quelle für Hassanat, inschaAllah, ohne Konto, ohne Server, ohne dass im Alltag eine Internetverbindung nötig ist.",
      badgeIos: "📱 Bald im App Store",
      badgeAndroid: "🤖 Bald bei Google Play"
    },
    phone: {
      translation: "„Und verkünde frohe Botschaft den Geduldigen.“",
      reference: "Sure Al-Baqara, 2:155"
    },
    features: {
      title: "Eine Ayah, ein Hadith, in deinem Rhythmus",
      subtitle: "IqraTime passt sich deinen Gewohnheiten an, nicht umgekehrt — du entscheidest, wann, wie oft und in welcher Sprache.",
      f1: {
        title: "Geplante Benachrichtigungen",
        desc: "Eine Koran-Ayah oder ein authentischer Hadith, arabischer Text und/oder Übersetzung — in der Reihenfolge deiner Wahl, zu den von dir festgelegten Zeiten."
      },
      f2: {
        title: "100 % offline",
        desc: "Kein Konto, kein Server, keine Werbung, kein Tracker. Alles läuft auf deinem Gerät."
      },
      f3: {
        title: "12 Sprachen",
        desc: "Arabisch, Französisch, Englisch, Spanisch, Portugiesisch, Hindi, Bengalisch, vereinfachtes Chinesisch, Italienisch, Russisch, Niederländisch, Deutsch — mit vollständiger RTL-Unterstützung für Arabisch."
      },
      f4: {
        title: "Individueller Zeitplan",
        desc: "Aktive Stunden, Tage, Häufigkeit (1 bis 12 Std.), feste Zeiten, Nachtruhe und eine optionale zufällige Variation."
      },
      f5: {
        title: "Spirituelle Themen",
        desc: "Geduld, Dankbarkeit, Hoffnung, Barmherzigkeit … steuere, welche Ayat du erhältst, ganz auf deinem Gerät."
      },
      f6: {
        title: "Verlauf &amp; Teilen",
        desc: "Verlauf, Favoriten, eine Tage-Serie, ein Koran-Entdeckungsbildschirm und Teilen als visuelle Karte — jedes Teilen ist auch eine Quelle für Hassanat, inschaAllah."
      },
      f7: {
        title: "Authentische Hadithe &amp; Tafsir",
        desc: "Sahih al-Bukhari und Sahih Muslim als optionaler Inhaltstyp, mit einem Tafsir (Bedeutung und Kontext) für jede Ayah, nur einen Fingertipp entfernt."
      },
      f8: {
        title: "Ein Moment für dich",
        desc: "Sag, wie du dich fühlst — ängstlich, dankbar, auf der Suche nach Orientierung … — und erhalte eine Ayah, die genau für diesen Moment gewählt wurde, auf Abruf."
      },
      newBadge: "Neu",
      f9: {
        title: "☀️ Ayah des Tages",
        desc: "Dieselbe Ayah für alle, jeden Tag, gewählt aus den bekanntesten Ayat — ohne Server, ohne Netz: Zwei Telefone zeigen am selben Tag dieselbe. Ideal zum Teilen in der Gruppe; sie wechselt um Mitternacht (Ortszeit) und wiederholt sich erst nach dem vollen Zyklus."
      },
      f10: {
        title: "📿 Auswendiglernen (Hifz)",
        desc: "Verteiltes Wiederholen mit wachsenden Intervallen — 1, 3, 7, 14, 30, dann 60 Tage: Die Referenz erscheint, du rezitierst aus dem Gedächtnis, deckst auf und bewertest dich selbst. Ein Aussetzer setzt den Zyklus zurück, und Gelerntes bleibt lebenslang gepflegt — nie archiviert."
      }
    },
    privacy: {
      title: "Deine Privatsphäre, von Anfang an respektiert",
      text: "Kein Konto, keine Anmeldung nötig, kein Backend, keine Analyse, keine Werbung, keine Tracking-ID. Es verlassen niemals Daten dein Gerät.",
      readMore: "Vollständige Datenschutzerklärung lesen →"
    },
    similar: {
      title: "Ähnliche Projekte",
      subtitle: "IqraTime gehört zu einer Familie von Apps desselben Teams, mit denselben Prinzipien: offline, ohne Konto, ohne Werbung.",
      featuredStatus: "Nächstes Projekt",
      featuredTitle: "Bildungs-App — den Islam spielerisch lernen",
      featuredDesc: "Eine spielerische Offline-App, um die Grundlagen des Islam spielerisch zu entdecken und zu lernen — nach denselben Prinzipien wie IqraTime: kein Konto, keine Werbung, keine Datenerhebung.",
      featuredCta: "Dieses Projekt unterstützen",
      ideaStatus: "Hast du eine Idee?",
      ideaTitle: "Schlage ein ähnliches Projekt vor",
      ideaDesc: "Eine Idee für eine Erinnerungs-App im Geiste von IqraTime? Schreib uns — wir sind immer neugierig auf neue Projektideen."
    },
    donate: {
      title: "Unterstütze unsere Projekte",
      text: "IqraTime ist kostenlos, offline und werbefrei — und das wird so bleiben. Deine Spenden helfen, die laufende Entwicklung sowie unsere kommenden Projekte zu finanzieren, wie die Bildungs-App zum spielerischen Erlernen des Islam.",
      cta: "Jetzt spenden",
      fineprint: "Sichere Zahlung über Stripe. Freiwillige Spende, ohne Gegenleistung."
    },
    support: {
      title: "Eine Frage, ein Problem?",
      text: "Schreib uns über unser Kontaktformular oder direkt per E-Mail.",
      cta: "Kontaktiere uns"
    },
    contact: {
      title: "Kontaktiere uns",
      subtitle: "Eine Frage, ein Vorschlag, ein technisches Problem? Schreib uns — wir beantworten jede Nachricht persönlich.",
      labelName: "Name",
      labelEmail: "E-Mail",
      labelSubject: "Betreff",
      labelMessage: "Nachricht",
      optional: "optional",
      required: "erforderlich",
      submit: "Nachricht senden",
      altText: "Schreibst du uns lieber direkt?",
      successTitle: "Nachricht gesendet!",
      successText: "Danke, wir haben deine Nachricht erhalten und melden uns so schnell wie möglich, inschaAllah.",
      backHome: "← Zurück zur Startseite"
    },
    nav2: {
      faq: "FAQ"
    },
    share: {
      title: "Teile es und vervielfache die Hassanat",
      text: "Jemandem, der dir wichtig ist, IqraTime zu zeigen, pflanzt eine Quelle des Guten, die weiter Früchte trägt, inschaAllah.",
      whatsapp: "Auf WhatsApp teilen",
      telegram: "Auf Telegram teilen",
      x: "Auf X teilen",
      copy: "Link kopieren",
      copied: "Link kopiert!",
      message: "Was wäre, wenn der Koran zu dir käme? Eine Ayah oder ein authentischer Hadith auf deinem Bildschirm, jede Stunde — offline, ohne Konto, ohne Werbung:"
    },
    faq: {
      title: "Häufige Fragen",
      subtitle: "Was uns am häufigsten zu IqraTime gefragt wird.",
      q1: "Ist IqraTime wirklich kostenlos?",
      a1: "Ja, vollständig kostenlos und werbefrei — und das bleibt so. Es gibt kein Abo, keine kostenpflichtige Funktion und kein Konto. Spenden sind völlig freiwillig und schalten nichts frei.",
      q2: "Funktioniert die App ohne Internetverbindung?",
      a2: "Ja. Textkorpus, Übersetzungen und die Benachrichtigungsplanung sind vollständig in der App enthalten. Nach der Installation braucht IqraTime im Alltag überhaupt keine Verbindung.",
      q3: "Werden persönliche Daten von mir erhoben?",
      a3: "Überhaupt keine. Kein Konto, kein Server, keine Analyse, kein Tracker, keine Werbe-ID. Deine Favoriten, dein Verlauf und deine Einstellungen verlassen niemals dein Telefon.",
      q4: "In welchen Sprachen ist IqraTime verfügbar?",
      a4: "In 12 Sprachen: Arabisch, Französisch, Englisch, Spanisch, Portugiesisch, Hindi, Bengalisch, vereinfachtes Chinesisch, Italienisch, Russisch, Niederländisch und Deutsch — mit vollständiger Rechts-nach-links-Unterstützung für Arabisch.",
      q5: "Kann ich wählen, wann ich Benachrichtigungen erhalte?",
      a5: "Ja, vollständig. Du legst die aktiven Stunden fest, die Wochentage, die Häufigkeit (von stündlich bis alle 12 Stunden), auf Wunsch feste Zeiten und eine automatische Nachtruhe.",
      q6: "Gibt es neben Koranversen auch Hadithe?",
      a6: "Ja. Neben den Ayat kannst du authentische Hadithe aus Sahih al-Bukhari und Sahih Muslim aktivieren. Zu jeder Ayah gibt es zudem einen Tafsir, der Bedeutung und Kontext erklärt — nur einen Fingertipp entfernt.",
      q7: "Was ist die „Ayah des Tages“?",
      a7: "Jeden Tag hebt IqraTime eine Ayah hervor, die für alle Nutzer identisch ist — deterministisch gewählt aus rund 165 der bekanntesten Ayat, ohne Server: Die Berechnung geschieht auf deinem Telefon. Zwei Geräte zeigen am selben Tag dieselbe Ayah, ideal zum Teilen in der Gruppe. Sie wechselt um Mitternacht (Ortszeit) und kehrt erst nach dem vollständigen Zyklus zurück.",
      q8: "Wie funktioniert das Auswendiglernen (Hifz)?",
      a8: "Du fügst eine Ayah deiner Lernliste hinzu, und die App plant Wiederholungen in wachsenden Abständen: 1, 3, 7, 14, 30, dann 60 Tage. Bei jeder Wiederholung erscheint die Referenz, du rezitierst aus dem Gedächtnis, deckst den Text auf und bewertest dich selbst — die App beurteilt deine Rezitation nie, sie plant nur. Ein Aussetzer bringt die Ayah an den Anfang zurück, und eine gemeisterte Ayah wird alle 60 Tage weiter gepflegt."
    },
    legal: {
      title: "Datenschutzerklärung",
      updated: "Zuletzt aktualisiert: 25. August 2026",
      sumTitle: "Zusammenfassung",
      sumText: "Alle deine Einstellungen, dein Verlauf und deine Favoriten bleiben auf deinem Gerät. IqraTime benötigt kein Konto und sendet diese Daten niemals an einen Server.",
      notTitle: "Was IqraTime nicht tut",
      not1: "Kein Konto, keine Registrierung, keine Anmeldung, keinerlei Nutzerkennung.",
      not2: "Kein Backend-Server für den täglichen Betrieb.",
      not3: "Kein Analyse-SDK, kein Absturzbericht-SDK, kein Werbe-SDK.",
      not4: "Es wird keine Werbe-ID (IDFA/GAID) gelesen oder erzeugt.",
      not5: "Kein Profiling, kein Verhaltens-Tracking, keine „Personalisierung“ über die von dir gewählten Themen und Einstellungen hinaus.",
      not6: "Kein GPS- oder sonstiger Standortzugriff.",
      not7: "Kein Zugriff auf Kontakte, Mikrofon oder Kamera.",
      not8: "Keine Synchronisierung von Favoriten, Verlauf oder Einstellungen mit einem entfernten Dienst.",
      not9: "Keinerlei Telemetrie, weder versteckt noch offen.",
      storedTitle: "Was gespeichert wird und wo",
      storedIntro: "Alles Folgende liegt <strong>ausschließlich auf dem Gerät</strong>, in einer lokalen Datenbank (SQLite) oder im lokalen Einstellungsspeicher.",
      thData: "Daten",
      thStore: "Speicher",
      thUse: "Zweck",
      sPrefs: "Lokaler Speicher",
      sDb: "Lokale Datenbank (SQLite)",
      d1: "Einstellungen (Sprache, Zeitplan, Design usw.)",
      u1: "Deine Einstellungen merken",
      d2: "Benachrichtigungsverlauf / Favoriten",
      u2: "Verlauf und Favoriten anzeigen, Wiederholungen vermeiden",
      d3: "Ausgeblendete Ayat",
      u3: "Die von dir ausgeschlossenen Ayat respektieren",
      d4: "Geplante Benachrichtigungs-Slots",
      u4: "Die gleitende Benachrichtigungs-Warteschlange",
      d5: "Lokales Fehlerprotokoll",
      u5: "Nur für den Diagnose-Bildschirm — wird nie übertragen",
      storedOutro: "Das Deinstallieren der App löscht all das. „Alle lokalen Daten zurücksetzen“ in den Einstellungen löscht alles, ohne zu deinstallieren.",
      donateTitle: "Optionale Spenden „IqraTime unterstützen“",
      donateText: "Wenn aktiviert, öffnet der Unterstützungs-Bildschirm einen von Stripe gehosteten Payment Link im Systembrowser deines Geräts. IqraTime sieht, erfragt, speichert und überträgt niemals Zahlungsdaten — keine Kartennummer, kein Ablaufdatum, keinen CVC, keine Apple-Pay-/Google-Pay-Kontodaten, keine Bankdaten, keinen Betrag, keine Stripe-Transaktionshistorie. Diese Seite wird vollständig von Stripe betrieben und unterliegt deren eigener Datenschutzerklärung, unabhängig von der von IqraTime.",
      formTitle: "Kontaktformular der Website",
      formText: "Wenn du das Kontaktformular dieser Website nutzt, werden die eingegebenen Angaben (E-Mail sowie ggf. Name, Betreff und Nachricht) über den Dienst FormSubmit ausschließlich weitergeleitet, um uns deine Nachricht per E-Mail zuzustellen. Sie dienen nur der Beantwortung, werden nie verkauft oder für Werbung genutzt und sind unabhängig von der mobilen App — die selbst gar nichts erhebt.",
      depsTitle: "Drittanbieter-Abhängigkeiten",
      depsText: "Jede Abhängigkeit wurde auch nach diesem Kriterium ausgewählt: Erhebt sie standardmäßig Daten? Keine der verwendeten Bibliotheken enthält eine integrierte Analyse- oder Tracking-Komponente. Benachrichtigungen werden ausschließlich lokal geplant, ohne Remote-Push-Infrastruktur.",
      contactTitle: "Kontakt",
      contactText: "Bei Fragen zu dieser Datenschutzerklärung:"
    },
    footer: {
      copyright: "© 2026 IqraTime. Alle Rechte vorbehalten.",
      privacy: "Datenschutzerklärung",
      home: "Startseite"
    }
  },
  es: {
    meta: {
      title: "IqraTime — El Corán en tu pantalla, sin desbloquear",
      description: "IqraTime envía una notificación con una aleya del Corán o un hadiz auténtico a tu pantalla de bloqueo, a la hora que elijas. Aplicación 100% sin conexión, sin cuenta, sin publicidad."
    },
    nav: {
      features: "Funciones",
      privacy: "Privacidad",
      similar: "Proyectos similares",
      donate: "Donar",
      contact: "Contacto"
    },
    hero: {
      kicker: "اقرأ · Iqra — «¡Lee!», la primera palabra revelada del Corán",
      title: "¿Y si cada notificación realmente importara?",
      lead: "Una aleya del Corán o un hadiz auténtico distinto cada hora, directamente en tu pantalla de bloqueo — una fuente de hasanat, inshaAllah, sin cuenta, sin servidor, sin necesidad de conexión a internet en el día a día.",
      badgeIos: "📱 Próximamente en App Store",
      badgeAndroid: "🤖 Próximamente en Google Play"
    },
    phone: {
      translation: "«Y anuncia buenas nuevas a los pacientes.»",
      reference: "Sura Al-Báqara, 2:155"
    },
    features: {
      title: "Una aleya, un hadiz, a tu ritmo",
      subtitle: "IqraTime se adapta a tus hábitos, no al revés — tú eliges cuándo, con qué frecuencia y en qué idioma.",
      f1: {
        title: "Notificaciones programadas",
        desc: "Una aleya del Corán o un hadiz auténtico, texto árabe y/o traducción — en el orden que prefieras, en las franjas horarias que definas."
      },
      f2: {
        title: "100% sin conexión",
        desc: "Sin cuenta, sin servidor, sin publicidad, sin rastreadores. Todo funciona en tu dispositivo."
      },
      f3: {
        title: "12 idiomas",
        desc: "Árabe, francés, inglés, español, portugués, hindi, bengalí, chino simplificado, italiano, ruso, neerlandés, alemán — con soporte RTL completo para el árabe."
      },
      f4: {
        title: "Horarios personalizados",
        desc: "Franja activa, días, frecuencia (de 1 a 12 h), horas fijas, silencio nocturno y una variación aleatoria opcional."
      },
      f5: {
        title: "Temas espirituales",
        desc: "Paciencia, gratitud, esperanza, misericordia… orienta las aleyas que recibes, todo desde tu dispositivo."
      },
      f6: {
        title: "Seguimiento y compartir",
        desc: "Historial, favoritos, una racha de días, una pantalla de descubrimiento del Corán y compartir como tarjeta visual — cada envío es también una fuente de hasanat, inshaAllah."
      },
      f7: {
        title: "Hadices auténticos y tafsir",
        desc: "Sahih al-Bujari y Sahih Muslim como contenido opcional, con un tafsir (significado y contexto) disponible para cada aleya, a un toque de distancia."
      },
      f8: {
        title: "Un momento para ti",
        desc: "Cuéntanos cómo te sientes — ansioso, agradecido, buscando guía… — y recibe una aleya elegida para ese momento exacto, cuando la necesites."
      },
      newBadge: "Nuevo",
      f9: {
        title: "☀️ Aleya del día",
        desc: "La misma aleya para todos, cada día, elegida entre las aleyas más reconocidas — sin servidor ni red: dos teléfonos comparados el mismo día muestran la misma. Ideal para compartir en grupo; cambia a medianoche (hora local) y no se repite hasta completar el ciclo entero."
      },
      f10: {
        title: "📿 Memorización (hifz)",
        desc: "Repetición espaciada con intervalos crecientes — 1, 3, 7, 14, 30 y luego 60 días: aparece la referencia, recitas de memoria, revelas y te autoevalúas. Un olvido reinicia el ciclo, y lo memorizado se mantiene de por vida — nunca se archiva."
      }
    },
    privacy: {
      title: "Tu privacidad, respetada por diseño",
      text: "Sin cuenta, sin necesidad de iniciar sesión, sin backend, sin analítica, sin publicidad, sin identificador de seguimiento. Ningún dato sale de tu dispositivo.",
      readMore: "Leer la política de privacidad completa →"
    },
    similar: {
      title: "Proyectos similares",
      subtitle: "IqraTime forma parte de una familia de aplicaciones creadas por el mismo equipo, con los mismos principios: sin conexión, sin cuenta, sin publicidad.",
      featuredStatus: "Próximo proyecto",
      featuredTitle: "Aplicación educativa — aprender islam divirtiéndose",
      featuredDesc: "Una aplicación lúdica y sin conexión para descubrir y aprender las bases del islam divirtiéndose, con los mismos principios que IqraTime: sin cuenta, sin publicidad, sin recopilación de datos.",
      featuredCta: "Apoyar este proyecto",
      ideaStatus: "¿Tienes una idea?",
      ideaTitle: "Propón un proyecto similar",
      ideaDesc: "¿Tienes una idea para una app de recordatorios con el mismo espíritu que IqraTime? Escríbenos — siempre nos interesa hablar de nuevos proyectos."
    },
    donate: {
      title: "Apoya nuestros proyectos",
      text: "IqraTime es gratuito, funciona sin conexión y sin publicidad — y seguirá siéndolo. Tus donaciones ayudan a financiar su desarrollo continuo, así como nuestros próximos proyectos, como la aplicación educativa para aprender islam divirtiéndose.",
      cta: "Donar",
      fineprint: "Pago seguro con Stripe. Donación voluntaria, sin contraprestación."
    },
    support: {
      title: "¿Alguna pregunta o problema?",
      text: "Escríbenos a través de nuestro formulario de contacto, o directamente por correo electrónico.",
      cta: "Contáctanos"
    },
    contact: {
      title: "Contáctanos",
      subtitle: "¿Una pregunta, una sugerencia, un problema técnico? Escríbenos — respondemos personalmente a cada mensaje.",
      labelName: "Nombre",
      labelEmail: "Correo electrónico",
      labelSubject: "Asunto",
      labelMessage: "Mensaje",
      optional: "opcional",
      required: "obligatorio",
      submit: "Enviar mensaje",
      altText: "¿Prefieres escribirnos directamente?",
      successTitle: "¡Mensaje enviado!",
      successText: "Gracias, hemos recibido tu mensaje y te responderemos lo antes posible, inshaAllah.",
      backHome: "← Volver al inicio"
    },
    nav2: {
      faq: "Preguntas frecuentes"
    },
    share: {
      title: "Compártelo y multiplica las hasanat",
      text: "Dar a conocer IqraTime a alguien que quieres es sembrar una fuente de bien que sigue dando frutos, inshaAllah.",
      whatsapp: "Compartir en WhatsApp",
      telegram: "Compartir en Telegram",
      x: "Compartir en X",
      copy: "Copiar enlace",
      copied: "¡Enlace copiado!",
      message: "¿Y si el Corán viniera a ti? Una aleya o un hadiz auténtico en tu pantalla, cada hora — sin conexión, sin cuenta, sin publicidad:"
    },
    faq: {
      title: "Preguntas frecuentes",
      subtitle: "Lo que más nos preguntan sobre IqraTime.",
      q1: "¿IqraTime es realmente gratuito?",
      a1: "Sí, totalmente gratuito y sin publicidad — y no va a cambiar. No hay suscripción, ni funciones de pago, ni cuenta que crear. Las donaciones son completamente opcionales y no desbloquean nada.",
      q2: "¿La aplicación funciona sin conexión a internet?",
      a2: "Sí. El corpus, las traducciones y la programación de notificaciones vienen incluidos en la aplicación. Una vez instalada, IqraTime no necesita ninguna conexión para el uso diario.",
      q3: "¿Se recopilan mis datos personales?",
      a3: "Ninguno en absoluto. Sin cuenta, sin servidor, sin analítica, sin rastreadores, sin identificador publicitario. Tus favoritos, tu historial y tus ajustes nunca salen de tu teléfono.",
      q4: "¿En qué idiomas está disponible IqraTime?",
      a4: "En 12 idiomas: árabe, francés, inglés, español, portugués, hindi, bengalí, chino simplificado, italiano, ruso, neerlandés y alemán — con soporte completo de escritura de derecha a izquierda para el árabe.",
      q5: "¿Puedo elegir a qué hora recibo las notificaciones?",
      a5: "Sí, por completo. Defines la franja horaria activa, los días de la semana, la frecuencia (de una vez por hora a una vez cada 12 horas), horas fijas si lo prefieres, y un silencio nocturno automático.",
      q6: "¿Hay hadices además de las aleyas del Corán?",
      a6: "Sí. Junto a las aleyas, puedes activar hadices auténticos de Sahih al-Bujari y Sahih Muslim. Cada aleya cuenta además con un tafsir que explica su significado y contexto, a un solo toque.",
      q7: "¿Qué es la «Aleya del día»?",
      a7: "Cada día IqraTime destaca una aleya idéntica para todos los usuarios, elegida de forma determinista entre unas 165 de las aleyas más reconocidas — sin servidor: el cálculo se hace en tu teléfono. Dos dispositivos muestran la misma aleya el mismo día, lo que la hace ideal para compartir en grupo. Cambia a medianoche, hora local, y no vuelve hasta completar el ciclo.",
      q8: "¿Cómo funciona la memorización (hifz)?",
      a8: "Añades una aleya a tu lista de memorización y la app programa repasos con intervalos crecientes: 1, 3, 7, 14, 30 y luego 60 días. En cada repaso se muestra la referencia, recitas de memoria, revelas el texto y te evalúas tú mismo — la app nunca juzga tu recitación, solo planifica. Un olvido devuelve la aleya al inicio del ciclo, y una aleya dominada se sigue manteniendo cada 60 días."
    },
    legal: {
      title: "Política de privacidad",
      updated: "Última actualización: 25 de agosto de 2026",
      sumTitle: "Resumen",
      sumText: "Todas tus preferencias, tu historial y tus favoritos permanecen en tu dispositivo. IqraTime no requiere ninguna cuenta y nunca envía estos datos a ningún servidor.",
      notTitle: "Lo que IqraTime no hace",
      not1: "Sin cuenta, sin registro, sin inicio de sesión, sin ningún identificador de usuario.",
      not2: "Sin servidor backend para el funcionamiento diario.",
      not3: "Sin SDK de analítica, de informes de fallos ni de publicidad.",
      not4: "No se lee ni se genera ningún identificador publicitario (IDFA/GAID).",
      not5: "Sin perfilado, sin seguimiento del comportamiento, sin «personalización» más allá de los temas y ajustes que elijas explícitamente.",
      not6: "Sin acceso al GPS ni a ningún otro dato de ubicación.",
      not7: "Sin acceso a los contactos, al micrófono ni a la cámara.",
      not8: "Sin sincronización de favoritos, historial o preferencias con ningún servicio remoto.",
      not9: "Sin telemetría de ningún tipo, oculta o no.",
      storedTitle: "Qué se almacena, y dónde",
      storedIntro: "Todo lo siguiente vive <strong>únicamente en el dispositivo</strong>, en una base de datos local (SQLite) o en el almacenamiento local de preferencias.",
      thData: "Dato",
      thStore: "Almacenamiento",
      thUse: "Finalidad",
      sPrefs: "Almacenamiento local",
      sDb: "Base de datos local (SQLite)",
      d1: "Preferencias (idioma, horarios, tema, etc.)",
      u1: "Recordar tus ajustes",
      d2: "Historial de notificaciones / favoritos",
      u2: "Mostrar el historial y los favoritos, evitar repeticiones",
      d3: "Aleyas ocultas",
      u3: "Respetar las aleyas que has elegido excluir",
      d4: "Franjas de notificación programadas",
      u4: "La cola deslizante de notificaciones",
      d5: "Registro de errores local",
      u5: "Solo para la pantalla de diagnóstico — nunca se transmite",
      storedOutro: "Desinstalar la aplicación elimina todo eso. «Restablecer todos los datos locales» en los Ajustes lo elimina todo sin desinstalar.",
      donateTitle: "Donaciones opcionales «Apoyar IqraTime»",
      donateText: "Si está activado, la pantalla de apoyo abre un Payment Link alojado por Stripe en el navegador del sistema de tu dispositivo. IqraTime nunca ve, solicita, almacena ni transmite ningún dato de pago — ningún número de tarjeta, ninguna fecha de caducidad, ningún CVC, ningún detalle de cuenta de Apple Pay/Google Pay, ningún dato bancario, ningún importe, ningún historial de transacciones de Stripe. Esa página está operada íntegramente por Stripe y se rige por su propia política de privacidad, independiente de la de IqraTime.",
      formTitle: "Formulario de contacto del sitio",
      formText: "Si utilizas el formulario de contacto de este sitio, la información que introduces (correo electrónico y, si los indicas, nombre, asunto y mensaje) se transmite mediante el servicio FormSubmit únicamente para hacernos llegar tu mensaje por correo electrónico. Se usa exclusivamente para responderte, nunca se vende ni se utiliza con fines publicitarios, y es independiente de la aplicación móvil, que no recopila nada.",
      depsTitle: "Dependencias de terceros",
      depsText: "Cada dependencia se eligió también según este criterio: ¿recopila datos por defecto? Ninguna de las bibliotecas utilizadas incluye un componente de analítica o de seguimiento. Las notificaciones se programan exclusivamente en el dispositivo, sin infraestructura de push remoto.",
      contactTitle: "Contacto",
      contactText: "Para cualquier pregunta sobre esta política de privacidad:"
    },
    footer: {
      copyright: "© 2026 IqraTime. Todos los derechos reservados.",
      privacy: "Política de privacidad",
      home: "Inicio"
    }
  },
  it: {
    meta: {
      title: "IqraTime — Il Corano sul tuo schermo, senza sbloccare",
      description: "IqraTime invia una notifica con un'ayah del Corano o un hadith autentico sulla schermata di blocco, all'ora che preferisci. App 100% offline, senza account, senza pubblicità."
    },
    nav: {
      features: "Funzionalità",
      privacy: "Privacy",
      similar: "Progetti simili",
      donate: "Dona",
      contact: "Contatto"
    },
    hero: {
      kicker: "اقرأ · Iqra — «Leggi!», la prima parola rivelata del Corano",
      title: "E se ogni notifica contasse davvero?",
      lead: "Un'ayah del Corano o un hadith autentico diverso ogni ora, direttamente sulla schermata di blocco — una fonte di hasanat, inshaAllah, senza account, senza server, senza bisogno di connessione a Internet nell'uso quotidiano.",
      badgeIos: "📱 Presto su App Store",
      badgeAndroid: "🤖 Presto su Google Play"
    },
    phone: {
      translation: "«E da' il lieto annuncio ai pazienti.»",
      reference: "Sura Al-Baqara, 2:155"
    },
    features: {
      title: "Un'ayah, un hadith, al tuo ritmo",
      subtitle: "IqraTime si adatta alle tue abitudini, non il contrario — scegli tu quando, con quale frequenza e in quale lingua.",
      f1: {
        title: "Notifiche programmate",
        desc: "Un'ayah del Corano o un hadith autentico, testo arabo e/o traduzione — nell'ordine che preferisci, nelle fasce orarie che imposti tu."
      },
      f2: {
        title: "100% offline",
        desc: "Nessun account, nessun server, nessuna pubblicità, nessun tracciamento. Tutto funziona sul tuo dispositivo."
      },
      f3: {
        title: "12 lingue",
        desc: "Arabo, francese, inglese, spagnolo, portoghese, hindi, bengalese, cinese semplificato, italiano, russo, olandese, tedesco — con supporto RTL completo per l'arabo."
      },
      f4: {
        title: "Orari personalizzati",
        desc: "Fascia attiva, giorni, frequenza (da 1 a 12 ore), orari fissi, silenzio notturno e una variazione casuale opzionale."
      },
      f5: {
        title: "Temi spirituali",
        desc: "Pazienza, gratitudine, speranza, misericordia… orienta le ayat che ricevi, tutto sul tuo dispositivo."
      },
      f6: {
        title: "Cronologia e condivisione",
        desc: "Cronologia, preferiti, una serie di giorni consecutivi, una schermata di scoperta del Corano e condivisione come card visiva — ogni condivisione è anche una fonte di hasanat, inshaAllah."
      },
      f7: {
        title: "Hadith autentici e tafsir",
        desc: "Sahih al-Bukhari e Sahih Muslim come contenuto opzionale, con un tafsir (significato e contesto) disponibile per ogni ayah, a portata di tap."
      },
      f8: {
        title: "Un momento per te",
        desc: "Dicci come ti senti — ansioso, grato, in cerca di guida… — e ricevi un'ayah scelta per quel momento preciso, su richiesta."
      },
      newBadge: "Novità",
      f9: {
        title: "☀️ Ayah del giorno",
        desc: "La stessa ayah per tutti, ogni giorno, scelta tra le ayat più riconosciute — senza server né rete: due telefoni confrontati lo stesso giorno mostrano la stessa. Ideale da condividere in gruppo; cambia a mezzanotte (ora locale) e non si ripete finché il ciclo non è completo."
      },
      f10: {
        title: "📿 Memorizzazione (hifz)",
        desc: "Ripetizione dilazionata con intervalli crescenti — 1, 3, 7, 14, 30 e poi 60 giorni: appare il riferimento, reciti a memoria, riveli e ti autovaluti. Una dimenticanza riporta all'inizio, e ciò che hai memorizzato resta mantenuto per sempre — mai archiviato."
      }
    },
    privacy: {
      title: "La tua privacy, rispettata per progettazione",
      text: "Nessun account, nessun accesso richiesto, nessun backend, nessuna analisi, nessuna pubblicità, nessun identificatore di tracciamento. Nessun dato lascia il tuo dispositivo.",
      readMore: "Leggi l'informativa sulla privacy completa →"
    },
    similar: {
      title: "Progetti simili",
      subtitle: "IqraTime fa parte di una famiglia di app pensate dallo stesso team, con gli stessi principi: offline, senza account, senza pubblicità.",
      featuredStatus: "Prossimo progetto",
      featuredTitle: "App educativa — imparare l'islam divertendosi",
      featuredDesc: "Un'app ludica e offline per scoprire e imparare le basi dell'islam divertendosi, con gli stessi principi di IqraTime: nessun account, nessuna pubblicità, nessun dato raccolto.",
      featuredCta: "Sostieni questo progetto",
      ideaStatus: "Hai un'idea?",
      ideaTitle: "Proponi un progetto simile",
      ideaDesc: "Un'idea per un'app di promemoria nello stesso spirito di IqraTime? Scrivici — siamo sempre curiosi di parlare di nuovi progetti."
    },
    donate: {
      title: "Sostieni i nostri progetti",
      text: "IqraTime è gratuito, offline e senza pubblicità — e lo rimarrà. Le tue donazioni aiutano a finanziare il suo sviluppo continuo e i nostri prossimi progetti, come l'app educativa per imparare l'islam divertendosi.",
      cta: "Dona ora",
      fineprint: "Pagamento sicuro tramite Stripe. Donazione volontaria, senza alcuna contropartita."
    },
    support: {
      title: "Una domanda, un problema?",
      text: "Scrivici tramite il nostro modulo di contatto, oppure direttamente via email.",
      cta: "Contattaci"
    },
    contact: {
      title: "Contattaci",
      subtitle: "Una domanda, un suggerimento, un problema tecnico? Scrivici — rispondiamo personalmente a ogni messaggio.",
      labelName: "Nome",
      labelEmail: "Email",
      labelSubject: "Oggetto",
      labelMessage: "Messaggio",
      optional: "facoltativo",
      required: "obbligatorio",
      submit: "Invia messaggio",
      altText: "Preferisci scriverci direttamente?",
      successTitle: "Messaggio inviato!",
      successText: "Grazie, abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile, inshaAllah.",
      backHome: "← Torna alla home"
    },
    nav2: {
      faq: "Domande frequenti"
    },
    share: {
      title: "Condividilo e moltiplica le hasanat",
      text: "Far conoscere IqraTime a una persona a cui tieni significa seminare una fonte di bene che continua a dare frutti, inshaAllah.",
      whatsapp: "Condividi su WhatsApp",
      telegram: "Condividi su Telegram",
      x: "Condividi su X",
      copy: "Copia il link",
      copied: "Link copiato!",
      message: "E se il Corano venisse da te? Un'ayah o un hadith autentico sul tuo schermo, ogni ora — offline, senza account, senza pubblicità:"
    },
    faq: {
      title: "Domande frequenti",
      subtitle: "Le cose che ci vengono chieste più spesso su IqraTime.",
      q1: "IqraTime è davvero gratuito?",
      a1: "Sì, completamente gratuito e senza pubblicità — e non cambierà. Non c'è alcun abbonamento, nessuna funzione a pagamento, nessun account da creare. Le donazioni sono del tutto facoltative e non sbloccano nulla.",
      q2: "L'app funziona senza connessione a internet?",
      a2: "Sì. Il corpus, le traduzioni e la programmazione delle notifiche sono tutti inclusi nell'app. Una volta installata, IqraTime non ha bisogno di alcuna connessione per l'uso quotidiano.",
      q3: "Vengono raccolti i miei dati personali?",
      a3: "Nessuno. Nessun account, nessun server, nessuna analisi, nessun tracciamento, nessun identificativo pubblicitario. I tuoi preferiti, la cronologia e le impostazioni non lasciano mai il tuo telefono.",
      q4: "In quali lingue è disponibile IqraTime?",
      a4: "In 12 lingue: arabo, francese, inglese, spagnolo, portoghese, hindi, bengalese, cinese semplificato, italiano, russo, olandese e tedesco — con pieno supporto della scrittura da destra a sinistra per l'arabo.",
      q5: "Posso scegliere a che ora ricevere le notifiche?",
      a5: "Sì, completamente. Imposti la fascia oraria attiva, i giorni della settimana, la frequenza (da una volta all'ora a una ogni 12 ore), orari fissi se preferisci, e un silenzio notturno automatico.",
      q6: "Ci sono hadith oltre ai versetti del Corano?",
      a6: "Sì. Accanto alle ayat puoi attivare hadith autentici da Sahih al-Bukhari e Sahih Muslim. Ogni ayah ha inoltre un tafsir che ne spiega significato e contesto, a portata di tap.",
      q7: "Che cos'è l'«Ayah del giorno»?",
      a7: "Ogni giorno IqraTime mette in evidenza un'ayah identica per tutti gli utenti, scelta in modo deterministico tra circa 165 delle ayat più riconosciute — senza server: il calcolo avviene sul tuo telefono. Due dispositivi mostrano la stessa ayah lo stesso giorno: ideale per la condivisione di gruppo. Cambia a mezzanotte, ora locale, e non torna prima della fine del ciclo completo.",
      q8: "Come funziona la memorizzazione (hifz)?",
      a8: "Aggiungi un'ayah alla tua lista di memorizzazione e l'app pianifica ripassi a intervalli crescenti: 1, 3, 7, 14, 30 e poi 60 giorni. A ogni ripasso appare il riferimento, reciti a memoria, riveli il testo e ti valuti da solo — l'app non giudica mai la tua recitazione, si limita a pianificare. Una dimenticanza riporta l'ayah all'inizio del ciclo, e un'ayah padroneggiata continua a essere mantenuta ogni 60 giorni."
    },
    legal: {
      title: "Informativa sulla privacy",
      updated: "Ultimo aggiornamento: 25 agosto 2026",
      sumTitle: "In sintesi",
      sumText: "Tutte le tue preferenze, la cronologia e i preferiti restano sul tuo dispositivo. IqraTime non richiede alcun account e non invia mai questi dati a nessun server.",
      notTitle: "Ciò che IqraTime non fa",
      not1: "Nessun account, nessuna registrazione, nessun accesso, nessun identificativo utente di alcun tipo.",
      not2: "Nessun server backend per il funzionamento quotidiano.",
      not3: "Nessun SDK di analisi, di segnalazione crash o pubblicitario.",
      not4: "Nessun identificativo pubblicitario (IDFA/GAID) viene letto o generato.",
      not5: "Nessuna profilazione, nessun tracciamento comportamentale, nessuna «personalizzazione» oltre ai temi e alle impostazioni che scegli esplicitamente.",
      not6: "Nessun accesso al GPS o ad altri dati di posizione.",
      not7: "Nessun accesso a contatti, microfono o fotocamera.",
      not8: "Nessuna sincronizzazione di preferiti, cronologia o impostazioni verso servizi remoti.",
      not9: "Nessuna telemetria di alcun tipo, nascosta o meno.",
      storedTitle: "Cosa viene memorizzato, e dove",
      storedIntro: "Tutto ciò che segue risiede <strong>solo sul dispositivo</strong>, in un database locale (SQLite) o nell'archivio locale delle preferenze.",
      thData: "Dato",
      thStore: "Archiviazione",
      thUse: "Finalità",
      sPrefs: "Archivio locale",
      sDb: "Database locale (SQLite)",
      d1: "Preferenze (lingua, orari, tema, ecc.)",
      u1: "Ricordare le tue impostazioni",
      d2: "Cronologia notifiche / preferiti",
      u2: "Mostrare cronologia e preferiti, evitare ripetizioni",
      d3: "Ayat nascoste",
      u3: "Rispettare le ayat che hai scelto di escludere",
      d4: "Slot di notifica programmati",
      u4: "La coda scorrevole delle notifiche",
      d5: "Registro errori locale",
      u5: "Solo per la schermata di diagnostica — mai trasmesso",
      storedOutro: "Disinstallare l'app elimina tutto. «Reimposta tutti i dati locali» nelle Impostazioni elimina tutto senza disinstallare.",
      donateTitle: "Donazioni facoltative «Sostieni IqraTime»",
      donateText: "Se attivo, la schermata di sostegno apre un Payment Link ospitato da Stripe nel browser di sistema del tuo dispositivo. IqraTime non vede, non richiede, non memorizza né trasmette mai alcun dato di pagamento — nessun numero di carta, nessuna data di scadenza, nessun CVC, nessun dettaglio di account Apple Pay/Google Pay, nessuna coordinata bancaria, nessun importo, nessuno storico transazioni Stripe. Quella pagina è gestita interamente da Stripe ed è regolata dalla sua informativa sulla privacy, indipendente da quella di IqraTime.",
      formTitle: "Modulo di contatto del sito",
      formText: "Se utilizzi il modulo di contatto di questo sito, le informazioni inserite (email e, se forniti, nome, oggetto e messaggio) vengono trasmesse tramite il servizio FormSubmit al solo scopo di recapitarci il tuo messaggio via email. Sono usate esclusivamente per risponderti, non vengono mai vendute né utilizzate a fini pubblicitari, e sono indipendenti dall'app mobile — che non raccoglie nulla.",
      depsTitle: "Dipendenze di terze parti",
      depsText: "Ogni dipendenza è stata scelta anche in base a questo criterio: raccoglie dati per impostazione predefinita? Nessuna delle librerie utilizzate include componenti di analisi o tracciamento. Le notifiche sono programmate esclusivamente sul dispositivo, senza infrastruttura di push remoto.",
      contactTitle: "Contatto",
      contactText: "Per qualsiasi domanda su questa informativa sulla privacy:"
    },
    footer: {
      copyright: "© 2026 IqraTime. Tutti i diritti riservati.",
      privacy: "Informativa sulla privacy",
      home: "Home"
    }
  },
  nl: {
    meta: {
      title: "IqraTime — De Koran op je scherm, zonder te ontgrendelen",
      description: "IqraTime stuurt een melding met een Koran-ayah of authentieke hadith naar je vergrendelscherm, op het tijdstip dat jij kiest. 100% offline app, geen account, geen advertenties."
    },
    nav: {
      features: "Functies",
      privacy: "Privacy",
      similar: "Vergelijkbare projecten",
      donate: "Doneren",
      contact: "Contact"
    },
    hero: {
      kicker: "اقرأ · Iqra — 'Lees!', het eerste geopenbaarde woord van de Koran",
      title: "Wat als elke melding echt zou tellen?",
      lead: "Elk uur een andere Koran-ayah of authentieke hadith, rechtstreeks op je vergrendelscherm — een bron van hasanat, inshaAllah, geen account, geen server, geen internetverbinding nodig in het dagelijks gebruik.",
      badgeIos: "📱 Binnenkort in de App Store",
      badgeAndroid: "🤖 Binnenkort op Google Play"
    },
    phone: {
      translation: "“En verkondig blijde tijding aan de geduldigen.”",
      reference: "Soera Al-Baqara, 2:155"
    },
    features: {
      title: "Een ayah, een hadith, op jouw ritme",
      subtitle: "IqraTime past zich aan jouw gewoontes aan, niet andersom — jij kiest wanneer, hoe vaak en in welke taal.",
      f1: {
        title: "Geplande meldingen",
        desc: "Een Koran-ayah of een authentieke hadith, Arabische tekst en/of vertaling — in de volgorde die jij verkiest, tijdens de tijdsblokken die je zelf instelt."
      },
      f2: {
        title: "100% offline",
        desc: "Geen account, geen server, geen advertenties, geen trackers. Alles werkt op je eigen toestel."
      },
      f3: {
        title: "12 talen",
        desc: "Arabisch, Frans, Engels, Spaans, Portugees, Hindi, Bengaals, vereenvoudigd Chinees, Italiaans, Russisch, Nederlands, Duits — met volledige RTL-ondersteuning voor Arabisch."
      },
      f4: {
        title: "Schema op maat",
        desc: "Actieve uren, dagen, frequentie (1 tot 12 uur), vaste tijden, nachtstilte en een optionele willekeurige variatie."
      },
      f5: {
        title: "Spirituele thema's",
        desc: "Geduld, dankbaarheid, hoop, barmhartigheid… stuur welke ayat je ontvangt, volledig op je eigen toestel."
      },
      f6: {
        title: "Voortgang &amp; delen",
        desc: "Geschiedenis, favorieten, een dagenreeks, een Koran-ontdekkingsscherm en delen als visuele kaart — elke share is ook een bron van hasanat, inshaAllah."
      },
      f7: {
        title: "Authentieke hadith &amp; tafsir",
        desc: "Sahih al-Bukhari en Sahih Muslim als optioneel content type, met een tafsir (betekenis en context) beschikbaar bij elke ayah, met één tik."
      },
      f8: {
        title: "Een moment voor jou",
        desc: "Vertel hoe je je voelt — angstig, dankbaar, op zoek naar houvast… — en ontvang een ayah gekozen voor dat exacte moment, op aanvraag."
      },
      newBadge: "Nieuw",
      f9: {
        title: "☀️ Ayah van de dag",
        desc: "Dezelfde ayah voor iedereen, elke dag, gekozen uit de bekendste ayat — zonder server of netwerk: twee telefoons tonen op dezelfde dag dezelfde. Ideaal om in groep te delen; ze wisselt om middernacht (lokale tijd) en herhaalt zich pas na een volledige cyclus."
      },
      f10: {
        title: "📿 Memorisatie (hifz)",
        desc: "Gespreide herhaling met groeiende intervallen — 1, 3, 7, 14, 30 en dan 60 dagen: de referentie verschijnt, je reciteert uit het hoofd, onthult en beoordeelt jezelf. Een vergissing start de cyclus opnieuw, en wat je hebt gememoriseerd blijft levenslang onderhouden — nooit gearchiveerd."
      }
    },
    privacy: {
      title: "Jouw privacy, gerespecteerd door ontwerp",
      text: "Geen account, geen inloggen nodig, geen backend, geen analytics, geen advertenties, geen tracking-ID. Er verlaten nooit gegevens je toestel.",
      readMore: "Lees het volledige privacybeleid →"
    },
    similar: {
      title: "Vergelijkbare projecten",
      subtitle: "IqraTime maakt deel uit van een familie apps van hetzelfde team, met dezelfde principes: offline, geen account, geen advertenties.",
      featuredStatus: "Volgend project",
      featuredTitle: "Educatieve app — de islam leren terwijl je plezier hebt",
      featuredDesc: "Een speelse offline-app om de basis van de islam op een leuke manier te ontdekken en te leren, met dezelfde principes als IqraTime: geen account, geen advertenties, geen verzamelde gegevens.",
      featuredCta: "Steun dit project",
      ideaStatus: "Heb je een idee?",
      ideaTitle: "Stel een vergelijkbaar project voor",
      ideaDesc: "Een idee voor een herinnerings-app in dezelfde geest als IqraTime? Schrijf ons — we praten graag over nieuwe projecten."
    },
    donate: {
      title: "Steun onze projecten",
      text: "IqraTime is gratis, offline en zonder advertenties — en dat blijft zo. Jouw donaties helpen de verdere ontwikkeling te financieren, evenals onze volgende projecten, zoals de educatieve app om de islam te leren terwijl je plezier hebt.",
      cta: "Doneer nu",
      fineprint: "Veilige betaling via Stripe. Vrijwillige donatie, zonder tegenprestatie."
    },
    support: {
      title: "Een vraag of een probleem?",
      text: "Schrijf ons via ons contactformulier, of rechtstreeks per e-mail.",
      cta: "Neem contact op"
    },
    contact: {
      title: "Neem contact op",
      subtitle: "Een vraag, een suggestie, een technisch probleem? Schrijf ons — we beantwoorden elk bericht persoonlijk.",
      labelName: "Naam",
      labelEmail: "E-mail",
      labelSubject: "Onderwerp",
      labelMessage: "Bericht",
      optional: "optioneel",
      required: "verplicht",
      submit: "Bericht verzenden",
      altText: "Schrijf je ons liever rechtstreeks?",
      successTitle: "Bericht verzonden!",
      successText: "Bedankt, we hebben je bericht ontvangen en reageren zo snel mogelijk, inshaAllah.",
      backHome: "← Terug naar home"
    },
    nav2: {
      faq: "Veelgestelde vragen"
    },
    share: {
      title: "Deel het en vermenigvuldig de hasanat",
      text: "Iemand die je dierbaar is kennis laten maken met IqraTime plant een bron van goedheid die vrucht blijft dragen, inshaAllah.",
      whatsapp: "Delen op WhatsApp",
      telegram: "Delen op Telegram",
      x: "Delen op X",
      copy: "Link kopiëren",
      copied: "Link gekopieerd!",
      message: "Wat als de Koran naar jou toe kwam? Een ayah of authentieke hadith op je scherm, elk uur — offline, geen account, geen advertenties:"
    },
    faq: {
      title: "Veelgestelde vragen",
      subtitle: "Wat mensen ons het vaakst vragen over IqraTime.",
      q1: "Is IqraTime echt gratis?",
      a1: "Ja, volledig gratis en zonder advertenties — en dat blijft zo. Er is geen abonnement, geen betaalde functie en geen account nodig. Donaties zijn volledig vrijwillig en ontgrendelen niets.",
      q2: "Werkt de app zonder internetverbinding?",
      a2: "Ja. Het corpus, de vertalingen en de meldingsplanning zitten allemaal in de app zelf. Na installatie heeft IqraTime voor dagelijks gebruik geen enkele verbinding nodig.",
      q3: "Worden mijn persoonlijke gegevens verzameld?",
      a3: "Helemaal geen. Geen account, geen server, geen analytics, geen trackers, geen advertentie-ID. Je favorieten, geschiedenis en instellingen verlaten nooit je telefoon.",
      q4: "In welke talen is IqraTime beschikbaar?",
      a4: "In 12 talen: Arabisch, Frans, Engels, Spaans, Portugees, Hindi, Bengaals, vereenvoudigd Chinees, Italiaans, Russisch, Nederlands en Duits — met volledige ondersteuning voor rechts-naar-links schrift voor het Arabisch.",
      q5: "Kan ik kiezen wanneer ik meldingen ontvang?",
      a5: "Ja, volledig. Je bepaalt de actieve uren, de dagen van de week, de frequentie (van elk uur tot elke 12 uur), vaste tijden als je dat liever hebt, en een automatische nachtstilte.",
      q6: "Zijn er naast Koranverzen ook hadith?",
      a6: "Ja. Naast de ayat kun je authentieke hadith uit Sahih al-Bukhari en Sahih Muslim inschakelen. Elke ayah heeft bovendien een tafsir die betekenis en context uitlegt, met één tik beschikbaar.",
      q7: "Wat is de «Ayah van de dag»?",
      a7: "Elke dag zet IqraTime één ayah in de kijker die voor alle gebruikers identiek is, deterministisch gekozen uit ongeveer 165 van de bekendste ayat — zonder server: de berekening gebeurt op je telefoon. Twee toestellen tonen op dezelfde dag dezelfde ayah, ideaal om in groep te delen. Ze wisselt om middernacht, lokale tijd, en keert pas terug na de volledige cyclus.",
      q8: "Hoe werkt memorisatie (hifz)?",
      a8: "Je voegt een ayah toe aan je memorisatielijst en de app plant herhalingen met groeiende intervallen: 1, 3, 7, 14, 30 en dan 60 dagen. Bij elke herhaling verschijnt de referentie, je reciteert uit het hoofd, onthult de tekst en beoordeelt jezelf — de app beoordeelt je recitatie nooit, ze plant alleen. Een vergissing brengt de ayah terug naar het begin, en een beheerste ayah blijft elke 60 dagen onderhouden."
    },
    legal: {
      title: "Privacybeleid",
      updated: "Laatst bijgewerkt: 25 augustus 2026",
      sumTitle: "Samenvatting",
      sumText: "Al je voorkeuren, geschiedenis en favorieten blijven op je toestel. IqraTime vereist geen account en stuurt deze gegevens nooit naar een server.",
      notTitle: "Wat IqraTime niet doet",
      not1: "Geen account, geen registratie, geen login, geen enkele gebruikers-ID.",
      not2: "Geen backend-server voor de dagelijkse werking.",
      not3: "Geen analytics-SDK, geen crashrapportage-SDK, geen advertentie-SDK.",
      not4: "Er wordt geen advertentie-ID (IDFA/GAID) gelezen of aangemaakt.",
      not5: "Geen profilering, geen gedragstracking, geen „personalisatie” buiten de thema's en instellingen die je zelf kiest.",
      not6: "Geen toegang tot gps of andere locatiegegevens.",
      not7: "Geen toegang tot contacten, microfoon of camera.",
      not8: "Geen synchronisatie van favorieten, geschiedenis of voorkeuren met een externe dienst.",
      not9: "Geen enkele vorm van telemetrie, verborgen of niet.",
      storedTitle: "Wat wordt opgeslagen, en waar",
      storedIntro: "Alles hieronder staat <strong>uitsluitend op het toestel</strong>, in een lokale database (SQLite) of in de lokale voorkeursopslag.",
      thData: "Gegevens",
      thStore: "Opslag",
      thUse: "Doel",
      sPrefs: "Lokale opslag",
      sDb: "Lokale database (SQLite)",
      d1: "Voorkeuren (taal, schema, thema, enz.)",
      u1: "Je instellingen onthouden",
      d2: "Meldingsgeschiedenis / favorieten",
      u2: "Geschiedenis en favorieten tonen, herhaling vermijden",
      d3: "Verborgen ayat",
      u3: "De ayat respecteren die je hebt uitgesloten",
      d4: "Geplande meldingsmomenten",
      u4: "De schuivende meldingswachtrij",
      d5: "Lokaal foutenlogboek",
      u5: "Alleen voor het diagnosescherm — wordt nooit verzonden",
      storedOutro: "De app verwijderen wist dit alles. „Alle lokale gegevens resetten” in de Instellingen wist alles zonder de app te verwijderen.",
      donateTitle: "Optionele donaties „Steun IqraTime”",
      donateText: "Indien ingeschakeld opent het ondersteuningsscherm een door Stripe gehoste Payment Link in de systeembrowser van je toestel. IqraTime ziet, vraagt, bewaart of verzendt nooit betaalgegevens — geen kaartnummer, geen vervaldatum, geen CVC, geen Apple Pay-/Google Pay-accountgegevens, geen bankgegevens, geen bedrag, geen Stripe-transactiegeschiedenis. Die pagina wordt volledig door Stripe beheerd en valt onder hun eigen privacybeleid, los van dat van IqraTime.",
      formTitle: "Contactformulier van de website",
      formText: "Als je het contactformulier van deze website gebruikt, worden de gegevens die je invult (e-mail en, indien opgegeven, naam, onderwerp en bericht) via de dienst FormSubmit doorgestuurd met als enig doel je bericht per e-mail bij ons te bezorgen. Ze worden uitsluitend gebruikt om je te antwoorden, worden nooit verkocht of voor advertenties gebruikt, en staan los van de mobiele app — die zelf niets verzamelt.",
      depsTitle: "Afhankelijkheden van derden",
      depsText: "Elke afhankelijkheid is mede gekozen op dit criterium: verzamelt ze standaard gegevens? Geen van de gebruikte bibliotheken bevat een ingebouwde analytics- of trackingcomponent. Meldingen worden uitsluitend op het toestel ingepland, zonder externe push-infrastructuur.",
      contactTitle: "Contact",
      contactText: "Voor vragen over dit privacybeleid:"
    },
    footer: {
      copyright: "© 2026 IqraTime. Alle rechten voorbehouden.",
      privacy: "Privacybeleid",
      home: "Home"
    }
  }
};
