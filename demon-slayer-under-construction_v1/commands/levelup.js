const fs = require('fs');
const path = require('path');
const {
  levelRequirements,
  rarityOrder,
  fragmentCost
} = require('../systems/masterySystem');

const users = require('../database/users.json');
const dbPath = path.join(__dirname, '../database/users.json');

function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, '');
}

module.exports = {
  name: 'levelup',

  execute(message, args) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');
    if (!args.length) return message.reply('❌ Specify a character name.');

    const input = normalize(args.join(' '));

    const charName = Object.keys(user.characters || {}).find(name =>
      normalize(name).includes(input)
    );

    if (!charName) return message.reply('❌ You do not own this character.');

    const char = user.characters[charName];

    // ensure inventory exists
    user.inventory ??= {};
    user.inventory.fragments ??= {};

    const ownedFragments = user.inventory.fragments[charName] || 0;
    const cost = fragmentCost[char.rarity];

    if (ownedFragments < cost) {
      return message.reply(
        `❌ Need **${cost} fragments**.\nYou have **${ownedFragments}**.`
      );
    }

    // consume fragments
    user.inventory.fragments[charName] -= cost;
    char.level += 1;

    let evolutionText = '';

    const upgradeAt = levelRequirements[char.rarity];
    if (upgradeAt && char.level >= upgradeAt) {
      const idx = rarityOrder.indexOf(char.rarity);
      if (rarityOrder[idx + 1]) {
        char.rarity = rarityOrder[idx + 1];
        evolutionText = `\n🌟 **${charName} evolved to ${char.rarity}!**`;
      }
    }

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

    message.reply(
      `⬆️ **${charName} leveled up!**\n` +
      `📈 Level: **${char.level}**\n` +
      `⭐ Rarity: **${char.rarity}**` +
      evolutionText
    );
  }
};
