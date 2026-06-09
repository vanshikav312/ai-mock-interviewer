# AI Mock Interviewer

A production-grade, dual-service AI mock interview platform featuring a LangGraph agent loop, local RAG retrieval, real-time voice streaming via Deepgram WebSockets, multi-provider AI routing, session integrity tracking, and persistent analytics.

**Live Demo → [ai-mock-interviewer-umber.vercel.app](https://ai-mock-interviewer-umber.vercel.app)**  
**Frontend Repository → [github.com/vanshikav312/ai-mock-interviewer](https://github.com/vanshikav312/ai-mock-interviewer)**  
**Backend RAG Service → [github.com/vanshikav312/ai-interview-service](https://github.com/vanshikav312/ai-interview-service)**

> Voice features require **Chrome or Edge** browser.

---

## Why This Exists

Most interview prep tools are static flashcard apps or simple prompt wrappers. This platform implements a production-ready **dual-server agentic architecture**:
- **Next.js Frontend (React/Node.js)**: Handles user experience, real-time audio socket bridging, and database persistence (MongoDB).
- **Python RAG Service (FastAPI/LangGraph/ChromaDB)**: Orchestrates the conversation flow, extracts job-description-grounded contexts, and runs the evaluation/probing loop.
- **Deepgram WebSockets**: Streams live speech-to-text transcripts with <300ms latency.
- **Fail-Safe Fallbacks**: Ensures uninterrupted service by falling back to local client-side and direct-API modes if the Python service or primary LLM providers experience downtime.

---

## System Architecture

```text
               ┌─────────────────────────────────────────────────────────┐
               │                     Browser Client                      │
               │  - Voice (Web Speech TTS + Deepgram Streaming Mic STT)   │
               │  - Anti-Cheat Guardrails (Visibility API & Clipboards)  │
               └─────────────────────────────────────────────────────────┘
                    │                                    ▲
          HTTPS/JSON│                        WSS Audio   │ Transcripts (JSON)
                    ▼                          Stream    ▼
┌──────────────────────────────┐                ┌────────────────────────┐
│  Next.js App Server (Vercel) │                │ Node WebSocket Server  │
│  - User/Auth Management      │                │ - Secure Proxy Bridge  │
│  - MongoDB Session History   │                │ - Port 3001 Gateway    │
│  - Route Handlers & Fallback │                └────────────────────────┘
└──────────────────────────────┘                             │
        │                                                    │ WSS Audio Chunks
        │ POST /api/v1/session                               ▼
        ▼                                               ┌────────────────┐
┌──────────────────────────────┐                        │  Deepgram API  │
│  Python RAG Service (Render) │                        │  Nova-2 STT    │
│  - FastAPI Endpoints         │                        └────────────────┘
│  - LangGraph State Machine   │
│  - Chroma Vector DB          │
└──────────────────────────────┘
        │
        ├── RAG Rubrics & Grounding
        ▼
 ┌──────────────┐
 │ Gemini / Groq│
 └──────────────┘
```

---

## Key Features

### 1. LangGraph Agent Loop (`ai-interview-service`)
The interview conversation is structured as a state graph using **LangGraph**:
- **Topic Control**: Progresses through core concepts logically.
- **Dynamic Probing**: If a candidate provides a weak or incomplete answer, the graph automatically triggers a custom **follow-up node** to query the candidate's gaps in detail before moving to the next main topic.
- **Context Grounding**: Evaluates the candidate's answers using retrieved corpus rubrics, marking responses as `Fact-Grounded` directly from verified technical sources.

### 2. Retrieval-Augmented Generation (RAG)
- **ChromaDB Integration**: Embedded locally using `all-MiniLM-L6-v2` dense vectors.
- **JD Targeting**: Analyzes user-pasted Job Descriptions and retrieves contextually relevant questions and reference answers from the local interview corpus.
- **Dynamic Matching**: Automatically filters retrieved questions based on the candidate's target role (Frontend, Backend, Data Science) and difficulty level.

### 3. Real-Time Audio Streaming (Deepgram WebSockets)
- **Direct Streaming**: Streams mic input live in `250ms` binary chunks via browser `MediaRecorder` API.
- **Proxy Gateway**: Runs a dedicated Node.js `ws` server on port `3001` that secure-proxies raw audio bytes to Deepgram's Live Streaming API, hiding `DEEPGRAM_API_KEY` from the browser.
- **Interim & Final Feedback**: Displays real-time interim results in a pulsing bubble, committing finalized sentences to the input block as soon as natural pauses are detected.

### 4. Session Integrity & Anti-Cheat
- **Tab Switch Detection**: Monitors focus changes. Warns the candidate, and terminates the session after 3 violations.
- **Paste Interception**: Intercepts clipboard events to flag massive text dumps (30+ words).
- **Integrity Score**: Logs infraction details and computes a final `Integrity Score / 100` that is permanently saved on the report.

### 5. Multi-Provider AI Routing & Fallbacks
- **Primary**: Google Gemini 2.5 Flash Lite — high performance.
- **Secondary Fallback**: Groq (Llama 3.3 70B) — auto-routes on Gemini rate limits (429/503).
- **Python API Guardrail**: If the Python RAG backend goes offline, the Next.js server automatically falls back to standard LLM evaluation so user sessions never crash.

### 6. Analytics Dashboard & Reports
- **Performance Trends**: Tracks historical scores with interactive charts (Recharts).
- **Comprehensive Final Reports**: Grade (A/B/C/D), Hiring Verdict (Strong Hire, Hire, Maybe, No Hire), AI summary, top strengths, critical gaps, and a personalized 2-week roadmap.
- **Security Vaulting**: Automatically or manually archives session details to MongoDB Atlas.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | React server components, route handlers |
| **Python Backend** | FastAPI + Uvicorn | High-performance Python backend |
| **Agentic Loop** | LangGraph | Complex conversation flow/follow-up graph |
| **Vector Database** | ChromaDB | Persistent local semantic vector index |
| **Audio Gateway** | Node.js + `ws` | Secure server WebSocket bridge |
| **Speech-to-Text** | Deepgram Nova-2 | Streaming real-time STT |
| **Text-to-Speech** | Web Speech API | Native browser reading |
| **AI LLM Routing** | Gemini 2.5 + Groq Llama 3.3 | Smart routing with retry & backoff |
| **Database** | MongoDB Atlas + Mongoose | User profiles and session history |
| **Analytics Charts** | Recharts | Performance trends |

---

## Project Directory Structures

### 1. Next.js Frontend (`ai-mock-interviewer`)
```text
ai-mock-interviewer/
├── app/
│   ├── (auth)/login/page.jsx
│   ├── (auth)/register/page.jsx
│   ├── dashboard/page.jsx
│   ├── interview/
│   │   ├── setup/page.jsx          ← JD targeting + Rules Box
│   │   ├── session/page.jsx        ← Conversation interface, TTS/STT hooks, anti-cheat limits
│   │   └── report/page.jsx         ← Performance summary cards + MongoDB auto-saving
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── interview/
│       │   ├── generate-question/route.js   ← Fallback question generator
│       │   ├── evaluate-answer/route.js     ← Fallback direct LLM scorer
│       │   ├── hint-stream/route.js         ← Streaming coaching tips
│       │   ├── final-report/route.js        ← Locally-computed metrics + narrative generator
│       │   └── rag-session/route.js         ← Proxy to Python RAG service
│       └── sessions/route.js
├── components/
│   ├── interview/
│   │   ├── QuestionCard.jsx        ← Audio controls & AI follow-up badges
│   │   ├── AnswerInput.jsx         ← Live speech transcription overlay
│   │   ├── ScoreCard.jsx           ← 4-Dimension granular scores
│   │   └── FinalReport.jsx         ← Performance stats & Integrity score
│   └── dashboard/
│       └── PerformanceChart.jsx    ← Recharts analytics
├── hooks/
│   └── useSpeech.js                ← Browser TTS/STT hooks
├── server.js                       ← Node.js WebSocket gateway for Deepgram
└── models/
    ├── User.js
    └── Session.js
```

### 2. Python Backend (`ai-interview-service`)
```text
ai-interview-service/
├── data/
│   └── interview_corpus.json       ← Question rubrics and baseline answers
├── graph/
│   ├── state.py                    ← Graph structure definition
│   └── workflow.py                 ← LangGraph orchestration loop
├── rag/
│   ├── corpus_loader.py            ← ChromaDB setup and data ingestion
│   ├── retriever.py                ← Semantic queries
│   └── web_retriever.py            ← Tavily web search synthesis
├── routers/
│   └── session.py                  ← FastAPI session & answer endpoints
├── main.py                         ← Application bootstrap
└── requirements.txt                ← Dependencies configuration
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (free tier)
- Gemini API Key
- Groq API Key
- Deepgram API Key

### 1. Set Up the Python Backend
1. Navigate to the backend directory and set up a virtual environment:
   ```bash
   cd ai-interview-service
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file:
   ```env
   GROQ_API_KEY=your-groq-key
   TAVILY_API_KEY=your-tavily-key
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Set Up the Next.js Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ai-mock-interviewer
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   # DB & Auth
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=your-32-character-secret
   NEXTAUTH_URL=http://localhost:3000

   # APIs
   GEMINI_API_KEY=your-gemini-key
   GROQ_API_KEY=your-groq-key
   DEEPGRAM_API_KEY=your-deepgram-key

   # Services
   PYTHON_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```
3. Run both the Next.js app and the WebSocket gateway simultaneously:
   ```bash
   npm run dev:all
   ```

Open **`http://localhost:3000`** in Chrome or Edge to run through the full integrated pipeline!

---

## Production Deployment

This project is optimized for deployment across:
- **Vercel** (Frontend Next.js app)
- **Render** (Python Backend Web Service & Node.js WebSocket Gateway)

For detailed deployment instructions, including setup options, persistent directories, and live WebSocket routing, refer to the [Production Deployment Guide](file:///C:/Users/Dell/.gemini/antigravity-ide/brain/03a30cd8-e9b7-4f87-818f-c9b67f5808ba/deployment_guide.md).

---

## License

MIT — free to use, fork, and build upon.
