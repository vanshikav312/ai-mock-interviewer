# AI Mock Interviewer

 A production-grade AI mock interview platform with voice, streaming, multi-provider AI routing, NLP scoring, and persistent analytics.

**Live Demo → [ai-mock-interviewer-umber.vercel.app](https://ai-mock-interviewer-umber.vercel.app)**  
**GitHub → [github.com/vanshikav312/ai-mock-interviewer](https://github.com/vanshikav312/ai-mock-interviewer)**

> Voice features require **Chrome or Edge** browser.

---

## Why This Exists

Most interview prep tools are static flashcard apps. This is a full AI agent loop — it speaks questions aloud, listens to your answers, streams live coaching hints, evaluates your response across 4 dimensions using both LLM and local NLP, and gives you a hiring verdict with a 2-week improvement plan. Built end-to-end as a portfolio project demonstrating real-world AI engineering.

---

## Features

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

###  Optimized API Quota (7 calls vs 15 before)
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

###  Final Report
- Grade (A/B/C/D) and hiring verdict — computed locally from scores (no extra API call)
- **Strong Hire / Hire / Maybe / No Hire**
- AI-written summary paragraph + personalized 2-week study plan
- Top 3 strengths from your best answers, critical gaps from your weakest

###  Persistent Analytics Dashboard
- Total interviews, average score, personal best — across all sessions
- Performance trend line chart (Recharts)
- Last 5 sessions with role, score, date, verdict
- All data persists in MongoDB — survives logout, device change, anything

---

##  Architecture

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

##  Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack SSR + API routes |
| Primary AI | Google Gemini 2.5 Flash Lite | Questions, evaluation, hints, reports |
| Fallback AI | Groq — Llama 3.3 70B | Auto-fallback, 1000 RPD free |
| Voice | Web Speech API | STT mic input + TTS question reader |
| NLP | natural + compromise | TF-IDF scoring, filler word detection |
| Auth | NextAuth.js | Google OAuth + email/password |
| Database | MongoDB Atlas + Mongoose | Persistent sessions and user data |
| Styling | Tailwind CSS | Glassmorphism design system |
| Charts | Recharts | Analytics dashboard |
| Hosting | Vercel | Auto-deploy on every git push |

---

##  Quick Start

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

##  Project Structure

```text
ai-mock-interviewer/
├── app/
│   ├── (auth)/login/page.jsx
│   ├── (auth)/register/page.jsx
│   ├── dashboard/page.jsx
│   ├── interview/
│   │   ├── setup/page.jsx
│   │   ├── session/page.jsx        ← bulk questions, TTS, useRef state
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
│   │   ├── AnswerInput.jsx         ← STT mic button
│   │   ├── HintBox.jsx
│   │   ├── ScoreCard.jsx
│   │   └── FinalReport.jsx
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

##  API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/generate-question` | Bulk or single question generation |
| POST | `/api/interview/evaluate-answer` | Score via AI router + local NLP |
| POST | `/api/interview/hint-stream` | Stream coaching hint (Gemini) |
| POST | `/api/interview/final-report` | Local math + AI narrative |
| GET | `/api/sessions` | Fetch user's past sessions |
| POST | `/api/sessions` | Save completed session |

---

## ⚙️ Key Engineering Decisions

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

##  What I Would Build Next

- Resume upload → auto-generate questions tailored to your CV
- Company-specific question banks (Razorpay, Google, Flipkart)
- Peer leaderboard — compare scores across users
- Interview session recording + playback
- WhatsApp bot for daily quick-practice sessions

---

##  Author

**Vanshika**
- GitHub: [@vanshikav312](https://github.com/vanshikav312)
- LinkedIn: [Vanshika](https://www.linkedin.com/in/vanshikav731/)
---

##  License

MIT — free to use, fork, and build upon.
