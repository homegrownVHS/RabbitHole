# Alice's Rabbit Hole - Infinite Tunnel Animation

A mesmerizing pseudo 3D animation recreating the famous rabbit hole scene from Alice in Wonderland. This project creates an infinite tunnel effect that simulates the sensation of falling endlessly down the rabbit hole.

## Features

- **Pseudo 3D Tunnel Effect**: Creates the illusion of depth using perspective scaling
- **Infinite Animation**: Seamless looping tunnel that appears to go on forever
- **Alice in Wonderland Theme**: 
  - Floating whimsical objects (hats, teapots, clocks, keys, playing cards, roses)
  - Earth-toned color palette inspired by the original illustrations
  - Typography and quotes from the story
- **Interactive Elements**: Responsive to mouse movement and keyboard input
- **Atmospheric Effects**: Particles and gradient lighting for immersion
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

The animation uses HTML5 Canvas and JavaScript to create a series of concentric rings that:
1. Scale down based on their distance (perspective effect)
2. Move toward the viewer continuously
3. Reset to the back when they get too close
4. Rotate at different speeds for organic movement

The illusion of infinite depth is achieved by:
- Constantly moving rings forward
- Seamlessly recycling rings from front to back
- Using transparency and scaling to create depth perception
- Adding floating objects that follow orbital paths

## Project Structure

```
RabbitHole/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # Animation logic and 3D effects
├── README.md           # This file
└── .github/
    └── copilot-instructions.md
```

## Getting Started

### Prerequisites
- A modern web browser that supports HTML5 Canvas
- No additional dependencies required

### Running the Project

1. **Local Development**: Open `index.html` directly in your web browser
2. **Local Server** (recommended for best performance):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

### Browser Compatibility
- Chrome/Chromium: Full support
- Firefox: Full support  
- Safari: Full support
- Edge: Full support
- Mobile browsers: Supported with touch interactions

## Customization

### Changing Animation Speed
Modify the `speed` property in the `RabbitHole` constructor:
```javascript
this.speed = 0.02; // Decrease for slower, increase for faster
```

### Adding New Floating Objects
Edit the `objects` array in the `drawFloatingObjects` method:
```javascript
const objects = ['🎩', '🫖', '🕰️', '🗝️', '🃏', '🌹', 'YOUR_EMOJI_HERE'];
```

### Customizing Colors
Modify the `colors` array to change the tunnel's color scheme:
```javascript
this.colors = [
    '#8B4513', // Your custom colors here
    '#A0522D',
    // ... add more colors
];
```

## Technical Details

- **Animation Frame Rate**: 60 FPS (using requestAnimationFrame)
- **Rendering**: HTML5 Canvas 2D Context
- **Perspective Calculation**: Mathematical perspective projection
- **Performance**: Optimized for smooth animation on most devices

## Alice in Wonderland References

> "Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next."

The animation includes various references to Lewis Carroll's classic:
- Floating objects from the tea party and story
- Color palette inspired by original illustrations
- Typography reminiscent of Victorian-era books
- Quotes from the original text

## Future Enhancements

Potential improvements could include:
- Audio integration with ambient sounds
- More complex 3D geometry
- Interactive object collection
- Multiple tunnel themes
- WebGL for enhanced performance
- VR/AR compatibility

## License

This project is open source and available under the MIT License.

## Credits

Inspired by Lewis Carroll's "Alice's Adventures in Wonderland" and the countless visual interpretations of the rabbit hole scene in popular culture.