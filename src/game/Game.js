import * as THREE from 'three';
import { Cell } from './Cell.js';
import { World, WORLD_RADIUS } from './World.js';
import { Hud } from './hud.js';
import { PART_DEFS } from './parts.js';
import { QUALITY } from './quality.js';
import { SoundManager } from './audio.js';

const NPC_TARGET = 26; // creature vive attorno al giocatore
const FOOD_TARGET = 150; // alghe presenti attorno al giocatore
const SPAWN_RADIUS = 70; // anello di spawn attorno al giocatore
const DESPAWN_RADIUS = 95;

const PALETTE = [0xf2a65a, 0xe86a6a, 0x8ecf6c, 0xd985c8, 0x6c9be8, 0xe8d16c, 0x9be86c, 0xe86cb8];

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: QUALITY.antialias });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatioCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    this.camera.position.set(0, 27, 7.5);
    this.camera.lookAt(0, 0, 0);

    this.world = new World(this.scene);
    this.hud = new Hud();
    this.sound = new SoundManager();

    this.clock = new THREE.Clock();
    this.time = 0;
    this.dna = 0;
    this.milestones = new Set();

    this.npcs = [];
    this.foods = [];
    this.tokens = [];
    this.hearts = [];
    this.bolts = [];
    this.boostUntil = 0;

    this.mouseNdc = new THREE.Vector2();
    this.mouseWorld = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this.spawnPlayer();
    for (let i = 0; i < NPC_TARGET; i++) this.spawnNpc(true);
    for (let i = 0; i < FOOD_TARGET; i++) this.spawnFood(true);

    window.addEventListener('resize', () => this.onResize());
    // pointermove copre mouse e trascinamento del dito; pointerdown serve
    // per il tap su mobile (dove il move non arriva senza contatto).
    const setPointer = (e) => {
      this.mouseNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener('pointermove', setPointer);
    window.addEventListener('pointerdown', setPointer);

    this.keys = new Set();
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.sound.init(); // dopo un gesto utente: obbligatorio per l'audio su mobile
    this.clock.start();
    this.renderer.setAnimationLoop(() => this.tick());
    this.hud.setDna(this.dna);
    this.hud.setHp(this.player.hp, this.player.maxHp);
    this.hud.toast('Benvenuto nel brodo primordiale. Mangia le alghe verdi! 🌿');
  }

  // ------------------------------------------------------------- spawning

  spawnPlayer() {
    this.player = new Cell({ color: 0x5fd4c8, radius: 0.8, isPlayer: true });
    this.scene.add(this.player.group);
  }

  randomRingPosition(center, minR, maxR) {
    const a = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const p = new THREE.Vector3(center.x + Math.cos(a) * r, 0, center.z + Math.sin(a) * r);
    // Dentro i confini del mondo.
    const d = Math.hypot(p.x, p.z);
    if (d > WORLD_RADIUS - 5) p.multiplyScalar((WORLD_RADIUS - 5) / d);
    return p;
  }

  spawnNpc(initial = false) {
    const playerR = this.player ? this.player.radius : 0.8;
    // Distribuzione delle taglie relativa al giocatore: molte prede, alcuni pari, pochi mostri.
    const roll = Math.random();
    let radius;
    if (roll < 0.45) radius = playerR * (0.35 + Math.random() * 0.45);
    else if (roll < 0.8) radius = playerR * (0.8 + Math.random() * 0.4);
    else radius = playerR * (1.3 + Math.random() * 0.9);
    radius = THREE.MathUtils.clamp(radius, 0.25, 5);

    const diet = Math.random() < 0.55 ? 'herbivore' : 'carnivore';
    const npc = new Cell({
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      radius,
      diet,
    });
    if (diet === 'carnivore' && Math.random() < 0.6) npc.addPart('spike');
    if (Math.random() < 0.3) npc.addPart('flagellum');

    npc.position.copy(
      this.randomRingPosition(this.player.position, initial ? 12 : SPAWN_RADIUS * 0.7, SPAWN_RADIUS)
    );
    npc.wanderAngle = Math.random() * Math.PI * 2;
    this.scene.add(npc.group);
    this.npcs.push(npc);
  }

  spawnFood(initial = false, kind = 'alga', at = null) {
    const isMeat = kind === 'meat';
    const color = isMeat ? 0xe86a6a : 0x7ddb6f;
    const geo = new THREE.IcosahedronGeometry(isMeat ? 0.28 : 0.18, 0);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(
      at ?? this.randomRingPosition(this.player.position, initial ? 3 : 12, SPAWN_RADIUS)
    );
    if (at) {
      mesh.position.x += (Math.random() - 0.5) * 1.5;
      mesh.position.z += (Math.random() - 0.5) * 1.5;
    }
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    this.scene.add(mesh);
    this.foods.push({ mesh, kind, value: isMeat ? 4 : 1, spin: (Math.random() - 0.5) * 2 });
  }

  spawnToken(at = null) {
    const types = Object.keys(PART_DEFS);
    const type = types[Math.floor(Math.random() * types.length)];
    const def = PART_DEFS[type];
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 1.2,
        roughness: 0.3,
      })
    );
    mesh.position.copy(at ?? this.randomRingPosition(this.player.position, 25, SPAWN_RADIUS));
    const halo = new THREE.PointLight(def.color, 6, 8);
    mesh.add(halo);
    this.scene.add(mesh);
    this.tokens.push({ mesh, type });
  }

  spawnHeart(at = null) {
    const color = 0xff5f8a;
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.1,
      roughness: 0.35,
    });
    const group = new THREE.Group();
    const shape = new THREE.Group();
    const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), mat);
    const lobeR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), mat);
    lobeL.position.set(-0.17, 0.16, 0);
    lobeR.position.set(0.17, 0.16, 0);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.62, 12), mat);
    tip.rotation.z = Math.PI;
    tip.position.y = -0.18;
    shape.add(lobeL, lobeR, tip);
    shape.rotation.x = -Math.PI / 2; // piatto verso la telecamera, così si legge la silhouette
    group.add(shape);
    group.add(new THREE.PointLight(color, 5, 7));
    group.position.copy(at ?? this.randomRingPosition(this.player.position, 25, SPAWN_RADIUS));
    this.scene.add(group);
    this.hearts.push({ mesh: group });
  }

  spawnBolt(at = null) {
    const color = 0xffd94d;
    // Fulmine stilizzato, piatto verso la telecamera come il cuore.
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
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.3,
      roughness: 0.3,
    });
    const bolt = new THREE.Mesh(geo, mat);
    bolt.rotation.x = -Math.PI / 2;
    const group = new THREE.Group();
    group.add(bolt);
    group.add(new THREE.PointLight(color, 5, 7));
    group.position.copy(at ?? this.randomRingPosition(this.player.position, 25, SPAWN_RADIUS));
    this.scene.add(group);
    this.bolts.push({ mesh: group });
  }

  // ------------------------------------------------------------- loop

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;

    this.updatePlayer(dt, t);
    this.updateNpcs(dt, t);
    this.updateFood(dt, t);
    this.updateTokens(dt, t);
    this.handleCollisions(t);
    this.manageSpawns();
    this.world.update(dt, t, this.player.position);
    this.updateCamera(dt);

    this.renderer.render(this.scene, this.camera);
  }

  updatePlayer(dt, t) {
    if (this.player.dead) return;

    // Scatto attivo? La membrana brilla di più finché dura.
    const boosted = t < this.boostUntil;
    const speedFactor = boosted ? 1.8 : 1;
    this.player.membraneMat.userData.uniforms.uRim.value = boosted ? 2.8 : 1.6;

    // Tastiera (WASD / frecce) ha priorità; altrimenti si segue il mouse.
    const dir = new THREE.Vector3(
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0),
      0,
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0) -
        (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0)
    );
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(8).add(this.player.position);
      this.player.steer(dir, dt, speedFactor);
    } else {
      this.raycaster.setFromCamera(this.mouseNdc, this.camera);
      const hit = this.raycaster.ray.intersectPlane(this.groundPlane, this.mouseWorld);
      if (hit) this.player.steer(this.mouseWorld, dt, speedFactor);
    }

    this.keepInBounds(this.player, dt);
    this.player.update(dt, t);

    // Trasparenza a lampeggio durante l'invulnerabilità.
    const invuln = t < this.player.invulnUntil;
    this.player.group.visible = !invuln || Math.floor(t * 12) % 2 === 0;
  }

  updateNpcs(dt, t) {
    for (const npc of this.npcs) {
      // Anche i predatori possono avere lo scatto attivo.
      const npcBoost = t < (npc.boostUntil ?? 0) ? 1.8 : 1;
      npc.membraneMat.userData.uniforms.uRim.value = npcBoost > 1 ? 2.8 : 1.6;
      // Percezione: minaccia più vicina e obiettivo più vicino.
      let threat = null, threatD = 20;
      let prey = null, preyD = 26;

      const consider = (other) => {
        if (other === npc || other.dead) return;
        const d = npc.position.distanceTo(other.position);
        const isDangerous = other.diet === 'carnivore' || other.isPlayer;
        if (other.radius > npc.radius * 1.25 && isDangerous && d < threatD) {
          threat = other; threatD = d;
        }
        if (npc.diet === 'carnivore' && other.radius < npc.radius * 0.8 && d < preyD) {
          prey = other; preyD = d;
        }
      };
      consider(this.player);
      for (const other of this.npcs) consider(other);

      if (threat) {
        const away = npc.position.clone().sub(threat.position).setY(0).normalize()
          .multiplyScalar(12).add(npc.position);
        npc.steer(away, dt, 1.15 * npcBoost);
      } else if (prey) {
        npc.steer(prey.position, dt, 1.05 * npcBoost);
      } else if (npc.diet === 'herbivore') {
        let food = null, foodD = 18;
        for (const f of this.foods) {
          if (f.kind !== 'alga') continue;
          const d = npc.position.distanceTo(f.mesh.position);
          if (d < foodD) { food = f; foodD = d; }
        }
        if (food) npc.steer(food.mesh.position, dt, 0.8);
        else this.wander(npc, dt, t);
      } else {
        this.wander(npc, dt, t);
      }

      this.keepInBounds(npc, dt);
      npc.update(dt, t);
    }
  }

  wander(cell, dt, t) {
    cell.wanderAngle = (cell.wanderAngle ?? 0) + (Math.random() - 0.5) * 2.4 * dt;
    const target = new THREE.Vector3(
      cell.position.x + Math.sin(cell.wanderAngle) * 8,
      0,
      cell.position.z + Math.cos(cell.wanderAngle) * 8
    );
    cell.steer(target, dt, 0.55);
  }

  keepInBounds(cell, dt) {
    const d = Math.hypot(cell.position.x, cell.position.z);
    if (d > WORLD_RADIUS) {
      const inward = new THREE.Vector3(-cell.position.x, 0, -cell.position.z).normalize();
      cell.velocity.addScaledVector(inward, (d - WORLD_RADIUS) * 4 * dt);
    }
  }

  updateFood(dt, t) {
    for (const f of this.foods) {
      f.mesh.rotation.y += f.spin * dt;
      f.mesh.position.y = Math.sin(t * 1.5 + f.mesh.position.x) * 0.2;
    }
  }

  updateTokens(dt, t) {
    for (const tok of this.tokens) {
      tok.mesh.rotation.y += 1.6 * dt;
      tok.mesh.position.y = Math.sin(t * 2 + tok.mesh.position.z) * 0.3 + 0.2;
    }
    for (const h of this.hearts) {
      h.mesh.rotation.y += 1.2 * dt;
      h.mesh.position.y = Math.sin(t * 2.2 + h.mesh.position.x) * 0.25 + 0.3;
      const pulse = 1 + Math.sin(t * 5) * 0.12; // battito
      h.mesh.scale.setScalar(pulse);
    }
    for (const b of this.bolts) {
      b.mesh.rotation.y += 2.2 * dt;
      b.mesh.position.y = Math.sin(t * 2.5 + b.mesh.position.z) * 0.25 + 0.3;
      const flicker = 1 + Math.sin(t * 11) * 0.08; // sfarfallio elettrico
      b.mesh.scale.setScalar(flicker);
    }
  }

  // ------------------------------------------------------------- regole

  canDevour(eater, victim) {
    return eater.radius > victim.radius * 1.25;
  }

  canFight(attacker, victim) {
    return attacker.stats.attack > 0 && attacker.radius > victim.radius * 0.8;
  }

  handleCollisions(t) {
    const player = this.player;

    // Cibo: mangiato da giocatore e NPC.
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      let eaten = false;

      if (!player.dead && player.position.distanceTo(f.mesh.position) < player.radius + 0.5) {
        this.gainDna(f.value);
        player.grow(f.value * 0.012);
        this.hud.setHp(player.hp, player.maxHp);
        if (f.kind === 'meat') this.sound.meat();
        else this.sound.eat();
        eaten = true;
      } else {
        for (const npc of this.npcs) {
          if (npc.diet === 'carnivore' && f.kind === 'alga') continue;
          if (npc.position.distanceTo(f.mesh.position) < npc.radius + 0.4) {
            npc.grow(f.value * 0.008);
            eaten = true;
            break;
          }
        }
      }

      if (eaten) {
        this.scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
        this.foods.splice(i, 1);
      }
    }

    // Token delle parti: solo il giocatore.
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const tok = this.tokens[i];
      if (!player.dead && player.position.distanceTo(tok.mesh.position) < player.radius + 0.8) {
        const def = PART_DEFS[tok.type];
        if (player.addPart(tok.type)) {
          this.hud.setParts(player.parts);
          this.hud.toast(`${def.icon} Nuova parte: <b>${def.name}</b> — ${def.describe}`);
        } else {
          this.gainDna(8);
          this.hud.toast(`${def.icon} ${def.name} già al massimo: +8 DNA`);
        }
        this.sound.pickupPart();
        this.scene.remove(tok.mesh);
        this.tokens.splice(i, 1);
      }
    }

    // Cuori: ripristinano una vita (o danno DNA se sei già al massimo).
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      if (!player.dead && player.position.distanceTo(h.mesh.position) < player.radius + 0.8) {
        if (player.hp < player.maxHp) {
          player.hp++;
          this.hud.setHp(player.hp, player.maxHp);
          this.hud.toast('❤️ Vita recuperata!');
        } else {
          this.gainDna(5);
          this.hud.toast('❤️ Sei già in piena salute: +5 DNA');
        }
        this.sound.heart();
        this.scene.remove(h.mesh);
        this.hearts.splice(i, 1);
      }
    }

    // Velocizzatori: scatto temporaneo. Anche i predatori li raccolgono!
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      if (!player.dead && player.position.distanceTo(b.mesh.position) < player.radius + 0.8) {
        this.boostUntil = t + 6;
        this.hud.toast('⚡ Scatto primordiale! Velocità aumentata per 6 secondi');
        this.sound.bolt();
        this.scene.remove(b.mesh);
        this.bolts.splice(i, 1);
        continue;
      }
      for (const npc of this.npcs) {
        if (npc.diet !== 'carnivore') continue;
        if (npc.position.distanceTo(b.mesh.position) < npc.radius + 0.8) {
          npc.boostUntil = t + 6;
          if (npc.position.distanceTo(player.position) < 30) {
            this.hud.toast('⚡ Un predatore ha raccolto uno scatto… occhio!');
          }
          this.scene.remove(b.mesh);
          this.bolts.splice(i, 1);
          break;
        }
      }
    }

    // Cellula contro cellula.
    const all = player.dead ? this.npcs : [player, ...this.npcs];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (a.dead || b.dead) continue;
        const dist = a.position.distanceTo(b.position);
        if (dist > (a.radius + b.radius) * 0.85) continue;

        const [big, small] = a.radius >= b.radius ? [a, b] : [b, a];

        if (this.canDevour(big, small)) {
          if (big.diet === 'herbivore' && !big.isPlayer) continue; // gli erbivori non cacciano
          // Il giocatore non viene inghiottito in un colpo: subisce morsi.
          const dmg = small.isPlayer ? 1 : 3;
          if (small.takeDamage(dmg, t)) {
            if (small.isPlayer) {
              small.applyImpulse(small.position.clone().sub(big.position), 10);
              this.hud.setHp(small.hp, small.maxHp);
              if (!small.dead) this.sound.hurt();
            }
            if (small.dead) this.resolveDeath(big, small, t);
          }
        } else if (this.canFight(a, b) || this.canFight(b, a)) {
          const attacker = this.canFight(a, b) && this.canFight(b, a)
            ? (a.stats.attack >= b.stats.attack ? a : b)
            : (this.canFight(a, b) ? a : b);
          const victim = attacker === a ? b : a;
          if (victim.takeDamage(1, t)) {
            const dir = victim.position.clone().sub(attacker.position);
            victim.applyImpulse(dir, 7);
            attacker.applyImpulse(dir.negate(), 3);
            if (victim.isPlayer) {
              this.hud.setHp(victim.hp, victim.maxHp);
              if (!victim.dead) this.sound.hurt();
            }
            if (victim.dead) this.resolveDeath(attacker, victim, t);
          }
        } else {
          // Semplice separazione fisica.
          const dir = b.position.clone().sub(a.position).setY(0);
          if (dir.lengthSq() < 0.0001) dir.set(1, 0, 0);
          const overlap = (a.radius + b.radius) * 0.85 - dist;
          dir.normalize().multiplyScalar(overlap * 0.5);
          b.position.add(dir);
          a.position.sub(dir);
        }
      }
    }
  }

  resolveDeath(killer, victim, t) {
    if (victim.isPlayer) {
      this.onPlayerDeath();
      return;
    }

    // Bottino: carne, DNA per il giocatore, a volte un token.
    const drops = 2 + Math.floor(victim.radius * 2);
    for (let k = 0; k < drops; k++) this.spawnFood(false, 'meat', victim.position.clone());
    if (Math.random() < 0.25) this.spawnToken(victim.position.clone());
    if (Math.random() < 0.12) this.spawnHeart(victim.position.clone());

    if (killer.isPlayer) {
      const gained = Math.round(6 + victim.radius * 6);
      this.gainDna(gained);
      this.player.grow(victim.radius * 0.1);
      this.hud.toast(`Hai divorato una cellula! +${gained} DNA`);
      this.sound.meat();
    }

    this.scene.remove(victim.group);
    victim.dispose();
    const idx = this.npcs.indexOf(victim);
    if (idx >= 0) this.npcs.splice(idx, 1);
  }

  gainDna(amount) {
    this.dna += amount;
    this.hud.setDna(this.dna);
    this.checkMilestones();
  }

  checkMilestones() {
    const steps = [
      [30, 'La tua cellula si sente più forte… continua a mangiare! 🦠'],
      [80, 'I piccoli ora ti temono. Si comincia a fare sul serio.'],
      [180, 'Sei tra i grandi del brodo primordiale! 🌊'],
      [350, 'Poco manca… presto potrai lasciare il brodo. (Prossima fase: in arrivo!)'],
    ];
    for (const [threshold, msg] of steps) {
      if (this.dna >= threshold && !this.milestones.has(threshold)) {
        this.milestones.add(threshold);
        this.hud.toast(msg, 3500);
        this.sound.milestone();
      }
    }
  }

  onPlayerDeath() {
    this.player.dead = true;
    this.player.group.visible = false;
    this.sound.death();
    this.dna = Math.floor(this.dna / 2);
    this.hud.setDna(this.dna);
    this.hud.showDeath(this.dna);
  }

  respawn() {
    const p = this.player;
    p.dead = false;
    p.hp = p.maxHp;
    p.radius = Math.max(0.8, p.radius * 0.7);
    p.group.scale.setScalar(p.radius);
    p.recomputeStats();
    p.position.set(0, 0, 0);
    p.velocity.set(0, 0, 0);
    p.invulnUntil = this.time + 3;
    p.group.visible = true;
    this.hud.setHp(p.hp, p.maxHp);
    this.hud.hideOverlay();
    this.hud.toast('Rinato! Sei di nuovo nel brodo. 🫧');
    this.sound.init(); // il click su "Rinasci" è un gesto valido anche per l'audio
    this.sound.respawn();
  }

  manageSpawns() {
    // Rimuove ciò che è troppo lontano e rimpiazza per mantenere densità costante.
    const center = this.player.position;

    for (let i = this.npcs.length - 1; i >= 0; i--) {
      if (this.npcs[i].position.distanceTo(center) > DESPAWN_RADIUS) {
        this.scene.remove(this.npcs[i].group);
        this.npcs[i].dispose();
        this.npcs.splice(i, 1);
      }
    }
    for (let i = this.foods.length - 1; i >= 0; i--) {
      if (this.foods[i].mesh.position.distanceTo(center) > DESPAWN_RADIUS) {
        this.scene.remove(this.foods[i].mesh);
        this.foods[i].mesh.geometry.dispose();
        this.foods[i].mesh.material.dispose();
        this.foods.splice(i, 1);
      }
    }
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      if (this.tokens[i].mesh.position.distanceTo(center) > DESPAWN_RADIUS * 1.4) {
        this.scene.remove(this.tokens[i].mesh);
        this.tokens.splice(i, 1);
      }
    }
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      if (this.hearts[i].mesh.position.distanceTo(center) > DESPAWN_RADIUS * 1.4) {
        this.scene.remove(this.hearts[i].mesh);
        this.hearts.splice(i, 1);
      }
    }
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      if (this.bolts[i].mesh.position.distanceTo(center) > DESPAWN_RADIUS * 1.4) {
        this.scene.remove(this.bolts[i].mesh);
        this.bolts.splice(i, 1);
      }
    }

    while (this.npcs.length < NPC_TARGET) this.spawnNpc();
    while (this.foods.length < FOOD_TARGET) this.spawnFood();
    if (this.tokens.length < 3 && Math.random() < 0.005) this.spawnToken();
    if (this.hearts.length < 2 && Math.random() < 0.002) this.spawnHeart();
    if (this.bolts.length < 2 && Math.random() < 0.003) this.spawnBolt();
  }

  updateCamera(dt) {
    const p = this.player.position;
    const height = 20 + this.player.radius * 9;
    const target = new THREE.Vector3(p.x, height, p.z + height * 0.28);
    this.camera.position.lerp(target, Math.min(1, 3 * dt));
    this.camera.lookAt(p.x, 0, p.z);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
