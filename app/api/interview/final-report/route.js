import { NextResponse } from 'next/server';
import { generateFinalReport } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { role, allQAs } = await request.json();

    if (!role || !allQAs || !Array.isArray(allQAs) || allQAs.length === 0) {
      return NextResponse.json(
        { error: 'Role and allQAs array are required' },
        { status: 400 }
      );
    }

    const report = await generateFinalReport(role, allQAs);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Final report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate final report' },
      { status: 500 }
    );
  }
}
