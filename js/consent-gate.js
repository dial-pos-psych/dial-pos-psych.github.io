(function () {
  // Ранний consent-гейт на уровне <head>.
  //
  // Ряд сторонних сервисов сайта обрабатывает технические данные посетителей
  // и должен загружаться только после явного согласия на cookies и сторонние
  // сервисы (см. баннер js/legal-consent.js и Политику обработки персональных
  // данных).
  //
  // Яндекс.Метрика и VK-виджеты инициализируются самим legal-consent.js и
  // отдельного раннего перехвата не требуют. Комментарии Disqus, напротив,
  // встроены в восстановленные страницы как inline-скрипт сразу после <body>,
  // то есть раньше футерного legal-consent.js, поэтому их блокируем здесь.
  //
  // Гейт читает тот же ключ consent, что и legal-consent.js, откладывает
  // загрузку сторонних скриптов до согласия и сразу же снимает перехват, как
  // только согласие получено или было дано ранее.

  var CONSENT_KEY = "dpp_cookie_consent_v1";
  var ACCEPTED = "accepted";

  // Хосты, которые нельзя загружать до согласия. Проверка по подстроке src
  // покрывает и прямые теги, и скрипты, создаваемые динамически.
  var BLOCKED_HOSTS = ["disqus.com", "disquscdn.com"];

  var pending = [];
  var consentGiven = false;

  try {
    consentGiven = window.localStorage.getItem(CONSENT_KEY) === ACCEPTED;
  } catch (error) {
    consentGiven = false;
  }

  function isBlockedSrc(value) {
    return !!value && BLOCKED_HOSTS.some(function (host) {
      return String(value).indexOf(host) !== -1;
    });
  }

  function shouldHold(node) {
    return (
      !consentGiven &&
      node &&
      node.tagName === "SCRIPT" &&
      (isBlockedSrc(node.getAttribute("src")) || isBlockedSrc(node.src))
    );
  }

  function restoreNative() {
    document.createElement = nativeCreateElement;
    Node.prototype.appendChild = nativeAppendChild;
    Node.prototype.insertBefore = nativeInsertBefore;
  }

  function flushPending() {
    while (pending.length) {
      var original = pending.shift();
      var replacement = nativeCreateElement("script");

      var attrs = original.attributes || [];
      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];
        replacement.setAttribute(attr.name, attr.value);
      }
      if (original.text) {
        replacement.text = original.text;
      }

      (original.targetParent || document.head).appendChild(replacement);
    }
  }

  var nativeCreateElement = document.createElement.bind(document);
  var nativeAppendChild = Node.prototype.appendChild;
  var nativeInsertBefore = Node.prototype.insertBefore;

  // Перехватываем appendChild/insertBefore только чтобы отложить добавление
  // сторонних script-узлов. Остальные узлы проходят штатно, свойства
  // createElement для посторонних скриптов не меняются.
  Node.prototype.appendChild = function (node) {
    if (shouldHold(node)) {
      node.targetParent = this;
      pending.push(node);
      return node;
    }
    return nativeAppendChild.call(this, node);
  };

  Node.prototype.insertBefore = function (node, ref) {
    if (shouldHold(node)) {
      node.targetParent = this;
      pending.push(node);
      return node;
    }
    return nativeInsertBefore.call(this, node, ref);
  };

  // Безопасность: если согласие уже было дано ранее, перехват не нужен вовсе.
  if (consentGiven) {
    restoreNative();
  }

  // Точка разблокировки для legal-consent.js при нажатии «Принять».
  window.dppConsentGate = {
    unblock: function () {
      if (consentGiven) {
        return;
      }
      consentGiven = true;
      restoreNative();
      flushPending();
    },
  };
})();
