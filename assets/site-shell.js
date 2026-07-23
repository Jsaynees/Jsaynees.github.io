(() => {
  "use strict";

  const CONFIG = {
    home: "index.html",
    contactEmail: "jose.lopsay@gmail.com",
    contactSubject: "Consulta desde el portal académico",
    storageKey: "jsaynees-theme"
  };

  const ICONS = {
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.1A8.7 8.7 0 0 1 8.9 3.5 8.8 8.8 0 1 0 20.5 15.1Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    up: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>`
  };

  let toastRegion;
  let progress;
  let pendingRequests = 0;
  let errorShown = false;

  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateThemeButtons() {
    const dark = currentTheme() === "dark";
    qsa("[data-site-theme]").forEach((button) => {
      button.innerHTML = dark ? ICONS.sun : ICONS.moon;
      button.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      button.setAttribute("title", dark ? "Modo claro" : "Modo oscuro");
      const label = qs(".site-action__label", button);
      if (label) label.textContent = dark ? "Modo claro" : "Modo oscuro";
    });
  }

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(CONFIG.storageKey, next); } catch (_) {}
    updateThemeButtons();
    notify(next === "dark" ? "Modo oscuro activado." : "Modo claro activado.", "info", 2200);
  }

  function ensureToastRegion() {
    if (toastRegion) return toastRegion;
    toastRegion = document.createElement("div");
    toastRegion.className = "site-toast-region";
    toastRegion.setAttribute("aria-live", "polite");
    toastRegion.setAttribute("aria-atomic", "false");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  function notify(message, type = "info", timeout = 4500, title = "") {
    const region = ensureToastRegion();
    const titles = {
      info: "Aviso",
      success: "Listo",
      warning: "Atención",
      error: "Ocurrió un problema"
    };
    const marks = { info: "i", success: "✓", warning: "!", error: "×" };
    const toast = document.createElement("div");
    toast.className = `site-toast site-toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span class="site-toast__icon" aria-hidden="true">${marks[type] || "i"}</span>
      <div class="site-toast__content">
        <strong>${escapeHtml(title || titles[type] || titles.info)}</strong>
        <p>${escapeHtml(String(message))}</p>
      </div>
      <button class="site-toast__close" type="button" aria-label="Cerrar mensaje">×</button>
    `;
    region.appendChild(toast);

    const remove = () => {
      if (!toast.isConnected) return;
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 220);
    };
    qs(".site-toast__close", toast).addEventListener("click", remove);
    if (timeout > 0) window.setTimeout(remove, timeout);
    return toast;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));
  }

  function ensureProgress() {
    if (progress) return progress;
    progress = document.createElement("div");
    progress.id = "site-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);
    return progress;
  }

  function setBusy(isBusy) {
    const bar = ensureProgress();
    pendingRequests = Math.max(0, pendingRequests + (isBusy ? 1 : -1));
    bar.classList.toggle("is-active", pendingRequests > 0);
    document.documentElement.classList.toggle("site-is-busy", pendingRequests > 0);
  }

  function hideLoader() {
    const loader = qs("#site-loader");
    if (!loader) return;
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 500);
  }

  function isHomePage() {
    const path = location.pathname.replace(/\/+$/, "");
    return path === "" || path.endsWith("/index.html");
  }

  function installPageBar() {
    if (qs("nav") || qs(".site-pagebar") || isHomePage()) return;

    const bar = document.createElement("header");
    bar.className = "site-pagebar";
    bar.innerHTML = `
      <a class="site-pagebar__brand" href="${CONFIG.home}" aria-label="Ir a la página principal">
        <span class="site-pagebar__mark" aria-hidden="true">∑</span>
        <span class="site-pagebar__copy">
          Prof. López Saynes
          <small>Física y Matemáticas</small>
        </span>
      </a>
      <div class="site-pagebar__actions">
        <a class="site-pagebar__link" href="${CONFIG.home}">
          ${ICONS.home}<span>Volver al inicio</span>
        </a>
      </div>
    `;

    const loader = qs("#site-loader");
    if (loader && loader.nextSibling) {
      document.body.insertBefore(bar, loader.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  function actionButton({ className = "", label, icon, href, onClick, dataAttr = "" }) {
    const element = document.createElement(href ? "a" : "button");
    element.className = `site-action ${className}`.trim();
    if (href) element.href = href;
    else element.type = "button";
    if (dataAttr) element.setAttribute(dataAttr, "");
    element.setAttribute("aria-label", label);
    element.setAttribute("title", label);
    element.innerHTML = `${icon}<span class="site-action__label">${label}</span>`;
    if (onClick) element.addEventListener("click", onClick);
    return element;
  }

  function installDock() {
    if (qs(".site-dock")) return;
    const dock = document.createElement("div");
    dock.className = "site-dock";
    dock.setAttribute("aria-label", "Acciones rápidas");

    if (!isHomePage()) {
      dock.appendChild(actionButton({
        label: "Volver al inicio",
        icon: ICONS.home,
        href: CONFIG.home
      }));
    }

    dock.appendChild(actionButton({
      label: currentTheme() === "dark" ? "Modo claro" : "Modo oscuro",
      icon: currentTheme() === "dark" ? ICONS.sun : ICONS.moon,
      onClick: toggleTheme,
      dataAttr: "data-site-theme"
    }));

    const mailto = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(CONFIG.contactSubject)}`;
    dock.appendChild(actionButton({
      className: "site-action--contact",
      label: "Contactar al profesor",
      icon: ICONS.mail,
      href: mailto
    }));

    const top = actionButton({
      className: "site-action--top",
      label: "Volver arriba",
      icon: ICONS.up,
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" })
    });
    dock.appendChild(top);
    document.body.appendChild(dock);

    const updateTop = () => top.classList.toggle("is-visible", window.scrollY > 520);
    window.addEventListener("scroll", updateTop, { passive: true });
    updateTop();
  }

  function formatLastModified() {
    const date = new Date(document.lastModified);
    if (Number.isNaN(date.getTime())) return "fecha no disponible";
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function enhanceFooter() {
    let footer = qs("footer");
    if (!footer) {
      const footLike = qsa(".foot").at(-1);
      footer = document.createElement("footer");
      footer.style.cssText = "margin-top:24px;padding:24px 16px;text-align:center;background:#112447;color:#d7e1ef;";
      footer.innerHTML = `<div>M.C. José Luis López Saynes · Universidad de Ciencia y Tecnología Descartes</div>`;
      if (footLike && footLike.parentElement) footLike.parentElement.insertAdjacentElement("afterend", footer);
      else document.body.appendChild(footer);
    }

    if (qs(".site-footer-meta", footer)) return;
    const meta = document.createElement("div");
    meta.className = "site-footer-meta";
    meta.innerHTML = `
      <span>Última actualización: ${escapeHtml(formatLastModified())}</span>
      <span aria-hidden="true">•</span>
      <a href="mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(CONFIG.contactSubject)}">Contacto</a>
    `;
    footer.appendChild(meta);
  }

  function installRevealAnimations() {
    const candidates = qsa(
      ".course-card, .sim-card, .activity-card, .day-card, .aviso, .card, .moodle-card"
    ).filter((element) => !element.closest(".hero") && !element.classList.contains("hidden"));

    candidates.forEach((element, index) => {
      element.classList.add("site-reveal");
      element.style.transitionDelay = `${Math.min(index % 5, 4) * 45}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      candidates.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -25px" });

    candidates.forEach((element) => observer.observe(element));

    const hiddenObserver = new MutationObserver((mutations) => {
      mutations.forEach(({ target }) => {
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains("hidden")) {
          target.classList.add("site-reveal");
          requestAnimationFrame(() => target.classList.add("is-visible"));
        }
      });
    });

    qsa(".hidden").forEach((element) => {
      hiddenObserver.observe(element, { attributes: true, attributeFilter: ["class"] });
    });
  }

  function installValidationMessages() {
    document.addEventListener("invalid", (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement)) return;

      field.classList.add("site-field-error");
      const name = field.getAttribute("aria-label") ||
                   field.previousElementSibling?.textContent?.trim() ||
                   "este campo";
      notify(`Revisa ${name.toLowerCase()}.`, "warning", 3500, "Falta información");
    }, true);

    document.addEventListener("input", (event) => {
      const field = event.target;
      if (field instanceof HTMLElement) field.classList.remove("site-field-error");
    });
  }

  function installNetworkMessages() {
    window.addEventListener("offline", () => {
      notify(
        "Se perdió la conexión. No cierres la página; tus respuestas visibles permanecen en pantalla.",
        "warning",
        0,
        "Sin conexión"
      );
    });

    window.addEventListener("online", () => {
      notify("La conexión se restableció.", "success", 3200);
    });

    if (!navigator.onLine) {
      window.setTimeout(() => {
        notify("Estás navegando sin conexión a internet.", "warning", 0, "Sin conexión");
      }, 500);
    }
  }

  function installFetchGuard() {
    if (!window.fetch || window.fetch.__siteWrapped) return;
    const originalFetch = window.fetch.bind(window);

    const wrappedFetch = async (...args) => {
      setBusy(true);
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          notify(
            `El servidor respondió con el código ${response.status}. Intenta nuevamente.`,
            "error",
            6500,
            "No se pudo completar la operación"
          );
        }
        return response;
      } catch (error) {
        notify(
          navigator.onLine
            ? "No fue posible comunicarse con el servidor. Intenta de nuevo en unos momentos."
            : "No hay conexión. Conéctate a internet e intenta nuevamente.",
          "error",
          0,
          "Error de conexión"
        );
        throw error;
      } finally {
        setBusy(false);
      }
    };
    wrappedFetch.__siteWrapped = true;
    window.fetch = wrappedFetch;
  }

  function installGlobalErrorMessages() {
    window.addEventListener("error", (event) => {
      const target = event.target;
      const isResource = target && target !== window &&
        (target.tagName === "SCRIPT" || target.tagName === "LINK");

      if (isResource && !errorShown) {
        errorShown = true;
        notify(
          "Un recurso de la página no cargó correctamente. Recarga la página con Ctrl + F5.",
          "error",
          8500,
          "Carga incompleta"
        );
      }
    }, true);

    window.addEventListener("unhandledrejection", () => {
      if (errorShown) return;
      errorShown = true;
      notify(
        "Una operación no terminó correctamente. Revisa tu conexión e intenta otra vez.",
        "error",
        8000
      );
    });
  }

  function installNavigationLoading() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
      ) return;

      try {
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin) return;
        const loader = qs("#site-loader");
        if (loader) {
          loader.classList.remove("is-hidden");
        }
      } catch (_) {}
    });
  }

  function init() {
    document.documentElement.classList.add("site-ui-enabled");
    installPageBar();
    installDock();
    enhanceFooter();
    ensureProgress();
    installRevealAnimations();
    installValidationMessages();
    installNetworkMessages();
    installFetchGuard();
    installGlobalErrorMessages();
    installNavigationLoading();
    updateThemeButtons();
  }

  window.SiteUI = {
    notify,
    setLoading: setBusy,
    toggleTheme
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("load", () => window.setTimeout(hideLoader, 180), { once: true });
  window.setTimeout(hideLoader, 4200);
})();
