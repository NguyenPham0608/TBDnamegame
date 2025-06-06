export default class Projectile {
    constructor(x, y, direction, speed, game) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.game = game;
        this.rotate = 0
        this.img = new Image()
        this.img.src = "img/enemy.svg"
    }
    update() {
        this.rotate += 10
        this.x += Math.sin(this.direction) * this.speed;
        this.y += Math.cos(this.direction) * this.speed;
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