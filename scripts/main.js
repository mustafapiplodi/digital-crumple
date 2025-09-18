class DigitalCrumple {
    constructor() {
        this.paperContainer = document.getElementById('paper-container');
        this.writingArea = document.getElementById('writing-area');
        this.crumpleButton = document.getElementById('crumple-btn');
        this.paperCanvas = document.getElementById('paper-texture');
        this.physicsCanvas = document.getElementById('physics-canvas');

        this.textureGenerator = null;
        this.animator = null;
        this.physicsEngine = null;
        this.paperAging = null;
        this.writingExperience = null;
        this.handwritingVariation = null;
        this.isInitialized = false;
        this.usePhysicsEngine = true; // Flag to choose between CSS and Matter.js

        this.init();
    }

    async init() {
        try {
            this.setupPaperTexture();
            this.setupPaperAging();
            this.setupHandwritingVariation();
            this.setupWritingExperience();
            this.setupAnimator();
            this.setupPhysicsEngine();
            this.setupEventListeners();
            this.setupAccessibility();

            this.focusWritingArea();
            this.isInitialized = true;

            console.log('Digital Crumple initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showFallbackUI();
        }
    }

    setupPaperTexture() {
        if (!this.paperCanvas) {
            throw new Error('Paper canvas not found');
        }

        this.textureGenerator = new PaperTextureGenerator(this.paperCanvas);
        this.textureGenerator.generateTexture();

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupAnimator() {
        if (!this.paperContainer) {
            throw new Error('Paper container not found');
        }

        this.animator = new CrumpleAnimator(this.paperContainer);
    }

    setupPaperAging() {
        if (!this.paperCanvas || !this.writingArea) {
            throw new Error('Paper canvas or writing area not found');
        }

        this.paperAging = new PaperAgingEffects(this.writingArea, this.paperCanvas);
    }

    setupHandwritingVariation() {
        if (!this.writingArea) {
            throw new Error('Writing area not found');
        }

        this.handwritingVariation = new HandwritingVariation(this.writingArea);
    }

    setupWritingExperience() {
        if (!this.writingArea) {
            throw new Error('Writing area not found');
        }

        this.writingExperience = new RealisticWritingExperience(this.writingArea);
    }

    setupPhysicsEngine() {
        console.log('Setting up physics engine...');
        console.log('Matter available:', typeof Matter !== 'undefined');
        console.log('Physics canvas found:', !!this.physicsCanvas);

        if (this.usePhysicsEngine && this.physicsCanvas && typeof Matter !== 'undefined') {
            try {
                this.physicsEngine = new MatterPaperPhysics(this.physicsCanvas);
                console.log('Matter.js physics engine initialized successfully');
            } catch (error) {
                console.warn('Failed to initialize Matter.js, falling back to CSS animations:', error);
                this.usePhysicsEngine = false;
            }
        } else {
            console.log('Using CSS-based animations - Matter.js not available or canvas missing');
            this.usePhysicsEngine = false;
        }
    }

    setupEventListeners() {
        if (this.writingArea) {
            this.writingArea.addEventListener('input', this.handleTextInput.bind(this));
            this.writingArea.addEventListener('focus', this.handleFocus.bind(this));
            this.writingArea.addEventListener('blur', this.handleBlur.bind(this));
        }

        if (this.crumpleButton) {
            this.crumpleButton.addEventListener('click', this.handleCrumple.bind(this));
        }

        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        document.addEventListener('click', (e) => {
            if (e.target === document.body || e.target === this.paperContainer) {
                this.focusWritingArea();
            }
        });

        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    setupAccessibility() {
        if (this.writingArea) {
            this.writingArea.setAttribute('aria-label', 'Write your thoughts here');
            this.writingArea.setAttribute('role', 'textbox');
            this.writingArea.setAttribute('aria-multiline', 'true');
        }

        if (this.crumpleButton) {
            this.crumpleButton.setAttribute('tabindex', '0');
        }
    }

    handleTextInput(event) {
        const hasText = event.target.value.trim().length > 0;
        this.toggleCrumpleButton(hasText);
    }

    handleFocus() {
        this.paperContainer.classList.add('focused');
    }

    handleBlur() {
        this.paperContainer.classList.remove('focused');
    }

    handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.clearText();
        }

        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            if (this.writingArea.value.trim().length > 0) {
                this.handleCrumple();
            }
        }
    }

    async handleCrumple() {
        console.log('Crumple button clicked!');

        if (this.writingArea.value.trim().length === 0) {
            console.log('No text to crumple');
            return;
        }

        // Check if any animation system is currently running
        if ((this.animator && this.animator.isAnimating) ||
            (this.physicsEngine && this.physicsEngine.isAnimating)) {
            console.log('Animation already in progress');
            return;
        }

        console.log('Starting crumple animation...');
        console.log('Using physics engine:', this.usePhysicsEngine);
        console.log('Physics engine available:', !!this.physicsEngine);

        this.crumpleButton.classList.add('animating');
        this.writingArea.blur();

        // Store text content before clearing
        const textContent = this.writingArea.value;

        // Hide text instantly without clearing to prevent flash
        if (this.handwritingVariation) {
            this.handwritingVariation.hideTextInstantly();
        }

        try {
            if (this.usePhysicsEngine && this.physicsEngine) {
                console.log('Starting Matter.js physics simulation');
                // Pass stored text content to physics engine
                this.physicsEngine.setTextContent(textContent);
                // Hide text area during physics simulation
                this.writingArea.style.opacity = '0';
                await this.physicsEngine.startCrumpling();
                this.writingArea.style.opacity = '1';
                console.log('Physics simulation completed');
            } else {
                console.log('Starting CSS animation fallback');
                // Fall back to CSS animations
                await this.animator.crumple();
                console.log('CSS animation completed');
            }

            // Clear any remaining effects after animation
            if (this.handwritingVariation) {
                this.handwritingVariation.reset();
            }
            if (this.paperAging) {
                this.paperAging.reset();
            }

            setTimeout(() => {
                this.focusWritingArea();
            }, 100);
        } catch (error) {
            console.error('Crumple animation error:', error);
            this.writingArea.style.opacity = '1';
        } finally {
            this.crumpleButton.classList.remove('animating');
            console.log('Crumple animation finished');
        }
    }

    handleResize() {
        if (this.textureGenerator) {
            this.textureGenerator.resize();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.writingArea.blur();
        }
    }

    toggleCrumpleButton(show) {
        if (!this.crumpleButton) return;

        if (show) {
            this.crumpleButton.classList.remove('hidden');
            this.crumpleButton.setAttribute('tabindex', '0');
        } else {
            this.crumpleButton.classList.add('hidden');
            this.crumpleButton.setAttribute('tabindex', '-1');
        }
    }

    clearText() {
        if (this.writingArea) {
            this.writingArea.value = '';
            this.toggleCrumpleButton(false);

            // Reset paper aging effects
            if (this.paperAging) {
                this.paperAging.reset();
            }

            // Reset handwriting variation effects
            if (this.handwritingVariation) {
                this.handwritingVariation.reset();
            }
        }
    }

    focusWritingArea() {
        if (this.writingArea && this.isInitialized) {
            requestAnimationFrame(() => {
                this.writingArea.focus();
            });
        }
    }

    showFallbackUI() {
        if (this.paperContainer) {
            this.paperContainer.style.background = '#f8f8f8';
            this.paperContainer.style.backgroundImage = 'radial-gradient(circle, rgba(0,0,0,0.02) 1px, transparent 1px)';
            this.paperContainer.style.backgroundSize = '20px 20px';
        }

        console.log('Running in fallback mode - some features may be limited');
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        if (this.animator) {
            this.animator.destroy();
        }

        if (this.physicsEngine) {
            this.physicsEngine.destroy();
        }

        if (this.paperAging) {
            this.paperAging.destroy();
        }

        if (this.writingExperience) {
            this.writingExperience.destroy();
        }

        if (this.handwritingVariation) {
            this.handwritingVariation.destroy();
        }

        this.isInitialized = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.digitalCrumple = new DigitalCrumple();
});

document.addEventListener('beforeunload', () => {
    if (window.digitalCrumple) {
        window.digitalCrumple.destroy();
    }
});