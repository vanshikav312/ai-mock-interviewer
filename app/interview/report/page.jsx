'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FinalReport from '@/components/interview/FinalReport';

function ReportContent() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const role = params.get('role') || 'Software Engineer';
  const difficulty = params.get('difficulty') || 'Medium';

  const [rawQas, setRawQas] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const autoSaveDone = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Read from sessionStorage on mount (must be inside useEffect — client only)
  useEffect(() => {
    const stored = sessionStorage.getItem('interviewQAs');
    if (stored) {
      setRawQas(stored);
    } else {
      setError('No interview data found.');
      setLoading(false);
    }
  }, []);

  // Generate report once rawQas is ready
  useEffect(() => {
    if (!rawQas) return;

    let allQAs;
    try {
      allQAs = JSON.parse(rawQas);
    } catch {
      setError('Invalid interview data.');
      setLoading(false);
      return;
    }

    // Strip extra fields to match MongoDB schema
    const cleanQAs = allQAs.map(({ question, answer, score, clarity, technical, relevance, verdict, idealAnswer, strengths, improvements, fillerWordCount }) => ({
      question: question || '',
      answer: answer || '',
      score: score || 0,
      clarity: clarity || 0,
      technical: technical || 0,
      relevance: relevance || 0,
      verdict: verdict || '',
      fillerWords: fillerWordCount || 0,
      idealAnswer: idealAnswer || '',
      strengths: strengths || '',
      improvements: improvements || '',
    }));

    fetch('/api/interview/final-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, allQAs }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        setReport(data);
        setLoading(false);

        // AUTO-SAVE — only once (ref prevents double-save in React StrictMode)
        if (autoSaveDone.current) return;
        autoSaveDone.current = true;

        setSaving(true);
        try {
          const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role,
              difficulty,
              questions: cleanQAs,
              overallScore: data.overallScore,
              grade: data.grade,
              hiringVerdict: data.hiringVerdict,
              finalReport: data,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            console.error('Auto-save failed:', err);
          } else {
            setSaved(true);
          }
        } catch (e) {
          console.error('Auto-save error:', e);
        } finally {
          setSaving(false);
        }
      })
      .catch(() => {
        setError('Failed to generate report.');
        setLoading(false);
      });
  }, [role, difficulty, rawQas]);

  // Manual save fallback (if auto-save failed)
  const handleSave = async () => {
    if (!report || saved || !rawQas) return;
    setSaving(true);
    try {
      const allQAs = JSON.parse(rawQas);
      const cleanQAs = allQAs.map(({ question, answer, score, clarity, technical, relevance, verdict, idealAnswer, strengths, improvements, fillerWordCount }) => ({
        question: question || '',
        answer: answer || '',
        score: score || 0,
        clarity: clarity || 0,
        technical: technical || 0,
        relevance: relevance || 0,
        verdict: verdict || '',
        fillerWords: fillerWordCount || 0,
        idealAnswer: idealAnswer || '',
        strengths: strengths || '',
        improvements: improvements || '',
      }));
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role, difficulty,
          questions: cleanQAs,
          overallScore: report.overallScore,
          grade: report.grade,
          hiringVerdict: report.hiringVerdict,
          finalReport: report,
        }),
      });
      if (res.ok) setSaved(true);
      else alert('Failed to save. Please try again.');
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading || (rawQas === null && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin shadow-[0_0_15px_rgba(20,141,141,0.5)]" />
        <p className="text-razor-accent font-bold tracking-wide animate-pulse">Generating your final report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <p className="text-red-400 text-xl font-bold">⚠️ {error}</p>
        <Link href="/interview/setup" className="bg-razor-peach hover:bg-razor-peach/90 text-razor-navy px-8 py-3.5 rounded-xl font-black shadow-lg shadow-razor-peach/20">
          Start New Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <nav className="border-b border-razor-teal bg-razor-navy/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🤖</span> AI <span className="text-razor-accent">Interviewer</span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm font-bold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center animate-slide-up">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Interview Complete! 🎉</h1>
          {saving && <p className="text-razor-accent text-sm font-bold animate-pulse mt-2">💾 Auto-saving your results...</p>}
          {saved && <p className="text-razor-green text-sm font-bold mt-2">✓ Results saved to your dashboard</p>}
          <p className="text-slate-300 font-medium mt-1">Here is your detailed performance report.</p>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <FinalReport
            report={report} role={role} difficulty={difficulty}
            onSave={handleSave} saving={saving} saved={saved}
          />
        </div>
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
