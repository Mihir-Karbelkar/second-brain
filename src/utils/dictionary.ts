import dictionary from '../data/dictionary.json';

const normalizedDictionary = dictionary as Record<string, string>;

export const lookupDefinition = (word: string): string => {
  const key = word.trim().toLowerCase();
  return normalizedDictionary[key] ?? 'Definition not found';
};
