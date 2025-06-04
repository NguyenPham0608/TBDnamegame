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
        this.img = new Image();
        this.img.src = "img/kid.svg";
        this.width = 26 * 2;
        this.height = 39 * 2
        console.log(this.img)
    }

    update(input, world) {
        if (input.keys.ArrowUp || input.keys.KeyW) this.sy -= 1;
        if (input.keys.ArrowDown || input.keys.KeyS) this.sy += 1;
        if (input.keys.ArrowLeft || input.keys.KeyA) this.sx -= 1;
        if (input.keys.ArrowRight || input.keys.KeyD) this.sx += 1;
        this.sx *= 0.9;
        this.sy *= 0.9;
        this.x += this.sx * this.speed;
        this.y += this.sy * this.speed;

        // Update sword
        this.sword.update(input);
    }

    render(ctx, camera, input) {
        ctx.fillStyle = this.color;
        // ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        ctx.drawImage(this.img, this.x - camera.x, this.y - camera.y, this.width, this.height);
        // Render sword
        this.sword.render(ctx, camera, input);
    }
}