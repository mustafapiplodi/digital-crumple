class RealisticWritingExperience {
    constructor(writingArea) {
        this.writingArea = writingArea;
        this.isTyping = false;
        this.lastKeyTime = 0;
        this.typingRhythm = [];
        this.effectTimeout = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.writingArea.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.writingArea.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.writingArea.addEventListener('input', this.handleInput.bind(this));
        this.writingArea.addEventListener('focus', this.handleFocus.bind(this));
        this.writingArea.addEventListener('blur', this.handleBlur.bind(this));
    }

    handleKeyDown(event) {
        if (this.isVisibleCharacter(event.key)) {
            this.addTypingEffect(event.key);
            this.trackTypingRhythm();
        }
    }

    handleKeyUp(event) {
        // Add subtle visual feedback for key release
        if (this.isVisibleCharacter(event.key)) {
            this.addKeyReleaseEffect();
        }
    }

    handleInput(event) {
        // Debounce ink flow effect for better performance
        if (this.effectTimeout) {
            clearTimeout(this.effectTimeout);
        }

        this.effectTimeout = setTimeout(() => {
            this.addInkFlowEffect(event.target.value.length);
        }, 32); // ~30fps for effects
    }

    handleFocus() {
        // Add focus animation
        this.writingArea.style.boxShadow = 'inset 0 0 20px rgba(44, 62, 80, 0.05)';
        document.body.style.cursor = 'text';
    }

    handleBlur() {
        // Remove focus effects
        this.writingArea.style.boxShadow = 'none';
        document.body.style.cursor = 'default';
    }

    isVisibleCharacter(key) {
        return key.length === 1 && key !== ' ' || key === 'Space';
    }

    addTypingEffect(key) {
        // Create a subtle text reveal animation
        const currentTime = Date.now();
        const timeSinceLastKey = currentTime - this.lastKeyTime;

        // Add typing momentum effect
        if (timeSinceLastKey < 100) {
            // Fast typing - add momentum
            this.writingArea.style.transform = 'scale(1.003) translateY(-0.5px)';
        } else {
            // Normal typing
            this.writingArea.style.transform = 'scale(1.002)';
        }

        // Reset transform after a short delay
        setTimeout(() => {
            this.writingArea.style.transform = 'scale(1)';
        }, 80);

        this.lastKeyTime = currentTime;

        // Add subtle vibration if supported
        if (navigator.vibrate) {
            navigator.vibrate(1); // Very short vibration
        }
    }

    addKeyReleaseEffect() {
        // Subtle effect when key is released
        this.writingArea.style.filter = 'brightness(1.01)';
        setTimeout(() => {
            this.writingArea.style.filter = 'brightness(1)';
        }, 50);
    }

    addInkFlowEffect(textLength) {
        // Create subtle ink spreading effect based on typing speed
        const textarea = this.writingArea;
        const inkIntensity = Math.min(textLength / 100, 1);

        // Use requestAnimationFrame for smooth color transitions
        requestAnimationFrame(() => {
            // Gradually darken text color as more ink "flows"
            const baseColor = 44; // Base darkness
            const inkColor = Math.max(20, baseColor - (inkIntensity * 10));
            textarea.style.color = `rgb(${inkColor}, ${Math.floor(inkColor * 1.4)}, ${Math.floor(inkColor * 1.8)})`;
        });

        // Add paper absorption effect less frequently
        if (textLength > 0 && textLength % 50 === 0) {
            this.addPaperAbsorptionEffect();
        }
    }

    addPaperAbsorptionEffect() {
        // Simulate ink being absorbed by paper
        const container = this.writingArea.parentNode;
        const ripple = document.createElement('div');
        ripple.className = 'ink-absorption-ripple';

        const x = Math.random() * container.offsetWidth;
        const y = Math.random() * container.offsetHeight;

        ripple.style.position = 'absolute';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '2px';
        ripple.style.height = '2px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(44, 62, 80, 0.1)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ink-absorption 2s ease-out forwards';
        ripple.style.zIndex = '9';

        container.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 2000);
    }

    trackTypingRhythm() {
        // Track typing rhythm for adaptive effects
        const now = Date.now();
        this.typingRhythm.push(now);

        // Keep only last 10 keystrokes
        if (this.typingRhythm.length > 10) {
            this.typingRhythm.shift();
        }

        // Calculate typing speed and adjust effects
        if (this.typingRhythm.length > 5) {
            const timeSpan = now - this.typingRhythm[0];
            const speed = this.typingRhythm.length / (timeSpan / 1000); // keystrokes per second

            if (speed > 3) {
                // Fast typing - add momentum effects
                this.writingArea.style.letterSpacing = '0.3px';
            } else {
                // Normal typing
                this.writingArea.style.letterSpacing = '0.5px';
            }
        }
    }

    destroy() {
        // Clean up event listeners
        this.writingArea.removeEventListener('keydown', this.handleKeyDown);
        this.writingArea.removeEventListener('keyup', this.handleKeyUp);
        this.writingArea.removeEventListener('input', this.handleInput);
        this.writingArea.removeEventListener('focus', this.handleFocus);
        this.writingArea.removeEventListener('blur', this.handleBlur);
    }
}