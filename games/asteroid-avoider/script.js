const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

let w, h;
let score = 0;
let gameOver = false;
let asteroids = [];

// Configuration
const ASTEROID_SPEED = 3;
const ASTEROID_COUNT = 8;
const ship = {
    x: 0, y: 0, r: 15, angle: 0,
    thrust: { x: 0, y: 0 },
    friction: 0.98
};

// --- FIX 1: Dynamic Resizing ---
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    // Keep ship centered if game hasn't started, or keep in bounds
    if (score === 0) {
        ship.x = w / 2;
        ship.y = h / 2;
    }
}
window.addEventListener('resize', resize);
resize();

// --- FIX 2: Soft Reset (Keep Fullscreen) ---
function resetGame() {
    score = 0;
    gameOver = false;
    ship.x = w / 2;
    ship.y = h / 2;
    ship.thrust = { x: 0, y: 0 };
    ship.angle = Math.PI / 2;
    asteroids.length = 0;
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(createAsteroid());
    }
}

const keys = {};
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function createAsteroid() {
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 : w;
        y = Math.random() * h;
    } else {
        x = Math.random() * w;
        y = Math.random() < 0.5 ? 0 : h;
    }
    return {
        x: x, y: y,
        xv: (Math.random() * ASTEROID_SPEED * 2 - ASTEROID_SPEED),
        yv: (Math.random() * ASTEROID_SPEED * 2 - ASTEROID_SPEED),
        r: Math.random() * 20 + 20
    };
}

function update() {
    if (gameOver) return;

    if (keys['ArrowLeft']) ship.angle += 0.1;
    if (keys['ArrowRight']) ship.angle -= 0.1;

    if (keys['ArrowUp']) {
        ship.thrust.x += 0.2 * Math.cos(ship.angle);
        ship.thrust.y -= 0.2 * Math.sin(ship.angle);
    } else {
        ship.thrust.x *= ship.friction;
        ship.thrust.y *= ship.friction;
    }

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Screen wrap using dynamic w/h
    if (ship.x < 0) ship.x = w;
    else if (ship.x > w) ship.x = 0;
    if (ship.y < 0) ship.y = h;
    else if (ship.y > h) ship.y = 0;

    asteroids.forEach(a => {
        a.x += a.xv;
        a.y += a.yv;

        if (a.x < -a.r) a.x = w + a.r;
        else if (a.x > w + a.r) a.x = -a.r;
        if (a.y < -a.r) a.y = h + a.r;
        else if (a.y > h + a.r) a.y = -a.r;

        let dist = Math.hypot(ship.x - a.x, ship.y - a.y);
        if (dist < ship.r + a.r) {
            gameOver = true;
            // Delay alert slightly so the last frame renders
            setTimeout(() => {
                alert("Game Over! Score: " + Math.floor(score));
                resetGame();
            }, 10);
        }
    });

    score += 0.1;
    scoreLabel.innerText = Math.floor(score);
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.beginPath();
    ctx.moveTo(
        ship.x + ship.r * Math.cos(ship.angle),
        ship.y - ship.r * Math.sin(ship.angle)
    );
    ctx.lineTo(
        ship.x - ship.r * (Math.cos(ship.angle) + Math.sin(ship.angle)),
        ship.y + ship.r * (Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo(
        ship.x - ship.r * (Math.cos(ship.angle) - Math.sin(ship.angle)),
        ship.y + ship.r * (Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
    });

    update();
    requestAnimationFrame(draw);
}

// Initial setup
resetGame();
draw();
