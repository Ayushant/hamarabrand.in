// Vercel Serverless Function — Hamara Brand Lead Capture (Tier 2)
// Routes leads through Vercel → Google Sheets (with validation, rate limiting, honeypot, idempotency)
//
// Environment variables needed in Vercel Dashboard:
//   GOOGLE_SCRIPT_URL     — Your Google Apps Script Web App URL
//   GOOGLE_SCRIPT_SECRET  — Must match SECRET_TOKEN in your Apps Script (e.g. "hb-lead-secret-2026-change-me")
//   LEAD_API_SECRET       — A secret the frontend sends to prove it's your site (e.g. "hb-frontend-2026")

// ─── CONFIGURATION ──────────────────────────────────────────────────────────────

const RATE_LIMIT = {
  WINDOW_MS: 60_000,       // 1 minute
  MAX_REQUESTS: 5,         // 5 leads/min/IP — real humans won't hit this
  CLEANUP_INTERVAL: 300_000,
};

const FIELD_LIMITS = {
  name:     { required: true,  maxLen: 120 },
  company:  { required: false, maxLen: 120 },
  phone:    { required: true,  maxLen: 20,  regex: /^[\d\s\+\-\(\)]{7,20}$/ },
  service:  { required: false, maxLen: 200 },
  city:     { required: false, maxLen: 100 },
  budget:   { required: false, maxLen: 100 },
  duration: { required: false, maxLen: 100 },
};

const ALLOWED_ORIGINS = [
  "https://hamarabrand.in",
  "https://www.hamarabrand.in",
  "https://hamarabrand.com",
  "https://www.hamarabrand.com",
];

// ─── IN-MEMORY RATE LIMITER ─────────────────────────────────────────────────────

const rateLimitStore = new Map();
let lastCleanup = Date.now();

function isRateLimited(ip) {
  const now = Date.now();

  if (now - lastCleanup > RATE_LIMIT.CLEANUP_INTERVAL) {
    for (const [key, val] of rateLimitStore) {
      const recent = val.filter(t => now - t < RATE_LIMIT.WINDOW_MS);
      if (recent.length === 0) rateLimitStore.delete(key);
      else rateLimitStore.set(key, recent);
    }
    lastCleanup = now;
  }

  const timestamps = rateLimitStore.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT.WINDOW_MS);

  if (recent.length >= RATE_LIMIT.MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    const retryAfter = Math.ceil((recent[0] + RATE_LIMIT.WINDOW_MS - now) / 1000);
    return { limited: true, retryAfter };
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);
  return { limited: false };
}

// ─── IDEMPOTENCY (prevent duplicate submits on retry) ────────────────────────────

const idempotencyStore = new Map();
const IDEMPOTENCY_TTL = 300_000; // 5 minutes

function isDuplicate(key) {
  if (!key) return false;
  const now = Date.now();

  // Cleanup old entries
  for (const [k, t] of idempotencyStore) {
    if (now - t > IDEMPOTENCY_TTL) idempotencyStore.delete(k);
  }

  if (idempotencyStore.has(key)) return true;
  idempotencyStore.set(key, now);
  return false;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────────

function getClientIp(req) {
  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp.trim();
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function sanitize(value, maxLen) {
  if (!value || typeof value !== "string") return "";
  return value.trim().substring(0, maxLen);
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || "";
  const isDev = !origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  res.setHeader("Access-Control-Allow-Origin", isDev ? "*" : allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Lead-Token, X-Idempotency-Key");
  res.setHeader("Vary", "Origin");
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  // ── Rate Limiting ──
  const clientIp = getClientIp(req);
  const rl = isRateLimited(clientIp);
  if (rl.limited) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({
      error: `Too many requests. Please wait ${rl.retryAfter} seconds.`,
    });
  }

  // ── Frontend Secret Check ──
  const leadApiSecret = (process.env.LEAD_API_SECRET || "").trim();
  if (leadApiSecret) {
    const clientToken = req.headers["x-lead-token"] || "";
    if (clientToken !== leadApiSecret) {
      return res.status(403).json({ error: "Forbidden." });
    }
  }

  // ── Idempotency ──
  const idempotencyKey = req.headers["x-idempotency-key"] || "";
  if (isDuplicate(idempotencyKey)) {
    return res.status(200).json({ result: "success", deduplicated: true });
  }

  // ── Parse Body ──
  const body = req.body || {};

  // ── Honeypot Check ──
  if (body.website && body.website.length > 0) {
    // Silently "accept" — bots don't know they were caught
    return res.status(200).json({ result: "success" });
  }

  // ── Min-Time Check (bot fills form in < 3 seconds) ──
  const formLoadedAt = parseInt(body._formLoadedAt, 10);
  if (formLoadedAt) {
    const elapsed = Date.now() - formLoadedAt;
    if (elapsed < 3000) {
      // Too fast — likely a bot
      return res.status(200).json({ result: "success" });
    }
  }

  // ── Validate Fields ──
  const errors = [];
  const cleaned = {};

  for (const [field, rules] of Object.entries(FIELD_LIMITS)) {
    const raw = body[field];
    const value = sanitize(raw, rules.maxLen);

    if (rules.required && !value) {
      errors.push(`${field} is required.`);
    }

    if (value && rules.regex && !rules.regex.test(value)) {
      errors.push(`${field} has an invalid format.`);
    }

    cleaned[field] = value;
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  // ── Forward to Google Apps Script ──
  const googleScriptUrl = (process.env.GOOGLE_SCRIPT_URL || "").trim();
  const googleScriptSecret = (process.env.GOOGLE_SCRIPT_SECRET || "").trim();

  if (!googleScriptUrl) {
    console.error("[lead] GOOGLE_SCRIPT_URL is not configured.");
    return res.status(500).json({ error: "Service configuration error." });
  }

  try {
    const params = new URLSearchParams({
      ...cleaned,
      source: "website-vercel",
      _token: googleScriptSecret,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const gsResponse = await fetch(googleScriptUrl, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Google Apps Script always returns 200 (or 302 redirect),
    // but we try to parse the JSON body for the real status.
    let gsData;
    try {
      const text = await gsResponse.text();
      gsData = JSON.parse(text);
    } catch {
      // If we can't parse, assume success (opaque response from redirect)
      gsData = { result: "success" };
    }

    if (gsData.result === "error") {
      console.error("[lead] Google Script error:", gsData.error);
      return res.status(502).json({ error: "Failed to save lead. Please try again." });
    }

    return res.status(200).json({ result: "success" });

  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[lead] Google Script request timed out.");
      return res.status(504).json({ error: "Request timed out. Please try again." });
    }

    console.error("[lead] Unexpected error:", err);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}
