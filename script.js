// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube geometry and material
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x111111, shininess: 100 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft base light
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Bright point light
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Position camera
camera.position.z = 5;

// Mouse interaction
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1; // Normalized -1 to 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update color based on mouse
    const r = Math.abs(mouseX) * 255;
    const g = Math.abs(mouseY) * 255;
    const b = 100;
    material.color.setRGB(r / 255, g / 255, b / 255);

    // Move light with mouse
    pointLight.position.x = mouseX * 10;
    pointLight.position.y = mouseY * 10;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
