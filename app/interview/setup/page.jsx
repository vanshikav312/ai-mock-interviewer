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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white mb-3">Configure Your Interview</h1>
          <p className="text-slate-400">Choose your role, difficulty, and number of questions.</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 mb-8">
          <RoleSelector config={config} setConfig={setConfig} />
        </div>

        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="text-3xl">📋</div>
          <div>
            <p className="text-white font-semibold">
              {config.questionCount} {config.role} questions · {config.difficulty} difficulty
            </p>
            <p className="text-slate-400 text-sm">Estimated time: ~{config.questionCount * 3} minutes</p>
          </div>
        </div>

        <button onClick={handleStart} disabled={starting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-900/50">
          {starting ? 'Starting...' : 'Start Interview →'}
        </button>
      </main>
    </div>
  );
}
