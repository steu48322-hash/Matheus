const heroPhoto = document.querySelector('.hero-photo');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- Aviso +18 ----------
const gate = document.getElementById('ageGate');
let confirmed = false;
try { confirmed = localStorage.getItem('age-ok') === '1'; } catch (e) {}
if (confirmed) gate.classList.add('hidden');
else document.body.classList.add('locked');

document.getElementById('ageYes').addEventListener('click', () => {
  try { localStorage.setItem('age-ok', '1'); } catch (e) {}
  gate.classList.add('hidden');
  document.body.classList.remove('locked');
  start();
});

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Títulos: quebra em palavras ----------
function splitWords(el) {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.transitionDelay = (i++ * 0.08) + 's';
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
}
document.querySelectorAll('.split').forEach(splitWords);

// ---------- Intro ----------
const intro = document.getElementById('intro');
let introDone = reduceMotion;
if (reduceMotion) intro.remove();
else setTimeout(() => {
  intro.classList.add('done');
  setTimeout(() => intro.remove(), 1200);
  introDone = true;
  start();
}, 1600);

// ---------- Galeria: esconde fotos que não existem ----------
document.querySelectorAll('.tile img').forEach(img => {
  img.addEventListener('error', () => img.closest('.tile').remove());
});

// ---------- Lightbox ----------
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let current = 0;
const visibleImages = () => [...document.querySelectorAll('.tile img')];
function show(i) {
  const imgs = visibleImages();
  current = (i + imgs.length) % imgs.length;
  lb.classList.remove('open'); void lb.offsetWidth; // reinicia o zoom
  lbImg.src = imgs[current].src;
  lb.classList.add('open');
}
function openLb(i) {
  show(i);
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}
function closeLb() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
}
document.getElementById('grid').addEventListener('click', e => {
  const tile = e.target.closest('.tile');
  if (tile) openLb(visibleImages().indexOf(tile.querySelector('img')));
});
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
lb.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});

// ---------- Animações ao rolar ----------
const revealEls = document.querySelectorAll('.hero-text > *:not(h1), .about-photo, .about-text > *:not(h2), .section-head > *:not(h2), .tile, .card, .review, .price-list li, .review-scores li, .contact > *:not(h2), .price-note');
revealEls.forEach(el => el.classList.add('reveal'));

// atraso escalonado dentro de cada grupo
document.querySelectorAll('.grid, .cards, .review-grid, .price-list, .review-scores, .hero-text, .about-text').forEach(group => {
  [...group.children].forEach((el, i) => { el.style.transitionDelay = (i % 6) * 0.09 + 's'; });
});

let started = false;
function start() {
  if (started || !introDone || !gate.classList.contains('hidden')) return;
  started = true;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('split')) el.classList.add('in');
      else el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.split').forEach(el => io.observe(el));

  // a foto do topo está recortada (clip-path), então o observer não a enxerga: revela direto
  heroPhoto.classList.add('in');
  setTimeout(() => heroPhoto.classList.add('ready'), 1800);
  revealEls.forEach(el => io.observe(el));

  // tiles: limpa atraso depois de aparecer para a inclinação ficar responsiva
  document.querySelectorAll('.tile').forEach(t => t.addEventListener('transitionend', () => { t.style.transitionDelay = '0s'; }, { once: true }));
}
start();

// ---------- Rolagem: progresso, nav, parallax ----------
const progress = document.getElementById('progress');
const nav = document.querySelector('.nav');
const aboutImg = document.querySelector('.about-photo img');
let lastY = 0, ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > lastY && y > 300);
  lastY = y;

  if (!reduceMotion) {
    heroPhoto.style.setProperty('--py', `${y * 0.12}px`);
    const r = aboutImg.parentElement.getBoundingClientRect();
    aboutImg.style.setProperty('--py', `${(r.top + r.height / 2 - innerHeight / 2) * -0.08}px`);
  }
  ticking = false;
}
addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

// ---------- Efeitos de mouse (desktop) ----------
if (finePointer && !reduceMotion) {
  // cursor
  const cursor = document.getElementById('cursor');
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .tile').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });

  // botões magnéticos
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // inclinação 3D nas fotos + brilho
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tile.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
      tile.style.setProperty('--rx', `${(0.5 - py) * 10}deg`);
      tile.style.setProperty('--mx', `${px * 100}%`);
      tile.style.setProperty('--my', `${py * 100}%`);
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.setProperty('--rx', '0deg');
      tile.style.setProperty('--ry', '0deg');
    });
  });

  // brilho que segue o mouse nos cards
  document.querySelectorAll('.card, .review').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
