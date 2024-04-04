import { createI18n } from 'vue-i18n'

type Messages = typeof messageJa;

const messageJa = {
  undo: '元に戻す',
  redo: 'やり直す',
  createNewScore: '新規譜面作成',
  loadScore: '譜面ファイル読み込み',
  saveScore: '譜面ファイル保存',
  importScoreFromText: 'テキスト形式の譜面読み込み',
  enablePrintLayout: '印刷レイアウト有効化',
  disablePrintLayout: '印刷レイアウト無効化',
  enableMobileLayout: 'モバイルレイアウト有効化',
  disableMobileLayout: 'モバイルレイアウト無効化',
  scoreMetadata: 'メタデータ',
  globalConfig: 'グローバル設定',
  help: 'ヘルプ',
  appInfo: 'アプリ情報',
  loadAudioFile: '音声ファイル読み込み',
  seekToHead: '先頭へ',
  rewind: '巻き戻し',
  play: '再生',
  pause: '一時停止',
  fastForward: '早送り',
  seekToTail: '末尾へ',
  volume: '音量',
  clearLoop: 'ループ解除',
  setLoopStart: 'ループ開始',
  setLoopEnd: 'ループ終了',
  chordText: 'コードテキスト',
  section: 'セクション',
  sectionName: 'セクション名',
  clefSign: '音部記号',
  clefSignTreble: 'ト音記号',
  clefSignBass: 'ヘ音記号',
  staffLineStepPx: '五線間隔(px)',
  systemMarginTopPx: '段上余白(px)',
  systemMarginBottomPx: '段下余白(px)',
  pagePaddingTopPx: 'ページ上余白(px)',
  chordFontSizePx: 'コードフォントサイズ(px)',
  pageWidthOnPrintPx: '印刷時のページ幅(px)',
  defaultGridNoteValue: 'デフォルトグリッド音価',
  gridNoteValue: 'グリッド音価',
  barEditorLocation: '小節エディターの位置',
  left: '左',
  right: '右',
  bottom: '下',
  resetToDefault: 'デフォルトに戻す',
  songTitle: '曲名',
  artistName: 'アーティスト名',
  composerName: '作曲者名',
  arrangerName: '編曲者名',
  lyricistName: '作詞者名',
  barBreakKind: '改段・改ページ',
  barBreakSystem: '改段',
  barBreakPage: '改ページ',
  barLineEndKind: '縦線(終)',
  barLineEndSingle: '小節線',
  barLineEndDouble: '複縦線',
  barLineEndRepeat: '反復記号',
  barLineEndGreatDouble: '終止線',
  barLineStartKind: '縦線(始)',
  barLineStartRepeat: '反復記号',
  partType: 'パート',
  chord: 'コード',
  normal: '通常',
  rhythm: 'リズム',
  barRepeatNumber: '反復括弧番号',
  beat: '拍子',
  scale: '調',
  transpose: '移調',
  major: 'メジャー',
  minor: 'マイナー',
  noteValueWhole: '全音符',
  noteValueHalf: '二分音符',
  noteValueQuarter: '四分音符',
  insertSectionBefore: '前にセクションを挿入',
  selectSection: 'セクション内の小節を選択',
  deleteSection: 'セクションを削除',
  copySection: 'セクション内の小節をコピー',
  pasteSection: 'コピーした小節をセクションに貼り付け',
  sectionSetting: 'セクション設定',
  insertSectionAfter: '後ろにセクションを挿入',
  generateNewSection: '新しいセクションを作成',
  insertBarBefore: '前に小節を挿入',
  selectPreviousBar: '前の小節を選択',
  convertToRestNote: '休符に変換',
  convertToNormalNote: '音符に変換',
  tie: '前のノートとタイでつなぐ',
  untie: '前のノートのタイを削除',
  removeNote: '音符を削除',
  copyNote: '音符をコピー',
  pasteNote: '音符に貼り付け',
  copyBar: '小節をコピー',
  pasteBar: 'コピーした小節を貼り付け',
  removeBar: '小節を削除',
  fillBarWithNote: '小節を音符で埋める',
  openChordTextDialog: 'コードテキスト編集',
  selectNextBar: '次の小節を選択',
  insertBarAfter: '後ろに小節を挿入',
  ok: 'OK',
  cancel: 'キャンセル',
  languageSetting: '言語設定',
  onPrintLayoutEnabledMessage: '印刷レイアウト表示中(クリックかキー入力で終了)',
  noteColor: 'ノートの色',
  editAllBars: '全小節一括編集',
  editAllBarsInCurrentPage: 'ページ内全小節一括編集',
  deleteAllBarsInCurrentPage: 'ページ内全小節削除',

  barSelected: '小節選択',
  barsSelected: '小節選択',

  helpMessage: {
    help: 'ヘルプ',
    common: '共通',
    keys: 'キー入力',
    description: '説明',
    selectNextBar: '次の小節を選択',
    selectExpandNextBar: '後ろの小節選択範囲を拡大',
    selectShrinkNextBar: '後ろの小節選択範囲を縮小',
    selectPreviousBar: '前の小節を選択',
    selectExpandPreviousBar: '前の小節選択範囲を拡大',
    selectShrinkPreviousBar: '前の小節選択範囲を縮小',
    undo: '変更を元に戻す',
    redo: '変更をやり直す',
    saveScore: '楽譜をローカルに保存する',
    copySelectedBars: '選択した小節をコピーする',
    pasteCopiedBars: 'コピーされた小節を貼り付ける',
    insertNewBarAfter: '新しい小節を後ろに挿入する',
    insertNewBarBefore: '新しい小節を前に挿入する',
    insertNewSectionAfter: '新しいセクションを後ろに挿入する',
    insertNewSectionBefore: '新しいセクションを前に挿入する',
    deleteSelectedBars: '選択した小節を削除する',
    breakSystem: '選択した小節から改段する',
    breakPage: '選択した小節から改ページする',
    removeBreak: '改段・改ページを取り除く',
    openOrCloseBarEditor: '小節エディターを開く・閉じる',
    showHelp: 'ヘルプを表示する',
    enablePrintLayout: '印刷レイアウトを有効化する',
    playOrPause: '再生/停止',
    audioPlayer: 'オーディオプレイヤー',
    barEditor: '小節エディター',
    selectNextNote: '次の音符を選択',
    selectPreviousNote: '前の音符を選択',
    openChordTextDialog: 'コードテキスト編集',
    fillSelectedBarWithNewNote: '小節を新しい音符で埋める',
    fillSelectedBarWithNewRestNote: '小節を新しい休符で埋める',
    deleteSelectedNote: '選択した音符を削除する',
    tieOrUntieSelectedNoteToPreviousNote: '前のノートとタイでつなぐ/タイを削除する',
    convertSelectedNoteToRestOrNormal: '音符/休符に変換する',
    copySelectedNote: '選択した音符をコピーする',
    pasteSelectedNoteContent: 'コピーした音符の内容を貼り付ける',
  },
};

let messageEn: Messages = {
  undo: 'Undo',
  redo: 'Redo',
  createNewScore: 'Create a new score',
  loadScore: 'Load score file',
  saveScore: 'Save score file',
  importScoreFromText: 'Load text score file',
  enablePrintLayout: 'Enable print layout',
  disablePrintLayout: 'Disable print layout',
  enableMobileLayout: 'Enable mobile layout',
  disableMobileLayout: 'Disable mobile layout',
  scoreMetadata: 'Score metadata',
  globalConfig: 'Global configuration',
  help: 'Help',
  appInfo: 'Information',
  loadAudioFile: 'Load an audio file',
  seekToHead: 'Seek to head',
  rewind: 'Rewind',
  play: 'Play',
  pause: 'Pause',
  fastForward: 'Fast forward',
  seekToTail: 'Seek to tail',
  volume: 'Volume',
  clearLoop: 'Clear loop',
  setLoopStart: 'Set loop start',
  setLoopEnd: 'Set loop end',
  chordText: 'Chord text',
  section: 'Section',
  sectionName: 'Section name',
  clefSign: 'Clef sign',
  clefSignTreble: 'Treble',
  clefSignBass: 'Bass',
  staffLineStepPx: 'Staff line step(px)',
  systemMarginTopPx: 'System margin top(px)',
  systemMarginBottomPx: 'System margin bottom(px)',
  pagePaddingTopPx: 'Page padding top(px)',
  chordFontSizePx: 'Chord font size(px)',
  pageWidthOnPrintPx: 'Page width on print(px)',
  defaultGridNoteValue: 'Default grid note value',
  gridNoteValue: 'Grid note value',
  barEditorLocation: 'Bar editor location',
  left: 'Left',
  right: 'Right',
  bottom: 'Bottom',
  resetToDefault: 'Reset to default',
  songTitle: 'Title',
  artistName: 'Artist name',
  composerName: 'Composer name',
  arrangerName: 'Arranger name',
  lyricistName: 'Lyricist name',
  barBreakKind: 'Bar break',
  barBreakSystem: 'System break',
  barBreakPage: 'Page break',
  barLineEndKind: 'Bar line(end)',
  barLineEndSingle: 'Standard',
  barLineEndDouble: 'Double',
  barLineEndRepeat: 'Repeat',
  barLineEndGreatDouble: 'Great double',
  barLineStartKind: 'Bar line(start)',
  barLineStartRepeat: 'Repeat',
  partType: 'Part type',
  chord: 'Chord',
  normal: 'Normal',
  rhythm: 'Rhythm',
  barRepeatNumber: 'Bar repeat number',
  beat: 'Beat',
  scale: 'Scale',
  transpose: 'Transpose',
  major: 'Major',
  minor: 'Minor',
  noteValueWhole: 'Whole',
  noteValueHalf: 'Half',
  noteValueQuarter: 'Quarter',
  insertSectionBefore: 'Insert section before',
  selectSection: 'Select bars in section',
  deleteSection: 'Delete section',
  copySection: 'Copy bars in section',
  pasteSection: 'Paste bars on section',
  sectionSetting: 'Section setting',
  insertSectionAfter: 'Insert section after',
  generateNewSection: 'Generate new section',
  insertBarBefore: 'Insert bar before',
  selectPreviousBar: 'Select previous bar',
  convertToRestNote: 'Convert to rest note',
  convertToNormalNote: 'Convert to normal note',
  tie: 'Tie with previous note',
  untie: 'Untie with privous note',
  removeNote: 'Remove note',
  copyNote: 'Copy note',
  pasteNote: 'Paste note',
  copyBar: 'Copy bar',
  pasteBar: 'Paste copied bar',
  removeBar: 'Remove bar',
  fillBarWithNote: 'Fill bar with note',
  openChordTextDialog: 'Open chord text editor',
  selectNextBar: 'Select next bar',
  insertBarAfter: 'Insert bar after',
  ok: 'OK',
  cancel: 'Cancel',
  languageSetting: 'Language setting',
  onPrintLayoutEnabledMessage: 'Print layout(Press any key or click to exit)',
  noteColor: 'Color of note',
  editAllBars: 'Edit all bars',
  editAllBarsInCurrentPage: 'Edit all bars in current page',
  deleteAllBarsInCurrentPage: 'Delete all bars in current page',

  barSelected: 'bar selected',
  barsSelected: 'bars selected',

  helpMessage: {
    help: 'Help',
    common: 'Common',
    keys: 'Keys',
    description: 'Description',
    selectNextBar: 'Select a next bar',
    selectExpandNextBar: 'Expand selection on the right',
    selectShrinkNextBar: 'Shrink selection on the right',
    selectPreviousBar: 'Select a previous bar',
    selectExpandPreviousBar: 'Expand selection on the left',
    selectShrinkPreviousBar: 'Shrink selection on the left',
    undo: 'Redo a change',
    redo: 'Undo a change',
    saveScore: 'Save a score to local storage',
    copySelectedBars: 'Copy selected bars',
    pasteCopiedBars: 'Paste copied bars on selected bars',
    insertNewBarAfter: 'Insert a new bar after selected bars',
    insertNewBarBefore: 'Insert a new bar before selected bars',
    insertNewSectionAfter: 'Insert a new section after selected bars',
    insertNewSectionBefore: 'Insert a new section before selected bars',
    deleteSelectedBars: 'Delete selected bars',
    breakSystem: 'Break a system before a selected bar',
    breakPage: 'Break a page before a selected bar',
    removeBreak: 'Remove a break before a selected bar',
    openOrCloseBarEditor: 'Open/Close a bar editor',
    showHelp: 'Show a help dialog',
    enablePrintLayout: 'Enable a print layout',
    playOrPause: 'Play/Pause',
    audioPlayer: 'Audio player',
    barEditor: 'Bar editor',
    selectNextNote: 'Select a next note',
    selectPreviousNote: 'Select a previous note',
    openChordTextDialog: 'Open chord text dialog',
    fillSelectedBarWithNewNote: 'Fill a selected bar with a new note',
    fillSelectedBarWithNewRestNote: 'Fill a selected bar with a new rest note',
    deleteSelectedNote: 'Delete a selected note',
    tieOrUntieSelectedNoteToPreviousNote: 'Tie/Untie a selected note to a previous note',
    convertSelectedNoteToRestOrNormal: 'Convert selected note to rest/normal note',
    copySelectedNote: 'Copy a selected note',
    pasteSelectedNoteContent: 'Paste a content of a copied note',
  },
};

export const i18n = createI18n({
  locale: 'ja',
  fallbackLocale: 'ja',
  messages: {
    ja: messageJa,
    en: messageEn,
  },
})
