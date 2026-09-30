/* =========================================================
   yartsmin · interactions (plain JavaScript, no libraries)
   ========================================================= */
document.documentElement.classList.add('js');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- year in footer ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- header shrinks on scroll ---------- */
const topbar = $('.topbar');
addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* ---------- mobile menu ---------- */
const toggle = $('.nav-toggle');
const links = $('#nav-links');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open);
  links.classList.toggle('open', open);
});
$$('#nav-links a').forEach((a) => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  links.classList.remove('open');
}));

/* ---------- split headings into words (for the rise-in effect) ---------- */
$$('.split').forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="word"><span style="transition-delay:${i * 60}ms">${w}</span></span>`)
    .join(' ');
});

/* ---------- reveal things as they scroll into view ---------- */
const revealables = $$('.reveal, .split, .featured-media');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  revealables.forEach((el, i) => {
    if (el.classList.contains('piece')) el.style.transitionDelay = `${(i % 3) * 120}ms`;
    io.observe(el);
  });
} else {
  revealables.forEach((el) => el.classList.add('in'));
}

/* ---------- hero: artworks appear and trail behind the cursor ---------- */
const hero = $('#hero');
if (matchMedia('(pointer: coarse)').matches) $('.hint').textContent = '(tap around, things appear)';
const trail = $('.hero-trail');
const trailImages = $$('.gallery img, .card img').map((img) => img.getAttribute('src'));
let lastX = 0, lastY = 0, trailIndex = 0;

function dropImage(x, y) {
  const img = document.createElement('img');
  img.className = 'trail-img';
  img.src = trailImages[trailIndex++ % trailImages.length];
  img.alt = '';
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  img.style.setProperty('--r', `${(Math.random() * 16 - 8).toFixed(1)}deg`);
  trail.appendChild(img);
  // keep at most 7 on screen
  while (trail.children.length > 7) trail.firstElementChild.remove();
  img.addEventListener('animationend', () => img.remove());
  hero.classList.add('touched');
}

if (!reducedMotion) {
  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (Math.hypot(x - lastX, y - lastY) > 110) {  // distance between drops
      dropImage(x, y);
      lastX = x; lastY = y;
    }
  });
  // on phones: tap to make one appear
  hero.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const rect = hero.getBoundingClientRect();
    dropImage(e.clientX - rect.left, e.clientY - rect.top);
  });
}

/* ---------- gentle parallax on gallery pieces ---------- */
const pieces = $$('.piece[data-speed]');
if (!reducedMotion && innerWidth > 900) {
  let ticking = false;
  const update = () => {
    pieces.forEach((p) => {
      const r = p.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(p.dataset.speed);
      p.style.translate = `0 ${offset.toFixed(1)}px`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

/* ---------- 3D tilt on the featured product ---------- */
$$('[data-tilt]').forEach((card) => {
  if (reducedMotion) return;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ---------- drag-to-scroll print strip ---------- */
const strip = $('.strip');
let down = false, startX = 0, startScroll = 0, moved = false;
strip.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
  down = true; moved = false;
  startX = e.clientX; startScroll = strip.scrollLeft;
});
addEventListener('pointermove', (e) => {
  if (!down) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 4) { moved = true; strip.classList.add('dragging'); }
  strip.scrollLeft = startScroll - dx;
});
addEventListener('pointerup', () => { down = false; strip.classList.remove('dragging'); });
strip.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

/* ---------- toast ---------- */
const toast = $('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---------- cart (front-end only for now; hook up checkout later) ---------- */
const cartBtn = $('.cart');
const cartCount = $('.cart-count');
let cart = [];
try { cart = JSON.parse(localStorage.getItem('yartsmin-cart')) || []; } catch { cart = []; }

function renderCart() {
  cartCount.textContent = cart.length;
  cartBtn.setAttribute('aria-label', `Cart, ${cart.length} item${cart.length === 1 ? '' : 's'}`);
}
renderCart();

$$('.add-to-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    cart.push(btn.dataset.product);
    try { localStorage.setItem('yartsmin-cart', JSON.stringify(cart)); } catch { /* storage blocked */ }
    renderCart();
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    const label = btn.textContent;
    btn.textContent = 'added ✓'; btn.classList.add('added');
    setTimeout(() => { btn.textContent = label; btn.classList.remove('added'); }, 1400);

    showToast('added to your cart');
  });
});
cartBtn.addEventListener('click', () => showToast(cart.length ? `${cart.length} item${cart.length === 1 ? '' : 's'} in your cart · checkout coming soon` : 'your cart is empty'));

/* ---------- newsletter form ---------- */
// 1. Create a free account on https://buttondown.com
// 2. Put your Buttondown username between the quotes below. That's it.
const BUTTONDOWN_USERNAME = 'yartsmin';

const form = $('#newsletter');
const email = $('#email');
const msg = $('.form-msg');
const joinBtn = $('button[type="submit"]', form);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  email.classList.remove('invalid');
  if (!email.checkValidity() || !email.value.trim()) {
    void email.offsetWidth; email.classList.add('invalid');
    msg.textContent = 'hmm, that email doesn\'t look right';
    return;
  }
  if (!BUTTONDOWN_USERNAME) {
    msg.textContent = 'the newsletter opens very soon ✿';
    console.warn('Newsletter: set BUTTONDOWN_USERNAME in js/main.js');
    return;
  }

  joinBtn.disabled = true;
  joinBtn.textContent = '...';
  msg.textContent = '';
  try {
    const data = new FormData();
    data.append('email', email.value.trim());
    data.append('tag', 'website');
    // Buttondown's embed endpoint. 'no-cors' because it's a cross-site form post:
    // the browser can't read the reply, but the subscription goes through.
    await fetch(`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`, {
      method: 'POST', body: data, mode: 'no-cors',
    });
    msg.textContent = 'almost there! check your inbox to confirm ✿';
    form.reset();
  } catch {
    msg.textContent = 'oops, something went wrong. try again in a moment?';
  } finally {
    joinBtn.disabled = false;
    joinBtn.textContent = 'join';
  }
});

/* ---------- lightbox for the gallery ---------- */
const lb = $('.lightbox');
const lbImg = $('img', lb);
const lbCap = $('figcaption', lb);
const galleryItems = $$('.piece, .snap');
let current = 0;

function openAt(i) {
  current = (i + galleryItems.length) % galleryItems.length;
  const img = $('img', galleryItems[current]);
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = img.alt;
  // restart the pop animation
  lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
}
galleryItems.forEach((fig, i) => {
  fig.tabIndex = 0;
  const open = () => { openAt(i); lb.showModal(); };
  fig.addEventListener('click', open);
  fig.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
});
$('.lb-close').addEventListener('click', () => lb.close());
$('.lb-prev').addEventListener('click', () => openAt(current - 1));
$('.lb-next').addEventListener('click', () => openAt(current + 1));
lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') openAt(current - 1);
  if (e.key === 'ArrowRight') openAt(current + 1);
});
let touchX = 0;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) openAt(current + (dx < 0 ? 1 : -1));
});

/* ---------- videos: only play while on screen (saves battery) ---------- */
const videos = $$('.loop-video');
if (reducedMotion) {
  videos.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
} else if ('IntersectionObserver' in window) {
  const vio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { threshold: 0.1 });
  videos.forEach((v) => vio.observe(v));
}
