export default class Projectile {
    constructor(x, y, direction, speed, damage, game) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.game = game;
        this.camera = game.camera
        this.rotate = 0
        this.img = new Image()
        this.img.src = "img/enemy.svg"
    }
    update() {
        this.rotate += 10
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        if (this.x - this.camera.x < 0 || this.x - this.camera.x > this.game.canvas.width || this.y - this.game.camera.y < 0 || this.y - this.game.camera.y > this.game.canvas.height) {
            this.delete()
        }
        const dx = this.game.player.x - this.x
        const dy = this.game.player.y - this.y
        this.distance = Math.hypot(dx, dy)
        if (this.distance < 50) {
            this.game.player.hit()
            this.delete()
        }
    }
    render(ctx, camera) {
        ctx.fillStyle = "red";
        ctx.save()
        ctx.translate(this.x - camera.x, this.y - camera.y)
        ctx.rotate(this.rotate * Math.PI / 180)
        // ctx.fillRect(-5, -5, 10, 10);
        ctx.filter = "sepia(1) saturate(4) hue-rotate(-20deg)";
        ctx.drawImage(this.img, -this.img.width / 6, -this.img.height / 6, this.img.width / 3, this.img.height / 3)
        ctx.filter = "none"
        ctx.restore()
    }
    delete() {
        this.game.projectiles.splice(this.game.projectiles.indexOf(this), 1);
    }
}