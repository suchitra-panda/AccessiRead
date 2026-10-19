import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Gauge } from 'lucide-react';
import { ttsEngine, TTSState } from '../utils/ttsEngine';

interface Props {
  fullText: string;
  totalSentences: number;
}

export const SpeechController: React.FC<Props> = ({ fullText, totalSentences }) => {
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentSentenceIdx: 0,
    currentWordIdx: 0,
    currentWord: '',
    charIndex: 0
  });

  const [rate, setRate] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [showVoiceSelect, setShowVoiceSelect] = useState<boolean>(false);

  useEffect(() => {
    const unsub = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });

    const availVoices = ttsEngine.getVoices();
    setVoices(availVoices);
    if (availVoices.length > 0 && !selectedVoiceUri) {
      setSelectedVoiceUri(availVoices[0].voiceURI);
    }

    return () => {
      unsub();
      ttsEngine.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (ttsState.isPlaying) {
      ttsEngine.pause();
    } else if (ttsState.isPaused) {
      ttsEngine.resume();
    } else {
      ttsEngine.prepare(fullText);
      ttsEngine.play();
    }
  };

  const handleStop = () => {
    ttsEngine.stop();
  };

  const handlePrev = () => {
    ttsEngine.previousSentence();
  };

  const handleNext = () => {
    ttsEngine.nextSentence();
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    ttsEngine.setRate(newRate);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceUri(uri);
    ttsEngine.setVoice(uri);
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div
      role="region"
      aria-label="Text-to-speech audio player"
      className="border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-3 sticky bottom-0 z-30 shadow-lg"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Playback status information */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>{ttsState.isPlaying ? 'Reading Aloud' : ttsState.isPaused ? 'Paused' : 'Speech Ready'}</span>
              {totalSentences > 0 && (
                <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                  Sentence {ttsState.currentSentenceIdx + 1} of {totalSentences}
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[280px]">
              {ttsState.currentWord ? (
                <span>
                  Current word:{' '}
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    "{ttsState.currentWord}"
                  </span>
                </span>
              ) : (
                'Press Space to play or click any sentence to listen'
              )}
            </div>
          </div>
        </div>

        {/* Primary Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={ttsState.currentSentenceIdx <= 0}
            title="Previous sentence ([)"
            aria-label="Previous sentence"
            className="p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            title={ttsState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={ttsState.isPlaying ? 'Pause speech' : 'Play speech'}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium rounded-lg flex items-center gap-2 shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            {ttsState.isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span className="text-xs font-semibold">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span className="text-xs font-semibold">Read Aloud</span>
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!ttsState.isPlaying && !ttsState.isPaused}
            title="Stop speech (Esc)"
            aria-label="Stop speech"
            className="p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Square className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={ttsState.currentSentenceIdx >= totalSentences - 1}
            title="Next sentence (])"
            aria-label="Next sentence"
            className="p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed presets and voice settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 px-1 font-mono uppercase flex items-center gap-0.5">
              <Gauge className="w-3 h-3" />
            </span>
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleRateChange(s)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  rate === s
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                aria-label={`Speech rate ${s} times`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Voice selector dropdown */}
          {voices.length > 0 && (
            <div className="relative">
              <select
                value={selectedVoiceUri}
                onChange={(e) => handleVoiceChange(e.target.value)}
                aria-label="Select voice"
                className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 max-w-[150px] truncate focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader live notification */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ttsState.isPlaying
          ? `Reading sentence ${ttsState.currentSentenceIdx + 1} of ${totalSentences}`
          : ttsState.isPaused
          ? 'Playback paused'
          : 'Playback stopped'}
      </div>
    </div>
  );
};
