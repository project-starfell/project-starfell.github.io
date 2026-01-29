const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let pulseFrame = 0;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
    color: '#00f2ff'
};

const pulses = [];

// Movement - Grid Based
window.addEventListener('keydown', (e) => {
    const step = 60;
    if (e.key === 'ArrowUp') player.targetY -= step;
    if (e.key === 'ArrowDown') player.targetY += step;
    if (e.key === 'ArrowLeft') player.targetX -= step;
    if (e.key === 'ArrowRight') player.targetX += step;
});

class PulseWave {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = 0;
        this.maxR = 150 + Math.random() * 200;
        this.width = 5;
        this.speed = 2 + (score / 100);
    }
    update() {
        this.r += this.speed;
        // Collision: Check if player is on the ring of the pulse
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If player is touching the expanding ring
        if (Math.abs(dist - this.r) < 10) {
            gameOver = true;
            alert("PULSE DE-SYNCED! Energy captured: " + Math.floor(score));
            location.reload();
        }
    }
    draw(pulseValue) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(340, 100%, 50%, ${1 - this.r / this.maxR})`;
        ctx.lineWidth = 2 + pulseValue * 5; // Width reacts to the global pulse
        ctx.stroke();
    }
}

function update() {
    if (gameOver) return;

    // Smooth movement to target
    player.x += (player.targetX - player.x) * 0.2;
    player.y += (player.targetY - player.y) * 0.2;

    // Keep player in bounds
    player.targetX = Math.max(0, Math.min(canvas.width, player.targetX));
    player.targetY = Math.max(0, Math.min(canvas.height, player.targetY));

    // Spawn waves
    if (Math.random() < 0.03) pulses.push(new PulseWave());

    pulses.forEach((p, i) => {
        p.update();
        if (p.r > p.maxR) pulses.splice(i, 1);
    });

    score += 0.05;
    scoreLabel.innerText = Math.floor(score);
    pulseFrame += 0.1;
}

function draw() {
    // Background flicker effect
    const pulseValue = Math.abs(Math.sin(pulseFrame));
    ctx.fillStyle = `rgba(10, 0, 10, ${0.1 + (pulseValue * 0.05)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = `rgba(0, 242, 255, ${0.05 * pulseValue})`;
    for(let i=0; i<canvas.width; i+=60) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=60) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw Waves
    pulses.forEach(p => p.draw(pulseValue));

    // Draw Player
    ctx.shadowBlur = 15 + (pulseValue * 10);
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

    update();
    requestAnimationFrame(draw);
}

draw();
