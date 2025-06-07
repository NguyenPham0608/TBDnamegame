import Player from './player/player.js';
import Camera from './camera.js';
import InputHandler from './inputs.js';
import Enemy from './enemy/enemy.js';
import Particle from './particle.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.deltaTime = 0;

        this.world = {
            width: 2048,  // 64 * 32 = 2048
            height: 2048
        };

        this.tileSize = 32;
        this.tileImages = [];
        for (let i = 0; i < 9; i++) {
            let img = new Image();
            img.src = `img/tile${i}.png`;
            this.tileImages.push(img);
        }

        this.tileData = new Array(64).fill().map(() => new Array(64).fill(0));

        this.player = new Player(400, 300, 32, 32, 0.5, '#ff0000', this);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];

        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(getRandomArbitrary(0, this.world.width / 2), getRandomArbitrary(0, this.world.height / 2), 32, 32, 1, '#ff0000', this));
        }
        this.camera = new Camera(this.canvas.width, this.canvas.height, this);
        this.input = new InputHandler(this.canvas);

        this.editorMode = false;
        this.selectedTileIndex = 0;
        this.prevKeyE = false;
        this.prevMouseDown = false;
        this.prevDigitKeys = {};
        for (let i = 1; i <= 9; i++) {
            this.prevDigitKeys[`Digit${i}`] = false;
        }
        this.prevKeyS = false; // For save
        this.prevKeyL = false; // For load

        this.lastTime = performance.now();

        const defaultLevelCode = JSON.stringify(this.tileData);
        this.load(defaultLevelCode);

        // Make game instance global
        window.game = this;
    }

    save() {
        return JSON.stringify(this.tileData);
    }

    load(levelString) {
        try {
            const parsedData = JSON.parse(levelString);
            if (Array.isArray(parsedData) &&
                parsedData.length === 64 &&
                parsedData.every(row => Array.isArray(row) &&
                    row.length === 64 &&
                    row.every(cell => Number.isInteger(cell) && cell >= 0 && cell < 9))) {
                this.tileData = parsedData.map(row => row.slice());
            } else {
                console.error("Invalid level data: must be a 64x64 array of integers between 0 and 8");
            }
        } catch (e) {
            console.error("Error parsing level data", e);
        }
    }

    computeDeltaTime(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        this.lastTime = currentTime;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const tileSize = this.tileSize;
        const startX = Math.floor(this.camera.x / tileSize) * tileSize;
        const startY = Math.floor(this.camera.y / tileSize) * tileSize;
        const endX = Math.ceil((this.camera.x + this.canvas.width) / tileSize) * tileSize;
        const endY = Math.ceil((this.camera.y + this.canvas.height) / tileSize) * tileSize;

        for (let x = startX; x < endX; x += tileSize) {
            for (let y = startY; y < endY; y += tileSize) {
                const tileGridX = Math.floor(x / tileSize);
                const tileGridY = Math.floor(y / tileSize);
                if (tileGridX >= 0 && tileGridX < this.tileData[0].length && tileGridY >= 0 && tileGridY < this.tileData.length) {
                    const tileIndex = this.tileData[tileGridY][tileGridX];
                    if (this.tileImages[tileIndex]) {
                        this.ctx.drawImage(
                            this.tileImages[tileIndex],
                            x - this.camera.x,
                            y - this.camera.y,
                            tileSize,
                            tileSize
                        );
                    } else {
                        this.ctx.fillStyle = '#000000';
                        this.ctx.fillRect(x - this.camera.x, y - this.camera.y, tileSize, tileSize);
                    }
                } else {
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(x - this.camera.x, y - this.camera.y, tileSize, tileSize);
                }
            }
        }

        this.enemies.forEach((enemy) => enemy.render(this.ctx, this.camera));
        this.player.render(this.ctx, this.camera, this.input);
        this.projectiles.forEach((projectile) => projectile.render(this.ctx, this.camera));
        this.particles.forEach((particle) => particle.render(this.ctx, this.camera));

        if (this.editorMode) {
            document.getElementById('log').innerText = `Editor Mode: ON, Selected Tile: ${this.selectedTileIndex} (S: Save, L: Load)`;
            const selectedTileImg = this.tileImages[this.selectedTileIndex];
            if (selectedTileImg) {
                this.ctx.drawImage(selectedTileImg, 10, 10, 16, 16);
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(10, 10, 16, 16);
            }

            const worldMouseX = this.input.mouseX + this.camera.x;
            const worldMouseY = this.input.mouseY + this.camera.y;
            const tileGridX = Math.floor(worldMouseX / this.tileSize);
            const tileGridY = Math.floor(worldMouseY / this.tileSize);
            if (tileGridX >= 0 && tileGridX < this.tileData[0].length && tileGridY >= 0 && tileGridY < this.tileData.length) {
                const drawX = tileGridX * this.tileSize - this.camera.x;
                const drawY = tileGridY * this.tileSize - this.camera.y;
                if (selectedTileImg) {
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.drawImage(selectedTileImg, drawX, drawY, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = 'white';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(drawX, drawY, this.tileSize, this.tileSize);
                    this.ctx.restore();
                }
            }
        } else {
            document.getElementById('log').innerText = 'Editor Mode: OFF';
        }
    }

    update() {
        if (this.input.keys.KeyE && !this.prevKeyE) {
            this.editorMode = !this.editorMode;
        }
        this.prevKeyE = this.input.keys.KeyE;

        if (this.editorMode) {
            for (let i = 1; i <= 9; i++) {
                const key = `Digit${i}`;
                if (this.input.keys[key] && !this.prevDigitKeys[key]) {
                    this.selectedTileIndex = i - 1;
                }
                this.prevDigitKeys[key] = this.input.keys[key];
            }

            // Save level with 'S' in editor mode
            if (this.input.keys.KeyS && !this.prevKeyS) {
                const levelCode = this.save();
                console.log('Level saved:', levelCode);
                navigator.clipboard.writeText(levelCode).then(() => {
                    console.log('Level code copied to clipboard!');
                });
            }
            this.prevKeyS = this.input.keys.KeyS;

            // Load level with 'L' in editor mode
            if (this.input.keys.KeyL && !this.prevKeyL) {
                const levelCode = prompt('Enter level code to load:');
                if (levelCode) {
                    this.load(levelCode);
                }
            }
            this.prevKeyL = this.input.keys.KeyL;

            if (this.input.mouseDown && !this.prevMouseDown) {
                const worldX = this.input.mouseX + this.camera.x;
                const worldY = this.input.mouseY + this.camera.y;
                const tileGridX = Math.floor(worldX / this.tileSize);
                const tileGridY = Math.floor(worldY / this.tileSize);
                if (tileGridX >= 0 && tileGridX < this.tileData[0].length && tileGridY >= 0 && tileGridY < this.tileData.length) {
                    this.tileData[tileGridY][tileGridX] = this.selectedTileIndex;
                }
            }
            this.prevMouseDown = this.input.mouseDown;

            if (this.input.keys.KeyW) this.camera.realY -= 5;
            if (this.input.keys.KeyS) this.camera.realY += 5;
            if (this.input.keys.KeyA) this.camera.realX -= 5;
            if (this.input.keys.KeyD) this.camera.realX += 5;
            this.camera.realX = Math.max(0, Math.min(this.camera.realX, this.world.width - this.camera.width));
            this.camera.realY = Math.max(0, Math.min(this.camera.realY, this.world.height - this.camera.height));
            this.camera.x = Math.round(this.camera.realX);
            this.camera.y = Math.round(this.camera.realY);
        } else {
            this.player.update(this.input, this.world, this.deltaTime);
            this.enemies.forEach((enemy) => enemy.update(this.world, this.deltaTime));
            this.camera.update(this.player, this.world, this.deltaTime);
            this.projectiles.forEach((projectile) => projectile.update());
            this.particles.forEach((particle) => particle.update());
        }
    }

    gameLoop(currentTime) {
        this.computeDeltaTime(currentTime);
        this.update();
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        let imagesLoaded = 0;
        const totalImages = this.tileImages.length;
        this.tileImages.forEach((img) => {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    this.gameLoop(this.lastTime);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
            };
        });
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

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}