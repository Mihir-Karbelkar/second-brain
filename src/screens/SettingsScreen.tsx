import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useWords } from '../context/WordContext';

export default function SettingsScreen() {
  const { words, importWords } = useWords();

  const exportTxt = async () => {
    const lines = words.map((w) => `${w.word} | ${w.definition} | ${w.dateAdded}`);
    const fileUri = `${FileSystem.cacheDirectory}second-brain-export.txt`;
    await FileSystem.writeAsStringAsync(fileUri, lines.join('\n'));
    await Sharing.shareAsync(fileUri);
  };

  const importTxt = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain', copyToCacheDirectory: true });
    if (result.canceled) return;
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = content
      .split('\n')
      .map((line) => line.split(' | '))
      .filter((parts) => parts.length >= 3)
      .map(([word, definition, dateAdded]) => ({ word, definition, dateAdded, source: 'search' as const }));
    importWords(parsed);
    Alert.alert('Imported', `Imported ${parsed.length} rows`);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={exportTxt}><Text>Export .txt</Text></Pressable>
      <Pressable style={styles.button} onPress={importTxt}><Text>Import .txt</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 12 },
  button: { padding: 14, borderRadius: 10, backgroundColor: '#e8e8e8', alignItems: 'center' }
});
