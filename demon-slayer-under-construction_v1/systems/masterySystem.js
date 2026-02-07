const rarityOrder = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "SR",
  "SSR",
  "UR",
  "URR"
  // ❌ EVENT excluded on purpose
];

const levelRequirements = {
  COMMON: 50,
  UNCOMMON: 100,
  RARE: 150,
  SR: 200,
  SSR: 300,
  UR: 500
  // URR = final rarity
};

const maxLevel = {
  COMMON: 100,
  UNCOMMON: 150,
  RARE: 200,
  SR: 250,
  SSR: 350,
  UR: 500,
  URR: 700,
  EVENT: 1000 // ❌ no leveling
};

const fragmentCost = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  SR: 5,
  SSR: 8,
  UR: 12,
  URR: 20,
  EVENT: null
};

module.exports = {
  rarityOrder,
  levelRequirements,
  maxLevel,
  fragmentCost
};
