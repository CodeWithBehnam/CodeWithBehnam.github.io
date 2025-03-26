// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -5);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Mini-map setup
const minimapCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
minimapCamera.position.set(0, 20, 0);
minimapCamera.lookAt(0, 0, 0);
const minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
minimapRenderer.setSize(150, 150);
document.getElementById('minimap').appendChild(minimapRenderer.domElement);

// Skybox
const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
    'path/to/px.jpg', 'path/to/nx.jpg', // Replace with actual skybox image paths
    'path/to/py.jpg', 'path/to/ny.jpg',
    'path/to/pz.jpg', 'path/to/nz.jpg'
]);
scene.background = skyboxTexture;

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, -5);
scene.add(pointLight);

// Ground with texture
const groundTexture = new THREE.TextureLoader().load('path/to/ground_texture.jpg'); // Replace with actual path
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);
const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// Obstacles with texture
const obstacleTexture = new THREE.TextureLoader().load('path/to/obstacle_texture.jpg'); // Replace with actual path
const obstacleMaterial = new THREE.MeshPhongMaterial({ map: obstacleTexture });
const obstacles = [];
for (let i = 0; i < 10; i++) {
    const obstacle = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), obstacleMaterial);
    obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Particle system (trail effect)
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = new Float32Array(particleCount * 3);
const particleLifetimes = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = player.position.x;
    particlePositions[i * 3 + 1] = player.position.y;
    particlePositions[i * 3 + 2] = player.position.z;
    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    particleLifetimes[i] = 0;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.1, transparent: true, opacity: 0.5 });
const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Game state
let isGameOver = false;
let score = 0;
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameover');
const keys = { left: false, right: false };

// Input handling
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') keys.left = true;
    else if (event.key === 'ArrowRight') keys.right = true;
    else if (event.key === 'r' && isGameOver) {
        isGameOver = false;
        score = 0;
        player.position.x = 0;
        obstacles.forEach(obstacle => {
            obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
        });
        gameOverElement.style.display = 'none';
        scoreElement.textContent = `Score: ${score}`;
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') keys.left = false;
    else if (event.key === 'ArrowRight') keys.right = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (!isGameOver) {
        // Move player
        if (keys.left && player.position.x > -5) player.position.x -= 0.05;
        if (keys.right && player.position.x < 5) player.position.x += 0.05;
        pointLight.position.x = player.position.x; // Light follows player

        // Move obstacles
        obstacles.forEach(obstacle => {
            obstacle.position.z += 0.1;
            if (obstacle.position.z > 5) {
                obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
                score++;
                scoreElement.textContent = `Score: ${score}`;
            }
            if (Math.abs(player.position.x - obstacle.position.x) < 1 && Math.abs(obstacle.position.z) < 1) {
                isGameOver = true;
                gameOverElement.style.display = 'block';
            }
        });

        // Update particles
        for (let i = 0; i < particleCount; i++) {
            if (particleLifetimes[i] > 0) {
                particlePositions[i * 3] += particleVelocities[i * 3];
                particlePositions[i * 3 + 1] += particleVelocities[i * 3 + 1];
                particlePositions[i * 3 + 2] += particleVelocities[i * 3 + 2];
                particleLifetimes[i] -= 0.01;
                if (particleLifetimes[i] <= 0) {
                    particlePositions[i * 3] = player.position.x;
                    particlePositions[i * 3 + 1] = player.position.y;
                    particlePositions[i * 3 + 2] = player.position.z;
                }
            } else {
                particleLifetimes[i] = 1;
                particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
                particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
                particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            }
        }
        particleGeometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
    minimapRenderer.render(scene, minimapCamera); // Render mini-map
}
animate();
