const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',

  execute(message, client) {
    const messageLatency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x57f287)
      .addFields(
        { name: '📨 Message Latency', value: `${messageLatency}ms`, inline: true },
        { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: 'Bot is running smoothly 🚀' });

    message.reply({ embeds: [embed] });
  }
};
