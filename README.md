# AI Mock Interviewer

A production-grade AI mock interview platform with voice, streaming, multi-provider AI routing, NLP scoring, session integrity tracking, and persistent analytics.

**Live Demo → [ai-mock-interviewer-umber.vercel.app](https://ai-mock-interviewer-umber.vercel.app)**  
**GitHub → [github.com/vanshikav312/ai-mock-interviewer](https://github.com/vanshikav312/ai-mock-interviewer)**

> Voice features require **Chrome or Edge** browser.

---

## Why This Exists

Most interview prep tools are static flashcard apps. This is a full AI agent loop — it reads questions aloud, listens to your answers, streams live coaching hints, dynamically targets specific Job Descriptions, tracks session integrity to prevent cheating, evaluates your response across multiple dimensions using LLMs and local NLP, and gives you a hiring verdict with a 2-week improvement plan. Built end-to-end as a portfolio project demonstrating real-world AI engineering.

---

## Features

### Context-Aware Questioning
- **Job Description Targeting** — Users can paste a specific Job Description (JD) up to 2,000 characters before starting.
- **Dynamic Probing** — Gemini AI tailors its generation to strictly probe the candidate on the exact tools, requirements, and responsibilities mentioned in the JD.

### Session Integrity & Anti-Cheat
- **Tab Switch Detection** — Monitors the browser Visibility API to silently track lost focus. Warns the user, then automatically terminates the session after 3 violations.
- **Paste Tracking** — Intercepts clipboard events in the Answer Input to flag massive text dumps (30+ words).
- **Integrity Score** — The final report calculates a strict integrity score based on infractions, permanently logging flags on the final hiring verdict.

### Voice AI (Web Speech API — zero cost, zero API key)
- **Text-to-Speech** — AI interviewer reads every question aloud on load
- **Speech-to-Text** — mic button transcribes your spoken answer live into the textarea
- **Mute toggle** and **Replay button** on every question card
- Gracefully hidden on unsupported browsers (Firefox/Safari)

### Multi-Provider AI Routing (never crashes)
- **Primary**: Google Gemini 2.5 Flash Lite — best quality responses
- **Fallback**: Groq (Llama 3.3 70B) — auto-triggers on 429/503 errors
- **Last resort**: Hardcoded safe response — app works even if both providers fail
- This is how production AI systems handle reliability at scale

### Optimized API Quota (7 calls vs 15 before)
- **1 call upfront** — all questions generated at once, stored in browser state
- **1 call per answer** — real-time scorecard after each submission
- **1 final call** — only narrative text from AI; grade/verdict/strengths computed locally
- Questions still appear one at a time — user experience is identical

### Streaming Hints
- Click "Get Hint" → one-line coaching hint streams token-by-token via Gemini `generateContentStream()`
- No waiting for full response — starts appearing instantly

### 4-Dimension Answer Scoring
Every answer scored 0–100 across:
- **Overall** — composite quality
- **Clarity** — how well you communicated
- **Technical** — accuracy and depth
- **Relevance** — how directly you addressed the question

Plus local NLP: filler word detection (um, uh, like, basically...) and TF-IDF keyword scoring via `natural` npm package

### Final Report
- Grade (A/B/C/D) and hiring verdict — computed locally from scores (no extra API call)
- **Strong Hire / Hire / Maybe / No Hire**
- AI-written summary paragraph + personalized 2-week study plan
- Top 3 strengths from your best answers, critical gaps from your weakest

### Persistent Analytics Dashboard
- Total interviews, average score, personal best — across all sessions
- Performance trend line chart (Recharts)
- Last 5 sessions with role, score, date, verdict
- All data persists in MongoDB — survives logout, device change, anything

---

## Architecture

```text
User (Chrome / Edge)
         │
         ▼
Next.js 14 Frontend (App Router)
Landing · Login · Dashboard · Setup · Session · Report
         │
         ▼
Next.js API Routes (server-side — keys never reach browser)
┌────────────────────────────────────────────────────────┐
│  generate-question  evaluate-answer  hint-stream       │
│  final-report       sessions                           │
└────────────────────────────────────────────────────────┘
         │
    lib/aiRouter.js
    Gemini 2.5 Flash → Groq Llama 3.3 → Hardcoded fallback
         │
   ┌─────┼──────────────┐
   ▼     ▼              ▼
Gemini  Groq        MongoDB Atlas
Primary Fallback    Users · Sessions · Reports
         │
   ┌─────┴──────────────┐
   ▼                    ▼
lib/nlpScorer.js    Web Speech API
STT + TTS (browser native)
         │
         ▼
    NextAuth.js
Google OAuth + credentials
```

---

## 🎙️ Real-Time Audio Streaming Pipeline (Deepgram + WebSocket)

To provide an immersive, conversational interview experience, this app features a real-time, low-latency voice pipeline. Candidates speak into their microphone and see their transcripts update word-by-word on screen, mimicking live captioning.

### 1. Streaming Pipeline Architecture

```text
┌──────────┐ (Mic Audio) ┌──────────────┐ (Audio Chunks) ┌──────────────┐
│ Candidate│ ──────────> │ Node.js WS   │ ─────────────> │  Deepgram    │
│ Browser  │             │ Server (3001)│                │  Nova-2 STT  │
└──────────┘ <────────── └──────────────┘ <───────────── └──────────────┘
              (Interim &    (Port 3001)    (Authorization    (Cloud STT)
             Final JSON)                   Server-side Token)
```

1. **Audio Capture:** The browser captures microphone input using the `MediaRecorder` API and slices it into small binary chunks every `250ms` (using `audio/webm` with opus, falling back to other native container formats).
2. **WebSocket Gateway:** The binary chunks are streamed live over a secure WebSocket connection to our standalone Node.js server (`ws://localhost:3001`).
3. **Secure Bridge:** The Node server acts as a proxy, immediately forwarding these raw audio bytes to Deepgram's Live Streaming STT API over a secure server-to-server WebSocket (`wss://api.deepgram.com/v1/listen`).
4. **Credential Isolation:** The server-side proxy keeps the `DEEPGRAM_API_KEY` hidden from the client browser, completely eliminating exposure risks.
5. **Real-time Feedback:** Deepgram returns transcript packages. The Node server relays these back to the browser in a normalized JSON structure: `{ type: "interim" | "final", text: "..." }`.

### 2. Engineering Trade-offs & Architecture Choices

#### Why Streaming STT (Deepgram Nova-2) vs. Web Speech API vs. Whisper?
* **vs. Web Speech API (One-Shot):** The Web Speech API runs client-side and requires the user to stop talking before yielding a transcript, which destroys the flow of a natural conversation. It also has inconsistent browser support (Safari and Firefox do not support its STT well) and varies in accuracy based on the user's OS. Deepgram streams transcripts *while* the candidate is speaking with >95% accuracy and cross-browser consistency.
* **vs. OpenAI Whisper (REST API):** Whisper is primarily batch-based. Recording a 30-second response, saving it as a file, uploading it over HTTP, and waiting for the API response takes 3–5 seconds of latency. Deepgram Nova-2 is built for stream-based real-time audio with a sub-`300ms` response latency.

#### Why Standalone WebSocket Server vs. Next.js Custom Server vs. Route Handlers?
* **Route Handlers (Serverless API):** Next.js Route Handlers run in serverless functions (like Vercel). Serverless environments are stateless, do not support persistent TCP/WebSocket connections, and automatically time out after 10–60 seconds.
* **Custom Next.js Server (`server.js` wrapping `next`):** Bypassing Next.js's CLI by using a custom server disables automatic static optimization and is extremely difficult to deploy on platforms like Vercel.
* **Standalone Node WebSocket Server (Our Choice):** We run a lightweight Node server (`ws` library) on port `3001`. This keeps the Next.js frontend standard, allows easy containerized deployment of the WebSocket server (e.g. Render, Railway, DigitalOcean), and isolates real-time socket processing from Next.js page generation.

### 3. Handling Interim vs. Final Transcripts
To avoid UI flicker and browser cursor-jumping while typing or editing:
* **Interim Transcripts (`{ type: "interim", text: "..." }`):** These represent tentative guesses from Deepgram as the user is speaking. The hook updates an `interimText` state. The UI renders this text inside a separate, pulsing, semi-transparent bubble overlay.
* **Final Transcripts (`{ type: "final", text: "..." }`):** These occur when the user pauses (detected by Deepgram's `endpointing=300` setting). The server commits these sentences, appending them directly to the textarea `answer` state, and clears the interim buffer.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack SSR + API routes |
| Primary AI | Google Gemini 2.5 Flash Lite | Questions, evaluation, hints, reports |
| Fallback AI | Groq — Llama 3.3 70B | Auto-fallback, 1000 RPD free |
| Voice | Web Speech API | STT mic input + TTS question reader |
| Anti-Cheat | DOM & Clipboard APIs | Tracks tab switches and limits copy-pasting |
| NLP | natural + compromise | TF-IDF scoring, filler word detection |
| Auth | NextAuth.js | Google OAuth + email/password |
| Database | MongoDB Atlas + Mongoose | Persistent sessions and user data |
| Styling | Tailwind CSS | Glassmorphism design system |
| Charts | Recharts | Analytics dashboard |
| Hosting | Vercel | Auto-deploy on every git push |

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas (free tier) — [mongodb.com/atlas](https://mongodb.com/atlas)
- Gemini API key (free) — [aistudio.google.com](https://aistudio.google.com)
- Groq API key (free) — [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone https://github.com/vanshikav312/ai-mock-interviewer.git
cd ai-mock-interviewer
npm install
```

### 2. Environment Variables

Create `.env.local` in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ai-mock-interviewer

# Auth
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=http://localhost:3000

# AI — Primary
GEMINI_API_KEY=your-gemini-api-key

# AI — Fallback
GROQ_API_KEY=your-groq-api-key

# Google OAuth (optional — email login works without this)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> Generate `NEXTAUTH_SECRET`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

> Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome or Edge**.

---

## 🌐 Deploy to Vercel

```bash
npx vercel
```

1. Link to your GitHub repo when prompted — every `git push` auto-deploys after this
2. Add all `.env.local` vars in **Vercel Dashboard → Settings → Environment Variables**
3. Set `NEXTAUTH_URL` to your production URL e.g. `https://ai-mock-interviewer-umber.vercel.app`
4. MongoDB Atlas → **Network Access** → Add IP `0.0.0.0/0`
5. Google Cloud Console → add redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

---

## Project Structure

```text
ai-mock-interviewer/
├── app/
│   ├── (auth)/login/page.jsx
│   ├── (auth)/register/page.jsx
│   ├── dashboard/page.jsx
│   ├── interview/
│   │   ├── setup/page.jsx          ← JD targeting + Rules Box
│   │   ├── session/page.jsx        ← bulk questions, TTS, anti-cheat limits, useRef state
│   │   └── report/page.jsx         ← sessionStorage handoff, auto-save
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── auth/register/route.js
│       ├── interview/
│       │   ├── generate-question/route.js   ← bulk + single mode
│       │   ├── evaluate-answer/route.js     ← AI router + NLP
│       │   ├── hint-stream/route.js         ← Gemini streaming
│       │   └── final-report/route.js        ← local math + AI narrative
│       └── sessions/route.js
├── components/
│   ├── auth/AuthForm.jsx
│   ├── interview/
│   │   ├── RoleSelector.jsx
│   │   ├── QuestionCard.jsx        ← TTS replay + mute toggle
│   │   ├── AnswerInput.jsx         ← STT mic button + Paste Detection
│   │   ├── HintBox.jsx
│   │   ├── ScoreCard.jsx
│   │   └── FinalReport.jsx         ← Displays Integrity Score
│   └── dashboard/
│       ├── StatsGrid.jsx
│       └── PerformanceChart.jsx
├── hooks/
│   └── useSpeech.js                ← STT + TTS (Web Speech API)
├── lib/
│   ├── db.js                       ← MongoDB connection pooling
│   ├── gemini.js                   ← Gemini functions + withRetry
│   ├── aiRouter.js                 ← Gemini → Groq → hardcoded fallback
│   └── nlpScorer.js                ← TF-IDF + filler word detection
└── models/
    ├── User.js
    └── Session.js
```

---

## API Usage — Before vs After Optimization

| Metric | Before | After |
|---|---|---|
| API calls per 5-question session | 10–15 | **7** |
| Questions generated per API call | 1 | **5 (bulk)** |
| Final report AI calls | 1 full Gemini | **1 narrative only** |
| Grade / verdict computation | Gemini | **Local (instant, free)** |
| App when Gemini hits rate limit | ❌ Crashes | ✅ Routes to Groq |
| App when both providers down | ❌ Crashes | ✅ Safe fallback response |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/generate-question` | Bulk or single question generation |
| POST | `/api/interview/evaluate-answer` | Score via AI router + local NLP |
| POST | `/api/interview/hint-stream` | Stream coaching hint (Gemini) |
| POST | `/api/interview/final-report` | Local math + AI narrative |
| GET | `/api/sessions` | Fetch user's past sessions |
| POST | `/api/sessions` | Save completed session |

---

##  Key Engineering Decisions

**`sessionStorage` for report handoff** — passing all Q&A data as URL params caused HTTP 431 (headers too large). Switched to sessionStorage which handles any payload size.

**`useRef` for allQAs** — React's stale closure bug caused the last question's answer to be dropped from the final report. Using `useRef` instead of `useState` for the accumulating array fixed this.

**`withRetry` on Gemini calls** — reads the `retryDelay` header from Gemini's 429 response and waits exactly that long before retrying, instead of a blind exponential backoff.

**Local grade computation** — grade, verdict, topStrengths, and criticalGaps are all computed from already-available scores. Only the summary paragraph and nextSteps need an AI call, cutting final-report cost by ~70%.

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Speech-to-Text (mic) | ✅ | ✅ | ❌ | ❌ |
| Text-to-Speech (read aloud) | ✅ | ✅ | ✅ | ✅ |
| Core app (no voice) | ✅ | ✅ | ✅ | ✅ |

---

## What I Would Build Next

- Resume upload → auto-generate questions tailored to your CV
- Company-specific question banks (Razorpay, Google, Flipkart)
- Peer leaderboard — compare scores across users
- Interview session recording + playback
- WhatsApp bot for daily quick-practice sessions

---

## Author

**Vanshika**
- GitHub: [@vanshikav312](https://github.com/vanshikav312)
- LinkedIn: [Vanshika](https://www.linkedin.com/in/vanshikav731/)
---

## License

MIT — free to use, fork, and build upon.
