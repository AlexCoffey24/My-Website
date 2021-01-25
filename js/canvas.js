const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

function assignToDiv() {
  dataUrl = canvas.toDataURL();
  document.getElementById("intro-background").style.background =
    "url(" + dataUrl + ")";
}

// Event Listeners
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Objects
class Star {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: randomIntFromRange(-4, 4),
      y: 1,
    };
    this.cor = 0.75;
    this.gravity = canvas.height / 7500;
  }

  draw() {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.shadowColor = "#E3EAEF";
    c.shadowBlur = 10;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();

    //When Star hits the ground
    if (
      this.y + this.radius + this.velocity.y >
      canvas.height - groundHeight + 25
    ) {
      this.velocity.y = -this.velocity.y * this.cor;
      this.shatter();
    } else {
      this.velocity.y += this.gravity;
    }

    //When Star hits wall
    if (
      this.x + this.radius + this.velocity.x > canvas.width ||
      this.x - this.radius <= 0
    ) {
      this.velocity.x = -this.velocity.x * this.cor;
      this.shatter();
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  shatter() {
    this.radius -= 3;
    for (let i = 0; i < 8; i++) {
      miniStars.push(new MiniStar(this.x, this.y, 2));
    }
  }
}

class MiniStar {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = {
      x: randomIntFromRange(-2, 2),
      y: randomIntFromRange(-7, 7),
    };
    this.cor = 0.8;
    this.gravity = canvas.height / 5000;
    this.ttl = 200;
    this.opacity = 1;
  }

  draw() {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = `rgba(227, 234, 239, ${this.opacity})`;
    c.shadowColor = "#E3EAEF";
    c.shadowBlur = 10;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();

    //When Star hits the ground
    if (
      this.y + this.radius + this.velocity.y >
      canvas.height - groundHeight + 25
    ) {
      this.velocity.y = -this.velocity.y * this.cor;
    } else {
      this.velocity.y += this.gravity;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.ttl -= 1;
    this.opacity -= 1 / this.ttl;
  }
}

function createMoutainRange(amount, height, color) {
  for (let i = 0; i < amount; i++) {
    let mountain = new Path2D();
    const mountainWidth = canvas.width / amount;
    mountain.beginPath;
    mountain.moveTo(i * mountainWidth, canvas.height);
    mountain.moveTo(i * mountainWidth + mountainWidth + 325, canvas.height);
    mountain.lineTo(
      i * mountainWidth + mountainWidth / 2,
      canvas.height - height
    );
    mountain.lineTo(i * mountainWidth - 325, canvas.height);
    mountain.closePath();
    c.fillStyle = color;
    c.fill(mountain);
  }
}

// Implementation
const backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height);
backgroundGradient.addColorStop(0, "#483475");
backgroundGradient.addColorStop(1, "#070926");
let stars;
let miniStars;
let backgroundStars;
let ticker = 0;
let randomSpawnRate = 500;
const groundHeight = 100;

function init() {
  stars = [];
  miniStars = [];
  backgroundStars = [];
  canvas.width = innerWidth;
  canvas.height = document.getElementById("intro-background").offsetHeight;

  for (let i = 0; i < 150; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let radius = Math.random() * 3;
    backgroundStars.push(new Star(x, y, radius, "white"));
  }
}

// Animation Loop
function animate() {
  // request another frame
  requestAnimationFrame(animate);
  assignToDiv();

  c.fillStyle = backgroundGradient;
  c.fillRect(0, 0, canvas.width, canvas.height);

  backgroundStars.forEach((backgroundStar) => {
    backgroundStar.draw();
  });

  createMoutainRange(1, canvas.height - 50, "#384551");
  createMoutainRange(2, canvas.height - 100, "#2B3843");
  createMoutainRange(3, canvas.height - 300, "#26333E");
  c.fillStyle = "#182028";
  c.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  stars.forEach((star, index) => {
    star.update();
    if (star.radius == 0) {
      stars.splice(index, 1);
    }
  });

  miniStars.forEach((miniStar, index) => {
    miniStar.update();
    if (miniStar.ttl == 0) {
      miniStars.splice(index, 1);
    }
  });

  ticker += 1;
  if (ticker % randomSpawnRate == 0) {
    const radius = 12;
    const x = Math.max(radius, Math.random() * canvas.width - radius);
    stars.push(new Star(x, -100, radius, "white"));
    randomSpawnRate = randomIntFromRange(200, 250);
  }
}

init();
animate();
assignToDiv();
