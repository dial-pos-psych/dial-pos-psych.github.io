(function () {
  var storageKey = "theme";
  var darkThemeHref = "/css/dark-theme.css";

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Theme still changes for the current page even if storage is unavailable.
    }
  }

  function ensureDarkThemeLink() {
    var link = document.getElementById("dark-theme-style");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "dark-theme-style";
      link.href = darkThemeHref;
      document.head.appendChild(link);
    }
  }

  function removeDarkThemeLink() {
    var link = document.getElementById("dark-theme-style");
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  function updateControls(theme) {
    document.querySelectorAll(".theme-switcher-wrapper").forEach(function (control) {
      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      control.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      control.setAttribute("title", theme === "dark" ? "Включить светлую тему" : "Включить темную тему");
    });
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      ensureDarkThemeLink();
      document.body.classList.add("dark-theme");
    } else {
      removeDarkThemeLink();
      document.body.classList.remove("dark-theme");
    }

    document.documentElement.setAttribute("data-theme", theme);
    updateControls(theme);
  }

  function resetDisqus() {
    if (typeof DISQUS === "undefined") {
      return;
    }

    DISQUS.reset({
      reload: true,
      config: function () {
        var identifier = document.querySelector(".disqus-identifier");
        if (identifier) {
          this.page.identifier = identifier.getAttribute("data-disqus-identifier");
        }
        this.page.url = window.location.href;
      },
    });
  }

  function toggleTheme() {
    var current = getStoredTheme() || "light";
    var next = current === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
    resetDisqus();
  }

  function bindControls() {
    document.querySelectorAll(".theme-switcher-wrapper").forEach(function (control) {
      if (control.dataset.themeBound === "1") {
        return;
      }

      control.dataset.themeBound = "1";
      control.addEventListener("click", function (event) {
        event.preventDefault();
        toggleTheme();
      });

      control.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleTheme();
        }
      });
    });
  }

  function detectInitialTheme() {
    var stored = getStoredTheme();
    if (stored) {
      return stored;
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(detectInitialTheme());
    bindControls();
    setTimeout(bindControls, 500);
  });
})();
