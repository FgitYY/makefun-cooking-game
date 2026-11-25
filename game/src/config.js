// Rush Hour Bistro — shared constants: canvas layout, palette, ingredients and recipes.
// Every other module reads its numbers from here so the whole kitchen stays in one place.

export const VIEW = { width: 1280, height: 800 };

export const PALETTE = {
  wall: '#f3e3c3',
  wallTile: '#e8d3ac',
  wood: '#8a5a33',
  woodDark: '#6f4525',
  woodLight: '#a9713f',
  counter: '#5d6b73',
  counterTop: '#7d8b93',
  board: '#b98a52',
  paper: '#fff7e6',
  ink: '#3a2a1a',
  red: '#d64541',
  green: '#3f9e4d',
  gold: '#f2b234',
  steel: '#c7ced4',
};

export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1' },
  { id: 'patty', name: 'Patty', key: '2' },
  { id: 'cheese', name: 'Cheese', key: '3' },
  { id: 'lettuce', name: 'Lettuce', key: '4' },
  { id: 'tomato', name: 'Tomato', key: '5' },
  { id: 'rice', name: 'Rice', key: '6' },
  { id: 'salmon', name: 'Salmon', key: '7' },
  { id: 'noodles', name: 'Noodles', key: '8' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// Recipes unlock as the level rises: minLevel gates the longer, trickier dishes.
export const RECIPES = [
  { id: 'classic-burger', name: 'Classic Burger', items: ['bun', 'patty', 'lettuce'], minLevel: 1 },
  { id: 'sushi-plate', name: 'Sushi Plate', items: ['rice', 'salmon'], minLevel: 1 },
  { id: 'garden-salad', name: 'Garden Salad', items: ['lettuce', 'tomato', 'cheese'], minLevel: 1 },
  { id: 'cheese-burger', name: 'Cheese Burger', items: ['bun', 'patty', 'cheese', 'tomato'], minLevel: 2 },
  { id: 'pasta-special', name: 'Pasta Special', items: ['noodles', 'tomato', 'cheese'], minLevel: 2 },
  { id: 'salmon-bowl', name: 'Salmon Bowl', items: ['rice', 'salmon', 'lettuce'], minLevel: 3 },
  { id: 'double-stack', name: 'Double Stack', items: ['bun', 'patty', 'patty', 'cheese'], minLevel: 3 },
  { id: 'bistro-feast', name: 'Bistro Feast', items: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'], minLevel: 4 },
];

export const RULES = {
  maxOrders: 3,
  maxPlate: 6,
  startLives: 3,
  baseOrderSeconds: 50,
  minOrderSeconds: 26,
  secondsLostPerLevel: 3,
  baseSpawnSeconds: 9,
  minSpawnSeconds: 5,
  servedPerLevel: 5,
  serveBasePoints: 100,
  pointsPerSecondLeft: 2,
};

// Screen rectangles, shared by render.js (draws them) and input.js (hit-tests them).
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 68 },
  orderBoard: { x: 18, y: 80, w: 770, h: 186 },
  ticket: { w: 238, h: 156, gap: 12, top: 104, left: 34 },
  stove: { x: 806, y: 80, w: 456, h: 186 },
  plateBoard: { x: 250, y: 286, w: 520, h: 268 },
  plate: { cx: 510, cy: 470, rx: 190, ry: 52 },
  serveButton: { x: 800, y: 300, w: 210, h: 84 },
  trashButton: { x: 1030, y: 300, w: 210, h: 84 },
  hintPanel: { x: 800, y: 404, w: 440, h: 150 },
  counter: { x: 0, y: 572, w: 1280, h: 228 },
  bin: { w: 148, h: 128, gap: 8, top: 612, left: 16 },
};
