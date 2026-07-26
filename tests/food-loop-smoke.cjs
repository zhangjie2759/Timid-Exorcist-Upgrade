const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const gamePath = path.join(__dirname, '..', 'game.js');
let source = fs.readFileSync(gamePath, 'utf8');
source = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__foodTest = {
    VERSION, INGREDIENTS, RECIPES, DAILY_SKILLS, GHOSTS, PETS, TEST_PANTRY_STOCK, state,
    emptyRunRewards, cookSelectedRecipe, buyDailySkill, startRun,
    rewardIngredientDrop, safeReturnHome, gameOver, recipeCount,
    sellPlatedDish, discardPlatedDish, useDailyActiveSkill,
    skillCooldownRemaining, generateDailyShopOffers, upgradeKitchenSlots,
    normalizeSave, hasCarriedSkill, openRunPreparation, openSkillShop,
    startCorridorAdvance, finishCorridorAdvance, handleSealClick,
    handleBossSealClick, finishKitchenDrag, resize, draw
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
assert.equal(api.VERSION, 'v0.20.0_single_door_eye_big_stove');
assert.equal(api.INGREDIENTS.length, 4);
assert.equal(api.RECIPES.length, 7);
assert.equal(api.TEST_PANTRY_STOCK, 99);
assert.equal(Math.min(...Object.values(api.state.save.pantry)), 99, 'test pantry starts full');
assert.equal(api.normalizeSave({ kitchen: { slots: 2 } }).kitchen.slots, 3, 'old saves receive the three-slot cooking counter');
assert.ok(api.PETS.every(pet => !pet.forms && pet.role), 'animal chefs no longer contain level or evolution forms');
assert.ok(api.GHOSTS.every(ghost => !ghost.ghostEye && !ghost.foresight), 'sealed ghosts contain no skill-grant flags');

api.state.kitchenSlots = [null, null, null, null];
api.state.kitchenDrag = { id: 'tomato', moved: false };
api.finishKitchenDrag({ x: 0, y: 0 });
assert.equal(api.state.kitchenSlots[0], 'tomato', 'tap-to-place still fills the first open stove slot');
api.state.kitchenSlots = [null, null, null, null];

api.state.save.pantry.tomato = 1;
api.state.save.pantry.egg = 1;
api.state.kitchenMethod = 'stir';
api.state.kitchenSlots = ['tomato', 'egg', null, null];
api.cookSelectedRecipe();
assert.equal(api.state.save.recipes.tomato_egg, true, 'valid experiment unlocks recipe');
assert.equal(api.state.save.coins, 0, 'cooking no longer auto-sells');
assert.equal(api.state.save.platedDish.recipeId, 'tomato_egg', 'cooked dish waits on serving counter');
assert.equal(api.state.save.pantry.tomato, 0);
assert.equal(api.state.save.pantry.egg, 0);
api.sellPlatedDish();
assert.equal(api.state.save.coins, 150, 'selling is a separate action and includes discovery bonus');
assert.equal(api.state.save.platedDish, null);

api.state.save.pantry.tomato = 1;
api.state.save.pantry.rice = 1;
api.state.kitchenSlots = ['tomato', 'rice', null, null];
api.cookSelectedRecipe();
assert.equal(api.state.save.coins, 150, 'invalid experiment earns no coins');
assert.equal(api.state.save.platedDish.id, 'dark', 'failed experiment produces a dark dish');
assert.equal(api.state.save.pantry.tomato, 0, 'invalid experiment consumes ingredients');
assert.equal(api.state.save.pantry.rice, 0, 'invalid experiment consumes ingredients');
api.discardPlatedDish();
assert.equal(api.state.save.platedDish, null, 'dark dish can be discarded');

api.state.save.pantry.tomato = 1;
api.state.save.pantry.egg = 1;
api.state.save.pantry.rice = 1;
api.state.kitchenMethod = 'stir';
api.state.kitchenSlots = ['tomato', 'egg', 'rice', null];
api.cookSelectedRecipe();
assert.equal(api.state.save.platedDish.recipeId, 'tomato_egg_rice', 'three-ingredient recipe is cookable from the base counter');
api.sellPlatedDish();

api.state.save.coins = 1000;
api.state.save.dailySkills.offers = ['freshSeal', 'preserveBag', 'ghostEyeSkill'];
api.buyDailySkill(api.DAILY_SKILLS.find(skill => skill.id === 'freshSeal'));
api.buyDailySkill(api.DAILY_SKILLS.find(skill => skill.id === 'preserveBag'));
api.buyDailySkill(api.DAILY_SKILLS.find(skill => skill.id === 'ghostEyeSkill'));
assert.deepEqual(Array.from(api.state.save.dailySkills.ids), ['freshSeal', 'preserveBag', 'ghostEyeSkill'], 'daily skills have no two-skill cap');
assert.equal(api.state.save.coins, 560, 'skills use fixed listed prices');

api.state.runLoadout = [];
api.state.screen = 'game';
api.state.mode = 'normal';
assert.equal(api.useDailyActiveSkill('ghostEyeSkill'), false, 'an owned but uncarried active skill cannot be used');

api.state.save.recipes.egg_rice = true;
api.state.save.dailySkills.loadout = ['freshSeal', 'preserveBag', 'ghostEyeSkill'];
api.openRunPreparation();
assert.deepEqual(Array.from(api.state.runLoadout), ['freshSeal', 'preserveBag', 'ghostEyeSkill'], 'pre-run preparation restores the chosen three-skill loadout');
api.startRun('normal');
assert.equal(api.state.freshSeals, 1, 'Fresh Seal skill grants one charge per run');
assert.equal(api.useDailyActiveSkill('ghostEyeSkill'), true, 'active skill can be used during a run');
assert.equal(api.state.ghostEyeRoom, 1, 'Ghost Eye is bound to the activation room');
assert.equal(api.skillCooldownRemaining('ghostEyeSkill'), 8, 'active skill starts its eight-door cooldown');
api.startCorridorAdvance(2);
assert.equal(api.state.ghostEyeRoom, 0, 'Ghost Eye ends as soon as the corridor advances');
api.finishCorridorAdvance();
for (let room = 3; room <= 9; room += 1) {
  api.startCorridorAdvance(room);
  api.finishCorridorAdvance();
}
assert.equal(api.skillCooldownRemaining('ghostEyeSkill'), 0, 'Ghost Eye is ready again after eight door advances');
api.state.freshSealArmed = true;
api.rewardIngredientDrop({ ghosts: [api.GHOSTS[0]] });
assert.equal(api.state.freshSeals, 0, 'armed Fresh Seal consumes one charge');
assert.equal(Object.values(api.state.runRewards.ingredients).reduce((a, b) => a + b, 0), 1, 'armed Fresh Seal guarantees one ingredient');

const pantryBeforeSafeReturn = Object.values(api.state.save.pantry).reduce((a, b) => a + b, 0);
api.safeReturnHome();
assert.equal(api.state.runSucceeded, true);
assert.equal(Object.values(api.state.save.pantry).reduce((a, b) => a + b, 0), pantryBeforeSafeReturn + 1, 'safe return banks run ingredients');

api.startRun('normal');
api.state.runRewards.ingredients.tomato = 2;
api.gameOver('门开太久，鬼冲出来了');
assert.equal(api.state.runRewards.ingredients.tomato, undefined, 'failure clears run ingredients');
assert.equal(api.state.runRewards.lostIngredients.tomato, 1, 'Fresh Pack removes one item from losses');
assert.equal(api.state.runRewards.preservedIngredients.tomato, 1, 'Fresh Pack records the protected ingredient');

api.state.runLoadout = [];
api.startRun('normal');
api.state.runRewards.ingredients.tomato = 2;
api.gameOver('封印失败');
assert.equal(api.state.runRewards.lostIngredients.tomato, 2, 'an owned but uncarried Fresh Pack preserves nothing');

const nineTailedFox = api.GHOSTS.find(ghost => ghost.name === '九尾狐');
const zhuyin = api.GHOSTS.find(ghost => ghost.name === '烛阴');
api.state.runLoadout = [];
api.startRun('normal');
api.state.content = { type: 'ghost', ghosts: [nineTailedFox], requiredSeals: 1, sealed: 0, talismans: [] };
api.handleSealClick();
assert.equal(api.state.ghostEyeRoom, 0, 'sealing Nine-tailed Fox grants no Ghost Eye');
assert.equal(api.state.screen, 'game', 'sealing a ghost does not open a skill screen');

api.state.mode = 'normal';
api.state.content = { type: 'ghost', ghosts: [zhuyin], requiredSeals: 1, sealed: 0, talismans: [] };
api.handleSealClick();
assert.equal(api.state.foresight.active, false, 'sealing Zhuyin grants no Foresight');
assert.equal(api.state.screen, 'game', 'Zhuyin seal remains in the normal game flow');

api.startRun('normal');
api.state.mode = 'bossFight';
api.state.content = { type: 'boss', stage: 1, bossGhost: zhuyin, cfg: { seals: 1 }, hits: 0, talismans: [] };
api.handleBossSealClick();
assert.equal(api.state.foresight.active, false, 'sealing a boss Zhuyin grants no Foresight');
assert.equal(api.state.mode, 'corridorTransition', 'boss victory advances normally without a skill reward');

api.state.save.dailySkills.ids.push('revive');
api.state.runLoadout = ['revive'];
api.startRun('normal');
api.gameOver('门开太久，鬼冲出来了');
assert.equal(api.state.reviveUsed, true, 'revive triggers once per run');
assert.equal(api.state.screen, 'game', 'first lethal ghost escape does not end the run');
api.gameOver('门开太久，鬼冲出来了');
assert.equal(api.state.screen, 'result', 'second lethal ghost escape ends the run');

api.state.save.coins = 1000;
['steamed_egg', 'rice_cake', 'tomato_egg_water'].forEach(id => { api.state.save.recipes[id] = true; });
api.upgradeKitchenSlots();
assert.equal(api.state.save.kitchen.slots, 4, 'permanent kitchen upgrade unlocks the optional fourth slot');
assert.equal(api.state.save.coins, 220, 'permanent kitchen upgrade spends coins once');

api.openSkillShop('pets');
assert.equal(api.state.screen, 'shop', 'skill shop is an independent screen');
assert.equal(api.state.shopReturnTo, 'pets', 'independent shop preserves its return destination');

sandbox.window.innerWidth = 360;
sandbox.window.innerHeight = 640;
api.resize();
api.state.screen = 'pets';
api.state.kitchenView = 'cook';
api.draw();
assert.equal(api.state.layout.w, 360, 'compact phone kitchen renders at 360px width');
sandbox.window.innerWidth = 390;
sandbox.window.innerHeight = 844;
api.resize();
api.draw();
assert.equal(api.state.layout.h, 844, 'tall phone kitchen renders at 844px height');

console.log('food-loop smoke test passed');
