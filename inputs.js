export default class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false, // Added spacebar
        };
        this.mouseX = 0; // Added mouse X
        this.mouseY = 0; // Added mouse Y

        document.addEventListener('keydown', (e) => {
            if (e.code in this.keys) {
                this.keys[e.code] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code in this.keys) {
                this.keys[e.code] = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
}