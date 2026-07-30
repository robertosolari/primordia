import * as THREE from 'three';
import { GEO, standardMat } from './assets.js';

// Archetipi di NPC: variano statistiche, silhouette e in alcuni casi il
// comportamento (vedi Game.updateNpcs). Ogni "visual" aggiunge mesh al
// group della cellula già costruita, riusando geometrie/materiali condivisi.

function buildTankVisual(cell) {
  const plateColor = new THREE.Color(cell.color).multiplyScalar(0.6).getHex();
  const mat = standardMat(plateColor, { emissiveIntensity: 0.2, roughness: 0.8 });
  const count = 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const plate = new THREE.Mesh(GEO.armorPlate, mat);
    plate.position.set(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95);
    plate.lookAt(plate.position.clone().multiplyScalar(2));
    cell.group.add(plate);
  }
}

function buildSwarmerVisual(cell) {
  const mat = standardMat(cell.color, { emissiveIntensity: 0.6, roughness: 0.6 });
  const sides = [-1, 1];
  for (const side of sides) {
    const fin = new THREE.Mesh(GEO.cilium, mat);
    fin.position.set(side * 0.55, 0, -0.3);
    fin.rotation.z = side * 0.9;
    fin.rotation.x = Math.PI / 2;
    cell.group.add(fin);
  }
}

function buildPackVisual(cell) {
  const maneColor = 0xe8b23c;
  const mat = standardMat(maneColor, { emissiveIntensity: 0.35, roughness: 0.5 });
  const count = 7;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const tuft = new THREE.Mesh(GEO.spike, mat);
    tuft.scale.setScalar(0.4);
    tuft.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55 - 0.2);
    tuft.lookAt(tuft.position.clone().multiplyScalar(2));
    cell.group.add(tuft);
  }
}

function buildAmbushVisual(cell) {
  const mat = standardMat(0x7ddb6f, { emissiveIntensity: 0.4, roughness: 0.7 });
  const bump = new THREE.Mesh(GEO.alga, mat);
  bump.scale.setScalar(1.6);
  bump.position.y = 0.3;
  cell.group.add(bump);
}

export const ARCHETYPES = {
  drifter: {
    id: 'drifter',
    weight: 46,
    diet: null,
    sizeMul: 1,
    groupSize: () => 1,
    statMul: { maxSpeed: 1, agility: 1, attack: 1 },
    hpBonus: 0,
    rimBase: 1.6,
    visual: null,
  },
  tank: {
    id: 'tank',
    weight: 16,
    diet: 'herbivore',
    sizeMul: 1.15,
    groupSize: () => 1,
    statMul: { maxSpeed: 0.55, agility: 0.65, attack: 1 },
    hpBonus: 3,
    rimBase: 1.6,
    visual: buildTankVisual,
  },
  swarmer: {
    id: 'swarmer',
    weight: 18,
    diet: 'herbivore',
    sizeMul: 0.55,
    groupSize: () => 3 + Math.floor(Math.random() * 3),
    statMul: { maxSpeed: 1.5, agility: 1.6, attack: 1 },
    hpBonus: -2,
    rimBase: 1.6,
    visual: buildSwarmerVisual,
  },
  packHunter: {
    id: 'packHunter',
    weight: 14,
    diet: 'carnivore',
    sizeMul: 0.9,
    groupSize: () => 2 + Math.floor(Math.random() * 2),
    statMul: { maxSpeed: 1.15, agility: 1.1, attack: 1.2 },
    hpBonus: 0,
    rimBase: 1.6,
    visual: buildPackVisual,
  },
  ambusher: {
    id: 'ambusher',
    weight: 6,
    diet: 'carnivore',
    sizeMul: 1,
    groupSize: () => 1,
    statMul: { maxSpeed: 1.3, agility: 1.4, attack: 1.3 },
    hpBonus: 1,
    rimBase: 0.7,
    visual: buildAmbushVisual,
  },
};

const ORDER = Object.values(ARCHETYPES);
const TOTAL_WEIGHT = ORDER.reduce((sum, def) => sum + def.weight, 0);

export function pickArchetype() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const def of ORDER) {
    r -= def.weight;
    if (r < 0) return def.id;
  }
  return ORDER[0].id;
}
