const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

let score = 0;
let gameActive = true;

// Player Object
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 100,
    w: 30,
    h: 50,
    color: '#0ff',
    speed: 7
};

// Obstacles
const obstacles = [];
const obsWidth = 50;
const obsHeight = 30;
let frameCount = 0;

// Input Handling
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function spawnObstacle() {
    const x = Math.random() * (canvas.width - obsWidth);
    obstacles.push({ x, y: -obsHeight, w: obsWidth, h: obsHeight });
}

function update() {
    if (!gameActive) return;

    // Move Player
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;

    // Move & Filter Obstacles
    frameCount++;
    if (frameCount % 40 === 0) spawnObstacle();

    obstacles.forEach((obs, index) => {
        obs.y += 5 + (score / 10); // Increase speed as score rises

        // Collision Detection
        if (player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y) {
            gameActive = false;
            alert(`Game Over! Score: ${score}`);
            location.reload();
        }

        // Score points
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreElement.innerText = score;
        }
    });
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Player (Neon Style)
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Draw Obstacles
    ctx.shadowColor = '#f0f';
    ctx.fillStyle = '#f0f';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    });

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

draw();
