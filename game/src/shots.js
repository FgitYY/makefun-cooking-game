// shots.js — deterministic screenshot scenes behind ?shot=start|play|end&seed=1.
// Each scene puts the real game state into a rich, representative moment (same seed,
// same frame): the title over a live kitchen, a mid-service rush with a plate ready
// to serve, and the game-over summary. main.js freezes the clock in shot mode.

import { RECIPES } from './config.js';
import { SCREEN, createGame, spawnOrder } from './state.js';

function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

function fixedOrder(game, recipeId, secondsLeft) {
  const order = spawnOrder(game);
  order.recipe = recipeById(recipeId);
  order.totalSeconds = 50;
  order.secondsLeft = secondsLeft;
  return order;
}

export function applyShotScene(game, shot) {
  if (shot === 'start') {
    // Title screen, but the kitchen behind it already shows tickets and a half-built dish.
    game.screen = SCREEN.TITLE;
    game.score = 0;
    fixedOrder(game, 'classic-burger', 38);
    fixedOrder(game, 'sushi-plate', 44);
    game.plate = ['bun', 'patty'];
    return;
  }
  if (shot === 'play') {
    // The cover scene: three tickets on the board, one nearly out of time, and the plate
    // holding a finished Cheese Burger that is ready to serve.
    game.screen = SCREEN.PLAY;
    game.score = 1450;
    game.level = 3;
    game.combo = 3;
    game.served = 11;
    game.lives = 2;
    fixedOrder(game, 'cheese-burger', 23);
    fixedOrder(game, 'salmon-bowl', 41);
    fixedOrder(game, 'pasta-special', 8);
    game.plate = ['bun', 'patty', 'cheese', 'tomato'];
    game.message = 'Cheese Burger ready — hit SERVE!';
    game.messageUntil = game.time + 999;
    return;
  }
  if (shot === 'end') {
    game.screen = SCREEN.OVER;
    game.score = 2680;
    game.level = 4;
    game.served = 19;
    game.expired = 3;
    game.lives = 0;
    game.lastServedName = 'Double Stack';
    fixedOrder(game, 'bistro-feast', 12);
    game.plate = ['bun', 'patty'];
    return;
  }
  // Unknown scene: fall back to a fresh title screen.
  Object.assign(game, createGame(1));
}
