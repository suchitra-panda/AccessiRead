import React, { useState, useEffect, useCallback } from 'react';
import { ExtractedDocument, ReadingPreferences, ThemeMode } from './types';
import { BENCHMARK_DOCUMENTS } from './utils/sampleDocuments';
import { cleanOCRText, calculateReadingTime } from './utils/textTransform';
import { ttsEngine } from './utils/ttsEngine';
import { Header } from './components/Header';
import { ReadingToolbar } from './components/ReadingToolbar';
import { ReaderView } from './components/ReaderView';
import { SpeechController } from './components/SpeechController';
import { DocumentUpload } from './components/DocumentUpload';
import { EvaluationLab } from './components/EvaluationLab';
import { CognitivePlainLanguage } from './components/CognitivePlainLanguage';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

const DEFAULT_PREFERENCES: ReadingPreferences = {
  theme: 'system',
  fontFamily: 'lexend',
  fontSize: 18,
  lineHeight: 1.8,
  letterSpacing: 1,
  wordSpacing: 2,
  paragraphSpacing: 24,
  bionicReading: false,
  readingRuler: false,
  highlightCurrentSentence: true,
  autoScrollWithSpeech: true,
  simplifyPunctuation: false
};

export default function App() {
  const [activeSection, setActiveSection] = useState<'reader' | 'upload' | 'eval' | 'plain'>('reader');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Load preferences from localStorage or fallback
  const [preferences, setPreferences] = useState<ReadingPreferences>(() => {
    try {
      const saved = localStorage.getItem('accessiread_preferences');
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch (e) {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  // Save preferences
  const updatePreferences = (updates: Partial<ReadingPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('accessiread_preferences', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem('accessiread_preferences', JSON.stringify(DEFAULT_PREFERENCES));
    } catch (e) {
      // ignore
    }
  };

  // Initialize active document from Benchmark DOC001
  const [currentDocument, setCurrentDocument] = useState<ExtractedDocument>(() => {
    const initialBench = BENCHMARK_DOCUMENTS[0];
    const cleaned = cleanOCRText(initialBench.referenceText);
    const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    return {
      id: initialBench.id,
      name: initialBench.title,
      sourceType: 'sample-benchmark',
      originalFileUrl: initialBench.previewImageUrl,
      thumbnailUrl: initialBench.previewImageUrl,
      rawText: cleaned,
      paragraphs,
      documentType: initialBench.documentType,
      imageQuality: initialBench.imageQuality,
      headings: [initialBench.title],
      errorNotes: initialBench.expectedChallenges,
      confidenceScore: 99,
      processingTimeMs: 120,
      wordCount,
      characterCount: cleaned.length,
      estimatedReadingMinutes: calculateReadingTime(cleaned),
      simplified: {
        tldr: 'Every human being is born free, equal in rights, and protected against slavery or abuse.',
        simplifiedText: `Article 1: Freedom and Equality
All human beings are born free. Everyone has equal dignity and rights. People should treat one another with kindness and respect like family.

Article 2: Rights for Everyone
Everyone has these rights. It does not matter what your race, skin colour, language, religion, or opinion is.

Article 3: Right to Life
Every person has the right to live, to be free, and to be safe.

Article 4: Freedom from Slavery
No person may be kept as a slave. Slavery is strictly forbidden everywhere.`,
        keyTakeaways: [
          'All people are born free and equal regardless of background.',
          'Everyone has the right to life, liberty, and personal safety.',
          'Slavery and discrimination are completely prohibited.'
        ],
        glossary: [
          { term: 'Dignity', definition: 'The right of a person to be valued and treated with respect.' },
          { term: 'Servitude', definition: 'Being forced to obey and work for someone without freedom.' }
        ]
      }
    };
  });

  // Handle document upload or selection
  const handleDocumentLoaded = (doc: ExtractedDocument) => {
    setCurrentDocument(doc);
    ttsEngine.prepare(doc.rawText);
    setActiveSection('reader');
  };

  const handleLoadDocumentForReading = (text: string, title: string) => {
    const cleaned = cleanOCRText(text);
    const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    const newDoc: ExtractedDocument = {
      id: `DOC-READ-${Date.now().toString().slice(-4)}`,
      name: title,
      sourceType: 'digital-pdf',
      rawText: cleaned,
      paragraphs,
      documentType: 'Document Text',
      imageQuality: 'Clear',
      headings: [title],
      errorNotes: [],
      confidenceScore: 98,
      processingTimeMs: 50,
      wordCount,
      characterCount: cleaned.length,
      estimatedReadingMinutes: calculateReadingTime(cleaned)
    };

    handleDocumentLoaded(newDoc);
  };

  // Keyboard accessibility shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        // check state via tts
        ttsEngine.play();
        return;
      }

      // [ / ]: Previous / Next sentence
      if (e.key === '[') {
        e.preventDefault();
        ttsEngine.previousSentence();
        return;
      }
      if (e.key === ']') {
        e.preventDefault();
        ttsEngine.nextSentence();
        return;
      }

      // Escape: Stop playback or close modal
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        } else {
          ttsEngine.stop();
        }
        return;
      }

      // Alt + + : Increase font size
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        updatePreferences({ fontSize: Math.min(36, preferences.fontSize + 2) });
        return;
      }

      // Alt + - : Decrease font size
      if (e.altKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        updatePreferences({ fontSize: Math.max(14, preferences.fontSize - 2) });
        return;
      }

      // Alt + T : Cycle contrast theme
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        const themes: ThemeMode[] = [
          'system',
          'yellow-black',
          'high-contrast-white',
          'sepia',
          'soft-blue',
          'slate-dark'
        ];
        const nextIdx = (themes.indexOf(preferences.theme) + 1) % themes.length;
        updatePreferences({ theme: themes[nextIdx] });
        return;
      }

      // Alt + B : Toggle Bionic Reading
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        updatePreferences({ bionicReading: !preferences.bionicReading });
        return;
      }

      // Alt + R : Toggle Reading Ruler
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        updatePreferences({ readingRuler: !preferences.readingRuler });
        return;
      }

      // ? : Open shortcuts modal
      if (e.key === '?' && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }
    },
    [isShortcutsOpen, preferences]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const totalSentences = currentDocument.paragraphs.reduce(
    (acc, p) => acc + (p.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)?.length || 1),
    0
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Accessible Skip Link for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-stone-950 focus:font-bold focus:rounded-lg focus:shadow-xl"
      >
        Skip to main document content
      </a>

      {/* Primary Header */}
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        documentTitle={currentDocument.name}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
        {activeSection === 'reader' && (
          <>
            <ReadingToolbar
              preferences={preferences}
              onUpdatePreferences={updatePreferences}
              onResetDefaults={resetPreferences}
            />
            <div className="flex-1">
              <ReaderView
                document={currentDocument}
                preferences={preferences}
                onNavigateToPlainLanguage={() => setActiveSection('plain')}
              />
            </div>
            <SpeechController
              fullText={currentDocument.rawText}
              totalSentences={totalSentences}
            />
          </>
        )}

        {activeSection === 'upload' && (
          <DocumentUpload
            onDocumentLoaded={handleDocumentLoaded}
            currentDocument={currentDocument}
          />
        )}

        {activeSection === 'eval' && (
          <EvaluationLab onLoadDocumentForReading={handleLoadDocumentForReading} />
        )}

        {activeSection === 'plain' && (
          <>
            <CognitivePlainLanguage
              document={currentDocument}
              onUpdateDocumentSimplified={(simplifiedData) => {
                setCurrentDocument((prev) => ({
                  ...prev,
                  simplified: simplifiedData
                }));
              }}
            />
            <SpeechController
              fullText={
                currentDocument.simplified
                  ? `${currentDocument.simplified.tldr}. ${currentDocument.simplified.simplifiedText}`
                  : currentDocument.rawText
              }
              totalSentences={totalSentences}
            />
          </>
        )}
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
