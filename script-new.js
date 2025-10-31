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
        const shapesPerRing = 24; // Number of totem shapes around the ring
        
        for (let i = 0; i < numSegments; i++) {
            const z = -i * segmentLength;
            const colorIndex = i % this.colors.length;
            
            // Create a group to hold all shapes in this ring
            const ringGroup = new THREE.Group();
            
            // Modern PBR material setup
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
            
            // Create varying geometries around the ring like a totem, with connectors
            for (let j = 0; j < shapesPerRing; j++) {
                const angle = (j / shapesPerRing) * Math.PI * 2;
                const nextAngle = ((j + 1) / shapesPerRing) * Math.PI * 2;
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const nextX = Math.cos(nextAngle) * radius;
                const nextY = Math.sin(nextAngle) * radius;
                
                // Choose random geometry type for totem variety (seeded by position)
                const shapeType = Math.floor((Math.sin(i * 13.7 + j * 7.3) + 1) * 2.5);
                let geometry;
                let mesh;
                
                switch(shapeType % 5) {
                    case 0: // Box
                        geometry = new THREE.BoxGeometry(0.5, 0.6, 0.4);
                        break;
                    case 1: // Cylinder
                        geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8);
                        break;
                    case 2: // Sphere
                        geometry = new THREE.SphereGeometry(0.35, 8, 8);
                        break;
                    case 3: // Cone
                        geometry = new THREE.ConeGeometry(0.3, 0.6, 8);
                        break;
                    case 4: // Octahedron
                        geometry = new THREE.OctahedronGeometry(0.35, 0);
                        break;
                }
                
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, 0);
                
                // Rotate to face outward from ring center
                mesh.rotation.z = angle;
                
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                
                ringGroup.add(mesh);
                
                // Add glowing LED screen panel on the outer face of each shape
                const ledMaterial = new THREE.MeshBasicMaterial({
                    color: this.colors[colorIndex],
                    emissive: this.colors[colorIndex],
                    emissiveIntensity: 3.0,
                    side: THREE.DoubleSide
                });
                
                // Create flat rectangular LED screen
                const screenWidth = 0.3;
                const screenHeight = 0.4;
                const ledGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
                const ledPanel = new THREE.Mesh(ledGeometry, ledMaterial);
                
                // Position screen on the outer face of the shape
                const offsetDistance = 0.22; // Push screen slightly outward
                ledPanel.position.set(
                    x + Math.cos(angle) * offsetDistance,
                    y + Math.sin(angle) * offsetDistance,
                    0
                );
                
                // Rotate to face outward from ring center
                ledPanel.rotation.z = angle;
                
                ringGroup.add(ledPanel);
                
                // Add connector between this shape and the next
                const distance = Math.sqrt((nextX - x) ** 2 + (nextY - y) ** 2);
                const connectorGeometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 8);
                const connector = new THREE.Mesh(connectorGeometry, material);
                
                // Position connector at midpoint
                connector.position.set((x + nextX) / 2, (y + nextY) / 2, 0);
                
                // Rotate connector to connect the two points
                const connectorAngle = Math.atan2(nextY - y, nextX - x);
                connector.rotation.z = connectorAngle + Math.PI / 2;
                
                connector.castShadow = false;
                connector.receiveShadow = false;
                
                ringGroup.add(connector);
            }
            
            // Curve the tunnel - smooth serpentine motion
            const curveX = Math.sin(z * 0.08) * 2.0;
            const curveY = Math.cos(z * 0.06) * 1.5;
            ringGroup.position.set(curveX, curveY, z);
            
            this.scene.add(ringGroup);
            this.tunnelSegments.push({
                mesh: ringGroup,
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
        
        // Organic variable speed - always positive, just varies intensity
        const speedVariation = (Math.sin(this.time * 0.3) * 0.5 + 0.5) * 0.02 + 
                               (Math.sin(this.time * 0.7) * 0.5 + 0.5) * 0.015 +
                               (Math.sin(this.time * 1.2) * 0.5 + 0.5) * 0.01;
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
            
            // Update curve position - smooth serpentine motion
            const z = segment.mesh.position.z;
            const curveX = Math.sin(z * 0.08) * 2.0;
            const curveY = Math.cos(z * 0.06) * 1.5;
            segment.mesh.position.x = curveX;
            segment.mesh.position.y = curveY;
            
            // Add organic rotation to the ring group
            segment.mesh.rotation.z += 0.002;
            
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
