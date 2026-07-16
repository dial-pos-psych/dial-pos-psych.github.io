(function () {
  var CONSENT_KEY = "dpp_cookie_consent_v1";
  var ACCEPTED = "accepted";
  var REJECTED = "rejected";

  function getConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Consent still applies for the current page even if storage is blocked.
    }
  }

  function hideBanner() {
    var banner = document.querySelector("[data-cookie-consent]");
    if (banner) {
      banner.hidden = true;
    }
  }

  function showBanner() {
    var banner = document.querySelector("[data-cookie-consent]");
    if (banner) {
      banner.hidden = false;
    }
  }

  function loadScript(src, onload) {
    if (document.querySelector('script[src="' + src + '"]')) {
      if (onload) {
        onload();
      }
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    if (onload) {
      script.onload = onload;
    }
    document.head.appendChild(script);
  }

  function initMetrika() {
    if (!window.dppMetrika || !window.dppMetrika.id || window.ym) {
      return;
    }

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = 1 * new Date();

    loadScript("https://mc.yandex.ru/metrika/tag.js?id=" + encodeURIComponent(window.dppMetrika.id), function () {
      window.ym(window.dppMetrika.id, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer,
        url: location.href,
        trackLinks: true,
        accurateTrackBounce: true
      });
    });
  }

  function initVkWidgets() {
    var placeholders = document.querySelectorAll("[data-vk-group]");
    if (!placeholders.length) {
      return;
    }

    loadScript("https://vk.com/js/api/openapi.js?169", function () {
      if (!window.VK || !window.VK.Widgets) {
        return;
      }

      placeholders.forEach(function (placeholder, index) {
        if (placeholder.dataset.loaded === "true") {
          return;
        }

        var groupId = Number(placeholder.dataset.vkGroup);
        var widget = document.createElement("div");
        widget.id = "vk_groups_" + index;
        placeholder.replaceChildren(widget);
        placeholder.dataset.loaded = "true";
        window.VK.Widgets.Group(widget.id, {
          mode: 3,
          width: "auto",
          height: 400,
          color1: "FFFFFF",
          color2: "000000",
          color3: "5181B8"
        }, groupId);
      });
    });
  }

  function acceptConsent() {
    setConsent(ACCEPTED);
    hideBanner();
    if (window.dppConsentGate) {
      window.dppConsentGate.unblock();
    }
    initMetrika();
    initVkWidgets();
  }

  function rejectConsent() {
    setConsent(REJECTED);
    hideBanner();
  }

  function openSettings() {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
      // Ignore storage errors; showing the banner is still useful.
    }
    showBanner();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-cookie-accept], .dpp-consent-accept").forEach(function (button) {
      button.addEventListener("click", acceptConsent);
    });

    document.querySelectorAll("[data-cookie-reject]").forEach(function (button) {
      button.addEventListener("click", rejectConsent);
    });

    document.querySelectorAll("[data-open-cookie-settings]").forEach(function (button) {
      button.addEventListener("click", openSettings);
    });

    var consent = getConsent();
    if (consent === ACCEPTED) {
      initMetrika();
      initVkWidgets();
      return;
    }

    if (consent !== REJECTED) {
      showBanner();
    }
  });
}());
