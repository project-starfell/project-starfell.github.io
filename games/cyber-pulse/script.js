const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

let w, h;
let score = 0;
let gameState = "START"; 
let pulseFrame = 0;
let pulses = [];

const player = {
    x: 0, y: 0, size: 20, targetX: 0, targetY: 0, color: '#00f2ff'
};

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

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (gameState === "START" || gameState === "GAMEOVER")) resetGame();
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
        // NEW: Disappear quicker (Max radius reduced to 200)
        this.maxR = 120 + Math.random() * 80; 
        this.speed = Math.min(7, 2 + (score / 40));
        
        // NEW: Warning Logic
        this.warningTime = 45; // Frames the warning stays on screen
        this.isActive = false;
    }

    update() {
        if (this.warningTime > 0) {
            this.warningTime--;
            if (this.warningTime <= 0) this.isActive = true;
            return;
        }

        this.r += this.speed;
        
        if (this.isActive) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Fairness fix: hitbox reduced to 8
            if (Math.abs(dist - this.r) < 8) {
                gameState = "GAMEOVER";
            }
        }
    }

    draw(pulseValue) {
        ctx.beginPath();
        // Warning stays small, Active grows
        ctx.arc(this.x, this.y, this.isActive ? this.r : 15, 0, Math.PI * 2);
        
        if (!this.isActive) {
            // NEW: Warning UI (Dashed line)
            ctx.strokeStyle = `rgba(255, 255, 0, ${pulseValue})`;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
        } else {
            // OLD UI: Solid neon pink line
            ctx.strokeStyle = `hsla(340, 100%, 50%, ${1 - this.r / this.maxR})`;
            ctx.setLineDash([]);
            ctx.lineWidth = 2 + pulseValue * 5;
        }
        
        ctx.stroke();
        ctx.setLineDash([]); 
    }
}

function update() {
    if (gameState !== "PLAYING") return;

    player.x += (player.targetX - player.x) * 0.2;
    player.y += (player.targetY - player.y) * 0.2;

    player.targetX = Math.max(0, Math.min(w, player.targetX));
    player.targetY = Math.max(0, Math.min(h, player.targetY));

    // Spawn frequency
    if (Math.random() < 0.025) pulses.push(new PulseWave());

    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update();
        if (pulses[i].isActive && pulses[i].r > pulses[i].maxR) pulses.splice(i, 1);
    }

    score += 0.05;
    scoreLabel.innerText = Math.floor(score);
    pulseFrame += 0.1;
}

function draw() {
    const pulseValue = Math.abs(Math.sin(pulseFrame));
    
    // OLD UI: Dark Purple/Black Flicker Background
    ctx.fillStyle = `rgba(10, 0, 10, ${0.1 + (pulseValue * 0.05)})`;
    ctx.fillRect(0, 0, w, h);

    // OLD UI: Blue Grid Lines
    ctx.strokeStyle = `rgba(0, 242, 255, ${0.05 * pulseValue})`;
    for(let i=0; i<w; i+=60) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, h); ctx.stroke();
    }
    for(let i=0; i<h; i+=60) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w, i); ctx.stroke();
    }

    pulses.forEach(p => p.draw(pulseValue));

    // OLD UI: Player Square
    ctx.shadowBlur = 15 + (pulseValue * 10);
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
    ctx.shadowBlur = 0;

    // OLD UI: Menu Overlays
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
