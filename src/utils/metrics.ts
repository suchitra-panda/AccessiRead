/**
 * Levenshtein distance & Error Rate calculations for OCR Evaluation
 * Formulas:
 * CER = (Substitutions + Deletions + Insertions) / Total Reference Characters
 * WER = (Substitutions + Deletions + Insertions) / Total Reference Words
 */

export interface ErrorBreakdown {
  substitutions: number;
  deletions: number;
  insertions: number;
  referenceLength: number;
  errorRate: number; // between 0 and 1 (or > 1 if massive insertions)
  percentage: string;
}

export interface DiffToken {
  type: 'equal' | 'substitute' | 'delete' | 'insert';
  refChar?: string;
  hypChar?: string;
}

/**
 * Compute Character-level Levenshtein matrix and error breakdown
 */
export function calculateCER(reference: string, hypothesis: string): ErrorBreakdown {
  const ref = reference.trim();
  const hyp = hypothesis.trim();

  if (ref.length === 0) {
    return {
      substitutions: 0,
      deletions: 0,
      insertions: hyp.length,
      referenceLength: 0,
      errorRate: hyp.length > 0 ? 1 : 0,
      percentage: hyp.length > 0 ? '100.0%' : '0.0%'
    };
  }

  const n = ref.length;
  const m = hyp.length;

  // Use flat typed arrays or 2D array for DP
  // To keep memory safe for long documents, cap evaluation at 10,000 characters or chunk
  const maxEvalLen = 6000;
  const rSlice = ref.slice(0, maxEvalLen);
  const hSlice = hyp.slice(0, maxEvalLen);
  const rLen = rSlice.length;
  const hLen = hSlice.length;

  // dp[i][j] stores { cost, S, D, I }
  // We can track costs with Wagner-Fischer algorithm
  const dp: number[][] = Array.from({ length: rLen + 1 }, () => new Uint32Array(hLen + 1) as any);

  for (let i = 0; i <= rLen; i++) dp[i][0] = i;
  for (let j = 0; j <= hLen; j++) dp[0][j] = j;

  for (let i = 1; i <= rLen; i++) {
    const rc = rSlice[i - 1];
    for (let j = 1; j <= hLen; j++) {
      const hc = hSlice[j - 1];
      if (rc === hc) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const sub = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        dp[i][j] = Math.min(sub, del, ins);
      }
    }
  }

  // Backtrack to count S, D, I
  let i = rLen;
  let j = hLen;
  let S = 0;
  let D = 0;
  let I = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && rSlice[i - 1] === hSlice[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      S++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      D++;
      i--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      I++;
      j--;
    } else {
      if (i > 0) { D++; i--; }
      else if (j > 0) { I++; j--; }
    }
  }

  const totalErrors = S + D + I;
  const cer = totalErrors / rLen;

  return {
    substitutions: S,
    deletions: D,
    insertions: I,
    referenceLength: rLen,
    errorRate: cer,
    percentage: `${(cer * 100).toFixed(2)}%`
  };
}

/**
 * Compute Word Error Rate (WER)
 */
export function calculateWER(reference: string, hypothesis: string): ErrorBreakdown {
  const refWords = reference.trim().split(/\s+/).filter(Boolean);
  const hypWords = hypothesis.trim().split(/\s+/).filter(Boolean);

  if (refWords.length === 0) {
    return {
      substitutions: 0,
      deletions: 0,
      insertions: hypWords.length,
      referenceLength: 0,
      errorRate: hypWords.length > 0 ? 1 : 0,
      percentage: hypWords.length > 0 ? '100.0%' : '0.0%'
    };
  }

  const n = refWords.length;
  const m = hypWords.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1) as any);
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refWords[i - 1].toLowerCase() === hypWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const sub = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        dp[i][j] = Math.min(sub, del, ins);
      }
    }
  }

  let i = n;
  let j = m;
  let S = 0;
  let D = 0;
  let I = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refWords[i - 1].toLowerCase() === hypWords[j - 1].toLowerCase()) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      S++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      D++;
      i--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      I++;
      j--;
    } else {
      if (i > 0) { D++; i--; }
      else if (j > 0) { I++; j--; }
    }
  }

  const totalErrors = S + D + I;
  const wer = totalErrors / n;

  return {
    substitutions: S,
    deletions: D,
    insertions: I,
    referenceLength: n,
    errorRate: wer,
    percentage: `${(wer * 100).toFixed(2)}%`
  };
}

/**
 * Generate side-by-side or inline character diff visualization
 */
export function generateCharacterDiff(reference: string, hypothesis: string): DiffToken[] {
  const r = reference.slice(0, 500);
  const h = hypothesis.slice(0, 500);
  const diffs: DiffToken[] = [];

  const n = r.length;
  const m = h.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1) as any);

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (r[i - 1] === h[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const reversed: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && r[i - 1] === h[j - 1]) {
      reversed.push({ type: 'equal', refChar: r[i - 1], hypChar: h[j - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      reversed.push({ type: 'substitute', refChar: r[i - 1], hypChar: h[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      reversed.push({ type: 'delete', refChar: r[i - 1] });
      i--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      reversed.push({ type: 'insert', hypChar: h[j - 1] });
      j--;
    } else {
      if (i > 0) { reversed.push({ type: 'delete', refChar: r[i - 1] }); i--; }
      else if (j > 0) { reversed.push({ type: 'insert', hypChar: h[j - 1] }); j--; }
    }
  }

  return reversed.reverse();
}

/**
 * Generate CSV export according to research blueprint:
 * Document ID, Document type, Image quality, Reference text, Extracted text, Character error rate, Processing time, Error notes
 */
export function exportToCSV(records: any[]): string {
  const headers = [
    'Document ID',
    'Document type',
    'Image quality',
    'Preprocessing',
    'Reference text',
    'Extracted text',
    'Substitutions (S)',
    'Deletions (D)',
    'Insertions (I)',
    'Character error rate (CER)',
    'Word error rate (WER)',
    'Processing time (s)',
    'Error notes'
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map(r => [
    escapeCSV(r.documentId),
    escapeCSV(r.documentType),
    escapeCSV(r.imageQuality),
    escapeCSV(r.preprocessingMode || 'None'),
    escapeCSV(r.referenceText),
    escapeCSV(r.extractedText),
    r.substitutions ?? 0,
    r.deletions ?? 0,
    r.insertions ?? 0,
    escapeCSV(typeof r.cer === 'number' ? `${(r.cer * 100).toFixed(2)}%` : r.cer),
    escapeCSV(typeof r.wer === 'number' ? `${(r.wer * 100).toFixed(2)}%` : r.wer),
    ((r.processingTimeMs || 0) / 1000).toFixed(2),
    escapeCSV(r.errorNotes || '')
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
