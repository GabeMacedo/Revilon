(() => {
  /* SLIDER */
  const slider = document.getElementById('productSlider');
  if (!slider) return;

  const slidesWrap = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.dots');

  let index = 0;
  const autoplayMs = 3500;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot' + (i === 0 ? ' is-active' : '');
    b.setAttribute('aria-label', 'Ir para a imagem ' + (i + 1));
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function update() {
    slidesWrap.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goTo(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (userAction) restartAutoplay();
  }

  function next(userAction = false) { goTo(index + 1, userAction); }
  function prev(userAction = false) { goTo(index - 1, userAction); }

  prevBtn.addEventListener('click', () => prev(true));
  nextBtn.addEventListener('click', () => next(true));

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => next(false), autoplayMs);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restartAutoplay() { startAutoplay(); }

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  let startX = 0, dx = 0, isDown = false;

  slider.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    dx = 0;
    slider.setPointerCapture(e.pointerId);
    stopAutoplay();
  });

  slider.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;
  });

  slider.addEventListener('pointerup', () => {
    if (!isDown) return;
    isDown = false;
    const threshold = 40;
    if (dx > threshold) prev(true);
    else if (dx < -threshold) next(true);
    else restartAutoplay();
  });

  update();
  startAutoplay();

  /* SCROLL REVEAL */
  const reveals = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const revealPoint = 110;

    reveals.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - revealPoint) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();
})();
