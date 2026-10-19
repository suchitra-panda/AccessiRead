# Manual testing log

Fill this in yourself while using the app. Record what really happened, including failures. Do not copy numbers from the Evaluation Lab's initial table: those are illustrative demo values, not measurements.

**Tester:** 
**Date:** 
**Setup:** (live demo or local, browser and version, `GEMINI_API_KEY` set? yes/no)

## How to measure extraction accuracy honestly

1. Pick a document and type out its text yourself as the reference (or use a document whose exact text you know).
2. Extract it in the app and copy the output **without editing it**.
3. Compare reference and output. You can load them into the Evaluation Lab's metrics, or count the errors by hand on a short passage, and record CER and WER.
4. Repeat with different preprocessing settings (none, grayscale, Otsu threshold, deskew) on the **same** documents.
5. Because the extraction uses an AI model, run each document more than once and note whether results change.
6. Confirm that the app shows a real result and not a placeholder (see Limitations in the README).

## 1. Text extraction

Use 8 to 10 documents.

| # | Document (type) | Quality | Preprocessing | CER | WER | Time (s) | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Printed text PDF | Clear | | | | | |
| 2 | Photo of a printed page | Clear | | | | | |
| 3 | Photo of a printed page | Blurry | | | | | |
| 4 | Small font page | Clear | | | | | |
| 5 | Page photographed at an angle | Skewed | | | | | |
| 6 | Two-column document | Clear | | | | | |
| 7 | Low-light photo | Dark | | | | | |
| 8 | Multi-page PDF | Clear | | | | | |

## 2. Does preprocessing help?

Use the same documents for every row. Report cases where it made results worse.

| Document | No preprocessing (CER) | Grayscale (CER) | Otsu threshold (CER) | Deskew (CER) |
|---|---|---|---|---|
| | | | | |

## 3. Plain language and questions

| # | Document | Is the simplified text correct? | Did the question get a correct answer? | Notes |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## 4. Reader and speech

| Check | Pass / Fail | Notes |
|---|---|---|
| Text size, line height and spacing can be changed | | |
| Each theme is readable | | |
| Dyslexia-friendly fonts load | | |
| Text-to-speech plays | | |
| Pause and resume work | | |
| Word highlighting follows the speech | | |
| Keyboard shortcuts work (Space, `[`, `]`, Escape, Alt+T, Alt+B, Alt+R) | | |
| All controls reachable with Tab only | | |
| Works at 200% browser zoom | | |
| Screen reader announces controls (NVDA, VoiceOver or TalkBack) | | |

## 5. Failure cases

| Situation | What happened | Did the app show a clear message? |
|---|---|---|
| No API key set | | |
| Unsupported file type | | |
| Very large file | | |
| Blank page | | |
| PDF with more than 10 pages | | |

## 6. Summary

- Documents tested: 
- Worked well: 
- Main problems: 
- Planned fixes: 
