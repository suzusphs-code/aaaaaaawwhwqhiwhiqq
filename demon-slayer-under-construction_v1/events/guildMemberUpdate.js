const fs = require('fs');
const path = require('path');
const users = require('../database/users.json');
const premium = require('../systems/premiumConfig');

const dbPath = path.join(__dirname, '../database/users.json');

module.exports = {
  name: 'guildMemberUpdate',

  execute(oldMember, newMember) {
    const userId = newMember.id;
    if (!users[userId]) return;

    const now = Date.now();

    for (const tier in premium.roles) {
      const { roleId, coins } = premium.roles[tier];

      const hadRole = oldMember.roles.cache.has(roleId);
      const hasRole = newMember.roles.cache.has(roleId);

      // role newly added
      if (!hadRole && hasRole) {
        if (!users[userId].premium) {
          users[userId].premium = {};
        }

        const userPremium = users[userId].premium;

        // prevent duplicate grants
        if (userPremium.lastGranted && now - userPremium.lastGranted < premium.duration) {
          return;
        }

        // grant coins
        users[userId].balance += coins;

        // update premium data
        userPremium.tier = tier;
        userPremium.lastGranted = now;
        userPremium.expiresAt = now + premium.duration;

        fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

        // log payment
        const logChannel = newMember.guild.channels.cache.get(premium.logChannelId);
        if (logChannel) {
          logChannel.send(
            `💎 **Premium Activated**\n` +
            `👤 User: ${newMember.user.tag}\n` +
            `🏷 Tier: ${tier}\n` +
            `💰 Coins: ${coins}`
          );
        }
      }
    }
  }
};
