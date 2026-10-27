'use strict';
/**
 * Componentes compartidos y contenido de cabeceras.
 * Modifica PAGE_CONFIG para cambiar títulos, botones y métricas en cada página.
 * Iconos mediante Tabler Icons Webfont.
 */
const PAGE_CONFIG = {
  inicio: {
    title: 'Ideas que crecen.<br>Soluciones que perduran.',
    eyebrow: 'Diseño · Desarrollo · Estrategia digital',
    description: 'Diseño y desarrollo experiencias web que ayudan a emprendedores y empresas a destacar, conectar y crecer en Chile y Latinoamérica.',
    buttons: [{ text: 'Hablemos de tu proyecto', href: 'contacto.html', style: 'primary' }, { text: 'Ver proyectos', href: 'proyectos.html', style: 'outline' }],
    metrics: [{ icon: 'mountain', title: 'Experiencia real', detail: 'En proyectos y productos digitales' }, { icon: 'users', title: 'Trato directo', detail: 'Sin intermediarios' }, { icon: 'chart-bar', title: 'Soluciones', detail: 'Para negocios en crecimiento' }]
  },
  servicios: {
    title: 'Tecnología y diseño<br>al servicio de tu negocio.',
    eyebrow: 'Servicios',
    description: 'Desde una landing page hasta una plataforma web a medida. Construyamos lo que tu negocio necesita para crecer.',
    buttons: [{ text: 'Solicitar propuesta', href: 'contacto.html', style: 'primary' }],
    metrics: [{ icon: 'palette', title: 'Diseño estratégico', detail: 'Belleza y funcionalidad' }, { icon: 'code', title: 'Desarrollo sólido', detail: 'Rendimiento y evolución' }, { icon: 'trending-up', title: 'Objetivos claros', detail: 'Foco en tu negocio' }]
  },
  proyectos: {
    title: 'Ideas reales.<br>Proyectos con propósito.',
    eyebrow: 'Portafolio',
    description: 'Una selección de experiencias digitales desarrolladas para resolver necesidades concretas.',
    buttons: [{ text: 'Conversemos', href: 'contacto.html', style: 'primary' }],
    metrics: [{ icon: 'world-www', title: 'Sitios web', detail: 'Identidad y presencia digital' }, { icon: 'layout-dashboard', title: 'Productos SaaS', detail: 'Herramientas para empresas' }, { icon: 'arrows-exchange', title: 'Integraciones', detail: 'Procesos conectados' }]
  },
  detalle: {
    title: 'Estación48.<br>Una experiencia digital a medida.',
    eyebrow: 'Proyecto destacado · Caso en desarrollo',
    description: 'Diseño web y sistema de reservas para servicios de estética automotriz. Un proyecto que combina experiencia de usuario y operación.',
    buttons: [{ text: 'Otros proyectos', href: 'proyectos.html', style: 'primary' }, { text: 'Consultar por uno similar', href: 'contacto.html', style: 'outline' }],
    metrics: [{ icon: 'world-www', title: 'Landing page', detail: 'Identidad y servicios' }, { icon: 'code', title: 'Agenda online', detail: 'Reservas por bloques' }, { icon: 'palette', title: 'Diseño adaptable', detail: 'Escritorio y móvil' }]
  },
  sobre: {
    title: 'Experiencia técnica.<br>Visión creativa.',
    eyebrow: 'Sobre mí',
    description: 'Soy Gustavo Cárdenas. Acompaño a empresas y emprendedores a convertir desafíos en productos y experiencias digitales.',
    buttons: [{ text: 'Ver mi trabajo', href: 'proyectos.html', style: 'primary' }, { text: 'Contactarme', href: 'contacto.html', style: 'outline' }],
    metrics: [{ icon: 'devices', title: 'Diseño y desarrollo', detail: 'Una mirada integral' }, { icon: 'trending-up', title: 'Visión de negocio', detail: 'Tecnología con propósito' }, { icon: 'users', title: 'Trato directo', detail: 'Trabajo colaborativo' }]
  },
  contacto: {
    title: 'Conversemos sobre<br>tu próximo proyecto.',
    eyebrow: 'Contacto',
    description: '¿Tienes una idea o quieres mejorar tu presencia digital? Cuéntame qué necesitas y evaluemos juntos el mejor camino.',
    buttons: [],
    metrics: [{ icon: 'mountain', title: 'A tu medida', detail: 'Propuestas personalizadas' }, { icon: 'users', title: 'Contacto directo', detail: 'Sin intermediarios' }, { icon: 'chart-bar', title: 'Resultados', detail: 'Foco en necesidades reales' }]
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
  return `<nav class="site-nav" aria-label="Navegación principal"><div class="container nav-inner"><a class="brand" href="index.html" aria-label="Gustavo Cárdenas, ir a inicio"><img src="assets/img/logo.svg" alt="Gustavo Cárdenas — Diseño y desarrollo web" width="286" height="54"></a><button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Abrir menú"><i class="ti ti-menu-2" aria-hidden="true"></i></button><div class="nav-menu" id="nav-menu">${nav}</div></div></nav><header class="hero ${page === 'inicio' ? '' : 'hero--compact'}"><div class="container hero-inner"><div class="hero-content"><p class="eyebrow">${cfg.eyebrow}</p><h1>${cfg.title}</h1><p class="hero-desc">${cfg.description}</p>${buttons ? `<div class="actions">${buttons}</div>` : ''}</div><div class="hero-metrics">${metrics}</div></div></header>`;
}
function footerHTML(){const year=new Date().getFullYear();return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><h3>Gustavo Cárdenas</h3><p>Diseño y desarrollo web con propósito.<br>Desde Chile para Latinoamérica.</p></div><div><h3>Explora</h3><div class="footer-links"><a href="servicios.html">Servicios</a><a href="proyectos.html">Proyectos</a><a href="sobre-mi.html">Sobre mí</a></div></div><div><h3>Conversemos</h3><div class="footer-links"><a href="contacto.html">Formulario de contacto</a><a href="mailto:hola@gcardenas.cl">hola@gcardenas.cl</a></div></div></div><div class="footer-bottom"><span>© ${year} Gustavo Cárdenas. Todos los derechos reservados.</span><span>Diseño y desarrollo desde Chile.</span></div></div></footer>`}
function initNavigation(){const nav=document.querySelector('.site-nav');const toggle=document.querySelector('.nav-toggle');const menu=document.querySelector('.nav-menu');const onScroll=()=>nav.classList.toggle('is-sticky',window.scrollY>25);onScroll();addEventListener('scroll',onScroll,{passive:true});toggle?.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');toggle.innerHTML=open?'<i class="ti ti-x" aria-hidden="true"></i>':'<i class="ti ti-menu-2" aria-hidden="true"></i>'});menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}))}
function initContactForm(){const form=document.querySelector('#contact-form');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const lines=[`Nombre: ${data.get('nombre')}`,`Empresa: ${data.get('empresa')||'No indicada'}`,`Email: ${data.get('email')}`,`Proyecto: ${data.get('tipo')}`,`Presupuesto: ${data.get('presupuesto')||'No indicado'}`,'',String(data.get('mensaje'))];const subject=`Consulta web: ${data.get('tipo')}`;const url=`mailto:hola@gcardenas.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;window.location.href=url;document.getElementById('form-feedback').textContent='Se abrirá tu aplicación de correo con el mensaje preparado. Verifica y envía el correo desde allí.'})}
document.addEventListener('DOMContentLoaded',()=>{const page=document.body.dataset.page||'inicio';const header=document.getElementById('site-header');const footer=document.getElementById('site-footer');if(header)header.innerHTML=headerHTML(page);if(footer)footer.innerHTML=footerHTML();initNavigation();initContactForm()});
