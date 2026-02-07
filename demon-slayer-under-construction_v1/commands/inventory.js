const { EmbedBuilder } = require('discord.js');
const users = require('../database/users.json');

module.exports = {
  name: 'inventory',
  aliases: ['inv'],

  execute(message) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');

    const fragments = user.inventory?.fragments;

    if (!fragments || Object.keys(fragments).length === 0) {
      return message.reply('📦 Your inventory is empty.');
    }

    const description = Object.entries(fragments)
      .map(([name, count]) => `🧩 **${name}** × ${count}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📦 ${message.author.username}'s Inventory`)
      .setDescription(description)
      .setColor(0x5865f2);

    message.channel.send({ embeds: [embed] });
  }
};
