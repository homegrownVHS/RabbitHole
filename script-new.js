class RabbitHoleTunnel {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 20, 60);
        
        // Camera setup - positioned inside the tunnel looking down the Z axis
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 5);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Color palette
        this.colors = [
            0x8B4513, // Saddle brown
            0xA0522D, // Sienna  
            0xCD853F, // Peru
            0xD2691E, // Chocolate
            0xDEB887, // Burlywood
            0xF4A460, // Sandy brown
            0xFF6B35, // Vibrant orange
            0xFF8C42, // Bright tangerine
            0xC44569, // Deep rose
            0x9B59B6, // Purple
            0x3498DB, // Blue
            0x1ABC9C  // Turquoise
        ];
        
        // Create tunnel segments
        this.tunnelSegments = [];
        this.createTunnel();
        
        // Lighting - lower for darker atmosphere
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1.0, 60);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
        
        // Animation properties
        this.speed = 0.08;
        this.tunnelOffset = 0;
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    createTunnel() {
        const segmentLength = 0.5;
        const numSegments = 200;
        const radius = 3;
        const radialSegments = 32;
        
        for (let i = 0; i < numSegments; i++) {
            const z = -i * segmentLength;
            const colorIndex = i % this.colors.length;
            
            // Create ring geometry (torus shape)
            const geometry = new THREE.TorusGeometry(radius, 0.15, 16, radialSegments);
            
            // Material with color and lighting
            const material = new THREE.MeshStandardMaterial({
                color: this.colors[colorIndex],
                roughness: 0.4,
                metalness: 0.6,
                emissive: this.colors[colorIndex],
                emissiveIntensity: 0.1
            });
            
            const ring = new THREE.Mesh(geometry, material);
            
            // Curve the tunnel - spiral path
            const curveX = Math.sin(Math.abs(z) * 0.05) * Math.abs(z) * 0.15;
            const curveY = Math.cos(Math.abs(z) * 0.05) * Math.abs(z) * 0.15;
            ring.position.set(curveX, curveY, z);
            
            // Rings face the camera (perpendicular to Z axis)
            
            this.scene.add(ring);
            this.tunnelSegments.push({
                mesh: ring,
                originalZ: z,
                colorIndex: colorIndex
            });
        }
    }
    
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Move through tunnel
        this.tunnelOffset += this.speed;
        
        // Update ring positions for infinite loop - rings move toward camera
        this.tunnelSegments.forEach(segment => {
            segment.mesh.position.z += this.speed;
            
            // Update curve position as rings move along spiral path
            const z = segment.mesh.position.z;
            const curveX = Math.sin(Math.abs(z) * 0.05) * Math.abs(z) * 0.15;
            const curveY = Math.cos(Math.abs(z) * 0.05) * Math.abs(z) * 0.15;
            segment.mesh.position.x = curveX;
            segment.mesh.position.y = curveY;
            
            // Reset rings that pass the camera
            if (segment.mesh.position.z > 10) {
                segment.mesh.position.z = -90;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
new RabbitHoleTunnel();
