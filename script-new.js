class RabbitHole {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.5; // Zoomed in more
        
        // Animation properties
        this.offset = 0;
        this.colors = [
            '#6B3410', // Dark brown
            '#8B4513', // Saddle brown
            '#A0522D', // Sienna
            '#B8651E', // Medium brown
            '#CD853F', // Peru
            '#D2691E', // Chocolate
            '#E07B2F', // Burnt orange
            '#DEB887', // Burlywood
            '#F4A460', // Sandy brown
            '#FFB870', // Light orange
            '#FFC990', // Peach
            '#FFDAB0'  // Light peach
        ];
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.5; // Zoomed in more
    }
    
    animate() {
        // Clear with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Increment offset smoothly
        this.offset += 0.6; // Slower speed for smoother checkerboard
        
        // Calculate all ring positions
        const rings = [];
        const ringSpacing = 6; // Closer spacing for more rings
        
        // Generate enough rings to fill the depth
        const totalRings = 240; // Double the rings
        const loopDistance = totalRings * ringSpacing;
        
        for (let i = 0; i < totalRings; i++) {
            // Each ring has a base position that wraps seamlessly
            const basePosition = (i * ringSpacing) - (this.offset % loopDistance);
            let z = 60 + basePosition;
            
            // Wrap to create infinite loop
            if (z < 50) {
                z += loopDistance;
            }
            
            // Skip if too far away
            if (z > 1000) continue;
            
            // Perspective
            const scale = 90 / z;
            const radius = this.maxRadius * scale;
            
            // Skip tiny rings
            if (radius < 1) continue;
            
            // Curve: deeper rings shift left
            const depth = z - 50;
            const curveX = this.centerX - (depth * 0.3);
            
            // Skip rings that curved off screen
            if (curveX + radius < 0) continue;
            
            // Color based on original ring index (not z position)
            const colorIndex = i % this.colors.length;
            
            rings.push({
                z: z,
                radius: radius,
                curveX: curveX,
                colorIndex: colorIndex
            });
        }
        
        // Sort by z (farthest first)
        rings.sort((a, b) => b.z - a.z);
        
        // Draw all rings with checkerboard pattern
        const numSegments = 24; // Number of checkerboard segments around each ring
        
        for (let ringIdx = 0; ringIdx < rings.length; ringIdx++) {
            const ring = rings[ringIdx];
            const color = this.colors[ring.colorIndex];
            
            const bandWidth = Math.max(2, ring.radius * 0.22);
            const innerRadius = ring.radius - bandWidth;
            
            if (innerRadius > 0) {
                // Draw checkerboard segments with smooth fade transitions
                for (let seg = 0; seg < numSegments; seg++) {
                    // Alternate colors in checkerboard pattern
                    // Pattern alternates both radially (segment) and depth-wise (ring)
                    const isAlternate = (seg + ringIdx) % 2 === 0;
                    
                    const startAngle = (seg / numSegments) * Math.PI * 2;
                    const endAngle = ((seg + 1) / numSegments) * Math.PI * 2;
                    
                    // Create radial gradient from outer to inner edge for fade effect
                    const gradient = this.ctx.createRadialGradient(
                        ring.curveX, this.centerY, innerRadius,
                        ring.curveX, this.centerY, ring.radius
                    );
                    
                    if (isAlternate) {
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(0.3, color);
                        gradient.addColorStop(0.7, color);
                        gradient.addColorStop(1, '#000000');
                    } else {
                        gradient.addColorStop(0, '#000000');
                        gradient.addColorStop(0.3, '#000000');
                        gradient.addColorStop(0.7, '#000000');
                        gradient.addColorStop(1, color);
                    }
                    
                    this.ctx.fillStyle = gradient;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(ring.curveX, this.centerY, ring.radius, startAngle, endAngle);
                    this.ctx.arc(ring.curveX, this.centerY, innerRadius, endAngle, startAngle, true);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new RabbitHole();
});