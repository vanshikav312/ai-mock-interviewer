import { NextResponse } from 'next/server';
import { countFillerWords, scoreAnswerLocally } from '@/lib/nlpScorer';
import { routeAI } from '@/lib/aiRouter';

const DEFAULT_EVALUATION = {
  score: 70,
  clarity: 70,
  technical: 70,
  relevance: 70,
  strengths: 'Good attempt at answering the question.',
  improvements: 'Review core concepts and practice more structured answers.',
  idealAnswer: 'Please try again when the AI service is available.',
  verdict: 'Average',
};

export async function POST(request) {
  try {
    const { role, question, answer } = await request.json();

    if (!role || !question || !answer) {
      return NextResponse.json(
        { error: 'Role, question, and answer are required' },
        { status: 400 }
      );
    }

    // NLP scoring runs locally — always works regardless of AI provider
    const { count: fillerCount, words: fillerWords } = countFillerWords(answer);
    const localScore = scoreAnswerLocally(answer, role);

    // Build evaluation prompt
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

    // routeAI: Gemini → Groq → hardcoded fallback (never throws)
    const raw = await routeAI(prompt);

    // Parse JSON — fall back to default if malformed
    let evaluation = DEFAULT_EVALUATION;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (parseErr) {
      console.warn('JSON parse failed for evaluation, using default:', parseErr.message);
    }

    return NextResponse.json({
      ...evaluation,
      fillerWordCount: fillerCount,
      fillerWords,
      localScore,
    });

  } catch (error) {
    console.error('Evaluate answer error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer', details: error.message },
      { status: 500 }
    );
  }
}
