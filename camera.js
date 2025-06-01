export default class Camera {
    constructor(width, height, game) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    update(player, world) {
        this.x += 0.1 * ((player.x - this.width / 2) - this.x);
        this.y += 0.1 * ((player.y - this.height / 2) - this.y);
        this.x = Math.max(0, Math.min(this.x, world.width - this.width));
        this.y = Math.max(0, Math.min(this.y, world.height - this.height));
    }
}