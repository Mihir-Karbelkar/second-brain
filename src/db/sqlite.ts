import * as SQLite from 'expo-sqlite';
import { Word } from '../types/word';

const db = SQLite.openDatabaseSync('second-brain.db');

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT UNIQUE NOT NULL,
      definition TEXT NOT NULL,
      source TEXT NOT NULL,
      notes TEXT,
      dateAdded TEXT NOT NULL
    );
  `);
};

export const getWords = (): Word[] => {
  return db.getAllSync<Word>('SELECT * FROM words ORDER BY dateAdded DESC;');
};

export const insertWord = (word: Word) => {
  db.runSync(
    'INSERT OR IGNORE INTO words (id, word, definition, source, notes, dateAdded) VALUES (?, ?, ?, ?, ?, ?);',
    [word.id, word.word.toLowerCase(), word.definition, word.source, word.notes ?? null, word.dateAdded]
  );
};

export const upsertWords = (words: Word[]) => {
  for (const word of words) insertWord(word);
};
