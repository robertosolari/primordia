import * as THREE from 'three';

// Definizione delle parti evolutive. Ogni parte modifica le statistiche
// della cellula e aggiunge una mesh al corpo.
export const PART_DEFS = {
  flagellum: {
    id: 'flagellum',
    name: 'Flagello',
    icon: '〰️',
    color: 0x7de8ff,
    maxLevel: 3,
    describe: 'Velocità di nuoto aumentata',
    apply: (stats) => { stats.maxSpeed *= 1.28; },
  },
  spike: {
    id: 'spike',
    name: 'Spuntone',
    icon: '🔱',
    color: 0xff8d6b,
    maxLevel: 3,
    describe: 'Puoi ferire e cacciare cellule della tua taglia',
    apply: (stats) => { stats.attack += 1; },
  },
  cilia: {
    id: 'cilia',
    name: 'Ciglia',
    icon: '✳️',
    color: 0xc79bff,
    maxLevel: 3,
    describe: 'Manovrabilità e scatto migliorati',
    apply: (stats) => { stats.agility *= 1.35; },
  },
};

// --- Mesh delle parti, costruite in spazio locale della cellula.
// Convenzione: la cellula "guarda" verso +Z locale. Flagello dietro (-Z).

export function buildFlagellum(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.25,
    roughness: 0.6,
  });
  const segments = [];
  const count = 9;
  for (let i = 0; i < count; i++) {
    const r = 0.16 * (1 - i / count) + 0.03;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
    seg.position.z = -1.05 - i * 0.24;
    group.add(seg);
    segments.push(seg);
  }
  group.userData.animate = (t, phase = 0) => {
    for (let i = 0; i < segments.length; i++) {
      segments[i].position.x = Math.sin(t * 9 + i * 0.9 + phase) * 0.12 * (i + 1) * 0.35;
    }
  };
  return group;
}

export function buildSpike(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.2,
    roughness: 0.4,
  });
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 10), mat);
  spike.rotation.x = Math.PI / 2;
  spike.position.z = 1.35;
  group.add(spike);
  return group;
}

export function buildCilia(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
    roughness: 0.7,
  });
  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const hair = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 5), mat);
    hair.position.set(Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0);
    hair.lookAt(hair.position.clone().multiplyScalar(2));
    hair.rotateX(Math.PI / 2);
    group.add(hair);
  }
  return group;
}

export const PART_BUILDERS = {
  flagellum: buildFlagellum,
  spike: buildSpike,
  cilia: buildCilia,
};
