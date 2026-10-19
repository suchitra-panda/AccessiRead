import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use cdnjs worker matching version or fallback
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface PDFExtractionResult {
  text: string;
  pages: { pageNumber: number; text: string; imageUrl?: string }[];
  pageCount: number;
  hasEmbeddedText: boolean;
  firstPageImageUrl: string;
}

/**
 * Extract digital text and render page snapshots from uploaded PDF ArrayBuffer
 */
export async function extractPDFContent(arrayBuffer: ArrayBuffer): Promise<PDFExtractionResult> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const pages: { pageNumber: number; text: string; imageUrl?: string }[] = [];
  let fullText = '';
  let firstPageImageUrl = '';

  for (let i = 1; i <= Math.min(pageCount, 10); i++) {
    const page = await pdf.getPage(i);

    // Extract text content
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.length > 0);

    const pageText = pageStrings.join(' ');
    fullText += (fullText ? '\n\n' : '') + pageText;

    // Render page to canvas to get image preview
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    let imageUrl = '';
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport } as any).promise;
      imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (i === 1) {
        firstPageImageUrl = imageUrl;
      }
    }

    pages.push({
      pageNumber: i,
      text: pageText,
      imageUrl
    });
  }

  // Check if meaningful embedded text was present
  const totalExtractedChars = fullText.replace(/\s/g, '').length;
  const hasEmbeddedText = totalExtractedChars > 80;

  return {
    text: fullText,
    pages,
    pageCount,
    hasEmbeddedText,
    firstPageImageUrl
  };
}
