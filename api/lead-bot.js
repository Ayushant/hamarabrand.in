// Vercel Serverless Function — Hamara Brand Super AI Bot Lead Submission
// Receives structured lead data collected by the bot and forwards to Google Sheets

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycby2SuumH1jsCbaJzBk8Q543hBtLmQWgVxj8OMahdMlCtQLuGHJW4kvX_o6TXVD6oHFc/exec';

const SECRET_TOKEN = process.env.GOOGLE_SCRIPT_SECRET || 'hb-lead-secret-2026-change-me';

const ALLOWED_ORIGINS = [
  "https://hamarabrand.in",
  "https://www.hamarabrand.in",
  "https://hamarabrand.com",
  "https://www.hamarabrand.com",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || "";
  const isDev = !origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", isDev ? "*" : allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function sanitize(val, max = 500) {
  if (!val || typeof val !== 'string') return '';
  return val.trim().substring(0, max);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Build a flat submission from whatever fields the bot collected
  const leadData = {
    // Core identity
    name:        sanitize(body.name),
    company:     sanitize(body.company),
    designation: sanitize(body.designation),
    phone:       sanitize(body.phone, 20),
    email:       sanitize(body.email, 200),
    website:     sanitize(body.website, 300),
    industry:    sanitize(body.industry),

    // Intent
    botMode:     sanitize(body.botMode),    // 'buyer' | 'partner'
    service:     sanitize(body.service, 500),
    city:        sanitize(body.city, 300),
    budget:      sanitize(body.budget),
    duration:    sanitize(body.duration),
    objective:   sanitize(body.objective, 500),
    timeline:    sanitize(body.timeline),
    decisionMaker: sanitize(body.decisionMaker),

    // Partner-specific
    partnerType: sanitize(body.partnerType),
    category:    sanitize(body.category, 500),

    // Scoring
    leadScore:   sanitize(body.leadScore),

    // Extra collected answers (all as JSON string)
    extras:      sanitize(JSON.stringify(body.extras || {}), 2000),

    source: 'super-ai-bot',
    _token: SECRET_TOKEN,
  };

  // Require at minimum phone or email
  if (!leadData.phone && !leadData.email && !leadData.name) {
    return res.status(400).json({ error: 'Insufficient lead data.' });
  }

  // Build URLSearchParams
  const params = new URLSearchParams();
  // Map to the columns the existing Apps Script expects:
  // Timestamp | Name | Company | Phone | Service | City | Budget | Duration | Source
  params.append('name',     leadData.name || 'Bot Lead');
  params.append('company',  leadData.company || '');
  params.append('phone',    leadData.phone || leadData.email || '');
  params.append('service',  [leadData.botMode, leadData.service, leadData.category, leadData.objective].filter(Boolean).join(' | ').substring(0, 200));
  params.append('city',     leadData.city || '');
  params.append('budget',   leadData.budget || '');
  params.append('duration', leadData.duration || '');
  params.append('source',   leadData.source);
  params.append('_token',   SECRET_TOKEN);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    // Apps Script always returns 200, response is opaque anyway
    return res.status(200).json({ result: 'success', message: 'Lead submitted to Google Sheets.' });
  } catch (err) {
    console.error('[lead-bot] Google Sheets submission error:', err);
    // Still return 200 to bot — don't fail user experience
    return res.status(200).json({ result: 'queued', message: 'Lead logged.' });
  }
}
