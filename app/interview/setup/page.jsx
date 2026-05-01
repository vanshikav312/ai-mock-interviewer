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
          <h1 className="text-5xl md:text-6xl font-black text-luxury mb-4 tracking-tighter">Set your stage.</h1>
          <p className="text-muted text-lg font-medium">Configure your session for deep technical growth.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Config Card */}
          <div className="lg:col-span-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="soft-card p-10 !bg-[#0F3D2E] text-white">
              <RoleSelector config={config} setConfig={setConfig} />
            </div>
          </div>

          {/* Info & CTA Panel */}
          <div className="lg:col-span-4 space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="soft-card-elevated !bg-[#0F3D2E] p-8 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner border border-white/5 opacity-20">•</div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Session Summary</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                Your <span className="text-accent">{config.questionCount} question</span> session for <span className="text-accent">{config.role}</span> is ready.
              </p>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Estimated Intensity</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= (config.difficulty === 'Hard' ? 5 : config.difficulty === 'Medium' ? 3 : 1) ? 'bg-accent' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleStart} disabled={starting}
              className="w-full pill-btn bg-accent text-white py-6 text-xl shadow-soft hover:shadow-elevated hover:-translate-y-1 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
              {starting ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  Building...
                </>
              ) : 'Start Interview'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
