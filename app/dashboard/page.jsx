'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const VERDICT_COLORS = {
  'Strong Hire': 'text-razor-green bg-razor-green/10', 
  'Hire': 'text-blue-400 bg-blue-400/10',
  'Maybe': 'text-razor-peach bg-razor-peach/10', 
  'No Hire': 'text-red-400 bg-red-400/10',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sessions')
        .then((r) => r.json())
        .then((d) => { setSessions(d.sessions || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-razor-accent border-t-transparent rounded-full animate-spin" />
          <div className="text-razor-accent font-medium animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="min-h-screen animate-fade-in">
      <nav className="border-b border-razor-teal bg-razor-navy/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🤖</span> AI <span className="text-razor-accent">Interviewer</span>
          </Link>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 bg-razor-teal/30 px-3 py-1.5 rounded-full border border-razor-teal">
              <span className="text-sm">👤</span>
              <span className="text-slate-200 text-sm font-medium">{session?.user?.name}</span>
            </div>
            <Link href="/interview/setup"
              className="bg-razor-accent hover:bg-razor-accent/80 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-razor-accent/20">
              + New Interview
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-400 hover:text-razor-peach text-sm font-medium transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Welcome back, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-300 font-medium">Here is your interview performance overview.</p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatsGrid sessions={sessions} />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <PerformanceChart sessions={sessions} />
        </div>

        <div className="glass-panel rounded-2xl p-7 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <span>📋</span> Recent Sessions
            </h2>
            <Link href="/interview/setup"
              className="text-razor-accent hover:text-razor-green text-sm font-bold transition-colors">
              View All →
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-16 bg-razor-navy/30 rounded-2xl border border-razor-teal/30">
              <div className="text-6xl mb-5">🎯</div>
              <p className="text-slate-300 font-medium mb-6">No interviews yet. Start your first one!</p>
              <Link href="/interview/setup"
                className="bg-razor-peach hover:bg-razor-peach/90 text-razor-navy font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-razor-peach/20 transform hover:-translate-y-1 inline-block">
                🚀 Start Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((s) => (
                <div key={s._id}
                  className="flex items-center justify-between bg-razor-navy/40 border border-razor-teal/50 rounded-xl px-6 py-5 hover:bg-razor-teal/40 transition-all hover:border-razor-accent/40 shadow-sm group">
                  <div>
                    <p className="text-white font-bold text-lg group-hover:text-razor-accent transition-colors">{s.role}</p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                      {s.difficulty} • {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1 mb-1">
                      <p className="text-white font-black text-2xl">{s.overallScore}</p>
                      <span className="text-slate-500 text-sm font-bold">/100</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${VERDICT_COLORS[s.hiringVerdict] || 'text-slate-400 bg-slate-800'}`}>
                      {s.hiringVerdict || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
