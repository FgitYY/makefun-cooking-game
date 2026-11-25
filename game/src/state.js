// state.js — the whole game state and its rules: orders arriving, the plate being built,
// serving, expiring, scoring, lives and the difficulty ramp. Rendering never mutates this;
// input.js calls the action functions, main.js ticks time forward.

import { RECIPES, RULES } from './config.js';

export const SCREEN = { TITLE: 'title', PLAY: 'play', OVER: 'over' };

// Small deterministic RNG so ?shot= scenes and seeded runs always look the same.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGame(seed) {
  return {
    screen: SCREEN.TITLE,
    rng: makeRng(seed),
    time: 0,
    score: 0,
    lives: RULES.startLives,
    level: 1,
    combo: 0,
    served: 0,
    expired: 0,
    orders: [],
    plate: [],
    spawnTimer: 0,
    nextOrderId: 1,
    message: '',
    messageUntil: 0,
    plateBounce: 0,
    serveFlash: 0,
    shake: 0,
    lastServedName: '',
  };
}

export function startGame(game) {
  const rng = game.rng;
  Object.assign(game, createGame(0), { rng, screen: SCREEN.PLAY });
  spawnOrder(game);
  spawnOrder(game);
  game.spawnTimer = spawnInterval(game);
}

function orderSeconds(game) {
  return Math.max(RULES.minOrderSeconds, RULES.baseOrderSeconds - (game.level - 1) * RULES.secondsLostPerLevel);
}

function spawnInterval(game) {
  return Math.max(RULES.minSpawnSeconds, RULES.baseSpawnSeconds - (game.level - 1));
}

export function spawnOrder(game) {
  if (game.orders.length >= RULES.maxOrders) return null;
  const pool = RECIPES.filter((r) => r.minLevel <= game.level);
  const recipe = pool[Math.floor(game.rng() * pool.length)];
  const total = orderSeconds(game);
  const order = {
    id: game.nextOrderId,
    recipe,
    totalSeconds: total,
    secondsLeft: total,
    bornAt: game.time,
  };
  game.nextOrderId += 1;
  game.orders.push(order);
  return order;
}

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const x of a) counts.set(x, (counts.get(x) || 0) + 1);
  for (const x of b) {
    const n = counts.get(x) || 0;
    if (n === 0) return false;
    counts.set(x, n - 1);
  }
  return true;
}

// The order the current plate exactly matches, oldest first; null when none matches.
export function matchingOrder(game) {
  return game.orders.find((o) => sameMultiset(game.plate, o.recipe.items)) || null;
}

// The order the plate is closest to (most ingredients already on it), for the hint panel.
export function closestOrder(game) {
  let best = null;
  let bestHave = -1;
  for (const order of game.orders) {
    const need = [...order.recipe.items];
    let have = 0;
    for (const item of game.plate) {
      const at = need.indexOf(item);
      if (at >= 0) { need.splice(at, 1); have += 1; }
    }
    if (have > bestHave) { bestHave = have; best = order; }
  }
  return best;
}

export function addIngredient(game, id) {
  if (game.screen !== SCREEN.PLAY) return false;
  if (game.plate.length >= RULES.maxPlate) {
    setMessage(game, 'Plate is full — serve it or trash it!');
    return false;
  }
  game.plate.push(id);
  game.plateBounce = 1;
  return true;
}

export function trashPlate(game) {
  if (game.screen !== SCREEN.PLAY || game.plate.length === 0) return false;
  game.plate = [];
  setMessage(game, 'Plate cleared.');
  return true;
}

export function servePlate(game) {
  if (game.screen !== SCREEN.PLAY) return null;
  const order = matchingOrder(game);
  if (!order) {
    game.shake = 1;
    setMessage(game, game.plate.length ? 'No order matches that plate yet.' : 'Build a dish on the plate first!');
    return null;
  }
  game.orders = game.orders.filter((o) => o !== order);
  game.plate = [];
  game.combo += 1;
  const timeBonus = Math.round(order.secondsLeft) * RULES.pointsPerSecondLeft;
  const points = (RULES.serveBasePoints + timeBonus) * game.combo;
  game.score += points;
  game.served += 1;
  game.serveFlash = 1;
  game.lastServedName = order.recipe.name;
  setMessage(game, `${order.recipe.name} served! +${points}${game.combo > 1 ? ` (combo x${game.combo})` : ''}`);
  const newLevel = 1 + Math.floor(game.served / RULES.servedPerLevel);
  if (newLevel > game.level) {
    game.level = newLevel;
    setMessage(game, `Level ${game.level}! Orders come faster now.`);
  }
  if (game.orders.length === 0) spawnOrder(game);
  return order;
}

function setMessage(game, text) {
  game.message = text;
  game.messageUntil = game.time + 2.6;
}

// Advance the clock: order timers, spawns, expiries, animation decays.
export function tick(game, dt) {
  game.time += dt;
  game.plateBounce = Math.max(0, game.plateBounce - dt * 3.2);
  game.serveFlash = Math.max(0, game.serveFlash - dt * 1.6);
  game.shake = Math.max(0, game.shake - dt * 3);
  if (game.screen !== SCREEN.PLAY) return;

  for (const order of game.orders) order.secondsLeft -= dt;
  const expired = game.orders.filter((o) => o.secondsLeft <= 0);
  if (expired.length) {
    game.orders = game.orders.filter((o) => o.secondsLeft > 0);
    game.expired += expired.length;
    game.lives -= expired.length;
    game.combo = 0;
    setMessage(game, `${expired[0].recipe.name} walked out! -1 life`);
    if (game.lives <= 0) {
      game.lives = 0;
      game.screen = SCREEN.OVER;
      return;
    }
  }

  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnOrder(game);
    game.spawnTimer = spawnInterval(game);
  }
}
