export default class Particle {
    constructor(startX, startY, type, game) {
        this.game = game
        this.x = startX;
        this.y = startY;
        this.sx = 0
        this.sy = 0
        this.type = type
        if (this.type == "explosion") {
            this.sx = getRandomArbitrary(-4, 4)
            this.sy = getRandomArbitrary(-4, 4)
        }
    }
    update() {
        if (this.type == "explosion") {
            this.sy += 0.1
            this.sx *= 0.97
            this.sy *= 0.97
            this.x += this.sx
            this.y += this.sy
        }
    }
    render(ctx, camera) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x - camera.x, this.y - camera.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}