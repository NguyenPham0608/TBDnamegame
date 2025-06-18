import Swish from "./swish.js";
import Projectile from "../projectile.js";

export default class Sword {
    constructor(player) {
        this.player = player;
        this.game = player.game
        this.armLength = 20;
        this.swingSpeed = 0;
        this.image = new Image();
        this.image.src = 'img/projectile/1.svg';
        this.targetDir = -150;
        this.swingDelay = 0;
        this.swingDir = 150;
        this.attackDir = 0;
        this.mouseAngle = 0;
        this.direction = 0;
        this.mouse = { x: 0, y: 0 };
        this.effects = [];
        this.span = document.getElementById("log");
        this.hitEnemies = new Set();
        this.swingHitbox = null; // Holds the wide hitbox during swing
        this.deltaTime = 0
        this.face = 1
        this.totalDamage = 100
        this.prevKeyX = false
    }

    update(input) {
        console.log(this.face)
        if (Math.abs(this.mouseAngle) > Math.PI / 2) {
            this.face = -1
        } else {
            this.face = 1
        }
        if (this.totalDamage > 100) {
            this.totalDamage = 100
        }
        this.deltaTime = this.player.game.deltaTime

        const worldMouseX = input.mouseX + this.player.game.camera.x;
        const worldMouseY = input.mouseY + this.player.game.camera.y;
        this.mouse = {
            x: input.mouseX - this.player.game.canvas.width / 2 - this.player.width / 2,
            y: input.mouseY - this.player.game.canvas.height / 2 + this.player.height / 2
        };
        this.span.innerHTML = `${this.targetDir}`;
        const dx = worldMouseX - this.player.x;
        const dy = worldMouseY - this.player.y;
        this.mouseAngle = Math.atan2(dy, dx);

        // Check collisions with the wide swing hitbox
        if (this.swingDelay > 0 && this.swingHitbox) {
            for (const enemy of this.player.game.enemies) {
                if (!this.hitEnemies.has(enemy) && this.rectIntersects(enemy.hitbox, this.swingHitbox)) {
                    enemy.hit();
                    this.hitEnemies.add(enemy);
                }
            }
        }
    }

    processAttack(input) {
        if (!this.player.game.editorMode) {
            this.swingDelay--;
            if (input.keys.Space || input.mouseDown) {
                if (this.swingDelay < 1 && Math.abs(this.targetDir) === 150) {
                    this.beginSwing(this.targetDir / -150);
                }
            } else {
                if (input.keys.KeyX && !this.prevKeyX) {
                    if (this.totalDamage >= 100) {
                        // this.totalDamage = 0
                        this.combo1()
                        this.prevKeyX = input.keys.KeyX
                    }
                } else {
                    this.returnSword();
                }
            }
            this.prevKeyX = input.keys.KeyX

            this.relaxSword();
            this.swingDir += this.swingSpeed * 30 * this.deltaTime;
            this.swingSpeed += (this.targetDir - this.swingDir) / 10;
            this.swingSpeed *= getValue(this.deltaTime);
        }
    }
    combo1() {

        this.game.projectiles.push(new Projectile(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.mouseAngle, 2, this.totalDamage, "combo1", this.game));
    }

    beginSwing(dx) {
        this.swingDelay = 16; // Duration of the swing
        this.targetDir = dx * 170;
        this.swingDir = dx * 35;
        this.swingSpeed = dx * 20;
        this.attackDir = this.direction;
        this.effects.push(new Swish(this));
        this.hitEnemies.clear(); // Reset hit enemies
        this.createSwingHitbox(); // Create the wide hitbox
    }

    createSwingHitbox() {
        // Define a wide hitbox for the entire swing
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const swingRadius = this.armLength + 80; // Total reach of the swing
        const swingAngle = this.mouseAngle;

        // Rectangular hitbox covering the swing area
        const hitboxWidth = swingRadius; // Wide enough to cover the swing
        const hitboxHeight = 70; // Height of the swing arc

        // Position hitbox in the direction of the swing
        const hitboxX = playerCenterX + (swingRadius / 2) * Math.cos(swingAngle) - hitboxWidth / 2;
        const hitboxY = playerCenterY + (swingRadius / 2) * Math.sin(swingAngle) - hitboxHeight / 2;

        this.swingHitbox = {
            left: hitboxX,
            top: hitboxY,
            right: hitboxX + hitboxWidth,
            bottom: hitboxY + hitboxHeight
        };
    }

    returnSword() {
        if (this.swingDelay < 5) {
            if (this.targetDir * this.mouse.x > 0) {
                this.targetDir = -this.targetDir;
                this.swingDelay = 16;
            }
        }
    }

    relaxSword() {
        if (this.swingSpeed * this.targetDir < 0) {
            if (Math.abs(this.targetDir) === 170) {
                this.targetDir = (this.targetDir / 170) * 150;
            }
        }
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    render(ctx, camera, input) {
        ctx.save();
        ctx.translate(this.player.x + this.player.width / 2 - camera.x, this.player.y + this.player.height / 2 - camera.y);
        ctx.rotate(this.mouseAngle);
        this.processAttack(input);
        ctx.rotate(this.degreesToRadians(this.swingDir * 0.6));
        ctx.translate(this.armLength, 0);
        ctx.rotate(this.degreesToRadians(this.swingDir * 0.4));
        this.direction = this.mouseAngle + this.degreesToRadians(this.swingDir * 0.6) + this.degreesToRadians(this.swingDir * 0.4);
        if (this.image.complete) {
            ctx.drawImage(this.image, 0, -this.image.height / 4, this.image.width / 2, this.image.height / 2);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 80, 10);
        }
        ctx.restore();
        this.effects.forEach(effect => effect.render(ctx, camera));

        // Visualize the wide hitbox for debugging
        // if (this.swingDelay > 0 && this.swingHitbox) {
        //     ctx.save();
        //     ctx.strokeStyle = 'red';
        //     ctx.lineWidth = 2;
        //     ctx.strokeRect(
        //         this.swingHitbox.left - camera.x,
        //         this.swingHitbox.top - camera.y,
        //         this.swingHitbox.right - this.swingHitbox.left,
        //         this.swingHitbox.bottom - this.swingHitbox.top
        //     );
        //     ctx.restore();
        // }
    }

    rectIntersects(rect1, rect2) {
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }
}