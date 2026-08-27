/**
 * Generates the static, per-language build of the IqraTime website.
 *
 * Source of truth is scripts/website/templates/ (French markup tagged with
 * data-i18n) plus i18n-data.js. Everything under website/ is generated output:
 * French at the root, each other language under website/<lang>/. Editing a
 * page means editing the template and re-running this script — the files in
 * website/ are overwritten.
 *
 * Shipping real translated markup per language is what lets search engines
 * index all seven; a client-side translator would only ever have shown them
 * the French copy. The build also emits the hreflang cluster, the JSON-LD
 * blocks, and sitemap.xml.
 *
 * Run: node scripts/website/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const translations = require("./i18n-data.js");

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(HERE, "templates");
const SITE = join(HERE, "..", "..", "website");
const ORIGIN = "https://iqratime.com";

const DEFAULT_LANG = "fr";
const LANGS = ["fr", "en", "ar", "de", "es", "it", "nl"];
const RTL = new Set(["ar"]);

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.iqratime.app";

/** og:locale wants a full locale, not a bare language code. */
const OG_LOCALE = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_AR",
  de: "de_DE",
  es: "es_ES",
  it: "it_IT",
  nl: "nl_NL",
};

const PAGES = [
  { file: "index.html", key: "home", priority: "1.0" },
  { file: "contact.html", key: "contact", priority: "0.6" },
  { file: "privacy.html", key: "privacy", priority: "0.4" },
];

const get = (dict, path) =>
  path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), dict);

const urlFor = (lang, file) =>
  lang === DEFAULT_LANG ? `${ORIGIN}/${file}` : `${ORIGIN}/${lang}/${file}`;

/** Strips tags so translated copy can be reused inside meta attributes. */
const plain = (html) =>
  String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const attrEscape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function hreflangBlock(file) {
  const links = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${urlFor(l, file)}" />`
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LANG, file)}" />`);
  return links.join("\n");
}

function jsonLdFor(lang, pageKey) {
  const t = translations[lang];
  const blocks = [];

  if (pageKey === "home") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "IqraTime",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Android",
      description: plain(get(t, "hero.lead")),
      inLanguage: lang,
      url: urlFor(lang, "index.html"),
      image: `${ORIGIN}/assets/og-image.png`,
      installUrl: PLAY_STORE_URL,
      downloadUrl: PLAY_STORE_URL,
      sameAs: [PLAY_STORE_URL],
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      publisher: { "@type": "Organization", name: "IqraTime", url: ORIGIN },
    });

    // Every qN/aN pair present in the data feeds the FAQ rich-result markup.
    const questions = [];
    for (let n = 1; get(t, `faq.q${n}`) !== undefined; n++) {
      questions.push({
        "@type": "Question",
        name: plain(get(t, `faq.q${n}`)),
        acceptedAnswer: { "@type": "Answer", text: plain(get(t, `faq.a${n}`)) },
      });
    }
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: questions,
    });
  }

  if (pageKey === "contact") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      inLanguage: lang,
      url: urlFor(lang, "contact.html"),
      name: plain(get(t, "contact.title")),
    });
  }

  if (!blocks.length) return "";
  return blocks
    .map(
      (b) =>
        `<script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n</script>`
    )
    .join("\n");
}

/** Rewrites the French source markup into one language's finished page. */
function render(lang, page, source) {
  const t = translations[lang];
  let html = source;

  // 1. Translate every element the French source tagged with data-i18n.
  html = html.replace(
    /(<([a-zA-Z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (match, open, tag, key, _inner, close) => {
      const value = get(t, key);
      return value === undefined ? match : `${open}${value}${close}`;
    }
  );

  // 2. Language and direction.
  html = html.replace(
    /<html lang="[^"]*"[^>]*>/,
    `<html lang="${lang}"${RTL.has(lang) ? ' dir="rtl"' : ""}>`
  );

  // 3. Per-page, per-language title and description.
  const titles = {
    home: get(t, "meta.title"),
    contact: `${plain(get(t, "contact.title"))} — IqraTime`,
    privacy: `${plain(get(t, "legal.title"))} — IqraTime`,
  };
  const descriptions = {
    home: get(t, "meta.description"),
    contact: plain(get(t, "contact.subtitle")),
    privacy: plain(get(t, "legal.sumText")),
  };
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${titles[page.key]}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${attrEscape(descriptions[page.key])}" />`
  );

  // 4. Canonical, og:url and og:locale point at this language's own URL.
  const selfUrl = urlFor(lang, page.file);
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${selfUrl}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${selfUrl}" />`
  );
  html = html.replace(
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}" />`
  );

  // 5. Social titles/descriptions follow the translated copy.
  const ogTitle = page.key === "home" ? `IqraTime — ${plain(get(t, "hero.title"))}` : titles[page.key];
  const ogDesc = page.key === "home" ? plain(get(t, "hero.lead")) : descriptions[page.key];
  html = html
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${attrEscape(ogTitle)}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${attrEscape(ogDesc)}" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${attrEscape(ogTitle)}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${attrEscape(ogDesc)}" />`
    );

  // 6. Markers filled by the build rather than hand-maintained per language.
  html = html.replace("<!--HREFLANG-->", hreflangBlock(page.file));
  html = html.replace("<!--JSONLD-->", jsonLdFor(lang, page.key));

  // 7. Internal links move into this language's directory.
  if (lang !== DEFAULT_LANG) {
    html = html.replace(/href="\/(index|contact|privacy)\.html/g, `href="/${lang}/$1.html`);
  }

  // 8. The share block carries its own translated payload for site.js.
  if (page.key === "home") {
    html = html
      .replace(/data-share-url="[^"]*"/, `data-share-url="${urlFor(lang, "index.html")}"`)
      .replace(
        /data-share-message="[^"]*"/,
        `data-share-message="${attrEscape(plain(get(t, "share.message")))}"`
      )
      .replace(
        /data-copied-label="[^"]*"/,
        `data-copied-label="${attrEscape(plain(get(t, "share.copied")))}"`
      );
  }

  // 9. The contact form must come back to the page it was sent from.
  html = html.replace(
    /name="_next" value="[^"]*"/,
    `name="_next" value="${urlFor(lang, "contact.html")}?sent=1"`
  );

  return html;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const page of PAGES) {
    for (const lang of LANGS) {
      const alternates = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, page.file)}" />`
      ).join("\n");
      entries.push(
        [
          "  <url>",
          `    <loc>${urlFor(lang, page.file)}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <priority>${page.priority}</priority>`,
          alternates,
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LANG, page.file)}" />`,
          "  </url>",
        ].join("\n")
      );
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join("\n"),
    "</urlset>",
    "",
  ].join("\n");
}

// --- run ---------------------------------------------------------------

let written = 0;

for (const page of PAGES) {
  const source = readFileSync(join(TEMPLATES, page.file), "utf8");

  for (const lang of LANGS) {
    const html = render(lang, page, source);
    const outDir = lang === DEFAULT_LANG ? SITE : join(SITE, lang);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, page.file), html);
    written++;
  }
}

writeFileSync(join(SITE, "sitemap.xml"), buildSitemap());

console.log(`Built ${written} pages across ${LANGS.length} languages, plus sitemap.xml.`);
