const fs = require('fs');
const path = require('path');
const users = require('../database/users.json');

const dbPath = path.join(__dirname, '../database/users.json');

module.exports = (client) => {
  setInterval(() => {
    const now = Date.now();
    let changed = false;

    for (const userId in users) {
      const premium = users[userId].premium;
      if (!premium) continue;

      if (premium.expiresAt <= now) {
        delete users[userId].premium;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    }
  }, 60 * 60 * 1000); // hourly
};
