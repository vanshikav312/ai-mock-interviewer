# AI Mock Interviewer

A production-grade, dual-service AI mock interview platform featuring a **LangGraph agentic loop**, **BM25-powered RAG retrieval**, real-time voice streaming via Deepgram WebSockets, multi-provider AI routing, session integrity tracking, and persistent analytics.

**Frontend Repository → [github.com/vanshikav312/ai-mock-interviewer](https://github.com/vanshikav312/ai-mock-interviewer)**  
**Backend RAG Service → [github.com/vanshikav312/ai-interview-service](https://github.com/vanshikav312/ai-interview-service)**

> Voice features require **Chrome or Edge** browser.

---

## Why This Exists

Most interview prep tools are static flashcard apps or simple prompt wrappers. This platform implements a production-ready **dual-server agentic architecture**:

- **Next.js Frontend** — Handles user experience, real-time audio socket bridging, and session persistence (MongoDB).
- **Python RAG Service (FastAPI + LangGraph)** — Orchestrates the interview conversation flow, retrieves JD-grounded context, and runs the evaluation/probing loop.
- **BM25 Retrieval** — Keyword-based retrieval over a curated technical interview corpus. Lightweight (2MB RAM) and fast — no GPU or embedding model required.
- **Deepgram WebSockets** — Streams live speech-to-text transcripts with <300ms latency.
- **Fail-Safe Fallbacks** — If the Python RAG service is unavailable, Next.js falls back to direct LLM evaluation so sessions never crash.

---

## System Architecture

```text
               ┌─────────────────────────────────────────────────────────┐
               │                     Browser Client                      │
               │  - Voice (Web Speech TTS + Deepgram Streaming Mic STT)  │
               │  - Anti-Cheat Guardrails (Visibility API & Clipboard)   │
               └─────────────────────────────────────────────────────────┘
                    │                                    ▲
          HTTPS/JSON│                        WSS Audio   │ Transcripts (JSON)
                    ▼                          Stream    ▼
┌──────────────────────────────┐                ┌────────────────────────┐
│  Next.js App (Vercel)        │                │ Node.js WebSocket Server│
│  - Auth (NextAuth + MongoDB) │                │ - Secure Proxy Bridge  │
│  - Session History           │                │ - Port 3001 Gateway    │
│  - Proxy: /api/interview/*   │                └────────────────────────┘
└──────────────────────────────┘                             │
        │                                                    │ WSS Audio Chunks
        │ POST /api/v1/session/*                             ▼
        ▼                                               ┌────────────────┐
┌──────────────────────────────┐                        │  Deepgram API  │
│  Python RAG Service (Render) │                        │  Nova-2 STT    │
│  - FastAPI + Uvicorn         │                        └────────────────┘
│  - LangGraph State Machine   │
│  - BM25 Retriever (68 Q's)   │
│  - Tavily Web Search Node    │
└──────────────────────────────┘
        │
        └──▶ Groq (Llama 3.3 70B)
```

---

## Key Features

### 1. LangGraph Agent Loop
The interview session runs as a stateful graph:
- **generate_questions** → RAG + web search to build a question bank
- **ask_question** → picks next question from bank
- **evaluate_answer** → RAG-grounded scoring against corpus rubric
- **ask_followup** → triggered when score < 50; probes the specific gap
- **generate_report** → computes final averages + hire recommendation

### 2. RAG — BM25 Retrieval
- **68-entry curated corpus** covering Frontend, Backend, and Data roles
- **BM25Okapi** (rank-bm25) with IDF-weighted absolute scoring
- **Grounding flag** — responses marked `grounded: true/false` based on whether a matching reference answer was found above the similarity threshold
- **Role + difficulty filtering** — retrieval scoped to candidate's target role

### 3. Real-Time Voice (Deepgram)
- Mic input streamed in 250ms binary chunks via `MediaRecorder`
- Node.js `ws` server on port 3001 securely proxies audio to Deepgram Nova-2
- Interim results show in a live pulsing bubble; final transcripts commit to the answer field

### 4. Session Integrity & Anti-Cheat
- **Tab switch detection** — warns after 1st violation, terminates after 3rd
- **Paste interception** — flags clipboard dumps over 30 words
- **Integrity Score /100** saved on the final report

### 5. Multi-Provider AI Routing
| Priority | Provider | Model |
|----------|----------|-------|
| Primary | Google Gemini | 2.5 Flash Lite |
| Fallback | Groq | Llama 3.3 70B |

Auto-routes on 429/503 errors from primary.

### 6. Analytics Dashboard
- Historical score trends via Recharts
- Final report: Grade, Hire Verdict, top strengths, critical gaps, 2-week improvement roadmap
- Session auto-saved to MongoDB Atlas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Python Backend | FastAPI + Uvicorn |
| Agentic Loop | LangGraph |
| RAG Retrieval | rank-bm25 (BM25Okapi) |
| Audio Gateway | Node.js + `ws` |
| Speech-to-Text | Deepgram Nova-2 |
| Text-to-Speech | Web Speech API |
| LLM Routing | Gemini 2.5 + Groq Llama 3.3 |
| Database | MongoDB Atlas + Mongoose |
| Analytics | Recharts |

---

## Project Structure

```text
ai-mock-interviewer/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── dashboard/page.jsx
│   ├── interview/
│   │   ├── setup/page.jsx          ← JD input + role/difficulty selector
│   │   ├── session/page.jsx        ← Live interview (TTS/STT, anti-cheat)
│   │   └── report/page.jsx         ← Scores, feedback, MongoDB save
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── interview/
│       │   ├── rag-session/route.js        ← Proxy to Python RAG service
│       │   ├── generate-question/route.js  ← Fallback question generator
│       │   ├── evaluate-answer/route.js    ← Fallback LLM scorer
│       │   ├── hint-stream/route.js        ← Streaming coaching hints
│       │   └── final-report/route.js       ← Report + narrative generator
│       └── sessions/route.js
├── components/
│   ├── interview/
│   │   ├── QuestionCard.jsx        ← Audio controls & follow-up badges
│   │   ├── AnswerInput.jsx         ← Live speech transcription overlay
│   │   ├── ScoreCard.jsx           ← 4-dimension scores display
│   │   └── FinalReport.jsx         ← Full report with integrity score
│   └── dashboard/
│       └── PerformanceChart.jsx    ← Recharts analytics
├── hooks/
│   └── useSpeech.js                ← Browser TTS/STT hooks
├── server.js                       ← Node.js WebSocket gateway (Deepgram)
└── models/
    ├── User.js
    └── Session.js
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (free tier)
- API keys: Groq, Deepgram, Gemini (optional), Tavily (optional)

### 1. Set Up the Python Backend

```bash
cd ai-interview-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `.env` in `ai-interview-service/`:
```env
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly_...
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Set Up the Next.js Frontend

```bash
cd ai-mock-interviewer
npm install
```

Create `.env.local`:
```env
# Database & Auth
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=http://localhost:3000

# AI APIs
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
DEEPGRAM_API_KEY=your-deepgram-key

# Services
PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Start all 3 servers in one command:
```bash
npm run dev:all
```

This runs concurrently:
- `Next.js` on port 3000
- `Node.js WebSocket gateway` on port 3001
- `Python RAG service` on port 8000

Open **http://localhost:3000** in Chrome or Edge.

---

## Production Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Next.js frontend | **Vercel** | Connect GitHub repo, auto-deploys |
| Python RAG backend | **Render.com** | Web Service, Python runtime |
| Node.js STT gateway | **Render.com** | Second Web Service, Node runtime |

### Vercel Environment Variables
```env
MONGODB_URI=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app
GEMINI_API_KEY=...
GROQ_API_KEY=...
DEEPGRAM_API_KEY=...
PYTHON_API_URL=https://your-rag-service.onrender.com   # not sensitive
NEXT_PUBLIC_WS_URL=wss://your-stt-gateway.onrender.com
```

### Render — Python RAG Service
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Env vars:** `GROQ_API_KEY`, `TAVILY_API_KEY`

### Render — Node WebSocket Gateway
- **Runtime:** Node
- **Start Command:** `node server.js`
- **Env vars:** `DEEPGRAM_API_KEY`, `PORT`

---

## License

MIT — free to use, fork, and build upon.
