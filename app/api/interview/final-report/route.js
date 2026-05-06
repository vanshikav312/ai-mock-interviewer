import { NextResponse } from 'next/server';
import { generateReportNarrative } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { role, allQAs, tabSwitches, pasteDetected } = await request.json();

    if (!role || !allQAs || !Array.isArray(allQAs) || allQAs.length === 0) {
      return NextResponse.json(
        { error: 'Role and allQAs array are required' },
        { status: 400 }
      );
    }

    // ── Compute everything locally — no AI needed for math ───────────────────
    const overallScore = Math.round(
      allQAs.reduce((sum, qa) => sum + (qa.score || 0), 0) / allQAs.length
    );

    const grade =
      overallScore >= 85 ? 'A' :
      overallScore >= 70 ? 'B' :
      overallScore >= 50 ? 'C' : 'D';

    const hiringVerdict =
      overallScore >= 85 ? 'Strong Hire' :
      overallScore >= 70 ? 'Hire' :
      overallScore >= 50 ? 'Maybe' : 'No Hire';

    // Top 3 QAs by score → extract strengths
    const sorted = [...allQAs].sort((a, b) => (b.score || 0) - (a.score || 0));
    const topStrengths = sorted
      .slice(0, 3)
      .map((qa) => qa.strengths || 'Demonstrated understanding of the topic')
      .filter(Boolean);

    // Bottom 3 QAs by score → extract improvements
    const criticalGaps = sorted
      .slice(-3)
      .reverse()
      .map((qa) => qa.improvements || 'Review core concepts')
      .filter(Boolean);

    // ── One Gemini/Groq call for narrative only ─────────────────────────────
    let narrative = {
      summary: `The candidate scored ${overallScore}/100 (${grade}) in this ${role} interview.`,
      nextSteps: 'Focus on the critical gaps identified and practice regularly. Review the study topics and work on structured answers.',
      studyTopics: criticalGaps.slice(0, 4).map(g => g.split(' ').slice(0, 4).join(' ')),
    };
    try {
      narrative = await generateReportNarrative(
        role, overallScore, grade, hiringVerdict, topStrengths, criticalGaps
      );
    } catch (narrativeErr) {
      console.warn('Narrative generation failed, using local fallback:', narrativeErr.message);
    }

    // ── Compute integrity score ─────────────────────────────────────────────
    const tabSwitchCount = parseInt(tabSwitches || '0', 10);
    const hadPaste = pasteDetected === true || pasteDetected === 'true';
    
    let integrityScore = 100;
    integrityScore -= tabSwitchCount * 15;
    if (hadPaste) integrityScore -= 20;
    integrityScore = Math.max(0, integrityScore);

    let integrityLabel = '';
    if (integrityScore === 100) integrityLabel = '✅ Clean';
    else if (integrityScore >= 75) integrityLabel = '⚠️ Minor Flags';
    else if (integrityScore >= 50) integrityLabel = '⚠️ Flagged';
    else integrityLabel = '🚨 Integrity Warning';

    const integrityDetails = [];
    if (tabSwitchCount > 0) {
      integrityDetails.push(
        `${tabSwitchCount} tab switch${tabSwitchCount > 1 ? 'es' : ''} detected`
      );
    }
    if (hadPaste) {
      integrityDetails.push('Large paste detected in one or more answers');
    }

    // ── Merge and return ─────────────────────────────────────────────────────
    return NextResponse.json({
      overallScore,
      grade,
      hiringVerdict,
      topStrengths,
      criticalGaps,
      summary: narrative.summary,
      nextSteps: narrative.nextSteps,
      studyTopics: narrative.studyTopics,
      integrityScore,
      integrityLabel,
      integrityDetails,
    });

  } catch (error) {
    console.error('Final report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate final report' },
      { status: 500 }
    );
  }
}
