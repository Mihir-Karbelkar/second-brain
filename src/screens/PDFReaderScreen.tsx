import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { useWords } from '../context/WordContext';

type Theme = 'white' | 'sepia' | 'dark';
type ReaderSettings = { theme: Theme; fontSize: number; serif: boolean };
type PdfItem = { id: string; title: string; uri: string; lastOpenedAt?: string; progressPercent: number };

const LIB_DIR = `${FileSystem.documentDirectory}pdf-library/`;
const LIB_INDEX = `${LIB_DIR}index.json`;
const SETTINGS_KEY = 'pdf-reader-settings-v1';

export default function PDFReaderScreen() {
  const { saveWord } = useWords();
  const [library, setLibrary] = useState<PdfItem[]>([]);
  const [active, setActive] = useState<PdfItem | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>({ theme: 'white', fontSize: 18, serif: false });
  const [selectedWord, setSelectedWord] = useState<{word: string; sentence: string; page: number} | null>(null);

  const loadLibrary = async () => {
    await FileSystem.makeDirectoryAsync(LIB_DIR, { intermediates: true });
    const exists = await FileSystem.getInfoAsync(LIB_INDEX);
    if (!exists.exists) return setLibrary([]);
    const raw = await FileSystem.readAsStringAsync(LIB_INDEX);
    setLibrary(JSON.parse(raw));
  };

  const saveLibrary = async (next: PdfItem[]) => {
    setLibrary(next);
    await FileSystem.writeAsStringAsync(LIB_INDEX, JSON.stringify(next));
  };

  useEffect(() => { loadLibrary(); }, []);
  useEffect(() => { AsyncStorage.getItem(SETTINGS_KEY).then((s) => s && setSettings(JSON.parse(s))); }, []);

  const importPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const dest = `${LIB_DIR}${id}.pdf`;
    await FileSystem.copyAsync({ from: asset.uri, to: dest });
    const item: PdfItem = { id, title: asset.name || `PDF ${library.length + 1}`, uri: dest, progressPercent: 0 };
    await saveLibrary([item, ...library]);
  };

  const textBlocks = useMemo(
    () => Array.from({ length: 120 }).map((_, i) => `Sample reflowed block ${i + 1} for ${active?.title ?? ''}. Long press any word to save.`),
    [active]
  );

  const onSaveWord = () => {
    if (!selectedWord || !active) return;
    saveWord({
      word: selectedWord.word,
      definition: 'Captured from PDF reader',
      source: 'pdf_reader',
      sourceTitle: active.title,
      sourcePage: selectedWord.page,
      contextSentence: selectedWord.sentence,
      notes: `Source: ${active.title} (p.${selectedWord.page})`,
    });
    setSelectedWord(null);
    Alert.alert('Saved', 'Word saved to Second Brain');
  };

  if (!active) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Library</Text>
        <FlashList
          data={library}
          estimatedItemSize={64}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => setActive({ ...item, lastOpenedAt: new Date().toISOString() })}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>Last opened: {item.lastOpenedAt ? new Date(item.lastOpenedAt).toLocaleString() : 'Never'}</Text>
              <Text>Progress: {item.progressPercent}%</Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.fab} onPress={importPdf}><Text style={styles.fabText}>+</Text></Pressable>
      </View>
    );
  }

  const themed = settings.theme === 'dark' ? { backgroundColor: '#111', color: '#fff' } : settings.theme === 'sepia' ? { backgroundColor: '#f5ecd9', color: '#3a2f23' } : { backgroundColor: '#fff', color: '#111' };

  return (
    <View style={[styles.container, { backgroundColor: themed.backgroundColor }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setActive(null)}><Text style={{ color: themed.color }}>Back</Text></Pressable>
        <Text style={[styles.topTitle, { color: themed.color }]} numberOfLines={1}>{active.title}</Text>
        <Text style={{ color: themed.color }}>{active.progressPercent}%</Text>
      </View>
      <FlashList
        data={textBlocks}
        estimatedItemSize={90}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const total = (e.nativeEvent.contentSize.height || 1) - (e.nativeEvent.layoutMeasurement.height || 1);
          const progress = Math.max(0, Math.min(100, Math.round((y / Math.max(1, total)) * 100)));
          setLibrary((prev) => prev.map((p) => (p.id === active.id ? { ...p, progressPercent: progress } : p)));
        }}
        renderItem={({ item, index }) => (
          <Pressable
            onLongPress={() => {
              const word = item.split(' ')[3] || 'sample';
              setSelectedWord({ word, sentence: item, page: Math.floor(index / 4) + 1 });
            }}
            style={styles.block}
          >
            <Text style={{ color: themed.color, fontSize: settings.fontSize, fontFamily: settings.serif ? 'Georgia' : undefined }}>{item}</Text>
          </Pressable>
        )}
      />
      <View style={styles.bottomBar}>
        <Pressable onPress={async () => { const n = { ...settings, theme: settings.theme === 'white' ? 'sepia' : settings.theme === 'sepia' ? 'dark' : 'white' }; setSettings(n); await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(n)); }}><Text>Theme</Text></Pressable>
        <Pressable onPress={async () => { const n = { ...settings, serif: !settings.serif }; setSettings(n); await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(n)); }}><Text>Font</Text></Pressable>
        <Pressable onPress={async () => { const n = { ...settings, fontSize: Math.min(24, settings.fontSize + 1) }; setSettings(n); await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(n)); }}><Text>A+</Text></Pressable>
        <Pressable onPress={async () => { const n = { ...settings, fontSize: Math.max(14, settings.fontSize - 1) }; setSettings(n); await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(n)); }}><Text>A-</Text></Pressable>
      </View>

      <Modal visible={!!selectedWord} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Save Word</Text>
            <TextInput value={selectedWord?.word ?? ''} onChangeText={(t) => setSelectedWord((prev) => prev ? ({ ...prev, word: t }) : prev)} style={styles.input} />
            <Text>{selectedWord?.sentence}</Text>
            <Text>{active.title} • page {selectedWord?.page}</Text>
            <Pressable style={styles.button} onPress={onSaveWord}><Text>Save to Second Brain</Text></Pressable>
            <Pressable onPress={() => setSelectedWord(null)}><Text>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 10 },
  title: { fontWeight: '700', fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 },
  topTitle: { flex: 1, fontWeight: '700' },
  block: { marginBottom: 12 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderColor: '#ddd' },
  modalBg: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 },
  button: { padding: 10, backgroundColor: '#e8e8e8', borderRadius: 8, alignItems: 'center' },
});
