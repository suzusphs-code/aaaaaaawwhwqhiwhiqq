const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const users = require('../database/users.json');
const characters = require('../database/characters.json');
const config = require('../config.json');

const dbPath = path.join(__dirname, '../database/users.json');

/* ---------------- HELPERS ---------------- */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPool(rarity) {
  return characters.filter(c => c.rarity.toLowerCase() === rarity.toLowerCase());
}

function normalPull() {
  const roll = Math.random() * 100;

  if (roll < 1 && getPool('urr').length) return pickRandom(getPool('urr'));
  if (roll < 5 && getPool('ur').length) return pickRandom(getPool('ur'));
  if (roll < 15 && getPool('ssr').length) return pickRandom(getPool('ssr'));
  if (roll < 35 && getPool('sr').length) return pickRandom(getPool('sr'));
  if (roll < 60 && getPool('rare').length) return pickRandom(getPool('rare'));
  if (roll < 85 && getPool('uncommon').length) return pickRandom(getPool('uncommon'));

  return pickRandom(getPool('common').length ? getPool('common') : characters);
}

/* ---------------- COMMAND ---------------- */

module.exports = {
  name: 'pull',

  execute(message) {
    const userId = message.author.id;
    const user = users[userId];

    if (!user) return message.reply('❌ Use `!start` first.');
    if (user.balance < config.pullCost)
      return message.reply('❌ Not enough coins to pull!');

    user.balance -= config.pullCost;

    /* -------- MIGRATION SAFETY -------- */

    // characters → object (not array)
    if (!user.characters || Array.isArray(user.characters)) {
      const converted = {};
      (user.characters || []).forEach(name => {
        const base = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (!base) return;

        converted[base.name] = {
          rarity: base.rarity,
          level: 1,
          fragments: 0
        };
      });
      user.characters = converted;
    }

    // inventory
    if (!user.inventory) user.inventory = {};
    if (!user.inventory.fragments) user.inventory.fragments = {};

    // pity
    if (!user.pity) {
      user.pity = { sr: 0, ssr: 0, ur: 0, urr: 0 };
    }

    // increase pity counters
    user.pity.sr++;
    user.pity.ssr++;
    user.pity.ur++;
    user.pity.urr++;

    let character = null;
    let pityTriggered = null;

    /* -------- PITY SYSTEM -------- */

    if (user.pity.urr >= 1000 && getPool('urr').length) {
      character = pickRandom(getPool('urr'));
      user.pity.urr = 0;
      pityTriggered = 'URR';
    } else if (user.pity.ur >= 500 && getPool('ur').length) {
      character = pickRandom(getPool('ur'));
      user.pity.ur = 0;
      pityTriggered = 'UR';
    } else if (user.pity.ssr >= 350 && getPool('ssr').length) {
      character = pickRandom(getPool('ssr'));
      user.pity.ssr = 0;
      pityTriggered = 'SSR';
    } else if (user.pity.sr >= 200 && getPool('sr').length) {
      character = pickRandom(getPool('sr'));
      user.pity.sr = 0;
      pityTriggered = 'SR';
    }

    if (!character) character = normalPull();

    /* -------- DUPLICATE / NEW -------- */

    let description = '';
    let color = 0x00ff99;

    if (user.characters[character.name]) {
      // duplicate
      user.inventory.fragments[character.name] =
        (user.inventory.fragments[character.name] || 0) + 1;

      user.characters[character.name].fragments++;

      description =
        `🧩 **Duplicate Pull!**\n` +
        `You received **1 ${character.name} Fragment**.\n\n` +
        `Fragments Owned: **${user.characters[character.name].fragments}**`;

      color = 0xffcc00;
    } else {
      // new character
      user.characters[character.name] = {
        rarity: character.rarity,
        level: 1,
        fragments: 0
      };

      description =
        `🎉 **New Character Obtained!**\n` +
        `⭐ Rarity: **${character.rarity}**\n` +
        `⚔ Type: **${character.type}**`;
    }

    if (pityTriggered) {
      description += `\n\n🔥 **${pityTriggered} PITY ACTIVATED!**`;
      color = 0xff4444;
    }

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

    const embed = new EmbedBuilder()
      .setTitle(`🎴 ${character.name}`)
      .setDescription(description)
      .setImage(character.image)
      .setColor(color);

    message.channel.send({ embeds: [embed] });
  }
};
