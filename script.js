// Aviso +18 (lembra a confirmação neste navegador)
const gate = document.getElementById('ageGate');
let confirmed = false;
try { confirmed = localStorage.getItem('age-ok') === '1'; } catch (e) {}
if (confirmed) gate.classList.add('hidden');
else document.body.classList.add('locked');

document.getElementById('ageYes').addEventListener('click', () => {
  try { localStorage.setItem('age-ok', '1'); } catch (e) {}
  gate.classList.add('hidden');
  document.body.classList.remove('locked');
});

document.getElementById('year').textContent = new Date().getFullYear();

// Galeria: esconde fotos que não existem
const tiles = [...document.querySelectorAll('.tile')];
tiles.forEach(tile => {
  const img = tile.querySelector('img');
  img.addEventListener('error', () => tile.remove());
});

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let current = 0;

function visibleImages() {
  return [...document.querySelectorAll('.tile img')];
}
function show(i) {
  const imgs = visibleImages();
  current = (i + imgs.length) % imgs.length;
  lbImg.src = imgs[current].src;
}
function openLb(i) {
  show(i);
  lb.classList.add('open');
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

// Animação ao rolar
const revealEls = document.querySelectorAll('.hero-text, .hero-photo, .about-photo, .about-text, .section-head, .tile, .card, .price-list li, .contact > *');
revealEls.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));
