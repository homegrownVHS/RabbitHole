class RabbitHoleTunnel {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 20, 60);
        
        // Camera setup - positioned inside the tunnel looking down the Z axis
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 5);
        
        // Renderer setup with modern features
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.9;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Color palette - all vibrant colors
        this.colors = [
            0xFF1744, // Neon red
            0xFF6B35, // Vibrant orange
            0xFF8C42, // Bright tangerine
            0xFFD700, // Gold
            0x00FF00, // Lime green
            0x1ABC9C, // Turquoise
            0x00FFFF, // Cyan
            0x3498DB, // Blue
            0x9B59B6, // Purple
            0xFF00FF, // Magenta
            0xC44569, // Deep rose
            0xFF1493  // Deep pink
        ];
        
        // Create multiple leather texture variations
        this.leatherTextures = [];
        this.leatherNormalMaps = [];
        for (let i = 0; i < 5; i++) {
            this.leatherTextures.push(this.createLeatherTexture(i));
            this.leatherNormalMaps.push(this.createLeatherNormalMap(i));
        }
        
        // Create tunnel segments
        this.tunnelSegments = [];
        this.createTunnel();
        
        // Modern lighting setup - balanced
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Main point light - no shadows to avoid dark sweeping effect
        this.mainLight = new THREE.PointLight(0xffffff, 2.0, 70);
        this.mainLight.position.set(0, 0, 5);
        this.mainLight.castShadow = false;
        this.scene.add(this.mainLight);
        
        // Add colored rim lights for depth
        this.rimLight1 = new THREE.PointLight(0xff6b35, 0.6, 40);
        this.rimLight1.position.set(3, 2, -10);
        this.scene.add(this.rimLight1);
        
        this.rimLight2 = new THREE.PointLight(0x3498db, 0.6, 40);
        this.rimLight2.position.set(-3, -2, -20);
        this.scene.add(this.rimLight2);
        
        // Animation properties
        this.speed = 0.05;
        this.tunnelOffset = 0;
        this.time = 0;
        
        // Wiggle parameters
        this.wiggleParams = {
            freq1: 8,
            speed1: 3,
            amp1Radial: 0.0,  // Radial displacement (causes seam)
            amp1Tangential: 0.28, // Tangential displacement (smooth wiggle)
            freq2: 0.2,
            speed2: 1,
            amp2: 0.5
        };
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    createLeatherTexture(seed = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Start with bright base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add visible grain pattern
        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
                const noise = Math.random() * 100;
                ctx.fillStyle = `rgba(0, 0, 0, ${noise / 255})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
        
        // Add prominent wrinkles and creases with seed variation
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 2 + seed * 0.5;
        const wrinkleCount = 30 + seed * 8;
        for (let i = 0; i < wrinkleCount; i++) {
            ctx.beginPath();
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height;
            ctx.moveTo(startX, startY);
            
            const segments = 3 + Math.floor(Math.random() * 5);
            for (let j = 0; j < segments; j++) {
                ctx.lineTo(
                    startX + (Math.random() - 0.5) * 150,
                    startY + (Math.random() - 0.5) * 150
                );
            }
            ctx.stroke();
        }
        
        // Add small cracks with seed variation
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1;
        const crackCount = 40 + seed * 15;
        for (let i = 0; i < crackCount; i++) {
            ctx.beginPath();
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const angle = Math.random() * Math.PI * 2;
            const length = 10 + Math.random() * 30;
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1); // More repeats for seamless appearance
        return texture;
    }
    
    createLeatherNormalMap(seed = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base normal (neutral blue)
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create pronounced bumps with seed variation
        const bumpCount = 80 + seed * 20;
        for (let i = 0; i < bumpCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 10 + Math.random() * 30;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, 'rgb(180, 180, 255)'); // Raised
            gradient.addColorStop(1, 'rgb(80, 80, 255)'); // Recessed
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const normalMap = new THREE.CanvasTexture(canvas);
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(3, 1); // Match texture repeat for consistency
        return normalMap;
    }
    
    createTunnel() {
        const segmentLength = 0.5;
        const numSegments = 200;
        const radius = 3;
        const radialSegments = 32;
        
        for (let i = 0; i < numSegments; i++) {
            const z = -i * segmentLength;
            const colorIndex = i % this.colors.length;
            
            // Create ring geometry (torus shape) with higher segment count for deformation
            const geometry = new THREE.TorusGeometry(radius, 0.15, 16, 64);
            
            // Store original positions for animation
            const positions = geometry.attributes.position;
            const originalPositions = new Float32Array(positions.count * 3);
            for (let j = 0; j < positions.count; j++) {
                originalPositions[j * 3] = positions.getX(j);
                originalPositions[j * 3 + 1] = positions.getY(j);
                originalPositions[j * 3 + 2] = positions.getZ(j);
            }
            geometry.userData.originalPositions = originalPositions;
            
            // Modern PBR material with varied textures per ring
            const textureIndex = i % this.leatherTextures.length;
            const roughnessVar = 0.2 + (Math.sin(i * 0.5) * 0.5 + 0.5) * 0.3;
            const metalnessVar = 0.4 + (Math.cos(i * 0.3) * 0.5 + 0.5) * 0.3;
            
            const material = new THREE.MeshStandardMaterial({
                color: this.colors[colorIndex],
                map: this.leatherTextures[textureIndex],
                normalMap: this.leatherNormalMaps[textureIndex],
                normalScale: new THREE.Vector2(1.5 + Math.sin(i) * 0.5, 1.5 + Math.sin(i) * 0.5),
                roughness: roughnessVar,
                metalness: metalnessVar,
                envMapIntensity: 0.8,
                emissive: this.colors[colorIndex],
                emissiveIntensity: 0.1 + Math.sin(i * 0.2) * 0.05
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.castShadow = false;
            ring.receiveShadow = false;
            
            // Curve the tunnel - quick sharp turns left and right
            const curveX = Math.sin(Math.abs(z) * 0.08) * Math.abs(z) * 0.12;
            ring.position.set(curveX, 0, z);
            
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
        
        this.time += 0.016; // Approximate frame time
        
        // Organic variable speed - breathe in and out with more variation
        const speedVariation = Math.sin(this.time * 0.3) * 0.05 + 
                               Math.sin(this.time * 0.7) * 0.03 +
                               Math.sin(this.time * 1.2) * 0.02;
        const organicSpeed = this.speed + speedVariation;
        this.tunnelOffset += organicSpeed;
        
        // Complex camera sway - multiple frequency layers for organic tumbling
        const cameraSwayX = Math.sin(this.time * 0.4) * 0.5 + 
                           Math.sin(this.time * 0.9) * 0.25 +
                           Math.sin(this.time * 1.3) * 0.15;
        const cameraSwayY = Math.cos(this.time * 0.5) * 0.45 + 
                           Math.cos(this.time * 0.8) * 0.2 +
                           Math.cos(this.time * 1.5) * 0.1;
        const cameraRoll = Math.sin(this.time * 0.3) * 0.12 + 
                          Math.sin(this.time * 0.85) * 0.06;
        
        // Add pitch and yaw rotation for more dynamic falling sensation
        const cameraPitch = Math.sin(this.time * 0.35) * 0.08;
        const cameraYaw = Math.cos(this.time * 0.42) * 0.1;
        
        this.camera.position.x = cameraSwayX;
        this.camera.position.y = cameraSwayY;
        this.camera.rotation.z = cameraRoll;
        this.camera.rotation.x = cameraPitch;
        this.camera.rotation.y = cameraYaw;
        
        // Animate lights position only - keep intensity constant
        const time = Date.now() * 0.001;
        this.rimLight1.position.x = Math.sin(time * 0.5) * 4;
        this.rimLight1.position.y = Math.cos(time * 0.3) * 3;
        
        this.rimLight2.position.x = Math.cos(time * 0.4) * 4;
        this.rimLight2.position.y = Math.sin(time * 0.6) * 3;
        
        // Update ring positions for infinite loop - rings move toward camera
        this.tunnelSegments.forEach((segment, index) => {
            segment.mesh.position.z += organicSpeed;
            
            // Update curve position - quick sharp turns
            const z = segment.mesh.position.z;
            const curveX = Math.sin(Math.abs(z) * 0.08) * Math.abs(z) * 0.12;
            segment.mesh.position.x = curveX;
            segment.mesh.position.y = 0;
            
            // Apply sine wave wiggle to vertices
            const geometry = segment.mesh.geometry;
            const positions = geometry.attributes.position;
            const originalPositions = geometry.userData.originalPositions;
            
            if (originalPositions) {
                for (let i = 0; i < positions.count; i++) {
                    const angle = (i / positions.count) * Math.PI * 2;
                    const wave1 = Math.sin(angle * this.wiggleParams.freq1 + this.time * this.wiggleParams.speed1);
                    const wave2 = Math.sin(angle * this.wiggleParams.freq2 - this.time * this.wiggleParams.speed2);
                    
                    const x = originalPositions[i * 3];
                    const y = originalPositions[i * 3 + 1];
                    const z = originalPositions[i * 3 + 2];
                    
                    // Apply radial displacement (scales out from center)
                    const radialOffset = wave1 * this.wiggleParams.amp1Radial + wave2 * this.wiggleParams.amp2;
                    
                    // Apply tangential displacement (rotates around)
                    const tangentOffset = wave1 * this.wiggleParams.amp1Tangential;
                    
                    const length = Math.sqrt(x * x + y * y);
                    if (length > 0) {
                        const radialScale = 1 + radialOffset;
                        const newX = x * radialScale - y * tangentOffset;
                        const newY = y * radialScale + x * tangentOffset;
                        positions.setXYZ(i, newX, newY, z);
                    }
                }
                positions.needsUpdate = true;
                geometry.computeVertexNormals();
            }
            
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
