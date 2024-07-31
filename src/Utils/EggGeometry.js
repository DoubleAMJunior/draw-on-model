import * as THREE from 'three';
export function createEggGeometry(radius, height, widthSegments, heightSegments) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

  const vertices = geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const y = vertices[i + 1];
    const factor = 1 + 0.3 * (y / radius);
    vertices[i] *= factor;
    vertices[i + 2] *= factor;
    vertices[i + 1] *= (height / (2 * radius)); 
  }

  geometry.computeVertexNormals();
  geometry.rotateX(180)
  return geometry;
}