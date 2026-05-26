export type WordSource = 'manual' | 'search' | 'context_menu' | 'pdf_reader';

export type Word = {
  id: string;
  word: string;
  definition: string;
  source: WordSource;
  sourceTitle?: string;
  sourcePage?: number;
  contextSentence?: string;
  notes?: string;
  dateAdded: string;
};
