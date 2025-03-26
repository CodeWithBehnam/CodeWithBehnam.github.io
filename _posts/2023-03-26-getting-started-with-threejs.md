---
layout: post
title: "Getting Started with Three.js: Creating Your First 3D Scene"
date: 2023-03-26
categories: [Web Development, 3D Graphics]
tags: [threejs, javascript, 3d, tutorial]
---

Three.js is a powerful JavaScript library that makes working with 3D graphics in the browser accessible and fun. In this post, I'll walk you through creating your first 3D scene with Three.js.

## What is Three.js?

Three.js is a cross-browser JavaScript library/API used to create and display animated 3D computer graphics in a web browser using WebGL. It provides an abstraction layer that simplifies the process of working with WebGL.

## Setting Up Your First Project

Let's start by setting up a basic project structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Three.js Scene</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

Now let's create our `script.js` file with the basic Three.js setup:

```javascript
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position camera
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
```

## Understanding the Core Components

Let's break down the key components we're using:

### 1. Scene

The scene is like a container that holds all your objects, lights, and cameras. Everything you want to render needs to be added to the scene.

```javascript
const scene = new THREE.Scene();
```

### 2. Camera

The camera defines what we can see. The most common camera is the perspective camera, which mimics how human eyes see.

```javascript
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
```

The parameters are:
- Field of view (75 degrees)
- Aspect ratio (window width/height)
- Near clipping plane (0.1)
- Far clipping plane (1000)

### 3. Renderer

The renderer is responsible for drawing the scene to the screen.

```javascript
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

### 4. Geometry and Material

Geometry defines the shape of an object, while material defines its appearance.

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
```

### 5. Mesh

A mesh combines geometry and material to form a 3D object.

```javascript
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### 6. Animation Loop

The animation loop continuously renders the scene and updates object properties.

```javascript
function animate() {
    requestAnimationFrame(animate);
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}
animate();
```

## Adding More Complexity

Now that you have a basic scene, you can start adding more interesting features:

### Lighting

Let's add some lighting to see the effects of light on our objects:

```javascript
// Replace MeshBasicMaterial with MeshPhongMaterial
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);
```

### Textures

You can add textures to make your objects look more realistic:

```javascript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg');
const material = new THREE.MeshPhongMaterial({ map: texture });
```

## Conclusion

This is just the beginning of what you can do with Three.js. From here, you can explore more complex geometries, custom shaders, particle systems, 3D models, and more.

In future posts, we'll dive deeper into specific topics like:
- Loading 3D models
- Creating interactive controls
- Working with lights and shadows
- Building complex scenes
- Implementing physics

Stay tuned, and happy coding! 