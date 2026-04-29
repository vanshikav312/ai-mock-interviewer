import { NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/gemini';
import { countFillerWords, scoreAnswerLocally } from '@/lib/nlpScorer';

export async function POST(request) {
  try {
    const { role, question, answer } = await request.json();

    if (!role || !question || !answer) {
      return NextResponse.json(
        { error: 'Role, question, and answer are required' },
        { status: 400 }
      );
    }

    // Run NLP scoring locally first
    const { count: fillerCount, words: fillerWords } = countFillerWords(answer);
    const localScore = scoreAnswerLocally(answer, role);

    // Run Gemini evaluation
    const evaluation = await evaluateAnswer(role, question, answer);

    // Merge results
    const result = {
      ...evaluation,
      fillerWordCount: fillerCount,
      fillerWords,
      localScore,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Evaluate answer error:', error);
    const status = error?.status ?? error?.httpErrorCode ?? error?.response?.status;
    const isOverloaded = status === 503 || status === 429 ||
      error?.message?.includes('503') || error?.message?.includes('overloaded');

    return NextResponse.json(
      { error: isOverloaded ? 'AI service overloaded' : 'Failed to evaluate answer', details: error.message },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
