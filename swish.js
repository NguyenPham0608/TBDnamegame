export default class Swish {
    constructor(sword) {
        this.frame = 0
        this.sword = sword
        this.direction = sword.attackDir
        this.x = sword.player.x
        this.y = sword.player.y
        this.img = new Image()
        this.img.src = "swish.svg"
        this.done = false // Flag to indicate if the Swish should be removed
    }
    render(ctx, camera) {
        this.frame++
        if (this.frame == 3) {
            if (this.sword.targetDir > 0) {
                this.img.src = "swishcw.svg"
            } else {
                this.img.src = "swishccw.svg"
            }
        }
        if (this.frame > 6) {
            this.done = true // Mark for deletion
            return // Exit early to skip rendering
        }
        this.direction = this.sword.attackDir
        ctx.save()
        console.log(this.x + this.img.width / 2 - window.innerWidth / 2 - camera.x, this.y + this.img.height / 2 - window.innerHeight / 2 - camera.y)
        ctx.translate(this.x - camera.x + this.img.width / 2, this.y - camera.y + this.img.height / 2)
        ctx.translate(40, 0)
        ctx.drawImage(this.img, this.sword.player.x - window.innerWidth / 2, this.sword.player.y - window.innerHeight / 2)
        ctx.restore()
    }
}