(function () {
  if (window.__paramForwarderInstalled) return;
  window.__paramForwarderInstalled = true;

  var CHECKOUT_HOSTS = new Set(["checkout.navenaut.com", "www.checkout-ds24.com", "checkout.vendepay.com"]);

  // Campanhas subidas com o link antigo mandam o id da campanha em utm_id e o
  // utm_campaign so com o nome. A Utmify casa a venda pelo "nome|id" colado no
  // utm_campaign e ignora o utm_id, entao a venda cai em "UTMs invalidas".
  // Aqui o id e movido para o formato que ela entende, antes de ir ao gateway.
  // Recupera so o nivel de campanha: os ids de conjunto e anuncio nao existem
  // no link antigo, entao esses dois niveis continuam sem atribuicao.
  function repairUtm(params) {
    var campaign = params.get("utm_campaign");
    var id = params.get("utm_id");

    if (!campaign || !id) return params;
    if (campaign.indexOf("|") !== -1) return params; // ja veio completo
    if (!/^[0-9]+$/.test(id)) return params; // macro nao expandida

    params.set("utm_campaign", campaign + "|" + id);
    return params;
  }

  function currentParams() {
    return repairUtm(new URLSearchParams(window.location.search));
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  // O click id e o id do produto do catalogo sao o que liga a venda ao anuncio
  // e ao item. Eles chegam na URL do primeiro acesso, mas podem se perder no
  // meio do funil (aba reaberta, volta pelo historico, link sem parametros).
  // O tt-track.js guarda os dois em cookie de 30 dias; aqui eles sao repostos
  // quando faltarem, para o gateway devolve-los no webhook.
  //   sck/src: o embed de upsell so repassa uma lista curta de campos, e esses
  //   dois estao nela - por isso os valores viajam tambem por eles.
  function withTracking(params) {
    var ttclid = params.get("ttclid") || getCookie("tt_ttclid");
    var sku = params.get("product_id") || getCookie("tt_sku");
    if (ttclid) {
      if (!params.get("ttclid")) params.set("ttclid", ttclid);
      if (!params.get("sck")) params.set("sck", ttclid);
      // DIGISTORE24 — os dois nomes abaixo sao o que faz o click id VOLTAR no IPN.
      //
      // O "sck" acima veio do funil da VendePay, de onde este arquivo foi copiado.
      // No Digistore24 ele nao existe: o checkout recebe e descarta, o IPN chega sem
      // click id, o Purchase vai ao TikTok como evento orfao e o Ads Manager nao
      // atribui a venda a campanha nenhuma. Foi essa a causa de "ttclid": false.
      //
      //   cid    — Click-ID oficial do Digistore24; volta no IPN como "cid".
      //   custom — canal do VENDEDOR para repassar um valor proprio pelo order
      //            form; volta no IPN como "custom".
      //
      // Vao os dois de proposito: se um for truncado ou ignorado, o outro entrega.
      // O webhook ja le ambos (a lista e sck, click_id, ttclid, custom, cid,
      // tracking) e usa o primeiro valor valido, entao nada muda do lado do servidor.
      if (!params.get("cid")) params.set("cid", ttclid);
      if (!params.get("custom")) params.set("custom", ttclid);
    }
    if (sku) {
      if (!params.get("product_id")) params.set("product_id", sku);
      if (!params.get("src")) params.set("src", sku);
    }
    return params;
  }

  function appendCurrentParams(rawUrl) {
    var params = withTracking(currentParams());
    if (!rawUrl || !params.toString()) return rawUrl;

    try {
      var url = new URL(rawUrl, window.location.href);
      params.forEach(function (value, key) {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      });
      return url.toString();
    } catch (error) {
      return rawUrl;
    }
  }

  function decorateCheckoutLinks() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      try {
        var url = new URL(link.href, window.location.href);
        if (CHECKOUT_HOSTS.has(url.hostname)) {
          link.href = appendCurrentParams(link.href);
        }
      } catch (error) {}
    });
  }

  function appendParamsToInternalUrl(rawUrl) {
    var params = currentParams();
    if (!rawUrl || !params.toString()) return rawUrl;

    try {
      var url = new URL(rawUrl, window.location.href);
      if (url.origin !== window.location.origin || url.search) return rawUrl;
      url.search = params.toString();
      return url.pathname + url.search + url.hash;
    } catch (error) {
      return rawUrl;
    }
  }

  function patchHistoryMethod(methodName) {
    var original = history[methodName];
    history[methodName] = function (state, title, url) {
      if (typeof url === "string") {
        return original.call(this, state, title, appendParamsToInternalUrl(url));
      }
      return original.apply(this, arguments);
    };
  }

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target && event.target.closest && event.target.closest("a[href]");
      if (!link) return;

      try {
        var url = new URL(link.href, window.location.href);
        if (!CHECKOUT_HOSTS.has(url.hostname)) return;
        link.href = appendCurrentParams(link.href);
      } catch (error) {}
    },
    true
  );

  decorateCheckoutLinks();
  new MutationObserver(decorateCheckoutLinks).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.forwardParamsToCheckout = appendCurrentParams;
})();
