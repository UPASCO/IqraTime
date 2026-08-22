(function () {
  "use strict";

  var SUPPORTED = ["fr", "en", "ar", "de", "es", "it", "nl"];
  var DEFAULT_LANG = "fr";
  var RTL_LANGS = ["ar"];
  var STORAGE_KEY = "iqratime-lang";

  var translations = {
    fr: {
      meta: {
        title: "Iqratime — Le Coran sur votre écran, sans déverrouiller",
        description: "Iqratime envoie une notification d'āyah du Coran à votre écran verrouillé, à l'heure de votre choix. Application 100% hors-ligne, sans compte, sans publicité."
      },
      nav: { features: "Fonctionnalités", privacy: "Confidentialité", similar: "Projets similaires", donate: "Faire un don", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — « Lis ! », premier mot révélé du Coran",
        title: "Et si le Coran venait à vous ?",
        lead: "Une notification d'āyah différente par heure, directement sur votre écran verrouillé — sans compte, sans serveur, sans connexion Internet nécessaire au quotidien.",
        badgeIos: "📱 Bientôt sur l'App Store",
        badgeAndroid: "🤖 Bientôt sur Google Play"
      },
      phone: { translation: "« Et fais bonne annonce aux endurants. »", reference: "Sourate Al-Baqarah, 2:155" },
      features: {
        title: "Une āyah, à votre rythme",
        subtitle: "Iqratime s'adapte à vos habitudes plutôt que l'inverse — vous choisissez quand, à quelle fréquence, et dans quelle langue.",
        f1: { title: "Notifications programmées", desc: "Texte arabe, traduction, ou les deux — selon l'ordre que vous préférez, sur les plages horaires que vous définissez." },
        f2: { title: "100% hors-ligne", desc: "Aucun compte, aucun serveur, aucune publicité, aucun traqueur. Tout fonctionne sur votre appareil." },
        f3: { title: "10 langues", desc: "Arabe, français, anglais, espagnol, portugais, hindi, bengali, chinois simplifié, italien, russe — avec support RTL complet pour l'arabe." },
        f4: { title: "Horaires sur mesure", desc: "Plage active, jours, fréquence (1h à 12h), heures fixes, silence nocturne, et une variation aléatoire optionnelle." },
        f5: { title: "Thèmes spirituels", desc: "Patience, gratitude, espoir, miséricorde… orientez les āyāt que vous recevez, entièrement sur l'appareil." },
        f6: { title: "Historique &amp; favoris", desc: "Retrouvez, partagez et copiez les āyāt reçues. Demandez-en une autre à tout moment." }
      },
      privacy: {
        title: "Votre vie privée, respectée par conception",
        text: "Aucun compte, aucune connexion requise, aucun backend, aucune analytique, aucune publicité, aucun identifiant de suivi. Aucune donnée ne quitte votre appareil."
      },
      similar: {
        title: "Projets similaires",
        subtitle: "Iqratime fait partie d'une famille d'applications pensées par la même équipe, avec les mêmes principes : hors-ligne, sans compte, sans publicité.",
        featuredStatus: "Prochain projet",
        featuredTitle: "Application éducative — apprendre l'islam en s'amusant",
        featuredDesc: "Une application ludique et hors-ligne pour découvrir et apprendre les bases de l'islam en s'amusant, avec les mêmes principes qu'Iqratime : aucun compte, aucune publicité, aucune donnée collectée.",
        featuredCta: "Soutenir ce projet",
        ideaStatus: "Vous avez une idée ?",
        ideaTitle: "Proposez un projet similaire",
        ideaDesc: "Une idée d'application de rappel, dans le même esprit qu'Iqratime ? Écrivez-nous — nous sommes toujours curieux d'échanger sur de nouveaux projets."
      },
      donate: {
        title: "Soutenir nos projets",
        text: "Iqratime est gratuit, hors-ligne et sans publicité — et le restera. Vos dons aident à financer son développement continu ainsi que nos prochains projets, comme l'application éducative pour apprendre l'islam en s'amusant.",
        cta: "Faire un don",
        fineprint: "Paiement sécurisé par Stripe. Don volontaire, sans contrepartie."
      },
      support: { title: "Une question, un problème ?", text: "Notre équipe support est joignable directement par email." },
      footer: { copyright: "© 2026 Iqratime. Tous droits réservés." }
    },
    en: {
      meta: {
        title: "Iqratime — The Quran on your screen, without unlocking",
        description: "Iqratime sends a Quran āyah notification to your lock screen, at the time you choose. 100% offline app, no account, no ads."
      },
      nav: { features: "Features", privacy: "Privacy", similar: "Similar projects", donate: "Donate", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — “Read!”, the first word revealed in the Quran",
        title: "What if the Quran came to you?",
        lead: "A different āyah notification every hour, straight to your lock screen — no account, no server, no internet connection needed day to day.",
        badgeIos: "📱 Coming soon on the App Store",
        badgeAndroid: "🤖 Coming soon on Google Play"
      },
      phone: { translation: "“And give good tidings to the patient.”", reference: "Surah Al-Baqarah, 2:155" },
      features: {
        title: "An āyah, at your pace",
        subtitle: "Iqratime adapts to your habits, not the other way around — you choose when, how often, and in which language.",
        f1: { title: "Scheduled notifications", desc: "Arabic text, translation, or both — in the order you prefer, during the time slots you set." },
        f2: { title: "100% offline", desc: "No account, no server, no ads, no tracker. Everything runs on your device." },
        f3: { title: "10 languages", desc: "Arabic, French, English, Spanish, Portuguese, Hindi, Bengali, Simplified Chinese, Italian, Russian — with full RTL support for Arabic." },
        f4: { title: "Custom schedule", desc: "Active hours, days, frequency (1h to 12h), fixed times, night silence, and an optional random variation." },
        f5: { title: "Spiritual themes", desc: "Patience, gratitude, hope, mercy… guide which āyāt you receive, entirely on your device." },
        f6: { title: "History &amp; favorites", desc: "Find, share, and copy the āyāt you've received. Ask for another one anytime." }
      },
      privacy: {
        title: "Your privacy, respected by design",
        text: "No account, no login required, no backend, no analytics, no ads, no tracking identifier. No data ever leaves your device."
      },
      similar: {
        title: "Similar projects",
        subtitle: "Iqratime is part of a family of apps designed by the same team, built on the same principles: offline, no account, no ads.",
        featuredStatus: "Next project",
        featuredTitle: "Educational app — learning Islam while having fun",
        featuredDesc: "A playful, offline app to discover and learn the basics of Islam while having fun, built on the same principles as Iqratime: no account, no ads, no data collected.",
        featuredCta: "Support this project",
        ideaStatus: "Got an idea?",
        ideaTitle: "Suggest a similar project",
        ideaDesc: "An idea for a reminder app, in the same spirit as Iqratime? Write to us — we're always curious to talk about new projects."
      },
      donate: {
        title: "Support our projects",
        text: "Iqratime is free, offline, and ad-free — and it will stay that way. Your donations help fund its ongoing development as well as our upcoming projects, like the educational app for learning Islam while having fun.",
        cta: "Donate",
        fineprint: "Secure payment via Stripe. Voluntary donation, no benefit granted."
      },
      support: { title: "A question, an issue?", text: "Our support team is reachable directly by email." },
      footer: { copyright: "© 2026 Iqratime. All rights reserved." }
    },
    ar: {
      meta: {
        title: "Iqratime — القرآن على شاشتك دون فتح القفل",
        description: "يرسل إقرأتايم إشعارًا بآية من القرآن إلى شاشة القفل في الوقت الذي تختاره. تطبيق يعمل بدون إنترنت بالكامل، بدون حساب، بدون إعلانات."
      },
      nav: { features: "المزايا", privacy: "الخصوصية", similar: "مشاريع مشابهة", donate: "تبرّع", contact: "تواصل معنا" },
      hero: {
        kicker: "اقرأ — أول كلمة نزلت في القرآن الكريم",
        title: "ماذا لو أتاك القرآن؟",
        lead: "إشعار بآية مختلفة كل ساعة، مباشرة على شاشة القفل — بدون حساب، بدون خادم، بدون حاجة للاتصال بالإنترنت في الاستخدام اليومي.",
        badgeIos: "📱 قريبًا على App Store",
        badgeAndroid: "🤖 قريبًا على Google Play"
      },
      phone: { translation: "", reference: "سورة البقرة، الآية 155" },
      features: {
        title: "آية على إيقاعك",
        subtitle: "يتكيّف إقرأتايم مع عاداتك، لا العكس — أنت من يختار الوقت والتكرار واللغة.",
        f1: { title: "إشعارات مجدولة", desc: "نص عربي، ترجمة، أو كلاهما — بالترتيب الذي تفضله، خلال الأوقات التي تحددها." },
        f2: { title: "بدون إنترنت بالكامل", desc: "بدون حساب، بدون خادم، بدون إعلانات، بدون متتبعات. كل شيء يعمل على جهازك." },
        f3: { title: "10 لغات", desc: "العربية والفرنسية والإنجليزية والإسبانية والبرتغالية والهندية والبنغالية والصينية المبسطة والإيطالية والروسية — مع دعم كامل للكتابة من اليمين لليسار." },
        f4: { title: "جدول حسب رغبتك", desc: "ساعات النشاط، الأيام، التكرار (من ساعة إلى 12 ساعة)، أوقات ثابتة، صمت ليلي، وتنويع عشوائي اختياري." },
        f5: { title: "مواضيع روحانية", desc: "الصبر، الشكر، الأمل، الرحمة... وجّه الآيات التي تصلك، كل ذلك على جهازك فقط." },
        f6: { title: "السجل والمفضلة", desc: "استرجع الآيات التي وصلتك وشاركها وانسخها. اطلب آية أخرى في أي وقت." }
      },
      privacy: {
        title: "خصوصيتك، مُحترمة بالتصميم",
        text: "بدون حساب، بدون تسجيل دخول، بدون خادم خلفي، بدون تحليلات، بدون إعلانات، بدون معرّف تتبّع. لا تغادر أي بيانات جهازك."
      },
      similar: {
        title: "مشاريع مشابهة",
        subtitle: "إقرأتايم جزء من مجموعة تطبيقات صممها نفس الفريق، بنفس المبادئ: بدون إنترنت، بدون حساب، بدون إعلانات.",
        featuredStatus: "المشروع القادم",
        featuredTitle: "تطبيق تعليمي — تعلّم الإسلام بمتعة",
        featuredDesc: "تطبيق ممتع يعمل بدون إنترنت لاكتشاف وتعلّم أساسيات الإسلام بمتعة، بنفس مبادئ إقرأتايم: بدون حساب، بدون إعلانات، بدون جمع بيانات.",
        featuredCta: "ادعم هذا المشروع",
        ideaStatus: "لديك فكرة؟",
        ideaTitle: "اقترح مشروعًا مشابهًا",
        ideaDesc: "لديك فكرة لتطبيق تذكير بنفس روح إقرأتايم؟ راسلنا — نحن دائمًا متحمسون للنقاش حول مشاريع جديدة."
      },
      donate: {
        title: "ادعم مشاريعنا",
        text: "إقرأتايم مجاني، يعمل بدون إنترنت، وبدون إعلانات — وسيبقى كذلك. تبرعاتك تساعد في تمويل تطويره المستمر ومشاريعنا القادمة، مثل التطبيق التعليمي لتعلّم الإسلام بمتعة.",
        cta: "تبرّع الآن",
        fineprint: "دفع آمن عبر Stripe. تبرّع طوعي بدون أي مقابل."
      },
      support: { title: "لديك سؤال أو مشكلة؟", text: "يمكنك التواصل مع فريق الدعم مباشرة عبر البريد الإلكتروني." },
      footer: { copyright: "© 2026 إقرأتايم. جميع الحقوق محفوظة." }
    },
    de: {
      meta: {
        title: "Iqratime — Der Koran auf deinem Bildschirm, ohne zu entsperren",
        description: "Iqratime sendet eine Koran-Ayah-Benachrichtigung auf deinen Sperrbildschirm, zur Uhrzeit deiner Wahl. 100 % offline, kein Konto, keine Werbung."
      },
      nav: { features: "Funktionen", privacy: "Datenschutz", similar: "Ähnliche Projekte", donate: "Spenden", contact: "Kontakt" },
      hero: {
        kicker: "اقرأ · Iqra — „Lies!“, das erste offenbarte Wort des Korans",
        title: "Was wäre, wenn der Koran zu dir käme?",
        lead: "Stündlich eine andere Ayah-Benachrichtigung, direkt auf deinem Sperrbildschirm — ohne Konto, ohne Server, ohne dass im Alltag eine Internetverbindung nötig ist.",
        badgeIos: "📱 Bald im App Store",
        badgeAndroid: "🤖 Bald bei Google Play"
      },
      phone: { translation: "„Und verkünde frohe Botschaft den Geduldigen.“", reference: "Sure Al-Baqara, 2:155" },
      features: {
        title: "Eine Ayah, in deinem Rhythmus",
        subtitle: "Iqratime passt sich deinen Gewohnheiten an, nicht umgekehrt — du entscheidest, wann, wie oft und in welcher Sprache.",
        f1: { title: "Geplante Benachrichtigungen", desc: "Arabischer Text, Übersetzung oder beides — in der Reihenfolge deiner Wahl, zu den von dir festgelegten Zeiten." },
        f2: { title: "100 % offline", desc: "Kein Konto, kein Server, keine Werbung, kein Tracker. Alles läuft auf deinem Gerät." },
        f3: { title: "10 Sprachen", desc: "Arabisch, Französisch, Englisch, Spanisch, Portugiesisch, Hindi, Bengalisch, vereinfachtes Chinesisch, Italienisch, Russisch — mit vollständiger RTL-Unterstützung für Arabisch." },
        f4: { title: "Individueller Zeitplan", desc: "Aktive Stunden, Tage, Häufigkeit (1 bis 12 Std.), feste Zeiten, Nachtruhe und eine optionale zufällige Variation." },
        f5: { title: "Spirituelle Themen", desc: "Geduld, Dankbarkeit, Hoffnung, Barmherzigkeit … steuere, welche Ayat du erhältst, ganz auf deinem Gerät." },
        f6: { title: "Verlauf &amp; Favoriten", desc: "Finde, teile und kopiere erhaltene Ayat. Fordere jederzeit eine weitere an." }
      },
      privacy: {
        title: "Deine Privatsphäre, von Anfang an respektiert",
        text: "Kein Konto, keine Anmeldung nötig, kein Backend, keine Analyse, keine Werbung, keine Tracking-ID. Es verlassen niemals Daten dein Gerät."
      },
      similar: {
        title: "Ähnliche Projekte",
        subtitle: "Iqratime gehört zu einer Familie von Apps desselben Teams, mit denselben Prinzipien: offline, ohne Konto, ohne Werbung.",
        featuredStatus: "Nächstes Projekt",
        featuredTitle: "Bildungs-App — den Islam spielerisch lernen",
        featuredDesc: "Eine spielerische Offline-App, um die Grundlagen des Islam spielerisch zu entdecken und zu lernen — nach denselben Prinzipien wie Iqratime: kein Konto, keine Werbung, keine Datenerhebung.",
        featuredCta: "Dieses Projekt unterstützen",
        ideaStatus: "Hast du eine Idee?",
        ideaTitle: "Schlage ein ähnliches Projekt vor",
        ideaDesc: "Eine Idee für eine Erinnerungs-App im Geiste von Iqratime? Schreib uns — wir sind immer neugierig auf neue Projektideen."
      },
      donate: {
        title: "Unterstütze unsere Projekte",
        text: "Iqratime ist kostenlos, offline und werbefrei — und das wird so bleiben. Deine Spenden helfen, die laufende Entwicklung sowie unsere kommenden Projekte zu finanzieren, wie die Bildungs-App zum spielerischen Erlernen des Islam.",
        cta: "Jetzt spenden",
        fineprint: "Sichere Zahlung über Stripe. Freiwillige Spende, ohne Gegenleistung."
      },
      support: { title: "Eine Frage, ein Problem?", text: "Unser Support-Team ist direkt per E-Mail erreichbar." },
      footer: { copyright: "© 2026 Iqratime. Alle Rechte vorbehalten." }
    },
    es: {
      meta: {
        title: "Iqratime — El Corán en tu pantalla, sin desbloquear",
        description: "Iqratime envía una notificación con una aleya del Corán a tu pantalla de bloqueo, a la hora que elijas. Aplicación 100% sin conexión, sin cuenta, sin publicidad."
      },
      nav: { features: "Funciones", privacy: "Privacidad", similar: "Proyectos similares", donate: "Donar", contact: "Contacto" },
      hero: {
        kicker: "اقرأ · Iqra — «¡Lee!», la primera palabra revelada del Corán",
        title: "¿Y si el Corán viniera a ti?",
        lead: "Una notificación con una aleya distinta cada hora, directamente en tu pantalla de bloqueo — sin cuenta, sin servidor, sin necesidad de conexión a internet en el día a día.",
        badgeIos: "📱 Próximamente en App Store",
        badgeAndroid: "🤖 Próximamente en Google Play"
      },
      phone: { translation: "«Y anuncia buenas nuevas a los pacientes.»", reference: "Sura Al-Báqara, 2:155" },
      features: {
        title: "Una aleya, a tu ritmo",
        subtitle: "Iqratime se adapta a tus hábitos, no al revés — tú eliges cuándo, con qué frecuencia y en qué idioma.",
        f1: { title: "Notificaciones programadas", desc: "Texto árabe, traducción, o ambos — en el orden que prefieras, en las franjas horarias que definas." },
        f2: { title: "100% sin conexión", desc: "Sin cuenta, sin servidor, sin publicidad, sin rastreadores. Todo funciona en tu dispositivo." },
        f3: { title: "10 idiomas", desc: "Árabe, francés, inglés, español, portugués, hindi, bengalí, chino simplificado, italiano, ruso — con soporte RTL completo para el árabe." },
        f4: { title: "Horarios personalizados", desc: "Franja activa, días, frecuencia (de 1 a 12 h), horas fijas, silencio nocturno y una variación aleatoria opcional." },
        f5: { title: "Temas espirituales", desc: "Paciencia, gratitud, esperanza, misericordia… orienta las aleyas que recibes, todo desde tu dispositivo." },
        f6: { title: "Historial y favoritos", desc: "Encuentra, comparte y copia las aleyas recibidas. Pide otra en cualquier momento." }
      },
      privacy: {
        title: "Tu privacidad, respetada por diseño",
        text: "Sin cuenta, sin necesidad de iniciar sesión, sin backend, sin analítica, sin publicidad, sin identificador de seguimiento. Ningún dato sale de tu dispositivo."
      },
      similar: {
        title: "Proyectos similares",
        subtitle: "Iqratime forma parte de una familia de aplicaciones creadas por el mismo equipo, con los mismos principios: sin conexión, sin cuenta, sin publicidad.",
        featuredStatus: "Próximo proyecto",
        featuredTitle: "Aplicación educativa — aprender islam divirtiéndose",
        featuredDesc: "Una aplicación lúdica y sin conexión para descubrir y aprender las bases del islam divirtiéndose, con los mismos principios que Iqratime: sin cuenta, sin publicidad, sin recopilación de datos.",
        featuredCta: "Apoyar este proyecto",
        ideaStatus: "¿Tienes una idea?",
        ideaTitle: "Propón un proyecto similar",
        ideaDesc: "¿Tienes una idea para una app de recordatorios con el mismo espíritu que Iqratime? Escríbenos — siempre nos interesa hablar de nuevos proyectos."
      },
      donate: {
        title: "Apoya nuestros proyectos",
        text: "Iqratime es gratuito, funciona sin conexión y sin publicidad — y seguirá siéndolo. Tus donaciones ayudan a financiar su desarrollo continuo, así como nuestros próximos proyectos, como la aplicación educativa para aprender islam divirtiéndose.",
        cta: "Donar",
        fineprint: "Pago seguro con Stripe. Donación voluntaria, sin contraprestación."
      },
      support: { title: "¿Alguna pregunta o problema?", text: "Nuestro equipo de soporte está disponible directamente por correo electrónico." },
      footer: { copyright: "© 2026 Iqratime. Todos los derechos reservados." }
    },
    it: {
      meta: {
        title: "Iqratime — Il Corano sul tuo schermo, senza sbloccare",
        description: "Iqratime invia una notifica con un'ayah del Corano sulla schermata di blocco, all'ora che preferisci. App 100% offline, senza account, senza pubblicità."
      },
      nav: { features: "Funzionalità", privacy: "Privacy", similar: "Progetti simili", donate: "Dona", contact: "Contatto" },
      hero: {
        kicker: "اقرأ · Iqra — «Leggi!», la prima parola rivelata del Corano",
        title: "E se il Corano venisse da te?",
        lead: "Una notifica con un'ayah diversa ogni ora, direttamente sulla schermata di blocco — senza account, senza server, senza bisogno di connessione a Internet nell'uso quotidiano.",
        badgeIos: "📱 Presto su App Store",
        badgeAndroid: "🤖 Presto su Google Play"
      },
      phone: { translation: "«E da' il lieto annuncio ai pazienti.»", reference: "Sura Al-Baqara, 2:155" },
      features: {
        title: "Un'ayah, al tuo ritmo",
        subtitle: "Iqratime si adatta alle tue abitudini, non il contrario — scegli tu quando, con quale frequenza e in quale lingua.",
        f1: { title: "Notifiche programmate", desc: "Testo arabo, traduzione, o entrambi — nell'ordine che preferisci, nelle fasce orarie che imposti tu." },
        f2: { title: "100% offline", desc: "Nessun account, nessun server, nessuna pubblicità, nessun tracciamento. Tutto funziona sul tuo dispositivo." },
        f3: { title: "10 lingue", desc: "Arabo, francese, inglese, spagnolo, portoghese, hindi, bengalese, cinese semplificato, italiano, russo — con supporto RTL completo per l'arabo." },
        f4: { title: "Orari personalizzati", desc: "Fascia attiva, giorni, frequenza (da 1 a 12 ore), orari fissi, silenzio notturno e una variazione casuale opzionale." },
        f5: { title: "Temi spirituali", desc: "Pazienza, gratitudine, speranza, misericordia… orienta le ayat che ricevi, tutto sul tuo dispositivo." },
        f6: { title: "Cronologia e preferiti", desc: "Ritrova, condividi e copia le ayat ricevute. Chiedine un'altra in qualsiasi momento." }
      },
      privacy: {
        title: "La tua privacy, rispettata per progettazione",
        text: "Nessun account, nessun accesso richiesto, nessun backend, nessuna analisi, nessuna pubblicità, nessun identificatore di tracciamento. Nessun dato lascia il tuo dispositivo."
      },
      similar: {
        title: "Progetti simili",
        subtitle: "Iqratime fa parte di una famiglia di app pensate dallo stesso team, con gli stessi principi: offline, senza account, senza pubblicità.",
        featuredStatus: "Prossimo progetto",
        featuredTitle: "App educativa — imparare l'islam divertendosi",
        featuredDesc: "Un'app ludica e offline per scoprire e imparare le basi dell'islam divertendosi, con gli stessi principi di Iqratime: nessun account, nessuna pubblicità, nessun dato raccolto.",
        featuredCta: "Sostieni questo progetto",
        ideaStatus: "Hai un'idea?",
        ideaTitle: "Proponi un progetto simile",
        ideaDesc: "Un'idea per un'app di promemoria nello stesso spirito di Iqratime? Scrivici — siamo sempre curiosi di parlare di nuovi progetti."
      },
      donate: {
        title: "Sostieni i nostri progetti",
        text: "Iqratime è gratuito, offline e senza pubblicità — e lo rimarrà. Le tue donazioni aiutano a finanziare il suo sviluppo continuo e i nostri prossimi progetti, come l'app educativa per imparare l'islam divertendosi.",
        cta: "Dona ora",
        fineprint: "Pagamento sicuro tramite Stripe. Donazione volontaria, senza alcuna contropartita."
      },
      support: { title: "Una domanda, un problema?", text: "Il nostro team di assistenza è raggiungibile direttamente via email." },
      footer: { copyright: "© 2026 Iqratime. Tutti i diritti riservati." }
    },
    nl: {
      meta: {
        title: "Iqratime — De Koran op je scherm, zonder te ontgrendelen",
        description: "Iqratime stuurt een melding met een ayah uit de Koran naar je vergrendelscherm, op het tijdstip dat jij kiest. 100% offline app, geen account, geen advertenties."
      },
      nav: { features: "Functies", privacy: "Privacy", similar: "Vergelijkbare projecten", donate: "Doneren", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — 'Lees!', het eerste geopenbaarde woord van de Koran",
        title: "Wat als de Koran naar jou toe kwam?",
        lead: "Elk uur een andere ayah-melding, rechtstreeks op je vergrendelscherm — geen account, geen server, geen internetverbinding nodig in het dagelijks gebruik.",
        badgeIos: "📱 Binnenkort in de App Store",
        badgeAndroid: "🤖 Binnenkort op Google Play"
      },
      phone: { translation: "“En verkondig blijde tijding aan de geduldigen.”", reference: "Soera Al-Baqara, 2:155" },
      features: {
        title: "Een ayah, op jouw ritme",
        subtitle: "Iqratime past zich aan jouw gewoontes aan, niet andersom — jij kiest wanneer, hoe vaak en in welke taal.",
        f1: { title: "Geplande meldingen", desc: "Arabische tekst, vertaling, of beide — in de volgorde die jij verkiest, tijdens de tijdsblokken die je zelf instelt." },
        f2: { title: "100% offline", desc: "Geen account, geen server, geen advertenties, geen trackers. Alles werkt op je eigen toestel." },
        f3: { title: "10 talen", desc: "Arabisch, Frans, Engels, Spaans, Portugees, Hindi, Bengaals, vereenvoudigd Chinees, Italiaans, Russisch — met volledige RTL-ondersteuning voor Arabisch." },
        f4: { title: "Schema op maat", desc: "Actieve uren, dagen, frequentie (1 tot 12 uur), vaste tijden, nachtstilte en een optionele willekeurige variatie." },
        f5: { title: "Spirituele thema's", desc: "Geduld, dankbaarheid, hoop, barmhartigheid… stuur welke ayat je ontvangt, volledig op je eigen toestel." },
        f6: { title: "Geschiedenis &amp; favorieten", desc: "Vind, deel en kopieer ontvangen ayat. Vraag op elk moment om een andere." }
      },
      privacy: {
        title: "Jouw privacy, gerespecteerd door ontwerp",
        text: "Geen account, geen inloggen nodig, geen backend, geen analytics, geen advertenties, geen tracking-ID. Er verlaten nooit gegevens je toestel."
      },
      similar: {
        title: "Vergelijkbare projecten",
        subtitle: "Iqratime maakt deel uit van een familie apps van hetzelfde team, met dezelfde principes: offline, geen account, geen advertenties.",
        featuredStatus: "Volgend project",
        featuredTitle: "Educatieve app — de islam leren terwijl je plezier hebt",
        featuredDesc: "Een speelse offline-app om de basis van de islam op een leuke manier te ontdekken en te leren, met dezelfde principes als Iqratime: geen account, geen advertenties, geen verzamelde gegevens.",
        featuredCta: "Steun dit project",
        ideaStatus: "Heb je een idee?",
        ideaTitle: "Stel een vergelijkbaar project voor",
        ideaDesc: "Een idee voor een herinnerings-app in dezelfde geest als Iqratime? Schrijf ons — we praten graag over nieuwe projecten."
      },
      donate: {
        title: "Steun onze projecten",
        text: "Iqratime is gratis, offline en zonder advertenties — en dat blijft zo. Jouw donaties helpen de verdere ontwikkeling te financieren, evenals onze volgende projecten, zoals de educatieve app om de islam te leren terwijl je plezier hebt.",
        cta: "Doneer nu",
        fineprint: "Veilige betaling via Stripe. Vrijwillige donatie, zonder tegenprestatie."
      },
      support: { title: "Een vraag of een probleem?", text: "Ons supportteam is rechtstreeks bereikbaar per e-mail." },
      footer: { copyright: "© 2026 Iqratime. Alle rechten voorbehouden." }
    }
  };

  function getByPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  function detectInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — fall through */
    }
    var browserLangs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || DEFAULT_LANG];
    for (var i = 0; i < browserLangs.length; i++) {
      var code = String(browserLangs[i]).slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var dict = translations[lang] || translations[DEFAULT_LANG];

    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.indexOf(lang) !== -1 ? "rtl" : "ltr";

    if (dict.meta) {
      if (dict.meta.title) document.title = dict.meta.title;
      if (dict.meta.description) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", dict.meta.description);
      }
    }

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      var value = getByPath(dict, key);
      if (typeof value === "string" && value.length) {
        nodes[i].innerHTML = value;
      }
    }

    var ayahTranslation = document.querySelector(".ayah-tr");
    if (ayahTranslation) {
      ayahTranslation.style.display = lang === "ar" ? "none" : "";
    }

    var select = document.getElementById("lang-switch");
    if (select) select.value = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore persistence failures */
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(detectInitialLang());

    var select = document.getElementById("lang-switch");
    if (select) {
      select.addEventListener("change", function () {
        applyLang(select.value);
      });
    }
  });
})();
