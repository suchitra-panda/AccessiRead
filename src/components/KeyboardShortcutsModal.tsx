import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: 'Play / Pause speech playback' },
    { key: '[  /  ]', description: 'Jump to previous / next sentence' },
    { key: 'Escape', description: 'Stop speech synthesis completely' },
    { key: 'Alt + + / -', description: 'Increase / Decrease font size' },
    { key: 'Alt + T', description: 'Cycle through high-contrast themes' },
    { key: 'Alt + B', description: 'Toggle Bionic Reading fixation mode' },
    { key: 'Alt + R', description: 'Toggle Reading Ruler (line focus guide)' },
    { key: 'Tab / Shift+Tab', description: 'Accessible focus traversal' }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl max-w-md w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 id="shortcuts-title" className="text-lg font-semibold">
              Keyboard Accessibility Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-md focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 mb-4">
          All major reading and speech playback controls can be triggered directly from the keyboard without a mouse.
        </p>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60"
            >
              <span className="text-xs text-stone-700 dark:text-stone-300">{s.description}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-medium bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-stone-900 dark:text-stone-100 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-stone-950 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
