import React from 'react';

/**
 * Text transformation helpers for Accessible Reading & Dyslexia support
 */

/**
 * Clean and normalize OCR output
 * Fixes hyphens split across lines, irregular whitespace, and orphaned punctuation
 */
export function cleanOCRText(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Remove soft hyphens and fix broken line wraps: "exam- ple" -> "example"
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      // Fix multiple blank lines
      .replace(/\n{3,}/g, '\n\n')
      // Replace tabs or irregular spacing
      .replace(/[ \t]{2,}/g, ' ')
      // Fix spacing before punctuation
      .replace(/\s+([.,;:!?])/g, '$1')
      .trim()
  );
}

/**
 * Split text into semantic paragraphs and clean whitespace
 */
export function extractParagraphs(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map(p => cleanOCRText(p))
    .filter(p => p.length > 0);
}

/**
 * Split a paragraph into distinct sentences
 */
export function splitSentences(paragraph: string): string[] {
  if (!paragraph) return [];
  // Match sentence terminators followed by whitespace and a capital/number
  const matches = paragraph.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  if (!matches) return [paragraph];
  return matches.map(s => s.trim()).filter(Boolean);
}

/**
 * Transform word for Bionic Reading:
 * Embolden initial 40-50% of the word
 */
export function formatBionicWord(word: string, key: string | number): React.ReactNode {
  // Strip trailing punctuation for calculation
  const match = word.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
  if (!match) return word;

  const [, prefix, core, suffix] = match;
  const len = core.length;
  if (len <= 1) {
    return React.createElement('span', { key }, word);
  }

  // Calculate fixation length: 1 -> 1, 2-3 -> 1, 4-6 -> 2-3, 7+ -> ~45%
  let fixLen = Math.ceil(len * 0.45);
  if (len === 2 || len === 3) fixLen = 1;

  const boldPart = core.substring(0, fixLen);
  const regularPart = core.substring(fixLen);

  return React.createElement(
    'span',
    { key, className: 'inline' },
    prefix,
    React.createElement('strong', { className: 'font-bold' }, boldPart),
    regularPart,
    suffix
  );
}

/**
 * Estimate reading time in minutes (dyslexia baseline ~120 wpm, standard ~200 wpm)
 */
export function calculateReadingTime(text: string, wpm = 130): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}
