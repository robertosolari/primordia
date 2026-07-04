// Audio interamente procedurale via Web Audio API: nessun file, ogni suono
// è sintetizzato al volo. L'AudioContext parte solo dopo un gesto utente
// (obbligatorio su mobile), quindi init() va chiamato da un click/tap.
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = localStorage.getItem('primordia-muted') === '1';
    this.noiseBuffer = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    // Buffer di rumore bianco riusato da tutti i suoni.
    const len = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.startAmbience();
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('primordia-muted', this.muted ? '1' : '0');
    if (this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  // --- mattoncini ---------------------------------------------------------

  env(gainValue, attack, decay, when = 0) {
    const t = this.ctx.currentTime + when;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gainValue, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(this.master);
    return { node: g, t };
  }

  tone(type, from, to, gainValue, attack, decay, when = 0) {
    if (!this.ctx) return;
    const { node, t } = this.env(gainValue, attack, decay, when);
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + attack + decay);
    osc.connect(node);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
  }

  noise(filterType, freq, q, gainValue, attack, decay, when = 0) {
    if (!this.ctx) return;
    const { node, t } = this.env(gainValue, attack, decay, when);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = q;
    src.connect(filter).connect(node);
    src.start(t);
    src.stop(t + attack + decay + 0.05);
  }

  // --- ambience -----------------------------------------------------------

  startAmbience() {
    const t = this.ctx.currentTime;

    // Corrente: rumore passa-basso con lento respiro del filtro.
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer;
    noiseSrc.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(lp.frequency);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.05;
    noiseSrc.connect(lp).connect(noiseGain).connect(this.master);
    noiseSrc.start(t);
    lfo.start(t);

    // Drone abissale: sinusoide bassa con tremolo lentissimo.
    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 52;
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.035;
    const trem = this.ctx.createOscillator();
    trem.frequency.value = 0.11;
    const tremGain = this.ctx.createGain();
    tremGain.gain.value = 0.02;
    trem.connect(tremGain).connect(droneGain.gain);
    drone.connect(droneGain).connect(this.master);
    drone.start(t);
    trem.start(t);
  }

  // --- eventi di gioco ------------------------------------------------------

  eat() {
    const p = 1 + (Math.random() - 0.5) * 0.3; // varietà tra un boccone e l'altro
    this.tone('sine', 500 * p, 900 * p, 0.12, 0.01, 0.09);
    this.noise('lowpass', 800, 1, 0.06, 0.005, 0.06);
  }

  meat() {
    const p = 1 + (Math.random() - 0.5) * 0.2;
    this.tone('sine', 220 * p, 110 * p, 0.16, 0.01, 0.16);
    this.noise('bandpass', 400, 2, 0.1, 0.01, 0.12);
  }

  hurt() {
    this.tone('sine', 130, 55, 0.3, 0.005, 0.25);
    this.noise('lowpass', 250, 1, 0.2, 0.005, 0.15);
  }

  death() {
    this.tone('sine', 320, 50, 0.25, 0.02, 0.9);
    // Bolle che si disperdono.
    for (let i = 0; i < 6; i++) {
      const p = 1 + Math.random() * 0.8;
      this.tone('sine', 600 * p, 900 * p, 0.05, 0.01, 0.08, 0.1 + i * 0.09);
    }
  }

  respawn() {
    this.tone('sine', 200, 620, 0.14, 0.05, 0.4);
    this.noise('bandpass', 900, 3, 0.05, 0.05, 0.3);
  }

  pickupPart() {
    // Arpeggio bioluminescente.
    const notes = [523, 659, 784];
    notes.forEach((f, i) => this.tone('sine', f, f * 1.01, 0.1, 0.01, 0.35, i * 0.07));
    this.noise('highpass', 3000, 1, 0.03, 0.02, 0.25);
  }

  heart() {
    // Doppio battito.
    this.tone('sine', 95, 70, 0.22, 0.01, 0.12);
    this.tone('sine', 95, 70, 0.22, 0.01, 0.12, 0.22);
  }

  bolt() {
    this.tone('sawtooth', 1400, 180, 0.09, 0.005, 0.13);
    this.noise('bandpass', 2400, 4, 0.07, 0.005, 0.1);
  }

  milestone() {
    const notes = [392, 494, 587, 784];
    notes.forEach((f, i) => this.tone('triangle', f, f, 0.09, 0.02, 0.5, i * 0.12));
  }
}
