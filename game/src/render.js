// render.js — draws the whole bistro every frame: tiled wall and lamps, the order board
// with its tickets and countdown bars, the stove, the plate mid-assembly, the ingredient
// counter, buttons, HUD, and the title / game-over overlays. Reads state, never changes it.

import { INGREDIENTS, INGREDIENT_BY_ID, LAYOUT, PALETTE, VIEW } from './config.js';
import { drawIngredient, drawPlateLayer, layerHeight } from './food.js';
import { SCREEN, closestOrder, matchingOrder } from './state.js';

function rect(ctx, r, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, { size = 16, colour = PALETTE.ink, weight = 'bold', align = 'left', font = 'Verdana' } = {}) {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px ${font}, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function drawKitchenBackdrop(ctx, time) {
  rect(ctx, { x: 0, y: 0, w: VIEW.width, h: VIEW.height }, PALETTE.wall);
  // Wall tiles behind the pass.
  ctx.strokeStyle = PALETTE.wallTile;
  ctx.lineWidth = 2;
  for (let x = 0; x <= VIEW.width; x += 64) { ctx.beginPath(); ctx.moveTo(x, 68); ctx.lineTo(x, 572); ctx.stroke(); }
  for (let y = 68; y <= 572; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW.width, y); ctx.stroke(); }
  // Hanging lamps with a gentle sway.
  for (const lx of [180, 500, 820, 1140]) {
    const sway = Math.sin(time * 0.7 + lx) * 3;
    ctx.strokeStyle = '#4a3a28';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 68); ctx.lineTo(lx + sway, 96); ctx.stroke();
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.moveTo(lx + sway - 26, 118); ctx.lineTo(lx + sway + 26, 118); ctx.lineTo(lx + sway + 10, 96); ctx.lineTo(lx + sway - 10, 96);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 120, 0.5)';
    ctx.beginPath(); ctx.arc(lx + sway, 122, 9, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHud(ctx, game) {
  rect(ctx, LAYOUT.hud, PALETTE.woodDark);
  text(ctx, 'RUSH HOUR BISTRO', 20, 44, { size: 30, colour: '#ffe9b8' });
  text(ctx, `Score ${game.score}`, 700, 44, { size: 24, colour: '#ffffff' });
  text(ctx, `Level ${game.level}`, 900, 44, { size: 24, colour: '#ffffff' });
  if (game.combo > 1) text(ctx, `Combo x${game.combo}`, 1010, 44, { size: 24, colour: PALETTE.gold });
  // Lives as little hearts.
  for (let i = 0; i < 3; i += 1) {
    const cx = 1186 + i * 32;
    const cy = 34;
    ctx.fillStyle = i < game.lives ? '#ff5b6a' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10);
    ctx.bezierCurveTo(cx - 14, cy - 2, cx - 7, cy - 13, cx, cy - 5);
    ctx.bezierCurveTo(cx + 7, cy - 13, cx + 14, cy - 2, cx, cy + 10);
    ctx.fill();
  }
}

function drawTicket(ctx, game, order, x, y) {
  const { ticket } = LAYOUT;
  const frac = Math.max(0, order.secondsLeft / order.totalSeconds);
  const urgent = order.secondsLeft <= 10;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  roundRectPath(ctx, x, y, ticket.w, ticket.h, 8);
  ctx.fillStyle = PALETTE.paper;
  ctx.fill();
  ctx.restore();
  // Pin and header strip.
  ctx.fillStyle = urgent ? PALETTE.red : PALETTE.green;
  roundRectPath(ctx, x, y, ticket.w, 30, 8);
  ctx.fill();
  ctx.fillRect(x, y + 22, ticket.w, 8);
  ctx.fillStyle = '#c33';
  ctx.beginPath(); ctx.arc(x + ticket.w / 2, y + 6, 5, 0, Math.PI * 2); ctx.fill();
  text(ctx, order.recipe.name.toUpperCase(), x + ticket.w / 2, y + 21, { size: 15, colour: '#ffffff', align: 'center' });
  // Ingredient icons; a green tick marks each one already on the plate.
  const need = [...order.recipe.items];
  const plateCopy = [...game.plate];
  order.recipe.items.forEach((id, i) => {
    const ix = x + 32 + i * 40;
    const iy = y + 66;
    drawIngredient(ctx, id, ix, iy, 34);
    const at = plateCopy.indexOf(id);
    if (at >= 0) {
      plateCopy.splice(at, 1);
      need.splice(need.indexOf(id), 1);
      ctx.strokeStyle = PALETTE.green;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ix + 8, iy + 12); ctx.lineTo(ix + 14, iy + 19); ctx.lineTo(ix + 24, iy + 4);
      ctx.stroke();
    }
  });
  // Countdown bar + seconds.
  const barY = y + ticket.h - 34;
  roundRectPath(ctx, x + 12, barY, ticket.w - 24, 14, 7);
  ctx.fillStyle = '#e3d9c8';
  ctx.fill();
  roundRectPath(ctx, x + 12, barY, Math.max(14, (ticket.w - 24) * frac), 14, 7);
  ctx.fillStyle = urgent ? PALETTE.red : frac < 0.4 ? PALETTE.gold : PALETTE.green;
  ctx.fill();
  text(ctx, `${Math.ceil(Math.max(0, order.secondsLeft))}s`, x + ticket.w / 2, y + ticket.h - 6, {
    size: 14, colour: urgent ? PALETTE.red : PALETTE.ink, align: 'center',
  });
}

function drawOrderBoard(ctx, game) {
  const b = LAYOUT.orderBoard;
  roundRectPath(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'ORDER BOARD', b.x + 16, b.y + 24, { size: 17, colour: '#ffe9b8' });
  text(ctx, `${game.orders.length} ticket${game.orders.length === 1 ? '' : 's'}`, b.x + b.w - 16, b.y + 24, {
    size: 15, colour: '#ffe9b8', align: 'right',
  });
  const { ticket } = LAYOUT;
  game.orders.forEach((order, i) => {
    drawTicket(ctx, game, order, ticket.left + i * (ticket.w + ticket.gap), ticket.top);
  });
  for (let i = game.orders.length; i < 3; i += 1) {
    const x = ticket.left + i * (ticket.w + ticket.gap);
    ctx.strokeStyle = 'rgba(255,233,184,0.4)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, ticket.top, ticket.w, ticket.h, 8);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'waiting…', x + ticket.w / 2, ticket.top + ticket.h / 2, { size: 15, colour: 'rgba(255,233,184,0.55)', align: 'center' });
  }
}

function drawStove(ctx, game, time) {
  const s = LAYOUT.stove;
  roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = '#4c565e';
  ctx.fill();
  ctx.strokeStyle = '#333c42';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'STOVE', s.x + 16, s.y + 24, { size: 17, colour: '#dfe7ec' });
  // Two burners with pots; steam curls rise while the kitchen is open.
  for (const [i, px] of [s.x + 110, s.x + 300].entries()) {
    const py = s.y + 120;
    ctx.fillStyle = '#2c3339';
    ctx.beginPath(); ctx.ellipse(px, py + 34, 74, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = i === 0 ? '#8b98a3' : '#a33f35';
    roundRectPath(ctx, px - 62, py - 26, 124, 58, 10);
    ctx.fill();
    ctx.fillStyle = '#6d7a85';
    ctx.fillRect(px - 66, py - 34, 132, 12);
    if (game.screen === SCREEN.PLAY) {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 3;
      for (const dx of [-24, 0, 24]) {
        const lift = ((time * 22 + dx * 3) % 34);
        ctx.beginPath();
        ctx.moveTo(px + dx, py - 40 - lift * 0.4);
        ctx.quadraticCurveTo(px + dx + 6, py - 52 - lift * 0.4, px + dx, py - 62 - lift * 0.4);
        ctx.stroke();
      }
    }
  }
  // Shelf of jars above the burners.
  for (const [i, colour] of ['#d64541', '#f2b234', '#57b24a', '#7ab5d6'].entries()) {
    const jx = s.x + 330 + i * 30;
    ctx.fillStyle = colour;
    roundRectPath(ctx, jx, s.y + 12, 22, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(jx + 3, s.y + 8, 16, 6);
  }
}

function drawPlateStation(ctx, game) {
  const b = LAYOUT.plateBoard;
  roundRectPath(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = PALETTE.board;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'PLATING', b.x + 18, b.y + 28, { size: 17, colour: '#fff3d6' });

  const { plate } = LAYOUT;
  const shakeX = game.shake > 0 ? Math.sin(game.time * 60) * 6 * game.shake : 0;
  const bounce = game.plateBounce > 0 ? Math.sin(game.plateBounce * Math.PI) * 8 : 0;
  const cx = plate.cx + shakeX;

  // The plate itself: rim, well, shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(cx, plate.cy + 10, plate.rx + 8, plate.ry + 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbfaf6';
  ctx.beginPath(); ctx.ellipse(cx, plate.cy, plate.rx, plate.ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8d2c2';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(cx, plate.cy, plate.rx * 0.72, plate.ry * 0.66, 0, 0, Math.PI * 2); ctx.stroke();

  // Stack the dish layer by layer, bottom ingredient first.
  let layerY = plate.cy - 6 - bounce;
  game.plate.forEach((id, i) => {
    const w = plate.rx * 1.5 - i * 8;
    drawPlateLayer(ctx, id, cx, layerY, w);
    layerY -= layerHeight(id) * 0.95;
  });

  if (game.plate.length === 0) {
    text(ctx, 'Empty plate — add ingredients below', cx, plate.cy - 66, { size: 16, colour: '#7a5c33', align: 'center' });
  } else {
    const names = game.plate.map((id) => INGREDIENT_BY_ID[id].name).join(' + ');
    text(ctx, names, cx, b.y + b.h - 14, { size: 14, colour: '#5d4322', align: 'center' });
  }

  const ready = matchingOrder(game);
  if (ready) {
    const pulse = 1 + Math.sin(game.time * 6) * 0.04;
    ctx.save();
    ctx.translate(b.x + b.w - 86, b.y + 30);
    ctx.scale(pulse, pulse);
    roundRectPath(ctx, -74, -17, 148, 34, 17);
    ctx.fillStyle = PALETTE.green;
    ctx.fill();
    text(ctx, 'READY TO SERVE', 0, 6, { size: 14, colour: '#ffffff', align: 'center' });
    ctx.restore();
  }
  if (game.serveFlash > 0) {
    ctx.fillStyle = `rgba(255, 240, 170, ${game.serveFlash * 0.35})`;
    ctx.beginPath(); ctx.ellipse(cx, plate.cy - 30, plate.rx + 30, plate.ry + 60, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawButtons(ctx, game) {
  const ready = matchingOrder(game);
  const s = LAYOUT.serveButton;
  roundRectPath(ctx, s.x, s.y, s.w, s.h, 14);
  ctx.fillStyle = ready ? PALETTE.green : '#8fae94';
  ctx.fill();
  ctx.strokeStyle = '#2c6e38';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'SERVE', s.x + s.w / 2, s.y + 40, { size: 26, colour: '#ffffff', align: 'center' });
  text(ctx, 'Space', s.x + s.w / 2, s.y + 66, { size: 14, colour: 'rgba(255,255,255,0.85)', align: 'center' });

  const t = LAYOUT.trashButton;
  roundRectPath(ctx, t.x, t.y, t.w, t.h, 14);
  ctx.fillStyle = game.plate.length ? PALETTE.red : '#b08a87';
  ctx.fill();
  ctx.strokeStyle = '#93312d';
  ctx.stroke();
  text(ctx, 'TRASH', t.x + t.w / 2, t.y + 40, { size: 26, colour: '#ffffff', align: 'center' });
  text(ctx, 'Backspace', t.x + t.w / 2, t.y + 66, { size: 14, colour: 'rgba(255,255,255,0.85)', align: 'center' });

  // Hint panel: what the closest ticket still needs.
  const h = LAYOUT.hintPanel;
  roundRectPath(ctx, h.x, h.y, h.w, h.h, 10);
  ctx.fillStyle = 'rgba(255,247,230,0.92)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.wood;
  ctx.lineWidth = 3;
  ctx.stroke();
  const target = closestOrder(game);
  if (target) {
    const need = [...target.recipe.items];
    for (const id of game.plate) {
      const at = need.indexOf(id);
      if (at >= 0) need.splice(at, 1);
    }
    text(ctx, `Building: ${target.recipe.name}`, h.x + 16, h.y + 32, { size: 18 });
    if (need.length === 0) {
      text(ctx, 'Plate complete — hit SERVE!', h.x + 16, h.y + 66, { size: 16, colour: PALETTE.green });
    } else {
      text(ctx, 'Still needs:', h.x + 16, h.y + 64, { size: 15, colour: '#7a5c33' });
      need.forEach((id, i) => {
        const ix = h.x + 40 + i * 52;
        drawIngredient(ctx, id, ix, h.y + 104, 38);
        text(ctx, INGREDIENT_BY_ID[id].key, ix, h.y + 136, { size: 13, colour: '#7a5c33', align: 'center' });
      });
    }
  } else {
    text(ctx, 'Waiting for the next ticket…', h.x + 16, h.y + 40, { size: 16, colour: '#7a5c33' });
  }
  if (game.message && game.time < game.messageUntil) {
    text(ctx, game.message, h.x + 16, h.y + h.h - 12, { size: 15, colour: PALETTE.red });
  }
}

function drawCounter(ctx, game, hoverId) {
  const c = LAYOUT.counter;
  rect(ctx, c, PALETTE.counter);
  rect(ctx, { x: 0, y: c.y, w: VIEW.width, h: 16 }, PALETTE.counterTop);
  text(ctx, 'INGREDIENT COUNTER — click a bin or press its number key', 16, c.y + 38, { size: 16, colour: '#dfe7ec' });
  const { bin } = LAYOUT;
  INGREDIENTS.forEach((ing, i) => {
    const x = bin.left + i * (bin.w + bin.gap);
    const y = bin.top;
    const hovered = hoverId === ing.id;
    roundRectPath(ctx, x, y, bin.w, bin.h, 10);
    ctx.fillStyle = hovered ? '#eef3f6' : '#dde5ea';
    ctx.fill();
    ctx.strokeStyle = hovered ? PALETTE.gold : '#93a3ad';
    ctx.lineWidth = hovered ? 4 : 2;
    ctx.stroke();
    drawIngredient(ctx, ing.id, x + bin.w / 2, y + 52, 64);
    text(ctx, ing.name, x + bin.w / 2, y + 102, { size: 16, align: 'center' });
    ctx.fillStyle = PALETTE.woodDark;
    roundRectPath(ctx, x + 8, y + 8, 24, 24, 6);
    ctx.fill();
    text(ctx, ing.key, x + 20, y + 25, { size: 14, colour: '#ffffff', align: 'center' });
  });
}

function drawOverlay(ctx, game) {
  ctx.fillStyle = 'rgba(30, 20, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const w = 640;
  const h = game.screen === SCREEN.TITLE ? 380 : 320;
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  roundRectPath(ctx, x, y, w, h, 18);
  ctx.fillStyle = PALETTE.paper;
  ctx.fill();
  ctx.strokeStyle = PALETTE.wood;
  ctx.lineWidth = 5;
  ctx.stroke();
  if (game.screen === SCREEN.TITLE) {
    text(ctx, 'RUSH HOUR BISTRO', VIEW.width / 2, y + 70, { size: 42, colour: PALETTE.red, align: 'center' });
    const lines = [
      'Orders land on the board with a countdown.',
      'Click ingredients (or press 1–8) to build the dish on the plate.',
      'When the plate matches a ticket, hit SERVE (Space) before time runs out.',
      'Wrong build? TRASH (Backspace) clears the plate.',
      'Serve fast for time bonuses and combos. Three walk-outs and you close!',
    ];
    lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, y + 122 + i * 30, { size: 17, align: 'center' }));
    text(ctx, 'Click or press Enter to open the kitchen', VIEW.width / 2, y + h - 36, { size: 19, colour: PALETTE.green, align: 'center' });
  } else {
    text(ctx, 'KITCHEN CLOSED!', VIEW.width / 2, y + 66, { size: 40, colour: PALETTE.red, align: 'center' });
    text(ctx, `Final score: ${game.score}`, VIEW.width / 2, y + 124, { size: 26, align: 'center' });
    text(ctx, `Dishes served: ${game.served}   Walk-outs: ${game.expired}   Level reached: ${game.level}`, VIEW.width / 2, y + 164, { size: 18, align: 'center' });
    if (game.lastServedName) text(ctx, `Last dish out: ${game.lastServedName}`, VIEW.width / 2, y + 198, { size: 16, colour: '#7a5c33', align: 'center' });
    text(ctx, 'Click or press Enter to play again', VIEW.width / 2, y + h - 36, { size: 19, colour: PALETTE.green, align: 'center' });
  }
}

export function render(ctx, game, hoverId) {
  drawKitchenBackdrop(ctx, game.time);
  drawOrderBoard(ctx, game);
  drawStove(ctx, game, game.time);
  drawPlateStation(ctx, game);
  drawButtons(ctx, game);
  drawCounter(ctx, game, hoverId);
  drawHud(ctx, game);
  if (game.screen !== SCREEN.PLAY) drawOverlay(ctx, game);
}
