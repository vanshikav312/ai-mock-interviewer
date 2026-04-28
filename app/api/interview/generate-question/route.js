import { NextResponse } from 'next/server';
import { generateQuestion } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { role, difficulty, previousQuestions } = await request.json();

    if (!role || !difficulty) {
      return NextResponse.json(
        { error: 'Role and difficulty are required' },
        { status: 400 }
      );
    }

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
