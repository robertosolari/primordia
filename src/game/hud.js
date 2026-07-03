import { PART_DEFS } from './parts.js';

// HUD in HTML sovrapposto al canvas: DNA, vita, parti, toast e overlay.
export class Hud {
  constructor() {
    this.dnaEl = document.getElementById('dna-count');
    this.partsEl = document.getElementById('parts-panel');
    this.toastEl = document.getElementById('toast');
    this.overlayEl = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayText = document.getElementById('overlay-text');
    this.toastTimer = null;
  }

  setDna(value) {
    this.dnaEl.textContent = String(value);
  }

  setHp(hp, maxHp) {
    let el = document.getElementById('hp-panel');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hp-panel';
      el.className = 'part-chip';
      this.partsEl.parentElement.insertBefore(el, this.partsEl);
    }
    el.textContent = '❤️'.repeat(Math.max(0, hp)) + '🖤'.repeat(Math.max(0, maxHp - hp));
  }

  setParts(parts) {
    this.partsEl.innerHTML = '';
    for (const [type, level] of Object.entries(parts)) {
      if (level <= 0) continue;
      const def = PART_DEFS[type];
      const chip = document.createElement('div');
      chip.className = 'part-chip';
      chip.innerHTML = `<span>${def.icon}</span><span>${def.name}</span><span class="lvl">×${level}</span>`;
      this.partsEl.appendChild(chip);
    }
  }

  toast(message, duration = 2800) {
    this.toastEl.innerHTML = message;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastEl.classList.remove('show'), duration);
  }

  showDeath(dna) {
    this.overlayTitle.textContent = 'Sei stato divorato!';
    this.overlayText.innerHTML = `Il brodo primordiale non perdona.<br/>Rinascerai più piccolo, ma con le tue parti. DNA rimasto: <b>${dna}</b>`;
    this.overlayEl.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlayEl.classList.add('hidden');
  }
}
