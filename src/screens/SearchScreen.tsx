import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { lookupDefinition } from '../utils/dictionary';
import { useWords } from '../context/WordContext';

export default function SearchScreen() {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [notes, setNotes] = useState('');
  const { saveWord } = useWords();

  const autoLookup = () => setDefinition(lookupDefinition(word));

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={word} onChangeText={setWord} placeholder="Word" />
      <Pressable style={styles.button} onPress={autoLookup}><Text>Lookup (offline)</Text></Pressable>
      <TextInput style={[styles.input, styles.multi]} multiline value={definition} onChangeText={setDefinition} placeholder="Definition" />
      <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Notes (optional)" />
      <Pressable
        style={styles.button}
        onPress={() => saveWord({ word, definition: definition || 'Definition not found', source: 'manual', notes })}
      >
        <Text>Save Word</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 },
  multi: { minHeight: 120, textAlignVertical: 'top' },
  button: { padding: 12, borderRadius: 10, backgroundColor: '#e8e8e8', alignItems: 'center' }
});
