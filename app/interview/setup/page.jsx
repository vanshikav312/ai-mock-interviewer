'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleSelector from '@/components/interview/RoleSelector';

export default function SetupPage() {
  const { status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState({
    role: 'Software Engineer',
    difficulty: 'Medium',
    questionCount: 5,
  });
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const handleStart = () => {
    setStarting(true);
    const params = new URLSearchParams({
      role: config.role,
      difficulty: config.difficulty,
      count: config.questionCount,
    });
    router.push(`/interview/session?${params.toString()}`);
  };

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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10 text-center animate-slide-up">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Configure Interview ⚙️</h1>
          <p className="text-slate-300 font-medium">Customize your practice session.</p>
        </div>

        <div className="glass-panel p-8 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <RoleSelector config={config} setConfig={setConfig} />
        </div>

        <div className="bg-razor-teal/30 border border-razor-accent/30 rounded-2xl p-6 mb-8 flex items-center gap-5 shadow-inner backdrop-blur-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="w-14 h-14 bg-razor-navy/50 border border-razor-teal rounded-xl flex items-center justify-center text-3xl shadow-inner">📋</div>
          <div>
            <p className="text-white font-bold text-lg mb-1">
              {config.questionCount} {config.role} questions • {config.difficulty}
            </p>
            <p className="text-razor-green font-medium text-sm">⏱️ Estimated time: ~{config.questionCount * 3} minutes</p>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button onClick={handleStart} disabled={starting}
            className="w-full bg-razor-peach hover:bg-razor-peach/90 disabled:opacity-50 disabled:cursor-not-allowed text-razor-navy font-black text-xl py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 transform hover:-translate-y-1">
            {starting ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-razor-navy/30 border-t-razor-navy rounded-full animate-spin" />
                Preparing Environment...
              </span>
            ) : '🚀 Start Interview Now'}
          </button>
        </div>
      </main>
    </div>
  );
}
