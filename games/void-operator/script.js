const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let w, h;
let score = 0;
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"

const player = {
    x: 0,
    y: 0,
    size: 15,
    color: '#fff'
};

const fragments = [];
const particles = [];
const mouse = { x: 0, y: 0 };

// --- FIX 1: Zoom & Resize Proofing ---
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (gameState !== "PLAYING") {
        player.x = mouse.x = w / 2;
        player.y = mouse.y = h / 2;
    }
}
window.addEventListener('resize', resize);
resize();

// Input
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (gameState === "START" || gameState === "GAMEOVER")) {
        resetGame();
    }
});

function resetGame() {
    score = 0;
    gameState = "PLAYING";
    fragments.length = 0;
    particles.length = 0;
    for (let i = 0; i < 15; i++) fragments.push(new Fragment());
}

class Fragment {
    constructor() {
        this.reset();
    }
    reset() {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = Math.random() * w; this.y = -50; }
        else if (edge === 1) { this.x = w + 50; this.y = Math.random() * h; }
        else if (edge === 2) { this.x = Math.random() * w; this.y = h + 50; }
        else { this.x = -50; this.y = Math.random() * h; }

        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.speed = 2 + Math.random() * 4 + (score / 500);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.size = 10 + Math.random() * 15;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Out of bounds reset
        if (this.x < -100 || this.x > w + 100 || this.y < -100 || this.y > h + 100) {
            this.reset();
        }
    }
    draw() {
        ctx.strokeStyle = '#bc13fe';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#bc13fe';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }
}

function spawnParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1.0,
            size: Math.random() * 5
        });
    }
}

function animate() {
    // Background with Motion Blur
    ctx.fillStyle = 'rgba(10, 0, 26, 0.2)';
    ctx.fillRect(0, 0, w, h);

    if (gameState === "PLAYING") {
        // Smooth movement follow
        player.x += (mouse.x - player.x) * 0.15;
        player.y += (mouse.y - player.y) * 0.15;

        // Draw Fragments
        fragments.forEach(f => {
            f.update();
            f.draw();

            // Collision Detection
            const dx = player.x - (f.x + f.size / 2);
            const dy = player.y - (f.y + f.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.size + f.size / 2) {
                gameState = "GAMEOVER";
                window.parent.postMessage({game: 'VoidOperator', score: score}, '*');
                spawnParticles(player.x, player.y);
            }
        });

        score += 0.1;
        scoreDisplay.innerText = Math.floor(score);
    }

    // Draw Player
    if (gameState !== "GAMEOVER") {
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Update Particles (Explosion effect)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.fillStyle = `rgba(188, 19, 254, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Menus
    if (gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        
        if (gameState === "START") {
            ctx.fillStyle = "#fff";
            ctx.font = "30px Courier New";
            ctx.fillText("VOID OPERATOR", w / 2, h / 2 - 20);
            ctx.font = "18px Courier New";
            ctx.fillText("GUIDE THE SIGNAL | AVOID THE FRAGMENTS", w / 2, h / 2 + 20);
            ctx.fillText("PRESS SPACE TO CONNECT", w / 2, h / 2 + 60);
        } else if (gameState === "GAMEOVER") {
            ctx.fillStyle = "#bc13fe";
            ctx.font = "30px Courier New";
            ctx.fillText("CONNECTION LOST", w / 2, h / 2 - 20);
            ctx.fillStyle = "#fff";
            ctx.font = "20px Courier New";
            ctx.fillText(`SCORE: ${Math.floor(score)}`, w / 2, h / 2 + 20);
            ctx.fillText("PRESS SPACE TO RECONNECT", w / 2, h / 2 + 70);
        }
    }

    requestAnimationFrame(animate);
}

animate();
