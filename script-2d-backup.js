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
            '#F4A460', // Sandy brown
            '#FF6B35', // Vibrant orange
            '#FF8C42', // Bright tangerine
            '#C44569', // Deep rose
            '#9B59B6', // Purple
            '#3498DB', // Blue
            '#1ABC9C'  // Turquoise
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
            
            // Extended depth for infinite feel
            if (z > 3000) continue;
            
            // Perspective
            const scale = 90 / z;
            const radius = this.maxRadius * scale;
            
            // Allow smaller rings to extend further
            if (radius < 0.5) continue;
            
            // Subtle curve: deeper rings shift left
            const depth = z - 50;
            const curveX = this.centerX - (depth * 0.15);
            
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
        
        // Draw all rings with realistic leather texture and imperfections
        for (const ring of rings) {
            const color = this.colors[ring.colorIndex];
            const bandWidth = Math.max(2, ring.radius * 0.22);
            const innerRadius = ring.radius - bandWidth;
            
            if (innerRadius > 0) {
                // Parse base color
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                // Depth-based darkening for distance fade
                const depthFactor = Math.max(0.4, 1 - (ring.z / 4000));
                
                // Use z-based seed for consistent but varied imperfections per ring
                const seed = Math.sin(ring.z * 0.1) * 1000;
                
                // Static gradient offset for imperfect surface (not animated)
                const imperfectionOffset1 = Math.sin(ring.z * 0.03) * 0.15;
                const imperfectionOffset2 = Math.cos(ring.z * 0.05) * 0.12;
                
                // Create radial gradient with offset center for imperfect reflection
                const gradientCenterX = ring.curveX + (Math.sin(seed) * bandWidth * 0.3);
                const gradientCenterY = this.centerY + (Math.cos(seed * 1.3) * bandWidth * 0.3);
                
                const gradient = this.ctx.createRadialGradient(
                    gradientCenterX, gradientCenterY, innerRadius * 0.8,
                    ring.curveX, this.centerY, ring.radius
                );
                
                // Static leather gradient stops based on z position
                const stop1 = 0.2 + imperfectionOffset1;
                const stop2 = 0.4 + imperfectionOffset2;
                const stop3 = 0.55 + Math.sin(ring.z * 0.07) * 0.1;
                
                gradient.addColorStop(0, `rgba(${Math.floor(r * 0.25 * depthFactor)}, ${Math.floor(g * 0.25 * depthFactor)}, ${Math.floor(b * 0.25 * depthFactor)}, 1)`);
                gradient.addColorStop(Math.max(0.1, Math.min(0.35, stop1)), `rgba(${Math.floor(r * 0.6 * depthFactor)}, ${Math.floor(g * 0.6 * depthFactor)}, ${Math.floor(b * 0.6 * depthFactor)}, 1)`);
                gradient.addColorStop(Math.max(0.3, Math.min(0.5, stop2)), `rgba(${Math.floor(r * depthFactor)}, ${Math.floor(g * depthFactor)}, ${Math.floor(b * depthFactor)}, 1)`);
                gradient.addColorStop(Math.max(0.45, Math.min(0.65, stop3)), `rgba(${Math.min(255, Math.floor(r * 2.0 * depthFactor))}, ${Math.min(255, Math.floor(g * 2.0 * depthFactor))}, ${Math.min(255, Math.floor(b * 2.0 * depthFactor))}, 1)`);
                gradient.addColorStop(0.75, `rgba(${Math.floor(r * 0.85 * depthFactor)}, ${Math.floor(g * 0.85 * depthFactor)}, ${Math.floor(b * 0.85 * depthFactor)}, 1)`);
                gradient.addColorStop(1, `rgba(${Math.floor(r * 0.4 * depthFactor)}, ${Math.floor(g * 0.4 * depthFactor)}, ${Math.floor(b * 0.4 * depthFactor)}, 1)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(ring.curveX, this.centerY, ring.radius, 0, Math.PI * 2);
                this.ctx.arc(ring.curveX, this.centerY, innerRadius, 0, Math.PI * 2, true);
                this.ctx.fill();
                
                // Add cracked leather texture patterns
                if (ring.radius > 5) {
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.3 * depthFactor})`;
                    this.ctx.lineWidth = 0.5;
                    
                    // Radial cracks spreading from center
                    const numRadialCracks = Math.floor(ring.radius / 15) + 3;
                    for (let i = 0; i < numRadialCracks; i++) {
                        const angle = (seed + i * 2.4) % (Math.PI * 2);
                        const startDist = innerRadius + (Math.sin(seed + i * 0.7) * 0.5 + 0.5) * bandWidth * 0.3;
                        const endDist = innerRadius + (Math.sin(seed + i * 0.7) * 0.5 + 0.5) * bandWidth * 0.9;
                        
                        const x1 = ring.curveX + Math.cos(angle) * startDist;
                        const y1 = this.centerY + Math.sin(angle) * startDist;
                        const x2 = ring.curveX + Math.cos(angle + Math.sin(seed + i) * 0.3) * endDist;
                        const y2 = this.centerY + Math.sin(angle + Math.sin(seed + i) * 0.3) * endDist;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.stroke();
                    }
                    
                    // Circumferential cracks following the ring curve
                    const numCircCracks = Math.floor(ring.radius / 20) + 2;
                    for (let i = 0; i < numCircCracks; i++) {
                        const crackRadius = innerRadius + (Math.sin(seed * 1.3 + i) * 0.5 + 0.5) * bandWidth;
                        const startAngle = (seed + i * 1.8) % (Math.PI * 2);
                        const arcLength = (Math.PI / 6) + Math.sin(seed + i * 0.5) * (Math.PI / 12);
                        
                        this.ctx.beginPath();
                        this.ctx.arc(ring.curveX, this.centerY, crackRadius, startAngle, startAngle + arcLength);
                        this.ctx.stroke();
                    }
                    
                    // Small branch cracks
                    this.ctx.lineWidth = 0.3;
                    const numBranches = Math.floor(ring.radius / 25) + 2;
                    for (let i = 0; i < numBranches; i++) {
                        const angle = (seed * 0.6 + i * 3.1) % (Math.PI * 2);
                        const midDist = innerRadius + bandWidth * 0.5;
                        const cx = ring.curveX + Math.cos(angle) * midDist;
                        const cy = this.centerY + Math.sin(angle) * midDist;
                        
                        const branchLen = bandWidth * 0.3;
                        const branchAngle = angle + Math.PI / 2 + Math.sin(seed + i * 1.2) * 0.5;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(cx, cy);
                        this.ctx.lineTo(
                            cx + Math.cos(branchAngle) * branchLen,
                            cy + Math.sin(branchAngle) * branchLen
                        );
                        this.ctx.stroke();
                    }
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