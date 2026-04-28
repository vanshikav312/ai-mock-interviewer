'use client';
import { useState, useEffect, Suspense } from 'react';
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
  const rawQas = params.get('qas');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (!rawQas) { setError('No interview data found.'); setLoading(false); return; }
    const allQAs = JSON.parse(decodeURIComponent(rawQas));
    fetch('/api/interview/final-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, allQAs }),
    })
      .then((r) => r.json())
      .then((data) => { setReport(data); setLoading(false); })
      .catch(() => { setError('Failed to generate report.'); setLoading(false); });
  }, [role, rawQas]);

  const handleSave = async () => {
    if (!report || saved) return;
    setSaving(true);
    try {
      const allQAs = JSON.parse(decodeURIComponent(rawQas));
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role, difficulty,
          questions: allQAs,
          overallScore: report.overallScore,
          grade: report.grade,
          hiringVerdict: report.hiringVerdict,
          finalReport: report,
        }),
      });
      setSaved(true);
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
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
          <p className="text-slate-300 font-medium">Here is your detailed performance report.</p>
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
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin shadow-[0_0_15px_rgba(20,141,141,0.5)]" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
