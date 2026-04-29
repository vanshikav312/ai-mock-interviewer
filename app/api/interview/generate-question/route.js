import { NextResponse } from 'next/server';
import { generateAllQuestions, generateQuestion } from '@/lib/gemini';
import { routeAI } from '@/lib/aiRouter';

const FALLBACK_QUESTIONS = [
  'Tell me about yourself and your technical background.',
  'What is your greatest technical strength?',
  'Describe a challenging technical problem you solved.',
  'Where do you see yourself in 5 years?',
  'Do you have any questions for us?',
];

export async function POST(request) {
  try {
    const { role, difficulty, previousQuestions, bulk, count } = await request.json();

    if (!role || !difficulty) {
      return NextResponse.json(
        { error: 'Role and difficulty are required' },
        { status: 400 }
      );
    }

    // BULK mode — generate all questions in one API call
    if (bulk === true) {
      const total = count || 5;
      try {
        const questions = await generateAllQuestions(role, difficulty, total);
        return NextResponse.json({ questions });
      } catch (bulkErr) {
        console.warn('Bulk generation failed, trying routeAI fallback…', bulkErr.message);
        // Fallback: use routeAI (Gemini → Groq → hardcoded)
        try {
          const prompt = `Generate exactly ${total} unique interview questions for a ${role} position at ${difficulty} difficulty. Return ONLY a valid JSON array of strings. No numbering, no explanation, no markdown. Example: ["Question 1?", "Question 2?"]`;
          const raw = await routeAI(prompt);
          const cleaned = raw.replace(/```json|```/g, '').trim();
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          const questions = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
          if (Array.isArray(questions) && questions.length > 0) {
            return NextResponse.json({ questions });
          }
        } catch (_) { /* fall through to hardcoded */ }
        // Last resort: hardcoded fallback questions
        return NextResponse.json({ questions: FALLBACK_QUESTIONS.slice(0, total) });
      }
    }

    // SINGLE mode — backward compatible
    const question = await generateQuestion(role, difficulty, previousQuestions || []);
    return NextResponse.json({ question });

  } catch (error) {
    console.error('Generate question error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
