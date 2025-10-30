class RabbitHole {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.7;
        
        // Animation properties
        this.offset = 0;
        this.colors = [
            '#8B4513', // Saddle brown
            '#A0522D', // Sienna  
            '#CD853F', // Peru
            '#D2691E', // Chocolate
            '#DEB887', // Burlywood
            '#F4A460'  // Sandy brown
        ];
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.7;
    }
    
    animate() {
        // Clear with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Increment offset smoothly
        this.offset += 1.2;
        
        // Calculate all ring positions
        const rings = [];
        const ringSpacing = 12;
        
        // Generate enough rings to fill the depth
        const totalRings = 120;
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
        
        // Draw all rings
        for (const ring of rings) {
            const color = this.colors[ring.colorIndex];
            const bandWidth = Math.max(2, ring.radius * 0.22);
            const innerRadius = ring.radius - bandWidth;
            
            if (innerRadius > 0) {
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(ring.curveX, this.centerY, ring.radius, 0, Math.PI * 2);
                this.ctx.arc(ring.curveX, this.centerY, innerRadius, 0, Math.PI * 2, true);
                this.ctx.fill();
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new RabbitHole();
});