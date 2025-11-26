// Vimlantis - 3D Ocean Code Explorer
// Main Application

class Vimlantis {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.boat = null;
        this.ocean = null;
        this.objects = [];
        this.fileTree = null;
        this.currentPath = [];
        this.currentItems = [];
        this.barrelModel = null; // Cache for barrel GLB model

        // Settings
        this.settings = {
            showBreadcrumbs: true,
            showCompass: true,
            showMinimap: true,
            oceanTheme: 'blue',
            boatSpeed: 1.0,
        };

        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.hoveredObject = null;

        // Camera control - close third-person view
        this.cameraOffset = new THREE.Vector3(0, 4, 8);
        this.cameraLookOffset = new THREE.Vector3(0, 0, 0);

        this.init();
    }

    async init() {
        await this.loadFileTree();
        this.setupScene();
        this.setupLights();
        await this.createOcean();
        await this.createBoat();
        await this.loadBarrelModel(); // Load barrel model
        this.createSkybox();
        this.populateScene();
        this.setupEventListeners();
        this.setupUI();
        this.animate();

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 1000);
    }

    async loadFileTree() {
        try {
            const response = await fetch('/api/filetree');
            this.fileTree = await response.json();
            this.currentItems = this.fileTree;
        } catch (error) {
            console.error('Failed to load file tree:', error);
            this.fileTree = [];
            this.currentItems = [];
        }
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        // Fog disabled - objects stay visible at all distances
        // this.scene.fog = new THREE.FogExp2(0x1a3a52, 0.002);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 25);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('ocean-canvas'),
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Label Renderer
        this.labelRenderer = new THREE.CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(this.labelRenderer.domElement);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x1a3a52, 0.5);
        this.scene.add(hemiLight);
    }

    async createOcean() {
        const oceanGeometry = new THREE.PlaneGeometry(1000, 1000, 200, 200);

        // Try to load custom shaders
        const shaderData = await ShaderLoader.loadOceanShaders();

        let oceanMaterial;

        if (shaderData) {
            // Use custom shader material for realistic water
            oceanMaterial = new THREE.ShaderMaterial({
                vertexShader: shaderData.vertexShader,
                fragmentShader: shaderData.fragmentShader,
                uniforms: shaderData.uniforms,
                transparent: true,
                side: THREE.DoubleSide,
            });

            this.oceanUniforms = shaderData.uniforms;
            this.useShaders = true;
            console.log('✨ Ocean shaders loaded successfully!');
        } else {
            // Fallback to standard material
            oceanMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a5f7a,
                metalness: 0.3,
                roughness: 0.7,
                transparent: true,
                opacity: 0.9,
            });

            this.useShaders = false;
            console.log('⚠️ Using fallback ocean material');
        }

        this.ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.receiveShadow = true;
        this.scene.add(this.ocean);

        // For fallback animation only
        if (!this.useShaders) {
            const positions = oceanGeometry.attributes.position;
            this.oceanWaves = [];

            for (let i = 0; i < positions.count; i++) {
                this.oceanWaves.push({
                    x: positions.getX(i),
                    y: positions.getY(i),
                    z: positions.getZ(i),
                    offset: Math.random() * Math.PI * 2,
                });
            }
        }
    }

    async createBoat() {
        const boatGroup = new THREE.Group();

        try {
            // Load the GLB model
            const loader = new THREE.GLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    './ship_finished.glb',
                    (gltf) => resolve(gltf),
                    undefined,
                    (error) => reject(error)
                );
            });

            const shipModel = gltf.scene;

            // Enable shadows for all meshes in the model
            shipModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Adjust scale and position as needed
            shipModel.scale.set(1, 1, 1);
            shipModel.position.set(0, 0, 0);

            boatGroup.add(shipModel);
            console.log('✨ Ship model loaded successfully!');
        } catch (error) {
            console.error('Failed to load ship model:', error);
            console.log('⚠️ Using fallback boat geometry');

            // Fallback to simple boat if model fails to load
            const hullGeometry = new THREE.BoxGeometry(3, 1.5, 6);
            const hullMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                metalness: 0.2,
                roughness: 0.8,
            });
            const hull = new THREE.Mesh(hullGeometry, hullMaterial);
            hull.castShadow = true;
            boatGroup.add(hull);
        }

        boatGroup.position.y = 2;
        this.boat = boatGroup;
        this.scene.add(boatGroup);
    }

    createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide,
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Add some clouds
        this.createClouds();
    }

    createClouds() {
        const cloudGroup = new THREE.Group();

        for (let i = 0; i < 20; i++) {
            const cloudGeometry = new THREE.SphereGeometry(
                Math.random() * 3 + 2,
                8,
                8
            );
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6,
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

            cloud.position.set(
                (Math.random() - 0.5) * 400,
                Math.random() * 50 + 50,
                (Math.random() - 0.5) * 400
            );

            cloudGroup.add(cloud);
        }

        this.scene.add(cloudGroup);
    }

    populateScene() {
        // Clear existing objects
        this.objects.forEach(obj => this.scene.remove(obj.mesh));
        this.objects = [];

        // Natural scattered placement - like discovering islands
        const minDistance = 15; // Minimum distance between objects
        const maxDistance = 80; // Maximum distance from boat
        const positions = [];

        // Helper function to check if position is valid
        const isValidPosition = (x, z) => {
            // Check distance from boat (origin)
            const distFromBoat = Math.sqrt(x * x + z * z);
            if (distFromBoat < 10 || distFromBoat > maxDistance) return false;

            // Check distance from other objects
            for (const pos of positions) {
                const dx = x - pos.x;
                const dz = z - pos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < minDistance) return false;
            }
            return true;
        };

        // Generate scattered positions for each item
        this.currentItems.forEach((item, index) => {
            let x, z;
            let attempts = 0;
            const maxAttempts = 100;

            // Try to find a valid random position
            do {
                // Use a mix of random and semi-structured placement
                const angle = (Math.random() * Math.PI * 2);
                const distance = 20 + Math.random() * 60;

                // Add some clustering variation
                const clusterOffset = Math.random() * 10 - 5;

                x = Math.cos(angle) * distance + clusterOffset;
                z = Math.sin(angle) * distance + clusterOffset;

                attempts++;
            } while (!isValidPosition(x, z) && attempts < maxAttempts);

            // Fallback to a guaranteed position if we couldn't find one
            if (attempts >= maxAttempts) {
                const fallbackAngle = (index / this.currentItems.length) * Math.PI * 2;
                const fallbackDistance = 30 + (index % 3) * 15;
                x = Math.cos(fallbackAngle) * fallbackDistance;
                z = Math.sin(fallbackAngle) * fallbackDistance;
            }

            positions.push({ x, z });

            let mesh;

            if (item.type === 'directory') {
                // Lighthouse for directories
                mesh = this.createLighthouse();
                mesh.position.set(x, 0, z);
                // Add slight random rotation for natural look
                mesh.rotation.y = Math.random() * Math.PI * 2;
            } else {
                // Buoy for files
                mesh = this.createBuoy();
                mesh.position.set(x, 0, z);
                // Add slight random rotation
                mesh.rotation.y = Math.random() * Math.PI * 2;
            }

            mesh.userData = item;
            this.scene.add(mesh);

            // Create permanent label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'object-label';
            labelDiv.textContent = item.name;
            const label = new THREE.CSS2DObject(labelDiv);
            label.position.set(0, item.type === 'directory' ? 18 : 4, 0);
            mesh.add(label);

            this.objects.push({ mesh, item });
        });
    }

    createLighthouse() {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 2, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.3,
            roughness: 0.7,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        group.add(base);

        // Tower
        const towerGeometry = new THREE.CylinderGeometry(1.5, 2, 12, 8);
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.8,
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 8;
        tower.castShadow = true;
        group.add(tower);

        // Red stripe
        const stripeGeometry = new THREE.CylinderGeometry(1.6, 2.1, 3, 8);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            metalness: 0.2,
            roughness: 0.8,
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 6;
        group.add(stripe);

        // Light housing
        const lightGeometry = new THREE.CylinderGeometry(1.8, 1.5, 2, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2,
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 15;
        light.castShadow = true;
        group.add(light);

        // Point light
        const pointLight = new THREE.PointLight(0xffff00, 1, 50);
        pointLight.position.y = 15;
        group.add(pointLight);

        return group;
    }


    async loadBarrelModel() {
        if (this.barrelModel) {
            return this.barrelModel; // Return cached model
        }

        try {
            const loader = new THREE.GLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    './barrels.glb',
                    (gltf) => resolve(gltf),
                    undefined,
                    (error) => reject(error)
                );
            });

            this.barrelModel = gltf.scene;
            console.log('✨ Barrel model loaded successfully!');
            return this.barrelModel;
        } catch (error) {
            console.error('Failed to load barrel model:', error);
            return null;
        }
    }

    createBuoy() {
        const group = new THREE.Group();
        group.frustumCulled = false;

        if (this.barrelModel) {
            const barrel = this.barrelModel.clone();
            barrel.frustumCulled = false;

            barrel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.frustumCulled = false;
                    child.renderOrder = 1;
                }
            });

            barrel.scale.set(2, 2, 2);
            group.add(barrel);
        } else {
            const bodyGeometry = new THREE.SphereGeometry(1, 16, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6b35,
                metalness: 0.4,
                roughness: 0.6,
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.5;
            body.castShadow = true;
            body.frustumCulled = false;
            group.add(body);
        }

        return group;
    }

    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === 'Escape') {
                this.navigateBack();
            }

            if (e.key === ' ') {
                this.handleSpaceKey();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('click', () => {
            if (this.hoveredObject) {
                this.handleObjectClick(this.hoveredObject);
            }
        });

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupUI() {
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.toggle('hidden');
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('hidden');
        });

        // Settings
        document.getElementById('setting-breadcrumbs').addEventListener('change', (e) => {
            this.settings.showBreadcrumbs = e.target.checked;
            document.getElementById('breadcrumbs').style.display = e.target.checked ? 'flex' : 'none';
        });

        document.getElementById('setting-compass').addEventListener('change', (e) => {
            this.settings.showCompass = e.target.checked;
            document.getElementById('compass').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('setting-minimap').addEventListener('change', (e) => {
            this.settings.showMinimap = e.target.checked;
            document.getElementById('minimap').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('setting-ocean-theme').addEventListener('change', (e) => {
            this.settings.oceanTheme = e.target.value;
            this.updateOceanTheme();
        });

        document.getElementById('setting-boat-speed').addEventListener('input', (e) => {
            this.settings.boatSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = this.settings.boatSpeed.toFixed(1) + 'x';
        });

        // Help toggle
        document.getElementById('help-toggle').addEventListener('click', () => {
            document.getElementById('controls-help').classList.toggle('hidden');
        });

        // Initialize Minimap
        const minimapCanvas = document.getElementById('minimap-canvas');
        if (minimapCanvas) {
            minimapCanvas.width = minimapCanvas.offsetWidth;
            minimapCanvas.height = minimapCanvas.offsetHeight;
            this.minimapCtx = minimapCanvas.getContext('2d');
        }

        this.updateBreadcrumbs();
    }

    updateOceanTheme() {
        const themes = {
            blue: 0x1a5f7a,
            teal: 0x2a9d8f,
            purple: 0x6a4c93,
            sunset: 0xe76f51,
        };

        this.ocean.material.color.setHex(themes[this.settings.oceanTheme] || themes.blue);
    }

    updateBreadcrumbs() {
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        breadcrumbsEl.innerHTML = '';

        // Root
        const rootCrumb = document.createElement('div');
        rootCrumb.className = this.currentPath.length === 0 ? 'breadcrumb-item active' : 'breadcrumb-item';
        rootCrumb.innerHTML = '<span class="breadcrumb-icon">📁</span><span class="breadcrumb-text">root</span>';
        rootCrumb.addEventListener('click', () => this.navigateToRoot());
        breadcrumbsEl.appendChild(rootCrumb);

        // Path items
        this.currentPath.forEach((item, index) => {
            const crumb = document.createElement('div');
            crumb.className = index === this.currentPath.length - 1 ? 'breadcrumb-item active' : 'breadcrumb-item';
            crumb.innerHTML = `<span class="breadcrumb-icon">📁</span><span class="breadcrumb-text">${item.name}</span>`;
            crumb.addEventListener('click', () => this.navigateToPath(index));
            breadcrumbsEl.appendChild(crumb);
        });
    }

    handleObjectClick(object) {
        const item = object.userData;

        if (item.type === 'directory') {
            this.navigateInto(item);
        } else {
            this.openFile(item);
        }
    }

    navigateInto(directory) {
        this.currentPath.push(directory);
        this.currentItems = directory.children || [];
        this.populateScene();
        this.updateBreadcrumbs();
    }

    navigateBack() {
        if (this.currentPath.length > 0) {
            this.currentPath.pop();

            if (this.currentPath.length === 0) {
                this.currentItems = this.fileTree;
            } else {
                const parent = this.currentPath[this.currentPath.length - 1];
                this.currentItems = parent.children || [];
            }

            this.populateScene();
            this.updateBreadcrumbs();
        }
    }

    navigateToRoot() {
        this.currentPath = [];
        this.currentItems = this.fileTree;
        this.populateScene();
        this.updateBreadcrumbs();
    }

    navigateToPath(index) {
        this.currentPath = this.currentPath.slice(0, index + 1);
        const target = this.currentPath[index];
        this.currentItems = target.children || [];
        this.populateScene();
        this.updateBreadcrumbs();
    }

    async openFile(file) {
        try {
            const response = await fetch(`/api/open`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: file.path,
                    type: file.type
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Opened file:', file.path);
                console.log('Using editor:', data.editor);
                // Show notification
                this.showNotification(`Opened: ${file.name}`);
            }
        } catch (error) {
            console.error('Failed to open file:', error);
            this.showNotification(`Failed to open: ${file.name}`);
        }
    }

    showNotification(message) {
        // Simple notification - could be enhanced
        console.log('Notification:', message);
    }

    updateBoatMovement() {
        const speed = 0.2 * this.settings.boatSpeed;
        const rotationSpeed = 0.03;

        // Forward/Backward
        if (this.keys['w'] || this.keys['arrowup']) {
            this.boat.position.x -= Math.sin(this.boat.rotation.y) * speed;
            this.boat.position.z -= Math.cos(this.boat.rotation.y) * speed;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.boat.position.x += Math.sin(this.boat.rotation.y) * speed;
            this.boat.position.z += Math.cos(this.boat.rotation.y) * speed;
        }

        // Rotation
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.boat.rotation.y += rotationSpeed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.boat.rotation.y -= rotationSpeed;
        }

        // Update camera to follow boat
        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(this.cameraOffset);
        cameraPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.boat.rotation.y);
        cameraPosition.add(this.boat.position);

        this.camera.position.lerp(cameraPosition, 0.1);

        const lookAtPosition = new THREE.Vector3();
        lookAtPosition.copy(this.cameraLookOffset);
        lookAtPosition.add(this.boat.position);
        this.camera.lookAt(lookAtPosition);

        // Update compass
        this.updateCompass();
    }

    updateCompass() {
        const needle = document.querySelector('.compass-needle');
        const rotation = -this.boat.rotation.y * (180 / Math.PI);
        needle.style.transform = `rotate(${rotation}deg)`;
    }

    updateMinimap() {
        if (!this.settings.showMinimap || !this.minimapCtx || !this.boat) return;

        const ctx = this.minimapCtx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 1.5; // Map scale (pixels per unit)

        // Clear
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Draw objects relative to boat
        this.objects.forEach(obj => {
            // Calculate relative position rotated by boat rotation
            // Actually, usually minimaps rotate the world around the player, keeping player facing up
            // OR keep world static and rotate player arrow.
            // Let's keep world static relative to boat position (overhead view), but rotate the map so boat is always "up"?
            // No, usually minimaps have North Up or Player Up.
            // Let's do Player Up (boat fixed pointing up, world rotates)

            const relX = obj.mesh.position.x - this.boat.position.x;
            const relZ = obj.mesh.position.z - this.boat.position.z;

            // Rotate coordinates to match boat rotation (so boat is always facing up)
            const angle = this.boat.rotation.y;
            const rotX = relX * Math.cos(angle) - relZ * Math.sin(angle);
            const rotZ = relX * Math.sin(angle) + relZ * Math.cos(angle);

            const drawX = centerX - rotX * scale; // Invert X because of screen coords? No, let's test.
            const drawY = centerY - rotZ * scale; // Z maps to Y

            // Only draw if within bounds (circular clip would be nice but rect is fine)
            if (drawX > 0 && drawX < width && drawY > 0 && drawY < height) {
                ctx.fillStyle = obj.item.type === 'directory' ? '#ffff00' : '#ff6b35';
                ctx.beginPath();
                ctx.arc(drawX, drawY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw boat (center, fixed pointing up)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 6);
        ctx.lineTo(centerX + 5, centerY + 6);
        ctx.lineTo(centerX - 5, centerY + 6);
        ctx.closePath();
        ctx.fill();
    }

    updateOceanWaves(time) {
        if (this.useShaders && this.oceanUniforms) {
            // Update shader uniforms for realistic water
            this.oceanUniforms.uTime.value = time;
        } else if (this.oceanWaves) {
            // Fallback: manual vertex animation
            const positions = this.ocean.geometry.attributes.position;

            for (let i = 0; i < this.oceanWaves.length; i++) {
                const wave = this.oceanWaves[i];
                const x = wave.x;
                const y = wave.y;
                const offset = wave.offset;

                const waveHeight = Math.sin(x * 0.05 + time + offset) * 0.3 +
                    Math.sin(y * 0.05 + time * 0.7 + offset) * 0.2;

                positions.setZ(i, waveHeight);
            }

            positions.needsUpdate = true;
            this.ocean.geometry.computeVertexNormals();
        }
    }

    updateHoverEffect() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            this.objects.map(obj => obj.mesh),
            true
        );

        if (intersects.length > 0) {
            const object = intersects[0].object.parent || intersects[0].object;

            if (object !== this.hoveredObject) {
                // Reset previous
                if (this.hoveredObject) {
                    this.hoveredObject.scale.set(1, 1, 1);
                }

                // Set new
                this.hoveredObject = object;
                this.hoveredObject.scale.set(1.1, 1.1, 1.1);

                // Info panel update removed - using permanent labels now
            }
        } else {
            if (this.hoveredObject) {
                this.hoveredObject.scale.set(1, 1, 1);
                this.hoveredObject = null;
                // document.getElementById('hover-info').classList.add('info-hidden');
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        this.updateBoatMovement();
        this.updateOceanWaves(time);
        this.updateHoverEffect();
        this.updateMinimap();

        // Animate buoys bobbing
        this.objects.forEach(obj => {
            if (obj.item.type === 'file') {
                obj.mesh.position.y = Math.sin(time * 2 + obj.mesh.position.x) * 0.3;
                obj.mesh.rotation.z = Math.sin(time + obj.mesh.position.z) * 0.1;
            }
        });

        this.checkVicinity();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    checkVicinity() {
        if (!this.boat) return;

        let closestDist = Infinity;
        let closestObj = null;
        const threshold = 15; // Vicinity threshold

        this.objects.forEach(obj => {
            const dist = this.boat.position.distanceTo(obj.mesh.position);
            if (dist < closestDist) {
                closestDist = dist;
                closestObj = obj;
            }
        });

        const prompt = document.getElementById('vicinity-prompt');

        if (closestDist < threshold && closestObj) {
            this.vicinityObject = closestObj;
            prompt.classList.remove('hidden');
            prompt.querySelector('.prompt-text').textContent = `to open ${closestObj.item.name}`;
        } else {
            this.vicinityObject = null;
            prompt.classList.add('hidden');
        }
    }

    handleSpaceKey() {
        if (this.vicinityObject) {
            this.handleObjectClick(this.vicinityObject.mesh);
        }
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    new Vimlantis();
});
