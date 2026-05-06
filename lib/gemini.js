import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// ── Groq fallback — kicks in when Gemini hits rate limits ────────────────────
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');
  const { default: Groq } = await import('groq-sdk');
  const client = new Groq({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. When asked to return JSON, return ONLY valid JSON with no markdown, no explanation, no extra text.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });
  const raw = completion.choices[0].message.content.trim();
  // Extract JSON block in case model adds extra text
  const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : raw;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retries a Gemini call with exponential backoff on 429/503.
 * On final failure falls back to Groq if groqFallback is provided.
 */
async function withRetry(fn, groqFallback = null, maxAttempts = 2, baseDelayMs = 1500) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.httpErrorCode ?? err?.response?.status;
      const isRetryable = status === 503 || status === 429 ||
        err?.message?.includes('503') || err?.message?.includes('overloaded') ||
        err?.message?.includes('429') || err?.message?.includes('rate');

      if (!isRetryable) throw err;

      // On last attempt, try Groq fallback if available
      if (attempt === maxAttempts) {
        if (groqFallback) {
          console.warn('Gemini exhausted, falling back to Groq…');
          return await groqFallback();
        }
        throw err;
      }

      // Use Gemini's suggested retryDelay if present, else exponential backoff
      let delay = baseDelayMs * Math.pow(2, attempt - 1);
      try {
        const retryInfo = err?.errorDetails?.find(
          (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        if (retryInfo?.retryDelay) {
          const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
          if (!isNaN(seconds)) delay = seconds * 1000 + 500;
        }
      } catch (_) { /* ignore, use default delay */ }

      console.warn(`Gemini attempt ${attempt} failed (${status ?? err.message}). Retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/**
 * Raw Gemini call — used by aiRouter.
 * Throws on error so the router can catch and try next provider.
 */
export async function callGeminiRaw(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── OPTIMIZATION 1: Batch question generation ────────────────────────────────
/**
 * Generates ALL questions in ONE API call instead of one per question.
 * Saves (count - 1) Gemini requests per session.
 */
export async function generateAllQuestions(role, difficulty, count, jobDescription = '') {
  let contextBlock = '';
  if (jobDescription && jobDescription.trim().length > 20) {
    contextBlock = `
The candidate is applying for a role with this job description:
---
${jobDescription.trim()}
---
Generate questions that specifically target the skills, 
technologies, and requirements mentioned above.
Probe whether the candidate truly has the experience required.
At least 2 questions should reference specific technologies 
or responsibilities from the JD.
`;
  }

  const prompt = `You are a senior technical interviewer.
${contextBlock}
Generate exactly ${count} unique interview questions for a 
${role} position at ${difficulty} difficulty level.

Rules:
- Return ONLY a valid JSON array of strings
- No numbering, no explanation, no markdown, no backticks
- Each question must be different and non-repetitive
- Difficulty guide:
    Easy: fundamentals and basic concepts
    Medium: practical problem-solving  
    Hard: system design and advanced concepts
- For Hard difficulty include at least 1 system design question

Example format: ["Question one?", "Question two?", "Question three?"]`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  const text = (result.response ? result.response.text() : result).trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Expected array of questions');
  return parsed;
}

// ── Keep old single-question function as fallback ────────────────────────────
export async function generateQuestion(role, difficulty, previousQuestions = []) {
  const prevList = previousQuestions.length
    ? `Previously asked questions (do NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : 'No previous questions yet.';

  const prompt = `You are a senior technical interviewer at a top tech company.
Generate ONE interview question for a ${role} position at ${difficulty} difficulty level.
${prevList}

Rules:
- Return ONLY the question text, nothing else
- No numbering, no preamble, no explanation
- Make it specific, realistic, and appropriate for ${difficulty} level
- For Hard: ask about system design or advanced concepts
- For Medium: ask about practical problem-solving
- For Easy: ask about fundamentals and basic concepts`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  return (result.response ? result.response.text() : result).trim();
}

export async function evaluateAnswer(role, question, answer) {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Evaluate the answer and return ONLY a valid JSON object with this exact structure:
{
  "score": <number 0-100>,
  "clarity": <number 0-100>,
  "technical": <number 0-100>,
  "relevance": <number 0-100>,
  "strengths": "<what the candidate did well>",
  "improvements": "<specific areas to improve>",
  "idealAnswer": "<a comprehensive ideal answer>",
  "verdict": "<one of: Excellent, Good, Average, Needs Work>"
}

Scoring guide:
- score: overall quality of the answer
- clarity: how clearly the candidate communicated
- technical: accuracy and depth of technical content
- relevance: how well the answer addressed the question

Return ONLY the JSON, no markdown, no explanation.`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  const text = (result.response ? result.response.text() : result).trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateInterviewPlan(role, level) {
  const prompt = `Create a structured interview preparation plan for a ${role} position at ${level} level.
Return ONLY a valid JSON object with this structure:
{
  "sections": [
    { "title": "<topic>", "description": "<what to study>", "resources": ["<resource1>", "<resource2>"] }
  ],
  "tips": ["<tip1>", "<tip2>", "<tip3>", "<tip4>", "<tip5>"]
}
Return ONLY the JSON, no markdown, no explanation.`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  const text = (result.response ? result.response.text() : result).trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function streamHint(role, question, partialAnswer) {
  const prompt = `You are a helpful interview coach.
Role: ${role}
Question: ${question}
Candidate's partial answer so far: ${partialAnswer || '(nothing typed yet)'}

Give ONE short, helpful hint (1 sentence max) to guide the candidate without giving away the full answer.
Be encouraging and specific. Do not repeat the question.`;

  const streamResult = await model.generateContentStream(prompt);

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return readableStream;
}

// ── OPTIMIZATION 2: Lightweight narrative-only report generation ──────────────
/**
 * Generates only the narrative parts of the report (summary, nextSteps, studyTopics).
 * Grade, score, verdict are computed locally in the API route — no AI needed for math.
 */
export async function generateReportNarrative(role, overallScore, grade, hiringVerdict, topStrengths, criticalGaps) {
  const prompt = `You are a senior hiring manager giving feedback after a mock interview.

Role: ${role}
Overall Score: ${overallScore}/100
Grade: ${grade}
Hiring Verdict: ${hiringVerdict}
Top Strengths: ${topStrengths.join(', ')}
Critical Gaps: ${criticalGaps.join(', ')}

Return ONLY a valid JSON object with exactly these three fields:
{
  "summary": "<2-3 sentence overall assessment of the candidate's performance>",
  "nextSteps": "<what to do in the next 2 weeks to improve, 3-4 sentences>",
  "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"]
}

Return ONLY the JSON, no markdown, no explanation.`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  const text = (result.response ? result.response.text() : result).trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// Keep old full report function untouched
export async function generateFinalReport(role, allQAs) {
  const qaText = allQAs
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/100\nVerdict: ${qa.verdict}`)
    .join('\n\n');

  const avgScore = Math.round(allQAs.reduce((sum, qa) => sum + qa.score, 0) / allQAs.length);

  const prompt = `You are a senior hiring manager reviewing a mock interview for a ${role} position.

Interview Summary:
${qaText}

Average Score: ${avgScore}/100

Generate a comprehensive final report as ONLY a valid JSON object with this structure:
{
  "overallScore": <number 0-100>,
  "grade": "<A, B, C, or D>",
  "summary": "<2-3 sentence overall assessment paragraph>",
  "topStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "criticalGaps": ["<gap1>", "<gap2>", "<gap3>"],
  "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"],
  "hiringVerdict": "<one of: Strong Hire, Hire, Maybe, No Hire>",
  "nextSteps": "<what to do in the next 2 weeks to improve, 3-4 sentences>"
}

Grade scale: A=85-100, B=70-84, C=50-69, D=below 50
Return ONLY the JSON, no markdown, no explanation.`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    async () => callGroq(prompt)
  );
  const text = (result.response ? result.response.text() : result).trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
