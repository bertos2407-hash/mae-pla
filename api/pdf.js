import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml({ text, subject, year, topic, curriculum, photos, dateStr }) {
  const curricLabel = curriculum === 'oxford'
    ? '📘 Oxford International Primary'
    : '📗 Cambridge Primary';

  // Parse text into semantic blocks
  const blocks = text.trim().split(/\n\n+/).map(block => {
    const t = block.trim();
    // Short line starting with an emoji = section heading
    const isHeading = t.split('\n').length === 1
      && t.length < 90
      && /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t);
    return { text: t, isHeading };
  });

  const contentHtml = blocks.map(({ text: t, isHeading }) => {
    const safe = escHtml(t).replace(/\n/g, '<br>');
    return isHeading
      ? `<div class="sec-head">${safe}</div>`
      : `<p class="body-para">${safe}</p>`;
  }).join('');

  // Photos
  const photosHtml = photos && photos.length > 0 ? `
    <div class="photos-block">
      <div class="block-label">📷 Worksheet Photos</div>
      <div class="photos-grid cnt-${Math.min(photos.length, 3)}">
        ${photos.map(p => `<div class="photo-card"><img src="data:${escHtml(p.type)};base64,${p.base64}"></div>`).join('')}
      </div>
    </div>` : '';

  const T = {
    topic:    escHtml(topic || subject),
    subject:  escHtml(subject),
    year:     escHtml(year),
    curric:   escHtml(curricLabel),
    date:     escHtml(dateStr),
  };

  const fishSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,50 36,37 36,63" fill="white"/>
    <ellipse cx="57" cy="50" rx="26" ry="17" fill="white"/>
    <ellipse cx="56" cy="57" rx="18" ry="8" fill="rgba(251,191,36,0.7)"/>
    <path d="M44,34 Q54,24 66,32" fill="none" stroke="rgba(251,191,36,0.9)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="72" cy="45" r="6" fill="rgba(234,88,12,0.25)"/>
    <circle cx="73" cy="45" r="3.5" fill="#7C2D12"/>
    <circle cx="74.5" cy="43.5" r="1.5" fill="white"/>
    <path d="M79,53 Q82,57 79,61" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
      background: white;
      color: #1C0A00;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ━━ HEADER ━━ */
    .hdr {
      background: linear-gradient(148deg,
        #4A1500 0%, #7C2D12 18%, #B83800 38%,
        #EA580C 62%, #F97316 80%, #FBBF24 100%);
      padding: 34px 50px 38px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    /* Dot-grid texture */
    .hdr-dots {
      position: absolute; inset: 0; pointer-events: none;
      background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
      background-size: 22px 22px;
    }
    /* Decorative rings */
    .hc { position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.10); pointer-events:none; }
    .hc1 { width:320px; height:320px; right:-80px; top:-90px; }
    .hc2 { width:220px; height:220px; right:70px;  bottom:-110px; }
    .hc3 { width:160px; height:160px; left:-55px;  bottom:-60px; }
    .hc4 { width:440px; height:440px; right:-130px;top:70px; border-color:rgba(255,255,255,0.05); }

    .brand-row {
      position: relative;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 30px;
    }
    .brand-left { display: flex; align-items: center; gap: 20px; }

    .fish-ring {
      width: 80px; height: 80px; border-radius: 50%;
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.35);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.30);
    }
    .fish-ring svg { width: 50px; height: 50px; }

    .app-name { font-size: 2.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
    .app-en   { font-size: 0.85rem; font-weight: 600; opacity: 0.78; margin-top: 5px; letter-spacing: 0.04em; }
    .app-sub  { font-size: 0.66rem; opacity: 0.55; margin-top: 2px; letter-spacing: 0.10em; text-transform: uppercase; }

    .school-badge {
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.26);
      border-radius: 32px;
      padding: 12px 24px;
      text-align: right;
      backdrop-filter: blur(4px);
    }
    .school-lbl  { font-size: 0.56rem; opacity: 0.62; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 5px; }
    .school-name { font-size: 0.92rem; font-weight: 700; }

    .topic-card {
      position: relative;
      background: rgba(255,255,255,0.14);
      border: 1.5px solid rgba(255,255,255,0.30);
      border-radius: 18px;
      padding: 22px 28px;
      backdrop-filter: blur(6px);
    }
    .topic-card::before {
      content: '';
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%; border-radius: 18px;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
      pointer-events: none;
    }
    .topic-lbl   { font-size: 0.58rem; font-weight: 800; opacity: 0.62; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 10px; }
    .topic-title { font-size: 1.5rem; font-weight: 800; line-height: 1.3; margin-bottom: 16px; }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .tag {
      background: rgba(255,255,255,0.22);
      border: 1.5px solid rgba(255,255,255,0.36);
      border-radius: 30px;
      padding: 5px 18px;
      font-size: 0.78rem; font-weight: 700;
    }

    /* ━━ WAVE ━━ */
    .wave-bar { height: 5px; background: linear-gradient(90deg, #FED7AA, #F97316, #FBBF24, #F97316, #FED7AA); }

    /* ━━ CONTENT AREA ━━ */
    .content-wrap { padding: 32px 50px; background: #FFFDF9; }

    .block-label {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.64rem; font-weight: 800;
      color: #92400E; text-transform: uppercase; letter-spacing: 0.13em;
      margin-bottom: 16px;
    }
    .block-label::before {
      content: '';
      display: inline-block;
      width: 4px; height: 20px;
      background: linear-gradient(180deg, #F97316, #FBBF24);
      border-radius: 4px; flex-shrink: 0;
    }

    /* ━━ PHOTOS ━━ */
    .photos-block { margin-bottom: 28px; page-break-inside: avoid; break-inside: avoid; }
    .photos-grid  { display: flex; gap: 14px; flex-wrap: wrap; }
    .photo-card {
      flex: 1; border-radius: 14px; overflow: hidden;
      border: 2px solid #FED7AA;
      box-shadow: 0 4px 18px rgba(249,115,22,0.13);
    }
    .photo-card img { width: 100%; max-height: 260px; object-fit: cover; display: block; }
    .cnt-1 .photo-card { max-width: 400px; }

    /* ━━ CONTENT CARD ━━ */
    .content-card {
      background: white;
      border: 1.5px solid #FED7AA;
      border-radius: 20px;
      padding: 30px 34px;
      box-shadow: 0 8px 34px rgba(249,115,22,0.08), 0 1px 4px rgba(0,0,0,0.04);
      position: relative;
    }
    .content-card::before {
      content: '';
      position: absolute; top: 0; left: 0;
      width: 100%; height: 4px;
      background: linear-gradient(90deg, #C2410C, #F97316, #FBBF24, transparent);
      border-radius: 20px 20px 0 0;
    }

    /* ━━ TYPOGRAPHY ━━ */
    .sec-head {
      font-size: 0.97rem; font-weight: 800;
      color: #9A3412;
      margin: 22px 0 10px;
      padding: 9px 16px;
      background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
      border-left: 4px solid #F97316;
      border-radius: 0 10px 10px 0;
      page-break-after: avoid; break-after: avoid;
    }
    .sec-head:first-child { margin-top: 0; }

    .body-para {
      font-size: 1rem; line-height: 2.05;
      color: #1C0A00; letter-spacing: 0.01em;
      margin-bottom: 0.9em;
      page-break-inside: avoid; break-inside: avoid;
      orphans: 3; widows: 3;
    }
    .body-para:last-child { margin-bottom: 0; }
  </style>
</head>
<body>

  <!-- PREMIUM HEADER -->
  <div class="hdr">
    <div class="hdr-dots"></div>
    <div class="hc hc1"></div>
    <div class="hc hc2"></div>
    <div class="hc hc3"></div>
    <div class="hc hc4"></div>

    <div class="brand-row">
      <div class="brand-left">
        <div class="fish-ring">${fishSvg}</div>
        <div>
          <div class="app-name">แม่ปลา</div>
          <div class="app-en">Mae Pla</div>
          <div class="app-sub">Homework Helper for Parents</div>
        </div>
      </div>
      <div class="school-badge">
        <div class="school-lbl">School</div>
        <div class="school-name">Hastin International School</div>
      </div>
    </div>

    <div class="topic-card">
      <div class="topic-lbl">📚 Homework Topic</div>
      <div class="topic-title">${T.topic}</div>
      <div class="tags">
        <span class="tag">${T.subject}</span>
        <span class="tag">${T.year}</span>
        <span class="tag">${T.curric}</span>
        <span class="tag">📅 ${T.date}</span>
      </div>
    </div>
  </div>

  <div class="wave-bar"></div>

  <div class="content-wrap">
    ${photosHtml}
    <div class="block-label">LINE OA Post</div>
    <div class="content-card">
      ${contentHtml}
    </div>
  </div>

</body>
</html>`;
}

// Puppeteer footer template (inline styles only — separate rendering context)
const footerTpl = `<div style="
  width:100%; height:100%;
  display:flex; justify-content:space-between; align-items:center;
  padding:0 50px;
  font-family:'Noto Sans Thai',Arial,sans-serif;
  font-size:9px; color:#92400E;
  border-top:2px solid #FED7AA;
  background:linear-gradient(135deg,#FFF7ED,#FFFBF7);
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
">
  <span style="font-weight:700;">แม่ปลา · Mae Pla</span>
  <span style="color:#C4A882;">Hastin International School</span>
  <span style="font-weight:600;color:#B45309;">
    หน้า <span class="pageNumber"></span> / <span class="totalPages"></span>
  </span>
</div>`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const {
    text, subject = '', year = '', topic = '',
    language = 'thai', curriculum = 'oxford',
    photos = [], dateStr,
  } = body;

  if (!text) return res.status(400).json({ error: 'text is required' });

  const resolvedDate = dateStr
    || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = buildHtml({ text, subject, year, topic, language, curriculum, photos, dateStr: resolvedDate });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '16mm', left: '0mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: footerTpl,
    });

    await browser.close();
    browser = null;

    const safe = (topic || subject || 'post')
      .replace(/[^a-z0-9\u0E00-\u0E7F\s]/gi, '')
      .trim().replace(/\s+/g, '-')
      .slice(0, 40) || 'maepla';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="maepla-${safe}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).end(Buffer.from(pdfBuffer));

  } catch (err) {
    console.error('[pdf] generation error:', err);
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return res.status(500).json({ error: 'PDF generation failed', detail: err.message });
  }
}
