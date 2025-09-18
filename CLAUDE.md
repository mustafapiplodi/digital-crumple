# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **therapeutic web application** called "Digital Crumple" that allows users to write their thoughts on virtual paper and watch it crumple with satisfying animations for stress relief. The project is designed as a **client-side only application** with no external dependencies, focusing on privacy and simplicity.

## Core Architecture

### File Structure (Planned)
```
digital-crumble/
├── index.html              # Main application entry point
├── styles/
│   ├── main.css            # Core styles and layout
│   ├── paper.css           # Paper texture and styling
│   └── animations.css      # Crumple animations
├── scripts/
│   ├── main.js             # Application logic
│   ├── paper-physics.js    # Animation controllers
│   └── paper-texture.js    # Canvas texture generation
└── README.md
```

## Development Commands

**Note**: This project uses no build tools or external dependencies. Development is done with simple file serving.

### Local Development
```bash
# Serve files locally (Python 3)
python -m http.server 8000

# Alternative (Python 2)
python -SimpleHTTPServer 8000

# Or use any static file server
npx serve .
```

### Testing
- Manual testing in browsers (no automated test framework)
- Test across major browsers: Chrome, Firefox, Safari, Edge
- Mobile responsiveness testing required
- Performance testing target: 60fps animations

## Technical Specifications

### Core Technologies
- **Pure HTML5/CSS3/JavaScript** - No frameworks or external libraries
- **Canvas API** - For paper texture generation
- **CSS Transforms** - For 3D crumpling animation
- **Web Audio API** - For therapeutic audio feedback (if implemented)

### Design Constraints
- **Privacy-first**: No data collection, local storage only for preferences
- **Client-side only**: No server dependencies or external requests
- **Performance target**: 60fps animations, <50MB memory usage
- **Aesthetic**: Minimal black and white design, typewriter fonts

### Key Implementation Details
- **Full-screen writing experience**: Invisible textarea covering entire viewport
- **Paper texture**: Procedurally generated using Canvas with subtle grain
- **Animation stages**: Multi-phase crumple (fold → scrunch → ball → fade)
- **Therapeutic focus**: Satisfying tactile feedback and visual metaphors

## Development Patterns

### Animation Performance
- Use `transform3d()` for GPU acceleration
- Implement `will-change` property strategically
- Target 16.67ms frame budget for 60fps
- Use object pooling for particle systems if implemented

### Accessibility Requirements
- High contrast for readability
- Keyboard navigation support (ESC to clear text)
- Touch-friendly mobile interactions
- Reduced motion preferences support

### Code Style
- **Semantic HTML5** structure
- **CSS custom properties** for theming
- **Modern JavaScript** (ES6+) with graceful degradation
- **Progressive enhancement** - core functionality works without advanced features

## Project Context

This is a **Level 3 client-side therapeutic application** focusing on:
- Immediate stress relief through satisfying animations
- Privacy protection (no data leaves the device)
- Universal accessibility (works on any modern browser)
- Minimal learning curve (intuitive paper metaphor)

The project aims to provide an alternative to traditional meditation apps through a novel physical interaction metaphor that requires no learning curve and provides immediate satisfaction.