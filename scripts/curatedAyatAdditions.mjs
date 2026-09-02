/**
 * Curated additions to the notification corpus — the whitelist consumed by
 * scripts/extendCorpus.mjs.
 *
 * WHY THIS LIST EXISTS
 * --------------------
 * scripts/buildFullCorpus.mjs selected the original 300 āyāt by mechanical
 * criteria plus a round-robin "one per surah" top-up, which meant a long
 * list of āyāt any practising Muslim recognises on sight — the parable of
 * the grain of charity (2:261), "you will never attain righteousness until
 * you spend of what you love" (3:92), "Allah wrongs not even an atom's
 * weight" (4:40), Yusuf's dua (12:101), "We made the Qur'an easy to
 * remember" (54:17), "He is the First and the Last" (57:3), Surat al-Ikhlas'
 * opening (112:1) — never made the cut, while the same surah's slot went to a
 * mechanically "quotable" but forgettable neighbour.
 *
 * HOW IT WAS BUILT
 * ----------------
 * Every id here was individually read (Arabic + the English edition, and the
 * failing edition wherever the mechanical check objected) against the
 * reviewer checklist in docs/CORPUS.md, item 4 — "standalone adequacy":
 *
 *   - It passes the same mechanical filter buildFullCorpus.mjs applies
 *     (length bounds, no mid-sentence opening in any Latin-script edition,
 *     no continuation/referential opening, no trailing-continuation
 *     punctuation in any edition) — extendCorpus.mjs re-checks this and
 *     refuses anything that fails, except for the explicit exceptions
 *     listed in MECHANICAL_CHECK_EXCEPTIONS below.
 *   - It reads as one complete thought without its neighbours. Candidates
 *     that are grammatically complete but whose subject is only known from
 *     the previous āyah ("So We answered his call…", "He said: …", "Fear
 *     not, I am with you both") were left out even when they are famous.
 *   - It is not a legal ruling stated without its conditions, not a war
 *     directive, and not a bare threat. Two well-known āyāt that attribute
 *     misfortune to one's own deeds (4:79, 42:30) were deliberately left
 *     out: true and widely cited, but read cold on a lock screen by
 *     someone who is ill or grieving they land as blame, and this corpus
 *     has no way to attach the context that softens them.
 *   - Duplicates of content already shipped were skipped (94:6 repeats 94:5
 *     word for word; 112:3-4 continue 112:1-2).
 *
 * Text is never typed here: extendCorpus.mjs copies the Arabic and all
 * eleven translations verbatim from src/data/quran/ (the full-Qur'an reader
 * dataset, built from the exact same editions as the corpus — see
 * docs/CORPUS.md "Full Qur'an reader"), and fetches the matching tafsir from
 * the same source scripts/fetchTafsir.mjs uses.
 *
 * Like every other corpus asset this is `technically_verified` + one careful
 * reading, not a scholar's review. Getting an entry wrong costs a reader an
 * āyah that reads awkwardly out of context — remove it from this list and
 * from the corpus JSON files (or rebuild with buildFullCorpus.mjs and re-run
 * extendCorpus.mjs) to drop it.
 */

/**
 * Ids that fail the mechanical check but were admitted on inspection. Keep
 * this list short and justify every entry.
 */
export const MECHANICAL_CHECK_EXCEPTIONS = new Map([
  // 35 English characters, under the 40-character floor that guards against
  // fragments — but "Successful indeed are the believers" (qad aflaḥa
  // l-mu'minūn) is a complete, famous sentence in every edition.
  ["23:1", "under the English length floor, but a complete sentence in every edition"],
  // (29:64 — "this worldly life is only amusement and play…" — was
  // considered here too: the Chinese edition ends it with "……" for the
  // Arabic's own unfinished "law kānū ya'lamūn", not for a run-on. It was
  // left out anyway, because tests/unit/corpusIntegrity.test.ts treats any
  // trailing ellipsis in a shipped translation as truncation, and one
  // āyah is not worth weakening that check; 6:32 and 47:36 carry the same
  // teaching.)
]);

export const CURATED_AYAT_ADDITIONS = [
  // Al-Baqarah
  "2:45", "2:110", "2:112", "2:115", "2:148", "2:183", "2:195", "2:245", "2:261", "2:262", "2:263", "2:271", "2:274", "2:277", "2:281",
  // Al 'Imran
  "3:92", "3:102", "3:145", "3:160",
  // An-Nisa
  "4:32", "4:40", "4:58", "4:69", "4:82", "4:85", "4:103", "4:114", "4:124", "4:148",
  // Al-Ma'idah
  "5:35", "5:90", "5:100",
  // Al-An'am
  "6:17", "6:32", "6:54", "6:103", "6:115", "6:120", "6:132", "6:160",
  // Al-A'raf
  "7:31", "7:34", "7:42", "7:55", "7:128", "7:180", "7:200", "7:201", "7:204", "7:205",
  // Al-Anfal, At-Tawbah
  "8:46", "9:119",
  // Yunus, Hud, Yusuf
  "10:25", "10:26", "10:44", "10:107",
  "11:90", "11:115", "11:123",
  "12:53", "12:101", "12:111",
  // Ar-Ra'd, Ibrahim, Al-Hijr
  "13:29", "13:39",
  "14:24", "14:27", "14:40", "14:41",
  "15:49", "15:87",
  // An-Nahl
  "16:78", "16:96", "16:98", "16:114", "16:125", "16:126", "16:128",
  // Al-Isra
  "17:9", "17:26", "17:29", "17:36", "17:37", "17:44", "17:79", "17:82", "17:84", "17:111",
  // Al-Kahf, Maryam, Ta-Ha
  "18:7", "18:45", "18:109", "18:110",
  "19:65",
  "20:2", "20:7", "20:8", "20:55", "20:82", "20:131", "20:132",
  // Al-Anbiya, Al-Hajj, Al-Mu'minun, An-Nur, Al-Furqan
  "21:30", "21:47", "21:69", "21:94",
  "22:37", "22:38", "22:77",
  "23:1", "23:62", "23:96", "23:97", "23:109", "23:118",
  "24:30", "24:51", "24:52", "24:56",
  "25:1", "25:58", "25:62", "25:72", "25:75",
  // Ash-Shu'ara → Al-'Ankabut
  "26:83",
  "27:62", "27:89",
  "28:54", "28:60", "28:70", "28:83", "28:84", "28:88",
  "29:5", "29:6", "29:41", "29:43", "29:57", "29:60",
  // Ar-Rum, Luqman, As-Sajdah, Al-Ahzab, Saba, Fatir
  "30:22", "30:23", "30:38", "30:41", "30:50", "30:54",
  "31:12", "31:16", "31:27", "31:34",
  "32:17",
  "33:3", "33:40", "33:43",
  "34:37",
  "35:5", "35:6", "35:10", "35:29", "35:34",
  // Ya-Sin, As-Saffat, Sad, Az-Zumar, Ghafir
  "36:40", "36:55", "36:58", "36:68", "36:83",
  "37:100", "37:180",
  "38:29", "38:87",
  "39:42", "39:54", "39:61", "39:62", "39:66", "39:73",
  "40:17", "40:19", "40:39", "40:40", "40:44", "40:65",
  // Fussilat, Ash-Shura, Az-Zukhruf, Al-Jathiyah, Al-Ahqaf, Muhammad, Al-Hujurat, Qaf
  "41:30", "41:33", "41:36", "41:53",
  "42:11", "42:25", "42:27", "42:28", "42:36", "42:43",
  "43:67", "43:68",
  "45:13", "45:20",
  "46:13",
  "47:24", "47:33", "47:36",
  "49:6",
  "50:37",
  // Adh-Dhariyat → Al-Hadid
  "51:22", "51:49", "51:50",
  "53:62",
  "54:17", "54:49",
  "55:26", "55:29", "55:46", "55:78",
  "57:1", "57:3", "57:16", "57:18", "57:21",
  // Al-Hashr → Al-Mulk
  "59:19", "59:20",
  "61:3", "61:8",
  "62:8", "62:9",
  "63:10", "63:11",
  "64:13", "64:15", "64:16", "64:17",
  "66:8",
  "67:1", "67:3", "67:12", "67:13", "67:14", "67:15", "67:19", "67:23",
  // Al-Haqqah → At-Takathur
  "69:43", "69:52",
  "70:5",
  "71:28",
  "72:20",
  "73:8", "73:10", "73:19",
  "74:38",
  "75:40",
  "76:25",
  "78:31",
  "82:6", "82:13",
  "85:14",
  "87:1", "87:9",
  "88:17", "88:21",
  "91:9",
  "96:3",
  "97:1",
  "98:7", "98:8",
  "102:1",
  "108:1", "108:2",
  "112:1",
];
