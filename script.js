(() => {
  "use strict";

  /* =========================
     SLIDER (auto + dots + swipe)
     Suporta:
     - #productSlider com .product-slides
     - OU .slider-track (meu modelo)
     - OU .product-slider (seu HTML antigo, desde que track exista)
  ========================= */

  // tenta achar o container do slider de formas diferentes
  const slider =
    document.getElementById("productSlider") ||
    document.querySelector(".slider") ||
    document.querySelector(".product-slider") ||
    null;

  if (slider) {
    // tenta achar o "track" (wrapper que move)
    const slidesWrap =
      slider.querySelector(".product-slides") ||
      slider.querySelector(".slider-track") ||
      slider.querySelector(".product-slides-wrap") ||
      slider.querySelector(".product-slidesTrack") ||
      slider.querySelector(".product-slider-track") ||
      null;

    // tenta achar os slides
    const slides = Array.from(
      slider.querySelectorAll(".product-slide, .slide")
    );

    // botões (se existirem)
    const prevBtn =
      slider.querySelector(".pnav.prev") ||
      slider.querySelector(".slider-btn.prev") ||
      null;

    const nextBtn =
      slider.querySelector(".pnav.next") ||
      slider.querySelector(".slider-btn.next") ||
      null;

    // dots wrap (se existir)
    const dotsWrap =
      slider.querySelector(".pdots") ||
      slider.querySelector(".dots") ||
      null;

    // validações mínimas
    const canSlide = slidesWrap && slides.length > 1;

    let index = 0;
    const autoplayMs = 3500;
    let timer = null;

    // cria dots só se tiver wrapper e ainda não tiver dots
    let dots = [];
    if (dotsWrap && slides.length) {
      dotsWrap.innerHTML = "";
      dots = slides.map((_, i) => {
        const d = document.createElement("button");
        d.type = "button";
        d.className = (dotsWrap.classList.contains("dots") ? "dot" : "pdot") + (i === 0 ? " is-active" : "");
        d.setAttribute("aria-label", "Ir para a imagem " + (i + 1));
        d.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(d);
        return d;
      });
    }

    function update() {
      if (!canSlide) return;
      slidesWrap.style.transform = `translateX(${-index * 100}%)`;
      if (dots.length) dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i, userAction = false) {
      if (!canSlide) return;
      index = (i + slides.length) % slides.length;
      update();
      if (userAction) restartAutoplay();
    }

    function next(userAction = false) { goTo(index + 1, userAction); }
    function prev(userAction = false) { goTo(index - 1, userAction); }

    // eventos de clique (se botões existirem)
    prevBtn?.addEventListener("click", () => prev(true));
    nextBtn?.addEventListener("click", () => next(true));

    // autoplay
    function startAutoplay() {
      if (!canSlide) return;
      stopAutoplay();
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

    // pause ao passar mouse (desktop)
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // pausa se aba não estiver visível
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    // swipe (mobile) com pointer events (melhor compatibilidade)
    let startX = 0, dx = 0, isDown = false;
    let moved = false;

    slider.addEventListener("pointerdown", (e) => {
      if (!canSlide) return;
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

      const threshold = 45;
      if (dx > threshold) prev(true);
      else if (dx < -threshold) next(true);
      else restartAutoplay();
    });

    // evita clique acidental em links dentro do slider quando arrastar
    slider.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    update();
    startAutoplay();
  }

  /* =========================
     STICKY CTA (aparece ao rolar)
  ========================= */
  const sticky = document.getElementById("stickyCta");
  if (sticky) {
    const showAfter = Number(sticky.getAttribute("data-show-after") || "320");

    function updateSticky() {
      const show = window.scrollY > showAfter;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", updateSticky, { passive: true });
    updateSticky();
  }

  /* =========================
     SCROLL REVEAL (suave)
     Usa IntersectionObserver se existir
     Caso não exista, cai no fallback scroll
  ========================= */
  const reveals = document.querySelectorAll(".reveal, .relivon-reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
          else entry.target.classList.remove("active");
        });
      }, { threshold: 0.12 });

      reveals.forEach(el => io.observe(el));
    } else {
      function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 110;
        reveals.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          if (top < windowHeight - revealPoint) el.classList.add("active");
          else el.classList.remove("active");
        });
      }
      window.addEventListener("scroll", revealOnScroll, { passive: true });
      revealOnScroll();
    }
  }
})();
