# AccessiRead AI

**An Accessible Document Understanding and Text-to-Speech System for Users with Reading Difficulties**

AccessiRead AI is an assistive web app that makes documents easier to read. It extracts text from PDFs and images, shows it in a reading view you can adapt to your needs, reads it aloud with word-by-word highlighting, rewrites it in plain language, and includes a lab for measuring text-extraction accuracy.

> This is an assistive reading tool, not a medical diagnostic system. AI output can contain mistakes, so check important details against the original document.

**Live demo:** https://accessiread-ai-accessible-document-understanding.ai.studio

<!-- Add a screenshot: save it as docs/screenshot.png, then replace this comment with: ![AccessiRead AI screenshot](docs/screenshot.png) -->

## Features

### Document input and extraction
- Upload PDF, PNG, JPG or WEBP files.
- PDFs: embedded text is extracted in the browser with PDF.js (first 10 pages), and page previews are rendered.
- Images: text is extracted with the Gemini multimodal model through the app's server.
- **In-browser image preprocessing** before extraction, using the HTML canvas: grayscale, brightness, contrast, binarization with an adjustable threshold, one-click automatic Otsu threshold, invert, and deskew rotation.

### Accessible reader
- Six colour themes, including yellow on black and high-contrast white, plus sepia, soft blue and slate dark.
- Five fonts: Lexend, Atkinson, a disambiguated monospace font, Newsreader (serif) and a clean sans-serif.
- Adjustable font size (14 to 36 px), line height, letter spacing and word spacing.
- Bionic reading mode and a reading ruler to keep your place.
- Keyboard shortcuts for reading and speech controls (press the shortcuts button in the app):

| Key | Action |
|---|---|
| Space | Play or pause speech |
| `[` and `]` | Previous or next sentence |
| Escape | Stop speech |
| Alt + `+` / `-` | Increase or decrease font size |
| Alt + T | Cycle themes |
| Alt + B | Toggle bionic reading |
| Alt + R | Toggle reading ruler |

### Text-to-speech
- Uses the browser's Web Speech API, so it runs on the user's device.
- Reads sentence by sentence with the current word tracked, and supports play, pause, resume, stop, next and previous sentence.
- Voice choice, speed, pitch and volume controls.

### Plain-language support
- Rewrites text in plain language with a short summary (TL;DR), key takeaways and a glossary of hard terms.
- Ask a question about the document and get an answer based on its text.

### Evaluation Lab
- Character Error Rate (CER) and Word Error Rate (WER) calculated with a Levenshtein algorithm that reports substitutions, deletions and insertions.
- Six benchmark documents (digital PDF, scanned PDF, small font, degraded scan, skewed document, form/table).
- Side-by-side character differences for inspecting errors, and CSV export with the columns: document ID, type, image quality, preprocessing, reference text, extracted text, S, D, I, CER, WER, time and error notes.

> **Important:** the Evaluation Lab's initial table is **illustrative demo data**, not measurements. The starting values and timings are hard-coded and the "extracted" text is produced by scripted edits of the reference text. The "run live benchmark" action calls the real extraction endpoint, but if a request fails it falls back to the reference text and records a 0% error rate. Do not quote numbers from the Lab as results. Run real tests and record them in [docs/TESTING.md](docs/TESTING.md).

## How it works

```
Browser (React + Vite + Tailwind)
  - PDF.js text extraction
  - Canvas image preprocessing
  - Web Speech API text-to-speech
        |  JSON requests (images sent as base64)
        v
Express server (TypeScript, server.ts)
        |
        v
Google Gemini API (@google/genai)
```

The Gemini API key stays on the server and is never sent to the browser.

### API endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/ocr-analyze` | Extract text and structure from an image or PDF |
| `POST /api/simplify-text` | Plain-language rewrite with summary, key points and glossary |
| `POST /api/ask-document` | Answer a question about supplied document text |

## Tech stack

TypeScript, React 19, Vite, Tailwind CSS, Express, `@google/genai` (Gemini API), `pdfjs-dist`, Web Speech API, `motion`, `lucide-react`.

## Run locally

Requirements: Node.js 20 or newer (or Bun) and a Gemini API key from [Google AI Studio](https://aistudio.google.com/).

```bash
git clone https://github.com/suchitra-panda/AccessiRead.git
cd AccessiRead
npm install                 # or: bun install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `.env` and set your own key:

```
GEMINI_API_KEY="your-key-here"
```

Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
|---|---|
| `npm run dev` / `npm start` | Start the Express server with the Vite dev middleware |
| `npm run build` | Build the frontend into `dist/` |
| `npm run lint` | Type-check with TypeScript |

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API key. Never commit your real key. |
| `PORT` | Server port (default 3000) |
| `NODE_ENV` | Set to `production` to serve the built files from `dist/` |

## Privacy

Images and text you submit for extraction, simplification or questions are sent to the Gemini API. Do not upload sensitive or confidential documents unless you are comfortable with that. Text-to-speech runs in your browser.

## Testing

Manual test results are recorded in [docs/TESTING.md](docs/TESTING.md). There are no automated tests yet, and accuracy has not been formally measured on a real test set.

## Limitations

- **Placeholder responses:** if the API key is missing or invalid, or a Gemini request fails or takes longer than 12 seconds, the server returns a simple placeholder response instead of a real result. Make sure your key is set when testing.
- **Evaluation Lab data is simulated** as described above.
- **Extraction is done by an AI model,** so it can make mistakes on blurry, skewed or low-resolution pages and in complex layouts, and results may vary between runs.
- **PDF limits:** only the first 10 pages are processed in the browser.
- **Text limits:** simplification uses the first 6,000 characters and document Q&A uses the first 8,000 characters. CER and WER evaluation compares at most the first 6,000 characters.
- **Speech:** voices, pause support and word highlighting depend on the browser and the chosen voice.
- **No authentication or rate limiting** on the API endpoints, so do not expose a public deployment that uses a paid key.
- **File checks:** the server trusts the file type sent by the browser and accepts request bodies up to 50 MB.
- The PDF.js worker is loaded from a CDN, so PDF reading needs an internet connection.

## Roadmap

- Replace the simulated Evaluation Lab data with real measurements on a documented test set
- Show a clear on-screen notice whenever a placeholder response is used
- Compare Gemini extraction with a conventional OCR engine such as Tesseract
- Automated tests
- Authentication and rate limiting

## License

MIT. See [LICENSE](LICENSE).
