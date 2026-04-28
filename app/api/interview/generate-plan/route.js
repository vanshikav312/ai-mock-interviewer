import { NextResponse } from 'next/server';
import { generateInterviewPlan } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { role, level } = await request.json();

    if (!role || !level) {
      return NextResponse.json(
        { error: 'Role and level are required' },
        { status: 400 }
      );
    }

    const plan = await generateInterviewPlan(role, level);

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Generate plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview plan' },
      { status: 500 }
    );
  }
}
