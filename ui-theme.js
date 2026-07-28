(function () {
  'use strict';

  // Runtime art bridge for GAME-003.
  // Replace paths or color tokens here when final assets arrive; gameplay code
  // deliberately consumes semantic roles instead of hard-coding filenames.
  window.GAME_ART_THEME = {
    id: 'clean3d-v1-full-cast',
    label: '干净轻3D全量替换测试主题',
    tokens: {
      canvas: '#f8f1e8',
      surface: '#fffaf3',
      surfaceStrong: '#f2e2cf',
      ink: '#263650',
      inkMuted: '#6f7785',
      navy: '#2f4f7f',
      navyDeep: '#192c4d',
      coral: '#ef725f',
      coralDeep: '#cf5849',
      mint: '#72c7be',
      mintDeep: '#4ea69e',
      purple: '#9a7ad2',
      yellow: '#f3c45b',
      line: '#d8c7b5',
      shadow: 'rgba(44,54,76,0.18)',
      white: '#fffdf9'
    },
    chefs: {
      head: 'redesign/clean3d-v1/characters/chefs/c01-head-chef.png',
      prep: 'redesign/clean3d-v1/characters/chefs/c02-tall-apprentice.png',
      helper: 'redesign/clean3d-v1/characters/chefs/c03-tiny-helper.png',
      steam: 'redesign/clean3d-v1/characters/chefs/c04-steam-chef.png',
      service: 'redesign/clean3d-v1/characters/chefs/c05-serving-chef.png'
    },
    petChefRoles: {
      rabbit: 'head',
      dog: 'steam',
      owl: 'helper'
    },
    foodMonsters: {
      tomato: 'redesign/clean3d-v1/characters/food-monsters/f01-tomato.png',
      egg: 'redesign/clean3d-v1/characters/food-monsters/f02-egg.png',
      rice: 'redesign/clean3d-v1/characters/food-monsters/f03-rice.png',
      water: 'redesign/clean3d-v1/characters/food-monsters/f04-water.png',
      potato: 'redesign/clean3d-v1/characters/food-monsters/f05-potato.png',
      tofu: 'redesign/clean3d-v1/characters/food-monsters/f06-tofu.png',
      mushroom: 'redesign/clean3d-v1/characters/food-monsters/f07-mushroom.png',
      greenPepper: 'redesign/clean3d-v1/characters/food-monsters/f08-green-pepper.png',
      shrimp: 'redesign/clean3d-v1/characters/food-monsters/f09-shrimp.png',
      crab: 'redesign/clean3d-v1/characters/food-monsters/f10-crab.png'
    },
    ghostSkins: {
      '猼訑': { foodId: 'tomato', name: '三眼番茄精', nameEn: 'Three-eye Tomato', desc: '三只眼睛轮流盯门，脾气来得比熟得还快。', descEn: 'Its three eyes take turns watching the door.' },
      '赤鱬': { foodId: 'egg', name: '瘫瘫蛋精', nameEn: 'Lazy Egg Spirit', desc: '看起来摊成一片，出手时那根长手却快得离谱。', descEn: 'It looks flattened, but its long arm moves absurdly fast.' },
      '当康': { foodId: 'rice', name: '抱团米精', nameEn: 'Rice Cluster', desc: '米粒抱成一团，越靠近越像一整座饭山。', descEn: 'Rice grains huddle into a surprisingly heavy mound.' },
      '混沌': { foodId: 'water', name: '月泉水精', nameEn: 'Moonwater Spirit', desc: '形状一直流动，很难判断它到底占了多大一块。', descEn: 'Its flowing outline makes its true size hard to judge.' },
      '九尾狐': { foodId: 'potato', name: '多眼土豆精', nameEn: 'Many-eye Potato', desc: '每个芽眼都在偷看，装无辜的时候尤其可疑。', descEn: 'Every sprout-eye is watching, especially when it acts innocent.' },
      '夔牛': { foodId: 'tofu', name: '错层豆腐精', nameEn: 'Stacked Tofu', desc: '豆腐块错层挪动，笨重但很难从门缝看清。', descEn: 'Misaligned tofu blocks shuffle with slow, heavy pressure.' },
      '麒麟': { foodId: 'mushroom', name: '紫伞蘑菇精', nameEn: 'Purple Cap Mushroom', desc: '伞盖遮住一排眼睛，安静时反而更让人发毛。', descEn: 'A purple cap hides a row of eyes; silence makes it worse.' },
      '穷奇': { foodId: 'greenPepper', name: '大嘴青椒精', nameEn: 'Big-mouth Pepper', desc: '嘴比身体还大，门一开就想把整条走廊吞下去。', descEn: 'Its mouth is bigger than its body and hungry for the corridor.' },
      '饕餮': { foodId: 'shrimp', name: '长须虾精', nameEn: 'Long-whisker Shrimp', desc: '须和脚太多，靠近时像一大串红色问号。', descEn: 'Too many legs and whiskers make it a moving red question mark.' },
      '狰': { foodId: 'crab', name: '举钳螃蟹精', nameEn: 'Raised-claw Crab', desc: '永远举着一只大钳子，像在等人主动送上门。', descEn: 'One giant claw stays raised, waiting for someone to walk in.' },
      '烛阴': { foodId: 'tomato', name: '暴走番茄精', nameEn: 'Rampage Tomato', desc: '番茄精的稀有暴走形态，速度和压迫感远超普通食材怪。', descEn: 'A rare rampaging tomato form with boss-level speed and pressure.', scale: 1.18, bossVariant: true }
    },
    preload: [
      'redesign/clean3d-v1/characters/chefs/c01-head-chef.png',
      'redesign/clean3d-v1/characters/food-monsters/f01-tomato.png'
    ],
    buttonTones: {
      start: 'coral',
      prepareStart: 'coral',
      again: 'coral',
      cookRecipe: 'coral',
      pets: 'mint',
      petsResult: 'mint',
      kitchen: 'mint',
      gallery: 'purple',
      galleryTop: 'navy',
      rules: 'navy',
      shopPrepare: 'navy',
      resultShop: 'purple',
      prepareBack: 'navy',
      homeResult: 'navy',
      back: 'navy',
      home: 'navy',
      lang: 'surface',
      kitchenPrepare: 'mint',
      kitchenChefs: 'surface',
      kitchenUpgrade: 'mint',
      kitchenShop: 'purple',
      dishAction: 'navy',
      marketDish: 'surface',
      dishSell: 'coral',
      methodStir: 'coral',
      methodSteam: 'mint',
      cookRecipe: 'coral',
      seal: 'coral',
      bossSeal: 'coral'
    },
    buttonIcons: {
      start: 'chef', prepareStart: 'door', again: 'redo',
      pets: 'pot', petsResult: 'pot', kitchen: 'pot',
      gallery: 'book', galleryTop: 'book', rules: 'clipboard',
      prepareBack: 'arrow', back: 'arrow', home: 'door', homeResult: 'door',
      shopPrepare: 'door', resultShop: 'crystal', kitchenShop: 'crystal',
      kitchenPrepare: 'door', kitchenChefs: 'chef', kitchenUpgrade: 'pot',
      methodStir: 'stir', methodSteam: 'steam', cookRecipe: 'flame',
      seal: 'seal', bossSeal: 'seal', freshSeal: 'seal',
      music: 'music', lang: 'language', ghostTab: 'monster', peopleTab: 'chef',
      dishAction: 'coins'
    }
  };
})();
