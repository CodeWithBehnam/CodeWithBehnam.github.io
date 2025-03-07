// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Gradient background
scene.background = new THREE.Color(0x1a0d2b);

// Group to hold orb and particles for unified rotation
const group = new THREE.Group();
scene.add(group);

// Crystal orb with dynamic geometry
let isIcosahedron = true;
const icosahedronGeometry = new THREE.IcosahedronGeometry(1, 1);
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshPhongMaterial({
    color: 0x00ccff,
    emissive: 0x004466,
    shininess: 100,
    transparent: true,
    opacity: 0.9
});
const orb = new THREE.Mesh(icosahedronGeometry, material);
group.add(orb);

// Particle aura
const particleCount = 200;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
    const radius = 2 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
    velocities[i] = (Math.random() - 0.5) * 0.02;
    velocities[i + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i + 2] = (Math.random() - 0.5) * 0.02;
}
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
    color: 0x66ffff,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(particles, particleMaterial);
group.add(particleSystem);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Camera position
camera.position.z = 5;

// Mouse interaction variables
let mouseX = 0, mouseY = 0;
let isDragging = false;
let previousMouseX = 0, previousMouseY = 0;

// Mouse events
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isDragging) {
        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;
        group.rotation.y += deltaX * 0.005;
        group.rotation.x += deltaY * 0.005;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
});

document.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('click', () => {
    // Toggle orb shape
    isIcosahedron = !isIcosahedron;
    orb.geometry = isIcosahedron ? icosahedronGeometry : sphereGeometry;
});

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.02;

    // Orb pulsation (auto-rotation is now manual via drag)
    orb.scale.set(1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1);

    // Particle movement
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i] + mouseX * 0.01;
        positions[i + 1] += velocities[i + 1] + mouseY * 0.01;
        positions[i + 2] += velocities[i + 2];
        const dist = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2);
        if (dist > 4 || dist < 1.5) {
            velocities[i] *= -0.5;
            velocities[i + 1] *= -0.5;
            velocities[i + 2] *= -0.5;
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Light follows mouse
    pointLight.position.x = mouseX * 10;
    pointLight.position.y = mouseY * 10;

    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
