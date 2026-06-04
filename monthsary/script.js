/* =============================================
   MONTHSARY WEBSITE — FULL INTERACTIVE JS
   ============================================= */

/* ---------- PAGE NAVIGATION ---------- */
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId)) {
      btn.classList.add('active');
    }
  });

  // Trigger page-specific inits
  if (pageId === 'page-home') initCounters();
  if (pageId === 'page-reasons') renderReasons();
  if (pageId === 'page-timeline') initTimeline();
  if (pageId === 'page-gallery') initGalleryAnims();
}

function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}

/* ---------- PETAL CANVAS ---------- */
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
let petals = [];
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

const PETAL_COLORS = ['#f7c5d0', '#f48fb1', '#fce4ec', '#ffcdd2', '#f8bbd0', '#f5c6d5', '#fdd9e0'];

class Petal {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : -20;
    this.size = 6 + Math.random() * 10;
    this.speedY = 0.4 + Math.random() * 0.8;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.04;
    this.opacity = 0.4 + Math.random() * 0.5;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.swing = Math.random() * Math.PI * 2;
    this.swingSpeed = 0.01 + Math.random() * 0.02;
  }
  update() {
    this.swing += this.swingSpeed;
    this.x += this.speedX + Math.sin(this.swing) * 0.5;
    this.y += this.speedY;
    this.rot += this.rotSpeed;
    if (this.y > H + 30) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function initPetals() {
  resizeCanvas();
  petals = Array.from({ length: 38 }, () => new Petal());
  animatePetals();
}

function animatePetals() {
  ctx.clearRect(0, 0, W, H);
  petals.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animatePetals);
}

window.addEventListener('resize', resizeCanvas);

/* ---------- FLOATING HEARTS (home) ---------- */
function initFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  const HEARTS = ['♡', '♥', '❤', '💕', '💗', '💖', '💓'];
  setInterval(() => {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    h.style.left = Math.random() * 100 + '%';
    h.style.bottom = '-30px';
    h.style.fontSize = (0.8 + Math.random() * 1.4) + 'rem';
    h.style.animationDuration = (4 + Math.random() * 5) + 's';
    h.style.animationDelay = '0s';
    h.style.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    container.appendChild(h);
    setTimeout(() => h.remove(), 10000);
  }, 700);
}

/* ---------- STRING PULL ---------- */
let stringPulled = false;
let isDragging = false;
let dragStart = null;

const bob = document.getElementById('stringBob');
const stringPath = document.getElementById('stringPath');

function getEventY(e) {
  return (e.touches ? e.touches[0].clientY : e.clientY);
}

function initString() {
  if (!bob) return;

  bob.addEventListener('mousedown', startDrag);
  bob.addEventListener('touchstart', startDrag, { passive: true });

  window.addEventListener('mousemove', doDrag);
  window.addEventListener('touchmove', doDrag, { passive: false });

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  isDragging = true;
  dragStart = getEventY(e);
}

function doDrag(e) {
  if (!isDragging || stringPulled) return;
  if (e.cancelable) e.preventDefault();

  const currentY = getEventY(e);
  const delta = Math.max(0, Math.min(120, currentY - dragStart));
  const pull = delta;

  // Deform the string path to look pulled
  const cy = 150 + pull;
  stringPath.setAttribute('d', `M30,0 Q30,${cy} 30,${280 + pull}`);
  bob.setAttribute('cy', 280 + pull);
  document.querySelector('#stringSvg text').setAttribute('y', 284 + pull);

  if (delta > 90 && !stringPulled) {
    triggerStringPull();
  }
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;

  if (!stringPulled) {
    // Snap back with spring animation
    animateStringBack();
  }
}

function animateStringBack() {
  let t = 0;
  function step() {
    t += 0.08;
    const bounce = Math.exp(-t * 3) * Math.cos(t * 10) * 40;
    const cy = 150 + bounce;
    const bobY = 280 + bounce;
    stringPath.setAttribute('d', `M30,0 Q30,${cy} 30,${bobY}`);
    bob.setAttribute('cy', bobY);
    document.querySelector('#stringSvg text').setAttribute('y', bobY + 4);
    if (t < 1.5) requestAnimationFrame(step);
    else {
      stringPath.setAttribute('d', 'M30,0 Q30,150 30,280');
      bob.setAttribute('cy', 280);
      document.querySelector('#stringSvg text').setAttribute('y', 284);
    }
  }
  requestAnimationFrame(step);
}

function triggerStringPull() {
  stringPulled = true;
  isDragging = false;

  // Animate bob flying up
  bob.style.transition = 'cy 0.4s ease';

  // Show note
  const note = document.getElementById('surpriseNote');
  note.style.display = 'block';
  setTimeout(() => note.classList.add('show'), 10);

  // Shoot hearts
  burstHeartsAt(window.innerWidth / 2, window.innerHeight / 2);
}

function closeNote() {
  const note = document.getElementById('surpriseNote');
  note.classList.remove('show');
  setTimeout(() => { note.style.display = 'none'; stringPulled = false; }, 400);
  animateStringBack();
}

/* ---------- COUNTERS ---------- */
function initCounters() {
  const nums = document.querySelectorAll('.counter-num:not([data-special])');
  nums.forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(interval);
    }, 28);
  });
}

/* ---------- ENVELOPE / LETTER ---------- */
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const flap = document.getElementById('envFlap');
  const seal = document.querySelector('.env-seal');
  const hint = document.querySelector('.env-hint');
  const paper = document.getElementById('letterPaper');

  flap.classList.add('open');
  seal.style.opacity = '0';
  hint.style.opacity = '0';

  setTimeout(() => {
    paper.classList.add('show');
    paper.style.display = 'block';
    setTimeout(() => { paper.style.opacity = '1'; paper.style.transform = 'translateY(0)'; }, 20);
  }, 700);

  burstHeartsAt(
    document.getElementById('envelope').getBoundingClientRect().left + 140,
    document.getElementById('envelope').getBoundingClientRect().top + 90
  );
}

/* ---------- GALLERY LIGHTBOX ---------- */
const galleryImages = [
  'images/6230ba54-74d6-415d-bc99-debefbf17684.jpg',
  'images/cd606e18-ded2-4209-8a11-d8df7df5efca.jpg',
  'images/9a57febe-5184-49de-907b-f741c54343ae.jpg',
  'images/33f03a8a-3f04-4b03-b4da-e8dcac86ca1f.jpg',
  'images/4fbc271e-a456-4322-b1f0-cb334ad58f15.jpg',
  'images/abc48d6c-f844-4889-b6bd-afc1d954d758.jpg',
  'images/326d65ca-1351-40d9-81e8-362c7a8e8ba5.jpg',
  'images/71847c02-40c6-42f7-9b10-eda4324719cb.jpg',
  'images/bbfae9ac-3a20-4deb-a551-808a0c2049ae.jpg',
  'images/bdaf2a4c-ccc2-499a-b8c0-99989dfd75b1.jpg',
  'images/3c99cd17-3676-4960-8dfb-7aa22129946d.jpg',
  'images/5d93db64-4dc3-4927-9184-ebc4650b81e5.jpg',
  'images/071cd036-6f0a-43b5-8ad9-b1a1e2baae7e.jpg',
  '1st.jpg',
  '3rd.jpg',
];

let currentLbIdx = 0;

function openLightbox(idx) {
  currentLbIdx = idx;
  const lb = document.getElementById('lightbox');
  document.getElementById('lbImg').src = galleryImages[idx];
  lb.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && (e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON' && e.target.className.includes('lb-prev lb-next'))) return;
  if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
  document.getElementById('lightbox').classList.remove('show');
  document.body.style.overflow = '';
}

function lbNav(dir, e) {
  if (e) e.stopPropagation();
  currentLbIdx = (currentLbIdx + dir + galleryImages.length) % galleryImages.length;
  const img = document.getElementById('lbImg');
  img.style.opacity = '0';
  img.style.transform = 'scale(0.92)';
  setTimeout(() => {
    img.src = galleryImages[currentLbIdx];
    img.style.transition = 'opacity 0.25s, transform 0.25s';
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  }, 150);
}

// Keyboard nav for lightbox
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('show')) return;
  if (e.key === 'ArrowRight') lbNav(1, null);
  if (e.key === 'ArrowLeft') lbNav(-1, null);
  if (e.key === 'Escape') { lb.classList.remove('show'); document.body.style.overflow = ''; }
});

// Gallery stagger animation
function initGalleryAnims() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.85) translateY(20px)';
    item.style.transition = `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`;
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'scale(1) translateY(0)';
    }, 80 + i * 60);
  });
}

/* ---------- REASONS / FLIP CARDS ---------- */
const REASONS = [
  { icon: '😂', text: 'The way you make me laugh until my stomach hurts' },
  { icon: '🤗', text: 'How safe and warm I feel when I\'m with you' },
  { icon: '✨', text: 'Your eyes and how they light up when you smile' },
  { icon: '💬', text: 'The late night conversations that never run dry' },
  { icon: '🌙', text: 'How you check on me even on your busiest days' },
  { icon: '🍜', text: 'The simple moments that feel magical with you' },
  { icon: '💪', text: 'Your strength and how you carry yourself with grace' },
  { icon: '🎵', text: 'How you make ordinary days feel like a love song' },
  { icon: '🌸', text: 'The little things you do that remind me I\'m loved' },
  { icon: '🧸', text: 'Your honesty and the way you\'re real with me' },
  { icon: '🌟', text: 'How you push me to be a better version of myself' },
  { icon: '💞', text: 'Simply because you are you — and that\'s everything' },
];

function renderReasons() {
  const grid = document.getElementById('reasonsGrid');
  if (grid.dataset.rendered) return;
  grid.dataset.rendered = 'true';

  REASONS.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'reason-card';
    card.innerHTML = `
      <div class="reason-inner">
        <div class="reason-front">
          <span class="reason-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="reason-icon">${r.icon}</span>
        </div>
        <div class="reason-back">
          <p>${r.text}</p>
        </div>
      </div>`;
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      if (card.classList.contains('flipped')) burstHeartsAt(card.getBoundingClientRect().left + card.offsetWidth / 2, card.getBoundingClientRect().top + card.offsetHeight / 2);
    });

    // Stagger in
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    card.style.transition = `opacity 0.4s ${i * 0.07}s, transform 0.4s ${i * 0.07}s`;
    grid.appendChild(card);
    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50 + i * 70);
  });
}

function shuffleReasons() {
  const grid = document.getElementById('reasonsGrid');
  // Flip all back first
  grid.querySelectorAll('.reason-card').forEach(c => c.classList.remove('flipped'));

  // Shuffle array
  const cards = [...grid.children];
  cards.sort(() => Math.random() - 0.5);
  cards.forEach((c, i) => {
    c.style.transition = `opacity 0.3s ${i * 0.04}s, transform 0.3s ${i * 0.04}s`;
    c.style.opacity = '0';
    c.style.transform = 'scale(0.7) rotate(5deg)';
  });

  setTimeout(() => {
    cards.forEach(c => grid.appendChild(c));
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.style.opacity = '1';
        c.style.transform = 'scale(1) rotate(0)';
      }, i * 60);
    });
  }, 400);
}

/* ---------- TIMELINE SCROLL REVEAL ---------- */
function initTimeline() {
  const cards = document.querySelectorAll('.tl-card');
  cards.forEach(card => card.classList.remove('visible'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.3 });

  cards.forEach(c => observer.observe(c));
}

/* ---------- HEART BURST ---------- */
function burstHeart() {
  const h = document.getElementById('finalHeart');
  h.classList.remove('burst');
  void h.offsetWidth; // reflow
  h.classList.add('burst');

  const rect = h.getBoundingClientRect();
  burstHeartsAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

  setTimeout(() => h.classList.remove('burst'), 600);

  // Change text
  const texts = [
    'I love you so much ♡',
    'You are my everything ✨',
    'Forever & always 🌸',
    'My favorite person 💕',
    'Happy 3rd monthsary 🎉',
  ];
  document.querySelector('.final-text').textContent = texts[Math.floor(Math.random() * texts.length)];
}

function burstHeartsAt(x, y, count = 12) {
  const HEARTS = ['♥', '♡', '💕', '💖', '✨', '🌸'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const dist = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 40;
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: ${0.9 + Math.random()}rem;
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transform: translate(-50%, -50%);
      animation: burstFly 0.9s ease forwards;
      --tx: ${tx}px;
      --ty: ${ty}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // Inject keyframe once
  if (!document.getElementById('burstStyle')) {
    const s = document.createElement('style');
    s.id = 'burstStyle';
    s.textContent = `@keyframes burstFly {
      0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
      80%  { opacity: 0.8; }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.3); opacity: 0; }
    }`;
    document.head.appendChild(s);
  }
}

/* ---------- SCROLL REVEAL (generic) ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.counter-section, .string-section');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('fade-in-up');
        if (e.target.classList.contains('counter-section')) initCounters();
      }
    });
  }, { threshold: 0.2 });
  els.forEach(el => obs.observe(el));
}

/* ---------- CURSOR TRAIL ---------- */
function initCursorTrail() {
  const TRAIL_EMOJIS = ['♡', '✦', '·', '˚', '⋆'];
  let lastTime = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastTime < 80) return;
    lastTime = now;

    const el = document.createElement('div');
    el.textContent = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
    el.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      font-size: ${0.6 + Math.random() * 0.8}rem;
      color: #f48fb1;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.9;
      transform: translate(-50%, -50%);
      animation: trailFade 0.8s ease forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  });

  if (!document.getElementById('trailStyle')) {
    const s = document.createElement('style');
    s.id = 'trailStyle';
    s.textContent = `@keyframes trailFade {
      0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(1); }
      100% { opacity: 0;   transform: translate(-50%,-100%) scale(0.4); }
    }`;
    document.head.appendChild(s);
  }
}

/* ---------- SWIPE NAV (mobile) ---------- */
function initSwipeNav() {
  const pages = ['page-home', 'page-letter', 'page-gallery', 'page-reasons', 'page-timeline'];
  let touchStartX = 0;

  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 60) return;
    const current = pages.findIndex(p => document.getElementById(p).classList.contains('active'));
    if (dx < 0 && current < pages.length - 1) goTo(pages[current + 1]);
    if (dx > 0 && current > 0) goTo(pages[current - 1]);
  }, { passive: true });
}

/* ---------- MUSIC TOGGLE (ambient) ---------- */
function initMusicNote() {
  const btn = document.createElement('button');
  btn.id = 'musicBtn';
  btn.innerHTML = '🎵';
  btn.title = 'Toggle ambient music';
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid rgba(242,184,198,0.7);
    background: rgba(255,248,244,0.9);
    font-size: 1.3rem;
    cursor: pointer;
    z-index: 500;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 16px rgba(155,58,90,0.2);
    transition: transform 0.2s;
  `;
  btn.onmouseover = () => btn.style.transform = 'scale(1.1) rotate(10deg)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  document.body.appendChild(btn);

  // Use Web Audio API for a simple ambient tone
  let audioCtx = null;
  let playing = false;
  let nodes = [];

  btn.addEventListener('click', () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    if (playing) {
      nodes.forEach(n => { try { n.stop(); } catch (e) { } });
      nodes = [];
      playing = false;
      btn.innerHTML = '🎵';
    } else {
      playAmbient(audioCtx, nodes);
      playing = true;
      btn.innerHTML = '🔇';
    }
  });
}

function playAmbient(ctx, nodes) {
  // Soft dreamy chord: C major pentatonic notes
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    pan.pan.value = (i / notes.length) * 1.2 - 0.6;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(pan);
    pan.connect(ctx.destination);
    osc.start();
    nodes.push(osc);
  });
}

/* ---------- PAGE ENTRANCE SPARKLES ---------- */
function spawnSparkle(page) {
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.textContent = ['✦', '✧', '·', '⭐', '🌸'][Math.floor(Math.random() * 5)];
    el.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: ${Math.random() * 100}vh;
      font-size: ${0.7 + Math.random()}rem;
      color: #f48fb1;
      pointer-events: none;
      z-index: 9997;
      opacity: 0;
      animation: sparklePop ${0.6 + Math.random() * 0.6}s ease ${i * 0.08}s forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

if (!document.getElementById('sparkleStyle')) {
  const s = document.createElement('style');
  s.id = 'sparkleStyle';
  s.textContent = `@keyframes sparklePop {
    0%   { opacity: 0; transform: scale(0) rotate(0deg); }
    50%  { opacity: 1; transform: scale(1.3) rotate(180deg); }
    100% { opacity: 0; transform: scale(0.5) rotate(360deg) translateY(-40px); }
  }`;
  document.head.appendChild(s);
}

/* ---------- PHOTO POLAROID TILT on hover (gallery alt effect) ---------- */
function initTiltEffect() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      item.style.transform = `scale(1.04) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

/* ---------- INIT ALL ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initPetals();
  initFloatingHearts();
  initString();
  initCounters();
  initScrollReveal();
  initCursorTrail();
  initSwipeNav();
  initMusicNote();

  // Show home sparkles on load
  setTimeout(() => spawnSparkle('page-home'), 300);
});

/* ---------- PAGE INDICATOR DOTS ---------- */
function initPageDots() {
  const pages = ['page-home', 'page-letter', 'page-gallery', 'page-reasons', 'page-timeline'];
  const labels = ['Home', 'Letter', 'Gallery', 'Love', 'Story'];

  const wrap = document.createElement('div');
  wrap.className = 'page-dots';
  pages.forEach((pid, i) => {
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 0 ? ' active' : '');
    dot.title = labels[i];
    dot.addEventListener('click', () => {
      goTo(pid);
      updateDots(i);
    });
    wrap.appendChild(dot);
  });
  document.body.appendChild(wrap);

  // Patch goTo to update dots
  const _goTo = window.goTo;
  window.goTo = function (pageId) {
    _goTo(pageId);
    const idx = pages.indexOf(pageId);
    if (idx !== -1) updateDots(idx);
    spawnSparkle(pageId);
  };

  function updateDots(activeIdx) {
    wrap.querySelectorAll('.page-dot').forEach((d, i) => {
      d.classList.toggle('active', i === activeIdx);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initPageDots();
});
