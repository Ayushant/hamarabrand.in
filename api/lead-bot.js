// Vercel Serverless Function — Hamara Brand Super AI Bot Lead Submission
// Receives structured lead data from the chatbot and forwards to the dedicated Google Sheet.

const GOOGLE_SCRIPT_URL = process.env.BOT_SHEET_URL || '';  // separate from main form's GOOGLE_SCRIPT_URL
const SECRET_TOKEN      = process.env.GOOGLE_SCRIPT_SECRET || 'hb-lead-secret-2026-change-me';

const ALLOWED_ORIGINS = [
  "https://hamarabrand.in",
  "https://www.hamarabrand.in",
  "https://hamarabrand.com",
  "https://www.hamarabrand.com",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || "";
  const isDev  = !origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin",  isDev ? "*" : allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function sanitize(val, max = 300) {
  if (!val || typeof val !== 'string') return '';
  return val.trim().substring(0, max);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Require at minimum a name or phone
  if (!sanitize(body.name) && !sanitize(body.phone)) {
    return res.status(400).json({ error: 'Insufficient lead data — name or phone required.' });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error('[lead-bot] GOOGLE_SCRIPT_URL env var not set.');
    return res.status(200).json({ result: 'error', message: 'Sheet URL not configured.' });
  }

  // Map to the Apps Script columns:
  // Timestamp | Mode | Name | Company | Phone | Email | City | Budget | Service | Goal | Source | LeadScore
  const params = new URLSearchParams({
    _token:   SECRET_TOKEN,
    botMode:  sanitize(body.botMode || 'buyer', 20),
    name:     sanitize(body.name, 120),
    company:  sanitize(body.company, 120),
    phone:    sanitize(body.phone, 20),
    email:    sanitize(body.email, 200),
    city:     sanitize(body.city, 100),
    budget:   sanitize(body.budget, 100),
    service:  sanitize(body.service || body.category, 200),
    objective: sanitize(body.objective || body.goal, 200),
  });

  try {
    console.log('[lead-bot] Posting to Google Sheet. Name:', body.name, '| Mode:', body.botMode);
    console.log('[lead-bot] URL:', GOOGLE_SCRIPT_URL);

    // Google Apps Script returns 302 redirect. Default fetch follows it as GET (loses POST body).
    // Use redirect:'manual' and follow ourselves with POST to preserve the body.
    let response = await fetch(GOOGLE_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
      redirect: 'manual',
    });

    // Follow the redirect with POST if needed
    if (response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get('location');
      console.log('[lead-bot] Following redirect to:', redirectUrl);
      response = await fetch(redirectUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString(),
        redirect: 'follow',
      });
    }

    const text = await response.text();
    console.log('[lead-bot] Sheet response:', response.status, text.substring(0, 500));
    return res.status(200).json({ result: 'success', sheetStatus: response.status, sheetBody: text.substring(0, 300) });
  } catch (err) {
    console.error('[lead-bot] Submission error:', err.message || err);
    return res.status(200).json({ result: 'error', message: err.message });
  }
}
