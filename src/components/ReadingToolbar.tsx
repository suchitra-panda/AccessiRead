import React from 'react';
import {
  Type,
  Sun,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  RotateCcw,
  AlignLeft
} from 'lucide-react';
import { FontFamilyChoice, ReadingPreferences, ThemeMode } from '../types';

interface Props {
  preferences: ReadingPreferences;
  onUpdatePreferences: (updates: Partial<ReadingPreferences>) => void;
  onResetDefaults: () => void;
}

export const ReadingToolbar: React.FC<Props> = ({
  preferences,
  onUpdatePreferences,
  onResetDefaults
}) => {
  const themes: { id: ThemeMode; label: string; previewClass: string }[] = [
    { id: 'system', label: 'Default Light', previewClass: 'bg-white border-stone-300 text-stone-900' },
    { id: 'yellow-black', label: 'Yellow on Black (AAA)', previewClass: 'bg-black border-yellow-400 text-yellow-400 font-bold' },
    { id: 'high-contrast-white', label: 'Pure Black / White', previewClass: 'bg-black border-stone-100 text-white' },
    { id: 'sepia', label: 'Soft Sepia', previewClass: 'bg-[#F4ECD8] border-[#D4C3A3] text-[#3D2E1E]' },
    { id: 'soft-blue', label: 'Soft Blue (Irlen)', previewClass: 'bg-[#EBF4FA] border-[#B8D5E5] text-[#1E3A5F]' },
    { id: 'slate-dark', label: 'Slate Dark', previewClass: 'bg-slate-900 border-slate-700 text-slate-100' }
  ];

  const fonts: { id: FontFamilyChoice; label: string; family: string }[] = [
    { id: 'lexend', label: 'Lexend (Dyslexia-tested)', family: 'font-lexend' },
    { id: 'atkinson', label: 'Atkinson (Braille Inst.)', family: 'font-atkinson' },
    { id: 'jetbrains', label: 'Mono (Disambiguated)', family: 'font-mono' },
    { id: 'newsreader', label: 'Newsreader (Serif)', family: 'font-serif' },
    { id: 'sans', label: 'Clean Sans', family: 'font-sans' }
  ];

  return (
    <div
      role="toolbar"
      aria-label="Accessible Reading Customization Controls"
      className="bg-white/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 px-4 py-2.5 backdrop-blur-xs text-stone-800 dark:text-stone-200"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Contrast Themes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1 mr-1">
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            Theme:
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onUpdatePreferences({ theme: t.id })}
                className={`px-2 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-all ${t.previewClass} ${
                  preferences.theme === t.id
                    ? 'ring-2 ring-amber-500 shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={`Set theme to ${t.label}`}
                aria-pressed={preferences.theme === t.id}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-current shrink-0" />
                <span className="text-[11px]">{t.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Type className="w-3.5 h-3.5" aria-hidden="true" />
            Font:
          </span>
          <select
            value={preferences.fontFamily}
            onChange={(e) => onUpdatePreferences({ fontFamily: e.target.value as FontFamilyChoice })}
            aria-label="Select accessible typeface"
            className="text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {fonts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Spacing Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
            <button
              onClick={() => onUpdatePreferences({ fontSize: Math.max(14, preferences.fontSize - 2) })}
              title="Decrease text size (Alt -)"
              aria-label="Decrease text size"
              className="p-1 hover:text-amber-600 rounded-md focus-visible:ring-1 focus-visible:ring-amber-500"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium px-1 min-w-[32px] text-center">
              {preferences.fontSize}px
            </span>
            <button
              onClick={() => onUpdatePreferences({ fontSize: Math.min(36, preferences.fontSize + 2) })}
              title="Increase text size (Alt +)"
              aria-label="Increase text size"
              className="p-1 hover:text-amber-600 rounded-md focus-visible:ring-1 focus-visible:ring-amber-500"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Height */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
            <span className="text-[11px] text-stone-500 dark:text-stone-400">Line:</span>
            <select
              value={preferences.lineHeight}
              onChange={(e) => onUpdatePreferences({ lineHeight: parseFloat(e.target.value) })}
              aria-label="Line spacing"
              className="text-xs bg-transparent border-none p-0 focus:ring-0 font-mono"
            >
              <option value="1.4">1.4x</option>
              <option value="1.6">1.6x</option>
              <option value="1.8">1.8x</option>
              <option value="2.0">2.0x</option>
              <option value="2.3">2.3x</option>
            </select>
          </div>

          {/* Letter Spacing */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
            <span className="text-[11px] text-stone-500 dark:text-stone-400">Letter:</span>
            <select
              value={preferences.letterSpacing}
              onChange={(e) => onUpdatePreferences({ letterSpacing: parseFloat(e.target.value) })}
              aria-label="Letter spacing"
              className="text-xs bg-transparent border-none p-0 focus:ring-0 font-mono"
            >
              <option value="0">0px</option>
              <option value="1">1px</option>
              <option value="2">2px</option>
              <option value="3">3px</option>
            </select>
          </div>
        </div>

        {/* Assistive Modifiers */}
        <div className="flex items-center gap-2">
          {/* Bionic Reading toggle */}
          <button
            onClick={() => onUpdatePreferences({ bionicReading: !preferences.bionicReading })}
            aria-pressed={preferences.bionicReading}
            title="Bionic Reading bolds the initial letters of words to guide eye fixations"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              preferences.bionicReading
                ? 'bg-amber-500 border-amber-600 text-stone-950 font-semibold shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              <strong>Bio</strong>nic
            </span>
          </button>

          {/* Reading Ruler toggle */}
          <button
            onClick={() => onUpdatePreferences({ readingRuler: !preferences.readingRuler })}
            aria-pressed={preferences.readingRuler}
            title="Reading ruler: focus guide bar that reduces visual crowding"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              preferences.readingRuler
                ? 'bg-amber-500 border-amber-600 text-stone-950 font-semibold shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ruler Guide</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetDefaults}
            title="Reset typography to defaults"
            aria-label="Reset to defaults"
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg focus-visible:ring-1 focus-visible:ring-amber-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
