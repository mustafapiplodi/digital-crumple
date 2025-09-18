class PaperAgingEffects {
    constructor(writingArea, paperCanvas) {
        this.writingArea = writingArea;
        this.paperCanvas = paperCanvas;
        this.agingCanvas = null;
        this.agingCtx = null;
        this.inkBlots = [];
        this.agingLevel = 0;
        this.lastTextLength = 0;

        this.init();
    }

    init() {
        // Create aging overlay canvas
        this.agingCanvas = document.createElement('canvas');
        this.agingCanvas.className = 'aging-overlay';
        this.agingCanvas.style.position = 'absolute';
        this.agingCanvas.style.top = '0';
        this.agingCanvas.style.left = '0';
        this.agingCanvas.style.width = '100%';
        this.agingCanvas.style.height = '100%';
        this.agingCanvas.style.pointerEvents = 'none';
        this.agingCanvas.style.zIndex = '8';
        this.agingCanvas.style.opacity = '0.6';

        this.agingCtx = this.agingCanvas.getContext('2d');

        // Insert after paper texture canvas
        this.paperCanvas.parentNode.insertBefore(this.agingCanvas, this.paperCanvas.nextSibling);

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        const rect = this.paperCanvas.getBoundingClientRect();
        this.agingCanvas.width = rect.width;
        this.agingCanvas.height = rect.height;
    }

    setupEventListeners() {
        this.writingArea.addEventListener('input', this.handleTextInput.bind(this));
        window.addEventListener('resize', this.setupCanvas.bind(this));
    }

    handleTextInput(event) {
        const currentLength = event.target.value.length;

        // Add aging effects as user types more
        if (currentLength > this.lastTextLength) {
            this.agingLevel = Math.min(currentLength / 500, 1); // Max aging at 500 characters
            this.addInkBlot();
            this.updateAging();
        }

        this.lastTextLength = currentLength;
    }

    addInkBlot() {
        // Add random ink spreading effects
        if (Math.random() < 0.15) { // 15% chance per keystroke
            const x = Math.random() * this.agingCanvas.width;
            const y = Math.random() * this.agingCanvas.height;
            const size = Math.random() * 8 + 2;
            const opacity = Math.random() * 0.1 + 0.02;

            this.inkBlots.push({
                x: x,
                y: y,
                size: size,
                opacity: opacity,
                growth: 0,
                maxGrowth: Math.random() * 3 + 1
            });
        }
    }

    updateAging() {
        // Clear canvas
        this.agingCtx.clearRect(0, 0, this.agingCanvas.width, this.agingCanvas.height);

        // Add paper yellowing effect
        this.addYellowing();

        // Update and draw ink blots
        this.updateInkBlots();

        // Add coffee stains occasionally
        this.addStains();

        // Add paper creases from typing
        this.addTypingCreases();
    }

    addYellowing() {
        if (this.agingLevel <= 0) return;

        const gradient = this.agingCtx.createRadialGradient(
            this.agingCanvas.width * 0.3, this.agingCanvas.height * 0.4, 0,
            this.agingCanvas.width * 0.3, this.agingCanvas.height * 0.4, this.agingCanvas.width * 0.8
        );

        const yellowIntensity = this.agingLevel * 0.08;
        gradient.addColorStop(0, `rgba(245, 222, 179, ${yellowIntensity})`);
        gradient.addColorStop(0.7, `rgba(238, 203, 173, ${yellowIntensity * 0.6})`);
        gradient.addColorStop(1, `rgba(245, 222, 179, ${yellowIntensity * 0.2})`);

        this.agingCtx.fillStyle = gradient;
        this.agingCtx.fillRect(0, 0, this.agingCanvas.width, this.agingCanvas.height);
    }

    updateInkBlots() {
        this.inkBlots.forEach((blot, index) => {
            // Grow the blot
            blot.growth = Math.min(blot.growth + 0.1, blot.maxGrowth);
            const currentSize = blot.size * (1 + blot.growth);

            // Create ink spreading effect
            const gradient = this.agingCtx.createRadialGradient(
                blot.x, blot.y, 0,
                blot.x, blot.y, currentSize
            );

            gradient.addColorStop(0, `rgba(25, 25, 40, ${blot.opacity})`);
            gradient.addColorStop(0.6, `rgba(45, 45, 60, ${blot.opacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(25, 25, 40, 0)');

            this.agingCtx.fillStyle = gradient;
            this.agingCtx.beginPath();
            this.agingCtx.arc(blot.x, blot.y, currentSize, 0, Math.PI * 2);
            this.agingCtx.fill();

            // Add ink fiber spreading
            this.addInkFibers(blot.x, blot.y, currentSize, blot.opacity);
        });
    }

    addInkFibers(centerX, centerY, radius, opacity) {
        const numFibers = Math.floor(radius * 2);

        for (let i = 0; i < numFibers; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 1.5;
            const fiberLength = Math.random() * radius * 0.8 + 2;

            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            const endX = startX + Math.cos(angle + (Math.random() - 0.5) * 0.5) * fiberLength;
            const endY = startY + Math.sin(angle + (Math.random() - 0.5) * 0.5) * fiberLength;

            this.agingCtx.strokeStyle = `rgba(35, 35, 50, ${opacity * 0.3})`;
            this.agingCtx.lineWidth = 0.5;
            this.agingCtx.beginPath();
            this.agingCtx.moveTo(startX, startY);
            this.agingCtx.lineTo(endX, endY);
            this.agingCtx.stroke();
        }
    }

    addStains() {
        if (this.agingLevel < 0.3 || Math.random() > 0.02) return;

        // Add coffee/tea stains
        const x = Math.random() * this.agingCanvas.width;
        const y = Math.random() * this.agingCanvas.height;
        const size = Math.random() * 25 + 15;

        const gradient = this.agingCtx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(139, 118, 74, 0.15)');
        gradient.addColorStop(0.4, 'rgba(160, 130, 98, 0.08)');
        gradient.addColorStop(1, 'rgba(139, 118, 74, 0)');

        this.agingCtx.fillStyle = gradient;
        this.agingCtx.beginPath();
        this.agingCtx.arc(x, y, size, 0, Math.PI * 2);
        this.agingCtx.fill();
    }

    addTypingCreases() {
        if (this.agingLevel < 0.5) return;

        // Add subtle creases that appear with heavy typing
        const numCreases = Math.floor(this.agingLevel * 3);

        for (let i = 0; i < numCreases; i++) {
            const x1 = Math.random() * this.agingCanvas.width;
            const y1 = Math.random() * this.agingCanvas.height;
            const angle = (Math.random() - 0.5) * Math.PI * 0.3; // Mostly horizontal
            const length = Math.random() * 50 + 20;
            const x2 = x1 + Math.cos(angle) * length;
            const y2 = y1 + Math.sin(angle) * length;

            this.agingCtx.strokeStyle = `rgba(180, 180, 180, ${this.agingLevel * 0.1})`;
            this.agingCtx.lineWidth = 0.8;
            this.agingCtx.beginPath();
            this.agingCtx.moveTo(x1, y1);
            this.agingCtx.lineTo(x2, y2);
            this.agingCtx.stroke();
        }
    }

    reset() {
        this.agingLevel = 0;
        this.lastTextLength = 0;
        this.inkBlots = [];
        this.agingCtx.clearRect(0, 0, this.agingCanvas.width, this.agingCanvas.height);
    }

    destroy() {
        if (this.agingCanvas && this.agingCanvas.parentNode) {
            this.agingCanvas.parentNode.removeChild(this.agingCanvas);
        }
        window.removeEventListener('resize', this.setupCanvas);
    }
}