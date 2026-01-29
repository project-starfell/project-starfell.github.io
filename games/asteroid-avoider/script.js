const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

let w, h;
let score = 0;
let gameState = "START"; // Options: "START", "PLAYING", "GAMEOVER"
let asteroids = [];

const ASTEROID_SPEED = 3;
const ASTEROID_COUNT = 8;
const ship = {
    x: 0, y: 0, r: 15, angle: Math.PI / 2,
    thrust: { x: 0, y: 0 },
    friction: 0.98
};

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (gameState !== "PLAYING") {
        ship.x = w / 2;
        ship.y = h / 2;
    }
}
window.addEventListener('resize', resize);
resize();

const keys = {};
window.onkeydown = (e) => {
    keys[e.code] = true;
    // Start or Restart game on Space press
    if (e.code === 'Space') {
        if (gameState === "START" || gameState === "GAMEOVER") {
            startGame();
        }
    }
};
window.onkeyup = (e) => keys[e.code] = false;

function startGame() {
    score = 0;
    gameState = "PLAYING";
    ship.x = w / 2;
    ship.y = h / 2;
    ship.thrust = { x: 0, y: 0 };
    asteroids = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(createAsteroid());
    }
}

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
    if (gameState !== "PLAYING") return;

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
            gameState = "GAMEOVER";
        }
    });

    score += 0.1;
    scoreLabel.innerText = Math.floor(score);
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    // Draw Ship
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.r * Math.cos(ship.angle), ship.y - ship.r * Math.sin(ship.angle));
    ctx.lineTo(ship.x - ship.r * (Math.cos(ship.angle) + Math.sin(ship.angle)), ship.y + ship.r * (Math.sin(ship.angle) - Math.cos(ship.angle)));
    ctx.lineTo(ship.x - ship.r * (Math.cos(ship.angle) - Math.sin(ship.angle)), ship.y + ship.r * (Math.sin(ship.angle) + Math.cos(ship.angle)));
    ctx.closePath();
    ctx.stroke();

    // Draw Asteroids
    ctx.strokeStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // --- NEW: Overlay Screens ---
    if (gameState === "START" || gameState === "GAMEOVER") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#00d4ff";
        ctx.textAlign = "center";
        ctx.shadowBlur = 15;
        
        if (gameState === "START") {
            ctx.font = "30px Courier New";
            ctx.fillText("PROJECT: STARFALL", w / 2, h / 2 - 40);
            ctx.font = "20px Courier New";
            ctx.fillText("PRESS SPACE TO START", w / 2, h / 2 + 20);
        } else {
            ctx.font = "30px Courier New";
            ctx.fillStyle = "#ff4444";
            ctx.fillText("SYSTEM CRITICAL: HIT DETECTED", w / 2, h / 2 - 40);
            ctx.fillStyle = "#fff";
            ctx.font = "20px Courier New";
            ctx.fillText(`FINAL SCORE: ${Math.floor(score)}`, w / 2, h / 2);
            ctx.fillText("PRESS SPACE TO REBOOT", w / 2, h / 2 + 50);
        }
    }

    update();
    requestAnimationFrame(draw);
}

draw();
