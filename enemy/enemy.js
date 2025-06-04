export default class Enemy {
    constructor(x, y, width, height, speed, color, game) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.game = game;
        this.hitbox = { left: this.x, top: this.y, right: this.x + this.width, bottom: this.y + this.height };
        this.brightness = 100;
    }

    update(world) {

    }
    render(ctx, camera) {
        ctx.fillStyle = this.color;
        this.brightness += 0.2 * (50 - this.brightness)
        this.drawColoredRect(this.x - camera.x, this.y - camera.y, this.width, this.height, 0, this.brightness, ctx);
    }
    hit() {
        this.brightness = 100;
        this.game.camera.screenShake(20);
    }
    drawColoredRect(x, y, width, height, hue, brightness, ctx) {

        ctx.fillStyle = `hsl(${hue}, 100%, ${brightness}%)`;
        ctx.fillRect(x, y, width, height);
    }
}