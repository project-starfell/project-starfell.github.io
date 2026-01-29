const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('score');

// State Management
let score = 0;
let gameState = "START"; 
let currentPhase = 'CYAN'; // Phases: CYAN or MAGENTA

// Fixed Game Dimensions
canvas.width = 800;
canvas.height = 600;

const player = {
    x: 100, y: 100,
    w: 30, h: 30,
    vx: 0, vy: 0,
    speed: 5,
    jump: -12,
    gravity: 0.6,
    grounded: false
};

const platforms = [
    { x: 0, y: 550, w: 800, h: 50, type: 'STATIC' },
    { x: 200, y: 400, w: 150, h: 20, type: 'CYAN' },
    { x: 450, y: 300, w: 150, h: 20, type: 'MAGENTA' },
    { x: 200, y: 200, w: 150, h: 20, type: 'CYAN' },
    { x: 500, y: 150, w: 100, h: 20, type: 'MAGENTA' }
];

const stars = [{ x: 530, y: 100, collected: false }];

// Input Handling
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
};
window.onkeyup = (e) => keys[e.code] = false;

function resetGame() {
    score = 0;
    scoreText.innerText = score;
    player.x = 100;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
    gameState = "PLAYING";
}

function update() {
    if (gameState !== "PLAYING") return;

    // 1. Horizontal Movement
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx *= 0.8;

    // 2. Jumping
    if (keys['ArrowUp'] && player.grounded) {
        player.vy = player.jump;
        player.grounded = false;
    }

    // 3. Gravity & Movement
    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    // 4. Bound Checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    
    // Fall off bottom = Game Over (No Alert!)
    if (player.y > canvas.height) {
        gameState = "GAMEOVER";
    }

    // 5. Robust Collision Logic
    player.grounded = false;
    platforms.forEach(p => {
        // Only collide if platform is STATIC or matches current phase
        if (p.type === 'STATIC' || p.type === currentPhase) {
            // Check if player is falling and within X bounds
            if (player.vx >= 0 || player.vx < 0) { // Horizontal check
                if (player.x < p.x + p.w && player.x + player.w > p.x) {
                    // Vertical collision (landing on top)
                    if (player.vy > 0 && 
                        player.y + player.h >= p.y && 
                        player.y + player.h <= p.y + p.h + player.vy) {
                        player.y = p.y - player.h;
                        player.vy = 0;
                        player.grounded = true;
                    }
                }
            }
        }
    });

    // 6. Star Collection
    stars.forEach(s => {
        if (!s.collected && Math.hypot((player.x + player.w/2) - s.x, (player.y + player.h/2) - s.y) < 30) {
            s.collected = true;
            score++;
            scoreText.innerText = score;
            setTimeout(() => {
                s.x = Math.random() * 700 + 50;
                s.y = Math.random() * 350 + 50;
                s.collected = false;
            }, 500);
        }
    });
}

function draw() {
    // Clear Background
    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    platforms.forEach(p => {
        if (p.type === 'STATIC') ctx.fillStyle = '#444';
        else if (p.type === 'CYAN') ctx.fillStyle = currentPhase === 'CYAN' ? '#0ff' : '#022';
        else if (p.type === 'MAGENTA') ctx.fillStyle = currentPhase === 'MAGENTA' ? '#f0f' : '#303';
        
        ctx.shadowBlur = (p.type === currentPhase || p.type === 'STATIC') ? 10 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.shadowBlur = 0;
    });

    // Draw Star
    stars.forEach(s => {
        if (!s.collected) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    // Overlay Menus
    if (gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        
        if (gameState === "START") {
            ctx.fillStyle = "#0ff";
            ctx.font = "30px Courier New";
            ctx.fillText("STAR SHIFTER", canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = "18px Courier New";
            ctx.fillText("USE ARROWS TO MOVE | SPACE TO SHIFT", canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText("PRESS SPACE TO BEGIN", canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillStyle = "#ff4444";
            ctx.font = "30px Courier New";
            ctx.fillText("SIGNAL LOST", canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = "#fff";
            ctx.font = "18px Courier New";
            ctx.fillText(`STARS COLLECTED: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText("PRESS SPACE TO RE-SYNC", canvas.width / 2, canvas.height / 2 + 70);
        }
    }

    update();
    requestAnimationFrame(draw);
}

draw();
