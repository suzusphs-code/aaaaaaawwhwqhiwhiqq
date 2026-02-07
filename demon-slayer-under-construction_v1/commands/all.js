const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const characters = require('../database/characters.json');
const { maxLevel } = require('../systems/masterySystem');

module.exports = {
  name: 'all',
  aliases: ['characters', 'encyclopedia'],

  async execute(message) {
    if (!characters.length) {
      return message.reply('❌ No characters found.');
    }

    let index = 0;

    const rarityEmoji = {
      COMMON: '⚪',
      UNCOMMON: '🟢',
      RARE: '🔵',
      SR: '✨',
      SSR: '🌈',
      UR: '🔥',
      URR: '💎',
      EVENT: '🎟️'
    };

    const getEmbed = () => {
      const char = characters[index];
      const rarity = char.rarity.toUpperCase();

      const mastery =
        rarity === 'EVENT'
          ? '❌ Not Available'
          : `Level ${maxLevel[rarity] || '∞'}`;

      const embed = new EmbedBuilder()
        .setTitle(`📖 ${char.name}`)
        .addFields(
          {
            name: '⭐ Rarity',
            value: `${rarityEmoji[rarity] || '❔'} ${rarity}`,
            inline: true
          },
          {
            name: '🎯 Max Mastery',
            value: mastery,
            inline: true
          },
          {
            name: '⚔ Type',
            value: char.type || 'Unknown',
            inline: true
          }
        )
        .setFooter({
          text: `Character ${index + 1} / ${characters.length}`
        })
        .setColor(0xff5555);

      if (char.image) embed.setImage(char.image);

      return embed;
    };

    const getRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === 0),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ➡')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === characters.length - 1)
      );

    const msg = await message.channel.send({
      embeds: [getEmbed()],
      components: [getRow()]
    });

    const collector = msg.createMessageComponentCollector({
      time: 60_000
    });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: '❌ This menu is not for you.',
          ephemeral: true
        });
      }

      if (interaction.customId === 'prev') index--;
      if (interaction.customId === 'next') index++;

      await interaction.update({
        embeds: [getEmbed()],
        components: [getRow()]
      });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
