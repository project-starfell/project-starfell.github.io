const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = "OVERWORLD"; // OVERWORLD or BATTLE
let currentRoom = 1; // 1: Flower Room, 2: Corridor
let score = 0;

const player = {
    x: 300, y: 350, size: 20, speed: 4,
    bx: 310, by: 240, // Battle X/Y
};

const enemy = { x: 320, y: 100, active: false, bullets: [] };
const keys = {};

window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function startBattle() {
    gameState = "BATTLE";
    player.bx = 310; player.by = 300;
    enemy.bullets = [];
}

function update() {
    if (gameState === "OVERWORLD") {
        if (keys['ArrowUp']) player.y -= player.speed;
        if (keys['ArrowDown']) player.y += player.speed;
        if (keys['ArrowLeft']) player.x -= player.speed;
        if (keys['ArrowRight']) player.x += player.speed;

        // Room 1 Logic (Flower Room)
        if (currentRoom === 1 && player.y < 0) {
            currentRoom = 2;
            player.y = 450;
        }
        
        // Room 2 Logic (Corridor)
        if (currentRoom === 2) {
            if (player.y > 480) { currentRoom = 1; player.y = 20; }
            // Random Battle Trigger
            if ((keys['ArrowUp'] || keys['ArrowDown']) && Math.random() < 0.01) {
                startBattle();
            }
        }
    } else if (gameState === "BATTLE") {
        // Heart Movement in the Box
        if (keys['ArrowUp'] && player.by > 210) player.by -= 3;
        if (keys['ArrowDown'] && player.by < 380) player.by += 3;
        if (keys['ArrowLeft'] && player.bx > 220) player.bx -= 3;
        if (keys['ArrowRight'] && player.bx < 410) player.bx += 3;

        // Spawn Bullets
        if (Math.random() < 0.05) {
            enemy.bullets.push({ x: 220 + Math.random() * 200, y: 180, vy: 4 });
        }

        enemy.bullets.forEach((b, i) => {
            b.y += b.vy;
            // Collision with Heart
            if (Math.hypot(player.bx - b.x, player.by - b.y) < 10) {
                gameState = "OVERWORLD";
                alert("STAY DETERMINED! (You took damage and fled)");
            }
            if (b.y > 400) enemy.bullets.splice(i, 1);
        });

        if (score++ > 500) { // Win condition
            gameState = "OVERWORLD";
            score = 0;
            alert("You spared the enemy!");
        }
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === "OVERWORLD") {
        if (currentRoom === 1) {
            ctx.fillStyle = "yellow";
            ctx.beginPath(); ctx.arc(320, 240, 40, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText("The Golden Flower Room", 240, 320);
        } else {
            ctx.strokeStyle = "white";
            ctx.strokeRect(200, 0, 240, 480);
            ctx.fillText("Long Corridor (Watch out for encounters!)", 10, 20);
        }
        // Player (Frisk-style Square)
        ctx.fillStyle = "#ff0";
        ctx.fillRect(player.x, player.y, player.size, player.size);

    } else if (gameState === "BATTLE") {
        // Enemy Sprite (Placeholder)
        ctx.fillStyle = "white";
        ctx.font = "20px Courier New";
        ctx.fillText("=( BORKO )=", 260, 100);

        // Battle Box
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.strokeRect(210, 200, 220, 200);

        // Heart (Player)
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(player.bx, player.by, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bullets
        ctx.fillStyle = "white";
        enemy.bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, 10, 10);
        });
    }

    update();
    requestAnimationFrame(draw);
}

draw();
