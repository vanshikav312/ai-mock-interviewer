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
    return NextResponse.json(
      { error: 'Failed to evaluate answer', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
