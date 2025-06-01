import Player from './player.js';
import Camera from './camera.js';
import InputHandler from './inputs.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.world = {
            width: 2000,
            height: 2000
        };

        this.player = new Player(400, 300, 32, 32, 0.5, '#ff0000', this);
        this.camera = new Camera(this.canvas.width, this.canvas.height, this);
        this.input = new InputHandler();
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'tile024.png';
        this.tileSize = 32; // Assume bk.png is 256x256; adjust as needed
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate the range of tiles to draw based on camera position
        const tileSize = this.tileSize;
        const startX = Math.floor(this.camera.x / tileSize) * tileSize;
        const startY = Math.floor(this.camera.y / tileSize) * tileSize;
        const endX = Math.ceil((this.camera.x + this.canvas.width) / tileSize) * tileSize;
        const endY = Math.ceil((this.camera.y + this.canvas.height) / tileSize) * tileSize;

        // Draw tiled background
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

        // Draw player
        this.player.render(this.ctx, this.camera);
    }

    update() {
        this.player.update(this.input, this.world);
        this.camera.update(this.player, this.world);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.backgroundImage.onload = () => {
            this.gameLoop();
        };
        this.backgroundImage.onerror = () => {
            console.warn('Background image failed to load. Using fallback color.');
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.gameLoop();
        };
    }
}

// Start the game
const game = new Game();
game.start();