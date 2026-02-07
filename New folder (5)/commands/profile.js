const { EmbedBuilder } = require('discord.js');
const users = require('../database/users.json');

module.exports = {
  name: 'profile',
  execute(message) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');

    // characters is an object, not an array
    const characterCount = user.characters
      ? Object.keys(user.characters).length
      : 0;

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username}'s Profile`)
      .setColor(0x9b59b6)
      .addFields(
        { name: '💰 Coins', value: `${user.balance}`, inline: true },
        { name: '🎴 Characters Owned', value: `${characterCount}`, inline: true }
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: 'Demon Slayer RPG' });

    message.reply({ embeds: [embed] });
  }
};
