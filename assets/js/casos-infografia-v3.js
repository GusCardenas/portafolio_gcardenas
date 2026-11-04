/* Animación progresiva de los estudios de caso. El contenido es visible sin JavaScript. */
(() => {
  const main = document.querySelector('.case-study');
  if (!main || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = Array.from(document.querySelectorAll('.cl-reveal'));
  if (!elements.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('cl-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: .05, rootMargin: '0px 0px -20px 0px'});
  elements.forEach(element => observer.observe(element));
  // Activar estilos de entrada después de registrar observación.
  main.classList.add('cl-js');
  requestAnimationFrame(() => elements.filter(el => el.getBoundingClientRect().top < window.innerHeight).forEach(el => el.classList.add('cl-visible')));
})();
