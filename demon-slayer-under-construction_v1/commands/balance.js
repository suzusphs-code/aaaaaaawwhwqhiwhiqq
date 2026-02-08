const db = require('../database/db');

module.exports = {
  name: 'balance',
  execute(message) {
    const user = db.prepare(`
      SELECT * FROM users WHERE userId = ?
    `).get(message.author.id);

    if (!user) return message.reply('❌ Use `!start` first.');

    message.reply(
      `💰 Coins: **${user.balance}**\n💎 Diamonds: **${user.diamonds}**`
    );
  }
};
