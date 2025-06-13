export default class Projectile {
    constructor(x, y, direction, speed, damage, type, game) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.game = game;
        this.camera = game.camera
        this.rotate = 0
        this.images = []
        for (let i = 0; i < 2; i++) {
            const img = new Image()
            img.src = `img/projectile/${i}.svg`
            this.images.push(img)
        }
        console.log(this.images)
        this.damage = damage
        this.type = type
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
        if (this.type == "enemyBomb") {
            ctx.fillStyle = "red";
            const image = this.images[0]
            ctx.save()
            ctx.translate(this.x - camera.x, this.y - camera.y)
            ctx.rotate(this.rotate * Math.PI / 180)
            // ctx.fillRect(-5, -5, 10, 10);
            ctx.filter = "sepia(1) saturate(4) hue-rotate(-20deg)";
            ctx.drawImage(image, -image.width / 6, -image.height / 6, image.width / 3, image.height / 3)
            ctx.filter = "none"
            ctx.restore()
        } else {

        }
    }
    delete() {
        this.game.projectiles.splice(this.game.projectiles.indexOf(this), 1);
    }
}