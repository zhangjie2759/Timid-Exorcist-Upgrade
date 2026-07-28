(function () {
  'use strict';

  // Runtime art bridge for GAME-003.
  // Replace paths or color tokens here when final assets arrive; gameplay code
  // deliberately consumes semantic roles instead of hard-coding filenames.
  window.GAME_ART_THEME = {
    id: 'clean3d-v1',
    label: '干净轻3D测试主题',
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
      rice: 'redesign/clean3d-v1/characters/food-monsters/f03-rice.png'
    },
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
      homeResult: 'navy'
    }
  };
})();
