import * as THREE from 'three';
export function getMousePosition(event,renderer) {
    const rect = renderer.domElement.getBoundingClientRect();
  
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    return mouse;
}