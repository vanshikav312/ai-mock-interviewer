# 🤖 AI Mock Interviewer

A full-stack AI-powered mock interview platform that simulates real technical interviews. Speak or type your answers, get instant AI feedback, stream live hints, and track your growth over time.

---

## Features

- **Voice AI** — speak your answers naturally, the AI interviewer reads questions aloud
- **Batch question generation** — all questions generated in one API call (saves quota)
- **Multi-provider AI** — Gemini 2.5 Flash Lite primary, Groq (Llama 3.3 70B) automatic fallback
- **Streaming hints** — live one-line coaching streamed token-by-token while you think
- **Multi-dimensional scoring** — clarity, technical depth, relevance, filler word detection
- **Hiring verdict** — Strong Hire / Hire / Maybe / No Hire with actionable next steps
- **Performance dashboard** — track scores over time with Recharts analytics
- **Auto-save to MongoDB** — every session saved and visible after logout/login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, JSX) |
| Primary AI | Google Gemini 2.5 Flash Lite |
| Fallback AI | Groq — Llama 3.3 70B (free, 1000 RPD) |
| Voice | Web Speech API (STT + TTS) |
| NLP | natural + compromise (local scoring, filler words) |
| Auth | NextAuth.js (Google OAuth + credentials) |
| Database | MongoDB Atlas + Mongoose |
| Styling | Tailwind CSS (glassmorphism design) |
| Charts | Recharts |

---

## Architecture

```
User (Browser)
      │
      ▼
Next.js 14 Frontend (App Router)
Login · Dashboard · Setup · Session · Report
      │
      ▼
Next.js API Routes (server-side only)
generate-question · evaluate-answer · hint-stream · final-report · sessions
      │
   ┌──┴──────────────────┬──────────────────────┐
   ▼                     ▼                      ▼
AI Router            NLP Layer             MongoDB Atlas
Gemini 2.5 Flash     nlpScorer.js          Users · Sessions
  → Groq fallback    TF-IDF keywords       Reports
  → hardcoded        Filler words
    fallback         Local pre-score
      │
   ┌──┴────────────────┐
   ▼                   ▼
NextAuth.js        Web Speech API
Google OAuth       SpeechRecognition (STT)
Credentials        SpeechSynthesis (TTS)
```

---

## AI Fallback Chain

The app never crashes due to AI failures:

```
Request
  │
  ▼
Gemini 2.5 Flash Lite (primary)
  │ fails (429/503)?
  ▼
Groq — Llama 3.3 70B (fallback, free 1000 RPD)
  │ fails?
  ▼
Hardcoded safe response (app always works)
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Google Gemini API key — [aistudio.google.com](https://aistudio.google.com) (free)
- Groq API key — [console.groq.com](https://console.groq.com) (free, no credit card)

### 1. Clone & Install

```bash
git clone https://github.com/vanshikav312/ai-mock-interviewer.git
cd ai-mock-interviewer
npm install
```

### 2. Environment Variables

Create `.env.local` in the root:

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

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **Where to get keys:**
> - Gemini → [aistudio.google.com](https://aistudio.google.com) — free, no credit card
> - Groq → [console.groq.com](https://console.groq.com) — free, no credit card
> - MongoDB → [mongodb.com/atlas](https://mongodb.com/atlas) — free 512MB tier
> - NEXTAUTH_SECRET → `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
> - Google OAuth → [console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth 2.0
>   Redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome or Edge** (required for Voice AI).

---

## Project Structure

```
ai-mock-interviewer/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── dashboard/page.jsx
│   ├── interview/
│   │   ├── setup/page.jsx
│   │   ├── session/page.jsx        ← bulk question fetch, TTS, ref-based state
│   │   └── report/page.jsx         ← sessionStorage handoff, auto-save
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── interview/
│       │   ├── generate-question/  ← bulk + single mode
│       │   ├── evaluate-answer/    ← routeAI (Gemini → Groq → fallback)
│       │   ├── hint-stream/        ← Gemini streaming
│       │   └── final-report/       ← local math + AI narrative
│       └── sessions/               ← GET/POST MongoDB sessions
├── components/
│   ├── auth/AuthForm.jsx
│   ├── interview/
│   │   ├── RoleSelector.jsx
│   │   ├── QuestionCard.jsx
│   │   ├── AnswerInput.jsx
│   │   ├── HintBox.jsx
│   │   ├── ScoreCard.jsx
│   │   └── FinalReport.jsx
│   └── dashboard/
│       ├── StatsGrid.jsx
│       └── PerformanceChart.jsx
├── lib/
│   ├── db.js                       ← MongoDB connection pooling
│   ├── gemini.js                   ← All AI functions + Groq fallback + withRetry
│   ├── aiRouter.js                 ← Universal AI router (Gemini → Groq → hardcoded)
│   └── nlpScorer.js                ← TF-IDF + filler word detection
├── models/
│   ├── User.js
│   └── Session.js
└── hooks/
    └── useSpeech.js                ← Web Speech API (STT + TTS)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/generate-question` | Bulk or single question generation |
| POST | `/api/interview/evaluate-answer` | Score answer via AI router + NLP |
| POST | `/api/interview/hint-stream` | Stream a coaching hint |
| POST | `/api/interview/final-report` | Local math + AI narrative report |
| GET | `/api/sessions` | Fetch user's past sessions |
| POST | `/api/sessions` | Save completed session to MongoDB |

---

## Key Optimizations

**Quota efficiency (saves ~4 Gemini calls per session):**
- All 5 questions generated in 1 API call (`bulk: true`)
- Final report grade/score/verdict computed locally — only summary/nextSteps use AI
- Retry logic reads Gemini's `retryDelay` header and waits exactly that long

**Reliability:**
- 3-tier AI fallback: Gemini → Groq → hardcoded response
- `sessionStorage` used to pass interview data to report page (avoids HTTP 431)
- `useRef` used for `allQAs` to prevent stale state on last question submission

---

## Deploy to Vercel

```bash
npx vercel
```

1. Add all `.env.local` variables in Vercel Dashboard → Settings → Environment Variables
2. Set `NEXTAUTH_URL` to your production URL
3. In MongoDB Atlas → Network Access → Add `0.0.0.0/0`

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Speech-to-Text | ✅ | ✅ | ❌ | ❌ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Core App | ✅ | ✅ | ✅ | ✅ |

Voice features require Chrome or Edge. The full app works on all modern browsers.

---

## Author

**Vanshika**
- GitHub: [@vanshikav312](https://github.com/vanshikav312)

---

## License

MIT
