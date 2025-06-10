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
            width: 2048,
            height: 2048
        };

        this.tileSize = 32;
        this.tileImages = [];
        for (let i = 0; i < 13; i++) {
            let img = new Image();
            img.src = `img/tiles/groundTiles/tile${i}.png`;
            this.tileImages.push(img);
        }

        // Initialize tileData as a 3D array: 3 layers, each 64x64
        this.tileData = [
            new Array(64).fill().map(() => new Array(64).fill(0)), // Layer 0: default tiles
            new Array(64).fill().map(() => new Array(64).fill(0)), // Layer 1: empty
            new Array(64).fill().map(() => new Array(64).fill(0))  // Layer 2: empty
        ];

        this.tileRecipes = [
            [],
            ['0110', "0100"],
            ["0011", "0011", "0001"],
            ["1100"],
            ["1001"],
            ["1110"],
            ["1101", "1000"],
            ["0111", "0101", "0000", "0010"],
            ["1011"],
            ["1111", "1010"],
            [],
            [],
            [],
        ];
        this.tileType = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1
        ];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];

        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(getRandomArbitrary(0, this.world.width / 2), getRandomArbitrary(0, this.world.height / 2), 32, 32, 1, '#ff0000', this));
        }
        this.player = new Player(400, 300, 32, 32, 0.5, '#ff0000', this);
        this.camera = new Camera(this.canvas.width, this.canvas.height, this);
        this.input = new InputHandler(this.canvas);

        this.editorMode = false;
        this.selectedTileIndex = 1;
        this.placeEnemyMode = false;
        this.prevKeyE = false;
        this.prevKeyP = false;
        this.prevKeyS = false;
        this.prevKeyL = false;
        this.prevMouseDown = false;
        this.prevDigitKeys = {};
        for (let i = 1; i <= 9; i++) {
            this.prevDigitKeys[`Digit${i}`] = false;
        }

        this.lastTime = performance.now();

        const defaultLevelCode = JSON.stringify({ tiles: this.tileData, enemies: [] });
        this.load(defaultLevelCode);
        this.auto = false;
        this.recipe = null;
        this.time = 0;
        window.game = this;
        this.nextTile = 0;

        // Layer slider setup
        this.currentLayer = 0;
        this.layerSlider = document.getElementById('layer');
        if (this.layerSlider) {
            this.layerSlider.addEventListener('input', () => {
                this.currentLayer = parseInt(this.layerSlider.value);
                document.getElementById('layerValue').innerText = this.currentLayer;
            });
            // Set initial value
            this.currentLayer = parseInt(this.layerSlider.value);
            document.getElementById('layerValue').innerText = this.currentLayer;
        } else {
            console.error("Layer slider not found");
        }
    }

    save() {
        const levelData = {
            tiles: this.tileData,
            enemies: this.enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height,
                speed: enemy.speed,
                color: enemy.color
            }))
        };
        return JSON.stringify(levelData);
    }

    load(levelString) {
        try {
            const parsedData = JSON.parse(levelString);
            if (Array.isArray(parsedData.tiles)) {
                if (parsedData.tiles.length === 3 &&
                    parsedData.tiles.every(layer => Array.isArray(layer) &&
                        layer.length === 64 &&
                        layer.every(row => Array.isArray(row) &&
                            row.length === 64 &&
                            row.every(cell => Number.isInteger(cell) && cell >= -1 && cell < 12)))) {
                    this.tileData = parsedData.tiles.map(layer => layer.map(row => row.slice()));
                } else if (parsedData.tiles.length === 64 &&
                    parsedData.tiles.every(row => Array.isArray(row) &&
                        row.length === 64 &&
                        row.every(cell => Number.isInteger(cell) && cell >= 0 && cell < 12))) {
                    // Legacy 2D format: assign to layer 0, others empty
                    this.tileData = [
                        parsedData.tiles.map(row => row.slice()),
                        new Array(64).fill().map(() => new Array(64).fill(-1)),
                        new Array(64).fill().map(() => new Array(64).fill(-1))
                    ];
                } else {
                    console.error("Invalid tile data: must be a 64x64 array or 3 layers of 64x64 arrays with integers -1 to 11");
                    return;
                }
                // Load enemies
                if (Array.isArray(parsedData.enemies)) {
                    this.enemies = parsedData.enemies.map(data =>
                        new Enemy(data.x, data.y, data.width || 32, data.height || 32, data.speed || 1, data.color || '#ff0000', this)
                    );
                } else {
                    console.error("Invalid enemy data: must be an array");
                    this.enemies = [];
                }
            } else {
                console.error("Invalid tile data");
                return;
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
        this.ctx.fillStyle = '#52ad34';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const tileSize = this.tileSize;
        const startX = Math.floor(this.camera.x / tileSize) * tileSize;
        const startY = Math.floor(this.camera.y / tileSize) * tileSize;
        const endX = Math.ceil((this.camera.x + this.canvas.width) / tileSize) * tileSize;
        const endY = Math.ceil((this.camera.y + this.canvas.height) / tileSize) * tileSize;

        for (let x = startX; x < endX; x += tileSize) {
            for (let y = startY; y < endY; y += tileSize) {
                const tileGridX = Math.floor(x / tileSize);
                const tileGridY = Math.floor(y / tileSize);
                if (tileGridX >= 0 && tileGridX < 64 && tileGridY >= 0 && tileGridY < 64) {
                    // Draw all layers
                    for (let layer = 0; layer < 3; layer++) {
                        const tileIndex = this.tileData[layer][tileGridY][tileGridX];
                        if (tileIndex >= 0 && this.tileImages[tileIndex]) {
                            this.ctx.drawImage(
                                this.tileImages[tileIndex],
                                x - this.camera.x,
                                y - this.camera.y,
                                tileSize,
                                tileSize
                            );
                        }
                    }
                } else {
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(x - this.camera.x, y - this.camera.y, tileSize, tileSize);
                }
            }
        }

        if (this.editorMode) {
            document.getElementById('log').innerText = `Editor Mode: ON, Layer: ${this.currentLayer}, ${this.placeEnemyMode ? 'Enemy Placement' : 'Tile Placement: ' + this.selectedTileIndex} (P: Toggle Mode, S: Save, L: Load)`;

            const worldMouseX = this.input.mouseX + this.camera.x;
            const worldMouseY = this.input.mouseY + this.camera.y;
            const tileGridX = Math.floor(worldMouseX / this.tileSize);
            const tileGridY = Math.floor(worldMouseY / this.tileSize);
            if (tileGridX >= 0 && tileGridX < this.tileData[0].length && tileGridY >= 0 && tileGridY < this.tileData[0].length) {
                const drawX = tileGridX * this.tileSize - this.camera.x;
                const drawY = tileGridY * this.tileSize - this.camera.y;
                if (this.placeEnemyMode) {
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.drawImage(
                        this.enemies[0]?.img || new Image(),
                        drawX,
                        drawY,
                        35,
                        50
                    );
                    this.ctx.strokeStyle = 'white';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(drawX, drawY, 35, 50);
                    this.ctx.restore();
                } else {
                    let selectedTileImg = this.tileImages[this.selectedTileIndex];
                    if (selectedTileImg) {
                        this.ctx.save();
                        this.ctx.globalAlpha = 0.8;
                        this.ctx.drawImage(selectedTileImg, drawX, drawY, this.tileSize, this.tileSize);
                        this.ctx.strokeStyle = 'white';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(drawX, drawY, this.tileSize, this.tileSize);
                        this.ctx.restore();
                    }
                }
            }

            if (!this.placeEnemyMode) {
                let previewTileImg = this.tileImages[this.selectedTileIndex];
                if (previewTileImg) {
                    this.ctx.drawImage(previewTileImg, 10, 10, 16, 16);
                    this.ctx.strokeStyle = 'white';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(10, 10, 16, 16);
                }
            } else {
                this.ctx.save();
                this.ctx.drawImage(
                    this.enemies[0]?.img || new Image(),
                    10, 10, 16, 24
                );
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(10, 10, 16, 24);
                this.ctx.restore();
            }
        } else {
            document.getElementById('log').innerText = 'Editor Mode: OFF';
        }
        this.enemies.forEach((enemy) => enemy.render(this.ctx, this.camera));
        this.player.render(this.ctx, this.camera, this.input);
        this.projectiles.forEach((projectile) => projectile.render(this.ctx, this.camera));
        this.particles.forEach((particle) => particle.render(this.ctx, this.camera));
    }

    paintTile(tileGridX, tileGridY) {
        if (tileGridX >= 0 && tileGridX < this.tileData[0][0].length && tileGridY >= 0 && tileGridY < this.tileData[0].length) {
            if (this.placeEnemyMode) {
                const enemyX = -(35 / 2) + tileGridX * this.tileSize + this.tileSize / 2;
                const enemyY = -(25) + tileGridY * this.tileSize + this.tileSize / 2;
                this.enemies.push(new Enemy(enemyX, enemyY, 32, 32, 1, '#ff0000', this));
            } else {
                const layer = this.currentLayer;
                this.tileData[layer][tileGridY][tileGridX] = this.selectedTileIndex;
                if (this.auto && layer === 0) {
                    this.fixTile(tileGridX, tileGridY);
                    this.fixTile(tileGridX, tileGridY - 1);
                    this.fixTile(tileGridX + 1, tileGridY);
                    this.fixTile(tileGridX, tileGridY + 1);
                    this.fixTile(tileGridX - 1, tileGridY);
                }
            }
        }
    }

    fixTile(tileGridX, tileGridY) {
        if (tileGridX < 0 || tileGridX >= 64 || tileGridY < 0 || tileGridY >= 64) return;
        this.recipe = "";
        this.buildRecipe(tileGridX, tileGridY - 1);
        this.buildRecipe(tileGridX + 1, tileGridY);
        this.buildRecipe(tileGridX, tileGridY + 1);
        this.buildRecipe(tileGridX - 1, tileGridY);
        let tile = this.tileData[0][tileGridY][tileGridX];
        for (let i = 0; i < 12; i++) {
            if (this.tileRecipes[i].length !== 0) {
                if (tile !== 0) {
                    for (let j = 0; j < this.tileRecipes[i].length; j++) {
                        if (this.tileRecipes[i][j].includes(this.recipe)) {
                            this.tileData[0][tileGridY][tileGridX] = i;
                            return;
                        }
                    }
                }
            }
        }
    }

    buildRecipe(tileGridX, tileGridY) {
        if (tileGridX < 0 || tileGridX >= 64 || tileGridY < 0 || tileGridY >= 64) {
            this.recipe = "" + this.recipe + 0;
            return;
        }
        const edgeTile = this.tileData[0][tileGridY][tileGridX];
        if (this.tileRecipes[edgeTile].length === 0) {
            this.recipe = "" + this.recipe + 0;
        } else {
            this.recipe = "" + this.recipe + 1;
        }
    }

    update() {
        this.time++;
        let worldX = this.input.mouseX + this.camera.x;
        let worldY = this.input.mouseY + this.camera.y;
        let tileGridX = Math.floor(worldX / this.tileSize);
        let tileGridY = Math.floor(worldY / this.tileSize);
        if (tileGridX < 0) tileGridX = 0;
        if (tileGridY < 0) tileGridY = 0;
        if (tileGridX > 63) tileGridX = 63;
        if (tileGridY > 63) tileGridY = 63;

        if (this.input.keys.KeyE && !this.prevKeyE) {
            this.editorMode = !this.editorMode;
        }
        this.prevKeyE = this.input.keys.KeyE;

        if (this.editorMode) {
            if (this.input.keys.KeyP && !this.prevKeyP) {
                this.placeEnemyMode = !this.placeEnemyMode;
            }
            if (this.input.keys.Space && !this.prevKeySpace) {
                this.auto = !this.auto;
            }
            this.prevKeySpace = this.input.keys.Space;
            this.prevKeyP = this.input.keys.KeyP;

            if (this.input.keys["Digit1"]) {
                if (this.nextTile <= 0) {
                    this.selectedTileIndex += 1;
                    if (this.selectedTileIndex > 12) {
                        this.selectedTileIndex = 1;
                    }
                    this.nextTile = 10 * (1 / (60 * this.deltaTime));
                }
            }
            this.nextTile--;

            if (this.input.keys.KeyS && !this.prevKeyS) {
                const levelCode = this.save();
                console.log('Level saved:', levelCode);
                navigator.clipboard.writeText(levelCode).then(() => {
                    console.log('Level code copied to clipboard!');
                });
            }
            this.prevKeyS = this.input.keys.KeyS;

            if (this.input.keys.KeyL && !this.prevKeyL) {
                const levelCode = prompt('Enter level code to load:');
                if (levelCode) {
                    this.load(levelCode);
                }
            }
            this.prevKeyL = this.input.keys.KeyL;

            if (!this.placeEnemyMode) {
                if (this.input.mouseDown) {
                    this.paintTile(tileGridX, tileGridY);
                }
            } else {
                if (this.input.mouseDown && !this.prevMouseDown) {
                    this.paintTile(tileGridX, tileGridY);
                    this.prevMouseDown = this.input.mouseDown;
                }
            }


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
        const checkAllLoaded = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                this.gameLoop(this.lastTime);
            }
        };
        this.tileImages.forEach((img) => {
            img.onload = checkAllLoaded;
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