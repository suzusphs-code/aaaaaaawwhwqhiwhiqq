const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/bot.db';

const db = new Database(DB_PATH);

// USERS TABLE
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  userId TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  diamonds INTEGER DEFAULT 0
)
`).run();

// CHARACTERS OWNED
db.prepare(`
CREATE TABLE IF NOT EXISTS user_characters (
  userId TEXT,
  name TEXT,
  rarity TEXT,
  level INTEGER,
  PRIMARY KEY (userId, name)
)
`).run();

// FRAGMENTS
db.prepare(`
CREATE TABLE IF NOT EXISTS fragments (
  userId TEXT,
  name TEXT,
  amount INTEGER,
  PRIMARY KEY (userId, name)
)
`).run();

// TEAM
db.prepare(`
CREATE TABLE IF NOT EXISTS team (
  userId TEXT,
  name TEXT
)
`).run();

module.exports = db;
