(() => {
  "use strict";

  /* =========================
     HELPERS
  ========================= */
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /* =========================
     SLIDER (JS controlado)
     Suporta:
     - #galeria .slider-track .product-slide (seu padrão atual)
     - #productSlider .product-slides .product-slide (padrão antigo)
  ========================= */
  const slider =
    document.getElementById("galeria") ||
    document.getElementById("productSlider") ||
    document.querySelector(".product-slider") ||
    null;

  if (slider) {
    const track =
      slider.querySelector(".slider-track") ||
      slider.querySelector(".product-slides") ||
      null;

    const slides = Array.from(slider.querySelectorAll(".product-slide"));

    // Se não tiver track ou menos de 2 imagens, não tenta animar
    if (track && slides.length > 1) {
      // Garante layout para JS (sem depender de CSS)
      slider.style.overflow = "hidden";
      track.style.display = "flex";
      track.style.willChange = "transform";
      track.style.transition = "transform 450ms ease";
      track.style.transform = "translateX(0%)";

      slides.forEach((s) => {
        s.style.flex = "0 0 100%";
        s.style.width = "100%";
      });

      // Dots (opcional)
      const dotsWrap =
        slider.querySelector(".pdots") ||
        slider.querySelector(".dots") ||
        null;

      let dots = [];
      let index = 0;

      // Tempo do autoplay (ajuste aqui)
      const autoplayMs = 4500;
      let timer = null;

      const buildDots = () => {
        if (!dotsWrap) return;

        dotsWrap.innerHTML = "";
        dots = slides.map((_, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pdot" + (i === 0 ? " is-active" : "");
          b.setAttribute("aria-label", `Ir para a imagem ${i + 1}`);
          b.addEventListener("click", () => goTo(i, true));
          dotsWrap.appendChild(b);
          return b;
        });
      };

      const updateDots = () => {
        if (!dots.length) return;
        dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
      };

      const update = (animate = true) => {
        // Quando usuário arrasta, pode desligar a transição temporariamente
        track.style.transition = animate ? "transform 450ms ease" : "none";
        track.style.transform = `translateX(${-index * 100}%)`;
        updateDots();
      };

      const goTo = (i, userAction = false) => {
        index = (i + slides.length) % slides.length;
        update(true);
        if (userAction) restartAutoplay();
      };

      const next = (userAction = false) => goTo(index + 1, userAction);
      const prev = (userAction = false) => goTo(index - 1, userAction);

      // Setas (opcional)
      const prevBtn =
        slider.querySelector(".pnav.prev") ||
        slider.querySelector(".slider-btn.prev") ||
        null;

      const nextBtn =
        slider.querySelector(".pnav.next") ||
        slider.querySelector(".slider-btn.next") ||
        null;

      prevBtn?.addEventListener("click", () => prev(true));
      nextBtn?.addEventListener("click", () => next(true));

      // Autoplay
      const startAutoplay = () => {
        stopAutoplay();
        timer = setInterval(() => next(false), autoplayMs);
      };

      const stopAutoplay = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      const restartAutoplay = () => {
        stopAutoplay();
        startAutoplay();
      };

      // Pausar quando sair da aba
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
      });

      // Pause no hover (desktop)
      slider.addEventListener("mouseenter", stopAutoplay);
      slider.addEventListener("mouseleave", startAutoplay);

      // Swipe / drag (mobile + desktop)
      let startX = 0;
      let dx = 0;
      let isDown = false;
      let moved = false;

      const onDown = (e) => {
        isDown = true;
        moved = false;
        startX = e.clientX;
        dx = 0;
        slider.setPointerCapture?.(e.pointerId);
        stopAutoplay();
      };

      const onMove = (e) => {
        if (!isDown) return;
        dx = e.clientX - startX;

        if (Math.abs(dx) > 8) moved = true;

        // arrasto suave: move um pouco o track conforme o dedo
        const percent = (dx / slider.clientWidth) * 100;
        track.style.transition = "none";
        track.style.transform = `translateX(${-(index * 100) + percent}%)`;
      };

      const onUp = () => {
        if (!isDown) return;
        isDown = false;

        const thresholdPx = Math.max(40, slider.clientWidth * 0.12); // responsivo
        if (dx > thresholdPx) prev(true);
        else if (dx < -thresholdPx) next(true);
        else {
          update(true);
          startAutoplay();
        }
      };

      slider.addEventListener("pointerdown", onDown);
      slider.addEventListener("pointermove", onMove);
      slider.addEventListener("pointerup", onUp);
      slider.addEventListener("pointercancel", onUp);

      // Evitar clique acidental se arrastar
      slider.addEventListener(
        "click",
        (e) => {
          if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
          }
        },
        true
      );

      // (Opcional) teclado: setas
      slider.setAttribute("tabindex", "0");
      slider.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") next(true);
        if (e.key === "ArrowLeft") prev(true);
      });

      // init
      buildDots();
      update(false);
      startAutoplay();
    }
  }

  /* =========================
     STICKY CTA (aparece ao rolar)
  ========================= */
  const sticky = document.getElementById("stickyCta");
  if (sticky) {
    const showAfter = Number(sticky.getAttribute("data-show-after") || "320");

    const updateSticky = () => {
      const show = window.scrollY > showAfter;
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.classList.toggle("is-visible", show);
    };

    window.addEventListener("scroll", updateSticky, { passive: true });
    updateSticky();
  }

  /* =========================
     SCROLL REVEAL
  ========================= */
  const reveals = document.querySelectorAll(".reveal, .relivon-reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("active", entry.isIntersecting);
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 110;
        reveals.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          el.classList.toggle("active", top < windowHeight - revealPoint);
        });
      };
      window.addEventListener("scroll", revealOnScroll, { passive: true });
      revealOnScroll();
    }
  }
})();