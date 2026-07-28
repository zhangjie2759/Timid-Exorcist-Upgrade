const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const gamePath = path.join(__dirname, '..', 'game.js');
let source = fs.readFileSync(gamePath, 'utf8');
source = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__foodTest = {
    VERSION, INGREDIENTS, RECIPES, DAILY_SKILLS, GHOSTS, PETS, TEST_PANTRY_STOCK, LOADOUT_LIMITS, BUSINESS_TITLES, state,
    emptyRunRewards, cookSelectedRecipe, finishKitchenJobIfReady, kitchenCookDuration, formatKitchenTime, buyDailySkill, startRun,
    rewardIngredientDrop, safeReturnHome, gameOver, recipeCount,
    sellPlatedDish, sellStoredDish, discardPlatedDish, useDailyActiveSkill,
    skillCooldownRemaining, ghostEyeCooldownProgress, ghostEyeOpenRatio, generateDailyShopOffers, upgradeKitchenSlots,
    normalizeSave, sanitizeLoadout, dailyPriceMultiplier, dailyDishPrice, marketDelta, marketAdvice, knownMarketRecipes, bestMarketOpportunity, businessTitleInfo, totalDishCount,
    hasCarriedSkill, openRunPreparation, openSkillShop,
    startCorridorAdvance, finishCorridorAdvance, handleSealClick,
    handleBossSealClick, finishKitchenDrag, activeSkillButtonRect, carriedActiveSkill, runSkillButtonRects,
    kitchenIngredientRects, kitchenStoveRect, kitchenDishRect, kitchenDishActionRect, kitchenPrepareRect,
    kitchenMarketCardRects, kitchenMarketLockedRect, resize, draw
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
assert.equal(api.VERSION, 'v0.24.0_full_food_cast_buttons');
const themePath = path.join(__dirname, '..', 'ui-theme.js');
const themeSource = fs.readFileSync(themePath, 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(fs.existsSync(themePath), 'replaceable art theme registry exists');
assert.ok(indexSource.indexOf('./ui-theme.js') < indexSource.indexOf('./game.js'), 'theme registry loads before gameplay');
[
  'c01-head-chef.png', 'c02-tall-apprentice.png', 'c03-tiny-helper.png', 'c04-steam-chef.png', 'c05-serving-chef.png'
].forEach(file => assert.ok(fs.existsSync(path.join(__dirname, '..', 'images', 'redesign', 'clean3d-v1', 'characters', 'chefs', file)), `chef asset exists: ${file}`));
[
  'f01-tomato.png', 'f02-egg.png', 'f03-rice.png', 'f04-water.png', 'f05-potato.png',
  'f06-tofu.png', 'f07-mushroom.png', 'f08-green-pepper.png', 'f09-shrimp.png', 'f10-crab.png'
].forEach(file => assert.ok(fs.existsSync(path.join(__dirname, '..', 'images', 'redesign', 'clean3d-v1', 'characters', 'food-monsters', file)), `food-monster asset exists: ${file}`));
['猼訑', '赤鱬', '当康', '混沌', '九尾狐', '夔牛', '麒麟', '穷奇', '饕餮', '狰', '烛阴']
  .forEach(name => assert.match(themeSource, new RegExp(`['"]${name}['"]\\s*:`), `theme maps legacy save key: ${name}`));
assert.match(source, /function drawThemeSprite\(/, 'runtime uses a replaceable theme sprite bridge');
assert.match(source, /function themeGhostSkin\(/, 'legacy ghost data resolves through the food-monster skin registry');
assert.match(source, /function drawFoodMonsterPlaceholder\(/, 'missing theme images use a food-monster placeholder instead of old ghost art');
assert.doesNotMatch(source, /\.\.\.GHOSTS\.map\(g => g\.file\)/, 'old ghost sprites are not preloaded by the full replacement theme');
assert.match(source, /function drawThemeButtonBase\(/, 'all semantic buttons share one replaceable themed base');
assert.match(source, /function drawThemeButtonGlyph\(/, 'button icons are drawn through the shared vector glyph library');
assert.doesNotMatch(source, /getAssetImage\(ROOM_ASSETS\.seal\)/, 'seal buttons no longer render the old seal image');
assert.match(source, /themeFoodFile\(ingredient\.id\)/, 'ingredient art resolves through the theme registry');
assert.match(source, /function drawFutureOrbGlyph\(/, 'Foresight uses its own future-orb glyph');
assert.match(source, /function drawKitchenRoomBackground\(/, 'kitchen has a dedicated room scene');
assert.match(source, /function drawKitchenPantryShelf\(/, 'ingredients are integrated into a pantry shelf');
assert.match(source, /function drawKitchenHangingMenu\(/, 'dish market is integrated into a hanging menu');
assert.doesNotMatch(source, /function drawKitchenMarketLegend\(/, 'market no longer needs a separate strategy legend');
assert.match(source, /function drawKitchenMarketLockedSummary\(/, 'undiscovered dishes are summarized instead of repeated');
assert.equal(api.INGREDIENTS.length, 4);
assert.equal(api.RECIPES.length, 7);
assert.equal(api.TEST_PANTRY_STOCK, 99);
assert.equal(Math.min(...Object.values(api.state.save.pantry)), 99, 'test pantry starts full');
assert.equal(api.normalizeSave({ kitchen: { slots: 2 } }).kitchen.slots, 3, 'old saves receive the three-slot cooking counter');
assert.ok(api.PETS.every(pet => !pet.forms && pet.role), 'animal chefs no longer contain level or evolution forms');
assert.ok(api.GHOSTS.every(ghost => !ghost.ghostEye && !ghost.foresight), 'sealed ghosts contain no skill-grant flags');
assert.deepEqual({ ...api.LOADOUT_LIMITS }, { active: 1, support: 2 }, 'loadout has one active and two passive/trigger slots');
assert.deepEqual(
  Array.from(api.sanitizeLoadout(['ghostEyeSkill', 'foresightSkill', 'freshSeal', 'preserveBag', 'revive'], ['ghostEyeSkill', 'foresightSkill', 'freshSeal', 'preserveBag', 'revive'])),
  ['ghostEyeSkill', 'freshSeal', 'preserveBag'],
  'old loadouts migrate into one active and two support slots'
);
const migratedDishSave = api.normalizeSave({ platedDish: { recipeId: 'tomato_egg', first: true } });
assert.equal(migratedDishSave.dishInventory.tomato_egg, 1, 'old plated dish migrates into persistent dish inventory');
assert.equal(migratedDishSave.firstSaleBonuses.tomato_egg, true, 'old first-sale bonus is preserved');
const migratedJobSave = api.normalizeSave({ kitchenJob: { recipeId: 'tomato_egg', startedAt: 100, finishAt: 6100, chefs: 2 } });
assert.equal(migratedJobSave.kitchenJob.finishAt, 6100, 'existing cooking jobs preserve their original finish time');
const liveSave = api.state.save;
api.state.save = migratedJobSave;
api.state.save.kitchenJob.finishAt = Date.now() - 1;
assert.equal(api.finishKitchenJobIfReady(), true, 'an offline job completes automatically after its saved finish time');
assert.equal(api.state.save.dishInventory.tomato_egg, 1, 'offline completion stocks the finished dish');
api.state.save = liveSave;

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
assert.ok(api.state.save.kitchenJob, 'cooking starts a timed production job');
assert.equal(api.state.save.dishInventory.tomato_egg, 0, 'dish is not stocked before the progress finishes');
assert.equal(api.kitchenCookDuration(0), 180, 'base stove needs three minutes');
assert.equal(api.kitchenCookDuration(1), 170);
assert.equal(api.kitchenCookDuration(5), 130);
assert.equal(api.kitchenCookDuration(10), 80);
assert.equal(api.kitchenCookDuration(15), 30);
assert.equal(api.kitchenCookDuration(20), 30, 'cooking time has a thirty-second floor');
assert.equal(api.formatKitchenTime(180), '3:00');
assert.equal(api.formatKitchenTime(80), '1:20');
const firstJobFinishAt = api.state.save.kitchenJob.finishAt;
assert.equal(api.state.save.kitchenJob.chefs, 0, 'chef count is locked when production starts');
assert.equal(api.state.save.kitchenJob.finishAt - api.state.save.kitchenJob.startedAt, 180000, 'zero-chef job stores a three-minute finish time');
api.cookSelectedRecipe();
assert.equal(api.state.save.kitchenJob.finishAt, firstJobFinishAt, 'a second dish cannot start while the stove is busy');
api.finishKitchenJobIfReady(true);
assert.equal(api.state.save.recipes.tomato_egg, true, 'finished production unlocks the recipe');
assert.equal(api.state.save.coins, 0, 'cooking no longer auto-sells');
assert.equal(api.state.save.dishInventory.tomato_egg, 1, 'cooked dish enters persistent dish inventory');
assert.equal(api.state.save.firstSaleBonuses.tomato_egg, true, 'new recipe keeps its first-sale bonus');
assert.deepEqual(Array.from(api.knownMarketRecipes().map(recipe => recipe.id)), ['tomato_egg'], 'market lists discovered dishes only');
assert.equal(api.bestMarketOpportunity().id, 'tomato_egg', 'hanging menu promotes an in-stock dish');
assert.ok(['现在卖', '可观望', '先囤货'].includes(api.marketAdvice(api.bestMarketOpportunity()).label), 'market gives one plain action suggestion');
assert.equal(api.kitchenMarketCardRects().length, 1, 'locked recipes do not create repetitive market cards');
assert.ok(api.kitchenMarketCardRects()[0].w > api.state.layout.w * 0.8, 'a lone known dish uses a full-width market ticket');
assert.equal(api.kitchenMarketCardRects()[0].h, 74, 'simplified market cards stay compact');
assert.ok(api.kitchenMarketLockedRect().y > api.kitchenMarketCardRects()[0].y, 'undiscovered summary follows known dish prices');
assert.equal(api.state.save.pantry.tomato, 0);
assert.equal(api.state.save.pantry.egg, 0);
const tomatoEgg = api.RECIPES.find(recipe => recipe.id === 'tomato_egg');
const todayTomatoEggPrice = api.dailyDishPrice(tomatoEgg);
assert.equal(api.dailyDishPrice(tomatoEgg), todayTomatoEggPrice, 'daily dish price stays stable within a natural day');
assert.ok(api.dailyPriceMultiplier(tomatoEgg) >= 0.75 && api.dailyPriceMultiplier(tomatoEgg) <= 1.40, 'daily multiplier stays inside the greybox range');
api.sellStoredDish('tomato_egg');
assert.equal(api.state.save.coins, todayTomatoEggPrice + 60, 'separate sale uses today’s price and discovery bonus');
assert.equal(api.state.save.dishInventory.tomato_egg, 0);
assert.equal(api.bestMarketOpportunity(), null, 'hanging menu reports no sale opportunity when stock is empty');
assert.equal(api.state.save.lifetimeRevenue, todayTomatoEggPrice + 60, 'sales accumulate permanent business revenue');
const coinsAfterFirstSale = api.state.save.coins;

api.state.save.pantry.tomato = 1;
api.state.save.pantry.rice = 1;
api.state.kitchenSlots = ['tomato', 'rice', null, null];
api.cookSelectedRecipe();
assert.equal(api.state.save.coins, coinsAfterFirstSale, 'invalid experiment earns no coins');
assert.equal(api.state.save.platedDish, null, 'failed experiment also waits for cooking progress');
api.finishKitchenJobIfReady(true);
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
api.finishKitchenJobIfReady(true);
assert.equal(api.state.save.dishInventory.tomato_egg_rice, 1, 'three-ingredient dish can be stocked from the base counter');
api.state.save.lifetimeRevenue = 790;
assert.equal(api.businessTitleInfo().current.name, '路边摊');
api.sellStoredDish('tomato_egg_rice');
assert.equal(api.businessTitleInfo().current.name, '大排档', 'lifetime sales promote the permanent business title');

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
assert.deepEqual(Array.from(api.state.runLoadout), ['ghostEyeSkill', 'freshSeal', 'preserveBag'], 'pre-run preparation restores one active and two support skills');
api.startRun('normal');
assert.equal(api.state.freshSeals, 1, 'Fresh Seal skill grants one charge per run');
assert.equal(api.useDailyActiveSkill('ghostEyeSkill'), true, 'active skill can be used during a run');
assert.equal(api.state.ghostEyeUntil - api.state.t, 5, 'Ghost Eye starts a five-second reveal window');
assert.equal(api.state.skillReadyAt.ghostEyeSkill - api.state.ghostEyeUntil, 30, 'thirty-second cooldown starts after the reveal ends');
assert.equal(api.skillCooldownRemaining('ghostEyeSkill'), 35, 'full cycle includes five active and thirty cooldown seconds');
assert.equal(api.ghostEyeOpenRatio(), 1, 'active eye is fully open');
api.startCorridorAdvance(2);
api.finishCorridorAdvance();
assert.ok(api.state.ghostEyeUntil > api.state.t, 'Ghost Eye remains active after advancing to another door');
api.state.t += 5.1;
assert.ok(api.state.ghostEyeUntil <= api.state.t, 'Ghost Eye expires after five seconds');
assert.equal(api.skillCooldownRemaining('ghostEyeSkill'), 30, 'door advances do not reduce the post-effect time cooldown');
api.state.t += 0.2;
assert.ok(api.ghostEyeOpenRatio() < 0.05, 'eye closes at the start of cooldown');
api.state.t += 14.7;
assert.ok(Math.abs(api.ghostEyeCooldownProgress() - 0.5) < 0.02, 'cooldown reaches half progress after fifteen seconds');
assert.ok(Math.abs(api.ghostEyeOpenRatio() - 0.5) < 0.02, 'eye is half open at half cooldown');
api.state.t += 15;
assert.equal(api.skillCooldownRemaining('ghostEyeSkill'), 0, 'Ghost Eye is ready after thirty cooldown seconds');
assert.equal(api.ghostEyeOpenRatio(), 1, 'ready eye is fully open again');
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

api.state.runLoadout = ['foresightSkill'];
api.startRun('normal');
assert.equal(api.useDailyActiveSkill('foresightSkill'), true, 'Foresight can be used the first time');
assert.equal(api.state.foresight.used, 1);
api.state.screen = 'game';
api.state.mode = 'normal';
api.state.room += 7;
assert.equal(api.useDailyActiveSkill('foresightSkill'), true, 'Foresight can be used a second time after cooldown');
assert.equal(api.state.foresight.used, 2);
api.state.screen = 'game';
api.state.mode = 'normal';
api.state.room += 7;
assert.equal(api.useDailyActiveSkill('foresightSkill'), false, 'Foresight is capped at two uses per run');

const nineTailedFox = api.GHOSTS.find(ghost => ghost.name === '九尾狐');
const zhuyin = api.GHOSTS.find(ghost => ghost.name === '烛阴');
api.state.runLoadout = [];
api.startRun('normal');
api.state.content = { type: 'ghost', ghosts: [nineTailedFox], requiredSeals: 1, sealed: 0, talismans: [] };
api.handleSealClick();
assert.equal(api.state.ghostEyeUntil, 0, 'sealing Nine-tailed Fox grants no Ghost Eye');
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
api.state.runLoadout = ['ghostEyeSkill', 'freshSeal'];
const activeButton = api.activeSkillButtonRect();
assert.ok(activeButton.w >= 56 && activeButton.h >= 56, 'active skill circle keeps a mobile touch target');
assert.ok(activeButton.x > api.state.layout.sealButton.x + api.state.layout.sealButton.w, 'active skill circle does not overlap the seal button');
assert.equal(api.carriedActiveSkill().id, 'ghostEyeSkill');
assert.deepEqual(Array.from(api.runSkillButtonRects().map(rect => rect.id)), ['freshSeal'], 'active skill leaves the upper utility row');
api.state.runLoadout = ['foresightSkill'];
api.state.screen = 'game';
api.state.mode = 'normal';
api.state.foresight = { untilRoom: api.state.room + 7, used: 1, maxPerRun: 2, readyRoom: api.state.room + 4 };
api.draw();
api.state.foresight.readyRoom = api.state.room;
api.draw();
assert.equal(api.carriedActiveSkill().id, 'foresightSkill', 'Foresight reuses the same active skill circle');
api.state.screen = 'pets';
api.state.kitchenView = 'cook';
api.draw();
assert.equal(api.state.layout.w, 360, 'compact phone kitchen renders at 360px width');
assert.ok(api.kitchenIngredientRects().every(r => r.y < api.kitchenStoveRect().y), 'pantry shelf stays above the stove');
assert.ok(api.kitchenDishRect().y > api.kitchenStoveRect().y, 'serving hatch stays below the stove');
assert.ok(api.kitchenPrepareRect().y + api.kitchenPrepareRect().h <= api.state.layout.h, 'kitchen exit door remains on screen');
assert.ok(api.kitchenDishActionRect().y + api.kitchenDishActionRect().h < api.kitchenPrepareRect().y, 'hanging menu does not overlap the kitchen exit');
const knownRecipesBeforeEmptyMarket = api.state.save.recipes;
const dishInventoryBeforeEmptyMarket = api.state.save.dishInventory;
api.state.save.recipes = {};
api.state.save.dishInventory = {};
assert.equal(api.kitchenMarketCardRects().length, 0, 'a brand-new kitchen does not show repeated locked market cards');
assert.equal(api.kitchenMarketLockedRect().y, 122, 'undiscovered summary starts directly below the compact market heading');
api.state.kitchenView = 'market';
api.draw();
api.state.save.recipes = knownRecipesBeforeEmptyMarket;
api.state.save.dishInventory = dishInventoryBeforeEmptyMarket;
api.draw();
api.state.kitchenView = 'chefs';
api.draw();
api.state.screen = 'prepare';
api.state.save.dailySkills.ids = ['ghostEyeSkill', 'foresightSkill', 'freshSeal', 'preserveBag', 'revive', 'luckyFood'];
api.openRunPreparation();
api.draw();
sandbox.window.innerWidth = 390;
sandbox.window.innerHeight = 844;
api.resize();
api.draw();
assert.equal(api.state.layout.h, 844, 'tall phone loadout renders at 844px height');
api.state.screen = 'pets';
api.state.kitchenView = 'cook';
api.draw();
assert.ok(api.kitchenIngredientRects().every(r => r.w >= 70 && r.h >= 60), 'tall phone pantry baskets remain touchable');
assert.ok(api.kitchenDishActionRect().y + api.kitchenDishActionRect().h < api.kitchenPrepareRect().y, 'tall phone scene keeps the menu and exit separated');

console.log('food-loop smoke test passed');
