import Swish from "./swish.js";
export default class Sword {
    constructor(player) {
        this.player = player;
        this.armLength = 20; // Length of the arm from player to wrist
        this.armAngle = 0;
        this.wristRotation = 0;
        this.swinging = false;
        this.swingSpeed = 0; // Adjust for swing speed
        this.image = new Image();
        this.image.src = 'img/sword.svg'; // Assumes a sword image exists
        this.startSwingAngle = 0
        this.armLength = 20
        this.targetDir = -150
        this.swingDelay = 0
        this.swingDir = 150
        this.attackDir = 0
        this.mouseAngle = 0
        this.direction = 0
        this.mouse = { x: 0, y: 0 }
        this.effects = []
        this.span = document.getElementById("log")
    }

    update(input) {
        const worldMouseX = input.mouseX + this.player.game.camera.x;
        const worldMouseY = input.mouseY + this.player.game.camera.y;
        this.mouse = { x: input.mouseX - this.player.game.canvas.width / 2 - this.player.width / 2, y: input.mouseY - this.player.game.canvas.height / 2 + this.player.height / 2 }
        this.span.innerHTML = `${this.targetDir}`
        const dx = worldMouseX - this.player.x;
        const dy = worldMouseY - this.player.y;
        this.mouseAngle = Math.atan2(dy, dx);
    }

    processSwing(input) {
        this.swingDelay--
        if (input.keys.Space) {
            if (this.swingDelay < 1 && Math.abs(this.targetDir) == 150) {
                this.beginSwing(this.targetDir / -150)
            }
        } else {
            this.returnSword()
        }
        this.relaxSword()
        this.swingDir += this.swingSpeed
        this.swingSpeed += 0.2 * (this.targetDir - this.swingDir)
        this.swingSpeed = this.swingSpeed * 0.75
    }

    beginSwing(dx) {
        this.swingDelay = 16
        this.targetDir = dx * 170
        this.swingDir = dx * 35
        this.swingSpeed = dx * 25
        this.attackDir = this.direction
        this.effects.push(new Swish(this))
    }
    returnSword() {
        if (this.swingDelay < 5) {
            if (this.targetDir * (this.mouse.x) > 0) {
                this.targetDir = -this.targetDir
                this.swingDelay = 16
            }
        }
    }
    relaxSword() {
        if (this.swingSpeed * this.targetDir < 0) {
            if (Math.abs(this.targetDir) == 170) {
                this.targetDir = (this.targetDir / 170) * 150
            }
        }
    }
    calculateMouseAngle() {

    }
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    render(ctx, camera, input) {
        ctx.fillStyle = 'lime';
        ctx.save()
        ctx.translate(this.player.x + this.player.width / 2 - camera.x, this.player.y + this.player.height / 2 - camera.y);
        ctx.rotate(this.mouseAngle);
        this.processSwing(input)
        ctx.fillStyle = 'black';
        ctx.rotate(this.degreesToRadians(this.swingDir * 0.6));
        ctx.translate(this.armLength, 0);
        ctx.rotate(this.degreesToRadians(this.swingDir * 0.4));
        this.direction = this.mouseAngle
        this.direction += this.degreesToRadians(this.swingDir * 0.4)
        this.direction += this.degreesToRadians(this.swingDir * 0.6)
        if (this.image) {
            ctx.drawImage(this.image, 0, -this.image.height / 6, this.image.width / 3, this.image.height / 3);
            // ctx.fillRect(0, -5, 80, 10)

        } else {
            ctx.fillRect(0, 0, 80, 10)

        }
        ctx.restore()
        this.effects.forEach(effect => effect.render(ctx, camera))
    }


}