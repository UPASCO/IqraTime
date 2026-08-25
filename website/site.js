/**
 * Small browser runtime for the IqraTime website.
 *
 * The pages themselves are pre-translated at build time (see scripts/build.mjs),
 * so nothing here swaps text. This only wires up the three interactive bits:
 * the language switcher (which navigates to the sibling page in that language),
 * the share buttons, and the contact form's post-submit state.
 */
(function () {
  "use strict";

  var PAGE_FILES = { home: "index.html", contact: "contact.html", privacy: "privacy.html" };
  var DEFAULT_LANG = "fr";

  function currentLang() {
    return document.documentElement.getAttribute("lang") || DEFAULT_LANG;
  }

  function currentPage() {
    return (document.body && document.body.getAttribute("data-page")) || "home";
  }

  /** French lives at the site root; every other language sits under /<lang>/. */
  function urlFor(lang, page) {
    var file = PAGE_FILES[page] || PAGE_FILES.home;
    return lang === DEFAULT_LANG ? "/" + file : "/" + lang + "/" + file;
  }

  function wireLanguageSwitcher() {
    var select = document.getElementById("lang-switch");
    if (!select) return;
    select.value = currentLang();
    select.addEventListener("change", function () {
      window.location.href = urlFor(select.value, currentPage());
    });
  }

  function wireShareButtons() {
    var root = document.getElementById("share");
    if (!root) return;

    var url = root.getAttribute("data-share-url") || window.location.origin + "/";
    var message = root.getAttribute("data-share-message") || "";
    var copiedLabel = root.getAttribute("data-copied-label") || "Copied";

    var encodedUrl = encodeURIComponent(url);
    var encodedMessage = encodeURIComponent(message);
    var encodedBoth = encodeURIComponent(message + " " + url);

    var targets = {
      whatsapp: "https://wa.me/?text=" + encodedBoth,
      telegram: "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedMessage,
      x: "https://twitter.com/intent/tweet?text=" + encodedMessage + "&url=" + encodedUrl
    };

    Object.keys(targets).forEach(function (key) {
      var link = root.querySelector('[data-share="' + key + '"]');
      if (link) link.setAttribute("href", targets[key]);
    });

    var copyBtn = root.querySelector('[data-share="copy"]');
    if (!copyBtn) return;

    copyBtn.addEventListener("click", function () {
      var original = copyBtn.textContent;

      function confirmCopied() {
        copyBtn.textContent = copiedLabel;
        copyBtn.classList.add("copied");
        setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove("copied");
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(confirmCopied, fallbackCopy);
      } else {
        fallbackCopy();
      }

      // Older browsers, and any context where the async clipboard is blocked.
      function fallbackCopy() {
        try {
          var field = document.createElement("textarea");
          field.value = url;
          field.setAttribute("readonly", "");
          field.style.position = "absolute";
          field.style.left = "-9999px";
          document.body.appendChild(field);
          field.select();
          document.execCommand("copy");
          document.body.removeChild(field);
          confirmCopied();
        } catch (e) {
          window.prompt("", url);
        }
      }
    });
  }

  function wireContactSuccess() {
    if (!/[?&]sent=1\b/.test(window.location.search)) return;
    var success = document.getElementById("contact-success");
    var formWrap = document.getElementById("contact-form-wrap");
    if (success) success.hidden = false;
    if (formWrap) formWrap.hidden = true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireLanguageSwitcher();
    wireShareButtons();
    wireContactSuccess();
  });
})();
