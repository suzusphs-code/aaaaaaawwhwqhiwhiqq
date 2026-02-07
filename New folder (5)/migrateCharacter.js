const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, './database/users.json');
const charactersDB = require('./database/characters.json');

const users = JSON.parse(fs.readFileSync(usersPath));

for (const userId in users) {
  const user = users[userId];

  // already migrated
  if (!Array.isArray(user.characters)) continue;

  const newCharacters = {};

  for (const name of user.characters) {
    // normalize name
    const fixedName = charactersDB.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    )?.name || name;

    if (!newCharacters[fixedName]) {
      const charData = charactersDB.find(
        c => c.name.toLowerCase() === fixedName.toLowerCase()
      );

      newCharacters[fixedName] = {
        rarity: (charData?.rarity || "COMMON").toUpperCase(),
        level: 1,
        fragments: user.inventory?.fragments?.[fixedName] || 0
      };
    } else {
      // duplicate → fragment
      newCharacters[fixedName].fragments += 1;
    }
  }

  user.characters = newCharacters;
  delete user.inventory; // fragments now live in character itself
}

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
console.log("✅ Migration complete");
