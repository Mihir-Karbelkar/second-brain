# Second Brain

Offline-first React Native (Expo) vocabulary tracker.

## Features
- Home tab with searchable saved words and detail modal
- Search tab for manual add and offline dictionary lookup
- Settings tab for `.txt` export/import
- SQLite persistence (`expo-sqlite`)
- Local static dictionary JSON (`src/data/dictionary.json`)
- Android share/process text intent registration for **Ask Second Brain**
- iOS Share Extension scaffold with App Group shared defaults key

## Data model
```ts
Word {
  id: uuid
  word: string
  definition: string
  source: 'manual' | 'search' | 'context_menu'
  notes?: string
  dateAdded: ISO string
}
```

## Run
```bash
npm install
npm run start
npm run android
npm run ios
```

## Android context menu integration
- `android/app/src/main/AndroidManifest.xml` registers `PROCESS_TEXT` and `SEND` intent filters for plain text.
- In `MainActivity`, read `Intent.EXTRA_PROCESS_TEXT` or `Intent.EXTRA_TEXT` and route to the React Native screen to prefill + show the save bottom sheet.

## iOS share extension integration
- Share extension target scaffold at `ios/SecondBrainShareExtension`.
- Add an App Group capability (e.g. `group.com.example.secondbrain`) to both the app target and extension target.
- The extension stores selected text under `pendingSharedWord`, which the app reads on launch/resume.

## Import/export format
Each row in exported text:
```text
word | definition | date added
```
Import merges into SQLite using `INSERT OR IGNORE` by unique `word`.

## Dictionary source note
Replace `src/data/dictionary.json` with a fuller royalty-free dataset (WordNet/GCIDE-derived JSON) kept under 20MB.

## Android APK releases
GitHub Actions builds the Android APK from the Expo project and attaches it to a GitHub Release when you push a version tag.

```bash
git tag v1.0.0
git push origin v1.0.0
```

You can also run the **Android APK Release** workflow manually from the Actions tab to produce a downloadable APK artifact without publishing a GitHub Release.
