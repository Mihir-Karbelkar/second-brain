export type WordSource = 'manual' | 'search' | 'context_menu';

export type Word = {
  id: string;
  word: string;
  definition: string;
  source: WordSource;
  notes?: string;
  dateAdded: string;
};
