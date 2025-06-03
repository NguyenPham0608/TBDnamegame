import Sword from './sword.js';

export default class Player {
    constructor(x, y, width, height, speed, color, game) {
        this.x = x;
        this.y = y;
        this.sx = 0;
        this.sy = 0;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.game = game;
        this.sword = new Sword(this); // Initialize sword
    }

    update(input, world) {
        if (input.keys.ArrowUp) this.sy -= 1;
        if (input.keys.ArrowDown) this.sy += 1;
        if (input.keys.ArrowLeft) this.sx -= 1;
        if (input.keys.ArrowRight) this.sx += 1;
        this.sx *= 0.9;
        this.sy *= 0.9;
        this.x += this.sx * this.speed;
        this.y += this.sy * this.speed;

        // Update sword
        this.sword.update(input);
    }

    render(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        // Render sword
        this.sword.render(ctx, camera);
    }
}