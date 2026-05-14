(() => {
  'use strict';

  const VERSION = 'v0.12.1_corridor_assets';
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
    seal: '封印按钮.png'
  };

  const GHOSTS = [
    { name: '猼訑', nameEn: 'Botuo', file: '鬼/猼訑.png', type: 'normal', speed: 1.28, fire: 2, desc: '警觉又狡猾，喜欢躲在门后观察人。', descEn: 'Alert and cunning. It likes watching people from behind the door.' },
    { name: '赤鱬', nameEn: 'Chiru', file: '鬼/赤鱬.png', type: 'thin', speed: 2.08, fire: 2, desc: '细长灵活，动作很快，最擅长突然贴近。', descEn: 'Slim, agile, and fast. It is good at suddenly closing the distance.' },
    { name: '当康', nameEn: 'Dangkang', file: '鬼/康当.png', type: 'heavy', speed: 1.05, fire: 2, desc: '体型敦实，压迫感强，逼近时像重物挪动。', descEn: 'Heavy and solid. Its approach feels like something massive shifting forward.' },
    { name: '混沌', nameEn: 'Hundun', file: '鬼/混沌.png', type: 'heavy', speed: 0.72, fire: 3, desc: '轮廓混乱，越盯着看越分不清它的形状。', descEn: 'A chaotic silhouette. The longer you stare, the harder it is to read.' },
    { name: '九尾狐', nameEn: 'Nine-tailed Fox', file: '鬼/九尾狐.png', type: 'normal', speed: 1.76, fire: 2, ghostEye: true, desc: '擅长迷惑视线，被封印后会短暂开启鬼眼。', descEn: 'A master of deception. Sealing it briefly activates Ghost Eye.' },
    { name: '夔牛', nameEn: 'Kui Ox', file: '鬼/夔牛.png', type: 'heavy', speed: 1.18, fire: 2, desc: '独脚震地，虽然不快，但每次靠近都很有压迫。', descEn: 'Not the fastest, but every step feels heavy and oppressive.' },
    { name: '麒麟', nameEn: 'Qilin', file: '鬼/麒麟.png', type: 'normal', speed: 1.42, fire: 2, desc: '外表庄重，但在门后出现时往往并不吉利。', descEn: 'It looks solemn, but seeing it behind the door is never a good sign.' },
    { name: '穷奇', nameEn: 'Qiongqi', file: '鬼/穷奇.png', type: 'thin', speed: 2.22, fire: 3, desc: '凶性外露，判断失误时最容易被它扑出门。', descEn: 'Ferocious and direct. One bad read can let it burst out.' },
    { name: '饕餮', nameEn: 'Taotie', file: '鬼/饕餮.png', type: 'heavy', speed: 1.32, fire: 3, desc: '贪婪巨口，虽然笨重，但存在感异常强烈。', descEn: 'A greedy maw. Slow and heavy, but impossible to ignore.' },
    { name: '狰', nameEn: 'Zheng', file: '鬼/狰.png', type: 'normal', speed: 1.70, fire: 3, desc: '神情凶狠，常常伴着成群鬼火一起出现。', descEn: 'A fierce presence, often surrounded by ghost fire.' },
    { name: '烛阴', nameEn: 'Zhuyin', file: '鬼/烛阴.png', type: 'thin', speed: 2.45, fire: 3, desc: '危险等级极高，速度极快，几乎不给人反应时间。', descEn: 'Extremely dangerous and very fast. It gives you almost no time to react.' }
  ];

  const PEOPLE = [
    { name: '兔子', nameEn: 'Rabbit', file: '小动物/兔子.png', scale: 1.08, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '刺猬', nameEn: 'Hedgehog', file: '小动物/刺猬.png', scale: 1.08, desc: '看起来警觉，但不是鬼。', descEn: 'Looks alert, but it is not a ghost.' },
    { name: '小狗', nameEn: 'Dog', file: '小动物/小狗.png', scale: 1.08, desc: '安全的小动物。', descEn: 'A safe little animal.' },
    { name: '小猪', nameEn: 'Piglet', file: '小动物/小猪.png', scale: 1.08, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '小猫', nameEn: 'Cat', file: '小动物/小猫.png', scale: 1.08, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' },
    { name: '松鼠', nameEn: 'Squirrel', file: '小动物/松鼠.png', scale: 1.08, desc: '动作很快，但不是鬼。', descEn: 'It moves quickly, but it is not a ghost.' },
    { name: '熊猫', nameEn: 'Panda', file: '小动物/熊猫.png', scale: 1.08, desc: '安全的小动物。', descEn: 'A safe little animal.' },
    { name: '狐狸', nameEn: 'Fox', file: '小动物/狐狸.png', scale: 1.08, desc: '看起来狡猾，但不是鬼。', descEn: 'Looks cunning, but it is not a ghost.' },
    { name: '猫头鹰', nameEn: 'Owl', file: '小动物/猫头鹰.png', scale: 1.08, desc: '眼神很怪，但目前安全。', descEn: 'Its eyes are strange, but it is safe.' },
    { name: '鸭子', nameEn: 'Duck', file: '小动物/鸭子.png', scale: 1.08, desc: '普通小动物，不需要封印。', descEn: 'A normal animal. Do not seal it.' }
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
    screen: 'menu',
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
    corridorOffset: 0,
    pendingNextRoom: 2,
    ghostEye: 0,
    eyeFx: 0,
    sealFlash: 0,
    bossDefeated: {},
    toast: null,
    resultReason: '',
    galleryTab: 'ghosts',
    galleryScroll: 0,
    galleryDragging: false,
    galleryDragStartY: 0,
    galleryDragStartScroll: 0,
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
      return { bestRoom: Number(data.bestRoom || 1), ghosts: data.ghosts || {}, people: data.people || {} };
    } catch (e) {
      return { bestRoom: 1, ghosts: {}, people: {} };
    }
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

  function preloadAll() {
    const files = [
      ROOM_ASSETS.wall, ROOM_ASSETS.room, ROOM_ASSETS.door, ROOM_ASSETS.frame, ROOM_ASSETS.seal,
      ...GHOST_FIRE_FILES,
      ...GHOSTS.map(g => g.file),
      ...PEOPLE.map(p => p.file)
    ];
    Array.from(new Set(files)).forEach(loadImageWithFallback);
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
    const topH = Math.max(84, Math.min(104, h * 0.112));
    const bottomH = Math.max(112, Math.min(140, h * 0.15));
    const gameTop = topH;
    const gameBottom = h - bottomH;
    const gameH = gameBottom - gameTop;

    const doorH = clamp(Math.min(gameH * 0.82, w * 1.34, 628), 380, 628);
    const doorW = doorH * 0.62;
    const doorX = (w - doorW) / 2;
    const doorY = gameTop + Math.max(16, (gameH - doorH) * 0.42);

    const door = { x: doorX, y: doorY, w: doorW, h: doorH };
    const hole = { x: doorX, y: doorY, w: doorW, h: doorH };

    return {
      w, h, topH, bottomH, gameTop, gameBottom, gameH,
      door, hole,
      home: { x: 10, y: 20, w: 64, h: 36 },
      galleryButton: { x: w - 86, y: 20, w: 76, h: 36 },
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
  function currentStageProgress(room = state.room) {
    const stage = bossStageForRoom(room);
    const index = ((room - 1) % 25) + 1;
    return { stage, index, ratio: index / 25, boss: bossGhostForStage(stage) };
  }

  function ghostCountForRoom(room) {
    if (room < 25) return 1;
    if (room < 50) return Math.random() < 0.34 ? 2 : 1;
    const r = Math.random();
    if (r < 0.22) return 3;
    if (r < 0.58) return 2;
    return 1;
  }

  function pickGhosts(count, room) {
    const unlockCount = clamp(4 + Math.floor(room / 8), 4, GHOSTS.length);
    const pool = GHOSTS.slice(0, unlockCount);
    const picked = [];
    while (picked.length < count) {
      const g = randItem(pool);
      if (!picked.includes(g)) picked.push(g);
    }
    return picked;
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

  function createContent() {
    state.mode = 'normal';
    state.door = 0;
    state.snapTarget = null;
    state.draggingDoor = false;
    state.danger = 0;
    state.transition = 0;
    state.corridorOffset = 0;
    state.content = makeContent(state.room);
  }

  function startRun(difficulty) {
    state.screen = 'game';
    state.difficulty = difficulty;
    state.room = 1;
    state.mode = 'normal';
    state.door = 0;
    state.danger = 0;
    state.ghostEye = 0;
    state.eyeFx = 0;
    state.bossDefeated = {};
    state.toast = null;
    state.resultReason = '';
    createContent();
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

  function setToast(text, time = 1.4) { state.toast = { text, time }; }

  function startCorridorAdvance(toRoom = state.room + 1) {
    state.mode = 'corridorTransition';
    state.transition = 0;
    state.corridorOffset = 0;
    state.pendingNextRoom = toRoom;
    state.nextContent = makeContent(toRoom);
    state.danger = 0;
    state.draggingDoor = false;
    state.snapTarget = null;
    state.save.bestRoom = Math.max(state.save.bestRoom || 1, toRoom);
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
  }

  function gameOver(reason) {
    state.resultReason = reason;
    state.save.bestRoom = Math.max(state.save.bestRoom || 1, state.room);
    saveGame();
    state.screen = 'result';
    state.mode = 'normal';
    state.draggingDoor = false;
    state.snapTarget = null;
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
    c.talismans.push(randomTalisman());
    state.sealFlash = 0.01;

    if (c.sealed >= c.requiredSeals) {
      c.ghosts.forEach(g => {
        if (g.ghostEye) {
          state.ghostEye = 10;
          state.eyeFx = 1.05;
          setToast('鬼眼开启：10秒透视', 1.6);
        }
      });
      state.mode = 'sealSuccess';
      state.pendingNextRoom = state.room + 1;
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
      state.bossDefeated[c.stage] = true;
      state.mode = 'sealSuccess';
      state.pendingNextRoom = c.stage * 25 + 1;
      setToast('Boss已封印，进入下一大关', 1.4);
    }
  }

  function randomTalisman() {
    return { rx: 0.18 + Math.random() * 0.64, ry: 0.14 + Math.random() * 0.68, rot: (Math.random() - 0.5) * 0.7, scale: 0.72 + Math.random() * 0.38, born: state.t };
  }

  function update(dt) {
    state.t += dt;

    if (state.toast) {
      state.toast.time -= dt;
      if (state.toast.time <= 0) state.toast = null;
    }
    if (state.ghostEye > 0 && state.screen === 'game') state.ghostEye = Math.max(0, state.ghostEye - dt);
    if (state.eyeFx > 0 && state.screen === 'game') state.eyeFx = Math.max(0, state.eyeFx - dt);

    if (state.screen !== 'game') return;

    if (state.mode === 'corridorTransition') {
      state.transition += dt * 2.7;
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
    if (state.door > 0.08) markSeenContent();

    if (state.mode === 'bossFight') return updateBossFight(dt);

    if (c.type === 'ghost') {
      if (state.door > 0.055) {
        const base = 0.62 + Math.min(state.room, 90) * 0.0066;
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
        if (c.passTimer > 0.06) startCorridorAdvance(state.room + 1);
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

    if (state.screen === 'menu') return handleMenuDown(p);
    if (state.screen === 'difficulty') return handleDifficultyDown(p);
    if (state.screen === 'rules') return handleRulesDown(p);
    if (state.screen === 'gallery') return handleGalleryDown(p);
    if (state.screen === 'result') return handleResultDown(p);
    if (state.screen !== 'game') return;

    const l = state.layout;

    if (hit(p, inflate(l.home, 8, 8))) {
      setPressed('home');
      state.screen = 'menu';
      state.draggingDoor = false;
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

    if (!state.draggingDoor || state.screen !== 'game' || state.mode !== 'normal') return;
    e.preventDefault();
    const l = state.layout;
    const dx = state.dragStartX - p.x;
    state.door = clamp(state.dragStartDoor + dx / (l.door.w * 0.58), 0, 1);
  }

  function onPointerUp(e) {
    const p = getPointer(e);
    state.pointer = { x: p.x, y: p.y, down: false };
    state.pressed = null;
    if (state.rulesDragging) state.rulesDragging = false;
    if (state.galleryDragging) state.galleryDragging = false;
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
    }
  }, { passive: false });

  function menuButtons() {
    const l = state.layout;
    const bw = Math.min(270, l.w * 0.70);
    const bh = 58;
    const x = (l.w - bw) / 2;
    const y = l.h * 0.45;
    return {
      start: { x, y, w: bw, h: bh },
      rules: { x, y: y + 76, w: bw, h: bh },
      gallery: { x, y: y + 152, w: bw, h: bh },
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
      startRun('normal');
    } else if (hit(p, inflate(b.rules, 10))) {
      setPressed('rules');
      state.screen = 'rules';
    } else if (hit(p, inflate(b.gallery, 10))) {
      setPressed('gallery');
      state.lastScreen = 'menu';
      state.screen = 'gallery';
    }
  }

  function handleDifficultyDown(p) {
    state.screen = 'menu';
  }

  function handleRulesDown(p) {
    const back = { x: 16, y: 18, w: 70, h: 40 };
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
    const back = { x: 16, y: 18, w: 70, h: 40 };
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

  function handleResultDown(p) {
    const l = state.layout;
    const bw = Math.min(260, l.w * 0.68);
    const x = (l.w - bw) / 2;
    const again = { x, y: l.h * 0.58, w: bw, h: 58 };
    const home = { x, y: l.h * 0.58 + 76, w: bw, h: 58 };
    if (hit(p, inflate(again, 10))) {
      setPressed('again');
      startRun(state.difficulty);
    } else if (hit(p, inflate(home, 10))) {
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
    if (state.screen === 'menu') drawMenu();
    else if (state.screen === 'rules') drawRules();
    else if (state.screen === 'gallery') drawGallery();
    else if (state.screen === 'game') drawGame();
    else if (state.screen === 'result') drawResult();
    else drawMenu();
  }

  function drawMenu() {
    const l = state.layout;
    drawMenuBackground();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,253,246,0.94)';
    roundRect(l.w / 2 - 146, l.h * 0.17, 292, 134, 24, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.font = isEn() ? '900 31px system-ui, sans-serif' : '900 43px system-ui, sans-serif';
    ctx.fillText(isEn() ? 'TIMID EXORCIST' : '胆小除魔师', l.w / 2, l.h * 0.235);
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(isEn() ? 'Endless corridor. Open and decide.' : '无限长廊，开门识别异常', l.w / 2, l.h * 0.305);
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(VERSION, l.w / 2, l.h * 0.36);
    ctx.restore();

    const b = menuButtons();
    drawMiniButton(b.lang, isEn() ? '中' : 'EN', 'lang');
    drawUIButton(b.start, isEn() ? 'Start' : '开始游戏', '', 'start');
    drawUIButton(b.rules, isEn() ? 'Rules' : '游戏规则', '', 'rules');
    drawUIButton(b.gallery, isEn() ? `Archive ${collectCountText()}` : `图鉴 ${collectCountText()}`, '', 'gallery');
  }

  function drawMenuBackground() {
    const l = state.layout;
    const wall = getAssetImage(ROOM_ASSETS.wall);
    if (wall) drawCoverImage(wall, 0, 0, l.w, l.h);
    else {
      ctx.fillStyle = '#e8dfd2';
      ctx.fillRect(0, 0, l.w, l.h);
    }
    ctx.save();
    ctx.globalAlpha = 0.20;
    const room = getAssetImage(ROOM_ASSETS.door);
    if (room) drawContainImage(room, l.w / 2 - 100, l.h * 0.53, 200, 260);
    ctx.restore();
  }

  function drawGame() {
    const l = state.layout;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, l.topH, l.w, l.h - l.topH);
    ctx.clip();

    const shake = screenShakeAmount();
    if (shake > 0) {
      ctx.translate(
        Math.sin(state.t * 52) * shake + Math.sin(state.t * 19) * shake * 0.45,
        Math.cos(state.t * 47) * shake * 0.45
      );
    }

    if (state.mode === 'corridorTransition') {
      drawCorridorCard(state.corridorOffset, state.content, state.door);
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

    drawWallBackground();
    drawRoomBack(l.hole);
    drawContentFor(content, l.door, l.hole);
    drawWallMask();
    drawDoorFrame(l.hole);
    drawBossGlow(content, l.hole);
    drawDoorPanel(l.door, doorProgress);
    drawDoorTalismans(content, l.door, doorProgress);
    drawSealSuccessGlow();
    drawDangerVignette();

    ctx.restore();
  }

  function drawWallBackground() {
    const l = state.layout;
    const wall = getAssetImage(ROOM_ASSETS.wall);
    if (wall) drawCoverImage(wall, 0, l.topH, l.w, l.h - l.topH);
    else {
      ctx.fillStyle = '#d8ccbd';
      ctx.fillRect(0, l.topH, l.w, l.h - l.topH);
    }
  }

  function drawRoomBack(hole) {
    const room = getAssetImage(ROOM_ASSETS.room);
    ctx.save();
    ctx.beginPath();
    ctx.rect(hole.x + 4, hole.y + 4, hole.w - 8, hole.h - 8);
    ctx.clip();
    if (room) drawCoverImage(room, hole.x, hole.y, hole.w, hole.h);
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
      drawStretchImage(frame, hole.x - hole.w * 0.09, hole.y - hole.h * 0.035, hole.w * 1.18, hole.h * 1.07);
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
    if (img) drawStretchImage(img, x, door.y, door.w, door.h);
    else {
      ctx.fillStyle = '#4a2b1c';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 5;
      roundRect(x, door.y, door.w, door.h, 8, true, true, 5);
    }
    ctx.restore();
  }

  function doorAlphaForGhostEye() {
    if (state.ghostEye > 0 && state.mode === 'normal') return 0.42;
    return 1;
  }

  function drawContentFor(content, door, hole) {
    if (!content) return;
    const floorY = hole.y + hole.h * 0.94;

    ctx.save();
    ctx.beginPath();
    ctx.rect(hole.x + 5, hole.y + 5, hole.w - 10, hole.h - 10);
    ctx.clip();

    if (content.type === 'person') {
      drawCharacter(content.person, door.x + door.w / 2, floorY, door.h * 0.58, 'person', 1);
    } else if (content.type === 'ghost') {
      const count = content.ghosts.length;
      const approach = content === state.content ? ghostApproachStep() : 0;
      const dangerScale = 1 + approach * 0.68;
      const baseH = door.h * (count === 1 ? 0.62 : count === 2 ? 0.50 : 0.40);
      const spread = door.w * (count === 1 ? 0 : count === 2 ? 0.25 : 0.30);
      content.ghosts.forEach((g, i) => {
        const gx = door.x + door.w / 2 + (count === 1 ? 0 : (i - (count - 1) / 2) * spread);
        const gh = baseH * dangerScale;
        drawCharacter(g, gx, floorY, baseH, 'ghost', dangerScale);
        drawGhostFires(g, gx, floorY - gh * 0.55, gh, Math.max(1, g.fire || 1), i);
      });
    } else if (content.type === 'boss') {
      const approach = state.mode === 'bossFight' && content === state.content ? Math.floor(state.door * 8) / 8 : 0;
      const scale = state.mode === 'bossFight' && content === state.content ? 1 + approach * 0.45 : 1;
      drawCharacter(content.bossGhost, door.x + door.w / 2, floorY + door.h * 0.02, door.h * 0.76, 'boss', scale);
      drawGhostFires(content.bossGhost, door.x + door.w / 2, floorY - door.h * 0.52, door.h * 0.80, (content.bossGhost.fire || 3) + 2, 9);
    }
    ctx.restore();
  }

  function drawCharacter(def, x, floorY, targetH, kind, scale = 1) {
    const img = getAssetImage(def.file);
    const h = targetH * scale * (def.scale || 1);
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

  function drawSealPaper(x, y, w, h, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
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

    drawMiniButton(l.home, ui('主页', 'Home'), 'home');
    drawMiniButton(l.galleryButton, ui('图鉴', 'Archive'), 'galleryTop');

    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.fillText(ui(`第 ${state.room} 门`, `Door ${state.room}`), 86, 23);
    ctx.font = '700 11px system-ui, sans-serif';
    const diff = state.difficulty === 'easy' ? ui('简单', 'Easy') : ui('困难', 'Hard');
    ctx.fillText(ui(`难度 ${diff}  最高 ${state.save.bestRoom || 1}`, `${diff}  Best ${state.save.bestRoom || 1}`), 86, 44);
    ctx.fillText(ui(`进度 ${prog.index}/25  Boss：${prog.boss.name}`, `Progress ${prog.index}/25  Boss: ${displayName(prog.boss)}`), 86, 64);

    const barX = 86;
    const barY = l.topH - 13;
    const barW = Math.max(80, l.w - 188);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    roundRect(barX, barY, barW, 6, 3, true, true, 2);
    ctx.fillStyle = '#111';
    roundRect(barX, barY, barW * prog.ratio, 6, 3, true, false, 0);

    ctx.textAlign = 'right';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillStyle = '#111';
    ctx.fillText(collectCountText(), l.w - 10, 64);

    if (state.ghostEye > 0) {
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText(ui(`鬼眼 ${Math.ceil(state.ghostEye)}s`, `Eye ${Math.ceil(state.ghostEye)}s`), l.w - 10, l.topH - 16);
    }

    if (state.mode === 'bossFight' && state.content && state.content.type === 'boss') drawBossHPBar();
    ctx.restore();
  }

  function drawBossHPBar() {
    const l = state.layout;
    const c = state.content;
    const ratio = clamp(1 - c.hits / c.cfg.seals, 0, 1);
    const x = 86;
    const y = l.topH - 26;
    const w = l.w - 172;
    const h = 9;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, 4, true, true, 2);
    ctx.fillStyle = ratio < 0.3 ? '#ff3b20' : '#111';
    roundRect(x, y, w * ratio, h, 4, true, false, 0);
    ctx.restore();
  }

  function drawBottomControls() {
    const l = state.layout;
    if (state.mode === 'corridorTransition' || state.mode === 'sealSuccess') return;
    if (state.mode === 'bossFight') return drawBossSealButton(l.bossButton);
    drawSealButton(l.sealButton);
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
      '鬼眼开启：10秒透视': 'Ghost Eye: 10 seconds of vision.',
      '符咒贴上去了': 'Seal placed.',
      'Boss已封印，进入下一大关': 'Boss sealed. Next stage unlocked.',
      'Boss逃走了': 'Boss escaped.'
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
      '6. Sealing the Nine-tailed Fox opens Ghost Eye for 10 seconds.',
      '7. Bosses appear near every 25th door. Confirm the Boss, close the door, then seal rapidly.',
      '8. The Archive records ghosts and animals you have seen.'
    ] : [
      '1. 拖动红木滑门向左开门，松手后会自动吸附开/关。',
      '2. 判断成功后，当前门位会横向滑走，新的门从长廊另一侧滑入。',
      '3. 鬼有快慢差异，看太久会一段段逼近，危险值满了就会冲出来。',
      '4. 普通鬼需要先关门，再点击封印。',
      '5. 门后是小动物或空房间时，开到足够大即可通过；乱封会直接失败。',
      '6. 封印九尾狐后开启10秒鬼眼，门会变透明。',
      '7. 每25关附近会出现Boss：先开门确认，再关门疯狂贴符。',
      '8. 图鉴会记录见过的鬼和小动物，可以上下滑动查看。'
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
    if (seen) drawCardImage(item, imageBox);
    else drawUnknownEgg(imageBox, r.w);
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

  function drawCardImage(item, box) {
    const img = getAssetImage(item.file);
    if (img) drawContainImage(img, box.x + 2, box.y + 2, box.w - 4, box.h - 4);
    else drawFallbackCharacter(item.name, box.x + box.w / 2, box.y + box.h * 0.1, box.w * 0.55, box.h * 0.86, state.galleryTab === 'people' ? 'person' : 'ghost');
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
    roundRect(l.w * 0.08, l.h * 0.22, l.w * 0.84, l.h * 0.28, 24, true, true, 5);
    ctx.fillStyle = '#111';
    ctx.font = '900 38px system-ui, sans-serif';
    ctx.fillText(ui('游戏结束', 'Game Over'), l.w / 2, l.h * 0.30);
    ctx.font = '700 17px system-ui, sans-serif';
    wrapText(resultText(state.resultReason), l.w / 2, l.h * 0.365, l.w * 0.72, 24, 'center');
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.fillText(ui(`本次到达：第 ${state.room} 门`, `Reached Door ${state.room}`), l.w / 2, l.h * 0.445);
    ctx.fillText(ui(`最高纪录：第 ${state.save.bestRoom || 1} 门`, `Best: Door ${state.save.bestRoom || 1}`), l.w / 2, l.h * 0.478);
    ctx.restore();

    const bw = Math.min(260, l.w * 0.68);
    const x = (l.w - bw) / 2;
    drawUIButton({ x, y: l.h * 0.58, w: bw, h: 58 }, ui('再来一局', 'Try Again'), '', 'again');
    drawUIButton({ x, y: l.h * 0.58 + 76, w: bw, h: 58 }, ui('返回主页', 'Home'), '', 'homeResult');
  }

  function resultText(zh) {
    if (!isEn()) return zh;
    const map = {
      '门开太久，鬼冲出来了': 'The door stayed open too long. The ghost escaped.',
      '封错了，它只是普通小动物': 'Wrong seal. It was just a normal animal.',
      '封错了，这间房是空的': 'Wrong seal. This room was empty.',
      '强制Boss战失败，Boss冲出来了': 'Forced boss fight failed. The boss broke out.'
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
    drawMiniButton({ x: 16, y: 18, w: 70, h: 40 }, label, 'back');
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
