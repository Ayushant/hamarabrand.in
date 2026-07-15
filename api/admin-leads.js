// Vercel Serverless Function — Admin lead reader backed by Google Sheets/Apps Script.

const GOOGLE_SCRIPT_URL = process.env.BOT_SHEET_URL || '';
const SECRET_TOKEN = process.env.GOOGLE_SCRIPT_SECRET || 'hb-lead-secret-2026-change-me';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'hb-admin-2026-change-me';

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  res.setHeader('Vary', 'Origin');
}

async function fetchSheetData(limit, offset) {
  const url = `${GOOGLE_SCRIPT_URL}?${new URLSearchParams({
    _token: SECRET_TOKEN,
    action: 'list',
    limit: String(limit),
    offset: String(offset),
  }).toString()}`;

  const response = await fetch(url, { redirect: 'follow' });
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

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ error: 'Sheet URL not configured.' });
  }

  const adminToken = req.headers['x-admin-token'] || req.query.token || '';
  if (ADMIN_TOKEN && adminToken !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = Math.min(Number(req.query.limit || 100), 500);
  const offset = Math.max(Number(req.query.offset || 0), 0);

  const { response, data } = await fetchSheetData(limit, offset);

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to load leads', details: data });
  }

  return res.status(200).json({ result: 'success', data });
}