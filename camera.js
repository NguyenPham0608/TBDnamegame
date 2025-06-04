export default class Camera {
    constructor(width, height, game) {
        this.x = 0;
        this.y = 0;
        this.realX = 0;
        this.realY = 0;
        this.width = width;
        this.height = height;
        this.game = game;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    update(player, world) {
        this.realX += 0.1 * ((player.x - this.width / 2) - this.realX);
        this.realY += 0.1 * ((player.y - this.height / 2) - this.realY);
        this.realX = Math.max(0, Math.min(this.realX, world.width - this.width));
        this.realY = Math.max(0, Math.min(this.realY, world.height - this.height));
        this.x = this.realX + this.shakeX;
        this.y = this.realY + this.shakeY;
        this.shakeX = this.shakeX * -0.65
        this.shakeY = this.shakeY * -0.65
        console.log(this.shakeX, this.shakeY)
    }
    screenShake(power) {
        this.shakeY = getRandomArbitrary(-180, 181)
        this.shakeX = power * Math.sin(this.shakeY)
        this.shakeY = power * Math.cos(this.shakeX)

    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

