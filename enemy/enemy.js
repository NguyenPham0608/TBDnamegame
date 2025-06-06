import Projectile from "../projectile.js";
export default class Enemy {
    constructor(x, y, width, height, speed, color, game) {
        this.x = x;
        this.y = y;
        this.sx = 0
        this.sy = 0
        this.dx = 0
        this.dy = 0
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.game = game;
        this.hitbox = { left: this.x, top: this.y, right: this.x + this.width, bottom: this.y + this.height };
        this.brightness = 100;
        this.health = 100
        this.timeleft = -1
        this.distance = 0
        this.enemyPositions = []
        this.img = new Image()
        this.img.src = "img/kid.svg"
        this.width = 70 / 2
        this.height = 100 / 2
        this.bounce = getRandomArbitrary(0, 360)
        this.orbitDist = getRandomArbitrary(50, 200)
        this.id = this.game.enemies.length
        this.targetNx = 0
        this.targetNy = 0
        this.snx = 0
        this.sny = 0
        this.bestDir = 0
        this.speed = getRandomArbitrary(1, 3)
        this.player = this.game.player
        this.avoidDist = 0
        this.z = 0
        this.fireTime = -1
    }

    update(world) {
        this.fireTime--
        const random = getRandomArbitrary(0, 300)
        if (random < 1) {
            this.fireTime = 30
        }

        if (this.fireTime == 0) {
            this.fire(5, 10)
        } else if (this.fireTime >= 0) {
            this.img.src = "img/kidSpit.svg"
        } else {
            this.img.src = "img/kid.svg"
        }
        this.targetNx = this.player.x - this.x
        this.targetNy = this.player.y - this.y
        this.distance = Math.hypot(this.targetNx, this.targetNy)
        this.targetNx /= this.distance
        this.targetNy /= this.distance

        this.findBestDirection(52)
        this.moveWithMomentum(0.2, Math.sin(this.bestDir), Math.cos(this.bestDir))
        this.bounce += 0.2
        this.z = Math.abs(8 * Math.sin(this.bounce))
        console.log(Math.sin(this.bestDir))
        this.hitbox = { left: this.x, top: this.y + this.z, right: this.x + this.width, bottom: this.y + this.z + this.height };

    }
    fire(speed, damage) {
        this.game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, Math.atan2((this.player.y - this.y) - this.game.camera.y, (this.player.x - this.x) - this.game.camera.x), speed, damage, this.game))
    }
    findBestDirection(directions) {
        let bestScore = null
        let score = 0
        let dir = 0
        for (let i = 0; i < directions; i++) {
            const dirNx = Math.sin(dir)
            const dirNy = Math.cos(dir)
            score = (dirNx * this.targetNx) + (dirNy * this.targetNy)
            if (this.distance < this.orbitDist) {
                score = 1 - (Math.abs(score))
                score += score * ((this.snx * dirNx) + (this.sny * dirNy))
            }
            this.checkIfDirBlocked(dirNx, dirNy)
            if (this.avoidDist) {

            }
            if (score > bestScore) {
                bestScore = score
                this.bestDir = dir
            }
            // this.drawLineFrom(30, 45 + (score * 15), dirNx, dirNy)
            dir += Math.PI * 2 / directions
        }
    }
    checkIfDirBlocked(dirNx, dirNy) {
        const enemies = this.game.enemies
        let avoidDx = 0
        let avoidDy = 0

        for (let i = 0; i < enemies.length; i++) {
            if (i !== this.id) {
                avoidDx = enemies[i].x
                avoidDy = enemies[i].y
                this.avoidDist = 0
                if (avoidDx) {
                    avoidDx = avoidDx - this.x
                    avoidDy = avoidDy - this.y
                    this.avoidDist = Math.hypot(avoidDx, avoidDy)
                    if (this.avoidDist < 55) {
                        this.avoidDist = ((avoidDx * dirNx) + (avoidDy * dirNy)) / this.avoidDist
                        if (this.avoidDist > 0.7) {
                            return
                        }
                    }
                }
            }
        }
        this.avoidDist = null
    }
    moveWithMomentum(percent, nx, ny) {
        this.snx += (nx - this.snx) * percent
        this.sny += (ny - this.sny) * percent
        this.x += this.snx * this.speed
        this.y += this.sny * this.speed
        // this.x = 0
        // this.y = 0
    }
    drawLineFrom(start, end, dirNx, dirNy) {
        const game = this.game
        const ctx = game.ctx
        console.log(start, end, dirNx, dirNy)
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.moveTo((this.x - game.camera.x) + (start * convertAngle(dirNx, "deg")), (this.y - game.camera.y) + (start * convertAngle(dirNy, "deg")))
        ctx.lineTo((this.x - game.camera.x) + (end * convertAngle(dirNx, "deg")), (this.y - game.camera.y) + (end * convertAngle(dirNy, "deg")))
        ctx.stroke()
    }

    render(ctx, camera) {
        ctx.save();
        this.brightness += 0.1 * (100 - this.brightness)

        ctx.filter = `brightness(${this.brightness}%)`;

        if (this.img) {
            ctx.drawImage(this.img, this.x - camera.x, this.y + this.z - camera.y, this.width, this.height);
        } else {
            ctx.fillRect(this.x - camera.x, (this.y + this.z) - camera.y, this.width, this.height);

        }
        ctx.restore();
    }
    hit() {
        this.brightness = 900;
        this.game.camera.screenShake(2);
        this.health -= 20
        if (this.game.player.sword.attackDir) {
            this.sx = 10 * Math.sin(this.game.player.sword.attackDir - Math.PI / 2)
            this.sy = -10 * Math.cos(this.game.player.sword.attackDir - Math.PI / 2)
        }
        if (this.health <= 0) {
            this.timeleft = 100
            this.brightness = 0
        }
    }
    kill() {
        this.game.enemies.splice(this.game.enemies.indexOf(this), 1)
    }

}