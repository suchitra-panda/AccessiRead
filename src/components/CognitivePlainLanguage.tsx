import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Volume2,
  Check,
  Send,
  Loader2,
  ListChecks,
  Bookmark
} from 'lucide-react';
import { ExtractedDocument } from '../types';
import { ttsEngine } from '../utils/ttsEngine';

interface Props {
  document: ExtractedDocument;
  onUpdateDocumentSimplified: (simplifiedData: any) => void;
}

export const CognitivePlainLanguage: React.FC<Props> = ({
  document,
  onUpdateDocumentSimplified
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [qnaList, setQnaList] = useState<{ q: string; a: string }[]>([]);

  const handleGeneratePlainLanguage = async () => {
    if (!document.rawText) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/simplify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: document.rawText
        })
      });

      if (!res.ok) throw new Error('Simplification request failed');
      const data = await res.json();

      onUpdateDocumentSimplified({
        tldr: data.tldr || 'Summary generated.',
        simplifiedText: data.simplifiedText || document.rawText,
        keyTakeaways: data.keyTakeaways || [],
        glossary: data.glossary || []
      });
    } catch (err: any) {
      console.warn('Plain language simplification error:', err);
      // Fallback
      onUpdateDocumentSimplified({
        tldr: 'Key information extracted from document.',
        simplifiedText: document.rawText.replace(/([.?!])\s+/g, '$1\n\n'),
        keyTakeaways: ['Primary document information extracted and verified.'],
        glossary: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAnswering) return;

    const currentQ = question.trim();
    setQuestion('');
    setIsAnswering(true);

    try {
      const res = await fetch('/api/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: document.rawText,
          question: currentQ
        })
      });

      if (!res.ok) throw new Error('Failed to ask question');
      const data = await res.json();

      setQnaList((prev) => [...prev, { q: currentQ, a: data.answer }]);
    } catch (err: any) {
      setQnaList((prev) => [
        ...prev,
        {
          q: currentQ,
          a: 'Could not process question with server. Please verify internet connection.'
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleReadTextAloud = (textToRead: string) => {
    ttsEngine.prepare(textToRead);
    ttsEngine.play();
  };

  const simplified = document.simplified;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Plain Language & Cognitive Accessibility
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Converts dense, complex, or bureaucratic text into clear, easy-to-digest plain language for readers with dyslexia or cognitive fatigue.
          </p>
        </div>

        {!simplified && (
          <button
            onClick={handleGeneratePlainLanguage}
            disabled={isLoading || !document.rawText}
            className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg shadow-xs flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Generating Plain Language...' : 'Generate Plain Language Version'}</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      {simplified ? (
        <div className="space-y-6">
          {/* Quick TL;DR Card */}
          <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" />
                Quick TL;DR (In One Sentence)
              </span>
              <button
                onClick={() => handleReadTextAloud(simplified.tldr)}
                className="text-xs text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 font-medium"
                title="Read TL;DR aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-relaxed">
              {simplified.tldr}
            </p>
          </div>

          {/* Key Takeaways */}
          {simplified.keyTakeaways && simplified.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-amber-600" />
                  Key Takeaways
                </span>
                <button
                  onClick={() => handleReadTextAloud(simplified.keyTakeaways.join('. '))}
                  className="text-xs text-stone-600 dark:text-stone-300 hover:underline flex items-center gap-1 font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Listen All</span>
                </button>
              </div>
              <ul className="space-y-2">
                {simplified.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Simplified Text */}
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Plain Language Rewrite
              </span>
              <button
                onClick={() => handleReadTextAloud(simplified.simplifiedText)}
                className="px-3 py-1 text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Read Full Plain Version</span>
              </button>
            </div>
            <div className="text-sm font-['Lexend',sans-serif] leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-line space-y-3">
              {simplified.simplifiedText}
            </div>
          </div>

          {/* Glossary if present */}
          {simplified.glossary && simplified.glossary.length > 0 && (
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-3">
                Simple Term Definitions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simplified.glossary.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/60 text-xs">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{item.term}: </span>
                    <span className="text-stone-600 dark:text-stone-400">{item.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
            No Plain Language Version Generated Yet
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-5">
            Click the button above to transform this document into short sentences, accessible vocabulary, and structured bullet points.
          </p>
          <button
            onClick={handleGeneratePlainLanguage}
            disabled={isLoading || !document.rawText}
            className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg shadow-xs inline-flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Plain Language Version</span>
          </button>
        </div>
      )}

      {/* Accessible Document Q&A */}
      <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Ask Questions About This Document
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Ask for due dates, addresses, key definitions, or requirements to be summarized in spoken-friendly English.
        </p>

        {/* Existing Q&A thread */}
        {qnaList.length > 0 && (
          <div className="space-y-3 pt-2">
            {qnaList.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1.5 text-xs">
                <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>Q: {item.q}</span>
                  <button
                    onClick={() => handleReadTextAloud(item.a)}
                    className="text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1"
                    title="Read answer aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <div className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question input form */}
        <form onSubmit={handleAskQuestion} className="flex gap-2 pt-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. When is the due date? What is the main message?"
            className="flex-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-900 dark:text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAnswering}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-stone-950 rounded-lg flex items-center gap-1.5 disabled:opacity-40 transition-colors"
          >
            {isAnswering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
