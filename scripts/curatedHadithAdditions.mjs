/**
 * Curated additions to the hadith corpus — the whitelist consumed by
 * scripts/extendHadithCorpus.mjs.
 *
 * WHY THIS LIST EXISTS
 * --------------------
 * scripts/buildHadithCorpus.mjs picked its 500 entries by taking a dozen
 * consecutive hadith numbers from each of twenty evenly spaced ranges of
 * Bukhari and Muslim — good for spread, blind to fame. The result skipped
 * nearly every hadith people actually quote: "Do not become angry", "The
 * strong is the one who controls himself in anger", "Whoever believes in
 * Allah and the Last Day should speak good or keep silent", "Be in this
 * world as a stranger", "Two blessings many people lose: health and free
 * time", "Allah does not look at your faces and wealth but at your hearts
 * and deeds", "Charity does not decrease wealth", "The believer's affair is
 * all good", "O My servants, I have forbidden oppression for Myself"…
 *
 * HOW IT WAS BUILT
 * ----------------
 * Each entry is a well-known report from Sahih al-Bukhari or Sahih Muslim,
 * located by searching the English edition for its distinctive wording and
 * then choosing, among the collection's own duplicates of that report (the
 * same narration is usually recorded under several chapters), the variant
 * that is shortest and complete in Arabic, English, French and Bengali —
 * the four languages buildHadithCorpus.mjs requires. Reports whose only
 * version is embedded in a long story, or that need historical context to
 * read fairly on a lock screen, were left out. Where a famous report is
 * already in the corpus under another number (the hadith of intentions,
 * bukhari:1; "none of you believes until he loves for his brother",
 * bukhari:13; "beware of suspicion", bukhari:6064) it is not duplicated.
 *
 * Text is never typed here: extendHadithCorpus.mjs fetches every language
 * verbatim from the same fawazahmed0/hadith-api editions the original 500
 * came from. Like the rest of the corpus this is `technically_verified`
 * plus one careful reading — not a scholar's review.
 *
 * Numbers are the API's own hadith numbers (`hadithnumber`), which follow
 * the standard sequential numbering of each collection.
 */
export const CURATED_HADITH_ADDITIONS = [
  // --- Sahih al-Bukhari ------------------------------------------------
  "bukhari:21", // the sweetness of faith: three qualities
  "bukhari:39", // religion is easy; do not overburden yourselves
  "bukhari:71", // whom Allah wants good for, He gives understanding of the religion
  "bukhari:1145", // our Lord descends in the last third of the night
  "bukhari:1302", // real patience is at the first stroke of a calamity
  "bukhari:1409", // no envy except in two: wealth spent rightly, wisdom taught
  "bukhari:1417", // save yourself from the Fire even with half a date
  "bukhari:1423", // seven whom Allah will shade on the Day there is no shade but His
  "bukhari:1429", // the upper hand is better than the lower hand
  "bukhari:1899", // when Ramadan begins the gates of Paradise open
  "bukhari:1923", // take suhur, there is blessing in it
  "bukhari:2051", // the lawful is clear, the unlawful is clear; doubtful matters
  "bukhari:2101", // the good companion is like the seller of musk
  "bukhari:2447", // oppression will be darkness on the Day of Resurrection
  "bukhari:2472", // a man removed a thorny branch from the road and was forgiven
  "bukhari:2736", // Allah has ninety-nine names
  "bukhari:2749", // the signs of a hypocrite are three
  "bukhari:3560", // whenever given a choice he chose the easier, unless it was a sin
  "bukhari:5027", // the best of you are those who learn the Qur'an and teach it
  "bukhari:5031", // the one who memorises the Qur'an is like the owner of tied camels
  "bukhari:5641", // no fatigue, disease, sorrow… even a thorn's prick, but Allah expiates
  "bukhari:5645", // if Allah wants good for someone, He afflicts him with trials
  "bukhari:5678", // no disease has Allah created but He created its cure
  "bukhari:5927", // every deed of the son of Adam is for him except fasting
  "bukhari:5986", // who wants more provision and a longer life: keep ties of kinship
  "bukhari:6000", // Allah divided mercy into a hundred parts
  "bukhari:6011", // the believers in their mutual mercy are like one body
  "bukhari:6013", // he who is not merciful to others will not be shown mercy
  "bukhari:6029", // the best of you are the best in character
  "bukhari:6094", // truthfulness leads to righteousness, and righteousness to Paradise
  "bukhari:6114", // the strong is the one who controls himself in anger
  "bukhari:6116", // "Advise me." — "Do not become angry."
  "bukhari:6125", // make things easy, do not make them hard; give glad tidings
  "bukhari:6133", // a believer is not stung twice from the same hole
  "bukhari:6237", // not lawful to shun a brother beyond three days; the better greets first
  "bukhari:6306", // Sayyid al-Istighfar, the best way of seeking forgiveness
  "bukhari:6307", // I ask Allah's forgiveness more than seventy times a day
  "bukhari:6309", // Allah is more pleased with His servant's repentance than…
  "bukhari:6405", // "Subhan Allah wa bihamdihi" a hundred times: sins forgiven like sea foam
  "bukhari:6406", // two words light on the tongue, heavy on the scale
  "bukhari:6407", // the one who remembers his Lord and the one who does not: living and dead
  "bukhari:6412", // two blessings many people lose: health and free time
  "bukhari:6416", // be in this world as a stranger or a traveller
  "bukhari:6446", // richness is not in many possessions; richness is of the soul
  "bukhari:6465", // the deeds most loved by Allah are the most regular, even if few
  "bukhari:6475", // speak good or keep silent; honour the neighbour; honour the guest
  "bukhari:6477", // a word uttered without thought may cast one far into the Fire
  "bukhari:6487", // the Fire is surrounded by desires, Paradise by hardships
  "bukhari:6490", // look at the one below you, not the one above you
  "bukhari:6502", // hadith qudsi: My servant draws near to Me until I love him
  "bukhari:6951", // a Muslim is the brother of a Muslim; whoever meets his need…
  "bukhari:7288", // what I forbid, avoid; what I command, do as much as you can
  "bukhari:7405", // hadith qudsi: I am as My servant thinks I am
  "bukhari:7501", // hadith qudsi: a good deed intended is written; done, ten to seven hundred
  // --- Sahih Muslim ----------------------------------------------------
  "muslim:151", // he has tasted faith who is content with Allah as Lord, Islam as religion
  "muslim:158", // modesty brings nothing but good
  "muslim:194", // you will not enter Paradise until you believe… spread salam among you
  "muslim:196", // the religion is sincerity — to Allah, His Book, His Messenger, the Muslims
  "muslim:256", // the best deed: prayer at its time, then kindness to parents
  "muslim:267", // no one with a mustard seed of pride in his heart enters Paradise
  "muslim:272", // whoever dies associating nothing with Allah enters Paradise
  "muslim:372", // Islam began as something strange; glad tidings to the strangers
  "muslim:534", // cleanliness is half of faith; alhamdulillah fills the scale
  "muslim:550", // the five prayers and Friday to Friday expiate what is between them
  "muslim:577", // wudu washes away the sins of the eyes, hands and feet
  "muslim:1083", // the servant is nearest to his Lord in prostration, so supplicate
  "muslim:1823", // the house in which Allah is remembered and the one in which He is not
  "muslim:1862", // the one skilled in the Qur'an is with the noble scribes; the one who stumbles has two rewards
  "muslim:1969", // an hour on Friday in which no Muslim asks for good but is given it
  "muslim:1976", // the best day the sun rises on is Friday
  "muslim:2346", // Allah is Good and accepts only what is good
  "muslim:4223", // when a person dies his deeds end except three
  "muslim:5055", // Allah has prescribed excellence in everything
  "muslim:6501", // who most deserves my good treatment? Your mother, your mother, your mother
  "muslim:6516", // virtue is good character; sin is what wavers in your heart
  "muslim:6543", // Allah does not look at your faces and wealth but at your hearts and deeds
  "muslim:6572", // hadith qudsi: O My servants, I have forbidden oppression for Myself
  "muslim:6592", // charity does not decrease wealth; forgiving increases honour; humility raises
  "muslim:6601", // Allah is kind and loves kindness
  "muslim:6690", // do not belittle any good deed, even meeting your brother with a cheerful face
  "muslim:6774", // the strong believer is better and more beloved than the weak believer
  "muslim:6853", // whoever relieves a believer's hardship… whoever treads a path seeking knowledge
  "muslim:7417", // the world is a prison for the believer and a paradise for the disbeliever
  "muslim:7500", // strange are the ways of a believer: all his affairs are good
];
