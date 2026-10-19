import React, { useState, useEffect, useRef } from 'react';
import {
  ExtractedDocument,
  ReadingPreferences
} from '../types';
import { ttsEngine, TTSState } from '../utils/ttsEngine';
import { splitSentences, formatBionicWord } from '../utils/textTransform';
import { Columns, Eye, BookOpen, AlertCircle, Sparkles, Volume2 } from 'lucide-react';

interface Props {
  document: ExtractedDocument;
  preferences: ReadingPreferences;
  onNavigateToPlainLanguage?: () => void;
}

export const ReaderView: React.FC<Props> = ({
  document,
  preferences,
  onNavigateToPlainLanguage
}) => {
  const [showOriginalSplit, setShowOriginalSplit] = useState(false);
  const [rulerTop, setRulerTop] = useState<number | null>(null);
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentSentenceIdx: 0,
    currentWordIdx: 0,
    currentWord: '',
    charIndex: 0
  });

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to TTS status for synchronized highlight
  useEffect(() => {
    const unsub = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsub();
  }, []);

  // Track mouse for reading ruler if enabled
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!preferences.readingRuler || !readerContainerRef.current) return;
    const rect = readerContainerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setRulerTop(relativeY);
  };

  // Build sentence mapping across paragraphs to support global indexing in TTS
  let globalSentenceCount = 0;
  const paragraphSentenceMap = document.paragraphs.map((para) => {
    const sentences = splitSentences(para);
    const mapped = sentences.map((sent) => ({
      text: sent,
      globalIndex: globalSentenceCount++
    }));
    return mapped;
  });

  // Pick theme classes
  const getThemeStyles = () => {
    switch (preferences.theme) {
      case 'yellow-black':
        return {
          container: 'bg-[#000000] text-[#FFEE00]',
          activeSentence: 'bg-[#FFEE00] text-[#000000] font-bold outline-2 outline-[#FFEE00]',
          activeWord: 'bg-[#000000] text-[#FFEE00] underline',
          originalPane: 'bg-[#111111] border-[#333333] text-[#FFEE00]',
          ruler: 'bg-[#FFEE00]/20 border-y-2 border-[#FFEE00]'
        };
      case 'high-contrast-white':
        return {
          container: 'bg-[#000000] text-[#FFFFFF]',
          activeSentence: 'bg-[#FFFFFF] text-[#000000] font-medium outline-2 outline-white',
          activeWord: 'bg-[#000000] text-[#FFFFFF] underline',
          originalPane: 'bg-[#0a0a0a] border-stone-800 text-stone-200',
          ruler: 'bg-white/15 border-y-2 border-white'
        };
      case 'sepia':
        return {
          container: 'bg-[#FBF7EE] text-[#3D2E1E]',
          activeSentence: 'bg-[#EBDDC3] text-[#2C1D10] font-medium outline-1 outline-[#CBB895]',
          activeWord: 'bg-[#3D2E1E] text-[#FBF7EE] px-0.5 rounded-xs',
          originalPane: 'bg-[#F2ECE0] border-[#DFD3BE] text-[#3D2E1E]',
          ruler: 'bg-[#CBB895]/25 border-y border-[#B09971]'
        };
      case 'soft-blue':
        return {
          container: 'bg-[#F0F6FA] text-[#1E3A5F]',
          activeSentence: 'bg-[#D6E8F6] text-[#0D2644] font-medium outline-1 outline-[#A7C8E8]',
          activeWord: 'bg-[#1E3A5F] text-[#F0F6FA] px-0.5 rounded-xs',
          originalPane: 'bg-[#E4F0F8] border-[#CCE2F2] text-[#1E3A5F]',
          ruler: 'bg-[#A7C8E8]/30 border-y border-[#7AAAD6]'
        };
      case 'slate-dark':
        return {
          container: 'bg-stone-900 text-stone-100',
          activeSentence: 'bg-stone-800 text-amber-300 font-medium outline-1 outline-amber-500/50',
          activeWord: 'bg-amber-400 text-stone-950 px-0.5 rounded-xs',
          originalPane: 'bg-stone-950 border-stone-800 text-stone-300',
          ruler: 'bg-amber-400/15 border-y border-amber-400/40'
        };
      default:
        // System light
        return {
          container: 'bg-stone-50 text-stone-900',
          activeSentence: 'bg-amber-100 text-stone-950 font-medium outline-1 outline-amber-400/60',
          activeWord: 'bg-amber-500 text-stone-950 px-0.5 rounded-xs',
          originalPane: 'bg-white border-stone-200 text-stone-800',
          ruler: 'bg-amber-400/20 border-y border-amber-400/60'
        };
    }
  };

  const themeStyle = getThemeStyles();

  const getFontFamilyStyle = () => {
    switch (preferences.fontFamily) {
      case 'lexend':
        return 'font-["Lexend",sans-serif]';
      case 'atkinson':
        return 'font-["Atkinson_Hyperlegible",sans-serif]';
      case 'jetbrains':
        return 'font-mono';
      case 'newsreader':
        return 'font-serif';
      default:
        return 'font-sans';
    }
  };

  const handleSentenceClick = (globalIdx: number) => {
    ttsEngine.prepare(document.rawText);
    ttsEngine.jumpToSentence(globalIdx);
    ttsEngine.play();
  };

  return (
    <div className={`min-h-[calc(100vh-170px)] transition-colors duration-200 ${themeStyle.container}`}>
      {/* Top Document Header & Metadata (No Pill discipline: clean typographic metadata) */}
      <div className="max-w-6xl mx-auto px-6 py-5 border-b border-current/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {document.name}
          </h1>
          <div className="flex items-center gap-2 text-xs opacity-75 mt-1.5 flex-wrap">
            <span>{document.documentType}</span>
            <span aria-hidden="true">·</span>
            <span>Image Quality: {document.imageQuality}</span>
            <span aria-hidden="true">·</span>
            <span>{document.wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span>~{document.estimatedReadingMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>OCR Confidence: {document.confidenceScore}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Plain language shortcut */}
          {onNavigateToPlainLanguage && (
            <button
              onClick={onNavigateToPlainLanguage}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-current/25 hover:bg-current/10 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>Plain Language Summary</span>
            </button>
          )}

          {/* Toggle original scan split view */}
          {(document.originalFileUrl || document.thumbnailUrl) && (
            <button
              onClick={() => setShowOriginalSplit(!showOriginalSplit)}
              aria-pressed={showOriginalSplit}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border border-current/25 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 ${
                showOriginalSplit ? 'bg-current/15' : 'hover:bg-current/10'
              }`}
            >
              <Columns className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showOriginalSplit ? 'Hide Original Scan' : 'Compare Original Scan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* OCR Warnings or challenges if any */}
      {document.errorNotes && document.errorNotes.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pt-3">
          <div className="text-xs opacity-80 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-current/5 border border-current/10">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />
            <span className="font-semibold">Extraction Notes:</span>
            <span>{document.errorNotes.join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Main Reading View Layout (Split View or Full View) */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className={`grid gap-8 ${showOriginalSplit ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Left pane: Original Scan preview if split view is open */}
          {showOriginalSplit && (
            <div className={`border rounded-xl p-4 shadow-sm h-[75vh] flex flex-col ${themeStyle.originalPane}`}>
              <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Original Document Scan
                </span>
                <span className="text-[11px] opacity-70">Ground Truth Reference</span>
              </div>
              <div className="flex-1 overflow-auto rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center p-2">
                <img
                  src={document.originalFileUrl || document.thumbnailUrl}
                  alt="Original scanned document page"
                  className="max-h-full max-w-full object-contain shadow-sm rounded-sm"
                />
              </div>
            </div>
          )}

          {/* Right/Main pane: Accessible Reading Canvas */}
          <div
            ref={readerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setRulerTop(null)}
            className={`relative rounded-xl p-6 md:p-10 transition-all ${getFontFamilyStyle()} ${
              showOriginalSplit ? 'h-[75vh] overflow-y-auto' : ''
            }`}
            style={{
              fontSize: `${preferences.fontSize}px`,
              lineHeight: preferences.lineHeight,
              letterSpacing: `${preferences.letterSpacing}px`,
              wordSpacing: `${preferences.wordSpacing}px`
            }}
          >
            {/* Reading Ruler Focus Guide (Follows mouse or sentence) */}
            {preferences.readingRuler && rulerTop !== null && (
              <div
                className={`absolute left-0 right-0 pointer-events-none transition-transform duration-75 ${themeStyle.ruler}`}
                style={{
                  top: `${rulerTop}px`,
                  height: `${preferences.fontSize * preferences.lineHeight * 1.3}px`,
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25)'
                }}
              />
            )}

            {/* Document Headings & Paragraphs */}
            <div className="space-y-6 select-text">
              {paragraphSentenceMap.length === 0 ? (
                <p className="opacity-60 italic text-center py-12">
                  No text extracted from this document yet.
                </p>
              ) : (
                paragraphSentenceMap.map((sentenceList, pIdx) => (
                  <p
                    key={pIdx}
                    className="relative transition-all"
                    style={{ marginBottom: `${preferences.paragraphSpacing || 24}px` }}
                  >
                    {sentenceList.map((sentObj) => {
                      const isCurrentSentence =
                        ttsState.isPlaying && ttsState.currentSentenceIdx === sentObj.globalIndex;

                      return (
                        <span
                          key={sentObj.globalIndex}
                          onClick={() => handleSentenceClick(sentObj.globalIndex)}
                          title="Click to read sentence aloud"
                          className={`cursor-pointer rounded-sm px-1 py-0.5 transition-colors duration-150 inline ${
                            isCurrentSentence ? themeStyle.activeSentence : 'hover:bg-current/10'
                          }`}
                        >
                          {/* If Bionic Reading enabled: format words */}
                          {preferences.bionicReading
                            ? sentObj.text.split(/(\s+)/).map((segment, segIdx) => {
                                if (/^\s+$/.test(segment)) {
                                  return segment;
                                }
                                const isWordActive =
                                  isCurrentSentence &&
                                  ttsState.currentWord &&
                                  segment.toLowerCase().includes(ttsState.currentWord.toLowerCase());

                                return (
                                  <span
                                    key={segIdx}
                                    className={isWordActive ? themeStyle.activeWord : ''}
                                  >
                                    {formatBionicWord(segment, segIdx)}
                                  </span>
                                );
                              })
                            : sentObj.text.split(/(\s+)/).map((segment, segIdx) => {
                                if (/^\s+$/.test(segment)) {
                                  return segment;
                                }
                                const isWordActive =
                                  isCurrentSentence &&
                                  ttsState.currentWord &&
                                  segment.toLowerCase().includes(ttsState.currentWord.toLowerCase());

                                return (
                                  <span
                                    key={segIdx}
                                    className={isWordActive ? themeStyle.activeWord : ''}
                                  >
                                    {segment}
                                  </span>
                                );
                              })}{' '}
                        </span>
                      );
                    })}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
