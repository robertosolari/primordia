import * as THREE from 'three';
import { createMembraneMaterial } from './materials.js';
import { QUALITY } from './quality.js';

export const WORLD_RADIUS = 170;

// Il brodo primordiale: nebbia, luci, plancton in sospensione e
// creature di sfondo che nuotano a profondità diverse (solo scenografia).
export class World {
  constructor(scene) {
    this.scene = scene;

    scene.background = new THREE.Color(0x07222b);
    scene.fog = new THREE.FogExp2(0x07222b, 0.02);

    const ambient = new THREE.AmbientLight(0x6fb5c9, 0.85);
    const sun = new THREE.DirectionalLight(0xbfeee8, 1.4);
    sun.position.set(6, 30, 4);
    scene.add(ambient, sun);

    this.buildPlankton();
    this.buildDepthCreatures();
    this.buildFloor();
  }

  buildPlankton() {
    const count = QUALITY.planktonCount;
    const positions = new Float32Array(count * 3);
    this.planktonBox = new THREE.Vector3(90, 40, 90);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.planktonBox.x;
      positions[i * 3 + 1] = -Math.random() * this.planktonBox.y + 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.planktonBox.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x9fdcd4,
      size: 0.16,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.plankton = new THREE.Points(geo, mat);
    this.scene.add(this.plankton);
  }

  buildDepthCreatures() {
    // Grandi sagome traslucide che vagano sotto il piano di gioco:
    // danno profondità e un filo d'inquietudine.
    this.depthCreatures = [];
    const depths = [-16, -26, -38, -50];
    const palette = [0x2e6d78, 0x35566e, 0x4a3f66, 0x24505a];
    for (let i = 0; i < QUALITY.depthCreatures; i++) {
      const depth = depths[i % depths.length];
      const size = 2 + Math.random() * 6 + Math.abs(depth) * 0.12;
      const mat = createMembraneMaterial(palette[i % palette.length], {
        opacity: 0.12,
        rim: 0.9,
        wobble: 0.12,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 20), mat);
      mesh.scale.set(size * 1.3, size * 0.7, size);
      mesh.position.set((Math.random() - 0.5) * 140, depth, (Math.random() - 0.5) * 140);
      mesh.renderOrder = 1;
      const angle = Math.random() * Math.PI * 2;
      this.depthCreatures.push({
        mesh,
        mat,
        speed: 0.6 + Math.random() * 1.2,
        angle,
        turn: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * 10,
      });
      this.scene.add(mesh);
    }
  }

  buildFloor() {
    // Fondale lontano, appena percepibile attraverso la nebbia.
    const geo = new THREE.PlaneGeometry(700, 700, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, Math.sin(pos.getX(i) * 0.05) * Math.cos(pos.getY(i) * 0.05) * 6 + Math.random() * 1.5);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b2e33, roughness: 1 });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -60;
    this.scene.add(floor);
  }

  update(dt, time, playerPos) {
    // Il plancton avvolge il giocatore: le particelle che escono dal box
    // rientrano dal lato opposto, così il brodo sembra infinito.
    const p = this.plankton.geometry.attributes.position;
    const box = this.planktonBox;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i);
      while (x - playerPos.x > box.x / 2) x -= box.x;
      while (x - playerPos.x < -box.x / 2) x += box.x;
      while (z - playerPos.z > box.z / 2) z -= box.z;
      while (z - playerPos.z < -box.z / 2) z += box.z;
      p.setX(i, x);
      p.setZ(i, z);
    }
    p.needsUpdate = true;
    // Lieve deriva verticale.
    this.plankton.position.y = Math.sin(time * 0.2) * 0.8;

    for (const c of this.depthCreatures) {
      c.angle += c.turn * dt;
      c.mesh.position.x += Math.sin(c.angle) * c.speed * dt;
      c.mesh.position.z += Math.cos(c.angle) * c.speed * dt;
      c.mesh.rotation.y = c.angle;
      c.mat.userData.uniforms.uTime.value = time + c.phase;

      // Se troppo lontane dal giocatore, riappaiono dall'altro lato.
      const dx = c.mesh.position.x - playerPos.x;
      const dz = c.mesh.position.z - playerPos.z;
      if (dx * dx + dz * dz > 120 * 120) {
        c.mesh.position.x = playerPos.x - dx * 0.9;
        c.mesh.position.z = playerPos.z - dz * 0.9;
      }
    }
  }
}
