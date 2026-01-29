const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

let w, h;
let score = 0;
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"
let pulseFrame = 0;
let pulses = [];

const player = {
    x: 0,
    y: 0,
    size: 20,
    targetX: 0,
    targetY: 0,
    color: '#00f2ff'
};

// --- FIX 1: Zoom-Proof Resizing ---
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (gameState !== "PLAYING") {
        player.x = player.targetX = w / 2;
        player.y = player.targetY = h / 2;
    }
}
window.addEventListener('resize', resize);
resize();

// --- FIX 2: State-Based Controls ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameState === "START" || gameState === "GAMEOVER") {
            resetGame();
        }
    }

    if (gameState !== "PLAYING") return;

    const step = 60;
    if (e.key === 'ArrowUp') player.targetY -= step;
    if (e.key === 'ArrowDown') player.targetY += step;
    if (e.key === 'ArrowLeft') player.targetX -= step;
    if (e.key === 'ArrowRight') player.targetX += step;
});

function resetGame() {
    score = 0;
    pulses = [];
    gameState = "PLAYING";
    player.x = player.targetX = w / 2;
    player.y = player.targetY = h / 2;
}

class PulseWave {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.r = 0;
        this.maxR = 150 + Math.random() * 200;
        this.speed = 2 + (score / 100);
    }
    update() {
        this.r += this.speed;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // --- FIX 3: Removed Alert/Reload ---
        if (Math.abs(dist - this.r) < 10) {
            gameState = "GAMEOVER";
        }
    }
    draw(pulseValue) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(340, 100%, 50%, ${1 - this.r / this.maxR})`;
        ctx.lineWidth = 2 + pulseValue * 5;
        ctx.stroke();
    }
}

function update() {
    if (gameState !== "PLAYING") return;

    player.x += (player.targetX - player.x) * 0.2;
    player.y += (player.targetY - player.y) * 0.2;

    player.targetX = Math.max(0, Math.min(w, player.targetX));
    player.targetY = Math.max(0, Math.min(h, player.targetY));

    if (Math.random() < 0.03) pulses.push(new PulseWave());

    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update();
        if (pulses[i].r > pulses[i].maxR) pulses.splice(i, 1);
    }

    score += 0.05;
    scoreLabel.innerText = Math.floor(score);
    pulseFrame += 0.1;
}

function draw() {
    const pulseValue = Math.abs(Math.sin(pulseFrame));
    ctx.fillStyle = `rgba(10, 0, 10, ${0.1 + (pulseValue * 0.05)})`;
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = `rgba(0, 242, 255, ${0.05 * pulseValue})`;
    for(let i=0; i<w; i+=60) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, h); ctx.stroke();
    }
    for(let i=0; i<h; i+=60) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w, i); ctx.stroke();
    }

    pulses.forEach(p => p.draw(pulseValue));

    ctx.shadowBlur = 15 + (pulseValue * 10);
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

    // --- FIX 4: Visual Overlays (Keep Fullscreen) ---
    if (gameState === "START" || gameState === "GAMEOVER") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.shadowBlur = 20;
        
        if (gameState === "START") {
            ctx.fillStyle = "#00f2ff";
            ctx.font = "30px 'Courier New'";
            ctx.fillText("CYBER PULSE", w / 2, h / 2 - 20);
            ctx.font = "18px 'Courier New'";
            ctx.fillText("PRESS SPACE TO SYNC", w / 2, h / 2 + 40);
        } else {
            ctx.fillStyle = "#ff0066";
            ctx.font = "30px 'Courier New'";
            ctx.fillText("PULSE DE-SYNCED", w / 2, h / 2 - 20);
            ctx.fillStyle = "#fff";
            ctx.font = "18px 'Courier New'";
            ctx.fillText(`ENERGY CAPTURED: ${Math.floor(score)}`, w / 2, h / 2 + 30);
            ctx.fillText("PRESS SPACE TO RE-SYNC", w / 2, h / 2 + 80);
        }
    }

    update();
    requestAnimationFrame(draw);
}

draw();
