class CrumpleAnimator {
    constructor(containerElement) {
        this.container = containerElement;
        this.isAnimating = false;
        this.animationQueue = [];
        this.fallTrajectory = this.generateFallTrajectory();
    }

    generateFallTrajectory() {
        const startX = (Math.random() - 0.5) * 20;
        const endX = (Math.random() - 0.5) * 60;
        const trajectory = [];

        for (let i = 10; i <= 100; i += 15) {
            const progress = i / 100;
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            const x = startX + (endX - startX) * easeProgress;
            const wobble = Math.sin(progress * Math.PI * 3) * 5 * (1 - progress);
            trajectory.push(x + wobble);
        }

        return {
            points: trajectory,
            startX,
            endX
        };
    }

    async crumple() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.fallTrajectory = this.generateFallTrajectory();
        this.applyFallTrajectory();

        try {
            await this.edgeFoldPhase();
            await this.inwardFoldPhase();
            await this.ballCompressionPhase();
            await this.ballFallPhase();
            await this.bouncePhase();
            this.reset();
        } catch (error) {
            console.error('Animation error:', error);
            this.reset();
        }
    }

    applyFallTrajectory() {
        const style = document.createElement('style');
        style.id = 'fall-trajectory-style';

        let cssVariables = ':root {\n';
        this.fallTrajectory.points.forEach((x, index) => {
            const keyframe = 10 + (index * 15);
            cssVariables += `  --fall-x-${keyframe}: ${x}vw;\n`;
        });
        cssVariables += `  --fall-x-100: ${this.fallTrajectory.endX}vw;\n`;
        cssVariables += '}';

        style.textContent = cssVariables;

        const existingStyle = document.getElementById('fall-trajectory-style');
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }

        document.head.appendChild(style);
    }

    async edgeFoldPhase() {
        return new Promise((resolve) => {
            this.container.classList.add('crumpling-edge-fold');
            setTimeout(() => {
                this.container.classList.remove('crumpling-edge-fold');
                resolve();
            }, 1000);
        });
    }

    async inwardFoldPhase() {
        return new Promise((resolve) => {
            this.container.classList.add('crumpling-inward-fold');
            setTimeout(() => {
                this.container.classList.remove('crumpling-inward-fold');
                resolve();
            }, 1200);
        });
    }

    async ballCompressionPhase() {
        return new Promise((resolve) => {
            this.container.classList.add('crumpling-ball-compression');
            setTimeout(() => {
                this.container.classList.remove('crumpling-ball-compression');
                resolve();
            }, 800);
        });
    }

    async ballFallPhase() {
        return new Promise((resolve) => {
            this.container.classList.add('crumpling-ball-fall');
            setTimeout(() => {
                this.container.classList.remove('crumpling-ball-fall');
                resolve();
            }, 2500);
        });
    }

    async bouncePhase() {
        return new Promise((resolve) => {
            this.container.classList.add('crumpling-bounce');
            setTimeout(() => {
                this.container.classList.remove('crumpling-bounce');
                resolve();
            }, 800);
        });
    }

    reset() {
        this.container.classList.add('paper-reset');

        const trajectoryStyle = document.getElementById('fall-trajectory-style');
        if (trajectoryStyle) {
            document.head.removeChild(trajectoryStyle);
        }

        requestAnimationFrame(() => {
            this.container.classList.remove('paper-reset');
            this.isAnimating = false;
        });
    }

    destroy() {
        this.container.classList.remove(
            'crumpling-edge-fold',
            'crumpling-inward-fold',
            'crumpling-ball-compression',
            'crumpling-ball-fall',
            'crumpling-bounce',
            'paper-reset'
        );

        const trajectoryStyle = document.getElementById('fall-trajectory-style');
        if (trajectoryStyle) {
            document.head.removeChild(trajectoryStyle);
        }

        this.isAnimating = false;
    }
}