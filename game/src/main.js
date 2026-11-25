// main.js — boots Rush Hour Bistro: sizes the canvas to the window (letterboxed to the
// 1280x800 kitchen), wires input, runs the clock, and handles ?shot= screenshot scenes
// (frozen clock, one deterministic frame) versus normal play.

import { VIEW } from './config.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { applyShotScene } from './shots.js';
import { createGame, tick } from './state.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed')) || 1;
const shot = params.get('shot');

const game = createGame(seed);
if (shot) applyShotScene(game, shot);
const input = attachInput(canvas, game, statusEl);

function resize() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = Math.round(VIEW.width * scale);
  canvas.height = Math.round(VIEW.height * scale);
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}
window.addEventListener('resize', resize);
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!shot) tick(game, dt);
  const scaleX = canvas.width / VIEW.width;
  const scaleY = canvas.height / VIEW.height;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  render(ctx, game, input.hoverId);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
