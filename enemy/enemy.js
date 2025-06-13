import Projectile from "../projectile.js";
import Particle from "../particle.js";
export default class Enemy {
    constructor(x, y, width, height, speed, color, game) {
        this.x = x;
        this.y = y;
        this.sx = 0;
        this.sy = 0;
        this.dx = 0;
        this.dy = 0;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.game = game;
        this.hitbox = { left: this.x, top: this.y, right: this.x + this.width, bottom: this.y + this.height };
        this.brightness = 100;
        this.health = 100;
        this.timeleft = -1;
        this.distance = 0;
        this.enemyPositions = [];
        this.img = new Image();
        this.img.src = "img/kid.svg";
        this.width = 70 / 2;
        this.height = 100 / 2;
        this.bounce = getRandomArbitrary(0, 360);
        this.orbitDist = getRandomArbitrary(50, 200);
        this.id = this.game.enemies.length;
        this.targetNx = 0;
        this.targetNy = 0;
        this.snx = 0;
        this.sny = 0;
        this.bestDir = 0;
        this.speed = getRandomArbitrary(1, 3);
        this.player = this.game.player;
        this.avoidDist = 0;
        this.z = 0;
        this.fireTime = -1;
        this.directions = [];
        this.return = false;
        this.strokestyle = "blue";
        this.spawnX = this.x;
        this.spawnY = this.y;
        this.provoked = false; // Initialize provoked state
    }
    particleExplosion() {
        for (let i = 0; i < 50; i++) {
            this.game.particles.push(new Particle(this.x, this.y, "explosion", this.game));
        }
        this.game.camera.screenShake(8);
    }

    update(world) {
        this.fireTime--;
        this.timeleft--;
        if (this.timeleft == 0) {
            this.particleExplosion();
            this.kill();
        }
        const random = getRandomArbitrary(0, 300);
        if (random < 1) {
            this.fireTime = 30;
        }

        if (this.fireTime == 0) {
            this.fire(5, 10, getRandomArbitrary(50, 100));
        } else if (this.fireTime >= 0) {
            this.img.src = "img/kidSpit.svg";
        } else {
            this.img.src = "img/kid.svg";
        }
        this.targetNx = this.player.x - this.x;
        this.targetNy = this.player.y - this.y;
        this.distance = Math.hypot(this.targetNx, this.targetNy);
        if (this.distance > 0) { // Prevent division by zero
            this.targetNx /= this.distance;
            this.targetNy /= this.distance;
        }

        // Check if player is within 300px of spawn point to provoke
        const playerToSpawnDx = this.player.x - this.spawnX;
        const playerToSpawnDy = this.player.y - this.spawnY;
        const playerToSpawnDist = Math.hypot(playerToSpawnDx, playerToSpawnDy);
        if (!this.provoked && playerToSpawnDist < 300) {
            this.provoked = true;
        }

        this.findBestDirection(30);
        this.moveWithMomentum(0.05, Math.sin(this.bestDir), Math.cos(this.bestDir));
        this.bounce += 0.2;
        this.z = Math.abs(8 * Math.sin(this.bounce));
        this.hitbox = { left: this.x, top: this.y + this.z, right: this.x + this.width, bottom: this.y + this.z + this.height };
    }
    fire(speed, damage, accuracy) {
        const camera = this.game.camera;
        const player = this.player;
        const dx = ((player.x - camera.x) - (this.x - camera.x));
        const dy = ((player.y - camera.y) - (this.y - camera.y));
        const aimAngle = Math.atan2(dy, dx) + ((4 * Math.PI) * ((1 / accuracy) - 1 / 100));
        this.game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, aimAngle, speed, damage, "enemyBomb", this.game));
    }
    findBestDirection(directions) {
        const spawnDx = this.spawnX - this.x;
        const spawnDy = this.spawnY - this.y;
        const spawnDist = Math.hypot(spawnDx, spawnDy);
        let toSpawnNx = 0;
        let toSpawnNy = 0;
        if (spawnDist > 0) {
            toSpawnNx = spawnDx / spawnDist;
            toSpawnNy = spawnDy / spawnDist;
        }

        let bestScore = -Infinity;
        let dir = 0;
        for (let i = 0; i < directions; i++) {
            const dirNx = Math.sin(dir);
            const dirNy = Math.cos(dir);
            this.return = false;
            let score = 0;

            if (this.provoked) {
                // Chase player freely, ignoring bounds
                score = (dirNx * this.targetNx) + (dirNy * this.targetNy);
                if (this.distance < this.orbitDist) {
                    score = 1 - Math.abs(score);
                    score += score * ((this.snx * dirNx) + (this.sny * dirNy));
                }
            } else {
                // Meander within 300px bounds
                if (spawnDist > 250) {
                    const pullStrength = Math.min((spawnDist - 250) / 50, 1);
                    score = pullStrength * ((dirNx * toSpawnNx) + (dirNy * toSpawnNy));
                } else {
                    score = getRandomArbitrary(-0.5, 0.5);
                }
            }

            this.checkIfDirBlocked(dirNx, dirNy);
            if (!this.return) {
                if (score > bestScore) {
                    bestScore = score;
                    this.bestDir = dir;
                }
            }
            if (this.avoidDist > 0) {
                this.strokestyle = "red";
            } else {
                this.strokestyle = "blue";
            }
            dir += Math.PI * 2 / directions;
        }
    }
    checkIfDirBlocked(dirNx, dirNy) {
        const enemies = this.game.enemies;
        let avoidDx = 0;
        let avoidDy = 0;

        for (let i = 0; i < enemies.length; i++) {
            if (i !== this.id) {
                avoidDx = enemies[i].x;
                avoidDy = enemies[i].y;
                this.avoidDist = 0;
                if (avoidDx) {
                    avoidDx = avoidDx - this.x;
                    avoidDy = avoidDy - this.y;
                    this.avoidDist = Math.hypot(avoidDx, avoidDy);
                    if (this.avoidDist < 55) {
                        this.avoidDist = ((avoidDx * dirNx) + (avoidDy * dirNy)) / this.avoidDist;
                        if (this.avoidDist > 0.7) {
                            this.return = true;
                            return;
                        }
                    }
                }
            }
        }
        this.avoidDist = null;
    }
    moveWithMomentum(percent, nx, ny) {
        this.snx += (nx - this.snx) * percent;
        this.sny += (ny - this.sny) * percent;
        this.perspective = this.x += this.snx * this.speed * 60 * this.game.deltaTime;
        this.y += this.sny * this.speed * 60 * this.game.deltaTime;
    }
    drawLineFrom(start, end, dirNx, dirNy) {
        const game = this.game;
        const ctx = game.ctx;
    }

    render(ctx, camera) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.spawnX - camera.x, this.spawnY - camera.y, 300, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.save();
        this.brightness += 0.1 * (100 - this.brightness);

        if (this.img) {
            ctx.drawImage(this.img, this.x - camera.x, this.y + this.z - camera.y, 70 / 2, 100 / 2);
        } else {
            ctx.fillRect(this.x - camera.x, (this.y + this.z) - camera.y, this.width, this.height);
        }
        ctx.fillStyle = "red";

        const game = this.game;
        this.directions = [];
        ctx.restore();
    }
    hit() {
        this.brightness = 900;
        this.health -= 20;
        this.player.sword.totalDamage += 20;
        if (this.game.player.sword.attackDir) {
            this.sx = 10 * Math.sin(this.game.player.sword.attackDir - Math.PI / 2);
            this.sy = -10 * Math.cos(this.game.player.sword.attackDir - Math.PI / 2);
        }
        if (this.health <= 0) {
            if (this.timeleft < 0) {
                this.timeleft = 10;
            }
            this.brightness = 0;
        }
    }
    kill() {
        this.game.enemies.splice(this.game.enemies.indexOf(this), 1);
    }
}