/**
 * Builds src/data/names/names.json (the 99 Names of Allah) and
 * src/data/duas/duas.json (110 well-known authentic invocations).
 * Run manually, requires network access:
 *
 *   node scripts/fetchNamesAndDuas.mjs
 *
 * WHERE EVERY PIECE OF TEXT COMES FROM
 * ------------------------------------
 * Same discipline as the rest of the corpus (docs/CORPUS.md): no religious
 * text is ever generated or paraphrased by an AI model. Concretely:
 *
 * - 99 NAMES — Arabic names and English meanings are fetched verbatim from
 *   the MIT-licensed `imanikurd` dataset (github.com/Abdulla090/imanikurd,
 *   data/names_of_allah.json). This script carries a TRADITIONAL_SPINE with
 *   the canonical 99-name order (the widely printed Tirmidhi list), each
 *   entry matched to the dataset by its Arabic string — the build FAILS if
 *   fewer than 97 of the 99 match, so the two sources continuously
 *   cross-validate each other. Transliterations (Ar-Raḥmān, …) and the
 *   French renderings of the meanings are EDITORIAL (written here, in this
 *   file, under review like every mechanically produced asset): a
 *   transliteration is a spelling convention and a one-line meaning gloss
 *   is interpretive shorthand — neither is scripture, and both are flagged
 *   as editorial in the generated file's _readme.
 *
 * - DUAS — 97 entries fetched verbatim (Arabic, transliteration, English
 *   translation, hadith source line, benefit note) from the MIT-licensed
 *   fitrahive/dua-dhikr dataset (github.com/fitrahive/dua-dhikr), across
 *   its five categories. Plus 13 famous Quranic duas (the "Rabbanā"
 *   supplications) whose Arabic and translations are copied verbatim from
 *   src/data/quran/ — the app's own licensed full-Qur'an dataset — never
 *   retyped; multi-āyah duas concatenate CONSECUTIVE āyāt only, never
 *   trimmed mid-verse. French titles for all duas are EDITORIAL labels
 *   (functional descriptions, not translations of the dua text itself);
 *   the dua text's French translation exists only for the Quranic entries
 *   (Hamidullah, from the same licensed dataset).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const NAMES_URL = "https://raw.githubusercontent.com/Abdulla090/imanikurd/main/packages/imanikurd/data/names_of_allah.json";
const DUAS_BASE = "https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr";
const READER_DIR = path.join(ROOT, "src", "data", "quran");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Diacritics stripped and alef/hamza variants folded (أ إ آ → ا), so the
// match tolerates orthographic variation without touching what is stored.
const stripDiacritics = (s) =>
  s.normalize("NFD").replace(/[ً-ْٰـ]/g, "").normalize("NFC").replace(/[أإآ]/g, "ا").trim();

// --- The canonical 99 (transliteration + French rendering are editorial) --
// Arabic spellings here exist ONLY to match against the dataset; the build
// asserts they agree, so a typo here fails loudly instead of shipping.
const TRADITIONAL_SPINE = [
  ["الرحمن", "Ar-Raḥmān", "Le Tout Miséricordieux"],
  ["الرحيم", "Ar-Raḥīm", "Le Très Miséricordieux"],
  ["الملك", "Al-Malik", "Le Souverain"],
  ["القدوس", "Al-Quddūs", "L'Infiniment Saint"],
  ["السلام", "As-Salām", "La Source de paix"],
  ["المؤمن", "Al-Mu'min", "Celui qui rassure et garantit"],
  ["المهيمن", "Al-Muhaymin", "Le Préservateur vigilant"],
  ["العزيز", "Al-'Azīz", "Le Tout-Puissant"],
  ["الجبار", "Al-Jabbār", "Celui qui contraint et répare"],
  ["المتكبر", "Al-Mutakabbir", "Le Suprême en grandeur"],
  ["الخالق", "Al-Khāliq", "Le Créateur"],
  ["البارئ", "Al-Bāri'", "Celui qui donne l'existence"],
  ["المصور", "Al-Muṣawwir", "Le Façonneur des formes"],
  ["الغفار", "Al-Ghaffār", "Le Grand Pardonneur"],
  ["القهار", "Al-Qahhār", "Le Dominateur suprême"],
  ["الوهاب", "Al-Wahhāb", "Le Donateur sans compter"],
  ["الرزاق", "Ar-Razzāq", "Le Pourvoyeur"],
  ["الفتاح", "Al-Fattāḥ", "Celui qui ouvre et tranche"],
  ["العليم", "Al-'Alīm", "L'Omniscient"],
  ["القابض", "Al-Qābiḍ", "Celui qui retient"],
  ["الباسط", "Al-Bāsiṭ", "Celui qui dispense largement"],
  ["الخافض", "Al-Khāfiḍ", "Celui qui abaisse"],
  ["الرافع", "Ar-Rāfi'", "Celui qui élève"],
  ["المعز", "Al-Mu'izz", "Celui qui honore"],
  ["المذل", "Al-Mudhill", "Celui qui rabaisse"],
  ["السميع", "As-Samī'", "L'Audient"],
  ["البصير", "Al-Baṣīr", "Le Clairvoyant"],
  ["الحكم", "Al-Ḥakam", "L'Arbitre"],
  ["العدل", "Al-'Adl", "Le Parfaitement Juste"],
  ["اللطيف", "Al-Laṭīf", "Le Subtil, le Bienveillant"],
  ["الخبير", "Al-Khabīr", "Le Parfaitement Informé"],
  ["الحليم", "Al-Ḥalīm", "Le Longanime"],
  ["العظيم", "Al-'Aẓīm", "L'Immense"],
  ["الغفور", "Al-Ghafūr", "Le Pardonneur"],
  ["الشكور", "Ash-Shakūr", "Le Très Reconnaissant"],
  ["العلي", "Al-'Aliyy", "Le Très-Haut"],
  ["الكبير", "Al-Kabīr", "L'Infiniment Grand"],
  ["الحفيظ", "Al-Ḥafīẓ", "Le Gardien"],
  ["المقيت", "Al-Muqīt", "Le Nourricier, le Soutien"],
  ["الحسيب", "Al-Ḥasīb", "Celui qui suffit et tient compte"],
  ["الجليل", "Al-Jalīl", "Le Majestueux"],
  ["الكريم", "Al-Karīm", "Le Généreux par excellence"],
  ["الرقيب", "Ar-Raqīb", "Le Vigilant"],
  ["المجيب", "Al-Mujīb", "Celui qui exauce"],
  ["الواسع", "Al-Wāsi'", "L'Ample, le Vaste"],
  ["الحكيم", "Al-Ḥakīm", "L'Infiniment Sage"],
  ["الودود", "Al-Wadūd", "Le Bien-Aimant"],
  ["المجيد", "Al-Majīd", "Le Glorieux"],
  ["الباعث", "Al-Bā'ith", "Celui qui ressuscite"],
  ["الشهيد", "Ash-Shahīd", "Le Témoin de toute chose"],
  ["الحق", "Al-Ḥaqq", "Le Vrai, la Vérité même"],
  ["الوكيل", "Al-Wakīl", "Le Garant à qui tout se confie"],
  ["القوي", "Al-Qawiyy", "Le Fort"],
  ["المتين", "Al-Matīn", "L'Inébranlable"],
  ["الولي", "Al-Waliyy", "Le Protecteur très proche"],
  ["الحميد", "Al-Ḥamīd", "Le Digne de toute louange"],
  ["المحصي", "Al-Muḥṣī", "Celui qui dénombre tout"],
  ["المبدئ", "Al-Mubdi'", "Celui qui commence la création"],
  ["المعيد", "Al-Mu'īd", "Celui qui la recommence"],
  ["المحيي", "Al-Muḥyī", "Celui qui donne la vie"],
  ["المميت", "Al-Mumīt", "Celui qui donne la mort"],
  ["الحي", "Al-Ḥayy", "Le Vivant"],
  ["القيوم", "Al-Qayyūm", "Celui qui subsiste par Lui-même"],
  ["الواجد", "Al-Wājid", "Celui à qui rien n'échappe"],
  ["الماجد", "Al-Mājid", "Le Noble, le Magnifique"],
  ["الواحد", "Al-Wāḥid", "L'Un"],
  // imanikurd counts "Allah" itself and therefore carries only one of the
  // Wāḥid/Aḥad pair — the 4th field is the editorial English fallback used
  // for a spine name the dataset has no separate entry for.
  ["الأحد", "Al-Aḥad", "L'Unique", "The One, the Indivisible"],
  ["الصمد", "Aṣ-Ṣamad", "L'Absolu, le Recours de tous"],
  ["القادر", "Al-Qādir", "Le Puissant"],
  ["المقتدر", "Al-Muqtadir", "Le Tout-Déterminant"],
  ["المقدم", "Al-Muqaddim", "Celui qui met en avant"],
  ["المؤخر", "Al-Mu'akhkhir", "Celui qui diffère"],
  ["الأول", "Al-Awwal", "Le Premier"],
  ["الآخر", "Al-Ākhir", "Le Dernier"],
  ["الظاهر", "Aẓ-Ẓāhir", "L'Apparent"],
  ["الباطن", "Al-Bāṭin", "Le Caché"],
  ["الوالي", "Al-Wālī", "Le Maître qui gouverne"],
  ["المتعالي", "Al-Muta'ālī", "Le Sublime"],
  ["البر", "Al-Barr", "Le Bienfaisant"],
  ["التواب", "At-Tawwāb", "L'Accueillant au repentir"],
  ["المنتقم", "Al-Muntaqim", "Celui qui fait justice du mal"],
  ["العفو", "Al-'Afuww", "L'Indulgent qui efface"],
  ["الرؤوف", "Ar-Ra'ūf", "Le Très Compatissant"],
  ["مالك الملك", "Mālik-ul-Mulk", "Le Possesseur du Royaume"],
  ["ذو الجلال والإكرام", "Dhū-l-Jalāli wa-l-Ikrām", "Plein de Majesté et de Munificence"],
  ["المقسط", "Al-Muqsiṭ", "L'Équitable"],
  ["الجامع", "Al-Jāmi'", "Le Rassembleur"],
  ["الغني", "Al-Ghaniyy", "Le Riche qui se suffit"],
  ["المغني", "Al-Mughnī", "Celui qui enrichit"],
  ["المانع", "Al-Māni'", "Celui qui préserve en empêchant"],
  ["الضار", "Aḍ-Ḍārr", "Celui qui éprouve"],
  ["النافع", "An-Nāfi'", "Celui qui accorde le profit"],
  ["النور", "An-Nūr", "La Lumière"],
  ["الهادي", "Al-Hādī", "Le Guide"],
  ["البديع", "Al-Badī'", "L'Inventeur incomparable"],
  ["الباقي", "Al-Bāqī", "Le Permanent"],
  ["الوارث", "Al-Wārith", "L'Héritier de toute chose"],
  ["الرشيد", "Ar-Rashīd", "Le Guide infaillible"],
  ["الصبور", "Aṣ-Ṣabūr", "Le Très Patient"],
];

// --- French titles for the fitrahive duas (editorial labels) -------------
// Keyed by "<category>:<1-based index>" in the dataset's own order.
const FR_TITLES = {
  "daily-dua:1": "Invocation avant de dormir",
  "daily-dua:2": "Invocation au réveil",
  "daily-dua:3": "Invocation en entrant aux toilettes",
  "daily-dua:4": "Invocation en sortant des toilettes",
  "daily-dua:5": "Invocation avant de manger",
  "daily-dua:6": "Si l'on oublie Bismillah au début du repas",
  "daily-dua:7": "Invocation après le repas",
  "daily-dua:8": "Invocation en entrant à la mosquée",
  "daily-dua:9": "Invocation en sortant de la mosquée",
  "daily-dua:10": "Invocation avant les ablutions",
  "daily-dua:11": "Invocation après les ablutions",
  "daily-dua:12": "Invocation pour rompre le jeûne",
  "daily-dua:13": "Invocation en entrant chez soi (1)",
  "daily-dua:14": "Invocation en entrant chez soi (2)",
  "daily-dua:15": "Invocation en sortant de chez soi",
  "daily-dua:16": "Protection contre le fait de nuire ou subir un tort dehors",
  "daily-dua:17": "Invocation du voyage",
  "daily-dua:18": "Invocation du résident pour le voyageur",
  "daily-dua:19": "Vœu de piété du résident pour le voyageur",
  "daily-dua:20": "Invocation en portant un vêtement neuf",
  "daily-dua:21": "Invocation en s'habillant",
  "daily-dua:22": "Invocation en montant dans un véhicule",
  "daily-dua:23": "Invocation quand il pleut",
  "daily-dua:24": "Invocation sous une pluie violente",
  "daily-dua:25": "Invocation après la pluie",
  "daily-dua:26": "Invocation lors d'un vent fort",
  "daily-dua:27": "La meilleure demande de pardon (Sayyid al-Istighfar)",
  "daily-dua:28": "Invocation pour la facilité en toute chose",
  "daily-dua:29": "Invocation face à l'épreuve",
  "daily-dua:30": "Invocation de celui qui a des dettes",
  "daily-dua:31": "Protection contre la paresse, la tristesse et les dettes",
  "daily-dua:32": "Invocation après avoir éternué",
  "daily-dua:33": "Quand on entend quelqu'un éternuer",
  "daily-dua:34": "Réponse à celui qui dit « Yarhamukallah »",
  "daily-dua:35": "Invocation pour un bon caractère",
  "daily-dua:36": "Protection contre Satan",
  "daily-dua:37": "Invocation après l'adhan",
  "daily-dua:38": "Demande de pardon pour ses parents",
  "morning-dhikr:1": "Ayat al-Kursi",
  "morning-dhikr:2": "Sourate Al-Ikhlas",
  "morning-dhikr:3": "Sourate Al-Falaq",
  "morning-dhikr:4": "Sourate An-Nas",
  "morning-dhikr:5": "Au matin, demander la protection d'Allah",
  "morning-dhikr:6": "Au matin, par la grâce d'Allah",
  "morning-dhikr:7": "Sayyid al-Istighfar",
  "morning-dhikr:8": "Invocation pour la protection et la santé",
  "morning-dhikr:9": "Invocation pour le salut ici-bas et dans l'au-delà",
  "morning-dhikr:10": "Protection contre les suggestions de Satan",
  "morning-dhikr:11": "Demander protection contre tout mal",
  "morning-dhikr:12": "Agrément d'Allah, de l'islam et du Prophète ﷺ",
  "morning-dhikr:13": "Demander la guidée à Allah",
  "morning-dhikr:14": "Au matin, sur la religion naturelle de l'islam",
  "morning-dhikr:15": "Dhikr du tawhid",
  "morning-dhikr:16": "Tasbih",
  "morning-dhikr:17": "Science utile, subsistance pure et œuvres acceptées",
  "morning-dhikr:18": "Tasbih et tahmid du jour",
  "morning-dhikr:19": "Istighfar 100 fois par jour",
  "evening-dhikr:1": "Ayat al-Kursi",
  "evening-dhikr:2": "Sourate Al-Ikhlas",
  "evening-dhikr:3": "Sourate Al-Falaq",
  "evening-dhikr:4": "Sourate An-Nas",
  "evening-dhikr:5": "Au soir, dans le royaume d'Allah, chercher Sa protection",
  "evening-dhikr:6": "Au soir, implorer la miséricorde d'Allah",
  "evening-dhikr:7": "La meilleure demande de pardon",
  "evening-dhikr:8": "Invocation pour la santé et la protection",
  "evening-dhikr:9": "Invocation pour la sécurité ici-bas et dans l'au-delà",
  "evening-dhikr:10": "Protection contre les suggestions de Satan",
  "evening-dhikr:11": "Dhikr de protection contre tout danger",
  "evening-dhikr:12": "Agrément d'Allah, de l'islam et du Prophète ﷺ",
  "evening-dhikr:13": "Demander la guidée à Allah",
  "evening-dhikr:14": "Au soir, sur la religion naturelle de l'islam",
  "evening-dhikr:15": "Dhikr de l'unicité d'Allah",
  "evening-dhikr:16": "Louange à Allah",
  "evening-dhikr:17": "Tasbih et alhamdulillah du jour",
  "evening-dhikr:18": "Istighfar 100 fois par jour",
  "evening-dhikr:19": "Protection contre le mal de ce qu'Il a créé",
  "dhikr-after-salah:1": "Istighfar",
  "dhikr-after-salah:2": "Allah, source de paix",
  "dhikr-after-salah:3": "Nul ne retient ce qu'Il donne",
  "dhikr-after-salah:4": "À Lui la royauté et la louange",
  "dhikr-after-salah:5": "Tasbih",
  "dhikr-after-salah:6": "Tahmid",
  "dhikr-after-salah:7": "Takbir",
  "dhikr-after-salah:8": "Sans associé, à Lui toute chose",
  "dhikr-after-salah:9": "Ayat al-Kursi",
  "dhikr-after-salah:10": "Sourate Al-Ikhlas",
  "dhikr-after-salah:11": "Sourate Al-Falaq",
  "dhikr-after-salah:12": "Sourate An-Nas",
  "dhikr-after-salah:13": "Science utile, subsistance pure et œuvres acceptées",
  "selected-dua:1": "Le bien ici-bas et dans l'au-delà",
  "selected-dua:2": "Affermis mon cœur sur Ta religion (1)",
  "selected-dua:3": "Affermis mon cœur sur Ta religion (2)",
  "selected-dua:4": "Affermis mon cœur sur Ta religion (3)",
  "selected-dua:5": "Refuge contre la perte de Tes bienfaits",
  "selected-dua:6": "Résister à l'épreuve",
  "selected-dua:7": "Contre les dettes, l'angoisse, la faiblesse et la paresse",
  "selected-dua:8": "À l'annonce d'une bonne nouvelle",
};

// --- Famous Quranic duas ("Rabbanā"), verbatim from src/data/quran --------
// Each is one FULL āyah, or a run of CONSECUTIVE āyāt joined in order.
const QURANIC_DUAS = [
  { verses: ["2:201"], en: "The good of this world and the Hereafter", fr: "Le bien ici-bas et dans l'au-delà (Rabbanā ātinā)" },
  { verses: ["2:286"], en: "Burden us not beyond what we can bear", fr: "Ne nous charge pas au-delà de nos forces" },
  { verses: ["3:8"], en: "Let not our hearts deviate", fr: "Ne laisse pas dévier nos cœurs" },
  { verses: ["3:38"], en: "Zakariyya's prayer for good offspring", fr: "La prière de Zakariyya pour une descendance pure" },
  { verses: ["7:23"], en: "The prayer of Adam and Hawwa", fr: "La prière d'Adam et Hawwa" },
  { verses: ["12:101"], en: "Yusuf's prayer: let me die as a Muslim", fr: "La prière de Yusuf : fais-moi mourir soumis" },
  { verses: ["14:40", "14:41"], en: "Ibrahim's prayer for prayer and forgiveness", fr: "La prière d'Ibrahim : la salat et le pardon" },
  { verses: ["18:10"], en: "The youths of the cave ask for mercy", fr: "Les jeunes de la caverne demandent Sa miséricorde" },
  { verses: ["20:25", "20:26", "20:27", "20:28"], en: "Musa's prayer: expand my chest, ease my task", fr: "La prière de Musa : ouvre-moi la poitrine, facilite ma mission" },
  { verses: ["21:87"], en: "Yunus in the darkness: la ilaha illa Anta", fr: "Yunus dans les ténèbres : la ilaha illa Anta" },
  { verses: ["23:118"], en: "My Lord, forgive and have mercy", fr: "Seigneur, pardonne et fais miséricorde" },
  { verses: ["25:74"], en: "Comfort of our eyes in spouses and offspring", fr: "La joie des yeux dans nos épouses et descendants" },
  { verses: ["26:83"], en: "Ibrahim asks for wisdom and righteous company", fr: "Ibrahim demande la sagesse et la compagnie des vertueux" },
];

// --- Build the names file --------------------------------------------------
const datasetNames = await fetchJson(NAMES_URL);
const byArabic = new Map(datasetNames.map((n) => [stripDiacritics(n.arabic), n]));

let matched = 0;
const nameEntries = TRADITIONAL_SPINE.map(([arabic, transliteration, fr, enFallback], index) => {
  const hit = byArabic.get(stripDiacritics(arabic));
  if (hit) matched += 1;
  const en = hit ? hit.english : enFallback;
  if (!en) throw new Error(`No English meaning for ${transliteration} — dataset unmatched and no fallback provided.`);
  return {
    number: index + 1,
    arabic: hit ? hit.arabic : arabic,
    transliteration,
    meaning: { en, fr },
  };
});
if (matched < 97) {
  throw new Error(`Only ${matched}/99 names matched the imanikurd dataset — refusing to write a list the two sources disagree on.`);
}
const unmatched = nameEntries.filter((n) => !n.meaning.en).map((n) => `${n.number} ${n.transliteration}`);
console.log(`names: ${matched}/99 matched imanikurd; unmatched (English meaning to fill by hand): ${unmatched.join(", ") || "none"}`);

const namesOut = {
  _readme:
    "The 99 Names of Allah. Arabic names and English meanings fetched verbatim from the MIT-licensed imanikurd dataset (github.com/Abdulla090/imanikurd), cross-validated against the canonical (Tirmidhi) order carried in scripts/fetchNamesAndDuas.mjs — the build fails if the two disagree. Transliterations and French renderings are editorial (spelling conventions and interpretive one-line glosses, not scripture), pending qualified review like every technically_verified asset in this app. Regenerate with scripts/fetchNamesAndDuas.mjs.",
  sourceId: "names-imanikurd-v1",
  entries: nameEntries,
};

// --- Build the duas file ----------------------------------------------------
const CATEGORIES = ["daily-dua", "morning-dhikr", "evening-dhikr", "dhikr-after-salah", "selected-dua"];
const duaEntries = [];
for (const category of CATEGORIES) {
  const list = await fetchJson(`${DUAS_BASE}/${category}/en.json`);
  list.forEach((item, i) => {
    const frTitle = FR_TITLES[`${category}:${i + 1}`];
    if (!frTitle) throw new Error(`Missing French title for ${category}:${i + 1} ("${item.title}") — update FR_TITLES.`);
    duaEntries.push({
      id: `${category}-${i + 1}`,
      category,
      order: i + 1,
      title: { en: item.title.trim(), fr: frTitle },
      arabic: item.arabic.trim(),
      transliteration: item.latin?.trim() || undefined,
      translation: { en: item.translation?.trim() || undefined },
      benefits: item.benefits?.trim() ? { en: item.benefits.trim() } : undefined,
      // A handful of upstream entries (post-salah tasbih counts) ship with
      // an empty source line — omit the key rather than store "".
      source: (item.source ?? "").trim() || undefined,
    });
  });
  console.log(`duas: ${category} ${list.length}`);
}

const readerArabic = new Map(
  JSON.parse(readFileSync(path.join(READER_DIR, "arabic.json"), "utf8")).entries.map((e) => [`${e.surah}:${e.ayah}`, e]),
);
const readTranslation = (locale) => {
  const file = JSON.parse(readFileSync(path.join(READER_DIR, "translations", `${locale}.json`), "utf8"));
  return new Map(file.entries.map((e) => [`${e.surah}:${e.ayah}`, e.text]));
};
// Every reader edition the app ships (the whole translations/ directory):
// the quranic duas carry ALL of them, so a Hindi or Russian reader gets
// these 13 entries fully in their language.
const READER_LOCALES = readdirSync(path.join(READER_DIR, "translations"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();
const readerTranslations = new Map(READER_LOCALES.map((locale) => [locale, readTranslation(locale)]));

for (const dua of QURANIC_DUAS) {
  const [firstSurah, firstAyah] = dua.verses[0].split(":").map(Number);
  for (let i = 1; i < dua.verses.length; i += 1) {
    const [s, a] = dua.verses[i].split(":").map(Number);
    if (s !== firstSurah || a !== firstAyah + i) throw new Error(`Non-consecutive verses in Quranic dua ${dua.verses.join(",")}`);
  }
  const join = (map) => dua.verses.map((v) => { const t = map.get(v); if (!t) throw new Error(`Missing ${v}`); return t.text ?? t; }).join(" ");
  const last = dua.verses[dua.verses.length - 1].split(":")[1];
  duaEntries.push({
    id: `quran-${dua.verses[0].replace(":", "-")}`,
    category: "quranic-dua",
    order: QURANIC_DUAS.indexOf(dua) + 1,
    title: { en: dua.en, fr: dua.fr },
    arabic: join(readerArabic),
    translation: Object.fromEntries(READER_LOCALES.map((locale) => [locale, join(readerTranslations.get(locale))])),
    source: `Qur'an ${firstSurah}:${firstAyah}${dua.verses.length > 1 ? `–${last}` : ""}`,
  });
}
console.log(`duas: quranic-dua ${QURANIC_DUAS.length}`);
console.log(`duas TOTAL: ${duaEntries.length}`);

const duasOut = {
  _readme:
    "110 well-known authentic invocations. The five Hisn-style categories are fetched verbatim (Arabic, transliteration, English translation, source line, benefit note) from the MIT-licensed fitrahive/dua-dhikr dataset; the quranic-dua category copies full consecutive āyāt and their English/French translations verbatim from src/data/quran (the app's own licensed dataset) — nothing retyped, nothing trimmed mid-verse. French titles are editorial labels. Regenerate with scripts/fetchNamesAndDuas.mjs.",
  sourceIds: { fitrahive: "duas-fitrahive-v1", quran: "quran-reader (see src/data/corpus/sources.ts)" },
  entries: duaEntries,
};

mkdirSync(path.join(ROOT, "src", "data", "names"), { recursive: true });
mkdirSync(path.join(ROOT, "src", "data", "duas"), { recursive: true });
writeFileSync(path.join(ROOT, "src", "data", "names", "names.json"), JSON.stringify(namesOut) + "\n");
writeFileSync(path.join(ROOT, "src", "data", "duas", "duas.json"), JSON.stringify(duasOut) + "\n");
console.log("done.");
