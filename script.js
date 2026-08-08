/* ================= MOBILE VIEWPORT HEIGHT FIX ================= */
// mobile browsers (esp. Safari) resize their address bar, which makes 100vh
// unreliable — this keeps --vh accurate so the slide height never gets cut off
function setViewportHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

/* ================= FLOATING HEARTS BACKGROUND ================= */
const heartsContainer = document.getElementById('floating-hearts');
const heartSymbols = ['💗', '💖', '💕', '❤️', '💓'];

function createFloatingHeart() {
  const heart = document.createElement('div');
  heart.classList.add('floating-heart');
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (Math.random() * 18 + 14) + 'px';
  const duration = Math.random() * 6 + 6;
  heart.style.animationDuration = duration + 's';
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}
setInterval(createFloatingHeart, 500);

/* ================= SLIDE NAVIGATION ================= */
const slides = Array.from(document.querySelectorAll('.slide'));
const dotsContainer = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);

function goToSlide(index) {
  if (index < 0 || index >= slides.length) return;
  slides[currentSlide].classList.remove('active');
  if (index > currentSlide) {
    slides[currentSlide].classList.add('prev-out');
  }
  currentSlide = index;
  slides.forEach(s => s.classList.remove('prev-out'));
  slides[currentSlide].classList.add('active');

  dots.forEach(d => d.classList.remove('active'));
  dots[currentSlide].classList.add('active');

  prevBtn.disabled = currentSlide === 0;
  nextBtn.textContent = currentSlide === slides.length - 1 ? 'Ulangi ↺' : 'Next ▶';
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => {
  if (currentSlide === slides.length - 1) {
    goToSlide(0);
  } else {
    goToSlide(currentSlide + 1);
  }
});

document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goToSlide(currentSlide + 1));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
});

prevBtn.disabled = true;

/* ================= UNIVERSAL 3D TILT + CLICK EFFECT ================= */
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function apply3DEffect(el) {
  const strength = 14; // max rotation degrees

  // tilt-while-hovering only makes sense with a mouse/trackpad
  if (!isTouchDevice) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * strength;
      const rotateX = -((y - centerY) / centerY) * strength;
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }

  let lastTouch = 0;
  const punch = () => {
    el.classList.add('clicked');
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(0.94)';
    setTimeout(() => {
      el.classList.remove('clicked');
      el.style.transform = ''; // always reset so it never stays tilted
    }, 180);
  };

  el.addEventListener('touchstart', () => {
    lastTouch = Date.now();
    punch();
  }, { passive: true });

  el.addEventListener('click', () => {
    // skip the synthetic click that follows a touchstart to avoid double-firing
    if (Date.now() - lastTouch < 500) return;
    punch();
  });
}

document.querySelectorAll('.tilt3d').forEach(apply3DEffect);

/* ================= FLIP CARDS (MEMORIES) ================= */
document.querySelectorAll('[data-flip]').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

/* ================= LOVE LETTER TYPEWRITER ================= */
const letterMessage = `Sayangku...

Aku cuma mau bilang, terima kasih sudah selalu ada di setiap hariku.
Bersamamu, hal-hal kecil jadi terasa istimewa.

Semoga kamu selalu bahagia, sehat, dan tersenyum ya.
Aku sayang kamu, sekarang dan selamanya. 💕`;

const typewriterEl = document.getElementById('typewriter-text');
const revealBtn = document.getElementById('revealBtn');
let typing = false;

revealBtn.addEventListener('click', () => {
  if (typing) return;
  typing = true;
  typewriterEl.textContent = '';
  revealBtn.textContent = 'Membaca...';
  let i = 0;
  const interval = setInterval(() => {
    typewriterEl.textContent += letterMessage[i];
    i++;
    if (i >= letterMessage.length) {
      clearInterval(interval);
      revealBtn.textContent = 'Baca Lagi';
      typing = false;
    }
  }, 35);
});

/* ================= GAME: TANGKAP HATI ================= */
const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startGameBtn = document.getElementById('startGameBtn');
const restartBtn = document.getElementById('restartBtn');
const gameMessage = document.getElementById('game-message');
const gameResultText = document.getElementById('game-result-text');
const comboDisplay = document.getElementById('combo-display');
const ratingHeartsEl = document.getElementById('rating-hearts');

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let spawnInterval, timerInterval, fallLoop;
let basketX = 200;      // actual rendered position (eased)
let targetX = 200;      // pointer/target position
let combo = 0;
let elapsedGameTime = 0;

function setTargetX(clientX) {
  const rect = gameArea.getBoundingClientRect();
  let x = clientX - rect.left;
  x = Math.max(23, Math.min(rect.width - 23, x));
  targetX = x;
}

gameArea.addEventListener('mousemove', (e) => {
  if (gameRunning) setTargetX(e.clientX);
});

gameArea.addEventListener('touchmove', (e) => {
  if (gameRunning) {
    setTargetX(e.touches[0].clientX);
    e.preventDefault();
  }
}, { passive: false });

// smoothly ease the basket toward the target position for a nicer feel
function easeBasket() {
  basketX += (targetX - basketX) * 0.18;
  basket.style.left = basketX + 'px';
}

function spawnHeart() {
  const heart = document.createElement('div');
  const isGolden = Math.random() < 0.12; // rare bonus heart
  heart.classList.add('falling-heart');
  if (isGolden) heart.classList.add('golden');
  heart.textContent = isGolden ? '💛' : heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.dataset.golden = isGolden ? '1' : '0';

  const areaWidth = gameArea.clientWidth;
  const startX = Math.random() * (areaWidth - 30) + 15;
  heart.style.left = startX + 'px';
  heart.style.top = '-30px';

  // difficulty ramps up gently as the round progresses
  const speedBoost = Math.min(elapsedGameTime / 30, 1) * 1.2;
  heart.dataset.speed = (Math.random() * 1.3 + 1.4 + speedBoost).toFixed(2);
  heart.dataset.sway = (Math.random() * 1.4 - 0.7).toFixed(2);
  heart.dataset.age = '0';
  gameArea.appendChild(heart);
}

function spawnSpark(x, y) {
  for (let i = 0; i < 5; i++) {
    const spark = document.createElement('div');
    spark.classList.add('catch-spark');
    const size = Math.random() * 8 + 6;
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.left = (x + (Math.random() * 30 - 15)) + 'px';
    spark.style.top = (y + (Math.random() * 10 - 5)) + 'px';
    gameArea.appendChild(spark);
    setTimeout(() => spark.remove(), 500);
  }
}

function showCombo(text) {
  comboDisplay.textContent = text;
  comboDisplay.classList.remove('hidden');
  comboDisplay.style.animation = 'none';
  void comboDisplay.offsetWidth; // restart animation
  comboDisplay.style.animation = 'comboPop 0.5s ease';
  clearTimeout(showCombo._t);
  showCombo._t = setTimeout(() => comboDisplay.classList.add('hidden'), 600);
}

function fallStep() {
  const hearts = document.querySelectorAll('.falling-heart');
  const areaHeight = gameArea.clientHeight;
  const areaWidth = gameArea.clientWidth;

  hearts.forEach(heart => {
    const age = parseFloat(heart.dataset.age) + 1;
    heart.dataset.age = age;
    const top = parseFloat(heart.style.top) + parseFloat(heart.dataset.speed);
    let left = parseFloat(heart.style.left) + parseFloat(heart.dataset.sway) * Math.sin(age / 15);
    left = Math.max(0, Math.min(areaWidth - 20, left));
    heart.style.top = top + 'px';
    heart.style.left = left + 'px';

    // collision check with basket
    if (top > areaHeight - 55) {
      const heartX = left + 12;
      if (Math.abs(heartX - basketX) < 32) {
        const isGolden = heart.dataset.golden === '1';
        combo++;
        score += isGolden ? 3 : 1;
        scoreEl.textContent = score;

        spawnSpark(heartX, areaHeight - 55);
        basket.classList.add('catching');
        setTimeout(() => basket.classList.remove('catching'), 180);

        if (isGolden) {
          showCombo('+3 Hati Emas! 💛');
        } else if (combo >= 5 && combo % 5 === 0) {
          showCombo(`Combo x${combo}! ✨`);
        }

        heart.remove();
        return;
      }
    }
    if (top > areaHeight) {
      combo = 0; // missed — combo resets
      heart.remove();
    }
  });
}

function startGame() {
  score = 0;
  timeLeft = 30;
  combo = 0;
  elapsedGameTime = 0;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  gameMessage.classList.add('hidden');
  comboDisplay.classList.add('hidden');
  startGameBtn.classList.add('hidden');
  document.querySelectorAll('.falling-heart, .catch-spark').forEach(h => h.remove());
  basketX = gameArea.clientWidth / 2;
  targetX = basketX;
  basket.style.left = basketX + 'px';
  gameRunning = true;

  let spawnRate = 800;
  spawnInterval = setInterval(() => {
    spawnHeart();
    elapsedGameTime += spawnRate / 1000;
  }, spawnRate);

  fallLoop = setInterval(() => {
    easeBasket();
    fallStep();
  }, 30);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(fallLoop);
  clearInterval(timerInterval);
  document.querySelectorAll('.falling-heart, .catch-spark').forEach(h => h.remove());

  let msg, stars;
  if (score >= 25) {
    stars = 3;
    msg = `Wow, ${score} hati! Kamu emang juara di hati aku 🏆`;
  } else if (score >= 12) {
    stars = 2;
    msg = `Keren, dapet ${score} hati! Sama manisnya kayak kamu 😍`;
  } else {
    stars = 1;
    msg = `Kamu dapet ${score} hati... tapi tenang, hati aku tetep punya kamu semua kok 🥰`;
  }
  ratingHeartsEl.textContent = '💖'.repeat(stars) + '🤍'.repeat(3 - stars);
  gameResultText.textContent = msg;
  gameMessage.classList.remove('hidden');
}

startGameBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
