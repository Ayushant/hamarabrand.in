// Vercel Serverless Function — Hamara Brand AI Chatbot Proxy
// API key is read from GROQ_API_KEY environment variable set in Vercel dashboard.

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Hamara Brand Super AI Bot, a Media Consultant and Sales Qualifier for Hamara Brand (India's No.1 media-tech marketplace by Myonventure Pvt. Ltd.).

You operate in TWO modes. Start every conversation with:
"Hello. Welcome to Hamara Brand AI MEDIA Advisor.
We help brands, agencies, startups, corporates and growth teams plan and execute advertising across India.

Are you here as:
1. Buyer - Need advertising, media planning, or growth strategy?
2. Partner - Want to register as a Media Owner, Agency, or Sales Partner?

Type 1 for Buyer or 2 for Partner to begin."

== MODE 1: BUYER ==
Ask ONE question at a time in this order. Wait for answer before next question.

B1: "How can we help? 1. Advertising Campaign 2. Media Planning 3. Growth Strategy 4. Launch Planning 5. Multi-City Campaign 6. Expert Consultation"
B2: "Full name?"
B3: "Company name?"
B4: "Designation/role?"
B5: "Mobile number? (WhatsApp preferred)"
B6: "Email address?"
B7: "Website URL? (or NA)"
B8: "Industry? 1.Real Estate 2.Retail 3.Education 4.Healthcare 5.FMCG 6.Startup 7.Finance 8.Entertainment 9.Auto 10.Other"
B9: "Are you the decision maker? 1.Yes 2.Co-decide 3.Need approval"
B10: "Budget? 1.Under Rs.1L 2.Rs.1L-5L 3.Rs.5L-25L 4.Rs.25L-1Cr 5.Rs.1Cr+"
B11: "One-time or monthly recurring?"
B12: "Start when? 1.Within 48hrs 2.This Week 3.This Month 4.Next Quarter"
B13: "Duration? 1.7 Days 2.15 Days 3.1 Month 4.3 Months 5.Annual"
B14: "Objective? 1.Lead Gen 2.Branding 3.Product Launch 4.Store Footfall 5.Investor Buzz 6.App Installs 7.Sales Push"
B15: "Categories? OOH|DOOH|TV|Radio|Events|Digital|Transit|Video|OTT|Influencer|BTL|PR|Print|Cinema|Airport"
B16: Based on selected categories, ask 1-2 relevant follow-up questions (cities, format, platforms).
B17 CLOSING: Summarize their requirements in 3 lines, then ask: "What next? 1.Proposal in 24hrs 2.Schedule call 3.WhatsApp pricing 4.Free consultation"
After choice: "Your requirement is logged. Team will contact you shortly. Phone: +91-9571115669 | Email: support@hamarabrand.com | Web: www.hamarabrand.in [DATA_COLLECTED]"
Then append: [SUBMIT_LEAD]

== MODE 2: PARTNER ==
Ask ONE question at a time:
P1: "Business type? 1.Media Owner 2.Sales Partner 3.Agency/Reseller 4.Network/Aggregator 5.Production Agency"
P2: "Category? 1.OOH 2.DOOH 3.Transit 4.Mall 5.Airport 6.Cinema 7.Print 8.Radio 9.TV 10.OTT 11.Influencer 12.Digital 13.Events 14.BTL 15.Video 16.Multiple"
P3: "Full name?" P4: "Company?" P5: "Designation?" P6: "Mobile?" P7: "Email?" P8: "City/HQ?" P9: "GST registered? (Yes/No/In Process)"
P10: Ask 2-3 relevant questions based on their business type and category (inventory size, cities, authorization).
P11: "Minimum campaign size? Payment terms?"
P12: "Have rate cards or client references? (Yes/No)"
P13 CLOSING: Summarize profile in 2 lines. "Your profile is being registered. Phone: +91-9571115669 | Email: support@hamarabrand.com [DATA_COLLECTED]"
Then append: [SUBMIT_LEAD]

== RULES ==
- ONE question at a time always.
- If user gives name/phone out of order, note it, still ask pending question.
- If user gives multiple details in one message, extract all and skip answered questions.
- Keep responses SHORT (2-4 lines max).
- Never fabricate prices. Say "custom proposal in 24hrs" for rates.
- Do NOT explain [SUBMIT_LEAD] token to user.

Company: Hamara Brand | Myonventure Pvt. Ltd. | +91-9571115669 | support@hamarabrand.com | www.hamarabrand.in
`;



// ─── CONFIGURATION ────────────────────────────────────────────────────────────

/** Sliding-window rate limit: max requests per IP per window */
const RATE_LIMIT = {
  WINDOW_MS: 60_000,      // 1 minute
  MAX_REQUESTS: 30,       // 30 requests per window — questionnaire needs ~20 turns
  CLEANUP_INTERVAL: 300_000, // purge stale entries every 5 min
};

/** Guard against oversized payloads */
const LIMITS = {
  MAX_MESSAGE_LENGTH: 2_000,   // chars per user message
  MAX_HISTORY_MESSAGES: 6,     // keep last 8 messages — system prompt is large, trim aggressively
  GROQ_TIMEOUT_MS: 25_000,     // 25 s (Vercel function limit is 30 s)
};

/** Groq model cascade — only currently active models (May 2026) */
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",                       // production: primary
  "llama-3.1-8b-instant",                           // production: fast fallback
  "meta-llama/llama-4-scout-17b-16e-instruct",      // preview: 17B scout
  "qwen/qwen3-32b",                                 // preview: Qwen 32B
];

/** Allowed origins — tighten this in production */
const ALLOWED_ORIGINS = [
  "https://hamarabrand.in",
  "https://www.hamarabrand.in",
  "https://hamarabrand.com",
  "https://www.hamarabrand.com",
];

// ─── SLIDING WINDOW RATE LIMITER (in-memory) ─────────────────────────────────
// Note: each Vercel cold-start gets a fresh map. For cross-instance limiting
// use Vercel KV / Upstash Redis. This provides per-instance protection which
// is still effective against most abuse since each instance handles ~1 user.

const rateLimitStore = new Map(); // ip → { requests: [timestamp, ...] }

// Periodic cleanup to prevent unbounded memory growth
let lastCleanup = Date.now();

function isRateLimited(ip) {
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > RATE_LIMIT.CLEANUP_INTERVAL) {
    for (const [key, val] of rateLimitStore) {
      const recent = val.requests.filter(t => now - t < RATE_LIMIT.WINDOW_MS);
      if (recent.length === 0) rateLimitStore.delete(key);
      else val.requests = recent;
    }
    lastCleanup = now;
  }

  const entry = rateLimitStore.get(ip) || { requests: [] };

  // Sliding window: keep only timestamps within the current window
  entry.requests = entry.requests.filter(t => now - t < RATE_LIMIT.WINDOW_MS);

  if (entry.requests.length >= RATE_LIMIT.MAX_REQUESTS) {
    rateLimitStore.set(ip, entry);
    const oldestRequest = entry.requests[0];
    const retryAfterSec = Math.ceil((oldestRequest + RATE_LIMIT.WINDOW_MS - now) / 1000);
    return { limited: true, retryAfter: retryAfterSec };
  }

  entry.requests.push(now);
  rateLimitStore.set(ip, entry);
  return { limited: false };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Extract the real client IP, resistant to simple spoofing.
 * On Vercel, `x-real-ip` is the forwarded IP set by their edge.
 */
function getClientIp(req) {
  // Vercel sets x-real-ip reliably
  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp.trim();

  // Fall back to first entry of x-forwarded-for
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.socket?.remoteAddress || "unknown";
}

/**
 * Fetch with a hard timeout. Returns `{ ok, status, data }`.
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Validate and sanitise incoming messages array.
 */
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: "No messages provided." };
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: "Invalid message format." };
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return { valid: false, error: "Invalid message role." };
    }
    if (typeof msg.content !== "string" || msg.content.trim() === "") {
      return { valid: false, error: "Message content must be a non-empty string." };
    }
    if (msg.content.length > LIMITS.MAX_MESSAGE_LENGTH) {
      return {
        valid: false,
        error: `Message too long. Please keep messages under ${LIMITS.MAX_MESSAGE_LENGTH} characters.`,
      };
    }
  }
  return { valid: true };
}

// ─── CORS HELPER ─────────────────────────────────────────────────────────────

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  // In development (no origin header or localhost), allow all
  const isDev =
    !origin ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  res.setHeader("Access-Control-Allow-Origin", isDev ? "*" : allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // ── CORS ──
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
      error: `Too many requests. Please wait ${rl.retryAfter} seconds before trying again.`,
    });
  }

  // ── API Key ──
  const apiKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    console.error("[chat] GROQ_API_KEY is not configured.");
    return res.status(500).json({ error: "Service configuration error. Please contact support." });
  }

  // ── Input Validation ──
  const { messages } = req.body || {};
  const validation = validateMessages(messages);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // ── Conversation History Cap (prevent token overflow) ──
  // Keep the most recent N messages so we don't exceed model context limits.
  const cappedMessages = messages.slice(-LIMITS.MAX_HISTORY_MESSAGES);

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...cappedMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content.trim(),
    })),
  ];

  // ── Call Groq with Model Fallback ──
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const { ok, status, data } = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 600,
            top_p: 0.9,
          }),
        },
        LIMITS.GROQ_TIMEOUT_MS
      );

      if (ok) {
        const reply =
          data?.choices?.[0]?.message?.content ||
          "I apologize, but I could not generate a response. Please contact our support team.";
        return res.status(200).json({ reply });
      }

      // Groq returned an error status — ALWAYS try next model
      const groqMsg = data?.error?.message || "Unknown Groq error";
      console.error(`[chat] Groq error (model: ${model}, status: ${status}):`, groqMsg);
      lastError = `${model}: ${status} - ${groqMsg}`;
      continue;
    } catch (err) {
      console.error(`[chat] Error with model ${model}:`, err.message || err);
      lastError = `${model}: ${err.message || "unknown"}`;
      continue; // always try next model
    }
  }

  // All models exhausted
  console.error("[chat] All Groq models failed. Last error:", lastError);
  return res.status(503).json({
    error: "The AI service is temporarily unavailable. Please try again in a moment.",
  });
}
