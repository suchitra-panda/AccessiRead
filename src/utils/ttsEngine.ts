/**
 * AccessiRead Speech Synthesis Engine
 * Provides synchronized bimodal text-to-speech with word and sentence tracking
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIdx: number;
  currentWordIdx: number;
  currentWord: string;
  charIndex: number;
}

export type TTSEventListener = (state: TTSState) => void;

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private sentences: string[] = [];
  private currentSentenceIdx = 0;
  private currentWordIdx = 0;
  private isPlaying = false;
  private isPaused = false;
  private listeners: Set<TTSEventListener> = new Set();
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private rate = 1.0;
  private pitch = 1.0;
  private volume = 1.0;
  private fullText = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  private loadVoices() {
    if (!this.synth) return;
    const available = this.synth.getVoices();
    if (available && available.length > 0) {
      this.voices = available;
      // Default to an English voice, preferably Google or Natural
      const natural = available.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Premium')));
      const english = available.find(v => v.lang.startsWith('en'));
      this.selectedVoice = natural || english || available[0];
    }
  }

  public setVoice(voiceURI: string) {
    const v = this.voices.find(voice => voice.voiceURI === voiceURI);
    if (v) this.selectedVoice = v;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.5, rate));
    if (this.isPlaying && !this.isPaused) {
      // Restart current sentence at new speed
      this.speakSentence(this.currentSentenceIdx);
    }
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1.0, volume));
  }

  public subscribe(fn: TTSEventListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(word = '', charIndex = 0) {
    const state: TTSState = {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSentenceIdx: this.currentSentenceIdx,
      currentWordIdx: this.currentWordIdx,
      currentWord: word,
      charIndex
    };
    this.listeners.forEach(fn => fn(state));
  }

  public prepare(text: string) {
    this.stop();
    this.fullText = text;
    // Split text into coherent sentences for clean chunked reading
    this.sentences = this.splitIntoSentences(text);
    this.currentSentenceIdx = 0;
    this.currentWordIdx = 0;
    this.notify();
  }

  public splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // Match sentences ending in punctuation or line breaks
    const raw = text.replace(/([.?!])\s+(?=[A-Z0-9])/g, '$1|SPLIT|');
    return raw
      .split('|SPLIT|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  public play() {
    if (!this.synth) return;

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.notify();
      return;
    }

    if (this.sentences.length === 0 && this.fullText) {
      this.prepare(this.fullText);
    }

    if (this.sentences.length === 0) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.speakSentence(this.currentSentenceIdx);
  }

  public pause() {
    if (!this.synth) return;
    this.synth.pause();
    this.isPaused = true;
    this.isPlaying = false;
    this.notify();
  }

  public resume() {
    if (!this.synth) return;
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.notify();
    } else {
      this.play();
    }
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.notify();
  }

  public jumpToSentence(idx: number) {
    if (idx < 0 || idx >= this.sentences.length) return;
    this.currentSentenceIdx = idx;
    this.currentWordIdx = 0;
    if (this.isPlaying) {
      this.speakSentence(idx);
    } else {
      this.notify();
    }
  }

  public nextSentence() {
    if (this.currentSentenceIdx + 1 < this.sentences.length) {
      this.jumpToSentence(this.currentSentenceIdx + 1);
    } else {
      this.stop();
    }
  }

  public previousSentence() {
    if (this.currentSentenceIdx > 0) {
      this.jumpToSentence(this.currentSentenceIdx - 1);
    }
  }

  private speakSentence(idx: number) {
    if (!this.synth || idx >= this.sentences.length) {
      this.stop();
      return;
    }

    this.synth.cancel();

    const sentence = this.sentences[idx];
    const utterance = new SpeechSynthesisUtterance(sentence);
    this.utterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const textFromChar = sentence.substring(event.charIndex);
        const match = textFromChar.match(/^(\S+)/);
        const word = match ? match[1] : '';
        this.notify(word, event.charIndex);
      }
    };

    utterance.onend = () => {
      if (!this.isPlaying) return;
      if (this.currentSentenceIdx + 1 < this.sentences.length) {
        this.currentSentenceIdx++;
        this.speakSentence(this.currentSentenceIdx);
      } else {
        this.stop();
      }
    };

    utterance.onerror = (err) => {
      // Canceled utterances fire error 'canceled', ignore
      if (err.error !== 'canceled') {
        console.warn('TTS Speech error:', err);
      }
      this.notify();
    };

    this.currentSentenceIdx = idx;
    this.notify('', 0);
    this.synth.speak(utterance);
  }
}

export const ttsEngine = new TTSService();
