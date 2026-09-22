/**
 * Deterministic, rule-based romanization of fully-vocalized Arabic text —
 * the classic tashkeel-driven letter mapping (shadda doubling, sun-letter
 * assimilation of the definite article, aa/ee/oo long vowels, ' for hamza
 * and 'ayn), in the same readable style as the Hisn al-Muslim
 * transliterations the dua dataset already ships.
 *
 * This is a MECHANICAL transform in the exact sense docs/CORPUS.md uses
 * the word: a fixed, auditable character-level rule set with zero
 * linguistic or religious judgement, reproducible from the verbatim
 * Arabic on every run — the same category as the keyword theme tagger.
 * No AI model writes or edits a single output character.
 *
 * The only word-level table is FIXED_FORMULAS: the handful of honorific
 * formulas the source dataset leaves unvocalized (salla Allahu 'alayhi wa
 * sallam, radiya Allahu 'anhu, ...) — measured at >99% of all bare words
 * in the hadith corpus — plus the isnad-switch mark ح.
 */

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const SUKUN = "ْ";
const SHADDA = "ّ";
const TANWEEN_FATH = "ً";
const TANWEEN_DAMM = "ٌ";
const TANWEEN_KASR = "ٍ";
const SUPERSCRIPT_ALEF = "ٰ";
const TATWEEL = "ـ";

const DIACRITICS = new Set([FATHA, DAMMA, KASRA, SUKUN, SHADDA, TANWEEN_FATH, TANWEEN_DAMM, TANWEEN_KASR, SUPERSCRIPT_ALEF]);

/** Base consonant sounds. Contextual letters (ا و ي ى ة and hamza carriers) are handled in code. */
const CONSONANTS = {
  "ء": "'", // ء
  "ب": "b",
  "ت": "t",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "dh",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ظ": "z",
  "ع": "'",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
};

const SUN_LETTERS = new Set(["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ل", "ن"]);

/**
 * Honorific formulas the dataset writes without tashkeel (compared by
 * consonant skeleton). Fixed traditional readings, not guesses.
 */
const FIXED_FORMULAS = new Map([
  ["الله", "Allah"], // الله
  ["لله", "lillah"], // لله
  ["صلى", "salla"], // صلى
  ["عليه", "'alayhi"], // عليه
  ["وسلم", "wa sallam"], // وسلم
  ["رضى", "radiya"], // رضى
  ["رضي", "radiya"], // رضي
  ["عنه", "'anhu"], // عنه
  ["عنها", "'anha"], // عنها
  ["عنهما", "'anhuma"], // عنهما
  ["عنهم", "'anhum"], // عنهم
  ["عنهن", "'anhunna"], // عنهن
  ["ح", "(h)"], // ح — the isnad-switch mark
]);

const ARABIC_LETTER_RE = /[ء-ي]/;

function isArabicLetter(ch) {
  return ARABIC_LETTER_RE.test(ch);
}

/** Splits one word into [letter, diacritics[]] clusters. */
function clusters(word) {
  const out = [];
  for (const ch of word) {
    if (DIACRITICS.has(ch)) {
      if (out.length > 0) out[out.length - 1].marks.push(ch);
    } else {
      out.push({ letter: ch, marks: [] });
    }
  }
  return out;
}

function shortVowel(marks) {
  if (marks.includes(FATHA)) return "a";
  if (marks.includes(KASRA)) return "i";
  if (marks.includes(DAMMA)) return "u";
  if (marks.includes(TANWEEN_FATH)) return "an";
  if (marks.includes(TANWEEN_KASR)) return "in";
  if (marks.includes(TANWEEN_DAMM)) return "un";
  return "";
}

function hasNoVowelMark(marks) {
  return shortVowel(marks) === "" && !marks.includes(SUKUN);
}

/** Romanizes one whitespace-delimited Arabic word (no surrounding punctuation). */
function romanizeWord(word) {
  const skeleton = [...word].filter((ch) => isArabicLetter(ch)).join("");
  const fixed = FIXED_FORMULAS.get(skeleton);
  if (fixed !== undefined) return fixed;

  const cl = clusters(word);
  let out = "";
  let i = 0;

  // The definite article: ال + sun letter assimilates (ar-rahmaan), moon
  // letter keeps the laam (al-qamar). Detected by shadda on the letter
  // after ال (the orthographic signal of assimilation) or the sun list.
  // `at` lets the same rule apply after a one-letter prefix (bi-, wa-,
  // fa-, ka-): بِالنِّيَّاتِ → bin-niyyaati.
  const articleAt = (at, articleVowel) => {
    if (cl.length < at + 3 || cl[at].letter !== "ا" || !hasNoVowelMark(cl[at].marks) || cl[at + 1].letter !== "ل" || shortVowel(cl[at + 1].marks) !== "") {
      return false;
    }
    const next = cl[at + 2];
    if (SUN_LETTERS.has(next.letter) || next.marks.includes(SHADDA)) {
      const sound = CONSONANTS[next.letter] ?? "";
      out += `${articleVowel}${sound}-`;
      // The assimilated consonant is emitted once by the article; strip
      // its shadda so the main loop emits it single, not doubled.
      next.marks = next.marks.filter((m) => m !== SHADDA);
    } else {
      out += `${articleVowel}l-`;
    }
    i = at + 2;
    return true;
  };

  if (!articleAt(0, "a")) {
    // One-letter prefix particle (و ف ب ك) carrying its own short vowel,
    // glued to a following definite article.
    const PREFIXES = { "و": "w", "ف": "f", "ب": "b", "ك": "k" };
    const p = cl[0];
    const prefixSound = p ? PREFIXES[p.letter] : undefined;
    const prefixVowel = p ? shortVowel(p.marks) : "";
    if (prefixSound && prefixVowel.length === 1 && cl.length >= 4 && cl[1].letter === "ا") {
      const before = out;
      out += prefixSound;
      if (!articleAt(1, prefixVowel)) out = before;
    }
  }

  for (; i < cl.length; i++) {
    const { letter, marks } = cl[i];
    const vowel = shortVowel(marks);
    const nextCl = cl[i + 1];

    // No Arabic word is pronounced starting on a sukūn — the helping vowel
    // of the dropped hamzat wasl is i (bnu → ibnu, as in genealogy chains).
    if ((out === "" || out.endsWith("-")) && marks.includes(SUKUN) && CONSONANTS[letter]) {
      out += "i";
    }

    const emitLong = (v) => {
      // fatha+ا → aa, kasra+ي → ee, damma+و → oo (the following long-vowel
      // letter carries no mark of its own).
      if (v === "a" && nextCl && (nextCl.letter === "ا" || nextCl.letter === "ى") && hasNoVowelMark(nextCl.marks) && !nextCl.marks.includes(SHADDA)) {
        i += 1;
        return "aa";
      }
      if (v === "i" && nextCl && nextCl.letter === "ي" && hasNoVowelMark(nextCl.marks) && !nextCl.marks.includes(SHADDA)) {
        i += 1;
        return "ee";
      }
      if (v === "u" && nextCl && nextCl.letter === "و" && hasNoVowelMark(nextCl.marks) && !nextCl.marks.includes(SHADDA)) {
        i += 1;
        return "oo";
      }
      if (marks.includes(SUPERSCRIPT_ALEF)) return "aa";
      return v;
    };

    switch (letter) {
      case "ا": // ا
        if (i === 0) {
          // Word-initial bare alif (hamzat wasl): i before a sukun cluster
          // (istaghfir), a otherwise.
          out += vowel || (nextCl && nextCl.marks.includes(SUKUN) ? "i" : "a");
        } else if (out.endsWith("a")) {
          out += "a"; // long aa when the previous consonant's fatha was implicit
        } else if (vowel) {
          out += vowel;
        }
        break;
      case "آ": // آ
        out += "'aa";
        break;
      case "أ": // أ
        out += (i === 0 || out.endsWith("-") ? "" : "'") + emitLong(vowel || "a");
        break;
      case "إ": // إ
        out += (i === 0 || out.endsWith("-") ? "" : "'") + (vowel || "i");
        break;
      case "ؤ": // ؤ
        out += "'" + emitLong(vowel);
        break;
      case "ئ": // ئ
        out += "'" + emitLong(vowel);
        break;
      case "ى": // ى
        out += out.endsWith("a") ? "a" : "a";
        break;
      case "ة": // ة
        out += vowel ? `t${vowel}` : "h";
        break;
      case "و": { // و
        if (hasNoVowelMark(marks) && !marks.includes(SHADDA) && out.endsWith("u")) {
          out = out.slice(0, -1) + "oo"; // damma written on the previous letter only
          break;
        }
        const base = marks.includes(SHADDA) ? "ww" : "w";
        if (marks.includes(SUKUN) && /a$/.test(out)) {
          out += "w"; // diphthong aw
        } else {
          out += base + emitLong(vowel);
        }
        break;
      }
      case "ي": { // ي
        if (hasNoVowelMark(marks) && !marks.includes(SHADDA) && out.endsWith("i")) {
          out = out.slice(0, -1) + "ee";
          break;
        }
        const base = marks.includes(SHADDA) ? "yy" : "y";
        if (marks.includes(SUKUN) && /a$/.test(out)) {
          out += "y"; // diphthong ay
        } else {
          out += base + emitLong(vowel);
        }
        break;
      }
      default: {
        const sound = CONSONANTS[letter];
        if (sound === undefined) {
          // Non-Arabic character inside the word (digit, mark) — keep as-is.
          out += letter;
          break;
        }
        out += (marks.includes(SHADDA) ? sound + sound : sound) + emitLong(vowel);
        break;
      }
    }
  }
  return out;
}

/** Romanizes a full vocalized Arabic text, preserving punctuation and structure. */
export function romanizeArabic(text) {
  const withoutTatweel = text.replaceAll(TATWEEL, "");
  return withoutTatweel
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token) || !ARABIC_LETTER_RE.test(token)) {
        return token.replaceAll("،", ",").replaceAll("؛", ";").replaceAll("؟", "?");
      }
      // Peel leading/trailing punctuation off the Arabic core.
      const match = token.match(/^([^ء-يً-ْٰ]*)(.*?)([^ء-يً-ْٰ]*)$/u);
      if (!match) return token;
      const [, lead, core, trail] = match;
      const fix = (s) => s.replaceAll("،", ",").replaceAll("؛", ";").replaceAll("؟", "?");
      return fix(lead) + romanizeWord(core) + fix(trail);
    })
    .join("")
    .replace(/ {2,}/g, " ")
    .trim();
}
