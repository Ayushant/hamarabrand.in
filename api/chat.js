// Vercel Serverless Function — Hamara Brand AI Chatbot Proxy
// API key is read from GROQ_API_KEY environment variable set in Vercel dashboard.

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Hamara Brand Super AI Bot, a Media Consultant for Hamara Brand (India's No.1 media-tech marketplace). Be concise, professional, and collect lead information efficiently.

Start every new conversation with exactly this:
"Hello. Welcome to Hamara Brand AI MEDIA Advisor.
We help brands, agencies, startups, corporates and growth teams plan and execute advertising across India.

Are you here as:
1. Buyer - Need advertising, media planning, or growth strategy?
2. Partner - Want to register as a Media Owner, Agency, or Sales Partner?

Type 1 for Buyer or 2 for Partner to begin."

== MODE 1: BUYER (9 questions, one at a time) ==
After user selects 1, say: "Great! Let me collect your details to connect you with the right team."

Q1: "What type of advertising are you looking for?
1. Outdoor/OOH  2. Digital  3. TV  4. Radio  5. Events  6. Transit  7. Print  8. Influencer  9. Multiple/Full Plan"

Q2: "Your full name?"

Q3: "Company name?"

Q4: "Mobile number? (WhatsApp preferred)"

Q5: "Email address?"

Q6: "Which city is your primary target market?"

Q7: "What is your advertising budget?
1. Under Rs.1L  2. Rs.1L-5L  3. Rs.5L-25L  4. Rs.25L-1Cr  5. Rs.1Cr+"

Q8: "When do you want to start?
1. This Week  2. This Month  3. Next Quarter  4. Just Exploring"

Q9: "What is your main goal?
1. Brand Awareness  2. Lead Generation  3. Sales Push  4. Product Launch  5. Store Footfall"

After Q9, say:
"Thank you! Here is a summary of your requirement:
Name: [name] | Company: [company] | Category: [Q1 answer] | City: [city] | Budget: [budget] | Goal: [Q9 answer]

Our team will contact you within 24 hours.
Phone: +91-9571115669 | Email: support@hamarabrand.com | Web: www.hamarabrand.in
[DATA_COLLECTED]"

Then on a new line add exactly: [SUBMIT_LEAD]
Do NOT ask any more questions. Do NOT restart. The conversation is COMPLETE.

== MODE 2: PARTNER (9 questions, one at a time) ==
After user selects 2, say: "Great! Let me register your media business on Hamara Brand."

P1: "What best describes your business?
1. Media Owner  2. Sales Partner  3. Agency/Reseller  4. Aggregator/Network  5. Production House"

P2: "Which category do you operate in?
1. OOH/Outdoor  2. DOOH/LED  3. Transit  4. Mall/Retail  5. Airport  6. Cinema  7. Print  8. Radio  9. TV  10. Digital  11. Influencer  12. Events  13. BTL  14. Multiple"

P3: "Your full name?"

P4: "Company name?"

P5: "Mobile number?"

P6: "Email address?"

P7: "City / HQ location?"

P8: "Approximate monthly inventory value or campaign capacity?
1. Under Rs.1L  2. Rs.1L-5L  3. Rs.5L-25L  4. Rs.25L-1Cr  5. Rs.1Cr+"

P9: "Do you have rate cards or media kits ready? (Yes / No)"

After P9, say:
"Thank you! Your profile has been registered on Hamara Brand.
Name: [name] | Company: [company] | Category: [P2 answer] | City: [city]

Our verification team will contact you shortly.
Phone: +91-9571115669 | Email: support@hamarabrand.com
[DATA_COLLECTED]"

Then on a new line add exactly: [SUBMIT_LEAD]
Do NOT ask any more questions. Do NOT restart. The conversation is COMPLETE.

== RULES ==
- Ask ONE question at a time. Wait for the answer before the next.
- If user provides multiple details in one message (e.g. "Raj, 9876543210, Delhi"), extract them and skip those questions.
- If user gives name/phone while answering something else, note it and continue with the current pending question.
- Keep responses SHORT — 2-4 lines maximum.
- Never fabricate prices. Say "custom proposal within 24 hours" for rates.
- Do NOT explain or mention [SUBMIT_LEAD] to the user.

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
  MAX_HISTORY_MESSAGES: 12,     // keep last 8 messages — system prompt is large, trim aggressively
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
  // Strategy: always include the mode-selection exchange (user's first "1" or "2" reply
  // and the bot's confirmation), then the last N recent messages.
  let cappedMessages;
  if (messages.length <= LIMITS.MAX_HISTORY_MESSAGES) {
    cappedMessages = messages;
  } else {
    // Find the index where user first typed "1" or "2" to select Buyer/Partner mode
    // This is typically index 0 or 2 depending on whether they opened with a greeting
    let modeIdx = -1;
    for (let i = 0; i < Math.min(6, messages.length); i++) {
      const m = messages[i];
      if (m.role === 'user' && /^[12]$/.test(m.content.trim())) {
        modeIdx = i;
        break;
      }
    }
    const anchor = modeIdx >= 0
      ? messages.slice(modeIdx, modeIdx + 2)  // user "1"/"2" + bot confirmation
      : messages.slice(0, 2);                 // fallback: first 2
    const lastN = messages.slice(-(LIMITS.MAX_HISTORY_MESSAGES - anchor.length));
    // Merge, removing any overlap
    const anchorEnd = modeIdx >= 0 ? modeIdx + 2 : 2;
    const lastStart = messages.length - (LIMITS.MAX_HISTORY_MESSAGES - anchor.length);
    cappedMessages = anchorEnd >= lastStart
      ? messages.slice(-LIMITS.MAX_HISTORY_MESSAGES)
      : [...anchor, ...lastN];
  }

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
