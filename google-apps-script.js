/**
 * HAMARA BRAND — AI Chatbot Lead Collection Script
 *
 * SETUP (fresh Google Sheet):
 * 1. Create a NEW Google Sheet (e.g. "HB Bot Leads")
 * 2. Extensions > Apps Script > paste this file > Save
 * 3. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL:
 *    https://script.google.com/macros/s/AKfycbzMIAanrFc2jXDGiFj9UFHK2FgYo_SXZ-ZOF6XoLIt3IEH0Lra8-lLYQgoTQB16bCDM/exec
 * 5. In Vercel > Settings > Environment Variables, add:
 *    - GOOGLE_SCRIPT_URL  = <paste Web App URL here>
 *    - GOOGLE_SCRIPT_SECRET = hb-lead-secret-2026-change-me
 * 6. Redeploy on Vercel
 *
 * Deployment ID:
 * AKfycbzMIAanrFc2jXDGiFj9UFHK2FgYo_SXZ-ZOF6XoLIt3IEH0Lra8-lLYQgoTQB16bCDM
 *
 * Tabs:
 *  - "BotLeads"      — AI chatbot leads (Timestamp | Mode | Name | Company | Phone | Email | City | Budget | Service | Goal | Source | LeadScore)
 *  - "ProposalLeads" — Custom proposal form submissions (Timestamp | Source | Name | Company | Phone | City | Service | Budget | Duration | LeadScore)
 */

const SECRET   = 'hb-lead-secret-2026-change-me';
const TAB_NAME = 'BotLeads';
const PROPOSAL_TAB_NAME = 'ProposalLeads';

const HEADERS = [
  'Timestamp', 'Mode', 'Name', 'Company', 'Phone', 'Email',
  'City', 'Budget', 'Service/Category', 'Goal/Objective', 'Source', 'Lead Score'
];

const PROPOSAL_HEADERS = [
  'Timestamp', 'Source', 'Name', 'Company', 'Phone',
  'City', 'Service Needed', 'Monthly Budget', 'Duration', 'Lead Score'
];

/** Run this ONCE manually from Apps Script editor to create the BotLeads sheet + headers */
function setup() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }
  // Write headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  // Style header row
  sheet.getRange(1, 1, 1, HEADERS.length)
       .setFontWeight('bold')
       .setBackground('#1a4d2e')
       .setFontColor('#ffffff')
       .setFontSize(11);
  sheet.setFrozenRows(1);
  // Auto-resize columns
  for (let i = 1; i <= HEADERS.length; i++) sheet.autoResizeColumn(i);
  SpreadsheetApp.getUi().alert('BotLeads tab created with all columns!');
}

/** Run this ONCE manually to create the ProposalLeads sheet + headers */
function setupProposals() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(PROPOSAL_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PROPOSAL_TAB_NAME);
  }
  sheet.getRange(1, 1, 1, PROPOSAL_HEADERS.length).setValues([PROPOSAL_HEADERS]);
  sheet.getRange(1, 1, 1, PROPOSAL_HEADERS.length)
       .setFontWeight('bold')
       .setBackground('#FF6F00')
       .setFontColor('#ffffff')
       .setFontSize(11);
  sheet.setFrozenRows(1);
  for (let i = 1; i <= PROPOSAL_HEADERS.length; i++) sheet.autoResizeColumn(i);
  SpreadsheetApp.getUi().alert('ProposalLeads tab created with all columns!');
}

function doPost(e) {
  try {
    const p = e.parameter;

    // ── Route proposal form submissions to ProposalLeads tab ──
    if ((p._tab || '').toLowerCase() === 'proposal') {
      return handleProposalLead(p);
    }

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

/** Handle proposal form leads — stored in ProposalLeads tab */
function handleProposalLead(p) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(PROPOSAL_TAB_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(PROPOSAL_TAB_NAME);
      sheet.appendRow(PROPOSAL_HEADERS);
      sheet.getRange(1, 1, 1, PROPOSAL_HEADERS.length)
           .setFontWeight('bold')
           .setBackground('#FF6F00')
           .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // ── Score the proposal lead ──
    const budget = (p.budget || '').toLowerCase();
    let score = 'COLD';
    if (budget.includes('5,00,000') || budget.includes('5l') || budget.includes('cr')) score = 'HOT';
    else if (budget.includes('2,00,000') || budget.includes('2l') || budget.includes('3l') || budget.includes('4l')) score = 'WARM';

    sheet.appendRow([
      new Date(),
      sanitize(p.source   || 'website-proposal-form', 50),
      sanitize(p.name     || '', 120),
      sanitize(p.company  || '', 120),
      sanitize(p.phone    || '', 20),
      sanitize(p.city     || '', 100),
      sanitize(p.service  || p.category || '', 200),
      sanitize(p.budget   || '', 100),
      sanitize(p.duration || '', 100),
      score
    ]);

    return jsonResp(200, { result: 'success', tab: 'ProposalLeads', score });
  } catch (err) {
    console.error('handleProposalLead error:', err);
    return jsonResp(500, { result: 'error', error: err.message });
  }
}

/** Handle GET requests — used by lead-bot API to avoid POST redirect issues */
function doGet(e) {
  try {
    const p = e.parameter || {};

    // ── Route proposal form GET requests to ProposalLeads tab ──
    if ((p._tab || '').toLowerCase() === 'proposal') {
      return handleProposalLead(p);
    }

    if ((p.action || '').toLowerCase() === 'list') {
      const ss    = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(TAB_NAME);

      if (!sheet) {
        return jsonResp(200, { result: 'success', data: [] });
      }

      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) {
        return jsonResp(200, { result: 'success', data: [] });
      }

      const headers = values[0].map(String);
      const rows = values.slice(1).map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[toSnakeCase(header)] = row[index];
        });
        return item;
      }).reverse();

      const limit = Math.min(parseInt(p.limit || '100', 10) || 100, 500);
      const offset = Math.max(parseInt(p.offset || '0', 10) || 0, 0);
      return jsonResp(200, { result: 'success', data: rows.slice(offset, offset + limit) });
    }

    return doPost(e);
  } catch (err) {
    console.error('doGet error:', err);
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

function toSnakeCase(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
