const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',

  execute(message) {
    const messageLatency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x57f287)
      .addFields(
        { name: '📨 Message Latency', value: `${messageLatency}ms`, inline: true },
        { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: 'Bot is online 🚀' });

    message.reply({ embeds: [embed] });
  }
};
