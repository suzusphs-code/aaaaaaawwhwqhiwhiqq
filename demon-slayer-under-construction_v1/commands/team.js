const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const users = require('../database/users.json');
const characters = require('../database/characters.json');
const fs = require('fs');

const MAX_TEAM_SIZE = 4;

module.exports = {
  name: 'team',

  async execute(message, args) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');

    if (!user.team) user.team = [];

    const sub = (args[0] || '').toLowerCase();
    const name = args.slice(1).join(' ');

    /* ================= ADD ================= */
    if (sub === 'add') {
      if (!user.characters[name]) return message.reply('❌ You do not own this character.');
      if (user.team.includes(name)) return message.reply('⚠️ Already in team.');
      if (user.team.length >= MAX_TEAM_SIZE) return message.reply('❌ Team is full.');

      user.team.push(name);
      fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
      return message.reply(`✅ **${name}** added to team.`);
    }

    /* ================= REMOVE ================= */
    if (sub === 'remove') {
      if (!user.team.includes(name)) return message.reply('❌ Not in team.');

      user.team = user.team.filter(c => c !== name);
      fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
      return message.reply(`🗑️ **${name}** removed from team.`);
    }

    /* ================= SHOW TEAM (CANVAS) ================= */
    if (user.team.length === 0) {
      return message.reply('👥 Your team is empty. Use `!team add <character>`.');
    }

    // Canvas setup
    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Sans';
    ctx.fillText(`${message.author.username}'s Team`, 30, 50);

    // Slots
    for (let i = 0; i < user.team.length; i++) {
      const charName = user.team[i];
      const ownedChar = user.characters[charName];
      const baseChar = characters.find(
        c => c.name.toLowerCase() === charName.toLowerCase()
      );

      const x = 30 + i * 215;
      const y = 90;

      // Card bg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 190, 360);

      // Character image
      if (baseChar?.image) {
        try {
          const img = await loadImage(baseChar.image);
          ctx.drawImage(img, x + 10, y + 10, 170, 170);
        } catch {}
      }

      // Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Sans';
      ctx.fillText(charName, x + 10, y + 205, 170);

      // Rarity
      ctx.font = '16px Sans';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`⭐ ${ownedChar.rarity}`, x + 10, y + 235);

      // Level
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Lvl ${ownedChar.level}`, x + 10, y + 260);
    }

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'team.png'
    });

    message.channel.send({ files: [attachment] });
  }
};
