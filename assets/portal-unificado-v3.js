(() => {
  "use strict";

  const EMAIL = "jose.lopsay@gmail.com";
  let toastRegion;

  /* Eliminar cualquier preferencia del modo oscuro anterior. */
  try {
    localStorage.removeItem("jsaynees-theme");
  } catch (_) {}
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "light";

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  function ensureToastRegion() {
    if (toastRegion) return toastRegion;
    toastRegion = document.createElement("div");
    toastRegion.className = "portal-toast-region";
    toastRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  function notify(message, type = "info", timeout = 4500, title = "") {
    const titles = {
      info: "Aviso",
      success: "Listo",
      warning: "Atención",
      error: "Ocurrió un problema"
    };
    const symbols = { info: "i", success: "✓", warning: "!", error: "×" };
    const toast = document.createElement("div");
    toast.className = `portal-toast portal-toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span class="portal-toast-icon" aria-hidden="true">${symbols[type] || "i"}</span>
      <div>
        <strong>${escapeHtml(title || titles[type] || titles.info)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
      <button class="portal-toast-close" type="button" aria-label="Cerrar">×</button>
    `;
    ensureToastRegion().appendChild(toast);

    const remove = () => {
      if (!toast.isConnected) return;
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      setTimeout(() => toast.remove(), 180);
    };
    toast.querySelector(".portal-toast-close").addEventListener("click", remove);
    if (timeout > 0) setTimeout(remove, timeout);
  }

  function initMenu() {
    const toggle = document.querySelector(".portal-menu-toggle");
    const links = document.querySelector(".portal-nav-links");
    if (!toggle || !links) return;

    const close = () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".portal-nav")) close();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) close();
    });
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
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.style.cssText =
        "margin-top:28px;padding:24px 16px;text-align:center;background:#112447;color:#fff;";
      footer.innerHTML =
        "<p>M.C. <span>José Luis López Saynes</span> · Universidad de Ciencia y Tecnología Descartes</p>";
      document.body.appendChild(footer);
    }

    if (footer.querySelector(".portal-footer-meta")) return;
    const meta = document.createElement("div");
    meta.className = "portal-footer-meta";
    meta.innerHTML = `
      <span>Última actualización: ${escapeHtml(formatLastModified())}</span>
      <span aria-hidden="true">•</span>
      <a href="mailto:${EMAIL}?subject=${encodeURIComponent("Consulta desde el portal académico")}">Contacto</a>
    `;
    footer.appendChild(meta);
  }

  function hideLoader() {
    const loader = document.querySelector("#portal-loader");
    if (!loader) return;
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 420);
  }

  function initNavigationProgress() {
    let progress = document.querySelector("#portal-progress");
    if (!progress) {
      progress = document.createElement("div");
      progress.id = "portal-progress";
      progress.setAttribute("aria-hidden", "true");
      document.body.appendChild(progress);
    }

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
        if (url.origin === location.origin) progress.classList.add("is-active");
      } catch (_) {}
    });

    window.addEventListener("pageshow", () => {
      progress.classList.remove("is-active");
    });
  }

  function initConnectionMessages() {
    window.addEventListener("offline", () => {
      notify(
        "Se perdió la conexión. Las respuestas que ves permanecen en la pantalla; no cierres la página.",
        "warning",
        0,
        "Sin conexión"
      );
    });

    window.addEventListener("online", () => {
      notify("La conexión se restableció.", "success", 3200);
    });

    if (!navigator.onLine) {
      setTimeout(() => {
        notify("Estás navegando sin conexión a internet.", "warning", 0, "Sin conexión");
      }, 600);
    }
  }

  function initErrorMessages() {
    let resourceErrorShown = false;

    window.addEventListener("error", (event) => {
      const target = event.target;
      const resourceFailure =
        target &&
        target !== window &&
        (target.tagName === "SCRIPT" || target.tagName === "LINK" || target.tagName === "IMG");

      if (!resourceFailure || resourceErrorShown) return;
      resourceErrorShown = true;
      notify(
        "Un recurso no cargó correctamente. Prueba recargar la página con Ctrl + F5.",
        "error",
        8500,
        "Carga incompleta"
      );
    }, true);

    window.addEventListener("unhandledrejection", () => {
      notify(
        "Una operación no terminó correctamente. Revisa tu conexión e intenta nuevamente.",
        "error",
        7500
      );
    });
  }

  function initValidationMessages() {
    document.addEventListener("invalid", (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement)) return;

      notify("Completa o revisa el campo señalado antes de continuar.", "warning", 3400, "Falta información");
    }, true);
  }

  function initReveals() {
    const elements = [
      ...document.querySelectorAll(
        ".course-card, .sim-card, .start-card, .step, .info-card, .card, .question-card"
      )
    ].filter((element) => !element.closest(".page-header"));

    elements.forEach((element, index) => {
      element.classList.add("portal-reveal");
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 45}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -25px" });

    elements.forEach((element) => observer.observe(element));
  }

  function init() {
    initMenu();
    enhanceFooter();
    initNavigationProgress();
    initConnectionMessages();
    initErrorMessages();
    initValidationMessages();
    initReveals();
  }

  window.PortalUI = { notify };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("load", () => setTimeout(hideLoader, 140), { once: true });
  setTimeout(hideLoader, 3800);
})();
