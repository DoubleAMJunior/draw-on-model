import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let penColor="#ff0000";
const colorPicker = document.getElementById('colorPicker');
colorPicker.value=penColor
colorPicker.addEventListener('input', (event) => {
  // Get the selected color value
  penColor= event.target.value;
});

let scene, camera, renderer, controls, sphere, drawingCanvas, drawingContext, secondaryMaterial,secondarySphere, raycaster, isDrawing;
console.log("test")
init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({alpha:true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;

  controls.minDistance = 2;
  controls.maxDistance = 30;
  controls.enableDamping = true;
  controls.mouseButtons= {
    RIGHT: THREE.MOUSE.ROTATE,
    MIDDLE : THREE.MOUSE.DOLLY
  }

  const ambientLight = new THREE.AmbientLight(0x404040,7); 
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize(); 
  scene.add(directionalLight);

  raycaster = new THREE.Raycaster();

  drawingCanvas = document.createElement('canvas');
  drawingCanvas.width = 1024 *2;
  drawingCanvas.height = 1024 * 2;
  drawingContext = drawingCanvas.getContext('2d');
  drawingContext.fillStyle = "rgba(0,0,0,0)";
  drawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

  const texture = new THREE.CanvasTexture(drawingCanvas);
  secondaryMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    metalness: 0.6  ,
    roughness: 0.5
  });

  // Create a metallic sphere
  const sphereGeometry =  createEggGeometry(0.5, 1.2, 32, 32) ;
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.2  ,
    roughness: 0.5
  });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  secondarySphere = new THREE.Mesh(sphereGeometry, secondaryMaterial);
  secondarySphere.visible = true;
  scene.add(secondarySphere);

  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('resize', onWindowResize, false);
}
function createEggGeometry(radius, height, widthSegments, heightSegments) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

  const vertices = geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const y = vertices[i + 1];
    const factor = 1 + 0.3 * (y / radius); // Adjust the shape factor to form an egg
    vertices[i] *= factor;
    vertices[i + 2] *= factor;
    vertices[i + 1] *= (height / (2 * radius)); // Scale Y axis for egg height
  }

  geometry.computeVertexNormals();
  geometry.rotateX(180)
  return geometry;
}

function onMouseDown(event) {
  if(event.button !=0) return;
  isDrawing = true;
  draw(event);
}

let lastIntersection=undefined;
function onMouseMove(event) {
  if (isDrawing) {
    draw(event);
  }
}

function onMouseUp() {
  isDrawing = false;
  lastIntersection=undefined
}
function getMousePosition(event) {
  // Get the bounding rectangle of the canvas
  const rect = renderer.domElement.getBoundingClientRect();
  
  // Calculate the correct mouse position relative to the canvas
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  return mouse;
}


function draw(event) {
  if (!sphere) return;

  const mouse = getMousePosition(event);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere, true);
  if (intersects.length > 0) {
    const intersect = intersects[0];

    // Draw on the canvas
    const currentUV = intersect.uv;
    const currentX = currentUV.x * drawingCanvas.width;
    const currentY = (1 - currentUV.y) * drawingCanvas.height;

      if (lastIntersection) {
        const lastUV = lastIntersection.uv;
        const lastX = lastUV.x * drawingCanvas.width;
        const lastY = (1 - lastUV.y) * drawingCanvas.height;

        // Calculate the absolute difference in UV coordinates
        const deltaU = Math.abs(currentUV.x - lastUV.x);
        const deltaV = Math.abs(currentUV.y - lastUV.y);
        const dx = currentX - lastX;
        const dy = currentY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Define a threshold to detect wrap-around
        const wrapThreshold = 0.5;
        
        if (deltaU > wrapThreshold) {
          // U wrap-around detected

          // Determine direction of wrap (left to right or right to left)
          if (currentUV.x > lastUV.x) {
            // From right edge to left edge
            // Draw from last point to right edge
            drawLine(drawingContext,penColor,lastX, lastY, drawingCanvas.width, lastY);
            // Draw from left edge to current point
            drawLine(drawingContext,penColor,0, currentY, currentX, currentY);
          } else {
            // From left edge to right edge
            // Draw from last point to left edge
            drawLine(drawingContext,penColor,lastX, lastY, 0, lastY);
            // Draw from right edge to current point
            drawLine(drawingContext,penColor,drawingCanvas.width, currentY, currentX, currentY);
          }
        } else if (deltaV > wrapThreshold) {
          // V wrap-around detected

          // Determine direction of wrap (bottom to top or top to bottom)
          if (currentUV.y > lastUV.y) {
            // From bottom edge to top edge
            // Draw from last point to bottom edge
            drawLine(drawingContext,penColor,lastX, lastY, lastX, drawingCanvas.height);
            // Draw from top edge to current point
            drawLine(drawingContext,penColor,currentX, 0, currentX, currentY);
          } else {
            // From top edge to bottom edge
            // Draw from last point to top edge
            drawLine(drawingContext,penColor,lastX, lastY, lastX, 0);
            // Draw from bottom edge to current point
            drawLine(drawingContext,penColor,currentX, drawingCanvas.height, currentX, currentY);
          }
        } else {
          // No wrap-around, draw normally
          drawLine(drawingContext,penColor,lastX, lastY, currentX, currentY);
        }
    } else {
      drawPoint(drawingContext,penColor,currentX,currentY)
    }
    secondaryMaterial.map.needsUpdate = true;
    lastIntersection=intersect;
  }
  else{
    lastIntersection=undefined
  }
}
function drawLine(context,color,x1, y1, x2, y2,width=5) {
  context.strokeStyle = color;
  context.lineWidth=width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}
function drawPoint(context,color,x,y,width=3){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI * 2);
    context.fill();
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}