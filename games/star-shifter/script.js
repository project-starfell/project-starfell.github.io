const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const phaseText = document.getElementById('phase');
const scoreText = document.getElementById('score');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let currentPhase = 'CYAN'; // Phases: CYAN or MAGENTA

const player = {
    x: 100, y: 100,
    w: 30, h: 30,
    vx: 0, vy: 0,
    speed: 5,
    jump: -12,
    gravity: 0.6,
    grounded: false
};

// Platforms with phase properties
const platforms = [
    { x: 0, y: 550, w: 800, h: 50, type: 'STATIC' },
    { x: 200, y: 400, w: 150, h: 20, type: 'CYAN' },
    { x: 450, y: 300, w: 150, h: 20, type: 'MAGENTA' },
    { x: 200, y: 200, w: 150, h: 20, type: 'CYAN' },
    { x: 500, y: 150, w: 100, h: 20, type: 'MAGENTA' }
];

const stars = [{ x: 530, y: 100, collected: false }];

const keys = {};
window.onkeydown = (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        currentPhase = currentPhase === 'CYAN' ? 'MAGENTA' : 'CYAN';
        phaseText.innerText = currentPhase;
        phaseText.style.color = currentPhase === 'CYAN' ? '#0ff' : '#f0f';
    }
};
window.onkeyup = (e) => keys[e.code] = false;

function update() {
    // Left/Right
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx *= 0.8;

    // Jump
    if (keys['ArrowUp'] && player.grounded) {
        player.vy = player.jump;
        player.grounded = false;
    }

    // Gravity
    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    player.grounded = false;

    // Platform Collision
    platforms.forEach(p => {
        // Only collide if platform is STATIC or matches current phase
        if (p.type === 'STATIC' || p.type === currentPhase) {
            if (player.x < p.x + p.w && player.x + player.w > p.x &&
                player.y + player.h > p.y && player.y + player.h < p.y + p.vy + 10) {
                player.y = p.y - player.h;
                player.vy = 0;
                player.grounded = true;
            }
        }
    });

    // Star Collection
    stars.forEach(s => {
        if (!s.collected && Math.hypot(player.x - s.x, player.y - s.y) < 30) {
            s.collected = true;
            score++;
            scoreText.innerText = score;
            // Spawn next star randomly
            setTimeout(() => {
                s.x = Math.random() * 700 + 50;
                s.y = Math.random() * 400 + 100;
                s.collected = false;
            }, 1000);
        }
    });
}

function draw() {
    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    platforms.forEach(p => {
        if (p.type === 'STATIC') ctx.fillStyle = '#444';
        else if (p.type === 'CYAN') ctx.fillStyle = currentPhase === 'CYAN' ? '#0ff' : '#044';
        else if (p.type === 'MAGENTA') ctx.fillStyle = currentPhase === 'MAGENTA' ? '#f0f' : '#404';
        
        ctx.shadowBlur = p.type === currentPhase ? 15 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Draw Star
    stars.forEach(s => {
        if (!s.collected) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    update();
    requestAnimationFrame(draw);
}

draw();
