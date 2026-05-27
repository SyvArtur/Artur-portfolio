
let score = 0;
const scoreEl = document.getElementById("score");


const cards = document.querySelectorAll('.card');
const isMobile = window.matchMedia("(hover: none)").matches;

/* появление */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
});
cards.forEach(card => observer.observe(card));

/* эффекты */
if (!isMobile) {

  cards.forEach((card, index) => {
    const glare = card.querySelector('.glare');
    let raf = null;

    /* mouse tilt */
    card.addEventListener('mousemove', (e) => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -(y - centerY) / 5;
        const rotateY = (x - centerX) / 5;

        card.style.transform = `
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.07)
        `;

        glare.style.opacity = 1;
        glare.style.background = `
          radial-gradient(circle at ${x}px ${y}px,
          rgba(255,255,255,0.4), transparent 60%)
        `;

        /* частицы */
        if (Math.random() > 0.92 && card.querySelectorAll('.spark').length < 15) {
          const spark = document.createElement('div');
          spark.className = 'spark';

          spark.style.left = x + 'px';
          spark.style.top = y + 'px';

          spark.style.setProperty('--x', (Math.random() - 0.5) * 80 + 'px');
          spark.style.setProperty('--y', (Math.random() - 0.5) * 80 + 'px');

          card.appendChild(spark);
          setTimeout(() => spark.remove(), 800);
        }

        raf = null;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      glare.style.opacity = 0;
    });

    /* синусоидальное движение */
    const amplitude = 4; // высота
    const speed = 0.002; // скорость
    const phase = index * 1.2; // сдвиг волны

    function wave(time) {
      if (!card.matches(':hover')) {
        const y = Math.sin(time * speed + phase) * amplitude;
        card.parentElement.style.transform = `translateY(${y}px)`;
      }
      requestAnimationFrame(wave);
    }

    requestAnimationFrame(wave);
  });

}


const container = document.querySelector(".leaf-layer");
const BASE = window.IMAGE_BASE;

const files = [
  "10_bubna.webp","10_chervi.webp","10_kresti.webp","10_pika.webp",
  "2_bubna.webp","2_chervi.webp","2_kresti.webp","2_pika.webp",
  "3_bubna.webp","3_chervi.webp","3_kresti.webp","3_pika.webp",
  "4_bubna.webp","4_chervi.webp","4_kresti.webp","4_pika.webp",
  "5_bubna.webp","5_chervi.webp","5_kresti.webp","5_pika.webp",
  "6_bubna.webp","6_chervi.webp","6_kresti.webp","6_pika.webp",
  "7_bubna.webp","7_chervi.webp","7_kresti.webp","7_pika.webp",
  "8_bubna.webp","8_chervi.webp","8_kresti.webp","8_pika.webp",
  "9_bubna.webp","9_chervi.webp","9_kresti.webp","9_pika.webp",
  "BlackJoker.webp","D_bubna.webp","D_chervi.webp","D_kresti.webp","D_pika.webp",
  "iznanka.webp","Joker_card.webp",
  "K_bubna.webp","K_chervi.webp","K_kresti.webp","K_pika.webp",
  "T_bubna.webp","T_chervi.webp","T_kresti.webp","T_pika.webp",
  "V_bubna.webp","V_chervi.webp","V_kresti.webp","V_pika.webp"
];

const images = files.map(f => BASE + f);
let active = 0;
const max = 8;
function createLeaf() {

   // if (active >= max) return;

    const leaf = document.createElement("div");
    leaf.className = "fall-item";

    // случайная картинка
    const img = images[Math.floor(Math.random() * images.length)];
    leaf.style.backgroundImage = `url('${img}')`;

    // глубина (0 = далеко, 1 = близко)
	const depth = Math.random();
	// ближние / дальние слои относительно Joker
	const z = depth < 0.7 ? 1 : 3;
	leaf.style.zIndex = z;

    // позиция внутри контейнера
    const rect = container.getBoundingClientRect();
    leaf.style.left = Math.random() * rect.width + "px";

    // размер (ближние больше)
    const size = 40 + depth * 80;
    leaf.style.width = size + "px";
    leaf.style.height = size + "px";

    // скорость (дальние медленнее)
    const duration = Math.max(0.3,(14 - depth * 6 - score * 0.1));

    leaf.style.animation = `
        fall ${duration}s linear forwards,
        sway ${3 + Math.random() * 3}s ease-in-out infinite
    `;

    // размытые дальние
    leaf.style.filter = `blur(${(1 - depth) * 1.5}px)`;
    leaf.style.opacity = 1;
	
	// чем дальше — тем меньше дистанция
const fallDistance = 500 + depth * 400; 
// дальние ~300px, ближние ~700px

leaf.style.setProperty('--fall-distance', fallDistance + 'px');

    // добавляем в сцену
    container.appendChild(leaf);
    active++;

    setTimeout(() => {
        leaf.remove();
        active--;
    }, duration * 1000);
	
	leaf.addEventListener("click", () => {
    leaf.remove();
    active--;
	    // начисление очков
    score += 1;
	scoreEl.textContent = scoreEl.dataset.label + ": " + score;
	});
}

function spawnLoop() {
    if (active < max) {
        createLeaf();
    }

    const delay = Math.max(300, 1200 - score * 20);

    setTimeout(spawnLoop, delay);
}

spawnLoop();


const hero = document.querySelector(".hero");
const fly = document.querySelector(".fly-layer");

let x = hero.offsetWidth; // старт справа hero
let direction = -1;
const speed = 0.1;

const flyWidth = 120;

function animate() {
    const heroWidth = hero.offsetWidth;

    x += direction * speed * 16;

    // зацикливание внутри hero
    if (direction === -1 && x < -flyWidth) {
        x = heroWidth;
    }

    if (direction === 1 && x > heroWidth) {
        x = -flyWidth;
    }

    fly.style.transform = `
        translateX(${x}px)
        scaleX(${direction === -1 ? 1 : -1})
    `;

    requestAnimationFrame(animate);
}

animate();

fly.addEventListener("click", () => {
    direction *= -1;
});



const eyes = document.querySelectorAll(".eye");

document.addEventListener("mousemove", (e) => {
    eyes.forEach(eye => {
        const iris = eye.querySelector(".iris");
        const rect = eye.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        const maxMove = 10; // ограничение

        const angle = Math.atan2(dy, dx);

        const x = Math.cos(angle) * maxMove;
        const y = Math.sin(angle) * maxMove;

        iris.style.transform = `
            translate(-50%, -50%)
            translate(${x}px, ${y}px)
        `;
    });
});



document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.gallery-wrapper');
  const track = document.querySelector('.gallery-track');
  const images = document.querySelectorAll('.gallery-track img');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  let index = 0;
  let isDown = false;
  let startX = 0;
  let moved = 0;

  function getVisible() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 3;
    return 5;
  }

  function maxIndex() {
    return Math.max(0, images.length - getVisible());
  }

  function update(animate = true) {
    const visible = getVisible();

    track.style.transition = animate ? "transform 0.4s ease" : "none";

    const offset = (100 / visible) * index;
    track.style.transform = `translateX(-${offset}%)`;

    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex();
  }

  // ======================
  // КНОПКИ
  // ======================
  nextBtn.addEventListener('click', () => {
    if (index < maxIndex()) {
      index++;
      update();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) {
      index--;
      update();
    }
  });

  // ======================
  // DRAG (ВАЖНО: НА WRAPPER!)
  // ======================
  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX;
    moved = 0;

    track.style.transition = "none";
    wrapper.style.cursor = "grabbing";
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    moved = e.clientX - startX;

    const visible = getVisible();
    const baseOffset = (100 / visible) * index;
    const dragOffset = (moved / window.innerWidth) * 100;

    track.style.transform = `translateX(-${baseOffset - dragOffset}%)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;

    wrapper.style.cursor = "grab";
    track.style.transition = "transform 0.4s ease";

    if (moved < -80 && index < maxIndex()) index++;
    if (moved > 80 && index > 0) index--;

    moved = 0;
    update();
  });

  // TOUCH (mobile)
  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    moved = 0;
  });

  wrapper.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    moved = currentX - startX;

    track.style.transition = "none";

    const visible = getVisible();
    const baseOffset = (100 / visible) * index;
    const dragOffset = (moved / window.innerWidth) * 100;

    track.style.transform = `translateX(-${baseOffset - dragOffset}%)`;
  });

  wrapper.addEventListener('touchend', () => {
    track.style.transition = "transform 0.4s ease";

    if (moved < -80 && index < maxIndex()) index++;
    if (moved > 80 && index > 0) index--;

    moved = 0;
    update();
  });

  // RESIZE
  window.addEventListener('resize', () => {
    if (index > maxIndex()) index = maxIndex();
    update(false);
  });

  // init
  wrapper.style.cursor = "grab";
  update(false);
});
