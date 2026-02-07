const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/users.json');
let users = require('../database/users.json');

module.exports = {
  name: 'start',
  execute(message) {
    const userId = message.author.id;

    if (users[userId]) {
      return message.reply('❌ You already started your **Demon Slayer journey**!');
    }

    users[userId] = {
      balance: 500,        // coins
      diamonds: 10,        // premium currency

      // Gacha / collection
      characters: [],     // array of character IDs
      inventory: {},      // future use (items, swords, etc.)

      // RPG stats
      stats: {
        level: 1,
        xp: 0,
        hp: 100,
        attack: 10,
        defense: 5
      },

      // Progress tracking
      pulls: 0,
      createdAt: Date.now()
    };

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

    message.reply(
      `🔥 **Welcome, Demon Slayer!**\n\n` +
      `You received:\n` +
      `🪙 **500 Coins**\n` +
      `💎 **10 Diamonds**\n\n` +
      `Use \`!pull\` to summon your first character!`
    );
  }
};
