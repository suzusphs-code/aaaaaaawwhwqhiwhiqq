const db = require('./database/db');
const users = require('./database/users.json');

for (const userId of Object.keys(users)) {
  const user = users[userId];

  // insert user
  db.prepare(`
    INSERT OR IGNORE INTO users (userId, balance, diamonds)
    VALUES (?, ?, ?)
  `).run(userId, user.balance || 0, user.diamonds || 0);

  // characters
  if (user.characters) {
    for (const [name, data] of Object.entries(user.characters)) {
      db.prepare(`
        INSERT OR REPLACE INTO user_characters
        (userId, name, rarity, level)
        VALUES (?, ?, ?, ?)
      `).run(
        userId,
        name,
        data.rarity,
        data.level
      );
    }
  }

  // fragments
  if (user.inventory?.fragments) {
    for (const [name, amount] of Object.entries(user.inventory.fragments)) {
      db.prepare(`
        INSERT OR REPLACE INTO fragments
        (userId, name, amount)
        VALUES (?, ?, ?)
      `).run(userId, name, amount);
    }
  }

  // team
  if (user.team) {
    for (const name of user.team) {
      db.prepare(`
        INSERT INTO team (userId, name)
        VALUES (?, ?)
      `).run(userId, name);
    }
  }
}

console.log('✅ Migration complete!');
