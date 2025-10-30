console.log('Script loaded');
alert('JavaScript is working!');

class RabbitHole {
    constructor() {
        console.log('RabbitHole constructor called');
        this.canvas = document.getElementById('tunnelCanvas');
        console.log('Canvas element:', this.canvas);
        
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas context:', this.ctx);
        
        if (!this.ctx) {
            console.error('Could not get canvas context!');
            return;
        }
        
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        
        // Test drawing immediately
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Red background drawn');
        
        // Start animation
        this.time = 0;
        this.animate();
    }
    
    animate() {
        // Blue background
        this.ctx.fillStyle = '#000066';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Moving white circle for testing
        const x = this.centerX + Math.sin(this.time * 0.02) * 100;
        const y = this.centerY + Math.cos(this.time * 0.02) * 100;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple tunnel rings
        for (let i = 1; i <= 10; i++) {
            const radius = (i * 50) + (this.time % 50);
            if (radius > 400) continue;
            
            this.ctx.strokeStyle = i % 2 === 0 ? '#FFFFFF' : '#FFFF00';
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.time += 1;
        requestAnimationFrame(() => this.animate());
    }
    

    
    animate() {
        // Clear canvas completely for crisp rendering
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update time
        this.time += this.speed;
        
        // Simplified tunnel drawing for debugging
        const ringSpacing = 8;
        const maxDepth = 500;
        const offset = this.time % ringSpacing;
        
        // Draw rings from back to front
        for (let i = 0; i < this.ringPositions.length; i++) {
            const ring = this.ringPositions[i];
            let z = ring.baseZ - offset;
            
            // Wrap rings when they get too close
            if (z < 50) {
                z += this.ringPositions.length * ringSpacing;
            }
            
            // Only draw visible rings
            if (z > maxDepth) continue;
            
            // Simple curve calculation
            const curveOffset = -(z - 50) * 0.3;
            
            this.drawTunnelRing(z, curveOffset, ring.colorIndex);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
}

// Simple test without classes
function simpleTest() {
    console.log('Simple test running');
    const canvas = document.getElementById('tunnelCanvas');
    if (!canvas) {
        alert('Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        alert('Context not found!');
        return;
    }
    
    // Set size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Draw something obvious
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(100, 100, 200, 200);
    
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI * 2);
    ctx.fill();
    
    alert('Canvas test complete - you should see red background, white square, green circle');
}

// Try multiple ways to initialize
setTimeout(simpleTest, 100);
document.addEventListener('DOMContentLoaded', simpleTest);
window.addEventListener('load', simpleTest);

// Also try the class approach
window.addEventListener('load', () => {
    console.log('Page loaded, creating RabbitHole');
    new RabbitHole();
});