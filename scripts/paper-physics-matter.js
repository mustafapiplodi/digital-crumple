class MatterPaperPhysics {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.engine = null;
        this.render = null;
        this.runner = null;
        this.world = null;
        this.paperBodies = [];
        this.constraints = [];
        this.isAnimating = false;
        this.crumplingForces = [];
        this.textContent = '';

        this.init();
    }

    init() {
        console.log('Initializing Matter.js physics engine...');

        // Create Matter.js engine
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;

        // Disable gravity initially
        this.engine.world.gravity.y = 0;
        this.engine.world.gravity.x = 0;

        // Create custom renderer for paper-like appearance
        this.render = Matter.Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                background: '#ffffff',
                wireframes: false,
                showVelocity: false,
                showAngleIndicator: false,
                showDebug: false,
                showBounds: false,
                showBroadphase: false,
                showPositions: false,
                showStats: false,
                showPerformance: false
            }
        });

        // Custom rendering for paper appearance
        this.setupCustomRenderer();

        console.log('Matter.js renderer created');

        // Create paper mesh
        this.createPaperMesh();

        // Create runner and start the engine and renderer
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
        Matter.Render.run(this.render);

        console.log('Matter.js engine and renderer started');

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupCustomRenderer() {
        // Draw our custom paper surface after Matter.js renders
        Matter.Events.on(this.render, 'afterRender', () => {
            this.drawPaperSurface();
        });
    }

    drawPaperSurface() {
        if (!this.paperBodies.length) return;

        const ctx = this.render.context;
        const canvas = this.render.canvas;

        // Clear the canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background with pure white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw triangulated paper surface with realistic lighting
        for (let row = 0; row < this.paperBodies.length - 1; row++) {
            for (let col = 0; col < this.paperBodies[row].length - 1; col++) {
                const topLeft = this.paperBodies[row][col];
                const topRight = this.paperBodies[row][col + 1];
                const bottomLeft = this.paperBodies[row + 1][col];
                const bottomRight = this.paperBodies[row + 1][col + 1];

                // Draw two triangles to form a quad
                const lighting1 = this.calculateTriangleLighting(topLeft, topRight, bottomLeft);
                const lighting2 = this.calculateTriangleLighting(topRight, bottomRight, bottomLeft);

                this.drawPaperTriangle(ctx, topLeft.position, topRight.position, bottomLeft.position, lighting1);
                this.drawPaperTriangle(ctx, topRight.position, bottomRight.position, bottomLeft.position, lighting2);
            }
        }
    }


    calculateTriangleLighting(p1, p2, p3) {
        // Calculate 3D surface normal for realistic lighting
        const v1 = {
            x: p2.position.x - p1.position.x,
            y: p2.position.y - p1.position.y,
            z: 0
        };
        const v2 = {
            x: p3.position.x - p1.position.x,
            y: p3.position.y - p1.position.y,
            z: 0
        };

        // Estimate Z displacement based on deformation
        const center = {
            x: (p1.position.x + p2.position.x + p3.position.x) / 3,
            y: (p1.position.y + p2.position.y + p3.position.y) / 3
        };

        // Calculate expected position vs actual position for Z estimation
        const expectedX = center.x;
        const expectedY = center.y;
        const deformation = Math.sqrt((center.x - expectedX)**2 + (center.y - expectedY)**2);

        // Add Z component based on compression/stretching
        const zDisplacement = Math.sin(deformation * 0.1) * 20;
        v1.z = zDisplacement * 0.5;
        v2.z = zDisplacement * 0.3;

        // Cross product for 3D normal
        const normal = {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };

        // Normalize
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
            normal.x /= length;
            normal.y /= length;
            normal.z /= length;
        }

        // Multiple light sources for realistic paper lighting
        const mainLight = { x: -0.7, y: -0.7, z: 1.2 };
        const fillLight = { x: 0.3, y: -0.5, z: 0.8 };

        // Calculate dot products
        const mainDot = Math.max(0, normal.x * mainLight.x + normal.y * mainLight.y + normal.z * mainLight.z);
        const fillDot = Math.max(0, normal.x * fillLight.x + normal.y * fillLight.y + normal.z * fillLight.z);

        // Combine lighting with ambient
        const ambient = 0.3;
        const intensity = ambient + mainDot * 0.6 + fillDot * 0.2;

        return Math.max(0.2, Math.min(1, intensity));
    }

    drawPaperTriangle(ctx, p1, p2, p3, lighting) {
        // Create realistic paper colors with proper shadows
        const baseColor = 248;
        const litColor = baseColor * lighting;

        // Add paper texture variation
        const paperNoise = (Math.random() - 0.5) * 4;
        const finalColor = Math.max(180, Math.min(255, litColor + paperNoise));

        // Create realistic paper coloring with slight blue tint in shadows
        const r = finalColor;
        const g = finalColor;
        const b = finalColor + (lighting > 0.7 ? 2 : -3); // Cooler shadows

        // Draw the triangle with gradient for depth
        const centerX = (p1.x + p2.x + p3.x) / 3;
        const centerY = (p1.y + p2.y + p3.y) / 3;

        // Create radial gradient for more realistic paper appearance
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        const highlight = Math.min(255, finalColor + 8);
        const shadow = Math.max(200, finalColor - 12);

        gradient.addColorStop(0, `rgb(${highlight}, ${highlight}, ${highlight + 2})`);
        gradient.addColorStop(1, `rgb(${shadow}, ${shadow}, ${shadow - 2})`);

        ctx.fillStyle = gradient;

        // Sharp, realistic edges for creases
        if (lighting < 0.4) {
            // Deep shadow areas - sharper edges
            ctx.strokeStyle = `rgb(${Math.max(160, r - 30)}, ${Math.max(160, g - 30)}, ${Math.max(160, b - 25)})`;
            ctx.lineWidth = 0.8;
        } else if (lighting > 0.8) {
            // Bright areas - softer edges
            ctx.strokeStyle = `rgb(${Math.min(255, r + 5)}, ${Math.min(255, g + 5)}, ${Math.min(255, b + 8)})`;
            ctx.lineWidth = 0.2;
        } else {
            // Normal areas
            ctx.strokeStyle = `rgb(${Math.max(200, r - 15)}, ${Math.max(200, g - 15)}, ${Math.max(200, b - 10)})`;
            ctx.lineWidth = 0.4;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Add extra shadows for deep creases
        if (lighting < 0.35) {
            ctx.fillStyle = `rgba(180, 180, 190, ${0.4 - lighting})`;
            ctx.fill();
        }
    }

    drawPaperPatch(ctx, topLeft, topRight, bottomLeft, bottomRight) {
        // Calculate surface normal for realistic lighting
        const v1 = {
            x: topRight.position.x - topLeft.position.x,
            y: topRight.position.y - topLeft.position.y,
            z: 0
        };
        const v2 = {
            x: bottomLeft.position.x - topLeft.position.x,
            y: bottomLeft.position.y - topLeft.position.y,
            z: 0
        };

        // Light direction (from top-left)
        const lightDir = { x: -1, y: -1, z: 2 };

        // Calculate how much this patch faces the light
        const normal = this.crossProduct(v1, v2);
        const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);

        if (normalLength > 0) {
            normal.x /= normalLength;
            normal.y /= normalLength;
            normal.z /= normalLength;
        }

        const lightIntensity = Math.max(0, this.dotProduct(normal, lightDir));

        // Calculate shadow intensity based on deformation
        const centerX = (topLeft.position.x + topRight.position.x + bottomLeft.position.x + bottomRight.position.x) / 4;
        const centerY = (topLeft.position.y + topRight.position.y + bottomLeft.position.y + bottomRight.position.y) / 4;

        // Base paper color with lighting
        const baseColor = 250;
        const shadowIntensity = Math.max(0, Math.min(50, (1 - lightIntensity) * 60));
        const finalColor = Math.max(200, baseColor - shadowIntensity);

        // Draw upper triangle with gradient
        const gradient = ctx.createLinearGradient(topLeft.position.x, topLeft.position.y, bottomRight.position.x, bottomRight.position.y);
        gradient.addColorStop(0, `rgb(${finalColor + 10}, ${finalColor + 10}, ${finalColor + 10})`);
        gradient.addColorStop(1, `rgb(${finalColor - 10}, ${finalColor - 10}, ${finalColor - 10})`);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'none';

        ctx.beginPath();
        ctx.moveTo(topLeft.position.x, topLeft.position.y);
        ctx.lineTo(topRight.position.x, topRight.position.y);
        ctx.lineTo(bottomRight.position.x, bottomRight.position.y);
        ctx.closePath();
        ctx.fill();

        // Draw lower triangle
        ctx.beginPath();
        ctx.moveTo(topLeft.position.x, topLeft.position.y);
        ctx.lineTo(bottomRight.position.x, bottomRight.position.y);
        ctx.lineTo(bottomLeft.position.x, bottomLeft.position.y);
        ctx.closePath();
        ctx.fill();

        // Add depth shadows for extreme deformations
        if (shadowIntensity > 30) {
            ctx.fillStyle = `rgba(180, 180, 180, ${(shadowIntensity - 30) / 50})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    crossProduct(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    dotProduct(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    // Remove text drawing - we don't want text visible during crumpling

    setTextContent(text) {
        this.textContent = text;
    }

    createPaperMesh() {
        console.log('Creating paper mesh...');
        // Make paper cover entire screen
        const width = window.innerWidth;
        const height = window.innerHeight;
        const startX = 0;
        const startY = 0;

        // Grid dimensions for paper mesh
        const rows = 12;  // More vertices for better coverage
        const cols = 16;
        const cellWidth = width / (cols - 1);
        const cellHeight = height / (rows - 1);

        console.log(`Creating ${rows}x${cols} mesh (${rows * cols} vertices)`);

        // Create bodies for each vertex
        for (let row = 0; row < rows; row++) {
            this.paperBodies[row] = [];
            for (let col = 0; col < cols; col++) {
                const x = startX + col * cellWidth;
                const y = startY + row * cellHeight;

                const body = Matter.Bodies.circle(x, y, 2, {
                    render: {
                        visible: false
                    },
                    frictionAir: 0.02,
                    mass: 0.1
                });

                this.paperBodies[row][col] = body;
                Matter.World.add(this.world, body);
            }
        }

        console.log(`Added ${this.paperBodies.length * this.paperBodies[0].length} bodies to world`);

        // Create constraints between adjacent vertices
        this.createConstraints();
    }

    createConstraints() {
        console.log('Creating constraints...');
        const stiffness = 0.9;
        const damping = 0.1;
        let constraintCount = 0;

        for (let row = 0; row < this.paperBodies.length; row++) {
            for (let col = 0; col < this.paperBodies[row].length; col++) {
                const currentBody = this.paperBodies[row][col];

                // Horizontal constraint (right neighbor)
                if (col < this.paperBodies[row].length - 1) {
                    const rightBody = this.paperBodies[row][col + 1];
                    const constraint = Matter.Constraint.create({
                        bodyA: currentBody,
                        bodyB: rightBody,
                        stiffness: stiffness,
                        damping: damping,
                        render: {
                            visible: false
                        }
                    });
                    this.constraints.push(constraint);
                    Matter.World.add(this.world, constraint);
                    constraintCount++;
                }

                // Vertical constraint (bottom neighbor)
                if (row < this.paperBodies.length - 1) {
                    const bottomBody = this.paperBodies[row + 1][col];
                    const constraint = Matter.Constraint.create({
                        bodyA: currentBody,
                        bodyB: bottomBody,
                        stiffness: stiffness,
                        damping: damping,
                        render: {
                            visible: false
                        }
                    });
                    this.constraints.push(constraint);
                    Matter.World.add(this.world, constraint);
                    constraintCount++;
                }

                // Diagonal constraints for stability
                if (row < this.paperBodies.length - 1 && col < this.paperBodies[row].length - 1) {
                    const diagonalBody = this.paperBodies[row + 1][col + 1];
                    const constraint = Matter.Constraint.create({
                        bodyA: currentBody,
                        bodyB: diagonalBody,
                        stiffness: stiffness * 0.5,
                        damping: damping,
                        render: {
                            visible: false
                        }
                    });
                    this.constraints.push(constraint);
                    Matter.World.add(this.world, constraint);
                    constraintCount++;
                }
            }
        }

        console.log(`Added ${constraintCount} constraints to world`);
    }

    async startCrumpling() {
        console.log('Starting crumpling physics simulation...');

        if (this.isAnimating) {
            console.log('Already animating, skipping');
            return;
        }

        this.isAnimating = true;
        this.canvas.classList.add('active');

        console.log('Canvas activated, starting physics forces');

        try {
            await this.applyCrumplingForces();
            console.log('Crumpling forces completed, enabling gravity');
            await this.enableGravityAndFall();
            console.log('Gravity and fall completed');
        } catch (error) {
            console.error('Crumpling animation error:', error);
        } finally {
            setTimeout(() => {
                console.log('Resetting physics simulation');
                this.reset();
            }, 3000);
        }
    }

    async applyCrumplingForces() {
        return new Promise((resolve) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const maxForce = 0.035;
            const duration = 1800;
            const startTime = Date.now();

            const applyForces = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const intensity = this.easeInOut(progress);

                // Apply more realistic crumpling forces
                for (let row = 0; row < this.paperBodies.length; row++) {
                    for (let col = 0; col < this.paperBodies[row].length; col++) {
                        const body = this.paperBodies[row][col];
                        const dx = centerX - body.position.x;
                        const dy = centerY - body.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance > 0) {
                            // Non-linear force application for more realistic crumpling
                            const distanceFactor = Math.pow(distance / 400, 1.5);
                            const forceMultiplier = maxForce * intensity * distanceFactor;
                            const fx = (dx / distance) * forceMultiplier;
                            const fy = (dy / distance) * forceMultiplier;

                            Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
                        }

                        // Add directional turbulence for more realistic folds
                        const turbulence = 0.008 * intensity;
                        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI * 0.5;
                        const randomFx = Math.cos(angle) * turbulence * (Math.random() * 2);
                        const randomFy = Math.sin(angle) * turbulence * (Math.random() * 2);

                        Matter.Body.applyForce(body, body.position, { x: randomFx, y: randomFy });

                        // Add rotational forces for edge vertices to create more dramatic folds
                        const isEdge = row === 0 || row === this.paperBodies.length - 1 ||
                                     col === 0 || col === this.paperBodies[row].length - 1;
                        if (isEdge) {
                            const edgeForce = maxForce * intensity * 1.5;
                            const edgeFx = (dx / distance) * edgeForce;
                            const edgeFy = (dy / distance) * edgeForce;
                            Matter.Body.applyForce(body, body.position, { x: edgeFx, y: edgeFy });
                        }
                    }
                }

                if (progress < 1) {
                    requestAnimationFrame(applyForces);
                } else {
                    resolve();
                }
            };

            applyForces();
        });
    }

    async enableGravityAndFall() {
        return new Promise((resolve) => {
            // Enable gravity
            this.engine.world.gravity.y = 1.5;
            this.engine.world.gravity.x = (Math.random() - 0.5) * 0.3;

            // Add floor
            const floor = Matter.Bodies.rectangle(
                window.innerWidth / 2,
                window.innerHeight + 50,
                window.innerWidth * 2,
                100,
                { isStatic: true, render: { visible: false } }
            );
            Matter.World.add(this.world, floor);

            // Resolve after paper settles
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    reset() {
        this.canvas.classList.remove('active');

        // Clear all bodies and constraints
        Matter.World.clear(this.world);
        this.paperBodies = [];
        this.constraints = [];

        // Reset engine properties
        this.engine.world.gravity.y = 0;
        this.engine.world.gravity.x = 0;

        // Recreate paper mesh
        setTimeout(() => {
            this.createPaperMesh();
            this.isAnimating = false;
        }, 500);
    }

    handleResize() {
        this.render.canvas.width = window.innerWidth;
        this.render.canvas.height = window.innerHeight;
        this.render.options.width = window.innerWidth;
        this.render.options.height = window.innerHeight;
    }

    destroy() {
        if (this.render) {
            Matter.Render.stop(this.render);
        }
        if (this.runner) {
            Matter.Runner.stop(this.runner);
        }
        if (this.engine) {
            Matter.Engine.clear(this.engine);
        }
        window.removeEventListener('resize', this.handleResize);
        this.isAnimating = false;
    }
}