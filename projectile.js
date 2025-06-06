export default class Projectile {
    constructor(x, y, direction, speed, game) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.game = game;
    }
    update() {
        this.x += Math.sin(this.direction) * this.speed;
        this.y += Math.cos(this.direction) * this.speed;
    }
    render(ctx, camera) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x, this.y - camera.y, 10, 10);
    }
    delete() {
        this.game.projectiles.splice(this.game.projectiles.indexOf(this), 1);
    }
}