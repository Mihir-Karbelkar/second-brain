import * as SQLite from 'expo-sqlite';
import { Word } from '../types/word';

const db = SQLite.openDatabaseSync('second-brain.db');

const ensureColumn = (column: string, def: string) => {
  try {
    db.execSync(`ALTER TABLE words ADD COLUMN ${column} ${def};`);
  } catch {}
};

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT UNIQUE NOT NULL,
      definition TEXT NOT NULL,
      source TEXT NOT NULL,
      sourceTitle TEXT,
      sourcePage INTEGER,
      contextSentence TEXT,
      notes TEXT,
      dateAdded TEXT NOT NULL
    );
  `);

  ensureColumn('sourceTitle', 'TEXT');
  ensureColumn('sourcePage', 'INTEGER');
  ensureColumn('contextSentence', 'TEXT');
};

export const getWords = (): Word[] => {
  return db.getAllSync<Word>('SELECT * FROM words ORDER BY dateAdded DESC;');
};

export const insertWord = (word: Word) => {
  db.runSync(
    'INSERT OR IGNORE INTO words (id, word, definition, source, sourceTitle, sourcePage, contextSentence, notes, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      word.id,
      word.word.toLowerCase(),
      word.definition,
      word.source,
      word.sourceTitle ?? null,
      word.sourcePage ?? null,
      word.contextSentence ?? null,
      word.notes ?? null,
      word.dateAdded,
    ]
  );
};

export const upsertWords = (words: Word[]) => {
  for (const word of words) insertWord(word);
};
