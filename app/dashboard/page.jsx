'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const VERDICT_COLORS = {
  'Strong Hire': 'text-emerald-400', 'Hire': 'text-blue-400',
  'Maybe': 'text-amber-400', 'No Hire': 'text-red-400',
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-white">
            AI <span className="text-purple-400">Interviewer</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">
              {session?.user?.name}
            </span>
            <Link href="/interview/setup"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              New Interview
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-400 hover:text-white text-sm transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            Welcome back, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400">Here's your interview performance overview.</p>
        </div>

        <StatsGrid sessions={sessions} />
        <PerformanceChart sessions={sessions} />

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg">Recent Sessions</h2>
            <Link href="/interview/setup"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              + New Interview
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-slate-400 mb-4">No interviews yet. Start your first one!</p>
              <Link href="/interview/setup"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Start Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div key={s._id}
                  className="flex items-center justify-between bg-slate-700/30 border border-slate-600/50 rounded-xl px-5 py-4 hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="text-white font-semibold">{s.role}</p>
                    <p className="text-slate-400 text-sm">
                      {s.difficulty} · {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{s.overallScore}<span className="text-slate-500 text-sm">/100</span></p>
                    <p className={`text-xs font-semibold ${VERDICT_COLORS[s.hiringVerdict] || 'text-slate-400'}`}>
                      {s.hiringVerdict || 'N/A'}
                    </p>
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
