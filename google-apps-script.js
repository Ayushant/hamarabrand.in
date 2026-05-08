/**
 * HAMARA BRAND — Super AI Bot + Lead Collection Google Apps Script
 *
 * SETUP:
 * 1. Open your Google Sheet
 * 2. Extensions > Apps Script > Paste this entire file > Save
 * 3. Sheet1 (normal lead form): Timestamp | Name | Company | Phone | Service | City | Budget | Duration | Source
 * 4. Create a 2nd tab named "BotLeads": Timestamp | BotMode | Name | Company | Designation | Phone | Email | City | Budget | Service | Category | LeadScore | AllAnswers
 * 5. Deploy > New Deployment > Web App > Execute as Me, Anyone can access
 * 6. Copy the Web App URL to your Vercel env vars
 */

const SHEET_NAME      = 'Sheet1';    // Normal lead form tab
const BOT_SHEET_NAME  = 'BotLeads'; // Super AI Bot leads tab

/**
 * Shared secret — must match process.env.GOOGLE_SCRIPT_SECRET in Vercel.
 */
const SECRET_TOKEN = 'hb-lead-secret-2026-change-me';

const VALIDATION = {
  NAME_MAX: 120,
  COMPANY_MAX: 120,
  PHONE_REGEX: /^[\d\s\+\-\(\)]{7,20}$/,
  SERVICE_MAX: 200,
  CITY_MAX: 100,
  BUDGET_MAX: 100,
  DURATION_MAX: 100,
  REQUIRED_FIELDS: ['name', 'phone'],
};

function doPost(e) {
  // ── Secret Token Check ──
  const token = e.parameter._token || '';
  if (token !== SECRET_TOKEN) {
    return _jsonResponse(403, { result: 'error', error: 'Forbidden' });
  }

  // ── Honeypot Check ──
  const honeypot = e.parameter.website || '';
  if (honeypot.length > 0) {
    return _jsonResponse(200, { result: 'success', row: [] });
  }

  const source = _sanitize(e.parameter.source || 'website', 50);

  // ── Route to correct handler ──
  if (source === 'super-ai-bot') {
    return _handleBotLead(e);
  } else {
    return _handleFormLead(e);
  }
}

// ── Normal Lead Form ──────────────────────────────────────────────────────────
function _handleFormLead(e) {
  const name     = _sanitize(e.parameter.name, VALIDATION.NAME_MAX);
  const company  = _sanitize(e.parameter.company, VALIDATION.COMPANY_MAX);
  const phone    = _sanitize(e.parameter.phone, 20);
  const service  = _sanitize(e.parameter.service, VALIDATION.SERVICE_MAX);
  const city     = _sanitize(e.parameter.city, VALIDATION.CITY_MAX);
  const budget   = _sanitize(e.parameter.budget, VALIDATION.BUDGET_MAX);
  const duration = _sanitize(e.parameter.duration, VALIDATION.DURATION_MAX);
  const source   = _sanitize(e.parameter.source || 'website', 50);

  if (!name || !phone) {
    return _jsonResponse(400, { result: 'error', error: 'Name and Phone are required.' });
  }
  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return _jsonResponse(400, { result: 'error', error: 'Invalid phone number format.' });
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const doc   = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME) || doc.getSheets()[0];
    const rowData = [new Date(), name, company, phone, service, city, budget, duration, source];
    sheet.appendRow(rowData);
    lock.releaseLock();
    return _jsonResponse(200, { result: 'success', row: rowData });
  } catch (error) {
    try { lock.releaseLock(); } catch (_) {}
    if (error.toString().includes('Lock timeout')) {
      return _jsonResponse(429, { result: 'error', error: 'Server busy. Please retry.' });
    }
    return _jsonResponse(500, { result: 'error', error: error.toString() });
  }
}

// ── Super AI Bot Lead ─────────────────────────────────────────────────────────
function _handleBotLead(e) {
  const botMode     = _sanitize(e.parameter.service || 'buyer', 20).split('|')[0].trim(); // service field encodes multiple values
  const name        = _sanitize(e.parameter.name, VALIDATION.NAME_MAX);
  const company     = _sanitize(e.parameter.company, VALIDATION.COMPANY_MAX);
  const phone       = _sanitize(e.parameter.phone, 20);
  const service     = _sanitize(e.parameter.service, 500);
  const city        = _sanitize(e.parameter.city, 300);
  const budget      = _sanitize(e.parameter.budget, VALIDATION.BUDGET_MAX);
  const duration    = _sanitize(e.parameter.duration, VALIDATION.DURATION_MAX);

  // Score the lead
  let leadScore = 'COLD';
  const budgetLower = budget.toLowerCase();
  if (budgetLower.includes('1cr') || budgetLower.includes('₹1cr') || budgetLower.includes('crore')) leadScore = 'HOT';
  else if (budgetLower.includes('25l') || budgetLower.includes('₹25') || budgetLower.includes('lakh')) leadScore = 'WARM';
  else if (budgetLower.includes('5l') || budgetLower.includes('₹5')) leadScore = 'WARM';

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const doc = SpreadsheetApp.getActiveSpreadsheet();

    // Get or create BotLeads sheet
    let botSheet = doc.getSheetByName(BOT_SHEET_NAME);
    if (!botSheet) {
      botSheet = doc.insertSheet(BOT_SHEET_NAME);
      // Add headers
      botSheet.appendRow([
        'Timestamp', 'Bot Mode', 'Name', 'Company', 'Phone',
        'Service/Category', 'City', 'Budget', 'Duration',
        'Lead Score', 'Source'
      ]);
    }

    const rowData = [
      new Date(), botMode, name, company, phone,
      service, city, budget, duration,
      leadScore, 'super-ai-bot'
    ];
    botSheet.appendRow(rowData);
    lock.releaseLock();
    return _jsonResponse(200, { result: 'success', leadScore, row: rowData });
  } catch (error) {
    try { lock.releaseLock(); } catch (_) {}
    return _jsonResponse(500, { result: 'error', error: error.toString() });
  }
}

// Optional GET to verify deployment
function doGet(e) {
  return ContentService.createTextOutput('Hamara Brand Apps Script is active. Use POST to push data.');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function _sanitize(value, maxLength) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().substring(0, maxLength);
}

function _jsonResponse(statusCode, payload) {
  payload.status = statusCode;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
