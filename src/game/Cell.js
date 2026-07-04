import * as THREE from 'three';
import { createMembraneMaterial } from './materials.js';
import { PART_DEFS, PART_BUILDERS } from './parts.js';
import { GEO, standardMat } from './assets.js';

let nextId = 1;

// Una cellula (giocatore o NPC): corpo blob traslucido con nucleo e organelli,
// che vive sul piano XZ. La geometria è in spazio unitario e viene scalata
// con il raggio, così le parti crescono con il corpo.
export class Cell {
  constructor({ color = 0x5fd4c8, radius = 1, isPlayer = false, diet = 'herbivore' } = {}) {
    this.id = nextId++;
    this.isPlayer = isPlayer;
    this.diet = diet;
    this.color = color;
    this.radius = radius;

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.heading = 0;

    this.hp = 3;
    this.maxHp = 3;
    this.invulnUntil = 0;
    this.lastHitAt = -10;
    this.dead = false;

    this.parts = { flagellum: 0, spike: 0, cilia: 0 };
    this.partGroups = [];
    this.wobblePhase = Math.random() * Math.PI * 2;

    this.baseStats = {
      maxSpeed: isPlayer ? 10 : 6.5 + Math.random() * 2,
      agility: isPlayer ? 3.2 : 2.2,
      attack: 0,
    };
    this.stats = { ...this.baseStats };

    this.buildBody();
    this.recomputeStats();
  }

  buildBody() {
    this.group = new THREE.Group();

    this.membraneMat = createMembraneMaterial(this.color, {
      opacity: this.isPlayer ? 0.4 : 0.32,
    });
    this.membrane = new THREE.Mesh(GEO.membrane, this.membraneMat);
    this.membrane.renderOrder = 2;

    // Geometrie condivise; i materiali standard escono dalla cache per colore.
    const nucleusColor = new THREE.Color(this.color).multiplyScalar(0.55).getHex();
    this.nucleus = new THREE.Mesh(
      GEO.nucleus,
      standardMat(nucleusColor, { emissiveIntensity: 0.4, roughness: 0.5 })
    );

    // Piccoli organelli sparsi dentro la membrana (taglia via scale, non geometria).
    const organelleMat = standardMat(new THREE.Color(this.color).offsetHSL(0.08, 0, 0.1).getHex(), {
      emissive: new THREE.Color(this.color).offsetHSL(0.08, 0, -0.1).getHex(),
      emissiveIntensity: 0.5,
    });
    this.organelles = new THREE.Group();
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const o = new THREE.Mesh(GEO.organelle, organelleMat);
      o.scale.setScalar(0.65 + Math.random() * 0.65);
      const a = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 0.35;
      o.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.4, Math.sin(a) * r);
      this.organelles.add(o);
    }

    this.group.add(this.nucleus, this.organelles, this.membrane);
    this.group.scale.setScalar(this.radius);
  }

  addPart(type) {
    const def = PART_DEFS[type];
    if (!def || this.parts[type] >= def.maxLevel) return false;
    this.parts[type]++;

    const mesh = PART_BUILDERS[type](def.color);
    // Livelli successivi vengono ruotati per non sovrapporsi.
    const lvl = this.parts[type];
    if (type === 'spike' && lvl > 1) mesh.rotation.y = (lvl - 1) * 0.55 * (lvl % 2 === 0 ? 1 : -1);
    if (type === 'flagellum' && lvl > 1) mesh.rotation.y = (lvl - 1) * 0.4 * (lvl % 2 === 0 ? 1 : -1);
    if (type === 'cilia' && lvl > 1) mesh.rotation.y = 0.2 * lvl;

    mesh.userData.partType = type;
    this.partGroups.push(mesh);
    this.group.add(mesh);
    this.recomputeStats();
    return true;
  }

  recomputeStats() {
    this.stats = { ...this.baseStats };
    for (const [type, level] of Object.entries(this.parts)) {
      for (let i = 0; i < level; i++) PART_DEFS[type].apply(this.stats);
    }
    // Le cellule grandi sono un po' più lente ma non lumache.
    this.sizeSpeedFactor = 1 / (0.75 + this.radius * 0.22);
  }

  grow(amount) {
    this.radius = Math.min(this.radius + amount, 4.2);
    this.group.scale.setScalar(this.radius);
    this.recomputeStats();
  }

  // Steering morbido verso un punto del piano.
  steer(target, dt, speedFactor = 1) {
    const desired = target.clone().sub(this.position);
    desired.y = 0;
    const dist = desired.length();
    if (dist > 0.0001) {
      const speed = this.stats.maxSpeed * this.sizeSpeedFactor * speedFactor * Math.min(1, dist / 2.5);
      desired.setLength(speed);
    }
    const steer = desired.sub(this.velocity).multiplyScalar(this.stats.agility * dt);
    this.velocity.add(steer);
  }

  applyImpulse(dir, force) {
    this.velocity.add(dir.clone().setY(0).normalize().multiplyScalar(force));
  }

  update(dt, time) {
    this.position.addScaledVector(this.velocity, dt);
    this.position.y = 0;
    // Attrito dell'acqua.
    this.velocity.multiplyScalar(Math.max(0, 1 - 1.4 * dt));

    // Orientamento verso la direzione di nuoto.
    if (this.velocity.lengthSq() > 0.05) {
      const target = Math.atan2(this.velocity.x, this.velocity.z);
      let diff = target - this.heading;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.heading += diff * Math.min(1, 6 * dt);
    }

    this.group.position.copy(this.position);
    this.group.position.y = Math.sin(time * 1.3 + this.wobblePhase) * 0.15;
    this.group.rotation.y = this.heading;

    this.membraneMat.userData.uniforms.uTime.value = time + this.wobblePhase;

    // Lampeggio rosso quando colpiti.
    const sinceHit = time - this.lastHitAt;
    const flash = sinceHit < 0.5 ? (0.5 - sinceHit) * 2 : 0;
    const c = this.membraneMat.userData.uniforms.uColor.value;
    c.set(this.color).lerp(new THREE.Color(0xff3b30), flash);

    const speedRatio = this.velocity.length() / (this.stats.maxSpeed * this.sizeSpeedFactor + 0.001);
    for (const part of this.partGroups) {
      if (part.userData.animate) part.userData.animate(time * (0.4 + speedRatio), this.wobblePhase);
    }

    this.organelles.rotation.y = time * 0.15 + this.wobblePhase;
  }

  takeDamage(amount, time) {
    if (time < this.invulnUntil) return false;
    this.hp -= amount;
    this.lastHitAt = time;
    this.invulnUntil = time + (this.isPlayer ? 1.2 : 0.5);
    if (this.hp <= 0) this.dead = true;
    return true;
  }

  dispose() {
    // Geometrie e materiali standard sono condivisi: si dealloca solo
    // il materiale della membrana, che è l'unico per-cellula.
    this.membraneMat.dispose();
  }
}
