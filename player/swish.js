export default class Swish {
    constructor(sword) {
        this.frame = 0
        this.sword = sword
        this.direction = sword.attackDir
        this.x = sword.player.x
        this.y = sword.player.y
        this.img = new Image()
        this.img.src = "img/swish.svg"
        this.done = false // Flag to indicate if the Swish should be removed
        this.scale = 1.7
    }
    render(ctx, camera) {
        this.frame++
        if (this.frame == 4) {
            if (this.sword.targetDir > 0) {
                this.img.src = "img/swishcw.svg"
            } else {
                this.img.src = "img/swishccw.svg"
            }
        }
        if (this.frame > 6) {
            this.done = true // Mark for deletion
            return // Exit early to skip rendering
        }
        this.direction = this.sword.attackDir
        ctx.save()

        // Translate to the swish's position, adjusted for camera
        ctx.translate(this.x - camera.x, this.y - camera.y)

        // Rotate the context based on this.direction (in radians)
        ctx.rotate(this.direction + Math.PI)
        ctx.translate(60, 0)

        // Draw the image, offset to center it
        ctx.globalAlpha = 0.4
        ctx.drawImage(
            this.img,
            -this.img.width * this.scale / 2,
            -this.img.height * this.scale / 2,
            this.img.width * this.scale,
            this.img.height * this.scale
        )
        ctx.globalAlpha = 1

        ctx.restore()
    }
}