/**
 * HARDENED GOOGLE APPS SCRIPT — Hamara Brand Lead Collection
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1cKaHckuLttZsbd2jPRN8HckSO1RoINjGdrj_XFY6Vnk/edit
 * 2. Click on "Extensions" > "Apps Script"
 * 3. Delete any code in the editor and paste ALL the code below
 * 4. Add headers to Row 1: A1: Timestamp, B1: Name, C1: Company, D1: Phone, E1: Service, F1: City, G1: Budget, H1: Duration, I1: Source
 * 5. Save, then Deploy > New deployment > Web app
 * 6. Execute as: Me | Who has access: Anyone
 * 7. Copy the Web app URL and set it in your environment / code
 * 
 * SECURITY FEATURES:
 * - LockService to prevent row collisions under concurrent writes
 * - Secret token verification (shared between Vercel API and this script)
 * - Server-side field validation (phone regex, length limits, required fields)
 * - Rate-limiting awareness via proper HTTP status codes
 */

const SHEET_NAME = 'Sheet1'; // Change this if your tab is named differently

/**
 * Shared secret — must match the GOOGLE_SCRIPT_SECRET env var on Vercel.
 * Change this to a long random string and keep it secret.
 */
const SECRET_TOKEN = 'hb-lead-secret-2026-change-me';

/**
 * Validation rules
 */
const VALIDATION = {
  NAME_MAX: 120,
  COMPANY_MAX: 120,
  PHONE_REGEX: /^[\d\s\+\-\(\)]{7,20}$/, // 7-20 chars, digits/spaces/+/-/()
  SERVICE_MAX: 200,
  CITY_MAX: 100,
  BUDGET_MAX: 100,
  DURATION_MAX: 100,
  REQUIRED_FIELDS: ['name', 'phone'], // Minimum required
};

function doPost(e) {
  // ── Secret Token Check ──
  const token = e.parameter._token || '';
  if (token !== SECRET_TOKEN) {
    return _jsonResponse(403, { result: 'error', error: 'Forbidden' });
  }

  // ── Honeypot Check ──
  // If the hidden "website" field has any value, it's a bot
  const honeypot = e.parameter.website || '';
  if (honeypot.length > 0) {
    // Silently accept (don't let bots know they were caught)
    return _jsonResponse(200, { result: 'success', row: [] });
  }

  // ── Extract & Validate Fields ──
  const name     = _sanitize(e.parameter.name, VALIDATION.NAME_MAX);
  const company  = _sanitize(e.parameter.company, VALIDATION.COMPANY_MAX);
  const phone    = _sanitize(e.parameter.phone, 20);
  const service  = _sanitize(e.parameter.service, VALIDATION.SERVICE_MAX);
  const city     = _sanitize(e.parameter.city, VALIDATION.CITY_MAX);
  const budget   = _sanitize(e.parameter.budget, VALIDATION.BUDGET_MAX);
  const duration = _sanitize(e.parameter.duration, VALIDATION.DURATION_MAX);
  const source   = _sanitize(e.parameter.source || 'website', 50);

  // Required field check
  if (!name || !phone) {
    return _jsonResponse(400, { result: 'error', error: 'Name and Phone are required.' });
  }

  // Phone format check
  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return _jsonResponse(400, { result: 'error', error: 'Invalid phone number format.' });
  }

  // ── Write to Sheet with Lock (prevents row collisions) ──
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds to acquire the lock
    lock.waitLock(10000);

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME) || doc.getSheets()[0];

    const rowData = [
      new Date(),
      name,
      company,
      phone,
      service,
      city,
      budget,
      duration,
      source
    ];

    sheet.appendRow(rowData);
    lock.releaseLock();

    return _jsonResponse(200, { result: 'success', row: rowData });

  } catch (error) {
    // Release lock if we still hold it
    try { lock.releaseLock(); } catch (_) {}

    // Check if it's a lock timeout (too many concurrent writes)
    if (error.toString().includes('Lock timeout')) {
      return _jsonResponse(429, { result: 'error', error: 'Server busy. Please retry.' });
    }

    return _jsonResponse(500, { result: 'error', error: error.toString() });
  }
}

// Optional GET to verify deployment
function doGet(e) {
  return ContentService.createTextOutput("The web app is active. Ensure you use POST to push data.");
}

// ── Helpers ──

function _sanitize(value, maxLength) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().substring(0, maxLength);
}

function _jsonResponse(statusCode, payload) {
  // Note: Google Apps Script doPost always returns 200 at the HTTP level,
  // but we embed the real status in the JSON body for the caller to parse.
  payload.status = statusCode;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
