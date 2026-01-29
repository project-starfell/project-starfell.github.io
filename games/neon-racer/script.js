const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// State Management
let score = 0;
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"
let frameCount = 0;
let obstacles = [];

// Fixed Canvas Size for consistent gameplay
canvas.width = 400;
canvas.height = 600;

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 100,
    w: 30,
    h: 50,
    color: '#0ff',
    speed: 7
};

const obsWidth = 50;
const obsHeight = 30;

// Input Handling
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && (gameState === "START" || gameState === "GAMEOVER")) {
        resetGame();
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

function resetGame() {
    score = 0;
    obstacles = [];
    frameCount = 0;
    gameState = "PLAYING";
    player.x = canvas.width / 2 - 15;
    scoreElement.innerText = score;
}

function spawnObstacle() {
    const x = Math.random() * (canvas.width - obsWidth);
    obstacles.push({ x, y: -obsHeight, w: obsWidth, h: obsHeight });
}

function update() {
    if (gameState !== "PLAYING") return;

    // Move Player
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;

    // Spawn Logic
    frameCount++;
    if (frameCount % 40 === 0) spawnObstacle();

    // Speed Calculation: 5 base + small increase that plateaus
    // This makes 40 energy feel fast but not impossible.
    let currentSpeed = 5 + Math.log10(score + 1) * 4; 

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += currentSpeed;

        // Collision Detection (No more Alert!)
        if (player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y) {
            gameState = "GAMEOVER";
            window.parent.postMessage({game: 'NeonRacer', score: score}, '*');
        }

        // Scoring
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            scoreElement.innerText = score;
        }
    }
}

function draw() {
    // Clear Canvas with Trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Player
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

    // Menu Overlays
    if (gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.shadowBlur = 10;
        
        if (gameState === "START") {
            ctx.fillStyle = "#0ff";
            ctx.font = "24px Courier New";
            ctx.fillText("NEON RACER", canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = "16px Courier New";
            ctx.fillText("PRESS SPACE TO DRIVE", canvas.width / 2, canvas.height / 2 + 30);
        } else {
            ctx.fillStyle = "#f0f";
            ctx.font = "24px Courier New";
            ctx.fillText("VEHICLE CRASHED", canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = "#fff";
            ctx.font = "16px Courier New";
            ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText("PRESS SPACE TO RE-ENTRY", canvas.width / 2, canvas.height / 2 + 50);
        }
    }

    requestAnimationFrame(draw);
    update();
}

draw();
