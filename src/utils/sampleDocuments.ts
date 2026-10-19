import { BenchmarkDocument } from '../types';

function createDocumentSvgDataUrl(
  title: string,
  subtitle: string,
  lines: string[],
  options: {
    bg?: string;
    textColor?: string;
    font?: string;
    skew?: number;
    blur?: number;
    faded?: boolean;
    columns?: number;
  } = {}
): string {
  const {
    bg = '#FAFAFA',
    textColor = '#1F2937',
    font = 'serif',
    skew = 0,
    blur = 0,
    faded = false,
    columns = 1
  } = options;

  const width = 800;
  const height = 1050;

  let contentSvg = '';
  const yStart = 160;
  const lineHeight = 26;

  if (columns === 1) {
    lines.forEach((line, idx) => {
      const y = yStart + idx * lineHeight;
      if (y < height - 60) {
        contentSvg += `<text x="60" y="${y}" font-family="${font}" font-size="15" fill="${textColor}" opacity="${faded ? 0.65 : 0.95}">${escapeXml(line)}</text>`;
      }
    });
  } else {
    // 2 columns
    const half = Math.ceil(lines.length / 2);
    lines.slice(0, half).forEach((line, idx) => {
      const y = yStart + idx * lineHeight;
      if (y < height - 60) {
        contentSvg += `<text x="60" y="${y}" font-family="${font}" font-size="13" fill="${textColor}" opacity="${faded ? 0.65 : 0.95}">${escapeXml(line)}</text>`;
      }
    });
    lines.slice(half).forEach((line, idx) => {
      const y = yStart + idx * lineHeight;
      if (y < height - 60) {
        contentSvg += `<text x="430" y="${y}" font-family="${font}" font-size="13" fill="${textColor}" opacity="${faded ? 0.65 : 0.95}">${escapeXml(line)}</text>`;
      }
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      ${blur > 0 ? `<filter id="blurFilter"><feGaussianBlur stdDeviation="${blur}" /></filter>` : ''}
      <filter id="paperTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="1" result="light">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
        <feBlend mode="multiply" in="SourceGraphic" in2="light" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${bg}" />
    <g transform="rotate(${skew} ${width / 2} ${height / 2})" ${blur > 0 ? 'filter="url(#blurFilter)"' : ''}>
      <!-- Header -->
      <line x1="60" y1="50" x2="740" y2="50" stroke="#CBD5E1" stroke-width="1.5" />
      <text x="60" y="85" font-family="${font}" font-size="22" font-weight="bold" fill="${textColor}">${escapeXml(title)}</text>
      <text x="60" y="115" font-family="${font}" font-size="13" fill="${textColor}" opacity="0.7">${escapeXml(subtitle)}</text>
      <line x1="60" y1="135" x2="740" y2="135" stroke="#E2E8F0" stroke-width="1" />
      <!-- Content -->
      ${contentSvg}
      <!-- Footer -->
      <line x1="60" y1="990" x2="740" y2="990" stroke="#E2E8F0" stroke-width="1" />
      <text x="60" y="1015" font-family="${font}" font-size="11" fill="${textColor}" opacity="0.6">AccessiRead Benchmark Test Suite · Ground Truth Verified</text>
      <text x="700" y="1015" font-family="${font}" font-size="11" fill="${textColor}" opacity="0.6">Page 1</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const BENCHMARK_DOCUMENTS: BenchmarkDocument[] = [
  {
    id: 'DOC001',
    title: 'Universal Declaration of Human Rights (Article 1-3)',
    category: 'Digital Public Document',
    documentType: 'Digital PDF',
    imageQuality: 'Clear',
    description: 'High-contrast, cleanly typeset digital document with standard serif typography and clear paragraph breaks.',
    previewImageUrl: createDocumentSvgDataUrl(
      'Universal Declaration of Human Rights',
      'Adopted by the United Nations General Assembly · Resolution 217 A',
      [
        'Article 1',
        'All human beings are born free and equal in dignity and rights.',
        'They are endowed with reason and conscience and should act towards',
        'one another in a spirit of brotherhood.',
        '',
        'Article 2',
        'Everyone is entitled to all the rights and freedoms set forth in this',
        'Declaration, without distinction of any kind, such as race, colour,',
        'sex, language, religion, political or other opinion, national or social',
        'origin, property, birth or other status.',
        '',
        'Article 3',
        'Everyone has the right to life, liberty and security of person.',
        '',
        'Article 4',
        'No one shall be held in slavery or servitude; slavery and the slave',
        'trade shall be prohibited in all their forms.'
      ],
      { bg: '#FFFFFF', font: 'Newsreader, Georgia, serif' }
    ),
    referenceText: `Article 1
All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.

Article 2
Everyone is entitled to all the rights and freedoms set forth in this Declaration, without distinction of any kind, such as race, colour, sex, language, religion, political or other opinion, national or social origin, property, birth or other status.

Article 3
Everyone has the right to life, liberty and security of person.

Article 4
No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.`,
    expectedChallenges: [
      'Preserving numbered article headers',
      'Accurate punctuation and semicolon detection'
    ]
  },
  {
    id: 'DOC002',
    title: 'Public Health Guidance: Accessible Health Information',
    category: 'Government Notification',
    documentType: 'Scanned PDF',
    imageQuality: 'Moderate',
    description: 'Two-column scanned government circular with headings, bullet points, and departmental metadata.',
    previewImageUrl: createDocumentSvgDataUrl(
      'Department of Health & Human Services',
      'Notice of Non-Discrimination and Language Access Requirements',
      [
        'Section 1: General Purpose',
        'This advisory reminds covered entities of their',
        'obligation to provide timely and effective auxiliary',
        'aids and accessible digital formats.',
        '',
        'Section 2: Minimum Standards',
        '1. Information must be readable by assistive tech.',
        '2. Electronic documents must provide true text layers.',
        '3. Scanned images must include accurate transcripts.',
        '',
        'Section 3: Compliance Deadlines',
        'All regional agencies must achieve compliance within',
        'ninety calendar days of this notice issuance.',
        'Technical assistance webinars are scheduled weekly.',
        'Questions may be submitted to accessibility@agency.gov.'
      ],
      { bg: '#F8FAFC', textColor: '#0F172A', font: 'Lexend, sans-serif', columns: 2 }
    ),
    referenceText: `Department of Health & Human Services
Notice of Non-Discrimination and Language Access Requirements

Section 1: General Purpose
This advisory reminds covered entities of their obligation to provide timely and effective auxiliary aids and accessible digital formats.

Section 2: Minimum Standards
1. Information must be readable by assistive tech.
2. Electronic documents must provide true text layers.
3. Scanned images must include accurate transcripts.

Section 3: Compliance Deadlines
All regional agencies must achieve compliance within ninety calendar days of this notice issuance. Technical assistance webinars are scheduled weekly. Questions may be submitted to accessibility@agency.gov.`,
    expectedChallenges: [
      'Two-column reading flow without interleaving',
      'Numbered list detection and email address retention'
    ]
  },
  {
    id: 'DOC003',
    title: 'Cognitive Science Research Abstract on Dyslexia',
    category: 'Academic Paper',
    documentType: 'Small Font Print',
    imageQuality: 'Clear',
    description: 'Dense 9-point typography with Latin terminology, scientific abbreviations, and statistical citations.',
    previewImageUrl: createDocumentSvgDataUrl(
      'Journal of Assistive Technologies and Cognition',
      'Peer-Reviewed Empirical Study · Vol. 14, Issue 2',
      [
        'Abstract: Evaluating Font Modifications on Reading Speed',
        'We investigated the effect of specialized typeface design,',
        'letter spacing (+0.25em), and line height (1.8) on phonological',
        'decoding accuracy among n=64 adult participants diagnosed with',
        'developmental dyslexia. Results demonstrated a statistically',
        'significant reduction in fixation regressions (F(1, 62) = 8.42,',
        'p < 0.01) and an average reading velocity increase of 14.2 words',
        'per minute. High-contrast color inversion further mitigated visual',
        'crowding effects across complex multi-syllabic vocabulary.',
        '',
        'Index Terms: Dyslexia, Visual Crowding, Assistive Typography,',
        'Phonological Processing, Screen Readers, Text-to-Speech.'
      ],
      { bg: '#FFFDF9', textColor: '#1C1917', font: 'Newsreader, Georgia, serif' }
    ),
    referenceText: `Journal of Assistive Technologies and Cognition
Peer-Reviewed Empirical Study · Vol. 14, Issue 2

Abstract: Evaluating Font Modifications on Reading Speed
We investigated the effect of specialized typeface design, letter spacing (+0.25em), and line height (1.8) on phonological decoding accuracy among n=64 adult participants diagnosed with developmental dyslexia. Results demonstrated a statistically significant reduction in fixation regressions (F(1, 62) = 8.42, p < 0.01) and an average reading velocity increase of 14.2 words per minute. High-contrast color inversion further mitigated visual crowding effects across complex multi-syllabic vocabulary.

Index Terms: Dyslexia, Visual Crowding, Assistive Typography, Phonological Processing, Screen Readers, Text-to-Speech.`,
    expectedChallenges: [
      'Dense 9pt font glyph recognition',
      'Statistical formulas: F(1, 62) = 8.42, p < 0.01',
      'Accurate hyphenation resolution across line breaks'
    ]
  },
  {
    id: 'DOC004',
    title: 'Historical Archive Dispatch (Low Contrast & Aging)',
    category: 'Degraded Scan',
    documentType: 'Degraded Scan',
    imageQuality: 'Degraded / Low-Contrast',
    description: 'Faded gray ink on parchment tone with slight grain, simulating aged photocopies or poor scans.',
    previewImageUrl: createDocumentSvgDataUrl(
      'Township Historical Society Records',
      'Preservation Archive · Box 12, Folio 4 (Circa 1948)',
      [
        'Memorandum on Public Library Construction',
        'The committee met on Tuesday afternoon to consider the proposed',
        'branch building on Elm Street. All members agreed that natural',
        'illumination and ground-level entrance ways were essential for the',
        'comfort of elderly patrons and disabled veterans.',
        '',
        'The architect presented sketches providing wide corridors, resting',
        'alcoves, and unobstructed aisles between the stacks.',
        '',
        'Resolved: That five thousand dollars be authorized for immediate',
        'foundation excavation prior to the winter frost.'
      ],
      { bg: '#F5EEDB', textColor: '#524B40', font: 'Courier New, monospace', faded: true }
    ),
    referenceText: `Township Historical Society Records
Preservation Archive · Box 12, Folio 4 (Circa 1948)

Memorandum on Public Library Construction
The committee met on Tuesday afternoon to consider the proposed branch building on Elm Street. All members agreed that natural illumination and ground-level entrance ways were essential for the comfort of elderly patrons and disabled veterans.

The architect presented sketches providing wide corridors, resting alcoves, and unobstructed aisles between the stacks.

Resolved: That five thousand dollars be authorized for immediate foundation excavation prior to the winter frost.`,
    expectedChallenges: [
      'Low contrast ratio (fails standard thresholding without preprocessing)',
      'Faint monospace glyphs (e/o confusion, l/1 confusion)',
      'Shows significant accuracy improvement with Binarization + Contrast'
    ]
  },
  {
    id: 'DOC005',
    title: 'Utility Service Statement (Skewed 4° Angle)',
    category: 'Skewed Document',
    documentType: 'Skewed Document',
    imageQuality: 'Noisy / Skewed',
    description: 'Document digitized with a 4-degree tilt and slight edge shadow, challenging standard horizontal scanlines.',
    previewImageUrl: createDocumentSvgDataUrl(
      'Metropolitan Water & Utility Authority',
      'Monthly Account Billing & Conservation Statement',
      [
        'Account Number: 8492-3021-99',
        'Service Period: September 1 to September 30',
        'Due Date: October 25',
        '',
        'Summary of Charges:',
        'Base Facility Fee: $24.50',
        'Volumetric Water Consumption (14.2 CCF): $58.20',
        'Stormwater Infrastructure Surcharge: $6.15',
        'Total Amount Due: $88.85',
        '',
        'Important Notice:',
        'Auto-pay customers will be debited on the scheduled due date.',
        'For payment assistance programs, dial 311 or visit our portal.'
      ],
      { bg: '#FAF8F5', textColor: '#1E293B', font: 'Newsreader, serif', skew: 3.5 }
    ),
    referenceText: `Metropolitan Water & Utility Authority
Monthly Account Billing & Conservation Statement

Account Number: 8492-3021-99
Service Period: September 1 to September 30
Due Date: October 25

Summary of Charges:
Base Facility Fee: $24.50
Volumetric Water Consumption (14.2 CCF): $58.20
Stormwater Infrastructure Surcharge: $6.15
Total Amount Due: $88.85

Important Notice:
Auto-pay customers will be debited on the scheduled due date. For payment assistance programs, dial 311 or visit our portal.`,
    expectedChallenges: [
      'Non-horizontal baseline causing character segmentation shear',
      'Dollar amounts and decimal points ($88.85 vs 8885)',
      'Demonstrates value of Deskew angle correction'
    ]
  },
  {
    id: 'DOC006',
    title: 'Assistive Reading Guide: Plain Language Rules',
    category: 'Educational Guide',
    documentType: 'Form / Table',
    imageQuality: 'Clear',
    description: 'Structured informational guide outlining WCAG 2.2 accessibility principles for dyslexic readers.',
    previewImageUrl: createDocumentSvgDataUrl(
      'W3C Cognitive and Learning Disabilities (COGA)',
      'Design Guidelines for Readable and Accessible Digital Content',
      [
        'Principle 1: Clear Structure and Navigation',
        '- Use descriptive headings that explain what the section is about.',
        '- Provide a short summary or bullet points at the beginning.',
        '- Keep paragraphs under 70 words to prevent reader fatigue.',
        '',
        'Principle 2: Typographic Clarity',
        '- Avoid fully justified text; left-aligned text prevents river illusions.',
        '- Use line spacing between 1.5 and 2.0 times the font size.',
        '- Allow user-customizable color palettes and contrast themes.',
        '',
        'Principle 3: Multimodal Reinforcement',
        '- Synchronize audio text-to-speech with visual word highlighting.',
        '- Let users adjust speech velocity between 0.75x and 1.5x.'
      ],
      { bg: '#FFFFFF', textColor: '#111827', font: 'Lexend, sans-serif' }
    ),
    referenceText: `W3C Cognitive and Learning Disabilities (COGA)
Design Guidelines for Readable and Accessible Digital Content

Principle 1: Clear Structure and Navigation
- Use descriptive headings that explain what the section is about.
- Provide a short summary or bullet points at the beginning.
- Keep paragraphs under 70 words to prevent reader fatigue.

Principle 2: Typographic Clarity
- Avoid fully justified text; left-aligned text prevents river illusions.
- Use line spacing between 1.5 and 2.0 times the font size.
- Allow user-customizable color palettes and contrast themes.

Principle 3: Multimodal Reinforcement
- Synchronize audio text-to-speech with visual word highlighting.
- Let users adjust speech velocity between 0.75x and 1.5x.`,
    expectedChallenges: [
      'Bullet point symbol retention',
      'Numeric version notations (WCAG 2.2)',
      'Line-wrapped list item coherence'
    ]
  }
];
