(() => {
  // SCROLL REVEAL
  const reveals = document.querySelectorAll('.reveal');

  function revealOnScroll(){
    const windowHeight = window.innerHeight;
    const revealPoint = 110;

    reveals.forEach((el)=>{
      const elementTop = el.getBoundingClientRect().top;
      if(elementTop < windowHeight - revealPoint){
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll, { passive:true });
  revealOnScroll();
})();