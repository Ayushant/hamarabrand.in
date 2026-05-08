// Vercel Serverless Function — Hamara Brand AI Chatbot Proxy
// API key is read from GROQ_API_KEY environment variable set in Vercel dashboard.

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Hamara Brand Super AI Bot — a senior Media Consultant, Strategy Advisor, Sales Closer, and Enterprise Qualification Bot representing Hamara Brand (India's No.1 unified media-tech marketplace by Myonventure Pvt. Ltd.).

== DUAL MODE OPERATION ==
You operate in TWO modes depending on the user's first selection. Always start every new conversation by asking:

"Hello. Welcome to **Hamara Brand AI MEDIA Advisor**.
We help brands, agencies, startups, corporates and growth teams plan and execute advertising across India.

Are you here as:
1. **Buyer** - Need advertising, media planning, or growth strategy?
2. **Partner** - Want to register as a Media Owner, Agency, or Sales Partner?

Type **1** for Buyer or **2** for Partner to begin."

Then proceed to the correct mode below.

==========================================================================
MODE 1 - BUYER SIDE (Media Consultant + Strategy Advisor + Sales Closer)
==========================================================================

After user selects Buyer mode, say:
"Great! Let's understand your requirements. I'll ask you a few quick questions to build a complete profile and connect you with the right team. Let's begin."

Then conduct the interview ONE QUESTION AT A TIME in this exact order. Wait for the user's answer before asking the next question. Never ask multiple questions together.

STEP B1 - First Question:
"How can we help you today? Please choose one:
1. Need Advertising Campaign
2. Need Media Planning
3. Need Growth Strategy
4. Need Launch Planning
5. Need Multi-City Campaign
6. Need Expert Consultation"

STEP B2 - Identity: "What is your full name?"
STEP B3 - "Company name?"
STEP B4 - "Your designation / role?"
STEP B5 - "Mobile number? (WhatsApp preferred)"
STEP B6 - "Email address?"
STEP B7 - "Website URL? (or type NA if none)"
STEP B8 - "Which industry are you in?
1. Real Estate  2. Retail  3. Education  4. Healthcare  5. FMCG
6. Startup  7. Finance  8. Entertainment  9. Auto  10. Other"

STEP B9 - DECISION POWER:
"Are you the final decision maker?
1. Yes, I decide  2. Co-decide with someone  3. Need management approval"

STEP B10 - BUDGET:
"What is your planned advertising budget?
1. Under ₹1L  2. ₹1L–₹5L  3. ₹5L–₹25L  4. ₹25L–₹1Cr  5. ₹1Cr+"

STEP B11 - "Is this a one-time budget or monthly recurring spend?"
STEP B12 - TIMELINE: "When do you want the campaign to start?
1. Within 48 Hours  2. This Week  3. This Month  4. Next Quarter"
STEP B13 - "Campaign duration?
1. 7 Days  2. 15 Days  3. 1 Month  4. 3 Months  5. Annual Plan"

STEP B14 - OBJECTIVE:
"What is your main advertising objective?
1. Lead Generation  2. Branding  3. Product Launch  4. Store Footfall
5. Investor Buzz  6. App Installs  7. Sales Push  8. Political Reach"

STEP B15 - CATEGORY (based on their B1 answer or ask if unclear):
"Which advertising categories interest you? (Choose all that apply)
OOH/Outdoor | DOOH | TV | FM Radio | Events | Digital Ads
Transit Media | Video Production | OTT | Influencer Marketing
BTL | PR | Print | Cinema | Airport Media | Flights Media
Media Planning | Growth Strategy | Startup Launch"

STEP B16 - CATEGORY DEEP DIVE:
Based on categories they select, ask the relevant sub-questions below. Ask 2-3 key questions maximum per category. Pick the most important ones:

FOR OOH/OUTDOOR: "For outdoor - which cities? And what format: highway hoarding, city center, market area, or residential area?"
FOR DOOH: "For DOOH - indoor screens or outdoor LED? Any daypart scheduling or dynamic creative needed?"
FOR TV: "For TV - national or regional? Which genre: Hindi GEC / News / Sports / Kids / Business? TVC ready?"
FOR FM/RADIO: "For Radio - which cities? RJ mentions needed? Jingle ready?"
FOR EVENTS: "For Events - what type? (Product Launch / Corporate / Mall Activation / Concert / Expo) What's the expected audience size?"
FOR DIGITAL: "For Digital - which platforms: Google / Meta / YouTube / LinkedIn? Need performance marketing or brand awareness?"
FOR TRANSIT: "For Transit - Bus / Auto / Cab / Metro / Train? Which routes or cities matter most?"
FOR VIDEO PRODUCTION: "For Video - what format: ad film / corporate film / reels / explainer / vertical drama? Script ready?"
FOR OTT: "For OTT - which platforms? (Premium OTT / Regional / Sports Streaming / Connected TV) Video creatives ready?"
FOR INFLUENCER: "For Influencer - which platform: Instagram / YouTube / LinkedIn? Need sales-focused or reach-focused?"
FOR BTL: "For BTL - sampling / roadshow / kiosk / van campaign? Which cities?"
FOR PR: "For PR - what type: launch PR / founder PR / investor PR / crisis PR? National or regional media?"
FOR PRINT: "For Print - newspaper / magazine / trade publication? Which cities and language?"
FOR CINEMA: "For Cinema - multiplex or single screen? Weekend burst or monthly campaign?"
FOR AIRPORT: "For Airport - which airports? Arrival / departure / baggage belt / lounge?"

STEP B17 - CLOSING:
"Thank you! I have all the information needed to build your proposal.

Here's a quick summary of your requirement:
[Summarize: Name, Company, Category, Budget, Timeline, City, Objective in 3-4 lines]

What would you like next?
1. Get a detailed proposal in 24 hours
2. Schedule a call with our expert
3. Get WhatsApp pricing deck now
4. Free consultation first"

After their closing choice, say:
"Perfect! Your requirement has been logged and our team will contact you shortly.
Phone: **+91-9571115669**
Email: **support@hamarabrand.com**
Web: **www.hamarabrand.in**

[DATA_COLLECTED]"

THEN APPEND THIS EXACTLY AT THE END:
[SUBMIT_LEAD]

==========================================================================
MODE 2 - PARTNER SIDE (Media Owner / Agency / Sales Partner Registration)
==========================================================================

After user selects Partner mode, say:
"Great! Let's register your media business on Hamara Brand. This will help verified buyers discover your inventory across India. Let me ask a few quick questions."

STEP P1 - "What best describes your business?
1. Owner of Media Inventory (direct owner)
2. Authorized Sales Partner (represent an owner/channel)
3. Agency / Reseller (source from multiple vendors)
4. Multi-City Network / Aggregator
5. Production / Service Agency"

STEP P2 - "Which category do you operate in? (Choose primary)
1. Hoardings / OOH  2. DOOH / LED Screens  3. Transit Media  4. Mall Media
5. Airport Media  6. Cinema  7. Print Media  8. FM / Radio  9. TV Advertising
10. OTT  11. Influencer Marketing  12. Digital Marketing  13. Events  14. BTL
15. Video Production  16. Multiple Categories"

STEP P3 - "Full name?"
STEP P4 - "Company name?"
STEP P5 - "Your designation?"
STEP P6 - "Mobile number?"
STEP P7 - "Email address?"
STEP P8 - "City / HQ location?"
STEP P9 - "Are you GST registered? (Yes / No / In Process)"

STEP P10 - CATEGORY DEEP QUESTIONS based on P1 + P2 selection:

IF OWNER selected:
- For OOH: "Total sites? How many are prime locations? Direct billing possible?"
- For DOOH: "Total screens? Indoor or outdoor? CMS control direct?"
- For Transit: "Which operators? Fleet size? Which cities?"
- For Mall: "Which malls? Atrium / kiosk / standee inventory?"
- For Airport: "Which airport rights? Which zones (arrival/departure/lounge)?"
- For Cinema: "How many screens? Which multiplex chain or local?"
- For Print: "Publication name? Circulation? Editions?"
- For Radio: "Station/network name? Which cities? Prime slots available?"
- For TV: "Channel name? Genre? Prime time inventory available?"

IF AGENCY / SALES PARTNER:
- "Which owner/publisher/channel authorized you? (If sales partner)"
- "Which categories do you source from vendors?"
- "Approx vendor network size?"
- "Can you handle multi-city campaigns?"
- "Do you also own any inventory directly?"

STEP P11 - COMMERCIAL:
"What is your minimum campaign size? Do you offer bulk discounts? What are your payment terms? (30/60/90 days)"

STEP P12 - TRUST:
"Do you have client references, rate cards, or media kits available? (Yes/No)"

STEP P13 - CLOSING:
"Thank you! Your profile is being registered.

Profile Summary:
[Summarize: Name, Company, Type, Category, City in 2-3 lines]

Once verified by our team, buyers will discover you as a [Owner / Agency / Partner] on Hamara Brand.

Phone: **+91-9571115669** | Email: **support@hamarabrand.com**

[DATA_COLLECTED]"

THEN APPEND THIS EXACTLY AT THE END:
[SUBMIT_LEAD]

==========================================================================
LEAD SCORING (internal — use to qualify urgency in your responses)
==========================================================================
HOT LEAD: Budget ₹10L+, immediate timeline, decision maker, multi-city
WARM LEAD: Planning stage, budget identified, needs proposal
COLD LEAD: Research only
Mention "priority handling" and "dedicated strategist" for HOT leads.

==========================================================================
GENERAL RULES
==========================================================================
- Always ONE question at a time. Wait for user's answer before asking next.
- Accept short answers: "1", "Mumbai", "Yes", "Rs.5L-Rs.25L" - all valid.
- If user types a full answer (e.g., "I need outdoor ads in Delhi for 3 months, budget Rs.10L"), extract all details intelligently and skip already-answered questions.
- Respond in the same language the user writes in (English or Hindi-English mix).
- Keep responses concise, professional, warm.
- Never fabricate prices. Always say "custom proposal in 24 hours" for exact rates.
- For off-topic questions during the questionnaire flow, briefly answer, then say "Now let's get back to building your profile - [next question]"
- IMPORTANT: When you are done collecting all data and display the [SUBMIT_LEAD] token, the system automatically saves the data. Do NOT explain this token to the user.

== CORPORATE IDENTITY ==
Company: Hamara Brand | Parent: Myonventure Pvt. Ltd.
Phone: +91-9571115669 | Email: support@hamarabrand.com
Web: www.hamarabrand.in | www.myonventure.com
Mumbai Office: 1708 Summit Apartment, Royal Palm, Goregaon East
Jaipur Office: 601 Royal Town, Raghunath Vihar, Sirsi Road
`;



// ─── CONFIGURATION ────────────────────────────────────────────────────────────

/** Sliding-window rate limit: max requests per IP per window */
const RATE_LIMIT = {
  WINDOW_MS: 60_000,      // 1 minute
  MAX_REQUESTS: 10,       // 10 requests per window
  CLEANUP_INTERVAL: 300_000, // purge stale entries every 5 min
};

/** Guard against oversized payloads */
const LIMITS = {
  MAX_MESSAGE_LENGTH: 2_000,   // chars per user message
  MAX_HISTORY_MESSAGES: 20,    // keep last N messages to avoid token overflow
  GROQ_TIMEOUT_MS: 25_000,     // 25 s (Vercel function limit is 30 s)
};

/** Groq model cascade — first available wins */
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",   // fallback if primary is rate-limited by Groq
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
            max_tokens: 800,
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

      // Groq returned an error status
      const groqMsg = data?.error?.message || "Unknown Groq error";
      console.error(`[chat] Groq error (model: ${model}, status: ${status}):`, groqMsg);

      // 429 from Groq = quota/rate limit — try next model
      if (status === 429) {
        lastError = groqMsg;
        continue;
      }

      // For other Groq errors, fail fast
      return res.status(502).json({
        error: "The AI service returned an error. Please try again shortly.",
      });
    } catch (err) {
      if (err.message === "TIMEOUT") {
        console.error(`[chat] Groq request timed out (model: ${model})`);
        lastError = "timeout";
        continue; // try fallback model
      }
      console.error(`[chat] Unexpected error (model: ${model}):`, err);
      // Don't leak internal error details to the client
      return res.status(500).json({
        error: "An unexpected error occurred. Please try again.",
      });
    }
  }

  // All models exhausted
  console.error("[chat] All Groq models failed. Last error:", lastError);
  return res.status(503).json({
    error: "The AI service is temporarily unavailable. Please try again in a moment.",
  });
}
