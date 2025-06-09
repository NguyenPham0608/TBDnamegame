import Projectile from "../projectile.js";
import Particle from "../particle.js";
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
        this.directions = []
        this.return = false
        this.strokestyle = "blue"
    }
    particleExplosion() {
        for (let i = 0; i < 50; i++) {
            this.game.particles.push(new Particle(this.x, this.y, "explosion", this.game))
        }
        this.game.camera.screenShake(8)
    }

    update(world) {
        // this.particleExplosion()
        this.fireTime--
        this.timeleft--
        if (this.timeleft == 0) {
            this.particleExplosion()
            this.kill()
        }
        const random = getRandomArbitrary(0, 300)
        if (random < 1) {
            this.fireTime = 30
        }

        if (this.fireTime == 0) {
            this.fire(5, 10, getRandomArbitrary(50, 100))
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

        this.findBestDirection(30)
        this.moveWithMomentum(0.05, Math.sin(this.bestDir), Math.cos(this.bestDir))
        this.bounce += 0.2
        this.z = Math.abs(8 * Math.sin(this.bounce))
        this.hitbox = { left: this.x, top: this.y + this.z, right: this.x + this.width, bottom: this.y + this.z + this.height };

    }
    fire(speed, damage, accuracy) {
        const camera = this.game.camera
        const player = this.player
        const dx = ((player.x - camera.x) - (this.x - camera.x))
        const dy = ((player.y - camera.y) - (this.y - camera.y))
        const aimAngle = Math.atan2(dy, dx) + ((4 * Math.PI) * ((1 / accuracy) - 1 / 100))
        this.game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, aimAngle, speed, damage, this.game))
    }
    findBestDirection(directions) {
        let bestScore = null
        let score = 0
        let dir = 0
        for (let i = 0; i < directions; i++) {
            const dirNx = Math.sin(dir)
            const dirNy = Math.cos(dir)
            this.return = false
            score = (dirNx * this.targetNx) + (dirNy * this.targetNy)
            if (this.distance < this.orbitDist) {
                score = 1 - (Math.abs(score))
                score += score * ((this.snx * dirNx) + (this.sny * dirNy))
            }
            this.checkIfDirBlocked(dirNx, dirNy)
            if (this.return) {
                return;
            }
            if (this.avoidDist > 0) {
                this.strokestyle = "red"
            } else {
                this.strokestyle = "blue"
            }
            if (score > bestScore) {
                bestScore = score
                this.bestDir = dir
            }
            const scoreLength = 45 + (score * 15)
            // this.directions.push({ length: scoreLength, dirNx: dirNx, dirNy: dirNy })
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
                            this.return = true
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
        this.x += this.snx * this.speed * 60 * this.game.deltaTime
        this.y += this.sny * this.speed * 60 * this.game.deltaTime
        // this.x = 0
        // this.y = 0
    }
    drawLineFrom(start, end, dirNx, dirNy) {
        const game = this.game
        const ctx = game.ctx
        // console.log(start, end, dirNx, dirNy)

    }

    render(ctx, camera) {
        ctx.save();
        this.brightness += 0.1 * (100 - this.brightness)

        // ctx.filter = `brightness(${this.brightness}%)`;

        if (this.img) {
            ctx.drawImage(this.img, this.x - camera.x, this.y + this.z - camera.y, 70 / 2, 100 / 2);
        } else {
            ctx.fillRect(this.x - camera.x, (this.y + this.z) - camera.y, this.width, this.height);

        }
        ctx.fillStyle = "red"
        // ctx.fillRect(this.x - camera.x, (this.y + this.z) - camera.y, this.width, this.height);

        const game = this.game
        // this.directions.forEach((dir) => {
        //     ctx.beginPath();
        //     ctx.strokeStyle = this.strokestyle;
        //     ctx.moveTo((this.x + this.width / 2 - game.camera.x) + (30 * dir.dirNx), (this.y + this.height / 2 - game.camera.y) + (30 * dir.dirNy))
        //     ctx.lineTo((this.x + this.width / 2 - game.camera.x) + (dir.length * dir.dirNx), (this.y + this.height / 2 - game.camera.y) + (dir.length * dir.dirNy))

        //     ctx.stroke()
        // })
        this.directions = []
        ctx.restore();
    }
    hit() {
        this.brightness = 900;
        // this.game.camera.screenShake(2);
        this.health -= 20
        if (this.game.player.sword.attackDir) {
            this.sx = 10 * Math.sin(this.game.player.sword.attackDir - Math.PI / 2)
            this.sy = -10 * Math.cos(this.game.player.sword.attackDir - Math.PI / 2)
        }
        if (this.health <= 0) {
            if (this.timeleft < 0) {
                this.timeleft = 50

            }
            this.brightness = 0
        }
    }
    kill() {
        this.game.enemies.splice(this.game.enemies.indexOf(this), 1)
    }

}