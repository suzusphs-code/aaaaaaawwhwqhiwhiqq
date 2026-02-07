const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const users = require('../database/users.json');
const charactersDB = require('../database/characters.json');
const mastery = require('../systems/masterySystem');

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z]/g, '');
}

module.exports = {
  name: 'character',

  async execute(message, args) {
    const user = users[message.author.id];
    if (!user) return message.reply('❌ Use `!start` first.');
    if (!args.length) return message.reply('❌ Provide a character name.');

    const input = normalize(args.join(' '));

    const ownedEntry = Object.entries(user.characters || {}).find(
      ([name]) => normalize(name) === input
    );

    if (!ownedEntry) return message.reply('❌ Character not found.');

    const [charName, charData] = ownedEntry;

    const baseChar = charactersDB.find(
      c => normalize(c.name) === normalize(charName)
    );

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${charName}`)
      .addFields(
        { name: '⭐ Rarity', value: charData.rarity, inline: true },
        { name: '📈 Level', value: `${charData.level}`, inline: true },
        { name: '🧩 Fragments', value: `${user.inventory?.fragments?.[charName] || 0}`, inline: true }
      )
      .setColor(0xff5555);

    if (baseChar?.image) embed.setImage(baseChar.image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`charinfo_${charName}`)
        .setLabel('📘 Character Info')
        .setStyle(ButtonStyle.Primary)
    );

    const msg = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== message.author.id)
        return i.reply({ content: '❌ Not your character.', ephemeral: true });

      const rarity = charData.rarity.toUpperCase();
      const maxLevel = mastery.maxLevel[rarity];
      const cost = mastery.fragmentCost[rarity];
      const nextUpgrade = mastery.levelRequirements[rarity];

      const infoEmbed = new EmbedBuilder()
        .setTitle(`📘 ${charName} — Mastery Info`)
        .setColor(0x00c2ff);

      if (rarity === 'EVENTS') {
        infoEmbed.setDescription(
          '🎉 **EVENT Character**\n' +
          '❌ Mastery & leveling disabled.'
        );
      } else {
        infoEmbed.setDescription(
          `⭐ **Rarity:** ${rarity}\n` +
          `📊 **Max Level:** ${maxLevel}\n` +
          `🧩 **Fragments / Level:** ${cost}\n` +
          (nextUpgrade
            ? `⬆️ **Evolves at Level:** ${nextUpgrade}`
            : '🔒 **Final rarity reached**')
        );
      }

      if (baseChar?.image) infoEmbed.setThumbnail(baseChar.image);

      await i.update({ embeds: [infoEmbed], components: [] });
    });
  }
};
