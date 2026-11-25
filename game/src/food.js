// food.js — draws every ingredient and the stacked dish with plain canvas shapes.
// One function per ingredient keeps the counter icons and the plate layers consistent:
// drawIngredient paints an icon centred on (cx, cy) inside a box of `size` pixels.

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBun(ctx, cx, cy, s) {
  ctx.fillStyle = '#e8a94e';
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.08, s * 0.46, s * 0.3, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f4c06a';
  ctx.fillRect(cx - s * 0.46, cy + s * 0.02, s * 0.92, s * 0.1);
  ctx.fillStyle = '#fff3d6';
  for (const [dx, dy] of [[-0.2, -0.12], [0.02, -0.2], [0.22, -0.1], [-0.05, -0.05], [0.14, -0.16]]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx * s, cy + dy * s, s * 0.05, s * 0.028, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPatty(ctx, cx, cy, s) {
  ctx.fillStyle = '#7a4322';
  roundedRect(ctx, cx - s * 0.44, cy - s * 0.13, s * 0.88, s * 0.26, s * 0.12);
  ctx.fill();
  ctx.fillStyle = '#8f5530';
  roundedRect(ctx, cx - s * 0.44, cy - s * 0.13, s * 0.88, s * 0.1, s * 0.05);
  ctx.fill();
  ctx.fillStyle = '#5d3016';
  for (const dx of [-0.28, -0.08, 0.12, 0.3]) ctx.fillRect(cx + dx * s, cy + s * 0.02, s * 0.07, s * 0.04);
}

function drawCheese(ctx, cx, cy, s) {
  ctx.fillStyle = '#f6b73c';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.3);
  ctx.lineTo(cx + s * 0.46, cy + s * 0.06);
  ctx.lineTo(cx + s * 0.3, cy + s * 0.3);
  ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
  ctx.lineTo(cx - s * 0.46, cy + s * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e89b1d';
  for (const [dx, dy, r] of [[-0.12, 0.02, 0.07], [0.16, 0.12, 0.055], [0.02, -0.12, 0.045]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLettuce(ctx, cx, cy, s) {
  ctx.fillStyle = '#57b24a';
  for (const [dx, dy, r] of [[-0.24, 0.05, 0.2], [0, -0.08, 0.24], [0.24, 0.05, 0.2], [-0.1, 0.14, 0.18], [0.12, 0.14, 0.18]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#3f8f36';
  ctx.lineWidth = Math.max(1.5, s * 0.03);
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.28);
  ctx.quadraticCurveTo(cx - s * 0.05, cy, cx + s * 0.02, cy - s * 0.22);
  ctx.stroke();
}

function drawTomato(ctx, cx, cy, s) {
  ctx.fillStyle = '#e14b3c';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef7a68';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd9a8';
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * s * 0.16, cy + Math.sin(a) * s * 0.16, s * 0.035, s * 0.02, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRice(ctx, cx, cy, s) {
  ctx.fillStyle = '#fdfbf4';
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.06, s * 0.42, s * 0.26, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#b9ae94';
  ctx.lineWidth = Math.max(1.2, s * 0.03);
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.06, s * 0.42, s * 0.26, 0, Math.PI, 0);
  ctx.stroke();
  ctx.strokeStyle = '#c9bfa4';
  ctx.lineWidth = Math.max(1, s * 0.02);
  for (const [dx, dy] of [[-0.2, -0.05], [-0.05, -0.13], [0.12, -0.06], [0.02, 0.02], [0.24, 0.02]]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx * s, cy + dy * s, s * 0.07, s * 0.03, 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSalmon(ctx, cx, cy, s) {
  ctx.fillStyle = '#f58a5c';
  roundedRect(ctx, cx - s * 0.44, cy - s * 0.17, s * 0.88, s * 0.34, s * 0.1);
  ctx.fill();
  ctx.strokeStyle = '#ffd9c4';
  ctx.lineWidth = Math.max(1.5, s * 0.035);
  for (const dx of [-0.28, -0.1, 0.08, 0.26]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * s, cy - s * 0.15);
    ctx.lineTo(cx + (dx + 0.08) * s, cy + s * 0.15);
    ctx.stroke();
  }
}

function drawNoodles(ctx, cx, cy, s) {
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.lineCap = 'round';
  for (const [dy, phase] of [[-0.14, 0], [0, 1.6], [0.14, 3.1]]) {
    ctx.beginPath();
    for (let x = -0.4; x <= 0.4; x += 0.08) {
      const y = cy + dy * s + Math.sin(x * 14 + phase) * s * 0.05;
      if (x === -0.4) ctx.moveTo(cx + x * s, y); else ctx.lineTo(cx + x * s, y);
    }
    ctx.stroke();
  }
}

const DRAWERS = {
  bun: drawBun,
  patty: drawPatty,
  cheese: drawCheese,
  lettuce: drawLettuce,
  tomato: drawTomato,
  rice: drawRice,
  salmon: drawSalmon,
  noodles: drawNoodles,
};

export function drawIngredient(ctx, id, cx, cy, size) {
  const draw = DRAWERS[id];
  if (draw) draw(ctx, cx, cy, size);
}

// One flattened layer of a dish on the plate: wide ellipse band in the ingredient's colour.
const LAYER_STYLE = {
  bun: ['#e8a94e', 16],
  patty: ['#7a4322', 14],
  cheese: ['#f6b73c', 8],
  lettuce: ['#57b24a', 10],
  tomato: ['#e14b3c', 10],
  rice: ['#fdfbf4', 16],
  salmon: ['#f58a5c', 12],
  noodles: ['#f2c94c', 14],
};

export function layerHeight(id) {
  return (LAYER_STYLE[id] || ['#cccccc', 12])[1];
}

export function drawPlateLayer(ctx, id, cx, baseY, width) {
  const [colour, h] = LAYER_STYLE[id] || ['#cccccc', 12];
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, width / 2, h * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - width / 2, baseY - h * 0.62, width, h * 0.62);
  ctx.beginPath();
  ctx.ellipse(cx, baseY - h * 0.62, width / 2, h * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  if (id === 'bun') {
    ctx.fillStyle = '#fff3d6';
    for (const dx of [-0.3, -0.12, 0.05, 0.22, 0.36]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * width, baseY - h * 0.62, 5, 2.6, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (id === 'salmon') {
    ctx.strokeStyle = '#ffd9c4';
    ctx.lineWidth = 3;
    for (const dx of [-0.32, -0.14, 0.04, 0.22]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * width, baseY - h * 0.95);
      ctx.lineTo(cx + (dx + 0.05) * width, baseY - h * 0.25);
      ctx.stroke();
    }
  }
}
