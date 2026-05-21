(function () {
  var githubHost = "dial-pos-psych.github.io";
  var isTestMode = new URLSearchParams(window.location.search).get("migration_notice_test") === "1";
  if (window.location.hostname !== githubHost && !isTestMode) {
    return;
  }

  var suppressKey = "dppMigrationNoticeSuppressUntil";
  var hiddenKey = "dppMigrationNoticeHidden";
  var weekMs = 7 * 24 * 60 * 60 * 1000;
  var delayMs = isTestMode ? 1000 : 60000;

  try {
    if (localStorage.getItem(hiddenKey) === "1") {
      return;
    }
    var suppressUntil = parseInt(localStorage.getItem(suppressKey) || "0", 10);
    if (suppressUntil && Date.now() < suppressUntil && !isTestMode) {
      return;
    }
  } catch (error) {
    // localStorage can be unavailable in strict privacy modes.
  }

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors; the notice can still be closed for this page view.
    }
  }

  function isBlockingModalVisible() {
    var existingModal = document.getElementById("donate-modal");
    var cookieOverlay = document.getElementById("overlay");
    return Boolean(
      (existingModal && window.getComputedStyle(existingModal).display !== "none") ||
      (cookieOverlay && window.getComputedStyle(cookieOverlay).display !== "none")
    );
  }

  function injectStyle() {
    if (document.getElementById("dpp-migration-notice-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "dpp-migration-notice-style";
    style.textContent = [
      ".dpp-migration-notice{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72)}",
      ".dpp-migration-notice__panel{box-sizing:border-box;width:min(560px,100%);border-radius:8px;background:#fff;color:#1f2933;padding:24px;box-shadow:0 18px 54px rgba(0,0,0,.38);font-family:Arial,sans-serif}",
      ".dpp-migration-notice__panel h2{margin:0 0 12px;font-size:24px;line-height:1.2;color:#001438;text-align:left}",
      ".dpp-migration-notice__panel p{margin:0 0 12px;font-size:17px;line-height:1.5;text-align:left;color:#1f2933}",
      ".dpp-migration-notice__url{display:block;margin:12px 0;padding:10px 12px;border-radius:6px;background:#f3f6fa;color:#024390;word-break:break-all;font-weight:700}",
      ".dpp-migration-notice__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}",
      ".dpp-migration-notice__button{border:0;border-radius:6px;padding:11px 14px;cursor:pointer;font-size:15px;font-weight:700;background:#e6edf5;color:#001438}",
      ".dpp-migration-notice__button:hover{background:#d8e4f0}",
      ".dpp-migration-notice__button--primary{background:#ff5c00;color:#fff}",
      ".dpp-migration-notice__button--primary:hover{background:#e65300}",
      ".dpp-migration-notice__button--link{background:transparent;color:#024390;padding-left:0;padding-right:0}",
      "body.dark-theme .dpp-migration-notice__panel{background:#282c34;color:#e0e0e0}",
      "body.dark-theme .dpp-migration-notice__panel h2,body.dark-theme .dpp-migration-notice__panel p{color:#e0e0e0}",
      "body.dark-theme .dpp-migration-notice__url{background:#353b45;color:#61afef}",
      "body.dark-theme .dpp-migration-notice__button--link{background:#3b4250;color:#f3f6fa;padding-left:14px;padding-right:14px}",
      "body.dark-theme .dpp-migration-notice__button--link:hover{background:#4b5565}",
      "@media (max-width:575.98px){.dpp-migration-notice{padding:12px}.dpp-migration-notice__panel{padding:18px}.dpp-migration-notice__panel h2{font-size:20px}.dpp-migration-notice__panel p{font-size:16px}.dpp-migration-notice__button{width:100%}.dpp-migration-notice__button--link{padding:11px 14px}}"
    ].join("");
    document.head.appendChild(style);
  }

  function closeNotice(node, mode) {
    if (mode === "hide") {
      store(hiddenKey, "1");
    } else {
      store(suppressKey, String(Date.now() + weekMs));
    }
    node.remove();
  }

  function copyCurrentUrl(button) {
    var url = window.location.href;
    function done() {
      button.textContent = "Адрес скопирован";
      setTimeout(function () {
        button.textContent = "Скопировать адрес";
      }, 2500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () {
        fallbackCopy(url);
        done();
      });
      return;
    }

    fallbackCopy(url);
    done();
  }

  function fallbackCopy(text) {
    var input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "readonly");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      // If copying is blocked, the visible URL still tells the user what to bookmark.
    }
    input.remove();
  }

  function showNotice() {
    if (document.getElementById("dpp-migration-notice")) {
      return;
    }

    if (isBlockingModalVisible()) {
      setTimeout(showNotice, 30000);
      return;
    }

    injectStyle();

    var node = document.createElement("div");
    node.id = "dpp-migration-notice";
    node.className = "dpp-migration-notice";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.setAttribute("aria-labelledby", "dpp-migration-notice-title");
    node.innerHTML = [
      '<div class="dpp-migration-notice__panel">',
      '<h2 id="dpp-migration-notice-title">Сайт переезжает на новый адрес</h2>',
      "<p>Сейчас основной сайт постепенно переводится на бесплатный хостинг GitHub Pages. Вы уже на новой версии сайта.</p>",
      '<span class="dpp-migration-notice__url">https://dial-pos-psych.github.io/</span>',
      "<p>Если вы хотите сохранить сайт в закладках, добавьте в закладки именно эту страницу после переадресации. Браузеры не разрешают сайту создать закладку автоматически, поэтому используйте Ctrl+D или Cmd+D.</p>",
      '<div class="dpp-migration-notice__actions">',
      '<button type="button" class="dpp-migration-notice__button dpp-migration-notice__button--primary" data-action="close">Понятно</button>',
      '<button type="button" class="dpp-migration-notice__button" data-action="copy">Скопировать адрес</button>',
      '<button type="button" class="dpp-migration-notice__button dpp-migration-notice__button--link" data-action="hide">Больше не показывать</button>',
      "</div>",
      "</div>"
    ].join("");

    node.addEventListener("click", function (event) {
      if (event.target === node) {
        closeNotice(node, "snooze");
      }
    });

    node.querySelector('[data-action="close"]').addEventListener("click", function () {
      closeNotice(node, "snooze");
    });
    node.querySelector('[data-action="hide"]').addEventListener("click", function () {
      closeNotice(node, "hide");
    });
    node.querySelector('[data-action="copy"]').addEventListener("click", function (event) {
      copyCurrentUrl(event.currentTarget);
    });

    document.body.appendChild(node);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(showNotice, delayMs);
    });
  } else {
    setTimeout(showNotice, delayMs);
  }
})();
