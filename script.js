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
function apply3DEffect(el) {
  const strength = 14; // max rotation degrees

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

  const punch = () => {
    el.classList.add('clicked');
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(0.94)';
    setTimeout(() => {
      el.classList.remove('clicked');
      el.style.transform = '';
    }, 180);
  };

  el.addEventListener('click', punch);
  el.addEventListener('touchstart', punch, { passive: true });
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

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let spawnInterval, timerInterval, fallLoop;
let basketX = 200;

function moveBasket(clientX) {
  const rect = gameArea.getBoundingClientRect();
  let x = clientX - rect.left;
  x = Math.max(20, Math.min(rect.width - 20, x));
  basketX = x;
  basket.style.left = x + 'px';
}

gameArea.addEventListener('mousemove', (e) => {
  if (gameRunning) moveBasket(e.clientX);
});

gameArea.addEventListener('touchmove', (e) => {
  if (gameRunning) {
    moveBasket(e.touches[0].clientX);
    e.preventDefault();
  }
}, { passive: false });

function spawnHeart() {
  const heart = document.createElement('div');
  heart.classList.add('falling-heart');
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  const areaWidth = gameArea.clientWidth;
  const startX = Math.random() * (areaWidth - 30);
  heart.style.left = startX + 'px';
  heart.style.top = '-30px';
  heart.dataset.speed = (Math.random() * 1.5 + 1.5).toFixed(2);
  gameArea.appendChild(heart);
}

function fallStep() {
  const hearts = document.querySelectorAll('.falling-heart');
  const areaHeight = gameArea.clientHeight;
  hearts.forEach(heart => {
    const top = parseFloat(heart.style.top) + parseFloat(heart.dataset.speed);
    heart.style.top = top + 'px';

    // collision check with basket
    if (top > areaHeight - 60) {
      const heartX = parseFloat(heart.style.left) + 15;
      if (Math.abs(heartX - basketX) < 35) {
        score++;
        scoreEl.textContent = score;
        heart.remove();
        return;
      }
    }
    if (top > areaHeight) {
      heart.remove();
    }
  });
}

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  gameMessage.classList.add('hidden');
  startGameBtn.classList.add('hidden');
  document.querySelectorAll('.falling-heart').forEach(h => h.remove());
  basketX = gameArea.clientWidth / 2;
  basket.style.left = basketX + 'px';
  gameRunning = true;

  spawnInterval = setInterval(spawnHeart, 700);
  fallLoop = setInterval(fallStep, 30);
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
  document.querySelectorAll('.falling-heart').forEach(h => h.remove());

  let msg;
  if (score >= 20) {
    msg = `Wow, ${score} hati! Kamu emang juara di hati aku 🏆💕`;
  } else if (score >= 10) {
    msg = `Keren, dapet ${score} hati! Sama kerennya kayak kamu 😍`;
  } else {
    msg = `Kamu dapet ${score} hati... tapi tenang, hati aku tetep punya kamu semua kok 🥰`;
  }
  gameResultText.textContent = msg;
  gameMessage.classList.remove('hidden');
}

startGameBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
