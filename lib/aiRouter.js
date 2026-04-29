import { callGeminiRaw } from '@/lib/gemini';

const FALLBACK_EVALUATION = JSON.stringify({
  score: 70,
  clarity: 70,
  technical: 70,
  relevance: 70,
  strengths: 'Good attempt at answering the question.',
  improvements: 'Review core concepts and practice more structured answers.',
  idealAnswer: 'Please try again when the AI service is available.',
  verdict: 'Average',
});

async function callGroqDirect(prompt) {
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
  const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : raw;
}

/**
 * Universal AI router: tries Gemini → Groq → hardcoded fallback.
 * Always returns a string, never throws.
 */
export async function routeAI(prompt) {
  // 1. Try Gemini
  try {
    return await callGeminiRaw(prompt);
  } catch (err) {
    console.warn('Gemini failed in routeAI, trying Groq…', err.status ?? err.message);
  }

  // 2. Try Groq
  try {
    return await callGroqDirect(prompt);
  } catch (err) {
    console.warn('Groq failed in routeAI, using hardcoded fallback…', err.message);
  }

  // 3. Hardcoded fallback — app never crashes
  return FALLBACK_EVALUATION;
}
