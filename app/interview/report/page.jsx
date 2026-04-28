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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">Generating your final report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-xl">{error}</p>
        <Link href="/interview/setup" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold">
          Start New Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-black text-white">
            AI <span className="text-purple-400">Interviewer</span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2">Interview Complete! 🎉</h1>
          <p className="text-slate-400">Here's your detailed performance report.</p>
        </div>
        <FinalReport
          report={report} role={role} difficulty={difficulty}
          onSave={handleSave} saving={saving} saved={saved}
        />
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
