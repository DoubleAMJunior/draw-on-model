import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toolState } from '../Utils/ToolsManager';
import { drawLine,drawPoint } from '../Utils/DrawHelpers';
import { getMousePosition } from '../Utils/MouseHelpers';
import { penColor } from '../Utils/ColorPicker';
import {createEggGeometry} from '../Utils/EggGeometry'

export default class MainScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 2);
    this.renderer = new THREE.WebGLRenderer({alpha:true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 5;
    this.controls.enableRotate = true;
    this.controls.screenSpacePanning = false; 
    this.controls.minPolarAngle = 0; 
    this.controls.maxPolarAngle = Math.PI; 
    this.controls.rotateSpeed = 1.0;
    this.controls.mouseButtons= {
        RIGHT: THREE.MOUSE.ROTATE,
        MIDDLE : THREE.MOUSE.DOLLY
    }

    const ambientLight = new THREE.AmbientLight(0x404040,7); 
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize(); 
    this.scene.add(directionalLight);

    this.lastIntersection=undefined;
    this.isDrawing=false;
    this.raycaster = new THREE.Raycaster();

    this.drawingCanvas = document.createElement('canvas');
    this.drawingCanvas.width = 1024 *4;
    this.drawingCanvas.height = 1024 * 4;
    this.drawingContext = this.drawingCanvas.getContext('2d');
    this.drawingContext.fillStyle = "rgba(0,0,0,0)";
    this.drawingContext.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    const texture = new THREE.CanvasTexture(this.drawingCanvas);
    this.secondaryMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        metalness: 0.6  ,
        roughness: 0.5
    });


    const sphereGeometry =  createEggGeometry(0.5, 1.2, 32, 32) ;
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.2  ,
        roughness: 0.5
    });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(this.sphere);

    this.secondarySphere = new THREE.Mesh(sphereGeometry, this.secondaryMaterial);
    this.secondarySphere.visible = true;
    this.scene.add(this.secondarySphere);
  }
  animate() {
    requestAnimationFrame(()=>{this.animate()});
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  penDraw(event) {
    if (!this.sphere) return;
  
    const mouse = getMousePosition(event,this.renderer);
  
    this.raycaster.setFromCamera(mouse, this.camera);
  
    const intersects = this.raycaster.intersectObject(this.sphere, true);
    if (intersects.length > 0) {
      const intersect = intersects[0];
  
      const currentUV = intersect.uv;
      const currentX = currentUV.x * this.drawingCanvas.width;
      const currentY = (1 - currentUV.y) * this.drawingCanvas.height;
  
        if (this.lastIntersection) {
          const lastUV = this.lastIntersection.uv;
          const lastX = lastUV.x * this.drawingCanvas.width;
          const lastY = (1 - lastUV.y) * this.drawingCanvas.height;
  
          const deltaU = Math.abs(currentUV.x - lastUV.x);
          const deltaV = Math.abs(currentUV.y - lastUV.y);
          const wrapThreshold = 0.5;
          
          if (deltaU > wrapThreshold) {
            if (currentUV.x > lastUV.x) {
              drawLine(this.drawingContext,penColor,lastX, lastY, 0,currentY);
              drawLine(this.drawingContext,penColor,this.drawingCanvas.width, lastY, currentX, currentY);
            } else {
              drawLine(this.drawingContext,penColor,lastX, lastY,this.drawingCanvas.width, lastY);
              drawLine(this.drawingContext,penColor,0, currentY, currentX, currentY);
            }
          } else if (deltaV > wrapThreshold) {
            if (currentUV.y > lastUV.y) {
              drawLine(this.drawingContext,penColor,lastX, lastY, lastX,0 );
  
              drawLine(this.drawingContext,penColor,currentX, this.drawingCanvas.height, currentX, currentY);
            } else {
              drawLine(this.drawingContext,penColor,lastX, lastY, lastX,  this.drawingCanvas.height);
              drawLine(this.drawingContext,penColor,currentX,0, currentX, currentY);
            }
          } else {
            drawLine(this.drawingContext,penColor,lastX, lastY, currentX, currentY);
          }
      } else {
        drawPoint(this.drawingContext,penColor,currentX,currentY)
      }
      this.secondaryMaterial.map.needsUpdate = true;
      this.lastIntersection=intersect;
    }
    else{
      this.lastIntersection=undefined
    }
  }
  circleDraw(event){
    if (!this.sphere) return;
  
    const mouse = getMousePosition(event,this.renderer);
  
    this.raycaster.setFromCamera(mouse, this.camera);
    
    const intersects = this.raycaster.intersectObject(this.sphere, true);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const currentUV = intersect.uv;
      const currentY = (1 - currentUV.y) * this.drawingCanvas.height;
      drawLine(this.drawingContext,penColor,0,currentY,this.drawingCanvas.width,currentY)
      this.secondaryMaterial.map.needsUpdate = true;
    }
  }
  onMouseDown(event) {
    if(event.button !=0) return;
    this.isDrawing = true;
    if(toolState=="pen")
      this.penDraw(event);
    else
      this.circleDraw(event)
  }

  onMouseMove(event) {
    if (this.isDrawing) {
      if(toolState=="pen")
        this.penDraw(event);
      else
        this.circleDraw(event)
    }
  }
   onMouseUp() {
    this.isDrawing = false;
    this.lastIntersection=undefined
  }
  reset(){
    this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    this.drawingContext.fillStyle = "rgba(0, 0, 0, 0)";
    this.drawingContext.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    this.secondaryMaterial.map.needsUpdate = true;
  }
}

