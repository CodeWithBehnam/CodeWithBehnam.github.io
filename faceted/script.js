// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -5); // Position camera above and behind the player
camera.lookAt(0, 0, 0); // Point camera at the origin
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
directionalLight.position.set(1, 1, 1); // Position light above and to the right
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
scene.add(ambientLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100); // Large flat plane
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 }); // Dark gray color
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lie flat
scene.add(ground);

// Player
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Sphere with radius 0.5
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Green material
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // Position slightly above ground
scene.add(player);

// Obstacles
const obstacles = [];
const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1); // 1x1x1 cube
const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red material
for (let i = 0; i < 10; i++) {
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    // Randomly position obstacles along x-axis and far ahead on z-axis
    obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Particle System (trail effect)
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3); // x, y, z for each particle
const particleVelocities = new Float32Array(particleCount * 3); // Velocity for each particle
const particleLifetimes = new Float32Array(particleCount); // Lifetime for each particle
for (let i = 0; i < particleCount; i++) {
    // Start particles at player's position
    particlePositions[i * 3] = player.position.x;
    particlePositions[i * 3 + 1] = player.position.y;
    particlePositions[i * 3 + 2] = player.position.z;
    // Random small velocities for spread
    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    particleLifetimes[i] = 0; // Initial lifetime
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ 
    color: 0x00ff00, // Green particles
    size: 0.1, 
    transparent: true, 
    opacity: 0.5 
});
const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Game state
let isGameOver = false;
let score = 0;
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameover');
const keys = { left: false, right: false }; // Track key states

// Input handling
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') keys.left = true;
    else if (event.key === 'ArrowRight') keys.right = true;
    else if (event.key === 'r' && isGameOver) {
        // Restart game
        isGameOver = false;
        score = 0;
        player.position.x = 0; // Reset player position
        obstacles.forEach(obstacle => {
            // Reset obstacles to random positions
            obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
        });
        gameOverElement.style.display = 'none'; // Hide game over message
        scoreElement.textContent = `Score: ${score}`; // Reset score display
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
        // Move player within bounds (-5 to 5 on x-axis)
        if (keys.left && player.position.x > -5) player.position.x -= 0.05;
        if (keys.right && player.position.x < 5) player.position.x += 0.05;

        // Move obstacles towards player
        obstacles.forEach(obstacle => {
            obstacle.position.z += 0.1; // Move forward
            if (obstacle.position.z > 5) {
                // Reset obstacle position when it passes player
                obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -20 - Math.random() * 20);
                score++; // Increment score
                scoreElement.textContent = `Score: ${score}`; // Update score display
            }
            // Simple collision detection
            if (Math.abs(player.position.x - obstacle.position.x) < 1 && Math.abs(obstacle.position.z) < 1) {
                isGameOver = true;
                gameOverElement.style.display = 'block'; // Show game over message
            }
        });

        // Update particle system
        for (let i = 0; i < particleCount; i++) {
            if (particleLifetimes[i] > 0) {
                // Move particle based on velocity
                particlePositions[i * 3] += particleVelocities[i * 3];
                particlePositions[i * 3 + 1] += particleVelocities[i * 3 + 1];
                particlePositions[i * 3 + 2] += particleVelocities[i * 3 + 2];
                particleLifetimes[i] -= 0.01; // Decrease lifetime
                if (particleLifetimes[i] <= 0) {
                    // Reset particle to player's position when lifetime expires
                    particlePositions[i * 3] = player.position.x;
                    particlePositions[i * 3 + 1] = player.position.y;
                    particlePositions[i * 3 + 2] = player.position.z;
                }
            } else {
                // Respawn particle with new velocity
                particleLifetimes[i] = 1;
                particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
                particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
                particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            }
        }
        particleGeometry.attributes.position.needsUpdate = true; // Update particle positions
    }
    renderer.render(scene, camera); // Render the scene
}
animate(); // Start the animation loop
