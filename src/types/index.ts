export type ThemeMode = 'system' | 'yellow-black' | 'high-contrast-white' | 'sepia' | 'soft-blue' | 'slate-dark';

export type FontFamilyChoice = 'lexend' | 'atkinson' | 'jetbrains' | 'newsreader' | 'sans';

export interface ReadingPreferences {
  theme: ThemeMode;
  fontFamily: FontFamilyChoice;
  fontSize: number; // in px (14 - 36)
  lineHeight: number; // 1.2 to 2.6
  letterSpacing: number; // 0 to 4 px
  wordSpacing: number; // 0 to 8 px
  paragraphSpacing: number; // in px
  bionicReading: boolean;
  readingRuler: boolean;
  highlightCurrentSentence: boolean;
  autoScrollWithSpeech: boolean;
  simplifyPunctuation: boolean;
}

export interface PreprocessingConfig {
  grayscale: boolean;
  binarize: boolean;
  threshold: number; // 0 - 255
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  invert: boolean;
  deskewAngle: number; // -15 to 15 degrees
}

export interface ExtractedDocument {
  id: string;
  name: string;
  sourceType: 'digital-pdf' | 'scanned-image' | 'sample-benchmark';
  originalFileUrl?: string;
  thumbnailUrl?: string;
  processedImageUrl?: string;
  rawText: string;
  paragraphs: string[];
  documentType: string;
  imageQuality: 'Clear' | 'Moderate' | 'Degraded / Low-Contrast' | 'Noisy / Skewed';
  headings: string[];
  errorNotes: string[];
  confidenceScore: number;
  processingTimeMs: number;
  wordCount: number;
  characterCount: number;
  estimatedReadingMinutes: number;
  pages?: { pageNumber: number; text: string; imageUrl?: string }[];
  simplified?: {
    tldr: string;
    simplifiedText: string;
    keyTakeaways: string[];
    glossary: { term: string; definition: string }[];
  };
}

export interface BenchmarkDocument {
  id: string;
  title: string;
  category: string;
  documentType: 'Scanned PDF' | 'Digital PDF' | 'Degraded Scan' | 'Skewed Document' | 'Form / Table' | 'Small Font Print';
  imageQuality: 'Clear' | 'Moderate' | 'Degraded / Low-Contrast' | 'Noisy / Skewed';
  description: string;
  referenceText: string;
  previewImageUrl: string;
  expectedChallenges: string[];
}

export interface EvaluationRecord {
  id: string;
  documentId: string;
  documentType: string;
  imageQuality: string;
  referenceText: string;
  extractedText: string;
  preprocessingMode: string;
  substitutions: number;
  deletions: number;
  insertions: number;
  referenceCharCount: number;
  cer: number; // Character Error Rate: (S+D+I)/N
  wer: number; // Word Error Rate
  processingTimeMs: number;
  errorNotes: string;
  timestamp: string;
}

export interface SpeechStatus {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  currentSentenceIndex: number;
  currentWordIndex: number;
  currentWordText: string;
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string | null;
}
