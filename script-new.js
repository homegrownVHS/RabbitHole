class RabbitHoleTunnel {
    constructor() {
        this.canvas = document.getElementById('tunnelCanvas');
        
        // Setup Three.js scene
    this.scene = new THREE.Scene();
    // Use a smooth exponential fog to avoid hard linear bands at the tunnel end.
    // Low density gives a gentle, natural falloff instead of a sharp ring.
    this.scene.fog = new THREE.FogExp2(0x07131a, 0.009);
        
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
    // Limit pixel ratio to reduce GPU load on slower machines
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
        
        // LED textures for inset screens (generated canvases)
        this.ledCanvases = [];
        this.ledTextures = [];
        this.createLedTextures(8);
        
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
    // Lower base speed so tunnel movement feels less frantic on slower machines
    // Reduced from 0.03 to 0.02 to slow forward movement slightly
    this.speed = 0.02;
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
        // smaller texture size to save memory and sampling cost on slower GPUs
        canvas.width = 256;
        canvas.height = 256;
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
        // smaller normal map to reduce generation and sampling cost
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base normal (neutral blue)
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create pronounced bumps with seed variation
    const bumpCount = 40 + seed * 10; // fewer bumps for faster generation
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

    createLedTextures(count = 6) {
        for (let k = 0; k < count; k++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            // Fill black background with scanlines
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < canvas.height; y += 2) {
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                ctx.fillRect(0, y, canvas.width, 1);
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            this.ledCanvases.push({canvas, ctx, seed: Math.random() * 10});
            this.ledTextures.push(texture);
        }
    }
    
    createTunnel() {
        const segmentLength = 0.5;
    const numSegments = 120; // reduced for performance
        // expose for animation/reset logic
        this.segmentLength = segmentLength;
        this.numSegments = numSegments;
        const radius = 3;
    const shapesPerRing = 24; // increased shapes per ring for denser tunnel
        
        for (let i = 0; i < numSegments; i++) {
            const z = -i * segmentLength;
            const colorIndex = i % this.colors.length;
            
            // Create a group to hold all shapes in this ring
            const ringGroup = new THREE.Group();
            
            // Modern PBR material setup (no leather textures) - clean retro-future look
            const roughnessVar = 0.15 + (Math.sin(i * 0.5) * 0.5 + 0.5) * 0.25;
            const metalnessVar = 0.6 + (Math.cos(i * 0.3) * 0.5 + 0.5) * 0.2;
            const material = new THREE.MeshStandardMaterial({
                color: this.colors[colorIndex],
                roughness: roughnessVar,
                metalness: metalnessVar,
                envMapIntensity: 0.9,
                emissive: 0x000000,
                emissiveIntensity: 0.0
            });
            
            // Prepare a single InstancedMesh for all cubes in this ring (much fewer draw calls)
            // Make cubes slightly smaller to let more color show through
            const boxW = 0.42; // previously 0.5
            const boxH = 0.504; // previously 0.6 (scaled by 0.84)
            const boxD = 0.336; // previously 0.4 (scaled by 0.84)
            const boxGeometry = new THREE.BoxGeometry(boxW, boxH, boxD);
            // Material will use vertexColors so instanceColor can tint instances
            // Base material set to near-black so instance colors only subtly tint the cubes
            const instMaterial = new THREE.MeshStandardMaterial({
                color: 0x08080a, // very dark base
                roughness: Math.max(0.4, roughnessVar),
                metalness: Math.min(0.08, metalnessVar * 0.5),
                envMapIntensity: 0.6,
                vertexColors: true,
                // small emissive factor left at material level; per-instance glow will be subtle
                emissive: 0x000000,
                emissiveIntensity: 0.0
            });
            const instancedMesh = new THREE.InstancedMesh(boxGeometry, instMaterial, shapesPerRing);
            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            // create instance color buffer
            const instanceColorArray = new Float32Array(shapesPerRing * 3);
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(instanceColorArray, 3);
            ringGroup.add(instancedMesh);

            // Create varying geometries around the ring like a totem, with connectors
            for (let j = 0; j < shapesPerRing; j++) {
                const angle = (j / shapesPerRing) * Math.PI * 2;
                const nextAngle = ((j + 1) / shapesPerRing) * Math.PI * 2;
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const nextX = Math.cos(nextAngle) * radius;
                const nextY = Math.sin(nextAngle) * radius;
                // Set instance transform for this cube
                const dummy = new THREE.Object3D();
                dummy.position.set(x, y, 0);
                dummy.rotation.z = angle;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(j, dummy.matrix);

                // Per-instance color: pick from palette offset by j so cubes vary around ring
                const color = new THREE.Color(this.colors[(colorIndex + j) % this.colors.length]);
                // Use setColorAt which correctly populates the instance color attribute
                if (typeof instancedMesh.setColorAt === 'function') {
                    instancedMesh.setColorAt(j, color);
                } else {
                    // fallback if setColorAt is not available: write directly into buffer
                    instancedMesh.instanceColor.setXYZ(j, color.r, color.g, color.b);
                }

                // Add connector between this shape and the next
                const distance = Math.sqrt((nextX - x) ** 2 + (nextY - y) ** 2);
                const connectorGeometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 6);
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
            
            // Curve the tunnel - moderate serpentine motion
            const curveX = Math.sin(z * 0.08) * 1.2;
            const curveY = Math.cos(z * 0.06) * 0.9;
            ringGroup.position.set(curveX, curveY, z);
            
            this.scene.add(ringGroup);
            this.tunnelSegments.push({
                mesh: ringGroup,
                originalZ: z,
                colorIndex: colorIndex,
                instancedMesh: instancedMesh
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
    // Clamp overall forward speed so the tunnel never goes too fast
    let organicSpeed = this.speed + speedVariation;
    // Lower max clamp so bursts are less extreme and speed feels calmer
    organicSpeed = Math.max(0.01, Math.min(organicSpeed, 0.032));
    this.tunnelOffset += organicSpeed;
        
    // Keep the camera centered and stable — no sway, no roll/pitch/yaw
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.rotation.x = 0;
    this.camera.rotation.y = 0;
    this.camera.rotation.z = 0;
        
        // Animate lights position only - keep intensity constant
        const time = Date.now() * 0.001;

        // LED canvas animation removed — using solid emissive colors on cubes instead
        this.rimLight1.position.x = Math.sin(time * 0.5) * 4;
        this.rimLight1.position.y = Math.cos(time * 0.3) * 3;
        
        this.rimLight2.position.x = Math.cos(time * 0.4) * 4;
        this.rimLight2.position.y = Math.sin(time * 0.6) * 3;
        
        // Update ring positions for infinite loop - rings move toward camera
        this.tunnelSegments.forEach((segment, index) => {
            segment.mesh.position.z += organicSpeed;
            
            // Update curve position - moderate serpentine motion
            const z = segment.mesh.position.z;
            const curveX = Math.sin(z * 0.08) * 1.2;
            const curveY = Math.cos(z * 0.06) * 0.9;
            segment.mesh.position.x = curveX;
            segment.mesh.position.y = curveY;

                // Apply a moderate per-ring rotation to the whole group (keeps connectors aligned)
                // Reduced base rotation and variation so the spin feels calmer
                const ringWiggle = 0.000 + (index % 3) * 0.0006;
                // base rotation lowered to 0.004 for a gentler spin
                segment.mesh.rotation.z += 0.004 + ringWiggle;

                // Taper rings with depth so the tunnel converges to a point instead of tubing out
                // distance from camera along Z (camera is at positive Z)
                const distanceFromCamera = Math.max(0, this.camera.position.z - segment.mesh.position.z);
                const maxDistance = this.segmentLength * this.numSegments; // furthest ring distance
                const tDepth = Math.min(distanceFromCamera / maxDistance, 1);
                // scale ranges from 1.0 (near) down to 0.6 (far)
                const taperScale = 1.0 - tDepth * 0.4;
                segment.mesh.scale.set(taperScale, taperScale, taperScale);
            
            // Reset rings that pass the camera - shift back by full tunnel length to preserve spacing
            if (segment.mesh.position.z > 10) {
                segment.mesh.position.z -= (this.segmentLength * this.numSegments);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
new RabbitHoleTunnel();
