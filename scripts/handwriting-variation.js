class HandwritingVariation {
    constructor(writingArea) {
        this.writingArea = writingArea;
        this.characterOverlay = null;
        this.ctx = null;
        this.isEnabled = true;
        this.charVariations = new Map();
        this.inkSmudges = [];
        this.paperWrinkles = [];
        this.redrawTimeout = null;
        this.lastText = '';
        this.isTyping = false;

        this.init();
    }

    init() {
        this.createCharacterOverlay();
        this.setupEventListeners();
        this.precomputeVariations();

        // Initialize font metrics after everything is set up
        if (!this.fontMetrics) {
            this.fontMetrics = this.calculateFontMetrics();
        }
    }

    createCharacterOverlay() {
        // Create canvas overlay for character variations
        this.characterOverlay = document.createElement('canvas');
        this.characterOverlay.className = 'character-overlay';
        this.characterOverlay.style.position = 'absolute';
        this.characterOverlay.style.top = '0';
        this.characterOverlay.style.left = '0';
        this.characterOverlay.style.width = '100%';
        this.characterOverlay.style.height = '100%';
        this.characterOverlay.style.pointerEvents = 'none';
        this.characterOverlay.style.zIndex = '12';
        this.characterOverlay.style.fontFamily = 'Kalam, Caveat, Dancing Script, cursive';

        this.ctx = this.characterOverlay.getContext('2d');

        // Insert after writing area
        this.writingArea.parentNode.insertBefore(this.characterOverlay, this.writingArea.nextSibling);

        this.setupCanvas();
    }

    setupCanvas() {
        const rect = this.writingArea.getBoundingClientRect();
        this.characterOverlay.width = rect.width;
        this.characterOverlay.height = rect.height;

        // Match writing area styling exactly
        this.ctx.font = '22px Kalam, Caveat, Dancing Script, cursive';
        this.ctx.textBaseline = 'alphabetic';

        // Calculate the exact font metrics to match textarea positioning
        this.fontMetrics = this.calculateFontMetrics();
    }

    calculateFontMetrics() {
        // Create a test div that exactly matches the textarea styling
        const testDiv = document.createElement('div');
        testDiv.style.cssText = `
            font-family: 'Kalam', 'Caveat', 'Dancing Script', cursive;
            font-size: 22px;
            line-height: 2.2;
            padding: 40px;
            position: absolute;
            visibility: hidden;
            white-space: pre;
            overflow: hidden;
            width: ${this.characterOverlay.width}px;
            height: ${this.characterOverlay.height}px;
        `;
        testDiv.textContent = 'A';

        document.body.appendChild(testDiv);

        // Measure where the text actually appears
        const textNode = testDiv.firstChild;
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const textRect = range.getBoundingClientRect();
        const divRect = testDiv.getBoundingClientRect();

        document.body.removeChild(testDiv);

        // Calculate the exact offset from div top to text baseline
        const textTopOffset = textRect.top - divRect.top;
        const lineHeight = 22 * 2.2; // 48.4px

        return {
            lineHeight: lineHeight,
            textTopOffset: textTopOffset // This is the exact offset we need
        };
    }

    setupEventListeners() {
        this.writingArea.addEventListener('input', this.handleInput.bind(this));
        this.writingArea.addEventListener('scroll', this.redrawText.bind(this));
        this.writingArea.addEventListener('focus', this.handleFocus.bind(this));
        this.writingArea.addEventListener('blur', this.handleBlur.bind(this));
        window.addEventListener('resize', this.setupCanvas.bind(this));
    }

    handleFocus() {
        // Immediately hide original text when focused and there's content
        if (this.writingArea.value.length > 0) {
            this.writingArea.classList.add('handwriting-active');
        }
    }

    handleBlur() {
        // Keep text hidden if there's content
        if (this.writingArea.value.length > 0) {
            this.writingArea.classList.add('handwriting-active');
        }
    }

    precomputeVariations() {
        // Precompute character variations for common characters
        const commonChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;: ';

        for (let char of commonChars) {
            this.charVariations.set(char, this.generateCharVariations(char, 5));
        }
    }

    generateCharVariations(char, count) {
        const variations = [];

        for (let i = 0; i < count; i++) {
            variations.push({
                rotation: (Math.random() - 0.5) * 0.15, // Character rotation
                scaleX: 0.92 + Math.random() * 0.16, // Width variation
                scaleY: 0.92 + Math.random() * 0.16, // Height variation
                offsetX: (Math.random() - 0.5) * 3, // Horizontal shift
                offsetY: (Math.random() - 0.5) * 3, // Vertical shift
                pressure: 0.65 + Math.random() * 0.35, // Ink pressure variation
                smudge: Math.random() < 0.18, // 18% chance of smudging
                inkFlow: 0.8 + Math.random() * 0.4 // Ink flow variation
            });
        }

        return variations;
    }

    handleInput(event) {
        if (!this.isEnabled) return;

        const currentText = event.target.value;

        // Hide original text immediately when typing starts
        if (currentText.length > 0) {
            this.writingArea.classList.add('handwriting-active');
        } else {
            this.writingArea.classList.remove('handwriting-active');
        }

        // Only run expensive operations if text actually changed
        if (currentText === this.lastText) return;

        this.isTyping = true;
        this.lastText = currentText;

        // Debounce heavy rendering operations
        if (this.redrawTimeout) {
            clearTimeout(this.redrawTimeout);
        }

        // Immediate lightweight update for responsiveness
        this.quickUpdate();

        // Debounced full redraw with all effects
        this.redrawTimeout = setTimeout(() => {
            this.redrawText();
            this.addInkSmudging();
            this.addPaperWrinkling();
            this.isTyping = false;
        }, 16); // ~60fps
    }

    quickUpdate() {
        // Lightweight update for immediate responsiveness during typing
        const text = this.lastText;

        if (!text) {
            this.writingArea.classList.remove('handwriting-active');
            return;
        }

        this.writingArea.classList.add('handwriting-active');

        // Only redraw new characters since last update for performance
        this.redrawTextOptimized();
    }

    redrawTextOptimized() {
        // Only clear and redraw if we're not in a typing burst
        if (this.isTyping && this.lastText.length > 0) {
            // During typing, use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
                this.ctx.clearRect(0, 0, this.characterOverlay.width, this.characterOverlay.height);
                this.drawVariedText(this.lastText);
            });
        }
    }

    redrawText() {
        this.ctx.clearRect(0, 0, this.characterOverlay.width, this.characterOverlay.height);

        const text = this.writingArea.value;

        if (!text) {
            // Show original text when empty
            this.writingArea.classList.remove('handwriting-active');
            return;
        }

        // Hide original text when there's content
        this.writingArea.classList.add('handwriting-active');

        // Draw text with variations
        this.drawVariedText(text);

        // Draw ink smudges
        this.drawInkSmudges();

        // Draw paper wrinkles
        this.drawPaperWrinkles();
    }

    drawVariedText(text) {
        const lineHeight = this.fontMetrics.lineHeight;
        const padding = 40; // Match textarea padding
        const scrollTop = this.writingArea.scrollTop;

        // Calculate wrapping width accounting for character variations
        const baseMaxWidth = this.characterOverlay.width - (padding * 2);
        const wrappingMaxWidth = baseMaxWidth * 0.95; // More conservative margin for character variations

        let globalCharIndex = 0;

        // Split text into visual lines using variation-aware wrapping
        const wrappedLines = this.wrapTextWithVariations(text, wrappingMaxWidth);

        for (let lineIndex = 0; lineIndex < wrappedLines.length; lineIndex++) {
            const line = wrappedLines[lineIndex];
            // Use exact measured text offset to match textarea positioning
            const y = (lineIndex * lineHeight) + this.fontMetrics.textTopOffset - scrollTop;

            // Skip lines that are out of view
            if (y < -lineHeight || y > this.characterOverlay.height + lineHeight) {
                globalCharIndex += line.length;
                continue;
            }

            let x = padding;

            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                const variation = this.getCharVariation(char, globalCharIndex);

                this.drawVariedCharacter(char, x, y, variation);

                // Calculate character width for next position
                const charWidth = this.ctx.measureText(char).width;
                x += charWidth * variation.scaleX + variation.offsetX + 0.5; // Small letter spacing

                globalCharIndex++;
            }
        }
    }

    wrapTextWithVariations(text, maxWidth) {
        const lines = text.split('\n');
        const wrappedLines = [];
        let globalCharIndex = 0;

        for (const line of lines) {
            if (line.length === 0) {
                wrappedLines.push('');
                continue;
            }

            const words = line.split(' ');
            let currentLine = '';
            let currentLineWidth = 0;

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + (currentLine ? ' ' : '') + word;

                // Calculate width accounting for character variations
                const testWidth = this.calculateVariedTextWidth(testLine, globalCharIndex);

                if (testWidth <= maxWidth || currentLine === '') {
                    currentLine = testLine;
                    currentLineWidth = testWidth;
                } else {
                    // Current line is full, push it and start new line
                    wrappedLines.push(currentLine);
                    currentLine = word;
                    currentLineWidth = this.calculateVariedTextWidth(word, globalCharIndex + currentLine.length + 1);
                }

                // If this is the last word, make sure to add the current line
                if (i === words.length - 1 && currentLine) {
                    wrappedLines.push(currentLine);
                    currentLine = '';
                }
            }

            // Handle case where we have remaining text
            if (currentLine) {
                wrappedLines.push(currentLine);
            }

            globalCharIndex += line.length + 1; // +1 for newline
        }

        return wrappedLines;
    }

    calculateVariedTextWidth(text, startIndex) {
        let totalWidth = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const variation = this.getCharVariation(char, startIndex + i);

            // Get base character width
            const baseWidth = this.ctx.measureText(char).width;

            // Apply variation scaling more conservatively
            const variedWidth = baseWidth * variation.scaleX + 0.5; // Remove absolute offset from width calculation

            totalWidth += variedWidth;
        }

        return totalWidth;
    }

    getCharVariation(char, position) {
        const variations = this.charVariations.get(char);
        if (!variations) {
            // Generate variation for unknown character
            return this.generateCharVariations(char, 1)[0];
        }

        // Use position-based variation selection for consistency
        return variations[position % variations.length];
    }

    drawVariedCharacter(char, x, y, variation) {
        this.ctx.save();

        // Apply transformations for natural handwriting variation
        this.ctx.translate(x + variation.offsetX, y + variation.offsetY);
        this.ctx.rotate(variation.rotation);
        this.ctx.scale(variation.scaleX, variation.scaleY);

        // Create realistic ink color with pressure variation
        const basePressure = variation.pressure;
        const inkIntensity = Math.min(1, basePressure * variation.inkFlow);
        const inkColor = `rgba(44, 62, 80, ${inkIntensity})`;
        this.ctx.fillStyle = inkColor;

        // Add realistic ink shadow and depth
        this.ctx.shadowColor = `rgba(44, 62, 80, ${inkIntensity * 0.4})`;
        this.ctx.shadowBlur = variation.pressure > 0.8 ? 1.2 : 0.8;
        this.ctx.shadowOffsetX = 0.6;
        this.ctx.shadowOffsetY = 0.6;

        // Draw main character
        this.ctx.fillText(char, 0, 0);

        // Add ink texture and irregularities
        this.addInkTexture(char, variation, inkIntensity);

        // Add ink bleeding effect for wet ink
        if (variation.smudge) {
            this.addCharacterSmudge(char, 0, 0, variation);
        }

        // Add pressure-based ink pooling
        if (variation.pressure > 0.85) {
            this.addInkPooling(char, variation);
        }

        this.ctx.restore();
    }

    addInkTexture(char, variation, inkIntensity) {
        // Add subtle ink texture variations
        const textureIntensity = inkIntensity * 0.15;

        // Multiple light layers for ink texture
        for (let i = 0; i < 3; i++) {
            this.ctx.save();

            const offsetX = (Math.random() - 0.5) * 1.5;
            const offsetY = (Math.random() - 0.5) * 1.5;
            const layerOpacity = textureIntensity * (0.3 + Math.random() * 0.4);

            this.ctx.fillStyle = `rgba(44, 62, 80, ${layerOpacity})`;
            this.ctx.translate(offsetX, offsetY);
            this.ctx.scale(0.98 + Math.random() * 0.04, 0.98 + Math.random() * 0.04);
            this.ctx.fillText(char, 0, 0);

            this.ctx.restore();
        }
    }

    addInkPooling(char, variation) {
        // Add ink pooling for heavy pressure
        this.ctx.save();

        const poolSize = 2 + Math.random() * 2;
        const poolOpacity = (variation.pressure - 0.85) * 0.4;

        this.ctx.fillStyle = `rgba(44, 62, 80, ${poolOpacity})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 2, poolSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    addCharacterSmudge(char, x, y, variation) {
        // Create realistic ink bleeding and smudging
        this.ctx.save();

        const smudgeIntensity = variation.pressure * variation.inkFlow * 0.25;

        // Create ink bleeding in multiple directions
        const smudgeDirections = [
            { x: 1, y: 0.3 },   // Right bleeding
            { x: -0.5, y: 0.7 }, // Left-down bleeding
            { x: 0.2, y: -0.4 }  // Up bleeding
        ];

        smudgeDirections.forEach((dir, index) => {
            this.ctx.save();

            const offsetX = dir.x * (1 + Math.random() * 2);
            const offsetY = dir.y * (1 + Math.random() * 2);
            const smudgeOpacity = smudgeIntensity * (0.4 + Math.random() * 0.3);

            this.ctx.fillStyle = `rgba(44, 62, 80, ${smudgeOpacity})`;
            this.ctx.translate(offsetX, offsetY);

            // Distort the smudged character
            const scaleX = 0.95 + Math.random() * 0.1;
            const scaleY = 0.85 + Math.random() * 0.2;
            this.ctx.scale(scaleX, scaleY);

            // Add slight rotation to smudge
            this.ctx.rotate((Math.random() - 0.5) * 0.1);

            this.ctx.fillText(char, 0, 0);
            this.ctx.restore();
        });

        // Add fiber-like ink spreading
        this.addInkFibers(variation.pressure);

        this.ctx.restore();
    }

    addInkFibers(pressure) {
        // Add realistic ink fiber spreading
        const fiberCount = Math.floor(pressure * 8 + 2);

        for (let i = 0; i < fiberCount; i++) {
            this.ctx.save();

            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 6 + 2;
            const thickness = Math.random() * 0.8 + 0.3;
            const opacity = pressure * 0.15 * Math.random();

            this.ctx.strokeStyle = `rgba(44, 62, 80, ${opacity})`;
            this.ctx.lineWidth = thickness;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
            this.ctx.stroke();

            this.ctx.restore();
        }
    }

    addInkSmudging() {
        // Add random ink smudges from writing (much less frequent)
        if (Math.random() < 0.03) { // 3% chance per input
            const x = Math.random() * this.characterOverlay.width;
            const y = Math.random() * this.characterOverlay.height;

            this.inkSmudges.push({
                x: x,
                y: y,
                size: Math.random() * 4 + 1.5,
                opacity: Math.random() * 0.06 + 0.01,
                age: 0
            });
        }

        // Age existing smudges
        this.inkSmudges = this.inkSmudges.filter(smudge => {
            smudge.age++;
            return smudge.age < 150; // Remove old smudges
        });
    }

    drawInkSmudges() {
        this.inkSmudges.forEach(smudge => {
            this.ctx.save();

            const fadeOpacity = smudge.opacity * (1 - smudge.age / 100);
            this.ctx.fillStyle = `rgba(44, 62, 80, ${fadeOpacity})`;

            this.ctx.beginPath();
            this.ctx.arc(smudge.x, smudge.y, smudge.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    addPaperWrinkling() {
        // Add paper wrinkles from writing pressure
        const textLength = this.writingArea.value.length;

        if (textLength > 0 && textLength % 25 === 0) { // Every 25 characters
            // Create realistic paper creases
            const x = Math.random() * this.characterOverlay.width * 0.8 + this.characterOverlay.width * 0.1;
            const y = Math.random() * this.characterOverlay.height * 0.8 + this.characterOverlay.height * 0.1;

            this.paperWrinkles.push({
                x: x,
                y: y,
                length: Math.random() * 60 + 30,
                angle: (Math.random() - 0.5) * Math.PI * 0.3, // More horizontal creases
                intensity: Math.random() * 0.08 + 0.03,
                age: 0,
                type: 'main_crease'
            });

            // Add secondary smaller creases
            for (let i = 0; i < 2; i++) {
                this.paperWrinkles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    length: Math.random() * 25 + 10,
                    angle: this.paperWrinkles[this.paperWrinkles.length - 1].angle + (Math.random() - 0.5) * 0.5,
                    intensity: Math.random() * 0.04 + 0.015,
                    age: 0,
                    type: 'secondary_crease'
                });
            }
        }
    }

    drawPaperWrinkles() {
        this.paperWrinkles.forEach(wrinkle => {
            this.ctx.save();

            const fadeIntensity = wrinkle.intensity * (1 - wrinkle.age / 300);

            if (wrinkle.type === 'main_crease') {
                // Draw main crease with shadow effect
                this.ctx.strokeStyle = `rgba(160, 160, 170, ${fadeIntensity})`;
                this.ctx.lineWidth = 1.2;
                this.ctx.lineCap = 'round';
            } else {
                // Draw secondary creases thinner
                this.ctx.strokeStyle = `rgba(180, 180, 190, ${fadeIntensity * 0.7})`;
                this.ctx.lineWidth = 0.8;
                this.ctx.lineCap = 'round';
            }

            // Draw the crease line
            this.ctx.beginPath();
            this.ctx.moveTo(wrinkle.x, wrinkle.y);

            const endX = wrinkle.x + Math.cos(wrinkle.angle) * wrinkle.length;
            const endY = wrinkle.y + Math.sin(wrinkle.angle) * wrinkle.length;

            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            // Add subtle shadow alongside crease for depth
            if (wrinkle.type === 'main_crease') {
                this.ctx.strokeStyle = `rgba(140, 140, 150, ${fadeIntensity * 0.3})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(wrinkle.x + 1, wrinkle.y + 1);
                this.ctx.lineTo(endX + 1, endY + 1);
                this.ctx.stroke();
            }

            wrinkle.age++;

            this.ctx.restore();
        });

        // Remove old wrinkles
        this.paperWrinkles = this.paperWrinkles.filter(wrinkle => wrinkle.age < 300);
    }

    hideTextInstantly() {
        // Immediately clear the overlay and hide text without showing original
        this.ctx.clearRect(0, 0, this.characterOverlay.width, this.characterOverlay.height);
        this.writingArea.classList.add('handwriting-active');

        // Clear the textarea value after a tiny delay to prevent flash
        setTimeout(() => {
            this.writingArea.value = '';
            // Trigger input event to update button state
            this.writingArea.dispatchEvent(new Event('input'));
        }, 50);
    }

    reset() {
        // Show original text again
        this.writingArea.classList.remove('handwriting-active');

        // Clear overlay completely
        this.ctx.clearRect(0, 0, this.characterOverlay.width, this.characterOverlay.height);

        // Clear effects
        this.inkSmudges = [];
        this.paperWrinkles = [];

        // Force immediate redraw to ensure overlay is clean
        this.redrawText();
    }

    destroy() {
        if (this.characterOverlay && this.characterOverlay.parentNode) {
            this.characterOverlay.parentNode.removeChild(this.characterOverlay);
        }

        // Restore original text visibility
        this.writingArea.classList.remove('handwriting-active');

        window.removeEventListener('resize', this.setupCanvas);
    }
}