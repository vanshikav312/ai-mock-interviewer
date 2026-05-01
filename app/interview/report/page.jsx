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

  useEffect(() => {
    const stored = sessionStorage.getItem('interviewQAs');
    if (stored) {
      setRawQas(stored);
    } else {
      setError('No interview data found.');
      setLoading(false);
    }
  }, []);

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
          if (res.ok) setSaved(true);
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
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading || (rawQas === null && !error)) {
    return (
      <div className="min-h-screen bg-soft flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-luxury/10 border-t-luxury rounded-full animate-spin shadow-soft" />
        <div className="text-center space-y-2">
          <p className="text-luxury font-black tracking-widest text-xs uppercase animate-pulse">Distilling Insights...</p>
          <p className="text-muted text-sm font-medium italic opacity-60">"Generating your comprehensive technical breakdown."</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-soft flex flex-col items-center justify-center gap-8">
        <div className="text-6xl animate-float">⚠️</div>
        <p className="text-luxury text-2xl font-black tracking-tighter">{error}</p>
        <Link href="/interview/setup" className="pill-btn bg-luxury text-white px-10 py-4 shadow-soft hover:shadow-elevated transition-all">
          Restart Journey
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft selection:bg-luxury/10">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
        <div className="glass-panel px-8 py-4 rounded-pill flex items-center justify-between shadow-soft border border-depth/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <span className="font-black text-luxury tracking-tighter text-xl">AI Mock Interviewer</span>
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-luxury text-xs font-black uppercase tracking-widest transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-16 text-center animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-black text-luxury mb-4 tracking-tighter leading-tight">Mastery achieved.</h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            {saving && <span className="text-[10px] font-black text-accent uppercase tracking-widest animate-pulse">💾 Archiving Session...</span>}
            {saved && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ Successfully Vaulted</span>}
          </div>
          <p className="text-muted text-lg font-medium mt-4">Your detailed performance report is ready for review.</p>
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
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-luxury/20 border-t-luxury rounded-full animate-spin shadow-soft" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
