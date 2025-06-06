import Player from './player/player.js';
import Camera from './camera.js';
import InputHandler from './inputs.js';
import Enemy from './enemy/enemy.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.deltaTime = 0;


        this.world = {
            width: 2000,
            height: 2000
        };

        this.player = new Player(400, 300, 32, 32, 0.5, '#ff0000', this);
        this.enemies = [];
        this.projectiles = [];

        for (let i = 0; i < 10; i++) {
            this.enemies.push(new Enemy(getRandomArbitrary(0, this.world.width / 2), getRandomArbitrary(0, this.world.height / 2), 32, 32, 1, '#ff0000', this));
        }
        this.camera = new Camera(this.canvas.width, this.canvas.height, this);
        this.input = new InputHandler(this.canvas);
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/tile024.png';
        this.tileSize = 32;
        this.lastTime = performance.now();
    }

    computeDeltaTime(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert ms to seconds
        this.deltaTime = Math.min(this.deltaTime, 0.1); // Cap at 100ms to prevent large jumps
        this.lastTime = currentTime;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const tileSize = this.tileSize;
        const startX = Math.floor(this.camera.x / tileSize) * tileSize;
        const startY = Math.floor(this.camera.y / tileSize) * tileSize;
        const endX = Math.ceil((this.camera.x + this.canvas.width) / tileSize) * tileSize;
        const endY = Math.ceil((this.camera.y + this.canvas.height) / tileSize) * tileSize;

        for (let x = startX; x <= endX; x += tileSize) {
            for (let y = startY; y <= endY; y += tileSize) {
                this.ctx.drawImage(
                    this.backgroundImage,
                    x - this.camera.x,
                    y - this.camera.y,
                    tileSize,
                    tileSize
                );
            }
        }

        this.enemies.forEach((enemy) => enemy.render(this.ctx, this.camera));
        this.player.render(this.ctx, this.camera, this.input);
        this.projectiles.forEach((projectile) => projectile.render(this.ctx, this.camera));
    }

    update() {
        this.player.update(this.input, this.world, this.deltaTime);
        this.enemies.forEach((enemy) => enemy.update(this.world, this.deltaTime));
        this.camera.update(this.player, this.world, this.deltaTime);
        this.projectiles.forEach((projectile) => projectile.update());
    }

    gameLoop(currentTime) {
        this.computeDeltaTime(currentTime);
        this.update();
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.backgroundImage.onload = () => {
            this.gameLoop(this.lastTime);
        };
        this.backgroundImage.onerror = () => {
            console.warn('Background image failed to load. Using fallback color.');
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.gameLoop(this.lastTime);
        };
    }

    canvasFullScreen(canvas, ctx) {
        function resizeCanvas() {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.drawImage(canvas, 0, 0);

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
}

const game = new Game();
game.start();