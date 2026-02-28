(function () {
  // Slider
  const slider = document.getElementById("productSlider");
  if (!slider) return;

  const slidesWrap = slider.querySelector(".product-slides");
  const slides = Array.from(slider.querySelectorAll(".product-slide"));
  const prevBtn = slider.querySelector(".pnav.prev");
  const nextBtn = slider.querySelector(".pnav.next");
  const dotsWrap = slider.querySelector(".pdots");

  let index = 0;
  const autoplayMs = 3500;
  let timer = null;

  // build dots
  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "pdot" + (i === 0 ? " is-active" : "");
    d.setAttribute("aria-label", "Ir para a imagem " + (i + 1));
    d.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(d);
    return d;
  });

  function update() {
    slidesWrap.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (userAction) restartAutoplay();
  }

  function next(userAction = false) { goTo(index + 1, userAction); }
  function prev(userAction = false) { goTo(index - 1, userAction); }

  prevBtn.addEventListener("click", () => prev(true));
  nextBtn.addEventListener("click", () => next(true));

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => next(false), autoplayMs);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restartAutoplay() { startAutoplay(); }

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  // swipe (mobile)
  let startX = 0, dx = 0, isDown = false;
  slider.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    dx = 0;
    slider.setPointerCapture(e.pointerId);
    stopAutoplay();
  });

  slider.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;
  });

  slider.addEventListener("pointerup", () => {
    if (!isDown) return;
    isDown = false;
    const threshold = 40;
    if (dx > threshold) prev(true);
    else if (dx < -threshold) next(true);
    else restartAutoplay();
  });

  update();
  startAutoplay();

  // Scroll reveal
  const reveals = document.querySelectorAll(".reveal");
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
})();