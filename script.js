(() => {
  "use strict";

  /* =========================
     SLIDER PREMIUM (pslider)
     Estrutura esperada (HTML):
     - #pslider (ou .pslider)
     - .pslider__slide (com .is-active em 1)
     - .pslider__nav--prev / .pslider__nav--next
     - .pslider__dots (container vazio)
     - .pslider__current / .pslider__total (contador)
     - .pslider__thumb[data-goto="index"] (thumbs)
  ========================= */

  const slider =
    document.getElementById("pslider") ||
    document.querySelector(".pslider") ||
    null;

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".pslider__slide"));
    const prevBtn = slider.querySelector(".pslider__nav--prev");
    const nextBtn = slider.querySelector(".pslider__nav--next");
    const dotsWrap = slider.querySelector(".pslider__dots");
    const currentEl = slider.querySelector(".pslider__current");
    const totalEl = slider.querySelector(".pslider__total");
    const thumbs = Array.from(slider.querySelectorAll(".pslider__thumb"));

    if (slides.length > 0 && totalEl) totalEl.textContent = String(slides.length);

    // índice inicial
    let index = Math.max(0, slides.findIndex(s => s.classList.contains("is-active")));
    if (index === -1) index = 0;

    // autoplay
    const autoplayMs = 5000; // ✅ ajuste aqui: 4500–6500 é premium
    let timer = null;

    // swipe
    let startX = 0;
    let dx = 0;
    let isDown = false;
    let moved = false;

    // dots (criar automático)
    let dots = [];
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      dots = slides.map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "is-active"; // vai ajustar no update
        b.className = "";
        b.setAttribute("aria-label", `Ir para a imagem ${i + 1}`);
        b.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(b);
        return b;
      });
    }

    function updateUI() {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));

      // dots
      if (dots.length) dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

      // contador
      if (currentEl) currentEl.textContent = String(index + 1);

      // thumbs
      if (thumbs.length) thumbs.forEach((t) => {
        const go = Number(t.getAttribute("data-goto"));
        t.classList.toggle("is-active", go === index);
      });

      // aria
      slider.setAttribute("aria-label", `Galeria de fotos do produto (${index + 1} de ${slides.length})`);
    }

    function goTo(i, userAction = false) {
      const total = slides.length;
      index = (i + total) % total;
      updateUI();
      if (userAction) restartAutoplay();
    }

    function next(userAction = false) { goTo(index + 1, userAction); }
    function prev(userAction = false) { goTo(index - 1, userAction); }

    // botões
    prevBtn?.addEventListener("click", () => prev(true));
    nextBtn?.addEventListener("click", () => next(true));

    // thumbs click
    thumbs.forEach((t) => {
      t.addEventListener("click", () => {
        const go = Number(t.getAttribute("data-goto"));
        if (!Number.isNaN(go)) goTo(go, true);
      });
    });

    // autoplay controls
    function startAutoplay() {
      stopAutoplay();
      if (slides.length <= 1) return;
      timer = setInterval(() => next(false), autoplayMs);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // pausa ao passar mouse (desktop)
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // pausa se aba não está visível
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    // swipe (pointer events)
    slider.addEventListener("pointerdown", (e) => {
      if (slides.length <= 1) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      dx = 0;
      slider.setPointerCapture?.(e.pointerId);
      stopAutoplay();
    });

    slider.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 8) moved = true;
    });

    slider.addEventListener("pointerup", () => {
      if (!isDown) return;
      isDown = false;

      const threshold = Math.max(45, slider.clientWidth * 0.10);
      if (dx > threshold) prev(true);
      else if (dx < -threshold) next(true);
      else startAutoplay();
    });

    slider.addEventListener("pointercancel", () => {
      isDown = false;
      startAutoplay();
    });

    // evita clique acidental ao arrastar
    slider.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    // teclado (acessibilidade)
    slider.setAttribute("tabindex", "0");
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next(true);
      if (e.key === "ArrowLeft") prev(true);
    });

    // init
    buildDots();
    updateUI();
    startAutoplay();
  }

  /* =========================
     STICKY CTA (aparece ao rolar)
     HTML: <div id="stickyCta" data-show-after="320" aria-hidden="true">
     CSS: .sticky-cta[aria-hidden="true"] { ... escondido ... }
  ========================= */
  const sticky = document.getElementById("stickyCta");
  if (sticky) {
    const showAfter = Number(sticky.getAttribute("data-show-after") || "320");

    function updateSticky() {
      const show = window.scrollY > showAfter;
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.classList.toggle("is-visible", show);
    }

    window.addEventListener("scroll", updateSticky, { passive: true });
    updateSticky();
  }

  /* =========================
     SCROLL REVEAL (opcional)
     Use classes: .reveal ou .relivon-reveal no HTML
  ========================= */
  const reveals = document.querySelectorAll(".reveal, .relivon-reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("active", entry.isIntersecting);
        });
      }, { threshold: 0.12 });

      reveals.forEach(el => io.observe(el));
    } else {
      function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 110;
        reveals.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          el.classList.toggle("active", top < windowHeight - revealPoint);
        });
      }
      window.addEventListener("scroll", revealOnScroll, { passive: true });
      revealOnScroll();
    }
  }
})();