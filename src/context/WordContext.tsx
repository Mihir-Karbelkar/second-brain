import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initDb, getWords, insertWord, upsertWords } from '../db/sqlite';
import { Word, WordSource } from '../types/word';

type SaveWordPayload = {
  word: string;
  definition: string;
  source: WordSource;
  notes?: string;
  sourceTitle?: string;
  sourcePage?: number;
  contextSentence?: string;
};

type Ctx = {
  words: Word[];
  reload: () => void;
  saveWord: (payload: SaveWordPayload) => void;
  importWords: (imported: Omit<Word, 'id'>[]) => void;
};

const WordContext = createContext<Ctx | undefined>(undefined);

export const WordProvider = ({ children }: { children: React.ReactNode }) => {
  const [words, setWords] = useState<Word[]>([]);

  const reload = () => setWords(getWords());

  useEffect(() => {
    initDb();
    reload();
  }, []);

  const saveWord: Ctx['saveWord'] = ({ word, definition, source, notes, sourceTitle, sourcePage, contextSentence }) => {
    insertWord({
      id: uuidv4(),
      word,
      definition,
      source,
      sourceTitle,
      sourcePage,
      contextSentence,
      notes,
      dateAdded: new Date().toISOString(),
    });
    reload();
  };

  const importWords: Ctx['importWords'] = (imported) => {
    const hydrated: Word[] = imported.map((x) => ({ ...x, id: uuidv4() }));
    upsertWords(hydrated);
    reload();
  };

  const value = useMemo(() => ({ words, reload, saveWord, importWords }), [words]);
  return <WordContext.Provider value={value}>{children}</WordContext.Provider>;
};

export const useWords = () => {
  const ctx = useContext(WordContext);
  if (!ctx) throw new Error('useWords must be used inside WordProvider');
  return ctx;
};
