import Player from './player/player.js';
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
        this.input = new InputHandler(this.canvas); // Pass canvas to InputHandler
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/tile024.png';
        this.tileSize = 32;
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

        this.player.render(this.ctx, this.camera, this.input);
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
    canvasFullScreen(canvas, ctx) {


        // Function to resize canvas to full screen
        function resizeCanvas() {
            // Save current content
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.drawImage(canvas, 0, 0);

            // Update canvas size to match window
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Redraw content, scaling to new size
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }

        // Initial resize
        resizeCanvas();

        // Resize on window resize
        window.addEventListener('resize', resizeCanvas);
    }
}

// Start the game
const game = new Game();
game.start();

