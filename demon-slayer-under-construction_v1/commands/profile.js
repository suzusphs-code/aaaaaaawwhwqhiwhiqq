const { EmbedBuilder } = require('discord.js');
const users = require('../database/users.json');

module.exports = {
  name: 'profile',

  execute(message) {
    const user = users[message.author.id];
    if (!user) return message.reply('Use `!start` first.');

    const premium = user.premium
      ? `✅ ${user.premium.tier.toUpperCase()}`
      : '❌ None';

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${message.author.username}'s Profile`)
      .addFields(
        { name: '💰 Coins', value: user.balance.toString(), inline: true },
        { name: '🎴 Characters', value: String(user.characters?.length || 0), inline: true },
        { name: '💎 Premium', value: premium, inline: true }
      )
      .setColor(0xff5555);

    message.channel.send({ embeds: [embed] });
  }
};
