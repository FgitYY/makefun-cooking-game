// input.js — mouse and keyboard controls. Translates canvas clicks and key presses into
// state actions (add ingredient, serve, trash, start/restart) and tracks the hovered bin
// so render.js can highlight it. Sound effects are tiny WebAudio blips, made on the fly.

import { INGREDIENTS, LAYOUT, VIEW } from './config.js';
import { SCREEN, addIngredient, servePlate, startGame, trashPlate } from './state.js';

let audioCtx = null;
function blip(freq, dur = 0.07, type = 'sine') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // No audio available (headless, blocked): the game plays silently.
  }
}

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function ingredientAt(x, y) {
  const { bin } = LAYOUT;
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    const bx = bin.left + i * (bin.w + bin.gap);
    if (inside(x, y, { x: bx, y: bin.top, w: bin.w, h: bin.h })) return INGREDIENTS[i].id;
  }
  return null;
}

export function attachInput(canvas, game, statusEl) {
  const input = { hoverId: null };

  function toGameCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  function announce() {
    if (!statusEl) return;
    const first = game.orders[0];
    statusEl.textContent = game.screen === SCREEN.PLAY && first
      ? `Score ${game.score}. Next ticket: ${first.recipe.name}, ${Math.ceil(first.secondsLeft)} seconds left.`
      : `Score ${game.score}.`;
  }

  canvas.addEventListener('pointermove', (event) => {
    const { x, y } = toGameCoords(event);
    input.hoverId = ingredientAt(x, y);
  });

  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toGameCoords(event);
    if (game.screen !== SCREEN.PLAY) {
      startGame(game);
      blip(660, 0.1, 'triangle');
      announce();
      return;
    }
    const id = ingredientAt(x, y);
    if (id) {
      if (addIngredient(game, id)) blip(520 + game.plate.length * 40);
    } else if (inside(x, y, LAYOUT.serveButton)) {
      if (servePlate(game)) { blip(880, 0.12, 'triangle'); setTimeout(() => blip(1174, 0.14, 'triangle'), 70); }
      else blip(180, 0.12, 'square');
    } else if (inside(x, y, LAYOUT.trashButton)) {
      if (trashPlate(game)) blip(240, 0.09, 'square');
    }
    announce();
  });

  window.addEventListener('keydown', (event) => {
    if (game.screen !== SCREEN.PLAY) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startGame(game);
        blip(660, 0.1, 'triangle');
        announce();
      }
      return;
    }
    const byKey = INGREDIENTS.find((i) => i.key === event.key);
    if (byKey) {
      if (addIngredient(game, byKey.id)) blip(520 + game.plate.length * 40);
    } else if (event.key === ' ') {
      event.preventDefault();
      if (servePlate(game)) { blip(880, 0.12, 'triangle'); setTimeout(() => blip(1174, 0.14, 'triangle'), 70); }
      else blip(180, 0.12, 'square');
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      if (trashPlate(game)) blip(240, 0.09, 'square');
    }
    announce();
  });

  return input;
}
