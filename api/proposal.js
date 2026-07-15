// Vercel Serverless Function — Hamara Brand Custom Proposal Form Submission
// Receives structured proposal data from the website form and forwards to Google Sheets (ProposalLeads tab).

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

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

function sanitize(val, max) {
  max = max || 300;
  if (!val || typeof val !== 'string') return '';
  return val.trim().substring(0, max);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Require at minimum a name and phone
  if (!sanitize(body.name) || !sanitize(body.phone)) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error('[proposal] GOOGLE_SCRIPT_URL env var not set.');
    return res.status(200).json({ result: 'error', message: 'Sheet URL not configured.' });
  }

  // Map to the ProposalLeads tab columns:
  // Timestamp | Source | Name | Company | Phone | City | Service | Budget | Duration | LeadScore
  const params = new URLSearchParams({
    _tab:     'proposal',
    source:   'website-proposal-form',
    name:     sanitize(body.name, 120),
    company:  sanitize(body.company, 120),
    phone:    sanitize(body.phone, 20),
    city:     sanitize(body.city, 100),
    service:  sanitize(body.service || body.category, 200),
    budget:   sanitize(body.budget, 100),
    duration: sanitize(body.duration, 100),
  });

  try {
    console.log('[proposal] Submitting to Google Sheet. Name:', body.name, '| Phone:', body.phone);

    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();
    console.log('[proposal] Sheet response:', response.status, text.substring(0, 500));
    return res.status(200).json({ result: 'success', sheetStatus: response.status });
  } catch (err) {
    console.error('[proposal] Submission error:', err.message || err);
    return res.status(200).json({ result: 'error', message: err.message });
  }
}
