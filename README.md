# Digital Crumple - Therapeutic Writing Experience

A unique web application that simulates the cathartic experience of writing your thoughts on paper and then crumpling it up. Digital Crumple provides a safe, private space for stream-of-consciousness writing with realistic paper physics and handwriting effects.

## What It Does

Digital Crumple recreates the therapeutic ritual of writing down your thoughts, worries, or frustrations and then physically destroying the paper. When you're done writing, watch your digital paper crumple with realistic physics and fall away - symbolically letting go of whatever weighs on your mind.

## Features

### Realistic Handwriting Simulation
- **Variable Character Rendering**: Each character appears slightly different every time, mimicking natural handwriting variations
- **Ink Pressure Effects**: Characters vary in opacity and thickness based on simulated writing pressure
- **Ink Smudging & Bleeding**: Realistic ink effects with directional bleeding and fiber-like spreading
- **Paper Aging**: The paper gradually ages as you write more, with subtle yellowing and ink blots

### Authentic Paper Experience
- **Fiber-Based Paper Texture**: Paper background generated using thousands of tiny random lines to simulate real paper fibers
- **Writing Pressure Creases**: Paper develops realistic creases and wrinkles from heavy writing
- **Dynamic Aging**: Paper yellowing, coffee stains, and wear patterns appear based on writing intensity

### Physics-Based Crumpling
- **Matter.js Integration**: Realistic paper physics simulation using constraint-based body systems
- **Paper Mesh**: 12x16 grid of interconnected physics bodies that deform naturally
- **Gravity & Collision**: Crumpled paper falls and bounces realistically
- **CSS Fallback**: Smooth CSS animations when physics engine isn't available

### Natural Writing Interface
- **Smart Text Wrapping**: Accounts for character variations when determining line breaks
- **Precise Positioning**: Handwritten text appears exactly where typed text would be
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility Features**: Full keyboard navigation and screen reader support

## Technical Implementation

### Handwriting Variation System
The app uses a canvas overlay system to create realistic handwriting:

```javascript
// Each character gets unique variations
generateCharVariations(char, count) {
    return variations.map(() => ({
        rotation: (Math.random() - 0.5) * 0.15,
        scaleX: 0.92 + Math.random() * 0.16,
        scaleY: 0.92 + Math.random() * 0.16,
        offsetX: (Math.random() - 0.5) * 3,
        offsetY: (Math.random() - 0.5) * 3,
        pressure: 0.65 + Math.random() * 0.35,
        inkFlow: 0.8 + Math.random() * 0.4
    }));
}
```

### Paper Physics Engine
Built with Matter.js for realistic paper behavior:

```javascript
// Create interconnected paper mesh
createPaperMesh() {
    const rows = 12, cols = 16;

    // Create physics bodies for each vertex
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const body = Matter.Bodies.circle(x, y, 2, {
                frictionAir: 0.02,
                mass: 0.1
            });
            this.paperBodies[row][col] = body;
        }
    }

    // Add constraints between adjacent vertices
    this.createConstraints();
}
```

### Intelligent Text Wrapping
Accounts for character variations when calculating line breaks:

```javascript
calculateVariedTextWidth(text, startIndex) {
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        const variation = this.getCharVariation(char, startIndex + i);
        const baseWidth = this.ctx.measureText(char).width;
        totalWidth += baseWidth * variation.scaleX + 0.5;
    }
    return totalWidth;
}
```

### Paper Texture Generation
Creates realistic paper using fiber-based rendering:

```javascript
drawPaperFiberTexture() {
    const numFibers = Math.floor((canvas.width * canvas.height) / 300);

    for (let i = 0; i < numFibers; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const length = Math.random() * 4 + 1.5;

        // Draw individual paper fibers
        ctx.strokeStyle = `rgba(245, 245, 250, ${opacity})`;
        ctx.lineWidth = 0.4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}
```

## Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mustafapiplodi/digital-crumple.git
cd digital-crumple
```

2. Start a local web server:
```bash
# Using Python
python -m http.server 9000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:9000
```

3. Open your browser to `http://localhost:9000`

### Usage

1. **Start Writing**: Click anywhere on the paper and begin typing your thoughts
2. **Watch the Magic**: See your text appear in realistic handwriting with natural variations
3. **Crumple When Ready**: Press the "Crumple" button or use Ctrl/Cmd+Enter
4. **Let Go**: Watch your paper crumple with physics and fall away
5. **Start Fresh**: Begin again with a clean sheet

## Customization

### Handwriting Fonts
The app uses these Google Fonts for handwriting:
- Kalam
- Caveat
- Dancing Script

You can modify the font stack in `styles/main.css`:

```css
font-family: 'Kalam', 'Caveat', 'Dancing Script', cursive;
```

### Physics Parameters
Adjust crumpling behavior in `scripts/paper-physics-matter.js`:

```javascript
// Crumpling force intensity
const maxForce = 0.035;

// Paper mesh density
const rows = 12;
const cols = 16;

// Constraint stiffness
const stiffness = 0.9;
```

### Paper Aging Effects
Customize aging behavior in `scripts/paper-aging.js`:

```javascript
// Aging speed (characters per aging event)
if (textLength % 25 === 0) {
    this.addPaperWrinkling();
}

// Yellowing intensity
const yellowIntensity = this.agingLevel * 0.08;
```

## Project Structure

```
digital-crumple/
├── index.html                    # Main application page
├── styles/
│   ├── main.css                 # Core styles and layout
│   ├── paper.css                # Paper surface styling
│   └── animations.css           # Crumpling animations
├── scripts/
│   ├── main.js                  # Application controller
│   ├── paper-texture.js         # Paper fiber generation
│   ├── paper-aging.js           # Aging and wear effects
│   ├── handwriting-variation.js # Character variation system
│   ├── writing-experience.js    # Typing feedback effects
│   ├── paper-physics.js         # CSS animation fallback
│   └── paper-physics-matter.js  # Matter.js physics engine
└── README.md
```

## Browser Compatibility

- **Chrome/Edge**: Full feature support
- **Firefox**: Full feature support
- **Safari**: Full feature support
- **Mobile**: Responsive design with touch support

## Use Cases

- **Stress Relief**: Write down frustrations and watch them disappear
- **Journaling**: Private space for stream-of-consciousness writing
- **Therapy**: Digital version of expressive writing exercises
- **Creative Writing**: Unique environment for brainstorming and ideation
- **Meditation**: Mindful writing and letting go practice

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Mustafa Piplodi**
- LinkedIn: [mustafapiplodi](https://linkedin.com/in/mustafapiplodi)
- Company: [Scaling High Technologies](https://scalinghigh.com)

## Acknowledgments

- Matter.js physics engine for realistic paper simulation
- Google Fonts for beautiful handwriting typography
- The therapeutic writing community for inspiration

---

*Made for anyone who needs a safe space to write and let go.*