export default class Sword {
    constructor(player) {
        this.player = player;
        this.armLength = 20; // Length of the arm from player to wrist
        this.baseAngle = 0;
        this.armRotation = 0;
        this.wristRotation = 0;
        this.swinging = false;
        this.returning = false;
        this.swingProgress = 0;
        this.swingSpeed = 0.07; // Adjust for swing speed
        this.swingAngle = Math.PI; // 180 degrees
        this.wristSwingAngle = Math.PI / 6; // 30 degrees for wrist
        this.swingDirection = 1;
        this.image = new Image();
        this.image.src = 'sword.png'; // Assumes a sword image exists
        this.startSwingAngle = 0
        this.wristAngle = 0
        this.targetAngle = 0
        this.offset = 0
    }

    update(input) {
        console.log(input.mouseX - window.innerWidth / 2)
        // Calculate world mouse position
        const worldMouseX = input.mouseX + this.player.game.camera.x;
        const worldMouseY = input.mouseY + this.player.game.camera.y;
        if (input.mouseX - window.innerWidth / 2 < 0) {
            this.offset = Math.PI / 2
        } else {
            this.offset = 0
        }
        const dx = worldMouseX - this.player.x;
        const dy = worldMouseY - this.player.y;
        // Base angle points opposite to mouse
        this.baseAngle = Math.atan2(dy, dx) + Math.PI;

        // Only start a new swing if not swinging or returning
        if (input.keys.Space && !this.swinging && !this.returning) {
            if (!this.swinging) {
                this.startSwingAngle = this.baseAngle
            }
            this.swinging = true;
            this.startSwingAngle = this.baseAngle
            this.swingProgress = 0;
            this.swingDirection = this.swingDirection > 0 ? 1 : -1; // Maintain direction for consistency
        }

        if (this.swinging) {
            if (!this.returnSlow) {
                this.swingProgress += this.swingSpeed;

                if (this.swingProgress >= 1) {
                    this.swingProgress = 1;
                    this.swinging = false;
                    if (input.keys.Space) {
                        // Start opposite swing only after completion
                        this.swinging = true;
                        this.swingProgress = 0;
                        this.swingDirection = -this.swingDirection;
                    } else {
                        this.returnSlow = true;

                    }
                }
            }
        } else if (this.returning) {
            this.swingProgress -= this.swingSpeed;
            if (this.swingProgress <= 0) {
                this.swingProgress = 0;
                this.returning = false;
            }
        }

        if (this.returnSlow) {
            this.swinging = true
            this.swingProgress += this.swingSpeed / 2;

            if (Math.round(this.armRotation) == Math.round(this.startSwingAngle)) {
                this.swinging = false;
                this.returnSlow = false
                this.wristRotation = 0
                this.swingProgress = 0
            }


        }

        // Calculate arm rotation with easing
        const ease = this.easeInOutQuad(this.swingProgress);
        if (this.swinging) {
            this.armRotation = this.baseAngle + ease * this.swingAngle * this.swingDirection;
            this.wristRotation = this.armRotation / 1.3 - Math.PI / 2;
        } else if (this.returning) {
            this.armRotation = -(this.baseAngle - ease * this.swingAngle * this.swingDirection);
            this.wristRotation = (this.armRotation / 1.3 - Math.PI / 2);
        } else {
            this.armRotation = this.baseAngle;
            this.wristRotation = 0;
        }
    }

    render(ctx, camera) {
        ctx.save();
        const shoulderScreenX = this.player.x - camera.x + this.player.width / 2;
        const shoulderScreenY = this.player.y - camera.y + this.player.height / 2;

        // Translate to shoulder and rotate arm
        ctx.translate(shoulderScreenX, shoulderScreenY);
        ctx.rotate(this.armRotation + Math.PI / 2);

        // Draw arm
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineWidth = 2;
        ctx.lineTo(this.armLength, 0);
        ctx.strokeStyle = '#ffffff';
        // ctx.stroke();

        // Translate to wrist and rotate wrist
        ctx.translate(this.armLength, 0);
        ctx.rotate(this.wristRotation - Math.PI / 2 + this.offset);

        // Draw sword
        if (this.image.complete && this.image.naturalWidth > 0) {
            const scale = 7; // Adjust the scale as needed
            ctx.drawImage(this.image, 0, -this.image.height / scale / 2, this.image.width / scale, this.image.height / scale);
        } else {
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, -5, 50, 10); // Placeholder rectangle 
        }

        ctx.restore();
    }

    // Ease in-out quadratic function for smooth animation
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}