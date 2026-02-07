const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const users = require('../database/users.json');
const characters = require('../database/characters.json');

const ITEMS_PER_PAGE = 5;

module.exports = {
  name: 'collection',
  aliases: ['my_collection', 'mc'],

  async execute(message) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');

    if (!user.characters || Object.keys(user.characters).length === 0) {
      return message.reply('📭 Your collection is empty. Try pulling some cards!');
    }

    const ownedNames = Object.keys(user.characters);
    let page = 0;
    const totalPages = Math.ceil(ownedNames.length / ITEMS_PER_PAGE);

    const getEmbed = () => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;

      const slice = ownedNames.slice(start, end);

      const description = slice.map((name, i) => {
        const data = user.characters[name];
        const base = characters.find(
          c => c.name.toLowerCase() === name.toLowerCase()
        );

        const rarityEmoji = {
          common: '⚪',
          uncommon: '🟢',
          rare: '🔵',
          SR: '✨',
          SSR: '🌈',
          UR: '🔥',
          URR: '💎'
        }[data.rarity] || '❔';

        return `**${start + i + 1}. ${name}**  
${rarityEmoji} **${data.rarity}**  
📈 Level: **${data.level}**  
🧩 Fragments: **${data.fragments}**`;
      }).join('\n\n');

      return new EmbedBuilder()
        .setTitle(`🎴 ${message.author.username}'s Collection`)
        .setDescription(description)
        .setFooter({ text: `Page ${page + 1} / ${totalPages}` })
        .setColor(0xff5555);
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ➡')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1)
      );

    const msg = await message.channel.send({
      embeds: [getEmbed()],
      components: [row()]
    });

    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: '❌ Not your collection.', ephemeral: true });

      if (interaction.customId === 'prev') page--;
      if (interaction.customId === 'next') page++;

      await interaction.update({
        embeds: [getEmbed()],
        components: [row()]
      });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
