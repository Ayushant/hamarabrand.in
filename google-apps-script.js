/**
 * HAMARA BRAND — AI Chatbot Lead Collection Script
 *
 * SETUP (fresh Google Sheet):
 * 1. Create a NEW Google Sheet (e.g. "HB Bot Leads")
 * 2. Extensions > Apps Script > paste this file > Save
 * 3. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL
 * 5. In Vercel > Settings > Environment Variables, add:
 *    - GOOGLE_SCRIPT_URL  = <paste Web App URL here>
 *    - GOOGLE_SCRIPT_SECRET = hb-lead-secret-2026-change-me
 * 6. Redeploy on Vercel
 *
 * The script auto-creates a "BotLeads" tab on first run.
 * Columns: Timestamp | Mode | Name | Company | Phone | Email | City | Budget | Service | Goal | Source | LeadScore
 */

const SECRET   = 'hb-lead-secret-2026-change-me';
const TAB_NAME = 'BotLeads';

const HEADERS = [
  'Timestamp', 'Mode', 'Name', 'Company', 'Phone', 'Email',
  'City', 'Budget', 'Service/Category', 'Goal/Objective', 'Source', 'Lead Score'
];

function doPost(e) {
  try {
    // ── Auth ──
    const token = (e.parameter._token || '').trim();
    if (token !== SECRET) {
      return jsonResp(403, { result: 'error', error: 'Forbidden' });
    }

    const p = e.parameter;

    // ── Get or create BotLeads tab ──
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(TAB_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(TAB_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
           .setFontWeight('bold')
           .setBackground('#1a4d2e')
           .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // ── Score the lead ──
    const budget = (p.budget || '').toLowerCase();
    let score = 'COLD';
    if (budget.includes('1cr') || budget.includes('25l') || budget.includes('5')) score = 'HOT';
    else if (budget.includes('5l') || budget.includes('25') || budget.includes('3') || budget.includes('4')) score = 'WARM';

    // ── Append row ──
    sheet.appendRow([
      new Date(),
      sanitize(p.botMode   || p.mode || 'buyer', 20),
      sanitize(p.name      || '', 120),
      sanitize(p.company   || '', 120),
      sanitize(p.phone     || '', 20),
      sanitize(p.email     || '', 200),
      sanitize(p.city      || '', 100),
      sanitize(p.budget    || '', 100),
      sanitize(p.service   || p.category || '', 200),
      sanitize(p.objective || p.goal     || '', 200),
      'super-ai-bot',
      score
    ]);

    return jsonResp(200, { result: 'success', score });

  } catch (err) {
    console.error('doPost error:', err);
    return jsonResp(500, { result: 'error', error: err.message });
  }
}

function sanitize(val, max) {
  if (!val || typeof val !== 'string') return '';
  return val.trim().substring(0, max);
}

function jsonResp(code, obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
