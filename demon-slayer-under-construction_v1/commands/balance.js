const users = require('../database/users.json');

module.exports = {
  name: 'balance',
  execute(message) {
    const user = users[message.author.id];
    if (!user) return message.reply('Use `!start` first.');

    message.reply(`💰 Coins: **${user.balance}**\n💎 Diamonds: **${user.diamonds}**`);
  }
};
