// Vercel Serverless Function — Admin lead reader backed by Supabase.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://luulgqiqrlrvehwofqqt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'bot_leads';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'hb-admin-2026-change-me';

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  res.setHeader('Vary', 'Origin');
}

async function supabaseRequest(path) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
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

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase service role key not configured.' });
  }

  const adminToken = req.headers['x-admin-token'] || req.query.token || '';
  if (ADMIN_TOKEN && adminToken !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = Math.min(Number(req.query.limit || 100), 500);
  const offset = Math.max(Number(req.query.offset || 0), 0);

  const { response, data } = await supabaseRequest(`/rest/v1/${SUPABASE_TABLE}?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to load leads', details: data });
  }

  return res.status(200).json({ result: 'success', data });
}