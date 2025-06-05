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
        this.img.src = "img/enemy.svg"
        this.width = this.img.width / 2
        this.height = this.img.height / 2
    }

    update(world) {
        this.hitbox = { left: this.x, top: this.y, right: this.x + this.width, bottom: this.y + this.height };

        this.dx = this.game.player.x - this.x
        this.dy = this.game.player.y - this.y
        this.distance = Math.hypot(this.dx, this.dy)
        this.angle = Math.atan2(this.dy, this.dx)
        this.sx += Math.cos(this.angle) / 4
        this.sy += Math.sin(this.angle) / 4
        if (this.timeleft >= 0) {
            this.timeleft--
            this.sy -= 0.3
            if (this.timeleft == 0) {
                this.kill()
            }
        }
        this.x += this.sx
        this.y += this.sy
        this.sx *= 0.9
        this.sy *= 0.9
    }

    render(ctx, camera) {
        ctx.save();
        this.brightness += 0.1 * (100 - this.brightness)

        ctx.filter = `brightness(${this.brightness}%)`;

        ctx.drawImage(this.img, this.x - camera.x, this.y - camera.y, this.width, this.height);
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