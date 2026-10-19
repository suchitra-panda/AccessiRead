import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Upload,
  BarChart2,
  Sparkles,
  Keyboard,
  Volume2,
  Sliders,
  Check
} from 'lucide-react';
import { ttsEngine, TTSState } from '../utils/ttsEngine';

interface Props {
  activeSection: 'reader' | 'upload' | 'eval' | 'plain';
  onSelectSection: (section: 'reader' | 'upload' | 'eval' | 'plain') => void;
  onOpenShortcuts: () => void;
  documentTitle?: string;
}

export const Header: React.FC<Props> = ({
  activeSection,
  onSelectSection,
  onOpenShortcuts,
  documentTitle
}) => {
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentSentenceIdx: 0,
    currentWordIdx: 0,
    currentWord: '',
    charIndex: 0
  });

  useEffect(() => {
    const unsub = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsub();
  }, []);

  const navItems: { id: 'reader' | 'upload' | 'eval' | 'plain'; label: string; icon: React.ReactNode }[] = [
    { id: 'reader', label: 'Accessible Reader', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload & Preprocess', icon: <Upload className="w-4 h-4" /> },
    { id: 'eval', label: 'Evaluation & Research Lab', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'plain', label: 'Plain Language & Q&A', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity (Domain-native, no pill badges) */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shadow-xs">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                AccessiRead AI
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
                Assistive Document Understanding
              </span>
            </div>
            {documentTitle && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 truncate max-w-[260px]">
                Active: {documentTitle}
              </div>
            )}
          </div>
        </div>

        {/* Primary Interactive Segmented Navigation (Buttons allowed per zero-pill rules) */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 transition-all ${
                activeSection === item.id
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <span className={activeSection === item.id ? 'text-amber-500' : 'opacity-70'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Action icons & speech indicator */}
        <div className="flex items-center gap-2">
          {/* Live audio indicator if reading */}
          {ttsState.isPlaying && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Audio Active</span>
            </div>
          )}

          {/* Accessible Keyboard shortcuts trigger */}
          <button
            onClick={onOpenShortcuts}
            title="View keyboard shortcuts (or press ?)"
            aria-label="Keyboard shortcuts"
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700/70 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
