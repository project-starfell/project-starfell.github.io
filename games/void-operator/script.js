const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let isGameOver = false;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 15,
    color: '#fff',
    trail: []
};

const fragments = [];
const particles = [];

// Input
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Fragment {
    constructor() {
        this.reset();
    }
    reset() {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = Math.random() * canvas.width; this.y = -50; }
        else if (edge === 1) { this.x = canvas.width + 50; this.y = Math.random() * canvas.height; }
        else if (edge === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height + 50; }
        else { this.x = -50; this.y = Math.random() * canvas.height; }

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
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
            this.reset();
        }
    }
    draw() {
        ctx.strokeStyle = '#bc13fe';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#bc13fe';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
}

function spawnParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0
        });
    }
}

// Init fragments
for (let i = 0; i < 15; i++) fragments.push(new Fragment());

function animate() {
    if (isGameOver) return;

    // Smooth movement follow
    player.x += (mouse.x - player.x) * 0.15;
    player.y += (mouse.y - player.y) * 0.15;

    // Background
    ctx.fillStyle = 'rgba(10, 0, 26, 0.2)'; // Motion blur
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Fragments
    fragments.forEach(f => {
        f.update();
        f.draw();

        // Collision
        const dx = player.x - (f.x + f.size/2);
        const dy = player.y - (f.y + f.size/2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size + f.size/2) {
            isGameOver = true;
            spawnParticles(player.x, player.y);
            alert("VOID REACHED: CONNECTION LOST. Score: " + Math.floor(score));
            location.reload();
        }
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    // Update Particles
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
        ctx.fillStyle = `rgba(188, 19, 254, ${p.life})`;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    score += 0.1;
    scoreDisplay.innerText = Math.floor(score);

    requestAnimationFrame(animate);
}

animate();
