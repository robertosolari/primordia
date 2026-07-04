import * as THREE from 'three';
import { QUALITY } from './quality.js';

// Risorse condivise: cibo, pickup e cellule spawnano/despawnano di continuo,
// quindi geometrie e materiali vengono creati UNA volta e riusati da tutti.
// Nessuna di queste risorse va mai passata a dispose().

function buildBoltGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1);
  shape.lineTo(-0.45, 0.05);
  shape.lineTo(-0.1, 0.05);
  shape.lineTo(-0.35, -1);
  shape.lineTo(0.45, 0.15);
  shape.lineTo(0.1, 0.15);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  geo.scale(0.55, 0.55, 1);
  return geo;
}

export const GEO = {
  membrane: new THREE.SphereGeometry(1, QUALITY.membraneSegments[0], QUALITY.membraneSegments[1]),
  nucleus: new THREE.SphereGeometry(0.42, 20, 16),
  organelle: new THREE.SphereGeometry(0.12, 8, 8),
  alga: new THREE.IcosahedronGeometry(0.18, 0),
  meat: new THREE.IcosahedronGeometry(0.28, 0),
  token: new THREE.OctahedronGeometry(0.45, 0),
  heartLobe: new THREE.SphereGeometry(0.26, 14, 12),
  heartTip: new THREE.ConeGeometry(0.4, 0.62, 12),
  unitSphere: new THREE.SphereGeometry(1, 8, 8),
  spike: new THREE.ConeGeometry(0.22, 1.1, 10),
  cilium: new THREE.ConeGeometry(0.05, 0.45, 5),
  bolt: buildBoltGeometry(),
};

const matCache = new Map();

// MeshStandardMaterial condiviso, indicizzato per aspetto.
export function standardMat(color, { emissive = color, emissiveIntensity = 0.5, roughness = 0.6 } = {}) {
  const key = `${color}|${emissive}|${emissiveIntensity}|${roughness}`;
  let mat = matCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity, roughness });
    matCache.set(key, mat);
  }
  return mat;
}
