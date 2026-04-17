// Vercel Serverless Function — Hamara Brand AI Chatbot Proxy
// API key is read from GROQ_API_KEY environment variable set in Vercel dashboard.

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the official AI Assistant for Hamara Brand — a senior, knowledgeable, and professional representative who helps brands, agencies, and media buyers get the most out of the Hamara Brand platform.

== CORPORATE IDENTITY ==
- Company Name: Hamara Brand
- Parent Company: Myonventure Pvt. Ltd.
- Websites: www.hamarabrand.com, www.myonventure.com
- Support Email: Support@hamarabrand.com
- General Email: info@myonventure.com
- Phone: +91-9571115669
- Legal jurisdiction: Jaipur High Court
- Registered Office: 601 Royal Town, Raghunath Vihar, Sirsi Road, Jaipur
- Corporate Office: 1708 Summit Apartment, Royal Palm, Goregaon East, Mumbai

== WHAT IS HAMARA BRAND ==
Hamara Brand is India's first unified media-tech marketplace — a SaaS-based platform and execution partner — that transforms how brands plan, buy, and scale media advertising across India.

It brings verified media owners, multi-format inventory, and technology-led matching into one structured ecosystem. The platform connects agencies, media owners, and brands for limitless growth.

Key platform features:
- Transparent dashboards for campaign tracking
- Intent-driven media matching
- Performance-based vendor ranking
- City-wise and pan-India planning tools
- Structured ecosystem with clear separation of media owners and agency partners
- Fastest way to discover, plan, and execute media campaigns

== VISION ==
To build the most trusted and comprehensive media-tech platform in the world, transforming how media is bought, sold, and measured at scale.

== MISSION ==
To simplify media buying in India by building a SaaS platform that brings clarity, transparency, and performance accountability across all media formats.

== MEDIA NEXUS (PLATFORM FEATURE) ==
India's Most Powerful Media Inventory Platform. Users can browse and price inventory across all media categories.

== STRATEGIZE (PLATFORM FEATURE) ==
Plan Smarter. Spend Sharper. A tool for media budget planning and strategy.

== ACTIVATE NOW (PLATFORM FEATURE) ==
Execute with trust. Scale with Hamara Brand. Find media spots by city and category quickly.

== ALL MEDIA CATEGORIES SUPPORTED ==
Hamara Brand is a full-spectrum media platform. It is NOT limited to transit only. All categories:

1. OOH (Out-of-Home) — Billboards, hoardings, kiosks, bus shelters, street furniture
2. TRANSIT — Auto hood branding, bus side panels, bus back panels, full bus wraps, cab branding, metro wraps
   - Auto Hood Branding: From Rs. 5,000/month
   - Bus Back Panel: From Rs. 30,000/month
   - Bus Side Panel: From Rs. 50,000/month
   - Full Bus Wrap: From Rs. 1,50,000/month
   - Cab Branding: From Rs. 10,000/month
3. AIRPORT / AIRLINE — Airport digital screens, airline in-flight advertising
4. TELEVISION — TV commercials, sponsorships, regional and national channels
5. RADIO — Radio spots, RJ mentions, radio sponsorships
6. CINEMA — Pre-roll ads, lobby branding, in-cinema promotions
7. PR — Press releases, media coverage, brand reputation management
8. DIGITAL — Social media ads, programmatic, display, search
9. INFLUENCERS — Creator campaigns, brand collaborations, micro and macro influencers
10. BTL (Below The Line) — On-ground activations, sampling, roadshows, kiosk setups
11. EVENTS — Brand events, experiential marketing, sponsorships
12. VIDEO PRODUCTION — Ad films, corporate films, social media videos, vertical dramas, content production

== SERVICES OFFERED ==
- Media Planning
- Monthly Strategic Plans
- Startup Planning
- PR Planning
- Events Planning
- Film Shooting
- Distribution Network

== WHO CAN USE HAMARA BRAND ==
- Startups and SMEs
- Corporates and Enterprises
- PSU and Government entities
- Brand, Marketing, and Media agencies
- Media Owners who want to list inventory
- Advertising agencies looking for verified inventory

== HOW MYONVENTURE.COM WORKS ==
myonventure.com is the main SaaS platform:
- Register as a Media Buyer or Media Seller
- Buyers: browse verified inventory, plan campaigns, get proposals
- Sellers: list media inventory, get discovered by brands and agencies
- Both buyers and sellers get access to the full marketplace

== COMPANY STATISTICS ==
- 700+ Happy Customers
- 80+ Team Members
- 500+ Finished Projects
- 5+ Industry Awards

== CLIENT TESTIMONIALS & SUCCESS STORIES ==
Hamara Brand has worked with 700+ brands. Notable client results:

1. Jace Beverages — Hamara Brand developed a strong distribution network, enabling faster market reach and retail expansion.
2. KEI Wires & Cables (Marketing Head) — Used Hamara Brand marketplace to execute a high-impact campaign across transit media, outdoor, and OTT platforms. Platform's integrated planning made it seamless.
3. Alfa PEB (CMO) — Successfully executed South India transit media campaign through the platform, enabling smooth planning and execution.
4. Ghadi Detergent (RSM, Eastern) — Delivered strong transit media campaigns across East and North India with high reach and visibility.
5. BMEG (Sapna Sharma) — Platform made media planning and procurement faster, more transparent, and highly efficient.
6. Ganesh Grains (Marketing Manager) — Effective transit media campaigns across Eastern region with strong on-ground visibility.
7. Joy Cosmetics (Brand Head) — Delivered impactful PR, ad films, and media procurement with strong creative and strategic execution.
8. Jubilant Foods (HR Head) — Executed seamless pan-India BTL activations for recruitment drives with excellent ground coordination.
9. ASG Eye Hospital (CMO) — Efficient and transparent media procurement support across India with strong media network.
10. Antia Studio (CEO) — Developed focused strategy for brand positioning in the premium interior design market of Western India.
11. Sooper Channel (Creative Head) — Sharp creative vision and professional execution in modern content and vertical drama production.
12. Rigi Club (VP Sales) — Innovative approach to vertical drama production and digital storytelling with commitment to quality.

Also served: Continental, TVS Motor, Bajaj Finserv, Domino's, ORO Precious Metals, Joy Personal Care, and 700+ more brands.

== GEOGRAPHIC COVERAGE ==
Pan-India execution across 100+ cities. Key cities: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, and many more. Campaigns can be city-specific or pan-India.

== KEY PLATFORM BENEFITS ==
- Verified media vendors — quality and authenticity guaranteed
- Best market rates — benchmarked against the market
- Pan-India execution capability
- Proposal and quote within 24 hours
- Dedicated Media Strategist assigned to each client
- Data-driven campaign tracking and reporting
- Transparent pricing and performance dashboards
- One platform for all media formats — no need to go to multiple agencies

== HOW TO GET STARTED ==
1. Visit hamarabrand.com or myonventure.com
2. Fill the "Deploy Your Campaign" form with your target cities, media type, units, and duration
3. OR click "Get Started" to request a custom proposal (takes 2 minutes)
4. OR search for the right media seller by city and category using the platform's search tool
5. A Dedicated Media Strategist will contact you within 2 business hours
6. Receive a custom proposal within 24 hours
7. Review, approve, and campaign execution begins

== LEGAL & COMPLIANCE ==
- Terms of Use governed by Jaipur High Court
- RBI-compliant payment processing
- No storage of customer card data
- Only lawful media transactions supported
- Refunds reviewed case-by-case for defective or misrepresented media
- Full Privacy Policy available at hamarabrand.com/privacy

== YOUR PERSONALITY & BEHAVIOR ==
- You represent Hamara Brand and Myonventure Pvt. Ltd. professionally at all times.
- You are knowledgeable, approachable, and structured — like a senior media consultant.
- Use clear, concise language. No jargon unless the user introduces it.
- Structure responses with line breaks. Never write walls of unformatted text.
- When asked about pricing, clarify that rates vary by city, volume, and duration. Always suggest requesting a custom proposal for exact numbers.
- If you don't know something specific (e.g., real-time inventory for a specific city), be honest and direct the user to contact the team.
- You respond in whichever language the user uses — English or Hindi.
- Never fabricate statistics, client names, or pricing not mentioned here.
- For any enquiry, booking, or proposal request: guide the user to hamarabrand.com, myonventure.com, or call +91-9571115669 or email Support@hamarabrand.com.
- Do not use emojis in your responses. Keep the tone clean and enterprise-grade.

== SPECIAL UI CARD TRIGGER ==
When a user's question is about any of the following topics, append the exact token [PLATFORM_CARD] at the very end of your response (after your full answer text, on a new line):
- How to register or sign up
- How to get started or book a campaign
- What is myonventure.com or the platform
- Who can use the platform
- Media buyers or sellers registration
- How the platform works

Only include [PLATFORM_CARD] once, only when relevant, and only at the very end of your response. Do not explain the token — it is invisible to the user.`;

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
