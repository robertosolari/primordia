import { Game } from './game/Game.js';

const canvas = document.getElementById('scene');
const game = new Game(canvas);
window.game = game; // comodo per il debug dalla console

document.getElementById('intro-btn').addEventListener('click', () => {
  document.getElementById('intro').classList.add('hidden');
  game.start();
});

document.getElementById('overlay-btn').addEventListener('click', () => {
  game.respawn();
});

const muteBtn = document.getElementById('mute-btn');
muteBtn.textContent = game.sound.muted ? '🔇' : '🔊';
muteBtn.addEventListener('click', () => {
  game.sound.init(); // anche questo click vale come gesto di sblocco audio
  muteBtn.textContent = game.sound.toggleMute() ? '🔇' : '🔊';
});
