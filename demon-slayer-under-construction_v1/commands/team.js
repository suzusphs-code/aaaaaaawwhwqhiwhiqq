const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const users = require('../database/users.json');
const characters = require('../database/characters.json');
const fs = require('fs');

const MAX_TEAM_SIZE = 4;

// normalize helper
function normalize(str) {
  return str.toLowerCase().replace(/[_-]/g, ' ').trim();
}

// find character by ANY name part
function findCharacterByInput(input) {
  const nInput = normalize(input);

  return characters.find(c => {
    const nameParts = normalize(c.name).split(' ');
    return (
      normalize(c.name) === nInput ||
      nameParts.some(p => p === nInput) ||
      normalize(c.id) === nInput ||
      normalize(c.id).includes(nInput)
    );
  });
}

module.exports = {
  name: 'team',

  async execute(message, args) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');

    if (!user.team) user.team = [];
    if (!user.characters) user.characters = {};

    const sub = (args[0] || '').toLowerCase();
    const inputName = args.slice(1).join(' ');

    /* ================= ADD ================= */
    if (sub === 'add') {
      if (!inputName) return message.reply('❌ Specify a character.');

      const baseChar = findCharacterByInput(inputName);
      if (!baseChar) return message.reply('❌ Character not found.');

      const ownedEntry = Object.keys(user.characters).find(
        c => normalize(c) === normalize(baseChar.name)
      );

      if (!ownedEntry)
        return message.reply('❌ You do not own this character.');

      if (user.team.includes(ownedEntry))
        return message.reply('⚠️ Already in team.');

      if (user.team.length >= MAX_TEAM_SIZE)
        return message.reply('❌ Team is full.');

      user.team.push(ownedEntry);
      fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));

      return message.reply(`✅ **${baseChar.name}** added to team.`);
    }

    /* ================= REMOVE ================= */
    if (sub === 'remove') {
      if (!inputName) return message.reply('❌ Specify a character.');

      const baseChar = findCharacterByInput(inputName);
      if (!baseChar) return message.reply('❌ Character not found.');

      const teamEntry = user.team.find(
        c => normalize(c) === normalize(baseChar.name)
      );

      if (!teamEntry) return message.reply('❌ Not in team.');

      user.team = user.team.filter(c => c !== teamEntry);
      fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));

      return message.reply(`🗑️ **${baseChar.name}** removed from team.`);
    }

    /* ================= SHOW TEAM (CANVAS) ================= */
    if (user.team.length === 0) {
      return message.reply('👥 Your team is empty.');
    }

    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext('2d');

    // background
    const bg = ctx.createLinearGradient(0, 0, 900, 500);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Sans';
    ctx.fillText(`${message.author.username}'s Team`, 30, 50);

    for (let i = 0; i < user.team.length; i++) {
      const charName = user.team[i];
      const ownedChar = user.characters[charName];
      const baseChar = characters.find(
        c => normalize(c.name) === normalize(charName)
      );

      const x = 30 + i * 215;
      const y = 90;

      // card
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 190, 360);

      // image (FIXED)
      if (baseChar?.image) {
        try {
          const img = await loadImage(baseChar.image);
          ctx.drawImage(img, x + 10, y + 10, 170, 170);
        } catch (e) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 10, y + 10, 170, 170);
        }
      }

      // name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Sans';
      ctx.fillText(baseChar?.name || charName, x + 10, y + 205, 170);

      // rarity
      ctx.font = '16px Sans';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`⭐ ${ownedChar.rarity}`, x + 10, y + 235);

      // level
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Lvl ${ownedChar.level}`, x + 10, y + 260);
    }

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'team.png'
    });

    message.channel.send({ files: [attachment] });
  }
};
