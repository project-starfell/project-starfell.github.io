const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('score');

let score = 0;
let gameState = "START"; 
let currentPhase = 'CYAN'; 

canvas.width = 800;
canvas.height = 600;

const player = {
    x: 100, y: 450,
    w: 30, h: 30,
    vx: 0, vy: 0,
    accel: 0.8,
    friction: 0.85,
    maxSpeed: 6,
    jump: -12,
    gravity: 0.6,
    grounded: false,
    // NEW MECHANICS
    canDoubleJump: false,
    isDashing: false,
    dashCooldown: 0,
    lastDir: 1 // 1 for right, -1 for left
};

// REDESIGNED PLATFORMS: Staircase layout for recoverability
const platforms = [
    { x: 0, y: 550, w: 800, h: 50, type: 'STATIC' },   // Floor
    { x: 50, y: 420, w: 120, h: 20, type: 'CYAN' },    // Step 1
    { x: 250, y: 350, w: 120, h: 20, type: 'MAGENTA' }, // Step 2
    { x: 450, y: 280, w: 120, h: 20, type: 'CYAN' },    // Step 3
    { x: 250, y: 180, w: 120, h: 20, type: 'MAGENTA' }, // Step 4
    { x: 50, y: 120, w: 120, h: 20, type: 'CYAN' },     // Step 5
    { x: 500, y: 100, w: 200, h: 20, type: 'STATIC' }   // High Goal
];

const stars = [{ x: 600, y: 60, collected: false }];

const keys = {};
window.onkeydown = (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        if (gameState === "PLAYING") {
            currentPhase = currentPhase === 'CYAN' ? 'MAGENTA' : 'CYAN';
        } else {
            resetGame();
        }
    }

    // DOUBLE JUMP LOGIC
    if (e.code === 'ArrowUp' && gameState === "PLAYING") {
        if (player.grounded) {
            player.vy = player.jump;
            player.grounded = false;
            player.canDoubleJump = true;
        } else if (player.canDoubleJump) {
            player.vy = player.jump * 0.9; // Slightly weaker second jump
            player.canDoubleJump = false;
        }
    }

    // DASH LOGIC
    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && player.dashCooldown <= 0) {
        player.isDashing = true;
        player.vx = player.lastDir * 20; // Burst of speed
        player.dashCooldown = 40; // Cooldown frames
        setTimeout(() => player.isDashing = false, 150);
    }
};
window.onkeyup = (e) => keys[e.code] = false;

function resetGame() {
    score = 0;
    scoreText.innerText = score;
    player.x = 100; player.y = 450;
    player.vx = 0; player.vy = 0;
    gameState = "PLAYING";
}

function update() {
    if (gameState !== "PLAYING") return;

    // 1. Horizontal Movement
    if (!player.isDashing) {
        if (keys['ArrowLeft']) { player.vx -= player.accel; player.lastDir = -1; }
        if (keys['ArrowRight']) { player.vx += player.accel; player.lastDir = 1; }
        player.vx *= player.friction;
    }

    if (player.dashCooldown > 0) player.dashCooldown--;

    // 2. Apply Gravity (No gravity during dash)
    if (!player.isDashing) player.vy += player.gravity;

    player.x += player.vx;
    player.y += player.vy;

    // 3. Bound Checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    if (player.y > canvas.height) gameState = "GAMEOVER";

    // 4. Collision
    player.grounded = false;
    platforms.forEach(p => {
        if (p.type === 'STATIC' || p.type === currentPhase) {
            if (player.x + player.w > p.x + 5 && player.x < p.x + p.w - 5) {
                if (player.vy >= 0 && 
                    player.y + player.h >= p.y && 
                    player.y + player.h <= p.y + p.h + player.vy + 2) {
                    player.y = p.y - player.h;
                    player.vy = 0;
                    player.grounded = true;
                    player.canDoubleJump = false; // Reset jump on land
                }
            }
        }
    });

    // 5. Star logic
    stars.forEach(s => {
        if (!s.collected && Math.hypot((player.x + player.w/2) - s.x, (player.y + player.h/2) - s.y) < 30) {
            s.collected = true;
            score++;
            scoreText.innerText = score;
            setTimeout(() => {
                s.x = Math.random() * 700 + 50;
                s.y = Math.random() * 400 + 50;
                s.collected = false;
            }, 500);
        }
    });
}

function draw() {
    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    platforms.forEach(p => {
        if (p.type === 'STATIC') ctx.fillStyle = '#444';
        else if (p.type === 'CYAN') ctx.fillStyle = currentPhase === 'CYAN' ? '#0ff' : '#022';
        else if (p.type === 'MAGENTA') ctx.fillStyle = currentPhase === 'MAGENTA' ? '#f0f' : '#202';
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Dash Trail Effect
    if (player.isDashing) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(player.x - (player.lastDir * 15), player.y, player.w, player.h);
    }

    // Draw Player
    ctx.fillStyle = player.dashCooldown > 0 && !player.isDashing ? '#aaa' : '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    // Draw Star
    stars.forEach(s => {
        if (!s.collected) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // UI Overlay
    if (gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "24px Courier New";
        ctx.fillText(gameState === "START" ? "STAR SHIFTER: EVOLVED" : "SIGNAL LOST", canvas.width/2, 250);
        ctx.font = "16px Courier New";
        ctx.fillText("UP (x2): Double Jump | SHIFT: Dash", canvas.width/2, 300);
        ctx.fillText("SPACE TO START/SHIFT", canvas.width/2, 340);
    }

    update();
    requestAnimationFrame(draw);
}

draw();
