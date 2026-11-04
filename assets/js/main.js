'use strict';
/**
 * Componentes compartidos y contenido de cabeceras.
 * Modifica PAGE_CONFIG para cambiar títulos, botones y métricas en cada página.
 * Iconos mediante Tabler Icons Webfont.
 */
const PAGE_CONFIG = {
  inicio: {
    title: 'Soluciones de software para problemas reales.',
    eyebrow: 'Gustavo Cárdenas · Consultor tecnológico y desarrollador de software',
    description: 'Consultoría y desarrollo de software para integrar sistemas, mejorar procesos y dar continuidad a las operaciones de su empresa.',
    buttons: [{ text: 'Conversemos sobre su proyecto', href: 'contacto.html', style: 'primary' }, { text: 'Ver casos', href: 'proyectos.html', style: 'outline' }],
    metrics: [{ icon: 'code', title: 'Más de 10 años', detail: 'Experiencia en software' }, { icon: 'building-factory', title: 'Experiencia sectorial', detail: 'Salud, energía y logística' }, { icon: 'layout-dashboard', title: 'Productos propios', detail: 'Soluciones en producción' }]
  },
  servicios: {
    title: 'Tecnología que responde a los desafíos de su empresa.',
    eyebrow: 'Servicios · Consultoría tecnológica y desarrollo de software',
    description: 'Del diagnóstico a la implementación: diseño soluciones a medida, conecto sistemas y ayudo a evolucionar aplicaciones que sostienen la operación.',
    buttons: [{ text: 'Conversemos sobre su proyecto', href: 'contacto.html', style: 'primary' }, { text: 'Explorar especialidades', href: '#especialidades', style: 'outline' }],
    metrics: [{ icon: 'search', title: 'Diagnóstico', detail: 'Comprender el problema real' }, { icon: 'code', title: 'Desarrollo', detail: 'Construir soluciones útiles' }, { icon: 'arrows-exchange', title: 'Integración', detail: 'Conectar y evolucionar sistemas' }]
  },
  proyectos: {
    title: 'Proyectos y soluciones desarrolladas.',
    eyebrow: 'Portafolio',
    description: 'Productos SaaS, plataformas empresariales e integración de sistemas: experiencia aplicada a problemas reales.',
    buttons: [{ text: 'Conversemos', href: 'contacto.html', style: 'primary' }],
    metrics: [{ icon: 'world-www', title: 'Plataformas', detail: 'Software empresarial' }, { icon: 'layout-dashboard', title: 'Productos SaaS', detail: 'Herramientas para empresas' }, { icon: 'arrows-exchange', title: 'Integraciones', detail: 'Procesos conectados' }]
  },
  detalle: {
    title: 'Estación48.<br>Una experiencia digital a medida.',
    eyebrow: 'Proyecto destacado · Caso en desarrollo',
    description: 'Diseño web y sistema de reservas para servicios de estética automotriz. Un proyecto que combina experiencia de usuario y operación.',
    buttons: [{ text: 'Otros proyectos', href: 'proyectos.html', style: 'primary' }, { text: 'Consultar por uno similar', href: 'contacto.html', style: 'outline' }],
    metrics: [{ icon: 'world-www', title: 'Landing page', detail: 'Identidad y servicios' }, { icon: 'code', title: 'Agenda online', detail: 'Reservas por bloques' }, { icon: 'palette', title: 'Diseño adaptable', detail: 'Escritorio y móvil' }]
  },
  sobre: {
    title: 'Experiencia técnica.<br>Soluciones con propósito.',
    eyebrow: 'Gustavo Cárdenas · Consultor tecnológico y desarrollador de software',
    description: 'Analizo problemas, diseño soluciones y desarrollo sistemas para operaciones reales. Una mirada que combina criterio técnico y conocimiento de procesos.',
    buttons: [{ text: 'Conocer mis proyectos', href: 'proyectos.html', style: 'primary' }, { text: 'Conversemos', href: 'contacto.html', style: 'outline' }],
    metrics: [{ icon: 'search', title: 'Análisis', detail: 'Comprender necesidades y procesos' }, { icon: 'sitemap', title: 'Arquitectura', detail: 'Diseñar soluciones e integraciones' }, { icon: 'code', title: 'Implementación', detail: 'Desarrollo y puesta en producción' }]
  },
  contacto: {
    title: 'Conversemos sobre su desafío tecnológico.',
    eyebrow: 'Contacto · Consultoría y desarrollo de software',
    description: 'Cuénteme qué necesita resolver o mejorar. Una primera conversación permite comprender el contexto y explorar alternativas de trabajo.',
    buttons: [],
    metrics: [{ icon: 'message-circle', title: 'Conversación inicial', detail: 'Comprender su necesidad' }, { icon: 'search', title: 'Evaluación de alternativas', detail: 'Definir el camino adecuado' }, { icon: 'clipboard-check', title: 'Alcance claro', detail: 'Propuesta según requerimientos' }]
  }
};
const NAV_LINKS = [
  { key:'inicio', label:'Inicio', href:'index.html' },
  { key:'servicios', label:'Servicios', href:'servicios.html' },
  { key:'proyectos', label:'Proyectos', href:'proyectos.html' },
  { key:'sobre', label:'Sobre mí', href:'sobre-mi.html' },
  { key:'contacto', label:'Contacto', href:'contacto.html' }
];
function headerHTML(page) {
  const cfg = PAGE_CONFIG[page] || PAGE_CONFIG.inicio;
  const selected = page === 'detalle' ? 'proyectos' : page;
  const nav = NAV_LINKS.map(item => `<a href="${item.href}" ${selected === item.key ? 'aria-current="page"' : ''} class="${item.key === 'contacto' ? 'nav-contact' : ''}">${item.label}${item.key === 'contacto' ? ' <i class="ti ti-arrow-up-right" aria-hidden="true"></i>' : ''}</a>`).join('');
  const buttons = cfg.buttons.map(b => `<a class="btn btn-${b.style}" href="${b.href}">${b.text} <i class="ti ti-arrow-up-right" aria-hidden="true"></i></a>`).join('');
  const metrics = cfg.metrics.slice(0, 3).map(m => `<div class="hero-metric"><span class="hero-metric-icon" aria-hidden="true"><i class="ti ti-${m.icon}"></i></span><div><strong>${m.title}</strong><span>${m.detail}</span></div></div>`).join('');
  return `<nav class="site-nav" aria-label="Navegación principal"><div class="container nav-inner"><a class="brand" href="index.html" aria-label="Gustavo Cárdenas, ir a inicio"><img src="assets/img/logo.svg" alt="Gustavo Cárdenas — Sistemas, integraciones y automatización" width="286" height="54"></a><button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Abrir menú"><i class="ti ti-menu-2" aria-hidden="true"></i></button><div class="nav-menu" id="nav-menu">${nav}</div></div></nav><header class="hero ${page === 'inicio' ? '' : 'hero--compact'}"><div class="container hero-inner"><div class="hero-content"><p class="eyebrow">${cfg.eyebrow}</p><h1>${cfg.title}</h1><p class="hero-desc">${cfg.description}</p>${buttons ? `<div class="actions">${buttons}</div>` : ''}</div><div class="hero-metrics">${metrics}</div></div></header>`;
}
function footerHTML(){const year=new Date().getFullYear();return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><h3>Gustavo Cárdenas</h3><p>Sistemas, integraciones y automatización para empresas.<br>Desde Chile.</p></div><div><h3>Explora</h3><div class="footer-links"><a href="servicios.html">Servicios</a><a href="proyectos.html">Proyectos</a><a href="sobre-mi.html">Sobre mí</a></div></div><div><h3>Conversemos</h3><div class="footer-links"><a href="contacto.html">Formulario de contacto</a><a href="mailto:hola@gcardenas.cl">hola@gcardenas.cl</a></div></div></div><div class="footer-bottom"><span>© ${year} Gustavo Cárdenas. Todos los derechos reservados.</span><span>Software a medida desde Chile.</span></div></div></footer>`}
function initNavigation(){const nav=document.querySelector('.site-nav');const toggle=document.querySelector('.nav-toggle');const menu=document.querySelector('.nav-menu');const onScroll=()=>nav.classList.toggle('is-sticky',window.scrollY>25);onScroll();addEventListener('scroll',onScroll,{passive:true});toggle?.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');toggle.innerHTML=open?'<i class="ti ti-x" aria-hidden="true"></i>':'<i class="ti ti-menu-2" aria-hidden="true"></i>'});menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}))}
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const feedback = document.getElementById('form-feedback');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Enviando mensaje…';
    if (feedback) {
      feedback.textContent = 'Enviando su consulta…';
      feedback.setAttribute('role', 'status');
    }
    try {
      const data = new FormData(form);
      data.set('_subject', 'Nueva consulta desde gcardenas.cl');
      data.set('_template', 'table');
      data.set('_url', window.location.href);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json();
      if (!response.ok || result.success === 'false' || result.success === false) {
        throw new Error('No se pudo registrar la consulta.');
      }
      form.reset();
      if (feedback) {
        feedback.textContent = 'Su consulta fue recibida por el servicio de formularios. Si es su primer envío, la entrega puede requerir una activación pendiente. Responderé dentro de un día hábil una vez que el mensaje llegue al correo.';
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent = 'No se pudo completar el envío. Inténtelo nuevamente o escriba a hola@gcardenas.cl. No se ha confirmado la recepción de su mensaje.';
        feedback.setAttribute('role', 'alert');
      }
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
}
document.addEventListener('DOMContentLoaded',()=>{const page=document.body.dataset.page||'inicio';const header=document.getElementById('site-header');const footer=document.getElementById('site-footer');if(header)header.innerHTML=headerHTML(page);if(footer)footer.innerHTML=footerHTML();initNavigation();initContactForm()});


/**
 * Animación progresiva de contenido, microinteracciones y progreso de lectura.
 * Sin dependencias; respeta las preferencias de accesibilidad del dispositivo.
 */
function initMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const selectors = [
    'main .section-head',
    'main .services-intro',
    'main .projects-intro',
    'main .copy',
    'main .service-card',
    'main .feature-card',
    'main .project-card',
    'main .process-step',
    'main .detail-stat',
    'main .split > img',
    'main .detail-image',
    'main .contact-panel',
    'main .contact-line',
    'main .callout',
    '.site-footer .footer-grid > div'
  ];
  const staggered = '.service-card, .feature-card, .project-card, .process-step, .detail-stat, .contact-panel, .contact-line, .footer-grid > div';
  const targets = [...document.querySelectorAll(selectors.join(','))];
  document.documentElement.classList.add('motion-enabled');

  targets.forEach(element => {
    element.setAttribute('data-reveal', '');
    const group = [...element.parentElement.children].filter(sibling => sibling.matches(staggered));
    const index = group.indexOf(element);
    if (index > 0) {
      element.style.setProperty('--motion-delay', Math.min(index, 4) * 95 + 'ms');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(element => observer.observe(element));
  } else {
    targets.forEach(element => element.classList.add('is-visible'));
  }

  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const progress = document.createElement('span');
  progress.className = 'motion-progress';
  progress.setAttribute('aria-hidden', 'true');
  nav.appendChild(progress);

  let frameRequested = false;
  const updateProgress = () => {
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = limit > 0 ? Math.max(0, Math.min(1, window.scrollY / limit)) : 0;
    progress.style.transform = 'scaleX(' + fraction + ')';
    frameRequested = false;
  };
  const requestProgress = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateProgress);
  };

  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress, { passive: true });
  updateProgress();
}
document.addEventListener('DOMContentLoaded', initMotion);
