/**
 * Merges EDITORIAL one-line renderings of the 99 Names' meanings, in
 * de/es/it/nl/pt/ru, into src/data/names/names.json — the same documented
 * editorial exception as the French glosses (a one-line meaning is a
 * gloss, not scripture; see docs/CORPUS.md "99 Names of Allah and
 * Invocations"). Arabic gets NO gloss on purpose: the name itself is the
 * text for Arabic readers, and bn/hi/zh-CN read the English gloss as an
 * explicit visible fallback. Keyed by canonical number AND checked
 * against the transliteration so a re-ordered dataset can never silently
 * misalign a meaning. Run after scripts/fetchNamesAndDuas.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAMES_PATH = path.join(ROOT, "src", "data", "names", "names.json");

// [number, transliteration (guard), de, es, it, nl, pt, ru]
const GLOSSES = [
  [1, "Ar-Raḥmān", "Der Allerbarmer", "El Compasivo", "Il Compassionevole", "De Meest Barmhartige", "O Clemente", "Всемилостивый"],
  [2, "Ar-Raḥīm", "Der Barmherzige", "El Misericordioso", "Il Misericordioso", "De Meest Genadevolle", "O Misericordioso", "Милосердный"],
  [3, "Al-Malik", "Der König", "El Rey", "Il Re", "De Koning", "O Rei", "Царь"],
  [4, "Al-Quddūs", "Der Heilige", "El Santísimo", "Il Santissimo", "De Heilige", "O Santíssimo", "Пресвятой"],
  [5, "As-Salām", "Der Frieden, Quelle des Friedens", "La Paz, Fuente de paz", "La Pace, Fonte di pace", "De Vrede, Bron van vrede", "A Paz, Fonte de paz", "Мир, Источник мира"],
  [6, "Al-Mu'min", "Der Gewährer der Sicherheit", "El Dador de seguridad", "Colui che dà sicurezza", "De Schenker van veiligheid", "O Dador de segurança", "Дарующий безопасность"],
  [7, "Al-Muhaymin", "Der Wächter über alles", "El Custodio vigilante", "Il Custode vigile", "De Waakzame Beschermer", "O Guardião vigilante", "Хранитель всего"],
  [8, "Al-'Azīz", "Der Allmächtige", "El Poderoso", "Il Potente", "De Almachtige", "O Todo-Poderoso", "Могущественный"],
  [9, "Al-Jabbār", "Der Bezwinger, der wiederherstellt", "El Dominador que restaura", "Il Dominatore che ripara", "De Dwingende Hersteller", "O Dominador que restaura", "Могучий, восстанавливающий"],
  [10, "Al-Mutakabbir", "Der Erhabene in Seiner Größe", "El Supremo en grandeza", "Il Supremo in grandezza", "De Grootste in verhevenheid", "O Supremo em grandeza", "Превознесённый в величии"],
  [11, "Al-Khāliq", "Der Schöpfer", "El Creador", "Il Creatore", "De Schepper", "O Criador", "Творец"],
  [12, "Al-Bāri'", "Der Hervorbringer", "El que da la existencia", "Colui che dà l'esistenza", "De Voortbrenger", "O que dá a existência", "Дарующий бытие"],
  [13, "Al-Muṣawwir", "Der Gestalter der Formen", "El Formador de las formas", "Il Modellatore delle forme", "De Vormgever", "O Modelador das formas", "Придающий формы"],
  [14, "Al-Ghaffār", "Der immer wieder Vergebende", "El Sumamente Perdonador", "Il Perdonatore instancabile", "De Telkens Vergevende", "O Grande Perdoador", "Много прощающий"],
  [15, "Al-Qahhār", "Der Alles-Bezwinger", "El Dominador supremo", "Il Dominatore supremo", "De Overweldiger", "O Dominador supremo", "Всеподчиняющий"],
  [16, "Al-Wahhāb", "Der freigebige Schenker", "El Dador generoso", "Il Donatore generoso", "De Gulle Schenker", "O Doador generoso", "Щедро дарующий"],
  [17, "Ar-Razzāq", "Der Versorger", "El Proveedor", "Il Provvidente", "De Voorziener", "O Provedor", "Наделяющий уделом"],
  [18, "Al-Fattāḥ", "Der Öffnende, der entscheidet", "El que abre y decide", "Colui che apre e decide", "De Opener en Beslisser", "O que abre e decide", "Открывающий и решающий"],
  [19, "Al-'Alīm", "Der Allwissende", "El Omnisciente", "L'Onnisciente", "De Alwetende", "O Onisciente", "Всезнающий"],
  [20, "Al-Qābiḍ", "Der Zurückhaltende", "El que restringe", "Colui che trattiene", "De Weerhouder", "O que retém", "Удерживающий"],
  [21, "Al-Bāsiṭ", "Der großzügig Gewährende", "El que concede con largueza", "Colui che elargisce", "De Verruimer", "O que concede com largueza", "Щедро простирающий"],
  [22, "Al-Khāfiḍ", "Der Erniedrigende", "El que humilla", "Colui che abbassa", "De Vernederer", "O que rebaixa", "Принижающий"],
  [23, "Ar-Rāfi'", "Der Erhöhende", "El que eleva", "Colui che eleva", "De Verheffer", "O que eleva", "Возвышающий"],
  [24, "Al-Mu'izz", "Der Ehre Verleihende", "El que honra", "Colui che onora", "De Schenker van eer", "O que honra", "Дарующий честь"],
  [25, "Al-Mudhill", "Der Demütigende", "El que envilece", "Colui che umilia", "De Onteerder", "O que humilha", "Унижающий"],
  [26, "As-Samī'", "Der Allhörende", "El que todo lo oye", "Colui che tutto ode", "De Alhorende", "O que tudo ouve", "Всеслышащий"],
  [27, "Al-Baṣīr", "Der Allsehende", "El que todo lo ve", "Colui che tutto vede", "De Alziende", "O que tudo vê", "Всевидящий"],
  [28, "Al-Ḥakam", "Der Richter", "El Juez", "Il Giudice", "De Rechter", "O Juiz", "Судья"],
  [29, "Al-'Adl", "Der vollkommen Gerechte", "El Justo absoluto", "Il Perfettamente Giusto", "De Volmaakt Rechtvaardige", "O Perfeitamente Justo", "Совершенно Справедливый"],
  [30, "Al-Laṭīf", "Der Feinfühlige, Gütige", "El Sutil, el Benévolo", "Il Sottile, il Benevolo", "De Subtiele, de Welwillende", "O Sutil, o Benevolente", "Проницательный и Добрый"],
  [31, "Al-Khabīr", "Der Allkundige", "El Bien Informado", "Il Ben Informato", "De Kenner van alles", "O Bem Informado", "Всеведающий"],
  [32, "Al-Ḥalīm", "Der Nachsichtige", "El Indulgente", "Il Paziente indulgente", "De Verdraagzame", "O Tolerante", "Кроткий"],
  [33, "Al-'Aẓīm", "Der Gewaltige", "El Inmenso", "L'Immenso", "De Geweldige", "O Imenso", "Величайший"],
  [34, "Al-Ghafūr", "Der Vielvergebende", "El Perdonador", "Il Perdonatore", "De Vergevensgezinde", "O Perdoador", "Прощающий"],
  [35, "Ash-Shakūr", "Der Dankbare", "El Agradecido", "Il Riconoscente", "De Dankbare", "O Agradecido", "Благодарный"],
  [36, "Al-'Aliyy", "Der Höchste", "El Altísimo", "L'Altissimo", "De Verhevene", "O Altíssimo", "Всевышний"],
  [37, "Al-Kabīr", "Der unendlich Große", "El Grande", "Il Grande", "De Grote", "O Grande", "Великий"],
  [38, "Al-Ḥafīẓ", "Der Bewahrer", "El Preservador", "Il Custode", "De Bewaarder", "O Preservador", "Хранитель"],
  [39, "Al-Muqīt", "Der Ernährer und Erhalter", "El Sustentador", "Il Sostentatore", "De Onderhouder", "O Sustentador", "Поддерживающий"],
  [40, "Al-Ḥasīb", "Der Genügende, der Rechnung führt", "El que basta y toma cuenta", "Colui che basta e tiene conto", "De Toereikende die rekenschap vraagt", "O que basta e toma contas", "Достаточный и Учитывающий"],
  [41, "Al-Jalīl", "Der Majestätische", "El Majestuoso", "Il Maestoso", "De Majesteitelijke", "O Majestoso", "Величественный"],
  [42, "Al-Karīm", "Der Großzügige", "El Generoso", "Il Generoso", "De Vrijgevige", "O Generoso", "Щедрый"],
  [43, "Ar-Raqīb", "Der Wachsame", "El Vigilante", "Il Vigile", "De Waakzame", "O Vigilante", "Наблюдающий"],
  [44, "Al-Mujīb", "Der Erhörende", "El que responde", "Colui che esaudisce", "De Verhoorder", "O que atende", "Отвечающий на мольбы"],
  [45, "Al-Wāsi'", "Der Allumfassende", "El Vasto", "Il Vasto", "De Alomvattende", "O Vasto", "Всеобъемлющий"],
  [46, "Al-Ḥakīm", "Der Allweise", "El Sabio", "Il Saggio", "De Alwijze", "O Sábio", "Мудрый"],
  [47, "Al-Wadūd", "Der Liebevolle", "El Amoroso", "L'Amorevole", "De Liefdevolle", "O Amoroso", "Любящий"],
  [48, "Al-Majīd", "Der Ruhmreiche", "El Glorioso", "Il Glorioso", "De Glorierijke", "O Glorioso", "Славный"],
  [49, "Al-Bā'ith", "Der Auferwecker", "El que resucita", "Colui che risuscita", "De Opwekker", "O que ressuscita", "Воскрешающий"],
  [50, "Ash-Shahīd", "Der Zeuge über alles", "El Testigo de todo", "Il Testimone di ogni cosa", "De Getuige van alles", "A Testemunha de tudo", "Свидетель всего"],
  [51, "Al-Ḥaqq", "Die Wahrheit", "La Verdad", "La Verità", "De Waarheid", "A Verdade", "Истина"],
  [52, "Al-Wakīl", "Der Sachwalter, dem alles anvertraut wird", "El Garante en quien confiar", "Il Garante a cui tutto si affida", "De Gevolmachtigde", "O Guardião a quem tudo se confia", "Попечитель, на которого уповают"],
  [53, "Al-Qawiyy", "Der Starke", "El Fuerte", "Il Forte", "De Sterke", "O Forte", "Сильный"],
  [54, "Al-Matīn", "Der Unerschütterliche", "El Firme", "Il Saldo", "De Onwrikbare", "O Firme", "Непоколебимый"],
  [55, "Al-Waliyy", "Der nahe Beschützer", "El Protector cercano", "Il Protettore vicino", "De Nabije Beschermer", "O Protetor próximo", "Ближайший Покровитель"],
  [56, "Al-Ḥamīd", "Der Lobenswürdige", "El Digno de alabanza", "Il Degno di lode", "De Lofwaardige", "O Digno de louvor", "Достохвальный"],
  [57, "Al-Muḥṣī", "Der alles Zählende", "El que todo lo enumera", "Colui che tutto conta", "De Opsommer van alles", "O que tudo enumera", "Исчисляющий всё"],
  [58, "Al-Mubdi'", "Der die Schöpfung beginnt", "El que inicia la creación", "Colui che inizia la creazione", "De Aanvanger van de schepping", "O que inicia a criação", "Начинающий творение"],
  [59, "Al-Mu'īd", "Der sie wiederholt", "El que la repite", "Colui che la rinnova", "De Hernieuwer ervan", "O que a repete", "Возобновляющий его"],
  [60, "Al-Muḥyī", "Der Leben gibt", "El que da la vida", "Colui che dà la vita", "De Levengever", "O que dá a vida", "Дарующий жизнь"],
  [61, "Al-Mumīt", "Der den Tod gibt", "El que da la muerte", "Colui che dà la morte", "De Doodgever", "O que dá a morte", "Умерщвляющий"],
  [62, "Al-Ḥayy", "Der Lebendige", "El Viviente", "Il Vivente", "De Levende", "O Vivente", "Живой"],
  [63, "Al-Qayyūm", "Der aus sich selbst Bestehende", "El Subsistente por Sí mismo", "Colui che sussiste da Sé", "De Zelfstandige Onderhouder", "O Subsistente por Si mesmo", "Сущий Сам по Себе"],
  [64, "Al-Wājid", "Der, dem nichts entgeht", "Aquel a quien nada se le escapa", "Colui a cui nulla sfugge", "Aan wie niets ontgaat", "Aquele a quem nada escapa", "Тот, от Кого ничто не скрыто"],
  [65, "Al-Mājid", "Der Edle, Herrliche", "El Noble, el Magnífico", "Il Nobile, il Magnifico", "De Edele, de Luisterrijke", "O Nobre, o Magnífico", "Благородный и Славный"],
  [66, "Al-Wāḥid", "Der Eine", "El Uno", "L'Uno", "De Ene", "O Uno", "Единый"],
  [67, "Al-Aḥad", "Der Einzige", "El Único", "L'Unico", "De Unieke", "O Único", "Единственный"],
  [68, "Aṣ-Ṣamad", "Der Absolute, zu dem alle Zuflucht nehmen", "El Absoluto, refugio de todos", "L'Assoluto, rifugio di tutti", "De Absolute, toevlucht van allen", "O Absoluto, amparo de todos", "Самодостаточный, Прибежище всех"],
  [69, "Al-Qādir", "Der Mächtige", "El Capaz", "Il Potente su tutto", "De Machtige", "O Poderoso", "Могущий"],
  [70, "Al-Muqtadir", "Der über alles Bestimmende", "El Todopoderoso determinante", "Il Determinante supremo", "De Albeschikker", "O Determinante supremo", "Всевластный"],
  [71, "Al-Muqaddim", "Der Voranstellende", "El que adelanta", "Colui che fa avanzare", "De Vooruitbrenger", "O que adianta", "Приближающий"],
  [72, "Al-Mu'akhkhir", "Der Aufschiebende", "El que pospone", "Colui che posticipa", "De Uitsteller", "O que atrasa", "Отдаляющий"],
  [73, "Al-Awwal", "Der Erste", "El Primero", "Il Primo", "De Eerste", "O Primeiro", "Первый"],
  [74, "Al-Ākhir", "Der Letzte", "El Último", "L'Ultimo", "De Laatste", "O Último", "Последний"],
  [75, "Aẓ-Ẓāhir", "Der Offenbare", "El Manifiesto", "Il Manifesto", "De Zichtbare", "O Manifesto", "Явный"],
  [76, "Al-Bāṭin", "Der Verborgene", "El Oculto", "Il Nascosto", "De Verborgene", "O Oculto", "Сокровенный"],
  [77, "Al-Wālī", "Der Herrscher und Lenker", "El Señor que gobierna", "Il Signore che governa", "De Besturende Meester", "O Senhor que governa", "Правящий Владыка"],
  [78, "Al-Muta'ālī", "Der Hocherhabene", "El Sublime", "Il Sublime", "De Hoogverhevene", "O Sublime", "Превознесённый"],
  [79, "Al-Barr", "Der Gütige", "El Benefactor", "Il Benefattore", "De Weldadige", "O Benfeitor", "Благостный"],
  [80, "At-Tawwāb", "Der die Reue Annehmende", "El que acepta el arrepentimiento", "Colui che accoglie il pentimento", "De Aanvaarder van berouw", "O que aceita o arrependimento", "Принимающий покаяние"],
  [81, "Al-Muntaqim", "Der Vergelter des Unrechts", "El que hace justicia del mal", "Colui che rende giustizia", "De Vergelder van het kwaad", "O que faz justiça ao mal", "Воздающий за зло"],
  [82, "Al-'Afuww", "Der Verzeihende, der auslöscht", "El Indulgente que borra", "L'Indulgente che cancella", "De Milde Uitwisser", "O Indulgente que apaga", "Снисходительный, стирающий грехи"],
  [83, "Ar-Ra'ūf", "Der Mitleidvolle", "El Compasivo benevolente", "Il Clemente compassionevole", "De Meedogende", "O Compassivo", "Сострадательный"],
  [84, "Mālik-ul-Mulk", "Der Besitzer aller Herrschaft", "El Dueño del Reino", "Il Padrone del Regno", "De Bezitter van het Koninkrijk", "O Dono do Reino", "Владыка царства"],
  [85, "Dhū-l-Jalāli wa-l-Ikrām", "Der Herr von Majestät und Ehre", "El Señor de Majestad y Generosidad", "Il Signore di Maestà e Munificenza", "De Heer van Majesteit en Eer", "O Senhor de Majestade e Honra", "Обладатель величия и щедрости"],
  [86, "Al-Muqsiṭ", "Der gerecht Handelnde", "El Equitativo", "L'Equo", "De Billijke", "O Equitativo", "Беспристрастный"],
  [87, "Al-Jāmi'", "Der Versammelnde", "El Reunificador", "Il Riunitore", "De Verzamelaar", "O Reunidor", "Собирающий"],
  [88, "Al-Ghaniyy", "Der Reiche, der niemanden braucht", "El Rico que de nada necesita", "Il Ricco che basta a Sé", "De Rijke die niets behoeft", "O Rico que de nada precisa", "Богатый, ни в ком не нуждающийся"],
  [89, "Al-Mughnī", "Der Reichmachende", "El Enriquecedor", "Colui che arricchisce", "De Verrijker", "O Enriquecedor", "Обогащающий"],
  [90, "Al-Māni'", "Der Abwehrende, der bewahrt", "El que protege impidiendo", "Colui che protegge impedendo", "De Weerhoudende Beschermer", "O que protege impedindo", "Оберегающий, удерживая"],
  [91, "Aḍ-Ḍārr", "Der durch Leid Prüfende", "El que prueba con la adversidad", "Colui che prova con l'avversità", "De Beproever", "O que prova com a adversidade", "Испытывающий невзгодами"],
  [92, "An-Nāfi'", "Der Nutzen Gewährende", "El que concede el beneficio", "Colui che concede il beneficio", "De Schenker van voordeel", "O que concede o proveito", "Дарующий пользу"],
  [93, "An-Nūr", "Das Licht", "La Luz", "La Luce", "Het Licht", "A Luz", "Свет"],
  [94, "Al-Hādī", "Der Führende", "El Guía", "La Guida", "De Gids", "O Guia", "Ведущий прямым путём"],
  [95, "Al-Badī'", "Der unvergleichliche Erschaffer", "El Inventor incomparable", "L'Ideatore incomparabile", "De Weergaloze Schepper", "O Inventor incomparável", "Несравненный Создатель"],
  [96, "Al-Bāqī", "Der ewig Bleibende", "El Permanente", "Il Permanente", "De Blijvende", "O Permanente", "Вечный"],
  [97, "Al-Wārith", "Der Erbe aller Dinge", "El Heredero de todo", "L'Erede di ogni cosa", "De Erfgenaam van alles", "O Herdeiro de tudo", "Наследник всего"],
  [98, "Ar-Rashīd", "Der unfehlbare Führer", "El Guía infalible", "La Guida infallibile", "De Onfeilbare Gids", "O Guia infalível", "Направляющий верно"],
  [99, "Aṣ-Ṣabūr", "Der Geduldige", "El Paciente", "Il Paziente", "De Geduldige", "O Paciente", "Терпеливый"],
];

const data = JSON.parse(readFileSync(NAMES_PATH, "utf8"));
if (data.entries.length !== 99 || GLOSSES.length !== 99) {
  throw new Error(`Expected 99 entries, got ${data.entries.length} names / ${GLOSSES.length} glosses`);
}

for (const [number, translit, de, es, it, nl, pt, ru] of GLOSSES) {
  const entry = data.entries[number - 1];
  if (entry.number !== number || entry.transliteration !== translit) {
    throw new Error(`Misalignment at ${number}: dataset has ${entry.number} ${entry.transliteration}, table has ${translit}`);
  }
  entry.meaning = { ...entry.meaning, de, es, it, nl, pt, ru };
}

data._readme = data._readme.replace(
  /transliterations? and (the )?French renderings are editorial/i,
  "transliterations and the French/German/Spanish/Italian/Dutch/Portuguese/Russian renderings are editorial",
);

writeFileSync(NAMES_PATH, JSON.stringify(data) + "\n");
console.log("names.json: merged de/es/it/nl/pt/ru glosses for all 99 names");
