 // Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 350;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const PLATFORM_HEIGHT = 20;
const COIN_SIZE = 20;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;

// Player object
const player = {
    x: 50,
    y: GROUND_HEIGHT - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    score: 0,
    lives: 3
};

// Platforms
const platforms = [
    { x: 200, y: 250, width: 100, height: PLATFORM_HEIGHT },
    { x: 400, y: 200, width: 100, height: PLATFORM_HEIGHT },
    { x: 600, y: 250, width: 100, height: PLATFORM_HEIGHT }
];

// Coins
const coins = [
    { x: 250, y: 200, width: COIN_SIZE, height: COIN_SIZE, collected: false },
    { x: 450, y: 150, width: COIN_SIZE, height: COIN_SIZE, collected: false },
    { x: 650, y: 200, width: COIN_SIZE, height: COIN_SIZE, collected: false },
    { x: 350, y: 300, width: COIN_SIZE, height: COIN_SIZE, collected: false }
];

// Enemies
const enemies = [
    { x: 300, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: 1, speed: 2 },
    { x: 500, y: GROUND_HEIGHT - ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, direction: -1, speed: 2 }
];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player
    updatePlayer();
    
    // Update enemies
    updateEnemies();
    
    // Check collisions
    checkCollisions();
    
    // Draw game elements
    drawGame();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.velocityX = -5;
    } else if (keys['ArrowRight']) {
        player.velocityX = 5;
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
    
    // Check boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Check if on ground
    if (player.y + player.height > GROUND_HEIGHT) {
        player.y = GROUND_HEIGHT - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // Check if on platform
    let onPlatform = false;
    platforms.forEach(platform => {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 10 &&
            player.velocityY > 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onPlatform = true;
        }
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.direction * enemy.speed;
        
        // Reverse direction at canvas boundaries
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }
    });
}

function checkCollisions() {
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected && 
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            player.score += 10;
        }
    });
    
    // Check enemy collisions
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Check if player is jumping on enemy
            if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                // Remove enemy (in a real game, you might want to respawn it)
                enemy.y = canvas.height + 100; // Move it off-screen
                player.velocityY = JUMP_FORCE / 1.5; // Bounce
                player.score += 20;
            } else {
                // Player loses a life
                player.lives--;
                player.x = 50;
                player.y = GROUND_HEIGHT - player.height;
                
                if (player.lives <= 0) {
                    alert("Game Over! Your score: " + player.score);
                    resetGame();
                }
            }
        }
    });
}

function drawGame() {
    // Draw sky background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_HEIGHT, canvas.width, canvas.height - GROUND_HEIGHT);
    
    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GROUND_HEIGHT, canvas.width, 10);
    
    // Draw platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw coins
    ctx.fillStyle = '#FFD700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw enemies
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
        if (enemy.y < canvas.height) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
    
    // Draw player
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw score and lives
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + player.score, 10, 30);
    ctx.fillText('Lives: ' + player.lives, 10, 60);
}

function resetGame() {
    player.x = 50;
    player.y = GROUND_HEIGHT - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.score = 0;
    player.lives = 3;
    
    coins.forEach(coin => {
        coin.collected = false;
    });
    
    enemies.forEach((enemy, index) => {
        enemy.x = 300 + index * 200;
        enemy.y = GROUND_HEIGHT - ENEMY_HEIGHT;
        enemy.direction = index % 2 === 0 ? 1 : -1;
    });
}

// Start the game
gameLoop();