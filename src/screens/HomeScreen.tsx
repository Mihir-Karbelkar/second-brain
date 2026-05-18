import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useWords } from '../context/WordContext';
import { lookupDefinition } from '../utils/dictionary';
import { Word } from '../types/word';

export default function HomeScreen() {
  const { words, saveWord } = useWords();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Word | null>(null);

  const filtered = useMemo(() => words.filter((w) => w.word.includes(query.toLowerCase())), [words, query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search or lookup a word"
        onSubmitEditing={() => {
          if (!query.trim()) return;
          saveWord({ word: query, definition: lookupDefinition(query), source: 'search' });
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            <Text style={styles.word}>{item.word}</Text>
            <Text numberOfLines={2}>{item.definition}</Text>
            <Text style={styles.date}>{new Date(item.dateAdded).toLocaleDateString()}</Text>
          </Pressable>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.word}>{selected?.word}</Text>
            <Text>{selected?.definition}</Text>
            <Text>{selected?.notes}</Text>
            <Text>{selected ? new Date(selected.dateAdded).toLocaleString() : ''}</Text>
            <Pressable onPress={() => setSelected(null)}><Text>Close</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 8 },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 },
  card: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 8 },
  word: { fontSize: 18, fontWeight: '700' },
  date: { marginTop: 8, color: '#666', fontSize: 12 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 10 }
});
