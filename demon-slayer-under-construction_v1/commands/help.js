const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  aliases: ['commands', 'h'],

  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Demon Slayer Bot – Help Menu')
      .setDescription(
        'Welcome to the **Demon Slayer RPG Bot**!\n' +
        'Here are all available commands:'
      )
      .addFields(
        {
          name: '🧭 Getting Started',
          value:
            '`!start` – Begin your Demon Slayer journey\n' +
            '`!profile` – View your profile',
        },
        {
          name: '🎴 Gacha & Characters',
          value:
            '`!pull` – Pull a random character\n' +
            '`!collection` – View your owned characters\n' +
            '`!character <name>` – View character details\n' +
            '`!all` – View all characters in the game',
        },
        {
          name: '🧩 Mastery & Progression',
          value:
            '`!levelup <character>` – Level up a character using fragments',
        },
        {
          name: 'ℹ️ Utility',
          value:
            '`!help` – Show this help menu',
        }
      )
      .setColor(0xff5555)
      .setFooter({
        text: 'Demon Slayer RPG • More features coming soon 🔥'
      });

    message.channel.send({ embeds: [embed] });
  }
};
