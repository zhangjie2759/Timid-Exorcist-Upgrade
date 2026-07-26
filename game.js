(() => {
  'use strict';

  const VERSION = 'v0.21.0_daily_market_titles';
  const TEST_PANTRY_STOCK = 99;
  const LOADOUT_LIMITS = { active: 1, support: 2 };
  const BUSINESS_TITLES = [
    { revenue: 0, name: '路边摊', nameEn: 'Street Stall' },
    { revenue: 800, name: '大排档', nameEn: 'Food Stall' },
    { revenue: 3000, name: '街坊小馆', nameEn: 'Neighborhood Bistro' },
    { revenue: 10000, name: '人气酒楼', nameEn: 'Popular Restaurant' },
    { revenue: 30000, name: '精品餐厅', nameEn: 'Fine Restaurant' },
    { revenue: 80000, name: '星级大酒店', nameEn: 'Star Hotel' }
  ];
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const DPR_MAX = 2;
  const STORAGE_KEY = 'next_room_corridor_v0121_save';
  const ASSET_BASES = ['images/', '', 'assets/'];

  const ROOM_ASSETS = {
    wall: 'room/墙.png',
    room: 'room/房间.png',
    door: 'room/门.png',
    frame: 'room/门框.png',
    seal: '封印按钮.png',
    talisman: '符咒.png'
  };

  const BGM_FILE = 'audio/bgm.wav';
  const AUDIO_FILES = {
    bgm: ['audio/bgm.wav'],
    boss: ['audio/bossbgm.wav', 'audio/boss bgm.wav'],
    slide: ['audio/slide door.wav', 'audio/slide_door.wav', 'audio/slidedoor.wav'],
    open: ['audio/opendoor.wav', 'audio/open door.wav'],
    sealSuccess: ['audio/seal_success.wav', 'audio/sealsuccess.wav', 'audio/seal-success.wav'],
    sealFail: ['audio/seal_fail.wav', 'audio/sealfail.wav', 'audio/seal-fail.wav']
  };

  const GHOSTS = [
    { name: '猼訑', nameEn: 'Botuo', file: '鬼/猼訑.png', sealFile: '封印鬼/猼訑.png', type: 'normal', speed: 1.28, fire: 2, desc: '警觉又狡猾，喜欢躲在门后观察人。', descEn: 'Alert and cunning. It likes watching people from behind the door.' },
    { name: '赤鱬', nameEn: 'Chiru', file: '鬼/赤鱬.png', sealFile: '封印鬼/赤鱬.png', type: 'thin', speed: 2.08, fire: 2, desc: '细长灵活，动作很快，最擅长突然贴近。', descEn: 'Slim, agile, and fast. It is good at suddenly closing the distance.' },
    { name: '当康', nameEn: 'Dangkang', file: '鬼/康当.png', sealFile: '封印鬼/当康.png', type: 'heavy', speed: 1.05, fire: 2, desc: '体型敦实，压迫感强，逼近时像重物挪动。', descEn: 'Heavy and solid. Its approach feels like something massive shifting forward.' },
    { name: '混沌', nameEn: 'Hundun', file: '鬼/混沌.png', sealFile: '封印鬼/混沌.png', type: 'heavy', speed: 0.72, fire: 3, desc: '轮廓混乱，越盯着看越分不清它的形状。', descEn: 'A chaotic silhouette. The longer you stare, the harder it is to read.' },
    { name: '九尾狐', nameEn: 'Nine-tailed Fox', file: '鬼/九尾狐.png', sealFile: '封印鬼/九尾狐.png', type: 'normal', speed: 1.76, fire: 2, desc: '擅长迷惑视线，常让门后的轮廓变得难以判断。', descEn: 'A master of deception that makes silhouettes behind the door hard to read.' },
    { name: '夔牛', nameEn: 'Kui Ox', file: '鬼/夔牛.png', sealFile: '封印鬼/夔牛.png', type: 'heavy', speed: 1.18, fire: 2, desc: '独脚震地，虽然不快，但每次靠近都很有压迫。', descEn: 'Not the fastest, but every step feels heavy and oppressive.' },
    { name: '麒麟', nameEn: 'Qilin', file: '鬼/麒麟.png', sealFile: '封印鬼/麒麟.png', type: 'normal', speed: 1.42, fire: 2, desc: '外表庄重，但在门后出现时往往并不吉利。', descEn: 'It looks solemn, but seeing it behind the door is never a good sign.' },
    { name: '穷奇', nameEn: 'Qiongqi', file: '鬼/穷奇.png', sealFile: '封印鬼/穷奇.png', type: 'thin', speed: 2.22, fire: 3, desc: '凶性外露，判断失误时最容易被它扑出门。', descEn: 'Ferocious and direct. One bad read can let it burst out.' },
    { name: '饕餮', nameEn: 'Taotie', file: '鬼/饕餮.png', sealFile: '封印鬼/饕餮.png', type: 'heavy', speed: 1.32, fire: 3, desc: '贪婪巨口，虽然笨重，但存在感异常强烈。', descEn: 'A greedy maw. Slow and heavy, but impossible to ignore.' },
    { name: '狰', nameEn: 'Zheng', file: '鬼/狰.png', sealFile: '封印鬼/狰.png', type: 'normal', speed: 1.70, fire: 3, desc: '神情凶狠，常常伴着成群鬼火一起出现。', descEn: 'A fierce presence, often surrounded by ghost fire.' },
    { name: '烛阴', nameEn: 'Zhuyin', file: '鬼/烛阴.png', sealFile: '封印鬼/烛阴.png', type: 'thin', speed: 2.45, fire: 3, bossLike: true, rareNormal: true, desc: '极少现身的强大妖怪，更接近Boss，速度与压迫感都远超普通妖怪。', descEn: 'A rare, boss-like spirit whose speed and pressure exceed ordinary ghosts.' }
  ];

  const PEOPLE = [
    { name: '兔子', nameEn: 'Rabbit', file: '小动物/兔子.png', scale: 0.80, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '刺猬', nameEn: 'Hedgehog', file: '小动物/刺猬.png', scale: 0.80, desc: '看起来警觉，但不是鬼。', descEn: 'Looks alert, but it is not a ghost.' },
    { name: '小狗', nameEn: 'Dog', file: '小动物/小狗.png', scale: 0.80, desc: '安全的小动物。', descEn: 'A safe little animal.' },
    { name: '小猪', nameEn: 'Piglet', file: '小动物/小猪.png', scale: 0.80, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '小猫', nameEn: 'Cat', file: '小动物/小猫.png', scale: 0.80, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '松鼠', nameEn: 'Squirrel', file: '小动物/松鼠.png', scale: 0.80, desc: '动作很快，但不是鬼。', descEn: 'It moves quickly, but it is not a ghost.' },
    { name: '熊猫', nameEn: 'Panda', file: '小动物/熊猫.png', scale: 0.80, desc: '安全的小动物。', descEn: 'A safe little animal.' },
    { name: '狐狸', nameEn: 'Fox', file: '小动物/狐狸.png', scale: 0.80, desc: '看起来狡猾，但不是鬼。', descEn: 'Looks cunning, but it is not a ghost.' },
    { name: '猫头鹰', nameEn: 'Owl', file: '小动物/猫头鹰.png', scale: 0.80, galleryScale: 1.08, gameScale: 0.78, gameOffsetX: 0.22, gameOffsetY: -0.18, desc: '眼神很怪，但目前安全。', descEn: 'Its eyes are strange, but it is safe.' },
    { name: '鸭子', nameEn: 'Duck', file: '小动物/鸭子.png', scale: 0.80, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' }
  ];

  const PETS = [
    {
      id: 'rabbit',
      animalName: '兔子',
      name: '兔子厨师',
      nameEn: 'Rabbit Chef',
      role: '负责炒锅与备菜',
      roleEn: 'Wok and prep helper',
      tint: '#f7f7ff'
    },
    {
      id: 'dog',
      animalName: '小狗',
      name: '小狗厨师',
      nameEn: 'Dog Chef',
      role: '负责蒸笼与看火',
      roleEn: 'Steamer and fire helper',
      tint: '#fff3d6'
    },
    {
      id: 'owl',
      animalName: '猫头鹰',
      name: '猫头鹰厨师',
      nameEn: 'Owl Chef',
      role: '负责记录与整理食谱',
      roleEn: 'Recipe and record helper',
      tint: '#e9f6ff'
    }
  ];

  // GAME-003 食材料理灰盒：先用文字与现有妖怪验证循环，不提前补美术。
  const INGREDIENTS = [
    { id: 'tomato', name: '朱焰番茄', real: '西红柿', nameEn: 'Ember Tomato', realEn: 'Tomato' },
    { id: 'egg', name: '金羽蛋', real: '鸡蛋', nameEn: 'Golden Egg', realEn: 'Egg' },
    { id: 'rice', name: '云纹米', real: '大米', nameEn: 'Cloud Rice', realEn: 'Rice' },
    { id: 'water', name: '月泉水', real: '清水', nameEn: 'Moonwater', realEn: 'Water' }
  ];

  const RECIPES = [
    { id: 'tomato_egg', method: 'stir', ingredients: ['tomato', 'egg'], name: '赤焰番茄炒金羽蛋', nameEn: 'Ember Tomato & Golden Egg', price: 90 },
    { id: 'egg_rice', method: 'stir', ingredients: ['egg', 'rice'], name: '金羽蛋炒云纹米', nameEn: 'Golden Egg Cloud Rice', price: 110 },
    { id: 'steamed_egg', method: 'steam', ingredients: ['egg', 'water'], name: '月泉金羽蒸蛋', nameEn: 'Moonwater Steamed Egg', price: 80 },
    { id: 'rice_cake', method: 'steam', ingredients: ['rice', 'water'], name: '云纹月泉米糕', nameEn: 'Cloud-Moon Rice Cake', price: 100 },
    { id: 'tomato_egg_rice', method: 'stir', ingredients: ['tomato', 'egg', 'rice'], name: '赤焰番茄金羽蛋炒饭', nameEn: 'Ember Tomato Egg Fried Rice', price: 180 },
    { id: 'tomato_egg_water', method: 'steam', ingredients: ['tomato', 'egg', 'water'], name: '月泉番茄蒸金羽蛋', nameEn: 'Moonwater Tomato Steamed Egg', price: 155 },
    { id: 'egg_rice_water', method: 'steam', ingredients: ['egg', 'rice', 'water'], name: '金羽云纹蒸米糕', nameEn: 'Golden Egg Cloud Rice Cake', price: 170 }
  ];

  const DAILY_SKILLS = [
    { id: 'freshSeal', type: 'passive', name: '封鲜术', nameEn: 'Fresh Seal', desc: '每局获得1张封鲜符，保证一次食材掉落', descEn: 'Gain 1 Fresh Seal each run', price: 120, recipes: 0 },
    { id: 'preserveBag', type: 'passive', name: '保鲜背包', nameEn: 'Fresh Pack', desc: '失败时保住本局1份食材', descEn: 'Keep 1 run ingredient on failure', price: 140, recipes: 0 },
    { id: 'ghostEyeSkill', type: 'active', duration: 5, cooldownSeconds: 30, name: '透视', nameEn: 'Ghost Eye', desc: '看穿门后5秒，冷却30秒', descEn: 'Reveal doors for 5s; 30s cooldown', price: 180, recipes: 1 },
    { id: 'foresightSkill', type: 'active', cooldown: 7, maxPerRun: 2, name: '遇见未来', nameEn: 'Foresight', desc: '预览后面5扇门，每局2次，冷却7次开门', descEn: 'Preview 5 doors; 2 uses/run; 7-door cooldown', price: 240, recipes: 2 },
    { id: 'revive', type: 'trigger', name: '替身纸人', nameEn: 'Paper Double', desc: '妖怪冲出时自动复活，每局1次', descEn: 'Revive once per run after a ghost escape', price: 260, recipes: 2 },
    { id: 'luckyFood', type: 'passive', name: '寻味香囊', nameEn: 'Flavor Charm', desc: '普通封印的食材掉落率提高', descEn: 'Raises normal ingredient drop chance', price: 200, recipes: 3 }
  ];

  const KITCHEN_UPGRADES = [
    { slots: 4, recipes: 5, price: 780, name: '四格料理台', nameEn: 'Four-slot Counter' }
  ];

  const GHOST_FIRE_FILES = [
    '鬼火/鬼火1.png',
    '鬼火/鬼火2.png',
    '鬼火/鬼火3.png',
    '鬼火/鬼火4.png',
    '鬼火/鬼火5.png'
  ];

  const BOSS_CONFIGS = [
    { stage: 1, time: 7.0, seals: 16 },
    { stage: 2, time: 6.5, seals: 20 },
    { stage: 3, time: 6.0, seals: 24 },
    { stage: 4, time: 5.8, seals: 28 },
    { stage: 5, time: 5.5, seals: 30 }
  ];

  const state = {
    screen: 'preload',
    lang: 'zh',
    difficulty: 'normal',
    room: 1,
    content: null,
    nextContent: null,
    mode: 'normal',
    door: 0,
    snapTarget: null,
    draggingDoor: false,
    dragStartX: 0,
    dragStartDoor: 0,
    danger: 0,
    transition: 0,
    transitionStartDoor: 0,
    corridorOffset: 0,
    pendingNextRoom: 2,
    ghostEyeUntil: 0,
    eyeFx: 0,
    sealFlash: 0,
    bossDefeated: {},
    futureQueue: [],
    foresight: { active: false, phase: 'prepare', index: 0, timer: 0, count: 5, perDoorTime: 0.46, prepareTime: 1.15, returnTime: 0.65, used: 0, maxPerRun: 2, returnTo: 'game' },
    runRewards: emptyRunRewards(),
    testMode: false,
    runLoadout: [],
    musicOn: false,
    sfxOn: true,
    audioUnlocked: false,
    bgm: null,
    bossBgm: null,
    slideSfx: null,
    openSfx: null,
    audioCtx: null,
    audio: {
      currentMusic: 'normal',
      normalTarget: 0,
      bossTarget: 0,
      slideTarget: 0,
      duck: 0,
      doorWasMoving: false,
      lastDoor: 0,
      ghostCooldown: 0,
      sealSfxCooldown: 0
    },
    toast: null,
    preloadElapsed: 0,
    preloadMin: 0.8,
    preloadMax: 5.0,
    resultReason: '',
    galleryTab: 'ghosts',
    galleryScroll: 0,
    galleryDragging: false,
    galleryDragStartY: 0,
    galleryDragStartScroll: 0,
    petScroll: 0,
    petDragging: false,
    petDragStartY: 0,
    petDragStartScroll: 0,
    kitchenMethod: 'stir',
    kitchenSlots: [null, null, null, null],
    kitchenDrag: null,
    kitchenView: 'cook',
    kitchenCookFx: 0,
    shopReturnTo: 'result',
    freshSealArmed: false,
    freshSeals: 1,
    skillReadyRoom: {},
    skillReadyAt: {},
    reviveUsed: false,
    runSucceeded: false,
    rulesScroll: 0,
    rulesDragging: false,
    rulesDragStartY: 0,
    rulesDragStartScroll: 0,
    lastScreen: 'menu',
    pointer: { x: 0, y: 0, down: false },
    pressed: null,
    layout: null,
    t: 0,
    save: loadSave()
  };

  const assets = {};
  const assetCache = {};

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('next_room_v01111_save') || '';
      if (!raw) throw new Error('no save');
      const data = JSON.parse(raw);
      return normalizeSave(data);
    } catch (e) {
      return normalizeSave({});
    }
  }

  function skillLoadoutGroup(skill) {
    return skill && skill.type === 'active' ? 'active' : 'support';
  }

  function sanitizeLoadout(ids, ownedIds = ids) {
    const owned = new Set(ownedIds || []);
    const selected = { active: [], support: [] };
    Array.from(new Set(ids || [])).forEach(id => {
      const skill = dailySkillById(id);
      if (!skill || !owned.has(id)) return;
      const group = skillLoadoutGroup(skill);
      if (selected[group].length < LOADOUT_LIMITS[group]) selected[group].push(id);
    });
    return [...selected.active, ...selected.support];
  }

  function normalizeSave(data) {
    const pets = {};
    PETS.forEach(p => {
      const old = data.pets && data.pets[p.id] ? data.pets[p.id] : {};
      pets[p.id] = {
        met: !!old.met,
        count: old.met ? Math.max(1, Number(old.count || old.xp || 1)) : 0
      };
    });
    const storedDaily = data.dailySkills || {};
    const dailySkills = storedDaily.date === localDayKey()
      ? {
          date: storedDaily.date,
          ids: Array.from(new Set((storedDaily.ids || []).filter(id => DAILY_SKILLS.some(s => s.id === id)))),
          offers: Array.from(new Set((storedDaily.offers || []).filter(id => DAILY_SKILLS.some(s => s.id === id)))).slice(0, 3),
          loadout: sanitizeLoadout(storedDaily.loadout || [], storedDaily.ids || [])
        }
      : { date: localDayKey(), ids: [], offers: [], loadout: [] };
    const storedKitchen = data.kitchen || {};
    const dishInventory = normalizeCountMap(data.dishInventory, RECIPES.map(recipe => recipe.id));
    const firstSaleBonuses = { ...(data.firstSaleBonuses || {}) };
    if (data.platedDish && RECIPES.some(recipe => recipe.id === data.platedDish.recipeId)) {
      dishInventory[data.platedDish.recipeId] += 1;
      if (data.platedDish.first) firstSaleBonuses[data.platedDish.recipeId] = true;
    }
    const platedDish = data.platedDish && data.platedDish.id === 'dark' ? { id: 'dark' } : null;
    const rawJob = data.kitchenJob || null;
    const kitchenJob = rawJob && (rawJob.recipeId === 'dark' || RECIPES.some(recipe => recipe.id === rawJob.recipeId))
      && Number.isFinite(Number(rawJob.startedAt)) && Number.isFinite(Number(rawJob.finishAt))
      ? { recipeId: rawJob.recipeId, startedAt: Number(rawJob.startedAt), finishAt: Number(rawJob.finishAt), chefs: Math.max(0, Number(rawJob.chefs || 0)) }
      : null;
    const pantry = normalizeCountMap(data.pantry, INGREDIENTS.map(i => i.id));
    INGREDIENTS.forEach(ingredient => { pantry[ingredient.id] = Math.max(pantry[ingredient.id], TEST_PANTRY_STOCK); });
    return {
      bestRoom: Number(data.bestRoom || 1),
      ghosts: data.ghosts || {},
      people: data.people || {},
      pets,
      petHouseSeen: !!data.petHouseSeen,
      spirit: Math.max(0, Number(data.spirit || 0)),
      talismanDust: Math.max(0, Number(data.talismanDust || 0)),
      pantry,
      recipes: data.recipes || {},
      coins: Math.max(0, Number(data.coins || 0)),
      lifetimeRevenue: Math.max(0, Number(data.lifetimeRevenue || 0)),
      dishInventory,
      firstSaleBonuses,
      dailySkills,
      kitchen: { slots: clamp(Math.round(Number(storedKitchen.slots || 3)), 3, 4) },
      platedDish,
      kitchenJob
    };
  }

  function saveGame() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save)); } catch (e) {}
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function isEn() { return state.lang === 'en'; }
  function ui(zh, en) { return isEn() ? en : zh; }
  function displayName(item) { return isEn() ? (item.nameEn || item.name) : item.name; }
  function displayDesc(item) { return isEn() ? (item.descEn || item.desc || 'No record yet.') : (item.desc || '暂无记录'); }

  function localDayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function normalizeCountMap(source, ids) {
    const out = {};
    ids.forEach(id => { out[id] = Math.max(0, Number(source && source[id] || 0)); });
    return out;
  }

  function ingredientById(id) { return INGREDIENTS.find(i => i.id === id) || null; }
  function recipeCount() { return Object.keys(state.save.recipes || {}).filter(id => state.save.recipes[id]).length; }
  function totalDishCount() { return Object.values(state.save.dishInventory || {}).reduce((sum, count) => sum + Math.max(0, Number(count || 0)), 0); }
  function stableHash(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function dailyPriceMultiplier(recipe, day = localDayKey()) {
    const steps = [0.75, 0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40];
    return steps[stableHash(`${day}:${recipe.id}`) % steps.length];
  }
  function dailyDishPrice(recipe, day = localDayKey()) {
    return Math.max(5, Math.round((recipe.price * dailyPriceMultiplier(recipe, day)) / 5) * 5);
  }
  function marketTrend(recipe) {
    const multiplier = dailyPriceMultiplier(recipe);
    if (multiplier >= 1.25) return { name: '火爆', nameEn: 'HOT', color: '#b72820' };
    if (multiplier >= 1.10) return { name: '上涨', nameEn: 'UP', color: '#d66a20' };
    if (multiplier <= 0.85) return { name: '低迷', nameEn: 'LOW', color: '#3576a8' };
    if (multiplier < 1) return { name: '回落', nameEn: 'DOWN', color: '#66727b' };
    return { name: '平稳', nameEn: 'STEADY', color: '#247446' };
  }
  function businessTitleInfo() {
    const revenue = Math.max(0, Number(state.save.lifetimeRevenue || 0));
    let current = BUSINESS_TITLES[0];
    BUSINESS_TITLES.forEach(title => { if (revenue >= title.revenue) current = title; });
    const next = BUSINESS_TITLES.find(title => title.revenue > revenue) || null;
    return { current, next, revenue };
  }
  function hasDailySkill(id) {
    if (!state.save.dailySkills || state.save.dailySkills.date !== localDayKey()) {
      state.save.dailySkills = { date: localDayKey(), ids: [], offers: [], loadout: [] };
      saveGame();
    }
    return state.save.dailySkills.ids.includes(id);
  }

  function dailySkillById(id) { return DAILY_SKILLS.find(skill => skill.id === id) || null; }
  function hasCarriedSkill(id) { return state.runLoadout.includes(id); }

  function generateDailyShopOffers() {
    hasDailySkill('__refresh__');
    const available = DAILY_SKILLS.filter(skill => recipeCount() >= skill.recipes && !hasDailySkill(skill.id));
    const pool = available.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    state.save.dailySkills.offers = pool.slice(0, 3).map(skill => skill.id);
    saveGame();
    return state.save.dailySkills.offers;
  }

  function currentShopSkills() {
    hasDailySkill('__refresh__');
    return (state.save.dailySkills.offers || []).map(dailySkillById).filter(Boolean);
  }

  function skillCooldownRemaining(id) {
    if (id === 'ghostEyeSkill') return Math.max(0, Math.ceil(Number(state.skillReadyAt[id] || 0) - state.t));
    return Math.max(0, Number(state.skillReadyRoom[id] || 0) - state.room);
  }

  function ghostEyeRemaining() {
    return Math.max(0, Number(state.ghostEyeUntil || 0) - state.t);
  }

  function useDailyActiveSkill(id) {
    const skill = dailySkillById(id);
    if (!skill || !hasCarriedSkill(id) || state.screen !== 'game' || state.mode !== 'normal') return false;
    const remaining = skillCooldownRemaining(id);
    if (remaining > 0) {
      setToast(ui(`还需经过 ${remaining} 扇门`, `${remaining} doors until ready`), 1.3);
      return false;
    }
    if (id === 'ghostEyeSkill') {
      state.ghostEyeUntil = state.t + skill.duration;
      state.eyeFx = 1.05;
      state.skillReadyAt[id] = state.t + skill.cooldownSeconds;
      setToast(ui(`透视开启：${skill.duration}秒内看穿门后`, `Ghost Eye reveals doors for ${skill.duration}s`), 1.5);
      return true;
    }
    if (id === 'foresightSkill') {
      if (!canTriggerForesight()) {
        setToast(ui('本局遇见未来的次数已经用完', 'No Foresight uses left this run'), 1.3);
        return false;
      }
      state.skillReadyRoom[id] = state.room + skill.cooldown;
      return startForesightPreview(state.room + 1, 'game');
    }
    return false;
  }

  function petById(id) { return PETS.find(p => p.id === id) || null; }
  function petForAnimal(name) { return PETS.find(p => p.animalName === name) || null; }
  function petSave(id) {
    if (!state.save.pets) state.save.pets = {};
    if (!state.save.pets[id]) state.save.pets[id] = { met: false, count: 0 };
    return state.save.pets[id];
  }
  function emptyRunRewards() {
    return {
      passedDoors: 0,
      spirit: 0,
      talismanDust: 0,
      newPets: [],
      petJoins: {},
      ingredients: {},
      bankedIngredients: {},
      preservedIngredients: {},
      lostIngredients: {}
    };
  }
  function befriendPetByAnimal(person) {
    const pet = petForAnimal(person && person.name);
    if (!pet) return false;
    const ps = petSave(pet.id);
    const first = !ps.met;
    ps.met = true;
    ps.count = Math.max(0, Number(ps.count || 0)) + 1;
    state.runRewards.petJoins[pet.id] = (state.runRewards.petJoins[pet.id] || 0) + 1;
    if (first && !state.runRewards.newPets.includes(pet.id)) state.runRewards.newPets.push(pet.id);
    saveGame();
    setToast(first
      ? ui(`${pet.name}加入了厨房`, `${pet.nameEn} joined the kitchen`)
      : ui(`${pet.name}队伍 +1`, `${pet.nameEn} team +1`), 1.6);
    return true;
  }
  function rewardRoomClear() {
    state.save.spirit = Math.max(0, Number(state.save.spirit || 0)) + 1;
    state.runRewards.passedDoors += 1;
    state.runRewards.spirit += 1;
    saveGame();
  }
  function rewardSealSuccess(content) {
    const count = content && content.ghosts ? content.ghosts.length : 1;
    state.save.talismanDust = Math.max(0, Number(state.save.talismanDust || 0)) + count;
    state.runRewards.talismanDust += count;
    rewardIngredientDrop(content);
    saveGame();
  }

  function ingredientForGhost(ghost) {
    const index = Math.max(0, GHOSTS.findIndex(g => g.name === (ghost && ghost.name)));
    return INGREDIENTS[index % INGREDIENTS.length];
  }

  function rewardIngredientDrop(content) {
    const ghosts = content && content.ghosts ? content.ghosts : [];
    if (!ghosts.length) return;
    const guaranteed = state.freshSealArmed && state.freshSeals > 0;
    if (guaranteed) state.freshSeals -= 1;
    state.freshSealArmed = false;
    const dropChance = hasCarriedSkill('luckyFood') ? 0.76 : 0.58;
    if (!guaranteed && Math.random() >= dropChance) {
      setToast(ui('封印成功，但没有留下食材', 'Sealed, but no ingredient remained'), 1.5);
      return;
    }
    const ingredient = ingredientForGhost(randItem(ghosts));
    state.runRewards.ingredients[ingredient.id] = (state.runRewards.ingredients[ingredient.id] || 0) + 1;
    setToast(ui(`获得食材：${ingredient.name}`, `Ingredient: ${ingredient.nameEn}`), 1.7);
  }

  function countMapEntries(map) {
    return Object.keys(map || {}).reduce((sum, id) => sum + Number(map[id] || 0), 0);
  }

  function copyCountMap(map) {
    const out = {};
    Object.keys(map || {}).forEach(id => {
      const count = Math.max(0, Number(map[id] || 0));
      if (count) out[id] = count;
    });
    return out;
  }

  function bankRunIngredients() {
    const gained = copyCountMap(state.runRewards.ingredients);
    Object.keys(gained).forEach(id => {
      state.save.pantry[id] = (state.save.pantry[id] || 0) + gained[id];
    });
    state.runRewards.bankedIngredients = gained;
    state.runRewards.ingredients = {};
    saveGame();
  }

  function loseRunIngredients() {
    const lost = copyCountMap(state.runRewards.ingredients);
    if (hasCarriedSkill('preserveBag')) {
      const id = Object.keys(lost).find(key => lost[key] > 0);
      if (id) {
        lost[id] -= 1;
        if (lost[id] <= 0) delete lost[id];
        state.save.pantry[id] = (state.save.pantry[id] || 0) + 1;
        state.runRewards.preservedIngredients[id] = 1;
      }
    }
    state.runRewards.lostIngredients = lost;
    state.runRewards.ingredients = {};
  }

  function safeReturnHome() {
    state.runSucceeded = true;
    bankRunIngredients();
    state.resultReason = '见好就收，食材安全带回';
    state.screen = 'result';
    state.mode = 'normal';
    state.draggingDoor = false;
    state.snapTarget = null;
    state.audio.slideTarget = 0;
    state.audio.bossTarget = 0;
    generateDailyShopOffers();
  }

  function assetCandidateUrls(file) {
    const urls = [];
    ASSET_BASES.forEach(base => {
      const src = base + file;
      if (!urls.includes(src)) urls.push(src);
      const enc = encodeURI(src);
      if (!urls.includes(enc)) urls.push(enc);
    });
    return urls;
  }

  function loadImageWithFallback(file) {
    const old = assetCache[file];
    if (old && old.started) return old;
    const record = { started: true, loaded: false, failed: false, img: null, index: 0, candidates: assetCandidateUrls(file) };
    assetCache[file] = record;

    const tryNext = () => {
      if (record.loaded) return;
      if (record.index >= record.candidates.length) {
        record.failed = true;
        assets[file] = null;
        return;
      }
      const img = new Image();
      const src = record.candidates[record.index++];
      img.decoding = 'async';
      img.onload = () => {
        record.loaded = true;
        record.failed = false;
        record.img = img;
        assets[file] = img;
      };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
    return record;
  }

  function getAssetImage(file) {
    let record = assetCache[file];
    if (!record) record = loadImageWithFallback(file);
    if (record.loaded && record.img && record.img.naturalWidth) return record.img;
    return null;
  }

  function preloadFilesList() {
    return Array.from(new Set([
      ROOM_ASSETS.wall, ROOM_ASSETS.room, ROOM_ASSETS.door, ROOM_ASSETS.frame, ROOM_ASSETS.seal, ROOM_ASSETS.talisman,
      ...GHOST_FIRE_FILES,
      ...GHOSTS.map(g => g.file),
      ...GHOSTS.map(g => g.sealFile).filter(Boolean),
      ...PEOPLE.map(p => p.file)
    ]));
  }

  function preloadAll() {
    preloadFilesList().forEach(loadImageWithFallback);
  }

  function preloadProgress() {
    const files = preloadFilesList();
    if (!files.length) return { ratio: 1, loaded: 0, total: 0 };
    let loaded = 0;
    files.forEach(file => {
      const img = getAssetImage(file);
      if (img && img.complete && img.naturalWidth) loaded += 1;
    });
    return { ratio: loaded / files.length, loaded, total: files.length };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    const w = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 390);
    const h = Math.max(520, window.innerHeight || document.documentElement.clientHeight || 760);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.layout = computeLayout(w, h);
  }

  function computeLayout(w, h) {
    // 顶部信息区加高，避免音乐按钮/主页按钮/关卡文字互相压住。
    const topH = Math.max(118, Math.min(138, h * 0.135));
    const bottomH = Math.max(112, Math.min(140, h * 0.15));
    const gameTop = topH;
    const gameBottom = h - bottomH;
    const gameH = gameBottom - gameTop;

    const doorH = clamp(Math.min(gameH * 0.82, w * 1.34, 628), 380, 628);
    const doorW = doorH * 0.582;
    const doorX = (w - doorW) / 2;
    const doorY = gameTop + Math.max(16, (gameH - doorH) * 0.42);

    const door = { x: doorX, y: doorY, w: doorW, h: doorH };
    const hole = { x: doorX, y: doorY, w: doorW, h: doorH };

    return {
      w, h, topH, bottomH, gameTop, gameBottom, gameH,
      door, hole,
      home: { x: 68, y: 18, w: 78, h: 36 },
      galleryButton: { x: w - 88, y: 18, w: 78, h: 36 },
      sealButton: { x: w / 2 - 92, y: h - 124, w: 184, h: 84 },
      bossButton: { x: w / 2 - 136, y: h - 118, w: 272, h: 76 }
    };
  }

  window.addEventListener('resize', resize);
  resize();
  preloadAll();

  function bossStageForRoom(room) { return Math.floor((room - 1) / 25) + 1; }
  function bossWindow(room) {
    const stage = bossStageForRoom(room);
    const end = stage * 25;
    const start = end - 5;
    return { stage, start, end, forced: room === end, active: room >= start && room <= end };
  }
  function bossConfig(stage) {
    return BOSS_CONFIGS[Math.min(stage, BOSS_CONFIGS.length) - 1] || { stage, time: 5.5, seals: 30 };
  }
  function bossGhostForStage(stage) { return GHOSTS[(stage * 2 + 6) % GHOSTS.length]; }
  function ghostByName(name) {
    return GHOSTS.find(g => g.name === name) || GHOSTS[0];
  }

  function zhuyinGhost() {
    return ghostByName('烛阴');
  }

  function zhuyinRareChance(room) {
    // 烛阴一般作为 Boss 存在。普通门里只保留极低概率，让它成为“中了大奖”的特殊事件。
    if (room < 35) return 0;
    if (bossWindow(room).active) return 0;
    return clamp(0.006 + room * 0.000035, 0.006, 0.014);
  }

  function currentStageProgress(room = state.room) {
    const stage = bossStageForRoom(room);
    const index = ((room - 1) % 25) + 1;
    return { stage, index, ratio: index / 25, boss: bossGhostForStage(stage) };
  }


  function ghostCountForRoom(room) {
    if (room < 25) return 1;

    if (room < 50) {
      return Math.random() < 0.34 ? 2 : 1;
    }

    const r = Math.random();
    if (r < 0.22) return 3;
    if (r < 0.58) return 2;
    return 1;
  }

  function pickGhosts(count, room) {
    const unlockCount = clamp(4 + Math.floor(room / 8), 4, GHOSTS.length);
    // 烛阴不进入普通鬼池；它是 Boss 级妖怪，只会在 Boss 或极低概率特殊门中出现。
    const pool = GHOSTS.slice(0, unlockCount).filter(g => g.name !== '烛阴');
    const picked = [];
    while (picked.length < count && pool.length) {
      const g = randItem(pool);
      if (!picked.includes(g)) picked.push(g);
    }
    return picked.length ? picked : [GHOSTS[0]];
  }

  function makeContent(room) {
    const win = bossWindow(room);
    if (win.active && !state.bossDefeated[win.stage]) {
      const chance = win.forced ? 1 : (0.26 + (room - win.start) * 0.11);
      if (Math.random() < chance) {
        const bossGhost = bossGhostForStage(win.stage);
        return { type: 'boss', stage: win.stage, bossGhost, cfg: bossConfig(win.stage), bossSeen: false, hits: 0, talismans: [], forced: win.forced, seen: false, passTimer: 0 };
      }
    }

    // 极低概率：烛阴仍可作为 Boss 级特殊门出现，但封印只结算常规奖励与食材。
    if (Math.random() < zhuyinRareChance(room)) {
      const z = zhuyinGhost();
      return { type: 'ghost', ghosts: [z], requiredSeals: 1, sealed: 0, talismans: [], seen: false, passTimer: 0, rareZhuyin: true };
    }

    const r = Math.random();
    const ghostChance = clamp(0.44 + room * 0.004, 0.44, 0.72);
    const animalChance = room < 8 ? 0.34 : 0.28;

    if (r < ghostChance) {
      const ghosts = pickGhosts(ghostCountForRoom(room), room);
      return { type: 'ghost', ghosts, requiredSeals: ghosts.length, sealed: 0, talismans: [], seen: false, passTimer: 0 };
    }
    if (r < ghostChance + animalChance) {
      return { type: 'person', person: randItem(PEOPLE), talismans: [], seen: false, passTimer: 0 };
    }
    return { type: 'empty', talismans: [], seen: false, passTimer: 0 };
  }


  function takeContentForRoom(room) {
    if (state.futureQueue && state.futureQueue.length && state.futureQueue[0].room === room) {
      return state.futureQueue.shift().content;
    }
    return makeContent(room);
  }

  function canTriggerForesight() {
    return state.foresight && state.foresight.used < state.foresight.maxPerRun;
  }

  function startForesightPreview(startRoom, returnTo = 'game') {
    if (!canTriggerForesight()) return false;

    state.foresight.active = true;
    state.foresight.phase = 'prepare';
    state.foresight.index = 0;
    state.foresight.timer = 0;
    state.foresight.used += 1;
    state.foresight.returnTo = returnTo;

    const count = state.foresight.count || 5;
    state.futureQueue = [];
    for (let i = 0; i < count; i++) {
      const room = startRoom + i;
      state.futureQueue.push({ room, content: makeContent(room) });
    }

    state.screen = 'foresight';
    state.draggingDoor = false;
    state.snapTarget = null;
    setToast(null);
    return true;
  }

  function finishForesightPreview() {
    state.foresight.active = false;
    state.foresight.index = 0;
    state.foresight.timer = 0;

    if (state.foresight.returnTo === 'bossAdvance') {
      state.screen = 'game';
      startCorridorAdvance(state.pendingNextRoom || state.room + 1);
      return;
    }

    state.screen = 'game';
    setToast(ui('烛照结束，记住你看到的门', 'Foresight ended. Remember the doors.'), 1.5);
  }

  function updateForesight(dt) {
    const f = state.foresight;
    f.timer += dt;

    if (f.phase === 'prepare') {
      if (f.timer >= f.prepareTime) {
        f.phase = 'fly';
        f.timer = 0;
        f.index = 0;
      }
      return;
    }

    if (f.phase === 'fly') {
      const totalFly = Math.max(0.1, (state.futureQueue.length || f.count) * f.perDoorTime);
      const p = clamp(f.timer / totalFly, 0, 1);
      f.index = Math.min(state.futureQueue.length - 1, Math.floor(p * state.futureQueue.length));
      if (f.timer >= totalFly) {
        f.phase = 'return';
        f.timer = 0;
      }
      return;
    }

    if (f.phase === 'return') {
      if (f.timer >= f.returnTime) finishForesightPreview();
    }
  }

  function createContent() {
    state.mode = 'normal';
    state.door = 0;
    state.snapTarget = null;
    state.draggingDoor = false;
    state.danger = 0;
    state.transition = 0;
    state.corridorOffset = 0;
    state.content = takeContentForRoom(state.room);
  }

  function startRun(difficulty, testMode = false) {
    state.screen = 'game';
    state.difficulty = difficulty;
    state.testMode = !!testMode;
    state.audio.doorWasMoving = false;
    state.audio.lastDoor = 0;
    state.audio.ghostCooldown = 0;
    state.room = 1;
    state.mode = 'normal';
    state.door = 0;
    state.danger = 0;
    state.ghostEyeUntil = 0;
    state.eyeFx = 0;
    state.bossDefeated = {};
    state.futureQueue = [];
    state.foresight = { active: false, phase: 'prepare', index: 0, timer: 0, count: 5, perDoorTime: testMode ? 0.58 : 0.46, prepareTime: 1.15, returnTime: 0.65, used: 0, maxPerRun: hasCarriedSkill('foresightSkill') ? 2 : 0, returnTo: 'game' };
    state.runRewards = emptyRunRewards();
    state.freshSealArmed = false;
    state.freshSeals = hasCarriedSkill('freshSeal') ? 1 : 0;
    state.skillReadyRoom = {};
    state.skillReadyAt = {};
    state.reviveUsed = false;
    state.runSucceeded = false;
    state.toast = null;
    state.resultReason = '';
    createContent();
    if (state.testMode) {
      setToast(ui('测试模式已开启；妖怪不会额外赠送技能', 'Test mode active; ghosts grant no skills'), 2.2);
    }
  }

  function markSeenContent() {
    const c = state.content;
    if (!c || c.seen) return;
    c.seen = true;
    if (c.type === 'ghost') c.ghosts.forEach(g => { state.save.ghosts[g.name] = true; });
    if (c.type === 'person') state.save.people[c.person.name] = true;
    if (c.type === 'boss') state.save.ghosts[c.bossGhost.name] = true;
    saveGame();
  }

  function setToast(text, time = 1.4) { state.toast = text ? { text, time } : null; }

  function firstAudioCandidate(kind) {
    const list = AUDIO_FILES[kind] || [];
    return list.length ? list[0] : '';
  }

  function makeAudio(candidates, loop = false, volume = 1) {
    const audio = new Audio();
    audio.loop = loop;
    audio.preload = 'auto';
    audio.volume = 0;
    audio._baseVolume = volume;
    audio._targetVolume = 0;
    audio._srcList = (candidates || []).slice();
    audio._srcIndex = 0;

    const trySrc = () => {
      if (audio._srcIndex >= audio._srcList.length) return;
      audio.src = audio._srcList[audio._srcIndex++];
      try { audio.load(); } catch (e) {}
    };

    audio.onerror = () => {
      if (audio._srcIndex < audio._srcList.length) trySrc();
    };

    trySrc();
    return audio;
  }

  function ensureBgm() {
    if (!state.bgm) state.bgm = makeAudio(AUDIO_FILES.bgm, true, 0.22);
    return state.bgm;
  }

  function ensureBossBgm() {
    if (!state.bossBgm) state.bossBgm = makeAudio(AUDIO_FILES.boss, true, 0.52);
    return state.bossBgm;
  }

  function ensureSlideSfx() {
    if (!state.slideSfx) state.slideSfx = makeAudio(AUDIO_FILES.slide, true, 0.95);
    return state.slideSfx;
  }

  function ensureOpenSfx() {
    if (!state.openSfx) state.openSfx = makeAudio(AUDIO_FILES.open, false, 1.0);
    return state.openSfx;
  }

  function ensureAudioContext() {
    if (state.audioCtx) return state.audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      state.audioCtx = new AC();
      return state.audioCtx;
    } catch (e) {
      return null;
    }
  }

  function unlockAudio() {
    state.audioUnlocked = true;
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try { ctx.resume(); } catch (e) {}
    }
    // 预创建音频对象，后续音效不会因为第一次创建而延迟。
    ensureBgm();
    ensureBossBgm();
    ensureSlideSfx();
    ensureOpenSfx();
  }

  function sfxAllowed() {
    return state.sfxOn !== false && state.audioUnlocked !== false;
  }

  function safePlay(audio) {
    if (!audio) return;
    try {
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  function fadeAudio(audio, target, dt, speed = 1.8) {
    if (!audio) return;
    const base = audio._baseVolume || 1;
    const targetVol = clamp(target * base, 0, base);
    const current = Number.isFinite(audio.volume) ? audio.volume : 0;
    const step = speed * dt;
    const next = current + clamp(targetVol - current, -step, step);
    audio.volume = clamp(next, 0, base);

    if (target > 0.001 && audio.paused) safePlay(audio);
    if (target <= 0.001 && audio.volume <= 0.01 && !audio.paused) {
      try { audio.pause(); } catch (e) {}
    }
  }

  function desiredMusicKind() {
    return state.screen === 'game' && state.mode === 'bossFight' ? 'boss' : 'normal';
  }

  function updateMusicFade(dt) {
    // duck 会在门声/开关门声/鬼叫声出现时短暂压低BGM，让音效更明显。
    state.audio.duck = Math.max(0, (state.audio.duck || 0) - dt);

    const duckFactor = state.audio.duck > 0 ? 0.38 : 1;

    if (!state.musicOn) {
      state.audio.normalTarget = 0;
      state.audio.bossTarget = 0;
    } else {
      const kind = desiredMusicKind();
      state.audio.currentMusic = kind;
      state.audio.normalTarget = kind === 'normal' ? duckFactor : 0;
      state.audio.bossTarget = kind === 'boss' ? Math.max(0.55, duckFactor) : 0;
    }

    fadeAudio(ensureBgm(), state.audio.normalTarget, dt, 0.82);
    fadeAudio(ensureBossBgm(), state.audio.bossTarget, dt, 1.05);
  }

  function updateDoorSound(dt) {
    const slide = ensureSlideSfx();
    const d = state.door || 0;
    const moved = Math.abs(d - (state.audio.lastDoor || 0)) > 0.002;
    const moving = state.screen === 'game'
      && (state.mode === 'normal' || state.mode === 'bossFight')
      && (state.draggingDoor || state.snapTarget !== null || moved);

    if (!sfxAllowed() || !moving) {
      state.audio.slideTarget = 0;
    } else {
      state.audio.slideTarget = 1;
      state.audio.duck = Math.max(state.audio.duck || 0, 0.18);
    }

    fadeAudio(slide, state.audio.slideTarget, dt, 6.0);

    if (sfxAllowed() && state.audio.doorWasMoving && !moving) {
      if (d <= 0.045 || d >= 0.955) playOpenDoorSound();
    }

    state.audio.doorWasMoving = moving;
    state.audio.lastDoor = d;
  }

  function updateAudio(dt) {
    if (state.audio.ghostCooldown > 0) state.audio.ghostCooldown = Math.max(0, state.audio.ghostCooldown - dt);
    if (state.audio.sealSfxCooldown > 0) state.audio.sealSfxCooldown = Math.max(0, state.audio.sealSfxCooldown - dt);
    updateMusicFade(dt);
    updateDoorSound(dt);
  }

  function toggleMusic() {
    unlockAudio();
    state.musicOn = !state.musicOn;

    const bgm = ensureBgm();
    const boss = ensureBossBgm();

    if (state.musicOn) {
      state.audio.normalTarget = desiredMusicKind() === 'normal' ? 1 : 0;
      state.audio.bossTarget = desiredMusicKind() === 'boss' ? 1 : 0;
      safePlay(bgm);
      if (desiredMusicKind() === 'boss') safePlay(boss);
      setToast(ui('音乐已开启', 'Music on'), 1.0);
    } else {
      state.audio.normalTarget = 0;
      state.audio.bossTarget = 0;
      setToast(ui('音乐已关闭，音效保留', 'Music off, SFX stay on'), 1.2);
    }
  }

  function playOpenDoorSound() {
    if (!sfxAllowed()) return;
    const audio = ensureOpenSfx();
    if (!audio) return;
    state.audio.duck = Math.max(state.audio.duck || 0, 0.42);
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      safePlay(audio);
    } catch (e) {}
  }

  function playSealSuccessSfx() {
    if (!sfxAllowed()) return;
    if (state.audio.sealSfxCooldown > 0) return;
    state.audio.sealSfxCooldown = 0.18;
    state.audio.duck = Math.max(state.audio.duck || 0, 0.82);

    const ctx = ensureAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.72, now + 0.018);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
      master.connect(ctx.destination);

      // 第一段：贴符“啪”的命中感。
      const snapBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.055), ctx.sampleRate);
      const snapData = snapBuffer.getChannelData(0);
      for (let i = 0; i < snapData.length; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / snapData.length, 3);
      }
      const snap = ctx.createBufferSource();
      snap.buffer = snapBuffer;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(2100, now);
      snapFilter.Q.setValueAtTime(2.4, now);
      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.48, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      snap.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snap.start(now);
      snap.stop(now + 0.075);

      // 第二段：上扬的法术铃音，强化“封住了”的爽感。
      const freqs = [392, 523.25, 659.25, 987.77, 1318.51];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i < 2 ? 'triangle' : 'sine';
        const st = now + 0.045 + i * 0.032;
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.exponentialRampToValueAtTime(f * 1.18, st + 0.32);
        gain.gain.setValueAtTime(0.0001, st);
        gain.gain.exponentialRampToValueAtTime(i < 2 ? 0.34 : 0.20, st + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.72);
        osc.connect(gain);
        gain.connect(master);
        osc.start(st);
        osc.stop(st + 0.82);
      });

      // 第三段：低频短冲击，让成功音更“落地”。
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(94, now + 0.025);
      thump.frequency.exponentialRampToValueAtTime(42, now + 0.18);
      thumpGain.gain.setValueAtTime(0.28, now + 0.025);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      thump.connect(thumpGain);
      thumpGain.connect(master);
      thump.start(now + 0.025);
      thump.stop(now + 0.26);

      // 尾巴：一点亮闪，避免听起来太干。
      const shimmerBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
      const shimmerData = shimmerBuffer.getChannelData(0);
      for (let i = 0; i < shimmerData.length; i++) {
        shimmerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / shimmerData.length, 1.7);
      }
      const shimmer = ctx.createBufferSource();
      shimmer.buffer = shimmerBuffer;
      const high = ctx.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.setValueAtTime(2800, now);
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.12, now + 0.08);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      shimmer.connect(high);
      high.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start(now + 0.08);
      shimmer.stop(now + 0.5);
    } catch (e) {}
  }

  function playSealFailSfx() {
    if (!sfxAllowed()) return;
    if (state.audio.sealSfxCooldown > 0) return;
    state.audio.sealSfxCooldown = 0.2;
    state.audio.duck = Math.max(state.audio.duck || 0, 0.68);

    const ctx = ensureAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.46, now + 0.03);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
      master.connect(ctx.destination);

      // 沉下去的错误/封印失败感。
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.58);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.55);
      filter.Q.setValueAtTime(6, now);

      osc.connect(filter);
      filter.connect(master);
      osc.start(now);
      osc.stop(now + 0.72);

      const thud = ctx.createOscillator();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(74, now + 0.02);
      thud.frequency.exponentialRampToValueAtTime(38, now + 0.32);
      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.36, now + 0.02);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      thud.connect(thudGain);
      thudGain.connect(master);
      thud.start(now + 0.02);
      thud.stop(now + 0.42);
    } catch (e) {}
  }

  function playGhostEscapeSfx() {
    if (!sfxAllowed()) return;
    state.audio.duck = Math.max(state.audio.duck || 0, 0.95);

    const ctx = ensureAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.66, now + 0.035);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      master.connect(ctx.destination);

      // 更大、更直接的鬼叫：上来一声尖叫，然后快速下坠。
      const screamFilter = ctx.createBiquadFilter();
      screamFilter.type = 'bandpass';
      screamFilter.frequency.setValueAtTime(920, now);
      screamFilter.frequency.exponentialRampToValueAtTime(140, now + 1.18);
      screamFilter.Q.setValueAtTime(12, now);
      screamFilter.connect(master);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(360, now);
      osc1.frequency.exponentialRampToValueAtTime(54, now + 1.24);
      osc1.connect(screamFilter);
      osc1.start(now);
      osc1.stop(now + 1.38);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(185, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(42, now + 1.25);
      osc2.connect(screamFilter);
      osc2.start(now + 0.02);
      osc2.stop(now + 1.38);

      // 气流/嘶吼噪声，让它像鬼扑出来，而不是电子错误音。
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.1), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 0.8);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(680, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(110, now + 1.0);
      noiseFilter.Q.setValueAtTime(3.5, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.34, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.12);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(now);
      noise.stop(now + 1.12);

      // 一下低频冲击，表示“冲出来了”。
      const hit = ctx.createOscillator();
      const hitGain = ctx.createGain();
      hit.type = 'sine';
      hit.frequency.setValueAtTime(82, now + 0.06);
      hit.frequency.exponentialRampToValueAtTime(36, now + 0.33);
      hitGain.gain.setValueAtTime(0.46, now + 0.06);
      hitGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      hit.connect(hitGain);
      hitGain.connect(master);
      hit.start(now + 0.06);
      hit.stop(now + 0.45);
    } catch (e) {}
  }

  function playGhostHowl() {
    if (!sfxAllowed()) return;
    if (state.audio.ghostCooldown > 0) return;
    state.audio.ghostCooldown = 1.1;

    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      state.audio.duck = Math.max(state.audio.duck || 0, 0.75);

      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, now);
      out.gain.exponentialRampToValueAtTime(0.42, now + 0.05);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 1.22);
      out.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(760, now);
      filter.frequency.exponentialRampToValueAtTime(105, now + 1.05);
      filter.Q.setValueAtTime(10, now);
      filter.connect(out);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(230, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 1.1);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + 1.25);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(94, now);
      osc2.frequency.exponentialRampToValueAtTime(38, now + 1.12);
      osc2.connect(filter);
      osc2.start(now + 0.03);
      osc2.stop(now + 1.25);

      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.95, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.11, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      noise.connect(filter);
      noise.start(now + 0.02);
      noise.stop(now + 0.95);
    } catch (e) {}
  }

  function maybePlayGhostDoorSound(c) {
    if (!c || c.ghostVoicePlayed) return;
    if (c.type !== 'ghost' && c.type !== 'boss') return;
    if (state.door <= 0.08) return;
    c.ghostVoicePlayed = true;
    playGhostHowl();
  }

  function startCorridorAdvance(toRoom = state.room + 1) {
    state.mode = 'corridorTransition';
    state.transition = 0;
    state.transitionStartDoor = state.door;
    state.corridorOffset = 0;
    state.pendingNextRoom = toRoom;
    state.nextContent = takeContentForRoom(toRoom);
    state.danger = 0;
    state.draggingDoor = false;
    state.snapTarget = null;
    state.audio.slideTarget = 0;
    state.audio.doorWasMoving = false;
    state.audio.lastDoor = 0;
    state.save.bestRoom = Math.max(state.save.bestRoom || 1, toRoom);
    rewardRoomClear();
    saveGame();
  }

  function finishCorridorAdvance() {
    state.room = state.pendingNextRoom;
    state.content = state.nextContent;
    state.nextContent = null;
    state.mode = 'normal';
    state.transition = 0;
    state.corridorOffset = 0;
    state.door = 0;
    state.danger = 0;
    state.sealFlash = 0;
    state.audio.lastDoor = 0;
    state.audio.doorWasMoving = false;
  }

  function gameOver(reason) {
    const reasonText = String(reason || '');
    if (!state.reviveUsed && hasCarriedSkill('revive') && (reasonText.includes('鬼冲出来') || reasonText.includes('Boss冲出来'))) {
      state.reviveUsed = true;
      state.door = state.mode === 'bossFight' ? 0.18 : 0;
      state.danger = 0;
      state.draggingDoor = false;
      state.snapTarget = null;
      setToast(ui('替身纸人碎裂：本局复活一次', 'Paper Double: revived once this run'), 2.0);
      return;
    }
    if (reasonText.includes('鬼冲出来') || reasonText.includes('Boss冲出来')) {
      playGhostEscapeSfx();
    } else {
      playSealFailSfx();
    }
    state.resultReason = reason;
    state.runSucceeded = false;
    loseRunIngredients();
    state.save.bestRoom = Math.max(state.save.bestRoom || 1, state.room);
    saveGame();
    state.screen = 'result';
    state.mode = 'normal';
    state.draggingDoor = false;
    state.snapTarget = null;
    state.audio.slideTarget = 0;
    state.audio.bossTarget = 0;
    generateDailyShopOffers();
  }

  function ghostDangerSpeed(g) {
    const typeBoost = g.type === 'thin' ? 1.18 : g.type === 'heavy' ? 0.92 : 1;
    return (g.speed || 1) * typeBoost;
  }

  function ghostApproachStep() {
    const raw = clamp(state.danger, 0, 1);
    const steps = 7;
    const index = Math.floor(raw * steps);
    const local = raw * steps - index;
    const kick = Math.sin(local * Math.PI) * 0.055;
    return clamp(index / steps + kick, 0, 1);
  }

  function beginBossFight() {
    state.mode = 'bossFight';
    state.door = 0.06;
    state.snapTarget = null;
    state.danger = 0;
    state.audio.slideTarget = 0;
    state.audio.doorWasMoving = false;
    setToast('Boss开始顶门！', 1.1);
  }

  function updateBossFight(dt) {
    const c = state.content;
    if (!c || c.type !== 'boss') return;
    const hpRatio = 1 - c.hits / c.cfg.seals;
    const panicBoost = hpRatio < 0.3 ? 1.25 : 1.08;
    const hardBoost = state.difficulty === 'normal' ? 1.22 : 1;
    state.door += dt / c.cfg.time * panicBoost * hardBoost;
    state.door = clamp(state.door, 0, 1);
    if (state.door >= 1) {
      if (c.forced) gameOver('强制Boss战失败，Boss冲出来了');
      else {
        playGhostEscapeSfx();
        setToast('Boss逃走了', 1.1);
        startCorridorAdvance(state.room + 1);
      }
    }
  }

  function handleSealClick() {
    if (state.screen !== 'game' || state.mode !== 'normal') return;
    const c = state.content;
    if (!c) return;

    if (c.type === 'person') return gameOver('封错了，它只是普通小动物');
    if (c.type === 'empty') return gameOver('封错了，这间房是空的');

    if (c.type === 'boss') {
      if (!c.bossSeen) setToast('先开门确认');
      else setToast('关门后才能开始贴符');
      return;
    }

    if (c.type !== 'ghost') return;
    if (state.door > 0.08) {
      setToast('先把门关上');
      return;
    }

    c.sealed += 1;
    c.talismans.push(randomTalisman(true));
    state.sealFlash = 0.01;

    if (c.sealed >= c.requiredSeals) {
      playSealSuccessSfx();
      rewardSealSuccess(c);
      state.mode = 'sealSuccess';
      state.pendingNextRoom = state.room + 1;
      c.sealRevealBorn = state.t;
    } else {
      setToast('符咒贴上去了');
    }
  }

  function handleBossSealClick() {
    const c = state.content;
    if (!c || c.type !== 'boss' || state.mode !== 'bossFight') return;
    c.hits += 1;
    c.talismans.push(randomTalisman());
    state.door = Math.max(0, state.door - 0.13);
    state.sealFlash = 0.01;
    if (c.hits >= c.cfg.seals) {
      playSealSuccessSfx();
      const bossDust = Math.max(3, c.stage + 2);
      state.save.talismanDust = Math.max(0, Number(state.save.talismanDust || 0)) + bossDust;
      state.runRewards.talismanDust += bossDust;
      saveGame();
      state.bossDefeated[c.stage] = true;
      state.pendingNextRoom = c.stage * 25 + 1;
      state.mode = 'normal';
      state.door = 0;

      // 妖怪只结算常规奖励；所有技能效果都必须来自本局携带。
      startCorridorAdvance(state.pendingNextRoom);
      setToast(null);
    }
  }

  function randomTalisman(avoidSealMark = false) {
    const make = () => ({ rx: 0.18 + Math.random() * 0.64, ry: 0.14 + Math.random() * 0.68, rot: (Math.random() - 0.5) * 0.7, scale: 0.72 + Math.random() * 0.38, born: state.t });
    if (!avoidSealMark) return make();
    for (let i = 0; i < 10; i++) {
      const t = make();
      if (t.rx < 0.28 || t.rx > 0.72 || t.ry > 0.47) return t;
    }
    return { rx: Math.random() < 0.5 ? 0.20 + Math.random() * 0.08 : 0.72 + Math.random() * 0.08, ry: 0.42 + Math.random() * 0.34, rot: (Math.random() - 0.5) * 0.7, scale: 0.72 + Math.random() * 0.38, born: state.t };
  }

  function update(dt) {
    state.t += dt;
    updateAudio(dt);
    finishKitchenJobIfReady();

    if (state.screen === 'preload') {
      state.preloadElapsed += dt;
      const p = preloadProgress();
      const ready = p.ratio >= 0.98 || state.preloadElapsed >= state.preloadMax;
      if (state.preloadElapsed >= state.preloadMin && ready) {
        state.screen = 'menu';
      }
      return;
    }

    if (state.screen === 'foresight') {
      updateForesight(dt);
      return;
    }

    if (state.toast) {
      state.toast.time -= dt;
      if (state.toast.time <= 0) state.toast = null;
    }
    if (state.kitchenCookFx > 0) state.kitchenCookFx = Math.max(0, state.kitchenCookFx - dt);
    if (state.eyeFx > 0 && state.screen === 'game') state.eyeFx = Math.max(0, state.eyeFx - dt);

    if (state.screen !== 'game') return;

    if (state.mode === 'corridorTransition') {
      state.transition += dt * 1.42;
      const t = easeInOut(clamp(state.transition, 0, 1));
      state.corridorOffset = -state.layout.w * t;
      if (state.transition >= 1) finishCorridorAdvance();
      return;
    }

    if (state.mode === 'sealSuccess') {
      state.sealFlash += dt;
      if (state.sealFlash >= 0.62) startCorridorAdvance(state.pendingNextRoom || state.room + 1);
      return;
    }

    if (state.snapTarget !== null && !state.draggingDoor && state.mode === 'normal') {
      const direction = state.snapTarget > state.door ? 1 : -1;
      const speed = state.difficulty === 'normal' ? 2.85 : 2.20;
      state.door += direction * speed * dt;
      if ((direction > 0 && state.door >= state.snapTarget) || (direction < 0 && state.door <= state.snapTarget)) {
        state.door = state.snapTarget;
        state.snapTarget = null;
      }
      state.door = clamp(state.door, 0, 1);
    }

    const c = state.content;
    if (!c) return;
    if (state.door > 0.08) {
      markSeenContent();
      maybePlayGhostDoorSound(c);
    }

    if (state.mode === 'bossFight') return updateBossFight(dt);

    if (c.type === 'ghost') {
      if (state.door > 0.055) {
        const newbieEase = state.room <= 3 ? 0.64 : state.room <= 6 ? 0.84 : 1;
        const base = (0.62 + Math.min(state.room, 90) * 0.0066) * newbieEase;
        const speediest = Math.max(...c.ghosts.map(ghostDangerSpeed));
        const multi = 1 + (c.ghosts.length - 1) * 0.34;
        const easySlow = state.difficulty === 'easy' && c.ghosts.some(g => g.type === 'thin') ? 0.92 : 1;
        const hardBoost = state.difficulty === 'normal' ? 1.38 : 1;
        const openFactor = 0.95 + state.door * 1.05;
        state.danger += dt * base * speediest * multi * easySlow * hardBoost * openFactor;
      } else {
        state.danger = 0;
      }
      if (state.danger >= 1) gameOver('门开太久，鬼冲出来了');
    } else if (c.type === 'person' || c.type === 'empty') {
      if (state.door >= 0.92) {
        c.passTimer += dt;
        // 多停一瞬间，让玩家感到“看清并通过”，不是门突然合上切走。
        const passDelay = c.type === 'person' ? 0.45 : 0.18;
        if (c.passTimer > passDelay) {
          if (c.type === 'person') befriendPetByAnimal(c.person);
          startCorridorAdvance(state.room + 1);
        }
      } else {
        c.passTimer = 0;
      }
    } else if (c.type === 'boss') {
      if (state.door > 0.12) c.bossSeen = true;
      if (c.bossSeen && state.door < 0.04 && !state.draggingDoor && state.snapTarget === null) beginBossFight();
    }
  }

  function getPointer(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function hit(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function inflate(r, px, py = px) { return { x: r.x - px, y: r.y - py, w: r.w + px * 2, h: r.h + py * 2 }; }
  function setPressed(id) { state.pressed = id; }
  function isPressed(id) { return state.pointer.down && state.pressed === id; }

  function onPointerDown(e) {
    e.preventDefault();
    const p = getPointer(e);
    state.pointer = { x: p.x, y: p.y, down: true };
    state.pressed = null;
    unlockAudio();

    if (state.layout && hit(p, inflate(musicButtonRect(), 8))) {
      setPressed('music');
      toggleMusic();
      return;
    }

    if (state.screen === 'menu') return handleMenuDown(p);
    if (state.screen === 'prepare') return handlePrepareDown(p);
    if (state.screen === 'shop') return handleSkillShopDown(p);
    if (state.screen === 'rules') return handleRulesDown(p);
    if (state.screen === 'gallery') return handleGalleryDown(p);
    if (state.screen === 'pets') return handlePetsDown(p);
    if (state.screen === 'result') return handleResultDown(p);
    if (state.screen !== 'game') return;

    const l = state.layout;

    if (hit(p, inflate(l.home, 8, 8))) {
      setPressed('home');
      safeReturnHome();
      return;
    }
    if (hit(p, inflate(l.galleryButton, 8, 8))) {
      setPressed('galleryTop');
      state.lastScreen = 'game';
      state.screen = 'gallery';
      state.draggingDoor = false;
      return;
    }

    if (state.mode === 'bossFight') {
      if (hit(p, inflate(l.bossButton, 26, 24))) {
        setPressed('bossSeal');
        handleBossSealClick();
      }
      return;
    }

    if (state.mode !== 'normal') return;

    for (const r of runSkillButtonRects()) {
      if (!hit(p, inflate(r, 7, 6))) continue;
      setPressed(`runSkill-${r.id}`);
      if (r.id === 'freshSeal') {
        if (state.freshSeals <= 0) {
          state.freshSealArmed = false;
          setToast(ui('本局封鲜符已经用完', 'No Fresh Seals left this run'), 1.2);
        } else {
          state.freshSealArmed = !state.freshSealArmed;
          setToast(state.freshSealArmed
            ? ui('封鲜符已准备：下次成功封印必得食材', 'Fresh Seal armed: next seal guarantees food')
            : ui('已取消封鲜符', 'Fresh Seal cancelled'), 1.4);
        }
      } else {
        useDailyActiveSkill(r.id);
      }
      return;
    }

    if (hit(p, inflate(l.sealButton, 22, 20))) {
      setPressed('seal');
      handleSealClick();
      return;
    }

    const dragZone = { x: l.door.x - 46, y: l.door.y - 26, w: l.door.w + 92, h: l.door.h + 52 };
    if (hit(p, dragZone)) {
      state.draggingDoor = true;
      state.dragStartX = p.x;
      state.dragStartDoor = state.door;
      state.snapTarget = null;
      if (sfxAllowed()) {
        state.audio.duck = Math.max(state.audio.duck || 0, 0.18);
        const slide = ensureSlideSfx();
        if (slide) {
          slide.volume = Math.max(slide.volume || 0, 0.35);
          safePlay(slide);
        }
      }
    }
  }

  function onPointerMove(e) {
    const p = getPointer(e);
    state.pointer.x = p.x;
    state.pointer.y = p.y;

    if (state.screen === 'rules' && state.rulesDragging) {
      e.preventDefault();
      state.rulesScroll = clamp(state.rulesDragStartScroll + (state.rulesDragStartY - p.y), 0, maxRulesScroll());
      return;
    }

    if (state.screen === 'gallery' && state.galleryDragging) {
      e.preventDefault();
      state.galleryScroll = clamp(state.galleryDragStartScroll + (state.galleryDragStartY - p.y), 0, maxGalleryScroll());
      return;
    }

    if (state.screen === 'pets' && state.kitchenView === 'cook' && state.kitchenDrag) {
      e.preventDefault();
      state.kitchenDrag.x = p.x;
      state.kitchenDrag.y = p.y;
      if (Math.hypot(p.x - state.kitchenDrag.startX, p.y - state.kitchenDrag.startY) > 8) state.kitchenDrag.moved = true;
      return;
    }

    if (state.screen === 'pets' && state.petDragging) {
      e.preventDefault();
      state.petScroll = clamp(state.petDragStartScroll + (state.petDragStartY - p.y), 0, maxPetScroll());
      return;
    }

    if (!state.draggingDoor || state.screen !== 'game' || state.mode !== 'normal') return;
    e.preventDefault();
    const l = state.layout;
    const dx = state.dragStartX - p.x;
    state.door = clamp(state.dragStartDoor + dx / (l.door.w * 0.58), 0, 1);
  }

  function onPointerUp(e) {
    const p = getPointer(e);

    if (state.screen === 'pets' && state.kitchenView === 'cook' && state.kitchenDrag) finishKitchenDrag(p);
    state.pointer = { x: p.x, y: p.y, down: false };
    state.pressed = null;
    if (state.rulesDragging) state.rulesDragging = false;
    if (state.galleryDragging) state.galleryDragging = false;
    if (state.petDragging) state.petDragging = false;
    if (state.draggingDoor) {
      state.draggingDoor = false;
      state.snapTarget = state.door > 0.46 ? 1 : 0;
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
  canvas.addEventListener('wheel', e => {
    if (state.screen === 'rules') {
      e.preventDefault();
      state.rulesScroll = clamp(state.rulesScroll + e.deltaY, 0, maxRulesScroll());
    } else if (state.screen === 'gallery') {
      e.preventDefault();
      state.galleryScroll = clamp(state.galleryScroll + e.deltaY, 0, maxGalleryScroll());
    } else if (state.screen === 'pets' && state.kitchenView === 'chefs') {
      e.preventDefault();
      state.petScroll = clamp(state.petScroll + e.deltaY, 0, maxPetScroll());
    }
  }, { passive: false });

  function menuButtons() {
    const l = state.layout;
    const bw = Math.min(286, l.w * 0.72);
    const bh = 58;
    const x = (l.w - bw) / 2;
    const y = Math.max(l.h * 0.47, l.h * 0.17 + 238);
    return {
      start: { x, y, w: bw, h: bh },
      rules: { x, y: y + 70, w: bw, h: bh },
      pets: { x, y: y + 140, w: bw, h: bh },
      gallery: { x, y: y + 210, w: bw, h: bh },
      lang: { x: l.w - 82, y: 18, w: 64, h: 36 }
    };
  }

  function handleMenuDown(p) {
    const b = menuButtons();
    if (hit(p, inflate(b.lang, 8))) {
      setPressed('lang');
      state.lang = state.lang === 'zh' ? 'en' : 'zh';
      return;
    }
    if (hit(p, inflate(b.start, 10))) {
      setPressed('start');
      openRunPreparation();
    } else if (hit(p, inflate(b.rules, 10))) {
      setPressed('rules');
      state.screen = 'rules';
    } else if (hit(p, inflate(b.pets, 10))) {
      setPressed('pets');
      state.petScroll = 0;
      state.kitchenView = 'cook';
      state.save.petHouseSeen = true;
      saveGame();
      state.screen = 'pets';
    } else if (hit(p, inflate(b.gallery, 10))) {
      setPressed('gallery');
      state.lastScreen = 'menu';
      state.screen = 'gallery';
    }
  }

  function openRunPreparation() {
    hasDailySkill('__refresh__');
    const owned = state.save.dailySkills.ids || [];
    const saved = state.save.dailySkills.loadout || [];
    state.runLoadout = sanitizeLoadout(saved, owned);
    state.screen = 'prepare';
  }

  function openSkillShop(returnTo = 'result') {
    hasDailySkill('__refresh__');
    state.shopReturnTo = returnTo;
    state.kitchenDrag = null;
    state.screen = 'shop';
  }

  function prepareSkillRects() {
    const l = state.layout;
    const owned = (state.save.dailySkills.ids || []).map(dailySkillById).filter(Boolean);
    const gap = 12;
    const margin = 20;
    const w = (l.w - margin * 2 - gap) / 2;
    const compact = l.h < 720;
    const cardH = compact ? 70 : 84;
    const activeY = compact ? 208 : 222;
    const supportY = compact ? 318 : 364;
    const rowGap = compact ? 8 : 8;
    const make = (skills, group, startY) => skills.map((skill, i) => ({
      skill,
      group,
      x: margin + (i % 2) * (w + gap),
      y: startY + Math.floor(i / 2) * (cardH + rowGap),
      w,
      h: cardH
    }));
    return [
      ...make(owned.filter(skill => skillLoadoutGroup(skill) === 'active'), 'active', activeY),
      ...make(owned.filter(skill => skillLoadoutGroup(skill) === 'support'), 'support', supportY)
    ];
  }

  function prepareButtons() {
    const l = state.layout;
    const w = Math.min(280, l.w - 44);
    const x = (l.w - w) / 2;
    return {
      start: { x, y: l.h - 138, w, h: 54 },
      back: { x, y: l.h - 72, w, h: 46 }
    };
  }

  function handlePrepareDown(p) {
    for (const r of prepareSkillRects()) {
      if (!hit(p, inflate(r, 5))) continue;
      const id = r.skill.id;
      const selected = state.runLoadout.includes(id);
      if (selected) state.runLoadout = state.runLoadout.filter(item => item !== id);
      else {
        const group = skillLoadoutGroup(r.skill);
        const count = state.runLoadout.filter(item => skillLoadoutGroup(dailySkillById(item)) === group).length;
        if (count < LOADOUT_LIMITS[group]) state.runLoadout.push(id);
        else if (group === 'active') setToast(ui('主动技能槽只有 1 格', 'Only 1 active skill slot'), 1.3);
        else setToast(ui('被动/触发技能槽最多 2 格', 'Up to 2 passive/trigger slots'), 1.3);
      }
      state.save.dailySkills.loadout = state.runLoadout.slice();
      saveGame();
      setPressed(`prepare-${id}`);
      return;
    }
    const buttons = prepareButtons();
    if (hit(p, inflate(buttons.start, 8))) {
      setPressed('prepareStart');
      state.save.dailySkills.loadout = state.runLoadout.slice();
      saveGame();
      startRun('normal', false);
    } else if (hit(p, inflate(buttons.back, 8))) {
      setPressed('prepareBack');
      state.screen = 'menu';
    }
  }

  function handleRulesDown(p) {
    const back = backButtonRect();
    if (hit(p, inflate(back, 8))) {
      setPressed('back');
      state.screen = 'menu';
      state.rulesDragging = false;
      return;
    }
    const panel = rulesPanelRect();
    if (hit(p, panel)) {
      state.rulesDragging = true;
      state.rulesDragStartY = p.y;
      state.rulesDragStartScroll = state.rulesScroll;
    }
  }

  function handleGalleryDown(p) {
    const l = state.layout;
    const back = backButtonRect();
    if (hit(p, inflate(back, 8))) {
      setPressed('back');
      state.screen = state.lastScreen === 'game' ? 'game' : 'menu';
      state.galleryDragging = false;
      return;
    }
    const tabY = 78;
    const tabW = Math.min(146, (l.w - 44) / 2);
    const ghostTab = { x: 18, y: tabY, w: tabW, h: 42 };
    const peopleTab = { x: 28 + tabW, y: tabY, w: tabW, h: 42 };
    if (hit(p, ghostTab)) {
      state.galleryTab = 'ghosts';
      state.galleryScroll = 0;
      return;
    }
    if (hit(p, peopleTab)) {
      state.galleryTab = 'people';
      state.galleryScroll = 0;
      return;
    }
    if (p.y > 126) {
      state.galleryDragging = true;
      state.galleryDragStartY = p.y;
      state.galleryDragStartScroll = state.galleryScroll;
    }
  }

  function petCardRects() {
    const l = state.layout;
    const margin = Math.max(18, l.w * 0.06);
    const y = 150;
    const h = Math.min(156, Math.max(136, l.h * 0.18));
    return PETS.map((pet, i) => ({ pet, x: margin, y: y + i * (h + 14) - state.petScroll, w: l.w - margin * 2, h }));
  }

  function maxPetScroll() {
    const l = state.layout;
    const cardH = Math.min(156, Math.max(136, l.h * 0.18));
    const contentH = PETS.length * (cardH + 14) - 14;
    const viewH = l.h - 150 - 22;
    return Math.max(0, contentH - viewH);
  }

  function handlePetsDown(p) {
    const back = backButtonRect();
    if (hit(p, inflate(back, 8))) {
      setPressed('back');
      if (state.kitchenView === 'chefs' || state.kitchenView === 'market') {
        state.kitchenView = 'cook';
        state.petScroll = 0;
      } else {
        state.screen = 'menu';
      }
      state.petDragging = false;
      return;
    }
    if (state.kitchenView === 'market') {
      for (const r of kitchenMarketCardRects()) {
        if (!hit(p, inflate(r, 5))) continue;
        setPressed(`market-${r.recipe.id}`);
        sellStoredDish(r.recipe.id);
        return;
      }
      return;
    }
    if (state.kitchenView === 'chefs') {
      const rects = petCardRects();
      for (const r of rects) {
        if (!hit(p, inflate(r, 6))) continue;
        const ps = petSave(r.pet.id);
        if (ps.met) {
          setPressed(`pet-${r.pet.id}`);
          setToast(ui(`${r.pet.name}留在厨房帮忙，不进入巡夜`, `${r.pet.nameEn} stays in the kitchen`), 1.4);
        } else {
          setToast(ui('先在门后遇见它', 'Meet it behind a door first'), 1.2);
        }
        return;
      }
      if (p.y > 146) {
        state.petDragging = true;
        state.petDragStartY = p.y;
        state.petDragStartScroll = state.petScroll;
      }
      return;
    }
    if (hit(p, inflate(kitchenPrepareRect(), 7))) {
      setPressed('kitchenPrepare');
      state.kitchenDrag = null;
      openRunPreparation();
      return;
    }
    const shortcuts = kitchenShortcutRects();
    if (hit(p, inflate(shortcuts.chefs, 5))) {
      state.kitchenView = 'chefs';
      state.kitchenDrag = null;
      state.petScroll = 0;
      setPressed('kitchenChefs');
      return;
    }
    if (hit(p, inflate(shortcuts.shop, 5))) {
      setPressed('kitchenShop');
      openSkillShop('pets');
      return;
    }
    if (hit(p, inflate(shortcuts.upgrade, 5))) {
      setPressed('kitchenUpgrade');
      state.kitchenDrag = null;
      upgradeKitchenSlots();
      return;
    }
    handleKitchenCookDown(p);
  }

  function resultActionRects() {
    const l = state.layout;
    const gap = 10;
    const margin = Math.max(20, l.w * 0.07);
    const w = (l.w - margin * 2 - gap) / 2;
    const y = resultButtonsY();
    return {
      shop: { x: margin, y, w, h: 48 },
      kitchen: { x: margin + w + gap, y, w, h: 48 },
      prepare: { x: margin, y: y + 58, w, h: 48 },
      home: { x: margin + w + gap, y: y + 58, w, h: 48 }
    };
  }

  function handleResultDown(p) {
    const actions = resultActionRects();
    if (hit(p, inflate(actions.shop, 8))) {
      setPressed('resultShop');
      openSkillShop('result');
    } else if (hit(p, inflate(actions.kitchen, 8))) {
      setPressed('petsResult');
      state.save.petHouseSeen = true;
      saveGame();
      state.petScroll = 0;
      state.kitchenView = 'cook';
      state.screen = 'pets';
    } else if (hit(p, inflate(actions.prepare, 8))) {
      setPressed('again');
      openRunPreparation();
    } else if (hit(p, inflate(actions.home, 8))) {
      setPressed('homeResult');
      state.screen = 'menu';
    }
  }

  function clear() {
    const l = state.layout;
    ctx.clearRect(0, 0, l.w, l.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, l.w, l.h);
  }

  function draw() {
    clear();
    try {
      if (state.screen === 'preload') drawPreload();
      else if (state.screen === 'menu') drawMenu();
      else if (state.screen === 'prepare') drawPrepare();
      else if (state.screen === 'shop') drawSkillShop();
      else if (state.screen === 'rules') drawRules();
      else if (state.screen === 'gallery') drawGallery();
      else if (state.screen === 'pets') drawPetHouse();
      else if (state.screen === 'foresight') drawForesight();
      else if (state.screen === 'game') drawGame();
      else if (state.screen === 'result') drawResult();
      else drawMenu();

      drawMusicButton();
    } catch (err) {
      drawErrorScreen(err);
    }
  }

  function drawPreload() {
    const l = state.layout;
    const p = preloadProgress();
    const timeRatio = clamp(state.preloadElapsed / Math.max(0.1, state.preloadMin), 0, 1);
    const ratio = clamp(Math.max(p.ratio * 0.92, timeRatio * 0.28), 0, 1);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, l.w, l.h);

    // 加载页只放鬼火，不放门、不放墙，避免和游戏场景混淆。
    const firePositions = [
      [0.24, 0.26, 0.12],
      [0.76, 0.28, 0.10],
      [0.20, 0.72, 0.11],
      [0.82, 0.68, 0.13],
      [0.50, 0.76, 0.09]
    ];
    firePositions.forEach((fp, i) => {
      const img = getAssetImage(GHOST_FIRE_FILES[i % GHOST_FIRE_FILES.length]);
      const x = fp[0] * l.w + Math.sin(state.t * (0.8 + i * 0.08) + i) * 13;
      const y = fp[1] * l.h + Math.cos(state.t * (1.0 + i * 0.07) + i * 1.5) * 15;
      const size = Math.max(34, Math.min(70, l.w * fp[2]));
      ctx.globalAlpha = 0.42 + Math.sin(state.t * 2 + i) * 0.08;
      if (img) ctx.drawImage(img, x - size / 2, y - size * 0.65, size, size * 1.28);
      else drawCodeGhostFire(x, y, size, 0.8);
    });

    ctx.globalAlpha = 1;
    const panelW = Math.min(330, l.w * 0.78);
    const panelH = 176;
    const panelX = (l.w - panelW) / 2;
    const panelY = l.h * 0.36;

    ctx.fillStyle = 'rgba(255,253,246,0.96)';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    roundRect(panelX, panelY, panelW, panelH, 24, true, true, 5);

    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(ui('正在点香……', 'Lighting incense...'), l.w / 2, panelY + 46);

    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    const countText = p.total ? `${p.loaded}/${p.total}` : '';
    ctx.fillText(ui(`准备长廊素材 ${countText}`, `Preparing assets ${countText}`), l.w / 2, panelY + 78);

    const barX = panelX + 34;
    const barY = panelY + 108;
    const barW = panelW - 68;
    const barH = 18;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(barX, barY, barW, barH, 9, true, true, 3);

    ctx.fillStyle = '#111';
    roundRect(barX + 4, barY + 4, Math.max(0, (barW - 8) * ratio), barH - 8, 6, true, false, 0);

    ctx.font = '800 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${Math.round(ratio * 100)}%`, l.w / 2, panelY + 148);

    ctx.restore();
  }

  function drawMenu() {
    const l = state.layout;
    drawMenuBackground();

    const titleW = Math.min(318, l.w * 0.74);
    const titleH = 126;
    const titleX = (l.w - titleW) / 2;
    const titleY = Math.max(112, l.h * 0.155);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(255,253,246,0.94)';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    roundRect(titleX, titleY, titleW, titleH, 24, true, true, 5);

    ctx.fillStyle = '#111';
    ctx.font = isEn() ? '900 28px system-ui, sans-serif' : '900 38px system-ui, sans-serif';
    ctx.fillText(isEn() ? 'TIMID EXORCIST' : '胆小除魔师', l.w / 2, titleY + 54);

    ctx.font = isEn() ? '800 12px system-ui, sans-serif' : '800 14px system-ui, sans-serif';
    ctx.fillText(isEn() ? 'Endless corridor · Open and decide' : '无限长廊 · 开门识别异常', l.w / 2, titleY + 90);

    // 版本号放在标题框外，避免和副标题/边框打架。
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillText(VERSION, l.w / 2, titleY + titleH + 34);
    ctx.restore();

    const b = menuButtons();
    drawMiniButton(b.lang, isEn() ? '中' : 'EN', 'lang');
    drawUIButton(b.start, isEn() ? 'Start' : '开始游戏', '', 'start');
    drawUIButton(b.rules, isEn() ? 'Rules' : '游戏规则', '', 'rules');
    drawPetUnlockPulse(b.pets);
    drawUIButton(b.pets, isEn() ? 'Kitchen' : '厨房', kitchenMenuSub(), 'pets');
    drawUIButton(b.gallery, isEn() ? `Archive ${collectCountText()}` : `图鉴 ${collectCountText()}`, '', 'gallery');

  }

  function drawPrepare() {
    const l = state.layout;
    drawMenuBackground();
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    roundRect(20, 78, l.w - 40, 90, 22, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 30px system-ui, sans-serif';
    ctx.fillText(ui('出发准备', 'Run Loadout'), l.w / 2, 112);
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(ui('主动 1 格 · 被动/触发 2 格', '1 active · 2 passive/trigger'), l.w / 2, 145);
    ctx.restore();

    const rects = prepareSkillRects();
    if (!rects.length) {
      ctx.save();
      ctx.fillStyle = '#777';
      ctx.textAlign = 'center';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText(ui('今日暂无主动技能', 'No active skill today'), l.w / 2, (l.h < 720 ? 247 : 267));
      ctx.fillText(ui('今日暂无被动 / 触发技能，也可以直接出发', 'No support skill today; you may still depart'), l.w / 2, (l.h < 720 ? 357 : 407));
      ctx.restore();
    }
    const compact = l.h < 720;
    const activeCount = state.runLoadout.filter(id => skillLoadoutGroup(dailySkillById(id)) === 'active').length;
    const supportCount = state.runLoadout.filter(id => skillLoadoutGroup(dailySkillById(id)) === 'support').length;
    drawPrepareGroupHeader(compact ? 176 : 180, ui(`主动技能槽 ${activeCount}/1`, `Active slot ${activeCount}/1`), ui('手动点击使用', 'Tap to use'));
    drawPrepareGroupHeader(compact ? 286 : 322, ui(`被动 / 触发槽 ${supportCount}/2`, `Passive / trigger ${supportCount}/2`), ui('携带后自动生效', 'Automatic when carried'));
    rects.forEach(r => drawPrepareSkillCard(r));

    const buttons = prepareButtons();
    drawUIButton(buttons.start, ui('开始巡夜', 'Start Patrol'), ui(`已携带 ${state.runLoadout.length} 个技能`, `${state.runLoadout.length} skills carried`), 'prepareStart');
    drawUIButton(buttons.back, ui('返回门口', 'Back to Entrance'), '', 'prepareBack');
  }

  function drawPrepareGroupHeader(y, title, sub) {
    const l = state.layout;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText(title, 22, y + 13);
    ctx.textAlign = 'right';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(sub, l.w - 22, y + 13);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, y + 26);
    ctx.lineTo(l.w - 20, y + 26);
    ctx.stroke();
    ctx.restore();
  }

  function drawPrepareSkillCard(r) {
    const selected = state.runLoadout.includes(r.skill.id);
    drawPressTransform(r, `prepare-${r.skill.id}`, () => {
      ctx.fillStyle = selected ? '#111' : '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      roundRect(r.x, r.y, r.w, r.h, 16, true, true, 4);
      ctx.fillStyle = selected ? '#fffdf6' : '#111';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '900 14px system-ui, sans-serif';
      ctx.fillText(isEn() ? r.skill.nameEn : r.skill.name, r.x + 10, r.y + 10, r.w - 70);
      ctx.textAlign = 'right';
      ctx.font = '900 9.5px system-ui, sans-serif';
      ctx.fillText(selected ? ui('已装入', 'EQUIPPED') : (r.group === 'active' ? ui('主动', 'ACTIVE') : ui('被动', 'SUPPORT')), r.x + r.w - 10, r.y + 12);
      ctx.textAlign = 'left';
      ctx.font = `${r.h < 80 ? 9.5 : 10}px system-ui, sans-serif`;
      wrapText(isEn() ? r.skill.descEn : r.skill.desc, r.x + 10, r.y + 32, r.w - 20, r.h < 80 ? 12 : 13, 'left');
    });
  }

  function drawMenuBackground() {
    const l = state.layout;

    // 首页彻底去掉背景图：纯白背景 + 鬼火。
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, l.w, l.h);
    ctx.restore();

    drawMenuGhostFires();
  }

  function drawMenuGhostFires() {
    const l = state.layout;
    const positions = [
      [0.18, 0.24, 0.095],
      [0.82, 0.23, 0.090],
      [0.15, 0.76, 0.105],
      [0.84, 0.70, 0.100],
      [0.50, 0.86, 0.060],
      [0.30, 0.48, 0.055],
      [0.70, 0.50, 0.055]
    ];

    ctx.save();
    positions.forEach((p, i) => {
      const img = getAssetImage(GHOST_FIRE_FILES[i % GHOST_FIRE_FILES.length]);
      const x = p[0] * l.w + Math.sin(state.t * (0.9 + i * 0.07) + i) * 12;
      const y = p[1] * l.h + Math.cos(state.t * (1.1 + i * 0.09) + i * 1.7) * 14;
      const size = Math.max(28, Math.min(64, l.w * p[2]));
      ctx.globalAlpha = 0.36 + Math.sin(state.t * 2.1 + i) * 0.06;
      if (img) ctx.drawImage(img, x - size / 2, y - size * 0.65, size, size * 1.28);
      else drawCodeGhostFire(x, y, size, 0.8);
    });
    ctx.restore();
  }

  function drawPetUnlockPulse(r) {
    if (!hasAnyPetMet() || state.save.petHouseSeen) return;
    const p = 0.5 + Math.sin(state.t * 5.2) * 0.5;
    ctx.save();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.26 + p * 0.34;
    roundRect(r.x - 8 - p * 4, r.y - 8 - p * 4, r.w + 16 + p * 8, r.h + 16 + p * 8, 22, false, true, 3);
    ctx.restore();
  }


  function drawForesight() {
    const l = state.layout;
    const f = state.foresight;
    const count = state.futureQueue.length || 1;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, l.w, l.h);

    ctx.beginPath();
    ctx.rect(0, l.topH, l.w, l.h - l.topH);
    ctx.clip();

    if (f.phase === 'prepare') {
      drawCorridorCard(0, state.content, 0);
    } else if (f.phase === 'fly') {
      const totalFly = Math.max(0.1, count * f.perDoorTime);
      const p = clamp(f.timer / totalFly, 0, 1);
      const travel = p * count * l.w;
      drawCorridorCard(-travel, state.content, 0);
      for (let i = 0; i < count; i++) {
        const item = state.futureQueue[i];
        drawForesightMovingCard((i + 1) * l.w - travel, item ? item.content : null);
      }
    } else if (f.phase === 'return') {
      const p = easeInOut(clamp(f.timer / Math.max(0.1, f.returnTime), 0, 1));
      const travel = lerp(count * l.w, 0, p);
      drawCorridorCard(-travel, state.content, 0);
      for (let i = 0; i < count; i++) {
        const item = state.futureQueue[i];
        drawForesightMovingCard((i + 1) * l.w - travel, item ? item.content : null);
      }
    }

    ctx.restore();
    drawForesightOverlay();
  }

  function drawForesightMovingCard(offset, content) {
    const l = state.layout;
    ctx.save();
    ctx.translate(offset, 0);
    ctx.beginPath();
    ctx.rect(0, l.topH, l.w, l.h - l.topH);
    ctx.clip();
    drawWallBackground();
    drawRoomBack(l.hole);
    drawContentFor(content, l.door, l.hole);
    drawWallMask();
    drawDoorFrame(l.hole);
    drawBossGlow(content, l.hole);
    ctx.restore();
  }

  function drawForesightOverlay() {
    const l = state.layout;
    const f = state.foresight;
    const count = state.futureQueue.length || f.count || 5;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const panelW = Math.min(330, l.w * 0.78);
    const panelX = (l.w - panelW) / 2;
    const panelY = 72;

    ctx.fillStyle = 'rgba(255,253,246,0.94)';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    roundRect(panelX, panelY, panelW, 76, 20, true, true, 4);

    ctx.fillStyle = '#111';
    ctx.font = '900 24px system-ui, sans-serif';

    if (f.phase === 'prepare') {
      ctx.fillText(ui('烛照未来开启', 'Foresight Opens'), l.w / 2, panelY + 28);
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillText(ui('准备记住接下来的门', 'Get ready to remember the doors'), l.w / 2, panelY + 53);
      const ratio = clamp(f.timer / Math.max(0.1, f.prepareTime), 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      roundRect(panelX + 24, panelY + 66, panelW - 48, 5, 3, true, false, 0);
      ctx.fillStyle = '#111';
      roundRect(panelX + 24, panelY + 66, (panelW - 48) * ratio, 5, 3, true, false, 0);
    } else if (f.phase === 'fly') {
      const totalFly = Math.max(0.1, count * f.perDoorTime);
      const p = clamp(f.timer / totalFly, 0, 1);
      const nowIndex = clamp(Math.floor(p * count) + 1, 1, count);
      ctx.fillText(ui(`烛照未来 ${nowIndex}/${count}`, `Foresight ${nowIndex}/${count}`), l.w / 2, panelY + 32);
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillText(ui('不要眨眼，记住顺序', 'Do not blink. Remember the order.'), l.w / 2, panelY + 56);
    } else {
      ctx.fillText(ui('回到现在', 'Returning'), l.w / 2, panelY + 32);
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillText(ui('准备继续开门', 'Prepare to continue'), l.w / 2, panelY + 56);
    }
    ctx.restore();
  }

  function drawGame() {
    const l = state.layout;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, l.topH, l.w, l.h - l.topH);
    ctx.clip();

    // 游戏区域外部留白，不再在门位外侧铺墙。
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, l.topH, l.w, l.h - l.topH);

    const shake = screenShakeAmount();
    if (shake > 0) {
      ctx.translate(
        Math.sin(state.t * 52) * shake + Math.sin(state.t * 19) * shake * 0.45,
        Math.cos(state.t * 47) * shake * 0.45
      );
    }

    if (state.mode === 'corridorTransition') {
      // 鬼/ Boss：必须关门后才进入下一门，所以横移时保持闭合门位。
      // 小动物/空房间：玩家是“开着门通过”，所以门保持打开状态，
      // 跟随墙、门框、房间内容一起移出画面，避免突然合门的怪感。
      const safePass = state.content && (state.content.type === 'person' || state.content.type === 'empty');
      const oldDoor = safePass ? clamp(state.transitionStartDoor || state.door, 0, 1) : 0;

      drawCorridorCard(state.corridorOffset, state.content, oldDoor);
      drawCorridorCard(state.corridorOffset + l.w, state.nextContent, 0);
    } else {
      drawCorridorCard(0, state.content, state.door);
    }
    ctx.restore();

    drawTopUI();
    drawGhostEyeFx();
    drawBottomControls();
    drawToast();
  }

  function screenShakeAmount() {
    if (state.mode === 'sealSuccess') return 4 * clamp(1 - state.sealFlash / 0.62, 0, 1);
    if (state.mode === 'bossFight') return 1.5 + Math.max(0, state.door - 0.65) * 5;
    if (state.danger > 0.78) return 3.2;
    if (state.danger > 0.55) return 1.6;
    return 0;
  }

  function drawCorridorCard(offset, content, doorProgress) {
    const l = state.layout;
    ctx.save();
    ctx.translate(offset, 0);

    // 关键：每一个“门位模块”必须单独裁切在自己的屏宽范围内。
    // 否则下一间的墙图会因为图片本身比门洞宽，提前伸进当前门位，
    // 在横移动画中盖住当前门/门框，产生闪墙和不同步感。
    ctx.beginPath();
    ctx.rect(0, l.topH, l.w, l.h - l.topH);
    ctx.clip();

    drawWallBackground();
    drawRoomBack(l.hole);
    drawContentFor(content, l.door, l.hole);
    drawWallMask();
    drawDoorFrame(l.hole);
    drawBossGlow(content, l.hole);
    drawDoorPanel(l.door, doorProgress);
    drawSealedGhostImprint(content, l.door, doorProgress);
    drawDoorTalismans(content, l.door, doorProgress);
    drawSealSuccessGlow();
    drawDangerVignette();

    ctx.restore();
  }

  function drawWallBackground() {
    const l = state.layout;
    const wall = getAssetImage(ROOM_ASSETS.wall);

    // 画面外不铺墙。每个门位只画自己的墙/地面模块，其余区域保持白色。
    if (!wall) {
      ctx.save();
      ctx.fillStyle = '#f4efe8';
      roundRect(l.hole.x - l.hole.w * 0.36, l.hole.y - l.hole.h * 0.08, l.hole.w * 1.72, l.hole.h * 1.16, 0, true, false, 0);
      ctx.restore();
      return;
    }

    ctx.save();

    // room/墙.png 的真实白色门洞区域：
    // x=420, y=229, w=418, h=718。
    // 用这组数值把墙图的白色门洞精确贴到代码门洞上，避免白边。
    const srcHole = { x: 420, y: 229, w: 418, h: 718 };
    const scale = Math.max(l.hole.w / srcHole.w, l.hole.h / srcHole.h);
    const drawW = wall.naturalWidth * scale;
    const drawH = wall.naturalHeight * scale;
    const drawX = (l.hole.x + l.hole.w / 2) - (srcHole.x + srcHole.w / 2) * scale;
    const drawY = l.hole.y - srcHole.y * scale;

    ctx.drawImage(wall, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  function drawRoomBack(hole) {
    const room = getAssetImage(ROOM_ASSETS.room);
    ctx.save();
    ctx.beginPath();
    ctx.rect(hole.x + 4, hole.y + 4, hole.w - 8, hole.h - 8);
    ctx.clip();
    if (room) drawCoverImage(room, hole.x + 6, hole.y + 6, hole.w - 12, hole.h - 12);
    else {
      ctx.fillStyle = '#efe5d8';
      ctx.fillRect(hole.x, hole.y, hole.w, hole.h);
    }
    ctx.restore();
  }

  function drawWallMask() {
    const l = state.layout;
    const h = l.hole;
    ctx.save();
    ctx.fillStyle = '#d8ccbd';
    ctx.globalAlpha = 0;
    ctx.restore();

    // The wall image is already behind the room. Here we add subtle outer shadow so the door hole sits over the content.
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.42)';
    ctx.lineWidth = 7;
    ctx.strokeRect(h.x + 2, h.y + 2, h.w - 4, h.h - 4);
    ctx.restore();
  }

  function drawDoorFrame(hole) {
    const frame = getAssetImage(ROOM_ASSETS.frame);
    ctx.save();
    if (frame) {
      // 门框和门共用同一个绘制框，确保尺寸完全对齐。
      drawCroppedStretchImage(frame, hole.x, hole.y, hole.w, hole.h, 2);
    } else {
      ctx.strokeStyle = '#2d1c12';
      ctx.lineWidth = 10;
      ctx.strokeRect(hole.x, hole.y, hole.w, hole.h);
    }
    ctx.restore();
  }

  function drawDoorPanel(door, progress) {
    const img = getAssetImage(ROOM_ASSETS.door);
    const slide = door.w * 0.96 * progress;
    const x = door.x - slide;
    const alpha = doorAlphaForGhostEye();
    ctx.save();
    ctx.globalAlpha = alpha;
    if (img) {
      // 裁掉门图四周极细白边，再拉到和门框同一尺寸。
      drawCroppedStretchImage(img, x, door.y, door.w, door.h, 2);
    } else {
      ctx.fillStyle = '#4a2b1c';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 5;
      roundRect(x, door.y, door.w, door.h, 8, true, true, 5);
    }
    ctx.restore();
  }

  function doorAlphaForGhostEye() {
    if (ghostEyeRemaining() > 0) return 0.42;
    return 1;
  }

  function drawContentFor(content, door, hole) {
    if (!content) return;
    const floorY = hole.y + hole.h * 0.94;

    ctx.save();
    ctx.beginPath();
    ctx.rect(hole.x + 8, hole.y + 8, hole.w - 16, hole.h - 16);
    ctx.clip();

    if (content.type === 'person') {
      const p = content.person;
      const px = door.x + door.w / 2 + door.w * (p.gameOffsetX || 0);
      const pfloor = floorY + door.h * (p.gameOffsetY || 0);
      const pHeight = door.h * 0.50 * (p.gameScale || 1);
      drawCharacter(p, px, pfloor, pHeight, 'person', 1);
      drawChefHat(px, pfloor - pHeight * 0.78, pHeight * 0.34);
    } else if (content.type === 'ghost') {
      const count = content.ghosts.length;
      const approach = content === state.content ? ghostApproachStep() : 0;
      const dangerScale = 1 + approach * 0.68;
      const baseH = door.h * (count === 1 ? 0.56 : count === 2 ? 0.45 : 0.36);
      const spread = door.w * (count === 1 ? 0 : count === 2 ? 0.25 : 0.30);

      content.ghosts.forEach((g, i) => {
        const gxBase = door.x + door.w / 2 + (count === 1 ? 0 : (i - (count - 1) / 2) * spread);
        const gx = gxBase;
        const gh = baseH * dangerScale;
        drawGhostWarningGlow(gx, floorY - gh * 0.52, gh);
        drawCharacter(g, gx, floorY, baseH, 'ghost', dangerScale);
        drawGhostFires(g, gx, floorY - gh * 0.55, gh, Math.max(1, g.fire || 1), i);
      });
    } else if (content.type === 'boss') {
      const approach = state.mode === 'bossFight' && content === state.content ? Math.floor(state.door * 8) / 8 : 0;
      const scale = state.mode === 'bossFight' && content === state.content ? 1 + approach * 0.45 : 1;
      const bx = door.x + door.w / 2;
      drawCharacter(content.bossGhost, bx, floorY + door.h * 0.02, door.h * 0.70, 'boss', scale);
      drawGhostFires(content.bossGhost, bx, floorY - door.h * 0.50, door.h * 0.74, (content.bossGhost.fire || 3) + 2, 9);
    }
    ctx.restore();
  }

  function drawCharacter(def, x, floorY, targetH, kind, scale = 1) {
    const img = getAssetImage(def.file);
    const roleScale = kind === 'ghost' ? 0.92 : kind === 'boss' ? 0.94 : 1;
    const h = targetH * scale * (def.scale || 1) * roleScale;
    const aspect = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.70;
    const w = h * aspect;
    const y = floorY - h;

    ctx.save();
    if (kind === 'boss') {
      const pulse = 0.5 + Math.sin(state.t * 14) * 0.5;
      ctx.shadowColor = 'rgba(255,0,0,0.85)';
      ctx.shadowBlur = 24 + pulse * 16;
    }
    if (img) ctx.drawImage(img, x - w / 2, y, w, h);
    else drawFallbackCharacter(def.name || displayName(def), x, y, w, h, kind);
    ctx.restore();
  }

  function drawFallbackCharacter(name, x, y, w, h, kind) {
    ctx.save();
    const isSafe = kind === 'person';
    ctx.fillStyle = isSafe ? '#fffdf6' : '#111';
    ctx.strokeStyle = isSafe ? '#111' : '#fffdf6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.50, w * 0.36, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isSafe ? '#111' : '#fffdf6';
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(name || '').slice(0, 4), x, y + h * 0.52);
    ctx.restore();
  }


  function drawGhostWarningGlow(cx, cy, bodyH) {
    ctx.save();
    ctx.globalAlpha = 0.26;
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, bodyH * 0.72);
    g.addColorStop(0, 'rgba(255,28,10,0.95)');
    g.addColorStop(0.55, 'rgba(255,28,10,0.22)');
    g.addColorStop(1, 'rgba(255,28,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - bodyH * 0.8, cy - bodyH * 0.8, bodyH * 1.6, bodyH * 1.6);
    ctx.restore();
  }

  function drawGhostFires(def, cx, cy, bodyH, count, seed = 0) {
    ctx.save();
    const base = GHOSTS.findIndex(g => g.name === def.name);
    const safeSeed = base >= 0 ? base : seed;
    const max = clamp(count, 1, 7);
    for (let i = 0; i < max; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const layer = Math.floor(i / 2);
      const drift = Math.sin(state.t * (1.1 + i * 0.17) + safeSeed * 0.9 + i) * bodyH * 0.035;
      const bob = Math.sin(state.t * (1.7 + i * 0.23) + i * 1.8) * bodyH * 0.045;
      const x = cx + side * bodyH * (0.22 + layer * 0.08) + drift;
      const y = cy - bodyH * (0.04 + layer * 0.035) + bob;
      const size = bodyH * (0.14 + (i % 3) * 0.022);
      const img = getAssetImage(GHOST_FIRE_FILES[(safeSeed + i) % GHOST_FIRE_FILES.length]);
      const pulse = 0.72 + Math.sin(state.t * 3.2 + i) * 0.15;
      ctx.globalAlpha = clamp(0.70 + pulse * 0.24, 0.58, 1);
      if (img) ctx.drawImage(img, x - size / 2, y - size * 0.65, size, size * 1.28);
      else drawCodeGhostFire(x, y, size, pulse);
    }
    ctx.restore();
  }

  function drawCodeGhostFire(x, y, size, pulse) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 1 + pulse * 0.15);
    const g = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, size * 0.72);
    g.addColorStop(0, 'rgba(255,255,220,0.95)');
    g.addColorStop(0.34, 'rgba(95,255,160,0.72)');
    g.addColorStop(1, 'rgba(35,220,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.78);
    ctx.bezierCurveTo(size * 0.45, -size * 0.28, size * 0.38, size * 0.32, 0, size * 0.48);
    ctx.bezierCurveTo(-size * 0.42, size * 0.18, -size * 0.40, -size * 0.28, 0, -size * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBossGlow(content, hole) {
    if (!content || content.type !== 'boss') return;
    const pulse = 0.5 + Math.sin(state.t * 12) * 0.5;
    const hpRatio = 1 - (content.hits || 0) / content.cfg.seals;
    const fast = hpRatio < 0.3 ? 1 : 0.35;
    ctx.save();
    ctx.globalAlpha = state.mode === 'bossFight' ? 0.48 + pulse * fast * 0.24 : 0.34;
    const g = ctx.createRadialGradient(hole.x + hole.w / 2, hole.y + hole.h / 2, 10, hole.x + hole.w / 2, hole.y + hole.h / 2, hole.w * 0.82);
    g.addColorStop(0, 'rgba(255,28,10,0.95)');
    g.addColorStop(0.48, 'rgba(255,28,10,0.28)');
    g.addColorStop(1, 'rgba(255,28,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(hole.x - 80, hole.y - 80, hole.w + 160, hole.h + 160);
    ctx.restore();
  }

  function actualDoorRectFor(door, progress) {
    return { x: door.x - door.w * 0.96 * progress, y: door.y, w: door.w, h: door.h };
  }

  function drawDoorTalismans(content, door, progress) {
    if (!content || !content.talismans || !content.talismans.length) return;
    const d = actualDoorRectFor(door, progress);
    content.talismans.forEach(t => {
      const age = state.t - (t.born || state.t);
      let alpha = 1;
      if (state.mode === 'sealSuccess' && age > 0.15) alpha = clamp(1 - state.sealFlash / 0.62, 0, 1);
      drawSealPaper(d.x + d.w * t.rx, d.y + d.h * t.ry, d.w * 0.25 * t.scale, d.h * 0.118 * t.scale, t.rot, alpha);
    });
  }

  function drawVermilionSealImage(img, x, y, w, h, alpha) {
    if (!img) return false;
    const pixelW = Math.max(1, Math.ceil(w));
    const pixelH = Math.max(1, Math.ceil(h));
    const off = drawVermilionSealImage.canvas || (drawVermilionSealImage.canvas = document.createElement('canvas'));
    const octx = drawVermilionSealImage.ctx || (drawVermilionSealImage.ctx = off.getContext('2d'));
    off.width = pixelW;
    off.height = pixelH;
    octx.clearRect(0, 0, pixelW, pixelH);
    octx.globalCompositeOperation = 'source-over';
    octx.globalAlpha = 1;
    octx.filter = 'sepia(1) saturate(4.5) hue-rotate(-18deg) contrast(1.25) brightness(0.78)';
    octx.drawImage(img, 0, 0, pixelW, pixelH);
    octx.filter = 'none';
    octx.globalCompositeOperation = 'source-atop';
    octx.fillStyle = 'rgba(176,24,17,0.68)';
    octx.fillRect(0, 0, pixelW, pixelH);
    octx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.globalAlpha = alpha * 0.20;
    ctx.shadowColor = 'rgba(163,22,15,0.55)';
    ctx.shadowBlur = 7;
    ctx.drawImage(off, x - 1.5, y + 1, w + 3, h + 2);
    ctx.globalAlpha = alpha * 0.70;
    ctx.shadowBlur = 0;
    ctx.drawImage(off, x, y, w, h);
    ctx.globalAlpha = alpha * 0.22;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(off, x + 1.2, y + 0.8, w, h);
    ctx.restore();
    return true;
  }

  function drawSealedGhostImprint(content, door, progress) {
    if (!content || content.type !== 'ghost' || !content.ghosts || !content.ghosts.length) return;
    if ((content.sealed || 0) < (content.requiredSeals || 1)) return;

    const born = content.sealRevealBorn || state.t;
    const age = Math.max(0, state.t - born);
    const entering = easeInOut(clamp(age / 0.18, 0, 1));
    const leaving = state.mode === 'sealSuccess' ? 1 : clamp(1 - age / 1.8, 0, 1);
    const alpha = clamp(Math.max(entering, 0.36) * Math.max(leaving, 0.55), 0, 1);
    if (alpha <= 0.02) return;

    const d = actualDoorRectFor(door, progress);
    const count = content.ghosts.length;
    const name = count === 1
      ? displayName(content.ghosts[0])
      : content.ghosts.map(g => displayName(g)).join(' / ');

    ctx.save();
    ctx.beginPath();
    ctx.rect(d.x + d.w * 0.05, d.y + d.h * 0.06, d.w * 0.90, d.h * 0.88);
    ctx.clip();

    const markW = d.w * (count === 1 ? 0.58 : 0.70);
    const markH = d.h * 0.31;
    const markX = d.x + d.w * 0.50 - markW / 2;
    const markY = d.y + d.h * 0.14;
    const pop = 0.96 + entering * 0.04;
    const cxMark = markX + markW / 2;
    const cyMark = markY + markH / 2;
    const red = 'rgba(168,25,18,';
    const darkRed = 'rgba(86,12,9,';

    ctx.translate(cxMark, cyMark);
    ctx.scale(pop, pop);
    ctx.translate(-cxMark, -cyMark);

    ctx.globalAlpha = alpha * 0.34;
    ctx.strokeStyle = red + '0.72)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(markX + markW * 0.16, markY + markH * 0.16);
    ctx.quadraticCurveTo(markX + markW * 0.10, markY + markH * 0.28, markX + markW * 0.19, markY + markH * 0.34);
    ctx.moveTo(markX + markW * 0.82, markY + markH * 0.12);
    ctx.quadraticCurveTo(markX + markW * 0.90, markY + markH * 0.26, markX + markW * 0.80, markY + markH * 0.36);
    ctx.moveTo(markX + markW * 0.35, markY + markH * 0.07);
    ctx.lineTo(markX + markW * 0.47, markY + markH * 0.03);
    ctx.moveTo(markX + markW * 0.55, markY + markH * 0.04);
    ctx.lineTo(markX + markW * 0.68, markY + markH * 0.08);
    ctx.stroke();

    const iconAreaW = markW * 0.82;
    const iconCenterY = markY + markH * 0.43;
    content.ghosts.forEach((g, i) => {
      const img = getAssetImage(g.sealFile || g.file);
      const h = markH * (count === 1 ? 0.66 : 0.54);
      const aspect = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.72;
      const w = h * aspect;
      const spread = iconAreaW / Math.max(1, count);
      const cx = markX + markW / 2 + (count === 1 ? 0 : (i - (count - 1) / 2) * spread * 0.58);
      const y = iconCenterY - h / 2;

      ctx.save();
      if (!drawVermilionSealImage(img, cx - w / 2, y, w, h, alpha)) {
        ctx.globalAlpha = alpha * 0.78;
        ctx.fillStyle = red + '0.92)';
        ctx.strokeStyle = darkRed + '0.34)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, y + h * 0.50, w * 0.34, h * 0.40, -0.08, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '900 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayName(g).slice(0, 3), cx, y + h * 0.52, w * 0.9);
      }
      ctx.restore();
    });

    ctx.globalAlpha = alpha * 0.96;
    ctx.fillStyle = red + '0.94)';
    ctx.strokeStyle = darkRed + '0.40)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(168,25,18,0.28)';
    ctx.shadowBlur = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = count === 1 ? '900 14px system-ui, sans-serif' : '900 10px system-ui, sans-serif';
    const tx = markX + markW / 2;
    const ty = markY + markH * 0.84;
    ctx.strokeText(name, tx, ty, markW * 0.88);
    ctx.fillText(name, tx, ty, markW * 0.88);

    ctx.globalAlpha = alpha * 0.44;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = red + '0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(markX + markW * 0.28, markY + markH * 0.94);
    ctx.lineTo(markX + markW * 0.38, markY + markH * 0.98);
    ctx.moveTo(markX + markW * 0.62, markY + markH * 0.98);
    ctx.lineTo(markX + markW * 0.73, markY + markH * 0.94);
    ctx.stroke();
    ctx.restore();
  }

  function drawSealPaper(x, y, w, h, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;

    const img = getAssetImage(ROOM_ASSETS.talisman);
    if (img) {
      // 优先调用 images/符咒.png。尺寸按原图比例绘制，避免变形。
      const targetH = Math.max(h * 1.35, 80);
      const targetW = targetH * (img.naturalWidth / img.naturalHeight);
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
      return;
    }

    // 找不到符咒素材时，保留代码绘制的备用符。
    const ww = Math.max(w * 0.72, 34);
    const hh = Math.max(h * 1.12, 72);
    ctx.fillStyle = '#f7d85a';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(-ww / 2, -hh / 2, ww, hh, 5, true, true, 3);
    ctx.strokeStyle = '#b11616';
    ctx.lineWidth = 2;
    roundRect(-ww / 2 + 5, -hh / 2 + 6, ww - 10, hh - 12, 3, false, true, 2);
    ctx.fillStyle = '#b11616';
    ctx.font = `900 ${Math.max(18, ww * 0.48)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('封', 0, -hh * 0.20);
    ctx.font = `900 ${Math.max(14, ww * 0.36)}px serif`;
    ctx.fillText('印', 0, hh * 0.18);
    ctx.restore();
  }

  function drawSealSuccessGlow() {
    if (state.mode !== 'sealSuccess') return;
    const l = state.layout;
    const alpha = clamp(1 - state.sealFlash / 0.62, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, l.topH, l.w, l.h - l.topH);
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = '#ffe243';
    ctx.lineWidth = 12;
    roundRect(l.hole.x - 8, l.hole.y - 8, l.hole.w + 16, l.hole.h + 16, 18, false, true, 12);
    ctx.restore();
  }

  function drawDangerVignette() {
    if (state.danger <= 0.02 || state.mode !== 'normal') return;
    const l = state.layout;
    ctx.save();
    ctx.globalAlpha = clamp(state.danger, 0, 1) * 0.46;
    const g = ctx.createRadialGradient(l.w / 2, l.h / 2, l.w * 0.15, l.w / 2, l.h / 2, l.w * 0.72);
    g.addColorStop(0, 'rgba(255,0,0,0)');
    g.addColorStop(1, 'rgba(255,0,0,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, l.topH, l.w, l.h - l.topH);
    ctx.restore();

    if (state.danger > 0.78) {
      ctx.save();
      ctx.globalAlpha = (state.danger - 0.78) * 2.3;
      ctx.fillStyle = '#111';
      ctx.font = '900 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ui('太久了……', 'Too long...'), l.w / 2, l.topH + 40);
      ctx.restore();
    }
  }

  function drawTopUI() {
    const l = state.layout;
    const prog = currentStageProgress();

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, l.w, l.topH);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, l.topH - 2);
    ctx.lineTo(l.w, l.topH - 2);
    ctx.stroke();

    drawMiniButton(l.home, ui('收工', 'Return'), 'home');
    drawMiniButton(l.galleryButton, ui('图鉴', 'Archive'), 'galleryTop');

    const textX = l.home.x + l.home.w + 12;
    const textMax = Math.max(96, l.galleryButton.x - textX - 10);

    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillText(ui(`第 ${state.room} 门`, `Door ${state.room}`), textX, 22, textMax);

    ctx.font = '700 10.5px system-ui, sans-serif';
    const diff = state.difficulty === 'easy' ? ui('简单', 'Easy') : ui('困难', 'Hard');
    ctx.fillText(ui(`难度 ${diff}  最高 ${state.save.bestRoom || 1}`, `${diff}  Best ${state.save.bestRoom || 1}`), textX, 41, textMax);

    ctx.font = '700 10.5px system-ui, sans-serif';
    ctx.fillText(ui(`进度 ${prog.index}/25  Boss：${prog.boss.name}`, `Progress ${prog.index}/25  Boss: ${displayName(prog.boss)}`), textX, 59, textMax);

    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(ui(`本局食材 ${countMapEntries(state.runRewards.ingredients)}  今日技能 ${state.save.dailySkills.ids.length}`, `Run food ${countMapEntries(state.runRewards.ingredients)}  Skills ${state.save.dailySkills.ids.length}`), 16, 84, l.w - 32);

    const barX = 16;
    const barY = l.topH - 16;
    const barW = Math.max(80, l.w - 32);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    roundRect(barX, barY, barW, 7, 4, true, true, 2);
    ctx.fillStyle = '#111';
    roundRect(barX + 2, barY + 2, Math.max(0, (barW - 4) * prog.ratio), 3, 2, true, false, 0);

    ctx.textAlign = 'right';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillStyle = '#111';
    ctx.fillText(collectCountText(), l.w - 10, 65);
    if (state.testMode) {
      ctx.font = '900 10px system-ui, sans-serif';
      ctx.fillText('TEST', l.w - 10, 82);
    }
    if (ghostEyeRemaining() > 0 && state.mode === 'normal') {
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText(ui(`透视：${ghostEyeRemaining().toFixed(1)}秒`, `Eye: ${ghostEyeRemaining().toFixed(1)}s`), l.w - 10, l.topH - 29);
    }

    if (state.mode === 'bossFight' && state.content && state.content.type === 'boss') {
      drawBossHPBar();
    }
    ctx.restore();
  }

  function drawBossHPBar() {
    const l = state.layout;
    const c = state.content;
    const ratio = clamp(1 - c.hits / c.cfg.seals, 0, 1);
    const x = 16;
    const y = l.topH - 29;
    const w = l.w - 32;
    const h = 9;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, 4, true, true, 2);
    ctx.fillStyle = ratio < 0.3 ? '#ff3b20' : '#111';
    roundRect(x + 2, y + 2, Math.max(0, (w - 4) * ratio), h - 4, 3, true, false, 0);
    ctx.restore();
  }

  function drawBottomControls() {
    const l = state.layout;
    if (state.mode === 'corridorTransition' || state.mode === 'sealSuccess') return;
    if (state.mode === 'bossFight') return drawBossSealButton(l.bossButton);
    drawRunSkillButtons();
    drawSealButton(l.sealButton);
  }

  function runSkillButtonRects() {
    const l = state.layout;
    const ids = [];
    if (hasCarriedSkill('freshSeal')) ids.push('freshSeal');
    if (hasCarriedSkill('ghostEyeSkill')) ids.push('ghostEyeSkill');
    if (hasCarriedSkill('foresightSkill')) ids.push('foresightSkill');
    if (!ids.length) return [];
    const gap = 7;
    const margin = 12;
    const w = Math.min(116, (l.w - margin * 2 - gap * (ids.length - 1)) / ids.length);
    const total = ids.length * w + gap * (ids.length - 1);
    return ids.map((id, index) => ({ id, x: (l.w - total) / 2 + index * (w + gap), y: l.h - 174, w, h: 38 }));
  }

  function drawRunSkillButtons() {
    runSkillButtonRects().forEach(r => drawRunSkillButton(r));
  }

  function drawRunSkillButton(r) {
    const active = r.id === 'freshSeal' && state.freshSealArmed;
    const remaining = r.id === 'freshSeal' ? 0 : skillCooldownRemaining(r.id);
    const foresightUsesLeft = r.id === 'foresightSkill' ? Math.max(0, state.foresight.maxPerRun - state.foresight.used) : 0;
    const exhausted = r.id === 'foresightSkill' && foresightUsesLeft <= 0;
    const labels = {
      freshSeal: ui(`封鲜符 ×${state.freshSeals}`, `Fresh ×${state.freshSeals}`),
      ghostEyeSkill: remaining ? ui(`透视 ${remaining}秒`, `Eye ${remaining}s`) : ui('透视', 'Eye'),
      foresightSkill: exhausted ? ui('未来 已用完', 'Future 0 left')
        : remaining ? ui(`未来 ${remaining}门 · 余${foresightUsesLeft}`, `Future ${remaining} · ${foresightUsesLeft} left`)
          : ui(`遇见未来 ×${foresightUsesLeft}`, `Future ×${foresightUsesLeft}`)
    };
    drawPressTransform(r, `runSkill-${r.id}`, () => {
      ctx.fillStyle = active ? '#b72820' : remaining || exhausted ? '#ddd8cc' : '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      roundRect(r.x, r.y, r.w, r.h, 12, true, true, 3);
      ctx.fillStyle = active ? '#fffdf6' : '#111';
      ctx.font = `${r.w < 100 ? 11 : 12}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[r.id] || r.id, r.x + r.w / 2, r.y + r.h / 2, r.w - 8);
    });
  }

  function drawSealButton(r) {
    const img = getAssetImage(ROOM_ASSETS.seal);
    drawPressTransform(r, 'seal', () => {
      if (img) drawContainImage(img, r.x, r.y, r.w, r.h);
      else {
        ctx.fillStyle = '#fff06d';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 4;
        roundRect(r.x, r.y, r.w, r.h, 15, true, true, 4);
        ctx.fillStyle = '#111';
        ctx.font = '900 25px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('封 印', r.x + r.w / 2, r.y + r.h / 2);
      }
    });
  }

  function drawBossSealButton(r) {
    ctx.save();
    const beat = 1 + Math.sin(state.t * 18) * 0.025;
    const press = isPressed('bossSeal') ? 0.94 : 1;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(beat * press, beat * press);
    ctx.globalAlpha = isPressed('bossSeal') ? 0.86 : 1;
    const rr = { x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h };
    ctx.fillStyle = '#fff06d';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    roundRect(rr.x, rr.y, rr.w, rr.h, 18, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ui('疯狂贴封印！', 'Seal Fast!'), 0, 0);
    ctx.restore();
  }

  function drawGhostEyeFx() {
    if (state.eyeFx <= 0) return;
    const l = state.layout;
    const p = clamp(state.eyeFx / 1.05, 0, 1);
    ctx.save();
    ctx.globalAlpha = p * 0.85;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, l.topH, l.w, l.h - l.topH);
    ctx.translate(l.w / 2, l.topH + (l.h - l.topH) * 0.42);
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-86, 0);
    ctx.quadraticCurveTo(0, -52, 86, 0);
    ctx.quadraticCurveTo(0, 52, -86, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fill();
    ctx.restore();
  }

  function drawToast() {
    if (!state.toast) return;
    const l = state.layout;
    ctx.save();
    ctx.globalAlpha = clamp(state.toast.time, 0, 1);
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#fffdf6';
    ctx.lineWidth = 3;
    const w = Math.min(l.w * 0.78, 300);
    const h = 42;
    const x = (l.w - w) / 2;
    const y = l.topH + 12;
    roundRect(x, y, w, h, 18, true, true, 3);
    ctx.fillStyle = '#fffdf6';
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toastText(state.toast.text), l.w / 2, y + h / 2);
    ctx.restore();
  }

  function toastText(zh) {
    if (!isEn()) return zh;
    const map = {
      'Boss开始顶门！': 'Boss is forcing the door!',
      '先开门确认': 'Open the door to confirm first.',
      '关门后才能开始贴符': 'Close the door before sealing.',
      '先把门关上': 'Close the door first.',
      '符咒贴上去了': 'Seal placed.',
      'Boss已封印，进入下一大关': 'Boss sealed. Next stage unlocked.',
      'Boss逃走了': 'Boss escaped.',
      '先在门后遇见它': 'Meet it behind a door first'
    };
    return map[zh] || zh;
  }

  function drawRules() {
    drawMenuBackground();
    drawBackButton();
    drawTitleBlock(ui('游戏规则', 'Rules'), ui('小动物别封，鬼要关门后封印', 'Do not seal animals. Close the door before sealing ghosts.'));
    state.rulesScroll = clamp(state.rulesScroll, 0, maxRulesScroll());
    drawScrollableTextPanel(rulesLines(), rulesPanelRect(), state.rulesScroll);
  }

  function rulesLines() {
    return isEn() ? [
      '1. Drag the wooden door left to peek inside. Release to snap open or closed.',
      '2. Each cleared door slides away sideways. A new door enters from the corridor.',
      '3. Ghosts have different speeds. If you stare too long, they will step closer and burst out.',
      '4. For normal ghosts, close the door first, then tap Seal.',
      '5. If there is an animal or an empty room, open the door wide enough to pass. Sealing them ends the run.',
      '6. A successful ghost seal may leave a fantasy ingredient. Arm the Fresh Seal to guarantee one drop.',
      '7. Tap Return during a run to stop safely and bring ingredients to the kitchen. Failure loses run ingredients.',
      '8. Drag or tap ingredients into kitchen slots, then choose Stir-fry or Steam. Failed experiments consume ingredients.',
      '9. Successful dishes enter permanent dish stock. Daily prices refresh at local midnight, so low-price dishes can be held for later.',
      '10. Selling adds permanent lifetime revenue and promotes the kitchen from Street Stall toward Star Hotel titles.',
      '11. Every finished run refreshes the skill shop. Bought skills last until local midnight; carry 1 active and up to 2 passive/trigger skills.',
      '12. Animals wear chef hats and grow as kitchen teams only. More chefs shorten the cooking progress time; they never join patrol runs.',
      '13. Only skills carried in the current loadout can work. Ghosts never grant skills after sealing.',
      '14. Ghost Eye reveals doors for 5 seconds and cools down for 30 seconds. Foresight is limited to 2 uses per run.',
      '15. Bosses appear near every 25th door. Confirm the Boss, close the door, then seal rapidly.',
      '16. Zhuyin remains a rare boss-like spirit, but sealing it grants only normal rewards and ingredients.'
    ] : [
      '1. 拖动红木滑门向左开门，松手后会自动吸附开/关。',
      '2. 判断成功后，当前门位会横向滑走，新的门从长廊另一侧滑入。',
      '3. 鬼有快慢差异，看太久会一段段逼近，危险值满了就会冲出来。',
      '4. 普通鬼需要先关门，再点击封印。',
      '5. 门后是小动物或空房间时，开到足够大即可通过；乱封会直接失败。',
      '6. 成功封印妖怪有概率留下幻想食材；先点亮封鲜符，本次成功封印保证获得食材。',
      '7. 闯关时点击“收工”就是见好就收，食材安全送进厨房；失败会清空本局食材。',
      '8. 在厨房把食材拖入或点入料理格，再选择炒锅或蒸笼；实验失败也会消耗食材。',
      '9. 成功料理会进入可跨天保存的料理仓库；每日00:00刷新售价，低价时可以先囤货。',
      '10. 卖餐会累计永久营业收入，并让称号从「路边摊」逐步晋升至「星级大酒店」。',
      '11. 每局结束刷新技能商店；买下的技能当天拥有，出发前可携带1个主动技能及最多2个被动/触发技能，00:00清空。',
      '12. 小动物统一戴厨师帽并累计为厨房队伍；厨师越多，出餐进度越快，但不进入巡夜。',
      '13. 只有本局出发前携带的技能能够生效；封印任何妖怪都不会额外赠送技能。',
      '14. 透视开启后持续看穿门后5秒并冷却30秒；遇见未来每局最多使用2次。',
      '15. 每25关附近会出现Boss：先开门确认，再关门疯狂贴符。',
      '16. 烛阴仍是极少现身的Boss级妖怪，但封印后只结算常规奖励与食材。'
    ];
  }

  function rulesPanelRect() {
    const l = state.layout;
    return { x: l.w * 0.07, y: l.h * 0.31, w: l.w * 0.86, h: l.h * 0.55 };
  }

  function maxRulesScroll() {
    const r = rulesPanelRect();
    ctx.save();
    ctx.font = `${isEn() ? 12 : 14}px system-ui, sans-serif`;
    const h = measureLinesHeight(rulesLines(), r.w - 36, isEn() ? 17 : 22, 7);
    ctx.restore();
    return Math.max(0, h - (r.h - 42));
  }

  function drawScrollableTextPanel(lines, r, scroll) {
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    roundRect(r.x, r.y, r.w, r.h, 18, true, true, 4);
    ctx.beginPath();
    ctx.rect(r.x + 12, r.y + 14, r.w - 28, r.h - 28);
    ctx.clip();
    ctx.fillStyle = '#111';
    ctx.font = `${isEn() ? 12 : 14}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const lineH = isEn() ? 17 : 22;
    let yy = r.y + 20 - scroll;
    lines.forEach(line => {
      yy = wrapText(line, r.x + 18, yy, r.w - 42, lineH, 'left') + 7;
    });
    ctx.restore();
  }

  function drawGallery() {
    const m = galleryMetrics();
    const l = m.l;
    state.galleryScroll = clamp(state.galleryScroll, 0, maxGalleryScroll());
    drawMenuBackground();
    drawBackButton();

    ctx.save();
    ctx.fillStyle = '#111';
    ctx.font = '900 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ui('图鉴', 'Archive'), l.w / 2, 45);
    ctx.restore();

    const tabY = 78;
    const tabW = Math.min(146, (l.w - 44) / 2);
    const ghostTab = { x: 18, y: tabY, w: tabW, h: 42 };
    const peopleTab = { x: 28 + tabW, y: tabY, w: tabW, h: 42 };
    drawTab(ghostTab, `${ui('鬼图鉴', 'Ghosts')} ${seenGhostCount()}/${GHOSTS.length}`, state.galleryTab === 'ghosts');
    drawTab(peopleTab, `${ui('小动物图鉴', 'Animals')} ${seenPeopleCount()}/${PEOPLE.length}`, state.galleryTab === 'people');

    const seenMap = state.galleryTab === 'ghosts' ? state.save.ghosts : state.save.people;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, m.startY - 4, l.w, l.h - m.startY + 4);
    ctx.clip();
    m.list.forEach((item, i) => {
      const col = i % m.cols;
      const row = Math.floor(i / m.cols);
      const x = 16 + col * (m.cardW + m.gap);
      const y = m.startY + row * (m.cardH + 14) - state.galleryScroll;
      if (y > l.h || y + m.cardH < m.startY - 10) return;
      drawGalleryCard({ x, y, w: m.cardW, h: m.cardH }, item, !!seenMap[item.name]);
    });
    ctx.restore();
  }

  function galleryMetrics() {
    const l = state.layout;
    const list = state.galleryTab === 'ghosts' ? GHOSTS : PEOPLE;
    const cols = isEn() ? 2 : 3;
    const gap = 12;
    const cardW = (l.w - 32 - gap * (cols - 1)) / cols;
    const cardH = isEn() ? Math.min(220, cardW * 1.45) : Math.min(184, cardW * 1.80);
    const startY = 138;
    const rows = Math.ceil(list.length / cols);
    const contentH = rows * (cardH + 14) - 14;
    const viewH = l.h - startY - 18;
    return { l, list, cols, gap, cardW, cardH, startY, contentH, viewH };
  }

  function maxGalleryScroll() {
    const m = galleryMetrics();
    return Math.max(0, m.contentH - m.viewH);
  }

  function drawGalleryCard(r, item, seen) {
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(r.x, r.y, r.w, r.h, 16, true, true, 3);
    const imageBox = { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - (isEn() ? 78 : 66) };
    ctx.beginPath();
    ctx.rect(imageBox.x, imageBox.y, imageBox.w, imageBox.h);
    ctx.clip();
    if (seen) {
      drawCardImage(item, imageBox);
      if (state.galleryTab === 'people') drawChefHat(imageBox.x + imageBox.w / 2, imageBox.y + imageBox.h * 0.18, Math.min(imageBox.w, imageBox.h) * 0.32);
    } else drawUnknownEgg(imageBox, r.w);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(r.x + 6, r.y + r.h - (isEn() ? 72 : 58), r.w - 12, isEn() ? 68 : 54);
    ctx.clip();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(seen ? displayName(item) : ui('？？？', '???'), r.x + r.w / 2, r.y + r.h - (isEn() ? 70 : 56));
    ctx.font = `${isEn() ? 9.5 : 10}px system-ui, sans-serif`;
    const desc = seen ? displayDesc(item) : ui('尚未记录', 'Not recorded yet');
    wrapText(desc, r.x + r.w / 2, r.y + r.h - (isEn() ? 52 : 38), r.w - 14, isEn() ? 11 : 12, 'center');
    ctx.restore();
  }

  function drawChefHat(cx, cy, size) {
    ctx.save();
    const s = Math.max(18, size);
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(2, s * 0.05);
    const puffY = cy - s * 0.16;
    [-0.24, 0, 0.24].forEach((offset, index) => {
      ctx.beginPath();
      ctx.arc(cx + s * offset, puffY - (index === 1 ? s * 0.12 : 0), s * 0.26, Math.PI, 0);
      ctx.lineTo(cx + s * (offset + 0.24), cy + s * 0.18);
      ctx.lineTo(cx + s * (offset - 0.24), cy + s * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = '#fffdf6';
    ctx.beginPath();
    ctx.rect(cx - s * 0.46, cy + s * 0.08, s * 0.92, s * 0.25);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b72820';
    ctx.fillRect(cx - s * 0.42, cy + s * 0.20, s * 0.84, s * 0.07);
    ctx.restore();
  }

  function drawPetHouse() {
    const l = state.layout;
    state.petScroll = clamp(state.petScroll, 0, maxPetScroll());
    drawMenuBackground();
    drawBackButton();

    if (state.kitchenView === 'chefs') {
      drawKitchenChefRoster();
      return;
    }
    if (state.kitchenView === 'market') {
      drawKitchenMarket();
      return;
    }

    ctx.save();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const compactTitle = l.w < 380;
    ctx.font = compactTitle ? '900 22px system-ui, sans-serif' : '900 25px system-ui, sans-serif';
    ctx.fillText(compactTitle ? ui('百味厨房', 'Kitchen') : ui('小厨师大灶台', 'Little Chef Stove'), l.w / 2 + 28, 38);
    ctx.font = '800 11px system-ui, sans-serif';
    const title = businessTitleInfo().current;
    ctx.fillText(ui(`${title.name} · 铜钱 ${state.save.coins || 0} · 料理库存 ${totalDishCount()}`, `${title.nameEn} · Coins ${state.save.coins || 0} · Dishes ${totalDishCount()}`), l.w / 2, 64, l.w - 28);
    ctx.restore();

    drawKitchenShortcuts();
    drawKitchenCook();
    drawUIButton(kitchenPrepareRect(), ui('去准备巡夜', 'Prepare Patrol'), ui('选择本局携带技能', 'Choose carried skills'), 'kitchenPrepare');
  }

  function drawKitchenChefRoster() {
    const l = state.layout;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 25px system-ui, sans-serif';
    ctx.fillText(ui('小厨师名册', 'Chef Roster'), l.w / 2 + 28, 40);
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText(ui('重复遇见会扩充队伍；小厨师只在厨房帮忙', 'Repeat meetings grow teams; chefs stay in the kitchen'), l.w / 2, 72, l.w - 32);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 128, l.w, l.h - 144);
    ctx.clip();
    petCardRects().forEach(r => {
      if (r.y > l.h || r.y + r.h < 128) return;
      drawPetCard(r, r.pet);
    });
    ctx.restore();
  }

  function kitchenMarketCardRects() {
    const l = state.layout;
    const margin = 16;
    const gap = 8;
    const w = (l.w - margin * 2 - gap) / 2;
    return RECIPES.map((recipe, i) => ({
      recipe,
      x: margin + (i % 2) * (w + gap),
      y: 142 + Math.floor(i / 2) * 90,
      w,
      h: 82
    }));
  }

  function drawKitchenMarket() {
    const l = state.layout;
    const title = businessTitleInfo();
    const compactTitle = l.w < 380;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${compactTitle ? 20 : 24}px system-ui, sans-serif`;
    ctx.fillText(ui('今日料理行情', 'Daily Dish Market'), l.w / 2 + (compactTitle ? 34 : 24), 38, l.w - 150);
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.fillText(ui(`称号：${title.current.name} · 累计收入 ${title.revenue}`, `Title: ${title.current.nameEn} · Revenue ${title.revenue}`), l.w / 2, 74, l.w - 34);
    ctx.font = '700 10.5px system-ui, sans-serif';
    const progress = title.next
      ? ui(`再赚 ${title.next.revenue - title.revenue} 铜钱升级为「${title.next.name}」`, `Earn ${title.next.revenue - title.revenue} more for ${title.next.nameEn}`)
      : ui('已达到最高称号「星级大酒店」', 'Highest title reached: Star Hotel');
    ctx.fillText(progress, l.w / 2, 98, l.w - 34);
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillStyle = '#5d5548';
    ctx.fillText(ui('价格每日 00:00 更新 · 点击有库存的料理出售 1 份', 'Prices refresh at 00:00 · tap stocked dish to sell one'), l.w / 2, 121, l.w - 28);
    ctx.restore();
    kitchenMarketCardRects().forEach(r => drawKitchenMarketCard(r));
  }

  function drawKitchenMarketCard(r) {
    const known = !!state.save.recipes[r.recipe.id];
    const stock = Math.max(0, Number(state.save.dishInventory[r.recipe.id] || 0));
    const trend = marketTrend(r.recipe);
    const price = dailyDishPrice(r.recipe);
    const bonus = !!state.save.firstSaleBonuses[r.recipe.id];
    drawPressTransform(r, `market-${r.recipe.id}`, () => {
      ctx.fillStyle = known ? (stock > 0 ? '#fff6c7' : '#fffdf6') : '#e5e1d8';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      roundRect(r.x, r.y, r.w, r.h, 14, true, true, 3);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '900 11px system-ui, sans-serif';
      ctx.fillText(known ? (isEn() ? r.recipe.nameEn : r.recipe.name) : ui('未发现料理', 'Undiscovered'), r.x + 9, r.y + 15, r.w - 18);
      ctx.font = '900 12px system-ui, sans-serif';
      ctx.fillText(known ? ui(`今日 ${price} 铜钱`, `Today ${price} coins`) : '???', r.x + 9, r.y + 39, r.w - 62);
      ctx.textAlign = 'right';
      ctx.fillStyle = known ? trend.color : '#777';
      ctx.font = '900 10px system-ui, sans-serif';
      ctx.fillText(known ? (isEn() ? trend.nameEn : trend.name) : 'LOCK', r.x + r.w - 9, r.y + 39);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'left';
      ctx.font = '800 10px system-ui, sans-serif';
      ctx.fillText(known ? ui(`库存 ×${stock}${bonus ? ' · 首售+60' : ''}`, `Stock ×${stock}${bonus ? ' · first +60' : ''}`) : ui('继续探索食谱', 'Keep experimenting'), r.x + 9, r.y + 63, r.w - 18);
    });
  }

  function totalChefCount() {
    return PETS.reduce((sum, pet) => sum + Math.max(0, Number(petSave(pet.id).count || 0)), 0);
  }

  function kitchenShortcutRects() {
    const l = state.layout;
    const gap = 8;
    const margin = 14;
    const w = (l.w - margin * 2 - gap * 2) / 3;
    return {
      chefs: { x: margin, y: 82, w, h: 42 },
      upgrade: { x: margin + w + gap, y: 82, w, h: 42 },
      shop: { x: margin + (w + gap) * 2, y: 82, w, h: 42 }
    };
  }

  function drawKitchenShortcuts() {
    const r = kitchenShortcutRects();
    const upgrade = nextKitchenUpgrade();
    drawMiniButton(r.chefs, ui(`厨师 ×${totalChefCount()}`, `Chefs ×${totalChefCount()}`), 'kitchenChefs');
    drawMiniButton(r.upgrade, upgrade ? ui(`灶台 ${state.save.kitchen.slots}/4`, `Stove ${state.save.kitchen.slots}/4`) : ui('灶台 4/4', 'Stove 4/4'), 'kitchenUpgrade');
    drawMiniButton(r.shop, ui('技能铺', 'Skill Shop'), 'kitchenShop');
  }

  function kitchenVerticalLayout() {
    const l = state.layout;
    const extra = clamp(l.h - 640, 0, 220);
    const pantryY = 142 + extra * 0.05;
    const stoveY = 222 + extra * 0.16;
    const stoveH = 198 + extra * 0.05;
    const dishY = stoveY + stoveH + 12 + extra * 0.12;
    return { pantryY, stoveY, stoveH, dishY, dishH: 80 + extra * 0.04 };
  }

  function kitchenMethodRects() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    const w = Math.min(104, (l.w - 132) / 2);
    return {
      stir: { x: l.w / 2 - w - 6 + 34, y: v.stoveY + 108, w, h: 36 },
      steam: { x: l.w / 2 + 6 + 34, y: v.stoveY + 108, w, h: 36 }
    };
  }

  function kitchenIngredientRects() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    const margin = 14;
    const gap = 7;
    const w = (l.w - margin * 2 - gap * 3) / 4;
    return INGREDIENTS.map((ingredient, i) => ({
      ingredient,
      x: margin + i * (w + gap),
      y: v.pantryY,
      w,
      h: 68
    }));
  }

  function kitchenSlotRects() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    const startX = Math.max(92, l.w * 0.24);
    const gap = 6;
    const w = (l.w - startX - 22 - gap * 3) / 4;
    return [0, 1, 2, 3].map(index => ({ index, x: startX + index * (w + gap), y: v.stoveY + 45, w, h: 52 }));
  }

  function kitchenStoveRect() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    return { x: 14, y: v.stoveY, w: l.w - 28, h: v.stoveH };
  }

  function kitchenCookButtonRect() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    return { x: l.w / 2 - 96 + 34, y: v.stoveY + 150, w: 192, h: 42 };
  }

  function kitchenDishRect() {
    const l = state.layout;
    const v = kitchenVerticalLayout();
    return { x: 18, y: v.dishY, w: l.w - 36, h: v.dishH };
  }

  function kitchenDishActionRect() {
    const l = state.layout;
    const dish = kitchenDishRect();
    return { x: l.w / 2 - 100, y: dish.y + dish.h + 8, w: 200, h: 42 };
  }

  function kitchenPrepareRect() {
    const l = state.layout;
    return { x: l.w / 2 - 118, y: l.h - 58, w: 236, h: 46 };
  }

  function skillShopRects() {
    const l = state.layout;
    return currentShopSkills().map((skill, i) => ({ skill, x: 22, y: 164 + i * 96, w: l.w - 44, h: 82 }));
  }

  function handleKitchenCookDown(p) {
    for (const r of kitchenSlotRects()) {
      if (!hit(p, inflate(r, 4)) || r.index >= state.save.kitchen.slots) continue;
      if (state.kitchenSlots[r.index]) {
        state.kitchenSlots[r.index] = null;
        setPressed(`kitchenSlot-${r.index}`);
      }
      return;
    }
    for (const r of kitchenIngredientRects()) {
      if (!hit(p, inflate(r, 4))) continue;
      const used = state.kitchenSlots.filter(id => id === r.ingredient.id).length;
      if ((state.save.pantry[r.ingredient.id] || 0) <= used) {
        setToast(ui('这种食材没有更多库存', 'No more stock for this ingredient'), 1.2);
        return;
      }
      state.kitchenDrag = { id: r.ingredient.id, startX: p.x, startY: p.y, x: p.x, y: p.y, moved: false };
      setPressed(`ingredient-${r.ingredient.id}`);
      return;
    }
    const methods = kitchenMethodRects();
    if (hit(p, inflate(methods.stir, 5))) {
      state.kitchenMethod = 'stir';
      setPressed('methodStir');
      return;
    }
    if (hit(p, inflate(methods.steam, 5))) {
      state.kitchenMethod = 'steam';
      setPressed('methodSteam');
      return;
    }
    if (hit(p, inflate(kitchenCookButtonRect(), 8))) {
      setPressed('cookRecipe');
      cookSelectedRecipe();
      return;
    }
    if (hit(p, inflate(kitchenDishActionRect(), 7))) {
      setPressed('dishAction');
      if (state.save.platedDish && state.save.platedDish.id === 'dark') discardPlatedDish();
      else state.kitchenView = 'market';
      return;
    }
  }

  function finishKitchenDrag(p) {
    const drag = state.kitchenDrag;
    state.kitchenDrag = null;
    if (!drag) return;
    const available = state.save.kitchen.slots;
    const target = kitchenSlotRects().find(r => r.index < available && hit(p, inflate(r, 8)));
    let index = target ? target.index : -1;
    if (index < 0 && !drag.moved) index = state.kitchenSlots.findIndex((id, i) => i < available && !id);
    if (index < 0) {
      setToast(ui('请把食材放进空的料理格', 'Drop the ingredient into an empty slot'), 1.2);
      return;
    }
    if (state.kitchenSlots[index]) {
      setToast(ui('这个料理格已经有食材', 'That cooking slot is occupied'), 1.2);
      return;
    }
    state.kitchenSlots[index] = drag.id;
  }

  function kitchenCookDuration(chefCount = totalChefCount()) {
    return Math.max(1.2, 6 / Math.sqrt(Math.max(1, chefCount)));
  }

  function kitchenJobProgress() {
    const job = state.save.kitchenJob;
    if (!job) return 0;
    return clamp((Date.now() - job.startedAt) / Math.max(1, job.finishAt - job.startedAt), 0, 1);
  }

  function startKitchenJob(recipeId) {
    const chefs = Math.max(0, totalChefCount());
    const duration = kitchenCookDuration(chefs);
    const startedAt = Date.now();
    state.save.kitchenJob = { recipeId, chefs, startedAt, finishAt: startedAt + duration * 1000 };
    state.kitchenCookFx = 1.15;
    saveGame();
    setToast(ui(`小厨师开工，预计 ${duration.toFixed(1)} 秒出餐`, `Chefs started; ready in ${duration.toFixed(1)}s`), 1.7);
  }

  function finishKitchenJobIfReady(force = false) {
    const job = state.save && state.save.kitchenJob;
    if (!job || (!force && Date.now() < job.finishAt)) return false;
    state.save.kitchenJob = null;
    if (job.recipeId === 'dark') {
      state.save.platedDish = { id: 'dark' };
      saveGame();
      if (state.screen === 'pets') setToast(ui('出餐完成：黑暗料理需要清理', 'Ready: discard the dark dish'), 1.7);
      return true;
    }
    const recipe = RECIPES.find(item => item.id === job.recipeId);
    if (!recipe) {
      saveGame();
      return false;
    }
    const first = !state.save.recipes[recipe.id];
    state.save.recipes[recipe.id] = true;
    state.save.dishInventory[recipe.id] = (state.save.dishInventory[recipe.id] || 0) + 1;
    if (first) state.save.firstSaleBonuses[recipe.id] = true;
    saveGame();
    if (state.screen === 'pets') setToast(first
      ? ui(`发现新食谱：${recipe.name}，已存入料理仓库`, `New recipe: ${recipe.nameEn}. Stored for sale.`)
      : ui(`${recipe.name}出餐完成，已存入仓库`, `${recipe.nameEn} is ready and stored`), 2.0);
    return true;
  }

  function cookSelectedRecipe() {
    finishKitchenJobIfReady();
    if (state.save.kitchenJob) {
      setToast(ui('小厨师正在出餐，请等待进度完成', 'Chefs are still cooking'), 1.3);
      return;
    }
    if (state.save.platedDish && state.save.platedDish.id === 'dark') {
      setToast(ui('请先清理出餐台上的黑暗料理', 'Discard the dark dish first'), 1.3);
      return;
    }
    const selected = state.kitchenSlots.slice(0, state.save.kitchen.slots).filter(Boolean).sort();
    if (selected.length < 2) {
      setToast(ui('至少选择两种食材进行实验', 'Choose at least two ingredients'), 1.3);
      return;
    }
    if (selected.some(id => (state.save.pantry[id] || 0) <= 0)) {
      setToast(ui('食材库存不足', 'Not enough ingredients'), 1.2);
      state.kitchenSlots = [null, null, null, null];
      return;
    }
    selected.forEach(id => { state.save.pantry[id] -= 1; });
    const recipe = RECIPES.find(item => item.method === state.kitchenMethod
      && item.ingredients.slice().sort().join('|') === selected.join('|'));
    if (!recipe) {
      state.kitchenSlots = [null, null, null, null];
      startKitchenJob('dark');
      return;
    }
    state.kitchenSlots = [null, null, null, null];
    startKitchenJob(recipe.id);
  }

  function sellStoredDish(recipeId) {
    const recipe = RECIPES.find(item => item.id === recipeId);
    const stock = recipe ? Math.max(0, Number(state.save.dishInventory[recipe.id] || 0)) : 0;
    if (!recipe || stock <= 0) {
      setToast(ui('这道料理暂时没有库存', 'No stock for this dish'), 1.2);
      return;
    }
    const oldTitle = businessTitleInfo().current;
    const bonus = state.save.firstSaleBonuses[recipe.id] ? 60 : 0;
    const income = dailyDishPrice(recipe) + bonus;
    state.save.dishInventory[recipe.id] -= 1;
    state.save.firstSaleBonuses[recipe.id] = false;
    state.save.coins += income;
    state.save.lifetimeRevenue += income;
    saveGame();
    const newTitle = businessTitleInfo().current;
    setToast(newTitle !== oldTitle
      ? ui(`料理出售 +${income}，晋升「${newTitle.name}」`, `Sold +${income}; promoted to ${newTitle.nameEn}`)
      : ui(`按今日行情出售 +${income} 铜钱`, `Sold at today’s price +${income}`), 1.8);
  }

  function sellPlatedDish() {
    const recipe = RECIPES.find(item => (state.save.dishInventory[item.id] || 0) > 0);
    if (!recipe) {
      setToast(ui('料理仓库暂时没有库存', 'Dish inventory is empty'), 1.2);
      return;
    }
    sellStoredDish(recipe.id);
  }

  function discardPlatedDish() {
    if (!state.save.platedDish) return;
    state.save.platedDish = null;
    saveGame();
    setToast(ui('黑暗料理已经清理', 'Dark dish discarded'), 1.3);
  }

  function nextKitchenUpgrade() {
    return KITCHEN_UPGRADES.find(upgrade => upgrade.slots > state.save.kitchen.slots) || null;
  }

  function upgradeKitchenSlots() {
    const upgrade = nextKitchenUpgrade();
    if (!upgrade) {
      setToast(ui('当前料理台已经完成全部灰盒扩建', 'The greybox counter is fully expanded'), 1.3);
      return;
    }
    if (recipeCount() < upgrade.recipes) {
      setToast(ui(`需要先发现 ${upgrade.recipes} 道料理`, `Discover ${upgrade.recipes} recipes first`), 1.3);
      return;
    }
    if (state.save.coins < upgrade.price) {
      setToast(ui(`扩建需要 ${upgrade.price} 铜钱`, `Expansion costs ${upgrade.price} coins`), 1.3);
      return;
    }
    state.save.coins -= upgrade.price;
    state.save.kitchen.slots = upgrade.slots;
    saveGame();
    setToast(ui(`${upgrade.name}永久建成`, `${upgrade.nameEn} built permanently`), 1.7);
  }

  function buyDailySkill(skill) {
    hasDailySkill(skill.id);
    if (!(state.save.dailySkills.offers || []).includes(skill.id)) {
      setToast(ui('这个技能不在本局随机商店中', 'This skill is not in this run shop'), 1.2);
      return;
    }
    if (state.save.dailySkills.ids.includes(skill.id)) {
      setToast(ui('这个技能今天已经拥有，出发前可以携带', 'Already owned today; carry it before a run'), 1.2);
      return;
    }
    if ((state.save.coins || 0) < skill.price) {
      setToast(ui('铜钱不足', 'Not enough coins'), 1.2);
      return;
    }
    state.save.coins -= skill.price;
    state.save.dailySkills.ids.push(skill.id);
    state.save.dailySkills.offers = state.save.dailySkills.offers.filter(id => id !== skill.id);
    saveGame();
    setToast(ui(`${skill.name}已加入今日技能库`, `${skill.nameEn} added to today’s skill pool`), 1.5);
  }

  function drawKitchenCook() {
    const v = kitchenVerticalLayout();
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.fillText(ui('① 从食材架拖进锅里', '① Drag ingredients into the stove'), 16, v.pantryY - 10);
    ctx.textAlign = 'right';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(ui(`测试库存：每种至少 ${TEST_PANTRY_STOCK}`, `Test stock: at least ${TEST_PANTRY_STOCK} each`), state.layout.w - 16, v.pantryY - 10);
    ctx.restore();

    kitchenIngredientRects().forEach(r => drawKitchenIngredient(r));
    drawKitchenStove();
    drawPlatedDish();
    if (state.kitchenDrag) drawKitchenDraggedIngredient();
  }

  function drawKitchenIngredient(r) {
    const count = state.save.pantry[r.ingredient.id] || 0;
    drawPressTransform(r, `ingredient-${r.ingredient.id}`, () => {
      ctx.fillStyle = count > 0 ? '#fffdf6' : '#e8e4da';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      roundRect(r.x, r.y, r.w, r.h, 14, true, true, 3);
      drawIngredientIcon(r.ingredient, r.x + r.w / 2, r.y + 25, 28);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 10px system-ui, sans-serif';
      ctx.fillText(isEn() ? r.ingredient.realEn : r.ingredient.real, r.x + r.w / 2, r.y + 51, r.w - 8);
      ctx.fillStyle = '#fff06d';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x + r.w - 10, r.y + 10, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.font = '900 9px system-ui, sans-serif';
      ctx.fillText(`×${count}`, r.x + r.w - 10, r.y + 10);
    });
  }

  function drawIngredientIcon(ingredient, cx, cy, size) {
    if (!ingredient) return;
    const s = size;
    ctx.save();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(2, s * 0.08);
    if (ingredient.id === 'tomato') {
      ctx.fillStyle = '#e94a3a';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, s * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5f9d3d';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.38);
      ctx.lineTo(cx - s * 0.22, cy - s * 0.14);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.14);
      ctx.closePath();
      ctx.fill();
    } else if (ingredient.id === 'egg') {
      ctx.fillStyle = '#fffdf6';
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.40, s * 0.33, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f5bc2e';
      ctx.beginPath();
      ctx.arc(cx + 2, cy, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (ingredient.id === 'rice') {
      ctx.fillStyle = '#fffdf6';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, s * 0.38, s * 0.22, 0, Math.PI, Math.PI * 2);
      ctx.lineTo(cx + s * 0.30, cy + s * 0.28);
      ctx.lineTo(cx - s * 0.30, cy + s * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      for (let i = -2; i <= 2; i++) ctx.fillRect(cx + i * s * 0.10 - 1, cy - s * 0.18 + Math.abs(i) * 1.2, 2, 5);
    } else {
      ctx.fillStyle = '#78c9ed';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.42);
      ctx.bezierCurveTo(cx + s * 0.40, cy, cx + s * 0.28, cy + s * 0.38, cx, cy + s * 0.40);
      ctx.bezierCurveTo(cx - s * 0.28, cy + s * 0.38, cx - s * 0.40, cy, cx, cy - s * 0.42);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawKitchenStove() {
    const stove = kitchenStoveRect();
    ctx.save();
    ctx.fillStyle = '#fff2c4';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    roundRect(stove.x, stove.y, stove.w, stove.h, 22, true, true, 4);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText(ui('② 放进大灶台', '② Load the big stove'), stove.x + 16, stove.y + 20);
    ctx.restore();

    drawLeadKitchenChef(stove);
    drawKitchenSlots();
    const methods = kitchenMethodRects();
    drawTab(methods.stir, ui('炒', 'Stir'), state.kitchenMethod === 'stir');
    drawTab(methods.steam, ui('蒸', 'Steam'), state.kitchenMethod === 'steam');
    if (state.save.kitchenJob) drawKitchenJobProgress();
    else drawUIButton(kitchenCookButtonRect(), ui('③ 小厨师开工！', '③ Chefs, cook!'), ui(`当前 ${totalChefCount()} 名厨师`, `${totalChefCount()} chefs ready`), 'cookRecipe');
    drawKitchenSteamFx(stove);
  }

  function drawKitchenJobProgress() {
    const r = kitchenCookButtonRect();
    const job = state.save.kitchenJob;
    const progress = kitchenJobProgress();
    const remaining = Math.max(0, (job.finishAt - Date.now()) / 1000);
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(r.x, r.y, r.w, r.h, 13, true, true, 3);
    ctx.save();
    ctx.beginPath();
    roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 11, false, false, 0);
    ctx.clip();
    ctx.fillStyle = '#fff06d';
    ctx.fillRect(r.x + 2, r.y + 2, (r.w - 4) * progress, r.h - 4);
    ctx.restore();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.fillText(ui(`出餐中 ${remaining.toFixed(1)}秒`, `Cooking ${remaining.toFixed(1)}s`), r.x + r.w / 2, r.y + 15);
    ctx.font = '700 9px system-ui, sans-serif';
    const team = job.chefs > 0 ? ui(`${job.chefs} 名厨师协作`, `${job.chefs} chefs`) : ui('基础灶台', 'Base stove');
    ctx.fillText(`${team} · ${Math.round(progress * 100)}%`, r.x + r.w / 2, r.y + 31);
    ctx.restore();
  }

  function drawLeadKitchenChef(stove) {
    const preferred = state.kitchenMethod === 'steam' ? 'dog' : 'rabbit';
    const pet = PETS.find(item => item.id === preferred && petSave(item.id).met)
      || PETS.find(item => petSave(item.id).met);
    const bounce = state.kitchenCookFx > 0 ? Math.sin(state.t * 22) * 5 : Math.sin(state.t * 2.4) * 1.5;
    const box = { x: stove.x + 12, y: stove.y + 42 + bounce, w: 64, h: 82 };
    ctx.save();
    ctx.fillStyle = pet ? pet.tint : '#e9e5da';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(box.x, box.y, box.w, box.h, 15, true, true, 3);
    if (pet) {
      drawPetPortrait(pet, box);
      const count = petSave(pet.id).count;
      ctx.fillStyle = '#fff06d';
      ctx.beginPath();
      ctx.arc(box.x + box.w - 7, box.y + 8, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 9px system-ui, sans-serif';
      ctx.fillText(`×${count}`, box.x + box.w - 7, box.y + 8);
    } else {
      drawChefHat(box.x + box.w / 2, box.y + 29, 32);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.fillText('?', box.x + box.w / 2, box.y + 59);
    }
    ctx.restore();
  }

  function drawKitchenSlots() {
    const available = state.save.kitchen.slots;
    kitchenSlotRects().forEach(r => {
      const ingredient = ingredientById(state.kitchenSlots[r.index]);
      const unlocked = r.index < available;
      ctx.save();
      ctx.fillStyle = unlocked ? '#fffdf6' : '#d8d2c5';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = unlocked ? 4 : 2;
      roundRect(r.x, r.y, r.w, r.h, 14, true, true, unlocked ? 4 : 2);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ingredient) drawIngredientIcon(ingredient, r.x + r.w / 2, r.y + r.h / 2 - 5, 24);
      ctx.font = ingredient ? '900 8px system-ui, sans-serif' : '800 18px system-ui, sans-serif';
      const label = !unlocked ? '×' : ingredient ? (isEn() ? ingredient.realEn : ingredient.real) : '+';
      ctx.fillText(label, r.x + r.w / 2, r.y + r.h - 8, r.w - 5);
      ctx.restore();
    });
  }

  function drawKitchenSteamFx(stove) {
    if (state.kitchenCookFx <= 0) return;
    const p = state.kitchenCookFx / 1.15;
    ctx.save();
    ctx.globalAlpha = clamp(p, 0, 1);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const x = stove.x + stove.w * (0.42 + i * 0.12);
      const y = stove.y + 88 - (1 - p) * 38 - (i % 2) * 8;
      ctx.beginPath();
      ctx.arc(x, y, 5 + i, Math.PI * 0.15, Math.PI * 1.45);
      ctx.stroke();
    }
    ctx.fillStyle = '#b72820';
    ctx.textAlign = 'center';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillText(state.kitchenMethod === 'steam' ? ui('蒸汽腾腾！', 'Steaming!') : ui('锅气爆发！', 'Wok burst!'), stove.x + stove.w * 0.64, stove.y + 34);
    ctx.restore();
  }

  function drawKitchenDraggedIngredient() {
    const ingredient = ingredientById(state.kitchenDrag.id);
    if (!ingredient) return;
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#fff06d';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(state.kitchenDrag.x - 38, state.kitchenDrag.y - 23, 76, 46, 12, true, true, 3);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.fillText(isEn() ? ingredient.realEn : ingredient.real, state.kitchenDrag.x, state.kitchenDrag.y, 68);
    ctx.restore();
  }

  function drawPlatedDish() {
    const r = kitchenDishRect();
    const dish = state.save.platedDish;
    const count = totalDishCount();
    ctx.save();
    ctx.fillStyle = dish || count ? '#fff6c7' : '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(r.x, r.y, r.w, r.h, 16, true, true, 3);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.fillText(ui('料理仓库 · 可以跨天囤货', 'Dish Stock · hold across days'), r.x + r.w / 2, r.y + 16);
    ctx.font = dish || count ? '900 15px system-ui, sans-serif' : '700 11px system-ui, sans-serif';
    const title = dish && dish.id === 'dark' ? ui('黑暗料理', 'Dark Dish')
      : count ? ui(`已保存 ${count} 份料理`, `${count} dishes stored`)
      : ui('做好料理后会存入这里', 'Cooked dishes are stored here');
    ctx.fillText(title, r.x + r.w / 2, r.y + 41, r.w - 24);
    ctx.font = '700 10px system-ui, sans-serif';
    const sub = dish ? ui('实验失败，需要先清理', 'Failed experiment; discard it')
      : ui('每日行情不同，高价时再出售', 'Daily prices change; sell when high');
    ctx.fillText(sub, r.x + r.w / 2, r.y + r.h - 14, r.w - 24);
    ctx.restore();
    drawUIButton(kitchenDishActionRect(), dish ? ui('丢弃料理', 'Discard Dish') : ui('查看今日行情', 'View Today’s Market'), dish ? '' : ui(`库存 ${count} 份`, `${count} in stock`), 'dishAction');
  }

  function shopPrepareRect() {
    const l = state.layout;
    return { x: l.w / 2 - 118, y: l.h - 60, w: 236, h: 46 };
  }

  function handleSkillShopDown(p) {
    if (hit(p, inflate(backButtonRect(), 8))) {
      setPressed('back');
      state.screen = state.shopReturnTo || 'result';
      if (state.screen === 'pets') state.kitchenView = 'cook';
      return;
    }
    for (const r of skillShopRects()) {
      if (!hit(p, inflate(r, 5))) continue;
      setPressed(`daily-${r.skill.id}`);
      buyDailySkill(r.skill);
      return;
    }
    if (hit(p, inflate(shopPrepareRect(), 7))) {
      setPressed('shopPrepare');
      openRunPreparation();
    }
  }

  function drawSkillShop() {
    const l = state.layout;
    drawMenuBackground();
    drawBackButton();
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    roundRect(20, 78, l.w - 40, 68, 18, true, true, 4);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText(ui('本轮技能铺', 'Run Skill Shop'), l.w / 2, 101);
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText(ui(`铜钱 ${state.save.coins || 0} · 买下后仍需出发前携带`, `Coins ${state.save.coins || 0} · equip purchases before patrol`), l.w / 2, 128, l.w - 64);
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(ui('每局结束刷新 · 固定价格 · 00:00清空', 'Refreshes after each run · fixed price · resets at midnight'), l.w / 2, Math.min(l.h - 100, 470), l.w - 36);
    const owned = state.save.dailySkills.ids.map(dailySkillById).filter(Boolean).map(skill => isEn() ? skill.nameEn : skill.name);
    ctx.fillText(ui(`今日已拥有：${owned.length ? owned.join('、') : '暂无'}`, `Owned today: ${owned.length ? owned.join(', ') : 'None'}`), l.w / 2, Math.min(l.h - 82, 490), l.w - 36);
    ctx.restore();
    const rects = skillShopRects();
    if (!rects.length) {
      ctx.save();
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      roundRect(28, 178, l.w - 56, 112, 20, true, true, 4);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 25px system-ui, sans-serif';
      ctx.fillText(ui('本轮技能已看完', 'No Offers Left'), l.w / 2, 220);
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillText(ui('完成下一局后会刷新随机技能', 'Finish another run to refresh'), l.w / 2, 258, l.w - 90);
      ctx.restore();
    } else {
      rects.forEach(r => drawDailySkillCard(r));
    }
    drawUIButton(shopPrepareRect(), ui('去出发准备', 'Go to Loadout'), ui('主动1格 · 被动/触发2格', '1 active · 2 support'), 'shopPrepare');
  }

  function drawDailySkillCard(r) {
    const active = hasDailySkill(r.skill.id);
    ctx.save();
    ctx.fillStyle = active ? '#111' : '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(r.x, r.y, r.w, r.h, 14, true, true, 3);
    ctx.fillStyle = active ? '#fffdf6' : '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '900 16px system-ui, sans-serif';
    const typeLabel = r.skill.type === 'active' ? ui('主动', 'Active') : r.skill.type === 'trigger' ? ui('触发', 'Triggered') : ui('被动', 'Passive');
    ctx.fillText(`${isEn() ? r.skill.nameEn : r.skill.name} · ${typeLabel}`, r.x + 14, r.y + 11);
    ctx.font = '700 11.5px system-ui, sans-serif';
    wrapText(isEn() ? r.skill.descEn : r.skill.desc, r.x + 14, r.y + 36, r.w - 128, 16, 'left');
    ctx.textAlign = 'right';
    ctx.font = '900 12px system-ui, sans-serif';
    const status = active ? ui('今日已拥有', 'OWNED TODAY') : ui(`${r.skill.price} 铜钱`, `${r.skill.price} coins`);
    ctx.fillText(status, r.x + r.w - 14, r.y + 34);
    ctx.restore();
  }

  function drawPetCard(r, pet) {
    const ps = petSave(pet.id);
    const met = !!ps.met;

    drawPressTransform(r, `pet-${pet.id}`, () => {
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      roundRect(r.x, r.y, r.w, r.h, 18, true, true, 4);

      const portrait = { x: r.x + 14, y: r.y + 14, w: Math.min(104, r.h - 28), h: r.h - 28 };
      ctx.save();
      ctx.fillStyle = pet.tint;
      roundRect(portrait.x, portrait.y, portrait.w, portrait.h, 14, true, false, 0);
      ctx.globalAlpha = met ? 1 : 0.42;
      drawPetPortrait(pet, portrait);
      ctx.restore();

      const tx = portrait.x + portrait.w + 16;
      const tw = r.x + r.w - tx - 16;
      ctx.fillStyle = '#111';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '900 19px system-ui, sans-serif';
      ctx.fillText(met ? (isEn() ? pet.nameEn : pet.name) : ui('尚未加入', 'Not joined'), tx, r.y + 18, tw);
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText(met ? ui(`厨房队伍 ×${ps.count}`, `Kitchen team ×${ps.count}`) : ui(`在门后遇见${pet.animalName}`, `Meet ${pet.animalName} behind a door`), tx, r.y + 45, tw);
      ctx.font = '700 12px system-ui, sans-serif';
      wrapText(met ? (isEn() ? pet.roleEn : pet.role) : ui('加入后只在厨房帮忙，不进入巡夜。', 'Joins the kitchen only and never enters a run.'), tx, r.y + 68, tw, 16, 'left');
      ctx.font = '900 12px system-ui, sans-serif';
      const status = met ? ui('厨师帽已领取 · 重复遇见扩充队伍', 'Chef hat on · repeat meetings grow the team') : ui('待加入厨房', 'Waiting to join');
      ctx.fillText(status, tx, r.y + r.h - 24, tw);
    });
  }

  function drawPetPortrait(pet, box) {
    const def = PEOPLE.find(p => p.name === pet.animalName);
    if (def) drawCardImage(def, box);
    drawChefHat(box.x + box.w / 2, box.y + box.h * 0.20, Math.min(box.w, box.h) * 0.38);
  }

  function drawCardImage(item, box) {
    const img = getAssetImage(item.file);
    if (img) {
      const pad = 2;
      const x = box.x + pad;
      const y = box.y + pad;
      const w = box.w - pad * 2;
      const h = box.h - pad * 2;
      const galleryScale = item.galleryScale || 1;

      if (galleryScale === 1) {
        drawContainImage(img, x, y, w, h);
      } else {
        const ar = img.naturalWidth / img.naturalHeight;
        let dw = w;
        let dh = dw / ar;
        if (dh > h) {
          dh = h;
          dw = dh * ar;
        }
        dw *= galleryScale;
        dh *= galleryScale;
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      }
    } else {
      drawFallbackCharacter(item.name, box.x + box.w / 2, box.y + box.h * 0.1, box.w * 0.55, box.h * 0.86, state.galleryTab === 'people' ? 'person' : 'ghost');
    }
  }

  function drawUnknownEgg(box, cardW) {
    ctx.save();
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h * 0.52;
    const rx = Math.min(box.w * 0.24, box.h * 0.28);
    const ry = Math.min(box.h * 0.32, box.w * 0.38);
    ctx.fillStyle = '#111';
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = `900 ${Math.max(24, cardW * 0.30)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fffdf6';
    ctx.fillStyle = '#111';
    ctx.strokeText('?', cx, cy);
    ctx.fillText('?', cx, cy);
    ctx.restore();
  }


  function drawResult() {
    const l = state.layout;
    drawMenuBackground();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fffdf6';
    const panel = { x: l.w * 0.07, y: Math.max(88, l.h * 0.14), w: l.w * 0.86, h: Math.min(390, l.h * 0.52) };
    roundRect(panel.x, panel.y, panel.w, panel.h, 24, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.fillText(state.runSucceeded ? ui('安全收工', 'Safe Return') : ui('游戏结束', 'Game Over'), l.w / 2, panel.y + 48);
    ctx.font = '700 15px system-ui, sans-serif';
    wrapText(resultText(state.resultReason), l.w / 2, panel.y + 78, panel.w - 48, 20, 'center');
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.fillText(ui(`本次到达：第 ${state.room} 门  最高：第 ${state.save.bestRoom || 1} 门`, `Reached Door ${state.room}  Best ${state.save.bestRoom || 1}`), l.w / 2, panel.y + 124);

    ctx.textAlign = 'left';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillText(ui('本局收获', 'Run Rewards'), panel.x + 28, panel.y + 158);
    ctx.font = '700 12px system-ui, sans-serif';
    let yy = panel.y + 182;
    resultRewardLines().forEach(line => {
      yy = wrapText(line, panel.x + 28, yy, panel.w - 56, 16, 'left') + 2;
    });
    ctx.textAlign = 'center';
    ctx.font = '700 11px system-ui, sans-serif';
    wrapText(ui('本轮技能铺已刷新；可先去厨房卖料理再购买', 'Run shop refreshed; you can sell dishes before buying'), l.w / 2, panel.y + panel.h - 26, panel.w - 48, 15, 'center');
    ctx.restore();

    const actions = resultActionRects();
    drawUIButton(actions.shop, ui('本轮技能铺', 'Skill Shop'), '', 'resultShop');
    drawUIButton(actions.kitchen, ui('去厨房', 'Kitchen'), '', 'petsResult');
    drawUIButton(actions.prepare, ui('重新准备', 'Prepare'), '', 'again');
    drawUIButton(actions.home, ui('返回门口', 'Entrance'), '', 'homeResult');
  }

  function resultButtonsY() {
    const l = state.layout;
    return Math.min(l.h - 122, Math.max(l.h * 0.69, l.h * 0.14 + Math.min(390, l.h * 0.52) + 18));
  }

  function resultRewardLines() {
    const r = state.runRewards || emptyRunRewards();
    const lines = [
      ui(`通过房间：${r.passedDoors}  灵火 +${r.spirit}  符纸碎片 +${r.talismanDust}`, `Cleared: ${r.passedDoors}  Spirit +${r.spirit}  Dust +${r.talismanDust}`)
    ];
    if (r.newPets.length) {
      lines.push(ui(`新结缘：${r.newPets.map(id => petById(id).name).join('、')}`, `New pets: ${r.newPets.map(id => petById(id).nameEn).join(', ')}`));
    }
    const banked = countMapEntries(r.bankedIngredients) ? r.bankedIngredients : null;
    const lost = countMapEntries(r.lostIngredients) ? r.lostIngredients : null;
    if (banked) {
      lines.push(ui(`安全带回：${formatIngredientMap(banked)}`, `Brought home: ${formatIngredientMap(banked)}`));
    }
    if (countMapEntries(r.preservedIngredients)) {
      lines.push(ui(`保鲜背包保住：${formatIngredientMap(r.preservedIngredients)}`, `Fresh Pack saved: ${formatIngredientMap(r.preservedIngredients)}`));
    }
    if (lost) {
      lines.push(ui(`失败丢失：${formatIngredientMap(lost)}`, `Lost: ${formatIngredientMap(lost)}`));
    }
    Object.keys(r.petJoins || {}).forEach(id => {
      const pet = petById(id);
      if (pet) lines.push(ui(`厨房队加入：${pet.name} +${r.petJoins[id]}`, `Kitchen team: ${pet.nameEn} +${r.petJoins[id]}`));
    });
    if (lines.length === 1 && r.passedDoors === 0 && r.spirit === 0 && r.talismanDust === 0) {
      lines.push(ui('这局没有带回资源，再试一门就会有收获。', 'No rewards this run. Clear one door to bring something back.'));
    }
    return lines.slice(0, 7);
  }

  function resultText(zh) {
    if (!isEn()) return zh;
    const map = {
      '门开太久，鬼冲出来了': 'The door stayed open too long. The ghost escaped.',
      '封错了，它只是普通小动物': 'Wrong seal. It was just a normal animal.',
      '封错了，这间房是空的': 'Wrong seal. This room was empty.',
      '强制Boss战失败，Boss冲出来了': 'Forced boss fight failed. The boss broke out.'
      ,'见好就收，食材安全带回': 'You stopped in time and brought the ingredients home.'
    };
    return map[zh] || zh || 'Run ended.';
  }

  function drawTitleBlock(title, sub) {
    const l = state.layout;
    ctx.save();
    ctx.fillStyle = '#fffdf6';
    roundRect(l.w * 0.08, l.h * 0.18, l.w * 0.84, 104, 22, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.fillText(title, l.w / 2, l.h * 0.18 + 45);
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText(sub, l.w / 2, l.h * 0.18 + 76);
    ctx.restore();
  }

  function drawBackButton() {
    const label = state.screen === 'gallery' && state.lastScreen === 'game' ? ui('返回游戏', 'Back') : ui('返回', 'Back');
    drawMiniButton(backButtonRect(), label, 'back');
  }

  function formatIngredientMap(map) {
    return Object.keys(map || {}).filter(id => map[id] > 0).map(id => {
      const ingredient = ingredientById(id);
      const label = ingredient ? (isEn() ? ingredient.nameEn : ingredient.name) : id;
      return `${label}×${map[id]}`;
    }).join(isEn() ? ', ' : '、');
  }

  function backButtonRect() {
    return { x: 68, y: 18, w: 70, h: 40 };
  }

  function drawPressTransform(r, id, drawFn) {
    const pressed = isPressed(id);
    ctx.save();
    if (pressed) {
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.scale(0.94, 0.94);
      ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
      ctx.globalAlpha *= 0.86;
    }
    drawFn();
    ctx.restore();
  }

  function drawErrorScreen(err) {
    const l = state.layout || { w: canvas.clientWidth || 390, h: canvas.clientHeight || 760 };
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, l.w, l.h);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillText('游戏绘制出错：', 20, 28);
    ctx.font = '700 13px system-ui, sans-serif';
    wrapText(err && err.message ? err.message : String(err), 20, 62, l.w - 40, 20, 'left');
    ctx.font = '700 12px system-ui, sans-serif';
    wrapText('请截图控制台错误给我。', 20, 112, l.w - 40, 18, 'left');
    ctx.restore();
  }

  function musicButtonRect() {
    return { x: 10, y: 18, w: 46, h: 36 };
  }

  function drawMusicButton() {
    const r = musicButtonRect();
    drawPressTransform(r, 'music', () => {
      ctx.fillStyle = state.musicOn ? '#111' : '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      roundRect(r.x, r.y, r.w, r.h, 12, true, true, 3);
      ctx.fillStyle = state.musicOn ? '#fffdf6' : '#111';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.musicOn ? '♪' : '♫', r.x + r.w / 2, r.y + r.h / 2 + 1);
    });
  }

  function drawMiniButton(r, text, id = '') {
    drawPressTransform(r, id, () => {
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      roundRect(r.x, r.y, r.w, r.h, 12, true, true, 3);
      ctx.fillStyle = '#111';
      ctx.font = '800 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, r.x + r.w / 2, r.y + r.h / 2);
    });
  }

  function drawUIButton(r, title, sub = '', id = '') {
    drawPressTransform(r, id, () => {
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 5;
      roundRect(r.x, r.y, r.w, r.h, 18, true, true, 5);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = sub ? '900 22px system-ui, sans-serif' : '900 24px system-ui, sans-serif';
      ctx.fillText(title, r.x + r.w / 2, r.y + r.h / 2 - (sub ? 10 : 0));
      if (sub) {
        ctx.font = '700 12px system-ui, sans-serif';
        ctx.fillText(sub, r.x + r.w / 2, r.y + r.h / 2 + 18);
      }
    });
  }

  function drawTab(r, text, active) {
    ctx.save();
    ctx.fillStyle = active ? '#111' : '#fffdf6';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    roundRect(r.x, r.y, r.w, r.h, 13, true, true, 3);
    ctx.fillStyle = active ? '#fffdf6' : '#111';
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, r.x + r.w / 2, r.y + r.h / 2);
    ctx.restore();
  }

  function petMenuSub() {
    const met = PETS.filter(p => petSave(p.id).met).length;
    return ui(`${met}/${PETS.length} 厨房帮工`, `${met}/${PETS.length} kitchen helpers`);
  }
  function kitchenMenuSub() {
    const title = businessTitleInfo().current;
    return ui(`${title.name} · 料理库存 ${totalDishCount()}`, `${title.nameEn} · Dishes ${totalDishCount()}`);
  }
  function hasAnyPetMet() { return PETS.some(p => petSave(p.id).met); }
  function collectCountText() { return `${seenGhostCount() + seenPeopleCount()}/${GHOSTS.length + PEOPLE.length}`; }
  function seenGhostCount() { return GHOSTS.filter(g => state.save.ghosts[g.name]).length; }
  function seenPeopleCount() { return PEOPLE.filter(p => state.save.people[p.name]).length; }

  function measureLinesHeight(lines, maxWidth, lineHeight, gap = 0) {
    let total = 0;
    lines.forEach(line => { total += countWrappedLines(line, maxWidth) * lineHeight + gap; });
    return total;
  }

  function countWrappedLines(text, maxWidth) {
    const tokens = textTokens(text);
    let line = '';
    let count = 1;
    tokens.forEach(token => {
      const test = line + token;
      if (ctx.measureText(test).width > maxWidth && line.trim()) {
        line = token.trimStart ? token.trimStart() : token;
        count += 1;
      } else {
        line = test;
      }
    });
    return count;
  }

  function textTokens(text) {
    const s = String(text);
    if (/[A-Za-z]/.test(s) && /\s/.test(s)) return s.split(/(\s+)/).filter(Boolean);
    return s.split('');
  }

  function wrapText(text, x, y, maxWidth, lineHeight, align = 'left') {
    ctx.save();
    ctx.textAlign = align;
    const tokens = textTokens(text);
    let line = '';
    let yy = y;
    for (let i = 0; i < tokens.length; i++) {
      const test = line + tokens[i];
      if (ctx.measureText(test).width > maxWidth && line.trim()) {
        ctx.fillText(line.trimEnd ? line.trimEnd() : line, x, yy);
        line = tokens[i].trimStart ? tokens[i].trimStart() : tokens[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line.trimEnd ? line.trimEnd() : line, x, yy);
    ctx.restore();
    return yy + lineHeight;
  }

  function drawCoverImage(img, x, y, w, h) {
    const ar = img.naturalWidth / img.naturalHeight;
    const tr = w / h;
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (ar > tr) {
      sw = sh * tr;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / tr;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawContainImage(img, x, y, w, h) {
    const ar = img.naturalWidth / img.naturalHeight;
    let dw = w, dh = dw / ar;
    if (dh > h) {
      dh = h;
      dw = dh * ar;
    }
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawCroppedStretchImage(img, x, y, w, h, crop = 0) {
    const c = Math.max(0, crop || 0);
    const sx = c;
    const sy = c;
    const sw = Math.max(1, img.naturalWidth - c * 2);
    const sh = Math.max(1, img.naturalHeight - c * 2);
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawStretchImage(img, x, y, w, h) {
    ctx.drawImage(img, x, y, w, h);
  }

  function roundRectPath(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function roundRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
    roundRectPath(x, y, w, h, r);
    if (fill) ctx.fill();
    if (stroke) {
      const old = ctx.lineWidth;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.lineWidth = old;
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
