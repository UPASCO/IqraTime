(function () {
  "use strict";

  var SUPPORTED = ["fr", "en", "ar", "de", "es", "it", "nl"];
  var DEFAULT_LANG = "fr";
  var RTL_LANGS = ["ar"];
  var STORAGE_KEY = "iqratime-lang";

  var translations = {
    fr: {
      meta: {
        title: "IqraTime — Le Coran sur votre écran, sans déverrouiller",
        description: "IqraTime envoie une notification d'āyah du Coran ou de hadith authentique à votre écran verrouillé, à l'heure de votre choix. Application 100% hors-ligne, sans compte, sans publicité."
      },
      nav: { features: "Fonctionnalités", privacy: "Confidentialité", similar: "Projets similaires", donate: "Faire un don", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — « Lis ! », premier mot révélé du Coran",
        title: "Et si chaque notification comptait vraiment ?",
        lead: "Une āyah du Coran ou un hadith authentique différent par heure, directement sur votre écran verrouillé — une source de hassanat, inchAllah, sans compte, sans serveur, sans connexion Internet nécessaire au quotidien.",
        badgeIos: "📱 Bientôt sur l'App Store",
        badgeAndroid: "🤖 Bientôt sur Google Play"
      },
      phone: { translation: "« Et fais bonne annonce aux endurants. »", reference: "Sourate Al-Baqarah, 2:155" },
      features: {
        title: "Une āyah, un hadith, à votre rythme",
        subtitle: "IqraTime s'adapte à vos habitudes plutôt que l'inverse — vous choisissez quand, à quelle fréquence, et dans quelle langue.",
        f1: { title: "Notifications programmées", desc: "Une āyah du Coran ou un hadith authentique, texte arabe et/ou traduction — selon l'ordre que vous préférez, sur les plages horaires que vous définissez." },
        f2: { title: "100% hors-ligne", desc: "Aucun compte, aucun serveur, aucune publicité, aucun traqueur. Tout fonctionne sur votre appareil." },
        f3: { title: "12 langues", desc: "Arabe, français, anglais, espagnol, portugais, hindi, bengali, chinois simplifié, italien, russe, néerlandais, allemand — avec support RTL complet pour l'arabe." },
        f4: { title: "Horaires sur mesure", desc: "Plage active, jours, fréquence (1h à 12h), heures fixes, silence nocturne, et une variation aléatoire optionnelle." },
        f5: { title: "Thèmes spirituels", desc: "Patience, gratitude, espoir, miséricorde… orientez les āyāt que vous recevez, entièrement sur l'appareil." },
        f6: { title: "Suivi &amp; partage", desc: "Historique, favoris, série de jours consécutifs, écran de découverte du Coran, et partage sous forme de carte visuelle — chaque partage est aussi une source de hassanat, inchAllah." },
        f7: { title: "Hadiths authentiques &amp; tafsir", desc: "Sahih al-Bukhari et Sahih Muslim en contenu optionnel, avec un tafsir (explication du sens et du contexte) disponible pour chaque āyah, d'un simple tap." },
        f8: { title: "Un instant pour vous", desc: "Dites comment vous vous sentez — anxieux, reconnaissant, en recherche de guidance… — et recevez une āyah choisie pour ce moment précis, à la demande." }
      },
      privacy: {
        title: "Votre vie privée, respectée par conception",
        text: "Aucun compte, aucune connexion requise, aucun backend, aucune analytique, aucune publicité, aucun identifiant de suivi. Aucune donnée ne quitte votre appareil."
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
      support: { title: "Une question, un problème ?", text: "Notre équipe support est joignable directement par email." },
      footer: { copyright: "© 2026 IqraTime. Tous droits réservés." }
    },
    en: {
      meta: {
        title: "IqraTime — The Quran on your screen, without unlocking",
        description: "IqraTime sends a Quran āyah or authentic hadith notification to your lock screen, at the time you choose. 100% offline app, no account, no ads."
      },
      nav: { features: "Features", privacy: "Privacy", similar: "Similar projects", donate: "Donate", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — “Read!”, the first word revealed in the Quran",
        title: "What if every notification truly counted?",
        lead: "A different Quran āyah or authentic hadith every hour, straight to your lock screen — a source of hassanat, inshaAllah, no account, no server, no internet connection needed day to day.",
        badgeIos: "📱 Coming soon on the App Store",
        badgeAndroid: "🤖 Coming soon on Google Play"
      },
      phone: { translation: "“And give good tidings to the patient.”", reference: "Surah Al-Baqarah, 2:155" },
      features: {
        title: "An āyah, a hadith, at your pace",
        subtitle: "IqraTime adapts to your habits, not the other way around — you choose when, how often, and in which language.",
        f1: { title: "Scheduled notifications", desc: "A Quran āyah or an authentic hadith, Arabic text and/or translation — in the order you prefer, during the time slots you set." },
        f2: { title: "100% offline", desc: "No account, no server, no ads, no tracker. Everything runs on your device." },
        f3: { title: "12 languages", desc: "Arabic, French, English, Spanish, Portuguese, Hindi, Bengali, Simplified Chinese, Italian, Russian, Dutch, German — with full RTL support for Arabic." },
        f4: { title: "Custom schedule", desc: "Active hours, days, frequency (1h to 12h), fixed times, night silence, and an optional random variation." },
        f5: { title: "Spiritual themes", desc: "Patience, gratitude, hope, mercy… guide which āyāt you receive, entirely on your device." },
        f6: { title: "Track &amp; share", desc: "History, favorites, a day streak, a Quran discovery screen, and sharing as a visual card — every share is also a source of hassanat, inshaAllah." },
        f7: { title: "Authentic hadith &amp; tafsir", desc: "Sahih al-Bukhari and Sahih Muslim as an optional content type, with a tafsir (meaning and context) available for every āyah, one tap away." },
        f8: { title: "A moment for you", desc: "Say how you're feeling — anxious, grateful, seeking guidance… — and get an āyah chosen for that exact moment, on demand." }
      },
      privacy: {
        title: "Your privacy, respected by design",
        text: "No account, no login required, no backend, no analytics, no ads, no tracking identifier. No data ever leaves your device."
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
      support: { title: "A question, an issue?", text: "Our support team is reachable directly by email." },
      footer: { copyright: "© 2026 IqraTime. All rights reserved." }
    },
    ar: {
      meta: {
        title: "IqraTime — القرآن على شاشتك دون فتح القفل",
        description: "يرسل IqraTime إشعارًا بآية من القرآن أو حديث صحيح إلى شاشة القفل في الوقت الذي تختاره. تطبيق يعمل بدون إنترنت بالكامل، بدون حساب، بدون إعلانات."
      },
      nav: { features: "المزايا", privacy: "الخصوصية", similar: "مشاريع مشابهة", donate: "تبرّع", contact: "تواصل معنا" },
      hero: {
        kicker: "اقرأ — أول كلمة نزلت في القرآن الكريم",
        title: "ماذا لو كان لكل إشعار قيمة حقيقية؟",
        lead: "آية من القرآن أو حديث صحيح مختلف كل ساعة، مباشرة على شاشة القفل — مصدر للحسنات إن شاء الله، بدون حساب، بدون خادم، بدون حاجة للاتصال بالإنترنت في الاستخدام اليومي.",
        badgeIos: "📱 قريبًا على App Store",
        badgeAndroid: "🤖 قريبًا على Google Play"
      },
      phone: { translation: "", reference: "سورة البقرة، الآية 155" },
      features: {
        title: "آية، حديث، على إيقاعك",
        subtitle: "يتكيّف IqraTime مع عاداتك، لا العكس — أنت من يختار الوقت والتكرار واللغة.",
        f1: { title: "إشعارات مجدولة", desc: "آية من القرآن أو حديث صحيح، نص عربي و/أو ترجمة — بالترتيب الذي تفضله، خلال الأوقات التي تحددها." },
        f2: { title: "بدون إنترنت بالكامل", desc: "بدون حساب، بدون خادم، بدون إعلانات، بدون متتبعات. كل شيء يعمل على جهازك." },
        f3: { title: "12 لغة", desc: "العربية والفرنسية والإنجليزية والإسبانية والبرتغالية والهندية والبنغالية والصينية المبسطة والإيطالية والروسية والهولندية والألمانية — مع دعم كامل للكتابة من اليمين لليسار." },
        f4: { title: "جدول حسب رغبتك", desc: "ساعات النشاط، الأيام، التكرار (من ساعة إلى 12 ساعة)، أوقات ثابتة، صمت ليلي، وتنويع عشوائي اختياري." },
        f5: { title: "مواضيع روحانية", desc: "الصبر، الشكر، الأمل، الرحمة... وجّه الآيات التي تصلك، كل ذلك على جهازك فقط." },
        f6: { title: "المتابعة والمشاركة", desc: "السجل، المفضلة، سلسلة الأيام المتتالية، شاشة اكتشاف القرآن، والمشاركة كبطاقة مرئية — كل مشاركة هي أيضًا مصدر للحسنات إن شاء الله." },
        f7: { title: "أحاديث صحيحة وتفسير", desc: "صحيح البخاري وصحيح مسلم كمحتوى اختياري، مع تفسير (شرح المعنى والسياق) متاح لكل آية بضغطة واحدة." },
        f8: { title: "لحظة من أجلك", desc: "أخبرنا كيف تشعر — قلق، ممتن، تبحث عن توجيه... — واحصل على آية مختارة لهذه اللحظة بالذات، عند الطلب." }
      },
      privacy: {
        title: "خصوصيتك، مُحترمة بالتصميم",
        text: "بدون حساب، بدون تسجيل دخول، بدون خادم خلفي، بدون تحليلات، بدون إعلانات، بدون معرّف تتبّع. لا تغادر أي بيانات جهازك."
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
      support: { title: "لديك سؤال أو مشكلة؟", text: "يمكنك التواصل مع فريق الدعم مباشرة عبر البريد الإلكتروني." },
      footer: { copyright: "© 2026 IqraTime. جميع الحقوق محفوظة." }
    },
    de: {
      meta: {
        title: "IqraTime — Der Koran auf deinem Bildschirm, ohne zu entsperren",
        description: "IqraTime sendet eine Koran-Ayah- oder Hadith-Benachrichtigung auf deinen Sperrbildschirm, zur Uhrzeit deiner Wahl. 100 % offline, kein Konto, keine Werbung."
      },
      nav: { features: "Funktionen", privacy: "Datenschutz", similar: "Ähnliche Projekte", donate: "Spenden", contact: "Kontakt" },
      hero: {
        kicker: "اقرأ · Iqra — „Lies!“, das erste offenbarte Wort des Korans",
        title: "Was wäre, wenn jede Benachrichtigung wirklich zählte?",
        lead: "Stündlich eine andere Koran-Ayah oder ein authentischer Hadith, direkt auf deinem Sperrbildschirm — eine Quelle für Hassanat, inschaAllah, ohne Konto, ohne Server, ohne dass im Alltag eine Internetverbindung nötig ist.",
        badgeIos: "📱 Bald im App Store",
        badgeAndroid: "🤖 Bald bei Google Play"
      },
      phone: { translation: "„Und verkünde frohe Botschaft den Geduldigen.“", reference: "Sure Al-Baqara, 2:155" },
      features: {
        title: "Eine Ayah, ein Hadith, in deinem Rhythmus",
        subtitle: "IqraTime passt sich deinen Gewohnheiten an, nicht umgekehrt — du entscheidest, wann, wie oft und in welcher Sprache.",
        f1: { title: "Geplante Benachrichtigungen", desc: "Eine Koran-Ayah oder ein authentischer Hadith, arabischer Text und/oder Übersetzung — in der Reihenfolge deiner Wahl, zu den von dir festgelegten Zeiten." },
        f2: { title: "100 % offline", desc: "Kein Konto, kein Server, keine Werbung, kein Tracker. Alles läuft auf deinem Gerät." },
        f3: { title: "12 Sprachen", desc: "Arabisch, Französisch, Englisch, Spanisch, Portugiesisch, Hindi, Bengalisch, vereinfachtes Chinesisch, Italienisch, Russisch, Niederländisch, Deutsch — mit vollständiger RTL-Unterstützung für Arabisch." },
        f4: { title: "Individueller Zeitplan", desc: "Aktive Stunden, Tage, Häufigkeit (1 bis 12 Std.), feste Zeiten, Nachtruhe und eine optionale zufällige Variation." },
        f5: { title: "Spirituelle Themen", desc: "Geduld, Dankbarkeit, Hoffnung, Barmherzigkeit … steuere, welche Ayat du erhältst, ganz auf deinem Gerät." },
        f6: { title: "Verlauf &amp; Teilen", desc: "Verlauf, Favoriten, eine Tage-Serie, ein Koran-Entdeckungsbildschirm und Teilen als visuelle Karte — jedes Teilen ist auch eine Quelle für Hassanat, inschaAllah." },
        f7: { title: "Authentische Hadithe &amp; Tafsir", desc: "Sahih al-Bukhari und Sahih Muslim als optionaler Inhaltstyp, mit einem Tafsir (Bedeutung und Kontext) für jede Ayah, nur einen Fingertipp entfernt." },
        f8: { title: "Ein Moment für dich", desc: "Sag, wie du dich fühlst — ängstlich, dankbar, auf der Suche nach Orientierung … — und erhalte eine Ayah, die genau für diesen Moment gewählt wurde, auf Abruf." }
      },
      privacy: {
        title: "Deine Privatsphäre, von Anfang an respektiert",
        text: "Kein Konto, keine Anmeldung nötig, kein Backend, keine Analyse, keine Werbung, keine Tracking-ID. Es verlassen niemals Daten dein Gerät."
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
      support: { title: "Eine Frage, ein Problem?", text: "Unser Support-Team ist direkt per E-Mail erreichbar." },
      footer: { copyright: "© 2026 IqraTime. Alle Rechte vorbehalten." }
    },
    es: {
      meta: {
        title: "IqraTime — El Corán en tu pantalla, sin desbloquear",
        description: "IqraTime envía una notificación con una aleya del Corán o un hadiz auténtico a tu pantalla de bloqueo, a la hora que elijas. Aplicación 100% sin conexión, sin cuenta, sin publicidad."
      },
      nav: { features: "Funciones", privacy: "Privacidad", similar: "Proyectos similares", donate: "Donar", contact: "Contacto" },
      hero: {
        kicker: "اقرأ · Iqra — «¡Lee!», la primera palabra revelada del Corán",
        title: "¿Y si cada notificación realmente importara?",
        lead: "Una aleya del Corán o un hadiz auténtico distinto cada hora, directamente en tu pantalla de bloqueo — una fuente de hasanat, inshaAllah, sin cuenta, sin servidor, sin necesidad de conexión a internet en el día a día.",
        badgeIos: "📱 Próximamente en App Store",
        badgeAndroid: "🤖 Próximamente en Google Play"
      },
      phone: { translation: "«Y anuncia buenas nuevas a los pacientes.»", reference: "Sura Al-Báqara, 2:155" },
      features: {
        title: "Una aleya, un hadiz, a tu ritmo",
        subtitle: "IqraTime se adapta a tus hábitos, no al revés — tú eliges cuándo, con qué frecuencia y en qué idioma.",
        f1: { title: "Notificaciones programadas", desc: "Una aleya del Corán o un hadiz auténtico, texto árabe y/o traducción — en el orden que prefieras, en las franjas horarias que definas." },
        f2: { title: "100% sin conexión", desc: "Sin cuenta, sin servidor, sin publicidad, sin rastreadores. Todo funciona en tu dispositivo." },
        f3: { title: "12 idiomas", desc: "Árabe, francés, inglés, español, portugués, hindi, bengalí, chino simplificado, italiano, ruso, neerlandés, alemán — con soporte RTL completo para el árabe." },
        f4: { title: "Horarios personalizados", desc: "Franja activa, días, frecuencia (de 1 a 12 h), horas fijas, silencio nocturno y una variación aleatoria opcional." },
        f5: { title: "Temas espirituales", desc: "Paciencia, gratitud, esperanza, misericordia… orienta las aleyas que recibes, todo desde tu dispositivo." },
        f6: { title: "Seguimiento y compartir", desc: "Historial, favoritos, una racha de días, una pantalla de descubrimiento del Corán y compartir como tarjeta visual — cada envío es también una fuente de hasanat, inshaAllah." },
        f7: { title: "Hadices auténticos y tafsir", desc: "Sahih al-Bujari y Sahih Muslim como contenido opcional, con un tafsir (significado y contexto) disponible para cada aleya, a un toque de distancia." },
        f8: { title: "Un momento para ti", desc: "Cuéntanos cómo te sientes — ansioso, agradecido, buscando guía… — y recibe una aleya elegida para ese momento exacto, cuando la necesites." }
      },
      privacy: {
        title: "Tu privacidad, respetada por diseño",
        text: "Sin cuenta, sin necesidad de iniciar sesión, sin backend, sin analítica, sin publicidad, sin identificador de seguimiento. Ningún dato sale de tu dispositivo."
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
      support: { title: "¿Alguna pregunta o problema?", text: "Nuestro equipo de soporte está disponible directamente por correo electrónico." },
      footer: { copyright: "© 2026 IqraTime. Todos los derechos reservados." }
    },
    it: {
      meta: {
        title: "IqraTime — Il Corano sul tuo schermo, senza sbloccare",
        description: "IqraTime invia una notifica con un'ayah del Corano o un hadith autentico sulla schermata di blocco, all'ora che preferisci. App 100% offline, senza account, senza pubblicità."
      },
      nav: { features: "Funzionalità", privacy: "Privacy", similar: "Progetti simili", donate: "Dona", contact: "Contatto" },
      hero: {
        kicker: "اقرأ · Iqra — «Leggi!», la prima parola rivelata del Corano",
        title: "E se ogni notifica contasse davvero?",
        lead: "Un'ayah del Corano o un hadith autentico diverso ogni ora, direttamente sulla schermata di blocco — una fonte di hasanat, inshaAllah, senza account, senza server, senza bisogno di connessione a Internet nell'uso quotidiano.",
        badgeIos: "📱 Presto su App Store",
        badgeAndroid: "🤖 Presto su Google Play"
      },
      phone: { translation: "«E da' il lieto annuncio ai pazienti.»", reference: "Sura Al-Baqara, 2:155" },
      features: {
        title: "Un'ayah, un hadith, al tuo ritmo",
        subtitle: "IqraTime si adatta alle tue abitudini, non il contrario — scegli tu quando, con quale frequenza e in quale lingua.",
        f1: { title: "Notifiche programmate", desc: "Un'ayah del Corano o un hadith autentico, testo arabo e/o traduzione — nell'ordine che preferisci, nelle fasce orarie che imposti tu." },
        f2: { title: "100% offline", desc: "Nessun account, nessun server, nessuna pubblicità, nessun tracciamento. Tutto funziona sul tuo dispositivo." },
        f3: { title: "12 lingue", desc: "Arabo, francese, inglese, spagnolo, portoghese, hindi, bengalese, cinese semplificato, italiano, russo, olandese, tedesco — con supporto RTL completo per l'arabo." },
        f4: { title: "Orari personalizzati", desc: "Fascia attiva, giorni, frequenza (da 1 a 12 ore), orari fissi, silenzio notturno e una variazione casuale opzionale." },
        f5: { title: "Temi spirituali", desc: "Pazienza, gratitudine, speranza, misericordia… orienta le ayat che ricevi, tutto sul tuo dispositivo." },
        f6: { title: "Cronologia e condivisione", desc: "Cronologia, preferiti, una serie di giorni consecutivi, una schermata di scoperta del Corano e condivisione come card visiva — ogni condivisione è anche una fonte di hasanat, inshaAllah." },
        f7: { title: "Hadith autentici e tafsir", desc: "Sahih al-Bukhari e Sahih Muslim come contenuto opzionale, con un tafsir (significato e contesto) disponibile per ogni ayah, a portata di tap." },
        f8: { title: "Un momento per te", desc: "Dicci come ti senti — ansioso, grato, in cerca di guida… — e ricevi un'ayah scelta per quel momento preciso, su richiesta." }
      },
      privacy: {
        title: "La tua privacy, rispettata per progettazione",
        text: "Nessun account, nessun accesso richiesto, nessun backend, nessuna analisi, nessuna pubblicità, nessun identificatore di tracciamento. Nessun dato lascia il tuo dispositivo."
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
      support: { title: "Una domanda, un problema?", text: "Il nostro team di assistenza è raggiungibile direttamente via email." },
      footer: { copyright: "© 2026 IqraTime. Tutti i diritti riservati." }
    },
    nl: {
      meta: {
        title: "IqraTime — De Koran op je scherm, zonder te ontgrendelen",
        description: "IqraTime stuurt een melding met een Koran-ayah of authentieke hadith naar je vergrendelscherm, op het tijdstip dat jij kiest. 100% offline app, geen account, geen advertenties."
      },
      nav: { features: "Functies", privacy: "Privacy", similar: "Vergelijkbare projecten", donate: "Doneren", contact: "Contact" },
      hero: {
        kicker: "اقرأ · Iqra — 'Lees!', het eerste geopenbaarde woord van de Koran",
        title: "Wat als elke melding echt zou tellen?",
        lead: "Elk uur een andere Koran-ayah of authentieke hadith, rechtstreeks op je vergrendelscherm — een bron van hasanat, inshaAllah, geen account, geen server, geen internetverbinding nodig in het dagelijks gebruik.",
        badgeIos: "📱 Binnenkort in de App Store",
        badgeAndroid: "🤖 Binnenkort op Google Play"
      },
      phone: { translation: "“En verkondig blijde tijding aan de geduldigen.”", reference: "Soera Al-Baqara, 2:155" },
      features: {
        title: "Een ayah, een hadith, op jouw ritme",
        subtitle: "IqraTime past zich aan jouw gewoontes aan, niet andersom — jij kiest wanneer, hoe vaak en in welke taal.",
        f1: { title: "Geplande meldingen", desc: "Een Koran-ayah of een authentieke hadith, Arabische tekst en/of vertaling — in de volgorde die jij verkiest, tijdens de tijdsblokken die je zelf instelt." },
        f2: { title: "100% offline", desc: "Geen account, geen server, geen advertenties, geen trackers. Alles werkt op je eigen toestel." },
        f3: { title: "12 talen", desc: "Arabisch, Frans, Engels, Spaans, Portugees, Hindi, Bengaals, vereenvoudigd Chinees, Italiaans, Russisch, Nederlands, Duits — met volledige RTL-ondersteuning voor Arabisch." },
        f4: { title: "Schema op maat", desc: "Actieve uren, dagen, frequentie (1 tot 12 uur), vaste tijden, nachtstilte en een optionele willekeurige variatie." },
        f5: { title: "Spirituele thema's", desc: "Geduld, dankbaarheid, hoop, barmhartigheid… stuur welke ayat je ontvangt, volledig op je eigen toestel." },
        f6: { title: "Voortgang &amp; delen", desc: "Geschiedenis, favorieten, een dagenreeks, een Koran-ontdekkingsscherm en delen als visuele kaart — elke share is ook een bron van hasanat, inshaAllah." },
        f7: { title: "Authentieke hadith &amp; tafsir", desc: "Sahih al-Bukhari en Sahih Muslim als optioneel content type, met een tafsir (betekenis en context) beschikbaar bij elke ayah, met één tik." },
        f8: { title: "Een moment voor jou", desc: "Vertel hoe je je voelt — angstig, dankbaar, op zoek naar houvast… — en ontvang een ayah gekozen voor dat exacte moment, op aanvraag." }
      },
      privacy: {
        title: "Jouw privacy, gerespecteerd door ontwerp",
        text: "Geen account, geen inloggen nodig, geen backend, geen analytics, geen advertenties, geen tracking-ID. Er verlaten nooit gegevens je toestel."
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
      support: { title: "Een vraag of een probleem?", text: "Ons supportteam is rechtstreeks bereikbaar per e-mail." },
      footer: { copyright: "© 2026 IqraTime. Alle rechten voorbehouden." }
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
