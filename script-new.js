class RabbitHole {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.8; // Zoomed out to see deeper
        
        // Animation properties
        this.offset = 0;
        this.patternPhase = 0; // Smooth pattern phase
        this.baseColors = [
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
        
        // Generate many varied colors from base palette
        this.colors = [];
        for (let i = 0; i < 100; i++) {
            const baseIndex = i % this.baseColors.length;
            const baseColor = this.baseColors[baseIndex];
            
            // Add variation to each color
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            
            // Vary the color slightly based on index
            const variation = (Math.sin(i * 0.5) * 0.15) + 1;
            const varyR = Math.max(0, Math.min(255, Math.floor(r * variation)));
            const varyG = Math.max(0, Math.min(255, Math.floor(g * variation)));
            const varyB = Math.max(0, Math.min(255, Math.floor(b * variation)));
            
            this.colors.push(`rgb(${varyR}, ${varyG}, ${varyB})`);
        }
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    blendColors(color1, color2, amount) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.floor(r1 + (r2 - r1) * amount);
        const g = Math.floor(g1 + (g2 - g1) * amount);
        const b = Math.floor(b1 + (b2 - b1) * amount);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.8; // Zoomed out to see deeper
    }
    
    animate() {
        // Clear with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Increment offset smoothly
        this.offset += 1.2;
        
        // Calculate all ring positions
        const rings = [];
        const ringSpacing = 8; // Wider spacing for performance
        const numSegments = 16; // Number of checkerboard segments
        
        // Generate enough rings to fill the depth
        const totalRings = 200; // Fewer rings for better performance
        const loopDistance = totalRings * ringSpacing;
        
        // Calculate pattern phase based on offset
        this.patternPhase = (this.offset / 8) % numSegments; // Smooth pattern phase
        
        for (let i = 0; i < totalRings; i++) {
            // Each ring has a base position that wraps seamlessly
            const basePosition = (i * ringSpacing) - (this.offset % loopDistance);
            let z = 60 + basePosition;
            
            // Wrap to create infinite loop
            if (z < 50) {
                z += loopDistance;
            }
            
            // Skip if too far away - extend much further
            if (z > 3000) continue;
            
            // Perspective
            const scale = 90 / z;
            const radius = this.maxRadius * scale;
            
            // Skip tiny rings - but allow smaller ones to fill center
            if (radius < 0.5) continue;
            
            // Curve: deeper rings shift left
            const depth = z - 50;
            const curveX = this.centerX - (depth * 0.3);
            
            // Skip rings that curved off screen
            if (curveX + radius < 0) continue;
            
            // Don't skip tiny rings - we want them to fill the center
            // if (radius < 1) continue; // REMOVED
            
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
        
        // Draw all rings with smooth checkerboard pattern
        for (let ringIdx = 0; ringIdx < rings.length; ringIdx++) {
            const ring = rings[ringIdx];
            const color = this.colors[ring.colorIndex];
            
            const bandWidth = Math.max(5, ring.radius * 0.4);
            const innerRadius = ring.radius - bandWidth;
            
            if (innerRadius > 0) {
                // Create radial gradient for 3D depth effect
                const gradient = this.ctx.createRadialGradient(
                    ring.curveX, this.centerY, innerRadius,
                    ring.curveX, this.centerY, ring.radius
                );
                
                // Parse color for darker version (handle both hex and rgb formats)
                let r, g, b;
                if (color.startsWith('#')) {
                    r = parseInt(color.slice(1, 3), 16);
                    g = parseInt(color.slice(3, 5), 16);
                    b = parseInt(color.slice(5, 7), 16);
                } else {
                    // Parse rgb(r, g, b) format
                    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    r = parseInt(matches[1]);
                    g = parseInt(matches[2]);
                    b = parseInt(matches[3]);
                }
                
                // Calculate depth fade - farther rings are darker (lighter fade to see deeper)
                const depthFade = Math.max(0.35, Math.min(1, (3000 - ring.z) / 2940)); // Fade based on z distance
                
                // Apply depth fade to colors
                const baseR = Math.floor(r * depthFade);
                const baseG = Math.floor(g * depthFade);
                const baseB = Math.floor(b * depthFade);
                
                const baseColor = `rgb(${baseR}, ${baseG}, ${baseB})`;
                const darkerColor = `rgb(${Math.floor(baseR * 0.4)}, ${Math.floor(baseG * 0.4)}, ${Math.floor(baseB * 0.4)})`;
                const lighterColor = `rgb(${Math.min(255, Math.floor(baseR * 1.15))}, ${Math.min(255, Math.floor(baseG * 1.15))}, ${Math.min(255, Math.floor(baseB * 1.15))})`;
                
                gradient.addColorStop(0, darkerColor);
                gradient.addColorStop(0.2, baseColor);
                gradient.addColorStop(0.8, baseColor);
                gradient.addColorStop(1, lighterColor);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(ring.curveX, this.centerY, ring.radius, 0, Math.PI * 2);
                this.ctx.arc(ring.curveX, this.centerY, innerRadius, 0, Math.PI * 2, true);
                this.ctx.fill();
                
                // Add subtle highlight line at inner edge for extra depth
                this.ctx.strokeStyle = lighterColor;
                this.ctx.lineWidth = Math.max(1, ring.radius * 0.02);
                this.ctx.beginPath();
                this.ctx.arc(ring.curveX, this.centerY, innerRadius + this.ctx.lineWidth / 2, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Add smooth flowing pattern overlay - thicker lines
                const numLines = 16; // More lines radiating from center
                const linePhase = (ring.z / 100); // Even slower rotation
                
                // Constant size - dots don't shrink with distance
                const lineWidth = Math.max(3, ring.radius * 0.08);
                this.ctx.lineCap = 'round';
                
                for (let i = 0; i < numLines; i++) {
                    // Angle rotates smoothly with depth
                    const angle = (i / numLines) * Math.PI * 2 + linePhase;
                    const x1 = ring.curveX + Math.cos(angle) * innerRadius;
                    const y1 = this.centerY + Math.sin(angle) * innerRadius;
                    const x2 = ring.curveX + Math.cos(angle) * ring.radius;
                    const y2 = this.centerY + Math.sin(angle) * ring.radius;
                    
                    // Draw black border first (thicker)
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = lineWidth + 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    
                    // Draw colored line on top
                    this.ctx.strokeStyle = `rgba(${Math.min(255, Math.floor(baseR * 1.4))}, ${Math.min(255, Math.floor(baseG * 1.4))}, ${Math.min(255, Math.floor(baseB * 1.4))}, 0.7)`;
                    this.ctx.lineWidth = lineWidth;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
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