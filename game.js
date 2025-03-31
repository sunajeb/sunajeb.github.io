/* Updated game.js with multiple levels, professional UI, and enhanced gameplay features */

// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Global game variables and constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;
const GROUND_HEIGHT = 350;
const PLATFORM_HEIGHT = 20;
const COIN_SIZE = 20;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const BULLET_SPEED = 10;
const SHOOT_COOLDOWN_MAX = 30; // frames

// Game state
let currentLevelIndex = 0;

// Player object
let player = {
    x: 50,
    y: GROUND_HEIGHT - 60,
    width: 40,
    height: 60,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    score: 0,
    lives: 3,
    gunCooldown: 0
};

// Bullets array
let bullets = [];

// Levels definition
let levels = [];

function initializeLevels() {
    levels = [
        { // Level 1
            level: 1,
            platforms: [
                { x: 200, y: 250, width: 100, height: PLATFORM_HEIGHT },
                { x: 400, y: 200, width: 100, height: PLATFORM_HEIGHT },
                { x: 600, y: 250, width: 100, height: PLATFORM_HEIGHT }
            ],
            coins: [
                { x: 250, y: 200, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 450, y: 150, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 650, y: 200, width: COIN_SIZE, height: COIN_SIZE, collected: false }
            ],
            enemies: [
                { x: 300, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: 1, speed: 2 },
                { x: 500, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: -1, speed: 2 }
            ],
            hasGun: false
        },
        { // Level 2 (Mario gets a gun!)
            level: 2,
            platforms: [
                { x: 150, y: 220, width: 120, height: PLATFORM_HEIGHT },
                { x: 350, y: 170, width: 120, height: PLATFORM_HEIGHT },
                { x: 550, y: 220, width: 120, height: PLATFORM_HEIGHT }
            ],
            coins: [
                { x: 200, y: 170, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 400, y: 120, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 600, y: 170, width: COIN_SIZE, height: COIN_SIZE, collected: false }
            ],
            enemies: [
                { x: 250, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: 1, speed: 2 }
            ],
            hasGun: true
        },
        { // Level 3
            level: 3,
            platforms: [
                { x: 100, y: 240, width: 150, height: PLATFORM_HEIGHT },
                { x: 300, y: 190, width: 150, height: PLATFORM_HEIGHT },
                { x: 500, y: 240, width: 150, height: PLATFORM_HEIGHT }
            ],
            coins: [
                { x: 150, y: 190, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 350, y: 140, width: COIN_SIZE, height: COIN_SIZE, collected: false },
                { x: 550, y: 190, width: COIN_SIZE, height: COIN_SIZE, collected: false }
            ],
            enemies: [
                { x: 200, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: 1, speed: 2 },
                { x: 400, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: -1, speed: 2 }
            ],
            hasGun: false
        }
    ];
}

// Initialize levels
initializeLevels();

// Keyboard input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Shooting handling (only if gun is equipped)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyF' && levels[currentLevelIndex].hasGun && player.gunCooldown === 0) {
        // Create a bullet starting from player's right side
        bullets.push({
            x: player.x + player.width,
            y: player.y + player.height / 2 - 2.5,
            width: 10,
            height: 5,
            velocityX: BULLET_SPEED
        });
        player.gunCooldown = SHOOT_COOLDOWN_MAX;
    }
});

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    if (player.gunCooldown > 0) {
        player.gunCooldown--;
    }
}

function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.velocityX = -PLAYER_SPEED;
    } else if (keys['ArrowRight']) {
        player.velocityX = PLAYER_SPEED;
    } else {
        player.velocityX = 0;
    }
    
    // Jumping
    if (keys['Space'] && !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Ground collision
    if (player.y + player.height > GROUND_HEIGHT) {
        player.y = GROUND_HEIGHT - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // Platform collision for current level
    let currentLevel = levels[currentLevelIndex];
    currentLevel.platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 10 &&
            player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.velocityX;
        if (bullet.x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    let currentLevel = levels[currentLevelIndex];
    currentLevel.enemies.forEach(enemy => {
        enemy.x += enemy.direction * enemy.speed;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }
    });
}

function checkCollisions() {
    let currentLevel = levels[currentLevelIndex];
    
    // Check coin collisions
    currentLevel.coins.forEach(coin => {
        if (!coin.collected && 
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            player.score += 10;
        }
    });
    
    // Check if all coins collected
    if (currentLevel.coins.every(coin => coin.collected)) {
        if (currentLevelIndex < levels.length - 1) {
            alert("Level Complete! Moving to next level.");
            nextLevel();
            return;
        } else {
            alert("Congratulations! You've completed the game.");
            resetGame();
            return;
        }
    }
    
    // Check enemy collisions
    currentLevel.enemies.forEach((enemy, enemyIndex) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            // If player is falling from above, defeat enemy
            if (player.velocityY > 0 && (player.y + player.height) < (enemy.y + enemy.height / 2)) {
                enemy.y = canvas.height + 100; // Remove enemy off-screen
                player.velocityY = JUMP_FORCE / 1.5;
                player.score += 20;
            } else {
                alert("End Game");
                resetGame();
            }
        }
    });
    
    // Check bullet collisions with enemies
    for (let i = currentLevel.enemies.length - 1; i >= 0; i--) {
        let enemy = currentLevel.enemies[i];
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                currentLevel.enemies.splice(i, 1);
                bullets.splice(bulletIndex, 1);
                player.score += 20;
            }
        });
    }
}

function draw() {
    // Draw background gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_HEIGHT, canvas.width, canvas.height - GROUND_HEIGHT);
    
    // Draw platforms
    let currentLevel = levels[currentLevelIndex];
    ctx.fillStyle = '#8B4513';
    currentLevel.platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw coins
    ctx.fillStyle = 'gold';
    currentLevel.coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, COIN_SIZE/2, 0, 2*Math.PI);
            ctx.fill();
        }
    });
    
    // Draw enemies
    ctx.fillStyle = 'red';
    currentLevel.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw bullets
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw HUD
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + player.score, 10, 30);
    ctx.fillText('Lives: ' + player.lives, 10, 60);
    ctx.fillText('Level: ' + currentLevel.level, canvas.width - 120, 30);
    if (levels[currentLevelIndex].hasGun) {
        ctx.fillText('Gun: Equipped (Press F to shoot)', canvas.width - 300, 60);
    }
}

function nextLevel() {
    currentLevelIndex++;
    loadLevel(currentLevelIndex);
}

function loadLevel(index) {
    let level = levels[index];
    // Reset player position
    player.x = 50;
    player.y = GROUND_HEIGHT - player.height;
    // Reset bullets
    bullets = [];
}

function resetGame() {
    currentLevelIndex = 0;
    player.score = 0;
    player.lives = 3;
    initializeLevels();
    loadLevel(currentLevelIndex);
}

// Start the game
resetGame();
gameLoop();