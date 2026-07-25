const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const gamePath = path.join(__dirname, '..', 'game.js');
let source = fs.readFileSync(gamePath, 'utf8');
source = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__foodTest = {
    VERSION, INGREDIENTS, RECIPES, DAILY_SKILLS, GHOSTS, state,
    emptyRunRewards, cookSelectedRecipe, buyDailySkill, startRun,
    rewardIngredientDrop, safeReturnHome, gameOver, recipeCount
  };
})();`);

const noop = () => {};
const gradient = () => ({ addColorStop: noop });
const context2d = new Proxy({
  measureText: text => ({ width: String(text || '').length * 8 }),
  createLinearGradient: gradient,
  createRadialGradient: gradient,
  createPattern: () => null
}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return noop;
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
});

const canvas = {
  clientWidth: 390,
  clientHeight: 844,
  style: {},
  width: 390,
  height: 844,
  getContext: () => context2d,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }),
  addEventListener: noop
};

const storage = new Map();
const sandbox = {
  console,
  Math,
  Date,
  JSON,
  String,
  Number,
  Object,
  Array,
  Set,
  Map,
  Promise,
  encodeURI,
  performance: { now: () => 0 },
  requestAnimationFrame: noop,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  document: {
    documentElement: { clientWidth: 390, clientHeight: 844 },
    getElementById: id => id === 'gameCanvas' ? canvas : { remove: noop }
  },
  window: {
    innerWidth: 390,
    innerHeight: 844,
    devicePixelRatio: 1,
    addEventListener: noop
  },
  navigator: {},
  Image: class {
    constructor() {
      this.complete = true;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      this.decoding = 'async';
    }
    set src(value) {
      this._src = value;
      if (this.onload) this.onload();
    }
    get src() { return this._src; }
  },
  Audio: class {
    constructor() { this.volume = 1; this.paused = true; }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    addEventListener() {}
  }
};
sandbox.globalThis = sandbox;

vm.runInNewContext(source, sandbox, { filename: gamePath });
const api = sandbox.__foodTest;
assert.ok(api, 'food loop test API should be exposed in the instrumented VM');
assert.equal(api.VERSION, 'v0.17.0_food_loop_greybox');
assert.equal(api.INGREDIENTS.length, 4);
assert.equal(api.RECIPES.length, 4);

api.state.save.pantry.tomato = 1;
api.state.save.pantry.egg = 1;
api.state.kitchenMethod = 'stir';
api.state.kitchenSelected = ['tomato', 'egg'];
api.cookSelectedRecipe();
assert.equal(api.state.save.recipes.tomato_egg, true, 'valid experiment unlocks recipe');
assert.equal(api.state.save.coins, 150, 'first recipe includes discovery bonus');
assert.equal(api.state.save.pantry.tomato, 0);
assert.equal(api.state.save.pantry.egg, 0);

api.state.save.pantry.tomato = 1;
api.state.save.pantry.rice = 1;
api.state.kitchenSelected = ['tomato', 'rice'];
api.cookSelectedRecipe();
assert.equal(api.state.save.coins, 150, 'invalid experiment earns no coins');
assert.equal(api.state.save.pantry.tomato, 0, 'invalid experiment consumes ingredients');
assert.equal(api.state.save.pantry.rice, 0, 'invalid experiment consumes ingredients');

api.state.save.coins = 1000;
api.buyDailySkill(api.DAILY_SKILLS[0]);
assert.equal(api.state.save.dailySkills.ids.includes('steadyDoor'), true);
assert.equal(api.state.save.coins, 840);

api.state.save.recipes.egg_rice = true;
api.buyDailySkill(api.DAILY_SKILLS[1]);
api.startRun('normal');
assert.equal(api.state.freshSeals, 2, 'daily Fresh Seal skill adds one charge');
api.state.freshSealArmed = true;
api.rewardIngredientDrop({ ghosts: [api.GHOSTS[0]] });
assert.equal(api.state.freshSeals, 1, 'armed Fresh Seal consumes one charge');
assert.equal(Object.values(api.state.runRewards.ingredients).reduce((a, b) => a + b, 0), 1, 'armed Fresh Seal guarantees one ingredient');

api.safeReturnHome();
assert.equal(api.state.runSucceeded, true);
assert.equal(Object.values(api.state.save.pantry).reduce((a, b) => a + b, 0), 1, 'safe return banks run ingredients');

api.startRun('normal');
api.state.runRewards.ingredients.tomato = 2;
api.gameOver('门开太久，鬼冲出来了');
assert.equal(api.state.runRewards.ingredients.tomato, undefined, 'failure clears run ingredients');
assert.equal(api.state.runRewards.lostIngredients.tomato, 2, 'failure records lost ingredients');

console.log('food-loop smoke test passed');
