// Vercel Serverless Function — Hamara Brand Super AI Bot Lead Submission
// Receives structured lead data from the chatbot and stores it in Supabase.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://luulgqiqrlrvehwofqqt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'bot_leads';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'hb-admin-2026-change-me';

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

function setJsonHeaders(res) {
  res.setHeader('Content-Type', 'application/json');
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { response, data };
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  setJsonHeaders(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Require at minimum a name or phone
  if (!sanitize(body.name) && !sanitize(body.phone)) {
    return res.status(400).json({ error: 'Insufficient lead data — name or phone required.' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[lead-bot] SUPABASE_SERVICE_ROLE_KEY env var not set.');
    return res.status(200).json({ result: 'error', message: 'Supabase service role key not configured.' });
  }

  const leadData = {
    bot_mode: sanitize(body.botMode || 'buyer', 20),
    name: sanitize(body.name, 120),
    company: sanitize(body.company, 120),
    phone: sanitize(body.phone, 20),
    email: sanitize(body.email, 200),
    city: sanitize(body.city, 100),
    budget: sanitize(body.budget, 100),
    service: sanitize(body.service || body.category, 200),
    objective: sanitize(body.objective || body.goal, 200),
    source: sanitize(body.source || 'super-ai-bot', 80),
    extras: body.extras && typeof body.extras === 'object' ? body.extras : {},
  };

  try {
    console.log('[lead-bot] Submitting to Supabase. Name:', body.name, '| Mode:', body.botMode);

    const { response, data } = await supabaseRequest(`/rest/v1/${SUPABASE_TABLE}`, {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify([leadData]),
    });

    if (!response.ok) {
      console.error('[lead-bot] Supabase insert error:', response.status, JSON.stringify(data));
      return res.status(200).json({ result: 'error', message: 'Supabase insert failed.', details: data });
    }

    console.log('[lead-bot] Supabase insert success:', response.status);
    return res.status(200).json({ result: 'success', record: Array.isArray(data) ? data[0] : data });
  } catch (err) {
    console.error('[lead-bot] Submission error:', err.message || err);
    return res.status(200).json({ result: 'error', message: err.message });
  }
}
