const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;

// Ship Properties
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 15, // radius
    angle: 0,
    rot: 0, // rotation speed
    thrusting: false,
    thrust: { x: 0, y: 0 },
    friction: 0.98
};

// Asteroids Array
const asteroids = [];
const ASTEROID_SPEED = 3;
const ASTEROID_COUNT = 8;

// Input
const keys = {};
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function createAsteroid() {
    let x, y;
    // Spawn outside of screen
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 : canvas.width;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 : canvas.height;
    }
    
    return {
        x: x,
        y: y,
        xv: (Math.random() * ASTEROID_SPEED * 2 - ASTEROID_SPEED),
        yv: (Math.random() * ASTEROID_SPEED * 2 - ASTEROID_SPEED),
        r: Math.random() * 20 + 20
    };
}

// Initialize Asteroids
for (let i = 0; i < ASTEROID_COUNT; i++) {
    asteroids.push(createAsteroid());
}

function update() {
    if (gameOver) return;

    // Rotate
    if (keys['ArrowLeft']) ship.angle += 0.1;
    if (keys['ArrowRight']) ship.angle -= 0.1;

    // Thrust
    if (keys['ArrowUp']) {
        ship.thrust.x += 0.2 * Math.cos(ship.angle);
        ship.thrust.y -= 0.2 * Math.sin(ship.angle);
    } else {
        ship.thrust.x *= ship.friction;
        ship.thrust.y *= ship.friction;
    }

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Screen wrap for ship
    if (ship.x < 0) ship.x = canvas.width;
    else if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    else if (ship.y > canvas.height) ship.y = 0;

    // Update Asteroids
    asteroids.forEach(a => {
        a.x += a.xv;
        a.y += a.yv;

        // Wrap asteroids
        if (a.x < -a.r) a.x = canvas.width + a.r;
        else if (a.x > canvas.width + a.r) a.x = -a.r;
        if (a.y < -a.r) a.y = canvas.height + a.r;
        else if (a.y > canvas.height + a.r) a.y = -a.r;

        // Collision Check (Circle overlap formula)
        let dist = Math.hypot(ship.x - a.x, ship.y - a.y);
        if (dist < ship.r + a.r) {
            gameOver = true;
            alert("Hit! Final Score: " + Math.floor(score));
            location.reload();
        }
    });

    score += 0.1;
    scoreLabel.innerText = Math.floor(score);
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Ship
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

    // Draw Asteroids
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

draw();
